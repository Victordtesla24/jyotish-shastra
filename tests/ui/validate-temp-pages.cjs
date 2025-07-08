const puppeteer = require('puppeteer');

async function validateTempPages() {
  console.log('🧪 TEMP PAGES VALIDATION - Starting browser-based API flow test...');

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: false, // Show browser for debugging
      devtools: true,  // Open DevTools automatically
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Enable console logging
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      console.log(`🌐 Browser ${type.toUpperCase()}: ${text}`);
    });

    // Enable request/response monitoring
    await page.setRequestInterception(true);
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        console.log(`📡 API REQUEST: ${request.method()} ${request.url()}`);
        if (request.postData()) {
          console.log(`📋 Payload: ${request.postData()}`);
        }
      }
      request.continue();
    });

    page.on('response', response => {
      if (response.url().includes('/api/')) {
        console.log(`📈 API RESPONSE: ${response.status()} ${response.url()}`);
      }
    });

    console.log('📍 Step 1: Navigate to temp home page...');
    await page.goto('http://localhost:3002/temp-home', { waitUntil: 'networkidle0' });

    console.log('📍 Step 2: Navigate to temp birth chart page...');
    await page.click('button');
    await page.waitForSelector('h1', { timeout: 10000 });

    const pageTitle = await page.$eval('h1', el => el.textContent);
    console.log(`✅ Reached: ${pageTitle}`);

    console.log('📍 Step 3: Generate chart with test payload...');
    await page.click('button'); // Click the Generate Chart button (first button on the page)

    // Wait for API response
    console.log('⏳ Waiting for chart generation...');
    await page.waitForFunction(
      () => {
        const logs = document.querySelectorAll('*');
        for (let log of logs) {
          if (log.textContent && log.textContent.includes('Chart Generated Successfully')) {
            return true;
          }
        }
        return false;
      },
      { timeout: 30000 }
    );

    console.log('✅ Chart generation completed!');

        console.log('📍 Step 4: Navigate to analysis page...');
    const analysisButton = await page.waitForFunction(
      () => {
        const buttons = document.querySelectorAll('button');
        for (let button of buttons) {
          if (button.textContent.includes('View Analysis')) {
            return button;
          }
        }
        return null;
      },
      { timeout: 5000 }
    );
    await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      for (let button of buttons) {
        if (button.textContent.includes('View Analysis')) {
          button.click();
          return;
        }
      }
    });

    await page.waitForSelector('h1', { timeout: 10000 });
    const analysisTitle = await page.$eval('h1', el => el.textContent);
    console.log(`✅ Reached: ${analysisTitle}`);

    console.log('⏳ Waiting for analysis to complete...');
    await page.waitForFunction(
      () => {
        const content = document.body.textContent;
        return content.includes('Analysis Generated Successfully');
      },
      { timeout: 30000 }
    );

    console.log('✅ Analysis completed!');

    console.log('📍 Step 5: Navigate to comprehensive analysis...');
    await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      for (let button of buttons) {
        if (button.textContent.includes('View Comprehensive Report')) {
          button.click();
          return;
        }
      }
    });

    await page.waitForSelector('h1', { timeout: 10000 });
    const finalTitle = await page.$eval('h1', el => el.textContent);
    console.log(`✅ Reached: ${finalTitle}`);

    // Validate data is displayed
    const hasChartData = await page.evaluate(() => {
      return document.body.textContent.includes('Birth Chart Summary');
    });

    const hasAnalysisData = await page.evaluate(() => {
      return document.body.textContent.includes('Complete Analysis Report');
    });

    console.log('\n🎯 VALIDATION RESULTS:');
    console.log('========================');
    console.log(`✅ Navigation Flow: PASSED`);
    console.log(`✅ Chart Generation API: PASSED`);
    console.log(`✅ Analysis API: PASSED`);
    console.log(`${hasChartData ? '✅' : '❌'} Chart Data Display: ${hasChartData ? 'PASSED' : 'FAILED'}`);
    console.log(`${hasAnalysisData ? '✅' : '❌'} Analysis Data Display: ${hasAnalysisData ? 'PASSED' : 'FAILED'}`);

    if (hasChartData && hasAnalysisData) {
      console.log('\n🎉 ALL TESTS PASSED! The temporary pages validate the complete API flow works correctly.');
      console.log('🔧 Issue isolated: The problem is likely in the production form components, not the API integration.');
    } else {
      console.log('\n❌ Some data display issues detected. Checking browser console for details...');
    }

    // Keep browser open for manual inspection
    console.log('\n🔍 Browser kept open for manual inspection. Press Ctrl+C to close.');
    await new Promise(resolve => setTimeout(resolve, 60000)); // Wait 1 minute

  } catch (error) {
    console.error('❌ Validation failed:', error.message);

    // Enhanced error diagnosis
    if (error.message.includes('net::ERR_CONNECTION_REFUSED')) {
      console.log('💡 Diagnosis: Frontend server not running. Please start with: cd client && npm start');
    } else if (error.message.includes('timeout')) {
      console.log('💡 Diagnosis: API call timeout. Check if backend server is running on port 3001');
    } else {
      console.log('💡 Diagnosis: Unexpected error. Check browser console for details.');
    }
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run validation
validateTempPages().catch(console.error);
