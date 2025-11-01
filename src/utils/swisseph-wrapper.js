/**
 * Swiss Ephemeris Wrapper (WebAssembly)
 * Production-grade Swiss Ephemeris initialization using sweph-wasm
 * Works in serverless environments - no native dependencies required
 */

import { getWasmPath, getWasmBuffer, shouldSkipEphemerisPath } from './wasm-loader.js';

let swisseph = null;
let swissephAvailable = false;
let swissephInitPromise = null;

/**
 * Setup ephemeris path safely
 * Avoids fetch issues with file paths in Node.js environment
 */
async function setupEphemerisPath(swisseph, ephemerisDir = null) {
  if (shouldSkipEphemerisPath()) {
    console.log('🔧 Ephemeris setup: Skipping custom path in Node.js (using bundled ephemeris data)');
    return;
  }
  
  if (ephemerisDir) {
    try {
      await swisseph.swe_set_ephe_path(ephemerisDir);
      console.log('✅ Ephemeris path set successfully:', ephemerisDir);
    } catch (error) {
      console.warn('⚠️ Ephemeris path setup failed (continuing with bundled ephemeris):', error.message);
    }
  }
}

/**
 * Initialize sweph-wasm module
 * Throws error if Swiss Ephemeris is unavailable
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
      const SwissEPH = await import('sweph-wasm');
      
      // Try multiple initialization strategies for better compatibility
      
      // Strategy 1: Try explicit WASM file path for Node.js environments
      const wasmPath = getWasmPath();
      
      try {
        if (wasmPath) {
          console.log('🔧 Trying WASM initialization with file path:', wasmPath);
          swisseph = await SwissEPH.default.init(wasmPath);
          swissephAvailable = true;
          console.log('✅ Swiss Ephemeris (WASM) initialized successfully using file path');
          return { swisseph, available: swissephAvailable };
        }
      } catch (pathError) {
        console.warn('⚠️ File path initialization failed:', pathError.message);
      }
      
      // Strategy 2: Try using WASM buffer directly (bypasses fetch)
      const wasmBuffer = getWasmBuffer();
      
      try {
        if (wasmBuffer) {
          console.log('🔧 Trying WASM initialization with buffer (', wasmBuffer.length, 'bytes)');
          // Some WASM libraries support passing a buffer directly
          // Check if SwissEPH.init accepts a buffer, otherwise try converting to blob
          let initArg = wasmBuffer;
          
          // Try with buffer directly
          try {
            swisseph = await SwissEPH.default.init(initArg);
            swissephAvailable = true;
            console.log('✅ Swiss Ephemeris (WASM) initialized successfully using buffer');
            return { swisseph, available: swissephAvailable };
          } catch (bufferError) {
            console.warn('⚠️ Buffer initialization failed:', bufferError.message);
            
            // Try creating a blob from the buffer
            if (typeof Blob !== 'undefined') {
              const blob = new Blob([wasmBuffer], { type: 'application/wasm' });
              const blobUrl = URL.createObjectURL(blob);
              
              try {
                swisseph = await SwissEPH.default.init(blobUrl);
                swissephAvailable = true;
                console.log('✅ Swiss Ephemeris (WASM) initialized successfully using blob URL');
                URL.revokeObjectURL(blobUrl); // Clean up
                return { swisseph, available: swissephAvailable };
              } catch (blobError) {
                console.warn('⚠️ Blob URL initialization failed:', blobError.message);
                URL.revokeObjectURL(blobUrl); // Clean up
              }
            }
          }
        }
      } catch (bufferError) {
        console.warn('⚠️ WASM buffer approach failed:', bufferError.message);
      }
      
      // Strategy 3: Try using Node.js 18+ fetch workaround with file:// URL
      try {
        if (wasmPath && wasmPath.startsWith('file://')) {
          console.log('🔧 Trying WASM initialization with Node.js fetch workaround');
          // In Node.js 18+, fetch works with file:// URLs
          const response = await fetch(wasmPath);
          const wasmBytes = await response.arrayBuffer();
          
          // Use the fetched buffer
          const wasmUint8Array = new Uint8Array(wasmBytes);
          swisseph = await SwissEPH.default.init(wasmUint8Array);
          swissephAvailable = true;
          console.log('✅ Swiss Ephemeris (WASM) initialized successfully using fetch + buffer');
          return { swisseph, available: swissephAvailable };
        }
      } catch (fetchError) {
        console.warn('⚠️ Fetch workaround failed:', fetchError.message);
      }
      
      // Strategy 4: Try default initialization (as last resort)
      try {
        console.log('🔧 Trying default WASM initialization');
        swisseph = await SwissEPH.default.init();
        swissephAvailable = true;
        console.log('✅ Swiss Ephemeris (WASM) initialized successfully using default method');
        return { swisseph, available: swissephAvailable };
      } catch (defaultError) {
        console.warn('⚠️ Default initialization failed:', defaultError.message);
      }
      
      // If all strategies failed, throw an error
      throw new Error('All WASM initialization strategies failed. Please check Node.js version and sweph-wasm installation.');
      
    } catch (error) {
      swissephAvailable = false;
      swissephInitPromise = null;
      throw new Error(`Swiss Ephemeris is required but not available: ${error.message}. Please ensure sweph-wasm module is properly installed.`);
    }
  })();
  
  return swissephInitPromise;
}

/**
 * Get swisseph with initialization
 */
export async function getSwisseph() {
  if (swisseph === null) {
    await initSwisseph();
  }
  if (!swissephAvailable || !swisseph) {
    throw new Error('Swiss Ephemeris calculations are not available. Please ensure sweph-wasm is properly installed.');
  }
  return swisseph;
}

/**
 * Setup ephemeris and initialization settings properly
 * Combines WASM initialization with ephemeris setup
 * @param {string|null} ephemerisDir - Optional custom ephemeris directory
 * @returns {Object} Initialized swisseph instance
 */
export async function setupSwissephWithEphemeris(ephemerisDir = null) {
  const { swisseph } = await initSwisseph();
  
  // Setup ephemeris safely
  await setupEphemerisPath(swisseph, ephemerisDir);
  
  // Set basic calculation settings
  try {
    // Set Lahiri Ayanamsa for Vedic calculations
    await swisseph.swe_set_sid_mode(1); // SE_SIDM_LAHIRI
  } catch (error) {
    console.warn('⚠️ Ayanamsa setup failed (using default):', error.message);
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
      throw new Error(`Swiss Ephemeris not available - cannot access ${prop}. Ensure sweph-wasm is properly initialized.`);
    }
    
    // Return the method/property from the initialized swisseph instance
    if (typeof swisseph[prop] === 'function') {
      return swisseph[prop].bind(swisseph);
    }
    
    return swisseph[prop];
  }
});
