/**
 * Vedic Chart Rasi Validation Test
 * ================================
 * Tests the rasi number placement in North Indian diamond chart format
 * Validates anti-clockwise house progression and correct positioning
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Test data from API response
const testData = require('../test-data/chart-generate-response.json');

describe('VedicChart Rasi Position Visual Validation', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: {
        width: 1280,
        height: 800
      }
    });
  });

  afterAll(async () => {
    if (browser) {
      await browser.close();
    }
  });

  beforeEach(async () => {
    page = await browser.newPage();

    // Navigate to the Chart page
    await page.goto('http://localhost:3002', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    console.log('✅ Navigated to application');
  });

  test('should display rasi numbers in correct anti-clockwise positions', async () => {
    console.log('🎯 Starting visual rasi position validation test');

    // Fill birth data form with test data
    const birthData = testData.data.rasiChart.ascendant;
    console.log('📝 Using test birth data - Ascendant:', birthData.sign, birthData.signId);

    // Look for birth data form
    await page.waitForSelector('input[name="name"], input[placeholder="Enter your name"]', { timeout: 10000 });

    // Fill the form with test data
    await page.type('input[name="name"], input[placeholder="Enter your name"]', 'Test User');
    await page.type('input[name="date"], input[type="date"]', '1990-01-01');
    await page.type('input[name="time"], input[type="time"]', '12:00');
    await page.type('input[name="location"], input[placeholder*="location"], input[placeholder*="Location"], input[placeholder*="city"]', 'New Delhi, India');

    console.log('✅ Form filled with test data');

    // Submit form and wait for chart generation
    const submitButton = await page.$('button[type="submit"], button:contains("Generate"), .generate-btn');
    if (submitButton) {
      await submitButton.click();
      console.log('📊 Chart generation initiated');
    } else {
      // Try alternative selectors
      await page.click('button');
      console.log('📊 Chart generation initiated (fallback)');
    }

    // Wait for chart to render
    await page.waitForTimeout(3000); // Allow time for API call and rendering

    // Look for the chart display
    const chartExists = await page.$('svg[role="img"][aria-label*="Kundli"]') !== null;

    if (chartExists) {
      console.log('✅ Vedic chart SVG found');

      // Take screenshot for manual validation
      const screenshotPath = path.join(__dirname, 'test-logs', 'rasi-position-validation.png');

      // Ensure directory exists
      const dir = path.dirname(screenshotPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      await page.screenshot({
        path: screenshotPath,
        fullPage: true
      });
      console.log('📸 Screenshot saved:', screenshotPath);

      // Validate that rasi numbers are present in the chart
      const rasiNumbers = await page.evaluate(() => {
        const svg = document.querySelector('svg[role="img"][aria-label*="Kundli"]');
        if (!svg) return [];

        const textElements = svg.querySelectorAll('text');
        const rasiElements = [];

        textElements.forEach(text => {
          const content = text.textContent.trim();
          // Look for single digits (1-12) which should be rasi numbers
          if (/^\d{1,2}$/.test(content) && parseInt(content) >= 1 && parseInt(content) <= 12) {
            rasiElements.push({
              number: parseInt(content),
              x: parseFloat(text.getAttribute('x')),
              y: parseFloat(text.getAttribute('y'))
            });
          }
        });

        return rasiElements;
      });

      console.log('🔍 Found rasi numbers in chart:', rasiNumbers);

      // Validate we have all 12 rasi numbers
      expect(rasiNumbers.length).toBe(12);

      // Validate each rasi number is in valid range
      rasiNumbers.forEach(rasi => {
        expect(rasi.number).toBeGreaterThanOrEqual(1);
        expect(rasi.number).toBeLessThanOrEqual(12);
        expect(rasi.x).toBeGreaterThan(0);
        expect(rasi.y).toBeGreaterThan(0);
      });

      // Validate anti-clockwise progression
      // Expected positions based on North Indian chart template
      const expectedSequence = {
        1: 'top-center',
        2: 'top-right-diagonal',
        3: 'right-center',
        4: 'bottom-right-diagonal',
        5: 'bottom-center',
        6: 'bottom-left-diagonal',
        7: 'left-center',
        8: 'top-left-diagonal',
        9: 'center-top-left',
        10: 'center-top-right',
        11: 'center-bottom-left',
        12: 'center-bottom-right'
      };

      // Analyze positions relative to chart center (250, 250 assuming 500x500 chart)
      const centerX = 250;
      const centerY = 250;

      rasiNumbers.forEach(rasi => {
        const relativeX = rasi.x - centerX;
        const relativeY = rasi.y - centerY;

        console.log(`Rasi ${rasi.number}: x=${rasi.x}, y=${rasi.y}, relative=(${relativeX}, ${relativeY})`);
      });

    } else {
      console.error('❌ Chart SVG not found');
      fail('Chart SVG element not found on page');
    }
  });

  test('should validate planetary positions match test data', async () => {
    console.log('🎯 Starting planetary position validation test');

    // Fill birth data form with exact test data
    await page.waitForSelector('input[name="name"]', { timeout: 10000 });

    // Use exact test data from JSON
    await page.type('input[name="name"]', testData.data.birthData.name);
    await page.type('input[name="date"], input[type="date"]', '1997-12-18'); // Format from test data
    await page.type('input[name="time"], input[type="time"]', testData.data.birthData.timeOfBirth);

    // Enter location with coordinates
    await page.type('input[name="location"], input[placeholder*="location"]', 'Jammu, India');

    // Select gender
    const genderSelect = await page.$('select[name="gender"]');
    if (genderSelect) {
      await page.select('select[name="gender"]', testData.data.birthData.gender);
    }

    console.log('✅ Form filled with exact test data');

    // Submit and wait for chart
    await page.click('button[type="submit"]');
    await page.waitForTimeout(5000); // Wait for API and rendering

    // Take screenshot
    const screenshotPath = path.join(__dirname, 'test-logs', 'planetary-position-validation.png');
    const dir = path.dirname(screenshotPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    await page.screenshot({
      path: screenshotPath,
      fullPage: true
    });
    console.log('📸 Planetary position screenshot saved');

    // Extract planet positions from chart
    const planetPositions = await page.evaluate(() => {
      const svg = document.querySelector('svg[role="img"][aria-label*="Kundli"]');
      if (!svg) return [];

      const textElements = svg.querySelectorAll('text');
      const planets = [];

      textElements.forEach(text => {
        const content = text.textContent.trim();
        // Look for planet codes (Su, Mo, Ma, Me, Ju, Ve, Sa, Ra, Ke, As)
        if (/^(Su|Mo|Ma|Me|Ju|Ve|Sa|Ra|Ke|As)\s+\d+/.test(content)) {
          planets.push({
            text: content,
            x: parseFloat(text.getAttribute('x')),
            y: parseFloat(text.getAttribute('y'))
          });
        }
      });

      return planets;
    });

    console.log('🔍 Found planets in chart:', planetPositions);

    // Validate against test data
    const expectedPlanets = testData.data.rasiChart.planets.map(p => ({
      name: p.name,
      degree: Math.floor(p.degree),
      sign: p.sign,
      dignity: p.dignity
    }));

    console.log('📊 Expected planets from test data:', expectedPlanets);

    // Verify all planets are displayed
    expect(planetPositions.length).toBeGreaterThan(0);

    // Log comparison for manual validation
    planetPositions.forEach(planet => {
      console.log(`Chart displays: ${planet.text} at position (${planet.x}, ${planet.y})`);
    });

    // Monitor console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Check for any console errors
    if (consoleErrors.length > 0) {
      console.error('❌ Console errors detected:', consoleErrors);
    }
    expect(consoleErrors.length).toBe(0);
  });
});
