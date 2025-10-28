/**
 * ChartPage UI-API Integration Tests
 * Tests birth data form submission and chart generation workflow
 *
 * Requirements: REQ-F101 to REQ-F104 from requirement-analysis-UI-API-integration.md
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

describe('ChartPage UI-API Integration Tests', () => {
  let browser;
  let page;
  const baseUrl = 'http://localhost:3000';
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

    // Navigate to ChartPage
    await page.goto(`${baseUrl}/chart`, { waitUntil: 'networkidle0' });

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

    await page.goto(`${baseUrl}/chart`, { waitUntil: 'networkidle0' });

    // Fill out birth data form
    await page.type('[data-testid="name-input"]', testBirthData.name);
    await page.type('[data-testid="dob-input"]', testBirthData.dob);
    await page.type('[data-testid="time-input"]', testBirthData.time);
    await page.type('[data-testid="place-input"]', testBirthData.place);
    await page.select('[data-testid="gender-select"]', testBirthData.gender);

    // Capture form filled state
    await page.screenshot({
      path: path.join(testLogsDir, `${timestamp}-chartpage-form-filled.png`),
      fullPage: true
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

    // Submit form
    await page.click('[data-testid="generate-chart-button"]');

    // Wait for API call and chart generation
    await page.waitForTimeout(10000); // 10 seconds for chart generation

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

    await page.goto(`${baseUrl}/chart`, { waitUntil: 'networkidle0' });

    // Fill and submit form (reusing previous logic)
    await page.type('[data-testid="name-input"]', testBirthData.name);
    await page.type('[data-testid="dob-input"]', testBirthData.dob);
    await page.type('[data-testid="time-input"]', testBirthData.time);
    await page.type('[data-testid="place-input"]', testBirthData.place);
    await page.select('[data-testid="gender-select"]', testBirthData.gender);

    await page.click('[data-testid="generate-chart-button"]');

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

    await page.goto(`${baseUrl}/chart`, { waitUntil: 'networkidle0' });

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
    await page.goto(`${baseUrl}/chart`, { waitUntil: 'networkidle0' });

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
    await page.goto(`${baseUrl}/chart`, { waitUntil: 'networkidle0' });
    const loadTime = Date.now() - startTime;

    // REQ-P001: Page load time should be <3 seconds
    expect(loadTime).toBeLessThan(3000);

    console.log(`✓ Page load time: ${loadTime}ms (requirement: <3000ms)`);
    console.log('✓ Error handling verified');
  });
});
