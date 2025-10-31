import { computeSunriseSunset, normalizeDegrees } from '../astronomy/sunrise.js';
import { calculateJulianDay } from '../../../utils/calculations/julianDay.js';

// Optional swisseph import for serverless compatibility
let swisseph = null;
let swissephAvailable = false;

(async () => {
  try {
    const swissephModule = await import('swisseph');
    swisseph = swissephModule.default || swissephModule;
    swissephAvailable = true;
  } catch (error) {
    console.warn('⚠️  gulika: swisseph not available:', error.message);
    swissephAvailable = false;
    swisseph = {
      swe_julday: () => {
        throw new Error('Swiss Ephemeris not available');
      },
      SE_GREG_CAL: 1
    };
  }
})();

import AscendantCalculator from '../chart-casting/AscendantCalculator.js';

const DAY_GULIKA_SEGMENT_INDEX = {
  0: 5, // Sunday
  1: 4, // Monday
  2: 3, // Tuesday
  3: 2, // Wednesday
  4: 1, // Thursday
  5: 0, // Friday
  6: 6  // Saturday
};

const NIGHT_GULIKA_SEGMENT_INDEX = {
  0: 4, // Sunday night
  1: 5, // Monday night
  2: 6, // Tuesday night
  3: 0, // Wednesday night
  4: 1, // Thursday night
  5: 2, // Friday night
  6: 3  // Saturday night
};

function toJulianDayUT(dateUtc) {
  const y = dateUtc.getUTCFullYear();
  const m = dateUtc.getUTCMonth() + 1;
  const d = dateUtc.getUTCDate();
  const hour = dateUtc.getUTCHours() + dateUtc.getUTCMinutes() / 60 + dateUtc.getUTCSeconds() / 3600;
  const gregflag = swisseph?.SE_GREG_CAL || 1;
  
  if (swissephAvailable && swisseph && typeof swisseph.swe_julday === 'function') {
    // Use swisseph if available (local development)
    const result = swisseph.swe_julday(y, m, d, hour, gregflag);
    return typeof result === 'object' && result.julianDay ? result.julianDay : result;
  } else {
    // Use pure JavaScript calculation for serverless environments
    console.log('📝 gulika: Using pure JavaScript Julian Day calculation (swisseph unavailable)');
    return calculateJulianDay(y, m, d, hour, gregflag);
  }
}

export async function computeGulikaLongitude({
  birthDateLocal,
  latitude,
  longitude,
  timezone,
  sunriseOptions
}) {
  console.log(`🔍 GULIKA computeGulikaLongitude ENTRY: birthDateLocal=${birthDateLocal}, type=${typeof birthDateLocal}, instanceof Date=${birthDateLocal instanceof Date}, isNaN(getTime())=${birthDateLocal ? isNaN(birthDateLocal.getTime()) : 'N/A'}, lat=${latitude}, lng=${longitude}, tz="${timezone}"`);
  
  // Production-grade validation - check date type explicitly
  if (!birthDateLocal || !(birthDateLocal instanceof Date) || isNaN(birthDateLocal.getTime())) {
    console.error(`❌ GULIKA VALIDATION FAILED: birthDateLocal=${birthDateLocal}, typeof=${typeof birthDateLocal}, instanceof Date=${birthDateLocal instanceof Date}, getTime()=${birthDateLocal?.getTime()}, isNaN=${birthDateLocal ? isNaN(birthDateLocal.getTime()) : 'N/A'}`);
    throw new Error(`Birth time and valid coordinates are required for Gulika calculation. Received birthDateLocal: ${birthDateLocal}, type: ${typeof birthDateLocal}`);
  }
  if (typeof latitude !== 'number' || isNaN(latitude) || typeof longitude !== 'number' || isNaN(longitude)) {
    throw new Error('Valid coordinates (latitude and longitude) are required for Gulika calculation');
  }
  if (!timezone || typeof timezone !== 'string') {
    throw new Error('Timezone is required for Gulika calculation');
  }

  console.log(`🔍 GULIKA About to call computeSunriseSunset with: birthDateLocal=${birthDateLocal.toISOString()}, lat=${latitude}, lng=${longitude}, tz="${timezone}"`);
  const { sunriseLocal, sunsetLocal, tzOffsetHours } = await computeSunriseSunset(
    birthDateLocal,
    latitude,
    longitude,
    timezone,
    sunriseOptions || {}
  );
  console.log(`✅ GULIKA computeSunriseSunset SUCCESS: sunriseLocal=${sunriseLocal?.toISOString()}, sunsetLocal=${sunsetLocal?.toISOString()}`);

  const isDay = birthDateLocal >= sunriseLocal && birthDateLocal <= sunsetLocal;
  const weekday = birthDateLocal.getDay(); // 0 Sunday

  let durationMs;
  let startLocal;
  let segmentIndex;
  if (isDay) {
    durationMs = sunsetLocal.getTime() - sunriseLocal.getTime();
    startLocal = sunriseLocal;
    segmentIndex = DAY_GULIKA_SEGMENT_INDEX[weekday];
  } else {
    // Night duration from sunset to next sunrise
    // Validate sunriseLocal before creating nextDay
    if (!sunriseLocal || !(sunriseLocal instanceof Date) || isNaN(sunriseLocal.getTime())) {
      throw new Error(`Invalid sunrise date for night Gulika calculation: ${sunriseLocal}`);
    }
    const nextDay = new Date(sunriseLocal);
    nextDay.setDate(nextDay.getDate() + 1);
    // Validate nextDay after creation
    if (isNaN(nextDay.getTime()) || !(nextDay instanceof Date)) {
      throw new Error(`Failed to create next day date for night Gulika calculation from sunrise: ${sunriseLocal}`);
    }
    const { sunriseLocal: nextSunriseLocal } = await computeSunriseSunset(nextDay, latitude, longitude, timezone, sunriseOptions || {});
    durationMs = nextSunriseLocal.getTime() - sunsetLocal.getTime();
    startLocal = sunsetLocal;
    segmentIndex = NIGHT_GULIKA_SEGMENT_INDEX[weekday];
  }

  const kalaMs = durationMs / 8;
  const gulikaLocal = new Date(startLocal.getTime() + segmentIndex * kalaMs);

  // Convert local Gulika time to UTC
  const gulikaUtc = new Date(gulikaLocal.getTime() - tzOffsetHours * 3600 * 1000);
  const jdUt = toJulianDayUT(gulikaUtc);

  // Compute ascendant at Gulika time; use as Gulika longitude
  const ascCalc = new AscendantCalculator('LAHIRI');
  const asc = ascCalc.calculate(jdUt, latitude, longitude);
  return {
    longitude: normalizeDegrees(asc.longitude),
    sign: asc.sign,
    degree: asc.degree,
    gulikaTimeLocal: gulikaLocal
  };
}


