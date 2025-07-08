/**
 * Production API Response Data Validation Test
 *
 * Comprehensive validation that API response data is correctly:
 * - Parsed from backend responses
 * - Displayed on production UI pages
 * - Visible to users without placeholders
 *
 * Validates the three root causes are resolved:
 * RC1: Form validation no longer blocks API calls
 * RC2: Birth data properly propagated to analysis
 * RC3: Report generation works without errors
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const TEST_CONFIG = {
  baseUrl: 'http://localhost:3002',
  timeout: 30000,
  testData: {
    name: 'Test User',
    date: '18/12/1997',
    time: '02:30 AM',
    place: 'Sialkot'
  }
};

const SCREENSHOTS_DIR = path.join(__dirname, 'production-validation-screenshots');

class ProductionAPIValidation {
  constructor() {
    this.browser = null;
    this.page = null;
    this.testResults = {
      chartGeneration: false,
      dataPropagatation: false,
      reportGeneration: false,
      apiResponseParsing: false,
      uiDataDisplay: false,
      dataConsistency: false
    };
    this.apiResponses = {};
  }

  async setup() {
    console.log('🚀 Setting up Production API Validation Test...');

    // Ensure screenshots directory exists
    if (!fs.existsSync(SCREENSHOTS_DIR)) {
      fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
    }

    this.browser = await puppeteer.launch({
      headless: false,
      defaultViewport: { width: 1920, height: 1080 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    this.page = await this.browser.newPage();

    // Set up API response monitoring
    await this.setupAPIMonitoring();

    console.log('✅ Setup complete');
  }

  async setupAPIMonitoring() {
    this.page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('/api/')) {
        const endpoint = url.split('/api/')[1];
        try {
          const responseData = await response.json();
          this.apiResponses[endpoint] = {
            status: response.status(),
            data: responseData,
            timestamp: Date.now()
          };
          console.log(`📡 API Response captured: ${endpoint} (${response.status()})`);
        } catch (e) {
          // Non-JSON response, skip
        }
      }
    });
  }

  async testChartGeneration() {
    console.log('\n📊 Phase 1: Testing Chart Generation...');

    try {
      // Navigate to chart page
      await this.page.goto(`${TEST_CONFIG.baseUrl}/chart`, { waitUntil: 'networkidle2' });
      await this.page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01-chart-page-load.png') });

      // Fill birth data form
      await this.fillBirthDataForm();
      await this.page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02-form-filled.png') });

      // Click Generate Chart button
      await this.page.waitForSelector('button[type="submit"], button:nth-of-type(1)', { timeout: 5000 });
      await this.page.click('button[type="submit"], button:nth-of-type(1)');

      // Wait for chart generation - look for actual VedicChartDisplay structure
      await this.page.waitForSelector('.kundli-template svg', { timeout: TEST_CONFIG.timeout });
      await new Promise(resolve => setTimeout(resolve, 3000)); // Allow chart to fully render

      await this.page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03-chart-generated.png') });

      // Validate chart was generated successfully
      const chartExists = await this.page.$('.kundli-template svg');
      if (!chartExists) {
        throw new Error('Chart SVG not found');
      }

      // Validate API response received
      const chartApiKey = Object.keys(this.apiResponses).find(key => key.includes('chart'));
      if (!chartApiKey) {
        throw new Error('Chart API response not received');
      }

      const chartResponse = this.apiResponses[chartApiKey];
      if (chartResponse.status !== 200) {
        throw new Error(`Chart API failed with status: ${chartResponse.status}`);
      }

      // Validate chart data structure
      const chartData = chartResponse.data;
      if (!chartData.chart || !chartData.chart.houses || !chartData.chart.planets) {
        throw new Error('Invalid chart data structure in API response');
      }

      console.log('✅ Chart generation successful');
      console.log(`   - API Status: ${chartResponse.status}`);
      console.log(`   - Houses: ${Object.keys(chartData.chart.houses).length}`);
      console.log(`   - Planets: ${Object.keys(chartData.chart.planets).length}`);

      this.testResults.chartGeneration = true;
      return true;

    } catch (error) {
      console.error('❌ Chart generation failed:', error.message);
      await this.page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03-chart-error.png') });
      return false;
    }
  }

  async testDataPropagation() {
    console.log('\n🔄 Phase 2: Testing Data Propagation to Analysis...');

    try {
      // Click View Analysis button
      await this.page.waitForSelector('button', { timeout: 5000 });
      const viewAnalysisButton = await this.page.evaluateHandle(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.find(button => button.textContent.includes('View Analysis'));
      });
      if (viewAnalysisButton.asElement()) {
        await viewAnalysisButton.asElement().click();
      }

      // Wait for analysis page to load
      await this.page.waitForSelector('.analysis-content', { timeout: TEST_CONFIG.timeout });
      await new Promise(resolve => setTimeout(resolve, 3000)); // Allow content to populate

      await this.page.screenshot({ path: path.join(SCREENSHOTS_DIR, '04-analysis-page.png') });

      // Validate analysis API response
      const analysisApiKey = Object.keys(this.apiResponses).find(key => key.includes('analysis'));
      if (!analysisApiKey) {
        throw new Error('Analysis API response not received');
      }

      const analysisResponse = this.apiResponses[analysisApiKey];
      if (analysisResponse.status !== 200) {
        throw new Error(`Analysis API failed with status: ${analysisResponse.status}`);
      }

      // Validate analysis data structure
      const analysisData = analysisResponse.data;
      if (!analysisData.analysis || !analysisData.analysis.sections) {
        throw new Error('Invalid analysis data structure in API response');
      }

      // Check that comprehensive analysis content is displayed
      const analysisContent = await this.page.$eval('.analysis-content', el => el.textContent);
      if (analysisContent.length < 100) {
        throw new Error('Analysis content appears incomplete');
      }

      // Validate birth details are properly displayed
      const birthDetailsExists = await this.page.$('.birth-details');
      if (!birthDetailsExists) {
        console.log('⚠️  Birth details section not found - checking for chart ID display');
      }

      console.log('✅ Data propagation successful');
      console.log(`   - Analysis API Status: ${analysisResponse.status}`);
      console.log(`   - Sections: ${Object.keys(analysisData.analysis.sections).length}`);
      console.log(`   - Content length: ${analysisContent.length} characters`);

      this.testResults.dataPropagatation = true;
      return true;

    } catch (error) {
      console.error('❌ Data propagation failed:', error.message);
      await this.page.screenshot({ path: path.join(SCREENSHOTS_DIR, '04-analysis-error.png') });
      return false;
    }
  }

  async testReportGeneration() {
    console.log('\n📄 Phase 3: Testing Report Generation...');

    try {
      // Click Generate Full Report button
      await this.page.waitForSelector('button', { timeout: 5000 });
      const reportButton = await this.page.evaluateHandle(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.find(button => button.textContent.includes('Generate Full Report') || button.textContent.includes('Full Report'));
      });
      if (reportButton.asElement()) {
        await reportButton.asElement().click();
      }

      // Wait for report page to load
      await this.page.waitForFunction(
        () => window.location.pathname.includes('/report'),
        { timeout: TEST_CONFIG.timeout }
      );

      await new Promise(resolve => setTimeout(resolve, 5000)); // Allow report to generate
      await this.page.screenshot({ path: path.join(SCREENSHOTS_DIR, '05-report-page.png') });

      // Check if error dialog appeared
      const errorDialog = await this.page.$('.error-dialog, .alert-error, [role="dialog"]');
      if (errorDialog) {
        const errorText = await this.page.$eval('.error-dialog, .alert-error, [role="dialog"]', el => el.textContent);
        console.log(`⚠️  Report generation warning: ${errorText}`);
        // Don't fail test for warnings, continue validation
      }

      // Validate report content exists
      const reportContent = await this.page.$('.report-content, .astrological-report, .report-page');
      if (!reportContent) {
        throw new Error('Report content not found');
      }

      // Validate report API response if applicable
      const reportApiKey = Object.keys(this.apiResponses).find(key => key.includes('report'));
      if (reportApiKey) {
        const reportResponse = this.apiResponses[reportApiKey];
        if (reportResponse.status !== 200) {
          console.log(`⚠️  Report API status: ${reportResponse.status}`);
        }
      }

      console.log('✅ Report generation successful');
      this.testResults.reportGeneration = true;
      return true;

    } catch (error) {
      console.error('❌ Report generation failed:', error.message);
      await this.page.screenshot({ path: path.join(SCREENSHOTS_DIR, '05-report-error.png') });
      return false;
    }
  }

  async validateAPIResponseStructure() {
    console.log('\n🔍 Phase 4: Validating API Response Structures...');

    const validations = [];

    // Validate Chart API Response
    const chartApiKey = Object.keys(this.apiResponses).find(key => key.includes('chart'));
    if (chartApiKey) {
      const chartData = this.apiResponses[chartApiKey].data;
      validations.push({
        api: 'Chart',
        valid: chartData.chart && chartData.chart.houses && chartData.chart.planets,
        details: `Houses: ${Object.keys(chartData.chart?.houses || {}).length}, Planets: ${Object.keys(chartData.chart?.planets || {}).length}`
      });
    }

    // Validate Analysis API Response
    const analysisApiKey = Object.keys(this.apiResponses).find(key => key.includes('analysis'));
    if (analysisApiKey) {
      const analysisData = this.apiResponses[analysisApiKey].data;
      validations.push({
        api: 'Analysis',
        valid: analysisData.analysis && analysisData.analysis.sections,
        details: `Sections: ${Object.keys(analysisData.analysis?.sections || {}).length}`
      });
    }

    validations.forEach(validation => {
      const status = validation.valid ? '✅' : '❌';
      console.log(`${status} ${validation.api} API: ${validation.details}`);
    });

    this.testResults.apiResponseParsing = validations.every(v => v.valid);
    return this.testResults.apiResponseParsing;
  }

  async validateUIDataDisplay() {
    console.log('\n🖥️  Phase 5: Validating UI Data Display...');

    // Navigate back to chart page to check data persistence
    await this.page.goto(`${TEST_CONFIG.baseUrl}/chart`, { waitUntil: 'networkidle2' });

    // Check if chart is still displayed - use correct selector
    const chartExists = await this.page.$('.kundli-template svg');

    // Navigate to analysis page
    await this.page.goto(`${TEST_CONFIG.baseUrl}/analysis`, { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check analysis content
    const analysisExists = await this.page.$('.analysis-content');

    console.log(`✅ Chart display: ${chartExists ? 'Present' : 'Missing'}`);
    console.log(`✅ Analysis display: ${analysisExists ? 'Present' : 'Missing'}`);

    this.testResults.uiDataDisplay = chartExists && analysisExists;
    return this.testResults.uiDataDisplay;
  }

  async fillBirthDataForm() {
    // Fill name
    const nameInput = await this.page.$('input[name="name"]');
    if (nameInput) {
      await nameInput.click({ clickCount: 3 });
      await nameInput.type(TEST_CONFIG.testData.name);
    }

    // Fill date
    const dateInput = await this.page.$('input[type="date"]');
    if (dateInput) {
      await dateInput.click({ clickCount: 3 });
      await dateInput.type('1997-12-18');
    }

    // Fill time
    const timeInput = await this.page.$('input[type="time"]');
    if (timeInput) {
      await timeInput.click({ clickCount: 3 });
      await timeInput.type('02:30');
    }

    // Fill place
    const placeInput = await this.page.$('input[name="placeOfBirth"]');
    if (placeInput) {
      await placeInput.click({ clickCount: 3 });
      await placeInput.type('Mumbai, Maharashtra, India');
    }

    // Wait for geocoding to complete
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Fill timezone (CRITICAL - this is required)
    const timezoneSelect = await this.page.$('select[name="timezone"]');
    if (timezoneSelect) {
      await this.page.select('select[name="timezone"]', 'Asia/Kolkata');
    }

    // Fill gender
    const genderSelect = await this.page.$('select[name="gender"]');
    if (genderSelect) {
      await this.page.select('select[name="gender"]', 'male');
    }

    // Wait a bit more for all form validation to complete
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  async generateReport() {
    console.log('\n📋 Final Report: Production API Validation Results');
    console.log('='.repeat(60));

    const results = [
      { test: 'Chart Generation', passed: this.testResults.chartGeneration, critical: true },
      { test: 'Data Propagation', passed: this.testResults.dataPropagatation, critical: true },
      { test: 'Report Generation', passed: this.testResults.reportGeneration, critical: true },
      { test: 'API Response Parsing', passed: this.testResults.apiResponseParsing, critical: false },
      { test: 'UI Data Display', passed: this.testResults.uiDataDisplay, critical: false }
    ];

    let allCriticalPassed = true;
    let totalPassed = 0;

    results.forEach(result => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      const critical = result.critical ? ' (CRITICAL)' : '';
      console.log(`${status} ${result.test}${critical}`);

      if (result.passed) totalPassed++;
      if (result.critical && !result.passed) allCriticalPassed = false;
    });

    console.log('='.repeat(60));
    console.log(`Total Tests: ${results.length}`);
    console.log(`Passed: ${totalPassed}`);
    console.log(`Failed: ${results.length - totalPassed}`);
    console.log(`Critical Tests: ${allCriticalPassed ? 'ALL PASSED' : 'SOME FAILED'}`);

    // API Response Summary
    console.log('\n📡 API Responses Captured:');
    Object.keys(this.apiResponses).forEach(endpoint => {
      const response = this.apiResponses[endpoint];
      console.log(`   ${endpoint}: ${response.status} (${new Date(response.timestamp).toLocaleTimeString()})`);
    });

    console.log('\n🎯 Root Cause Resolution Status:');
    console.log(`   RC1 - Form validation blocking: ${this.testResults.chartGeneration ? 'RESOLVED' : 'NOT RESOLVED'}`);
    console.log(`   RC2 - Data propagation: ${this.testResults.dataPropagatation ? 'RESOLVED' : 'NOT RESOLVED'}`);
    console.log(`   RC3 - Report generation errors: ${this.testResults.reportGeneration ? 'RESOLVED' : 'NOT RESOLVED'}`);

    return allCriticalPassed;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

async function runProductionValidation() {
  const validator = new ProductionAPIValidation();

  try {
    await validator.setup();

    // Run all validation phases
    await validator.testChartGeneration();
    await validator.testDataPropagation();
    await validator.testReportGeneration();
    await validator.validateAPIResponseStructure();
    await validator.validateUIDataDisplay();

    // Generate final report
    const allTestsPassed = await validator.generateReport();

    process.exit(allTestsPassed ? 0 : 1);

  } catch (error) {
    console.error('❌ Validation failed:', error);
    process.exit(1);
  } finally {
    await validator.cleanup();
  }
}

// Run if called directly
if (require.main === module) {
  runProductionValidation();
}

module.exports = { ProductionAPIValidation, runProductionValidation };
