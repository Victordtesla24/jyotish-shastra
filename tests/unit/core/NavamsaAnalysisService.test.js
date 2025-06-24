const NavamsaAnalysisService = require('../../../src/core/analysis/divisional/NavamsaAnalysisService');
const { sampleChart } = require('../../fixtures/sample-chart-data');

describe('NavamsaAnalysisService', () => {
  let service;
  let d1Chart;
  let d9Chart;

  beforeEach(() => {
    // Create a detailed mock D1 chart object
    d1Chart = {
      chartType: 'D1',
      planets: [
        { name: 'Sun', longitude: 125.0, sign: 'Leo', dignity: 'Normal' },
        { name: 'Moon', longitude: 45.0, sign: 'Taurus', dignity: 'Exalted' },
        { name: 'Mars', longitude: 100.0, sign: 'Cancer', dignity: 'Debilitated' },
        { name: 'Mercury', longitude: 75.0, sign: 'Gemini', dignity: 'Normal' },
        { name: 'Jupiter', longitude: 105.0, sign: 'Cancer', dignity: 'Exalted' },
        { name: 'Venus', longitude: 335.0, sign: 'Pisces', dignity: 'Exalted' },
        { name: 'Saturn', longitude: 195.0, sign: 'Libra', dignity: 'Exalted' },
        { name: 'Rahu', longitude: 155.0, sign: 'Virgo', dignity: 'Normal' },
        { name: 'Ketu', longitude: 335.0, sign: 'Pisces', dignity: 'Normal' }
      ],
      houses: Array.from({ length: 12 }, (_, i) => ({ house: i + 1, sign: 'SomeSign' })),
      ascendant_sign: 'Cancer',
    };

    // Mock D9 chart data for testing purposes
    d9Chart = {
      chartType: 'D9',
      planets: [ // Complete D9 placements for all planets
        { name: 'Sun', longitude: 125.0, sign: 'Leo' },
        { name: 'Moon', longitude: 45.0, sign: 'Taurus' },
        { name: 'Mars', longitude: 280.0, sign: 'Capricorn' }, // Gains strength
        { name: 'Mercury', longitude: 75.0, sign: 'Gemini' },
        { name: 'Jupiter', longitude: 280.0, sign: 'Capricorn' }, // Loses strength
        { name: 'Venus', longitude: 335.0, sign: 'Pisces' },
        { name: 'Saturn', longitude: 195.0, sign: 'Libra' },
        { name: 'Rahu', longitude: 155.0, sign: 'Virgo' },
        { name: 'Ketu', longitude: 335.0, sign: 'Pisces' }
      ],
      houses: [
        { sign: 'Gemini', occupants: [], aspects: [] },
        { sign: 'Cancer', occupants: [], aspects: [] },
        { sign: 'Leo', occupants: [], aspects: [] },
        { sign: 'Virgo', occupants: [], aspects: [] },
        { sign: 'Libra', occupants: [], aspects: [] },
        { sign: 'Scorpio', occupants: [], aspects: [] },
        { sign: 'Sagittarius', occupants: [], aspects: [] },
        { sign: 'Capricorn', occupants: [], aspects: [] },
        { sign: 'Aquarius', occupants: [], aspects: [] },
        { sign: 'Pisces', occupants: [], aspects: [] },
        { sign: 'Aries', occupants: [], aspects: [] },
        { sign: 'Taurus', occupants: [], aspects: [] }
      ],
      ascendant_sign: 'Gemini',
    };
    service = new NavamsaAnalysisService(d1Chart, d9Chart);
  });

  describe('Planetary Strength Comparison', () => {
    test('should identify a planet that gains strength in Navamsa', () => {
      // Example: Mars debilitated in D1 (Cancer) but exalted in D9 (Capricorn)
      d1Chart.planets.find(p => p.name === 'Mars').sign = 'Cancer';
      d1Chart.planets.find(p => p.name === 'Mars').dignity = 'Debilitated';
      d9Chart.planets.find(p => p.name === 'Mars').sign = 'Capricorn';

      const analysis = service.comparePlanetaryStrength('Mars');
      expect(analysis).toContain('gains significant strength in the Navamsa');
      expect(analysis).toContain('results may improve over time');
    });

    test('should identify a planet that loses strength in Navamsa', () => {
      // Example: Jupiter exalted in D1 (Cancer) but debilitated in D9 (Capricorn)
      d1Chart.planets.find(p => p.name === 'Jupiter').sign = 'Cancer';
      d1Chart.planets.find(p => p.name === 'Jupiter').dignity = 'Exalted';
      d9Chart.planets.find(p => p.name === 'Jupiter').sign = 'Capricorn';

      const analysis = service.comparePlanetaryStrength('Jupiter');
      expect(analysis).toContain('loses strength in the Navamsa');
      expect(analysis).toContain('initial promise may not fully manifest');
    });

    test('should correctly identify a Vargottama planet', () => {
      // Sun in Leo in both D1 and D9
      d1Chart.planets.find(p => p.name === 'Sun').sign = 'Leo';
      d9Chart.planets.find(p => p.name === 'Sun').sign = 'Leo';

      // Debug: Check the chart data
      console.log('D1 Sun after modification:', d1Chart.planets.find(p => p.name === 'Sun'));
      console.log('D9 Sun after modification:', d9Chart.planets.find(p => p.name === 'Sun'));

      // Create service AFTER chart modifications
      const testService = new NavamsaAnalysisService(d1Chart, d9Chart);

            // Debug: Check service chart data
      console.log('Service D1 Sun:', testService.d1Chart.planets.find(p => p.name === 'Sun'));
      console.log('Service D9 Sun:', testService.d9Chart.planets.find(p => p.name === 'Sun'));

      // Debug the isVargottama method step by step
      const d1Planet = testService.d1Chart.planets.find(p => p.name === 'Sun');
      const d9Planet = testService.d9Chart.planets.find(p => p.name === 'Sun');
      const d1Sign = d1Planet.sign || testService.getSignFromLongitude(d1Planet.longitude);
      const d9Sign = d9Planet.sign || testService.getSignFromLongitude(d9Planet.longitude);

      console.log('D1 sign from method:', d1Sign);
      console.log('D9 sign from method:', d9Sign);
      console.log('Signs equal after normalization:', d1Sign?.toUpperCase?.() === d9Sign?.toUpperCase?.());

      const isVargottama = testService.isVargottama('Sun');
      const analysis = testService.comparePlanetaryStrength('Sun');

      console.log('Vargottama result:', isVargottama);

      expect(isVargottama).toBe(true);
      expect(analysis).toContain('is Vargottama, which gives it special strength');
    });
  });

  describe('Marriage and Relationship Analysis', () => {
    test('should analyze the 7th house of the Navamsa chart', () => {
      // Example: D9 7th house is Sagittarius, ruled by Jupiter
      d9Chart.houses[6].sign = 'Sagittarius';
      d9Chart.houses[6].lord = 'Jupiter';

      const analysis = service.analyzeMarriageProspects();
      expect(analysis).toContain('The 7th house of the Navamsa is Sagittarius');
      expect(analysis).toContain('indicates a spouse who is knowledgeable, optimistic, and philosophical');
    });

    test('should analyze planets in the Navamsa 7th house', () => {
      // Example: Venus in the 7th house of D9
      d9Chart.planets.find(p => p.name === 'Venus').house = 7;
      d9Chart.houses[6].occupants = ['Venus'];

      const analysis = service.analyzeMarriageProspects();
      expect(analysis).toContain('Venus in the Navamsa 7th house is excellent for a harmonious and loving marital life');
    });

    test('should analyze the condition of Venus (karaka for wife) in Navamsa', () => {
      // Example: Venus exalted in Pisces in D9
      d9Chart.planets.find(p => p.name === 'Venus').sign = 'Pisces';
      const analysis = service.analyzeRelationshipKarakas();
      expect(analysis.venus).toContain('Venus is exalted in the Navamsa, promising a devoted and high-quality partner');
    });
  });

  describe('Overall Destiny Analysis', () => {
    test('should analyze the Navamsa Lagna', () => {
      // D9 Lagna is Gemini
      const analysis = service.analyzeNavamsaLagna();
      expect(analysis).toContain('The Navamsa Lagna is Gemini');
      expect(analysis).toContain('reveals an inner nature that is intellectual, communicative, and adaptable');
    });
  });

});
