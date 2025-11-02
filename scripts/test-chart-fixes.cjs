#!/usr/bin/env node

/**
 * Comprehensive test script for chart fixes
 * Tests rasi numbers and planetary positions display
 */

const http = require('http');

const BIRTH_DATA = {
  name: "Farhan",
  dateOfBirth: "1997-12-18",
  timeOfBirth: "22:00:00",
  placeOfBirth: "Sialkot, Pakistan",
  latitude: 32.4935378,
  longitude: 74.5411575,
  timezone: "Asia/Karachi"
};

function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          reject(new Error(`Failed to parse JSON: ${e.message}`));
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testChartGeneration() {
  console.log('\n🧪 Testing Chart Generation with Fixes...\n');
  
  try {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/v1/chart/generate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const response = await makeRequest(options, BIRTH_DATA);
    
    if (response.status !== 200) {
      throw new Error(`API returned status ${response.status}: ${JSON.stringify(response.data)}`);
    }
    
    if (!response.data.success) {
      throw new Error(`API returned error: ${JSON.stringify(response.data)}`);
    }
    
    const chartData = response.data.data;
    const rasiChart = chartData.rasiChart;
    
    console.log('✅ Chart generated successfully\n');
    
    // Test 1: Verify housePositions array exists and has 12 houses
    console.log('📊 Test 1: Verifying housePositions array...');
    if (!rasiChart.housePositions || !Array.isArray(rasiChart.housePositions)) {
      throw new Error('❌ housePositions is missing or not an array');
    }
    if (rasiChart.housePositions.length !== 12) {
      throw new Error(`❌ housePositions has ${rasiChart.housePositions.length} houses, expected 12`);
    }
    console.log(`✅ housePositions array has ${rasiChart.housePositions.length} houses\n`);
    
    // Test 2: Verify each house has required properties
    console.log('📊 Test 2: Verifying house structure...');
    for (let i = 0; i < rasiChart.housePositions.length; i++) {
      const house = rasiChart.housePositions[i];
      if (!house.houseNumber || house.houseNumber !== (i + 1)) {
        throw new Error(`❌ House ${i + 1} has incorrect houseNumber: ${house.houseNumber}`);
      }
      if (!house.sign) {
        throw new Error(`❌ House ${i + 1} is missing sign`);
      }
      if (!house.signId || house.signId < 1 || house.signId > 12) {
        throw new Error(`❌ House ${i + 1} has invalid signId: ${house.signId}`);
      }
      console.log(`  ✅ House ${house.houseNumber}: ${house.sign} (signId: ${house.signId})`);
    }
    console.log('✅ All houses have correct structure\n');
    
    // Test 3: Verify ascendant data
    console.log('📊 Test 3: Verifying ascendant data...');
    if (!rasiChart.ascendant) {
      throw new Error('❌ Ascendant data is missing');
    }
    if (!rasiChart.ascendant.sign) {
      throw new Error('❌ Ascendant sign is missing');
    }
    if (typeof rasiChart.ascendant.longitude !== 'number') {
      throw new Error(`❌ Ascendant longitude is invalid: ${rasiChart.ascendant.longitude}`);
    }
    if (rasiChart.ascendant.degree === undefined || rasiChart.ascendant.degree === null) {
      throw new Error('❌ Ascendant degree is missing');
    }
    console.log(`  ✅ Ascendant: ${rasiChart.ascendant.sign} ${rasiChart.ascendant.degree.toFixed(2)}°`);
    console.log(`  ✅ Ascendant longitude: ${rasiChart.ascendant.longitude.toFixed(2)}`);
    console.log(`  ✅ Ascendant signId: ${rasiChart.ascendant.signId}`);
    console.log('✅ Ascendant data is valid\n');
    
    // Test 4: Verify planetaryPositions structure
    console.log('📊 Test 4: Verifying planetaryPositions...');
    if (!rasiChart.planetaryPositions || typeof rasiChart.planetaryPositions !== 'object') {
      throw new Error('❌ planetaryPositions is missing or invalid');
    }
    
    const requiredPlanets = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'];
    const planetsFound = [];
    
    for (const planetKey of requiredPlanets) {
      const planet = rasiChart.planetaryPositions[planetKey];
      if (!planet) {
        console.warn(`  ⚠️ Planet ${planetKey} is missing`);
        continue;
      }
      
      if (typeof planet.longitude !== 'number') {
        throw new Error(`❌ Planet ${planetKey} has invalid longitude: ${planet.longitude}`);
      }
      
      if (planet.degree === undefined || planet.degree === null) {
        throw new Error(`❌ Planet ${planetKey} is missing degree`);
      }
      
      if (!planet.sign) {
        throw new Error(`❌ Planet ${planetKey} is missing sign`);
      }
      
      planetsFound.push({
        name: planetKey,
        degree: planet.degree,
        sign: planet.sign,
        longitude: planet.longitude,
        house: planet.house
      });
      
      console.log(`  ✅ ${planetKey}: ${planet.sign} ${planet.degree.toFixed(2)}° (longitude: ${planet.longitude.toFixed(2)})`);
    }
    
    console.log(`✅ Found ${planetsFound.length} planets with valid data\n`);
    
    // Test 5: Verify rasi number mapping
    console.log('📊 Test 5: Verifying rasi number mapping...');
    const houseToRasiMap = {};
    rasiChart.housePositions.forEach(house => {
      houseToRasiMap[house.houseNumber] = house.sign;
    });
    
    console.log('  Rasi mapping by house:');
    for (let i = 1; i <= 12; i++) {
      if (!houseToRasiMap[i]) {
        throw new Error(`❌ House ${i} is missing from houseToRasiMap`);
      }
      console.log(`    House ${i}: ${houseToRasiMap[i]}`);
    }
    console.log('✅ Rasi number mapping is complete\n');
    
    // Test 6: Verify planetary degrees are valid (0-29)
    console.log('📊 Test 6: Verifying planetary degrees are in valid range (0-29)...');
    for (const planet of planetsFound) {
      const degreeFloor = Math.floor(planet.degree);
      if (degreeFloor < 0 || degreeFloor > 29) {
        throw new Error(`❌ Planet ${planet.name} has invalid degree: ${planet.degree} (should be 0-29)`);
      }
      console.log(`  ✅ ${planet.name}: ${degreeFloor}°`);
    }
    console.log('✅ All planetary degrees are in valid range\n');
    
    // Test 7: Verify house assignment (if available)
    console.log('📊 Test 7: Verifying house assignments...');
    let planetsWithHouses = 0;
    for (const planet of planetsFound) {
      if (planet.house !== null && planet.house !== undefined) {
        if (planet.house < 1 || planet.house > 12) {
          throw new Error(`❌ Planet ${planet.name} has invalid house: ${planet.house}`);
        }
        console.log(`  ✅ ${planet.name}: House ${planet.house}`);
        planetsWithHouses++;
      } else {
        console.log(`  ⚠️ ${planet.name}: House not assigned (will be calculated from longitude)`);
      }
    }
    console.log(`✅ House assignment check complete (${planetsWithHouses}/${planetsFound.length} planets have house assignments)\n`);
    
    console.log('🎉 All tests passed! Chart data is valid and ready for display.\n');
    
    return { success: true, chartData };
    
  } catch (error) {
    console.error(`\n❌ Test failed: ${error.message}\n`);
    console.error(error.stack);
    return { success: false, error: error.message };
  }
}

// Run tests
if (require.main === module) {
  testChartGeneration()
    .then((result) => {
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { testChartGeneration };

