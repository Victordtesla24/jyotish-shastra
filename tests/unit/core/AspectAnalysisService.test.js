const AspectAnalysisService = require('../../../src/core/analysis/aspects/AspectAnalysisService');

describe('AspectAnalysisService', () => {
  let service;
  let mockChart;

  beforeEach(() => {
    // Create a detailed mock chart object that matches the structure expected by the service
    mockChart = {
      planets: [
        { name: 'Sun', longitude: 15 },
        { name: 'Moon', longitude: 255 },
        { name: 'Mars', longitude: 15 },
        { name: 'Mercury', longitude: 75 },
        { name: 'Jupiter', longitude: 15 },
        { name: 'Venus', longitude: 195 },
        { name: 'Saturn', longitude: 15 },
      ],
      houses: Array.from({ length: 12 }, (_, i) => ({ house: i + 1, sign: 'SomeSign' })),
    };
    service = new AspectAnalysisService(mockChart);
  });

  describe('Aspect Detection', () => {
    test('should identify standard 7th house aspects', () => {
      // Example: Sun at 15 deg, Venus at 195 deg (180 deg apart)
      mockChart.planets.find(p => p.name === 'Sun').longitude = 15;
      mockChart.planets.find(p => p.name === 'Venus').longitude = 195;
      const aspects = service.calculateAllAspects(mockChart.planets);
      const sunAspects = aspects.filter(a => a.source === 'Sun');
      const venusAspect = sunAspects.find(a => a.target.planet === 'Venus');
      expect(venusAspect).toBeDefined();
      expect(venusAspect.type).toBe('7th');
    });

    test('should identify Mars special aspects (4th and 8th)', () => {
      // Mars at 15 deg (Aries). 4th house from there is Cancer, 8th is Scorpio.
      mockChart.planets.find(p => p.name === 'Mars').longitude = 15;
      mockChart.planets.find(p => p.name === 'Jupiter').longitude = 105; // Jupiter in Cancer
      mockChart.planets.find(p => p.name === 'Saturn').longitude = 225; // Saturn in Scorpio
      const aspects = service.calculateAllAspects(mockChart.planets);
      const marsAspects = aspects.filter(a => a.source === 'Mars');
      const jupiterAspect = marsAspects.find(a => a.target.planet === 'Jupiter');
      const saturnAspect = marsAspects.find(a => a.target.planet === 'Saturn');
      expect(jupiterAspect.type).toBe('4th');
      expect(saturnAspect.type).toBe('8th');
    });

    test('should identify Jupiter special aspects (5th and 9th)', () => {
      // Jupiter at 15 deg (Aries). 5th house is Leo, 9th is Sagittarius.
      mockChart.planets.find(p => p.name === 'Jupiter').longitude = 15;
      mockChart.planets.find(p => p.name === 'Sun').longitude = 135; // Sun in Leo
      mockChart.planets.find(p => p.name === 'Moon').longitude = 255; // Moon in Sagittarius
      const aspects = service.calculateAllAspects(mockChart.planets);
      const jupiterAspects = aspects.filter(a => a.source === 'Jupiter');
      const sunAspect = jupiterAspects.find(a => a.target.planet === 'Sun');
      const moonAspect = jupiterAspects.find(a => a.target.planet === 'Moon');
      expect(sunAspect.type).toBe('5th');
      expect(moonAspect.type).toBe('9th');
    });

    test('should identify Saturn special aspects (3rd and 10th)', () => {
      // Saturn at 15 deg (Aries). 3rd house is Gemini, 10th is Capricorn.
      mockChart.planets.find(p => p.name === 'Saturn').longitude = 15;
      mockChart.planets.find(p => p.name === 'Mercury').longitude = 75; // Mercury in Gemini
      mockChart.planets.find(p => p.name === 'Mars').longitude = 285; // Mars in Capricorn
      const aspects = service.calculateAllAspects(mockChart.planets);
      const saturnAspects = aspects.filter(a => a.source === 'Saturn');
      const mercuryAspect = saturnAspects.find(a => a.target.planet === 'Mercury');
      const marsAspect = saturnAspects.find(a => a.target.planet === 'Mars');
      expect(mercuryAspect.type).toBe('3rd');
      expect(marsAspect.type).toBe('10th');
    });
  });

  describe('Aspect Analysis', () => {
    test('should analyze the effect of a benefic aspect', () => {
      // Jupiter (benefic) aspects the 5th house
      mockChart.planets.find(p => p.name === 'Jupiter').longitude = 15; // in Aries (house 1)
      // 5th house is Leo
      const analysis = service.analyzeAspectOnHouse(5, 'Jupiter', '5th');
      expect(analysis.interpretation).toContain('blesses the 5th house, promoting intelligence, creativity, and good fortune with children');
      expect(analysis.nature).toBe('Benefic');
    });

    test('should analyze the effect of a malefic aspect', () => {
      // Saturn (malefic) aspects the 7th house
      mockChart.planets.find(p => p.name === 'Saturn').longitude = 15; // in Aries (house 1)
      // 7th house is Libra
       const analysis = service.analyzeAspectOnHouse(7, 'Saturn', '7th');
      expect(analysis.interpretation).toContain('can bring delays, challenges, or a sense of responsibility to partnerships');
      expect(analysis.nature).toBe('Malefic');
    });
  });

  describe('Comprehensive Analysis', () => {
    test('should provide a full aspect analysis for a specific planet', () => {
      const planetAnalysis = service.getAnalysisForPlanet('Sun');
      expect(planetAnalysis).toBeDefined();
      expect(planetAnalysis).toHaveProperty('aspectsGiven');
      expect(planetAnalysis).toHaveProperty('aspectsReceived');
    });

    test('should provide a full aspect analysis for a specific house', () => {
      const houseAnalysis = service.getAnalysisForHouse(7);
      expect(houseAnalysis).toBeDefined();
      expect(houseAnalysis).toBeInstanceOf(Array);
    });
  });

});
