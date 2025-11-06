/**
 * Time Scales Type Definitions
 * 
 * TypeScript interfaces for time scale conversions (ΔT, TT, UT1, UTC).
 * Essential for accurate astronomical calculations requiring proper time systems.
 * 
 * Background:
 * - UTC: Coordinated Universal Time (civil time standard with leap seconds)
 * - UT1: Universal Time (based on Earth rotation, continuously varying)
 * - TT: Terrestrial Time (uniform time scale for ephemeris calculations)
 * - ΔT: Difference between TT and UT1 (TT = UT1 + ΔT)
 * - TAI: International Atomic Time (continuous, no leap seconds)
 */

/**
 * Time Scale Conversion Result
 * Complete conversion of a civil time to all relevant astronomical time scales
 */
export interface TimeScaleConversion {
  civilTime: Date; // Input civil time
  timezone: string; // IANA timezone identifier (e.g., 'Asia/Kolkata')
  utc: Date; // Coordinated Universal Time
  tt: Date; // Terrestrial Time (TT = UTC + (TAI-UTC) + 32.184s)
  ut1: Date; // Universal Time (UT1 ≈ UTC + DUT1, but use ΔT for precision)
  julianDayTT: number; // Julian Day Number in TT time scale
  julianDayUT1: number; // Julian Day Number in UT1 time scale
  julianDayUTC: number; // Julian Day Number in UTC time scale
  deltaT: number; // TT - UT1 in seconds
  deltaTSource: 'IERS' | 'estimate' | 'polynomial'; // Source of ΔT value
  tai: Date; // International Atomic Time (TAI = UTC + leap seconds)
  leapSeconds: number; // Number of accumulated leap seconds at this date
}

/**
 * ΔT (Delta T) Record from IERS
 * Historical ΔT values from International Earth Rotation Service
 */
export interface DeltaTRecord {
  year: number; // Year (e.g., 2023)
  month: number; // Month (1-12)
  deltaT: number; // ΔT value in seconds (TT - UT1)
  source: 'IERS' | 'USNO' | 'estimate'; // Source of ΔT value
  uncertainty?: number; // Uncertainty in seconds (if available)
}

/**
 * ΔT Table Configuration
 * Configuration for loading and using ΔT historical data
 */
export interface DeltaTTableConfig {
  filepath: string; // Path to deltaT IERS JSON file
  validDateRange: {
    start: Date; // First date in table
    end: Date; // Last date in table
  };
  interpolationMethod: 'linear' | 'cubic' | 'spline'; // Interpolation between data points
  extrapolationMethod: 'polynomial' | 'linear' | 'none'; // Method for dates outside range
}

/**
 * Leap Second Record
 * Historical leap second insertions for TAI-UTC conversion
 */
export interface LeapSecondRecord {
  date: string; // ISO 8601 date when leap second was inserted
  taiMinusUtc: number; // TAI - UTC in seconds after this date
  mjd: number; // Modified Julian Date of leap second insertion
}

/**
 * Time Scale Converter Configuration
 * Configuration for TimeScaleConverter class
 */
export interface TimeScaleConverterConfig {
  deltaTSource?: 'IERS' | 'estimate' | 'polynomial'; // Primary ΔT source (default: 'IERS')
  deltaTTablePath?: string; // Path to IERS ΔT table (required if source='IERS')
  leapSecondTablePath?: string; // Path to leap second table
  cacheEnabled?: boolean; // Enable caching of conversions (default: true)
  cacheTTL?: number; // Cache time-to-live in milliseconds (default: 3600000 = 1 hour)
}

/**
 * Julian Day Calculation Options
 * Options for Julian Day Number calculations
 */
export interface JulianDayOptions {
  timeScale: 'TT' | 'UT1' | 'UTC' | 'TAI'; // Time scale for JD calculation
  calendar: 'gregorian' | 'julian'; // Calendar system (auto-detect if not specified)
  precision?: number; // Decimal places for JD (default: 8)
}

/**
 * ΔT Estimation Parameters
 * Parameters for polynomial ΔT estimation when IERS data unavailable
 */
export interface DeltaTEstimationParams {
  year: number;
  method: 'morrison-stephenson' | 'espenak-meeus' | 'usno'; // Estimation algorithm
  centuryT?: number; // T = (year - 2000) / 100 for polynomial calculation
}

/**
 * ΔT Estimation Result
 * Result of ΔT estimation with confidence information
 */
export interface DeltaTEstimationResult {
  deltaT: number; // Estimated ΔT in seconds
  method: string; // Algorithm used
  uncertainty: number; // Estimated uncertainty in seconds
  confidence: 'high' | 'medium' | 'low'; // Confidence level
  notes?: string; // Additional notes about estimation
}

/**
 * Time Scale Validation Result
 * Result of time scale conversion validation
 */
export interface TimeScaleValidationResult {
  valid: boolean;
  errors: string[]; // Validation errors
  warnings: string[]; // Validation warnings (non-fatal)
  conversion: TimeScaleConversion;
}

/**
 * Historical Date Range
 * Date range definitions for different ΔT sources
 */
export const TIME_SCALE_DATE_RANGES = {
  IERS_BULLETINS: {
    start: new Date('1973-01-01'),
    end: new Date('2023-12-31'), // Update periodically
    source: 'IERS Bulletins A & B'
  },
  HISTORICAL_ECLIPSES: {
    start: new Date('-1999-01-01'), // 2000 BCE
    end: new Date('1955-12-31'),
    source: 'Historical eclipse observations'
  },
  POLYNOMIAL_ESTIMATE: {
    start: new Date('-12999-01-01'), // 13000 BCE
    end: new Date('2999-12-31'), // 3000 CE
    source: 'Morrison & Stephenson polynomial'
  }
};

/**
 * Time Scale Constants
 * Physical constants for time scale conversions
 */
export const TIME_SCALE_CONSTANTS = {
  TT_TAI_OFFSET: 32.184, // TT - TAI in seconds (fixed by definition)
  JD_J2000: 2451545.0, // Julian Day of J2000.0 epoch (2000-01-01 12:00:00 TT)
  JD_UNIX_EPOCH: 2440587.5, // Julian Day of Unix epoch (1970-01-01 00:00:00 UTC)
  MJD_OFFSET: 2400000.5, // Modified Julian Day offset from JD
  SECONDS_PER_DAY: 86400, // Seconds in a day
  DAYS_PER_CENTURY: 36525 // Days in a Julian century
};

/**
 * ΔT Interpolation Result
 * Result of ΔT interpolation between table values
 */
export interface DeltaTInterpolationResult {
  deltaT: number; // Interpolated ΔT in seconds
  interpolationMethod: 'linear' | 'cubic' | 'spline';
  dataPoints: DeltaTRecord[]; // Adjacent data points used
  confidence: 'exact' | 'interpolated' | 'extrapolated';
}

/**
 * Time Scale Error
 * Error structure for time scale conversion failures
 */
export interface TimeScaleError {
  code: 'INVALID_DATE' | 'MISSING_DATA' | 'EXTRAPOLATION_FAILED' | 'INVALID_TIMEZONE';
  message: string;
  date?: Date;
  details?: any;
}
