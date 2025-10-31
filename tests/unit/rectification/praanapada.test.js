import { computePraanapadaLongitude } from '../../../src/core/calculations/rectification/praanapada.js';

describe('Praanapada Calculator', () => {
  test('computes praanapada longitude with sunrise-aware palas', () => {
    const sunLongitudeDeg = 210.1234; // sample
    const sunriseLocal = new Date('1990-01-01T06:45:00');
    const birthLocal = new Date('1990-01-01T08:15:00'); // 90 min after sunrise => 3.75 palas

    const result = computePraanapadaLongitude({
      sunLongitudeDeg,
      birthDateLocal: birthLocal,
      sunriseLocal
    });

    expect(result).toBeTruthy();
    expect(typeof result.longitude).toBe('number');
    expect(result.longitude).toBeGreaterThanOrEqual(0);
    expect(result.longitude).toBeLessThan(360);
    expect(result.palas).toBeCloseTo(3.75, 2);
  });
});


