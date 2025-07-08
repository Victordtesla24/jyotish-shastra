/**
 * Twelve House Analyzer
 * Comprehensive analysis of all 12 houses (bhavas) in Vedic astrology
 * Based on classical principles from BPHS and other authoritative texts
 */

class TwelveHouseAnalyzer {
  constructor() {
    this.initializeHouseData();
  }

  /**
   * Initialize house significations and analysis rules
   */
  initializeHouseData() {
    this.houseSignifications = {
      1: {
        name: 'Lagna Bhava (Self)',
        primarySignifications: ['Personality', 'Physical body', 'General health', 'Vitality', 'Self-expression'],
        secondarySignifications: ['Head', 'Brain', 'Appearance', 'Early childhood', 'Character'],
        karaka: 'Sun',
        nature: 'Kendra (Angular)',
        element: 'Fire',
        bodyParts: ['Head', 'Brain', 'Face'],
        lifeAreas: ['Identity', 'Health', 'Personality', 'Life purpose']
      },
      2: {
        name: 'Dhana Bhava (Wealth)',
        primarySignifications: ['Wealth', 'Family', 'Speech', 'Food', 'Values'],
        secondarySignifications: ['Savings', 'Precious metals', 'Right eye', 'Education', 'Death'],
        karaka: 'Jupiter',
        nature: 'Maraka (Death-dealing)',
        element: 'Earth',
        bodyParts: ['Face', 'Right eye', 'Throat', 'Neck'],
        lifeAreas: ['Finances', 'Family relations', 'Communication', 'Values']
      },
      3: {
        name: 'Parakrama Bhava (Courage)',
        primarySignifications: ['Siblings', 'Courage', 'Communication', 'Short journeys', 'Efforts'],
        secondarySignifications: ['Hands', 'Arms', 'Writing', 'Arts', 'Music'],
        karaka: 'Mars',
        nature: 'Upachaya (Growing)',
        element: 'Air',
        bodyParts: ['Arms', 'Hands', 'Shoulders', 'Right ear'],
        lifeAreas: ['Siblings', 'Communication', 'Courage', 'Initiative']
      },
      4: {
        name: 'Sukha Bhava (Happiness)',
        primarySignifications: ['Mother', 'Home', 'Property', 'Vehicles', 'Education'],
        secondarySignifications: ['Heart', 'Emotions', 'Comforts', 'Real estate', 'Homeland'],
        karaka: 'Moon',
        nature: 'Kendra (Angular)',
        element: 'Water',
        bodyParts: ['Chest', 'Heart', 'Lungs', 'Breasts'],
        lifeAreas: ['Home', 'Mother', 'Property', 'Emotional foundation']
      },
      5: {
        name: 'Putra Bhava (Children)',
        primarySignifications: ['Children', 'Creativity', 'Intelligence', 'Education', 'Romance'],
        secondarySignifications: ['Stomach', 'Speculation', 'Past-life merit', 'Mantras', 'Devotion'],
        karaka: 'Jupiter',
        nature: 'Trikona (Trinal)',
        element: 'Fire',
        bodyParts: ['Stomach', 'Upper abdomen', 'Heart'],
        lifeAreas: ['Children', 'Creativity', 'Intelligence', 'Romance']
      },
      6: {
        name: 'Ripu/Roga Bhava (Enemies/Diseases)',
        primarySignifications: ['Diseases', 'Enemies', 'Debts', 'Service', 'Daily work'],
        secondarySignifications: ['Digestive system', 'Immune system', 'Competition', 'Legal disputes'],
        karaka: 'Mars',
        nature: 'Dusthana (Malefic) / Upachaya (Growing)',
        element: 'Earth',
        bodyParts: ['Lower abdomen', 'Intestines', 'Kidney'],
        lifeAreas: ['Health', 'Service', 'Daily routine', 'Obstacles']
      },
      7: {
        name: 'Kalatra Bhava (Spouse)',
        primarySignifications: ['Marriage', 'Spouse', 'Partnerships', 'Public relations', 'Business'],
        secondarySignifications: ['Lower back', 'Reproductive organs', 'Trade', 'Foreign travel'],
        karaka: 'Venus',
        nature: 'Kendra (Angular) / Maraka (Death-dealing)',
        element: 'Air',
        bodyParts: ['Lower back', 'Kidneys', 'Reproductive organs'],
        lifeAreas: ['Marriage', 'Partnerships', 'Public image', 'Business']
      },
      8: {
        name: 'Mrityu Bhava (Death)',
        primarySignifications: ['Longevity', 'Transformation', 'Occult', 'Inheritance', 'Sudden events'],
        secondarySignifications: ['Genitals', 'Chronic diseases', 'Research', 'Mysticism', 'Accidents'],
        karaka: 'Saturn',
        nature: 'Dusthana (Malefic)',
        element: 'Water',
        bodyParts: ['Genitals', 'Anus', 'Pelvis'],
        lifeAreas: ['Transformation', 'Hidden knowledge', 'Inheritance', 'Crises']
      },
      9: {
        name: 'Dharma Bhava (Religion)',
        primarySignifications: ['Father', 'Guru', 'Religion', 'Philosophy', 'Higher education'],
        secondarySignifications: ['Thighs', 'Fortune', 'Long journeys', 'Spiritual practices'],
        karaka: 'Jupiter',
        nature: 'Trikona (Trinal)',
        element: 'Fire',
        bodyParts: ['Thighs', 'Hips'],
        lifeAreas: ['Father', 'Spirituality', 'Higher learning', 'Fortune']
      },
      10: {
        name: 'Karma Bhava (Career)',
        primarySignifications: ['Career', 'Profession', 'Status', 'Reputation', 'Authority'],
        secondarySignifications: ['Knees', 'Government', 'Public image', 'Achievement'],
        karaka: 'Sun',
        nature: 'Kendra (Angular)',
        element: 'Earth',
        bodyParts: ['Knees', 'Joints'],
        lifeAreas: ['Career', 'Status', 'Reputation', 'Authority']
      },
      11: {
        name: 'Labha Bhava (Gains)',
        primarySignifications: ['Income', 'Gains', 'Friends', 'Elder siblings', 'Fulfillment of desires'],
        secondarySignifications: ['Calves', 'Ankles', 'Left ear', 'Social networks'],
        karaka: 'Jupiter',
        nature: 'Upachaya (Growing)',
        element: 'Air',
        bodyParts: ['Calves', 'Ankles', 'Left ear'],
        lifeAreas: ['Income', 'Friends', 'Gains', 'Social networks']
      },
      12: {
        name: 'Vyaya Bhava (Losses)',
        primarySignifications: ['Expenses', 'Losses', 'Foreign travel', 'Spirituality', 'Liberation'],
        secondarySignifications: ['Feet', 'Left eye', 'Sleep', 'Bed pleasures', 'Confinement'],
        karaka: 'Saturn',
        nature: 'Dusthana (Malefic)',
        element: 'Water',
        bodyParts: ['Feet', 'Left eye'],
        lifeAreas: ['Expenses', 'Spirituality', 'Foreign connections', 'Liberation']
      }
    };

    // House lord relationships
    this.houseLordships = {
      'Aries': { 1: 'Mars', 2: 'Venus', 3: 'Mercury', 4: 'Moon', 5: 'Sun', 6: 'Mercury', 7: 'Venus', 8: 'Mars', 9: 'Jupiter', 10: 'Saturn', 11: 'Saturn', 12: 'Jupiter' },
      'Taurus': { 1: 'Venus', 2: 'Mercury', 3: 'Moon', 4: 'Sun', 5: 'Mercury', 6: 'Venus', 7: 'Mars', 8: 'Jupiter', 9: 'Saturn', 10: 'Saturn', 11: 'Jupiter', 12: 'Mars' },
      'Gemini': { 1: 'Mercury', 2: 'Moon', 3: 'Sun', 4: 'Mercury', 5: 'Venus', 6: 'Mars', 7: 'Jupiter', 8: 'Saturn', 9: 'Saturn', 10: 'Jupiter', 11: 'Mars', 12: 'Venus' },
      'Cancer': { 1: 'Moon', 2: 'Sun', 3: 'Mercury', 4: 'Venus', 5: 'Mars', 6: 'Jupiter', 7: 'Saturn', 8: 'Saturn', 9: 'Jupiter', 10: 'Mars', 11: 'Venus', 12: 'Mercury' },
      'Leo': { 1: 'Sun', 2: 'Mercury', 3: 'Venus', 4: 'Mars', 5: 'Jupiter', 6: 'Saturn', 7: 'Saturn', 8: 'Jupiter', 9: 'Mars', 10: 'Venus', 11: 'Mercury', 12: 'Moon' },
      'Virgo': { 1: 'Mercury', 2: 'Venus', 3: 'Mars', 4: 'Jupiter', 5: 'Saturn', 6: 'Saturn', 7: 'Jupiter', 8: 'Mars', 9: 'Venus', 10: 'Mercury', 11: 'Moon', 12: 'Sun' },
      'Libra': { 1: 'Venus', 2: 'Mars', 3: 'Jupiter', 4: 'Saturn', 5: 'Saturn', 6: 'Jupiter', 7: 'Mars', 8: 'Venus', 9: 'Mercury', 10: 'Moon', 11: 'Sun', 12: 'Mercury' },
      'Scorpio': { 1: 'Mars', 2: 'Jupiter', 3: 'Saturn', 4: 'Saturn', 5: 'Jupiter', 6: 'Mars', 7: 'Venus', 8: 'Mercury', 9: 'Moon', 10: 'Sun', 11: 'Mercury', 12: 'Venus' },
      'Sagittarius': { 1: 'Jupiter', 2: 'Saturn', 3: 'Saturn', 4: 'Jupiter', 5: 'Mars', 6: 'Venus', 7: 'Mercury', 8: 'Moon', 9: 'Sun', 10: 'Mercury', 11: 'Venus', 12: 'Mars' },
      'Capricorn': { 1: 'Saturn', 2: 'Saturn', 3: 'Jupiter', 4: 'Mars', 5: 'Venus', 6: 'Mercury', 7: 'Moon', 8: 'Sun', 9: 'Mercury', 10: 'Venus', 11: 'Mars', 12: 'Jupiter' },
      'Aquarius': { 1: 'Saturn', 2: 'Jupiter', 3: 'Mars', 4: 'Venus', 5: 'Mercury', 6: 'Moon', 7: 'Sun', 8: 'Mercury', 9: 'Venus', 10: 'Mars', 11: 'Jupiter', 12: 'Saturn' },
      'Pisces': { 1: 'Jupiter', 2: 'Mars', 3: 'Venus', 4: 'Mercury', 5: 'Moon', 6: 'Sun', 7: 'Mercury', 8: 'Venus', 9: 'Mars', 10: 'Jupiter', 11: 'Saturn', 12: 'Saturn' }
    };
  }

  /**
   * Perform comprehensive analysis of all 12 houses
   * @param {Object} chart - Complete birth chart
   * @returns {Object} Detailed house analysis
   */
  analyzeAllHouses(chart) {
    const analysis = {
      houseAnalyses: {},
      strongestHouses: [],
      weakestHouses: [],
      kendraAnalysis: this.analyzeKendras(chart),
      trikonaAnalysis: this.analyzeTrikonas(chart),
      dusthanaAnalysis: this.analyzeDusthanas(chart),
      upachayaAnalysis: this.analyzeUpachayas(chart),
      crossHouseConnections: this.analyzeCrossHouseConnections(chart),
      overallHouseStrength: 0,
      recommendations: []
    };

    let totalStrength = 0;

    // Analyze each house individually
    for (let houseNum = 1; houseNum <= 12; houseNum++) {
      const houseAnalysis = this.analyzeIndividualHouse(houseNum, chart);
      analysis.houseAnalyses[houseNum] = houseAnalysis;
      totalStrength += houseAnalysis.overallStrength;

      // Categorize by strength
      if (houseAnalysis.overallStrength >= 7) {
        analysis.strongestHouses.push({
          house: houseNum,
          strength: houseAnalysis.overallStrength,
          name: this.houseSignifications[houseNum].name
        });
      } else if (houseAnalysis.overallStrength <= 3) {
        analysis.weakestHouses.push({
          house: houseNum,
          strength: houseAnalysis.overallStrength,
          name: this.houseSignifications[houseNum].name
        });
      }
    }

    analysis.overallHouseStrength = totalStrength / 12;
    analysis.recommendations = this.generateHouseRecommendations(analysis);

    return analysis;
  }

  /**
   * Analyze individual house in detail
   * @param {number} houseNumber - House number (1-12)
   * @param {Object} chart - Birth chart
   * @returns {Object} Detailed house analysis
   */
  analyzeIndividualHouse(houseNumber, chart) {
    const houseData = this.houseSignifications[houseNumber];
    const lagnaSign = this.getLagnaSign(chart);
    const houseLord = this.getHouseLord(houseNumber, lagnaSign);
    const occupants = this.getHouseOccupants(houseNumber, chart);
    const aspects = this.getAspectsToHouse(houseNumber, chart);

    const analysis = {
      houseNumber: houseNumber,
      houseName: houseData.name,
      signOnCusp: this.getSignOnHouse(houseNumber, chart),
      houseLord: houseLord,
      houseLordPlacement: this.getHouseLordPlacement(houseLord, chart),
      occupants: occupants,
      aspects: aspects,
      significations: houseData,
      lordStrength: this.calculatePlanetStrength(houseLord, chart),
      occupantEffects: this.analyzeOccupantEffects(occupants, houseNumber, chart),
      aspectEffects: this.analyzeAspectEffects(aspects, houseNumber),
      overallStrength: 0,
      beneficInfluences: [],
      maleficInfluences: [],
      predictions: [],
      remedies: []
    };

    // Calculate overall house strength
    analysis.overallStrength = this.calculateHouseStrength(analysis);

    // Generate predictions and remedies
    analysis.predictions = this.generateHousePredictions(analysis, chart);
    analysis.remedies = this.generateHouseRemedies(analysis);

    return analysis;
  }

  /**
   * Calculate house strength based on multiple factors
   * @param {Object} houseAnalysis - House analysis object
   * @returns {number} House strength (1-10 scale)
   */
  calculateHouseStrength(houseAnalysis) {
    let strength = 5; // Neutral baseline

    // House lord strength (30% weightage)
    strength += (houseAnalysis.lordStrength - 1) * 3;

    // Occupant effects (25% weightage)
    for (const occupant of houseAnalysis.occupants) {
      const planetStrength = this.calculatePlanetStrength(occupant.planet, null);
      if (occupant.dignity === 'exalted') {
        strength += 2;
      } else if (occupant.dignity === 'debilitated') {
        strength -= 2;
      } else if (occupant.dignity === 'own') {
        strength += 1;
      }

      // Natural benefic/malefic consideration
      if (['Jupiter', 'Venus', 'Mercury', 'Moon'].includes(occupant.planet)) {
        strength += 0.5;
      } else if (['Saturn', 'Mars', 'Rahu', 'Ketu'].includes(occupant.planet)) {
        strength -= 0.5;
      }
    }

    // Aspect effects (20% weightage)
    for (const aspect of houseAnalysis.aspects) {
      if (['Jupiter', 'Venus'].includes(aspect.planet)) {
        strength += 1;
      } else if (['Saturn', 'Mars', 'Rahu'].includes(aspect.planet)) {
        strength -= 0.5;
      }
    }

    // House lord placement (25% weightage)
    const lordPlacement = houseAnalysis.houseLordPlacement;
    if (lordPlacement) {
      if ([1, 4, 7, 10].includes(lordPlacement.house)) { // Kendra
        strength += 1;
      } else if ([1, 5, 9].includes(lordPlacement.house)) { // Trikona
        strength += 1.5;
      } else if ([6, 8, 12].includes(lordPlacement.house)) { // Dusthana
        strength -= 1;
      } else if ([3, 6, 10, 11].includes(lordPlacement.house)) { // Upachaya
        strength += 0.5;
      }
    }

    return Math.max(1, Math.min(10, strength));
  }

  /**
   * Analyze Kendra houses (1, 4, 7, 10)
   */
  analyzeKendras(chart) {
    const kendras = [1, 4, 7, 10];
    const analysis = {
      houses: kendras,
      name: 'Kendra Houses (Angular)',
      significance: 'Foundation of life - personality, home, relationships, career',
      strength: 0,
      strongKendras: [],
      weakKendras: [],
      kendraConnections: []
    };

    let totalStrength = 0;
    for (const house of kendras) {
      const houseStrength = this.calculateIndividualHouseStrength(house, chart);
      totalStrength += houseStrength;

      if (houseStrength >= 7) {
        analysis.strongKendras.push(house);
      } else if (houseStrength <= 3) {
        analysis.weakKendras.push(house);
      }
    }

    analysis.strength = totalStrength / 4;
    analysis.kendraConnections = this.findKendraLordConnections(chart);

    return analysis;
  }

  /**
   * Analyze Trikona houses (1, 5, 9)
   */
  analyzeTrikonas(chart) {
    const trikonas = [1, 5, 9];
    const analysis = {
      houses: trikonas,
      name: 'Trikona Houses (Trinal)',
      significance: 'Dharma and fortune - self, creativity/children, father/dharma',
      strength: 0,
      strongTrikonas: [],
      weakTrikonas: [],
      trikonaConnections: []
    };

    let totalStrength = 0;
    for (const house of trikonas) {
      const houseStrength = this.calculateIndividualHouseStrength(house, chart);
      totalStrength += houseStrength;

      if (houseStrength >= 7) {
        analysis.strongTrikonas.push(house);
      } else if (houseStrength <= 3) {
        analysis.weakTrikonas.push(house);
      }
    }

    analysis.strength = totalStrength / 3;
    analysis.trikonaConnections = this.findTrikonaLordConnections(chart);

    return analysis;
  }

  /**
   * Analyze Dusthana houses (6, 8, 12)
   */
  analyzeDusthanas(chart) {
    const dusthanas = [6, 8, 12];
    const analysis = {
      houses: dusthanas,
      name: 'Dusthana Houses (Malefic)',
      significance: 'Challenges and transformation - diseases/enemies, death/occult, losses/spirituality',
      strength: 0,
      activatedDusthanas: [],
      problematicDusthanas: [],
      dusthanaConnections: []
    };

    let totalActivation = 0;
    for (const house of dusthanas) {
      const houseActivation = this.calculateDusthanaActivation(house, chart);
      totalActivation += houseActivation;

      if (houseActivation >= 5) {
        analysis.activatedDusthanas.push(house);
      }
      if (houseActivation >= 7) {
        analysis.problematicDusthanas.push(house);
      }
    }

    analysis.strength = totalActivation / 3;
    analysis.dusthanaConnections = this.findDusthanaConnections(chart);

    return analysis;
  }

  /**
   * Analyze Upachaya houses (3, 6, 10, 11)
   */
  analyzeUpachayas(chart) {
    const upachayas = [3, 6, 10, 11];
    const analysis = {
      houses: upachayas,
      name: 'Upachaya Houses (Growing)',
      significance: 'Areas that improve with time - courage, service, career, gains',
      strength: 0,
      strongUpachayas: [],
      growthPotential: []
    };

    let totalStrength = 0;
    for (const house of upachayas) {
      const houseStrength = this.calculateIndividualHouseStrength(house, chart);
      totalStrength += houseStrength;

      if (houseStrength >= 6) {
        analysis.strongUpachayas.push(house);
      }

      // Upachaya houses with malefics can actually be beneficial
      const maleficsInHouse = this.getMaleficsInHouse(house, chart);
      if (maleficsInHouse.length > 0) {
        analysis.growthPotential.push({
          house: house,
          malefics: maleficsInHouse,
          potential: 'Growth through challenges'
        });
      }
    }

    analysis.strength = totalStrength / 4;

    return analysis;
  }

  /**
   * Analyze cross-house connections and yogas
   */
  analyzeCrossHouseConnections(chart) {
    const connections = {
      kendraTrikonaYogas: this.findKendraTrikonaYogas(chart),
      houseLordExchanges: this.findHouseLordExchanges(chart),
      aspectConnections: this.findSignificantAspectConnections(chart),
      mutualReceptions: this.findMutualReceptions(chart)
    };

    return connections;
  }

  /**
   * Helper methods for detailed analysis
   */
  getLagnaSign(chart) {
    return chart.ascendant ? Math.floor(chart.ascendant.longitude / 30) : 0;
  }

  getSignName(signNumber) {
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                   'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    return signs[signNumber];
  }

  getHouseLord(houseNumber, lagnaSign) {
    const lagnaSignName = this.getSignName(lagnaSign);
    return this.houseLordships[lagnaSignName][houseNumber];
  }

  getSignOnHouse(houseNumber, chart) {
    const lagnaSign = this.getLagnaSign(chart);
    const signNumber = (lagnaSign + houseNumber - 1) % 12;
    return this.getSignName(signNumber);
  }

  getHouseOccupants(houseNumber, chart) {
    const occupants = [];
    const lagnaSign = this.getLagnaSign(chart);

    if (chart.planetaryPositions) {
      for (const [planet, data] of Object.entries(chart.planetaryPositions)) {
        if (data && data.longitude !== undefined) {
          const planetHouse = Math.floor(data.longitude / 30);
          const actualHouse = ((planetHouse - lagnaSign + 12) % 12) + 1;

          if (actualHouse === houseNumber) {
            occupants.push({
              planet: planet,
              longitude: data.longitude,
              dignity: this.getPlanetDignity(planet, planetHouse),
              effects: this.getPlanetEffectsInHouse(planet, houseNumber)
            });
          }
        }
      }
    }

    return occupants;
  }

  getAspectsToHouse(houseNumber, chart) {
    const aspects = [];
    const lagnaSign = this.getLagnaSign(chart);

    if (chart.planetaryPositions) {
      for (const [planet, data] of Object.entries(chart.planetaryPositions)) {
        if (data && data.longitude !== undefined) {
          const planetHouse = Math.floor(data.longitude / 30);
          const actualPlanetHouse = ((planetHouse - lagnaSign + 12) % 12) + 1;

          // Calculate aspects from planet to target house
          const aspectData = this.calculateAspectToHouse(actualPlanetHouse, houseNumber, planet);

          if (aspectData.hasAspect) {
            aspects.push({
              planet: planet,
              fromHouse: actualPlanetHouse,
              toHouse: houseNumber,
              type: aspectData.aspectType,
              strength: aspectData.strength,
              effect: this.getAspectEffect(planet, houseNumber)
            });
          }
        }
      }
    }

    return aspects;
  }

  getHouseLordPlacement(planet, chart) {
    if (!chart.planetaryPositions || !chart.planetaryPositions[planet]) {
      return null;
    }

    const planetData = chart.planetaryPositions[planet];
    const lagnaSign = this.getLagnaSign(chart);
    const planetSign = Math.floor(planetData.longitude / 30);
    const houseNumber = ((planetSign - lagnaSign + 12) % 12) + 1;

    return {
      house: houseNumber,
      sign: this.getSignName(planetSign),
      longitude: planetData.longitude
    };
  }

  calculatePlanetStrength(planet, chart) {
    let strength = 0;
    const planetData = chart.planetaryPositions[planet];

    if (!planetData) return 0;

    const planetSign = Math.floor(planetData.longitude / 30);
    const planetDegree = planetData.longitude % 30;

    // Dignity-based strength
    const dignity = this.getPlanetDignity(planet, planetSign);
    const dignityStrength = {
      'exalted': 10,
      'own': 8,
      'friend': 6,
      'neutral': 4,
      'enemy': 2,
      'debilitated': 1
    };
    strength += dignityStrength[dignity] || 4;

    // Degree-based strength (avoid gandanta degrees)
    if ((planetDegree >= 3 && planetDegree <= 27)) {
      strength += 2; // Good degrees
    } else {
      strength -= 1; // Gandanta or edge degrees
    }

    // Retrograde strength
    if (planetData.isRetrograde) {
      strength += 1; // Retrograde planets gain strength
    }

    // Combust check
    if (this.isPlanetCombust(planet, chart)) {
      strength -= 3; // Significant strength reduction
    }

    // Aspect strength from benefics
    const aspectingBenefics = this.getBeneficAspects(planet, chart);
    strength += aspectingBenefics.length * 0.5;

    // Aspect weakness from malefics
    const aspectingMalefics = this.getMaleficAspects(planet, chart);
    strength -= aspectingMalefics.length * 0.3;

    return Math.max(0, Math.min(15, strength));
  }

  calculateIndividualHouseStrength(houseNumber, chart) {
    let houseStrength = 0;

    // Get house lord and calculate its strength
    const lagnaSign = this.getLagnaSign(chart);
    const houseLord = this.getHouseLord(houseNumber, lagnaSign);
    const lordStrength = this.calculatePlanetStrength(houseLord, chart);
    houseStrength += lordStrength * 0.4; // 40% weightage to house lord

    // Calculate strength from occupants
    const occupants = this.getHouseOccupants(houseNumber, chart);
    let occupantStrength = 0;
    for (const occupant of occupants) {
      const planetStrength = this.calculatePlanetStrength(occupant.planet, chart);
      const beneficMalefic = this.getPlanetNature(occupant.planet);

      if (beneficMalefic === 'benefic') {
        occupantStrength += planetStrength * 0.8;
      } else if (beneficMalefic === 'malefic') {
        // Malefics in certain houses can be good (Upachaya houses)
        if ([3, 6, 10, 11].includes(houseNumber)) {
          occupantStrength += planetStrength * 0.6;
        } else {
          occupantStrength += planetStrength * 0.3;
        }
      } else {
        occupantStrength += planetStrength * 0.5; // Neutral planets
      }
    }
    houseStrength += occupantStrength * 0.3; // 30% weightage to occupants

    // Calculate strength from aspects
    const aspects = this.getAspectsToHouse(houseNumber, chart);
    let aspectStrength = 0;
    for (const aspect of aspects) {
      const planetNature = this.getPlanetNature(aspect.planet);
      if (planetNature === 'benefic') {
        aspectStrength += aspect.strength * 0.5;
      } else {
        aspectStrength -= aspect.strength * 0.3;
      }
    }
    houseStrength += aspectStrength * 0.2; // 20% weightage to aspects

    // House lord placement strength
    const lordPlacement = this.getHouseLordPlacement(houseLord, chart);
    if (lordPlacement) {
      if ([1, 4, 7, 10].includes(lordPlacement.house)) {
        houseStrength += 1; // Kendra placement
      } else if ([5, 9].includes(lordPlacement.house)) {
        houseStrength += 1.5; // Trikona placement
      } else if ([6, 8, 12].includes(lordPlacement.house)) {
        houseStrength -= 1; // Dusthana placement
      }
    }

    // Special considerations for specific houses
    houseStrength += this.getSpecialHouseConsiderations(houseNumber, chart);

    return Math.max(0, Math.min(10, houseStrength));
  }

  calculateDusthanaActivation(houseNumber, chart) {
    // Calculate how activated/problematic a dusthana house is
    return 3; // Default activation
  }

  getMaleficsInHouse(houseNumber, chart) {
    const malefics = ['Mars', 'Saturn', 'Rahu', 'Ketu'];
    const occupants = this.getHouseOccupants(houseNumber, chart);
    return occupants.filter(occ => malefics.includes(occ.planet)).map(occ => occ.planet);
  }

  getPlanetDignity(planet, sign) {
    const dignityTables = {
      'sun': { own: [4], exalted: [0], debilitated: [6], friend: [0, 2, 4, 8], enemy: [1, 6, 10] },
      'moon': { own: [3], exalted: [1], debilitated: [7], friend: [1, 3, 5, 11], enemy: [0, 4, 7, 9] },
      'mars': { own: [0, 7], exalted: [9], debilitated: [3], friend: [0, 3, 4, 7, 8], enemy: [1, 2, 5, 6] },
      'mercury': { own: [2, 5], exalted: [5], debilitated: [11], friend: [1, 2, 5, 6, 10], enemy: [0, 3, 7, 8] },
      'jupiter': { own: [8, 11], exalted: [3], debilitated: [9], friend: [0, 3, 4, 8, 11], enemy: [1, 2, 5, 9] },
      'venus': { own: [1, 6], exalted: [11], debilitated: [5], friend: [1, 2, 6, 9, 10], enemy: [0, 4, 7] },
      'saturn': { own: [9, 10], exalted: [6], debilitated: [0], friend: [1, 2, 6, 9, 10], enemy: [0, 3, 4] }
    };

    const planetTable = dignityTables[planet.toLowerCase()];
    if (!planetTable) return 'neutral';

    if (planetTable.own.includes(sign)) return 'own';
    if (planetTable.exalted.includes(sign)) return 'exalted';
    if (planetTable.debilitated.includes(sign)) return 'debilitated';
    if (planetTable.friend.includes(sign)) return 'friend';
    if (planetTable.enemy.includes(sign)) return 'enemy';

    return 'neutral';
  }

  getPlanetEffectsInHouse(planet, houseNumber) {
    const effects = {
      'Sun': {
        1: ['Strong personality', 'Leadership qualities', 'Good health'],
        10: ['Career success', 'Government favor', 'Authority position']
      },
      'Moon': {
        1: ['Emotional nature', 'Popularity', 'Changeable personality'],
        4: ['Mother\'s blessings', 'Property gains', 'Emotional stability']
      }
    };

    return effects[planet] && effects[planet][houseNumber]
      ? effects[planet][houseNumber]
      : [`${planet} effects in ${houseNumber}th house`];
  }

  analyzeOccupantEffects(occupants, houseNumber, chart) {
    return occupants.map(occ => ({
      planet: occ.planet,
      effects: occ.effects,
      beneficLevel: this.assessPlanetBeneficLevel(occ.planet, houseNumber)
    }));
  }

  analyzeAspectEffects(aspects, houseNumber) {
    return aspects.map(aspect => ({
      planet: aspect.planet,
      type: aspect.type,
      strength: aspect.strength,
      effect: this.getAspectEffect(aspect.planet, houseNumber)
    }));
  }

  assessPlanetBeneficLevel(planet, houseNumber) {
    const planetNature = this.getPlanetNature(planet);

    // Base benefic level from planet nature
    let beneficLevel = planetNature === 'benefic' ? 3 :
                      planetNature === 'malefic' ? 1 : 2;

    // Adjust based on house placement
    const houseNature = this.getHouseNature(houseNumber);

    if (houseNature === 'benefic' && planetNature === 'benefic') {
      beneficLevel = 4; // Very High
    } else if (houseNature === 'malefic' && planetNature === 'malefic') {
      // Malefics in malefic houses can cancel negativity
      if ([6, 8, 12].includes(houseNumber)) {
        beneficLevel = 3; // High (cancellation principle)
      }
    } else if (houseNature === 'benefic' && planetNature === 'malefic') {
      beneficLevel = 1; // Low
    }

    // Special considerations for specific planet-house combinations
    const specialCombinations = {
      'mars': { 3: 4, 6: 4, 10: 3, 11: 3 }, // Mars good in Upachaya
      'saturn': { 3: 3, 6: 4, 10: 3, 11: 3 }, // Saturn good in Upachaya
      'jupiter': { 1: 4, 4: 4, 7: 3, 9: 4, 10: 3 }, // Jupiter good in most places
      'venus': { 1: 3, 2: 4, 4: 3, 7: 4, 11: 3 }, // Venus good for relationships/wealth
      'mercury': { 1: 3, 3: 3, 6: 3, 10: 3 }, // Mercury good for communication/work
      'sun': { 1: 4, 9: 3, 10: 4 }, // Sun good for authority/self
      'moon': { 1: 3, 4: 4, 11: 3 } // Moon good for mind/emotions
    };

    const planetSpecial = specialCombinations[planet.toLowerCase()];
    if (planetSpecial && planetSpecial[houseNumber]) {
      beneficLevel = Math.max(beneficLevel, planetSpecial[houseNumber]);
    }

    const levels = ['Very Low', 'Low', 'Medium', 'High', 'Very High'];
    return levels[Math.min(4, Math.max(0, beneficLevel - 1))];
  }

  getAspectEffect(planet, houseNumber) {
    return `${planet} aspect on ${houseNumber}th house`;
  }

  findKendraTrikonaYogas(chart) {
    // Find Raja Yogas formed by Kendra and Trikona lord connections
    const yogas = [];
    const lagnaSign = this.getLagnaSign(chart);
    const lagnaSignName = this.getSignName(lagnaSign);

    const kendraLords = [1, 4, 7, 10].map(house => this.getHouseLord(house, lagnaSign));
    const trikonaLords = [1, 5, 9].map(house => this.getHouseLord(house, lagnaSign));

    // Check for conjunctions between Kendra and Trikona lords
    for (const kendraLord of kendraLords) {
      for (const trikonaLord of trikonaLords) {
        if (kendraLord !== trikonaLord) {
          const kendraPlacement = this.getHouseLordPlacement(kendraLord, chart);
          const trikonaPlacement = this.getHouseLordPlacement(trikonaLord, chart);

          if (kendraPlacement && trikonaPlacement) {
            // Same house conjunction
            if (kendraPlacement.house === trikonaPlacement.house) {
              yogas.push({
                type: 'Raja Yoga - Conjunction',
                lords: [kendraLord, trikonaLord],
                house: kendraPlacement.house,
                strength: 'High',
                description: `${kendraLord} and ${trikonaLord} conjunction in ${kendraPlacement.house}th house`
              });
            }

            // Mutual aspect (7th house from each other)
            const houseDifference = Math.abs(kendraPlacement.house - trikonaPlacement.house);
            if (houseDifference === 6 || houseDifference === 6) { // 7th house aspect
              yogas.push({
                type: 'Raja Yoga - Mutual Aspect',
                lords: [kendraLord, trikonaLord],
                houses: [kendraPlacement.house, trikonaPlacement.house],
                strength: 'Medium',
                description: `${kendraLord} and ${trikonaLord} in mutual aspect`
              });
            }
          }
        }
      }
    }

    // Check for house lord exchanges (Parivartana)
    for (let i = 0; i < kendraLords.length; i++) {
      const kendraHouse = [1, 4, 7, 10][i];
      const kendraLord = kendraLords[i];
      const kendraLordPlacement = this.getHouseLordPlacement(kendraLord, chart);

      for (let j = 0; j < trikonaLords.length; j++) {
        const trikonaHouse = [1, 5, 9][j];
        const trikonaLord = trikonaLords[j];
        const trikonaLordPlacement = this.getHouseLordPlacement(trikonaLord, chart);

        if (kendraLord !== trikonaLord && kendraLordPlacement && trikonaLordPlacement) {
          // Check for Parivartana Yoga
          if (kendraLordPlacement.house === trikonaHouse &&
              trikonaLordPlacement.house === kendraHouse) {
            yogas.push({
              type: 'Raja Yoga - Parivartana',
              lords: [kendraLord, trikonaLord],
              houses: [kendraHouse, trikonaHouse],
              strength: 'Very High',
              description: `${kendraLord} and ${trikonaLord} exchange houses (${kendraHouse}th and ${trikonaHouse}th)`
            });
          }
        }
      }
    }

    return yogas;
  }

  findHouseLordExchanges(chart) {
    // Find Parivartana Yogas (mutual exchanges between house lords)
    const exchanges = [];
    const lagnaSign = this.getLagnaSign(chart);

    // Get all house lords and their placements
    const houseLords = {};
    for (let house = 1; house <= 12; house++) {
      const lord = this.getHouseLord(house, lagnaSign);
      const placement = this.getHouseLordPlacement(lord, chart);
      if (placement) {
        houseLords[house] = { lord, placement: placement.house };
      }
    }

    // Check for mutual exchanges
    for (let house1 = 1; house1 <= 12; house1++) {
      for (let house2 = house1 + 1; house2 <= 12; house2++) {
        const lord1 = houseLords[house1];
        const lord2 = houseLords[house2];

        if (lord1 && lord2 && lord1.lord !== lord2.lord) {
          // Check if they are in mutual exchange
          if (lord1.placement === house2 && lord2.placement === house1) {
            const exchangeType = this.categorizeParivartanaYoga(house1, house2);
            exchanges.push({
              type: 'Parivartana Yoga',
              subType: exchangeType.name,
              houses: [house1, house2],
              lords: [lord1.lord, lord2.lord],
              strength: exchangeType.strength,
              effects: exchangeType.effects,
              description: `${lord1.lord} (${house1}th lord) and ${lord2.lord} (${house2}nd lord) exchange houses`
            });
          }
        }
      }
    }

    return exchanges;
  }

  findSignificantAspectConnections(chart) {
    // Find important aspect patterns affecting multiple houses
    const connections = [];
    const lagnaSign = this.getLagnaSign(chart);

    // Grand Trines - planets in houses 1, 5, 9 aspects
    const trineHouses = [1, 5, 9];
    const trineOccupants = [];

    for (const house of trineHouses) {
      const occupants = this.getHouseOccupants(house, chart);
      if (occupants.length > 0) {
        trineOccupants.push({ house, planets: occupants.map(o => o.planet) });
      }
    }

    if (trineOccupants.length >= 2) {
      connections.push({
        type: 'Trine Activation',
        pattern: 'Multiple Trikona Houses Occupied',
        houses: trineOccupants.map(t => t.house),
        planets: trineOccupants.flatMap(t => t.planets),
        strength: 'High',
        effect: 'Powerful dharmic connections and fortune'
      });
    }

    // T-Square patterns - squares and oppositions
    const squarePatterns = this.findSquarePatterns(chart);
    connections.push(...squarePatterns);

    // Stellium detection - 3+ planets in same house
    for (let house = 1; house <= 12; house++) {
      const occupants = this.getHouseOccupants(house, chart);
      if (occupants.length >= 3) {
        connections.push({
          type: 'Stellium',
          pattern: 'Multiple Planets in One House',
          house: house,
          planets: occupants.map(o => o.planet),
          strength: 'Very High',
          effect: `Concentrated energy in ${house}th house matters`
        });
      }
    }

    // Aspect chains - planets aspecting in sequence
    const aspectChains = this.findAspectChains(chart);
    connections.push(...aspectChains);

    return connections;
  }

  findMutualReceptions(chart) {
    // Find planets in each other's signs
    const receptions = [];

    if (!chart.planetaryPositions) return receptions;

    const planetOwnerships = {
      'sun': [4],        // Leo
      'moon': [3],       // Cancer
      'mars': [0, 7],    // Aries, Scorpio
      'mercury': [2, 5], // Gemini, Virgo
      'jupiter': [8, 11], // Sagittarius, Pisces
      'venus': [1, 6],   // Taurus, Libra
      'saturn': [9, 10]  // Capricorn, Aquarius
    };

    // Check for mutual receptions
    for (const [planet1, pos1] of Object.entries(chart.planetaryPositions)) {
      if (!pos1 || pos1.longitude === undefined) continue;

      const sign1 = Math.floor(pos1.longitude / 30);
      const planet1Lower = planet1.toLowerCase();

      for (const [planet2, pos2] of Object.entries(chart.planetaryPositions)) {
        if (!pos2 || pos2.longitude === undefined) continue;
        if (planet1 === planet2) continue;

        const sign2 = Math.floor(pos2.longitude / 30);
        const planet2Lower = planet2.toLowerCase();

        // Check if planet1 is in planet2's sign and vice versa
        const planet1Owns = planetOwnerships[planet1Lower] || [];
        const planet2Owns = planetOwnerships[planet2Lower] || [];

        if (planet1Owns.includes(sign2) && planet2Owns.includes(sign1)) {
          // Avoid duplicates by checking if we already added this pair
          const alreadyExists = receptions.some(r =>
            (r.planets.includes(planet1) && r.planets.includes(planet2))
          );

          if (!alreadyExists) {
            const receptionType = this.categorizeReception(planet1Lower, planet2Lower);
            receptions.push({
              type: 'Mutual Reception',
              planets: [planet1, planet2],
              signs: [this.getSignName(sign1), this.getSignName(sign2)],
              strength: receptionType.strength,
              nature: receptionType.nature,
              effects: receptionType.effects,
              description: `${planet1} in ${this.getSignName(sign2)} and ${planet2} in ${this.getSignName(sign1)}`
            });
          }
        }
      }
    }

    return receptions;
  }

  findKendraLordConnections(chart) {
    // Find connections between Kendra lords
    const connections = [];
    const lagnaSign = this.getLagnaSign(chart);

    const kendraLords = [1, 4, 7, 10].map(house => ({
      house,
      lord: this.getHouseLord(house, lagnaSign)
    }));

    // Check conjunctions between Kendra lords
    for (let i = 0; i < kendraLords.length; i++) {
      for (let j = i + 1; j < kendraLords.length; j++) {
        const lord1 = kendraLords[i];
        const lord2 = kendraLords[j];

        if (lord1.lord === lord2.lord) continue; // Same planet

        const pos1 = chart.planetaryPositions[lord1.lord];
        const pos2 = chart.planetaryPositions[lord2.lord];

        if (pos1 && pos2) {
          const angularDistance = Math.abs(pos1.longitude - pos2.longitude);
          const adjustedDistance = Math.min(angularDistance, 360 - angularDistance);

          // Conjunction (within 10 degrees)
          if (adjustedDistance <= 10) {
            connections.push({
              type: 'Kendra Lord Conjunction',
              lords: [lord1.lord, lord2.lord],
              houses: [lord1.house, lord2.house],
              orb: adjustedDistance,
              strength: adjustedDistance <= 5 ? 'Very High' : 'High',
              effect: 'Powerful combination for life stability and success',
              description: `${lord1.lord} (${lord1.house}th lord) conjunct ${lord2.lord} (${lord2.house}th lord)`
            });
          }

          // Opposition (within 10 degrees of 180)
          else if (Math.abs(adjustedDistance - 180) <= 10) {
            connections.push({
              type: 'Kendra Lord Opposition',
              lords: [lord1.lord, lord2.lord],
              houses: [lord1.house, lord2.house],
              orb: Math.abs(adjustedDistance - 180),
              strength: 'Medium',
              effect: 'Tension requiring balance between life areas',
              description: `${lord1.lord} (${lord1.house}th lord) opposite ${lord2.lord} (${lord2.house}th lord)`
            });
          }
        }
      }
    }

    // Check for Kendra lords in each other's houses
    for (const kendra of kendraLords) {
      const lordPlacement = this.getHouseLordPlacement(kendra.lord, chart);
      if (lordPlacement) {
        const isInOtherKendra = [1, 4, 7, 10].includes(lordPlacement.house) && lordPlacement.house !== kendra.house;
        if (isInOtherKendra) {
          connections.push({
            type: 'Kendra Lord in Kendra',
            lord: kendra.lord,
            fromHouse: kendra.house,
            toHouse: lordPlacement.house,
            strength: 'High',
            effect: 'Strengthens foundational life areas',
            description: `${kendra.lord} (${kendra.house}th lord) in ${lordPlacement.house}th house`
          });
        }
      }
    }

    return connections;
  }

  findTrikonaLordConnections(chart) {
    // Find connections between Trikona lords
    const connections = [];
    const lagnaSign = this.getLagnaSign(chart);

    const trikonaLords = [1, 5, 9].map(house => ({
      house,
      lord: this.getHouseLord(house, lagnaSign)
    }));

    // Check conjunctions between Trikona lords
    for (let i = 0; i < trikonaLords.length; i++) {
      for (let j = i + 1; j < trikonaLords.length; j++) {
        const lord1 = trikonaLords[i];
        const lord2 = trikonaLords[j];

        if (lord1.lord === lord2.lord) continue; // Same planet

        const pos1 = chart.planetaryPositions[lord1.lord];
        const pos2 = chart.planetaryPositions[lord2.lord];

        if (pos1 && pos2) {
          const angularDistance = Math.abs(pos1.longitude - pos2.longitude);
          const adjustedDistance = Math.min(angularDistance, 360 - angularDistance);

          // Conjunction (within 10 degrees)
          if (adjustedDistance <= 10) {
            connections.push({
              type: 'Trikona Lord Conjunction',
              lords: [lord1.lord, lord2.lord],
              houses: [lord1.house, lord2.house],
              orb: adjustedDistance,
              strength: 'Very High',
              effect: 'Extremely auspicious for dharma and fortune',
              description: `${lord1.lord} (${lord1.house}th lord) conjunct ${lord2.lord} (${lord2.house}th lord)`
            });
          }

          // Trine aspect (120 degrees ± 10)
          else if (Math.abs(adjustedDistance - 120) <= 10) {
            connections.push({
              type: 'Trikona Lord Trine',
              lords: [lord1.lord, lord2.lord],
              houses: [lord1.house, lord2.house],
              orb: Math.abs(adjustedDistance - 120),
              strength: 'High',
              effect: 'Harmonious flow of fortune and dharma',
              description: `${lord1.lord} (${lord1.house}th lord) trine ${lord2.lord} (${lord2.house}th lord)`
            });
          }
        }
      }
    }

    // Check for Trikona lords in other Trikona houses
    for (const trikona of trikonaLords) {
      const lordPlacement = this.getHouseLordPlacement(trikona.lord, chart);
      if (lordPlacement) {
        const isInOtherTrikona = [1, 5, 9].includes(lordPlacement.house) && lordPlacement.house !== trikona.house;
        if (isInOtherTrikona) {
          connections.push({
            type: 'Trikona Lord in Trikona',
            lord: trikona.lord,
            fromHouse: trikona.house,
            toHouse: lordPlacement.house,
            strength: 'Very High',
            effect: 'Magnifies auspicious results and dharma',
            description: `${trikona.lord} (${trikona.house}th lord) in ${lordPlacement.house}th house`
          });
        }
      }
    }

    return connections;
  }

  findDusthanaConnections(chart) {
    // Find problematic Dusthana connections
    const connections = [];
    const lagnaSign = this.getLagnaSign(chart);

    const dusthanaLords = [6, 8, 12].map(house => ({
      house,
      lord: this.getHouseLord(house, lagnaSign)
    }));

    // Check for Dusthana lord conjunctions with Kendra/Trikona lords
    const kendraTrikonaLords = [1, 4, 5, 7, 9, 10].map(house => ({
      house,
      lord: this.getHouseLord(house, lagnaSign)
    }));

    for (const dusthana of dusthanaLords) {
      for (const beneficial of kendraTrikonaLords) {
        if (dusthana.lord === beneficial.lord) continue;

        const dusthanaPos = chart.planetaryPositions[dusthana.lord];
        const beneficialPos = chart.planetaryPositions[beneficial.lord];

        if (dusthanaPos && beneficialPos) {
          const angularDistance = Math.abs(dusthanaPos.longitude - beneficialPos.longitude);
          const adjustedDistance = Math.min(angularDistance, 360 - angularDistance);

          // Conjunction (within 10 degrees)
          if (adjustedDistance <= 10) {
            const severity = this.assessDusthanaConjunctionSeverity(dusthana.house, beneficial.house);
            connections.push({
              type: 'Dusthana-Beneficial Lord Conjunction',
              dusthanaLord: dusthana.lord,
              beneficialLord: beneficial.lord,
              houses: [dusthana.house, beneficial.house],
              orb: adjustedDistance,
              severity: severity.level,
              effects: severity.effects,
              remedies: severity.remedies,
              description: `${dusthana.lord} (${dusthana.house}th lord) conjunct ${beneficial.lord} (${beneficial.house}th lord)`
            });
          }
        }
      }
    }

    // Check for Dusthana lords in Kendra/Trikona houses
    for (const dusthana of dusthanaLords) {
      const lordPlacement = this.getHouseLordPlacement(dusthana.lord, chart);
      if (lordPlacement) {
        const isInBeneficialHouse = [1, 4, 5, 7, 9, 10].includes(lordPlacement.house);
        if (isInBeneficialHouse) {
          connections.push({
            type: 'Dusthana Lord in Beneficial House',
            lord: dusthana.lord,
            fromHouse: dusthana.house,
            toHouse: lordPlacement.house,
            severity: 'Medium',
            effect: 'Challenges may manifest in beneficial life areas',
            remedy: `Strengthen ${lordPlacement.house}th house through appropriate remedies`,
            description: `${dusthana.lord} (${dusthana.house}th lord) in ${lordPlacement.house}th house`
          });
        }
      }
    }

    // Check for multiple Dusthana activations
    const activatedDusthanas = dusthanaLords.filter(d => {
      const occupants = this.getHouseOccupants(d.house, chart);
      return occupants.length > 0;
    });

    if (activatedDusthanas.length >= 2) {
      connections.push({
        type: 'Multiple Dusthana Activation',
        houses: activatedDusthanas.map(d => d.house),
        lords: activatedDusthanas.map(d => d.lord),
        severity: 'High',
        effect: 'Multiple challenges and transformative periods',
        remedy: 'Focus on spiritual practices and service to mitigate negative effects',
        description: `${activatedDusthanas.length} Dusthana houses are occupied`
      });
    }

    return connections;
  }

  generateHousePredictions(houseAnalysis, chart) {
    const predictions = [];
    const houseNum = houseAnalysis.houseNumber;
    const houseName = houseAnalysis.houseName;

    // Base predictions on house strength
    if (houseAnalysis.overallStrength >= 7) {
      predictions.push(`Strong ${houseName} - expect positive results in this life area`);
    } else if (houseAnalysis.overallStrength <= 3) {
      predictions.push(`Weak ${houseName} - requires attention and effort`);
    } else {
      predictions.push(`Moderate ${houseName} - balanced results with effort`);
    }

    // Specific predictions based on house significations
    const significations = this.houseSignifications[houseNum];
    if (significations) {
      for (const area of significations.primarySignifications.slice(0, 2)) {
        if (houseAnalysis.overallStrength >= 6) {
          predictions.push(`Good prospects in ${area.toLowerCase()}`);
        } else if (houseAnalysis.overallStrength <= 4) {
          predictions.push(`Challenges possible in ${area.toLowerCase()}`);
        }
      }
    }

    return predictions;
  }

  generateHouseRemedies(houseAnalysis) {
    const remedies = [];
    const houseNum = houseAnalysis.houseNumber;

    if (houseAnalysis.overallStrength <= 4) {
      remedies.push(`Strengthen ${houseAnalysis.houseLord} through mantras and charity`);

      // House-specific remedies
      switch (houseNum) {
        case 1:
          remedies.push('Regular exercise and health practices');
          remedies.push('Self-development and confidence building');
          break;
        case 2:
          remedies.push('Practice truthful speech and save money regularly');
          remedies.push('Strengthen family relationships');
          break;
        case 3:
          remedies.push('Develop communication skills and courage');
          remedies.push('Good relationship with siblings');
          break;
        case 4:
          remedies.push('Respect mother and elders');
          remedies.push('Create peaceful home environment');
          break;
        case 5:
          remedies.push('Focus on education and creative pursuits');
          remedies.push('Good conduct and ethical behavior');
          break;
        case 6:
          remedies.push('Maintain health through discipline');
          remedies.push('Serve others and avoid conflicts');
          break;
        case 7:
          remedies.push('Practice patience in relationships');
          remedies.push('Work on partnership skills');
          break;
        case 8:
          remedies.push('Practice spiritual disciplines');
          remedies.push('Avoid risky ventures and maintain health');
          break;
        case 9:
          remedies.push('Respect teachers and spiritual practices');
          remedies.push('Study scriptures and philosophy');
          break;
        case 10:
          remedies.push('Dedication to career and service');
          remedies.push('Respect authority and work ethics');
          break;
        case 11:
          remedies.push('Maintain good friendships');
          remedies.push('Focus on legitimate gains');
          break;
        case 12:
          remedies.push('Practice charity and spiritual activities');
          remedies.push('Control expenses and practice detachment');
          break;
      }
    }

    return remedies;
  }

  generateHouseRecommendations(analysis) {
    const recommendations = [];

    // Overall house strength assessment
    if (analysis.overallHouseStrength >= 6) {
      recommendations.push('Chart shows good overall house strength - capitalize on strong areas');
    } else if (analysis.overallHouseStrength <= 4) {
      recommendations.push('Focus on strengthening weak houses through targeted remedies');
    }

    // Kendra analysis
    if (analysis.kendraAnalysis.strength >= 6) {
      recommendations.push('Strong Kendra houses provide good life foundation');
    } else {
      recommendations.push('Work on strengthening angular houses for better life stability');
    }

    // Trikona analysis
    if (analysis.trikonaAnalysis.strength >= 6) {
      recommendations.push('Good Trikona strength indicates favorable destiny');
    } else {
      recommendations.push('Focus on dharmic activities to strengthen fortune');
    }

    // Dusthana analysis
    if (analysis.dusthanaAnalysis.problematicDusthanas.length > 0) {
      recommendations.push('Be cautious during periods of activated dusthana houses');
    }

    // Strongest houses
    if (analysis.strongestHouses.length > 0) {
      const strongAreas = analysis.strongestHouses.map(h => h.name).join(', ');
      recommendations.push(`Focus on developing: ${strongAreas}`);
    }

    // Weakest houses
    if (analysis.weakestHouses.length > 0) {
      const weakAreas = analysis.weakestHouses.map(h => h.name).join(', ');
      recommendations.push(`Requires attention: ${weakAreas}`);
    }

    return recommendations;
  }

  /**
   * Supporting helper methods for production-grade calculations
   */

  /**
   * Calculate aspect from one house to another
   * @param {number} fromHouse - House number where planet is located
   * @param {number} toHouse - Target house number
   * @param {string} planet - Planet name
   * @returns {Object} Aspect data
   */
  calculateAspectToHouse(fromHouse, toHouse, planet) {
    const houseDifference = Math.abs(fromHouse - toHouse);
    const adjustedDifference = Math.min(houseDifference, 12 - houseDifference);

    // Standard 7th house aspect (opposition)
    if (adjustedDifference === 6) {
      return {
        hasAspect: true,
        aspectType: '7th House Aspect',
        strength: 8
      };
    }

    // Special planetary aspects
    const specialAspects = {
      'mars': [3, 7], // 4th and 8th houses
      'jupiter': [4, 8], // 5th and 9th houses
      'saturn': [2, 9] // 3rd and 10th houses
    };

    const planetSpecial = specialAspects[planet.toLowerCase()];
    if (planetSpecial) {
      for (const aspectHouses of planetSpecial) {
        if (adjustedDifference === aspectHouses - 1) { // Convert to house difference
          return {
            hasAspect: true,
            aspectType: `${planet} Special Aspect`,
            strength: 6
          };
        }
      }
    }

    // Trine aspects (5th and 9th)
    if (adjustedDifference === 4 || adjustedDifference === 8) {
      return {
        hasAspect: true,
        aspectType: 'Trine Aspect',
        strength: 5
      };
    }

    return { hasAspect: false };
  }

  /**
   * Get planet nature (benefic/malefic/neutral)
   * @param {string} planet - Planet name
   * @returns {string} Planet nature
   */
  getPlanetNature(planet) {
    const benefics = ['jupiter', 'venus', 'moon'];
    const malefics = ['sun', 'mars', 'saturn', 'rahu', 'ketu'];
    const neutral = ['mercury'];

    const planetLower = planet.toLowerCase();

    if (benefics.includes(planetLower)) return 'benefic';
    if (malefics.includes(planetLower)) return 'malefic';
    if (neutral.includes(planetLower)) return 'neutral';

    return 'neutral'; // Default
  }

  /**
   * Get house nature (benefic/malefic/neutral)
   * @param {number} houseNumber - House number
   * @returns {string} House nature
   */
  getHouseNature(houseNumber) {
    const beneficHouses = [1, 4, 5, 7, 9, 10, 11]; // Kendra + Trikona + 11th
    const maleficHouses = [6, 8, 12]; // Dusthana houses
    const neutralHouses = [2, 3]; // 2nd and 3rd houses

    if (beneficHouses.includes(houseNumber)) return 'benefic';
    if (maleficHouses.includes(houseNumber)) return 'malefic';
    if (neutralHouses.includes(houseNumber)) return 'neutral';

    return 'neutral';
  }

  /**
   * Check if planet is combust
   * @param {string} planet - Planet name
   * @param {Object} chart - Birth chart
   * @returns {boolean} Combustion status
   */
  isPlanetCombust(planet, chart) {
    if (planet.toLowerCase() === 'sun') return false; // Sun cannot be combust

    const planetData = chart.planetaryPositions[planet.toLowerCase()];
    const sunData = chart.planetaryPositions.sun;

    if (!planetData || !sunData) return false;

    const angularDistance = Math.abs(planetData.longitude - sunData.longitude);
    const adjustedDistance = Math.min(angularDistance, 360 - angularDistance);

    // Combustion distances in degrees
    const combustionDistances = {
      'moon': 12,
      'mars': 17,
      'mercury': planetData.isRetrograde ? 12 : 14,
      'jupiter': 11,
      'venus': planetData.isRetrograde ? 8 : 10,
      'saturn': 15
    };

    const threshold = combustionDistances[planet.toLowerCase()];
    return threshold ? adjustedDistance <= threshold : false;
  }

  /**
   * Get benefic aspects to a planet
   * @param {string} planet - Planet name
   * @param {Object} chart - Birth chart
   * @returns {Array} Benefic aspects
   */
  getBeneficAspects(planet, chart) {
    const benefics = ['jupiter', 'venus', 'moon'];
    const aspects = [];

    const planetData = chart.planetaryPositions[planet.toLowerCase()];
    if (!planetData) return aspects;

    for (const benefic of benefics) {
      if (benefic === planet.toLowerCase()) continue;

      const beneficData = chart.planetaryPositions[benefic];
      if (beneficData) {
        const aspectData = this.calculatePlanetaryAspect(benefic, beneficData, planetData);
        if (aspectData.hasAspect) {
          aspects.push({ planet: benefic, ...aspectData });
        }
      }
    }

    return aspects;
  }

  /**
   * Get malefic aspects to a planet
   * @param {string} planet - Planet name
   * @param {Object} chart - Birth chart
   * @returns {Array} Malefic aspects
   */
  getMaleficAspects(planet, chart) {
    const malefics = ['sun', 'mars', 'saturn', 'rahu', 'ketu'];
    const aspects = [];

    const planetData = chart.planetaryPositions[planet.toLowerCase()];
    if (!planetData) return aspects;

    for (const malefic of malefics) {
      if (malefic === planet.toLowerCase()) continue;

      const maleficData = chart.planetaryPositions[malefic];
      if (maleficData) {
        const aspectData = this.calculatePlanetaryAspect(malefic, maleficData, planetData);
        if (aspectData.hasAspect) {
          aspects.push({ planet: malefic, ...aspectData });
        }
      }
    }

    return aspects;
  }

  /**
   * Calculate planetary aspect between two planets
   * @param {string} aspectingPlanet - Planet giving aspect
   * @param {Object} aspectingPos - Aspecting planet position
   * @param {Object} receivingPos - Receiving planet position
   * @returns {Object} Aspect data
   */
  calculatePlanetaryAspect(aspectingPlanet, aspectingPos, receivingPos) {
    const angularDistance = Math.abs(aspectingPos.longitude - receivingPos.longitude);
    const adjustedDistance = Math.min(angularDistance, 360 - angularDistance);

    // Standard aspects
    const aspects = [
      { angle: 0, name: 'Conjunction', orb: 10 },
      { angle: 60, name: 'Sextile', orb: 8 },
      { angle: 90, name: 'Square', orb: 10 },
      { angle: 120, name: 'Trine', orb: 10 },
      { angle: 180, name: 'Opposition', orb: 10 }
    ];

    // Check standard aspects
    for (const aspect of aspects) {
      if (Math.abs(adjustedDistance - aspect.angle) <= aspect.orb) {
        return {
          hasAspect: true,
          aspectType: aspect.name,
          exactness: aspect.orb - Math.abs(adjustedDistance - aspect.angle),
          orb: Math.abs(adjustedDistance - aspect.angle)
        };
      }
    }

    // Special planetary aspects
    const specialAspects = {
      'mars': [{ angle: 90, name: '4th Aspect' }, { angle: 240, name: '8th Aspect' }],
      'jupiter': [{ angle: 120, name: '5th Aspect' }, { angle: 240, name: '9th Aspect' }],
      'saturn': [{ angle: 90, name: '3rd Aspect' }, { angle: 270, name: '10th Aspect' }]
    };

    const planetSpecialAspects = specialAspects[aspectingPlanet.toLowerCase()];
    if (planetSpecialAspects) {
      for (const aspect of planetSpecialAspects) {
        if (Math.abs(adjustedDistance - aspect.angle) <= 10) {
          return {
            hasAspect: true,
            aspectType: aspect.name,
            exactness: 10 - Math.abs(adjustedDistance - aspect.angle),
            orb: Math.abs(adjustedDistance - aspect.angle)
          };
        }
      }
    }

    return { hasAspect: false };
  }

  /**
   * Get special house considerations
   * @param {number} houseNumber - House number
   * @param {Object} chart - Birth chart
   * @returns {number} Additional strength consideration
   */
  getSpecialHouseConsiderations(houseNumber, chart) {
    let consideration = 0;

    // 1st house - Lagna strength
    if (houseNumber === 1) {
      const lagnaLord = this.getHouseLord(1, this.getLagnaSign(chart));
      const lagnaLordDignity = this.getPlanetDignity(lagnaLord, Math.floor(chart.planetaryPositions[lagnaLord]?.longitude / 30) || 0);
      if (lagnaLordDignity === 'exalted' || lagnaLordDignity === 'own') {
        consideration += 1;
      }
    }

    // 10th house - Career strength from 10th lord
    if (houseNumber === 10) {
      const tenthLord = this.getHouseLord(10, this.getLagnaSign(chart));
      const tenthLordPlacement = this.getHouseLordPlacement(tenthLord, chart);
      if (tenthLordPlacement && [1, 4, 7, 10].includes(tenthLordPlacement.house)) {
        consideration += 0.5; // 10th lord in Kendra
      }
    }

    // 9th house - Fortune house strength
    if (houseNumber === 9) {
      const ninthLord = this.getHouseLord(9, this.getLagnaSign(chart));
      const jupiterPlacement = this.getHouseLordPlacement('jupiter', chart);
      if (jupiterPlacement && jupiterPlacement.house === 9) {
        consideration += 0.5; // Jupiter in 9th is auspicious
      }
    }

    return consideration;
  }

  /**
   * Categorize Parivartana Yoga based on house combinations
   * @param {number} house1 - First house
   * @param {number} house2 - Second house
   * @returns {Object} Categorization data
   */
  categorizeParivartanaYoga(house1, house2) {
    const kendras = [1, 4, 7, 10];
    const trikonas = [1, 5, 9];
    const dusthanas = [6, 8, 12];

    const isKendra1 = kendras.includes(house1);
    const isKendra2 = kendras.includes(house2);
    const isTrikona1 = trikonas.includes(house1);
    const isTrikona2 = trikonas.includes(house2);
    const isDusthana1 = dusthanas.includes(house1);
    const isDusthana2 = dusthanas.includes(house2);

    if ((isKendra1 && isTrikona2) || (isTrikona1 && isKendra2)) {
      return {
        name: 'Maha Raja Yoga Parivartana',
        strength: 'Very High',
        effects: ['Exceptional success', 'Royal status', 'Leadership abilities']
      };
    } else if ((isKendra1 && isKendra2) || (isTrikona1 && isTrikona2)) {
      return {
        name: 'Raja Yoga Parivartana',
        strength: 'High',
        effects: ['Success', 'Good status', 'Prosperity']
      };
    } else if (isDusthana1 || isDusthana2) {
      return {
        name: 'Dainya Yoga Parivartana',
        strength: 'Low',
        effects: ['Challenges', 'Obstacles', 'Need for remedies']
      };
    } else {
      return {
        name: 'Kahala Yoga Parivartana',
        strength: 'Medium',
        effects: ['Mixed results', 'Moderate benefits', 'Some challenges']
      };
    }
  }

  /**
   * Find square patterns in the chart
   * @param {Object} chart - Birth chart
   * @returns {Array} Square pattern connections
   */
  findSquarePatterns(chart) {
    const patterns = [];
    const planets = Object.entries(chart.planetaryPositions || {});

    // Look for T-Square patterns (planet opposite two others in square)
    for (let i = 0; i < planets.length; i++) {
      for (let j = i + 1; j < planets.length; j++) {
        for (let k = j + 1; k < planets.length; k++) {
          const [planet1, pos1] = planets[i];
          const [planet2, pos2] = planets[j];
          const [planet3, pos3] = planets[k];

          if (!pos1 || !pos2 || !pos3) continue;

          const angles = [
            this.calculateAngularDistance(pos1.longitude, pos2.longitude),
            this.calculateAngularDistance(pos2.longitude, pos3.longitude),
            this.calculateAngularDistance(pos1.longitude, pos3.longitude)
          ];

          // Check for T-Square pattern (90-90-180 degrees ± orb)
          const squareOrb = 10;
          const oppositionOrb = 10;

          if (this.isNearAngle(angles[0], 90, squareOrb) &&
              this.isNearAngle(angles[1], 90, squareOrb) &&
              this.isNearAngle(angles[2], 180, oppositionOrb)) {
            patterns.push({
              type: 'T-Square',
              planets: [planet1, planet2, planet3],
              pattern: 'Challenging dynamic requiring resolution',
              strength: 'High',
              effect: 'Tension creating motivation for achievement'
            });
          }
        }
      }
    }

    return patterns;
  }

  /**
   * Find aspect chains in the chart
   * @param {Object} chart - Birth chart
   * @returns {Array} Aspect chain connections
   */
  findAspectChains(chart) {
    const chains = [];
    const planets = Object.entries(chart.planetaryPositions || {});

    // Look for chains of 3+ planets in aspect
    for (let i = 0; i < planets.length - 2; i++) {
      const chain = [planets[i]];
      let currentPlanet = planets[i];

      // Try to build a chain
      for (let j = i + 1; j < planets.length; j++) {
        const nextPlanet = planets[j];
        const [currentName, currentPos] = currentPlanet;
        const [nextName, nextPos] = nextPlanet;

        if (!currentPos || !nextPos) continue;

        const distance = this.calculateAngularDistance(currentPos.longitude, nextPos.longitude);

        // Check for major aspects
        if (this.isNearAngle(distance, 60, 8) ||   // Sextile
            this.isNearAngle(distance, 90, 10) ||  // Square
            this.isNearAngle(distance, 120, 10) || // Trine
            this.isNearAngle(distance, 180, 10)) { // Opposition

          chain.push(nextPlanet);
          currentPlanet = nextPlanet;
        }
      }

      if (chain.length >= 3) {
        chains.push({
          type: 'Aspect Chain',
          planets: chain.map(([name]) => name),
          length: chain.length,
          effect: 'Connected planetary energies creating complex patterns'
        });
      }
    }

    return chains;
  }

  /**
   * Categorize mutual reception
   * @param {string} planet1 - First planet
   * @param {string} planet2 - Second planet
   * @returns {Object} Reception categorization
   */
  categorizeReception(planet1, planet2) {
    const benefics = ['jupiter', 'venus', 'moon'];
    const malefics = ['sun', 'mars', 'saturn'];

    const isBenefic1 = benefics.includes(planet1);
    const isBenefic2 = benefics.includes(planet2);
    const isMalefic1 = malefics.includes(planet1);
    const isMalefic2 = malefics.includes(planet2);

    if (isBenefic1 && isBenefic2) {
      return {
        strength: 'Very High',
        nature: 'Highly Beneficial',
        effects: ['Harmony', 'Prosperity', 'Good fortune', 'Smooth cooperation']
      };
    } else if (isMalefic1 && isMalefic2) {
      return {
        strength: 'Medium',
        nature: 'Challenging but Productive',
        effects: ['Intense energy', 'Transformation', 'Achievement through struggle']
      };
    } else if ((isBenefic1 && isMalefic2) || (isMalefic1 && isBenefic2)) {
      return {
        strength: 'High',
        nature: 'Mixed Results',
        effects: ['Balance of energies', 'Learning experiences', 'Growth through contrast']
      };
    } else {
      return {
        strength: 'Medium',
        nature: 'Neutral to Positive',
        effects: ['Intellectual cooperation', 'Adaptive qualities', 'Flexible expression']
      };
    }
  }

  /**
   * Assess Dusthana conjunction severity
   * @param {number} dusthanaHouse - Dusthana house number
   * @param {number} beneficialHouse - Beneficial house number
   * @returns {Object} Severity assessment
   */
  assessDusthanaConjunctionSeverity(dusthanaHouse, beneficialHouse) {
    const kendras = [1, 4, 7, 10];
    const trikonas = [1, 5, 9];

    let severity = 'Medium';
    let effects = [];
    let remedies = [];

    if (trikonas.includes(beneficialHouse)) {
      severity = 'High';
      effects = [
        'Dharmic challenges',
        'Spiritual tests',
        'Fortune mixed with obstacles'
      ];
      remedies = [
        'Spiritual practices',
        'Dharmic activities',
        'Service to others'
      ];
    } else if (kendras.includes(beneficialHouse)) {
      severity = dusthanaHouse === 8 ? 'High' : 'Medium';
      effects = [
        'Life stability challenges',
        'Career or health issues',
        'Relationship complications'
      ];
      remedies = [
        'Strengthen the affected area',
        'Appropriate gemstones',
        'Planetary remedies'
      ];
    }

    // Specific Dusthana effects
    if (dusthanaHouse === 6) {
      effects.push('Health or legal issues');
      remedies.push('Health maintenance', 'Conflict resolution');
    } else if (dusthanaHouse === 8) {
      effects.push('Sudden changes', 'Research abilities');
      remedies.push('Safety measures', 'Occult knowledge');
    } else if (dusthanaHouse === 12) {
      effects.push('Losses or gains', 'Spiritual growth');
      remedies.push('Charity', 'Meditation', 'Foreign connections');
    }

    return { level: severity, effects, remedies };
  }

  /**
   * Helper method to check if an angle is near a target
   * @param {number} angle - Actual angle
   * @param {number} target - Target angle
   * @param {number} orb - Allowed orb
   * @returns {boolean} Whether angle is within orb
   */
  isNearAngle(angle, target, orb) {
    return Math.abs(angle - target) <= orb;
  }

  /**
   * Calculate angular distance between two longitudes
   * @param {number} lon1 - First longitude
   * @param {number} lon2 - Second longitude
   * @returns {number} Angular distance in degrees
   */
  calculateAngularDistance(lon1, lon2) {
    const diff = Math.abs(lon1 - lon2);
    return Math.min(diff, 360 - diff);
  }
}

export default TwelveHouseAnalyzer;
