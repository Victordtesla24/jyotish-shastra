const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function runSessionStorageTest() {
  let browser;
  let page;
  const testDataPath = path.join(__dirname, '../test-data/analysis-comprehensive-response.json');
  const testData = JSON.parse(fs.readFileSync(testDataPath, 'utf8'));
  const logDir = path.join(__dirname, 'test-logs');

  // Ensure log directory exists
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  try {
    console.log('🚀 Starting comprehensive session storage and data flow test...\n');

    // Launch browser
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    page = await browser.newPage();

    // Set viewport
    await page.setViewport({ width: 1366, height: 768 });

    // Enable console logging
    page.on('console', msg => console.log('Browser console:', msg.text()));
    page.on('pageerror', error => console.error('Page error:', error));

    // Step 1: Navigate to application and verify initial state
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    console.log('✅ Application loaded');

    // Check initial session storage state
    const initialStorage = await page.evaluate(() => {
      const sessionKeys = Object.keys(sessionStorage);
      return {
        sessionKeys: sessionKeys,
        hasJyotishData: sessionKeys.some(key => key.startsWith('jyotish_')),
        storageSize: JSON.stringify(sessionStorage).length
      };
    });
    console.log('📊 Initial session storage state:', initialStorage);

    // Step 2: Fill out birth data form
    console.log('\n🔍 Filling out birth data form...');
    await page.waitForSelector('input[name="name"]', { visible: true });
    await page.type('input[name="name"]', 'Test User for Session Storage');
    await page.type('input[name="dateOfBirth"]', '1990-06-15');
    await page.type('input[name="timeOfBirth"]', '14:30');
    await page.type('input[name="placeOfBirth"]', 'Mumbai, India');

    // Wait for geocoding with fallback
    try {
      await page.waitForSelector('.coordinates-display', { visible: true, timeout: 10000 });
      console.log('✅ Geocoding completed');
    } catch (e) {
      console.log('⚠️ Geocoding display not found, continuing without coordinates verification');
      // Wait a bit for any background geocoding to complete
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Step 3: Submit form and verify session storage updates
    console.log('\n📝 Submitting form and monitoring session storage...');
    await page.click('button[type="submit"]');

    // Wait for chart generation with multiple possible selectors
    const chartSelectors = [
      '.vedic-chart-container',
      '.chart-container',
      '.chart-display',
      '.rasi-chart',
      '[data-testid="chart"]',
      '.chart-wrapper'
    ];

    let chartGenerated = false;
    let chartSelector = null;

    for (const selector of chartSelectors) {
      try {
        await page.waitForSelector(selector, { visible: true, timeout: 10000 });
        chartGenerated = true;
        chartSelector = selector;
        console.log(`✅ Chart generated successfully with selector: ${selector}`);
        break;
      } catch (e) {
        // Try next selector
        continue;
      }
    }

    if (!chartGenerated) {
      console.log('⚠️ Chart container not found with any selector, but continuing to test session storage...');
      // Wait a bit for any background operations to complete
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    // Check session storage after chart generation
    const chartStorage = await page.evaluate(() => {
      const sessionKeys = Object.keys(sessionStorage);
      const jyotishKeys = sessionKeys.filter(key => key.startsWith('jyotish_api_'));

      return {
        sessionKeys: sessionKeys,
        jyotishApiKeys: jyotishKeys,
        currentSession: sessionStorage.getItem('current_session') ? JSON.parse(sessionStorage.getItem('current_session')) : null,
        hasChartData: jyotishKeys.some(key => key.includes('chart_generate')),
        storageSize: JSON.stringify(sessionStorage).length
      };
    });
    console.log('📊 Session storage after chart generation:', {
      jyotishApiKeys: chartStorage.jyotishApiKeys,
      hasChartData: chartStorage.hasChartData,
      storageSize: chartStorage.storageSize
    });

    // Take screenshot after chart generation
    await page.screenshot({
      path: path.join(logDir, `session-test-chart-${Date.now()}.png`),
      fullPage: true
    });

    // Step 4: Navigate to comprehensive analysis
    console.log('\n🔄 Navigating to comprehensive analysis...');

    // Try multiple selectors to find the comprehensive analysis button
    const comprehensiveSelectors = [
      'a[href*="comprehensive"]',
      'button:has-text("Comprehensive")',
      'button[data-testid="comprehensive"]',
      '.comprehensive-button',
      '[data-section="comprehensive"]'
    ];

    let comprehensiveButton = null;
    for (const selector of comprehensiveSelectors) {
      try {
        comprehensiveButton = await page.waitForSelector(selector, { visible: true, timeout: 3000 });
        if (comprehensiveButton) {
          console.log(`✅ Found comprehensive button with selector: ${selector}`);
          break;
        }
      } catch (e) {
        // Try next selector
      }
    }

    if (!comprehensiveButton) {
      // Manual navigation as fallback
      console.log('⚠️ Button not found, navigating directly to comprehensive analysis URL');
      await page.goto('http://localhost:3000/comprehensive', { waitUntil: 'networkidle0' });
    } else {
      await comprehensiveButton.click();
    }

    // Wait for comprehensive analysis page to load
    await page.waitForSelector('.comprehensive-analysis-container, .analysis-container, .comprehensive-display', {
      visible: true,
      timeout: 45000
    });
    console.log('✅ Comprehensive analysis page loaded');

    // Step 5: Verify comprehensive analysis data in session storage
    const comprehensiveStorage = await page.evaluate(() => {
      const sessionKeys = Object.keys(sessionStorage);
      const jyotishKeys = sessionKeys.filter(key => key.startsWith('jyotish_api_'));
      const analysisKeys = jyotishKeys.filter(key => key.includes('analysis_comprehensive') || key.includes('comprehensive'));

      let analysisData = null;
      if (analysisKeys.length > 0) {
        try {
          analysisData = JSON.parse(sessionStorage.getItem(analysisKeys[0]));
        } catch (e) {
          console.error('Failed to parse analysis data:', e);
        }
      }

      return {
        jyotishApiKeys: jyotishKeys,
        analysisKeys: analysisKeys,
        hasAnalysisData: analysisKeys.length > 0,
        analysisStructure: analysisData ? {
          hasSuccess: 'success' in analysisData,
          hasAnalysis: 'analysis' in analysisData,
          hasSections: analysisData.analysis && 'sections' in analysisData.analysis,
          sectionCount: analysisData.analysis?.sections ? Object.keys(analysisData.analysis.sections).length : 0
        } : null,
        storageSize: JSON.stringify(sessionStorage).length
      };
    });

    console.log('📊 Session storage after comprehensive analysis:', comprehensiveStorage);

    // Step 6: Validate UI display of comprehensive analysis sections
    console.log('\n🎯 Validating UI display of analysis sections...');

    const sections = ['section1', 'section2', 'section3', 'section4', 'section5', 'section6', 'section7', 'section8'];
    const sectionResults = {};

    for (const sectionId of sections) {
      try {
        // Look for section containers with various possible selectors
        const sectionSelectors = [
          `.section-${sectionId}`,
          `[data-section="${sectionId}"]`,
          `#${sectionId}`,
          `.analysis-section:has-text("${sectionId}")`,
          `.comprehensive-section-${sectionId}`,
          `[data-testid="${sectionId}"]`
        ];

        let sectionFound = false;
        let sectionSelector = null;

        for (const selector of sectionSelectors) {
          try {
            const element = await page.$(selector);
            if (element) {
              sectionFound = true;
              sectionSelector = selector;
              break;
            }
          } catch (e) {
            // Continue with next selector
          }
        }

        if (sectionFound) {
          // Try to get section content
          const sectionContent = await page.evaluate((selector) => {
            const element = document.querySelector(selector);
            return element ? {
              hasText: element.textContent.length > 0,
              textLength: element.textContent.length,
              innerHTML: element.innerHTML.substring(0, 200) // First 200 chars for debugging
            } : null;
          }, sectionSelector);

          sectionResults[sectionId] = {
            exists: true,
            selector: sectionSelector,
            content: sectionContent,
            hasContent: sectionContent?.hasText || false
          };

          console.log(`✅ ${sectionId}: Found with selector ${sectionSelector}`);
        } else {
          sectionResults[sectionId] = {
            exists: false,
            hasContent: false,
            error: 'Section not found with any selector'
          };
          console.log(`❌ ${sectionId}: Not found`);
        }
      } catch (error) {
        console.error(`Error checking ${sectionId}:`, error);
        sectionResults[sectionId] = {
          exists: false,
          hasContent: false,
          error: error.message
        };
      }
    }

    // Step 7: Take final screenshots and save results
    await page.screenshot({
      path: path.join(logDir, `session-test-comprehensive-${Date.now()}.png`),
      fullPage: true
    });

    // Save comprehensive test results
    const testResults = {
      timestamp: new Date().toISOString(),
      testPhases: {
        initialStorage: initialStorage,
        chartStorage: chartStorage,
        comprehensiveStorage: comprehensiveStorage
      },
      sectionValidation: sectionResults,
      summary: {
        sessionStorageWorking: comprehensiveStorage.hasAnalysisData,
        sectionsFound: Object.values(sectionResults).filter(r => r.exists).length,
        totalSections: sections.length,
        testPassed: comprehensiveStorage.hasAnalysisData &&
                   Object.values(sectionResults).filter(r => r.exists).length >= 4 // At least 4/8 sections
      }
    };

    fs.writeFileSync(
      path.join(logDir, `session-test-results-${Date.now()}.json`),
      JSON.stringify(testResults, null, 2)
    );

    // Step 8: Results Summary
    console.log('\n📋 Test Summary:');
    console.log('================');
    console.log(`Session Storage Working: ${testResults.summary.sessionStorageWorking ? '✅' : '❌'}`);
    console.log(`Sections Found: ${testResults.summary.sectionsFound}/${testResults.summary.totalSections}`);
    console.log(`Overall Test: ${testResults.summary.testPassed ? '✅ PASSED' : '❌ FAILED'}`);

    // Final validation
    if (testResults.summary.testPassed) {
      console.log('\n🎉 Session storage and data flow test completed successfully!');
      process.exit(0);
    } else {
      console.log('\n💥 Test failed - session storage or UI display issues detected');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);

    // Take error screenshot with timestamp
    if (page) {
      await page.screenshot({
        path: path.join(logDir, `session-test-error-${Date.now()}.png`),
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
      path.join(logDir, `session-test-error-${Date.now()}.json`),
      JSON.stringify(errorDetails, null, 2)
    );

    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the test
runSessionStorageTest().catch(console.error);
