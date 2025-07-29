/**
 * Script to test rasi positions in VedicChartDisplay
 * Generates a chart using live API and takes a screenshot
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function testRasiPositions() {
  console.log('🚀 Starting rasi position visual test...');

  let browser;
  try {
    // Launch browser
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 1024 });

    // Enable console logging
    page.on('console', msg => {
      console.log('🖥️  Browser console:', msg.type(), '-', msg.text());
    });

    // Log any page errors
    page.on('pageerror', error => {
      console.log('❌ Page error:', error.message);
    });

    // Navigate to the app
    console.log('📱 Navigating to app...');
    await page.goto('http://localhost:3002', { waitUntil: 'networkidle2' });

    // Wait for the form to load
    await page.waitForSelector('form', { timeout: 10000 });

    // Fill in the birth data form
    console.log('📝 Filling birth data form...');

    // Name
    await page.type('input[name="name"]', 'Rasi Test');

    // Date of birth - using proper format
    await page.evaluate(() => {
      const dateInput = document.querySelector('input[name="dateOfBirth"]');
      if (dateInput) {
        dateInput.value = '1997-12-18';
        dateInput.dispatchEvent(new Event('input', { bubbles: true }));
        dateInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

    // Time of birth
    await page.evaluate(() => {
      const timeInput = document.querySelector('input[name="timeOfBirth"]');
      if (timeInput) {
        timeInput.value = '02:30';
        timeInput.dispatchEvent(new Event('input', { bubbles: true }));
        timeInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

        // Place of birth
    await page.type('input[name="placeOfBirth"]', 'Mumbai, Maharashtra, India');

    // Gender
    await page.select('select[name="gender"]', 'male');

    // Wait for geocoding to complete - look for coordinates to appear
    console.log('⏳ Waiting for geocoding to complete...');
    try {
      await page.waitForFunction(() => {
        const locationText = document.body.innerText;
        return locationText.includes('Location found:') && locationText.includes('°');
      }, { timeout: 10000 });
      console.log('✅ Geocoding completed');
    } catch (error) {
      console.log('⚠️  Geocoding may not have completed');
    }

    // Additional wait to ensure all data is ready
    await new Promise(resolve => setTimeout(resolve, 2000));

        // Check current URL before submitting
    console.log('📍 Current URL:', page.url());

    // Click the submit button
    console.log('🔘 Submitting form...');
    const submitButtonInfo = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const buttonsInfo = buttons.map(b => ({ text: b.textContent.trim(), type: b.type }));

      // Look specifically for the "Birth Chart" navigation button
      const btn = buttons.find(b =>
        b.textContent.trim() === 'Birth Chart'
      );

      if (btn) {
        btn.click();
        return { found: true, text: btn.textContent.trim(), allButtons: buttonsInfo };
      }
      return { found: false, allButtons: buttonsInfo };
    });

    console.log('🔍 Button search result:', submitButtonInfo);

    if (!submitButtonInfo.found) {
      throw new Error('Submit button not found. Available buttons: ' + JSON.stringify(submitButtonInfo.allButtons));
    }

        // Wait for navigation to chart page
    console.log('⏳ Waiting for navigation to chart page...');
    try {
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 });
    } catch (error) {
      console.log('⚠️  Navigation timeout, checking current state...');
    }

    // Check URL after navigation
    console.log('📍 URL after submission:', page.url());

    // Check for any error messages
    const errorMessage = await page.evaluate(() => {
      const errorElements = document.querySelectorAll('[class*="error"], [class*="Error"], .text-red-600');
      const errors = [];
      errorElements.forEach(el => {
        if (el.textContent.trim()) {
          errors.push(el.textContent.trim());
        }
      });
      return errors;
    });

    if (errorMessage.length > 0) {
      console.log('⚠️  Errors found on page:', errorMessage);
    }

    // Wait for the chart to load - looking for the specific chart SVG
    console.log('⏳ Waiting for chart to load...');

    // Check what SVGs are on the page
    const svgInfo = await page.evaluate(() => {
      const svgs = document.querySelectorAll('svg');
      return Array.from(svgs).map(svg => ({
        width: svg.getAttribute('width'),
        height: svg.getAttribute('height'),
        viewBox: svg.getAttribute('viewBox'),
        classes: svg.className.baseVal || svg.className || '',
        childCount: svg.children.length
      }));
    });

    console.log('🎨 SVGs found on page:', svgInfo);

    try {
      // Wait for a large SVG that's likely the chart (not an icon)
      await page.waitForFunction(() => {
        const svgs = document.querySelectorAll('svg');
        for (const svg of svgs) {
          const width = parseInt(svg.getAttribute('width') || 0);
          const height = parseInt(svg.getAttribute('height') || 0);
          const viewBox = svg.getAttribute('viewBox');
          // Look for an SVG that's at least 400x400 (chart size) or has a viewBox indicating chart size
          if ((width >= 400 && height >= 400) || (viewBox && viewBox.includes('500'))) {
            return true;
          }
        }
        return false;
      }, { timeout: 15000 });

      console.log('✅ Large chart SVG found!');
    } catch (error) {
      console.log('⚠️  Chart SVG not found, checking for any chart content...');

      // Check if there's any loading spinner or error
      const pageContent = await page.evaluate(() => {
        const loading = document.querySelector('[class*="loading"], [class*="Loading"], [class*="spinner"]');
        const chartContainer = document.querySelector('[class*="chart"], [class*="Chart"]');
        return {
          hasLoading: !!loading,
          hasChartContainer: !!chartContainer,
          bodyText: document.body.innerText.substring(0, 500)
        };
      });

      console.log('📄 Page content check:', pageContent);
    }

    await new Promise(resolve => setTimeout(resolve, 2000)); // Extra wait for rendering

    // Create screenshot directory if it doesn't exist
    const screenshotDir = path.join(__dirname, '..', 'logs', 'rasi-test-screenshots');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }

    // Take full page screenshot
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotPath = path.join(screenshotDir, `rasi-positions-${timestamp}.png`);

    console.log('📸 Taking screenshot...');
    await page.screenshot({
      path: screenshotPath,
      fullPage: true
    });

    console.log(`✅ Screenshot saved to: ${screenshotPath}`);

    // Find and screenshot the actual chart SVG
    const chartElement = await page.evaluateHandle(() => {
      const svgs = document.querySelectorAll('svg');
      for (const svg of svgs) {
        const width = parseInt(svg.getAttribute('width') || 0);
        const height = parseInt(svg.getAttribute('height') || 0);
        if (width >= 400 && height >= 400) {
          return svg;
        }
      }
      return null;
    });

    if (chartElement && chartElement.asElement()) {
      const chartScreenshotPath = path.join(screenshotDir, `chart-only-${timestamp}.png`);
      await chartElement.asElement().screenshot({ path: chartScreenshotPath });
      console.log(`✅ Chart-only screenshot saved to: ${chartScreenshotPath}`);
    } else {
      console.log('⚠️  Large chart SVG not found for focused screenshot');
    }

        // Extract and log rasi positions and all text elements for debugging
    const chartInfo = await page.evaluate(() => {
      // Find the large SVG that's the actual chart
      let svgElement = null;
      const allSvgs = document.querySelectorAll('svg');

      for (const svg of allSvgs) {
        const width = parseInt(svg.getAttribute('width') || 0);
        const height = parseInt(svg.getAttribute('height') || 0);
        const viewBox = svg.getAttribute('viewBox');
        // Check for large SVG or viewBox indicating chart
        if ((width >= 400 && height >= 400) || (viewBox && viewBox.includes('500'))) {
          svgElement = svg;
          break;
        }
      }

      // If no large SVG found, use the first SVG as fallback
      if (!svgElement && allSvgs.length > 0) {
        svgElement = allSvgs[0];
      }

      const allTexts = svgElement ? svgElement.querySelectorAll('text') : [];
      const rasiPositions = [];
      const allTextContent = [];

      // Collect all text content for debugging
      allTexts.forEach(text => {
        const content = text.textContent.trim();
        const x = text.getAttribute('x');
        const y = text.getAttribute('y');

        allTextContent.push({
          content: content,
          x: x,
          y: y,
          fontSize: text.getAttribute('font-size')
        });

        // Check if it's a rasi number (1-12)
        if (/^[1-9]$|^1[0-2]$/.test(content)) {
          rasiPositions.push({
            rasi: content,
            x: x,
            y: y
          });
        }
      });

      return {
        svgFound: !!svgElement,
        svgDimensions: svgElement ? {
          width: svgElement.getAttribute('width'),
          height: svgElement.getAttribute('height')
        } : null,
        totalTexts: allTexts.length,
        rasiPositions: rasiPositions.sort((a, b) => parseInt(a.rasi) - parseInt(b.rasi)),
        allTextContent: allTextContent
      };
    });

    console.log('\n📊 Chart Analysis:');
    console.log(`  SVG Found: ${chartInfo.svgFound}`);
    console.log(`  SVG Dimensions: ${chartInfo.svgDimensions ? `${chartInfo.svgDimensions.width}x${chartInfo.svgDimensions.height}` : 'N/A'}`);
    console.log(`  Total Text Elements: ${chartInfo.totalTexts}`);

    console.log('\n📝 All Text Elements:');
    chartInfo.allTextContent.forEach((text, index) => {
      console.log(`  [${index}] "${text.content}" at (${text.x}, ${text.y}) - fontSize: ${text.fontSize}`);
    });

    console.log('\n📍 Detected Rasi Positions:');
    if (chartInfo.rasiPositions.length === 0) {
      console.log('  ⚠️  No rasi numbers (1-12) detected!');
    } else {
      chartInfo.rasiPositions.forEach(pos => {
        console.log(`  Rasi ${pos.rasi}: x=${pos.x}, y=${pos.y}`);
      });
    }

  } catch (error) {
    console.error('❌ Error during test:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the test
testRasiPositions()
  .then(() => {
    console.log('\n✅ Rasi position test completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  });
