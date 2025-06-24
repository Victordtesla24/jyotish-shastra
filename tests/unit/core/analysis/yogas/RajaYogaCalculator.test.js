const RajaYogaCalculator = require('../../../../../src/core/analysis/yogas/RajaYogaCalculator');

describe('RajaYogaCalculator', () => {
  let calculator;

  beforeEach(() => {
    calculator = new RajaYogaCalculator();
  });

  // Test for Raja Yoga by conjunction
  test('should detect Raja Yoga when a Kendra and Trikona lord are conjunct', () => {
    // For Cancer Ascendant: 4th lord (Kendra) is Venus, 9th lord (Trikona) is Jupiter.
    const chart = {
      ascendant: { sign: 'Cancer', longitude: 95.0 },
      planetaryPositions: {
        venus: { longitude: 280.0, dignity: 'Good' },   // Venus in Capricorn
        jupiter: { longitude: 282.0, dignity: 'Good' }, // Jupiter in Capricorn
      },
    };

    const result = calculator.detectRajaYogas(chart);
    expect(result.hasRajaYoga).toBe(true);
    expect(result.yogas[0].type).toBe('KENDRA_TRIKONA_CONJUNCTION');
  });

  // Test for Raja Yoga by mutual aspect
  test('should detect Raja Yoga when a Kendra and Trikona lord have a mutual aspect', () => {
    // For Leo Ascendant: 4th lord Mars, 9th lord Mars. Not a good example.
    // Let's use Libra Ascendant: 4th lord Saturn, 9th lord Mercury.
    const chart = {
        ascendant: { sign: 'Libra', longitude: 185.0 },
        planetaryPositions: {
            saturn: { longitude: 15.0 }, // Saturn in Aries
            mercury: { longitude: 195.0 }, // Mercury in Libra
        }
    };
    const result = calculator.detectRajaYogas(chart);
    expect(result.hasRajaYoga).toBe(true);
    expect(result.yogas[0].type).toBe('KENDRA_TRIKONA_ASPECT');
  });

  // Test for Raja Yoga by Parivartana (exchange)
  test('should detect Raja Yoga by exchange between Kendra and Trikona lords', () => {
      // For Virgo Ascendant: 4th lord Jupiter, 5th lord Saturn.
      const chart = {
          ascendant: { sign: 'Virgo', longitude: 160.0 },
          planetaryPositions: {
              jupiter: { longitude: 280.0, sign: 'Capricorn' }, // 4th lord in 5th house
              saturn: { longitude: 250.0, sign: 'Sagittarius' },  // 5th lord in 4th house
          }
      };
      const result = calculator.detectRajaYogas(chart);
      // The current implementation of isParivartana seems to be based on sign names.
      // We will need to correct it later if this test fails.
      expect(result.hasRajaYoga).toBe(true);
      expect(result.yogas[0].type).toBe('KENDRA_TRIKONA_PARIVARTANA');
  });

  // Test for no Raja Yoga
  test('should not detect Raja Yoga when there is no connection between Kendra and Trikona lords', () => {
    const chart = {
      ascendant: { sign: 'Pisces', longitude: 335.0 },
      planetaryPositions: {
        mercury: { longitude: 10.0 }, // 4th lord
        moon: { longitude: 100.0 }, // 5th lord
      },
    };
    const result = calculator.detectRajaYogas(chart);
    expect(result.hasRajaYoga).toBe(false);
  });

  test('should handle missing chart data gracefully', () => {
    const chart = {};
    const result = calculator.detectRajaYogas(chart);
    expect(result.hasRajaYoga).toBe(false);
    expect(result.description).toBe('Missing chart data.');
  });

  describe('Helper Methods', () => {
    it('should correctly identify Kendra lords for a given Lagna', () => {
        expect(calculator.getKendraLords('ARIES')).toEqual(expect.arrayContaining(['Mars', 'Moon', 'Venus', 'Saturn']));
        expect(calculator.getKendraLords('LEO')).toEqual(expect.arrayContaining(['Sun', 'Mars', 'Saturn', 'Venus']));
    });

    it('should correctly identify Trikona lords for a given Lagna', () => {
        expect(calculator.getTrikonaLords('ARIES')).toEqual(expect.arrayContaining(['Mars', 'Sun', 'Jupiter']));
        expect(calculator.getTrikonaLords('LEO')).toEqual(expect.arrayContaining(['Sun', 'Jupiter', 'Mars']));
    });

    it('should determine conjunction correctly', () => {
        const pos1 = { longitude: 100 };
        const pos2 = { longitude: 105 };
        const pos3 = { longitude: 110 };
        expect(calculator.areInConjunction(pos1, pos2)).toBe(true);
        expect(calculator.areInConjunction(pos1, pos3)).toBe(false);
      });

      it('should determine mutual aspect correctly', () => {
        const pos1 = { longitude: 10 };
        const pos2 = { longitude: 185 }; // 175 deg diff
        const pos3 = { longitude: 200 }; // 190 deg diff
        expect(calculator.haveMutualAspect(pos1, pos2)).toBe(true);
        expect(calculator.haveMutualAspect(pos1, pos3)).toBe(false);
      });

      it('should determine Parivartana correctly', () => {
        // Mars in Venus's sign (Taurus), Venus in Mars's sign (Aries)
        const posMars = { longitude: 45 }; // Taurus (30-60 degrees)
        const posVenus = { longitude: 15 }; // Aries (0-30 degrees)
        expect(calculator.isParivartana(posMars, posVenus, 'Mars', 'Venus')).toBe(true);

        const posJupiter = { longitude: 135 }; // Leo (120-150 degrees) - Jupiter in Sun's sign
        const posSun = { longitude: 105 }; // Cancer (90-120 degrees) - Sun in Moon's sign
        expect(calculator.isParivartana(posJupiter, posSun, 'Jupiter', 'Sun')).toBe(false);
      });

      it('should calculate yoga strength correctly', () => {
        const planetPositions = [
          { dignity: 'Exalted', isRetrograde: false, isCombust: false }, // 5 + 3 = 8
          { dignity: 'Own Sign', isRetrograde: true, isCombust: false }, // 5 + 2 + 1 = 8
          { dignity: 'Debilitated', isRetrograde: false, isCombust: true }, // 5 - 2 - 2 = 1
        ];
        // Total = 8 + 8 + 1 = 17. Average = 17 / 3 = 5.66...
        const strength = calculator.calculateYogaStrength(planetPositions);
        expect(strength).toBeCloseTo(5.67);
      });
  });
});
