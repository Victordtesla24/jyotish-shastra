/**
 * Chart Generation Service
 * Handles Vedic birth chart generation using Swiss Ephemeris
 * Enhanced with geocoding integration and comprehensive analysis
 */

// Swiss Ephemeris (WebAssembly) - use improved wrapper with multi-strategy initialization
import { setupSwissephWithEphemeris, getSwisseph } from '../../utils/swisseph-wrapper.js';

// Swiss Ephemeris constants (these may not be available as properties in sweph-wasm)
const SE_EPHEM_FLAG = 0;  // Default to Swiss Ephemeris
const SEFLG_SIDEREAL = 1 << 1;  // Use sidereal calculations
const SEFLG_SPEED = 1 << 2;     // Return speed values
const SEFLG_SWIEPH = 1 << 5;     // Use Swiss Ephemeris
const SE_GREG_CAL = 1;           // Gregorian calendar
const SE_SIDM_LAHIRI = 1;        // Lahiri ayanamsa

// Planet constants for sweph-wasm
const SE_SUN = 0;
const SE_MOON = 1;
const SE_MARS = 2;
const SE_MERCURY = 3;
const SE_JUPITER = 4;
const SE_VENUS = 5;
const SE_SATURN = 6;
const SE_MEAN_NODE = 10;         // Mean Node (Rahu)

// Lazy initialization - only start when actually needed
// Do NOT initialize at module load to avoid serverless function timeouts

import { v4 as uuidv4 } from 'uuid';
import moment from 'moment-timezone';
import GeocodingService from '../geocoding/GeocodingService.js';
import astroConfig from '../../config/astro-config.js';
import {
  getSign,
  getSignName,
  calculateNavamsa,
  getNakshatra,
  calculatePlanetaryDignity,
  calculateHouseNumber,
} from '../../utils/helpers/astrologyHelpers.js';
import { SWISS_EPHEMERIS, PLANETARY_DATA, ZODIAC_SIGNS } from '../../utils/constants/astronomicalConstants.js';
import BirthDataAnalysisService from '../analysis/BirthDataAnalysisService.js';
import DetailedDashaAnalysisService from '../analysis/DetailedDashaAnalysisService.js';
import AscendantCalculator from '../../core/calculations/chart-casting/AscendantCalculator.js';

class ChartGenerationService {
  constructor(geocodingService) {
    this.geocodingService = geocodingService || new GeocodingService();
    // Initialize swisseph references - will be updated when initialization completes
    this.swisseph = null;
    this.swissephAvailable = false;
  }

  /**
   * Ensure swisseph is initialized before use
   */
  async ensureSwissephInitialized() {
    try {
      console.log('🔧 Ensuring Swiss Ephemeris initialization...');
      
      // Use the improved wrapper to get Swiss Ephemeris
      this.swisseph = await getSwisseph();
      
      // CRITICAL: Validate all required methods are available
      const requiredMethods = ['swe_julday', 'swe_revjul', 'swe_calc_ut', 'swe_houses'];
      const missingMethods = requiredMethods.filter(method => 
        typeof this.swisseph[method] !== 'function'
      );
      
      if (missingMethods.length > 0) {
        throw new Error(`Swiss Ephemeris missing required methods: ${missingMethods.join(', ')}`);
      }
      
      // PRODUCTION: Log available Swiss Ephemeris methods
      if (process.env.NODE_ENV === 'production') {
        console.log('📊 Swiss Ephemeris methods validated:', {
          swe_julday: typeof this.swisseph.swe_julday,
          swe_revjul: typeof this.swisseph.swe_revjul,
          swe_calc_ut: typeof this.swisseph.swe_calc_ut,
          swe_houses: typeof this.swisseph.swe_houses
        });
      }
      
      this.swissephAvailable = true;
      console.log('✅ Swiss Ephemeris initialized with all required methods');
    } catch (error) {
      this.swissephAvailable = false;
      console.error('❌ Swiss Ephemeris initialization failed:', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Initialize Swiss Ephemeris with required settings
   */
  async initializeSwissEphemeris() {
    try {
      console.log('🔧 Initializing Swiss Ephemeris with ephemeris setup...');
      
      // Use the improved helper function for comprehensive initialization
      const { swisseph } = await setupSwissephWithEphemeris(astroConfig.CALCULATION_SETTINGS.EPHEMERIS_PATH);
      
      this.swisseph = swisseph;
      this.swissephAvailable = true;
      
      // Set calculation flags for Vedic astrology
      this.calcFlags = SEFLG_SIDEREAL | SEFLG_SPEED;
      
      console.log('✅ Swiss Ephemeris initialized successfully');
      
    } catch (error) {
      this.swissephAvailable = false;
      throw new Error(`Failed to initialize Swiss Ephemeris: ${error.message}. Please ensure Swiss Ephemeris is properly installed and configured.`);
    }
  }

  /**
   * Generate comprehensive birth chart with geocoding
   * @param {Object} birthData - Birth details
   * @returns {Object} Complete chart data
   */
  async generateComprehensiveChart(birthData) {
    // Ensure swisseph is initialized
    await this.ensureSwissephInitialized();
    
    console.log('🚀 CHART GENERATION SERVICE - Starting comprehensive chart generation...');
    console.log('📊 Input Birth Data:', JSON.stringify(birthData, null, 2));

    try {
      // Initialize Swiss Ephemeris before any calculations
      console.log('🔍 Step 1: Initializing Swiss Ephemeris...');
      await this.initializeSwissEphemeris();
      console.log('✅ Swiss Ephemeris initialized successfully');

      // Validate birth data
      console.log('🔍 Step 2: Validating birth data...');
      const isValid = this.validateBirthData(birthData);
      if (!isValid) {
        throw new Error('Birth data validation failed');
      }
      console.log('✅ Birth data validation passed');

      // Geocode location if coordinates not provided
      console.log('🔍 Step 3: Processing location data...');
      const geocodedData = await this.processLocationData(birthData);
      console.log('✅ Location data processed:', {
        latitude: geocodedData.latitude,
        longitude: geocodedData.longitude,
        geocodingInfo: geocodedData.geocodingInfo
      });

      // Generate Rasi chart
      console.log('🔍 Step 3: Generating Rasi chart...');
      const rasiChart = await this.generateRasiChart(geocodedData);
      console.log('✅ Rasi chart generated:', {
        ascendant: rasiChart.ascendant,
        planetsCount: Object.keys(rasiChart.planetaryPositions || {}).length,
        housesCount: rasiChart.housePositions?.length || 0
      });

      // Generate Navamsa chart
      console.log('🔍 Step 4: Generating Navamsa chart...');
      const navamsaChart = await this.generateNavamsaChart(geocodedData);
      console.log('✅ Navamsa chart generated:', {
        ascendant: navamsaChart.ascendant,
        planetsCount: Object.keys(navamsaChart.planetaryPositions || {}).length
      });

      // Calculate Dasha information
      console.log('🔍 Step 5: Calculating Dasha information...');
      const dashaInfo = this.calculateDashaInfo(rasiChart);
      console.log('✅ Dasha info calculated:', {
        birthDasha: dashaInfo.birthDasha,
        currentDasha: dashaInfo.currentDasha
      });

      // Generate comprehensive analysis
      console.log('🔍 Step 6: Generating comprehensive analysis...');
      const analysis = await this.generateComprehensiveAnalysis(rasiChart, navamsaChart);
      console.log('✅ Analysis generated:', Object.keys(analysis));

      const result = {
        birthData: geocodedData,
        rasiChart,
        navamsaChart,
        dashaInfo,
        analysis,
        generatedAt: new Date().toISOString()
      };

      console.log('🎉 CHART GENERATION SERVICE - Comprehensive chart generation completed successfully!');
      console.log('📈 Result structure:', {
        hasBirthData: !!result.birthData,
        hasRasiChart: !!result.rasiChart,
        hasNavamsaChart: !!result.navamsaChart,
        hasDashaInfo: !!result.dashaInfo,
        hasAnalysis: !!result.analysis,
        generatedAt: result.generatedAt
      });

      return result;
    } catch (error) {
      console.error('❌ CHART GENERATION SERVICE - Error during chart generation:', error);
      console.error('❌ Error stack:', error.stack);
      throw new Error(`Failed to generate comprehensive chart: ${error.message}`);
    }
  }

  /**
   * Process location data with geocoding if needed
   * @param {Object} birthData - Birth data
   * @returns {Object} Processed birth data with coordinates
   */
  async processLocationData(birthData) {
    const { placeOfBirth, city, state, country } = birthData;

    // Extract coordinates from nested placeOfBirth or direct properties
    const latitude = birthData.latitude || birthData.placeOfBirth?.latitude;
    const longitude = birthData.longitude || birthData.placeOfBirth?.longitude;

    // If coordinates are provided, validate them
    if (latitude && longitude) {
      if (!this.geocodingService.validateCoordinates(latitude, longitude)) {
        throw new Error('Invalid coordinates provided');
      }

      // Format address from nested placeOfBirth or components
      let formattedAddress;
      if (placeOfBirth && typeof placeOfBirth === 'object' && placeOfBirth.name) {
        formattedAddress = placeOfBirth.name;
      } else if (placeOfBirth && typeof placeOfBirth === 'string') {
        formattedAddress = placeOfBirth;
      } else {
        formattedAddress = `${city}, ${state}, ${country}`.replace(/,\s*,/g, ',').replace(/^,\s*/, '').replace(/,\s*$/, '');
      }

      return {
        ...birthData,
        latitude,
        longitude,
        // Flatten timezone if provided only within nested placeOfBirth
        timezone: birthData.timezone || birthData.timeZone || birthData.placeOfBirth?.timezone || birthData.timezone,
        geocodingInfo: {
          service: 'user_provided',
          accuracy: 'high',
          formattedAddress
        }
      };
    }

    // If place information is provided but no coordinates, geocode
    const hasPlaceInfo = placeOfBirth || (city && country) || city;

    if (hasPlaceInfo && !latitude && !longitude) {
      try {
        const locationData = {
          city: city || '',
          state: state || '',
          country: country || 'India',
          placeOfBirth: placeOfBirth || ''
        };

        const geocoded = await this.geocodingService.geocodeLocation(locationData);

        return {
          ...birthData,
          latitude: geocoded.latitude,
          longitude: geocoded.longitude,
          // Use timezone returned by geocoding when available
          timezone: birthData.timezone || birthData.timeZone || geocoded.timezone || birthData.placeOfBirth?.timezone,
          geocodingInfo: {
            service: geocoded.service_used,
            accuracy: geocoded.accuracy,
            formattedAddress: geocoded.formatted_address
          }
        };
      } catch (error) {
        throw new Error(`Geocoding failed: ${error.message}`);
      }
    }

    throw new Error('Either coordinates or place of birth must be provided');
  }

  /**
   * Generate Rasi (D1) chart
   * @param {Object} birthData - Birth details
   * @returns {Object} Rasi chart data
   */
  async generateRasiChart(birthData) {
    try {
      // Ensure Swiss Ephemeris is initialized before any calculations
      await this.ensureSwissephInitialized();
      await this.initializeSwissEphemeris();
      
      const { dateOfBirth, timeOfBirth } = birthData;
      // Accept common aliases and nested timezone
      const timeZone = birthData.timezone || birthData.timeZone || birthData.placeOfBirth?.timezone;
      const latitude = birthData.latitude;
      const longitude = birthData.longitude;
      
      if (!timeZone) {
        throw new Error('Timezone is required for chart generation. Please provide timezone in birth data.');
      }

      if (!latitude || !longitude) {
        throw new Error('Latitude and longitude are required for Rasi chart generation.');
      }

      // Convert birth data to Julian Day Number
      const jd = await this.calculateJulianDay(dateOfBirth, timeOfBirth, timeZone);

      // Calculate Ascendant
      const ascendant = await this.calculateAscendant(jd, { latitude, longitude });

      // Get planetary positions
      const planetaryPositions = await this.getPlanetaryPositions(jd);

      // Calculate house positions
      const housePositions = await this.calculateHousePositions(ascendant, jd, latitude, longitude);

      // Calculate Nakshatra
      const nakshatra = this.calculateNakshatra(planetaryPositions.moon);

      // Calculate aspects
      const aspects = this.calculatePlanetaryAspects(planetaryPositions, housePositions);

      // Convert planetaryPositions object to planets array
      const planetsArray = Object.entries(planetaryPositions).map(([name, data]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize first letter
        ...data
      }));

      return {
        ascendant,
        planets: planetsArray,
        planetaryPositions,
        housePositions,
        nakshatra,
        aspects,
        jd,
        birthData
      };
    } catch (error) {
      throw new Error(`Failed to generate Rasi chart: ${error.message}`);
    }
  }

  /**
   * Generate Navamsa (D9) chart
   * @param {Object} birthData - Birth details
   * @returns {Object} Navamsa chart data
   */
  async generateNavamsaChart(birthData) {
    try {
      // Ensure Swiss Ephemeris is initialized before any calculations
      await this.ensureSwissephInitialized();
      await this.initializeSwissEphemeris();
      
      const rasiChart = await this.generateRasiChart(birthData);
      const navamsaPositions = {};
      const planets = []; // Add planets array for compatibility

      // Calculate Navamsa positions for each planet
      for (const [planet, position] of Object.entries(rasiChart.planetaryPositions || {})) {
        // Add comprehensive null safety checks
        if (!position || typeof position !== 'object') {
          console.warn(`Position is null or invalid for planet: ${planet}`);
          continue;
        }

        // Ensure position has required properties
        if (position.longitude === undefined || position.longitude === null) {
          console.warn(`Invalid longitude for planet: ${planet}`);
          continue;
        }

        const navamsaPosition = this.calculateNavamsaPosition(position);

        // Add null safety for navamsa position
        if (!navamsaPosition || typeof navamsaPosition !== 'object') {
          console.warn(`Failed to calculate Navamsa position for planet: ${planet}`);
          continue;
        }

        navamsaPositions[planet] = navamsaPosition;

        // Add to planets array for compatibility with analyzers
        // Calculate house number with enhanced null safety
        let houseNumber = 1; // Default house
        if (navamsaPosition.longitude !== undefined &&
            navamsaPosition.longitude !== null &&
            rasiChart.ascendant &&
            rasiChart.ascendant.longitude !== undefined &&
            rasiChart.ascendant.longitude !== null) {
          try {
            houseNumber = calculateHouseNumber(navamsaPosition.longitude, rasiChart.ascendant.longitude);
            // Validate house number
            if (!houseNumber || houseNumber < 1 || houseNumber > 12) {
              houseNumber = 1;
            }
          } catch (error) {
            console.warn(`Error calculating house number for planet ${planet}:`, error.message);
            houseNumber = 1;
          }
        }

        // Create planet object with comprehensive null safety
        const planetObj = {
          name: planet || 'Unknown',
          planet: planet || 'Unknown',
          longitude: navamsaPosition.longitude || 0,
          degree: navamsaPosition.degree || 0,
          sign: navamsaPosition.sign || 'Unknown',
          signId: navamsaPosition.signId || 1,
          house: houseNumber,
          dignity: (position && position.dignity) ? position.dignity : 'neutral'
        };

        // Only add if we have a valid planet object
        if (planetObj.name && planetObj.name !== 'Unknown') {
          planets.push(planetObj);
        }
      }

      // Calculate Navamsa Ascendant
      const navamsaAscendant = this.calculateNavamsaPosition(rasiChart.ascendant);

      // CRITICAL FIX: Pass all required parameters to calculateHousePositions
      // Extract jd, latitude, longitude from rasiChart which has all the data
      const navamsaHouses = await this.calculateHousePositions(
        navamsaAscendant,
        rasiChart.jd,
        rasiChart.birthData.latitude,
        rasiChart.birthData.longitude
      );

      return {
        ascendant: navamsaAscendant,
        planetaryPositions: navamsaPositions,
        planets: planets, // Add planets array for compatibility
        housePositions: navamsaHouses,
        rasiChart
      };
    } catch (error) {
      throw new Error(`Failed to generate Navamsa chart: ${error.message}`);
    }
  }

  /**
   * Calculate Ascendant (Lagna)
   * @param {number} jd - Julian Day Number
   * @param {Object} placeOfBirth - Geocoded location data
   * @returns {Object} Ascendant details
   */
  async calculateAscendant(jd, placeOfBirth) {
    try {
      // PRODUCTION: Log input parameters for debugging
      if (process.env.NODE_ENV === 'production') {
        console.log('🔧 Calculating Ascendant with inputs:', {
          jd,
          latitude: placeOfBirth.latitude,
          longitude: placeOfBirth.longitude
        });
      }

      const ascendantCalculator = new AscendantCalculator();
      // Convert Julian Day to date components using Swiss Ephemeris
      const result = await this.swisseph.swe_revjul(jd, SE_GREG_CAL);
      
      // PRODUCTION: Log swe_revjul result structure
      if (process.env.NODE_ENV === 'production') {
        console.log('📊 Swiss Ephemeris swe_revjul result:', {
          isArray: Array.isArray(result),
          length: Array.isArray(result) ? result.length : 'N/A',
          isObject: typeof result === 'object',
          keys: result && typeof result === 'object' ? Object.keys(result) : []
        });
      }
      
      // Handle both array and object return formats from sweph-wasm
      let year, month, day, hour, minutes;
      if (Array.isArray(result) && result.length >= 6) {
        // Array format: [year, month, day, hour, minute, second]
        [year, month, day, hour, minutes] = result;
      } else if (result && typeof result === 'object') {
        // Object format
        year = result.year;
        month = result.month;
        day = result.day;
        hour = result.hour;
        minutes = result.minute;
      } else {
        throw new Error('Invalid Julian Day conversion result from Swiss Ephemeris');
      }
      
      // PRODUCTION: Log extracted date components
      if (process.env.NODE_ENV === 'production') {
        console.log('📅 Extracted date components:', { year, month, day, hour, minutes });
      }

      const ascendantData = await ascendantCalculator.calculateAscendantAndHouses(year, month, day, hour, minutes, placeOfBirth.latitude, placeOfBirth.longitude);
      
      // PRODUCTION: Log AscendantCalculator response structure
      if (process.env.NODE_ENV === 'production') {
        console.log('📊 AscendantCalculator response structure:', {
          hasAscendant: !!ascendantData.ascendant,
          ascendantKeys: ascendantData.ascendant ? Object.keys(ascendantData.ascendant) : [],
          hasLongitude: ascendantData.ascendant ? typeof ascendantData.ascendant.longitude === 'number' : false,
          longitudeValue: ascendantData.ascendant?.longitude
        });
      }
      
      // CRITICAL FIX: Extract just the ascendant object from the full result
      // AscendantCalculator returns {ascendant: {...}, houses: {...}, metadata: {...}}
      // But downstream code expects just the ascendant object with longitude, sign, etc.
      const ascendant = ascendantData.ascendant;
      
      // CRITICAL VALIDATION: Ensure ascendant has required longitude property
      if (!ascendant || typeof ascendant.longitude !== 'number') {
        console.error('❌ Invalid ascendant data:', {
          hasAscendant: !!ascendant,
          ascendantStructure: ascendant ? JSON.stringify(ascendant) : 'null',
          fullResponse: JSON.stringify(ascendantData)
        });
        throw new Error(`Invalid ascendant data structure - missing longitude: ${JSON.stringify(ascendant)}`);
      }

      // PRODUCTION: Log successful ascendant calculation
      if (process.env.NODE_ENV === 'production') {
        console.log('✅ Ascendant calculated successfully:', {
          longitude: ascendant.longitude,
          sign: ascendant.signName || ascendant.sign
        });
      }

      return {
        ...ascendant,
        sign: ascendant.signName || ascendant.sign, // Map signName to sign for compatibility
      };
    } catch (error) {
      console.error('❌ Ascendant calculation failed:', {
        errorMessage: error.message,
        errorStack: error.stack
      });
      throw new Error(`Failed to calculate Ascendant: ${error.message}`);
    }
  }

  /**
   * Get planetary positions
   * @param {number} jd - Julian Day Number
   * @returns {Object} Planetary positions
   */
  async getPlanetaryPositions(jd) {
    try {
      const planets = {};
      
      // Swiss Ephemeris is required for planetary position calculations
      if (!this.swissephAvailable || !this.swisseph) {
        throw new Error('Swiss Ephemeris is required for planetary position calculations but is not available. Please ensure Swiss Ephemeris is properly installed and configured.');
      }
      
      const planetIds = {
        sun: SE_SUN,
        moon: SE_MOON,
        mars: SE_MARS,
        mercury: SE_MERCURY,
        jupiter: SE_JUPITER,
        venus: SE_VENUS,
        saturn: SE_SATURN,
        rahu: SE_MEAN_NODE // Mean Node (Rahu)
      };

      for (const [planetName, planetId] of Object.entries(planetIds)) {
        const result = await this.swisseph.swe_calc_ut(jd, planetId, this.calcFlags);

        // Handle both array and object result formats from sweph-wasm
        if (Array.isArray(result) && result.length >= 4) {
          // Array format: [longitude, latitude, distance, speed, ...]
          const longitude = result[0];
          const latitude = result[1];
          const distance = result[2];
          const speed = result[3];
          
          // Normalize longitude to 0-360 range
          const normalizedLongitude = ((longitude % 360) + 360) % 360;
          const sign = this.degreeToSign(normalizedLongitude);

          planets[planetName] = {
            longitude: normalizedLongitude,
            degree: normalizedLongitude % 30,
            sign: sign.name,
            signId: sign.id,
            latitude: latitude,
            distance: distance || 1,
            speed: speed || 0,
            isRetrograde: (speed || 0) < 0,
            isCombust: false, // Will calculate later
            dignity: this.calculatePlanetaryDignity(planetName, sign.id)
          };
        } else if (result && result.rcode === 0) {
          // Object format with data property
          const longitude = result.data?.[0] || 0;
          const latitude = result.data?.[1] || 0;
          const distance = result.data?.[2] || 1;
          const speed = result.data?.[3] || 0;
          
          // Normalize longitude to 0-360 range
          const normalizedLongitude = ((longitude % 360) + 360) % 360;
          const sign = this.degreeToSign(normalizedLongitude);

          planets[planetName] = {
            longitude: normalizedLongitude,
            degree: normalizedLongitude % 30,
            sign: sign.name,
            signId: sign.id,
            latitude: latitude,
            distance: distance || 1,
            speed: speed || 0,
            isRetrograde: (speed || 0) < 0,
            isCombust: false, // Will calculate later
            dignity: this.calculatePlanetaryDignity(planetName, sign.id)
          };
        } else {
          throw new Error(`Error calculating ${planetName}: Failed to calculate planetary position (rcode=${result?.rcode || 'unknown'})`);
        }

        // Calculate combustion for each planet
        if (planetName !== 'sun' && planets.sun && planets[planetName]) {
          planets[planetName].isCombust = this.isPlanetCombust(planetName, planets.sun, planets[planetName].longitude);
        }
      }

      // Calculate Ketu position (opposite to Rahu)
      if (planets.rahu) {
        const rahuLongitude = planets.rahu.longitude;
        const ketuLongitude = (rahuLongitude + 180) % 360;
        const ketuSign = this.degreeToSign(ketuLongitude);

        // Normalize to 0-360 range
        const normalizedKetuLongitude = ((ketuLongitude % 360) + 360) % 360;

        planets.ketu = {
          longitude: normalizedKetuLongitude,
          degree: normalizedKetuLongitude % 30,
          sign: ketuSign.name,
          signId: ketuSign.id,
          latitude: planets.rahu.latitude || 0,
          distance: planets.rahu.distance || 1,
          speed: -(planets.rahu.speed || 0), // Ketu moves opposite to Rahu
          isRetrograde: !(planets.rahu.isRetrograde || false), // Retrograde logic is opposite
          dignity: 'neutral' // Ketu doesn't have traditional dignity
        };
      }

      return planets;
    } catch (error) {
      throw new Error(`Failed to get planetary positions: ${error.message}`);
    }
  }

  /**
   * Calculate house positions based on Ascendant
   * ENHANCED: Robust handling of multiple Swiss Ephemeris WASM return formats
   * @param {Object} ascendant - Ascendant data
   * @param {number} jd - Julian Day Number
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @returns {Array} House positions
   */
  async calculateHousePositions(ascendant, jd, latitude, longitude) {
    if (!jd || !latitude || !longitude) {
      throw new Error('Julian day, latitude, and longitude are required for house position calculation');
    }

    if (!ascendant || typeof ascendant.longitude !== 'number') {
      throw new Error('Ascendant data with longitude is required for house position calculation');
    }

    try {
      // Swiss Ephemeris is required for house position calculations
      if (!this.swissephAvailable || !this.swisseph || typeof this.swisseph.swe_houses !== 'function') {
        throw new Error('Swiss Ephemeris is required for house position calculations but is not available. Please ensure Swiss Ephemeris is properly installed and configured.');
      }
      
      const adjustedLatitude = Math.max(-90, Math.min(90, latitude));
      const houses = await this.swisseph.swe_houses(jd, adjustedLatitude, longitude, 'P');

      // COMPREHENSIVE FIX: Handle ALL possible Swiss Ephemeris WASM return formats
      // Log the actual structure for debugging in production
      console.log('🔍 Swiss Ephemeris house data structure:', {
        isArray: Array.isArray(houses),
        isObject: typeof houses === 'object',
        hasHouseProperty: houses && 'house' in houses,
        hasCuspsProperty: houses && 'cusps' in houses,
        hasDataProperty: houses && 'data' in houses,
        length: Array.isArray(houses) ? houses.length : 'N/A',
        keys: houses && typeof houses === 'object' ? Object.keys(houses) : 'N/A'
      });

      let houseArray;
      
      // Format 1: Direct array [house1, house2, ..., house12, asc, mc, ...]
      if (Array.isArray(houses) && houses.length >= 12) {
        console.log('✅ Using Format 1: Direct array');
        houseArray = houses.slice(0, 12);
      } 
      // Format 2: Object with 'house' property {house: [house1, house2, ...], ascendant: ..., mc: ...}
      else if (houses && houses.house && Array.isArray(houses.house) && houses.house.length >= 12) {
        console.log('✅ Using Format 2: Object with house array');
        houseArray = houses.house;
      }
      // Format 3: Object with 'cusps' property (alternative WASM format)
      else if (houses && houses.cusps && Array.isArray(houses.cusps) && houses.cusps.length >= 12) {
        console.log('✅ Using Format 3: Object with cusps array');
        houseArray = houses.cusps;
      }
      // Format 4: Object with 'data' property containing houses
      else if (houses && houses.data && Array.isArray(houses.data) && houses.data.length >= 12) {
        console.log('✅ Using Format 4: Object with data array');
        houseArray = houses.data;
      }
      // Format 5: Object with numbered properties (0-11 or 1-12)
      else if (houses && typeof houses === 'object' && !Array.isArray(houses)) {
        console.log('🔍 Checking Format 5: Object with numbered properties');
        // Try 0-indexed
        const zeroIndexed = [];
        for (let i = 0; i < 12; i++) {
          if (typeof houses[i] === 'number') {
            zeroIndexed.push(houses[i]);
          }
        }
        if (zeroIndexed.length === 12) {
          console.log('✅ Using Format 5a: Zero-indexed object properties');
          houseArray = zeroIndexed;
        } else {
          // Try 1-indexed
          const oneIndexed = [];
          for (let i = 1; i <= 12; i++) {
            if (typeof houses[i] === 'number') {
              oneIndexed.push(houses[i]);
            }
          }
          if (oneIndexed.length === 12) {
            console.log('✅ Using Format 5b: One-indexed object properties');
            houseArray = oneIndexed;
          }
        }
      }
      
      // If no format matched, provide detailed error with actual data
      if (!houseArray) {
        console.error('❌ Failed to parse house data. Actual structure:', JSON.stringify(houses, null, 2));
        throw new Error(`Swiss Ephemeris returned unrecognized house data format. Structure: ${JSON.stringify({
          type: typeof houses,
          isArray: Array.isArray(houses),
          keys: houses && typeof houses === 'object' ? Object.keys(houses).slice(0, 5) : [],
          sample: Array.isArray(houses) ? houses.slice(0, 3) : null
        })}`);
      }

      // Validate house data
      if (!houseArray || houseArray.length < 12) {
        throw new Error(`Swiss Ephemeris returned insufficient house data (got ${houseArray?.length || 0}, need 12 houses)`);
      }

      // Build house positions with enhanced validation
      const housePositions = [];
      for (let i = 0; i < 12; i++) {
        const houseDegree = houseArray[i];
        
        // Enhanced validation with better error messages
        if (houseDegree === undefined || houseDegree === null) {
          throw new Error(`House cusp ${i+1} is undefined or null. House array: ${JSON.stringify(houseArray)}`);
        }
        
        if (isNaN(houseDegree) || typeof houseDegree !== 'number') {
          throw new Error(`House cusp ${i+1} is not a valid number: ${houseDegree} (type: ${typeof houseDegree})`);
        }
        
        // Normalize degrees to 0-360 range
        const normalizedDegree = ((houseDegree % 360) + 360) % 360;
        const sign = this.degreeToSign(normalizedDegree);
        
        housePositions.push({
          houseNumber: i + 1,
          degree: normalizedDegree,
          sign: sign.name,
          signId: sign.id,
          longitude: normalizedDegree
        });
      }
      
      console.log('✅ Successfully calculated all 12 house positions');
      return housePositions;
      
    } catch (error) {
      console.error('❌ House calculation error:', error);
      throw new Error(`House position calculation failed: ${error.message}`);
    }
  }

  /**
   * Generate whole sign houses based on ascendant
   * @param {Object} ascendant - Ascendant data
   * @returns {Array} House positions using whole sign system
   */
  generateWholeSignHouses(ascendant) {
    const wholeSignHouses = [];
    const ascendantSignInfo = this.degreeToSign(ascendant.longitude);
    const ascendantSignIndex = ascendantSignInfo.id - 1; // Convert to 0-based index

    for (let i = 0; i < 12; i++) {
      const signIndex = (ascendantSignIndex + i) % 12;
      const signLongitude = signIndex * 30; // Each sign starts at multiple of 30 degrees
      const signInfo = this.degreeToSign(signLongitude);

      wholeSignHouses.push({
        houseNumber: i + 1,
        degree: signLongitude,
        sign: signInfo.name,
        signId: signInfo.id,
        longitude: signLongitude
      });
    }
    return wholeSignHouses;
  }

  /**
   * Calculate planetary aspects
   * @param {Object} planetaryPositions - Planetary positions
   * @param {Array} housePositions - House positions
   * @returns {Object} Aspect information
   */
  calculatePlanetaryAspects(planetaryPositions, housePositions) {
    const aspects = {
      conjunctions: [],
      oppositions: [],
      trines: [],
      squares: [],
      specialAspects: []
    };

    const planets = Object.keys(planetaryPositions);

    for (let i = 0; i < planets.length; i++) {
      for (let j = i + 1; j < planets.length; j++) {
        const planet1 = planets[i];
        const planet2 = planets[j];
        const pos1 = planetaryPositions[planet1].longitude;
        const pos2 = planetaryPositions[planet2].longitude;

        const distance = Math.abs(pos1 - pos2);

        // Check for aspects
        if (distance <= 10) { // Conjunction
          aspects.conjunctions.push({
            planet1,
            planet2,
            distance,
            orb: distance
          });
        } else if (Math.abs(distance - 180) <= 8) { // Opposition
          aspects.oppositions.push({
            planet1,
            planet2,
            distance,
            orb: Math.abs(distance - 180)
          });
        } else if (Math.abs(distance - 120) <= 8) { // Trine
          aspects.trines.push({
            planet1,
            planet2,
            distance,
            orb: Math.abs(distance - 120)
          });
        } else if (Math.abs(distance - 90) <= 8) { // Square
          aspects.squares.push({
            planet1,
            planet2,
            distance,
            orb: Math.abs(distance - 90)
          });
        }
      }
    }

    return aspects;
  }

  /**
   * Calculate planetary dignity
   * @param {string} planet - Planet name
   * @param {number} signId - Sign ID
   * @returns {string} Dignity status
   */
  calculatePlanetaryDignity(planet, signId) {
    const dignities = {
      sun: { exaltation: 1, debilitation: 7, own: 5 }, // Aries, Libra, Leo
      moon: { exaltation: 2, debilitation: 8, own: 4 }, // Taurus, Scorpio, Cancer
      mars: { exaltation: 10, debilitation: 4, own: 1 }, // Capricorn, Cancer, Aries
      mercury: { exaltation: 6, debilitation: 12, own: 3 }, // Virgo, Pisces, Gemini
      jupiter: { exaltation: 4, debilitation: 10, own: 9 }, // Cancer, Capricorn, Sagittarius
      venus: { exaltation: 12, debilitation: 6, own: 2 }, // Pisces, Virgo, Taurus
      saturn: { exaltation: 7, debilitation: 1, own: 10 } // Libra, Aries, Capricorn
    };

    const planetDignity = dignities[planet];
    if (!planetDignity) return 'neutral';

    if (signId === planetDignity.exaltation) return 'exalted';
    if (signId === planetDignity.debilitation) return 'debilitated';
    if (signId === planetDignity.own) return 'own';

    return 'neutral';
  }

  /**
   * Calculate Dasha information using DetailedDashaAnalysisService for consistency
   * @param {Object} rasiChart - Rasi chart data
   * @returns {Object} Dasha information
   */
  calculateDashaInfo(rasiChart) {
    // Use DetailedDashaAnalysisService for consistent Dasha calculations
    const dashaService = new DetailedDashaAnalysisService();

    // Calculate comprehensive Dasha analysis
    const dashaAnalysis = dashaService.analyzeAllDashas(rasiChart);

    // Extract birth Dasha from the sequence with enhanced null safety
    const birthDasha = (dashaAnalysis &&
                       dashaAnalysis.dasha_sequence &&
                       Array.isArray(dashaAnalysis.dasha_sequence) &&
                       dashaAnalysis.dasha_sequence.length > 0 &&
                       dashaAnalysis.dasha_sequence[0] &&
                       dashaAnalysis.dasha_sequence[0].planet)
                       ? dashaAnalysis.dasha_sequence[0].planet
                       : 'moon';

    // Legacy format for backward compatibility
    const dashaPeriods = {
      sun: 6, moon: 10, mars: 7, mercury: 17, jupiter: 16,
      venus: 20, saturn: 19, rahu: 18, ketu: 7
    };

    const moonNakshatra = rasiChart.nakshatra;
    const nakshatraLord = this.getNakshatraLord(moonNakshatra.name);

    return {
      birthDasha,
      currentDasha: dashaAnalysis.current_dasha,
      dashaPeriods,
      nakshatraLord,
      // Include full analysis for enhanced data
      dashaSequence: dashaAnalysis.dasha_sequence,
      summary: dashaAnalysis.summary
    };
  }

  /**
   * Get Nakshatra lord
   * @param {string} nakshatraName - Nakshatra name
   * @returns {string} Nakshatra lord
   */
  getNakshatraLord(nakshatraName) {
    const nakshatraLords = {
      'Ashwini': 'ketu', 'Bharani': 'venus', 'Krittika': 'sun',
      'Rohini': 'moon', 'Mrigashira': 'mars', 'Ardra': 'rahu',
      'Punarvasu': 'jupiter', 'Pushya': 'saturn', 'Ashlesha': 'mercury',
      'Magha': 'ketu', 'Purva Phalguni': 'venus', 'Uttara Phalguni': 'sun',
      'Hasta': 'moon', 'Chitra': 'mars', 'Swati': 'rahu',
      'Vishakha': 'jupiter', 'Anuradha': 'saturn', 'Jyeshtha': 'mercury',
      'Mula': 'ketu', 'Purva Ashadha': 'venus', 'Uttara Ashadha': 'sun',
      'Shravana': 'moon', 'Dhanishta': 'mars', 'Shatabhisha': 'rahu',
      'Purva Bhadrapada': 'jupiter', 'Uttara Bhadrapada': 'saturn', 'Revati': 'mercury'
    };

    return nakshatraLords[nakshatraName] || 'moon';
  }

  // Removed calculateCurrentDasha method - now using DetailedDashaAnalysisService for consistency

  /**
   * Generate comprehensive analysis
   * @param {Object} rasiChart - Rasi chart
   * @param {Object} navamsaChart - Navamsa chart
   * @returns {Object} Comprehensive analysis
   */
  async generateComprehensiveAnalysis(rasiChart, navamsaChart) {
    return {
      personality: this.analyzePersonality(rasiChart),
      health: this.analyzeHealth(rasiChart),
      career: this.analyzeCareer(rasiChart),
      relationships: this.analyzeRelationships(rasiChart, navamsaChart),
      finances: this.analyzeFinances(rasiChart),
      spirituality: this.analyzeSpirituality(rasiChart),
      timing: this.analyzeTiming(rasiChart)
    };
  }

  /**
   * Analyze personality based on Lagna and Moon
   * @param {Object} rasiChart - Rasi chart
   * @returns {Object} Personality analysis
   */
  analyzePersonality(rasiChart) {
    const { ascendant, planetaryPositions } = rasiChart;

    return {
      lagnaSign: ascendant.sign,
      moonSign: planetaryPositions.moon.sign,
      sunSign: planetaryPositions.sun.sign,
      keyTraits: this.getPersonalityTraits(ascendant.sign, planetaryPositions.moon.sign),
      strengths: this.getPersonalityStrengths(rasiChart),
      challenges: this.getPersonalityChallenges(rasiChart)
    };
  }

  /**
   * Get personality traits
   * @param {string} lagnaSign - Ascendant sign
   * @param {string} moonSign - Moon sign
   * @returns {Array} Personality traits
   */
  getPersonalityTraits(lagnaSign, moonSign) {
    const traits = {
      'Aries': ['Dynamic', 'Courageous', 'Leadership'],
      'Taurus': ['Patient', 'Reliable', 'Practical'],
      'Gemini': ['Versatile', 'Intellectual', 'Communicative'],
      'Cancer': ['Emotional', 'Protective', 'Intuitive'],
      'Leo': ['Confident', 'Creative', 'Generous'],
      'Virgo': ['Analytical', 'Perfectionist', 'Service-oriented'],
      'Libra': ['Diplomatic', 'Fair-minded', 'Social'],
      'Scorpio': ['Intense', 'Mysterious', 'Determined'],
      'Sagittarius': ['Optimistic', 'Adventurous', 'Philosophical'],
      'Capricorn': ['Ambitious', 'Disciplined', 'Responsible'],
      'Aquarius': ['Innovative', 'Independent', 'Humanitarian'],
      'Pisces': ['Compassionate', 'Artistic', 'Spiritual']
    };

    return [
      ...(traits[lagnaSign] || []),
      ...(traits[moonSign] || [])
    ];
  }

  /**
   * Analyze health indicators
   * @param {Object} rasiChart - Rasi chart
   * @returns {Object} Health analysis
   */
  analyzeHealth(rasiChart) {
    const { ascendant, planetaryPositions, housePositions } = rasiChart;

    return {
      generalHealth: this.assessGeneralHealth(rasiChart),
      potentialIssues: this.identifyHealthIssues(rasiChart),
      recommendations: this.getHealthRecommendations(rasiChart)
    };
  }

  /**
   * Analyze career prospects
   * @param {Object} rasiChart - Rasi chart
   * @returns {Object} Career analysis
   */
  analyzeCareer(rasiChart) {
    const { planetaryPositions, housePositions } = rasiChart;

    return {
      suitableProfessions: this.getSuitableProfessions(rasiChart),
      careerStrengths: this.getCareerStrengths(rasiChart),
      timing: this.getCareerTiming(rasiChart)
    };
  }

  /**
   * Analyze relationships and marriage
   * @param {Object} rasiChart - Rasi chart
   * @param {Object} navamsaChart - Navamsa chart
   * @returns {Object} Relationship analysis
   */
  analyzeRelationships(rasiChart, navamsaChart) {
    return {
      marriageIndications: this.getMarriageIndications(rasiChart, navamsaChart),
      partnerCharacteristics: this.getPartnerCharacteristics(rasiChart),
      timing: this.getRelationshipTiming(rasiChart)
    };
  }

  /**
   * Analyze financial prospects
   * @param {Object} rasiChart - Rasi chart
   * @returns {Object} Financial analysis
   */
  analyzeFinances(rasiChart) {
    return {
      wealthIndicators: this.getWealthIndicators(rasiChart),
      incomeSources: this.getIncomeSources(rasiChart),
      financialTiming: this.getFinancialTiming(rasiChart)
    };
  }

  /**
   * Analyze spiritual inclinations
   * @param {Object} rasiChart - Rasi chart
   * @returns {Object} Spiritual analysis
   */
  analyzeSpirituality(rasiChart) {
    return {
      spiritualIndicators: this.getSpiritualIndicators(rasiChart),
      spiritualPath: this.getSpiritualPath(rasiChart)
    };
  }

  /**
   * Analyze timing of events
   * @param {Object} rasiChart - Rasi chart
   * @returns {Object} Timing analysis
   */
  analyzeTiming(rasiChart) {
    return {
      majorPeriods: this.getMajorPeriods(rasiChart),
      favorableTiming: this.getFavorableTiming(rasiChart),
      challengingPeriods: this.getChallengingPeriods(rasiChart)
    };
  }

  // Helper methods for analysis (simplified implementations)
  getPersonalityStrengths(rasiChart) {
    return ['Natural leadership', 'Strong willpower', 'Creative thinking'];
  }

  getPersonalityChallenges(rasiChart) {
    return ['Impatience', 'Over-ambition', 'Need for control'];
  }

  assessGeneralHealth(rasiChart) {
    return 'Generally good health with attention to stress management';
  }

  identifyHealthIssues(rasiChart) {
    return ['Digestive issues', 'Stress-related conditions'];
  }

  getHealthRecommendations(rasiChart) {
    return ['Regular exercise', 'Meditation', 'Balanced diet'];
  }

  getSuitableProfessions(rasiChart) {
    return ['Management', 'Technology', 'Consulting'];
  }

  getCareerStrengths(rasiChart) {
    return ['Leadership', 'Strategic thinking', 'Communication'];
  }

  getCareerTiming(rasiChart) {
    return 'Peak career period between 35-50 years';
  }

  getMarriageIndications(rasiChart, navamsaChart) {
    return 'Strong marriage indications with some delays';
  }

  getPartnerCharacteristics(rasiChart) {
    return 'Intelligent, supportive, and career-oriented partner';
  }

  getRelationshipTiming(rasiChart) {
    return 'Marriage likely between 28-32 years';
  }

  getWealthIndicators(rasiChart) {
    return 'Good wealth accumulation potential through career';
  }

  getIncomeSources(rasiChart) {
    return ['Primary career', 'Investments', 'Consulting'];
  }

  getFinancialTiming(rasiChart) {
    return 'Financial growth accelerates after 35 years';
  }

  getSpiritualIndicators(rasiChart) {
    return 'Natural inclination towards spirituality and philosophy';
  }

  getSpiritualPath(rasiChart) {
    return 'Meditation and self-study recommended';
  }

  getMajorPeriods(rasiChart) {
    return 'Jupiter period (2020-2036) brings wisdom and growth';
  }

  getFavorableTiming(rasiChart) {
    return '2024-2026: Excellent for career and relationships';
  }

  getChallengingPeriods(rasiChart) {
    return '2027-2029: Period of transformation and change';
  }

  /**
   * Calculate Nakshatra
   * @param {Object} moonPosition - Moon position
   * @returns {Object} Nakshatra data
   */
  calculateNakshatra(moonPosition) {
    const longitude = moonPosition.longitude;
    const nakshatraNumber = Math.floor(longitude / 13.333333) + 1;

    const nakshatras = [
      'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
      'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
      'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
      'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
      'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
    ];

    const nakshatraName = nakshatras[nakshatraNumber - 1];
    const pada = Math.floor((longitude % 13.333333) / 3.333333) + 1;

    return {
      name: nakshatraName,
      number: nakshatraNumber,
      pada: pada,
      degree: longitude % 13.333333
    };
  }

  /**
   * A private helper to robustly parse a date/time with a timezone.
   * It handles IANA timezones (e.g., "Asia/Kolkata") and direct UTC offsets (e.g., "+05:30").
   * @private
   * @param {string} dateTimeString - The date and time in "YYYY-MM-DD HH:mm:ss" format.
   * @param {string} timeZone - The timezone string.
   * @returns {Object} A valid moment object.
   */
  _getValidMomentWithTimezone(dateTimeString, timeZone) {
    let dateTime;

    // Handle UTC offset format first (e.g., "+05:30", "-08:00")
    if (timeZone && /^[+-]\d{2}:\d{2}$/.test(timeZone)) {
      // Use parseZone for UTC offset strings to avoid moment-timezone data requirement
      dateTime = moment.parseZone(`${dateTimeString} ${timeZone}`, 'YYYY-MM-DD HH:mm:ss Z');
    }
    // Handle special cases UTC/GMT
    else if (timeZone === 'UTC' || timeZone === 'GMT') {
      dateTime = moment.utc(dateTimeString, 'YYYY-MM-DD HH:mm:ss');
    }
    // Handle IANA timezones (e.g., "Asia/Kolkata")
    else if (timeZone && timeZone.includes('/')) {
      try {
        dateTime = moment.tz(dateTimeString, 'YYYY-MM-DD HH:mm:ss', timeZone);
      } catch (error) {
        throw new Error(`IANA timezone "${timeZone}" is not recognized. Please provide a valid IANA timezone identifier (e.g., "Asia/Kolkata", "America/New_York").`);
      }
    } else {
      throw new Error(`Invalid timezone format: "${timeZone}". Please provide a valid IANA timezone identifier.`);
    }

    if (!dateTime || !dateTime.isValid()) {
      throw new Error(`Invalid date/time/timezone combination: "${dateTimeString}" in timezone "${timeZone}"`);
    }

    return dateTime;
  }

  /**
   * Calculate Julian Day Number for given date, time and timezone.
   * @param {string} dateOfBirth - Date in YYYY-MM-DD format.
   * @param {string} timeOfBirth - Time in HH:MM or HH:MM:SS format.
   * @param {string} timeZone - Time zone identifier (IANA name or UTC offset).
   * @returns {Promise<number>} Julian Day Number.
   */
  async calculateJulianDay(dateOfBirth, timeOfBirth, timeZone) {
    try {
      if (!dateOfBirth || !timeOfBirth) {
        throw new Error('Date and time of birth are required for Julian Day calculation');
      }

      const dateString = (dateOfBirth instanceof Date) ? dateOfBirth.toISOString().split('T')[0] : dateOfBirth;
      const formattedTime = timeOfBirth.length === 5 ? `${timeOfBirth}:00` : timeOfBirth;
      const dateTimeString = `${dateString} ${formattedTime}`;

      const dateTime = this._getValidMomentWithTimezone(dateTimeString, timeZone);

      const utcDateTime = dateTime.utc();
      const year = utcDateTime.year();
      const month = utcDateTime.month() + 1;
      const day = utcDateTime.date();
      const hour = utcDateTime.hour() + utcDateTime.minute() / 60 + utcDateTime.second() / 3600;

      if (!this.swissephAvailable || !this.swisseph || typeof this.swisseph.swe_julday !== 'function') {
        throw new Error('Swiss Ephemeris is required for Julian Day calculations but is not available. Please ensure Swiss Ephemeris is properly installed and configured.');
      }

      const result = await this.swisseph.swe_julday(year, month, day, hour, this.swisseph.SE_GREG_CAL || 1);
      return typeof result === 'object' && result.julianDay ? result.julianDay : result;
    } catch (error) {
      throw new Error(`Failed to calculate Julian Day: ${error.message}`);
    }
  }

  /**
   * Convert degree to zodiac sign
   * @param {number} degree - Degree
   * @returns {Object} Sign information
   */
  degreeToSign(degree) {
    const signs = [
      { id: 1, name: 'Aries' },
      { id: 2, name: 'Taurus' },
      { id: 3, name: 'Gemini' },
      { id: 4, name: 'Cancer' },
      { id: 5, name: 'Leo' },
      { id: 6, name: 'Virgo' },
      { id: 7, name: 'Libra' },
      { id: 8, name: 'Scorpio' },
      { id: 9, name: 'Sagittarius' },
      { id: 10, name: 'Capricorn' },
      { id: 11, name: 'Aquarius' },
      { id: 12, name: 'Pisces' }
    ];

    const signIndex = Math.floor(degree / 30);
    return signs[signIndex % 12];
  }

  /**
   * Determines the modality of a zodiac sign.
   * @param {number} signId - The ID of the sign (1-12).
   * @returns {string} The modality ('movable', 'fixed', 'dual').
   */
  getSignModality(signId) {
    const movable = [1, 4, 7, 10];
    const fixed = [2, 5, 8, 11];
    if (movable.includes(signId)) return 'movable';
    if (fixed.includes(signId)) return 'fixed';
    return 'dual';
  }

  /**
   * Calculate Navamsa position with accurate astrological logic.
   * @param {Object} position - Position data from Rasi chart.
   * @returns {Object} Navamsa position data.
   */
  calculateNavamsaPosition(position) {
    const longitude = position.longitude;
    const rasiSignId = this.degreeToSign(longitude).id;

    // 1. Find longitude within the current sign (0-30 degrees)
    const longitudeInSign = longitude % 30;

    // 2. Determine the Navamsa pada (1-9) within the sign
    const navamsaPada = Math.floor(longitudeInSign / (30 / 9)) + 1;

    // 3. Determine the starting sign for Navamsa calculation based on Rasi sign modality
    let startingSign;
    const modality = this.getSignModality(rasiSignId);

    if (modality === 'movable') {
      startingSign = rasiSignId;
    } else if (modality === 'fixed') {
      // Starts from the 9th sign
      startingSign = (rasiSignId + 8 - 1) % 12 + 1;
    } else { // dual
      // Starts from the 5th sign
      startingSign = (rasiSignId + 4 - 1) % 12 + 1;
    }

    // 4. Calculate the final Navamsa sign
    const navamsaSignId = (startingSign + navamsaPada - 2) % 12 + 1;

    // 5. Calculate the longitude in the Navamsa chart
    const navamsaDegreeInSign = (navamsaPada - 1) * (30 / 9);
    const navamsaLongitude = ((navamsaSignId - 1) * 30) + navamsaDegreeInSign;

    return {
      longitude: navamsaLongitude,
      sign: this.degreeToSign(navamsaLongitude).name,
      signId: navamsaSignId,
      degree: navamsaDegreeInSign,
      rasiSign: this.degreeToSign(longitude).name,
      rasiSignId: rasiSignId,
    };
  }

  /**
   * Check if planet is combust
   * @param {string} planetName - Planet name
   * @param {Object} sunPosition - Sun position
   * @param {number} planetLongitude - Planet longitude
   * @returns {boolean} Combust status
   */
  isPlanetCombust(planetName, sunPosition, planetLongitude) {
    if (!sunPosition || planetName === 'sun') return false;

    const sunLongitude = sunPosition.longitude;
    const distance = Math.abs(planetLongitude - sunLongitude);

    // Different planets have different combustion distances
    const combustionDistances = {
      mercury: 14,
      venus: 10,
      mars: 17,
      jupiter: 11,
      saturn: 15
    };

    return distance <= (combustionDistances[planetName] || 10);
  }

  /**
   * Validate birth data
   * @param {Object} birthData - Birth data
   * @returns {boolean} Validation result
   */
  validateBirthData(birthData) {
    // Check for required fields first
    const required = ['dateOfBirth', 'timeOfBirth'];

    for (const field of required) {
      if (!birthData[field]) {
        return false;
      }
    }

    // Validate date format - must be YYYY-MM-DD
    if (!moment(birthData.dateOfBirth, 'YYYY-MM-DD', true).isValid()) {
      return false;
    }

    // Validate time format - accept both HH:mm and HH:mm:ss for astronomical precision
    const isValidTimeFormat = moment(birthData.timeOfBirth, 'HH:mm', true).isValid() ||
                             moment(birthData.timeOfBirth, 'HH:mm:ss', true).isValid();

    if (!isValidTimeFormat) {
      return false;
    }

    // Check if either coordinates or place information is provided
    const hasCoordinates = birthData.latitude && birthData.longitude;
    const hasPlace = birthData.placeOfBirth || (birthData.city && birthData.country) || birthData.city;

    if (!hasCoordinates && !hasPlace) {
      return false;
    }

    // Validate coordinates if provided
    if (hasCoordinates) {
      const lat = parseFloat(birthData.latitude);
      const lon = parseFloat(birthData.longitude);

      if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        return false;
      }
    }

    return true;
  }


}

export default ChartGenerationService;
