const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

/**
 * Focused Session Storage Validation Test
 * This test validates that our UIDataSaver implementation is working correctly
 * for storing API responses in session storage.
 */
async function runSessionStorageValidationTest() {
  let browser;
  let page;
  const logDir = path.join(__dirname, 'test-logs');

  // Ensure log directory exists
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  try {
    console.log('🚀 Starting Session Storage Validation Test...\n');

    // Launch browser
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    page = await browser.newPage();

    // Set viewport
    await page.setViewport({ width: 1366, height: 768 });

    // Enable console logging to monitor UIDataSaver
    page.on('console', msg => console.log('Browser:', msg.text()));
    page.on('pageerror', error => console.error('Page Error:', error));

    // Step 1: Load application and verify UIDataSaver initialization
    console.log('📋 Step 1: Loading application and verifying UIDataSaver...');
    await page.goto('http://localhost:3002', { waitUntil: 'networkidle0' });

    // Check initial session storage state
    const initialState = await page.evaluate(() => {
      const keys = Object.keys(sessionStorage);
      return {
        sessionKeys: keys,
        hasJyotishKeys: keys.some(key => key.startsWith('jyotish_')),
        initialSize: JSON.stringify(sessionStorage).length,
        uiDataSaverExists: typeof window.UIDataSaver !== 'undefined'
      };
    });

    console.log('✅ Initial State:', {
      sessionKeys: initialState.sessionKeys.length,
      hasJyotishKeys: initialState.hasJyotishKeys,
      initialSize: initialState.initialSize
    });

    // Step 2: Test form data submission and session storage
    console.log('\n📋 Step 2: Testing form submission and session storage...');

    try {
      await page.waitForSelector('input[name="name"]', { visible: true, timeout: 10000 });
      await page.type('input[name="name"]', 'Session Test User');
      await page.type('input[name="dateOfBirth"]', '1990-06-15');
      await page.type('input[name="timeOfBirth"]', '14:30');
      await page.type('input[name="placeOfBirth"]', 'Mumbai, India');

      // Submit form
      await page.click('button[type="submit"]');

      // Wait for any background processing
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Check session storage after form submission
      const afterSubmission = await page.evaluate(() => {
        const keys = Object.keys(sessionStorage);
        const jyotishKeys = keys.filter(key => key.startsWith('jyotish_'));

        return {
          totalKeys: keys.length,
          jyotishKeys: jyotishKeys,
          storageSize: JSON.stringify(sessionStorage).length,
          currentSession: sessionStorage.getItem('current_session'),
          allStorageContent: Object.fromEntries(
            keys.map(key => [key, sessionStorage.getItem(key)?.substring(0, 100) + '...'])
          )
        };
      });

      console.log('✅ After Form Submission:', {
        totalKeys: afterSubmission.totalKeys,
        jyotishKeys: afterSubmission.jyotishKeys,
        storageSize: afterSubmission.storageSize,
        hasCurrentSession: !!afterSubmission.currentSession
      });

      // Step 3: Test session storage data structure
      console.log('\n📋 Step 3: Validating session storage data structure...');

      const storageValidation = await page.evaluate(() => {
        const current = sessionStorage.getItem('current_session');
        let sessionData = null;

        if (current) {
          try {
            sessionData = JSON.parse(current);
          } catch (e) {
            return { error: 'Failed to parse current_session', raw: current };

          }
        }

        const keys = Object.keys(sessionStorage);
        const apiKeys = keys.filter(key => key.startsWith('jyotish_api_'));

        return {
          hasCurrentSession: !!current,
          sessionDataStructure: sessionData ? Object.keys(sessionData) : null,
          apiKeysFound: apiKeys,
          apiDataSamples: apiKeys.slice(0, 2).map(key => {
            const data = sessionStorage.getItem(key);
            try {
              const parsed = JSON.parse(data);
              return {
                key: key,
                hasSuccess: 'success' in parsed,
                hasData: 'data' in parsed,
                dataSize: data.length
              };
            } catch (e) {
              return { key: key, error: 'Parse failed', rawSize: data?.length || 0 };
            }
          }),
          totalStorageSize: JSON.stringify(sessionStorage).length
        };
      });

      console.log('✅ Storage Validation Results:', storageValidation);

      // Step 4: Test session cleanup functionality
      console.log('\n📋 Step 4: Testing session cleanup...');

      // Test programmatic cleanup
      const cleanupTest = await page.evaluate(() => {
        // Try to trigger cleanup if UIDataSaver has cleanup method
        if (window.UIDataSaver && typeof window.UIDataSaver.clearSession === 'function') {
          const beforeCleanup = Object.keys(sessionStorage).length;
          window.UIDataSaver.clearSession();
          const afterCleanup = Object.keys(sessionStorage).length;

          return {
            cleanupMethodExists: true,
            beforeCleanup: beforeCleanup,
            afterCleanup: afterCleanup,
            cleanupWorked: afterCleanup < beforeCleanup
          };
        } else {
          return {
            cleanupMethodExists: false,
            currentKeys: Object.keys(sessionStorage).length
          };
        }
      });

      console.log('✅ Cleanup Test:', cleanupTest);

      // Take final screenshot
      await page.screenshot({
        path: path.join(logDir, `session-validation-final-${Date.now()}.png`),
        fullPage: true
      });

      // Step 5: Generate comprehensive test report
      const testResults = {
        timestamp: new Date().toISOString(),
        testPhases: {
          initialState: initialState,
          afterSubmission: afterSubmission,
          storageValidation: storageValidation,
          cleanupTest: cleanupTest
        },
        summary: {
          sessionStorageWorking: afterSubmission.storageSize > initialState.initialSize,
          dataStructureValid: storageValidation.hasCurrentSession,
          apiKeysPresent: storageValidation.apiKeysFound.length > 0,
          overallSuccess: (
            afterSubmission.storageSize > initialState.initialSize &&
            (storageValidation.hasCurrentSession || storageValidation.apiKeysFound.length > 0)
          )
        }
      };

      // Save results
      fs.writeFileSync(
        path.join(logDir, `session-validation-results-${Date.now()}.json`),
        JSON.stringify(testResults, null, 2)
      );

      // Final Summary
      console.log('\n📋 SESSION STORAGE VALIDATION SUMMARY');
      console.log('=====================================');
      console.log(`✅ UIDataSaver Initialized: ${initialState.uiDataSaverExists}`);
      console.log(`✅ Session Storage Working: ${testResults.summary.sessionStorageWorking}`);
      console.log(`✅ Data Structure Valid: ${testResults.summary.dataStructureValid}`);
      console.log(`✅ API Keys Present: ${testResults.summary.apiKeysPresent}`);
      console.log(`\n🎯 Overall Test Result: ${testResults.summary.overallSuccess ? '✅ PASSED' : '❌ FAILED'}`);

      if (testResults.summary.overallSuccess) {
        console.log('\n🎉 Session storage implementation is working correctly!');
        console.log('📊 Key Metrics:');
        console.log(`   - Storage size increased: ${initialState.initialSize} → ${afterSubmission.storageSize} bytes`);
        console.log(`   - Session keys created: ${afterSubmission.totalKeys}`);
        console.log(`   - API keys found: ${storageValidation.apiKeysFound.length}`);

        return { success: true, results: testResults };
      } else {
        console.log('\n💥 Session storage implementation needs attention');
        return { success: false, results: testResults };
      }

    } catch (formError) {
      console.error('❌ Form submission failed:', formError);
      return { success: false, error: formError.message };
    }

  } catch (error) {
    console.error('❌ Test failed:', error);

    // Take error screenshot
    if (page) {
      await page.screenshot({
        path: path.join(logDir, `session-validation-error-${Date.now()}.png`),
        fullPage: true
      });
    }

    // Save error details
    const errorDetails = {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
      url: page ? await page.url() : 'unknown'
    };

    fs.writeFileSync(
      path.join(logDir, `session-validation-error-${Date.now()}.json`),
      JSON.stringify(errorDetails, null, 2)
    );

    return { success: false, error: error.message };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run test if called directly
if (require.main === module) {
  runSessionStorageValidationTest()
    .then(result => {
      console.log('\n🏁 Test completed:', result.success ? 'SUCCESS' : 'FAILED');
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Test execution failed:', error);
      process.exit(1);
    });
}

module.exports = { runSessionStorageValidationTest };
