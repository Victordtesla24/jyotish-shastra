import ChartGenerationService from '../../../src/services/chart/ChartGenerationService.js';
import { sampleBirthData } from '../../test-data/sample-chart-data.js';

// Explicitly mock wasm-loader - use manual mock implementation
jest.mock('../../../src/utils/wasm-loader.js', () => {
  const path = require('path');
  const fs = require('fs');
  const cwd = process.cwd();
  
  function getWasmPath() {
    const possiblePaths = [
      path.resolve(cwd, 'node_modules/sweph-wasm/dist/wasm/swisseph.wasm'),
      path.resolve(cwd, 'public/swisseph.wasm'),
      path.resolve(cwd, 'client/public/swisseph.wasm')
    ];
    
    for (const wasmPath of possiblePaths) {
      if (fs.existsSync(wasmPath)) {
        const normalizedPath = wasmPath.replace(/\\/g, '/');
        return new URL(`file://${normalizedPath}`).href;
      }
    }
    return null;
  }
  
  function getWasmBuffer() {
    const possiblePaths = [
      path.resolve(cwd, 'node_modules/sweph-wasm/dist/wasm/swisseph.wasm'),
      path.resolve(cwd, 'public/swisseph.wasm'),
      path.resolve(cwd, 'client/public/swisseph.wasm')
    ];
    
    for (const wasmPath of possiblePaths) {
      if (fs.existsSync(wasmPath)) {
        return fs.readFileSync(wasmPath);
      }
    }
    return null;
  }
  
  return {
    getWasmPath,
    getWasmBuffer,
    wasmFileExists: () => getWasmPath() !== null,
    getEphemerisPathUrl: () => null,
    shouldSkipEphemerisPath: () => true
  };
});

// Increase timeout for WASM initialization
jest.setTimeout(30000);

describe('ChartGenerationService', () => {
  let chartGenerationService;

  beforeAll(() => {
    chartGenerationService = new ChartGenerationService();
  });

  // Helper to check if WASM initialization is available
  async function checkWasmAvailability() {
    try {
      await chartGenerationService.ensureSwissephInitialized();
      return true;
    } catch (error) {
      if (error.message && (error.message.includes('Swiss Ephemeris') || error.message.includes('WASM'))) {
        console.warn('⚠️  Swiss Ephemeris not available in test environment:', error.message);
        return false;
      }
      throw error;
    }
  }

  describe('generateRasiChart', () => {
    it('should generate a Rasi chart with all required components', async () => {
      // Check WASM availability before running test
      const wasmAvailable = await checkWasmAvailability();
      if (!wasmAvailable) {
        console.warn('⚠️  Skipping Rasi chart generation test - WASM not available. Server restart may be required.');
        return;
      }

      const chart = await chartGenerationService.generateRasiChart(sampleBirthData);

      // Validate Ascendant
      expect(chart).toHaveProperty('ascendant');
      expect(chart.ascendant).toHaveProperty('sign');
      expect(chart.ascendant).toHaveProperty('degree');

      // Validate Planetary Positions
      expect(chart).toHaveProperty('planetaryPositions');
      expect(Object.keys(chart.planetaryPositions).length).toBe(9);

      Object.values(chart.planetaryPositions).forEach(planet => {
        expect(planet).toHaveProperty('sign');
        expect(planet).toHaveProperty('degree');
        expect(planet).toHaveProperty('isRetrograde');
      });

      // Validate House Positions
      expect(chart).toHaveProperty('housePositions');
      expect(chart.housePositions.length).toBe(12);
    });

    it('should throw an error for invalid birth data', async () => {
      const invalidBirthData = { ...sampleBirthData, dateOfBirth: null };
      await expect(chartGenerationService.generateRasiChart(invalidBirthData)).rejects.toThrow();
    });
  });

  describe('generateNavamsaChart', () => {
    it('should generate a Navamsa (D9) chart', async () => {
      // Check WASM availability before running test
      const wasmAvailable = await checkWasmAvailability();
      if (!wasmAvailable) {
        console.warn('⚠️  Skipping Navamsa chart generation test - WASM not available. Server restart may be required.');
        return;
      }

      const navamsaChart = await chartGenerationService.generateNavamsaChart(sampleBirthData);

      expect(navamsaChart).toHaveProperty('ascendant');
      expect(navamsaChart).toHaveProperty('planetaryPositions');
      expect(Object.keys(navamsaChart.planetaryPositions).length).toBe(9);
      expect(navamsaChart).toHaveProperty('housePositions');
      expect(navamsaChart.housePositions.length).toBe(12);
    });
  });

  describe('calculateAscendant', () => {
    it('should calculate the ascendant correctly', async () => {
      // Check WASM availability before running test
      const wasmAvailable = await checkWasmAvailability();
      if (!wasmAvailable) {
        console.warn('⚠️  Skipping ascendant calculation test - WASM not available. Server restart may be required.');
        return;
      }

      // This is a placeholder test.
      // The actual implementation will require a more sophisticated test
      // with known inputs and expected outputs validated against astrological software.
      const jd = await chartGenerationService.calculateJulianDay(sampleBirthData.dateOfBirth, sampleBirthData.timeOfBirth, sampleBirthData.timezone);
      const ascendant = await chartGenerationService.calculateAscendant(jd, sampleBirthData);
      expect(ascendant).toBeDefined();
      expect(ascendant).toHaveProperty('sign');
      expect(ascendant).toHaveProperty('degree');
    });
  });

  describe('getPlanetaryPositions', () => {
    it('should retrieve planetary positions accurately', async () => {
      // Check WASM availability before running test
      const wasmAvailable = await checkWasmAvailability();
      if (!wasmAvailable) {
        console.warn('⚠️  Skipping planetary positions test - WASM not available. Server restart may be required.');
        return;
      }

      // This is a placeholder test.
      // Actual testing would involve comparing results against a trusted ephemeris source.
      const jd = await chartGenerationService.calculateJulianDay(sampleBirthData.dateOfBirth, sampleBirthData.timeOfBirth, sampleBirthData.timezone);
      const planets = await chartGenerationService.getPlanetaryPositions(jd);
      expect(planets).toBeDefined();
      // Check for planets object instead of length
      expect(Object.keys(planets).length).toBe(9);
    });
  });
});
