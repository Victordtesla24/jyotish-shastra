/**
 * ExaltationCalculator - Planetary Dignity Analysis
 * 
 * Calculates planetary dignities (exaltation, debilitation, own sign, etc.)
 * following classical Vedic astrology principles
 */

class ExaltationCalculator {
  constructor() {
    // Planetary exaltation data with exact degrees
    this.exaltationData = {
      'Sun': { sign: 'Aries', exactDegree: 10, range: [0, 30] },
      'Moon': { sign: 'Taurus', exactDegree: 3, range: [0, 30] },
      'Mars': { sign: 'Capricorn', exactDegree: 28, range: [0, 30] },
      'Mercury': { sign: 'Virgo', exactDegree: 15, range: [0, 30] },
      'Jupiter': { sign: 'Cancer', exactDegree: 5, range: [0, 30] },
      'Venus': { sign: 'Pisces', exactDegree: 27, range: [0, 30] },
      'Saturn': { sign: 'Libra', exactDegree: 20, range: [0, 30] },
      'Rahu': { sign: 'Gemini', exactDegree: 15, range: [0, 30] },
      'Ketu': { sign: 'Sagittarius', exactDegree: 15, range: [0, 30] }
    };

    // Planetary debilitation data (opposite of exaltation)
    this.debilitationData = {
      'Sun': { sign: 'Libra', exactDegree: 10, range: [0, 30] },
      'Moon': { sign: 'Scorpio', exactDegree: 3, range: [0, 30] },
      'Mars': { sign: 'Cancer', exactDegree: 28, range: [0, 30] },
      'Mercury': { sign: 'Pisces', exactDegree: 15, range: [0, 30] },
      'Jupiter': { sign: 'Capricorn', exactDegree: 5, range: [0, 30] },
      'Venus': { sign: 'Virgo', exactDegree: 27, range: [0, 30] },
      'Saturn': { sign: 'Aries', exactDegree: 20, range: [0, 30] },
      'Rahu': { sign: 'Sagittarius', exactDegree: 15, range: [0, 30] },
      'Ketu': { sign: 'Gemini', exactDegree: 15, range: [0, 30] }
    };

    // Own signs (planetary rulership)
    this.ownSigns = {
      'Sun': ['Leo'],
      'Moon': ['Cancer'],
      'Mars': ['Aries', 'Scorpio'],
      'Mercury': ['Gemini', 'Virgo'],
      'Jupiter': ['Sagittarius', 'Pisces'],
      'Venus': ['Taurus', 'Libra'],
      'Saturn': ['Capricorn', 'Aquarius'],
      'Rahu': [], // Shadow planets don't own signs
      'Ketu': []
    };

    // Moolatrikona signs (special dignity)
    this.moolatrikonaSigns = {
      'Sun': { sign: 'Leo', range: [0, 20] },
      'Moon': { sign: 'Taurus', range: [4, 20] },
      'Mars': { sign: 'Aries', range: [0, 12] },
      'Mercury': { sign: 'Virgo', range: [16, 20] },
      'Jupiter': { sign: 'Sagittarius', range: [0, 10] },
      'Venus': { sign: 'Libra', range: [0, 15] },
      'Saturn': { sign: 'Aquarius', range: [0, 20] }
    };
  }

  /**
   * Calculate complete planetary dignity
   * @param {string} planetName - Name of the planet
   * @param {string} signName - Sign the planet is in
   * @param {number} degreeInSign - Degree within the sign (0-30)
   * @returns {Object} Complete dignity analysis
   */
  calculateDignity(planetName, signName, degreeInSign) {
    const dignity = {
      planet: planetName,
      sign: signName,
      degree: degreeInSign,
      primaryDignity: 'neutral',
      dignityScore: 50,
      isExalted: false,
      isDebilitated: false,
      isOwnSign: false,
      isMoolatrikona: false,
      exactnessScore: 0,
      dignitySymbol: '',
      dignityColor: '#6b7280',
      strength: 'average',
      description: '',
      recommendations: []
    };

    // Check exaltation
    const exaltationInfo = this.checkExaltation(planetName, signName, degreeInSign);
    if (exaltationInfo.isExalted) {
      dignity.isExalted = true;
      dignity.primaryDignity = 'exalted';
      dignity.dignityScore = 90 + exaltationInfo.exactnessBonus;
      dignity.exactnessScore = exaltationInfo.exactnessScore;
      dignity.dignitySymbol = '↑';
      dignity.dignityColor = '#10b981';
      dignity.strength = 'excellent';
      dignity.description = `${planetName} is exalted in ${signName}`;
    }

    // Check debilitation
    const debilitationInfo = this.checkDebilitation(planetName, signName, degreeInSign);
    if (debilitationInfo.isDebilitated) {
      dignity.isDebilitated = true;
      dignity.primaryDignity = 'debilitated';
      dignity.dignityScore = 10 - debilitationInfo.exactnessBonus;
      dignity.exactnessScore = debilitationInfo.exactnessScore;
      dignity.dignitySymbol = '↓';
      dignity.dignityColor = '#ef4444';
      dignity.strength = 'weak';
      dignity.description = `${planetName} is debilitated in ${signName}`;
    }

    // Check own sign (if not exalted/debilitated)
    if (!dignity.isExalted && !dignity.isDebilitated) {
      const ownSignInfo = this.checkOwnSign(planetName, signName);
      if (ownSignInfo.isOwnSign) {
        dignity.isOwnSign = true;
        dignity.primaryDignity = 'own';
        dignity.dignityScore = 75;
        dignity.dignityColor = '#f59e0b';
        dignity.strength = 'good';
        dignity.description = `${planetName} is in its own sign ${signName}`;
      }
    }

    // Check Moolatrikona (special case of own sign)
    const moolatrikonaInfo = this.checkMoolatrikona(planetName, signName, degreeInSign);
    if (moolatrikonaInfo.isMoolatrikona) {
      dignity.isMoolatrikona = true;
      if (dignity.primaryDignity === 'own') {
        dignity.primaryDignity = 'moolatrikona';
        dignity.dignityScore = 80;
        dignity.description = `${planetName} is in Moolatrikona in ${signName}`;
      }
    }

    // Generate recommendations
    dignity.recommendations = this.generateDignityRecommendations(dignity);

    return dignity;
  }

  /**
   * Check if planet is exalted
   */
  checkExaltation(planetName, signName, degreeInSign) {
    const exaltationInfo = this.exaltationData[planetName];
    if (!exaltationInfo || exaltationInfo.sign !== signName) {
      return { isExalted: false, exactnessScore: 0, exactnessBonus: 0 };
    }

    const exactDegree = exaltationInfo.exactDegree;
    const degreeDifference = Math.abs(degreeInSign - exactDegree);
    const exactnessScore = Math.max(0, 100 - (degreeDifference * 10));
    const exactnessBonus = exactnessScore / 10;

    return {
      isExalted: true,
      exactnessScore: exactnessScore,
      exactnessBonus: exactnessBonus,
      exactDegree: exactDegree,
      degreeDifference: degreeDifference
    };
  }

  /**
   * Check if planet is debilitated
   */
  checkDebilitation(planetName, signName, degreeInSign) {
    const debilitationInfo = this.debilitationData[planetName];
    if (!debilitationInfo || debilitationInfo.sign !== signName) {
      return { isDebilitated: false, exactnessScore: 0, exactnessBonus: 0 };
    }

    const exactDegree = debilitationInfo.exactDegree;
    const degreeDifference = Math.abs(degreeInSign - exactDegree);
    const exactnessScore = Math.max(0, 100 - (degreeDifference * 10));
    const exactnessBonus = exactnessScore / 10;

    return {
      isDebilitated: true,
      exactnessScore: exactnessScore,
      exactnessBonus: exactnessBonus,
      exactDegree: exactDegree,
      degreeDifference: degreeDifference
    };
  }

  /**
   * Check if planet is in own sign
   */
  checkOwnSign(planetName, signName) {
    const ownSigns = this.ownSigns[planetName] || [];
    return {
      isOwnSign: ownSigns.includes(signName),
      ownSigns: ownSigns
    };
  }

  /**
   * Check if planet is in Moolatrikona
   */
  checkMoolatrikona(planetName, signName, degreeInSign) {
    const moolatrikonaInfo = this.moolatrikonaSigns[planetName];
    if (!moolatrikonaInfo || moolatrikonaInfo.sign !== signName) {
      return { isMoolatrikona: false };
    }

    const [minDegree, maxDegree] = moolatrikonaInfo.range;
    const isMoolatrikona = degreeInSign >= minDegree && degreeInSign <= maxDegree;

    return {
      isMoolatrikona: isMoolatrikona,
      range: moolatrikonaInfo.range
    };
  }

  /**
   * Calculate Neecha Bhanga (debilitation cancellation)
   */
  checkNeechaBhanga(planetName, signName, degreeInSign, chartData) {
    const neechaBhanga = {
      isActive: false,
      type: '',
      strength: 0,
      description: ''
    };

    if (!this.checkDebilitation(planetName, signName, degreeInSign).isDebilitated) {
      return neechaBhanga;
    }

    // Rule 1: Lord of debilitation sign is exalted
    const debilitationSignLord = this.getSignLord(signName);
    const lordDignity = this.findPlanetDignity(debilitationSignLord, chartData);
    if (lordDignity && lordDignity.isExalted) {
      neechaBhanga.isActive = true;
      neechaBhanga.type = 'lord_exalted';
      neechaBhanga.strength = 75;
      neechaBhanga.description = 'Lord of debilitation sign is exalted';
    }

    // Rule 2: Debilitated planet is exalted in Navamsa
    // (Would need Navamsa data to check)

    // Rule 3: Lord of exaltation sign of debilitated planet is in Kendra
    // (Complex calculation - simplified here)

    return neechaBhanga;
  }

  /**
   * Get sign lord
   */
  getSignLord(signName) {
    const signLords = {
      'Aries': 'Mars', 'Taurus': 'Venus', 'Gemini': 'Mercury',
      'Cancer': 'Moon', 'Leo': 'Sun', 'Virgo': 'Mercury',
      'Libra': 'Venus', 'Scorpio': 'Mars', 'Sagittarius': 'Jupiter',
      'Capricorn': 'Saturn', 'Aquarius': 'Saturn', 'Pisces': 'Jupiter'
    };
    return signLords[signName];
  }

  /**
   * Find planet dignity in chart
   */
  findPlanetDignity(planetName, chartData) {
    if (!chartData.planets) return null;

    const planet = chartData.planets.find(p => p.name === planetName);
    if (!planet) return null;

    const degreeInSign = planet.degree % 30;
    return this.calculateDignity(planetName, planet.sign, degreeInSign);
  }

  /**
   * Generate dignity-based recommendations
   */
  generateDignityRecommendations(dignity) {
    const recommendations = [];

    switch (dignity.primaryDignity) {
      case 'exalted':
        recommendations.push('This is an excellent planetary position');
        recommendations.push('The planet will give very positive results');
        recommendations.push('Use this strong energy for growth and success');
        if (dignity.exactnessScore > 80) {
          recommendations.push('Near-exact exaltation - exceptional strength');
        }
        break;

      case 'debilitated':
        recommendations.push('This planet needs strengthening');
        recommendations.push('Consider specific remedies to mitigate weakness');
        recommendations.push('Be cautious in matters related to this planet');
        if (dignity.exactnessScore > 80) {
          recommendations.push('Deep debilitation - requires careful attention');
        }
        break;

      case 'moolatrikona':
        recommendations.push('Planet is in a very auspicious position');
        recommendations.push('Will give stable and positive results');
        break;

      case 'own':
        recommendations.push('Planet is comfortable in its own sign');
        recommendations.push('Will give moderate to good results');
        break;

      default:
        recommendations.push('Planet is in a neutral position');
        recommendations.push('Results depend on other factors');
    }

    return recommendations;
  }

  /**
   * Calculate planetary dignity for entire chart
   */
  calculateChartDignities(chartData) {
    const dignities = {};

    if (!chartData.planets) return dignities;

    chartData.planets.forEach(planet => {
      const degreeInSign = planet.degree % 30;
      dignities[planet.name] = this.calculateDignity(
        planet.name,
        planet.sign,
        degreeInSign
      );
    });

    return dignities;
  }

  /**
   * Get dignity summary for chart
   */
  getChartDignitySummary(chartData) {
    const dignities = this.calculateChartDignities(chartData);

    const summary = {
      exalted: [],
      debilitated: [],
      ownSign: [],
      moolatrikona: [],
      neutral: [],
      averageStrength: 0,
      strongestPlanet: null,
      weakestPlanet: null
    };

    let totalScore = 0;
    let maxScore = 0;
    let minScore = 100;

    Object.entries(dignities).forEach(([planetName, dignity]) => {
      totalScore += dignity.dignityScore;

      if (dignity.dignityScore > maxScore) {
        maxScore = dignity.dignityScore;
        summary.strongestPlanet = { planet: planetName, ...dignity };
      }

      if (dignity.dignityScore < minScore) {
        minScore = dignity.dignityScore;
        summary.weakestPlanet = { planet: planetName, ...dignity };
      }

      // Categorize dignities
      if (dignity.isExalted) summary.exalted.push(planetName);
      else if (dignity.isDebilitated) summary.debilitated.push(planetName);
      else if (dignity.isMoolatrikona) summary.moolatrikona.push(planetName);
      else if (dignity.isOwnSign) summary.ownSign.push(planetName);
      else summary.neutral.push(planetName);
    });

    summary.averageStrength = totalScore / Object.keys(dignities).length;

    return summary;
  }
}

export default ExaltationCalculator;