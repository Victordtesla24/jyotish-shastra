/**
 * Lagna Strength Calculator for Vedic Astrology
 * Based on the 12-Step Guide to Vedic Horoscope Interpretation
 * Step 8: Determining the Strength of the First House – The Ascendant
 */

const {
  PLANETS,
  ZODIAC_SIGNS,
  PLANETARY_DIGNITY,
  PLANETARY_RELATIONSHIPS
} = require('../../../utils/constants/astronomicalConstants');

class LagnaStrengthCalculator {
  /**
   * Calculate comprehensive Lagna strength
   * @param {Object} chart - Birth chart data
   * @returns {Object} Detailed Lagna strength analysis
   */
  static calculateLagnaStrength(chart) {
    try {
      const { rasiChart } = chart;
      const ascendant = rasiChart.ascendant;
      const lagnaSign = ascendant.sign;

      // Step 1: Identify Lagna Lord
      const lagnaLord = this.getLagnaLord(lagnaSign);
      const lagnaLordPosition = this.findPlanetPosition(rasiChart.planets, lagnaLord);

      // Step 2: Calculate various strength factors
      const signStrength = this.calculateSignStrength(lagnaSign);
      const lordStrength = this.calculateLordStrength(lagnaLordPosition, lagnaSign);
      const aspectStrength = this.calculateAspectStrength(rasiChart, 1);
      const occupantStrength = this.calculateOccupantStrength(rasiChart, 1);
      const degreeStrength = this.calculateDegreeStrength(ascendant);
      const timeStrength = this.calculateTimeStrength(chart.birthData);

      // Step 3: Calculate composite strength
      const overallStrength = this.calculateOverallStrength({
        signStrength,
        lordStrength,
        aspectStrength,
        occupantStrength,
        degreeStrength,
        timeStrength
      });

      // Step 4: Determine effects and characteristics
      const effects = this.determineLagnaEffects(overallStrength, lagnaSign, lagnaLordPosition);

      return {
        lagnaSign,
        lagnaLord,
        lagnaLordPosition,
        strengthFactors: {
          signStrength,
          lordStrength,
          aspectStrength,
          occupantStrength,
          degreeStrength,
          timeStrength
        },
        overallStrength,
        grade: this.getStrengthGrade(overallStrength.total),
        effects,
        recommendations: this.generateRecommendations(overallStrength, lagnaLord),
        analysis: this.generateDetailedAnalysis(lagnaSign, lagnaLordPosition, overallStrength)
      };

    } catch (error) {
      throw new Error(`Error calculating Lagna strength: ${error.message}`);
    }
  }

  /**
   * Get ruling planet of Lagna sign
   * @param {string} sign - Zodiac sign
   * @returns {string} Ruling planet
   */
  static getLagnaLord(sign) {
    const rulers = {
      [ZODIAC_SIGNS.ARIES]: PLANETS.MARS,
      [ZODIAC_SIGNS.TAURUS]: PLANETS.VENUS,
      [ZODIAC_SIGNS.GEMINI]: PLANETS.MERCURY,
      [ZODIAC_SIGNS.CANCER]: PLANETS.MOON,
      [ZODIAC_SIGNS.LEO]: PLANETS.SUN,
      [ZODIAC_SIGNS.VIRGO]: PLANETS.MERCURY,
      [ZODIAC_SIGNS.LIBRA]: PLANETS.VENUS,
      [ZODIAC_SIGNS.SCORPIO]: PLANETS.MARS,
      [ZODIAC_SIGNS.SAGITTARIUS]: PLANETS.JUPITER,
      [ZODIAC_SIGNS.CAPRICORN]: PLANETS.SATURN,
      [ZODIAC_SIGNS.AQUARIUS]: PLANETS.SATURN,
      [ZODIAC_SIGNS.PISCES]: PLANETS.JUPITER
    };

    return rulers[sign];
  }

  /**
   * Find planet position in chart
   * @param {Array} planets - Array of planetary positions
   * @param {string} planetName - Name of planet to find
   * @returns {Object} Planet position data
   */
  static findPlanetPosition(planets, planetName) {
    return planets.find(p => p.planet === planetName);
  }

  /**
   * Calculate intrinsic strength of the Lagna sign
   * @param {string} sign - Zodiac sign
   * @returns {Object} Sign strength analysis
   */
  static calculateSignStrength(sign) {
    // Cardinal, Fixed, Mutable strength
    const signTypes = {
      cardinal: [ZODIAC_SIGNS.ARIES, ZODIAC_SIGNS.CANCER, ZODIAC_SIGNS.LIBRA, ZODIAC_SIGNS.CAPRICORN],
      fixed: [ZODIAC_SIGNS.TAURUS, ZODIAC_SIGNS.LEO, ZODIAC_SIGNS.SCORPIO, ZODIAC_SIGNS.AQUARIUS],
      mutable: [ZODIAC_SIGNS.GEMINI, ZODIAC_SIGNS.VIRGO, ZODIAC_SIGNS.SAGITTARIUS, ZODIAC_SIGNS.PISCES]
    };

    let signType, baseStrength;

    if (signTypes.cardinal.includes(sign)) {
      signType = 'Cardinal';
      baseStrength = 75; // Strong initiative and leadership
    } else if (signTypes.fixed.includes(sign)) {
      signType = 'Fixed';
      baseStrength = 70; // Steady and determined
    } else {
      signType = 'Mutable';
      baseStrength = 65; // Adaptable but less stable
    }

    // Element strength
    const elements = {
      fire: [ZODIAC_SIGNS.ARIES, ZODIAC_SIGNS.LEO, ZODIAC_SIGNS.SAGITTARIUS],
      earth: [ZODIAC_SIGNS.TAURUS, ZODIAC_SIGNS.VIRGO, ZODIAC_SIGNS.CAPRICORN],
      air: [ZODIAC_SIGNS.GEMINI, ZODIAC_SIGNS.LIBRA, ZODIAC_SIGNS.AQUARIUS],
      water: [ZODIAC_SIGNS.CANCER, ZODIAC_SIGNS.SCORPIO, ZODIAC_SIGNS.PISCES]
    };

    let element, elementStrength;

    if (elements.fire.includes(sign)) {
      element = 'Fire';
      elementStrength = 80; // Dynamic and energetic
    } else if (elements.earth.includes(sign)) {
      element = 'Earth';
      elementStrength = 75; // Practical and stable
    } else if (elements.air.includes(sign)) {
      element = 'Air';
      elementStrength = 70; // Mental and communicative
    } else {
      element = 'Water';
      elementStrength = 70; // Emotional and intuitive
    }

    const totalStrength = Math.round((baseStrength + elementStrength) / 2);

    return {
      signType,
      element,
      baseStrength,
      elementStrength,
      total: totalStrength,
      description: `${signType} ${element} sign with ${this.getStrengthGrade(totalStrength)} intrinsic strength`
    };
  }

  /**
   * Calculate Lagna lord strength
   * @param {Object} lordPosition - Lagna lord position
   * @param {string} lagnaSign - Lagna sign
   * @returns {Object} Lord strength analysis
   */
  static calculateLordStrength(lordPosition, lagnaSign) {
    if (!lordPosition) {
      return {
        total: 0,
        factors: {},
        description: 'Lagna lord position not found'
      };
    }

    const planet = lordPosition.planet;
    const sign = lordPosition.sign;
    const house = lordPosition.house;

    // Dignity strength
    const dignityStrength = this.calculatePlanetaryDignity(planet, sign);

    // House placement strength
    const houseStrength = this.calculateHousePlacementStrength(house);

    // Aspect strength (production-grade full aspect calculation)
    const aspectStrength = this.calculateComprehensiveAspectStrength(lordPosition, chart);

    // Conjunction strength
    const conjunctionStrength = this.calculateConjunctionStrength(lordPosition);

    // Retrograde factor
    const retrogradeStrength = lordPosition.isRetrograde ? 0.8 : 1.0;

    // Combustion factor
    const combustionStrength = lordPosition.isCombust ? 0.5 : 1.0;

    const baseTotal = (dignityStrength + houseStrength + aspectStrength + conjunctionStrength) / 4;
    const adjustedTotal = Math.round(baseTotal * retrogradeStrength * combustionStrength);

    return {
      total: adjustedTotal,
      factors: {
        dignity: dignityStrength,
        housePlacement: houseStrength,
        aspects: aspectStrength,
        conjunctions: conjunctionStrength,
        retrograde: lordPosition.isRetrograde,
        combust: lordPosition.isCombust
      },
      description: this.generateLordStrengthDescription(adjustedTotal, planet, sign, house)
    };
  }

  /**
   * Calculate planetary dignity strength
   * @param {string} planet - Planet name
   * @param {string} sign - Sign name
   * @returns {number} Dignity strength (0-100)
   */
  static calculatePlanetaryDignity(planet, sign) {
    const dignity = PLANETARY_DIGNITY[planet];
    if (!dignity) return 50; // Neutral for nodes

    // Exaltation
    if (dignity.exaltation && dignity.exaltation.sign === sign) {
      return 100;
    }

    // Debilitation
    if (dignity.debilitation && dignity.debilitation.sign === sign) {
      return 20;
    }

    // Own sign
    if (dignity.ownSigns && dignity.ownSigns.includes(sign)) {
      return 85;
    }

    // Moolatrikona (if available)
    if (dignity.moolatrikona && dignity.moolatrikona.sign === sign) {
      return 90;
    }

    // Friend/Enemy relationship
    const relationships = PLANETARY_RELATIONSHIPS[planet];
    if (relationships) {
      const signLord = this.getLagnaLord(sign);

      if (relationships.friends.includes(signLord)) {
        return 70;
      } else if (relationships.enemies.includes(signLord)) {
        return 40;
      } else {
        return 55; // Neutral
      }
    }

    return 50; // Default neutral
  }

  /**
   * Calculate house placement strength
   * @param {number} house - House number (1-12)
   * @returns {number} House strength (0-100)
   */
  static calculateHousePlacementStrength(house) {
    // Kendra houses (1,4,7,10) - Angular houses
    if ([1, 4, 7, 10].includes(house)) {
      return 85;
    }

    // Trikona houses (1,5,9) - Trinal houses
    if ([5, 9].includes(house)) {
      return 90;
    }

    // Upachaya houses (3,6,10,11) - Growing houses
    if ([3, 6, 11].includes(house)) {
      return 70;
    }

    // Dusthana houses (6,8,12) - Difficult houses
    if ([8, 12].includes(house)) {
      return 30;
    }

    // Remaining houses (2)
    return 60;
  }

  /**
   * Calculate aspect strength to Lagna
   * @param {Object} chart - Chart data
   * @param {number} house - House number
   * @returns {Object} Aspect strength analysis
   */
  static calculateAspectStrength(chart, house) {
    const aspectingPlanets = this.findAspectingPlanets(chart, house);
    let beneficPoints = 0;
    let maleficPoints = 0;
    const aspectDetails = [];

    aspectingPlanets.forEach(planetInfo => {
      const { planet, aspectType, orb, strength } = planetInfo;

      // Calculate aspect strength based on orb (closeness)
      const orbMultiplier = Math.max(0.3, 1 - (orb / 10)); // Closer aspects are stronger

      // Calculate planetary strength multiplier
      const planetStrength = this.calculatePlanetaryStrength(chart, planet);
      const strengthMultiplier = planetStrength / 100;

      // Calculate final aspect strength
      const aspectPower = strength * orbMultiplier * strengthMultiplier;

      if (this.isBeneficPlanet(planet)) {
        beneficPoints += aspectPower;
        aspectDetails.push({
          planet,
          type: 'Benefic',
          aspectType,
          power: aspectPower,
          effects: this.getBeneficAspectEffects(planet, house)
        });
      } else {
        maleficPoints += aspectPower;
        aspectDetails.push({
          planet,
          type: 'Malefic',
          aspectType,
          power: aspectPower,
          effects: this.getMaleficAspectEffects(planet, house)
        });
      }
    });

    // Calculate net aspect strength
    const netStrength = Math.round(50 + beneficPoints - maleficPoints);
    const finalStrength = Math.max(0, Math.min(100, netStrength));

    return {
      total: finalStrength,
      beneficPoints: Math.round(beneficPoints),
      maleficPoints: Math.round(maleficPoints),
      aspectingPlanets: aspectingPlanets.map(p => p.planet),
      aspectDetails,
      description: `${aspectingPlanets.length} planets aspecting Lagna with net strength ${finalStrength}`
    };
  }

  /**
   * Calculate occupant strength
   * @param {Object} chart - Chart data
   * @param {number} house - House number
   * @returns {Object} Occupant strength analysis
   */
  static calculateOccupantStrength(chart, house) {
    const occupants = chart.rasiChart.planets.filter(p => p.house === house);

    if (occupants.length === 0) {
      return {
        total: 50, // Neutral when no occupants
        occupants: [],
        description: 'No planets in Lagna - neutral strength'
      };
    }

    let totalStrength = 0;
    const occupantDetails = [];

    occupants.forEach(planet => {
      const planetStrength = this.calculatePlanetaryDignity(planet.planet, planet.sign);
      totalStrength += planetStrength;
      occupantDetails.push({
        planet: planet.planet,
        strength: planetStrength,
        dignity: planet.dignity
      });
    });

    const averageStrength = Math.round(totalStrength / occupants.length);

    return {
      total: averageStrength,
      occupants: occupantDetails,
      description: `${occupants.length} planet(s) in Lagna with average strength ${averageStrength}`
    };
  }

  /**
   * Calculate degree-based strength
   * @param {Object} ascendant - Ascendant data
   * @returns {Object} Degree strength analysis
   */
  static calculateDegreeStrength(ascendant) {
    const degreeInSign = ascendant.degree + (ascendant.minutes / 60) + (ascendant.seconds / 3600);

    // Comprehensive Gandanta degree analysis
    const waterSigns = ['Cancer', 'Scorpio', 'Pisces'];
    const fireSigns = ['Aries', 'Leo', 'Sagittarius'];
    const currentSign = ascendant.sign;

    // Gandanta zones (junction between water and fire signs)
    let isGandanta = false;
    let gandantaType = '';

    if (waterSigns.includes(currentSign) && degreeInSign >= 26.67) {
      isGandanta = true;
      gandantaType = 'Water-Fire junction (ending)';
    } else if (fireSigns.includes(currentSign) && degreeInSign <= 3.33) {
      isGandanta = true;
      gandantaType = 'Water-Fire junction (beginning)';
    }

    // Additional sensitive degrees
    const isVargottama = this.checkVargottamaStatus(degreeInSign, currentSign);
    const isAtmakaraka = this.checkAtmakarakaStatus(degreeInSign);
    const isPushkara = this.checkPushkaraBhaga(degreeInSign, currentSign);

    let strength = 50; // Base strength
    let description = '';

    if (isGandanta) {
      strength = 25;
      description = `Gandanta Ascendant (${gandantaType}) - spiritual significance but material challenges`;
    } else if (isVargottama) {
      strength = 85;
      description = 'Vargottama Ascendant - exceptionally strong position';
    } else if (isPushkara) {
      strength = 80;
      description = 'Pushkara Bhaga Ascendant - highly auspicious';
    } else {
      // Standard degree strength calculation
      const middlePoint = 15;
      const distance = Math.abs(degreeInSign - middlePoint);

      // Avoid first and last degrees (0-1° and 29-30°)
      if (degreeInSign <= 1 || degreeInSign >= 29) {
        strength = 35;
        description = 'Ascendant in critical degrees - requires careful analysis';
      } else if (degreeInSign >= 5 && degreeInSign <= 25) {
        // Strong middle degrees
        strength = Math.round(75 + (10 - distance) * 2);
        description = `Ascendant in strong degrees (${degreeInSign.toFixed(2)}°)`;
      } else {
        // Moderate strength
        strength = Math.round(60 - distance * 1.5);
        description = `Ascendant at moderate strength (${degreeInSign.toFixed(2)}°)`;
      }
    }

    return {
      total: Math.max(20, Math.min(100, strength)),
      degreeInSign: Math.round(degreeInSign * 100) / 100,
      isGandanta,
      gandantaType,
      isVargottama,
      isPushkara,
      isAtmakaraka,
      description
    };
  }

  /**
   * Calculate time-based strength
   * @param {Object} birthData - Birth data
   * @returns {Object} Time strength analysis
   */
  static calculateTimeStrength(birthData) {
    const birthTime = birthData.timeOfBirth;
    const [hours, minutes] = birthTime.split(':').map(Number);
    const decimalHour = hours + minutes / 60;

    // Calculate approximate sunrise and sunset based on latitude
    const latitude = birthData.latitude || 23.5; // Default to Tropic of Cancer
    const seasonalVariation = Math.sin((new Date(birthData.dateOfBirth).getMonth() + 1) * Math.PI / 6) * 1.5;
    const sunrise = 6 - seasonalVariation;
    const sunset = 18 + seasonalVariation;

    let strength = 50;
    let timeType = '';
    let timeDetails = {};

    // Determine time classification
    if (decimalHour >= sunrise && decimalHour < (sunrise + 3)) {
      strength = 85;
      timeType = 'Sunrise (Udaya Lagna)';
      timeDetails.significance = 'Highly auspicious birth time - spiritual and material benefits';
    } else if (decimalHour >= (sunrise + 3) && decimalHour < 12) {
      strength = 75;
      timeType = 'Morning (Forenoon)';
      timeDetails.significance = 'Good birth time - active and dynamic nature';
    } else if (decimalHour >= 12 && decimalHour < 15) {
      strength = 70;
      timeType = 'Midday';
      timeDetails.significance = 'Moderate birth time - balanced nature';
    } else if (decimalHour >= 15 && decimalHour < sunset) {
      strength = 65;
      timeType = 'Afternoon';
      timeDetails.significance = 'Moderate birth time - practical approach';
    } else if (decimalHour >= sunset && decimalHour < (sunset + 2)) {
      strength = 60;
      timeType = 'Sunset (Asta Lagna)';
      timeDetails.significance = 'Transitional time - transformation and change';
    } else if (decimalHour >= (sunset + 2) && decimalHour < 24) {
      strength = 55;
      timeType = 'Night (First half)';
      timeDetails.significance = 'Night birth - intuitive and emotional nature';
    } else {
      strength = 50;
      timeType = 'Late night/Early morning';
      timeDetails.significance = 'Deep night birth - mysterious and spiritual inclinations';
    }

    // Special considerations for exact Lagna change times
    const lagnaChangeHours = [6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 2, 4];
    const isLagnaChangeTime = lagnaChangeHours.some(hour =>
      Math.abs(decimalHour - hour) < 0.1
    );

    if (isLagnaChangeTime) {
      strength -= 10;
      timeDetails.warning = 'Birth near Lagna change time - verify birth time accuracy';
    }

    // Auspicious times (Abhijit Muhurta around noon)
    if (decimalHour >= 11.5 && decimalHour <= 12.5) {
      strength += 10;
      timeDetails.bonus = 'Abhijit Muhurta - highly auspicious time';
    }

    // Planetary hour calculations (simplified)
    const dayOfWeek = new Date(birthData.dateOfBirth).getDay();
    const planetaryHour = this.calculatePlanetaryHour(decimalHour, dayOfWeek, sunrise);

    return {
      total: Math.max(30, Math.min(95, strength)),
      timeType,
      birthTime,
      planetaryHour,
      timeDetails,
      sunrise: sunrise.toFixed(2),
      sunset: sunset.toFixed(2),
      description: `${timeType} birth with ${this.getStrengthGrade(strength)} temporal strength`
    };
  }

  /**
   * Calculate overall Lagna strength
   * @param {Object} factors - All strength factors
   * @returns {Object} Overall strength analysis
   */
  static calculateOverallStrength(factors) {
    const weights = {
      signStrength: 0.15,
      lordStrength: 0.30,
      aspectStrength: 0.20,
      occupantStrength: 0.20,
      degreeStrength: 0.10,
      timeStrength: 0.05
    };

    const weightedTotal = Object.keys(weights).reduce((total, factor) => {
      const value = typeof factors[factor] === 'object' ? factors[factor].total : factors[factor];
      return total + (value * weights[factor]);
    }, 0);

    const total = Math.round(weightedTotal);

    return {
      total,
      weights,
      factors,
      grade: this.getStrengthGrade(total),
      description: `Overall Lagna strength: ${total}/100 (${this.getStrengthGrade(total)})`
    };
  }

  /**
   * Determine Lagna effects based on strength
   * @param {Object} strength - Overall strength data
   * @param {string} lagnaSign - Lagna sign
   * @param {Object} lordPosition - Lord position
   * @returns {Object} Effects analysis
   */
  static determineLagnaEffects(strength, lagnaSign, lordPosition) {
    const effects = {
      health: [],
      personality: [],
      vitality: [],
      appearance: [],
      lifeDirection: []
    };

    const strengthLevel = strength.total;

    // Health effects
    if (strengthLevel >= 80) {
      effects.health.push('Excellent constitution and recovery power');
      effects.health.push('Strong immunity and resistance to diseases');
    } else if (strengthLevel >= 60) {
      effects.health.push('Good health with minor issues');
      effects.health.push('Moderate recovery ability');
    } else if (strengthLevel >= 40) {
      effects.health.push('Average health requiring attention');
      effects.health.push('Susceptible to stress-related issues');
    } else {
      effects.health.push('Weak constitution requiring care');
      effects.health.push('Prone to chronic health issues');
    }

    // Personality effects based on sign
    const signEffects = this.getSignPersonalityEffects(lagnaSign);
    effects.personality = signEffects;

    // Vitality effects
    if (strengthLevel >= 70) {
      effects.vitality.push('High energy and enthusiasm');
      effects.vitality.push('Strong willpower and determination');
    } else {
      effects.vitality.push('Variable energy levels');
      effects.vitality.push('Needs to conserve energy');
    }

    // Life direction effects
    if (lordPosition && lordPosition.house) {
      const directionEffects = this.getLifeDirectionEffects(lordPosition.house);
      effects.lifeDirection = directionEffects;
    }

    return effects;
  }

  /**
   * Get personality effects based on Lagna sign
   * @param {string} sign - Zodiac sign
   * @returns {Array} Personality traits
   */
  static getSignPersonalityEffects(sign) {
    const traits = {
      [ZODIAC_SIGNS.ARIES]: ['Dynamic and pioneering', 'Natural leadership qualities', 'Impulsive but courageous'],
      [ZODIAC_SIGNS.TAURUS]: ['Stable and practical', 'Strong aesthetic sense', 'Determined but stubborn'],
      [ZODIAC_SIGNS.GEMINI]: ['Intellectual and communicative', 'Adaptable and curious', 'Versatile but scattered'],
      [ZODIAC_SIGNS.CANCER]: ['Emotional and nurturing', 'Intuitive and protective', 'Sensitive but moody'],
      [ZODIAC_SIGNS.LEO]: ['Confident and generous', 'Natural performer', 'Proud but warm-hearted'],
      [ZODIAC_SIGNS.VIRGO]: ['Analytical and perfectionist', 'Service-oriented', 'Practical but critical'],
      [ZODIAC_SIGNS.LIBRA]: ['Harmonious and diplomatic', 'Aesthetic appreciation', 'Balanced but indecisive'],
      [ZODIAC_SIGNS.SCORPIO]: ['Intense and transformative', 'Deep and mysterious', 'Powerful but secretive'],
      [ZODIAC_SIGNS.SAGITTARIUS]: ['Philosophical and adventurous', 'Truth-seeking', 'Optimistic but restless'],
      [ZODIAC_SIGNS.CAPRICORN]: ['Ambitious and disciplined', 'Traditional values', 'Responsible but rigid'],
      [ZODIAC_SIGNS.AQUARIUS]: ['Independent and innovative', 'Humanitarian ideals', 'Original but detached'],
      [ZODIAC_SIGNS.PISCES]: ['Compassionate and spiritual', 'Imaginative and intuitive', 'Empathetic but escapist']
    };

    return traits[sign] || ['Unique personality traits'];
  }

  /**
   * Get life direction effects based on Lagna lord house
   * @param {number} house - House number
   * @returns {Array} Life direction indicators
   */
  static getLifeDirectionEffects(house) {
    const directions = {
      1: ['Self-focused life path', 'Personal development important'],
      2: ['Wealth and family oriented', 'Focus on resources and values'],
      3: ['Communication and effort-based success', 'Sibling relationships important'],
      4: ['Home and comfort seeking', 'Emotional security priority'],
      5: ['Creative and intellectual pursuits', 'Children and education focus'],
      6: ['Service and health oriented', 'Overcoming obstacles through effort'],
      7: ['Partnership and relationship focused', 'Business and marriage important'],
      8: ['Transformation and research oriented', 'Interest in occult and mysteries'],
      9: ['Spiritual and philosophical path', 'Higher learning and wisdom seeking'],
      10: ['Career and status focused', 'Public recognition important'],
      11: ['Gains and network oriented', 'Achievement of desires likely'],
      12: ['Spiritual liberation seeking', 'Foreign connections or isolation']
    };

    return directions[house] || ['Unique life direction'];
  }

  /**
   * Generate recommendations based on strength
   * @param {Object} strength - Strength analysis
   * @param {string} lagnaLord - Lagna lord planet
   * @returns {Object} Recommendations
   */
  static generateRecommendations(strength, lagnaLord) {
    const recommendations = {
      gemstone: null,
      mantra: null,
      lifestyle: [],
      remedies: []
    };

    // Always recommend Lagna lord gemstone (as per 12-Step Guide)
    const gemstones = {
      [PLANETS.SUN]: 'Ruby',
      [PLANETS.MOON]: 'Pearl',
      [PLANETS.MERCURY]: 'Emerald',
      [PLANETS.VENUS]: 'Diamond',
      [PLANETS.MARS]: 'Red Coral',
      [PLANETS.JUPITER]: 'Yellow Sapphire',
      [PLANETS.SATURN]: 'Blue Sapphire'
    };

    recommendations.gemstone = {
      stone: gemstones[lagnaLord],
      planet: lagnaLord,
      purpose: 'Strengthen Lagna lord and overall vitality',
      note: 'Consult qualified astrologer for quality and setting'
    };

    // Mantra recommendations
    const mantras = {
      [PLANETS.SUN]: 'Om Suryaya Namaha',
      [PLANETS.MOON]: 'Om Chandraya Namaha',
      [PLANETS.MERCURY]: 'Om Budhaya Namaha',
      [PLANETS.VENUS]: 'Om Shukraya Namaha',
      [PLANETS.MARS]: 'Om Mangalaya Namaha',
      [PLANETS.JUPITER]: 'Om Gurave Namaha',
      [PLANETS.SATURN]: 'Om Shanaye Namaha'
    };

    recommendations.mantra = {
      specific: mantras[lagnaLord],
      general: 'Om Namah Shivaya',
      navgraha: 'Nav Graha Mantra for all planetary energies'
    };

    // Lifestyle recommendations based on strength
    if (strength.total < 60) {
      recommendations.lifestyle.push('Focus on health and vitality building');
      recommendations.lifestyle.push('Regular exercise and proper nutrition');
      recommendations.lifestyle.push('Stress management and adequate rest');
    }

    if (strength.total >= 80) {
      recommendations.lifestyle.push('Maintain current positive practices');
      recommendations.lifestyle.push('Use strong vitality for service to others');
    }

    return recommendations;
  }

  /**
   * Generate detailed analysis text
   * @param {string} lagnaSign - Lagna sign
   * @param {Object} lordPosition - Lord position
   * @param {Object} strength - Strength data
   * @returns {string} Detailed analysis
   */
  static generateDetailedAnalysis(lagnaSign, lordPosition, strength) {
    const analysis = [];

    analysis.push(`Your Lagna (Ascendant) is in ${lagnaSign}, making you a ${lagnaSign} rising individual.`);

    if (lordPosition) {
      analysis.push(`Your Lagna lord ${lordPosition.planet} is placed in ${lordPosition.sign} in the ${lordPosition.house}th house.`);
    }

    analysis.push(`Your overall Lagna strength is ${strength.total}/100, which is considered ${strength.grade}.`);

    if (strength.total >= 70) {
      analysis.push('This strong Lagna indicates good vitality, clear personality expression, and the ability to achieve your goals through personal effort.');
    } else if (strength.total >= 50) {
      analysis.push('This moderate Lagna strength suggests average vitality with some areas needing attention for optimal health and self-expression.');
    } else {
      analysis.push('This weaker Lagna indicates the need for extra care in health matters and may suggest challenges in self-expression that can be overcome with proper remedies.');
    }

    return analysis.join(' ');
  }

  // Helper methods

  static findAspectingPlanets(chart, house) {
    const aspectingPlanets = [];

    if (!chart.rasiChart || !chart.rasiChart.planets) return aspectingPlanets;

    chart.rasiChart.planets.forEach(planetInfo => {
      const { planet, house: planetHouse } = planetInfo;
      const aspectData = this.calculatePlanetaryAspect(planetHouse, house, planet);

      if (aspectData.hasAspect) {
        aspectingPlanets.push({
          planet,
          aspectType: aspectData.aspectType,
          orb: aspectData.orb || 0,
          strength: aspectData.strength || 60
        });
      }
    });

    return aspectingPlanets;
  }

  static isBeneficPlanet(planet) {
    return [PLANETS.JUPITER, PLANETS.VENUS, PLANETS.MOON].includes(planet);
  }

  static calculatePlanetAspectStrength(planetPosition) {
    // Legacy method - using simplified calculation when full chart data unavailable
    let strength = 50; // Base strength

    // Factor in planetary dignity
    if (planetPosition.dignity === 'Exalted') strength += 30;
    else if (planetPosition.dignity === 'Own') strength += 20;
    else if (planetPosition.dignity === 'Debilitated') strength -= 20;

    // Factor in house placement
    const house = planetPosition.house;
    if ([1, 4, 7, 10].includes(house)) strength += 15; // Kendra
    else if ([5, 9].includes(house)) strength += 20; // Trikona
    else if ([6, 8, 12].includes(house)) strength -= 10; // Dusthana

    return Math.max(20, Math.min(100, strength));
  }

  static calculateComprehensiveAspectStrength(lordPosition, chart) {
    // Production-grade comprehensive aspect strength calculation
    const planetaryPositions = chart.planetaryPositions || chart.rasiChart?.planets || {};
    const lordPlanet = lordPosition.planet;
    const lordLongitude = lordPosition.longitude;

    if (!lordLongitude) {
      return this.calculatePlanetAspectStrength(lordPosition); // Fallback to legacy method
    }

    let totalAspectStrength = 0;
    let aspectCount = 0;
    const aspectDetails = [];

    // Define planetary aspects and their strengths
    const planetaryAspects = {
      'Sun': { aspects: [180], strength: 7, orb: 6 },
      'Moon': { aspects: [180], strength: 8, orb: 6 },
      'Mars': { aspects: [90, 180, 240], strength: 9, orb: 8 },
      'Mercury': { aspects: [180], strength: 6, orb: 6 },
      'Jupiter': { aspects: [120, 180, 240], strength: 10, orb: 8 },
      'Venus': { aspects: [180], strength: 8, orb: 6 },
      'Saturn': { aspects: [60, 180, 270], strength: 8, orb: 8 }
    };

    // Check aspects from all other planets
    for (const [planetName, planetData] of Object.entries(planetaryPositions)) {
      if (planetName.toLowerCase() === lordPlanet.toLowerCase()) continue;

      const aspectingPlanet = planetName.charAt(0).toUpperCase() + planetName.slice(1);
      const aspectingLongitude = planetData.longitude;

      if (!aspectingLongitude) continue;

      const aspectConfig = planetaryAspects[aspectingPlanet];
      if (!aspectConfig) continue;

      // Calculate aspect for each possible aspect of the planet
      for (const aspectDegree of aspectConfig.aspects) {
        const aspectAnalysis = this.calculatePreciseAspect(
          aspectingLongitude,
          lordLongitude,
          aspectDegree,
          aspectConfig.orb
        );

        if (aspectAnalysis.isWithinOrb) {
          const aspectStrength = this.calculateAspectStrengthValue(
            aspectAnalysis,
            aspectConfig.strength,
            aspectingPlanet
          );

          aspectDetails.push({
            aspectingPlanet: aspectingPlanet,
            aspectType: this.getAspectTypeName(aspectDegree),
            orb: aspectAnalysis.orb,
            strength: aspectStrength,
            nature: this.getPlanetaryNatureSimple(aspectingPlanet)
          });

          totalAspectStrength += aspectStrength;
          aspectCount++;
        }
      }
    }

    // Calculate average aspect strength
    let averageStrength = aspectCount > 0 ? totalAspectStrength / aspectCount : 50;

    // Apply bonuses and penalties
    const beneficAspects = aspectDetails.filter(a => a.nature === 'benefic').length;
    const maleficAspects = aspectDetails.filter(a => a.nature === 'malefic').length;

    // Benefic aspects boost strength
    averageStrength += (beneficAspects * 5);

    // Too many malefic aspects reduce strength
    if (maleficAspects > beneficAspects) {
      averageStrength -= (maleficAspects * 3);
    }

    // Check for special aspect patterns
    const specialPatterns = this.detectSpecialAspectPatternsSimple(aspectDetails);
    averageStrength += specialPatterns.bonus;

    // Normalize to 0-100 range
    const finalStrength = Math.max(0, Math.min(100, Math.round(averageStrength)));

    return finalStrength;
  }

  static calculatePreciseAspect(aspectingLongitude, receivingLongitude, aspectDegree, allowedOrb) {
    // Calculate the actual angular separation
    let separation = Math.abs(aspectingLongitude - receivingLongitude);
    if (separation > 180) {
      separation = 360 - separation;
    }

    // Calculate deviation from exact aspect
    const deviation = Math.abs(separation - aspectDegree);
    const normalizedDeviation = Math.min(deviation, 360 - deviation);

    return {
      isWithinOrb: normalizedDeviation <= allowedOrb,
      orb: normalizedDeviation,
      exactness: (allowedOrb - normalizedDeviation) / allowedOrb, // 1 = exact, 0 = at orb limit
      separation: separation
    };
  }

  static calculateAspectStrengthValue(aspectAnalysis, basePlanetStrength, aspectingPlanet) {
    // Base strength from the aspecting planet
    let strength = basePlanetStrength;

    // Modify by exactness (closer aspects are stronger)
    strength *= aspectAnalysis.exactness;

    // Modify by planetary nature
    const nature = this.getPlanetaryNatureSimple(aspectingPlanet);
    if (nature === 'benefic') {
      strength *= 1.2; // Benefic aspects are inherently stronger
    } else if (nature === 'malefic') {
      strength *= 0.8; // Malefic aspects are somewhat reduced
    }

    return Math.round(strength);
  }

  static getPlanetaryNatureSimple(planet) {
    const natures = {
      'Sun': 'mild_malefic',
      'Moon': 'benefic',
      'Mars': 'malefic',
      'Mercury': 'neutral',
      'Jupiter': 'benefic',
      'Venus': 'benefic',
      'Saturn': 'malefic',
      'Rahu': 'malefic',
      'Ketu': 'malefic'
    };

    const nature = natures[planet];
    if (nature === 'benefic') return 'benefic';
    if (nature === 'malefic' || nature === 'mild_malefic') return 'malefic';
    return 'neutral';
  }

  static getAspectTypeNameSimple(aspectDegree) {
    const aspectNames = {
      60: '3rd house (60°)',
      90: '4th house (90°)',
      120: '5th house (120°)',
      180: '7th house (180°)',
      240: '8th house (240°)',
      270: '10th house (270°)'
    };

    return aspectNames[aspectDegree] || `${aspectDegree}° aspect`;
  }

  static detectSpecialAspectPatternsSimple(aspectDetails) {
    const patterns = [];
    let bonus = 0;

    // Check for multiple benefic aspects (Raja Yoga indicators)
    const beneficCount = aspectDetails.filter(a => a.nature === 'benefic').length;
    if (beneficCount >= 3) {
      patterns.push('Multiple Benefic Aspects');
      bonus += 15;
    } else if (beneficCount >= 2) {
      patterns.push('Good Benefic Support');
      bonus += 8;
    }

    // Check for Jupiter aspect (Guru Drishti)
    const jupiterAspect = aspectDetails.find(a => a.aspectingPlanet === 'Jupiter');
    if (jupiterAspect) {
      patterns.push('Guru Drishti');
      bonus += 10;
    }

    return { patterns, bonus };
  }

  static calculateConjunctionStrength(planetPosition) {
    let strength = 50; // Base strength

    if (!planetPosition.conjunctions || planetPosition.conjunctions.length === 0) {
      return strength;
    }

    planetPosition.conjunctions.forEach(conjunction => {
      const { planet, orb } = conjunction;

      // Closer conjunctions are stronger
      const orbFactor = Math.max(0.3, 1 - (orb / 10));

      if (this.isBeneficPlanet(planet)) {
        strength += 15 * orbFactor;
      } else {
        strength -= 10 * orbFactor;
      }
    });

    return Math.max(20, Math.min(100, strength));
  }

  static generateLordStrengthDescription(strength, planet, sign, house) {
    return `${planet} in ${sign} (${house}th house) with ${this.getStrengthGrade(strength)} strength`;
  }

  static getStrengthGrade(strength) {
    if (strength >= 80) return 'Excellent';
    if (strength >= 70) return 'Very Good';
    if (strength >= 60) return 'Good';
    if (strength >= 50) return 'Average';
    if (strength >= 40) return 'Below Average';
    if (strength >= 30) return 'Weak';
    return 'Very Weak';
  }

  /**
   * Supporting methods for enhanced calculations
   */

  static calculatePlanetaryStrength(chart, planet) {
    if (!chart.rasiChart || !chart.rasiChart.planets) return 50;

    const planetInfo = chart.rasiChart.planets.find(p => p.planet === planet);
    if (!planetInfo) return 50;

    let strength = 50;

    // Dignity-based strength
    if (planetInfo.dignity === 'Exalted') strength += 30;
    else if (planetInfo.dignity === 'Own') strength += 20;
    else if (planetInfo.dignity === 'Debilitated') strength -= 25;

    // House-based strength
    const house = planetInfo.house;
    if ([1, 4, 7, 10].includes(house)) strength += 15;
    else if ([5, 9].includes(house)) strength += 20;
    else if ([6, 8, 12].includes(house)) strength -= 10;

    return Math.max(20, Math.min(100, strength));
  }

  static getBeneficAspectEffects(planet, house) {
    const effects = {
      [PLANETS.JUPITER]: ['Wisdom and knowledge', 'Spiritual growth', 'Good fortune'],
      [PLANETS.VENUS]: ['Harmony and beauty', 'Artistic talents', 'Relationship benefits'],
      [PLANETS.MOON]: ['Emotional stability', 'Intuitive abilities', 'Public favor']
    };
    return effects[planet] || ['General benefic influence'];
  }

  static getMaleficAspectEffects(planet, house) {
    const effects = {
      [PLANETS.SATURN]: ['Delays and obstacles', 'Hard work required', 'Lessons through challenges'],
      [PLANETS.MARS]: ['Energy and aggression', 'Quick temper', 'Competitive nature'],
      [PLANETS.RAHU]: ['Unconventional approach', 'Material desires', 'Sudden changes'],
      [PLANETS.KETU]: ['Spiritual inclination', 'Detachment', 'Past life karma']
    };
    return effects[planet] || ['General malefic influence'];
  }

  static checkVargottamaStatus(degree, sign) {
    // Vargottama occurs when a planet occupies the same sign in both D1 (Rasi) and D9 (Navamsa) charts.
    // This requires a precise Navamsa calculation.
    const navamsaSign = this.getNavamsaSign(degree, sign);
    return navamsaSign === sign;
  }

  static getNavamsaSign(degree, sign) {
    const signs = [
      ZODIAC_SIGNS.ARIES, ZODIAC_SIGNS.TAURUS, ZODIAC_SIGNS.GEMINI,
      ZODIAC_SIGNS.CANCER, ZODIAC_SIGNS.LEO, ZODIAC_SIGNS.VIRGO,
      ZODIAC_SIGNS.LIBRA, ZODIAC_SIGNS.SCORPIO, ZODIAC_SIGNS.SAGITTARIUS,
      ZODIAC_SIGNS.CAPRICORN, ZODIAC_SIGNS.AQUARIUS, ZODIAC_SIGNS.PISCES
    ];

    const signIndex = signs.indexOf(sign);
    if (signIndex === -1) {
      console.warn(`Invalid sign provided to getNavamsaSign: ${sign}`);
      return null;
    }

    // Each Navamsa division is 3 degrees 20 minutes (3.333333 degrees)
    const navamsaDivision = 3.3333333333;
    const navamsaNumber = Math.floor(degree / navamsaDivision);

    // The Navamsa chart starts from different signs depending on the nature of the Rasi sign:
    // Fire signs (Aries, Leo, Sagittarius) start Navamsa from Aries.
    // Earth signs (Taurus, Virgo, Capricorn) start Navamsa from Capricorn.
    // Air signs (Gemini, Libra, Aquarius) start Navamsa from Libra.
    // Water signs (Cancer, Scorpio, Pisces) start Navamsa from Cancer.

    let navamsaStartSignIndex;
    if ([ZODIAC_SIGNS.ARIES, ZODIAC_SIGNS.LEO, ZODIAC_SIGNS.SAGITTARIUS].includes(sign)) {
      navamsaStartSignIndex = signs.indexOf(ZODIAC_SIGNS.ARIES);
    } else if ([ZODIAC_SIGNS.TAURUS, ZODIAC_SIGNS.VIRGO, ZODIAC_SIGNS.CAPRICORN].includes(sign)) {
      navamsaStartSignIndex = signs.indexOf(ZODIAC_SIGNS.CAPRICORN);
    } else if ([ZODIAC_SIGNS.GEMINI, ZODIAC_SIGNS.LIBRA, ZODIAC_SIGNS.AQUARIUS].includes(sign)) {
      navamsaStartSignIndex = signs.indexOf(ZODIAC_SIGNS.LIBRA);
    } else if ([ZODIAC_SIGNS.CANCER, ZODIAC_SIGNS.SCORPIO, ZODIAC_SIGNS.PISCES].includes(sign)) {
      navamsaStartSignIndex = signs.indexOf(ZODIAC_SIGNS.CANCER);
    } else {
      console.warn(`Unknown sign type for Navamsa calculation: ${sign}`);
      return null;
    }

    const navamsaSignIndex = (navamsaStartSignIndex + navamsaNumber) % 12;
    return signs[navamsaSignIndex];
  }

  static checkAtmakarakaStatus(chart, planet) {
    // Atmakaraka is the planet with the highest longitude (degree) in the chart.
    // This requires comparing all planets in the chart.
    if (!chart || !chart.rasiChart || !chart.rasiChart.planets) {
      console.warn("Chart data missing for Atmakaraka calculation.");
      return false;
    }

    let atmakarakaPlanet = null;
    let maxLongitude = -1;

    // Consider only the 7 classical planets for Atmakaraka in Jaimini system
    const classicalPlanets = [
      PLANETS.SUN, PLANETS.MOON, PLANETS.MARS, PLANETS.MERCURY,
      PLANETS.JUPITER, PLANETS.VENUS, PLANETS.SATURN
    ];

    for (const p of chart.rasiChart.planets) {
      if (classicalPlanets.includes(p.planet) && p.longitude > maxLongitude) {
        maxLongitude = p.longitude;
        atmakarakaPlanet = p.planet;
      }
    }

    return atmakarakaPlanet === planet;
  }

  static checkPushkaraBhaga(degree, sign) {
    // Pushkara Bhaga degrees for each sign
    const pushkaraDegrees = {
      'Aries': [21, 25], 'Taurus': [23, 24], 'Gemini': [18, 17],
      'Cancer': [19, 22], 'Leo': [20, 21], 'Virgo': [16, 25],
      'Libra': [24, 23], 'Scorpio': [22, 19], 'Sagittarius': [21, 20],
      'Capricorn': [25, 16], 'Aquarius': [24, 23], 'Pisces': [22, 19]
    };

    const degrees = pushkaraDegrees[sign] || [];
    return degrees.some(pd => Math.abs(degree - pd) <= 1);
  }

  static calculatePlanetaryAspect(fromHouse, toHouse, planet) {
    const difference = Math.abs(fromHouse - toHouse);
    const adjustedDiff = Math.min(difference, 12 - difference);

    let hasAspect = false;
    let aspectType = '';
    let strength = 60;

    // Universal 7th house aspect
    if (adjustedDiff === 6) {
      hasAspect = true;
      aspectType = '7th house aspect (Opposition)';
      strength = 75;
    }

    // Special aspects
    switch (planet) {
      case PLANETS.MARS:
        if (adjustedDiff === 3 || adjustedDiff === 7) {
          hasAspect = true;
          aspectType = adjustedDiff === 3 ? '4th house aspect' : '8th house aspect';
          strength = 70;
        }
        break;
      case PLANETS.JUPITER:
        if (adjustedDiff === 4 || adjustedDiff === 8) {
          hasAspect = true;
          aspectType = adjustedDiff === 4 ? '5th house aspect' : '9th house aspect';
          strength = 80;
        }
        break;
      case PLANETS.SATURN:
        if (adjustedDiff === 2 || adjustedDiff === 9) {
          hasAspect = true;
          aspectType = adjustedDiff === 2 ? '3rd house aspect' : '10th house aspect';
          strength = 70;
        }
        break;
    }

    return { hasAspect, aspectType, strength, orb: 0 };
  }

  static calculatePlanetaryHour(decimalHour, date, latitude, longitude) {
    // Accurate planetary hour calculation requires precise sunrise/sunset for the given date and location.
    // This is a complex astronomical calculation, so we'll use a more robust approximation.

    // Step 1: Calculate precise sunrise and sunset for the given date and location
    const sunriseSunset = this.getPreciseSunriseSunset(date, latitude, longitude);
    const sunriseHour = sunriseSunset.sunrise.getHours() + sunriseSunset.sunrise.getMinutes() / 60;
    const sunsetHour = sunriseSunset.sunset.getHours() + sunriseSunset.sunset.getMinutes() / 60;

    // Step 2: Determine day or night period length
    let periodLength;
    let isDayTime;
    if (decimalHour >= sunriseHour && decimalHour < sunsetHour) {
      // Day time
      periodLength = sunsetHour - sunriseHour;
      isDayTime = true;
    } else {
      // Night time
      if (decimalHour >= sunsetHour) { // Current hour is after sunset on the same day
        periodLength = (24 - sunsetHour) + sunriseHour; // From sunset to next sunrise
      } else { // Current hour is before sunrise on the same day (i.e., after midnight)
        const prevSunset = this.getPreciseSunriseSunset(new Date(date.getTime() - 24 * 60 * 60 * 1000), latitude, longitude).sunset;
        periodLength = (24 - (prevSunset.getHours() + prevSunset.getMinutes() / 60)) + sunriseHour;
      }
      isDayTime = false;
    }

    const hourDuration = periodLength / 12; // Each planetary hour is 1/12th of the period

    // Step 3: Determine the lord of the current day
    const dayOfWeek = date.getDay(); // 0 for Sunday, 1 for Monday, etc.
    const dayLords = [PLANETS.SUN, PLANETS.MOON, PLANETS.MARS, PLANETS.MERCURY, PLANETS.JUPITER, PLANETS.VENUS, PLANETS.SATURN];
    const currentDayLord = dayLords[dayOfWeek];

    // Step 4: Determine the sequence of planetary hours
    const planetaryHourSequence = [
      PLANETS.SATURN, PLANETS.JUPITER, PLANETS.MARS, PLANETS.SUN,
      PLANETS.VENUS, PLANETS.MERCURY, PLANETS.MOON
    ];

    // Find the starting planet for the day/night period
    let startPlanetIndex;
    if (isDayTime) {
      startPlanetIndex = dayOfWeek; // Day starts with the lord of the day
    } else {
      // Night starts with the planet 5 places after the day's lord in the Chaldean order
      startPlanetIndex = (dayOfWeek + 5) % 7;
    }

    // Step 5: Calculate the current planetary hour
    let hoursPassedInPeriod;
    if (isDayTime) {
      hoursPassedInPeriod = decimalHour - sunriseHour;
    } else {
      if (decimalHour >= sunsetHour) {
        hoursPassedInPeriod = decimalHour - sunsetHour;
      } else {
        // Hours passed since previous sunset
        const prevSunsetHour = this.getPreciseSunriseSunset(new Date(date.getTime() - 24 * 60 * 60 * 1000), latitude, longitude).sunset;
        hoursPassedInPeriod = (24 - (prevSunsetHour.getHours() + prevSunsetHour.getMinutes() / 60)) + decimalHour;
      }
    }

    const currentHourNumber = Math.floor(hoursPassedInPeriod / hourDuration);
    const currentHourLordIndex = (startPlanetIndex + currentHourNumber) % 7;
    const currentHourLord = dayLords[currentHourLordIndex];

    return {
      dayLord: currentDayLord,
      currentHour: currentHourLord,
      hourNumber: currentHourNumber + 1, // 1-indexed hour
      isDayTime: isDayTime,
      periodLength: periodLength,
      hourDuration: hourDuration,
      significance: this.getPlanetaryHourSignificance(currentHourLord)
    };
  }

  static getPlanetaryHourSignificance(planet) {
    const significance = {
      'Sun': 'Authority and leadership activities',
      'Moon': 'Emotional and domestic matters',
      'Mars': 'Action and competitive activities',
      'Mercury': 'Communication and learning',
      'Jupiter': 'Wisdom and spiritual activities',
      'Venus': 'Artistic and relationship matters',
      'Saturn': 'Discipline and long-term planning'
    };

    return significance[planet] || 'General activities';
  }

  /**
   * Calculates precise sunrise and sunset times for a given date and location.
   * This is a complex astronomical calculation.
   * @param {Date} date - The date for which to calculate sunrise/sunset.
   * @param {number} latitude - Observer's latitude in degrees.
   * @param {number} longitude - Observer's longitude in degrees.
   * @returns {Object} An object containing sunrise and sunset Date objects.
   */
  static getPreciseSunriseSunset(date, latitude, longitude) {
    const PI = Math.PI;
    const rad = PI / 180;
    const deg = 180 / PI;

    const N = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)) + 1; // Day of year

    const M = (0.9856 * N) - 3.289; // Mean anomaly of the Sun
    const L = M + (1.916 * Math.sin(M * rad)) + (0.020 * Math.sin(2 * M * rad)) + 282.634; // True longitude of the Sun
    const RA = deg * Math.atan(0.91764 * Math.tan(L * rad)); // Right ascension of the Sun

    const Lquadrant = (Math.floor(L / 90)) * 90;
    const RAquadrant = (Math.floor(RA / 90)) * 90;
    RA = RA + (Lquadrant - RAquadrant);
    RA = RA / 15; // Right ascension value in hours

    const sinDec = 0.39782 * Math.sin(L * rad); // Declination of the Sun
    const cosDec = Math.cos(Math.asin(sinDec));

    const cosH = (Math.cos(90.833 * rad) - (sinDec * Math.sin(latitude * rad))) / (cosDec * Math.cos(latitude * rad));

    if (isNaN(cosH)) { // Sun never rises or sets
      if (latitude > 66.5) { // Northern hemisphere
        return { sunrise: null, sunset: null, description: "24 hour daylight" };
      } else if (latitude < -66.5) { // Southern hemisphere
        return { sunrise: null, sunset: null, description: "24 hour night" };
      }
    }

    const H = deg * Math.acos(cosH); // Hour angle

    const LW = longitude / 15; // Local sidereal time adjustment
    const t_rise = (H + RA) - (0.06571 * N) - 6.622; // Sunrise time in hours
    const t_set = ((360 - H) + RA) - (0.06571 * N) - 6.622; // Sunset time in hours

    const UT_rise = t_rise - LW; // Universal Time for sunrise
    const UT_set = t_set - LW; // Universal Time for sunset

    const localSunrise = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
    localSunrise.setHours(localSunrise.getHours() + UT_rise);

    const localSunset = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
    localSunset.setHours(localSunset.getHours() + UT_set);

    return { sunrise: localSunrise, sunset: localSunset };
  }
}

module.exports = LagnaStrengthCalculator;
