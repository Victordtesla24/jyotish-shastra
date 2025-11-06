/**
 * Chart Generation Fixes Validation Test
 * Date: 2025-11-05
 * 
 * Validates three critical fixes:
 * 1. House system labeled as "Whole Sign" (not "Placidus")
 * 2. Dasha calculations are consistent across services
 * 3. Nakshatra data calculated for all planets
 */

const axios = require('axios');

// Test configuration
const API_BASE_URL = 'http://localhost:3001';
const TEST_BIRTH_DATA = {
  name: "Vikram",
  dateOfBirth: "1985-10-24",
  timeOfBirth: "14:30",
  latitude: 18.5204,
  longitude: 73.8567,
  timezone: "Asia/Kolkata",
  gender: "male"
};

// Expected values based on reference data
const EXPECTED_VALUES = {
  houseSystem: "Whole Sign",
  birthDasha: "Rahu",
  nakshatraLord: "Rahu", // Shatabhisha nakshatra is ruled by Rahu
  currentDashaAtAge40: "Saturn", // Rahu(18y) + Jupiter(16y) + 6y into Saturn
  moonNakshatra: "Shatabhisha",
  sunNakshatra: "Swati" // Sun at ~7° Libra
};

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  errors: []
};

/**
 * Test 1: House System Label Verification
 */
async function testHouseSystemLabel() {
  console.log('\n🧪 TEST 1: House System Label Verification');
  console.log('═══════════════════════════════════════════');
  
  try {
    const response = await axios.post(`${API_BASE_URL}/api/v1/chart/generate`, TEST_BIRTH_DATA);
    const houseSystem = response.data.data.rasiChart.housePositions[0].system;
    
    if (houseSystem === EXPECTED_VALUES.houseSystem) {
      console.log(`✅ PASS: House system correctly labeled as "${houseSystem}"`);
      testResults.passed++;
    } else {
      console.log(`❌ FAIL: House system is "${houseSystem}", expected "${EXPECTED_VALUES.houseSystem}"`);
      testResults.failed++;
      testResults.errors.push(`House system mismatch: got ${houseSystem}, expected ${EXPECTED_VALUES.houseSystem}`);
    }
    
    // Verify all 12 houses use the same system
    const allSystems = response.data.data.rasiChart.housePositions.map(h => h.system);
    const uniqueSystems = [...new Set(allSystems)];
    
    if (uniqueSystems.length === 1 && uniqueSystems[0] === EXPECTED_VALUES.houseSystem) {
      console.log(`✅ PASS: All 12 houses consistently use "${EXPECTED_VALUES.houseSystem}"`);
      testResults.passed++;
    } else {
      console.log(`❌ FAIL: Inconsistent house systems found: ${uniqueSystems.join(', ')}`);
      testResults.failed++;
      testResults.errors.push(`Inconsistent house systems: ${uniqueSystems.join(', ')}`);
    }
    
  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
    testResults.failed += 2;
    testResults.errors.push(`Test 1 error: ${error.message}`);
  }
}

/**
 * Test 2: Dasha Calculation Consistency
 */
async function testDashaConsistency() {
  console.log('\n🧪 TEST 2: Dasha Calculation Consistency');
  console.log('═══════════════════════════════════════════');
  
  try {
    const response = await axios.post(`${API_BASE_URL}/api/v1/chart/generate`, TEST_BIRTH_DATA);
    const data = response.data.data;
    
    // Extract dasha information from both sources
    const dashaInfo = {
      birthDasha: data.dashaInfo.birthDasha,
      nakshatraLord: data.dashaInfo.nakshatraLord,
      currentDasha: data.dashaInfo.currentDasha.planet
    };
    
    const birthDataAnalysis = {
      nakshatraLord: data.birthDataAnalysis.analyses.mahadasha.details?.nakshatraLord,
      startingDasha: data.birthDataAnalysis.analyses.mahadasha.details?.startingDasha,
      currentDasha: data.birthDataAnalysis.analyses.mahadasha.currentDasha?.planet
    };
    
    // Test birth dasha consistency
    if (dashaInfo.birthDasha === EXPECTED_VALUES.birthDasha) {
      console.log(`✅ PASS: Birth dasha is "${dashaInfo.birthDasha}"`);
      testResults.passed++;
    } else {
      console.log(`❌ FAIL: Birth dasha is "${dashaInfo.birthDasha}", expected "${EXPECTED_VALUES.birthDasha}"`);
      testResults.failed++;
      testResults.errors.push(`Birth dasha mismatch: got ${dashaInfo.birthDasha}`);
    }
    
    // Test nakshatra lord consistency (case-insensitive comparison)
    if (dashaInfo.nakshatraLord.toLowerCase() === birthDataAnalysis.nakshatraLord.toLowerCase() &&
        dashaInfo.nakshatraLord.toLowerCase() === EXPECTED_VALUES.nakshatraLord.toLowerCase()) {
      console.log(`✅ PASS: Nakshatra lord consistent: "${dashaInfo.nakshatraLord}" / "${birthDataAnalysis.nakshatraLord}"`);
      testResults.passed++;
    } else {
      console.log(`❌ FAIL: Nakshatra lord inconsistent: dashaInfo="${dashaInfo.nakshatraLord}", birthDataAnalysis="${birthDataAnalysis.nakshatraLord}"`);
      testResults.failed++;
      testResults.errors.push(`Nakshatra lord inconsistency`);
    }
    
    // Test starting dasha consistency
    if (birthDataAnalysis.startingDasha === EXPECTED_VALUES.birthDasha) {
      console.log(`✅ PASS: Starting dasha is "${birthDataAnalysis.startingDasha}"`);
      testResults.passed++;
    } else {
      console.log(`❌ FAIL: Starting dasha is "${birthDataAnalysis.startingDasha}", expected "${EXPECTED_VALUES.birthDasha}"`);
      testResults.failed++;
      testResults.errors.push(`Starting dasha mismatch: got ${birthDataAnalysis.startingDasha}`);
    }
    
    // Test current dasha consistency
    if (dashaInfo.currentDasha === birthDataAnalysis.currentDasha &&
        dashaInfo.currentDasha === EXPECTED_VALUES.currentDashaAtAge40) {
      console.log(`✅ PASS: Current dasha consistent: "${dashaInfo.currentDasha}"`);
      testResults.passed++;
    } else {
      console.log(`❌ FAIL: Current dasha inconsistent: dashaInfo="${dashaInfo.currentDasha}", birthDataAnalysis="${birthDataAnalysis.currentDasha}"`);
      testResults.failed++;
      testResults.errors.push(`Current dasha inconsistency`);
    }
    
  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
    testResults.failed += 4;
    testResults.errors.push(`Test 2 error: ${error.message}`);
  }
}

/**
 * Test 3: Nakshatra Data for All Planets
 */
async function testNakshatraDataCompleteness() {
  console.log('\n🧪 TEST 3: Nakshatra Data for All Planets');
  console.log('═══════════════════════════════════════════');
  
  try {
    const response = await axios.post(`${API_BASE_URL}/api/v1/chart/generate`, TEST_BIRTH_DATA);
    const planetaryPositions = response.data.data.rasiChart.planetaryPositions;
    
    // Define planets that should have nakshatra data
    const planetsToCheck = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'];
    
    let planetsWithNakshatra = 0;
    let planetsMissingNakshatra = [];
    
    planetsToCheck.forEach(planet => {
      if (planetaryPositions[planet] && planetaryPositions[planet].nakshatra) {
        planetsWithNakshatra++;
        console.log(`✅ ${planet}: ${planetaryPositions[planet].nakshatra.name} (pada ${planetaryPositions[planet].nakshatra.pada})`);
      } else {
        planetsMissingNakshatra.push(planet);
        console.log(`❌ ${planet}: Missing nakshatra data`);
      }
    });
    
    // Test: All 9 planets should have nakshatra
    if (planetsWithNakshatra === 9) {
      console.log(`\n✅ PASS: All 9 planets have nakshatra data`);
      testResults.passed++;
    } else {
      console.log(`\n❌ FAIL: Only ${planetsWithNakshatra}/9 planets have nakshatra data`);
      console.log(`Missing: ${planetsMissingNakshatra.join(', ')}`);
      testResults.failed++;
      testResults.errors.push(`Missing nakshatra for: ${planetsMissingNakshatra.join(', ')}`);
    }
    
    // Test: Moon nakshatra should be Shatabhisha
    if (planetaryPositions.moon?.nakshatra?.name === EXPECTED_VALUES.moonNakshatra) {
      console.log(`✅ PASS: Moon nakshatra is "${EXPECTED_VALUES.moonNakshatra}"`);
      testResults.passed++;
    } else {
      console.log(`❌ FAIL: Moon nakshatra is "${planetaryPositions.moon?.nakshatra?.name}", expected "${EXPECTED_VALUES.moonNakshatra}"`);
      testResults.failed++;
      testResults.errors.push(`Moon nakshatra mismatch`);
    }
    
    // Test: Sun nakshatra should be Swati
    if (planetaryPositions.sun?.nakshatra?.name === EXPECTED_VALUES.sunNakshatra) {
      console.log(`✅ PASS: Sun nakshatra is "${EXPECTED_VALUES.sunNakshatra}"`);
      testResults.passed++;
    } else {
      console.log(`❌ FAIL: Sun nakshatra is "${planetaryPositions.sun?.nakshatra?.name}", expected "${EXPECTED_VALUES.sunNakshatra}"`);
      testResults.failed++;
      testResults.errors.push(`Sun nakshatra mismatch`);
    }
    
  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
    testResults.failed += 3;
    testResults.errors.push(`Test 3 error: ${error.message}`);
  }
}

/**
 * Test 4: Integration Test - Complete Chart Accuracy
 */
async function testCompleteChartAccuracy() {
  console.log('\n🧪 TEST 4: Complete Chart Accuracy');
  console.log('═══════════════════════════════════════════');
  
  try {
    const response = await axios.post(`${API_BASE_URL}/api/v1/chart/generate`, TEST_BIRTH_DATA);
    const data = response.data.data;
    
    // Verify key planetary positions (from reference image)
    const expectedPositions = {
      sun: { sign: 'Libra', degreeRange: [7, 8] },
      moon: { sign: 'Aquarius', degreeRange: [19, 20] },
      mars: { sign: 'Virgo', degreeRange: [4, 5] },
      jupiter: { sign: 'Capricorn', degreeRange: [14, 15] },
      saturn: { sign: 'Scorpio', degreeRange: [3, 4] }
    };
    
    let accuratePositions = 0;
    
    for (const [planet, expected] of Object.entries(expectedPositions)) {
      const actual = data.rasiChart.planetaryPositions[planet];
      const degreeInSign = actual.degree % 30;
      
      if (actual.sign === expected.sign &&
          degreeInSign >= expected.degreeRange[0] &&
          degreeInSign <= expected.degreeRange[1]) {
        console.log(`✅ ${planet}: ${actual.sign} ${degreeInSign.toFixed(2)}° (accurate)`);
        accuratePositions++;
      } else {
        console.log(`❌ ${planet}: ${actual.sign} ${degreeInSign.toFixed(2)}° (expected ${expected.sign} ${expected.degreeRange[0]}-${expected.degreeRange[1]}°)`);
      }
    }
    
    if (accuratePositions === Object.keys(expectedPositions).length) {
      console.log(`\n✅ PASS: All ${accuratePositions} tested planetary positions are accurate`);
      testResults.passed++;
    } else {
      console.log(`\n❌ FAIL: Only ${accuratePositions}/${Object.keys(expectedPositions).length} planetary positions are accurate`);
      testResults.failed++;
      testResults.errors.push(`Planetary position inaccuracies detected`);
    }
    
  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
    testResults.failed++;
    testResults.errors.push(`Test 4 error: ${error.message}`);
  }
}

/**
 * Main test runner
 */
async function runAllTests() {
  console.log('\n┌────────────────────────────────────────────────────────┐');
  console.log('│  CHART GENERATION FIXES VALIDATION TEST SUITE         │');
  console.log('│  Date: 2025-11-05                                     │');
  console.log('└────────────────────────────────────────────────────────┘');
  
  console.log('\n📋 Test Configuration:');
  console.log(`   API Base URL: ${API_BASE_URL}`);
  console.log(`   Test Subject: ${TEST_BIRTH_DATA.name}`);
  console.log(`   Birth Data: ${TEST_BIRTH_DATA.dateOfBirth} ${TEST_BIRTH_DATA.timeOfBirth}`);
  console.log(`   Location: ${TEST_BIRTH_DATA.latitude}°N, ${TEST_BIRTH_DATA.longitude}°E`);
  
  // Run all tests
  await testHouseSystemLabel();
  await testDashaConsistency();
  await testNakshatraDataCompleteness();
  await testCompleteChartAccuracy();
  
  // Print summary
  console.log('\n┌────────────────────────────────────────────────────────┐');
  console.log('│  TEST SUMMARY                                         │');
  console.log('└────────────────────────────────────────────────────────┘');
  console.log(`\n✅ PASSED: ${testResults.passed} tests`);
  console.log(`❌ FAILED: ${testResults.failed} tests`);
  console.log(`📊 TOTAL:  ${testResults.passed + testResults.failed} tests`);
  
  if (testResults.failed > 0) {
    console.log('\n❌ ERRORS DETECTED:');
    testResults.errors.forEach((error, index) => {
      console.log(`   ${index + 1}. ${error}`);
    });
    console.log('\n⚠️  FIX REQUIRED: Please address the failures above');
    process.exit(1);
  } else {
    console.log('\n🎉 ALL TESTS PASSED! Chart generation is working correctly.');
    process.exit(0);
  }
}

// Run tests
runAllTests().catch(error => {
  console.error('\n💥 FATAL ERROR:', error.message);
  console.error(error.stack);
  process.exit(1);
});

