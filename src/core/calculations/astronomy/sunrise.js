import { calculateJulianDay, julianDayToDate } from '../../../utils/calculations/julianDay.js';

import { setupSwissephWithEphemeris } from '../../../utils/swisseph-wrapper.js';
import path from 'path';
import fs from 'fs';

// Swiss Ephemeris (WebAssembly) - cached instance
let swisseph = null;
let swissephAvailable = false;
let swissephInitPromise = null;

/**
 * Initialize Swiss Ephemeris with improved setup
 */
async function initSwissEphemeris() {
  if (!swissephInitPromise) {
    swissephInitPromise = (async () => {
      try {
        const ephePath = path.resolve(process.cwd(), 'ephemeris');
        
        // Use the improved helper function for comprehensive initialization
        const { swisseph: sweph } = await setupSwissephWithEphemeris(
          fs.existsSync(ephePath) ? ephePath : null
        );
        
        swisseph = sweph;
        swissephAvailable = true;
        
        return { swisseph, available: true };
      } catch (error) {
        swissephAvailable = false;
        throw new Error(`Swiss Ephemeris is required for sunrise calculations but not available: ${error.message}`);
      }
    })();
  }
  
  return swissephInitPromise;
}

/**
 * Calculate sunrise and sunset times for a given date and location
 * Uses Swiss Ephemeris (WebAssembly) for accurate calculations
 */
export async function computeSunriseSunset(
  year,
  month,
  day,
  latitude,
  longitude,
  timezone = 0
) {
  try {
    // Ensure Swiss Ephemeris is loaded
    await initSwissEphemeris();
    
    if (!swissephAvailable || !swisseph) {
      console.warn('Swiss Ephemeris not available, falling back to JavaScript calculation');
      return computeSunriseSunsetFallback(year, month, day, latitude, longitude, timezone);
    }

    // Calculate Julian Day for the date at midnight UT (0.0)
    // This ensures sunrise/sunset are calculated for the CURRENT day, not the next day
    // If we use noon (12.0) and birth time is after noon, swisseph returns next day's sunrise
    const jd = await swisseph.swe_julday(year, month, day, 0.0, 1); // SE_GREG_CAL = 1
    
    // Set geographic location
    const geopos = [longitude, latitude, 0]; // [longitude, latitude, altitude]
    const pressure = 1013.25; // Standard atmospheric pressure in hPa
    const temperature = 15; // Standard temperature in Celsius
    
    // Calculate sunrise
    // swe_rise_trans signature: (jd, planetId, starname, epheflag, rsmi, geopos, atpress, attemp)
    const sunriseResult = await swisseph.swe_rise_trans(
      jd,
      0, // SE_SUN = 0
      '', // starname
      0, // epheflag
      1, // rsmi: SE_CALC_RISE = 1
      geopos,
      pressure,
      temperature
    );
    
    // Calculate sunset
    const sunsetResult = await swisseph.swe_rise_trans(
      jd,
      0, // SE_SUN = 0
      '', // starname
      0, // epheflag
      2, // rsmi: SE_CALC_SET = 2
      geopos,
      pressure,
      temperature
    );
    
    if (sunriseResult.rcode !== 0 || sunsetResult.rcode !== 0) {
      console.warn(`Swiss Ephemeris sunrise/sunset calculation failed (rcode=${sunriseResult.rcode}), falling back to JavaScript calculation`);
      return computeSunriseSunsetFallback(year, month, day, latitude, longitude, timezone);
    }
    
    // Convert Julian Day to date/time
    const sunriseTime = julianDayToDate(sunriseResult.tret);
    const sunsetTime = julianDayToDate(sunsetResult.tret);
    
    return {
      sunrise: {
        time: sunriseTime,
        hours: sunriseTime.getHours(),
        minutes: sunriseTime.getMinutes(),
        decimalHours: sunriseTime.getHours() + sunriseTime.getMinutes() / 60
      },
      sunset: {
        time: sunsetTime,
        hours: sunsetTime.getHours(),
        minutes: sunsetTime.getMinutes(),
        decimalHours: sunsetTime.getHours() + sunsetTime.getMinutes() / 60
      },
      julianDay: jd,
      timezone: timezone,
      method: 'swisseph-wasm'
    };
  } catch (error) {
    console.warn('Swiss Ephemeris sunrise calculation failed, falling back to JavaScript:', error.message);
    return computeSunriseSunsetFallback(year, month, day, latitude, longitude, timezone);
  }
}

/**
 * Fallback sunrise calculation using JavaScript approximation
 * Provides basic sunrise/sunset times when Swiss Ephemeris fails
 */
function computeSunriseSunsetFallback(year, month, day, latitude, longitude, timezone) {
  const date = new Date(year, month - 1, day);
  const dayOfYear = Math.floor((date - new Date(year, 0, 0)) / 86400000);
  
  // Solar declination approximation
  const P = Math.asin(0.39795 * Math.cos(0.2163108 + 2 * Math.atan(0.9671396 * Math.tan(deg2rad(0.00860 * (dayOfYear - 186))))));
  
  // Hour angle calculation
  const acosArg = -Math.tan(deg2rad(latitude)) * Math.tan(P);
  let hourAngle;
  
  if (acosArg > 1) {
    // Polar day (sun doesn't set)
    hourAngle = 0;
  } else if (acosArg < -1) {
    // Polar night (sun doesn't rise)
    hourAngle = Math.PI;
  } else {
    hourAngle = Math.acos(acosArg);
  }
  
  // Approximate sunrise/sunset times in UTC
  const sunriseUTC = 12 - rad2deg(hourAngle) / 15 + longitude / 15;
  const sunsetUTC = 12 + rad2deg(hourAngle) / 15 + longitude / 15;
  
  // Convert to local time
  const sunriseHour = Math.floor(sunriseUTC + timezone) % 24;
  const sunriseMinute = Math.round((sunriseUTC + timezone - Math.floor(sunriseUTC + timezone)) * 60);
  const sunsetHour = Math.floor(sunsetUTC + timezone) % 24;
  const sunsetMinute = Math.round((sunsetUTC + timezone - Math.floor(sunsetUTC + timezone)) * 60);
  
  // Create local date objects
  const sunriseTime = new Date(year, month - 1, day, sunriseHour, sunriseMinute);
  const sunsetTime = new Date(year, month - 1, day, sunsetHour, sunsetMinute);
  
  return {
    sunrise: {
      time: sunriseTime,
      hours: sunriseHour,
      minutes: sunriseMinute,
      decimalHours: sunriseHour + sunriseMinute / 60
    },
    sunset: {
      time: sunsetTime,
      hours: sunsetHour,
      minutes: sunsetMinute,
      decimalHours: sunsetHour + sunsetMinute / 60
    },
    julianDay: calculateJulianDay(year, month, day, 12),
    timezone: timezone,
    method: 'fallback-javascript'
  };
}

/**
 * Convert degrees to radians
 */
function deg2rad(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees
 */
function rad2deg(radians) {
  return radians * (180 / Math.PI);
}

/**
 * Normalize degrees to 0-360 range
 */
export function normalizeDegrees(degrees) {
  while (degrees < 0) degrees += 360;
  while (degrees >= 360) degrees -= 360;
  return degrees;
}

export async function isSwissephAvailable() {
  if (swisseph === null) {
    await initSwissEphemeris();
  }
  return swissephAvailable;
}

// Export the initialization function for reuse
export { initSwissEphemeris };
