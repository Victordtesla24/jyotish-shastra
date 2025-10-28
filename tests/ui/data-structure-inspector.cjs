const puppeteer = require('puppeteer');

async function dataStructureInspector() {
  console.log('🔍 DATA STRUCTURE INSPECTOR');
  console.log('===========================');

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null
  });

  const page = await browser.newPage();

  // Monitor all console logs
  page.on('console', msg => {
    const text = msg.text();
    console.log(`🖥️  BROWSER: ${text}`);
  });

  try {
    // Navigate and inject comprehensive data
    await page.goto('http://localhost:3002', { waitUntil: 'networkidle0' });

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

      // Complete comprehensive analysis data that matches expected structure
      const mockComprehensiveData = {
        success: true,
        analysis: {
          sections: {
            section2: {
              name: "Preliminary Chart Analysis",
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
            section4: {
              name: "Planetary Aspects and Interrelationships",
              aspects: {
                majorAspects: [
                  {
                    from: "Sun",
                    to: "Moon",
                    type: "Opposition",
                    strength: 8,
                    source: "Sun",
                    target: { planet: "Moon" },
                    nature: "challenging",
                    houseDistance: 7,
                    description: "Sun opposes Moon, creating internal tension"
                  },
                  {
                    from: "Venus",
                    to: "Mars",
                    type: "Square",
                    strength: 6,
                    source: "Venus",
                    target: { planet: "Mars" },
                    nature: "challenging",
                    houseDistance: 4,
                    description: "Venus squares Mars, passion vs harmony conflict"
                  }
                ],
                allAspects: [
                  {
                    from: "Sun",
                    to: "Moon",
                    type: "Opposition",
                    strength: 8,
                    source: "Sun",
                    target: { planet: "Moon" },
                    nature: "challenging"
                  },
                  {
                    from: "Venus",
                    to: "Mars",
                    type: "Square",
                    strength: 6,
                    source: "Venus",
                    target: { planet: "Mars" },
                    nature: "challenging"
                  },
                  {
                    from: "Jupiter",
                    to: "Mercury",
                    type: "Trine",
                    strength: 7,
                    source: "Jupiter",
                    target: { planet: "Mercury" },
                    nature: "benefic"
                  }
                ],
                patterns: ["Grand Trine in Fire Signs", "T-Square involving Moon"],
                yogas: ["Gaja Kesari Yoga", "Chandra Mangal Yoga"]
              }
            },
            section5: {
              name: "Arudha Lagna Analysis",
              arudhaAnalysis: {
                arudhaLagna: {
                  sign: "Aquarius",
                  house: 5,
                  significance: "Public image and perception"
                },
                arudhaPadas: {
                  A1: "Aquarius",
                  A2: "Pisces",
                  A3: "Aries"
                },
                publicImageFactors: ["Innovation", "Humanitarian causes"],
                recommendations: ["Embrace uniqueness", "Connect with groups"]
              }
            }
          }
        }
      };

      // Save comprehensive data
      if (window.UIDataSaver) {
        window.UIDataSaver.saveComprehensiveAnalysis(mockComprehensiveData);
      }

      const storageKey = `jyotish_api_analysis_comprehensive_${Date.now()}`;
      sessionStorage.setItem(storageKey, JSON.stringify(mockComprehensiveData));
    });

    // Navigate to Analysis Page
    await page.goto('http://localhost:3000/analysis', { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Inject console logs into the components to debug data structure
    await page.evaluate(() => {
      // Override the AspectsDisplay component to log data
      console.log('🔍 INSPECTOR: Starting data structure inspection...');

      // Try to access React component state (if available through dev tools)
      if (window.React && window.React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
        console.log('🔍 INSPECTOR: React dev tools available');
      }

      // Check what's in session storage
      const storageKeys = Object.keys(sessionStorage);
      console.log('🔍 INSPECTOR: Session storage keys:', storageKeys);

      storageKeys.forEach(key => {
        if (key.includes('comprehensive')) {
          try {
            const data = JSON.parse(sessionStorage.getItem(key));
            console.log(`🔍 INSPECTOR: Data in ${key}:`, {
              hasAnalysis: !!data.analysis,
              hasSections: !!data.analysis?.sections,
              section4: !!data.analysis?.sections?.section4,
              aspectsData: data.analysis?.sections?.section4?.aspects ? Object.keys(data.analysis.sections.section4.aspects) : 'No aspects'
            });
          } catch (e) {
            console.log(`🔍 INSPECTOR: Error parsing ${key}:`, e.message);
          }
        }
      });
    });

    // Click on aspects tab
    await page.evaluate(() => {
      console.log('🔍 INSPECTOR: Clicking aspects tab...');
      const buttons = document.querySelectorAll('button[data-tab="aspects"]');
      if (buttons.length > 0) {
        buttons[0].click();
        console.log('🔍 INSPECTOR: Aspects tab clicked');
      } else {
        console.log('🔍 INSPECTOR: No aspects tab button found');
      }
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Take screenshot
    await page.screenshot({
      path: 'tests/ui/test-logs/data-inspector-aspects.png',
      fullPage: true
    });

    // Extract and log what's actually displayed
    const finalContent = await page.evaluate(() => {
      const bodyText = document.body.textContent;
      console.log('🔍 INSPECTOR: Final page content includes:');
      console.log('  - Opposition:', bodyText.includes('Opposition'));
      console.log('  - Grand Trine:', bodyText.includes('Grand Trine'));
      console.log('  - majorAspects:', bodyText.includes('majorAspects'));
      console.log('  - allAspects:', bodyText.includes('allAspects'));
      console.log('  - No data message:', bodyText.includes('Analysis data is being loaded'));
      console.log('  - Fallback message:', bodyText.includes('Planetary aspects analysis will be available'));

      return {
        hasOpposition: bodyText.includes('Opposition'),
        hasDataMessage: bodyText.includes('Analysis data is being loaded'),
        hasFallbackMessage: bodyText.includes('Planetary aspects analysis will be available'),
        contentLength: bodyText.length
      };
    });

    console.log('\n📊 FINAL INSPECTION RESULTS:');
    console.log('============================');
    console.log('Content Length:', finalContent.contentLength);
    console.log('Has Opposition:', finalContent.hasOpposition);
    console.log('Has Data Message:', finalContent.hasDataMessage);
    console.log('Has Fallback Message:', finalContent.hasFallbackMessage);

  } catch (error) {
    console.error('❌ Inspector error:', error);
  } finally {
    await browser.close();
  }
}

dataStructureInspector().catch(console.error);
