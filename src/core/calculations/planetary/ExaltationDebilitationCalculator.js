/**
 * Exaltation and Debilitation Calculator
 * Implements precise calculations for planetary dignity
 * Based on classical Vedic astrology principles from BPHS
 */

class ExaltationDebilitationCalculator {
  constructor() {
    this.initializeDignitData();
  }

  /**
   * Initialize exaltation and debilitation data with precise degrees
   */
  initializeDignitData() {
    // Exaltation data with exact degrees (classical)
    this.exaltationData = {
      'sun': {
        sign: 0,        // Aries (Mesha)
        degree: 10,     // 10° Aries
        signName: 'Aries',
        description: 'Sun exalted in Aries - maximum strength and vitality'
      },
      'moon': {
        sign: 1,        // Taurus (Vrishabha)
        degree: 3,      // 3° Taurus
        signName: 'Taurus',
        description: 'Moon exalted in Taurus - emotional stability and comfort'
      },
      'mars': {
        sign: 9,        // Capricorn (Makara)
        degree: 28,     // 28° Capricorn
        signName: 'Capricorn',
        description: 'Mars exalted in Capricorn - disciplined energy and achievement'
      },
      'mercury': {
        sign: 5,        // Virgo (Kanya)
        degree: 15,     // 15° Virgo
        signName: 'Virgo',
        description: 'Mercury exalted in Virgo - analytical perfection and detail'
      },
      'jupiter': {
        sign: 3,        // Cancer (Karka)
        degree: 5,      // 5° Cancer
        signName: 'Cancer',
        description: 'Jupiter exalted in Cancer - wisdom, teaching, and nurturing'
      },
      'venus': {
        sign: 11,       // Pisces (Meena)
        degree: 27,     // 27° Pisces
        signName: 'Pisces',
        description: 'Venus exalted in Pisces - divine love and artistic inspiration'
      },
      'saturn': {
        sign: 6,        // Libra (Tula)
        degree: 20,     // 20° Libra
        signName: 'Libra',
        description: 'Saturn exalted in Libra - balanced justice and fairness'
      }
    };

    // Moolatrikona data
    this.moolatrikonaData = {
        'sun': { sign: 4, start: 0, end: 20, signName: 'Leo' },
        'moon': { sign: 1, start: 3, end: 30, signName: 'Taurus' },
        'mars': { sign: 0, start: 0, end: 12, signName: 'Aries' },
        'mercury': { sign: 5, start: 15, end: 20, signName: 'Virgo' },
        'jupiter': { sign: 8, start: 0, end: 10, signName: 'Sagittarius' },
        'venus': { sign: 6, start: 0, end: 15, signName: 'Libra' },
        'saturn': { sign: 10, start: 0, end: 20, signName: 'Aquarius' }
    };

    // Own house data
    this.ownHouseData = {
        'sun': [4], 'moon': [3], 'mars': [0, 7], 'mercury': [2, 5],
        'jupiter': [8, 11], 'venus': [1, 6], 'saturn': [9, 10]
    };

    // Planetary friendships (permanent)
    this.friendshipData = {
        'sun': { friends: ['moon', 'mars', 'jupiter'], enemies: ['venus', 'saturn'], neutral: ['mercury'] },
        'moon': { friends: ['sun', 'mercury'], enemies: [], neutral: ['mars', 'jupiter', 'venus', 'saturn'] },
        'mars': { friends: ['sun', 'moon', 'jupiter'], enemies: ['mercury'], neutral: ['venus', 'saturn'] },
        'mercury': { friends: ['sun', 'venus'], enemies: ['moon'], neutral: ['mars', 'jupiter', 'saturn'] },
        'jupiter': { friends: ['sun', 'moon', 'mars'], enemies: ['mercury', 'venus'], neutral: ['saturn'] },
        'venus': { friends: ['mercury', 'saturn'], enemies: ['sun', 'moon'], neutral: ['mars', 'jupiter'] },
        'saturn': { friends: ['mercury', 'venus'], enemies: ['sun', 'moon', 'mars'], neutral: ['jupiter'] }
    };

    // Debilitation data (exactly opposite to exaltation)
    this.debilitationData = {
      'sun': {
        sign: 6,        // Libra (Tula)
        degree: 10,     // 10° Libra
        signName: 'Libra',
        description: 'Sun debilitated in Libra - reduced authority and confidence'
      },
      'moon': {
        sign: 7,        // Scorpio (Vrishchika)
        degree: 3,      // 3° Scorpio
        signName: 'Scorpio',
        description: 'Moon debilitated in Scorpio - emotional turbulence and intensity'
      },
      'mars': {
        sign: 3,        // Cancer (Karka)
        degree: 28,     // 28° Cancer
        signName: 'Cancer',
        description: 'Mars debilitated in Cancer - aggressive energy softened or confused'
      },
      'mercury': {
        sign: 11,       // Pisces (Meena)
        degree: 15,     // 15° Pisces
        signName: 'Pisces',
        description: 'Mercury debilitated in Pisces - scattered thinking and confusion'
      },
      'jupiter': {
        sign: 9,        // Capricorn (Makara)
        degree: 5,      // 5° Capricorn
        signName: 'Capricorn',
        description: 'Jupiter debilitated in Capricorn - wisdom restricted by materialism'
      },
      'venus': {
        sign: 5,        // Virgo (Kanya)
        degree: 27,     // 27° Virgo
        signName: 'Virgo',
        description: 'Venus debilitated in Virgo - love becomes analytical and critical'
      },
      'saturn': {
        sign: 0,        // Aries (Mesha)
        degree: 20,     // 20° Aries
        signName: 'Aries',
        description: 'Saturn debilitated in Aries - patience conflicts with impulsiveness'
      }
    };

    // Rahu and Ketu exaltation/debilitation (different schools of thought)
    this.shadowPlanetData = {
      'rahu': {
        exaltation: { sign: 2, signName: 'Gemini' }, // Some say Taurus
        debilitation: { sign: 8, signName: 'Sagittarius' }, // Some say Scorpio
        description: 'Rahu dignity varies by tradition'
      },
      'ketu': {
        exaltation: { sign: 8, signName: 'Sagittarius' }, // Some say Scorpio
        debilitation: { sign: 2, signName: 'Gemini' }, // Some say Taurus
        description: 'Ketu dignity varies by tradition'
      }
    };
  }

  /**
   * Calculate planetary dignity for a given planet position
   * @param {string} planet - Planet name
   * @param {number} longitude - Planet longitude in degrees
   * @returns {Object} Detailed dignity analysis
   */
  getDignity(planet, longitude) {
    const planetKey = planet.toLowerCase();
    const sign = Math.floor(longitude / 30);
    const degree = longitude % 30;

    const dignity = {
      planet: planet,
      longitude: longitude,
      sign: sign,
      signName: this.getSignName(sign),
      degree: degree,
      dignityType: 'Neutral',
      dignityStrength: 1.0,
      description: '',
      isExalted: false,
      isDebilitated: false,
      exaltationDistance: null,
      debilitationDistance: null,
      deepestExaltation: false,
      deepestDebilitation: false,
      effects: []
    };

    // Check for exaltation
    if (this.exaltationData[planetKey]) {
      const exaltData = this.exaltationData[planetKey];
      if (sign === exaltData.sign) {
        dignity.isExalted = true;
        dignity.exaltationDistance = Math.abs(degree - exaltData.degree);

        // Calculate strength based on proximity to exact exaltation degree
        if (dignity.exaltationDistance <= 1) {
          dignity.dignityType = 'Deep Exaltation';
          dignity.dignityStrength = 2.0;
          dignity.deepestExaltation = true;
        } else {
          dignity.dignityType = 'Exalted';
          // Strength decreases as distance from exact degree increases
          dignity.dignityStrength = 1.8 - (dignity.exaltationDistance / 30);
        }

        dignity.description = exaltData.description;
        dignity.effects = this.getExaltationEffects(planetKey, dignity.dignityStrength);
        return dignity;
      }
    }

    // Check for debilitation
    if (this.debilitationData[planetKey]) {
      const debilData = this.debilitationData[planetKey];
      if (sign === debilData.sign) {
        dignity.isDebilitated = true;
        dignity.debilitationDistance = Math.abs(degree - debilData.degree);

        // Calculate weakness based on proximity to exact debilitation degree
        if (dignity.debilitationDistance <= 1) {
          dignity.dignityType = 'Deep Debilitation';
          dignity.dignityStrength = 0.2;
          dignity.deepestDebilitation = true;
        } else {
          dignity.dignityType = 'Debilitated';
          // Strength slightly improves as distance from exact degree increases
          dignity.dignityStrength = 0.3 + (dignity.debilitationDistance / 60);
        }

        dignity.description = debilData.description;
        dignity.effects = this.getDebilitationEffects(planetKey, dignity.dignityStrength);
        return dignity;
      }
    }

    // Check for Moolatrikona
    if (this.moolatrikonaData[planetKey]) {
        const moolaData = this.moolatrikonaData[planetKey];
        if (sign === moolaData.sign && degree >= moolaData.start && degree <= moolaData.end) {
            dignity.dignityType = 'Moolatrikona';
            dignity.dignityStrength = 1.7;
            dignity.description = `${planet} in Moolatrikona in ${moolaData.signName}, a position of great strength.`;
            return dignity;
        }
    }

    // Check for Own House (Swa-kshetra)
    if (this.ownHouseData[planetKey] && this.ownHouseData[planetKey].includes(sign)) {
        dignity.dignityType = 'Own House';
        dignity.dignityStrength = 1.5;
        dignity.description = `${planet} in its own house, ${dignity.signName}, providing comfort and strength.`;
        return dignity;
    }

    // Check for Friendship status
    const signLord = this.getSignLord(sign);
    if (this.friendshipData[planetKey] && signLord) {
        if (this.friendshipData[planetKey].friends.includes(signLord)) {
            dignity.dignityType = 'Friends House';
            dignity.dignityStrength = 1.3;
            dignity.description = `${planet} is in the house of a friend (${signLord}), which is a supportive placement.`;
            return dignity;
        }
        if (this.friendshipData[planetKey].enemies.includes(signLord)) {
            dignity.dignityType = 'Enemies House';
            dignity.dignityStrength = 0.6;
            dignity.description = `${planet} is in the house of an enemy (${signLord}), causing potential weakness.`;
            return dignity;
        }
        if (this.friendshipData[planetKey].neutral.includes(signLord)) {
            dignity.dignityType = 'Neutral House';
            dignity.dignityStrength = 1.0;
            dignity.description = `${planet} is in the house of a neutral planet (${signLord}), resulting in standard strength.`;
        return dignity;
      }
    }

    // Check for shadow planet dignity (Rahu/Ketu)
    if (this.shadowPlanetData[planetKey]) {
      const shadowData = this.shadowPlanetData[planetKey];
      if (sign === shadowData.exaltation.sign) {
        dignity.dignityType = 'Exalted (Shadow Planet)';
        dignity.dignityStrength = 1.6;
        dignity.isExalted = true;
        dignity.description = `${planet} exalted in ${shadowData.exaltation.signName}`;
        dignity.effects = this.getShadowPlanetExaltationEffects(planetKey);
        return dignity;
      } else if (sign === shadowData.debilitation.sign) {
        dignity.dignityType = 'Debilitated (Shadow Planet)';
        dignity.dignityStrength = 0.4;
        dignity.isDebilitated = true;
        dignity.description = `${planet} debilitated in ${shadowData.debilitation.signName}`;
        dignity.effects = this.getShadowPlanetDebilitationEffects(planetKey);
        return dignity;
      }
    }

    // Default neutral dignity
    dignity.dignityType = 'Neutral';
    dignity.dignityStrength = 1.0;
    dignity.description = `${planet} in neutral dignity in ${dignity.signName}`;
    dignity.effects = [`${planet} operates with normal strength in ${dignity.signName}`];

    return dignity;
  }

  /**
   * Check all planets in a chart for dignity
   * @param {Object} chart - Birth chart with planetary positions
   * @returns {Object} Dignity analysis for all planets
   */
  analyzeChartDignity(chart) {
    const dignityAnalysis = {
      planetaryDignities: {},
      summary: {
        exaltedPlanets: [],
        debilitatedPlanets: [],
        strongPlanets: [],
        weakPlanets: [],
        overallStrength: 0
      },
      recommendations: []
    };

    let totalStrength = 0;
    let planetCount = 0;

    // Analyze each planet
    for (const [planetName, planetData] of Object.entries(chart.planetaryPositions)) {
      if (planetData && planetData.longitude !== undefined) {
        const dignity = this.getDignity(planetName, planetData.longitude);
        dignityAnalysis.planetaryDignities[planetName] = dignity;

        totalStrength += dignity.dignityStrength;
        planetCount++;

        // Categorize planets
        if (dignity.isExalted) {
          dignityAnalysis.summary.exaltedPlanets.push({
            planet: planetName,
            strength: dignity.dignityStrength,
            type: dignity.dignityType
          });
        }

        if (dignity.isDebilitated) {
          dignityAnalysis.summary.debilitatedPlanets.push({
            planet: planetName,
            strength: dignity.dignityStrength,
            type: dignity.dignityType
          });
        }

        if (dignity.dignityStrength >= 1.5) {
          dignityAnalysis.summary.strongPlanets.push(planetName);
        } else if (dignity.dignityStrength <= 0.6) {
          dignityAnalysis.summary.weakPlanets.push(planetName);
        }
      }
    }

    // Calculate overall chart strength
    dignityAnalysis.summary.overallStrength = planetCount > 0 ? totalStrength / planetCount : 1.0;

    // Generate recommendations
    dignityAnalysis.recommendations = this.generateDignityRecommendations(dignityAnalysis.summary);

    return dignityAnalysis;
  }

  /**
   * Get effects for exalted planets
   * @param {string} planet - Planet name
   * @param {number} strength - Dignity strength
   * @returns {Array} Effects array
   */
  getExaltationEffects(planet, strength) {
    const baseEffects = {
      'sun': [
        'Excellent leadership qualities and authority',
        'Strong relationship with father and government',
        'High confidence and natural charisma',
        'Success in authoritative positions'
      ],
      'moon': [
        'Emotional stability and mental peace',
        'Strong relationship with mother',
        'Good public image and popularity',
        'Prosperity through property and vehicles'
      ],
      'mars': [
        'Disciplined energy and strategic action',
        'Success through hard work and persistence',
        'Good for military, police, or engineering careers',
        'Strong willpower and determination'
      ],
      'mercury': [
        'Exceptional analytical and communication skills',
        'Success in education and business',
        'Attention to detail and organizational ability',
        'Intellectual excellence and problem-solving'
      ],
      'jupiter': [
        'Wisdom, teaching ability, and spiritual growth',
        'Excellent for children and education',
        'Strong moral compass and ethical behavior',
        'Financial prosperity and good fortune'
      ],
      'venus': [
        'Artistic talents and creative expression',
        'Harmonious relationships and marriage',
        'Luxury, comfort, and material pleasures',
        'Success in arts, entertainment, or beauty industry'
      ],
      'saturn': [
        'Balanced approach to work and responsibility',
        'Success through patience and systematic effort',
        'Good judgment and fair dealing',
        'Long-term achievements and stable progress'
      ]
    };

    const effects = baseEffects[planet] || ['Positive effects from exaltation'];

    // Add strength-based modifiers
    if (strength >= 1.9) {
      effects.unshift('Exceptional strength - maximum positive effects');
    } else if (strength >= 1.6) {
      effects.unshift('Very strong positive effects');
    } else {
      effects.unshift('Good positive effects with some variation');
    }

    return effects;
  }

  /**
   * Get effects for debilitated planets
   * @param {string} planet - Planet name
   * @param {number} strength - Dignity strength
   * @returns {Array} Effects array
   */
  getDebilitationEffects(planet, strength) {
    const baseEffects = {
      'sun': [
        'Reduced confidence and authority issues',
        'Possible challenges with father or government',
        'Need to work harder for recognition',
        'May struggle with ego and self-expression'
      ],
      'moon': [
        'Emotional instability and mood swings',
        'Possible issues with mother or home',
        'Mental restlessness and anxiety',
        'Need for emotional support and grounding'
      ],
      'mars': [
        'Energy may be scattered or passive',
        'Possible delays in achieving goals',
        'Need to develop patience and strategy',
        'May avoid confrontation when action is needed'
      ],
      'mercury': [
        'Confused thinking or poor communication',
        'Possible learning difficulties or scattered focus',
        'Need for practical application of knowledge',
        'May struggle with details and organization'
      ],
      'jupiter': [
        'Wisdom may be overshadowed by materialism',
        'Possible issues with teachers or education',
        'Need to develop spiritual perspective',
        'May struggle with ethical decisions'
      ],
      'venus': [
        'Relationships may lack harmony or be over-analyzed',
        'Possible criticism in love or artistic expression',
        'Need to balance emotion with practicality',
        'May be too critical of beauty and pleasure'
      ],
      'saturn': [
        'Impatience may conflict with natural discipline',
        'Possible hasty decisions or lack of planning',
        'Need to develop patience and systematic approach',
        'May struggle with authority and structure'
      ]
    };

    const effects = baseEffects[planet] || ['Challenging effects from debilitation'];

    // Add strength-based modifiers and remedial suggestions
    if (strength <= 0.3) {
      effects.unshift('Severe debilitation - strong remedial measures needed');
      effects.push('Consider regular worship and gemstone therapy');
    } else if (strength <= 0.5) {
      effects.unshift('Moderate debilitation - remedial measures recommended');
      effects.push('Regular mantra recitation and charity work beneficial');
    } else {
      effects.unshift('Mild debilitation - self-awareness and effort can overcome');
      effects.push('Conscious effort and positive habits can improve outcomes');
    }

    return effects;
  }

  /**
   * Get effects for shadow planet exaltation
   */
  getShadowPlanetExaltationEffects(planet) {
    if (planet === 'rahu') {
      return [
        'Strong material ambitions and worldly success',
        'Innovative thinking and unconventional approaches',
        'Success in foreign lands or with foreign connections',
        'Ability to break traditional boundaries'
      ];
    } else if (planet === 'ketu') {
      return [
        'Strong spiritual insights and detachment',
        'Intuitive abilities and psychic sensitivities',
        'Success through research and investigation',
        'Ability to see beyond material illusions'
      ];
    }
    return ['Positive shadow planet effects'];
  }

  /**
   * Get effects for shadow planet debilitation
   */
  getShadowPlanetDebilitationEffects(planet) {
    if (planet === 'rahu') {
      return [
        'Scattered material desires and confusion',
        'Possible deception or involvement in scandals',
        'Need to focus ambitions and avoid shortcuts',
        'May struggle with unconventional behavior'
      ];
    } else if (planet === 'ketu') {
      return [
        'Spiritual confusion or escapist tendencies',
        'Possible detachment from practical responsibilities',
        'Need to balance spiritual and material life',
        'May struggle with focus and direction'
      ];
    }
    return ['Challenging shadow planet effects'];
  }

  /**
   * Generate recommendations based on dignity analysis
   */
  generateDignityRecommendations(summary) {
    const recommendations = [];

    if (summary.exaltedPlanets.length > 0) {
      recommendations.push('Capitalize on exalted planets during their favorable periods');
      recommendations.push('Use strong planets to support weak areas of life');
    }

    if (summary.debilitatedPlanets.length > 0) {
      recommendations.push('Focus on strengthening debilitated planets through remedies');
      recommendations.push('Be cautious during periods ruled by weak planets');
      recommendations.push('Consider gemstone therapy and regular worship for weak planets');
    }

    if (summary.overallStrength >= 1.3) {
      recommendations.push('Chart has good overall planetary strength');
    } else if (summary.overallStrength <= 0.8) {
      recommendations.push('Chart needs overall strengthening through spiritual practices');
      recommendations.push('Regular meditation and charitable activities recommended');
    }

    return recommendations;
  }

  /**
   * Get sign name from number
   */
  getSignName(signNumber) {
    const signs = [
      'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];
    return signs[signNumber] || 'Unknown';
  }

  /**
   * Check if planet is at maximum exaltation degree
   * @param {string} planet - Planet name
   * @param {number} longitude - Planet longitude
   * @returns {boolean} True if at exact exaltation degree
   */
  isAtMaximumExaltation(planet, longitude) {
    const dignity = this.getDignity(planet, longitude);
    return dignity.deepestExaltation;
  }

  /**
   * Check if planet is at maximum debilitation degree
   * @param {string} planet - Planet name
   * @param {number} longitude - Planet longitude
   * @returns {boolean} True if at exact debilitation degree
   */
  isAtMaximumDebilitation(planet, longitude) {
    const dignity = this.getDignity(planet, longitude);
    return dignity.deepestDebilitation;
  }

  /**
   * Get the distance to exaltation degree
   * @param {string} planet - Planet name
   * @param {number} longitude - Planet longitude
   * @returns {number|null} Distance in degrees or null if not in exaltation sign
   */
  getDistanceToExaltation(planet, longitude) {
    const dignity = this.getDignity(planet, longitude);
    return dignity.exaltationDistance;
  }

  /**
   * Get the distance to debilitation degree
   * @param {string} planet - Planet name
   * @param {number} longitude - Planet longitude
   * @returns {number|null} Distance in degrees or null if not in debilitation sign
   */
  getDistanceToDebilitation(planet, longitude) {
    const dignity = this.getDignity(planet, longitude);
    return dignity.debilitationDistance;
  }

  /**
   * Determine friendship status between planets based on Vedic astrology
   * @param {string} planet1 - First planet name
   * @param {string} planet2 - Second planet name
   * @param {Object} chart - Birth chart data (optional for advanced calculations)
   * @returns {string} Friendship status
   */
  getFriendshipStatus(planet1, planet2, chart = null) {
    const p1 = planet1.toLowerCase();
    const p2 = planet2.toLowerCase();

    // Natural friendship data based on classical Vedic astrology
    const friendships = {
      'sun': {
        'greatFriends': ['moon', 'mars', 'jupiter'],
        'friends': ['mercury'],
        'neutral': ['venus', 'saturn'],
        'enemies': [],
        'bitterEnemies': ['rahu', 'ketu']
      },
      'moon': {
        'greatFriends': ['sun', 'mercury'],
        'friends': ['mars', 'jupiter', 'venus', 'saturn'],
        'neutral': [],
        'enemies': [],
        'bitterEnemies': ['rahu', 'ketu']
      },
      'mars': {
        'greatFriends': ['sun', 'moon', 'jupiter'],
        'friends': [],
        'neutral': ['venus', 'saturn'],
        'enemies': ['mercury'],
        'bitterEnemies': ['rahu', 'ketu']
      },
      'mercury': {
        'greatFriends': ['sun', 'venus'],
        'friends': ['moon'],
        'neutral': ['mars', 'jupiter', 'saturn'],
        'enemies': [],
        'bitterEnemies': ['rahu', 'ketu']
      },
      'jupiter': {
        'greatFriends': ['sun', 'moon', 'mars'],
        'friends': [],
        'neutral': ['saturn'],
        'enemies': ['mercury', 'venus'],
        'bitterEnemies': ['rahu', 'ketu']
      },
      'venus': {
        'greatFriends': ['mercury', 'saturn'],
        'friends': ['moon'],
        'neutral': ['mars'],
        'enemies': ['sun', 'jupiter'],
        'bitterEnemies': ['rahu', 'ketu']
      },
      'saturn': {
        'greatFriends': ['mercury', 'venus'],
        'friends': ['moon'],
        'neutral': ['jupiter'],
        'enemies': ['sun', 'mars'],
        'bitterEnemies': ['rahu', 'ketu']
      },
      'rahu': {
        'greatFriends': ['venus', 'saturn'],
        'friends': ['mercury'],
        'neutral': [],
        'enemies': ['sun', 'moon', 'mars'],
        'bitterEnemies': ['jupiter']
      },
      'ketu': {
        'greatFriends': ['mars'],
        'friends': ['venus', 'saturn'],
        'neutral': ['mercury'],
        'enemies': ['sun', 'moon'],
        'bitterEnemies': ['jupiter']
      }
    };

    if (!friendships[p1]) {
      return 'Unknown';
    }

    const relationships = friendships[p1];

    if (relationships.greatFriends.includes(p2)) {
      return 'Great Friend';
    } else if (relationships.friends.includes(p2)) {
      return 'Friend';
    } else if (relationships.neutral.includes(p2)) {
      return 'Neutral';
    } else if (relationships.enemies.includes(p2)) {
      return 'Enemy';
    } else if (relationships.bitterEnemies.includes(p2)) {
      return 'Bitter Enemy';
    }

    return 'Neutral'; // Default case
  }

  getSignLord(signIndex) {
      const lords = ['mars', 'venus', 'mercury', 'moon', 'sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'saturn', 'jupiter'];
      return lords[signIndex];
  }
}

module.exports = ExaltationDebilitationCalculator;
