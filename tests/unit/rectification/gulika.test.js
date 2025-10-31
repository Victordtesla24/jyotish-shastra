import { computeGulikaLongitude } from '../../../src/core/calculations/rectification/gulika.js';

describe('Gulika Calculator', () => {
  // This test requires ephemeris files present in ephemeris/ and runs deterministic enough for bounds
  test('computes gulika longitude and time for Mumbai sample', async () => {
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


