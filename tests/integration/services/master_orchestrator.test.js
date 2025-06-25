const MasterAnalysisOrchestrator = require('../../../src/services/analysis/MasterAnalysisOrchestrator');
const sampleBirthData = require('../../fixtures/sample-birth-data.json');

// Mock all the service modules that MasterAnalysisOrchestrator uses
jest.mock('../../../src/services/analysis/BirthDataAnalysisService');
jest.mock('../../../src/services/analysis/LagnaAnalysisService');
jest.mock('../../../src/services/analysis/LuminariesAnalysisService');
jest.mock('../../../src/core/analysis/houses/HouseAnalysisService');
jest.mock('../../../src/core/analysis/aspects/AspectAnalysisService');
jest.mock('../../../src/services/analysis/ArudhaAnalysisService');
jest.mock('../../../src/core/analysis/divisional/NavamsaAnalysisService');
jest.mock('../../../src/services/analysis/DetailedDashaAnalysisService');
jest.mock('../../../src/services/analysis/YogaDetectionService');
jest.mock('../../../src/services/chart/EnhancedChartService');

// Create mock classes that return mock instances
const mockBirthDataService = {
  analyzeBirthDataCollection: jest.fn().mockReturnValue({
    analyses: {
      birthDetails: { completed: true, analysis: 'Birth details collected' },
      chartGeneration: { completed: true, analysis: 'Charts generated' },
      ascendant: { completed: true, analysis: 'Ascendant calculated' },
      planetaryPositions: { completed: true, analysis: 'Planetary positions calculated' },
      mahadasha: { completed: true, analysis: 'Mahadasha determined' }
    },
    summary: { readyForAnalysis: true, completeness: 100 }
  })
};

const mockLagnaService = {
  analyzeLagna: jest.fn().mockReturnValue({
    lagnaAnalysis: 'Lagna analysis complete',
    lagnaStrength: 'Strong'
  }),
  analyzeHouseClustering: jest.fn().mockReturnValue({
    distribution: 'Even distribution'
  }),
  analyzePlanetaryConjunctions: jest.fn().mockReturnValue([]),
  detectPlanetaryOppositions: jest.fn().mockReturnValue([]),
  analyzeExaltationDebility: jest.fn().mockReturnValue({}),
  determineFunctionalNature: jest.fn().mockReturnValue({})
};

const mockHouseService = {
  analyzeHouseInDetail: jest.fn().mockReturnValue({
    analysis: 'House analysis complete',
    lord: 'Mars',
    occupants: [],
    specificAnalysis: 'Detailed house analysis'
  }),
  crossVerifyHouseIndications: jest.fn().mockReturnValue({
    consistency: 'Good'
  })
};

const mockLuminariesService = {
  analyzeLuminaries: jest.fn().mockReturnValue({
    sunAnalysis: 'Sun analysis complete',
    moonAnalysis: 'Moon analysis complete'
  })
};

const mockYogaService = {
  detectAllYogas: jest.fn().mockReturnValue([
    { name: 'Gaja Kesari Yoga', description: 'Powerful yoga for wisdom' }
  ])
};

const mockAspectService = {
  analyzeAllAspects: jest.fn().mockReturnValue({
    aspects: 'Aspect analysis complete'
  })
};

const mockArudhaService = {
  analyzeAllArudhas: jest.fn().mockReturnValue({
    arudhaLagna: 'Arudha analysis complete'
  })
};

const mockNavamsaService = {
  analyzeNavamsaComprehensive: jest.fn().mockReturnValue({
    navamsaAnalysis: 'Navamsa analysis complete'
  })
};

const mockDashaService = {
  analyzeAllDashas: jest.fn().mockReturnValue({
    timeline: 'Dasha timeline complete'
  })
};

const mockChartService = {
  generateRasiChart: jest.fn().mockResolvedValue({
    ascendant: { sign: 'Aries', degree: 15 },
    planetaryPositions: {
      sun: { sign: 'Leo', house: 5 },
      moon: { sign: 'Cancer', house: 4 }
    }
  }),
  generateNavamsaChart: jest.fn().mockResolvedValue({
    ascendant: { sign: 'Sagittarius' },
    planets: []
  })
};

// Setup the mocks to return the mock instances
require('../../../src/services/analysis/BirthDataAnalysisService').mockImplementation(() => mockBirthDataService);
require('../../../src/services/analysis/LagnaAnalysisService').mockImplementation(() => mockLagnaService);
require('../../../src/core/analysis/houses/HouseAnalysisService').mockImplementation(() => mockHouseService);
require('../../../src/services/analysis/LuminariesAnalysisService').mockImplementation(() => mockLuminariesService);
require('../../../src/services/analysis/YogaDetectionService').mockImplementation(() => mockYogaService);
require('../../../src/core/analysis/aspects/AspectAnalysisService').mockImplementation(() => mockAspectService);
require('../../../src/services/analysis/ArudhaAnalysisService').mockImplementation(() => mockArudhaService);
require('../../../src/core/analysis/divisional/NavamsaAnalysisService').mockImplementation(() => mockNavamsaService);
require('../../../src/services/analysis/DetailedDashaAnalysisService').mockImplementation(() => mockDashaService);
require('../../../src/services/chart/EnhancedChartService').mockImplementation(() => mockChartService);

describe('MasterAnalysisOrchestrator Integration Test', () => {
  let orchestrator;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    orchestrator = new MasterAnalysisOrchestrator();
  });

  test('should call all individual analysis services and aggregate the results', async () => {
    // Run the main orchestration logic with new format
    const results = await orchestrator.performComprehensiveAnalysis(
      sampleBirthData.testCases[0].birthData,
      { legacyFormat: false }
    );

    // Verify that the orchestrator called each service
    expect(mockLagnaService.analyzeLagna).toHaveBeenCalled();
    expect(mockHouseService.analyzeHouseInDetail).toHaveBeenCalled();
    expect(mockYogaService.detectAllYogas).toHaveBeenCalled();
    expect(mockLuminariesService.analyzeLuminaries).toHaveBeenCalled();

    // Verify that the results are structured correctly
    expect(results).toHaveProperty('sections');
    expect(results).toHaveProperty('progress');
    expect(results).toHaveProperty('status');
    expect(results.status).toBe('completed');
    expect(results.progress).toBe(100);
  });

  test('should handle errors from a downstream service gracefully', async () => {
    // Mock birth data service to return insufficient data
    mockBirthDataService.analyzeBirthDataCollection.mockReturnValue({
      analyses: {
        birthDetails: { completed: false },
        chartGeneration: { completed: false },
        ascendant: { completed: false },
        planetaryPositions: { completed: false },
        mahadasha: { completed: false }
      },
      summary: { readyForAnalysis: false, completeness: 30 }
    });

    // The orchestrator should handle insufficient data gracefully with new format
    const results = await orchestrator.performComprehensiveAnalysis({
      dateOfBirth: '1985-10-24'
      // Missing timeOfBirth and location
    }, { legacyFormat: false });

    expect(results).toBeDefined();
    expect(results).toHaveProperty('errors');
    expect(results.errors[0]).toContain('Insufficient birth data for complete analysis');
    // It should still have tried to process other services
    expect(results).toHaveProperty('sections');
  });

});
