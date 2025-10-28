/**
 * @jest-environment node
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs').promises;

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3000',
  apiUrl: 'http://localhost:3001',
  timeout: 30000,
  headless: true,
  slowMo: 100,
  screenshotDir: path.join(__dirname, 'test-logs'),
  testData: {
    name: 'Test User',
    date: '1997-12-18',
    time: '02:30',
    location: 'Jammu, India',
    latitude: '32.7266',
    longitude: '74.8570',
    timezone: 'Asia/Karachi'
  }
};

describe('Session Data Flow Validation', () => {
  let browser;
  let page;

  // Ensure screenshot directory exists
  beforeAll(async () => {
    await fs.mkdir(TEST_CONFIG.screenshotDir, { recursive: true });
  });

  beforeEach(async () => {
    browser = await puppeteer.launch({
      headless: TEST_CONFIG.headless,
      slowMo: TEST_CONFIG.slowMo,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    page = await browser.newPage();

    // Set viewport
    await page.setViewport({ width: 1366, height: 768 });

    // Set up console logging
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('Browser console error:', msg.text());
      } else if (msg.text().includes('UIDataSaver') || msg.text().includes('AnalysisPage') || msg.text().includes('ComprehensiveAnalysisPage')) {
        console.log('Browser console:', msg.text());
      }
    });
  });

  afterEach(async () => {
    if (browser) {
      await browser.close();
    }
  });

  test('Should persist session data across pages', async () => {
    try {
      // Step 1: Navigate to home page
      console.log('Step 1: Navigating to home page...');
      await page.goto(TEST_CONFIG.baseUrl, { waitUntil: 'networkidle2' });
      await page.screenshot({ path: path.join(TEST_CONFIG.screenshotDir, '01-home-page.png') });

      // Step 2: Fill birth data form
      console.log('Step 2: Filling birth data form...');
      await page.type('input[name="name"]', TEST_CONFIG.testData.name);
      await page.type('input[name="dateOfBirth"]', TEST_CONFIG.testData.date);
      await page.type('input[name="timeOfBirth"]', TEST_CONFIG.testData.time);
      await page.type('input[name="location"]', TEST_CONFIG.testData.location);

      // Wait for geocoding to populate coordinates
      await page.waitForTimeout(2000);

      // Set coordinates manually if needed
      await page.evaluate((data) => {
        const latInput = document.querySelector('input[name="latitude"]');
        const lonInput = document.querySelector('input[name="longitude"]');
        const tzInput = document.querySelector('select[name="timezone"]');

        if (latInput) latInput.value = data.latitude;
        if (lonInput) lonInput.value = data.longitude;
        if (tzInput) {
          const option = Array.from(tzInput.options).find(opt => opt.value === data.timezone);
          if (option) tzInput.value = data.timezone;
        }
      }, TEST_CONFIG.testData);

      await page.screenshot({ path: path.join(TEST_CONFIG.screenshotDir, '02-form-filled.png') });

      // Step 3: Submit form and wait for chart generation
      console.log('Step 3: Submitting form...');
      await page.click('button[type="submit"]');

      // Wait for navigation to chart page
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
      await page.waitForTimeout(3000);
      await page.screenshot({ path: path.join(TEST_CONFIG.screenshotDir, '03-chart-page.png') });

      // Step 4: Check session storage for saved data
      console.log('Step 4: Checking session storage...');
      const sessionData = await page.evaluate(() => {
        const currentSession = sessionStorage.getItem('current_session');
        return currentSession ? JSON.parse(currentSession) : null;
      });

      console.log('Session data found:', {
        hasBirthData: !!sessionData?.birthData,
        hasApiResponse: !!sessionData?.apiResponse,
        hasChart: !!sessionData?.apiResponse?.chart,
        hasAnalysis: !!sessionData?.apiResponse?.analysis
      });

      expect(sessionData).toBeTruthy();
      expect(sessionData.birthData).toBeTruthy();
      expect(sessionData.apiResponse).toBeTruthy();

      // Step 5: Navigate to Analysis page
      console.log('Step 5: Navigating to Analysis page...');
      await page.goto(`${TEST_CONFIG.baseUrl}/analysis`, { waitUntil: 'networkidle2' });
      await page.waitForTimeout(3000);
      await page.screenshot({ path: path.join(TEST_CONFIG.screenshotDir, '04-analysis-page.png') });

      // Check if analysis data is displayed
      const analysisContent = await page.evaluate(() => {
        const sections = document.querySelectorAll('[class*="analysis-section"], [class*="tab-content"]');
        return {
          sectionsCount: sections.length,
          hasContent: Array.from(sections).some(section => section.textContent.trim().length > 0),
          errorMessages: Array.from(document.querySelectorAll('[class*="error"]')).map(el => el.textContent)
        };
      });

      console.log('Analysis page content:', analysisContent);

      // Step 6: Navigate to Comprehensive Analysis page
      console.log('Step 6: Navigating to Comprehensive Analysis page...');
      await page.goto(`${TEST_CONFIG.baseUrl}/comprehensive-analysis`, { waitUntil: 'networkidle2' });
      await page.waitForTimeout(3000);
      await page.screenshot({ path: path.join(TEST_CONFIG.screenshotDir, '05-comprehensive-analysis-page.png') });

      // Check if comprehensive analysis data is displayed
      const comprehensiveContent = await page.evaluate(() => {
        const sections = document.querySelectorAll('[class*="section-content"], [class*="qa-item"]');
        const navigation = document.querySelector('[class*="section-navigation"]');
        return {
          sectionsCount: sections.length,
          hasNavigation: !!navigation,
          hasContent: Array.from(sections).some(section => section.textContent.trim().length > 0),
          sectionTitles: Array.from(document.querySelectorAll('[class*="nav-title"]')).map(el => el.textContent)
        };
      });

      console.log('Comprehensive analysis page content:', comprehensiveContent);

      // Step 7: Refresh page and check if data persists
      console.log('Step 7: Refreshing page to test persistence...');
      await page.reload({ waitUntil: 'networkidle2' });
      await page.waitForTimeout(2000);
      await page.screenshot({ path: path.join(TEST_CONFIG.screenshotDir, '06-after-refresh.png') });

      const afterRefreshContent = await page.evaluate(() => {
        const sections = document.querySelectorAll('[class*="section-content"], [class*="qa-item"]');
        return {
          sectionsCount: sections.length,
          hasContent: Array.from(sections).some(section => section.textContent.trim().length > 0)
        };
      });

      console.log('After refresh content:', afterRefreshContent);

      // Assertions
      expect(analysisContent.sectionsCount).toBeGreaterThan(0);
      expect(comprehensiveContent.sectionsCount).toBeGreaterThan(0);
      expect(comprehensiveContent.hasNavigation).toBe(true);
      expect(comprehensiveContent.sectionTitles.length).toBeGreaterThanOrEqual(8);

    } catch (error) {
      console.error('Test failed:', error);
      await page.screenshot({ path: path.join(TEST_CONFIG.screenshotDir, 'error-state.png') });
      throw error;
    }
  });

  test('Should display API response data correctly', async () => {
    try {
      // Load test data from files
      const analysisTestData = require('../test-data/analysis-comprehensive-response.json');

      // Mock session storage with test data
      await page.goto(TEST_CONFIG.baseUrl, { waitUntil: 'networkidle2' });

      await page.evaluate((testData) => {
        const sessionData = {
          birthData: {
            name: 'Test User',
            dateOfBirth: '1997-12-18',
            timeOfBirth: '02:30',
            latitude: 32.493538,
            longitude: 74.541158,
            timezone: 'Asia/Karachi'
          },
          apiResponse: {
            analysis: testData,
            success: true,
            timestamp: new Date().toISOString()
          },
          timestamp: new Date().toISOString(),
          sessionId: 'test-session'
        };

        sessionStorage.setItem('current_session', JSON.stringify(sessionData));
      }, analysisTestData);

      // Navigate to comprehensive analysis page
      await page.goto(`${TEST_CONFIG.baseUrl}/comprehensive-analysis`, { waitUntil: 'networkidle2' });
      await page.waitForTimeout(3000);
      await page.screenshot({ path: path.join(TEST_CONFIG.screenshotDir, '07-test-data-display.png') });

      // Verify sections are displayed
      const sectionsDisplayed = await page.evaluate(() => {
        const sections = {};
        for (let i = 1; i <= 8; i++) {
          const sectionContent = document.querySelector(`[class*="section${i}"]`);
          sections[`section${i}`] = {
            exists: !!sectionContent,
            hasContent: sectionContent ? sectionContent.textContent.trim().length > 0 : false
          };
        }
        return sections;
      });

      console.log('Sections displayed:', sectionsDisplayed);

      // Verify at least some sections have content
      const sectionsWithContent = Object.values(sectionsDisplayed).filter(s => s.hasContent).length;
      expect(sectionsWithContent).toBeGreaterThan(0);

    } catch (error) {
      console.error('Test failed:', error);
      await page.screenshot({ path: path.join(TEST_CONFIG.screenshotDir, 'test-data-error.png') });
      throw error;
    }
  });
});
