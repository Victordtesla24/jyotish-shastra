import { computeSunriseSunset, normalizeDegrees } from '../astronomy/sunrise.js';
import { getSwisseph } from '../../../utils/swisseph-wrapper.js';

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

async function toJulianDayUT(dateUtc) {
  const localSwisseph = await getSwisseph();
  
  const y = dateUtc.getUTCFullYear();
  const m = dateUtc.getUTCMonth() + 1;
  const d = dateUtc.getUTCDate();
  const hour = dateUtc.getUTCHours() + dateUtc.getUTCMinutes() / 60 + dateUtc.getUTCSeconds() / 3600;
  const gregflag = localSwisseph?.SE_GREG_CAL || 1;
  
  if (!localSwisseph || typeof localSwisseph.swe_julday !== 'function') {
    throw new Error('Swiss Ephemeris is required for Julian Day calculations but is not available. Please ensure Swiss Ephemeris is properly installed and configured.');
  }

  const result = await localSwisseph.swe_julday(y, m, d, hour, gregflag);
  return typeof result === 'object' && result.julianDay ? result.julianDay : result;
}

/**
 * Calculate Gulika (Mandi) longitude per BPHS
 * 
 * @see BPHS Chapter 3, Śloka 70 (PDF page 45)
 * @quote "The degree ascending at the time of start of Gulika's portion will be the longitude of Gulika at a given place."
 * 
 * @note Editor's Note (PDF page 45, Note 2): "Gulika's position should be found out for the beginning of Saturn's Muhurta only."
 * @note Editor's Note (PDF page 45): "Mandi and Gulika are one and the same."
 * 
 * @algorithm
 * 1. Divide day/night duration into 8 equal segments (Kālāvelās)
 * 2. Find Saturn's Muhurta segment (8th for day, 7th for night, based on weekday)
 * 3. Calculate START of Saturn's Muhurta (not end) - this is Gulika time
 * 4. Calculate ascending degree at Gulika time - this is Gulika longitude
 * 
 * @param {Date} birthDateLocal - Local birth date/time
 * @param {number} latitude - Birth latitude in degrees
 * @param {number} longitude - Birth longitude in degrees
 * @param {string} timezone - IANA timezone identifier (e.g., 'Asia/Kolkata')
 * @param {Object} sunriseOptions - Optional sunrise calculation options
 * @returns {Promise<Object>} Gulika longitude, sign, degree, and local time
 * @throws {Error} If coordinates or timezone are invalid
 */
export async function computeGulikaLongitude({
  birthDateLocal,
  latitude,
  longitude,
  timezone,
  sunriseOptions
}) {
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

  // Parse timezone offset from timezone string BEFORE calling computeSunriseSunset
  let tzOffsetHours = 0;
  if (timezone && typeof timezone === 'string') {
    // Parse timezone string format: '+05:30' or '-05:00'
    const tzMatch = timezone.match(/^([+-])(\d{2}):(\d{2})$/);
    if (tzMatch) {
      const sign = tzMatch[1] === '+' ? 1 : -1;
      const hours = parseInt(tzMatch[2], 10);
      const minutes = parseInt(tzMatch[3], 10);
      tzOffsetHours = sign * (hours + minutes / 60);
    } else if (timezone.includes('/')) {
      // Handle IANA timezone format (e.g., 'Asia/Kolkata')
      try {
        const moment = (await import('moment-timezone')).default;
        const timezoneMoment = moment.tz(birthDateLocal, timezone);
        tzOffsetHours = timezoneMoment.utcOffset() / 60; // Convert minutes to hours
      } catch (tzError) {
        console.warn(`Could not parse timezone offset from: ${timezone}, defaulting to 0. Error: ${tzError.message}`);
        tzOffsetHours = 0;
      }
    } else {
      console.warn(`Could not parse timezone offset from: ${timezone}, defaulting to 0`);
      tzOffsetHours = 0;
    }
  }

  // Now call computeSunriseSunset with the numeric timezone offset
  const sunriseSunsetResult = await computeSunriseSunset(
    birthDateLocal.getFullYear(),
    birthDateLocal.getMonth() + 1, // JavaScript months are 0-based, need 1-based
    birthDateLocal.getDate(),
    latitude,
    longitude,
    tzOffsetHours  // Pass numeric offset, not string
  );
  
  // Extract sunrise and sunset times from result object
  const sunriseLocal = sunriseSunsetResult?.sunrise?.time;
  const sunsetLocal = sunriseSunsetResult?.sunset?.time;

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
    const nextSunriseSunsetResult = await computeSunriseSunset(
        nextDay.getFullYear(),
        nextDay.getMonth() + 1, // JavaScript months are 0-based, need 1-based
        nextDay.getDate(),
        latitude,
        longitude,
        tzOffsetHours  // Pass numeric offset, not string
      );
      const nextSunriseLocal = nextSunriseSunsetResult?.sunrise?.time;
    durationMs = nextSunriseLocal.getTime() - sunsetLocal.getTime();
    startLocal = sunsetLocal;
    segmentIndex = NIGHT_GULIKA_SEGMENT_INDEX[weekday];
  }

  const kalaMs = durationMs / 8;
  // BPHS Ch.3 Śloka 70, p.45: Calculate START of Saturn's Muhurta (not end)
  // Editor's Note p.45: "Gulika's position should be found out for the beginning of Saturn's Muhurta only."
  const gulikaLocal = new Date(startLocal.getTime() + segmentIndex * kalaMs);
  
  // Validate gulikaLocal is a valid date
  if (isNaN(gulikaLocal.getTime())) {
    throw new Error(`Invalid Gulika local date calculated from startLocal: ${startLocal}, segmentIndex: ${segmentIndex}, kalaMs: ${kalaMs}`);
  }

  // Validate tzOffsetHours is a valid number
  if (!Number.isFinite(tzOffsetHours) || isNaN(tzOffsetHours)) {
    throw new Error(`Invalid timezone offset: ${tzOffsetHours} (timezone: ${timezone})`);
  }

  // Convert local Gulika time to UTC
  const gulikaUtc = new Date(gulikaLocal.getTime() - tzOffsetHours * 3600 * 1000);
  
  // Validate gulikaUtc is a valid date
  if (isNaN(gulikaUtc.getTime())) {
    throw new Error(`Invalid Gulika UTC date calculated from gulikaLocal: ${gulikaLocal}, tzOffsetHours: ${tzOffsetHours}`);
  }
  
  const jdUt = await toJulianDayUT(gulikaUtc);
  
  // Validate JD is a valid number
  if (!Number.isFinite(jdUt) || isNaN(jdUt)) {
    throw new Error(`Invalid Julian Day calculated: ${jdUt}`);
  }

  // Compute ascendant at Gulika time; use as Gulika longitude
  const ascCalc = new AscendantCalculator('LAHIRI');
  await ascCalc.initialize();
  
  // Extract date components - always use Date conversion for reliability
  // Date conversion is more reliable than revjul for edge cases
  const gulikaUtcDate = new Date((jdUt - 2440587.5) * 86400000);
  const year = Math.floor(gulikaUtcDate.getUTCFullYear());
  const month = Math.floor(gulikaUtcDate.getUTCMonth() + 1); // getUTCMonth returns 0-11, so add 1
  const day = Math.floor(gulikaUtcDate.getUTCDate());
  const hour = Math.floor(gulikaUtcDate.getUTCHours());
  const minutes = Math.floor(gulikaUtcDate.getUTCMinutes());
  
  // Validate extracted values
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day) ||
      !Number.isInteger(hour) || !Number.isInteger(minutes)) {
    throw new Error(`Invalid date components extracted: year=${year}, month=${month}, day=${day}, hour=${hour}, minutes=${minutes}`);
  }
  
  if (month < 1 || month > 12) {
    throw new Error(`Invalid month extracted: ${month} (should be 1-12)`);
  }
  
  if (day < 1 || day > 31) {
    throw new Error(`Invalid day extracted: ${day} (should be 1-31)`);
  }
  
  const asc = await ascCalc.calculateAscendantAndHouses(
    year,
    month,
    day,
    hour,
    minutes,
    latitude,
    longitude
  );
  const ascendantResult = asc.ascendant;
  
  return {
    longitude: normalizeDegrees(ascendantResult.longitude),
    sign: ascendantResult.signName,
    degree: ascendantResult.longitude % 30,
    gulikaTimeLocal: gulikaLocal
  };
}


