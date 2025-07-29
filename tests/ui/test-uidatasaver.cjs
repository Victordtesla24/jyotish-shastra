const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('📊 Testing UIDataSaver data retrieval...');
    const testData = JSON.parse(fs.readFileSync('../test-data/analysis-comprehensive-response.json', 'utf8'));

    await page.goto('http://localhost:3002');

    // Inject data in UIDataSaver expected format
    const result = await page.evaluate((data) => {
      const birthData = {
        name: 'Test User',
        dateOfBirth: '1990-08-15',
        timeOfBirth: '10:30',
        placeOfBirth: 'Mumbai, Maharashtra, India',
        latitude: 19.0760,
        longitude: 72.8777
      };

      const sessionData = {
        birthData: birthData,
        apiResponse: {
          analysis: data,
          sections: data.analysis?.sections || data.sections,
          comprehensiveAnalysis: data.analysis?.sections || data.sections,
          success: true,
          timestamp: new Date().toISOString()
        },
        timestamp: new Date().toISOString(),
        sessionId: 'test_session_' + Date.now()
      };

      // Store data
      sessionStorage.setItem('current_session', JSON.stringify(sessionData));

      // Test UIDataSaver methods directly
      try {
        // Simulate UIDataSaver.loadSession()
        const sessionKey = 'current_session';
        const savedSessionData = sessionStorage.getItem(sessionKey);
        const currentSession = savedSessionData ? JSON.parse(savedSessionData) : null;

        const loadedData = {
          currentSession,
          preferences: null,
          birthData: null,
          loadedAt: new Date().toISOString()
        };

        // Simulate UIDataSaver.getAnalysisData()
        const sections = loadedData?.currentSession?.apiResponse?.sections ||
                         loadedData?.currentSession?.apiResponse?.comprehensiveAnalysis;

        const analysisData = loadedData?.currentSession?.apiResponse?.analysis;

        return {
          success: true,
          sessionDataStored: !!currentSession,
          hasApiResponse: !!loadedData?.currentSession?.apiResponse,
          hasSections: !!sections,
          hasAnalysis: !!analysisData,
          sectionKeys: Object.keys(sections || {}),
          retrievedSections: sections,
          retrievedAnalysis: analysisData ? Object.keys(analysisData) : []
        };

      } catch (error) {
        return {
          success: false,
          error: error.message
        };
      }
    }, testData);

    console.log('🔍 UIDataSaver test results:');
    console.log('- Session data stored:', result.sessionDataStored);
    console.log('- Has API response:', result.hasApiResponse);
    console.log('- Has sections:', result.hasSections);
    console.log('- Has analysis:', result.hasAnalysis);
    console.log('- Section keys:', result.sectionKeys);
    console.log('- Analysis keys:', result.retrievedAnalysis);

    if (result.hasSections) {
      console.log('✅ UIDataSaver can retrieve sections - testing ComprehensiveAnalysisPage');

      // Navigate to comprehensive analysis page to see if it works
      await page.goto('http://localhost:3002/comprehensive');
      await new Promise(resolve => setTimeout(resolve, 3000));

      const pageResult = await page.evaluate(() => {
        return {
          sections: document.querySelectorAll('.analysis-section').length,
          questions: document.querySelectorAll('.qa-item').length,
          hasContent: document.body.textContent.includes('comprehensive')
        };
      });

      console.log('📋 Page after UIDataSaver test:');
      console.log('- Sections found:', pageResult.sections);
      console.log('- Questions found:', pageResult.questions);
      console.log('- Has content:', pageResult.hasContent);

    } else {
      console.log('❌ UIDataSaver cannot retrieve sections');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
})();
