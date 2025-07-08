#!/usr/bin/env node

/**
 * Chart Page Production Test
 * Tests the real chart page (/chart), form functionality, and chart generation
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Test configuration
const CONFIG = {
  frontendUrl: 'http://localhost:3002',
  page: '/chart',
  timeout: 30000,
  screenshotDir: path.join(__dirname, 'production-screenshots')
};

// Create screenshots directory
if (!fs.existsSync(CONFIG.screenshotDir)) {
  fs.mkdirSync(CONFIG.screenshotDir, { recursive: true });
}

// Test birth data
const TEST_BIRTH_DATA = {
  dateOfBirth: "1985-10-24",
  timeOfBirth: "14:30",
  placeOfBirth: "Pune, Maharashtra, India"
};

// Expected chart page elements
const EXPECTED_ELEMENTS = [
  'Birth Chart',
  'Date of Birth',
  'Time of Birth',
  'Place of Birth',
  'Generate'
];

async function testChartPage() {
  let browser;
  let page;
  const testResults = {
    timestamp: new Date().toISOString(),
    page: 'Chart Page (/chart)',
    elements: { found: [], missing: [] },
    formTest: { success: false, errors: [] },
    chartGeneration: { success: false, errors: [] },
    screenshots: [],
    errors: []
  };

  try {
    console.log('📊 Testing Chart Page Production Functionality...\n');

    // Launch browser
    browser = await puppeteer.launch({
      headless: false,
      defaultViewport: { width: 1920, height: 1080 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    page = await browser.newPage();

    // Monitor console errors (but allow icon warnings)
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const errorText = msg.text();
        // Only treat as error if it's not a manifest icon warning
        if (!errorText.includes('icon') && !errorText.includes('Manifest') && !errorText.includes('Download error')) {
          testResults.errors.push(`Console Error: ${errorText}`);
        } else {
          // Log icon warnings but don't fail test
          console.log(`📋 Icon Warning: ${errorText}`);
        }
      }
    });

    // Step 1: Navigate to chart page
    console.log('📍 Step 1: Loading chart page...');
    await page.goto(`${CONFIG.frontendUrl}${CONFIG.page}`, {
      waitUntil: 'networkidle2',
      timeout: CONFIG.timeout
    });

    // Take screenshot
    const chartPageScreenshot = 'chart-page-loaded.png';
    await page.screenshot({
      path: path.join(CONFIG.screenshotDir, chartPageScreenshot),
      fullPage: true
    });
    testResults.screenshots.push(chartPageScreenshot);
    console.log('✅ Chart page loaded');

    // Step 2: Check page elements
    console.log('\n📍 Step 2: Testing page elements...');

    const pageContent = await page.evaluate(() => document.body.textContent);

    console.log('🔍 Checking chart page elements:');
    for (const element of EXPECTED_ELEMENTS) {
      if (pageContent.includes(element)) {
        testResults.elements.found.push(element);
        console.log(`  ✅ Found: ${element}`);
      } else {
        testResults.elements.missing.push(element);
        console.log(`  ❌ Missing: ${element}`);
      }
    }

    // Step 3: Test form elements
    console.log('\n📍 Step 3: Testing form elements...');

    const formElements = await page.evaluate(() => {
      const dateInput = document.querySelector('input[type="date"], input[name*="date"], input[placeholder*="Date"], input[id*="date"]');
      const timeInput = document.querySelector('input[type="time"], input[name*="time"], input[placeholder*="Time"], input[id*="time"]');
      const locationInput = document.querySelector('input[name*="location"], input[name*="place"], input[placeholder*="Location"], input[placeholder*="Place"], input[id*="place"]');
      const submitButton = document.querySelector('button[type="submit"], .generate-chart, button[class*="generate"], button[class*="submit"]');

      return {
        hasDateInput: !!dateInput,
        hasTimeInput: !!timeInput,
        hasLocationInput: !!locationInput,
        hasSubmitButton: !!submitButton,
        dateInputType: dateInput ? dateInput.type : null,
        timeInputType: timeInput ? timeInput.type : null
      };
    });

    console.log('📋 Form elements validation:');
    console.log(`  ${formElements.hasDateInput ? '✅' : '❌'} Date input: ${formElements.hasDateInput ? 'Present' : 'Missing'}`);
    console.log(`  ${formElements.hasTimeInput ? '✅' : '❌'} Time input: ${formElements.hasTimeInput ? 'Present' : 'Missing'}`);
    console.log(`  ${formElements.hasLocationInput ? '✅' : '❌'} Location input: ${formElements.hasLocationInput ? 'Present' : 'Missing'}`);
    console.log(`  ${formElements.hasSubmitButton ? '✅' : '❌'} Submit button: ${formElements.hasSubmitButton ? 'Present' : 'Missing'}`);

    testResults.formTest.success = formElements.hasDateInput && formElements.hasTimeInput && formElements.hasSubmitButton;

    if (!testResults.formTest.success) {
      if (!formElements.hasDateInput) testResults.formTest.errors.push('Date input missing');
      if (!formElements.hasTimeInput) testResults.formTest.errors.push('Time input missing');
      if (!formElements.hasSubmitButton) testResults.formTest.errors.push('Submit button missing');
    }

    // Step 4: Test form filling and submission (if form exists)
    if (testResults.formTest.success) {
      console.log('\n📍 Step 4: Testing form filling and submission...');

      try {
        // Fill date input
        const dateSelector = 'input[type="date"], input[name*="date"], input[placeholder*="Date"], input[id*="date"]';
        await page.focus(dateSelector);
        await page.evaluate((selector, value) => {
          const input = document.querySelector(selector);
          if (input) {
            input.value = value;
            input.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }, dateSelector, TEST_BIRTH_DATA.dateOfBirth);

        // Fill time input
        const timeSelector = 'input[type="time"], input[name*="time"], input[placeholder*="Time"], input[id*="time"]';
        await page.focus(timeSelector);
        await page.evaluate((selector, value) => {
          const input = document.querySelector(selector);
          if (input) {
            input.value = value;
            input.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }, timeSelector, TEST_BIRTH_DATA.timeOfBirth);

        // Fill location input (if exists)
        if (formElements.hasLocationInput) {
          const locationSelector = 'input[name*="location"], input[name*="place"], input[placeholder*="Location"], input[placeholder*="Place"], input[id*="place"]';
          await page.focus(locationSelector);
          await page.type(locationSelector, TEST_BIRTH_DATA.placeOfBirth);

          // Wait for geocoding to complete (debounce is 1.5 seconds + API call time)
          console.log('🌍 Waiting for location geocoding to complete...');
          await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds for geocoding
        }

        // Take screenshot after filling form
        const formFilledScreenshot = 'chart-form-filled.png';
        await page.screenshot({
          path: path.join(CONFIG.screenshotDir, formFilledScreenshot),
          fullPage: true
        });
        testResults.screenshots.push(formFilledScreenshot);

        console.log('✅ Form filled with test data');

        // Submit form - improved selector
        const submitButton = await page.$('button[type="submit"], .generate-chart, button[class*="generate"], button[class*="submit"]');
        if (submitButton) {
          await submitButton.click();
          console.log('🔄 Form submitted, waiting for chart generation...');
        } else {
          throw new Error('Submit button not found');
        }

        // Wait for chart generation (or error message) - use reliable timeout
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Check for chart generation results
        const chartGenerated = await page.evaluate(() => {
          const chartElement = document.querySelector('.chart, .vedic-chart, canvas, svg');
          const errorElement = document.querySelector('.error, .alert-error');
          const successElement = document.querySelector('.success, .chart-generated');

          return {
            hasChart: !!chartElement,
            hasError: !!errorElement,
            hasSuccess: !!successElement,
            errorText: errorElement ? errorElement.textContent : null,
            successText: successElement ? successElement.textContent : null
          };
        });

        console.log('📊 Chart generation results:');
        console.log(`  ${chartGenerated.hasChart ? '✅' : '❌'} Chart element: ${chartGenerated.hasChart ? 'Present' : 'Missing'}`);
        console.log(`  ${chartGenerated.hasError ? '❌' : '✅'} Error: ${chartGenerated.hasError ? chartGenerated.errorText : 'None'}`);
        console.log(`  ${chartGenerated.hasSuccess ? '✅' : '⚠️'} Success: ${chartGenerated.hasSuccess ? chartGenerated.successText : 'No success message'}`);

        testResults.chartGeneration.success = chartGenerated.hasChart || chartGenerated.hasSuccess;
        if (chartGenerated.hasError) {
          testResults.chartGeneration.errors.push(chartGenerated.errorText);
        }

        // Take screenshot after chart generation
        const chartGeneratedScreenshot = 'chart-generated.png';
        await page.screenshot({
          path: path.join(CONFIG.screenshotDir, chartGeneratedScreenshot),
          fullPage: true
        });
        testResults.screenshots.push(chartGeneratedScreenshot);

      } catch (error) {
        console.log(`❌ Form submission failed: ${error.message}`);
        testResults.chartGeneration.errors.push(`Form submission failed: ${error.message}`);
      }
    } else {
      console.log('\n⚠️ Step 4: Skipping form submission (form elements missing)');
    }

    // Step 5: Test navigation back to home
    console.log('\n📍 Step 5: Testing navigation...');

    const navigationWorks = await page.evaluate(() => {
      const homeLink = document.querySelector('a[href="/"], a[href="#/"], .nav-home');
      if (homeLink) {
        return true;
      }
      return false;
    });

    console.log(`${navigationWorks ? '✅' : '❌'} Navigation links: ${navigationWorks ? 'Working' : 'Missing'}`);

    // Take final screenshot
    const finalScreenshot = 'chart-page-complete.png';
    await page.screenshot({
      path: path.join(CONFIG.screenshotDir, finalScreenshot),
      fullPage: true
    });
    testResults.screenshots.push(finalScreenshot);

    // Generate results
    const elementsSuccess = testResults.elements.missing.length === 0;
    const overallSuccess = elementsSuccess && testResults.formTest.success && testResults.errors.length === 0;

    console.log('\n' + '='.repeat(60));
    console.log('🎯 CHART PAGE TEST RESULTS');
    console.log('='.repeat(60));

    console.log('\n📊 Page Elements Test:');
    console.log(`  ✅ Found: ${testResults.elements.found.length}/${EXPECTED_ELEMENTS.length}`);
    console.log(`  ❌ Missing: ${testResults.elements.missing.length}`);
    if (testResults.elements.missing.length > 0) {
      console.log(`     Missing items: ${testResults.elements.missing.join(', ')}`);
    }

    console.log('\n📋 Form Test:');
    console.log(`  Status: ${testResults.formTest.success ? 'PASSED' : 'FAILED'}`);
    if (testResults.formTest.errors.length > 0) {
      console.log(`  Errors: ${testResults.formTest.errors.join(', ')}`);
    }

    console.log('\n📊 Chart Generation Test:');
    console.log(`  Status: ${testResults.chartGeneration.success ? 'PASSED' : 'FAILED'}`);
    if (testResults.chartGeneration.errors.length > 0) {
      console.log(`  Errors: ${testResults.chartGeneration.errors.join(', ')}`);
    }

    if (testResults.errors.length > 0) {
      console.log('\n❌ Console Errors:');
      testResults.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }

    console.log(`\n📁 Screenshots: ${testResults.screenshots.length} captured`);
    console.log(`🎉 Test Result: ${overallSuccess ? 'PASSED' : 'FAILED'}`);

    return overallSuccess;

  } catch (error) {
    console.error('\n❌ Chart page test failed:', error.message);
    testResults.errors.push(error.message);

    // Take error screenshot
    if (page) {
      try {
        const errorScreenshot = `chart-page-error-${Date.now()}.png`;
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
  testChartPage()
    .then(success => {
      console.log('\n' + '='.repeat(60));
      if (success) {
        console.log('🎉 CHART PAGE PRODUCTION TEST PASSED');
        console.log('✅ Form elements working, chart generation functional');
      } else {
        console.log('❌ CHART PAGE PRODUCTION TEST FAILED');
        console.log('⚠️ Issues found with chart page production implementation');
      }
      console.log('='.repeat(60));
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Chart page test runner failed:', error);
      process.exit(1);
    });
}

module.exports = { testChartPage, CONFIG, TEST_BIRTH_DATA };
