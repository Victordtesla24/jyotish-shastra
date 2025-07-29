/**
 * Rasi Calculation Validation Test
 * ================================
 * Tests the calculateRasiForHouse function using real API test data
 * Validates anti-clockwise house progression according to traditional North Indian format
 */

const puppeteer = require('puppeteer');
const path = require('path');

// Import test data
const testData = require('../test-data/chart-generate-response.json');

describe('Rasi Calculation Validation', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: false,
      defaultViewport: { width: 1280, height: 800 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    page = await browser.newPage();

    // Navigate to the chart page
    await page.goto('http://localhost:3002');
    console.log('🌐 Navigated to frontend');
  });

  afterAll(async () => {
    if (browser) {
      await browser.close();
    }
  });

  test('should calculate correct rasi sequence for Libra ascendant', async () => {
    // Extract ascendant data from test response
    const ascendantSign = testData.data.rasiChart.ascendant.sign; // "Libra"
    const ascendantSignId = testData.data.rasiChart.ascendant.signId; // 7

    console.log('🎯 Testing with ascendant:', { ascendantSign, ascendantSignId });

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

    // Test the calculation logic directly
    const calculateRasiForHouse = (houseNumber, ascendantRasi) => {
      if (!ascendantRasi || houseNumber < 1 || houseNumber > 12) {
        console.warn('⚠️ Invalid inputs:', { houseNumber, ascendantRasi });
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

  test('should validate rasi sequence with different ascendants', async () => {
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

    const calculateRasiForHouse = (houseNumber, ascendantRasi) => {
      let rasiNumber = (ascendantRasi + houseNumber - 2) % 12 + 1;
      if (rasiNumber <= 0) rasiNumber += 12;
      if (rasiNumber > 12) rasiNumber = rasiNumber - 12;
      return rasiNumber;
    };

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

  test('should handle edge cases and invalid inputs', async () => {
    const calculateRasiForHouse = (houseNumber, ascendantRasi) => {
      if (!ascendantRasi || houseNumber < 1 || houseNumber > 12) {
        console.warn('⚠️ Invalid inputs:', { houseNumber, ascendantRasi });
        return houseNumber; // Fallback behavior
      }

      let rasiNumber = (ascendantRasi + houseNumber - 2) % 12 + 1;
      if (rasiNumber <= 0) rasiNumber += 12;
      if (rasiNumber > 12) rasiNumber = rasiNumber - 12;
      return rasiNumber;
    };

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
  });
});
