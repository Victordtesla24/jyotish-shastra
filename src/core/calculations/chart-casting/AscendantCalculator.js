import { getSign, getSignName, getSignId } from '../../../utils/helpers/astrologyHelpers.js';
import { calculateJulianDay } from '../../../utils/calculations/julianDay.js';
import path from 'path';
import fs from 'fs';

// Swiss Ephemeris (WebAssembly) - handles serverless environments gracefully
let swisseph = null;
let swissephAvailable = false;
let swissephInitPromise = null;

/**
 * Initialize sweph-wasm module with explicit WASM path support
 */
async function ensureSwissephLoaded() {
  if (swisseph !== null) {
    return { swisseph, available: swissephAvailable };
  }
  
  if (swissephInitPromise) {
    return swissephInitPromise;
  }
  
  swissephInitPromise = (async () => {
    try {
      const SwissEPH = await import('sweph-wasm');
      const { getWasmPath } = await import('../../../utils/wasm-loader.js');
      
      // Get explicit WASM file path for Node.js environments
      const wasmPath = getWasmPath();
      
      if (wasmPath) {
        console.log('🏛️ AscendantCalculator: Using WASM path:', wasmPath);
      }
      
      // Initialize sweph-wasm with explicit WASM path if available
      swisseph = await SwissEPH.default.init(wasmPath || undefined);
      swissephAvailable = true;
      console.log('✅ AscendantCalculator: Swiss Ephemeris (WASM) initialized successfully');
      return { swisseph, available: swissephAvailable };
    } catch (error) {
      swissephAvailable = false;
      console.warn('⚠️ AscendantCalculator: sweph-wasm not available:', error.message);
      throw new Error(`Swiss Ephemeris is required for ascendant calculations but not available: ${error.message}`);
    }
  })();
  
  return swissephInitPromise;
}

// Cross-environment directory resolution
const __dirname = path.resolve(process.cwd(), 'src/core/calculations/chart-casting');

/**
 * Swiss Ephemeris House Calculator with proper WASM initialization
 * Production-grade implementation for serverless environments
 */
class AscendantCalculator {
  constructor(ayanamsa = 'LAHIRI') {
    this.ayanamsaType = ayanamsa;
    this.initialized = false;
    this.ephePath = null;
    this.swisseph = null;
    this.swissephAvailable = false;
    this.initPromise = null;
  }

  /**
   * Initialize the calculator with Swiss Ephemeris
   */
  async initialize() {
    if (this.initialized) {
      return true;
    }
    
    if (this.initPromise) {
      return this.initPromise;
    }
    
    this.initPromise = this._doInitialize();
    return this.initPromise;
  }

  async _doInitialize() {
    try {
      // Ensure Swiss Ephemeris is loaded
      const { swisseph, available } = await ensureSwissephLoaded();
      
      if (!available) {
        console.warn('⚠️ AscendantCalculator: Swiss Ephemeris not available - calculations disabled');
        this.initialized = false;
        return false;
      }
      
      this.swisseph = swisseph;
      this.swissephAvailable = available;
      
      // Set ephemeris path
      this.ephePath = path.resolve(process.cwd(), 'ephemeris');
      
      // For serverless environments, ephemeris data is often bundled
      if (fs.existsSync(this.ephePath)) {
        this.validateEphemerisFiles(this.ephePath);
        await this.swisseph.swe_set_ephe_path(this.ephePath);
        console.log('✅ AscendantCalculator: Ephemeris path set to:', this.ephePath);
      } else {
        console.warn('⚠️ AscendantCalculator: Ephemeris directory not found:', this.ephePath);
        console.warn('⚠️ AscendantCalculator: Using bundled ephemeris data');
      }
      
      // Set sidereal mode to Lahiri by default
      await this.swisseph.swe_set_sid_mode(1); // SE_SIDM_LAHIRI = 1
      
      // Test Swiss Ephemeris functionality with a known date
      const testDate = 2451545.0; // J2000.0
      const testResult = await this.swisseph.swe_houses(testDate, 28.7041, 77.1025, 'P');
      
      // Validate that Swiss Ephemeris is working properly
      if (!testResult || typeof testResult.ascendant !== 'number' || isNaN(testResult.ascendant)) {
        throw new Error('Swiss Ephemeris test calculation failed - ephemeris not functional');
      }
      
      this.initialized = true;
      console.log('✅ AscendantCalculator: Initialization completed successfully');
      return true;
      
    } catch (error) {
      console.warn('⚠️ AscendantCalculator: Initialization failed:', error.message);
      this.initialized = false;
      throw new Error(`AscendantCalculator initialization failed: ${error.message}`);
    }
  }

  /**
   * Validate ephemeris files exist (optional but helpful)
   */
  validateEphemerisFiles(ephePath) {
    try {
      if (!fs.existsSync(ephePath)) {
        throw new Error(`Ephemeris directory not found: ${ephePath}`);
      }
      
      // Check for essential ephemeris files
      const essentialFiles = ['sepl_18.se1', 'semo_18.se1', 'seas_18.se1'];
      const missingFiles = [];
      
      for (const file of essentialFiles) {
        const filePath = path.join(ephePath, file);
        if (!fs.existsSync(filePath)) {
          missingFiles.push(file);
        }
      }
      
      if (missingFiles.length > 0) {
        console.warn('⚠️ AscendantCalculator: Some ephemeris files missing:', missingFiles.join(', '));
      }
    } catch (error) {
      console.warn('⚠️ AscendantCalculator: Error validating ephemeris files:', error.message);
    }
  }

  /**
   * Calculate ascendant and house cusps
   */
  async calculateAscendantAndHouses(year, month, day, hours, minutes, latitude, longitude, houseSystem = 'P') {
    try {
      // Ensure calculator is initialized
      await this.initialize();
      
      if (!this.initialized || !this.swissephAvailable) {
        // Fallback to pure JavaScript calculation
        console.warn('⚠️ AscendantCalculator: Using fallback calculation');
        return this.calculateFallbackAscendantAndHouses(year, month, day, hours, minutes, latitude, longitude);
      }
      
      // Calculate Julian Day
      const julianDay = calculateJulianDay(year, month, day, hours + minutes / 60.0);
      
      // Calculate houses using Swiss Ephemeris
      const housesResult = await this.swisseph.swe_houses(julianDay, latitude, longitude, houseSystem);
      
      if (!housesResult || typeof housesResult.ascendant !== 'number') {
        throw new Error('Swiss Ephemeris house calculation failed');
      }
      
      // Calculate ayanamsa
      const ayanamsaResult = await this.swisseph.swe_get_ayanamsa(julianDay);
      const ayanamsa = ayanamsaResult.ayanamsa || 0;
      
      // Apply ayanamsa to ascendant (convert tropical to sidereal)
      const tropicalAscendant = housesResult.ascendant;
      const siderealAscendant = tropicalAscendant - ayanamsa;
      
      // Normalize degrees
      const normalizedAscendant = this.normalizeDegrees(siderealAscendant);
      
      // Get sign information
      const ascendantSign = getSign(normalizedAscendant);
      
      // Apply ayanamsa to all house cusps
      const siderealHouses = housesResult.house.map(cusp => this.normalizeDegrees(cusp - ayanamsa));
      
      // Get house signs
      const houseSigns = siderealHouses.map(cusp => getSign(cusp));
      
      return {
        ascendant: {
          longitude: normalizedAscendant,
          signIndex: ascendantSign.index,
          signName: ascendantSign.name,
          signId: ascendantSign.id,
          longitudeTropical: tropicalAscendant,
          ayanamsa: ayanamsa
        },
        houses: {
          cusps: siderealHouses,
          signs: houseSigns,
          system: houseSystem,
          tropicalCusps: housesResult.house,
          ascendant: housesResult.ascendant, // tropical ascendant
          midheaven: this.normalizeDegrees(housesResult.mc - ayanamsa),
          midheavenTropical: housesResult.mc
        },
        metadata: {
          julianDay: julianDay,
          ayanamsaType: this.ayanamsaType,
          method: 'swisseph-wasm',
          coordinates: {
            latitude: latitude,
            longitude: longitude
          }
        }
      };
      
    } catch (error) {
      console.warn('⚠️ AscendantCalculator: Error calculating with Swiss Ephemeris:', error.message);
      // Fallback to pure JavaScript calculation
      return this.calculateFallbackAscendantAndHouses(year, month, day, hours, minutes, latitude, longitude);
    }
  }

  /**
   * Fallback calculation using pure JavaScript for serverless environments
   */
  calculateFallbackAscendantAndHouses(year, month, day, hours, minutes, latitude, longitude) {
    console.log('🔄 AscendantCalculator: Using fallback JavaScript calculation');
    
    // Very simplified fallback calculation
    const date = new Date(year, month - 1, day, hours, minutes);
    const dayOfYear = Math.floor((date - new Date(year, 0, 0)) / (1000 * 60 * 60 * 24));
    
    // Approximate ascendant calculation (simplified)
    const lst = date.getHours() + date.getMinutes() / 60.0 + longitude / 15.0;
    const ascendantDegrees = (lst * 15 + dayOfYear * 0.9863 - 90) % 360;
    const normalizedAscendant = this.normalizeDegrees(ascendantDegrees);
    
    // Get ascendant sign
    const ascendantSign = getSign(normalizedAscendant);
    
    // Simplified house calculation
    const houses = [];
    for (let i = 1; i <= 12; i++) {
      const houseAngle = (i - 1) * 30 + normalizedAscendant;
      houses.push(this.normalizeDegrees(houseAngle));
    }
    
    const houseSigns = houses.map(cusp => getSign(cusp));
    
    return {
      ascendant: {
        longitude: normalizedAscendant,
        signIndex: ascendantSign.index,
        signName: ascendantSign.name,
        signId: ascendantSign.id,
        longitudeTropical: normalizedAscendant,
        ayanamsa: 0
      },
      houses: {
        cusps: houses,
        signs: houseSigns,
        system: 'P',
        tropicalCusps: houses,
        ascendant: normalizedAscendant,
        midheaven: this.normalizeDegrees(90 + normalizedAscendant),
        midheavenTropical: this.normalizeDegrees(90 + normalizedAscendant)
      },
      metadata: {
        julianDay: calculateJulianDay(year, month, day, hours + minutes / 60.0),
        ayanamsaType: this.ayanamsaType,
        method: 'fallback-javascript',
        coordinates: {
          latitude: latitude,
          longitude: longitude
        }
      }
    };
  }

  /**
   * Normalize degrees to 0-360 range
   */
  normalizeDegrees(degrees) {
    while (degrees < 0) degrees += 360;
    while (degrees >= 360) degrees -= 360;
    return degrees;
  }

  /**
   * Check if Swiss Ephemeris is available
   */
  async isSwissephAvailable() {
    try {
      await this.initialize();
      return this.swissephAvailable && this.initialized;
    } catch (error) {
      return false;
    }
  }
}

// Export a singleton instance for convenience
let calculatorInstance = null;

export function getAscendantCalculator(ayanamsa = 'LAHIRI') {
  if (!calculatorInstance) {
    calculatorInstance = new AscendantCalculator(ayanamsa);
  }
  return calculatorInstance;
}

// Export the class for direct instantiation
export default AscendantCalculator;

// Export utility functions
export { ensureSwissephLoaded };
export async function isSwissephAvailable() {
  if (swisseph === null) {
    await ensureSwissephLoaded();
  }
  return swissephAvailable;
}
