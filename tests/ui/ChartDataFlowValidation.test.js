/**
 * Chart Data Flow Validation Test
 * ===============================
 * Tests the complete data pipeline from API response to UI display
 * Validates planetary positions, degrees, and dignities match API data
 */

// Import test data and VedicChart functions
const testData = require('../test-data/chart-generate-response.json');

// Mock VedicChartDisplay functions (extracted from the component)
const PLANET_CODES = {
  Sun: "Su", Moon: "Mo", Mars: "Ma", Mercury: "Me", Jupiter: "Ju",
  Venus: "Ve", Saturn: "Sa", Rahu: "Ra", Ketu: "Ke", Ascendant: "As"
};

const HOUSE_POSITIONS = {
  1:  { x: 250, y: 90 },   // Top center
  2:  { x: 330, y: 120 },  // Top right
  3:  { x: 410, y: 170 },  // Right top
  4:  { x: 410, y: 250 },  // Right center
  5:  { x: 410, y: 330 },  // Right bottom
  6:  { x: 330, y: 380 },  // Bottom right
  7:  { x: 250, y: 410 },  // Bottom center
  8:  { x: 170, y: 380 },  // Bottom left
  9:  { x: 90, y: 330 },   // Left bottom
  10: { x: 90, y: 250 },   // Left center
  11: { x: 90, y: 170 },   // Left top
  12: { x: 170, y: 120 }   // Top left
};

const RASI_NUMBERS = {
  Aries: 1, Taurus: 2, Gemini: 3, Cancer: 4, Leo: 5, Virgo: 6,
  Libra: 7, Scorpio: 8, Sagittarius: 9, Capricorn: 10, Aquarius: 11, Pisces: 12
};

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

function calculateRasiForHouse(houseNumber, ascendantRasi) {
  if (!ascendantRasi || houseNumber < 1 || houseNumber > 12) {
    return houseNumber;
  }

  let rasiNumber = (ascendantRasi + houseNumber - 2) % 12 + 1;
  if (rasiNumber <= 0) {
    rasiNumber += 12;
  }
  if (rasiNumber > 12) {
    rasiNumber = rasiNumber - 12;
  }

  return rasiNumber;
}

function getRasiNumberFromSign(signName) {
  return RASI_NUMBERS[signName] || 1;
}

function processChartData(chartData) {
  if (!chartData || !chartData.planets || !Array.isArray(chartData.planets)) {
    return { planets: [], ascendant: null };
  }

  const chart = chartData;

  // Process planets
  const planets = chart.planets.map(planet => {
    const house = calculateHouseFromLongitude(planet.longitude, chart.ascendant?.longitude || 0);
    const degrees = planet.degree !== undefined ? Math.floor(planet.degree) : Math.floor(planet.longitude % 30);
    const minutes = planet.degree !== undefined ?
      Math.round((planet.degree - Math.floor(planet.degree)) * 60) :
      Math.round(((planet.longitude % 30) - Math.floor(planet.longitude % 30)) * 60);

    return {
      name: planet.name,
      code: PLANET_CODES[planet.name] || planet.name.substring(0, 2),
      longitude: planet.longitude,
      degrees: degrees,
      minutes: minutes,
      sign: planet.sign,
      house: house,
      dignity: planet.dignity || 'neutral',
      isRetrograde: planet.isRetrograde || false,
      isCombust: planet.isCombust || false
    };
  });

  // Process ascendant
  const ascendant = chart.ascendant ? {
    name: "Ascendant",
    code: "As",
    sign: chart.ascendant.sign,
    degrees: Math.floor(chart.ascendant.degree || 0),
    minutes: Math.round(((chart.ascendant.degree || 0) - Math.floor(chart.ascendant.degree || 0)) * 60),
    house: 1,
    dignity: 'neutral'
  } : null;

  return { planets, ascendant };
}

function formatPlanetText(planet) {
  const dignitySymbol = planet.dignity === 'exalted' ? '↑' :
                       planet.dignity === 'debilitated' ? '↓' : '';
  return `${planet.code} ${planet.degrees}${dignitySymbol}`;
}

describe('Chart Data Flow Validation', () => {
  test('should correctly process API response and calculate planetary positions', () => {
    // Get test data
    const apiResponse = testData.data.rasiChart;

    // Process chart data
    const processedData = processChartData(apiResponse);

    console.log('Ascendant:', processedData.ascendant);
    console.log('Processed Planets:', processedData.planets.map(p => ({
      name: p.name,
      house: p.house,
      sign: p.sign,
      degrees: p.degrees,
      dignity: p.dignity,
      formatted: formatPlanetText(p)
    })));

    // Validate ascendant
    expect(processedData.ascendant).toBeTruthy();
    expect(processedData.ascendant.sign).toBe('Libra');
    expect(processedData.ascendant.house).toBe(1);

    // Validate planet count
    expect(processedData.planets.length).toBe(apiResponse.planets.length);

    // Validate each planet has required properties
    processedData.planets.forEach(planet => {
      expect(planet.name).toBeTruthy();
      expect(planet.code).toBeTruthy();
      expect(planet.house).toBeGreaterThanOrEqual(1);
      expect(planet.house).toBeLessThanOrEqual(12);
      expect(planet.degrees).toBeGreaterThanOrEqual(0);
      expect(planet.degrees).toBeLessThanOrEqual(29);
    });

    // Check specific planets from template
    const sun = processedData.planets.find(p => p.name === 'Sun');
    const moon = processedData.planets.find(p => p.name === 'Moon');
    const mars = processedData.planets.find(p => p.name === 'Mars');
    const jupiter = processedData.planets.find(p => p.name === 'Jupiter');

    console.log('Sun:', sun ? formatPlanetText(sun) : 'not found');
    console.log('Moon:', moon ? formatPlanetText(moon) : 'not found');
    console.log('Mars:', mars ? formatPlanetText(mars) : 'not found');
    console.log('Jupiter:', jupiter ? formatPlanetText(jupiter) : 'not found');

    // Validate specific dignities
    expect(mars.dignity).toBe('exalted');
    expect(jupiter.dignity).toBe('debilitated');
  });

  test('should calculate correct rasi numbers for each house with Libra ascendant', () => {
    const ascendantRasi = 7; // Libra

    // Expected rasi sequence for Libra ascendant
    const expectedRasis = {
      1: 7,   // House 1 = Libra
      2: 8,   // House 2 = Scorpio
      3: 9,   // House 3 = Sagittarius
      4: 10,  // House 4 = Capricorn
      5: 11,  // House 5 = Aquarius
      6: 12,  // House 6 = Pisces
      7: 1,   // House 7 = Aries
      8: 2,   // House 8 = Taurus
      9: 3,   // House 9 = Gemini
      10: 4,  // House 10 = Cancer
      11: 5,  // House 11 = Leo
      12: 6   // House 12 = Virgo
    };

    // Test each house
    for (let house = 1; house <= 12; house++) {
      const calculatedRasi = calculateRasiForHouse(house, ascendantRasi);
      console.log(`House ${house}: Expected Rasi ${expectedRasis[house]}, Got ${calculatedRasi}`);
      expect(calculatedRasi).toBe(expectedRasis[house]);
    }
  });

  test('should format planetary text according to template format', () => {
    const testPlanets = [
      { code: 'Su', degrees: 7, dignity: 'debilitated' },
      { code: 'Mo', degrees: 19, dignity: 'own' },
      { code: 'Ma', degrees: 4, dignity: 'neutral' },
      { code: 'Ju', degrees: 14, dignity: 'debilitated' },
      { code: 'Ra', degrees: 15, dignity: 'neutral' }
    ];

    const expected = [
      'Su 7↓',
      'Mo 19',
      'Ma 4',
      'Ju 14↓',
      'Ra 15'
    ];

    testPlanets.forEach((planet, index) => {
      const formatted = formatPlanetText(planet);
      console.log(`Planet ${planet.code}: Expected "${expected[index]}", Got "${formatted}"`);
      expect(formatted).toBe(expected[index]);
    });
  });

  test('should group planets correctly by house', () => {
    const apiResponse = testData.data.rasiChart;
    const processedData = processChartData(apiResponse);

    // Group planets by house
    const houseGroups = {};
    for (let i = 1; i <= 12; i++) {
      houseGroups[i] = [];
    }

    // Add ascendant to house 1
    if (processedData.ascendant) {
      houseGroups[1].push(processedData.ascendant);
    }

    // Group planets
    processedData.planets.forEach(planet => {
      if (planet.house >= 1 && planet.house <= 12) {
        houseGroups[planet.house].push(planet);
      }
    });

    // Log house occupancy
    console.log('\nHouse Occupancy:');
    Object.entries(houseGroups).forEach(([house, planets]) => {
      if (planets.length > 0) {
        const planetTexts = planets.map(p => formatPlanetText(p)).join(', ');
        console.log(`House ${house}: ${planetTexts}`);
      }
    });

    // Validate house 1 has ascendant
    expect(houseGroups[1].some(p => p.code === 'As')).toBe(true);

    // Validate total planet count
    const totalPlanets = Object.values(houseGroups).reduce((sum, planets) => sum + planets.length, 0);
    expect(totalPlanets).toBe(processedData.planets.length + 1); // +1 for ascendant
  });
});
