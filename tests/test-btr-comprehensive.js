/**
 * Comprehensive BTR (Birth Time Rectification) Test Suite
 * Tests all BTR endpoints with production-grade validation
 */

import axios from 'axios';

const API_BASE = 'http://localhost:3001/api/v1/rectification';
const TEST_DATA = {
  validBirthData: {
    dateOfBirth: "1997-12-18",
    timeOfBirth: "02:30",
    placeOfBirth: "Sialkot, Pakistan",
    latitude: 32.4935378,
    longitude: 74.5411575,
    timezone: "Asia/Karachi"
  },
  validLifeEvents: [
    { date: "2020-01-15", description: "Started new job" },
    { date: "2018-06-20", description: "Graduated from university" }
  ]
};

// Test results tracker
const testResults = {
  passed: 0,
  failed: 0,
  errors: []
};

// Test helper function
async function runTest(testName, testFunction) {
  try {
    console.log(`\n🧪 Running ${testName}...`);
    const result = await testFunction();
    if (result.success) {
      console.log(`✅ ${testName} - PASSED`);
      testResults.passed++;
      if (result.data) {
        console.log(`📊 Response sample:`, JSON.stringify(result.data, null, 2).substring(0, 300) + '...');
      }
    } else {
      console.log(`❌ ${testName} - FAILED: ${result.error}`);
      testResults.failed++;
      testResults.errors.push({ test: testName, error: result.error });
    }
  } catch (error) {
    console.log(`💥 ${testName} - ERROR: ${error.message}`);
    testResults.failed++;
    testResults.errors.push({ test: testName, error: error.message });
  }
}

// Test 1: BTR Service Health Check
async function testBTRHealth() {
  try {
    const response = await axios.get(`${API_BASE}/test`);
    
    if (response.status === 200 && response.data.success) {
      return { success: true, data: response.data };
    } else {
      return { success: false, error: 'Health check returned unexpected response' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Test 2: Get Available Methods
async function testGetMethods() {
  try {
    const response = await axios.post(`${API_BASE}/methods`, {});
    
    if (response.status === 200 && response.data.success) {
      const methods = response.data.methods;
      const expectedMethods = ['praanapada', 'moon', 'gulika', 'events'];
      
      for (const method of expectedMethods) {
        if (!methods[method]) {
          return { success: false, error: `Missing method: ${method}` };
        }
      }
      
      return { success: true, data: response.data };
    } else {
      return { success: false, error: 'Methods endpoint failed' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Test 3: Quick Validation
async function testQuickValidation() {
  try {
    const response = await axios.post(`${API_BASE}/quick`, {
      birthData: TEST_DATA.validBirthData,
      proposedTime: "02:30"
    });
    
    if (response.status === 200 && response.data.success) {
      const validation = response.data.validation;
      
      // Check required fields
      if (!validation.proposedTime || validation.confidence === undefined) {
        return { success: false, error: 'Quick validation missing required fields' };
      }
      
      // Check if confidence is a valid percentage
      if (typeof validation.confidence !== 'number' || validation.confidence < 0 || validation.confidence > 100) {
        return { success: false, error: 'Invalid confidence value' };
      }
      
      // Check Praanapada calculation is present (real calculation)
      if (!validation.praanapada || !validation.ascendant) {
        return { success: false, error: 'Praanapada calculation not performed' };
      }
      
      // Check alignment score
      if (validation.alignmentScore === undefined) {
        return { success: false, error: 'Alignment score not calculated' };
      }
      
      return { success: true, data: response.data };
    } else {
      return { success: false, error: 'Quick validation failed' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Test 4: Full Analysis (without events)
async function testFullAnalysis() {
  try {
    const response = await axios.post(`${API_BASE}/analyze`, {
      birthData: TEST_DATA.validBirthData,
      options: {
        methods: ['praanapada', 'moon', 'gulika']
      }
    });
    
    if (response.status === 200 && response.data.success) {
      const rectification = response.data.rectification;
      
      // Check required structure
      if (!rectification.methods || rectification.confidence === undefined) {
        return { success: false, error: 'Full analysis missing required fields' };
      }
      
      // Check method results
      const methods = ['praanapada', 'moon', 'gulika'];
      for (const method of methods) {
        if (!rectification.methods[method]) {
          return { success: false, error: `Missing method result: ${method}` };
        }
        
        // Check if methods have candidates arrays
        if (!Array.isArray(rectification.methods[method].candidates)) {
          return { success: false, error: `Missing candidates for method: ${method}` };
        }
      }
      
      // Check confidence range
      if (typeof rectification.confidence !== 'number' || rectification.confidence < 0 || rectification.confidence > 100) {
        return { success: false, error: 'Invalid confidence value in full analysis' };
      }
      
      // Check for rectified time
      if (!rectification.rectifiedTime) {
        return { success: false, error: 'Missing rectified time' };
      }
      
      return { success: true, data: response.data };
    } else {
      return { success: false, error: 'Full analysis failed' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Test 5: Full Analysis with Events
async function testFullAnalysisWithEvents() {
  try {
    const response = await axios.post(`${API_BASE}/with-events`, {
      birthData: TEST_DATA.validBirthData,
      lifeEvents: TEST_DATA.validLifeEvents,
      options: {
        methods: ['praanapada', 'moon', 'gulika', 'events']
      }
    });
    
    if (response.status === 200 && response.data.success) {
      const data = response.data;
      
      // Check events-specific fields
      if (!data.lifeEvents || data.correlationScore === undefined) {
        return { success: false, error: 'Events analysis missing required fields' };
      }
      
      // Check events method in results
      if (!data.rectification.methods.events) {
        return { success: false, error: 'Events method not executed' };
      }
      
      // Check correlation score range
      if (typeof data.correlationScore !== 'number' || data.correlationScore < 0 || data.correlationScore > 100) {
        return { success: false, error: 'Invalid correlation score value' };
      }
      
      return { success: true, data: response.data };
    } else {
      return { success: false, error: 'Events analysis failed' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Test 6: Invalid Input Validation
async function testInvalidInputs() {
  const tests = [
    {
      name: 'Missing birth data',
      payload: {},
      expectedError: 'Birth data is required'
    },
    {
      name: 'Invalid time format',
      payload: {
        birthData: { ...TEST_DATA.validBirthData, timeOfBirth: "25:99" }
      },
      endpoint: 'quick',
      expectedError: 'validation'
    }
  ];
  
  for (const test of tests) {
    try {
      const endpoint = test.endpoint || 'analyze';
      const response = await axios.post(`${API_BASE}/${endpoint}`, test.payload);
      
      // Should get validation error
      if (response.status === 400) {
        continue; // Expected
      } else {
        return { 
          success: false, 
          error: `Expected validation error for: ${test.name}` 
        };
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        continue; // Expected validation error
      } else {
        return { 
          success: false, 
          error: `Unexpected error for ${test.name}: ${error.message}` 
        };
      }
    }
  }
  
  return { success: true };
}

// Test 7: Data Structure Validation
async function testDataStructures() {
  try {
    // Test full analysis and validate response structure
    const response = await axios.post(`${API_BASE}/analyze`, {
      birthData: TEST_DATA.validBirthData,
      options: { methods: ['praanapada'] }
    });
    
    if (response.status !== 200 || !response.data.success) {
      return { success: false, error: 'Analysis request failed' };
    }
    
    const rectification = response.data.rectification;
    
    // Validate deep structure
    const requiredTopLevel = ['originalData', 'methods', 'confidence', 'analysisLog'];
    for (const field of requiredTopLevel) {
      if (!(field in rectification)) {
        return { success: false, error: `Missing top-level field: ${field}` };
      }
    }
    
    // Validate praanapada method structure
    const praanapada = rectification.methods.praanapada;
    if (!praanapada.candidates || !Array.isArray(praanapada.candidates)) {
      return { success: false, error: 'Praanapada candidates not an array' };
    }
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Comprehensive BTR Test Suite');
  console.log('==========================================');
  
  await runTest('BTR Health Check', testBTRHealth);
  await runTest('Get Available Methods', testGetMethods);
  await runTest('Quick Validation', testQuickValidation);
  await runTest('Full Analysis', testFullAnalysis);
  await runTest('Full Analysis with Events', testFullAnalysisWithEvents);
  await runTest('Invalid Input Validation', testInvalidInputs);
  await runTest('Data Structure Validation', testDataStructures);
  
  // Print summary
  console.log('\n==========================================');
  console.log('📊 TEST SUMMARY');
  console.log('==========================================');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
  
  if (testResults.errors.length > 0) {
    console.log('\n🔍 ERROR DETAILS:');
    testResults.errors.forEach(error => {
      console.log(`❌ ${error.test}: ${error.error}`);
    });
  }
  
  return testResults.failed === 0;
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  });
}

export { runAllTests, runTest };
