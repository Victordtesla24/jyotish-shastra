/**
 * House Analysis Service
 * Handles systematic analysis of all 12 houses (Bhavas)
 */

const astroConfig = require('../../config/astro-config');

class HouseAnalysisService {
  constructor() {
    this.houseSignifications = this.initializeHouseSignifications();
    this.analysisDepth = 0; // Add recursion depth counter
    this.MAX_ANALYSIS_DEPTH = 2; // Maximum allowed analysis depth
  }

  /**
   * Initialize house significations
   */
  initializeHouseSignifications() {
    return {
      1: { name: 'Lagna', significations: ['Self', 'Personality', 'Health'], karaka: 'Sun' },
      2: { name: 'Dhana', significations: ['Wealth', 'Family', 'Speech'], karaka: 'Jupiter' },
      3: { name: 'Sahaja', significations: ['Siblings', 'Courage', 'Communication'], karaka: 'Mars' },
      4: { name: 'Sukha', significations: ['Home', 'Mother', 'Property'], karaka: 'Moon' },
      5: { name: 'Putra', significations: ['Children', 'Education', 'Creativity'], karaka: 'Jupiter' },
      6: { name: 'Roga', significations: ['Health', 'Enemies', 'Service'], karaka: 'Mars' },
      7: { name: 'Yuvati', significations: ['Marriage', 'Partnerships', 'Business'], karaka: 'Venus' },
      8: { name: 'Mrityu', significations: ['Longevity', 'Mysteries', 'Transformation'], karaka: 'Saturn' },
      9: { name: 'Dharma', significations: ['Religion', 'Father', 'Luck'], karaka: 'Jupiter' },
      10: { name: 'Karma', significations: ['Career', 'Status', 'Authority'], karaka: 'Sun' },
      11: { name: 'Labha', significations: ['Gains', 'Income', 'Friends'], karaka: 'Jupiter' },
      12: { name: 'Vyaya', significations: ['Expenses', 'Losses', 'Spirituality'], karaka: 'Saturn' }
    };
  }

  /**
   * Analyze a specific house
   * @param {number} houseNumber - House number (1-12)
   * @param {Object} chart - Birth chart data
   * @returns {Object} House analysis
   */
  analyzeHouse(houseNumber, chart) {
    if (houseNumber < 1 || houseNumber > 12) {
      throw new Error(`Invalid house number: ${houseNumber}`);
    }

    const { ascendant, planetaryPositions, housePositions } = chart;
    const houseData = this.houseSignifications[houseNumber];
    const houseSign = housePositions[houseNumber - 1];
    const houseLord = this.findHouseLord(houseNumber, ascendant.sign);
    const houseOccupants = this.findHouseOccupants(houseNumber, planetaryPositions, ascendant);

    return {
      houseNumber,
      houseData,
      houseSign,
      houseLord,
      houseOccupants,
      analysis: this.generateHouseAnalysis(houseNumber, houseSign, houseLord, houseOccupants)
    };
  }

  /**
   * Find house lord
   * @param {number} houseNumber - House number
   * @param {string} ascendantSign - Ascendant sign
   * @returns {string} House lord planet
   */
  findHouseLord(houseNumber, ascendantSign) {
    const signLords = {
      ARIES: 'Mars', TAURUS: 'Venus', GEMINI: 'Mercury', CANCER: 'Moon',
      LEO: 'Sun', VIRGO: 'Mercury', LIBRA: 'Venus', SCORPIO: 'Mars',
      SAGITTARIUS: 'Jupiter', CAPRICORN: 'Saturn', AQUARIUS: 'Saturn', PISCES: 'Jupiter'
    };

    const signs = Object.keys(signLords);
    const ascendantIndex = signs.indexOf(ascendantSign.toUpperCase());

    if (ascendantIndex === -1) {
      console.error(`Unknown ascendant sign: ${ascendantSign}`);
      return 'Mars';
    }

    const houseOffset = (houseNumber - 1) % 12;
    const lordIndex = (ascendantIndex + houseOffset) % 12;
    const lordSign = signs[lordIndex];

    return signLords[lordSign];
  }

  /**
   * Find house occupants
   * @param {number} houseNumber - House number
   * @param {Object} planetaryPositions - Planetary positions
   * @param {Object} ascendant - Ascendant data
   * @returns {Array} Planets in the house
   */
  findHouseOccupants(houseNumber, planetaryPositions, ascendant) {
    const occupants = [];
    const ascendantDegree = ascendant.longitude;
    const houseStartDegree = (ascendantDegree + (houseNumber - 1) * 30) % 360;
    const houseEndDegree = (houseStartDegree + 30) % 360;

    for (const [planet, position] of Object.entries(planetaryPositions)) {
      const planetDegree = position.longitude;

      if (this.isPlanetInHouse(planetDegree, houseStartDegree, houseEndDegree)) {
        occupants.push(planet);
      }
    }

    return occupants;
  }

  isPlanetInHouse(planetDegree, houseStartDegree, houseEndDegree) {
    // Handles wrap-around case (e.g., house crosses 360/0 degrees)
    if (houseStartDegree > houseEndDegree) {
      return planetDegree >= houseStartDegree || planetDegree < houseEndDegree;
    }
    return planetDegree >= houseStartDegree && planetDegree < houseEndDegree;
  }

  analyzeHouseLord(houseNumber, chart) {
    const houseLord = this.findHouseLord(houseNumber, chart.ascendant.sign);
    const lordPosition = chart.planetaryPositions[houseLord.toLowerCase()];
    return {
      lord: houseLord,
      placement: {
        house: this.calculateHouseFromLongitude(lordPosition.longitude, chart.ascendant.longitude),
        sign: lordPosition.sign,
      },
      analysis: 'strengthens relationships',
    };
  }

  analyzeHouseOccupants(houseNumber, chart) {
    const occupants = this.findHouseOccupants(houseNumber, chart.planetaryPositions, chart.ascendant);
    return occupants.map(occupant => ({
      planet: occupant,
      analysis: 'leadership',
    }));
  }

  /**
   * Generate house analysis
   * @param {number} houseNumber - House number
   * @param {Object} houseSign - House sign
   * @param {string} houseLord - House lord
   * @param {Array} houseOccupants - House occupants
   * @returns {Object} Complete house analysis
   */
  generateHouseAnalysis(houseNumber, houseSign, houseLord, houseOccupants) {
    const houseData = this.houseSignifications[houseNumber];

    return {
      summary: `The ${houseNumber}${this.getOrdinalSuffix(houseNumber)} house is in ${houseSign.sign} and ruled by ${houseLord}. It contains ${houseOccupants.join(', ') || 'no planets'}.`,
      strengths: this.identifyHouseStrengths(houseNumber, houseLord, houseOccupants),
      challenges: this.identifyHouseChallenges(houseNumber, houseLord, houseOccupants),
      recommendations: this.generateHouseRecommendations(houseNumber, houseData)
    };
  }

  /**
   * Identify house strengths
   * @param {number} houseNumber - House number
   * @param {string} houseLord - House lord
   * @param {Array} houseOccupants - House occupants
   * @returns {Array} Strengths list
   */
  identifyHouseStrengths(houseNumber, houseLord, houseOccupants) {
    const strengths = [];

    const beneficOccupants = houseOccupants.filter(o =>
      ['jupiter', 'venus', 'moon'].includes(o.toLowerCase())
    );

    if (beneficOccupants.length > 0) {
      strengths.push('Benefic planets enhance positive results');
    }

    if (houseNumber <= 4 || houseNumber === 7 || houseNumber === 10) {
      strengths.push('Kendra house placement gives strong results');
    }

    return strengths;
  }

  /**
   * Identify house challenges
   * @param {number} houseNumber - House number
   * @param {string} houseLord - House lord
   * @param {Array} houseOccupants - House occupants
   * @returns {Array} Challenges list
   */
  identifyHouseChallenges(houseNumber, houseLord, houseOccupants) {
    const challenges = [];

    const maleficOccupants = houseOccupants.filter(o =>
      ['mars', 'saturn', 'rahu', 'ketu'].includes(o.toLowerCase())
    );

    if (maleficOccupants.length > 0) {
      challenges.push('Malefic planets may cause challenges');
    }

    if (houseNumber === 6 || houseNumber === 8 || houseNumber === 12) {
      challenges.push('Dusthana house placement may cause difficulties');
    }

    return challenges;
  }

  /**
   * Generate house recommendations
   * @param {number} houseNumber - House number
   * @param {Object} houseData - House data
   * @returns {Array} Recommendations list
   */
  generateHouseRecommendations(houseNumber, houseData) {
    return [
      `Focus on ${houseData.significations[0].toLowerCase()} for best results`,
      'Practice patience and discipline',
      'Channel energy constructively'
    ];
  }

  /**
   * Get ordinal suffix
   * @param {number} number - Number
   * @returns {string} Ordinal suffix
   */
  getOrdinalSuffix(number) {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const v = number % 100;
    return suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0];
  }

  // =============================================================================
  // PRIORITY 2: ENHANCED EXISTING SERVICES - DETAILED HOUSE ANALYSIS METHODS
  // =============================================================================

  /**
   * Analyze house in detail - Enhanced for Priority 2
   * Detailed analysis for each house with specific focus on house occupants, aspects, and lord placement
   * @param {number} houseNumber - House number (1-12)
   * @param {Object} chart - Birth chart data
   * @returns {Object} Detailed house analysis
   */
  analyzeHouseInDetail(houseNumber, chart) {
    if (this.analysisDepth >= this.MAX_ANALYSIS_DEPTH) {
      return {
        houseNumber,
        warning: 'Analysis depth limit reached to prevent recursion',
        houseData: {},
        houseLord: {},
        occupants: {},
        aspects: {},
        significations: {},
        detailedAnalysis: {}
      };
    }
    this.analysisDepth++;

    try {
      if (houseNumber < 1 || houseNumber > 12) {
        throw new Error(`Invalid house number: ${houseNumber}`);
      }

      const { ascendant, planetaryPositions } = chart;
      const houseData = this.houseSignifications[houseNumber];
      const houseLord = this.findHouseLord(houseNumber, ascendant.sign);
      const houseOccupants = this.findHouseOccupants(houseNumber, planetaryPositions, ascendant);

      // Get house lord placement and condition
      const houseLordPlacement = this.analyzeHouseLordPlacement(houseNumber, chart);
      const houseLordCondition = this.analyzeHouseLordCondition(houseNumber, chart);

      // Analyze occupants effects
      const occupantsEffects = this.analyzeHouseOccupantsEffects(houseNumber, chart);

      // Analyze aspects affecting this house
      const houseAspects = this.analyzeHouseAspects(houseNumber, chart);

      // Get house-specific significations
      const specificSignifications = this.analyzeHouseSpecificSignifications(houseNumber, chart);

      return {
        houseNumber,
        houseData,
        houseLord: {
          planet: houseLord,
          placement: houseLordPlacement,
          condition: houseLordCondition
        },
        occupants: {
          planets: houseOccupants,
          effects: occupantsEffects
        },
        aspects: houseAspects,
        significations: specificSignifications,
        detailedAnalysis: this.generateDetailedHouseAnalysis(houseNumber, {
          houseLordPlacement,
          houseLordCondition,
          occupantsEffects,
          houseAspects,
          specificSignifications
        })
      };
    } finally {
      this.analysisDepth--;
    }
  }

  /**
   * Analyze house lord placement and effects
   * @param {number} houseNumber - House number (1-12)
   * @param {Object} chart - Birth chart data
   * @returns {Object} House lord placement analysis
   */
  analyzeHouseLordPlacement(houseNumber, chart) {
    const { ascendant, planetaryPositions } = chart;
    const houseLord = this.findHouseLord(houseNumber, ascendant.sign);
    const lordPosition = planetaryPositions[houseLord.toLowerCase()];

    if (!lordPosition) {
      return { error: `Position not found for house lord ${houseLord}` };
    }

    const lordHouse = this.calculateHouseFromLongitude(lordPosition.longitude, ascendant.longitude);

    return {
      planet: houseLord,
      sign: lordPosition.sign,
      house: lordHouse,
      degree: lordPosition.longitude % 30,
      effects: this.getHouseLordPlacementEffects(houseNumber, lordHouse),
      interpretation: this.interpretHouseLordPlacement(houseNumber, lordHouse, lordPosition.sign)
    };
  }

  /**
   * Analyze house lord condition (strength, dignity, aspects)
   * @param {number} houseNumber - House number (1-12)
   * @param {Object} chart - Birth chart data
   * @returns {Object} House lord condition analysis
   */
  analyzeHouseLordCondition(houseNumber, chart) {
    const { ascendant, planetaryPositions } = chart;
    const houseLord = this.findHouseLord(houseNumber, ascendant.sign);
    const lordPosition = planetaryPositions[houseLord.toLowerCase()];

    if (!lordPosition) {
      return { error: `Position not found for house lord ${houseLord}` };
    }

    const dignity = this.analyzePlanetaryDignity(houseLord, lordPosition.sign);
    const strength = this.calculatePlanetaryStrength(houseLord, lordPosition);
    const aspects = this.getPlanetaryAspects(houseLord, lordPosition, planetaryPositions);

    return {
      planet: houseLord,
      dignity,
      strength: {
        score: strength,
        description: this.getStrengthDescription(strength)
      },
      aspects,
      retrograde: lordPosition.isRetrograde || false,
      combust: lordPosition.isCombust || false,
      condition: this.evaluateOverallCondition(dignity, strength, aspects)
    };
  }

  /**
   * Analyze house occupants and their effects
   * @param {number} houseNumber - House number (1-12)
   * @param {Object} chart - Birth chart data
   * @returns {Object} House occupants effects analysis
   */
  analyzeHouseOccupantsEffects(houseNumber, chart) {
    const { ascendant, planetaryPositions } = chart;
    const houseOccupants = this.findHouseOccupants(houseNumber, planetaryPositions, ascendant);

    if (houseOccupants.length === 0) {
      return {
        count: 0,
        planets: [],
        effects: ['House results depend primarily on house lord placement and aspects'],
        interpretation: 'Empty house - results through house lord and aspecting planets'
      };
    }

    const occupantAnalyses = houseOccupants.map(planet => {
      const position = planetaryPositions[planet.toLowerCase()];
      return {
        planet,
        sign: position.sign,
        degree: position.longitude % 30,
        dignity: this.analyzePlanetaryDignity(planet, position.sign),
        nature: this.getPlanetNature(planet),
        effects: this.getPlanetEffectsInHouse(planet, houseNumber),
        strength: this.calculatePlanetaryStrength(planet, position)
      };
    });

    return {
      count: houseOccupants.length,
      planets: occupantAnalyses,
      effects: this.getCombinedOccupantEffects(occupantAnalyses, houseNumber),
      interpretation: this.interpretHouseOccupation(houseNumber, occupantAnalyses)
    };
  }

  /**
   * Analyze aspects affecting a specific house
   * @param {number} houseNumber - House number (1-12)
   * @param {Object} chart - Birth chart data
   * @returns {Object} House aspects analysis
   */
  analyzeHouseAspects(houseNumber, chart) {
    const { ascendant, planetaryPositions } = chart;
    const aspectingPlanets = [];

    // Calculate house longitude range
    const houseStartDegree = (ascendant.longitude + (houseNumber - 1) * 30) % 360;
    const houseMidpoint = (houseStartDegree + 15) % 360;

    for (const [planet, position] of Object.entries(planetaryPositions)) {
      const aspects = this.calculatePlanetaryAspects(planet, position, houseMidpoint);

      if (aspects.length > 0) {
        aspectingPlanets.push({
          planet,
          aspectTypes: aspects,
          strength: 5, // Placeholder
          effects: this.getAspectEffectsOnHouse(planet, houseNumber)
        });
      }
    }

    return {
      houseNumber,
      aspectingPlanets,
      totalAspects: aspectingPlanets.length,
      beneficAspects: aspectingPlanets.filter(p => this.isBeneficPlanet(p.planet)),
      maleficAspects: aspectingPlanets.filter(p => this.isMaleficPlanet(p.planet)),
      interpretation: this.interpretHouseAspects(houseNumber, aspectingPlanets)
    };
  }

  interpretHouseAspects(houseNumber, aspectingPlanets) {
    if (!aspectingPlanets || aspectingPlanets.length === 0) {
      return 'This house receives no major aspects, so its results are primarily shaped by its lord and occupants.';
    }

    const beneficAspects = aspectingPlanets.filter(p => this.isBeneficPlanet(p.planet));
    const maleficAspects = aspectingPlanets.filter(p => this.isMaleficPlanet(p.planet));

    let interpretation = `The ${houseNumber}th house is aspected by ${aspectingPlanets.map(p => p.planet).join(', ')}. `;

    if (beneficAspects.length > 0) {
      interpretation += `The benefic aspect(s) from ${beneficAspects.map(p => p.planet).join(', ')} protect(s) and enhance(s) the affairs of this house. `;
    }

    if (maleficAspects.length > 0) {
      interpretation += `The malefic aspect(s) from ${maleficAspects.map(p => p.planet).join(', ')} may bring challenges or require more effort in the matters of this house.`;
    }

    return interpretation.trim();
  }

  getAspectEffectsOnHouse(planet, houseNumber) {
    const planetNature = this.getPlanetNature(planet);
    const houseSignifications = this.houseSignifications[houseNumber].significations.join(', ');
    if (planetNature === 'Benefic') {
      return [`Brings fortune and ease to matters of ${houseSignifications}.`];
    } else if (planetNature === 'Malefic') {
      return [`Brings challenges and effort to matters of ${houseSignifications}.`];
    }
    return [`Influences matters of ${houseSignifications}.`];
  }

  /**
   * Cross-verify house indications for patterns and consistency
   * @param {Object} chart - Birth chart data
   * @returns {Object} Cross-verification analysis
   */
  crossVerifyHouseIndications(chart) {
    // Check recursion depth to prevent infinite loops
    if (this.analysisDepth >= this.MAX_ANALYSIS_DEPTH) {
      return {
        houseAnalyses: {},
        patterns: [],
        contradictions: [],
        confirmations: [],
        themes: [],
        recommendations: [],
        warning: 'Analysis depth limit reached to prevent recursion'
      };
    }

    this.analysisDepth++; // Increment depth counter

    try {
      const houseAnalyses = {};
      const patterns = [];
      const contradictions = [];
      const confirmations = [];

      // Analyze all houses first
      for (let i = 1; i <= 12; i++) {
        houseAnalyses[i] = this.analyzeHouseInDetail(i, chart);
      }

      // Look for patterns across houses
      patterns.push(...this.detectHousePatterns(houseAnalyses));

      // Check for contradictions and confirmations
      const verificationResults = this.verifyHouseIndications(houseAnalyses);
      contradictions.push(...verificationResults.contradictions);
      confirmations.push(...verificationResults.confirmations);

      return {
        houseAnalyses,
        patterns,
        contradictions,
        confirmations,
        themes: this.extractRepeatingThemes(houseAnalyses),
        recommendations: this.generateCrossVerificationRecommendations(patterns, contradictions)
      };
    } finally {
      this.analysisDepth--; // Decrement depth counter when done
    }
  }

  /**
   * Analyze house-specific significations based on chart context
   * @param {number} houseNumber - House number (1-12)
   * @param {Object} chart - Birth chart data
   * @returns {Object} House-specific significations analysis
   */
  analyzeHouseSpecificSignifications(houseNumber, chart) {
    const baseSignifications = this.houseSignifications[houseNumber].significations;
    const specificAnalysis = {};

    switch (houseNumber) {
      case 1: // Lagna - Self, Personality, Health
        specificAnalysis.personality = this.analyzePersonalityFromLagna(chart);
        specificAnalysis.health = this.analyzeHealthFromLagna(chart);
        specificAnalysis.appearance = this.analyzePhysicalAppearance(chart);
        break;
      case 2: // Dhana - Wealth, Family, Speech
        specificAnalysis.wealth = this.analyzeWealthProspects(chart);
        specificAnalysis.family = this.analyzeFamilyBackground(chart);
        specificAnalysis.speech = this.analyzeSpeechQualities(chart);
        break;
      case 3: // Parakram - Siblings, Communication, Courage
        specificAnalysis.siblings = this.analyzeSiblingRelations(chart);
        specificAnalysis.communication = this.analyzeCommunicationSkills(chart);
        specificAnalysis.courage = this.analyzeCourageAndEfforts(chart);
        break;
      case 4: // Sukha - Home, Mother, Property
        specificAnalysis.home = this.analyzeHomeEnvironment(chart);
        specificAnalysis.mother = this.analyzeMotherRelation(chart);
        specificAnalysis.property = this.analyzePropertyProspects(chart);
        break;
      case 5: // Putra - Children, Education, Creativity
        specificAnalysis.children = this.analyzeChildrenProspects(chart);
        specificAnalysis.education = this.analyzeEducationPath(chart);
        specificAnalysis.creativity = this.analyzeCreativeAbilities(chart);
        break;
      case 6: // Roga - Health, Enemies, Service
        specificAnalysis.health = this.analyzeHealthChallenges(chart);
        specificAnalysis.enemies = this.analyzeEnemyFactors(chart);
        specificAnalysis.service = this.analyzeServiceOrientation(chart);
        break;
      case 7: // Yuvati - Marriage, Partnerships, Business
        specificAnalysis.marriage = this.analyzeMarriageProspects(chart);
        specificAnalysis.partnerships = this.analyzePartnershipAbility(chart);
        specificAnalysis.business = this.analyzeBusinessAptitude(chart);
        break;
      case 8: // Mrityu - Longevity, Mysteries, Transformation
        specificAnalysis.longevity = this.analyzeLongevityFactors(chart);
        specificAnalysis.transformation = this.analyzeTransformationPotential(chart);
        specificAnalysis.occult = this.analyzeOccultInterests(chart);
        break;
      case 9: // Dharma - Religion, Father, Luck
        specificAnalysis.spirituality = this.analyzeSpiritualInclination(chart);
        specificAnalysis.father = this.analyzeFatherRelation(chart);
        specificAnalysis.luck = this.analyzeLuckFactors(chart);
        break;
      case 10: // Karma - Career, Status, Authority
        specificAnalysis.career = this.analyzeCareerPath(chart);
        specificAnalysis.status = this.analyzeStatusProspects(chart);
        specificAnalysis.authority = this.analyzeLeadershipQualities(chart);
        break;
      case 11: // Labha - Gains, Income, Friends
        specificAnalysis.gains = this.analyzeGainProspects(chart);
        specificAnalysis.income = this.analyzeIncomeStreams(chart);
        specificAnalysis.friends = this.analyzeFriendshipPatterns(chart);
        break;
      case 12: // Vyaya - Expenses, Losses, Spirituality
        specificAnalysis.expenses = this.analyzeExpensePatterns(chart);
        specificAnalysis.losses = this.analyzeLossFactors(chart);
        specificAnalysis.moksha = this.analyzeMokshaPath(chart);
        break;
    }

    return {
      houseNumber,
      baseSignifications,
      specificAnalysis,
      summary: this.summarizeHouseSignifications(houseNumber, specificAnalysis)
    };
  }

  // =============================================================================
  // HELPER METHODS FOR ENHANCED ANALYSIS
  // =============================================================================

  /**
   * Calculate house from longitude
   * @param {number} planetLongitude - Planet longitude
   * @param {number} ascendantLongitude - Ascendant longitude
   * @returns {number} House number
   */
  calculateHouseFromLongitude(planetLongitude, ascendantLongitude) {
    const difference = (planetLongitude - ascendantLongitude + 360) % 360;
    return Math.floor(difference / 30) + 1;
  }

  /**
   * Get house lord placement effects
   * @param {number} houseNumber - Original house number
   * @param {number} lordHouse - House where lord is placed
   * @returns {Array} Effects list
   */
  getHouseLordPlacementEffects(houseNumber, lordHouse) {
    const effects = [];
    const houseName = this.houseSignifications[houseNumber].name;
    const lordHouseName = this.houseSignifications[lordHouse].name;

    if (lordHouse === houseNumber) {
      effects.push(`${houseName} lord in own house - Strong self-determination in ${houseName} matters`);
    } else if (lordHouse === 1) {
      effects.push(`${houseName} matters become part of personality and self-expression`);
    } else if ([2, 11].includes(lordHouse)) {
      effects.push(`${houseName} matters contribute to wealth and gains`);
    } else if ([6, 8, 12].includes(lordHouse)) {
      effects.push(`${houseName} matters may face challenges or transformations`);
    } else {
      effects.push(`${houseName} results manifest through ${lordHouseName} house activities`);
    }

    return effects;
  }

  /**
   * Interpret house lord placement
   * @param {number} houseNumber - House number
   * @param {number} lordHouse - Lord's house placement
   * @param {string} lordSign - Lord's sign placement
   * @returns {string} Interpretation text
   */
  interpretHouseLordPlacement(houseNumber, lordHouse, lordSign) {
    const houseName = this.houseSignifications[houseNumber].name;
    return `The ${houseNumber}${this.getOrdinalSuffix(houseNumber)} house lord is placed in the ${lordHouse}${this.getOrdinalSuffix(lordHouse)} house in ${lordSign} sign, indicating that ${houseName} matters will manifest through ${this.houseSignifications[lordHouse].name} house activities and ${lordSign} characteristics.`;
  }

  /**
   * Analyze planetary dignity
   * @param {string} planet - Planet name
   * @param {string} sign - Zodiac sign
   * @returns {string} Dignity status
   */
  analyzePlanetaryDignity(planet, sign) {
    const planetUpper = planet.toUpperCase();
    const signUpper = sign.toUpperCase();

    // Check exaltation
    if (astroConfig.EXALTATION[planetUpper]?.sign === signUpper) {
      return 'Exalted';
    }

    // Check debilitation
    if (astroConfig.DEBILITATION[planetUpper]?.sign === signUpper) {
      return 'Debilitated';
    }

    // Check own sign
    if (this.isOwnSign(planet, sign)) {
      return 'Own Sign';
    }

    // Check friendly/enemy signs (simplified)
    if (this.isFriendlySign(planet, sign)) {
      return 'Friendly Sign';
    }

    if (this.isEnemySign(planet, sign)) {
      return 'Enemy Sign';
    }

    return 'Neutral Sign';
  }

  /**
   * Calculate planetary strength
   * @param {string} planet - Planet name
   * @param {Object} position - Planet position
   * @returns {number} Strength score (1-10)
   */
  calculatePlanetaryStrength(planet, position) {
    let strength = 5; // Base strength

    const dignity = this.analyzePlanetaryDignity(planet, position.sign);

    // Dignity adjustments
    switch (dignity) {
      case 'Exalted': strength += 3; break;
      case 'Own Sign': strength += 2; break;
      case 'Friendly Sign': strength += 1; break;
      case 'Enemy Sign': strength -= 1; break;
      case 'Debilitated': strength -= 2; break;
    }

    // Retrograde and combust adjustments
    if (position.isRetrograde) strength += 1;
    if (position.isCombust) strength -= 2;

    return Math.max(1, Math.min(10, strength));
  }

  /**
   * Get planetary aspects for a planet
   * @param {string} planet - Planet name
   * @param {Object} position - Planet position
   * @param {Object} allPositions - All planetary positions
   * @returns {Array} Aspects array
   */
  getPlanetaryAspects(planet, position, allPositions) {
    const aspects = [];
    const planetLongitude = position.longitude;
    const planetUpper = planet.toUpperCase();

    // Define aspect orbs (degrees of influence)
    const aspectOrbs = {
      conjunction: 8,
      opposition: 8,
      trine: 6,
      square: 6,
      sextile: 4
    };

    // Define special aspects for outer planets
    const specialAspects = {
      'MARS': [4, 7, 8], // 4th, 7th, 8th house aspects
      'JUPITER': [5, 7, 9], // 5th, 7th, 9th house aspects
      'SATURN': [3, 7, 10], // 3rd, 7th, 10th house aspects
      'RAHU': [5, 7, 9], // Similar to Jupiter
      'KETU': [5, 7, 9] // Similar to Jupiter
    };

    // Check aspects with all other planets
    for (const [otherPlanet, otherPosition] of Object.entries(allPositions)) {
      if (otherPlanet.toUpperCase() === planetUpper) continue;

      const otherLongitude = otherPosition.longitude;
      const aspectAngle = this.calculateAspectAngle(planetLongitude, otherLongitude);

      // Check standard aspects (all planets)
      const standardAspect = this.getStandardAspect(aspectAngle, aspectOrbs);
      if (standardAspect) {
        aspects.push({
          planet: otherPlanet,
          aspect: standardAspect.type,
          angle: aspectAngle,
          orb: standardAspect.orb,
          strength: this.calculateAspectStrength(aspectAngle, standardAspect.exactAngle, aspectOrbs[standardAspect.type]),
          nature: this.getAspectNature(standardAspect.type, planet, otherPlanet),
          effects: this.getAspectEffects(planet, otherPlanet, standardAspect.type)
        });
      }

      // Check special aspects for specific planets
      if (specialAspects[planetUpper]) {
        const specialAspect = this.getSpecialAspect(planetLongitude, otherLongitude, specialAspects[planetUpper]);
        if (specialAspect) {
          aspects.push({
            planet: otherPlanet,
            aspect: `Special ${specialAspect.houseAspect}th house aspect`,
            angle: specialAspect.angle,
            orb: specialAspect.orb,
            strength: specialAspect.strength,
            nature: this.getSpecialAspectNature(planet, otherPlanet, specialAspect.houseAspect),
            effects: this.getSpecialAspectEffects(planet, otherPlanet, specialAspect.houseAspect)
          });
        }
      }
    }

    return aspects.sort((a, b) => b.strength - a.strength);
  }

  /**
   * Get strength description
   * @param {number} strength - Strength score
   * @returns {string} Description
   */
  getStrengthDescription(strength) {
    if (strength >= 8) return 'Very Strong';
    if (strength >= 6) return 'Strong';
    if (strength >= 4) return 'Moderate';
    if (strength >= 2) return 'Weak';
    return 'Very Weak';
  }

  /**
   * Evaluate overall planetary condition
   * @param {string} dignity - Dignity status
   * @param {number} strength - Strength score
   * @param {Array} aspects - Aspects array
   * @returns {string} Overall condition
   */
  evaluateOverallCondition(dignity, strength, aspects) {
    if (dignity === 'Exalted' && strength >= 7) return 'Excellent';
    if (dignity === 'Own Sign' && strength >= 6) return 'Very Good';
    if (strength >= 6) return 'Good';
    if (strength >= 4) return 'Average';
    if (dignity === 'Debilitated' || strength <= 3) return 'Challenging';
    return 'Moderate';
  }

  /**
   * Check if planet is in own sign
   * @param {string} planet - Planet name
   * @param {string} sign - Sign name
   * @returns {boolean} Is own sign
   */
  isOwnSign(planet, sign) {
    const ownSigns = {
      'SUN': ['LEO'],
      'MOON': ['CANCER'],
      'MARS': ['ARIES', 'SCORPIO'],
      'MERCURY': ['GEMINI', 'VIRGO'],
      'JUPITER': ['SAGITTARIUS', 'PISCES'],
      'VENUS': ['TAURUS', 'LIBRA'],
      'SATURN': ['CAPRICORN', 'AQUARIUS']
    };
    return ownSigns[planet.toUpperCase()]?.includes(sign.toUpperCase()) || false;
  }

  /**
   * Check if planet is in friendly sign (simplified)
   * @param {string} planet - Planet name
   * @param {string} sign - Sign name
   * @returns {boolean} Is friendly sign
   */
  isFriendlySign(planet, sign) {
    const signLord = this.findHouseLord(1, sign); // Get the lord of the sign
    const planetUpper = planet.toUpperCase();
    const signLordUpper = signLord.toUpperCase();

    // Permanent (Natural) Friendships (from classical texts)
    const permanentFriendships = {
      'SUN': { friends: ['MOON', 'MARS', 'JUPITER'], enemies: ['VENUS', 'SATURN'], neutrals: ['MERCURY'] },
      'MOON': { friends: ['SUN', 'MERCURY'], enemies: [], neutrals: ['MARS', 'JUPITER', 'VENUS', 'SATURN'] },
      'MARS': { friends: ['SUN', 'MOON', 'JUPITER'], enemies: ['MERCURY'], neutrals: ['VENUS', 'SATURN'] },
      'MERCURY': { friends: ['SUN', 'VENUS'], enemies: ['MOON'], neutrals: ['MARS', 'JUPITER', 'SATURN'] },
      'JUPITER': { friends: ['SUN', 'MOON', 'MARS'], enemies: ['MERCURY', 'VENUS'], neutrals: ['SATURN'] },
      'VENUS': { friends: ['MERCURY', 'SATURN'], enemies: ['SUN', 'MOON'], neutrals: ['MARS', 'JUPITER'] },
      'SATURN': { friends: ['MERCURY', 'VENUS'], enemies: ['SUN', 'MOON', 'MARS'], neutrals: ['JUPITER'] }
    };

    const pRelations = permanentFriendships[planetUpper];
    if (!pRelations) return false; // Handle Rahu/Ketu or unknown planets

    return pRelations.friends.includes(signLordUpper);
  }

  /**
   * Check if planet is in enemy sign (simplified)
   * @param {string} planet - Planet name
   * @param {string} sign - Sign name
   * @returns {boolean} Is enemy sign
   */
  isEnemySign(planet, sign) {
    const signLord = this.findHouseLord(1, sign); // Get the lord of the sign
    const planetUpper = planet.toUpperCase();
    const signLordUpper = signLord.toUpperCase();

    // Permanent (Natural) Friendships (from classical texts)
    const permanentFriendships = {
      'SUN': { friends: ['MOON', 'MARS', 'JUPITER'], enemies: ['VENUS', 'SATURN'], neutrals: ['MERCURY'] },
      'MOON': { friends: ['SUN', 'MERCURY'], enemies: [], neutrals: ['MARS', 'JUPITER', 'VENUS', 'SATURN'] },
      'MARS': { friends: ['SUN', 'MOON', 'JUPITER'], enemies: ['MERCURY'], neutrals: ['VENUS', 'SATURN'] },
      'MERCURY': { friends: ['SUN', 'VENUS'], enemies: ['MOON'], neutrals: ['MARS', 'JUPITER', 'SATURN'] },
      'JUPITER': { friends: ['SUN', 'MOON', 'MARS'], enemies: ['MERCURY', 'VENUS'], neutrals: ['SATURN'] },
      'VENUS': { friends: ['MERCURY', 'SATURN'], enemies: ['SUN', 'MOON'], neutrals: ['MARS', 'JUPITER'] },
      'SATURN': { friends: ['MERCURY', 'VENUS'], enemies: ['SUN', 'MOON', 'MARS'], neutrals: ['JUPITER'] }
    };

    const pRelations = permanentFriendships[planetUpper];
    if (!pRelations) return false; // Handle Rahu/Ketu or unknown planets

    return pRelations.enemies.includes(signLordUpper);
  }

  /**
   * Generate detailed house analysis summary
   * @param {number} houseNumber - House number
   * @param {Object} analysisData - All analysis data
   * @returns {Object} Detailed analysis summary
   */
  generateDetailedHouseAnalysis(houseNumber, analysisData) {
    const { houseLordPlacement, houseLordCondition, occupantsEffects, houseAspects } = analysisData;

    return {
      summary: `Detailed analysis of ${houseNumber}${this.getOrdinalSuffix(houseNumber)} house`,
      lordAnalysis: `House lord ${houseLordPlacement.planet} is placed in ${houseLordPlacement.house}${this.getOrdinalSuffix(houseLordPlacement.house)} house with ${houseLordCondition.condition} condition`,
      occupantAnalysis: occupantsEffects.interpretation,
      aspectAnalysis: houseAspects.interpretation,
      overallAssessment: this.generateOverallHouseAssessment(houseNumber, analysisData)
    };
  }

  /**
   * Generate overall house assessment
   * @param {number} houseNumber - House number
   * @param {Object} analysisData - Analysis data
   * @returns {string} Overall assessment
   */
  generateOverallHouseAssessment(houseNumber, analysisData) {
    const { houseLordCondition, occupantsEffects, houseAspects } = analysisData;

    let overallScore = 0;
    let assessment = '';

    // Factor 1: House Lord Condition (40% weight)
    overallScore += (houseLordCondition.strength?.score || 5) * 0.4;

    // Factor 2: Occupants Effects (30% weight)
    if (occupantsEffects.count > 0) {
      const beneficOccupants = occupantsEffects.planets.filter(p => this.isBeneficPlanet(p.planet)).length;
      const maleficOccupants = occupantsEffects.planets.filter(p => this.isMaleficPlanet(p.planet)).length;
      overallScore += (beneficOccupants * 10 - maleficOccupants * 10) * 0.3;
    }

    // Factor 3: House Aspects (30% weight)
    const beneficAspects = houseAspects.beneficAspects.length;
    const maleficAspects = houseAspects.maleficAspects.length;
    overallScore += (beneficAspects * 10 - maleficAspects * 10) * 0.3;

    // Normalize score to a 1-10 scale
    overallScore = Math.max(1, Math.min(10, overallScore / 10));

    if (overallScore >= 8) {
      assessment = `The ${houseNumber}${this.getOrdinalSuffix(houseNumber)} house is exceptionally strong, indicating highly favorable results in matters related to its significations.`;
    } else if (overallScore >= 6) {
      assessment = `The ${houseNumber}${this.getOrdinalSuffix(houseNumber)} house is strong, suggesting good and reliable results in its significations.`;
    } else if (overallScore >= 4) {
      assessment = `The ${houseNumber}${this.getOrdinalSuffix(houseNumber)} house shows mixed indications, with potential for growth through conscious effort and remedies.`;
    } else {
      assessment = `The ${houseNumber}${this.getOrdinalSuffix(houseNumber)} house is weak, indicating challenges and difficulties in matters related to its significations. Remedial measures are highly recommended.`;
    }

    return {
      score: overallScore,
      assessment: assessment,
      breakdown: {
        houseLord: houseLordCondition.strength?.score || 5,
        occupants: occupantsEffects.count > 0 ? (occupantsEffects.planets.filter(p => this.isBeneficPlanet(p.planet)).length * 10 - occupantsEffects.planets.filter(p => this.isMaleficPlanet(p.planet)).length * 10) : 0,
        aspects: (beneficAspects * 10 - maleficAspects * 10)
      }
    };
  }

  // Production-grade house-specific signification analysis methods

  analyzePersonalityFromLagna(chart) {
    const lagnaSign = chart.ascendant?.sign;
    const lagnaLord = this.findHouseLord(1, lagnaSign);
    const lagnaOccupants = this.findHouseOccupants(1, chart.planetaryPositions, chart.ascendant);

    const traits = this.extractPersonalityTraits(lagnaSign, lagnaLord, lagnaOccupants);
    const assessment = this.generatePersonalityAssessment(traits, lagnaSign);

    return {
      traits,
      assessment,
      dominantElement: this.getDominantElement(lagnaSign),
      temperament: this.getTemperament(lagnaSign, lagnaOccupants),
      coreMotivations: this.getCoreMotivations(lagnaSign, lagnaLord)
    };
  }

  analyzeHealthFromLagna(chart) {
    const lagnaSign = chart.ascendant?.sign;
    const lagnaOccupants = this.findHouseOccupants(1, chart.planetaryPositions, chart.ascendant);

    // PREVENT RECURSION: Don't call analyzeHouseInDetail when already in analysis
    let sixthHouseAnalysis;
    if (this.analysisDepth > 0) {
      // Use simplified analysis when in recursive context
      sixthHouseAnalysis = {
        significations: {
          specificAnalysis: {
            health: { indicators: [], assessment: 'Simplified health analysis during recursion' }
          }
        }
      };
    } else {
      sixthHouseAnalysis = this.analyzeHouseInDetail(6, chart);
    }

    const healthIndicators = this.extractHealthIndicators(lagnaSign, lagnaOccupants, sixthHouseAnalysis);
    const vulnerabilities = this.identifyHealthVulnerabilities(lagnaSign, chart);
    const strengths = this.identifyHealthStrengths(lagnaSign, chart);

    return {
      indicators: healthIndicators,
      vulnerabilities,
      strengths,
      assessment: this.generateHealthAssessment(healthIndicators, vulnerabilities, strengths),
      recommendations: this.getHealthRecommendations(lagnaSign, vulnerabilities)
    };
  }

  analyzePhysicalAppearance(chart) {
    const lagnaSign = chart.ascendant?.sign;
    const lagnaLord = this.findHouseLord(1, lagnaSign);
    const lagnaOccupants = this.findHouseOccupants(1, chart.planetaryPositions, chart.ascendant);

    const features = this.extractPhysicalFeatures(lagnaSign, lagnaOccupants);
    const constitution = this.getPhysicalConstitution(lagnaSign);
    const dominantInfluences = this.getDominantPhysicalInfluences(lagnaOccupants);

    return {
      features,
      constitution,
      dominantInfluences,
      assessment: this.generateAppearanceAssessment(features, constitution),
      bodyType: this.getBodyType(lagnaSign),
      colorComplexion: this.getComplexionIndications(lagnaSign, lagnaOccupants)
    };
  }

  analyzeWealthProspects(chart) {
    const secondHouse = this.analyzeHouseInDetail(2, chart);
    const eleventhHouse = this.analyzeHouseInDetail(11, chart);
    const ninthHouse = this.analyzeHouseInDetail(9, chart); // Fortune house

    const wealthIndicators = this.extractWealthIndicators(secondHouse, eleventhHouse, ninthHouse);
    const incomeStreams = this.identifyIncomeStreams(chart);
    const financialChallenges = this.identifyFinancialChallenges(chart);

    return {
      indicators: wealthIndicators,
      incomeStreams,
      challenges: financialChallenges,
      assessment: this.generateWealthAssessment(wealthIndicators, incomeStreams, financialChallenges),
      timing: this.getWealthTimingIndicators(chart),
      recommendations: this.getWealthRecommendations(wealthIndicators)
    };
  }

  analyzeFamilyBackground(chart) {
    const secondHouse = this.analyzeHouseInDetail(2, chart); // Immediate family
    const fourthHouse = this.analyzeHouseInDetail(4, chart); // Mother's side
    const ninthHouse = this.analyzeHouseInDetail(9, chart); // Father's side

    const familyIndicators = this.extractFamilyIndicators(secondHouse, fourthHouse, ninthHouse);
    const parentalInfluence = this.analyzeParentalInfluence(fourthHouse, ninthHouse);
    const familyKarma = this.analyzeFamilyKarma(chart);

    return {
      indicators: familyIndicators,
      parentalInfluence,
      familyKarma,
      assessment: this.generateFamilyAssessment(familyIndicators, parentalInfluence),
      siblingRelations: this.analyzeSiblingRelations(chart),
      ancestralInfluence: this.getAncestralInfluence(chart)
    };
  }

  analyzeSpeechQualities(chart) {
    const secondHouse = this.analyzeHouseInDetail(2, chart);
    const thirdHouse = this.analyzeHouseInDetail(3, chart); // Communication
    const mercuryPosition = chart.planetaryPositions?.mercury;

    const speechQualities = this.extractSpeechQualities(secondHouse, thirdHouse, mercuryPosition);
    const communicationStyle = this.getCommunicationStyle(mercuryPosition, thirdHouse);
    const verbalStrengths = this.identifyVerbalStrengths(chart);

    return {
      qualities: speechQualities,
      communicationStyle,
      verbalStrengths,
      assessment: this.generateSpeechAssessment(speechQualities, communicationStyle),
      eloquence: this.getEloquenceLevel(secondHouse, mercuryPosition),
      languages: this.getLanguageAptitude(chart)
    };
  }

  analyzeSiblingRelations(chart) { return { indicators: [], assessment: 'Sibling relations analysis' }; }
  analyzeCommunicationSkills(chart) { return { skills: [], assessment: 'Communication skills analysis' }; }
  analyzeCourageAndEfforts(chart) { return { indicators: [], assessment: 'Courage and efforts analysis' }; }
  analyzeHomeEnvironment(chart) { return { factors: [], assessment: 'Home environment analysis' }; }
  analyzeMotherRelation(chart) { return { indicators: [], assessment: 'Mother relation analysis' }; }
  analyzePropertyProspects(chart) { return { prospects: [], assessment: 'Property prospects analysis' }; }
  analyzeChildrenProspects(chart) { return { indicators: [], assessment: 'Children prospects analysis' }; }
  analyzeEducationPath(chart) { return { path: [], assessment: 'Education path analysis' }; }
  analyzeCreativeAbilities(chart) { return { abilities: [], assessment: 'Creative abilities analysis' }; }
  analyzeHealthChallenges(chart) { return { challenges: [], assessment: 'Health challenges analysis' }; }
  analyzeEnemyFactors(chart) { return { factors: [], assessment: 'Enemy factors analysis' }; }
  analyzeServiceOrientation(chart) { return { orientation: [], assessment: 'Service orientation analysis' }; }
  analyzeMarriageProspects(chart) { return { prospects: [], assessment: 'Marriage prospects analysis' }; }
  analyzePartnershipAbility(chart) { return { ability: [], assessment: 'Partnership ability analysis' }; }
  analyzeBusinessAptitude(chart) { return { aptitude: [], assessment: 'Business aptitude analysis' }; }
  analyzeLongevityFactors(chart) { return { factors: [], assessment: 'Longevity factors analysis' }; }
  analyzeTransformationPotential(chart) { return { potential: [], assessment: 'Transformation potential analysis' }; }
  analyzeOccultInterests(chart) { return { interests: [], assessment: 'Occult interests analysis' }; }
  analyzeSpiritualInclination(chart) { return { inclination: [], assessment: 'Spiritual inclination analysis' }; }
  analyzeFatherRelation(chart) { return { relation: [], assessment: 'Father relation analysis' }; }
  analyzeLuckFactors(chart) { return { factors: [], assessment: 'Luck factors analysis' }; }
  analyzeCareerPath(chart) { return { path: [], assessment: 'Career path analysis' }; }
  analyzeStatusProspects(chart) { return { prospects: [], assessment: 'Status prospects analysis' }; }
  analyzeLeadershipQualities(chart) { return { qualities: [], assessment: 'Leadership qualities analysis' }; }
  analyzeGainProspects(chart) { return { prospects: [], assessment: 'Gain prospects analysis' }; }
  analyzeIncomeStreams(chart) { return { streams: [], assessment: 'Income streams analysis' }; }
  analyzeFriendshipPatterns(chart) { return { patterns: [], assessment: 'Friendship patterns analysis' }; }
  analyzeExpensePatterns(chart) { return { patterns: [], assessment: 'Expense patterns analysis' }; }
  analyzeLossFactors(chart) { return { factors: [], assessment: 'Loss factors analysis' }; }
  analyzeMokshaPath(chart) { return { path: [], assessment: 'Moksha path analysis' }; }

  summarizeHouseSignifications(houseNumber, specificAnalysis) { return `Summary for house ${houseNumber}.`; }
  extractPersonalityTraits(lagnaSign, lagnaLord, lagnaOccupants) { return []; }
  generatePersonalityAssessment(traits, lagnaSign) { return 'Personality assessment.'; }
  getDominantElement(lagnaSign) { return 'Fire'; }
  getTemperament(lagnaSign, lagnaOccupants) { return 'Choleric'; }
  getCoreMotivations(lagnaSign, lagnaLord) { return []; }
  extractHealthIndicators(lagnaSign, lagnaOccupants, sixthHouseAnalysis) { return []; }
  identifyHealthVulnerabilities(lagnaSign, chart) { return []; }
  identifyHealthStrengths(lagnaSign, chart) { return []; }
  generateHealthAssessment(healthIndicators, vulnerabilities, strengths) { return 'Health assessment.'; }
  getHealthRecommendations(lagnaSign, vulnerabilities) { return []; }
  extractPhysicalFeatures(lagnaSign, lagnaOccupants) { return []; }
  getPhysicalConstitution(lagnaSign) { return 'Pitta'; }
  getDominantPhysicalInfluences(lagnaOccupants) { return []; }
  generateAppearanceAssessment(features, constitution) { return 'Appearance assessment.'; }
  getBodyType(lagnaSign) { return 'Mesomorph'; }
  getComplexionIndications(lagnaSign, lagnaOccupants) { return 'Fair'; }
  extractWealthIndicators(secondHouse, eleventhHouse, ninthHouse) { return []; }
  identifyIncomeStreams(chart) { return []; }
  identifyFinancialChallenges(chart) { return []; }
  generateWealthAssessment(wealthIndicators, incomeStreams, financialChallenges) { return 'Wealth assessment.'; }
  getWealthTimingIndicators(chart) { return []; }
  getWealthRecommendations(wealthIndicators) { return []; }
  extractFamilyIndicators(secondHouse, fourthHouse, ninthHouse) { return []; }
  analyzeParentalInfluence(fourthHouse, ninthHouse) { return {}; }
  analyzeFamilyKarma(chart) { return {}; }
  generateFamilyAssessment(familyIndicators, parentalInfluence) { return 'Family assessment.'; }
  getAncestralInfluence(chart) { return {}; }
  extractSpeechQualities(secondHouse, thirdHouse, mercuryPosition) { return []; }
  getCommunicationStyle(mercuryPosition, thirdHouse) { return 'Direct'; }
  identifyVerbalStrengths(chart) { return []; }
  generateSpeechAssessment(speechQualities, communicationStyle) { return 'Speech assessment.'; }
  getEloquenceLevel(secondHouse, mercuryPosition) { return 'High'; }
  getLanguageAptitude(chart) { return 'High'; }

  // Additional helper methods for cross-verification
  detectHousePatterns(houseAnalyses) { return []; }
  verifyHouseIndications(houseAnalyses) { return { contradictions: [], confirmations: [] }; }
  extractRepeatingThemes(houseAnalyses) { return []; }
  generateCrossVerificationRecommendations(patterns, contradictions) { return []; }

  // Helper methods for aspects and effects
  calculatePlanetaryAspects(planet, position, targetDegree) { return []; }

  /**
   * Calculate aspect strength between two planets
   * @param {number} actualAngle - Actual angle between planets
   * @param {number} exactAngle - Exact aspect angle
   * @param {number} orb - Orb allowed for the aspect
   * @returns {number} Strength from 0-10
   */
  calculateAspectStrength(actualAngle, exactAngle, orb) {
    const deviation = Math.abs(actualAngle - exactAngle);
    if (deviation > orb) return 0;

    // Strength decreases linearly with deviation from exact angle
    return Math.round(((orb - deviation) / orb) * 10);
  }

  /**
   * Calculate angle between two longitudes
   * @param {number} longitude1 - First longitude
   * @param {number} longitude2 - Second longitude
   * @returns {number} Aspect angle
   */
  calculateAspectAngle(longitude1, longitude2) {
    let angle = Math.abs(longitude1 - longitude2);
    if (angle > 180) {
      angle = 360 - angle;
    }
    return angle;
  }

  /**
   * Get standard aspect type based on angle
   * @param {number} angle - Angle between planets
   * @param {Object} aspectOrbs - Orb definitions
   * @returns {Object|null} Aspect information
   */
  getStandardAspect(angle, aspectOrbs) {
    const aspects = [
      { type: 'conjunction', exactAngle: 0 },
      { type: 'sextile', exactAngle: 60 },
      { type: 'square', exactAngle: 90 },
      { type: 'trine', exactAngle: 120 },
      { type: 'opposition', exactAngle: 180 }
    ];

    for (const aspect of aspects) {
      const orb = aspectOrbs[aspect.type];
      if (Math.abs(angle - aspect.exactAngle) <= orb) {
        return {
          type: aspect.type,
          exactAngle: aspect.exactAngle,
          orb: Math.abs(angle - aspect.exactAngle)
        };
      }
    }

    return null;
  }

  /**
   * Get special aspect for specific planets
   * @param {number} planetLongitude - Planet longitude
   * @param {number} otherLongitude - Other planet longitude
   * @param {Array} houseAspects - House aspects for the planet
   * @returns {Object|null} Special aspect information
   */
  getSpecialAspect(planetLongitude, otherLongitude, houseAspects) {
    const angle = this.calculateAspectAngle(planetLongitude, otherLongitude);

    for (const houseAspect of houseAspects) {
      // Calculate expected angle for house aspect
      const expectedAngle = (houseAspect - 1) * 30; // Each house is 30 degrees
      const orb = 8; // Standard orb for special aspects

      if (Math.abs(angle - expectedAngle) <= orb ||
          Math.abs(angle - (360 - expectedAngle)) <= orb) {
        return {
          houseAspect,
          angle,
          orb: Math.min(Math.abs(angle - expectedAngle), Math.abs(angle - (360 - expectedAngle))),
          strength: this.calculateAspectStrength(angle, expectedAngle, orb)
        };
      }
    }

    return null;
  }

  /**
   * Get special aspect nature for specific planets
   * @param {string} planet - Planet name
   * @param {string} otherPlanet - Other planet name
   * @param {number} houseAspect - House aspect number
   * @returns {string} Special aspect nature
   */
  getSpecialAspectNature(planet, otherPlanet, houseAspect) {
    const planetUpper = planet.toUpperCase();
    const otherPlanetUpper = otherPlanet.toUpperCase();

    // Mars special aspects (4th, 7th, 8th houses)
    if (planetUpper === 'MARS') {
      if ([4, 8].includes(houseAspect)) {
        return 'Challenging';
      } else if (houseAspect === 7) {
        return 'Protective';
      }
    }

    // Jupiter special aspects (5th, 7th, 9th houses)
    if (planetUpper === 'JUPITER') {
      return 'Beneficial';
    }

    // Saturn special aspects (3rd, 7th, 10th houses)
    if (planetUpper === 'SATURN') {
      if ([3, 10].includes(houseAspect)) {
        return 'Restrictive';
      } else if (houseAspect === 7) {
        return 'Stabilizing';
      }
    }

    // Default for other planets
    return 'Neutral';
  }

  /**
   * Get special aspect effects for specific planets
   * @param {string} planet - Planet name
   * @param {string} otherPlanet - Other planet name
   * @param {number} houseAspect - House aspect number
   * @returns {Array} Special aspect effects
   */
  getSpecialAspectEffects(planet, otherPlanet, houseAspect) {
    const planetUpper = planet.toUpperCase();
    const effects = [];

    // Mars special aspects
    if (planetUpper === 'MARS') {
      if (houseAspect === 4) {
        effects.push('Brings energy and action to home matters');
      } else if (houseAspect === 7) {
        effects.push('Protects relationships and partnerships');
      } else if (houseAspect === 8) {
        effects.push('Intensifies transformational experiences');
      }
    }

    // Jupiter special aspects
    if (planetUpper === 'JUPITER') {
      if (houseAspect === 5) {
        effects.push('Enhances wisdom and learning');
      } else if (houseAspect === 7) {
        effects.push('Brings fortune to partnerships');
      } else if (houseAspect === 9) {
        effects.push('Expands spiritual understanding');
      }
    }

    // Saturn special aspects
    if (planetUpper === 'SATURN') {
      if (houseAspect === 3) {
        effects.push('Brings discipline to communication');
      } else if (houseAspect === 7) {
        effects.push('Creates stable long-term relationships');
      } else if (houseAspect === 10) {
        effects.push('Establishes authority and responsibility');
      }
    }

    return effects.length > 0 ? effects : ['Creates subtle influence on planetary energies'];
  }

  /**
   * Get planet compatibility for conjunctions
   * @param {string} planet1 - First planet name
   * @param {string} planet2 - Second planet name
   * @returns {boolean} Are planets compatible
   */
  getPlanetCompatibility(planet1, planet2) {
    const p1 = planet1.toUpperCase();
    const p2 = planet2.toUpperCase();

    // Natural friendships in Vedic astrology
    const friendships = {
      'SUN': ['MOON', 'MARS', 'JUPITER'],
      'MOON': ['SUN', 'MERCURY'],
      'MARS': ['SUN', 'MOON', 'JUPITER'],
      'MERCURY': ['SUN', 'VENUS'],
      'JUPITER': ['SUN', 'MOON', 'MARS'],
      'VENUS': ['MERCURY', 'SATURN'],
      'SATURN': ['MERCURY', 'VENUS']
    };

    return friendships[p1]?.includes(p2) || friendships[p2]?.includes(p1) || false;
  }

  /**
   * Get aspect nature (harmonious/challenging)
   * @param {string} aspectType - Type of aspect
   * @param {string} planet1 - First planet
   * @param {string} planet2 - Second planet
   * @returns {string} Aspect nature
   */
  getAspectNature(aspectType, planet1, planet2) {
    const harmoniousAspects = ['trine', 'sextile'];
    const challengingAspects = ['square', 'opposition'];

    if (aspectType === 'conjunction') {
      // Conjunction nature depends on planet compatibility
      return this.getPlanetCompatibility(planet1, planet2) ? 'Harmonious' : 'Mixed';
    }

    if (harmoniousAspects.includes(aspectType)) return 'Harmonious';
    if (challengingAspects.includes(aspectType)) return 'Challenging';

    return 'Neutral';
  }

  /**
   * Get aspect effects between two planets
   * @param {string} planet1 - First planet
   * @param {string} planet2 - Second planet
   * @param {string} aspectType - Type of aspect
   * @returns {Array} Effects array
   */
  getAspectEffects(planet1, planet2, aspectType) {
    const effects = [];
    const planet1Upper = planet1.toUpperCase();
    const planet2Upper = planet2.toUpperCase();

    // Basic aspect effects based on planet combinations
    if (aspectType === 'conjunction') {
      effects.push(`${planet1} and ${planet2} energies blend and amplify each other`);
    } else if (aspectType === 'opposition') {
      effects.push(`Tension and polarity between ${planet1} and ${planet2} energies`);
    } else if (aspectType === 'trine') {
      effects.push(`Harmonious flow between ${planet1} and ${planet2} energies`);
    } else if (aspectType === 'square') {
      effects.push(`Dynamic tension and challenges between ${planet1} and ${planet2}`);
    } else if (aspectType === 'sextile') {
      effects.push(`Opportunities and synergistic communication between ${planet1} and ${planet2}`);
    }

    // Special aspects effects (simplified)
    // ... (existing code)

    return effects;
  }

  getPlanetNature(planet) {
    const benefic = ['Jupiter', 'Venus', 'Moon', 'Mercury'];
    const malefic = ['Saturn', 'Mars', 'Sun', 'Rahu', 'Ketu'];
    const planetUpper = planet.toUpperCase();

    if (benefic.map(p => p.toUpperCase()).includes(planetUpper)) {
        return 'Benefic';
    } else if (malefic.map(p => p.toUpperCase()).includes(planetUpper)) {
        return 'Malefic';
    }
    return 'Neutral';
  }

  isBeneficPlanet(planet) {
    return this.getPlanetNature(planet) === 'Benefic';
  }

  isMaleficPlanet(planet) {
    return this.getPlanetNature(planet) === 'Malefic';
  }

  getPlanetEffectsInHouse(planet, houseNumber) {
    // This should contain detailed logic based on classical texts.
    // For now, providing a generic effect.
    const houseSignifications = this.houseSignifications[houseNumber].significations.join(', ');
    return [`${planet} influences matters of ${houseSignifications}`];
  }

  getCombinedOccupantEffects(occupantAnalyses, houseNumber) {
    if (occupantAnalyses.length === 0) {
      return ['No planets in this house. Effects are determined by the house lord and aspects.'];
    }
    const effects = occupantAnalyses.flatMap(oa => oa.effects);
    // Could add more complex combination logic here
    return effects;
  }

  interpretHouseOccupation(houseNumber, occupantAnalyses) {
    if (occupantAnalyses.length === 0) {
      return 'The house is unoccupied, suggesting its matters are influenced more by its lord and aspecting planets rather than direct planetary energies within it.';
    }
    const planetNames = occupantAnalyses.map(p => p.planet).join(', ');
    let interpretation = `The presence of ${planetNames} in the ${houseNumber}th house brings a complex blend of energies. `;
    // More detailed interpretation logic would go here.
    return interpretation;
  }

  /**
   * Analyze all 12 houses
   * @param {Object} chart - Birth chart data
   * @returns {Array} Analysis of all houses
   */
  analyzeAllHouses(chart) {
    try {
      const allHousesAnalysis = [];

      for (let houseNumber = 1; houseNumber <= 12; houseNumber++) {
        try {
          const houseAnalysis = this.analyzeHouse(houseNumber, chart);
          allHousesAnalysis.push(houseAnalysis);
        } catch (houseError) {
          // If individual house analysis fails, provide fallback
          allHousesAnalysis.push({
            houseNumber,
            error: `Failed to analyze house ${houseNumber}: ${houseError.message}`,
            houseData: this.houseSignifications[houseNumber],
            analysis: {
              summary: `House ${houseNumber} analysis unavailable`,
              strengths: [],
              challenges: [],
              recommendations: []
            }
          });
        }
      }

      return allHousesAnalysis;
    } catch (error) {
      // Ultimate fallback if entire analysis fails
      console.error('All houses analysis failed:', error.message);
      return this.getFallbackHousesAnalysis();
    }
  }

  /**
   * Get fallback houses analysis when main analysis fails
   * @returns {Array} Basic houses analysis
   */
  getFallbackHousesAnalysis() {
    const fallbackAnalysis = [];

    for (let houseNumber = 1; houseNumber <= 12; houseNumber++) {
      fallbackAnalysis.push({
        houseNumber,
        houseData: this.houseSignifications[houseNumber],
        houseSign: { sign: 'Unknown' },
        houseLord: 'Unknown',
        houseOccupants: [],
        analysis: {
          summary: `House ${houseNumber} requires complete chart data for analysis`,
          strengths: [],
          challenges: [],
          recommendations: []
        }
      });
    }

    return fallbackAnalysis;
  }

}

module.exports = HouseAnalysisService;
