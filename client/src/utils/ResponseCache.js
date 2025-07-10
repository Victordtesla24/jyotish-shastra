/**
 * Response Cache - Caching system for API responses with TTL support
 */

export class ResponseCache {
  constructor(options = {}) {
    this.cache = new Map();
    this.ttl = options.ttl || 5 * 60 * 1000; // Default 5 minutes
    this.maxSize = options.maxSize || 50; // Maximum cache entries
    this.cleanupInterval = options.cleanupInterval || 60 * 1000; // Cleanup every minute
    this.storage = options.useLocalStorage ? 'localStorage' : 'memory';
    this.storageKey = options.storageKey || 'api_response_cache';

    // Initialize from localStorage if enabled
    if (this.storage === 'localStorage') {
      this.loadFromStorage();
    }

    // Start cleanup interval
    this.startCleanupInterval();
  }

  /**
   * Generate cache key from endpoint and params
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Request parameters
   * @returns {string} Cache key
   */
  getCacheKey(endpoint, params = {}) {
    // Sort params for consistent key generation
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((acc, key) => {
        acc[key] = params[key];
        return acc;
      }, {});

    return `${endpoint}:${JSON.stringify(sortedParams)}`;
  }

  /**
   * Set cache entry
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Request parameters
   * @param {Object} response - Response data
   * @param {number} customTTL - Custom TTL for this entry (optional)
   */
  set(endpoint, params, response, customTTL = null) {
    const key = this.getCacheKey(endpoint, params);
    const ttl = customTTL || this.ttl;

    const entry = {
      data: response,
      timestamp: Date.now(),
      ttl: ttl,
      endpoint: endpoint,
      params: params,
      hits: 0
    };

    // Check cache size limit
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictOldest();
    }

    this.cache.set(key, entry);

    // Persist to localStorage if enabled
    if (this.storage === 'localStorage') {
      this.saveToStorage();
    }

    // Log cache set
    if (process.env.NODE_ENV === 'development') {
      console.log(`[ResponseCache] Cached: ${endpoint}`, { ttl: ttl / 1000 + 's' });
    }
  }

  /**
   * Get cache entry
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Request parameters
   * @returns {Object|null} Cached response or null
   */
  get(endpoint, params) {
    const key = this.getCacheKey(endpoint, params);
    const cached = this.cache.get(key);

    if (!cached) {
      return null;
    }

    // Check if expired
    const age = Date.now() - cached.timestamp;
    if (age > cached.ttl) {
      this.delete(endpoint, params);
      return null;
    }

    // Update hit count
    cached.hits++;

    // Log cache hit
    if (process.env.NODE_ENV === 'development') {
      console.log(`[ResponseCache] Hit: ${endpoint}`, {
        age: Math.round(age / 1000) + 's',
        hits: cached.hits
      });
    }

    return cached.data;
  }

  /**
   * Delete cache entry
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Request parameters
   */
  delete(endpoint, params) {
    const key = this.getCacheKey(endpoint, params);
    this.cache.delete(key);

    if (this.storage === 'localStorage') {
      this.saveToStorage();
    }
  }

  /**
   * Clear all cache entries
   */
  clear() {
    this.cache.clear();

    if (this.storage === 'localStorage') {
      try {
        localStorage.removeItem(this.storageKey);
      } catch (e) {
        console.warn('Could not clear cache from localStorage:', e);
      }
    }
  }

  /**
   * Clear cache entries for specific endpoint
   * @param {string} endpoint - API endpoint
   */
  clearEndpoint(endpoint) {
    const keysToDelete = [];

    for (const [key, entry] of this.cache.entries()) {
      if (entry.endpoint === endpoint) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));

    if (this.storage === 'localStorage') {
      this.saveToStorage();
    }
  }

  /**
   * Evict oldest cache entry
   */
  evictOldest() {
    let oldestKey = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Clean up expired entries
   */
  cleanup() {
    const now = Date.now();
    const keysToDelete = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key);
      }
    }

    if (keysToDelete.length > 0) {
      keysToDelete.forEach(key => this.cache.delete(key));

      if (this.storage === 'localStorage') {
        this.saveToStorage();
      }

      if (process.env.NODE_ENV === 'development') {
        console.log(`[ResponseCache] Cleaned up ${keysToDelete.length} expired entries`);
      }
    }
  }

  /**
   * Start cleanup interval
   */
  startCleanupInterval() {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.cleanupInterval);
  }

  /**
   * Stop cleanup interval
   */
  stopCleanupInterval() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  /**
   * Save cache to localStorage
   */
  saveToStorage() {
    if (this.storage !== 'localStorage') return;

    try {
      const cacheData = {
        entries: Array.from(this.cache.entries()),
        savedAt: Date.now()
      };
      localStorage.setItem(this.storageKey, JSON.stringify(cacheData));
    } catch (e) {
      console.warn('Could not save cache to localStorage:', e);
      // If quota exceeded, clear old entries
      if (e.name === 'QuotaExceededError') {
        this.clearOldEntries(0.5); // Clear 50% of old entries
      }
    }
  }

  /**
   * Load cache from localStorage
   */
  loadFromStorage() {
    if (this.storage !== 'localStorage') return;

    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return;

      const cacheData = JSON.parse(stored);
      const now = Date.now();

      // Restore non-expired entries
      cacheData.entries.forEach(([key, entry]) => {
        if (now - entry.timestamp <= entry.ttl) {
          this.cache.set(key, entry);
        }
      });

      if (process.env.NODE_ENV === 'development') {
        console.log(`[ResponseCache] Loaded ${this.cache.size} entries from localStorage`);
      }
    } catch (e) {
      console.warn('Could not load cache from localStorage:', e);
    }
  }

  /**
   * Clear percentage of old entries
   * @param {number} percentage - Percentage to clear (0-1)
   */
  clearOldEntries(percentage) {
    const entriesToClear = Math.floor(this.cache.size * percentage);
    const entries = Array.from(this.cache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp);

    for (let i = 0; i < entriesToClear; i++) {
      this.cache.delete(entries[i][0]);
    }

    if (this.storage === 'localStorage') {
      this.saveToStorage();
    }
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getStats() {
    const now = Date.now();
    let totalHits = 0;
    let totalSize = 0;
    const endpointStats = {};

    for (const entry of this.cache.values()) {
      totalHits += entry.hits;
      totalSize += JSON.stringify(entry.data).length;

      if (!endpointStats[entry.endpoint]) {
        endpointStats[entry.endpoint] = {
          count: 0,
          hits: 0,
          size: 0
        };
      }

      endpointStats[entry.endpoint].count++;
      endpointStats[entry.endpoint].hits += entry.hits;
      endpointStats[entry.endpoint].size += JSON.stringify(entry.data).length;
    }

    return {
      entries: this.cache.size,
      totalHits,
      totalSize,
      averageHitRate: this.cache.size > 0 ? totalHits / this.cache.size : 0,
      endpointStats,
      memoryUsage: this.storage === 'localStorage' ? 'localStorage' : `${Math.round(totalSize / 1024)}KB`
    };
  }

  /**
   * Destroy cache instance
   */
  destroy() {
    this.stopCleanupInterval();
    this.clear();
  }
}

// Create singleton instance with default configuration
const defaultCache = new ResponseCache({
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 50,
  useLocalStorage: true
});

// Endpoint-specific cache configurations
const cacheConfigs = {
  '/api/chart/generate': {
    ttl: 10 * 60 * 1000 // 10 minutes for chart data
  },
  '/api/analysis/comprehensive': {
    ttl: 15 * 60 * 1000 // 15 minutes for comprehensive analysis
  },
  '/api/geocoding/coordinates': {
    ttl: 60 * 60 * 1000 // 1 hour for geocoding data
  }
};

/**
 * Get cache TTL for endpoint
 * @param {string} endpoint - API endpoint
 * @returns {number} TTL in milliseconds
 */
export function getCacheTTL(endpoint) {
  return cacheConfigs[endpoint]?.ttl || defaultCache.ttl;
}

/**
 * Cache-aware fetch wrapper
 * @param {string} endpoint - API endpoint
 * @param {Object} params - Request parameters
 * @param {Function} fetcher - Function to fetch data if not cached
 * @param {Object} options - Cache options
 * @returns {Promise<Object>} Response data
 */
export async function cachedFetch(endpoint, params, fetcher, options = {}) {
  const cache = options.cache || defaultCache;
  const skipCache = options.skipCache || false;
  const customTTL = options.ttl || getCacheTTL(endpoint);

  // Check cache first (unless skip is requested)
  if (!skipCache) {
    const cached = cache.get(endpoint, params);
    if (cached) {
      return cached;
    }
  }

  // Fetch fresh data
  try {
    const response = await fetcher();

    // Cache successful response
    if (response && !options.noCache) {
      cache.set(endpoint, params, response, customTTL);
    }

    return response;
  } catch (error) {
    // On error, try to return stale cached data if available
    if (options.useStaleOnError) {
      const stale = cache.get(endpoint, params);
      if (stale) {
        console.warn('Returning stale cached data due to error:', error);
        return stale;
      }
    }

    throw error;
  }
}

export default defaultCache;
