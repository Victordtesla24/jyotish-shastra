const GajaKesariYogaCalculator = require('../../../../../src/core/analysis/yogas/GajaKesariYogaCalculator');
const TestChartFactory = require('../../../../utils/TestChartFactory');
const sampleBirthData = require('../../../../fixtures/sample-birth-data.json');

describe('GajaKesariYogaCalculator', () => {
  let calculator;

  beforeEach(() => {
    calculator = new GajaKesariYogaCalculator();
  });

  describe('detectGajaKesariYoga', () => {
    it('should detect Gaja Kesari Yoga when Jupiter is in the 1st house from the Moon', () => {
      // Arrange
      const chart = TestChartFactory.createChart({
        ascendant: { sign: 'ARIES', longitude: 15 },
        planetaryPositions: {
          moon: { longitude: 95, sign: 'CANCER' }, // Moon in Cancer
          jupiter: { longitude: 100, sign: 'CANCER' }, // Jupiter in Cancer (1st from Moon)
        },
      });

      // Act
      const result = calculator.detectGajaKesariYoga(chart);

      // Assert
      expect(result.hasGajaKesariYoga).toBe(true);
      expect(result.type).toBe('GAJA_KESARI_YOGA');
      expect(result.description).toContain('forming Gaja Kesari Yoga');
    });

    it('should detect Gaja Kesari Yoga when Jupiter is in the 4th house from the Moon', () => {
        // Arrange
        const chart = TestChartFactory.createChart({
          ascendant: { sign: 'TAURUS', longitude: 45 },
          planetaryPositions: {
            moon: { longitude: 65, sign: 'GEMINI' }, // Moon in Gemini
            jupiter: { longitude: 155, sign: 'VIRGO' }, // Jupiter in Virgo (4th from Moon)
          },
        });

        // Act
        const result = calculator.detectGajaKesariYoga(chart);

        // Assert
        expect(result.hasGajaKesariYoga).toBe(true);
        expect(result.description).toContain('forming Gaja Kesari Yoga');
      });

      it('should detect Gaja Kesari Yoga when Jupiter is in the 7th house from the Moon', () => {
        // Arrange
        const chart = TestChartFactory.createChart({
          ascendant: { sign: 'PISCES', longitude: 340 },
          planetaryPositions: {
            moon: { longitude: 20, sign: 'ARIES' }, // Moon in Aries
            jupiter: { longitude: 200, sign: 'LIBRA' }, // Jupiter in Libra (7th from Moon)
          },
        });

        // Act
        const result = calculator.detectGajaKesariYoga(chart);

        // Assert
        expect(result.hasGajaKesariYoga).toBe(true);
        expect(result.description).toContain('forming Gaja Kesari Yoga');
      });

      it('should detect Gaja Kesari Yoga when Jupiter is in the 10th house from the Moon', () => {
        // Arrange
        const chart = TestChartFactory.createChart({
          ascendant: { sign: 'LEO', longitude: 125 },
          planetaryPositions: {
            moon: { longitude: 185, sign: 'LIBRA' }, // Moon in Libra
            jupiter: { longitude: 95, sign: 'CANCER' }, // Jupiter in Cancer (10th from Moon)
          },
        });

        // Act
        const result = calculator.detectGajaKesariYoga(chart);

        // Assert
        expect(result.hasGajaKesariYoga).toBe(true);
        expect(result.description).toContain('forming Gaja Kesari Yoga');
      });

    it('should NOT detect Gaja Kesari Yoga when Jupiter is in the 2nd house from the Moon', () => {
      // Arrange
      const chart = TestChartFactory.createChart({
        ascendant: { sign: 'ARIES', longitude: 15 },
        planetaryPositions: {
          moon: { longitude: 95, sign: 'CANCER' },
          jupiter: { longitude: 125, sign: 'LEO' }, // 2nd from moon
        },
      });

      // Act
      const result = calculator.detectGajaKesariYoga(chart);

      // Assert
      expect(result.hasGajaKesariYoga).toBe(false);
      expect(result.description).not.toContain('forming Gaja Kesari Yoga');
    });

    it('should return gracefully if Jupiter or Moon positions are missing', () => {
        // Arrange
        const chartWithoutMoon = {
          ascendant: { sign: 'ARIES', longitude: 15 },
          planetaryPositions: {
            jupiter: { longitude: 100, sign: 'CANCER' },
            // Moon is intentionally missing
          },
        };

        // Act
        const result = calculator.detectGajaKesariYoga(chartWithoutMoon);

        // Assert
        expect(result.hasGajaKesariYoga).toBe(false);
        expect(result.description).toContain('Missing Jupiter or Moon position.');
      });

      it('should handle the 12-house wrap-around correctly (e.g., Moon in Pisces, Jupiter in Gemini)', () => {
        // Arrange
        const chart = TestChartFactory.createChart({
            ascendant: { sign: 'CANCER', longitude: 95 },
            planetaryPositions: {
              moon: { longitude: 335, sign: 'PISCES' },    // Moon in Pisces (12th sign)
              jupiter: { longitude: 65, sign: 'GEMINI' },   // Jupiter in Gemini (3rd sign) - 4th from Moon
            },
          });

          // Act
        const result = calculator.detectGajaKesariYoga(chart);

          // Assert
          expect(result.hasGajaKesariYoga).toBe(true);
          expect(result.description).toContain('forming Gaja Kesari Yoga');
      });
  });

  // Test case based on a known chart where Gaja Kesari Yoga is present
  test('should detect Gaja Kesari Yoga when Jupiter is in a quadrant from the Moon', () => {
    const chart = {
      ascendant: { longitude: 310.45 }, // Aquarius Ascendant
      planetaryPositions: {
        moon: { longitude: 315.2, dignity: 'Own Sign' }, // Moon in Aquarius
        jupiter: { longitude: 135.2, dignity: 'Exalted' },  // Jupiter in Leo (7th house from Moon - Kendra)
      },
    };

    const result = calculator.detectGajaKesariYoga(chart);

    expect(result.hasGajaKesariYoga).toBe(true);
    expect(result.type).toBe('GAJA_KESARI_YOGA');
    expect(result.description).toContain('forming Gaja Kesari Yoga');
  });

  // Test case where Gaja Kesari Yoga is not present
  test('should not detect Gaja Kesari Yoga when Jupiter is not in a quadrant from the Moon', () => {
    const chart = {
      ascendant: { longitude: 125.12 }, // Leo Ascendant
      planetaryPositions: {
        moon: { longitude: 25.6 },   // Moon in Aries (9th house)
        jupiter: { longitude: 185.3 }, // Jupiter in Libra (3rd house)
      },
    };

    const result = calculator.detectGajaKesariYoga(chart);

    expect(result.hasGajaKesariYoga).toBe(false);
    expect(result.description).toContain('Jupiter is in');
  });

  // Test with a case from the fixture file to ensure integration
  test('should correctly analyze a chart from the sample birth data', () => {
    // NOTE: This test depends on pre-calculated positions for a specific birth data
    // In a real scenario, these positions would be generated by the ChartGenerationService
    const chartFromFixture = {
      ascendant: { longitude: 125.12 }, // Assuming Leo for test_case_4
      planetaryPositions: {
        moon: { longitude: 18.5, dignity: 'Strong' },   // Aries
        jupiter: { longitude: 340.2, dignity: 'Good' }, // Pisces
        sun: { longitude: 18.9, dignity: 'Excellent' } // Aries
      }
    };

    const result = calculator.detectGajaKesariYoga(chartFromFixture);

    // Based on Aries Moon and Pisces Jupiter, they are in a 12/2 position, not Kendra.
    expect(result.hasGajaKesariYoga).toBe(false);
  });

  test('should handle missing planetary data gracefully', () => {
    const chart = {
      ascendant: { longitude: 125.12 },
      planetaryPositions: {
        moon: { longitude: 25.6 }
        // Jupiter data is missing
      }
    };

    const result = calculator.detectGajaKesariYoga(chart);
    expect(result.hasGajaKesariYoga).toBe(false);
    expect(result.description).toContain('Missing Jupiter or Moon position');
  });
});
