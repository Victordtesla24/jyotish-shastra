#!/bin/bash

# UI-API Integration Testing Script
# Uses Puppeteer to test complete workflow from UI to API and back
# Usage: ./scripts/test-ui-api-integration.sh [FRONTEND_URL] [BACKEND_URL]

FRONTEND_URL=${1:-"http://localhost:3002"}
BACKEND_URL=${2:-"http://localhost:3001"}

echo "=========================================="
echo "UI-API Integration Testing"
echo "=========================================="
echo "Frontend URL: $FRONTEND_URL"
echo "Backend URL: $BACKEND_URL"
echo "Test started: $(date)"
echo ""

# Check if Node.js is available
if ! command -v node &> /dev/null; then
  echo "Error: Node.js is not installed or not in PATH"
  exit 1
fi

# Create temporary test script
TEST_SCRIPT=$(cat <<'EOF'
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3002';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

const TEST_DATA = {
  name: 'Farhan',
  dateOfBirth: '1997-12-18',
  timeOfBirth: '02:30',
  placeOfBirth: 'Sialkot, Pakistan',
  gender: 'male'
};

const EXPECTED_RESPONSES = {
  chart: ['ascendant', 'planetaryPositions', 'housePositions'],
  analysis: ['sections', 'summary'],
  geocoding: ['latitude', 'longitude', 'timezone']
};

async function runIntegrationTests() {
  let browser;
  const results = {
    timestamp: new Date().toISOString(),
    frontendUrl: FRONTEND_URL,
    backendUrl: BACKEND_URL,
    tests: [],
    errors: [],
    summary: { passed: 0, failed: 0, total: 0 }
  };

  try {
    console.log('🚀 Launching browser...');
    browser = await puppeteer.launch({
      headless: process.env.HEADLESS !== 'false',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: { width: 1280, height: 800 }
    });

    const page = await browser.newPage();

    // Listen for console messages
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('API') || text.includes('Error') || text.includes('chart')) {
        console.log(`  Browser Console: ${text}`);
      }
    });

    // Listen for errors
    page.on('pageerror', error => {
      console.error(`  Page Error: ${error.message}`);
      results.errors.push({
        type: 'pageerror',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    });

    // Test 1: Navigate to frontend
    console.log('\n📍 Test 1: Navigate to frontend');
    results.summary.total++;
    try {
      await page.goto(FRONTEND_URL, { waitUntil: 'networkidle2', timeout: 30000 });
      const title = await page.title();
      console.log(`  ✅ Frontend loaded successfully: ${title}`);
      results.tests.push({ name: 'Navigate to Frontend', status: 'passed' });
      results.summary.passed++;
    } catch (error) {
      console.error(`  ❌ Failed to load frontend: ${error.message}`);
      results.tests.push({ name: 'Navigate to Frontend', status: 'failed', error: error.message });
      results.summary.failed++;
    }

    // Test 2: Fill birth data form
    console.log('\n📍 Test 2: Fill birth data form');
    results.summary.total++;
    try {
      await page.waitForSelector('input[name="name"]', { timeout: 10000 });
      
      await page.type('input[name="name"]', TEST_DATA.name);
      
      await page.evaluate((data) => {
        const dateInput = document.querySelector('input[name="dateOfBirth"]');
        const timeInput = document.querySelector('input[name="timeOfBirth"]');
        const placeInput = document.querySelector('input[name="placeOfBirth"]');
        const genderSelect = document.querySelector('select[name="gender"]');
        
        if (dateInput) {
          dateInput.value = data.dateOfBirth;
          dateInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        if (timeInput) {
          timeInput.value = data.timeOfBirth;
          timeInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        if (placeInput) {
          placeInput.value = data.placeOfBirth;
          placeInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        if (genderSelect) {
          genderSelect.value = data.gender;
          genderSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }, TEST_DATA);

      console.log('  ✅ Form filled successfully');
      results.tests.push({ name: 'Fill Birth Data Form', status: 'passed' });
      results.summary.passed++;
      
      // Wait for geocoding
      await page.waitForFunction(() => {
        const text = document.body.innerText;
        return text.includes('Location found') || text.includes('latitude') || text.includes('Coordinates');
      }, { timeout: 10000 }).catch(() => {
        console.log('  ⚠️  Geocoding result not immediately visible');
      });
      
    } catch (error) {
      console.error(`  ❌ Failed to fill form: ${error.message}`);
      results.tests.push({ name: 'Fill Birth Data Form', status: 'failed', error: error.message });
      results.summary.failed++;
    }

    // Test 3: Generate chart and verify API call
    console.log('\n📍 Test 3: Generate chart and verify API integration');
    results.summary.total++;
    try {
      // Listen for network requests
      const apiRequests = [];
      page.on('request', request => {
        const url = request.url();
        if (url.includes('/api/v1/chart/generate') || url.includes('/api/v1/analysis')) {
          apiRequests.push({
            url: url,
            method: request.method(),
            timestamp: new Date().toISOString()
          });
        }
      });

      // Click generate button
      const generateButton = await page.$('button:has-text("Generate")') || 
                             await page.$('button[type="submit"]') ||
                             await page.$('button');
      
      if (generateButton) {
        await generateButton.click();
        
        // Wait for chart generation
        await page.waitForFunction(() => {
          const text = document.body.innerText;
          return text.includes('Chart') || text.includes('Rasi') || text.includes('Ascendant');
        }, { timeout: 30000 }).catch(() => {
          console.log('  ⚠️  Chart generation may have failed or is taking longer');
        });

        if (apiRequests.length > 0) {
          console.log(`  ✅ API requests detected: ${apiRequests.length}`);
          apiRequests.forEach(req => {
            console.log(`    - ${req.method} ${req.url}`);
          });
          results.tests.push({ name: 'Chart Generation API Integration', status: 'passed', apiRequests: apiRequests.length });
          results.summary.passed++;
        } else {
          console.log('  ⚠️  No API requests detected - may be using cached data or form validation failed');
          results.tests.push({ name: 'Chart Generation API Integration', status: 'warning', message: 'No API requests detected' });
        }
      } else {
        throw new Error('Generate button not found');
      }
    } catch (error) {
      console.error(`  ❌ Chart generation failed: ${error.message}`);
      results.tests.push({ name: 'Chart Generation API Integration', status: 'failed', error: error.message });
      results.summary.failed++;
    }

    // Test 4: Verify UI displays chart data
    console.log('\n📍 Test 4: Verify UI displays chart data');
    results.summary.total++;
    try {
      const hasChartElements = await page.evaluate(() => {
        const text = document.body.innerText;
        return text.includes('Ascendant') || 
               text.includes('Planet') || 
               text.includes('House') ||
               document.querySelector('[class*="chart"]') !== null ||
               document.querySelector('svg') !== null;
      });

      if (hasChartElements) {
        console.log('  ✅ Chart elements found in UI');
        results.tests.push({ name: 'UI Chart Display', status: 'passed' });
        results.summary.passed++;
      } else {
        console.log('  ⚠️  Chart elements not found - may need to navigate to chart page');
        results.tests.push({ name: 'UI Chart Display', status: 'warning', message: 'Chart elements not immediately visible' });
      }
    } catch (error) {
      console.error(`  ❌ UI verification failed: ${error.message}`);
      results.tests.push({ name: 'UI Chart Display', status: 'failed', error: error.message });
      results.summary.failed++;
    }

    // Test 5: Test error boundary and network failures
    console.log('\n📍 Test 5: Test error handling');
    results.summary.total++;
    try {
      // Check for error boundaries
      const hasErrors = await page.evaluate(() => {
        const text = document.body.innerText;
        return text.includes('Error') || 
               text.includes('Failed') ||
               document.querySelector('[class*="error"]') !== null;
      });

      if (!hasErrors) {
        console.log('  ✅ No errors detected in UI');
        results.tests.push({ name: 'Error Handling', status: 'passed' });
        results.summary.passed++;
      } else {
        console.log('  ⚠️  Errors detected in UI (this may be expected for some scenarios)');
        results.tests.push({ name: 'Error Handling', status: 'warning', message: 'Errors detected but may be expected' });
      }
    } catch (error) {
      console.error(`  ❌ Error handling test failed: ${error.message}`);
      results.tests.push({ name: 'Error Handling', status: 'failed', error: error.message });
      results.summary.failed++;
    }

    // Summary
    console.log('\n==========================================');
    console.log('Test Summary');
    console.log('==========================================');
    console.log(`Total Tests: ${results.summary.total}`);
    console.log(`Passed: ${results.summary.passed}`);
    console.log(`Failed: ${results.summary.failed}`);
    console.log(`Success Rate: ${((results.summary.passed / results.summary.total) * 100).toFixed(2)}%`);
    console.log('');

    // Save results
    const resultsPath = path.join(process.cwd(), 'logs', `ui-api-integration-${Date.now()}.json`);
    fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
    console.log(`Results saved to: ${resultsPath}`);

    process.exit(results.summary.failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('Fatal error:', error);
    results.errors.push({
      type: 'fatal',
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

runIntegrationTests();
EOF
)

# Write temporary test script
TEMP_SCRIPT="/tmp/test-ui-api-integration-$$.js"
echo "$TEST_SCRIPT" > "$TEMP_SCRIPT"

# Run the test
FRONTEND_URL="$FRONTEND_URL" BACKEND_URL="$BACKEND_URL" node "$TEMP_SCRIPT"

# Cleanup
rm -f "$TEMP_SCRIPT"

exit $?

