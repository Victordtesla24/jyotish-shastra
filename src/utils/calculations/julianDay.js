/**
 * Julian Day Calculation Module
 * Provides functions for converting between dates and Julian Day numbers
 * Used by Swiss Ephemeris calculations throughout the application
 */

/**
 * Calculate Julian Day Number from year, month, day, and decimal hours
 * @param {number} year - Year (Gregorian calendar)
 * @param {number} month - Month (1-12)
 * @param {number} day - Day of month (1-31)
 * @param {number} hours - Hours in decimal format (optional, default 0)
 * @returns {number} Julian Day Number
 */
export function calculateJulianDay(year, month, day, hours = 0) {
  // Validate inputs
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    throw new Error('Year, month, and day must be integers');
  }
  
  if (month < 1 || month > 12) {
    throw new Error('Month must be between 1 and 12');
  }
  
  if (day < 1 || day > 31) {
    throw new Error('Day must be between 1 and 31');
  }
  
  // Adjust month and year for January and February
  let y = year;
  let m = month;
  
  if (month <= 2) {
    y -= 1;
    m += 12;
  }
  
  // Calculate the Julian Day
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  
  const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524.5;
  
  // Add the decimal hours (convert to days)
  return jd + (hours / 24);
}

/**
 * Convert Gregorian date to Julian Day Number
 * @param {Date} date - JavaScript Date object (in UTC)
 * @returns {number} Julian Day Number
 */
export function dateToJulianDay(date) {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1; // JavaScript months are 0-based
  const day = date.getUTCDate();
  const hour = date.getUTCHours();
  const minute = date.getUTCMinutes();
  const second = date.getUTCSeconds();
  const millisecond = date.getUTCMilliseconds();

  // Convert time to decimal hours
  const decimalHours = hour + minute / 60 + (second + millisecond / 1000) / 3600;

  return calculateJulianDay(year, month, day, decimalHours);
}

/**
 * Convert Julian Day Number to Gregorian date
 * @param {number} jd - Julian Day Number
 * @returns {Date} JavaScript Date object (in UTC)
 */
export function julianDayToDate(jd) {
  // Validate input
  if (typeof jd !== 'number' || isNaN(jd)) {
    throw new Error('Julian Day must be a valid number');
  }
  
  // Add 0.5 to handle noon-to-midnight transition
  const jd2 = jd + 0.5;
  
  // Extract integer and fractional parts
  const Z = Math.floor(jd2);
  const F = jd2 - Z;
  
  // Calculate if Gregorian or Julian calendar
  let A;
  if (Z < 2299161) {
    A = Z; // Julian calendar
  } else {
    // Gregorian calendar
    const alpha = Math.floor((Z - 1867216.25) / 36524.25);
    A = Z + 1 + alpha - Math.floor(alpha / 4);
  }
  
  // Calculate date components
  const B = A + 1524;
  const C = Math.floor((B - 122.1) / 365.25);
  const D = Math.floor(365.25 * C);
  const E = Math.floor((B - D) / 30.6001);
  
  const day = B - D - Math.floor(30.6001 * E) + F;
  let month = E - 1;
  let year = C - 4716;
  
  if (month > 12) {
    month -= 12;
    year += 1;
  }
  
  if (month <= 2) {
    year -= 1;
    month += 12;
  }
  
  // Extract time from fractional part of day
  const fractionalDay = day - Math.floor(day);
  const hours = fractionalDay * 24;
  const minutes = (hours - Math.floor(hours)) * 60;
  const seconds = (minutes - Math.floor(minutes)) * 60;
  const milliseconds = (seconds - Math.floor(seconds)) * 1000;
  
  return new Date(Date.UTC(
    year, 
    month - 1, // JavaScript months are 0-based 
    Math.floor(day),
    Math.floor(hours),
    Math.floor(minutes),
    Math.floor(seconds),
    Math.floor(milliseconds)
  ));
}

/**
 * Calculate decimal hours from time components
 * @param {number} hours - Hours (0-23)
 * @param {number} minutes - Minutes (0-59)
 * @param {number} seconds - Seconds (0-59)
 * @returns {number} Decimal hours
 */
export function calculateDecimalHours(hours, minutes = 0, seconds = 0) {
  return hours + minutes / 60 + seconds / 3600;
}

/**
 * Convert decimal hours to time components
 * @param {number} decimalHours - Hours in decimal format
 * @returns {Object} Object with hours, minutes, seconds
 */
export function decimalHoursToTime(decimalHours) {
  const hours = Math.floor(decimalHours);
  const remainingHours = decimalHours - hours;
  const minutes = Math.floor(remainingHours * 60);
  const remainingMinutes = (remainingHours * 60) - minutes;
  const seconds = Math.round(remainingMinutes * 60);
  
  return { hours, minutes, seconds };
}

/**
 * Validate a Julian Day Number
 * @param {number} jd - Julian Day Number to validate
 * @returns {boolean} True if valid, false otherwise
 */
export function isValidJulianDay(jd) {
  if (typeof jd !== 'number' || isNaN(jd)) {
    return false;
  }
  
  // Check if it's within reasonable astronomical range
  // Swiss Ephemeris typically supports JD from -4000 years to +6000 years
  return jd >= -963439 && jd <= 5373484; // Approximately -6000 to +8000 CE
}

/**
 * Get the weekday from Julian Day
 * @param {number} jd - Julian Day Number
 * @returns {number} Weekday (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
 */
export function julianDayToWeekday(jd) {
  // JD 2440587.5 corresponds to Thursday, January 1, 1970, 00:00 UTC
  // Adjust modulo 7 for weekday calculation
  const daysSinceEpoch = Math.floor(jd + 0.5) - 2440588;
  return ((daysSinceEpoch + 4) % 7 + 7) % 7;
}

// Default export is calculateJulianDay
export { calculateJulianDay as default };
