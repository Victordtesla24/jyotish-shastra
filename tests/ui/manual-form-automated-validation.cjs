const puppeteer = require('puppeteer');

async function manualFormAutomatedValidation() {
  console.log('🔬 MANUAL FORM → AUTOMATED VALIDATION TEST');
  console.log('==========================================');
  console.log('📝 Please manually enter birth data and click Generate Chart');
  console.log('🤖 Test will automatically monitor and validate after submission');
  console.log('');

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1280, height: 800 }
  });
  const page = await browser.newPage();

  // Monitor console logs to detect API calls
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('HomePage:') || text.includes('UIDataSaver:') || text.includes('comprehensive') || text.includes('ERROR') || text.includes('error') || text.includes('API')) {
      console.log(`🖥️  BROWSER: ${text}`);
    }
  });

  // Monitor page errors
  page.on('pageerror', error => {
    console.log(`❌ PAGE ERROR: ${error.message}`);
  });

  // Monitor network requests for API calls
  page.on('response', async response => {
    if (response.url().includes('/api/v1/') || response.url().includes('/api/')) {
      console.log(`🌐 API CALL: ${response.status()} ${response.url()}`);
      if (response.url().includes('comprehensive')) {
        try {
          const responseText = await response.text();
          console.log(`📦 API RESPONSE SIZE: ${responseText.length} characters`);
          if (responseText.length > 50000) {
            console.log('✅ Large API response detected (likely comprehensive analysis)');
          }
        } catch (e) {
          console.log('⚠️  Could not read response body');
        }
      }
    }
  });

  try {
    // Navigate to homepage
    await page.goto('http://localhost:3002', { waitUntil: 'networkidle0' });
    console.log('📍 Navigated to homepage');

    // Take initial screenshot
    await page.screenshot({
      path: 'tests/ui/test-logs/' + new Date().toISOString().replace(/:/g, '-') + '-01-homepage-ready-for-input.png',
      fullPage: true
    });
    console.log('📸 Screenshot: Homepage ready for manual input');

    console.log('');
    console.log('👤 WAITING FOR MANUAL INPUT...');
    console.log('Please:');
    console.log('1. Enter your birth data in the form');
    console.log('2. Click the "Generate Chart" button');
    console.log('3. Wait for the test to continue automatically');
    console.log('');

    // Wait for navigation away from homepage (indicates form submission)
    await page.waitForFunction(() => {
      return window.location.pathname !== '/';
    }, { timeout: 300000 }); // 5 minute timeout

    console.log('🚀 Form submitted! Navigation detected');

    // Take screenshot after form submission
    await page.screenshot({
      path: 'tests/ui/test-logs/' + new Date().toISOString().replace(/:/g, '-') + '-02-after-form-submission.png',
      fullPage: true
    });

    // Check current page
    const currentUrl = page.url();
    console.log(`📍 Current page: ${currentUrl}`);

    // Wait a moment for any loading to complete
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Check session storage immediately after form submission
    const sessionCheck1 = await page.evaluate(() => {
      const storage = {};
      const keyCount = sessionStorage.length;
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        storage[key] = true; // Just check existence, not content
      }
      return { keyCount, keys: Object.keys(storage) };
    });

    console.log('📊 SESSION STORAGE CHECK (After Form Submission):');
    console.log(`   Keys found: ${sessionCheck1.keyCount}`);
    console.log(`   Key names: ${sessionCheck1.keys.join(', ')}`);

    // Wait for potential API calls to complete
    console.log('⏳ Waiting for API calls to complete...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Check session storage again after API calls
    const sessionCheck2 = await page.evaluate(() => {
      const storage = {};
      const keyCount = sessionStorage.length;

      // Get comprehensive analysis data specifically
      const comprehensiveKeys = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        storage[key] = true;
        if (key.includes('comprehensive') || key.includes('analysis')) {
          comprehensiveKeys.push(key);
        }
      }

      // Try different methods to get comprehensive analysis
      let comprehensiveData = null;

      // Method 1: Direct UIDataSaver methods
      if (window.UIDataSaver) {
        try {
          comprehensiveData = window.UIDataSaver.getComprehensiveAnalysis();
        } catch (e) {
          console.log('UIDataSaver.getComprehensiveAnalysis() failed:', e.message);
        }
      }

      // Method 2: Check specific storage keys
      if (!comprehensiveData && comprehensiveKeys.length > 0) {
        for (const key of comprehensiveKeys) {
          try {
            const data = JSON.parse(sessionStorage.getItem(key));
            if (data && (data.analysis || data.sections)) {
              comprehensiveData = data;
              break;
            }
          } catch (e) {
            continue;
          }
        }
      }

      return {
        keyCount,
        keys: Object.keys(storage),
        comprehensiveKeys,
        hasComprehensiveData: !!comprehensiveData,
        comprehensiveDataSize: comprehensiveData ? JSON.stringify(comprehensiveData).length : 0
      };
    });

    console.log('📊 SESSION STORAGE CHECK (After API Calls):');
    console.log(`   Total keys: ${sessionCheck2.keyCount}`);
    console.log(`   Comprehensive keys: ${sessionCheck2.comprehensiveKeys.join(', ')}`);
    console.log(`   Has comprehensive data: ${sessionCheck2.hasComprehensiveData}`);
    console.log(`   Comprehensive data size: ${sessionCheck2.comprehensiveDataSize} characters`);

    // Navigate to analysis page to test data loading
    console.log('🔄 Navigating to comprehensive analysis page...');
    await page.goto('http://localhost:3002/comprehensive-analysis', { waitUntil: 'networkidle0' });

    // Wait for page to load
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Take screenshot of analysis page
    await page.screenshot({
      path: 'tests/ui/test-logs/' + new Date().toISOString().replace(/:/g, '-') + '-03-comprehensive-analysis-page.png',
      fullPage: true
    });

    // Check what's displayed on the analysis page
    const pageAnalysis = await page.evaluate(() => {
      const pageContent = document.body.innerText;
      const hasNoDataMessage = pageContent.includes('NO REAL DATA') || pageContent.includes('No data available');
      const hasSectionContent = pageContent.includes('section') || pageContent.includes('analysis');
      const hasLoadingIndicator = pageContent.includes('Loading') || pageContent.includes('loading');

      // Look for specific UI elements
      const sections = document.querySelectorAll('[data-section], .analysis-section, .vedic-section');
      const sectionCount = sections.length;

      // Check for specific text content
      const hasComprehensiveContent = pageContent.includes('Lagna') || pageContent.includes('House') || pageContent.includes('Dasha');

      return {
        hasNoDataMessage,
        hasSectionContent,
        hasLoadingIndicator,
        sectionCount,
        hasComprehensiveContent,
        pageLength: pageContent.length,
        firstLineOfContent: pageContent.split('\n')[0]
      };
    });

    console.log('📋 ANALYSIS PAGE CONTENT CHECK:');
    console.log(`   Has "NO REAL DATA" message: ${pageAnalysis.hasNoDataMessage}`);
    console.log(`   Has section content: ${pageAnalysis.hasSectionContent}`);
    console.log(`   Has loading indicator: ${pageAnalysis.hasLoadingIndicator}`);
    console.log(`   Section elements found: ${pageAnalysis.sectionCount}`);
    console.log(`   Has comprehensive content: ${pageAnalysis.hasComprehensiveContent}`);
    console.log(`   Page content length: ${pageAnalysis.pageLength} characters`);
    console.log(`   First line: "${pageAnalysis.firstLineOfContent}"`);

    // Final session storage detailed check
    const finalSessionCheck = await page.evaluate(() => {
      const analysis = {};

      // Check all storage methods
      try {
        // Method 1: UIDataSaver.getComprehensiveAnalysis()
        if (window.UIDataSaver && typeof window.UIDataSaver.getComprehensiveAnalysis === 'function') {
          analysis.uiDataSaverMethod = window.UIDataSaver.getComprehensiveAnalysis();
          analysis.uiDataSaverExists = true;
        } else {
          analysis.uiDataSaverExists = false;
        }

        // Method 2: Direct sessionStorage comprehensive keys
        analysis.comprehensiveKeys = [];
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key.includes('comprehensive') || key.includes('analysis')) {
            analysis.comprehensiveKeys.push({
              key: key,
              hasData: !!sessionStorage.getItem(key),
              dataLength: sessionStorage.getItem(key)?.length || 0
            });
          }
        }

        // Method 3: All storage keys for debugging
        analysis.allKeys = [];
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          analysis.allKeys.push({
            key: key,
            dataLength: sessionStorage.getItem(key)?.length || 0
          });
        }

      } catch (error) {
        analysis.error = error.message;
      }

      return analysis;
    });

    console.log('🔍 FINAL SESSION STORAGE ANALYSIS:');
    console.log(`   UIDataSaver exists: ${finalSessionCheck.uiDataSaverExists}`);
    console.log(`   UIDataSaver result: ${finalSessionCheck.uiDataSaverMethod ? 'HAS DATA' : 'NO DATA'}`);
    console.log(`   Comprehensive storage keys: ${finalSessionCheck.comprehensiveKeys.length}`);
    finalSessionCheck.comprehensiveKeys.forEach(key => {
      console.log(`     ${key.key}: ${key.dataLength} characters`);
    });
    console.log(`   All storage keys: ${finalSessionCheck.allKeys.length}`);
    finalSessionCheck.allKeys.forEach(key => {
      console.log(`     ${key.key}: ${key.dataLength} characters`);
    });

    console.log('');
    console.log('🎯 VALIDATION COMPLETE');
    console.log('======================');

    // Summary
    if (pageAnalysis.hasNoDataMessage) {
      console.log('❌ ISSUE FOUND: UI shows "NO REAL DATA" message');
      console.log('🔧 Root Cause: Session data retrieval failure');
    } else if (pageAnalysis.hasComprehensiveContent) {
      console.log('✅ SUCCESS: UI displays comprehensive analysis content');
    } else {
      console.log('⚠️  UNCLEAR: UI state needs manual review');
    }

    console.log('');
    console.log('Press Ctrl+C to close browser when ready...');

    // Keep browser open for manual review
    await new Promise(() => {}); // Wait indefinitely

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    // Browser will stay open for manual review
  }
}

manualFormAutomatedValidation().catch(console.error);
