/**
 * Nisheka-Lagna (Conception Time) Calculation per BPHS
 * 
 * @see BPHS Chapter 4, Ślokas 25-30 (PDF pages 53-54)
 * @quote "Adhana lagna: Date of birth and time minus 'x' where 'X' = A+B+C. A = angular distance between Saturn and Gulika at birth. B = distance between ascendant and 9th house cusp counted in direct order (via 4th and 7th cusps). C = Moon's degrees if ascendant lord in invisible half, otherwise C = 0."
 * 
 * @note Additional Notes (PDF page 54):
 * "It will be noticed that 1 degree is treated as one day in the above computation. That is, these are Savanamana (360 days per year). To apply this to Gregorian Calendar, we must reduce this duration into Sauramana."
 * 
 * @algorithm
 * 1. Calculate A = angular distance (Saturn - Gulika)
 * 2. Calculate B = angular distance (Ascendant - 9th house cusp via 4th,7th cusps)
 * 3. Calculate C = Moon's degrees if ascendant lord in invisible half (else 0)
 * 4. X = A + B + C (in degrees = Savanamana days)
 * 5. Convert Savanamana → Sauramana (Gregorian)
 * 6. Nisheka DateTime = Birth DateTime - X_days_gregorian
 * 7. Calculate ascendant at Nisheka time
 */

import { normalizeDegrees } from '../astronomy/sunrise.js';
import AscendantCalculator from '../chart-casting/AscendantCalculator.js';
import { computeGulikaLongitude } from './gulika.js';

/**
 * Calculate angular distance between two longitudes
 * 
 * @param {number} long1 - First longitude in degrees
 * @param {number} long2 - Second longitude in degrees
 * @param {boolean} directOrder - If true, count via 4th and 7th cusps (direct order)
 * @returns {number} Angular distance in degrees
 */
function angularDistance(long1, long2, directOrder = false) {
  if (typeof long1 !== 'number' || typeof long2 !== 'number' || isNaN(long1) || isNaN(long2)) {
    throw new Error('Both longitudes must be valid numbers');
  }

  if (directOrder) {
    // BPHS Ch.4 Ślokas 25-30: Count via 4th and 7th cusps (direct order)
    // Direct order: count forward from long1 to long2
    const distance = (normalizeDegrees(long2) - normalizeDegrees(long1) + 360) % 360;
    return distance;
  } else {
    // Shortest angular distance
    const normalizedLong1 = normalizeDegrees(long1);
    const normalizedLong2 = normalizeDegrees(long2);
    let distance = Math.abs(normalizedLong2 - normalizedLong1);
    if (distance > 180) {
      distance = 360 - distance;
    }
    return distance;
  }
}

/**
 * Check if planet is in invisible half (houses 1-6)
 * 
 * Invisible half: between Ascendant and Descendant via Nadir
 * i.e., Houses 1-6 (below horizon)
 * 
 * @param {string} planetName - Planet name (e.g., 'Sun', 'Moon', 'Mercury')
 * @param {Object} chart - Birth chart data
 * @returns {boolean} True if planet is in invisible half (houses 1-6)
 */
function isInInvisibleHalf(planetName, chart) {
  if (!planetName || typeof planetName !== 'string') {
    return false;
  }

  if (!chart || !chart.planetaryPositions) {
    return false;
  }

  const planet = chart.planetaryPositions[planetName.toLowerCase()] || 
                  chart.planetaryPositions[planetName];
  
  if (!planet || typeof planet.house !== 'number') {
    return false;
  }

  // Invisible half: houses 1-6 (below horizon)
  return planet.house >= 1 && planet.house <= 6;
}

/**
 * Convert Savanamana days to Sauramana (Gregorian) days
 * 
 * Savanamana: 360 days/year
 * Sauramana: 365.25 days/year (Gregorian)
 * Conversion factor: 365.25 / 360 = 1.014583...
 * 
 * @note Full BPHS implementation requires lookup tables for precise conversion
 * This is an approximate conversion using the ratio
 * 
 * @param {number} daysSavanamana - Days in Savanamana calendar
 * @returns {number} Days in Sauramana (Gregorian) calendar
 */
function convertSavanamanaToSauramana(daysSavanamana) {
  if (typeof daysSavanamana !== 'number' || isNaN(daysSavanamana) || daysSavanamana < 0) {
    throw new Error('Savanamana days must be a valid non-negative number');
  }

  // Conversion factor: 365.25 / 360 = 1.014583...
  const conversionFactor = 365.25 / 360;
  const daysSauramana = daysSavanamana * conversionFactor;
  
  // Round to nearest day
  return Math.round(daysSauramana);
}

/**
 * Get sign lord (ruler) from sign name
 * 
 * Sign lordship according to Vedic astrology:
 * Aries→Mars, Taurus→Venus, Gemini→Mercury, Cancer→Moon,
 * Leo→Sun, Virgo→Mercury, Libra→Venus, Scorpio→Mars,
 * Sagittarius→Jupiter, Capricorn→Saturn, Aquarius→Saturn, Pisces→Jupiter
 * 
 * @param {string} sign - Sign name (e.g., 'Aries', 'Taurus')
 * @returns {string} Lord planet name (e.g., 'Mars', 'Venus')
 */
function getSignLord(sign) {
  const signLords = {
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
  
  return signLords[sign] || null;
}

/**
 * Calculate Nisheka-Lagna (Conception Time) per BPHS Ch.4 Ślokas 25-30
 * 
 * @param {Object} birthChart - Birth chart data with planetary positions and houses
 * @param {Object} birthData - Birth data with date, time, coordinates, timezone
 * @returns {Promise<Object>} Nisheka calculation results
 * @throws {Error} If required chart data or birth data is missing
 */
export async function calculateNishekaLagna(birthChart, birthData) {
  if (!birthChart || !birthChart.rasiChart) {
    throw new Error('Birth chart with rasiChart is required for Nisheka calculation');
  }

  if (!birthData || !birthData.dateOfBirth || !birthData.timeOfBirth) {
    throw new Error('Birth data with dateOfBirth and timeOfBirth is required');
  }

  const chart = birthChart.rasiChart;

  // Step 1: Get required positions
  const saturn = chart.planetaryPositions?.saturn || chart.planetaryPositions?.Saturn;
  if (!saturn || typeof saturn.longitude !== 'number') {
    throw new Error('Saturn longitude is required for Nisheka calculation');
  }

  const moon = chart.planetaryPositions?.moon || chart.planetaryPositions?.Moon;
  if (!moon || typeof moon.longitude !== 'number') {
    throw new Error('Moon longitude is required for Nisheka calculation');
  }

  const ascendant = chart.ascendant;
  if (!ascendant || typeof ascendant.longitude !== 'number') {
    throw new Error('Ascendant longitude is required for Nisheka calculation');
  }

  // Get house positions - handle both array and object formats
  let housePositions = chart.housePositions || chart.houses;
  if (!housePositions) {
    throw new Error('House positions are required for Nisheka calculation');
  }

  // Convert to array if it's an object
  if (!Array.isArray(housePositions)) {
    const houseArray = [];
    for (let i = 1; i <= 12; i++) {
      const house = housePositions[`house${i}`] || housePositions[i.toString()] || housePositions[i - 1];
      if (house) {
        houseArray[i - 1] = house;
      }
    }
    housePositions = houseArray;
  }

  // Get 1st and 9th house cusps
  const house1 = housePositions[0] || housePositions.find(h => h.houseNumber === 1 || h.number === 1);
  const house9 = housePositions[8] || housePositions.find(h => h.houseNumber === 9 || h.number === 9);

  if (!house1 || !house9) {
    throw new Error('House 1 and House 9 cusps are required for Nisheka calculation');
  }

  // Get cusp longitudes - handle different formats
  const ascendantCusp = house1.cusp?.degree !== undefined ? 
    (house1.cusp.degree + (house1.cusp.minutes || 0) / 60 + (house1.cusp.seconds || 0) / 3600) :
    (house1.degree || house1.cusp || house1.bhavaMadhya || ascendant.longitude);
  
  const ninthCusp = house9.cusp?.degree !== undefined ?
    (house9.cusp.degree + (house9.cusp.minutes || 0) / 60 + (house9.cusp.seconds || 0) / 3600) :
    (house9.degree || house9.cusp || house9.bhavaMadhya);

  if (typeof ascendantCusp !== 'number' || isNaN(ascendantCusp)) {
    throw new Error('Valid ascendant cusp longitude is required');
  }
  if (typeof ninthCusp !== 'number' || isNaN(ninthCusp)) {
    throw new Error('Valid 9th house cusp longitude is required');
  }

  // Get ascendant lord - calculate from sign if not already populated
  let ascendantLord = ascendant.lord || house1.lord;
  
  if (!ascendantLord) {
    // Calculate from ascendant sign
    const ascendantSign = ascendant.sign || ascendant.signName;
    if (ascendantSign) {
      ascendantLord = getSignLord(ascendantSign);
    }
  }
  
  if (!ascendantLord) {
    throw new Error('Ascendant lord is required for Nisheka calculation. Unable to determine from ascendant sign.');
  }

  // Calculate Gulika position if not already provided
  let gulikaLongitude;
  if (chart.gulika && typeof chart.gulika.longitude === 'number') {
    gulikaLongitude = chart.gulika.longitude;
  } else {
    // Calculate Gulika using computeGulikaLongitude
    const birthDateLocal = new Date(`${birthData.dateOfBirth}T${birthData.timeOfBirth}`);
    const latitude = birthData.latitude || birthData.placeOfBirth?.latitude;
    const longitude = birthData.longitude || birthData.placeOfBirth?.longitude;
    const timezone = birthData.timezone || birthData.placeOfBirth?.timezone;

    if (!latitude || !longitude || !timezone) {
      throw new Error('Latitude, longitude, and timezone are required for Gulika calculation');
    }

    const gulikaResult = await computeGulikaLongitude({
      birthDateLocal,
      latitude,
      longitude,
      timezone
    });
    gulikaLongitude = gulikaResult.longitude;
  }

  // Step 2: Calculate A (Saturn-Gulika angular distance)
  const A = angularDistance(saturn.longitude, gulikaLongitude);

  // Step 3: Calculate B (Ascendant to 9th house distance via 4th,7th cusps - direct order)
  const B = angularDistance(ascendantCusp, ninthCusp, true);

  // Step 4: Calculate C (conditional on ascendant lord visibility)
  let C = 0;
  if (isInInvisibleHalf(ascendantLord, chart)) {
    // Moon's degrees in Rasi (0-30)
    C = moon.longitude % 30;
  }

  // Step 5: Sum components (in degrees = Savanamana days)
  const X_degrees = A + B + C;
  const X_days_savanamana = X_degrees; // 1 degree = 1 Savanamana day

  // Step 6: Convert Savanamana to Sauramana (Gregorian)
  const X_days_gregorian = convertSavanamanaToSauramana(X_days_savanamana);

  // Step 7: Subtract from birth time
  const birthDateTime = new Date(`${birthData.dateOfBirth}T${birthData.timeOfBirth}`);
  if (isNaN(birthDateTime.getTime())) {
    throw new Error(`Invalid birth date/time: ${birthData.dateOfBirth}T${birthData.timeOfBirth}`);
  }

  const nishekaDateTime = new Date(birthDateTime.getTime() - X_days_gregorian * 86400000);

  // Step 8: Calculate ascendant at Nisheka time
  const latitude = birthData.latitude || birthData.placeOfBirth?.latitude;
  const longitude = birthData.longitude || birthData.placeOfBirth?.longitude;

  if (!latitude || !longitude) {
    throw new Error('Latitude and longitude are required for Nisheka ascendant calculation');
  }

  const ascCalc = new AscendantCalculator('LAHIRI');
  await ascCalc.initialize();

  const nishekaYear = nishekaDateTime.getFullYear();
  const nishekaMonth = nishekaDateTime.getMonth() + 1;
  const nishekaDay = nishekaDateTime.getDate();
  const nishekaHours = nishekaDateTime.getHours();
  const nishekaMinutes = nishekaDateTime.getMinutes();

  const nishekaAscResult = await ascCalc.calculateAscendantAndHouses(
    nishekaYear,
    nishekaMonth,
    nishekaDay,
    nishekaHours,
    nishekaMinutes,
    latitude,
    longitude
  );

  const nishekaLagna = {
    longitude: normalizeDegrees(nishekaAscResult.ascendant.longitude),
    sign: nishekaAscResult.ascendant.signName,
    degree: nishekaAscResult.ascendant.longitude % 30
  };

  return {
    nishekaDateTime: nishekaDateTime,
    nishekaLagna: nishekaLagna,
    daysBeforeBirth: X_days_gregorian,
    components: {
      A: A,
      B: B,
      C: C,
      X_degrees: X_degrees,
      X_days_savanamana: X_days_savanamana,
      X_days_gregorian: X_days_gregorian
    },
    saturnLongitude: saturn.longitude,
    gulikaLongitude: gulikaLongitude,
    ascendantCusp: ascendantCusp,
    ninthCusp: ninthCusp,
    ascendantLord: ascendantLord,
    moonRasiDegrees: moon.longitude % 30
  };
}

/**
 * Calculate angular distance between two longitudes (exported helper)
 * @param {number} long1 - First longitude in degrees
 * @param {number} long2 - Second longitude in degrees
 * @param {boolean} directOrder - If true, count via 4th and 7th cusps (direct order)
 * @returns {number} Angular distance in degrees
 */
export { angularDistance };

/**
 * Check if planet is in invisible half (exported helper)
 * @param {string} planetName - Planet name
 * @param {Object} chart - Birth chart data
 * @returns {boolean} True if planet is in invisible half (houses 1-6)
 */
export { isInInvisibleHalf };

/**
 * Convert Savanamana days to Sauramana (Gregorian) days (exported helper)
 * @param {number} daysSavanamana - Days in Savanamana calendar
 * @returns {number} Days in Sauramana (Gregorian) calendar
 */
export { convertSavanamanaToSauramana };

/**
 * Get sign lord from sign name (exported helper)
 * @param {string} sign - Sign name
 * @returns {string} Lord planet name
 */
export { getSignLord };
