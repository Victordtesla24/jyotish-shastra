/**
 * Date Utilities for Client-Side Vedic Astrology Application
 * Handles date/time conversions, validations, and formatting
 */

/**
 * Convert date to Julian Day Number
 * @param {Date} date - JavaScript Date object
 * @returns {number} Julian Day Number
 */
export const dateToJulianDay = (date) => {
  const a = Math.floor((14 - (date.getMonth() + 1)) / 12);
  const y = date.getFullYear() + 4800 - a;
  const m = (date.getMonth() + 1) + 12 * a - 3;

  return date.getDate() + Math.floor((153 * m + 2) / 5) + 365 * y +
         Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
};

/**
 * Convert Julian Day Number to date
 * @param {number} jd - Julian Day Number
 * @returns {Date} JavaScript Date object
 */
export const julianDayToDate = (jd) => {
  const a = jd + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);

  const day = e - Math.floor((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * Math.floor(m / 10);
  const year = 100 * b + d - 4800 + Math.floor(m / 10);

  return new Date(year, month - 1, day);
};

/**
 * Get decimal hours from time string
 * @param {string} timeString - Time in HH:MM or HH:MM:SS format
 * @returns {number} Decimal hours
 */
export const timeToDecimalHours = (timeString) => {
  if (!timeString) return 0;

  const parts = timeString.split(':');
  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  const seconds = parseInt(parts[2], 10) || 0;

  return hours + (minutes / 60) + (seconds / 3600);
};

/**
 * Convert decimal hours to time string
 * @param {number} decimalHours - Decimal hours
 * @returns {string} Time string in HH:MM:SS format
 */
export const decimalHoursToTime = (decimalHours) => {
  const hours = Math.floor(decimalHours);
  const minutes = Math.floor((decimalHours - hours) * 60);
  const seconds = Math.floor(((decimalHours - hours) * 60 - minutes) * 60);

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Validate birth date
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {Object} Validation result
 */
export const validateBirthDate = (dateString) => {
  const result = {
    isValid: false,
    error: null,
    date: null
  };

  if (!dateString) {
    result.error = 'Date is required';
    return result;
  }

  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    result.error = 'Invalid date format';
    return result;
  }

  const now = new Date();
  const minDate = new Date('1900-01-01');

  if (date > now) {
    result.error = 'Birth date cannot be in the future';
    return result;
  }

  if (date < minDate) {
    result.error = 'Birth date cannot be before 1900';
    return result;
  }

  result.isValid = true;
  result.date = date;
  return result;
};

/**
 * Validate birth time
 * @param {string} timeString - Time string in HH:MM format
 * @returns {Object} Validation result
 */
export const validateBirthTime = (timeString) => {
  const result = {
    isValid: false,
    error: null,
    time: null
  };

  if (!timeString) {
    result.error = 'Time is required';
    return result;
  }

  const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;

  if (!timeRegex.test(timeString)) {
    result.error = 'Invalid time format. Use HH:MM (24-hour format)';
    return result;
  }

  result.isValid = true;
  result.time = timeString;
  return result;
};

/**
 * Calculate age from birth date
 * @param {Date} birthDate - Birth date
 * @param {Date} currentDate - Current date (optional, defaults to now)
 * @returns {Object} Age calculation
 */
export const calculateAge = (birthDate, currentDate = new Date()) => {
  const birth = new Date(birthDate);
  const current = new Date(currentDate);

  let years = current.getFullYear() - birth.getFullYear();
  let months = current.getMonth() - birth.getMonth();
  let days = current.getDate() - birth.getDate();

  if (days < 0) {
    months--;
    const lastMonth = new Date(current.getFullYear(), current.getMonth(), 0);
    days += lastMonth.getDate();
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  const totalDays = Math.floor((current - birth) / (1000 * 60 * 60 * 24));

  return {
    years,
    months,
    days,
    totalDays,
    formatted: `${years} years, ${months} months, ${days} days`
  };
};

/**
 * Format date for display
 * @param {Date} date - Date to format
 * @param {string} format - Format type ('short', 'medium', 'long')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'medium') => {
  if (!date || !(date instanceof Date)) return '';

  const options = {
    short: { year: '2-digit', month: 'short', day: 'numeric' },
    medium: { year: 'numeric', month: 'short', day: 'numeric' },
    long: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  };

  return date.toLocaleDateString('en-US', options[format] || options.medium);
};

/**
 * Format time for display
 * @param {string} timeString - Time string
 * @param {boolean} use12Hour - Use 12-hour format
 * @returns {string} Formatted time string
 */
export const formatTime = (timeString, use12Hour = false) => {
  if (!timeString) return '';

  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours, 10);
  const min = parseInt(minutes, 10);

  if (use12Hour) {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${min.toString().padStart(2, '0')} ${period}`;
  }

  return `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
};

/**
 * Get timezone offset for a given date
 * @param {Date} date - Date to get offset for
 * @returns {number} Timezone offset in hours
 */
export const getTimezoneOffset = (date) => {
  return -date.getTimezoneOffset() / 60;
};

/**
 * Convert local time to UTC
 * @param {Date} localDate - Local date/time
 * @param {number} timezoneOffset - Timezone offset in hours
 * @returns {Date} UTC date/time
 */
export const localToUTC = (localDate, timezoneOffset) => {
  const utc = new Date(localDate);
  utc.setHours(utc.getHours() - timezoneOffset);
  return utc;
};

/**
 * Convert UTC to local time
 * @param {Date} utcDate - UTC date/time
 * @param {number} timezoneOffset - Timezone offset in hours
 * @returns {Date} Local date/time
 */
export const utcToLocal = (utcDate, timezoneOffset) => {
  const local = new Date(utcDate);
  local.setHours(local.getHours() + timezoneOffset);
  return local;
};

/**
 * Parse birth data string into components
 * @param {string} birthDataString - Birth data in various formats
 * @returns {Object} Parsed birth data
 */
export const parseBirthData = (birthDataString) => {
  const result = {
    date: null,
    time: null,
    place: null,
    isValid: false,
    errors: []
  };

  if (!birthDataString) {
    result.errors.push('Birth data string is required');
    return result;
  }

  // Try to extract date, time, and place from the string
  // This is a simplified parser - in practice, you'd want more robust parsing
  const parts = birthDataString.split(',').map(part => part.trim());

  if (parts.length >= 3) {
    result.date = parts[0];
    result.time = parts[1];
    result.place = parts[2];
    result.isValid = true;
  } else {
    result.errors.push('Invalid birth data format. Expected: Date, Time, Place');
  }

  return result;
};

/**
 * Get current sidereal time
 * @param {Date} date - Date for calculation
 * @param {number} longitude - Longitude in degrees
 * @returns {number} Local sidereal time in hours
 */
export const calculateSiderealTime = (date, longitude = 0) => {
  const jd = dateToJulianDay(date);
  const t = (jd - 2451545.0) / 36525.0;

  // Greenwich Mean Sidereal Time at 0h UT
  let gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) +
             0.000387933 * t * t - t * t * t / 38710000.0;

  // Normalize to 0-360 degrees
  gmst = gmst % 360;
  if (gmst < 0) gmst += 360;

  // Convert to hours
  gmst = gmst / 15.0;

  // Add longitude correction for local sidereal time
  const lst = gmst + (longitude / 15.0);

  return lst < 0 ? lst + 24 : lst % 24;
};

/**
 * Check if a year is a leap year
 * @param {number} year - Year to check
 * @returns {boolean} True if leap year
 */
export const isLeapYear = (year) => {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
};

/**
 * Get days in a month
 * @param {number} year - Year
 * @param {number} month - Month (1-12)
 * @returns {number} Number of days in the month
 */
export const getDaysInMonth = (year, month) => {
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  if (month === 2 && isLeapYear(year)) {
    return 29;
  }

  return daysInMonth[month - 1];
};

/**
 * Format birth data for API submission
 * @param {Object} birthData - Birth data object
 * @returns {Object} Formatted birth data
 */
export const formatBirthDataForAPI = (birthData) => {
  const { date, time, place, timezone } = birthData;

  return {
    dateOfBirth: date,
    timeOfBirth: time,
    placeOfBirth: place,
    timezone: timezone || 'UTC',
    latitude: place?.latitude || 0,
    longitude: place?.longitude || 0
  };
};

/**
 * Validate complete birth data
 * @param {Object} birthData - Birth data object
 * @returns {Object} Validation result
 */
export const validateCompleteBirthData = (birthData) => {
  const result = {
    isValid: true,
    errors: []
  };

  // Validate date
  const dateValidation = validateBirthDate(birthData.date);
  if (!dateValidation.isValid) {
    result.errors.push(`Date: ${dateValidation.error}`);
    result.isValid = false;
  }

  // Validate time
  const timeValidation = validateBirthTime(birthData.time);
  if (!timeValidation.isValid) {
    result.errors.push(`Time: ${timeValidation.error}`);
    result.isValid = false;
  }

  // Validate place
  if (!birthData.place || !birthData.place.name) {
    result.errors.push('Place: Birth place is required');
    result.isValid = false;
  }

  if (!birthData.place?.latitude || !birthData.place?.longitude) {
    result.errors.push('Place: Latitude and longitude are required');
    result.isValid = false;
  }

  return result;
};

/**
 * Get date range for chart calculations
 * @param {Date} birthDate - Birth date
 * @returns {Object} Date range for ephemeris data
 */
export const getEphemerisDateRange = (birthDate) => {
  const birth = new Date(birthDate);
  const startDate = new Date(birth);
  startDate.setFullYear(birth.getFullYear() - 1);

  const endDate = new Date(birth);
  endDate.setFullYear(birth.getFullYear() + 1);

  return {
    startDate,
    endDate,
    birthDate: birth
  };
};

const dateUtils = {
  dateToJulianDay,
  julianDayToDate,
  timeToDecimalHours,
  decimalHoursToTime,
  validateBirthDate,
  validateBirthTime,
  calculateAge,
  formatDate,
  formatTime,
  getTimezoneOffset,
  localToUTC,
  utcToLocal,
  parseBirthData,
  calculateSiderealTime,
  isLeapYear,
  getDaysInMonth,
  formatBirthDataForAPI,
  validateCompleteBirthData,
  getEphemerisDateRange
};

export default dateUtils;
