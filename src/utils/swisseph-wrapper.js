/**
 * Swiss Ephemeris Wrapper (Native Node.js Bindings)
 * Production-grade Swiss Ephemeris using sweph native bindings
 * No WASM - uses native Node.js bindings for reliable performance
 * Provides compatibility layer for sweph-wasm API
 */

import path from 'path';
import fs from 'fs';

let swephNative = null;
let swisseph = null; // Compatibility wrapper
let swissephAvailable = false;
let swissephInitPromise = null;

/**
 * Setup ephemeris path
 * Sets the directory containing Swiss Ephemeris data files
 */
function setupEphemerisPath(ephemerisDir = null) {
  const isRender = Boolean(process.env.RENDER);
  const isNode = typeof window === 'undefined' && typeof process !== 'undefined';
  
  if (!isNode || !swephNative) {
    return;
  }
  
  // Default ephemeris directory (relative to process.cwd())
  const defaultEphemerisDir = ephemerisDir || path.resolve(process.cwd(), 'ephemeris');
  
  // Check if ephemeris directory exists and contains required files
  if (fs.existsSync(defaultEphemerisDir)) {
    const requiredFiles = ['seas_18.se1', 'semo_18.se1', 'sepl_18.se1'];
    const missingFiles = requiredFiles.filter(file => 
      !fs.existsSync(path.join(defaultEphemerisDir, file))
    );
    
    if (missingFiles.length === 0) {
      try {
        // Set ephemeris path using native bindings (synchronous)
        swephNative.set_ephe_path(defaultEphemerisDir);
        console.log(`✅ Ephemeris path set for ${isRender ? 'Render' : 'Node.js'}: ${defaultEphemerisDir}`);
      } catch (error) {
        console.log(`⚠️  Ephemeris path setup failed (${isRender ? 'Render' : 'Node.js'}), using bundled data: ${error.message}`);
      }
    } else {
      console.log(`⚠️  Missing ephemeris files (${missingFiles.join(', ')}), using bundled data`);
    }
  } else {
    console.log(`⚠️  Ephemeris directory not found: ${defaultEphemerisDir}, using bundled data`);
  }
}

/**
 * Create compatibility wrapper for sweph-wasm API
 * Maps sweph native functions to sweph-wasm API format
 */
function createSwissephWrapper(sweph) {
  return {
    // Julian day functions
    swe_julday: async (year, month, day, hour, gregflag) => {
      // sweph has julday function - use it directly
      return sweph.julday(year, month, day, hour, gregflag || 1);
    },
    
    swe_revjul: async (jd, gregflag) => {
      // sweph has revjul function - returns object, convert to array format
      const result = sweph.revjul(jd, gregflag || 1);
      // Convert {year, month, day, hour} to [year, month, day, hour]
      return [result.year, result.month, result.day, result.hour];
    },
    
    // Planetary calculations
    swe_calc_ut: async (jd, planetId, flags) => {
      const result = sweph.calc_ut(jd, planetId, flags || 0);
      
      // Convert sweph result format to sweph-wasm format
      // sweph returns: {flag, error, data: [longitude, latitude, distance, speed_lon, speed_lat, speed_dist]}
      // sweph-wasm returns: [rcode, longitude, latitude, distance, speed_lon, speed_lat, speed_dist]
      
      // Convert flag to rcode (sweph flag may be different from sweph-wasm rcode)
      const rcode = result.flag || (result.error && !result.error.includes('using Moshier') ? -1 : 0);
      
      return [rcode, ...(result.data || [0, 0, 0, 0, 0, 0])];
    },
    
    // Houses calculation
    swe_houses: async (jd, latitude, longitude, houseSystem) => {
      // sweph has houses function
      const result = sweph.houses(jd, latitude, longitude, houseSystem || 'P');
      
      // Convert sweph result format to sweph-wasm format
      // sweph returns: {flag, error, data: {houses: [12 houses], points: [asc, mc, ...]}}
      // sweph-wasm returns: {cusps: [12 houses], ascmc: [ascendant, mc]}
      
      if (result.error && !result.error.includes('using Moshier')) {
        throw new Error(`Houses calculation failed: ${result.error}`);
      }
      
      // Extract cusps from houses array and ascmc from points array
      const cusps = result.data?.houses || [];
      const points = result.data?.points || [];
      
      // ascmc should be [ascendant, MC] - first two points
      const ascmc = points.length >= 2 ? [points[0], points[1]] : [points[0] || 0, 0];
      
      return {
        cusps: cusps,
        ascmc: ascmc
      };
    },
    
    // Ayanamsa functions
    swe_get_ayanamsa: async (jd) => {
      // sweph get_ayanamsa returns number directly
      const ayanamsa = sweph.get_ayanamsa(jd);
      return {
        ayanamsa: ayanamsa,
        error: null
      };
    },
    
    // Sidereal mode
    swe_set_sid_mode: async (mode) => {
      // sweph.set_sid_mode requires 3 arguments: mode, jd_ut, ayanamsa_value
      // For compatibility, use default JD and calculate ayanamsa
      const defaultJd = 2451545.0; // J2000.0
      const ayanamsa = sweph.get_ayanamsa(defaultJd);
      sweph.set_sid_mode(mode, defaultJd, ayanamsa);
      return 0;
    },
    
    // Ephemeris path
    swe_set_ephe_path: async (ephemerisDir) => {
      sweph.set_ephe_path(ephemerisDir);
      return 0;
    },
    
    // Rise/transit (sunrise/sunset)
    swe_rise_trans: async (jd, planetId, starname, epheflag, rsmi, geopos, atpress, attemp) => {
      // sweph has rise_trans function
      // rsmi: 1 = rise, 2 = set
      const result = sweph.rise_trans(jd, planetId, starname || '', epheflag || 0, rsmi, geopos, atpress || 0, attemp || 0);
      
      // Convert result format
      // sweph returns: {flag, error, data: jd_value} (data is a number, not array)
      // sweph-wasm expects: {rcode, tret: jd_value, ...}
      
      if (result.error) {
        return {
          rcode: result.flag || -1,
          error: result.error,
          tret: null
        };
      }
      
      // Return result (tret is the JD of the event)
      return {
        rcode: result.flag || 0,
        tret: result.data || null
      };
    },
    
    // Constants
    SE_SUN: 0,
    SE_MOON: 1,
    SE_MERCURY: 2,
    SE_VENUS: 3,
    SE_MARS: 4,
    SE_JUPITER: 5,
    SE_SATURN: 6,
    SE_URANUS: 7,
    SE_NEPTUNE: 8,
    SE_PLUTO: 9,
    SE_MEAN_NODE: 10,
    SE_TRUE_NODE: 11,
    SE_SIDM_LAHIRI: 1,
    SE_GREG_CAL: 1,
    SE_SIDM_TRUE_CITRA: 27
  };
}

/**
 * Initialize sweph native bindings
 * Production-grade initialization - no WASM required
 */
async function initSwisseph() {
  if (swisseph !== null) {
    if (!swissephAvailable) {
      throw new Error('Swiss Ephemeris initialization failed. Swiss Ephemeris is required for all calculations.');
    }
    return { swisseph, available: swissephAvailable };
  }

  // If initialization is already in progress, return the promise
  if (swissephInitPromise) {
    return swissephInitPromise;
  }
  
  swissephInitPromise = (async () => {
    try {
      // Import sweph native bindings (no WASM needed)
      const swephModule = await import('sweph');
      
      // sweph provides synchronous native bindings
      // No initialization needed - functions are available immediately
      swephNative = swephModule.default || swephModule;
      swisseph = createSwissephWrapper(swephNative);
      swissephAvailable = true;
      
      console.log('✅ Swiss Ephemeris initialized using native Node.js bindings (sweph)');
      
      // Setup ephemeris path if files exist
      const ephemerisDir = path.resolve(process.cwd(), 'ephemeris');
      setupEphemerisPath(ephemerisDir);
      
      // Set Lahiri Ayanamsa for Vedic calculations
      try {
        const defaultJd = 2451545.0; // J2000.0
        const ayanamsa = swephNative.get_ayanamsa(defaultJd);
        swephNative.set_sid_mode(1, defaultJd, ayanamsa); // SE_SIDM_LAHIRI = 1
        console.log('✅ Swiss Ephemeris configured with Lahiri ayanamsa');
      } catch (error) {
        console.log(`⚠️  Ayanamsa setup failed, using default: ${error.message}`);
      }
      
      // Verify initialization with a test calculation
      try {
        const testJd = 2451545.0; // J2000.0
        const testResult = swephNative.calc_ut(testJd, 0, 0); // Calculate Sun position
        
        if (!testResult || typeof testResult !== 'object') {
          throw new Error('Test calculation failed - invalid result structure');
        }
        
        if (testResult.error && !testResult.error.includes('using Moshier')) {
          // Moshier fallback is acceptable, other errors are not
          throw new Error(`Test calculation failed: ${testResult.error}`);
        }
        
        console.log('✅ Swiss Ephemeris test calculation successful');
      } catch (testError) {
        console.error('⚠️  Swiss Ephemeris test calculation warning:', testError.message);
        // Continue anyway - test might show warnings but still work
      }
      
      return { swisseph, available: swissephAvailable };
      
    } catch (error) {
      swissephAvailable = false;
      swissephInitPromise = null;
      const finalError = new Error(`Swiss Ephemeris native bindings failed to load: ${error.message}. Please ensure sweph module is properly installed.`);
      console.error('❌ Swiss Ephemeris initialization error:', finalError.message);
      throw finalError;
    }
  })();
  
  return swissephInitPromise;
}

/**
 * Get swisseph with initialization
 * Returns initialized Swiss Ephemeris instance (compatibility wrapper)
 */
export async function getSwisseph() {
  if (swisseph === null) {
    await initSwisseph();
  }
  if (!swissephAvailable || !swisseph) {
    throw new Error('Swiss Ephemeris calculations are not available. Please ensure sweph module is properly installed.');
  }
  return swisseph;
}

/**
 * Setup ephemeris and initialization settings properly
 * Combines initialization with ephemeris setup
 * @param {string|null} ephemerisDir - Optional custom ephemeris directory
 * @returns {Object} Initialized swisseph instance
 */
export async function setupSwissephWithEphemeris(ephemerisDir = null) {
  const { swisseph } = await initSwisseph();
  
  // Setup ephemeris path
  setupEphemerisPath(ephemerisDir);
  
  // Set Lahiri Ayanamsa for Vedic calculations
  try {
    if (swephNative) {
      const defaultJd = 2451545.0; // J2000.0
      const ayanamsa = swephNative.get_ayanamsa(defaultJd);
      swephNative.set_sid_mode(1, defaultJd, ayanamsa); // SE_SIDM_LAHIRI
      console.log('✅ Swiss Ephemeris initialized with Lahiri ayanamsa');
    }
  } catch (error) {
    console.log(`⚠️  Ayanamsa setup failed, using default: ${error.message}`);
  }
  
  return { swisseph };
}

/**
 * Export the initialization function for external use
 */
export { initSwisseph };

/**
 * Check if swisseph is available
 * Throws error if not available (no graceful fallback)
 */
export async function isSwissephAvailable() {
  if (swisseph === null || !swissephAvailable) {
    // Try to initialize if not already done
    try {
      await initSwisseph();
    } catch (error) {
      throw new Error('Swiss Ephemeris is not available. Swiss Ephemeris is required for all calculations.');
    }
  }
  return true;
}

// Default export - provides a proxy interface that initializes on first use
// This maintains compatibility with existing code
export default new Proxy({}, {
  get(target, prop) {
    if (prop === 'then' || prop === 'catch' || prop === 'finally') {
      // Don't intercept promise methods
      return undefined;
    }
    
    if (swisseph === null) {
      throw new Error('Swiss Ephemeris must be initialized before use. Call initSwisseph() or getSwisseph() first.');
    }
    
    if (!swissephAvailable) {
      throw new Error(`Swiss Ephemeris not available - cannot access ${prop}. Ensure sweph module is properly initialized.`);
    }
    
    // Return the method/property from the compatibility wrapper
    if (typeof swisseph[prop] === 'function') {
      return swisseph[prop].bind(swisseph);
    }
    
    return swisseph[prop];
  }
});
