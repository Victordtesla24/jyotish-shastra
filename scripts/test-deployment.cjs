#!/usr/bin/env node
/**
 * Post-Deployment Test Script
 * Tests deployed application endpoints on Render.com
 */

const https = require('https');
const http = require('http');

const BACKEND_URL = 'https://jjyotish-shastra-backend.onrender.com';
const FRONTEND_URL = 'https://jjyotish-shastra-frontend.onrender.com';

const testResults = {
  passed: [],
  failed: [],
  warnings: []
};

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Jyotish-Shastra-Test-Script/1.0',
        ...options.headers
      },
      timeout: 60000 // Increased timeout for cold starts
    };

    let timeoutId;
    const req = client.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        clearTimeout(timeoutId);
        try {
          const jsonData = data ? JSON.parse(data) : null;
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData || data
          });
        } catch (e) {
          // If JSON parsing fails, return raw data
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      clearTimeout(timeoutId);
      reject(error);
    });

    // Handle timeout more gracefully
    timeoutId = setTimeout(() => {
      req.destroy();
      reject(new Error(`Request timeout after ${reqOptions.timeout}ms`));
    }, reqOptions.timeout);

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

async function testBackendHealth() {
  console.log('\n🔍 Testing Backend Health Endpoints...');
  
  try {
    const response = await makeRequest(`${BACKEND_URL}/health`);
    if (response.status === 200 && response.data && response.data.status === 'healthy') {
      testResults.passed.push('Backend /health endpoint');
      console.log('✅ Backend /health: PASSED');
      console.log(`   Status: ${response.data.status}, Uptime: ${response.data.uptime?.toFixed(2)}s`);
    } else {
      testResults.failed.push('Backend /health endpoint');
      console.log('❌ Backend /health: FAILED');
      console.log(`   Status Code: ${response.status}`);
      console.log(`   Response: ${JSON.stringify(response.data).substring(0, 200)}`);
    }
  } catch (error) {
    testResults.failed.push('Backend /health endpoint');
    console.log(`❌ Backend /health: ERROR - ${error.message}`);
    // Check if it's a cold start issue
    if (error.message.includes('timeout') || error.message.includes('ECONNRESET')) {
      console.log('   ⚠️  This might be a cold start delay. Try again in a few seconds.');
    }
  }

  try {
    const response = await makeRequest(`${BACKEND_URL}/api/v1/health`);
    if (response.status === 200 && response.data && (response.data.status === 'OK' || response.data.status === 'healthy')) {
      testResults.passed.push('Backend /api/v1/health endpoint');
      console.log('✅ Backend /api/v1/health: PASSED');
      console.log(`   Status: ${response.data.status}`);
    } else {
      testResults.failed.push('Backend /api/v1/health endpoint');
      console.log('❌ Backend /api/v1/health: FAILED');
      console.log(`   Status Code: ${response.status}`);
      console.log(`   Response: ${JSON.stringify(response.data).substring(0, 200)}`);
    }
  } catch (error) {
    testResults.failed.push('Backend /api/v1/health endpoint');
    console.log(`❌ Backend /api/v1/health: ERROR - ${error.message}`);
    // Check if it's a cold start issue
    if (error.message.includes('timeout') || error.message.includes('ECONNRESET')) {
      console.log('   ⚠️  This might be a cold start delay. Try again in a few seconds.');
    }
  }
}

async function testGeocoding() {
  console.log('\n🔍 Testing Geocoding Endpoint...');
  
  try {
    const response = await makeRequest(`${BACKEND_URL}/api/v1/geocoding/location`, {
      method: 'POST',
      body: {
        placeOfBirth: 'Mumbai, Maharashtra, India'
      }
    });

    if (response.status === 200 && response.data.success && response.data.data.latitude) {
      testResults.passed.push('Geocoding endpoint');
      console.log('✅ Geocoding: PASSED');
      console.log(`   Location: ${response.data.data.formatted_address}`);
    } else {
      testResults.failed.push('Geocoding endpoint');
      console.log('❌ Geocoding: FAILED');
      console.log(`   Response: ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    testResults.failed.push('Geocoding endpoint');
    console.log(`❌ Geocoding: ERROR - ${error.message}`);
  }
}

async function testChartGeneration() {
  console.log('\n🔍 Testing Chart Generation Endpoint...');
  
  const testData = {
    name: 'Test User',
    dateOfBirth: '1990-01-01',
    timeOfBirth: '12:00',
    placeOfBirth: 'Mumbai, Maharashtra, India',
    latitude: 19.076,
    longitude: 72.8777,
    timezone: 'Asia/Kolkata'
  };

  try {
    const response = await makeRequest(`${BACKEND_URL}/api/v1/chart/generate`, {
      method: 'POST',
      body: testData
    });

    // Handle both success formats
    const isSuccess = response.status === 200 && 
      response.data && 
      (response.data.success === true || response.data.data) &&
      (response.data.data?.rasiChart || response.data.rasiChart);

    if (isSuccess) {
      testResults.passed.push('Chart generation endpoint');
      console.log('✅ Chart Generation: PASSED');
      const chart = response.data.data?.rasiChart || response.data.rasiChart;
      console.log(`   Ascendant: ${chart.ascendant?.signName || chart.ascendant?.sign || 'N/A'}`);
    } else {
      testResults.failed.push('Chart generation endpoint');
      console.log('❌ Chart Generation: FAILED');
      console.log(`   Status: ${response.status}`);
      const responseStr = typeof response.data === 'string' 
        ? response.data.substring(0, 200) 
        : JSON.stringify(response.data).substring(0, 200);
      console.log(`   Response: ${responseStr}...`);
    }
  } catch (error) {
    testResults.failed.push('Chart generation endpoint');
    console.log(`❌ Chart Generation: ERROR - ${error.message}`);
    // Check if it's a cold start issue
    if (error.message.includes('timeout') || error.message.includes('ECONNRESET')) {
      console.log('   ⚠️  This might be a cold start delay. Chart generation can take 30-60 seconds on first request.');
    }
  }
}

async function testComprehensiveAnalysis() {
  console.log('\n🔍 Testing Comprehensive Analysis Endpoint...');
  console.log('   ⚠️  Note: This endpoint can take 60+ seconds on first request (cold start)');
  
  const testData = {
    name: 'Test User',
    dateOfBirth: '1990-01-01',
    timeOfBirth: '12:00',
    placeOfBirth: 'Mumbai, Maharashtra, India',
    latitude: 19.076,
    longitude: 72.8777,
    timezone: 'Asia/Kolkata'
  };

  try {
    const response = await makeRequest(`${BACKEND_URL}/api/v1/analysis/comprehensive`, {
      method: 'POST',
      body: testData
    });

    const isSuccess = response.status === 200 && 
      response.data && 
      (response.data.success === true || response.data.data || response.data.analysis);

    if (isSuccess) {
      testResults.passed.push('Comprehensive analysis endpoint');
      console.log('✅ Comprehensive Analysis: PASSED');
    } else {
      testResults.failed.push('Comprehensive analysis endpoint');
      console.log('❌ Comprehensive Analysis: FAILED');
      console.log(`   Status: ${response.status}`);
      const responseStr = typeof response.data === 'string' 
        ? response.data.substring(0, 200) 
        : JSON.stringify(response.data).substring(0, 200);
      console.log(`   Response: ${responseStr}...`);
    }
  } catch (error) {
    testResults.failed.push('Comprehensive analysis endpoint');
    console.log(`❌ Comprehensive Analysis: ERROR - ${error.message}`);
    // Check if it's a cold start issue
    if (error.message.includes('timeout') || error.message.includes('ECONNRESET')) {
      console.log('   ⚠️  This is likely a cold start delay. Comprehensive analysis can take 60+ seconds on first request.');
      console.log('   ⚠️  Consider this a warning rather than a failure for production deployments.');
      testResults.warnings.push('Comprehensive analysis endpoint (cold start timeout)');
    }
  }
}

async function testCORS() {
  console.log('\n🔍 Testing CORS Configuration...');
  
  try {
    const response = await makeRequest(`${BACKEND_URL}/api/v1/chart/generate`, {
      method: 'OPTIONS',
      headers: {
        'Origin': FRONTEND_URL,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });

    const corsHeaders = response.headers['access-control-allow-origin'];
    if (response.status === 200 && corsHeaders) {
      testResults.passed.push('CORS configuration');
      console.log('✅ CORS: PASSED');
      console.log(`   Allowed Origin: ${corsHeaders}`);
    } else {
      testResults.warnings.push('CORS configuration');
      console.log('⚠️  CORS: WARNING - Headers may not be set correctly');
    }
  } catch (error) {
    testResults.warnings.push('CORS configuration');
    console.log(`⚠️  CORS: WARNING - ${error.message}`);
  }
}

async function testFrontend() {
  console.log('\n🔍 Testing Frontend Accessibility...');
  
  try {
    const response = await makeRequest(FRONTEND_URL);
    if (response.status === 200) {
      testResults.passed.push('Frontend accessibility');
      console.log('✅ Frontend: PASSED');
    } else {
      testResults.failed.push('Frontend accessibility');
      console.log(`❌ Frontend: FAILED - Status: ${response.status}`);
    }
  } catch (error) {
    testResults.failed.push('Frontend accessibility');
    console.log(`❌ Frontend: ERROR - ${error.message}`);
  }
}

async function runAllTests() {
  console.log('🚀 Starting Post-Deployment Tests...');
  console.log(`📡 Backend: ${BACKEND_URL}`);
  console.log(`🌐 Frontend: ${FRONTEND_URL}`);

  await testBackendHealth();
  await testGeocoding();
  await testChartGeneration();
  await testComprehensiveAnalysis();
  await testCORS();
  await testFrontend();

  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${testResults.passed.length}`);
  console.log(`❌ Failed: ${testResults.failed.length}`);
  console.log(`⚠️  Warnings: ${testResults.warnings.length}`);

  if (testResults.passed.length > 0) {
    console.log('\n✅ PASSED TESTS:');
    testResults.passed.forEach(test => console.log(`   - ${test}`));
  }

  if (testResults.failed.length > 0) {
    console.log('\n❌ FAILED TESTS:');
    testResults.failed.forEach(test => console.log(`   - ${test}`));
  }

  if (testResults.warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    testResults.warnings.forEach(test => console.log(`   - ${test}`));
  }

  console.log('\n' + '='.repeat(60));

  if (testResults.failed.length === 0) {
    console.log('🎉 All critical tests passed!');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Please review the errors above.');
    process.exit(1);
  }
}

runAllTests().catch(error => {
  console.error('❌ Test execution error:', error);
  process.exit(1);
});

