const puppeteer = require('puppeteer');

async function debugTabClicking() {
  console.log('🐛 DEBUG TAB CLICKING TEST');
  console.log('===========================');

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null
  });

  const page = await browser.newPage();

  // Monitor console logs for React state changes
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('activeSection') || text.includes('tab') || text.includes('setActiveSection')) {
      console.log(`🖥️  BROWSER: ${text}`);
    }
  });

  try {
    // Navigate to homepage and add real session data
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

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

    // Make API call to get real comprehensive analysis data
    await page.evaluate(async () => {
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

      const data = await response.json();

      // Save to UIDataSaver
      if (window.UIDataSaver) {
        window.UIDataSaver.saveComprehensiveAnalysis(data);
      }
    });

    // Navigate to Analysis Page
    await page.goto('http://localhost:3000/analysis', { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get initial state
    const initialState = await page.evaluate(() => {
      // Try to access React state if possible
      return {
        url: window.location.href,
        currentContent: document.querySelector('.space-vedic')?.textContent?.substring(0, 200) || 'No content found',
        tabButtons: Array.from(document.querySelectorAll('button')).map(btn => ({
          text: btn.textContent?.trim(),
          className: btn.className,
          disabled: btn.disabled,
          visible: window.getComputedStyle(btn).display !== 'none'
        })).filter(tab => tab.text && (
          tab.text.toLowerCase().includes('lagna') ||
          tab.text.toLowerCase().includes('aspects') ||
          tab.text.toLowerCase().includes('arudha') ||
          tab.text.toLowerCase().includes('navamsa') ||
          tab.text.toLowerCase().includes('dasha') ||
          tab.text.toLowerCase().includes('houses')
        ))
      };
    });

    console.log('\n📊 INITIAL STATE:');
    console.log(`   URL: ${initialState.url}`);
    console.log(`   Content Preview: "${initialState.currentContent}"`);
    console.log('\n📋 TAB BUTTONS FOUND:');
    initialState.tabButtons.forEach((tab, index) => {
      console.log(`   ${index + 1}. "${tab.text}" (${tab.className})`);
    });

    // Test clicking each tab
    const tabsToClick = ['aspects', 'arudha', 'navamsa', 'dasha'];

    for (const tabName of tabsToClick) {
      console.log(`\n🔄 TESTING TAB CLICK: ${tabName}`);
      console.log('-'.repeat(40));

      // Click the tab and monitor what happens
      const clickResult = await page.evaluate((tabToClick) => {
        // Find the tab button
        const buttons = Array.from(document.querySelectorAll('button'));
        const targetButton = buttons.find(btn =>
          btn.textContent && btn.textContent.toLowerCase().includes(tabToClick)
        );

        if (!targetButton) {
          return { success: false, error: 'Button not found' };
        }

        // Record state before click
        const beforeClick = {
          buttonText: targetButton.textContent,
          buttonClasses: targetButton.className,
          currentContent: document.querySelector('.space-vedic')?.textContent?.substring(0, 100) || 'No content'
        };

        // Add debugging to button click
        console.log(`🔄 About to click tab: ${tabToClick}`);
        console.log(`🔄 Button found: ${targetButton.textContent}`);

        // Click the button
        targetButton.click();

        // Record state after click (immediate)
        const afterClick = {
          buttonClasses: targetButton.className,
          currentContent: document.querySelector('.space-vedic')?.textContent?.substring(0, 100) || 'No content'
        };

        return {
          success: true,
          beforeClick,
          afterClick,
          contentChanged: beforeClick.currentContent !== afterClick.currentContent,
          buttonClassesChanged: beforeClick.buttonClasses !== afterClick.buttonClasses
        };
      }, tabName);

      console.log(`   Click Result: ${clickResult.success ? 'SUCCESS' : 'FAILED'}`);
      if (clickResult.error) {
        console.log(`   Error: ${clickResult.error}`);
        continue;
      }

      console.log(`   Content Changed: ${clickResult.contentChanged}`);
      console.log(`   Button Classes Changed: ${clickResult.buttonClassesChanged}`);
      console.log(`   Before: "${clickResult.beforeClick.currentContent}"`);
      console.log(`   After:  "${clickResult.afterClick.currentContent}"`);

      // Wait a bit and check again
      await new Promise(resolve => setTimeout(resolve, 1000));

      const delayedCheck = await page.evaluate(() => {
        return {
          currentContent: document.querySelector('.space-vedic')?.textContent?.substring(0, 100) || 'No content',
          activeTabClasses: Array.from(document.querySelectorAll('button')).map(btn => ({
            text: btn.textContent?.trim(),
            classes: btn.className,
            isActive: btn.className.includes('active')
          })).filter(tab => tab.text && (
            tab.text.toLowerCase().includes('lagna') ||
            tab.text.toLowerCase().includes('aspects') ||
            tab.text.toLowerCase().includes('arudha') ||
            tab.text.toLowerCase().includes('navamsa') ||
            tab.text.toLowerCase().includes('dasha') ||
            tab.text.toLowerCase().includes('houses')
          ))
        };
      });

      console.log(`   Delayed Content: "${delayedCheck.currentContent}"`);
      console.log('   Tab States:');
      delayedCheck.activeTabClasses.forEach(tab => {
        console.log(`     "${tab.text}": ${tab.isActive ? 'ACTIVE' : 'inactive'}`);
      });
    }

  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await browser.close();
  }
}

debugTabClicking().catch(console.error);
