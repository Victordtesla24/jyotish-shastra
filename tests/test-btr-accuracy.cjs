/**
 * BTR Accuracy Test
 * Tests Birth Time Rectification accuracy against known test cases
 * 
 * Test Case: Pune 1985-10-24 02:30 (Golden Case)
 * Expected: Rectified time 14:30 with 85% confidence
 */

const axios = require('axios');
const path = require('path');
const fs = require('fs');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';
const FIXTURE_PATH = path.join(__dirname, '../fixtures/btr/pune_1985-10-24_0230.json');

// Load test fixture
const testFixture = JSON.parse(fs.readFileSync(FIXTURE_PATH, 'utf8'));

/**
 * Test BTR accuracy against expected results
 */
async function testBTRAccuracy() {
  console.log('🧪 BTR Accuracy Test Starting...\n');
  console.log('Test Case:', testFixture.description);
  console.log('Input Birth Data:', testFixture.inputBirthData);
  console.log('Expected Rectification:', testFixture.expectedRectification);
  console.log('---\n');

  const results = {
    testCase: testFixture.description,
    input: testFixture.inputBirthData,
    expected: testFixture.expectedRectification,
    actual: null,
    accuracy: {
      timeAccuracy: null,
      confidenceAccuracy: null,
      methodAccuracy: {},
      overall: null
    },
    errors: [],
    warnings: []
  };

  try {
    // Prepare API request - API expects birthData object and lifeEvents array
    const requestData = {
      birthData: {
        dateOfBirth: testFixture.inputBirthData.dateOfBirth,
        timeOfBirth: testFixture.inputBirthData.timeOfBirth,
        latitude: testFixture.inputBirthData.latitude,
        longitude: testFixture.inputBirthData.longitude,
        timezone: testFixture.inputBirthData.timezone,
        placeOfBirth: testFixture.inputBirthData.placeOfBirth
      },
      lifeEvents: (testFixture.lifeEvents || []).map(event => ({
        date: event.date,
        description: event.description
      }))
    };

    console.log('📡 Calling BTR API endpoint: /api/v1/rectification/with-events');
    console.log('Request Data:', JSON.stringify(requestData, null, 2));
    console.log('---\n');

    // Call BTR API
    const response = await axios.post(
      `${API_BASE_URL}/api/v1/rectification/with-events`,
      requestData,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      }
    );

    if (response.status !== 200) {
      throw new Error(`API returned status ${response.status}`);
    }

    results.actual = response.data;

    // Extract rectification data from nested structure
    const rectification = results.actual.rectification || results.actual.data?.rectification || results.actual;

    console.log('✅ API Response Received');
    // Suppress verbose JSON output - only show key fields
    console.log('Response Summary:', {
      success: results.actual.success,
      rectifiedTime: rectification.rectifiedTime,
      confidence: rectification.confidence,
      hasMethods: !!rectification.methods
    });
    console.log('---\n');
    
    // Validate response structure
    if (!rectification.rectifiedTime) {
      results.errors.push('Missing rectifiedTime in response');
    }
    if (rectification.confidence === undefined) {
      results.errors.push('Missing confidence in response');
    }

    // Test 1: Time Accuracy
    if (rectification.rectifiedTime && results.expected.rectifiedTime) {
      const actualTime = parseTime(rectification.rectifiedTime);
      const expectedTime = parseTime(results.expected.rectifiedTime);
      const timeDiff = Math.abs(actualTime - expectedTime); // minutes difference
      
      results.accuracy.timeAccuracy = {
        actual: rectification.rectifiedTime,
        expected: results.expected.rectifiedTime,
        difference: timeDiff,
        threshold: 5, // 5 minutes tolerance
        passed: timeDiff <= 5
      };

      console.log('⏰ Time Accuracy Test:');
      console.log(`  Actual: ${rectification.rectifiedTime}`);
      console.log(`  Expected: ${results.expected.rectifiedTime}`);
      console.log(`  Difference: ${timeDiff} minutes`);
      console.log(`  Threshold: 5 minutes`);
      console.log(`  Result: ${results.accuracy.timeAccuracy.passed ? '✅ PASSED' : '❌ FAILED'}`);
      console.log('---\n');
    }

    // Test 2: Confidence Accuracy
    if (rectification.confidence !== undefined && results.expected.confidence !== undefined) {
      // Convert percentage to decimal if needed
      const actualConf = typeof rectification.confidence === 'number' 
        ? (rectification.confidence > 1 ? rectification.confidence / 100 : rectification.confidence)
        : 0;
      const expectedConf = results.expected.confidence;
      const confDiff = Math.abs(actualConf - expectedConf);
      const threshold = 0.10; // 10% tolerance

      results.accuracy.confidenceAccuracy = {
        actual: actualConf,
        expected: expectedConf,
        difference: confDiff,
        threshold: threshold,
        passed: confDiff <= threshold
      };

      console.log('📊 Confidence Accuracy Test:');
      console.log(`  Actual: ${(actualConf * 100).toFixed(2)}%`);
      console.log(`  Expected: ${(expectedConf * 100).toFixed(2)}%`);
      console.log(`  Difference: ${(confDiff * 100).toFixed(2)}%`);
      console.log(`  Threshold: ${(threshold * 100).toFixed(0)}%`);
      console.log(`  Result: ${results.accuracy.confidenceAccuracy.passed ? '✅ PASSED' : '❌ FAILED'}`);
      console.log('---\n');
    }

    // Test 3: Method Accuracy (if methods are returned)
    if (rectification.methods && results.expected.bphsMethods) {
      console.log('🔬 Method Accuracy Tests:');
      
      for (const [methodName, expectedMethod] of Object.entries(results.expected.bphsMethods)) {
        if (rectification.methods[methodName]) {
          const actualMethod = rectification.methods[methodName];
          const actualTime = parseTime(actualMethod.rectifiedTime || actualMethod.time || actualMethod.bestCandidate?.time);
          const expectedTime = parseTime(expectedMethod.rectifiedTime);
          const timeDiff = Math.abs(actualTime - expectedTime);

          results.accuracy.methodAccuracy[methodName] = {
            actual: actualMethod.rectifiedTime || actualMethod.time || actualMethod.bestCandidate?.time,
            expected: expectedMethod.rectifiedTime,
            difference: timeDiff,
            threshold: 5,
            passed: timeDiff <= 5
          };

          console.log(`  ${methodName}:`);
          console.log(`    Actual: ${actualMethod.rectifiedTime || actualMethod.time}`);
          console.log(`    Expected: ${expectedMethod.rectifiedTime}`);
          console.log(`    Difference: ${timeDiff} minutes`);
          console.log(`    Result: ${results.accuracy.methodAccuracy[methodName].passed ? '✅ PASSED' : '❌ FAILED'}`);
        }
      }
      console.log('---\n');
    }

    // Overall Accuracy Assessment
    const allTests = [
      results.accuracy.timeAccuracy?.passed,
      results.accuracy.confidenceAccuracy?.passed,
      ...Object.values(results.accuracy.methodAccuracy).map(m => m?.passed)
    ].filter(t => t !== undefined);

    const passedTests = allTests.filter(t => t === true).length;
    const totalTests = allTests.length;
    const passRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

    results.accuracy.overall = {
      passedTests,
      totalTests,
      passRate,
      passed: passRate >= 80 // 80% pass rate required
    };

    console.log('📈 Overall Accuracy Assessment:');
    console.log(`  Passed Tests: ${passedTests}/${totalTests}`);
    console.log(`  Pass Rate: ${passRate.toFixed(2)}%`);
    console.log(`  Required: 80%`);
    console.log(`  Result: ${results.accuracy.overall.passed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log('---\n');

    // Summary
    console.log('📋 Test Summary:');
    if (results.errors.length > 0) {
      console.log('  ❌ Errors:', results.errors);
    }
    if (results.warnings.length > 0) {
      console.log('  ⚠️  Warnings:', results.warnings);
    }
    console.log(`  Overall: ${results.accuracy.overall.passed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log('---\n');

    return results;

  } catch (error) {
    console.error('❌ BTR Accuracy Test Failed:', error.message);
    if (error.response) {
      console.error('  Response Status:', error.response.status);
      console.error('  Response Data:', JSON.stringify(error.response.data, null, 2));
    }
    results.errors.push(error.message);
    throw error;
  }
}

/**
 * Parse time string (HH:MM or HH:MM:SS) to minutes since midnight
 */
function parseTime(timeStr) {
  if (!timeStr) return 0;
  
  const parts = timeStr.split(':');
  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  
  return hours * 60 + minutes;
}

// Run test
if (require.main === module) {
  testBTRAccuracy()
    .then(results => {
      console.log('✅ BTR Accuracy Test Completed');
      process.exit(results.accuracy.overall?.passed ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ BTR Accuracy Test Failed:', error);
      process.exit(1);
    });
}

module.exports = { testBTRAccuracy };

