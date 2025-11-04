/**
 * Cache policy utilities for TTL-based staleness detection
 * Implements stamping, freshness validation, and hash-based change detection
 * 
 * @module cachePolicy
 */

import { stringify } from './jsonSafe.js';

/**
 * Cache Time-To-Live in milliseconds
 * Default: 15 minutes (reasonable for session-based birth data)
 * Adjust if product requirements change
 */
export const CACHE_TTL_MS = 15 * 60 * 1000;

/**
 * Canonicalize object to stable string representation
 * Ensures consistent hashing regardless of property order
 * @param {Object} obj - Object to canonicalize
 * @returns {string} Stable JSON string with sorted keys
 */
export function canonical(obj) {
  if (!obj || typeof obj !== 'object') {
    return stringify(obj) || '';
  }
  
  // Sort keys for stable serialization
  const sortedKeys = Object.keys(obj).sort();
  const sortedObj = {};
  
  for (const key of sortedKeys) {
    sortedObj[key] = obj[key];
  }
  
  return stringify(sortedObj) || '';
}

/**
 * Lightweight hash function without crypto dependencies
 * Uses DJB2 algorithm variant (fast and good distribution)
 * @param {string} str - String to hash
 * @returns {string} Hash as hex string prefixed with 'h'
 */
export function hash(str) {
  if (!str || typeof str !== 'string') {
    return 'h0';
  }
  
  let h = 0;
  let i = 0;
  const len = str.length;
  
  while (i < len) {
    h = ((h << 5) - h + str.charCodeAt(i++)) | 0;
  }
  
  // Convert to unsigned and format as hex
  return `h${(h >>> 0).toString(16)}`;
}

/**
 * Stamp data with metadata for staleness detection
 * Wraps payload with timestamp and hash
 * @param {*} payload - Data to stamp
 * @returns {{data: *, meta: {savedAt: number, dataHash: string, version: number}}}
 */
export function stamp(payload) {
  const now = Date.now();
  const canonicalStr = canonical(payload);
  const dataHash = hash(canonicalStr);
  
  return {
    data: payload,
    meta: {
      savedAt: now,
      dataHash: dataHash,
      version: 1, // Schema version for future migrations
    },
  };
}

/**
 * Check if stamped data is still fresh (within TTL)
 * @param {Object} stamped - Stamped data object
 * @param {number} [ttl=CACHE_TTL_MS] - Custom TTL in milliseconds
 * @returns {boolean} True if data is fresh
 */
export function isFresh(stamped, ttl = CACHE_TTL_MS) {
  if (!stamped || typeof stamped !== 'object') {
    return false;
  }
  
  const { meta } = stamped;
  if (!meta || typeof meta.savedAt !== 'number') {
    return false;
  }
  
  const age = Date.now() - meta.savedAt;
  return age <= ttl;
}

/**
 * Validate stamped data structure
 * @param {*} stamped - Data to validate
 * @returns {boolean} True if structure is valid
 */
export function isValidStamped(stamped) {
  if (!stamped || typeof stamped !== 'object') {
    return false;
  }
  
  // Must have data property
  if (!('data' in stamped)) {
    return false;
  }
  
  // Must have meta with required fields
  const { meta } = stamped;
  if (!meta || typeof meta !== 'object') {
    return false;
  }
  
  if (typeof meta.savedAt !== 'number' || !meta.dataHash || !meta.version) {
    return false;
  }
  
  return true;
}

/**
 * Get age of stamped data in milliseconds
 * @param {Object} stamped - Stamped data object
 * @returns {number|null} Age in milliseconds or null if invalid
 */
export function getAge(stamped) {
  if (!stamped || !stamped.meta || typeof stamped.meta.savedAt !== 'number') {
    return null;
  }
  
  return Date.now() - stamped.meta.savedAt;
}

/**
 * Default export
 */
export default {
  CACHE_TTL_MS,
  canonical,
  hash,
  stamp,
  isFresh,
  isValidStamped,
  getAge,
};
