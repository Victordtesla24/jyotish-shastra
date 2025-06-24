/**
 * Enhanced Chart Service
 * Advanced chart generation and analysis capabilities
 * Integrates with ChartGenerationService for comprehensive chart casting
 */

const swisseph = require('swisseph');
const { getSign, getSignName, calculateNavamsa, getNakshatra } = require('../../utils/helpers/astrologyHelpers');
const { SWISS_EPHEMERIS, PLANETARY_DATA } = require('../../utils/constants/astronomicalConstants');

class EnhancedChartService {
  constructor() {
    // Set default ayanamsa to Lahiri
    swisseph.swe_set_sid_mode(SWISS_EPHEMERIS.AYANAMSA.LAHIRI);
  }

  /**
   * Calculate planetary positions for a given Julian Day
   * @param {number} julianDay - Julian Day number
   * @param {Object} options - Calculation options
   * @returns {Object} Planetary positions
   */
  async calculatePlanetaryPositions(julianDay, options = {}) {
    try {
      const flags = SWISS_EPHEMERIS.FLAGS.SIDEREAL | SWISS_EPHEMERIS.FLAGS.SWIEPH;
      const planets = {};

      // Main planets
      const planetList = [
        { name: 'sun', id: SWISS_EPHEMERIS.PLANETS.SUN },
        { name: 'moon', id: SWISS_EPHEMERIS.PLANETS.MOON },
        { name: 'mercury', id: SWISS_EPHEMERIS.PLANETS.MERCURY },
        { name: 'venus', id: SWISS_EPHEMERIS.PLANETS.VENUS },
        { name: 'mars', id: SWISS_EPHEMERIS.PLANETS.MARS },
        { name: 'jupiter', id: SWISS_EPHEMERIS.PLANETS.JUPITER },
        { name: 'saturn', id: SWISS_EPHEMERIS.PLANETS.SATURN },
        { name: 'rahu', id: SWISS_EPHEMERIS.PLANETS.RAHU },
        { name: 'ketu', id: SWISS_EPHEMERIS.PLANETS.RAHU } // Ketu is 180° from Rahu
      ];

      for (const planet of planetList) {
        const result = swisseph.swe_calc_ut(julianDay, planet.id, flags);

        if (result.error) {
          throw new Error(`Failed to calculate ${planet.name}: ${result.error}`);
        }

        const longitude = result.longitude;
        const sign = getSign(longitude);
        const nakshatra = getNakshatra(longitude);
        const navamsa = calculateNavamsa(longitude);

        planets[planet.name] = {
          longitude: longitude,
          sign: getSignName(sign.signIndex),
          signId: sign.signIndex + 1,
          degree: sign.degreeInSign,
          speed: result.longitudeSpeed,
          retrograde: result.longitudeSpeed < 0,
          nakshatra: nakshatra,
          navamsa: navamsa
        };

        // Special handling for Ketu (opposite to Rahu)
        if (planet.name === 'ketu') {
          const ketuLongitude = (longitude + 180) % 360;
          const ketuSign = getSign(ketuLongitude);
          const ketuNakshatra = getNakshatra(ketuLongitude);
          const ketuNavamsa = calculateNavamsa(ketuLongitude);

          planets.ketu = {
            longitude: ketuLongitude,
            sign: getSignName(ketuSign.signIndex),
            signId: ketuSign.signIndex + 1,
            degree: ketuSign.degreeInSign,
            speed: -result.longitudeSpeed, // Ketu moves opposite to Rahu
            retrograde: true, // Ketu is always retrograde
            nakshatra: ketuNakshatra,
            navamsa: ketuNavamsa
          };
        }
      }

      return planets;
    } catch (error) {
      throw new Error(`Failed to calculate planetary positions: ${error.message}`);
    }
  }

  /**
   * Calculate house cusps using specified house system
   * @param {number} julianDay - Julian Day number
   * @param {number} latitude - Latitude in degrees
   * @param {number} longitude - Longitude in degrees
   * @param {string} houseSystem - House system (default: Placidus)
   * @returns {Object} House cusps and angles
   */
  async calculateHouseCusps(julianDay, latitude, longitude, houseSystem = 'PLACIDUS') {
    try {
      const flags = SWISS_EPHEMERIS.FLAGS.SIDEREAL | SWISS_EPHEMERIS.FLAGS.SWIEPH;
      const system = SWISS_EPHEMERIS.HOUSE_SYSTEMS[houseSystem];

      const result = swisseph.swe_houses(julianDay, latitude, longitude, system, flags);

      if (result.error) {
        throw new Error(`House calculation failed: ${result.error}`);
      }

      return {
        ascendant: result.ascendant,
        midheaven: result.mc,
        descendant: (result.ascendant + 180) % 360,
        ic: (result.mc + 180) % 360,
        houseCusps: result.house,
        angles: {
          asc: result.ascendant,
          mc: result.mc,
          dsc: (result.ascendant + 180) % 360,
          ic: (result.mc + 180) % 360
        }
      };
    } catch (error) {
      throw new Error(`Failed to calculate house cusps: ${error.message}`);
    }
  }

  /**
   * Generate divisional chart (Varga)
   * @param {Object} planets - Planetary positions from Rasi chart
   * @param {number} division - Division number (1=Rasi, 9=Navamsa, etc.)
   * @returns {Object} Divisional chart positions
   */
  generateDivisionalChart(planets, division) {
    try {
      const divisionalChart = {};

      Object.keys(planets).forEach(planetName => {
        const planet = planets[planetName];
        const longitude = planet.longitude;

        let divisionalLongitude;

        switch (division) {
          case 1: // Rasi (D1)
            divisionalLongitude = longitude;
            break;
          case 9: // Navamsa (D9)
            divisionalLongitude = this.calculateNavamsaLongitude(longitude);
            break;
          case 10: // Dashamsa (D10) - Career
            divisionalLongitude = this.calculateDashamsaLongitude(longitude);
            break;
          case 7: // Saptamsa (D7) - Children
            divisionalLongitude = this.calculateSaptamsaLongitude(longitude);
            break;
          case 12: // Dwadasamsa (D12) - Parents
            divisionalLongitude = this.calculateDwadashamsaLongitude(longitude);
            break;
          default:
            divisionalLongitude = longitude; // Default to Rasi
        }

        const sign = getSign(divisionalLongitude);

        divisionalChart[planetName] = {
          longitude: divisionalLongitude,
          sign: getSignName(sign.signIndex),
          signId: sign.signIndex + 1,
          degree: sign.degreeInSign,
          originalPlanet: planet
        };
      });

      return divisionalChart;
    } catch (error) {
      throw new Error(`Failed to generate divisional chart D${division}: ${error.message}`);
    }
  }

  /**
   * Calculate Navamsa longitude for D9 chart
   * @param {number} longitude - Original longitude
   * @returns {number} Navamsa longitude
   */
  calculateNavamsaLongitude(longitude) {
    const sign = getSign(longitude);
    const signIndex = sign.signIndex;
    const degreeInSign = sign.degreeInSign;

    // Each navamsa is 3.333... degrees (30/9)
    const navamsaIndex = Math.floor(degreeInSign / (30 / 9));

    // Calculate navamsa sign based on sign modality
    let navamsaSign;
    if ([0, 3, 6, 9].includes(signIndex)) { // Movable signs
      navamsaSign = (signIndex + navamsaIndex) % 12;
    } else if ([1, 4, 7, 10].includes(signIndex)) { // Fixed signs
      navamsaSign = (signIndex + 8 + navamsaIndex) % 12;
    } else { // Dual signs
      navamsaSign = (signIndex + 4 + navamsaIndex) % 12;
    }

    return navamsaSign * 30 + (navamsaIndex * (30 / 9));
  }

  /**
   * Calculate Dashamsa longitude for D10 chart (Career)
   * @param {number} longitude - Original longitude
   * @returns {number} Dashamsa longitude
   */
  calculateDashamsaLongitude(longitude) {
    const sign = getSign(longitude);
    const signIndex = sign.signIndex;
    const degreeInSign = sign.degreeInSign;

    // Each dashamsa is 3 degrees (30/10)
    const dashamsaIndex = Math.floor(degreeInSign / 3);

    // For odd signs, start from the same sign
    // For even signs, start from the 9th sign
    let dashamsaSign;
    if (signIndex % 2 === 0) { // Odd signs (0-indexed, so even numbers are odd signs)
      dashamsaSign = (signIndex + dashamsaIndex) % 12;
    } else { // Even signs
      dashamsaSign = (signIndex + 8 + dashamsaIndex) % 12;
    }

    return dashamsaSign * 30 + (dashamsaIndex * 3);
  }

  /**
   * Calculate Saptamsa longitude for D7 chart (Children)
   * @param {number} longitude - Original longitude
   * @returns {number} Saptamsa longitude
   */
  calculateSaptamsaLongitude(longitude) {
    const sign = getSign(longitude);
    const signIndex = sign.signIndex;
    const degreeInSign = sign.degreeInSign;

    // Each saptamsa is 4.285... degrees (30/7)
    const saptamsaIndex = Math.floor(degreeInSign / (30 / 7));

    // For odd signs, start from the same sign
    // For even signs, start from the 7th sign
    let saptamsaSign;
    if (signIndex % 2 === 0) { // Odd signs
      saptamsaSign = (signIndex + saptamsaIndex) % 12;
    } else { // Even signs
      saptamsaSign = (signIndex + 6 + saptamsaIndex) % 12;
    }

    return saptamsaSign * 30 + (saptamsaIndex * (30 / 7));
  }

  /**
   * Calculate Dwadasamsa longitude for D12 chart (Parents)
   * @param {number} longitude - Original longitude
   * @returns {number} Dwadasamsa longitude
   */
  calculateDwadashamsaLongitude(longitude) {
    const sign = getSign(longitude);
    const signIndex = sign.signIndex;
    const degreeInSign = sign.degreeInSign;

    // Each dwadasamsa is 2.5 degrees (30/12)
    const dwadashamsaIndex = Math.floor(degreeInSign / 2.5);

    // Start from the same sign for all signs
    const dwadashamsaSign = (signIndex + dwadashamsaIndex) % 12;

    return dwadashamsaSign * 30 + (dwadashamsaIndex * 2.5);
  }

  /**
   * Calculate planetary aspects between planets
   * @param {Object} planets - Planetary positions
   * @returns {Array} List of aspects
   */
  calculatePlanetaryAspects(planets) {
    try {
      const aspects = [];
      const planetNames = Object.keys(planets);

      for (let i = 0; i < planetNames.length; i++) {
        for (let j = i + 1; j < planetNames.length; j++) {
          const planet1 = planets[planetNames[i]];
          const planet2 = planets[planetNames[j]];

          const aspectInfo = this.getAspectBetweenPlanets(
            planetNames[i], planet1.longitude,
            planetNames[j], planet2.longitude
          );

          if (aspectInfo.hasAspect) {
            aspects.push({
              from: planetNames[i],
              to: planetNames[j],
              type: aspectInfo.type,
              orb: aspectInfo.orb,
              exact: aspectInfo.exact
            });
          }
        }
      }

      return aspects;
    } catch (error) {
      throw new Error(`Failed to calculate planetary aspects: ${error.message}`);
    }
  }

  /**
   * Get aspect between two planets using Vedic aspect rules
   * @param {string} planet1Name - First planet name
   * @param {number} long1 - First planet longitude
   * @param {string} planet2Name - Second planet name
   * @param {number} long2 - Second planet longitude
   * @returns {Object} Aspect information
   */
  getAspectBetweenPlanets(planet1Name, long1, planet2Name, long2) {
    const distance = Math.abs(long1 - long2);
    const normalizedDistance = distance > 180 ? 360 - distance : distance;

    // Get planet-specific aspects from constants
    const planet1Aspects = PLANETARY_DATA.ASPECTS[planet1Name.toLowerCase()] || [7];
    const planet2Aspects = PLANETARY_DATA.ASPECTS[planet2Name.toLowerCase()] || [7];

    // Check if planets aspect each other
    const aspectOrb = 8; // Standard orb for aspects

    for (const aspectType of planet1Aspects) {
      const expectedDistance = this.getAspectDistance(aspectType);
      if (Math.abs(normalizedDistance - expectedDistance) <= aspectOrb) {
        return {
          hasAspect: true,
          type: `${aspectType}th house aspect`,
          orb: Math.abs(normalizedDistance - expectedDistance),
          exact: Math.abs(normalizedDistance - expectedDistance) <= 1
        };
      }
    }

    for (const aspectType of planet2Aspects) {
      const expectedDistance = this.getAspectDistance(aspectType);
      if (Math.abs(normalizedDistance - expectedDistance) <= aspectOrb) {
        return {
          hasAspect: true,
          type: `${aspectType}th house aspect`,
          orb: Math.abs(normalizedDistance - expectedDistance),
          exact: Math.abs(normalizedDistance - expectedDistance) <= 1
        };
      }
    }

    return { hasAspect: false };
  }

  /**
   * Get distance in degrees for aspect type
   * @param {number} aspectType - Aspect type (3, 4, 5, 7, 8, 9, 10)
   * @returns {number} Distance in degrees
   */
  getAspectDistance(aspectType) {
    const aspectDistances = {
      3: 60,   // 3rd house aspect (60°)
      4: 90,   // 4th house aspect (90°)
      5: 120,  // 5th house aspect (120°)
      7: 180,  // 7th house aspect (180°) - opposition
      8: 210,  // 8th house aspect (210°)
      9: 240,  // 9th house aspect (240°)
      10: 270  // 10th house aspect (270°)
    };

    return aspectDistances[aspectType] || 180;
  }

  /**
   * Calculate yogas in the chart
   * @param {Object} planets - Planetary positions
   * @param {Object} houses - House cusps
   * @returns {Array} List of yogas found
   */
  calculateYogas(planets, houses) {
    try {
      const yogas = [];

      // Check for Gaja Kesari Yoga (Jupiter in Kendra from Moon)
      const gajaKesariYoga = this.checkGajaKesariYoga(planets);
      if (gajaKesariYoga.present) {
        yogas.push(gajaKesariYoga);
      }

      // Check for Chandra Mangal Yoga (Moon-Mars conjunction)
      const chandraMangalYoga = this.checkChandraMangalYoga(planets);
      if (chandraMangalYoga.present) {
        yogas.push(chandraMangalYoga);
      }

      // Check for Hamsa Yoga (Jupiter in Kendra in own/exaltation)
      const hamsaYoga = this.checkHamsaYoga(planets, houses);
      if (hamsaYoga.present) {
        yogas.push(hamsaYoga);
      }

      return yogas;
    } catch (error) {
      throw new Error(`Failed to calculate yogas: ${error.message}`);
    }
  }

  /**
   * Check for Gaja Kesari Yoga
   * @param {Object} planets - Planetary positions
   * @returns {Object} Yoga information
   */
  checkGajaKesariYoga(planets) {
    const moonLong = planets.moon.longitude;
    const jupiterLong = planets.jupiter.longitude;

    const distance = Math.abs(moonLong - jupiterLong);
    const normalizedDistance = distance > 180 ? 360 - distance : distance;

    // Jupiter should be in 1st, 4th, 7th, or 10th from Moon
    const kendraDistances = [0, 90, 180, 270];
    const orb = 15; // Generous orb for yoga

    for (const kendraDistance of kendraDistances) {
      if (Math.abs(normalizedDistance - kendraDistance) <= orb) {
        return {
          present: true,
          name: 'Gaja Kesari Yoga',
          description: 'Jupiter in Kendra from Moon - bestows fame, intelligence, and prosperity',
          strength: this.calculateYogaStrength(Math.abs(normalizedDistance - kendraDistance), orb)
        };
      }
    }

    return { present: false };
  }

  /**
   * Check for Chandra Mangal Yoga
   * @param {Object} planets - Planetary positions
   * @returns {Object} Yoga information
   */
  checkChandraMangalYoga(planets) {
    const moonLong = planets.moon.longitude;
    const marsLong = planets.mars.longitude;

    const distance = Math.abs(moonLong - marsLong);
    const normalizedDistance = distance > 180 ? 360 - distance : distance;

    if (normalizedDistance <= 10) { // Conjunction orb
      return {
        present: true,
        name: 'Chandra Mangal Yoga',
        description: 'Moon-Mars conjunction - indicates wealth through real estate and property',
        strength: this.calculateYogaStrength(normalizedDistance, 10)
      };
    }

    return { present: false };
  }

  /**
   * Check for Hamsa Yoga (Jupiter Mahapurusha Yoga)
   * @param {Object} planets - Planetary positions
   * @param {Object} houses - House cusps
   * @returns {Object} Yoga information
   */
  checkHamsaYoga(planets, houses) {
    const jupiter = planets.jupiter;
    const jupiterSign = jupiter.signId;

    // Jupiter should be in own sign (Sagittarius=9, Pisces=12) or exaltation (Cancer=4)
    const ownSigns = [9, 12];
    const exaltationSign = 4;

    if (ownSigns.includes(jupiterSign) || jupiterSign === exaltationSign) {
      // Check if Jupiter is in Kendra (1st, 4th, 7th, 10th house)
      const ascendant = houses.ascendant;
      const housePosition = this.getHousePosition(jupiter.longitude, ascendant);

      if ([1, 4, 7, 10].includes(housePosition)) {
        return {
          present: true,
          name: 'Hamsa Yoga',
          description: 'Jupiter in Kendra in own/exaltation sign - bestows wisdom, spirituality, and high status',
          strength: 'Strong'
        };
      }
    }

    return { present: false };
  }

  /**
   * Calculate yoga strength based on orb
   * @param {number} actualOrb - Actual orb from exact
   * @param {number} maxOrb - Maximum allowed orb
   * @returns {string} Strength rating
   */
  calculateYogaStrength(actualOrb, maxOrb) {
    const ratio = actualOrb / maxOrb;

    if (ratio <= 0.2) return 'Very Strong';
    if (ratio <= 0.4) return 'Strong';
    if (ratio <= 0.6) return 'Moderate';
    if (ratio <= 0.8) return 'Weak';
    return 'Very Weak';
  }

  /**
   * Get house position of a planet from ascendant
   * @param {number} planetLongitude - Planet longitude
   * @param {number} ascendantLongitude - Ascendant longitude
   * @returns {number} House number (1-12)
   */
  getHousePosition(planetLongitude, ascendantLongitude) {
    const difference = (planetLongitude - ascendantLongitude + 360) % 360;
    return Math.floor(difference / 30) + 1;
  }
}

module.exports = EnhancedChartService;
