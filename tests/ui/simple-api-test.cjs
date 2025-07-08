const puppeteer = require('puppeteer');

async function testAPIIntegration() {
  console.log('🧪 SIMPLE API TEST - Testing browser-based API calls...');

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Monitor API calls
    await page.setRequestInterception(true);
    const apiCalls = [];

    page.on('request', request => {
      if (request.url().includes('/api/')) {
        console.log(`📡 API REQUEST: ${request.method()} ${request.url()}`);
        apiCalls.push({ method: request.method(), url: request.url() });
      }
      request.continue();
    });

    page.on('response', response => {
      if (response.url().includes('/api/')) {
        console.log(`📈 API RESPONSE: ${response.status()} ${response.url()}`);
      }
    });

    console.log('📍 Step 1: Navigate to temp birth chart page...');
    await page.goto('http://localhost:3002/temp-birth-chart', { waitUntil: 'networkidle0' });

    console.log('📍 Step 2: Execute chart generation API call via browser...');

    // Execute the API call directly in browser context
    const result = await page.evaluate(async () => {
      try {
        // Create axios instance like the temp page
        const response = await fetch('http://localhost:3001/api/v1/chart/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            "dateOfBirth": "1997-12-18",
            "timeOfBirth": "02:30",
            "latitude": 32.4909,
            "longitude": 74.5361,
            "timezone": "Asia/Karachi",
            "gender": "male"
          })
        });

        console.log('🌐 Browser fetch response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          return { success: false, error: `HTTP ${response.status}: ${errorText}` };
        }

        const data = await response.json();
        console.log('🌐 Browser fetch success, data size:', JSON.stringify(data).length);

        return { success: true, data: data };

      } catch (error) {
        console.error('🌐 Browser fetch error:', error);
        return { success: false, error: error.message };
      }
    });

    console.log('\n📊 TEST RESULTS:');
    console.log('==================');

    if (result.success) {
      console.log('✅ Browser-based fetch API call: PASSED');
      console.log(`✅ Chart ID received: ${result.data?.data?.chartId}`);
      console.log(`✅ Data size: ${JSON.stringify(result.data).length} characters`);

      // Test analysis API call
      console.log('\n📍 Step 3: Testing analysis API call...');

      const analysisResult = await page.evaluate(async (chartId) => {
        try {
          const response = await fetch('http://localhost:3001/api/v1/analysis/comprehensive', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ chartId })
          });

          if (!response.ok) {
            const errorText = await response.text();
            return { success: false, error: `HTTP ${response.status}: ${errorText}` };
          }

          const data = await response.json();
          return { success: true, data: data };

        } catch (error) {
          return { success: false, error: error.message };
        }
      }, result.data.data.chartId);

      if (analysisResult.success) {
        console.log('✅ Browser-based analysis API call: PASSED');
        console.log(`✅ Analysis ID: ${analysisResult.data?.data?.analysisId}`);
      } else {
        console.log('❌ Browser-based analysis API call: FAILED');
        console.log(`❌ Error: ${analysisResult.error}`);
      }

    } else {
      console.log('❌ Browser-based fetch API call: FAILED');
      console.log(`❌ Error: ${result.error}`);
    }

    console.log(`\n📡 Total API calls made: ${apiCalls.length}`);
    apiCalls.forEach(call => console.log(`   ${call.method} ${call.url}`));

    if (result.success) {
      console.log('\n🎉 SUCCESS: Browser-based API calls work correctly!');
      console.log('🔧 This confirms the API integration is functional.');
      console.log('💡 Any production issues are likely in form validation or UI components.');
    } else {
      console.log('\n❌ FAILURE: Browser environment has API integration issues');
      console.log('🔧 This suggests CORS, network, or browser-specific problems.');
    }

    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds to review

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

testAPIIntegration().catch(console.error);
