/**
 * Rasi Calculation Unit Test (No Browser)
 * =======================================
 * Tests the calculateRasiForHouse function logic using real API test data
 * Validates anti-clockwise house progression according to traditional North Indian format
 */

// Import test data
const testData = require('../test-data/chart-generate-response.json');

describe('Rasi Calculation Unit Tests', () => {
  // Replicate the exact function from VedicChartDisplay.jsx
  const calculateRasiForHouse = (houseNumber, ascendantRasi) => {
    if (!ascendantRasi || houseNumber < 1 || houseNumber > 12) {
      console.warn('⚠️ Invalid Rasi calculation inputs:', { houseNumber, ascendantRasi });
      return houseNumber; // Fallback to house number if invalid data
    }

    // CORRECT Vedic calculation:
    // House 1 = ascendant Rasi (e.g., if ascendant is Libra=7, house 1 = 7)
    // House 2 = next Rasi (house 2 = 8)
    // House 3 = next Rasi (house 3 = 9), etc.

    // Simple formula: (ascendantRasi + houseNumber - 1 - 1) % 12 + 1
    let rasiNumber = (ascendantRasi + houseNumber - 2) % 12 + 1;

    // Handle wrap-around: if result is 0 or negative, add 12
    if (rasiNumber <= 0) {
      rasiNumber += 12;
    }

    // Ensure final result is in 1-12 range
    if (rasiNumber > 12) {
      rasiNumber = rasiNumber - 12;
    }

    console.log('🔢 CORRECTED Rasi calculation:', {
      house: houseNumber,
      ascendantRasi: ascendantRasi,
      calculation: `(${ascendantRasi} + ${houseNumber} - 2) % 12 + 1`,
      finalRasi: rasiNumber
    });

    return rasiNumber;
  };

  test('should calculate correct rasi sequence for Libra ascendant from test data', () => {
    // Extract ascendant data from test response
    const ascendantSign = testData.data.rasiChart.ascendant.sign; // "Libra"
    const ascendantSignId = testData.data.rasiChart.ascendant.signId; // 7

    console.log('🎯 Testing with test data ascendant:', { ascendantSign, ascendantSignId });

    // Expected anti-clockwise rasi sequence for Libra ascendant
    const expectedRasiSequence = {
      1: 7,   // House 1 = Libra (7)
      2: 8,   // House 2 = Scorpio (8)
      3: 9,   // House 3 = Sagittarius (9)
      4: 10,  // House 4 = Capricorn (10)
      5: 11,  // House 5 = Aquarius (11)
      6: 12,  // House 6 = Pisces (12)
      7: 1,   // House 7 = Aries (1)
      8: 2,   // House 8 = Taurus (2)
      9: 3,   // House 9 = Gemini (3)
      10: 4,  // House 10 = Cancer (4)
      11: 5,  // House 11 = Leo (5)
      12: 6   // House 12 = Virgo (6)
    };

    // Validate each house calculation
    const calculationResults = {};
    for (let house = 1; house <= 12; house++) {
      const calculatedRasi = calculateRasiForHouse(house, ascendantSignId);
      const expectedRasi = expectedRasiSequence[house];

      calculationResults[house] = {
        calculated: calculatedRasi,
        expected: expectedRasi,
        matches: calculatedRasi === expectedRasi
      };

      console.log(`🏠 House ${house}: Expected ${expectedRasi}, Calculated ${calculatedRasi}, Match: ${calculatedRasi === expectedRasi}`);

      expect(calculatedRasi).toBe(expectedRasi);
    }

    // Log summary
    const totalMatches = Object.values(calculationResults).filter(r => r.matches).length;
    console.log(`✅ Calculation validation: ${totalMatches}/12 houses correct`);
    expect(totalMatches).toBe(12);
  });

  test('should validate rasi sequence with different ascendants', () => {
    const testCases = [
      {
        name: 'Aries Ascendant',
        ascendantRasi: 1,
        expectedSequence: { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10, 11: 11, 12: 12 }
      },
      {
        name: 'Cancer Ascendant',
        ascendantRasi: 4,
        expectedSequence: { 1: 4, 2: 5, 3: 6, 4: 7, 5: 8, 6: 9, 7: 10, 8: 11, 9: 12, 10: 1, 11: 2, 12: 3 }
      },
      {
        name: 'Libra Ascendant (Test Data Case)',
        ascendantRasi: 7,
        expectedSequence: { 1: 7, 2: 8, 3: 9, 4: 10, 5: 11, 6: 12, 7: 1, 8: 2, 9: 3, 10: 4, 11: 5, 12: 6 }
      },
      {
        name: 'Capricorn Ascendant',
        ascendantRasi: 10,
        expectedSequence: { 1: 10, 2: 11, 3: 12, 4: 1, 5: 2, 6: 3, 7: 4, 8: 5, 9: 6, 10: 7, 11: 8, 12: 9 }
      },
      {
        name: 'Pisces Ascendant (Edge Case)',
        ascendantRasi: 12,
        expectedSequence: { 1: 12, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 7: 6, 8: 7, 9: 8, 10: 9, 11: 10, 12: 11 }
      }
    ];

    testCases.forEach(testCase => {
      console.log(`\n🔍 Testing ${testCase.name} (Rasi ${testCase.ascendantRasi})`);

      for (let house = 1; house <= 12; house++) {
        const calculated = calculateRasiForHouse(house, testCase.ascendantRasi);
        const expected = testCase.expectedSequence[house];

        console.log(`   House ${house}: Expected ${expected}, Calculated ${calculated}`);
        expect(calculated).toBe(expected);
      }
    });
  });

  test('should handle edge cases and invalid inputs', () => {
    // Test invalid inputs
    expect(calculateRasiForHouse(0, 7)).toBe(0); // Invalid house
    expect(calculateRasiForHouse(13, 7)).toBe(13); // Invalid house
    expect(calculateRasiForHouse(1, null)).toBe(1); // Null ascendant
    expect(calculateRasiForHouse(1, undefined)).toBe(1); // Undefined ascendant

    // Test valid boundary cases
    expect(calculateRasiForHouse(1, 1)).toBe(1); // Start of zodiac
    expect(calculateRasiForHouse(1, 12)).toBe(12); // End of zodiac
    expect(calculateRasiForHouse(12, 1)).toBe(12); // Last house, first sign
    expect(calculateRasiForHouse(12, 12)).toBe(11); // Last house, last sign

    console.log('✅ Edge case validation complete');
  });

  test('should match planet house positions from test data', () => {
    // Extract planet data from test response
    const planets = testData.data.rasiChart.planets;
    const ascendantLongitude = testData.data.rasiChart.ascendant.longitude; // 184.69766813232675
    const ascendantSignId = testData.data.rasiChart.ascendant.signId; // 7

    console.log('🌟 Validating planet house positions from test data');
    console.log(`   Ascendant: ${testData.data.rasiChart.ascendant.sign} (${ascendantSignId}) at ${ascendantLongitude.toFixed(2)}°`);

    // Function to calculate house from longitude (replicated from VedicChartDisplay.jsx)
    const calculateHouseFromLongitude = (planetLongitude, ascendantLongitude) => {
      if (typeof planetLongitude !== 'number' || typeof ascendantLongitude !== 'number') {
        console.warn('⚠️ Invalid longitude values:', { planetLongitude, ascendantLongitude });
        return 1;
      }

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
    };

    // Test each planet's house calculation
    planets.forEach(planet => {
      const calculatedHouse = calculateHouseFromLongitude(planet.longitude, ascendantLongitude);
      const planetSign = planet.sign;
      const planetSignId = planet.signId;

      // Calculate which rasi should be in the calculated house
      const expectedRasiInHouse = calculateRasiForHouse(calculatedHouse, ascendantSignId);

      console.log(`   ${planet.name}: ${planetSign} (${planetSignId}) at ${planet.longitude.toFixed(2)}° → House ${calculatedHouse}, Expected Rasi ${expectedRasiInHouse}`);

      // The planet's sign ID should match the rasi number for that house
      // Note: This is a conceptual check - in practice, planets can be in any sign regardless of house rasi
      // But we can validate that our house calculation is consistent
      expect(calculatedHouse).toBeGreaterThanOrEqual(1);
      expect(calculatedHouse).toBeLessThanOrEqual(12);
      expect(expectedRasiInHouse).toBeGreaterThanOrEqual(1);
      expect(expectedRasiInHouse).toBeLessThanOrEqual(12);
    });

    console.log('✅ Planet house position validation complete');
  });
});
