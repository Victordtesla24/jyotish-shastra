#!/usr/bin/env node

/**
 * Chart Generation and Comparison Script
 * Generates chart data for all 4 people and compares with reference images
 */

const https = require('https');
const http = require('http');

const API_BASE_URL = 'http://localhost:3001/api/v1';

// Birth data from the table
const birthData = {
  Farhan: {
    name: 'Farhan',
    dateOfBirth: '1997-12-18',
    timeOfBirth: '00:00', // 12:00 AM
    placeOfBirth: 'Sialkot, Pakistan',
    latitude: 32.4935378,
    longitude: 74.5411575,
    timezone: 'Asia/Karachi',
    gender: 'male'
  },
  Abhi: {
    name: 'Abhi',
    dateOfBirth: '1982-05-28',
    timeOfBirth: '16:30', // 4:30 PM
    placeOfBirth: 'Pune, India',
    latitude: 18.5204,
    longitude: 73.8567,
    timezone: 'Asia/Kolkata',
    gender: 'male'
  },
  Vrushali: {
    name: 'Vrushali',
    dateOfBirth: '1982-03-25',
    timeOfBirth: '19:30', // 7:30 PM
    placeOfBirth: 'Pune, India',
    latitude: 18.5204,
    longitude: 73.8567,
    timezone: 'Asia/Kolkata',
    gender: 'female'
  },
  Vikram: {
    name: 'Vikram',
    dateOfBirth: '1985-10-24',
    timeOfBirth: '14:30', // 02:30 PM
    placeOfBirth: 'Pune, India',
    latitude: 18.5204,
    longitude: 73.8567,
    timezone: 'Asia/Kolkata',
    gender: 'male'
  }
};

// Reference data from images
const referenceData = {
  Abhi: {
    house1: { ascendant: { degree: 1 }, moon: { degree: 19 } },
    house6: { mars: { degree: 4 }, venus: { degree: 16, debilitated: true } },
    house7: { sun: { degree: 7, debilitated: true }, mercury: { degree: 26 }, ketu: { degree: 15, retrograde: true }, pluto: { degree: 10, exalted: true } },
    house9: { neptune: { degree: 7 } },
    house10: { jupiter: { degree: 14, debilitated: true } },
    house11: { saturn: { degree: 3 }, uranus: { degree: 21 } },
    house12: { rahu: { degree: 15, retrograde: true } }
  },
  Vrushali: {
    house3: { rahu: { degree: 25, retrograde: true } },
    house6: { ascendant: { degree: 26 }, mars: { degree: 18, retrograde: true }, saturn: { degree: 26, retrograde: true } },
    house7: { jupiter: { degree: 15, retrograde: true }, pluto: { degree: 2, retrograde: true } },
    house8: { uranus: { degree: 10, retrograde: true } },
    house9: { ketu: { degree: 25, retrograde: true }, neptune: { degree: 3 } },
    house10: { venus: { degree: 24 } },
    house11: { mercury: { degree: 25 } },
    house12: { sun: { degree: 10 }, moon: { degree: 12 } }
  },
  Farhan: {
    house7: { ascendant: { degree: 2 }, sun: { degree: 2 }, mercury: { degree: 0, retrograde: true, exalted: true } },
    house10: { mars: { degree: 5, exalted: true }, jupiter: { degree: 25, debilitated: true }, venus: { degree: 8 }, uranus: { degree: 12 }, neptune: { degree: 4 } },
    house11: { ketu: { degree: 20, retrograde: true } },
    house12: { saturn: { degree: 19 } },
    house4: { moon: { degree: 16 } },
    house5: { rahu: { degree: 20, retrograde: true } }
  }
};

function makeRequest(url, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': JSON.stringify(data).length
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    req.write(JSON.stringify(data));
    req.end();
  });
}

function getPlanetCode(planetName) {
  const codes = {
    sun: 'Su', moon: 'Mo', mars: 'Ma', mercury: 'Me', jupiter: 'Ju',
    venus: 'Ve', saturn: 'Sa', rahu: 'Ra', ketu: 'Ke',
    uranus: 'Ur', neptune: 'Ne', pluto: 'Pl'
  };
  return codes[planetName.toLowerCase()] || planetName;
}

function getSignFromLongitude(longitude) {
  const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  const signIndex = Math.floor(longitude / 30);
  return signs[signIndex % 12];
}

function getDegreeInSign(longitude) {
  return longitude % 30;
}

function calculateHouseNumber(planetLongitude, ascendantLongitude) {
  let diff = planetLongitude - ascendantLongitude;
  if (diff < 0) diff += 360;
  const house = Math.floor(diff / 30) + 1;
  return house > 12 ? 12 : house;
}

async function generateChart(name, data) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`Generating chart for ${name}`);
  console.log(`${'='.repeat(80)}`);
  console.log(`Birth Data:`, JSON.stringify(data, null, 2));

  try {
    const response = await makeRequest(`${API_BASE_URL}/chart/generate`, data);
    
    if (response.status !== 200) {
      console.error(`❌ Error generating chart for ${name}:`, response.data);
      return null;
    }

    return response.data;
  } catch (error) {
    console.error(`❌ Error generating chart for ${name}:`, error.message);
    return null;
  }
}

function compareChart(generatedChart, name) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`Comparing chart for ${name} with reference image`);
  console.log(`${'='.repeat(80)}`);

  if (!generatedChart || !generatedChart.data) {
    console.error(`❌ No chart data available for ${name}`);
    return;
  }

  const chartData = generatedChart.data;
  const reference = referenceData[name];
  
  if (!reference) {
    console.log(`⚠️  No reference data available for ${name}`);
    return;
  }

  const ascendant = chartData.rasiChart?.ascendant || chartData.ascendant;
  if (!ascendant || ascendant.longitude === undefined) {
    console.error(`❌ No ascendant data found for ${name}`);
    return;
  }

  const ascendantLongitude = ascendant.longitude;
  console.log(`\n📍 Ascendant: ${getSignFromLongitude(ascendantLongitude)} ${getDegreeInSign(ascendantLongitude).toFixed(2)}°`);

  const planetaryPositions = chartData.rasiChart?.planetaryPositions || chartData.planetaryPositions || {};
  const planets = chartData.rasiChart?.planets || chartData.planets || [];

  const planetMap = {};
  
  if (Array.isArray(planets) && planets.length > 0) {
    planets.forEach(planet => {
      const planetName = (planet.name || planet.planet || '').toLowerCase();
      if (planetName) {
        planetMap[planetName] = {
          longitude: planet.longitude || planet.degree,
          sign: planet.sign || getSignFromLongitude(planet.longitude || planet.degree),
          degree: getDegreeInSign(planet.longitude || planet.degree),
          house: planet.house || calculateHouseNumber(planet.longitude || planet.degree, ascendantLongitude),
          retrograde: planet.isRetrograde || planet.retrograde || false,
          dignity: planet.dignity || {}
        };
      }
    });
  } else {
    Object.entries(planetaryPositions).forEach(([planetName, position]) => {
      const longitude = position.longitude || position.degree;
      if (longitude !== undefined) {
        planetMap[planetName.toLowerCase()] = {
          longitude: longitude,
          sign: position.sign || getSignFromLongitude(longitude),
          degree: getDegreeInSign(longitude),
          house: position.house || calculateHouseNumber(longitude, ascendantLongitude),
          retrograde: position.isRetrograde || position.retrograde || false,
          dignity: position.dignity || {}
        };
      }
    });
  }

  const discrepancies = [];

  Object.entries(reference).forEach(([houseKey, housePlanets]) => {
    const houseNumber = parseInt(houseKey.replace('house', ''));
    console.log(`\n🏠 House ${houseNumber}:`);
    
    Object.entries(housePlanets).forEach(([planetName, refData]) => {
      const planetKey = planetName.toLowerCase();
      const planet = planetMap[planetKey];
      
      if (!planet) {
        console.log(`  ❌ ${getPlanetCode(planetName)}: NOT FOUND in generated chart`);
        discrepancies.push({
          house: houseNumber,
          planet: planetName,
          issue: 'Planet not found in generated chart',
          expected: refData
        });
        return;
      }

      const generatedHouse = planet.house;
      const generatedDegree = Math.round(planet.degree);
      const refDegree = Math.round(refData.degree);
      const degreeDiff = Math.abs(generatedDegree - refDegree);

      const status = [];
      if (generatedHouse !== houseNumber) {
        status.push(`❌ HOUSE MISMATCH (Expected: ${houseNumber}, Got: ${generatedHouse})`);
        discrepancies.push({
          house: houseNumber,
          planet: planetName,
          issue: 'House mismatch',
          expected: { house: houseNumber, degree: refDegree },
          actual: { house: generatedHouse, degree: generatedDegree }
        });
      } else {
        status.push('✅');
      }

      if (degreeDiff > 1) {
        status.push(`⚠️  DEGREE DIFF (Expected: ${refDegree}°, Got: ${generatedDegree}°, Diff: ${degreeDiff}°)`);
        discrepancies.push({
          house: houseNumber,
          planet: planetName,
          issue: 'Degree mismatch',
          expected: { house: houseNumber, degree: refDegree },
          actual: { house: generatedHouse, degree: generatedDegree },
          difference: degreeDiff
        });
      }

      const dignityStatus = [];
      if (refData.exalted && !planet.dignity?.exalted) {
        dignityStatus.push('❌ Expected EXALTED');
        discrepancies.push({
          house: houseNumber,
          planet: planetName,
          issue: 'Missing exalted status',
          expected: 'exalted',
          actual: planet.dignity
        });
      }
      if (refData.debilitated && !planet.dignity?.debilitated) {
        dignityStatus.push('❌ Expected DEBILITATED');
        discrepancies.push({
          house: houseNumber,
          planet: planetName,
          issue: 'Missing debilitated status',
          expected: 'debilitated',
          actual: planet.dignity
        });
      }
      if (refData.retrograde && !planet.retrograde) {
        dignityStatus.push('❌ Expected RETROGRADE');
        discrepancies.push({
          house: houseNumber,
          planet: planetName,
          issue: 'Missing retrograde status',
          expected: 'retrograde',
          actual: planet.retrograde
        });
      }

      console.log(`  ${status.join(' ')} ${getPlanetCode(planetName)}: ${planet.sign} ${generatedDegree}° (House ${generatedHouse}) ${dignityStatus.join(' ')}`);
    });
  });

  if (discrepancies.length > 0) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`❌ DISCREPANCIES FOUND: ${discrepancies.length}`);
    console.log(`${'='.repeat(80)}`);
    discrepancies.forEach((disc, idx) => {
      console.log(`\n${idx + 1}. ${disc.planet} in House ${disc.house}: ${disc.issue}`);
      console.log(`   Expected:`, disc.expected);
      console.log(`   Actual:`, disc.actual);
      if (disc.difference) {
        console.log(`   Difference: ${disc.difference}°`);
      }
    });
  } else {
    console.log(`\n✅ No discrepancies found! Chart matches reference image.`);
  }

  return discrepancies;
}

async function main() {
  console.log('🚀 Chart Generation and Comparison Script');
  console.log('='.repeat(80));

  const allDiscrepancies = {};

  for (const [name, data] of Object.entries(birthData)) {
    const chart = await generateChart(name, data);
    if (chart) {
      const discrepancies = compareChart(chart, name);
      allDiscrepancies[name] = discrepancies || [];
      
      const fs = require('fs');
      const outputFile = `${name.toLowerCase()}-chart-data.json`;
      fs.writeFileSync(outputFile, JSON.stringify(chart, null, 2));
      console.log(`\n💾 Chart data saved to ${outputFile}`);
    }
  }

  console.log(`\n${'='.repeat(80)}`);
  console.log('📊 SUMMARY');
  console.log(`${'='.repeat(80)}`);

  Object.entries(allDiscrepancies).forEach(([name, discrepancies]) => {
    console.log(`\n${name}: ${discrepancies.length} discrepancy(ies)`);
    if (discrepancies.length > 0) {
      discrepancies.forEach(disc => {
        console.log(`  - ${disc.planet} in House ${disc.house}: ${disc.issue}`);
      });
    }
  });

  const totalDiscrepancies = Object.values(allDiscrepancies).reduce((sum, arr) => sum + arr.length, 0);
  console.log(`\n${'='.repeat(80)}`);
  console.log(`Total Discrepancies: ${totalDiscrepancies}`);
  console.log(`${'='.repeat(80)}`);
}

main().catch(console.error);

