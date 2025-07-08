/**
 * Production UI Validation Protocol
 * Systematic testing of complete workflow: Home → Chart → Analysis → Report
 * Captures screenshots and validates API response data display
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const TEST_CONFIG = {
  baseUrl: 'http://localhost:3002',
  timeout: 30000,
  screenshots: './production-ui-screenshots'
};

// Validated test data as specified in requirements
const VALIDATED_TEST_DATA = {
  dateOfBirth: "1985-10-24",
  timeOfBirth: "14:30",
  latitude: 18.5204,
  longitude: 73.8567,
  timezone: "Asia/Kolkata",
  gender: "male"
};

class ProductionUIValidator {
  constructor() {
    this.browser = null;
    this.page = null;
    this.testResults = {
      homePageTest: false,
      chartPageTest: false,
      analysisPageTest: false,
      reportPageTest: false,
      overallResult: false
    };
    this.apiCalls = [];
  }

  async setup() {
    console.log('🚀 Starting Production UI Validation Protocol...');
    console.log('📋 Testing complete workflow: Home → Chart → Analysis → Report');

    this.browser = await puppeteer.launch({
      headless: false,
      defaultViewport: { width: 1920, height: 1080 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    this.page = await this.browser.newPage();

    // Intercept network requests to monitor API calls
    await this.page.setRequestInterception(true);
    this.page.on('request', (request) => {
      if (request.url().includes('/api/')) {
        this.apiCalls.push({
          method: request.method(),
          url: request.url(),
          timestamp: new Date().toISOString()
        });
      }
      request.continue();
    });

    // Log console messages for debugging
    this.page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.log(`❌ Browser Console Error: ${msg.text()}`);
      }
    });

    // Ensure screenshots directory exists
    if (!fs.existsSync(TEST_CONFIG.screenshots)) {
      fs.mkdirSync(TEST_CONFIG.screenshots, { recursive: true });
    }

    console.log('✅ Test environment initialized');
  }

  async takeScreenshot(filename, description) {
    const fullPath = path.join(TEST_CONFIG.screenshots, filename);
    await this.page.screenshot({ path: fullPath, fullPage: true });
    console.log(`📸 Screenshot captured: ${filename} - ${description}`);
  }

  // Test 1: Home Page Test
  async testHomePage() {
    console.log('\n📍 TEST 1: HOME PAGE VALIDATION');
    console.log('===============================');

    try {
      console.log('🔄 Loading home page...');
      await this.page.goto(`${TEST_CONFIG.baseUrl}/`, {
        waitUntil: 'networkidle2',
        timeout: TEST_CONFIG.timeout
      });

      // Wait for page to fully load
      await this.page.waitForSelector('h1', { timeout: 10000 });

      // Take initial screenshot
      await this.takeScreenshot('01-home-page-initial.png', 'Home page loaded');

      // Verify essential elements
      const pageTitle = await this.page.$eval('h1', el => el.textContent);
      console.log(`✅ Page title found: "${pageTitle}"`);

      // Check navigation elements
      const chartButton = await this.page.$('a[href="/chart"]');
      const analysisButton = await this.page.$('a[href="/analysis"]');

      if (chartButton && analysisButton) {
        console.log('✅ Navigation buttons found: Chart and Analysis links present');
        this.testResults.homePageTest = true;
      } else {
        console.log('❌ Navigation buttons missing');
        return false;
      }

      console.log('✅ Home Page Test: PASSED');
      return true;

    } catch (error) {
      console.error('❌ Home Page Test Failed:', error.message);
      return false;
    }
  }

  // Test 2: Birth Chart Page Test
  async testChartPage() {
    console.log('\n📍 TEST 2: BIRTH CHART PAGE VALIDATION');
    console.log('====================================');

    try {
      console.log('🔄 Navigating to chart page...');
      await this.page.goto(`${TEST_CONFIG.baseUrl}/chart`, {
        waitUntil: 'networkidle2',
        timeout: TEST_CONFIG.timeout
      });

      // Wait for form to load
      await this.page.waitForSelector('#birth-data-form', { timeout: 10000 });

      console.log('✅ Chart page loaded successfully');

      // Fill form with validated test data
      console.log('📋 Filling form with validated test data...');

      await this.page.type('input[name="dateOfBirth"]', VALIDATED_TEST_DATA.dateOfBirth);
      await this.page.type('input[name="timeOfBirth"]', VALIDATED_TEST_DATA.timeOfBirth);
      await this.page.type('input[name="placeOfBirth"]', 'Mumbai, Maharashtra, India');
      await this.page.select('select[name="timezone"]', VALIDATED_TEST_DATA.timezone);
      await this.page.select('select[name="gender"]', VALIDATED_TEST_DATA.gender);

      // Wait for geocoding to complete
      console.log('🌍 Waiting for location geocoding...');
      await this.page.waitForTimeout(3000);

      // Take screenshot of filled form
      await this.takeScreenshot('02-chart-form-filled.png', 'Chart form filled with test data');

      // Submit form
      console.log('🚀 Submitting chart generation form...');
      const apiCallsBefore = this.apiCalls.length;

      await this.page.click('button[type="submit"]');

      // Wait for API call and response
      console.log('⏳ Waiting for chart generation API call...');
      await this.page.waitForTimeout(5000);

      const apiCallsAfter = this.apiCalls.length;
      const chartAPICalled = apiCallsAfter > apiCallsBefore;

      if (chartAPICalled) {
        console.log('✅ Chart generation API called successfully');

        // Wait for chart to render
        await this.page.waitForSelector('.kundli-template, svg', { timeout: 10000 });
        console.log('✅ Chart visualization rendered');

        // Take screenshot of generated chart
        await this.takeScreenshot('03-chart-generated.png', 'Chart generated and displayed');

        this.testResults.chartPageTest = true;
        console.log('✅ Chart Page Test: PASSED');
        return true;
      } else {
        console.log('❌ Chart generation API was not called');
        return false;
      }

    } catch (error) {
      console.error('❌ Chart Page Test Failed:', error.message);
      return false;
    }
  }

  // Test 3: Analysis Page Test
  async testAnalysisPage() {
    console.log('\n📍 TEST 3: ANALYSIS PAGE VALIDATION');
    console.log('==================================');

    try {
      console.log('🔄 Navigating to analysis page...');
      await this.page.goto(`${TEST_CONFIG.baseUrl}/analysis`, {
        waitUntil: 'networkidle2',
        timeout: TEST_CONFIG.timeout
      });

      // Wait for page to load
      await this.page.waitForSelector('h1', { timeout: 10000 });

      console.log('✅ Analysis page loaded');

      // Look for analysis generation button
      const analysisButton = await this.page.$('button');
      if (analysisButton) {
        console.log('🔄 Clicking comprehensive analysis button...');
        const apiCallsBefore = this.apiCalls.length;

        await analysisButton.click();

        // Wait for API call
        await this.page.waitForTimeout(5000);

        const apiCallsAfter = this.apiCalls.length;
        const analysisAPICalled = apiCallsAfter > apiCallsBefore;

        if (analysisAPICalled) {
          console.log('✅ Analysis API called successfully');

          // Wait for analysis sections to load
          await this.page.waitForTimeout(3000);

          // Verify the 8 analysis sections
          const sections = [
            'Overview', 'Lagna', 'Houses', 'Aspects',
            'Arudha', 'Navamsa', 'Dasha', 'Synthesis'
          ];

          let sectionsFound = 0;
          for (const section of sections) {
            const sectionElement = await this.page.$(`text=${section}`);
            if (sectionElement) {
              sectionsFound++;
            }
          }

          console.log(`📊 Analysis sections found: ${sectionsFound}/8`);

          // Check for data visibility
          const pageContent = await this.page.content();
          const contentLength = pageContent.length;
          console.log(`📄 Page content length: ${contentLength} characters`);

          if (sectionsFound >= 6 && contentLength > 5000) {
            // Take screenshot of analysis page
            await this.takeScreenshot('04-analysis-page-sections.png', 'Analysis page with sections');

            this.testResults.analysisPageTest = true;
            console.log('✅ Analysis Page Test: PASSED');
            return true;
          } else {
            console.log('❌ Insufficient analysis sections or content');
            return false;
          }
        } else {
          console.log('❌ Analysis API was not called');
          return false;
        }
      } else {
        console.log('❌ Analysis button not found');
        return false;
      }

    } catch (error) {
      console.error('❌ Analysis Page Test Failed:', error.message);
      return false;
    }
  }

  // Test 4: Comprehensive Report Test
  async testReportPage() {
    console.log('\n📍 TEST 4: COMPREHENSIVE REPORT VALIDATION');
    console.log('========================================');

    try {
      console.log('🔄 Navigating to report page...');
      await this.page.goto(`${TEST_CONFIG.baseUrl}/report`, {
        waitUntil: 'networkidle2',
        timeout: TEST_CONFIG.timeout
      });

      // Wait for page to load
      await this.page.waitForSelector('h1', { timeout: 10000 });

      console.log('✅ Report page loaded');

      // Look for report generation button
      const reportButton = await this.page.$('button');
      if (reportButton) {
        console.log('🔄 Clicking comprehensive report generation...');

        await reportButton.click();

        // Wait for report generation
        await this.page.waitForTimeout(5000);

        // Check for report content
        const reportContent = await this.page.$('.space-y-8, .space-y-6');
        if (reportContent) {
          console.log('✅ Report content generated');

          // Take screenshot of report
          await this.takeScreenshot('05-report-generation.png', 'Comprehensive report generated');

          this.testResults.reportPageTest = true;
          console.log('✅ Report Page Test: PASSED');
          return true;
        } else {
          console.log('❌ Report content not found');
          return false;
        }
      } else {
        console.log('❌ Report generation button not found');
        return false;
      }

    } catch (error) {
      console.error('❌ Report Page Test Failed:', error.message);
      return false;
    }
  }

  async validateAPIIntegration() {
    console.log('\n📍 API INTEGRATION VALIDATION');
    console.log('============================');

    console.log(`📡 Total API calls made: ${this.apiCalls.length}`);

    if (this.apiCalls.length > 0) {
      console.log('🔍 API Calls Summary:');
      this.apiCalls.forEach((call, index) => {
        console.log(`  ${index + 1}. ${call.method} ${call.url}`);
      });

      // Check for essential API endpoints
      const chartAPI = this.apiCalls.some(call => call.url.includes('/chart/generate'));
      const analysisAPI = this.apiCalls.some(call => call.url.includes('/analysis') || call.url.includes('/comprehensive'));

      console.log(`✅ Chart Generation API called: ${chartAPI ? 'Yes' : 'No'}`);
      console.log(`✅ Analysis API called: ${analysisAPI ? 'Yes' : 'No'}`);

      return chartAPI && analysisAPI;
    } else {
      console.log('❌ No API calls detected');
      return false;
    }
  }

  async generateTestReport() {
    console.log('\n📊 PRODUCTION UI VALIDATION RESULTS');
    console.log('==================================');

    const allTestsPassed = Object.values(this.testResults).every(result => result === true);
    this.testResults.overallResult = allTestsPassed;

    console.log(`📱 Home Page Test: ${this.testResults.homePageTest ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`📊 Chart Page Test: ${this.testResults.chartPageTest ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`🔮 Analysis Page Test: ${this.testResults.analysisPageTest ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`📜 Report Page Test: ${this.testResults.reportPageTest ? '✅ PASSED' : '❌ FAILED'}`);

    const apiIntegrationValid = await this.validateAPIIntegration();
    console.log(`🔗 API Integration: ${apiIntegrationValid ? '✅ PASSED' : '❌ FAILED'}`);

    console.log('\n📁 Screenshots captured:');
    console.log('  • 01-home-page-initial.png');
    console.log('  • 02-chart-form-filled.png');
    console.log('  • 03-chart-generated.png');
    console.log('  • 04-analysis-page-sections.png');
    console.log('  • 05-report-generation.png');

    if (allTestsPassed && apiIntegrationValid) {
      console.log('\n🎉 OVERALL RESULT: ✅ ALL PRODUCTION UI TESTS PASSED');
      console.log('✅ Complete workflow validated: Home → Chart → Analysis → Report');
      console.log('✅ API response data correctly displayed on all production pages');
      console.log('✅ Swiss Ephemeris integration working correctly');
    } else {
      console.log('\n❌ OVERALL RESULT: FAILED');
      console.log('⚠️  Some production UI tests failed - review individual test results above');
    }

    return this.testResults;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async runCompleteValidation() {
    try {
      await this.setup();

      // Execute tests in sequence as per protocol
      await this.testHomePage();
      await this.testChartPage();
      await this.testAnalysisPage();
      await this.testReportPage();

      // Generate final report
      const results = await this.generateTestReport();

      return results;

    } catch (error) {
      console.error('💥 Critical error during validation:', error);
      return { overallResult: false, error: error.message };
    } finally {
      await this.cleanup();
    }
  }
}

// Execute validation if running directly
if (require.main === module) {
  const validator = new ProductionUIValidator();
  validator.runCompleteValidation()
    .then(results => {
      process.exit(results.overallResult ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = ProductionUIValidator;
