const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

/**
 * Analysis & Report Production Testing Protocol
 * Following requirements from prod-testing-prompt.md
 *
 * Tests: Analysis Page → Comprehensive Analysis Report
 * Validates: Data propagation, API responses, Swiss Ephemeris calculations
 */

class AnalysisReportProductionTester {
  constructor() {
    this.testResults = {
      timestamp: new Date().toISOString(),
      testData: {
        name: "Farhan",
        dateOfBirth: "1997-12-18",
        timeOfBirth: "02:30",
        latitude: 32.4935378,
        longitude: 74.5411575,
        timezone: "Asia/Karachi",
        gender: "male"
      },
      workflow: "Home Page → Birth Chart → Analysis Page → Comprehensive Analysis Report",
      apiValidation: [],
      screenshots: [],
      errors: [],
      dataFlow: [],
      apiResponses: {}
    };

    this.screenshotDir = path.join(__dirname, 'production-ui-screenshots');
    this.baseUrl = 'http://localhost:3002';
    this.apiBaseUrl = 'http://localhost:3001/api';

    this.ensureDirectoryExists();
  }

  ensureDirectoryExists() {
    if (!fs.existsSync(this.screenshotDir)) {
      fs.mkdirSync(this.screenshotDir, { recursive: true });
    }
  }

  async clearTestArtifacts() {
    console.log('🧹 Clearing test artifacts for fresh session...');

    // Clear localStorage, sessionStorage, cookies
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    try {
      await page.goto(this.baseUrl);
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });

      const cookies = await page.cookies();
      if (cookies.length > 0) {
        await page.deleteCookie(...cookies);
      }

      console.log('✅ Test artifacts cleared');
    } catch (error) {
      console.log('⚠️ Error clearing artifacts:', error.message);
    } finally {
      await browser.close();
    }
  }

  async runComprehensiveTest() {
    console.log('🚀 Starting Analysis & Report Production Testing Protocol');
    console.log('📋 Workflow: Home Page → Birth Chart → Analysis Page → Comprehensive Analysis Report');

    await this.clearTestArtifacts();

    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: ['--start-maximized']
    });

    try {
      const page = await browser.newPage();

      // Monitor network requests for API validation
      await this.setupNetworkMonitoring(page);

      // Step 1: Navigate through Birth Chart form to populate data
      await this.navigateAndPopulateBirthChart(page);

      // Step 2: Test Analysis Page
      await this.testAnalysisPage(page);

      // Step 3: Test Comprehensive Analysis Report
      await this.testComprehensiveReport(page);

      // Step 4: Validate API responses contain real Swiss Ephemeris data
      await this.validateApiResponses();

      // Step 5: Generate test summary
      await this.generateTestSummary();

    } catch (error) {
      console.error('❌ Test execution failed:', error);
      this.testResults.errors.push({
        step: 'Test Execution',
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    } finally {
      await browser.close();
    }
  }

  async setupNetworkMonitoring(page) {
    await page.setRequestInterception(true);

    page.on('request', (request) => {
      request.continue();
    });

    page.on('response', async (response) => {
      const url = response.url();

      // Monitor API calls
      if (url.includes('/api/v1/') || url.includes('/api/comprehensive-analysis/')) {
        try {
          const responseData = await response.json();
          this.testResults.apiResponses[url] = {
            status: response.status(),
            statusText: response.statusText(),
            data: responseData,
            timestamp: new Date().toISOString()
          };

          console.log(`📡 API Response captured: ${url} - Status: ${response.status()}`);
        } catch (error) {
          console.log(`⚠️ Could not parse JSON for ${url}:`, error.message);
        }
      }
    });
  }

    async navigateAndPopulateBirthChart(page) {
    console.log('\n🏠 Step 1: Navigate to Home Page and Birth Chart');

    try {
      // Go to Home Page with extended timeout
      await page.goto(this.baseUrl, {
        waitUntil: 'networkidle2',
        timeout: 60000
      });
      console.log('✅ Home page loaded successfully');
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Navigate to Birth Chart
      await page.goto(`${this.baseUrl}/chart`, {
        waitUntil: 'networkidle2',
        timeout: 60000
      });
      console.log('✅ Chart page loaded successfully');

      await page.waitForSelector('form', { timeout: 15000 });
      console.log('✅ Form found on chart page');
    } catch (error) {
      console.error('❌ Navigation failed:', error.message);
      throw new Error(`Navigation failed: ${error.message}`);
    }

    console.log('📝 Filling Birth Chart form with standardized test data...');

    // Fill the form with standardized test data
    const testData = this.testResults.testData;

    // Fill name field if present (optional according to API)
    try {
      await page.waitForSelector('input[name="name"], input[placeholder*="name"], input[placeholder*="Name"]', { timeout: 3000 });
      await page.type('input[name="name"], input[placeholder*="name"], input[placeholder*="Name"]', testData.name);
    } catch (error) {
      console.log('ℹ️ Name field not found or optional');
    }

    // Fill date of birth
    await page.waitForSelector('input[type="date"], input[name*="date"], input[placeholder*="date"]');
    await page.type('input[type="date"], input[name*="date"], input[placeholder*="date"]', testData.dateOfBirth);

    // Fill time of birth
    await page.waitForSelector('input[type="time"], input[name*="time"], input[placeholder*="time"]');
    await page.type('input[type="time"], input[name*="time"], input[placeholder*="time"]', testData.timeOfBirth);

    // Fill place of birth
    await page.waitForSelector('input[name*="place"], input[placeholder*="place"], input[placeholder*="location"]');
    await page.type('input[name*="place"], input[placeholder*="place"], input[placeholder*="location"]', 'Sialkot, Pakistan');

    // Wait for geocoding to complete
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Submit the form
    try {
      // First try standard submit button
      await page.click('button[type="submit"]');
    } catch (error) {
      try {
        // Try to find button by text content
        await page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          const submitButton = buttons.find(btn =>
            btn.textContent.toLowerCase().includes('generate') ||
            btn.textContent.toLowerCase().includes('submit') ||
            btn.classList.contains('btn-vedic-primary')
          );
          if (submitButton) {
            submitButton.click();
          } else {
            throw new Error('Submit button not found');
          }
        });
      } catch (error2) {
        throw new Error('Could not find submit button on the form');
      }
    }

    console.log('⏳ Waiting for chart generation...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    this.testResults.dataFlow.push({
      step: 'Birth Chart Form Submission',
      status: 'completed',
      timestamp: new Date().toISOString(),
      data: testData
    });
  }

  async testAnalysisPage(page) {
    console.log('\n📊 Step 2: Testing Analysis Page');

    try {
      // Navigate to Analysis page with extended timeout
      await page.goto(`${this.baseUrl}/analysis`, {
        waitUntil: 'networkidle2',
        timeout: 60000
      });
      console.log('✅ Analysis page loaded successfully');
      await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (error) {
      console.error('❌ Analysis page navigation failed:', error.message);
      throw new Error(`Analysis page navigation failed: ${error.message}`);
    }

    // Take screenshot: 04-analysis-page-sections.png
    await page.screenshot({
      path: path.join(this.screenshotDir, '04-analysis-page-sections.png'),
      fullPage: true
    });

    this.testResults.screenshots.push('04-analysis-page-sections.png');
    console.log('📸 Screenshot captured: 04-analysis-page-sections.png');

    // Verify analysis sections are displayed
    await this.verifyAnalysisSections(page);

    // Check for data propagation
    await this.checkDataPropagation(page);

    this.testResults.dataFlow.push({
      step: 'Analysis Page Load',
      status: 'completed',
      timestamp: new Date().toISOString(),
      sectionsFound: this.testResults.analysisSections || []
    });
  }

  async verifyAnalysisSections(page) {
    console.log('🔍 Verifying 8 analysis sections are present...');

    const expectedSections = [
      'Lagna & Luminaries Analysis',
      'House Analysis',
      'Planetary Aspects Analysis',
      'Arudha Lagna Analysis',
      'Navamsa Analysis',
      'Dasha Analysis',
      'Yoga Analysis',
      'Synthesis & Remedies'
    ];

    const foundSections = [];

    for (const section of expectedSections) {
      try {
        // Look for section headers or content
        const sectionFound = await page.evaluate((sectionName) => {
          const text = document.body.innerText.toLowerCase();
          return text.includes(sectionName.toLowerCase()) ||
                 text.includes(sectionName.replace(/Analysis|&/g, '').trim().toLowerCase());
        }, section);

        if (sectionFound) {
          foundSections.push(section);
          console.log(`✅ Found: ${section}`);
        } else {
          console.log(`❌ Missing: ${section}`);
          this.testResults.errors.push({
            step: 'Analysis Sections Verification',
            error: `Missing section: ${section}`,
            timestamp: new Date().toISOString()
          });
        }
      } catch (error) {
        console.log(`⚠️ Error checking section ${section}:`, error.message);
      }
    }

    this.testResults.analysisSections = foundSections;
    console.log(`📊 Found ${foundSections.length}/8 expected sections`);
  }

  async checkDataPropagation(page) {
    console.log('🔄 Checking data propagation from Birth Chart form...');

    // Check if birth data is visible in the analysis
    const testData = this.testResults.testData;

    const dataVisible = await page.evaluate((data) => {
      const text = document.body.innerText;

      return {
        nameVisible: text.includes(data.name),
        dateVisible: text.includes(data.dateOfBirth) || text.includes('1997') || text.includes('December 18'),
        timeVisible: text.includes(data.timeOfBirth) || text.includes('02:30') || text.includes('2:30'),
        locationVisible: text.includes('Sialkot') || text.includes('Pakistan') || text.includes('Karachi')
      };
    }, testData);

    this.testResults.dataFlow.push({
      step: 'Data Propagation Check',
      status: 'completed',
      visibility: dataVisible,
      timestamp: new Date().toISOString()
    });

    console.log('📋 Data visibility:', dataVisible);
  }

  async testComprehensiveReport(page) {
    console.log('\n📄 Step 3: Testing Comprehensive Analysis Report');

    try {
      // Navigate to Report page with extended timeout
      await page.goto(`${this.baseUrl}/report`, {
        waitUntil: 'networkidle2',
        timeout: 60000
      });
      console.log('✅ Report page loaded successfully');
      await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (error) {
      console.error('❌ Report page navigation failed:', error.message);
      throw new Error(`Report page navigation failed: ${error.message}`);
    }

    // Take screenshot: 05-report-generation.png
    await page.screenshot({
      path: path.join(this.screenshotDir, '05-report-generation.png'),
      fullPage: true
    });

    this.testResults.screenshots.push('05-report-generation.png');
    console.log('📸 Screenshot captured: 05-report-generation.png');

    // Verify report generation functionality
    await this.verifyReportFeatures(page);

    this.testResults.dataFlow.push({
      step: 'Report Page Load',
      status: 'completed',
      timestamp: new Date().toISOString()
    });
  }

  async verifyReportFeatures(page) {
    console.log('🔍 Verifying report generation features...');

    // Check for PDF generation button
    try {
      const reportButtonFound = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.some(btn => {
          const text = btn.textContent.toLowerCase();
          return text.includes('pdf') || text.includes('generate') || text.includes('download');
        });
      });

      if (reportButtonFound) {
        console.log('✅ Report generation button found');
      } else {
        throw new Error('Report generation button not found');
      }
    } catch (error) {
      console.log('❌ Report generation button not found');
      this.testResults.errors.push({
        step: 'Report Features Verification',
        error: 'Report generation button not found',
        timestamp: new Date().toISOString()
      });
    }

    // Check for email sharing functionality
    try {
      const emailFeature = await page.evaluate(() => {
        const text = document.body.innerText.toLowerCase();
        return text.includes('email') || text.includes('share') || text.includes('send');
      });

      if (emailFeature) {
        console.log('✅ Email sharing feature found');
      } else {
        console.log('❌ Email sharing feature not found');
      }
    } catch (error) {
      console.log('⚠️ Error checking email feature:', error.message);
    }
  }

  async validateApiResponses() {
    console.log('\n🔬 Step 4: Validating API Responses for Real Swiss Ephemeris Data');

    const apiResponses = this.testResults.apiResponses;

    for (const [url, response] of Object.entries(apiResponses)) {
      console.log(`\n🔍 Analyzing API response: ${url}`);

      if (response.status === 200 && response.data) {
        const validation = this.validateSwissEphemerisData(response.data);
        this.testResults.apiValidation.push({
          url,
          status: response.status,
          validation,
          timestamp: new Date().toISOString()
        });

        if (validation.isRealData) {
          console.log('✅ Contains real Swiss Ephemeris calculations');
        } else {
          console.log('❌ Appears to contain hardcoded/mock data');
          this.testResults.errors.push({
            step: 'API Validation',
            error: `Potential hardcoded data in ${url}`,
            details: validation.issues,
            timestamp: new Date().toISOString()
          });
        }
      }
    }
  }

  validateSwissEphemerisData(data) {
    const validation = {
      isRealData: true,
      issues: [],
      checks: {}
    };

    // Check for precise planetary positions (Swiss Ephemeris should give precise degrees)
    if (data.planets) {
      for (const [planet, position] of Object.entries(data.planets)) {
        if (position.longitude) {
          const longitude = parseFloat(position.longitude);

          // Real Swiss Ephemeris data should have decimal precision
          if (Number.isInteger(longitude)) {
            validation.issues.push(`${planet} longitude appears rounded: ${longitude}`);
            validation.isRealData = false;
          }

          // Check for suspiciously round numbers
          if (longitude % 30 === 0 || longitude % 15 === 0) {
            validation.issues.push(`${planet} longitude is suspiciously round: ${longitude}`);
          }
        }
      }
    }

    // Check for hardcoded patterns
    const dataString = JSON.stringify(data);
    const hardcodedPatterns = [
      /test.*data/i,
      /mock.*data/i,
      /sample.*data/i,
      /placeholder/i,
      /example/i
    ];

    hardcodedPatterns.forEach(pattern => {
      if (pattern.test(dataString)) {
        validation.issues.push(`Found hardcoded pattern: ${pattern}`);
        validation.isRealData = false;
      }
    });

    // Check for calculation metadata
    validation.checks.hasCalculationData = !!(data.calculationInfo || data.ephemerisData || data.calculation);
    validation.checks.hasPrecisePositions = this.checkPrecisePositions(data);
    validation.checks.hasVariedData = this.checkDataVariation(data);

    return validation;
  }

  checkPrecisePositions(data) {
    if (!data.planets) return false;

    const positions = Object.values(data.planets)
      .map(p => p.longitude)
      .filter(l => typeof l === 'number');

    // Real ephemeris data should have varied decimal places
    return positions.some(pos => pos.toString().includes('.') && pos.toString().split('.')[1].length > 2);
  }

  checkDataVariation(data) {
    if (!data.planets) return false;

    const positions = Object.values(data.planets)
      .map(p => p.longitude)
      .filter(l => typeof l === 'number');

    // Check if positions are varied (not all same or sequential)
    const unique = new Set(positions.map(p => Math.floor(p)));
    return unique.size > positions.length * 0.7; // At least 70% should be in different signs/degrees
  }

  async generateTestSummary() {
    console.log('\n📋 Step 5: Generating Test Summary');

    const summary = {
      ...this.testResults,
      summary: {
        totalErrors: this.testResults.errors.length,
        screenshotsCaptured: this.testResults.screenshots.length,
        apiCallsMonitored: Object.keys(this.testResults.apiResponses).length,
        dataFlowSteps: this.testResults.dataFlow.length,
        successRate: this.calculateSuccessRate()
      }
    };

    // Save detailed results
    const resultPath = path.join(__dirname, 'analysis-report-test-results.json');
    fs.writeFileSync(resultPath, JSON.stringify(summary, null, 2));

    console.log('📊 Test Summary:');
    console.log(`   Total Errors: ${summary.summary.totalErrors}`);
    console.log(`   Screenshots: ${summary.summary.screenshotsCaptured}`);
    console.log(`   API Calls: ${summary.summary.apiCallsMonitored}`);
    console.log(`   Success Rate: ${summary.summary.successRate}%`);

    if (summary.summary.totalErrors === 0) {
      console.log('🎉 All tests passed! Analysis and Report pages working correctly.');
    } else {
      console.log('⚠️ Issues found. Check analysis-report-test-results.json for details.');
    }

    return summary;
  }

  calculateSuccessRate() {
    const totalSteps = this.testResults.dataFlow.length;
    const successfulSteps = this.testResults.dataFlow.filter(step => step.status === 'completed').length;
    const errorPenalty = this.testResults.errors.length * 10; // 10% penalty per error

    if (totalSteps === 0) return 0;

    const baseRate = (successfulSteps / totalSteps) * 100;
    return Math.max(0, baseRate - errorPenalty);
  }

  async cleanupTestArtifacts() {
    console.log('\n🧹 Cleaning up test artifacts for next session...');

    // Remove any temporary files created during testing
    const tempFiles = [
      path.join(__dirname, 'temp-test-data.json'),
      path.join(__dirname, 'test-session-data.json')
    ];

    tempFiles.forEach(file => {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
        console.log(`🗑️ Removed: ${file}`);
      }
    });

    console.log('✅ Test artifacts cleaned up');
  }
}

// Execute the test
async function runTest() {
  const tester = new AnalysisReportProductionTester();

  try {
    await tester.runComprehensiveTest();
    await tester.cleanupTestArtifacts();
  } catch (error) {
    console.error('❌ Test execution failed:', error);
  }
}

// Run if called directly
if (require.main === module) {
  runTest().catch(console.error);
}

module.exports = { AnalysisReportProductionTester };
