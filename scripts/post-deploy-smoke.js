#!/usr/bin/env node

/**
 * Post-Deployment Smoke Tests for BTR System
 * 
 * Validates critical BTR functionality after deployment to Render.com
 * 
 * Usage:
 *   node scripts/post-deploy-smoke.js
 *   node scripts/post-deploy-smoke.js --url=https://your-app.onrender.com
 *   node scripts/post-deploy-smoke.js --golden-case
 * 
 * Environment:
 *   API_URL: Base URL for API (default: http://localhost:3001)
 */

import axios from 'axios';

// Configuration
const API_BASE_URL = process.env.API_URL || 
  process.argv.find(arg => arg.startsWith('--url='))?.split('=')[1] ||
  'http://localhost:3001';

const TIMEOUT = 30000; // 30 seconds

// Test colors
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

// Test results
const results = {
  passed: 0,
  failed: 0,
  skipped: 0,
  tests: []
};

/**
 * Run smoke test suite
 */
async function runSmokeTests() {
  console.log(`${BLUE}🔬 BTR Post-Deployment Smoke Tests${RESET}`);
  console.log(`${BLUE}📡 Testing: ${API_BASE_URL}${RESET}`);
  console.log('━'.repeat(60));
  
  try {
    // Test 1: Health check
    await testHealthCheck();
    
    // Test 2: API availability
    await testAPIAvailability();
    
    // Test 3: Metrics endpoint
    await testMetricsEndpoint();
    
    // Test 4: Chart generation (basic)
    await testChartGeneration();
    
    // Test 5: Golden case (optional)
    if (process.argv.includes('--golden-case')) {
      await testGoldenCase();
    } else {
      skip('Golden Case Validation', 'Use --golden-case flag to run');
    }
    
    // Summary
    printSummary();
    
    // Exit with appropriate code
    if (results.failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
    
  } catch (error) {
    console.error(`\n${RED}❌ Fatal error:${RESET}`, error.message);
    if (process.argv.includes('--verbose')) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

/**
 * Test 1: Health Check
 */
async function testHealthCheck() {
  const testName = 'Health Check';
  try {
    const response = await axios.get(`${API_BASE_URL}/api/health`, { 
      timeout: TIMEOUT,
      validateStatus: () => true 
    });
    
    if (response.status === 200 && response.data.status === 'ok') {
      pass(testName, 'Server is healthy');
    } else if (response.status === 200) {
      fail(testName, `Unexpected response format: ${JSON.stringify(response.data)}`);
    } else {
      fail(testName, `HTTP ${response.status}`);
    }
  } catch (error) {
    fail(testName, `Connection failed: ${error.message}`);
  }
}

/**
 * Test 2: API Availability
 */
async function testAPIAvailability() {
  const testName = 'API Availability';
  try {
    // Try accessing any API endpoint
    const response = await axios.get(
      `${API_BASE_URL}/api/v1`,
      { timeout: TIMEOUT, validateStatus: () => true }
    );
    
    // Accept any response that's not a connection error
    if (response.status) {
      pass(testName, `API responding (HTTP ${response.status})`);
    } else {
      fail(testName, 'No response from API');
    }
  } catch (error) {
    fail(testName, `API unreachable: ${error.message}`);
  }
}

/**
 * Test 3: Metrics Endpoint
 */
async function testMetricsEndpoint() {
  const testName = 'Metrics Endpoint';
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/v1/rectification/metrics/latest`,
      { timeout: TIMEOUT, validateStatus: () => true }
    );
    
    // Accept 200 (data exists) or 404 (no metrics yet) - both are valid
    if (response.status === 200) {
      pass(testName, 'Metrics data available');
    } else if (response.status === 404) {
      pass(testName, 'Endpoint available (no metrics yet)');
    } else {
      fail(testName, `Unexpected status: HTTP ${response.status}`);
    }
  } catch (error) {
    fail(testName, `Endpoint error: ${error.message}`);
  }
}

/**
 * Test 4: Chart Generation (Basic)
 */
async function testChartGeneration() {
  const testName = 'Chart Generation';
  try {
    const birthData = {
      name: 'Smoke Test',
      dateOfBirth: '1990-01-01',
      timeOfBirth: '12:00',
      placeOfBirth: 'Mumbai, India',
      latitude: 19.076,
      longitude: 72.8777,
      timezone: 'Asia/Kolkata'
    };
    
    const response = await axios.post(
      `${API_BASE_URL}/api/v1/chart/generate`,
      birthData,
      { timeout: TIMEOUT, validateStatus: () => true }
    );
    
    if (response.status === 200 && response.data.rasiChart) {
      pass(testName, 'Chart generated successfully');
    } else if (response.status === 200) {
      fail(testName, 'Response missing chart data');
    } else {
      fail(testName, `HTTP ${response.status}: ${response.data?.message || 'Unknown error'}`);
    }
  } catch (error) {
    fail(testName, `Chart generation failed: ${error.message}`);
  }
}

/**
 * Test 5: Golden Case Validation
 */
async function testGoldenCase() {
  const testName = 'Golden Case (Pune 1985)';
  try {
    const birthData = {
      name: 'Golden Case Test',
      dateOfBirth: '1985-10-24',
      timeOfBirth: '02:30',
      placeOfBirth: 'Pune, Maharashtra, India',
      latitude: 18.5204,
      longitude: 73.8567,
      timezone: 'Asia/Kolkata'
    };
    
    const response = await axios.post(
      `${API_BASE_URL}/api/v1/chart/generate`,
      birthData,
      { timeout: TIMEOUT, validateStatus: () => true }
    );
    
    if (response.status === 200 && response.data.rasiChart) {
      // Validate chart has required data
      const chart = response.data.rasiChart;
      if (chart.ascendant && chart.planets && chart.houses) {
        pass(testName, 'Golden case validated successfully');
      } else {
        fail(testName, 'Chart missing required data');
      }
    } else {
      fail(testName, `HTTP ${response.status}`);
    }
  } catch (error) {
    fail(testName, `Golden case failed: ${error.message}`);
  }
}

/**
 * Helper: Record test pass
 */
function pass(testName, details = '') {
  console.log(`${GREEN}✓${RESET} ${testName}${details ? `: ${details}` : ''}`);
  results.passed++;
  results.tests.push({ name: testName, status: 'passed', details });
}

/**
 * Helper: Record test failure
 */
function fail(testName, reason) {
  console.log(`${RED}✗${RESET} ${testName}: ${reason}`);
  results.failed++;
  results.tests.push({ name: testName, status: 'failed', reason });
}

/**
 * Helper: Record test skip
 */
function skip(testName, reason) {
  console.log(`${YELLOW}⊘${RESET} ${testName}: ${reason}`);
  results.skipped++;
  results.tests.push({ name: testName, status: 'skipped', reason });
}

/**
 * Print test summary
 */
function printSummary() {
  console.log('\n' + '━'.repeat(60));
  console.log(`${BLUE}📊 Test Summary:${RESET}`);
  console.log(`  ${GREEN}✓ Passed:  ${results.passed}${RESET}`);
  console.log(`  ${RED}✗ Failed:  ${results.failed}${RESET}`);
  console.log(`  ${YELLOW}⊘ Skipped: ${results.skipped}${RESET}`);
  console.log(`  Total:   ${results.tests.length}`);
  
  if (results.failed > 0) {
    console.log(`\n${RED}❌ Smoke tests FAILED${RESET}`);
    console.log('\nFailed tests:');
    results.tests
      .filter(t => t.status === 'failed')
      .forEach(t => console.log(`  - ${t.name}: ${t.reason}`));
  } else {
    console.log(`\n${GREEN}✅ All smoke tests PASSED${RESET}`);
  }
  
  console.log('\n' + '━'.repeat(60));
}

// Run tests if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runSmokeTests();
}

export { runSmokeTests };