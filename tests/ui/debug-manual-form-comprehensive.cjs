/**
 * ENHANCED COMPREHENSIVE MANUAL DEBUGGING TEST
 *
 * Purpose: Comprehensive production validation tool for Jyotish Shastra application
 * - Tests all 11 API endpoints with real user data
 * - Validates UI displays real API response data (not mock/test data)
 * - Captures screenshots and analyzes data accuracy
 * - Audits production code for any mock/test data patterns
 * - Implements root cause analysis for repeated errors
 *
 * Success Criteria: 100% real API data display with zero tolerance for mock data
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');

const execAsync = util.promisify(exec);

// API endpoints to test (all 11 endpoints)
const API_ENDPOINTS = [
  '/api/v1/chart/generate',
  '/api/v1/analysis/comprehensive',
  '/api/v1/analysis/dasha',
  '/api/v1/analysis/houses',
  '/api/v1/analysis/aspects',
  '/api/v1/analysis/arudha',
  '/api/v1/analysis/navamsa',
  '/api/v1/analysis/lagna',
  '/api/v1/analysis/preliminary',
  '/api/v1/analysis/birth-data',
  '/api/v1/chart/analysis/comprehensive'
];

// Production files to audit for mock data
const PRODUCTION_FILES = [
  'client/src/pages/AnalysisPage.jsx',
  'client/src/pages/ComprehensiveAnalysisPage.jsx',
  'client/src/components/reports/ComprehensiveAnalysisDisplay.js',
  'client/src/components/analysis/ResponseDataToUIDisplayAnalyser.js',
  'client/src/components/forms/UIDataSaver.js',
  'client/src/components/forms/UIToAPIDataInterpreter.js'
];

// Mock data patterns to detect
const MOCK_DATA_PATTERNS = [
  /const mockData\s*=/gi,
  /sampleData\s*=/gi,
  /testData\s*=/gi,
  /placeholder.*data/gi,
  /"Sample User"/gi,
  /"Test User"/gi,
  /mock.*response/gi,
  /fallback.*data/gi,
  /dummy.*data/gi,
  /fake.*data/gi
];

class EnhancedComprehensiveDebugger {
  constructor() {
    this.testResults = {
      timestamp: new Date().toISOString(),
      userEnteredData: {},
      apiValidation: {},
      uiValidation: {},
      screenshots: [],
      errors: [],
      productionAudit: {},
      successCriteria: {
        noTestDataInProduction: false,
        realApiDataDisplay: false,
        zeroErrorsWarnings: false,
        completeFeatureImplementation: false,
        rootCauseAnalysis: false,
        screenshotAnalysis: false
      }
    };

    this.screenshotDir = path.join(__dirname, 'test-logs');
    this.browser = null;
    this.page = null;

    // Ensure screenshot directory exists
    fs.mkdirSync(this.screenshotDir, { recursive: true });
  }

  // ===== PHASE 1: MANUAL FORM FILLING =====

  async startManualFormFilling() {
    console.log('\n🎯 PHASE 1: MANUAL FORM FILLING');
    console.log('=====================================');

    // Launch browser (non-headless for user interaction)
    this.browser = await puppeteer.launch({
      headless: false,
      slowMo: 100,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: null
    });

    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1280, height: 800 });

    // Setup error monitoring
    this.setupErrorMonitoring();

    // Navigate to homepage
    console.log('📍 Navigating to homepage...');
    await this.page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

    // Take initial screenshot
    await this.takeScreenshot('01-homepage-initial', 'Initial homepage load');

    // Guide user through manual form filling
    console.log('\n🙋‍♂️ MANUAL ACTION REQUIRED');
    console.log('==========================');
    console.log('📝 Please fill the birth data form with REAL birth data:');
    console.log('   • Name: Enter a real person\'s name (not "Test User")');
    console.log('   • Date: Enter actual birth date (YYYY-MM-DD format)');
    console.log('   • Time: Enter actual birth time (HH:MM format)');
    console.log('   • Place: Enter actual birth place (city, country)');
    console.log('   • Gender: Select appropriate gender');
    console.log('');
    console.log('🔍 Wait for:');
    console.log('   • Coordinates to be automatically found');
    console.log('   • All form validation to pass');
    console.log('');
    console.log('📤 Then click "Generate Vedic Chart" button');
    console.log('');
    console.log('⏳ Press ENTER when you\'ve completed form submission...');

    // Wait for user confirmation
    await this.waitForUserInput();

    console.log('✅ Form submission completed, capturing user data...');

    // Capture user-entered data
    await this.captureUserEnteredData();

    // Take screenshot after form submission
    await this.takeScreenshot('02-form-submitted', 'After form submission');

    return this.testResults.userEnteredData;
  }

  async captureUserEnteredData() {
    console.log('📊 Capturing user-entered birth data...');

    const sessionData = await this.page.evaluate(() => {
      const birthData = {};

      // Try to get data from UIDataSaver
      if (window.UIDataSaver) {
        const uiDataSaver = window.UIDataSaver.getInstance ? window.UIDataSaver.getInstance() : window.UIDataSaver;
        const savedBirthData = uiDataSaver.getBirthData ? uiDataSaver.getBirthData() : null;

        if (savedBirthData) {
          Object.assign(birthData, savedBirthData);
        }
      }

      // Also check sessionStorage directly
      const sessionKeys = Object.keys(sessionStorage);
      const dataKeys = sessionKeys.filter(key => key.includes('jyotish') || key.includes('birth') || key.includes('data'));

      return {
        birthData,
        sessionKeys: dataKeys,
        sessionStorage: dataKeys.reduce((acc, key) => {
          try {
            acc[key] = JSON.parse(sessionStorage.getItem(key));
          } catch {
            acc[key] = sessionStorage.getItem(key);
          }
          return acc;
        }, {})
      };
    });

    this.testResults.userEnteredData = sessionData;
    console.log('✅ User data captured:', {
      hasBirthData: !!sessionData.birthData?.name,
      sessionKeys: sessionData.sessionKeys.length,
      name: sessionData.birthData?.name || 'Not found',
      date: sessionData.birthData?.dateOfBirth || 'Not found'
    });
  }

  // ===== PHASE 2: API RESPONSE VALIDATION =====

  async validateApiEndpoints() {
    console.log('\n🔬 PHASE 2: API RESPONSE VALIDATION');
    console.log('=====================================');

    const birthData = this.testResults.userEnteredData.birthData;

    if (!birthData || !birthData.name) {
      console.error('❌ No birth data found! Cannot proceed with API validation.');
      this.testResults.errors.push({
        phase: 'api-validation',
        error: 'No birth data available for API testing'
      });
      return;
    }

    console.log('🎯 Testing all API endpoints with real user data...');
    console.log(`📊 Birth Data: ${birthData.name}, ${birthData.dateOfBirth}, ${birthData.timeOfBirth}`);

    // Test each API endpoint
    for (const endpoint of API_ENDPOINTS) {
      await this.testApiEndpoint(endpoint, birthData);
    }

    // Validate API responses
    this.analyzeApiValidationResults();
  }

  async testApiEndpoint(endpoint, birthData) {
    console.log(`\n📡 Testing ${endpoint}...`);

    try {
      // Prepare curl command
      const curlCommand = this.buildCurlCommand(endpoint, birthData);

      // Execute curl command
      console.log(`🔄 Executing: ${curlCommand.substring(0, 100)}...`);
      const { stdout, stderr } = await execAsync(curlCommand);

      if (stderr) {
        console.warn(`⚠️  curl stderr: ${stderr}`);
      }

      // Parse response
      let responseData;
      try {
        responseData = JSON.parse(stdout);
      } catch (parseError) {
        console.error(`❌ Failed to parse JSON response: ${parseError.message}`);
        responseData = { error: 'Invalid JSON response', raw: stdout };
      }

      // Store API response
      this.testResults.apiValidation[endpoint] = {
        success: !responseData.error,
        response: responseData,
        timestamp: new Date().toISOString(),
        responseSize: stdout.length,
        hasAnalysisData: this.hasRealAnalysisData(responseData)
      };

      console.log(`✅ ${endpoint}: ${responseData.success ? 'SUCCESS' : 'FAILED'} (${stdout.length} bytes)`);

      // Log key response structure
      if (responseData.analysis) {
        console.log(`   📊 Analysis keys: ${Object.keys(responseData.analysis).join(', ')}`);
      }

    } catch (error) {
      console.error(`❌ ${endpoint} failed:`, error.message);
      this.testResults.apiValidation[endpoint] = {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  buildCurlCommand(endpoint, birthData) {
    const url = `http://localhost:3001${endpoint}`;
    const dataPayload = JSON.stringify(birthData);

    return `curl -s -X POST "${url}" ` +
           `-H "Content-Type: application/json" ` +
           `-d '${dataPayload}'`;
  }

  hasRealAnalysisData(responseData) {
    if (!responseData.analysis) return false;

    // Check for real data indicators vs mock data
    const analysisString = JSON.stringify(responseData.analysis).toLowerCase();

    // Red flags (mock data indicators)
    const mockIndicators = ['sample', 'test', 'mock', 'placeholder', 'dummy', 'fake'];
    const hasMockIndicators = mockIndicators.some(indicator => analysisString.includes(indicator));

    // Green flags (real data indicators)
    const realDataSize = analysisString.length > 500; // Real analysis should be substantial
    const hasStructuredData = responseData.analysis.houses || responseData.analysis.planets || responseData.analysis.sections;

    return !hasMockIndicators && realDataSize && hasStructuredData;
  }

  // ===== PHASE 3: UI DATA DISPLAY VERIFICATION =====

  async verifyUiDataDisplay() {
    console.log('\n🖥️  PHASE 3: UI DATA DISPLAY VERIFICATION');
    console.log('==========================================');

    // Test Analysis Page
    await this.testAnalysisPage();

    // Test Comprehensive Analysis Page
    await this.testComprehensiveAnalysisPage();

    // Validate UI displays real data
    this.analyzeUiDataDisplayResults();
  }

  async testAnalysisPage() {
    console.log('\n📊 Testing Analysis Page (/analysis)...');

    try {
      await this.page.goto('http://localhost:3000/analysis', {
        waitUntil: 'networkidle2',
        timeout: 15000
      });

      // Wait for content to load
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Take screenshot
      await this.takeScreenshot('03-analysis-page', 'Analysis page loaded');

      // Analyze page content
      const analysisPageData = await this.page.evaluate(() => {
        const pageContent = {
          hasTabNavigation: false,
          visibleTabs: [],
          activeTabContent: '',
          hasJsonStringify: false,
          hasRealData: false,
          errorMessages: [],
          loadingIndicators: 0
        };

        // Check for tab navigation
        const tabs = document.querySelectorAll('[role="tab"], .tab, .nav-tab');
        pageContent.hasTabNavigation = tabs.length > 0;
        pageContent.visibleTabs = Array.from(tabs).map(tab => tab.textContent.trim());

        // Check for JSON.stringify usage (should be eliminated)
        const bodyText = document.body.textContent;
        pageContent.hasJsonStringify = bodyText.includes('{') && bodyText.includes('"');

        // Check for active tab content
        const activeContent = document.querySelector('.tab-content.active, .active-tab, [aria-selected="true"]');
        if (activeContent) {
          pageContent.activeTabContent = activeContent.textContent.substring(0, 500);
        }

        // Check for error messages
        const errors = document.querySelectorAll('.error, .error-message, [class*="error"]');
        pageContent.errorMessages = Array.from(errors).map(el => el.textContent.trim());

        // Check for loading indicators
        pageContent.loadingIndicators = document.querySelectorAll('.loading, .spinner, [class*="loading"]').length;

        // Check for real data indicators
        const hasSubstantialContent = bodyText.length > 1000;
        const hasStructuredSections = document.querySelectorAll('.analysis-section, .section, [class*="section"]').length > 0;
        pageContent.hasRealData = hasSubstantialContent && hasStructuredSections && !pageContent.hasJsonStringify;

        return pageContent;
      });

      this.testResults.uiValidation.analysisPage = {
        success: analysisPageData.hasRealData && !analysisPageData.hasJsonStringify,
        data: analysisPageData,
        timestamp: new Date().toISOString()
      };

      console.log(`✅ Analysis Page: ${analysisPageData.hasRealData ? 'REAL DATA' : 'NO REAL DATA'}`);
      console.log(`   📑 Tabs: ${analysisPageData.visibleTabs.join(', ')}`);
      console.log(`   📊 JSON.stringify usage: ${analysisPageData.hasJsonStringify ? 'FOUND (BAD)' : 'NONE (GOOD)'}`);
      console.log(`   ⚠️  Errors: ${analysisPageData.errorMessages.length}`);

    } catch (error) {
      console.error('❌ Analysis Page test failed:', error.message);
      this.testResults.uiValidation.analysisPage = {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async testComprehensiveAnalysisPage() {
    console.log('\n📋 Testing Comprehensive Analysis Page (/comprehensive-analysis)...');

    try {
      await this.page.goto('http://localhost:3000/comprehensive-analysis', {
        waitUntil: 'networkidle2',
        timeout: 15000
      });

      // Wait for content to load
      await new Promise(resolve => setTimeout(resolve, 8000));

      // Take screenshot
      await this.takeScreenshot('04-comprehensive-analysis-page', 'Comprehensive analysis page loaded');

      // Analyze page content
      const comprehensivePageData = await this.page.evaluate(() => {
        const pageContent = {
          hasSections: false,
          sectionCount: 0,
          visibleSections: [],
          hasRealData: false,
          hasJsonStringify: false,
          errorMessages: [],
          loadingIndicators: 0,
          contentLength: 0
        };

        // Check for analysis sections
        const sections = document.querySelectorAll('.analysis-section, .section, [class*="section"]');
        pageContent.hasSections = sections.length > 0;
        pageContent.sectionCount = sections.length;
        pageContent.visibleSections = Array.from(sections).map(section => {
          const title = section.querySelector('h1, h2, h3, h4, .title, .section-title');
          return title ? title.textContent.trim() : 'Untitled Section';
        });

        // Check for JSON.stringify usage
        const bodyText = document.body.textContent;
        pageContent.hasJsonStringify = bodyText.includes('{') && bodyText.includes('"') && bodyText.includes(':');
        pageContent.contentLength = bodyText.length;

        // Check for error messages
        const errors = document.querySelectorAll('.error, .error-message, [class*="error"]');
        pageContent.errorMessages = Array.from(errors).map(el => el.textContent.trim());

        // Check for loading indicators
        pageContent.loadingIndicators = document.querySelectorAll('.loading, .spinner, [class*="loading"]').length;

        // Check for real data indicators
        const hasSubstantialContent = bodyText.length > 2000;
        const hasStructuredSections = sections.length >= 6; // Should have 8 sections
        const hasMeaningfulContent = !bodyText.toLowerCase().includes('no data') && !bodyText.toLowerCase().includes('loading');
        pageContent.hasRealData = hasSubstantialContent && hasStructuredSections && hasMeaningfulContent && !pageContent.hasJsonStringify;

        return pageContent;
      });

      this.testResults.uiValidation.comprehensiveAnalysisPage = {
        success: comprehensivePageData.hasRealData && !comprehensivePageData.hasJsonStringify,
        data: comprehensivePageData,
        timestamp: new Date().toISOString()
      };

      console.log(`✅ Comprehensive Analysis Page: ${comprehensivePageData.hasRealData ? 'REAL DATA' : 'NO REAL DATA'}`);
      console.log(`   📑 Sections: ${comprehensivePageData.sectionCount} (${comprehensivePageData.visibleSections.join(', ')})`);
      console.log(`   📊 Content Length: ${comprehensivePageData.contentLength} chars`);
      console.log(`   📊 JSON.stringify usage: ${comprehensivePageData.hasJsonStringify ? 'FOUND (BAD)' : 'NONE (GOOD)'}`);
      console.log(`   ⚠️  Errors: ${comprehensivePageData.errorMessages.length}`);

    } catch (error) {
      console.error('❌ Comprehensive Analysis Page test failed:', error.message);
      this.testResults.uiValidation.comprehensiveAnalysisPage = {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // ===== PHASE 4: SCREENSHOT ANALYSIS =====

  async captureComprehensiveScreenshots() {
    console.log('\n📸 PHASE 4: SCREENSHOT ANALYSIS');
    console.log('=================================');

    // Capture detailed screenshots of both pages
    await this.captureDetailedAnalysisScreenshots();
    await this.captureDetailedComprehensiveScreenshots();

    // Generate screenshot analysis report
    this.generateScreenshotAnalysisReport();
  }

  async captureDetailedAnalysisScreenshots() {
    console.log('📸 Capturing detailed Analysis page screenshots...');

    try {
      await this.page.goto('http://localhost:3000/analysis', { waitUntil: 'networkidle2' });
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Full page screenshot
      await this.takeScreenshot('05-analysis-full-page', 'Analysis page - full view');

      // Get tab elements and capture each tab
      const tabs = await this.page.$$('[role="tab"], .tab, .nav-tab');

      for (let i = 0; i < tabs.length; i++) {
        try {
          await tabs[i].click();
          await new Promise(resolve => setTimeout(resolve, 2000));

          const tabText = await tabs[i].evaluate(el => el.textContent.trim());
          await this.takeScreenshot(`06-analysis-tab-${i + 1}-${tabText.toLowerCase().replace(/\s+/g, '-')}`,
                                   `Analysis page - ${tabText} tab`);
        } catch (tabError) {
          console.warn(`⚠️  Could not capture tab ${i + 1}:`, tabError.message);
        }
      }

    } catch (error) {
      console.error('❌ Failed to capture Analysis page screenshots:', error.message);
    }
  }

  async captureDetailedComprehensiveScreenshots() {
    console.log('📸 Capturing detailed Comprehensive Analysis page screenshots...');

    try {
      await this.page.goto('http://localhost:3000/comprehensive-analysis', { waitUntil: 'networkidle2' });
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Full page screenshot
      await this.takeScreenshot('07-comprehensive-full-page', 'Comprehensive analysis - full view');

      // Capture each section
      const sections = await this.page.$$('.analysis-section, .section');

      for (let i = 0; i < sections.length; i++) {
        try {
          await sections[i].scrollIntoView();
          await new Promise(resolve => setTimeout(resolve, 1000));

          const sectionTitle = await sections[i].evaluate(el => {
            const title = el.querySelector('h1, h2, h3, h4, .title, .section-title');
            return title ? title.textContent.trim() : `Section ${i + 1}`;
          });

          await this.takeScreenshot(`08-comprehensive-section-${i + 1}-${sectionTitle.toLowerCase().replace(/\s+/g, '-')}`,
                                   `Comprehensive analysis - ${sectionTitle}`);
        } catch (sectionError) {
          console.warn(`⚠️  Could not capture section ${i + 1}:`, sectionError.message);
        }
      }

    } catch (error) {
      console.error('❌ Failed to capture Comprehensive Analysis page screenshots:', error.message);
    }
  }

  async takeScreenshot(filename, description) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fullFilename = `${timestamp}-${filename}.png`;
      const screenshotPath = path.join(this.screenshotDir, fullFilename);

      await this.page.screenshot({
        path: screenshotPath,
        fullPage: true,
        type: 'png'
      });

      this.testResults.screenshots.push({
        filename: fullFilename,
        path: screenshotPath,
        description,
        timestamp: new Date().toISOString(),
        size: fs.statSync(screenshotPath).size
      });

      console.log(`📸 Screenshot: ${fullFilename} (${description})`);

    } catch (error) {
      console.error(`❌ Failed to take screenshot ${filename}:`, error.message);
    }
  }

  // ===== PHASE 5: PRODUCTION CODE AUDIT =====

  async auditProductionCode() {
    console.log('\n🔍 PHASE 5: PRODUCTION CODE AUDIT');
    console.log('===================================');

    for (const filePath of PRODUCTION_FILES) {
      await this.auditFile(filePath);
    }

    this.analyzeProductionAuditResults();
  }

  async auditFile(filePath) {
    console.log(`🔍 Auditing ${filePath}...`);

    try {
      if (!fs.existsSync(filePath)) {
        console.warn(`⚠️  File not found: ${filePath}`);
        this.testResults.productionAudit[filePath] = {
          exists: false,
          error: 'File not found'
        };
        return;
      }

      const fileContent = fs.readFileSync(filePath, 'utf8');
      const auditResult = {
        exists: true,
        fileSize: fileContent.length,
        lineCount: fileContent.split('\n').length,
        mockDataPatterns: [],
        hasJsonStringify: false,
        hasMockData: false,
        suspiciousPatterns: []
      };

      // Check for mock data patterns
      for (const pattern of MOCK_DATA_PATTERNS) {
        const matches = fileContent.match(pattern);
        if (matches) {
          auditResult.mockDataPatterns.push({
            pattern: pattern.source,
            matches: matches.length,
            examples: matches.slice(0, 3) // First 3 matches
          });
        }
      }

      // Check for JSON.stringify usage
      const jsonStringifyMatches = fileContent.match(/JSON\.stringify/g);
      auditResult.hasJsonStringify = !!jsonStringifyMatches;
      if (jsonStringifyMatches) {
        auditResult.jsonStringifyCount = jsonStringifyMatches.length;
      }

      // Check for other suspicious patterns
      const suspiciousPatterns = [
        { name: 'console.log with mock', pattern: /console\.log.*mock/gi },
        { name: 'hardcoded test data', pattern: /=\s*\{.*"test"|"sample"|"mock"/gi },
        { name: 'fallback placeholder', pattern: /fallback|placeholder.*=.*\{/gi }
      ];

      for (const { name, pattern } of suspiciousPatterns) {
        const matches = fileContent.match(pattern);
        if (matches) {
          auditResult.suspiciousPatterns.push({
            name,
            matches: matches.length,
            examples: matches.slice(0, 2)
          });
        }
      }

      auditResult.hasMockData = auditResult.mockDataPatterns.length > 0 || auditResult.suspiciousPatterns.length > 0;

      this.testResults.productionAudit[filePath] = auditResult;

      // Log results
      if (auditResult.hasMockData) {
        console.log(`❌ ${filePath}: MOCK DATA FOUND`);
        auditResult.mockDataPatterns.forEach(pattern => {
          console.log(`   🚨 ${pattern.pattern}: ${pattern.matches} matches`);
        });
      } else {
        console.log(`✅ ${filePath}: Clean (no mock data)`);
      }

      if (auditResult.hasJsonStringify) {
        console.log(`⚠️  ${filePath}: JSON.stringify usage detected (${auditResult.jsonStringifyCount} instances)`);
      }

    } catch (error) {
      console.error(`❌ Failed to audit ${filePath}:`, error.message);
      this.testResults.productionAudit[filePath] = {
        exists: true,
        error: error.message
      };
    }
  }

  // ===== ANALYSIS AND REPORTING =====

  analyzeApiValidationResults() {
    console.log('\n📊 API Validation Analysis');
    console.log('==========================');

    const endpoints = Object.keys(this.testResults.apiValidation);
    const successfulEndpoints = endpoints.filter(ep => this.testResults.apiValidation[ep].success);
    const endpointsWithRealData = endpoints.filter(ep => this.testResults.apiValidation[ep].hasAnalysisData);

    console.log(`✅ Successful endpoints: ${successfulEndpoints.length}/${endpoints.length}`);
    console.log(`📊 Endpoints with real data: ${endpointsWithRealData.length}/${endpoints.length}`);

    if (successfulEndpoints.length < endpoints.length) {
      console.log('❌ Failed endpoints:');
      endpoints.filter(ep => !this.testResults.apiValidation[ep].success).forEach(ep => {
        const result = this.testResults.apiValidation[ep];
        console.log(`   • ${ep}: ${result.error || 'Unknown error'}`);
      });
    }

    // Update success criteria
    this.testResults.successCriteria.realApiDataDisplay = endpointsWithRealData.length === endpoints.length;
  }

  analyzeUiDataDisplayResults() {
    console.log('\n🖥️  UI Data Display Analysis');
    console.log('=============================');

    const analysisPageSuccess = this.testResults.uiValidation.analysisPage?.success || false;
    const comprehensivePageSuccess = this.testResults.uiValidation.comprehensiveAnalysisPage?.success || false;

    console.log(`📊 Analysis Page: ${analysisPageSuccess ? 'REAL DATA ✅' : 'NO REAL DATA ❌'}`);
    console.log(`📋 Comprehensive Page: ${comprehensivePageSuccess ? 'REAL DATA ✅' : 'NO REAL DATA ❌'}`);

    // Check for JSON.stringify usage
    const hasJsonStringify = (this.testResults.uiValidation.analysisPage?.data?.hasJsonStringify || false) ||
                            (this.testResults.uiValidation.comprehensiveAnalysisPage?.data?.hasJsonStringify || false);

    if (hasJsonStringify) {
      console.log('⚠️  JSON.stringify usage detected in UI - should be eliminated');
    }

    // Update success criteria
    this.testResults.successCriteria.realApiDataDisplay = analysisPageSuccess && comprehensivePageSuccess && !hasJsonStringify;
  }

  analyzeProductionAuditResults() {
    console.log('\n🔍 Production Code Audit Analysis');
    console.log('==================================');

    const auditedFiles = Object.keys(this.testResults.productionAudit);
    const filesWithMockData = auditedFiles.filter(file => this.testResults.productionAudit[file].hasMockData);
    const filesWithJsonStringify = auditedFiles.filter(file => this.testResults.productionAudit[file].hasJsonStringify);

    console.log(`🔍 Files audited: ${auditedFiles.length}`);
    console.log(`🚨 Files with mock data: ${filesWithMockData.length}`);
    console.log(`⚠️  Files with JSON.stringify: ${filesWithJsonStringify.length}`);

    if (filesWithMockData.length > 0) {
      console.log('\n❌ CRITICAL: Mock data found in production files:');
      filesWithMockData.forEach(file => {
        const audit = this.testResults.productionAudit[file];
        console.log(`   • ${file}:`);
        audit.mockDataPatterns.forEach(pattern => {
          console.log(`     - ${pattern.pattern}: ${pattern.matches} matches`);
        });
      });
    } else {
      console.log('✅ No mock data patterns found in production files');
    }

    if (filesWithJsonStringify.length > 0) {
      console.log('\n⚠️  Files with JSON.stringify (should be eliminated):');
      filesWithJsonStringify.forEach(file => {
        const audit = this.testResults.productionAudit[file];
        console.log(`   • ${file}: ${audit.jsonStringifyCount} instances`);
      });
    }

    // Update success criteria
    this.testResults.successCriteria.noTestDataInProduction = filesWithMockData.length === 0;
  }

  generateScreenshotAnalysisReport() {
    console.log('\n📸 Screenshot Analysis Report');
    console.log('==============================');

    const screenshots = this.testResults.screenshots;
    const totalSize = screenshots.reduce((sum, screenshot) => sum + screenshot.size, 0);

    console.log(`📸 Screenshots captured: ${screenshots.length}`);
    console.log(`💾 Total size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`📁 Location: ${this.screenshotDir}`);

    console.log('\n📋 Screenshot inventory:');
    screenshots.forEach((screenshot, index) => {
      const sizeMB = (screenshot.size / 1024 / 1024).toFixed(2);
      console.log(`   ${index + 1}. ${screenshot.filename} (${sizeMB} MB) - ${screenshot.description}`);
    });

    // Update success criteria
    this.testResults.successCriteria.screenshotAnalysis = screenshots.length >= 8; // Should have comprehensive coverage
  }

  async evaluateSuccessCriteria() {
    console.log('\n🎯 SUCCESS CRITERIA EVALUATION');
    console.log('===============================');

    const criteria = this.testResults.successCriteria;

    // Evaluate each criterion
    console.log(`✅ No Test Data in Production: ${criteria.noTestDataInProduction ? 'PASS' : 'FAIL'}`);
    console.log(`📊 Real API Data Display: ${criteria.realApiDataDisplay ? 'PASS' : 'FAIL'}`);
    console.log(`⚠️  Zero Errors/Warnings: ${this.testResults.errors.length === 0 ? 'PASS' : 'FAIL'}`);
    console.log(`📸 Screenshot Analysis: ${criteria.screenshotAnalysis ? 'PASS' : 'FAIL'}`);

    // Overall success
    const overallSuccess = Object.values(criteria).every(Boolean) && this.testResults.errors.length === 0;

    console.log(`\n🏆 OVERALL SUCCESS: ${overallSuccess ? 'PASS ✅' : 'FAIL ❌'}`);

    if (!overallSuccess) {
      console.log('\n🚨 CRITICAL ISSUES TO RESOLVE:');
      if (!criteria.noTestDataInProduction) {
        console.log('   • Remove all mock/test data from production files');
      }
      if (!criteria.realApiDataDisplay) {
        console.log('   • Ensure UI displays real API response data');
      }
      if (this.testResults.errors.length > 0) {
        console.log('   • Fix all errors and warnings');
      }
      if (!criteria.screenshotAnalysis) {
        console.log('   • Ensure comprehensive screenshot coverage');
      }
    }

    return overallSuccess;
  }

  async generateComprehensiveReport() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(this.screenshotDir, `comprehensive-debug-report-${timestamp}.json`);

    // Add final analysis
    this.testResults.finalAnalysis = {
      totalApiEndpoints: API_ENDPOINTS.length,
      successfulApiEndpoints: Object.values(this.testResults.apiValidation).filter(r => r.success).length,
      productionFilesAudited: PRODUCTION_FILES.length,
      filesWithMockData: Object.values(this.testResults.productionAudit).filter(r => r.hasMockData).length,
      screenshotsCaptured: this.testResults.screenshots.length,
      totalErrors: this.testResults.errors.length,
      overallSuccess: await this.evaluateSuccessCriteria()
    };

    // Save comprehensive report
    fs.writeFileSync(reportPath, JSON.stringify(this.testResults, null, 2));

    console.log(`\n📄 Comprehensive report saved: ${reportPath}`);
    return reportPath;
  }

  // ===== UTILITY METHODS =====

  setupErrorMonitoring() {
    // Monitor console messages
    this.page.on('console', msg => {
      const text = msg.text();
      if (text.includes('ERROR') || text.includes('❌') || text.includes('Failed')) {
        console.log(`BROWSER ERROR: ${text}`);
        this.testResults.errors.push({
          type: 'console',
          message: text,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Monitor page errors
    this.page.on('pageerror', error => {
      console.error(`PAGE ERROR: ${error.message}`);
      this.testResults.errors.push({
        type: 'pageerror',
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    });

    // Monitor failed requests
    this.page.on('requestfailed', request => {
      console.error(`REQUEST FAILED: ${request.url()} - ${request.failure().errorText}`);
      this.testResults.errors.push({
        type: 'requestfailed',
        url: request.url(),
        error: request.failure().errorText,
        timestamp: new Date().toISOString()
      });
    });
  }

  async waitForUserInput() {
    return new Promise((resolve) => {
      process.stdin.once('data', () => {
        resolve();
      });
    });
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      console.log('🔒 Browser closed');
    }
  }
}

// ===== MAIN EXECUTION =====

async function runEnhancedComprehensiveDebug() {
  console.log('🚀 ENHANCED COMPREHENSIVE DEBUGGING TEST');
  console.log('=========================================');
  console.log('📝 This test validates that the Jyotish Shastra application displays');
  console.log('    REAL API response data instead of mock/test data.');
  console.log('');
  console.log('🎯 Success Criteria:');
  console.log('   ✅ No mock/test data in production files');
  console.log('   📊 UI displays real API response data');
  console.log('   ⚠️  Zero errors/warnings during testing');
  console.log('   📸 Comprehensive screenshot analysis');
  console.log('   🔍 Complete feature implementation validation');
  console.log('');

  const tester = new EnhancedComprehensiveDebugger();

  try {
    // Phase 1: Manual Form Filling
    await tester.startManualFormFilling();

    // Phase 2: API Response Validation
    await tester.validateApiEndpoints();

    // Phase 3: UI Data Display Verification
    await tester.verifyUiDataDisplay();

    // Phase 4: Screenshot Analysis
    await tester.captureComprehensiveScreenshots();

    // Phase 5: Production Code Audit
    await tester.auditProductionCode();

    // Final Analysis and Reporting
    const success = await tester.evaluateSuccessCriteria();
    const reportPath = await tester.generateComprehensiveReport();

    console.log('\n🎉 ENHANCED COMPREHENSIVE DEBUG COMPLETED');
    console.log('==========================================');
    console.log(`📊 Overall Success: ${success ? 'PASS ✅' : 'FAIL ❌'}`);
    console.log(`📄 Detailed Report: ${reportPath}`);
    console.log(`📁 Screenshots: ${tester.screenshotDir}`);

    if (!success) {
      console.log('\n🚨 CRITICAL: Manual intervention required to fix failing criteria');
      console.log('📋 Review the detailed report for specific issues to resolve');
    }

    // Keep browser open for manual inspection
    console.log('\n🔍 Browser remains open for manual inspection.');
    console.log('Press ENTER to close browser and exit...');
    await tester.waitForUserInput();

  } catch (error) {
    console.error('❌ Enhanced debug failed:', error);
    tester.testResults.errors.push({
      type: 'fatal',
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    // Still try to generate report
    await tester.generateComprehensiveReport();

  } finally {
    await tester.cleanup();
  }
}

// Execute the enhanced comprehensive debug
runEnhancedComprehensiveDebug().catch(console.error);
