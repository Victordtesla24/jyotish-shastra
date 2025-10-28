const puppeteer = require('puppeteer');

async function dataFlowDebug() {
  console.log('🔍 DATA FLOW ANALYSIS - DETAILED EXTRACTION');
  console.log('==========================================');

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null
  });

  const page = await browser.newPage();

  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

    // Add mock data
    await page.evaluate(() => {
      const mockBirthData = {
        name: "Test User",
        dateOfBirth: "1997-12-18",
        timeOfBirth: "02:30",
        latitude: 32.493538,
        longitude: 74.541158,
        timezone: "Asia/Karachi",
        gender: "male"
      };

      sessionStorage.setItem('birthData', JSON.stringify(mockBirthData));

      const mockComprehensiveData = {
        success: true,
        analysis: {
          sections: {
            section2: {
              analyses: {
                lagna: {
                  lagnaSign: {
                    sign: "Libra",
                    ruler: "Venus",
                    characteristics: ["Diplomatic and fair-minded", "Social and charming"]
                  }
                }
              }
            },
            section3: {
              houses: {
                house1: { house: 1, sign: "LIBRA", lord: { planet: "Venus" }, interpretation: "House of self" },
                house2: { house: 2, sign: "SCORPIO", lord: { planet: "Mars" }, interpretation: "House of wealth" }
              }
            }
          }
        }
      };

      if (window.UIDataSaver) {
        window.UIDataSaver.saveComprehensiveAnalysis(mockComprehensiveData);
      }
    });

    await page.goto('http://localhost:3000/analysis', { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 4000));

    // Extract REAL data from React component state
    const reactDataAnalysis = await page.evaluate(() => {
      // Try to access the React component instance
      const analysisPageElement = document.querySelector('[data-testid="analysis-page"], .analysis-page, main');

      if (analysisPageElement && analysisPageElement._reactInternalFiber) {
        // Old React version
        const fiber = analysisPageElement._reactInternalFiber;
        return { hasReactFiber: true, fiberType: 'old' };
      } else if (analysisPageElement && analysisPageElement._reactInternalInstance) {
        // Another React version
        return { hasReactFiber: true, fiberType: 'instance' };
      }

      // Alternative approach: check if any global analysis data exists
      if (window.analysisData) {
        return {
          hasReactFiber: false,
          globalAnalysisData: Object.keys(window.analysisData),
          analysisDataContent: JSON.stringify(window.analysisData)
        };
      }

      // Check if we can access component props/state through React DevTools API
      if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
        return { hasReactDevTools: true };
      }

      return { hasReactFiber: false, globalAnalysisData: null };
    });

    console.log('\n🔍 REACT COMPONENT ANALYSIS:');
    console.log(JSON.stringify(reactDataAnalysis, null, 2));

    // Test ResponseDataToUIDisplayAnalyser directly
    const directDataTest = await page.evaluate(async () => {
      if (window.ResponseDataToUIDisplayAnalyser) {
        try {
          const result = await window.ResponseDataToUIDisplayAnalyser.loadFromComprehensiveAnalysis();
          return {
            success: result.success,
            dataKeys: result.data ? Object.keys(result.data) : [],
            source: result.source,
            lagnaData: result.data?.lagna ? {
              hasAnalysis: !!result.data.lagna.analysis,
              analysisKeys: result.data.lagna.analysis ? Object.keys(result.data.lagna.analysis) : []
            } : null,
            housesData: result.data?.houses ? {
              hasAnalysis: !!result.data.houses.analysis,
              analysisKeys: result.data.houses.analysis ? Object.keys(result.data.houses.analysis) : []
            } : null
          };
        } catch (error) {
          return { error: error.message };
        }
      }
      return { error: 'ResponseDataToUIDisplayAnalyser not available' };
    });

    console.log('\n📊 DIRECT DATA LAYER TEST:');
    console.log(JSON.stringify(directDataTest, null, 2));

    // Check current tab state and data
    const currentState = await page.evaluate(() => {
      // Try to get the current activeSection somehow
      const activeTab = document.querySelector('button[data-tab].active');
      const activeTabKey = activeTab ? activeTab.getAttribute('data-tab') : null;

      // Check content area
      const contentArea = document.querySelector('.tab-content, main');
      const hasContent = contentArea ? contentArea.children.length > 0 : false;

      // Look for specific component elements
      const hasLagnaDisplay = !!document.querySelector('.lagna-display, [class*="lagna"]');
      const hasHouseDisplay = !!document.querySelector('.house-display, [class*="house"]');

      return {
        activeTabKey,
        hasContent,
        hasLagnaDisplay,
        hasHouseDisplay,
        contentChildrenCount: contentArea ? contentArea.children.length : 0
      };
    });

    console.log('\n🎯 CURRENT UI STATE:');
    console.log(JSON.stringify(currentState, null, 2));

    // Click houses tab and recheck
    await page.evaluate(() => {
      const housesButton = document.querySelector('button[data-tab="houses"]');
      if (housesButton) {
        housesButton.click();
      }
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    const afterHousesClick = await page.evaluate(() => {
      const activeTab = document.querySelector('button[data-tab].active');
      const activeTabKey = activeTab ? activeTab.getAttribute('data-tab') : null;
      const contentArea = document.querySelector('.tab-content, main');
      const allText = document.body.textContent || '';

      return {
        activeTabKey,
        contentLength: allText.length,
        hasVenusContent: allText.includes('Venus'),
        hasLibraContent: allText.includes('Libra'),
        hasHouseNumbers: allText.includes('House 1') || allText.includes('1Self')
      };
    });

    console.log('\n🏠 AFTER HOUSES TAB CLICK:');
    console.log(JSON.stringify(afterHousesClick, null, 2));

  } catch (error) {
    console.error('❌ Debug error:', error);
  } finally {
    await browser.close();
  }
}

dataFlowDebug().catch(console.error);
