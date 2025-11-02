import { getSign, getSignName, getSignId } from '../../../utils/helpers/astrologyHelpers.js';
import { calculateJulianDay } from '../../../utils/calculations/julianDay.js';
import { getSwisseph } from '../../../utils/swisseph-wrapper.js';
import path from 'path';
import fs from 'fs';

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
      // Use centralized Swiss Ephemeris wrapper (native bindings, no WASM)
      this.swisseph = await getSwisseph();
      this.swissephAvailable = true;
      
      // Enhanced ephemeris path setup with Render compatibility
      this.ephePath = path.resolve(process.cwd(), 'ephemeris');
      
      if (fs.existsSync(this.ephePath)) {
        this.validateEphemerisFiles(this.ephePath);
        console.log(`✅ AscendantCalculator: Ephemeris files validated for ${process.env.RENDER ? 'Render' : 'Node.js'}: ${this.ephePath}`);
      } else {
        console.log(`📁 AscendantCalculator: Ephemeris directory not found, using bundled data: ${this.ephePath}`);
      }
      
      // Set sidereal mode to Lahiri by default (handled by wrapper during initialization)
      
      // Test Swiss Ephemeris functionality with a known date
      const testDate = 2451545.0; // J2000.0
      const testResult = await this.swisseph.swe_houses(testDate, 28.7041, 77.1025, 'P');
      
      // Swiss Ephemeris returns {cusps: array, ascmc: array} structure
      // ascmc[0] is the ascendant, ascmc[1] is the MC
      if (!testResult || !testResult.cusps || !testResult.ascmc || 
          typeof testResult.ascmc[0] !== 'number' || isNaN(testResult.ascmc[0])) {
        throw new Error('Swiss Ephemeris test calculation failed - ephemeris not functional');
      }
      
      this.initialized = true;
      console.log('✅ AscendantCalculator: Initialized successfully with native Swiss Ephemeris bindings');
      return true;
      
    } catch (error) {
      this.initialized = false;
      throw new Error(`AscendantCalculator initialization failed: ${error.message}`);
    }
  }

  /**
   * Validate ephemeris files exist (optional but helpful)
   * In Node.js, we use bundled ephemeris data, so local files are just for reference
   */
  validateEphemerisFiles(ephePath) {
    try {
      if (!fs.existsSync(ephePath)) {
        console.log(`📂 Ephemeris directory not found: ${ephePath} (using bundled data)`);
        return;
      }
      
      // Check for essential ephemeris files
      const essentialFiles = ['sepl_18.se1', 'semo_18.se1', 'seas_18.se1'];
      const foundFiles = [];
      const missingFiles = [];
      
      for (const file of essentialFiles) {
        const filePath = path.join(ephePath, file);
        if (fs.existsSync(filePath)) {
          foundFiles.push(file);
        } else {
          missingFiles.push(file);
        }
      }
      
      if (foundFiles.length > 0) {
        console.log(`📁 Found local ephemeris files: ${foundFiles.join(', ')}`);
        console.log('🔄 Using bundled ephemeris data for Node.js compatibility');
      }
      
      if (missingFiles.length > 0) {
        console.log(`⚠️  Missing local ephemeris files: ${missingFiles.join(', ')} (will use bundled data)`);
      }
    } catch (error) {
      console.log(`📂 Ephemeris validation error: ${error.message} (using bundled data)`);
    }
  }

  /**
   * Calculate ascendant and house cusps
   */
  async calculateAscendantAndHouses(year, month, day, hours, minutes, latitude, longitude, houseSystem = 'P') {
    // Ensure calculator is initialized
    await this.initialize();
    
    if (!this.initialized || !this.swissephAvailable) {
      throw new Error('Swiss Ephemeris is required for ascendant calculations but is not available');
    }
    
    // Calculate Julian Day
    const julianDay = calculateJulianDay(year, month, day, hours + minutes / 60.0);
    
    // Calculate houses using Swiss Ephemeris
    const housesResult = await this.swisseph.swe_houses(julianDay, latitude, longitude, houseSystem);
    
    if (!housesResult || !housesResult.cusps || !housesResult.ascmc || 
        typeof housesResult.ascmc[0] !== 'number') {
      throw new Error('Swiss Ephemeris house calculation failed - invalid house data');
    }
    
    // Calculate ayanamsa
    const ayanamsaResult = await this.swisseph.swe_get_ayanamsa(julianDay);
    const ayanamsa = ayanamsaResult.ayanamsa || 0;
    
    // Apply ayanamsa to ascendant (convert tropical to sidereal)
    const tropicalAscendant = housesResult.ascmc[0]; // ascendant is index 0
    const siderealAscendant = tropicalAscendant - ayanamsa;
    
    // Normalize degrees
    const normalizedAscendant = this.normalizeDegrees(siderealAscendant);
    
    // Get sign information
    const signInfo = getSign(normalizedAscendant);
    const ascendantSign = {
      index: signInfo.signIndex,
      name: getSignName(signInfo.signIndex),
      id: getSignId(signInfo.signIndex)
    };
    
    // Apply ayanamsa to all house cusps
    const siderealHouses = housesResult.cusps.map(cusp => this.normalizeDegrees(cusp - ayanamsa));
    
    // Get house signs
    const houseSigns = siderealHouses.map(cusp => {
      const signInfo = getSign(cusp);
      return {
        index: signInfo.signIndex,
        name: getSignName(signInfo.signIndex),
        id: getSignId(signInfo.signIndex)
      };
    });
    
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
        tropicalCusps: housesResult.cusps,
        ascendant: housesResult.ascmc[0], // tropical ascendant
        midheaven: this.normalizeDegrees(housesResult.ascmc[1] - ayanamsa), // MC is index 1
        midheavenTropical: housesResult.ascmc[1] // MC is index 1
      },
      metadata: {
        julianDay: julianDay,
        ayanamsaType: this.ayanamsaType,
        method: 'sweph-native',
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
// Export removed - use getSwisseph() from swisseph-wrapper.js instead
export async function isSwissephAvailable() {
  if (swisseph === null) {
    await ensureSwissephLoaded();
  }
  return swissephAvailable;
}
