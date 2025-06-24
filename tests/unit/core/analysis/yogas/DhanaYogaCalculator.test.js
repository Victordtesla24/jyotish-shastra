const DhanaYogaCalculator = require('../../../../../src/core/analysis/yogas/DhanaYogaCalculator');

describe('DhanaYogaCalculator', () => {
    let calculator;

    beforeEach(() => {
        calculator = new DhanaYogaCalculator();
    });

    // Test case for a classic Dhana Yoga by conjunction
    test('should detect Dhana Yoga when 2nd and 11th lords are conjunct', () => {
        const chart = {
            ascendant: { sign: 'Leo', longitude: 125.12 },
            planetaryPositions: {
                mercury: { longitude: 155.5 }, // 2nd Lord (Virgo)
                venus: { longitude: 158.2 },   // 11th Lord (Gemini) - Incorrect, Venus rules Taurus/Libra. But for test logic.
            },
        };
        // For Leo ascendant, 2nd lord is Mercury, 11th lord is Mercury. Let's adjust.
        // Let's use Aries Ascendant. 2nd lord Venus, 11th lord Saturn.
        const ariesAscChart = {
            ascendant: { sign: 'Aries', longitude: 15.0 },
            planetaryPositions: {
                venus: { longitude: 280.0 }, // 2nd lord in Capricorn
                saturn: { longitude: 282.0 }, // 11th lord in Capricorn
            }
        }

        const result = calculator.detectDhanaYogas(ariesAscChart);

        expect(result.hasDhanaYoga).toBe(true);
        expect(result.yogas[0].type).toBe('WEALTH_LORDS_CONJUNCTION');
        expect(result.yogas[0].planets).toContain('Venus');
        expect(result.yogas[0].planets).toContain('Saturn');
    });

    // Test case for Dhana Yoga by exchange of houses (Parivartana Yoga)
    test('should detect Dhana Yoga when 2nd and 9th lords exchange houses', () => {
        const chart = {
            ascendant: { sign: 'Taurus', longitude: 45.0 },
            planetaryPositions: {
                mercury: { longitude: 285.0 }, // 2nd lord Mercury in 9th house (Capricorn: 270-300°)
                saturn: { longitude: 75.0 },    // 9th lord Saturn in 2nd house (Gemini: 60-90°)
            }
        };
        const result = calculator.detectDhanaYogas(chart);

        expect(result.hasDhanaYoga).toBe(true);
        expect(result.yogas[0].type).toBe('WEALTH_LORDS_EXCHANGE');
    });

    // Test case for multiple benefics in a wealth house
    test('should detect Dhana Yoga with multiple benefics in the 2nd house', () => {
        const chart = {
            ascendant: { sign: 'Cancer', longitude: 95.0 },
            planetaryPositions: {
                jupiter: { longitude: 125.0, planet: 'Jupiter' }, // Jupiter in Leo (2nd house)
                venus: { longitude: 128.0, planet: 'Venus' },   // Venus in Leo (2nd house)
            }
        };

        const result = calculator.detectDhanaYogas(chart);

        expect(result.hasDhanaYoga).toBe(true);
        expect(result.yogas[0].type).toBe('MULTIPLE_BENEFICS_IN_WEALTH_HOUSE');
        expect(result.yogas[0].house).toBe(2);
    });

    // Test case where no Dhana Yoga is present
    test('should not detect Dhana Yoga when wealth lords are not connected', () => {
        const chart = {
            ascendant: { sign: 'Scorpio', longitude: 220.0 },
            planetaryPositions: {
                jupiter: { longitude: 10.0 }, // 2nd & 5th lord in Aries
                mercury: { longitude: 100.0 }, // 11th lord in Cancer
            },
        };

        const result = calculator.detectDhanaYogas(chart);

        expect(result.hasDhanaYoga).toBe(false);
        expect(result.yogas.length).toBe(0);
    });

    test('should handle missing chart data gracefully', () => {
        const chart = {};
        const result = calculator.detectDhanaYogas(chart);
        expect(result.hasDhanaYoga).toBe(false);
        expect(result.description).toBe('Missing chart data.');
    });
});
