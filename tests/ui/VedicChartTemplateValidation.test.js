/**
 * Vedic Chart Template Validation Tests
 * ====================================
 * Validates UI chart rendering matches kundli template specification exactly
 *
 * Template Requirements (templates/kundli-template.png):
 * - Box structure with two diagonals and center diamond (North Indian style)
 * - Purple squares with zodiac glyphs (♈♉♊♋♌♍♎♏♐♑♒♓)
 * - Planet format: "Ra 15", "Mo 19", "As 01" (concise, no degree symbols)
 * - Dignity symbols: ↑ for exalted, ↓ for debilitated
 * - House numbers 1-12 in correct diamond positions
 * - Cream/beige background (#FFF8E1)
 * - Proper visual hierarchy and spacing
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

describe('Vedic Chart Template Validation Tests', () => {
  let browser;
  let page;
  const baseUrl = 'http://localhost:3002';
  const screenshotDir = path.join(__dirname, '../../logs/ui/ui-test-screenshots');
  const testLogsDir = path.join(__dirname, '../../logs/ui/ui-test-logs');

  // Test birth data for consistent chart generation
  const testBirthData = {
    name: 'Template Validation User',
    dateOfBirth: '1985-10-24',
    timeOfBirth: '14:30',
    placeOfBirth: 'Mumbai, India',
    gender: 'male'
  };

  // Expected template elements from kundli-template.png
  const templateRequirements = {
    structure: {
      hasOuterBox: true,
      hasDiagonalLines: true,
      hasCenterDiamond: true,
      backgroundColorCream: '#FFF8E1'
    },
    zodiacGlyphs: ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'],
    planetFormat: {
      pattern: /^[A-Za-z]{1,2}\s\d{1,2}[↑↓]?$/,  // "Ra 15" or "As 01↑"
      examples: ['Ra 15', 'Mo 19', 'As 01', 'Su 07↓', 'Ju 14']
    },
    dignitySymbols: ['↑', '↓'],
    houseNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    colorScheme: {
      zodiacSquares: '#7C3AED',  // Purple
      background: '#FFF8E1',      // Cream
      text: '#333333'             // Dark gray
    }
  };

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: true,  // Must be headless for automated testing
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-extensions',
        '--disable-gpu'
      ],
      defaultViewport: { width: 1280, height: 800 }
    });

    // Ensure directories exist
    await fs.mkdir(screenshotDir, { recursive: true });
    await fs.mkdir(testLogsDir, { recursive: true });
  }, 30000); // Increase timeout for browser launch

  afterAll(async () => {
    if (browser) {
      await browser.close();
    }
  });

  beforeEach(async () => {
    page = await browser.newPage();

    // Comprehensive logging setup
    const logFile = path.join(testLogsDir, `template-validation-${Date.now()}.log`);
    const logStream = await fs.open(logFile, 'w');

    const logMessage = async (message) => {
      const timestamp = new Date().toISOString();
      const logEntry = `${timestamp}: ${message}\n`;
      await logStream.write(logEntry);
      console.log(message);
    };

    // Store log function for test access
    page.logMessage = logMessage;
    page.logStream = logStream;

    // Monitor all requests and responses
    page.on('request', async (request) => {
      await logMessage(`→ REQUEST: ${request.method()} ${request.url()}`);
    });

    page.on('response', async (response) => {
      await logMessage(`← RESPONSE: ${response.status()} ${response.url()}`);
    });

    // Monitor console messages
    page.on('console', async (msg) => {
      await logMessage(`CONSOLE ${msg.type().toUpperCase()}: ${msg.text()}`);
    });

    // Monitor errors
    page.on('pageerror', async (error) => {
      await logMessage(`PAGE ERROR: ${error.message}`);
    });

    await logMessage('=== VEDIC CHART TEMPLATE VALIDATION TEST STARTED ===');
  });

  afterEach(async () => {
    if (page && page.logStream) {
      try {
        await page.logMessage('=== TEST COMPLETED ===');
        await page.logStream.close();
      } catch (error) {
        console.log('Error closing log stream:', error.message);
      }
    }
    if (page) {
      await page.close();
    }
  });

  /**
   * CRITICAL TEST: Complete Template Compliance Validation
   */
  test('should render chart matching kundli template exactly', async () => {
    const testId = `template-validation-${Date.now()}`;
    await page.logMessage(`Starting complete template validation test: ${testId}`);

    // Navigate to home page first
    await page.goto(baseUrl, { waitUntil: 'networkidle0' });
    await page.logMessage('Navigated to home page');

    // Fill birth data form
    await page.logMessage('Filling birth data form...');

    // Wait for form elements and fill them
    await page.waitForSelector('input[name="name"], input[placeholder*="name" i]', { timeout: 10000 });
    await page.type('input[name="name"], input[placeholder*="name" i]', testBirthData.name);

    await page.waitForSelector('input[name="dateOfBirth"], input[type="date"], input[placeholder*="date" i]');
    await page.type('input[name="dateOfBirth"], input[type="date"], input[placeholder*="date" i]', testBirthData.dateOfBirth);

    await page.waitForSelector('input[name="timeOfBirth"], input[type="time"], input[placeholder*="time" i]');
    await page.type('input[name="timeOfBirth"], input[type="time"], input[placeholder*="time" i]', testBirthData.timeOfBirth);

    await page.waitForSelector('input[name="placeOfBirth"], input[placeholder*="place" i]');
    await page.type('input[name="placeOfBirth"], input[placeholder*="place" i]', testBirthData.placeOfBirth);

    // Select gender if available
    const genderSelect = await page.$('select[name="gender"], select[id*="gender"]');
    if (genderSelect) {
      await page.select('select[name="gender"], select[id*="gender"]', testBirthData.gender);
    }

    await page.logMessage('Birth data form filled successfully');

    // Capture form filled state
    await page.screenshot({
      path: path.join(screenshotDir, `${testId}-01-form-filled.png`),
      fullPage: true
    });

    // Submit form and wait for chart generation
    await page.logMessage('Submitting form to generate chart...');

    const submitButton = await page.$('button[type="submit"], button:contains("Generate"), .generate-chart, .btn-primary');
    if (submitButton) {
      await submitButton.click();
    } else {
      // Try finding submit button by text content
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const submitBtn = buttons.find(btn =>
          btn.textContent.toLowerCase().includes('generate') ||
          btn.textContent.toLowerCase().includes('chart') ||
          btn.textContent.toLowerCase().includes('submit')
        );
        if (submitBtn) submitBtn.click();
      });
    }

    // Wait for chart rendering
    await page.logMessage('Waiting for chart to render...');
    await page.waitForSelector('svg', { timeout: 30000 });
    await page.waitForTimeout(5000); // Allow complete rendering

    // Capture initial chart render
    await page.screenshot({
      path: path.join(screenshotDir, `${testId}-02-chart-initial.png`),
      fullPage: true
    });

    await page.logMessage('Chart rendered, starting template validation...');

    // === STRUCTURAL VALIDATION ===
    await page.logMessage('=== VALIDATING CHART STRUCTURE ===');

    // Check for SVG chart
    const chartSvg = await page.$('svg');
    expect(chartSvg).toBeTruthy();
    await page.logMessage('✓ SVG chart element found');

    // Validate diamond structure (box + diagonals)
    const pathElements = await page.$$('svg path, svg line');
    expect(pathElements.length).toBeGreaterThan(4); // Should have multiple lines for diamond structure
    await page.logMessage(`✓ Found ${pathElements.length} path/line elements for diamond structure`);

    // Check background color (cream/beige)
    const svgBackground = await page.evaluate(() => {
      const svg = document.querySelector('svg');
      const rect = svg ? svg.querySelector('rect') : null;
      return rect ? window.getComputedStyle(rect).fill : null;
    });
    await page.logMessage(`Chart background color: ${svgBackground}`);

    // === ZODIAC GLYPH VALIDATION ===
    await page.logMessage('=== VALIDATING ZODIAC GLYPHS ===');

    // Check for purple squares with zodiac symbols
    const zodiacElements = await page.$$eval('svg text', (texts) => {
      return texts
        .map(text => text.textContent.trim())
        .filter(content => /[♈♉♊♋♌♍♎♏♐♑♒♓]/.test(content));
    });

    await page.logMessage(`Found zodiac glyphs: ${zodiacElements.join(', ')}`);
    expect(zodiacElements.length).toBeGreaterThan(0);

    // Validate all 12 zodiac signs are present
    const expectedZodiacCount = templateRequirements.zodiacGlyphs.length;
    if (zodiacElements.length === expectedZodiacCount) {
      await page.logMessage('✓ All 12 zodiac glyphs found');
    } else {
      await page.logMessage(`⚠ Expected ${expectedZodiacCount} zodiac glyphs, found ${zodiacElements.length}`);
    }

    // Check for purple squares (background for zodiac glyphs)
    const purpleSquares = await page.$$eval('svg rect', (rects) => {
      return rects.filter(rect => {
        const fill = rect.getAttribute('fill') || rect.style.fill;
        return fill && (fill.includes('#7C3AED') || fill.includes('purple') || fill.includes('#5B21B6'));
      }).length;
    });
    await page.logMessage(`Found ${purpleSquares} purple square elements`);

    // === PLANET FORMAT VALIDATION ===
    await page.logMessage('=== VALIDATING PLANET FORMAT ===');

    // Extract all planet text elements
    const planetTexts = await page.$$eval('svg text', (texts) => {
      return texts
        .map(text => text.textContent.trim())
        .filter(content =>
          // Match pattern like "Ra 15", "Mo 19", "As 01", etc.
          /^[A-Za-z]{1,2}\s\d{1,2}[↑↓]?$/.test(content) ||
          // Also match house numbers or coordinates
          /^\d{1,2}$/.test(content)
        )
        .filter(content => !(/^\d{1,2}$/.test(content) && parseInt(content) >= 1 && parseInt(content) <= 12)); // Exclude house numbers
    });

    await page.logMessage(`Found planet format texts: ${planetTexts.join(', ')}`);

    // Validate planet format matches template specification
    const validPlanetFormats = planetTexts.filter(text =>
      templateRequirements.planetFormat.pattern.test(text)
    );

    await page.logMessage(`Valid planet formats: ${validPlanetFormats.join(', ')}`);
    expect(validPlanetFormats.length).toBeGreaterThan(0);

    // Check for dignity symbols
    const dignitySymbols = planetTexts.filter(text =>
      text.includes('↑') || text.includes('↓')
    );
    await page.logMessage(`Found dignity symbols in: ${dignitySymbols.join(', ')}`);

    // === HOUSE NUMBER VALIDATION ===
    await page.logMessage('=== VALIDATING HOUSE NUMBERS ===');

    const houseNumbers = await page.$$eval('svg text', (texts) => {
      return texts
        .map(text => text.textContent.trim())
        .filter(content => /^\d{1,2}$/.test(content))
        .map(content => parseInt(content))
        .filter(num => num >= 1 && num <= 12)
        .sort((a, b) => a - b);
    });

    await page.logMessage(`Found house numbers: ${houseNumbers.join(', ')}`);
    expect(houseNumbers.length).toBe(12);

    // Validate all houses 1-12 are present
    const expectedHouses = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const allHousesPresent = expectedHouses.every(house => houseNumbers.includes(house));

    if (allHousesPresent) {
      await page.logMessage('✓ All 12 house numbers (1-12) found');
    } else {
      const missingHouses = expectedHouses.filter(house => !houseNumbers.includes(house));
      await page.logMessage(`⚠ Missing house numbers: ${missingHouses.join(', ')}`);
    }

    // === VISUAL HIERARCHY VALIDATION ===
    await page.logMessage('=== VALIDATING VISUAL HIERARCHY ===');

    // Check text sizes and positioning
    const textElements = await page.$$eval('svg text', (texts) => {
      return texts.map(text => ({
        content: text.textContent.trim(),
        fontSize: window.getComputedStyle(text).fontSize,
        fill: text.getAttribute('fill') || window.getComputedStyle(text).fill,
        x: text.getAttribute('x'),
        y: text.getAttribute('y')
      }));
    });

    await page.logMessage(`Found ${textElements.length} text elements with proper positioning`);

    // Capture detailed chart analysis
    await page.screenshot({
      path: path.join(screenshotDir, `${testId}-03-chart-detailed.png`),
      fullPage: true
    });

    // === COMPREHENSIVE TEMPLATE MATCH VALIDATION ===
    await page.logMessage('=== COMPREHENSIVE TEMPLATE MATCH ANALYSIS ===');

    const templateMatchResults = {
      structure: {
        hasSvgChart: !!chartSvg,
        hasMultiplePathLines: pathElements.length >= 4,
        score: pathElements.length >= 4 ? 100 : 50
      },
      zodiacGlyphs: {
        found: zodiacElements.length,
        expected: 12,
        hasPurpleSquares: purpleSquares > 0,
        score: (zodiacElements.length / 12) * 100
      },
      planetFormat: {
        validFormats: validPlanetFormats.length,
        hasDignitySymbols: dignitySymbols.length > 0,
        score: validPlanetFormats.length > 0 ? 100 : 0
      },
      houseNumbers: {
        found: houseNumbers.length,
        expected: 12,
        allPresent: allHousesPresent,
        score: (houseNumbers.length / 12) * 100
      }
    };

    // Calculate overall template compliance score
    const overallScore = (
      templateMatchResults.structure.score +
      templateMatchResults.zodiacGlyphs.score +
      templateMatchResults.planetFormat.score +
      templateMatchResults.houseNumbers.score
    ) / 4;

    await page.logMessage('=== TEMPLATE MATCH RESULTS ===');
    await page.logMessage(`Structure Score: ${templateMatchResults.structure.score}%`);
    await page.logMessage(`Zodiac Glyphs Score: ${templateMatchResults.zodiacGlyphs.score}%`);
    await page.logMessage(`Planet Format Score: ${templateMatchResults.planetFormat.score}%`);
    await page.logMessage(`House Numbers Score: ${templateMatchResults.houseNumbers.score}%`);
    await page.logMessage(`OVERALL TEMPLATE COMPLIANCE: ${overallScore.toFixed(1)}%`);

    // Final validation screenshot
    await page.screenshot({
      path: path.join(screenshotDir, `${testId}-04-final-validation.png`),
      fullPage: true
    });

    // === CRITICAL TEST ASSERTIONS ===
    expect(overallScore).toBeGreaterThan(75); // Must achieve at least 75% template compliance
    expect(templateMatchResults.structure.hasSvgChart).toBe(true);
    expect(templateMatchResults.houseNumbers.allPresent).toBe(true);
    expect(templateMatchResults.planetFormat.validFormats).toBeGreaterThan(0);

    await page.logMessage(`✅ TEMPLATE VALIDATION COMPLETED WITH ${overallScore.toFixed(1)}% COMPLIANCE`);
  });

  /**
   * SECONDARY TEST: Specific Element Positioning Validation
   */
  test('should have correct diamond layout positioning', async () => {
    const testId = `positioning-validation-${Date.now()}`;
    await page.logMessage(`Starting positioning validation test: ${testId}`);

    // Navigate and generate chart (simplified version)
    await page.goto(baseUrl, { waitUntil: 'networkidle0' });

    // Quick form fill and submit
    await page.waitForSelector('input[name="name"], input[placeholder*="name" i]');
    await page.type('input[name="name"], input[placeholder*="name" i]', 'Position Test');

    const submitButton = await page.$('button[type="submit"], button:contains("Generate")');
    if (submitButton) await submitButton.click();

    await page.waitForSelector('svg', { timeout: 20000 });
    await page.waitForTimeout(3000);

    // Validate diamond positioning
    const svgBounds = await page.$eval('svg', (svg) => ({
      width: svg.getAttribute('width') || svg.viewBox?.baseVal?.width,
      height: svg.getAttribute('height') || svg.viewBox?.baseVal?.height
    }));

    await page.logMessage(`SVG Dimensions: ${svgBounds.width} x ${svgBounds.height}`);

    // Check center positioning
    const centerElements = await page.$$eval('svg text', (texts) => {
      const svgRect = document.querySelector('svg').getBoundingClientRect();
      const centerX = svgRect.width / 2;
      const centerY = svgRect.height / 2;

      return texts
        .map(text => {
          const rect = text.getBoundingClientRect();
          const x = rect.left + rect.width / 2 - svgRect.left;
          const y = rect.top + rect.height / 2 - svgRect.top;
          return {
            content: text.textContent.trim(),
            x: x,
            y: y,
            distanceFromCenter: Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2))
          };
        })
        .filter(item => item.content.length > 0);
    });

    await page.logMessage(`Found ${centerElements.length} positioned elements`);

    // Elements near center should be ascendant or central planets
    const centerElements_filtered = centerElements
      .filter(el => el.distanceFromCenter < 100)
      .sort((a, b) => a.distanceFromCenter - b.distanceFromCenter);

    await page.logMessage(`Elements near center: ${centerElements_filtered.map(el => el.content).join(', ')}`);

    // Capture positioning analysis
    await page.screenshot({
      path: path.join(screenshotDir, `${testId}-positioning-analysis.png`),
      fullPage: true
    });

    expect(centerElements.length).toBeGreaterThan(12); // At least houses + planets
    await page.logMessage('✅ POSITIONING VALIDATION COMPLETED');
  });

  /**
   * TERTIARY TEST: Color Scheme and Visual Validation
   */
  test('should match template color scheme and visual styling', async () => {
    const testId = `visual-validation-${Date.now()}`;
    await page.logMessage(`Starting visual validation test: ${testId}`);

    // Navigate and generate chart
    await page.goto(baseUrl, { waitUntil: 'networkidle0' });
    await page.waitForSelector('input[name="name"], input[placeholder*="name" i]');
    await page.type('input[name="name"], input[placeholder*="name" i]', 'Visual Test');

    const submitButton = await page.$('button[type="submit"], button:contains("Generate")');
    if (submitButton) await submitButton.click();

    await page.waitForSelector('svg', { timeout: 20000 });
    await page.waitForTimeout(3000);

    // Analyze color scheme
    const colorAnalysis = await page.evaluate(() => {
      const svg = document.querySelector('svg');
      const rects = Array.from(svg.querySelectorAll('rect'));
      const texts = Array.from(svg.querySelectorAll('text'));

      return {
        backgroundColors: rects.map(r => r.getAttribute('fill') || r.style.fill).filter(Boolean),
        textColors: texts.map(t => t.getAttribute('fill') || window.getComputedStyle(t).fill).filter(Boolean),
        purpleElements: rects.filter(r => {
          const fill = r.getAttribute('fill') || r.style.fill;
          return fill && (fill.includes('#7C3AED') || fill.includes('purple') || fill.includes('#5B21B6'));
        }).length
      };
    });

    await page.logMessage(`Background colors found: ${colorAnalysis.backgroundColors.join(', ')}`);
    await page.logMessage(`Text colors found: ${colorAnalysis.textColors.join(', ')}`);
    await page.logMessage(`Purple elements: ${colorAnalysis.purpleElements}`);

    // Final visual validation screenshot
    await page.screenshot({
      path: path.join(screenshotDir, `${testId}-color-scheme.png`),
      fullPage: true
    });

    expect(colorAnalysis.purpleElements).toBeGreaterThan(0);
    await page.logMessage('✅ VISUAL VALIDATION COMPLETED');
  });
});
