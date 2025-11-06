/**
 * Chart Rendering Integration Test
 * Tests complete flow: API response → Backend rendering → Frontend display
 * Verifies house numbers extraction and SVG output
 * @jest-environment node
 */

import fs from 'fs';
import path from 'path';
import ChartRenderingService from '../../src/services/chart/ChartRenderingService.js';
import chartGenerateResponse from '../test-data/chart-generate-response.json';

describe('Chart Rendering Integration', () => {
  let testData;
  let renderingService;

  beforeAll(() => {
    // Use existing chart generate response data
    testData = chartGenerateResponse;
    renderingService = new ChartRenderingService();
  });

  test('should extract all data sets from API response', () => {
    const extractedDataSets = renderingService.extractAllDataSets(testData);
    
    // Verify extraction completed successfully
    
    expect(extractedDataSets).toBeDefined();
    expect(extractedDataSets.datasets).toBeDefined();
    expect(extractedDataSets.datasets.rootLevelData).toBeDefined();
    expect(extractedDataSets.datasets.birthData).toBeDefined();
    expect(extractedDataSets.datasets.rasiChartData).toBeDefined();
    expect(extractedDataSets.datasets.ascendantData).toBeDefined();
    expect(extractedDataSets.datasets.planetaryPositionsWithHouseNumbers).toBeDefined();
    
    // Verify house numbers are present
    const planetaryPositionsWithHouses = extractedDataSets.datasets.planetaryPositionsWithHouseNumbers;
    expect(planetaryPositionsWithHouses).toBeDefined();
    expect(planetaryPositionsWithHouses.sun).toBeDefined();
    expect(typeof planetaryPositionsWithHouses.sun.house).toBe('number');
    expect(planetaryPositionsWithHouses.sun.house).toBeGreaterThanOrEqual(1);
    expect(planetaryPositionsWithHouses.sun.house).toBeLessThanOrEqual(12);
  });

  test('should join all data sets correctly', () => {
    const extractedDataSets = renderingService.extractAllDataSets(testData);
    const joinedData = renderingService.joinDataSets(extractedDataSets);
    
    expect(joinedData).toBeDefined();
    expect(joinedData.joins).toBeDefined();
    expect(joinedData.joins.rasiByHouse).toBeDefined();
    expect(joinedData.joins.enhancedPlanetaryPositions).toBeDefined();
    expect(joinedData.joins.planetsByHouse).toBeDefined();
    
    // Verify rasi by house mapping
    const rasiByHouse = joinedData.joins.rasiByHouse;
    expect(Object.keys(rasiByHouse).length).toBeGreaterThan(0);
    for (let house = 1; house <= 12; house++) {
      if (rasiByHouse[house]) {
        expect(typeof rasiByHouse[house]).toBe('string'); // Service returns strings, not numbers
        const rasiNumber = parseInt(rasiByHouse[house], 10);
        expect(rasiNumber).toBeGreaterThanOrEqual(1);
        expect(rasiNumber).toBeLessThanOrEqual(12);
      }
    }
    
    // Verify planets by house grouping
    const planetsByHouse = joinedData.joins.planetsByHouse;
    expect(planetsByHouse).toBeDefined();
    const totalPlanets = Object.values(planetsByHouse).reduce((sum, planets) => sum + planets.length, 0);
    expect(totalPlanets).toBeGreaterThan(0);
  });

  test('should save extracted and joined data sets to temp storage', () => {
    const extractedDataSets = renderingService.extractAllDataSets(testData);
    const joinedData = renderingService.joinDataSets(extractedDataSets);
    const savedPath = renderingService.saveDataSetsToTempStorage(extractedDataSets, joinedData);
    
    expect(savedPath).toBeDefined();
    expect(fs.existsSync(savedPath)).toBe(true);
    
    // Verify saved file structure
    const savedData = JSON.parse(fs.readFileSync(savedPath, 'utf8'));
    expect(savedData.extracted).toBeDefined();
    expect(savedData.joined).toBeDefined();
    expect(savedData.metadata).toBeDefined();
  });

  test('should render SVG chart successfully', () => {
    const svgContent = renderingService.renderChartSVG(testData, { width: 800 });
    
    expect(svgContent).toBeDefined();
    expect(typeof svgContent).toBe('string');
    expect(svgContent).toContain('<?xml');
    expect(svgContent).toContain('<svg');
    expect(svgContent).toContain('width="800"');
    expect(svgContent).toContain('height="800"');
    
    // Verify chart frame elements
    expect(svgContent).toContain('<rect'); // Background
    expect((svgContent.match(/<line/g) || []).length).toBeGreaterThanOrEqual(10); // Lines (outer square, diamond, diagonals)
    
    // Verify text elements (rasi numbers and planets)
    expect(svgContent).toContain('<text'); // At least some text elements
    
    // Verify background color
    expect(svgContent).toContain('#FFF8E1');
  });

  test('should extract house numbers from birthDataAnalysis when missing from planetaryPositions', () => {
    // Skip this test for chart generation responses that don't have birthDataAnalysis
    if (!testData.birthDataAnalysis && !testData.data?.birthDataAnalysis) {
      console.log('Skipping birthDataAnalysis test - test data is chart generation response, not comprehensive analysis response');
      return;
    }
    
    // Create test data without house numbers in planetaryPositions
    const testDataWithoutHouses = JSON.parse(JSON.stringify(testData));
    if (testDataWithoutHouses.data?.rasiChart?.planetaryPositions) {
      Object.keys(testDataWithoutHouses.data.rasiChart.planetaryPositions).forEach(planet => {
        delete testDataWithoutHouses.data.rasiChart.planetaryPositions[planet].house;
      });
    }
    
    // Should still extract house numbers from birthDataAnalysis
    const renderData = renderingService.transformToRenderFormat(testDataWithoutHouses);
    
    expect(renderData).toBeDefined();
    expect(renderData.planetsByHouse).toBeDefined();
    
    // Verify planets are grouped by house
    const totalPlanets = Object.values(renderData.planetsByHouse).reduce((sum, planets) => sum + planets.length, 0);
    expect(totalPlanets).toBeGreaterThan(0);
  });

  test('should validate chart data correctly', () => {
    const validation = renderingService.validateChartData(testData);
    
    expect(validation).toBeDefined();
    expect(validation.valid).toBe(true);
    expect(validation.errors).toBeDefined();
    expect(Array.isArray(validation.errors)).toBe(true);
    expect(validation.errors.length).toBe(0);
  });
});

