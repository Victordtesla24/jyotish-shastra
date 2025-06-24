const VargottamaDetector = require('../../../../../src/core/analysis/divisional/VargottamaDetector');
const TestChartFactory = require('../../../../utils/TestChartFactory');

describe('VargottamaDetector', () => {
    let detector;
    let rasiChart;
    let navamsaChart;

    beforeEach(() => {
        detector = new VargottamaDetector();
        // Create charts with object format planetary positions for VargottamaDetector
        rasiChart = {
            ascendant: 'Aries',
            planetaryPositions: {}
        };
        navamsaChart = {
            ascendant: 'Leo',
            planetaryPositions: {}
        };
    });

    it('should detect a Vargottama planet correctly', () => {
        rasiChart.planetaryPositions.sun = {
            name: 'Sun',
            sign: 'Leo',
            longitude: 135,
            degree: 15
        };
        navamsaChart.planetaryPositions.sun = {
            name: 'Sun',
            sign: 'Leo',
            longitude: 140,
            degree: 20
        };

        const vargottamaPlanets = detector.detectVargottamaPlanets(rasiChart, navamsaChart);

        expect(vargottamaPlanets).toBeDefined();
        expect(vargottamaPlanets).toContain('sun');
        expect(vargottamaPlanets.length).toBe(1);
    });

    it('should not detect a Vargottama planet when signs are different', () => {
        rasiChart.planetaryPositions.moon = {
            name: 'Moon',
            sign: 'Taurus',
            longitude: 40,
            degree: 10
        };
        navamsaChart.planetaryPositions.moon = {
            name: 'Moon',
            sign: 'Gemini',
            longitude: 65,
            degree: 5
        };

        const vargottamaPlanets = detector.detectVargottamaPlanets(rasiChart, navamsaChart);

        expect(vargottamaPlanets).not.toContain('moon');
    });

    it('should handle charts with no planets', () => {
        const emptyRasiChart = { planetaryPositions: {} };
        const emptyNavamsaChart = { planetaryPositions: {} };
        const vargottamaPlanets = detector.detectVargottamaPlanets(emptyRasiChart, emptyNavamsaChart);
        expect(vargottamaPlanets.length).toBe(0);
    });
});
