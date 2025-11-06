import { getSign, getSignName, getSignId } from '../../../utils/helpers/astrologyHelpers.js';
import { calculateJulianDay, julianDayToDate } from '../../../utils/calculations/julianDay.js';
import { setupSwissephWithEphemeris } from '../../../utils/swisseph-wrapper.js';
import path from 'path';
import fs from 'fs';

// Cross-environment directory resolution
const __dirname = path.resolve(process.cwd(), 'src/core/calculators/chart-casting');

/**
 * Swiss Ephemeris House Calculator with proper initialization
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
      console.log('🏛️ Initializing AscendantCalculator with improved WASM setup...');
      
      // Use the improved helper function for comprehensive initialization
      const ephePath = path.resolve(process.cwd(), 'ephemeris');
      const { swisseph } = await setupSwissephWithEphemeris(fs.existsSync(ephePath) ? ephePath : null);
      
      this.swisseph = swisseph;
      this.swissephAvailable = true;
      
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
      this.swissephAvailable = false;
      throw new Error(`AscendantCalculator initialization failed: ${error.message}`);
    }
  }

  /**
   * Calculate ascendant and house cusps
   */
  async calculateAscendantAndHouses(year, month, day, hours, minutes, latitude, longitude, houseSystem = 'P') {
    // Ensure calculator is initialized
    await this.initialize();
    
    if (!this.initialized || !this.swissephAvailable || !this.swisseph) {
      throw new Error('Swiss Ephemeris is not available for house calculation. Please ensure Swiss Ephemeris is properly installed and initialized.');
    }
    
    try {
      // Calculate Julian Day for the given time
      const decimalHours = hours + (minutes / 60.0);
      const jd = calculateJulianDay(year, month, day, decimalHours);
      
      // Calculate houses using Swiss Ephemeris
      const houses = await this.swisseph.swe_houses(jd, latitude, longitude, houseSystem);
      
      // Handle both array and object return formats from sweph-wasm
      let houseArray, ascendantDegree, midheavenDegree;
      
      if (Array.isArray(houses) && houses.length >= 13) {
        // Array format: [house1, house2, ..., house12, ascendant, mc, ...]
        houseArray = houses.slice(0, 12); // Take first 12 elements for houses
        ascendantDegree = houses[12]; // Position 13 is ascendant
        midheavenDegree = houses[13]; // Position 14 is midheaven
        
      } else if (houses && houses.house && Array.isArray(houses.house) && houses.house.length >= 13) {
        // Object format with house array
        houseArray = houses.house;
        ascendantDegree = houses.house[12];
        midheavenDegree = houses.house[13];
        
      } else {
        throw new Error(`Swiss Ephemeris returned invalid house data: insufficient house count (got ${houses?.house?.length || 0}, need 12+2)`);
      }
      
      // Calculate ayanamsa for sidereal correction
      const ayanamsaResult = await this.swisseph.swe_get_ayanamsa(jd);
      const ayanamsa = ayanamsaResult.ayanamsa || 0;
      
      // Apply ayanamsa to ascendant (convert tropical to sidereal)
      const tropicalAscendant = ascendantDegree;
      const siderealAscendant = tropicalAscendant - ayanamsa;
      
      // Normalize degrees to 0-360 range
      const normalizedAscendant = ((siderealAscendant % 360) + 360) % 360;
      
      // Normalize midheaven for sidereal
      const tropicalMidheaven = midheavenDegree;
      const siderealMidheaven = tropicalMidheaven - ayanamsa;
      const normalizedMidheaven = ((siderealMidheaven % 360) + 360) % 360;
      
      // Get sign information for ascendant
      const ascendantSignInfo = this.getSign(normalizedAscendant);
      
      // Calculate house positions with sidereal correction
      const housePositions = [];
      for (let i = 0; i < 12; i++) {
        const houseDegree = houseArray[i];
        
        // Apply ayanamsa to house cusps (convert tropical to sidereal)
        const tropicalHouseDegree = houseDegree;
        const siderealHouseDegree = tropicalHouseDegree - ayanamsa;
        const normalizedHouseDegree = ((siderealHouseDegree % 360) + 360) % 360;
        
        const signInfo = this.getSign(normalizedHouseDegree);
        
        housePositions.push({
          houseNumber: i + 1,
          degree: normalizedHouseDegree,
          sign: signInfo.name,
          signId: signInfo.id,
          longitude: normalizedHouseDegree,
          tropicalDegree: tropicalHouseDegree,
          siderealDegree: siderealHouseDegree,
          cuspLatitude: this.calculateHouseCuspLatitude(normalizedHouseDegree, latitude),
          cuspLongitude: longitude
        });
      }
      
      return {
        ascendant: {
          longitude: normalizedAscendant,
          sign: ascendantSignInfo.name,
          signId: ascendantSignInfo.id,
          tropicalLongitude: tropicalAscendant,
          siderealLongitude: normalizedAscendant,
          ayanamsa: ayanamsa,
          latitude: latitude,
          geographicLongitude: longitude
        },
        midheaven: {
          longitude: normalizedMidheaven,
          tropicalLongitude: tropicalMidheaven,
          siderealLongitude: normalizedMidheaven
        },
        houses: housePositions,
        metadata: {
          julianDay: jd,
          ayanamsaType: this.ayanamsaType,
          method: 'swisseph-wasm',
          coordinates: {
            latitude: latitude,
            longitude: longitude
          }
        }
      };
    } catch (error) {
      throw new Error(`Ascendant calculation failed: ${error.message}`);
    }
  }

  /**
   * Get sign information for a given degree
   */
  getSign(degree) {
    const normalizedDegree = ((degree % 360) + 360) % 360;
    const signIndex = Math.floor(normalizedDegree / 30);
    
    const signs = [
      { id: 1, name: 'Aries', symbol: '♈' },
      { id: 2, name: 'Taurus', symbol: '♉' },
      { id: 3, name: 'Gemini', symbol: '♪' },
      { id: 4, name: 'Cancer', symbol: '☽' },
      { id: 5, name: 'Leo', symbol: '♌' },
      { id: 6, name: 'Virgo', symbol: '♍' },
      { id: 7, name: 'Libra', symbol: '♎' },
      { id: 8, name: 'Scorpio', symbol: '♏' },
      { house: 9, name: 'Sagittarius', symbol: '♐' },
      { id: 10, name: 'Capricorn', symbol: '♑' },
      { id: 11, name: 'Aquarius', symbol: '♒' },
      { id: 12, name: 'Pisces', symbol: '♓' }
    ];
    
    return signs[signIndex] || signs[0];
  }

  /**
   * Calculate house cusp latitude (simplified calculation)
   * @param {number} houseDegree - House cusp degree
   * @param {number} geocentricLatitude - Latitude in degrees (North positive)
   * @returns {number} Calculated cusp latitude
   */
  calculateHouseCuspLatitude(houseDegree, geocentricLatitude) {
    // Simplified house cusp latitude calculation
    // This is a basic approximation - more sophisticated calculations would use projection methods
    const latitudeRad = geocentricLatitude * Math.PI / 180;
    
    // House cusp latitude varies based on house position and geographic location
    // This is a simplified trigonometric approximation
    const houseOffset = (houseDegree - 180) * Math.PI / 180;
    
    // Basic cusp latitude estimation
    const cuspLatitude = geocentricLatitude * 0.9 * Math.cos(houseOffset);
    
    return cuspLatitude;
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

// Export the class for direct instantiation
export default AscendantCalculator;
