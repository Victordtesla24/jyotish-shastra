/**
 * Unit tests for UIDataSaver with canonical storage and TTL-based staleness detection
 * Tests cover: persistence, staleness, corruption, legacy migration, last chart tracking, and caching
 */

import { CACHE_KEYS } from '../../../utils/cacheKeys.js';
import { CACHE_TTL_MS } from '../../../utils/cachePolicy.js';

// Mock sessionStorage and localStorage for tests
const mockStorage = () => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
    get length() { return Object.keys(store).length; },
    key: (index) => Object.keys(store)[index] || null,
    _getStore: () => store // For debugging
  };
};

// Setup mocks before importing UIDataSaver
let sessionStorageMock;
let localStorageMock;

describe('UIDataSaver - Canonical Storage with TTL', () => {
  let UIDataSaver;

  beforeAll(() => {
    // Create fresh mocks
    sessionStorageMock = mockStorage();
    localStorageMock = mockStorage();
    
    // Replace global storage objects BEFORE importing UIDataSaver
    global.sessionStorage = sessionStorageMock;
    global.localStorage = localStorageMock;
    
    // Mock window if needed
    if (typeof window === 'undefined') {
      global.window = { addEventListener: jest.fn() };
    }
    if (typeof document === 'undefined') {
      global.document = { addEventListener: jest.fn() };
    }
    
    // Now import UIDataSaver (it will use our mocks)
    UIDataSaver = require('../UIDataSaver.js').default;
  });

  beforeEach(() => {
    // Clear storage before each test
    sessionStorageMock.clear();
    localStorageMock.clear();
    
    // Clear any cached data
    UIDataSaver.clearBirthData();
  });

  afterEach(() => {
    // Clean up after each test
    sessionStorageMock.clear();
    localStorageMock.clear();
  });

  // Test 1: Basic Persistence
  describe('Test 1: Basic Persistence', () => {
    it('should save and retrieve birth data with stamped structure', () => {
      const birthData = {
        name: 'Test User',
        dateOfBirth: '1990-01-01',
        timeOfBirth: '12:00',
        placeOfBirth: 'Mumbai, India',
        latitude: 19.076,
        longitude: 72.8777,
        timezone: 'Asia/Kolkata'
      };

      // Save birth data
      const saveResult = UIDataSaver.setBirthData(birthData);
      expect(saveResult).toBe(true);

      // Retrieve birth data
      const stored = UIDataSaver.getBirthData();

      // Validate stamped structure
      expect(stored).toBeTruthy();
      expect(stored.data).toEqual(birthData);
      expect(stored.meta).toBeTruthy();
      expect(stored.meta.savedAt).toBeGreaterThan(0);
      expect(stored.meta.dataHash).toBeTruthy();
      expect(stored.meta.version).toBe(1);

      // Verify canonical key was used
      const rawStored = sessionStorageMock.getItem(CACHE_KEYS.BIRTH_DATA);
      expect(rawStored).toBeTruthy();
    });

    it('should reject invalid input', () => {
      expect(UIDataSaver.setBirthData(null)).toBe(false);
      expect(UIDataSaver.setBirthData(undefined)).toBe(false);
      expect(UIDataSaver.setBirthData('string')).toBe(false);
      expect(UIDataSaver.setBirthData(123)).toBe(false);
    });
  });

  // Test 2: Staleness Rejection
  describe('Test 2: Staleness Rejection', () => {
    it('should reject stale data that exceeds TTL', () => {
      const birthData = {
        name: 'Test User',
        dateOfBirth: '1990-01-01',
        timeOfBirth: '12:00',
        placeOfBirth: 'Mumbai, India',
        latitude: 19.076,
        longitude: 72.8777,
        timezone: 'Asia/Kolkata'
      };

      // Save birth data
      UIDataSaver.setBirthData(birthData);

      // Manually modify savedAt to be stale (older than TTL)
      const rawStored = sessionStorageMock.getItem(CACHE_KEYS.BIRTH_DATA);
      const stamped = JSON.parse(rawStored);
      stamped.meta.savedAt = Date.now() - (CACHE_TTL_MS + 1000); // 1 second past TTL
      sessionStorageMock.setItem(CACHE_KEYS.BIRTH_DATA, JSON.stringify(stamped));

      // Clear in-memory cache to force read from storage
      UIDataSaver.clearBirthData();

      // Try to retrieve - should return null due to staleness
      const stored = UIDataSaver.getBirthData();
      expect(stored).toBeNull();

      // Verify stale data was removed
      const afterStaleCheck = sessionStorageMock.getItem(CACHE_KEYS.BIRTH_DATA);
      expect(afterStaleCheck).toBeNull();
    });

    it('should accept fresh data within TTL', () => {
      const birthData = {
        name: 'Test User',
        dateOfBirth: '1990-01-01',
        timeOfBirth: '12:00',
        placeOfBirth: 'Mumbai, India',
        latitude: 19.076,
        longitude: 72.8777,
        timezone: 'Asia/Kolkata'
      };

      // Save birth data
      UIDataSaver.setBirthData(birthData);

      // Manually modify savedAt to be just within TTL
      const rawStored = sessionStorageMock.getItem(CACHE_KEYS.BIRTH_DATA);
      const stamped = JSON.parse(rawStored);
      stamped.meta.savedAt = Date.now() - (CACHE_TTL_MS - 1000); // 1 second before TTL expires
      sessionStorageMock.setItem(CACHE_KEYS.BIRTH_DATA, JSON.stringify(stamped));

      // Clear in-memory cache to force read from storage
      UIDataSaver.clearBirthData();

      // Try to retrieve - should succeed
      const stored = UIDataSaver.getBirthData();
      expect(stored).toBeTruthy();
      expect(stored.data).toEqual(birthData);
    });
  });

  // Test 3: Corruption Handling
  describe('Test 3: Corruption Handling', () => {
    it('should handle corrupt JSON gracefully', () => {
      // Store invalid JSON
      sessionStorageMock.setItem(CACHE_KEYS.BIRTH_DATA, '{invalid json}');

      // Should return null without crashing
      const stored = UIDataSaver.getBirthData();
      expect(stored).toBeNull();
    });

    it('should handle missing data field in stamped structure', () => {
      // Store stamped structure without data field
      const incomplete = {
        meta: {
          savedAt: Date.now(),
          dataHash: 'h123',
          version: 1
        }
        // missing 'data' field
      };
      sessionStorageMock.setItem(CACHE_KEYS.BIRTH_DATA, JSON.stringify(incomplete));

      // Should return null
      const stored = UIDataSaver.getBirthData();
      expect(stored).toBeNull();
    });

    it('should handle missing meta field in stamped structure', () => {
      // Store stamped structure without meta field
      const incomplete = {
        data: { name: 'Test' }
        // missing 'meta' field
      };
      sessionStorageMock.setItem(CACHE_KEYS.BIRTH_DATA, JSON.stringify(incomplete));

      // Should return null
      const stored = UIDataSaver.getBirthData();
      expect(stored).toBeNull();
    });
  });

  // Test 4: Legacy Upgrade
  describe('Test 4: Legacy Key Migration', () => {
    it('should migrate from legacy current_session key', () => {
      const birthData = {
        name: 'Legacy User',
        dateOfBirth: '1990-01-01',
        timeOfBirth: '12:00',
        placeOfBirth: 'Mumbai, India',
        latitude: 19.076,
        longitude: 72.8777,
        timezone: 'Asia/Kolkata'
      };

      // Store in legacy format (current_session)
      const legacySession = { birthData };
      sessionStorageMock.setItem(CACHE_KEYS.SESSION, JSON.stringify(legacySession));

      // Retrieve - should migrate to canonical format
      const stored = UIDataSaver.getBirthData();

      // Verify migration
      expect(stored).toBeTruthy();
      expect(stored.data).toEqual(birthData);
      expect(stored.meta).toBeTruthy();

      // Verify canonical key now exists
      const canonicalRaw = sessionStorageMock.getItem(CACHE_KEYS.BIRTH_DATA);
      expect(canonicalRaw).toBeTruthy();

      const canonicalParsed = JSON.parse(canonicalRaw);
      expect(canonicalParsed.data).toEqual(birthData);
    });

    it('should migrate from legacy birth_data_session key', () => {
      const birthData = {
        name: 'Legacy User 2',
        dateOfBirth: '1990-01-01',
        timeOfBirth: '12:00',
        placeOfBirth: 'Mumbai, India',
        latitude: 19.076,
        longitude: 72.8777,
        timezone: 'Asia/Kolkata'
      };

      // Store in legacy format (birth_data_session)
      sessionStorageMock.setItem(CACHE_KEYS.BIRTH_DATA_SESSION, JSON.stringify(birthData));

      // Retrieve - should migrate to canonical format
      const stored = UIDataSaver.getBirthData();

      // Verify migration
      expect(stored).toBeTruthy();
      expect(stored.data).toEqual(birthData);
      expect(stored.meta).toBeTruthy();

      // Verify canonical key now exists
      const canonicalRaw = sessionStorageMock.getItem(CACHE_KEYS.BIRTH_DATA);
      expect(canonicalRaw).toBeTruthy();
    });

    it('should migrate from localStorage persistence', () => {
      const birthData = {
        name: 'Persistent User',
        dateOfBirth: '1990-01-01',
        timeOfBirth: '12:00',
        placeOfBirth: 'Mumbai, India',
        latitude: 19.076,
        longitude: 72.8777,
        timezone: 'Asia/Kolkata'
      };

      // Store in localStorage
      localStorageMock.setItem('jyotish_shastra_data_birthData', JSON.stringify(birthData));

      // Retrieve - should migrate to canonical sessionStorage format
      const stored = UIDataSaver.getBirthData();

      // Verify migration
      expect(stored).toBeTruthy();
      expect(stored.data).toEqual(birthData);
      expect(stored.meta).toBeTruthy();

      // Verify canonical key now exists in sessionStorage
      const canonicalRaw = sessionStorageMock.getItem(CACHE_KEYS.BIRTH_DATA);
      expect(canonicalRaw).toBeTruthy();
    });
  });

  // Test 5: Last Chart Tracking
  describe('Test 5: Last Chart Tracking', () => {
    it('should track last chart with hash', () => {
      const birthData = {
        name: 'Chart User',
        dateOfBirth: '1990-01-01',
        timeOfBirth: '12:00',
        placeOfBirth: 'Mumbai, India',
        latitude: 19.076,
        longitude: 72.8777,
        timezone: 'Asia/Kolkata'
      };

      // Save birth data first
      UIDataSaver.setBirthData(birthData);

      // Track chart
      const chartId = 'chart_12345';
      const result = UIDataSaver.setLastChart(chartId, birthData);
      expect(result).toBe(true);

      // Verify tracking
      const lastChartRaw = sessionStorageMock.getItem(CACHE_KEYS.LAST_CHART);
      expect(lastChartRaw).toBeTruthy();

      const lastChart = JSON.parse(lastChartRaw);
      expect(lastChart.chartId).toBe(chartId);
      expect(lastChart.birthDataHash).toBeTruthy();
      expect(lastChart.savedAt).toBeGreaterThan(0);
    });

    it('should track chart without explicit birthData', () => {
      const birthData = {
        name: 'Chart User 2',
        dateOfBirth: '1990-01-01',
        timeOfBirth: '12:00',
        placeOfBirth: 'Mumbai, India',
        latitude: 19.076,
        longitude: 72.8777,
        timezone: 'Asia/Kolkata'
      };

      // Save birth data first
      UIDataSaver.setBirthData(birthData);

      // Track chart without passing birthData (should read from cache)
      const chartId = 'chart_67890';
      const result = UIDataSaver.setLastChart(chartId);
      expect(result).toBe(true);

      // Verify tracking
      const lastChartRaw = sessionStorageMock.getItem(CACHE_KEYS.LAST_CHART);
      expect(lastChartRaw).toBeTruthy();

      const lastChart = JSON.parse(lastChartRaw);
      expect(lastChart.chartId).toBe(chartId);
      expect(lastChart.birthDataHash).toBeTruthy();
    });

    it('should reject tracking without chartId', () => {
      const result = UIDataSaver.setLastChart(null);
      expect(result).toBe(false);
    });
  });

  // Test 6: In-Memory Cache
  describe('Test 6: In-Memory Cache Performance', () => {
    it('should use in-memory cache on second read', () => {
      const birthData = {
        name: 'Cached User',
        dateOfBirth: '1990-01-01',
        timeOfBirth: '12:00',
        placeOfBirth: 'Mumbai, India',
        latitude: 19.076,
        longitude: 72.8777,
        timezone: 'Asia/Kolkata'
      };

      // First save
      UIDataSaver.setBirthData(birthData);

      // First read (from storage)
      const first = UIDataSaver.getBirthData();
      expect(first).toBeTruthy();

      // Modify storage directly (simulate corruption)
      sessionStorageMock.setItem(CACHE_KEYS.BIRTH_DATA, '{invalid}');

      // Second read should still work (from in-memory cache)
      const second = UIDataSaver.getBirthData();
      expect(second).toBeTruthy();
      expect(second.data).toEqual(birthData);
    });

    it('should invalidate in-memory cache after clearBirthData', () => {
      const birthData = {
        name: 'Clear Test User',
        dateOfBirth: '1990-01-01',
        timeOfBirth: '12:00',
        placeOfBirth: 'Mumbai, India',
        latitude: 19.076,
        longitude: 72.8777,
        timezone: 'Asia/Kolkata'
      };

      // Save and read to populate cache
      UIDataSaver.setBirthData(birthData);
      UIDataSaver.getBirthData();

      // Clear
      UIDataSaver.clearBirthData();

      // Should return null now
      const stored = UIDataSaver.getBirthData();
      expect(stored).toBeNull();
    });

    it('should invalidate in-memory cache for stale data', () => {
      const birthData = {
        name: 'Stale Cache User',
        dateOfBirth: '1990-01-01',
        timeOfBirth: '12:00',
        placeOfBirth: 'Mumbai, India',
        latitude: 19.076,
        longitude: 72.8777,
        timezone: 'Asia/Kolkata'
      };

      // Save birth data
      UIDataSaver.setBirthData(birthData);

      // Manually modify savedAt in both storage and would-be cache
      const rawStored = sessionStorageMock.getItem(CACHE_KEYS.BIRTH_DATA);
      const stamped = JSON.parse(rawStored);
      stamped.meta.savedAt = Date.now() - (CACHE_TTL_MS + 1000);
      sessionStorageMock.setItem(CACHE_KEYS.BIRTH_DATA, JSON.stringify(stamped));

      // Force a fresh read by clearing cache
      UIDataSaver.clearBirthData();

      // Should return null due to staleness
      const stored = UIDataSaver.getBirthData();
      expect(stored).toBeNull();
    });
  });

  // Additional Edge Cases
  describe('Edge Cases', () => {
    it('should handle empty sessionStorage gracefully', () => {
      sessionStorageMock.clear();
      const stored = UIDataSaver.getBirthData();
      expect(stored).toBeNull();
    });

    it('should handle data mutations between save and retrieve', () => {
      const birthData = {
        name: 'Mutation Test',
        dateOfBirth: '1990-01-01',
        timeOfBirth: '12:00',
        placeOfBirth: 'Mumbai, India',
        latitude: 19.076,
        longitude: 72.8777,
        timezone: 'Asia/Kolkata'
      };

      UIDataSaver.setBirthData(birthData);

      // Mutate original object
      birthData.name = 'Mutated Name';

      // Clear in-memory cache to force read from storage
      UIDataSaver.clearBirthData();

      // Now retrieve from storage - should be unchanged (immutable)
      const stored = UIDataSaver.getBirthData();
      expect(stored.data.name).toBe('Mutation Test');
    });
  });
});

