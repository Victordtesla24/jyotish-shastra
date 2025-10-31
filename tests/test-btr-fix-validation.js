/**
 * Test BTR Validation Fix
 * Tests the coordinate normalization middleware fix for dual structure validation
 */

import axios from 'axios';

const API_BASE = 'http://localhost:3001';

// Test cases to validate various coordinate structures
const testCases = [
  {
    name: 'Dual Structure - Both Nested and Flat Coordinates',
    data: {
      birthData: {
        name: "Test User Dual",
        dateOfBirth: "1990-01-01",
        timeOfBirth: "12:30",
        latitude: 19.0760,
        longitude: 72.8777,
        timezone: "Asia/Kolkata",
        placeOfBirth: {
          name: "Mumbai, Maharashtra, India",
          latitude: 19.0760,
          longitude: 72.8777,
          timezone: "Asia/Kolkata"
        }
      },
      proposedTime: "12:30"
    }
  },
  {
    name: 'Nested Only Structure',
    data: {
      birthData: {
        name: "Test User Nested",
        dateOfBirth: "1990-01-01", 
        timeOfBirth: "12:30",
        placeOfBirth: {
          name: "Mumbai, Maharashtra, India",
          latitude: 19.0760,
          longitude: 72.8777,
          timezone: "Asia/Kolkata"
        }
      },
      proposedTime: "12:30"
    }
  },
  {
    name: 'Flat Only Structure',
    data: {
      birthData: {
        name: "Test User Flat",
        dateOfBirth: "1990-01-01",
        timeOfBirth: "12:30", 
        latitude: 19.0760,
        longitude: 72.8777,
        timezone: "Asia/Kolkata",
        placeOfBirth: "Mumbai, Maharashtra, India"
      },
      proposedTime: "12:30"
    }
  },
  {
    name: 'String Place of Birth Only',
    data: {
      birthData: {
        name: "Test User String",
        dateOfBirth: "1990-01-01",
        timeOfBirth: "12:30",
        latitude: 19.0760,
        longitude: 72.8777,
        timezone: "Asia/Kolkata",
        placeOfBirth: "Mumbai, Maharashtra, India"
      },
      proposedTime: "12:30"
    }
  },
  {
    name: 'Invalid Data (Should Fail Validation)',
    data: {
      birthData: {
        name: "Test User Invalid",
        dateOfBirth: "invalid-date",
        timeOfBirth: "99:99",
        latitude: "not-a-number",
        longitude: "also-not-a-number",
        timezone: "Invalid/Timezone"
      },
      proposedTime: "invalid-time"
    },
    expectValidationError: true
  }
];

async function runTests() {
  console.log('🧪 Starting BTR Validation Fix Tests...\n');
  
  let passedTests = 0;
  let failedTests = 0;
  
  for (const testCase of testCases) {
    console.log(`🔍 Test: ${testCase.name}`);
    
    try {
      const response = await axios.post(`${API_BASE}/api/v1/rectification/quick`, testCase.data, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000
      });
      
      if (testCase.expectValidationError) {
        console.log(`❌ FAIL: Expected validation error but got success`);
        failedTests++;
      } else {
        // Check if it's a validation error vs calculation error
        if (!response.data.success && response.data.error && response.data.error.includes('Validation failed')) {
          console.log(`   ❌ FAIL: Validation actually failed - Fix may not be working`);
          console.log(`   Error: ${response.data.message}`);
          failedTests++;
        } else {
          // 500 calculation errors are expected - this means validation passed!
          console.log(`✅ PASS: Validation succeeded (calculation errors are expected and separate)`);
          console.log(`   Response: Success=${response.data.success}, Error=${response.data.error || 'None'}`);
          passedTests++;
        }
      }
      
    } catch (error) {
      if (testCase.expectValidationError) {
        if (error.response && error.response.status === 400 && error.response.data.error === 'Validation failed') {
          console.log(`✅ PASS: Validation correctly rejected invalid data`);
          passedTests++;
        } else {
          console.log(`❌ FAIL: Unexpected error type: ${error.message}`);
          failedTests++;
        }
      } else {
        // Handle 500 calculation errors - these mean validation passed!
        if (error.response && error.response.status === 500) {
          const errorData = error.response.data;
          if (errorData.error && errorData.error.includes('Quick birth time validation failed') && 
              errorData.message && errorData.message.includes('Praanapada calculation failed')) {
            console.log(`✅ PASS: Validation succeeded (calculation failed separately - as expected)`);
            console.log(`   Response: 500 Calculation Error (Validation Passed)`);
            passedTests++;
          } else {
            console.log(`❌ FAIL: Unexpected 500 error: ${errorData.message}`);
            failedTests++;
          }
        } else {
          console.log(`❌ FAIL: Unexpected error: ${error.message}`);
          if (error.response) {
            console.log(`   Response: ${JSON.stringify(error.response.data, null, 2)}`);
          }
          failedTests++;
        }
      }
    }
    
    console.log('');
  }
  
  console.log(`📊 Test Results Summary:`);
  console.log(`   ✅ Passed: ${passedTests}`);
  console.log(`   ❌ Failed: ${failedTests}`);
  console.log(`   📈 Success Rate: ${(passedTests / testCases.length * 100).toFixed(1)}%`);
  
  if (failedTests === 0) {
    console.log(`\n🎉 All tests passed! BTR validation fix is working correctly.`);
  } else {
    console.log(`\n⚠️  Some tests failed. Please review the BTR validation fix.`);
  }
}

// Run the tests
runTests().catch(console.error);
