/**
 * Standalone debug script for comprehensive analysis data flow
 * Tests session storage, API calls, and UI display without Jest
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function debugComprehensiveAnalysis() {
  console.log('🔍 Starting comprehensive analysis debug...');

  let browser;
  const testResults = {
    timestamp: new Date().toISOString(),
    tests: [],
    sessionStorage: {},
    errors: []
  };

  try {
    // Launch browser
    browser = await puppeteer.launch({
      headless: false,
      slowMo: 100,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    // Listen for console messages
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('ComprehensiveAnalysis') || text.includes('UIDataSaver') || text.includes('❌') || text.includes('✅')) {
        console.log(`BROWSER: ${text}`);
      }
    });

    // Listen for errors
    page.on('pageerror', error => {
      console.error(`PAGE ERROR: ${error.message}`);
      testResults.errors.push({
        type: 'pageerror',
        message: error.message,
        stack: error.stack
      });
    });

    // Step 1: Navigate to homepage
    console.log('📍 Step 1: Navigate to homepage');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

    // Step 2: Check if UIDataSaver is available
    console.log('📍 Step 2: Check UIDataSaver availability');
    const hasUIDataSaver = await page.evaluate(() => {
      return typeof window.UIDataSaver !== 'undefined' ||
             typeof UIDataSaver !== 'undefined';
    });

    console.log(`UIDataSaver available: ${hasUIDataSaver}`);

    // Step 3: Fill form with test data
    console.log('📍 Step 3: Fill birth data form');

    try {
      await page.waitForSelector('input[name="name"]', { timeout: 10000 });
      await page.waitForSelector('input[name="dateOfBirth"]', { timeout: 5000 });
      await page.waitForSelector('input[name="timeOfBirth"]', { timeout: 5000 });
      await page.waitForSelector('input[name="placeOfBirth"]', { timeout: 5000 });

      // Clear and fill form with proper date/time handling
      await page.evaluate(() => {
        // Clear all form fields
        const nameInput = document.querySelector('input[name="name"]');
        const dateInput = document.querySelector('input[name="dateOfBirth"]');
        const timeInput = document.querySelector('input[name="timeOfBirth"]');
        const placeInput = document.querySelector('input[name="placeOfBirth"]');

        if (nameInput) nameInput.value = '';
        if (dateInput) dateInput.value = '';
        if (timeInput) timeInput.value = '';
        if (placeInput) placeInput.value = '';

        // Set proper values (especially important for date/time inputs)
        if (nameInput) nameInput.value = 'Test User';
        if (dateInput) dateInput.value = '1997-12-18';
        if (timeInput) timeInput.value = '02:30';
        if (placeInput) placeInput.value = 'Jammu, Kashmir, India';

        // Trigger change events to ensure React state updates
        [nameInput, dateInput, timeInput, placeInput].forEach(input => {
          if (input) {
            input.dispatchEvent(new Event('change', { bubbles: true }));
            input.dispatchEvent(new Event('input', { bubbles: true }));
          }
        });
      });

      // Wait for geocoding to complete and coordinates to be found
      console.log('⏳ Waiting for geocoding to complete...');
      await page.waitForFunction(() => {
        const coordinatesText = document.querySelector('.text-green-400');
        return coordinatesText && coordinatesText.textContent.includes('Location found:');
      }, { timeout: 15000 });

      // Wait a bit more to ensure button is enabled
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('✅ Form filled successfully');
    } catch (error) {
      console.log('❌ Form filling failed:', error.message);
      testResults.errors.push({
        type: 'form_filling',
        message: error.message
      });
    }

    // Step 4: Submit form
    console.log('📍 Step 4: Submit form and generate chart');

    try {
      const generateButton = await page.$('button[type="submit"]');
      if (generateButton) {
        await generateButton.click();
        console.log('✅ Generate button clicked');
        await new Promise(resolve => setTimeout(resolve, 5000));
      } else {
        console.log('❌ Generate button not found');
      }
    } catch (error) {
      console.log('❌ Form submission failed:', error.message);
    }

    // Step 5: Check session storage after form submission
    console.log('📍 Step 5: Check session storage after form submission');

    const sessionStorageAfterForm = await page.evaluate(() => {
      const storage = {};
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        try {
          const value = sessionStorage.getItem(key);
          // Try to parse JSON to see if it's structured data
          const parsed = JSON.parse(value);
          storage[key] = { type: 'json', size: value.length, keys: Object.keys(parsed) };
        } catch {
          storage[key] = { type: 'string', size: value.length, preview: value.substring(0, 100) };
        }
      }
      return storage;
    });

    testResults.sessionStorage.afterForm = sessionStorageAfterForm;
    console.log('Session storage keys after form:', Object.keys(sessionStorageAfterForm));

    // Step 6: Navigate directly to comprehensive analysis page
    console.log('📍 Step 6: Navigate to comprehensive analysis page');

    try {
      await page.goto('http://localhost:3000/comprehensive-analysis', {
        waitUntil: 'networkidle2',
        timeout: 15000
      });
      console.log('✅ Successfully navigated to comprehensive analysis page');
    } catch (error) {
      console.log('❌ Failed to navigate to comprehensive analysis page:', error.message);
      testResults.errors.push({
        type: 'navigation',
        message: error.message
      });
    }

    await new Promise(resolve => setTimeout(resolve, 5000));

    // Step 7: Check comprehensive analysis page state
    console.log('📍 Step 7: Check comprehensive analysis page state');

    const analysisPageStatus = await page.evaluate(() => {
      const status = {
        hasAnalysisContainer: false,
        hasErrorMessage: false,
        hasLoadingSpinner: false,
        hasAnalysisContent: false,
        sectionCount: 0,
        pageTitle: document.title,
        bodyClasses: document.body.className,
        mainContent: ''
      };

      // Check for various elements
      status.hasAnalysisContainer = !!document.querySelector('.comprehensive-analysis-container');
      status.hasErrorMessage = !!document.querySelector('.error-message');
      status.hasLoadingSpinner = !!document.querySelector('.loading-spinner') ||
                                 !!document.querySelector('[class*="loading"]');
      status.hasAnalysisContent = !!document.querySelector('.analysis-sections') ||
                                 !!document.querySelector('[class*="analysis"]');

      const sections = document.querySelectorAll('.analysis-section');
      status.sectionCount = sections.length;

      // Get main content for debugging
      const main = document.querySelector('main') || document.querySelector('.container') || document.body;
      status.mainContent = main ? main.textContent.substring(0, 500) : 'No main content found';

      return status;
    });

    console.log('Analysis page status:', analysisPageStatus);

    // Step 8: Check session storage on analysis page
    console.log('📍 Step 8: Check session storage on analysis page');

    const sessionStorageOnAnalysisPage = await page.evaluate(() => {
      const storage = {};
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        const value = sessionStorage.getItem(key);
        storage[key] = value ? value.length : 0;
      }
      return storage;
    });

    testResults.sessionStorage.onAnalysisPage = sessionStorageOnAnalysisPage;
    console.log('Session storage on analysis page:', sessionStorageOnAnalysisPage);

    // Step 9: Take screenshots
    console.log('📍 Step 9: Take screenshots');
    const screenshotDir = path.join(__dirname, 'test-logs');
    fs.mkdirSync(screenshotDir, { recursive: true });

    const screenshotPath = path.join(screenshotDir, `debug-comprehensive-${Date.now()}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`Screenshot saved: ${screenshotPath}`);

    // Step 10: Inject test data and retry
    console.log('📍 Step 10: Inject test data and retry');

    const testDataResult = await page.evaluate(() => {
      try {
        // Create comprehensive test data matching expected structure
        const comprehensiveAnalysisData = {
          success: true,
          analysis: {
            sections: {
              section1: {
                name: "Birth Data Collection and Chart Casting",
                questions: [
                  {
                    question: "Have you gathered the exact birth date, time, and place?",
                    answer: "Yes, complete birth data collected for Test User, born December 18, 1997 at 02:30 in Jammu, Kashmir, India.",
                    completeness: 100
                  }
                ]
              },
              section2: {
                name: "Preliminary Chart Analysis",
                analyses: {
                  lagna: {
                    lagnaSign: { sign: "Libra" },
                    lagnaLord: { planet: "Venus" },
                    overallStrength: 6,
                    summary: "Libra ascendant indicates diplomatic nature and love for harmony"
                  }
                }
              },
              section3: {
                name: "Planetary Positions",
                planets: {
                  sun: { sign: "Sagittarius", degree: 26.5 },
                  moon: { sign: "Cancer", degree: 12.3 },
                  venus: { sign: "Scorpio", degree: 8.7 }
                }
              }
            }
          }
        };

        // Save with multiple keys that the system might look for
        const keys = [
          'jyotish_comprehensive_analysis',
          'jyotish_api_analysis_comprehensive',
          'comprehensive_analysis_data',
          'current_session'
        ];

        keys.forEach(key => {
          sessionStorage.setItem(key, JSON.stringify(comprehensiveAnalysisData));
        });

        // Also save birth data
        const birthData = {
          name: "Test User",
          dateOfBirth: "1997-12-18",
          timeOfBirth: "02:30",
          location: "Jammu, Kashmir, India"
        };

        sessionStorage.setItem('jyotish_birth_data', JSON.stringify(birthData));

        return {
          success: true,
          keysSet: keys.length,
          dataSize: JSON.stringify(comprehensiveAnalysisData).length
        };
      } catch (error) {
        return {
          success: false,
          error: error.message
        };
      }
    });

    console.log('Test data injection result:', testDataResult);

    // Step 11: Refresh and check final state
    console.log('📍 Step 11: Refresh page and check final state');

    await page.reload({ waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 5000));

    const finalPageStatus = await page.evaluate(() => {
      const status = {
        hasAnalysisContainer: false,
        hasErrorMessage: false,
        hasLoadingSpinner: false,
        hasAnalysisContent: false,
        sectionCount: 0,
        sectionsVisible: 0,
        pageText: ''
      };

      status.hasAnalysisContainer = !!document.querySelector('.comprehensive-analysis-container');
      status.hasErrorMessage = !!document.querySelector('.error-message');
      status.hasLoadingSpinner = !!document.querySelector('.loading-spinner');
      status.hasAnalysisContent = !!document.querySelector('.analysis-sections');

      const sections = document.querySelectorAll('.analysis-section');
      status.sectionCount = sections.length;

      const visibleSections = document.querySelectorAll('.analysis-section:not(.collapsed)');
      status.sectionsVisible = visibleSections.length;

      // Get page text for debugging
      status.pageText = document.body.textContent.substring(0, 1000);

      return status;
    });

    console.log('Final page status:', finalPageStatus);

    // Take final screenshot
    const finalScreenshotPath = path.join(screenshotDir, `debug-comprehensive-final-${Date.now()}.png`);
    await page.screenshot({ path: finalScreenshotPath, fullPage: true });
    console.log(`Final screenshot saved: ${finalScreenshotPath}`);

    // Save test results
    testResults.tests = [
      { step: 'UIDataSaver availability', result: hasUIDataSaver },
      { step: 'Analysis page status', result: analysisPageStatus },
      { step: 'Test data injection', result: testDataResult },
      { step: 'Final page status', result: finalPageStatus }
    ];

    const resultsPath = path.join(screenshotDir, `debug-results-${Date.now()}.json`);
    fs.writeFileSync(resultsPath, JSON.stringify(testResults, null, 2));
    console.log(`Test results saved: ${resultsPath}`);

    console.log('🎯 Debug completed successfully');

    // Keep browser open for 10 seconds for manual inspection
    console.log('⏰ Keeping browser open for 10 seconds for manual inspection...');
    await new Promise(resolve => setTimeout(resolve, 10000));

  } catch (error) {
    console.error('❌ Debug failed:', error);
    testResults.errors.push({
      type: 'debug_failure',
      message: error.message,
      stack: error.stack
    });
  } finally {
    if (browser) {
      await browser.close();
      console.log('🔒 Browser closed');
    }
  }
}

// Run the debug
debugComprehensiveAnalysis().catch(console.error);
