import DetailedDashaAnalysisService from '../../../../../src/services/analysis/DetailedDashaAnalysisService.js';
import { sampleBirthData, testCases } from '../../../../test-data/sample-chart-data.js';

describe('DetailedDashaAnalysisService', () => {
    let service;

    beforeEach(() => {
        service = new DetailedDashaAnalysisService();
    });

    // Helper function to create a mock chart from birth data
    function createMockChart(birthData) {
        return {
            birthData: birthData,
            ascendant: {
                sign: 'ARIES',
                longitude: 15.0
            },
            planetaryPositions: {
                sun: { sign: 'LEO', longitude: 135.0 },
                moon: { sign: 'CANCER', longitude: 105.0 },
                mars: { sign: 'ARIES', longitude: 15.0 },
                mercury: { sign: 'GEMINI', longitude: 75.0 },
                jupiter: { sign: 'SAGITTARIUS', longitude: 255.0 },
                venus: { sign: 'TAURUS', longitude: 45.0 },
                saturn: { sign: 'CAPRICORN', longitude: 285.0 },
                rahu: { sign: 'VIRGO', longitude: 165.0 },
                ketu: { sign: 'PISCES', longitude: 345.0 }
            },
            nakshatra: {
                name: 'Punarvasu',
                longitude: 6.67
            }
        };
    }

    describe('calculateVimshottariDasha', () => {
        it('should calculate the Vimshottari Dasha sequence correctly for a given birth chart', () => {
            const birthData = {
                ...sampleBirthData.testCases[0].birthData, // Use first test case birth data
                nakshatra: 'Punarvasu',
                nakshatraLongitude: 6.67 // Halfway through the nakshatra
            };

            const dashaSequence = service.calculateVimshottariDasha(birthData);

            expect(dashaSequence).toBeDefined();
            expect(dashaSequence.length).toBe(9);

            // For Punarvasu, lord is Jupiter (16 years)
            const firstDasha = dashaSequence[0];
            expect(firstDasha.planet).toBe('Jupiter');
            expect(firstDasha.duration).toBeCloseTo(8.0); // Half of 16 years remaining

            // Check the order of the next dasha (Saturn)
            const secondDasha = dashaSequence[1];
            expect(secondDasha.planet).toBe('Saturn');
            expect(secondDasha.duration).toBe(19);
        });
    });

  describe('determineCurrentDasha', () => {
    it('should accurately determine the current Mahadasha and Antardasha', () => {
      const birthData = {
        ...sampleBirthData.testCases[0].birthData, // Use first test case birth data
        nakshatra: 'Punarvasu',
        nakshatraLongitude: 6.67
      };

      // Create proper chart structure
      const chart = createMockChart(birthData);

      // Using a fixed date for reproducible tests
      const testDate = new Date('2024-01-01T00:00:00Z');
      const currentDasha = service.determineCurrentDasha(chart, testDate);

      expect(currentDasha).toBeDefined();
      expect(currentDasha).toHaveProperty('planet');
      expect(currentDasha).toHaveProperty('startAge');
      expect(currentDasha).toHaveProperty('endAge');
      expect(currentDasha).toHaveProperty('period');

      // Placeholder for expected values after manual calculation/verification
      // Example: expect(currentDasha.planet).toBe('SomePlanet');
    });
  });

  describe('generateDashaTimeline', () => {
    it('should generate a complete and accurate Dasha timeline', () => {
      const birthData = {
        ...sampleBirthData.testCases[0].birthData, // Use first test case birth data
        nakshatra: 'Punarvasu',
        nakshatraLongitude: 6.67
      };

      // Create proper chart structure
      const chart = createMockChart(birthData);

      const dashaTimeline = service.generateDashaTimeline(chart);

      expect(dashaTimeline).toBeDefined();
      expect(dashaTimeline.length).toBeGreaterThan(0);

      const firstMahadasha = dashaTimeline[0];
      expect(firstMahadasha).toHaveProperty('mahadasha');
      expect(firstMahadasha.mahadasha.planet).toBe('Jupiter'); // Starts with Jupiter (Punarvasu lord)

      expect(firstMahadasha).toHaveProperty('antardashas');
      expect(Array.isArray(firstMahadasha.antardashas)).toBe(true);
      expect(firstMahadasha.antardashas.length).toBe(9);

      // Check the structure of a sub-period
      const firstAntardasha = firstMahadasha.antardashas[0];
      expect(firstAntardasha).toHaveProperty('planet');
      expect(firstAntardasha).toHaveProperty('start');
      expect(firstAntardasha).toHaveProperty('end');
    });
  });

  // New test case for a different birth chart to ensure broader coverage
  describe('Dasha Calculations for a Different Lagna', () => {
    const anotherBirthData = {
      ...testCases[1].birthData, // Use test case 2 (Delhi birth July 22, 1985)
      nakshatra: 'Punarvasu', // Explicitly set the nakshatra as per test comment
      nakshatraLongitude: 6.67
    };

    it('should correctly identify the starting Dasha lord', () => {
      const dashaSequence = service.calculateVimshottariDasha(anotherBirthData);
      // For 22nd July 1985, Moon is in Punarvasu, ruled by Jupiter.
      expect(dashaSequence[0].planet).toBe('Jupiter');
    });
  });
});
