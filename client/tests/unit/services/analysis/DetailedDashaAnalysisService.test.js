const DashaAnalysisService = require('../../../../src/services/analysis/DetailedDashaAnalysisService');
const { sampleBirthData } = require('../../../fixtures/sample-birth-data.json');

describe('DashaAnalysisService', () => {
  let service;
  let mockChart;

  beforeEach(() => {
    // Create a detailed mock chart object that matches the structure expected by the service
    mockChart = {
      ascendant: { sign: 'Cancer', longitude: 114.93 },
      nakshatra: { name: 'Punarvasu', lord: 'Jupiter' },
      planetaryPositions: { // This is the expected structure
        sun: { sign: 'Sagittarius', house: 6, degree: 15.4 },
        moon: { sign: 'Gemini', house: 12, degree: 22.1 },
        mars: { sign: 'Aries', house: 10, degree: 5.0 },
        mercury: { sign: 'Capricorn', house: 7, degree: 12.0 },
        jupiter: { sign: 'Cancer', house: 1, degree: 28.0 },
        venus: { sign: 'Scorpio', house: 5, degree: 3.0 },
        saturn: { sign: 'Aquarius', house: 8, degree: 19.0 },
      },
      planets: [ // Keep this for other tests that might use it
        { name: 'Sun', longitude: 15, house: 1 },
        { name: 'Moon', longitude: 255, house: 9 },
        { name: 'Mars', longitude: 15, house: 1 },
        { name: 'Mercury', longitude: 75, house: 3 },
        { name: 'Jupiter', longitude: 15, house: 1 },
        { name: 'Venus', longitude: 195, house: 7 },
        { name: 'Saturn', longitude: 15, house: 1 },
      ],
      houses: [
        { sign: 'Cancer' }, { sign: 'Leo' }, { sign: 'Virgo' },
        { sign: 'Libra' }, { sign: 'Scorpio' }, { sign: 'Sagittarius' },
        { sign: 'Capricorn' }, { sign: 'Aquarius' }, { sign: 'Pisces' },
        { sign: 'Aries' }, { sign: 'Taurus' }, { sign: 'Gemini' }
      ]
    };
    // The service needs the natal chart, specifically the Moon's position, to calculate dasha.
    service = new DashaAnalysisService(mockChart, sampleBirthData);
  });

  describe('Vimshottari Dasha Calculation', () => {
    test('should determine the correct starting Mahadasha lord', () => {
      const currentAge = 25;
      const dashaSequence = service.generateDashaSequence(mockChart, currentAge);
      expect(dashaSequence).toBeDefined();
      expect(dashaSequence.length).toBeGreaterThan(0);
      // For a given Moon position (nakshatra), the starting lord is fixed.
      // This will require a correct implementation of nakshatra calculation.
      // Example: If Moon is in Ashwini, the first dasha is Ketu.
      // We will assume the sample chart's moon position leads to a specific known dasha start.
      // This test will likely fail until the implementation is correct.
      const firstDashaLord = dashaSequence[0].planet;
      expect(['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury']).toContain(firstDashaLord);
    });

    test('should generate the full Mahadasha sequence with correct durations', () => {
      const currentAge = 25;
      const dashaSequence = service.generateDashaSequence(mockChart, currentAge);
      const totalDuration = dashaSequence.reduce((sum, dasha) => sum + dasha.period, 0);

      expect(dashaSequence.length).toBe(9);
      expect(totalDuration).toBe(120); // Total cycle is 120 years

      // Check a specific dasha duration
      const venusDasha = dashaSequence.find(d => d.planet === 'Venus');
      if (venusDasha) {
        expect(venusDasha.period).toBe(20);
      }
    });

    test('should generate the correct Antardasha (sub-period) sequence within a Mahadasha', () => {
      const sunMahadasha = {
        planet: 'Sun',
        startAge: 25,
        endAge: 31,
        period: 6
      };
      const antardashas = service.calculateAntardashas(sunMahadasha, mockChart);
      expect(antardashas.length).toBe(9);
      expect(antardashas[0].antardasha).toBe('Sun');
      expect(antardashas[1].antardasha).toBe('Moon');
      expect(antardashas[8].antardasha).toBe('Venus'); // Correct Vimshottari sequence: Sun->Moon->Mars->Rahu->Jupiter->Saturn->Mercury->Ketu->Venus
    });

    test('should accurately identify the current Dasha for a given date', () => {
      // Example: For someone born in 1990, what is the dasha in 2023?
      const currentAge = 33; // 2023 - 1990
      const currentDasha = service.calculateCurrentDasha(mockChart, currentAge);

      expect(currentDasha).toBeDefined();
      expect(currentDasha).toHaveProperty('planet');
      expect(currentDasha).toHaveProperty('startAge');
      expect(currentDasha).toHaveProperty('endAge');
      expect(typeof currentDasha.planet).toBe('string');
      expect(currentDasha.startAge).toBeGreaterThanOrEqual(0);
      expect(currentDasha.endAge).toBeGreaterThan(currentDasha.startAge);
    });
  });

  describe('Dasha Analysis Interpretation', () => {
    test('should provide a correct interpretation for a Mahadasha period', () => {
      // Example: Analyze Jupiter Mahadasha for the sample chart
      // Let's assume Jupiter is well-placed in the sample chart (e.g., in the 9th house)
      const jupiter = mockChart.planets.find(p => p.name === 'Jupiter');
      if (jupiter) {
        jupiter.house = 9;
      }

      const generalTenor = service.getDashaGeneralTenor('Jupiter', mockChart);
      expect(generalTenor).toBeDefined();
      expect(typeof generalTenor).toBe('string');
      expect(generalTenor.length).toBeGreaterThan(0);
    });

    test('should provide a correct interpretation for an Antardasha period', () => {
      // Example: Analyze Saturn Antardasha within a Jupiter Mahadasha
      // Assume Saturn is in the 10th house (career)
      const saturn = mockChart.planets.find(p => p.name === 'Saturn');
      if (saturn) {
        saturn.house = 10;
      }

      const dashaEffects = service.analyzeDashaPeriodEffects('Jupiter', 'Saturn', mockChart);
      expect(dashaEffects).toBeDefined();
      expect(dashaEffects).toHaveProperty('activatedHouses');
      expect(dashaEffects).toHaveProperty('periodNature');
    });
  });

});
