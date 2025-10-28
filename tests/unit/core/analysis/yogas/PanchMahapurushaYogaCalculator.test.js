import PanchMahapurushaYogaCalculator from '../../../../../src/core/analysis/yogas/PanchMahapurushaYogaCalculator.js';
import TestChartFactory from '../../../../utils/TestChartFactory.js';

describe('PanchMahapurushaYogaCalculator', () => {
  let calculator;

  beforeEach(() => {
    calculator = new PanchMahapurushaYogaCalculator();
  });

  describe('detectPanchMahapurushaYogas', () => {
    it('should detect Ruchaka Yoga (Mars)', () => {
      // Arrange: Mars in own sign Aries in 1st house (Kendra)
      const chart = TestChartFactory.createChart({
        ascendant: { sign: 'ARIES', longitude: 15.0 },
        planetaryPositions: {
          mars: { longitude: 25.0, sign: 'ARIES', dignity: 'Own Sign' },
        },
      });

      // Act
      const result = calculator.detectPanchMahapurushaYogas(chart);

      // Assert
      expect(result.hasPanchMahapurushaYoga).toBe(true);
      expect(result.yogas[0].yoga).toBe('RUCHAKA');
      expect(result.yogas[0].planet).toBe('Mars');
    });

    it('should detect Bhadra Yoga (Mercury)', () => {
        // Arrange: Mercury in own sign Gemini in 1st house (Kendra)
        const chart = TestChartFactory.createChart({
          ascendant: { sign: 'GEMINI', longitude: 75.0 },
          planetaryPositions: {
            mercury: { longitude: 80.0, sign: 'GEMINI', dignity: 'Own Sign' },
          },
        });

        // Act
        const result = calculator.detectPanchMahapurushaYogas(chart);

        // Assert
        expect(result.hasPanchMahapurushaYoga).toBe(true);
        expect(result.yogas[0].yoga).toBe('BHADRA');
        expect(result.yogas[0].planet).toBe('Mercury');
    });

    it('should detect Hamsa Yoga (Jupiter)', () => {
        // Arrange: Jupiter in own sign Sagittarius in 1st house (Kendra)
        const chart = {
            ascendant: { sign: 'SAGITTARIUS', longitude: 245.0 },
            planetaryPositions: {
              jupiter: { longitude: 250.0, sign: 'SAGITTARIUS', dignity: 'Own Sign' },
            },
          };

          // Act
          const result = calculator.detectPanchMahapurushaYogas(chart);

          // Assert
          expect(result.hasPanchMahapurushaYoga).toBe(true);
          expect(result.yogas[0].yoga).toBe('HAMSA');
          expect(result.yogas[0].planet).toBe('Jupiter');
    });

    it('should detect Malavya Yoga (Venus)', () => {
        // Arrange: Venus in own sign Libra in 1st house (Kendra)
        const chart = {
            ascendant: { sign: 'LIBRA', longitude: 185.0 },
            planetaryPositions: {
              venus: { longitude: 190.0, sign: 'LIBRA', dignity: 'Own Sign' },
            },
          };

          // Act
          const result = calculator.detectPanchMahapurushaYogas(chart);

          // Assert
          expect(result.hasPanchMahapurushaYoga).toBe(true);
          expect(result.yogas[0].yoga).toBe('MALAVYA');
          expect(result.yogas[0].planet).toBe('Venus');
    });

    it('should detect Sasha Yoga (Saturn)', () => {
        // Arrange: Saturn in own sign Capricorn in 1st house (Kendra)
        const chart = {
            ascendant: { sign: 'CAPRICORN', longitude: 275.0 },
            planetaryPositions: {
              saturn: { longitude: 280.0, sign: 'CAPRICORN', dignity: 'Own Sign' },
            },
          };

          // Act
          const result = calculator.detectPanchMahapurushaYogas(chart);

          // Assert
          expect(result.hasPanchMahapurushaYoga).toBe(true);
          expect(result.yogas[0].yoga).toBe('SASA');
          expect(result.yogas[0].planet).toBe('Saturn');
    });

    it('should detect multiple Panch Mahapurusha Yogas in a single chart', () => {
        // Arrange
        const chart = {
          ascendant: { sign: 'LIBRA', longitude: 185 },
          planetaryPositions: {
            saturn: { longitude: 190, sign: 'LIBRA', dignity: 'Exalted' }, // Sasa Yoga in 1st house (Saturn exaltation in Libra)
            jupiter: { longitude: 275, sign: 'CANCER', dignity: 'Exalted' }, // Hamsa Yoga in 4th house (Jupiter exaltation in Cancer)
          },
        };

        // Act
        const result = calculator.detectPanchMahapurushaYogas(chart);

        // Assert
        expect(result.hasPanchMahapurushaYoga).toBe(true);
        expect(result.totalCount).toBe(2);
        const yogaNames = result.yogas.map(y => y.yoga);
        expect(yogaNames).toEqual(expect.arrayContaining(['HAMSA', 'SASA']));
      });


    it('should not detect a yoga if the planet is not in a Kendra', () => {
        // Arrange: Mars in 2nd house, not a kendra
        const chart = {
            ascendant: { sign: 'ARIES', longitude: 15.0 },
            planetaryPositions: {
              mars: { longitude: 50.0, sign: 'TAURUS' }, // 2nd house, not Kendra
            },
          };

          // Act
          const result = calculator.detectPanchMahapurushaYogas(chart);

          // Assert
          expect(result.hasPanchMahapurushaYoga).toBe(false);
    });

    it('should return gracefully if chart data is missing', () => {
        // Arrange
        const chart = {};
        // Act
        const result = calculator.detectPanchMahapurushaYogas(chart);
        // Assert
        expect(result.hasPanchMahapurushaYoga).toBe(false);
        expect(result.description).toBe('Missing chart data.');
      });
  });
});
