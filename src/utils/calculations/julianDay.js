/**
 * Pure JavaScript Julian Day Calculation Module
 * Provides Julian Day calculations without dependency on Swiss Ephemeris native module
 * Essential for serverless environments where native modules are unavailable
 * 
 * Algorithm based on Astronomical Algorithms by Jean Meeus
 * Compatible with Swiss Ephemeris swe_julday() output format
 */

/**
 * Calculate Julian Day Number (pure JavaScript, no dependencies)
 * Matches Swiss Ephemeris swe_julday() function signature and output
 * 
 * @param {number} year - Year (Gregorian calendar)
 * @param {number} month - Month (1-12, where 1=January, 12=December)
 * @param {number} day - Day of month (1-31)
 * @param {number} hour - Hour in decimal format (0.0 to 23.999...)
 * @param {number} calendarFlag - Calendar flag (0=Julian, 1=Gregorian, default=1)
 * @returns {number|Object} Julian Day Number (or object with julianDay property if format matches swisseph)
 */
export function calculateJulianDay(year, month, day, hour = 0, calendarFlag = 1) {
  // Input validation
  if (typeof year !== 'number' || typeof month !== 'number' || typeof day !== 'number') {
    throw new Error('Year, month, and day must be numbers');
  }
  
  if (month < 1 || month > 12) {
    throw new Error('Month must be between 1 and 12');
  }
  
  if (day < 1 || day > 31) {
    throw new Error('Day must be between 1 and 31');
  }
  
  if (hour < 0 || hour >= 24) {
    throw new Error('Hour must be between 0 and 23.999...');
  }
  
  // Handle calendar type
  let gregorian = true;
  if (calendarFlag === 0) {
    gregorian = false; // Julian calendar
  }
  
  // Adjust month/year for January/February (algorithm requirement)
  let adjustedYear = year;
  let adjustedMonth = month;
  
  if (adjustedMonth <= 2) {
    adjustedYear -= 1;
    adjustedMonth += 12;
  }
  
  // Calculate Julian Day using Meeus algorithm
  const a = Math.floor(adjustedYear / 100);
  let b;
  
  if (gregorian) {
    // Gregorian calendar correction
    b = 2 - a + Math.floor(a / 4);
  } else {
    // Julian calendar (no correction)
    b = 0;
  }
  
  const jdInteger = Math.floor(365.25 * (adjustedYear + 4716)) + 
                    Math.floor(30.6001 * (adjustedMonth + 1)) + 
                    day + b - 1524.5;
  
  // Add fractional part for time of day
  const jd = jdInteger + (hour / 24.0);
  
  return jd;
}

/**
 * Convert Date object to Julian Day Number
 * Convenience function for date object inputs
 * 
 * @param {Date} date - JavaScript Date object (assumed to be in UTC)
 * @returns {number} Julian Day Number
 */
export function dateToJulianDay(date) {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error('Invalid Date object');
  }
  
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1; // JavaScript months are 0-based
  const day = date.getUTCDate();
  const hour = date.getUTCHours() + 
               date.getUTCMinutes() / 60.0 + 
               date.getUTCSeconds() / 3600.0 + 
               date.getUTCMilliseconds() / 3600000.0;
  
  return calculateJulianDay(year, month, day, hour, 1);
}

/**
 * Convert Julian Day Number to JavaScript Date object
 * 
 * @param {number} jd - Julian Day Number
 * @returns {Date} JavaScript Date object in UTC
 */
export function julianDayToDate(jd) {
  if (typeof jd !== 'number' || isNaN(jd)) {
    throw new Error('Julian Day must be a valid number');
  }
  
  // Algorithm to convert JD to Gregorian calendar
  const jdAdj = jd + 0.5;
  const z = Math.floor(jdAdj);
  const f = jdAdj - z;
  
  let a = z;
  if (z >= 2299161) {
    // Gregorian calendar
    const alpha = Math.floor((z - 1867216.25) / 36524.25);
    a = z + 1 + alpha - Math.floor(alpha / 4);
  }
  
  const b = a + 1524;
  const c = Math.floor((b - 122.1) / 365.25);
  const d = Math.floor(365.25 * c);
  const e = Math.floor((b - d) / 30.6001);
  
  const day = Math.floor(b - d - Math.floor(30.6001 * e) + f);
  const month = e < 14 ? e - 1 : e - 13;
  const year = month > 2 ? c - 4716 : c - 4715;
  
  // Extract time components from fractional day
  const fractionalDay = f;
  const totalHours = fractionalDay * 24;
  const hours = Math.floor(totalHours);
  const minutesFloat = (totalHours - hours) * 60;
  const minutes = Math.floor(minutesFloat);
  const secondsFloat = (minutesFloat - minutes) * 60;
  const seconds = Math.floor(secondsFloat);
  const milliseconds = Math.floor((secondsFloat - seconds) * 1000);
  
  return new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds, milliseconds));
}

/**
 * Validate Julian Day Number
 * 
 * @param {number} jd - Julian Day Number to validate
 * @returns {boolean} True if valid
 */
export function isValidJulianDay(jd) {
  if (typeof jd !== 'number' || isNaN(jd)) {
    return false;
  }
  
  // Valid Julian Day range: approximately 1721058 (4713 BCE) to 5373484 (9999 CE)
  // Practical range for astronomical calculations: 2440588 (1970-01-01) to 2488070 (2100-01-01)
  return jd >= 2440588 && jd <= 2488070;
}

/**
 * Calculate days between two Julian Day Numbers
 * 
 * @param {number} jd1 - First Julian Day Number
 * @param {number} jd2 - Second Julian Day Number
 * @returns {number} Number of days between jd1 and jd2
 */
export function daysBetween(jd1, jd2) {
  return Math.abs(jd2 - jd1);
}

/**
 * Calculate Julian Day Number matching swisseph.swe_julday() format
 * Returns object with julianDay property if needed for compatibility
 * 
 * @param {number} year - Year
 * @param {number} month - Month (1-12)
 * @param {number} day - Day
 * @param {number} hour - Decimal hours
 * @param {number} calendarFlag - Calendar flag
 * @returns {Object} Object with julianDay property (for swisseph compatibility)
 */
export function calculateJulianDaySwissephFormat(year, month, day, hour = 0, calendarFlag = 1) {
  const jd = calculateJulianDay(year, month, day, hour, calendarFlag);
  
  // Return in format compatible with swisseph output
  return {
    julianDay: jd,
    julianDay_UT: jd
  };
}

