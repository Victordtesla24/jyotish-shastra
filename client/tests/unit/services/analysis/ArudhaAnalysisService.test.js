const ArudhaAnalysisService = require('../../../../src/services/analysis/ArudhaAnalysisService');

describe('ArudhaAnalysisService', () => {
  let service;
  let chart;

  beforeEach(() => {
    // Define mock chart data for testing
          chart = {
        ascendant: { sign: 'Aries', longitude: 15 },
        ascendant_sign: 'Aries',
        planetaryPositions: {
          sun: { longitude: 135, sign: 'Leo', house: 5 },
          moon: { longitude: 105, sign: 'Cancer', house: 4 },
          mars: { longitude: 285, sign: 'Capricorn', house: 10 },
          mercury: { longitude: 75, sign: 'Gemini', house: 3 },
          jupiter: { longitude: 255, sign: 'Sagittarius', house: 9 },
          venus: { longitude: 45, sign: 'Taurus', house: 2 },
          saturn: { longitude: 195, sign: 'Libra', house: 7 }
        },
        planets: [
          { name: 'Sun', longitude: 135, sign: 'Leo', house: 5 },
          { name: 'Moon', longitude: 105, sign: 'Cancer', house: 4 },
          { name: 'Mars', longitude: 285, sign: 'Capricorn', house: 10 },
          { name: 'Mercury', longitude: 75, sign: 'Gemini', house: 3 },
          { name: 'Jupiter', longitude: 255, sign: 'Sagittarius', house: 9 },
          { name: 'Venus', longitude: 45, sign: 'Taurus', house: 2 },
          { name: 'Saturn', longitude: 195, sign: 'Libra', house: 7 }
        ],
        houses: [
          { house: 1, sign: 'Aries', longitude: 15, lord: 'Mars' },
          { house: 2, sign: 'Taurus', longitude: 45, lord: 'Venus' },
          { house: 3, sign: 'Gemini', longitude: 75, lord: 'Mercury' },
          { house: 4, sign: 'Cancer', longitude: 105, lord: 'Moon' },
          { house: 5, sign: 'Leo', longitude: 135, lord: 'Sun' },
          { house: 6, sign: 'Virgo', longitude: 165, lord: 'Mercury' },
          { house: 7, sign: 'Libra', longitude: 195, lord: 'Venus' },
          { house: 8, sign: 'Scorpio', longitude: 225, lord: 'Mars' },
          { house: 9, sign: 'Sagittarius', longitude: 255, lord: 'Jupiter' },
          { house: 10, sign: 'Capricorn', longitude: 285, lord: 'Saturn' },
          { house: 11, sign: 'Aquarius', longitude: 315, lord: 'Saturn' },
          { house: 12, sign: 'Pisces', longitude: 345, lord: 'Jupiter' }
        ]
      };
    service = new ArudhaAnalysisService(chart);
  });

  describe('Arudha Pada Calculation', () => {
    test('should correctly calculate the Arudha Lagna (A1)', () => {
      // Example: Aries Lagna, lord Mars is in the 10th house (Capricorn)
      chart.ascendant_sign = 'Aries';
      chart.planets.find(p => p.name === 'Mars').house = 10;

      const arudhaLagna = service.calculateArudhaLagna(chart);
      // From 1st to 10th is 10 houses. 10 houses from 10th is the 7th house.
      // But exception rule: Arudha in 7th from original, so take 10th from 7th = 4th house.
      // 4th sign from Aries is Cancer.
      expect(arudhaLagna.arudhaLagna.sign).toBe('Cancer');
      expect(arudhaLagna.arudhaLagna.arudhaHouse).toBe(4);
    });

    test('should correctly apply the exception rule for Arudha Lagna (if it falls in 1st or 7th)', () => {
        // Example: Cancer Lagna, Lord Moon in 7th (Capricorn)
        // Calculation: 7 houses from 1st is 7th. 7 from 7th is 1st. Arudha falls in 1st.
        // Exception: if AL falls in 1st or 7th, take the 10th from there. 10th from 1st is 10th house.
        chart.ascendant_sign = 'Cancer';
        chart.ascendant.sign = 'Cancer';
        chart.ascendant.longitude = 105; // Cancer longitude

        // Update Moon position to 7th house (Capricorn) from Cancer Lagna
        chart.planetaryPositions.moon.longitude = 285;
        chart.planetaryPositions.moon.house = 7;
        chart.planets.find(p => p.name === 'Moon').house = 7;
        chart.planets.find(p => p.name === 'Moon').longitude = 285;

        const arudhaLagna = service.calculateArudhaLagna(chart);
        expect(arudhaLagna.arudhaLagna.arudhaHouse).toBe(10);
        expect(arudhaLagna.arudhaLagna.sign).toBe('Aries'); // 10th sign from Cancer
    });

    test('should calculate the Arudha Pada for other houses (e.g., A10)', () => {
      // A10 is the Arudha of the 10th house.
      // Example: Aries Lagna. 10th house is Capricorn, lord is Saturn. Saturn is in the 11th house (Aquarius).
      // From 10th to 11th is 2 houses. 2 houses from 11th is the 1st house.
      // No exception rule applies, so A10 is in 1st house = Aries.
      chart.ascendant_sign = 'Aries';
      chart.houses[9].sign = 'Capricorn';
      chart.houses[9].lord = 'Saturn';
      chart.planets.find(p => p.name === 'Saturn').house = 11;

      const a10 = service.calculateArudhaPada(chart, 10);
      expect(a10.arudhaHouse).toBe(1);
      expect(a10.sign).toBe('Aries');
    });
  });

  describe('Arudha Lagna Analysis', () => {
    test('should analyze the influence of planets on the Arudha Lagna', () => {
      // AL is Libra. Place Jupiter in Libra.
      const arudhaLagnaSign = 'Libra';
      chart.planets.find(p => p.name === 'Jupiter').sign = 'Libra';

      const analysis = service.analyzeArudhaLagna(arudhaLagnaSign);
      expect(analysis).toContain('The Arudha Lagna is in Libra, projecting an image of being Intellectual and communicative image, Social and networking abilities, Initiating and pioneering reputation.');
      expect(analysis).toContain('Jupiter influencing the Arudha Lagna makes the public image respected, wise, and fortunate.');
    });

    test('should analyze the houses 2nd and 12th from Arudha Lagna', () => {
      const arudhaLagnaSign = 'Libra';
      // Place a benefic (Venus) in the 2nd from AL (Scorpio)
      // Place a malefic (Mars) in the 12th from AL (Virgo)
      chart.planets.find(p => p.name === 'Venus').sign = 'Scorpio';
      chart.planets.find(p => p.name === 'Mars').sign = 'Virgo';

      const analysis = service.analyzeArudhaSustainment(arudhaLagnaSign);
      expect(analysis.sustenance).toContain('Benefics in the 2nd from Arudha indicate stable and growing status.');
      expect(analysis.loss).toContain('Malefics in the 12th from Arudha can indicate loss of status or public criticism.');
    });

    test('should interpret the contrast between true Lagna and Arudha Lagna', () => {
      const trueLagna = 'Aries';
      const arudhaLagna = 'Libra';

      const analysis = service.interpretLagnaVsArudha(trueLagna, arudhaLagna);
      expect(analysis).toContain('a contrast between the true self (Aries - assertive, independent) and the perceived self (Libra - diplomatic, accommodating)');
    });
  });

});
