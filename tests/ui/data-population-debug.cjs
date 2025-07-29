const puppeteer = require('puppeteer');

async function dataPopulationDebug() {
  console.log('🔍 DATA POPULATION DEBUGGING');
  console.log('===========================');

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null
  });

  const page = await browser.newPage();

  // Monitor data-related console logs
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('Data loaded') || text.includes('analysisData') || text.includes('Available data') || text.includes('State updated')) {
      console.log(`🖥️  BROWSER: ${text}`);
    }
  });

  try {
    await page.goto('http://localhost:3002', { waitUntil: 'networkidle0' });

    // Add comprehensive mock data
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
                    characteristics: ["Diplomatic", "Charming"]
                  }
                }
              }
            },
            section3: {
              houses: {
                house1: { house: 1, sign: "LIBRA", lord: { planet: "Venus" } },
                house2: { house: 2, sign: "SCORPIO", lord: { planet: "Mars" } }
              }
            }
          }
        }
      };

      if (window.UIDataSaver) {
        window.UIDataSaver.saveComprehensiveAnalysis(mockComprehensiveData);
      }
    });

    await page.goto('http://localhost:3002/analysis', { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait longer for data loading

    // Check analysisData state after page load
    const dataStateCheck = await page.evaluate(() => {
      // Access React component state if possible
      const mainElement = document.querySelector('main, .analysis-page');

      // Try to access analysisData from window (if exposed for debugging)
      const windowAnalysisData = window.analysisData;

      // Check what data the data extraction returns
      let extractionResult = null;
      if (window.ResponseDataToUIDisplayAnalyser) {
        try {
          window.ResponseDataToUIDisplayAnalyser.loadFromComprehensiveAnalysis().then(result => {
            console.log('Direct extraction test result:', result);
          });
        } catch (e) {
          console.log('Direct extraction failed:', e.message);
        }
      }

      return {
        hasMainElement: !!mainElement,
        windowAnalysisData: windowAnalysisData ? Object.keys(windowAnalysisData) : null,
        hasDataExtractor: !!window.ResponseDataToUIDisplayAnalyser
      };
    });

    console.log('\n📊 DATA STATE ANALYSIS:');
    console.log('   Has main element:', dataStateCheck.hasMainElement);
    console.log('   Window analysisData keys:', dataStateCheck.windowAnalysisData);
    console.log('   Has data extractor:', dataStateCheck.hasDataExtractor);

    // Click lagna tab to trigger rendering and check content
    await page.evaluate(() => {
      const lagnaButton = document.querySelector('button[data-tab="lagna"]');
      if (lagnaButton) {
        lagnaButton.click();
      }
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check if content is rendered
    const contentCheck = await page.evaluate(() => {
      const bodyText = document.body.textContent || '';

      return {
        contentLength: bodyText.length,
        hasLibraText: bodyText.includes('Libra'),
        hasVenusText: bodyText.includes('Venus'),
        hasDiplomaticText: bodyText.includes('Diplomatic'),
        hasNoDataMessage: bodyText.includes('No data') || bodyText.includes('being loaded'),
        contentSample: bodyText.substring(0, 300)
      };
    });

    console.log('\n🎯 CONTENT RENDERING CHECK:');
    console.log('   Content Length:', contentCheck.contentLength);
    console.log('   Has Libra:', contentCheck.hasLibraText);
    console.log('   Has Venus:', contentCheck.hasVenusText);
    console.log('   Has Diplomatic:', contentCheck.hasDiplomaticText);
    console.log('   Has No Data Message:', contentCheck.hasNoDataMessage);
    console.log('   Content Sample:', contentCheck.contentSample);

  } catch (error) {
    console.error('❌ Debug error:', error);
  } finally {
    await browser.close();
  }
}

dataPopulationDebug().catch(console.error);
