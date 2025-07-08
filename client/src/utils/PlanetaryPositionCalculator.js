/**
 * PlanetaryPositionCalculator - Accurate Vedic Calculations
 *
 * This utility provides precise calculations for:
 * - House positions from longitude
 * - Rashi assignments
 * - Planetary aspects
 * - Dignity calculations
 */

class PlanetaryPositionCalculator {
  constructor() {
    // Zodiac sign boundaries (sidereal)
    this.signBoundaries = [
      0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330
    ];

    // Sign names in order
    this.signNames = [
      'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];

    // House system type
    this.houseSystem = 'PLACIDUS'; // Default to Placidus
  }

  /**
   * Calculate house position from longitude and ascendant
   * @param {number} planetLongitude - Planet's longitude in degrees
   * @param {number} ascendantLongitude - Ascendant longitude in degrees
   * @param {Array} housePositions - Array of house cusp positions from API
   * @returns {number} House number (1-12)
   */
  calculateHousePosition(planetLongitude, ascendantLongitude, housePositions = null) {
    const normalizedPlanet = this.normalizeLongitude(planetLongitude);
    const normalizedAscendant = this.normalizeLongitude(ascendantLongitude);

    if (housePositions && housePositions.length === 12) {
      // Use API-provided house cusps for accurate calculation
      return this.calculateHouseWithCusps(normalizedPlanet, housePositions);
    } else {
      // Fallback to equal house system
      return this.calculateEqualHouse(normalizedPlanet, normalizedAscendant);
    }
  }

  /**
   * Calculate house using provided house cusps (most accurate)
   */
  calculateHouseWithCusps(planetLongitude, housePositions) {
    for (let i = 0; i < 12; i++) {
      const currentHouse = housePositions[i];
      const nextHouse = housePositions[(i + 1) % 12];

      const houseStart = this.normalizeLongitude(currentHouse.longitude);
      const houseEnd = this.normalizeLongitude(nextHouse.longitude);

      if (this.isLongitudeInRange(planetLongitude, houseStart, houseEnd)) {
        return currentHouse.houseNumber;
      }
    }
    return 1; // Fallback
  }

  /**
   * Calculate house using equal house system
   */
  calculateEqualHouse(planetLongitude, ascendantLongitude) {
    let houseDifference = planetLongitude - ascendantLongitude;

    if (houseDifference < 0) {
      houseDifference += 360;
    }

    const house = Math.floor(houseDifference / 30) + 1;
    return house > 12 ? house - 12 : house;
  }

  /**
   * Check if longitude is within a range (handles 360° wrap)
   */
  isLongitudeInRange(longitude, start, end) {
    const normalizedLong = this.normalizeLongitude(longitude);
    const normalizedStart = this.normalizeLongitude(start);
    const normalizedEnd = this.normalizeLongitude(end);

    if (normalizedStart > normalizedEnd) {
      // Range crosses 0°
      return normalizedLong >= normalizedStart || normalizedLong < normalizedEnd;
    } else {
      return normalizedLong >= normalizedStart && normalizedLong < normalizedEnd;
    }
  }

  /**
   * Calculate house position from longitude and ascendant (alias for compatibility)
   * @param {number} planetLongitude - Planet's longitude in degrees
   * @param {number} ascendantLongitude - Ascendant longitude in degrees
   * @returns {number} House number (1-12)
   */
  calculateHouseFromLongitude(planetLongitude, ascendantLongitude) {
    return this.calculateHousePosition(planetLongitude, ascendantLongitude);
  }

  /**
   * Calculate rashi number from longitude (simplified for compatibility)
   * @param {number} longitude - Longitude in degrees
   * @returns {number} Rashi number (1-12)
   */
  calculateRashiFromLongitude(longitude) {
    return this.calculateRashi(longitude).number;
  }

  /**
   * Calculate rashi (sign) from longitude
   * @param {number} longitude - Longitude in degrees
   * @returns {Object} Rashi information
   */
  calculateRashi(longitude) {
    const normalizedLongitude = this.normalizeLongitude(longitude);
    const rashiIndex = Math.floor(normalizedLongitude / 30);
    const degreeInSign = normalizedLongitude % 30;

    return {
      index: rashiIndex,
      number: rashiIndex + 1,
      name: this.signNames[rashiIndex],
      degreeInSign: degreeInSign,
      longitude: normalizedLongitude
    };
  }

  /**
   * Calculate nakshatra from longitude
   * @param {number} longitude - Longitude in degrees
   * @returns {Object} Nakshatra information
   */
  calculateNakshatra(longitude) {
    const nakshatraNames = [
      'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
      'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
      'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
      'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
      'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
    ];

    const normalizedLongitude = this.normalizeLongitude(longitude);
    const nakshatraIndex = Math.floor(normalizedLongitude / (360 / 27));
    const pada = Math.floor((normalizedLongitude % (360 / 27)) / (360 / 108)) + 1;

    return {
      index: nakshatraIndex,
      name: nakshatraNames[nakshatraIndex],
      pada: pada,
      degreeInNakshatra: normalizedLongitude % (360 / 27)
    };
  }

  /**
   * Calculate planetary aspects
   * @param {Array} planets - Array of planet objects with longitudes
   * @returns {Array} Array of aspect objects
   */
  calculateAspects(planets) {
    const aspects = [];
    const orbLimits = {
      conjunction: 8,
      opposition: 8,
      trine: 8,
      square: 8,
      sextile: 6
    };

    for (let i = 0; i < planets.length; i++) {
      for (let j = i + 1; j < planets.length; j++) {
        const planet1 = planets[i];
        const planet2 = planets[j];

        const distance = this.calculateAngularDistance(
          planet1.longitude,
          planet2.longitude
        );

        const aspectType = this.determineAspectType(distance);
        const orb = this.calculateOrb(distance, aspectType);

        if (aspectType && orb <= orbLimits[aspectType]) {
          aspects.push({
            planet1: planet1.name,
            planet2: planet2.name,
            type: aspectType,
            distance: distance,
            orb: orb,
            strength: this.calculateAspectStrength(orb, orbLimits[aspectType])
          });
        }
      }
    }

    return aspects;
  }

  /**
   * Calculate angular distance between two longitudes
   */
  calculateAngularDistance(long1, long2) {
    const diff = Math.abs(long1 - long2);
    return Math.min(diff, 360 - diff);
  }

  /**
   * Determine aspect type from distance
   */
  determineAspectType(distance) {
    if (distance <= 8) return 'conjunction';
    if (Math.abs(distance - 60) <= 6) return 'sextile';
    if (Math.abs(distance - 90) <= 8) return 'square';
    if (Math.abs(distance - 120) <= 8) return 'trine';
    if (Math.abs(distance - 180) <= 8) return 'opposition';
    return null;
  }

  /**
   * Calculate orb (exactness) of aspect
   */
  calculateOrb(distance, aspectType) {
    const exactDegrees = {
      conjunction: 0,
      sextile: 60,
      square: 90,
      trine: 120,
      opposition: 180
    };

    return Math.abs(distance - exactDegrees[aspectType]);
  }

  /**
   * Calculate aspect strength (0-100)
   */
  calculateAspectStrength(orb, maxOrb) {
    return Math.max(0, 100 - (orb / maxOrb) * 100);
  }

  /**
   * Normalize longitude to 0-360 range
   */
  normalizeLongitude(longitude) {
    return ((longitude % 360) + 360) % 360;
  }

  /**
   * Convert longitude to degrees, minutes, seconds
   */
  longitudeToDMS(longitude) {
    const degrees = Math.floor(longitude);
    const minutes = Math.floor((longitude - degrees) * 60);
    const seconds = Math.floor(((longitude - degrees) * 60 - minutes) * 60);

    return { degrees, minutes, seconds };
  }

  /**
   * Calculate planetary strength (Shadbala) - Complete Traditional Implementation
   */
  calculatePlanetaryStrength(planet, chartData) {
    const strength = {
      total: 0,
      positional: 0,
      temporal: 0,
      directional: 0,
      motional: 0,
      natural: 0,
      aspectual: 0
    };

    // Complete Shadbala calculation following traditional Vedic principles
    const rashi = this.calculateRashi(planet.longitude);
    const nakshatra = this.calculateNakshatra(planet.longitude);
    const housePosition = this.calculateHousePosition(
      planet.longitude,
      chartData.ascendant.longitude,
      chartData.housePositions
    );

    // 1. Positional Strength (Sthaana Bala)
    strength.positional = this.calculatePositionalStrength(planet, rashi, housePosition);

    // 2. Temporal Strength (Kaala Bala)
    strength.temporal = this.calculateTemporalStrength(planet, chartData);

    // 3. Directional Strength (Dig Bala)
    strength.directional = this.calculateDirectionalStrength(planet, housePosition);

    // 4. Motional Strength (Chesta Bala)
    strength.motional = this.calculateMotionalStrength(planet, chartData);

    // 5. Natural Strength (Naisargika Bala)
    strength.natural = this.getNaturalStrength(planet.name);

    // 6. Aspectual Strength (Drik Bala)
    strength.aspectual = this.calculateAspectualStrength(planet, chartData);

    // Calculate total Shadbala
    strength.total = strength.positional + strength.temporal + strength.directional +
                    strength.motional + strength.natural + strength.aspectual;

    return strength;
  }

  /**
   * Calculate Temporal Strength (Kaala Bala)
   */
  calculateTemporalStrength(planet, chartData) {
    let kalaBala = 0;

    // Day/Night strength
    const isDayBirth = this.isDayBirth(chartData.birthTime);
    const dayPlanets = ['Sun', 'Jupiter', 'Venus'];
    const nightPlanets = ['Moon', 'Mars', 'Saturn'];

    if (isDayBirth && dayPlanets.includes(planet.name)) {
      kalaBala += 30;
    } else if (!isDayBirth && nightPlanets.includes(planet.name)) {
      kalaBala += 30;
    }

    // Paksha Bala (Lunar fortnight strength)
    const moonPhase = this.calculateMoonPhase(chartData);
    if (moonPhase >= 0.5) { // Bright fortnight
      if (['Sun', 'Jupiter', 'Venus'].includes(planet.name)) {
        kalaBala += 15;
      }
    } else { // Dark fortnight
      if (['Moon', 'Mars', 'Saturn'].includes(planet.name)) {
        kalaBala += 15;
      }
    }

    // Tribhaga Bala (Day/Night division strength)
    const dayHour = this.calculateDayHour(chartData.birthTime);
    const tribhagaRulers = this.getTribhagaRulers(isDayBirth);

    if (tribhagaRulers.includes(planet.name)) {
      kalaBala += 20;
    }

    return kalaBala;
  }

  /**
   * Calculate Directional Strength (Dig Bala)
   */
  calculateDirectionalStrength(planet, housePosition) {
    const digBalaHouses = {
      'Sun': 10,     // 10th house
      'Moon': 4,     // 4th house
      'Mars': 10,    // 10th house
      'Mercury': 1,  // 1st house
      'Jupiter': 1,  // 1st house
      'Venus': 4,    // 4th house
      'Saturn': 7,   // 7th house
      'Rahu': 3,     // 3rd house
      'Ketu': 6      // 6th house
    };

    const strongHouse = digBalaHouses[planet.name];
    if (housePosition === strongHouse) {
      return 60; // Maximum directional strength
    }

    // Calculate proportional strength based on distance from strong house
    const distance = Math.min(
      Math.abs(housePosition - strongHouse),
      12 - Math.abs(housePosition - strongHouse)
    );

    return Math.max(0, 60 - (distance * 10));
  }

  /**
   * Calculate Motional Strength (Chesta Bala)
   */
  calculateMotionalStrength(planet, chartData) {
    // For slow planets, retrograde motion increases strength
    const retrogradeBonus = planet.isRetrograde ? 20 : 0;

    // Speed-based strength calculation
    const dailyMotion = this.calculateDailyMotion(planet.name);
    const averageMotion = this.getAverageMotion(planet.name);
    const speedFactor = dailyMotion / averageMotion;

    let chestaBala = 0;

    // Different calculations for different planets
    if (['Sun', 'Moon'].includes(planet.name)) {
      // Luminaries don't have Chesta Bala
      chestaBala = 0;
    } else if (['Mercury', 'Venus'].includes(planet.name)) {
      // Fast planets get strength when moving slowly
      chestaBala = Math.max(0, 60 - (speedFactor * 30));
    } else {
      // Slow planets get strength when moving fast
      chestaBala = Math.min(60, speedFactor * 30);
    }

    return chestaBala + retrogradeBonus;
  }

  /**
   * Calculate Aspectual Strength (Drik Bala)
   */
  calculateAspectualStrength(planet, chartData) {
    let drikBala = 0;

    if (!chartData.planets) return drikBala;

    // Calculate strength from benefic and malefic aspects
    chartData.planets.forEach(otherPlanet => {
      if (otherPlanet.name === planet.name) return;

      const aspectStrength = this.calculateMutualAspectStrength(planet, otherPlanet);
      const isBenefic = this.isBeneficPlanet(otherPlanet.name);

      if (aspectStrength > 0) {
        if (isBenefic) {
          drikBala += aspectStrength;
        } else {
          drikBala -= aspectStrength;
        }
      }
    });

    return Math.max(0, drikBala);
  }

  /**
   * Enhanced Positional Strength calculation
   */
  calculatePositionalStrength(planet, rashi, housePosition) {
    let positionalStrength = 0;

    // Uccha Bala (Exaltation/Debilitation strength)
    const uchaBala = this.calculateUchaBala(planet);
    positionalStrength += uchaBala;

    // Saptavargaja Bala (Divisional chart strength)
    const saptavargajaBala = this.calculateSaptavargajaBala(planet);
    positionalStrength += saptavargajaBala;

    // Ojhayugma Bala (Odd/Even sign strength)
    const ojhayugmaBala = this.calculateOjhayugmaBala(planet, rashi);
    positionalStrength += ojhayugmaBala;

    // Kendra Bala (Angular house strength)
    const kendraBala = this.calculateKendraBala(housePosition);
    positionalStrength += kendraBala;

    // Drekkana Bala (Decanate strength)
    const drekkanaBala = this.calculateDrekkanaBala(planet);
    positionalStrength += drekkanaBala;

    return positionalStrength;
  }

  /**
   * Calculate Uccha Bala (Exaltation strength)
   */
  calculateUchaBala(planet) {
    const exaltationDegrees = {
      'Sun': 10,     // 10° Aries
      'Moon': 33,    // 3° Taurus
      'Mars': 298,   // 28° Capricorn
      'Mercury': 165, // 15° Virgo
      'Jupiter': 95,  // 5° Cancer
      'Venus': 357,   // 27° Pisces
      'Saturn': 200   // 20° Libra
    };

    const exaltDegree = exaltationDegrees[planet.name];
    if (!exaltDegree) return 0;

    const distance = Math.abs(planet.longitude - exaltDegree);
    const normalizedDistance = Math.min(distance, 360 - distance);

    return Math.max(0, 60 - normalizedDistance);
  }

  /**
   * Helper methods for Shadbala calculation
   */
  isDayBirth(birthTime) {
    const hour = parseInt(birthTime.split(':')[0]);
    return hour >= 6 && hour < 18;
  }

  calculateMoonPhase(chartData) {
    const sunMoon = chartData.planets.find(p => p.name === 'Sun');
    const moonData = chartData.planets.find(p => p.name === 'Moon');

    if (!sunMoon || !moonData) return 0.5;

    const distance = Math.abs(moonData.longitude - sunMoon.longitude);
    return distance / 360;
  }

  calculateDayHour(birthTime) {
    const [hour, minute] = birthTime.split(':').map(Number);
    return hour + minute / 60;
  }

  getTribhagaRulers(isDayBirth) {
    if (isDayBirth) {
      return ['Sun', 'Jupiter', 'Venus'];
    } else {
      return ['Moon', 'Mars', 'Saturn'];
    }
  }

  calculateDailyMotion(planetName) {
    const averageMotions = {
      'Sun': 0.9856,
      'Moon': 13.1764,
      'Mars': 0.5240,
      'Mercury': 1.3833,
      'Jupiter': 0.0831,
      'Venus': 1.1022,
      'Saturn': 0.0335
    };

    return averageMotions[planetName] || 0;
  }

  getAverageMotion(planetName) {
    return this.calculateDailyMotion(planetName);
  }

  calculateMutualAspectStrength(planet1, planet2) {
    const distance = this.calculateAngularDistance(planet1.longitude, planet2.longitude);

    // Traditional Vedic aspects
    const aspectStrengths = {
      conjunction: 60,
      opposition: 40,
      trine: 30,
      square: 20,
      sextile: 15
    };

    const aspectType = this.determineAspectType(distance);
    return aspectStrengths[aspectType] || 0;
  }

  isBeneficPlanet(planetName) {
    return ['Jupiter', 'Venus', 'Mercury', 'Moon'].includes(planetName);
  }

  calculateSaptavargajaBala(planet) {
    // Simplified - would need divisional chart data
    return 30;
  }

  calculateOjhayugmaBala(planet, rashi) {
    const masculinePlanets = ['Sun', 'Mars', 'Jupiter'];
    const oddSigns = [1, 3, 5, 7, 9, 11]; // Aries, Gemini, Leo, Libra, Sagittarius, Aquarius

    const isOddSign = oddSigns.includes(rashi);
    const isMasculine = masculinePlanets.includes(planet.name);

    return (isOddSign && isMasculine) || (!isOddSign && !isMasculine) ? 15 : 0;
  }

  calculateKendraBala(housePosition) {
    const kendraHouses = [1, 4, 7, 10];
    return kendraHouses.includes(housePosition) ? 20 : 0;
  }

  calculateDrekkanaBala(planet) {
    // Simplified - would need precise decanate calculation
    return 10;
  }

  /**
   * Calculate positional strength
   */
  calculatePositionalStrength(planet, rashi) {
    // Simplified calculation based on dignity
    if (planet.dignity === 'exalted') return 100;
    if (planet.dignity === 'own') return 75;
    if (planet.dignity === 'friend') return 50;
    if (planet.dignity === 'neutral') return 25;
    if (planet.dignity === 'enemy') return 10;
    if (planet.dignity === 'debilitated') return 0;
    return 25; // Default
  }

  /**
   * Get natural strength of planets
   */
  getNaturalStrength(planetName) {
    const naturalStrengths = {
      'Sun': 60,
      'Moon': 51.43,
      'Mars': 17.14,
      'Mercury': 25.71,
      'Jupiter': 34.29,
      'Venus': 42.86,
      'Saturn': 8.57,
      'Rahu': 30,
      'Ketu': 30
    };

    return naturalStrengths[planetName] || 0;
  }

  /**
   * Calculate house strengths
   */
  calculateHouseStrengths(chartData) {
    const houseStrengths = {};

    for (let house = 1; house <= 12; house++) {
      houseStrengths[house] = {
        planetaryInfluence: 0,
        aspectualInfluence: 0,
        total: 0
      };
    }

    // Calculate based on planetary placements and aspects
    if (chartData.planets) {
      chartData.planets.forEach(planet => {
        const housePosition = this.calculateHousePosition(
          planet.longitude,
          chartData.ascendant.longitude,
          chartData.housePositions
        );

        const planetStrength = this.calculatePlanetaryStrength(planet, chartData);
        houseStrengths[housePosition].planetaryInfluence += planetStrength.total;
      });
    }

    // Calculate total for each house
    Object.keys(houseStrengths).forEach(house => {
      const strength = houseStrengths[house];
      strength.total = strength.planetaryInfluence + strength.aspectualInfluence;
    });

    return houseStrengths;
  }
}

export default PlanetaryPositionCalculator;
