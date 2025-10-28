/**
 * @jest-environment node
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs').promises;

// Test configuration
const TEST_CONFIG = {
  appUrl: 'http://localhost:3000',
  apiUrl: 'http://localhost:3001',
  timeout: 30000,
  headless: true,
  devtools: false,
  screenshots: {
    enabled: true,
    dir: path.join(__dirname, 'test-logs', 'analysis-page-display')
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

describe('Analysis Page Data Display Tests', () => {
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
      } else if (text.includes('AnalysisPage') || text.includes('UIDataSaver')) {
        console.log('Browser console:', text);
      }
    });

    // Mock API responses
    await page.setRequestInterception(true);
    page.on('request', request => {
      const url = request.url();

      if (url.includes('/api/v1/analysis/houses')) {
        const testData = require('../test-data/analysis-house-response.json');
        request.respond({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(testData)
        });
      } else if (url.includes('/api/v1/analysis/aspects')) {
        const testData = require('../test-data/analysis-aspects-response.json');
        request.respond({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(testData)
        });
      } else if (url.includes('/api/v1/analysis/arudha')) {
        const testData = require('../test-data/analysis-arudha-response.json');
        request.respond({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(testData)
        });
      } else if (url.includes('/api/v1/analysis/navamsa')) {
        const testData = require('../test-data/analysis-navamsa-response.json');
        request.respond({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(testData)
        });
      } else if (url.includes('/api/v1/analysis/dasha')) {
        const testData = require('../test-data/analysis-dasha-response.json');
        request.respond({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(testData)
        });
      } else if (url.includes('/api/v1/analysis/birthdata')) {
        const testData = require('../test-data/analysis-birth-data-response.json');
        request.respond({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(testData)
        });
      } else if (url.includes('/api/v1/chart/generate')) {
        const testData = require('../test-data/chart-generate-response.json');
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

  test('should display analysis data from saved chart data in session storage', async () => {
    console.log('🧪 Testing analysis page data display from session storage...');

    // Step 1: Inject chart data directly into session storage
    await page.goto(TEST_CONFIG.appUrl, { waitUntil: 'networkidle2' });

    const chartData = require('../test-data/chart-generate-response.json');

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
          chart: data.data.rasiChart,
          navamsa: data.data.navamsaChart,
          success: true,
          timestamp: new Date().toISOString()
        },
        sessionId: 'test-analysis-session',
        timestamp: new Date().toISOString()
      };

      sessionStorage.setItem('vedic_chart_session', JSON.stringify(sessionData));
    }, chartData);

    // Step 2: Navigate directly to analysis page
    await page.goto(`${TEST_CONFIG.appUrl}/analysis`, { waitUntil: 'networkidle2' });
    await takeScreenshot(page, 'analysis-page-initial');

    // Step 3: Wait for tabs to appear
    await page.waitForSelector('.tab-navigation', { timeout: 15000 });
    await takeScreenshot(page, 'tabs-loaded');

    // Step 4: Check if tabs are rendered correctly
    const tabInfo = await page.evaluate(() => {
      const tabs = document.querySelectorAll('.tab-button');
      const tabData = [];

      tabs.forEach(tab => {
        tabData.push({
          text: tab.textContent.trim(),
          isActive: tab.classList.contains('active'),
          isDisabled: tab.disabled
        });
      });

      return {
        tabCount: tabs.length,
        tabs: tabData
      };
    });

    console.log('📑 Tab analysis:', tabInfo);

    // Step 5: Check each analysis section
    const sections = ['houses', 'aspects', 'arudha', 'navamsa', 'dasha', 'birthDataValidation'];
    let sectionsWithContent = 0;

    for (const section of sections) {
      try {
        // Click on the tab
        const tabSelector = `.tab-button[data-section="${section}"]`;

        const tabExists = await page.evaluate((selector) => {
          return !!document.querySelector(selector);
        }, tabSelector);

        if (!tabExists) {
          console.log(`⚠️  No tab found for ${section}, trying alternative selector`);
          continue;
        }

        await page.click(tabSelector);
        await page.waitForTimeout(1000);

        // Check if content is displayed
        const hasContent = await page.evaluate(() => {
          const content = document.querySelector('.analysis-content');
          if (!content) return false;

          // Check for various content indicators
          const hasText = content.textContent.trim().length > 50;
          const hasHouseCards = content.querySelectorAll('.house-card').length > 0;
          const hasAspectItems = content.querySelectorAll('.aspect-item').length > 0;
          const hasSectionContent = content.querySelector('.section-content') !== null;

          return hasText || hasHouseCards || hasAspectItems || hasSectionContent;
        });

        if (hasContent) {
          sectionsWithContent++;
          console.log(`✅ ${section}: Content displayed`);
        } else {
          console.log(`❌ ${section}: No content found`);
        }

        await takeScreenshot(page, `${section}-content`);
      } catch (error) {
        console.error(`Error checking ${section}:`, error.message);
      }
    }

    // Step 6: Check session storage state
    const sessionState = await page.evaluate(() => {
      const sessionKey = 'vedic_chart_session';
      const data = sessionStorage.getItem(sessionKey);
      const parsed = data ? JSON.parse(data) : null;

      return {
        exists: !!data,
        hasBirthData: !!parsed?.birthData,
        hasApiResponse: !!parsed?.apiResponse,
        hasChart: !!parsed?.apiResponse?.chart,
        hasNavamsa: !!parsed?.apiResponse?.navamsa,
        hasAnalysis: !!parsed?.apiResponse?.analysis
      };
    });

    console.log('💾 Session storage state:', sessionState);

    // Step 7: Check for error messages
    const errorCheck = await page.evaluate(() => {
      const errorElements = document.querySelectorAll('.error-message, .error-state');
      const loadingElements = document.querySelectorAll('.loading-skeleton, .skeleton');

      return {
        hasErrors: errorElements.length > 0,
        errorCount: errorElements.length,
        hasLoadingState: loadingElements.length > 0,
        loadingCount: loadingElements.length
      };
    });

    console.log('🚨 Error check:', errorCheck);

    // Step 8: Generate test report
    const testReport = {
      timestamp: new Date().toISOString(),
      url: page.url(),
      sessionState,
      tabInfo,
      sectionsChecked: sections.length,
      sectionsWithContent,
      errorCheck,
      status: sectionsWithContent > 0 && !errorCheck.hasErrors ? 'PASS' : 'FAIL'
    };

    // Save test report
    const reportPath = path.join(TEST_CONFIG.screenshots.dir, 'test-report.json');
    await fs.writeFile(reportPath, JSON.stringify(testReport, null, 2));
    console.log('📄 Test report saved:', reportPath);

    // Assertions
    expect(sessionState.exists).toBe(true);
    expect(sessionState.hasChart).toBe(true);
    expect(tabInfo.tabCount).toBeGreaterThanOrEqual(5);
    expect(sectionsWithContent).toBeGreaterThan(0);
    expect(errorCheck.hasErrors).toBe(false);
  }, TEST_CONFIG.timeout);

  test('should handle fresh API calls when no saved data exists', async () => {
    console.log('🧪 Testing analysis page with fresh API calls...');

    // Step 1: Clear session storage and navigate
    await page.goto(TEST_CONFIG.appUrl, { waitUntil: 'networkidle2' });

    await page.evaluate(() => {
      sessionStorage.clear();
      localStorage.clear();
    });

    // Step 2: Navigate to home and submit form
    await page.goto(TEST_CONFIG.appUrl, { waitUntil: 'networkidle2' });

    // Fill and submit birth data form
    await page.waitForSelector('input[name="name"]', { timeout: 10000 });
    await page.type('input[name="name"]', TEST_BIRTH_DATA.name);
    await page.type('input[name="dateOfBirth"]', TEST_BIRTH_DATA.dateOfBirth);
    await page.type('input[name="timeOfBirth"]', TEST_BIRTH_DATA.timeOfBirth);
    await page.type('input[name="location"]', TEST_BIRTH_DATA.location);

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for navigation to chart page
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    // Navigate to analysis page
    await page.click('button:has-text("Analysis"), a:has-text("Analysis")');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    await takeScreenshot(page, 'analysis-from-chart');

    // Step 3: Verify API calls were made
    const apiCallLog = await page.evaluate(() => {
      return window.apiCallLog || [];
    });

    console.log('📡 API calls made:', apiCallLog.length);

    // Step 4: Check if content is loaded
    await page.waitForSelector('.analysis-content', { timeout: 15000 });

    const contentLoaded = await page.evaluate(() => {
      const content = document.querySelector('.analysis-content');
      const tabs = document.querySelectorAll('.tab-button');

      return {
        hasContent: content && content.textContent.trim().length > 0,
        tabCount: tabs.length,
        activeTab: document.querySelector('.tab-button.active')?.textContent
      };
    });

    console.log('📊 Content loaded:', contentLoaded);

    // Assertions
    expect(contentLoaded.hasContent).toBe(true);
    expect(contentLoaded.tabCount).toBeGreaterThanOrEqual(5);
    expect(contentLoaded.activeTab).toBeTruthy();
  }, TEST_CONFIG.timeout);
});
