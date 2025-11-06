/**
 * Integration Test: Navamsa vs Rasi Chart Differentiation
 * 
 * PURPOSE: Verify that Navamsa (D9) and Rasi (D1) charts produce DIFFERENT
 * planetary positions, as mathematically required by Vedic astrology.
 * 
 * CRITICAL VALIDATION:
 * - Navamsa divides each sign into 9 parts (3°20' each)
 * - Planetary positions MUST differ between Rasi and Navamsa
 * - House assignments MUST be calculated from respective ascendants
 * 
 * REGRESSION PREVENTION:
 * This test prevents the critical bug where Navamsa was rendering identical
 * to Rasi due to:
 * 1. Missing chartType parameter flow
 * 2. planetaryPositions.house being null
 * 3. Cached joinedData override
 * @jest-environment node
 */

import ChartGenerationServiceSingleton from '../../src/services/chart/ChartGenerationService.js';
import ChartRenderingService from '../../src/services/chart/ChartRenderingService.js';

describe('Navamsa vs Rasi Chart Differentiation', () => {
  let chartService;
  let renderingService;

  // Test data: Vikram's birth details
  const testBirthData = {
    dateOfBirth: '1985-10-24',
    timeOfBirth: '14:30',
    latitude: 18.5204,
    longitude: 73.8567,
    timezone: 'Asia/Kolkata',
    name: 'Integration Test User'
  };

  beforeAll(async () => {
    chartService = await ChartGenerationServiceSingleton.getInstance();
    renderingService = new ChartRenderingService();
  });

  describe('Chart Generation Layer', () => {
    let fullChartData;
    let rasiChart;
    let navamsaChart;

    beforeAll(async () => {
      // Generate comprehensive chart data
      fullChartData = await chartService.generateComprehensiveChart(testBirthData);
      rasiChart = fullChartData.rasiChart;
      navamsaChart = fullChartData.navamsaChart;
    });

    test('should generate both Rasi and Navamsa charts successfully', () => {
      expect(rasiChart).toBeDefined();
      expect(navamsaChart).toBeDefined();
      expect(rasiChart.ascendant).toBeDefined();
      expect(navamsaChart.ascendant).toBeDefined();
    });

    test('should have DIFFERENT ascendants for Rasi and Navamsa', () => {
      // Ascendants may be in different signs or different degrees
      const rasiAscSign = rasiChart.ascendant.sign;
      const navamsaAscSign = navamsaChart.ascendant.sign;
      
      console.log('Rasi Ascendant:', rasiAscSign, rasiChart.ascendant.longitude);
      console.log('Navamsa Ascendant:', navamsaAscSign, navamsaChart.ascendant.longitude);
      
      // At minimum, longitudes should differ
      expect(rasiChart.ascendant.longitude).not.toBe(navamsaChart.ascendant.longitude);
    });

    test('should have DIFFERENT planetary signs for at least 50% of planets', () => {
      const rasiPlanets = rasiChart.planetaryPositions;
      const navamsaPlanets = navamsaChart.planetaryPositions;
      
      const planetsToCheck = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];
      let differentSignCount = 0;
      
      planetsToCheck.forEach(planet => {
        const rasiSign = rasiPlanets[planet]?.sign;
        const navamsaSign = navamsaPlanets[planet]?.sign;
        
        if (rasiSign !== navamsaSign) {
          differentSignCount++;
          console.log(`${planet}: Rasi=${rasiSign}, Navamsa=${navamsaSign} ✅ DIFFERENT`);
        } else {
          console.log(`${planet}: Rasi=${rasiSign}, Navamsa=${navamsaSign} (same sign)`);
        }
      });
      
      // At least 50% should have different signs (typical for Navamsa)
      const differencePercentage = (differentSignCount / planetsToCheck.length) * 100;
      console.log(`Planets with different signs: ${differentSignCount}/${planetsToCheck.length} (${differencePercentage.toFixed(1)}%)`);
      
      expect(differentSignCount).toBeGreaterThanOrEqual(Math.ceil(planetsToCheck.length * 0.5));
    });

    test('Navamsa planetaryPositions should have house numbers (not null)', () => {
      const navamsaPlanets = navamsaChart.planetaryPositions;
      const planetsToCheck = ['moon', 'mars', 'jupiter', 'venus'];
      
      planetsToCheck.forEach(planet => {
        expect(navamsaPlanets[planet]).toBeDefined();
        expect(navamsaPlanets[planet].house).not.toBeNull();
        expect(navamsaPlanets[planet].house).toBeGreaterThanOrEqual(1);
        expect(navamsaPlanets[planet].house).toBeLessThanOrEqual(12);
        
        console.log(`${planet}: Sign=${navamsaPlanets[planet].sign}, House=${navamsaPlanets[planet].house}`);
      });
    });

    test('should have DIFFERENT house assignments for majority of planets', () => {
      const rasiPlanets = rasiChart.planetaryPositions;
      const navamsaPlanets = navamsaChart.planetaryPositions;
      
      const planetsToCheck = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];
      let differentHouseCount = 0;
      
      planetsToCheck.forEach(planet => {
        const rasiHouse = rasiPlanets[planet]?.house;
        const navamsaHouse = navamsaPlanets[planet]?.house;
        
        if (rasiHouse !== navamsaHouse) {
          differentHouseCount++;
          console.log(`${planet}: Rasi H${rasiHouse}, Navamsa H${navamsaHouse} ✅ DIFFERENT`);
        } else {
          console.log(`${planet}: Rasi H${rasiHouse}, Navamsa H${navamsaHouse} (same house)`);
        }
      });
      
      const differencePercentage = (differentHouseCount / planetsToCheck.length) * 100;
      console.log(`Planets with different houses: ${differentHouseCount}/${planetsToCheck.length} (${differencePercentage.toFixed(1)}%)`);
      
      // At least 60% should have different houses
      expect(differentHouseCount).toBeGreaterThanOrEqual(Math.ceil(planetsToCheck.length * 0.6));
    });
  });

  describe('Rendering Layer', () => {
    let chartData;
    let rasiSVG;
    let navamsaSVG;

    beforeAll(async () => {
      // Generate complete chart data
      chartData = await chartService.generateComprehensiveChart(testBirthData);
      
      // Render both chart types
      rasiSVG = renderingService.renderChartSVG(chartData, { chartType: 'rasi', width: 500 });
      navamsaSVG = renderingService.renderChartSVG(chartData, { chartType: 'navamsa', width: 500 });
    });

    test('should generate different SVG content for Rasi vs Navamsa', () => {
      expect(rasiSVG).toBeDefined();
      expect(navamsaSVG).toBeDefined();
      expect(typeof rasiSVG).toBe('string');
      expect(typeof navamsaSVG).toBe('string');
      
      // SVG content should be different
      expect(rasiSVG).not.toBe(navamsaSVG);
      
      console.log('Rasi SVG length:', rasiSVG.length);
      console.log('Navamsa SVG length:', navamsaSVG.length);
    });

    test('should have different planetary position coordinates in SVG', () => {
      // Extract Moon position from both SVGs
      const rasiMoonMatch = rasiSVG.match(/Mo (\d+)/);
      const navamsaMoonMatch = navamsaSVG.match(/Mo (\d+)/);
      
      expect(rasiMoonMatch).not.toBeNull();
      expect(navamsaMoonMatch).not.toBeNull();
      
      const rasiMoonDegree = rasiMoonMatch[1];
      const navamsaMoonDegree = navamsaMoonMatch[1];
      
      console.log('Rasi Moon degree:', rasiMoonDegree);
      console.log('Navamsa Moon degree:', navamsaMoonDegree);
      
      // Moon's degree notation in SVG should differ
      expect(rasiMoonDegree).not.toBe(navamsaMoonDegree);
    });

    test('should render planets in different SVG coordinates', () => {
      // Extract x,y coordinates for Moon from both SVGs
      const rasiMoonCoords = rasiSVG.match(/Mo \d+.*?x="([\d.]+)".*?y="([\d.]+)"/s);
      const navamsaMoonCoords = navamsaSVG.match(/Mo \d+.*?x="([\d.]+)".*?y="([\d.]+)"/s);
      
      if (rasiMoonCoords && navamsaMoonCoords) {
        const rasiX = parseFloat(rasiMoonCoords[1]);
        const rasiY = parseFloat(rasiMoonCoords[2]);
        const navamsaX = parseFloat(navamsaMoonCoords[1]);
        const navamsaY = parseFloat(navamsaMoonCoords[2]);
        
        console.log('Rasi Moon coordinates:', rasiX, rasiY);
        console.log('Navamsa Moon coordinates:', navamsaX, navamsaY);
        
        // At least one coordinate should differ by more than 10 pixels
        const diffX = Math.abs(rasiX - navamsaX);
        const diffY = Math.abs(rasiY - navamsaY);
        
        expect(diffX + diffY).toBeGreaterThan(10);
      }
    });
  });

  describe('End-to-End Verification', () => {
    test('Full stack: Birth data → Chart generation → Rendering produces different outputs', async () => {
      // This test verifies the complete data flow doesn't regress
      const fullChartData = await chartService.generateComprehensiveChart(testBirthData);
      
      // Verify both charts exist
      expect(fullChartData.rasiChart).toBeDefined();
      expect(fullChartData.navamsaChart).toBeDefined();
      
      // Verify Navamsa has different data
      const rasiMoon = fullChartData.rasiChart.planetaryPositions.moon;
      const navamsaMoon = fullChartData.navamsaChart.planetaryPositions.moon;
      
      console.log('Full Stack Test - Moon:');
      console.log('  Rasi:', rasiMoon.sign, 'H' + rasiMoon.house);
      console.log('  Navamsa:', navamsaMoon.sign, 'H' + navamsaMoon.house);
      
      // At minimum, house OR sign should differ
      const isDifferent = (rasiMoon.sign !== navamsaMoon.sign) || (rasiMoon.house !== navamsaMoon.house);
      expect(isDifferent).toBe(true);
      
      // Verify rendering produces different outputs
      const rasiRender = renderingService.renderChartSVG(fullChartData, { chartType: 'rasi' });
      const navamsaRender = renderingService.renderChartSVG(fullChartData, { chartType: 'navamsa' });
      
      expect(rasiRender).not.toBe(navamsaRender);
    });
  });
});

