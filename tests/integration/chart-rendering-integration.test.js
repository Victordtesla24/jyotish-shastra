/**
 * Chart Rendering Integration Test
 * Tests complete flow: API response → Backend rendering → Frontend display
 * Verifies house numbers extraction and SVG output
 * @jest-environment node
 */

import fs from 'fs';
import path from 'path';
import ChartRenderingService from '../../src/services/chart/ChartRenderingService.js';

describe('Chart Rendering Integration', () => {
  let testData;
  let renderingService;

  beforeAll(() => {
    // Load test data (sample API response)
    // Use process.cwd() to get project root instead of __dirname
    const projectRoot = process.cwd();
    const testDataPath = path.join(projectRoot, 'test.json');
    if (fs.existsSync(testDataPath)) {
      testData = JSON.parse(fs.readFileSync(testDataPath, 'utf8'));
    } else {
      throw new Error(`test.json not found at ${testDataPath}. Please ensure test data is available.`);
    }

    renderingService = new ChartRenderingService();
  });

  test('should extract all data sets from API response', () => {
    const extractedDataSets = renderingService.extractAllDataSets(testData);
    
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
        expect(typeof rasiByHouse[house]).toBe('number');
        expect(rasiByHouse[house]).toBeGreaterThanOrEqual(1);
        expect(rasiByHouse[house]).toBeLessThanOrEqual(12);
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

