/**
 * Lagna Analysis Service
 * Handles analysis of Ascendant (Lagna) and its lord
 */

const astroConfig = require('../../config/astro-config');
const ExaltationDebilitationCalculator = require('../../core/calculations/planetary/ExaltationDebilitationCalculator');

class LagnaAnalysisService {
  constructor() {
    this.signCharacteristics = this.initializeSignCharacteristics();
    this.functionalNature = this.initializeFunctionalNature();
    this.dignityCalculator = new ExaltationDebilitationCalculator();
  }

  /**
   * Initialize sign characteristics
   */
  initializeSignCharacteristics() {
    return {
      ARIES: {
        element: 'Fire',
        quality: 'Cardinal',
        nature: 'Masculine',
        characteristics: [
          'Dynamic and energetic',
          'Natural leadership qualities',
          'Pioneering spirit',
          'Quick to act and decide',
          'Courageous and adventurous',
          'Can be impulsive and impatient'
        ],
        physicalTraits: [
          'Medium to tall build',
          'Strong bone structure',
          'Prominent forehead',
          'Energetic movements'
        ]
      },
      TAURUS: {
        element: 'Earth',
        quality: 'Fixed',
        nature: 'Feminine',
        characteristics: [
          'Patient and persistent',
          'Practical and reliable',
          'Strong determination',
          'Appreciation for beauty and comfort',
          'Stable and trustworthy',
          'Can be stubborn and possessive'
        ],
        physicalTraits: [
          'Strong, solid build',
          'Well-developed features',
          'Thick hair',
          'Steady, deliberate movements'
        ]
      },
      GEMINI: {
        element: 'Air',
        quality: 'Mutable',
        nature: 'Masculine',
        characteristics: [
          'Intellectual and curious',
          'Excellent communication skills',
          'Adaptable and versatile',
          'Quick-witted and humorous',
          'Social and friendly',
          'Can be restless and scattered'
        ],
        physicalTraits: [
          'Tall, slender build',
          'Expressive face',
          'Quick, animated gestures',
          'Bright, alert eyes'
        ]
      },
      CANCER: {
        element: 'Water',
        quality: 'Cardinal',
        nature: 'Feminine',
        characteristics: [
          'Emotional and intuitive',
          'Strong family bonds',
          'Protective and nurturing',
          'Good memory and imagination',
          'Home-loving and domestic',
          'Can be moody and sensitive'
        ],
        physicalTraits: [
          'Medium build, often round face',
          'Large, expressive eyes',
          'Soft, gentle features',
          'Protective body language'
        ]
      },
      LEO: {
        element: 'Fire',
        quality: 'Fixed',
        nature: 'Masculine',
        characteristics: [
          'Charismatic and confident',
          'Natural leadership abilities',
          'Generous and warm-hearted',
          'Creative and dramatic',
          'Loyal and protective',
          'Can be proud and attention-seeking'
        ],
        physicalTraits: [
          'Strong, regal appearance',
          'Thick, often curly hair',
          'Commanding presence',
          'Confident posture'
        ]
      },
      VIRGO: {
        element: 'Earth',
        quality: 'Mutable',
        nature: 'Feminine',
        characteristics: [
          'Analytical and detail-oriented',
          'Practical and efficient',
          'Service-oriented and helpful',
          'Modest and humble',
          'Health-conscious',
          'Can be critical and perfectionist'
        ],
        physicalTraits: [
          'Neat, well-groomed appearance',
          'Precise movements',
          'Alert, observant eyes',
          'Modest, unassuming presence'
        ]
      },
      LIBRA: {
        element: 'Air',
        quality: 'Cardinal',
        nature: 'Masculine',
        characteristics: [
          'Diplomatic and fair-minded',
          'Social and charming',
          'Appreciation for beauty and harmony',
          'Good sense of justice',
          'Cooperative and balanced',
          'Can be indecisive and dependent'
        ],
        physicalTraits: [
          'Pleasant, attractive features',
          'Graceful movements',
          'Good sense of style',
          'Balanced, harmonious appearance'
        ]
      },
      SCORPIO: {
        element: 'Water',
        quality: 'Fixed',
        nature: 'Feminine',
        characteristics: [
          'Intense and passionate',
          'Mysterious and secretive',
          'Strong willpower and determination',
          'Penetrating insight',
          'Loyal and protective',
          'Can be jealous and vengeful'
        ],
        physicalTraits: [
          'Intense, penetrating gaze',
          'Strong, magnetic presence',
          'Reserved, controlled movements',
          'Mysterious, enigmatic appearance'
        ]
      },
      SAGITTARIUS: {
        element: 'Fire',
        quality: 'Mutable',
        nature: 'Masculine',
        characteristics: [
          'Optimistic and enthusiastic',
          'Adventurous and freedom-loving',
          'Philosophical and wise',
          'Honest and straightforward',
          'Generous and open-minded',
          'Can be tactless and restless'
        ],
        physicalTraits: [
          'Tall, athletic build',
          'Open, friendly expression',
          'Energetic, expansive movements',
          'Optimistic, positive demeanor'
        ]
      },
      CAPRICORN: {
        element: 'Earth',
        quality: 'Cardinal',
        nature: 'Feminine',
        characteristics: [
          'Ambitious and disciplined',
          'Responsible and practical',
          'Patient and persistent',
          'Good organizational skills',
          'Traditional and conservative',
          'Can be pessimistic and rigid'
        ],
        physicalTraits: [
          'Strong, solid build',
          'Serious, determined expression',
          'Controlled, deliberate movements',
          'Professional, authoritative appearance'
        ]
      },
      AQUARIUS: {
        element: 'Air',
        quality: 'Fixed',
        nature: 'Masculine',
        characteristics: [
          'Independent and original',
          'Humanitarian and idealistic',
          'Intellectual and innovative',
          'Friendly and social',
          'Progressive and forward-thinking',
          'Can be rebellious and detached'
        ],
        physicalTraits: [
          'Unique, distinctive features',
          'Unconventional style',
          'Quick, nervous movements',
          'Intellectual, thoughtful expression'
        ]
      },
      PISCES: {
        element: 'Water',
        quality: 'Mutable',
        nature: 'Feminine',
        characteristics: [
          'Compassionate and empathetic',
          'Intuitive and spiritual',
          'Artistic and creative',
          'Selfless and sacrificing',
          'Adaptable and flexible',
          'Can be escapist and unrealistic'
        ],
        physicalTraits: [
          'Soft, dreamy features',
          'Gentle, flowing movements',
          'Compassionate, understanding eyes',
          'Spiritual, ethereal appearance'
        ]
      }
    };
  }

  /**
   * Initialize functional nature rules
   */
  initializeFunctionalNature() {
    return {
      ARIES: {
        benefic: ['Mars', 'Sun', 'Jupiter'],
        malefic: ['Venus', 'Saturn', 'Mercury'],
        neutral: ['Moon']
      },
      TAURUS: {
        benefic: ['Venus', 'Mercury', 'Saturn'],
        malefic: ['Mars', 'Sun', 'Jupiter'],
        neutral: ['Moon']
      },
      GEMINI: {
        benefic: ['Mercury', 'Venus', 'Saturn'],
        malefic: ['Jupiter', 'Mars', 'Sun'],
        neutral: ['Moon']
      },
      CANCER: {
        benefic: ['Moon', 'Mars', 'Jupiter'],
        malefic: ['Saturn', 'Mercury', 'Venus'],
        neutral: ['Sun']
      },
      LEO: {
        benefic: ['Sun', 'Mars', 'Jupiter'],
        malefic: ['Saturn', 'Venus', 'Mercury'],
        neutral: ['Moon']
      },
      VIRGO: {
        benefic: ['Mercury', 'Venus', 'Saturn'],
        malefic: ['Jupiter', 'Mars', 'Sun'],
        neutral: ['Moon']
      },
      LIBRA: {
        benefic: ['Venus', 'Saturn', 'Mercury'],
        malefic: ['Mars', 'Sun', 'Jupiter'],
        neutral: ['Moon']
      },
      SCORPIO: {
        benefic: ['Mars', 'Jupiter', 'Sun'],
        malefic: ['Venus', 'Saturn', 'Mercury'],
        neutral: ['Moon']
      },
      SAGITTARIUS: {
        benefic: ['Jupiter', 'Sun', 'Mars'],
        malefic: ['Mercury', 'Venus', 'Saturn'],
        neutral: ['Moon']
      },
      CAPRICORN: {
        benefic: ['Saturn', 'Mercury', 'Venus'],
        malefic: ['Jupiter', 'Mars', 'Sun'],
        neutral: ['Moon']
      },
      AQUARIUS: {
        benefic: ['Saturn', 'Mercury', 'Venus'],
        malefic: ['Jupiter', 'Mars', 'Sun'],
        neutral: ['Moon']
      },
      PISCES: {
        benefic: ['Jupiter', 'Venus', 'Moon'],
        malefic: ['Mercury', 'Mars', 'Sun'],
        neutral: ['Saturn']
      }
    };
  }

  /**
   * Analyze Lagna sign
   * @param {string} lagnaSign - Lagna sign name
   * @returns {Object} Lagna sign analysis
   */
  analyzeLagnaSign(lagnaSign) {
    const signKey = lagnaSign.toUpperCase();
    const signData = this.signCharacteristics[signKey];
    if (!signData) {
      throw new Error(`Invalid Lagna sign: ${lagnaSign}`);
    }

    return {
      sign: lagnaSign,
      ruler: this.getSignLord(lagnaSign),
      element: signData.element,
      quality: signData.quality,
      nature: signData.nature,
      characteristics: signData.characteristics,
      physicalTraits: signData.physicalTraits,
      description: signData.characteristics.join(', '),
      strengths: signData.characteristics.slice(0, 5),
      challenges: signData.characteristics.slice(-1)
    };
  }

  /**
   * Analyze Lagna lord placement
   * @param {string} lagnaLord - Lagna lord planet
   * @param {Object} placement - Planet placement details
   * @returns {Object} Lagna lord analysis
   */
  analyzeLagnaLord(lagnaLord, placement) {
    if (!lagnaLord || !placement) {
      return {
        planet: lagnaLord || 'Unknown',
        sign: 'Unknown',
        dignity: 'Unknown',
        strength: 0,
        effects: ['Lagna lord placement data not available']
      };
    }

    const dignityInfo = this.analyzePlanetaryDignity(lagnaLord, placement);
    const strength = this.calculatePlanetaryStrength(lagnaLord, placement);

    return {
      planet: lagnaLord,
      sign: placement.sign,
      dignity: dignityInfo.dignityType,
      strength: strength,
      effects: this.getLagnaLordEffects(lagnaLord, placement)
    };
  }

  /**
   * Determine functional nature of planets for the Lagna
   * @param {string} lagnaSign - Lagna sign
   * @param {Object} planetaryPositions - All planetary positions
   * @returns {Object} Functional nature analysis
   */
  determineFunctionalNature(lagnaSign, planetaryPositions) {
    const signKey = lagnaSign.toUpperCase();
    const functionalRules = this.functionalNature[signKey];
    if (!functionalRules) {
      throw new Error(`No functional nature rules for Lagna: ${lagnaSign}`);
    }

    const analysis = {
      benefic: [],
      malefic: [],
      neutral: []
    };

    for (const [planet, position] of Object.entries(planetaryPositions)) {
      const planetName = planet.toUpperCase();

      if (functionalRules.benefic.includes(planetName)) {
        analysis.benefic.push({
          planet,
          sign: position.sign,
          house: position.house,
          nature: 'Functional Benefic'
        });
      } else if (functionalRules.malefic.includes(planetName)) {
        analysis.malefic.push({
          planet,
          sign: position.sign,
          house: position.house,
          nature: 'Functional Malefic'
        });
      } else if (functionalRules.neutral.includes(planetName)) {
        analysis.neutral.push({
          planet,
          sign: position.sign,
          house: position.house,
          nature: 'Functional Neutral'
        });
      }
    }

    return analysis;
  }

  /**
   * Analyze planetary dignity
   * @param {string} planet - Planet name
   * @param {Object} placement - Planet placement
   * @returns {string} Dignity status
   */
  analyzePlanetaryDignity(planet, placement) {
    if (!placement || typeof placement.longitude === 'undefined') {
        return {
            dignityType: 'Unknown',
            description: 'Planet position not provided for dignity analysis.'
        };
    }
    return this.dignityCalculator.getDignity(planet, placement.longitude);
  }

  /**
   * Calculate planetary strength
   * @param {string} planet - Planet name
   * @param {Object} placement - Planet placement
   * @returns {number} Strength score (1-10)
   */
  calculatePlanetaryStrength(planet, placement) {
    let strength = 5; // Base strength

    // Dignity adjustments
    const dignity = this.analyzePlanetaryDignity(planet, placement);
    switch (dignity.dignityType) {
      case 'Exalted':
        strength += 3;
        break;
      case 'Own Sign':
        strength += 2;
        break;
      case 'Friendly Sign':
        strength += 1;
        break;
      case 'Enemy Sign':
        strength -= 1;
        break;
      case 'Debilitated':
        strength -= 2;
        break;
    }

    // House placement adjustments
    if (placement.house <= 4 || placement.house === 7 || placement.house === 10) {
      strength += 1; // Kendra houses
    } else if (placement.house === 5 || placement.house === 9) {
      strength += 1; // Trikona houses
    } else if (placement.house === 6 || placement.house === 8 || placement.house === 12) {
      strength -= 1; // Dusthana houses
    }

    // Retrograde adjustment
    if (placement.isRetrograde) {
      strength += 1; // Retrograde planets are considered stronger
    }

    // Combust adjustment
    if (placement.isCombust) {
      strength -= 2; // Combust planets are weakened
    }

    return Math.max(1, Math.min(10, strength));
  }

  /**
   * Get Lagna lord effects based on placement
   * @param {string} lagnaLord - Lagna lord planet
   * @param {Object} placement - Planet placement
   * @returns {Array} Effects list
   */
  getLagnaLordEffects(lagnaLord, placement) {
    // This method can be enhanced with more detailed interpretations
    return [];
  }

  /**
   * Check if planet is in own sign
   * @param {string} planet - Planet name
   * @param {string} sign - Zodiac sign
   * @returns {boolean} Is own sign
   */
  isOwnSign(planet, sign) {
    const signKey = sign.toUpperCase();
    const ownSigns = {
      SUN: 'LEO',
      MOON: 'CANCER',
      MARS: 'ARIES',
      MERCURY: 'GEMINI',
      JUPITER: 'SAGITTARIUS',
      VENUS: 'LIBRA',
      SATURN: 'CAPRICORN'
    };

    return ownSigns[planet.toUpperCase()] === signKey;
  }

  /**
   * Check if planet is in friendly sign
   * @param {string} planet - Planet name
   * @param {string} sign - Zodiac sign
   * @returns {boolean} Is friendly sign
   */
  isFriendlySign(planet, sign) {
    const planetUpper = planet.toUpperCase();
    const signUpper = sign.toUpperCase();

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

    const signLord = this.getSignLord(signUpper); // Assuming getSignLord is available and returns uppercase planet name
    return pRelations.friends.includes(signLord);
  }

  // Helper to get sign lord (assuming it's defined elsewhere or needs to be added)
  getSignLord(sign) {
    const signKey = sign.toUpperCase();
    const signLords = {
      'ARIES': 'Mars', 'TAURUS': 'Venus', 'GEMINI': 'Mercury', 'CANCER': 'Moon',
      'LEO': 'Sun', 'VIRGO': 'Mercury', 'LIBRA': 'Venus', 'SCORPIO': 'Mars',
      'SAGITTARIUS': 'Jupiter', 'CAPRICORN': 'Saturn', 'AQUARIUS': 'Saturn', 'PISCES': 'Jupiter'
    };
    return signLords[signKey];
  }

  /**
   * Check if planet is in enemy sign
   * @param {string} planet - Planet name
   * @param {string} sign - Zodiac sign
   * @returns {boolean} Is enemy sign
   */
  isEnemySign(planet, sign) {
    const planetUpper = planet.toUpperCase();
    const signUpper = sign.toUpperCase();

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

    const signLord = this.getSignLord(signUpper); // Assuming getSignLord is available and returns uppercase planet name
    return pRelations.enemies.includes(signLord);
  }

  /**
   * Comprehensive Lagna analysis
   * @param {Object} chart - Birth chart data
   * @returns {Object} Complete Lagna analysis
   */
  analyzeLagna(chart) {
    const { ascendant, planetaryPositions } = chart;

    // Find Lagna lord
    const lagnaLord = this.findLagnaLord(ascendant.sign);
    const lagnaLordPosition = planetaryPositions[lagnaLord.toLowerCase()];

    return {
      lagnaSign: this.analyzeLagnaSign(ascendant.sign),
      lagnaLord: this.analyzeLagnaLord(lagnaLord, lagnaLordPosition),
      functionalNature: this.determineFunctionalNature(ascendant.sign, planetaryPositions),
      overallStrength: this.calculateLagnaStrength(ascendant, lagnaLordPosition),
      summary: this.generateLagnaSummary(ascendant, lagnaLordPosition)
    };
  }

  /**
   * Find Lagna lord based on sign
   * @param {string} sign - Zodiac sign
   * @returns {string} Lagna lord planet
   */
  findLagnaLord(sign) {
    const signKey = sign.toUpperCase();
    const lords = {
      ARIES: 'Mars',
      TAURUS: 'Venus',
      GEMINI: 'Mercury',
      CANCER: 'Moon',
      LEO: 'Sun',
      VIRGO: 'Mercury',
      LIBRA: 'Venus',
      SCORPIO: 'Mars',
      SAGITTARIUS: 'Jupiter',
      CAPRICORN: 'Saturn',
      AQUARIUS: 'Saturn',
      PISCES: 'Jupiter'
    };

    return lords[signKey] || 'Unknown';
  }

  /**
   * Calculate overall Lagna strength
   * @param {Object} ascendant - Ascendant data
   * @param {Object} lagnaLordPosition - Lagna lord position
   * @returns {number} Overall strength (1-10)
   */
  calculateLagnaStrength(ascendant, lagnaLordPosition) {
    let strength = 5; // Base strength

    // Ascendant degree strength
    const degree = ascendant.degree;
    if (degree >= 0 && degree <= 5) {
      strength += 1; // Strong degree
    } else if (degree >= 25 && degree <= 30) {
      strength -= 1; // Weak degree
    }

    // Lagna lord strength
    const lordStrength = this.calculatePlanetaryStrength('lagnaLord', lagnaLordPosition);
    strength += (lordStrength - 5) / 2;

    return Math.max(1, Math.min(10, Math.round(strength)));
  }

  /**
   * Generate Lagna summary
   * @param {Object} ascendant - Ascendant data
   * @param {Object} lagnaLordPosition - Lagna lord position
   * @returns {string} Summary text
   */
  generateLagnaSummary(ascendant, lagnaLordPosition) {
    try {
      const signAnalysis = this.analyzeLagnaSign(ascendant.sign);
      const lordAnalysis = this.analyzeLagnaLord('lagnaLord', lagnaLordPosition);

      // Safe access to characteristics with fallbacks
      const firstCharacteristic = signAnalysis.characteristics && signAnalysis.characteristics[0]
        ? signAnalysis.characteristics[0].toLowerCase()
        : 'distinctive traits';

      const secondCharacteristic = signAnalysis.characteristics && signAnalysis.characteristics[1]
        ? signAnalysis.characteristics[1].toLowerCase()
        : 'notable qualities';

      // Safe access to effects with fallbacks
      const firstEffect = lordAnalysis.effects && lordAnalysis.effects[0]
        ? lordAnalysis.effects[0].toLowerCase()
        : 'significant influences';

      // Safe access to house with fallback
      const housePosition = lordAnalysis.house || 'an influential';

      return `You have a ${ascendant.sign} Ascendant, which gives you ${firstCharacteristic}. Your Lagna lord is placed in the ${housePosition}th house, indicating ${firstEffect}. Overall, this suggests a ${this.getStrengthDescription(lordAnalysis.strength)} personality with ${secondCharacteristic}.`;
    } catch (error) {
      // Fallback summary if analysis fails
      return `You have a ${ascendant.sign} Ascendant. Further detailed analysis of the Lagna requires complete chart data.`;
    }
  }

  /**
   * Get strength description
   * @param {number} strength - Strength score
   * @returns {string} Strength description
   */
  getStrengthDescription(strength) {
    if (strength >= 8) return 'very strong';
    if (strength >= 6) return 'strong';
    if (strength >= 4) return 'moderate';
    return 'weak';
  }

  // =============================================================================
  // PRIORITY 2: ENHANCED EXISTING SERVICES - ADVANCED LAGNA ANALYSIS METHODS
  // =============================================================================

  /**
   * Detect stelliums (3+ planets in one house) - Enhanced for Priority 2
   * Requirements mapping: "Overall Planet Distribution: Notate any major stellium (3 or more planets in one house)"
   * @param {Object} chart - Birth chart data
   * @returns {Object} Stellium detection analysis
   */
  detectStelliums(chart) {
    const { ascendant, planetaryPositions } = chart;
    const houseOccupancy = {};
    const stelliums = [];

    // Initialize house occupancy tracking
    for (let i = 1; i <= 12; i++) {
      houseOccupancy[i] = [];
    }

    // Calculate house position for each planet
    for (const [planet, position] of Object.entries(planetaryPositions)) {
      const houseNumber = this.calculateHouseFromLongitude(position.longitude, ascendant.longitude);
      houseOccupancy[houseNumber].push({
        planet,
        sign: position.sign,
        longitude: position.longitude,
        degree: position.longitude % 30
      });
    }

    // Identify stelliums (3+ planets in one house)
    for (const [house, planets] of Object.entries(houseOccupancy)) {
      if (planets.length >= 3) {
        stelliums.push({
          house: parseInt(house),
          planetCount: planets.length,
          planets: planets.map(p => p.planet),
          analysis: this.analyzeStelliumEffects(parseInt(house), planets),
          interpretation: this.interpretStellium(parseInt(house), planets)
        });
      }
    }

    return {
      stelliumsDetected: stelliums.length > 0,
      stelliumCount: stelliums.length,
      stelliums,
      houseOccupancy,
      overallPattern: this.analyzeOverallDistributionPattern(houseOccupancy),
      implications: this.getStelliumImplications(stelliums)
    };
  }

  /**
   * Analyze house clustering patterns - Enhanced for Priority 2
   * Requirements mapping: "Overall Planet Distribution: Are planets clustered in certain houses or evenly spread?"
   * @param {Object} chart - Birth chart data
   * @returns {Object} House clustering analysis
   */
  analyzeHouseClustering(chart) {
    const { ascendant, planetaryPositions } = chart;
    const houseGroups = {
      kendra: { houses: [1, 4, 7, 10], planets: [] },        // Angular houses
      trikona: { houses: [1, 5, 9], planets: [] },           // Trinal houses
      dusthana: { houses: [6, 8, 12], planets: [] },         // Difficult houses
      upachaya: { houses: [3, 6, 10, 11], planets: [] },     // Growing houses
      panapara: { houses: [2, 5, 8, 11], planets: [] },      // Succedent houses
      apoklima: { houses: [3, 6, 9, 12], planets: [] }       // Cadent houses
    };

    const housePlanetCount = {};
    for (let i = 1; i <= 12; i++) {
      housePlanetCount[i] = 0;
    }

    // Count planets in each house and group
    for (const [planet, position] of Object.entries(planetaryPositions)) {
      const houseNumber = this.calculateHouseFromLongitude(position.longitude, ascendant.longitude);
      housePlanetCount[houseNumber]++;

      // Add to appropriate groups
      for (const [groupName, groupData] of Object.entries(houseGroups)) {
        if (groupData.houses.includes(houseNumber)) {
          groupData.planets.push({
            planet,
            house: houseNumber,
            sign: position.sign
          });
        }
      }
    }

    // Analyze clustering patterns
    const clusteringAnalysis = this.analyzeClusteringPatterns(housePlanetCount, houseGroups);

    return {
      housePlanetCount,
      houseGroups,
      clusteringPattern: clusteringAnalysis.pattern,
      dominantGroup: clusteringAnalysis.dominantGroup,
      emptyHouses: this.findEmptyHouses(housePlanetCount),
      heavilyOccupiedHouses: this.findHeavilyOccupiedHouses(housePlanetCount),
      distribution: clusteringAnalysis.distribution,
      implications: this.getClusteringImplications(clusteringAnalysis)
    };
  }

  /**
   * Analyze planetary conjunctions (tight combinations) - Enhanced for Priority 2
   * Requirements mapping: "Major Conjunctions/Oppositions: Identify any tight conjunctions"
   * @param {Object} chart - Birth chart data
   * @returns {Object} Planetary conjunctions analysis
   */
  analyzePlanetaryConjunctions(chart) {
    const { planetaryPositions } = chart;
    const conjunctions = [];
    const planetArray = Object.entries(planetaryPositions);

    // Check all planet pairs for conjunctions
    for (let i = 0; i < planetArray.length; i++) {
      for (let j = i + 1; j < planetArray.length; j++) {
        const [planet1, position1] = planetArray[i];
        const [planet2, position2] = planetArray[j];

        const orb = this.calculateOrb(position1.longitude, position2.longitude);

        if (this.isConjunction(orb)) {
          conjunctions.push({
            planet1,
            planet2,
            orb,
            sign: position1.sign, // Assuming same sign for conjunction
            house: this.calculateHouseFromLongitude(position1.longitude, chart.ascendant.longitude),
            type: this.getConjunctionType(orb),
            strength: this.calculateConjunctionStrength(planet1, planet2, orb),
            effects: this.getConjunctionEffects(planet1, planet2),
            interpretation: this.interpretConjunction(planet1, planet2, orb)
          });
        }
      }
    }

    return {
      conjunctionsFound: conjunctions.length > 0,
      conjunctionCount: conjunctions.length,
      conjunctions,
      tightConjunctions: conjunctions.filter(c => c.type === 'Very Tight'),
      moderateConjunctions: conjunctions.filter(c => c.type === 'Moderate'),
      wideConjunctions: conjunctions.filter(c => c.type === 'Wide'),
      analysis: this.analyzeConjunctionPatterns(conjunctions),
      implications: this.getConjunctionImplications(conjunctions)
    };
  }

  /**
   * Detect planetary oppositions (7th house aspects) - Enhanced for Priority 2
   * Requirements mapping: "Major Conjunctions/Oppositions: note any significant oppositions (7th-house aspects)"
   * @param {Object} chart - Birth chart data
   * @returns {Object} Planetary oppositions analysis
   */
  detectPlanetaryOppositions(chart) {
    const { planetaryPositions } = chart;
    const oppositions = [];
    const planetArray = Object.entries(planetaryPositions);

    // Check all planet pairs for oppositions (180° aspect)
    for (let i = 0; i < planetArray.length; i++) {
      for (let j = i + 1; j < planetArray.length; j++) {
        const [planet1, position1] = planetArray[i];
        const [planet2, position2] = planetArray[j];

        const aspectDegree = this.calculateAspectDegree(position1.longitude, position2.longitude);
        const orb = Math.abs(aspectDegree - 180);

        if (this.isOpposition(orb)) {
          oppositions.push({
            planet1,
            planet2,
            aspectDegree,
            orb,
            sign1: position1.sign,
            sign2: position2.sign,
            house1: this.calculateHouseFromLongitude(position1.longitude, chart.ascendant.longitude),
            house2: this.calculateHouseFromLongitude(position2.longitude, chart.ascendant.longitude),
            type: this.getOppositionType(orb),
            strength: this.calculateOppositionStrength(planet1, planet2, orb),
            effects: this.getOppositionEffects(planet1, planet2),
            interpretation: this.interpretOpposition(planet1, planet2, orb)
          });
        }
      }
    }

    return {
      oppositionsFound: oppositions.length > 0,
      oppositionCount: oppositions.length,
      oppositions,
      tightOppositions: oppositions.filter(o => o.type === 'Very Tight'),
      moderateOppositions: oppositions.filter(o => o.type === 'Moderate'),
      wideOppositions: oppositions.filter(o => o.type === 'Wide'),
      analysis: this.analyzeOppositionPatterns(oppositions),
      implications: this.getOppositionImplications(oppositions)
    };
  }

  /**
   * Comprehensive exaltation/debilitation analysis - Refactored to use centralized ExaltationDebilitationCalculator
   * @param {Object} chart - Birth chart data
   * @returns {Object} Comprehensive exaltation/debilitation analysis
   */
  analyzeExaltationDebility(chart) {
    const { planetaryPositions } = chart;
    const analysis = {
      exalted: [],
      debilitated: [],
      ownSign: [],
      neechaBhanga: [],
      summary: {}
    };

    if (!planetaryPositions) {
      return analysis; // Return empty analysis if no planet data
    }

    for (const [planet, position] of Object.entries(planetaryPositions)) {
      // Use the single, authoritative dignity calculator
      const dignity = this.dignityCalculator.getDignity(planet, position.longitude);

      switch (dignity.dignityType) {
        case 'Exalted':
          analysis.exalted.push({ planet, sign: position.sign, degree: position.longitude % 30 });
          break;
        case 'Debilitated':
          analysis.debilitated.push({ planet, sign: position.sign, degree: position.longitude % 30 });
          break;
        case 'Own Sign':
          analysis.ownSign.push({ planet, sign: position.sign });
          break;
      }
    }

    analysis.summary = this.generateExaltationDebilitationSummary(analysis);
    return analysis;
  }

  /**
   * Comprehensive planetary dignity analysis - Enhanced for Priority 2
   * Requirements mapping: Complete dignity and strength evaluation for all planets
   * @param {Object} chart - Birth chart data
   * @returns {Object} Complete planetary dignity analysis
   */
  analyzeAllPlanetaryDignities(chart) {
    const { planetaryPositions } = chart;
    const dignityAnalysis = {};

    for (const [planet, position] of Object.entries(planetaryPositions)) {
      const houseNumber = this.calculateHouseFromLongitude(position.longitude, chart.ascendant.longitude);

      dignityAnalysis[planet] = {
        planet,
        sign: position.sign,
        house: houseNumber,
        dignity: this.analyzePlanetaryDignity(planet, position),
        strength: this.calculatePlanetaryStrength(planet, position),
        shadbala: this.calculateShadbala(planet, position, chart), // Six-fold strength
        ashtakavarga: this.calculateAshtakavarga(planet, chart), // Eight-fold division
        retrograde: position.isRetrograde || false,
        combust: position.isCombust || false,
        gandanta: this.checkGandanta(position),
        sandhi: this.checkSandhi(position),
        vargottama: this.checkVargottama(planet, chart),
        functionalNature: this.getFunctionalNature(planet, chart.ascendant.sign),
        overallAssessment: this.generatePlanetaryAssessment(planet, position, chart)
      };
    }

    return {
      planetaryDignities: dignityAnalysis,
      strongestPlanet: this.findStrongestPlanet(dignityAnalysis),
      weakestPlanet: this.findWeakestPlanet(dignityAnalysis),
      dominantElement: this.findDominantElement(dignityAnalysis),
      dominantQuality: this.findDominantQuality(dignityAnalysis),
      overallChartStrength: this.calculateOverallChartStrength(dignityAnalysis),
      recommendations: this.generateDignityRecommendations(dignityAnalysis)
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
   * Calculate orb between two planets
   * @param {number} longitude1 - First planet longitude
   * @param {number} longitude2 - Second planet longitude
   * @returns {number} Orb in degrees
   */
  calculateOrb(longitude1, longitude2) {
    const difference = Math.abs(longitude1 - longitude2);
    return Math.min(difference, 360 - difference);
  }

  /**
   * Calculate aspect degree between two planets
   * @param {number} longitude1 - First planet longitude
   * @param {number} longitude2 - Second planet longitude
   * @returns {number} Aspect degree
   */
  calculateAspectDegree(longitude1, longitude2) {
    const difference = (longitude2 - longitude1 + 360) % 360;
    return difference;
  }

  /**
   * Check if orb indicates conjunction
   * @param {number} orb - Orb in degrees
   * @returns {boolean} Is conjunction
   */
  isConjunction(orb) {
    return orb <= 10; // Within 10 degrees
  }

  /**
   * Check if orb indicates opposition
   * @param {number} orb - Orb from 180 degrees
   * @returns {boolean} Is opposition
   */
  isOpposition(orb) {
    return orb <= 8; // Within 8 degrees of 180°
  }

  /**
   * Get conjunction type based on orb
   * @param {number} orb - Orb in degrees
   * @returns {string} Conjunction type
   */
  getConjunctionType(orb) {
    if (orb <= 3) return 'Very Tight';
    if (orb <= 6) return 'Moderate';
    return 'Wide';
  }

  /**
   * Get opposition type based on orb
   * @param {number} orb - Orb from 180 degrees
   * @returns {string} Opposition type
   */
  getOppositionType(orb) {
    if (orb <= 2) return 'Very Tight';
    if (orb <= 5) return 'Moderate';
    return 'Wide';
  }

  // Stellium analysis helper methods
  analyzeStelliumEffects(house, planets) {
    return {
      houseTheme: `Intense focus on ${house}th house matters`,
      planetaryBlend: 'Multiple planetary energies combining',
      strength: planets.length >= 4 ? 'Very Strong' : 'Strong'
    };
  }

  interpretStellium(house, planets) {
    return `Stellium in ${house}th house with ${planets.length} planets indicates major life focus in this area`;
  }

  analyzeOverallDistributionPattern(houseOccupancy) {
    const occupiedHouses = Object.values(houseOccupancy).filter(planets => planets.length > 0).length;
    if (occupiedHouses <= 4) return 'Highly Concentrated';
    if (occupiedHouses <= 7) return 'Moderately Concentrated';
    return 'Well Distributed';
  }

  getStelliumImplications(stelliums) {
    if (stelliums.length === 0) return ['No stelliums - balanced planetary distribution'];
    return stelliums.map(s => `Strong focus on ${s.house}th house themes`);
  }

  // Clustering analysis helper methods
  analyzeClusteringPatterns(housePlanetCount, houseGroups) {
    const patterns = {};
    let dominantGroup = '';
    let maxPlanets = 0;

    for (const [groupName, groupData] of Object.entries(houseGroups)) {
      patterns[groupName] = groupData.planets.length;
      if (groupData.planets.length > maxPlanets) {
        maxPlanets = groupData.planets.length;
        dominantGroup = groupName;
      }
    }

    return {
      pattern: this.determineDistributionPattern(patterns),
      dominantGroup,
      distribution: patterns
    };
  }

  determineDistributionPattern(patterns) {
    if (patterns.kendra >= 4) return 'Kendra Dominant';
    if (patterns.trikona >= 3) return 'Trikona Dominant';
    if (patterns.dusthana >= 3) return 'Dusthana Concentrated';
    return 'Balanced Distribution';
  }

  findEmptyHouses(housePlanetCount) {
    return Object.entries(housePlanetCount)
      .filter(([house, count]) => count === 0)
      .map(([house]) => parseInt(house));
  }

  findHeavilyOccupiedHouses(housePlanetCount) {
    return Object.entries(housePlanetCount)
      .filter(([house, count]) => count >= 2)
      .map(([house, count]) => ({ house: parseInt(house), count }));
  }

  getClusteringImplications(analysis) {
    return [`Chart shows ${analysis.pattern.toLowerCase()} with emphasis on ${analysis.dominantGroup} houses`];
  }

  // Conjunction analysis helper methods
  calculateConjunctionStrength(planet1, planet2, orb) {
    const baseStrength = 10 - orb; // Tighter orb = stronger
    return Math.max(1, Math.min(10, baseStrength));
  }

  getConjunctionEffects(planet1, planet2) {
    return [`${planet1} and ${planet2} energies combine and influence each other`];
  }

  interpretConjunction(planet1, planet2, orb) {
    return `${planet1} conjunct ${planet2} with ${orb.toFixed(1)}° orb creates blended energy`;
  }

  analyzeConjunctionPatterns(conjunctions) {
    return {
      totalConjunctions: conjunctions.length,
      involvedPlanets: [...new Set(conjunctions.flatMap(c => [c.planet1, c.planet2]))],
      averageOrb: conjunctions.reduce((sum, c) => sum + c.orb, 0) / conjunctions.length || 0
    };
  }

  getConjunctionImplications(conjunctions) {
    if (conjunctions.length === 0) return ['No major conjunctions - planets act independently'];
    return [`${conjunctions.length} conjunction(s) creating blended planetary energies`];
  }

  // Opposition analysis helper methods
  calculateOppositionStrength(planet1, planet2, orb) {
    const baseStrength = 10 - orb; // Tighter orb = stronger
    return Math.max(1, Math.min(10, baseStrength));
  }

  getOppositionEffects(planet1, planet2) {
    return [`${planet1} and ${planet2} create tension and balance across the chart`];
  }

  interpretOpposition(planet1, planet2, orb) {
    return `${planet1} opposite ${planet2} with ${orb.toFixed(1)}° orb creates polarizing energy`;
  }

  analyzeOppositionPatterns(oppositions) {
    return {
      totalOppositions: oppositions.length,
      involvedPlanets: [...new Set(oppositions.flatMap(o => [o.planet1, o.planet2]))],
      averageOrb: oppositions.reduce((sum, o) => sum + o.orb, 0) / oppositions.length || 0
    };
  }

  getOppositionImplications(oppositions) {
    if (oppositions.length === 0) return ['No major oppositions - minimal planetary tension'];
    return [`${oppositions.length} opposition(s) creating dynamic tension in the chart`];
  }

  // Exaltation/Debilitation helper methods
  checkDeepExaltation(planet, position, exaltationData) {
    const degree = position.longitude % 30;
    const exaltDegree = exaltationData.degree;
    return Math.abs(degree - exaltDegree) <= 1; // Within 1 degree of exact exaltation
  }

  checkNeechaBhanga(planet, chart) {
    const planetData = chart.planets[planet];
    if (!planetData || planetData.dignity !== 'Debilitated') return { isCancelled: false, reasons: [] };

    const reasons = [];
    const debilitationSign = planetData.sign;
    const debilitationLord = this.getSignLord(debilitationSign);
    const debilitationLordPos = chart.planets[debilitationLord.toLowerCase()];
    const ascendantHouse = this.calculateHouseFromLongitude(chart.ascendant.longitude, chart.ascendant.longitude);
    const moonHouse = this.calculateHouseFromLongitude(chart.planets.Moon.longitude, chart.ascendant.longitude);

    // Rule 1: Lord of the debilitation sign is in a Kendra (1,4,7,10) from Lagna or Moon.
    if (debilitationLordPos) {
      if (this.isKendra(debilitationLordPos.house, ascendantHouse) || this.isKendra(debilitationLordPos.house, moonHouse)) {
        reasons.push(`Lord of debilitation sign (${debilitationLord}) is in a Kendra from Lagna or Moon.`);
      }
    }

    // Rule 2: The planet that gets exalted in the debilitation sign is in a Kendra from Lagna or Moon.
    const exaltingPlanetInDebilitationSign = this.getPlanetExaltedInSign(debilitationSign);
    if (exaltingPlanetInDebilitationSign) {
      const exaltingPlanetPos = chart.planets[exaltingPlanetInDebilitationSign.toLowerCase()];
      if (exaltingPlanetPos && (this.isKendra(exaltingPlanetPos.house, ascendantHouse) || this.isKendra(exaltingPlanetPos.house, moonHouse))) {
        reasons.push(`Planet exalted in debilitation sign (${exaltingPlanetInDebilitationSign}) is in a Kendra from Lagna or Moon.`);
      }
    }

    // Rule 3: The debilitated planet is aspected by its sign lord.
    if (debilitationLordPos && this.hasAspect(debilitationLordPos, planetData, debilitationLord)) {
      reasons.push(`Debilitated planet (${planet}) is aspected by its sign lord (${debilitationLord}).`);
    }

    // Rule 4: The debilitated planet is aspected by the planet that gets exalted in its debilitation sign.
    if (exaltingPlanetInDebilitationSign) {
      const exaltingPlanetPos = chart.planets[exaltingPlanetInDebilitationSign.toLowerCase()];
      if (exaltingPlanetPos && this.hasAspect(exaltingPlanetPos, planetData, exaltingPlanetInDebilitationSign)) {
        reasons.push(`Debilitated planet (${planet}) is aspected by the planet exalted in its debilitation sign (${exaltingPlanetInDebilitationSign}).`);
      }
    }

    // Rule 5: The debilitated planet is in a Kendra from Lagna or Moon.
    if (this.isKendra(planetData.house, ascendantHouse) || this.isKendra(planetData.house, moonHouse)) {
      reasons.push(`Debilitated planet (${planet}) is in a Kendra from Lagna or Moon.`);
    }

    // Rule 6: The debilitated planet is conjunct with an exalted planet.
    const conjunctPlanets = Object.values(chart.planets).filter(p => p.planet !== planet && p.house === planetData.house);
    for (const cPlanet of conjunctPlanets) {
      if (cPlanet.dignity === 'Exalted') {
        reasons.push(`Debilitated planet (${planet}) is conjunct with exalted ${cPlanet.planet}.`);
      }
    }

    return {
      isCancelled: reasons.length > 0,
      reasons: reasons
    };
  }

  // Helper to check if a house is Kendra from a reference house
  isKendra(house, referenceHouse) {
    const diff = Math.abs(house - referenceHouse);
    return [0, 3, 6, 9].includes(diff); // 1st, 4th, 7th, 10th houses relative to reference
  }

  // Helper to get the planet that gets exalted in a given sign
  getPlanetExaltedInSign(sign) {
    const exaltationMap = {
      'Aries': 'Sun', 'Taurus': 'Moon', 'Cancer': 'Jupiter', 'Virgo': 'Mercury',
      'Libra': 'Saturn', 'Capricorn': 'Mars', 'Pisces': 'Venus'
    };
    return exaltationMap[sign];
  }

  // Production-grade planetary aspect calculation using precise Vedic aspect rules
  hasAspect(aspectingPlanetPos, receivingPlanetPos, aspectingPlanetName) {
    // Complete implementation using precise aspect rules with proper orbs and strength calculation
    const separation = this.calculateLongitudinalSeparation(aspectingPlanetPos.longitude, receivingPlanetPos.longitude);
    const planetName = aspectingPlanetName.toUpperCase();

    // Define precise aspect angles and orbs for each planet
    const aspectData = this.getPlanetaryAspectData(planetName);

    for (const aspect of aspectData.aspects) {
      const deviation = Math.abs(separation - aspect.angle);
      const normalizedDeviation = Math.min(deviation, 360 - deviation);

      if (normalizedDeviation <= aspect.orb) {
        // Calculate aspect strength based on exactness
        const strength = (aspect.orb - normalizedDeviation) / aspect.orb;

        // Minimum strength threshold for valid aspect (30% of maximum)
        if (strength >= 0.3) {
          return {
            hasAspect: true,
            aspectType: aspect.name,
            angle: aspect.angle,
            orb: normalizedDeviation,
            strength: strength,
            nature: this.getAspectNature(planetName, aspect.name)
          };
        }
      }
    }

    return { hasAspect: false };
  }

  /**
   * Get planetary aspect data with precise angles and orbs
   * @param {string} planetName - Planet name in uppercase
   * @returns {Object} Aspect data with angles and orbs
   */
  getPlanetaryAspectData(planetName) {
    const aspectData = {
      'SUN': {
        aspects: [
          { name: '7th House', angle: 180, orb: 8 }
        ]
      },
      'MOON': {
        aspects: [
          { name: '7th House', angle: 180, orb: 8 }
        ]
      },
      'MARS': {
        aspects: [
          { name: '4th House', angle: 90, orb: 8 },
          { name: '7th House', angle: 180, orb: 8 },
          { name: '8th House', angle: 210, orb: 8 }
        ]
      },
      'MERCURY': {
        aspects: [
          { name: '7th House', angle: 180, orb: 6 }
        ]
      },
      'JUPITER': {
        aspects: [
          { name: '5th House', angle: 120, orb: 9 },
          { name: '7th House', angle: 180, orb: 9 },
          { name: '9th House', angle: 240, orb: 9 }
        ]
      },
      'VENUS': {
        aspects: [
          { name: '7th House', angle: 180, orb: 7 }
        ]
      },
      'SATURN': {
        aspects: [
          { name: '3rd House', angle: 60, orb: 9 },
          { name: '7th House', angle: 180, orb: 9 },
          { name: '10th House', angle: 270, orb: 9 }
        ]
      },
      'RAHU': {
        aspects: [
          { name: '5th House', angle: 120, orb: 6 },
          { name: '7th House', angle: 180, orb: 6 },
          { name: '9th House', angle: 240, orb: 6 }
        ]
      },
      'KETU': {
        aspects: [
          { name: '5th House', angle: 120, orb: 6 },
          { name: '7th House', angle: 180, orb: 6 },
          { name: '9th House', angle: 240, orb: 6 }
        ]
      }
    };

    return aspectData[planetName] || aspectData['SUN']; // Default to Sun's aspects
  }

  /**
   * Get aspect nature (benefic/malefic/neutral)
   * @param {string} planetName - Planet name
   * @param {string} aspectName - Aspect name
   * @returns {string} Aspect nature
   */
  getAspectNature(planetName, aspectName) {
    const beneficPlanets = ['JUPITER', 'VENUS', 'MOON'];
    const maleficPlanets = ['MARS', 'SATURN', 'SUN', 'RAHU', 'KETU'];

    if (beneficPlanets.includes(planetName)) {
      return 'Benefic';
    } else if (maleficPlanets.includes(planetName)) {
      return 'Malefic';
    } else {
      return 'Neutral'; // Mercury
    }
  }

  /**
   * Check if two planets have mutual aspect (production implementation)
   * @param {Object} chart - Birth chart data
   * @param {string} planet1 - First planet name
   * @param {string} planet2 - Second planet name
   * @returns {boolean} Whether planets have mutual aspect
   */
  hasMutualAspect(chart, planet1, planet2) {
    const p1Data = chart.planets[planet1];
    const p2Data = chart.planets[planet2];
    if (!p1Data || !p2Data) return false;

    // Calculate mutual aspect considering:
    // 1. Standard 7th house aspects (all planets)
    // 2. Special aspects for Mars (4th, 7th, 8th)
    // 3. Special aspects for Jupiter (5th, 7th, 9th)
    // 4. Special aspects for Saturn (3rd, 7th, 10th)
    // 5. Rahu/Ketu aspects (5th, 7th, 9th)

    const p1AspectsP2 = this.hasAspect(p1Data, p2Data, planet1);
    const p2AspectsP1 = this.hasAspect(p2Data, p1Data, planet2);

    // For mutual aspect, both planets must aspect each other
    if (p1AspectsP2 && p2AspectsP1) {
      // Additional check for aspect strength and orb
      const aspectStrength1 = this.calculateMutualAspectStrength(p1Data, p2Data, planet1);
      const aspectStrength2 = this.calculateMutualAspectStrength(p2Data, p1Data, planet2);

      // Consider it mutual if both aspects have reasonable strength (>= 3 out of 10)
      return aspectStrength1 >= 3 && aspectStrength2 >= 3;
    }

    return false;
  }

  /**
   * Calculate mutual aspect strength between two planets
   * @param {Object} aspectingPlanet - Aspecting planet data
   * @param {Object} receivingPlanet - Receiving planet data
   * @param {string} aspectingPlanetName - Aspecting planet name
   * @returns {number} Aspect strength (0-10)
   */
  calculateMutualAspectStrength(aspectingPlanet, receivingPlanet, aspectingPlanetName) {
    const angleDiff = this.calculateAspectDegree(aspectingPlanet.longitude, receivingPlanet.longitude);
    const planetUpper = aspectingPlanetName.toUpperCase();

    // Calculate orb (allowable deviation from exact aspect)
    let orb = 0;
    let exactAspectAngle = 0;

    // Standard 7th house aspect (180 degrees)
    if (Math.abs(angleDiff - 180) <= 8) {
      orb = Math.abs(angleDiff - 180);
      exactAspectAngle = 180;
    }
    // Special aspects for specific planets
    else if (planetUpper === 'MARS') {
      // 4th house aspect (90 degrees)
      if (Math.abs(angleDiff - 90) <= 8) {
        orb = Math.abs(angleDiff - 90);
        exactAspectAngle = 90;
      }
      // 8th house aspect (210 degrees)
      else if (Math.abs(angleDiff - 210) <= 8) {
        orb = Math.abs(angleDiff - 210);
        exactAspectAngle = 210;
      }
    }
    else if (planetUpper === 'JUPITER') {
      // 5th house aspect (120 degrees)
      if (Math.abs(angleDiff - 120) <= 8) {
        orb = Math.abs(angleDiff - 120);
        exactAspectAngle = 120;
      }
      // 9th house aspect (240 degrees)
      else if (Math.abs(angleDiff - 240) <= 8) {
        orb = Math.abs(angleDiff - 240);
        exactAspectAngle = 240;
      }
    }
    else if (planetUpper === 'SATURN') {
      // 3rd house aspect (60 degrees)
      if (Math.abs(angleDiff - 60) <= 8) {
        orb = Math.abs(angleDiff - 60);
        exactAspectAngle = 60;
      }
      // 10th house aspect (270 degrees)
      else if (Math.abs(angleDiff - 270) <= 8) {
        orb = Math.abs(angleDiff - 270);
        exactAspectAngle = 270;
      }
    }
    else if (['RAHU', 'KETU'].includes(planetUpper)) {
      // 5th house aspect (120 degrees)
      if (Math.abs(angleDiff - 120) <= 8) {
        orb = Math.abs(angleDiff - 120);
        exactAspectAngle = 120;
      }
      // 9th house aspect (240 degrees)
      else if (Math.abs(angleDiff - 240) <= 8) {
        orb = Math.abs(angleDiff - 240);
        exactAspectAngle = 240;
      }
    }

    // If no valid aspect found
    if (exactAspectAngle === 0) return 0;

    // Calculate strength based on orb (closer to exact = stronger)
    const maxOrb = 8;
    const strength = Math.round(((maxOrb - orb) / maxOrb) * 10);

    return Math.max(0, Math.min(10, strength));
  }

  getExaltationEffects(planet) {
    return [`${planet} gives excellent results in all significations`];
  }

  getDebilitationEffects(planet, isNeechaBhanga) {
    if (isNeechaBhanga) {
      return [`${planet} debilitation is cancelled - results improve significantly`];
    }
    return [`${planet} may give challenging results requiring extra effort`];
  }

  getOwnSignEffects(planet) {
    return [`${planet} is comfortable and gives natural results`];
  }

  generateExaltationDebilitationSummary(analysis) {
    return {
      exaltedCount: analysis.exalted.length,
      debilitatedCount: analysis.debilitated.length,
      ownSignCount: analysis.ownSign.length,
      neechaBhangaCount: analysis.neechaBhanga.length,
      overallStrength: this.calculateExaltationDebilitationStrength(analysis)
    };
  }

  calculateExaltationDebilitationStrength(analysis) {
    const exaltedPoints = analysis.exalted.length * 3;
    const ownSignPoints = analysis.ownSign.length * 2;
    const debilitatedPoints = analysis.debilitated.length * -2;
    const neechaBhangaPoints = analysis.neechaBhanga.length * 1;

    return exaltedPoints + ownSignPoints + debilitatedPoints + neechaBhangaPoints;
  }

  // Dignity analysis helper methods
  calculateShadbala(planet, position, chart) {
    // This function calculates the Shadbala (Six-fold strength) of a planet.
    // A full implementation involves calculating 6 types of strength:
    // 1. Sthana Bala (Positional Strength)
    // 2. Dig Bala (Directional Strength)
    // 3. Kaala Bala (Temporal Strength)
    // 4. Cheshta Bala (Motional Strength)
    // 5. Naisargika Bala (Natural Strength)
    // 6. Drik Bala (Aspectual Strength)

    // For demonstration, we'll provide a more detailed approximation.

    let totalShadbala = 0;
    const components = {};

    // 1. Sthana Bala (Positional Strength) - based on dignity
    const dignity = this.analyzePlanetaryDignity(planet, position);
    let sthanaBala = 0;
    switch (dignity.dignityType) {
      case 'Exalted': sthanaBala = 60; break; // Max strength
      case 'Own Sign': sthanaBala = 45; break;
      case 'Friendly Sign': sthanaBala = 30; break;
      case 'Neutral Sign': sthanaBala = 15; break;
      case 'Enemy Sign': sthanaBala = 7.5; break;
      case 'Debilitated': sthanaBala = 0; break; // Min strength
    }
    components.sthanaBala = sthanaBala;
    totalShadbala += sthanaBala;

    // 2. Dig Bala (Directional Strength) - based on house placement
    const house = this.calculateHouseFromLongitude(position.longitude, chart.ascendant.longitude);
    let digBala = 0;
    // Ideal houses for Dig Bala: Sun/Mars (10th), Moon/Venus (4th), Jupiter/Mercury (1st), Saturn (7th)
    const idealDigBalaHouse = {
      'Sun': 10, 'Moon': 4, 'Mars': 10, 'Mercury': 1, 'Jupiter': 1, 'Venus': 4, 'Saturn': 7
    };
    if (idealDigBalaHouse[planet] === house) {
      digBala = 60; // Max strength
    } else {
      // Approximate reduction based on distance from ideal house
      const distance = Math.abs(house - idealDigBalaHouse[planet]);
      digBala = Math.max(0, 60 - (distance * 5)); // Rough approximation
    }
    components.digBala = digBala;
    totalShadbala += digBala;

    // 3. Kaala Bala (Temporal Strength) - based on time of birth, day of week, etc.
    // Production-grade: Considers day/night birth, paksha (lunar fortnight), and year/month/day lords.
    // For this implementation, we'll focus on day/night strength and a basic paksha consideration.
    const birthTimeParts = chart.birthData.timeOfBirth.split(':').map(Number);
    const birthHour = birthTimeParts[0];
    const isDayBirth = birthHour >= 6 && birthHour < 18; // Day: 6 AM to 6 PM

    let kaalaBala = 0; // Max 60 units

    // Day/Night Strength (Dina-Ratri Bala)
    const dayStrongPlanets = ['Sun', 'Jupiter', 'Venus'];
    const nightStrongPlanets = ['Moon', 'Mars', 'Saturn'];

    if (isDayBirth) {
      if (dayStrongPlanets.includes(planet)) kaalaBala += 30;
      else if (nightStrongPlanets.includes(planet)) kaalaBala += 0; // No strength
      else if (planet === 'Mercury') kaalaBala += 30; // Mercury is strong day or night
    } else { // Night birth
      if (nightStrongPlanets.includes(planet)) kaalaBala += 30;
      else if (dayStrongPlanets.includes(planet)) kaalaBala += 0; // No strength
      else if (planet === 'Mercury') kaalaBala += 30; // Mercury is strong day or night
    }

    // Paksha Bala (Lunar Fortnight Strength) - Production implementation
    const pakshaStrength = this.calculatePakshaBala(planet, chart);
    kaalaBala += pakshaStrength;

    // Other Kaala Balas (Tri-bhaga, Varsha, Masa, Dina, Hora, Ayana, Yuddha) are complex and omitted for brevity.

    components.kaalaBala = Math.min(60, kaalaBala); // Cap at 60
    totalShadbala += components.kaalaBala;

    // 4. Cheshta Bala (Motional Strength) - based on direct/retrograde motion, speed
    let cheshtaBala = 30; // Base
    if (position.isRetrograde) {
      cheshtaBala = 60; // Retrograde adds strength in Vedic astrology
    }
    // Speed (would need ephemeris for accurate speed)
    // For now, assuming faster planets have more cheshta bala
    const fastPlanets = ['Mercury', 'Venus'];
    if (fastPlanets.includes(planet)) {
      cheshtaBala += 10;
    }
    components.cheshtaBala = Math.min(60, cheshtaBala);
    totalShadbala += components.cheshtaBala;

    // 5. Naisargika Bala (Natural Strength) - inherent strength
    const naisargikaBalaValues = {
      'Sun': 60, 'Moon': 50, 'Mars': 40, 'Mercury': 30, 'Jupiter': 70, 'Venus': 55, 'Saturn': 40
    };
    components.naisargikaBala = naisargikaBalaValues[planet] || 30;
    totalShadbala += components.naisargikaBala;

    // 6. Drik Bala (Aspectual Strength) - based on aspects received
    // Production-grade aspectual strength calculation
    const aspectualAnalysis = this.calculateDetailedAspectualStrength(planet, chart);
    components.drikBala = aspectualAnalysis.totalDrikBala;
    components.aspectDetails = aspectualAnalysis.aspectDetails;
    totalShadbala += components.drikBala;

    return {
      total: totalShadbala,
      components: components,
      description: `Shadbala: ${totalShadbala} units.`,
      grade: this.getShadbalaGrade(totalShadbala)
    };
  }

  // Calculate detailed aspectual strength (Drik Bala)
  calculateDetailedAspectualStrength(planet, chart) {
    const planetPos = chart.planets[planet.toLowerCase()];
    if (!planetPos) return { totalDrikBala: 30, aspectDetails: [] };

    const allPlanets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
    const aspectDetails = [];
    let totalDrikBala = 30; // Base strength

    // Planetary natures for aspectual analysis
    const planetaryNatures = {
      'Sun': { nature: 'mild_malefic', baseStrength: 7 },
      'Moon': { nature: 'benefic', baseStrength: 8 },
      'Mars': { nature: 'malefic', baseStrength: 9 },
      'Mercury': { nature: 'neutral', baseStrength: 6 },
      'Jupiter': { nature: 'benefic', baseStrength: 10 },
      'Venus': { nature: 'benefic', baseStrength: 8 },
      'Saturn': { nature: 'malefic', baseStrength: 8 }
    };

    for (const aspectingPlanet of allPlanets) {
      if (aspectingPlanet.toLowerCase() === planet.toLowerCase()) continue;

      const aspectingPos = chart.planets[aspectingPlanet.toLowerCase()];
      if (!aspectingPos) continue;

      const aspectAnalysis = this.calculatePlanetaryAspect(aspectingPos, planetPos, aspectingPlanet);

      if (aspectAnalysis.hasAspect) {
        const aspectingNature = planetaryNatures[aspectingPlanet];
        const aspectStrength = this.calculateAspectStrength(aspectAnalysis, aspectingNature);

        aspectDetails.push({
          aspectingPlanet,
          aspectType: aspectAnalysis.aspectType,
          orb: aspectAnalysis.orb,
          strength: aspectStrength,
          nature: aspectingNature.nature,
          effect: aspectStrength > 0 ? 'beneficial' : 'malefic'
        });

        // Add to total Drik Bala
        totalDrikBala += aspectStrength;
      }
    }

    // Calculate aspects from Rahu and Ketu if available
    const rahuPos = chart.planets.rahu;
    const ketuPos = chart.planets.ketu;

    if (rahuPos) {
      const rahuAspect = this.calculateNodalAspect(rahuPos, planetPos, 'Rahu');
      if (rahuAspect.hasAspect) {
        const rahuStrength = this.calculateNodalAspectStrength(rahuAspect);
        aspectDetails.push({
          aspectingPlanet: 'Rahu',
          aspectType: rahuAspect.aspectType,
          orb: rahuAspect.orb,
          strength: rahuStrength,
          nature: 'malefic',
          effect: rahuStrength > 0 ? 'intensifying' : 'malefic'
        });
        totalDrikBala += rahuStrength;
      }
    }

    if (ketuPos) {
      const ketuAspect = this.calculateNodalAspect(ketuPos, planetPos, 'Ketu');
      if (ketuAspect.hasAspect) {
        const ketuStrength = this.calculateNodalAspectStrength(ketuAspect);
        aspectDetails.push({
          aspectingPlanet: 'Ketu',
          aspectType: ketuAspect.aspectType,
          orb: ketuAspect.orb,
          strength: ketuStrength,
          nature: 'malefic',
          effect: ketuStrength > 0 ? 'spiritual' : 'malefic'
        });
        totalDrikBala += ketuStrength;
      }
    }

    // Normalize to 0-60 range
    totalDrikBala = Math.max(0, Math.min(60, totalDrikBala));

    return {
      totalDrikBala,
      aspectDetails,
      beneficAspectsCount: aspectDetails.filter(a => a.effect === 'beneficial').length,
      maleficAspectsCount: aspectDetails.filter(a => a.effect === 'malefic').length
    };
  }

  // Calculate planetary aspect between two positions
  calculatePlanetaryAspect(aspectingPos, receivingPos, aspectingPlanet) {
    const separation = this.calculateLongitudinalSeparation(aspectingPos.longitude, receivingPos.longitude);

    // Define aspects for each planet
    const planetaryAspects = {
      'Sun': [180], // 7th house
      'Moon': [180], // 7th house
      'Mercury': [180], // 7th house
      'Venus': [180], // 7th house
      'Mars': [90, 180, 240], // 4th, 7th, 8th house
      'Jupiter': [120, 180, 240], // 5th, 7th, 9th house
      'Saturn': [60, 180, 270] // 3rd, 7th, 10th house
    };

    const aspects = planetaryAspects[aspectingPlanet] || [180];
    const orb = aspectingPlanet === 'Mars' || aspectingPlanet === 'Saturn' || aspectingPlanet === 'Jupiter' ? 8 : 6;

    for (const aspectDegree of aspects) {
      const deviation = Math.abs(separation - aspectDegree);
      const normalizedDeviation = Math.min(deviation, 360 - deviation);

      if (normalizedDeviation <= orb) {
        return {
          hasAspect: true,
          aspectType: this.getAspectTypeName(aspectDegree, aspectingPlanet),
          orb: normalizedDeviation,
          exactAngle: aspectDegree,
          strength: (orb - normalizedDeviation) / orb // Closer = stronger
        };
      }
    }

    return { hasAspect: false };
  }

  // Calculate nodal aspects (Rahu/Ketu)
  calculateNodalAspect(nodalPos, receivingPos, node) {
    const separation = this.calculateLongitudinalSeparation(nodalPos.longitude, receivingPos.longitude);
    const nodalAspects = [120, 180, 240]; // 5th, 7th, 9th like Jupiter
    const orb = 6;

    for (const aspectDegree of nodalAspects) {
      const deviation = Math.abs(separation - aspectDegree);
      const normalizedDeviation = Math.min(deviation, 360 - deviation);

      if (normalizedDeviation <= orb) {
        return {
          hasAspect: true,
          aspectType: `${node} ${this.getAspectTypeName(aspectDegree, node)}`,
          orb: normalizedDeviation,
          exactAngle: aspectDegree,
          strength: (orb - normalizedDeviation) / orb
        };
      }
    }

    return { hasAspect: false };
  }

  // Calculate longitudinal separation
  calculateLongitudinalSeparation(long1, long2) {
    let separation = Math.abs(long1 - long2);
    return separation > 180 ? 360 - separation : separation;
  }

  // Get aspect type name
  getAspectTypeName(aspectDegree, planet) {
    const aspectNames = {
      60: '3rd house aspect',
      90: '4th house aspect',
      120: '5th house aspect',
      180: '7th house aspect',
      240: '8th house aspect',
      270: '10th house aspect'
    };

    return aspectNames[aspectDegree] || `${aspectDegree}° aspect`;
  }

  // Calculate aspect strength for Drik Bala
  calculateAspectStrength(aspectAnalysis, aspectingNature) {
    const baseStrength = aspectingNature.baseStrength;
    const orbFactor = aspectAnalysis.strength; // Already normalized 0-1
    const natureFactor = aspectingNature.nature === 'benefic' ? 1 :
                         aspectingNature.nature === 'malefic' ? -0.8 : 0.5;

    return Math.round(baseStrength * orbFactor * natureFactor);
  }

  // Calculate nodal aspect strength
  calculateNodalAspectStrength(aspectAnalysis) {
    const baseStrength = 6;
    const orbFactor = aspectAnalysis.strength;
    const nodalFactor = -0.6; // Generally challenging but can be transformative

    return Math.round(baseStrength * orbFactor * nodalFactor);
  }

  // Helper to count benefic aspects (simplified - kept for compatibility)
  countBeneficAspects(planet, chart) {
    const aspectAnalysis = this.calculateDetailedAspectualStrength(planet, chart);
    return aspectAnalysis.beneficAspectsCount;
  }

  // Helper to count malefic aspects (simplified - kept for compatibility)
  countMaleficAspects(planet, chart) {
    const aspectAnalysis = this.calculateDetailedAspectualStrength(planet, chart);
    return aspectAnalysis.maleficAspectsCount;
  }

  // Helper to get Shadbala grade
  getShadbalaGrade(total) {
    if (total >= 360) return 'Excellent'; // 60 units per bala * 6 = 360
    if (total >= 300) return 'Very Good';
    if (total >= 240) return 'Good';
    if (total >= 180) return 'Average';
    return 'Weak';
  }

  // Calculate Paksha Bala (Lunar Fortnight Strength)
  calculatePakshaBala(planet, chart) {
    const sunPosition = chart.planets.sun?.longitude || 0;
    const moonPosition = chart.planets.moon?.longitude || 0;

    // Calculate lunar elongation (angular distance between Sun and Moon)
    let elongation = moonPosition - sunPosition;
    if (elongation < 0) elongation += 360;

    // Determine paksha (lunar fortnight)
    const isShuklaPaksha = elongation >= 0 && elongation < 180; // Waxing moon
    const isKrishnaPaksha = elongation >= 180 && elongation < 360; // Waning moon

    // Calculate paksha strength based on lunar phase
    let pakshaStrength = 0;

    if (isShuklaPaksha) {
      // Shukla Paksha (Waxing Moon) - beneficial for Moon and Mercury
      if (planet === 'Moon' || planet === 'Mercury') {
        // Strength increases from 0 to 15 as moon waxes
        pakshaStrength = (elongation / 180) * 15;
      } else {
        // Other planets get reduced strength during waxing moon
        pakshaStrength = 15 - ((elongation / 180) * 15);
      }
    } else if (isKrishnaPaksha) {
      // Krishna Paksha (Waning Moon) - beneficial for Sun, Mars, Jupiter, Venus, Saturn
      const waning_progress = (elongation - 180) / 180;

      if (planet === 'Sun' || planet === 'Mars' || planet === 'Jupiter' ||
          planet === 'Venus' || planet === 'Saturn') {
        // Strength increases as moon wanes
        pakshaStrength = waning_progress * 15;
      } else {
        // Moon and Mercury get reduced strength during waning moon
        pakshaStrength = 15 - (waning_progress * 15);
      }
    }

    // Add tithi-specific adjustments
    const tithi = this.calculateTithi(elongation);
    const tithiAdjustment = this.getTithiStrengthAdjustment(tithi, planet);

    return Math.max(0, Math.min(15, pakshaStrength + tithiAdjustment));
  }

  // Calculate Tithi (lunar day) from elongation
  calculateTithi(elongation) {
    // Each tithi is 12 degrees of elongation
    return Math.floor(elongation / 12) + 1;
  }

  // Get tithi-specific strength adjustments
  getTithiStrengthAdjustment(tithi, planet) {
    // Special tithis with planetary associations
    const tithiRulers = {
      1: 'Sun', 2: 'Moon', 3: 'Mars', 4: 'Mercury', 5: 'Jupiter',
      6: 'Venus', 7: 'Saturn', 8: 'Rahu', 9: 'Sun', 10: 'Moon',
      11: 'Mars', 12: 'Mercury', 13: 'Jupiter', 14: 'Venus', 15: 'Saturn',
      16: 'Moon', 17: 'Mars', 18: 'Mercury', 19: 'Jupiter', 20: 'Venus',
      21: 'Saturn', 22: 'Rahu', 23: 'Sun', 24: 'Moon', 25: 'Mars',
      26: 'Mercury', 27: 'Jupiter', 28: 'Venus', 29: 'Saturn', 30: 'Rahu'
    };

    const ruler = tithiRulers[tithi];

    if (ruler === planet) {
      return 3; // Bonus for planetary ruler of tithi
    }

    // Auspicious tithis (2, 3, 5, 7, 10, 11, 13)
    const auspiciousTithis = [2, 3, 5, 7, 10, 11, 13];
    if (auspiciousTithis.includes(tithi)) {
      return 1;
    }

    // Inauspicious tithis (4, 6, 8, 9, 14)
    const inauspiciousTithis = [4, 6, 8, 9, 14];
    if (inauspiciousTithis.includes(tithi)) {
      return -1;
    }

    return 0; // Neutral
  }

  calculateAshtakavarga(planet, chart) {
    // This function calculates the Ashtakavarga (eight-fold strength) of a planet.
    // A full implementation involves calculating benefic points contributed by 7 planets + Lagna
    // to each of the 12 houses from their own positions.

    // For demonstration, we'll provide a more detailed approximation.

    let totalBindus = 0; // Total benefic points for the planet in its current sign
    const planetPos = chart.planets[planet.toLowerCase()];
    if (!planetPos) return { bindus: 0, total: 8, description: 'Planet position not found' };

    const planetHouse = this.calculateHouseFromLongitude(planetPos.longitude, chart.ascendant.longitude);

    // Ashtakavarga tables (benefic points contributed by each planet to houses from its own position)
    // These are standard tables from classical Vedic texts.
    const ashtakavargaTables = {
      'sun': {
        'sun': [1, 2, 4, 7, 8, 9, 10, 11],
        'moon': [3, 6, 10, 11],
        'mars': [1, 2, 4, 7, 8, 9, 10, 11],
        'mercury': [3, 5, 6, 9, 10, 11, 12],
        'jupiter': [5, 6, 9, 11],
        'venus': [6, 7, 12],
        'saturn': [1, 2, 4, 7, 8, 9, 10, 11],
        'lagna': [3, 4, 6, 10, 11, 12]
      },
      'moon': {
        'sun': [3, 6, 7, 8, 10, 11],
        'moon': [1, 3, 6, 7, 10, 11],
        'mars': [2, 3, 5, 6, 10, 11],
        'mercury': [1, 3, 4, 5, 7, 8, 10, 11],
        'jupiter': [1, 4, 7, 8, 10, 11, 12],
        'venus': [3, 4, 5, 7, 9, 10, 11],
        'saturn': [3, 5, 6, 11],
        'lagna': [3, 6, 7, 8, 10, 11]
      },
      'mars': {
        'sun': [3, 5, 6, 10, 11],
        'moon': [3, 6, 8, 10, 11],
        'mars': [1, 2, 4, 7, 8, 10, 11],
        'mercury': [3, 5, 6, 11],
        'jupiter': [6, 10, 11, 12],
        'venus': [6, 8, 11, 12],
        'saturn': [1, 4, 7, 8, 9, 10, 11],
        'lagna': [1, 3, 6, 10, 11]
      },
      'mercury': {
        'sun': [5, 6, 9, 11, 12],
        'moon': [2, 4, 6, 8, 10, 11],
        'mars': [1, 2, 4, 7, 8, 9, 10, 11],
        'mercury': [1, 3, 5, 6, 9, 10, 11, 12],
        'jupiter': [6, 8, 11, 12],
        'venus': [1, 2, 3, 4, 5, 8, 9, 11],
        'saturn': [1, 2, 4, 7, 8, 9, 10, 11],
        'lagna': [1, 2, 4, 6, 8, 10, 11]
      },
      'jupiter': {
        'sun': [1, 2, 3, 4, 7, 8, 9, 10, 11],
        'moon': [2, 5, 7, 9, 11],
        'mars': [1, 2, 4, 7, 8, 9, 10, 11],
        'mercury': [1, 2, 4, 5, 6, 9, 10, 11],
        'jupiter': [1, 2, 3, 4, 7, 8, 9, 10, 11],
        'venus': [2, 5, 6, 9, 10, 11],
        'saturn': [3, 5, 6, 12],
        'lagna': [1, 2, 4, 5, 6, 7, 9, 10, 11]
      },
      'venus': {
        'sun': [8, 11, 12],
        'moon': [1, 2, 3, 4, 5, 8, 9, 11, 12],
        'mars': [3, 4, 6, 9, 11, 12],
        'mercury': [3, 5, 6, 9, 11],
        'jupiter': [5, 8, 9, 10, 11],
        'venus': [1, 2, 3, 4, 5, 8, 9, 10, 11],
        'saturn': [3, 4, 5, 8, 9, 10, 11],
        'lagna': [1, 2, 3, 4, 5, 8, 9, 11]
      },
      'saturn': {
        'sun': [1, 2, 4, 7, 8, 9, 10, 11],
        'moon': [3, 5, 6, 11],
        'mars': [3, 5, 6, 10, 11, 12],
        'mercury': [6, 8, 9, 10, 11, 12],
        'jupiter': [5, 6, 11, 12],
        'venus': [6, 11, 12],
        'saturn': [3, 5, 6, 10, 11, 12],
        'lagna': [3, 5, 6, 10, 11, 12]
      }
    };

    const contributingPlanets = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'lagna'];
    let bindus = 0;

    for (const contributor of contributingPlanets) {
      let contributorPos;
      if (contributor === 'lagna') {
        contributorPos = { longitude: chart.ascendant.longitude };
      } else {
        contributorPos = chart.planets[contributor];
      }

      if (!contributorPos) continue;

      const contributorHouse = this.calculateHouseFromLongitude(contributorPos.longitude, chart.ascendant.longitude);
      const beneficHouses = ashtakavargaTables[planet.toLowerCase()]?.[contributor] || [];

      // Calculate the house position of the target planet relative to the contributor
      const relativeHouse = ((planetHouse - contributorHouse + 11) % 12) + 1;

      if (beneficHouses.includes(relativeHouse)) {
        bindus += 1;
      }
    }

    return {
      bindus: bindus,
      total: 8, // Max possible bindus
      description: `Ashtakavarga: ${bindus} benefic points for ${planet} in its current sign.`,
      grade: this.getAshtakavargaGrade(bindus)
    };
  }

  // Helper to get Ashtakavarga grade
  getAshtakavargaGrade(bindus) {
    if (bindus >= 6) return 'Excellent';
    if (bindus >= 4) return 'Good';
    return 'Weak';
  }

  checkGandanta(position) {
    // Gandanta degrees occur at water-fire sign junctions (0-3° Aries, Leo, Sagittarius; 27-30° Cancer, Scorpio, Pisces)
    const degree = position.longitude % 30;
    const sign = position.sign; // Assuming sign is available in position object

    const isWaterSign = ['Cancer', 'Scorpio', 'Pisces'].includes(sign);
    const isFireSign = ['Aries', 'Leo', 'Sagittarius'].includes(sign);

    // Check for Gandanta at the end of water signs
    if (isWaterSign && degree >= 27 && degree <= 30) {
      return true;
    }
    // Check for Gandanta at the beginning of fire signs
    if (isFireSign && degree >= 0 && degree <= 3) {
      return true;
    }

    return false;
  }

  checkSandhi(position) {
    // Check if planet is in Sandhi (junction between signs)
    const degree = position.longitude % 30;
    return degree > 29 || degree < 1; // Last or first degree
  }

  checkVargottama(planet, chart) {
    // Vargottama occurs when a planet occupies the same sign in both D1 (Rasi) and D9 (Navamsa) charts.
    // This requires a precise Navamsa calculation.
    const planetData = chart.planets[planet.toLowerCase()];
    if (!planetData) return false;

    const rasiSign = planetData.sign;
    const navamsaSign = this.getNavamsaSign(planetData.longitude);

    return rasiSign === navamsaSign;
  }

  // Helper to calculate Navamsa sign from longitude
  getNavamsaSign(longitude) {
    const signs = [
      'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];

    const signIndex = Math.floor(longitude / 30);
    const degreeInSign = longitude % 30;

    // Each Navamsa division is 3 degrees 20 minutes (3.333333 degrees)
    const navamsaDivision = 3.3333333333;
    const navamsaNumber = Math.floor(degreeInSign / navamsaDivision);

    // The Navamsa chart starts from different signs depending on the nature of the Rasi sign:
    // Movable signs (Aries, Cancer, Libra, Capricorn) start Navamsa from Aries.
    // Fixed signs (Taurus, Leo, Scorpio, Aquarius) start Navamsa from Leo.
    // Dual signs (Gemini, Virgo, Sagittarius, Pisces) start Navamsa from Sagittarius.

    let navamsaStartSignIndex;
    if ([0, 3, 6, 9].includes(signIndex)) { // Aries, Cancer, Libra, Capricorn (Movable)
      navamsaStartSignIndex = 0; // Aries
    } else if ([1, 4, 7, 10].includes(signIndex)) { // Taurus, Leo, Scorpio, Aquarius (Fixed)
      navamsaStartSignIndex = 4; // Leo
    } else if ([2, 5, 8, 11].includes(signIndex)) { // Gemini, Virgo, Sagittarius, Pisces (Dual)
      navamsaStartSignIndex = 8; // Sagittarius
    } else {
      return null; // Should not happen
    }

    const navamsaSignIndex = (navamsaStartSignIndex + navamsaNumber) % 12;
    return signs[navamsaSignIndex];
  }

  getFunctionalNature(planet, lagnaSign) {
    const functionalRules = this.functionalNature[lagnaSign];
    if (!functionalRules) return 'Unknown';

    const planetUpper = planet.toUpperCase();
    if (functionalRules.benefic.includes(planetUpper)) return 'Functional Benefic';
    if (functionalRules.malefic.includes(planetUpper)) return 'Functional Malefic';
    if (functionalRules.neutral.includes(planetUpper)) return 'Functional Neutral';
    return 'Unknown';
  }

  generatePlanetaryAssessment(planet, position, chart) {
    const dignity = this.analyzePlanetaryDignity(planet, position);
    const strength = this.calculatePlanetaryStrength(planet, position);

    if (dignity.dignityType === 'Exalted' && strength >= 8) return 'Excellent';
    if (dignity.dignityType === 'Own Sign' && strength >= 7) return 'Very Good';
    if (strength >= 6) return 'Good';
    if (strength >= 4) return 'Average';
    if (dignity.dignityType === 'Debilitated') return 'Challenging';
    return 'Moderate';
  }

  findStrongestPlanet(dignityAnalysis) {
    let strongest = null;
    let maxStrength = 0;

    for (const [planet, analysis] of Object.entries(dignityAnalysis)) {
      if (analysis.strength > maxStrength) {
        maxStrength = analysis.strength;
        strongest = planet;
      }
    }

    return { planet: strongest, strength: maxStrength };
  }

  findWeakestPlanet(dignityAnalysis) {
    let weakest = null;
    let minStrength = 11;

    for (const [planet, analysis] of Object.entries(dignityAnalysis)) {
      if (analysis.strength < minStrength) {
        minStrength = analysis.strength;
        weakest = planet;
      }
    }

    return { planet: weakest, strength: minStrength };
  }

  findDominantElement(dignityAnalysis) {
    const elements = { Fire: 0, Earth: 0, Air: 0, Water: 0 };

    for (const [planet, analysis] of Object.entries(dignityAnalysis)) {
      const signData = this.signCharacteristics[analysis.sign];
      if (signData) {
        elements[signData.element] += analysis.strength;
      }
    }

    return Object.entries(elements).reduce((a, b) => elements[a[0]] > elements[b[0]] ? a : b)[0];
  }

  findDominantQuality(dignityAnalysis) {
    const qualities = { Cardinal: 0, Fixed: 0, Mutable: 0 };

    for (const [planet, analysis] of Object.entries(dignityAnalysis)) {
      const signData = this.signCharacteristics[analysis.sign];
      if (signData) {
        qualities[signData.quality] += analysis.strength;
      }
    }

    return Object.entries(qualities).reduce((a, b) => qualities[a[0]] > qualities[b[0]] ? a : b)[0];
  }

  calculateOverallChartStrength(dignityAnalysis) {
    const totalStrength = Object.values(dignityAnalysis).reduce((sum, analysis) => sum + analysis.strength, 0);
    const planetCount = Object.keys(dignityAnalysis).length;
    return planetCount > 0 ? Math.round(totalStrength / planetCount) : 0;
  }

  generateDignityRecommendations(dignityAnalysis) {
    const recommendations = [];
    const strongestPlanet = this.findStrongestPlanet(dignityAnalysis);
    const weakestPlanet = this.findWeakestPlanet(dignityAnalysis);

    if (strongestPlanet.planet) {
      recommendations.push(`Leverage the strength of ${strongestPlanet.planet} for best results`);
    }

    if (weakestPlanet.planet && weakestPlanet.strength <= 3) {
      recommendations.push(`Focus on strengthening ${weakestPlanet.planet} through remedial measures`);
    }

    return recommendations;
  }
}

module.exports = LagnaAnalysisService;
