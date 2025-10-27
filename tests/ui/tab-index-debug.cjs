const puppeteer = require('puppeteer');

async function tabIndexDebug() {
  console.log('🔍 TAB INDEX AND ORDERING DEBUG');
  console.log('==============================');

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null
  });

  const page = await browser.newPage();

  try {
    await page.goto('http://localhost:3002', { waitUntil: 'networkidle0' });

    // Add minimal mock data
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
        analysis: { sections: { section2: { analyses: { lagna: { lagnaSign: { sign: "Libra" } } } } } }
      };

      if (window.UIDataSaver) {
        window.UIDataSaver.saveComprehensiveAnalysis(mockComprehensiveData);
      }
    });

    await page.goto('http://localhost:3002/analysis', { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Analyze all tab buttons and their attributes
    const tabAnalysis = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button[data-tab]');
      const tabInfo = [];

      buttons.forEach((btn, index) => {
        const tabKey = btn.getAttribute('data-tab');
        const isActive = btn.classList.contains('active');
        const text = btn.textContent.trim();

        tabInfo.push({
          index,
          tabKey,
          isActive,
          text,
          className: btn.className
        });
      });

      return tabInfo;
    });

    console.log('\n📊 ALL TAB BUTTONS ANALYSIS:');
    tabAnalysis.forEach(tab => {
      console.log(`   Index ${tab.index}: key="${tab.tabKey}", active=${tab.active}, text="${tab.text}"`);
    });

    // Test clicking each tab systematically
    console.log('\n🔄 SYSTEMATIC TAB CLICK TESTING:');

    for (let i = 0; i < tabAnalysis.length; i++) {
      const tab = tabAnalysis[i];
      console.log(`\n   Testing tab ${i}: "${tab.tabKey}" (${tab.text})`);

      // Click the tab by index
      const clickResult = await page.evaluate((index) => {
        const buttons = document.querySelectorAll('button[data-tab]');
        if (buttons[index]) {
          const tabKey = buttons[index].getAttribute('data-tab');
          buttons[index].click();
          return { clicked: true, tabKey };
        }
        return { clicked: false };
      }, i);

      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check which tab is now active
      const activeAfterClick = await page.evaluate(() => {
        const activeButton = document.querySelector('button[data-tab].active');
        return activeButton ? activeButton.getAttribute('data-tab') : null;
      });

      console.log(`     Clicked: ${clickResult.tabKey} → Active: ${activeAfterClick}`);

      if (clickResult.tabKey !== activeAfterClick) {
        console.log(`     ❌ MISMATCH: Expected "${clickResult.tabKey}" but got "${activeAfterClick}"`);
      } else {
        console.log(`     ✅ CORRECT: Tab switching works for "${clickResult.tabKey}"`);
      }
    }

    // Final state check
    const finalState = await page.evaluate(() => {
      const activeButton = document.querySelector('button[data-tab].active');
      const allButtons = document.querySelectorAll('button[data-tab]');

      return {
        finalActiveTab: activeButton ? activeButton.getAttribute('data-tab') : null,
        totalButtons: allButtons.length,
        allTabKeys: Array.from(allButtons).map(btn => btn.getAttribute('data-tab'))
      };
    });

    console.log('\n📋 FINAL STATE:');
    console.log(`   Active Tab: ${finalState.finalActiveTab}`);
    console.log(`   Total Buttons: ${finalState.totalButtons}`);
    console.log(`   All Tab Keys: ${finalState.allTabKeys.join(', ')}`);

  } catch (error) {
    console.error('❌ Debug error:', error);
  } finally {
    await browser.close();
  }
}

tabIndexDebug().catch(console.error);
