/**
 * Debug test for comprehensive analysis data flow
 * Tests session storage, API calls, and UI display
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

describe('Comprehensive Analysis Debug Test', () => {
  let browser;
  let page;
  const testResults = {
    timestamp: new Date().toISOString(),
    tests: [],
    sessionStorage: {},
    errors: []
  };

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: false,
      slowMo: 100,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    page = await browser.newPage();

    // Set viewport
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
  });

  afterAll(async () => {
    // Save test results
    const resultsPath = path.join(__dirname, 'test-logs', `debug-comprehensive-${Date.now()}.json`);
    fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
    fs.writeFileSync(resultsPath, JSON.stringify(testResults, null, 2));

    if (browser) {
      await browser.close();
    }
  });

  test('Debug comprehensive analysis data flow', async () => {
    console.log('🔍 Starting comprehensive analysis debug test...');

    try {
      // Step 1: Navigate to homepage
      console.log('📍 Step 1: Navigate to homepage');
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

      // Step 2: Check if UIDataSaver is available
      console.log('📍 Step 2: Check UIDataSaver availability');
      const hasUIDataSaver = await page.evaluate(() => {
        return typeof window.UIDataSaver !== 'undefined' ||
               typeof UIDataSaver !== 'undefined';
      });

      testResults.tests.push({
        step: 'UIDataSaver availability',
        result: hasUIDataSaver,
        timestamp: new Date().toISOString()
      });

      console.log(`UIDataSaver available: ${hasUIDataSaver}`);

      // Step 3: Fill form with test data
      console.log('📍 Step 3: Fill birth data form');

      // Wait for form elements
      await page.waitForSelector('input[name="name"]', { timeout: 10000 });
      await page.waitForSelector('input[name="dateOfBirth"]', { timeout: 5000 });
      await page.waitForSelector('input[name="timeOfBirth"]', { timeout: 5000 });
      await page.waitForSelector('input[name="location"]', { timeout: 5000 });

      // Fill form
      await page.type('input[name="name"]', 'Test User');
      await page.type('input[name="dateOfBirth"]', '1997-12-18');
      await page.type('input[name="timeOfBirth"]', '02:30');
      await page.type('input[name="location"]', 'Jammu, Kashmir, India');

      // Wait a bit for location to be processed
      await page.waitForTimeout(2000);

      // Step 4: Submit form
      console.log('📍 Step 4: Submit form and generate chart');

      const generateButton = await page.$('button[type="submit"]');
      if (generateButton) {
        await generateButton.click();
        console.log('✅ Generate button clicked');
      } else {
        console.log('❌ Generate button not found');
      }

      // Wait for chart generation
      await page.waitForTimeout(5000);

      // Step 5: Check session storage after form submission
      console.log('📍 Step 5: Check session storage after form submission');

      const sessionStorageAfterForm = await page.evaluate(() => {
        const storage = {};
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          const value = sessionStorage.getItem(key);
          storage[key] = value;
        }
        return storage;
      });

      testResults.sessionStorage.afterForm = sessionStorageAfterForm;
      console.log('Session storage keys after form:', Object.keys(sessionStorageAfterForm));

      // Step 6: Check if UIDataSaver has data
      console.log('📍 Step 6: Check UIDataSaver data methods');

      const uiDataSaverStatus = await page.evaluate(() => {
        try {
          // Try to access UIDataSaver methods
          const methods = {
            hasGetBirthData: false,
            hasGetAnalysisData: false,
            hasGetComprehensiveAnalysis: false,
            birthData: null,
            analysisData: null,
            comprehensiveAnalysis: null
          };

          // Check if UIDataSaver is available globally or needs import
          let dataSaver = null;
          if (typeof window.UIDataSaver !== 'undefined') {
            dataSaver = window.UIDataSaver;
          } else if (typeof UIDataSaver !== 'undefined') {
            dataSaver = UIDataSaver;
          }

          if (dataSaver) {
            methods.hasGetBirthData = typeof dataSaver.getBirthData === 'function';
            methods.hasGetAnalysisData = typeof dataSaver.getAnalysisData === 'function';
            methods.hasGetComprehensiveAnalysis = typeof dataSaver.getComprehensiveAnalysis === 'function';

            if (methods.hasGetBirthData) {
              methods.birthData = dataSaver.getBirthData();
            }
            if (methods.hasGetAnalysisData) {
              methods.analysisData = dataSaver.getAnalysisData();
            }
            if (methods.hasGetComprehensiveAnalysis) {
              methods.comprehensiveAnalysis = dataSaver.getComprehensiveAnalysis();
            }
          }

          return methods;
        } catch (error) {
          return { error: error.message };
        }
      });

      testResults.tests.push({
        step: 'UIDataSaver methods check',
        result: uiDataSaverStatus,
        timestamp: new Date().toISOString()
      });

      console.log('UIDataSaver status:', uiDataSaverStatus);

      // Step 7: Navigate to comprehensive analysis page
      console.log('📍 Step 7: Navigate to comprehensive analysis page');

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
          message: error.message,
          step: 'Navigate to comprehensive analysis'
        });
      }

      // Step 8: Check for comprehensive analysis data loading
      console.log('📍 Step 8: Check comprehensive analysis data loading');

      await page.waitForTimeout(3000);

      // Check if comprehensive analysis loaded
      const analysisPageStatus = await page.evaluate(() => {
        const status = {
          hasAnalysisContainer: false,
          hasErrorBoundary: false,
          hasLoadingSpinner: false,
          hasAnalysisContent: false,
          sectionCount: 0,
          consoleMessages: []
        };

        // Check for various elements
        status.hasAnalysisContainer = !!document.querySelector('.comprehensive-analysis-container');
        status.hasErrorBoundary = !!document.querySelector('.error-message');
        status.hasLoadingSpinner = !!document.querySelector('.loading-spinner');
        status.hasAnalysisContent = !!document.querySelector('.analysis-sections');

        const sections = document.querySelectorAll('.analysis-section');
        status.sectionCount = sections.length;

        return status;
      });

      testResults.tests.push({
        step: 'Analysis page status',
        result: analysisPageStatus,
        timestamp: new Date().toISOString()
      });

      console.log('Analysis page status:', analysisPageStatus);

      // Step 9: Check session storage on comprehensive analysis page
      console.log('📍 Step 9: Check session storage on comprehensive analysis page');

      const sessionStorageOnAnalysisPage = await page.evaluate(() => {
        const storage = {};
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          const value = sessionStorage.getItem(key);
          storage[key] = value;
        }
        return storage;
      });

      testResults.sessionStorage.onAnalysisPage = sessionStorageOnAnalysisPage;
      console.log('Session storage keys on analysis page:', Object.keys(sessionStorageOnAnalysisPage));

      // Step 10: Take screenshot
      console.log('📍 Step 10: Take screenshot');
      const screenshotPath = path.join(__dirname, 'test-logs', `debug-comprehensive-${Date.now()}.png`);
      fs.mkdirSync(path.dirname(screenshotPath), { recursive: true });
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`Screenshot saved: ${screenshotPath}`);

      // Step 11: Try to manually inject test data
      console.log('📍 Step 11: Try to manually inject test data');

      const testDataInjection = await page.evaluate(() => {
        try {
          // Load the test data
          const testAnalysisData = {
            "success": true,
            "analysis": {
              "sections": {
                "section1": {
                  "name": "Birth Data Collection and Chart Casting",
                  "questions": [
                    {
                      "question": "Have you gathered the exact birth date, time, and place?",
                      "answer": "Yes, all critical birth details have been gathered.",
                      "completeness": 100
                    }
                  ]
                },
                "section2": {
                  "name": "Preliminary Chart Analysis",
                  "analyses": {
                    "lagna": {
                      "lagnaSign": { "sign": "Libra" },
                      "lagnaLord": { "planet": "Venus" },
                      "overallStrength": 6,
                      "summary": "Libra ascendant with diplomatic nature"
                    }
                  }
                }
              }
            }
          };

          // Try to save using sessionStorage directly
          const testKey = `jyotish_api_analysis_comprehensive_${Date.now()}`;
          sessionStorage.setItem(testKey, JSON.stringify(testAnalysisData));

          // Also try current_session key
          sessionStorage.setItem('current_session', JSON.stringify({
            birthData: {
              name: "Test User",
              dateOfBirth: "1997-12-18",
              timeOfBirth: "02:30",
              location: "Jammu, Kashmir, India"
            },
            apiResponse: {
              analysis: testAnalysisData.analysis,
              comprehensiveAnalysis: testAnalysisData.analysis.sections
            }
          }));

          return {
            success: true,
            testKey: testKey,
            dataSize: JSON.stringify(testAnalysisData).length
          };
        } catch (error) {
          return {
            success: false,
            error: error.message
          };
        }
      });

      testResults.tests.push({
        step: 'Manual test data injection',
        result: testDataInjection,
        timestamp: new Date().toISOString()
      });

      console.log('Test data injection result:', testDataInjection);

      // Step 12: Refresh page to see if injected data works
      console.log('📍 Step 12: Refresh page to test injected data');

      await page.reload({ waitUntil: 'networkidle2' });
      await page.waitForTimeout(3000);

      // Check final state
      const finalPageStatus = await page.evaluate(() => {
        const status = {
          hasAnalysisContainer: false,
          hasErrorMessage: false,
          hasLoadingSpinner: false,
          hasAnalysisContent: false,
          sectionCount: 0,
          sectionsVisible: 0
        };

        status.hasAnalysisContainer = !!document.querySelector('.comprehensive-analysis-container');
        status.hasErrorMessage = !!document.querySelector('.error-message');
        status.hasLoadingSpinner = !!document.querySelector('.loading-spinner');
        status.hasAnalysisContent = !!document.querySelector('.analysis-sections');

        const sections = document.querySelectorAll('.analysis-section');
        status.sectionCount = sections.length;

        const visibleSections = document.querySelectorAll('.analysis-section:not(.collapsed)');
        status.sectionsVisible = visibleSections.length;

        return status;
      });

      testResults.tests.push({
        step: 'Final page status after refresh',
        result: finalPageStatus,
        timestamp: new Date().toISOString()
      });

      console.log('Final page status:', finalPageStatus);

      // Take final screenshot
      const finalScreenshotPath = path.join(__dirname, 'test-logs', `debug-comprehensive-final-${Date.now()}.png`);
      await page.screenshot({ path: finalScreenshotPath, fullPage: true });
      console.log(`Final screenshot saved: ${finalScreenshotPath}`);

      console.log('🎯 Debug test completed');

      // Test should pass if we can see basic structure
      expect(analysisPageStatus.hasAnalysisContainer || finalPageStatus.hasAnalysisContainer).toBe(true);

    } catch (error) {
      console.error('❌ Debug test failed:', error);
      testResults.errors.push({
        type: 'test_failure',
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  }, 60000); // 60 second timeout
});
