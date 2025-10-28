const puppeteer = require('puppeteer');

async function tabSwitchingTest() {
  console.log('🔄 TAB SWITCHING VERIFICATION TEST');
  console.log('=================================');

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null
  });

  const page = await browser.newPage();

  // Monitor console logs to track tab switching
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('🔄 AnalysisPage: Switching to') ||
        text.includes('🎯 AnalysisPage: renderTabContent') ||
        text.includes('handleTabChange') ||
        text.includes('activeSection')) {
      console.log(`🖥️  BROWSER: ${text}`);
    }
  });

  try {
    // Navigate to homepage first
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

    // Add mock comprehensive analysis data
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

      // Add comprehensive analysis data
      const mockComprehensiveData = {
        success: true,
        analysis: {
          sections: {
            section2: {
              analyses: {
                lagna: {
                  lagnaSign: { sign: "Libra", ruler: "Venus", characteristics: ["Diplomatic", "Charming"] }
                }
              }
            },
            section3: {
              houses: {
                house1: { house: 1, sign: "LIBRA", lord: { planet: "Venus" } },
                house2: { house: 2, sign: "SCORPIO", lord: { planet: "Mars" } }
              }
            },
            section4: {
              aspects: { majorAspects: [], patterns: [] }
            },
            section5: {
              arudhaAnalysis: { arudhaLagna: {}, publicImageFactors: [] }
            },
            section6: {
              navamsaAnalysis: { navamsaLagna: "Scorpio", marriageIndications: {} }
            },
            section7: {
              dashaAnalysis: { currentDasha: { planet: "Venus" }, upcomingPeriods: [] }
            }
          }
        }
      };

      if (window.UIDataSaver) {
        window.UIDataSaver.saveComprehensiveAnalysis(mockComprehensiveData);
      }
    });

    // Navigate to Analysis Page
    await page.goto('http://localhost:3000/analysis', { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('\n🎯 TESTING TAB SWITCHING FUNCTIONALITY:');

    // Test each tab
    const tabs = [
      { key: 'lagna', name: 'Lagna Analysis' },
      { key: 'houses', name: 'Houses (1-12)' },
      { key: 'aspects', name: 'Planetary Aspects' },
      { key: 'arudha', name: 'Arudha Padas' },
      { key: 'navamsa', name: 'Navamsa Chart' },
      { key: 'dasha', name: 'Dasha Periods' }
    ];

    for (const tab of tabs) {
      console.log(`\n🔄 Testing ${tab.name} tab...`);

      // Click the tab
      const tabClicked = await page.evaluate((tabKey) => {
        const buttons = document.querySelectorAll('button[data-tab]');
        for (const btn of buttons) {
          if (btn.getAttribute('data-tab') === tabKey) {
            console.log(`🔄 AnalysisPage: Clicking ${tabKey} tab button`);
            btn.click();
            return true;
          }
        }
        return false;
      }, tab.key);

      if (!tabClicked) {
        console.log(`❌ Tab button for ${tab.key} not found`);
        continue;
      }

      // Wait for tab change
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if tab is active and content changed
      const tabStatus = await page.evaluate((tabKey) => {
        // Check if tab button is active
        const activeButton = document.querySelector(`button[data-tab="${tabKey}"].active`);
        const isActive = !!activeButton;

        // Get current content
        const contentElement = document.querySelector('.tab-content, .analysis-content, [class*="content"]');
        const contentText = contentElement ? contentElement.textContent : '';

        return {
          isActive,
          hasContent: contentText.length > 100,
          contentPreview: contentText.substring(0, 200)
        };
      }, tab.key);

      console.log(`   Tab Active: ${tabStatus.isActive}`);
      console.log(`   Has Content: ${tabStatus.hasContent}`);
      console.log(`   Content Preview: ${tabStatus.contentPreview.substring(0, 100)}...`);

      if (tabStatus.isActive && tabStatus.hasContent) {
        console.log(`   ✅ ${tab.name} tab working correctly`);
      } else {
        console.log(`   ❌ ${tab.name} tab has issues`);
      }
    }

    // Take final screenshot
    const screenshotPath = `tests/ui/test-logs/tab-switching-test-${Date.now()}.png`;
    await page.screenshot({
      path: screenshotPath,
      fullPage: true
    });

    console.log(`\n📸 Screenshot saved: ${screenshotPath}`);

  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await browser.close();
  }
}

tabSwitchingTest().catch(console.error);
