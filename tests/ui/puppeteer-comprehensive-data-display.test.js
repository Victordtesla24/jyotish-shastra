/**
 * @jest-environment node
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs').promises;
const UIDataSaver = require('../../client/src/components/forms/UIDataSaver');

// Test configuration
const TEST_CONFIG = {
  appUrl: 'http://localhost:3002',
  apiUrl: 'http://localhost:3001',
  timeout: 30000,
  headless: true,
  devtools: false,
  screenshots: {
    enabled: true,
    dir: path.join(__dirname, 'test-logs', 'comprehensive-analysis-display')
  }
};

// Test birth data
const TEST_BIRTH_DATA = {
  name: 'Farhan',
  dateOfBirth: '1997-12-18',
  timeOfBirth: '02:30',
  location: 'Jammu, India',
  latitude: 32.493538,
  longitude: 74.541158,
  timezone: 'Asia/Karachi',
  gender: 'male'
};

// Helper to create screenshots directory
async function ensureScreenshotDir() {
  try {
    await fs.mkdir(TEST_CONFIG.screenshots.dir, { recursive: true });
  } catch (error) {
    console.log('Screenshot directory exists or created');
  }
}

// Helper to take screenshot with timestamp
async function takeScreenshot(page, name) {
  if (!TEST_CONFIG.screenshots.enabled) return;

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${timestamp}-${name}.png`;
  const filepath = path.join(TEST_CONFIG.screenshots.dir, filename);

  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`📸 Screenshot saved: ${filename}`);
  return filepath;
}

// Helper to check if element has content
async function hasContent(page, selector) {
  return await page.evaluate((sel) => {
    const element = document.querySelector(sel);
    return element && element.textContent.trim().length > 0;
  }, selector);
}

describe('Comprehensive Analysis Data Display Tests', () => {
  let browser;
  let page;

  beforeAll(async () => {
    await ensureScreenshotDir();
    browser = await puppeteer.launch({
      headless: TEST_CONFIG.headless,
      devtools: TEST_CONFIG.devtools,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  });

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
      const type = msg.type();
      const text = msg.text();
      if (type === 'error') {
        console.error('Browser console error:', text);
      } else if (text.includes('ComprehensiveAnalysisPage') || text.includes('UIDataSaver')) {
        console.log('Browser console:', text);
      }
    });

    // Mock the comprehensive analysis API response
    await page.setRequestInterception(true);
    page.on('request', request => {
      const url = request.url();

      if (url.includes('/api/v1/analysis/comprehensive')) {
        // Load test data
        const testDataPath = path.join(__dirname, '../test-data/analysis-comprehensive-response.json');
        const testData = require(testDataPath);

        request.respond({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(testData)
        });
      } else if (url.includes('/api/geocoding/coordinates')) {
        request.respond({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              latitude: TEST_BIRTH_DATA.latitude,
              longitude: TEST_BIRTH_DATA.longitude,
              formattedAddress: TEST_BIRTH_DATA.location,
              timezone: TEST_BIRTH_DATA.timezone
            }
          })
        });
      } else {
        request.continue();
      }
    });
  });

  afterEach(async () => {
    if (page) {
      await page.close();
    }
  });

  test('should display comprehensive analysis data from session storage', async () => {
    console.log('🧪 Testing comprehensive analysis data display from session storage...');

    // Step 1: Navigate to home and submit form
    await page.goto(TEST_CONFIG.appUrl, { waitUntil: 'networkidle2' });
    await takeScreenshot(page, 'home-page-initial');

    // Fill and submit birth data form
    await page.waitForSelector('input[name="name"]', { timeout: 10000 });
    await page.type('input[name="name"]', TEST_BIRTH_DATA.name);
    await page.type('input[name="dateOfBirth"]', TEST_BIRTH_DATA.dateOfBirth);
    await page.type('input[name="timeOfBirth"]', TEST_BIRTH_DATA.timeOfBirth);
    await page.type('input[name="location"]', TEST_BIRTH_DATA.location);

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for navigation to comprehensive analysis page
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    await takeScreenshot(page, 'comprehensive-analysis-initial');

    // Step 2: Check session storage for saved data
    const sessionData = await page.evaluate(() => {
      const sessionKey = 'vedic_chart_session';
      const data = sessionStorage.getItem(sessionKey);
      return data ? JSON.parse(data) : null;
    });

    console.log('📦 Session storage data:', {
      hasSessionData: !!sessionData,
      hasApiResponse: !!sessionData?.apiResponse,
      hasAnalysis: !!sessionData?.apiResponse?.analysis
    });

    // Step 3: Wait for analysis sections to load
    await page.waitForSelector('.analysis-section', { timeout: 15000 });
    await takeScreenshot(page, 'sections-loaded');

    // Step 4: Validate section content display
    const sections = await page.evaluate(() => {
      const sectionElements = document.querySelectorAll('.analysis-section');
      const sectionData = {};

      sectionElements.forEach((section) => {
        const sectionId = section.id?.replace('section-', '');
        const title = section.querySelector('.section-title')?.textContent;
        const content = section.querySelector('.section-content');
        const hasContent = content && content.textContent.trim().length > 0;
        const isExpanded = section.classList.contains('expanded');

        sectionData[sectionId] = {
          title,
          hasContent,
          isExpanded,
          contentLength: content ? content.textContent.trim().length : 0
        };
      });

      return sectionData;
    });

    console.log('📋 Section analysis:', sections);

    // Step 5: Expand and check each section
    const sectionIds = ['section1', 'section2', 'section3', 'section4', 'section5', 'section6', 'section7', 'section8'];
    let sectionsWithContent = 0;

    for (const sectionId of sectionIds) {
      try {
        // Click section header to expand
        const sectionSelector = `#section-${sectionId} .section-toggle`;
        await page.waitForSelector(sectionSelector, { timeout: 5000 });
        await page.click(sectionSelector);

        // Wait for content to load
        await page.waitForTimeout(1000);

        // Check if content is displayed
        const hasContent = await page.evaluate((id) => {
          const content = document.querySelector(`#section-${id} .section-content`);
          if (!content) return false;

          // Check for question-answer format
          const qaItems = content.querySelectorAll('.qa-item');
          if (qaItems.length > 0) return true;

          // Check for other content formats
          const textContent = content.textContent.trim();
          return textContent.length > 100; // Has substantial content
        }, sectionId);

        if (hasContent) {
          sectionsWithContent++;
          console.log(`✅ ${sectionId}: Content displayed`);
        } else {
          console.log(`❌ ${sectionId}: No content found`);
        }

        await takeScreenshot(page, `${sectionId}-expanded`);
      } catch (error) {
        console.error(`Error expanding ${sectionId}:`, error.message);
      }
    }

    // Step 6: Validate navigation functionality
    const navigationExists = await page.evaluate(() => {
      const nav = document.querySelector('.section-navigation');
      const navButtons = nav ? nav.querySelectorAll('.nav-button') : [];
      return {
        exists: !!nav,
        buttonCount: navButtons.length
      };
    });

    console.log('🧭 Navigation:', navigationExists);

    // Step 7: Check for specific data elements
    const dataValidation = await page.evaluate(() => {
      // Check for birth data section
      const birthDataExists = document.querySelector('.qa-item')?.textContent.includes('birth');

      // Check for lagna section
      const lagnaExists = document.querySelector('.section-content')?.textContent.includes('Lagna') ||
                         document.querySelector('.section-content')?.textContent.includes('लग्न');

      // Check for planetary positions
      const planetsExist = document.querySelector('.planet-card') ||
                          document.querySelector('.section-content')?.textContent.includes('planet');

      return {
        birthDataExists,
        lagnaExists,
        planetsExist
      };
    });

    console.log('📊 Data validation:', dataValidation);

    // Step 8: Generate test report
    const testReport = {
      timestamp: new Date().toISOString(),
      url: page.url(),
      sessionDataExists: !!sessionData,
      apiResponseStored: !!sessionData?.apiResponse?.analysis,
      totalSections: sectionIds.length,
      sectionsWithContent,
      navigationExists: navigationExists.exists,
      dataValidation,
      status: sectionsWithContent >= 6 ? 'PASS' : 'FAIL'
    };

    // Save test report
    const reportPath = path.join(TEST_CONFIG.screenshots.dir, 'test-report.json');
    await fs.writeFile(reportPath, JSON.stringify(testReport, null, 2));
    console.log('📄 Test report saved:', reportPath);

    // Assertions
    expect(sessionData).toBeTruthy();
    expect(sessionData?.apiResponse?.analysis).toBeTruthy();
    expect(sectionsWithContent).toBeGreaterThanOrEqual(6); // At least 6 of 8 sections should have content
    expect(navigationExists.exists).toBe(true);
    expect(navigationExists.buttonCount).toBe(8);
  }, TEST_CONFIG.timeout);

  test('should persist data across page navigation', async () => {
    console.log('🧪 Testing data persistence across navigation...');

    // Load test data into session storage directly
    const testData = require('../test-data/analysis-comprehensive-response.json');

    await page.goto(TEST_CONFIG.appUrl, { waitUntil: 'networkidle2' });

    // Inject test data into session storage
    await page.evaluate((data) => {
      const sessionData = {
        birthData: {
          name: 'Farhan',
          dateOfBirth: '1997-12-18',
          timeOfBirth: '02:30',
          latitude: 32.493538,
          longitude: 74.541158,
          timezone: 'Asia/Karachi'
        },
        apiResponse: {
          analysis: data.analysis,
          success: true,
          timestamp: new Date().toISOString()
        },
        sessionId: 'test-session-123',
        timestamp: new Date().toISOString()
      };

      sessionStorage.setItem('vedic_chart_session', JSON.stringify(sessionData));
    }, testData);

    // Navigate directly to comprehensive analysis page
    await page.goto(`${TEST_CONFIG.appUrl}/comprehensive-analysis`, { waitUntil: 'networkidle2' });
    await takeScreenshot(page, 'direct-navigation-with-data');

    // Check if data is loaded from session
    const dataLoaded = await page.evaluate(() => {
      const sections = document.querySelectorAll('.analysis-section');
      const loadingPlaceholders = document.querySelectorAll('.section-placeholder');
      const qaItems = document.querySelectorAll('.qa-item');

      return {
        sectionCount: sections.length,
        placeholderCount: loadingPlaceholders.length,
        qaItemCount: qaItems.length,
        hasContent: qaItems.length > 0
      };
    });

    console.log('📊 Data loaded from session:', dataLoaded);

    // Assertions
    expect(dataLoaded.sectionCount).toBe(8);
    expect(dataLoaded.hasContent).toBe(true);
    expect(dataLoaded.qaItemCount).toBeGreaterThan(0);
  }, TEST_CONFIG.timeout);
});
