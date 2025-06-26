#!/usr/bin/env node

/**
 * Geocoding Integration Test
 * Tests the complete geocoding flow from frontend to backend
 */

const axios = require('axios');

// Test configuration
const BACKEND_URL = 'http://localhost:3001/api';
const FRONTEND_URL = 'http://localhost:3002';

console.log('🔍 Starting Geocoding Integration Test...\n');

async function testBackendHealth() {
  try {
    console.log('1. Testing Backend Health...');
    const response = await axios.get(`${BACKEND_URL}/health`);
    if (response.status === 200) {
      console.log('✅ Backend is running and healthy');
      return true;
    }
  } catch (error) {
    console.log('❌ Backend health check failed:', error.message);
    return false;
  }
}

async function testGeocodingEndpoint() {
  try {
    console.log('\n2. Testing Geocoding Endpoint...');
    const response = await axios.post(`${BACKEND_URL}/v1/geocoding/location`, {
      placeOfBirth: 'Mumbai, Maharashtra, India'
    });

    if (response.data.success) {
      console.log('✅ Geocoding endpoint working correctly');
      console.log(`   📍 Location: ${response.data.formatted_address}`);
      console.log(`   🌐 Coordinates: ${response.data.latitude}, ${response.data.longitude}`);
      console.log(`   🕐 Timezone: ${response.data.timezone}`);
      return response.data;
    } else {
      console.log('❌ Geocoding failed:', response.data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Geocoding endpoint test failed:', error.message);
    return false;
  }
}

async function testFrontendConnectivity() {
  try {
    console.log('\n3. Testing Frontend Connectivity...');
    const response = await axios.get(FRONTEND_URL);
    if (response.status === 200) {
      console.log('✅ Frontend is accessible');
      return true;
    }
  } catch (error) {
    console.log('❌ Frontend connectivity test failed:', error.message);
    console.log('   🔧 Frontend may not be started. Run: cd client && npm start');
    return false;
  }
}

async function testCORSConfiguration() {
  try {
    console.log('\n4. Testing CORS Configuration...');
    const response = await axios.post(`${BACKEND_URL}/v1/geocoding/location`, {
      placeOfBirth: 'Delhi, India'
    }, {
      headers: {
        'Origin': 'http://localhost:3002',
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 200) {
      console.log('✅ CORS is properly configured');
      return true;
    }
  } catch (error) {
    console.log('❌ CORS configuration issue:', error.message);
    return false;
  }
}

async function testChartGeneration(geocodingData) {
  try {
    console.log('\n5. Testing Chart Generation with Geocoded Data...');
    const chartData = {
      name: 'Test User',
      dateOfBirth: '1985-10-24',
      timeOfBirth: '14:30',
      placeOfBirth: 'Mumbai, Maharashtra, India',
      latitude: geocodingData.latitude,
      longitude: geocodingData.longitude,
      timezone: geocodingData.timezone
    };

    const response = await axios.post(`${BACKEND_URL}/v1/chart/generate`, chartData);

    if (response.data.success) {
      console.log('✅ Chart generation successful with geocoded coordinates');
      console.log(`   🎯 Chart ID: ${response.data.chartId || 'Generated'}`);
      return true;
    } else {
      console.log('❌ Chart generation failed:', response.data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Chart generation test failed:', error.message);
    return false;
  }
}

async function runIntegrationTest() {
  let allTestsPassed = true;

  console.log('📊 Running Complete Integration Test Suite\n');
  console.log('═'.repeat(60));

  // Test 1: Backend Health
  const backendHealthy = await testBackendHealth();
  allTestsPassed = allTestsPassed && backendHealthy;

  // Test 2: Geocoding Endpoint
  const geocodingData = await testGeocodingEndpoint();
  allTestsPassed = allTestsPassed && !!geocodingData;

  // Test 3: Frontend Connectivity
  const frontendConnected = await testFrontendConnectivity();
  allTestsPassed = allTestsPassed && frontendConnected;

  // Test 4: CORS Configuration
  const corsWorking = await testCORSConfiguration();
  allTestsPassed = allTestsPassed && corsWorking;

  // Test 5: Chart Generation (only if geocoding worked)
  if (geocodingData) {
    const chartGenerated = await testChartGeneration(geocodingData);
    allTestsPassed = allTestsPassed && chartGenerated;
  }

  console.log('\n' + '═'.repeat(60));

  if (allTestsPassed) {
    console.log('🎉 ALL TESTS PASSED! Geocoding integration is working correctly.');
    console.log('\n📝 Next Steps:');
    console.log('   1. Open browser to http://localhost:3002/chart');
    console.log('   2. Fill in the birth data form');
    console.log('   3. Type a location and watch real-time geocoding work');
    console.log('   4. Generate your birth chart!');
  } else {
    console.log('❌ SOME TESTS FAILED. Check the errors above and fix them.');
    console.log('\n🔧 Common Solutions:');
    console.log('   1. Start backend: npm start');
    console.log('   2. Start frontend: cd client && npm start');
    console.log('   3. Check CORS configuration in src/index.js');
    console.log('   4. Verify API endpoints in src/api/routes/');
  }

  console.log('\n🔍 Integration Test Complete\n');
}

// Run the test
runIntegrationTest().catch(console.error);
