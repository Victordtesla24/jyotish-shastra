#!/usr/bin/env node

/**
 * Deployment Readiness Test Script
 * Tests all critical API endpoints and checks for deployment readiness
 */

import http from 'http';
import fs from 'fs';
import path from 'path';

const BACKEND_URL = 'http://localhost:3001';
const FRONTEND_URL = 'http://localhost:3002';

// Test helper function
async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: 10000
    };

    const req = http.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

// Test results tracker
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

function runTest(testName, testFunction) {
  testResults.total++;
  console.log(`\n🧪 Running test: ${testName}`);
  
  return testFunction()
    .then(result => {
      testResults.passed++;
      testResults.details.push({ name: testName, status: 'PASSED', result });
      console.log(`✅ ${testName} - PASSED`);
      return result;
    })
    .catch(error => {
      testResults.failed++;
      testResults.details.push({ name: testName, status: 'FAILED', error: error.message });
      console.log(`❌ ${testName} - FAILED: ${error.message}`);
      throw error;
    });
}

// Test cases
async function testBackendHealth() {
  const response = await makeRequest(`${BACKEND_URL}/health`);
  if (response.status !== 200) {
    throw new Error(`Expected status 200, got ${response.status}`);
  }
  const data = JSON.parse(response.data);
  if (data.status !== 'healthy') {
    throw new Error(`Backend health status is ${data.status}`);
  }
  return data;
}

async function testAPIHealth() {
  const response = await makeRequest(`${BACKEND_URL}/api/v1/health`);
  if (response.status !== 200) {
    throw new Error(`Expected status 200, got ${response.status}`);
  }
  return JSON.parse(response.data);
}

async function testChartGeneration() {
  const chartData = {
    name: "Test User",
    dateOfBirth: "1990-01-01",
    timeOfBirth: "12:00",
    placeOfBirth: "Mumbai, Maharashtra, India",
    latitude: 19.076,
    longitude: 72.8777,
    timezone: "Asia/Kolkata"
  };

  const response = await makeRequest(`${BACKEND_URL}/api/v1/chart/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(chartData)
  });

  if (response.status !== 200) {
    throw new Error(`Expected status 200, got ${response.status}`);
  }

  const data = JSON.parse(response.data);
  if (!data.success || !data.data.chartId) {
    throw new Error('Chart generation failed - missing chartId or success flag');
  }

  return data;
}

async function testGeocoding() {
  const response = await makeRequest(`${BACKEND_URL}/api/v1/geocoding/location`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ placeOfBirth: "New York, NY, USA" })
  });

  if (response.status !== 200) {
    throw new Error(`Expected status 200, got ${response.status}`);
  }

  const data = JSON.parse(response.data);
  if (!data.success || !data.data.latitude || !data.data.longitude) {
    throw new Error('Geocoding failed - missing coordinates');
  }

  return data;
}

async function testComprehensiveAnalysis() {
  const analysisData = {
    name: "Test User",
    dateOfBirth: "1990-01-01",
    timeOfBirth: "12:00",
    placeOfBirth: "Mumbai, Maharashtra, India",
    latitude: 19.076,
    longitude: 72.8777,
    timezone: "Asia/Kolkata"
  };

  const response = await makeRequest(`${BACKEND_URL}/api/v1/analysis/comprehensive`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(analysisData)
  });

  if (response.status !== 200) {
    throw new Error(`Expected status 200, got ${response.status}`);
  }

  const data = JSON.parse(response.data);
  if (!data.success) {
    throw new Error('Comprehensive analysis failed');
  }

  return data;
}

async function testFrontendServer() {
  const response = await makeRequest(FRONTEND_URL);
  if (response.status !== 200) {
    throw new Error(`Expected status 200, got ${response.status}`);
  }
  if (!response.data.includes('Jyotish Shastra')) {
    throw new Error('Frontend does not contain expected content');
  }
  return { status: 'frontend running' };
}

async function testEnvironmentVariables() {
  const requiredEnvVars = ['NODE_ENV'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing environment variables: ${missingVars.join(', ')}`);
  }
  
  return { env: process.env.NODE_ENV || 'development' };
}

async function testFilePermissions() {
  const criticalFiles = [
    'src/index.js',
    'client/package.json',
    'package.json'
  ];

  for (const file of criticalFiles) {
    try {
      fs.accessSync(file, fs.constants.R_OK);
    } catch (error) {
      throw new Error(`Cannot read critical file: ${file}`);
    }
  }

  return { readable: criticalFiles };
}

async function testPortAvailability() {
  return new Promise((resolve, reject) => {
    // Test port 3001
    const backendCheck = http.request({
      hostname: 'localhost',
      port: 3001,
      path: '/health',
      method: 'GET',
      timeout: 5000
    }, (res) => {
      if (res.statusCode === 200) {
        resolve({ port3001: 'available', port3002: 'assumed_available' });
      } else {
        reject(new Error(`Backend returned status ${res.statusCode}`));
      }
    });

    backendCheck.on('error', reject);
    backendCheck.on('timeout', () => {
      backendCheck.destroy();
      reject(new Error('Backend health check timeout'));
    });
    backendCheck.end();
  });
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Deployment Readiness Tests\n');
  console.log(`Backend URL: ${BACKEND_URL}`);
  console.log(`Frontend URL: ${FRONTEND_URL}\n`);

  const startTime = Date.now();

  try {
    // Core functionality tests
    await runTest('Backend Health Check', testBackendHealth);
    await runTest('API Health Check', testAPIHealth);
    await runTest('Chart Generation', testChartGeneration);
    await runTest('Geocoding Service', testGeocoding);
    await runTest('Comprehensive Analysis', testComprehensiveAnalysis);
    
    // Infrastructure tests
    await runTest('Frontend Server', testFrontendServer);
    await runTest('Environment Variables', testEnvironmentVariables);
    await runTest('File Permissions', testFilePermissions);
    await runTest('Port Availability', testPortAvailability);

  } catch (error) {
    // Individual test failures are recorded above
  }

  const endTime = Date.now();
  const duration = endTime - startTime;

  // Final report
  console.log('\n' + '='.repeat(60));
  console.log('📊 DEPLOYMENT READINESS TEST REPORT');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${testResults.total}`);
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  console.log(`⏱️  Duration: ${duration}ms`);

  if (testResults.failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    testResults.details
      .filter(test => test.status === 'FAILED')
      .forEach(test => {
        console.log(`  • ${test.name}: ${test.error}`);
      });
  }

  // Overall assessment
  const isReadyForDeployment = testResults.failed === 0;
  console.log('\n' + '='.repeat(60));
  if (isReadyForDeployment) {
    console.log('🎉 APPLICATION IS READY FOR DEPLOYMENT! 🎉');
    console.log('All critical tests passed. The application is production-ready.');
  } else {
    console.log('⚠️  APPLICATION NOT READY FOR DEPLOYMENT');
    console.log('Some tests failed. Please address the issues above before deploying.');
  }
  console.log('='.repeat(60));

  return isReadyForDeployment;
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests()
    .then(isReady => {
      process.exit(isReady ? 0 : 1);
    })
    .catch(error => {
      console.error('Test runner failed:', error);
      process.exit(1);
    });
}

export default runAllTests;
