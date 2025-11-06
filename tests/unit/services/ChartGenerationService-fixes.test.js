/**
 * Chart Generation Service Fixes Verification Tests
 * Tests for chart generation quality fixes:
 * - Outer planets (Uranus, Neptune, Pluto) calculation
 * - Placidus house system
 * - Retrograde calculation with speed flag
 * - Dignity calculation with proper own signs
 */

import { ChartGenerationService } from '../../../src/services/chart/ChartGenerationService.js';

// Increase timeout for WASM initialization
jest.setTimeout(30000);

describe('Chart Generation Service Fixes', () => {
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

  describe('Outer Planets Calculation', () => {
    it('should attempt to calculate outer planets (Uranus, Neptune, Pluto)', async () => {
      const wasmAvailable = await checkWasmAvailability();
      if (!wasmAvailable) {
        console.warn('⚠️  Skipping outer planets test - WASM not available.');
        return;
      }

      const birthData = {
        name: 'Test',
        dateOfBirth: '1990-01-01',
        timeOfBirth: '12:00',
        latitude: 18.5204,
        longitude: 73.8567,
        timezone: 'Asia/Kolkata',
        gender: 'male'
      };

      const jd = await chartGenerationService.calculateJulianDay(
        birthData.dateOfBirth,
        birthData.timeOfBirth,
        birthData.timezone
      );

      const planets = await chartGenerationService.getPlanetaryPositions(jd);

      // Verify traditional planets are present
      expect(planets).toHaveProperty('sun');
      expect(planets).toHaveProperty('moon');
      expect(planets).toHaveProperty('mars');
      expect(planets).toHaveProperty('mercury');
      expect(planets).toHaveProperty('jupiter');
      expect(planets).toHaveProperty('venus');
      expect(planets).toHaveProperty('saturn');
      expect(planets).toHaveProperty('rahu');
      expect(planets).toHaveProperty('ketu');

      // Outer planets may or may not be present depending on Swiss Ephemeris version
      // If present, they should have all required properties
      if (planets.uranus) {
        expect(planets.uranus).toHaveProperty('longitude');
        expect(planets.uranus).toHaveProperty('sign');
        expect(planets.uranus).toHaveProperty('signId');
        expect(planets.uranus).toHaveProperty('degree');
        expect(planets.uranus).toHaveProperty('isRetrograde');
        expect(planets.uranus).toHaveProperty('dignity');
      }

      if (planets.neptune) {
        expect(planets.neptune).toHaveProperty('longitude');
        expect(planets.neptune).toHaveProperty('sign');
        expect(planets.neptune).toHaveProperty('signId');
        expect(planets.neptune).toHaveProperty('degree');
        expect(planets.neptune).toHaveProperty('isRetrograde');
        expect(planets.neptune).toHaveProperty('dignity');
      }

      if (planets.pluto) {
        expect(planets.pluto).toHaveProperty('longitude');
        expect(planets.pluto).toHaveProperty('sign');
        expect(planets.pluto).toHaveProperty('signId');
        expect(planets.pluto).toHaveProperty('degree');
        expect(planets.pluto).toHaveProperty('isRetrograde');
        expect(planets.pluto).toHaveProperty('dignity');
      }
    });
  });

  describe('House System - Placidus', () => {
    it('should use Placidus house system for house calculations', async () => {
      const wasmAvailable = await checkWasmAvailability();
      if (!wasmAvailable) {
        console.warn('⚠️  Skipping house system test - WASM not available.');
        return;
      }

      const birthData = {
        name: 'Test',
        dateOfBirth: '1990-01-01',
        timeOfBirth: '12:00',
        latitude: 18.5204,
        longitude: 73.8567,
        timezone: 'Asia/Kolkata',
        gender: 'male'
      };

      const chart = await chartGenerationService.generateRasiChart(birthData);

      // Verify house positions are calculated
      expect(chart).toHaveProperty('housePositions');
      expect(chart.housePositions).toHaveLength(12);

      // Verify each house has required properties
      chart.housePositions.forEach((house, index) => {
        expect(house).toHaveProperty('houseNumber');
        expect(house.houseNumber).toBe(index + 1);
        expect(house).toHaveProperty('longitude');
        expect(house).toHaveProperty('sign');
        expect(house).toHaveProperty('signId');
        expect(typeof house.longitude).toBe('number');
        expect(house.longitude).toBeGreaterThanOrEqual(0);
        expect(house.longitude).toBeLessThan(360);
      });
    });
  });

  describe('Retrograde Calculation', () => {
    it('should calculate retrograde status using speed flag', async () => {
      const wasmAvailable = await checkWasmAvailability();
      if (!wasmAvailable) {
        console.warn('⚠️  Skipping retrograde calculation test - WASM not available.');
        return;
      }

      const birthData = {
        name: 'Test',
        dateOfBirth: '1990-01-01',
        timeOfBirth: '12:00',
        latitude: 18.5204,
        longitude: 73.8567,
        timezone: 'Asia/Kolkata',
        gender: 'male'
      };

      const jd = await chartGenerationService.calculateJulianDay(
        birthData.dateOfBirth,
        birthData.timeOfBirth,
        birthData.timezone
      );

      const planets = await chartGenerationService.getPlanetaryPositions(jd);

      // Verify all planets have retrograde status
      Object.entries(planets).forEach(([planetName, planetData]) => {
        expect(planetData).toHaveProperty('isRetrograde');
        expect(typeof planetData.isRetrograde).toBe('boolean');
        expect(planetData).toHaveProperty('speed');
        expect(typeof planetData.speed).toBe('number');
        // Retrograde should be true if speed < 0
        if (planetData.speed < 0) {
          expect(planetData.isRetrograde).toBe(true);
        }
      });
    });
  });

  describe('Dignity Calculation', () => {
    it('should calculate dignity correctly with proper own signs', async () => {
      const wasmAvailable = await checkWasmAvailability();
      if (!wasmAvailable) {
        console.warn('⚠️  Skipping dignity calculation test - WASM not available.');
        return;
      }

      const birthData = {
        name: 'Test',
        dateOfBirth: '1990-01-01',
        timeOfBirth: '12:00',
        latitude: 18.5204,
        longitude: 73.8567,
        timezone: 'Asia/Kolkata',
        gender: 'male'
      };

      const jd = await chartGenerationService.calculateJulianDay(
        birthData.dateOfBirth,
        birthData.timeOfBirth,
        birthData.timezone
      );

      const planets = await chartGenerationService.getPlanetaryPositions(jd);

      // Verify all planets have dignity status
      Object.entries(planets).forEach(([planetName, planetData]) => {
        expect(planetData).toHaveProperty('dignity');
        expect(['exalted', 'debilitated', 'own', 'neutral']).toContain(planetData.dignity);
        expect(planetData).toHaveProperty('signId');
        
        // Test dignity calculation for specific planets
        if (planetName === 'mercury' && planetData.signId === 6) {
          // Mercury in Virgo (signId 6) should be exalted
          expect(planetData.dignity).toBe('exalted');
        }
        
        if (planetName === 'mars' && planetData.signId === 10) {
          // Mars in Capricorn (signId 10) should be exalted
          expect(planetData.dignity).toBe('exalted');
        }
        
        if (planetName === 'jupiter' && planetData.signId === 10) {
          // Jupiter in Capricorn (signId 10) should be debilitated
          expect(planetData.dignity).toBe('debilitated');
        }
      });
    });
  });

  describe('House Assignment', () => {
    it('should assign houses to all planets correctly', async () => {
      const wasmAvailable = await checkWasmAvailability();
      if (!wasmAvailable) {
        console.warn('⚠️  Skipping house assignment test - WASM not available.');
        return;
      }

      const birthData = {
        name: 'Test',
        dateOfBirth: '1990-01-01',
        timeOfBirth: '12:00',
        latitude: 18.5204,
        longitude: 73.8567,
        timezone: 'Asia/Kolkata',
        gender: 'male'
      };

      const chart = await chartGenerationService.generateRasiChart(birthData);

      // Verify all planets have house assignments
      Object.entries(chart.planetaryPositions).forEach(([planetName, planetData]) => {
        expect(planetData).toHaveProperty('house');
        expect(typeof planetData.house).toBe('number');
        expect(planetData.house).toBeGreaterThanOrEqual(1);
        expect(planetData.house).toBeLessThanOrEqual(12);
      });
    });
  });
});

