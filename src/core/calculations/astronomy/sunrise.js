import { calculateJulianDay, julianDayToDate } from '../../../utils/calculations/julianDay.js';
import { calculatePlanetPosition } from '../../../utils/calculations/planetaryPositions.js';

// Optional swisseph import for serverless compatibility
let swisseph = null;
let swissephAvailable = false;

(async () => {
  try {
    const swissephModule = await import('swisseph');
    swisseph = swissephModule.default || swissephModule;
    swissephAvailable = true;
  } catch (error) {
    console.warn('⚠️  sunrise: swisseph not available:', error.message);
    swissephAvailable = false;
    swisseph = {
      swe_set_ephe_path: () => {},
      swe_julday: () => {
        throw new Error('Swiss Ephemeris not available');
      },
      swe_revjul: () => {
        throw new Error('Swiss Ephemeris not available');
      },
      swe_calc_ut: () => {
        throw new Error('Swiss Ephemeris not available');
      },
      swe_rise_trans: () => {
        throw new Error('Swiss Ephemeris not available');
      },
      SE_SUN: 0,
      SEFLG_SWIEPH: 2
    };
  }
})();

import path from 'path';
import fs from 'fs';

// Initialize Swiss Ephemeris once per process
let initialized = false;
function initSwissEphemeris() {
  if (initialized) return;
  if (!swissephAvailable) {
    throw new Error('Swiss Ephemeris not available - sunrise calculations disabled');
  }
  const ephePath = path.resolve(process.cwd(), 'ephemeris');
  if (!fs.existsSync(ephePath)) {
    throw new Error(`Ephemeris directory not found: ${ephePath}`);
  }
  swisseph.swe_set_ephe_path(ephePath);
  initialized = true;
}

function toJulianDayUT(dateUtc) {
  // Convert JS Date (UTC) to Julian Day (UT)
  const year = dateUtc.getUTCFullYear();
  const month = dateUtc.getUTCMonth() + 1;
  const day = dateUtc.getUTCDate();
  const hour = dateUtc.getUTCHours() + dateUtc.getUTCMinutes() / 60 + dateUtc.getUTCSeconds() / 3600;
  
  if (swissephAvailable && swisseph && typeof swisseph.swe_julday === 'function') {
    // Use swisseph if available (local development)
    const result = swisseph.swe_julday(year, month, day, hour, 1);
    return typeof result === 'object' && result.julianDay ? result.julianDay : result;
  } else {
    // Use pure JavaScript calculation for serverless environments
    console.log('📝 sunrise: Using pure JavaScript Julian Day calculation (swisseph unavailable)');
    return calculateJulianDay(year, month, day, hour, 1);
  }
}

function fromJulianDayUT(jd) {
  if (swissephAvailable && swisseph && typeof swisseph.swe_revjul === 'function') {
    // Use swisseph if available (local development)
    const gregflag = 1;
    const { year, month, day, hour } = swisseph.swe_revjul(jd, gregflag);
    const h = Math.floor(hour);
    const m = Math.floor((hour - h) * 60);
    const s = Math.floor(((hour - h) * 60 - m) * 60);
    return new Date(Date.UTC(year, month - 1, day, h, m, s));
  } else {
    // Use pure JavaScript conversion for serverless environments
    console.log('📝 sunrise: Using pure JavaScript Julian Day to Date conversion (swisseph unavailable)');
    return julianDayToDate(jd);
  }
}

function parseTimezoneOffsetHours(timezone) {
  // Supports "+05:30", "-08:00", "UTC", "GMT". IANA should be resolved by caller.
  if (!timezone || timezone === 'UTC' || timezone === 'GMT') return 0;
  const m = timezone.match(/^([+-])(\d{1,2}):(\d{2})$/);
  if (!m) return 0;
  const sign = m[1] === '-' ? -1 : 1;
  const hours = parseInt(m[2], 10);
  const minutes = parseInt(m[3], 10);
  return sign * (hours + minutes / 60);
}

// Note: Swiss Ephemeris in Node.js works synchronously, not with callbacks
// The issue with result.data undefined is likely due to missing ephemeris data or incorrect parameters

/**
 * Calculate sunrise and sunset using pure JavaScript (no Swiss Ephemeris)
 * Based on Meeus Astronomical Algorithms
 * @param {number} julianDay - Julian Day Number
 * @param {number} latitude - Latitude in degrees
 * @param {number} longitude - Longitude in degrees
 * @returns {Object} Object with sunriseUtc and sunsetUtc as Julian Day numbers
 */
function calculateSunriseSunsetPureJS(julianDay, latitude, longitude) {
  // Calculate Julian Day at noon
  const jdNoon = Math.floor(julianDay) + 0.5;
  const n = jdNoon - 2451545.0 + 0.0008;
  
  // Calculate approximate local solar time
  const jStar = n - longitude / 360;
  
  // Calculate mean solar noon
  const M = (357.5291 + 0.98560028 * jStar) % 360;
  const C = 1.9148 * Math.sin(degreesToRadians(M)) +
            0.02 * Math.sin(degreesToRadians(2 * M)) +
            0.0003 * Math.sin(degreesToRadians(3 * M));
  const lambda = (M + 102.9372 + C + 180) % 360;
  
  // Calculate solar transit (noon)
  const jTransit = 2451545.0 + jStar + 0.0053 * Math.sin(degreesToRadians(M)) - 
                   0.0069 * Math.sin(degreesToRadians(2 * lambda));
  
  // Calculate declination of sun
  const declination = Math.asin(Math.sin(degreesToRadians(23.44)) * 
                                Math.sin(degreesToRadians(lambda)));
  
  // Calculate hour angle
  const latRad = degreesToRadians(latitude);
  const hourAngle = Math.acos(
    (Math.sin(degreesToRadians(-0.833)) - Math.sin(latRad) * Math.sin(declination)) /
    (Math.cos(latRad) * Math.cos(declination))
  );
  
  // Calculate sunrise and sunset in Julian Days
  const sunriseJD = jTransit - (radiansToDegrees(hourAngle) / 360);
  const sunsetJD = jTransit + (radiansToDegrees(hourAngle) / 360);
  
  return {
    sunriseJD,
    sunsetJD,
    transitJD: jTransit
  };
}

function degreesToRadians(degrees) {
  return degrees * Math.PI / 180;
}

function radiansToDegrees(radians) {
  return radians * 180 / Math.PI;
}

// Production grade error handling - no fallback calculations
function throwSunriseCalculationError(error) {
  throw new Error(`Sunrise calculation failed: ${error.message}. Please ensure valid coordinates and timezone are provided.`);
}

export async function computeSunriseSunset(dateLocal, latitude, longitude, timezone, options = {}) {
  // Validate inputs
  if (!dateLocal || !(dateLocal instanceof Date) || isNaN(dateLocal.getTime())) {
    console.error(`❌ SUNRISE VALIDATION FAILED: dateLocal=${dateLocal}, typeof=${typeof dateLocal}, instanceof Date=${dateLocal instanceof Date}, getTime()=${dateLocal?.getTime()}, isNaN=${dateLocal ? isNaN(dateLocal.getTime()) : 'N/A'}, toString=${dateLocal?.toString()}, toISOString=${dateLocal?.toISOString?.()}`);
    throw new Error(`Invalid date provided for sunrise calculation. Received: ${dateLocal}, type: ${typeof dateLocal}, instanceof Date: ${dateLocal instanceof Date}, getTime(): ${dateLocal?.getTime()}, isNaN: ${dateLocal ? isNaN(dateLocal.getTime()) : 'N/A'}`);
  }
  if (typeof latitude !== 'number' || isNaN(latitude) || latitude < -90 || latitude > 90) {
    throw new Error('Invalid latitude provided. Must be between -90 and 90 degrees.');
  }
  if (typeof longitude !== 'number' || isNaN(longitude) || longitude < -180 || longitude > 180) {
    throw new Error('Invalid longitude provided. Must be between -180 and 180 degrees.');
  }
  if (!timezone) {
    throw new Error('Timezone is required for sunrise calculation');
  }

  try {
    const jd = toJulianDayUT(dateLocal);
    
    // Use Swiss Ephemeris if available, otherwise use pure JavaScript calculations
    if (swissephAvailable && swisseph) {
      initSwissEphemeris();
      
      // Calculate sunrise and sunset using Swiss Ephemeris swe_rise_trans
      const geopos = [longitude, latitude, 0]; // [longitude, latitude, altitude in meters]
      const atpress = 1013.25; // atmospheric pressure in mbar
      const attemp = 15; // atmospheric temperature in Celsius
      
      // Calculate sunrise (rsmi = 1 for rise)
      const sunriseResult = swisseph.swe_rise_trans(
        jd - 1, // Start search from previous day to ensure we find today's sunrise
        swisseph.SE_SUN || 0,
        '',
        swisseph.SEFLG_SWIEPH || 2,
        1, // rsmi = 1 for rise
        geopos,
        atpress,
        attemp
      );

      if (sunriseResult.error) {
        throw new Error(`Sunrise calculation error: ${sunriseResult.error}`);
      }
      
      if (!sunriseResult.transitTime) {
        throw new Error(`Sunrise calculation returned no transit time. Result: ${JSON.stringify(sunriseResult)}`);
      }

      // Calculate sunset (rsmi = 2 for set)
      const sunsetResult = swisseph.swe_rise_trans(
        jd, // Start search from current day
        swisseph.SE_SUN || 0,
        '',
        swisseph.SEFLG_SWIEPH || 2,
        2, // rsmi = 2 for set
        geopos,
        atpress,
        attemp
      );

      if (sunsetResult.error) {
        throw new Error(`Sunset calculation error: ${sunsetResult.error}`);
      }
      
      if (!sunsetResult.transitTime) {
        throw new Error(`Sunset calculation returned no transit time. Result: ${JSON.stringify(sunsetResult)}`);
      }

      const sunriseUtc = fromJulianDayUT(sunriseResult.transitTime);
      const sunsetUtc = fromJulianDayUT(sunsetResult.transitTime);

      // Convert to local timezone
      const tzOffsetHours = parseTimezoneOffsetHours(timezone);
      const sunriseLocal = new Date(sunriseUtc.getTime() + tzOffsetHours * 3600 * 1000);
      const sunsetLocal = new Date(sunsetUtc.getTime() + tzOffsetHours * 3600 * 1000);

      return { sunriseLocal, sunsetLocal, tzOffsetHours };
    } else {
      // Use pure JavaScript sunrise/sunset calculation for serverless environment
      console.log('📝 sunrise: Using pure JavaScript sunrise/sunset calculation (swisseph unavailable)');
      
      const sunriseSunset = calculateSunriseSunsetPureJS(jd, latitude, longitude);
      
      const sunriseUtc = julianDayToDate(sunriseSunset.sunriseJD);
      const sunsetUtc = julianDayToDate(sunriseSunset.sunsetJD);

      // Convert to local timezone
      const tzOffsetHours = parseTimezoneOffsetHours(timezone);
      const sunriseLocal = new Date(sunriseUtc.getTime() + tzOffsetHours * 3600 * 1000);
      const sunsetLocal = new Date(sunsetUtc.getTime() + tzOffsetHours * 3600 * 1000);

      return { sunriseLocal, sunsetLocal, tzOffsetHours };
    }
  } catch (error) {
    // Production grade error handling
    throwSunriseCalculationError(error);
  }
}

export function normalizeDegrees(deg) {
  let d = deg % 360;
  if (d < 0) d += 360;
  return d;
}
