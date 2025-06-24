/**
 * Astrology Helper Functions
 * Core utility functions for Vedic astrological calculations
 */

/**
 * Convert longitude degrees to zodiac sign information
 * @param {number} longitude - Longitude in degrees (0-360)
 * @returns {Object} Sign information
 */
function getSign(longitude) {
  // Normalize longitude to 0-360 range
  const normalizedLongitude = ((longitude % 360) + 360) % 360;

  // Each sign is 30 degrees
  const signIndex = Math.floor(normalizedLongitude / 30);
  const degreeInSign = normalizedLongitude % 30;

  return {
    signIndex: signIndex,
    degreeInSign: degreeInSign,
    longitude: normalizedLongitude
  };
}

/**
 * Get zodiac sign name from sign index
 * @param {number} signIndex - Sign index (0-11)
 * @returns {string} Sign name
 */
function getSignName(signIndex) {
  const signs = [
    'Aries', 'Taurus', 'Gemini', 'Cancer',
    'Leo', 'Virgo', 'Libra', 'Scorpio',
    'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];

  return signs[signIndex % 12];
}

/**
 * Get zodiac sign ID from sign index (1-12 instead of 0-11)
 * @param {number} signIndex - Sign index (0-11)
 * @returns {number} Sign ID (1-12)
 */
function getSignId(signIndex) {
  return (signIndex % 12) + 1;
}

/**
 * Convert degrees to hours, minutes, seconds format
 * @param {number} degrees - Degrees
 * @returns {Object} Time format
 */
function degreesToTime(degrees) {
  const totalMinutes = degrees * 4; // 1 degree = 4 minutes
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.floor(totalMinutes % 60);
  const seconds = Math.floor((totalMinutes % 1) * 60);

  return { hours, minutes, seconds };
}

/**
 * Convert time to degrees
 * @param {number} hours - Hours
 * @param {number} minutes - Minutes
 * @param {number} seconds - Seconds
 * @returns {number} Degrees
 */
function timeToDegrees(hours, minutes = 0, seconds = 0) {
  return (hours + minutes / 60 + seconds / 3600) * 15;
}

/**
 * Calculate distance between two longitudinal positions
 * @param {number} long1 - First longitude
 * @param {number} long2 - Second longitude
 * @returns {number} Distance in degrees
 */
function calculateDistance(long1, long2) {
  let distance = Math.abs(long1 - long2);
  if (distance > 180) {
    distance = 360 - distance;
  }
  return distance;
}

/**
 * Normalize degree to 0-360 range
 * @param {number} degree - Degree value
 * @returns {number} Normalized degree
 */
function normalizeDegree(degree) {
  return ((degree % 360) + 360) % 360;
}

/**
 * Check if a planet is retrograde based on speed
 * @param {number} speed - Planet's speed
 * @returns {boolean} True if retrograde
 */
function isRetrograde(speed) {
  return speed < 0;
}

/**
 * Calculate planetary dignity
 * @param {string} planet - Planet name
 * @param {number} signId - Sign ID (1-12)
 * @returns {string} Dignity status
 */
function calculatePlanetaryDignity(planet, signId) {
  const dignities = {
    sun: { exaltation: 1, debilitation: 7, own: [5] },
    moon: { exaltation: 2, debilitation: 8, own: [4] },
    mars: { exaltation: 10, debilitation: 4, own: [1, 8] },
    mercury: { exaltation: 6, debilitation: 12, own: [3, 6] },
    jupiter: { exaltation: 4, debilitation: 10, own: [9, 12] },
    venus: { exaltation: 12, debilitation: 6, own: [2, 7] },
    saturn: { exaltation: 7, debilitation: 1, own: [10, 11] },
    rahu: { exaltation: 3, debilitation: 9, own: [] },
    ketu: { exaltation: 9, debilitation: 3, own: [] }
  };

  const planetDignity = dignities[planet.toLowerCase()];
  if (!planetDignity) return 'neutral';

  if (signId === planetDignity.exaltation) return 'exalted';
  if (signId === planetDignity.debilitation) return 'debilitated';
  if (planetDignity.own.includes(signId)) return 'own';

  return 'neutral';
}

/**
 * Calculate house number from ascendant
 * @param {number} planetLongitude - Planet longitude
 * @param {number} ascendantLongitude - Ascendant longitude
 * @returns {number} House number (1-12)
 */
function calculateHouseNumber(planetLongitude, ascendantLongitude) {
  const difference = normalizeDegree(planetLongitude - ascendantLongitude);
  return Math.floor(difference / 30) + 1;
}

/**
 * Get nakshatra information from longitude
 * @param {number} longitude - Longitude in degrees
 * @returns {Object} Nakshatra information
 */
function getNakshatra(longitude) {
  const nakshatras = [
    'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
    'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
    'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
    'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
    'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
  ];

  // Each nakshatra is 13.333... degrees (360/27)
  const nakshatraSize = 360 / 27;
  const normalizedLong = normalizeDegree(longitude);
  const nakshatraIndex = Math.floor(normalizedLong / nakshatraSize);
  const degreeInNakshatra = normalizedLong % nakshatraSize;

  // Each nakshatra has 4 padas (quarters)
  const pada = Math.floor(degreeInNakshatra / (nakshatraSize / 4)) + 1;

  return {
    name: nakshatras[nakshatraIndex],
    index: nakshatraIndex + 1,
    pada: pada,
    degree: degreeInNakshatra,
    lord: getNakshatraLord(nakshatras[nakshatraIndex])
  };
}

/**
 * Get nakshatra lord
 * @param {string} nakshatraName - Nakshatra name
 * @returns {string} Nakshatra lord
 */
function getNakshatraLord(nakshatraName) {
  const lords = {
    'Ashwini': 'ketu', 'Bharani': 'venus', 'Krittika': 'sun',
    'Rohini': 'moon', 'Mrigashira': 'mars', 'Ardra': 'rahu',
    'Punarvasu': 'jupiter', 'Pushya': 'saturn', 'Ashlesha': 'mercury',
    'Magha': 'ketu', 'Purva Phalguni': 'venus', 'Uttara Phalguni': 'sun',
    'Hasta': 'moon', 'Chitra': 'mars', 'Swati': 'rahu',
    'Vishakha': 'jupiter', 'Anuradha': 'saturn', 'Jyeshtha': 'mercury',
    'Mula': 'ketu', 'Purva Ashadha': 'venus', 'Uttara Ashadha': 'sun',
    'Shravana': 'moon', 'Dhanishta': 'mars', 'Shatabhisha': 'rahu',
    'Purva Bhadrapada': 'jupiter', 'Uttara Bhadrapada': 'saturn', 'Revati': 'mercury'
  };

  return lords[nakshatraName] || 'unknown';
}

/**
 * Calculate Navamsa position
 * @param {number} longitude - Planet longitude
 * @returns {Object} Navamsa position
 */
function calculateNavamsa(longitude) {
  const sign = getSign(longitude);
  const signIndex = sign.signIndex;
  const degreeInSign = sign.degreeInSign;

  // Each navamsa is 3.333... degrees (30/9)
  const navamsaIndex = Math.floor(degreeInSign / (30 / 9));

  // Calculate navamsa sign based on sign modality
  let navamsaSign;
  if ([0, 3, 6, 9].includes(signIndex)) { // Movable signs
    navamsaSign = (signIndex + navamsaIndex) % 12;
  } else if ([1, 4, 7, 10].includes(signIndex)) { // Fixed signs
    navamsaSign = (signIndex + 8 + navamsaIndex) % 12;
  } else { // Dual signs
    navamsaSign = (signIndex + 4 + navamsaIndex) % 12;
  }

  return {
    sign: getSignName(navamsaSign),
    signIndex: navamsaSign,
    navamsaIndex: navamsaIndex + 1,
    longitude: navamsaSign * 30 + (navamsaIndex * (30 / 9))
  };
}

/**
 * Check if two planets are in conjunction
 * @param {number} long1 - First planet longitude
 * @param {number} long2 - Second planet longitude
 * @param {number} orb - Orb in degrees (default 8)
 * @returns {boolean} True if in conjunction
 */
function isConjunction(long1, long2, orb = 8) {
  return calculateDistance(long1, long2) <= orb;
}

/**
 * Check if two planets are in opposition
 * @param {number} long1 - First planet longitude
 * @param {number} long2 - Second planet longitude
 * @param {number} orb - Orb in degrees (default 8)
 * @returns {boolean} True if in opposition
 */
function isOpposition(long1, long2, orb = 8) {
  const distance = calculateDistance(long1, long2);
  return Math.abs(distance - 180) <= orb;
}

/**
 * Check if two planets are in trine
 * @param {number} long1 - First planet longitude
 * @param {number} long2 - Second planet longitude
 * @param {number} orb - Orb in degrees (default 8)
 * @returns {boolean} True if in trine
 */
function isTrine(long1, long2, orb = 8) {
  const distance = calculateDistance(long1, long2);
  return Math.abs(distance - 120) <= orb;
}

/**
 * Check if two planets are in square
 * @param {number} long1 - First planet longitude
 * @param {number} long2 - Second planet longitude
 * @param {number} orb - Orb in degrees (default 8)
 * @returns {boolean} True if in square
 */
function isSquare(long1, long2, orb = 8) {
  const distance = calculateDistance(long1, long2);
  return Math.abs(distance - 90) <= orb;
}

/**
 * Get planet's natural friends and enemies
 * @param {string} planet - Planet name
 * @returns {Object} Friends and enemies
 */
function getPlanetaryRelationships(planet) {
  const relationships = {
    sun: { friends: ['moon', 'mars', 'jupiter'], enemies: ['venus', 'saturn'], neutrals: ['mercury'] },
    moon: { friends: ['sun', 'mercury'], enemies: [], neutrals: ['mars', 'jupiter', 'venus', 'saturn'] },
    mars: { friends: ['sun', 'moon', 'jupiter'], enemies: ['mercury'], neutrals: ['venus', 'saturn'] },
    mercury: { friends: ['sun', 'venus'], enemies: ['moon'], neutrals: ['mars', 'jupiter', 'saturn'] },
    jupiter: { friends: ['sun', 'moon', 'mars'], enemies: ['mercury', 'venus'], neutrals: ['saturn'] },
    venus: { friends: ['mercury', 'saturn'], enemies: ['sun', 'moon'], neutrals: ['mars', 'jupiter'] },
    saturn: { friends: ['mercury', 'venus'], enemies: ['sun', 'moon', 'mars'], neutrals: ['jupiter'] }
  };

  return relationships[planet.toLowerCase()] || { friends: [], enemies: [], neutrals: [] };
}

/**
 * Get the ruling planet of a zodiac sign
 * @param {string} signName - Sign name
 * @returns {string} Ruling planet name
 */
function getSignLord(signName) {
  const rulers = {
    'ARIES': 'Mars',
    'TAURUS': 'Venus',
    'GEMINI': 'Mercury',
    'CANCER': 'Moon',
    'LEO': 'Sun',
    'VIRGO': 'Mercury',
    'LIBRA': 'Venus',
    'SCORPIO': 'Mars',
    'SAGITTARIUS': 'Jupiter',
    'CAPRICORN': 'Saturn',
    'AQUARIUS': 'Saturn',
    'PISCES': 'Jupiter',
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

  return rulers[signName] || 'Unknown';
}

/**
 * Get house number from longitude relative to ascendant
 * @param {number} planetLongitude - Planet longitude
 * @param {number} ascendantLongitude - Ascendant longitude
 * @returns {number} House number (1-12)
 */
function getHouseFromLongitude(planetLongitude, ascendantLongitude) {
  return calculateHouseNumber(planetLongitude, ascendantLongitude);
}

/**
 * Get sign index from longitude
 * @param {number} longitude - Longitude in degrees
 * @returns {number} Sign index (0-11)
 */
function getSignIndex(longitude) {
  return getSign(longitude).signIndex;
}

/**
 * Calculate angular distance between two longitudes
 * @param {number} long1 - First longitude
 * @param {number} long2 - Second longitude
 * @returns {number} Angular distance in degrees
 */
function calculateAngularDistance(long1, long2) {
  return calculateDistance(long1, long2);
}

module.exports = {
  getSign,
  getSignName,
  getSignId,
  getSignIndex,
  degreesToTime,
  timeToDegrees,
  calculateDistance,
  calculateAngularDistance,
  normalizeDegree,
  isRetrograde,
  calculatePlanetaryDignity,
  calculateHouseNumber,
  getNakshatra,
  getNakshatraLord,
  calculateNavamsa,
  isConjunction,
  isOpposition,
  isTrine,
  isSquare,
  getPlanetaryRelationships,
  getSignLord,
  getHouseFromLongitude
};
