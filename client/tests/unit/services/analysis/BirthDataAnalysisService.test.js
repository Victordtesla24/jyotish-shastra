const BirthDataAnalysisService = require('../../../../src/services/analysis/BirthDataAnalysisService');
const sampleBirthData = require('../../../fixtures/sample-birth-data.json');

describe('BirthDataAnalysisService', () => {
    let service;
    let chart;

    beforeEach(() => {
        service = new BirthDataAnalysisService();
        chart = { // A simplified chart object for testing
            ascendant: { sign: 'Aries', longitude: 15.0, degree: 15.0 }, // Added degree property
            planetaryPositions: {
                sun: { name: 'Sun', sign: 'Leo', longitude: 135.0 },
                moon: { name: 'Moon', sign: 'Taurus', longitude: 45.0, nakshatra: 'Rohini' }
            },
            nakshatra: { name: 'Rohini' },
            birthData: sampleBirthData
        };
    });

    it('should analyze birth details', () => {
        // Use the first test case and flatten the structure for the service
        const testBirthData = {
            dateOfBirth: sampleBirthData.testCases[0].birthData.dateOfBirth,
            timeOfBirth: sampleBirthData.testCases[0].birthData.timeOfBirth,
            latitude: sampleBirthData.testCases[0].birthData.placeOfBirth.latitude,
            longitude: sampleBirthData.testCases[0].birthData.placeOfBirth.longitude,
            placeOfBirth: sampleBirthData.testCases[0].birthData.placeOfBirth.name
        };
        const analysis = service.analyzeBirthDetails(testBirthData);
        expect(analysis).toBeDefined();
        expect(analysis.completeness).toBe(100);
        expect(analysis.missing.length).toBe(0);
    });

    it('should analyze chart generation', () => {
        const analysis = service.analyzeChartGeneration(chart, chart); // Using same chart for rasi and navamsa for simplicity
        expect(analysis).toBeDefined();
        expect(analysis.status).toBe('complete');
    });

    it('should analyze the ascendant', () => {
        const analysis = service.analyzeAscendant(chart);
        expect(analysis).toBeDefined();
        expect(analysis.lagnaSign).toBe('Aries');
    });

    it('should analyze planetary positions', () => {
        const analysis = service.analyzePlanetaryPositions(chart);
        expect(analysis).toBeDefined();
        expect(Object.keys(analysis.planetaryPositions).length).toBeGreaterThan(0);
    });

    it('should analyze the Mahadasha', () => {
        const analysis = service.analyzeMahadasha(chart, sampleBirthData);
        expect(analysis).toBeDefined();
        expect(analysis.currentDasha).toBeDefined();
    });
});
