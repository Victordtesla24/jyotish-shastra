#!/usr/bin/env node
/**
 * Extract API Response Data
 * 
 * Extracts and formats API response data for each person:
 * - Rasi numbers (signs)
 * - House numbers
 * - Planetary positions
 * - Planets placed in their respective houses
 * - Rasi numbers placed in respective houses
 */

const fs = require('fs');
const path = require('path');

// Rasi number to sign mapping
const rasiToSign = {
  1: 'Aries',
  2: 'Taurus',
  3: 'Gemini',
  4: 'Cancer',
  5: 'Leo',
  6: 'Virgo',
  7: 'Libra',
  8: 'Scorpio',
  9: 'Sagittarius',
  10: 'Capricorn',
  11: 'Aquarius',
  12: 'Pisces'
};

/**
 * Extract data from API response
 */
function extractApiData(apiResponse, personName) {
  if (!apiResponse || !apiResponse.data || !apiResponse.data.rasiChart) {
    return null;
  }
  
  const rasiChart = apiResponse.data.rasiChart;
  const ascendant = rasiChart.ascendant;
  const planets = rasiChart.planets || [];
  const housePositions = rasiChart.housePositions || [];
  
  // Extract ascendant data
  const ascendantData = {
    sign: ascendant.signName || ascendant.sign,
    degree: Math.round((ascendant.degree || (ascendant.longitude % 30)) * 10) / 10,
    rasi: ascendant.signId || getRasiFromSign(ascendant.signName || ascendant.sign),
    house: ascendant.house || 1,
    longitude: ascendant.longitude
  };
  
  // Build house mapping
  const houses = {};
  for (let i = 1; i <= 12; i++) {
    houses[i] = {
      rasi: null,
      sign: null,
      planets: []
    };
  }
  
  // Map house positions to houses
  housePositions.forEach((housePos, index) => {
    const houseNum = housePos.houseNumber || (index + 1);
    houses[houseNum].rasi = housePos.signId || getRasiFromSign(housePos.sign);
    houses[houseNum].sign = housePos.sign || rasiToSign[houses[houseNum].rasi];
    houses[houseNum].degree = housePos.degree || housePos.longitude;
  });
  
  // Map planets to houses
  planets.forEach(planet => {
    const houseNum = planet.house;
    if (houseNum && houseNum >= 1 && houseNum <= 12) {
      const degree = Math.round((planet.degree || (planet.longitude % 30)) * 10) / 10;
      const planetName = planet.name || 'Unknown';
      houses[houseNum].planets.push({
        name: planetName,
        sign: planet.sign,
        degree: degree,
        rasi: planet.signId || getRasiFromSign(planet.sign),
        longitude: planet.longitude,
        dignity: planet.dignity,
        retrograde: planet.isRetrograde || planet.retrograde
      });
    }
  });
  
  return {
    name: personName,
    ascendant: ascendantData,
    houses: houses,
    planets: planets
  };
}

/**
 * Get rasi number from sign name
 */
function getRasiFromSign(signName) {
  const signMap = {
    'Aries': 1, 'Taurus': 2, 'Gemini': 3, 'Cancer': 4,
    'Leo': 5, 'Virgo': 6, 'Libra': 7, 'Scorpio': 8,
    'Sagittarius': 9, 'Capricorn': 10, 'Aquarius': 11, 'Pisces': 12
  };
  return signMap[signName] || null;
}

/**
 * Generate markdown table for API response data
 */
function generateMarkdownTable(apiData) {
  if (!apiData) {
    return '**API Response Data**: Not available\n';
  }
  
  let markdown = '### API Response Data (from generateChart endpoint)\n\n';
  
  // Ascendant info
  markdown += `**Ascendant**: ${apiData.ascendant.sign} ${apiData.ascendant.degree}° (Rasi ${apiData.ascendant.rasi}, House ${apiData.ascendant.house})\n\n`;
  
  // House-Rasi-Planet Mapping
  markdown += '#### House-Rasi-Planet Mapping\n\n';
  markdown += '| House | Rasi # | Sign (Rasi) | Planets in House |\n';
  markdown += '|-------|--------|-------------|------------------|\n';
  
  for (let houseNum = 1; houseNum <= 12; houseNum++) {
    const house = apiData.houses[houseNum];
    const rasiNum = house.rasi || 'N/A';
    const sign = house.sign || 'N/A';
    const planetsList = house.planets.length > 0
      ? house.planets.map(p => `${p.name} ${p.degree}°`).join(', ')
      : '(Empty)';
    
    markdown += `| ${houseNum.toString().padStart(2)} | ${rasiNum.toString().padStart(2)} | ${sign.padEnd(11)} | ${planetsList} |\n`;
  }
  
  markdown += '\n';
  
  // Planetary Positions
  markdown += '#### Planetary Positions\n\n';
  markdown += '| Planet | Sign | Degree | House | Rasi # |\n';
  markdown += '|--------|------|--------|-------|--------|\n';
  
  // Collect all planets
  const allPlanets = [];
  for (let houseNum = 1; houseNum <= 12; houseNum++) {
    apiData.houses[houseNum].planets.forEach(planet => {
      allPlanets.push({
        ...planet,
        house: houseNum
      });
    });
  }
  
  // Add ascendant
  allPlanets.push({
    name: 'Asc',
    sign: apiData.ascendant.sign,
    degree: apiData.ascendant.degree,
    house: apiData.ascendant.house,
    rasi: apiData.ascendant.rasi
  });
  
  // Sort by house
  allPlanets.sort((a, b) => a.house - b.house);
  
  allPlanets.forEach(planet => {
    const planetName = (planet.name || 'Unknown').padEnd(6);
    const sign = (planet.sign || 'N/A').padEnd(11);
    const degree = planet.degree.toString().padStart(3);
    const house = planet.house.toString().padStart(2);
    const rasi = (planet.rasi || 'N/A').toString().padStart(2);
    markdown += `| ${planetName} | ${sign} | ${degree}° | ${house} | ${rasi} |\n`;
  });
  
  markdown += '\n';
  
  // Rasi Numbers in Houses
  markdown += '#### Rasi Numbers in Houses\n\n';
  markdown += '| House | Rasi # | Sign |\n';
  markdown += '|-------|--------|------|\n';
  
  for (let houseNum = 1; houseNum <= 12; houseNum++) {
    const house = apiData.houses[houseNum];
    const rasiNum = house.rasi || 'N/A';
    const sign = house.sign || 'N/A';
    markdown += `| ${houseNum.toString().padStart(2)} | ${rasiNum.toString().padStart(2)} | ${sign} |\n`;
  }
  
  markdown += '\n';
  
  return markdown;
}

/**
 * Process all API responses
 */
function processAllApiResponses() {
  const people = [
    { name: 'Farhan', file: '/tmp/farhan-api-response.json' },
    { name: 'Abhi', file: '/tmp/abhi-api-response.json' },
    { name: 'Vrushali', file: '/tmp/vrushali-api-response.json' },
    { name: 'Vikram', file: '/tmp/vikram-api-response.json' }
  ];
  
  const results = {};
  
  people.forEach(person => {
    try {
      if (fs.existsSync(person.file)) {
        const apiResponse = JSON.parse(fs.readFileSync(person.file, 'utf8'));
        const apiData = extractApiData(apiResponse, person.name);
        results[person.name.toLowerCase()] = {
          apiData: apiData,
          markdown: generateMarkdownTable(apiData)
        };
        console.log(`✅ Processed ${person.name} API response`);
      } else {
        console.error(`❌ File not found: ${person.file}`);
      }
    } catch (error) {
      console.error(`❌ Error processing ${person.name}:`, error.message);
    }
  });
  
  return results;
}

// Run if executed directly
if (require.main === module) {
  const results = processAllApiResponses();
  
  // Save results to file
  const outputPath = path.join(__dirname, '..', 'api-response-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\n✅ Results saved to: ${outputPath}`);
  
  // Print markdown for each person
  Object.values(results).forEach(result => {
    console.log('\n' + '='.repeat(80));
    console.log(result.markdown);
  });
}

module.exports = { extractApiData, generateMarkdownTable, processAllApiResponses };
