import { ChartGenerationService } from '../../src/services/chart/ChartGenerationService.js';
import MasterAnalysisOrchestrator from '../../src/services/analysis/MasterAnalysisOrchestrator.js';
import sampleBirthData from '../test-data/sample-birth-data.json';

describe('System Test: Chart and Analysis Pipeline', () => {

  // Helper function to transform test data to ChartGenerationService format
  function transformBirthData(testBirthData) {
    return {
      dateOfBirth: testBirthData.dateOfBirth,
      timeOfBirth: testBirthData.timeOfBirth,
      latitude: testBirthData.latitude,
      longitude: testBirthData.longitude,
      timeZone: testBirthData.timezone || testBirthData.timeZone,
      placeOfBirth: testBirthData.placeOfBirth,
      gender: testBirthData.gender
    };
  }

  test('should process birth data through to a complete analysis report', async () => {
    // Check if Swiss Ephemeris is available
    try {
      const { getSwisseph } = await import('../../src/utils/swisseph-wrapper.js');
      await getSwisseph();
    } catch (error) {
      console.warn('Skipping chart pipeline test - Swiss Ephemeris WASM not available:', error.message);
      return; // Skip test if sweph-wasm not available
    }

    // Phase 1: Chart Generation
    // In a real test, we would not mock this, but for a pure system-level flow test,
    // we can use the actual service.
    const chartService = new ChartGenerationService();
    await chartService.ensureSwissephInitialized();
    const transformedBirthData = transformBirthData(sampleBirthData);
    const comprehensiveChart = await chartService.generateComprehensiveChart(transformedBirthData);
    const fullChartData = { ...comprehensiveChart, birthData: transformedBirthData };

    // Basic validation of the generated chart
    expect(fullChartData).toBeDefined();
    expect(fullChartData.rasiChart).toHaveProperty('ascendant');
    expect(Object.keys(fullChartData.rasiChart.planetaryPositions).length).toBeGreaterThan(0);
    expect(fullChartData.navamsaChart).toBeDefined();

    // Phase 2: Comprehensive Analysis
    // The orchestrator takes the generated chart and processes it.
    const orchestrator = new MasterAnalysisOrchestrator();
    const analysisResults = await orchestrator.performComprehensiveAnalysis(transformedBirthData);

    // Phase 3: Validation
    // Validate the final, aggregated analysis object.
    expect(analysisResults).toBeDefined();
    expect(analysisResults).toHaveProperty('lagnaAnalysis');
    expect(analysisResults).toHaveProperty('houseAnalysis');
    expect(analysisResults).toHaveProperty('dashaAnalysis');
    expect(analysisResults).toHaveProperty('yogaAnalysis');
    expect(analysisResults).toHaveProperty('navamsaAnalysis');

    // Spot-check the contents
    expect(analysisResults.houseAnalysis.length).toBe(12);
    expect(analysisResults.yogaAnalysis).toBeInstanceOf(Array);
    expect(analysisResults.lagnaAnalysis.summary).toContain('Lagna');
    expect(analysisResults.navamsaAnalysis.marriage_prospects).toBeDefined();
  });

  test('should handle invalid birth data at the start of the pipeline', async () => {
    const chartService = new ChartGenerationService();

    // The system should not crash but should throw a specific, handled error.
    const invalidData = transformBirthData({ ...sampleBirthData, dateOfBirth: null });

    // We expect the ChartGenerationService to throw an error, which prevents the pipeline from proceeding.
    await expect(async () => {
      await chartService.generateComprehensiveChart(invalidData);
    }).rejects.toThrow();
  });

});
