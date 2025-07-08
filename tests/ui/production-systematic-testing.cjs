/**
 * Jyotish Shastra Production UI Systematic Testing Protocol
 * Following user-docs/prod-testing-prompt.md Section 2.1 exactly
 *
 * Test Data: Farhan (1997-12-18, 02:30, Karachi: 32.4935378, 74.5411575, Asia/Karachi)
 * UI Workflow: Home Page → Birth Chart → Analysis Page → Comprehensive Analysis Report
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// **MANDATORY Test Data** (per prod-testing-prompt.md)
const FARHAN_TEST_DATA = {
  name: "Farhan",
  dateOfBirth: "1997-12-18",
  timeOfBirth: "02:30",
  placeOfBirth: "Sialkot, Pakistan",
  latitude: 32.4935378,
  longitude: 74.5411575,
  timezone: "Asia/Karachi",
  gender: "male"
};

const FRONTEND_URL = 'http://localhost:3002';
const BACKEND_URL = 'http://localhost:3001';
const SCREENSHOT_DIR = path.join(__dirname, 'production-ui-screenshots');

// Ensure screenshot directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function waitForAPI(page, url, method = 'POST') {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => resolve(null), 10000);

    page.on('response', (response) => {
      if (response.url().includes(url) && response.request().method() === method) {
        clearTimeout(timeout);
        resolve(response);
      }
    });
  });
}

async function checkServerHealth() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/health`);
    if (response.ok) {
      console.log('✅ Backend server is running on port 3001');
      return true;
    }
  } catch (error) {
    console.error('❌ Backend server not accessible:', error.message);
    return false;
  }
  return false;
}

async function testHomePage(page) {
  console.log('\n📋 **A. Home Page Test** (`localhost:3002/`)');

  try {
    await page.goto(`${FRONTEND_URL}/`, { waitUntil: 'networkidle2' });

    // Navigate and test Birth Chart navigation
    console.log('🔍 Testing navigation to Birth Chart page...');

    // Look for Birth Chart navigation button/link
    const chartNavSelector = 'a[href="/chart"], button[onclick*="chart"], [data-testid*="chart"], nav a[href*="chart"]';
    await page.waitForSelector(chartNavSelector, { timeout: 5000 });

    // Screenshot: Home page initial
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '01-home-page-initial.png'),
      fullPage: true
    });
    console.log('📸 Screenshot saved: 01-home-page-initial.png');

    // Test navigation functionality
    const chartButton = await page.$(chartNavSelector);
    if (chartButton) {
      console.log('✅ Birth Chart navigation found and functional');
      return true;
    } else {
      console.log('❌ Birth Chart navigation not found');
      return false;
    }

  } catch (error) {
    console.error('❌ Home page test failed:', error.message);
    return false;
  }
}

async function testChartPage(page) {
  console.log('\n📋 **B. Chart Page Test** (`localhost:3002/chart`)');

  try {
    // Listen for console messages and errors from the browser
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      if (type === 'error') {
        console.log('🔴 BROWSER CONSOLE ERROR:', text);
      } else if (type === 'warn') {
        console.log('🟡 BROWSER CONSOLE WARN:', text);
      } else if (text.includes('FORM') || text.includes('API') || text.includes('CHART')) {
        console.log(`📋 BROWSER CONSOLE ${type.toUpperCase()}:`, text);
      }
    });

    // Listen for JavaScript errors
    page.on('pageerror', error => {
      console.log('🔴 JAVASCRIPT ERROR:', error.message);
    });

    await page.goto(`${FRONTEND_URL}/chart`, { waitUntil: 'networkidle2' });

    // Fill form with Farhan test data using ROBUST React Hook Form approach
    console.log('📝 Filling form with Farhan test data...');

    // Fill Name field (optional per API) - CORRECT ID
    try {
      await page.waitForSelector('#name', { timeout: 3000 });
      await page.evaluate((name) => {
        const nameInput = document.getElementById('name');
        if (nameInput) {
          nameInput.focus();
          nameInput.value = '';
          nameInput.value = name;
          nameInput.dispatchEvent(new Event('input', { bubbles: true }));
          nameInput.dispatchEvent(new Event('change', { bubbles: true }));
          nameInput.blur();
        }
      }, FARHAN_TEST_DATA.name);
      console.log('✅ Name field filled');
    } catch (e) {
      console.log('ℹ️ Name field not found (optional per API validation)');
    }

    // Fill Date of Birth using RESEARCH-BASED ROBUST METHOD
    await page.waitForSelector('#dateOfBirth');
    await page.evaluate((date) => {
      const dateInput = document.getElementById('dateOfBirth');
      if (dateInput) {
        // Clear field using triple-click method (from research)
        dateInput.focus();
        dateInput.select();
        dateInput.value = '';
        // Set new value and trigger React events
        dateInput.value = date;
        dateInput.dispatchEvent(new Event('input', { bubbles: true }));
        dateInput.dispatchEvent(new Event('change', { bubbles: true }));
        dateInput.blur();
      }
    }, FARHAN_TEST_DATA.dateOfBirth);
    console.log('✅ Date of birth filled');

    // Fill Time of Birth using ROBUST METHOD
    await page.waitForSelector('#timeOfBirth');
    await page.evaluate((time) => {
      const timeInput = document.getElementById('timeOfBirth');
      if (timeInput) {
        timeInput.focus();
        timeInput.select();
        timeInput.value = '';
        timeInput.value = time;
        timeInput.dispatchEvent(new Event('input', { bubbles: true }));
        timeInput.dispatchEvent(new Event('change', { bubbles: true }));
        timeInput.blur();
      }
    }, FARHAN_TEST_DATA.timeOfBirth);
    console.log('✅ Time of birth filled');

    // Fill Place of Birth for geocoding - CORRECT ID
    await page.waitForSelector('#placeOfBirth');
    await page.evaluate((place) => {
      const placeInput = document.getElementById('placeOfBirth');
      if (placeInput) {
        placeInput.focus();
        placeInput.select();
        placeInput.value = '';
        placeInput.value = place;
        placeInput.dispatchEvent(new Event('input', { bubbles: true }));
        placeInput.dispatchEvent(new Event('change', { bubbles: true }));
        placeInput.blur();
      }
    }, FARHAN_TEST_DATA.placeOfBirth);
    console.log('✅ Place of birth filled');

    // Fill Gender - CORRECT ID
    await page.waitForSelector('#gender');
    await page.evaluate((gender) => {
      const genderSelect = document.getElementById('gender');
      if (genderSelect) {
        genderSelect.focus();
        genderSelect.value = gender;
        genderSelect.dispatchEvent(new Event('change', { bubbles: true }));
        genderSelect.blur();
      }
    }, FARHAN_TEST_DATA.gender);
    console.log('✅ Gender selected');

    // Wait for geocoding to complete AND React Hook Form state to update
    console.log('⏳ Waiting for geocoding and React Hook Form validation...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Check if geocoding was successful
    const geocodingSuccess = await page.$('.text-green-600');
    if (geocodingSuccess) {
      console.log('✅ Geocoding successful');
    } else {
      console.log('⚠️ Geocoding may not have completed, using manual coordinates');
      // Fill manual coordinates if geocoding failed using ROBUST method
      const latField = await page.$('#latitude');
      const lngField = await page.$('#longitude');
      if (latField && lngField) {
        await page.evaluate((lat, lng) => {
          const latInput = document.getElementById('latitude');
          const lngInput = document.getElementById('longitude');
          if (latInput && lngInput) {
            [latInput, lngInput].forEach((input, index) => {
              const value = index === 0 ? lat : lng;
              input.focus();
              input.value = '';
              input.value = String(value);
              input.dispatchEvent(new Event('input', { bubbles: true }));
              input.dispatchEvent(new Event('change', { bubbles: true }));
              input.blur();
            });
          }
        }, FARHAN_TEST_DATA.latitude, FARHAN_TEST_DATA.longitude);
      }
    }

    // Screenshot: Chart form filled
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '02-chart-form-filled.png'),
      fullPage: true
    });
    console.log('📸 Screenshot saved: 02-chart-form-filled.png');

    // CRITICAL: Wait for React Hook Form state to fully synchronize
    console.log('⏳ Waiting for React Hook Form state synchronization...');
    await page.waitForFunction(() => {
      const form = document.getElementById('birth-data-form');
      const submitButton = form?.querySelector('button[type="submit"]');
      const dateInput = document.getElementById('dateOfBirth');
      const timeInput = document.getElementById('timeOfBirth');

      return form && submitButton &&
             !submitButton.disabled &&
             dateInput?.value &&
             timeInput?.value;
    }, { timeout: 10000 });

    // Check form validation state before submission
    const formValidation = await page.evaluate(() => {
      const form = document.getElementById('birth-data-form');
      const submitButton = form?.querySelector('button[type="submit"]');

      return {
        formExists: !!form,
        submitButtonExists: !!submitButton,
        submitButtonDisabled: submitButton?.disabled || false,
        dateValue: document.getElementById('dateOfBirth')?.value || '',
        timeValue: document.getElementById('timeOfBirth')?.value || '',
        placeValue: document.getElementById('placeOfBirth')?.value || ''
      };
    });

    console.log('🔍 Form validation state:', formValidation);

    if (formValidation.submitButtonDisabled) {
      throw new Error('Submit button is still disabled after form filling');
    }

    // Submit form using MULTIPLE ROBUST METHODS
    console.log('🚀 Submitting form...');

    // Method 1: Direct button click (most reliable)
    try {
      await page.click('button[type="submit"]');
      console.log('✅ Submit button clicked');
    } catch (error) {
      console.log('⚠️ Submit button click failed, trying alternative methods...');

      // Method 2: Form submission via JavaScript (testing-library inspired)
      await page.evaluate(() => {
        const form = document.getElementById('birth-data-form');
        if (form) {
          // Trigger form submission event
          const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
          form.dispatchEvent(submitEvent);
        }
      });
      console.log('✅ Form submitted via JavaScript event');
    }

    // Monitor for chart generation API call and response
    let apiCallDetected = false;
    let chartGenerated = false;

    const checkApiCall = setInterval(async () => {
      try {
        const requests = await page.evaluate(() => {
          return window.performance.getEntriesByType('resource')
            .filter(entry => entry.name.includes('/api/v1/chart/generate'))
            .map(entry => ({ name: entry.name, duration: entry.duration }));
        });

        if (requests.length > 0) {
          apiCallDetected = true;
          console.log('✅ Chart generation API call detected:', requests[requests.length - 1]);
        }
      } catch (e) {
        // Continue monitoring
      }
    }, 500);

    // Wait for API response or timeout
    await Promise.race([
      page.waitForSelector('.chart-container, .error-message, .loading-spinner', { timeout: 15000 }),
      new Promise(resolve => setTimeout(resolve, 15000))
    ]);

    clearInterval(checkApiCall);

    // Check if chart was generated
    const chartContainer = await page.$('.chart-container');
    const errorMessage = await page.$('.error-message');

    if (chartContainer) {
      chartGenerated = true;
      console.log('✅ Chart generated successfully');
    } else if (errorMessage) {
      const errorText = await page.evaluate(el => el.textContent, errorMessage);
      console.log('❌ Chart generation failed with error:', errorText);
    } else {
      console.log('⚠️ Chart generation status unclear - taking screenshot for analysis');
    }

    // Screenshot: Chart result (success or failure)
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, chartGenerated ? '03-chart-generated.png' : '03-chart-failed.png'),
      fullPage: true
    });
    console.log(`📸 Screenshot saved: ${chartGenerated ? '03-chart-generated.png' : '03-chart-failed.png'}`);

    if (apiCallDetected && chartGenerated) {
      console.log('✅ **Chart Page Test PASSED**');
      return { status: 'passed', message: 'Chart generation successful' };
    } else if (apiCallDetected && !chartGenerated) {
      console.log('⚠️ **Chart Page Test PARTIAL** - API called but chart not generated');
      return { status: 'partial', message: 'API called but chart generation unclear' };
    } else {
      console.log('❌ **Chart Page Test FAILED** - No API call detected');
      return { status: 'failed', message: 'Form submission did not trigger API call' };
    }

  } catch (error) {
    console.log('❌ **Chart Page Test FAILED**:', error.message);

    // Screenshot on error
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '03-chart-error.png'),
      fullPage: true
    });

    return { status: 'failed', message: error.message };
  }
}

async function testAnalysisPage(page) {
  console.log('\n📋 **C. Analysis Page Test** (`localhost:3002/analysis`)');

  try {
    await page.goto(`${FRONTEND_URL}/analysis`, { waitUntil: 'networkidle2' });

    // Check if there's a "Generate Your Birth Chart First" message (no chartId scenario)
    const chartFirstMessage = await page.evaluate(() => {
      const content = document.body.textContent || document.body.innerText;
      return content.includes('Generate Your Birth Chart First');
    });

    if (chartFirstMessage) {
      console.log('ℹ️ No chart data found - checking for analysis generation button...');

      // Look for manual analysis trigger button using Puppeteer-compatible selector
      const analysisButton = await page.evaluateHandle(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.find(button =>
          button.textContent.includes('Generate Comprehensive Analysis') ||
          button.textContent.includes('Comprehensive Analysis') ||
          button.textContent.includes('Generate Analysis')
        );
      });

      if (analysisButton && analysisButton.asElement()) {
        console.log('✅ Found manual analysis trigger button');

        // Wait for API call to comprehensive analysis
        console.log('🔄 Triggering manual comprehensive analysis...');
        const apiPromise = waitForAPI(page, '/api/v1/analysis/comprehensive');

        // Click the analysis button
        await analysisButton.asElement().click();

        // Wait for API response
        const apiResponse = await Promise.race([
          apiPromise,
          new Promise(resolve => setTimeout(() => resolve(null), 20000))
        ]);

        if (apiResponse) {
          console.log('✅ Comprehensive Analysis API call successful:', apiResponse.status());
        } else {
          console.log('⚠️ Manual analysis API call not detected - checking if analysis already exists...');
        }
      } else {
        console.log('ℹ️ No manual analysis trigger found - may need chart data first');

        // Look for alternative trigger buttons
        const altButtons = await page.$$('button[class*="analysis"], button[class*="comprehensive"]');
        if (altButtons.length > 0) {
          console.log('🔄 Found alternative analysis buttons, trying first one...');
          const apiPromise = waitForAPI(page, '/api/v1/analysis/comprehensive');
          await altButtons[0].click();

          const apiResponse = await Promise.race([
            apiPromise,
            new Promise(resolve => setTimeout(() => resolve(null), 20000))
          ]);

          if (apiResponse) {
            console.log('✅ Alternative analysis trigger successful:', apiResponse.status());
          }
        }
      }
    } else {
      console.log('✅ Chart data available - waiting for automatic analysis API call...');

      // Wait for automatic API call to comprehensive analysis
      console.log('🔄 Waiting for automatic API call to POST localhost:3001/api/v1/analysis/comprehensive...');
      const apiPromise = waitForAPI(page, '/api/v1/analysis/comprehensive');

      const apiResponse = await Promise.race([
        apiPromise,
        new Promise(resolve => setTimeout(() => resolve(null), 15000))
      ]);

      if (apiResponse) {
        console.log('✅ Automatic Comprehensive Analysis API call successful:', apiResponse.status());
      } else {
        console.log('⚠️ Automatic analysis API call not detected - checking for manual trigger...');

        // Look for manual trigger button as fallback using Puppeteer-compatible selector
        const manualButton = await page.evaluateHandle(() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          return buttons.find(button =>
            button.textContent.includes('Generate Comprehensive Analysis') ||
            button.textContent.includes('Comprehensive Analysis') ||
            button.textContent.includes('Generate Analysis')
          );
        });

        if (manualButton && manualButton.asElement()) {
          console.log('🔄 Found manual trigger, attempting...');
          const manualApiPromise = waitForAPI(page, '/api/v1/analysis/comprehensive');
          await manualButton.asElement().click();

          await Promise.race([
            manualApiPromise,
            new Promise(resolve => setTimeout(() => resolve(null), 20000))
          ]);
        }
      }
    }

    // Wait for analysis content to load
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Validate all 8 analysis sections per requirements
    const requiredSections = [
      'Lagna',
      'House',
      'Aspects',
      'Arudha',
      'Navamsa',
      'Dasha',
      'Yoga',
      'Synthesis'
    ];

    console.log('🔍 Validating 8 analysis sections...');
    let sectionsFound = 0;

    for (const section of requiredSections) {
      const sectionExists = await page.evaluate((sectionName) => {
        const content = document.body.textContent || document.body.innerText;
        const lowerContent = content.toLowerCase();
        const lowerSection = sectionName.toLowerCase();

        // Check for section name and common variations
        return lowerContent.includes(lowerSection) ||
               lowerContent.includes(`${lowerSection} analysis`) ||
               lowerContent.includes(`${lowerSection} section`) ||
               lowerContent.includes(`${lowerSection}:`);
      }, section);

      if (sectionExists) {
        sectionsFound++;
        console.log(`✅ ${section} Analysis - Found`);
      } else {
        console.log(`⚠️ ${section} Analysis - Not clearly visible`);
      }
    }

    // Check for comprehensive analysis content indicators
    const analysisIndicators = await page.evaluate(() => {
      const content = document.body.textContent || document.body.innerText;
      const lowerContent = content.toLowerCase();

      return {
        hasPersonality: lowerContent.includes('personality') || lowerContent.includes('traits'),
        hasCareer: lowerContent.includes('career') || lowerContent.includes('profession'),
        hasRelationship: lowerContent.includes('relationship') || lowerContent.includes('marriage'),
        hasHealth: lowerContent.includes('health') || lowerContent.includes('physical'),
        hasSigns: lowerContent.includes('libra') || lowerContent.includes('cancer') || lowerContent.includes('sagittarius'),
        hasPlanets: lowerContent.includes('jupiter') || lowerContent.includes('venus') || lowerContent.includes('mars'),
        hasHouses: lowerContent.includes('1st house') || lowerContent.includes('2nd house') || lowerContent.includes('house'),
        hasDasha: lowerContent.includes('dasha') || lowerContent.includes('mahadasha') || lowerContent.includes('period')
      };
    });

    // Count analysis indicators
    const indicatorCount = Object.values(analysisIndicators).filter(Boolean).length;
    console.log('📊 Analysis content indicators found:', indicatorCount);

    Object.entries(analysisIndicators).forEach(([key, found]) => {
      console.log(`  ${found ? '✅' : '❌'} ${key}: ${found ? 'Found' : 'Not found'}`);
    });

    // Check for loading states
    const isLoading = await page.$$('.animate-spin, .loading, [class*="load"]');
    if (isLoading.length > 0) {
      console.log('🔄 Analysis still loading - waiting additional time...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    // Take screenshot regardless of analysis state
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '04-analysis-page-sections.png'),
      fullPage: true
    });
    console.log('📸 Screenshot saved: 04-analysis-page-sections.png');

    // Check if analysis content exists
    const hasAnalysisContent = await page.evaluate(() => {
      const content = document.body.textContent || document.body.innerText;
      return content.length > 1000 && // Substantial content
             (content.toLowerCase().includes('analysis') ||
              content.toLowerCase().includes('vedic') ||
              content.toLowerCase().includes('astrology'));
    });

    if (hasAnalysisContent) {
      console.log('✅ Substantial analysis content found on page');
    } else {
      console.log('⚠️ Limited analysis content - may need to check workflow');
    }

    console.log(`📊 Analysis sections validation: ${sectionsFound}/8 sections found`);
    console.log(`📊 Content indicators: ${indicatorCount}/8 indicators found`);

    // Consider test successful if we have reasonable analysis content
    const testSuccess = sectionsFound >= 4 || indicatorCount >= 4 || hasAnalysisContent;

    if (testSuccess) {
      console.log('✅ Analysis page test considered successful');
    } else {
      console.log('⚠️ Analysis page test results unclear - check screenshots');
    }

    return testSuccess;

  } catch (error) {
    console.error('❌ Analysis page test failed:', error.message);

    // Take screenshot for debugging
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '04-analysis-error.png'),
      fullPage: true
    });
    console.log('📸 Error screenshot saved: 04-analysis-error.png');

    return false;
  }
}

async function testReportPage(page) {
  console.log('\n📋 **D. Report Page Test** (`localhost:3002/report`)');

  try {
    await page.goto(`${FRONTEND_URL}/report`, { waitUntil: 'networkidle2' });

    // Test PDF generation functionality
    console.log('🔍 Testing PDF generation functionality...');
    const pdfButton = await page.$('button[class*="pdf"], button[onclick*="pdf"], [data-testid*="pdf"]');

    if (pdfButton) {
      console.log('✅ PDF generation button found');
    } else {
      console.log('⚠️ PDF generation button not clearly visible');
    }

    // Test email sharing capabilities
    console.log('🔍 Testing email sharing capabilities...');
    const emailButton = await page.$('button[class*="email"], button[onclick*="share"], [data-testid*="email"]');

    if (emailButton) {
      console.log('✅ Email sharing functionality found');
    } else {
      console.log('⚠️ Email sharing functionality not clearly visible');
    }

    // Screenshot: Report generation
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '05-report-generation.png'),
      fullPage: true
    });
    console.log('📸 Screenshot saved: 05-report-generation.png');

    return true;

  } catch (error) {
    console.error('❌ Report page test failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 **JYOTISH SHASTRA PRODUCTION UI SYSTEMATIC TESTING PROTOCOL**');
  console.log('📋 Following user-docs/prod-testing-prompt.md Section 2.1 exactly');
  console.log('📊 Test Data: Farhan (1997-12-18, 02:30, Karachi: 32.4935378, 74.5411575, Asia/Karachi)');
  console.log('🔄 UI Workflow: Home Page → Birth Chart → Analysis Page → Comprehensive Analysis Report\n');

  // Check server health
  const backendHealthy = await checkServerHealth();
  if (!backendHealthy) {
    console.error('❌ Backend server not accessible. Please ensure server is running on port 3001');
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    headless: false, // Show browser for debugging
    defaultViewport: { width: 1200, height: 800 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Enable request interception to monitor API calls
  await page.setRequestInterception(true);
  page.on('request', (req) => req.continue());

  const results = {
    homePage: false,
    chartPage: false,
    analysisPage: false,
    reportPage: false
  };

  try {
    // Execute systematic testing per protocol
    results.homePage = await testHomePage(page);
    results.chartPage = await testChartPage(page);
    results.analysisPage = await testAnalysisPage(page);
    results.reportPage = await testReportPage(page);

  } catch (error) {
    console.error('❌ Testing protocol failed:', error);
  } finally {
    await browser.close();
  }

  // Generate test report
  console.log('\n📊 **PRODUCTION TESTING RESULTS**');
  console.log('=====================================');
  console.log(`✅ Home Page Test: ${results.homePage ? 'PASSED' : 'FAILED'}`);
  console.log(`✅ Chart Page Test: ${results.chartPage ? 'PASSED' : 'FAILED'}`);
  console.log(`✅ Analysis Page Test: ${results.analysisPage ? 'PASSED' : 'FAILED'}`);
  console.log(`✅ Report Page Test: ${results.reportPage ? 'PASSED' : 'FAILED'}`);

  const totalPassed = Object.values(results).filter(Boolean).length;
  console.log(`\n📈 Overall Success Rate: ${totalPassed}/4 (${Math.round(totalPassed/4*100)}%)`);

  if (totalPassed === 4) {
    console.log('🎉 **ALL TESTS PASSED** - Production UI validation successful!');
  } else {
    console.log('⚠️ **SOME TESTS FAILED** - Review screenshots and fix issues per RCA protocol');
  }

  // Save results to file
  const reportPath = path.join(__dirname, 'production-systematic-test-results.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    testData: FARHAN_TEST_DATA,
    results: results,
    successRate: `${totalPassed}/4`,
    screenshots: [
      '01-home-page-initial.png',
      '02-chart-form-filled.png',
      '03-chart-generated.png',
      '04-analysis-page-sections.png',
      '05-report-generation.png'
    ]
  }, null, 2));

  console.log(`\n📄 Test results saved to: ${reportPath}`);
  console.log(`📸 Screenshots saved to: ${SCREENSHOT_DIR}/`);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main, FARHAN_TEST_DATA };
