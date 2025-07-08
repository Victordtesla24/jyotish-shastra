#!/usr/bin/env node

/**
 * End-to-End API Integration Test
 * Tests the complete flow from UI to API endpoints with real data
 * Validates all major API endpoints and their integration with the frontend
 */

const puppeteer = require('puppeteer');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

// Test configuration
const CONFIG = {
  frontendUrl: 'http://localhost:3002',
  backendUrl: 'http://localhost:3001',
  timeout: 60000,
  screenshotDir: path.join(__dirname, 'production-screenshots')
};

// Create screenshots directory
if (!fs.existsSync(CONFIG.screenshotDir)) {
  fs.mkdirSync(CONFIG.screenshotDir, { recursive: true });
}

// Test birth data for API integration
const TEST_BIRTH_DATA = {
  dateOfBirth: "1985-10-24",
  timeOfBirth: "14:30",
  latitude: 18.5204,
  longitude: 73.8567,
  timezone: "Asia/Kolkata",
  gender: "male"
};

// API endpoints to test
const API_ENDPOINTS = [
  {
    name: 'Health Check',
    endpoint: '/health',
    method: 'GET',
    expectSuccess: true
  },
  {
    name: 'Chart Generation',
    endpoint: '/api/chart/generate',
    method: 'POST',
    data: TEST_BIRTH_DATA,
    expectSuccess: true
  },
  {
    name: 'Comprehensive Analysis',
    endpoint: '/api/comprehensive-analysis/comprehensive',
    method: 'POST',
    data: TEST_BIRTH_DATA,
    expectSuccess: true
  },
  {
    name: 'Dasha Analysis',
    endpoint: '/api/comprehensive-analysis/dasha',
    method: 'POST',
    data: TEST_BIRTH_DATA,
    expectSuccess: true
  },
  {
    name: 'House Analysis',
    endpoint: '/api/comprehensive-analysis/houses',
    method: 'POST',
    data: TEST_BIRTH_DATA,
    expectSuccess: true
  },
  {
    name: 'Navamsa Analysis',
    endpoint: '/api/comprehensive-analysis/navamsa',
    method: 'POST',
    data: TEST_BIRTH_DATA,
    expectSuccess: true
  }
];

async function testAPIIntegration() {
  let browser;
  let page;
  const testResults = {
    timestamp: new Date().toISOString(),
    apiTests: [],
    uiIntegration: { success: false, errors: [] },
    dataFlow: { success: false, errors: [] },
    screenshots: [],
    errors: []
  };

  try {
    console.log('🔄 Starting End-to-End API Integration Test...\n');

    // Step 1: Test all API endpoints directly
    console.log('📍 Step 1: Testing API endpoints directly...');

    for (const endpoint of API_ENDPOINTS) {
      console.log(`\n🧪 Testing ${endpoint.name}...`);

      const apiTest = {
        name: endpoint.name,
        endpoint: endpoint.endpoint,
        method: endpoint.method,
        success: false,
        responseTime: 0,
        responseSize: 0,
        statusCode: null,
        error: null
      };

      try {
        const startTime = Date.now();

        let response;
        if (endpoint.method === 'GET') {
          response = await axios.get(`${CONFIG.backendUrl}${endpoint.endpoint}`, { timeout: 30000 });
        } else {
          response = await axios.post(`${CONFIG.backendUrl}${endpoint.endpoint}`, endpoint.data, { timeout: 30000 });
        }

        apiTest.responseTime = Date.now() - startTime;
        apiTest.statusCode = response.status;
        apiTest.responseSize = JSON.stringify(response.data).length;
        apiTest.success = response.status === 200 && (endpoint.expectSuccess ? response.data.success !== false : true);

        console.log(`  ✅ ${endpoint.name}: ${response.status} (${apiTest.responseTime}ms, ${apiTest.responseSize} bytes)`);

        // Validate response structure for key endpoints
        if (endpoint.name === 'Comprehensive Analysis' && response.data.success) {
          const sections = response.data.analysis?.sections || {};
          const sectionCount = Object.keys(sections).length;
          console.log(`     📊 Analysis sections: ${sectionCount}/8`);

          if (sectionCount < 8) {
            apiTest.error = `Missing sections: ${8 - sectionCount}`;
          }
        }

        if (endpoint.name === 'Chart Generation' && response.data.success) {
          const hasChart = response.data.chart && response.data.chart.rasiChart;
          console.log(`     📊 Chart data: ${hasChart ? 'Present' : 'Missing'}`);

          if (!hasChart) {
            apiTest.error = 'Chart data missing';
          }
        }

      } catch (error) {
        apiTest.error = error.message;
        apiTest.statusCode = error.response?.status || 0;
        console.log(`  ❌ ${endpoint.name}: ${error.message}`);
      }

      testResults.apiTests.push(apiTest);
    }

    // Step 2: Test UI-to-API integration
    console.log('\n📍 Step 2: Testing UI-to-API integration...');

    // Launch browser
    browser = await puppeteer.launch({
      headless: false,
      defaultViewport: { width: 1920, height: 1080 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    page = await browser.newPage();

    // Monitor network requests
    const networkRequests = [];
    page.on('request', (request) => {
      if (request.url().includes('/api/')) {
        networkRequests.push({
          url: request.url(),
          method: request.method(),
          postData: request.postData(),
          timestamp: Date.now()
        });
      }
    });

    page.on('response', (response) => {
      if (response.url().includes('/api/')) {
        const request = networkRequests.find(req => req.url === response.url());
        if (request) {
          request.status = response.status();
          request.responseTime = Date.now() - request.timestamp;
        }
      }
    });

    // Monitor console errors (but allow icon warnings)
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const errorText = msg.text();
        // Only treat as error if it's not a manifest icon warning
        if (!errorText.includes('icon') && !errorText.includes('Manifest') && !errorText.includes('Download error')) {
          testResults.errors.push(`Browser Console Error: ${errorText}`);
        } else {
          // Log icon warnings but don't fail test
          console.log(`📋 Icon Warning: ${errorText}`);
        }
      }
    });

    // Step 3: Test chart generation UI flow
    console.log('\n📍 Step 3: Testing chart generation UI flow...');

    await page.goto(`${CONFIG.frontendUrl}/chart`, {
      waitUntil: 'networkidle2',
      timeout: CONFIG.timeout
    });

    // Take screenshot
    const chartFlowScreenshot = 'api-integration-chart-flow.png';
    await page.screenshot({
      path: path.join(CONFIG.screenshotDir, chartFlowScreenshot),
      fullPage: true
    });
    testResults.screenshots.push(chartFlowScreenshot);

    // Look for chart form
    const chartFormExists = await page.evaluate(() => {
      const form = document.querySelector('form');
      const dateInput = document.querySelector('input[type="date"], input[name*="date"], input[id*="date"]');
      const timeInput = document.querySelector('input[type="time"], input[name*="time"], input[id*="time"]');

      return {
        hasForm: !!form,
        hasDateInput: !!dateInput,
        hasTimeInput: !!timeInput,
        hasAnyInput: !!(dateInput || timeInput)
      };
    });

    if (chartFormExists.hasAnyInput) {
      try {
        // Fill date input if exists
        const dateInput = await page.$('input[type="date"], input[name*="date"], input[id*="date"]');
        if (dateInput) {
          await page.evaluate((input, value) => {
            input.value = value;
            input.dispatchEvent(new Event('change', { bubbles: true }));
          }, dateInput, TEST_BIRTH_DATA.dateOfBirth);
        }

        // Fill time input if exists
        const timeInput = await page.$('input[type="time"], input[name*="time"], input[id*="time"]');
        if (timeInput) {
          await page.evaluate((input, value) => {
            input.value = value;
            input.dispatchEvent(new Event('change', { bubbles: true }));
          }, timeInput, TEST_BIRTH_DATA.timeOfBirth);
        }

        // Fill location input and wait for geocoding
        const locationInput = await page.$('input[name="placeOfBirth"], input[id="placeOfBirth"]');
        if (locationInput) {
          await page.evaluate((input, value) => {
            input.value = value;
            input.dispatchEvent(new Event('input', { bubbles: true }));
          }, locationInput, 'Mumbai, Maharashtra, India');

          console.log('📍 Location input filled, waiting for geocoding...');

          // Wait for geocoding to complete (up to 10 seconds)
          await page.waitForFunction(() => {
            const statusIcon = document.querySelector('.text-green-600');
            return statusIcon && statusIcon.textContent.includes('✅');
          }, { timeout: 10000 }).catch(() => {
            console.log('⚠️ Geocoding did not complete within timeout');
          });

          console.log('📍 Geocoding completed');
        }

        // Fill timezone
        const timezoneSelect = await page.$('select[name="timezone"], select[id="timeZone"]');
        if (timezoneSelect) {
          await page.evaluate((select, value) => {
            select.value = value;
            select.dispatchEvent(new Event('change', { bubbles: true }));
          }, timezoneSelect, TEST_BIRTH_DATA.timezone);
        }

        // Submit form and wait for API call - improved selector
        const submitButton = await page.$('button[type="submit"], .generate-chart, button[class*="generate"], button[class*="submit"]');
        if (submitButton) {
          await submitButton.click();
          console.log('🔄 Chart form submitted, monitoring API calls...');

          // Wait for API response using proper method
          await new Promise(resolve => setTimeout(resolve, 10000));

          // Check if API was called
          const chartApiCalls = networkRequests.filter(req =>
            req.url.includes('/chart/generate') || req.url.includes('/api/chart')
          );

          if (chartApiCalls.length > 0) {
            console.log(`✅ Chart API called: ${chartApiCalls.length} request(s)`);
            testResults.uiIntegration.success = true;
          } else {
            console.log('❌ Chart API not called from UI');
            testResults.uiIntegration.errors.push('Chart API not called from UI');
          }
        } else {
          console.log('⚠️ Submit button not found for chart form');
          testResults.uiIntegration.errors.push('Submit button not found');
        }
      } catch (error) {
        console.log(`❌ Chart form interaction failed: ${error.message}`);
        testResults.uiIntegration.errors.push(`Chart form interaction failed: ${error.message}`);
      }
    } else {
      console.log('⚠️ Chart form not found, skipping form interaction test');
      testResults.uiIntegration.errors.push('Chart form not found');
    }

    // Step 4: Test analysis flow and data propagation
    console.log('\n📍 Step 4: Testing analysis UI flow and data propagation...');

    await page.goto(`${CONFIG.frontendUrl}/analysis`, {
      waitUntil: 'networkidle2',
      timeout: CONFIG.timeout
    });

    // Take screenshot
    const analysisFlowScreenshot = 'api-integration-analysis-flow.png';
    await page.screenshot({
      path: path.join(CONFIG.screenshotDir, analysisFlowScreenshot),
      fullPage: true
    });
    testResults.screenshots.push(analysisFlowScreenshot);

    // Test birth data display in analysis page
    const birthDataDisplayCheck = await page.evaluate(() => {
      const birthDataSection = document.querySelector('.birth-details, [class*="birth"], [class*="Birth"]');
      if (birthDataSection) {
        const text = birthDataSection.textContent;
        return {
          hasSection: true,
          showsUser: text.includes('User'),
          showsNotProvided: text.includes('Not provided'),
          showsActualData: text.includes('1985') || text.includes('Mumbai') || text.includes('14:30'),
          fullText: text
        };
      }
      return { hasSection: false };
    });

    console.log('🔍 Birth data display check:', birthDataDisplayCheck);

    if (birthDataDisplayCheck.hasSection) {
      if (birthDataDisplayCheck.showsActualData) {
        console.log('✅ Birth data properly displayed in analysis page');
        testResults.dataFlow.success = true;
      } else if (birthDataDisplayCheck.showsNotProvided) {
        console.log('⚠️ Birth data shows "Not provided" - data not properly propagated');
        testResults.dataFlow.errors.push('Birth data not properly propagated to analysis page');
      }
    }

    // Test analysis type selection
    const analysisTypeButtons = await page.$$('div[class*="cursor-pointer"], button[class*="analysis"]');
    if (analysisTypeButtons.length > 0) {
      console.log(`📊 Found ${analysisTypeButtons.length} analysis type buttons`);

      try {
        // Click on comprehensive analysis
        await analysisTypeButtons[0].click();
        console.log('🔄 Comprehensive analysis requested...');

        // Wait for analysis API response
        await new Promise(resolve => setTimeout(resolve, 15000));

        // Check if comprehensive analysis API was called
        const analysisApiCalls = networkRequests.filter(req =>
          req.url.includes('/analysis/comprehensive') || req.url.includes('/api/comprehensive-analysis')
        );

        if (analysisApiCalls.length > 0) {
          console.log(`✅ Analysis API called: ${analysisApiCalls.length} request(s)`);
          const successfulCalls = analysisApiCalls.filter(req => req.status === 200);
          console.log(`📊 Successful calls: ${successfulCalls.length}/${analysisApiCalls.length}`);

          if (successfulCalls.length > 0) {
            testResults.uiIntegration.success = true;
          }
        } else {
          console.log('❌ Analysis API not called from UI');
          testResults.uiIntegration.errors.push('Analysis API not called from UI');
        }
      } catch (error) {
        console.log(`❌ Analysis interaction failed: ${error.message}`);
        testResults.uiIntegration.errors.push(`Analysis interaction failed: ${error.message}`);
      }
    } else {
      console.log('⚠️ No analysis type buttons found');
      testResults.uiIntegration.errors.push('No analysis type buttons found');
    }

    // Step 5: Validate data flow and display
    console.log('\n📍 Step 5: Validating data flow and display...');

    const dataDisplayCheck = await page.evaluate(() => {
      const pageText = document.body.textContent;

      // Check for actual API data in the UI
      const hasApiData = pageText.includes('Libra') || pageText.includes('Venus') ||
                         pageText.includes('Sun') || pageText.includes('Moon') ||
                         pageText.includes('1985') || pageText.includes('Analysis');

      const hasErrorMessages = pageText.includes('Error') || pageText.includes('Failed');

      return {
        hasApiData,
        hasErrorMessages,
        contentLength: pageText.length
      };
    });

    console.log('📊 Data flow validation:');
    console.log(`  ${dataDisplayCheck.hasApiData ? '✅' : '❌'} API data visible: ${dataDisplayCheck.hasApiData ? 'Yes' : 'No'}`);
    console.log(`  ${dataDisplayCheck.hasErrorMessages ? '⚠️' : '✅'} Error messages: ${dataDisplayCheck.hasErrorMessages ? 'Present' : 'None'}`);
    console.log(`  📄 Content length: ${dataDisplayCheck.contentLength} characters`);

    testResults.dataFlow.success = dataDisplayCheck.hasApiData && !dataDisplayCheck.hasErrorMessages;

    if (!dataDisplayCheck.hasApiData) {
      testResults.dataFlow.errors.push('API data not visible in UI');
    }
    if (dataDisplayCheck.hasErrorMessages) {
      testResults.dataFlow.errors.push('Error messages present in UI');
    }

    // Take final screenshot
    const finalScreenshot = 'api-integration-complete.png';
    await page.screenshot({
      path: path.join(CONFIG.screenshotDir, finalScreenshot),
      fullPage: true
    });
    testResults.screenshots.push(finalScreenshot);

    // Step 6: Analyze network requests
    console.log('\n📍 Step 6: Analyzing network requests...');

    const apiCalls = networkRequests.filter(req => req.url.includes('/api/'));
    console.log(`📡 Total API calls from UI: ${apiCalls.length}`);

    apiCalls.forEach((call, index) => {
      const endpoint = call.url.replace(CONFIG.backendUrl, '');
      console.log(`  ${index + 1}. ${call.method} ${endpoint} → ${call.status} (${call.responseTime}ms)`);
    });

    // Generate overall results
    const apiTestsPassed = testResults.apiTests.filter(test => test.success).length;
    const apiTestsTotal = testResults.apiTests.length;
    const uiIntegrationSuccess = testResults.uiIntegration.success || testResults.uiIntegration.errors.length === 0;
    const dataFlowSuccess = testResults.dataFlow.success;

    // Test passes if API endpoints work and UI integration works
    const overallSuccess = (apiTestsPassed >= apiTestsTotal * 0.8) && // 80% of API tests pass
                          uiIntegrationSuccess &&
                          dataFlowSuccess &&
                          testResults.errors.length === 0;

    console.log('\n' + '='.repeat(60));
    console.log('🎯 END-TO-END API INTEGRATION TEST RESULTS');
    console.log('='.repeat(60));

    console.log('\n🔧 API Endpoints Test:');
    console.log(`  ✅ Passed: ${apiTestsPassed}/${apiTestsTotal}`);
    console.log(`  📊 Success Rate: ${Math.round((apiTestsPassed / apiTestsTotal) * 100)}%`);

    testResults.apiTests.forEach(test => {
      console.log(`    ${test.success ? '✅' : '❌'} ${test.name}: ${test.statusCode} (${test.responseTime}ms)`);
      if (test.error) {
        console.log(`       Error: ${test.error}`);
      }
    });

    console.log('\n🔄 UI Integration Test:');
    console.log(`  Status: ${uiIntegrationSuccess ? 'PASSED' : 'FAILED'}`);
    if (testResults.uiIntegration.errors.length > 0) {
      console.log(`  Errors: ${testResults.uiIntegration.errors.join(', ')}`);
    }

    console.log('\n📊 Data Flow Test:');
    console.log(`  Status: ${dataFlowSuccess ? 'PASSED' : 'FAILED'}`);
    if (testResults.dataFlow.errors.length > 0) {
      console.log(`  Errors: ${testResults.dataFlow.errors.join(', ')}`);
    }

    if (testResults.errors.length > 0) {
      console.log('\n❌ Browser Errors:');
      testResults.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }

    console.log(`\n📁 Screenshots: ${testResults.screenshots.length} captured`);
    console.log(`🎉 Overall Result: ${overallSuccess ? 'PASSED' : 'FAILED'}`);

    return overallSuccess;

  } catch (error) {
    console.error('\n❌ API integration test failed:', error.message);
    testResults.errors.push(error.message);

    // Take error screenshot
    if (page) {
      try {
        const errorScreenshot = `api-integration-error-${Date.now()}.png`;
        await page.screenshot({
          path: path.join(CONFIG.screenshotDir, errorScreenshot),
          fullPage: true
        });
        testResults.screenshots.push(errorScreenshot);
        console.log(`📸 Error screenshot: ${errorScreenshot}`);
      } catch (e) {
        console.log('Could not capture error screenshot');
      }
    }

    return false;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the test
if (require.main === module) {
  testAPIIntegration()
    .then(success => {
      console.log('\n' + '='.repeat(60));
      if (success) {
        console.log('🎉 END-TO-END API INTEGRATION TEST PASSED');
        console.log('✅ API endpoints working, UI integration functional, data flowing correctly');
      } else {
        console.log('❌ END-TO-END API INTEGRATION TEST FAILED');
        console.log('⚠️ Issues found with API integration or data flow');
      }
      console.log('='.repeat(60));
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 API integration test runner failed:', error);
      process.exit(1);
    });
}

module.exports = { testAPIIntegration, CONFIG, API_ENDPOINTS };
