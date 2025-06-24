const HouseAnalysisService = require('../../../../../src/core/analysis/houses/HouseAnalysisService');
const TestChartFactory = require('../../../../utils/TestChartFactory');

describe('HouseAnalysisService', () => {
  let service;
  let chart;

  beforeEach(() => {
    chart = TestChartFactory.createChart('Aries');
    service = new HouseAnalysisService(chart);
  });

  describe('analyzeHouse', () => {
    it('should correctly analyze a house with a planet in it', () => {
      TestChartFactory.addPlanet(chart, 'Sun', 'Leo', 5); // Sun in 5th house
      service = new HouseAnalysisService(chart); // Recreate service with updated chart

      const analysis = service.analyzeHouse(5);
      expect(analysis).toBeDefined();
      expect(analysis.house).toBe(5);
      expect(analysis.sign).toBeDefined();
      expect(analysis.occupants.length).toBeGreaterThan(0);
    });

    it('should correctly analyze an empty house', () => {
      const analysis = service.analyzeHouse(2);

      expect(analysis).toBeDefined();
      expect(analysis.house).toBe(2);
      expect(analysis.sign).toBeDefined();
      expect(analysis.occupants).toBeDefined();
    });
  });

  describe('analyzeAllHouses', () => {
    it('should analyze all 12 houses', () => {
      const analysis = service.analyzeAllHouses();
      expect(analysis).toBeDefined();
      expect(analysis.length).toBe(12);
      expect(analysis[0].house).toBe(1);
      expect(analysis[11].house).toBe(12);
    });
  });

  describe('determineFunctionalNatures', () => {
    it('should determine functional natures for Aries ascendant', () => {
      const functionalNatures = service.determineFunctionalNatures('Aries');
      expect(functionalNatures).toBeDefined();
      expect(functionalNatures['Mars']).toBe('Yogakaraka');
      expect(functionalNatures['Jupiter']).toBe('Benefic');
    });
  });
});
