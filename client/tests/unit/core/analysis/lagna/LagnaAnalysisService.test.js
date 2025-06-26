const LagnaAnalysisService = require('../../../../../src/services/analysis/LagnaAnalysisService');
const sampleBirthData = require('../../../../fixtures/sample-birth-data.json');

describe('LagnaAnalysisService', () => {
  let service;
  let chart;

  beforeAll(() => {
    service = new LagnaAnalysisService();

    // Mock planetary positions data for test
    const mockPlanetaryPositions = {
      sun: { longitude: 45, sign: 'Leo', house: 5, dignity: 'Own' },
      moon: { longitude: 90, sign: 'Cancer', house: 4, dignity: 'Own' },
      mars: { longitude: 270, sign: 'Capricorn', house: 10, dignity: 'Exalted' },
      mercury: { longitude: 30, sign: 'Gemini', house: 3, dignity: 'Own' },
      jupiter: { longitude: 210, sign: 'Sagittarius', house: 9, dignity: 'Own' },
      venus: { longitude: 15, sign: 'Taurus', house: 2, dignity: 'Own' },
      saturn: { longitude: 190, sign: 'Libra', house: 7, dignity: 'Exalted' }
    };

    chart = {
      ascendant: {
        sign: 'ARIES',
        longitude: 15, // 15 degrees into Aries
        degree: 15
      },
      planetaryPositions: mockPlanetaryPositions
    };
  });

  describe('analyzeLagnaSign', () => {
    it('should return the correct analysis for the Lagna sign', () => {
      const analysis = service.analyzeLagnaSign(chart.ascendant.sign);
      expect(analysis).toBeDefined();
      expect(analysis.sign).toBe('ARIES');
      expect(analysis.ruler).toBe('Mars');
      expect(analysis.quality).toBe('Cardinal');
      expect(analysis.element).toBe('Fire');
      expect(analysis.description).toContain('energetic');
    });
  });

  describe('analyzeLagnaLord', () => {
    it('should return the correct analysis for the Lagna lord', () => {
      const lagnaLord = 'Mars';
      const lagnaLordPlacement = { sign: 'Capricorn', house: 10, isRetrograde: false, isCombust: false };
      const analysis = service.analyzeLagnaLord(lagnaLord, lagnaLordPlacement);
      expect(analysis).toBeDefined();
      expect(analysis.house).toBe(10);
      expect(analysis.sign).toBe('Capricorn');
      expect(analysis.dignity).toBe('Exalted');
      expect(analysis.effects).toContain('Career success and recognition');
    });
  });

  describe('determineFunctionalNature', () => {
    it('should determine the functional nature of planets for Aries Lagna', () => {
      const functionalNature = service.determineFunctionalNature(chart.ascendant.sign, chart.planetaryPositions);
      expect(functionalNature).toBeDefined();
      expect(functionalNature.benefic).toBeDefined();
      expect(functionalNature.malefic).toBeDefined();
      expect(functionalNature.neutral).toBeDefined();
      expect(functionalNature.benefic.length).toBeGreaterThanOrEqual(0);
    });
  });
});
