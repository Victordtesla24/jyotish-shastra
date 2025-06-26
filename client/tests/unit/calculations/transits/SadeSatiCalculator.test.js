const SadeSatiCalculator = require('../../../../src/core/calculations/transits/SadeSatiCalculator.js');
const TestChartFactory = require('../../../utils/TestChartFactory.js');

describe('SadeSatiCalculator', () => {
    let calculator;
    let chart;

    beforeEach(() => {
        calculator = new SadeSatiCalculator();
    });

    it('should correctly identify when Sade Sati is active', () => {
        chart = TestChartFactory.createChart('Aries');
        TestChartFactory.addPlanet(chart, 'Moon', 'Taurus', 15); // Moon in Taurus

        // Mock Saturn to be in Aries (12th from Moon)
        // Saturn at longitude 15° = sign 0 (Aries), which is 12th from Moon in Taurus (sign 1)
        const mockSaturnPosition = {
            longitude: 15,
            sign: 0, // Aries = sign 0
            degree: 15,
            signName: 'Aries',
            isRetrograde: false
        };
        calculator.calculateSaturnPosition = jest.fn().mockReturnValue(mockSaturnPosition);

        const analysis = calculator.calculateSadeSati(chart);

        expect(analysis.currentStatus.isActive).toBe(true);
        expect(analysis.currentStatus.phase).toBe('rising');
    });

    it('should correctly identify when Sade Sati is not active', () => {
        chart = TestChartFactory.createChart('Aries');
        TestChartFactory.addPlanet(chart, 'Moon', 'Taurus', 15); // Moon in Taurus

        // Mock Saturn to be in Leo (4th from Moon)
        // Saturn at longitude 135° = sign 4 (Leo), which is not in Sade Sati position relative to Moon in Taurus
        const mockSaturnPosition = {
            longitude: 135,
            sign: 4, // Leo = sign 4
            degree: 15,
            signName: 'Leo',
            isRetrograde: false
        };
        calculator.calculateSaturnPosition = jest.fn().mockReturnValue(mockSaturnPosition);

        const analysis = calculator.calculateSadeSati(chart);

        expect(analysis.currentStatus.isActive).toBe(false);
    });
});
