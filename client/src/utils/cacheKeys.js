/**
 * Canonical storage keys for session and persistent data
 * Single source of truth for all browser storage key names
 * 
 * @module cacheKeys
 */

export const CACHE_KEYS = {
  /**
   * Primary canonical key for birth data storage
   * Structure: {data: {...birthData}, meta: {savedAt, dataHash, version}}
   * CRITICAL: This is the ONLY key that should be written to for birth data
   */
  BIRTH_DATA: 'birthData',
<<<<<<< Current (Your changes)
  
  /**
   * Session container key (legacy, kept for backward compatibility)
   * Contains: {birthData, coordinates, apiRequest, apiResponse, timestamp, sessionId}
   */
  SESSION: 'current_session',
  
  /**
   * Legacy birth data key (read-only for migration)
   * Deprecated: Use BIRTH_DATA instead
   */
  BIRTH_DATA_SESSION: 'birth_data_session',
  
  /**
   * Last chart generation metadata
   * Structure: {chartId, birthDataHash, savedAt}
   * Used for staleness detection and chart tracking
   */
  LAST_CHART: 'lastChart',
};
=======
  BIRTH_DATA_SESSION: 'birth_data_session',
  LAST_CHART: 'lastChart'
};

export default CACHE_KEYS;
>>>>>>> Incoming (Background Agent changes)

/**
 * Get all legacy keys that should be checked for migration
 * @returns {string[]} Array of legacy key names
 */
export function getLegacyKeys() {
  return [
    CACHE_KEYS.BIRTH_DATA_SESSION,
    CACHE_KEYS.SESSION,
  ];
}

/**
 * Check if a key is a legacy key
 * @param {string} key - Key name to check
 * @returns {boolean} True if key is legacy
 */
export function isLegacyKey(key) {
  return getLegacyKeys().includes(key);
}
