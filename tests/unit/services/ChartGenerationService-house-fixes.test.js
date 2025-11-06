/**
 * Chart Generation Service - House Assignment Fixes Test
 * Tests for house cusp sidereal conversion and ascendant house assignment
 */

import { ChartGenerationService } from '../../../src/services/chart/ChartGenerationService.js';

// Mock wasm-loader
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
  
  return {
    getWasmPath,
    getWasmBuffer: () => null,
    wasmFileExists: () => getWasmPath() !== null,
    getEphemerisPathUrl: () => null,
    shouldSkipEphemerisPath: () => true
  };
});

jest.setTimeout(30000);

describe('ChartGenerationService - House Assignment Fixes', () => {
  let chartService;

  beforeAll(() => {
    chartService = new ChartGenerationService();
  });

  // Helper to check if WASM initialization is available
  async function checkWasmAvailability() {
    try {
      await chartService.ensureSwissephInitialized();
      return true;
    } catch (error) {
      if (error.message && (error.message.includes('Swiss Ephemeris') || error.message.includes('WASM'))) {
        console.warn('⚠️  Swiss Ephemeris not available in test environment:', error.message);
        return false;
      }
      throw error;
    }
  }

  describe('House Cusp Sidereal Conversion', () => {
    it('should convert house cusps from tropical to sidereal', async () => {
      const wasmAvailable = await checkWasmAvailability();
      if (!wasmAvailable) {
        console.warn('⚠️  Skipping test - WASM not available');
        return;
      }

      const birthData = {
        name: 'Test',
        dateOfBirth: '1997-12-18',
        timeOfBirth: '00:00',
        latitude: 32.4935378,
        longitude: 74.5411575,
        timezone: 'Asia/Karachi',
        gender: 'male'
      };

      const chart = await chartService.generateRasiChart(birthData);

      // Verify house positions have sidereal conversion
      expect(chart.housePositions).toBeDefined();
      expect(chart.housePositions.length).toBe(12);

      // Verify House 1 cusp equals ascendant (sidereal)
      const house1 = chart.housePositions[0];
      const ascendant = chart.ascendant;

      expect(house1.houseNumber).toBe(1);
      expect(house1.system).toBe('Placidus');
      expect(house1.siderealLongitude).toBeDefined();
      expect(house1.tropicalLongitude).toBeDefined();
      expect(house1.ayanamsaUsed).toBeDefined();

      // House 1 cusp should equal ascendant (sidereal) within 0.1 degrees
      const house1Cusp = ((house1.longitude % 360) + 360) % 360;
      const ascendantLongitude = ((ascendant.longitude % 360) + 360) % 360;
      const diff = Math.abs(house1Cusp - ascendantLongitude);
      const normalizedDiff = Math.min(diff, 360 - diff);

      expect(normalizedDiff).toBeLessThan(0.1);
    });

    it('should assign ascendant to House 1', async () => {
      const wasmAvailable = await checkWasmAvailability();
      if (!wasmAvailable) {
        console.warn('⚠️  Skipping test - WASM not available');
        return;
      }

      const birthData = {
        name: 'Test',
        dateOfBirth: '1997-12-18',
        timeOfBirth: '00:00',
        latitude: 32.4935378,
        longitude: 74.5411575,
        timezone: 'Asia/Karachi',
        gender: 'male'
      };

      const chart = await chartService.generateRasiChart(birthData);

      // Verify ascendant has house property
      expect(chart.ascendant).toBeDefined();
      expect(chart.ascendant.house).toBe(1);
    });

    it('should use Placidus house system', async () => {
      const wasmAvailable = await checkWasmAvailability();
      if (!wasmAvailable) {
        console.warn('⚠️  Skipping test - WASM not available');
        return;
      }

      const birthData = {
        name: 'Test',
        dateOfBirth: '1997-12-18',
        timeOfBirth: '00:00',
        latitude: 32.4935378,
        longitude: 74.5411575,
        timezone: 'Asia/Karachi',
        gender: 'male'
      };

      const chart = await chartService.generateRasiChart(birthData);

      // Verify all house positions use Placidus system
      chart.housePositions.forEach(house => {
        expect(house.system).toBe('Placidus');
      });
    });
  });

  describe('House Assignment Accuracy', () => {
    it('should assign planets to correct houses based on sidereal cusps', async () => {
      const wasmAvailable = await checkWasmAvailability();
      if (!wasmAvailable) {
        console.warn('⚠️  Skipping test - WASM not available');
        return;
      }

      const birthData = {
        name: 'Farhan',
        dateOfBirth: '1997-12-18',
        timeOfBirth: '00:00',
        latitude: 32.4935378,
        longitude: 74.5411575,
        timezone: 'Asia/Karachi',
        gender: 'male'
      };

      const chart = await chartService.generateRasiChart(birthData);

      // Verify all planets have house assignments
      Object.values(chart.planetaryPositions).forEach(planet => {
        expect(planet.house).toBeDefined();
        expect(planet.house).toBeGreaterThanOrEqual(1);
        expect(planet.house).toBeLessThanOrEqual(12);
      });

      // Verify planets are in correct houses based on longitude
      const houseCusps = chart.housePositions.map(h => h.longitude);
      
      Object.entries(chart.planetaryPositions).forEach(([name, planet]) => {
        const planetLongitude = ((planet.longitude % 360) + 360) % 360;
        const assignedHouse = planet.house;
        const houseCusp = houseCusps[assignedHouse - 1];
        const nextHouseCusp = houseCusps[assignedHouse % 12];

        // Planet should be between its house cusp and next house cusp
        const isInHouse = (nextHouseCusp < houseCusp)
          ? (planetLongitude >= houseCusp || planetLongitude < nextHouseCusp)
          : (planetLongitude >= houseCusp && planetLongitude < nextHouseCusp);

        expect(isInHouse).toBe(true);
      });
    });
  });
});

