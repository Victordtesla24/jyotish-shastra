import LuminariesAnalysisService from '../../../../src/services/analysis/LuminariesAnalysisService.js';
import TestChartFactory from '../../../utils/TestChartFactory.js';

describe('LuminariesAnalysisService', () => {
    let service;
    let chart;

    beforeEach(() => {
        service = new LuminariesAnalysisService();
        // Create chart with object format planetary positions for LuminariesAnalysisService
        chart = {
            ascendant: { sign: 'Aries', longitude: 15 },
            planetaryPositions: {
                sun: {
                    name: 'Sun',
                    sign: 'Leo',
                    longitude: 135, // Leo 15 degrees
                    degree: 15,
                    speed: 1,
                    isRetrograde: false
                },
                moon: {
                    name: 'Moon',
                    sign: 'Taurus',
                    longitude: 45, // Taurus 15 degrees
                    degree: 15,
                    speed: 13,
                    isRetrograde: false
                }
            }
        };
    });

    it('should perform a basic analysis of the Sun and Moon', () => {
        const analysis = service.analyzeLuminaries(chart);

        expect(analysis).toBeDefined();
        expect(analysis.hasLuminariesAnalysis).toBe(true);

        // Sun analysis
        expect(analysis.sunAnalysis).toBeDefined();
        expect(analysis.sunAnalysis.position.sign).toBe('LEO');
        expect(analysis.sunAnalysis.position.house).toBe(5);
        expect(analysis.sunAnalysis.dignity.dignity).toBe('Own Sign');

        // Moon analysis
        expect(analysis.moonAnalysis).toBeDefined();
        expect(analysis.moonAnalysis.position.sign).toBe('TAURUS');
        expect(analysis.moonAnalysis.position.house).toBe(2);
        expect(analysis.moonAnalysis.dignity.dignity).toBe('Exalted');

        // Relationship analysis
        expect(analysis.luminariesRelationship).toBeDefined();
        expect(analysis.luminariesRelationship.separation.degrees).toBeCloseTo(90);
    });
});
