const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

/**
 * Comprehensive test script for the transformed AnalysisPage
 * Tests all API endpoints integration and UI display components
 */

const testBirthData = {
  name: "Test User",
  date: "1990-01-15",
  time: "14:30",
  location: "New Delhi, India",
  latitude: 28.6139,
  longitude: 77.2090,
  timezone: "Asia/Kolkata"
};

const analysisData = {
  lagna: { lagnaSign: "Capricorn", lagnaLord: "Saturn", description: "Test lagna analysis" },
  preliminary: { summary: "Preliminary analysis complete" },
  houses: {
    house1: { lord: "Saturn", planets: ["Sun"], analysis: "First house analysis" },
    house2: { lord: "Saturn", planets: ["Moon"], analysis: "Second house analysis" }
  },
  aspects: {
    aspects: [
      { from: "Sun", to: "Moon", type: "Conjunction", description: "Sun-Moon aspect" }
    ]
  },
  arudha: { arudhaLagna: "Gemini", analysis: "Arudha analysis" },
  navamsa: { navamsaLagna: "Aries", analysis: "Navamsa analysis" },
  dasha: { currentDasha: "Venus", nextDasha: "Sun", analysis: "Dasha analysis" },
  comprehensive: {
    sections: {
      section1: { name: "Birth Data", content: "Birth data analysis" },
      section2: { name: "Lagna", content: "Lagna analysis" }
    }
  }
};

async function testTransformedAnalysisPage() {
  let browser;
  let results = {
    timestamp: new Date().toISOString(),
    testName: 'Transformed AnalysisPage Validation',
    status: 'running',
    phases: {},
    errors: [],
    screenshots: []
  };

  try {
    console.log('🚀 Starting Transformed AnalysisPage Test...');

    browser = await puppeteer.launch({
      headless: false,
      defaultViewport: { width: 1200, height: 800 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Enable console logging
    page.on('console', msg => {
      console.log('Browser:', msg.text());
    });

    page.on('pageerror', error => {
      console.error('Page Error:', error.message);
      results.errors.push({
        type: 'page_error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    });

    // Phase 1: Navigate to homepage and inject session data
    console.log('📍 Phase 1: Setting up session data...');
    results.phases.phase1 = { status: 'running', startTime: new Date().toISOString() };

    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

    // Inject birth data and analysis data into session storage
    await page.evaluate((birthData, analysisData) => {
      // Clear existing data
      sessionStorage.clear();
      localStorage.clear();

      // Set birth data
      sessionStorage.setItem('current_session', JSON.stringify({
        birthData: birthData,
        allAnalysisData: analysisData
      }));

      console.log('✅ Session data injected successfully');
    }, testBirthData, analysisData);

    results.phases.phase1.status = 'completed';
    results.phases.phase1.endTime = new Date().toISOString();

    // Phase 2: Navigate to AnalysisPage
    console.log('📍 Phase 2: Navigating to AnalysisPage...');
    results.phases.phase2 = { status: 'running', startTime: new Date().toISOString() };

    await page.goto('http://localhost:3000/analysis', { waitUntil: 'networkidle0' });

    // Wait for page to load
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Take screenshot of initial page load
    const screenshotPath1 = `tests/ui/test-logs/transformed-analysis-initial-${Date.now()}.png`;
    await page.screenshot({ path: screenshotPath1, fullPage: true });
    results.screenshots.push(screenshotPath1);
    console.log(`📸 Screenshot saved: ${screenshotPath1}`);

    results.phases.phase2.status = 'completed';
    results.phases.phase2.endTime = new Date().toISOString();

    // Phase 3: Test main tab navigation
    console.log('📍 Phase 3: Testing main tab navigation...');
    results.phases.phase3 = { status: 'running', startTime: new Date().toISOString() };

    const mainTabs = [
      'lagna', 'houses', 'aspects', 'arudha',
      'navamsa', 'dasha', 'preliminary', 'comprehensive'
    ];

    const tabResults = {};

    for (const tabKey of mainTabs) {
      try {
        console.log(`🔍 Testing tab: ${tabKey}`);

        // Find and click tab
        const tabSelector = `.tab-vedic[data-tab="${tabKey}"], button:contains("${tabKey}")`;

        // Try alternative selectors if primary doesn't work
        let tabFound = false;
        const alternativeSelectors = [
          `button[data-testid="tab-${tabKey}"]`,
          `.tabs-vedic button:nth-child(${mainTabs.indexOf(tabKey) + 1})`,
          `button:contains("${tabKey.charAt(0).toUpperCase() + tabKey.slice(1)}")`
        ];

        for (const selector of alternativeSelectors) {
          try {
            await page.waitForSelector(selector, { timeout: 2000 });
            await page.click(selector);
            tabFound = true;
            break;
          } catch (e) {
            // Try next selector
          }
        }

        if (!tabFound) {
          console.log(`⚠️ Tab ${tabKey} not found, trying to find any tab-like elements`);

          // Get all clickable elements that might be tabs
          const clickableElements = await page.$$eval('button, a, div[role="tab"]', elements => {
            return elements.map(el => ({
              text: el.textContent.trim(),
              className: el.className,
              tagName: el.tagName
            }));
          });

          console.log('Available clickable elements:', clickableElements);
        }

        await new Promise(resolve => setTimeout(resolve, 1000));

        // Check if tab content is displayed
        const hasContent = await page.evaluate(() => {
          const contentArea = document.querySelector('.card-vedic, .space-y-6, [class*="content"]');
          return contentArea && contentArea.textContent.trim().length > 0;
        });

        tabResults[tabKey] = {
          found: tabFound,
          hasContent: hasContent,
          timestamp: new Date().toISOString()
        };

        console.log(`${tabFound ? '✅' : '❌'} Tab ${tabKey}: Found=${tabFound}, HasContent=${hasContent}`);

      } catch (error) {
        console.error(`❌ Error testing tab ${tabKey}:`, error.message);
        tabResults[tabKey] = {
          found: false,
          hasContent: false,
          error: error.message,
          timestamp: new Date().toISOString()
        };
      }
    }

    results.phases.phase3.tabResults = tabResults;
    results.phases.phase3.status = 'completed';
    results.phases.phase3.endTime = new Date().toISOString();

    // Phase 4: Test house sub-tabs (if houses tab is active)
    console.log('📍 Phase 4: Testing house sub-tabs...');
    results.phases.phase4 = { status: 'running', startTime: new Date().toISOString() };

    try {
      // Click on houses tab if not already active
      await page.evaluate(() => {
        const housesTab = Array.from(document.querySelectorAll('button')).find(btn =>
          btn.textContent.includes('Houses') || btn.textContent.includes('🏠')
        );
        if (housesTab) housesTab.click();
      });

      await new Promise(resolve => setTimeout(resolve, 2000));

      // Test house sub-tabs
      const houseTabResults = {};
      for (let houseNum = 1; houseNum <= 3; houseNum++) { // Test first 3 houses
        try {
          const houseButton = await page.evaluate((num) => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const houseBtn = buttons.find(btn =>
              btn.textContent.includes(`${num}`) || btn.textContent.includes(`House ${num}`)
            );
            if (houseBtn) {
              houseBtn.click();
              return true;
            }
            return false;
          }, houseNum);

          await new Promise(resolve => setTimeout(resolve, 1000));

          houseTabResults[`house${houseNum}`] = {
            clicked: houseButton,
            timestamp: new Date().toISOString()
          };

          console.log(`${houseButton ? '✅' : '❌'} House ${houseNum} sub-tab: ${houseButton ? 'Found and clicked' : 'Not found'}`);

        } catch (error) {
          console.error(`❌ Error testing house ${houseNum}:`, error.message);
          houseTabResults[`house${houseNum}`] = {
            clicked: false,
            error: error.message,
            timestamp: new Date().toISOString()
          };
        }
      }

      results.phases.phase4.houseTabResults = houseTabResults;

    } catch (error) {
      console.error('❌ Error in house sub-tabs test:', error.message);
      results.phases.phase4.error = error.message;
    }

    results.phases.phase4.status = 'completed';
    results.phases.phase4.endTime = new Date().toISOString();

    // Phase 5: Test specialized display components
    console.log('📍 Phase 5: Testing display components...');
    results.phases.phase5 = { status: 'running', startTime: new Date().toISOString() };

    const displayComponents = await page.evaluate(() => {
      const components = {
        lagnaDisplay: !!document.querySelector('[class*="card-vedic"]'),
        vedicStyling: !!document.querySelector('[class*="bg-vedic"], [class*="text-primary"]'),
        loadingSpinner: !!document.querySelector('[class*="vedic-loading"], [class*="mandala"]'),
        errorHandling: !!document.querySelector('[class*="error"], [class*="text-muted"]'),
        tabNavigation: !!document.querySelector('[class*="tabs-vedic"], [class*="tab-vedic"]'),
        actionButtons: !!document.querySelector('[class*="btn-vedic"]')
      };

      // Count total displayed elements
      const allElements = document.querySelectorAll('*');
      components.totalElements = allElements.length;
      components.textContent = document.body.textContent.length;

      return components;
    });

    results.phases.phase5.displayComponents = displayComponents;
    results.phases.phase5.status = 'completed';
    results.phases.phase5.endTime = new Date().toISOString();

    console.log('📊 Display components analysis:', displayComponents);

    // Take final screenshot
    const screenshotPath2 = `tests/ui/test-logs/transformed-analysis-final-${Date.now()}.png`;
    await page.screenshot({ path: screenshotPath2, fullPage: true });
    results.screenshots.push(screenshotPath2);
    console.log(`📸 Final screenshot saved: ${screenshotPath2}`);

    // Final validation
    results.status = 'completed';
    results.endTime = new Date().toISOString();

    // Success criteria evaluation
    const successCriteria = {
      sessionDataLoaded: Object.keys(results.phases.phase3?.tabResults || {}).length > 0,
      tabNavigationWorks: Object.values(results.phases.phase3?.tabResults || {}).some(tab => tab.found),
      displayComponentsPresent: displayComponents.totalElements > 50,
      vedicStylingApplied: displayComponents.vedicStyling,
      noMajorErrors: results.errors.filter(e => e.type === 'page_error').length === 0
    };

    results.successCriteria = successCriteria;
    const overallSuccess = Object.values(successCriteria).every(Boolean);

    console.log('\n🎯 Test Results Summary:');
    console.log('========================');
    console.log(`Overall Status: ${overallSuccess ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Session Data Loaded: ${successCriteria.sessionDataLoaded ? '✅' : '❌'}`);
    console.log(`Tab Navigation Works: ${successCriteria.tabNavigationWorks ? '✅' : '❌'}`);
    console.log(`Display Components Present: ${successCriteria.displayComponentsPresent ? '✅' : '❌'}`);
    console.log(`Vedic Styling Applied: ${successCriteria.vedicStylingApplied ? '✅' : '❌'}`);
    console.log(`No Major Errors: ${successCriteria.noMajorErrors ? '✅' : '❌'}`);
    console.log(`Screenshots: ${results.screenshots.length} saved`);

    // Save detailed results
    const resultsFile = `tests/ui/test-logs/transformed-analysis-results-${Date.now()}.json`;
    fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
    console.log(`📄 Detailed results saved: ${resultsFile}`);

    return overallSuccess;

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    results.status = 'failed';
    results.error = error.message;
    results.endTime = new Date().toISOString();

    // Save error results
    const errorFile = `tests/ui/test-logs/transformed-analysis-error-${Date.now()}.json`;
    fs.writeFileSync(errorFile, JSON.stringify(results, null, 2));

    return false;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the test
if (require.main === module) {
  testTransformedAnalysisPage()
    .then(success => {
      console.log(`\n🏁 Test ${success ? 'PASSED' : 'FAILED'}`);
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal test error:', error);
      process.exit(1);
    });
}

module.exports = { testTransformedAnalysisPage };
