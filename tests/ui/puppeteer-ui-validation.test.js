/**
 * @jest-environment node
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Test configuration
const FRONTEND_URL = 'http://localhost:3002';
const SCREENSHOT_DIR = path.join(__dirname, 'test-logs');

// Test data
const TEST_BIRTH_DATA = {
  name: 'Test User',
  dateOfBirth: '1985-10-24',
  timeOfBirth: '14:30',
  location: 'Mumbai, India',
  gender: 'male'
};

// Ensure screenshot directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

describe('Puppeteer UI Validation', () => {
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
  });

  afterEach(async () => {
    if (page) {
      await page.close();
    }
  });

  test('Chart page should render correctly with test data', async () => {
    // Navigate to chart page
    await page.goto(`${FRONTEND_URL}/chart`, { waitUntil: 'networkidle2' });

    // Take initial screenshot
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'chart-page-initial.png'),
      fullPage: true
    });

    // Check if form exists
    const formExists = await page.evaluate(() => {
      return !!document.querySelector('.form-vedic, form[role="form"]');
    });
    expect(formExists).toBe(true);

    // Fill in the form
    await page.type('input[name="name"]', TEST_BIRTH_DATA.name);
    await page.type('input[name="dateOfBirth"]', TEST_BIRTH_DATA.dateOfBirth);
    await page.type('input[name="timeOfBirth"]', TEST_BIRTH_DATA.timeOfBirth);
    await page.type('input[name="placeOfBirth"]', TEST_BIRTH_DATA.location);
    await page.select('select[name="gender"]', TEST_BIRTH_DATA.gender);

    // Wait for geocoding
    await page.waitForSelector('.coordinates-display', {
      visible: true,
      timeout: 10000
    });

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for chart to render
    await page.waitForSelector('svg', {
      visible: true,
      timeout: 15000
    });

    // Take screenshot of rendered chart
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'chart-rendered.png'),
      fullPage: true
    });

    // Validate chart elements
    const chartValidation = await page.evaluate(() => {
      const svg = document.querySelector('svg');
      const texts = Array.from(document.querySelectorAll('svg text'));

      // Extract rasi numbers
      const rasiNumbers = texts
        .filter(t => /^[1-9]$|^1[0-2]$/.test(t.textContent.trim()))
        .map(t => parseInt(t.textContent.trim()));

      // Extract planets
      const planets = texts
        .filter(t => /^(Su|Mo|Ma|Me|Ju|Ve|Sa|Ra|Ke|As)/.test(t.textContent.trim()))
        .map(t => t.textContent.trim());

      return {
        hasSvg: !!svg,
        rasiCount: rasiNumbers.length,
        rasiNumbers: rasiNumbers.sort((a, b) => a - b),
        planetCount: planets.length,
        planets: planets
      };
    });

    // Assertions
    expect(chartValidation.hasSvg).toBe(true);
    expect(chartValidation.rasiCount).toBe(12);
    expect(chartValidation.rasiNumbers).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    expect(chartValidation.planetCount).toBeGreaterThan(0);

    console.log('Chart validation results:', chartValidation);
  }, 30000);

  test('Data persistence across pages', async () => {
    // First generate chart data
    await page.goto(`${FRONTEND_URL}/chart`, { waitUntil: 'networkidle2' });

    // Fill and submit form
    await page.type('input[name="name"]', TEST_BIRTH_DATA.name);
    await page.type('input[name="dateOfBirth"]', TEST_BIRTH_DATA.dateOfBirth);
    await page.type('input[name="timeOfBirth"]', TEST_BIRTH_DATA.timeOfBirth);
    await page.type('input[name="placeOfBirth"]', TEST_BIRTH_DATA.location);
    await page.select('select[name="gender"]', TEST_BIRTH_DATA.gender);

    await page.waitForSelector('.coordinates-display', { visible: true });
    await page.click('button[type="submit"]');
    await page.waitForSelector('svg', { visible: true });

    // Check localStorage data
    const savedData = await page.evaluate(() => {
      return {
        birthData: localStorage.getItem('jyotish_birth_data'),
        chartData: localStorage.getItem('jyotish_chart_data')
      };
    });

    expect(savedData.birthData).toBeTruthy();
    expect(savedData.chartData).toBeTruthy();

    // Navigate to analysis page
    await page.goto(`${FRONTEND_URL}/analysis`, { waitUntil: 'networkidle2' });

    // Check if chart is displayed from saved data
    const hasChartOnAnalysisPage = await page.evaluate(() => {
      const svg = document.querySelector('svg');
      return svg && svg.querySelectorAll('text').length > 0;
    });

    expect(hasChartOnAnalysisPage).toBe(true);

    // Take screenshot
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'analysis-page-with-chart.png'),
      fullPage: true
    });
  }, 45000);
});
