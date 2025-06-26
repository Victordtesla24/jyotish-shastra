/**
 * Date and Time Helper Functions for Astronomical Calculations
 * Includes Julian Day calculations, time zone conversions, and date utilities
 */

const { TIME_CONSTANTS } = require('../constants/astronomicalConstants');

/**
 * Convert Gregorian date to Julian Day Number
 * @param {Date} date - JavaScript Date object
 * @returns {number} Julian Day Number
 */
function dateToJulianDay(date) {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1; // JavaScript months are 0-based
  const day = date.getUTCDate();
  const hour = date.getUTCHours();
  const minute = date.getUTCMinutes();
  const second = date.getUTCSeconds();
  const millisecond = date.getUTCMilliseconds();

  // Convert time to decimal day
  const decimalDay = day + (hour + minute / 60 + (second + millisecond / 1000) / 60) / 24;

  // Julian Day calculation
  let a = Math.floor((14 - month) / 12);
  let y = year + 4800 - a;
  let m = month + 12 * a - 3;

  let jd = decimalDay + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;

  return jd;
}

/**
 * Convert Julian Day Number to Gregorian date
 * @param {number} jd - Julian Day Number
 * @returns {Date} JavaScript Date object
 */
function julianDayToDate(jd) {
  const a = Math.floor(jd + 0.5) + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);

  const day = e - Math.floor((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * Math.floor(m / 10);
  const year = 100 * b + d - 4800 + Math.floor(m / 10);

  // Extract time from fractional part
  const fraction = (jd + 0.5) - Math.floor(jd + 0.5);
  const hours = fraction * 24;
  const minutes = (hours - Math.floor(hours)) * 60;
  const seconds = (minutes - Math.floor(minutes)) * 60;

  return new Date(Date.UTC(year, month - 1, day, Math.floor(hours), Math.floor(minutes), Math.floor(seconds)));
}

/**
 * Calculate local time from UTC considering timezone offset
 * @param {Date} utcDate - UTC date
 * @param {number} timezoneOffset - Timezone offset in hours
 * @returns {Date} Local date
 */
function utcToLocal(utcDate, timezoneOffset) {
  const localTime = new Date(utcDate.getTime() + (timezoneOffset * 60 * 60 * 1000));
  return localTime;
}

/**
 * Calculate UTC time from local time considering timezone offset
 * @param {Date} localDate - Local date
 * @param {number} timezoneOffset - Timezone offset in hours
 * @returns {Date} UTC date
 */
function localToUtc(localDate, timezoneOffset) {
  const utcTime = new Date(localDate.getTime() - (timezoneOffset * 60 * 60 * 1000));
  return utcTime;
}

/**
 * Parse time string (HH:MM or HH:MM:SS) to decimal hours
 * @param {string} timeString - Time in HH:MM or HH:MM:SS format
 * @returns {number} Decimal hours
 */
function timeStringToDecimalHours(timeString) {
  const parts = timeString.split(':');
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10) || 0;
  const seconds = parseInt(parts[2], 10) || 0;

  return hours + minutes / 60 + seconds / 3600;
}

/**
 * Convert decimal hours to time string
 * @param {number} decimalHours - Hours in decimal format
 * @returns {string} Time string in HH:MM:SS format
 */
function decimalHoursToTimeString(decimalHours) {
  const hours = Math.floor(decimalHours);
  const minutes = Math.floor((decimalHours - hours) * 60);
  const seconds = Math.floor(((decimalHours - hours) * 60 - minutes) * 60);

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Calculate sidereal time at Greenwich for given Julian Day
 * @param {number} jd - Julian Day Number
 * @returns {number} Greenwich Sidereal Time in hours
 */
function calculateGreenwichSiderealTime(jd) {
  const t = (jd - 2451545.0) / 36525.0;

  // Mean sidereal time at Greenwich in seconds
  let gst = 24110.54841 + 8640184.812866 * t + 0.093104 * t * t - 0.0000062 * t * t * t;

  // Convert to hours and normalize to 0-24 range
  gst = (gst / 3600) % 24;
  if (gst < 0) gst += 24;

  return gst;
}

/**
 * Calculate local sidereal time for given longitude and Julian Day
 * @param {number} jd - Julian Day Number
 * @param {number} longitude - Longitude in degrees (positive East)
 * @returns {number} Local Sidereal Time in hours
 */
function calculateLocalSiderealTime(jd, longitude) {
  const gst = calculateGreenwichSiderealTime(jd);
  let lst = gst + longitude / 15; // Convert longitude to hours

  // Normalize to 0-24 range
  lst = lst % 24;
  if (lst < 0) lst += 24;

  return lst;
}

/**
 * Check if a year is a leap year
 * @param {number} year - Year to check
 * @returns {boolean} True if leap year
 */
function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

/**
 * Get number of days in a month
 * @param {number} year - Year
 * @param {number} month - Month (1-12)
 * @returns {number} Number of days in month
 */
function getDaysInMonth(year, month) {
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  if (month === 2 && isLeapYear(year)) {
    return 29;
  }

  return daysInMonth[month - 1];
}

/**
 * Calculate age in years from birth date
 * @param {Date} birthDate - Birth date
 * @param {Date} currentDate - Current date (optional, defaults to now)
 * @returns {number} Age in years
 */
function calculateAge(birthDate, currentDate = new Date()) {
  let age = currentDate.getFullYear() - birthDate.getFullYear();
  const monthDiff = currentDate.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && currentDate.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

/**
 * Format date for display
 * @param {Date} date - Date to format
 * @param {string} format - Format string ('short', 'medium', 'long')
 * @returns {string} Formatted date string
 */
function formatDate(date, format = 'medium') {
  const options = {
    short: { year: 'numeric', month: 'short', day: 'numeric' },
    medium: { year: 'numeric', month: 'long', day: 'numeric' },
    long: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  };

  return date.toLocaleDateString('en-US', options[format] || options.medium);
}

/**
 * Format time for display
 * @param {Date} date - Date containing time to format
 * @param {boolean} includeSeconds - Whether to include seconds
 * @returns {string} Formatted time string
 */
function formatTime(date, includeSeconds = false) {
  const options = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  };

  if (includeSeconds) {
    options.second = '2-digit';
  }

  return date.toLocaleTimeString('en-US', options);
}

/**
 * Parse date string in various formats
 * @param {string} dateString - Date string to parse
 * @returns {Date} Parsed date
 */
function parseDate(dateString) {
  // Try common date formats
  const formats = [
    /^(\d{4})-(\d{2})-(\d{2})$/, // YYYY-MM-DD
    /^(\d{2})\/(\d{2})\/(\d{4})$/, // MM/DD/YYYY
    /^(\d{2})-(\d{2})-(\d{4})$/, // MM-DD-YYYY
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/ // M/D/YYYY
  ];

  for (const format of formats) {
    const match = dateString.match(format);
    if (match) {
      if (format === formats[0]) { // YYYY-MM-DD
        return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
      } else { // MM/DD/YYYY or MM-DD-YYYY
        return new Date(parseInt(match[3]), parseInt(match[1]) - 1, parseInt(match[2]));
      }
    }
  }

  // Fallback to JavaScript Date parsing
  return new Date(dateString);
}

/**
 * Validate date string format
 * @param {string} dateString - Date string to validate
 * @returns {boolean} True if valid date format
 */
function isValidDateString(dateString) {
  const date = parseDate(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Calculate difference between two dates in various units
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @param {string} unit - Unit ('days', 'hours', 'minutes', 'seconds', 'milliseconds')
 * @returns {number} Difference in specified unit
 */
function dateDifference(date1, date2, unit = 'days') {
  const diffMs = Math.abs(date2.getTime() - date1.getTime());

  switch (unit) {
    case 'milliseconds':
      return diffMs;
    case 'seconds':
      return diffMs / 1000;
    case 'minutes':
      return diffMs / (1000 * 60);
    case 'hours':
      return diffMs / (1000 * 60 * 60);
    case 'days':
      return diffMs / (1000 * 60 * 60 * 24);
    default:
      return diffMs / (1000 * 60 * 60 * 24); // Default to days
  }
}

/**
 * Add time to a date
 * @param {Date} date - Base date
 * @param {number} amount - Amount to add
 * @param {string} unit - Unit ('days', 'hours', 'minutes', 'seconds')
 * @returns {Date} New date with added time
 */
function addTime(date, amount, unit = 'days') {
  const newDate = new Date(date.getTime());

  switch (unit) {
    case 'seconds':
      newDate.setSeconds(newDate.getSeconds() + amount);
      break;
    case 'minutes':
      newDate.setMinutes(newDate.getMinutes() + amount);
      break;
    case 'hours':
      newDate.setHours(newDate.getHours() + amount);
      break;
    case 'days':
      newDate.setDate(newDate.getDate() + amount);
      break;
    case 'months':
      newDate.setMonth(newDate.getMonth() + amount);
      break;
    case 'years':
      newDate.setFullYear(newDate.getFullYear() + amount);
      break;
  }

  return newDate;
}

module.exports = {
  dateToJulianDay,
  julianDayToDate,
  utcToLocal,
  localToUtc,
  timeStringToDecimalHours,
  decimalHoursToTimeString,
  calculateGreenwichSiderealTime,
  calculateLocalSiderealTime,
  isLeapYear,
  getDaysInMonth,
  calculateAge,
  formatDate,
  formatTime,
  parseDate,
  isValidDateString,
  dateDifference,
  addTime
};
