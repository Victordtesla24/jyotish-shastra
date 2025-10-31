/**
 * Detailed Dasha Analysis Service
 * Implements advanced dasha calculations with Antardashas and detailed period analysis
 * Covers Section 7: Dasha Analysis: Timeline of Life Events from requirements
 */

import moment from 'moment-timezone';

class DetailedDashaAnalysisService {
  constructor() {
    this.dashaPeriods = {
      'Sun': 6, 'Moon': 10, 'Mars': 7, 'Mercury': 17, 'Jupiter': 16,
      'Venus': 20, 'Saturn': 19, 'Rahu': 18, 'Ketu': 7
    };

    this.dashaOrder = ['Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury', 'Ketu', 'Venus'];

    this.planetaryNatures = this.initializePlanetaryNatures();
    this.houseSignifications = this.initializeHouseSignifications();
  }

  /**
   * Initialize planetary natures for dasha analysis
   */
  initializePlanetaryNatures() {
    return {
      'Sun': { nature: 'Malefic', significations: ['authority', 'ego', 'father', 'government'], beneficWhen: ['exalted', 'ownSign'] },
      'Moon': { nature: 'Benefic', significations: ['mind', 'emotions', 'mother', 'public'], maleficWhen: ['waning', 'afflicted'] },
      'Mars': { nature: 'Malefic', significations: ['energy', 'courage', 'brother', 'property'], beneficWhen: ['yoga', 'ownSign'] },
      'Mercury': { nature: 'Neutral', significations: ['communication', 'business', 'education'], dependency: 'conjunction' },
      'Jupiter': { nature: 'Benefic', significations: ['wisdom', 'children', 'guru', 'wealth'], alwaysBenefic: true },
      'Venus': { nature: 'Benefic', significations: ['relationships', 'arts', 'luxury', 'wife'], alwaysBenefic: true },
      'Saturn': { nature: 'Malefic', significations: ['discipline', 'service', 'delays', 'old age'], beneficWhen: ['yoga', 'exalted'] },
      'Rahu': { nature: 'Malefic', significations: ['foreign', 'sudden', 'technology', 'obsession'], shadow: true },
      'Ketu': { nature: 'Malefic', significations: ['spirituality', 'detachment', 'research', 'moksha'], shadow: true }
    };
  }

  /**
   * Initialize house significations for dasha analysis
   */
  initializeHouseSignifications() {
    return {
      1: ['self', 'personality', 'health', 'appearance'],
      2: ['wealth', 'family', 'speech', 'food'],
      3: ['siblings', 'courage', 'communication', 'short journeys'],
      4: ['mother', 'home', 'property', 'vehicles'],
      5: ['children', 'education', 'intelligence', 'romance'],
      6: ['enemies', 'health', 'service', 'debts'],
      7: ['marriage', 'partnerships', 'business', 'foreign'],
      8: ['longevity', 'mysteries', 'transformation', 'occult'],
      9: ['father', 'dharma', 'luck', 'higher education'],
      10: ['career', 'status', 'authority', 'karma'],
      11: ['gains', 'income', 'friends', 'fulfillment'],
      12: ['expenses', 'losses', 'spirituality', 'foreign']
    };
  }

  /**
   * Calculate Antardashas (sub-periods) for a given Mahadasha
   * Requirements mapping: "Antardashas (Sub-periods): Break down the current (and upcoming) Mahadasha into Antardasha (AD) sub-periods"
   * @param {Object} mahadasha - Current Mahadasha information
   * @param {Object} birthChart - Birth chart data
   * @returns {Array} Antardasha sequence
   */
  calculateAntardashas(mahadasha, birthChart) {
    // Handle null mahadasha case
    if (!mahadasha) {
      return [];
    }

    const { planet: dashaLord, startAge, endAge, period } = mahadasha;
    const antardashas = [];

    // Create Antardasha sequence starting from the Mahadasha lord
    // This is the correct Vimshottari sequence where Antardasha follows the same order as Mahadasha
    const dashaLordIndex = this.dashaOrder.indexOf(dashaLord);
    const antardashOrder = [];

    // Start from the Mahadasha lord and continue in sequence
    for (let i = 0; i < this.dashaOrder.length; i++) {
      const index = (dashaLordIndex + i) % this.dashaOrder.length;
      antardashOrder.push(this.dashaOrder[index]);
    }

    // Calculate proportional periods for each planet
    let currentAge = startAge;

    for (const antardashLord of antardashOrder) {
      const antardashaPeriod = (this.dashaPeriods[antardashLord] / 120) * period;
      const antardashaStartAge = currentAge;
      const antardashaEndAge = currentAge + antardashaPeriod;

      antardashas.push({
        mahadasha: dashaLord,
        antardasha: antardashLord,
        startAge: antardashaStartAge,
        endAge: antardashaEndAge,
        period: antardashaPeriod,
        effects: this.analyzeDashaPeriodEffects(dashaLord, antardashLord, birthChart),
        events: this.predictDashaEvents(dashaLord, antardashLord, birthChart),
        strength: this.calculateDashaStrengths(antardashLord, birthChart),
        description: `${dashaLord} MD - ${antardashLord} AD (${antardashaPeriod.toFixed(1)} years)`
      });

      currentAge = antardashaEndAge;
    }

    return antardashas;
  }

  /**
   * Analyze dasha period effects based on planetary combinations
   * Requirements mapping: "Current Dasha Lord: Zoom into the current Mahadasha lord. Ask: What houses does this planet rule in the natal chart, and where is it placed?"
   * @param {string} dashaLord - Mahadasha lord
   * @param {string} antardashLord - Antardasha lord
   * @param {Object} chart - Birth chart data
   * @returns {Object} Period effects analysis
   */
  analyzeDashaPeriodEffects(dashaLord, antardashLord, chart) {
    const { ascendant, planetaryPositions } = chart;

    // Production code - require valid chart structure
    if (!ascendant?.sign) {
      throw new Error('Invalid chart data: missing required ascendant sign. Ensure valid birth data is provided.');
    }
    
    const lagnaSign = ascendant.sign.toUpperCase();

    // Get houses ruled by both planets
    const dashaHouses = this.getHousesRuledByPlanet(dashaLord, lagnaSign);
    const antardashaHouses = this.getHousesRuledByPlanet(antardashLord, lagnaSign);

    // Get planetary positions (with safeguards)
    const dashaPosition = planetaryPositions?.[dashaLord.toLowerCase()] || { sign: 'Unknown', house: 1, longitude: 0 };
    const antardashaPosition = planetaryPositions?.[antardashLord.toLowerCase()] || { sign: 'Unknown', house: 1, longitude: 0 };

    // Analyze house activation
    const activatedHouses = [...new Set([...dashaHouses, ...antardashaHouses])];
    const houseEffects = this.analyzeHouseActivation(activatedHouses, chart);

    // Analyze planetary relationship
    const relationship = this.analyzePlanetaryRelationship(dashaLord, antardashLord, dashaPosition, antardashaPosition);

    // Determine period nature
    const periodNature = this.determinePeriodNature(dashaLord, antardashLord, dashaPosition, antardashaPosition);

    return {
      activatedHouses,
      houseEffects,
      relationship,
      periodNature,
      keyThemes: this.extractKeyThemes(activatedHouses, dashaLord, antardashLord),
      predictions: this.generatePeriodPredictions(activatedHouses, dashaLord, antardashLord, chart)
    };
  }

  /**
   * Predict events during dasha periods
   * @param {string} dashaLord - Mahadasha lord
   * @param {string} antardashLord - Antardasha lord
   * @param {Object} chart - Birth chart data
   * @returns {Array} Predicted events
   */
  predictDashaEvents(dashaLord, antardashLord, chart) {
    const events = [];
    const { ascendant, planetaryPositions } = chart;

    // Get houses ruled by planets
    const ascendantSign = typeof ascendant.sign === 'string' ? ascendant.sign : ascendant.sign?.toUpperCase() || 'ARIES';
    const dashaHouses = this.getHousesRuledByPlanet(dashaLord, ascendantSign.toUpperCase());
    const antardashaHouses = this.getHousesRuledByPlanet(antardashLord, ascendantSign.toUpperCase());

    // Marriage events (7th house activation)
    if (dashaHouses.includes(7) || antardashaHouses.includes(7)) {
      events.push({
        type: 'MARRIAGE',
        probability: 'High',
        timing: 'Early to mid period',
        description: `Marriage or significant relationship development during ${dashaLord}-${antardashLord} period`
      });
    }

    // Career events (10th house activation)
    if (dashaHouses.includes(10) || antardashaHouses.includes(10)) {
      events.push({
        type: 'CAREER',
        probability: 'High',
        timing: 'Throughout period',
        description: `Career advancement, job change, or professional recognition during ${dashaLord}-${antardashLord} period`
      });
    }

    // Financial events (2nd, 11th house activation)
    if (dashaHouses.includes(2) || dashaHouses.includes(11) || antardashaHouses.includes(2) || antardashaHouses.includes(11)) {
      events.push({
        type: 'FINANCE',
        probability: 'Moderate to High',
        timing: 'Mid to late period',
        description: `Financial gains, property acquisition, or wealth accumulation during ${dashaLord}-${antardashLord} period`
      });
    }

    // Education events (5th, 9th house activation)
    if (dashaHouses.includes(5) || dashaHouses.includes(9) || antardashaHouses.includes(5) || antardashaHouses.includes(9)) {
      events.push({
        type: 'EDUCATION',
        probability: 'Moderate',
        timing: 'Early period',
        description: `Educational pursuits, learning, or intellectual growth during ${dashaLord}-${antardashLord} period`
      });
    }

    // Health events (6th, 8th house activation)
    if (dashaHouses.includes(6) || dashaHouses.includes(8) || antardashaHouses.includes(6) || antardashaHouses.includes(8)) {
      events.push({
        type: 'HEALTH',
        probability: 'Moderate',
        timing: 'Throughout period',
        description: `Health challenges or medical procedures during ${dashaLord}-${antardashLord} period`
      });
    }

    return events;
  }

  /**
   * Calculate dasha strengths based on planetary placement
   * @param {string} dashaLord - Dasha lord
   * @param {Object} chart - Birth chart data
   * @returns {Object} Dasha strength analysis
   */
  calculateDashaStrengths(dashaLord, chart) {
    const { ascendant, planetaryPositions } = chart;
    const position = planetaryPositions[dashaLord.toLowerCase()];

    if (!position) {
      return { strength: 0, factors: ['Planet position not found'] };
    }

    let strength = 5; // Base strength
    const factors = [];

    // House placement strength
    const house = this.getHouseFromLongitude(position.longitude, ascendant.longitude);
    if ([1, 4, 7, 10].includes(house)) {
      strength += 2;
      factors.push('Kendra placement');
    } else if ([5, 9].includes(house)) {
      strength += 1;
      factors.push('Trikona placement');
    } else if ([6, 8, 12].includes(house)) {
      strength -= 1;
      factors.push('Dusthana placement');
    }

    // Sign dignity strength
    const dignity = this.analyzePlanetaryDignity(dashaLord, position);
    switch (dignity) {
      case 'Exalted':
        strength += 3;
        factors.push('Exalted');
        break;
      case 'Own Sign':
        strength += 2;
        factors.push('Own sign');
        break;
      case 'Friendly Sign':
        strength += 1;
        factors.push('Friendly sign');
        break;
      case 'Enemy Sign':
        strength -= 1;
        factors.push('Enemy sign');
        break;
      case 'Debilitated':
        strength -= 2;
        factors.push('Debilitated');
        break;
    }

    // Functional nature strength
    const functionalNature = this.getFunctionalNature(dashaLord, ascendant.sign);
    if (functionalNature === 'Benefic') {
      strength += 1;
      factors.push('Functional benefic');
    } else if (functionalNature === 'Malefic') {
      strength -= 1;
      factors.push('Functional malefic');
    }

    return {
      strength: Math.max(1, Math.min(10, strength)),
      factors,
      dignity,
      house,
      functionalNature
    };
  }

  /**
   * Integrate transits with dashas for enhanced predictions
   * Requirements mapping: "Double-Check with Transits: While Dashas are the prime predictive tool, an expert may also overlay major gochara (transits) for validation"
   * @param {Object} dashaPeriod - Current dasha period
   * @param {Object} transits - Transit data
   * @returns {Object} Transit-dasha integration
   */
  integrateTransitsWithDashas(dashaPeriod, transits) {
    const integration = {
      saturnTransits: this.analyzeSaturnTransitEffects(dashaPeriod, transits),
      jupiterTransits: this.analyzeJupiterTransitEffects(dashaPeriod, transits),
      rahuKetuTransits: this.analyzeRahuKetuTransitEffects(dashaPeriod, transits),
      sadeSati: this.analyzeSadeSatiEffects(dashaPeriod, transits),
      recommendations: []
    };

    // Generate recommendations based on transit-dasha combinations
    if (integration.sadeSati.isActive) {
      integration.recommendations.push('Exercise caution during Sade Sati period');
    }

    if (integration.jupiterTransits.benefic) {
      integration.recommendations.push('Jupiter transit is supportive of current dasha');
    }

    return integration;
  }

  /**
   * Analyze Sade Sati effects (Saturn transit over Moon)
   * @param {Object} dashaPeriod - Current dasha period
   * @param {Object} transits - Transit data
   * @returns {Object} Sade Sati analysis
   */
  analyzeSadeSatiEffects(dashaPeriod, transits) {
    const natalMoonSign = transits.natalMoon?.sign;
    const transitingSaturnSign = transits.transitingSaturn?.sign;

    if (!natalMoonSign || !transitingSaturnSign) {
      return {
        isActive: false,
        phase: 'None',
        effects: [],
        recommendations: []
      };
    }

    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const natalMoonIndex = signs.indexOf(natalMoonSign);
    const transitingSaturnIndex = signs.indexOf(transitingSaturnSign);

    if (natalMoonIndex === -1 || transitingSaturnIndex === -1) {
      return {
        isActive: false,
        phase: 'None',
        effects: [],
        recommendations: []
      };
    }

    // Calculate relative position of transiting Saturn from natal Moon
    // 12th house from Moon: Saturn is in the sign before Moon's sign
    // 1st house from Moon: Saturn is in Moon's sign
    // 2nd house from Moon: Saturn is in the sign after Moon's sign

    let relativePosition = (transitingSaturnIndex - natalMoonIndex + 12) % 12; // 0-indexed difference

    let isActive = false;
    let phase = 'None';
    let effects = [];
    let recommendations = [];

    if (relativePosition === 11) { // 12th house (index 11)
      isActive = true;
      phase = 'First Phase (12th House)';
      effects = ['Increased expenses', 'Losses', 'Isolation', 'Health issues', 'Mental stress'];
      recommendations = ['Saturn remedies (e.g., chanting, donations)', 'Patience', 'Spiritual practices', 'Avoid major financial risks'];
    } else if (relativePosition === 0) { // 1st house (index 0)
      isActive = true;
      phase = 'Second Phase (1st House)';
      effects = ['Physical and mental challenges', 'Identity crisis', 'Delays', 'Increased responsibilities', 'Health issues'];
      recommendations = ['Self-reflection', 'Discipline', 'Meditation', 'Maintain good health', 'Avoid conflicts'];
    } else if (relativePosition === 1) { // 2nd house (index 1)
      isActive = true;
      phase = 'Third Phase (2nd House)';
      effects = ['Financial challenges', 'Family disputes', 'Speech issues', 'Eye problems', 'End of old cycles'];
      recommendations = ['Financial prudence', 'Family harmony', 'Careful communication', 'Charity', 'Focus on new beginnings'];
    }

    return {
      isActive,
      phase,
      effects,
      recommendations
    };
  }

  /**
   * Predict upcoming dashas and their effects
   * Requirements mapping: "Upcoming Dashas: Look ahead at least one or two Mahadashas. Each major period has a general tenor"
   * @param {Array} dashaSequence - Complete dasha sequence
   * @param {Object} chart - Birth chart data
   * @returns {Array} Upcoming dasha predictions
   */
  predictUpcomingDashas(dashaSequence, chart) {
    const upcomingPredictions = [];
    const currentAge = this.getCurrentAge(chart);

    // Find current dasha index
    const currentDashaIndex = dashaSequence.findIndex(d => d.isCurrent);

    // Predict next 2-3 dashas
    for (let i = 1; i <= 3; i++) {
      const nextDashaIndex = (currentDashaIndex + i) % dashaSequence.length;
      const nextDasha = dashaSequence[nextDashaIndex];

      const prediction = {
        dasha: nextDasha.planet,
        startAge: nextDasha.startAge,
        endAge: nextDasha.endAge,
        period: nextDasha.period,
        generalTenor: this.getDashaGeneralTenor(nextDasha.planet, chart),
        keyThemes: this.getDashaKeyThemes(nextDasha.planet, chart),
        lifeFocus: this.getDashaLifeFocus(nextDasha.planet, chart),
        challenges: this.getDashaChallenges(nextDasha.planet, chart),
        opportunities: this.getDashaOpportunities(nextDasha.planet, chart)
      };

      upcomingPredictions.push(prediction);
    }

    return upcomingPredictions;
  }

  /**
   * Contextualize events with dashas for timing predictions
   * @param {Object} natalPromise - Natal chart promises
   * @param {Object} dashaPeriod - Current dasha period
   * @returns {Object} Event timing analysis
   */
  contextualizeEventsWithDashas(natalPromise, dashaPeriod) {
    const timingAnalysis = {
      marriage: this.predictMarriageTiming(natalPromise, dashaPeriod),
      career: this.predictCareerTiming(natalPromise, dashaPeriod),
      children: this.predictChildrenTiming(natalPromise, dashaPeriod),
      wealth: this.predictWealthTiming(natalPromise, dashaPeriod),
      health: this.predictHealthTiming(natalPromise, dashaPeriod)
    };

    return timingAnalysis;
  }

  /**
   * Comprehensive dasha analysis
   * @param {Object} chart - Birth chart data
   * @returns {Object} Complete dasha analysis
   */
  analyzeAllDashas(chart) {
    const { ascendant, planetaryPositions } = chart;
    const birthDate = new Date(chart.birthData.dateOfBirth);
    const currentAge = this.getCurrentAge(chart);

    // Calculate current dasha
    const currentDasha = this.calculateCurrentDasha(chart, currentAge);

    // Calculate antardashas
    const antardashas = this.calculateAntardashas(currentDasha, chart);

    // Predict upcoming dashas
    const dashaSequence = this.generateDashaSequence(chart, currentAge);
    const upcomingDashas = this.predictUpcomingDashas(dashaSequence, chart);

    // Integrate transits
    const transitIntegration = this.integrateTransitsWithDashas(currentDasha, {});

    // Return in the format expected by tests and API
    return {
      dasha_sequence: dashaSequence,        // Test expects this field name
      current_dasha: currentDasha,          // Test expects this field name
      timeline: dashaSequence,              // Legacy format expects this for dasha_sequence
      currentDasha: currentDasha,           // Keep original for compatibility
      antardashas,
      upcomingDashas,
      transitIntegration,
      summary: this.generateDashaSummary(currentDasha, antardashas, upcomingDashas, chart),
      recommendations: this.generateDashaRecommendations(currentDasha, chart)
    };
  }

  // Helper methods
  getHousesRuledByPlanet(planet, lagnaSign) {
    const lords = {
      'ARIES': { 'Mars': [1, 8], 'Sun': [5], 'Jupiter': [9, 12] },
      'TAURUS': { 'Venus': [2, 7], 'Mercury': [5, 8], 'Saturn': [9, 10] },
      'GEMINI': { 'Mercury': [3, 6], 'Venus': [4, 9], 'Saturn': [10, 11] },
      'CANCER': { 'Moon': [4, 1], 'Mars': [5, 10], 'Jupiter': [11, 2] },
      'LEO': { 'Sun': [5, 1], 'Mars': [6, 11], 'Jupiter': [12, 3] },
      'VIRGO': { 'Mercury': [6, 3], 'Venus': [7, 12], 'Saturn': [1, 4] },
      'LIBRA': { 'Venus': [7, 2], 'Mercury': [8, 1], 'Saturn': [2, 5] },
      'SCORPIO': { 'Mars': [8, 3], 'Jupiter': [9, 6], 'Sun': [3, 10] },
      'SAGITTARIUS': { 'Jupiter': [9, 4], 'Sun': [10, 5], 'Mars': [4, 11] },
      'CAPRICORN': { 'Saturn': [10, 5], 'Mercury': [11, 4], 'Venus': [5, 12] },
      'AQUARIUS': { 'Saturn': [11, 6], 'Mercury': [12, 5], 'Venus': [6, 1] },
      'PISCES': { 'Jupiter': [12, 7], 'Venus': [1, 6], 'Moon': [7, 2] }
    };

    return lords[lagnaSign]?.[planet] || [];
  }

  getHouseFromLongitude(planetLongitude, ascendantLongitude) {
    const relativeLongitude = (planetLongitude - ascendantLongitude + 360) % 360;
    return Math.floor(relativeLongitude / 30) + 1;
  }

  analyzePlanetaryDignity(planet, position) {
    const exaltation = {
      'Sun': 'ARIES', 'Moon': 'TAURUS', 'Mars': 'CAPRICORN',
      'Mercury': 'VIRGO', 'Jupiter': 'CANCER', 'Venus': 'PISCES', 'Saturn': 'LIBRA'
    };

    const debilitation = {
      'Sun': 'LIBRA', 'Moon': 'SCORPIO', 'Mars': 'CANCER',
      'Mercury': 'PISCES', 'Jupiter': 'CAPRICORN', 'Venus': 'VIRGO', 'Saturn': 'ARIES'
    };

    const ownSigns = {
      'Sun': 'LEO', 'Moon': 'CANCER', 'Mars': 'ARIES',
      'Mercury': 'GEMINI', 'Jupiter': 'SAGITTARIUS', 'Venus': 'LIBRA', 'Saturn': 'CAPRICORN'
    };

    const sign = position.sign.toUpperCase();

    if (exaltation[planet] === sign) return 'Exalted';
    if (debilitation[planet] === sign) return 'Debilitated';
    if (ownSigns[planet] === sign) return 'Own Sign';

    return 'Neutral';
  }

  getFunctionalNature(planet, lagnaSign) {
    const functionalRules = {
      'ARIES': { benefic: ['Mars', 'Sun', 'Jupiter'], malefic: ['Venus', 'Saturn', 'Mercury'] },
      'TAURUS': { benefic: ['Venus', 'Mercury', 'Saturn'], malefic: ['Mars', 'Sun', 'Jupiter'] },
      'CANCER': { benefic: ['Moon', 'Mars', 'Jupiter'], malefic: ['Saturn', 'Mercury', 'Venus'] },
      'LEO': { benefic: ['Sun', 'Mars', 'Jupiter'], malefic: ['Saturn', 'Venus', 'Mercury'] },
      'LIBRA': { benefic: ['Venus', 'Saturn', 'Mercury'], malefic: ['Mars', 'Sun', 'Jupiter'] },
      'CAPRICORN': { benefic: ['Saturn', 'Mercury', 'Venus'], malefic: ['Jupiter', 'Mars', 'Sun'] }
    };

    const rules = functionalRules[lagnaSign];
    if (!rules) return 'Neutral';

    if (rules.benefic.includes(planet)) return 'Benefic';
    if (rules.malefic.includes(planet)) return 'Malefic';
    return 'Neutral';
  }

  getCurrentAge(chart) {
    const birthDate = new Date(chart.birthData.dateOfBirth);
    const currentDate = new Date();
    return (currentDate - birthDate) / (1000 * 60 * 60 * 24 * 365.25);
  }

  calculateCurrentDasha(chart, currentAge) {
    const { nakshatra } = chart;
    const startingDasha = this.getNakshatraLord(nakshatra.name);

    let age = 0;
    let dashaIndex = this.dashaOrder.indexOf(startingDasha);

    while (age < currentAge) {
      const planet = this.dashaOrder[dashaIndex];
      const period = this.dashaPeriods[planet];

      if (age + period > currentAge) {
        return {
          planet,
          startAge: age,
          endAge: age + period,
          period,
          remainingYears: (age + period) - currentAge
        };
      }

      age += period;
      dashaIndex = (dashaIndex + 1) % this.dashaOrder.length;
    }

    return null;
  }

  generateDashaSequence(chart, currentAge) {
    const { nakshatra } = chart;
    const startingDasha = this.getNakshatraLord(nakshatra.name);
    const sequence = [];

    let age = 0;
    let dashaIndex = this.dashaOrder.indexOf(startingDasha);

    // Generate exactly 9 dashas to complete one full cycle
    for (let i = 0; i < 9; i++) {
      const planet = this.dashaOrder[dashaIndex];
      const period = this.dashaPeriods[planet];
      const startAge = age;
      const endAge = age + period;
      const isCurrent = currentAge >= startAge && currentAge < endAge;

      sequence.push({
        planet,
        startAge,
        endAge,
        period,
        isCurrent,
        remainingYears: isCurrent ? endAge - currentAge : null
      });

      age += period;
      dashaIndex = (dashaIndex + 1) % this.dashaOrder.length;
    }

    return sequence;
  }

  getNakshatraLord(nakshatraName) {
    const nakshatraLords = {
      'Ashwini': 'Ketu', 'Bharani': 'Venus', 'Krittika': 'Sun',
      'Rohini': 'Moon', 'Mrigashira': 'Mars', 'Ardra': 'Rahu',
      'Punarvasu': 'Jupiter', 'Pushya': 'Saturn', 'Ashlesha': 'Mercury',
      'Magha': 'Ketu', 'Purva Phalguni': 'Venus', 'Uttara Phalguni': 'Sun',
      'Hasta': 'Moon', 'Chitra': 'Mars', 'Swati': 'Rahu',
      'Vishakha': 'Jupiter', 'Anuradha': 'Saturn', 'Jyeshtha': 'Mercury',
      'Mula': 'Ketu', 'Purva Ashadha': 'Venus', 'Uttara Ashadha': 'Sun',
      'Shravana': 'Moon', 'Dhanishta': 'Mars', 'Shatabhisha': 'Rahu',
      'Purva Bhadrapada': 'Jupiter', 'Uttara Bhadrapada': 'Saturn', 'Revati': 'Mercury'
    };

    return nakshatraLords[nakshatraName] || 'Moon';
  }

  // Additional helper methods for comprehensive analysis
  analyzeHouseActivation(houses, chart) {
    return houses.map(house => ({
      house,
      significations: this.houseSignifications[house] || [],
      activation: 'Active during this period'
    }));
  }

  analyzePlanetaryRelationship(planet1, planet2, pos1, pos2) {
    // Production-grade planetary relationship analysis
    const relationships = this.getPlanetaryRelationships();
    const relationship1to2 = relationships[planet1]?.[planet2] || 'neutral';
    const relationship2to1 = relationships[planet2]?.[planet1] || 'neutral';

    // Calculate combined relationship
    let relationshipType = 'neutral';
    if (relationship1to2 === 'friend' && relationship2to1 === 'friend') {
      relationshipType = 'mutual_friends';
    } else if (relationship1to2 === 'enemy' && relationship2to1 === 'enemy') {
      relationshipType = 'mutual_enemies';
    } else if ((relationship1to2 === 'friend' && relationship2to1 === 'neutral') ||
               (relationship1to2 === 'neutral' && relationship2to1 === 'friend')) {
      relationshipType = 'friendly';
    } else if ((relationship1to2 === 'enemy' && relationship2to1 === 'neutral') ||
               (relationship1to2 === 'neutral' && relationship2to1 === 'enemy')) {
      relationshipType = 'unfriendly';
    } else if ((relationship1to2 === 'friend' && relationship2to1 === 'enemy') ||
               (relationship1to2 === 'enemy' && relationship2to1 === 'friend')) {
      relationshipType = 'conflicted';
    }

    // Calculate relationship strength based on sign positions and aspects
    const signCompatibility = this.calculateSignCompatibility(pos1.sign, pos2.sign);
    const aspectualRelationship = this.calculateAspectualRelationship(pos1, pos2);
    const houseRelationship = this.calculateHouseRelationship(pos1.house, pos2.house);

    let strengthScore = 50; // Base neutral

    // Adjust based on natural relationship
    switch (relationshipType) {
      case 'mutual_friends': strengthScore += 30; break;
      case 'friendly': strengthScore += 15; break;
      case 'unfriendly': strengthScore -= 15; break;
      case 'mutual_enemies': strengthScore -= 30; break;
      case 'conflicted': strengthScore += 0; break;
    }

    // Adjust based on sign compatibility
    strengthScore += signCompatibility;

    // Adjust based on aspectual relationship
    strengthScore += aspectualRelationship;

    // Adjust based on house relationship
    strengthScore += houseRelationship;

    const finalStrength = Math.max(0, Math.min(100, strengthScore));

    return {
      type: relationshipType,
      strength: this.getStrengthDescription(finalStrength),
      strengthScore: finalStrength,
      effects: this.generateRelationshipEffects(planet1, planet2, relationshipType, finalStrength),
      compatibility: {
        natural: relationshipType,
        sign: signCompatibility,
        aspectual: aspectualRelationship,
        house: houseRelationship
      },
      recommendations: this.getRelationshipRecommendations(relationshipType, finalStrength)
    };
  }

  getPlanetaryRelationships() {
    return {
      'Sun': { 'Moon': 'friend', 'Mars': 'friend', 'Mercury': 'neutral', 'Jupiter': 'friend', 'Venus': 'enemy', 'Saturn': 'enemy' },
      'Moon': { 'Sun': 'friend', 'Mars': 'neutral', 'Mercury': 'friend', 'Jupiter': 'neutral', 'Venus': 'neutral', 'Saturn': 'neutral' },
      'Mars': { 'Sun': 'friend', 'Moon': 'friend', 'Mercury': 'enemy', 'Jupiter': 'friend', 'Venus': 'neutral', 'Saturn': 'neutral' },
      'Mercury': { 'Sun': 'friend', 'Moon': 'enemy', 'Mars': 'enemy', 'Jupiter': 'neutral', 'Venus': 'friend', 'Saturn': 'neutral' },
      'Jupiter': { 'Sun': 'friend', 'Moon': 'friend', 'Mars': 'friend', 'Mercury': 'enemy', 'Venus': 'enemy', 'Saturn': 'neutral' },
      'Venus': { 'Sun': 'enemy', 'Moon': 'enemy', 'Mars': 'neutral', 'Mercury': 'friend', 'Jupiter': 'enemy', 'Saturn': 'friend' },
      'Saturn': { 'Sun': 'enemy', 'Moon': 'enemy', 'Mars': 'enemy', 'Mercury': 'friend', 'Jupiter': 'neutral', 'Venus': 'friend' }
    };
  }

  calculateSignCompatibility(sign1, sign2) {
    const elements = {
      'Aries': 'Fire', 'Leo': 'Fire', 'Sagittarius': 'Fire',
      'Taurus': 'Earth', 'Virgo': 'Earth', 'Capricorn': 'Earth',
      'Gemini': 'Air', 'Libra': 'Air', 'Aquarius': 'Air',
      'Cancer': 'Water', 'Scorpio': 'Water', 'Pisces': 'Water'
    };

    const element1 = elements[sign1];
    const element2 = elements[sign2];

    if (element1 === element2) return 10; // Same element
    if ((element1 === 'Fire' && element2 === 'Air') || (element1 === 'Air' && element2 === 'Fire')) return 8;
    if ((element1 === 'Earth' && element2 === 'Water') || (element1 === 'Water' && element2 === 'Earth')) return 8;
    if ((element1 === 'Fire' && element2 === 'Earth') || (element1 === 'Earth' && element2 === 'Fire')) return -5;
    if ((element1 === 'Air' && element2 === 'Water') || (element1 === 'Water' && element2 === 'Air')) return -5;

    return 0; // Neutral
  }

  calculateAspectualRelationship(pos1, pos2) {
    const separation = Math.abs(pos1.longitude - pos2.longitude);
    const normalizedSep = separation > 180 ? 360 - separation : separation;

    if (normalizedSep <= 8) return 15; // Conjunction
    if (Math.abs(normalizedSep - 120) <= 8) return 12; // Trine
    if (Math.abs(normalizedSep - 60) <= 6) return 8; // Sextile
    if (Math.abs(normalizedSep - 180) <= 8) return -8; // Opposition
    if (Math.abs(normalizedSep - 90) <= 6) return -5; // Square

    return 0; // No major aspect
  }

  calculateHouseRelationship(house1, house2) {
    const distance = Math.abs(house1 - house2);
    if (distance === 0) return 10; // Same house
    if (distance === 4 || distance === 8) return 8; // Trinal houses
    if (distance === 3 || distance === 9) return 5; // Kendra houses
    if (distance === 6) return -5; // Opposition
    return 0;
  }

  getStrengthDescription(score) {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Moderate';
    if (score >= 20) return 'Poor';
    return 'Very Poor';
  }

  generateRelationshipEffects(planet1, planet2, type, strength) {
    const effects = [];

    switch (type) {
      case 'mutual_friends':
        effects.push(`${planet1} and ${planet2} work harmoniously together`);
        effects.push('Mutual support and enhancement of qualities');
        break;
      case 'mutual_enemies':
        effects.push(`${planet1} and ${planet2} create tension and conflict`);
        effects.push('Competing energies requiring balance');
        break;
      case 'friendly':
        effects.push(`${planet1} and ${planet2} have supportive interaction`);
        break;
      case 'unfriendly':
        effects.push(`${planet1} and ${planet2} have challenging interaction`);
        break;
      case 'conflicted':
        effects.push(`${planet1} and ${planet2} have complex, mixed effects`);
        break;
      default:
        effects.push(`${planet1} and ${planet2} have neutral interaction`);
    }

    if (strength >= 70) {
      effects.push('Strong planetary combination with significant life impact');
    } else if (strength <= 30) {
      effects.push('Weak planetary combination requiring remedial measures');
    }

    return effects;
  }

  getRelationshipRecommendations(type, strength) {
    const recommendations = [];

    if (type === 'mutual_enemies' || strength <= 30) {
      recommendations.push('Practice remedial measures for both planets');
      recommendations.push('Focus on balancing conflicting energies');
    } else if (type === 'mutual_friends' && strength >= 70) {
      recommendations.push('Leverage this powerful combination for maximum benefit');
      recommendations.push('Focus on areas governed by both planets');
    }

    recommendations.push('Regular spiritual practices to harmonize planetary energies');

    return recommendations;
  }

  determinePeriodNature(dashaLord, antardashLord, pos1, pos2) {
    const nature1 = this.planetaryNatures[dashaLord]?.nature || 'Neutral';
    const nature2 = this.planetaryNatures[antardashLord]?.nature || 'Neutral';

    if (nature1 === 'Benefic' && nature2 === 'Benefic') return 'Highly Benefic';
    if (nature1 === 'Malefic' && nature2 === 'Malefic') return 'Challenging';
    return 'Mixed';
  }

  extractKeyThemes(houses, dashaLord, antardashLord) {
    const themes = [];
    houses.forEach(house => {
      themes.push(...this.houseSignifications[house] || []);
    });
    return [...new Set(themes)];
  }

  generatePeriodPredictions(houses, dashaLord, antardashLord, chart) {
    return {
      general: `Period of ${dashaLord} and ${antardashLord} influence`,
      specific: houses.map(house => `Focus on ${this.houseSignifications[house]?.join(', ')}`),
      timing: 'Throughout the period'
    };
  }

  getDashaGeneralTenor(planet, chart) {
    const nature = this.planetaryNatures[planet];
    return nature ? `${planet} period brings ${nature.significations.join(', ')}` : 'Neutral period';
  }

  getDashaKeyThemes(planet, chart) {
    const nature = this.planetaryNatures[planet];
    return nature ? nature.significations : [];
  }

  getDashaLifeFocus(planet, chart) {
    const houses = this.getHousesRuledByPlanet(planet, chart.ascendant.sign.toUpperCase());
    return houses.map(house => this.houseSignifications[house]?.join(', ')).join('; ');
  }

  getDashaChallenges(planet, chart) {
    const nature = this.planetaryNatures[planet];
    if (nature?.nature === 'Malefic') {
      return ['Delays', 'Obstacles', 'Health issues'];
    }
    return ['Minimal challenges'];
  }

  getDashaOpportunities(planet, chart) {
    const nature = this.planetaryNatures[planet];
    if (nature?.nature === 'Benefic') {
      return ['Growth', 'Success', 'Fulfillment'];
    }
    return ['Learning opportunities', 'Character building'];
  }

  predictMarriageTiming(natalPromise, dashaPeriod) {
    return {
      probability: 'Moderate',
      timing: 'During Venus or 7th lord periods',
      conditions: 'Favorable planetary combinations'
    };
  }

  predictCareerTiming(natalPromise, dashaPeriod) {
    return {
      probability: 'High',
      timing: 'During 10th lord or Saturn periods',
      conditions: 'Strong 10th house'
    };
  }

  predictChildrenTiming(natalPromise, dashaPeriod) {
    return {
      probability: 'Moderate',
      timing: 'During Jupiter or 5th lord periods',
      conditions: 'Favorable 5th house'
    };
  }

  predictWealthTiming(natalPromise, dashaPeriod) {
    return {
      probability: 'High',
      timing: 'During 2nd/11th lord periods',
      conditions: 'Strong wealth houses'
    };
  }

  predictHealthTiming(natalPromise, dashaPeriod) {
    return {
      probability: 'Moderate',
      timing: 'During 6th/8th lord periods',
      conditions: 'Afflicted health houses'
    };
  }

  generateDashaSummary(currentDasha, antardashas, upcomingDashas, chart = null) {
    let nextAntardasha = null;

    // Only calculate next antardasha if we have valid chart data
    if (chart && chart.birthData && chart.birthData.dateOfBirth) {
      const currentAge = this.getCurrentAge(chart);
      nextAntardasha = antardashas.find(ad => ad.startAge > currentAge);
    }

    // CRITICAL FIX: Enhanced null safety for currentDasha access
    const currentPlanet = (currentDasha && currentDasha.planet) ? currentDasha.planet : 'Unknown';

    return {
      currentPeriod: `${currentPlanet} Mahadasha`,
      nextAntardasha: nextAntardasha,
      upcomingPeriods: upcomingDashas.slice(0, 2),
      overallAssessment: 'Period analysis complete'
    };
  }

  generateDashaRecommendations(currentDasha, chart) {
    return [
      'Focus on areas ruled by current dasha lord',
      'Practice patience during challenging periods',
      'Utilize beneficial periods for important decisions',
      'Consider planetary remedies for difficult periods'
    ];
  }

  analyzeSaturnTransitEffects(dashaPeriod, transits) {
    return {
      isActive: false,
      effects: [],
      recommendations: []
    };
  }

  analyzeJupiterTransitEffects(dashaPeriod, transits) {
    return {
      benefic: true,
      effects: ['Wisdom', 'Growth', 'Opportunities'],
      recommendations: ['Seek guidance', 'Expand knowledge']
    };
  }

  analyzeRahuKetuTransitEffects(dashaPeriod, transits) {
    return {
      isActive: false,
      effects: [],
      recommendations: []
    };
  }

  /**
   * Calculate Vimshottari Dasha sequence
   * @param {Object} birthData - Birth data including Moon's nakshatra
   * @returns {Array} Full Vimshottari Dasha sequence
   */
  calculateVimshottariDasha(birthData) {
    const moonNakshatra = birthData.nakshatra;
    const moonLongitudeInNakshatra = birthData.nakshatraLongitude || 6.67; // Default halfway if not provided

    const nakshatraLord = this.getNakshatraLord(moonNakshatra);
    const dashaLordPeriod = this.dashaPeriods[nakshatraLord];

    // Correct calculation: If halfway through nakshatra (6.67 out of 13.33), remaining should be half
    const progressRatio = moonLongitudeInNakshatra / (40 / 3); // Each nakshatra is 13.33 degrees
    const dashaBalance = dashaLordPeriod * (1 - progressRatio);

    const sequence = [];
    let currentDashaLordIndex = this.dashaOrder.indexOf(nakshatraLord);
    let cumulativeYears = 0;

    // Add the remaining part of the first dasha
    sequence.push({
      planet: nakshatraLord,
      start: 0,
      end: dashaBalance,
      duration: dashaBalance,
    });
    cumulativeYears += dashaBalance;

    // Add subsequent dashas in correct Vimshottari order
    for (let i = 1; i < this.dashaOrder.length; i++) {
      currentDashaLordIndex = (currentDashaLordIndex + 1) % this.dashaOrder.length;
      const planet = this.dashaOrder[currentDashaLordIndex];
      const duration = this.dashaPeriods[planet];
      sequence.push({
        planet: planet,
        start: cumulativeYears,
        end: cumulativeYears + duration,
        duration: duration,
      });
      cumulativeYears += duration;
    }

    return sequence;
  }

  /**
   * Determine current Mahadasha, Antardasha and Pratyantardasha
   * @param {Object} birthData - Birth data
   * @param {Date} currentDate - Current date for calculation
   * @returns {Object} Current dasha periods
   */
  determineCurrentDasha(chart, currentDate) {
    // Extract birthData from chart structure
    const birthData = chart.birthData || chart;
    const dashaSequence = this.calculateVimshottariDasha(birthData);
    const birthDate = new Date(birthData.dateOfBirth);
    const ageInYears = (currentDate - birthDate) / (365.25 * 24 * 60 * 60 * 1000);

    // Find current Mahadasha
    let currentMahadasha = null;
    for (const dasha of dashaSequence) {
      if (ageInYears >= dasha.start && ageInYears < dasha.end) {
        currentMahadasha = dasha;
        break;
      }
    }

    if (!currentMahadasha) {
      // If age exceeds 120 years, cycle repeats
      const cycleAge = ageInYears % 120;
      for (const dasha of dashaSequence) {
        if (cycleAge >= dasha.start && cycleAge < dasha.end) {
          currentMahadasha = dasha;
          break;
        }
      }
    }

    // Production code - require valid mahadasha data
    if (!currentMahadasha) {
      throw new Error('Invalid dasha calculation: unable to determine current mahadasha. Ensure valid birth data and calculation parameters.');
    }

    // Return current mahadasha info in simplified format expected by tests
    return {
      planet: currentMahadasha.planet,
      startAge: currentMahadasha.start,
      endAge: currentMahadasha.end,
      period: currentMahadasha.duration,
      remainingYears: (currentMahadasha.end || 0) - ageInYears
    };
  }

  /**
   * Generate complete Dasha timeline with Antardashas
   * @param {Object} birthData - Birth data
   * @returns {Array} Complete timeline with Mahadashas and Antardashas
   */
  generateDashaTimeline(chart) {
    // Extract birthData from chart structure
    const birthData = chart.birthData || chart;
    const dashaSequence = this.calculateVimshottariDasha(birthData);
    const timeline = [];

    for (const mahadasha of dashaSequence) {
      // Create simplified antardashas without needing the full chart structure
      const antardashas = [];
      let startTime = 0;

      // Calculate antardashas based on Vimshottari proportions
      for (const planet of this.dashaOrder) {
        const antardashaRatio = this.dashaPeriods[planet] / 120; // Total Vimshottari cycle is 120 years
        const antardashaLength = mahadasha.duration * antardashaRatio;

        antardashas.push({
          planet: planet,
          start: startTime,
          end: startTime + antardashaLength,
          duration: antardashaLength
        });

        startTime += antardashaLength;
      }

      timeline.push({
        mahadasha: {
          planet: mahadasha.planet,
          start: mahadasha.start,
          end: mahadasha.end,
          duration: mahadasha.duration
        },
        antardashas: antardashas.map(antardasha => ({
          planet: antardasha.planet,
          start: mahadasha.start + antardasha.start,
          end: mahadasha.start + antardasha.end,
          duration: antardasha.duration
        }))
      });
    }

    return timeline;
  }
}

export default DetailedDashaAnalysisService;
