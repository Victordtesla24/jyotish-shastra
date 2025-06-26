/**
 * Aspect Strength Calculator
 * Calculates the strength and intensity of planetary aspects
 * Based on classical Vedic principles and modern applications
 */

class AspectStrengthCalculator {
  constructor() {
    this.strengthFactors = this.initializeStrengthFactors();
  }

  /**
   * Initialize strength calculation factors
   */
  initializeStrengthFactors() {
    return {
      dignity: {
        'Exalted': 2.0,
        'Own Sign': 1.5,
        'Friendly Sign': 1.0,
        'Neutral': 0.8,
        'Enemy Sign': 0.6,
        'Debilitated': 0.3
      },
      aspectType: {
        '7th Aspect': 1.0,
        '4th Aspect (Mars)': 1.0,
        '8th Aspect (Mars)': 1.0,
        '5th Aspect (Jupiter)': 1.2,
        '9th Aspect (Jupiter)': 1.2,
        '3rd Aspect (Saturn)': 0.8,
        '10th Aspect (Saturn)': 1.0
      },
      planetNature: {
        'Sun': 1.0,
        'Moon': 0.9,
        'Mars': 1.1,
        'Mercury': 0.8,
        'Jupiter': 1.3,
        'Venus': 1.1,
        'Saturn': 1.2,
        'Rahu': 1.1,
        'Ketu': 0.9
      }
    };
  }

  /**
   * Calculate detailed aspect strength
   * @param {Object} aspectData - Aspect data from GrahaDrishtiCalculator
   * @param {Object} chart - Birth chart data
   * @returns {Object} Detailed strength analysis
   */
  calculateDetailedStrength(aspectData, chart) {
    const strengthAnalysis = {
      baseStrength: 5.0,
      adjustments: [],
      finalStrength: 0,
      strengthLevel: '',
      effects: []
    };

    let totalStrength = strengthAnalysis.baseStrength;

    // Planet dignity adjustment
    const dignityFactor = this.getDignityFactor(aspectData.planet, chart);
    const dignityAdjustment = dignityFactor * 2;
    totalStrength += dignityAdjustment;
    strengthAnalysis.adjustments.push({
      factor: 'Planetary Dignity',
      value: dignityAdjustment,
      description: `${aspectData.planet} dignity factor: ${dignityFactor}`
    });

    // Aspect type adjustment
    const aspectTypeFactor = this.getAspectTypeFactor(aspectData.aspectType);
    const aspectAdjustment = aspectTypeFactor * 1.5;
    totalStrength += aspectAdjustment;
    strengthAnalysis.adjustments.push({
      factor: 'Aspect Type',
      value: aspectAdjustment,
      description: `${aspectData.aspectType} factor: ${aspectTypeFactor}`
    });

    // Planet nature adjustment
    const natureFactor = this.strengthFactors.planetNature[aspectData.planet] || 1.0;
    const natureAdjustment = (natureFactor - 1.0) * 2;
    totalStrength += natureAdjustment;
    strengthAnalysis.adjustments.push({
      factor: 'Planet Nature',
      value: natureAdjustment,
      description: `${aspectData.planet} natural strength: ${natureFactor}`
    });

    // House strength (aspecting planet's house)
    const houseStrength = this.getHouseStrength(aspectData.fromHouse);
    const houseAdjustment = houseStrength;
    totalStrength += houseAdjustment;
    strengthAnalysis.adjustments.push({
      factor: 'House Position',
      value: houseAdjustment,
      description: `${aspectData.fromHouse}th house strength: ${houseStrength}`
    });

    // Additional conditions
    const additionalAdjustments = this.getAdditionalAdjustments(aspectData, chart);
    totalStrength += additionalAdjustments.total;
    strengthAnalysis.adjustments.push(...additionalAdjustments.details);

    // Finalize strength
    strengthAnalysis.finalStrength = Math.max(1, Math.min(10, totalStrength));
    strengthAnalysis.strengthLevel = this.getStrengthLevel(strengthAnalysis.finalStrength);
    strengthAnalysis.effects = this.getStrengthEffects(strengthAnalysis.finalStrength, aspectData);

    return strengthAnalysis;
  }

  /**
   * Get planetary dignity factor for strength calculation
   * @param {string} planet - Planet name
   * @param {Object} chart - Birth chart data
   * @returns {number} Dignity factor
   */
  getDignityFactor(planet, chart) {
    const planetPos = chart.planetaryPositions[planet.toLowerCase()];
    if (!planetPos || !planetPos.dignity) return 0.8; // Neutral default

    return this.strengthFactors.dignity[planetPos.dignity] || 0.8;
  }

  /**
   * Get aspect type factor
   * @param {string} aspectType - Type of aspect
   * @returns {number} Aspect type factor
   */
  getAspectTypeFactor(aspectType) {
    return this.strengthFactors.aspectType[aspectType] || 1.0;
  }

  /**
   * Get house strength factor
   * @param {number} houseNumber - House number (1-12)
   * @returns {number} House strength factor
   */
  getHouseStrength(houseNumber) {
    // Kendra houses (1, 4, 7, 10) are strongest
    if ([1, 4, 7, 10].includes(houseNumber)) return 1.0;

    // Trikona houses (1, 5, 9) are very strong
    if ([5, 9].includes(houseNumber)) return 0.8;

    // Upachaya houses (3, 6, 10, 11) improve over time
    if ([3, 6, 11].includes(houseNumber)) return 0.6;

    // Dusthana houses (6, 8, 12) are challenging
    if ([8, 12].includes(houseNumber)) return -0.5;

    // Panapara houses (2, 5, 8, 11) are moderate
    if ([2].includes(houseNumber)) return 0.3;

    return 0.0; // Neutral
  }

  /**
   * Get additional strength adjustments
   * @param {Object} aspectData - Aspect data
   * @param {Object} chart - Birth chart data
   * @returns {Object} Additional adjustments
   */
  getAdditionalAdjustments(aspectData, chart) {
    const adjustments = {
      total: 0,
      details: []
    };

    const planetPos = chart.planetaryPositions[aspectData.planet.toLowerCase()];
    if (!planetPos) return adjustments;

    // Retrograde bonus
    if (planetPos.isRetrograde) {
      adjustments.total += 0.5;
      adjustments.details.push({
        factor: 'Retrograde',
        value: 0.5,
        description: `${aspectData.planet} is retrograde - increased aspect strength`
      });
    }

    // Combustion penalty
    const combustionData = this.isCombust(aspectData.planet, chart);
    if (combustionData.isCombust) {
      const penalty = this.getCombustionPenalty(combustionData.severity);
      adjustments.total -= penalty;
      adjustments.details.push({
        factor: 'Combustion',
        value: -penalty,
        description: `${aspectData.planet} is combust (${combustionData.severity}) - reduced aspect strength`
      });
    }

    // Mutual aspect bonus
    const mutualAspectBonus = this.checkMutualAspectBonus(aspectData, chart);
    if (mutualAspectBonus > 0) {
      adjustments.total += mutualAspectBonus;
      adjustments.details.push({
        factor: 'Mutual Aspect',
        value: mutualAspectBonus,
        description: 'Mutual aspect increases strength'
      });
    }

    return adjustments;
  }

  /**
   * Check for mutual aspect strength bonus
   * @param {Object} aspectData - Aspect data
   * @param {Object} chart - Birth chart data
   * @returns {number} Bonus strength
   */
  checkMutualAspectBonus(aspectData, chart) {
    // Comprehensive mutual aspect analysis
    let mutualBonus = 0;
    const aspectingPlanet = aspectData.planet;
    const targetHouse = aspectData.toHouse;
    const aspectingPlanetPos = chart.planetaryPositions[aspectingPlanet.toLowerCase()];

    if (!aspectingPlanetPos) return 0;

    // Find planets in the target house
    const planetsInTargetHouse = this.findPlanetsInHouse(targetHouse, chart);

    for (const targetPlanet of planetsInTargetHouse) {
      const mutualAspectAnalysis = this.analyzeMutualAspect(
        aspectingPlanet,
        targetPlanet.name,
        aspectingPlanetPos,
        targetPlanet.position,
        chart
      );

      if (mutualAspectAnalysis.isMutual) {
        mutualBonus += this.calculateMutualAspectBonus(
          aspectingPlanet,
          targetPlanet.name,
          mutualAspectAnalysis
        );
      }
    }

    // Additional bonuses for special planetary combinations

    // Jupiter-Venus mutual aspects (Guru-Shukra Yoga)
    if (this.hasJupiterVenusMutualAspect(aspectingPlanet, planetsInTargetHouse)) {
      mutualBonus += 0.8;
    }

    // Sun-Moon mutual aspects (Raj Yoga combinations)
    if (this.hasSunMoonMutualAspect(aspectingPlanet, planetsInTargetHouse)) {
      mutualBonus += 0.6;
    }

    // Mars-Saturn mutual aspects (Energy-discipline balance)
    if (this.hasMarsSaturnMutualAspect(aspectingPlanet, planetsInTargetHouse)) {
      mutualBonus += 0.5; // Can be beneficial for balance
    }

    // Mercury with any benefic mutual aspects
    if (this.hasMercuryBeneficMutualAspect(aspectingPlanet, planetsInTargetHouse)) {
      mutualBonus += 0.4;
    }

    // Special aspect patterns (Grand Trine, T-Square equivalents)
    const specialPatternBonus = this.checkSpecialAspectPatterns(aspectData, chart);
    mutualBonus += specialPatternBonus;

    // Planetary friendship considerations
    const friendshipBonus = this.calculatePlanetaryFriendshipBonus(aspectingPlanet, planetsInTargetHouse);
    mutualBonus += friendshipBonus;

    // Aspect chain analysis (connecting multiple planets)
    const chainBonus = this.analyzeAspectChains(aspectData, chart);
    mutualBonus += chainBonus;

    return Math.min(2.0, mutualBonus); // Cap the bonus at 2.0
  }

  /**
   * Get strength level description
   * @param {number} strength - Numerical strength (1-10)
   * @returns {string} Strength level
   */
  getStrengthLevel(strength) {
    if (strength >= 8.5) return 'Exceptional';
    if (strength >= 7.5) return 'Very Strong';
    if (strength >= 6.5) return 'Strong';
    if (strength >= 5.5) return 'Good';
    if (strength >= 4.5) return 'Moderate';
    if (strength >= 3.5) return 'Weak';
    return 'Very Weak';
  }

  /**
   * Get strength effects and interpretations
   * @param {number} strength - Numerical strength
   * @param {Object} aspectData - Aspect data
   * @returns {Array} Effects array
   */
  getStrengthEffects(strength, aspectData) {
    const effects = [];

    if (strength >= 8) {
      effects.push('Very powerful aspect with strong manifestation');
      effects.push('Clear and pronounced effects on aspected house/planet');
      effects.push('Timing of events likely to be precise');
    } else if (strength >= 6.5) {
      effects.push('Strong aspect with clear manifestation');
      effects.push('Good potential for positive results');
      effects.push('Reliable timing for related events');
    } else if (strength >= 5) {
      effects.push('Moderate aspect strength');
      effects.push('Effects may be subtle but present');
      effects.push('Results depend on supporting factors');
    } else if (strength >= 3.5) {
      effects.push('Weak aspect with limited effects');
      effects.push('May require supporting aspects for manifestation');
      effects.push('Delayed or unclear results possible');
    } else {
      effects.push('Very weak aspect with minimal effects');
      effects.push('Unlikely to produce significant results');
      effects.push('Other factors more important');
    }

    // Add planet-specific effects
    const planetEffects = this.getPlanetSpecificEffects(aspectData.planet, strength);
    effects.push(...planetEffects);

    return effects;
  }

  /**
   * Get planet-specific aspect effects
   * @param {string} planet - Planet name
   * @param {number} strength - Aspect strength
   * @returns {Array} Planet-specific effects
   */
  getPlanetSpecificEffects(planet, strength) {
    const effects = [];
    const modifier = strength >= 6.5 ? 'strong' : strength >= 4.5 ? 'moderate' : 'weak';

    switch (planet) {
      case 'Sun':
        effects.push(`${modifier} authority and leadership influence`);
        effects.push(`Government and father-related effects ${modifier}`);
        break;
      case 'Moon':
        effects.push(`${modifier} emotional and mental influence`);
        effects.push(`Home and mother-related effects ${modifier}`);
        break;
      case 'Mars':
        effects.push(`${modifier} energy and action influence`);
        effects.push(`Courage and conflict-related effects ${modifier}`);
        break;
      case 'Mercury':
        effects.push(`${modifier} communication and intelligence influence`);
        effects.push(`Business and education-related effects ${modifier}`);
        break;
      case 'Jupiter':
        effects.push(`${modifier} wisdom and prosperity influence`);
        effects.push(`Knowledge and fortune-related effects ${modifier}`);
        break;
      case 'Venus':
        effects.push(`${modifier} love and beauty influence`);
        effects.push(`Relationship and artistic effects ${modifier}`);
        break;
      case 'Saturn':
        effects.push(`${modifier} discipline and responsibility influence`);
        effects.push(`Delay and structure-related effects ${modifier}`);
        break;
      case 'Rahu':
        effects.push(`${modifier} unconventional and material influence`);
        effects.push(`Sudden and foreign-related effects ${modifier}`);
        break;
      case 'Ketu':
        effects.push(`${modifier} spiritual and detachment influence`);
        effects.push(`Past karma and liberation effects ${modifier}`);
        break;
    }

    return effects;
  }

  /**
   * Calculate strength for multiple aspects
   * @param {Array} aspects - Array of aspect data
   * @param {Object} chart - Birth chart data
   * @returns {Object} Combined strength analysis
   */
  calculateCombinedStrength(aspects, chart) {
    const combinedAnalysis = {
      individualStrengths: [],
      averageStrength: 0,
      strongestAspect: null,
      weakestAspect: null,
      overallAssessment: ''
    };

    let totalStrength = 0;

    for (const aspect of aspects) {
      const strength = this.calculateDetailedStrength(aspect, chart);
      combinedAnalysis.individualStrengths.push(strength);
      totalStrength += strength.finalStrength;

      if (!combinedAnalysis.strongestAspect || strength.finalStrength > combinedAnalysis.strongestAspect.finalStrength) {
        combinedAnalysis.strongestAspect = strength;
      }

      if (!combinedAnalysis.weakestAspect || strength.finalStrength < combinedAnalysis.weakestAspect.finalStrength) {
        combinedAnalysis.weakestAspect = strength;
      }
    }

    combinedAnalysis.averageStrength = aspects.length > 0 ? totalStrength / aspects.length : 0;
    combinedAnalysis.overallAssessment = this.getOverallAssessment(combinedAnalysis.averageStrength, aspects.length);

    return combinedAnalysis;
  }

  /**
   * Get overall assessment for combined aspects
   * @param {number} averageStrength - Average aspect strength
   * @param {number} aspectCount - Number of aspects
   * @returns {string} Overall assessment
   */
  getOverallAssessment(averageStrength, aspectCount) {
    if (aspectCount === 0) return 'No aspects to analyze';

    if (averageStrength >= 7) {
      return `Very strong aspect pattern (${aspectCount} aspects) - highly favorable`;
    } else if (averageStrength >= 5.5) {
      return `Good aspect pattern (${aspectCount} aspects) - generally positive`;
    } else if (averageStrength >= 4) {
      return `Moderate aspect pattern (${aspectCount} aspects) - mixed results`;
    } else {
      return `Weak aspect pattern (${aspectCount} aspects) - challenging`;
    }
  }

  /**
   * Generate strength recommendations
   * @param {Object} strengthAnalysis - Strength analysis result
   * @returns {Array} Recommendations
   */
  generateRecommendations(strengthAnalysis) {
    const recommendations = [];

    if (strengthAnalysis.finalStrength >= 7) {
      recommendations.push('Excellent aspect strength - capitalize on this planetary influence');
      recommendations.push('Use favorable periods of this planet for important decisions');
    } else if (strengthAnalysis.finalStrength >= 5) {
      recommendations.push('Good aspect strength - work with this planetary energy');
      recommendations.push('Support with additional remedies if needed');
    } else {
      recommendations.push('Weak aspect strength - consider remedial measures');
      recommendations.push('Focus on strengthening the aspecting planet');
      recommendations.push('Be cautious during periods ruled by this planet');
    }

    return recommendations;
  }

  // Supporting methods for enhanced mutual aspect calculations

  /**
   * Find all planets in a specific house
   * @param {number} house - House number (1-12)
   * @param {Object} chart - Birth chart data
   * @returns {Array} Planets in the house with their positions
   */
  findPlanetsInHouse(house, chart) {
    const planetsInHouse = [];

    if (!chart.planetaryPositions) return planetsInHouse;

    for (const [planetName, planetData] of Object.entries(chart.planetaryPositions)) {
      if (planetData.house === house) {
        planetsInHouse.push({
          name: planetName.charAt(0).toUpperCase() + planetName.slice(1),
          position: planetData,
          longitude: planetData.longitude,
          sign: planetData.sign
        });
      }
    }

    return planetsInHouse;
  }

  /**
   * Analyze mutual aspect between two planets
   * @param {string} planet1 - First planet
   * @param {string} planet2 - Second planet
   * @param {Object} pos1 - First planet position
   * @param {Object} pos2 - Second planet position
   * @param {Object} chart - Birth chart data
   * @returns {Object} Mutual aspect analysis
   */
  analyzeMutualAspect(planet1, planet2, pos1, pos2, chart) {
    const analysis = {
      isMutual: false,
      aspectTypes: [],
      strength: 0,
      orb: 0,
      nature: 'neutral'
    };

    // Define planetary aspects
    const planetaryAspects = {
      'Sun': [7], 'Moon': [7], 'Mercury': [7], 'Venus': [7],
      'Mars': [4, 7, 8], 'Jupiter': [5, 7, 9], 'Saturn': [3, 7, 10],
      'Rahu': [5, 7, 9], 'Ketu': [5, 7, 9]
    };

    const house1 = pos1.house;
    const house2 = pos2.house;

    // Check if planet1 aspects planet2
    const aspects1 = planetaryAspects[planet1] || [7];
    const aspects2 = planetaryAspects[planet2] || [7];

    const aspects1to2 = this.checkAspectBetweenHouses(house1, house2, aspects1);
    const aspects2to1 = this.checkAspectBetweenHouses(house2, house1, aspects2);

    if (aspects1to2.hasAspect && aspects2to1.hasAspect) {
      analysis.isMutual = true;
      analysis.aspectTypes = [aspects1to2.aspectType, aspects2to1.aspectType];
      analysis.strength = this.calculateMutualStrength(planet1, planet2, aspects1to2, aspects2to1);
      analysis.orb = this.calculateMutualOrb(pos1, pos2);
      analysis.nature = this.getMutualAspectNature(planet1, planet2);
    }

    return analysis;
  }

  /**
   * Check aspect between two houses
   * @param {number} fromHouse - Aspecting house
   * @param {number} toHouse - Aspected house
   * @param {Array} aspectDistances - Aspect distances for the planet
   * @returns {Object} Aspect check result
   */
  checkAspectBetweenHouses(fromHouse, toHouse, aspectDistances) {
    const result = { hasAspect: false, aspectType: null };

    for (const distance of aspectDistances) {
      let targetHouse = fromHouse + distance - 1;
      if (targetHouse > 12) targetHouse -= 12;

      if (targetHouse === toHouse) {
        result.hasAspect = true;
        result.aspectType = `${distance}th aspect`;
        break;
      }
    }

    return result;
  }

  /**
   * Calculate mutual aspect bonus
   * @param {string} planet1 - First planet
   * @param {string} planet2 - Second planet
   * @param {Object} mutualAnalysis - Mutual aspect analysis
   * @returns {number} Bonus strength
   */
  calculateMutualAspectBonus(planet1, planet2, mutualAnalysis) {
    let bonus = 0.3; // Base mutual aspect bonus

    // Enhance bonus based on planetary combination
    const combination = this.getPlanetaryCombinationType(planet1, planet2);

    switch (combination) {
      case 'benefic-benefic':
        bonus += 0.4;
        break;
      case 'malefic-malefic':
        bonus += 0.2; // Less beneficial but still significant
        break;
      case 'luminaries':
        bonus += 0.5; // Sun-Moon combinations
        break;
      case 'teacher-student':
        bonus += 0.3; // Jupiter-Mercury, etc.
        break;
      default:
        bonus += 0.1;
    }

    // Adjust for aspect strength
    bonus *= mutualAnalysis.strength;

    return bonus;
  }

  /**
   * Check for Jupiter-Venus mutual aspect
   * @param {string} aspectingPlanet - Aspecting planet
   * @param {Array} planetsInHouse - Planets in target house
   * @returns {boolean} Has Jupiter-Venus mutual aspect
   */
  hasJupiterVenusMutualAspect(aspectingPlanet, planetsInHouse) {
    if (aspectingPlanet === 'Jupiter') {
      return planetsInHouse.some(p => p.name === 'Venus');
    }
    if (aspectingPlanet === 'Venus') {
      return planetsInHouse.some(p => p.name === 'Jupiter');
    }
    return false;
  }

  /**
   * Check for Sun-Moon mutual aspect
   * @param {string} aspectingPlanet - Aspecting planet
   * @param {Array} planetsInHouse - Planets in target house
   * @returns {boolean} Has Sun-Moon mutual aspect
   */
  hasSunMoonMutualAspect(aspectingPlanet, planetsInHouse) {
    if (aspectingPlanet === 'Sun') {
      return planetsInHouse.some(p => p.name === 'Moon');
    }
    if (aspectingPlanet === 'Moon') {
      return planetsInHouse.some(p => p.name === 'Sun');
    }
    return false;
  }

  /**
   * Check for Mars-Saturn mutual aspect
   * @param {string} aspectingPlanet - Aspecting planet
   * @param {Array} planetsInHouse - Planets in target house
   * @returns {boolean} Has Mars-Saturn mutual aspect
   */
  hasMarsSaturnMutualAspect(aspectingPlanet, planetsInHouse) {
    if (aspectingPlanet === 'Mars') {
      return planetsInHouse.some(p => p.name === 'Saturn');
    }
    if (aspectingPlanet === 'Saturn') {
      return planetsInHouse.some(p => p.name === 'Mars');
    }
    return false;
  }

  /**
   * Check for Mercury-Benefic mutual aspect
   * @param {string} aspectingPlanet - Aspecting planet
   * @param {Array} planetsInHouse - Planets in target house
   * @returns {boolean} Has Mercury-Benefic mutual aspect
   */
  hasMercuryBeneficMutualAspect(aspectingPlanet, planetsInHouse) {
    const benefics = ['Jupiter', 'Venus', 'Moon'];

    if (aspectingPlanet === 'Mercury') {
      return planetsInHouse.some(p => benefics.includes(p.name));
    }
    if (benefics.includes(aspectingPlanet)) {
      return planetsInHouse.some(p => p.name === 'Mercury');
    }
    return false;
  }

  /**
   * Check for special aspect patterns
   * @param {Object} aspectData - Aspect data
   * @param {Object} chart - Birth chart data
   * @returns {number} Special pattern bonus
   */
  checkSpecialAspectPatterns(aspectData, chart) {
    let patternBonus = 0;

    // Grand Trine pattern (Trikona houses 1, 5, 9)
    if (this.hasGrandTrinePattern(aspectData, chart)) {
      patternBonus += 0.6;
    }

    // T-Square pattern (square aspects forming tension)
    if (this.hasTSquarePattern(aspectData, chart)) {
      patternBonus += 0.3; // Challenging but dynamic
    }

    // Stellium influence (3+ planets in same house)
    if (this.hasStelliumInfluence(aspectData, chart)) {
      patternBonus += 0.4;
    }

    return patternBonus;
  }

  /**
   * Calculate planetary friendship bonus
   * @param {string} aspectingPlanet - Aspecting planet
   * @param {Array} planetsInHouse - Planets in target house
   * @returns {number} Friendship bonus
   */
  calculatePlanetaryFriendshipBonus(aspectingPlanet, planetsInHouse) {
    let friendshipBonus = 0;

    // Planetary friendship matrix
    const friendships = {
      'Sun': ['Mars', 'Jupiter', 'Moon'],
      'Moon': ['Sun', 'Mercury'],
      'Mars': ['Sun', 'Moon', 'Jupiter'],
      'Mercury': ['Sun', 'Venus'],
      'Jupiter': ['Sun', 'Moon', 'Mars'],
      'Venus': ['Mercury', 'Saturn'],
      'Saturn': ['Mercury', 'Venus']
    };

    const friends = friendships[aspectingPlanet] || [];

    for (const planet of planetsInHouse) {
      if (friends.includes(planet.name)) {
        friendshipBonus += 0.2;
      }
    }

    return friendshipBonus;
  }

  /**
   * Analyze aspect chains
   * @param {Object} aspectData - Aspect data
   * @param {Object} chart - Birth chart data
   * @returns {number} Chain bonus
   */
  analyzeAspectChains(aspectData, chart) {
    // Complex aspect chain analysis would go here
    // For now, return a small bonus for connected aspects
    return 0.1;
  }

  // Helper methods for pattern recognition

  hasGrandTrinePattern(aspectData, chart) {
    // A Grand Trine involves three planets, each in a trine (120-degree) aspect to the other two.
    // This typically means planets are in the same element (fire, earth, air, water) signs.

    const planetsInChart = Object.values(chart.planetaryPositions);
    if (planetsInChart.length < 3) return false;

    for (let i = 0; i < planetsInChart.length; i++) {
      for (let j = i + 1; j < planetsInChart.length; j++) {
        for (let k = j + 1; k < planetsInChart.length; k++) {
          const p1 = planetsInChart[i];
          const p2 = planetsInChart[j];
          const p3 = planetsInChart[k];

          // Check for trine aspects between all three pairs
          const isTrine12 = this.isTrineAspect(p1.longitude, p2.longitude);
          const isTrine13 = this.isTrineAspect(p1.longitude, p3.longitude);
          const isTrine23 = this.isTrineAspect(p2.longitude, p3.longitude);

          if (isTrine12 && isTrine13 && isTrine23) {
            return true; // Grand Trine found
          }
        }
      }
    }
    return false;
  }

  isTrineAspect(lon1, lon2, orb = 8) {
    const diff = Math.abs(lon1 - lon2);
    const adjustedDiff = Math.min(diff, 360 - diff);
    return Math.abs(adjustedDiff - 120) <= orb;
  }

  hasTSquarePattern(aspectData, chart) {
    // A T-Square involves three planets, two in opposition (180-degree) and both squaring (90-degree) a third planet.
    // This creates a challenging and dynamic pattern.

    const planetsInChart = Object.values(chart.planetaryPositions);
    if (planetsInChart.length < 3) return false;

    for (let i = 0; i < planetsInChart.length; i++) {
      for (let j = i + 1; j < planetsInChart.length; j++) {
        for (let k = j + 1; k < planetsInChart.length; k++) {
          const p1 = planetsInChart[i];
          const p2 = planetsInChart[j];
          const p3 = planetsInChart[k];

          // Check for opposition between two planets
          const isOpposition12 = this.isOppositionAspect(p1.longitude, p2.longitude);
          const isOpposition13 = this.isOppositionAspect(p1.longitude, p3.longitude);
          const isOpposition23 = this.isOppositionAspect(p2.longitude, p3.longitude);

          // Check for square aspects
          const isSquare = (lon1, lon2, orb = 8) => {
            const diff = Math.abs(lon1 - lon2);
            const adjustedDiff = Math.min(diff, 360 - diff);
            return Math.abs(adjustedDiff - 90) <= orb;
          };

          if (isOpposition12 && isSquare(p1.longitude, p3.longitude) && isSquare(p2.longitude, p3.longitude)) return true;
          if (isOpposition13 && isSquare(p1.longitude, p2.longitude) && isSquare(p3.longitude, p2.longitude)) return true;
          if (isOpposition23 && isSquare(p2.longitude, p1.longitude) && isSquare(p3.longitude, p1.longitude)) return true;
        }
      }
    }
    return false;
  }

  isOppositionAspect(lon1, lon2, orb = 8) {
    const diff = Math.abs(lon1 - lon2);
    const adjustedDiff = Math.min(diff, 360 - diff);
    return Math.abs(adjustedDiff - 180) <= orb;
  }

  hasStelliumInfluence(aspectData, chart) {
    const planetsInHouse = this.findPlanetsInHouse(aspectData.toHouse, chart);
    return planetsInHouse.length >= 3;
  }

  calculateMutualStrength(planet1, planet2, aspect1, aspect2) {
    // Calculate strength based on aspect types and planetary nature
    let strength = 0.5; // Base strength

    // Special aspects are stronger
    if (aspect1.aspectType.includes('5th') || aspect1.aspectType.includes('9th')) {
      strength += 0.2;
    }
    if (aspect2.aspectType.includes('5th') || aspect2.aspectType.includes('9th')) {
      strength += 0.2;
    }

    return Math.min(1.0, strength);
  }

  calculateMutualOrb(pos1, pos2) {
    // Calculate orb between two planetary positions
    const orb = Math.abs(pos1.longitude - pos2.longitude);
    return orb > 180 ? 360 - orb : orb;
  }

  getMutualAspectNature(planet1, planet2) {
    const benefics = ['Jupiter', 'Venus', 'Moon'];
    const malefics = ['Mars', 'Saturn', 'Sun', 'Rahu', 'Ketu'];

    const isBenefic1 = benefics.includes(planet1);
    const isBenefic2 = benefics.includes(planet2);

    if (isBenefic1 && isBenefic2) return 'very_beneficial';
    if (!isBenefic1 && !isBenefic2) return 'challenging';
    return 'mixed';
  }

  getPlanetaryCombinationType(planet1, planet2) {
    const benefics = ['Jupiter', 'Venus', 'Moon'];
    const luminaries = ['Sun', 'Moon'];

    if (benefics.includes(planet1) && benefics.includes(planet2)) {
      return 'benefic-benefic';
    }
    if (luminaries.includes(planet1) && luminaries.includes(planet2)) {
      return 'luminaries';
    }
    if ((planet1 === 'Jupiter' && planet2 === 'Mercury') ||
        (planet1 === 'Mercury' && planet2 === 'Jupiter')) {
      return 'teacher-student';
    }
    if (!benefics.includes(planet1) && !benefics.includes(planet2)) {
      return 'malefic-malefic';
    }
    return 'mixed';
  }

  /**
   * Check if a planet is combust
   * @param {string} planet - Planet name
   * @param {Object} chart - Birth chart data
   * @returns {Object} Combustion status and severity
   */
  isCombust(planet, chart) {
    if (planet === 'Sun') return { isCombust: false, severity: 'None' }; // Sun cannot be combust

    const planetData = chart.planetaryPositions[planet.toLowerCase()];
    const sunData = chart.planetaryPositions.sun;

    if (!planetData || !sunData || planetData.longitude === undefined || sunData.longitude === undefined) {
      console.warn(`Missing longitude data for combustion check: ${planet} or Sun`);
      return { isCombust: false, severity: 'None' };
    }

    const planetLongitude = planetData.longitude;
    const sunLongitude = sunData.longitude;

    // Calculate angular distance, handling circularity (360 degrees)
    let diff = Math.abs(planetLongitude - sunLongitude);
    if (diff > 180) {
      diff = 360 - diff;
    }

    // Define combustion orbs for each planet (in degrees)
    const combustionOrbs = {
      'Moon': 12,
      'Mars': 17,
      'Mercury': planetData.isRetrograde ? 12 : 14, // Mercury has different orb when retrograde
      'Jupiter': 11,
      'Venus': planetData.isRetrograde ? 8 : 10,   // Venus has different orb when retrograde
      'Saturn': 15
    };

    const orb = combustionOrbs[planet];

    if (orb === undefined) {
      // For Rahu/Ketu or other non-standard planets, combustion is not typically calculated this way
      return { isCombust: false, severity: 'None' };
    }

    const isCombust = diff <= orb;

    let severity = 'None';
    if (isCombust) {
      if (diff <= orb * 0.3) { // Very close to Sun
        severity = 'Severe';
      } else if (diff <= orb * 0.6) { // Moderately close
        severity = 'Moderate';
      } else { // Mildly close
        severity = 'Mild';
      }
    }

    return {
      isCombust: isCombust,
      distance: diff,
      severity: severity
    };
  }

  /**
   * Get combustion penalty based on severity
   * @param {string} severity - Severity level ('Severe', 'Moderate', 'Mild')
   * @returns {number} Penalty value
   */
  getCombustionPenalty(severity) {
    switch (severity) {
      case 'Severe': return 2.5;
      case 'Moderate': return 1.5;
      case 'Mild': return 0.5;
      default: return 0;
    }
  }
}

module.exports = AspectStrengthCalculator;
