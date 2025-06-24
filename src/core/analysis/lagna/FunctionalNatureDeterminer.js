/**
 * Functional Nature Determiner for Vedic Astrology
 * Based on the 12-Step Guide to Vedic Horoscope Interpretation
 * Determines functional benefic and malefic planets for each Lagna
 */

const {
  PLANETS,
  ZODIAC_SIGNS
} = require('../../../utils/constants/astronomicalConstants');

class FunctionalNatureDeterminer {
  /**
   * Determine functional nature of all planets for a given Lagna
   * @param {string} lagnaSign - Lagna sign
   * @returns {Object} Functional nature classification
   */
  static determineFunctionalNature(lagnaSign) {
    try {
      const houseRulerships = this.calculateHouseRulerships(lagnaSign);
      const functionalClassification = this.classifyPlanets(houseRulerships);
      const yogakarakas = this.identifyYogakarakas(houseRulerships);
      const marakas = this.identifyMarakas(houseRulerships);
      const analysis = this.generateDetailedAnalysis(lagnaSign, functionalClassification);

      return {
        lagnaSign,
        houseRulerships,
        functionalBenefics: functionalClassification.benefics,
        functionalMalefics: functionalClassification.malefics,
        neutrals: functionalClassification.neutrals,
        yogakarakas,
        marakas,
        analysis,
        recommendations: this.generateRecommendations(functionalClassification, yogakarakas),
        summary: this.generateSummary(lagnaSign, functionalClassification, yogakarakas)
      };

    } catch (error) {
      throw new Error(`Error determining functional nature: ${error.message}`);
    }
  }

  /**
   * Calculate house rulerships for each planet based on Lagna
   * @param {string} lagnaSign - Lagna sign
   * @returns {Object} House rulerships for each planet
   */
  static calculateHouseRulerships(lagnaSign) {
    const signs = Object.values(ZODIAC_SIGNS);
    const lagnaIndex = signs.indexOf(lagnaSign);

    if (lagnaIndex === -1) {
      throw new Error(`Invalid Lagna sign: ${lagnaSign}`);
    }

    // Calculate the 12 houses from Lagna
    const houses = [];
    for (let i = 0; i < 12; i++) {
      const signIndex = (lagnaIndex + i) % 12;
      houses.push(signs[signIndex]);
    }

    // Determine which planet rules which houses
    const rulerships = {};

    Object.values(PLANETS).forEach(planet => {
      if (planet === PLANETS.RAHU || planet === PLANETS.KETU) {
        // Nodes don't rule houses in traditional system
        rulerships[planet] = [];
        return;
      }

      const ruledSigns = this.getPlanetRuledSigns(planet);
      const ruledHouses = [];

      ruledSigns.forEach(sign => {
        const houseNumber = houses.indexOf(sign) + 1;
        if (houseNumber > 0) {
          ruledHouses.push(houseNumber);
        }
      });

      rulerships[planet] = ruledHouses;
    });

    return {
      houses,
      rulerships,
      lagnaSign,
      lagnaLord: this.getLagnaLord(lagnaSign)
    };
  }

  /**
   * Get signs ruled by a planet
   * @param {string} planet - Planet name
   * @returns {Array} Array of ruled signs
   */
  static getPlanetRuledSigns(planet) {
    const rulerships = {
      [PLANETS.SUN]: [ZODIAC_SIGNS.LEO],
      [PLANETS.MOON]: [ZODIAC_SIGNS.CANCER],
      [PLANETS.MERCURY]: [ZODIAC_SIGNS.GEMINI, ZODIAC_SIGNS.VIRGO],
      [PLANETS.VENUS]: [ZODIAC_SIGNS.TAURUS, ZODIAC_SIGNS.LIBRA],
      [PLANETS.MARS]: [ZODIAC_SIGNS.ARIES, ZODIAC_SIGNS.SCORPIO],
      [PLANETS.JUPITER]: [ZODIAC_SIGNS.SAGITTARIUS, ZODIAC_SIGNS.PISCES],
      [PLANETS.SATURN]: [ZODIAC_SIGNS.CAPRICORN, ZODIAC_SIGNS.AQUARIUS]
    };

    return rulerships[planet] || [];
  }

  /**
   * Get ruling planet of a sign
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
   * Classify planets as functional benefics, malefics, or neutrals
   * @param {Object} houseRulerships - House rulership data
   * @returns {Object} Classification of planets
   */
  static classifyPlanets(houseRulerships) {
    const { rulerships } = houseRulerships;

    const benefics = [];
    const malefics = [];
    const neutrals = [];

    // Kendra houses (1, 4, 7, 10)
    const kendraHouses = [1, 4, 7, 10];

    // Trikona houses (1, 5, 9)
    const trikonaHouses = [1, 5, 9];

    // Dusthana houses (6, 8, 12)
    const dusthanaHouses = [6, 8, 12];

    // Upachaya houses (3, 6, 10, 11)
    const upachayaHouses = [3, 6, 10, 11];

    Object.entries(rulerships).forEach(([planet, houses]) => {
      if (planet === PLANETS.RAHU || planet === PLANETS.KETU) {
        // Nodes are generally considered malefic but context-dependent
        malefics.push({
          planet,
          houses,
          reason: 'Shadow planets - generally malefic',
          strength: 'Variable'
        });
        return;
      }

      const classification = this.determinePlanetClassification(
        planet,
        houses,
        kendraHouses,
        trikonaHouses,
        dusthanaHouses,
        upachayaHouses
      );

      if (classification.type === 'benefic') {
        benefics.push(classification);
      } else if (classification.type === 'malefic') {
        malefics.push(classification);
      } else {
        neutrals.push(classification);
      }
    });

    return { benefics, malefics, neutrals };
  }

  /**
   * Determine classification for a single planet
   * @param {string} planet - Planet name
   * @param {Array} houses - Houses ruled by planet
   * @param {Array} kendraHouses - Kendra house numbers
   * @param {Array} trikonaHouses - Trikona house numbers
   * @param {Array} dusthanaHouses - Dusthana house numbers
   * @param {Array} upachayaHouses - Upachaya house numbers
   * @returns {Object} Planet classification
   */
  static determinePlanetClassification(planet, houses, kendraHouses, trikonaHouses, dusthanaHouses, upachayaHouses) {
    if (houses.length === 0) {
      return {
        planet,
        houses,
        type: 'neutral',
        reason: 'No house rulership',
        strength: 'Weak'
      };
    }

    const rulesKendra = houses.some(h => kendraHouses.includes(h));
    const rulesTrikona = houses.some(h => trikonaHouses.includes(h));
    const rulesDusthana = houses.some(h => dusthanaHouses.includes(h));
    const rulesUpachaya = houses.some(h => upachayaHouses.includes(h));

    // Special case: Lagna lord is always considered benefic
    if (houses.includes(1)) {
      return {
        planet,
        houses,
        type: 'benefic',
        reason: 'Lagna lord - always benefic',
        strength: 'Strong',
        special: 'Lagna Lord'
      };
    }

    // Trikona lords are always benefic
    if (rulesTrikona) {
      return {
        planet,
        houses,
        type: 'benefic',
        reason: 'Rules trikona house(s) - auspicious',
        strength: 'Strong',
        special: 'Trikona Lord'
      };
    }

    // Pure dusthana lords are malefic
    if (rulesDusthana && !rulesKendra && !rulesTrikona) {
      return {
        planet,
        houses,
        type: 'malefic',
        reason: 'Rules only dusthana house(s) - inauspicious',
        strength: 'Strong Malefic'
      };
    }

    // Mixed rulership analysis
    if (rulesKendra && rulesDusthana) {
      return {
        planet,
        houses,
        type: 'neutral',
        reason: 'Rules both kendra and dusthana - mixed results',
        strength: 'Variable',
        special: 'Mixed Rulership'
      };
    }

    // Pure kendra lords (except Lagna)
    if (rulesKendra && !rulesDusthana) {
      return {
        planet,
        houses,
        type: 'neutral',
        reason: 'Kendra lord - neutral to slightly malefic',
        strength: 'Moderate',
        special: 'Kendra Lord'
      };
    }

    // Upachaya lords
    if (rulesUpachaya && !rulesDusthana) {
      return {
        planet,
        houses,
        type: 'benefic',
        reason: 'Rules upachaya house(s) - grows with time',
        strength: 'Moderate',
        special: 'Upachaya Lord'
      };
    }

    // Default classification based on remaining houses
    const remainingHouses = [2, 3, 11];
    if (houses.every(h => remainingHouses.includes(h))) {
      return {
        planet,
        houses,
        type: 'neutral',
        reason: 'Rules neutral houses',
        strength: 'Moderate'
      };
    }

    return {
      planet,
      houses,
      type: 'neutral',
      reason: 'Mixed or unclear rulership',
      strength: 'Variable'
    };
  }

  /**
   * Identify Yogakaraka planets (planets ruling both Kendra and Trikona)
   * @param {Object} houseRulerships - House rulership data
   * @returns {Array} Yogakaraka planets
   */
  static identifyYogakarakas(houseRulerships) {
    const { rulerships } = houseRulerships;
    const yogakarakas = [];

    const kendraHouses = [1, 4, 7, 10];
    const trikonaHouses = [1, 5, 9];

    Object.entries(rulerships).forEach(([planet, houses]) => {
      if (planet === PLANETS.RAHU || planet === PLANETS.KETU) return;

      const rulesKendra = houses.some(h => kendraHouses.includes(h));
      const rulesTrikona = houses.some(h => trikonaHouses.includes(h));

      if (rulesKendra && rulesTrikona) {
        yogakarakas.push({
          planet,
          houses,
          kendraHouses: houses.filter(h => kendraHouses.includes(h)),
          trikonaHouses: houses.filter(h => trikonaHouses.includes(h)),
          description: `${planet} rules both Kendra (${houses.filter(h => kendraHouses.includes(h)).join(',')}) and Trikona (${houses.filter(h => trikonaHouses.includes(h)).join(',')}) houses`,
          strength: 'Excellent',
          effects: this.getYogakarakaEffects(planet, houses)
        });
      }
    });

    return yogakarakas;
  }

  /**
   * Identify Maraka planets (death-inflicting planets)
   * @param {Object} houseRulerships - House rulership data
   * @returns {Array} Maraka planets
   */
  static identifyMarakas(houseRulerships) {
    const { rulerships } = houseRulerships;
    const marakas = [];

    const marakaHouses = [2, 7]; // Traditional maraka houses

    Object.entries(rulerships).forEach(([planet, houses]) => {
      const rulesMaraka = houses.some(h => marakaHouses.includes(h));

      if (rulesMaraka) {
        marakas.push({
          planet,
          houses,
          marakaHouses: houses.filter(h => marakaHouses.includes(h)),
          description: `${planet} rules maraka house(s) ${houses.filter(h => marakaHouses.includes(h)).join(',')}`,
          effects: this.getMarakaEffects(planet, houses),
          caution: 'Requires careful analysis during planetary periods'
        });
      }
    });

    return marakas;
  }

  /**
   * Generate detailed analysis for each Lagna
   * @param {string} lagnaSign - Lagna sign
   * @param {Object} classification - Planet classification
   * @returns {Object} Detailed analysis
   */
  static generateDetailedAnalysis(lagnaSign, classification) {
    const analysis = {
      lagnaSpecific: this.getLagnaSpecificAnalysis(lagnaSign),
      beneficAnalysis: this.analyzeBenefics(classification.benefics),
      maleficAnalysis: this.analyzeMalefics(classification.malefics),
      neutralAnalysis: this.analyzeNeutrals(classification.neutrals),
      recommendations: this.getAnalysisRecommendations(classification)
    };

    return analysis;
  }

  /**
   * Get Lagna-specific analysis
   * @param {string} lagnaSign - Lagna sign
   * @returns {Object} Lagna-specific information
   */
  static getLagnaSpecificAnalysis(lagnaSign) {
    const lagnaAnalysis = {
      [ZODIAC_SIGNS.ARIES]: {
        lagnaLord: PLANETS.MARS,
        yogakaraka: PLANETS.SUN,
        bestPlanets: [PLANETS.SUN, PLANETS.JUPITER, PLANETS.MARS],
        worstPlanets: [PLANETS.VENUS, PLANETS.MERCURY],
        characteristics: 'Dynamic, pioneering, leadership-oriented'
      },
      [ZODIAC_SIGNS.TAURUS]: {
        lagnaLord: PLANETS.VENUS,
        yogakaraka: PLANETS.SATURN,
        bestPlanets: [PLANETS.SATURN, PLANETS.VENUS, PLANETS.MERCURY],
        worstPlanets: [PLANETS.MARS, PLANETS.JUPITER],
        characteristics: 'Stable, practical, beauty-loving'
      },
      [ZODIAC_SIGNS.GEMINI]: {
        lagnaLord: PLANETS.MERCURY,
        yogakaraka: PLANETS.VENUS,
        bestPlanets: [PLANETS.VENUS, PLANETS.MERCURY, PLANETS.SATURN],
        worstPlanets: [PLANETS.JUPITER, PLANETS.MARS],
        characteristics: 'Intellectual, communicative, adaptable'
      },
      [ZODIAC_SIGNS.CANCER]: {
        lagnaLord: PLANETS.MOON,
        yogakaraka: PLANETS.MARS,
        bestPlanets: [PLANETS.MARS, PLANETS.JUPITER, PLANETS.MOON],
        worstPlanets: [PLANETS.VENUS, PLANETS.MERCURY, PLANETS.SATURN],
        characteristics: 'Emotional, nurturing, intuitive'
      },
      [ZODIAC_SIGNS.LEO]: {
        lagnaLord: PLANETS.SUN,
        yogakaraka: PLANETS.MARS,
        bestPlanets: [PLANETS.MARS, PLANETS.SUN, PLANETS.JUPITER],
        worstPlanets: [PLANETS.VENUS, PLANETS.MERCURY, PLANETS.SATURN],
        characteristics: 'Confident, generous, leadership-oriented'
      },
      [ZODIAC_SIGNS.VIRGO]: {
        lagnaLord: PLANETS.MERCURY,
        yogakaraka: PLANETS.VENUS,
        bestPlanets: [PLANETS.VENUS, PLANETS.MERCURY, PLANETS.SATURN],
        worstPlanets: [PLANETS.MARS, PLANETS.JUPITER],
        characteristics: 'Analytical, perfectionist, service-oriented'
      },
      [ZODIAC_SIGNS.LIBRA]: {
        lagnaLord: PLANETS.VENUS,
        yogakaraka: PLANETS.SATURN,
        bestPlanets: [PLANETS.SATURN, PLANETS.VENUS, PLANETS.MERCURY],
        worstPlanets: [PLANETS.MARS, PLANETS.JUPITER, PLANETS.SUN],
        characteristics: 'Harmonious, diplomatic, aesthetic'
      },
      [ZODIAC_SIGNS.SCORPIO]: {
        lagnaLord: PLANETS.MARS,
        yogakaraka: PLANETS.JUPITER,
        bestPlanets: [PLANETS.JUPITER, PLANETS.MARS, PLANETS.MOON],
        worstPlanets: [PLANETS.VENUS, PLANETS.MERCURY],
        characteristics: 'Intense, transformative, mysterious'
      },
      [ZODIAC_SIGNS.SAGITTARIUS]: {
        lagnaLord: PLANETS.JUPITER,
        yogakaraka: PLANETS.SUN,
        bestPlanets: [PLANETS.SUN, PLANETS.MARS, PLANETS.JUPITER],
        worstPlanets: [PLANETS.VENUS, PLANETS.MERCURY],
        characteristics: 'Philosophical, adventurous, truth-seeking'
      },
      [ZODIAC_SIGNS.CAPRICORN]: {
        lagnaLord: PLANETS.SATURN,
        yogakaraka: PLANETS.VENUS,
        bestPlanets: [PLANETS.VENUS, PLANETS.MERCURY, PLANETS.SATURN],
        worstPlanets: [PLANETS.MARS, PLANETS.JUPITER, PLANETS.MOON],
        characteristics: 'Ambitious, disciplined, traditional'
      },
      [ZODIAC_SIGNS.AQUARIUS]: {
        lagnaLord: PLANETS.SATURN,
        yogakaraka: PLANETS.VENUS,
        bestPlanets: [PLANETS.VENUS, PLANETS.SATURN, PLANETS.MERCURY],
        worstPlanets: [PLANETS.MARS, PLANETS.JUPITER, PLANETS.SUN],
        characteristics: 'Independent, innovative, humanitarian'
      },
      [ZODIAC_SIGNS.PISCES]: {
        lagnaLord: PLANETS.JUPITER,
        yogakaraka: PLANETS.MARS,
        bestPlanets: [PLANETS.MARS, PLANETS.JUPITER, PLANETS.MOON],
        worstPlanets: [PLANETS.VENUS, PLANETS.MERCURY, PLANETS.SATURN],
        characteristics: 'Compassionate, spiritual, imaginative'
      }
    };

    return lagnaAnalysis[lagnaSign] || {};
  }

  /**
   * Analyze functional benefics
   * @param {Array} benefics - Functional benefic planets
   * @returns {Object} Benefic analysis
   */
  static analyzeBenefics(benefics) {
    if (benefics.length === 0) {
      return {
        count: 0,
        description: 'No clear functional benefics identified',
        recommendations: ['Focus on natural benefics Jupiter and Venus']
      };
    }

    const analysis = {
      count: benefics.length,
      planets: benefics.map(b => b.planet),
      strongest: this.findStrongestBenefic(benefics),
      effects: benefics.map(b => ({
        planet: b.planet,
        houses: b.houses,
        benefits: this.getBeneficEffects(b.planet, b.houses)
      })),
      recommendations: this.getBeneficRecommendations(benefics)
    };

    return analysis;
  }

  /**
   * Analyze functional malefics
   * @param {Array} malefics - Functional malefic planets
   * @returns {Object} Malefic analysis
   */
  static analyzeMalefics(malefics) {
    if (malefics.length === 0) {
      return {
        count: 0,
        description: 'No clear functional malefics identified',
        caution: 'Still be cautious with natural malefics'
      };
    }

    const analysis = {
      count: malefics.length,
      planets: malefics.map(m => m.planet),
      mostProblematic: this.findMostProblematicMalefic(malefics),
      effects: malefics.map(m => ({
        planet: m.planet,
        houses: m.houses,
        challenges: this.getMaleficChallenges(m.planet, m.houses)
      })),
      remedies: this.getMaleficRemedies(malefics)
    };

    return analysis;
  }

  /**
   * Analyze neutral planets
   * @param {Array} neutrals - Neutral planets
   * @returns {Object} Neutral analysis
   */
  static analyzeNeutrals(neutrals) {
    return {
      count: neutrals.length,
      planets: neutrals.map(n => n.planet),
      effects: neutrals.map(n => ({
        planet: n.planet,
        houses: n.houses,
        nature: 'Variable based on placement and associations'
      })),
      guidance: 'These planets give results based on their placement and conjunctions'
    };
  }

  /**
   * Get Yogakaraka effects
   * @param {string} planet - Planet name
   * @param {Array} houses - Ruled houses
   * @returns {Array} Effects of Yogakaraka planet
   */
  static getYogakarakaEffects(planet, houses) {
    return [
      `${planet} as Yogakaraka brings excellent Raja Yoga effects`,
      'Combines power (Kendra) with fortune (Trikona)',
      'Strong periods during planetary Dasha',
      'Leadership, success, and recognition',
      'Should be strengthened through gemstones and mantras'
    ];
  }

  /**
   * Get Maraka effects
   * @param {string} planet - Planet name
   * @param {Array} houses - Ruled houses
   * @returns {Array} Effects of Maraka planet
   */
  static getMarakaEffects(planet, houses) {
    return [
      `${planet} as Maraka can cause health issues during its periods`,
      'Requires careful analysis of planetary strength',
      'Not always negative - depends on overall chart',
      'Caution needed during Dasha/Antardasha periods',
      'Can be mitigated through proper remedies'
    ];
  }

  /**
   * Generate recommendations based on functional nature
   * @param {Object} classification - Planet classification
   * @param {Array} yogakarakas - Yogakaraka planets
   * @returns {Array} Recommendations
   */
  static generateRecommendations(classification, yogakarakas) {
    const recommendations = [];

    // Yogakaraka recommendations
    if (yogakarakas.length > 0) {
      yogakarakas.forEach(yk => {
        recommendations.push(`Strengthen ${yk.planet} (Yogakaraka) through gemstones and mantras`);
      });
    }

    // Benefic recommendations
    classification.benefics.forEach(benefic => {
      if (!yogakarakas.some(yk => yk.planet === benefic.planet)) {
        recommendations.push(`Support functional benefic ${benefic.planet} for positive results`);
      }
    });

    // Malefic cautions
    classification.malefics.forEach(malefic => {
      recommendations.push(`Be cautious with functional malefic ${malefic.planet} - avoid strengthening`);
    });

    // General recommendations
    recommendations.push('Focus on strengthening functional benefics rather than malefics');
    recommendations.push('Use remedial measures carefully based on functional nature');

    return recommendations;
  }

  /**
   * Generate summary
   * @param {string} lagnaSign - Lagna sign
   * @param {Object} classification - Planet classification
   * @param {Array} yogakarakas - Yogakaraka planets
   * @returns {string} Summary text
   */
  static generateSummary(lagnaSign, classification, yogakarakas) {
    const summary = [];

    summary.push(`For ${lagnaSign} Lagna:`);

    if (yogakarakas.length > 0) {
      summary.push(`${yogakarakas.map(yk => yk.planet).join(', ')} ${yogakarakas.length > 1 ? 'are' : 'is'} Yogakaraka planet${yogakarakas.length > 1 ? 's' : ''}.`);
    }

    summary.push(`Functional benefics: ${classification.benefics.map(b => b.planet).join(', ') || 'None clearly identified'}.`);

    summary.push(`Functional malefics: ${classification.malefics.map(m => m.planet).join(', ') || 'None clearly identified'}.`);

    if (classification.neutrals.length > 0) {
      summary.push(`Neutral planets: ${classification.neutrals.map(n => n.planet).join(', ')}.`);
    }

    return summary.join(' ');
  }

  // Helper methods

  static getAnalysisRecommendations(classification) {
    return [
      'Always strengthen functional benefics',
      'Avoid strengthening functional malefics',
      'Yogakarakas should be given highest priority',
      'Neutral planets depend on placement and associations'
    ];
  }

  static findStrongestBenefic(benefics) {
    // Prioritize Yogakarakas, then Trikona lords, then others
    const yogakaraka = benefics.find(b => b.special === 'Lagna Lord' || b.reason.includes('trikona'));
    return yogakaraka || benefics[0];
  }

  static findMostProblematicMalefic(malefics) {
    // Prioritize pure dusthana lords
    const dusthanaLord = malefics.find(m => m.reason.includes('dusthana'));
    return dusthanaLord || malefics[0];
  }

  static getBeneficEffects(planet, houses) {
    return [
      `${planet} brings positive results in areas of houses ${houses.join(', ')}`,
      'Should be strengthened for maximum benefit',
      'Periods of this planet are generally favorable'
    ];
  }

  static getMaleficChallenges(planet, houses) {
    return [
      `${planet} may cause challenges in areas of houses ${houses.join(', ')}`,
      'Requires careful handling and remedial measures',
      'Periods of this planet need extra caution'
    ];
  }

  static getBeneficRecommendations(benefics) {
    return [
      'Wear gemstones of functional benefics',
      'Chant mantras of beneficial planets',
      'Strengthen these planets through appropriate remedies'
    ];
  }

  static getMaleficRemedies(malefics) {
    return [
      'Avoid wearing gemstones of functional malefics',
      'Use protective mantras and yantras',
      'Perform charity and spiritual practices to mitigate negative effects'
    ];
  }
}

module.exports = FunctionalNatureDeterminer;
