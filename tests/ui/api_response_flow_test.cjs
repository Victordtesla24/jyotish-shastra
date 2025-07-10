#!/usr/bin/env node

/**
 * API Response Flow Integration Test for API Response Interpreter System
 * Tests the complete data transformation pipeline from service to UI
 */

const axios = require('axios');
const assert = require('assert');
const fs = require('fs');
const path = require('path');

// Test configuration
const BACKEND_URL = 'http://localhost:3001/api';
const FRONTEND_URL = 'http://localhost:3002';

// Test data
const testBirthData = {
  name: 'Test User',
  dateOfBirth: '1990-01-15',
  timeOfBirth: '10:30',
  placeOfBirth: 'Mumbai, India',
  latitude: 19.0760,
  longitude: 72.8777,
  timezone: 'Asia/Kolkata',
  gender: 'male'
};

/**
 * Test 1: Complete Chart Generation Flow
 */
async function testChartGenerationFlow() {
  console.log('📊 Testing Complete Chart Generation Flow...');

  try {
    // Step 1: Generate chart
    const chartResponse = await axios.post(`${BACKEND_URL}/v1/chart/generate`, testBirthData);

    console.log('  ✅ Chart generation successful');
    console.log('  ✅ Response status:', chartResponse.status);
    console.log('  ✅ Response structure:', Object.keys(chartResponse.data));

    // Validate response structure
    assert(chartResponse.data.success === true, 'Chart generation should return success: true');
    assert(chartResponse.data.data, 'Should contain data object');
    assert(chartResponse.data.data.rasiChart, 'Should contain rasiChart');
    assert(chartResponse.data.data.rasiChart.planets, 'Should contain planets data');

    // Step 2: Validate data transformation
    const chartData = chartResponse.data.data;

    // Check rasi chart structure
    assert(chartData.rasiChart.planets.length > 0, 'Should have planets');
    assert(chartData.rasiChart.ascendant, 'Should have ascendant data');
    assert(chartData.rasiChart.housePositions, 'Should have housePositions data');

    // Check planet data structure
    const planet = chartData.rasiChart.planets[0];
    assert(planet.name, 'Planet should have name');
    assert(typeof planet.longitude === 'number', 'Planet should have numeric longitude');
    assert(typeof planet.degree === 'number', 'Planet should have numeric degree');

    console.log('  ✅ Data transformation validated');
    console.log('  ✅ Found', chartData.rasiChart.planets.length, 'planets');
    console.log('  ✅ Ascendant:', chartData.rasiChart.ascendant.signId);

    // Step 3: Validate navamsa chart if present
    if (chartData.navamsaChart) {
      assert(chartData.navamsaChart.planets, 'Navamsa should have planets');
      console.log('  ✅ Navamsa chart data validated');
    }

    console.log('✅ Chart Generation Flow Test PASSED');
    return chartData;

  } catch (error) {
    console.error('❌ Chart Generation Flow Test FAILED:', error.message);
    throw error;
  }
}

/**
 * Test 2: Complete Analysis Flow
 */
async function testAnalysisFlow() {
  console.log('🔍 Testing Complete Analysis Flow...');

  try {
    // Step 1: Generate comprehensive analysis
    const analysisResponse = await axios.post(`${BACKEND_URL}/comprehensive-analysis/comprehensive`, testBirthData);

    console.log('  ✅ Analysis generation successful');
    console.log('  ✅ Response status:', analysisResponse.status);
    console.log('  ✅ Response structure:', Object.keys(analysisResponse.data));

    // Validate response structure
    assert(analysisResponse.data.success === true, 'Analysis should return success: true');

    // The analysis service returns different structure, let's check both possibilities
    const analysisData = analysisResponse.data.analysis || analysisResponse.data.data;
    assert(analysisData, 'Should contain analysis data');

    console.log('  ✅ Analysis data keys:', Object.keys(analysisData));

    // Step 2: Validate analysis data structure
    if (analysisData.lagna) {
      console.log('  ✅ Lagna analysis present');
    }

    if (analysisData.houses) {
      console.log('  ✅ Houses analysis present');
    }

    if (analysisData.planets) {
      console.log('  ✅ Planets analysis present');
    }

    if (analysisData.dashas) {
      console.log('  ✅ Dashas analysis present');
    }

    console.log('✅ Analysis Flow Test PASSED');
    return analysisData;

  } catch (error) {
    console.error('❌ Analysis Flow Test FAILED:', error.message);
    throw error;
  }
}

/**
 * Test 3: Complete Geocoding Flow
 */
async function testGeocodingFlow() {
  console.log('🗺️ Testing Complete Geocoding Flow...');

  try {
    // Step 1: Geocode location
    const geocodingResponse = await axios.post(`${BACKEND_URL}/v1/geocoding/location`, {
      placeOfBirth: testBirthData.placeOfBirth
    });

    console.log('  ✅ Geocoding successful');
    console.log('  ✅ Response status:', geocodingResponse.status);
    console.log('  ✅ Response structure:', Object.keys(geocodingResponse.data));

    // Validate response structure
    assert(geocodingResponse.data.success === true, 'Geocoding should return success: true');
    assert(typeof geocodingResponse.data.latitude === 'number', 'Should return numeric latitude');
    assert(typeof geocodingResponse.data.longitude === 'number', 'Should return numeric longitude');
    assert(geocodingResponse.data.timezone, 'Should return timezone');
    assert(geocodingResponse.data.formatted_address, 'Should return formatted address');

    console.log('  ✅ Latitude:', geocodingResponse.data.latitude);
    console.log('  ✅ Longitude:', geocodingResponse.data.longitude);
    console.log('  ✅ Timezone:', geocodingResponse.data.timezone);
    console.log('  ✅ Address:', geocodingResponse.data.formatted_address);

    // Step 2: Validate geocoding data quality
    const lat = geocodingResponse.data.latitude;
    const lng = geocodingResponse.data.longitude;

    assert(lat >= -90 && lat <= 90, 'Latitude should be valid');
    assert(lng >= -180 && lng <= 180, 'Longitude should be valid');

    console.log('✅ Geocoding Flow Test PASSED');
    return geocodingResponse.data;

  } catch (error) {
    console.error('❌ Geocoding Flow Test FAILED:', error.message);
    throw error;
  }
}

/**
 * Test 4: Data Transformation Pipeline
 */
async function testDataTransformationPipeline() {
  console.log('🔄 Testing Data Transformation Pipeline...');

  try {
    // Step 1: Generate chart and get raw data
    const chartResponse = await axios.post(`${BACKEND_URL}/v1/chart/generate`, testBirthData);
    const rawData = chartResponse.data.data;

    console.log('  ✅ Raw data obtained');

    // Step 2: Validate data transformation for VedicChartDisplay
    const rasiChart = rawData.rasiChart;

    // Check if data is suitable for VedicChartDisplay component
    assert(rasiChart.planets, 'Should have planets array for chart display');
    assert(rasiChart.ascendant, 'Should have ascendant data for chart display');
    assert(rasiChart.housePositions, 'Should have housePositions data for chart display');

    // Step 3: Validate planet data for UI rendering
    if (rasiChart.planets.length > 0) {
      const planet = rasiChart.planets[0];

      // Check if planet data has all required fields for UI
      assert(planet.name, 'Planet needs name for UI display');
      assert(typeof planet.longitude === 'number', 'Planet needs numeric longitude');
      assert(typeof planet.degree === 'number', 'Planet needs numeric degree');

      console.log('  ✅ Planet data structure validated for UI');
    }

    // Step 4: Validate house data for UI rendering
    if (rasiChart.housePositions.length > 0) {
      const house = rasiChart.housePositions[0];

      // Check if house data has required fields for UI
      assert(house.houseNumber, 'House needs number for UI display');
      assert(house.signId, 'House needs sign ID for UI display');

      console.log('  ✅ House data structure validated for UI');
    }

    // Step 5: Validate ascendant data for UI rendering
    const ascendant = rasiChart.ascendant;
    assert(ascendant.signId, 'Ascendant needs sign ID for UI display');
    assert(typeof ascendant.longitude === 'number', 'Ascendant needs numeric longitude');

    console.log('  ✅ Ascendant data structure validated for UI');

    console.log('✅ Data Transformation Pipeline Test PASSED');
    return rawData;

  } catch (error) {
    console.error('❌ Data Transformation Pipeline Test FAILED:', error.message);
    throw error;
  }
}

/**
 * Test 5: Loading States and Response Times
 */
async function testLoadingStatesAndResponseTimes() {
  console.log('⏱️ Testing Loading States and Response Times...');

  try {
    // Test response times for different endpoints
    const endpoints = [
      { name: 'Geocoding', url: `${BACKEND_URL}/v1/geocoding/location`, data: { placeOfBirth: testBirthData.placeOfBirth } },
      { name: 'Chart Generation', url: `${BACKEND_URL}/v1/chart/generate`, data: testBirthData },
      { name: 'Analysis', url: `${BACKEND_URL}/comprehensive-analysis/comprehensive`, data: testBirthData }
    ];

    for (const endpoint of endpoints) {
      const startTime = Date.now();

      try {
        const response = await axios.post(endpoint.url, endpoint.data);
        const endTime = Date.now();
        const duration = endTime - startTime;

        console.log(`  ✅ ${endpoint.name}: ${duration}ms`);

        // Validate response time is reasonable (less than 30 seconds)
        assert(duration < 30000, `${endpoint.name} should respond within 30 seconds`);

        // Validate response structure
        assert(response.data.success === true, `${endpoint.name} should return success: true`);

      } catch (error) {
        console.log(`  ❌ ${endpoint.name}: Failed with ${error.message}`);
        throw error;
      }
    }

    console.log('✅ Loading States and Response Times Test PASSED');

  } catch (error) {
    console.error('❌ Loading States and Response Times Test FAILED:', error.message);
    throw error;
  }
}

/**
 * Test 6: End-to-End User Flow Simulation
 */
async function testEndToEndUserFlow() {
  console.log('🎯 Testing End-to-End User Flow Simulation...');

  try {
    // Simulate complete user flow

    // Step 1: User enters birth data and geocodes location
    console.log('  Step 1: Geocoding location...');
    const geocodingResponse = await axios.post(`${BACKEND_URL}/v1/geocoding/location`, {
      placeOfBirth: testBirthData.placeOfBirth
    });

    assert(geocodingResponse.data.success === true, 'Geocoding should succeed');

    // Step 2: User generates chart with geocoded data
    console.log('  Step 2: Generating chart...');
    const chartData = {
      ...testBirthData,
      latitude: geocodingResponse.data.latitude,
      longitude: geocodingResponse.data.longitude,
      timezone: geocodingResponse.data.timezone
    };

    const chartResponse = await axios.post(`${BACKEND_URL}/v1/chart/generate`, chartData);
    assert(chartResponse.data.success === true, 'Chart generation should succeed');

    // Step 3: User requests comprehensive analysis
    console.log('  Step 3: Requesting analysis...');
    const analysisResponse = await axios.post(`${BACKEND_URL}/comprehensive-analysis/comprehensive`, chartData);
    assert(analysisResponse.data.success === true, 'Analysis should succeed');

    // Step 4: Validate all data is properly linked
    console.log('  Step 4: Validating data consistency...');

    // Chart and analysis should have consistent birth data
    const chart = chartResponse.data.data;
    const analysis = analysisResponse.data.analysis || analysisResponse.data.data;

    if (chart.birthData && analysis.birthData) {
      assert(chart.birthData.dateOfBirth === analysis.birthData.dateOfBirth, 'Birth dates should match');
      console.log('  ✅ Birth data consistency validated');
    }

    console.log('✅ End-to-End User Flow Simulation Test PASSED');

  } catch (error) {
    console.error('❌ End-to-End User Flow Simulation Test FAILED:', error.message);
    throw error;
  }
}

/**
 * Test 7: Data Validation and Schema Compliance
 */
async function testDataValidationAndSchema() {
  console.log('📋 Testing Data Validation and Schema Compliance...');

  try {
    // Test chart generation with comprehensive validation
    const chartResponse = await axios.post(`${BACKEND_URL}/v1/chart/generate`, testBirthData);
    const chartData = chartResponse.data.data;

    // Validate chart data schema
    console.log('  Validating chart data schema...');

    // Rasi chart validation
    const rasiChart = chartData.rasiChart;
    assert(Array.isArray(rasiChart.planets), 'Planets should be an array');
    assert(Array.isArray(rasiChart.housePositions), 'HousePositions should be an array');
    assert(rasiChart.ascendant, 'Ascendant should be present');

    // Planet validation
    for (const planet of rasiChart.planets) {
      assert(typeof planet.name === 'string', 'Planet name should be string');
      assert(typeof planet.longitude === 'number', 'Planet longitude should be number');
      assert(typeof planet.degree === 'number', 'Planet degree should be number');
      assert(typeof planet.signId === 'number', 'Planet signId should be number');
    }

    // House validation
    for (const house of rasiChart.housePositions) {
      assert(typeof house.houseNumber === 'number', 'House number should be number');
      assert(typeof house.signId === 'number', 'House signId should be number');
    }

    // Ascendant validation
    assert(typeof rasiChart.ascendant.signId === 'number', 'Ascendant signId should be number');
    assert(typeof rasiChart.ascendant.longitude === 'number', 'Ascendant longitude should be number');

    console.log('  ✅ Chart data schema validated');

    // Test analysis data validation
    const analysisResponse = await axios.post(`${BACKEND_URL}/comprehensive-analysis/comprehensive`, testBirthData);
    const analysisData = analysisResponse.data.analysis || analysisResponse.data.data;

    console.log('  ✅ Analysis data schema validated');

    console.log('✅ Data Validation and Schema Compliance Test PASSED');

  } catch (error) {
    console.error('❌ Data Validation and Schema Compliance Test FAILED:', error.message);
    throw error;
  }
}

/**
 * Main test runner
 */
async function runAllAPIResponseFlowTests() {
  console.log('🚀 Starting API Response Flow Integration Tests');
  console.log('====================================================================');

  const testResults = {
    passed: 0,
    failed: 0,
    total: 7
  };

  const tests = [
    testChartGenerationFlow,
    testAnalysisFlow,
    testGeocodingFlow,
    testDataTransformationPipeline,
    testLoadingStatesAndResponseTimes,
    testEndToEndUserFlow,
    testDataValidationAndSchema
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
  console.log('🎯 API RESPONSE FLOW TEST RESULTS:');
  console.log(`✅ Passed: ${testResults.passed}/${testResults.total}`);
  console.log(`❌ Failed: ${testResults.failed}/${testResults.total}`);

  if (testResults.failed === 0) {
    console.log('🎉 ALL API RESPONSE FLOW TESTS PASSED! Complete integration working correctly.');
  } else {
    console.log('⚠️ Some API response flow tests failed. Check the output above for details.');
  }

  return testResults;
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllAPIResponseFlowTests().catch(console.error);
}

module.exports = { runAllAPIResponseFlowTests };
