/**
 * Direct test of rasi positions by navigating to chart page
 * with predefined test data using the API
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function testRasiPositions() {
  console.log('🚀 Starting direct rasi position test...');

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true, // Run headless
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    // Enable console logging
    page.on('console', msg => {
      if (msg.text().includes('CORRECTED Rasi calculation')) {
        console.log('🔢', msg.text());
      }
    });

    // First, make a direct API call to generate chart data
    console.log('📊 Generating chart via API...');
    const chartResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('http://localhost:3001/api/v1/chart/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            dateOfBirth: '1997-12-18',
            timeOfBirth: '02:30',
            latitude: 19.0760,
            longitude: 72.8777,
            timezone: 'Asia/Kolkata'
          })
        });

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

                const data = await response.json();
        console.log('API Response received:', data.success ? 'Success' : 'Failed');
        return data;
      } catch (error) {
        console.error('API call failed:', error.message);
        return { error: error.message };
      }
    });

    console.log('Chart response status:', chartResponse ? 'Received' : 'None');

    if (!chartResponse || chartResponse.error || !chartResponse.success) {
      throw new Error(`Failed to generate chart via API: ${chartResponse?.error || 'Unknown error'}`);
    }

    console.log('✅ Chart generated successfully');
    console.log(`  Ascendant: ${chartResponse.data?.rasiChart?.ascendant?.sign || 'Unknown'}`);

    // Navigate to the app and inject the chart data
    console.log('📱 Navigating to app...');
    await page.goto('http://localhost:3002', { waitUntil: 'networkidle2' });

    // Inject chart data into session storage and navigate
    await page.evaluate((chartData) => {
      // Save to session storage as the app expects
      sessionStorage.setItem('vedicChartData', JSON.stringify({
        chart: chartData.data?.rasiChart || chartData.rasiChart,
        navamsa: chartData.data?.navamsaChart || chartData.navamsaChart,
        analysis: chartData.data?.analysis || chartData.analysis,
        metadata: chartData.metadata,
        success: chartData.success
      }));

      // Navigate to chart page
      window.location.href = '/chart';
    }, chartResponse);

    // Wait for navigation and chart to load
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    console.log('📍 Current URL:', page.url());

    // Wait for chart SVG
    console.log('⏳ Waiting for chart SVG...');
    await page.waitForSelector('svg[width="500"]', { timeout: 10000 });
    console.log('✅ Chart SVG found!');

    // Take screenshot
    const screenshotDir = path.join(__dirname, '..', 'logs', 'rasi-test-screenshots');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotPath = path.join(screenshotDir, `rasi-direct-${timestamp}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`📸 Screenshot saved: ${screenshotPath}`);

    // Analyze rasi positions
    const rasiAnalysis = await page.evaluate(() => {
      const svg = document.querySelector('svg[width="500"]');
      if (!svg) return { found: false };

      const texts = svg.querySelectorAll('text');
      const rasiNumbers = [];

      texts.forEach(text => {
        const content = text.textContent.trim();
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
        rasiCount: rasiNumbers.length,
        rasiNumbers: rasiNumbers.sort((a, b) => a.rasi - b.rasi)
      };
    });

    console.log('\n📊 Rasi Analysis:');
    if (rasiAnalysis.found && rasiAnalysis.rasiCount === 12) {
      console.log('✅ All 12 rasi numbers found!');
      console.log('\n📍 Rasi Positions:');
      rasiAnalysis.rasiNumbers.forEach(r => {
        console.log(`  Rasi ${r.rasi.toString().padStart(2)}: (${r.x}, ${r.y})`);
      });
    } else {
      console.log(`⚠️  Only ${rasiAnalysis.rasiCount} rasi numbers found (expected 12)`);
    }

    // Keep browser open for 5 seconds to view
    console.log('\n👁️  Keeping browser open for viewing...');
    await new Promise(resolve => setTimeout(resolve, 5000));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run test
testRasiPositions()
  .then(() => console.log('\n✅ Test completed'))
  .catch(err => console.error('\n❌ Test failed:', err));
