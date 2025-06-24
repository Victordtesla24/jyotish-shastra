/**
 * Transit Dasha Integrator
 * Combines current transits with running dasha periods for precise event timing
 * Implements classical principles for transit-dasha integration
 */

const TransitCalculator = require('../../calculations/transits/TransitCalculator');
const SadeSatiCalculator = require('../../calculations/transits/SadeSatiCalculator');

class TransitDashaIntegrator {
  constructor() {
    this.transitCalculator = new TransitCalculator();
    this.sadeSatiCalculator = new SadeSatiCalculator();
    this.initializeIntegrationRules();
  }

  /**
   * Initialize integration rules for transit-dasha analysis
   */
  initializeIntegrationRules() {
    // Event manifestation rules based on transit-dasha combinations
    this.eventRules = {
      marriage: {
        primaryDashaLords: ['Venus', 'Jupiter'], // Venus for men, Jupiter for women
        supportiveDashaLords: ['Moon', 'Mercury'],
        requiredTransits: [
          { planet: 'Jupiter', houses: [1, 5, 7, 9, 11] },
          { planet: 'Venus', houses: [1, 5, 7, 11] }
        ],
        avoidTransits: [
          { planet: 'Saturn', houses: [1, 7], condition: 'afflicted' },
          { planet: 'Rahu', houses: [7], condition: 'strong' }
        ],
        minimumScore: 6
      },
      career: {
        primaryDashaLords: ['Sun', 'Mars', 'Saturn', 'Mercury'],
        supportiveDashaLords: ['Jupiter', 'Venus'],
        requiredTransits: [
          { planet: 'Jupiter', houses: [1, 6, 10, 11] },
          { planet: 'Saturn', houses: [3, 6, 10, 11] },
          { planet: 'Mars', houses: [3, 6, 10, 11] }
        ],
        avoidTransits: [
          { planet: 'Ketu', houses: [10], condition: 'afflicted' }
        ],
        minimumScore: 5
      },
      childbirth: {
        primaryDashaLords: ['Jupiter', 'Moon'],
        supportiveDashaLords: ['Venus', 'Mercury'],
        requiredTransits: [
          { planet: 'Jupiter', houses: [1, 5, 9, 11] },
          { planet: 'Moon', houses: [1, 4, 5, 11] }
        ],
        avoidTransits: [
          { planet: 'Saturn', houses: [5], condition: 'strong' },
          { planet: 'Mars', houses: [5], condition: 'afflicted' }
        ],
        minimumScore: 7
      },
      health: {
        criticalDashaLords: ['Mars', 'Saturn', 'Rahu', 'Ketu'],
        warningTransits: [
          { planet: 'Saturn', houses: [1, 6, 8, 12] },
          { planet: 'Mars', houses: [1, 6, 8] },
          { planet: 'Rahu', houses: [1, 6, 8] }
        ],
        protectiveTransits: [
          { planet: 'Jupiter', houses: [1, 5, 9] },
          { planet: 'Venus', houses: [1, 4, 12] }
        ],
        criticalScore: 7
      },
      financial: {
        primaryDashaLords: ['Venus', 'Jupiter', 'Mercury'],
        supportiveDashaLords: ['Moon', 'Sun'],
        requiredTransits: [
          { planet: 'Jupiter', houses: [2, 5, 9, 11] },
          { planet: 'Venus', houses: [2, 11] },
          { planet: 'Mercury', houses: [2, 11] }
        ],
        avoidTransits: [
          { planet: 'Saturn', houses: [2, 11], condition: 'afflicted' },
          { planet: 'Rahu', houses: [12], condition: 'strong' }
        ],
        minimumScore: 6
      }
    };

    // Transit strength multipliers when combined with dasha
    this.transitDashaMultipliers = {
      'same_planet': 2.0,    // Transit planet same as dasha lord
      'friendly': 1.5,       // Friendly planets
      'neutral': 1.0,        // Neutral relationship
      'enemy': 0.5,          // Enemy planets
      'benefic_combo': 1.3,  // Benefic planet combinations
      'malefic_combo': 0.7   // Malefic combinations
    };

    // Critical transit periods requiring special attention
    this.criticalPeriods = {
      'sade_sati': {
        description: 'Saturn Sade Sati',
        duration: 7.5, // years
        intensity: 'Very High',
        affects: ['health', 'career', 'relationships', 'finances']
      },
      'jupiter_return': {
        description: 'Jupiter Return',
        duration: 1, // year
        intensity: 'High',
        affects: ['marriage', 'children', 'education', 'spirituality']
      },
      'saturn_return': {
        description: 'Saturn Return',
        duration: 2, // years
        intensity: 'Very High',
        affects: ['career', 'responsibilities', 'life_structure']
      },
      'rahu_return': {
        description: 'Rahu Return',
        duration: 1.5, // years
        intensity: 'High',
        affects: ['ambitions', 'foreign_connections', 'material_success']
      }
    };
  }

  /**
   * Integrate current transits with dasha periods for comprehensive timing analysis
   * @param {Object} birthChart - Birth chart data
   * @param {Object} dashaTimeline - Complete dasha timeline
   * @param {Date} analysisDate - Date for analysis
   * @returns {Object} Integrated analysis
   */
  integrateTransitDasha(birthChart, dashaTimeline, analysisDate = new Date()) {
    const analysis = {
      date: analysisDate,
      currentDasha: this.getCurrentDasha(dashaTimeline, analysisDate),
      currentTransits: this.transitCalculator.calculateCurrentTransits(analysisDate, birthChart),
      sadeSati: this.sadeSatiCalculator.calculateSadeSati(birthChart, analysisDate),
      eventPredictions: {},
      criticalPeriods: [],
      recommendations: [],
      overallInfluence: null
    };

    // Analyze event timing potential
    analysis.eventPredictions = this.analyzeEventTiming(
      analysis.currentDasha,
      analysis.currentTransits,
      birthChart
    );

    // Identify critical periods
    analysis.criticalPeriods = this.identifyCriticalPeriods(
      analysis.currentDasha,
      analysis.currentTransits,
      analysis.sadeSati
    );

    // Calculate overall influence
    analysis.overallInfluence = this.calculateOverallInfluence(
      analysis.currentDasha,
      analysis.currentTransits,
      analysis.sadeSati
    );

    // Generate integrated recommendations
    analysis.recommendations = this.generateIntegratedRecommendations(analysis);

    return analysis;
  }

  /**
   * Get current running dasha for a specific date
   */
  getCurrentDasha(dashaTimeline, date) {
    // Find current Mahadasha
    let currentMahadasha = null;
    let currentAntardasha = null;

    for (const mahadasha of dashaTimeline.mahadashas) {
      if (date >= mahadasha.startDate && date <= mahadasha.endDate) {
        currentMahadasha = mahadasha;

        // Find current Antardasha
        for (const antardasha of mahadasha.antardashas) {
          if (date >= antardasha.startDate && date <= antardasha.endDate) {
            currentAntardasha = antardasha;
            break;
          }
        }
        break;
      }
    }

    return {
      mahadasha: currentMahadasha,
      antardasha: currentAntardasha,
      combination: currentMahadasha && currentAntardasha
        ? `${currentMahadasha.lord}-${currentAntardasha.lord}`
        : null
    };
  }

  /**
   * Analyze timing potential for various life events
   */
  analyzeEventTiming(currentDasha, currentTransits, birthChart) {
    const eventAnalysis = {};

    for (const [eventType, rules] of Object.entries(this.eventRules)) {
      eventAnalysis[eventType] = this.analyzeSpecificEvent(
        eventType,
        rules,
        currentDasha,
        currentTransits,
        birthChart
      );
    }

    return eventAnalysis;
  }

  /**
   * Analyze timing for a specific event type
   */
  analyzeSpecificEvent(eventType, rules, currentDasha, currentTransits, birthChart) {
    const analysis = {
      eventType: eventType,
      timing: 'Unfavorable',
      score: 0,
      favorableFactors: [],
      challengingFactors: [],
      recommendations: [],
      peakPeriod: null
    };

    let score = 0;

    // Check dasha favorability
    const dashaScore = this.evaluateDashaForEvent(currentDasha, rules);
    score += dashaScore.score;
    analysis.favorableFactors.push(...dashaScore.favorable);
    analysis.challengingFactors.push(...dashaScore.challenging);

    // Check transit favorability
    const transitScore = this.evaluateTransitsForEvent(currentTransits, rules);
    score += transitScore.score;
    analysis.favorableFactors.push(...transitScore.favorable);
    analysis.challengingFactors.push(...transitScore.challenging);

    // Check integration bonus
    const integrationBonus = this.calculateIntegrationBonus(
      currentDasha,
      currentTransits,
      rules
    );
    score += integrationBonus.bonus;
    analysis.favorableFactors.push(...integrationBonus.factors);

    analysis.score = score;
    analysis.timing = this.getTimingAssessment(score, rules.minimumScore || 5);

    // Generate event-specific recommendations
    analysis.recommendations = this.generateEventRecommendations(
      eventType,
      analysis,
      currentDasha,
      currentTransits
    );

    return analysis;
  }

  /**
   * Evaluate dasha favorability for specific event
   */
  evaluateDashaForEvent(currentDasha, rules) {
    const evaluation = {
      score: 0,
      favorable: [],
      challenging: []
    };

    if (!currentDasha.mahadasha || !currentDasha.antardasha) {
      return evaluation;
    }

    const mahaLord = currentDasha.mahadasha.lord;
    const antarLord = currentDasha.antardasha.lord;

    // Check Mahadasha lord
    if (rules.primaryDashaLords.includes(mahaLord)) {
      evaluation.score += 3;
      evaluation.favorable.push(`${mahaLord} Mahadasha favors ${rules.eventType || 'this event'}`);
    } else if (rules.supportiveDashaLords && rules.supportiveDashaLords.includes(mahaLord)) {
      evaluation.score += 1;
      evaluation.favorable.push(`${mahaLord} Mahadasha provides support`);
    }

    // Check Antardasha lord
    if (rules.primaryDashaLords.includes(antarLord)) {
      evaluation.score += 2;
      evaluation.favorable.push(`${antarLord} Antardasha strongly favors this period`);
    } else if (rules.supportiveDashaLords && rules.supportiveDashaLords.includes(antarLord)) {
      evaluation.score += 1;
      evaluation.favorable.push(`${antarLord} Antardasha is supportive`);
    }

    // Check for challenging dashas
    if (rules.criticalDashaLords && rules.criticalDashaLords.includes(mahaLord)) {
      evaluation.score -= 2;
      evaluation.challenging.push(`${mahaLord} Mahadasha may create challenges`);
    }

    return evaluation;
  }

  /**
   * Evaluate transit favorability for specific event
   */
  evaluateTransitsForEvent(currentTransits, rules) {
    const evaluation = {
      score: 0,
      favorable: [],
      challenging: []
    };

    // Check required transits
    if (rules.requiredTransits) {
      for (const requirement of rules.requiredTransits) {
        const planetTransit = currentTransits.planetaryTransits[requirement.planet.toLowerCase()];
        if (planetTransit && requirement.houses.includes(planetTransit.transitHouse)) {
          evaluation.score += 2;
          evaluation.favorable.push(
            `${requirement.planet} transit through ${planetTransit.transitHouse}th house supports this event`
          );
        }
      }
    }

    // Check protective transits
    if (rules.protectiveTransits) {
      for (const protection of rules.protectiveTransits) {
        const planetTransit = currentTransits.planetaryTransits[protection.planet.toLowerCase()];
        if (planetTransit && protection.houses.includes(planetTransit.transitHouse)) {
          evaluation.score += 1;
          evaluation.favorable.push(
            `${protection.planet} provides protection through ${planetTransit.transitHouse}th house`
          );
        }
      }
    }

    // Check avoid transits
    if (rules.avoidTransits) {
      for (const avoid of rules.avoidTransits) {
        const planetTransit = currentTransits.planetaryTransits[avoid.planet.toLowerCase()];
        if (planetTransit && avoid.houses.includes(planetTransit.transitHouse)) {
          evaluation.score -= 1;
          evaluation.challenging.push(
            `${avoid.planet} transit through ${planetTransit.transitHouse}th house may create obstacles`
          );
        }
      }
    }

    // Check warning transits
    if (rules.warningTransits) {
      for (const warning of rules.warningTransits) {
        const planetTransit = currentTransits.planetaryTransits[warning.planet.toLowerCase()];
        if (planetTransit && warning.houses.includes(planetTransit.transitHouse)) {
          evaluation.score -= 2;
          evaluation.challenging.push(
            `${warning.planet} transit creates warning period for ${planetTransit.transitHouse}th house matters`
          );
        }
      }
    }

    return evaluation;
  }

  /**
   * Calculate bonus for favorable dasha-transit integration
   */
  calculateIntegrationBonus(currentDasha, currentTransits, rules) {
    const bonus = {
      bonus: 0,
      factors: []
    };

    if (!currentDasha.antardasha) return bonus;

    const antarLord = currentDasha.antardasha.lord.toLowerCase();
    const antarTransit = currentTransits.planetaryTransits[antarLord];

    if (antarTransit) {
      // Same planet dasha and transit
      bonus.bonus += 1;
      bonus.factors.push(
        `${antarLord} Antardasha with ${antarLord} transit creates powerful integration`
      );

      // Check if transit is in favorable house for the event
      if (rules.requiredTransits) {
        for (const requirement of rules.requiredTransits) {
          if (requirement.planet.toLowerCase() === antarLord &&
              requirement.houses.includes(antarTransit.transitHouse)) {
            bonus.bonus += 1;
            bonus.factors.push('Perfect dasha-transit alignment for this event');
          }
        }
      }
    }

    return bonus;
  }

  /**
   * Identify critical periods requiring special attention
   */
  identifyCriticalPeriods(currentDasha, currentTransits, sadeSati) {
    const criticalPeriods = [];

    // Check Sade Sati
    if (sadeSati.currentStatus.isActive) {
      criticalPeriods.push({
        type: 'sade_sati',
        description: `Sade Sati ${sadeSati.currentPhase.characteristics.name}`,
        intensity: sadeSati.overallIntensity.level,
        duration: sadeSati.remainingDuration,
        effects: sadeSati.currentPhase.characteristics.effects,
        recommendations: sadeSati.recommendations
      });
    }

    // Check for critical transit combinations
    const criticalTransits = this.identifyCriticalTransitCombinations(currentTransits);
    criticalPeriods.push(...criticalTransits);

    // Check for challenging dasha periods
    if (currentDasha.mahadasha) {
      const challengingDashas = ['Saturn', 'Rahu', 'Ketu'];
      if (challengingDashas.includes(currentDasha.mahadasha.lord)) {
        criticalPeriods.push({
          type: 'challenging_dasha',
          description: `${currentDasha.mahadasha.lord} Mahadasha`,
          intensity: 'High',
          effects: [`${currentDasha.mahadasha.lord} period brings life lessons and challenges`],
          recommendations: [`Focus on ${currentDasha.mahadasha.lord} remedies and spiritual practices`]
        });
      }
    }

    return criticalPeriods;
  }

  /**
   * Identify critical transit combinations
   */
  identifyCriticalTransitCombinations(currentTransits) {
    const critical = [];

    // Check for multiple malefics in Kendra houses
    const kendraHouses = [1, 4, 7, 10];
    const malefics = ['mars', 'saturn', 'rahu', 'ketu'];

    for (const house of kendraHouses) {
      const maleficsInHouse = [];
      for (const malefic of malefics) {
        const transit = currentTransits.planetaryTransits[malefic];
        if (transit && transit.transitHouse === house) {
          maleficsInHouse.push(malefic);
        }
      }

      if (maleficsInHouse.length >= 2) {
        critical.push({
          type: 'malefic_combination',
          description: `Multiple malefics in ${house}th house`,
          intensity: 'High',
          effects: [`Challenges in ${house}th house matters`],
          recommendations: ['Extra caution needed', 'Strengthen spiritual practices']
        });
      }
    }

    return critical;
  }

  /**
   * Calculate overall influence of current period
   */
  calculateOverallInfluence(currentDasha, currentTransits, sadeSati) {
    let totalScore = 5; // Neutral baseline
    const influences = [];

    // Dasha influence
    if (currentDasha.mahadasha) {
      const dashaInfluence = this.getDashaInfluence(currentDasha.mahadasha.lord);
      totalScore += dashaInfluence.score;
      influences.push(dashaInfluence.description);
    }

    // Transit influence
    const transitInfluence = currentTransits.transitStrength.overall;
    totalScore += (transitInfluence - 5); // Adjust from baseline
    influences.push(`Transit strength: ${currentTransits.transitStrength.level}`);

    // Sade Sati influence
    if (sadeSati.currentStatus.isActive) {
      totalScore -= 2; // Generally challenging
      influences.push(`Sade Sati ${sadeSati.currentPhase.characteristics.name}`);
    }

    return {
      score: Math.max(1, Math.min(10, totalScore)),
      level: this.getInfluenceLevel(totalScore),
      influences: influences,
      recommendation: this.getOverallRecommendation(totalScore)
    };
  }

  /**
   * Generate integrated recommendations
   */
  generateIntegratedRecommendations(analysis) {
    const recommendations = [];

    // Overall period assessment
    recommendations.push(
      `Current period influence: ${analysis.overallInfluence.level}`
    );

    // Dasha-specific advice
    if (analysis.currentDasha.combination) {
      recommendations.push(
        `Running ${analysis.currentDasha.combination} period`
      );
    }

    // Event timing advice
    const favorableEvents = Object.entries(analysis.eventPredictions)
      .filter(([_, prediction]) => prediction.timing === 'Favorable')
      .map(([event, _]) => event);

    if (favorableEvents.length > 0) {
      recommendations.push(
        `Favorable time for: ${favorableEvents.join(', ')}`
      );
    }

    // Transit recommendations
    recommendations.push(...analysis.currentTransits.recommendations);

    // Critical period warnings
    if (analysis.criticalPeriods.length > 0) {
      recommendations.push('Critical periods requiring attention:');
      for (const period of analysis.criticalPeriods) {
        recommendations.push(`- ${period.description}`);
      }
    }

    // Sade Sati specific
    if (analysis.sadeSati.currentStatus.isActive) {
      recommendations.push('Sade Sati remedies recommended');
      recommendations.push(...analysis.sadeSati.recommendations.slice(0, 3));
    }

    return recommendations;
  }

  // Helper methods
  getTimingAssessment(score, minimumScore) {
    if (score >= minimumScore + 2) return 'Very Favorable';
    if (score >= minimumScore) return 'Favorable';
    if (score >= minimumScore - 2) return 'Neutral';
    if (score >= minimumScore - 4) return 'Challenging';
    return 'Unfavorable';
  }

  getDashaInfluence(planet) {
    const influences = {
      'Sun': { score: 1, description: 'Authority and leadership focus' },
      'Moon': { score: 0, description: 'Emotional and mental focus' },
      'Mars': { score: 0, description: 'Action and conflict focus' },
      'Mercury': { score: 1, description: 'Communication and learning focus' },
      'Jupiter': { score: 2, description: 'Wisdom and growth focus' },
      'Venus': { score: 1, description: 'Relationships and pleasure focus' },
      'Saturn': { score: -1, description: 'Discipline and limitation focus' },
      'Rahu': { score: 0, description: 'Ambition and material focus' },
      'Ketu': { score: -1, description: 'Spiritual and detachment focus' }
    };

    return influences[planet] || { score: 0, description: 'Mixed influences' };
  }

  getInfluenceLevel(score) {
    if (score >= 8) return 'Very Positive';
    if (score >= 6) return 'Positive';
    if (score >= 4) return 'Neutral';
    if (score >= 2) return 'Challenging';
    return 'Very Challenging';
  }

  getOverallRecommendation(score) {
    if (score >= 7) return 'Excellent time for major initiatives';
    if (score >= 5) return 'Good time for planned activities';
    if (score >= 3) return 'Proceed with caution';
    return 'Focus on spiritual practices and patience';
  }

  generateEventRecommendations(eventType, analysis, currentDasha, currentTransits) {
    const recommendations = [];

    if (analysis.timing === 'Favorable' || analysis.timing === 'Very Favorable') {
      recommendations.push(`This is a favorable time for ${eventType}`);
      recommendations.push('Take positive action while conditions are supportive');
    } else {
      recommendations.push(`Exercise patience regarding ${eventType}`);
      recommendations.push('Use this time for preparation and spiritual growth');
    }

    return recommendations;
  }
}

module.exports = TransitDashaIntegrator;
