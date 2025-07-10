#!/usr/bin/env node

/**
 * Frontend Integration Test for API Response Interpreter System
 * Tests the complete flow from form submission to chart display
 */

const axios = require('axios');
const assert = require('assert');

// Test configuration
const FRONTEND_URL = 'http://localhost:3002';
const BACKEND_URL = 'http://localhost:3001/api';

// Test data
const testBirthData = {
  dateOfBirth: '1990-01-15',
  timeOfBirth: '10:30',
  placeOfBirth: 'Mumbai, India',
  latitude: 19.0760,
  longitude: 72.8777,
  timezone: 'Asia/Kolkata',
  gender: 'male'
};

/**
 * Test 1: Geocoding Service Integration
 */
async function testGeocodingIntegration() {
  console.log('🌍 Testing Geocoding Service Integration...');

  try {
    const response = await axios.post(`${BACKEND_URL}/v1/geocoding/location`, {
      placeOfBirth: testBirthData.placeOfBirth
    });

    console.log('✅ Geocoding Response:', response.data);

    // Validate response structure
    assert(response.data.success === true, 'Geocoding should return success: true');
    assert(typeof response.data.latitude === 'number', 'Latitude should be a number');
    assert(typeof response.data.longitude === 'number', 'Longitude should be a number');
    assert(response.data.timezone, 'Should return timezone');
    assert(response.data.formatted_address, 'Should return formatted address');

    console.log('✅ Geocoding Integration Test PASSED');
    return response.data;

  } catch (error) {
    console.error('❌ Geocoding Integration Test FAILED:', error.message);
    throw error;
  }
}

/**
 * Test 2: Chart Generation Service Integration
 */
async function testChartGenerationIntegration() {
  console.log('📊 Testing Chart Generation Service Integration...');

  try {
    const response = await axios.post(`${BACKEND_URL}/v1/chart/generate`, testBirthData);

    console.log('✅ Chart Generation Response Status:', response.status);
    console.log('✅ Chart Generation Response Keys:', Object.keys(response.data));

    // Validate response structure
    assert(response.data.success === true, 'Chart generation should return success: true');
    assert(response.data.data, 'Should return chart data');
    assert(response.data.data.rasiChart, 'Should return rasi chart');
    assert(response.data.data.rasiChart.planets, 'Should return planets data');

    console.log('✅ Chart Generation Integration Test PASSED');
    return response.data;

  } catch (error) {
    console.error('❌ Chart Generation Integration Test FAILED:', error.message);
    throw error;
  }
}

/**
 * Test 3: Comprehensive Analysis Service Integration
 */
async function testAnalysisIntegration() {
  console.log('🔍 Testing Analysis Service Integration...');

  try {
    const response = await axios.post(`${BACKEND_URL}/comprehensive-analysis/comprehensive`, testBirthData);

    console.log('✅ Analysis Response Status:', response.status);
    console.log('✅ Analysis Response Keys:', Object.keys(response.data));

    // Validate response structure
    assert(response.data.success === true, 'Analysis should return success: true');
    assert(response.data.data, 'Should return analysis data');

    console.log('✅ Analysis Integration Test PASSED');
    return response.data;

  } catch (error) {
    console.error('❌ Analysis Integration Test FAILED:', error.message);
    throw error;
  }
}

/**
 * Test 4: Error Handling Integration
 */
async function testErrorHandlingIntegration() {
  console.log('⚠️ Testing Error Handling Integration...');

  try {
    // Test with invalid data
    const invalidData = {
      dateOfBirth: 'invalid-date',
      timeOfBirth: '25:99', // Invalid time
      placeOfBirth: '',
      latitude: 'not-a-number',
      longitude: 'not-a-number'
    };

    try {
      await axios.post(`${BACKEND_URL}/v1/chart/generate`, invalidData);
      assert(false, 'Should have thrown an error for invalid data');
    } catch (error) {
      console.log('✅ Error Response Status:', error.response?.status);
      console.log('✅ Error Response Data:', error.response?.data);

      // Validate error structure
      assert(error.response?.status >= 400, 'Should return 4xx error status');
      assert(error.response?.data?.success === false, 'Should return success: false');
      assert(error.response?.data?.error, 'Should return error message');
    }

    console.log('✅ Error Handling Integration Test PASSED');

  } catch (error) {
    console.error('❌ Error Handling Integration Test FAILED:', error.message);
    throw error;
  }
}

/**
 * Test 5: Response Validation Schema Test
 */
async function testResponseValidation() {
  console.log('🔍 Testing Response Validation Schema...');

  try {
    const chartResponse = await axios.post(`${BACKEND_URL}/v1/chart/generate`, testBirthData);

    // Validate chart response schema
    const chartData = chartResponse.data.data;
    assert(chartData.rasiChart, 'Should have rasiChart');
    assert(chartData.rasiChart.planets, 'Should have planets array');
    assert(chartData.rasiChart.ascendant, 'Should have ascendant data');

    // Validate planet data structure
    if (chartData.rasiChart.planets.length > 0) {
      const planet = chartData.rasiChart.planets[0];
      assert(planet.name, 'Planet should have name');
      assert(typeof planet.longitude === 'number', 'Planet should have longitude');
      assert(typeof planet.degree === 'number', 'Planet should have degree');
    }

    console.log('✅ Response Validation Schema Test PASSED');

  } catch (error) {
    console.error('❌ Response Validation Schema Test FAILED:', error.message);
    throw error;
  }
}

/**
 * Test 6: Cache Integration Test
 */
async function testCacheIntegration() {
  console.log('💾 Testing Cache Integration...');

  try {
    // Make first request (should hit backend)
    const start1 = Date.now();
    const response1 = await axios.post(`${BACKEND_URL}/v1/chart/generate`, testBirthData);
    const time1 = Date.now() - start1;

    // Make second request (should hit cache)
    const start2 = Date.now();
    const response2 = await axios.post(`${BACKEND_URL}/v1/chart/generate`, testBirthData);
    const time2 = Date.now() - start2;

    console.log('✅ First Request Time:', time1 + 'ms');
    console.log('✅ Second Request Time:', time2 + 'ms');

    // Validate responses are identical
    assert(JSON.stringify(response1.data) === JSON.stringify(response2.data),
           'Cache should return identical data');

    console.log('✅ Cache Integration Test PASSED');

  } catch (error) {
    console.error('❌ Cache Integration Test FAILED:', error.message);
    throw error;
  }
}

/**
 * Test 7: Frontend API Integration Test
 */
async function testFrontendAPIIntegration() {
  console.log('🌐 Testing Frontend API Integration...');

  try {
    // Check if frontend is accessible
    const frontendResponse = await axios.get(FRONTEND_URL);
    assert(frontendResponse.status === 200, 'Frontend should be accessible');

    // Check if the HTML contains the expected React app structure
    const html = frontendResponse.data;
    assert(html.includes('Jyotish Shastra'), 'Should contain app title');
    assert(html.includes('id="root"'), 'Should contain React root element');

    console.log('✅ Frontend API Integration Test PASSED');

  } catch (error) {
    console.error('❌ Frontend API Integration Test FAILED:', error.message);
    throw error;
  }
}

/**
 * Main test runner
 */
async function runAllTests() {
  console.log('🚀 Starting Frontend Integration Tests for API Response Interpreter System');
  console.log('====================================================================');

  const testResults = {
    passed: 0,
    failed: 0,
    total: 7
  };

  const tests = [
    testGeocodingIntegration,
    testChartGenerationIntegration,
    testAnalysisIntegration,
    testErrorHandlingIntegration,
    testResponseValidation,
    testCacheIntegration,
    testFrontendAPIIntegration
  ];

  for (const test of tests) {
    try {
      await test();
      testResults.passed++;
      console.log('');
    } catch (error) {
      testResults.failed++;
      console.error('Test failed:', error.message);
      console.log('');
    }
  }

  console.log('====================================================================');
  console.log('🎯 TEST RESULTS:');
  console.log(`✅ Passed: ${testResults.passed}/${testResults.total}`);
  console.log(`❌ Failed: ${testResults.failed}/${testResults.total}`);

  if (testResults.failed === 0) {
    console.log('🎉 ALL TESTS PASSED! API Response Interpreter System is fully integrated.');
  } else {
    console.log('⚠️ Some tests failed. Check the output above for details.');
  }

  return testResults;
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests };
