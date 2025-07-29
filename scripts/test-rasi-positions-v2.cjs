/**
 * Script to test rasi positions in VedicChartDisplay - V2
 * First generates chart data, then navigates to chart page
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function testRasiPositions() {
  console.log('🚀 Starting rasi position visual test V2...');

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
      if (msg.text().includes('Rasi calculation') || msg.text().includes('Chart') || msg.text().includes('chart')) {
        console.log('🖥️  Browser:', msg.text());
      }
    });

    // Navigate to the app
    console.log('📱 Navigating to app...');
    await page.goto('http://localhost:3002', { waitUntil: 'networkidle2' });

    // Wait for the form to load
    await page.waitForSelector('form', { timeout: 10000 });

    // Fill in the birth data form
    console.log('📝 Filling birth data form...');

    // Fill all fields
    await page.type('input[name="name"]', 'Rasi Test');

    await page.evaluate(() => {
      document.querySelector('input[name="dateOfBirth"]').value = '1997-12-18';
      document.querySelector('input[name="timeOfBirth"]').value = '02:30';
    });

    await page.type('input[name="placeOfBirth"]', 'Mumbai, Maharashtra, India');
    await page.select('select[name="gender"]', 'male');

    // Wait for geocoding
    console.log('⏳ Waiting for geocoding...');
    await page.waitForFunction(() => {
      const text = document.body.innerText;
      return text.includes('Location found:');
    }, { timeout: 10000 });

    // Click Generate Vedic Chart button to generate data
    console.log('🔘 Generating chart data...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const generateBtn = buttons.find(b => b.textContent.includes('Generate Vedic Chart'));
      if (generateBtn) generateBtn.click();
    });

    // Wait for API call to complete
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Now navigate to chart page
    console.log('📊 Navigating to chart page...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const chartBtn = buttons.find(b => b.textContent.trim() === 'Birth Chart');
      if (chartBtn) chartBtn.click();
    });

    // Wait for navigation
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('📍 Current URL:', page.url());

    // Wait for chart SVG
    console.log('⏳ Waiting for chart to appear...');
    const chartFound = await page.waitForFunction(() => {
      const svgs = document.querySelectorAll('svg');
      for (const svg of svgs) {
        const width = parseInt(svg.getAttribute('width') || 0);
        if (width >= 400) return true;

        const viewBox = svg.getAttribute('viewBox');
        if (viewBox && viewBox.includes('500')) return true;
      }
      return false;
    }, { timeout: 15000 }).catch(() => false);

    if (!chartFound) {
      console.log('⚠️  Chart not found, taking screenshot anyway...');
    }

    // Create screenshot directory
    const screenshotDir = path.join(__dirname, '..', 'logs', 'rasi-test-screenshots');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }

    // Take screenshot
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotPath = path.join(screenshotDir, `rasi-test-v2-${timestamp}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`📸 Screenshot saved to: ${screenshotPath}`);

    // Analyze chart content
    const chartAnalysis = await page.evaluate(() => {
      const svgs = document.querySelectorAll('svg');
      let chartSvg = null;

      // Find the chart SVG
      for (const svg of svgs) {
        const width = parseInt(svg.getAttribute('width') || 0);
        const viewBox = svg.getAttribute('viewBox');
        if (width >= 400 || (viewBox && viewBox.includes('500'))) {
          chartSvg = svg;
          break;
        }
      }

      if (!chartSvg) return { found: false };

      // Get all text elements
      const texts = chartSvg.querySelectorAll('text');
      const rasiNumbers = [];
      const allTexts = [];

      texts.forEach(text => {
        const content = text.textContent.trim();
        allTexts.push({
          content,
          x: text.getAttribute('x'),
          y: text.getAttribute('y')
        });

        // Check if it's a rasi number
        if (/^[1-9]$|^1[0-2]$/.test(content)) {
          rasiNumbers.push({
            rasi: parseInt(content),
            x: parseFloat(text.getAttribute('x')),
            y: parseFloat(text.getAttribute('y'))
          });
        }
      });

      return {
        found: true,
        width: chartSvg.getAttribute('width'),
        height: chartSvg.getAttribute('height'),
        viewBox: chartSvg.getAttribute('viewBox'),
        totalTexts: texts.length,
        rasiNumbers: rasiNumbers.sort((a, b) => a.rasi - b.rasi),
        allTexts
      };
    });

    console.log('\n📊 Chart Analysis:');
    if (chartAnalysis.found) {
      console.log(`  ✅ Chart SVG found: ${chartAnalysis.width}x${chartAnalysis.height}`);
      console.log(`  ViewBox: ${chartAnalysis.viewBox}`);
      console.log(`  Total text elements: ${chartAnalysis.totalTexts}`);

      if (chartAnalysis.rasiNumbers.length > 0) {
        console.log('\n📍 Rasi Number Positions:');
        chartAnalysis.rasiNumbers.forEach(r => {
          console.log(`  Rasi ${r.rasi}: (${r.x}, ${r.y})`);
        });
      } else {
        console.log('\n⚠️  No rasi numbers found!');
        console.log('All texts found:');
        chartAnalysis.allTexts.forEach(t => {
          console.log(`  "${t.content}" at (${t.x}, ${t.y})`);
        });
      }
    } else {
      console.log('  ❌ Chart SVG not found');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the test
testRasiPositions()
  .then(() => console.log('\n✅ Test completed'))
  .catch(error => console.error('\n❌ Test failed:', error));
