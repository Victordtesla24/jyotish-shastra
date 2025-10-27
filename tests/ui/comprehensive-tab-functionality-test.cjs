const puppeteer = require('puppeteer');

async function comprehensiveTabTest() {
  console.log('🏷️ COMPREHENSIVE TAB FUNCTIONALITY TEST');
  console.log('==========================================');

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null
  });

  const page = await browser.newPage();

  // Monitor console logs for debugging
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('AnalysisPage:') || text.includes('ResponseDataToUIDisplayAnalyser') || text.includes('ERROR') || text.includes('error')) {
      console.log(`🖥️  BROWSER: ${text}`);
    }
  });

  try {
    // Step 1: Navigate to homepage and add real session data
    await page.goto('http://localhost:3002', { waitUntil: 'networkidle0' });

    await page.evaluate(() => {
      // Add birth data
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
    });

    // Step 2: Make API call to get real comprehensive analysis data
    console.log('🔄 Fetching real API data...');

    const apiResponse = await page.evaluate(async () => {
      const response = await fetch('http://localhost:3001/api/v1/analysis/comprehensive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: "Test User",
          dateOfBirth: "1997-12-18",
          timeOfBirth: "02:30",
          latitude: 32.493538,
          longitude: 74.541158,
          timezone: "Asia/Karachi",
          gender: "male"
        })
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status}`);
      }

      const data = await response.json();

      // Save to UIDataSaver
      if (window.UIDataSaver) {
        window.UIDataSaver.saveComprehensiveAnalysis(data);
      }

      return data;
    });

    console.log(`✅ API Response received: ${JSON.stringify(apiResponse).length} bytes`);
    console.log(`📊 Available sections: ${Object.keys(apiResponse.analysis.sections)}`);

    // Step 3: Navigate to Analysis Page
    await page.goto('http://localhost:3002/analysis', { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 4: Define tabs to test
    const tabsToTest = [
      { name: 'Lagna Analysis', key: 'lagna', expectedContent: ['Libra', 'Venus', 'Diplomatic'] },
      { name: 'Houses (1-12)', key: 'houses', expectedContent: ['House 1', 'Lagna', 'personality'] },
      { name: 'Planetary Aspects', key: 'aspects', expectedContent: ['aspects', 'planetary', 'yoga'] },
      { name: 'Arudha Padas', key: 'arudha', expectedContent: ['arudha', 'perception', 'image'] },
      { name: 'Navamsa Chart', key: 'navamsa', expectedContent: ['navamsa', 'marriage', 'soul'] },
      { name: 'Dasha Periods', key: 'dasha', expectedContent: ['dasha', 'timeline', 'periods'] }
    ];

    const results = {};

    // Step 5: Test each tab
    for (const tab of tabsToTest) {
      console.log(`\n🏷️ Testing tab: ${tab.name}`);

      // Click the tab
      const tabButton = await page.$$eval('button', (buttons, tabName) => {
        const button = buttons.find(btn =>
          btn.textContent && btn.textContent.toLowerCase().includes(tabName.toLowerCase().split(' ')[0])
        );
        if (button) {
          button.click();
          return true;
        }
        return false;
      }, tab.name);

      if (!tabButton) {
        console.log(`❌ Tab button not found for: ${tab.name}`);
        results[tab.key] = { success: false, error: 'Tab button not found' };
        continue;
      }

      // Wait for content to load
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Take screenshot for this tab
      const screenshotPath = `tests/ui/test-logs/tab-${tab.key}-${Date.now()}.png`;
      await page.screenshot({
        path: screenshotPath,
        fullPage: true
      });

      // Extract content and check for expected keywords
      const tabContent = await page.evaluate((expectedContent) => {
        const bodyText = document.body.textContent.toLowerCase();
        const contentChecks = expectedContent.map(keyword => ({
          keyword,
          found: bodyText.includes(keyword.toLowerCase())
        }));

        return {
          bodyTextLength: bodyText.length,
          contentChecks,
          hasNoDataMessage: bodyText.includes('no analysis data') || bodyText.includes('no real data'),
          fullText: bodyText.substring(0, 1000) // First 1000 chars for debug
        };
      }, tab.expectedContent);

      const foundCount = tabContent.contentChecks.filter(check => check.found).length;
      const successRate = foundCount / tab.expectedContent.length;

      results[tab.key] = {
        success: successRate >= 0.5, // At least 50% of expected content found
        foundCount,
        totalExpected: tab.expectedContent.length,
        successRate,
        hasNoDataMessage: tabContent.hasNoDataMessage,
        contentChecks: tabContent.contentChecks,
        screenshotPath
      };

      console.log(`   📊 Expected content found: ${foundCount}/${tab.expectedContent.length}`);
      console.log(`   📊 Success rate: ${(successRate * 100).toFixed(1)}%`);
      console.log(`   📊 Has "No Data" message: ${tabContent.hasNoDataMessage}`);
      console.log(`   📸 Screenshot saved: ${screenshotPath}`);
    }

    // Step 6: Generate final report
    console.log('\n🎯 COMPREHENSIVE TAB TEST RESULTS');
    console.log('================================');

    let totalSuccess = 0;
    let totalTabs = tabsToTest.length;

    for (const tab of tabsToTest) {
      const result = results[tab.key];
      if (result.success) totalSuccess++;

      console.log(`\n${result.success ? '✅' : '❌'} ${tab.name}:`);
      console.log(`   Success: ${result.success}`);
      console.log(`   Content Match: ${result.foundCount}/${result.totalExpected} (${(result.successRate * 100).toFixed(1)}%)`);
      console.log(`   Has No Data Message: ${result.hasNoDataMessage}`);

      if (result.contentChecks) {
        result.contentChecks.forEach(check => {
          console.log(`     - "${check.keyword}": ${check.found ? '✅' : '❌'}`);
        });
      }
    }

    console.log(`\n🎯 OVERALL RESULT: ${totalSuccess}/${totalTabs} tabs working (${(totalSuccess/totalTabs * 100).toFixed(1)}%)`);

    if (totalSuccess === totalTabs) {
      console.log('🎉 ALL TABS WORKING CORRECTLY!');
    } else {
      console.log('⚠️  SOME TABS NEED FIXING');
    }

  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await browser.close();
  }
}

comprehensiveTabTest().catch(console.error);
