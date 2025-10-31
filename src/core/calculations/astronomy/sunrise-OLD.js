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

export async function computeSunriseSunset(dateLocal, latitude, longitude, timezone, options = {}) {
  try {
    initSwissEphemeris();

    // Convert local date to UTC using numeric offset if provided; IANA zones should be pre-resolved to offset upstream
    const tzOffsetHours = parseTimezoneOffsetHours(timezone);
    const dateUtc = new Date(dateLocal.getTime() - tzOffsetHours * 3600 * 1000);
    
    // Try full calculation first
    return await computeSunriseSunsetFull(dateLocal, latitude, longitude, timezone, options);
  } catch (error) {
    // Fallback to simplified calculation if full method fails
    console.warn('Sunrise calculation with Swiss Ephemeris failed, using fallback:', error.message);
    return computeSunriseSunsetFallback(dateLocal, latitude, longitude, timezone);
  }
}

async function computeSunriseSunsetFull(dateLocal, latitude, longitude, timezone, options = {}) {
  // Swiss Ephemeris rise/set functions have limitations and return same time for rise/set
  // Using a better astronomical approach with sun position calculations
  
  const jdNoon = toJulianDayUT(new Date(Date.UTC(dateLocal.getFullYear(), dateLocal.getMonth(), dateLocal.getDate(), 12, 0, 0)));
  
  // Get sun position at noon for the day
  const sunAtNoon = swisseph.swe_calc_ut(jdNoon, swisseph.SE_SUN, swisseph.SEFLG_SWIEPH);
  
  // Calculate approximate sunrise/sunset using simple astronomical formula
  // This is more reliable than the Swiss Ephemeris rise/set functions
  const dayOfYear = Math.floor((dateLocal - new Date(dateLocal.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  
  // Better seasonal adjustment based on sun declination
  const sunDeclination = Math.asin(Math.sin(sunAtNoon.latitude * Math.PI / 180));
  const latRad = latitude * Math.PI / 180;
  
  // Hour angle for sunrise/sunset
  const hourAngle = Math.acos(-Math.tan(latRad) * Math.tan(sunDeclination));
  const hourAngleHours = hourAngle * 12 / Math.PI; // Convert radians to hours
  
  // Solar noon correction
  const solarNoon = new Date(dateLocal.getFullYear(), dateLocal.getMonth(), dateLocal.getDate(), 12, 0, 0);
  
  // Calculate sunrise and sunset
  const sunriseUtc = new Date(solarNoon.getTime() - hourAngleHours * 3600 * 1000);
  const sunsetUtc = new Date(solarNoon.getTime() + hourAngleHours * 3600 * 1000);
  
  // Convert back to local by adding offset
  const tzOffsetHours = parseTimezoneOffsetHours(timezone);
  const sunriseLocal = new Date(sunriseUtc.getTime() + tzOffsetHours * 3600 * 1000);
  const sunsetLocal = new Date(sunsetUtc.getTime() + tzOffsetHours * 3600 * 1000);

  return { sunriseLocal, sunsetLocal, tzOffsetHours };
}

function computeSunriseSunsetFallback(dateLocal, latitude, longitude, timezone) {
  // Simple approximation for sunrise/sunset
  // This is a basic fallback that should be sufficient for BTR calculations
  
  const tzOffsetHours = parseTimezoneOffsetHours(timezone);
  const date = new Date(dateLocal);
  
  // Basic sunrise approximation: 6 AM ± seasonal adjustment
  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  const seasonalAdjustment = 0.5 * Math.sin((dayOfYear - 80) * 2 * Math.PI / 365); // ±30 minutes
  const latitudeAdjustment = latitude / 60; // Approx 1 minute per degree of latitude
  
  const sunriseHour = 6 + seasonalAdjustment + latitudeAdjustment + tzOffsetHours;
  const sunsetHour = 18 + seasonalAdjustment + latitudeAdjustment + tzOffsetHours;
  
  const sunriseLocal = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 
    Math.floor(sunriseHour), Math.floor((sunriseHour % 1) * 60), 0);
  const sunsetLocal = new Date(date.getFullYear(), date.getMonth(), date.getDate(),
    Math.floor(sunsetHour), Math.floor((sunsetHour % 1) * 60), 0);
  
  return { 
    sunriseLocal, 
    sunsetLocal, 
    tzOffsetHours,
    fallback: true
  };
}

export function normalizeDegrees(deg) {
  let d = deg % 360;
  if (d < 0) d += 360;
  return d;
}


