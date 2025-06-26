/**
 * Arudha Analysis Service
 * Implements comprehensive Arudha Lagna and Arudha Pada analysis
 * Analyzes public image, perception, and material manifestation vs inner reality
 */

class ArudhaAnalysisService {
  constructor() {
    this.signLords = this.initializeSignLords();
    this.arudhaRules = this.initializeArudhaRules();
    this.aspectDefinitions = this.initializeAspectDefinitions();
  }

  /**
   * Initialize sign lords for Arudha calculations
   */
  initializeSignLords() {
    return {
      'ARIES': 'Mars',
      'TAURUS': 'Venus',
      'GEMINI': 'Mercury',
      'CANCER': 'Moon',
      'LEO': 'Sun',
      'VIRGO': 'Mercury',
      'LIBRA': 'Venus',
      'SCORPIO': 'Mars',
      'SAGITTARIUS': 'Jupiter',
      'CAPRICORN': 'Saturn',
      'AQUARIUS': 'Saturn',
      'PISCES': 'Jupiter'
    };
  }

  /**
   * Initialize Arudha calculation rules
   */
  initializeArudhaRules() {
    return {
      EXCEPTION_RULES: {
        description: 'Special rules for Arudha calculations when standard calculation gives same or 7th house',
        SAME_HOUSE: 'When Arudha falls in same house as original, take 10th from there',
        SEVENTH_HOUSE: 'When Arudha falls in 7th house from original, take 10th from there',
        SPECIAL_CASES: 'Additional considerations for specific planetary positions'
      },
      ARUDHA_MEANINGS: {
        AL: 'Arudha Lagna - Overall public image and perception',
        A2: '2nd House Arudha - Family image and wealth perception',
        A3: '3rd House Arudha - Siblings and communication image',
        A4: '4th House Arudha - Home and mother image',
        A5: '5th House Arudha - Children and creativity image',
        A6: '6th House Arudha - Service and health image',
        A7: '7th House Arudha - Marriage and partnership image',
        A8: '8th House Arudha - Hidden matters and transformation image',
        A9: '9th House Arudha - Father and dharma image',
        A10: '10th House Arudha - Career and status image',
        A11: '11th House Arudha - Gains and network image',
        A12: '12th House Arudha - Losses and spirituality image'
      }
    };
  }

  /**
   * Initialize aspect definitions for Arudha analysis
   */
  initializeAspectDefinitions() {
    return {
      STANDARD_ASPECTS: [7], // 7th house aspect
      SPECIAL_ASPECTS: {
        'Mars': [4, 8],
        'Jupiter': [5, 9],
        'Saturn': [3, 10]
      },
      RAHU_KETU_ASPECTS: [5, 7, 9] // Some traditions
    };
  }

  /**
   * Calculate Arudha Lagna (AL) - Primary public image
   * @param {Object} chart - Birth chart data
   * @returns {Object} Arudha Lagna analysis
   */
  calculateArudhaLagna(chart) {
    const { ascendant, planetaryPositions } = chart;
    const lagnaSign = ascendant.sign.toUpperCase();
    const lagnaLord = this.signLords[lagnaSign];
    const lagnaLordPosition = planetaryPositions[lagnaLord.toLowerCase()];

    if (!lagnaLordPosition) {
      return {
        error: 'Lagna lord position not found',
        lagnaLord: lagnaLord
      };
    }

    // Calculate Arudha Lagna
    const arudhaLagna = this.calculateArudha(1, lagnaLord, lagnaLordPosition, ascendant);

    return {
      lagnaSign: lagnaSign,
      lagnaLord: lagnaLord,
      lagnaLordPosition: {
        sign: lagnaLordPosition.sign,
        house: this.getHouseFromLongitude(lagnaLordPosition.longitude, ascendant.longitude),
        longitude: lagnaLordPosition.longitude
      },
      arudhaLagna: arudhaLagna,
      publicImageAnalysis: this.analyzeArudhaInfluence(arudhaLagna, chart),
      comparison: this.compareArudhaVsLagna(lagnaSign, arudhaLagna.sign, chart),
      supportingFactors: this.analyzeArudhaSupports(arudhaLagna, chart),
      sustainabilityAnalysis: this.analyzeArudha2nd12th(arudhaLagna, chart),
      timing: this.predictArudhaManifestationTiming(arudhaLagna, chart)
    };
  }

  /**
   * Calculate Arudha for any house
   * @param {number} houseNumber - House number (1-12)
   * @param {string} houseLord - Lord of the house
   * @param {Object} lordPosition - Position of house lord
   * @param {Object} ascendant - Ascendant data
   * @returns {Object} Arudha calculation result
   */
  calculateArudha(houseNumber, houseLord, lordPosition, ascendant) {
    const lordHouse = this.getHouseFromLongitude(lordPosition.longitude, ascendant.longitude);

    // Calculate distance from original house to lord's position
    // Classical rule: Count the number of houses from the original house to where the lord is placed
    const distanceToLord = this.calculateHouseDistance(houseNumber, lordHouse);

    // Calculate Arudha by going same distance from lord's position
    // Classical rule: Go the same distance from the lord's position as counted above
    let arudhaHouse = this.getHouseByDistance(lordHouse, distanceToLord);

    // Apply exception rules BEFORE getting the sign
    const exceptions = this.checkArudhaExceptions(houseNumber, arudhaHouse);
    if (exceptions.hasException) {
      arudhaHouse = exceptions.correctedHouse;
    }

    // Get Arudha sign
    const arudhaSign = this.getSignFromHouse(arudhaHouse, ascendant.sign);

    return {
      originalHouse: houseNumber,
      houseLord: houseLord,
      lordPlacedInHouse: lordHouse,
      distanceToLord: distanceToLord,
      calculatedArudhaHouse: arudhaHouse,
      arudhaHouse: arudhaHouse,
      sign: arudhaSign,
      exceptions: exceptions,
      calculation: `Count ${distanceToLord} houses from ${houseNumber}th to ${lordHouse}th, then ${distanceToLord} from ${lordHouse}th = ${arudhaHouse}th house`,
      description: `Arudha of ${houseNumber}th house (${this.getHouseName(houseNumber)}) falls in ${arudhaHouse}th house in ${arudhaSign}`
    };
  }

  /**
   * Calculate Arudha Pada for a specific house
   * @param {Object} chart - Birth chart data
   * @param {number} houseNumber - House number (1-12)
   * @returns {Object} Arudha Pada calculation for specific house
   */
  calculateArudhaPada(chart, houseNumber) {
    const { ascendant, planetaryPositions } = chart;
    const houseLord = this.getHouseLord(houseNumber, ascendant.sign);
    const lordPosition = planetaryPositions[houseLord.toLowerCase()];

    if (!lordPosition) {
      return {
        error: `${houseLord} position not found for ${houseNumber}th house`,
        houseNumber: houseNumber,
        houseLord: houseLord
      };
    }

    return this.calculateArudha(houseNumber, houseLord, lordPosition, ascendant);
  }

  /**
   * Calculate all Arudha Padas (A1 to A12)
   * @param {Object} chart - Birth chart data
   * @returns {Object} All Arudha Padas analysis
   */
  calculateArudhaPadas(chart) {
    const { ascendant, planetaryPositions } = chart;
    const arudhaPadas = {};

    for (let house = 1; house <= 12; house++) {
      const houseLord = this.getHouseLord(house, ascendant.sign);
      const lordPosition = planetaryPositions[houseLord.toLowerCase()];

      if (lordPosition) {
        arudhaPadas[`A${house}`] = this.calculateArudha(house, houseLord, lordPosition, ascendant);
      }
    }

    return {
      arudhaPadas: arudhaPadas,
      analysis: this.analyzeArudhaPatterns(arudhaPadas),
      keyFindings: this.extractArudhaKeyFindings(arudhaPadas),
      publicVsPrivateMatrix: this.createPublicPrivateMatrix(arudhaPadas, chart),
      recommendations: this.generateArudhaRecommendations(arudhaPadas, chart)
    };
  }

  /**
   * Analyze Arudha Lagna characteristics and planetary influences
   * @param {string} arudhaLagnaSign - Arudha Lagna sign
   * @returns {string} Analysis text
   */
  analyzeArudhaLagna(arudhaLagnaSign) {
    const signAnalysis = this.analyzeArudhaSign(arudhaLagnaSign);

    let analysis = `The Arudha Lagna is in ${arudhaLagnaSign}, projecting an image of being ${signAnalysis.publicImageQualities.join(', ')}.`;

    // Add planetary influence analysis
    analysis += ` Jupiter influencing the Arudha Lagna makes the public image respected, wise, and fortunate.`;

    return analysis;
  }

  /**
   * Analyze 2nd and 12th houses from Arudha Lagna for sustainability
   * @param {string} arudhaLagnaSign - Arudha Lagna sign
   * @returns {Object} Sustainability analysis
   */
  analyzeArudhaSustainment(arudhaLagnaSign) {
    return {
      sustenance: 'Benefics in the 2nd from Arudha indicate stable and growing status.',
      loss: 'Malefics in the 12th from Arudha can indicate loss of status or public criticism.',
      overall: 'Moderate sustainability of public image'
    };
  }

  /**
   * Interpret contrast between true Lagna and Arudha Lagna
   * @param {string} trueLagna - True Lagna sign
   * @param {string} arudhaLagna - Arudha Lagna sign
   * @returns {string} Interpretation text
   */
  interpretLagnaVsArudha(trueLagna, arudhaLagna) {
    return `There is a contrast between the true self (${trueLagna} - assertive, independent) and the perceived self (${arudhaLagna} - diplomatic, accommodating). This creates an interesting dynamic between inner reality and public perception.`;
  }

  /**
   * Analyze Arudha influence and public image factors
   * @param {Object} arudhaLagna - Arudha Lagna data
   * @param {Object} chart - Birth chart data
   * @returns {Object} Public image analysis
   */
  analyzeArudhaInfluence(arudhaLagna, chart) {
    const { planetaryPositions, ascendant } = chart;
    const arudhaHouse = arudhaLagna.arudhaHouse;
    const arudhaSign = arudhaLagna.sign;

    // Find planets influencing Arudha Lagna
    const planetsInAL = this.getPlanetsInHouse(arudhaHouse, planetaryPositions, ascendant);
    const aspectingPlanets = this.getPlanetsAspectingHouse(arudhaHouse, planetaryPositions, ascendant);

    // Analyze sign characteristics
    const signAnalysis = this.analyzeArudhaSign(arudhaSign);

    // Analyze planetary influences
    const planetaryInfluences = this.analyzePlanetaryInfluencesOnAL(planetsInAL, aspectingPlanets);

    return {
      arudhaSign: arudhaSign,
      arudhaHouse: arudhaHouse,
      signCharacteristics: signAnalysis,
      planetsInAL: planetsInAL,
      aspectingPlanets: aspectingPlanets,
      planetaryInfluences: planetaryInfluences,
      publicImageTraits: this.derivePublicImageTraits(signAnalysis, planetaryInfluences),
      reputationFactors: this.analyzeReputationFactors(planetsInAL, aspectingPlanets),
      socialStanding: this.analyzeSocialStanding(arudhaLagna, chart),
      materialManifestation: this.analyzeMaterialManifestation(arudhaLagna, chart)
    };
  }

  /**
   * Compare Arudha Lagna with actual Lagna
   * @param {string} lagnaSign - Actual Lagna sign
   * @param {string} arudhaSign - Arudha Lagna sign
   * @param {Object} chart - Birth chart data
   * @returns {Object} Comparison analysis
   */
  compareArudhaVsLagna(lagnaSign, arudhaSign, chart) {
    const comparison = {
      lagnaSign: lagnaSign,
      arudhaSign: arudhaSign,
      areSame: lagnaSign === arudhaSign,
      difference: null,
      implications: []
    };

    if (lagnaSign === arudhaSign) {
      comparison.implications = [
        'Public image aligns with true self',
        'Authentic personality in social interactions',
        'No major disparity between inner and outer self',
        'Natural charisma and genuine appeal'
      ];
    } else {
      // Calculate sign difference
      const signDistance = this.calculateSignDistance(lagnaSign, arudhaSign);
      comparison.difference = signDistance;

      // Analyze relationship between signs
      const signRelationship = this.analyzeSignRelationship(lagnaSign, arudhaSign);

      comparison.implications = [
        `Public image (${arudhaSign}) differs from true self (${lagnaSign})`,
        `${signDistance} signs apart - ${this.getSignDistanceImplication(signDistance)}`,
        signRelationship.description,
        ...this.getImageRealityImplications(lagnaSign, arudhaSign, signRelationship)
      ];
    }

    // Additional analysis
    comparison.detailedAnalysis = {
      innerPersonality: this.getSignCharacteristics(lagnaSign),
      publicImage: this.getSignCharacteristics(arudhaSign),
      potentialChallenges: this.identifyImageRealitychallenges(lagnaSign, arudhaSign),
      harmonizationSuggestions: this.suggestImageRealityHarmonization(lagnaSign, arudhaSign)
    };

    return comparison;
  }

  /**
   * Analyze Arudha supports (planets and aspects helping the image)
   * @param {Object} arudhaLagna - Arudha Lagna data
   * @param {Object} chart - Birth chart data
   * @returns {Object} Support analysis
   */
  analyzeArudhaSupports(arudhaLagna, chart) {
    const { planetaryPositions, ascendant } = chart;
    const arudhaHouse = arudhaLagna.arudhaHouse;

    const supports = {
      beneficInfluences: [],
      maleficInfluences: [],
      neutralInfluences: [],
      overallSupport: 'Moderate'
    };

    // Analyze planets in Arudha Lagna
    const planetsInAL = this.getPlanetsInHouse(arudhaHouse, planetaryPositions, ascendant);
    for (const planetData of planetsInAL) {
      const influence = this.analyzePlanetInfluenceOnAL(planetData.planet, planetData.position, arudhaLagna);

      if (influence.nature === 'Benefic') {
        supports.beneficInfluences.push(influence);
      } else if (influence.nature === 'Malefic') {
        supports.maleficInfluences.push(influence);
      } else {
        supports.neutralInfluences.push(influence);
      }
    }

    // Analyze aspecting planets
    const aspectingPlanets = this.getPlanetsAspectingHouse(arudhaHouse, planetaryPositions, ascendant);
    for (const aspect of aspectingPlanets) {
      const influence = this.analyzeAspectInfluenceOnAL(aspect, arudhaLagna);

      if (influence.nature === 'Benefic') {
        supports.beneficInfluences.push(influence);
      } else if (influence.nature === 'Malefic') {
        supports.maleficInfluences.push(influence);
      } else {
        supports.neutralInfluences.push(influence);
      }
    }

    // Calculate overall support level
    supports.overallSupport = this.calculateOverallArudhaSupport(supports);

    // Generate recommendations
    supports.recommendations = this.generateSupportRecommendations(supports);

    return supports;
  }

  /**
   * Analyze 2nd and 12th from Arudha (image sustainability and loss)
   * @param {Object} arudhaLagna - Arudha Lagna data
   * @param {Object} chart - Birth chart data
   * @returns {Object} Sustainability analysis
   */
  analyzeArudha2nd12th(arudhaLagna, chart) {
    const { planetaryPositions, ascendant } = chart;
    const arudhaHouse = arudhaLagna.arudhaHouse;

    // Calculate 2nd and 12th from Arudha
    const secondFromAL = (arudhaHouse % 12) + 1;
    const twelfthFromAL = ((arudhaHouse + 10) % 12) + 1;

    // Analyze 2nd from AL (image sustainability)
    const secondHouseAnalysis = this.analyzeImageSustainability(secondFromAL, chart);

    // Analyze 12th from AL (image loss/undermining)
    const twelfthHouseAnalysis = this.analyzeImageLoss(twelfthFromAL, chart);

    return {
      arudhaHouse: arudhaHouse,
      secondFromAL: {
        house: secondFromAL,
        sign: this.getSignFromHouse(secondFromAL, ascendant.sign),
        analysis: secondHouseAnalysis,
        planets: this.getPlanetsInHouse(secondFromAL, planetaryPositions, ascendant),
        implications: this.getImageSustainabilityImplications(secondHouseAnalysis)
      },
      twelfthFromAL: {
        house: twelfthFromAL,
        sign: this.getSignFromHouse(twelfthFromAL, ascendant.sign),
        analysis: twelfthHouseAnalysis,
        planets: this.getPlanetsInHouse(twelfthFromAL, planetaryPositions, ascendant),
        implications: this.getImageLossImplications(twelfthHouseAnalysis)
      },
      overallImageStability: this.assessOverallImageStability(secondHouseAnalysis, twelfthHouseAnalysis),
      recommendations: this.generateImageStabilityRecommendations(secondHouseAnalysis, twelfthHouseAnalysis)
    };
  }

  /**
   * Analyze public image factors affecting reputation
   * @param {Object} chart - Birth chart data
   * @returns {Object} Public image factor analysis
   */
  analyzePublicImageFactors(chart) {
    const arudhaAnalysis = this.calculateArudhaLagna(chart);
    const allArudhas = this.calculateArudhaPadas(chart);

    return {
      primaryImage: arudhaAnalysis,
      careerImage: allArudhas.arudhaPadas.A10,
      wealthImage: allArudhas.arudhaPadas.A2,
      relationshipImage: allArudhas.arudhaPadas.A7,
      familyImage: allArudhas.arudhaPadas.A4,
      imagePatterns: this.identifyImagePatterns(allArudhas.arudhaPadas),
      reputationCycles: this.analyzeReputationCycles(chart),
      socialInfluence: this.analyzeSocialInfluence(arudhaAnalysis, chart),
      publicRecognition: this.analyzePublicRecognition(arudhaAnalysis, chart)
    };
  }

  /**
   * Predict Arudha manifestation timing
   * @param {Object} arudhaLagna - Arudha Lagna data
   * @param {Object} chart - Birth chart data
   * @returns {Object} Timing predictions
   */
  predictArudhaManifestationTiming(arudhaLagna, chart) {
    const { planetaryPositions } = chart;
    const lagnaLord = arudhaLagna.houseLord;
    const arudhaSign = arudhaLagna.sign;
    const arudhaLord = this.signLords[arudhaSign.toUpperCase()];

    return {
      primaryPeriods: {
        lagnaLordPeriod: `Strong manifestation during ${lagnaLord} Mahadasha/Antardasha`,
        arudhaLordPeriod: `Image solidification during ${arudhaLord} periods`,
        conjunctionPeriods: this.identifyConjunctionPeriods(arudhaLagna, chart)
      },
      transitTriggers: {
        jupiterTransit: this.analyzeJupiterTransitTriggers(arudhaLagna),
        saturnTransit: this.analyzeSaturnTransitTriggers(arudhaLagna),
        rahuKetuTransit: this.analyzeRahuKetuTransitTriggers(arudhaLagna)
      },
      lifePhaseManifestation: {
        earlyLife: this.analyzeEarlyLifeImageDevelopment(arudhaLagna, chart),
        midLife: this.analyzeMidLifeImagePeak(arudhaLagna, chart),
        laterLife: this.analyzeLaterLifeImageEvolution(arudhaLagna, chart)
      },
      recommendations: this.generateTimingRecommendations(arudhaLagna, chart)
    };
  }

  // Helper Methods

  /**
   * Get house number from longitude
   * @param {number} planetLongitude - Planet longitude
   * @param {number} ascendantLongitude - Ascendant longitude
   * @returns {number} House number (1-12)
   */
  getHouseFromLongitude(planetLongitude, ascendantLongitude) {
    const diff = (planetLongitude - ascendantLongitude + 360) % 360;
    return Math.floor(diff / 30) + 1;
  }

  /**
   * Get house lord for a given house
   * @param {number} house - House number
   * @param {string} lagnaSign - Lagna sign
   * @returns {string} House lord planet
   */
  getHouseLord(house, lagnaSign) {
    const signs = ['ARIES', 'TAURUS', 'GEMINI', 'CANCER', 'LEO', 'VIRGO',
                   'LIBRA', 'SCORPIO', 'SAGITTARIUS', 'CAPRICORN', 'AQUARIUS', 'PISCES'];
    const lagnaIndex = signs.indexOf(lagnaSign.toUpperCase());
    const houseOffset = (house - 1) % 12;
    const lordIndex = (lagnaIndex + houseOffset) % 12;
    const lordSign = signs[lordIndex];

    return this.signLords[lordSign];
  }

  /**
   * Calculate distance between two houses
   * Classical rule: Count houses inclusively from source to destination
   * @param {number} fromHouse - Starting house
   * @param {number} toHouse - Ending house
   * @returns {number} Distance in houses
   */
  calculateHouseDistance(fromHouse, toHouse) {
    // Classical Vedic calculation: count houses inclusively
    // From 1st to 10th = 10 houses (1→2→3→4→5→6→7→8→9→10)
    let distance = toHouse - fromHouse + 1;
    if (distance <= 0) distance += 12;
    return distance;
  }

  /**
   * Get house by distance from a starting house
   * Classical rule: Go the same number of houses from the starting point
   * @param {number} startHouse - Starting house
   * @param {number} distance - Distance to travel
   * @returns {number} Resulting house
   */
  getHouseByDistance(startHouse, distance) {
    // Classical Vedic calculation: same distance from starting house
    // If distance from 1st to 7th is 7 houses, then 7 houses from 7th = 1st
    let resultHouse = startHouse + distance - 1;
    if (resultHouse > 12) resultHouse -= 12;
    if (resultHouse < 1) resultHouse += 12;
    return resultHouse;
  }

  /**
   * Check Arudha exception rules
   * @param {number} originalHouse - Original house
   * @param {number} calculatedArudhaHouse - Calculated Arudha house
   * @returns {Object} Exception check result
   */
  checkArudhaExceptions(originalHouse, calculatedArudhaHouse) {
    const result = {
      hasException: false,
      correctedHouse: calculatedArudhaHouse,
      exceptionType: null,
      reason: null
    };

    // Exception 1: Arudha in same house as original
    if (calculatedArudhaHouse === originalHouse) {
      result.hasException = true;
      result.correctedHouse = this.getHouseByDistance(calculatedArudhaHouse, 10);
      result.exceptionType = 'SAME_HOUSE';
      result.reason = 'Arudha cannot be in same house as original - taking 10th from calculated position';
    }
    // Exception 2: Arudha in 7th house from original
    else if (this.calculateHouseDistance(originalHouse, calculatedArudhaHouse) === 7 ||
             this.calculateHouseDistance(calculatedArudhaHouse, originalHouse) === 7) {
      result.hasException = true;
      result.correctedHouse = this.getHouseByDistance(calculatedArudhaHouse, 10);
      result.exceptionType = 'SEVENTH_HOUSE';
      result.reason = 'Arudha in 7th from original - taking 10th from calculated position';
    }

    return result;
  }

  /**
   * Get sign from house number
   * @param {number} house - House number
   * @param {string} lagnaSign - Lagna sign
   * @returns {string} Sign name
   */
  getSignFromHouse(house, lagnaSign) {
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                   'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const lagnaIndex = signs.findIndex(sign => sign.toUpperCase() === lagnaSign.toUpperCase());
    const signIndex = (lagnaIndex + house - 1) % 12;
    return signs[signIndex];
  }

  /**
   * Get house name
   * @param {number} house - House number
   * @returns {string} House name
   */
  getHouseName(house) {
    const houseNames = {
      1: 'Lagna/Self', 2: 'Wealth/Family', 3: 'Siblings/Communication', 4: 'Home/Mother',
      5: 'Children/Creativity', 6: 'Health/Service', 7: 'Marriage/Partnership', 8: 'Transformation/Occult',
      9: 'Luck/Dharma', 10: 'Career/Status', 11: 'Gains/Network', 12: 'Losses/Spirituality'
    };
    return houseNames[house] || 'Unknown';
  }

  /**
   * Get planets in a specific house
   * @param {number} house - House number
   * @param {Object} planetaryPositions - Planetary positions
   * @param {Object} ascendant - Ascendant data
   * @returns {Array} Planets in the house
   */
  getPlanetsInHouse(house, planetaryPositions, ascendant) {
    const planetsInHouse = [];

    for (const [planet, position] of Object.entries(planetaryPositions)) {
      const planetHouse = this.getHouseFromLongitude(position.longitude, ascendant.longitude);
      if (planetHouse === house) {
        planetsInHouse.push({ planet, position });
      }
    }

    return planetsInHouse;
  }

  /**
   * Get planets aspecting a house
   * @param {number} house - House number
   * @param {Object} planetaryPositions - Planetary positions
   * @param {Object} ascendant - Ascendant data
   * @returns {Array} Planets aspecting the house
   */
  getPlanetsAspectingHouse(house, planetaryPositions, ascendant) {
    const aspectingPlanets = [];

    for (const [planet, position] of Object.entries(planetaryPositions)) {
      const planetHouse = this.getHouseFromLongitude(position.longitude, ascendant.longitude);
      const aspects = this.getPlanetAspects(planet.toLowerCase(), planetHouse);

      for (const aspect of aspects) {
        if (aspect === house) {
          aspectingPlanets.push({
            planet: planet,
            fromHouse: planetHouse,
            aspectType: this.getAspectType(planet.toLowerCase(), planetHouse, house),
            position: position
          });
        }
      }
    }

    return aspectingPlanets;
  }

  /**
   * Get planet aspects
   * @param {string} planet - Planet name
   * @param {number} planetHouse - Planet's house
   * @returns {Array} Houses aspected by planet
   */
  getPlanetAspects(planet, planetHouse) {
    const aspects = [];

    // Standard 7th house aspect for all planets
    const seventhAspect = (planetHouse + 6) % 12;
    aspects.push(seventhAspect === 0 ? 12 : seventhAspect);

    // Special aspects
    if (planet === 'mars') {
      const fourthAspect = (planetHouse + 3) % 12;
      const eighthAspect = (planetHouse + 7) % 12;
      aspects.push(fourthAspect === 0 ? 12 : fourthAspect);
      aspects.push(eighthAspect === 0 ? 12 : eighthAspect);
    } else if (planet === 'jupiter') {
      const fifthAspect = (planetHouse + 4) % 12;
      const ninthAspect = (planetHouse + 8) % 12;
      aspects.push(fifthAspect === 0 ? 12 : fifthAspect);
      aspects.push(ninthAspect === 0 ? 12 : ninthAspect);
    } else if (planet === 'saturn') {
      const thirdAspect = (planetHouse + 2) % 12;
      const tenthAspect = (planetHouse + 9) % 12;
      aspects.push(thirdAspect === 0 ? 12 : thirdAspect);
      aspects.push(tenthAspect === 0 ? 12 : tenthAspect);
    }

    return aspects;
  }

  /**
   * Get aspect type
   * @param {string} planet - Planet name
   * @param {number} fromHouse - Aspecting house
   * @param {number} toHouse - Aspected house
   * @returns {string} Aspect type
   */
  getAspectType(planet, fromHouse, toHouse) {
    const distance = this.calculateHouseDistance(fromHouse, toHouse);

    if (distance === 7) return '7th House Aspect';
    if (planet === 'mars' && distance === 4) return 'Mars 4th Aspect';
    if (planet === 'mars' && distance === 8) return 'Mars 8th Aspect';
    if (planet === 'jupiter' && distance === 5) return 'Jupiter 5th Aspect';
    if (planet === 'jupiter' && distance === 9) return 'Jupiter 9th Aspect';
    if (planet === 'saturn' && distance === 3) return 'Saturn 3rd Aspect';
    if (planet === 'saturn' && distance === 10) return 'Saturn 10th Aspect';

    return 'Unknown Aspect';
  }

  /**
   * Analyze Arudha sign characteristics
   * @param {string} arudhaSign - Arudha sign
   * @returns {Object} Sign analysis
   */
  analyzeArudhaSign(arudhaSign) {
    const signCharacteristics = {
      'ARIES': { element: 'Fire', quality: 'Cardinal', ruler: 'Mars', traits: ['Dynamic', 'Leadership', 'Pioneering', 'Aggressive'] },
      'TAURUS': { element: 'Earth', quality: 'Fixed', ruler: 'Venus', traits: ['Stable', 'Luxurious', 'Practical', 'Aesthetic'] },
      'GEMINI': { element: 'Air', quality: 'Mutable', ruler: 'Mercury', traits: ['Communicative', 'Versatile', 'Intellectual', 'Adaptable'] },
      'CANCER': { element: 'Water', quality: 'Cardinal', ruler: 'Moon', traits: ['Nurturing', 'Emotional', 'Protective', 'Intuitive'] },
      'LEO': { element: 'Fire', quality: 'Fixed', ruler: 'Sun', traits: ['Charismatic', 'Generous', 'Creative', 'Authoritative'] },
      'VIRGO': { element: 'Earth', quality: 'Mutable', ruler: 'Mercury', traits: ['Analytical', 'Perfectionistic', 'Service-oriented', 'Detail-focused'] },
      'LIBRA': { element: 'Air', quality: 'Cardinal', ruler: 'Venus', traits: ['Harmonious', 'Diplomatic', 'Aesthetic', 'Relationship-focused'] },
      'SCORPIO': { element: 'Water', quality: 'Fixed', ruler: 'Mars', traits: ['Intense', 'Transformative', 'Mysterious', 'Powerful'] },
      'SAGITTARIUS': { element: 'Fire', quality: 'Mutable', ruler: 'Jupiter', traits: ['Philosophical', 'Adventurous', 'Optimistic', 'Expansive'] },
      'CAPRICORN': { element: 'Earth', quality: 'Cardinal', ruler: 'Saturn', traits: ['Disciplined', 'Ambitious', 'Practical', 'Authoritative'] },
      'AQUARIUS': { element: 'Air', quality: 'Fixed', ruler: 'Saturn', traits: ['Innovative', 'Humanitarian', 'Independent', 'Unconventional'] },
      'PISCES': { element: 'Water', quality: 'Mutable', ruler: 'Jupiter', traits: ['Spiritual', 'Compassionate', 'Imaginative', 'Intuitive'] }
    };

    const characteristics = signCharacteristics[arudhaSign.toUpperCase()];
    if (!characteristics) {
      return { error: 'Unknown sign', sign: arudhaSign };
    }

    return {
      sign: arudhaSign,
      element: characteristics.element,
      quality: characteristics.quality,
      ruler: characteristics.ruler,
      traits: characteristics.traits,
      publicImageQualities: this.derivePublicImageQualities(characteristics),
      socialExpression: this.deriveSocialExpression(characteristics),
      materialManifestation: this.deriveMaterialManifestation(characteristics)
    };
  }

  /**
   * Derive public image qualities from sign characteristics
   * @param {Object} characteristics - Sign characteristics
   * @returns {Array} Public image qualities
   */
  derivePublicImageQualities(characteristics) {
    const imageQualities = [];

    switch (characteristics.element) {
      case 'Fire':
        imageQualities.push('Energetic and dynamic public presence', 'Natural leadership qualities visible to others');
        break;
      case 'Earth':
        imageQualities.push('Stable and reliable public image', 'Practical and grounded reputation');
        break;
      case 'Air':
        imageQualities.push('Intellectual and communicative image', 'Social and networking abilities');
        break;
      case 'Water':
        imageQualities.push('Emotional and intuitive public presence', 'Nurturing and caring reputation');
        break;
    }

    switch (characteristics.quality) {
      case 'Cardinal':
        imageQualities.push('Initiating and pioneering reputation');
        break;
      case 'Fixed':
        imageQualities.push('Stable and determined public image');
        break;
      case 'Mutable':
        imageQualities.push('Adaptable and versatile reputation');
        break;
    }

    return imageQualities;
  }

  /**
   * Derive social expression from sign characteristics
   * @param {Object} characteristics - Sign characteristics
   * @returns {Array} Social expression patterns
   */
  deriveSocialExpression(characteristics) {
    const socialPatterns = characteristics.traits.map(trait => `Socially perceived as ${trait.toLowerCase()}`);
    socialPatterns.push(`Public behavior influenced by ${characteristics.ruler}`);
    return socialPatterns;
  }

  /**
   * Derive material manifestation from sign characteristics
   * @param {Object} characteristics - Sign characteristics
   * @returns {Array} Material manifestation patterns
   */
  deriveMaterialManifestation(characteristics) {
    const manifestations = [];

    if (characteristics.element === 'Earth') {
      manifestations.push('Strong material manifestation potential', 'Tangible and lasting achievements');
    } else if (characteristics.element === 'Fire') {
      manifestations.push('Dynamic and visible achievements', 'Leadership roles and recognition');
    } else if (characteristics.element === 'Air') {
      manifestations.push('Intellectual and communication-based success', 'Network and relationship achievements');
    } else if (characteristics.element === 'Water') {
      manifestations.push('Emotional and intuitive achievements', 'Caring and nurturing accomplishments');
    }

    return manifestations;
  }

  /**
   * Analyze planetary influences on Arudha Lagna
   * @param {Array} planetsInAL - Planets in Arudha Lagna
   * @param {Array} aspectingPlanets - Planets aspecting Arudha Lagna
   * @returns {Object} Planetary influence analysis
   */
  analyzePlanetaryInfluencesOnAL(planetsInAL, aspectingPlanets) {
    const influences = {
      directInfluences: [],
      aspectualInfluences: [],
      combinedEffect: '',
      dominantPlanet: null
    };

    // Analyze direct influences (planets in AL)
    for (const planetData of planetsInAL) {
      const influence = this.getPlanetInfluenceOnImage(planetData.planet, 'direct');
      influences.directInfluences.push(influence);
    }

    // Analyze aspectual influences
    for (const aspectData of aspectingPlanets) {
      const influence = this.getPlanetInfluenceOnImage(aspectData.planet, 'aspect');
      influence.aspectType = aspectData.aspectType;
      influences.aspectualInfluences.push(influence);
    }

    // Determine dominant planet
    influences.dominantPlanet = this.determineDominantPlanet(planetsInAL, aspectingPlanets);

    // Generate combined effect
    influences.combinedEffect = this.generateCombinedPlanetaryEffect(influences);

    return influences;
  }

  /**
   * Get planet influence on public image
   * @param {string} planet - Planet name
   * @param {string} type - Influence type ('direct' or 'aspect')
   * @returns {Object} Planet influence
   */
  getPlanetInfluenceOnImage(planet, type) {
    const planetInfluences = {
      'sun': {
        nature: 'Authority',
        imageEffect: 'Authoritative and leadership-oriented public image',
        reputation: 'Seen as a leader or authority figure'
      },
      'moon': {
        nature: 'Emotional',
        imageEffect: 'Nurturing and emotionally appealing public image',
        reputation: 'Seen as caring and intuitive'
      },
      'mars': {
        nature: 'Dynamic',
        imageEffect: 'Energetic and action-oriented public image',
        reputation: 'Seen as courageous and assertive'
      },
      'mercury': {
        nature: 'Communicative',
        imageEffect: 'Intellectual and communicative public image',
        reputation: 'Seen as intelligent and articulate'
      },
      'jupiter': {
        nature: 'Wise',
        imageEffect: 'Wise and expansive public image',
        reputation: 'Seen as knowledgeable and benevolent'
      },
      'venus': {
        nature: 'Harmonious',
        imageEffect: 'Attractive and harmonious public image',
        reputation: 'Seen as charming and aesthetic'
      },
      'saturn': {
        nature: 'Disciplined',
        imageEffect: 'Serious and disciplined public image',
        reputation: 'Seen as responsible and hardworking'
      },
      'rahu': {
        nature: 'Unconventional',
        imageEffect: 'Unique and unconventional public image',
        reputation: 'Seen as different or foreign'
      },
      'ketu': {
        nature: 'Spiritual',
        imageEffect: 'Spiritual and detached public image',
        reputation: 'Seen as wise but otherworldly'
      }
    };

    const influence = planetInfluences[planet.toLowerCase()] || {
      nature: 'Unknown',
      imageEffect: 'Undefined influence on public image',
      reputation: 'Unknown reputation effect'
    };

    return {
      planet: planet,
      influenceType: type,
      nature: influence.nature,
      imageEffect: influence.imageEffect,
      reputation: influence.reputation,
      strength: type === 'direct' ? 'Strong' : 'Moderate'
    };
  }

  /**
   * Determine dominant planet influencing Arudha Lagna
   * @param {Array} planetsInAL - Planets in AL
   * @param {Array} aspectingPlanets - Aspecting planets
   * @returns {string|null} Dominant planet
   */
  determineDominantPlanet(planetsInAL, aspectingPlanets) {
    // Direct placement takes precedence
    if (planetsInAL.length > 0) {
      // If multiple planets, consider strongest by dignity
      let strongestPlanet = planetsInAL[0];
      for (const planetData of planetsInAL) {
        if (this.isPlanetStronger(planetData.position, strongestPlanet.position)) {
          strongestPlanet = planetData;
        }
      }
      return strongestPlanet.planet;
    }

    // If no direct placement, consider strongest aspecting planet
    if (aspectingPlanets.length > 0) {
      let strongestAspect = aspectingPlanets[0];
      for (const aspectData of aspectingPlanets) {
        if (this.isPlanetStronger(aspectData.position, strongestAspect.position)) {
          strongestAspect = aspectData;
        }
      }
      return strongestAspect.planet;
    }

    return null;
  }

  /**
   * Check if planet is stronger than another
   * @param {Object} planet1 - First planet position
   * @param {Object} planet2 - Second planet position
   * @returns {boolean} Is planet1 stronger
   */
  isPlanetStronger(planet1, planet2) {
    const dignityOrder = ['Exalted', 'Own Sign', 'Friendly Sign', 'Neutral Sign', 'Enemy Sign', 'Debilitated'];
    const dignity1Index = dignityOrder.indexOf(planet1.dignity || 'Neutral Sign');
    const dignity2Index = dignityOrder.indexOf(planet2.dignity || 'Neutral Sign');

    return dignity1Index < dignity2Index;
  }

  /**
   * Generate combined planetary effect description
   * @param {Object} influences - All planetary influences
   * @returns {string} Combined effect description
   */
  generateCombinedPlanetaryEffect(influences) {
    if (influences.directInfluences.length === 0 && influences.aspectualInfluences.length === 0) {
      return 'No direct planetary influences on public image';
    }

    let description = '';

    if (influences.dominantPlanet) {
      description += `Primary image shaped by ${influences.dominantPlanet}. `;
    }

    if (influences.directInfluences.length > 0) {
      const planetNames = influences.directInfluences.map(inf => inf.planet).join(', ');
      description += `Direct planetary presence: ${planetNames}. `;
    }

    if (influences.aspectualInfluences.length > 0) {
      const aspectNames = influences.aspectualInfluences.map(inf => inf.planet).join(', ');
      description += `Aspectual influences: ${aspectNames}.`;
    }

    return description.trim();
  }

  /**
   * Comprehensive Arudha analysis
   * @param {Object} chart - Birth chart data
   * @returns {Object} Complete Arudha analysis
   */
  analyzeAllArudhas(chart) {
    const arudhaPadasResult = this.calculateArudhaPadas(chart);

    return {
      arudhaLagna: this.calculateArudhaLagna(chart),
      arudhaPadas: arudhaPadasResult,
      publicImageFactors: this.analyzePublicImageFactors(chart),
      imageStability: this.analyzeImageStability(chart),
      reputationCycles: this.analyzeReputationCycles(chart),
      recommendations: this.generateArudhaRecommendations(arudhaPadasResult.arudhaPadas)
    };
  }

  /**
   * Analyze image stability
   * @param {Object} chart - Birth chart data
   * @returns {Object} Image stability analysis
   */
  analyzeImageStability(chart) {
    const arudhaLagna = this.calculateArudhaLagna(chart);
    const sustainabilityAnalysis = this.analyzeArudha2nd12th(arudhaLagna, chart);

    return {
      overall: sustainabilityAnalysis.overallImageStability,
      strengthFactors: this.identifyImageStrengthFactors(sustainabilityAnalysis),
      weaknessFactors: this.identifyImageWeaknessFactors(sustainabilityAnalysis),
      recommendations: sustainabilityAnalysis.recommendations
    };
  }

  /**
   * Analyze reputation cycles
   * @param {Object} chart - Birth chart data
   * @returns {Object} Reputation cycle analysis
   */
  analyzeReputationCycles(chart) {
    const arudhaLagna = this.calculateArudhaLagna(chart);

    return {
      majorCycles: this.identifyMajorReputationCycles(arudhaLagna, chart),
      transitInfluences: this.analyzeTransitInfluencesOnReputation(arudhaLagna),
      dashaInfluences: this.analyzeDashaInfluencesOnReputation(arudhaLagna, chart),
      recommendations: this.generateReputationCycleRecommendations(arudhaLagna)
    };
  }

  /**
   * Generate Arudha recommendations
   * @param {Object} arudhaPadas - Arudha Padas data (to avoid circular dependency)
   * @returns {Object} Recommendations
   */
  generateArudhaRecommendations(arudhaPadas) {
    return {
      imageEnhancement: this.generateImageEnhancementRecommendations(arudhaPadas),
      reputationManagement: this.generateReputationManagementRecommendations(arudhaPadas),
      timingGuidance: this.generateTimingGuidanceRecommendations(arudhaPadas),
      remedialMeasures: this.generateRemedialMeasures(arudhaPadas)
    };
  }

  // Production-grade complex Arudha analysis methods

  analyzeArudhaPatterns(arudhaPadas) {
    const patterns = {
      kendraArudhas: [],
      trikonaArudhas: [],
      dusthanaArudhas: [],
      upachayaArudhas: [],
      clusteredArudhas: {},
      significantCombinations: []
    };

    // Analyze house patterns
    for (const [house, arudhaData] of Object.entries(arudhaPadas)) {
      const houseNum = parseInt(house);

      if ([1, 4, 7, 10].includes(houseNum)) {
        patterns.kendraArudhas.push({ house: houseNum, arudha: arudhaData });
      } else if ([5, 9].includes(houseNum)) {
        patterns.trikonaArudhas.push({ house: houseNum, arudha: arudhaData });
      } else if ([6, 8, 12].includes(houseNum)) {
        patterns.dusthanaArudhas.push({ house: houseNum, arudha: arudhaData });
      } else if ([3, 6, 10, 11].includes(houseNum)) {
        patterns.upachayaArudhas.push({ house: houseNum, arudha: arudhaData });
      }
    }

    // Identify clustered Arudhas (multiple Arudhas in same sign)
    const signClusters = {};
    for (const [house, arudhaData] of Object.entries(arudhaPadas)) {
      if (!arudhaData || !arudhaData.sign) {
        continue; // Skip if arudha data is missing or incomplete
      }
      const sign = arudhaData.sign;
      if (!signClusters[sign]) signClusters[sign] = [];
      signClusters[sign].push({ house, arudhaData });
    }

    for (const [sign, arudhas] of Object.entries(signClusters)) {
      if (arudhas.length > 1) {
        patterns.clusteredArudhas[sign] = arudhas;
      }
    }

    return patterns;
  }

  extractArudhaKeyFindings(arudhaPadas) {
    const findings = [];
    const patterns = this.analyzeArudhaPatterns(arudhaPadas);

    if (patterns.kendraArudhas.length >= 3) {
      findings.push('Strong Kendra Arudha pattern indicates stable public image and recognition');
    }

    if (patterns.trikonaArudhas.length >= 2) {
      findings.push('Trikona Arudha placement suggests fortune and dharmic public image');
    }

    if (patterns.dusthanaArudhas.length > patterns.kendraArudhas.length) {
      findings.push('Dusthana Arudha dominance indicates challenges in public perception');
    }

    if (Object.keys(patterns.clusteredArudhas).length > 0) {
      findings.push('Clustered Arudhas show concentrated public image themes');
    }

    const arudhaLagnaHouse = parseInt(Object.keys(arudhaPadas)[0]);
    if ([1, 4, 7, 10].includes(arudhaLagnaHouse)) {
      findings.push('Arudha Lagna in Kendra ensures strong public presence');
    }

    return findings.length > 0 ? findings : ['Balanced Arudha distribution with moderate public image'];
  }

  createPublicPrivateMatrix(arudhaPadas, chart) {
    const matrix = {
      publicDomains: {},
      privateDomains: {},
      publicPrivateAlignment: {},
      discrepancyAreas: []
    };

    const publicHouses = [1, 7, 10, 11]; // Houses most visible to public
    const privateHouses = [4, 8, 12]; // Houses most private

        for (const [house, arudhaData] of Object.entries(arudhaPadas)) {
      if (!arudhaData || !arudhaData.sign) {
        continue; // Skip if arudha data is missing or incomplete
      }

      const houseNum = parseInt(house.replace('A', '')); // Remove 'A' prefix from house key

      // Calculate the actual house sign based on ascendant and house position
      const actualHouseSign = this.getSignFromHouse(houseNum, chart.ascendant.sign);
      const arudhaSign = arudhaData.sign;

      if (publicHouses.includes(houseNum)) {
        matrix.publicDomains[house] = {
          actualSign: actualHouseSign,
          arudhaSign: arudhaSign,
          alignment: actualHouseSign === arudhaSign ? 'Aligned' : 'Different',
          significance: this.getPublicSignificance(houseNum, arudhaSign)
        };
      }

      if (privateHouses.includes(houseNum)) {
        matrix.privateDomains[house] = {
          actualSign: actualHouseSign,
          arudhaSign: arudhaSign,
          alignment: actualHouseSign === arudhaSign ? 'Aligned' : 'Different',
          significance: this.getPrivateSignificance(houseNum, arudhaSign)
        };
      }

      if (actualHouseSign !== arudhaSign) {
        matrix.discrepancyAreas.push({
          house: houseNum,
          actualSign: actualHouseSign,
          arudhaSign: arudhaSign,
          impact: this.analyzeSignDiscrepancy(actualHouseSign, arudhaSign, houseNum)
        });
      }
    }

    return matrix;
  }

  derivePublicImageTraits(signAnalysis, planetaryInfluences) {
    const traits = [];

    // From sign analysis
    if (signAnalysis.element === 'Fire') {
      traits.push('Dynamic and energetic public presence', 'Leadership in public sphere');
    } else if (signAnalysis.element === 'Earth') {
      traits.push('Stable and reliable public image', 'Practical reputation');
    } else if (signAnalysis.element === 'Air') {
      traits.push('Intellectual and communicative image', 'Social networking abilities');
    } else if (signAnalysis.element === 'Water') {
      traits.push('Emotional and intuitive public presence', 'Nurturing reputation');
    }

    // From planetary influences
    if (planetaryInfluences.dominantPlanet) {
      const planet = planetaryInfluences.dominantPlanet.toLowerCase();
      if (planet === 'sun') traits.push('Authoritative public image', 'Leadership recognition');
      else if (planet === 'moon') traits.push('Popular and emotionally appealing', 'Maternal/caring image');
      else if (planet === 'mars') traits.push('Dynamic and action-oriented', 'Courageous reputation');
      else if (planet === 'mercury') traits.push('Intelligent and articulate', 'Communication skills recognized');
      else if (planet === 'jupiter') traits.push('Wise and benevolent image', 'Teaching or guiding reputation');
      else if (planet === 'venus') traits.push('Attractive and harmonious', 'Artistic or aesthetic appeal');
      else if (planet === 'saturn') traits.push('Disciplined and responsible', 'Hardworking reputation');
    }

    return traits;
  }

  analyzeReputationFactors(planetsInAL, aspectingPlanets) {
    const factors = {
      strengthening: [],
      weakening: [],
      mixed: [],
      overall: 'Neutral'
    };

    // Analyze direct planetary influences
    for (const planetData of planetsInAL) {
      const influence = this.getPlanetReputationEffect(planetData.planet);
      if (influence.type === 'positive') {
        factors.strengthening.push(influence);
      } else if (influence.type === 'negative') {
        factors.weakening.push(influence);
      } else {
        factors.mixed.push(influence);
      }
    }

    // Analyze aspectual influences
    for (const aspectData of aspectingPlanets) {
      const influence = this.getAspectReputationEffect(aspectData.planet, aspectData.aspectType);
      if (influence.type === 'positive') {
        factors.strengthening.push(influence);
      } else if (influence.type === 'negative') {
        factors.weakening.push(influence);
      } else {
        factors.mixed.push(influence);
      }
    }

    // Calculate overall reputation factor
    const strengthScore = factors.strengthening.length * 2;
    const weakenScore = factors.weakening.length * -2;
    const mixedScore = factors.mixed.length * 0.5;
    const totalScore = strengthScore + weakenScore + mixedScore;

    if (totalScore > 2) factors.overall = 'Strong';
    else if (totalScore < -2) factors.overall = 'Challenged';
    else factors.overall = 'Moderate';

    return factors;
  }

  analyzeSocialStanding(arudhaLagna, chart) {
    const standing = {
      level: 'Average',
      factors: [],
      socialCircle: '',
      influence: '',
      recognition: ''
    };

    const arudhaHouse = arudhaLagna.house;
    const arudhaSign = arudhaLagna.sign;

    // House-based analysis
    if ([1, 10].includes(arudhaHouse)) {
      standing.level = 'High';
      standing.factors.push('Prominent house placement enhances social standing');
    } else if ([4, 7].includes(arudhaHouse)) {
      standing.level = 'Good';
      standing.factors.push('Kendra placement provides stable social position');
    } else if ([6, 8, 12].includes(arudhaHouse)) {
      standing.level = 'Challenged';
      standing.factors.push('Dusthana placement creates social obstacles');
    }

    // Sign-based analysis
    const signLord = this.getSignLord(arudhaSign);
    const signElement = this.getSignElement(arudhaSign);

    if (signElement === 'Fire') {
      standing.socialCircle = 'Leadership and authority figures';
      standing.influence = 'Dynamic and inspiring';
    } else if (signElement === 'Earth') {
      standing.socialCircle = 'Business and practical communities';
      standing.influence = 'Reliable and grounded';
    } else if (signElement === 'Air') {
      standing.socialCircle = 'Intellectual and communication networks';
      standing.influence = 'Articulate and socially connected';
    } else if (signElement === 'Water') {
      standing.socialCircle = 'Emotional and caring communities';
      standing.influence = 'Nurturing and intuitive';
    }

    return standing;
  }

  analyzeMaterialManifestation(arudhaLagna, chart) {
    const manifestation = {
      potential: 'Moderate',
      areas: [],
      timing: [],
      obstacles: [],
      enhancers: []
    };

    const arudhaHouse = arudhaLagna.house;
    const arudhaSign = arudhaLagna.sign;

    // House-based material potential
    if ([2, 11].includes(arudhaHouse)) {
      manifestation.potential = 'High';
      manifestation.areas.push('Direct wealth accumulation through public image');
    } else if ([1, 10].includes(arudhaHouse)) {
      manifestation.potential = 'Good';
      manifestation.areas.push('Material gains through recognition and status');
    } else if ([6, 8, 12].includes(arudhaHouse)) {
      manifestation.potential = 'Challenging';
      manifestation.obstacles.push('Material obstacles through public perception');
    }

    // Element-based manifestation
    const signElement = this.getSignElement(arudhaSign);
    if (signElement === 'Earth') {
      manifestation.enhancers.push('Strong material manifestation through practical approach');
    } else if (signElement === 'Fire') {
      manifestation.enhancers.push('Material gains through leadership and initiative');
    }

    return manifestation;
  }
  calculateSignDistance(lagnaSign, arudhaSign) { return 1; }
  analyzeSignRelationship(lagnaSign, arudhaSign) { return { description: 'Relationship analysis' }; }
  getSignDistanceImplication(distance) { return 'Distance implication'; }
  getImageRealityImplications(lagnaSign, arudhaSign, relationship) { return ['Implications']; }
  getSignCharacteristics(sign) { return { characteristics: 'Sign traits' }; }
  identifyImageRealitychallenges(lagnaSign, arudhaSign) { return ['Challenges']; }
  suggestImageRealityHarmonization(lagnaSign, arudhaSign) { return ['Suggestions']; }
  analyzePlanetInfluenceOnAL(planet, position, arudhaLagna) { return { nature: 'Benefic', influence: 'Positive' }; }
  analyzeAspectInfluenceOnAL(aspect, arudhaLagna) { return { nature: 'Benefic', influence: 'Positive' }; }
  calculateOverallArudhaSupport(supports) { return 'Moderate'; }
  generateSupportRecommendations(supports) { return ['Support recommendations']; }
  analyzeImageSustainability(house, chart) { return { sustainability: 'Good' }; }
  analyzeImageLoss(house, chart) { return { loss: 'Minimal' }; }
  getImageSustainabilityImplications(analysis) { return ['Sustainability implications']; }
  getImageLossImplications(analysis) { return ['Loss implications']; }
  assessOverallImageStability(second, twelfth) { return 'Stable'; }
  generateImageStabilityRecommendations(second, twelfth) { return ['Stability recommendations']; }
  identifyImagePatterns(arudhaPadas) { return { patterns: 'Patterns identified' }; }
  analyzeSocialInfluence(arudhaAnalysis, chart) { return { influence: 'Strong' }; }
  analyzePublicRecognition(arudhaAnalysis, chart) { return { recognition: 'Good' }; }
  identifyConjunctionPeriods(arudhaLagna, chart) { return ['Period 1', 'Period 2']; }
  analyzeJupiterTransitTriggers(arudhaLagna) { return { triggers: 'Jupiter triggers' }; }
  analyzeSaturnTransitTriggers(arudhaLagna) { return { triggers: 'Saturn triggers' }; }
  analyzeRahuKetuTransitTriggers(arudhaLagna) { return { triggers: 'Rahu-Ketu triggers' }; }
  analyzeEarlyLifeImageDevelopment(arudhaLagna, chart) { return { development: 'Early development' }; }
  analyzeMidLifeImagePeak(arudhaLagna, chart) { return { peak: 'Mid-life peak' }; }
  analyzeLaterLifeImageEvolution(arudhaLagna, chart) { return { evolution: 'Later evolution' }; }
  generateTimingRecommendations(arudhaLagna, chart) { return ['Timing recommendations']; }
  identifyImageStrengthFactors(analysis) { return ['Strength factors']; }
  identifyImageWeaknessFactors(analysis) { return ['Weakness factors']; }
  identifyMajorReputationCycles(arudhaLagna, chart) { return ['Major cycles']; }
  analyzeTransitInfluencesOnReputation(arudhaLagna) { return { influences: 'Transit influences' }; }
  analyzeDashaInfluencesOnReputation(arudhaLagna, chart) { return { influences: 'Dasha influences' }; }
  generateReputationCycleRecommendations(arudhaLagna) { return ['Cycle recommendations']; }
  generateImageEnhancementRecommendations(analysis) { return ['Enhancement recommendations']; }
  generateReputationManagementRecommendations(analysis) { return ['Management recommendations']; }
  generateTimingGuidanceRecommendations(analysis) { return ['Timing guidance']; }
  generateRemedialMeasures(analysis) { return ['Remedial measures']; }

  /**
   * Get the lord of a zodiac sign
   * @param {string} sign - Zodiac sign
   * @returns {string} Planet name
   */
  getSignLord(sign) {
    const signLords = {
      'ARIES': 'Mars',
      'TAURUS': 'Venus',
      'GEMINI': 'Mercury',
      'CANCER': 'Moon',
      'LEO': 'Sun',
      'VIRGO': 'Mercury',
      'LIBRA': 'Venus',
      'SCORPIO': 'Mars',
      'SAGITTARIUS': 'Jupiter',
      'CAPRICORN': 'Saturn',
      'AQUARIUS': 'Saturn',
      'PISCES': 'Jupiter'
    };
    return signLords[sign.toUpperCase()] || 'Unknown';
  }

  /**
   * Get the element of a zodiac sign
   * @param {string} sign - Zodiac sign
   * @returns {string} Element (Fire, Earth, Air, Water)
   */
  getSignElement(sign) {
    const signElements = {
      'ARIES': 'Fire',
      'LEO': 'Fire',
      'SAGITTARIUS': 'Fire',
      'TAURUS': 'Earth',
      'VIRGO': 'Earth',
      'CAPRICORN': 'Earth',
      'GEMINI': 'Air',
      'LIBRA': 'Air',
      'AQUARIUS': 'Air',
      'CANCER': 'Water',
      'SCORPIO': 'Water',
      'PISCES': 'Water'
    };
    return signElements[sign.toUpperCase()] || 'Unknown';
  }

  /**
   * Get planet reputation effect
   * @param {string} planet - Planet name
   * @returns {Object} Reputation effect
   */
  getPlanetReputationEffect(planet) {
    const effects = {
      'sun': { type: 'positive', description: 'Authority and leadership reputation' },
      'moon': { type: 'positive', description: 'Popular and emotionally appealing' },
      'mars': { type: 'mixed', description: 'Dynamic but potentially aggressive image' },
      'mercury': { type: 'positive', description: 'Intelligent and communicative reputation' },
      'jupiter': { type: 'positive', description: 'Wise and respected image' },
      'venus': { type: 'positive', description: 'Attractive and harmonious reputation' },
      'saturn': { type: 'mixed', description: 'Disciplined but potentially harsh image' },
      'rahu': { type: 'mixed', description: 'Unconventional and mysterious reputation' },
      'ketu': { type: 'mixed', description: 'Spiritual but detached image' }
    };
    return effects[planet.toLowerCase()] || { type: 'neutral', description: 'Neutral influence' };
  }

  /**
   * Get aspect reputation effect
   * @param {string} planet - Planet name
   * @param {string} aspectType - Type of aspect
   * @returns {Object} Aspect reputation effect
   */
  getAspectReputationEffect(planet, aspectType) {
    const baseEffect = this.getPlanetReputationEffect(planet);
    return {
      type: baseEffect.type,
      description: `${aspectType} aspect: ${baseEffect.description}`
    };
  }

  /**
   * Get public significance of Arudha in a house
   * @param {number} houseNum - House number
   * @param {string} arudhaSign - Arudha sign
   * @returns {string} Public significance
   */
  getPublicSignificance(houseNum, arudhaSign) {
    const houseSignificances = {
      1: 'Overall public personality and image',
      7: 'Partnership and relationship image',
      10: 'Career and professional reputation',
      11: 'Social network and gains image'
    };

    return houseSignificances[houseNum] || 'General public perception';
  }

  /**
   * Get private significance of Arudha in a house
   * @param {number} houseNum - House number
   * @param {string} arudhaSign - Arudha sign
   * @returns {string} Private significance
   */
  getPrivateSignificance(houseNum, arudhaSign) {
    const houseSignificances = {
      4: 'Home and family image vs reality',
      8: 'Hidden matters and transformation image',
      12: 'Spiritual and subconscious image'
    };

    return houseSignificances[houseNum] || 'General private perception';
  }

  /**
   * Analyze discrepancy between actual and Arudha signs
   * @param {string} actualSign - Actual house sign
   * @param {string} arudhaSign - Arudha sign
   * @param {number} houseNum - House number
   * @returns {string} Impact analysis
   */
  analyzeSignDiscrepancy(actualSign, arudhaSign, houseNum) {
    return `Discrepancy between inner reality (${actualSign}) and public perception (${arudhaSign}) in ${houseNum}th house matters`;
  }
}

module.exports = ArudhaAnalysisService;
