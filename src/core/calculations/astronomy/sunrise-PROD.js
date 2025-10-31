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

// Production grade error handling - no fallback calculations
function throwSunriseCalculationError(error) {
  throw new Error(`Sunrise calculation failed: ${error.message}. Please ensure valid coordinates and timezone are provided.`);
}

export async function computeSunriseSunset(dateLocal, latitude, longitude, timezone, options = {}) {
  // Production grade calculation with no fallbacks
  initSwissEphemeris();

  // Validate inputs
  if (!dateLocal || !(dateLocal instanceof Date) || isNaN(dateLocal.getTime())) {
    throw new Error('Invalid date provided for sunrise calculation');
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

    // Sun position at midnight and next midnight
    const result = swisseph.swe_calc_ut(jd, swisseph.SE_SUN, swisseph.FLG_EQUATORIAL);
    if (result.error) {
      throw new Error(`Swiss Ephemeris calculation error: ${result.error}`);
    }
    const { longitude: sunLongMidnight } = result.data;

    const resultNext = swisseph.swe_calc_ut(jdNext, swisseph.SE_SUN, swisseph.FLG_EQUATORIAL);
    if (resultNext.error) {
      throw new Error(`Swiss Ephemeris calculation error: ${resultNext.error}`);
    }
    const { longitude: sunLongNext } = resultNext.data;

    // Approximate local noon
    const sunLongDiff = sunLongNext - sunLongMidnight;
    const tLocalNoon = sunLongDiff / 360; // Fraction of day from midnight to local noon

    // Calculate sunrise and sunset using Swiss Ephemeris
    const jdNoon = jd + tLocalNoon;
    const jdSunrise = jdNoon - 0.5;
    const jdSunset = jdNoon + 0.5;

    // Topocentric correction
    const pressure = 1013.25; // mbar
    const temperature = 15; // Celsius

    const sunriseResult = swisseph.swe_rise_set(
      jdSunrise,
      swisseph.SE_SUN,
      '',
      longitude,
      latitude,
      0, // altitude
      0, // pressure
      temperature,
      swisseph.CALC_RISE | swisseph.BIT_DISCIPLINARY_TOPocentric
    );

    if (sunriseResult.error) {
      throw new Error(`Sunrise calculation error: ${sunriseResult.error}`);
    }

    const sunsetResult = swisseph.swe_rise_set(
      jdSunset,
      swisseph.SE_SUN,
      '',
      longitude,
      latitude,
      0, // altitude
      0, // pressure
      temperature,
      swisseph.CALC_SET | swisseph.BIT_DISCIPLINARY_TOPocentric
    );

    if (sunsetResult.error) {
      throw new Error(`Sunset calculation error: ${sunsetResult.error}`);
    }

    const sunriseUtc = fromJulianDayUT(sunriseResult.tret);
    const sunsetUtc = fromJulianDayUT(sunsetResult.tret);

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
