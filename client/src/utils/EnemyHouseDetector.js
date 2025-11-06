/**
 * EnemyHouseDetector - Planetary Friendship Analysis
 *
 * Determines planetary relationships and enemy houses
 * based on classical Vedic astrology principles
 */

class EnemyHouseDetector {
  constructor() {
    // Classical planetary friendship table
    this.planetaryFriendships = {
      'Sun': {
        friends: ['Moon', 'Mars', 'Jupiter'],
        enemies: ['Venus', 'Saturn'],
        neutral: ['Mercury', 'Rahu', 'Ketu']
      },
      'Moon': {
        friends: ['Sun', 'Mercury'],
        enemies: [],
        neutral: ['Mars', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu']
      },
      'Mars': {
        friends: ['Sun', 'Moon', 'Jupiter'],
        enemies: ['Mercury'],
        neutral: ['Venus', 'Saturn', 'Rahu', 'Ketu']
      },
      'Mercury': {
        friends: ['Sun', 'Venus'],
        enemies: ['Moon'],
        neutral: ['Mars', 'Jupiter', 'Saturn', 'Rahu', 'Ketu']
      },
      'Jupiter': {
        friends: ['Sun', 'Moon', 'Mars'],
        enemies: ['Mercury', 'Venus'],
        neutral: ['Saturn', 'Rahu', 'Ketu']
      },
      'Venus': {
        friends: ['Mercury', 'Saturn'],
        enemies: ['Sun', 'Moon'],
        neutral: ['Mars', 'Jupiter', 'Rahu', 'Ketu']
      },
      'Saturn': {
        friends: ['Mercury', 'Venus'],
        enemies: ['Sun', 'Moon', 'Mars'],
        neutral: ['Jupiter', 'Rahu', 'Ketu']
      },
      'Rahu': {
        friends: ['Mercury', 'Venus', 'Saturn'],
        enemies: ['Sun', 'Moon', 'Mars'],
        neutral: ['Jupiter', 'Ketu']
      },
      'Ketu': {
        friends: ['Mars', 'Venus', 'Saturn'],
        enemies: ['Sun', 'Moon'],
        neutral: ['Mercury', 'Jupiter', 'Rahu']
      }
    };

    // Sign lordships (planetary rulers)
    this.signLords = {
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
  }

  /**
   * Determine if a planet is in an enemy house
   * @param {string} planetName - Name of the planet
   * @param {string} signName - Sign the planet is in
   * @param {number} houseNumber - House number the planet is in
   * @param {Object} chartData - Complete chart data
   * @returns {Object} Enemy house analysis
   */
  isInEnemyHouse(planetName, signName, houseNumber, chartData) {
    const analysis = {
      isEnemyHouse: false,
      relationship: 'neutral',
      signLord: null,
      houseLord: null,
      signRelationship: 'neutral',
      houseRelationship: 'neutral',
      recommendations: []
    };

    // Get sign lord
    const signLord = this.signLords[signName];
    analysis.signLord = signLord;

    // Determine relationship with sign lord
    if (signLord) {
      analysis.signRelationship = this.getPlanetaryRelationship(planetName, signLord);
    }

    // Get house lord (lord of the sign in that house)
    const houseLord = this.getHouseLord(houseNumber, chartData);
    analysis.houseLord = houseLord;

    // Determine relationship with house lord
    if (houseLord) {
      analysis.houseRelationship = this.getPlanetaryRelationship(planetName, houseLord);
    }

    // Overall relationship analysis
    analysis.relationship = this.determineOverallRelationship(
      analysis.signRelationship,
      analysis.houseRelationship
    );

    // Determine if enemy house
    analysis.isEnemyHouse = (analysis.relationship === 'enemy');

    // Generate recommendations
    analysis.recommendations = this.generateRecommendations(planetName, analysis);

    return analysis;
  }

  /**
   * Get planetary relationship (friend/enemy/neutral)
   */
  getPlanetaryRelationship(planet1, planet2) {
    if (!planet1 || !planet2 || planet1 === planet2) return 'self';

    const relationships = this.planetaryFriendships[planet1];
    if (!relationships) return 'neutral';

    if (relationships.friends.includes(planet2)) return 'friend';
    if (relationships.enemies.includes(planet2)) return 'enemy';
    return 'neutral';
  }

  /**
   * Get the lord of a specific house
   */
  getHouseLord(houseNumber, chartData) {
    if (!chartData.housePositions || !chartData.ascendant) return null;

    // Find the sign in the specified house
    const housePosition = chartData.housePositions.find(h => h.houseNumber === houseNumber);
    if (!housePosition) return null;

    return this.signLords[housePosition.sign];
  }

  /**
   * Determine overall relationship considering both sign and house
   */
  determineOverallRelationship(signRelationship, houseRelationship) {
    // Priority: enemy > neutral > friend
    if (signRelationship === 'enemy' || houseRelationship === 'enemy') {
      return 'enemy';
    }
    if (signRelationship === 'friend' && houseRelationship === 'friend') {
      return 'friend';
    }
    return 'neutral';
  }

  /**
   * Generate remedial recommendations
   */
  generateRecommendations(planetName, analysis) {
    const recommendations = [];

    if (analysis.isEnemyHouse) {
      recommendations.push(`${planetName} is in an inimical position`);
      recommendations.push('Consider strengthening this planet through specific remedies');

      // Planet-specific recommendations
      const planetRemedies = {
        'Sun': ['Worship Lord Rama', 'Recite Aditya Hridaya', 'Wear ruby'],
        'Moon': ['Worship Lord Shiva', 'Recite Soma Stotram', 'Wear pearl'],
        'Mars': ['Worship Hanuman', 'Recite Mangal Kavach', 'Wear red coral'],
        'Mercury': ['Worship Lord Vishnu', 'Recite Budh Stotram', 'Wear emerald'],
        'Jupiter': ['Worship Lord Brihaspati', 'Recite Guru Stotram', 'Wear yellow sapphire'],
        'Venus': ['Worship Goddess Lakshmi', 'Recite Shukra Stotram', 'Wear diamond'],
        'Saturn': ['Worship Lord Shani', 'Recite Shani Chalisa', 'Wear blue sapphire'],
        'Rahu': ['Worship Lord Ganesha', 'Recite Rahu Stotram', 'Wear hessonite'],
        'Ketu': ['Worship Lord Kartikeya', 'Recite Ketu Stotram', 'Wear cat\'s eye']
      };

      if (planetRemedies[planetName]) {
        recommendations.push(...planetRemedies[planetName]);
      }
    } else if (analysis.relationship === 'friend') {
      recommendations.push(`${planetName} is well-placed and supportive`);
      recommendations.push('This placement brings positive results');
    }

    return recommendations;
  }

  /**
   * Analyze all planetary placements for enemy houses
   */
  analyzeAllPlacements(chartData) {
    const analysis = {};

    if (!chartData.planets) return analysis;

    chartData.planets.forEach(planet => {
      // CRITICAL FIX: Use ONLY API-provided house assignments (no recalculation)
      // API-provided house numbers are calculated using Placidus cusps in backend
      if (!planet.house || planet.house < 1 || planet.house > 12) {
        console.warn(`⚠️ Missing house assignment for ${planet.name}. Using API-provided house or skipping.`);
        return;
      }

      analysis[planet.name] = this.isInEnemyHouse(
        planet.name,
        planet.sign,
        planet.house,
        chartData
      );
    });

    return analysis;
  }

 

  /**
   * Get planetary strength in current position
   */
  getPlanetaryPositionStrength(planetName, signName) {
    const signLord = this.signLords[signName];
    const relationship = this.getPlanetaryRelationship(planetName, signLord);

    const strengthMap = {
      'friend': 75,
      'neutral': 50,
      'enemy': 25
    };

    return strengthMap[relationship] || 50;
  }

  /**
   * Generate enemy house color coding
   */
  getEnemyHouseColor(planetName, signName) {
    const signLord = this.signLords[signName];
    const relationship = this.getPlanetaryRelationship(planetName, signLord);

    const colorMap = {
      'enemy': '#ef4444',    // Red for enemy
      'neutral': '#6b7280',  // Gray for neutral
      'friend': '#10b981'    // Green for friend
    };

    return colorMap[relationship] || '#6b7280';
  }
}

export default EnemyHouseDetector;
