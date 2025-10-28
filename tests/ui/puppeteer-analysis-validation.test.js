/**
 * @jest-environment node
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Test configuration
const FRONTEND_URL = 'http://localhost:3002';
const SCREENSHOT_DIR = path.join(__dirname, 'test-logs');

// Ensure screenshot directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

describe('Analysis Display Validation', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }, 30000);

  afterAll(async () => {
    if (browser) await browser.close();
  });

  beforeEach(async () => {
    page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    // Listen for console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    page.consoleErrors = consoleErrors;

    // Listen for page errors
    const pageErrors = [];
    page.on('pageerror', error => {
      pageErrors.push(error.message);
    });
    page.pageErrors = pageErrors;
  });

  afterEach(async () => {
    if (page) await page.close();
  });

  test('should navigate to analysis page without constructor errors', async () => {
    console.log('📊 Testing Analysis Page Navigation');

    // Navigate to home page first
    await page.goto(FRONTEND_URL, { waitUntil: 'networkidle2' });

    // Fill birth data form
    await page.waitForSelector('input[name="name"]', { timeout: 10000 });
    await page.type('input[name="name"]', 'Test User');
    await page.type('input[name="dateOfBirth"]', '1990-01-01');
    await page.type('input[name="timeOfBirth"]', '12:00');

    // Fill location
    await page.type('input[name="placeOfBirth"]', 'New Delhi, India');

    // Wait for geocoding
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Select gender
    const genderSelect = await page.$('select[name="gender"]');
    if (genderSelect) {
      await page.select('select[name="gender"]', 'male');
    }

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for chart generation
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Screenshot chart page
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'chart-page-before-analysis.png'),
      fullPage: true
    });

    // Navigate to Analysis page
    console.log('🔄 Navigating to Analysis page...');

    // Look for Analysis navigation button
    const analysisButton = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const analysisBtn = buttons.find(btn => btn.textContent.includes('Analysis') && !btn.textContent.includes('Comprehensive'));
      if (analysisBtn) {
        analysisBtn.click();
        return true;
      }
      return false;
    });

    if (!analysisButton) {
      // Try navigation by URL if button not found
      await page.goto(`${FRONTEND_URL}/analysis`, { waitUntil: 'networkidle2' });
    }

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Screenshot analysis page
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'analysis-page-display.png'),
      fullPage: true
    });

    // Check for constructor errors
    const constructorErrors = page.consoleErrors.filter(error =>
      error.includes('is not a constructor') ||
      error.includes('ResponseDataToUIDisplayAnalyser')
    );

    console.log('Console errors:', page.consoleErrors);
    console.log('Page errors:', page.pageErrors);

    // Assert no constructor errors
    expect(constructorErrors).toHaveLength(0);
    expect(page.pageErrors).toHaveLength(0);

    // Check if analysis content is displayed
    const analysisContent = await page.evaluate(() => {
      // Look for analysis sections
      const sections = document.querySelectorAll('.analysis-section, .section-header, [id*="section"]');
      const headers = document.querySelectorAll('h2, h3, h4');

      return {
        sectionCount: sections.length,
        headerCount: headers.length,
        hasContent: document.body.textContent.length > 500,
        visibleText: document.body.innerText.substring(0, 200)
      };
    });

    console.log('Analysis content:', analysisContent);

    // Verify content exists
    expect(analysisContent.hasContent).toBe(true);
    expect(analysisContent.sectionCount).toBeGreaterThan(0);
  });

  test('should navigate to comprehensive analysis without errors', async () => {
    console.log('📊 Testing Comprehensive Analysis Page');

        // Navigate directly with saved session data
    await page.goto(`${FRONTEND_URL}/comprehensive`, { waitUntil: 'networkidle2' });

    await new Promise(resolve => setTimeout(resolve, 3000));

    // Screenshot comprehensive analysis page
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'comprehensive-analysis-display.png'),
      fullPage: true
    });

    // Check for constructor errors
    const constructorErrors = page.consoleErrors.filter(error =>
      error.includes('is not a constructor') ||
      error.includes('ResponseDataToUIDisplayAnalyser')
    );

    console.log('Comprehensive page console errors:', page.consoleErrors);

    // Assert no constructor errors
    expect(constructorErrors).toHaveLength(0);

    // Check if sections are displayed
    const comprehensiveContent = await page.evaluate(() => {
      // Look for comprehensive analysis elements
      const sections = document.querySelectorAll('[class*="section"], [id*="section"]');
      const tabs = document.querySelectorAll('[role="tab"], .tab-button, button[class*="nav"]');
      const hasErrorMessage = document.body.textContent.includes('Error') ||
                             document.body.textContent.includes('error');

      // Check for question-answer format
      const qaItems = document.querySelectorAll('.qa-item, .question-answer, [class*="question"]');

      return {
        sectionCount: sections.length,
        tabCount: tabs.length,
        qaCount: qaItems.length,
        hasErrorMessage,
        pageTitle: document.title,
        hasContent: document.body.textContent.length > 500
      };
    });

    console.log('Comprehensive analysis content:', comprehensiveContent);

    // Verify content
    expect(comprehensiveContent.hasContent).toBe(true);
    expect(comprehensiveContent.hasErrorMessage).toBe(false);
  });

  test('should display actual API data in analysis sections', async () => {
    console.log('📊 Testing API Data Display');

        // Navigate to analysis page
    await page.goto(`${FRONTEND_URL}/analysis`, { waitUntil: 'networkidle2' });

    await new Promise(resolve => setTimeout(resolve, 3000));

    // Check for specific analysis content
    const apiDataPresent = await page.evaluate(() => {
      const bodyText = document.body.innerText;

      return {
        hasLagnaContent: bodyText.includes('Lagna') || bodyText.includes('Ascendant'),
        hasPlanetaryContent: bodyText.includes('Sun') || bodyText.includes('Moon') ||
                            bodyText.includes('Mars') || bodyText.includes('Planet'),
        hasHouseContent: bodyText.includes('House') || bodyText.includes('Bhava'),
        hasDashaContent: bodyText.includes('Dasha') || bodyText.includes('Period'),
        hasAspectContent: bodyText.includes('Aspect') || bodyText.includes('Drishti'),
        contentLength: bodyText.length
      };
    });

    console.log('API data presence:', apiDataPresent);

    // Take detailed screenshot
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'analysis-api-data-display.png'),
      fullPage: true
    });

    // Verify API data is displayed
    expect(apiDataPresent.contentLength).toBeGreaterThan(1000);
    expect(
      apiDataPresent.hasLagnaContent ||
      apiDataPresent.hasPlanetaryContent ||
      apiDataPresent.hasHouseContent
    ).toBe(true);
  });
});
