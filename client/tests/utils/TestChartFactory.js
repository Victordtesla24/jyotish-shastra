/**
 * Test Chart Factory
 *
 * A utility for generating mock chart data for testing purposes.
 * This allows for the creation of specific astrological scenarios to test
 * various components of the analysis engine.
 */
const { sampleChart, sampleBirthData, sampleChartWithYogas } = require('../fixtures/sample-chart-data');

class TestChartFactory {
  /**
   * Creates a mock chart object with default values, which can be overridden.
   * @param {Object} overrides - The properties to override in the default chart.
   * @returns {Object} A mock chart object.
   */
  static createChart(ascendantOrOverrides = {}) {
    // Handle the case where a string ascendant sign is passed
    let ascendantSign = 'ARIES';
    let overrides = {};

    if (typeof ascendantOrOverrides === 'string') {
      ascendantSign = ascendantOrOverrides.toUpperCase();
    } else {
      overrides = ascendantOrOverrides;
      ascendantSign = overrides.ascendant?.sign || 'ARIES';
    }

    // Create chart with array format for planetary positions (for LagnaLordAnalyzer compatibility)
    const chart = {
      ascendant: { sign: ascendantSign, longitude: 15.0 },
      planetaryPositions: []
    };

    // Add all major planets with default positions
    const defaultPlanets = [
      { planet: 'Sun', sign: 'Leo', house: 5, longitude: 135 },
      { planet: 'Moon', sign: 'Cancer', house: 4, longitude: 105 },
      { planet: 'Mars', sign: 'Aries', house: 1, longitude: 15 },
      { planet: 'Mercury', sign: 'Gemini', house: 3, longitude: 75 },
      { planet: 'Jupiter', sign: 'Sagittarius', house: 9, longitude: 255 },
      { planet: 'Venus', sign: 'Taurus', house: 2, longitude: 45 },
      { planet: 'Saturn', sign: 'Capricorn', house: 10, longitude: 285 },
      { planet: 'Rahu', sign: 'Virgo', house: 6, longitude: 165 },
      { planet: 'Ketu', sign: 'Pisces', house: 12, longitude: 345 }
    ];

    defaultPlanets.forEach(planetData => {
      chart.planetaryPositions.push({
        planet: planetData.planet,
        name: planetData.planet,
        sign: planetData.sign,
        house: planetData.house,
        longitude: planetData.longitude,
        degree: planetData.longitude % 30
      });
    });

    // Apply any overrides
    if (overrides.ascendant) {
      chart.ascendant = { ...chart.ascendant, ...overrides.ascendant };
    }
    if (overrides.planetaryPositions) {
      chart.planetaryPositions = { ...chart.planetaryPositions, ...overrides.planetaryPositions };
    }

    return chart;
  }

  /**
   * Adds a planet to a chart's planetary positions.
   * @param {object} chart - The chart object to modify.
   * @param {string} planetName - The name of the planet (e.g., 'Sun').
   * @param {string} sign - The sign the planet is in (e.g., 'Leo').
   * @param {number} degree - The degree of the planet within the sign.
   * @returns {object} The modified chart object.
   */
  static addPlanet(chart, planetName, sign, houseOrDegree) {
    const signLongitudes = {
      'Aries': 0, 'Taurus': 30, 'Gemini': 60, 'Cancer': 90, 'Leo': 120, 'Virgo': 150,
      'Libra': 180, 'Scorpio': 210, 'Sagittarius': 240, 'Capricorn': 270, 'Aquarius': 300, 'Pisces': 330
    };

    // If chart has planetaryPositions as an array, update existing or add new
    if (Array.isArray(chart.planetaryPositions)) {
      // Find and update existing planet, or add new one
      const existingIndex = chart.planetaryPositions.findIndex(p => p.planet === planetName);
      const planetData = {
        planet: planetName,
        name: planetName,
        sign: sign,
        house: houseOrDegree, // Assuming the 3rd parameter is house for array format
        longitude: signLongitudes[sign] + 15,
        degree: 15
      };

      if (existingIndex !== -1) {
        chart.planetaryPositions[existingIndex] = planetData;
      } else {
        chart.planetaryPositions.push(planetData);
      }
    } else {
      // Legacy object format
      chart.planetaryPositions[planetName.toLowerCase()] = {
        name: planetName,
        sign: sign,
        longitude: signLongitudes[sign] + houseOrDegree,
        degree: houseOrDegree,
      };
    }
    return chart;
  }

  /**
   * Creates the house positions for a given ascendant.
   * @param {string} ascendantSign - The ascendant sign.
   * @returns {Array} An array of house sign objects.
   */
  static createHousePositions(ascendantSign) {
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const startIndex = signs.indexOf(ascendantSign);
    const housePositions = [];
    for (let i = 0; i < 12; i++) {
      housePositions.push({
        house: i + 1,
        sign: signs[(startIndex + i) % 12],
      });
    }
    return housePositions;
  }

  /**
   * Generates a chart with a specific Lagna lord placement.
   * @param {string} ascendant - The ascendant sign.
   * @param {string} lordSign - The sign of the Lagna lord.
   * @param {number} lordHouse - The house of the Lagna lord.
   * @returns {object} A chart object with the specified configuration.
   */
  static createChartWithLagnaLord(ascendant, lordSign, lordHouse) {
    const lagnaLord = this.getLagnaLord(ascendant);

    // Create a chart with ascendant and planetary positions as an array
    const chart = {
      ascendant: { sign: ascendant, longitude: 0 },
      planetaryPositions: []
    };

    // Add the lagna lord with the specified placement
    this.addPlanet(chart, lagnaLord, lordSign, lordHouse);
    return chart;
  }

  /**
   * A simple utility to get the lord of a sign.
   * In a real scenario, this would be more complex.
   * @param {string} sign - The sign.
   * @returns {string} The ruling planet.
   */
  static getLagnaLord(sign) {
    const rulers = {
      Aries: 'Mars',
      Taurus: 'Venus',
      Gemini: 'Mercury',
      Cancer: 'Moon',
      Leo: 'Sun',
      Virgo: 'Mercury',
      Libra: 'Venus',
      Scorpio: 'Mars',
      Sagittarius: 'Jupiter',
      Capricorn: 'Saturn',
      Aquarius: 'Saturn',
      Pisces: 'Jupiter',
    };
    return rulers[sign];
  }

  static createChartWithPlanets(planetOverrides = [], chartProps = {}) {
    const defaultPlanets = [
      { name: 'Sun', longitude: 15.0, speed: 1.0, isRetrograde: false },
      { name: 'Moon', longitude: 50.0, speed: 13.0, isRetrograde: false },
      { name: 'Mars', longitude: 100.0, speed: 0.6, isRetrograde: false },
      { name: 'Mercury', longitude: 25.0, speed: 1.2, isRetrograde: false },
      { name: 'Jupiter', longitude: 200.0, speed: 0.1, isRetrograde: false },
      { name: 'Venus', longitude: 300.0, speed: 1.1, isRetrograde: false },
      { name: 'Saturn', longitude: 250.0, speed: 0.05, isRetrograde: false },
    ];

    const planets = defaultPlanets.map(defaultPlanet => {
      const override = planetOverrides.find(p => p.name === defaultPlanet.name);
      return override ? { ...defaultPlanet, ...override } : defaultPlanet;
    });

    const defaultD9 = {
      planets: defaultPlanets.map(p => ({ ...p }))
    };

    return {
      planets,
      ascendant: chartProps.ascendant || { longitude: 10.0 },
      d9: chartProps.d9 || defaultD9,
      ...chartProps
    };
  }

  /**
   * Creates a basic test chart with standard planetary positions
   */
  static createBasicChart() {
    return JSON.parse(JSON.stringify(sampleChart)); // Deep copy
  }

  /**
   * Creates a chart with specific yoga combinations for testing
   */
  static createChartWithYogas() {
    return JSON.parse(JSON.stringify(sampleChartWithYogas)); // Deep copy
  }

  /**
   * Creates a chart with specific ascendant sign
   * @param {string} ascendantSign - The desired ascendant sign
   */
  static createChartWithAscendant(ascendantSign) {
    const chart = this.createBasicChart();
    const signLongitudes = {
      'ARIES': 0, 'TAURUS': 30, 'GEMINI': 60, 'CANCER': 90,
      'LEO': 120, 'VIRGO': 150, 'LIBRA': 180, 'SCORPIO': 210,
      'SAGITTARIUS': 240, 'CAPRICORN': 270, 'AQUARIUS': 300, 'PISCES': 330
    };

    chart.ascendant.longitude = signLongitudes[ascendantSign.toUpperCase()] || 0;
    chart.ascendant.sign = ascendantSign.toUpperCase();
    return chart;
  }

  /**
   * Creates a chart with a planet placed in a specific sign
   * @param {string} planetName - Name of the planet
   * @param {string} signName - Name of the sign
   * @param {number} degree - Degree within the sign (optional)
   */
  static createChartWithPlanetInSign(planetName, signName, degree = 15) {
    const chart = this.createBasicChart();
    const signLongitudes = {
      'ARIES': 0, 'TAURUS': 30, 'GEMINI': 60, 'CANCER': 90,
      'LEO': 120, 'VIRGO': 150, 'LIBRA': 180, 'SCORPIO': 210,
      'SAGITTARIUS': 240, 'CAPRICORN': 270, 'AQUARIUS': 300, 'PISCES': 330
    };

    const planet = chart.planets.find(p => p.name.toLowerCase() === planetName.toLowerCase());
    if (planet) {
      planet.longitude = signLongitudes[signName.toUpperCase()] + degree;
      planet.sign = signName.toUpperCase();
      planet.degree = degree;
    }
    return chart;
  }

  /**
   * Creates a chart for testing specific yoga combinations
   * @param {string} yogaType - Type of yoga to test
   */
  static createChartForYoga(yogaType) {
    switch (yogaType.toLowerCase()) {
      case 'gaja_kesari':
        return this.createGajaKesariYogaChart();
      case 'panch_mahapurusha':
        return this.createPanchMahapurushaYogaChart();
      case 'dhana':
        return this.createDhanaYogaChart();
      case 'raja':
        return this.createRajaYogaChart();
      default:
        return this.createBasicChart();
    }
  }

  /**
   * Creates a chart with Gaja Kesari Yoga
   */
  static createGajaKesariYogaChart() {
    const chart = this.createBasicChart();

    // Moon at 0° Aries (longitude 0)
    const moon = chart.planets.find(p => p.name === 'Moon');
    moon.longitude = 0;
    moon.sign = 'ARIES';
    moon.degree = 0;

    // Jupiter at 0° Cancer (longitude 90) - 4th from Moon (Kendra)
    const jupiter = chart.planets.find(p => p.name === 'Jupiter');
    jupiter.longitude = 90;
    jupiter.sign = 'CANCER';
    jupiter.degree = 0;

    return chart;
  }

  /**
   * Creates a chart with Panch Mahapurusha Yoga (Ruchaka - Mars)
   */
  static createPanchMahapurushaYogaChart() {
    const chart = this.createBasicChart();

    // Mars in Aries (own sign) in 1st house (Kendra) for Ruchaka Yoga
    const mars = chart.planets.find(p => p.name === 'Mars');
    mars.longitude = 15; // 15° Aries
    mars.sign = 'ARIES';
    mars.degree = 15;
    mars.dignity = 'Own Sign';

    chart.ascendant.longitude = 0; // Aries ascendant
    chart.ascendant.sign = 'ARIES';

    return chart;
  }

  /**
   * Creates a chart with Dhana Yoga
   */
  static createDhanaYogaChart() {
    const chart = this.createBasicChart();

    // For Taurus Lagna: 2nd lord (Mercury) and 9th lord (Saturn) in conjunction
    chart.ascendant.longitude = 30; // Taurus ascendant
    chart.ascendant.sign = 'TAURUS';

    // Mercury (2nd lord) in Gemini
    const mercury = chart.planets.find(p => p.name === 'Mercury');
    mercury.longitude = 75; // 15° Gemini
    mercury.sign = 'GEMINI';
    mercury.degree = 15;

    // Saturn (9th lord) also in Gemini - conjunction
    const saturn = chart.planets.find(p => p.name === 'Saturn');
    saturn.longitude = 80; // 20° Gemini
    saturn.sign = 'GEMINI';
    saturn.degree = 20;

    return chart;
  }

  /**
   * Creates a chart with Raja Yoga
   */
  static createRajaYogaChart() {
    const chart = this.createBasicChart();

    // For Leo Lagna: 5th lord (Jupiter) and 9th lord (Mars) in conjunction
    chart.ascendant.longitude = 120; // Leo ascendant
    chart.ascendant.sign = 'LEO';

    // Jupiter (5th lord) in Sagittarius
    const jupiter = chart.planets.find(p => p.name === 'Jupiter');
    jupiter.longitude = 255; // 15° Sagittarius
    jupiter.sign = 'SAGITTARIUS';
    jupiter.degree = 15;

    // Mars (9th lord) also in Sagittarius - conjunction
    const mars = chart.planets.find(p => p.name === 'Mars');
    mars.longitude = 260; // 20° Sagittarius
    mars.sign = 'SAGITTARIUS';
    mars.degree = 20;

    return chart;
  }

  /**
   * Creates sample birth data for testing
   */
  static createSampleBirthData() {
    return JSON.parse(JSON.stringify(sampleBirthData)); // Deep copy
  }

  /**
   * Creates birth data with specific location
   * @param {number} latitude
   * @param {number} longitude
   * @param {string} timezone
   */
  static createBirthDataWithLocation(latitude, longitude, timezone) {
    const birthData = this.createSampleBirthData();
    birthData.latitude = latitude;
    birthData.longitude = longitude;
    birthData.timezone = timezone;
    return birthData;
  }
}

module.exports = TestChartFactory;
