/**
 * Dasha Event Timing Engine
 * Predicts timing of major life events using Vimshottari Dasha system
 * Integrates with chart analysis for precise event timing
 */

const AntardashaCalculator = require('./AntardashaCalculator');
const PratyanardashaCalculator = require('./PratyanardashaCalculator');

class DashaEventTimingEngine {
  constructor() {
    this.antardashaCalculator = new AntardashaCalculator();
    this.pratyanardashaCalculator = new PratyanardashaCalculator();
    this.initializeEventRules();
  }

  /**
   * Initialize event timing rules based on classical principles
   */
  initializeEventRules() {
    // Marriage timing rules
    this.marriageRules = {
      primaryIndicators: ['Venus', 'Jupiter'], // Venus for men, Jupiter for women
      houseIndicators: [7], // 7th house
      supportiveIndicators: ['Moon'], // Emotional readiness
      timingPlanets: ['Venus', 'Jupiter', 'Moon'],
      avoidPlanets: ['Saturn', 'Rahu', 'Ketu'], // Generally delay marriage
      favorableCombinations: [
        ['Venus', 'Jupiter'],
        ['Moon', 'Venus'],
        ['Jupiter', 'Moon']
      ]
    };

    // Career timing rules
    this.careerRules = {
      primaryIndicators: ['Sun', 'Mars', 'Saturn'],
      houseIndicators: [10, 1, 6], // 10th house (career), 1st house (self), 6th house (service)
      supportiveIndicators: ['Mercury', 'Jupiter'],
      timingPlanets: ['Sun', 'Mars', 'Saturn', 'Mercury'],
      favorableCombinations: [
        ['Sun', 'Mars'],
        ['Saturn', 'Mercury'],
        ['Jupiter', 'Sun']
      ]
    };

    // Health timing rules
    this.healthRules = {
      primaryIndicators: ['Mars', 'Saturn', 'Ketu'],
      houseIndicators: [6, 8, 12], // 6th (illness), 8th (surgery/crisis), 12th (hospitalization)
      criticalPlanets: ['Mars', 'Saturn', 'Rahu', 'Ketu'],
      warningCombinations: [
        ['Mars', 'Saturn'],
        ['Saturn', 'Ketu'],
        ['Rahu', 'Mars']
      ]
    };

    // Financial timing rules
    this.financialRules = {
      primaryIndicators: ['Venus', 'Jupiter', 'Mercury'],
      houseIndicators: [2, 11], // 2nd (wealth), 11th (gains)
      supportiveIndicators: ['Moon'],
      timingPlanets: ['Venus', 'Jupiter', 'Mercury'],
      favorableCombinations: [
        ['Jupiter', 'Venus'],
        ['Mercury', 'Venus'],
        ['Jupiter', 'Mercury']
      ]
    };

    // Spiritual timing rules
    this.spiritualRules = {
      primaryIndicators: ['Jupiter', 'Ketu'],
      houseIndicators: [9, 12], // 9th (dharma), 12th (moksha)
      supportiveIndicators: ['Moon'],
      timingPlanets: ['Jupiter', 'Ketu', 'Saturn'],
      favorableCombinations: [
        ['Jupiter', 'Ketu'],
        ['Saturn', 'Ketu'],
        ['Moon', 'Jupiter']
      ]
    };
  }

  /**
   * Predict marriage timing for a given chart
   * @param {Object} birthChart - Complete birth chart
   * @param {Object} dashaTimeline - Complete dasha timeline
   * @param {string} gender - 'male' or 'female'
   * @returns {Object} Marriage timing predictions
   */
  predictMarriageTiming(birthChart, dashaTimeline, gender = 'male') {
    const predictions = {
      likelyPeriods: [],
      mostPromisingPeriod: null,
      delayFactors: [],
      recommendations: [],
      overallTiming: null
    };

    const karaka = gender === 'male' ? 'Venus' : 'Jupiter';
    const seventhHouse = birthChart.houses[7];
    const seventhLord = this.getHouseLord(7, birthChart);

    // Analyze chart for marriage indicators
    const chartAnalysis = this.analyzeMarriageIndicators(birthChart, karaka);

    // Find favorable dasha periods
    predictions.likelyPeriods = this.findFavorablePeriods(
      dashaTimeline,
      this.marriageRules,
      chartAnalysis,
      [karaka, seventhLord]
    );

    // Identify delay factors
    predictions.delayFactors = this.identifyMarriageDelays(birthChart, karaka);

    // Determine most promising period
    if (predictions.likelyPeriods.length > 0) {
      predictions.mostPromisingPeriod = this.selectBestPeriod(predictions.likelyPeriods, chartAnalysis);
      predictions.overallTiming = this.categorizeMarriageTiming(predictions.mostPromisingPeriod, birthChart.birthDate);
    }

    predictions.recommendations = this.generateMarriageRecommendations(chartAnalysis, predictions);

    return predictions;
  }

  /**
   * Predict career milestone timing
   * @param {Object} birthChart - Complete birth chart
   * @param {Object} dashaTimeline - Complete dasha timeline
   * @returns {Object} Career timing predictions
   */
  predictCareerTiming(birthChart, dashaTimeline) {
    const predictions = {
      careerStart: null,
      promotionPeriods: [],
      careerChanges: [],
      peakPeriods: [],
      challengingPeriods: [],
      retirementTiming: null
    };

    const tenthHouse = birthChart.houses[10];
    const tenthLord = this.getHouseLord(10, birthChart);
    const lagnaLord = this.getHouseLord(1, birthChart);

    const chartAnalysis = this.analyzeCareerIndicators(birthChart);

    // Career start timing (usually 6th or 10th lord periods)
    predictions.careerStart = this.findCareerStartTiming(dashaTimeline, chartAnalysis);

    // Promotion and peak periods
    predictions.promotionPeriods = this.findFavorablePeriods(
      dashaTimeline,
      this.careerRules,
      chartAnalysis,
      [tenthLord, lagnaLord, 'Sun']
    );

    // Career change periods (often involving 8th house or Rahu)
    predictions.careerChanges = this.findCareerChangePeriods(dashaTimeline, chartAnalysis);

    return predictions;
  }

  /**
   * Predict health events timing
   * @param {Object} birthChart - Complete birth chart
   * @param {Object} dashaTimeline - Complete dasha timeline
   * @returns {Object} Health timing predictions
   */
  predictHealthTiming(birthChart, dashaTimeline) {
    const predictions = {
      criticalPeriods: [],
      recoveryPeriods: [],
      surgeryTiming: [],
      chronicIssues: [],
      preventiveMeasures: []
    };

    const chartAnalysis = this.analyzeHealthIndicators(birthChart);

    // Critical health periods
    predictions.criticalPeriods = this.findCriticalHealthPeriods(dashaTimeline, chartAnalysis);

    // Recovery periods
    predictions.recoveryPeriods = this.findRecoveryPeriods(dashaTimeline, chartAnalysis);

    // Surgery timing (8th house activations)
    predictions.surgeryTiming = this.findSurgeryPeriods(dashaTimeline, chartAnalysis);

    predictions.preventiveMeasures = this.generateHealthRecommendations(chartAnalysis, predictions);

    return predictions;
  }

  /**
   * Analyze marriage indicators in the chart
   */
  analyzeMarriageIndicators(birthChart, karaka) {
    const analysis = {
      karakaStrength: this.getPlanetStrength(karaka, birthChart),
      seventhHouseStrength: this.getHouseStrength(7, birthChart),
      seventhLordPlacement: this.getHouseLordPlacement(7, birthChart),
      aspects: this.getAspectsToHouse(7, birthChart),
      navamsaIndicators: this.getNavamsaMarriageIndicators(birthChart),
      delayFactors: [],
      supportiveFactors: []
    };

    // Check for delay factors
    if (analysis.aspects.includes('Saturn')) {
      analysis.delayFactors.push('Saturn aspect on 7th house');
    }
    if (analysis.seventhLordPlacement.house === 6 || analysis.seventhLordPlacement.house === 8 || analysis.seventhLordPlacement.house === 12) {
      analysis.delayFactors.push('7th lord in dusthana house');
    }

    return analysis;
  }

  /**
   * Find favorable periods for specific events
   */
  findFavorablePeriods(dashaTimeline, rules, chartAnalysis, keyPlanets) {
    const favorablePeriods = [];

    for (const mahadasha of dashaTimeline.mahadashas) {
      if (keyPlanets.includes(mahadasha.lord) || rules.timingPlanets.includes(mahadasha.lord)) {
        for (const antardasha of mahadasha.antardashas) {
          if (keyPlanets.includes(antardasha.lord) || rules.timingPlanets.includes(antardasha.lord)) {

            const favorability = this.assessPeriodFavorability(
              mahadasha.lord,
              antardasha.lord,
              rules,
              chartAnalysis
            );

            if (favorability.score >= 6) {
              favorablePeriods.push({
                mahadashaLord: mahadasha.lord,
                antardashaLord: antardasha.lord,
                startDate: antardasha.startDate,
                endDate: antardasha.endDate,
                favorability: favorability,
                eventType: rules.primaryIndicators.includes(antardasha.lord) ? 'primary' : 'supportive'
              });
            }
          }
        }
      }
    }

    return favorablePeriods.sort((a, b) => b.favorability.score - a.favorability.score);
  }

  /**
   * Assess favorability of a specific period for an event
   */
  assessPeriodFavorability(mahadashaLord, antardashaLord, rules, chartAnalysis) {
    let score = 5; // Neutral baseline
    let factors = [];

    // Primary indicator bonus
    if (rules.primaryIndicators.includes(antardashaLord)) {
      score += 3;
      factors.push(`${antardashaLord} is primary indicator`);
    }

    // Supportive indicator bonus
    if (rules.supportiveIndicators.includes(antardashaLord)) {
      score += 1;
      factors.push(`${antardashaLord} is supportive indicator`);
    }

    // Favorable combination bonus
    for (const combo of rules.favorableCombinations) {
      if (combo.includes(mahadashaLord) && combo.includes(antardashaLord)) {
        score += 2;
        factors.push(`Favorable ${mahadashaLord}-${antardashaLord} combination`);
      }
    }

    // Avoid planets penalty
    if (rules.avoidPlanets && rules.avoidPlanets.includes(antardashaLord)) {
      score -= 2;
      factors.push(`${antardashaLord} generally delays this event`);
    }

    // Chart-specific factors
    if (chartAnalysis.supportiveFactors.length > chartAnalysis.delayFactors.length) {
      score += 1;
      factors.push('Chart shows supportive indicators');
    }

    return {
      score: Math.max(1, Math.min(10, score)),
      level: this.getFavorabilityLevel(score),
      factors: factors
    };
  }

  /**
   * Helper methods for chart analysis
   */
  getPlanetStrength(planet, chart) {
    const planetData = chart.planetaryPositions[planet];
    if (!planetData) return 0;

    let strength = 0;

    // Dignity-based strength (40% weightage)
    const dignity = planetData.dignity || {};
    if (dignity.status === 'Exalted') {
      strength += 40;
    } else if (dignity.status === 'Own') {
      strength += 35;
    } else if (dignity.status === 'Debilitated') {
      strength += 5;
      // Check for Neecha Bhanga
      if (this.hasNeechaBhanga(planet, chart)) {
        strength += 20;
      }
    } else if (dignity.status === 'Friendly') {
      strength += 25;
    } else if (dignity.status === 'Enemy') {
      strength += 15;
    } else {
      strength += 20; // Neutral
    }

    // House-based strength (25% weightage)
    const houseNumber = Math.floor(planetData.longitude / 30) + 1;
    if ([1, 4, 7, 10].includes(houseNumber)) {
      strength += 20; // Kendra strength
    } else if ([5, 9].includes(houseNumber)) {
      strength += 25; // Trikona strength
    } else if ([3, 6, 10, 11].includes(houseNumber)) {
      strength += 15; // Upachaya
    } else if ([6, 8, 12].includes(houseNumber)) {
      strength -= 5; // Dusthana
    } else {
      strength += 10; // Other houses
    }

    // Aspect strength (20% weightage)
    const aspectStrength = this.calculatePlanetAspectStrength(planet, chart);
    strength += aspectStrength * 0.2;

    // Degree-based strength (10% weightage)
    const degree = planetData.longitude % 30;
    if (degree >= 5 && degree <= 25) {
      strength += 10; // Strong degrees
    } else if (degree <= 1 || degree >= 29) {
      strength -= 5; // Weak degrees
    }

    // Combustion check (5% weightage)
    if (this.isPlanetCombust(planet, chart)) {
      strength -= 10;
    }

    return Math.max(0, Math.min(100, strength));
  }

  getHouseStrength(houseNumber, chart) {
    const house = chart.houses[houseNumber];
    if (!house) return 0;

    let strength = 1.0;
    // Add logic for house strength calculation
    return strength;
  }

  getHouseLord(houseNumber, chart) {
    if (!chart.houses || !chart.houses[houseNumber]) {
      // Calculate from sign if houses data not available
      const ascendantSign = chart.ascendant?.sign || 'Aries';
      const houseSign = this.calculateHouseSign(ascendantSign, houseNumber);
      return this.getSignLord(houseSign);
    }

    const house = chart.houses[houseNumber];
    if (house.lord) {
      return house.lord;
    }

    // Calculate lord from sign
    const houseSign = house.sign || house.rasi;
    return this.getSignLord(houseSign);
  }

  getHouseLordPlacement(houseNumber, chart) {
    const lord = this.getHouseLord(houseNumber, chart);
    if (!lord) return null;

    const lordData = chart.planetaryPositions[lord];
    return lordData ? { house: Math.floor(lordData.longitude / 30) + 1 } : null;
  }

  getAspectsToHouse(houseNumber, chart) {
    const aspectingPlanets = [];

    if (!chart.planetaryPositions) return aspectingPlanets;

    Object.keys(chart.planetaryPositions).forEach(planet => {
      const planetData = chart.planetaryPositions[planet];
      const planetHouse = Math.floor(planetData.longitude / 30) + 1;

      const aspectData = this.calculatePlanetaryAspectToHouse(planet, planetHouse, houseNumber);
      if (aspectData.hasAspect) {
        aspectingPlanets.push({
          planet: planet,
          aspectType: aspectData.aspectType,
          strength: aspectData.strength,
          isbenefic: this.isBeneficPlanet(planet)
        });
      }
    });

    return aspectingPlanets;
  }

  getNavamsaMarriageIndicators(chart) {
    const navamsaAnalysis = {
      venusInNavamsa: this.calculateNavamsaPosition('Venus', chart),
      seventhLordInNavamsa: this.calculateNavamsaPosition(this.getHouseLord(7, chart), chart),
      navamsaLagnaLord: null,
      navamsaSeventhLord: null,
      marriageYogas: [],
      delayIndications: [],
      overallStrength: 0
    };

    // Calculate Navamsa Lagna
    const lagnaNavamsa = this.calculateNavamsaPosition('Lagna', chart);
    navamsaAnalysis.navamsaLagnaLord = this.getSignLord(lagnaNavamsa.sign);

    // Calculate 7th house from Navamsa Lagna
    const navamsaSeventhSign = this.getSeventhSign(lagnaNavamsa.sign);
    navamsaAnalysis.navamsaSeventhLord = this.getSignLord(navamsaSeventhSign);

    // Check for marriage yogas in Navamsa
    if (navamsaAnalysis.venusInNavamsa.dignity === 'Exalted' || navamsaAnalysis.venusInNavamsa.dignity === 'Own') {
      navamsaAnalysis.marriageYogas.push('Strong Venus in Navamsa - excellent for marriage');
      navamsaAnalysis.overallStrength += 25;
    }

    if (navamsaAnalysis.seventhLordInNavamsa.dignity === 'Exalted' || navamsaAnalysis.seventhLordInNavamsa.dignity === 'Own') {
      navamsaAnalysis.marriageYogas.push('Strong 7th lord in Navamsa - good for marriage');
      navamsaAnalysis.overallStrength += 20;
    }

    // Check for delay indications
    if (navamsaAnalysis.venusInNavamsa.dignity === 'Debilitated') {
      navamsaAnalysis.delayIndications.push('Debilitated Venus in Navamsa may cause delays');
      navamsaAnalysis.overallStrength -= 15;
    }

    if (navamsaAnalysis.seventhLordInNavamsa.dignity === 'Debilitated') {
      navamsaAnalysis.delayIndications.push('Debilitated 7th lord in Navamsa indicates challenges');
      navamsaAnalysis.overallStrength -= 10;
    }

    // Check for mutual aspects between marriage significators
    const venusHouse = navamsaAnalysis.venusInNavamsa.house;
    const seventhLordHouse = navamsaAnalysis.seventhLordInNavamsa.house;

    if (this.housesInMutualAspect(venusHouse, seventhLordHouse)) {
      navamsaAnalysis.marriageYogas.push('Venus and 7th lord in mutual aspect in Navamsa');
      navamsaAnalysis.overallStrength += 15;
    }

    navamsaAnalysis.overallStrength = Math.max(0, Math.min(100, navamsaAnalysis.overallStrength + 50));

    return navamsaAnalysis;
  }

  analyzeCareerIndicators(chart) {
    return {
      tenthHouseStrength: this.getHouseStrength(10, chart),
      lagnaLordStrength: this.getPlanetStrength(this.getHouseLord(1, chart), chart)
    };
  }

  analyzeHealthIndicators(chart) {
    return {
      sixthHouseStrength: this.getHouseStrength(6, chart),
      eighthHouseStrength: this.getHouseStrength(8, chart)
    };
  }

  findCareerStartTiming(dashaTimeline, chartAnalysis) {
    // Look for first favorable career period after age 18
    const careerStartCandidates = [];

    for (const mahadasha of dashaTimeline.mahadashas) {
      // Calculate age at start of mahadasha
      const ageAtStart = this.calculateAgeAtDate(dashaTimeline.birthDate, mahadasha.startDate);

      if (ageAtStart >= 18 && ageAtStart <= 35) { // Typical career start age range
        // Check if mahadasha lord favors career
        if (['Sun', 'Mars', 'Mercury', 'Jupiter', 'Saturn'].includes(mahadasha.lord)) {
          for (const antardasha of mahadasha.antardashas) {
            if (['Sun', 'Mars', 'Mercury', 'Saturn', 'Jupiter'].includes(antardasha.lord)) {
              const ageAtAntardasha = this.calculateAgeAtDate(dashaTimeline.birthDate, antardasha.startDate);

              careerStartCandidates.push({
                period: `${mahadasha.lord}-${antardasha.lord}`,
                startDate: antardasha.startDate,
                endDate: antardasha.endDate,
                age: ageAtAntardasha,
                favorability: this.assessCareerFavorability(mahadasha.lord, antardasha.lord),
                type: 'career_start'
              });
            }
          }
        }
      }
    }

    // Return the most favorable early period
    return careerStartCandidates.length > 0
      ? careerStartCandidates.sort((a, b) => b.favorability - a.favorability)[0]
      : null;
  }

  findCareerChangePeriods(dashaTimeline, chartAnalysis) {
    const careerChangePeriods = [];

    for (const mahadasha of dashaTimeline.mahadashas) {
      // Rahu, Ketu, and 8th house connections often indicate career changes
      if (['Rahu', 'Ketu'].includes(mahadasha.lord)) {
        for (const antardasha of mahadasha.antardashas) {
          // Strong change indicators
          if (['Mars', 'Saturn', 'Rahu', 'Ketu'].includes(antardasha.lord)) {
            careerChangePeriods.push({
              period: `${mahadasha.lord}-${antardasha.lord}`,
              startDate: antardasha.startDate,
              endDate: antardasha.endDate,
              changeType: 'major_transformation',
              intensity: 'High',
              recommendations: ['Prepare for significant career shift', 'Explore new opportunities']
            });
          }
        }
      }

      // Saturn periods often bring career restructuring
      if (mahadasha.lord === 'Saturn') {
        for (const antardasha of mahadasha.antardashas) {
          if (['Mars', 'Rahu'].includes(antardasha.lord)) {
            careerChangePeriods.push({
              period: `${mahadasha.lord}-${antardasha.lord}`,
              startDate: antardasha.startDate,
              endDate: antardasha.endDate,
              changeType: 'career_restructuring',
              intensity: 'Medium',
              recommendations: ['Focus on long-term career building', 'Accept new responsibilities']
            });
          }
        }
      }
    }

    return careerChangePeriods;
  }

  findCriticalHealthPeriods(dashaTimeline, chartAnalysis) {
    const criticalPeriods = [];

    for (const mahadasha of dashaTimeline.mahadashas) {
      // Mars, Saturn, Rahu, Ketu dashas can bring health challenges
      if (['Mars', 'Saturn', 'Rahu', 'Ketu'].includes(mahadasha.lord)) {
        for (const antardasha of mahadasha.antardashas) {
          // Critical combinations for health
          const criticalCombos = [
            ['Mars', 'Saturn'], ['Saturn', 'Rahu'], ['Rahu', 'Ketu'],
            ['Mars', 'Rahu'], ['Saturn', 'Ketu']
          ];

          const currentCombo = [mahadasha.lord, antardasha.lord];
          const isCritical = criticalCombos.some(combo =>
            (combo[0] === currentCombo[0] && combo[1] === currentCombo[1]) ||
            (combo[0] === currentCombo[1] && combo[1] === currentCombo[0])
          );

          if (isCritical) {
            criticalPeriods.push({
              period: `${mahadasha.lord}-${antardasha.lord}`,
              startDate: antardasha.startDate,
              endDate: antardasha.endDate,
              riskLevel: 'High',
              healthConcerns: this.getHealthConcerns(mahadasha.lord, antardasha.lord),
              preventiveMeasures: this.getPreventiveMeasures(mahadasha.lord, antardasha.lord)
            });
          }
        }
      }
    }

    return criticalPeriods;
  }

  findRecoveryPeriods(dashaTimeline, chartAnalysis) {
    const recoveryPeriods = [];

    for (const mahadasha of dashaTimeline.mahadashas) {
      // Jupiter, Venus, Moon periods generally support recovery
      if (['Jupiter', 'Venus', 'Moon'].includes(mahadasha.lord)) {
        for (const antardasha of mahadasha.antardashas) {
          if (['Jupiter', 'Venus', 'Moon', 'Mercury'].includes(antardasha.lord)) {
            recoveryPeriods.push({
              period: `${mahadasha.lord}-${antardasha.lord}`,
              startDate: antardasha.startDate,
              endDate: antardasha.endDate,
              recoveryType: 'natural_healing',
              supportLevel: 'High',
              recommendations: ['Focus on holistic healing', 'Strengthen immunity', 'Practice meditation']
            });
          }
        }
      }
    }

    return recoveryPeriods;
  }

  findSurgeryPeriods(dashaTimeline, chartAnalysis) {
    const surgeryPeriods = [];

    for (const mahadasha of dashaTimeline.mahadashas) {
      // Mars periods often coincide with surgical procedures
      if (mahadasha.lord === 'Mars') {
        for (const antardasha of mahadasha.antardashas) {
          // Mars with other malefics or 8th house indicators
          if (['Saturn', 'Rahu', 'Ketu'].includes(antardasha.lord)) {
            surgeryPeriods.push({
              period: `${mahadasha.lord}-${antardasha.lord}`,
              startDate: antardasha.startDate,
              endDate: antardasha.endDate,
              surgeryType: 'elective_or_emergency',
              timing: 'possible',
              precautions: ['Consult medical professionals', 'Get second opinions', 'Strengthen health beforehand']
            });
          }
        }
      }

      // 8th house activations through Rahu/Ketu can also indicate surgery
      if (['Rahu', 'Ketu'].includes(mahadasha.lord)) {
        for (const antardasha of mahadasha.antardashas) {
          if (antardasha.lord === 'Mars') {
            surgeryPeriods.push({
              period: `${mahadasha.lord}-${antardasha.lord}`,
              startDate: antardasha.startDate,
              endDate: antardasha.endDate,
              surgeryType: 'transformational',
              timing: 'likely',
              precautions: ['Thorough medical evaluation', 'Prepare mentally and physically']
            });
          }
        }
      }
    }

    return surgeryPeriods;
  }

  identifyMarriageDelays(chart, karaka) {
    const delays = [];
    // Check for Saturn aspects, dusthana placements, etc.
    return delays;
  }

  selectBestPeriod(periods, chartAnalysis) {
    return periods.length > 0 ? periods[0] : null;
  }

  categorizeMarriageTiming(period, birthDate) {
    if (!period) return 'Uncertain';

    const marriageYear = period.startDate.getFullYear();
    const birthYear = new Date(birthDate).getFullYear();
    const age = marriageYear - birthYear;

    if (age < 25) return 'Early';
    if (age < 30) return 'Normal';
    if (age < 35) return 'Slightly Delayed';
    return 'Delayed';
  }

  generateMarriageRecommendations(chartAnalysis, predictions) {
    const recommendations = [];

    if (predictions.delayFactors.length > 0) {
      recommendations.push('Consider strengthening Venus/Jupiter through mantras and charity');
    }

    if (predictions.mostPromisingPeriod) {
      recommendations.push(`Best marriage window: ${predictions.mostPromisingPeriod.startDate.getFullYear()}-${predictions.mostPromisingPeriod.endDate.getFullYear()}`);
    }

    return recommendations;
  }

  generateHealthRecommendations(chartAnalysis, predictions) {
    return ['Regular health checkups recommended', 'Maintain healthy lifestyle'];
  }

  getFavorabilityLevel(score) {
    if (score >= 8) return 'Excellent';
    if (score >= 6.5) return 'Good';
    if (score >= 5) return 'Moderate';
    if (score >= 3.5) return 'Challenging';
    return 'Difficult';
  }

  // Additional helper methods for completed implementations
  calculateAgeAtDate(birthDate, targetDate) {
    const birth = new Date(birthDate);
    const target = new Date(targetDate);
    const ageMs = target - birth;
    return Math.floor(ageMs / (1000 * 60 * 60 * 24 * 365.25));
  }

  assessCareerFavorability(mahaLord, antarLord) {
    const careerPlanets = {
      'Sun': 3,      // Authority, leadership
      'Mars': 2,     // Action, energy
      'Mercury': 2,  // Communication, skills
      'Jupiter': 2,  // Wisdom, expansion
      'Saturn': 3,   // Discipline, hard work
      'Venus': 1,    // Creativity, relationships
      'Moon': 1,     // Public connection
      'Rahu': 1,     // Modern opportunities
      'Ketu': 0      // Spiritual, less material focus
    };

    const mahaScore = careerPlanets[mahaLord] || 0;
    const antarScore = careerPlanets[antarLord] || 0;
    return mahaScore + antarScore;
  }

  getHealthConcerns(mahaLord, antarLord) {
    const healthConcerns = {
      'Mars-Saturn': ['Joint problems', 'Accidents', 'Inflammatory conditions'],
      'Saturn-Rahu': ['Chronic illness', 'Mental stress', 'Immune system'],
      'Rahu-Ketu': ['Mysterious ailments', 'Poisoning', 'Mental confusion'],
      'Mars-Rahu': ['Accidents', 'Infections', 'Blood disorders'],
      'Saturn-Ketu': ['Chronic fatigue', 'Depression', 'Bone issues']
    };

    const combo = `${mahaLord}-${antarLord}`;
    const reverseCombo = `${antarLord}-${mahaLord}`;

    return healthConcerns[combo] || healthConcerns[reverseCombo] || ['General health monitoring needed'];
  }

  getPreventiveMeasures(mahaLord, antarLord) {
    const preventiveMeasures = {
      'Mars-Saturn': ['Regular exercise', 'Joint care', 'Avoid risky activities'],
      'Saturn-Rahu': ['Stress management', 'Regular health checkups', 'Meditation'],
      'Rahu-Ketu': ['Detox practices', 'Avoid unknown substances', 'Mental health care'],
      'Mars-Rahu': ['Blood tests', 'Infection prevention', 'Safety precautions'],
      'Saturn-Ketu': ['Vitamin D', 'Bone density tests', 'Mental health support']
    };

    const combo = `${mahaLord}-${antarLord}`;
    const reverseCombo = `${antarLord}-${mahaLord}`;

    return preventiveMeasures[combo] || preventiveMeasures[reverseCombo] || ['Maintain healthy lifestyle', 'Regular medical checkups'];
  }

  /**
   * Supporting helper methods for enhanced calculations
   */

  hasNeechaBhanga(planet, chart) {
    const planetData = chart.planetaryPositions[planet];
    if (!planetData || planetData.dignity?.status !== 'Debilitated') return false;

    const planetHouse = Math.floor(planetData.longitude / 30) + 1;

    // Rule 1: Lord of debilitation sign is in Kendra from Lagna
    const debilitationSign = this.getDebilitationSign(planet);
    const debilitationLord = this.getSignLord(debilitationSign);
    const lordData = chart.planetaryPositions[debilitationLord];
    if (lordData) {
      const lordHouse = Math.floor(lordData.longitude / 30) + 1;
      if ([1, 4, 7, 10].includes(lordHouse)) return true;
    }

    // Rule 2: Lord of exaltation sign is in Kendra from Lagna
    const exaltationSign = this.getExaltationSign(planet);
    const exaltationLord = this.getSignLord(exaltationSign);
    const exaltationLordData = chart.planetaryPositions[exaltationLord];
    if (exaltationLordData) {
      const exaltationLordHouse = Math.floor(exaltationLordData.longitude / 30) + 1;
      if ([1, 4, 7, 10].includes(exaltationLordHouse)) return true;
    }

    return false;
  }

  calculatePlanetAspectStrength(planet, chart) {
    let aspectStrength = 50; // Base

    const beneficAspects = this.getBeneficAspectsTo(planet, chart);
    const maleficAspects = this.getMaleficAspectsTo(planet, chart);

    aspectStrength += (beneficAspects * 5) - (maleficAspects * 3);

    return Math.max(20, Math.min(100, aspectStrength));
  }

  isPlanetCombust(planet, chart) {
    if (planet === 'Sun') return false;

    const planetData = chart.planetaryPositions[planet];
    const sunData = chart.planetaryPositions['Sun'];

    if (!planetData || !sunData) return false;

    const planetLongitude = planetData.longitude;
    const sunLongitude = sunData.longitude;

    const distance = Math.abs(planetLongitude - sunLongitude);
    const adjustedDistance = Math.min(distance, 360 - distance);

    const combustionThresholds = {
      'Moon': 12, 'Mars': 17, 'Mercury': 14, 'Jupiter': 11, 'Venus': 10, 'Saturn': 15
    };

    return adjustedDistance <= (combustionThresholds[planet] || 10);
  }

  getSignLord(sign) {
    const signLords = {
      'Aries': 'Mars', 'Taurus': 'Venus', 'Gemini': 'Mercury', 'Cancer': 'Moon',
      'Leo': 'Sun', 'Virgo': 'Mercury', 'Libra': 'Venus', 'Scorpio': 'Mars',
      'Sagittarius': 'Jupiter', 'Capricorn': 'Saturn', 'Aquarius': 'Saturn', 'Pisces': 'Jupiter'
    };
    return signLords[sign];
  }

  calculateHouseSign(ascendantSign, houseNumber) {
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                   'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

    const ascendantIndex = signs.indexOf(ascendantSign);
    const houseSignIndex = (ascendantIndex + houseNumber - 1) % 12;

    return signs[houseSignIndex];
  }

  calculatePlanetaryAspectToHouse(planet, planetHouse, targetHouse) {
    const difference = Math.abs(planetHouse - targetHouse);
    const adjustedDiff = Math.min(difference, 12 - difference);

    let hasAspect = false;
    let aspectType = '';
    let strength = 60;

    // Universal 7th house aspect
    if (adjustedDiff === 6) {
      hasAspect = true;
      aspectType = '7th house aspect';
      strength = 75;
    }

    // Special aspects
    switch (planet) {
      case 'Mars':
        if (adjustedDiff === 3 || adjustedDiff === 7) {
          hasAspect = true;
          aspectType = adjustedDiff === 3 ? '4th house aspect' : '8th house aspect';
          strength = 70;
        }
        break;
      case 'Jupiter':
        if (adjustedDiff === 4 || adjustedDiff === 8) {
          hasAspect = true;
          aspectType = adjustedDiff === 4 ? '5th house aspect' : '9th house aspect';
          strength = 80;
        }
        break;
      case 'Saturn':
        if (adjustedDiff === 2 || adjustedDiff === 9) {
          hasAspect = true;
          aspectType = adjustedDiff === 2 ? '3rd house aspect' : '10th house aspect';
          strength = 70;
        }
        break;
    }

    return { hasAspect, aspectType, strength };
  }

  isBeneficPlanet(planet) {
    return ['Jupiter', 'Venus', 'Mercury', 'Moon'].includes(planet);
  }

  getBeneficAspectsTo(planet, chart) {
    let count = 0;
    const benefics = ['Jupiter', 'Venus', 'Moon'];

    benefics.forEach(benefic => {
      if (benefic !== planet && this.planetsInAspect(benefic, planet, chart)) {
        count++;
      }
    });

    return count;
  }

  getMaleficAspectsTo(planet, chart) {
    let count = 0;
    const malefics = ['Saturn', 'Mars', 'Rahu', 'Ketu'];

    malefics.forEach(malefic => {
      if (malefic !== planet && this.planetsInAspect(malefic, planet, chart)) {
        count++;
      }
    });

    return count;
  }

  planetsInAspect(planet1, planet2, chart) {
    const p1Data = chart.planetaryPositions[planet1];
    const p2Data = chart.planetaryPositions[planet2];

    if (!p1Data || !p2Data) return false;

    const p1House = Math.floor(p1Data.longitude / 30) + 1;
    const p2House = Math.floor(p2Data.longitude / 30) + 1;

    return this.calculatePlanetaryAspectToHouse(planet1, p1House, p2House).hasAspect;
  }

  calculateNavamsaPosition(planet, chart) {
    if (planet === 'Lagna') {
      const ascendantDegree = chart.ascendant?.degree || 0;
      const ascendantSign = chart.ascendant?.sign || 'Aries';
      return this.calculateNavamsaFromDegree(ascendantDegree, ascendantSign);
    }

    const planetData = chart.planetaryPositions[planet];
    if (!planetData) return { sign: 'Aries', house: 1, dignity: 'Neutral' };

    const degree = planetData.longitude % 30;
    const sign = this.getSignFromLongitude(planetData.longitude);

    return this.calculateNavamsaFromDegree(degree, sign);
  }

  calculateNavamsaFromDegree(degree, sign) {
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                   'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

    const signIndex = signs.indexOf(sign);
    const navamsaPart = Math.floor(degree / 3.33);

    // Navamsa calculation based on sign nature (movable, fixed, dual)
    let navamsaIndex;
    if ([0, 3, 6, 9].includes(signIndex)) { // Movable signs
      navamsaIndex = (signIndex + navamsaPart) % 12;
    } else if ([1, 4, 7, 10].includes(signIndex)) { // Fixed signs
      navamsaIndex = (signIndex + 8 + navamsaPart) % 12;
    } else { // Dual signs
      navamsaIndex = (signIndex + 4 + navamsaPart) % 12;
    }

    const navamsaSign = signs[navamsaIndex];

    return {
      sign: navamsaSign,
      house: navamsaIndex + 1,
      dignity: this.calculatePlanetDignity(this.getSignLord(sign), navamsaSign)
    };
  }

  getSignFromLongitude(longitude) {
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                   'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

    const signIndex = Math.floor(longitude / 30);
    return signs[signIndex];
  }

  getSeventhSign(sign) {
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                   'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

    const signIndex = signs.indexOf(sign);
    const seventhIndex = (signIndex + 6) % 12;

    return signs[seventhIndex];
  }

  housesInMutualAspect(house1, house2) {
    const difference = Math.abs(house1 - house2);
    const adjustedDiff = Math.min(difference, 12 - difference);

    // 7th house aspect creates mutual aspect
    return adjustedDiff === 6;
  }

  calculatePlanetDignity(planet, sign) {
    const exaltationSigns = {
      'Sun': 'Aries', 'Moon': 'Taurus', 'Mars': 'Capricorn',
      'Mercury': 'Virgo', 'Jupiter': 'Cancer', 'Venus': 'Pisces', 'Saturn': 'Libra'
    };

    const ownSigns = {
      'Sun': ['Leo'], 'Moon': ['Cancer'], 'Mars': ['Aries', 'Scorpio'],
      'Mercury': ['Gemini', 'Virgo'], 'Jupiter': ['Sagittarius', 'Pisces'],
      'Venus': ['Taurus', 'Libra'], 'Saturn': ['Capricorn', 'Aquarius']
    };

    const debilitationSigns = {
      'Sun': 'Libra', 'Moon': 'Scorpio', 'Mars': 'Cancer',
      'Mercury': 'Pisces', 'Jupiter': 'Capricorn', 'Venus': 'Virgo', 'Saturn': 'Aries'
    };

    if (exaltationSigns[planet] === sign) return 'Exalted';
    if (ownSigns[planet]?.includes(sign)) return 'Own';
    if (debilitationSigns[planet] === sign) return 'Debilitated';

    return 'Neutral';
  }

  getExaltationSign(planet) {
    const exaltationSigns = {
      'Sun': 'Aries', 'Moon': 'Taurus', 'Mars': 'Capricorn',
      'Mercury': 'Virgo', 'Jupiter': 'Cancer', 'Venus': 'Pisces', 'Saturn': 'Libra'
    };
    return exaltationSigns[planet];
  }

  getDebilitationSign(planet) {
    const debilitationSigns = {
      'Sun': 'Libra', 'Moon': 'Scorpio', 'Mars': 'Cancer',
      'Mercury': 'Pisces', 'Jupiter': 'Capricorn', 'Venus': 'Virgo', 'Saturn': 'Aries'
    };
    return debilitationSigns[planet];
  }
}

module.exports = DashaEventTimingEngine;
