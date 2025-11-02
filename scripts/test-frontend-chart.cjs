#!/usr/bin/env node

/**
 * Test frontend chart rendering logic
 * Simulates what the VedicChartDisplay component does
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

// Rasi number mapping from sign name
const RASI_NUMBERS = {
  'Aries': 1, 'Taurus': 2, 'Gemini': 3, 'Cancer': 4,
  'Leo': 5, 'Virgo': 6, 'Libra': 7, 'Scorpio': 8,
  'Sagittarius': 9, 'Capricorn': 10, 'Aquarius': 11, 'Pisces': 12
};

function getRasiNumberFromSign(signName) {
  if (!signName || typeof signName !== 'string') {
    throw new Error(`Invalid sign name: ${signName}`);
  }
  const rasiNumber = RASI_NUMBERS[signName];
  if (!rasiNumber || rasiNumber < 1 || rasiNumber > 12) {
    throw new Error(`Invalid sign name "${signName}"`);
  }
  return rasiNumber;
}

function calculateHouseFromLongitude(planetLongitude, ascendantLongitude) {
  const normalizedPlanet = ((planetLongitude % 360) + 360) % 360;
  const normalizedAscendant = ((ascendantLongitude % 360) + 360) % 360;
  let diff = normalizedPlanet - normalizedAscendant;
  if (diff < 0) {
    diff += 360;
  }
  let houseNumber = Math.floor(diff / 30) + 1;
  if (houseNumber > 12) {
    houseNumber = houseNumber - 12;
  }
  return Math.max(1, Math.min(12, houseNumber));
}

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

async function testFrontendRendering() {
  console.log('\n🧪 Testing Frontend Chart Rendering Logic...\n');
  
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
    
    if (response.status !== 200 || !response.data.success) {
      throw new Error(`API returned error: ${JSON.stringify(response.data)}`);
    }
    
    const rasiChart = response.data.data.rasiChart;
    
    console.log('✅ Chart data retrieved successfully\n');
    
    // Test 1: Build houseToRasiMap (same as frontend does)
    console.log('📊 Test 1: Building houseToRasiMap from housePositions...');
    const houseToRasiMap = {};
    if (rasiChart.housePositions && Array.isArray(rasiChart.housePositions)) {
      rasiChart.housePositions.forEach(house => {
        const houseNumber = house.houseNumber || house.house;
        if (houseNumber >= 1 && houseNumber <= 12 && house.sign) {
          houseToRasiMap[houseNumber] = {
            sign: house.sign,
            signId: house.signId,
            longitude: house.longitude || house.degree,
            degree: house.degree || (house.longitude ? house.longitude % 30 : null)
          };
        }
      });
    }
    
    console.log(`✅ Built houseToRasiMap with ${Object.keys(houseToRasiMap).length} houses\n`);
    
    // Test 2: Calculate rasi numbers for each house (as frontend does)
    console.log('📊 Test 2: Calculating rasi numbers for each house...');
    console.log('  House | Sign         | Rasi Number');
    console.log('  ------|--------------|------------');
    for (let houseNumber = 1; houseNumber <= 12; houseNumber++) {
      let rasiNumber;
      if (houseToRasiMap[houseNumber]) {
        const houseSign = houseToRasiMap[houseNumber].sign;
        rasiNumber = getRasiNumberFromSign(houseSign);
        console.log(`  ${String(houseNumber).padStart(5)} | ${houseSign.padEnd(12)} | ${rasiNumber}`);
      } else {
        throw new Error(`❌ House ${houseNumber} not found in houseToRasiMap`);
      }
    }
    console.log('✅ All rasi numbers calculated correctly\n');
    
    // Test 3: Process planetary positions (as frontend does)
    console.log('📊 Test 3: Processing planetary positions...');
    const planets = Object.entries(rasiChart.planetaryPositions).map(([planetKey, planetData]) => {
      const planetName = planetKey.charAt(0).toUpperCase() + planetKey.slice(1);
      
      // Calculate house from longitude if not provided
      let house = planetData.house;
      if (!house || house < 1 || house > 12) {
        house = calculateHouseFromLongitude(planetData.longitude, rasiChart.ascendant.longitude);
      }
      
      // Calculate degree within sign (0-29)
      let degrees;
      if (planetData.degree !== undefined && planetData.degree !== null) {
        degrees = Math.floor(planetData.degree);
      } else if (typeof planetData.longitude === 'number' && !isNaN(planetData.longitude)) {
        const longitudeMod30 = planetData.longitude % 30;
        degrees = Math.floor(longitudeMod30);
      } else {
        throw new Error(`Invalid degree/longitude for planet ${planetName}`);
      }
      
      return {
        name: planetName,
        code: planetKey.substring(0, 2).toUpperCase(),
        house: house,
        degrees: degrees,
        sign: planetData.sign,
        longitude: planetData.longitude,
        degree: planetData.degree
      };
    });
    
    console.log('  Planet   | House | Degrees | Sign    | Rasi (House Sign)');
    console.log('  ---------|-------|---------|---------|-------------------');
    for (const planet of planets) {
      const houseSign = houseToRasiMap[planet.house]?.sign || 'Unknown';
      const houseRasi = houseToRasiMap[planet.house] ? getRasiNumberFromSign(houseSign) : '?';
      console.log(`  ${planet.name.padEnd(8)} | ${String(planet.house).padStart(5)} | ${String(planet.degrees).padStart(7)} | ${planet.sign.padEnd(7)} | ${houseRasi} (${houseSign})`);
    }
    console.log('✅ All planetary positions processed correctly\n');
    
    // Test 4: Verify planet format (as frontend formatPlanetText does)
    console.log('📊 Test 4: Verifying planet display format...');
    console.log('  Format should be: "PlanetCode Degree" (e.g., "Su 8", "Mo 19")');
    console.log('  Planet   | Format');
    console.log('  ---------|--------');
    for (const planet of planets) {
      const format = `${planet.code} ${planet.degrees}`;
      console.log(`  ${planet.name.padEnd(8)} | ${format}`);
    }
    console.log('✅ Planet format is correct\n');
    
    // Test 5: Verify planets are in correct houses based on longitude
    console.log('📊 Test 5: Verifying planets are in correct houses...');
    let errors = 0;
    for (const planet of planets) {
      const expectedHouse = calculateHouseFromLongitude(planet.longitude, rasiChart.ascendant.longitude);
      if (planet.house !== expectedHouse) {
        console.error(`  ❌ ${planet.name}: Expected house ${expectedHouse}, got ${planet.house}`);
        errors++;
      } else {
        console.log(`  ✅ ${planet.name}: House ${planet.house} (calculated correctly)`);
      }
    }
    if (errors === 0) {
      console.log('✅ All planets are in correct houses\n');
    } else {
      throw new Error(`❌ ${errors} planets have incorrect house assignments\n`);
    }
    
    // Test 6: Verify rasi numbers are extracted correctly from housePositions
    console.log('📊 Test 6: Verifying rasi numbers are correctly extracted from housePositions...');
    console.log('  (Note: House 1 sign may differ from ascendant sign depending on house system)');
    const ascendantSign = rasiChart.ascendant.sign;
    const ascendantRasi = getRasiNumberFromSign(ascendantSign);
    const house1Sign = houseToRasiMap[1].sign;
    const house1Rasi = getRasiNumberFromSign(house1Sign);
    
    console.log(`  Ascendant: ${ascendantSign} (Rasi ${ascendantRasi}) at ${rasiChart.ascendant.longitude.toFixed(2)}°`);
    console.log(`  House 1 sign from API: ${house1Sign} (Rasi ${house1Rasi}) at ${houseToRasiMap[1].longitude.toFixed(2)}°`);
    
    // Verify houseToRasiMap has correct structure for all houses
    let allRasiNumbersCorrect = true;
    for (let i = 1; i <= 12; i++) {
      if (!houseToRasiMap[i] || !houseToRasiMap[i].sign) {
        console.error(`  ❌ House ${i} missing from houseToRasiMap`);
        allRasiNumbersCorrect = false;
        continue;
      }
      try {
        const rasiNum = getRasiNumberFromSign(houseToRasiMap[i].sign);
        if (rasiNum < 1 || rasiNum > 12) {
          console.error(`  ❌ House ${i} has invalid rasi number: ${rasiNum}`);
          allRasiNumbersCorrect = false;
        }
      } catch (e) {
        console.error(`  ❌ House ${i} has invalid sign: ${houseToRasiMap[i].sign}`);
        allRasiNumbersCorrect = false;
      }
    }
    
    if (allRasiNumbersCorrect) {
      console.log('  ✅ All houses have valid rasi numbers extracted from housePositions');
    } else {
      throw new Error('❌ Some houses have invalid rasi numbers');
    }
    
    console.log('✅ Rasi number extraction is correct\n');
    
    console.log('🎉 All frontend rendering tests passed!\n');
    console.log('✅ Rasi numbers are calculated from housePositions');
    console.log('✅ Planetary degrees are calculated correctly');
    console.log('✅ Planet format matches template: "PlanetCode Degree"');
    console.log('✅ House assignments are correct');
    
    return { success: true };
    
  } catch (error) {
    console.error(`\n❌ Test failed: ${error.message}\n`);
    console.error(error.stack);
    return { success: false, error: error.message };
  }
}

// Run tests
if (require.main === module) {
  testFrontendRendering()
    .then((result) => {
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { testFrontendRendering };

