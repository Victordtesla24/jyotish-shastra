import { computeGulikaLongitude } from '../../../src/core/calculations/rectification/gulika.js';
import { getSwisseph } from '../../../src/utils/swisseph-wrapper.js';

describe('Gulika Calculator', () => {
  let swissephAvailable = false;

  beforeAll(async () => {
    try {
      // Use centralized Swiss Ephemeris wrapper (native bindings, no WASM)
      await getSwisseph();
      swissephAvailable = true;
    } catch (error) {
      console.warn('Sweph native bindings not available for gulika tests:', error.message);
      swissephAvailable = false;
    }
  });

  // This test requires ephemeris files present in ephemeris/ and runs deterministic enough for bounds
  test('computes gulika longitude and time for Mumbai sample', async () => {
    if (!swissephAvailable) {
      console.warn('Skipping gulika test - Swiss Ephemeris not available');
      return; // Skip test if sweph not available
    }

    const birthDateLocal = new Date('1990-01-01T12:00:00');
    const latitude = 19.076;
    const longitude = 72.8777;
    const timezone = '+05:30';

    const result = await computeGulikaLongitude({
      birthDateLocal,
      latitude,
      longitude,
      timezone,
      sunriseOptions: { useRefraction: true, useUpperLimb: true, atpress: 1013.25, attemp: 15 }
    });
    expect(result).toBeTruthy();
    expect(typeof result.longitude).toBe('number');
    expect(result.longitude).toBeGreaterThanOrEqual(0);
    expect(result.longitude).toBeLessThan(360);
    expect(result.gulikaTimeLocal instanceof Date).toBe(true);
  }, 20000);
});


