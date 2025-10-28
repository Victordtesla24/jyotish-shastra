/**
 * Test Chart Factory
 * Creates mock chart data for testing
 */

class TestChartFactory {
  /**
   * Create a basic test chart with planets and houses
   * @param {Object} options - Configuration options
   * @returns {Object} Mock chart data
   */
  static createBasicChart(options = {}) {
    const defaults = {
      ascendant: 0, // Aries
      houses: this.generateHouses(options.ascendant || 0),
      planets: this.generatePlanets(),
      birthData: {
        name: 'Test User',
        dateOfBirth: '1990-01-01',
        timeOfBirth: '12:00',
        latitude: 19.076,
        longitude: 72.8777,
        timezone: 'Asia/Kolkata'
      }
    };

    return { ...defaults, ...options };
  }

  /**
   * Generate house positions
   * @param {number} ascendant - Ascendant sign index (0-11)
   * @returns {Array} House data
   */
  static generateHouses(ascendant = 0) {
    const houses = [];
    for (let i = 0; i < 12; i++) {
      houses.push({
        house: i + 1,
        sign: (ascendant + i) % 12,
        degree: 0,
        lord: this.getHouseLord((ascendant + i) % 12)
      });
    }
    return houses;
  }

  /**
   * Generate basic planet positions
   * @returns {Object} Planet positions
   */
  static generatePlanets() {
    return {
      Sun: { sign: 9, degree: 10, house: 1, isRetrograde: false },
      Moon: { sign: 1, degree: 20, house: 2, isRetrograde: false },
      Mars: { sign: 9, degree: 15, house: 1, isRetrograde: false },
      Mercury: { sign: 9, degree: 5, house: 1, isRetrograde: false },
      Jupiter: { sign: 1, degree: 25, house: 2, isRetrograde: false },
      Venus: { sign: 10, degree: 12, house: 2, isRetrograde: false },
      Saturn: { sign: 9, degree: 8, house: 1, isRetrograde: false },
      Rahu: { sign: 5, degree: 15, house: 6, isRetrograde: true },
      Ketu: { sign: 11, degree: 15, house: 12, isRetrograde: true }
    };
  }

  /**
   * Get house lord for a sign
   * @param {number} sign - Sign index (0-11)
   * @returns {string} Planet name
   */
  static getHouseLord(sign) {
    const lords = [
      'Mars',    // Aries (0)
      'Venus',   // Taurus (1)
      'Mercury', // Gemini (2)
      'Moon',    // Cancer (3)
      'Sun',     // Leo (4)
      'Mercury', // Virgo (5)
      'Venus',   // Libra (6)
      'Mars',    // Scorpio (7)
      'Jupiter', // Sagittarius (8)
      'Saturn',  // Capricorn (9)
      'Saturn',  // Aquarius (10)
      'Jupiter'  // Pisces (11)
    ];
    return lords[sign];
  }

  /**
   * Create chart with planets (for PlanetaryStrengthCalculator)
   * @returns {Object} Chart with planetary positions
   */
  static createChartWithPlanets(customPlanets = null, options = {}) {
    let planets;
    const signNames = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    
    if (customPlanets && Array.isArray(customPlanets)) {
      // Use custom planets and fill in missing properties
      planets = customPlanets.map(p => {
        const longitude = p.longitude || 0;
        const signIndex = Math.floor(longitude / 30);
        
        return {
          name: p.name,
          sign: signNames[signIndex],
          degree: longitude % 30,
          house: p.house || 1,
          longitude: longitude,
          isRetrograde: p.isRetrograde || false,
          dignity: p.dignity || 'neutral'
        };
      });
    } else {
      // Default planets
      planets = [
        { name: 'Sun', sign: 'Sagittarius', degree: 10, house: 9, longitude: 250, isRetrograde: false, dignity: 'neutral' },
        { name: 'Moon', sign: 'Taurus', degree: 20, house: 2, longitude: 50, isRetrograde: false, dignity: 'neutral' },
        { name: 'Mars', sign: 'Aries', degree: 15, house: 1, longitude: 15, isRetrograde: false, dignity: 'own' },
        { name: 'Mercury', sign: 'Sagittarius', degree: 5, house: 9, longitude: 245, isRetrograde: false, dignity: 'neutral' },
        { name: 'Jupiter', sign: 'Sagittarius', degree: 25, house: 9, longitude: 265, isRetrograde: false, dignity: 'own' },
        { name: 'Venus', sign: 'Capricorn', degree: 12, house: 10, longitude: 282, isRetrograde: false, dignity: 'neutral' },
        { name: 'Saturn', sign: 'Capricorn', degree: 8, house: 10, longitude: 278, isRetrograde: false, dignity: 'own' },
        { name: 'Rahu', sign: 'Gemini', degree: 15, house: 3, longitude: 75, isRetrograde: true, dignity: 'neutral' },
        { name: 'Ketu', sign: 'Sagittarius', degree: 15, house: 9, longitude: 255, isRetrograde: true, dignity: 'neutral' }
      ];
    }
    
    // Handle d9 chart from options or custom creation
    let d9Chart = null;
    if (options.d9) {
      d9Chart = options.d9;
    } else if (customPlanets) {
      d9Chart = {
        planets: customPlanets.map(p => {
          const longitude = p.longitude || 0;
          const signIndex = Math.floor(longitude / 30);
          
          return {
            name: p.name,
            sign: signNames[signIndex],
            degree: longitude % 30,
            longitude: longitude
          };
        })
      };
    }
    
    return {
      ascendant: { sign: 'Aries', degree: 15, longitude: 15 },
      planets: planets,  // Direct planets array for PlanetaryStrengthCalculator
      rasiChart: {
        ascendant: { sign: 'Aries', degree: 15, longitude: 15 },
        planets: planets
      },
      birthData: {
        name: 'Test User',
        dateOfBirth: '1990-01-01',
        timeOfBirth: '12:00',
        latitude: 19.076,
        longitude: 72.8777,
        timezone: 'Asia/Kolkata'
      },
      d9: d9Chart
    };
  }

  /**
   * Create chart with Lagna lord in specific position
   * @param {string} ascendantSign - Ascendant sign
   * @param {string} lordPlacementSign - Sign where lagna lord is placed
   * @param {number} lordPlacementHouse - House where lagna lord is placed
   * @returns {Object} Chart with lagna lord placement
   */
  static createChartWithLagnaLord(ascendantSign, lordPlacementSign, lordPlacementHouse) {
    const lagnaLord = this.getHouseLord(this.getSignIndex(ascendantSign));
    const lordSignIndex = this.getSignIndex(lordPlacementSign);
    
    return {
      ascendant: { 
        sign: ascendantSign, 
        degree: 15, 
        longitude: this.getSignIndex(ascendantSign) * 30 + 15 
      },
      planetaryPositions: [
        { 
          planet: lagnaLord, 
          name: lagnaLord,
          sign: lordPlacementSign, 
          signIndex: lordSignIndex,
          degree: 10, 
          longitude: lordSignIndex * 30 + 10,
          house: lordPlacementHouse, 
          isRetrograde: false, 
          dignity: 'neutral' 
        }
      ],
      rasiChart: {
        ascendant: { sign: ascendantSign, degree: 15, longitude: this.getSignIndex(ascendantSign) * 30 + 15 },
        planets: [
          { 
            name: lagnaLord, 
            planet: lagnaLord,
            sign: lordPlacementSign, 
            signIndex: lordSignIndex,
            degree: 10, 
            longitude: lordSignIndex * 30 + 10,
            house: lordPlacementHouse, 
            isRetrograde: false, 
            dignity: 'neutral' 
          }
        ]
      },
      birthData: {
        name: 'Test User',
        dateOfBirth: '1990-01-01',
        timeOfBirth: '12:00',
        latitude: 19.076,
        longitude: 72.8777,
        timezone: 'Asia/Kolkata'
      }
    };
  }

  /**
   * Add a planet to an existing chart
   * @param {Object} chart - Chart object to modify
   * @param {string} planetName - Planet name
   * @param {string} sign - Sign where planet is placed
   * @param {number} house - House where planet is placed
   * @returns {Object} Updated chart
   */
  static addPlanet(chart, planetName, sign, degreeOrHouse) {
    // Ensure arrays exist
    if (!chart.rasiChart) chart.rasiChart = { planets: [] };
    if (!chart.rasiChart.planets) chart.rasiChart.planets = [];
    if (!chart.planetaryPositions) chart.planetaryPositions = [];
    
    const signIndex = this.getSignIndex(sign);
    
    // PRODUCTION-GRADE: Intelligent parameter detection using precision mode flag
    const isPrecisionMode = chart._precisionMode === true;
    
    let degree, house, longitude;
    const ascLongitude = chart.ascendant?.longitude || (chart.rasiChart?.ascendant?.longitude || 0);
    
    // Detection logic based on explicit mode flag:
    // 1. If chart is tagged as _precisionMode: treat 1-30 as degrees
    // 2. If value > 12: always treat as degree
    // 3. Default: treat 1-12 as house numbers (standard usage)
    if (isPrecisionMode || (degreeOrHouse > 12 && degreeOrHouse <= 30)) {
      // Parameter is degree within the sign (precision mode for Navamsa, etc.)
      degree = degreeOrHouse;
      longitude = signIndex * 30 + degree;
      // Calculate house from longitude
      let houseLongitude = longitude - ascLongitude;
      if (houseLongitude < 0) houseLongitude += 360;
      house = Math.floor(houseLongitude / 30) + 1;
    } else {
      // Parameter is house number (standard mode)
      house = degreeOrHouse;
      degree = 15;
      longitude = signIndex * 30 + degree;
    }
    
    const planetData = {
      planet: planetName,
      name: planetName,
      sign: sign,
      signIndex: signIndex,
      degree: degree,
      longitude: longitude,
      house: house,
      isRetrograde: false,
      dignity: 'neutral'
    };
    
    // COMPLETE REPLACEMENT: Remove ALL instances of this planet
    const nameMatch = planetName.toLowerCase();
    chart.planetaryPositions = chart.planetaryPositions.filter(p => {
      const pName = (p.planet || p.name || '').toLowerCase();
      return pName !== nameMatch;
    });
    chart.rasiChart.planets = chart.rasiChart.planets.filter(p => {
      const pName = (p.planet || p.name || '').toLowerCase();
      return pName !== nameMatch;
    });
    
    // Add the updated planet to both structures
    chart.planetaryPositions.push(planetData);
    chart.rasiChart.planets.push(planetData);
    
    return chart;
  }

  /**
   * Create chart with custom configuration
   * @param {Object} config - Chart configuration
   * @returns {Object} Custom chart
   */
  static createChart(config, ascendantDegree = null) {
    if (typeof config === 'string') {
      // If config is a string, treat it as ascendant sign
      const ascendantSign = config;
      const degree = ascendantDegree !== null ? ascendantDegree : 15;
      
      // If ascendantDegree is provided, this is a precision test (don't add default planets)
      const isPrecisionMode = ascendantDegree !== null;
      
      if (isPrecisionMode) {
        // Precision mode: minimal chart for specific calculations (Navamsa, etc.)
        return {
          _precisionMode: true, // Tag for detection in addPlanet
          rasiChart: {
            ascendant: { sign: ascendantSign, degree: degree, longitude: this.getSignIndex(ascendantSign) * 30 + degree },
            planets: []
          },
          ascendant: { sign: ascendantSign, longitude: this.getSignIndex(ascendantSign) * 30 + degree },
          planetaryPositions: [],
          birthData: {
            name: 'Precision Test',
            dateOfBirth: '1990-01-01',
            timeOfBirth: '12:00',
            latitude: 19.076,
            longitude: 72.8777,
            timezone: 'Asia/Kolkata'
          }
        };
      }
      
      // Standard mode: full chart with default planets
      const planets = this.generatePlanets();
      
      return {
        rasiChart: {
          ascendant: { sign: ascendantSign, degree: 15, longitude: this.getSignIndex(ascendantSign) * 30 + 15 },
          planets: Object.entries(planets).map(([name, data]) => ({
            name,
            planet: name, // For backward compatibility
            sign: this.getSignName(data.sign),
            signIndex: data.sign,
            degree: data.degree,
            longitude: data.sign * 30 + data.degree, // Add longitude
            house: data.house,
            isRetrograde: data.isRetrograde,
            dignity: 'neutral'
          }))
        },
        ascendant: { sign: ascendantSign, longitude: this.getSignIndex(ascendantSign) * 30 + 15 },
        planetaryPositions: Object.entries(planets).map(([name, data]) => ({
          planet: name,
          name,
          sign: this.getSignName(data.sign),
          signIndex: data.sign,
          degree: data.degree,
          longitude: data.sign * 30 + data.degree, // Add longitude
          house: data.house,
          isRetrograde: data.isRetrograde
        })),
        birthData: {
          name: 'Test User',
          dateOfBirth: '1990-01-01',
          timeOfBirth: '12:00',
          latitude: 19.076,
          longitude: 72.8777,
          timezone: 'Asia/Kolkata'
        }
      };
    }
    
    const chart = {
      ascendant: config.ascendant || { sign: 'Aries', longitude: 15.0 },
      planetaryPositions: config.planetaryPositions || this.generatePlanets(),
      birthData: config.birthData || {
        name: 'Test User',
        dateOfBirth: '1990-01-01',
        timeOfBirth: '12:00',
        latitude: 19.076,
        longitude: 72.8777,
        timezone: 'Asia/Kolkata'
      }
    };
    
    return chart;
  }

  /**
   * Get sign name from index
   * @param {number} signIndex - Sign index (0-11)
   * @returns {string} Sign name
   */
  static getSignName(signIndex) {
    const signs = [
      'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];
    return signs[signIndex] || 'Aries';
  }

  /**
   * Get sign index from name
   * @param {string} signName - Sign name
   * @returns {number} Sign index (0-11)
   */
  static getSignIndex(signName) {
    const signs = [
      'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];
    const index = signs.indexOf(signName);
    return index !== -1 ? index : 0;
  }

  /**
   * Create chart with specific yoga conditions
   * @param {string} yogaType - Type of yoga to create
   * @returns {Object} Chart data with yoga
   */
  static createChartWithYoga(yogaType) {
    const chart = this.createBasicChart();
    
    switch (yogaType) {
      case 'gajaKesari':
        // Moon in Kendra from Jupiter
        chart.planets.Moon = { sign: 0, degree: 10, house: 1, isRetrograde: false };
        chart.planets.Jupiter = { sign: 0, degree: 15, house: 1, isRetrograde: false };
        break;
        
      case 'rajaYoga':
        // Kendra lord (Venus) with Trikona lord (Mars)
        chart.planets.Venus = { sign: 0, degree: 10, house: 1, isRetrograde: false };
        chart.planets.Mars = { sign: 0, degree: 12, house: 1, isRetrograde: false };
        break;
        
      case 'dhanaYoga':
        // 2nd and 11th lords conjunct
        chart.planets.Venus = { sign: 0, degree: 10, house: 1, isRetrograde: false };
        chart.planets.Mercury = { sign: 0, degree: 12, house: 1, isRetrograde: false };
        break;
    }
    
    return chart;
  }
  /**
   * Create chart with Lagna lord in specific position
   * @param {string} lagnaSign - Ascendant sign
   * @param {string} lordSign - Sign where lord is placed
   * @param {number} lordHouse - House where lord is placed
   * @returns {Object} Chart with Lagna lord positioned
   */
  static createChartWithLagnaLord(lagnaSign, lordSign, lordHouse) {
    const chart = {
      rasiChart: {
        ascendant: {
          sign: lagnaSign,
          degree: 15,
          longitude: this.getSignIndex(lagnaSign) * 30 + 15
        },
        planets: []
      },
      birthData: {
        name: 'Test Chart',
        dateOfBirth: '1990-01-01',
        timeOfBirth: '12:00',
        latitude: 19.076,
        longitude: 72.8777,
        timezone: 'Asia/Kolkata'
      }
    };
    return chart;
  }

  /**
   * Add planet to chart
   * @param {Object} chart - Chart object
   * @param {string} planetName - Planet name
   * @param {string} sign - Sign name
   * @param {number} house - House number
   */

  /**
   * Get sign index from sign name
   * @param {string} signName - Sign name
   * @returns {number} Sign index (0-11)
   */
  static getSignIndex(signName) {
    const signs = [
      'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];
    const index = signs.indexOf(signName);
    return index === -1 ? 0 : index;
  }
}

export default TestChartFactory;
module.exports = TestChartFactory;

