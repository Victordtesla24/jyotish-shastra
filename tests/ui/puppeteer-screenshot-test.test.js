/**
 * @jest-environment node
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Test configuration
const FRONTEND_URL = 'http://localhost:3002';
const BACKEND_URL = 'http://localhost:3001';
const SCREENSHOT_DIR = path.join(__dirname, 'test-logs');

// Test data matching chart-generate-response.json
const TEST_BIRTH_DATA = {
  name: 'Test User',
  dateOfBirth: '1985-10-24',
  timeOfBirth: '14:30',
  location: 'Mumbai, India',
  gender: 'male'
};

// Expected coordinates for Mumbai
const EXPECTED_COORDINATES = {
  latitude: 19.0760,
  longitude: 72.8777
};

// Utility function to create timestamp
function getTimestamp() {
  return new Date().toISOString().replace(/:/g, '-').replace(/\./g, '-');
}

// Utility function to ensure directory exists
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Utility function to take screenshot with timestamp
async function takeScreenshot(page, name) {
  const timestamp = getTimestamp();
  const filename = `${timestamp}-${name}.png`;
  const filepath = path.join(SCREENSHOT_DIR, filename);
  await page.screenshot({
    path: filepath,
    fullPage: true
  });
  console.log(`📸 Screenshot saved: ${filename}`);
  return filepath;
}

// Main test suite
describe('Puppeteer UI-API Integration Tests', () => {
  let browser;
  let page;

  beforeAll(async () => {
    // Ensure screenshot directory exists
    ensureDirectoryExists(SCREENSHOT_DIR);

    // Launch browser
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

    // Set up console log monitoring
    page.on('console', msg => {
      console.log(`Browser console [${msg.type()}]:`, msg.text());
    });

    // Set up error monitoring
    page.on('pageerror', error => {
      console.error('Page error:', error.message);
    });

    // Set up request interception to monitor API calls
    await page.setRequestInterception(true);
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        console.log(`🌐 API Request: ${request.method()} ${request.url()}`);
      }
      request.continue();
    });

    page.on('response', response => {
      if (response.url().includes('/api/')) {
        console.log(`✅ API Response: ${response.status()} ${response.url()}`);
      }
    });
  });

  afterEach(async () => {
    if (page) {
      await page.close();
    }
  });

  test('1. Chart Page - Birth Data Form Submission and Chart Generation', async () => {
    console.log('\n🧪 Test 1: Chart Page - Birth Data Form Submission');

    // Navigate to chart page
    await page.goto(`${FRONTEND_URL}/chart`, { waitUntil: 'networkidle2' });
    await takeScreenshot(page, 'chart-page-initial');

    // Wait for form to be visible
    await page.waitForSelector('.birth-data-form', { visible: true });

    // Fill in birth data form
    console.log('📝 Filling birth data form...');
    await page.type('input[name="name"]', TEST_BIRTH_DATA.name);
    await page.type('input[name="dateOfBirth"]', TEST_BIRTH_DATA.dateOfBirth);
    await page.type('input[name="timeOfBirth"]', TEST_BIRTH_DATA.timeOfBirth);
    await page.type('input[name="birthPlace"]', TEST_BIRTH_DATA.location);

    // Select gender
    await page.select('select[name="gender"]', TEST_BIRTH_DATA.gender);

    await takeScreenshot(page, 'chart-page-form-filled');

    // Wait for geocoding to complete
    console.log('🌍 Waiting for geocoding...');
    await page.waitForSelector('.coordinates-display', { visible: true, timeout: 10000 });

    // Verify coordinates were geocoded
    const coordinates = await page.evaluate(() => {
      const latInput = document.querySelector('input[name="latitude"]');
      const lngInput = document.querySelector('input[name="longitude"]');
      return {
        latitude: parseFloat(latInput?.value),
        longitude: parseFloat(lngInput?.value)
      };
    });

    console.log('📍 Geocoded coordinates:', coordinates);
    expect(coordinates.latitude).toBeCloseTo(EXPECTED_COORDINATES.latitude, 1);
    expect(coordinates.longitude).toBeCloseTo(EXPECTED_COORDINATES.longitude, 1);

    // Submit form
    console.log('🚀 Submitting form...');
    await page.click('button[type="submit"]');

    // Wait for chart to render
    await page.waitForSelector('svg', { visible: true, timeout: 15000 });
    await takeScreenshot(page, 'chart-page-chart-rendered');

    // Validate chart elements
    console.log('🔍 Validating chart elements...');

    // Check if rasi numbers are present (1-12)
    const rasiNumbers = await page.evaluate(() => {
      const texts = Array.from(document.querySelectorAll('svg text'));
      const numbers = texts
        .filter(text => /^[1-9]$|^1[0-2]$/.test(text.textContent.trim()))
        .map(text => parseInt(text.textContent.trim()));
      return numbers.sort((a, b) => a - b);
    });

    console.log('🔢 Rasi numbers found:', rasiNumbers);
    expect(rasiNumbers).toHaveLength(12);
    expect(rasiNumbers).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);

    // Check if planets are displayed
    const planetCodes = await page.evaluate(() => {
      const texts = Array.from(document.querySelectorAll('svg text'));
      const planetRegex = /^(Su|Mo|Ma|Me|Ju|Ve|Sa|Ra|Ke|As)/;
      return texts
        .filter(text => planetRegex.test(text.textContent.trim()))
        .map(text => text.textContent.trim());
    });

    console.log('🪐 Planets found:', planetCodes);
    expect(planetCodes.length).toBeGreaterThan(0);

    // Verify ascendant display
    const ascendantInfo = await page.evaluate(() => {
      const ascText = Array.from(document.querySelectorAll('p'))
        .find(p => p.textContent.includes('Lagna:'));
      return ascText?.textContent || null;
    });

    console.log('📐 Ascendant info:', ascendantInfo);
    expect(ascendantInfo).toBeTruthy();

    // Check session storage via UIDataSaver
    const sessionData = await page.evaluate(() => {
      return {
        birthData: localStorage.getItem('jyotish_birth_data'),
        chartData: localStorage.getItem('jyotish_chart_data')
      };
    });

    console.log('💾 Session data saved:', {
      hasBirthData: !!sessionData.birthData,
      hasChartData: !!sessionData.chartData
    });

    expect(sessionData.birthData).toBeTruthy();
    expect(sessionData.chartData).toBeTruthy();
  }, 30000);

  test('2. Analysis Page - Chart Display and Analysis Sections', async () => {
    console.log('\n🧪 Test 2: Analysis Page - Chart Display and Analysis Sections');

    // First generate a chart
    await generateChartData(page);

    // Navigate to analysis page
    await page.goto(`${FRONTEND_URL}/analysis`, { waitUntil: 'networkidle2' });
    await takeScreenshot(page, 'analysis-page-initial');

    // Wait for chart to render
    await page.waitForSelector('svg', { visible: true, timeout: 10000 });

    // Check if chart is displayed with saved data
    const hasChart = await page.evaluate(() => {
      const svg = document.querySelector('svg');
      return svg && svg.querySelectorAll('text').length > 0;
    });

    expect(hasChart).toBe(true);
    console.log('✅ Chart displayed on analysis page from session data');

    // Check for analysis tabs
    const analysisTabs = await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('[role="tab"], .tab, button'))
        .filter(el => {
          const text = el.textContent.toLowerCase();
          return text.includes('personality') ||
                 text.includes('life') ||
                 text.includes('houses') ||
                 text.includes('aspects') ||
                 text.includes('dasha');
        });
      return tabs.map(tab => tab.textContent.trim());
    });

    console.log('📑 Analysis tabs found:', analysisTabs);
    expect(analysisTabs.length).toBeGreaterThan(0);

    await takeScreenshot(page, 'analysis-page-with-tabs');

    // Test tab navigation
    if (analysisTabs.length > 0) {
      const firstTab = await page.$('[role="tab"], .tab, button');
      if (firstTab) {
        await firstTab.click();
        await new Promise(resolve => setTimeout(resolve, 1000));
        await takeScreenshot(page, 'analysis-page-tab-content');
      }
    }
  }, 30000);

  test('3. Comprehensive Analysis Page - Full Analysis Display', async () => {
    console.log('\n🧪 Test 3: Comprehensive Analysis Page - Full Analysis Display');

    // First generate a chart
    await generateChartData(page);

    // Navigate to comprehensive analysis page
    await page.goto(`${FRONTEND_URL}/comprehensive-analysis`, { waitUntil: 'networkidle2' });
    await takeScreenshot(page, 'comprehensive-analysis-initial');

    // Wait for analysis sections to load
    await page.waitForSelector('.analysis-section, .section, [class*="analysis"]', {
      visible: true,
      timeout: 15000
    });

    // Check for 8 required sections
    const sections = await page.evaluate(() => {
      const sectionElements = Array.from(
        document.querySelectorAll('.analysis-section, .section, [class*="section"]')
      );
      return sectionElements.map(section => {
        const title = section.querySelector('h2, h3, .section-title');
        return title?.textContent.trim() || '';
      }).filter(title => title);
    });

    console.log('📊 Analysis sections found:', sections);
    expect(sections.length).toBeGreaterThanOrEqual(8);

    // Check for strength meters
    const strengthMeters = await page.evaluate(() => {
      return document.querySelectorAll('meter, progress, [role="progressbar"]').length;
    });

    console.log('📈 Strength meters found:', strengthMeters);
    expect(strengthMeters).toBeGreaterThan(0);

    // Verify chart is displayed
    const hasChart = await page.evaluate(() => {
      const svg = document.querySelector('svg');
      return svg && svg.querySelectorAll('text').length > 0;
    });

    expect(hasChart).toBe(true);
    console.log('✅ Chart displayed on comprehensive analysis page');

    await takeScreenshot(page, 'comprehensive-analysis-complete');

    // Test section navigation
    const navButtons = await page.$$('button[class*="nav"], [class*="navigation"] button');
    if (navButtons.length > 0) {
      await navButtons[0].click();
      await new Promise(resolve => setTimeout(resolve, 1000));
      await takeScreenshot(page, 'comprehensive-analysis-navigation');
    }
  }, 30000);

  test('4. Cross-Page Data Persistence - UIDataSaver Validation', async () => {
    console.log('\n🧪 Test 4: Cross-Page Data Persistence - UIDataSaver Validation');

    // Generate chart data
    await generateChartData(page);

    // Get session data after chart generation
    const initialData = await page.evaluate(() => {
      return {
        birthData: JSON.parse(localStorage.getItem('jyotish_birth_data') || '{}'),
        chartData: JSON.parse(localStorage.getItem('jyotish_chart_data') || '{}'),
        analysisData: JSON.parse(localStorage.getItem('jyotish_analysis_data') || '{}')
      };
    });

    console.log('💾 Initial session data:', {
      hasBirthData: !!initialData.birthData.name,
      hasChartData: !!initialData.chartData.rasiChart,
      hasAnalysisData: Object.keys(initialData.analysisData).length > 0
    });

    // Navigate between pages and verify data persistence
    const pages = ['/chart', '/analysis', '/comprehensive-analysis'];

    for (const pagePath of pages) {
      console.log(`📍 Navigating to ${pagePath}...`);
      await page.goto(`${FRONTEND_URL}${pagePath}`, { waitUntil: 'networkidle2' });

      // Verify data is still available
      const currentData = await page.evaluate(() => {
        return {
          birthData: JSON.parse(localStorage.getItem('jyotish_birth_data') || '{}'),
          chartData: JSON.parse(localStorage.getItem('jyotish_chart_data') || '{}'),
          analysisData: JSON.parse(localStorage.getItem('jyotish_analysis_data') || '{}')
        };
      });

      expect(currentData.birthData.name).toBe(initialData.birthData.name);
      expect(currentData.chartData.rasiChart).toBeTruthy();

      // Check if chart renders from saved data
      if (pagePath !== '/chart') {
        await page.waitForSelector('svg', { visible: true, timeout: 10000 });
        const hasChart = await page.evaluate(() => {
          const svg = document.querySelector('svg');
          return svg && svg.querySelectorAll('text').length > 0;
        });
        expect(hasChart).toBe(true);
      }

      await takeScreenshot(page, `persistence-test${pagePath.replace('/', '-')}`);
    }

    console.log('✅ Data persisted correctly across all pages');
  }, 45000);

  test('5. Error Detection and Validation', async () => {
    console.log('\n🧪 Test 5: Error Detection and Validation');

    // Navigate to chart page
    await page.goto(`${FRONTEND_URL}/chart`, { waitUntil: 'networkidle2' });

    // Test form validation errors
    console.log('🔍 Testing form validation...');

    // Try to submit empty form
    await page.click('button[type="submit"]');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check for validation errors
    const validationErrors = await page.evaluate(() => {
      const errors = Array.from(document.querySelectorAll('.error-message, .field-error, [class*="error"]'));
      return errors.map(el => el.textContent.trim()).filter(text => text);
    });

    console.log('⚠️ Validation errors:', validationErrors);
    expect(validationErrors.length).toBeGreaterThan(0);
    await takeScreenshot(page, 'validation-errors');

    // Test with invalid data
    await page.type('input[name="name"]', 'Test');
    await page.type('input[name="dateOfBirth"]', '2050-01-01'); // Future date
    await page.type('input[name="timeOfBirth"]', '25:00'); // Invalid time

    await page.click('button[type="submit"]');
    await new Promise(resolve => setTimeout(resolve, 1000));

    const invalidDataErrors = await page.evaluate(() => {
      const errors = Array.from(document.querySelectorAll('.error-message, .field-error, [class*="error"]'));
      return errors.map(el => el.textContent.trim()).filter(text => text);
    });

    console.log('⚠️ Invalid data errors:', invalidDataErrors);
    await takeScreenshot(page, 'invalid-data-errors');

    // Check console for JavaScript errors
    const jsErrors = [];
    page.on('pageerror', error => {
      jsErrors.push(error.message);
    });

    // Navigate to a page without data
    await page.goto(`${FRONTEND_URL}/analysis`, { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('🔴 JavaScript errors:', jsErrors);
    await takeScreenshot(page, 'no-data-page');
  }, 30000);

  // Helper function to generate chart data
  async function generateChartData(page) {
    console.log('🔄 Generating chart data...');

    await page.goto(`${FRONTEND_URL}/chart`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('.birth-data-form', { visible: true });

    // Fill form
    await page.type('input[name="name"]', TEST_BIRTH_DATA.name);
    await page.type('input[name="dateOfBirth"]', TEST_BIRTH_DATA.dateOfBirth);
    await page.type('input[name="timeOfBirth"]', TEST_BIRTH_DATA.timeOfBirth);
    await page.type('input[name="birthPlace"]', TEST_BIRTH_DATA.location);
    await page.select('select[name="gender"]', TEST_BIRTH_DATA.gender);

    // Wait for geocoding
    await page.waitForSelector('.coordinates-display', { visible: true, timeout: 10000 });

    // Submit
    await page.click('button[type="submit"]');
    await page.waitForSelector('svg', { visible: true, timeout: 15000 });

    console.log('✅ Chart data generated successfully');
  }
});

// Run tests
if (require.main === module) {
  console.log('🚀 Starting Puppeteer UI-API Integration Tests...');
  console.log(`Frontend URL: ${FRONTEND_URL}`);
  console.log(`Backend URL: ${BACKEND_URL}`);
  console.log(`Screenshot Directory: ${SCREENSHOT_DIR}`);
  console.log('⚠️ Make sure both frontend and backend servers are running!');
}
