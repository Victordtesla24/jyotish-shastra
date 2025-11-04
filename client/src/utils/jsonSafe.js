/**
 * Safe JSON operations that never throw
 * Returns null on error instead of throwing exceptions
 * Eliminates repetitive try-catch blocks throughout the codebase
 * 
 * @module jsonSafe
 */

/**
 * Safely parse JSON string
 * @param {string} str - JSON string to parse
 * @returns {*|null} Parsed object or null if parse fails
 */
export function parse(str) {
  if (typeof str !== 'string' || str.length === 0) {
    return null;
  }

  try {
    return JSON.parse(str);
  } catch (_error) {
    return null;
  }
}

/**
 * Safely stringify object to JSON
 * @param {*} obj - Object to stringify
 * @returns {string|null} JSON string or null if stringify fails
 */
export function stringify(obj) {
  if (typeof obj === 'undefined') {
    return null;
  }

  try {
    return JSON.stringify(obj);
  } catch (_error) {
    return null;
  }
}

export const jsonSafe = {
  parse,
  stringify,
};

export default jsonSafe;
