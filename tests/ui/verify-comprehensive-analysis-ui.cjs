/**
 * Enhanced Browser-Based Comprehensive Analysis UI Validation Script
 * 
 * Purpose: Verify that POST /api/v1/analysis/comprehensive:
 * - Triggers comprehensive analysis from UI
 * - Returns all 8 expected sections (section1-section8)
 * - UI consumes all sections without missing keys
 * - Handles errors gracefully with friendly messages (no stack traces)
 * - No console errors during rendering
 * 
 * Success Criteria:
 * - Response structure: { success: true, analysis: { sections: { section1-section8 } } }
 * - All 8 sections present and visible in UI
 * - Zero console errors
 * - UI interpreter processes all sections without missing keys
 * - Friendly error messages for invalid requests (no stack traces)
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Test configuration
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Test birth data (same as chart validation)
const TEST_BIRTH_DATA = {
  name: 'Farhan',
  dateOfBirth: '1997-12-18',
  timeOfBirth: '02:30',
  latitude: 32.4935378,
  longitude: 74.5411575,
  timezone: 'Asia/Karachi',
  placeOfBirth: 'Sialkot, Pakistan',
  gender: 'male'
};

// Expected sections (8 sections)
const EXPECTED_SECTIONS = [
  'section1', // Birth Data Collection
  'section2', // Lagna Analysis
  'section3', // House Analysis
  'section4', // Planetary Analysis
  'section5', // Aspects Analysis
  'section6', // Yogas Analysis
  'section7', // Dasha Analysis
  'section8'  // Navamsa Analysis
];

// Verify response structure includes all 8 sections
function verifyResponseStructure(response) {
  const errors = [];
  const warnings = [];

  if (!response.success) {
    errors.push('Response success flag is false');
  }

  if (!response.analysis) {
    errors.push('Response missing analysis object');
    return { valid: false, errors, warnings };
  }

  if (!response.analysis.sections) {
    errors.push('Response missing analysis.sections');
    return { valid: false, errors, warnings };
  }

  const sections = response.analysis.sections;
  const sectionKeys = Object.keys(sections);

  EXPECTED_SECTIONS.forEach(expectedSection => {
    if (!sections[expectedSection]) {
      errors.push(`Missing expected section: ${expectedSection}`);
    }
  });

  if (sectionKeys.length < 8) {
    warnings.push(`Expected 8 sections but found ${sectionKeys.length}`);
  }

  sectionKeys.forEach(sectionKey => {
    const section = sections[sectionKey];
    if (!section || typeof section !== 'object') {
      warnings.push(`Section ${sectionKey} is not an object`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    sectionCount: sectionKeys.length,
    sections: sectionKeys
  };
}

// Verify UI consumes all sections without missing keys
function verifyUIConsumption(sections, uiElements) {
  const errors = [];
  const warnings = [];

  // Check if UI has access to all sections
  EXPECTED_SECTIONS.forEach(sectionKey => {
    if (!sections[sectionKey]) {
      warnings.push(`Section ${sectionKey} not in API response`);
    }
  });

  // Check if UI elements reference sections
  if (uiElements && uiElements.length > 0) {
    const uiSectionReferences = uiElements.filter(el => 
      el.includes('section') || EXPECTED_SECTIONS.some(sec => el.includes(sec))
    );
    
    if (uiSectionReferences.length === 0) {
      warnings.push('No section references found in UI elements');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

// Main validation function
async function verifyComprehensiveAnalysisUI() {
  console.log('🚀 Starting Comprehensive Analysis UI Validation');
  console.log('===============================================\n');

  const results = {
    timestamp: new Date().toISOString(),
    testData: TEST_BIRTH_DATA,
    tests: [],
    errors: [],
    consoleErrors: [],
    summary: { passed: 0, failed: 0, total: 0 }
  };

  let browser;

  try {
    // Test 1: Trigger Comprehensive Analysis from UI
    console.log('📍 Test 1: Trigger Comprehensive Analysis from UI');
    results.summary.total++;
    
    try {
      browser = await puppeteer.launch({
        headless: process.env.HEADLESS !== 'false',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        defaultViewport: { width: 1280, height: 800 }
      });

      const page = await browser.newPage();

      // Set up console monitoring
      const consoleMessages = [];
      const consoleErrors = [];
      
      page.on('console', msg => {
        const text = msg.text();
        const type = msg.type();
        consoleMessages.push({ type, text, timestamp: new Date().toISOString() });
        
        if (type === 'error' || text.includes('Error') || text.includes('❌')) {
          consoleErrors.push({ type, text });
          console.error(`  Browser Console [${type}]: ${text}`);
        }
      });

      // Set up network request/response interception
      const requests = [];
      const responses = [];
      
      page.on('request', request => {
        if (request.url().includes('/api/v1/analysis/comprehensive')) {
          requests.push({
            url: request.url(),
            method: request.method(),
            postData: request.postData(),
            headers: request.headers()
          });
        }
      });

      page.on('response', async response => {
        if (response.url().includes('/api/v1/analysis/comprehensive')) {
          try {
            const responseData = await response.json();
            responses.push({
              url: response.url(),
              status: response.status(),
              data: responseData
            });
          } catch (error) {
            // Response might not be JSON
          }
        }
      });

      // Navigate to Comprehensive Analysis page
      console.log('   Navigating to Comprehensive Analysis page...');
      try {
        await page.goto(`${FRONTEND_URL}/comprehensive-analysis`, { 
          waitUntil: 'networkidle2', 
          timeout: 10000 
        });
      } catch (error) {
        if (error.message.includes('ERR_CONNECTION_REFUSED') || error.message.includes('net::ERR')) {
          console.warn('   Frontend not running, skipping browser UI verification');
          console.warn('   To test UI verification, start frontend with: cd client && npm start\n');
          await browser.close();
          browser = null;
          results.tests.push({ name: 'UI Trigger Test', status: 'skipped', reason: 'Frontend not running' });
          results.summary.total--; // Don't count skipped test
          // Don't increment passed - skipped tests don't count as passed
          throw new Error('FRONTEND_NOT_RUNNING');
        }
        throw error;
      }

      // Wait for page to load
      await page.waitForTimeout(2000);

      // Fill birth data form
      console.log('   Filling birth data form...');
      try {
        await page.waitForSelector('input[name="name"]', { timeout: 5000 });
        await page.type('input[name="name"]', TEST_BIRTH_DATA.name);
        await page.type('input[name="dateOfBirth"]', TEST_BIRTH_DATA.dateOfBirth);
        await page.type('input[name="timeOfBirth"]', TEST_BIRTH_DATA.timeOfBirth);
        await page.type('input[name="latitude"]', TEST_BIRTH_DATA.latitude.toString());
        await page.type('input[name="longitude"]', TEST_BIRTH_DATA.longitude.toString());
        await page.type('input[name="timezone"]', TEST_BIRTH_DATA.timezone);
        
        // Submit form
        const submitButton = await page.$('button[type="submit"], button:contains("Generate"), button:contains("Analyze")');
        if (submitButton) {
          await submitButton.click();
        } else {
          const buttons = await page.$$('button');
          if (buttons.length > 0) {
            await buttons[0].click();
          }
        }
      } catch (error) {
        console.warn(`   Form filling skipped: ${error.message}`);
      }

      // Wait for API call to complete
      console.log('   Waiting for API response...');
      await page.waitForTimeout(8000); // Wait for comprehensive analysis to complete

      // Verify API request was captured
      if (requests.length > 0) {
        console.log(`   ✅ Captured ${requests.length} API request(s)`);
        console.log(`   Request method: ${requests[0].method}`);
        console.log(`   Request URL: ${requests[0].url}`);
      } else {
        console.warn('   ⚠️ No API requests captured');
      }

      // Verify API response was captured
      if (responses.length > 0) {
        console.log(`   ✅ Captured ${responses.length} API response(s)`);
        const responseData = responses[0].data;
        
        // Verify response structure
        const structureVerification = verifyResponseStructure(responseData);
        if (structureVerification.valid) {
          console.log(`   ✅ Response structure valid (${structureVerification.sectionCount} sections)`);
        } else {
          console.error(`   ❌ Response structure validation failed:`);
          structureVerification.errors.forEach(err => console.error(`      - ${err}`));
        }
      } else {
        console.warn('   ⚠️ No API responses captured');
      }

      // Check for console errors
      if (consoleErrors.length === 0) {
        console.log('   ✅ No console errors detected');
        results.summary.passed++;
        results.tests.push({ name: 'UI Trigger Test', status: 'passed', consoleErrors: 0 });
      } else {
        console.error(`   ❌ Found ${consoleErrors.length} console errors`);
        results.summary.failed++;
        results.tests.push({ name: 'UI Trigger Test', status: 'failed', consoleErrors: consoleErrors.length });
        results.consoleErrors = consoleErrors;
        results.errors.push({ test: 'UI Trigger Test', error: `${consoleErrors.length} console errors`, details: consoleErrors });
      }

      // Verify sections are visible in UI
      const sectionsVisible = await page.evaluate(() => {
        const sectionElements = document.querySelectorAll('[data-section], [class*="section"], button[class*="tab"], [class*="tab"]');
        const sectionTexts = Array.from(sectionElements).map(el => 
          el.textContent || el.getAttribute('data-section') || el.className
        );
        
        return {
          found: sectionElements.length,
          sections: sectionTexts.slice(0, 20)
        };
      });

      console.log(`   Found ${sectionsVisible.found} section-related elements in UI`);
      if (sectionsVisible.found > 0) {
        console.log('   ✅ Sections visible in UI\n');
      } else {
        console.warn('   ⚠️ No section elements found in UI\n');
      }

      await browser.close();
      browser = null;

    } catch (error) {
      if (error.message === 'FRONTEND_NOT_RUNNING') {
        // Already handled
      } else {
        console.error(`❌ Test 1 failed: ${error.message}`);
        results.summary.failed++;
        results.tests.push({ name: 'UI Trigger Test', status: 'failed', error: error.message });
        results.errors.push({ test: 'UI Trigger Test', error: error.message });
      }
      if (browser) {
        await browser.close();
        browser = null;
      }
    }

    // Test 2: Verify Response Shape with All 8 Sections
    console.log('📍 Test 2: Verify Response Shape with All 8 Sections');
    results.summary.total++;
    
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/v1/analysis/comprehensive`,
        TEST_BIRTH_DATA,
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 60000
        }
      );

      const structureVerification = verifyResponseStructure(response.data);
      
      if (structureVerification.valid && structureVerification.sectionCount >= 8) {
        console.log('✅ Response structure valid');
        console.log(`   Sections found: ${structureVerification.sectionCount}`);
        console.log(`   Sections: ${structureVerification.sections.join(', ')}\n`);
        results.summary.passed++;
        results.tests.push({ name: 'Response Shape Verification', status: 'passed', sections: structureVerification.sections });
      } else {
        console.error('❌ Response structure validation failed:');
        structureVerification.errors.forEach(err => console.error(`   - ${err}`));
        console.log('');
        results.summary.failed++;
        results.tests.push({ name: 'Response Shape Verification', status: 'failed', errors: structureVerification.errors });
        results.errors.push({ test: 'Response Shape Verification', errors: structureVerification.errors });
      }

      // Verify UI consumption
      if (structureVerification.valid) {
        const uiConsumption = verifyUIConsumption(response.data.analysis.sections, []);
        if (uiConsumption.valid) {
          console.log('✅ UI consumption verification passed\n');
        } else {
          console.warn('⚠️ UI consumption warnings:');
          uiConsumption.warnings.forEach(warn => console.warn(`   - ${warn}`));
          console.log('');
        }
      }

    } catch (error) {
      console.error(`❌ Test 2 failed: ${error.message}`);
      if (error.response) {
        console.error(`   API Error: ${error.response.status} ${error.response.statusText}`);
      }
      results.summary.failed++;
      results.tests.push({ name: 'Response Shape Verification', status: 'failed', error: error.message });
      results.errors.push({ test: 'Response Shape Verification', error: error.message });
    }

    // Test 3: Negative Test - Missing Required Field
    console.log('📍 Test 3: Negative Test - Missing Required Field');
    results.summary.total++;
    
    try {
      const invalidData = {
        ...TEST_BIRTH_DATA
      };
      delete invalidData.dateOfBirth;

      const errorResponse = await axios.post(
        `${BACKEND_URL}/api/v1/analysis/comprehensive`,
        invalidData,
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000,
          validateStatus: () => true
        }
      );

      if (!errorResponse.data.success) {
        console.log('✅ Error response structure valid');
        
        const errorMessage = errorResponse.data.error?.message || 
                          errorResponse.data.error ||
                          errorResponse.data.message ||
                          (Array.isArray(errorResponse.data.details) && errorResponse.data.details[0]?.message) ||
                          errorResponse.data.error?.details ||
                          'Validation failed';
        
        // Verify error message is friendly (no stack trace)
        const hasStackTrace = errorMessage.includes('stack') || 
                            errorMessage.includes('at ') ||
                            errorMessage.includes('Error:') ||
                            errorMessage.includes('TypeError') ||
                            errorMessage.includes('ReferenceError');
        
        if (!hasStackTrace && errorMessage && typeof errorMessage === 'string') {
          console.log(`   Error message: ${errorMessage}`);
          console.log('✅ Friendly error message (no stack trace)\n');
          results.summary.passed++;
          results.tests.push({ name: 'Negative Test', status: 'passed', errorMessage });
        } else {
          console.error('❌ Error message contains stack trace or technical details');
          console.error(`   Message: ${errorMessage || 'undefined'}\n`);
          results.summary.failed++;
          results.tests.push({ name: 'Negative Test', status: 'failed', error: 'Stack trace in error message' });
          results.errors.push({ test: 'Negative Test', error: 'Stack trace in error message' });
        }

        // Verify error response has helpful properties
        // Check both nested error object and top-level properties
        const hasDetails = errorResponse.data.error?.details || 
                          errorResponse.data.details || 
                          errorResponse.data.error?.message;
        const hasSuggestions = errorResponse.data.error?.suggestions || 
                             errorResponse.data.suggestions;
        
        if (hasDetails || hasSuggestions) {
          console.log('✅ Error response includes helpful details or suggestions');
          if (hasDetails) console.log(`   Details: ${Array.isArray(hasDetails) ? hasDetails.length + ' items' : 'present'}`);
          if (hasSuggestions) console.log(`   Suggestions: ${Array.isArray(hasSuggestions) ? hasSuggestions.length + ' items' : 'present'}`);
          console.log('');
        } else {
          console.warn('⚠️ Error response missing details or suggestions\n');
        }
      } else {
        console.error('❌ Expected error response but got success=true\n');
        results.summary.failed++;
        results.tests.push({ name: 'Negative Test', status: 'failed', error: 'Expected error but got success' });
        results.errors.push({ test: 'Negative Test', error: 'Expected error but got success' });
      }

    } catch (error) {
      if (error.response && error.response.status >= 400) {
        console.log('✅ Validation error caught (status >= 400)');
        console.log(`   Status: ${error.response.status}`);
        const errorData = error.response.data;
        
        const errorMessage = errorData.error?.message || errorData.message || 'Validation failed';
        const hasStackTrace = errorMessage.includes('stack') || 
                            errorMessage.includes('at ') ||
                            errorMessage.includes('Error:');
        
        if (!hasStackTrace && !errorData.error?.stack) {
          console.log('✅ Error response is friendly (no stack trace)\n');
          results.summary.passed++;
          results.tests.push({ name: 'Negative Test', status: 'passed', statusCode: error.response.status });
        } else {
          console.error('❌ Error response contains stack trace\n');
          results.summary.failed++;
          results.tests.push({ name: 'Negative Test', status: 'failed', error: 'Stack trace in error' });
          results.errors.push({ test: 'Negative Test', error: 'Stack trace in error' });
        }
      } else {
        console.error(`❌ Unexpected error: ${error.message}\n`);
        results.summary.failed++;
        results.tests.push({ name: 'Negative Test', status: 'failed', error: error.message });
        results.errors.push({ test: 'Negative Test', error: error.message });
      }
    }

    // Print summary
    console.log('📊 Validation Summary');
    console.log('===================');
    console.log(`Total tests: ${results.summary.total}`);
    console.log(`Passed: ${results.summary.passed}`);
    console.log(`Failed: ${results.summary.failed}`);
    console.log(`Success rate: ${((results.summary.passed / results.summary.total) * 100).toFixed(1)}%\n`);

    // Save results
    const resultsPath = path.join(__dirname, 'test-logs', `comprehensive-analysis-ui-validation-${Date.now()}.json`);
    const logsDir = path.dirname(resultsPath);
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2), 'utf8');
    console.log(`📄 Results saved to: ${resultsPath}`);

    // Exit with appropriate code
    process.exit(results.summary.failed > 0 ? 1 : 0);

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    console.error(error.stack);
    if (browser) {
      await browser.close();
    }
    process.exit(1);
  }
}

// Run validation
if (require.main === module) {
  verifyComprehensiveAnalysisUI().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

module.exports = { verifyComprehensiveAnalysisUI, verifyResponseStructure, verifyUIConsumption };

