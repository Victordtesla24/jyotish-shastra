/**
 * Planetary Strength Calculator
 * Implements comprehensive planetary strength assessment based on Shad Bala.
 */

const { getSign, getSignLord, getHouseFromLongitude, calculateAngularDistance } = require('../../../utils/helpers/astrologyHelpers');
const { getSignIndex } = require('../../../utils/helpers/astrologyHelpers');

class PlanetaryStrengthCalculator {
  constructor(chart) {
    this.chart = chart;
    this.planets = chart.planets;
    this.ascendant = chart.ascendant;
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
    // Placeholder for Kala Bala. Involves many sub-components:
    // Nathonatha Bala, Paksha Bala, Thribhaga Bala, Abda Bala, Masa Bala, Vara Bala, Hora Bala, Ayana Bala.
    return { total: 50, description: "Simplified Kala Bala" };
  }

  getChestaBala(planet) {
    // Placeholder for Chesta Bala (Motional Strength).
    // Depends on planetary speed and retrogression cycle.
    // This is a complex calculation involving mean and true positions.
    return planet.isRetrograde ? 50 : 20;
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
    // Placeholder for Drik Bala (Aspectual Strength).
    // Requires calculating aspects from all other planets and their benefic/malefic nature.
    return 5;
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
