import { normalizeDegrees } from '../astronomy/sunrise.js';

/**
 * @constant PALA_PER_HOUR
 * @description Current implementation uses 2.5 palas per hour constant.
 * 
 * @warning DISCREPANCY: BPHS Ch.3 Ślokas 71-74 (PDF page 45) uses "vighatikas divided by 15" method, not "palas per hour".
 * 
 * BPHS Scripture (Ch.3 Ślokas 71-74, p.45):
 * "Convert the given time into vighatikas and divide the same by 15. The resultant Rasi, degrees etc. be added to the Sun if he is in a movable sign..."
 * 
 * The PALA_PER_HOUR = 2.5 constant may be from an alternative source (Jataka Parijatha, Prasna Marga) 
 * or requires correction to match BPHS method. See GAP-003 for verification status.
 * 
 * @todo Verify PALA_PER_HOUR = 2.5 against alternative sources or update to BPHS vighatikas/15 method
 */
const PALA_PER_HOUR = 2.5; // Current implementation: 1 hour = 2.5 palas

/**
 * Calculate Praanapada longitude per BPHS
 * 
 * @see BPHS Chapter 3, Ślokas 71-74 (PDF page 45)
 * @quote "Convert the given time into vighatikas and divide the same by 15. The resultant Rasi, degrees etc. be added to the Sun if he is in a movable sign which will yield Paranapada. If the Sun is in a fixed sign, add 240 degrees additionally and if in dual sign add 120 degrees in furtherance to get Pranapada."
 * 
 * @warning Current implementation uses PALA_PER_HOUR = 2.5 constant, which differs from BPHS "vighatikas/15" method.
 * See GAP-003 for verification status. This implementation may need correction to match BPHS scripture exactly.
 * 
 * @algorithm (Current Implementation)
 * 1. Calculate time from sunrise in minutes
 * 2. Convert to palas using PALA_PER_HOUR constant (2.5 palas per hour)
 * 3. Add palas to Sun's longitude
 * 
 * @algorithm (BPHS Scripture Method)
 * 1. Convert time from sunrise into vighatikas
 * 2. Divide vighatikas by 15
 * 3. Add result to Sun's longitude (with sign-based corrections: +240° for fixed, +120° for dual)
 * 
 * @param {number} sunLongitudeDeg - Sun's longitude in degrees
 * @param {Date} birthDateLocal - Local birth date/time
 * @param {Date} sunriseLocal - Local sunrise time
 * @returns {Object} Praanapada longitude, sign, degree, and palas
 * @throws {Error} If Sun longitude or times are invalid
 */
export function computePraanapadaLongitude({
  sunLongitudeDeg,
  birthDateLocal,
  sunriseLocal
}) {
  if (typeof sunLongitudeDeg !== 'number') {
    throw new Error('Sun longitude is required for Praanapada calculation');
  }
  if (!birthDateLocal || !sunriseLocal) {
    throw new Error('Birth time and sunrise time are required for Praanapada calculation');
  }

  const minutesFromSunrise = (birthDateLocal.getTime() - sunriseLocal.getTime()) / (60 * 1000);
  const palas = (minutesFromSunrise / 60) * PALA_PER_HOUR;

  // Add palas directly in degrees as per BPHS convention (1 pala = 24 minutes = 0.4 hours => here consistent with PALA_PER_HOUR)
  const praanapadaLongitude = normalizeDegrees(sunLongitudeDeg + palas);
  const degreeInSign = praanapadaLongitude % 30;

  const signs = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];
  const signIndex = Math.floor(praanapadaLongitude / 30) % 12;

  return {
    longitude: praanapadaLongitude,
    sign: signs[signIndex],
    degree: degreeInSign,
    palas
  };
}


