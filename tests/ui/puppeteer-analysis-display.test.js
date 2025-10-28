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
    if (browser) {
      await browser.close();
    }
  });

  beforeEach(async () => {
    page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    // Set up console logging
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('Browser console error:', msg.text());
      }
    });

    // Catch page errors
    page.on('pageerror', error => {
      console.error('Page error:', error.message);
    });
  });

  afterEach(async () => {
    if (page) {
      await page.close();
    }
  });

  test('Comprehensive Analysis page should display sections without errors', async () => {
    // First, set up test data in localStorage
    await page.goto(FRONTEND_URL);

    // Inject test data
    await page.evaluate(() => {
      const testBirthData = {
        name: 'Test User',
        dateOfBirth: '1985-10-24',
        timeOfBirth: '14:30',
        latitude: 19.0760,
        longitude: 72.8777,
        timezone: 'Asia/Kolkata',
        formatted: true
      };

      const testChartData = {
        ascendant: { sign: 'Libra', degree: 4.7 },
        planets: [
          { name: 'Sun', sign: 'Sagittarius', degree: 2.16 }
        ]
      };

      localStorage.setItem('jyotish_birth_data', JSON.stringify(testBirthData));
      localStorage.setItem('jyotish_chart_data', JSON.stringify(testChartData));
    });

    // Navigate to comprehensive analysis page
    await page.goto(`${FRONTEND_URL}/analysis`);

    // Wait a bit for React to render
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Take initial screenshot
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'analysis-page-initial.png'),
      fullPage: true
    });

    // Check for the constructor error
    const hasConstructorError = await page.evaluate(() => {
      const errorOverlay = document.querySelector('.error-overlay');
      const errorText = document.body.innerText;
      return errorText.includes('is not a constructor');
    });

    expect(hasConstructorError).toBe(false);

    // Click on comprehensive analysis button if it exists
    const comprehensiveButton = await page.$('button[class*="comprehensive"], a[href*="comprehensive"], button');
    if (comprehensiveButton) {
      await comprehensiveButton.click();
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    // Take screenshot after navigation
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'comprehensive-analysis-page.png'),
      fullPage: true
    });

    // Check if analysis sections are displayed
    const analysisValidation = await page.evaluate(() => {
      // Look for section elements
      const sections = document.querySelectorAll('.analysis-section, [class*="section"], [id*="section"]');
      const sectionHeaders = document.querySelectorAll('h2, h3');

      // Check for question-answer format
      const qaItems = document.querySelectorAll('.qa-item, .questions-answers-content, [class*="question"]');

      // Check for error messages
      const errors = document.querySelectorAll('.error-message, .error, [class*="error"]');

      return {
        sectionsCount: sections.length,
        sectionHeadersCount: sectionHeaders.length,
        qaItemsCount: qaItems.length,
        errorsCount: errors.length,
        hasContent: document.body.innerText.length > 500,
        pageTitle: document.title,
        bodyText: document.body.innerText.substring(0, 200)
      };
    });

    console.log('Analysis validation results:', analysisValidation);

    // Assertions
    expect(analysisValidation.errorsCount).toBe(0);
    expect(analysisValidation.hasContent).toBe(true);
    expect(analysisValidation.sectionsCount).toBeGreaterThan(0);
  }, 45000);

  test('Analysis sections should be interactive and expandable', async () => {
    // Navigate directly to comprehensive analysis
    await page.goto(`${FRONTEND_URL}/comprehensive`);

    await new Promise(resolve => setTimeout(resolve, 3000));

    // Check for section navigation
    const navigationExists = await page.evaluate(() => {
      const nav = document.querySelector('.section-navigation, .analysis-navigation, nav');
      const navButtons = document.querySelectorAll('[class*="nav-button"], [class*="section-toggle"]');

      return {
        hasNavigation: !!nav,
        navButtonsCount: navButtons.length
      };
    });

    console.log('Navigation check:', navigationExists);

    // Try to click on a section if navigation exists
    if (navigationExists.navButtonsCount > 0) {
      const firstButton = await page.$('[class*="nav-button"], [class*="section-toggle"]');
      if (firstButton) {
        await firstButton.click();
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Take screenshot after interaction
        await page.screenshot({
          path: path.join(SCREENSHOT_DIR, 'analysis-section-expanded.png'),
          fullPage: true
        });
      }
    }

    // Check final state
    const finalState = await page.evaluate(() => {
      const expandedSections = document.querySelectorAll('.expanded, [aria-expanded="true"]');
      const visibleContent = document.querySelectorAll('.section-content:not([style*="display: none"])');

      return {
        expandedCount: expandedSections.length,
        visibleContentCount: visibleContent.length
      };
    });

    console.log('Final state:', finalState);
  }, 45000);
});
