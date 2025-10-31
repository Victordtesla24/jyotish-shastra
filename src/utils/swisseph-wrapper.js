/**
 * Swiss Ephemeris Wrapper
 * Provides optional swisseph import with fallback for serverless environments
 * where native dependencies may not be available
 */

let swisseph = null;
let swissephAvailable = false;

// Try to import swisseph - handle gracefully if unavailable
try {
  // For ES modules, use dynamic import pattern
  // We'll initialize this on first use
} catch (error) {
  // Will be handled during initialization
}

/**
 * Initialize swisseph module
 */
async function initSwisseph() {
  if (swisseph !== null) {
    return { swisseph, available: swissephAvailable };
  }
  
  try {
    const swissephModule = await import('swisseph');
    swisseph = swissephModule.default || swissephModule;
    swissephAvailable = true;
  } catch (error) {
    console.warn('⚠️  swisseph module not available:', error.message);
    console.warn('📝 Chart calculations may be limited without Swiss Ephemeris');
    swissephAvailable = false;
    
    // Create minimal mock
    swisseph = {
      swe_set_ephe_path: () => {},
      swe_set_sid_mode: () => {},
      SEFLG_SIDEREAL: 256,
      SEFLG_SPEED: 2,
      SE_SIDM_LAHIRI: 1,
      swe_calc_ut: () => {
        throw new Error('Swiss Ephemeris not available in this environment');
      },
      swe_julday: () => {
        throw new Error('Swiss Ephemeris not available in this environment');
      }
    };
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
 */
export function isSwissephAvailable() {
  return swissephAvailable;
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
