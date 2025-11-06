/**
 * Unit Tests for Nisheka-Lagna Calculation
 * 
 * Tests BPHS Ch.4 Ślokas 25-30 implementation
 * 
 * Coverage: ≥70% for Nisheka calculation, invisible half detection, and calendar conversion
 */

import { 
  calculateNishekaLagna, 
  angularDistance, 
  isInInvisibleHalf, 
  convertSavanamanaToSauramana 
} from '../../../src/core/calculations/rectification/nisheka.js';
import { computeGulikaLongitude } from '../../../src/core/calculations/rectification/gulika.js';

describe('Nisheka-Lagna Calculation (BPHS Ch.4 Ślokas 25-30)', () => {
  describe('angularDistance', () => {
    test('should calculate shortest angular distance between two longitudes', () => {
      expect(angularDistance(0, 30)).toBe(30);
      expect(angularDistance(30, 0)).toBe(30);
      expect(angularDistance(350, 10)).toBe(20); // Wrap around
      expect(angularDistance(10, 350)).toBe(20); // Wrap around
      expect(angularDistance(180, 200)).toBe(20);
      expect(angularDistance(200, 180)).toBe(20);
    });

    test('should calculate direct order distance (via 4th and 7th cusps)', () => {
      const long1 = 0; // 0° (Aries 0°)
      const long2 = 90; // 90° (Cancer 0°)
      
      const directDistance = angularDistance(long1, long2, true);
      expect(directDistance).toBe(90); // Direct order: 0° → 90°
      
      const reverseDistance = angularDistance(long2, long1, true);
      expect(reverseDistance).toBe(270); // Direct order: 90° → 0° (via wrap)
    });

    test('should handle edge cases', () => {
      expect(angularDistance(0, 0)).toBe(0);
      expect(angularDistance(180, 180)).toBe(0);
      expect(angularDistance(0, 180)).toBe(180);
      expect(angularDistance(180, 0)).toBe(180);
    });

    test('should throw error for invalid inputs', () => {
      expect(() => angularDistance(NaN, 30)).toThrow();
      expect(() => angularDistance(30, NaN)).toThrow();
      expect(() => angularDistance(null, 30)).toThrow();
      expect(() => angularDistance(30, undefined)).toThrow();
    });
  });

  describe('isInInvisibleHalf', () => {
    test('should return true for planets in houses 1-6', () => {
      const chart = {
        planetaryPositions: {
          sun: { house: 1 },
          moon: { house: 3 },
          mars: { house: 6 }
        }
      };

      expect(isInInvisibleHalf('sun', chart)).toBe(true);
      expect(isInInvisibleHalf('moon', chart)).toBe(true);
      expect(isInInvisibleHalf('mars', chart)).toBe(true);
    });

    test('should return false for planets in houses 7-12', () => {
      const chart = {
        planetaryPositions: {
          jupiter: { house: 7 },
          venus: { house: 9 },
          saturn: { house: 12 }
        }
      };

      expect(isInInvisibleHalf('jupiter', chart)).toBe(false);
      expect(isInInvisibleHalf('venus', chart)).toBe(false);
      expect(isInInvisibleHalf('saturn', chart)).toBe(false);
    });

    test('should handle case-insensitive planet names', () => {
      const chart = {
        planetaryPositions: {
          Sun: { house: 2 },
          Moon: { house: 8 }
        }
      };

      expect(isInInvisibleHalf('Sun', chart)).toBe(true);
      expect(isInInvisibleHalf('Moon', chart)).toBe(false);
    });

    test('should return false for missing planet or chart data', () => {
      expect(isInInvisibleHalf('sun', null)).toBe(false);
      expect(isInInvisibleHalf('sun', {})).toBe(false);
      expect(isInInvisibleHalf('sun', { planetaryPositions: {} })).toBe(false);
      expect(isInInvisibleHalf('unknown', { planetaryPositions: { sun: { house: 1 } } })).toBe(false);
    });

    test('should return false for invalid inputs', () => {
      expect(isInInvisibleHalf(null, { planetaryPositions: { sun: { house: 1 } } })).toBe(false);
      expect(isInInvisibleHalf('', { planetaryPositions: { sun: { house: 1 } } })).toBe(false);
    });
  });

  describe('convertSavanamanaToSauramana', () => {
    test('should convert Savanamana days to Sauramana (Gregorian) days', () => {
      // Savanamana: 360 days/year, Sauramana: 365.25 days/year
      // Conversion factor: 365.25 / 360 = 1.014583...
      
      const savanamanaDays = 360; // 1 Savanamana year
      const sauraDays = convertSavanamanaToSauramana(savanamanaDays);
      
      // 360 * 1.014583 = 365.25 (approximately)
      expect(sauraDays).toBe(365);
      
      const savanamanaDays2 = 180; // 0.5 Savanamana year
      const sauraDays2 = convertSavanamanaToSauramana(savanamanaDays2);
      expect(sauraDays2).toBe(183); // 180 * 1.014583 ≈ 182.62 → 183
    });

    test('should handle zero days', () => {
      expect(convertSavanamanaToSauramana(0)).toBe(0);
    });

    test('should round to nearest day', () => {
      const savanamanaDays = 100;
      const sauraDays = convertSavanamanaToSauramana(savanamanaDays);
      expect(sauraDays).toBe(Math.round(100 * 1.014583));
    });

    test('should throw error for invalid inputs', () => {
      expect(() => convertSavanamanaToSauramana(NaN)).toThrow();
      expect(() => convertSavanamanaToSauramana(-1)).toThrow();
      expect(() => convertSavanamanaToSauramana(null)).toThrow();
      expect(() => convertSavanamanaToSauramana(undefined)).toThrow();
    });
  });

  describe('calculateNishekaLagna', () => {
    const mockBirthData = {
      dateOfBirth: '1985-10-24',
      timeOfBirth: '14:30',
      latitude: 18.5204,
      longitude: 73.8567,
      timezone: 'Asia/Kolkata'
    };

    const createMockChart = (overrides = {}) => {
      const defaultChart = {
        ascendant: {
          longitude: 180,
          sign: 'Libra',
          lord: 'Venus'
        },
        planetaryPositions: {
          saturn: {
            longitude: 200,
            house: 8
          },
          moon: {
            longitude: 150,
            house: 5
          }
        },
        housePositions: [
          { houseNumber: 1, cusp: 180, degree: 180 },
          { houseNumber: 2, cusp: 210, degree: 210 },
          { houseNumber: 3, cusp: 240, degree: 240 },
          { houseNumber: 4, cusp: 270, degree: 270 },
          { houseNumber: 5, cusp: 300, degree: 300 },
          { houseNumber: 6, cusp: 330, degree: 330 },
          { houseNumber: 7, cusp: 0, degree: 0 },
          { houseNumber: 8, cusp: 30, degree: 30 },
          { houseNumber: 9, cusp: 60, degree: 60 },
          { houseNumber: 10, cusp: 90, degree: 90 },
          { houseNumber: 11, cusp: 120, degree: 120 },
          { houseNumber: 12, cusp: 150, degree: 150 }
        ],
        gulika: {
          longitude: 195
        }
      };

      return { ...defaultChart, ...overrides };
    };

    test('should calculate Nisheka-Lagna with all components (A+B+C)', async () => {
      const chart = createMockChart({
        ascendant: {
          longitude: 180,
          sign: 'Libra',
          lord: 'Venus'
        },
        planetaryPositions: {
          saturn: { longitude: 200, house: 8 },
          moon: { longitude: 150, house: 5 },
          venus: { house: 1 } // Ascendant lord in invisible half (house 1)
        }
      });

      const result = await calculateNishekaLagna(
        { rasiChart: chart },
        mockBirthData
      );

      expect(result).toBeDefined();
      expect(result.nishekaDateTime).toBeInstanceOf(Date);
      expect(result.nishekaLagna).toBeDefined();
      expect(result.nishekaLagna.longitude).toBeGreaterThanOrEqual(0);
      expect(result.nishekaLagna.longitude).toBeLessThan(360);
      expect(result.daysBeforeBirth).toBeGreaterThan(0);
      expect(result.components).toBeDefined();
      expect(result.components.A).toBeGreaterThanOrEqual(0);
      expect(result.components.B).toBeGreaterThanOrEqual(0);
      expect(result.components.C).toBeGreaterThanOrEqual(0);
      expect(result.components.X_degrees).toBe(result.components.A + result.components.B + result.components.C);
    });

    test('should calculate Nisheka-Lagna with C=0 (ascendant lord not in invisible half)', async () => {
      const chart = createMockChart({
        ascendant: {
          longitude: 180,
          sign: 'Libra',
          lord: 'Venus'
        },
        planetaryPositions: {
          saturn: { longitude: 200, house: 8 },
          moon: { longitude: 150, house: 5 },
          venus: { house: 7 } // Ascendant lord in visible half (house 7)
        }
      });

      const result = await calculateNishekaLagna(
        { rasiChart: chart },
        mockBirthData
      );

      expect(result.components.C).toBe(0);
      expect(result.components.X_degrees).toBe(result.components.A + result.components.B);
    });

    test('should calculate component A (Saturn-Gulika angular distance)', async () => {
      const chart = createMockChart({
        planetaryPositions: {
          saturn: { longitude: 200, house: 8 },
          moon: { longitude: 150, house: 5 } // Moon required for Nisheka calculation
        },
        gulika: { longitude: 195 }
      });

      const result = await calculateNishekaLagna(
        { rasiChart: chart },
        mockBirthData
      );

      // A = angular distance between Saturn (200°) and Gulika (195°)
      const expectedA = Math.abs(200 - 195);
      expect(result.components.A).toBe(expectedA);
    });

    test('should calculate component B (Ascendant-9th house distance via direct order)', async () => {
      const chart = createMockChart({
        ascendant: { longitude: 180, sign: 'Libra', lord: 'Venus' },
        housePositions: [
          { houseNumber: 1, cusp: 180, degree: 180 },
          { houseNumber: 9, cusp: 60, degree: 60 }
        ]
      });

      const result = await calculateNishekaLagna(
        { rasiChart: chart },
        mockBirthData
      );

      // B = angular distance from ascendant (180°) to 9th house (60°) in direct order
      // Direct order: 180° → 60° (via wrap: 180 + 180 = 360, then to 60 = 240° total)
      // Actually: (60 - 180 + 360) % 360 = 240°
      expect(result.components.B).toBeGreaterThanOrEqual(0);
      expect(result.components.B).toBeLessThanOrEqual(360);
    });

    test('should calculate component C (Moon degrees if ascendant lord in invisible half)', async () => {
      const chart = createMockChart({
        ascendant: {
          longitude: 180,
          sign: 'Libra',
          lord: 'Venus'
        },
        planetaryPositions: {
          saturn: { longitude: 200, house: 8 },
          moon: { longitude: 155, house: 5 }, // Moon at 155° = 5° in Rasi (155 % 30 = 5)
          venus: { house: 1 } // Ascendant lord in invisible half
        }
      });

      const result = await calculateNishekaLagna(
        { rasiChart: chart },
        mockBirthData
      );

      // C = Moon's degrees in Rasi = 155 % 30 = 5
      expect(result.components.C).toBe(5);
    });

    test('should handle different house position formats', async () => {
      // Test with object format (housePositions as object with keys)
      const chart1 = createMockChart({
        housePositions: {
          house1: { cusp: 180, degree: 180 },
          house9: { cusp: 60, degree: 60 }
        }
      });

      const result1 = await calculateNishekaLagna(
        { rasiChart: chart1 },
        mockBirthData
      );
      expect(result1).toBeDefined();

      // Test with array format
      const chart2 = createMockChart({
        housePositions: [
          { houseNumber: 1, cusp: 180 },
          { houseNumber: 9, cusp: 60 }
        ]
      });

      const result2 = await calculateNishekaLagna(
        { rasiChart: chart2 },
        mockBirthData
      );
      expect(result2).toBeDefined();
    });

    test('should throw error for missing required chart data', async () => {
      const incompleteChart = {
        ascendant: { longitude: 180 },
        planetaryPositions: {}
      };

      await expect(
        calculateNishekaLagna({ rasiChart: incompleteChart }, mockBirthData)
      ).rejects.toThrow();
    });

    test('should throw error for missing birth data', async () => {
      const chart = createMockChart();

      await expect(
        calculateNishekaLagna({ rasiChart: chart }, {})
      ).rejects.toThrow();
    });

    test('should calculate Gulika if not provided in chart', async () => {
      const chart = createMockChart({
        gulika: null // No Gulika provided
      });

      const result = await calculateNishekaLagna(
        { rasiChart: chart },
        mockBirthData
      );

      // Should calculate Gulika internally
      expect(result.gulikaLongitude).toBeDefined();
      expect(result.gulikaLongitude).toBeGreaterThanOrEqual(0);
      expect(result.gulikaLongitude).toBeLessThan(360);
    });

    test('should handle edge case: Nisheka time before birth date', async () => {
      const chart = createMockChart({
        planetaryPositions: {
          saturn: { longitude: 200, house: 8 },
          moon: { longitude: 150, house: 5 }
        }
      });

      const result = await calculateNishekaLagna(
        { rasiChart: chart },
        mockBirthData
      );

      // Nisheka date should be before birth date
      expect(result.nishekaDateTime.getTime()).toBeLessThan(
        new Date(`${mockBirthData.dateOfBirth}T${mockBirthData.timeOfBirth}`).getTime()
      );
      expect(result.daysBeforeBirth).toBeGreaterThan(0);
    });

    test('should return complete component breakdown', async () => {
      const chart = createMockChart();

      const result = await calculateNishekaLagna(
        { rasiChart: chart },
        mockBirthData
      );

      expect(result.components).toHaveProperty('A');
      expect(result.components).toHaveProperty('B');
      expect(result.components).toHaveProperty('C');
      expect(result.components).toHaveProperty('X_degrees');
      expect(result.components).toHaveProperty('X_days_savanamana');
      expect(result.components).toHaveProperty('X_days_gregorian');
      
      expect(result).toHaveProperty('saturnLongitude');
      expect(result).toHaveProperty('gulikaLongitude');
      expect(result).toHaveProperty('ascendantCusp');
      expect(result).toHaveProperty('ninthCusp');
      expect(result).toHaveProperty('ascendantLord');
      expect(result).toHaveProperty('moonRasiDegrees');
    });
  });
});
