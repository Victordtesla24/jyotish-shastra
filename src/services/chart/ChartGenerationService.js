/**
 * Chart Generation Service
 * Handles Vedic birth chart generation using Swiss Ephemeris
 * Enhanced with geocoding integration and comprehensive analysis
 */

const swisseph = require('swisseph');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment-timezone');
const GeocodingService = require('../geocoding/GeocodingService');
const astroConfig = require('../../config/astro-config');
const {
  getSign,
  getSignName,
  calculateNavamsa,
  getNakshatra,
  calculatePlanetaryDignity,
  calculateHouseNumber,

} = require('../../utils/helpers/astrologyHelpers');
const { SWISS_EPHEMERIS, PLANETARY_DATA, ZODIAC_SIGNS } = require('../../utils/constants/astronomicalConstants');



class ChartGenerationService {
  constructor() {
    this.initializeSwissEphemeris();
    this.geocodingService = new GeocodingService();
  }

  /**
   * Initialize Swiss Ephemeris with required settings
   */
  initializeSwissEphemeris() {
    // Set ephemeris path
    swisseph.swe_set_ephe_path(astroConfig.CALCULATION_SETTINGS.EPHEMERIS_PATH);

    // Set calculation flags for Vedic astrology
    this.calcFlags = swisseph.SEFLG_SIDEREAL | swisseph.SEFLG_SPEED;

    // Set Lahiri Ayanamsa for Vedic calculations
    swisseph.swe_set_sid_mode(swisseph.SE_SIDM_LAHIRI);
  }

  /**
   * Generate comprehensive birth chart with geocoding
   * @param {Object} birthData - Birth details
   * @returns {Object} Complete chart data
   */
  async generateComprehensiveChart(birthData) {
    try {
      // Validate birth data
      this.validateBirthData(birthData);

      // Geocode location if coordinates not provided
      const geocodedData = await this.processLocationData(birthData);

      // Generate Rasi chart
      const rasiChart = await this.generateRasiChart(geocodedData);

      // Generate Navamsa chart
      const navamsaChart = await this.generateNavamsaChart(geocodedData);

      // Calculate Dasha information
      const dashaInfo = this.calculateDashaInfo(rasiChart);

      // Generate comprehensive analysis
      const analysis = await this.generateComprehensiveAnalysis(rasiChart, navamsaChart);

      return {
        birthData: geocodedData,
        rasiChart,
        navamsaChart,
        dashaInfo,
        analysis,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
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
      const { dateOfBirth, timeOfBirth } = birthData;
      // Handle both 'timezone' and 'timeZone' properties, with fallback to placeOfBirth.timezone
      const timeZone = birthData.timezone || birthData.timeZone || birthData.placeOfBirth?.timezone;
      const latitude = birthData.latitude || birthData.placeOfBirth?.latitude;
      const longitude = birthData.longitude || birthData.placeOfBirth?.longitude;

      if (!latitude || !longitude) {
        throw new Error('Latitude and longitude are required for Rasi chart generation.');
      }

      // Convert birth data to Julian Day Number
      const jd = this.calculateJulianDay(dateOfBirth, timeOfBirth, timeZone);

      // Calculate Ascendant
      const ascendant = await this.calculateAscendant(jd, { latitude, longitude });

      // Get planetary positions
      const planetaryPositions = await this.getPlanetaryPositions(jd);

      // Calculate house positions
      const housePositions = this.calculateHousePositions(ascendant, jd, latitude, longitude);

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
      const rasiChart = await this.generateRasiChart(birthData);
      const navamsaPositions = {};
      const planets = []; // Add planets array for compatibility

      // Calculate Navamsa positions for each planet
      for (const [planet, position] of Object.entries(rasiChart.planetaryPositions)) {
        const navamsaPosition = this.calculateNavamsaPosition(position);
        navamsaPositions[planet] = navamsaPosition;

        // Add to planets array for compatibility with analyzers
        planets.push({
          name: planet,
          planet: planet,
          longitude: navamsaPosition.longitude,
          degree: navamsaPosition.degree,
          sign: navamsaPosition.sign,
          signId: navamsaPosition.signId,
          house: calculateHouseNumber(navamsaPosition.longitude, rasiChart.ascendant.longitude),
          dignity: position.dignity || 'neutral'
        });
      }

      // Calculate Navamsa Ascendant
      const navamsaAscendant = this.calculateNavamsaPosition(rasiChart.ascendant);

      // Calculate Navamsa house positions
      const navamsaHouses = this.calculateHousePositions(navamsaAscendant);

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
      const ascendantCalculator = new (require('../../core/calculations/chart-casting/AscendantCalculator'))();
      const ascendantData = ascendantCalculator.calculate(jd, placeOfBirth.latitude, placeOfBirth.longitude);
      return ascendantData;
    } catch (error) {
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
      const planetIds = {
        sun: swisseph.SE_SUN,
        moon: swisseph.SE_MOON,
        mars: swisseph.SE_MARS,
        mercury: swisseph.SE_MERCURY,
        jupiter: swisseph.SE_JUPITER,
        venus: swisseph.SE_VENUS,
        saturn: swisseph.SE_SATURN,
        rahu: swisseph.SE_MEAN_NODE // Mean Node (Rahu)
      };

      for (const [planetName, planetId] of Object.entries(planetIds)) {
        const result = swisseph.swe_calc_ut(jd, planetId, this.calcFlags);

        if (result.error) {
          throw new Error(`Error calculating ${planetName}: ${result.error}`);
        }

        const longitude = result.longitude;
        const sign = this.degreeToSign(longitude);

        planets[planetName] = {
          longitude,
          degree: longitude % 30,
          sign: sign.name,
          signId: sign.id,
          speed: result.speedLong,
          isRetrograde: result.speedLong < 0,
          isCombust: this.isPlanetCombust(planetName, planets.sun, longitude),
          dignity: this.calculatePlanetaryDignity(planetName, sign.id)
        };
      }

      // Calculate Ketu position (opposite to Rahu)
      if (planets.rahu) {
        const ketuLongitude = (planets.rahu.longitude + 180) % 360;
        const ketuSign = this.degreeToSign(ketuLongitude);

        planets.ketu = {
          longitude: ketuLongitude,
          degree: ketuLongitude % 30,
          sign: ketuSign.name,
          signId: ketuSign.id,
          speed: planets.rahu.speed,
          isRetrograde: planets.rahu.isRetrograde,
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
   * @param {Object} ascendant - Ascendant data
   * @param {number} jd - Julian Day Number
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @returns {Array} House positions
   */
  calculateHousePositions(ascendant, jd, latitude, longitude) {
    try {
      // For Navamsa chart (and as fallback), use whole sign houses if detailed data isn't available
      if (!jd || !latitude || !longitude) {
        return this.generateWholeSignHouses(ascendant);
      }

      // Try to use Swiss Ephemeris for more accurate house positions
      try {
        const adjustedLatitude = Math.max(-89.999999, Math.min(89.999999, latitude));
        const houses = swisseph.swe_houses(jd, adjustedLatitude, longitude, 'P');

        // Swiss Ephemeris houses calculated successfully

        if (houses && houses.house && houses.house.length >= 12) {
          const housePositions = [];
          for (let i = 0; i < 12; i++) {
            const houseDegree = houses.house[i]; // Swiss Ephemeris house array is 0-indexed
            if (houseDegree !== undefined && !isNaN(houseDegree)) {
              const sign = this.degreeToSign(houseDegree);
              housePositions.push({
                houseNumber: i + 1,
                degree: houseDegree,
                sign: sign.name,
                signId: sign.id,
                longitude: houseDegree
              });
            } else {
              throw new Error(`Invalid house cusp for house ${i+1}`);
            }
          }
          return housePositions;
        } else {
          throw new Error('Swiss Ephemeris returned invalid house data');
        }
      } catch (swissEphError) {
        console.warn('Swiss Ephemeris house calculation failed, falling back to whole sign houses:', swissEphError.message);
        // Fall back to whole sign houses
        return this.generateWholeSignHouses(ascendant);
      }
    } catch (error) {
      throw new Error(`Failed to calculate house positions: ${error.message}`);
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
    const DetailedDashaAnalysisService = require('../analysis/DetailedDashaAnalysisService');
    const dashaService = new DetailedDashaAnalysisService();

    // Calculate comprehensive Dasha analysis
    const dashaAnalysis = dashaService.analyzeAllDashas(rasiChart);

    // Extract birth Dasha from the sequence
    const birthDasha = dashaAnalysis.dasha_sequence[0]?.planet || 'moon';

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
        // Fallback to UTC if IANA timezone fails
        console.warn(`Warning: IANA timezone "${timeZone}" not recognized, falling back to UTC`);
        dateTime = moment.utc(dateTimeString, 'YYYY-MM-DD HH:mm:ss');
      }
    }
    // Fallback to UTC for any unrecognized timezone format
    else {
      dateTime = moment.utc(dateTimeString, 'YYYY-MM-DD HH:mm:ss');
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
   * @returns {number} Julian Day Number.
   */
  calculateJulianDay(dateOfBirth, timeOfBirth, timeZone) {
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

      return swisseph.swe_julday(year, month, day, hour, swisseph.SE_GREG_CAL);
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

module.exports = ChartGenerationService;
