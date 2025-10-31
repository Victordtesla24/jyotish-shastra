import swisseph from 'swisseph';
import path from 'path';
import fs from 'fs';

// Initialize Swiss Ephemeris once per process
let initialized = false;
function initSwissEphemeris() {
  if (initialized) return;
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
  const gregflag = 1; // Gregorian calendar
  const jd = swisseph.swe_julday(year, month, day, hour, gregflag);
  return jd;
}

function fromJulianDayUT(jd) {
  const gregflag = 1;
  const { year, month, day, hour } = swisseph.swe_revjul(jd, gregflag);
  const h = Math.floor(hour);
  const m = Math.floor((hour - h) * 60);
  const s = Math.floor(((hour - h) * 60 - m) * 60);
  return new Date(Date.UTC(year, month - 1, day, h, m, s));
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

// Production grade error handling - no fallback calculations
function throwSunriseCalculationError(error) {
  throw new Error(`Sunrise calculation failed: ${error.message}. Please ensure valid coordinates and timezone are provided.`);
}

export async function computeSunriseSunset(dateLocal, latitude, longitude, timezone, options = {}) {
  // Production grade calculation with no fallbacks
  initSwissEphemeris();

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
    const jdNext = jd + 1;

    // Sun position at midnight and next midnight - Swiss Ephemeris works synchronously in Node.js
    // Use SEFLG_SWIEPH for ecliptic coordinates (longitude, latitude, distance)
    const result = swisseph.swe_calc_ut(jd, swisseph.SE_SUN, swisseph.SEFLG_SWIEPH);
    if (result.error) {
      throw new Error(`Swiss Ephemeris calculation error: ${result.error}`);
    }
    if (result.longitude === undefined) {
      throw new Error(`Swiss Ephemeris returned no data for sun position calculation at Julian Day ${jd}. Please ensure valid coordinates and timezone are provided.`);
    }
    const sunLongMidnight = result.longitude; // Ecliptic longitude

    const resultNext = swisseph.swe_calc_ut(jdNext, swisseph.SE_SUN, swisseph.SEFLG_SWIEPH);
    if (resultNext.error) {
      throw new Error(`Swiss Ephemeris calculation error: ${resultNext.error}`);
    }
    if (resultNext.longitude === undefined) {
      throw new Error(`Swiss Ephemeris returned no data for sun position calculation at Julian Day ${jdNext}. Please ensure valid coordinates and timezone are provided.`);
    }
    const sunLongNext = resultNext.longitude; // Ecliptic longitude

    // Calculate sunrise and sunset using Swiss Ephemeris swe_rise_trans
    // Parameters: jd_start, ipl, starname, epheflag, rsmi, geopos[3], atpress, attemp
    const geopos = [longitude, latitude, 0]; // [longitude, latitude, altitude in meters]
    const atpress = 1013.25; // atmospheric pressure in mbar
    const attemp = 15; // atmospheric temperature in Celsius
    
    // Calculate sunrise (rsmi = 1 for rise)
    const sunriseResult = swisseph.swe_rise_trans(
      jd - 1, // Start search from previous day to ensure we find today's sunrise
      swisseph.SE_SUN,
      '',
      swisseph.SEFLG_SWIEPH,
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
      swisseph.SE_SUN,
      '',
      swisseph.SEFLG_SWIEPH,
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
  } catch (error) {
    // Production grade error handling - no fallbacks
    throwSunriseCalculationError(error);
  }
}

export function normalizeDegrees(deg) {
  let d = deg % 360;
  if (d < 0) d += 360;
  return d;
}
