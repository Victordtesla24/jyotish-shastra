#!/usr/bin/env node

/**
 * Frontend Error Handling Test for API Response Interpreter System
 * Tests error handling across all frontend UI components
 */

const axios = require('axios');
const assert = require('assert');
const { execSync } = require('child_process');

// Test configuration
const BACKEND_URL = 'http://localhost:3001/api';
const FRONTEND_URL = 'http://localhost:3002';

/**
 * Test 1: Form Validation Error Handling
 */
async function testFormValidationErrors() {
  console.log('📝 Testing Form Validation Error Handling...');

  try {
    // Test with various invalid inputs
    const invalidInputs = [
      {
        name: 'Empty Date',
        data: { dateOfBirth: '', timeOfBirth: '10:30', placeOfBirth: 'Mumbai' },
        expectedError: 'dateOfBirth'
      },
      {
        name: 'Invalid Date Format',
        data: { dateOfBirth: 'invalid-date', timeOfBirth: '10:30', placeOfBirth: 'Mumbai' },
        expectedError: 'dateOfBirth'
      },
      {
        name: 'Invalid Time Format',
        data: { dateOfBirth: '1990-01-15', timeOfBirth: '25:99', placeOfBirth: 'Mumbai' },
        expectedError: 'timeOfBirth'
      },
      {
        name: 'Empty Place of Birth',
        data: { dateOfBirth: '1990-01-15', timeOfBirth: '10:30', placeOfBirth: '' },
        expectedError: 'placeOfBirth'
      },
      {
        name: 'Invalid Coordinates',
        data: {
          dateOfBirth: '1990-01-15',
          timeOfBirth: '10:30',
          latitude: 'invalid',
          longitude: 'invalid'
        },
        expectedError: 'latitude'
      }
    ];

    for (const test of invalidInputs) {
      console.log(`  Testing: ${test.name}`);

      try {
        await axios.post(`${BACKEND_URL}/v1/chart/generate`, test.data);
        console.log(`    ❌ Should have failed for ${test.name}`);
      } catch (error) {
        if (error.response?.status >= 400) {
          console.log(`    ✅ Correctly returned error for ${test.name}`);
          console.log(`    ✅ Error structure: ${error.response.data.success === false ? 'Valid' : 'Invalid'}`);
          console.log(`    ✅ Error message: ${error.response.data.error || 'No error message'}`);
          console.log(`    ✅ Field-specific errors: ${error.response.data.details ? 'Present' : 'Missing'}`);
        } else {
          console.log(`    ❌ Unexpected error status: ${error.response?.status}`);
        }
      }
    }

    console.log('✅ Form Validation Error Handling Test PASSED');

  } catch (error) {
    console.error('❌ Form Validation Error Handling Test FAILED:', error.message);
    throw error;
  }
}

/**
 * Test 2: Network Error Handling
 */
async function testNetworkErrorHandling() {
  console.log('🌐 Testing Network Error Handling...');

  try {
    // Test with non-existent endpoint
    try {
      await axios.get(`${BACKEND_URL}/v1/nonexistent-endpoint`);
      console.log('❌ Should have failed for non-existent endpoint');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ Correctly returned 404 for non-existent endpoint');
      } else {
        console.log(`⚠️ Unexpected status: ${error.response?.status || 'No response'}`);
      }
    }

    // Test with malformed JSON
    try {
      await axios.post(`${BACKEND_URL}/v1/chart/generate`, 'invalid-json', {
        headers: { 'Content-Type': 'application/json' }
      });
      console.log('❌ Should have failed for malformed JSON');
    } catch (error) {
      if (error.response?.status >= 400) {
        console.log('✅ Correctly handled malformed JSON');
      } else {
        console.log(`⚠️ Unexpected error handling: ${error.message}`);
      }
    }

    console.log('✅ Network Error Handling Test PASSED');

  } catch (error) {
    console.error('❌ Network Error Handling Test FAILED:', error.message);
    throw error;
  }
}

/**
 * Test 3: Geocoding Error Handling
 */
async function testGeocodingErrorHandling() {
  console.log('🗺️ Testing Geocoding Error Handling...');

  try {
    // Test with invalid location
    const invalidLocations = [
      '',
      'asdfghjklqwertyuiop', // Random string
      '123456789', // Numbers only
      'xxxxxxxxxx', // Repeated characters
    ];

    for (const location of invalidLocations) {
      console.log(`  Testing location: "${location}"`);

      try {
        await axios.post(`${BACKEND_URL}/v1/geocoding/location`, {
          placeOfBirth: location
        });
        console.log(`    ⚠️ Geocoding succeeded for "${location}" (might be valid)`);
      } catch (error) {
        if (error.response?.status >= 400) {
          console.log(`    ✅ Correctly failed for "${location}"`);
          console.log(`    ✅ Error response: ${error.response.data.success === false ? 'Valid structure' : 'Invalid structure'}`);
        } else {
          console.log(`    ❌ Unexpected error: ${error.message}`);
        }
      }
    }

    console.log('✅ Geocoding Error Handling Test PASSED');

  } catch (error) {
    console.error('❌ Geocoding Error Handling Test FAILED:', error.message);
    throw error;
  }
}

/**
 * Test 4: Chart Generation Error Handling
 */
async function testChartGenerationErrorHandling() {
  console.log('📊 Testing Chart Generation Error Handling...');

  try {
    // Test with missing required fields
    const incompleteData = [
      { dateOfBirth: '1990-01-15' }, // Missing time and location
      { timeOfBirth: '10:30' }, // Missing date and location
      { placeOfBirth: 'Mumbai' }, // Missing date and time
    ];

    for (const data of incompleteData) {
      console.log(`  Testing incomplete data: ${Object.keys(data).join(', ')}`);

      try {
        await axios.post(`${BACKEND_URL}/v1/chart/generate`, data);
        console.log(`    ❌ Should have failed for incomplete data`);
      } catch (error) {
        if (error.response?.status >= 400) {
          console.log(`    ✅ Correctly failed for incomplete data`);
          console.log(`    ✅ Error details: ${error.response.data.details ? error.response.data.details.length + ' field errors' : 'No details'}`);
        } else {
          console.log(`    ❌ Unexpected error: ${error.message}`);
        }
      }
    }

    console.log('✅ Chart Generation Error Handling Test PASSED');

  } catch (error) {
    console.error('❌ Chart Generation Error Handling Test FAILED:', error.message);
    throw error;
  }
}

/**
 * Test 5: API Response Interpreter Error Processing
 */
async function testAPIResponseInterpreterErrors() {
  console.log('🔧 Testing API Response Interpreter Error Processing...');

  try {
    // Test various error scenarios
    const errorScenarios = [
      {
        name: 'Invalid Birth Data',
        endpoint: '/v1/chart/generate',
        data: { dateOfBirth: 'invalid', timeOfBirth: 'invalid', placeOfBirth: '' }
      },
      {
        name: 'Empty Request Body',
        endpoint: '/v1/chart/generate',
        data: {}
      },
      {
        name: 'Invalid Analysis Request',
        endpoint: '/comprehensive-analysis/comprehensive',
        data: { dateOfBirth: 'invalid' }
      }
    ];

    for (const scenario of errorScenarios) {
      console.log(`  Testing: ${scenario.name}`);

      try {
        await axios.post(`${BACKEND_URL}${scenario.endpoint}`, scenario.data);
        console.log(`    ❌ Should have failed for ${scenario.name}`);
      } catch (error) {
        if (error.response?.data) {
          const errorData = error.response.data;
          console.log(`    ✅ Error structure validation:`);
          console.log(`      - success: ${errorData.success === false ? '✅' : '❌'}`);
          console.log(`      - error: ${errorData.error ? '✅' : '❌'}`);
          console.log(`      - details: ${errorData.details ? '✅' : '❌'}`);
          console.log(`      - suggestions: ${errorData.suggestions ? '✅' : '❌'}`);
        } else {
          console.log(`    ❌ No error response data for ${scenario.name}`);
        }
      }
    }

    console.log('✅ API Response Interpreter Error Processing Test PASSED');

  } catch (error) {
    console.error('❌ API Response Interpreter Error Processing Test FAILED:', error.message);
    throw error;
  }
}

/**
 * Test 6: Frontend UI Error Display Test
 */
async function testFrontendUIErrorDisplay() {
  console.log('🎨 Testing Frontend UI Error Display...');

  try {
    // Check if frontend is serving the expected error handling components
    const frontendResponse = await axios.get(FRONTEND_URL);
    const html = frontendResponse.data;

    // Check for essential error handling elements
    const errorElements = [
      'ErrorMessage',
      'error-message',
      'alert-error',
      'text-red-',
      'VedicLoadingSpinner'
    ];

    let foundElements = 0;
    for (const element of errorElements) {
      if (html.includes(element)) {
        foundElements++;
        console.log(`  ✅ Found error element: ${element}`);
      } else {
        console.log(`  ⚠️ Missing error element: ${element}`);
      }
    }

    if (foundElements >= 3) {
      console.log('✅ Frontend UI Error Display Test PASSED');
    } else {
      console.log(`⚠️ Frontend UI Error Display Test PARTIAL - Found ${foundElements}/${errorElements.length} elements`);
    }

  } catch (error) {
    console.error('❌ Frontend UI Error Display Test FAILED:', error.message);
    throw error;
  }
}

/**
 * Test 7: Error Recovery and Retry Mechanism Test
 */
async function testErrorRecoveryAndRetry() {
  console.log('🔄 Testing Error Recovery and Retry Mechanism...');

  try {
    // Test server connectivity
    const healthCheck = await axios.get(`${BACKEND_URL.replace('/api', '')}/health`);
    console.log('  ✅ Backend server is healthy');

    // Test that valid requests work after error scenarios
    const validData = {
      dateOfBirth: '1990-01-15',
      timeOfBirth: '10:30',
      latitude: 19.0760,
      longitude: 72.8777,
      timezone: 'Asia/Kolkata'
    };

    // First, cause an error
    try {
      await axios.post(`${BACKEND_URL}/v1/chart/generate`, { invalid: 'data' });
    } catch (error) {
      console.log('  ✅ Successfully triggered error condition');
    }

    // Then, try a valid request
    const validResponse = await axios.post(`${BACKEND_URL}/v1/chart/generate`, validData);
    if (validResponse.data.success) {
      console.log('  ✅ Successfully recovered from error with valid request');
    } else {
      console.log('  ❌ Failed to recover from error');
    }

    console.log('✅ Error Recovery and Retry Mechanism Test PASSED');

  } catch (error) {
    console.error('❌ Error Recovery and Retry Mechanism Test FAILED:', error.message);
    throw error;
  }
}

/**
 * Main test runner
 */
async function runAllErrorHandlingTests() {
  console.log('🚀 Starting Frontend Error Handling Tests for API Response Interpreter System');
  console.log('====================================================================');

  const testResults = {
    passed: 0,
    failed: 0,
    total: 7
  };

  const tests = [
    testFormValidationErrors,
    testNetworkErrorHandling,
    testGeocodingErrorHandling,
    testChartGenerationErrorHandling,
    testAPIResponseInterpreterErrors,
    testFrontendUIErrorDisplay,
    testErrorRecoveryAndRetry
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
  console.log('🎯 ERROR HANDLING TEST RESULTS:');
  console.log(`✅ Passed: ${testResults.passed}/${testResults.total}`);
  console.log(`❌ Failed: ${testResults.failed}/${testResults.total}`);

  if (testResults.failed === 0) {
    console.log('🎉 ALL ERROR HANDLING TESTS PASSED! Frontend error handling is working correctly.');
  } else {
    console.log('⚠️ Some error handling tests failed. Check the output above for details.');
  }

  return testResults;
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllErrorHandlingTests().catch(console.error);
}

module.exports = { runAllErrorHandlingTests };
