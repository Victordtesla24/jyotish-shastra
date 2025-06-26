/**
 * House Lord Calculator for Vedic Astrology
 * Based on the 12-Step Guide to Vedic Horoscope Interpretation
 * Section 3: House-by-House Examination - House lord analysis
 */

const {
  PLANETS,
  ZODIAC_SIGNS
} = require('../../../utils/constants/astronomicalConstants');

class HouseLordCalculator {
  /**
   * Constructor
   */
  constructor() {
    // Instance can be created for testing compatibility
  }

  /**
   * Get the lord of a specific house
   * @param {number} house - House number (1-12)
   * @param {Object} chart - Birth chart data
   * @returns {string} House lord planet name
   */
  getLordOfHouse(house, chart) {
    try {
      const lagnaSign = chart.ascendant?.sign || chart.rasiChart?.ascendant?.sign;
      if (!lagnaSign) {
        throw new Error('Ascendant sign not found in chart');
      }

      const houseSequence = HouseLordCalculator.calculateHouseSignSequence(lagnaSign);
      const houseInfo = houseSequence.find(h => h.house === house);

      if (!houseInfo) {
        throw new Error(`Invalid house number: ${house}`);
      }

      return HouseLordCalculator.getSignRuler(houseInfo.sign);
    } catch (error) {
      throw new Error(`Error getting lord of house ${house}: ${error.message}`);
    }
  }

  /**
   * Get all house lords for a chart
   * @param {Object} chart - Birth chart data
   * @returns {Array} Array of house lord information
   */
  getAllHouseLords(chart) {
    try {
      const lagnaSign = chart.ascendant?.sign || chart.rasiChart?.ascendant?.sign;
      if (!lagnaSign) {
        throw new Error('Ascendant sign not found in chart');
      }

      const houseSequence = HouseLordCalculator.calculateHouseSignSequence(lagnaSign);
      const houseLords = HouseLordCalculator.determineHouseLords(houseSequence);

      return Object.values(houseLords);
    } catch (error) {
      throw new Error(`Error getting all house lords: ${error.message}`);
    }
  }

  /**
   * Calculate all house lords and their placements
   * @param {Object} chart - Birth chart data
   * @returns {Object} Complete house lord analysis
   */
  static calculateHouseLords(chart) {
    try {
      const { rasiChart } = chart;
      const lagnaSign = rasiChart.ascendant.sign;

      // Calculate house signs from Lagna
      const houseSignSequence = this.calculateHouseSignSequence(lagnaSign);

      // Determine lord of each house
      const houseLords = this.determineHouseLords(houseSignSequence);

      // Find placement of each house lord
      const lordPlacements = this.findLordPlacements(houseLords, rasiChart.planets);

      // Analyze each house lord's condition
      const lordAnalysis = this.analyzeHouseLords(lordPlacements, chart);

      // Calculate house lord relationships
      const lordRelationships = this.calculateLordRelationships(lordPlacements);

      // Generate house-wise effects
      const houseEffects = this.generateHouseEffects(lordAnalysis);

      return {
        lagnaSign,
        houseSignSequence,
        houseLords,
        lordPlacements,
        lordAnalysis,
        lordRelationships,
        houseEffects,
        summary: this.generateSummary(lordAnalysis),
        recommendations: this.generateRecommendations(lordAnalysis)
      };

    } catch (error) {
      throw new Error(`Error calculating house lords: ${error.message}`);
    }
  }

  /**
   * Calculate the sequence of signs in each house from Lagna
   * @param {string} lagnaSign - Lagna sign
   * @returns {Array} Array of signs for houses 1-12
   */
  static calculateHouseSignSequence(lagnaSign) {
    const signs = [
      'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];

    let lagnaIndex = signs.indexOf(lagnaSign);

    // If not found, try to normalize the sign name
    if (lagnaIndex === -1) {
      const normalizedSign = this.normalizeSignName(lagnaSign);
      lagnaIndex = signs.indexOf(normalizedSign);
    }

    if (lagnaIndex === -1) {
      throw new Error(`Invalid Lagna sign: ${lagnaSign}`);
    }

    const houseSequence = [];
    for (let i = 0; i < 12; i++) {
      const signIndex = (lagnaIndex + i) % 12;
      houseSequence.push({
        house: i + 1,
        sign: signs[signIndex],
        signNumber: signIndex + 1
      });
    }

    return houseSequence;
  }

  /**
   * Normalize sign name to handle variations
   * @param {string} signName - Raw sign name
   * @returns {string} Normalized sign name
   */
  static normalizeSignName(signName) {
    if (!signName) return '';

    const normalized = signName.toString().trim();
    const lowerCase = normalized.toLowerCase();

    const signMap = {
      'aries': 'Aries',
      'taurus': 'Taurus',
      'gemini': 'Gemini',
      'cancer': 'Cancer',
      'leo': 'Leo',
      'virgo': 'Virgo',
      'libra': 'Libra',
      'scorpio': 'Scorpio',
      'sagittarius': 'Sagittarius',
      'capricorn': 'Capricorn',
      'aquarius': 'Aquarius',
      'pisces': 'Pisces'
    };

    return signMap[lowerCase] || normalized;
  }

  /**
   * Determine the ruling planet for each house
   * @param {Array} houseSequence - House sign sequence
   * @returns {Object} House lords mapping
   */
  static determineHouseLords(houseSequence) {
    const houseLords = {};

    houseSequence.forEach(({ house, sign }) => {
      const lord = this.getSignRuler(sign);
      houseLords[house] = {
        house,
        sign,
        lord,
        description: `${house}${this.getOrdinalSuffix(house)} house (${sign}) ruled by ${lord}`
      };
    });

    return houseLords;
  }

  /**
   * Get ruling planet of a zodiac sign
   * @param {string} sign - Zodiac sign
   * @returns {string} Ruling planet
   */
  static getSignRuler(sign) {
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
   * Find placement of each house lord in the chart
   * @param {Object} houseLords - House lords mapping
   * @param {Array} planets - Planetary positions
   * @returns {Object} Lord placements
   */
  static findLordPlacements(houseLords, planets) {
    const lordPlacements = {};

    Object.values(houseLords).forEach(({ house, lord }) => {
      const planetPosition = planets.find(p => p.planet === lord);

      if (planetPosition) {
        lordPlacements[house] = {
          originalHouse: house,
          lord,
          placement: {
            house: planetPosition.house,
            sign: planetPosition.sign,
            degree: planetPosition.degree,
            nakshatra: planetPosition.nakshatra,
            isRetrograde: planetPosition.isRetrograde || false,
            isCombust: planetPosition.isCombust || false,
            dignity: planetPosition.dignity
          },
          houseDistance: this.calculateHouseDistance(house, planetPosition.house),
          description: `${house}${this.getOrdinalSuffix(house)} lord ${lord} in ${planetPosition.house}${this.getOrdinalSuffix(planetPosition.house)} house (${planetPosition.sign})`
        };
      } else {
        lordPlacements[house] = {
          originalHouse: house,
          lord,
          placement: null,
          error: `${lord} position not found in chart`
        };
      }
    });

    return lordPlacements;
  }

  /**
   * Analyze condition and effects of each house lord
   * @param {Object} lordPlacements - Lord placements
   * @param {Object} chart - Full chart data
   * @returns {Object} Detailed analysis of each house lord
   */
  static analyzeHouseLords(lordPlacements, chart) {
    const analysis = {};

    Object.entries(lordPlacements).forEach(([house, data]) => {
      if (!data.placement) {
        analysis[house] = {
          house: parseInt(house),
          error: data.error
        };
        return;
      }

      const houseNum = parseInt(house);
      const { lord, placement, houseDistance } = data;

      // Analyze lord's strength and condition
      const lordStrength = this.analyzeLordStrength(lord, placement);

      // Analyze placement effects
      const placementEffects = this.analyzePlacementEffects(houseNum, placement.house, lord);

      // Analyze house distance effects
      const distanceEffects = this.analyzeDistanceEffects(houseDistance);

      // Determine overall house condition
      const houseCondition = this.determineHouseCondition(lordStrength, placementEffects, distanceEffects);

      // Generate house predictions
      const predictions = this.generateHousePredictions(houseNum, houseCondition, placement);

      analysis[house] = {
        house: houseNum,
        lord,
        placement,
        houseDistance,
        lordStrength,
        placementEffects,
        distanceEffects,
        houseCondition,
        predictions,
        significations: this.getHouseSignifications(houseNum),
        timing: this.getHouseTiming(lord, houseNum)
      };
    });

    return analysis;
  }

  /**
   * Analyze strength and condition of a house lord
   * @param {string} lord - Planet name
   * @param {Object} placement - Placement details
   * @returns {Object} Lord strength analysis
   */
  static analyzeLordStrength(lord, placement) {
    const { sign, house, degree, isRetrograde, isCombust, dignity } = placement;

    // Dignity-based strength
    const dignityStrength = this.calculateDignityStrength(lord, sign, dignity);

    // House-based strength
    const houseStrength = this.calculateHouseStrength(house);

    // Degree-based strength
    const degreeStrength = this.calculateDegreeStrength(degree);

    // Retrograde factor
    const retrogradeEffect = isRetrograde ? 0.8 : 1.0;

    // Combustion factor
    const combustionEffect = isCombust ? 0.5 : 1.0;

    // Calculate overall strength
    const baseStrength = (dignityStrength + houseStrength + degreeStrength) / 3;
    const adjustedStrength = Math.round(baseStrength * retrogradeEffect * combustionEffect);

    return {
      total: adjustedStrength,
      grade: this.getStrengthGrade(adjustedStrength),
      factors: {
        dignity: dignityStrength,
        house: houseStrength,
        degree: degreeStrength,
        retrograde: isRetrograde,
        combust: isCombust
      },
      description: this.generateStrengthDescription(lord, adjustedStrength, placement)
    };
  }

  /**
   * Analyze effects of house lord placement
   * @param {number} originalHouse - Original house ruled
   * @param {number} placementHouse - House where lord is placed
   * @param {string} lord - Planet name
   * @returns {Object} Placement effects analysis
   */
  static analyzePlacementEffects(originalHouse, placementHouse, lord) {
    const placementType = this.determinePlacementType(originalHouse, placementHouse);
    const houseNature = this.getHouseNature(placementHouse);
    const combinedEffects = this.getCombinedHouseEffects(originalHouse, placementHouse);

    return {
      placementType,
      houseNature,
      combinedEffects,
      strength: this.calculatePlacementStrength(placementType, houseNature),
      description: this.generatePlacementDescription(originalHouse, placementHouse, lord, placementType)
    };
  }

  /**
   * Analyze effects based on house distance
   * @param {number} distance - Distance from original house
   * @returns {Object} Distance effects analysis
   */
  static analyzeDistanceEffects(distance) {
    const distanceMap = {
      1: { type: 'Self-placed', strength: 85, description: 'Lord in own house - very strong' },
      2: { type: 'Wealth-focused', strength: 70, description: 'Focus on resources and values' },
      3: { type: 'Effort-based', strength: 65, description: 'Results through personal effort' },
      4: { type: 'Comfort-seeking', strength: 75, description: 'Focus on stability and comfort' },
      5: { type: 'Creative expression', strength: 80, description: 'Creative and intellectual development' },
      6: { type: 'Service-oriented', strength: 60, description: 'Service and overcoming obstacles' },
      7: { type: 'Partnership-focused', strength: 70, description: 'Results through partnerships' },
      8: { type: 'Transformative', strength: 45, description: 'Deep transformation and challenges' },
      9: { type: 'Fortunate', strength: 85, description: 'Highly auspicious placement' },
      10: { type: 'Achievement-oriented', strength: 80, description: 'Success and recognition' },
      11: { type: 'Gain-focused', strength: 90, description: 'Excellent for fulfillment of desires' },
      12: { type: 'Loss or liberation', strength: 40, description: 'Expenses or spiritual growth' }
    };

    return distanceMap[distance] || { type: 'Unknown', strength: 50, description: 'Unclear effects' };
  }

  /**
   * Determine overall condition of the house
   * @param {Object} lordStrength - Lord strength analysis
   * @param {Object} placementEffects - Placement effects
   * @param {Object} distanceEffects - Distance effects
   * @returns {Object} Overall house condition
   */
  static determineHouseCondition(lordStrength, placementEffects, distanceEffects) {
    const weights = {
      lordStrength: 0.4,
      placementEffects: 0.35,
      distanceEffects: 0.25
    };

    const weightedScore =
      (lordStrength.total * weights.lordStrength) +
      (placementEffects.strength * weights.placementEffects) +
      (distanceEffects.strength * weights.distanceEffects);

    const overallScore = Math.round(weightedScore);

    return {
      score: overallScore,
      grade: this.getStrengthGrade(overallScore),
      status: this.getHouseStatus(overallScore),
      factors: {
        lordStrength: lordStrength.total,
        placementEffects: placementEffects.strength,
        distanceEffects: distanceEffects.strength
      },
      description: this.generateConditionDescription(overallScore)
    };
  }

  /**
   * Generate predictions for a house based on its condition
   * @param {number} house - House number
   * @param {Object} condition - House condition
   * @param {Object} placement - Lord placement
   * @returns {Object} House predictions
   */
  static generateHousePredictions(house, condition, placement) {
    const significations = this.getHouseSignifications(house);
    const predictions = {
      general: [],
      positive: [],
      challenges: [],
      timing: [],
      remedies: []
    };

    // General predictions based on house condition
    if (condition.score >= 70) {
      predictions.general.push(`${house}${this.getOrdinalSuffix(house)} house matters are well-supported`);
      significations.forEach(sig => {
        predictions.positive.push(`Good results in ${sig.toLowerCase()}`);
      });
    } else if (condition.score >= 50) {
      predictions.general.push(`${house}${this.getOrdinalSuffix(house)} house shows mixed results`);
      predictions.general.push('Some areas may need extra attention');
    } else {
      predictions.general.push(`${house}${this.getOrdinalSuffix(house)} house may face challenges`);
      significations.forEach(sig => {
        predictions.challenges.push(`Difficulties possible in ${sig.toLowerCase()}`);
      });
    }

    // Timing predictions
    predictions.timing.push(`Results most prominent during ${placement.sign} periods`);
    predictions.timing.push(`${placement.house}${this.getOrdinalSuffix(placement.house)} house activations bring ${house}${this.getOrdinalSuffix(house)} house results`);

    // Remedial suggestions
    if (condition.score < 60) {
      predictions.remedies.push(`Strengthen ${placement.lord} through appropriate remedies`);
      predictions.remedies.push(`Focus on ${house}${this.getOrdinalSuffix(house)} house significations for improvement`);
    }

    return predictions;
  }

  /**
   * Calculate relationships between house lords
   * @param {Object} lordPlacements - All lord placements
   * @returns {Object} Lord relationships analysis
   */
  static calculateLordRelationships(lordPlacements) {
    const relationships = {
      conjunctions: [],
      exchanges: [],
      mutualAspects: [],
      houseConnections: {}
    };

    // Find conjunctions (lords in same house)
    const houseGroups = {};
    Object.values(lordPlacements).forEach(data => {
      if (data.placement) {
        const house = data.placement.house;
        if (!houseGroups[house]) houseGroups[house] = [];
        houseGroups[house].push(data);
      }
    });

    Object.entries(houseGroups).forEach(([house, lords]) => {
      if (lords.length > 1) {
        relationships.conjunctions.push({
          house: parseInt(house),
          lords: lords.map(l => ({ originalHouse: l.originalHouse, lord: l.lord })),
          description: `Lords of houses ${lords.map(l => l.originalHouse).join(', ')} conjunct in ${house}${this.getOrdinalSuffix(parseInt(house))} house`,
          effects: this.getConjunctionEffects(lords)
        });
      }
    });

    // Find exchanges (mutual reception)
    this.findExchanges(lordPlacements, relationships);

    // Analyze house connections
    this.analyzeHouseConnections(lordPlacements, relationships);

    return relationships;
  }

  /**
   * Find mutual exchanges between house lords
   * @param {Object} lordPlacements - Lord placements
   * @param {Object} relationships - Relationships object to update
   */
  static findExchanges(lordPlacements, relationships) {
    const placements = Object.values(lordPlacements).filter(p => p.placement);

    for (let i = 0; i < placements.length; i++) {
      for (let j = i + 1; j < placements.length; j++) {
        const lord1 = placements[i];
        const lord2 = placements[j];

        // Check if they are in each other's houses
        if (lord1.placement.house === lord2.originalHouse &&
            lord2.placement.house === lord1.originalHouse) {
          relationships.exchanges.push({
            houses: [lord1.originalHouse, lord2.originalHouse],
            lords: [lord1.lord, lord2.lord],
            description: `Exchange between ${lord1.originalHouse}${this.getOrdinalSuffix(lord1.originalHouse)} and ${lord2.originalHouse}${this.getOrdinalSuffix(lord2.originalHouse)} houses`,
            effects: this.getExchangeEffects(lord1.originalHouse, lord2.originalHouse),
            strength: this.calculateExchangeStrength(lord1.originalHouse, lord2.originalHouse)
          });
        }
      }
    }
  }

  /**
   * Analyze house connections and yogas
   * @param {Object} lordPlacements - Lord placements
   * @param {Object} relationships - Relationships object to update
   */
  static analyzeHouseConnections(lordPlacements, relationships) {
    // Kendra-Trikona connections (Raja Yoga)
    const kendraHouses = [1, 4, 7, 10];
    const trikonaHouses = [1, 5, 9];

    relationships.houseConnections.rajaYogas = this.findRajaYogas(lordPlacements, kendraHouses, trikonaHouses);

    // Dhana Yoga connections
    const dhanaHouses = [2, 5, 9, 11];
    relationships.houseConnections.dhanaYogas = this.findDhanaYogas(lordPlacements, dhanaHouses);

    // Dusthana connections
    const dusthanaHouses = [6, 8, 12];
    relationships.houseConnections.dusthanaConnections = this.findDusthanaConnections(lordPlacements, dusthanaHouses);
  }

  /**
   * Generate effects for house lord analysis
   * @param {Object} lordAnalysis - Complete lord analysis
   * @returns {Object} House-wise effects
   */
  static generateHouseEffects(lordAnalysis) {
    const effects = {};

    Object.entries(lordAnalysis).forEach(([house, analysis]) => {
      if (analysis.error) {
        effects[house] = { error: analysis.error };
        return;
      }

      const houseNum = parseInt(house);
      const significations = this.getHouseSignifications(houseNum);
      const condition = analysis.houseCondition;

      effects[house] = {
        house: houseNum,
        significations,
        condition: condition.grade,
        effects: this.generateSpecificHouseEffects(houseNum, condition, analysis.placement),
        timing: analysis.timing,
        recommendations: this.getHouseRecommendations(houseNum, condition)
      };
    });

    return effects;
  }

  // Helper methods

  static calculateHouseDistance(fromHouse, toHouse) {
    let distance = toHouse - fromHouse;
    if (distance <= 0) distance += 12;
    return distance;
  }

  static getOrdinalSuffix(num) {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return 'st';
    if (j === 2 && k !== 12) return 'nd';
    if (j === 3 && k !== 13) return 'rd';
    return 'th';
  }

  static calculateDignityStrength(planet, sign, dignity) {
    // Comprehensive dignity calculation with multiple factors
    let dignityStrength = 55; // Base neutral strength
    let dignityFactors = [];

    // Primary dignity analysis
    switch (dignity?.toLowerCase()) {
      case 'exalted':
      case 'exaltation':
        dignityStrength = 100;
        dignityFactors.push('Maximum exaltation strength');
        break;
      case 'moolatrikona':
        dignityStrength = 95;
        dignityFactors.push('Excellent moolatrikona strength');
        break;
      case 'own':
      case 'ownsign':
        dignityStrength = 85;
        dignityFactors.push('Strong own sign placement');
        break;
      case 'debilitated':
      case 'debilitation':
        dignityStrength = 15;
        dignityFactors.push('Weak debilitation placement');

        // Check for Neecha Bhanga (cancellation of debilitation)
        const neechaBhangaStrength = this.checkNeechaBhangaYoga(planet, sign);
        if (neechaBhangaStrength > 0) {
          dignityStrength += neechaBhangaStrength;
          dignityFactors.push(`Neecha Bhanga adds ${neechaBhangaStrength} points`);
        }
        break;
      case 'friend':
      case 'friendly':
        dignityStrength = 72;
        dignityFactors.push('Good friendly sign strength');
        break;
      case 'enemy':
        dignityStrength = 38;
        dignityFactors.push('Challenging enemy sign placement');
        break;
      case 'neutral':
        dignityStrength = 55;
        dignityFactors.push('Neutral sign placement');
        break;
      default:
        // Detailed friendship/enmity analysis
        const relationshipData = this.calculateDetailedRelationship(planet, sign);
        dignityStrength = relationshipData.strength;
        dignityFactors.push(relationshipData.description);
    }

    // Additional factors affecting dignity

    // Factor 1: Planetary aspects affecting dignity
    const aspectualModifications = this.calculateAspectualDignityModifications(planet);
    dignityStrength += aspectualModifications.bonus;
    if (aspectualModifications.bonus !== 0) {
      dignityFactors.push(`Aspectual modifications: ${aspectualModifications.description}`);
    }

    // Factor 2: Vargottama status (same sign in D1 and D9)
    if (this.isVargottama(planet, sign)) {
      dignityStrength += 10;
      dignityFactors.push('Vargottama bonus: +10 points');
    }

    // Factor 3: Pushkara Navamsa/Bhaga
    const pushkaraBonus = this.calculatePushkaraBonus(planet, sign);
    if (pushkaraBonus > 0) {
      dignityStrength += pushkaraBonus;
      dignityFactors.push(`Pushkara bonus: +${pushkaraBonus} points`);
    }

    // Factor 4: Planetary war considerations (if applicable)
    const warPenalty = this.calculatePlanetaryWarPenalty(planet);
    if (warPenalty > 0) {
      dignityStrength -= warPenalty;
      dignityFactors.push(`Planetary war penalty: -${warPenalty} points`);
    }

    // Ensure strength stays within bounds
    dignityStrength = Math.max(5, Math.min(100, dignityStrength));

    return {
      strength: Math.round(dignityStrength),
      dignity: dignity,
      factors: dignityFactors,
      grade: this.getStrengthGrade(dignityStrength),
      detailed: {
        base: dignity?.toLowerCase() || 'neutral',
        neechaBhanga: dignity?.toLowerCase() === 'debilitated' ? this.checkNeechaBhangaYoga(planet, sign) : 0,
        vargottama: this.isVargottama(planet, sign),
        pushkara: pushkaraBonus,
        aspectual: aspectualModifications.bonus,
        planetaryWar: warPenalty
      }
    };
  }

  static calculateHouseStrength(house) {
    // Kendra houses
    if ([1, 4, 7, 10].includes(house)) return 85;
    // Trikona houses
    if ([5, 9].includes(house)) return 90;
    // Upachaya houses
    if ([3, 6, 11].includes(house)) return 70;
    // Dusthana houses
    if ([8, 12].includes(house)) return 30;
    // Others
    return 60;
  }

  static calculateDegreeStrength(degree) {
    // Middle degrees are stronger
    const distance = Math.abs(degree - 15);
    return Math.max(40, 100 - (distance * 2));
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

  static getHouseStatus(score) {
    if (score >= 70) return 'Strong';
    if (score >= 50) return 'Moderate';
    return 'Weak';
  }

  static determinePlacementType(originalHouse, placementHouse) {
    const distance = this.calculateHouseDistance(originalHouse, placementHouse);

    if (distance === 1) return 'Self-placed';
    if (distance === 11) return 'Gains-oriented';
    if (distance === 9) return 'Fortune-bringing';
    if (distance === 5) return 'Creative';
    if (distance === 10) return 'Achievement-focused';
    if (distance === 8) return 'Transformative';
    if (distance === 12) return 'Loss-indicating';

    return 'Mixed results';
  }

  static getHouseNature(house) {
    if ([1, 4, 7, 10].includes(house)) return { type: 'Kendra', strength: 85 };
    if ([1, 5, 9].includes(house)) return { type: 'Trikona', strength: 90 };
    if ([3, 6, 10, 11].includes(house)) return { type: 'Upachaya', strength: 70 };
    if ([6, 8, 12].includes(house)) return { type: 'Dusthana', strength: 30 };
    return { type: 'Neutral', strength: 60 };
  }

  static getCombinedHouseEffects(house1, house2) {
    return `Combination of ${house1}${this.getOrdinalSuffix(house1)} and ${house2}${this.getOrdinalSuffix(house2)} house energies`;
  }

  static calculatePlacementStrength(placementType, houseNature) {
    // Comprehensive placement strength calculation
    let placementStrength = houseNature.strength; // Base from house nature
    let placementFactors = [];

    // Factor 1: Placement type modifiers
    const typeModifiers = {
      'Self-placed': 15,
      'Fortune-bringing': 12,
      'Gains-oriented': 10,
      'Creative': 8,
      'Achievement-focused': 9,
      'Wealth-focused': 7,
      'Partnership-focused': 6,
      'Service-oriented': 5,
      'Effort-based': 4,
      'Comfort-seeking': 6,
      'Transformative': -5,
      'Loss-indicating': -10
    };

    const typeBonus = typeModifiers[placementType] || 0;
    placementStrength += typeBonus;
    placementFactors.push(`${placementType}: ${typeBonus >= 0 ? '+' : ''}${typeBonus} points`);

    // Factor 2: House combination analysis
    const houseType = houseNature.type;
    const combinationBonuses = {
      'Kendra': { bonus: 10, description: 'Angular house strength' },
      'Trikona': { bonus: 15, description: 'Trinal house fortune' },
      'Upachaya': { bonus: 5, description: 'Growing house potential' },
      'Dusthana': { bonus: -15, description: 'Challenging house placement' },
      'Neutral': { bonus: 0, description: 'Standard house placement' }
    };

    const houseBonus = combinationBonuses[houseType] || combinationBonuses['Neutral'];
    placementStrength += houseBonus.bonus;
    placementFactors.push(`${houseType} house: ${houseBonus.description}`);

    // Factor 3: Special placement considerations
    if (placementType === 'Self-placed' && houseType === 'Trikona') {
      placementStrength += 5; // Extra bonus for lord in own trikona house
      placementFactors.push('Own trikona placement bonus: +5 points');
    }

    if (placementType === 'Self-placed' && houseType === 'Kendra') {
      placementStrength += 3; // Extra bonus for lord in own kendra house
      placementFactors.push('Own kendra placement bonus: +3 points');
    }

    // Factor 4: Avoid negative multipliers for certain combinations
    if (houseType === 'Dusthana' && placementType !== 'Self-placed') {
      const dusthanaPenalty = this.calculateDusthanaPenalty(placementType);
      placementStrength += dusthanaPenalty; // Additional penalty
      placementFactors.push(`Dusthana penalty: ${dusthanaPenalty} points`);
    }

    // Factor 5: Upachaya house special rules
    if (houseType === 'Upachaya') {
      const upachayaBonus = this.calculateUpachayaBonus(placementType);
      placementStrength += upachayaBonus;
      placementFactors.push(`Upachaya growth factor: +${upachayaBonus} points`);
    }

    // Ensure strength stays within reasonable bounds
    placementStrength = Math.max(10, Math.min(100, placementStrength));

    return {
      strength: Math.round(placementStrength),
      factors: placementFactors,
      baseHouseStrength: houseNature.strength,
      typeModifier: typeBonus,
      houseTypeBonus: houseBonus.bonus,
      grade: this.getStrengthGrade(placementStrength),
      analysis: `${placementType} in ${houseType} house: ${this.getStrengthGrade(placementStrength)} strength`
    };
  }

  static getHouseSignifications(house) {
    const significations = {
      1: ['Self', 'Personality', 'Health', 'Vitality', 'Appearance'],
      2: ['Wealth', 'Family', 'Speech', 'Food', 'Values'],
      3: ['Siblings', 'Courage', 'Communication', 'Short journeys', 'Efforts'],
      4: ['Home', 'Mother', 'Comfort', 'Education', 'Property'],
      5: ['Children', 'Creativity', 'Intelligence', 'Romance', 'Speculation'],
      6: ['Health', 'Service', 'Enemies', 'Debts', 'Daily work'],
      7: ['Marriage', 'Partnership', 'Business', 'Travel', 'Public relations'],
      8: ['Longevity', 'Transformation', 'Occult', 'Inheritance', 'Sudden events'],
      9: ['Fortune', 'Spirituality', 'Father', 'Higher learning', 'Long journeys'],
      10: ['Career', 'Status', 'Reputation', 'Authority', 'Public image'],
      11: ['Gains', 'Friends', 'Wishes', 'Income', 'Elder siblings'],
      12: ['Losses', 'Spirituality', 'Foreign', 'Liberation', 'Expenses']
    };

    return significations[house] || [];
  }

  static getHouseTiming(lord, house) {
    return {
      primary: `During ${lord} Mahadasha/Antardasha`,
      secondary: `When ${lord} is transiting important houses`,
      activation: `${house}${this.getOrdinalSuffix(house)} house activations`
    };
  }

  static generateStrengthDescription(lord, strength, placement) {
    return `${lord} has ${this.getStrengthGrade(strength)} strength in ${placement.sign} (${placement.house}${this.getOrdinalSuffix(placement.house)} house)`;
  }

  static generatePlacementDescription(originalHouse, placementHouse, lord, placementType) {
    return `${originalHouse}${this.getOrdinalSuffix(originalHouse)} lord ${lord} in ${placementHouse}${this.getOrdinalSuffix(placementHouse)} house - ${placementType}`;
  }

  static generateConditionDescription(score) {
    if (score >= 70) return 'House is well-supported and likely to give good results';
    if (score >= 50) return 'House shows moderate strength with mixed results';
    return 'House may face challenges and requires attention';
  }

  static generateSpecificHouseEffects(house, condition, placement) {
    const effects = [];
    const significations = this.getHouseSignifications(house);

    significations.forEach(sig => {
      if (condition.score >= 70) {
        effects.push(`Good results in ${sig.toLowerCase()}`);
      } else if (condition.score >= 50) {
        effects.push(`Mixed results in ${sig.toLowerCase()}`);
      } else {
        effects.push(`Challenges possible in ${sig.toLowerCase()}`);
      }
    });

    return effects;
  }

  static getHouseRecommendations(house, condition) {
    const recommendations = [];

    if (condition.score < 60) {
      recommendations.push(`Strengthen ${house}${this.getOrdinalSuffix(house)} house lord through remedies`);
      recommendations.push(`Focus on ${house}${this.getOrdinalSuffix(house)} house significations`);
    }

    recommendations.push(`Pay attention during ${house}${this.getOrdinalSuffix(house)} house related periods`);

    return recommendations;
  }

  static getConjunctionEffects(lords) {
    return `Combined effects of houses ${lords.map(l => l.originalHouse).join(', ')}`;
  }

  static getExchangeEffects(house1, house2) {
    return `Strong connection between ${house1}${this.getOrdinalSuffix(house1)} and ${house2}${this.getOrdinalSuffix(house2)} house matters`;
  }

  static calculateExchangeStrength(house1, house2) {
    // Comprehensive exchange strength calculation based on house natures and combinations
    let exchangeStrength = 50; // Base strength
    let analysisFactors = [];

    // Define house categories
    const houseCategories = {
      kendra: [1, 4, 7, 10],
      trikona: [1, 5, 9],
      upachaya: [3, 6, 10, 11],
      dusthana: [6, 8, 12],
      wealth: [2, 11],
      dharma: [1, 5, 9],
      artha: [2, 6, 10],
      kama: [3, 7, 11],
      moksha: [4, 8, 12]
    };

    // Determine categories for both houses
    const house1Categories = this.getHouseCategories(house1, houseCategories);
    const house2Categories = this.getHouseCategories(house2, houseCategories);

    // Factor 1: Kendra-Trikona exchanges (Maha Raja Yoga)
    if (this.isKendraTrikonaExchange(house1, house2, houseCategories)) {
      exchangeStrength = 95;
      analysisFactors.push('Maha Raja Yoga: Kendra-Trikona exchange');
    }
    // Factor 2: Both Trikona houses (Raja Yoga)
    else if (houseCategories.trikona.includes(house1) && houseCategories.trikona.includes(house2)) {
      exchangeStrength = 90;
      analysisFactors.push('Raja Yoga: Both houses are Trikona');
    }
    // Factor 3: Both Kendra houses (Strong exchange)
    else if (houseCategories.kendra.includes(house1) && houseCategories.kendra.includes(house2)) {
      exchangeStrength = 85;
      analysisFactors.push('Strong exchange: Both houses are Kendra');
    }
    // Factor 4: Wealth houses exchange (Dhana Yoga)
    else if (this.isWealthExchange(house1, house2)) {
      exchangeStrength = 80;
      analysisFactors.push('Dhana Yoga: Wealth houses exchange');
    }
    // Factor 5: Dusthana exchange (Vipareeta Raja Yoga potential)
    else if (houseCategories.dusthana.includes(house1) && houseCategories.dusthana.includes(house2)) {
      exchangeStrength = 45;
      analysisFactors.push('Challenging exchange: Both houses are Dusthana');

      // Check for Vipareeta Raja Yoga
      if (this.hasVipareetaRajaYoga(house1, house2)) {
        exchangeStrength += 30;
        analysisFactors.push('Vipareeta Raja Yoga modification: +30 points');
      }
    }
    // Factor 6: Mixed exchanges (one good, one challenging)
    else if (this.isMixedExchange(house1, house2, houseCategories)) {
      const mixedAnalysis = this.analyzeMixedExchange(house1, house2, houseCategories);
      exchangeStrength = mixedAnalysis.strength;
      analysisFactors.push(mixedAnalysis.description);
    }
    // Factor 7: Neutral exchanges
    else {
      exchangeStrength = 65;
      analysisFactors.push('Moderate exchange: Mixed house natures');
    }

    // Additional modifying factors

    // Factor 8: House distance considerations
    const distance = Math.abs(house1 - house2);
    const distanceBonus = this.calculateExchangeDistanceBonus(distance);
    exchangeStrength += distanceBonus.bonus;
    if (distanceBonus.bonus !== 0) {
      analysisFactors.push(distanceBonus.description);
    }

    // Factor 9: Planetary friendship in exchange
    const friendshipBonus = this.calculateExchangeFriendshipBonus(house1, house2);
    exchangeStrength += friendshipBonus;
    if (friendshipBonus !== 0) {
      analysisFactors.push(`Planetary friendship: ${friendshipBonus >= 0 ? '+' : ''}${friendshipBonus} points`);
    }

    // Factor 10: Temporal relationships (same element, etc.)
    const elementalBonus = this.calculateElementalHarmony(house1, house2);
    exchangeStrength += elementalBonus;
    if (elementalBonus !== 0) {
      analysisFactors.push(`Elemental harmony: ${elementalBonus >= 0 ? '+' : ''}${elementalBonus} points`);
    }

    // Ensure strength stays within bounds
    exchangeStrength = Math.max(20, Math.min(100, exchangeStrength));

    return {
      strength: Math.round(exchangeStrength),
      grade: this.getStrengthGrade(exchangeStrength),
      type: this.getExchangeType(exchangeStrength),
      factors: analysisFactors,
      house1Categories: house1Categories,
      house2Categories: house2Categories,
      yogaType: this.identifyExchangeYoga(house1, house2),
      recommendations: this.getExchangeRecommendations(exchangeStrength, house1, house2)
    };
  }

  static findRajaYogas(lordPlacements, kendraHouses, trikonaHouses) {
    // Comprehensive Raja Yoga detection based on classical principles
    const rajaYogas = [];

    // Type 1: Kendra-Trikona lord conjunctions
    const kendraLords = this.getLordsOfHouses(lordPlacements, kendraHouses);
    const trikonaLords = this.getLordsOfHouses(lordPlacements, trikonaHouses);

    // Find conjunctions between Kendra and Trikona lords
    for (const kendraLord of kendraLords) {
      for (const trikonaLord of trikonaLords) {
        if (kendraLord.house === trikonaLord.house) continue; // Same house

        const conjunction = this.checkLordConjunction(kendraLord, trikonaLord, lordPlacements);
        if (conjunction.isConjunct) {
          rajaYogas.push({
            type: 'Kendra-Trikona Conjunction',
            subtype: 'Classical Raja Yoga',
            lords: [kendraLord, trikonaLord],
            house: conjunction.house,
            strength: this.calculateRajaYogaStrength(kendraLord.house, trikonaLord.house, conjunction.house),
            description: `${kendraLord.house}th lord and ${trikonaLord.house}th lord conjunct in ${conjunction.house}th house`,
            effects: this.getRajaYogaEffects(kendraLord.house, trikonaLord.house),
            timing: this.getRajaYogaTiming(kendraLord.lord, trikonaLord.lord),
            grade: this.getRajaYogaGrade(kendraLord.house, trikonaLord.house, conjunction.house)
          });
        }
      }
    }

    // Type 2: Kendra-Trikona lord mutual aspects
    for (const kendraLord of kendraLords) {
      for (const trikonaLord of trikonaLords) {
        if (kendraLord.house === trikonaLord.house) continue;

        const aspect = this.checkMutualAspect(kendraLord, trikonaLord, lordPlacements);
        if (aspect.hasAspect) {
          rajaYogas.push({
            type: 'Kendra-Trikona Aspect',
            subtype: 'Aspect Raja Yoga',
            lords: [kendraLord, trikonaLord],
            aspectType: aspect.aspectType,
            strength: this.calculateAspectRajaYogaStrength(aspect),
            description: `${kendraLord.house}th lord ${aspect.aspectType} ${trikonaLord.house}th lord`,
            effects: this.getAspectRajaYogaEffects(kendraLord.house, trikonaLord.house, aspect.aspectType),
            timing: this.getRajaYogaTiming(kendraLord.lord, trikonaLord.lord),
            grade: this.getAspectRajaYogaGrade(aspect)
          });
        }
      }
    }

    // Type 3: Exchange Raja Yogas (Parivartana)
    const exchanges = this.findKendraTrikonaExchanges(lordPlacements, kendraHouses, trikonaHouses);
    for (const exchange of exchanges) {
      rajaYogas.push({
        type: 'Parivartana Raja Yoga',
        subtype: 'Exchange Raja Yoga',
        lords: exchange.lords,
        houses: exchange.houses,
        strength: exchange.strength,
        description: `Exchange between ${exchange.houses[0]}th and ${exchange.houses[1]}th lords`,
        effects: this.getExchangeRajaYogaEffects(exchange.houses[0], exchange.houses[1]),
        timing: this.getRajaYogaTiming(exchange.lords[0], exchange.lords[1]),
        grade: this.getExchangeRajaYogaGrade(exchange.houses[0], exchange.houses[1])
      });
    }

    // Type 4: Special Raja Yogas (1st lord in Kendra/Trikona, etc.)
    const lagnaLord = lordPlacements[1];
    if (lagnaLord?.placement) {
      const lagnaLordHouse = lagnaLord.placement.house;

      // Lagna lord in Kendra (other than 1st)
      if (kendraHouses.includes(lagnaLordHouse) && lagnaLordHouse !== 1) {
        rajaYogas.push({
          type: 'Lagna Lord Kendra',
          subtype: 'Lagna Lord Raja Yoga',
          lords: [lagnaLord],
          house: lagnaLordHouse,
          strength: 75,
          description: `Lagna lord in ${lagnaLordHouse}th house (Kendra)`,
          effects: ['Strong personality and leadership', 'Success through own efforts'],
          timing: this.getLagnaLordTiming(lagnaLord.lord),
          grade: 'Good'
        });
      }

      // Lagna lord in Trikona (other than 1st)
      if (trikonaHouses.includes(lagnaLordHouse) && lagnaLordHouse !== 1) {
        rajaYogas.push({
          type: 'Lagna Lord Trikona',
          subtype: 'Lagna Lord Raja Yoga',
          lords: [lagnaLord],
          house: lagnaLordHouse,
          strength: 80,
          description: `Lagna lord in ${lagnaLordHouse}th house (Trikona)`,
          effects: ['Good fortune and prosperity', 'Dharmic success'],
          timing: this.getLagnaLordTiming(lagnaLord.lord),
          grade: 'Very Good'
        });
      }
    }

    // Sort by strength (strongest first)
    rajaYogas.sort((a, b) => b.strength - a.strength);

    return {
      yogas: rajaYogas,
      totalCount: rajaYogas.length,
      strongestYoga: rajaYogas[0],
      averageStrength: rajaYogas.length > 0 ?
        rajaYogas.reduce((sum, yoga) => sum + yoga.strength, 0) / rajaYogas.length : 0,
      summary: this.createRajaYogaSummary(rajaYogas)
    };
  }

  static findDhanaYogas(lordPlacements, dhanaHouses) {
    // Comprehensive Dhana Yoga detection for wealth and prosperity
    const dhanaYogas = [];

    // Classical Dhana houses: 2nd, 5th, 9th, 11th
    const dhanaLords = this.getLordsOfHouses(lordPlacements, dhanaHouses);
    const lagnaLord = lordPlacements[1];

    // Type 1: Dhana lord conjunctions
    for (let i = 0; i < dhanaLords.length; i++) {
      for (let j = i + 1; j < dhanaLords.length; j++) {
        const lord1 = dhanaLords[i];
        const lord2 = dhanaLords[j];

        const conjunction = this.checkLordConjunction(lord1, lord2, lordPlacements);
        if (conjunction.isConjunct) {
          const yogaStrength = this.calculateDhanaYogaStrength(lord1.house, lord2.house, conjunction.house);

          dhanaYogas.push({
            type: 'Dhana Lord Conjunction',
            subtype: this.getDhanaYogaSubtype(lord1.house, lord2.house),
            lords: [lord1, lord2],
            house: conjunction.house,
            strength: yogaStrength,
            description: `${lord1.house}th lord and ${lord2.house}th lord conjunct in ${conjunction.house}th house`,
            effects: this.getDhanaYogaEffects(lord1.house, lord2.house),
            wealthPotential: this.calculateWealthPotential(lord1.house, lord2.house, conjunction.house),
            timing: this.getDhanaYogaTiming(lord1.lord, lord2.lord),
            grade: this.getDhanaYogaGrade(yogaStrength)
          });
        }
      }
    }

    // Type 2: Lagna lord with Dhana lords
    if (lagnaLord?.placement) {
      for (const dhanaLord of dhanaLords) {
        const conjunction = this.checkLordConjunction(lagnaLord, dhanaLord, lordPlacements);
        if (conjunction.isConjunct) {
          dhanaYogas.push({
            type: 'Lagna-Dhana Conjunction',
            subtype: 'Self-Wealth Yoga',
            lords: [lagnaLord, dhanaLord],
            house: conjunction.house,
            strength: this.calculateLagnaDhanaYogaStrength(dhanaLord.house, conjunction.house),
            description: `Lagna lord and ${dhanaLord.house}th lord conjunct in ${conjunction.house}th house`,
            effects: ['Wealth through own efforts', 'Strong financial acumen'],
            wealthPotential: 'High',
            timing: this.getDhanaYogaTiming(lagnaLord.lord, dhanaLord.lord),
            grade: 'Very Good'
          });
        }
      }
    }

    // Type 3: Dhana house exchanges (Parivartana)
    for (let i = 0; i < dhanaHouses.length; i++) {
      for (let j = i + 1; j < dhanaHouses.length; j++) {
        const house1 = dhanaHouses[i];
        const house2 = dhanaHouses[j];

        const exchange = this.checkHouseExchange(house1, house2, lordPlacements);
        if (exchange.hasExchange) {
          dhanaYogas.push({
            type: 'Dhana Parivartana',
            subtype: 'Wealth Exchange Yoga',
            lords: exchange.lords,
            houses: [house1, house2],
            strength: this.calculateDhanaExchangeStrength(house1, house2),
            description: `Exchange between ${house1}th and ${house2}th lords`,
            effects: this.getDhanaExchangeEffects(house1, house2),
            wealthPotential: 'Very High',
            timing: this.getDhanaYogaTiming(exchange.lords[0], exchange.lords[1]),
            grade: 'Excellent'
          });
        }
      }
    }

    // Type 4: Dhana lords in Kendra houses
    const kendraHouses = [1, 4, 7, 10];
    for (const dhanaLord of dhanaLords) {
      if (dhanaLord.placement && kendraHouses.includes(dhanaLord.placement.house)) {
        dhanaYogas.push({
          type: 'Dhana Lord in Kendra',
          subtype: 'Kendra Dhana Yoga',
          lords: [dhanaLord],
          house: dhanaLord.placement.house,
          strength: 70,
          description: `${dhanaLord.house}th lord in ${dhanaLord.placement.house}th house (Kendra)`,
          effects: ['Steady wealth accumulation', 'Financial stability'],
          wealthPotential: 'Good',
          timing: this.getDhanaLordTiming(dhanaLord.lord),
          grade: 'Good'
        });
      }
    }

    // Type 5: Multiple dhana lords in the same house
    const houseGroups = this.groupLordsByHouse(dhanaLords);
    for (const [house, lords] of Object.entries(houseGroups)) {
      if (lords.length >= 2) {
        dhanaYogas.push({
          type: 'Multiple Dhana Lords',
          subtype: 'Concentrated Wealth Yoga',
          lords: lords,
          house: parseInt(house),
          strength: this.calculateMultipleDhanaLordStrength(lords, parseInt(house)),
          description: `Multiple wealth lords in ${house}th house`,
          effects: ['Concentrated wealth potential', 'Strong financial focus'],
          wealthPotential: 'Very High',
          timing: this.getMultipleLordTiming(lords.map(l => l.lord)),
          grade: 'Excellent'
        });
      }
    }

    // Type 6: Special combinations (2-11, 5-9 exchanges)
    const specialCombinations = [
      { houses: [2, 11], name: 'Ultimate Wealth Exchange' },
      { houses: [5, 9], name: 'Fortune-Prosperity Exchange' }
    ];

    for (const combination of specialCombinations) {
      const exchange = this.checkHouseExchange(combination.houses[0], combination.houses[1], lordPlacements);
      if (exchange.hasExchange) {
        dhanaYogas.push({
          type: 'Special Dhana Exchange',
          subtype: combination.name,
          lords: exchange.lords,
          houses: combination.houses,
          strength: 90,
          description: `${combination.name}: ${combination.houses[0]}-${combination.houses[1]} exchange`,
          effects: this.getSpecialDhanaEffects(combination.houses[0], combination.houses[1]),
          wealthPotential: 'Exceptional',
          timing: this.getDhanaYogaTiming(exchange.lords[0], exchange.lords[1]),
          grade: 'Outstanding'
        });
      }
    }

    // Sort by strength
    dhanaYogas.sort((a, b) => b.strength - a.strength);

    return {
      yogas: dhanaYogas,
      totalCount: dhanaYogas.length,
      strongestYoga: dhanaYogas[0],
      averageStrength: dhanaYogas.length > 0 ?
        dhanaYogas.reduce((sum, yoga) => sum + yoga.strength, 0) / dhanaYogas.length : 0,
      wealthPotential: this.assessOverallWealthPotential(dhanaYogas),
      summary: this.createDhanaYogaSummary(dhanaYogas)
    };
  }

  static findDusthanaConnections(lordPlacements, dusthanaHouses) {
    // Comprehensive Dusthana connection analysis for challenges and remedial insights
    const dusthanaConnections = [];

    // Dusthana houses: 6th (enemies, debts), 8th (transformation, obstacles), 12th (losses, liberation)
    const dusthanaLords = this.getLordsOfHouses(lordPlacements, dusthanaHouses);
    const beneficHouses = [1, 4, 5, 7, 9, 10, 11];
    const lagnaLord = lordPlacements[1];

    // Type 1: Dusthana lord conjunctions
    for (let i = 0; i < dusthanaLords.length; i++) {
      for (let j = i + 1; j < dusthanaLords.length; j++) {
        const lord1 = dusthanaLords[i];
        const lord2 = dusthanaLords[j];

        const conjunction = this.checkLordConjunction(lord1, lord2, lordPlacements);
        if (conjunction.isConjunct) {
          const connectionStrength = this.calculateDusthanaConnectionStrength(lord1.house, lord2.house, conjunction.house);

          dusthanaConnections.push({
            type: 'Dusthana Lord Conjunction',
            subtype: this.getDusthanaConnectionSubtype(lord1.house, lord2.house),
            lords: [lord1, lord2],
            house: conjunction.house,
            strength: connectionStrength,
            severity: this.getDusthanaSeverity(lord1.house, lord2.house, conjunction.house),
            description: `${lord1.house}th lord and ${lord2.house}th lord conjunct in ${conjunction.house}th house`,
            challenges: this.getDusthanaConnectionChallenges(lord1.house, lord2.house),
            vipareetaYoga: this.checkVipareetaRajaYoga(lord1.house, lord2.house, conjunction.house),
            remedies: this.getDusthanaConnectionRemedies(lord1.house, lord2.house),
            timing: this.getDusthanaTiming(lord1.lord, lord2.lord),
            grade: this.getDusthanaGrade(connectionStrength)
          });
        }
      }
    }

    // Type 2: Benefic lords with Dusthana lords
    const beneficLords = this.getLordsOfHouses(lordPlacements, beneficHouses);
    for (const beneficLord of beneficLords) {
      for (const dusthanaLord of dusthanaLords) {
        const conjunction = this.checkLordConjunction(beneficLord, dusthanaLord, lordPlacements);
        if (conjunction.isConjunct) {
          dusthanaConnections.push({
            type: 'Benefic-Dusthana Conjunction',
            subtype: 'Mixed Influence Connection',
            lords: [beneficLord, dusthanaLord],
            house: conjunction.house,
            strength: this.calculateMixedConnectionStrength(beneficLord.house, dusthanaLord.house, conjunction.house),
            severity: 'Moderate',
            description: `${beneficLord.house}th lord and ${dusthanaLord.house}th lord conjunct in ${conjunction.house}th house`,
            challenges: this.getMixedConnectionChallenges(beneficLord.house, dusthanaLord.house),
            mitigation: this.getBeneficMitigation(beneficLord.house, dusthanaLord.house),
            remedies: this.getMixedConnectionRemedies(beneficLord.house, dusthanaLord.house),
            timing: this.getDusthanaTiming(beneficLord.lord, dusthanaLord.lord),
            grade: 'Moderate Challenge'
          });
        }
      }
    }

    // Type 3: Dusthana house exchanges (Parivartana)
    for (let i = 0; i < dusthanaHouses.length; i++) {
      for (let j = i + 1; j < dusthanaHouses.length; j++) {
        const house1 = dusthanaHouses[i];
        const house2 = dusthanaHouses[j];

        const exchange = this.checkHouseExchange(house1, house2, lordPlacements);
        if (exchange.hasExchange) {
          const vipareetaYoga = this.analyzeVipareetaRajaYoga(house1, house2);

          dusthanaConnections.push({
            type: 'Dusthana Parivartana',
            subtype: vipareetaYoga.isPresent ? 'Vipareeta Raja Yoga' : 'Dusthana Exchange',
            lords: exchange.lords,
            houses: [house1, house2],
            strength: this.calculateDusthanaExchangeStrength(house1, house2),
            severity: vipareetaYoga.isPresent ? 'Transformative' : 'High',
            description: `Exchange between ${house1}th and ${house2}th lords`,
            challenges: this.getDusthanaExchangeChallenges(house1, house2),
            vipareetaYoga: vipareetaYoga,
            transformation: vipareetaYoga.isPresent ? vipareetaYoga.transformation : null,
            remedies: this.getDusthanaExchangeRemedies(house1, house2),
            timing: this.getDusthanaTiming(exchange.lords[0], exchange.lords[1]),
            grade: vipareetaYoga.isPresent ? 'Potentially Beneficial' : 'Challenging'
          });
        }
      }
    }

    // Type 4: Lagna lord with Dusthana lords
    if (lagnaLord?.placement) {
      for (const dusthanaLord of dusthanaLords) {
        const conjunction = this.checkLordConjunction(lagnaLord, dusthanaLord, lordPlacements);
        if (conjunction.isConjunct) {
          dusthanaConnections.push({
            type: 'Lagna-Dusthana Conjunction',
            subtype: 'Personal Challenge Connection',
            lords: [lagnaLord, dusthanaLord],
            house: conjunction.house,
            strength: this.calculateLagnaDusthanaStrength(dusthanaLord.house, conjunction.house),
            severity: 'High',
            description: `Lagna lord and ${dusthanaLord.house}th lord conjunct in ${conjunction.house}th house`,
            challenges: ['Personal struggles', 'Health or financial challenges possible'],
            personalImpact: this.getLagnaDusthanaImpact(dusthanaLord.house),
            remedies: this.getLagnaDusthanaRemedies(dusthanaLord.house),
            timing: this.getDusthanaTiming(lagnaLord.lord, dusthanaLord.lord),
            grade: 'Significant Challenge'
          });
        }
      }
    }

    // Type 5: Dusthana lords in benefic houses
    for (const dusthanaLord of dusthanaLords) {
      if (dusthanaLord.placement && beneficHouses.includes(dusthanaLord.placement.house)) {
        const placement = dusthanaLord.placement.house;
        const mitigationLevel = this.calculateDusthanaMitigation(dusthanaLord.house, placement);

        dusthanaConnections.push({
          type: 'Dusthana Lord in Benefic House',
          subtype: 'Mitigated Dusthana Influence',
          lords: [dusthanaLord],
          house: placement,
          strength: mitigationLevel.strength,
          severity: mitigationLevel.severity,
          description: `${dusthanaLord.house}th lord in ${placement}th house`,
          challenges: this.getMitigatedChallenges(dusthanaLord.house, placement),
          mitigation: mitigationLevel.mitigation,
          positiveAspects: mitigationLevel.positiveAspects,
          remedies: this.getMitigatedRemedies(dusthanaLord.house, placement),
          timing: this.getDusthanaLordTiming(dusthanaLord.lord),
          grade: 'Manageable Challenge'
        });
      }
    }

    // Sort by severity and strength
    dusthanaConnections.sort((a, b) => {
      const severityOrder = { 'High': 3, 'Moderate': 2, 'Manageable': 1, 'Transformative': 0 };
      const aSeverity = severityOrder[a.severity] || 1;
      const bSeverity = severityOrder[b.severity] || 1;

      if (aSeverity !== bSeverity) return bSeverity - aSeverity;
      return b.strength - a.strength;
    });

    return {
      connections: dusthanaConnections,
      totalCount: dusthanaConnections.length,
      mostChallenging: dusthanaConnections[0],
      vipareetaYogas: dusthanaConnections.filter(c => c.vipareetaYoga?.isPresent),
      averageSeverity: this.calculateAverageSeverity(dusthanaConnections),
      overallImpact: this.assessOverallDusthanaImpact(dusthanaConnections),
      remedialPriorities: this.prioritizeDusthanaRemedies(dusthanaConnections),
      summary: this.createDusthanaConnectionSummary(dusthanaConnections)
    };
  }

  static generateSummary(lordAnalysis) {
    const strongHouses = [];
    const weakHouses = [];

    Object.entries(lordAnalysis).forEach(([house, analysis]) => {
      if (analysis.houseCondition) {
        if (analysis.houseCondition.score >= 70) {
          strongHouses.push(house);
        } else if (analysis.houseCondition.score < 50) {
          weakHouses.push(house);
        }
      }
    });

    return {
      strongHouses,
      weakHouses,
      description: `Strong houses: ${strongHouses.join(', ') || 'None clearly identified'}. Weak houses: ${weakHouses.join(', ') || 'None clearly identified'}.`
    };
  }

  static generateRecommendations(lordAnalysis) {
    const recommendations = [];

    Object.entries(lordAnalysis).forEach(([house, analysis]) => {
      if (analysis.houseCondition && analysis.houseCondition.score < 60) {
        recommendations.push(`Strengthen ${house}${this.getOrdinalSuffix(parseInt(house))} house through ${analysis.lord} remedies`);
      }
    });

    if (recommendations.length === 0) {
      recommendations.push('Overall house lord placements are supportive');
    }

    return recommendations;
  }
}

module.exports = HouseLordCalculator;
