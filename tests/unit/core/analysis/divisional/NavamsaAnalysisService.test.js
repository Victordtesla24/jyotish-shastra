const NavamsaAnalysisService = require('../../../../../src/core/analysis/divisional/NavamsaAnalysisService');
const TestChartFactory = require('../../../../utils/TestChartFactory');
const sampleBirthData = require('../../../../test-data/sample-birth-data.json');

describe('NavamsaAnalysisService', () => {
  let service;
  let rasiChart;

  beforeEach(() => {
    service = new NavamsaAnalysisService();
    rasiChart = TestChartFactory.createChart('Aries', 15); // Aries ascendant at 15 degrees
  });

  it('should generate the Navamsa chart correctly for an Aries ascendant', () => {
    // For Aries Lagna at 15 degrees, the 5th navamsa of a movable sign starts from the sign itself.
    // 15 degrees is the 5th navamsa (13-20 to 16-40), so the Navamsa Lagna should be Leo.
    const navamsaChart = service.generateNavamsaChart(rasiChart);
    expect(navamsaChart).toBeDefined();
    expect(navamsaChart.ascendant.sign).toBe('Leo');
  });

  it('should correctly place a planet in the Navamsa chart', () => {
    // Sun in Taurus at 10 degrees (40 degrees absolute)
    // Taurus is a fixed sign. 10 degrees is the 4th navamsa (10-00 to 13-20).
    // For a fixed sign, navamsa count starts from the 9th sign (Capricorn).
    // 4th navamsa from Capricorn is Aries.
    TestChartFactory.addPlanet(rasiChart, 'Sun', 'Taurus', 10);

    const navamsaChart = service.generateNavamsaChart(rasiChart);
    expect(navamsaChart.planetaryPositions.sun.sign).toBe('Aries');
  });

  it('should correctly identify a Vargottama planet', () => {
    // Venus in Libra at 2 degrees (182 degrees absolute).
    // Libra is a movable sign. 2 degrees is the 1st navamsa (0-00 to 3-20).
    // For a movable sign, navamsa count starts from the sign itself.
    // 1st navamsa from Libra is Libra. So Venus is Vargottama.
    TestChartFactory.addPlanet(rasiChart, 'Venus', 'Libra', 2);

    const navamsaChart = service.generateNavamsaChart(rasiChart);
    expect(navamsaChart.planetaryPositions.venus.sign).toBe('Libra');
  });

  describe('comparePlanetaryStrength', () => {
    it('should correctly identify a Vargottama planet', () => {
      const d1Chart = TestChartFactory.createChart('Aries');
      TestChartFactory.addPlanet(d1Chart, 'Sun', 'Aries', 1);

      const d9Chart = TestChartFactory.createChart('Taurus');
      TestChartFactory.addPlanet(d9Chart, 'Sun', 'Aries', 12);

      const strengthComparison = NavamsaAnalysisService.comparePlanetaryStrength(d1Chart, d9Chart);
      expect(strengthComparison.Sun.isVargottama).toBe(true);
      expect(strengthComparison.Sun.d9Strength).toBe('Very Strong');
    });

    it('should correctly identify a planet that is exalted in D9', () => {
      const d1Chart = TestChartFactory.createChart('Aries');
      TestChartFactory.addPlanet(d1Chart, 'Mars', 'Cancer', 4); // Debilitated in D1

      const d9Chart = TestChartFactory.createChart('Taurus');
      TestChartFactory.addPlanet(d9Chart, 'Mars', 'Capricorn', 9); // Exalted in D9

      const strengthComparison = NavamsaAnalysisService.comparePlanetaryStrength(d1Chart, d9Chart);
      expect(strengthComparison.Mars.d9Dignity).toBe('Exalted');
      expect(strengthComparison.Mars.d9Strength).toBe('Strong');
    });
  });

  describe('analyzeMarriageIndications', () => {
    it('should analyze marriage indications from the Navamsa chart', () => {
      const d9Chart = NavamsaAnalysisService.generateNavamsaChart(sampleBirthData);
      const analysis = NavamsaAnalysisService.analyzeMarriageIndications(d9Chart);

      expect(analysis).toBeDefined();
      expect(analysis.spouseNature).toBeDefined();
      expect(analysis.maritalHarmony).toBeDefined();
      expect(analysis.timingOfMarriage).toBeDefined();
    });
  });
});
