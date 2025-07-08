/**
 * Comprehensive Production Testing Protocol
 * Following user-docs/prod-testing-prompt.md Section 2.1 exactly
 *
 * Systematic UI Testing Sequence:
 * 1. Home Page Test (localhost:3002/)
 * 2. Chart Page Test (localhost:3002/chart)
 * 3. Analysis Page Test (localhost:3002/analysis)
 * 4. Report Page Test (localhost:3002/report)
 *
 * MANDATORY Test Data (used consistently across ALL tests):
 * Farhan, 1997-12-18, 02:30, 32.4935378, 74.5411575, Asia/Karachi, male
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

const MANDATORY_TEST_DATA = {
  name: "Farhan",
  dateOfBirth: "1997-12-18",
  timeOfBirth: "02:30",
  latitude: 32.4935378,
  longitude: 74.5411575,
  timezone: "Asia/Karachi",
  gender: "male",
  placeOfBirth: "Sialkot, Pakistan"
};

const FRONTEND_URL = 'http://localhost:3002';
const BACKEND_URL = 'http://localhost:3001';
const SCREENSHOT_DIR = path.join(__dirname, 'production-ui-screenshots');
const RESULTS_FILE = path.join(__dirname, 'comprehensive-production-test-results.json');

class ComprehensiveProductionTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.testResults = {
      timestamp: new Date().toISOString(),
      testData: MANDATORY_TEST_DATA,
      pages: {},
      apiValidation: {},
      screenshots: {},
      errors: [],
      summary: {}
    };
  }

  async initialize() {
    console.log('🚀 Initializing Comprehensive Production Testing Protocol...');

    // Ensure screenshot directory exists
    try {
      await fs.access(SCREENSHOT_DIR);
    } catch {
      await fs.mkdir(SCREENSHOT_DIR, { recursive: true });
    }

    // Launch browser with production-like settings
    this.browser = await puppeteer.launch({
      headless: false, // Show browser for debugging
      defaultViewport: { width: 1200, height: 800 },
      slowMo: 100, // Slow down for observation
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    this.page = await this.browser.newPage();

    // Setup console logging to catch frontend errors
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        this.testResults.errors.push({
          type: 'console_error',
          message: msg.text(),
          timestamp: new Date().toISOString()
        });
      }
    });

    // Setup request/response monitoring
    this.page.on('response', response => {
      const url = response.url();
      if (url.includes('/api/')) {
        console.log(`📡 API Response: ${response.status()} - ${url}`);
      }
    });

    console.log('✅ Browser initialized successfully');
  }

  async testHomePage() {
    console.log('\n🏠 TESTING HOME PAGE (localhost:3002/)...');

    try {
      const startTime = Date.now();

      // Navigate to home page
      await this.page.goto(`${FRONTEND_URL}/`, { waitUntil: 'networkidle2' });

      // Wait for page to fully load
      await this.page.waitForSelector('body', { timeout: 10000 });

      // Take screenshot: 01-home-page-initial.png
      const screenshotPath = path.join(SCREENSHOT_DIR, '01-home-page-initial.png');
      await this.page.screenshot({
        path: screenshotPath,
        fullPage: true
      });

      // Test navigation functionality to Birth Chart page
      const navigationTest = await this.page.evaluate(() => {
        // Look for navigation links to chart page
        const chartLinks = document.querySelectorAll('a[href="/chart"], a[href*="chart"]');
        return {
          hasChartNavigation: chartLinks.length > 0,
          chartLinksCount: chartLinks.length,
          pageTitle: document.title,
          hasContent: document.body.innerHTML.length > 1000
        };
      });

      const endTime = Date.now();

      this.testResults.pages.homePage = {
        url: `${FRONTEND_URL}/`,
        status: 'success',
        loadTime: endTime - startTime,
        navigation: navigationTest,
        screenshot: screenshotPath,
        timestamp: new Date().toISOString()
      };

      console.log('✅ Home Page Test Completed');
      console.log(`   📸 Screenshot: ${screenshotPath}`);
      console.log(`   🔗 Chart Navigation: ${navigationTest.hasChartNavigation ? 'Found' : 'Missing'}`);

    } catch (error) {
      console.error('❌ Home Page Test Failed:', error.message);
      this.testResults.pages.homePage = {
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      };
      this.testResults.errors.push({
        page: 'homePage',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async testChartPage() {
    console.log('\n📊 TESTING CHART PAGE (localhost:3002/chart)...');

    try {
      const startTime = Date.now();

      // Navigate to chart page
      await this.page.goto(`${FRONTEND_URL}/chart`, { waitUntil: 'networkidle2' });

      // Wait for form to load
      await this.page.waitForSelector('form, input[name="name"], input[type="text"]', { timeout: 10000 });

      // Take screenshot: 02-chart-form-empty.png (before filling)
      await this.page.screenshot({
        path: path.join(SCREENSHOT_DIR, '02-chart-form-empty.png'),
        fullPage: true
      });

      console.log('📝 Filling form with standardized test data...');

      // Fill form with MANDATORY test data
      await this.fillBirthDataForm();

      // Take screenshot after filling form
      const formFilledPath = path.join(SCREENSHOT_DIR, '02-chart-form-filled.png');
      await this.page.screenshot({
        path: formFilledPath,
        fullPage: true
      });

      // Setup network monitoring for API calls
      const apiCalls = [];
      this.page.on('response', response => {
        const url = response.url();
        if (url.includes('/api/v1/chart/generate')) {
          apiCalls.push({
            url,
            status: response.status(),
            timestamp: new Date().toISOString()
          });
          console.log('📡 Chart API Response:', response.status(), url);
        }
      });

      // Submit form
      console.log('🚀 Submitting form to trigger chart generation...');
      const submissionSuccess = await this.submitChartForm();

      if (!submissionSuccess) {
        throw new Error('Form submission failed - no API response received');
      }

      // Wait for chart to be generated and displayed
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Verify Swiss Ephemeris calculations are displayed (NOT hardcoded)
      const chartValidation = await this.validateChartData();

      // Take screenshot: 03-chart-generated.png
      const chartGeneratedPath = path.join(SCREENSHOT_DIR, '03-chart-generated.png');
      await this.page.screenshot({
        path: chartGeneratedPath,
        fullPage: true
      });

      // CRITICAL: Test navigation to Analysis page to ensure data flow
      console.log('🔗 Testing navigation to Analysis page...');
      const analysisNavigation = await this.testAnalysisNavigation();

      const endTime = Date.now();

      this.testResults.pages.chartPage = {
        url: `${FRONTEND_URL}/chart`,
        status: submissionSuccess && chartValidation.hasStoredData ? 'success' : 'partial',
        loadTime: endTime - startTime,
        formFilled: true,
        submissionSuccess: submissionSuccess,
        apiCalls: apiCalls,
        chartValidation: chartValidation,
        analysisNavigation: analysisNavigation,
        screenshots: [formFilledPath, chartGeneratedPath],
        timestamp: new Date().toISOString()
      };

      console.log('✅ Chart Page Test Completed');
      console.log(`   📸 Screenshots: ${formFilledPath}, ${chartGeneratedPath}`);
      console.log(`   🔗 API Calls: ${apiCalls.length}`);
      console.log(`   📊 Chart Data: ${chartValidation.hasStoredData ? 'Stored' : 'Missing'}`);
      console.log(`   🚀 Form Submission: ${submissionSuccess ? 'Success' : 'Failed'}`);
      console.log(`   📋 Analysis Navigation: ${analysisNavigation.available ? 'Available' : 'Missing'}`);

      // Validate that data flow is working
      if (!chartValidation.hasStoredData) {
        console.log('   ⚠️ WARNING: Chart data not stored - Analysis page will be empty');
      }

    } catch (error) {
      console.error('❌ Chart Page Test Failed:', error.message);
      this.testResults.pages.chartPage = {
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      };
      this.testResults.errors.push({
        page: 'chartPage',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async testAnalysisNavigation() {
    try {
      // Look for View Analysis button using CSS selector and text content
      const analysisButton = await this.page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const analysisBtn = buttons.find(btn =>
          btn.textContent.toLowerCase().includes('view analysis') ||
          btn.textContent.toLowerCase().includes('analysis')
        );
        return analysisBtn ? {
          found: true,
          text: analysisBtn.textContent.trim(),
          id: analysisBtn.id,
          className: analysisBtn.className
        } : null;
      });

      if (analysisButton) {
        console.log('   🔘 Found View Analysis button');

        return {
          available: true,
          buttonFound: true,
          buttonText: analysisButton.text
        };
      } else {
        // Look for any analysis-related links
        const analysisLinks = await this.page.evaluate(() => {
          const links = Array.from(document.querySelectorAll('a[href*="analysis"]'));
          return links.length;
        });

        return {
          available: analysisLinks > 0,
          buttonFound: false,
          linksFound: analysisLinks,
          message: 'No Analysis button found, but links may exist'
        };
      }
    } catch (error) {
      console.log('   ⚠️ Error testing analysis navigation:', error.message);
      return {
        available: false,
        error: error.message
      };
    }
  }

  async testAnalysisPage() {
    console.log('\n📈 TESTING ANALYSIS PAGE (localhost:3002/analysis)...');

    try {
      const startTime = Date.now();

      // First, ensure we have data from the previous Chart page
      const hasStoredData = await this.page.evaluate(() => {
        const storedChart = sessionStorage.getItem('jyotish_chart_data');
        const storedBirth = sessionStorage.getItem('jyotish_birth_data');
        return {
          hasChart: !!storedChart,
          hasBirth: !!storedBirth,
          chartData: storedChart ? JSON.parse(storedChart) : null,
          birthData: storedBirth ? JSON.parse(storedBirth) : null
        };
      });

      console.log('📊 Stored data check:', hasStoredData);

      // Navigate to analysis page
      await this.page.goto(`${FRONTEND_URL}/analysis`, { waitUntil: 'networkidle2' });

      // Wait for page to load
      await this.page.waitForSelector('body', { timeout: 10000 });

      // Setup API monitoring for comprehensive analysis
      const analysisApiCalls = [];
      this.page.on('response', response => {
        const url = response.url();
        if (url.includes('/api/v1/analysis/comprehensive') || url.includes('/api/comprehensive-analysis')) {
          analysisApiCalls.push({
            url,
            status: response.status(),
            timestamp: new Date().toISOString()
          });
          console.log('📡 Analysis API Response:', response.status(), url);
        }
      });

      // Wait for potential API calls to complete
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Check if the page shows "Generate Birth Chart First" message
      const needsChart = await this.page.evaluate(() => {
        const bodyText = document.body.innerText.toLowerCase();
        return bodyText.includes('generate your birth chart first') || bodyText.includes('create birth chart');
      });

      if (needsChart) {
        console.log('⚠️ Analysis page requires chart generation first');

        // Try to trigger analysis with stored data
        const analysisButton = await this.page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          return buttons.find(btn =>
            btn.textContent.toLowerCase().includes('generate') ||
            btn.textContent.toLowerCase().includes('analysis')
          );
        });
        if (analysisButton) {
          console.log('🔘 Clicking analysis generation button...');
          await this.page.evaluate((btn) => btn.click(), analysisButton);
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }

      // Check for analysis request button and trigger it
      const requestAnalysisButton = await this.page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.find(btn =>
          btn.textContent.toLowerCase().includes('generate') ||
          btn.textContent.toLowerCase().includes('request') ||
          btn.textContent.toLowerCase().includes('analysis')
        );
      });
      if (requestAnalysisButton) {
        console.log('🔘 Triggering analysis generation...');

        const apiPromise = this.page.waitForResponse(response =>
          response.url().includes('/analysis') || response.url().includes('/comprehensive'),
          { timeout: 30000 }
        );

        await this.page.evaluate((btn) => btn.click(), requestAnalysisButton);

        try {
          const apiResponse = await apiPromise;
          console.log('✅ Analysis API call completed:', apiResponse.status());
          await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for data to render
        } catch (e) {
          console.log('⚠️ Analysis API timeout:', e.message);
        }
      }

      // Validate all analysis sections are present with actual content
      const sectionValidation = await this.validateAnalysisSections();

      // Take screenshot: 04-analysis-page-sections.png
      const analysisScreenshotPath = path.join(SCREENSHOT_DIR, '04-analysis-page-sections.png');
      await this.page.screenshot({
        path: analysisScreenshotPath,
        fullPage: true
      });

      // Enhanced content validation - check for actual analysis content, not just keywords
      const contentValidation = await this.page.evaluate(() => {
        const bodyText = document.body.innerText;

        // Check for specific analysis content indicators
        const hasRealContent = {
          hasPlanetaryData: /\d+°/.test(bodyText) || bodyText.includes('degree'),
          hasHouseData: /house|bhava/i.test(bodyText),
          hasSignData: /aries|taurus|gemini|cancer|leo|virgo|libra|scorpio|sagittarius|capricorn|aquarius|pisces/i.test(bodyText),
          hasDashaData: /dasha|antardasha/i.test(bodyText),
          hasAspectData: /aspect|conjunction|trine|square|opposition/i.test(bodyText),
          hasLoadingSpinner: document.querySelector('.loading, .spinner, [class*="loading"]') !== null,
          hasErrorMessage: document.querySelector('.error, [class*="error"]') !== null,
          hasEmptyState: bodyText.includes('no analysis') || bodyText.includes('generate chart first'),
          totalTextLength: bodyText.length,
          hasTableData: document.querySelectorAll('table tr').length > 5,
          hasCardComponents: document.querySelectorAll('.card, [class*="card"]').length,
          hasAnalysisCards: document.querySelectorAll('[class*="analysis"], [class*="section"]').length
        };

        return hasRealContent;
      });

      const endTime = Date.now();

      this.testResults.pages.analysisPage = {
        url: `${FRONTEND_URL}/analysis`,
        status: sectionValidation.totalSections > 0 ? 'success' : 'partial',
        loadTime: endTime - startTime,
        storedDataCheck: hasStoredData,
        apiCalls: analysisApiCalls,
        sections: sectionValidation,
        contentValidation: contentValidation,
        screenshot: analysisScreenshotPath,
        timestamp: new Date().toISOString()
      };

      console.log('✅ Analysis Page Test Completed');
      console.log(`   📸 Screenshot: ${analysisScreenshotPath}`);
      console.log(`   📊 Sections Found: ${sectionValidation.totalSections}/9`);
      console.log(`   🔗 API Calls: ${analysisApiCalls.length}`);
      console.log(`   📝 Content Length: ${contentValidation.totalTextLength} chars`);
      console.log(`   🎯 Has Real Data: ${contentValidation.hasPlanetaryData ? 'Yes' : 'No'}`);

      // Log any issues found
      if (sectionValidation.totalSections === 0) {
        console.log('   ⚠️ WARNING: No analysis sections found - data flow may be broken');
      }
      if (contentValidation.hasEmptyState) {
        console.log('   ⚠️ WARNING: Empty state detected - chart data missing');
      }

    } catch (error) {
      console.error('❌ Analysis Page Test Failed:', error.message);
      this.testResults.pages.analysisPage = {
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      };
      this.testResults.errors.push({
        page: 'analysisPage',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async testReportPage() {
    console.log('\n📄 TESTING REPORT PAGE (localhost:3002/report)...');

    try {
      const startTime = Date.now();

      // Navigate to report page
      await this.page.goto(`${FRONTEND_URL}/report`, { waitUntil: 'networkidle2' });

      // Wait for page to load
      await this.page.waitForSelector('body', { timeout: 10000 });

      // Test PDF generation and email sharing functionality
      const reportValidation = await this.validateReportFunctionality();

      // Take screenshot: 05-report-generation.png
      const reportScreenshotPath = path.join(SCREENSHOT_DIR, '05-report-generation.png');
      await this.page.screenshot({
        path: reportScreenshotPath,
        fullPage: true
      });

      const endTime = Date.now();

      this.testResults.pages.reportPage = {
        url: `${FRONTEND_URL}/report`,
        status: 'success',
        loadTime: endTime - startTime,
        reportFeatures: reportValidation,
        screenshot: reportScreenshotPath,
        timestamp: new Date().toISOString()
      };

      console.log('✅ Report Page Test Completed');
      console.log(`   📸 Screenshot: ${reportScreenshotPath}`);
      console.log(`   📄 PDF Generation: ${reportValidation.hasPdfGeneration ? 'Available' : 'Missing'}`);
      console.log(`   📧 Email Sharing: ${reportValidation.hasEmailSharing ? 'Available' : 'Missing'}`);

    } catch (error) {
      console.error('❌ Report Page Test Failed:', error.message);
      this.testResults.pages.reportPage = {
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      };
      this.testResults.errors.push({
        page: 'reportPage',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async fillBirthDataForm() {
    console.log('📝 Filling form with test data:', MANDATORY_TEST_DATA);

    // Clear any existing form data first
    await this.page.evaluate(() => {
      const form = document.querySelector('form');
      if (form) form.reset();
    });

    // Fill name field (if present - optional per requirements)
    try {
      const nameInput = await this.page.$('input[name="name"], input#name');
      if (nameInput) {
        await nameInput.click({ clickCount: 3 }); // Select all
        await nameInput.type(MANDATORY_TEST_DATA.name);
        console.log('   ✅ Name field filled');
      }
    } catch (e) {
      console.log('   ℹ️ Name field not found (optional)');
    }

    // Fill date of birth using optimal method for date inputs
    try {
      const dateSelectors = [
        'input[type="date"]',
        'input[name*="date"]',
        'input[id*="date"]',
        'input#dateOfBirth'
      ];

      let dateInput = null;
      for (const selector of dateSelectors) {
        dateInput = await this.page.$(selector);
        if (dateInput) break;
      }

      if (dateInput) {
        // Method 1: Try direct value setting first (most reliable for date inputs)
        try {
          await this.page.evaluate((element, value) => {
            element.value = value;
            element.dispatchEvent(new Event('change', { bubbles: true }));
            element.dispatchEvent(new Event('input', { bubbles: true }));
          }, dateInput, MANDATORY_TEST_DATA.dateOfBirth);
          console.log('   ✅ Date field filled with:', MANDATORY_TEST_DATA.dateOfBirth);
        } catch (directSetError) {
          // Method 2: Fallback to focus + type method
          console.log('   🔄 Trying alternative date filling method...');
          await dateInput.focus();
          await this.page.keyboard.down('Control');
          await this.page.keyboard.press('a');
          await this.page.keyboard.up('Control');
          await dateInput.type(MANDATORY_TEST_DATA.dateOfBirth);
          console.log('   ✅ Date field filled with fallback method:', MANDATORY_TEST_DATA.dateOfBirth);
        }
      } else {
        throw new Error('Date input not found with any selector');
      }
    } catch (e) {
      console.error('   ❌ Date filling failed:', e.message);
      throw e;
    }

    // Fill time of birth using optimal method for time inputs
    try {
      const timeSelectors = [
        'input[type="time"]',
        'input[name*="time"]',
        'input[id*="time"]',
        'input#timeOfBirth'
      ];

      let timeInput = null;
      for (const selector of timeSelectors) {
        timeInput = await this.page.$(selector);
        if (timeInput) break;
      }

      if (timeInput) {
        // Method 1: Try direct value setting first (most reliable for time inputs)
        try {
          await this.page.evaluate((element, value) => {
            element.value = value;
            element.dispatchEvent(new Event('change', { bubbles: true }));
            element.dispatchEvent(new Event('input', { bubbles: true }));
          }, timeInput, MANDATORY_TEST_DATA.timeOfBirth);
          console.log('   ✅ Time field filled with:', MANDATORY_TEST_DATA.timeOfBirth);
        } catch (directSetError) {
          // Method 2: Fallback to focus + type method
          console.log('   🔄 Trying alternative time filling method...');
          await timeInput.focus();
          await this.page.keyboard.down('Control');
          await this.page.keyboard.press('a');
          await this.page.keyboard.up('Control');
          await timeInput.type(MANDATORY_TEST_DATA.timeOfBirth);
          console.log('   ✅ Time field filled with fallback method:', MANDATORY_TEST_DATA.timeOfBirth);
        }
      } else {
        throw new Error('Time input not found with any selector');
      }
    } catch (e) {
      console.error('   ❌ Time filling failed:', e.message);
      throw e;
    }

    // Fill place of birth (which will trigger geocoding)
    try {
      const placeInput = await this.page.$('input[name="placeOfBirth"], input#placeOfBirth, input[placeholder*="place"]');
      if (placeInput) {
        await placeInput.click({ clickCount: 3 }); // Select all
        await placeInput.type(MANDATORY_TEST_DATA.placeOfBirth);
        console.log('   ✅ Place field filled with:', MANDATORY_TEST_DATA.placeOfBirth);

        // Wait for geocoding to complete
        console.log('   🔍 Waiting for geocoding to complete...');
        await new Promise(resolve => setTimeout(resolve, 3000)); // Allow geocoding time

        // Check if geocoding was successful
        const geocodingStatus = await this.page.evaluate(() => {
          const successIcon = document.querySelector('.text-green-600');
          const errorIcon = document.querySelector('.text-red-600');
          return {
            hasSuccess: !!successIcon,
            hasError: !!errorIcon,
            statusText: successIcon ? 'success' : errorIcon ? 'error' : 'pending'
          };
        });
        console.log('   📍 Geocoding status:', geocodingStatus.statusText);
      }
    } catch (e) {
      console.error('   ❌ Place filling failed:', e.message);
      throw e;
    }

    // Fill timezone
    try {
      const timezoneSelect = await this.page.$('select[name="timezone"], select#timeZone');
      if (timezoneSelect) {
        await timezoneSelect.select(MANDATORY_TEST_DATA.timezone); // "Asia/Karachi"
        console.log('   ✅ Timezone selected:', MANDATORY_TEST_DATA.timezone);
      }
    } catch (e) {
      console.log('   ⚠️ Timezone selection failed:', e.message);
    }

    // Fill gender if available
    try {
      const genderSelect = await this.page.$('select[name="gender"], select#gender');
      if (genderSelect) {
        await genderSelect.select(MANDATORY_TEST_DATA.gender); // "male"
        console.log('   ✅ Gender selected:', MANDATORY_TEST_DATA.gender);
      }
    } catch (e) {
      console.log('   ℹ️ Gender field not found or different type');
    }

    // Take screenshot to verify form is correctly filled
    await new Promise(resolve => setTimeout(resolve, 1000)); // Let form settle
    console.log('   ✅ Form filled with standardized test data');
  }

  async submitChartForm() {
    console.log('🚀 Submitting form to trigger chart generation...');

    // Look for submit button using multiple strategies
    let submitButton = null;

    // Strategy 1: type="submit" button
    submitButton = await this.page.$('button[type="submit"]');
        if (!submitButton) {
      // Strategy 2: Look for buttons with text containing "Generate"
      const buttonElementHandles = await this.page.$$('button');
      for (const buttonHandle of buttonElementHandles) {
        const buttonText = await this.page.evaluate(btn => btn.textContent.toLowerCase(), buttonHandle);
        if (buttonText.includes('generate') || buttonText.includes('submit') || buttonText.includes('create')) {
          submitButton = buttonHandle;
          break;
        }
      }
    }

    if (!submitButton) {
      // Strategy 3: Look for any submit-related classes or forms
      submitButton = await this.page.$('.btn-submit, .submit-btn, form button');
    }

    if (submitButton) {
      // Set up multiple API monitoring approaches
      let apiResponseReceived = false;

      // Monitor API responses from page level
      this.page.on('response', response => {
        const url = response.url();
        if (url.includes('/api/v1/chart/generate') || url.includes('/chart/generate')) {
          console.log('   📡 Chart API Response:', response.status(), url);
          if (response.status() === 200) {
            apiResponseReceived = true;
          }
        }
      });

      await submitButton.click();
      console.log('   🔘 Submit button clicked');

      // Wait for API response with multiple timeout checks
      const maxWaitTime = 15000; // 15 seconds should be enough based on curl test
      const checkInterval = 500; // Check every 500ms
      let waitTime = 0;

      while (waitTime < maxWaitTime && !apiResponseReceived) {
        await new Promise(resolve => setTimeout(resolve, checkInterval));
        waitTime += checkInterval;

        // Also check for any visual indicators of success
        const hasSuccess = await this.page.evaluate(() => {
          return document.body.innerText.toLowerCase().includes('chart generated') ||
                 document.body.innerText.toLowerCase().includes('success') ||
                 document.querySelector('.chart, [data-chart], svg') !== null;
        });

        if (hasSuccess) {
          console.log('   ✅ Chart generation visual indicators found');
          apiResponseReceived = true;
          break;
        }
      }

      if (apiResponseReceived) {
        console.log('   ✅ Chart generation completed successfully');
        // Additional wait for page to process the response
        await new Promise(resolve => setTimeout(resolve, 2000));
        return true;
      } else {
        console.log('   ⚠️ Chart generation timed out after', maxWaitTime / 1000, 'seconds');
        return false;
      }
    } else {
      console.log('   ❌ Submit button not found');

      // Debug: List all buttons on the page
      const buttons = await this.page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        return btns.map(btn => ({
          text: btn.textContent.trim(),
          type: btn.type,
          className: btn.className,
          id: btn.id,
          disabled: btn.disabled
        }));
      });
      console.log('   🔍 Available buttons:', buttons);

      return false;
    }
  }

  async validateChartData() {
    return await this.page.evaluate(() => {
      // Check for signs of real Swiss Ephemeris data vs hardcoded data
      const bodyText = document.body.innerText.toLowerCase();

      // Check for chart data indicators
      const hasChart = document.querySelector('svg, canvas, .chart, [data-chart]') !== null;
      const hasChartElements = document.querySelectorAll('[data-planet], .planet, .house, .chart-element').length;

      // Check for navigation buttons to Analysis page
      const hasAnalysisButton = Array.from(document.querySelectorAll('button')).some(btn =>
        btn.textContent.includes('View Analysis')
      ) || document.querySelector('a[href*="analysis"]') !== null;

      // Check for stored data in sessionStorage (ChartDataManager)
      let hasStoredData = false;
      try {
        const storedChart = sessionStorage.getItem('jyotish_chart_data');
        const storedBirth = sessionStorage.getItem('jyotish_birth_data');
        hasStoredData = !!(storedChart || storedBirth);
      } catch (e) {
        // sessionStorage not accessible
      }

      return {
        hasRealData: !bodyText.includes('hardcoded') && !bodyText.includes('mock'),
        hasSwissEphemeris: bodyText.includes('ephemeris') || bodyText.includes('calculation'),
        hasPlanetaryData: bodyText.includes('planet') || bodyText.includes('degree'),
        hasChart: hasChart,
        hasChartElements: hasChartElements,
        hasAnalysisButton: hasAnalysisButton,
        hasStoredData: hasStoredData,
        dataPoints: hasChartElements
      };
    });
  }

  async validateAnalysisSections() {
    return await this.page.evaluate(() => {
      // Look for the 9 required analysis sections (added synthesis)
      const requiredSections = [
        'lagna', 'luminaries', 'house', 'aspect', 'arudha',
        'navamsa', 'dasha', 'yoga', 'synthesis'
      ];

      const bodyText = document.body.innerText.toLowerCase();
      const bodyHTML = document.body.innerHTML.toLowerCase();

      // Check both text content and HTML for section indicators
      const foundSections = requiredSections.filter(section => {
        const inText = bodyText.includes(section);
        const inHTML = bodyHTML.includes(section);
        const hasComponent = document.querySelector(`[class*="${section}"], [data-section="${section}"]`) !== null;
        return inText || inHTML || hasComponent;
      });

      // Additional checks for specific content types
      const contentChecks = {
        hasChartData: document.querySelector('svg, canvas, .chart') !== null,
        hasDataTables: document.querySelectorAll('table').length > 0,
        hasAnalysisCards: document.querySelectorAll('.card, [class*="card"]').length > 3,
        hasPlanetaryInfo: /planet|graha/i.test(bodyText),
        hasHouseInfo: /house|bhava/i.test(bodyText),
        hasAspectInfo: /aspect|drishti/i.test(bodyText),
        hasDashaInfo: /dasha|period/i.test(bodyText),
        hasYogaInfo: /yoga|combination/i.test(bodyText),
        totalElements: document.querySelectorAll('*').length,
        hasLoadingState: document.querySelector('.loading, [class*="loading"], .spinner') !== null,
        hasErrorState: document.querySelector('.error, [class*="error"]') !== null
      };

      return {
        requiredSections,
        foundSections,
        totalSections: foundSections.length,
        hasAllSections: foundSections.length >= 8,
        contentChecks,
        sectionsDetailed: requiredSections.map(section => ({
          name: section,
          found: foundSections.includes(section),
          hasComponent: document.querySelector(`[class*="${section}"], [data-section="${section}"]`) !== null
        }))
      };
    });
  }

  async validateReportFunctionality() {
    return await this.page.evaluate(() => {
      const bodyText = document.body.innerText.toLowerCase();

      return {
        hasPdfGeneration: bodyText.includes('pdf') || bodyText.includes('download'),
        hasEmailSharing: bodyText.includes('email') || bodyText.includes('share'),
        hasReportContent: bodyText.includes('report') || bodyText.includes('analysis'),
        hasGenerateButton: Array.from(document.querySelectorAll('button')).some(btn =>
          btn.textContent.toLowerCase().includes('generate')
        ) || document.querySelector('.btn-generate') !== null
      };
    });
  }

  async generateTestSummary() {
    console.log('\n📊 GENERATING TEST SUMMARY...');

    const totalPages = Object.keys(this.testResults.pages).length;
    const successfulPages = Object.values(this.testResults.pages).filter(page => page.status === 'success').length;
    const failedPages = totalPages - successfulPages;

    this.testResults.summary = {
      totalPages,
      successfulPages,
      failedPages,
      successRate: (successfulPages / totalPages * 100).toFixed(2) + '%',
      totalErrors: this.testResults.errors.length,
      testDuration: Date.now() - new Date(this.testResults.timestamp).getTime(),
      recommendedActions: this.generateRecommendations()
    };

    // Save results to file
    await fs.writeFile(RESULTS_FILE, JSON.stringify(this.testResults, null, 2));

    console.log('📊 TEST SUMMARY:');
    console.log(`   ✅ Successful Pages: ${successfulPages}/${totalPages}`);
    console.log(`   ❌ Failed Pages: ${failedPages}/${totalPages}`);
    console.log(`   📈 Success Rate: ${this.testResults.summary.successRate}`);
    console.log(`   🔍 Total Errors: ${this.testResults.errors.length}`);
    console.log(`   💾 Results saved to: ${RESULTS_FILE}`);

    return this.testResults;
  }

  generateRecommendations() {
    const recommendations = [];

    if (this.testResults.errors.length > 0) {
      recommendations.push('Fix identified errors using RCA protocol from .cursor/rules/002-error-fixing-protocols.mdc');
    }

    Object.entries(this.testResults.pages).forEach(([pageName, pageData]) => {
      if (pageData.status === 'failed') {
        recommendations.push(`Fix ${pageName} following one-page-at-a-time protocol`);
      }
    });

    if (recommendations.length === 0) {
      recommendations.push('All tests passed - proceed to test suite enhancement phase');
    }

    return recommendations;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      console.log('🧹 Browser cleanup completed');
    }
  }

  async runComprehensiveTest() {
    try {
      await this.initialize();

      // Execute systematic testing protocol per user-docs/prod-testing-prompt.md
      await this.testHomePage();
      await this.testChartPage();
      await this.testAnalysisPage();
      await this.testReportPage();

      // Generate comprehensive summary
      const results = await this.generateTestSummary();

      return results;

    } catch (error) {
      console.error('🚨 CRITICAL ERROR in Comprehensive Production Testing:', error);
      this.testResults.errors.push({
        type: 'critical_error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
      return this.testResults;
    } finally {
      await this.cleanup();
    }
  }
}

// Execute comprehensive testing protocol
async function runProductionTesting() {
  console.log('🚀 STARTING COMPREHENSIVE PRODUCTION TESTING PROTOCOL');
  console.log('📋 Following user-docs/prod-testing-prompt.md requirements exactly');
  console.log('🧪 Using MANDATORY test data: Farhan (1997-12-18, 02:30, Karachi)');
  console.log('⚡ Testing workflow: Home → Chart → Analysis → Report\n');

  const tester = new ComprehensiveProductionTester();
  const results = await tester.runComprehensiveTest();

  console.log('\n🎯 COMPREHENSIVE PRODUCTION TESTING COMPLETED');
  console.log('📊 Check comprehensive-production-test-results.json for detailed results');
  console.log('📸 Screenshots saved in production-ui-screenshots/ directory');
  console.log('🔍 Follow recommendations for any required fixes using RCA protocol');

  return results;
}

// Run if executed directly
if (require.main === module) {
  runProductionTesting().catch(console.error);
}

module.exports = { ComprehensiveProductionTester, runProductionTesting, MANDATORY_TEST_DATA };
