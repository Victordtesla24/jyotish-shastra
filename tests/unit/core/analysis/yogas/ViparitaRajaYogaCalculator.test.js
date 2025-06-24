const ViparitaRajaYogaCalculator = require('../../../../../src/core/analysis/yogas/ViparitaRajaYogaCalculator');
const TestChartFactory = require('../../../../utils/TestChartFactory');

describe('ViparitaRajaYogaCalculator', () => {
  let calculator;

  beforeEach(() => {
    calculator = new ViparitaRajaYogaCalculator();
  });

  describe('detectViparitaRajaYogas', () => {
    it('should detect Harsha Yoga (6th and 8th lord exchange)', () => {
      // Arrange: Aries ascendant. 6th lord Mercury, 8th lord Mars.
      // Mercury in 8th house, Mars in 6th house.
      const chart = {
        ascendant: { sign: 'ARIES', longitude: 10 },
        planetaryPositions: {
          mercury: { longitude: 235, sign: 'SCORPIO' }, // 6th lord in 8th house
          mars: { longitude: 175, sign: 'VIRGO' },     // 8th lord in 6th house
        },
      };

      // Act
      const result = calculator.detectViparitaRajaYogas(chart);

      // Assert
      expect(result.hasViparitaRajaYoga).toBe(true);
      expect(result.yogas[0].subType).toBe('Harsha Yoga');
    });

    it('should detect Sarala Yoga (6th and 12th lord exchange)', () => {
        // Arrange: Taurus ascendant. 6th lord Venus, 12th lord Mars.
        // Venus in 12th house, Mars in 6th house.
        const chart = {
          ascendant: { sign: 'TAURUS', longitude: 40 },
          planetaryPositions: {
            venus: { longitude: 10, sign: 'ARIES' },    // 6th lord in 12th house
            mars: { longitude: 190, sign: 'LIBRA' },     // 12th lord in 6th house
          },
        };

        // Act
        const result = calculator.detectViparitaRajaYogas(chart);

        // Assert
        expect(result.hasViparitaRajaYoga).toBe(true);
        expect(result.yogas[0].subType).toBe('Sarala Yoga');
      });

      it('should detect Vimala Yoga (8th and 12th lord exchange)', () => {
        // Arrange: Gemini ascendant. 8th lord Saturn, 12th lord Venus.
        // Saturn in 12th house, Venus in 8th house.
        const chart = {
          ascendant: { sign: 'GEMINI', longitude: 75 },
          planetaryPositions: {
            saturn: { longitude: 45, sign: 'TAURUS' },    // 8th lord in 12th house
            venus: { longitude: 285, sign: 'CAPRICORN' }, // 12th lord in 8th house
          },
        };

        // Act
        const result = calculator.detectViparitaRajaYogas(chart);

        // Assert
        expect(result.hasViparitaRajaYoga).toBe(true);
        expect(result.yogas[0].subType).toBe('Vimala Yoga');
      });


    it('should not detect a yoga if no exchange between dusthana lords occurs', () => {
      // Arrange
      const chart = {
        ascendant: { sign: 'ARIES', longitude: 10 },
        planetaryPositions: {
          // No exchange here - random positions
          mercury: { longitude: 100, sign: 'CANCER' },
          mars: { longitude: 200, sign: 'LIBRA' },
        },
      };

      // Act
      const result = calculator.detectViparitaRajaYogas(chart);

      // Assert
      expect(result.hasViparitaRajaYoga).toBe(false);
    });

    it('should return gracefully if chart data is missing', () => {
        // Arrange
        const chart = {};
        // Act
        const result = calculator.detectViparitaRajaYogas(chart);
        // Assert
        expect(result.hasViparitaRajaYoga).toBe(false);
        expect(result.description).toContain('Missing chart data');
      });
  });
});
