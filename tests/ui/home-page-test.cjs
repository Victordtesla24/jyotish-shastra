#!/usr/bin/env node

/**
 * Home Page Production Test
 * Tests the real home page (/), navigation visibility, and content display
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Test configuration
const CONFIG = {
  frontendUrl: 'http://localhost:3002',
  page: '/',
  timeout: 30000,
  screenshotDir: path.join(__dirname, 'production-screenshots')
};

// Create screenshots directory
if (!fs.existsSync(CONFIG.screenshotDir)) {
  fs.mkdirSync(CONFIG.screenshotDir, { recursive: true });
}

// Expected navigation items (production pages)
const EXPECTED_NAVIGATION = [
  'Home',
  'Birth Chart',
  'Analysis',
  'Personality Profile',
  'Enhanced Analysis',
  'Reports'
];

// Expected home page content
const EXPECTED_HOME_CONTENT = [
  'Jyotish Shastra',
  'Vedic',
  'Astrology',
  'Birth Chart',
  'Analysis'
];

async function testHomePage() {
  let browser;
  let page;
  const testResults = {
    timestamp: new Date().toISOString(),
    page: 'Home Page (/)',
    navigation: { found: [], missing: [] },
    content: { found: [], missing: [] },
    screenshots: [],
    errors: []
  };

  try {
    console.log('🏠 Testing Home Page Production Functionality...\n');

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

    // Step 1: Navigate to home page
    console.log('📍 Step 1: Loading home page...');
    await page.goto(`${CONFIG.frontendUrl}${CONFIG.page}`, {
      waitUntil: 'networkidle2',
      timeout: CONFIG.timeout
    });

    // Take screenshot
    const homeScreenshot = 'home-page-loaded.png';
    await page.screenshot({
      path: path.join(CONFIG.screenshotDir, homeScreenshot),
      fullPage: true
    });
    testResults.screenshots.push(homeScreenshot);
    console.log('✅ Home page loaded');

    // Step 2: Test navigation visibility
    console.log('\n📍 Step 2: Testing navigation visibility...');

    const navigationElements = await page.evaluate(() => {
      const nav = document.querySelector('nav') || document.querySelector('header nav') || document.querySelector('.navigation');
      return nav ? nav.textContent : '';
    });

    console.log('🔍 Checking navigation items:');
    for (const navItem of EXPECTED_NAVIGATION) {
      if (navigationElements.includes(navItem)) {
        testResults.navigation.found.push(navItem);
        console.log(`  ✅ Found: ${navItem}`);
      } else {
        testResults.navigation.missing.push(navItem);
        console.log(`  ❌ Missing: ${navItem}`);
      }
    }

    // Step 3: Test page content
    console.log('\n📍 Step 3: Testing page content...');

    const pageContent = await page.evaluate(() => document.body.textContent);

    console.log('🔍 Checking home page content:');
    for (const contentItem of EXPECTED_HOME_CONTENT) {
      if (pageContent.includes(contentItem)) {
        testResults.content.found.push(contentItem);
        console.log(`  ✅ Found: ${contentItem}`);
      } else {
        testResults.content.missing.push(contentItem);
        console.log(`  ❌ Missing: ${contentItem}`);
      }
    }

    // Step 4: Test navigation links are clickable
    console.log('\n📍 Step 4: Testing navigation links...');

    const navigationLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('nav a, header a'));
      return links.map(link => ({
        text: link.textContent.trim(),
        href: link.getAttribute('href'),
        visible: link.offsetParent !== null
      }));
    });

    console.log('🔗 Navigation links found:');
    navigationLinks.forEach(link => {
      if (link.visible) {
        console.log(`  ✅ ${link.text} → ${link.href}`);
      } else {
        console.log(`  ⚠️ ${link.text} → ${link.href} (not visible)`);
      }
    });

    // Step 5: Test hero section and main content
    console.log('\n📍 Step 5: Testing hero section and main content...');

    const heroSection = await page.evaluate(() => {
      const hero = document.querySelector('.hero, .hero-section, .main-banner, h1');
      return hero ? hero.textContent : null;
    });

    if (heroSection) {
      console.log(`✅ Hero section found: "${heroSection.substring(0, 50)}..."`);
    } else {
      console.log('⚠️ Hero section not found');
    }

    // Step 6: Test footer
    console.log('\n📍 Step 6: Testing footer presence...');

    const footerExists = await page.evaluate(() => {
      return !!document.querySelector('footer');
    });

    console.log(`${footerExists ? '✅' : '❌'} Footer: ${footerExists ? 'Present' : 'Missing'}`);

    // Take final screenshot
    const finalScreenshot = 'home-page-complete.png';
    await page.screenshot({
      path: path.join(CONFIG.screenshotDir, finalScreenshot),
      fullPage: true
    });
    testResults.screenshots.push(finalScreenshot);

    // Generate results
    const navSuccess = testResults.navigation.missing.length === 0;
    const contentSuccess = testResults.content.missing.length === 0;
    const overallSuccess = navSuccess && contentSuccess && testResults.errors.length === 0;

    console.log('\n' + '='.repeat(60));
    console.log('🎯 HOME PAGE TEST RESULTS');
    console.log('='.repeat(60));

    console.log('\n📊 Navigation Test:');
    console.log(`  ✅ Found: ${testResults.navigation.found.length}/${EXPECTED_NAVIGATION.length}`);
    console.log(`  ❌ Missing: ${testResults.navigation.missing.length}`);
    if (testResults.navigation.missing.length > 0) {
      console.log(`     Missing items: ${testResults.navigation.missing.join(', ')}`);
    }

    console.log('\n📄 Content Test:');
    console.log(`  ✅ Found: ${testResults.content.found.length}/${EXPECTED_HOME_CONTENT.length}`);
    console.log(`  ❌ Missing: ${testResults.content.missing.length}`);
    if (testResults.content.missing.length > 0) {
      console.log(`     Missing items: ${testResults.content.missing.join(', ')}`);
    }

    if (testResults.errors.length > 0) {
      console.log('\n❌ Errors:');
      testResults.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }

    console.log(`\n📁 Screenshots: ${testResults.screenshots.length} captured`);
    console.log(`🎉 Test Result: ${overallSuccess ? 'PASSED' : 'FAILED'}`);

    return overallSuccess;

  } catch (error) {
    console.error('\n❌ Home page test failed:', error.message);
    testResults.errors.push(error.message);

    // Take error screenshot
    if (page) {
      try {
        const errorScreenshot = `home-page-error-${Date.now()}.png`;
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
  testHomePage()
    .then(success => {
      console.log('\n' + '='.repeat(60));
      if (success) {
        console.log('🎉 HOME PAGE PRODUCTION TEST PASSED');
        console.log('✅ Navigation visible, content displayed correctly');
      } else {
        console.log('❌ HOME PAGE PRODUCTION TEST FAILED');
        console.log('⚠️ Issues found with home page production implementation');
      }
      console.log('='.repeat(60));
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Home page test runner failed:', error);
      process.exit(1);
    });
}

module.exports = { testHomePage, CONFIG, EXPECTED_NAVIGATION };
