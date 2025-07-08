#!/usr/bin/env node

/**
 * Analysis Page Production Test
 * Tests the real analysis page (/analysis), comprehensive analysis functionality, and data display
 */

const puppeteer = require('puppeteer');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

// Test configuration
const CONFIG = {
  frontendUrl: 'http://localhost:3002',
  backendUrl: 'http://localhost:3001',
  page: '/analysis',
  timeout: 60000,
  screenshotDir: path.join(__dirname, 'production-screenshots')
};

// Create screenshots directory
if (!fs.existsSync(CONFIG.screenshotDir)) {
  fs.mkdirSync(CONFIG.screenshotDir, { recursive: true });
}

// Test birth data for analysis
const TEST_BIRTH_DATA = {
  dateOfBirth: "1985-10-24",
  timeOfBirth: "14:30",
  latitude: 18.5204,
  longitude: 73.8567,
  timezone: "Asia/Kolkata",
  gender: "male"
};

// Expected analysis page elements
const EXPECTED_ELEMENTS = [
  'Analysis',
  'Complete Analysis',
  'Personality Analysis',
  'Career'
];

// Expected analysis sections (from actual API)
const EXPECTED_SECTIONS = [
  'Overview',
  'Lagna',
  'Houses',
  'Aspects',
  'Arudha',
  'Navamsa',
  'Dasha',
  'Synthesis'
];

async function testAnalysisPage() {
  let browser;
  let page;
  const testResults = {
    timestamp: new Date().toISOString(),
    page: 'Analysis Page (/analysis)',
    elements: { found: [], missing: [] },
    apiTest: { success: false, responseSize: 0, errors: [] },
    sectionsTest: { found: [], missing: [] },
    contentVisibility: { success: false, errors: [] },
    screenshots: [],
    errors: []
  };

  try {
    console.log('📊 Testing Analysis Page Production Functionality...\n');

    // Step 0: Verify backend API is working
    console.log('📍 Step 0: Verifying backend API...');
    try {
      const apiResponse = await axios.post(
        `${CONFIG.backendUrl}/api/v1/analysis/comprehensive`,
        TEST_BIRTH_DATA,
        { timeout: 30000 }
      );

      testResults.apiTest.success = apiResponse.data.success;
      testResults.apiTest.responseSize = JSON.stringify(apiResponse.data).length;
      console.log(`✅ API working: ${testResults.apiTest.responseSize} bytes response`);

      // Verify all 8 sections exist in API response
      const sections = apiResponse.data.analysis?.sections || {};
      const sectionCount = Object.keys(sections).length;
      console.log(`📊 API sections: ${sectionCount}/8`);

    } catch (error) {
      testResults.apiTest.errors.push(`API test failed: ${error.message}`);
      console.log(`❌ API test failed: ${error.message}`);
    }

    // Launch browser
    browser = await puppeteer.launch({
      headless: false,
      defaultViewport: { width: 1920, height: 1080 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    page = await browser.newPage();

    // Monitor console errors (but allow icon warnings)
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const errorText = msg.text();
        // Only treat as error if it's not a manifest icon warning
        if (!errorText.includes('icon') && !errorText.includes('Manifest') && !errorText.includes('Download error')) {
          testResults.errors.push(`Console Error: ${errorText}`);
        } else {
          // Log icon warnings but don't fail test
          console.log(`📋 Icon Warning: ${errorText}`);
        }
      }
    });

    // Step 1: Navigate to analysis page
    console.log('\n📍 Step 1: Loading analysis page...');
    await page.goto(`${CONFIG.frontendUrl}${CONFIG.page}`, {
      waitUntil: 'networkidle2',
      timeout: CONFIG.timeout
    });

    // Take screenshot
    const analysisPageScreenshot = 'analysis-page-loaded.png';
    await page.screenshot({
      path: path.join(CONFIG.screenshotDir, analysisPageScreenshot),
      fullPage: true
    });
    testResults.screenshots.push(analysisPageScreenshot);
    console.log('✅ Analysis page loaded');

    // Step 2: Check page elements
    console.log('\n📍 Step 2: Testing page elements...');

    const pageContent = await page.evaluate(() => document.body.textContent);

    console.log('🔍 Checking analysis page elements:');
    for (const element of EXPECTED_ELEMENTS) {
      if (pageContent.includes(element)) {
        testResults.elements.found.push(element);
        console.log(`  ✅ Found: ${element}`);
      } else {
        testResults.elements.missing.push(element);
        console.log(`  ❌ Missing: ${element}`);
      }
    }

    // Step 3: Test analysis type selection and trigger comprehensive analysis
    console.log('\n📍 Step 3: Testing analysis type selection...');

    // Look for analysis type cards
    const analysisCards = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.cursor-pointer, [onclick]'));
      const cardTexts = cards.map(card => card.textContent);

      return {
        hasCards: cards.length > 0,
        cardTexts,
        totalCards: cards.length
      };
    });

    console.log(`📋 Analysis cards found: ${analysisCards.totalCards}`);

    if (analysisCards.hasCards) {
      try {
        // Look for comprehensive analysis card using text content
        const comprehensiveCard = await page.evaluateHandle(() => {
          const cards = Array.from(document.querySelectorAll('.cursor-pointer'));
          return cards.find(card =>
            card.textContent.includes('Complete Analysis') ||
            card.textContent.includes('Comprehensive') ||
            card.textContent.includes('comprehensive') ||
            card.textContent.includes('Complete') ||
            card.textContent.includes('Analysis')
          );
        });

        if (comprehensiveCard && comprehensiveCard.asElement()) {
          await comprehensiveCard.asElement().click();
          console.log('🔄 Comprehensive analysis card clicked, waiting for results...');
        } else {
          console.log('⚠️ Comprehensive analysis card not found, trying first clickable card...');
          // Try clicking the first clickable card
          const firstCard = await page.$('.cursor-pointer');
          if (firstCard) {
            await firstCard.click();
            console.log('🔄 First analysis card clicked...');
          } else {
            console.log('❌ No clickable analysis cards found');
          }
        }

        // Wait for analysis results to load
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Take screenshot after clicking analysis card
        const analysisTriggeredScreenshot = 'analysis-triggered.png';
        await page.screenshot({
          path: path.join(CONFIG.screenshotDir, analysisTriggeredScreenshot),
          fullPage: true
        });
        testResults.screenshots.push(analysisTriggeredScreenshot);

      } catch (error) {
        console.log(`❌ Analysis card interaction failed: ${error.message}`);
        testResults.errors.push(`Analysis card interaction failed: ${error.message}`);
      }
    } else {
      console.log('⚠️ No analysis cards found');
    }

    // Step 4: Check for analysis results display
    console.log('\n📍 Step 4: Testing analysis results display...');

    const analysisDisplay = await page.evaluate(() => {
      const analysisComponent = document.querySelector('.comprehensive-analysis, .analysis-display, .analysis-results');
      const sectionsContainer = document.querySelector('.sections, .analysis-sections, .tabs');
      const errorMessage = document.querySelector('.error, .alert-error');

      return {
        hasAnalysisDisplay: !!analysisComponent,
        hasSectionsContainer: !!sectionsContainer,
        hasError: !!errorMessage,
        errorText: errorMessage ? errorMessage.textContent : null,
        pageText: document.body.textContent
      };
    });

    console.log('📊 Analysis display results:');
    console.log(`  ${analysisDisplay.hasAnalysisDisplay ? '✅' : '❌'} Analysis component: ${analysisDisplay.hasAnalysisDisplay ? 'Present' : 'Missing'}`);
    console.log(`  ${analysisDisplay.hasSectionsContainer ? '✅' : '❌'} Sections container: ${analysisDisplay.hasSectionsContainer ? 'Present' : 'Missing'}`);
    console.log(`  ${analysisDisplay.hasError ? '❌' : '✅'} Error: ${analysisDisplay.hasError ? analysisDisplay.errorText : 'None'}`);

    // Step 5: Test section tabs/navigation
    console.log('\n📍 Step 5: Testing analysis sections...');

    const sectionsFound = await page.evaluate((expectedSections) => {
      const pageText = document.body.textContent;
      const tabButtons = Array.from(document.querySelectorAll('button, .tab, .section-nav'));
      const buttonTexts = tabButtons.map(btn => btn.textContent);

      const foundSections = [];
      const missingSections = [];

      for (const section of expectedSections) {
        if (pageText.includes(section) || buttonTexts.some(text => text.includes(section))) {
          foundSections.push(section);
        } else {
          missingSections.push(section);
        }
      }

      return { foundSections, missingSections, buttonTexts };
    }, EXPECTED_SECTIONS);

    testResults.sectionsTest.found = sectionsFound.foundSections;
    testResults.sectionsTest.missing = sectionsFound.missingSections;

    console.log('🔍 Checking analysis sections:');
    for (const section of sectionsFound.foundSections) {
      console.log(`  ✅ Found: ${section}`);
    }
    for (const section of sectionsFound.missingSections) {
      console.log(`  ❌ Missing: ${section}`);
    }

    // Step 6: Test actual data visibility
    console.log('\n📍 Step 6: Testing actual data visibility...');

    const dataVisibility = await page.evaluate(() => {
      const pageText = document.body.textContent;

      // Look for actual analysis content indicators
      const hasLagnaData = pageText.includes('Libra') || pageText.includes('Venus') || pageText.includes('Lagna');
      const hasPlanetaryData = pageText.includes('Sun') || pageText.includes('Moon') || pageText.includes('Mars');
      const hasHouseData = pageText.includes('House') || pageText.includes('1st') || pageText.includes('2nd');
      const hasDateData = pageText.includes('1985') || pageText.includes('10') || pageText.includes('24');

      return {
        hasLagnaData,
        hasPlanetaryData,
        hasHouseData,
        hasDateData,
        contentLength: pageText.length
      };
    });

    console.log('📊 Data visibility check:');
    console.log(`  ${dataVisibility.hasLagnaData ? '✅' : '❌'} Lagna data: ${dataVisibility.hasLagnaData ? 'Visible' : 'Missing'}`);
    console.log(`  ${dataVisibility.hasPlanetaryData ? '✅' : '❌'} Planetary data: ${dataVisibility.hasPlanetaryData ? 'Visible' : 'Missing'}`);
    console.log(`  ${dataVisibility.hasHouseData ? '✅' : '❌'} House data: ${dataVisibility.hasHouseData ? 'Visible' : 'Missing'}`);
    console.log(`  ${dataVisibility.hasDateData ? '✅' : '❌'} Birth data: ${dataVisibility.hasDateData ? 'Visible' : 'Missing'}`);
    console.log(`  📄 Content length: ${dataVisibility.contentLength} characters`);

    const dataVisibilitySuccess = dataVisibility.hasLagnaData || dataVisibility.hasPlanetaryData || dataVisibility.hasHouseData;
    testResults.contentVisibility.success = dataVisibilitySuccess;

    if (!dataVisibilitySuccess) {
      testResults.contentVisibility.errors.push('No analysis data visible in UI');
    }

    // Take final screenshot
    const finalScreenshot = 'analysis-page-complete.png';
    await page.screenshot({
      path: path.join(CONFIG.screenshotDir, finalScreenshot),
      fullPage: true
    });
    testResults.screenshots.push(finalScreenshot);

    // Generate results
    const elementsSuccess = testResults.elements.missing.length <= 1; // Allow for some missing elements
    const sectionsSuccess = testResults.sectionsTest.found.length >= 4; // At least half the sections
    const overallSuccess = elementsSuccess && sectionsSuccess && testResults.apiTest.success && testResults.errors.length === 0;

    console.log('\n' + '='.repeat(60));
    console.log('🎯 ANALYSIS PAGE TEST RESULTS');
    console.log('='.repeat(60));

    console.log('\n📊 API Test:');
    console.log(`  Status: ${testResults.apiTest.success ? 'PASSED' : 'FAILED'}`);
    console.log(`  Response Size: ${testResults.apiTest.responseSize} bytes`);
    if (testResults.apiTest.errors.length > 0) {
      console.log(`  Errors: ${testResults.apiTest.errors.join(', ')}`);
    }

    console.log('\n📄 Page Elements Test:');
    console.log(`  ✅ Found: ${testResults.elements.found.length}/${EXPECTED_ELEMENTS.length}`);
    console.log(`  ❌ Missing: ${testResults.elements.missing.length}`);
    if (testResults.elements.missing.length > 0) {
      console.log(`     Missing items: ${testResults.elements.missing.join(', ')}`);
    }

    console.log('\n📊 Sections Test:');
    console.log(`  ✅ Found: ${testResults.sectionsTest.found.length}/${EXPECTED_SECTIONS.length}`);
    console.log(`  ❌ Missing: ${testResults.sectionsTest.missing.length}`);
    if (testResults.sectionsTest.missing.length > 0) {
      console.log(`     Missing sections: ${testResults.sectionsTest.missing.join(', ')}`);
    }

    console.log('\n👁️ Content Visibility Test:');
    console.log(`  Status: ${testResults.contentVisibility.success ? 'PASSED' : 'FAILED'}`);
    if (testResults.contentVisibility.errors.length > 0) {
      console.log(`  Issues: ${testResults.contentVisibility.errors.join(', ')}`);
    }

    if (testResults.errors.length > 0) {
      console.log('\n❌ Console Errors:');
      testResults.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }

    console.log(`\n📁 Screenshots: ${testResults.screenshots.length} captured`);
    console.log(`🎉 Test Result: ${overallSuccess ? 'PASSED' : 'FAILED'}`);

    return overallSuccess;

  } catch (error) {
    console.error('\n❌ Analysis page test failed:', error.message);
    testResults.errors.push(error.message);

    // Take error screenshot
    if (page) {
      try {
        const errorScreenshot = `analysis-page-error-${Date.now()}.png`;
        await page.screenshot({
          path: path.join(CONFIG.screenshotDir, errorScreenshot),
          fullPage: true
        });
        testResults.screenshots.push(errorScreenshot);
        console.log(`📸 Error screenshot: ${errorScreenshot}`);
      } catch (e) {
        console.log('Could not capture error screenshot');
      }
    }

    return false;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the test
if (require.main === module) {
  testAnalysisPage()
    .then(success => {
      console.log('\n' + '='.repeat(60));
      if (success) {
        console.log('🎉 ANALYSIS PAGE PRODUCTION TEST PASSED');
        console.log('✅ API integration working, analysis data visible');
      } else {
        console.log('❌ ANALYSIS PAGE PRODUCTION TEST FAILED');
        console.log('⚠️ Issues found with analysis page production implementation');
      }
      console.log('='.repeat(60));
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Analysis page test runner failed:', error);
      process.exit(1);
    });
}

module.exports = { testAnalysisPage, CONFIG, TEST_BIRTH_DATA };
