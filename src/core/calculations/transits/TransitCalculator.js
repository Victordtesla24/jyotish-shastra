/**
 * Transit Calculator
 * Calculates current planetary transits and their effects
 * Integrates with Swiss Ephemeris (Native Node.js Bindings) for precise calculations
 */
import { calculateJulianDay } from '../../../utils/calculations/julianDay.js';
import { getSignName } from '../../../utils/helpers/astrologyHelpers.js';
import { getSwisseph } from '../../../utils/swisseph-wrapper.js';

class TransitCalculator {
  constructor(natalChart) {
    this.natalChart = natalChart;
    this.swisseph = null;
    this.swissephAvailable = false;
    this.initialized = false;
    this.initializeTransitData();
  }

  /**
   * Initialize transit calculation parameters
   */
  initializeTransitData() {
    // Transit speed (degrees per day) for each planet
    this.planetarySpeeds = {
      'sun': 0.9856,      // ~1° per day
      'moon': 13.1764,    // ~13.18° per day
      'mars': 0.5240,     // Variable, average
      'mercury': 1.3833,  // Variable, average
      'jupiter': 0.0831,  // ~5' per day
      'venus': 1.6021,    // Variable, average
      'saturn': 0.0335,   // ~2' per day
      'rahu': -0.0529,    // Retrograde motion
      'ketu': -0.0529     // Retrograde motion
    };

    // Transit significance periods
    this.significantTransits = {
      'jupiter': {
        duration: 365,      // 1 year per sign
        orb: 5,            // 5° orb for effects
        significance: 'High'
      },
      'saturn': {
        duration: 912,      // 2.5 years per sign
        orb: 3,            // 3° orb for effects
        significance: 'Very High'
      },
      'rahu': {
        duration: 548,      // 1.5 years per sign
        orb: 2,            // 2° orb for effects
        significance: 'High'
      },
      'ketu': {
        duration: 548,      // 1.5 years per sign
        orb: 2,            // 2° orb for effects
        significance: 'High'
      }
    };

    // House significations for transit effects
    this.houseEffects = {
      1: ['Health', 'Personality', 'Vitality', 'Self-image'],
      2: ['Wealth', 'Family', 'Speech', 'Food'],
      3: ['Siblings', 'Courage', 'Communication', 'Short journeys'],
      4: ['Mother', 'Home', 'Property', 'Emotions'],
      5: ['Children', 'Education', 'Intelligence', 'Romance'],
      6: ['Health', 'Enemies', 'Service', 'Daily routine'],
      7: ['Marriage', 'Partnership', 'Business', 'Public relations'],
      8: ['Longevity', 'Transformation', 'Inheritance', 'Occult'],
      9: ['Father', 'Dharma', 'Higher education', 'Fortune'],
      10: ['Career', 'Status', 'Reputation', 'Authority'],
      11: ['Income', 'Gains', 'Friends', 'Fulfillment'],
      12: ['Expenses', 'Foreign travel', 'Spirituality', 'Liberation']
    };
  }

  /**
   * Initialize the calculator with Swiss Ephemeris
   */
  async initialize() {
    if (this.initialized) {
      return true;
    }
    
    try {
      // Use centralized Swiss Ephemeris wrapper (native bindings, no WASM)
      this.swisseph = await getSwisseph();
      this.swissephAvailable = true;
      
      // Set sidereal mode to Lahiri by default (handled by wrapper during initialization)
      
      this.initialized = true;
      console.log('✅ TransitCalculator: Initialized successfully with native Swiss Ephemeris bindings');
      return true;
      
    } catch (error) {
      throw new Error(`Transit calculator initialization failed: ${error.message}`);
    }
  }

  /**
   * Get transiting planets for a given date
   */
  async getTransitingPlanets(date) {
    // Ensure calculator is initialized
    await this.initialize();
    
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();
    const hour = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
    
    // Calculate Julian Day
    let julianDay;
    if (this.swissephAvailable && this.swisseph && typeof this.swisseph.swe_julday === 'function') {
      const result = await this.swisseph.swe_julday(year, month, day, hour, 1); // SE_GREG_CAL = 1
      julianDay = typeof result === 'object' && result.julianDay ? result.julianDay : result;
    } else {
      throw new Error('Swiss Ephemeris is required for transit calculations but is not available');
    }
    
    const planets = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'];
    const positions = {};
    
    // Use Swiss Ephemeris - no fallbacks
    for (const planet of planets) {
      // Handle Ketu separately (opposite to Rahu)
      if (planet === 'ketu') {
        if (positions.rahu) {
          const ketuLongitude = (positions.rahu.longitude + 180) % 360;
          positions[planet] = {
            longitude: ketuLongitude,
            sign: Math.floor(ketuLongitude / 30),
            degree: ketuLongitude % 30,
            signName: getSignName(Math.floor(ketuLongitude / 30))
          };
        }
        continue;
      }
      
      try {
        // Map planet names to Swiss Ephemeris constants
        const planetConstants = {
          'sun': 0,      // SE_SUN
          'moon': 1,     // SE_MOON
          'mars': 2,     // SE_MARS
          'mercury': 3,  // SE_MERCURY
          'jupiter': 4,  // SE_JUPITER
          'venus': 5,    // SE_VENUS
          'saturn': 6,   // SE_SATURN
          'rahu': 10     // SE_MEAN_NODE (for Rahu/Ketu)
        };
        
        const planetId = planetConstants[planet];
        if (planetId === undefined) {
          throw new Error(`Planet ID not found for ${planet}`);
        }
        
        const result = await this.swisseph.swe_calc_ut(julianDay, planetId, 2); // SEFLG_SPEED = 2
        
        if (result && result.rcode === 0) {
          positions[planet] = {
            longitude: result.data.longitude,
            sign: Math.floor(result.data.longitude / 30),
            degree: result.data.longitude % 30,
            signName: getSignName(Math.floor(result.data.longitude / 30)),
            speed: result.data.speed || 0
          };
        } else {
          throw new Error(`Swiss Ephemeris calculation failed for ${planet}: rcode=${result ? result.rcode : 'unknown'}`);
        }
      } catch (error) {
        throw new Error(`Swiss Ephemeris calculation failed for ${planet}: ${error.message}`);
      }
    }
    
    return positions;
  }

  /**
   * Get house of transiting planet
   */
  getHouseOfTransitingPlanet(transitingPlanet) {
    return this.getHouseFromLongitude(transitingPlanet.longitude, this.natalChart.ascendant.longitude);
  }

  /**
   * Get aspects to natal planets
   */
  async getAspectsToNatal(transitingPlanet) {
    return this.calculateTransitAspects(transitingPlanet.name, transitingPlanet, this.natalChart);
  }

  /**
   * Check Sade Sati (Saturn's 7.5 year period)
   */
  async checkSadeSati(date) {
    const transitingPlanets = await this.getTransitingPlanets(date);
    
    if (!transitingPlanets.saturn || !this.natalChart.moon) {
      return {
        sadeSatiActive: false,
        phase: 'Unknown',
        description: 'Insufficient data to determine Sade Sati'
      };
    }
    
    const saturnLongitude = transitingPlanets.saturn.longitude;
    const moonLongitude = this.natalChart.moon.longitude;
    
    // Calculate the difference
    let difference = Math.abs(saturnLongitude - moonLongitude);
    if (difference > 180) {
      difference = 360 - difference;
    }
    
    // Check if Saturn is within orb of Moon (usually 60 degrees total)
    const orb = 60;
    
    if (difference <= orb) {
      let phase = 'Unknown';
      
      if (saturnLongitude >= moonLongitude - orb && saturnLongitude < moonLongitude - 30) {
        phase = 'First Phase (Ascending)';
      } else if (saturnLongitude >= moonLongitude - 30 && saturnLongitude <= moonLongitude + 30) {
        phase = 'Second Phase (Over Moon)';
      } else if (saturnLongitude > moonLongitude + 30 && saturnLongitude <= moonLongitude + orb) {
        phase = 'Third Phase (Descending)';
      }
      
      return {
        sadeSatiActive: true,
        phase: phase,
        difference: difference,
        saturnLongitude: saturnLongitude,
        moonLongitude: moonLongitude,
        description: `Sade Sati is active. Saturn is ${difference.toFixed(2)}° from natal Moon. ${phase}`
      };
    }
    
    // Check if approaching Sade Sati
    const approachOrb = 90;
    if (difference <= approachOrb) {
      return {
        sadeSatiActive: false,
        phase: 'Approaching',
        difference: difference,
        saturnLongitude: saturnLongitude,
        moonLongitude: moonLongitude,
        description: `Sade Sati is approaching. Saturn is ${difference.toFixed(2)}° from natal Moon.`
      };
    }
    
    return {
      sadeSatiActive: false,
      phase: 'Not Active',
      difference: difference,
      saturnLongitude: saturnLongitude,
      moonLongitude: moonLongitude,
      description: `Sade Sati is not active. Saturn is ${difference.toFixed(2)}° from natal Moon.`
    };
  }

  /**
   * Calculate comprehensive transit analysis
   */
  async calculateTransitAnalysis(date) {
    const transitingPlanets = await this.getTransitingPlanets(date);
    const sadeSatiAnalysis = await this.checkSadeSati(date);
    
    // Calculate aspects for each transiting planet
    const transitAspects = {};
    for (const [planetName, planetData] of Object.entries(transitingPlanets)) {
      transitAspects[planetName] = await this.getAspectsToNatal({
        name: planetName,
        ...planetData
      });
    }
    
    // Determine significant transits
    const significantTransits = this.determineSignificantTransits(transitingPlanets);
    
    return {
      date: date.toISOString(),
      transitingPlanets: transitingPlanets,
      transitAspects: transitAspects,
      significantTransits: significantTransits,
      sadeSati: sadeSatiAnalysis,
      method: 'swisseph-wasm'
    };
  }

  /**
   * Determine significant transits based on planetary speeds and orbs
   */
  determineSignificantTransits(transitingPlanets) {
    const significant = [];
    
    for (const [planet, position] of Object.entries(transitingPlanets)) {
      if (this.significantTransits[planet]) {
        const transitData = this.significantTransits[planet];
        
        // Check conjunction with natal planets
        for (const [natalPlanet, natalData] of Object.entries(this.natalChart)) {
          if (typeof natalData === 'object' && natalData.longitude) {
            const difference = Math.abs(position.longitude - natalData.longitude);
            
            if (difference <= transitData.orb) {
              significant.push({
                transitingPlanet: planet,
                natalPlanet: natalPlanet,
                aspect: 'Conjunction',
                difference: difference,
                orb: transitData.orb,
                significance: transitData.significance,
                effect: this.getTransitEffect(planet, 1, natalPlanet) // 1 = conjunction
              });
            }
          }
        }
      }
    }
    
    return significant;
  }

  /**
   * Get transit effect description
   */
  getTransitEffect(transitingPlanet, aspectType, natalPlanet) {
    const effects = {
      'saturn': {
        1: 'Restriction, discipline, responsibility, hardships leading to growth',
        'conjunction': 'Restriction, discipline, responsibility, hardships leading to growth'
      },
      'jupiter': {
        1: 'Expansion, good fortune, wisdom, opportunities',
        'conjunction': 'Expansion, good fortune, wisdom, opportunities'
      }
    };
    
    return effects[transitingPlanet]?.[aspectType] || effects[transitingPlanet]?.['conjunction'] || 'Significant influence';
  }

  /**
   * Calculate transit aspects to natal planets
   */
  calculateTransitAspects(transitingPlanetName, transitingPlanet, natalChart) {
    const aspects = [];
    const aspectTypes = [
      { name: 'Conjunction', angle: 0, orb: 8 },
      { name: 'Opposition', angle: 180, orb: 8 },
      { name: 'Trine', angle: 120, orb: 8 },
      { name: 'Square', angle: 90, orb: 8 },
      { name: 'Sextile', angle: 60, orb: 6 }
    ];
    
    for (const [natalPlanet, natalData] of Object.entries(natalChart)) {
      if (typeof natalData === 'object' && natalData.longitude) {
        for (const aspect of aspectTypes) {
          const angleDifference = Math.abs(transitingPlanet.longitude - natalData.longitude);
          
          if (aspect.name === 'Opposition') {
            const adjustedDifference = angleDifference > 180 ? 360 - angleDifference : angleDifference;
            if (Math.abs(adjustedDifference - aspect.angle) <= aspect.orb) {
              aspects.push({
                transitingPlanet: transitingPlanetName,
                natalPlanet: natalPlanet,
                aspect: aspect.name,
                angle: aspect.angle,
                difference: adjustedDifference,
                orb: aspect.orb,
                exact: Math.abs(adjustedDifference - aspect.angle) <= 1
              });
            }
          } else {
            if (Math.abs(angleDifference - aspect.angle) <= aspect.orb) {
              aspects.push({
                transitingPlanet: transitingPlanetName,
                natalPlanet: natalPlanet,
                aspect: aspect.name,
                angle: aspect.angle,
                difference: angleDifference,
                orb: aspect.orb,
                exact: Math.abs(angleDifference - aspect.angle) <= 1
              });
            }
          }
        }
      }
    }
    
    return aspects;
  }

  /**
   * Calculate house from longitude
   */
  getHouseFromLongitude(planetLongitude, ascendantLongitude) {
    const difference = planetLongitude - ascendantLongitude;
    const normalizedDifference = difference < 0 ? difference + 360 : difference;
    return Math.floor(normalizedDifference / 30) + 1;
  }

  /**
   * Get sign name helper
   */
  getSignName(signIndex) {
    return getSignName(signIndex);
  }

  /**
   * Check if Swiss Ephemeris is available
   */
  async isSwissephAvailable() {
    await this.initialize();
    return this.swissephAvailable;
  }
}

// Export utility functions
export { ensureSwissephLoaded };
export async function isSwissephAvailable() {
  if (swisseph === null) {
    await ensureSwissephLoaded();
  }
  return swissephAvailable;
}

export default TransitCalculator;
