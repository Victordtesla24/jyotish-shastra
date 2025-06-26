const GrahaDrishtiCalculator = require('../../../../src/core/calculations/aspects/GrahaDrishtiCalculator');
const TestChartFactory = require('../../../utils/TestChartFactory');

describe('GrahaDrishtiCalculator', () => {
    let calculator;

    beforeEach(() => {
        calculator = new GrahaDrishtiCalculator();
    });

    it('should calculate the aspects of Mars correctly', () => {
        // Create chart with proper planet structure for GrahaDrishtiCalculator
        const chart = {
            planets: {
                Mars: {
                    name: 'Mars',
                    sign: 'Aries',
                    house: 1,
                    longitude: 15
                }
            }
        };

        const aspectResult = calculator.calculateAllAspects(chart);

        expect(aspectResult).toBeDefined();
        expect(aspectResult.planetaryAspects).toBeDefined();
        expect(aspectResult.planetaryAspects.Mars).toBeDefined();
        expect(aspectResult.planetaryAspects.Mars.aspects).toBeDefined();
        expect(aspectResult.planetaryAspects.Mars.aspects.length).toBe(3); // 4th, 7th, 8th aspects
    });
});
