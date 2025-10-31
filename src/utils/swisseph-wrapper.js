/**
 * Swiss Ephemeris Wrapper
 * Production-grade Swiss Ephemeris initialization
 * Requires Swiss Ephemeris to be available - no fallbacks
 */

let swisseph = null;
let swissephAvailable = false;

/**
 * Initialize swisseph module
 * Throws error if Swiss Ephemeris is unavailable
 */
async function initSwisseph() {
  if (swisseph !== null) {
    if (!swissephAvailable) {
      throw new Error('Swiss Ephemeris initialization failed. Swiss Ephemeris is required for all calculations.');
    }
    return { swisseph, available: swissephAvailable };
  }
  
  try {
    const swissephModule = await import('swisseph');
    swisseph = swissephModule.default || swissephModule;
    swissephAvailable = true;
    console.log('✅ Swiss Ephemeris initialized successfully');
  } catch (error) {
    swissephAvailable = false;
    throw new Error(`Swiss Ephemeris is required but not available: ${error.message}. Please ensure swisseph module is properly installed and ephemeris files are configured.`);
  }
  
  return { swisseph, available: swissephAvailable };
}

/**
 * Get swisseph with initialization
 */
export async function getSwisseph() {
  if (swisseph === null) {
    await initSwisseph();
  }
  if (!swissephAvailable) {
    throw new Error('Swiss Ephemeris calculations are not available in this serverless environment');
  }
  return swisseph;
}

/**
 * Check if swisseph is available
 * Throws error if not available (no graceful fallback)
 */
export function isSwissephAvailable() {
  if (swisseph === null || !swissephAvailable) {
    throw new Error('Swiss Ephemeris is not available. Swiss Ephemeris is required for all calculations.');
  }
  return true;
}

// Default export - provides a synchronous interface that throws if unavailable
// This maintains compatibility with existing code
export default new Proxy({}, {
  get(target, prop) {
    if (swisseph === null) {
      throw new Error('Swiss Ephemeris must be initialized before use. This module requires serverless-compatible initialization.');
    }
    if (!swissephAvailable && prop !== 'then') {
      throw new Error(`Swiss Ephemeris not available - cannot access ${prop}. Serverless environments may not support native dependencies.`);
    }
    return swisseph[prop];
  }
});
