/**
 * Pratyantardasha Calculator
 * Calculates sub-sub periods within Antardashas
 * Based on Vimshottari Dasha system with precise timing
 */

class PratyanardashaCalculator {
  constructor() {
    this.initializeDashaData();
  }

  /**
   * Initialize Vimshottari dasha periods and sequences
   */
  initializeDashaData() {
    // Vimshottari dasha periods in years
    this.mahadashaPeriods = {
      'Ketu': 7,
      'Venus': 20,
      'Sun': 6,
      'Moon': 10,
      'Mars': 7,
      'Rahu': 18,
      'Jupiter': 16,
      'Saturn': 19,
      'Mercury': 17
    };

    // Planet sequence in Vimshottari
    this.dashaSequence = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];

    // Conversion factors
    this.daysPerYear = 365.25;
    this.totalCycle = 120; // Total Vimshottari cycle in years
  }

  /**
   * Calculate complete Pratyantardasha periods for a given Antardasha
   * @param {string} mahadashaLord - Current Mahadasha lord
   * @param {string} antardashaLord - Current Antardasha lord
   * @param {Date} antardashaStartDate - Start date of Antardasha
   * @param {Date} antardashaEndDate - End date of Antardasha
   * @returns {Object} Complete Pratyantardasha timeline
   */
  calculatePratyanardashaTimeline(mahadashaLord, antardashaLord, antardashaStartDate, antardashaEndDate) {
    const timeline = {
      mahadashaLord: mahadashaLord,
      antardashaLord: antardashaLord,
      antardashaStartDate: antardashaStartDate,
      antardashaEndDate: antardashaEndDate,
      antardashaDurationDays: this.getDateDifferenceInDays(antardashaStartDate, antardashaEndDate),
      pratyanardashas: [],
      currentPratyantardasha: null,
      upcomingPratyanardashas: []
    };

    let currentDate = new Date(antardashaStartDate);
    const antardashaLordIndex = this.dashaSequence.indexOf(antardashaLord);

    // Calculate proportional periods for each Pratyantardasha
    for (let i = 0; i < this.dashaSequence.length; i++) {
      const pratyanardashaLord = this.dashaSequence[(antardashaLordIndex + i) % this.dashaSequence.length];
      const proportionalDuration = this.calculatePratyanardashaDuration(
        antardashaLord,
        pratyanardashaLord,
        timeline.antardashaDurationDays
      );

      const endDate = new Date(currentDate.getTime() + (proportionalDuration * 24 * 60 * 60 * 1000));

      const pratyanardasha = {
        lord: pratyanardashaLord,
        startDate: new Date(currentDate),
        endDate: new Date(endDate),
        durationDays: proportionalDuration,
        durationYears: proportionalDuration / this.daysPerYear,
        sequence: i + 1,
        isActive: false,
        effects: this.getPratyanardashaEffects(mahadashaLord, antardashaLord, pratyanardashaLord),
        favorability: this.assessPratyanardashaFavorability(mahadashaLord, antardashaLord, pratyanardashaLord),
        recommendations: this.getPratyanardashaRecommendations(pratyanardashaLord)
      };

      timeline.pratyanardashas.push(pratyanardasha);
      currentDate = new Date(endDate);
    }

    // Identify current and upcoming periods
    const today = new Date();
    timeline.currentPratyantardasha = this.getCurrentPratyantardasha(timeline.pratyanardashas, today);
    timeline.upcomingPratyanardashas = this.getUpcomingPratyanardashas(timeline.pratyanardashas, today, 3);

    return timeline;
  }

  /**
   * Calculate duration of a specific Pratyantardasha
   * @param {string} antardashaLord - Antardasha lord
   * @param {string} pratyanardashaLord - Pratyantardasha lord
   * @param {number} totalAntardashaDays - Total Antardasha duration in days
   * @returns {number} Pratyantardasha duration in days
   */
  calculatePratyanardashaDuration(antardashaLord, pratyanardashaLord, totalAntardashaDays) {
    const antardashaYears = this.mahadashaPeriods[antardashaLord];
    const pratyanardashaYears = this.mahadashaPeriods[pratyanardashaLord];

    // Proportional calculation: (Pratyantardasha lord years / Antardasha lord years) * Total Antardasha days
    const proportionalFactor = pratyanardashaYears / antardashaYears;
    return Math.round(totalAntardashaDays * proportionalFactor);
  }

  /**
   * Get current running Pratyantardasha
   * @param {Array} pratyanardashas - Array of all Pratyanardashas
   * @param {Date} currentDate - Current date
   * @returns {Object|null} Current Pratyantardasha or null
   */
  getCurrentPratyantardasha(pratyanardashas, currentDate) {
    for (const pratyantardasha of pratyanardashas) {
      if (currentDate >= pratyantardasha.startDate && currentDate <= pratyantardasha.endDate) {
        pratyantardasha.isActive = true;
        return pratyantardasha;
      }
    }
    return null;
  }

  /**
   * Get upcoming Pratyanardashas
   * @param {Array} pratyanardashas - Array of all Pratyanardashas
   * @param {Date} currentDate - Current date
   * @param {number} count - Number of upcoming periods to return
   * @returns {Array} Upcoming Pratyanardashas
   */
  getUpcomingPratyanardashas(pratyanardashas, currentDate, count = 3) {
    return pratyanardashas
      .filter(pratyantardasha => pratyantardasha.startDate > currentDate)
      .slice(0, count);
  }

  /**
   * Get Pratyantardasha effects based on planetary combinations
   * @param {string} mahadashaLord - Mahadasha lord
   * @param {string} antardashaLord - Antardasha lord
   * @param {string} pratyanardashaLord - Pratyantardasha lord
   * @returns {Array} Effects array
   */
  getPratyanardashaEffects(mahadashaLord, antardashaLord, pratyanardashaLord) {
    const effects = [];

    // Base effect from Pratyantardasha lord
    const baseEffects = this.getPlanetaryBaseEffects(pratyanardashaLord);
    effects.push(...baseEffects);

    // Combination effects
    const combinationEffect = this.getCombinationEffects(mahadashaLord, antardashaLord, pratyanardashaLord);
    if (combinationEffect) {
      effects.push(combinationEffect);
    }

    // Harmonic effects
    const harmonicEffect = this.getHarmonicEffects(antardashaLord, pratyanardashaLord);
    if (harmonicEffect) {
      effects.push(harmonicEffect);
    }

    return effects;
  }

  /**
   * Assess favorability of Pratyantardasha period
   * @param {string} mahadashaLord - Mahadasha lord
   * @param {string} antardashaLord - Antardasha lord
   * @param {string} pratyanardashaLord - Pratyantardasha lord
   * @returns {Object} Favorability assessment
   */
  assessPratyanardashaFavorability(mahadashaLord, antardashaLord, pratyanardashaLord) {
    let score = 5; // Neutral baseline
    let factors = [];

    // Same planet combinations (harmonious)
    if (pratyanardashaLord === antardashaLord) {
      score += 2;
      factors.push('Same as Antardasha lord - harmonious effects');
    }
    if (pratyanardashaLord === mahadashaLord) {
      score += 1;
      factors.push('Same as Mahadasha lord - reinforced effects');
    }

    // Friendly combinations
    if (this.arePlanetsFriendly(antardashaLord, pratyanardashaLord)) {
      score += 1;
      factors.push('Friendly with Antardasha lord');
    }

    // Enemy combinations
    if (this.arePlanetsEnemies(antardashaLord, pratyanardashaLord)) {
      score -= 1;
      factors.push('Conflicting with Antardasha lord');
    }

    // Natural benefic/malefic considerations
    const pratyanardashaType = this.getPlanetType(pratyanardashaLord);
    if (pratyanardashaType === 'benefic') {
      score += 1;
      factors.push('Natural benefic period');
    } else if (pratyanardashaType === 'malefic') {
      score -= 0.5;
      factors.push('Natural malefic - requires caution');
    }

    return {
      score: Math.max(1, Math.min(10, score)),
      level: this.getFavorabilityLevel(score),
      factors: factors
    };
  }

  /**
   * Get recommendations for Pratyantardasha period
   * @param {string} pratyanardashaLord - Pratyantardasha lord
   * @returns {Array} Recommendations
   */
  getPratyanardashaRecommendations(pratyanardashaLord) {
    const recommendations = {
      'Sun': [
        'Focus on leadership and authority matters',
        'Good time for government-related work',
        'Strengthen relationship with father',
        'Be confident in decision-making'
      ],
      'Moon': [
        'Pay attention to emotional well-being',
        'Good time for home and family matters',
        'Focus on mother and maternal relationships',
        'Trust your intuition'
      ],
      'Mars': [
        'Take initiative in important matters',
        'Good time for physical activities and sports',
        'Be cautious of conflicts and accidents',
        'Channel energy constructively'
      ],
      'Mercury': [
        'Excellent for communication and learning',
        'Good time for business and trade',
        'Focus on education and skill development',
        'Network and build connections'
      ],
      'Jupiter': [
        'Excellent time for spiritual growth',
        'Good for education and teaching',
        'Focus on wisdom and knowledge',
        'Consider investments and financial planning'
      ],
      'Venus': [
        'Good time for relationships and marriage',
        'Focus on artistic and creative pursuits',
        'Enjoy luxury and comfort moderately',
        'Strengthen partnerships'
      ],
      'Saturn': [
        'Focus on hard work and discipline',
        'Be patient with slow progress',
        'Good time for long-term planning',
        'Avoid hasty decisions'
      ],
      'Rahu': [
        'Be cautious of deception and illusions',
        'Good time for foreign connections',
        'Focus on material ambitions',
        'Avoid shortcuts and unethical means'
      ],
      'Ketu': [
        'Good time for spiritual practices',
        'Focus on inner development',
        'May experience detachment from material world',
        'Consider meditation and research work'
      ]
    };

    return recommendations[pratyanardashaLord] || ['General favorable activities recommended'];
  }

  /**
   * Get base effects for each planet
   */
  getPlanetaryBaseEffects(planet) {
    const effects = {
      'Sun': ['Authority and leadership focus', 'Government and official matters highlighted'],
      'Moon': ['Emotional and mental focus', 'Home and family matters prominent'],
      'Mars': ['Energy and action orientation', 'Competitive and assertive period'],
      'Mercury': ['Communication and intellect emphasized', 'Business and trade opportunities'],
      'Jupiter': ['Wisdom and knowledge focus', 'Spiritual and educational growth'],
      'Venus': ['Relationship and artistic focus', 'Harmony and beauty emphasized'],
      'Saturn': ['Discipline and hard work required', 'Slow but steady progress'],
      'Rahu': ['Material ambitions and worldly focus', 'Unconventional approaches'],
      'Ketu': ['Spiritual detachment and inner focus', 'Research and investigation']
    };

    return effects[planet] || ['General planetary effects'];
  }

  /**
   * Get combination effects of three dashas
   */
  getCombinationEffects(mahadashaLord, antardashaLord, pratyanardashaLord) {
    const combinationAnalysis = {
      type: '',
      intensity: 1,
      effects: [],
      characteristics: [],
      lifeAreas: [],
      challenges: [],
      opportunities: []
    };

    // Triple same planet influence
    if (mahadashaLord === antardashaLord && antardashaLord === pratyanardashaLord) {
      combinationAnalysis.type = 'Triple Planetary Influence';
      combinationAnalysis.intensity = 3;
      combinationAnalysis.effects = this.getTriplePlanetEffects(pratyanardashaLord);
      combinationAnalysis.characteristics.push(`Extremely strong ${pratyanardashaLord} energy`);
      combinationAnalysis.characteristics.push('Concentrated focus on single planetary themes');
      return this.formatCombinationResult(combinationAnalysis);
    }

    // Double influence (Antardasha = Pratyantardasha)
    if (antardashaLord === pratyanardashaLord) {
      combinationAnalysis.type = 'Double Planetary Influence';
      combinationAnalysis.intensity = 2;
      combinationAnalysis.effects = this.getDoublePlanetEffects(antardashaLord, mahadashaLord);
      combinationAnalysis.characteristics.push(`Strong ${antardashaLord} emphasis`);
      combinationAnalysis.characteristics.push(`Modified by background ${mahadashaLord} influence`);
      return this.formatCombinationResult(combinationAnalysis);
    }

    // Complex three-planet combination
    const relationshipMatrix = this.analyzePlanetaryRelationships(mahadashaLord, antardashaLord, pratyanardashaLord);

    combinationAnalysis.type = 'Complex Three-Planet Combination';
    combinationAnalysis.intensity = this.calculateCombinationIntensity(relationshipMatrix);
    combinationAnalysis.effects = this.getComplexCombinationEffects(mahadashaLord, antardashaLord, pratyanardashaLord, relationshipMatrix);
    combinationAnalysis.characteristics = this.getCombinationCharacteristics(relationshipMatrix);
    combinationAnalysis.lifeAreas = this.getAffectedLifeAreas(mahadashaLord, antardashaLord, pratyanardashaLord);
    combinationAnalysis.challenges = this.getCombinationChallenges(relationshipMatrix);
    combinationAnalysis.opportunities = this.getCombinationOpportunities(relationshipMatrix);

    return this.formatCombinationResult(combinationAnalysis);
  }

  /**
   * Get harmonic effects between Antardasha and Pratyantardasha
   */
  getHarmonicEffects(antardashaLord, pratyanardashaLord) {
    if (this.arePlanetsFriendly(antardashaLord, pratyanardashaLord)) {
      return `Harmonious ${antardashaLord}-${pratyanardashaLord} combination`;
    } else if (this.arePlanetsEnemies(antardashaLord, pratyanardashaLord)) {
      return `Challenging ${antardashaLord}-${pratyanardashaLord} combination - requires balance`;
    }
    return null;
  }

  /**
   * Check if planets are friendly
   */
  arePlanetsFriendly(planet1, planet2) {
    const friendships = {
      'Sun': ['Moon', 'Mars', 'Jupiter'],
      'Moon': ['Sun', 'Mercury'],
      'Mars': ['Sun', 'Moon', 'Jupiter'],
      'Mercury': ['Sun', 'Venus'],
      'Jupiter': ['Sun', 'Moon', 'Mars'],
      'Venus': ['Mercury', 'Saturn'],
      'Saturn': ['Mercury', 'Venus']
    };

    return friendships[planet1]?.includes(planet2) || false;
  }

  /**
   * Check if planets are enemies
   */
  arePlanetsEnemies(planet1, planet2) {
    const enmities = {
      'Sun': ['Venus', 'Saturn'],
      'Moon': ['none'],
      'Mars': ['Mercury'],
      'Mercury': ['Moon'],
      'Jupiter': ['Mercury', 'Venus'],
      'Venus': ['Sun', 'Moon'],
      'Saturn': ['Sun', 'Moon', 'Mars']
    };

    return enmities[planet1]?.includes(planet2) || false;
  }

  /**
   * Get planet type (benefic/malefic)
   */
  getPlanetType(planet) {
    const benefics = ['Jupiter', 'Venus', 'Mercury', 'Moon'];
    const malefics = ['Sun', 'Mars', 'Saturn', 'Rahu', 'Ketu'];

    if (benefics.includes(planet)) return 'benefic';
    if (malefics.includes(planet)) return 'malefic';
    return 'neutral';
  }

  /**
   * Get favorability level from score
   */
  getFavorabilityLevel(score) {
    if (score >= 8) return 'Excellent';
    if (score >= 6.5) return 'Good';
    if (score >= 5) return 'Moderate';
    if (score >= 3.5) return 'Challenging';
    return 'Difficult';
  }

  /**
   * Calculate date difference in days
   */
  getDateDifferenceInDays(startDate, endDate) {
    const timeDiff = endDate.getTime() - startDate.getTime();
    return Math.round(timeDiff / (1000 * 3600 * 24));
  }

  /**
   * Format duration for display
   * @param {number} durationDays - Duration in days
   * @returns {string} Formatted duration
   */
  formatDuration(durationDays) {
    if (durationDays < 30) {
      return `${durationDays} days`;
    } else if (durationDays < 365) {
      const months = Math.round(durationDays / 30);
      return `${months} months`;
    } else {
      const years = Math.round(durationDays / 365);
      const remainingDays = durationDays % 365;
      const months = Math.round(remainingDays / 30);
      return months > 0 ? `${years} years ${months} months` : `${years} years`;
    }
  }

  /**
   * Supporting methods for enhanced combination analysis
   */

  getTriplePlanetEffects(planet) {
    const tripleEffects = {
      'Sun': [
        'Exceptional focus on authority and leadership',
        'Strong connection with government and officials',
        'Potential for significant recognition and status',
        'May indicate ego-driven challenges if not balanced'
      ],
      'Moon': [
        'Intense emotional and mental activity',
        'Strong focus on home, family, and mother',
        'Enhanced intuitive and psychic abilities',
        'Potential for emotional volatility'
      ],
      'Mars': [
        'Exceptional energy and drive for action',
        'Strong competitive and assertive nature',
        'Potential for conflicts if energy is misdirected',
        'Excellent for physical activities and leadership'
      ],
      'Mercury': [
        'Exceptional intellectual and communication abilities',
        'Strong focus on business, trade, and networking',
        'Enhanced learning and analytical capabilities',
        'Multiple projects and interests simultaneously'
      ],
      'Jupiter': [
        'Exceptional spiritual and educational growth',
        'Strong focus on wisdom, teaching, and guidance',
        'Enhanced fortune and protective influences',
        'Potential for spiritual leadership roles'
      ],
      'Venus': [
        'Intense focus on relationships and partnerships',
        'Strong artistic and creative expression',
        'Enhanced luxury and material comforts',
        'Potential for overindulgence in pleasures'
      ],
      'Saturn': [
        'Exceptional discipline and long-term focus',
        'Strong emphasis on hard work and responsibility',
        'Potential for significant delays but lasting results',
        'May indicate periods of restriction and testing'
      ],
      'Rahu': [
        'Intense material ambitions and worldly focus',
        'Strong desire for unconventional achievements',
        'Potential for sudden gains or losses',
        'May indicate obsessive behavior patterns'
      ],
      'Ketu': [
        'Intense spiritual detachment and inner focus',
        'Strong emphasis on research and investigation',
        'Potential for psychic and mystical experiences',
        'May indicate periods of isolation and introspection'
      ]
    };

    return tripleEffects[planet] || ['Intense planetary influence'];
  }

  getDoublePlanetEffects(primaryPlanet, backgroundPlanet) {
    const combinedEffect = `Strong ${primaryPlanet} influence modified by ${backgroundPlanet} background energy`;
    const specificEffects = this.getPlanetaryBaseEffects(primaryPlanet);
    const modificationEffects = this.getBackgroundModification(backgroundPlanet, primaryPlanet);

    return [combinedEffect, ...specificEffects, ...modificationEffects];
  }

  analyzePlanetaryRelationships(mahadasha, antardasha, pratyantardasha) {
    return {
      mahaAntarRelation: this.getPlanetaryRelationship(mahadasha, antardasha),
      antarPratyRelation: this.getPlanetaryRelationship(antardasha, pratyantardasha),
      mahaPratyRelation: this.getPlanetaryRelationship(mahadasha, pratyantardasha),
      overallHarmony: this.calculateOverallHarmony(mahadasha, antardasha, pratyantardasha),
      dominantElement: this.getDominantElement([mahadasha, antardasha, pratyantardasha]),
      combinationType: this.getCombinationType(mahadasha, antardasha, pratyantardasha)
    };
  }

  getPlanetaryRelationship(planet1, planet2) {
    if (this.arePlanetsFriendly(planet1, planet2)) return 'Friendly';
    if (this.arePlanetsEnemies(planet1, planet2)) return 'Enemy';
    return 'Neutral';
  }

  calculateCombinationIntensity(relationshipMatrix) {
    let intensity = 1;

    // Friendly relationships increase harmony
    if (relationshipMatrix.mahaAntarRelation === 'Friendly') intensity += 0.3;
    if (relationshipMatrix.antarPratyRelation === 'Friendly') intensity += 0.4;
    if (relationshipMatrix.mahaPratyRelation === 'Friendly') intensity += 0.2;

    // Enemy relationships create tension
    if (relationshipMatrix.mahaAntarRelation === 'Enemy') intensity += 0.5;
    if (relationshipMatrix.antarPratyRelation === 'Enemy') intensity += 0.6;
    if (relationshipMatrix.mahaPratyRelation === 'Enemy') intensity += 0.3;

    return Math.round(intensity * 10) / 10;
  }

  getComplexCombinationEffects(mahadasha, antardasha, pratyantardasha, relationships) {
    const effects = [];

    // Primary effect from Pratyantardasha
    effects.push(`Primary ${pratyantardasha} influence in immediate period`);

    // Secondary effect from Antardasha
    effects.push(`Secondary ${antardasha} influence shaping overall direction`);

    // Background effect from Mahadasha
    effects.push(`Background ${mahadasha} influence providing life theme`);

    // Relationship-specific effects
    if (relationships.antarPratyRelation === 'Friendly') {
      effects.push(`Harmonious ${antardasha}-${pratyantardasha} combination enhances positive outcomes`);
    } else if (relationships.antarPratyRelation === 'Enemy') {
      effects.push(`Conflicting ${antardasha}-${pratyantardasha} energies require careful balance`);
    }

    if (relationships.overallHarmony > 0.7) {
      effects.push('Overall harmonious planetary combination supports growth');
    } else if (relationships.overallHarmony < 0.3) {
      effects.push('Challenging planetary combination requires patience and wisdom');
    }

    return effects;
  }

  getCombinationCharacteristics(relationships) {
    const characteristics = [];

    if (relationships.combinationType === 'Benefic Dominant') {
      characteristics.push('Generally favorable and supportive period');
    } else if (relationships.combinationType === 'Malefic Dominant') {
      characteristics.push('Challenging period requiring extra effort');
    } else {
      characteristics.push('Mixed influences requiring balanced approach');
    }

    characteristics.push(`Planetary harmony level: ${(relationships.overallHarmony * 100).toFixed(0)}%`);

    return characteristics;
  }

  getAffectedLifeAreas(mahadasha, antardasha, pratyantardasha) {
    const planetaryAreas = {
      'Sun': ['Career', 'Authority', 'Father', 'Government'],
      'Moon': ['Home', 'Family', 'Mother', 'Emotions'],
      'Mars': ['Energy', 'Competition', 'Brothers', 'Property'],
      'Mercury': ['Communication', 'Business', 'Education', 'Travel'],
      'Jupiter': ['Wisdom', 'Teaching', 'Children', 'Spirituality'],
      'Venus': ['Relationships', 'Art', 'Luxury', 'Partnerships'],
      'Saturn': ['Discipline', 'Service', 'Elderly', 'Long-term goals'],
      'Rahu': ['Ambition', 'Foreign', 'Technology', 'Unconventional'],
      'Ketu': ['Spirituality', 'Research', 'Past karma', 'Detachment']
    };

    const areas = new Set();
    [mahadasha, antardasha, pratyantardasha].forEach(planet => {
      planetaryAreas[planet]?.forEach(area => areas.add(area));
    });

    return Array.from(areas);
  }

  getCombinationChallenges(relationships) {
    const challenges = [];

    if (relationships.antarPratyRelation === 'Enemy') {
      challenges.push('Conflicting immediate and short-term influences');
    }

    if (relationships.overallHarmony < 0.4) {
      challenges.push('Multiple planetary tensions requiring careful navigation');
    }

    if (relationships.combinationType === 'Malefic Dominant') {
      challenges.push('Predominant challenging energies requiring patience');
    }

    return challenges.length > 0 ? challenges : ['Minor challenges that can be overcome with awareness'];
  }

  getCombinationOpportunities(relationships) {
    const opportunities = [];

    if (relationships.antarPratyRelation === 'Friendly') {
      opportunities.push('Harmonious energies support new initiatives');
    }

    if (relationships.overallHarmony > 0.6) {
      opportunities.push('Generally supportive period for growth and expansion');
    }

    if (relationships.combinationType === 'Benefic Dominant') {
      opportunities.push('Favorable planetary influences enhance success potential');
    }

    return opportunities.length > 0 ? opportunities : ['Standard opportunities available with effort'];
  }

  calculateOverallHarmony(mahadasha, antardasha, pratyantardasha) {
    let harmonyScore = 0.5; // Neutral baseline

    // Check all pairwise relationships
    if (this.arePlanetsFriendly(mahadasha, antardasha)) harmonyScore += 0.15;
    else if (this.arePlanetsEnemies(mahadasha, antardasha)) harmonyScore -= 0.1;

    if (this.arePlanetsFriendly(antardasha, pratyantardasha)) harmonyScore += 0.2;
    else if (this.arePlanetsEnemies(antardasha, pratyantardasha)) harmonyScore -= 0.15;

    if (this.arePlanetsFriendly(mahadasha, pratyantardasha)) harmonyScore += 0.1;
    else if (this.arePlanetsEnemies(mahadasha, pratyantardasha)) harmonyScore -= 0.05;

    return Math.max(0, Math.min(1, harmonyScore));
  }

  getDominantElement(planets) {
    const elements = {
      'Sun': 'Fire', 'Mars': 'Fire',
      'Moon': 'Water', 'Venus': 'Water',
      'Mercury': 'Earth', 'Saturn': 'Earth',
      'Jupiter': 'Space', 'Rahu': 'Air', 'Ketu': 'Air'
    };

    const elementCount = {};
    planets.forEach(planet => {
      const element = elements[planet] || 'Unknown';
      elementCount[element] = (elementCount[element] || 0) + 1;
    });

    return Object.keys(elementCount).reduce((a, b) =>
      elementCount[a] > elementCount[b] ? a : b
    );
  }

  getCombinationType(mahadasha, antardasha, pratyantardasha) {
    const benefics = ['Jupiter', 'Venus', 'Mercury', 'Moon'];
    const malefics = ['Sun', 'Mars', 'Saturn', 'Rahu', 'Ketu'];

    const beneficCount = [mahadasha, antardasha, pratyantardasha]
      .filter(planet => benefics.includes(planet)).length;

    if (beneficCount >= 2) return 'Benefic Dominant';
    if (beneficCount === 0) return 'Malefic Dominant';
    return 'Mixed';
  }

  getBackgroundModification(backgroundPlanet, primaryPlanet) {
    const modifications = {
      'Sun': [`${primaryPlanet} effects gain authority and official recognition`],
      'Moon': [`${primaryPlanet} effects influenced by emotional and domestic factors`],
      'Mars': [`${primaryPlanet} effects gain energy and competitive edge`],
      'Mercury': [`${primaryPlanet} effects enhanced through communication and networking`],
      'Jupiter': [`${primaryPlanet} effects blessed with wisdom and good fortune`],
      'Venus': [`${primaryPlanet} effects enhanced through relationships and partnerships`],
      'Saturn': [`${primaryPlanet} effects require patience and long-term perspective`],
      'Rahu': [`${primaryPlanet} effects amplified with material ambitions`],
      'Ketu': [`${primaryPlanet} effects influenced by spiritual detachment`]
    };

    return modifications[backgroundPlanet] || [`Background ${backgroundPlanet} influence on ${primaryPlanet}`];
  }

  formatCombinationResult(analysis) {
    return {
      type: analysis.type,
      intensity: analysis.intensity,
      primaryEffect: analysis.effects[0] || 'Combined planetary influence',
      detailedEffects: analysis.effects,
      characteristics: analysis.characteristics,
      affectedAreas: analysis.lifeAreas,
      challenges: analysis.challenges,
      opportunities: analysis.opportunities,
      summary: `${analysis.type} with ${analysis.intensity}x intensity affecting ${analysis.lifeAreas?.length || 0} life areas`
    };
  }
}

export default PratyanardashaCalculator;
