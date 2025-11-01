import { calculateJulianDay, julianDayToDate } from '../../../utils/calculations/julianDay.js';
import { calculatePlanetPosition } from '../../../utils/calculations/planetaryPositions.js';
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
        console.log('✅ sunrise: Swiss Ephemeris (WASM) initialized successfully');
        
        return { swisseph, available: true };
      } catch (error) {
        swissephAvailable = false;
        console.warn('⚠️ sunrise: Swiss Ephemeris initialization failed:', error.message);
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
      // Fallback to pure JavaScript calculation
      console.warn('⚠️ sunrise: Using fallback calculation for sunrise/sunset');
      return calculateFallbackSunriseSunset(year, month, day, latitude, longitude, timezone);
    }
    
    // Calculate Julian Day for the date at noon UT
    const jd = await swisseph.swe_julday(year, month, day, 12.0, 1); // SE_GREG_CAL = 1
    
    // Set geographic location
    const geopos = [longitude, latitude, 0]; // [longitude, latitude, altitude]
    const pressure = 1013.25; // Standard atmospheric pressure in hPa
    const temperature = 15; // Standard temperature in Celsius
    
    // Calculate sunrise
    const sunriseResult = await swisseph.swe_rise_trans(
      jd,
      0, // SE_SUN = 0
      '',
      1, // SE_CALC_RISE = 1
      geopos,
      pressure,
      temperature,
      0  // Use default flags
    );
    
    // Calculate sunset
    const sunsetResult = await swisseph.swe_rise_trans(
      jd,
      0, // SE_SUN = 0
      '',
      2, // SE_CALC_SET = 2
      geopos,
      pressure,
      temperature,
      0  // Use default flags
    );
    
    if (sunriseResult.rcode !== 0 || sunsetResult.rcode !== 0) {
      throw new Error(`Swiss Ephemeris sunrise/sunset calculation failed: rcode=${sunriseResult.rcode}`);
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
    console.warn('⚠️ sunrise: Error calculating sunrise/sunset with Swiss Ephemeris:', error.message);
    // Fallback to pure JavaScript calculation
    return calculateFallbackSunriseSunset(year, month, day, latitude, longitude, timezone);
  }
}

/**
 * Fallback calculation using pure JavaScript for serverless environments
 * This is a simplified calculation for when Swiss Ephemeris is not available
 */
function calculateFallbackSunriseSunset(year, month, day, latitude, longitude, timezone) {
  console.log('🔄 sunrise: Using fallback JavaScript calculation');
  
  // Simple approximate calculation
  const date = new Date(year, month - 1, day);
  const dayOfYear = Math.floor((date - new Date(year, 0, 0)) / (1000 * 60 * 60 * 24));
  
  // Approximate solar declination
  const declination = 23.45 * Math.sin(2 * Math.PI * (284 + dayOfYear) / 365);
  
  // Approximate sunrise/sunset times in decimal hours from noon
  const latRad = latitude * Math.PI / 180;
  const decRad = declination * Math.PI / 180;
  const hourAngle = Math.acos(-Math.tan(latRad) * Math.tan(decRad));
  
  const sunriseHour = 12 - hourAngle * 12 / Math.PI - timezone;
  const sunsetHour = 12 + hourAngle * 12 / Math.PI - timezone;
  
  // Convert to readable times
  const sunriseTime = new Date(year, month - 1, day, Math.floor(sunriseHour), Math.round((sunriseHour % 1) * 60));
  const sunsetTime = new Date(year, month - 1, day, Math.floor(sunsetHour), Math.round((sunsetHour % 1) * 60));
  
  return {
    sunrise: {
      time: sunriseTime,
      hours: sunriseTime.getHours(),
      minutes: sunriseTime.getMinutes(),
      decimalHours: sunriseHour + 12
    },
    sunset: {
      time: sunsetTime,
      hours: sunsetTime.getHours(),
      minutes: sunsetTime.getMinutes(),
      decimalHours: sunsetHour + 12
    },
    julianDay: calculateJulianDay(year, month, day, 12.0),
    timezone: timezone,
    method: 'fallback-javascript'
  };
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
    await ensureSwissephLoaded();
  }
  return swissephAvailable;
}

// Export the initialization function for reuse
export { initSwissEphemeris };
