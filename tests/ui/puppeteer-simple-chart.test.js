/**
 * @jest-environment node
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Test configuration
const FRONTEND_URL = 'http://localhost:3000';
const SCREENSHOT_DIR = path.join(__dirname, 'test-logs');

// Ensure screenshot directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

describe('Simple Chart Test', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
  }, 30000);

  afterAll(async () => {
    if (page) await page.close();
    if (browser) await browser.close();
  });

  test('Should display chart with direct coordinate input', async () => {
    try {
      // Navigate to chart page
      await page.goto(`${FRONTEND_URL}/chart`, { waitUntil: 'networkidle2' });
      console.log('✓ Navigated to chart page');

      // Take initial screenshot
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, 'initial-load.png'),
        fullPage: true
      });

      // Wait for form to load
      await page.waitForSelector('input[name="name"]', { visible: true });
      console.log('✓ Form loaded');

      // Fill in the form with direct coordinates
      await page.type('input[name="name"]', 'Test User');
      await page.type('input[name="dateOfBirth"]', '1985-10-24');
      await page.type('input[name="timeOfBirth"]', '14:30');

      // Type location to trigger UI updates
      await page.type('input[name="placeOfBirth"]', 'Mumbai, India');

      // Directly fill in coordinates to bypass geocoding
      await page.evaluate(() => {
        const latInput = document.querySelector('input[name="latitude"]');
        const lngInput = document.querySelector('input[name="longitude"]');
        const tzSelect = document.querySelector('select[name="timezone"]');

        if (latInput) {
          latInput.value = '19.0760';
          latInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
        if (lngInput) {
          lngInput.value = '72.8777';
          lngInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
        if (tzSelect) {
          tzSelect.value = 'Asia/Kolkata';
          tzSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });

      await page.select('select[name="gender"]', 'male');

      console.log('✓ Form filled with coordinates');

      // Take screenshot after filling form
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, 'form-filled.png'),
        fullPage: true
      });

      // Submit form
      await page.click('button[type="submit"]');
      console.log('✓ Form submitted');

      // Wait for chart to render
      await page.waitForSelector('svg', {
        visible: true,
        timeout: 15000
      });
      console.log('✓ Chart rendered');

      // Take screenshot of rendered chart
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, 'chart-rendered.png'),
        fullPage: true
      });

      // Validate chart elements
      const chartData = await page.evaluate(() => {
        const svg = document.querySelector('svg');
        const texts = Array.from(document.querySelectorAll('svg text'));

        // Get rasi numbers
        const rasiNumbers = texts
          .filter(t => /^[1-9]$|^1[0-2]$/.test(t.textContent.trim()))
          .map(t => ({
            number: parseInt(t.textContent.trim()),
            x: parseFloat(t.getAttribute('x')),
            y: parseFloat(t.getAttribute('y'))
          }));

        // Get planets
        const planets = texts
          .filter(t => /^(Su|Mo|Ma|Me|Ju|Ve|Sa|Ra|Ke|As)/.test(t.textContent.trim()))
          .map(t => t.textContent.trim());

        // Get chart title/header info
        const headerText = document.querySelector('h2')?.textContent || '';
        const ascendantText = Array.from(document.querySelectorAll('p'))
          .find(p => p.textContent.includes('Lagna:'))?.textContent || '';

        return {
          hasSvg: !!svg,
          svgSize: svg ? {
            width: svg.getAttribute('width'),
            height: svg.getAttribute('height')
          } : null,
          rasiCount: rasiNumbers.length,
          rasiNumbers: rasiNumbers,
          planetCount: planets.length,
          planets: planets,
          headerText: headerText,
          ascendantText: ascendantText
        };
      });

      console.log('\n📊 Chart Validation Results:');
      console.log('✓ SVG present:', chartData.hasSvg);
      console.log('✓ SVG size:', chartData.svgSize);
      console.log('✓ Rasi count:', chartData.rasiCount);
      console.log('✓ Rasi numbers:', chartData.rasiNumbers.map(r => r.number).join(', '));
      console.log('✓ Planet count:', chartData.planetCount);
      console.log('✓ Planets found:', chartData.planets.join(', '));
      console.log('✓ Header:', chartData.headerText);
      console.log('✓ Ascendant:', chartData.ascendantText);

      // Save detailed results
      fs.writeFileSync(
        path.join(SCREENSHOT_DIR, 'chart-data.json'),
        JSON.stringify(chartData, null, 2)
      );

      // Assertions
      expect(chartData.hasSvg).toBe(true);
      expect(chartData.rasiCount).toBe(12);
      expect(chartData.planetCount).toBeGreaterThan(0);

    } catch (error) {
      // Take error screenshot
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, 'error-state.png'),
        fullPage: true
      });
      throw error;
    }
  }, 30000);
});
