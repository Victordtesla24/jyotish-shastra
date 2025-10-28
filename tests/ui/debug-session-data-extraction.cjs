#!/usr/bin/env node

const puppeteer = require('puppeteer');

async function extractSessionData() {
  console.log('🔍 Extracting session data from browser...');

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });

  try {
    const page = await browser.newPage();

    // Navigate to the frontend
    await page.goto('http://localhost:3000');

    // Wait for page to load
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Extract session storage data
    const sessionData = await page.evaluate(() => {
      const data = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        try {
          const value = localStorage.getItem(key);
          data[key] = JSON.parse(value);
        } catch (e) {
          data[key] = value;
        }
      }
      return data;
    });

    console.log('\n📋 Session Storage Data:');
    console.log('Keys found:', Object.keys(sessionData));

    // Extract birth data specifically
    if (sessionData.birthData) {
      console.log('\n✅ Birth Data Found:');
      console.log(JSON.stringify(sessionData.birthData, null, 2));

      // Generate curl command
      const birthDataJson = JSON.stringify(sessionData.birthData);
      console.log('\n🚀 CURL Command for CORRECT endpoint:');
      console.log(`curl -X POST http://localhost:3001/api/v1/analysis/comprehensive \\`);
      console.log(`  -H "Content-Type: application/json" \\`);
      console.log(`  -d '${birthDataJson}'`);

      console.log('\n❌ CURL Command for INCORRECT endpoint (what UI is calling):');
      console.log(`curl -X POST http://localhost:3001/api/analysis/comprehensive \\`);
      console.log(`  -H "Content-Type: application/json" \\`);
      console.log(`  -d '${birthDataJson}'`);

    } else if (sessionData.current_session && sessionData.current_session.birthData) {
      console.log('\n✅ Birth Data Found in current_session:');
      const birthData = sessionData.current_session.birthData;
      console.log(JSON.stringify(birthData, null, 2));

      // Generate curl command
      const birthDataJson = JSON.stringify(birthData);
      console.log('\n🚀 CURL Command for CORRECT endpoint:');
      console.log(`curl -X POST http://localhost:3001/api/v1/analysis/comprehensive \\`);
      console.log(`  -H "Content-Type: application/json" \\`);
      console.log(`  -d '${birthDataJson}'`);

      console.log('\n❌ CURL Command for INCORRECT endpoint (what UI is calling):');
      console.log(`curl -X POST http://localhost:3001/api/analysis/comprehensive \\`);
      console.log(`  -H "Content-Type: application/json" \\`);
      console.log(`  -d '${birthDataJson}'`);

    } else {
      console.log('\n❌ No birth data found in session storage');
      console.log('Available data:', Object.keys(sessionData));
    }

    console.log('\n\nPress ENTER to close browser...');
    process.stdin.once('data', () => {
      browser.close();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Error:', error);
    await browser.close();
    process.exit(1);
  }
}

extractSessionData().catch(console.error);
