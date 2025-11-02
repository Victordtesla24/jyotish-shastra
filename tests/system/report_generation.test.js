import ComprehensiveReportService from '../../src/services/report/ComprehensiveReportService.js';

// Mock sample analysis results for testing
const sampleAnalysisResults = {
  lagnaAnalysis: {
    summary: 'Strong Lagna with Mars influence indicating leadership qualities',
    lagnaSign: {
      sign: 'Aries',
      characteristics: ['Dynamic', 'Leadership-oriented'],
      element: 'Fire',
      quality: 'Movable',
      strengths: ['Courage', 'Initiative'],
      challenges: ['Impatience']
    },
    lagnaLord: {
      planet: 'Mars',
      house: 1,
      sign: 'Aries'
    }
  },
  careerAnalysis: {
    summary: 'Career prospects are strong in technical fields with management potential'
  },
  healthAnalysis: {
    summary: 'Generally good health with focus needed on stress management'
  },
  relationshipAnalysis: {
    summary: 'Harmonious relationships with potential for lasting partnerships'
  },
  financialAnalysis: {
    summary: 'Steady financial growth with investment opportunities'
  },
  spiritualAnalysis: {
    summary: 'Natural inclination towards philosophical and spiritual pursuits'
  }
};

describe('System Test: Report Generation Pipeline', () => {

  test('should process a full analysis object into a structured report', async () => {
    // Phase 1: Input Chart Data (mock chart object that would come from ChartGenerationService)
    const mockChart = {
      birthData: {
        dateOfBirth: '1990-01-01',
        timeOfBirth: '12:00:00',
        placeOfBirth: 'New York, USA'
      },
      rasiChart: {
        ascendant: {
          sign: 'Aries',
          degree: 15.75,
          longitude: 15.75,
          signId: 1
        },
        planets: [
          { name: 'Sun', sign: 'Capricorn', longitude: 285, signId: 10, house: 10, dignity: 'neutral' },
          { name: 'Moon', sign: 'Cancer', longitude: 105, signId: 4, house: 4, dignity: 'own_sign' }
        ],
        planetaryPositions: [
          { name: 'Sun', sign: 'Capricorn', longitude: 285, signId: 10, house: 10, dignity: 'neutral' },
          { name: 'Moon', sign: 'Cancer', longitude: 105, signId: 4, house: 4, dignity: 'own_sign' }
        ],
        housePositions: [15, 45, 75, 105, 135, 165, 195, 225, 255, 285, 315, 345]
      },
      navamsaChart: {
        ascendant: {
          sign: 'Leo',
          degree: 12.30,
          longitude: 132.30,
          signId: 5
        },
        planets: [
          { name: 'Sun', sign: 'Sagittarius', longitude: 255, signId: 9 },
          { name: 'Moon', sign: 'Virgo', longitude: 165, signId: 6 }
        ],
        planetaryPositions: [
          { name: 'Sun', sign: 'Sagittarius', longitude: 255, signId: 9 },
          { name: 'Moon', sign: 'Virgo', longitude: 165, signId: 6 }
        ]
      }
    };

    // Phase 2: Report Generation
    // The report service takes chart data and generates comprehensive analysis
    const reportService = new ComprehensiveReportService();
    
    // Check if Swiss Ephemeris is available for full analysis
    try {
      const { getSwisseph } = await import('../../src/utils/swisseph-wrapper.js');
      await getSwisseph();
    } catch (error) {
      console.warn('Skipping report generation test - Swiss Ephemeris WASM not available:', error.message);
      return; // Skip test if sweph-wasm not available
    }
    
    const report = await reportService.generateComprehensiveReport(mockChart);

    // Phase 3: Validation
    // Validate the structure and content of the final report.
    expect(report).toBeDefined();
    expect(report).toHaveProperty('chartData');
    expect(report).toHaveProperty('analysisDate');
    expect(report).toHaveProperty('sections');

    // Validate sections structure (based on actual ComprehensiveReportService structure)
    expect(report.sections).toHaveProperty('personality');
    expect(report.sections).toHaveProperty('health');
    expect(report.sections).toHaveProperty('educationCareer');
    expect(report.sections).toHaveProperty('financial');
    expect(report.sections).toHaveProperty('relationships');
    expect(report.sections).toHaveProperty('lifePredictions');

    // Validate that sections contain expected properties
    expect(report.sections.personality).toHaveProperty('section');
    expect(report.sections.health).toHaveProperty('section');

    // Validate the final synthesis and executive summary
    expect(report).toHaveProperty('finalSynthesis');
    expect(report).toHaveProperty('executiveSummary');
  });

  test('should handle incomplete chart data gracefully', async () => {
    // Check if Swiss Ephemeris is available
    try {
      const { getSwisseph } = await import('../../src/utils/swisseph-wrapper.js');
      await getSwisseph();
    } catch (error) {
      console.warn('Skipping incomplete data test - Swiss Ephemeris WASM not available:', error.message);
      return; // Skip test if sweph-wasm not available
    }

    // What if the chart object is missing some properties?
    const incompleteChart = {
      birthData: {
        dateOfBirth: '1990-01-01'
        // Missing timeOfBirth and place
      },
      rasiChart: {
        ascendant: {
          sign: 'Aries',
          degree: 15.0,
          longitude: 15.0,
          signId: 1
        },
        planets: [],
        planetaryPositions: []
        // Missing housePositions
      }
      // Missing navamsaChart
    };

    const reportService = new ComprehensiveReportService();

    // The service should throw an error for incomplete data (production-grade behavior)
    await expect(reportService.generateComprehensiveReport(incompleteChart)).rejects.toThrow();
  });

});
