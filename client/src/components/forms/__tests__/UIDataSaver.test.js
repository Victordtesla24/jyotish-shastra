import UIDataSaver from '../UIDataSaver.js';
import { CACHE_KEYS } from '../../../utils/cacheKeys.js';
import { CACHE_TTL_MS, canonical, hash } from '../../../utils/cachePolicy.js';

const sampleBirthData = {
  name: 'Test User',
  dateOfBirth: '1990-01-01',
  timeOfBirth: '12:00',
  placeOfBirth: 'Mumbai, India',
  latitude: 19.076,
  longitude: 72.8777,
  timezone: 'Asia/Kolkata'
};

const readCanonicalBirthData = () => {
  const raw = sessionStorage.getItem(CACHE_KEYS.BIRTH_DATA);
  return raw ? JSON.parse(raw) : null;
};

describe('UIDataSaver birth data persistence', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
    sessionStorage.clear();
    localStorage.clear();
    UIDataSaver.clearAll();
  });

  afterEach(() => {
    UIDataSaver.clearAll();
    jest.useRealTimers();
  });

  it('persists birth data using canonical stamped structure', () => {
    const result = UIDataSaver.setBirthData(sampleBirthData);
    expect(result).toBe(true);

    const stored = readCanonicalBirthData();
    expect(stored).not.toBeNull();
    expect(stored.data).toEqual(sampleBirthData);
    expect(stored.meta).toMatchObject({ dataHash: expect.any(String), savedAt: Date.now(), version: 1 });
  });

  it('rejects and clears expired canonical birth data', () => {
    const staleSavedAt = Date.now() - CACHE_TTL_MS - 1000;
    sessionStorage.setItem(
      CACHE_KEYS.BIRTH_DATA,
      JSON.stringify({
        data: sampleBirthData,
        meta: { savedAt: staleSavedAt, dataHash: 'hstale', version: 1 }
      })
    );

    const retrieved = UIDataSaver.getBirthData();

    expect(retrieved).toBeNull();
    expect(sessionStorage.getItem(CACHE_KEYS.BIRTH_DATA)).toBeNull();
  });

  it('handles corrupt canonical payloads gracefully', () => {
    sessionStorage.setItem(CACHE_KEYS.BIRTH_DATA, '{invalid json');

    const retrieved = UIDataSaver.getBirthData();

    expect(retrieved).toBeNull();
    expect(sessionStorage.getItem(CACHE_KEYS.BIRTH_DATA)).toBeNull();
  });

  it('upgrades legacy birth_data_session payload to canonical form', () => {
    sessionStorage.setItem(CACHE_KEYS.BIRTH_DATA_SESSION, JSON.stringify(sampleBirthData));

    const retrieved = UIDataSaver.getBirthData();

    expect(retrieved).not.toBeNull();
    expect(retrieved?.data).toEqual(sampleBirthData);

    const canonicalEntry = readCanonicalBirthData();
    expect(canonicalEntry).not.toBeNull();
    expect(canonicalEntry?.data).toEqual(sampleBirthData);
    expect(canonicalEntry?.meta?.dataHash).toEqual(hash(canonical(sampleBirthData)));
  });

  it('records last chart metadata with deterministic hash', () => {
    UIDataSaver.setLastChart('chart-123', sampleBirthData);

    const raw = sessionStorage.getItem(CACHE_KEYS.LAST_CHART);
    expect(raw).not.toBeNull();

    const stored = JSON.parse(raw);
    expect(stored.chartId).toBe('chart-123');
    expect(stored.birthDataHash).toBe(hash(canonical(sampleBirthData)));
    expect(typeof stored.savedAt).toBe('number');
  });
});

