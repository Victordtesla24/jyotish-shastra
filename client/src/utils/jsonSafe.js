/**
 * Safe JSON operations that never throw
 * Returns null on error instead of throwing exceptions
 * Eliminates repetitive try-catch blocks throughout the codebase
 * 
 * @module jsonSafe
 */

<<<<<<< Current (Your changes)
/**
 * Safely parse JSON string
 * @param {string} str - JSON string to parse
 * @returns {*|null} Parsed object or null if parse fails
 */
export function parse(str) {
  if (!str || typeof str !== 'string') {
    return null;
  }
  
  try {
    return JSON.parse(str);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug('[jsonSafe] Parse error:', error.message);
    }
    return null;
  }
}

/**
 * Safely stringify object to JSON
 * @param {*} obj - Object to stringify
 * @returns {string|null} JSON string or null if stringify fails
 */
export function stringify(obj) {
  if (obj === undefined) {
    return null;
  }
  
  try {
    return JSON.stringify(obj);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug('[jsonSafe] Stringify error:', error.message);
    }
    return null;
  }
}

/**
 * Default export as object with methods
 */
export default {
  parse,
  stringify,
};
=======
export const jsonSafe = {
  /**
   * Parse JSON without throwing. Returns null on failure or when input is not a string.
   * @param {string | null | undefined} str
   * @returns {unknown}
   */
  parse(str) {
    if (typeof str !== 'string') {
      return null;
    }

    try {
      return JSON.parse(str);
    } catch (error) {
      return null;
    }
  },

  /**
   * Stringify JSON without throwing. Returns null on failure.
   * @param {unknown} obj
   * @returns {string | null}
   */
  stringify(obj) {
    try {
      return JSON.stringify(obj);
    } catch (error) {
      return null;
    }
  }
};

export default jsonSafe;
>>>>>>> Incoming (Background Agent changes)
