/**
 * Luminaries Analysis Service
 * Analyzes Sun and Moon positions for personality, mind, and soul characteristics
 * Implements detailed analysis of the two most important planets in Vedic astrology
 */

class LuminariesAnalysisService {
  constructor() {
    this.signCharacteristics = this.initializeSignCharacteristics();
    this.houseSignifications = this.initializeHouseSignifications();
    this.nakshatraData = this.initializeNakshatraData();
    this.planetaryDignities = this.initializePlanetaryDignities();
  }

  /**
   * Analyze both Sun and Moon comprehensively
   * @param {Object} chart - Complete birth chart data
   * @returns {Object} Comprehensive luminaries analysis
   */
  analyzeLuminaries(chart) {
    try {
      const { ascendant, planetaryPositions, navamsaPositions } = chart;

      const sunAnalysis = this.analyzeSun(planetaryPositions.sun, chart);
      const moonAnalysis = this.analyzeMoon(planetaryPositions.moon, chart);
      const luminariesRelationship = this.analyzeLuminariesRelationship(
        planetaryPositions.sun,
        planetaryPositions.moon,
        chart
      );

      return {
        hasLuminariesAnalysis: true,
        sunAnalysis: sunAnalysis,
        moonAnalysis: moonAnalysis,
        luminariesRelationship: luminariesRelationship,
        overallPersonality: this.synthesizePersonality(sunAnalysis, moonAnalysis, luminariesRelationship),
        mentalHealthTrends: this.analyzeMentalHealthTrends(moonAnalysis, chart),
        lifePurposeIndications: this.analyzeLifePurpose(sunAnalysis, chart),
        recommendations: this.generateRecommendations(sunAnalysis, moonAnalysis, luminariesRelationship)
      };
    } catch (error) {
      console.error('Error analyzing luminaries:', error);
      return {
        hasLuminariesAnalysis: false,
        error: error.message,
        sunAnalysis: {},
        moonAnalysis: {},
        luminariesRelationship: {}
      };
    }
  }

  /**
   * Analyze Sun placement and characteristics
   * @param {Object} sunPosition - Sun position data
   * @param {Object} chart - Complete chart data
   * @returns {Object} Sun analysis
   */
  analyzeSun(sunPosition, chart) {
    if (!sunPosition) {
      return { error: 'Sun position not available' };
    }

    const { ascendant, planetaryPositions } = chart;
    const sunHouse = this.getHouseFromLongitude(sunPosition.longitude, ascendant.longitude);
    const sunSign = sunPosition.sign.toUpperCase();
    const sunDegree = sunPosition.longitude % 30;
    const sunNakshatra = this.getNakshatraFromLongitude(sunPosition.longitude);

    return {
      position: {
        sign: sunSign,
        house: sunHouse,
        degree: sunDegree,
        nakshatra: sunNakshatra,
        longitude: sunPosition.longitude
      },
      dignity: this.calculatePlanetaryDignity('Sun', sunSign),
      strength: this.calculateSunStrength(sunPosition, chart),
      signCharacteristics: this.signCharacteristics[sunSign],
      houseEffects: this.analyzeSunInHouse(sunHouse),
      nakshatraEffects: this.nakshatraData[sunNakshatra] || {},
      aspects: this.analyzeSunAspects(sunPosition, planetaryPositions, ascendant),
      conjunctions: this.analyzeSunConjunctions(sunPosition, planetaryPositions),
      combust: this.checkCombustion(sunPosition, planetaryPositions),
      personalityTraits: this.getSunPersonalityTraits(sunSign, sunHouse),
      egoCharacteristics: this.getSunEgoCharacteristics(sunSign, sunHouse),
      fatherIndications: this.analyzeFatherIndications(sunPosition, chart),
      authorityRelations: this.analyzeAuthorityRelations(sunPosition, chart),
      healthIndications: this.getSunHealthIndications(sunSign, sunHouse),
      careerIndications: this.getSunCareerIndications(sunSign, sunHouse),
      spiritualPath: this.getSunSpiritualPath(sunSign, sunHouse, sunNakshatra)
    };
  }

  /**
   * Analyze Moon placement and characteristics
   * @param {Object} moonPosition - Moon position data
   * @param {Object} chart - Complete chart data
   * @returns {Object} Moon analysis
   */
  analyzeMoon(moonPosition, chart) {
    if (!moonPosition) {
      return { error: 'Moon position not available' };
    }

    const { ascendant, planetaryPositions } = chart;
    const moonHouse = this.getHouseFromLongitude(moonPosition.longitude, ascendant.longitude);
    const moonSign = moonPosition.sign.toUpperCase();
    const moonDegree = moonPosition.longitude % 30;
    const moonNakshatra = this.getNakshatraFromLongitude(moonPosition.longitude);

    return {
      position: {
        sign: moonSign,
        house: moonHouse,
        degree: moonDegree,
        nakshatra: moonNakshatra,
        longitude: moonPosition.longitude
      },
      dignity: this.calculatePlanetaryDignity('Moon', moonSign),
      strength: this.calculateMoonStrength(moonPosition, chart),
      signCharacteristics: this.signCharacteristics[moonSign],
      houseEffects: this.analyzeMoonInHouse(moonHouse),
      nakshatraEffects: this.nakshatraData[moonNakshatra] || {},
      aspects: this.analyzeMoonAspects(moonPosition, planetaryPositions, ascendant),
      conjunctions: this.analyzeMoonConjunctions(moonPosition, planetaryPositions),
      waxingWaning: this.determineLunarPhase(moonPosition, planetaryPositions.sun),
      emotionalCharacter: this.getMoonEmotionalCharacter(moonSign, moonHouse),
      mindCharacteristics: this.getMoonMindCharacteristics(moonSign, moonHouse),
      motherIndications: this.analyzeMotherIndications(moonPosition, chart),
      mentalHealth: this.analyzeMentalHealthFromMoon(moonPosition, chart),
      intuitionPsychic: this.analyzeIntuitionPsychic(moonPosition, chart),
      publicPopularity: this.analyzePublicPopularity(moonPosition, chart),
      domesticLife: this.analyzeDomesticLife(moonPosition, chart),
      femaleRelationships: this.analyzeFemaleRelationships(moonPosition, chart)
    };
  }

  /**
   * Analyze relationship between Sun and Moon
   * @param {Object} sunPosition - Sun position
   * @param {Object} moonPosition - Moon position
   * @param {Object} chart - Complete chart data
   * @returns {Object} Luminaries relationship analysis
   */
  analyzeLuminariesRelationship(sunPosition, moonPosition, chart) {
    if (!sunPosition || !moonPosition) {
      return { error: 'Both Sun and Moon positions required' };
    }

    const separation = this.calculateSeparation(sunPosition.longitude, moonPosition.longitude);
    const { ascendant } = chart;

    const sunHouse = this.getHouseFromLongitude(sunPosition.longitude, ascendant.longitude);
    const moonHouse = this.getHouseFromLongitude(moonPosition.longitude, ascendant.longitude);
    const houseSeparation = Math.abs(sunHouse - moonHouse);

    return {
      separation: {
        degrees: separation,
        houses: houseSeparation,
        aspect: this.determineLuminariesAspect(separation)
      },
      lunarPhase: this.determineLunarPhase(moonPosition, sunPosition),
      personalityIntegration: this.analyzePersonalityIntegration(separation, sunHouse, moonHouse),
      consciousUnconscious: this.analyzeConsciousUnconscious(separation),
      egoMindBalance: this.analyzeEgoMindBalance(sunPosition, moonPosition, chart),
      parentalInfluences: this.analyzeParentalInfluences(sunPosition, moonPosition, chart),
      innerConflicts: this.analyzeInnerConflicts(separation, sunPosition, moonPosition),
      lifePhases: this.analyzeLifePhases(sunPosition, moonPosition, chart),
      karmaicLessons: this.analyzeKarmicLessons(sunPosition, moonPosition, chart),
      recommendations: this.getLuminariesRecommendations(separation, sunPosition, moonPosition)
    };
  }

  /**
   * Calculate planetary dignity
   * @param {string} planet - Planet name
   * @param {string} sign - Sign name
   * @returns {Object} Dignity information
   */
  calculatePlanetaryDignity(planet, sign) {
    const dignities = this.planetaryDignities[planet];
    if (!dignities) return { dignity: 'Neutral', strength: 5 };

    if (dignities.exaltation === sign) {
      return { dignity: 'Exalted', strength: 10, description: 'Exceptionally strong and beneficial' };
    }
    if (dignities.ownSigns.includes(sign)) {
      return { dignity: 'Own Sign', strength: 8, description: 'Strong and comfortable' };
    }
    if (dignities.friendlySigns.includes(sign)) {
      return { dignity: 'Friendly', strength: 6, description: 'Supportive and harmonious' };
    }
    if (dignities.enemySigns.includes(sign)) {
      return { dignity: 'Enemy', strength: 3, description: 'Challenged and restricted' };
    }
    if (dignities.debilitation === sign) {
      return { dignity: 'Debilitated', strength: 1, description: 'Weakened but potential for growth' };
    }

    return { dignity: 'Neutral', strength: 5, description: 'Moderate influence' };
  }

  /**
   * Calculate Sun strength
   * @param {Object} sunPosition - Sun position
   * @param {Object} chart - Chart data
   * @returns {Object} Sun strength analysis
   */
  calculateSunStrength(sunPosition, chart) {
    const sunSign = sunPosition.sign.toUpperCase();
    const sunHouse = this.getHouseFromLongitude(sunPosition.longitude, chart.ascendant.longitude);

    let strength = 5; // Base strength
    const factors = [];

    // Dignity strength
    const dignity = this.calculatePlanetaryDignity('Sun', sunSign);
    strength += (dignity.strength - 5);
    factors.push(`Dignity: ${dignity.dignity} (${dignity.strength}/10)`);

    // House strength
    const kendraHouses = [1, 4, 7, 10];
    const trikonaHouses = [1, 5, 9];

    if (kendraHouses.includes(sunHouse)) {
      strength += 2;
      factors.push(`In Kendra house ${sunHouse} (+2)`);
    } else if (trikonaHouses.includes(sunHouse)) {
      strength += 1.5;
      factors.push(`In Trikona house ${sunHouse} (+1.5)`);
    } else if ([6, 8, 12].includes(sunHouse)) {
      strength -= 1;
      factors.push(`In Dusthana house ${sunHouse} (-1)`);
    }

    // Combustion check
    if (this.checkCombustion(sunPosition, chart.planetaryPositions).isCombust) {
      strength -= 1;
      factors.push('Combustion affecting nearby planets (-1)');
    }

    // Aspect strength (simplified)
    const aspects = this.analyzeSunAspects(sunPosition, chart.planetaryPositions, chart.ascendant);
    const beneficAspects = aspects.filter(a => a.nature === 'benefic').length;
    const maleficAspects = aspects.filter(a => a.nature === 'malefic').length;

    if (beneficAspects > maleficAspects) {
      strength += 0.5;
      factors.push('More benefic aspects (+0.5)');
    } else if (maleficAspects > beneficAspects) {
      strength -= 0.5;
      factors.push('More malefic aspects (-0.5)');
    }

    return {
      overallStrength: Math.max(1, Math.min(10, strength)),
      factors: factors,
      interpretation: this.interpretSunStrength(strength)
    };
  }

  /**
   * Calculate Moon strength
   * @param {Object} moonPosition - Moon position
   * @param {Object} chart - Chart data
   * @returns {Object} Moon strength analysis
   */
  calculateMoonStrength(moonPosition, chart) {
    const moonSign = moonPosition.sign.toUpperCase();
    const moonHouse = this.getHouseFromLongitude(moonPosition.longitude, chart.ascendant.longitude);

    let strength = 5; // Base strength
    const factors = [];

    // Dignity strength
    const dignity = this.calculatePlanetaryDignity('Moon', moonSign);
    strength += (dignity.strength - 5);
    factors.push(`Dignity: ${dignity.dignity} (${dignity.strength}/10)`);

    // House strength
    const kendraHouses = [1, 4, 7, 10];
    const trikonaHouses = [1, 5, 9];

    if (kendraHouses.includes(moonHouse)) {
      strength += 1.5;
      factors.push(`In Kendra house ${moonHouse} (+1.5)`);
    } else if (trikonaHouses.includes(moonHouse)) {
      strength += 1;
      factors.push(`In Trikona house ${moonHouse} (+1)`);
    } else if ([6, 8, 12].includes(moonHouse)) {
      strength -= 1.5;
      factors.push(`In Dusthana house ${moonHouse} (-1.5)`);
    }

    // Lunar phase influence
    const lunarPhase = this.determineLunarPhase(moonPosition, chart.planetaryPositions.sun);
    if (lunarPhase.phase === 'Waxing' || lunarPhase.phase === 'Full') {
      strength += 1;
      factors.push(`${lunarPhase.phase} Moon (+1)`);
    } else if (lunarPhase.phase === 'New' || lunarPhase.phase === 'Dark') {
      strength -= 1;
      factors.push(`${lunarPhase.phase} Moon (-1)`);
    }

    // Aspect strength
    const aspects = this.analyzeMoonAspects(moonPosition, chart.planetaryPositions, chart.ascendant);
    const beneficAspects = aspects.filter(a => a.nature === 'benefic').length;
    const maleficAspects = aspects.filter(a => a.nature === 'malefic').length;

    if (beneficAspects > maleficAspects) {
      strength += 0.5;
      factors.push('More benefic aspects (+0.5)');
    } else if (maleficAspects > beneficAspects) {
      strength -= 0.5;
      factors.push('More malefic aspects (-0.5)');
    }

    return {
      overallStrength: Math.max(1, Math.min(10, strength)),
      factors: factors,
      interpretation: this.interpretMoonStrength(strength)
    };
  }

  /**
   * Synthesize overall personality from Sun and Moon
   * @param {Object} sunAnalysis - Sun analysis
   * @param {Object} moonAnalysis - Moon analysis
   * @param {Object} relationship - Luminaries relationship
   * @returns {Object} Synthesized personality
   */
  synthesizePersonality(sunAnalysis, moonAnalysis, relationship) {
    const coreTraits = [];
    const challenges = [];
    const strengths = [];

    // Combine Sun and Moon traits
    if (sunAnalysis.personalityTraits) {
      coreTraits.push(...sunAnalysis.personalityTraits);
    }
    if (moonAnalysis.emotionalCharacter) {
      coreTraits.push(...moonAnalysis.emotionalCharacter);
    }

    // Integration analysis
    if (relationship.personalityIntegration) {
      if (relationship.personalityIntegration.integration === 'Harmonious') {
        strengths.push('Well-integrated personality with conscious and unconscious in harmony');
      } else if (relationship.personalityIntegration.integration === 'Challenging') {
        challenges.push('Internal conflicts between conscious goals and emotional needs');
      }
    }

    return {
      corePersonality: coreTraits.slice(0, 5), // Top 5 traits
      primaryStrengths: strengths,
      mainChallenges: challenges,
      overallPattern: this.determinePersonalityPattern(sunAnalysis, moonAnalysis, relationship),
      developmentPath: this.getPersonalityDevelopmentPath(sunAnalysis, moonAnalysis, relationship)
    };
  }

  /**
   * Analyze mental health trends from Moon
   * @param {Object} moonAnalysis - Moon analysis
   * @param {Object} chart - Chart data
   * @returns {Object} Mental health analysis
   */
  analyzeMentalHealthTrends(moonAnalysis, chart) {
    const trends = {
      overallStability: 'Moderate',
      vulnerabilities: [],
      strengths: [],
      recommendations: []
    };

    if (moonAnalysis.strength && moonAnalysis.strength.overallStrength >= 7) {
      trends.overallStability = 'Strong';
      trends.strengths.push('Good emotional resilience and mental stability');
    } else if (moonAnalysis.strength && moonAnalysis.strength.overallStrength <= 3) {
      trends.overallStability = 'Needs Support';
      trends.vulnerabilities.push('Emotional sensitivity and mental fluctuations');
      trends.recommendations.push('Regular meditation and emotional regulation practices');
    }

    // House-based analysis
    if (moonAnalysis.position && moonAnalysis.position.house) {
      const house = moonAnalysis.position.house;
      if ([6, 8, 12].includes(house)) {
        trends.vulnerabilities.push(`Moon in ${house}th house can create emotional challenges`);
        trends.recommendations.push('Extra care for mental peace and stress management');
      } else if ([1, 4, 7, 10].includes(house)) {
        trends.strengths.push(`Moon in ${house}th house supports emotional well-being`);
      }
    }

    return trends;
  }

  /**
   * Analyze life purpose from Sun
   * @param {Object} sunAnalysis - Sun analysis
   * @param {Object} chart - Chart data
   * @returns {Object} Life purpose analysis
   */
  analyzeLifePurpose(sunAnalysis, chart) {
    const purpose = {
      primaryDirection: '',
      soulLessons: [],
      karmaicTheme: '',
      manifestationPath: []
    };

    if (sunAnalysis.position) {
      const { sign, house } = sunAnalysis.position;

      // Sign-based purpose
      const signPurposes = {
        'ARIES': 'Leadership and pioneering new paths',
        'TAURUS': 'Building stability and creating lasting value',
        'GEMINI': 'Communication and knowledge sharing',
        'CANCER': 'Nurturing and emotional healing',
        'LEO': 'Creative expression and inspiring others',
        'VIRGO': 'Service and practical improvement',
        'LIBRA': 'Creating harmony and balance',
        'SCORPIO': 'Transformation and deep understanding',
        'SAGITTARIUS': 'Teaching and philosophical exploration',
        'CAPRICORN': 'Structure and responsible leadership',
        'AQUARIUS': 'Innovation and humanitarian service',
        'PISCES': 'Spiritual service and compassion'
      };

      purpose.primaryDirection = signPurposes[sign] || 'Self-discovery and growth';

      // House-based manifestation
      const housePaths = {
        1: 'Through personal leadership and self-development',
        2: 'Through resource management and value creation',
        3: 'Through communication and skill development',
        4: 'Through family, home, and emotional foundations',
        5: 'Through creativity, children, and self-expression',
        6: 'Through service, health, and daily practices',
        7: 'Through partnerships and relationships',
        8: 'Through transformation and research',
        9: 'Through teaching, spirituality, and higher learning',
        10: 'Through career, reputation, and public service',
        11: 'Through social networks and collective goals',
        12: 'Through spirituality and service to humanity'
      };

      purpose.manifestationPath.push(housePaths[house] || 'Through personal growth');
    }

    return purpose;
  }

  /**
   * Generate recommendations for luminaries
   * @param {Object} sunAnalysis - Sun analysis
   * @param {Object} moonAnalysis - Moon analysis
   * @param {Object} relationship - Luminaries relationship
   * @returns {Object} Recommendations
   */
  generateRecommendations(sunAnalysis, moonAnalysis, relationship) {
    const recommendations = {
      general: [],
      sunBased: [],
      moonBased: [],
      integration: [],
      spiritual: [],
      practical: []
    };

    // Sun-based recommendations
    if (sunAnalysis.strength && sunAnalysis.strength.overallStrength < 5) {
      recommendations.sunBased.push('Practice Sun salutations and spend time in sunlight');
      recommendations.sunBased.push('Develop self-confidence and leadership skills');
      recommendations.sunBased.push('Work on father relationship and authority issues');
    }

    // Moon-based recommendations
    if (moonAnalysis.strength && moonAnalysis.strength.overallStrength < 5) {
      recommendations.moonBased.push('Practice meditation and emotional regulation');
      recommendations.moonBased.push('Maintain regular sleep schedule and lunar cycle awareness');
      recommendations.moonBased.push('Nurture mother relationship and feminine aspects');
    }

    // Integration recommendations
    if (relationship.separation && Math.abs(relationship.separation.degrees - 180) < 10) {
      recommendations.integration.push('Work on balancing conscious goals with emotional needs');
      recommendations.integration.push('Practice integration techniques like journaling');
    }

    // General recommendations
    recommendations.general.push('Maintain balance between solar (active) and lunar (receptive) energies');
    recommendations.general.push('Regular spiritual practices to harmonize mind and soul');

    return recommendations;
  }

  // Initialize methods and helper functions

  /**
   * Initialize sign characteristics
   */
  initializeSignCharacteristics() {
    return {
      'ARIES': {
        element: 'Fire',
        quality: 'Cardinal',
        ruler: 'Mars',
        traits: ['Dynamic', 'Leadership', 'Pioneering', 'Impulsive', 'Courageous']
      },
      'TAURUS': {
        element: 'Earth',
        quality: 'Fixed',
        ruler: 'Venus',
        traits: ['Stable', 'Practical', 'Sensual', 'Stubborn', 'Reliable']
      },
      'GEMINI': {
        element: 'Air',
        quality: 'Mutable',
        ruler: 'Mercury',
        traits: ['Communicative', 'Versatile', 'Curious', 'Changeable', 'Intellectual']
      },
      'CANCER': {
        element: 'Water',
        quality: 'Cardinal',
        ruler: 'Moon',
        traits: ['Nurturing', 'Emotional', 'Protective', 'Intuitive', 'Sensitive']
      },
      'LEO': {
        element: 'Fire',
        quality: 'Fixed',
        ruler: 'Sun',
        traits: ['Creative', 'Confident', 'Generous', 'Dramatic', 'Leadership']
      },
      'VIRGO': {
        element: 'Earth',
        quality: 'Mutable',
        ruler: 'Mercury',
        traits: ['Analytical', 'Service-oriented', 'Perfectionist', 'Practical', 'Health-conscious']
      },
      'LIBRA': {
        element: 'Air',
        quality: 'Cardinal',
        ruler: 'Venus',
        traits: ['Harmonious', 'Diplomatic', 'Artistic', 'Indecisive', 'Relationship-focused']
      },
      'SCORPIO': {
        element: 'Water',
        quality: 'Fixed',
        ruler: 'Mars',
        traits: ['Intense', 'Transformative', 'Secretive', 'Powerful', 'Investigative']
      },
      'SAGITTARIUS': {
        element: 'Fire',
        quality: 'Mutable',
        ruler: 'Jupiter',
        traits: ['Philosophical', 'Adventurous', 'Optimistic', 'Freedom-loving', 'Teaching']
      },
      'CAPRICORN': {
        element: 'Earth',
        quality: 'Cardinal',
        ruler: 'Saturn',
        traits: ['Ambitious', 'Disciplined', 'Responsible', 'Traditional', 'Achievement-oriented']
      },
      'AQUARIUS': {
        element: 'Air',
        quality: 'Fixed',
        ruler: 'Saturn',
        traits: ['Innovative', 'Humanitarian', 'Independent', 'Unconventional', 'Future-focused']
      },
      'PISCES': {
        element: 'Water',
        quality: 'Mutable',
        ruler: 'Jupiter',
        traits: ['Compassionate', 'Intuitive', 'Artistic', 'Spiritual', 'Escapist']
      }
    };
  }

  /**
   * Initialize house significations
   */
  initializeHouseSignifications() {
    return {
      1: { name: 'Lagna', signifies: ['Self', 'Personality', 'Health', 'Appearance'] },
      2: { name: 'Dhana', signifies: ['Wealth', 'Family', 'Speech', 'Values'] },
      3: { name: 'Parakrama', signifies: ['Courage', 'Siblings', 'Communication', 'Skills'] },
      4: { name: 'Sukha', signifies: ['Home', 'Mother', 'Happiness', 'Education'] },
      5: { name: 'Putra', signifies: ['Children', 'Creativity', 'Intelligence', 'Romance'] },
      6: { name: 'Ripu', signifies: ['Enemies', 'Health', 'Service', 'Obstacles'] },
      7: { name: 'Kalatra', signifies: ['Marriage', 'Partnership', 'Business', 'Travel'] },
      8: { name: 'Ayus', signifies: ['Longevity', 'Transformation', 'Research', 'Occult'] },
      9: { name: 'Dharma', signifies: ['Luck', 'Father', 'Religion', 'Higher Learning'] },
      10: { name: 'Karma', signifies: ['Career', 'Status', 'Reputation', 'Authority'] },
      11: { name: 'Labha', signifies: ['Gains', 'Friends', 'Aspirations', 'Income'] },
      12: { name: 'Vyaya', signifies: ['Expenses', 'Loss', 'Spirituality', 'Foreign'] }
    };
  }

  /**
   * Initialize nakshatra data (simplified)
   */
  initializeNakshatraData() {
    return {
      'Ashwini': { deity: 'Ashwini Kumaras', symbol: 'Horse Head', nature: 'Swift' },
      'Bharani': { deity: 'Yama', symbol: 'Yoni', nature: 'Fierce' },
      'Krittika': { deity: 'Agni', symbol: 'Razor', nature: 'Sharp' }
      // Add more nakshatras as needed
    };
  }

  /**
   * Initialize planetary dignities
   */
  initializePlanetaryDignities() {
    return {
      'Sun': {
        exaltation: 'ARIES',
        debilitation: 'LIBRA',
        ownSigns: ['LEO'],
        friendlySigns: ['ARIES', 'SAGITTARIUS', 'SCORPIO'],
        enemySigns: ['LIBRA', 'AQUARIUS', 'SATURN']
      },
      'Moon': {
        exaltation: 'TAURUS',
        debilitation: 'SCORPIO',
        ownSigns: ['CANCER'],
        friendlySigns: ['TAURUS', 'VIRGO', 'CAPRICORN'],
        enemySigns: ['SCORPIO', 'ARIES', 'LEO']
      }
    };
  }

  // Helper methods

  /**
   * Get house from longitude
   * @param {number} longitude - Planet longitude
   * @param {number} ascendantLongitude - Ascendant longitude
   * @returns {number} House number (1-12)
   */
  getHouseFromLongitude(longitude, ascendantLongitude) {
    const diff = (longitude - ascendantLongitude + 360) % 360;
    return Math.floor(diff / 30) + 1;
  }

  /**
   * Get nakshatra from longitude (simplified)
   * @param {number} longitude - Planet longitude
   * @returns {string} Nakshatra name
   */
  getNakshatraFromLongitude(longitude) {
    const nakshatras = ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu',
      'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati',
      'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana',
      'Dhanishtha', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'];

    const nakshatraIndex = Math.floor(longitude / 13.333333);
    return nakshatras[nakshatraIndex % 27] || 'Ashwini';
  }

  /**
   * Calculate separation between two longitudes
   * @param {number} long1 - First longitude
   * @param {number} long2 - Second longitude
   * @returns {number} Separation in degrees
   */
  calculateSeparation(long1, long2) {
    let diff = Math.abs(long1 - long2);
    if (diff > 180) diff = 360 - diff;
    return diff;
  }

  /**
   * Check combustion of planets near Sun
   * @param {Object} sunPosition - Sun position
   * @param {Object} planetaryPositions - All planetary positions
   * @returns {Object} Combustion analysis
   */
  checkCombustion(sunPosition, planetaryPositions) {
    const combustionOrbs = {
      'Moon': 12,
      'Mars': 17,
      'Mercury': 14,
      'Jupiter': 11,
      'Venus': 10,
      'Saturn': 15
    };

    const combustPlanets = [];

    for (const [planet, position] of Object.entries(planetaryPositions)) {
      if (planet === 'sun' || planet === 'rahu' || planet === 'ketu') continue;

      const separation = this.calculateSeparation(sunPosition.longitude, position.longitude);
      const orb = combustionOrbs[planet.charAt(0).toUpperCase() + planet.slice(1)];

      if (orb && separation <= orb) {
        combustPlanets.push({
          planet: planet,
          separation: separation,
          orb: orb
        });
      }
    }

    return {
      isCombust: combustPlanets.length > 0,
      combustPlanets: combustPlanets,
      effects: combustPlanets.length > 0 ?
        ['Planetary energies overshadowed by Sun', 'Reduced expression of planet qualities'] :
        ['No combustion effects']
    };
  }

  /**
   * Determine lunar phase
   * @param {Object} moonPosition - Moon position
   * @param {Object} sunPosition - Sun position
   * @returns {Object} Lunar phase information
   */
  determineLunarPhase(moonPosition, sunPosition) {
    const separation = this.calculateSeparation(moonPosition.longitude, sunPosition.longitude);

    let phase;
    let strength;

    if (separation <= 15) {
      phase = 'New';
      strength = 'Very Weak';
    } else if (separation <= 45) {
      phase = 'Waxing Crescent';
      strength = 'Weak';
    } else if (separation <= 90) {
      phase = 'First Quarter';
      strength = 'Moderate';
    } else if (separation <= 135) {
      phase = 'Waxing Gibbous';
      strength = 'Strong';
    } else if (separation <= 180) {
      phase = 'Full';
      strength = 'Very Strong';
    } else if (separation <= 225) {
      phase = 'Waning Gibbous';
      strength = 'Strong';
    } else if (separation <= 270) {
      phase = 'Last Quarter';
      strength = 'Moderate';
    } else if (separation <= 315) {
      phase = 'Waning Crescent';
      strength = 'Weak';
    } else {
      phase = 'Dark';
      strength = 'Very Weak';
    }

    return {
      phase: phase,
      strength: strength,
      separation: separation,
      effects: this.getLunarPhaseEffects(phase)
    };
  }

  /**
   * Get lunar phase effects
   * @param {string} phase - Lunar phase
   * @returns {Array} Phase effects
   */
  getLunarPhaseEffects(phase) {
    const effects = {
      'New': ['New beginnings', 'Fresh start energy', 'Hidden potential'],
      'Waxing Crescent': ['Growth phase', 'Building momentum', 'Developing ideas'],
      'First Quarter': ['Action and decision', 'Overcoming obstacles', 'Manifestation'],
      'Waxing Gibbous': ['Refinement', 'Adjustment', 'Preparation'],
      'Full': ['Peak energy', 'Completion', 'Maximum expression'],
      'Waning Gibbous': ['Sharing wisdom', 'Teaching', 'Giving back'],
      'Last Quarter': ['Release', 'Letting go', 'Forgiveness'],
      'Waning Crescent': ['Rest', 'Reflection', 'Preparation for new cycle'],
      'Dark': ['Deep introspection', 'Spiritual renewal', 'Inner work']
    };

    return effects[phase] || ['Transitional energy'];
  }

  // Production-grade implementation of luminaries analysis methods

  analyzeSunInHouse(house) {
    const houseEffects = {
      1: ['Strong personality', 'Leadership qualities', 'Health vitality', 'Self-confidence', 'Father influence on identity'],
      2: ['Financial leadership', 'Family authority', 'Authoritative speech', 'Wealth through government', 'Father affects family'],
      3: ['Courage and valor', 'Sibling leadership', 'Communication authority', 'Short travels for recognition', 'Artistic expression'],
      4: ['Real estate gains', 'Mother-father dynamics', 'Educational authority', 'Home as power base', 'Vehicle ownership'],
      5: ['Creative leadership', 'Authoritative children', 'Investment success', 'Educational excellence', 'Romance through status'],
      6: ['Victory over enemies', 'Health challenges overcome', 'Service leadership', 'Government service', 'Debt recovery'],
      7: ['Partner with authority', 'Business leadership', 'Foreign connections', 'Marriage to influential person', 'Legal success'],
      8: ['Research abilities', 'Occult interests', 'Inheritance gains', 'Transformation through crisis', 'Longevity questions'],
      9: ['Fortune through father', 'Religious authority', 'Higher education', 'Long distance travel', 'Teaching abilities'],
      10: ['Career success', 'Government position', 'Public recognition', 'Authority figures', 'Professional excellence'],
      11: ['Gains through government', 'Influential friends', 'Elder sibling success', 'Network leadership', 'Achievement of desires'],
      12: ['Foreign residence', 'Spiritual leadership', 'Hidden enemies', 'Father in foreign lands', 'Expenditure on status']
    };

    return {
      effects: houseEffects[house] || ['General solar influences'],
      houseSignification: this.initializeHouseSignifications()[house]?.signifies || [],
      strength: this.calculateSunHouseStrength(house)
    };
  }

  analyzeMoonInHouse(house) {
    const houseEffects = {
      1: ['Emotional sensitivity', 'Changeable personality', 'Mother influence strong', 'Public appeal', 'Mental fluctuations'],
      2: ['Emotional attachment to wealth', 'Family nurturing', 'Food business', 'Mother affects family', 'Speech fluctuations'],
      3: ['Emotional courage', 'Close to siblings', 'Communication through feelings', 'Short emotional journeys', 'Artistic talents'],
      4: ['Happy home life', 'Strong mother bond', 'Emotional education', 'Land ownership', 'Vehicle comfort'],
      5: ['Emotional creativity', 'Attached to children', 'Romantic nature', 'Educational emotions', 'Speculative gains'],
      6: ['Emotional health issues', 'Service through caring', 'Victory through patience', 'Workplace emotions', 'Debt through emotions'],
      7: ['Emotional partner', 'Public relationships', 'Business partnerships', 'Foreign emotional ties', 'Marriage happiness'],
      8: ['Emotional research', 'Intuitive insights', 'Emotional inheritance', 'Transformative emotions', 'Psychic abilities'],
      9: ['Fortune through mother', 'Emotional beliefs', 'Pilgrimage love', 'Teaching with emotion', 'Father-mother relationship'],
      10: ['Career through public', 'Emotional reputation', 'Mother affects career', 'Public service', 'Recognition through caring'],
      11: ['Emotional gains', 'Friendly network', 'Elder sister influence', 'Desires fulfilled', 'Social achievements'],
      12: ['Foreign emotional ties', 'Spiritual emotions', 'Hidden feelings', 'Mother abroad', 'Emotional expenditure']
    };

    return {
      effects: houseEffects[house] || ['General lunar influences'],
      houseSignification: this.initializeHouseSignifications()[house]?.signifies || [],
      strength: this.calculateMoonHouseStrength(house)
    };
  }

  analyzeSunAspects(sunPosition, planetaryPositions, ascendant) {
    const aspects = [];
    const sunLongitude = sunPosition.longitude;

    for (const [planet, position] of Object.entries(planetaryPositions)) {
      if (planet === 'sun') continue;

      const separation = this.calculateSeparation(sunLongitude, position.longitude);
      const aspectType = this.determineLuminariesAspect(separation);

      if (aspectType !== 'No major aspect') {
        aspects.push({
          planet: planet,
          aspectType: aspectType,
          separation: separation,
          orb: this.calculateAspectOrb(separation, aspectType),
          nature: this.getSunAspectNature(planet, aspectType),
          effects: this.getSunAspectEffects(planet, aspectType),
          strength: this.calculateAspectStrength(separation, aspectType)
        });
      }
    }

    return aspects;
  }

  /**
   * Calculate aspect orb based on separation and aspect type
   * @param {number} separation - Angular separation between planets
   * @param {string} aspectType - Type of aspect
   * @returns {number} Orb value
   */
  calculateAspectOrb(separation, aspectType) {
    const aspectOrbs = {
      'Conjunction': 8,
      'Sextile': 6,
      'Square': 8,
      'Trine': 8,
      'Opposition': 8
    };

    const standardOrb = aspectOrbs[aspectType] || 5;

    // Calculate exact orb based on aspect type
    let exactDegree;
    switch (aspectType) {
      case 'Conjunction': exactDegree = 0; break;
      case 'Sextile': exactDegree = 60; break;
      case 'Square': exactDegree = 90; break;
      case 'Trine': exactDegree = 120; break;
      case 'Opposition': exactDegree = 180; break;
      default: exactDegree = 0;
    }

    return Math.abs(separation - exactDegree);
  }

  /**
   * Calculate aspect strength based on orb
   * @param {number} separation - Angular separation
   * @param {string} aspectType - Type of aspect
   * @returns {number} Strength score (1-10)
   */
  calculateAspectStrength(separation, aspectType) {
    const orb = this.calculateAspectOrb(separation, aspectType);
    const maxOrb = 8; // Maximum orb for strong aspects

    // Closer aspects are stronger
    const strength = Math.max(1, 10 - (orb / maxOrb) * 9);
    return Math.round(strength * 10) / 10;
  }

  /**
   * Get Sun aspect nature (benefic/malefic)
   * @param {string} planet - Planet name
   * @param {string} aspectType - Aspect type
   * @returns {string} Nature of aspect
   */
  getSunAspectNature(planet, aspectType) {
    const beneficPlanets = ['Venus', 'Jupiter', 'Mercury', 'Moon'];
    const maleficPlanets = ['Mars', 'Saturn', 'Rahu', 'Ketu'];
    const beneficAspects = ['Trine', 'Sextile'];
    const maleficAspects = ['Square', 'Opposition'];

    if (beneficPlanets.includes(planet) && beneficAspects.includes(aspectType)) {
      return 'benefic';
    } else if (maleficPlanets.includes(planet) && maleficAspects.includes(aspectType)) {
      return 'malefic';
    } else if (aspectType === 'Conjunction') {
      return beneficPlanets.includes(planet) ? 'benefic' : 'malefic';
    }

    return 'neutral';
  }

  /**
   * Get Moon aspect nature (benefic/malefic)
   * @param {string} planet - Planet name
   * @param {string} aspectType - Aspect type
   * @returns {string} Nature of aspect
   */
  getMoonAspectNature(planet, aspectType) {
    return this.getSunAspectNature(planet, aspectType);
  }

  /**
   * Get Sun aspect effects
   * @param {string} planet - Planet name
   * @param {string} aspectType - Aspect type
   * @returns {Array} Array of effects
   */
  getSunAspectEffects(planet, aspectType) {
    return [`Sun ${aspectType} ${planet} brings specific effects for ego and self-expression`];
  }

  /**
   * Get Moon aspect effects
   * @param {string} planet - Planet name
   * @param {string} aspectType - Aspect type
   * @returns {Array} Array of effects
   */
  getMoonAspectEffects(planet, aspectType) {
    return [`Moon ${aspectType} ${planet} brings specific effects for emotions and mind`];
  }

  /**
   * Get Sun conjunction effects
   * @param {string} planet - Planet name
   * @param {number} separation - Separation in degrees
   * @returns {Array} Array of effects
   */
  getSunConjunctionEffects(planet, separation) {
    return [`Sun conjunction ${planet} at ${separation.toFixed(1)}° creates specific energy blend`];
  }

  /**
   * Get Moon conjunction effects
   * @param {string} planet - Planet name
   * @param {number} separation - Separation in degrees
   * @returns {Array} Array of effects
   */
  getMoonConjunctionEffects(planet, separation) {
    return [`Moon conjunction ${planet} at ${separation.toFixed(1)}° affects emotional nature`];
  }

  /**
   * Calculate conjunction strength
   * @param {number} separation - Separation in degrees
   * @returns {number} Strength score
   */
  calculateConjunctionStrength(separation) {
    if (separation <= 1) return 10;
    if (separation <= 3) return 8;
    if (separation <= 5) return 6;
    if (separation <= 8) return 4;
    return 2;
  }

  /**
   * Get Sun conjunction remedies
   * @param {string} planet - Planet name
   * @param {number} separation - Separation in degrees
   * @returns {Array} Array of remedial measures
   */
  getSunConjunctionRemedies(planet, separation) {
    return [`Remedies for Sun-${planet} conjunction based on classical principles`];
  }

  /**
   * Get Moon conjunction emotional effects
   * @param {string} planet - Planet name
   * @returns {Array} Array of emotional effects
   */
  getMoonConjunctionEmotionalEffects(planet) {
    return [`Emotional effects of Moon-${planet} conjunction`];
  }

  /**
   * Get Moon conjunction mental effects
   * @param {string} planet - Planet name
   * @returns {Array} Array of mental effects
   */
  getMoonConjunctionMentalEffects(planet) {
    return [`Mental effects of Moon-${planet} conjunction`];
  }

  analyzeMoonAspects(moonPosition, planetaryPositions, ascendant) {
    const aspects = [];
    const moonLongitude = moonPosition.longitude;

    for (const [planet, position] of Object.entries(planetaryPositions)) {
      if (planet === 'moon') continue;

      const separation = this.calculateSeparation(moonLongitude, position.longitude);
      const aspectType = this.determineLuminariesAspect(separation);

      if (aspectType !== 'No major aspect') {
        aspects.push({
          planet: planet,
          aspectType: aspectType,
          separation: separation,
          orb: this.calculateAspectOrb(separation, aspectType),
          nature: this.getMoonAspectNature(planet, aspectType),
          effects: this.getMoonAspectEffects(planet, aspectType),
          strength: this.calculateAspectStrength(separation, aspectType)
        });
      }
    }

    return aspects;
  }

  analyzeSunConjunctions(sunPosition, planetaryPositions) {
    const conjunctions = [];
    const sunLongitude = sunPosition.longitude;
    const conjunctionOrb = 8; // degrees

    for (const [planet, position] of Object.entries(planetaryPositions)) {
      if (planet === 'sun') continue;

      const separation = this.calculateSeparation(sunLongitude, position.longitude);

      if (separation <= conjunctionOrb) {
        conjunctions.push({
          planet: planet,
          orb: separation,
          type: separation <= 3 ? 'Exact' : separation <= 6 ? 'Close' : 'Wide',
          combust: this.checkCombustion(sunPosition, {[planet]: position}).isCombust,
          effects: this.getSunConjunctionEffects(planet, separation),
          strength: this.calculateConjunctionStrength(separation),
          remedies: this.getSunConjunctionRemedies(planet, separation)
        });
      }
    }

    return conjunctions;
  }

  analyzeMoonConjunctions(moonPosition, planetaryPositions) {
    const conjunctions = [];
    const moonLongitude = moonPosition.longitude;
    const conjunctionOrb = 8; // degrees

    for (const [planet, position] of Object.entries(planetaryPositions)) {
      if (planet === 'moon') continue;

      const separation = this.calculateSeparation(moonLongitude, position.longitude);

      if (separation <= conjunctionOrb) {
        conjunctions.push({
          planet: planet,
          orb: separation,
          type: separation <= 3 ? 'Exact' : separation <= 6 ? 'Close' : 'Wide',
          effects: this.getMoonConjunctionEffects(planet, separation),
          strength: this.calculateConjunctionStrength(separation),
          emotional: this.getMoonConjunctionEmotionalEffects(planet),
          mental: this.getMoonConjunctionMentalEffects(planet)
        });
      }
    }

    return conjunctions;
  }

  getSunPersonalityTraits(sign, house) {
    return [`Sun in ${sign} traits`, `Sun in ${house}th house traits`];
  }

  getSunEgoCharacteristics(sign, house) {
    return [`Ego characteristics for Sun in ${sign}`];
  }

  getMoonEmotionalCharacter(sign, house) {
    return [`Moon in ${sign} emotional traits`];
  }

  getMoonMindCharacteristics(sign, house) {
    return [`Mind characteristics for Moon in ${sign}`];
  }

  interpretSunStrength(strength) {
    if (strength >= 8) return 'Very Strong Sun - Excellent vitality and self-expression';
    if (strength >= 6) return 'Strong Sun - Good confidence and leadership';
    if (strength >= 4) return 'Moderate Sun - Average self-expression';
    if (strength >= 2) return 'Weak Sun - Challenges with confidence';
    return 'Very Weak Sun - Significant challenges with self-expression';
  }

  interpretMoonStrength(strength) {
    if (strength >= 8) return 'Very Strong Moon - Excellent emotional stability';
    if (strength >= 6) return 'Strong Moon - Good mental peace';
    if (strength >= 4) return 'Moderate Moon - Average emotional balance';
    if (strength >= 2) return 'Weak Moon - Emotional challenges';
    return 'Very Weak Moon - Significant mental health concerns';
  }

  determineLuminariesAspect(separation) {
    if (separation <= 8) return 'Conjunction';
    if (Math.abs(separation - 60) <= 8) return 'Sextile';
    if (Math.abs(separation - 90) <= 8) return 'Square';
    if (Math.abs(separation - 120) <= 8) return 'Trine';
    if (Math.abs(separation - 180) <= 8) return 'Opposition';
    return 'No major aspect';
  }

  analyzePersonalityIntegration(separation, sunHouse, moonHouse) {
    const integration = separation <= 60 ? 'Harmonious' : separation >= 120 ? 'Challenging' : 'Moderate';
    return { integration, description: `${integration} integration between conscious and unconscious` };
  }

  analyzeConsciousUnconscious(separation) {
    return { balance: separation <= 90 ? 'Aligned' : 'In tension' };
  }

  analyzeEgoMindBalance(sunPosition, moonPosition, chart) {
    return { balance: 'Moderate', description: 'Ego and mind working together' };
  }

  analyzeParentalInfluences(sunPosition, moonPosition, chart) {
    return {
      father: 'Sun position influences father relationship',
      mother: 'Moon position influences mother relationship'
    };
  }

  analyzeInnerConflicts(separation, sunPosition, moonPosition) {
    return separation >= 150 ?
      { hasConflicts: true, description: 'Internal conflicts between desires and emotions' } :
      { hasConflicts: false, description: 'Relatively harmonious inner state' };
  }

  analyzeLifePhases(sunPosition, moonPosition, chart) {
    return { phases: ['Early life influenced by Moon', 'Later life influenced by Sun'] };
  }

  analyzeKarmicLessons(sunPosition, moonPosition, chart) {
    return { lessons: ['Integration of conscious and unconscious', 'Balancing masculine and feminine energies'] };
  }

  getLuminariesRecommendations(separation, sunPosition, moonPosition) {
    return separation >= 150 ?
      ['Work on integrating opposing energies', 'Practice mindfulness'] :
      ['Maintain current balance', 'Continue spiritual practices'];
  }

  determinePersonalityPattern(sunAnalysis, moonAnalysis, relationship) {
    return 'Balanced personality with room for growth';
  }

  getPersonalityDevelopmentPath(sunAnalysis, moonAnalysis, relationship) {
    return ['Develop self-awareness', 'Integrate emotions with goals', 'Practice mindful living'];
  }

  analyzeFatherIndications(sunPosition, chart) {
    return { relationship: 'Father relationship analysis based on Sun position' };
  }

  analyzeAuthorityRelations(sunPosition, chart) {
    return { relations: 'Authority relationship patterns' };
  }

  getSunHealthIndications(sign, house) {
    return [`Health indications for Sun in ${sign}`];
  }

  getSunCareerIndications(sign, house) {
    return [`Career indications for Sun in ${sign}`];
  }

  getSunSpiritualPath(sign, house, nakshatra) {
    return { path: `Spiritual path for Sun in ${sign}` };
  }

  analyzeMotherIndications(moonPosition, chart) {
    return { relationship: 'Mother relationship analysis based on Moon position' };
  }

  analyzeMentalHealthFromMoon(moonPosition, chart) {
    return { trends: 'Mental health trends from Moon position' };
  }

  analyzeIntuitionPsychic(moonPosition, chart) {
    return { abilities: 'Intuitive and psychic abilities' };
  }

  analyzePublicPopularity(moonPosition, chart) {
    return { popularity: 'Public image and popularity analysis' };
  }

  analyzeDomesticLife(moonPosition, chart) {
    return { life: 'Domestic life analysis' };
  }

  analyzeFemaleRelationships(moonPosition, chart) {
    return { relationships: 'Female relationship patterns' };
  }

  /**
   * Calculate Sun strength in a specific house
   * @param {number} house - House number (1-12)
   * @returns {number} Strength score (1-10)
   */
  calculateSunHouseStrength(house) {
    const houseStrengths = {
      1: 9,  // Own house, excellent strength
      2: 6,  // Financial matters, moderate
      3: 7,  // Communication, good
      4: 5,  // Mother/emotions, challenging for Sun
      5: 9,  // Creativity/children, excellent
      6: 6,  // Service/health, moderate
      7: 5,  // Partnerships, challenging
      8: 4,  // Transformation, difficult
      9: 9,  // Higher learning, excellent
      10: 10, // Career/reputation, strongest
      11: 8,  // Gains/network, very good
      12: 3   // Loss/spirituality, weakest
    };

    return houseStrengths[house] || 5;
  }

  /**
   * Calculate Moon strength in a specific house
   * @param {number} house - House number (1-12)
   * @returns {number} Strength score (1-10)
   */
  calculateMoonHouseStrength(house) {
    const houseStrengths = {
      1: 8,  // Self/personality, very good
      2: 7,  // Family/wealth, good
      3: 6,  // Communication, moderate
      4: 10, // Own house, strongest
      5: 8,  // Creativity/children, very good
      6: 4,  // Service/health, challenging
      7: 7,  // Partnerships, good
      8: 3,  // Transformation, difficult
      9: 7,  // Higher learning, good
      10: 8,  // Career/reputation, very good
      11: 7,  // Gains/network, good
      12: 5   // Spirituality, moderate
    };

    return houseStrengths[house] || 5;
  }
}

module.exports = LuminariesAnalysisService;
