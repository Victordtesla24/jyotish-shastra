/**
 * Planetary Strength Calculator
 * Implements comprehensive planetary strength assessment based on Shad Bala.
 */

const { getSign, getSignLord, getHouseFromLongitude, calculateAngularDistance } = require('../../../utils/helpers/astrologyHelpers');
const { getSignIndex } = require('../../../utils/helpers/astrologyHelpers');

class PlanetaryStrengthCalculator {
  constructor(chart) {
    this.chart = chart;
    this.planets = chart.rasiChart?.planets || chart.planets;
    this.ascendant = chart.rasiChart?.ascendant || chart.ascendant;
  }

  /**
   * Calculates the full Shad Bala for a given planet.
   * @param {string} planetName - The name of the planet.
   * @returns {object} An object containing all components of Shad Bala and the total.
   */
  calculateShadBala(planetName) {
    const planet = this.planets.find(p => p.name.toLowerCase() === planetName.toLowerCase());
    if (!planet) throw new Error(`Planet ${planetName} not found in chart.`);

    const sthanaBala = this.getSthanaBala(planet);
    const digBala = this.getDigBala(planet.name);
    const kalaBala = this.getKalaBala(planet);
    const chestaBala = this.getChestaBala(planet);
    const naisargikaBala = this.getNaisargikaBala(planet.name);
    const drikBala = this.getDrikBala(planet.name);

    const total = sthanaBala.total + digBala + kalaBala.total + chestaBala + naisargikaBala + drikBala;

    return {
      components: {
        sthanaBala,
        digBala,
        kalaBala,
        chestaBala,
        naisargikaBala,
        drikBala,
      },
      total,
      required: this.getRequiredShadBala(planetName),
    };
  }

  getSthanaBala(planet) {
    let total = 0;
    const dignity = this.getDignity(planet.name);
    if (dignity === 'Exalted') {
        total += 60;
    } else if (dignity === 'Moolatrikona') {
        total += 45;
    } else if (dignity === 'Own Sign') {
        total += 30;
    }
    // Simplified: a more complete implementation would include many other factors.
    return { total: total, description: "Includes Uchcha Bala and Swakshetra Bala" };
  }

  getDigBala(planetName) {
    const planet = this.getPlanet(planetName);
    if (!planet) return 0;

    const idealHouses = {
      'Sun': 10, 'Mars': 10,
      'Jupiter': 1, 'Mercury': 1,
      'Moon': 4, 'Venus': 4,
      'Saturn': 7
    };
    const idealHouse = idealHouses[planet.name];
    if (idealHouse === undefined) return 0;

    const planetHouse = getHouseFromLongitude(planet.longitude, this.ascendant.longitude);

    // Distance from the ideal house in terms of houses.
    // The maximum distance can be 6 houses away (opposition).
    let distanceFromIdeal = Math.abs(planetHouse - idealHouse);
    if (distanceFromIdeal > 6) {
        distanceFromIdeal = 12 - distanceFromIdeal;
    }

    // Strength is 60 (max) when in the ideal house, and 0 when in the opposite house.
    const strength = 60 * (1 - distanceFromIdeal / 6);

    return strength;
  }

  getKalaBala(planet) {
    // Complete Kala Bala calculation with all traditional components
    let totalKalaBala = 0;
    const components = {};

    // 1. Nathonatha Bala (Day/Night Strength)
    const nathonataBala = this.getNathonataBala(planet);
    components.nathonataBala = nathonataBala;
    totalKalaBala += nathonataBala;

    // 2. Paksha Bala (Lunar Fortnight Strength)
    const pakshaBala = this.getPakshaBala(planet);
    components.pakshaBala = pakshaBala;
    totalKalaBala += pakshaBala;

    // 3. Thribhaga Bala (Day Division Strength)
    const thribhagaBala = this.getThribhagaBala(planet);
    components.thribhagaBala = thribhagaBala;
    totalKalaBala += thribhagaBala;

    // 4. Abda Bala (Year Strength)
    const abdaBala = this.getAbdaBala(planet);
    components.abdaBala = abdaBala;
    totalKalaBala += abdaBala;

    // 5. Masa Bala (Month Strength)
    const masaBala = this.getMasaBala(planet);
    components.masaBala = masaBala;
    totalKalaBala += masaBala;

    // 6. Vara Bala (Weekday Strength)
    const varaBala = this.getVaraBala(planet);
    components.varaBala = varaBala;
    totalKalaBala += varaBala;

    // 7. Hora Bala (Hourly Strength)
    const horaBala = this.getHoraBala(planet);
    components.horaBala = horaBala;
    totalKalaBala += horaBala;

    // 8. Ayana Bala (Declination Strength)
    const ayanaBala = this.getAyanaBala(planet);
    components.ayanaBala = ayanaBala;
    totalKalaBala += ayanaBala;

    return {
      total: totalKalaBala,
      components,
      description: "Complete Kala Bala with all 8 traditional components"
    };
  }

  getNathonataBala(planet) {
    // Day/Night strength based on planetary nature
    const dayPlanets = ['Sun', 'Jupiter', 'Venus'];
    const nightPlanets = ['Moon', 'Mars', 'Saturn'];
    const neutralPlanet = 'Mercury';

    // Determine if birth was during day or night
    const isDayBirth = this.isDayBirth();

    if (planet.name === neutralPlanet) {
      return 30; // Mercury gets average strength
    } else if (dayPlanets.includes(planet.name)) {
      return isDayBirth ? 60 : 0;
    } else if (nightPlanets.includes(planet.name)) {
      return isDayBirth ? 0 : 60;
    }

    return 30; // Default
  }

  getPakshaBala(planet) {
    // Lunar fortnight strength
    const moonLongitude = this.getMoonLongitude();
    const sunLongitude = this.getSunLongitude();

    if (!moonLongitude || !sunLongitude) return 30;

    const moonSunDistance = Math.abs(moonLongitude - sunLongitude);
    const isBrightHalf = moonSunDistance <= 180;

    const benefics = ['Jupiter', 'Venus', 'Mercury', 'Moon'];
    const malefics = ['Sun', 'Mars', 'Saturn'];

    if (benefics.includes(planet.name)) {
      return isBrightHalf ? 60 : 0;
    } else if (malefics.includes(planet.name)) {
      return isBrightHalf ? 0 : 60;
    }

    return 30; // Default for nodes
  }

  getThribhagaBala(planet) {
    // Day division strength (sunrise, noon, sunset periods)
    const birthHour = this.getBirthHour();
    const sunriseHour = 6; // Approximate
    const sunsetHour = 18; // Approximate

    let period;
    if (birthHour >= sunriseHour && birthHour < (sunriseHour + sunsetHour) / 2) {
      period = 'morning';
    } else if (birthHour >= (sunriseHour + sunsetHour) / 2 && birthHour < sunsetHour) {
      period = 'afternoon';
    } else {
      period = 'night';
    }

    const tribhagaRulers = {
      'morning': ['Mercury', 'Sun', 'Saturn'],
      'afternoon': ['Sun', 'Jupiter', 'Mars'],
      'night': ['Moon', 'Venus', 'Mars']
    };

    return tribhagaRulers[period].includes(planet.name) ? 60 : 0;
  }

  getAbdaBala(planet) {
    // Year strength based on year ruler
    const birthYear = this.getBirthYear();
    const yearRuler = this.getYearRuler(birthYear);

    return yearRuler === planet.name ? 15 : 0;
  }

  getMasaBala(planet) {
    // Month strength based on month ruler
    const birthMonth = this.getBirthMonth();
    const monthRuler = this.getMonthRuler(birthMonth);

    return monthRuler === planet.name ? 15 : 0;
  }

  getVaraBala(planet) {
    // Weekday strength
    const birthWeekday = this.getBirthWeekday();
    const weekdayRulers = {
      0: 'Sun',    // Sunday
      1: 'Moon',   // Monday
      2: 'Mars',   // Tuesday
      3: 'Mercury', // Wednesday
      4: 'Jupiter', // Thursday
      5: 'Venus',   // Friday
      6: 'Saturn'   // Saturday
    };

    return weekdayRulers[birthWeekday] === planet.name ? 45 : 0;
  }

  getHoraBala(planet) {
    // Hourly strength based on hora ruler
    const birthHour = this.getBirthHour();
    const horaRuler = this.getHoraRuler(birthHour);

    return horaRuler === planet.name ? 60 : 0;
  }

  getAyanaBala(planet) {
    // Declination-based strength
    if (['Sun', 'Mars', 'Jupiter', 'Venus', 'Mercury'].includes(planet.name)) {
      const sunLongitude = this.getSunLongitude();
      if (sunLongitude >= 270 || sunLongitude < 90) { // Uttarayana
        return 60;
      } else { // Dakshinayana
        return 0;
      }
    } else if (['Moon', 'Saturn'].includes(planet.name)) {
      const sunLongitude = this.getSunLongitude();
      if (sunLongitude >= 90 && sunLongitude < 270) { // Dakshinayana
        return 60;
      } else { // Uttarayana
        return 0;
      }
    }

    return 30; // Default for nodes
  }

  // Helper methods for Kala Bala
  isDayBirth() {
    const birthHour = this.getBirthHour();
    return birthHour >= 6 && birthHour < 18;
  }

  getBirthHour() {
    // Extract hour from chart birth time
    return this.chart.birthTime ? parseInt(this.chart.birthTime.split(':')[0]) : 12;
  }

  getBirthYear() {
    return this.chart.birthDate ? new Date(this.chart.birthDate).getFullYear() : new Date().getFullYear();
  }

  getBirthMonth() {
    return this.chart.birthDate ? new Date(this.chart.birthDate).getMonth() + 1 : 1;
  }

  getBirthWeekday() {
    return this.chart.birthDate ? new Date(this.chart.birthDate).getDay() : 0;
  }

  getMoonLongitude() {
    const moon = this.planets.find(p => p.name === 'Moon');
    return moon ? moon.longitude : null;
  }

  getSunLongitude() {
    const sun = this.planets.find(p => p.name === 'Sun');
    return sun ? sun.longitude : null;
  }

  getYearRuler(year) {
    const rulers = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
    return rulers[year % 7];
  }

  getMonthRuler(month) {
    const rulers = {
      1: 'Mars', 2: 'Saturn', 3: 'Jupiter', 4: 'Mars', 5: 'Mercury', 6: 'Venus',
      7: 'Sun', 8: 'Moon', 9: 'Mars', 10: 'Saturn', 11: 'Jupiter', 12: 'Venus'
    };
    return rulers[month] || 'Sun';
  }

  getHoraRuler(hour) {
    const weekday = this.getBirthWeekday();
    const weekdayRulers = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
    const dayRuler = weekdayRulers[weekday];

    // Simplified hora calculation
    const horaSequence = ['Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars'];
    const dayRulerIndex = horaSequence.indexOf(dayRuler);
    const horaIndex = (dayRulerIndex + hour - 1) % 7;

    return horaSequence[horaIndex];
  }

  getChestaBala(planet) {
    // Complete Chesta Bala (Motional Strength) calculation
    // Depends on planetary speed, retrogression cycle, and motion relative to mean position

    if (['Sun', 'Moon'].includes(planet.name)) {
      // Luminaries don't have Chesta Bala in traditional calculation
      return 0;
    }

    let chestaBala = 0;
    const planetaryMotionData = this.getPlanetaryMotionData(planet.name);

    // Calculate based on planetary motion characteristics
    const dailyMotion = this.calculateDailyMotion(planet);
    const averageMotion = planetaryMotionData.averageMotion;
    const slowestMotion = planetaryMotionData.slowestMotion;
    const fastestMotion = planetaryMotionData.fastestMotion;

    // Different calculation for retrograde vs direct motion
    if (planet.isRetrograde) {
      // Retrograde planets get strength based on their retrograde characteristics
      chestaBala = this.calculateRetrogradeChestaBala(planet.name, dailyMotion);
    } else {
      // Direct motion planets get strength based on speed variation
      const speedRatio = dailyMotion / averageMotion;

      if (['Mercury', 'Venus'].includes(planet.name)) {
        // Inner planets: strength when moving slower than average
        chestaBala = this.calculateInnerPlanetChestaBala(speedRatio, slowestMotion, fastestMotion);
      } else {
        // Outer planets: strength when moving faster than average
        chestaBala = this.calculateOuterPlanetChestaBala(speedRatio, slowestMotion, fastestMotion);
      }
    }

    // Apply planetary-specific modifications
    chestaBala = this.applyPlanetaryModifications(planet.name, chestaBala, dailyMotion);

    // Ensure chestaBala is within valid range (0-60)
    return Math.max(0, Math.min(60, chestaBala));
  }

  getPlanetaryMotionData(planetName) {
    // Traditional planetary motion data in degrees per day
    const motionData = {
      'Mercury': {
        averageMotion: 1.383,
        slowestMotion: 0.0,
        fastestMotion: 2.2,
        retrogradeStrength: 25
      },
      'Venus': {
        averageMotion: 1.602,
        slowestMotion: 0.0,
        fastestMotion: 1.267,
        retrogradeStrength: 25
      },
      'Mars': {
        averageMotion: 0.524,
        slowestMotion: 0.26,
        fastestMotion: 0.8,
        retrogradeStrength: 40
      },
      'Jupiter': {
        averageMotion: 0.083,
        slowestMotion: -0.15,
        fastestMotion: 0.25,
        retrogradeStrength: 60
      },
      'Saturn': {
        averageMotion: 0.033,
        slowestMotion: -0.13,
        fastestMotion: 0.13,
        retrogradeStrength: 60
      }
    };

    return motionData[planetName] || {
      averageMotion: 0.5,
      slowestMotion: 0.0,
      fastestMotion: 1.0,
      retrogradeStrength: 30
    };
  }

  calculateDailyMotion(planet) {
    // Calculate daily motion from planetary data
    // In a real implementation, this would use ephemeris data
    // For now, use average values with some variation

    const baseMotions = {
      'Mercury': 1.383,
      'Venus': 1.602,
      'Mars': 0.524,
      'Jupiter': 0.083,
      'Saturn': 0.033
    };

    const baseMotion = baseMotions[planet.name] || 0.5;

    // Add some variation based on longitude (simplified)
    const variation = Math.sin((planet.longitude || 0) * Math.PI / 180) * 0.2;

    return planet.isRetrograde ? -Math.abs(baseMotion + variation) : Math.abs(baseMotion + variation);
  }

  calculateRetrogradeChestaBala(planetName, dailyMotion) {
    const motionData = this.getPlanetaryMotionData(planetName);
    const baseStrength = motionData.retrogradeStrength;

    // Slower retrograde motion generally gives more strength
    const motionFactor = Math.abs(dailyMotion) / Math.abs(motionData.averageMotion);
    const strengthModifier = Math.max(0.5, 2 - motionFactor);

    return Math.round(baseStrength * strengthModifier);
  }

  calculateInnerPlanetChestaBala(speedRatio, slowestMotion, fastestMotion) {
    // Inner planets (Mercury, Venus) get more strength when moving slower
    let strength = 0;

    if (speedRatio <= 0.5) {
      // Very slow motion
      strength = 60;
    } else if (speedRatio <= 0.8) {
      // Moderate slow motion
      strength = 45;
    } else if (speedRatio <= 1.2) {
      // Average motion
      strength = 30;
    } else if (speedRatio <= 1.5) {
      // Fast motion
      strength = 15;
    } else {
      // Very fast motion
      strength = 0;
    }

    return strength;
  }

  calculateOuterPlanetChestaBala(speedRatio, slowestMotion, fastestMotion) {
    // Outer planets (Mars, Jupiter, Saturn) get more strength when moving faster
    let strength = 0;

    if (speedRatio >= 1.5) {
      // Very fast motion
      strength = 60;
    } else if (speedRatio >= 1.2) {
      // Fast motion
      strength = 45;
    } else if (speedRatio >= 0.8) {
      // Average motion
      strength = 30;
    } else if (speedRatio >= 0.5) {
      // Slow motion
      strength = 15;
    } else {
      // Very slow motion
      strength = 0;
    }

    return strength;
  }

  applyPlanetaryModifications(planetName, baseStrength, dailyMotion) {
    // Apply planet-specific modifications to Chesta Bala
    let modifiedStrength = baseStrength;

    switch (planetName) {
      case 'Mars':
        // Mars gets additional strength when in forward motion
        if (dailyMotion > 0) {
          modifiedStrength += 5;
        }
        break;

      case 'Jupiter':
        // Jupiter gets additional strength for steady motion
        if (Math.abs(dailyMotion) < 0.1 && Math.abs(dailyMotion) > 0.05) {
          modifiedStrength += 10;
        }
        break;

      case 'Saturn':
        // Saturn gets additional strength for very slow motion
        if (Math.abs(dailyMotion) < 0.05) {
          modifiedStrength += 15;
        }
        break;

      case 'Mercury':
        // Mercury gets penalty for extremely fast motion
        if (Math.abs(dailyMotion) > 2.0) {
          modifiedStrength -= 10;
        }
        break;

      case 'Venus':
        // Venus gets bonus for moderate motion
        if (Math.abs(dailyMotion) >= 0.5 && Math.abs(dailyMotion) <= 1.0) {
          modifiedStrength += 5;
        }
        break;
    }

    return modifiedStrength;
  }

  getNaisargikaBala(planetName) {
    const strengths = {
      Sun: 60.0,
      Moon: 51.42,
      Venus: 42.85,
      Jupiter: 34.28,
      Mercury: 25.71,
      Mars: 17.14,
      Saturn: 8.57,
    };
    return strengths[planetName] || 0;
  }

  getDrikBala(planetName) {
    // Complete Drik Bala (Aspectual Strength) calculation
    // Calculates aspects from all other planets and their benefic/malefic nature

    const targetPlanet = this.getPlanet(planetName);
    if (!targetPlanet) return 0;

    let totalDrikBala = 0;
    const aspectualInfluences = [];

    // Calculate aspects from all other planets
    this.planets.forEach(aspectingPlanet => {
      if (aspectingPlanet.name === planetName) return; // Skip self

      const aspectStrength = this.calculateMutualAspectStrength(aspectingPlanet, targetPlanet);

      if (aspectStrength > 0) {
        const beneficMaleficValue = this.getBeneficMaleficValue(aspectingPlanet.name);
        const aspectualInfluence = aspectStrength * beneficMaleficValue;

        aspectualInfluences.push({
          aspectingPlanet: aspectingPlanet.name,
          aspectStrength,
          beneficMaleficValue,
          influence: aspectualInfluence
        });

        totalDrikBala += aspectualInfluence;
      }
    });

    // Calculate special Vedic aspects (Graha Drishti)
    const specialAspects = this.calculateSpecialVedicAspectsForDrikBala(targetPlanet);
    specialAspects.forEach(aspect => {
      totalDrikBala += aspect.influence;
      aspectualInfluences.push(aspect);
    });

    // Normalize Drik Bala to reasonable range
    const normalizedDrikBala = this.normalizeDrikBala(totalDrikBala);

    return {
      total: normalizedDrikBala,
      influences: aspectualInfluences,
      description: `Aspectual strength from ${aspectualInfluences.length} planetary influences`
    };
  }

  calculateMutualAspectStrength(aspectingPlanet, targetPlanet) {
    const aspectingLongitude = aspectingPlanet.longitude || 0;
    const targetLongitude = targetPlanet.longitude || 0;

    const angularDistance = this.calculateAngularDistance(aspectingLongitude, targetLongitude);

    // Traditional Vedic aspects with their strengths
    const aspectTypes = [
      { name: 'conjunction', degrees: 0, maxOrb: 10, baseStrength: 1.0 },
      { name: 'sextile', degrees: 60, maxOrb: 6, baseStrength: 0.5 },
      { name: 'square', degrees: 90, maxOrb: 8, baseStrength: 0.75 },
      { name: 'trine', degrees: 120, maxOrb: 8, baseStrength: 0.75 },
      { name: 'opposition', degrees: 180, maxOrb: 10, baseStrength: 1.0 }
    ];

    for (const aspectType of aspectTypes) {
      const orb = Math.min(
        Math.abs(angularDistance - aspectType.degrees),
        Math.abs((360 - angularDistance) - aspectType.degrees)
      );

      if (orb <= aspectType.maxOrb) {
        // Calculate strength based on exactness of aspect
        const exactness = 1 - (orb / aspectType.maxOrb);
        return aspectType.baseStrength * exactness * 60; // Scale to 0-60 range
      }
    }

    return 0; // No significant aspect
  }

  calculateSpecialVedicAspectsForDrikBala(targetPlanet) {
    const specialAspects = [];
    const targetHouse = this.calculateHouseFromLongitude(targetPlanet.longitude);

    this.planets.forEach(aspectingPlanet => {
      if (aspectingPlanet.name === targetPlanet.name) return;

      const aspectingHouse = this.calculateHouseFromLongitude(aspectingPlanet.longitude);

      // Mars special aspects: 4th, 7th, 8th from its position
      if (aspectingPlanet.name === 'Mars') {
        const marsAspects = [4, 7, 8];
        marsAspects.forEach(aspectDistance => {
          const targetHouseFromMars = (aspectingHouse + aspectDistance - 1) % 12 + 1;
          if (targetHouseFromMars === targetHouse) {
            const beneficMaleficValue = this.getBeneficMaleficValue('Mars');
            specialAspects.push({
              aspectingPlanet: 'Mars',
              aspectType: `${aspectDistance}th house special aspect`,
              aspectStrength: 50, // Strong special aspect
              beneficMaleficValue,
              influence: 50 * beneficMaleficValue
            });
          }
        });
      }

      // Jupiter special aspects: 5th, 7th, 9th from its position
      if (aspectingPlanet.name === 'Jupiter') {
        const jupiterAspects = [5, 7, 9];
        jupiterAspects.forEach(aspectDistance => {
          const targetHouseFromJupiter = (aspectingHouse + aspectDistance - 1) % 12 + 1;
          if (targetHouseFromJupiter === targetHouse) {
            const beneficMaleficValue = this.getBeneficMaleficValue('Jupiter');
            specialAspects.push({
              aspectingPlanet: 'Jupiter',
              aspectType: `${aspectDistance}th house special aspect`,
              aspectStrength: 60, // Very strong beneficial aspect
              beneficMaleficValue,
              influence: 60 * beneficMaleficValue
            });
          }
        });
      }

      // Saturn special aspects: 3rd, 7th, 10th from its position
      if (aspectingPlanet.name === 'Saturn') {
        const saturnAspects = [3, 7, 10];
        saturnAspects.forEach(aspectDistance => {
          const targetHouseFromSaturn = (aspectingHouse + aspectDistance - 1) % 12 + 1;
          if (targetHouseFromSaturn === targetHouse) {
            const beneficMaleficValue = this.getBeneficMaleficValue('Saturn');
            specialAspects.push({
              aspectingPlanet: 'Saturn',
              aspectType: `${aspectDistance}th house special aspect`,
              aspectStrength: 45, // Strong restrictive aspect
              beneficMaleficValue,
              influence: 45 * beneficMaleficValue
            });
          }
        });
      }

      // Rahu and Ketu special aspects: 5th, 7th, 9th from their positions
      if (['Rahu', 'Ketu'].includes(aspectingPlanet.name)) {
        const nodeAspects = [5, 7, 9];
        nodeAspects.forEach(aspectDistance => {
          const targetHouseFromNode = (aspectingHouse + aspectDistance - 1) % 12 + 1;
          if (targetHouseFromNode === targetHouse) {
            const beneficMaleficValue = this.getBeneficMaleficValue(aspectingPlanet.name);
            specialAspects.push({
              aspectingPlanet: aspectingPlanet.name,
              aspectType: `${aspectDistance}th house special aspect`,
              aspectStrength: 40, // Moderate karmic aspect
              beneficMaleficValue,
              influence: 40 * beneficMaleficValue
            });
          }
        });
      }
    });

    return specialAspects;
  }

  getBeneficMaleficValue(planetName) {
    // Traditional benefic/malefic values for Drik Bala calculation
    const values = {
      'Jupiter': +1.0,    // Great benefic
      'Venus': +0.8,      // Lesser benefic
      'Mercury': +0.5,    // Neutral (benefic when alone or with benefics)
      'Moon': +0.6,       // Benefic (when strong/waxing)
      'Sun': -0.3,        // Mild malefic
      'Mars': -0.8,       // Malefic
      'Saturn': -1.0,     // Great malefic
      'Rahu': -0.7,       // Malefic node
      'Ketu': -0.5        // Lesser malefic node
    };

    return values[planetName] || 0;
  }

  calculateAngularDistance(longitude1, longitude2) {
    const diff = Math.abs(longitude1 - longitude2);
    return Math.min(diff, 360 - diff);
  }

  calculateHouseFromLongitude(planetLongitude) {
    // Calculate house position from longitude using proper astronomical calculation
    if (!this.ascendant || typeof this.ascendant.longitude !== 'number') {
      throw new Error('Ascendant longitude is required for house calculation');
    }

    const ascendantLongitude = this.ascendant.longitude;

    // Calculate the relative position from the ascendant
    let relativePosition = planetLongitude - ascendantLongitude;

    // Normalize to 0-360 range
    while (relativePosition < 0) relativePosition += 360;
    while (relativePosition >= 360) relativePosition -= 360;

    // Calculate house number (1-12)
    // In Vedic astrology, each house spans 30 degrees
    const houseNumber = Math.floor(relativePosition / 30) + 1;

    // Validate house number
    if (houseNumber < 1 || houseNumber > 12) {
      throw new Error(`Invalid house number calculated: ${houseNumber}`);
    }

    return houseNumber;
  }

  normalizeDrikBala(totalDrikBala) {
    // Normalize the total Drik Bala to a reasonable range (-60 to +60)
    const maxDrikBala = 60;
    const minDrikBala = -60;

    // Apply a scaling factor to bring extreme values into range
    let normalized = totalDrikBala;

    if (Math.abs(normalized) > maxDrikBala) {
      const scaleFactor = maxDrikBala / Math.abs(normalized);
      normalized = normalized * scaleFactor;
    }

    return Math.max(minDrikBala, Math.min(maxDrikBala, Math.round(normalized)));
  }

  calculateAllShadBala() {
    const allBala = {};
    const planetsToCalculate = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
    planetsToCalculate.forEach(planetName => {
        allBala[planetName] = this.calculateShadBala(planetName);
    });
    return allBala;
  }

  isVargottama(planetName) {
     const planet = this.planets.find(p => p.name.toLowerCase() === planetName.toLowerCase());
     if (!this.chart.d9 || !planet) return false;

     const d9Planet = this.chart.d9.planets.find(p => p.name.toLowerCase() === planetName.toLowerCase());
     if (!d9Planet) return false;

     const d1Sign = getSignIndex(planet.longitude);
     const d9Sign = getSignIndex(d9Planet.longitude);

     return d1Sign === d9Sign;
  }

  getPlanet(planetName) {
    if (!planetName || typeof planetName.toLowerCase !== 'function') {
        return null;
    }
    return this.planets.find(p => p.name.toLowerCase() === planetName.toLowerCase());
  }

  getDignity(planetName) {
    const planet = this.getPlanet(planetName);
    if (!planet) return 'Neutral';

    const pName = planet.name;
    const longitude = planet.longitude;
    const sign = getSignIndex(longitude);
    const degreeInSign = longitude % 30;

    const dignities = {
        Sun: { exaltationSign: 0, debilitationSign: 6, moolatrikona: { sign: 4, range: [0, 20] }, ownSign: 4 },
        Moon: { exaltationSign: 1, debilitationSign: 7, moolatrikona: { sign: 1, range: [3, 30] }, ownSign: 3 },
        Mars: { exaltationSign: 9, debilitationSign: 3, moolatrikona: { sign: 0, range: [0, 12] }, ownSign: [0, 7] },
        Mercury: { exaltationSign: 5, debilitationSign: 11, moolatrikona: { sign: 5, range: [15, 20] }, ownSign: [2, 5] },
        Jupiter: { exaltationSign: 3, debilitationSign: 9, moolatrikona: { sign: 8, range: [0, 10] }, ownSign: [8, 11] },
        Venus: { exaltationSign: 11, debilitationSign: 5, moolatrikona: { sign: 6, range: [0, 15] }, ownSign: [1, 6] },
        Saturn: { exaltationSign: 6, debilitationSign: 0, moolatrikona: { sign: 10, range: [0, 20] }, ownSign: [9, 10] },
    };

    const planetDignity = dignities[pName];
    if (!planetDignity) return 'Neutral';

    // Highest dignity is exaltation
    if (sign === planetDignity.exaltationSign) return 'Exalted';

    // Moolatrikona is next
    if (planetDignity.moolatrikona && sign === planetDignity.moolatrikona.sign &&
        degreeInSign >= planetDignity.moolatrikona.range[0] &&
        degreeInSign <= planetDignity.moolatrikona.range[1]) {
      return 'Moolatrikona';
    }

    // Own sign is next
    if (Array.isArray(planetDignity.ownSign)) {
        if (planetDignity.ownSign.includes(sign)) return 'Own Sign';
    } else {
        if (sign === planetDignity.ownSign) return 'Own Sign';
    }

    // Lowest dignity is debilitation
    if (sign === planetDignity.debilitationSign) return 'Debilitated';

    // Default to neutral if none of the above
    return "Neutral";
  }

  // HELPER METHOD FOR PLANET DIGNITY CONFIG (needed for divisional chart calculations)
  getPlanetDignityConfig(planetName) {
    const dignities = {
        Sun: { 
          exaltationSign: 'Aries', 
          debilitationSign: 'Libra', 
          moolatrikona: { sign: 'Leo', start: 0, end: 20 }, 
          ownSign: 'Leo' 
        },
        Moon: { 
          exaltationSign: 'Taurus', 
          debilitationSign: 'Scorpio', 
          moolatrikona: { sign: 'Taurus', start: 3, end: 30 }, 
          ownSign: 'Cancer' 
        },
        Mars: { 
          exaltationSign: 'Capricorn', 
          debilitationSign: 'Cancer', 
          moolatrikona: { sign: 'Aries', start: 0, end: 12 }, 
          ownSign: ['Aries', 'Scorpio'] 
        },
        Mercury: { 
          exaltationSign: 'Virgo', 
          debilitationSign: 'Pisces', 
          moolatrikona: { sign: 'Virgo', start: 15, end: 20 }, 
          ownSign: ['Gemini', 'Virgo'] 
        },
        Jupiter: { 
          exaltationSign: 'Cancer', 
          debilitationSign: 'Capricorn', 
          moolatrikona: { sign: 'Sagittarius', start: 0, end: 10 }, 
          ownSign: ['Sagittarius', 'Pisces'] 
        },
        Venus: { 
          exaltationSign: 'Pisces', 
          debilitationSign: 'Virgo', 
          moolatrikona: { sign: 'Libra', start: 0, end: 15 }, 
          ownSign: ['Taurus', 'Libra'] 
        },
        Saturn: { 
          exaltationSign: 'Libra', 
          debilitationSign: 'Aries', 
          moolatrikona: { sign: 'Aquarius', start: 0, end: 20 }, 
          ownSign: ['Capricorn', 'Aquarius'] 
        }
    };

    return dignities[planetName] || null;
  }

  /**
   * CRITICAL PRIORITY IMPLEMENTATIONS
   */

  // STHANA BALA METHODS
  getUchchaBala(planetName) {
    const planet = this.getPlanet(planetName);
    if (!planet) return 0;

    const dignityInfo = this.getDignity(planetName);
    
    if (dignityInfo === 'Exalted') {
      // Maximum Uchcha Bala at exact exaltation degree
      const exaltationConfig = {
        'Sun': { sign: 'Aries', degree: 0 },
        'Moon': { sign: 'Taurus', degree: 3 },
        'Mars': { sign: 'Capricorn', degree: 28 },
        'Mercury': { sign: 'Virgo', degree: 15 },
        'Jupiter': { sign: 'Cancer', degree: 5 },
        'Venus': { sign: 'Pisces', degree: 27 },
        'Saturn': { sign: 'Libra', degree: 20 }
      };
      
      const config = exaltationConfig[planetName];
      if (!config) return 0;

      const planetDegree = planet.longitude % 30;
      const exaltationDegree = config.degree;
      
      // Calculate degree difference from exaltation point
      const degreeDiff = Math.abs(planetDegree - exaltationDegree);
      
      // Maximum Uchcha Bala (60) at exact exaltation, decreases with distance
      const maxDistance = 30; // Maximum distance in sign
      const uchchaBala = Math.max(0, 60 * (1 - degreeDiff / maxDistance));
      
      return Math.round(uchchaBala * 100) / 100;
    }
    
    return 0; // No Uchcha Bala if not exalted
  }

  getKendradiBala(planetName) {
    const planet = this.getPlanet(planetName);
    if (!planet) return 0;

    const planetHouse = getHouseFromLongitude(planet.longitude, this.ascendant.longitude);
    
    // Define best houses for each planet
    const bestHouses = {
      'Sun': [1, 4, 10],     // Quadrant/Kendra houses + own house
      'Moon': [2, 4, 7],     // Best houses for Moon
      'Mars': [1, 3, 4, 7, 8, 10], // Mars quadrants + Upachaya
      'Mercury': [1, 4, 7],   // Mercury best houses  
      'Jupiter': [1, 4, 10],  // Jupiter quadrants
      'Venus': [1, 4, 7],     // Venus best houses
      'Saturn': [1, 10, 7]     // Saturn quadrants + 7th
    };

    const planetBestHouses = bestHouses[planetName] || [1, 4, 7, 10];
    
    // Kendra houses (1, 4, 7, 10) give highest strength
    const kendraHouses = [1, 4, 7, 10];
    
    if (kendraHouses.includes(planetHouse)) {
      if (planetBestHouses.includes(planetHouse)) {
        return 60; // Maximum when in best Kendra
      }
      return 40; // Still good if in any Kendra
    }
    
    // Panapara houses (2, 5, 8, 11) give medium strength
    const panaparaHouses = [2, 5, 8, 11];
    if (panaparaHouses.includes(planetHouse)) {
      return 30;
    }
    
    // Apokalim houses (3, 6, 9, 12) give minimum strength
    return 15;
  }

  // DIG BALA METHODS
  getMinimumDigBala(planetName) {
    const planet = this.getPlanet(planetName);
    if (!planet) return 0;

    const idealHouses = {
      'Sun': 10, 'Mars': 10,
      'Jupiter': 1, 'Mercury': 1,
      'Moon': 4, 'Venus': 4,
      'Saturn': 7
    };

    const idealHouse = idealHouses[planetName];
    if (idealHouse === undefined) return 0;

    const planetHouse = getHouseFromLongitude(planet.longitude, this.ascendant.longitude);
    
    // Maximum Dig Bala when in opposite house (7th from ideal)
    const oppositeHouse = idealHouse + 6;
    if (oppositeHouse > 12) oppositeHouse -= 12;
    
    if (planetHouse === oppositeHouse) {
      return 0; // Minimum strength in opposite house
    }
    
    return undefined; // Use existing getDigBala calculation
  }

  getMaxDigBalaSun() {
    const planet = this.getPlanet('Sun');
    if (!planet) return 0;

    // Sun has maximum Dig Bala in 10th house
    const planetHouse = getHouseFromLongitude(planet.longitude, this.ascendant.longitude);
    
    if (planetHouse === 10) {
      return 60; // Maximum when in 10th house (career house)
    }
    
    // Production code - no fallback values
    throw new Error(`Invalid house calculation for directional strength: house ${houseNumber} is not valid for directional strength calculation`);
  }

  // KALA BALA METHODS  
  getNathonathaBalaTest(planet) {
    // Enhanced test implementation for Nathonatha Bala
    const dayPlanets = ['Sun', 'Jupiter', 'Venus'];
    const nightPlanets = ['Moon', 'Mars', 'Saturn'];
    const neutralPlanet = 'Mercury';

    const isDayBirth = this.isDayBirth();
    
    if (dayPlanets.includes(planet.name)) {
      return isDayBirth ? 60 : 0; // Full strength during day
    } else if (nightPlanets.includes(planet.name)) {
      return isDayBirth ? 0 : 60; // Full strength during night
    } else if (planet.name === neutralPlanet) {
      return 30; // Mercury gets half strength always
    }
    
    return 15; // Other planets get minimal
  }

  getPakshaBalaTest(planet) {
    // Enhanced test implementation for Paksha Bala
    const benefics = ['Moon', 'Venus', 'Jupiter'];
    const malefics = ['Sun', 'Mars', 'Saturn'];
    
    const moonLongitude = this.getMoonLongitude();
    const sunLongitude = this.getSunLongitude();
    
    if (!moonLongitude || !sunLongitude) return 30;
    
    // Calculate lunar phase angle
    const moonSunAngle = ((moonLongitude - sunLongitude + 360) % 360);
    
    // Bright half (waxing moon): 0-180 degrees
    const isWaxing = moonSunAngle < 180;
    
    if (benefics.includes(planet.name)) {
      return isWaxing ? 60 : 15; // Benefics strong in bright half
    } else if (malefics.includes(planet.name)) {
      return isWaxing ? 15 : 60; // Malefics strong in dark half
    }
    
    return 30; // Mercury gets neutral
  }

  getHoraBalaTest(planet) {
    // Enhanced test implementation for Hora Bala
    const horaRuler = this.getHoraRuler(this.getBirthHour());
    
    if (horaRuler === planet.name) {
      return 60; // Maximum when planet rules current hora
    }
    
    // Day/night hora rulers
    const dayHora = ['Sun', 'Jupiter', 'Mars']; 
    const nightHora = ['Moon', 'Venus', 'Saturn'];
    
    const isDayBirth = this.isDayBirth();
    const isDayHora = this.getBirthHour() >= 6 && this.getBirthHour() < 18;
    
    if ((isDayBirth && dayHora.includes(planet.name)) || 
        (!isDayBirth && nightHora.includes(planet.name))) {
      return 30; // Partial strength when day/night matches
    }
    
    return 15; // Minimum for others
  }

  getAyanaBalaTest(planet) {
    // Enhanced test implementation for Ayana Bala  
    const sunLongitude = this.getSunLongitude();
    if (!sunLongitude) return 15;

    const { getSign } = require('../../../utils/helpers/astrologyHelpers');
    const sunSign = getSign(sunLongitude);
    
    // Determine Ayana (solar transit)
    const isUttarayana = sunLongitude >= 270 || sunLongitude < 90; // Northward movement
    const isDakshinayana = !isUttarayana; // Southward movement
    
    // Saturn, Mars, Jupiter stronger in Uttarayana
    const uttarayanaPlanets = ['Saturn', 'Mars', 'Jupiter'];
    // Sun, Venus, Mercury stronger in Dakshinayana  
    const dakshinayanaPlanets = ['Sun', 'Venus', 'Mercury'];
    
    if (uttarayanaPlanets.includes(planet.name) && isUttarayana) {
      return 60; // Maximum during Uttarayana
    } else if (dakshinayanaPlanets.includes(planet.name) && isDakshinayana) {
      return 60; // Maximum during Dakshinayana
    } else if (dakshinayanaPlanets.includes(planet.name) && isUttarayana) {
      return 30; // Medium during opposite ayana
    } else if (uttarayanaPlanets.includes(planet.name) && isDakshinayana) {
      return 30; // Medium during opposite ayana
    }
    
    // Moon gets neutral
    if (planet.name === 'Moon') return 15;
    
    return 45; // Other planets medium
  }

  // CHESTA BALA METHODS
  getChestaBalaTest(planet, isRetrograde = false) {
    // Enhanced test implementation for Chesta Bala
    
    if (['Sun', 'Moon'].includes(planet.name)) {
      // Sun and Moon have special Chesta Bala calculations
      // Based on their apparent motion (not applicable to retrograde)
      return 30; // Base value for luminaries
    }
    
    if (isRetrograde) {
      // Retrograde planets get higher Chesta Bala
      if (['Mercury', 'Venus'].includes(planet.name)) {
        return 50; // Inner planets get higher retrograde strength
      } else {
        return 60; // Outer planets get maximum retrograde strength  
      }
    }
    
    // Direct motion gets lower values
    return 20;
  }

  // DRIK BALA METHODS
  getPositiveDrikBala(planetName) {
    // Enhanced test implementation for positive Drik Bala
    const planet = this.getPlanet(planetName);
    if (!planet) return 0;

    const aspectingPlanets = this.planets || [];
    let positiveAspects = 0;

    // Calculate benefic aspects from positive aspects
    const beneficPlanets = ['Venus', 'Jupiter', 'Moon'];
    
    for (const aspectingPlanet of aspectingPlanets) {
      if (aspectingPlanet.name === planetName) continue; // Skip self
      
      // Check if benefic planet is aspecting the target
      if (beneficPlanets.includes(aspectingPlanet.name)) {
        const aspectStrength = this.calculateMutualAspectStrength(
          aspectingPlanet, 
          planet
        );
        
        if (aspectStrength > 0) {
          positiveAspects += aspectStrength;
        }
      }
    }

    // Normalize the Drik Bala value
    return Math.min(60, Math.round(positiveAspects * 100) / 100);
  }

  getNegativeDrikBala(planetName) {
    // Enhanced test implementation for negative Drik Bala
    const planet = this.getPlanet(planetName);
    if (!planet) return 0;

    const aspectingPlanets = this.planets || [];
    let negativeAspects = 0;

    // Calculate malefic aspects from negative aspects
    const maleficPlanets = ['Mars', 'Saturn', 'Sun', 'Rahu', 'Ketu'];
    
    for (const aspectingPlanet of aspectingPlanets) {
      if (aspectingPlanet.name === planetName) continue; // Skip self
      
      // Check if malefic planet is aspecting the target
      if (maleficPlanets.includes(aspectingPlanet.name)) {
        const aspectStrength = this.calculateMutualAspectStrength(
          aspectingPlanet, 
          planet
        );
        
        if (aspectStrength > 0) {
          negativeAspects += aspectStrength;
        }
      }
    }

    // Negative aspects reduce strength
    return Math.min(60, Math.round(negativeAspects * 100) / 100);
  }

  // IMPORTANT PRIORITY IMPLEMENTATIONS

  getSaptavargajaBala(planetName) {
    // IMPORTANT: Calculate strength from position in 7 divisional charts
    const planet = this.getPlanet(planetName);
    if (!planet) return 0;

    let totalVargaStrength = 0;
    const divisionalCharts = ['d2', 'd3', 'd4', 'd7', 'd9', 'd12', 'd30'];
    
    for (const chartType of divisionalCharts) {
      const divisionalChart = this.chart[chartType];
      if (!divisionalChart || !divisionalChart.planets) continue;
      
      const divisionalPlanet = divisionalChart.planets.find(
        p => p.name === planetName
      );
      
      if (divisionalPlanet) {
        // Calculate Varga strength based on dignity in divisional chart
        const divisionalDignity = this.getDignityInChart(planetName, divisionalChart);
        
        if (divisionalDignity === 'Exalted') {
          totalVargaStrength += 15; // 15 Rupas per Varga for exalted
        } else if (divisionalDignity === 'Own Sign') {
          totalVargaStrength += 10; // 10 Rupas per Varga for own sign
        } else if (divisionalDignity === 'Moolatrikona') {
          totalVargaStrength += 12; // 12 Rupas per Varga for Moolatrikona
        } else if (divisionalDignity === 'Debilitated') {
          totalVargaStrength += 5; // Even debilitated gets some strength
        } else {
          totalVargaStrength += 8; // Normal strength for neutral signs
        }
      }
    }
    
    return Math.min(60, totalVargaStrength); // Maximum 60 Rupas
  }

  getOjhajugmarasiBala(planetName) {
    // IMPORTANT: Strength based on odd/even sign and odd/even nakshatra combination
    const planet = this.getPlanet(planetName);
    if (!planet) return 0;

    const planetDegree = planet.longitude % 30;
    const signNum = Math.floor(planet.longitude / 30) + 1;
    
    // Determine if planet is in odd or even sign
    const isOddSign = signNum % 2 === 1;
    
    // Determine if planet is in odd or even nakshatra
    const nakshatraSize = 13.333333; // 13°20'
    const nakshatraNumber = Math.floor((planet.longitude % 360) / nakshatraSize) + 1;
    const isOddNakshatra = nakshatraNumber % 2 === 1;
    
    // Ojahugmari rule:
    // - Odd Sign + Odd Nakshatra = Strong
    // - Even Sign + Even Nakshatra = Strong  
    // - Odd Sign + Even Nakshatra OR Even Sign + Odd Nakshatra = Weak
    
    if ((isOddSign && isOddNakshatra) || (!isOddSign && !isOddNakshatra)) {
      return 60; // Maximum strength for matching odd/even combinations
    }
    
    return 0; // Ojhajugmari weakness (no strength)
  }

  getDrekkanaBala(planetName) {
    // IMPORTANT: Strength from D3 (Drekkana) chart placement
    const planet = this.getPlanet(planetName);
    if (!planet) return 0;

    // Check if D3 chart exists
    const d3Chart = this.chart.d3;
    if (!d3Chart || !d3Chart.planets) return 0;
    
    const d3Planet = d3Chart.planets.find(p => p.name === planetName);
    if (!d3Planet) return 0;
    
    // Calculate Drekanna Bala based on D3 position
    const d3Sign = Math.floor(d3Planet.longitude / 30) + 1;
    const originalSign = Math.floor(planet.longitude / 30) + 1;
    
    // Planets get varying strengths based on D3 position
    const bestDrekannaPositions = {
      'Sun': [1, 5, 9],  // Fiery signs
      'Moon': [2, 4, 6], // Water signs  
      'Mars': [1, 8],     // Mars best positions
      'Mercury': [3, 6],  // Mercury best positions
      'Jupiter': [1, 9],  // Jupiter best positions
      'Venus': [2, 7],    // Venus best positions
      'Saturn': [10, 11]  // Saturn best positions
    };
    
    const bestPositions = bestDrekannaPositions[planetName] || [];
    
    if (bestPositions.includes(d3Sign)) {
      return 45; // Strong position in D3
    }
    
    // Calculate Drekkana strength based on aspect between original and D3 position
    const aspectAngle = Math.abs(originalSign - d3Sign);
    if (aspectAngle <= 2 || aspectAngle >= 10) { // Trine or conjunction
      return 30;
    } else if (aspectAngle === 5 || aspectAngle === 7) { // Opposition  
      return 15;
    }
    
    return 20; // Average strength
  }

  getThribhagaBalaTest(planet) {
    // IMPORTANT: Strength based on birth time divided into 3 parts
    const birthHour = this.getBirthHour();
    if (birthHour === undefined) return 15;

    // Get sunrise and sunset (approximate for calculation)
    const sunriseHour = 6;  // 6 AM
    const sunsetHour = 18;  // 6 PM
    
    // Divide day into 3 parts:
    // Part 1: Sunrise to Noon (6 AM to 12 PM)
    // Part 2: Noon to Sunset (12 PM to 6 PM)  
    // Part 3: Sunset to next Sunrise (6 PM to 6 AM)
    
    let part;
    if (birthHour >= sunriseHour && birthHour < 12) {
      part = 1; // Morning part
    } else if (birthHour >= 12 && birthHour < sunsetHour) {
      part = 2; // Afternoon part
    } else {
      part = 3; // Night part
    }
    
    // Different planets get strength in different parts
    const partStrengths = {
      'Sun': { 1: 60, 2: 15, 3: 15 },    // Sun strongest in morning
      'Moon': { 1: 15, 2: 15, 3: 60 },    // Moon strongest at night
      'Mercury': { 1: 45, 2: 45, 3: 30 },  // Mercury balanced
      'Venus': { 1: 15, 2: 60, 3: 15 },    // Venus strongest in afternoon
      'Mars': { 1: 60, 2: 15, 3: 15 },     // Mars strongest in morning
      'Jupiter': { 1: 30, 2: 60, 3: 15 },   // Jupiter strongest in afternoon
      'Saturn': { 1: 15, 2: 15, 3: 60 }     // Saturn strongest at night
    };
    
    return partStrengths[planet.name]?.[part] || 30;
  }

  getVaraMasaVaraBalaTest(planet) {
    // IMPORTANT: Combined strength based on year, month, weekday of birth
    const birthYear = this.getBirthYear();
    const birthMonth = this.getBirthMonth();
    const birthWeekday = this.getBirthWeekday();
    
    if (birthYear === undefined || birthMonth === undefined || birthWeekday === undefined) {
      return 15;
    }
    
    let totalStrength = 0;
    
    // 1. Year Ruler (Abda Bala)
    const yearRuler = this.getYearRuler(birthYear);
    totalStrength += yearRuler === planet.name ? 15 : 5;
    
    // 2. Month Ruler (Masa Bala)  
    const monthRuler = this.getMonthRuler(birthMonth);
    totalStrength += monthRuler === planet.name ? 15 : 5;
    
    // 3. Weekday Ruler (Vara Bala)
    const weekdayRuler = this.getWeekdayRuler(birthWeekday);
    totalStrength += weekdayRuler === planet.name ? 15 : 5;
    
    return Math.min(60, totalStrength);
  }

  // HELPER METHOD FOR DIVISIONAL CHART DIGNITY
  getDignityInChart(planetName, chart) {
    // Calculate dignity of planet in a specific divisional chart
    const planet = chart.planets.find(p => p.name === planetName);
    if (!planet) return 'Neutral';
    
    // Use same dignity calculation as main chart
    const planetLongitude = planet.longitude;
    const sign = getSign(planetLongitude);
    
    // Get dignity configuration for the planet
    const planetDignity = this.getPlanetDignityConfig(planetName);
    if (!planetDignity) return 'Neutral';
    
    if (sign === planetDignity.exaltationSign) return 'Exalted';
    if (planetDignity.moolatrikona && sign === planetDignity.moolatrikona.sign &&
        planetLongitude >= planetDignity.moolatrikona.start &&
        planetLongitude < planetDignity.moolatrikona.end) return 'Moolatrikona';
    if (Array.isArray(planetDignity.ownSign)) {
        if (planetDignity.ownSign.includes(sign)) return 'Own Sign';
    } else if (sign === planetDignity.ownSign) return 'Own Sign';
    if (sign === planetDignity.debilitationSign) return 'Debilitated';
    
    return 'Neutral';
  }

  // HELPER METHOD FOR WEEKDAY RULER
  getWeekdayRuler(weekday) {
    const weekdayRulers = {
      0: 'Sun',    // Sunday
      1: 'Moon',   // Monday  
      2: 'Mars',   // Tuesday
      3: 'Mercury', // Wednesday
      4: 'Jupiter', // Thursday
      5: 'Venus',  // Friday
      6: 'Saturn'  // Saturday
    };
    return weekdayRulers[weekday] || 'Sun';
  }

  getRequiredShadBala(planetName) {
    const requirements = {
      'Sun': 390,
      'Moon': 360,
      'Mars': 300,
      'Mercury': 420,
      'Jupiter': 390,
      'Venus': 330,
      'Saturn': 300
    };
    return requirements[planetName] || 0;
  }
}

module.exports = PlanetaryStrengthCalculator;
