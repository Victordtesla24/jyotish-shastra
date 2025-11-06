import UIDataSaver from '../UIDataSaver.js';
import { CACHE_KEYS } from '../../../utils/cacheKeys.js';
import { canonical, hash } from '../../../utils/cachePolicy.js';

const CANONICAL_PREFIX = 'btr:v2';
const CANONICAL_KEYS = {
  birthData: `${CANONICAL_PREFIX}:birthData`,
  updatedAt: `${CANONICAL_PREFIX}:updatedAt`,
  fingerprint: `${CANONICAL_PREFIX}:fingerprint`,
  chartId: `${CANONICAL_PREFIX}:chartId`
};

// TTL constant for reference (15 minutes) - matches UIDataSaver.js TTL_MS
// eslint-disable-next-line no-unused-vars
const TTL_MS = 15 * 60 * 1000;

const baseBirthData = {
  name: 'Test User',
  dateOfBirth: '1990-01-01',
  timeOfBirth: '12:00',
  placeOfBirth: 'Mumbai, India',
  latitude: 19.076,
  longitude: 72.8777,
  timezone: 'Asia/Kolkata'
};

const computeFingerprint = (data) => {
  const payload = {
    name: (data.name || '').trim(),
    dateOfBirth: data.dateOfBirth,
    timeOfBirth: data.timeOfBirth,
    latitude: Number(data.latitude).toFixed(6),
    longitude: Number(data.longitude).toFixed(6),
    timezone: data.timezone
  };
  return hash(canonical(payload));
};

describe('UIDataSaver v2 canonical storage', () => {
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

  it('returns null when no birth data is stored', () => {
    expect(UIDataSaver.getBirthData()).toBeNull();
  });

  it('persists and retrieves fresh birth data with meta info', () => {
    expect(UIDataSaver.setBirthData(baseBirthData)).toBe(true);

    const storedJson = sessionStorage.getItem(CANONICAL_KEYS.birthData);
    expect(storedJson).not.toBeNull();

    const stored = JSON.parse(storedJson);
    expect(stored).toMatchObject({ ...baseBirthData, latitude: 19.076, longitude: 72.8777 });

    const result = UIDataSaver.getBirthData();
    expect(result?.data).toEqual(stored);
    expect(result?.meta).toMatchObject({ schema: '2', savedAtISO: '2024-01-01T00:00:00.000Z' });
    expect(typeof result?.meta?.fingerprint).toBe('string');
  });

  it('expires stale birth data after TTL window', () => {
    // Use real timers for this test to avoid fake timer issues
    jest.useRealTimers();
    
    // Clear all storage and reset UIDataSaver state
    sessionStorage.clear();
    localStorage.clear();
    UIDataSaver.clearAll();
    
    // Set expired data directly (4 hours ago, TTL is 15 minutes)
    const expiredTimestamp = new Date(Date.now() - (4 * 60 * 60 * 1000)).toISOString();
    sessionStorage.setItem(CANONICAL_KEYS.birthData, JSON.stringify(baseBirthData));
    sessionStorage.setItem(CANONICAL_KEYS.fingerprint, computeFingerprint(baseBirthData));
    sessionStorage.setItem(CANONICAL_KEYS.updatedAt, expiredTimestamp);
    sessionStorage.setItem(CANONICAL_KEYS.schema, '2');

    // Verify data exists before expiration check
    expect(sessionStorage.getItem(CANONICAL_KEYS.birthData)).not.toBeNull();
    
    // Verify data is expired and cleared
    const result = UIDataSaver.getBirthData();
    expect(result).toBeNull();
    
    // The storage should be cleared by the getBirthData() call when expired
    // Call getBirthData() again to ensure clearing happened
    const result2 = UIDataSaver.getBirthData();
    expect(result2).toBeNull();
    
    // Verify all keys are cleared
    expect(sessionStorage.getItem(CANONICAL_KEYS.birthData)).toBeNull();
    expect(sessionStorage.getItem(CANONICAL_KEYS.updatedAt)).toBeNull();
    expect(sessionStorage.getItem(CANONICAL_KEYS.fingerprint)).toBeNull();
    expect(sessionStorage.getItem(CANONICAL_KEYS.schema)).toBeNull();
    
    // Restore fake timers for other tests
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
  });

  it('produces distinct fingerprints for differing birth data', () => {
    UIDataSaver.setBirthData(baseBirthData);
    const firstMeta = UIDataSaver.getMeta();

    UIDataSaver.setBirthData({ ...baseBirthData, timeOfBirth: '18:45' });
    const secondMeta = UIDataSaver.getMeta();

    expect(firstMeta?.fingerprint).not.toEqual(secondMeta?.fingerprint);
  });

  it('stores and retrieves chart id while refreshing timestamp', () => {
    UIDataSaver.setBirthData(baseBirthData);
    UIDataSaver.setChartId('chart-001');

    expect(UIDataSaver.getChartId()).toBe('chart-001');
    const updatedAt = sessionStorage.getItem(CANONICAL_KEYS.updatedAt);
    expect(updatedAt).toBe('2024-01-01T00:00:00.000Z');
  });

  it('migrates legacy birth_data_session payload on first access', () => {
    sessionStorage.setItem(CACHE_KEYS.BIRTH_DATA_SESSION, JSON.stringify(baseBirthData));

    const retrieved = UIDataSaver.getBirthData();
    expect(retrieved?.data).toEqual(expect.objectContaining(baseBirthData));

    expect(sessionStorage.getItem(CACHE_KEYS.BIRTH_DATA_SESSION)).toBeNull();
    expect(sessionStorage.getItem(CANONICAL_KEYS.birthData)).not.toBeNull();
  });

  it('records last chart metadata with derived fingerprint hash', () => {
    UIDataSaver.setBirthData(baseBirthData);
    UIDataSaver.setLastChart('chart-777', baseBirthData);

    const raw = sessionStorage.getItem(CACHE_KEYS.LAST_CHART);
    expect(raw).not.toBeNull();

    const stored = JSON.parse(raw);
    expect(stored.chartId).toBe('chart-777');
    expect(stored.birthDataHash).toBe(computeFingerprint(baseBirthData));
    expect(typeof stored.savedAt).toBe('number');
  });
});

