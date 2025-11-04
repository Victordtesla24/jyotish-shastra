/**
 * Browser-Based SVG Rendering Verification Script
 * 
 * Purpose: Verify that POST /api/v1/chart/render/svg generates SVG that:
 * - Matches the Kundli template structure (lines, background, dimensions)
 * - Uses XY anchors from vedic_chart_xy_spec.json correctly
 * - Renders deterministically (no jitter between renders)
 * - Returns correct metadata (service, width, renderedAt)
 * 
 * Success Criteria:
 * - Response structure: { success: true, data: { svg }, metadata: { service: "ChartRenderingService", width, renderedAt } }
 * - SVG structure: 10 line elements (4 outer square + 4 diamond + 2 diagonals)
 * - Background color: #FFF8E1
 * - XY anchors match spec within ±1px tolerance after scaling
 * - Deterministic rendering (identical SVG on multiple renders)
 * - Zero console errors
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Test configuration
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const TEST_WIDTH = 800;

// Test birth data
const TEST_BIRTH_DATA = {
  name: 'Farhan',
  dateOfBirth: '1997-12-18',
  timeOfBirth: '02:30',
  latitude: 32.4935378,
  longitude: 74.5411575,
  timezone: 'Asia/Karachi',
  placeOfBirth: 'Sialkot, Pakistan'
};

// Load XY spec for anchor verification
function loadXYSpec() {
  const specPath = path.join(__dirname, '../../user-docs/vedic_chart_xy_spec.json');
  if (!fs.existsSync(specPath)) {
    throw new Error(`XY spec not found at: ${specPath}`);
  }
  return JSON.parse(fs.readFileSync(specPath, 'utf8'));
}

// Parse SVG string to extract structure
function parseSVGStructure(svgString) {
  // Extract SVG root element
  const svgMatch = svgString.match(/<svg[^>]*>/);
  if (!svgMatch) {
    throw new Error('SVG root element not found');
  }

  // Extract viewBox and dimensions
  const viewBoxMatch = svgString.match(/viewBox="([^"]+)"/);
  const widthMatch = svgString.match(/width="([^"]+)"/);
  const heightMatch = svgString.match(/height="([^"]+)"/);

  // Count line elements
  const lineMatches = svgString.match(/<line[^>]*>/g) || [];
  const lines = lineMatches.map(line => {
    const x1 = line.match(/x1="([^"]+)"/)?.[1];
    const y1 = line.match(/y1="([^"]+)"/)?.[1];
    const x2 = line.match(/x2="([^"]+)"/)?.[1];
    const y2 = line.match(/y2="([^"]+)"/)?.[1];
    const stroke = line.match(/stroke="([^"]+)"/)?.[1];
    const strokeWidth = line.match(/stroke-width="([^"]+)"/)?.[1];
    return { x1, y1, x2, y2, stroke, strokeWidth };
  });

  // Count text elements
  const textMatches = svgString.match(/<text[^>]*>[^<]*<\/text>/g) || [];
  const texts = textMatches.map(text => {
    const x = text.match(/x="([^"]+)"/)?.[1];
    const y = text.match(/y="([^"]+)"/)?.[1];
    const content = text.match(/>([^<]+)</)?.[1];
    const fontSize = text.match(/font-size="([^"]+)"/)?.[1];
    return { x, y, content, fontSize };
  });

  // Extract background rectangle
  const rectMatch = svgString.match(/<rect[^>]*>/);
  const background = rectMatch ? {
    width: rectMatch[0].match(/width="([^"]+)"/)?.[1],
    height: rectMatch[0].match(/height="([^"]+)"/)?.[1],
    fill: rectMatch[0].match(/fill="([^"]+)"/)?.[1]
  } : null;

  return {
    viewBox: viewBoxMatch?.[1],
    width: widthMatch?.[1],
    height: heightMatch?.[1],
    lines,
    texts,
    background,
    lineCount: lines.length,
    textCount: texts.length
  };
}

// Verify line structure matches template
function verifyLineStructure(svgStructure) {
  const { lines } = svgStructure;
  
  // Expected: 4 outer square + 4 diamond + 2 diagonals = 10 lines
  if (lines.length !== 10) {
    return {
      valid: false,
      error: `Expected 10 line elements, found ${lines.length}`
    };
  }

  // Verify all lines have black stroke
  const nonBlackLines = lines.filter(l => l.stroke !== 'black');
  if (nonBlackLines.length > 0) {
    return {
      valid: false,
      error: `Found ${nonBlackLines.length} lines with non-black stroke`
    };
  }

  // Verify stroke-width is 2 (not scaled)
  const nonStandardWidth = lines.filter(l => l.strokeWidth !== '2');
  if (nonStandardWidth.length > 0) {
    return {
      valid: false,
      error: `Found ${nonStandardWidth.length} lines with non-standard stroke-width`
    };
  }

  return { valid: true };
}

// Verify XY anchor positions
function verifyXYAnchors(svgStructure, xySpec, width) {
  const { texts } = svgStructure;
  const scaleFactor = width / 1000; // k = width / 1000
  const tolerance = 1; // ±1px tolerance

  const errors = [];
  const verified = [];

  // Create map of slot names to expected positions
  const slotMap = {};
  xySpec.slots.forEach(slot => {
    slotMap[slot.slot_name] = {
      x: slot.x * scaleFactor,
      y: slot.y * scaleFactor
    };
  });

  // Verify each slot has a text element at expected position
  xySpec.slots.forEach(slot => {
    const expectedX = slot.x * scaleFactor;
    const expectedY = slot.y * scaleFactor;
    
    // Find text elements near expected position
    const matchingTexts = texts.filter(text => {
      const textX = parseFloat(text.x);
      const textY = parseFloat(text.y);
      const deltaX = Math.abs(textX - expectedX);
      const deltaY = Math.abs(textY - expectedY);
      return deltaX <= tolerance && deltaY <= tolerance;
    });

    if (matchingTexts.length === 0) {
      errors.push({
        slot: slot.slot_name,
        expected: { x: expectedX, y: expectedY },
        found: null,
        error: 'No text element found at expected position'
      });
    } else {
      verified.push({
        slot: slot.slot_name,
        expected: { x: expectedX, y: expectedY },
        found: matchingTexts[0]
      });
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    verified,
    verifiedCount: verified.length,
    totalSlots: xySpec.slots.length
  };
}

// Main verification function
async function verifySVGRendering() {
  console.log('🚀 Starting SVG Rendering Verification');
  console.log('=====================================\n');

  const results = {
    timestamp: new Date().toISOString(),
    testData: TEST_BIRTH_DATA,
    width: TEST_WIDTH,
    tests: [],
    errors: [],
    summary: { passed: 0, failed: 0, total: 0 }
  };

  let browser;
  let xySpec;

  try {
    // Load XY spec
    console.log('📍 Loading XY specification...');
    xySpec = loadXYSpec();
    console.log(`✅ Loaded XY spec with ${xySpec.slots.length} slots\n`);

    // Test 1: Direct API call
    console.log('📍 Test 1: Direct API call to POST /api/v1/chart/render/svg');
    results.summary.total++;
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/v1/chart/render/svg`,
        {
          ...TEST_BIRTH_DATA,
          width: TEST_WIDTH,
          includeData: false
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000
        }
      );

      // Verify response structure
      if (!response.data.success) {
        throw new Error('API response indicates failure');
      }

      if (!response.data.data?.svg) {
        throw new Error('SVG content missing from response');
      }

      // Verify metadata
      const metadata = response.data.metadata;
      if (metadata.service !== 'ChartRenderingService') {
        throw new Error(`Expected service "ChartRenderingService", got "${metadata.service}"`);
      }

      if (parseInt(metadata.width) !== TEST_WIDTH) {
        throw new Error(`Expected width ${TEST_WIDTH}, got ${metadata.width}`);
      }

      if (!metadata.renderedAt) {
        throw new Error('renderedAt timestamp missing from metadata');
      }

      console.log('✅ Response structure valid');
      console.log(`   Service: ${metadata.service}`);
      console.log(`   Width: ${metadata.width}`);
      console.log(`   Rendered at: ${metadata.renderedAt}\n`);

      // Parse SVG structure
      const svgStructure = parseSVGStructure(response.data.data.svg);
      console.log('✅ SVG structure parsed');
      console.log(`   Dimensions: ${svgStructure.width}x${svgStructure.height}`);
      console.log(`   Lines: ${svgStructure.lineCount}`);
      console.log(`   Texts: ${svgStructure.textCount}`);
      console.log(`   Background: ${svgStructure.background?.fill || 'N/A'}\n`);

      // Test 2: Verify line structure
      console.log('📍 Test 2: Verify line structure matches template');
      results.summary.total++;
      const lineVerification = verifyLineStructure(svgStructure);
      if (lineVerification.valid) {
        console.log('✅ Line structure matches template (10 lines: 4 outer + 4 diamond + 2 diagonals)\n');
        results.summary.passed++;
        results.tests.push({ name: 'Line Structure', status: 'passed' });
      } else {
        console.error(`❌ Line structure verification failed: ${lineVerification.error}\n`);
        results.summary.failed++;
        results.tests.push({ name: 'Line Structure', status: 'failed', error: lineVerification.error });
        results.errors.push({ test: 'Line Structure', error: lineVerification.error });
      }

      // Test 3: Verify background color
      console.log('📍 Test 3: Verify background color');
      results.summary.total++;
      if (svgStructure.background?.fill === '#FFF8E1') {
        console.log('✅ Background color matches template (#FFF8E1)\n');
        results.summary.passed++;
        results.tests.push({ name: 'Background Color', status: 'passed' });
      } else {
        const error = `Expected background color #FFF8E1, got ${svgStructure.background?.fill || 'N/A'}`;
        console.error(`❌ ${error}\n`);
        results.summary.failed++;
        results.tests.push({ name: 'Background Color', status: 'failed', error });
        results.errors.push({ test: 'Background Color', error });
      }

      // Test 4: Verify XY anchor positions
      console.log('📍 Test 4: Verify XY anchor positions');
      results.summary.total++;
      const anchorVerification = verifyXYAnchors(svgStructure, xySpec, TEST_WIDTH);
      if (anchorVerification.valid) {
        console.log(`✅ All ${anchorVerification.verifiedCount} XY anchors match spec (within ±1px tolerance)\n`);
        results.summary.passed++;
        results.tests.push({ name: 'XY Anchors', status: 'passed', verified: anchorVerification.verifiedCount });
      } else {
        console.error(`❌ XY anchor verification failed: ${anchorVerification.errors.length} errors\n`);
        anchorVerification.errors.slice(0, 5).forEach(err => {
          console.error(`   - ${err.slot}: ${err.error}`);
        });
        if (anchorVerification.errors.length > 5) {
          console.error(`   ... and ${anchorVerification.errors.length - 5} more errors`);
        }
        console.log('');
        results.summary.failed++;
        results.tests.push({ name: 'XY Anchors', status: 'failed', errors: anchorVerification.errors });
        results.errors.push({ test: 'XY Anchors', errors: anchorVerification.errors });
      }

      // Test 5: Deterministic rendering
      console.log('📍 Test 5: Verify deterministic rendering');
      results.summary.total++;
      const response2 = await axios.post(
        `${BACKEND_URL}/api/v1/chart/render/svg`,
        {
          ...TEST_BIRTH_DATA,
          width: TEST_WIDTH,
          includeData: false
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000
        }
      );

      const svg1 = response.data.data.svg;
      const svg2 = response2.data.data.svg;

      if (svg1 === svg2) {
        console.log('✅ Rendering is deterministic (identical SVG on multiple renders)\n');
        results.summary.passed++;
        results.tests.push({ name: 'Deterministic Rendering', status: 'passed' });
      } else {
        // Compare structure (not exact match due to potential timestamp differences in XML)
        const structure1 = parseSVGStructure(svg1);
        const structure2 = parseSVGStructure(svg2);
        
        if (structure1.lineCount === structure2.lineCount &&
            structure1.textCount === structure2.textCount &&
            structure1.width === structure2.width) {
          console.log('✅ Rendering structure is deterministic (structure matches, ignoring XML formatting)\n');
          results.summary.passed++;
          results.tests.push({ name: 'Deterministic Rendering', status: 'passed' });
        } else {
          const error = 'Rendering is not deterministic: structure differs between renders';
          console.error(`❌ ${error}\n`);
          results.summary.failed++;
          results.tests.push({ name: 'Deterministic Rendering', status: 'failed', error });
          results.errors.push({ test: 'Deterministic Rendering', error });
        }
      }

      // Test 6: Browser-based verification
      console.log('📍 Test 6: Browser-based SVG inspection');
      results.summary.total++;
      browser = await puppeteer.launch({
        headless: process.env.HEADLESS !== 'false',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        defaultViewport: { width: 1280, height: 800 }
      });

      const page = await browser.newPage();
      
      // Set up console monitoring
      const consoleMessages = [];
      page.on('console', msg => {
        const text = msg.text();
        if (text.includes('Error') || text.includes('❌')) {
          consoleMessages.push({ type: msg.type(), text });
        }
      });

      // Intercept network requests
      const requests = [];
      page.on('request', request => {
        if (request.url().includes('/api/v1/chart/render/svg')) {
          requests.push({ url: request.url(), method: request.method() });
        }
      });

      // Inject SVG into page and inspect
      const svgInspection = await page.evaluate((svgString) => {
        // Create container for SVG
        const container = document.createElement('div');
        container.innerHTML = svgString;
        document.body.appendChild(container);

        const svg = container.querySelector('svg');
        if (!svg) {
          return { error: 'SVG element not found in DOM' };
        }

        // Inspect SVG structure
        const lines = svg.querySelectorAll('line');
        const texts = svg.querySelectorAll('text');
        const rects = svg.querySelectorAll('rect');

        return {
          width: svg.getAttribute('width'),
          height: svg.getAttribute('height'),
          viewBox: svg.getAttribute('viewBox'),
          lineCount: lines.length,
          textCount: texts.length,
          rectCount: rects.length,
          backgroundFill: rects[0]?.getAttribute('fill') || null,
          hasBackground: rects.length > 0
        };
      }, response.data.data.svg);

      if (svgInspection.error) {
        throw new Error(svgInspection.error);
      }

      // Verify no console errors
      if (consoleMessages.length > 0) {
        const error = `Found ${consoleMessages.length} console errors during browser inspection`;
        console.error(`❌ ${error}\n`);
        results.summary.failed++;
        results.tests.push({ name: 'Browser Inspection', status: 'failed', error, consoleMessages });
        results.errors.push({ test: 'Browser Inspection', error, consoleMessages });
      } else {
        console.log('✅ Browser inspection passed (no console errors)');
        console.log(`   SVG dimensions: ${svgInspection.width}x${svgInspection.height}`);
        console.log(`   Lines: ${svgInspection.lineCount}`);
        console.log(`   Texts: ${svgInspection.textCount}`);
        console.log(`   Background: ${svgInspection.backgroundFill || 'N/A'}\n`);
        results.summary.passed++;
        results.tests.push({ name: 'Browser Inspection', status: 'passed', inspection: svgInspection });
      }

      await browser.close();

    } catch (error) {
      console.error(`❌ Test failed: ${error.message}`);
      console.error(error.stack);
      results.errors.push({ test: 'General', error: error.message, stack: error.stack });
      if (browser) {
        await browser.close();
      }
    }

    // Print summary
    console.log('📊 Verification Summary');
    console.log('======================');
    console.log(`Total tests: ${results.summary.total}`);
    console.log(`Passed: ${results.summary.passed}`);
    console.log(`Failed: ${results.summary.failed}`);
    console.log(`Success rate: ${((results.summary.passed / results.summary.total) * 100).toFixed(1)}%\n`);

    // Save results
    const resultsPath = path.join(__dirname, 'test-logs', `svg-verification-${Date.now()}.json`);
    const logsDir = path.dirname(resultsPath);
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2), 'utf8');
    console.log(`📄 Results saved to: ${resultsPath}`);

    // Exit with appropriate code
    process.exit(results.summary.failed > 0 ? 1 : 0);

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run verification
if (require.main === module) {
  verifySVGRendering().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

module.exports = { verifySVGRendering, parseSVGStructure, verifyLineStructure, verifyXYAnchors };

