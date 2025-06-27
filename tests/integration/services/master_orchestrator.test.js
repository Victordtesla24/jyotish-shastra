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
jest.mock('../../../src/services/chart/ChartGenerationService');

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
  analyzeHouses: jest.fn().mockReturnValue({
    house1: { analysis: 'House 1 analysis complete', occupants: [], strength: 'strong' },
    house2: { analysis: 'House 2 analysis complete', occupants: [], strength: 'medium' },
    house3: { analysis: 'House 3 analysis complete', occupants: [], strength: 'weak' },
    house4: { analysis: 'House 4 analysis complete', occupants: [], strength: 'medium' },
    house5: { analysis: 'House 5 analysis complete', occupants: [], strength: 'strong' },
    house6: { analysis: 'House 6 analysis complete', occupants: [], strength: 'weak' },
    house7: { analysis: 'House 7 analysis complete', occupants: [], strength: 'medium' },
    house8: { analysis: 'House 8 analysis complete', occupants: [], strength: 'weak' },
    house9: { analysis: 'House 9 analysis complete', occupants: [], strength: 'strong' },
    house10: { analysis: 'House 10 analysis complete', occupants: [], strength: 'medium' },
    house11: { analysis: 'House 11 analysis complete', occupants: [], strength: 'strong' },
    house12: { analysis: 'House 12 analysis complete', occupants: [], strength: 'weak' }
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
    timeline: 'Dasha timeline complete',
    currentDasha: {
      mahadasha: 'Jupiter',
      antardasha: 'Venus',
      remainingYears: 2.5,
      effects: 'Positive period for growth and relationships'
    },
    dashaSequence: [
      { planet: 'Jupiter', startAge: 25, endAge: 41, isCurrent: true },
      { planet: 'Saturn', startAge: 41, endAge: 60, isCurrent: false }
    ],
    majorTransitions: [
      { age: 35, event: 'Career advancement', planet: 'Jupiter' },
      { age: 42, event: 'Major life change', planet: 'Saturn' }
    ]
  })
};

const mockChartService = {
  generateRasiChart: jest.fn().mockResolvedValue({
    ascendant: { sign: 'Aries', degree: 15, minutes: 30, seconds: 45 },
    planetaryPositions: {
      sun: { sign: 'Leo', house: 5, degree: 10.5 },
      moon: { sign: 'Cancer', house: 4, degree: 25.2 },
      mars: { sign: 'Gemini', house: 3, degree: 5.8 },
      mercury: { sign: 'Virgo', house: 6, degree: 18.3 },
      jupiter: { sign: 'Scorpio', house: 8, degree: 22.7 },
      venus: { sign: 'Libra', house: 7, degree: 15.1 },
      saturn: { sign: 'Capricorn', house: 10, degree: 28.9 },
      rahu: { sign: 'Aquarius', house: 11, degree: 12.4 },
      ketu: { sign: 'Leo', house: 5, degree: 12.4 }
    },
    planets: [
      { name: 'Sun', sign: 'Leo', house: 5, degree: 10.5 },
      { name: 'Moon', sign: 'Cancer', house: 4, degree: 25.2 },
      { name: 'Mars', sign: 'Gemini', house: 3, degree: 5.8 },
      { name: 'Mercury', sign: 'Virgo', house: 6, degree: 18.3 },
      { name: 'Jupiter', sign: 'Scorpio', house: 8, degree: 22.7 },
      { name: 'Venus', sign: 'Libra', house: 7, degree: 15.1 },
      { name: 'Saturn', sign: 'Capricorn', house: 10, degree: 28.9 },
      { name: 'Rahu', sign: 'Aquarius', house: 11, degree: 12.4 },
      { name: 'Ketu', sign: 'Leo', house: 5, degree: 12.4 }
    ]
  }),
  generateNavamsaChart: jest.fn().mockResolvedValue({
    ascendant: { sign: 'Sagittarius', degree: 20, minutes: 15, seconds: 30 },
    planetaryPositions: {
      sun: { sign: 'Scorpio', house: 12, degree: 5.2 },
      moon: { sign: 'Pisces', house: 4, degree: 18.8 }
    },
    planets: [
      { name: 'Sun', sign: 'Scorpio', house: 12, degree: 5.2 },
      { name: 'Moon', sign: 'Pisces', house: 4, degree: 18.8 },
      { name: 'Mars', sign: 'Capricorn', house: 2, degree: 12.1 },
      { name: 'Mercury', sign: 'Sagittarius', house: 1, degree: 8.7 },
      { name: 'Jupiter', sign: 'Cancer', house: 8, degree: 25.3 },
      { name: 'Venus', sign: 'Aquarius', house: 3, degree: 14.9 },
      { name: 'Saturn', sign: 'Virgo', house: 10, degree: 22.6 },
      { name: 'Rahu', sign: 'Gemini', house: 7, degree: 9.8 },
      { name: 'Ketu', sign: 'Sagittarius', house: 1, degree: 9.8 }
    ]
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
require('../../../src/services/chart/ChartGenerationService').mockImplementation(() => mockChartService);

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
    expect(mockHouseService.analyzeHouses).toHaveBeenCalled();
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
    expect(results).toHaveProperty('status', 'failed');
    expect(results).toHaveProperty('error');
    expect(results.error).toContain('Insufficient birth data for comprehensive analysis');
    // The orchestrator should fail fast with insufficient data
    expect(results).not.toHaveProperty('sections');
  });

});
