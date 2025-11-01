/**
 * Planetary Positions Module
 * Provides fallback planetary position calculations for when Swiss Ephemeris is unavailable
 * Pure JavaScript implementation for serverless environments
 */

/**
 * Calculate basic planetary position using simplified algorithms
 * This is a fallback implementation when Swiss Ephemeris is not available
 * @param {string} planet - Planet name ('sun', 'moon', 'mars', etc.)
 * @param {number} julianDay - Julian Day Number
 * @returns {Object} Position data with returnCode flag
 */
export function calculatePlanetPosition(planet, julianDay) {
  try {
    // Basic mean orbital elements for planets
    const planetaryElements = {
      sun: {
        period: 365.25636, // days
        epochLongitude: 280.46606, // degrees at J2000.0
        dailyMotion: 0.9856076, // degrees/day
        eccentricity: 0.016711
      },
      moon: {
        period: 27.321582, // days
        epochLongitude: 125.1228, // degrees at J2000.0
        dailyMotion: 13.064992, // degrees/day
        eccentricity: 0.0549
      },
      mercury: {
        period: 87.969, // days
        epochLongitude: 174.794837, // degrees at J2000.0
        dailyMotion: 4.092384, // degrees/day
        eccentricity: 0.2056
      },
      venus: {
        period: 224.7, // days
        epochLongitude: 50.416, // degrees at J2000.0
        dailyMotion: 1.602130, // degrees/day
        eccentricity: 0.0067
      },
      mars: {
        period: 686.98, // days
        epochLongitude: 355.433, // degrees at J2000.0
        dailyMotion: 0.524039, // degrees/day
        eccentricity: 0.0934
      },
      jupiter: {
        period: 4332.59, // days
        epochLongitude: 20.020, // degrees at J2000.0
        dailyMotion: 0.083056, // degrees/day
        eccentricity: 0.0484
      },
      saturn: {
        period: 10759.22, // days
        epochLongitude: 317.020, // degrees at J2000.0
        dailyMotion: 0.033588, // degrees/day
        eccentricity: 0.0557
      }
    };

    const planetData = planetaryElements[planet.toLowerCase()];
    
    if (!planetData) {
      return {
        returnCode: -1,
        error: `Unknown planet: ${planet}`
      };
    }

    // Calculate days since J2000.0 (January 1, 2000, 12:00 TT)
    const daysSinceEpoch = julianDay - 2451545.0;
    
    // Calculate mean longitude
    let meanLongitude = planetData.epochLongitude + (planetData.dailyMotion * daysSinceEpoch);
    
    // Normalize to 0-360 range
    while (meanLongitude < 0) meanLongitude += 360;
    while (meanLongitude >= 360) meanLongitude -= 360;
    
    // Very simplified calculation - doesn't account for true anomalies, latitudes, etc.
    // This is basic rough approximation for fallback purposes
    const latitude = 0; // Simplified - set to 0 for basic calculations
    const distance = 1.0; // Simplified distance in AU
    
    return {
      returnCode: 0, // Success
      longitude: meanLongitude,
      latitude: latitude,
      distance: distance,
      speed: planetData.dailyMotion * 24, // Speed is daily motion, convert to per hour
      rtri: 0, // Right ascension triple (not calculated in fallback)
      declination: 0 // Declination (not calculated in fallback)
    };
    
  } catch (error) {
    return {
      returnCode: -1,
      error: `Error calculating ${planet} position: ${error.message}`
    };
  }
}

/**
 * Calculate planetary mean longitude more precisely
 * @param {string} planet - Planet name
 * @param {number} julianDay - Julian Day Number  
 * @returns {Object} Mean longitude in degrees
 */
export function calculateMeanLongitude(planet, julianDay) {
  const centuries = (julianDay - 2451545.0) / 36525.0; // Julian centuries since J2000.0
  
  // More precise mean longitude formulas (degrees)
  const meanLongitudes = {
    mercury: 252.2503 + 149472.67463 * centuries + 0.00003 * centuries * centuries,
    venus: 181.9798 + 58518.08053 * centuries + 0.00056 * centuries * centuries,
    earth: 100.46645 + 35999.50286 * centuries - 0.00003 * centuries * centuries,
    mars: 355.4534 + 19139.92306 * centuries + 0.00031 * centuries * centuries,
    jupiter: 19.8950 + 3034.90258 * centuries - 0.00022 * centuries * centuries,
    saturn: 316.2266 + 1222.11379 * centuries - 0.20042 * centuries * centuries
  };
  
  const sunMeanLongitude = 280.46645 + 36000.76983 * centuries + 0.000302 * centuries * centuries;
  
  // For Moon calculation - more complex but still simplified
  const moonLongitude = 218.3165 + 481267.8813 * centuries;
  
  let longitude;
  
  if (planet === 'sun') {
    longitude = sunMeanLongitude;
  } else if (planet === 'moon') {
    longitude = moonLongitude;
  } else if (meanLongitudes[planet]) {
    longitude = meanLongitudes[planet];
  } else {
    throw new Error(`Unsupported planet: ${planet}`);
  }
  
  // Normalize to 0-360 range
  while (longitude < 0) longitude += 360;
  while (longitude >= 360) longitude -= 360;
  
  return longitude;
}

/**
 * Get basic planetary information
 * @param {string} planet - Planet name
 * @returns {Object} Basic planet data
 */
export function getPlanetInfo(planet) {
  const planets = {
    sun: {
      symbol: '☉',
      element: 'fire',
      quality: 'masculine',
      rulingSign: 'Leo'
    },
    moon: {
      symbol: '☽', 
      element: 'water',
      quality: 'feminine',
      rulingSign: 'Cancer'
    },
    mercury: {
      symbol: '☿',
      element: 'earth',
      quality: 'mutable',
      rulingSign: ['Gemini', 'Virgo']
    },
    venus: {
      symbol: '♀',
      element: 'earth', 
      quality: 'feminine',
      rulingSign: ['Taurus', 'Libra']
    },
    mars: {
      symbol: '♂',
      element: 'fire',
      quality: 'masculine', 
      rulingSign: ['Aries', 'Scorpio']
    },
    jupiter: {
      symbol: '♃',
      element: 'fire',
      quality: 'masculine',
      rulingSign: ['Sagittarius', 'Pisces']
    },
    saturn: {
      symbol: '♄',
      element: 'air',
      quality: 'feminine',
      rulingSign: ['Capricorn', 'Aquarius']
    }
  };
  
  return planets[planet.toLowerCase()] || null;
}

/**
 * Format planetary position for display
 * @param {number} longitude - Longitude in degrees
 * @param {number} latitude - Latitude in degrees
 * @param {number} distance - Distance in AU
 * @returns {Object} Formatted position data
 */
export function formatPlanetPosition(longitude, latitude = 0, distance = 1) {
  // Convert longitude to sign and degree
  const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  
  const signIndex = Math.floor(longitude / 30) % 12;
  const degreeInSign = longitude % 30;
  const minutes = (degreeInSign - Math.floor(degreeInSign)) * 60;
  
  return {
    longitude: {
      decimal: longitude,
      sign: signs[signIndex],
      degree: Math.floor(degreeInSign),
      minute: Math.floor(minutes),
      second: Math.floor((minutes - Math.floor(minutes)) * 60),
      formatted: `${signs[signIndex]} ${Math.floor(degreeInSign)}°${Math.floor(minutes)}'`
    },
    latitude: latitude,
    distance: distance
  };
}

export default calculatePlanetPosition;
