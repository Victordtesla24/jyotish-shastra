/**
 * Vedic Astrology Helper Functions
 * Utility functions for Vedic astrology calculations and formatting
 */

// Vedic symbols mapping
const VEDIC_SYMBOLS = {
  // Planets
  'Sun': '☉',
  'Moon': '☽',
  'Mars': '♂',
  'Mercury': '☿',
  'Jupiter': '♃',
  'Venus': '♀',
  'Saturn': '♄',
  'Rahu': '☊',
  'Ketu': '☋',
  'Ascendant': 'Asc',

  // Zodiac signs
  'Aries': '♈',
  'Taurus': '♉',
  'Gemini': '♊',
  'Cancer': '♋',
  'Leo': '♌',
  'Virgo': '♍',
  'Libra': '♎',
  'Scorpio': '♏',
  'Sagittarius': '♐',
  'Capricorn': '♑',
  'Aquarius': '♒',
  'Pisces': '♓'
};

// Planet abbreviations for chart display
const PLANET_ABBREVIATIONS = {
  'Sun': 'Su',
  'Moon': 'Mo',
  'Mars': 'Ma',
  'Mercury': 'Me',
  'Jupiter': 'Ju',
  'Venus': 'Ve',
  'Saturn': 'Sa',
  'Rahu': 'Ra',
  'Ketu': 'Ke'
};

/**
 * Get Vedic symbol for planet or sign
 * @param {string} name - Planet or sign name
 * @returns {string} Vedic symbol
 */
export function getVedicSymbol(name) {
  return VEDIC_SYMBOLS[name] || name;
}

/**
 * Get planet abbreviation for chart display
 * @param {string} planetName - Full planet name
 * @returns {string} Planet abbreviation
 */
export function getPlanetAbbreviation(planetName) {
  return PLANET_ABBREVIATIONS[planetName] || planetName.substring(0, 2);
}

/**
 * Format degree value for display
 * @param {number} degree - Degree value
 * @returns {string} Formatted degree string
 */
export function formatDegree(degree) {
  if (degree === null || degree === undefined) return '';

  const wholeDegree = Math.floor(degree);
  const minutes = Math.floor((degree - wholeDegree) * 60);

  return `${wholeDegree}°${minutes.toString().padStart(2, '0')}'`;
}

/**
 * Convert sign ID to sign name
 * @param {number} signId - Sign ID (1-12)
 * @returns {string} Sign name
 */
export function getSignName(signId) {
  const signs = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];

  return signs[signId - 1] || '';
}

/**
 * Get house number from longitude
 * @param {number} longitude - Planet longitude
 * @param {number} ascendantLongitude - Ascendant longitude
 * @returns {number} House number (1-12)
 */
export function getHouseFromLongitude(longitude, ascendantLongitude) {
  let houseLongitude = longitude - ascendantLongitude;
  if (houseLongitude < 0) houseLongitude += 360;

  return Math.floor(houseLongitude / 30) + 1;
}

/**
 * Get dignity status display
 * @param {string} dignity - Dignity status
 * @returns {string} Formatted dignity
 */
export function formatDignity(dignity) {
  const dignityMap = {
    'exalted': '↑',
    'debilitated': '↓',
    'own': '●',
    'friendly': '+',
    'enemy': '-',
    'neutral': ''
  };

  return dignityMap[dignity] || '';
}

/**
 * Check if planet is benefic
 * @param {string} planet - Planet name
 * @returns {boolean} Is benefic
 */
export function isBenefic(planet) {
  const benefics = ['Jupiter', 'Venus', 'Mercury', 'Moon'];
  return benefics.includes(planet);
}

/**
 * Check if planet is malefic
 * @param {string} planet - Planet name
 * @returns {boolean} Is malefic
 */
export function isMalefic(planet) {
  const malefics = ['Saturn', 'Mars', 'Sun', 'Rahu', 'Ketu'];
  return malefics.includes(planet);
}

/**
 * Get planet nature based on various factors
 * @param {string} planet - Planet name
 * @param {string} sign - Sign placement
 * @param {string} lagnaSign - Lagna sign
 * @returns {string} Nature (benefic/malefic/neutral)
 */
export function getPlanetNature(planet, sign, lagnaSign) {
  // Simplified logic - would need full implementation based on Vedic rules
  if (isBenefic(planet)) return 'benefic';
  if (isMalefic(planet)) return 'malefic';
  return 'neutral';
}

/**
 * Format nakshatra and pada
 * @param {string} nakshatra - Nakshatra name
 * @param {number} pada - Pada number
 * @returns {string} Formatted string
 */
export function formatNakshatra(nakshatra, pada) {
  if (!nakshatra) return '';
  return pada ? `${nakshatra}-${pada}` : nakshatra;
}

const vedicHelpers = {
  getVedicSymbol,
  getPlanetAbbreviation,
  formatDegree,
  getSignName,
  getHouseFromLongitude,
  formatDignity,
  isBenefic,
  isMalefic,
  getPlanetNature,
  formatNakshatra
};

export default vedicHelpers;
