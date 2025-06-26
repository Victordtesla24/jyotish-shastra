/**
 * Aspect Analysis Service
 * Implements comprehensive planetary aspect analysis based on Vedic astrology principles
 * Handles graha drishti (planetary aspects), special aspects, and aspect strength calculations
 */

const { calculateAngularDistance } = require('../../../utils/helpers/astrologyHelpers');

class AspectAnalysisService {
  constructor(chart) {
    this.chart = chart;

    // Standard planetary aspects in Vedic astrology
    this.standardAspects = [
      { type: 'OPPOSITION', angle: 180, orb: 8 },
      { type: 'TRINE', angle: 120, orb: 6 },
      { type: 'SQUARE', angle: 90, orb: 6 },
      { type: 'SEXTILE', angle: 60, orb: 4 },
      { type: 'CONJUNCTION', angle: 0, orb: 8 }
    ];

    // Special aspects for specific planets
    this.specialAspects = {
      Mars: [
        { type: 'MARS_4TH', angle: 90, orb: 6 }, // 4th aspect
        { type: 'MARS_8TH', angle: 210, orb: 6 } // 8th aspect
      ],
      Jupiter: [
        { type: 'JUPITER_5TH', angle: 120, orb: 6 }, // 5th aspect
        { type: 'JUPITER_9TH', angle: 240, orb: 6 } // 9th aspect
      ],
      Saturn: [
        { type: 'SATURN_3RD', angle: 60, orb: 6 }, // 3rd aspect
        { type: 'SATURN_10TH', angle: 270, orb: 6 } // 10th aspect
      ]
    };

    // Planetary nature for aspect interpretation
    this.planetaryNature = {
      Sun: 'malefic',
      Moon: 'benefic',
      Mars: 'malefic',
      Mercury: 'neutral',
      Jupiter: 'benefic',
      Venus: 'benefic',
      Saturn: 'malefic',
      Rahu: 'malefic',
      Ketu: 'malefic'
    };
  }

  /**
   * Analyzes all aspects in a chart
   * @param {Object} chart - Birth chart data (optional, uses constructor chart if not provided)
   * @returns {Object} Complete aspect analysis
   */
  analyzeAspects(chart = this.chart) {
    if (!chart || !chart.planets) {
      throw new Error('Invalid chart data provided for aspect analysis');
    }

    const aspects = this.calculateAllAspects(chart.planets);
    const aspectStrengths = this.calculateAspectStrengths(aspects);
    const significantAspects = this.filterSignificantAspects(aspects);
    const aspectSummary = this.generateAspectSummary(aspects);

    return {
      allAspects: aspects,
      significantAspects: significantAspects,
      aspectStrengths: aspectStrengths,
      summary: aspectSummary,
      totalAspectCount: aspects.length,
      beneficAspects: aspects.filter(a => a.nature === 'benefic').length,
      maleficAspects: aspects.filter(a => a.nature === 'malefic').length
    };
  }

  /**
   * Analyzes all aspects in a chart (required by MasterAnalysisOrchestrator)
   * @param {Object} chart - Birth chart data
   * @returns {Object} Complete aspect analysis
   */
  analyzeAllAspects(chart) {
    return this.analyzeAspects(chart);
  }

  /**
   * Calculates all aspects between planets
   * @param {Array} planets - Array of planet objects (optional, uses chart planets if not provided)
   * @returns {Array} Array of aspect objects
   */
  calculateAllAspects(planets = this.chart?.planets) {
    if (!planets) {
      throw new Error('No planets provided for aspect calculation');
    }

    const aspects = [];

    for (let i = 0; i < planets.length; i++) {
      for (let j = 0; j < planets.length; j++) {
        if (i === j) continue;

        const aspectingPlanet = planets[i];
        const aspectedPlanet = planets[j];

        const planetAspects = this.calculateAspectsBetweenPlanets(aspectingPlanet, aspectedPlanet);
        aspects.push(...planetAspects);
      }
    }

    return aspects;
  }

  /**
   * Calculates aspects between two specific planets
   * @param {Object} planet1 - First planet object (aspecting)
   * @param {Object} planet2 - Second planet object (aspected)
   * @returns {Array} Array of aspects between the two planets
   */
  calculateAspectsBetweenPlanets(planet1, planet2) {
    const aspects = [];

    // Calculate house positions
    const planet1House = this.calculateHouseFromLongitude(planet1.longitude);
    const planet2House = this.calculateHouseFromLongitude(planet2.longitude);

    // Calculate house distance
    const houseDistance = this.calculateHouseDistance(planet1House, planet2House);

    // Check for standard 7th house aspect (all planets aspect 7th house)
    if (houseDistance === 7) {
      aspects.push(this.createAspectObject(planet1, planet2, '7th', houseDistance));
    }

    // Check for special planetary aspects
    const specialAspects = this.getSpecialAspectsForPlanet(planet1.name);
    for (const aspectHouse of specialAspects) {
      if (houseDistance === aspectHouse) {
        aspects.push(this.createAspectObject(planet1, planet2, `${aspectHouse}${this.getOrdinalSuffix(aspectHouse)}`, houseDistance));
      }
    }

    return aspects;
  }

  /**
   * Get special aspects for a planet
   * @param {string} planetName - Planet name
   * @returns {Array} Array of special aspect houses
   */
  getSpecialAspectsForPlanet(planetName) {
    const specialAspects = {
      Mars: [4, 8],
      Jupiter: [5, 9],
      Saturn: [3, 10]
    };

    return specialAspects[planetName] || [];
  }

  /**
   * Calculate house distance between two house positions
   * In Vedic astrology, this represents the aspect count (e.g., 7th aspect means 7th house from the aspecting planet)
   * @param {number} fromHouse - Starting house
   * @param {number} toHouse - Target house
   * @returns {number} House distance (aspect number)
   */
  calculateHouseDistance(fromHouse, toHouse) {
    // Calculate the aspect number based on house positions
    // From house 1 to house 7 = 7th aspect
    // From house 1 to house 4 = 4th aspect, etc.
    let aspectNumber = toHouse - fromHouse + 1;
    if (aspectNumber <= 0) {
      aspectNumber += 12;
    }
    if (aspectNumber > 12) {
      aspectNumber -= 12;
    }
    return aspectNumber;
  }

  /**
   * Creates an aspect object
   * @param {Object} aspectingPlanet - Planet making the aspect
   * @param {Object} aspectedPlanet - Planet receiving the aspect
   * @param {string} aspectType - Type of aspect
   * @param {number} houseDistance - House distance
   * @returns {Object} Aspect object
   */
  createAspectObject(aspectingPlanet, aspectedPlanet, aspectType, houseDistance) {
    const nature = this.determineAspectNature(aspectingPlanet, aspectType);
    const strength = this.calculateAspectStrengthFromType(aspectType);

    return {
      source: aspectingPlanet.name,
      target: {
        planet: aspectedPlanet.name,
        house: this.calculateHouseFromLongitude(aspectedPlanet.longitude)
      },
      type: aspectType,
      houseDistance: houseDistance,
      strength: strength,
      nature: nature,
      description: `${aspectingPlanet.name} ${aspectType} aspect to ${aspectedPlanet.name}`
    };
  }

  /**
   * Calculate aspect strength from type
   * @param {string} aspectType - Aspect type
   * @returns {number} Aspect strength
   */
  calculateAspectStrengthFromType(aspectType) {
    const strengthMap = {
      '7th': 8,
      '3rd': 6,
      '4th': 7,
      '5th': 7,
      '8th': 7,
      '9th': 7,
      '10th': 6
    };

    return strengthMap[aspectType] || 5;
  }

  /**
   * Calculate house from longitude (basic implementation)
   * @param {number} longitude - Planet longitude
   * @returns {number} House number
   */
  calculateHouseFromLongitude(longitude) {
    // Simple equal house system calculation
    // Normalize longitude to 0-360 range
    let normalizedLong = longitude % 360;
    if (normalizedLong < 0) normalizedLong += 360;

    return Math.floor(normalizedLong / 30) + 1;
  }

  /**
   * Determines the nature of an aspect (benefic/malefic)
   * @param {Object} aspectingPlanet - Planet making the aspect
   * @param {string} aspectType - Type of aspect
   * @returns {string} Nature of the aspect
   */
  determineAspectNature(aspectingPlanet, aspectType) {
    const planetNature = this.planetaryNature[aspectingPlanet.name] || 'neutral';

    // In Vedic astrology, the nature of the aspect generally follows the planet's nature
    // Special considerations for certain aspects can be added here
    return planetNature;
  }

  /**
   * Generates a description for an aspect
   * @param {Object} aspectingPlanet - Planet making the aspect
   * @param {Object} aspectedPlanet - Planet receiving the aspect
   * @param {Object} aspectType - Type of aspect
   * @param {boolean} isSpecial - Whether this is a special aspect
   * @returns {string} Human-readable description
   */
  generateAspectDescription(aspectingPlanet, aspectedPlanet, aspectType, isSpecial) {
    const special = isSpecial ? ' (special aspect)' : '';
    return `${aspectingPlanet.name} ${aspectType.type.toLowerCase()} ${aspectedPlanet.name}${special}`;
  }

  /**
   * Calculates aspect strengths for all planets
   * @param {Array} aspects - Array of aspect objects
   * @returns {Object} Aspect strength summary by planet
   */
  calculateAspectStrengths(aspects) {
    const strengths = {};

    // Initialize all planets
    const allPlanets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
    allPlanets.forEach(planet => {
      strengths[planet] = {
        receiving: { total: 0, benefic: 0, malefic: 0, count: 0 },
        giving: { total: 0, benefic: 0, malefic: 0, count: 0 }
      };
    });

    // Calculate strengths from aspects
    aspects.forEach(aspect => {
      const { aspectingPlanet, aspectedPlanet, strength, nature } = aspect;

      // Planet giving the aspect
      if (strengths[aspectingPlanet]) {
        strengths[aspectingPlanet].giving.total += strength;
        strengths[aspectingPlanet].giving.count++;
        if (nature === 'benefic') strengths[aspectingPlanet].giving.benefic += strength;
        if (nature === 'malefic') strengths[aspectingPlanet].giving.malefic += strength;
      }

      // Planet receiving the aspect
      if (strengths[aspectedPlanet]) {
        strengths[aspectedPlanet].receiving.total += strength;
        strengths[aspectedPlanet].receiving.count++;
        if (nature === 'benefic') strengths[aspectedPlanet].receiving.benefic += strength;
        if (nature === 'malefic') strengths[aspectedPlanet].receiving.malefic += strength;
      }
    });

    return strengths;
  }

  /**
   * Filters aspects to show only significant ones
   * @param {Array} aspects - All aspects
   * @returns {Array} Significant aspects only
   */
  filterSignificantAspects(aspects) {
    return aspects.filter(aspect => aspect.strength >= 5.0);
  }

  /**
   * Generates a summary of aspect analysis
   * @param {Array} aspects - All aspects
   * @returns {Object} Summary of aspects
   */
  generateAspectSummary(aspects) {
    const summary = {
      totalAspects: aspects.length,
      byType: {},
      byNature: { benefic: 0, malefic: 0, neutral: 0 },
      strongestAspect: null,
      averageStrength: 0
    };

    let totalStrength = 0;

    aspects.forEach(aspect => {
      // Count by type
      summary.byType[aspect.type] = (summary.byType[aspect.type] || 0) + 1;

      // Count by nature
      summary.byNature[aspect.nature]++;

      // Track strongest aspect
      if (!summary.strongestAspect || aspect.strength > summary.strongestAspect.strength) {
        summary.strongestAspect = aspect;
      }

      totalStrength += aspect.strength;
    });

    summary.averageStrength = aspects.length > 0 ? totalStrength / aspects.length : 0;

    return summary;
  }

  /**
   * Analyzes the effect of a planetary aspect on a house
   * @param {number} houseNumber - House number (1-12)
   * @param {string} planet - Aspecting planet name
   * @param {string} aspectType - Type of aspect
   * @returns {Object} Aspect analysis on house
   */
  analyzeAspectOnHouse(houseNumber, planet, aspectType) {
    const planetNature = this.planetaryNature[planet] || 'neutral';
    const houseSignifications = this.getHouseSignifications(houseNumber);

    let interpretation = '';
    let nature = planetNature;

    if (planetNature === 'benefic') {
      interpretation = `${planet} ${aspectType} aspect blesses the ${houseNumber}${this.getOrdinalSuffix(houseNumber)} house, promoting ${houseSignifications.positive}`;
      nature = 'Benefic';
    } else if (planetNature === 'malefic') {
      interpretation = `${planet} ${aspectType} aspect can bring ${houseSignifications.challenges} to the ${houseNumber}${this.getOrdinalSuffix(houseNumber)} house`;
      nature = 'Malefic';
    } else {
      interpretation = `${planet} ${aspectType} aspect brings mixed results to the ${houseNumber}${this.getOrdinalSuffix(houseNumber)} house`;
      nature = 'Neutral';
    }

    return {
      house: houseNumber,
      aspectingPlanet: planet,
      aspectType: aspectType,
      nature: nature,
      interpretation: interpretation,
      significations: houseSignifications
    };
  }

  /**
   * Get full aspect analysis for a specific planet
   * @param {string} planetName - Planet name
   * @returns {Object} Complete planet aspect analysis
   */
  getAnalysisForPlanet(planetName) {
    const aspects = this.calculateAllAspects();
    const aspectsGiven = aspects.filter(a => a.source === planetName);
    const aspectsReceived = aspects.filter(a => a.target.planet === planetName);

    return {
      planet: planetName,
      aspectsGiven: aspectsGiven,
      aspectsReceived: aspectsReceived,
      totalAspectsGiven: aspectsGiven.length,
      totalAspectsReceived: aspectsReceived.length,
      beneficAspectsGiven: aspectsGiven.filter(a => a.nature === 'benefic').length,
      maleficAspectsGiven: aspectsGiven.filter(a => a.nature === 'malefic').length,
      beneficAspectsReceived: aspectsReceived.filter(a => a.nature === 'benefic').length,
      maleficAspectsReceived: aspectsReceived.filter(a => a.nature === 'malefic').length
    };
  }

  /**
   * Get full aspect analysis for a specific house
   * @param {number} houseNumber - House number (1-12)
   * @returns {Array} Array of aspects affecting the house
   */
  getAnalysisForHouse(houseNumber) {
    if (!this.chart || !this.chart.planets) {
      return [];
    }

    const houseAspects = [];
    const planets = this.chart.planets;

    // Find planets aspecting this house
    for (const planet of planets) {
      const planetHouse = planet.house || this.calculateHouseFromLongitude(planet.longitude);

      // Check if planet aspects this house
      if (this.planetAspectsHouse(planet, planetHouse, houseNumber)) {
        const aspectType = this.getAspectTypeForHouse(planetHouse, houseNumber, planet.name);
        const analysis = this.analyzeAspectOnHouse(houseNumber, planet.name, aspectType);
        houseAspects.push(analysis);
      }
    }

    return houseAspects;
  }

  /**
   * Get house significations for interpretation
   * @param {number} houseNumber - House number
   * @returns {Object} House significations
   */
  getHouseSignifications(houseNumber) {
    const significations = {
      1: { positive: 'personality, health, and self-expression', challenges: 'delays, challenges, or a sense of responsibility to' },
      2: { positive: 'wealth, speech, and family harmony', challenges: 'financial difficulties or family disputes to' },
      3: { positive: 'courage, communication, and siblings', challenges: 'communication problems or sibling conflicts to' },
      4: { positive: 'happiness, property, and education', challenges: 'domestic troubles or property issues to' },
      5: { positive: 'intelligence, creativity, and good fortune with children', challenges: 'educational setbacks or children-related worries to' },
      6: { positive: 'overcoming enemies and obstacles', challenges: 'health issues or conflicts to' },
      7: { positive: 'partnerships and marriage harmony', challenges: 'delays, challenges, or a sense of responsibility to partnerships' },
      8: { positive: 'transformation and hidden knowledge', challenges: 'obstacles and sudden changes to' },
      9: { positive: 'dharma, wisdom, and good fortune', challenges: 'spiritual confusion or ethical dilemmas to' },
      10: { positive: 'career success and reputation', challenges: 'professional obstacles or reputation issues to' },
      11: { positive: 'gains, friendships, and wish fulfillment', challenges: 'disappointments in gains or friendship troubles to' },
      12: { positive: 'spiritual liberation and foreign connections', challenges: 'losses or isolation to' }
    };

    return significations[houseNumber] || { positive: 'general prosperity', challenges: 'general difficulties to' };
  }

  /**
   * Get ordinal suffix for numbers
   * @param {number} num - Number
   * @returns {string} Ordinal suffix
   */
  getOrdinalSuffix(num) {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const v = num % 100;
    return suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0];
  }

  /**
   * Check if a planet aspects a particular house
   * @param {Object} planet - Planet object
   * @param {number} planetHouse - Planet's house position
   * @param {number} targetHouse - Target house number
   * @returns {boolean} Whether planet aspects the house
   */
  planetAspectsHouse(planet, planetHouse, targetHouse) {
    // All planets aspect the 7th house from their position
    const seventhHouse = ((planetHouse + 6) % 12) + 1;
    if (targetHouse === seventhHouse) return true;

    // Special aspects
    if (planet.name === 'Mars') {
      const fourthHouse = ((planetHouse + 3) % 12) + 1;
      const eighthHouse = ((planetHouse + 7) % 12) + 1;
      return targetHouse === fourthHouse || targetHouse === eighthHouse;
    }

    if (planet.name === 'Jupiter') {
      const fifthHouse = ((planetHouse + 4) % 12) + 1;
      const ninthHouse = ((planetHouse + 8) % 12) + 1;
      return targetHouse === fifthHouse || targetHouse === ninthHouse;
    }

    if (planet.name === 'Saturn') {
      const thirdHouse = ((planetHouse + 2) % 12) + 1;
      const tenthHouse = ((planetHouse + 9) % 12) + 1;
      return targetHouse === thirdHouse || targetHouse === tenthHouse;
    }

    return false;
  }

  /**
   * Get aspect type for house aspect
   * @param {number} planetHouse - Planet's house
   * @param {number} targetHouse - Target house
   * @param {string} planetName - Planet name
   * @returns {string} Aspect type
   */
  getAspectTypeForHouse(planetHouse, targetHouse, planetName) {
    const seventhHouse = ((planetHouse + 6) % 12) + 1;
    if (targetHouse === seventhHouse) return '7th';

    if (planetName === 'Mars') {
      const fourthHouse = ((planetHouse + 3) % 12) + 1;
      const eighthHouse = ((planetHouse + 7) % 12) + 1;
      if (targetHouse === fourthHouse) return '4th';
      if (targetHouse === eighthHouse) return '8th';
    }

    if (planetName === 'Jupiter') {
      const fifthHouse = ((planetHouse + 4) % 12) + 1;
      const ninthHouse = ((planetHouse + 8) % 12) + 1;
      if (targetHouse === fifthHouse) return '5th';
      if (targetHouse === ninthHouse) return '9th';
    }

    if (planetName === 'Saturn') {
      const thirdHouse = ((planetHouse + 2) % 12) + 1;
      const tenthHouse = ((planetHouse + 9) % 12) + 1;
      if (targetHouse === thirdHouse) return '3rd';
      if (targetHouse === tenthHouse) return '10th';
    }

    return 'standard';
  }
}

module.exports = AspectAnalysisService;
