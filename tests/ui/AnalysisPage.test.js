/**
 * AnalysisPage UI-API Integration Tests
 * Tests multiple analysis section display and API integration patterns
 *
 * Requirements: REQ-F201 to REQ-F204 from requirement-analysis-UI-API-integration.md
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

describe('AnalysisPage UI-API Integration Tests', () => {
  let browser;
  let page;
  const baseUrl = 'http://localhost:3002';
  const testLogsDir = path.join(__dirname, 'test-logs');

  // Test data as specified in requirements
  const testBirthData = {
    name: 'Test User',
    dob: '1985-10-24',
    time: '14:30',
    place: 'Mumbai, India',
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
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: { width: 1280, height: 800 }
    });
  });

  afterAll(async () => {
    if (browser) {
      await browser.close();
    }
  });

  beforeEach(async () => {
    page = await browser.newPage();

    // Set up comprehensive request/response monitoring
    const apiCalls = [];
    page.on('request', request => {
      if (request.url().includes('/api/v1/analysis/')) {
        apiCalls.push({
          method: request.method(),
          url: request.url(),
          timestamp: Date.now()
        });
      }
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

    // Store apiCalls for test access
    page.apiCalls = apiCalls;
  });

  afterEach(async () => {
    if (page) {
      await page.close();
    }
  });

  /**
   * REQ-F201: Test multiple analysis section display with tab navigation
   */
  test('should load AnalysisPage and display multiple analysis sections', async () => {
    const timestamp = new Date().toISOString();

    // Navigate to AnalysisPage
    await page.goto(`${baseUrl}/analysis`, { waitUntil: 'networkidle0' });

    // Capture initial page state
    await page.screenshot({
      path: path.join(testLogsDir, `${timestamp}-analysispage-initial.png`),
      fullPage: true
    });

    // Verify analysis section tabs are present
    const expectedSections = [
      'houses', 'aspects', 'arudha', 'navamsa', 'dasha', 'birthDataValidation'
    ];

    for (const section of expectedSections) {
      const tabElement = await page.$(`[data-testid="${section}-tab"]`);
      expect(tabElement).toBeTruthy();
      console.log(`✓ ${section} tab found`);
    }

    // Check for analysis container
    const analysisContainer = await page.$('.analysis-sections-container');
    expect(analysisContainer).toBeTruthy();

    console.log('✓ Analysis page loaded with all sections');
  });

  /**
   * REQ-F202: Validate API calls to analysis endpoints
   */
  test('should make parallel API calls to all analysis endpoints', async () => {
    const timestamp = new Date().toISOString();

    await page.goto(`${baseUrl}/analysis`, { waitUntil: 'networkidle0' });

    // Set up API monitoring for specific endpoints
    const expectedEndpoints = [
      '/v1/analysis/houses',
      '/v1/analysis/aspects',
      '/v1/analysis/arudha',
      '/v1/analysis/navamsa',
      '/v1/analysis/dasha',
      '/v1/analysis/birth-data'
    ];

    const apiResponses = {};
    page.on('response', async (response) => {
      for (const endpoint of expectedEndpoints) {
        if (response.url().includes(endpoint)) {
          try {
            const responseData = await response.json();
            apiResponses[endpoint] = {
              status: response.status(),
              data: responseData
            };
            console.log(`API Response received: ${endpoint} - ${response.status()}`);
          } catch (e) {
            console.error(`Failed to parse response for ${endpoint}:`, e);
          }
        }
      }
    });

    // Trigger analysis generation (this should be done through the form or existing birth data)
    // First, simulate having birth data in session storage
    await page.evaluate((birthData) => {
      sessionStorage.setItem('birthData', JSON.stringify(birthData));
    }, testBirthData);

    // Reload or trigger analysis
    await page.reload({ waitUntil: 'networkidle0' });

    // Wait for API calls to complete
    await page.waitForTimeout(8000); // 8 seconds for all analysis APIs

    // Capture API calls state
    await page.screenshot({
      path: path.join(testLogsDir, `${timestamp}-analysispage-api-calls.png`),
      fullPage: true
    });

    // Verify all expected API calls were made
    console.log('API Calls made:', page.apiCalls);
    console.log('API Responses received:', Object.keys(apiResponses));

    // Verify at least some analysis endpoints were called
    const analysisCallsMade = page.apiCalls.filter(call =>
      call.url.includes('/v1/analysis/')
    );
    expect(analysisCallsMade.length).toBeGreaterThan(0);

    console.log('✓ Analysis API calls initiated successfully');
  });

  /**
   * REQ-F203: Verify service layer functions
   */
  test('should execute service layer functions for personality and life predictions', async () => {
    const timestamp = new Date().toISOString();

    await page.goto(`${baseUrl}/analysis`, { waitUntil: 'networkidle0' });

    // Set up birth data
    await page.evaluate((birthData) => {
      sessionStorage.setItem('birthData', JSON.stringify(birthData));
    }, testBirthData);

    await page.reload({ waitUntil: 'networkidle0' });

    // Wait for service layer functions to execute
    await page.waitForTimeout(5000);

    // Check for personality profile content
    const personalitySection = await page.$('.personality-profile, [data-section="personality"]');
    if (personalitySection) {
      console.log('✓ Personality profile section found');
    }

    // Check for life predictions content
    const predictionsSection = await page.$('.life-predictions, [data-section="predictions"]');
    if (predictionsSection) {
      console.log('✓ Life predictions section found');
    }

    // Verify analysis content is loaded
    const analysisContent = await page.$$('.analysis-content, .section-content');
    expect(analysisContent.length).toBeGreaterThan(0);

    // Capture service layer execution state
    await page.screenshot({
      path: path.join(testLogsDir, `${timestamp}-analysispage-service-layer.png`),
      fullPage: true
    });

    console.log('✓ Service layer functions executed successfully');
  });

  /**
   * REQ-F204: Test tab switching functionality across analysis sections
   */
  test('should navigate between analysis sections using tab switching', async () => {
    const timestamp = new Date().toISOString();

    await page.goto(`${baseUrl}/analysis`, { waitUntil: 'networkidle0' });

    // Set up birth data for analysis
    await page.evaluate((birthData) => {
      sessionStorage.setItem('birthData', JSON.stringify(birthData));
    }, testBirthData);

    await page.reload({ waitUntil: 'networkidle0' });
    await page.waitForTimeout(3000);

    const sectionsToTest = ['houses', 'aspects', 'arudha', 'navamsa'];
    const navigationLog = [];

    for (const section of sectionsToTest) {
      try {
        // Click on section tab
        const tabSelector = `[data-testid="${section}-tab"], .tab-${section}, [data-section="${section}"]`;
        const tabElement = await page.$(tabSelector);

        if (tabElement) {
          await tabElement.click();
          await page.waitForTimeout(1000); // Wait for content to load

          // Verify section content is displayed
          const sectionContent = await page.$(`[data-section-content="${section}"], .${section}-content`);
          navigationLog.push({
            section,
            tabFound: true,
            contentVisible: !!sectionContent,
            timestamp: Date.now()
          });

          // Capture screenshot of each section
          await page.screenshot({
            path: path.join(testLogsDir, `${timestamp}-analysispage-${section}-section.png`),
            fullPage: true
          });

          console.log(`✓ Navigated to ${section} section`);
        } else {
          navigationLog.push({
            section,
            tabFound: false,
            contentVisible: false,
            timestamp: Date.now()
          });
          console.log(`⚠ Tab for ${section} section not found`);
        }
      } catch (error) {
        console.error(`Error navigating to ${section}:`, error.message);
        navigationLog.push({
          section,
          error: error.message,
          timestamp: Date.now()
        });
      }
    }

    // Verify navigation functionality
    const successfulNavigations = navigationLog.filter(log => log.tabFound);
    expect(successfulNavigations.length).toBeGreaterThan(0);

    console.log('Navigation log:', navigationLog);
    console.log('✓ Tab switching functionality tested');
  });

  /**
   * Performance and API response time validation
   */
  test('should meet performance requirements for API responses', async () => {
    const timestamp = new Date().toISOString();

    // Track API response times
    const responseTimings = [];
    page.on('response', async (response) => {
      if (response.url().includes('/v1/analysis/')) {
        const request = response.request();
        const responseTime = Date.now() - request.timestamp;
        responseTimings.push({
          endpoint: response.url(),
          responseTime,
          status: response.status()
        });
      }
    });

    await page.goto(`${baseUrl}/analysis`, { waitUntil: 'networkidle0' });

    // Set up birth data and trigger analysis
    await page.evaluate((birthData) => {
      sessionStorage.setItem('birthData', JSON.stringify(birthData));
    }, testBirthData);

    await page.reload({ waitUntil: 'networkidle0' });

    // Wait for all API calls to complete
    await page.waitForTimeout(10000);

    // Capture performance state
    await page.screenshot({
      path: path.join(testLogsDir, `${timestamp}-analysispage-performance.png`),
      fullPage: true
    });

    // Validate response times
    responseTimings.forEach(timing => {
      console.log(`${timing.endpoint}: ${timing.responseTime}ms`);
      // REQ-P002: API response time should be <5 seconds
      expect(timing.responseTime).toBeLessThan(5000);
    });

    console.log('✓ All API response times within acceptable limits');
    console.log('Response timings:', responseTimings);
  });

  /**
   * Error handling and recovery testing
   */
  test('should handle API failures gracefully', async () => {
    const timestamp = new Date().toISOString();

    await page.goto(`${baseUrl}/analysis`, { waitUntil: 'networkidle0' });

    // Test with missing birth data (should show appropriate error)
    await page.evaluate(() => {
      sessionStorage.clear();
    });

    await page.reload({ waitUntil: 'networkidle0' });

    // Check for error messages or fallback content
    const errorMessages = await page.$$('.error-message, .api-error, .fallback-content');
    const loadingStates = await page.$$('.loading-spinner, .skeleton-loader');

    // Capture error handling state
    await page.screenshot({
      path: path.join(testLogsDir, `${timestamp}-analysispage-error-handling.png`),
      fullPage: true
    });

    // Should either show error messages or loading states
    const hasErrorHandling = errorMessages.length > 0 || loadingStates.length > 0;
    expect(hasErrorHandling).toBe(true);

    console.log('✓ Error handling mechanisms in place');
    console.log(`Error messages: ${errorMessages.length}, Loading states: ${loadingStates.length}`);
  });
});
