const puppeteer = require('puppeteer');

async function comprehensiveTabsValidation() {
  console.log('🔬 COMPREHENSIVE TABS VALIDATION TEST');
  console.log('====================================');

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null
  });

  const page = await browser.newPage();

  // Monitor console logs for debugging
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('AnalysisPage:') || text.includes('analysis') || text.includes('tab') || text.includes('ERROR') || text.includes('error')) {
      console.log(`🖥️  BROWSER: ${text}`);
    }
  });

  try {
    // Navigate to homepage first and inject comprehensive data
    await page.goto('http://localhost:3002', { waitUntil: 'networkidle0' });

    // Add mock birth data and comprehensive analysis
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

      // Comprehensive analysis data with ALL sections for ALL tabs
      const mockComprehensiveData = {
        success: true,
        analysis: {
          sections: {
            section1: {
              name: "Birth Data Collection and Chart Casting",
              summary: "Chart successfully cast for December 18, 1997 at 02:30 AM in Karachi",
              birthData: mockBirthData,
              chartValidation: "All planetary positions calculated accurately"
            },
            section2: {
              name: "Preliminary Chart Analysis",
              analyses: {
                lagna: {
                  lagnaSign: {
                    sign: "Libra",
                    ruler: "Venus",
                    element: "Air",
                    quality: "Cardinal",
                    characteristics: [
                      "Diplomatic and fair-minded",
                      "Social and charming",
                      "Appreciation for beauty and harmony",
                      "Good sense of justice",
                      "Cooperative and balanced",
                      "Can be indecisive and dependent"
                    ]
                  },
                  lagnaLord: {
                    planet: "Venus",
                    sign: "Capricorn",
                    dignity: "Friends House",
                    strength: 5
                  }
                }
              }
            },
            section3: {
              name: "House-by-House Examination",
              houses: {
                house1: {
                  house: 1,
                  sign: "LIBRA",
                  lord: { planet: "Venus", house: 4, sign: "Capricorn" },
                  interpretation: "House 1 governs personality, health, appearance, self, vitality"
                },
                house2: {
                  house: 2,
                  sign: "SCORPIO",
                  lord: { planet: "Mars", house: 7, sign: "Aries" },
                  interpretation: "House 2 governs wealth, family, speech"
                },
                house3: {
                  house: 3,
                  sign: "SAGITTARIUS",
                  lord: { planet: "Jupiter", house: 5, sign: "Aquarius" },
                  interpretation: "House 3 governs courage, siblings, communication"
                }
              }
            },
            section4: {
              name: "Planetary Aspects and Interrelationships",
              aspects: {
                majorAspects: [
                  { from: "Sun", to: "Moon", type: "Opposition", strength: 8 },
                  { from: "Venus", to: "Mars", type: "Square", strength: 6 }
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
                }
              }
            },
            section6: {
              name: "Navamsa Chart Analysis",
              navamsaAnalysis: {
                navamsaLagna: "Sagittarius",
                marriageIndications: {
                  venus: { sign: "Capricorn", dignity: "Neutral" },
                  jupiter: { sign: "Aquarius", dignity: "Good" },
                  seventhHouse: { sign: "Gemini", lord: "Mercury" }
                },
                spiritualIndications: {
                  dharmaPath: "Service to others through diplomacy",
                  spiritualPractices: ["Meditation", "Mantra chanting", "Venus worship"]
                }
              }
            },
            section7: {
              name: "Dasha Analysis",
              dashaAnalysis: {
                currentDasha: {
                  mahadasha: "Venus",
                  antardasha: "Sun",
                  startDate: "2023-01-15",
                  endDate: "2024-03-20"
                },
                upcomingPeriods: [
                  { period: "Venus-Moon", start: "2024-03-20", significance: "Emotional growth" },
                  { period: "Venus-Mars", start: "2025-01-10", significance: "Energy and action" }
                ]
              }
            },
            section8: {
              name: "Synthesis and Comprehensive Report",
              synthesis: {
                overallThemes: ["Diplomacy and relationships", "Artistic talents", "Balanced approach to life"],
                keyStrengths: ["Natural charm", "Sense of justice", "Aesthetic appreciation"],
                challenges: ["Indecisiveness", "Dependency on others"],
                recommendations: ["Develop decision-making skills", "Practice independence", "Cultivate self-confidence"]
              }
            }
          }
        }
      };

      // Save comprehensive data to UIDataSaver
      if (window.UIDataSaver) {
        window.UIDataSaver.saveComprehensiveAnalysis(mockComprehensiveData);
      }

      // Also save to session storage with timestamp key
      const storageKey = `jyotish_api_analysis_comprehensive_${Date.now()}`;
      sessionStorage.setItem(storageKey, JSON.stringify(mockComprehensiveData));
    });

    // Navigate to Analysis Page
    await page.goto('http://localhost:3002/analysis', { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 2000));

    const tabs = [
      { key: 'lagna', name: 'Lagna Analysis', expectedContent: ['Libra', 'Venus', 'Diplomatic'] },
      { key: 'houses', name: 'Houses (1-12)', expectedContent: ['House 1', 'personality', 'LIBRA'] },
      { key: 'aspects', name: 'Planetary Aspects', expectedContent: ['Opposition', 'Grand Trine', 'yogas'] },
      { key: 'arudha', name: 'Arudha Padas', expectedContent: ['Aquarius', 'public image', 'perception'] },
      { key: 'navamsa', name: 'Navamsa Chart', expectedContent: ['Sagittarius', 'marriage', 'spiritual'] },
      { key: 'dasha', name: 'Dasha Periods', expectedContent: ['Venus', 'current', 'upcoming'] },
      { key: 'preliminary', name: 'Preliminary', expectedContent: ['birth data', 'chart', 'validation'] },
      { key: 'comprehensive', name: 'Full Analysis', expectedContent: ['synthesis', 'themes', 'recommendations'] }
    ];

    const results = [];

    for (const tab of tabs) {
      console.log(`\n🔍 Testing ${tab.name} Tab`);
      console.log('============================');

      // Click the tab button
      await page.evaluate((tabKey) => {
        const buttons = document.querySelectorAll('button[data-tab]');
        buttons.forEach(btn => {
          if (btn.getAttribute('data-tab') === tabKey || btn.textContent.toLowerCase().includes(tabKey.toLowerCase())) {
            btn.click();
          }
        });
      }, tab.key);

      await new Promise(resolve => setTimeout(resolve, 1000));

      // Take screenshot
      const screenshotPath = `tests/ui/test-logs/tab-${tab.key}-validation-${Date.now()}.png`;
      await page.screenshot({
        path: screenshotPath,
        fullPage: true
      });

      console.log(`📸 Screenshot: ${screenshotPath}`);

      // Extract content and validate
      const tabContent = await page.evaluate(() => {
        const bodyText = document.body.textContent || '';
        return {
          bodyText: bodyText.toLowerCase(),
          bodyLength: bodyText.length,
          fullText: bodyText.substring(0, 1000) // First 1000 chars for analysis
        };
      });

      // Check for expected content
      const foundContent = tab.expectedContent.filter(content =>
        tabContent.bodyText.includes(content.toLowerCase())
      );

      const result = {
        tab: tab.name,
        key: tab.key,
        expectedContent: tab.expectedContent,
        foundContent,
        contentMatches: foundContent.length,
        totalExpected: tab.expectedContent.length,
        success: foundContent.length > 0,
        bodyLength: tabContent.bodyLength,
        screenshot: screenshotPath
      };

      results.push(result);

      console.log(`   Expected content: ${tab.expectedContent.join(', ')}`);
      console.log(`   Found content: ${foundContent.join(', ')}`);
      console.log(`   Match rate: ${foundContent.length}/${tab.expectedContent.length}`);
      console.log(`   Success: ${result.success ? '✅' : '❌'}`);
    }

    // Generate summary report
    console.log('\n📊 COMPREHENSIVE TABS VALIDATION SUMMARY');
    console.log('==========================================');

    const successfulTabs = results.filter(r => r.success);
    const failedTabs = results.filter(r => !r.success);

    console.log(`✅ Successful tabs: ${successfulTabs.length}/${results.length}`);
    console.log(`❌ Failed tabs: ${failedTabs.length}/${results.length}`);

    if (successfulTabs.length > 0) {
      console.log('\n✅ WORKING TABS:');
      successfulTabs.forEach(tab => {
        console.log(`   - ${tab.tab}: ${tab.contentMatches}/${tab.totalExpected} content matches`);
      });
    }

    if (failedTabs.length > 0) {
      console.log('\n❌ FAILED TABS:');
      failedTabs.forEach(tab => {
        console.log(`   - ${tab.tab}: No expected content found`);
      });
    }

    const overallSuccess = successfulTabs.length >= 6; // At least 6 out of 8 tabs should work
    console.log(`\n🎯 OVERALL RESULT: ${overallSuccess ? '✅ SUCCESS' : '❌ FAILURE'}`);
    console.log(`   Tab switching functionality: ${successfulTabs.length >= 4 ? 'WORKING' : 'BROKEN'}`);
    console.log(`   API data display: ${successfulTabs.length >= 5 ? 'WORKING' : 'BROKEN'}`);

  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await browser.close();
  }
}

comprehensiveTabsValidation().catch(console.error);
