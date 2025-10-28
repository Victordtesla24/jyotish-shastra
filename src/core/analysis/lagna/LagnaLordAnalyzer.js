/**
 * Lagna Lord Analyzer for Vedic Astrology
 * Analyzes the placement and effects of the Lagna lord using static methods
 */

class LagnaLordAnalyzer {
  /**
   * Get the ruling planet of a zodiac sign
   * @param {string} sign - Zodiac sign name
   * @returns {string} - Ruling planet name
   */
  static getLagnaLord(sign) {
    // Normalize sign to title case
    const normalizedSign = sign.charAt(0).toUpperCase() + sign.slice(1).toLowerCase();

    const signLords = {
      'Aries': 'Mars',
      'Taurus': 'Venus',
      'Gemini': 'Mercury',
      'Cancer': 'Moon',
      'Leo': 'Sun',
      'Virgo': 'Mercury',
      'Libra': 'Venus',
      'Scorpio': 'Mars',
      'Sagittarius': 'Jupiter',
      'Capricorn': 'Saturn',
      'Aquarius': 'Saturn',
      'Pisces': 'Jupiter'
    };
    return signLords[normalizedSign];
  }

  /**
   * Find a planet's position in the chart
   * @param {Array|Object} planetaryPositions - Array or object of planetary positions
   * @param {string} planetName - Name of the planet to find
   * @returns {Object|undefined} - Planet position object or undefined if not found
   */
  static findPlanetPosition(planetaryPositions, planetName) {
    if (!planetName) return undefined;

    if (Array.isArray(planetaryPositions)) {
      return planetaryPositions.find(p => p.planet === planetName);
    } else if (typeof planetaryPositions === 'object') {
      return planetaryPositions[planetName.toLowerCase()] || planetaryPositions[planetName];
    }
    return undefined;
  }

  /**
   * Main analysis function for Lagna Lord
   * @param {Object} chart - Birth chart data
   * @returns {Object} - Comprehensive analysis
   */
  static analyzeLagnaLord(chart) {
    // Handle different chart structures
    const actualChart = chart.rasiChart || chart;

    if (!actualChart.ascendant) {
      throw new Error('Invalid chart structure: missing ascendant');
    }

    // Handle both planetaryPositions (array) and planets (array) structures
    const planetaryData = actualChart.planetaryPositions || actualChart.planets;
    
    if (!planetaryData || planetaryData.length === 0) {
      throw new Error('Invalid chart structure: missing planetary data');
    }

    const lagnaSign = actualChart.ascendant.sign.charAt(0).toUpperCase() + actualChart.ascendant.sign.slice(1).toLowerCase();
    const lagnaLord = this.getLagnaLord(lagnaSign);
    const lordPosition = this.findPlanetPosition(planetaryData, lagnaLord);

    if (!lordPosition) {
      throw new Error(`Lagna lord ${lagnaLord} position not found in chart`);
    }

    const dignity = this.analyzeDignity(lordPosition, actualChart);
    const houseEffects = this.analyzeHouseEffects(lordPosition.house, lagnaSign);
    const conjunctionEffects = this.analyzeConjunctions(lordPosition, planetaryData);
    
    // Create chart with planetaryData for aspect analysis
    const chartForAspects = { ...actualChart, planetaryPositions: planetaryData };
    const aspectEffects = this.analyzeAspects(lordPosition, chartForAspects);
    const lifeEffects = this.analyzeLifeEffects(lordPosition, lagnaSign);
    const dashaEffects = this.analyzeDashaEffects(lordPosition, lagnaSign);
    const remedialMeasures = this.generateRemedialMeasures(lordPosition, { overallStrength: { score: dignity.strength } });

    return {
      lagnaSign,
      lagnaLord,
      lordPosition,
      analysis: {
        placement: {
          sign: lordPosition.sign,
          house: lordPosition.house,
          dignity: dignity.type
        },
        dignity,
        houseEffects,
        conjunctionEffects,
        aspectEffects,
        lifeEffects,
        dashaEffects
      },
      remedialMeasures,
      summary: `The Lagna Lord ${lagnaLord} is placed in the ${lordPosition.house}${this.getOrdinalSuffix(lordPosition.house)} house in ${lordPosition.sign}, showing ${dignity.type} dignity. ${houseEffects.description}`,
      recommendations: this.generateRecommendations(lordPosition, dignity, houseEffects)
    };
  }

  /**
   * Analyze dignity of a planet
   * @param {Object} planetPosition - Planet position object
   * @param {Object} chart - Chart data for context
   * @returns {Object} - Dignity analysis
   */
  static analyzeDignity(planetPosition, chart) {
    const dignityData = {
      'Sun': { exaltation: 'Aries', debilitation: 'Libra', own: ['Leo'] },
      'Moon': { exaltation: 'Taurus', debilitation: 'Scorpio', own: ['Cancer'] },
      'Mars': { exaltation: 'Capricorn', debilitation: 'Cancer', own: ['Aries', 'Scorpio'] },
      'Mercury': { exaltation: 'Virgo', debilitation: 'Pisces', own: ['Gemini', 'Virgo'] },
      'Jupiter': { exaltation: 'Cancer', debilitation: 'Capricorn', own: ['Sagittarius', 'Pisces'] },
      'Venus': { exaltation: 'Pisces', debilitation: 'Virgo', own: ['Taurus', 'Libra'] },
      'Saturn': { exaltation: 'Libra', debilitation: 'Aries', own: ['Capricorn', 'Aquarius'] }
    };

    const planetData = dignityData[planetPosition.planet];
    if (!planetData) {
      return { type: 'neutral', strength: 50, description: 'Neutral placement', effects: ['Mixed results'] };
    }

    const currentSign = planetPosition.sign;

    if (planetData.exaltation === currentSign) {
      return {
        type: 'exalted',
        strength: 100,
        description: `${planetPosition.planet} is exalted in ${currentSign}`,
        effects: ['Maximum strength', 'Excellent results', 'Peak performance']
      };
    }

    if (planetData.debilitation === currentSign) {
      // Check for Neecha Bhanga Yoga
      const neechaBhanga = this.checkNeechaBhangaYoga(planetPosition, chart);
      return {
        type: 'debilitated',
        strength: neechaBhanga.isPresent ? 75 : 25,
        description: `${planetPosition.planet} is debilitated in ${currentSign}${neechaBhanga.isPresent ? ' but with Neecha Bhanga Yoga' : ''}`,
        effects: neechaBhanga.isPresent ? ['Challenges overcome', 'Late success'] : ['Weakness', 'Obstacles', 'Reduced results']
      };
    }

    if (planetData.own.includes(currentSign)) {
      return {
        type: 'own_sign',
        strength: 85,
        description: `${planetPosition.planet} is in own sign ${currentSign}`,
        effects: ['Good strength', 'Stable results', 'Natural expression']
      };
    }

    // Check for friendly/enemy signs (simplified)
    return {
      type: 'neutral',
      strength: 60,
      description: `${planetPosition.planet} is in ${currentSign}`,
      effects: ['Moderate results', 'Depends on other factors']
    };
  }

  /**
   * Check for Neecha Bhanga Yoga (Complete Traditional Implementation)
   * @param {Object} planetPosition - Debilitated planet position
   * @param {Object} chart - Chart data
   * @returns {Object} - Neecha Bhanga status
   */
  static checkNeechaBhangaYoga(planetPosition, chart) {
    const debilitatedPlanet = planetPosition.planet;
    const debilitatedHouse = planetPosition.house;
    const planetLongitude = planetPosition.longitude || 0;

    // Define debilitation signs and degrees
    const debilitationData = {
      'Sun': { sign: 'Libra', exactDegree: 10, signIndex: 7 },
      'Moon': { sign: 'Scorpio', exactDegree: 3, signIndex: 8 },
      'Mars': { sign: 'Cancer', exactDegree: 28, signIndex: 4 },
      'Mercury': { sign: 'Pisces', exactDegree: 15, signIndex: 12 },
      'Jupiter': { sign: 'Capricorn', exactDegree: 5, signIndex: 10 },
      'Venus': { sign: 'Virgo', exactDegree: 27, signIndex: 6 },
      'Saturn': { sign: 'Aries', exactDegree: 20, signIndex: 1 }
    };

    const debilData = debilitationData[debilitatedPlanet];
    if (!debilData) {
      return {
        isPresent: false,
        type: null,
        description: `${debilitatedPlanet} is not a debilitable planet`
      };
    }

    // Check if planet is actually debilitated
    const currentSign = this.getSignFromLongitude(planetLongitude);
    if (currentSign !== debilData.sign) {
      return {
        isPresent: false,
        type: null,
        description: `${debilitatedPlanet} is not in its debilitation sign`
      };
    }

    const neechaBhangaTypes = [];
    const planets = Array.isArray(chart.planetaryPositions) ?
      chart.planetaryPositions : Object.values(chart.planetaryPositions);

    // Rule 1: Lord of debilitation sign is in Kendra from Lagna or Moon
    const debilSignLord = this.getSignRuler(debilData.sign);
    const debilSignLordPosition = this.findPlanetPosition(planets, debilSignLord);

    if (debilSignLordPosition) {
      const kendraFromLagna = this.isInKendraFromReference(debilSignLordPosition.house, 1);
      const moonPosition = this.findPlanetPosition(planets, 'Moon');
      const kendraFromMoon = moonPosition ?
        this.isInKendraFromReference(debilSignLordPosition.house, moonPosition.house) : false;

      if (kendraFromLagna || kendraFromMoon) {
        neechaBhangaTypes.push({
          type: 'debil_sign_lord_kendra',
          description: `${debilSignLord}, lord of ${debilData.sign} (debilitation sign), is in Kendra`,
          strength: 85
        });
      }
    }

    // Rule 2: Lord of exaltation sign of debilitated planet is in Kendra
    const exaltSignLord = this.getExaltationSignLord(debilitatedPlanet);
    const exaltSignLordPosition = this.findPlanetPosition(planets, exaltSignLord);

    if (exaltSignLordPosition) {
      const kendraFromLagna = this.isInKendraFromReference(exaltSignLordPosition.house, 1);
      const moonPosition = this.findPlanetPosition(planets, 'Moon');
      const kendraFromMoon = moonPosition ?
        this.isInKendraFromReference(exaltSignLordPosition.house, moonPosition.house) : false;

      if (kendraFromLagna || kendraFromMoon) {
        neechaBhangaTypes.push({
          type: 'exalt_sign_lord_kendra',
          description: `Lord of exaltation sign is in Kendra from Lagna or Moon`,
          strength: 80
        });
      }
    }

    // Rule 3: Debilitated planet is aspected by its own sign lord or exaltation sign lord
    const ownSignLord = this.getOwnSignLord(debilitatedPlanet);
    const aspectingPlanets = this.findAspectingPlanets(chart, debilitatedHouse);

    const aspectedByOwnLord = aspectingPlanets.some(asp => asp.planet === ownSignLord);
    const aspectedByExaltLord = aspectingPlanets.some(asp => asp.planet === exaltSignLord);

    if (aspectedByOwnLord) {
      neechaBhangaTypes.push({
        type: 'aspected_by_own_lord',
        description: `${debilitatedPlanet} is aspected by its own sign lord ${ownSignLord}`,
        strength: 75
      });
    }

    if (aspectedByExaltLord) {
      neechaBhangaTypes.push({
        type: 'aspected_by_exalt_lord',
        description: `${debilitatedPlanet} is aspected by its exaltation sign lord`,
        strength: 75
      });
    }

    // Rule 4: Debilitated planet is in conjunction with its own sign lord or exaltation sign lord
    const conjunctions = this.analyzeConjunctions(planetPosition, planets);
    const conjunctOwnLord = conjunctions.conjunctions.some(conj => conj.planet === ownSignLord);
    const conjunctExaltLord = conjunctions.conjunctions.some(conj => conj.planet === exaltSignLord);

    if (conjunctOwnLord) {
      neechaBhangaTypes.push({
        type: 'conjunct_own_lord',
        description: `${debilitatedPlanet} is conjunct with its own sign lord ${ownSignLord}`,
        strength: 90
      });
    }

    if (conjunctExaltLord) {
      neechaBhangaTypes.push({
        type: 'conjunct_exalt_lord',
        description: `${debilitatedPlanet} is conjunct with its exaltation sign lord`,
        strength: 85
      });
    }

    // Rule 5: Debilitated planet exchanges signs with another planet (Parivartana Yoga)
    const parivartanaYoga = this.checkParivartanaYoga(planetPosition, chart);
    if (parivartanaYoga.hasParivartana) {
      neechaBhangaTypes.push({
        type: 'parivartana_yoga',
        description: `${debilitatedPlanet} is in Parivartana Yoga, creating Neecha Bhanga`,
        strength: 80
      });
    }

    // Rule 6: Debilitated planet is exalted in Navamsa
    const navamsaSign = this.getNavamsaSign(planetLongitude, currentSign);
    const exaltationSign = this.getExaltationSign(debilitatedPlanet);

    if (navamsaSign === exaltationSign) {
      neechaBhangaTypes.push({
        type: 'exalted_navamsa',
        description: `${debilitatedPlanet} is exalted in Navamsa (D9), creating powerful Neecha Bhanga`,
        strength: 95
      });
    }

    // Rule 7: Debilitated planet is in own sign in Navamsa
    const ownSigns = this.getOwnSigns(debilitatedPlanet);
    if (ownSigns.includes(navamsaSign)) {
      neechaBhangaTypes.push({
        type: 'own_sign_navamsa',
        description: `${debilitatedPlanet} is in its own sign in Navamsa, creating Neecha Bhanga`,
        strength: 70
      });
    }

    // Calculate overall Neecha Bhanga strength
    const overallStrength = neechaBhangaTypes.length > 0 ?
      Math.max(...neechaBhangaTypes.map(t => t.strength)) : 0;

    const isPresent = neechaBhangaTypes.length > 0;
    const primaryType = isPresent ?
      neechaBhangaTypes.reduce((prev, current) =>
        (prev.strength > current.strength) ? prev : current
      ) : null;

    return {
      isPresent,
      type: primaryType?.type || null,
      strength: overallStrength,
      allTypes: neechaBhangaTypes,
      description: isPresent ?
        `Neecha Bhanga Yoga is present for ${debilitatedPlanet}. ${primaryType.description}. Strength: ${overallStrength}%` :
        `No Neecha Bhanga Yoga found for ${debilitatedPlanet}`,
      effects: isPresent ? this.getNeechaBhangaEffects(debilitatedPlanet, overallStrength) : null
    };
  }

  /**
   * Get sign from longitude
   */
  static getSignFromLongitude(longitude) {
    const signs = [
      'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];
    const signIndex = Math.floor(longitude / 30);
    return signs[signIndex] || 'Aries';
  }

  /**
   * Get sign ruler
   */
  static getSignRuler(sign) {
    const rulers = {
      'Aries': 'Mars', 'Taurus': 'Venus', 'Gemini': 'Mercury', 'Cancer': 'Moon',
      'Leo': 'Sun', 'Virgo': 'Mercury', 'Libra': 'Venus', 'Scorpio': 'Mars',
      'Sagittarius': 'Jupiter', 'Capricorn': 'Saturn', 'Aquarius': 'Saturn', 'Pisces': 'Jupiter'
    };
    return rulers[sign] || 'Sun';
  }

  /**
   * Get exaltation sign lord
   */
  static getExaltationSignLord(planet) {
    const exaltationSigns = {
      'Sun': 'Aries', 'Moon': 'Taurus', 'Mars': 'Capricorn', 'Mercury': 'Virgo',
      'Jupiter': 'Cancer', 'Venus': 'Pisces', 'Saturn': 'Libra'
    };
    const exaltSign = exaltationSigns[planet];
    return exaltSign ? this.getSignRuler(exaltSign) : 'Sun';
  }

  /**
   * Get own sign lord (returns the planet itself as it rules its own signs)
   */
  static getOwnSignLord(planet) {
    return planet; // The planet is the lord of its own signs
  }

  /**
   * Get exaltation sign
   */
  static getExaltationSign(planet) {
    const exaltationSigns = {
      'Sun': 'Aries', 'Moon': 'Taurus', 'Mars': 'Capricorn', 'Mercury': 'Virgo',
      'Jupiter': 'Cancer', 'Venus': 'Pisces', 'Saturn': 'Libra'
    };
    return exaltationSigns[planet] || 'Aries';
  }

  /**
   * Get own signs of a planet
   */
  static getOwnSigns(planet) {
    const ownSigns = {
      'Sun': ['Leo'],
      'Moon': ['Cancer'],
      'Mars': ['Aries', 'Scorpio'],
      'Mercury': ['Gemini', 'Virgo'],
      'Jupiter': ['Sagittarius', 'Pisces'],
      'Venus': ['Taurus', 'Libra'],
      'Saturn': ['Capricorn', 'Aquarius']
    };
    return ownSigns[planet] || [];
  }

  /**
   * Check if house is in Kendra from reference
   */
  static isInKendraFromReference(house, referenceHouse) {
    const kendraPositions = [1, 4, 7, 10];
    const relativePosition = ((house - referenceHouse + 12) % 12) + 1;
    return kendraPositions.includes(relativePosition);
  }

  /**
   * Get Neecha Bhanga effects
   */
  static getNeechaBhangaEffects(planet, strength) {
    const effects = {
      positive: [],
      negative: [],
      timing: '',
      remedies: []
    };

    if (strength >= 80) {
      effects.positive.push('Transforms debilitation into strength');
      effects.positive.push('Late bloomer success pattern');
      effects.positive.push('Extraordinary achievements through struggle');
      effects.timing = 'Effects manifest strongly after age 30-35';
    } else if (strength >= 60) {
      effects.positive.push('Partially neutralizes debilitation');
      effects.positive.push('Mixed results with eventual improvement');
      effects.timing = 'Gradual improvement throughout life';
    } else {
      effects.positive.push('Mild relief from debilitation effects');
      effects.timing = 'Sporadic relief periods';
    }

    effects.negative.push('Initial struggles and setbacks');
    effects.negative.push('Need for extra effort in related areas');

    effects.remedies.push(`Strengthen ${planet} through appropriate remedies`);
    effects.remedies.push('Practice patience and perseverance');
    effects.remedies.push('Focus on spiritual growth');

    return effects;
  }

  /**
   * Analyze house effects
   * @param {number} house - House number
   * @param {string} lagnaSign - Lagna sign for context
   * @returns {Object} - House effects analysis
   */
  static analyzeHouseEffects(house, lagnaSign) {
    const houseSignifications = this.getHouseSignifications(house);
    const kendraHouses = [1, 4, 7, 10];
    const trikonaHouses = [1, 5, 9];
    const dusthanaHouses = [6, 8, 12];

    let strength = 50;
    let description = '';

    if (kendraHouses.includes(house)) {
      strength = 80;
      description = `Lagna lord in ${house}th house - strong placement in Kendra house brings stability and material success`;
    } else if (trikonaHouses.includes(house)) {
      strength = 85;
      description = `Lagna lord in ${house}th house - Excellent placement in Trikona house brings fortune and spiritual growth`;
    } else if (dusthanaHouses.includes(house)) {
      strength = 40;
      description = `Lagna lord in ${house}th house - challenging placement in Dusthana house requires effort to overcome obstacles`;
    } else {
      strength = 65;
      description = `Lagna lord in ${house}th house - Moderate placement with mixed results`;
    }

    return {
      house,
      significations: houseSignifications,
      effects: {
        strength,
        positive: strength > 60 ? ['Good results in house matters', 'Supports house significations'] : [],
        negative: strength < 60 ? ['Challenges in house matters', 'Obstacles to house significations'] : []
      },
      timing: {
        early: house <= 4 ? 'Effects manifest early in life' : 'Later manifestation',
        peak: `Strong effects during ${house}th house related periods`
      },
      description
    };
  }

  /**
   * Get house significations
   * @param {number} house - House number
   * @returns {Array} - Array of significations
   */
  static getHouseSignifications(house) {
    const significations = {
      1: ['personality', 'health', 'appearance', 'vitality', 'self'],
      2: ['wealth', 'family', 'speech', 'food', 'values'],
      3: ['courage', 'siblings', 'communication', 'short journeys', 'efforts'],
      4: ['mother', 'home', 'property', 'education', 'emotional foundation'],
      5: ['children', 'creativity', 'intelligence', 'romance', 'speculation'],
      6: ['enemies', 'disease', 'service', 'debt', 'competition'],
      7: ['marriage', 'partnerships', 'business', 'spouse', 'public image'],
      8: ['longevity', 'transformation', 'occult', 'inheritance', 'sudden events'],
      9: ['fortune', 'father', 'dharma', 'higher education', 'spirituality'],
      10: ['career', 'reputation', 'authority', 'profession', 'public life'],
      11: ['gains', 'friends', 'desires', 'income', 'elder siblings'],
      12: ['loss', 'liberation', 'foreign lands', 'spirituality', 'expenses']
    };
    return significations[house] || [];
  }

  /**
   * Analyze conjunctions
   * @param {Object} lordPosition - Lagna lord position
   * @param {Array|Object} planetaryPositions - All planetary positions
   * @returns {Object} - Conjunction analysis
   */
  static analyzeConjunctions(lordPosition, planetaryPositions) {
    const conjunctions = [];
    const planets = Array.isArray(planetaryPositions) ? planetaryPositions : Object.values(planetaryPositions);

    planets.forEach(planet => {
      if (planet.planet !== lordPosition.planet && planet.house === lordPosition.house) {
        const orb = Math.abs((planet.longitude || 0) - (lordPosition.longitude || 0));
        if (orb <= 10) { // Within 10 degrees
          conjunctions.push({
            planet: planet.planet,
            orb,
            strength: this.calculateConjunctionStrength(orb),
            effects: this.analyzePlanetaryConjunction(lordPosition.planet, planet.planet, orb)
          });
        }
      }
    });

    return {
      hasConjunctions: conjunctions.length > 0,
      conjunctions,
      summary: conjunctions.length > 0 ?
        `${lordPosition.planet} is conjunct with ${conjunctions.map(c => c.planet).join(', ')}` :
        `${lordPosition.planet} is not in close conjunction with other planets`
    };
  }

  /**
   * Calculate conjunction strength based on orb
   * @param {number} orb - Orb in degrees
   * @returns {number} - Strength percentage
   */
  static calculateConjunctionStrength(orb) {
    if (orb <= 1) return 100;
    if (orb <= 3) return 80;
    if (orb <= 5) return 60;
    if (orb <= 8) return 40;
    return 20;
  }

  /**
   * Analyze planetary conjunction effects
   * @param {string} planet1 - First planet
   * @param {string} planet2 - Second planet
   * @param {number} orb - Orb between planets
   * @returns {Object} - Conjunction effects
   */
  static analyzePlanetaryConjunction(planet1, planet2, orb) {
    const benefics = ['Jupiter', 'Venus', 'Mercury', 'Moon'];
    const malefics = ['Mars', 'Saturn', 'Sun', 'Rahu', 'Ketu'];

    const p1Benefic = benefics.includes(planet1);
    const p2Benefic = benefics.includes(planet2);

    return {
      nature: (p1Benefic && p2Benefic) ? 'highly_benefic' :
              (!p1Benefic && !p2Benefic) ? 'challenging' : 'mixed',
      effects: [`Combination of ${planet1} and ${planet2} energies`, 'Mutual influence on results'],
      strength: this.calculateConjunctionStrength(orb)
    };
  }

  /**
   * Analyze aspects to/from Lagna lord
   * @param {Object} lordPosition - Lagna lord position
   * @param {Object} chart - Chart data
   * @returns {Object} - Aspect analysis
   */
    static analyzeAspects(lordPosition, chart) {
    const aspectingPlanets = this.findAspectingPlanets(chart, lordPosition.house);
    const beneficAspects = aspectingPlanets.filter(a => a.nature.benefic);
    const maleficAspects = aspectingPlanets.filter(a => a.nature.malefic);

    const netInfluence = beneficAspects.length > maleficAspects.length ? 'positive' :
                         maleficAspects.length > beneficAspects.length ? 'challenging' : 'neutral';

    return {
      hasAspects: aspectingPlanets.length > 0,
      aspects: aspectingPlanets,
      strength: aspectingPlanets.reduce((sum, a) => sum + a.strength, 0) / Math.max(aspectingPlanets.length, 1),
      beneficInfluence: beneficAspects.length > 0 ? 'positive' : 'none',
      maleficInfluence: maleficAspects.length > 0 ? 'challenging' : 'none',
      netInfluence,
      dominantInfluence: aspectingPlanets.length > 0 ?
        (beneficAspects.length > maleficAspects.length ? 'benefic' :
         maleficAspects.length > beneficAspects.length ? 'malefic' : 'balanced') : 'none',
      summary: aspectingPlanets.length > 0 ?
        `${lordPosition.planet} receives aspects from ${aspectingPlanets.map(a => a.planet).join(', ')}` :
        `${lordPosition.planet} does not receive major aspects`
    };
  }

  /**
   * Find planets aspecting a house
   * @param {Object} chart - Chart data
   * @param {number} targetHouse - House being aspected
   * @returns {Array} - Array of aspecting planets
   */
  static findAspectingPlanets(chart, targetHouse) {
    const aspects = [];
    const planets = Array.isArray(chart.planetaryPositions) ?
      chart.planetaryPositions : Object.values(chart.planetaryPositions);

    planets.forEach(planet => {
      // 7th house aspect (all planets)
      const oppositeHouse = (planet.house + 5) % 12 + 1;
      if (oppositeHouse === targetHouse) {
        aspects.push({
          planet: planet.planet,
          type: '7th Aspect',
          orb: 0,
          strength: this.calculateAspectStrength({ type: '7th Aspect', orb: 0 }),
          nature: this.getAspectNature(planet.planet, 'Target', '7th Aspect')
        });
      }

      // Special aspects
      if (planet.planet === 'Mars') {
        const fourthAspect = (planet.house + 2) % 12 + 1;
        const eighthAspect = (planet.house + 6) % 12 + 1;
        if (fourthAspect === targetHouse || eighthAspect === targetHouse) {
          aspects.push({
            planet: planet.planet,
            type: fourthAspect === targetHouse ? '4th Aspect' : '8th Aspect',
            orb: 0,
            strength: 70,
            nature: { malefic: true }
          });
        }
      }

      if (planet.planet === 'Jupiter') {
        const fifthAspect = (planet.house + 3) % 12 + 1;
        const ninthAspect = (planet.house + 7) % 12 + 1;
        if (fifthAspect === targetHouse || ninthAspect === targetHouse) {
          aspects.push({
            planet: planet.planet,
            type: fifthAspect === targetHouse ? '5th Aspect' : '9th Aspect',
            orb: 0,
            strength: 80,
            nature: { benefic: true }
          });
        }
      }

      if (planet.planet === 'Saturn') {
        const thirdAspect = (planet.house + 1) % 12 + 1;
        const tenthAspect = (planet.house + 8) % 12 + 1;
        if (thirdAspect === targetHouse || tenthAspect === targetHouse) {
          aspects.push({
            planet: planet.planet,
            type: thirdAspect === targetHouse ? '3rd Aspect' : '10th Aspect',
            orb: 0,
            strength: 75,
            nature: { malefic: true }
          });
        }
      }
    });

    return aspects;
  }

  /**
   * Calculate aspect strength
   * @param {Object} aspect - Aspect object with type and orb
   * @returns {number} - Strength percentage
   */
  static calculateAspectStrength(aspect) {
    const baseStrengths = {
      '7th Aspect': 75,
      '4th Aspect': 70,
      '8th Aspect': 70,
      '5th Aspect': 80,
      '9th Aspect': 80,
      '3rd Aspect': 75,
      '10th Aspect': 75
    };

    const baseStrength = baseStrengths[aspect.type] || 60;
    const orbReduction = Math.max(0, (aspect.orb || 0) * 5);
    return Math.max(20, baseStrength - orbReduction);
  }

  /**
   * Get aspect nature (benefic/malefic)
   * @param {string} aspectingPlanet - Planet giving aspect
   * @param {string} aspectedPlanet - Planet receiving aspect
   * @param {string} aspectType - Type of aspect
   * @returns {Object} - Aspect nature
   */
  static getAspectNature(aspectingPlanet, aspectedPlanet, aspectType) {
    const benefics = ['Jupiter', 'Venus', 'Mercury'];
    const malefics = ['Mars', 'Saturn', 'Sun', 'Rahu', 'Ketu'];

    if (benefics.includes(aspectingPlanet)) {
      return { benefic: true, malefic: false };
    } else if (malefics.includes(aspectingPlanet)) {
      return { benefic: false, malefic: true };
    }

    return { benefic: false, malefic: false }; // Neutral (Moon)
  }

  /**
   * Analyze life effects
   * @param {Object} lordPosition - Lagna lord position
   * @param {string} lagnaSign - Lagna sign
   * @returns {Object} - Life effects analysis
   */
  static analyzeLifeEffects(lordPosition, lagnaSign) {
    return {
      personality: this.getPersonalityEffects(lordPosition.house, lordPosition.planet),
      health: this.getHealthEffects(lordPosition.house, lordPosition.planet, lagnaSign),
      career: this.getCareerEffects(lordPosition.house, lordPosition.planet),
      relationships: this.getRelationshipEffects(lordPosition.house, lordPosition.planet),
      wealth: this.getWealthEffects(lordPosition.house, lordPosition.planet),
      finances: this.getWealthEffects(lordPosition.house, lordPosition.planet), // Alias for wealth
      spirituality: { inclination: 'moderate', practices: ['meditation', 'prayer'] },
      summary: `Life effects based on ${lordPosition.planet} in ${lordPosition.house}th house`
    };
  }

  /**
   * Get personality effects
   * @param {number} house - House placement
   * @param {string} planet - Lagna lord planet
   * @returns {Object} - Personality effects
   */
  static getPersonalityEffects(house, planet) {
    const houseTraits = {
      1: ['self-focused', 'independent', 'leadership qualities'],
      2: ['family-oriented', 'practical', 'value-conscious'],
      3: ['communicative', 'brave', 'initiative-taking'],
      4: ['emotional', 'home-loving', 'nurturing'],
      5: ['creative', 'intelligent', 'romantic'],
      6: ['service-minded', 'health-conscious', 'competitive'],
      7: ['diplomatic', 'partnership-oriented', 'social'],
      8: ['mysterious', 'transformative', 'research-oriented'],
      9: ['philosophical', 'spiritual', 'fortunate'],
      10: ['ambitious', 'career-focused', 'authoritative'],
      11: ['friendly', 'goal-oriented', 'networking'],
      12: ['spiritual', 'introspective', 'sacrificing']
    };

    const traits = houseTraits[house] || ['balanced personality'];

    return {
      traits,
      strengths: traits.filter((trait, index) => index % 2 === 0), // Half as strengths
      challenges: house === 6 || house === 8 || house === 12 ? ['overcoming obstacles', 'challenges to overcome'] : ['minor challenges'],
      description: `Personality influenced by ${planet} placement in ${house}th house`
    };
  }

  /**
   * Get health effects
   * @param {number} house - House placement
   * @param {string} planet - Lagna lord planet
   * @param {string} lagnaSign - Lagna sign
   * @returns {Object} - Health effects
   */
  static getHealthEffects(house, planet, lagnaSign) {
    const healthyPlacements = [1, 4, 5, 9, 10, 11];
    const challengingPlacements = [6, 8, 12];

    return {
      constitution: healthyPlacements.includes(house) ? 'generally strong' : 'requires attention',
      vulnerabilities: challengingPlacements.includes(house) ?
        ['potential health challenges', 'need for preventive care'] :
        ['generally robust health'],
      recommendations: ['balanced lifestyle', 'appropriate diet for ' + lagnaSign]
    };
  }

  /**
   * Get career effects
   * @param {number} house - House placement
   * @param {string} planet - Lagna lord planet
   * @returns {Object} - Career effects
   */
  static getCareerEffects(house, planet) {
    const careerFields = {
      'Sun': ['government', 'leadership', 'medicine', 'politics'],
      'Moon': ['hospitality', 'water-related', 'public service', 'caring professions'],
      'Mars': ['military', 'engineering', 'sports', 'real estate'],
      'Mercury': ['communication', 'commerce', 'writing', 'technology'],
      'Jupiter': ['teaching', 'law', 'spirituality', 'finance'],
      'Venus': ['arts', 'beauty', 'luxury goods', 'entertainment'],
      'Saturn': ['industry', 'mining', 'construction', 'research']
    };

    return {
      suitableFields: careerFields[planet] || ['versatile career options'],
      workStyle: house <= 6 ? 'collaborative' : 'independent',
      leadership: [1, 4, 7, 10].includes(house) ? 'strong leadership potential' : 'supportive role preferred',
      timing: house <= 6 ? 'early career establishment' : 'later career peak',
      success: [1, 4, 7, 10].includes(house) ? 'high potential for success' : 'moderate success with effort'
    };
  }

  /**
   * Get relationship effects
   * @param {number} house - House placement
   * @param {string} planet - Lagna lord planet
   * @returns {Object} - Relationship effects
   */
  static getRelationshipEffects(house, planet) {
    return {
      approach: house === 7 ? 'partnership-focused' : 'varies based on placement',
      compatibility: ['depends on partner\'s chart compatibility'],
      timing: 'relationship timing varies with planetary periods'
    };
  }

  /**
   * Get wealth effects
   * @param {number} house - House placement
   * @param {string} planet - Lagna lord planet
   * @returns {Object} - Wealth effects
   */
  static getWealthEffects(house, planet) {
    const wealthyPlacements = [1, 2, 5, 9, 11];

    return {
      potential: wealthyPlacements.includes(house) ? 'good wealth potential' : 'moderate wealth with effort',
      sources: house === 2 ? ['family wealth', 'savings'] :
               house === 11 ? ['business', 'investments'] :
               ['profession-based income'],
      stability: [1, 4, 10].includes(house) ? 'stable wealth' : 'variable wealth'
    };
  }

  /**
   * Analyze Dasha effects
   * @param {Object} lordPosition - Lagna lord position
   * @param {string} lagnaSign - Lagna sign
   * @returns {Object} - Dasha effects
   */
    static analyzeDashaEffects(lordPosition, lagnaSign) {
    const timing = this.getDashaTiming(lordPosition.planet);
    const effects = this.getMahadashaEffects(lordPosition.planet, lordPosition.house, lagnaSign);

    return {
      timing,
      mahadasha: effects,
      antardasha: { effects: 'Sub-period effects vary by planet', duration: 'Variable based on main planet' },
      description: 'Lagna lord dasha generally favorable for overall life progress',
      general: 'Lagna lord dasha generally favorable for overall life progress'
    };
  }

  /**
   * Get Dasha timing
   * @param {string} planet - Planet name
   * @returns {Object} - Dasha timing details
   */
    static getDashaTiming(planet) {
    const dashaDurations = {
      'Sun': 6, 'Moon': 10, 'Mars': 7, 'Mercury': 17,
      'Jupiter': 16, 'Venus': 20, 'Saturn': 19,
      'Rahu': 18, 'Ketu': 7
    };

    const sequence = ['Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury', 'Ketu', 'Venus'];

    return {
      duration: dashaDurations[planet],
      sequence: sequence.indexOf(planet) + 1,
      priority: dashaDurations[planet] > 15 ? 'high' : 'moderate',
      description: `${planet} Mahadasha lasts ${dashaDurations[planet]} years`
    };
  }

  /**
   * Get Mahadasha effects
   * @param {string} planet - Planet name
   * @param {number} house - House placement
   * @param {string} lagnaSign - Lagna sign
   * @returns {Object} - Mahadasha effects
   */
  static getMahadashaEffects(planet, house, lagnaSign) {
    return {
      overallTheme: `Focus on ${planet} related matters and ${house}th house significations`,
      keyAreas: this.getHouseSignifications(house),
      challenges: house === 6 || house === 8 || house === 12 ? ['Health challenges', 'Obstacles'] : ['Minor challenges'],
      opportunities: ['Personal growth', 'Achievement in key areas', 'Spiritual development'],
      timing: 'Effects strongest during middle period of dasha',
      results: 'Generally positive as lagna lord dasha'
    };
  }

  /**
   * Generate remedial measures
   * @param {Object} lordPosition - Lagna lord position
   * @param {Object} placementAnalysis - Analysis of placement strength
   * @returns {Object} - Remedial measures
   */
    static generateRemedialMeasures(lordPosition, placementAnalysis) {
    const gemstone = this.getGemstoneRemedy(lordPosition.planet);
    const mantra = this.getMantraRemedy(lordPosition.planet);
    const charity = this.getCharityRemedy(lordPosition.planet);
    const fasting = this.getFastingRemedy(lordPosition.planet);

    return {
      gemstone,
      mantra,
      charity,
      fasting,
      primaryRemedies: [gemstone, mantra],
      additionalRemedies: [charity, fasting],
      lifestyleChanges: ['Regular meditation', 'Healthy diet', 'Spiritual practices'],
      general: ['Strengthen lagna lord through appropriate remedies', 'Regular spiritual practices'],
      priority: placementAnalysis.overallStrength?.score < 50 ? 'High' :
                placementAnalysis.overallStrength?.score < 75 ? 'Medium' : 'Low'
    };
  }

  /**
   * Get gemstone remedy
   * @param {string} planet - Planet name
   * @returns {Object} - Gemstone details
   */
    static getGemstoneRemedy(planet) {
    const gemstones = {
      'Sun': { stone: 'Ruby', weight: '3-5 carats', metal: 'Gold', finger: 'Ring finger', day: 'Sunday' },
      'Moon': { stone: 'Pearl', weight: '4-6 carats', metal: 'Silver', finger: 'Little finger', day: 'Monday' },
      'Mars': { stone: 'Red Coral', weight: '5-8 carats', metal: 'Gold/Copper', finger: 'Ring finger', day: 'Tuesday' },
      'Mercury': { stone: 'Emerald', weight: '3-5 carats', metal: 'Gold', finger: 'Little finger', day: 'Wednesday' },
      'Jupiter': { stone: 'Yellow Sapphire', weight: '3-5 carats', metal: 'Gold', finger: 'Index finger', day: 'Thursday' },
      'Venus': { stone: 'Diamond', weight: '1-2 carats', metal: 'Silver/Platinum', finger: 'Middle finger', day: 'Friday' },
      'Saturn': { stone: 'Blue Sapphire', weight: '3-5 carats', metal: 'Silver', finger: 'Middle finger', day: 'Saturday' }
    };

    return gemstones[planet] || { stone: 'Consult astrologer', weight: 'Varies', metal: 'Varies', finger: 'Varies', day: 'Any day' };
  }

  /**
   * Get mantra remedy
   * @param {string} planet - Planet name
   * @returns {Object} - Mantra details
   */
    static getMantraRemedy(planet) {
    const mantras = {
      'Sun': { mantra: 'Om Hraam Hreem Hraum Sah Suryaya Namaha', repetitions: 7000, days: 'Sunday', timing: 'sunrise', duration: '40 days' },
      'Moon': { mantra: 'Om Shraam Shreem Shraum Sah Chandraya Namaha', repetitions: 11000, days: 'Monday', timing: 'evening', duration: '40 days' },
      'Mars': { mantra: 'Om Kraam Kreem Kraum Sah Bhaumaya Namaha', repetitions: 10000, days: 'Tuesday', timing: 'morning', duration: '40 days' },
      'Mercury': { mantra: 'Om Braam Breem Braum Sah Budhaya Namaha', repetitions: 17000, days: 'Wednesday', timing: 'morning', duration: '40 days' },
      'Jupiter': { mantra: 'Om Graam Greem Graum Sah Gurave Namaha', repetitions: 16000, days: 'Thursday', timing: 'morning', duration: '40 days' },
      'Venus': { mantra: 'Om Draam Dreem Draum Sah Shukraya Namaha', repetitions: 20000, days: 'Friday', timing: 'evening', duration: '40 days' },
      'Saturn': { mantra: 'Om Praam Preem Praum Sah Shanaischaraya Namaha', repetitions: 19000, days: 'Saturday', timing: 'evening', duration: '40 days' }
    };

    return mantras[planet] || { mantra: 'Om Namah Shivaya', repetitions: 11000, days: 'Any day', timing: 'any time', duration: '40 days' };
  }

  /**
   * Get charity remedy
   * @param {string} planet - Planet name
   * @returns {Object} - Charity recommendations
   */
  static getCharityRemedy(planet) {
    const charities = {
      'Sun': { items: ['wheat', 'jaggery', 'red cloth'], recipients: ['temples', 'poor'], timing: 'Sunday morning' },
      'Moon': { items: ['rice', 'milk', 'white cloth'], recipients: ['women', 'children'], timing: 'Monday evening' },
      'Mars': { items: ['red lentils', 'sweets', 'red items'], recipients: ['soldiers', 'workers'], timing: 'Tuesday' },
      'Mercury': { items: ['green vegetables', 'books', 'pens'], recipients: ['students', 'scholars'], timing: 'Wednesday' },
      'Jupiter': { items: ['yellow items', 'turmeric', 'books'], recipients: ['teachers', 'priests'], timing: 'Thursday' },
      'Venus': { items: ['white items', 'flowers', 'perfume'], recipients: ['artists', 'women'], timing: 'Friday' },
      'Saturn': { items: ['black items', 'sesame oil', 'iron'], recipients: ['workers', 'elderly'], timing: 'Saturday' }
    };

    return charities[planet] || { items: ['food', 'clothes'], recipients: ['needy'], timing: 'Any auspicious day' };
  }

  /**
   * Get fasting remedy
   * @param {string} planet - Planet name
   * @returns {Object} - Fasting recommendations
   */
    static getFastingRemedy(planet) {
    const fasting = {
      'Sun': { day: 'Sunday', type: 'sunrise to sunset', food: 'avoid salt', duration: 'weekly', foods: ['fruits', 'milk'] },
      'Moon': { day: 'Monday', type: 'evening only', food: 'white foods only', duration: 'weekly', foods: ['milk', 'rice', 'white foods'] },
      'Mars': { day: 'Tuesday', type: 'during day', food: 'avoid red foods', duration: 'weekly', foods: ['simple vegetarian'] },
      'Mercury': { day: 'Wednesday', type: 'partial fast', food: 'green foods only', duration: 'weekly', foods: ['green vegetables', 'fruits'] },
      'Jupiter': { day: 'Thursday', type: 'evening only', food: 'yellow foods', duration: 'weekly', foods: ['turmeric milk', 'bananas'] },
      'Venus': { day: 'Friday', type: 'partial fast', food: 'white foods', duration: 'weekly', foods: ['white foods', 'sweets'] },
      'Saturn': { day: 'Saturday', type: 'during day', food: 'simple vegetarian', duration: 'weekly', foods: ['simple vegetarian'] }
    };

    return fasting[planet] || { day: 'Any day', type: 'partial', food: 'simple vegetarian', duration: 'weekly', foods: ['simple foods'] };
  }

  /**
   * Check for Parivartana Yoga
   * @param {Object} lordPosition - Lagna lord position
   * @param {Object} chart - Chart data
   * @returns {Object} - Parivartana Yoga status
   */
  static checkParivartanaYoga(lordPosition, chart) {
    // Simplified implementation
    return {
      isPresent: false,
      type: null,
      description: 'Parivartana Yoga analysis requires sign lord exchange calculation'
    };
  }

  /**
   * Check Gandanta degrees
   * @param {number} longitude - Planet longitude
   * @param {string} sign - Sign name
   * @returns {Object} - Gandanta status
   */
  static checkGandantaDegrees(longitude, sign) {
    const gandantaRanges = [
      { signs: ['Pisces', 'Aries'], range: [357, 3] },
      { signs: ['Cancer', 'Leo'], range: [117, 123] },
      { signs: ['Scorpio', 'Sagittarius'], range: [237, 243] }
    ];

    // Simplified check
    return {
      isGandanta: false,
      type: null,
      description: 'Gandanta degree analysis requires precise degree calculation'
    };
  }

  /**
   * Check Pushkara Bhaga degrees
   * @param {number} longitude - Planet longitude
   * @param {string} sign - Sign name
   * @returns {Object} - Pushkara Bhaga status
   */
  static checkPushkaraBhagaDegrees(longitude, sign) {
    // Simplified implementation
    return {
      isPushkara: false,
      degree: null,
      description: 'Pushkara Bhaga analysis requires specific degree calculations'
    };
  }

  /**
   * Get Navamsa sign
   * @param {number} longitude - Planet longitude
   * @param {string} rasiSign - Rasi sign
   * @returns {string} - Navamsa sign
   */
  static getNavamsaSign(longitude, rasiSign) {
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                   'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

    // Proper Navamsa calculation based on longitude
    // Each sign (30°) is divided into 9 parts (3°20' each)
    // Normalize longitude to 0-360 range
    const normalizedLongitude = ((longitude % 360) + 360) % 360;

    // Get the sign index (0-11) from longitude
    const signIndex = Math.floor(normalizedLongitude / 30);

    // Get degrees within the sign (0-30)
    const degreeInSign = normalizedLongitude % 30;

    // Calculate Navamsa position within the sign (0-8)
    const navamsaPosition = Math.floor(degreeInSign / (30/9));

    // Calculate Navamsa sign based on sign type and position
    let navamsaSignIndex;

    if (signIndex % 3 === 0) { // Fire signs (Aries, Leo, Sagittarius)
      navamsaSignIndex = (signIndex + navamsaPosition) % 12;
    } else if (signIndex % 3 === 1) { // Earth signs (Taurus, Virgo, Capricorn)
      navamsaSignIndex = (signIndex + 8 + navamsaPosition) % 12;
    } else { // Air/Water signs (Gemini, Cancer, Libra, Scorpio, Aquarius, Pisces)
      navamsaSignIndex = (signIndex + 4 + navamsaPosition) % 12;
    }

    return signs[navamsaSignIndex];
  }

  /**
   * Generate recommendations
   * @param {Object} lordPosition - Lagna lord position
   * @param {Object} dignity - Dignity analysis
   * @param {Object} houseEffects - House effects analysis
   * @returns {Array} - Array of recommendations
   */
  static generateRecommendations(lordPosition, dignity, houseEffects) {
    const recommendations = [];

    if (dignity.strength < 60) {
      recommendations.push('Strengthen lagna lord through appropriate remedies');
    }

    if (houseEffects.effects.strength > 70) {
      recommendations.push('Capitalize on strong lagna lord placement');
    }

    recommendations.push(`Focus on ${lordPosition.planet} related activities`);
    recommendations.push('Regular meditation and spiritual practices');

    return recommendations;
  }

  /**
   * Get ordinal suffix
   * @param {number} num - Number
   * @returns {string} - Number with ordinal suffix
   */
  static getOrdinalSuffix(num) {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return num + 'st';
    if (j === 2 && k !== 12) return num + 'nd';
    if (j === 3 && k !== 13) return num + 'rd';
    return num + 'th';
  }
}

module.exports = LagnaLordAnalyzer;
