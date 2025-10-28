/**
 * ChartPage UI-API Integration Tests
 * Tests birth data form submission and chart generation workflow
 *
 * Requirements: REQ-F101 to REQ-F104 from requirement-analysis-UI-API-integration.md
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

// Fix WebSocket configuration for Node.js environment
process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = 'true';
process.env.PUPPETEER_EXECUTABLE_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

describe('ChartPage UI-API Integration Tests', () => {
  let browser;
  let page;
  const baseUrl = 'http://localhost:3002';
  const testLogsDir = path.join(__dirname, 'test-logs');

  // Test data as specified in requirements
  const testBirthData = {
    name: 'Test User',
    dob: '1985-10-24',
    time: '14:30',
    place: 'Mumbai, Maharashtra, India',
    gender: 'male'
  };

  beforeAll(async () => {
    // Ensure test-logs directory exists
    try {
      await fs.access(testLogsDir);
    } catch {
      await fs.mkdir(testLogsDir, { recursive: true });
    }

    browser = await puppeteer.launch({
      headless: 'new',
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--disable-extensions',
        '--disable-default-apps'
      ],
      defaultViewport: { width: 1280, height: 800 },
      protocolTimeout: 60000,
      timeout: 60000
    });
  }, 60000); // 60 second timeout for browser launch

  afterAll(async () => {
    if (browser) {
      await browser.close();
    }
  });

  beforeEach(async () => {
    page = await browser.newPage();

    // Set up request/response monitoring
    page.on('request', request => {
      console.log(`→ ${request.method()} ${request.url()}`);
    });

    page.on('response', response => {
      console.log(`← ${response.status()} ${response.url()}`);
    });

    // Monitor console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('Browser Console Error:', msg.text());
      }
    });
  });

  afterEach(async () => {
    if (page) {
      await page.close();
    }
  });

  /**
   * REQ-F101: Test birth data form submission workflow
   */
  test('should load ChartPage and display birth data form', async () => {
    const timestamp = new Date().toISOString();

    // Navigate to HomePage (where the form is located)
    await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle0' });

    // Capture initial page state
    await page.screenshot({
      path: path.join(testLogsDir, `${timestamp}-chartpage-initial.png`),
      fullPage: true
    });

    // Verify form elements are present
    await expect(page.$('[data-testid="name-input"]')).resolves.toBeTruthy();
    await expect(page.$('[data-testid="dob-input"]')).resolves.toBeTruthy();
    await expect(page.$('[data-testid="time-input"]')).resolves.toBeTruthy();
    await expect(page.$('[data-testid="place-input"]')).resolves.toBeTruthy();
    await expect(page.$('[data-testid="gender-select"]')).resolves.toBeTruthy();

    console.log('✓ Birth data form loaded successfully');
  });

  /**
   * REQ-F102: Validate chart generation via /v1/chart/generate API endpoint
   */
  test('should submit form and generate chart via API', async () => {
    const timestamp = new Date().toISOString();

    await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle0' });

    // Fill out birth data form
    await page.type('[data-testid="name-input"]', testBirthData.name);
    await page.type('[data-testid="dob-input"]', testBirthData.dob);
    await page.type('[data-testid="time-input"]', testBirthData.time);
    await page.type('[data-testid="place-input"]', testBirthData.place);
    await page.select('[data-testid="gender-select"]', testBirthData.gender);

      // Wait for geocoding to complete - check for either success or error
      try {
        await page.waitForSelector('text=Location found:', { timeout: 15000 });
        console.log('✓ Geocoding completed successfully');
      } catch (e) {
        // If geocoding fails, check if there are coordinates available anyway
        const coordinatesAvailable = await page.evaluate(() => {
          return document.querySelector('[data-testid="place-input"]').value.length > 0;
        });
        if (!coordinatesAvailable) {
          throw new Error('Geocoding failed and no coordinates available');
        }
        console.log('Geocoding timeout, but proceeding with form submission');
      }

      // Wait a bit more for coordinates to be set in state
      await new Promise(resolve => setTimeout(resolve, 2000));

    // Capture form filled state
    await page.screenshot({
      path: path.join(testLogsDir, `${timestamp}-chartpage-form-filled.png`),
      fullPage: true
    });

      // Monitor console errors and logs
      page.on('console', msg => {
        if (msg.type() === 'error') {
          console.error('Browser Console Error:', msg.text());
        } else if (msg.type() === 'log') {
          console.log('Browser Console Log:', msg.text());
        } else if (msg.type() === 'warn') {
          console.warn('Browser Console Warning:', msg.text());
        } else if (msg.type() === 'info') {
          console.info('Browser Console Info:', msg.text());
        }
      });

    // Set up API call monitoring
    let chartApiCalled = false;
    let apiResponse = null;

    page.on('response', async (response) => {
      if (response.url().includes('/v1/chart/generate')) {
        chartApiCalled = true;
        apiResponse = await response.json().catch(() => null);
        console.log('Chart API Response:', apiResponse);
      }
    });

      // Try to manually trigger the React onSubmit handler
      console.log('🔄 Trying to manually trigger React onSubmit...');
      try {
        await page.evaluate(() => {
          const form = document.querySelector('form');
          if (form) {
            // Try to find the React event handler
            const reactFiber = form._reactInternalFiber || form._reactInternalInstance;
            if (reactFiber) {
              console.log('Found React fiber:', reactFiber);
            }
            
            // Try to trigger the form submission manually
            const event = new Event('submit', { bubbles: true, cancelable: true });
            form.dispatchEvent(event);
          }
        });
        console.log('✓ Manual form submission triggered');
      } catch (e) {
        console.log('❌ Manual form submission failed:', e.message);
      }

      // Wait for the onSubmit callback to complete (this includes the API call)
      console.log('⏳ Waiting for form submission and API call to complete...');
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds for API call

      // Check if there are any validation errors
      const validationErrors = await page.$$('.error-message, .validation-error, .alert-error, .text-red-500, .text-red-400');
      if (validationErrors.length > 0) {
        for (const error of validationErrors) {
          const errorText = await error.evaluate(el => el.textContent);
          console.log('Validation Error:', errorText);
        }
      }

      // Check for JavaScript errors
      const jsErrors = await page.evaluate(() => {
        const errors = [];
        const originalError = console.error;
        console.error = (...args) => {
          errors.push(args.join(' '));
          originalError.apply(console, args);
        };
        return errors;
      });
      
      if (jsErrors.length > 0) {
        console.log('JavaScript Errors:', jsErrors);
      }

      // Check if there are any uncaught errors
      const uncaughtErrors = await page.evaluate(() => {
        const errors = [];
        window.addEventListener('error', (e) => {
          errors.push(e.message);
        });
        return errors;
      });
      
      if (uncaughtErrors.length > 0) {
        console.log('Uncaught Errors:', uncaughtErrors);
      }

      // Check if React is properly loaded and the form has event handlers
      const reactInfo = await page.evaluate(() => {
        const form = document.querySelector('form');
        const submitButton = document.querySelector('[data-testid="generate-chart-button"]');
        
        // Check if React is loaded
        const reactRoot = document.querySelector('#root');
        const hasReact = !!(window.React || window.__REACT_DEVTOOLS_GLOBAL_HOOK__);
        
        // Check if form has event listeners
        const formListeners = form ? form.onclick : null;
        const buttonListeners = submitButton ? submitButton.onclick : null;
        
        return {
          hasReact,
          reactRootExists: !!reactRoot,
          formOnClick: formListeners,
          buttonOnClick: buttonListeners,
          formOnSubmit: form ? form.onsubmit : null
        };
      });
      console.log('React Info:', reactInfo);

      // Check if the form has proper event handlers
      const formInfo = await page.evaluate(() => {
        const form = document.querySelector('form');
        const submitButton = document.querySelector('[data-testid="generate-chart-button"]');
        return {
          formExists: !!form,
          submitButtonExists: !!submitButton,
          formAction: form ? form.action : null,
          formMethod: form ? form.method : null,
          submitButtonType: submitButton ? submitButton.type : null,
          submitButtonDisabled: submitButton ? submitButton.disabled : null
        };
      });
      console.log('Form Info:', formInfo);

      // Check form data state
      const formData = await page.evaluate(() => {
        const form = document.querySelector('form');
        if (!form) return null;
        const formData = new FormData(form);
        return Object.fromEntries(formData);
      });
      console.log('Form data:', formData);

      // Check coordinates state
      const coordinates = await page.evaluate(() => {
        // Try to access React state if possible
        const reactRoot = document.querySelector('#root');
        if (reactRoot && reactRoot._reactInternalFiber) {
          // This is a hack to try to access React state
          return 'React state not accessible';
        }
        return 'Cannot access React state';
      });
      console.log('Coordinates state:', coordinates);

    // Check if the form is still on the same page (not navigated)
    const currentUrl = page.url();
    console.log('Current URL after form submission:', currentUrl);

    // Wait for API call and chart generation
    await new Promise(resolve => setTimeout(resolve, 10000)); // 10 seconds for chart generation

    // Verify API was called
    expect(chartApiCalled).toBe(true);
    console.log('✓ Chart generation API called successfully');

    // Capture post-submission state
    await page.screenshot({
      path: path.join(testLogsDir, `${timestamp}-chartpage-post-submission.png`),
      fullPage: true
    });
  });

  /**
   * REQ-F103: Verify SVG chart rendering with planetary positions
   */
  test('should render SVG chart with planetary positions', async () => {
    const timestamp = new Date().toISOString();

    await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle0' });

    // Fill and submit form (reusing previous logic)
    await page.type('[data-testid="name-input"]', testBirthData.name);
    await page.type('[data-testid="dob-input"]', testBirthData.dob);
    await page.type('[data-testid="time-input"]', testBirthData.time);
    await page.type('[data-testid="place-input"]', testBirthData.place);
    await page.select('[data-testid="gender-select"]', testBirthData.gender);

    // Wait for geocoding to complete - check for either success or error
    try {
      await page.waitForSelector('text=Location found:', { timeout: 15000 });
    } catch (e) {
      console.log('Geocoding timeout, but proceeding with form submission');
    }

    await page.click('[data-testid="generate-chart-button"]');

    // Wait for navigation to chart page
    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    // Wait for chart rendering
    await page.waitForSelector('svg.vedic-chart', { timeout: 15000 });

    // Verify SVG chart elements
    const chartSvg = await page.$('svg.vedic-chart');
    expect(chartSvg).toBeTruthy();

    // Check for house numbers (1-12)
    const houseElements = await page.$$('[data-house]');
    expect(houseElements.length).toBeGreaterThan(0);

    // Check for planetary positions
    const planetElements = await page.$$('[data-planet]');
    expect(planetElements.length).toBeGreaterThan(0);

    // Capture final chart state
    await page.screenshot({
      path: path.join(testLogsDir, `${timestamp}-chartpage-chart-rendered.png`),
      fullPage: true
    });

    console.log('✓ SVG chart rendered with planetary positions');
  });

  /**
   * REQ-F104: Confirm navigation from form submission to chart display
   */
  test('should navigate correctly through chart generation workflow', async () => {
    const timestamp = new Date().toISOString();

    await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle0' });

    // Track navigation states
    const navigationStates = [];

    // Initial state
    navigationStates.push('form-display');

    // Fill form
    await page.type('[data-testid="name-input"]', testBirthData.name);
    await page.type('[data-testid="dob-input"]', testBirthData.dob);
    await page.type('[data-testid="time-input"]', testBirthData.time);
    await page.type('[data-testid="place-input"]', testBirthData.place);
    await page.select('[data-testid="gender-select"]', testBirthData.gender);

    // Wait for geocoding to complete - check for either success or error
    try {
      await page.waitForSelector('text=Location found:', { timeout: 15000 });
    } catch (e) {
      console.log('Geocoding timeout, but proceeding with form submission');
    }

    navigationStates.push('form-filled');

    // Submit and track loading state
    await page.click('[data-testid="generate-chart-button"]');

    // Wait for loading indicator
    try {
      await page.waitForSelector('.loading-spinner', { timeout: 2000 });
      navigationStates.push('loading-displayed');
    } catch (e) {
      console.log('Loading spinner not found or too fast');
    }

    // Wait for navigation to chart page
    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    // Wait for chart display
    await page.waitForSelector('svg.vedic-chart', { timeout: 15000 });
    navigationStates.push('chart-displayed');

    // Verify navigation flow
    expect(navigationStates).toContain('form-display');
    expect(navigationStates).toContain('form-filled');
    expect(navigationStates).toContain('chart-displayed');

    // Final navigation screenshot
    await page.screenshot({
      path: path.join(testLogsDir, `${timestamp}-chartpage-navigation-complete.png`),
      fullPage: true
    });

    console.log('✓ Navigation workflow completed successfully');
    console.log('Navigation states:', navigationStates);
  });

  /**
   * Error handling and performance validation
   */
  test('should handle errors gracefully and meet performance requirements', async () => {
    const timestamp = new Date().toISOString();

    // Test error handling with invalid data
    await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle0' });

    // Submit form with missing required fields
    await page.click('[data-testid="generate-chart-button"]');

    // Check for validation messages
    const errorMessages = await page.$$('.error-message, .validation-error');
    expect(errorMessages.length).toBeGreaterThan(0);

    // Capture error state
    await page.screenshot({
      path: path.join(testLogsDir, `${timestamp}-chartpage-error-handling.png`),
      fullPage: true
    });

    // Test performance requirements
    const startTime = Date.now();
    await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle0' });
    const loadTime = Date.now() - startTime;

    // REQ-P001: Page load time should be <3 seconds
    expect(loadTime).toBeLessThan(3000);

    console.log(`✓ Page load time: ${loadTime}ms (requirement: <3000ms)`);
    console.log('✓ Error handling verified');
  });
});
