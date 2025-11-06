/**
 * Time Scale Converter
 * 
 * Handles conversions between UTC, UT1, TT, and TAI time scales
 * using IERS ΔT data and polynomial estimations.
 * 
 * Essential for accurate astronomical ephemeris calculations.
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  TimeScaleConversion,
  DeltaTRecord,
  DeltaTEstimationResult,
  TimeScaleConverterConfig,
  JulianDayOptions,
  TIME_SCALE_CONSTANTS
} from '../types/timeScales';

export class TimeScaleConverter {
  private deltaTTable: DeltaTRecord[];
  private deltaTSource: 'IERS' | 'estimate' | 'polynomial';
  private cache: Map<string, TimeScaleConversion>;
  private cacheTTL: number;

  constructor(config: TimeScaleConverterConfig = {}) {
    this.deltaTSource = config.deltaTSource || 'IERS';
    this.cache = new Map();
    this.cacheTTL = config.cacheTTL || 3600000; // 1 hour default

    // Load IERS ΔT table if using IERS source
    if (this.deltaTSource === 'IERS') {
      const tablePath = config.deltaTTablePath || 
        path.join(__dirname, 'data', 'deltaT_iers.json');
      this.deltaTTable = this.loadDeltaTTable(tablePath);
    } else {
      this.deltaTTable = [];
    }
  }

  /**
   * Convert civil time to all time scales
   */
  convertCivilToTimeScales(
    civilTime: Date,
    timezone: string
  ): TimeScaleConversion {
    // Check cache
    const cacheKey = `${civilTime.toISOString()}_${timezone}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Convert to UTC
    const utc = new Date(civilTime.toUTCString());

    // Calculate ΔT
    const deltaTResult = this.calculateDeltaT(utc);

    // Calculate leap seconds for TAI
    const leapSeconds = this.getLeapSeconds(utc);

    // Convert to TAI: TAI = UTC + leap_seconds
    const tai = new Date(utc.getTime() + leapSeconds * 1000);

    // Convert to TT: TT = TAI + 32.184s
    const tt = new Date(tai.getTime() + TIME_SCALE_CONSTANTS.TT_TAI_OFFSET * 1000);

    // Convert to UT1: UT1 = TT - ΔT
    const ut1 = new Date(tt.getTime() - deltaTResult.deltaT * 1000);

    // Calculate Julian Days
    const julianDayTT = this.julianDay(tt, 'TT');
    const julianDayUT1 = this.julianDay(ut1, 'UT1');
    const julianDayUTC = this.julianDay(utc, 'UTC');

    const conversion: TimeScaleConversion = {
      civilTime,
      timezone,
      utc,
      tt,
      ut1,
      julianDayTT,
      julianDayUT1,
      julianDayUTC,
      deltaT: deltaTResult.deltaT,
      deltaTSource: deltaTResult.source as 'IERS' | 'estimate' | 'polynomial',
      tai,
      leapSeconds
    };

    // Cache result
    this.cache.set(cacheKey, conversion);

    return conversion;
  }

  /**
   * Calculate ΔT for given date
   */
  calculateDeltaT(date: Date): { deltaT: number; source: string } {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1; // JS months are 0-indexed

    // Try IERS table first
    if (this.deltaTSource === 'IERS' && this.deltaTTable.length > 0) {
      const interpolated = this.interpolateDeltaT(year, month);
      if (interpolated !== null) {
        return { deltaT: interpolated, source: 'IERS' };
      }
    }

    // Fall back to polynomial estimation
    const estimated = this.estimateDeltaT(year);
    return { deltaT: estimated.deltaT, source: estimated.method };
  }

  /**
   * Load IERS ΔT table from JSON file
   */
  private loadDeltaTTable(filepath: string): DeltaTRecord[] {
    try {
      const data = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
      return data.data as DeltaTRecord[];
    } catch (error) {
      console.warn(`Failed to load ΔT table from ${filepath}, using estimation:`, error);
      return [];
    }
  }

  /**
   * Interpolate ΔT from IERS table
   */
  private interpolateDeltaT(year: number, month: number): number | null {
    if (this.deltaTTable.length === 0) {
      return null;
    }

    // Find surrounding data points
    const decimalYear = year + (month - 0.5) / 12;
    
    // Find closest records
    let before: DeltaTRecord | null = null;
    let after: DeltaTRecord | null = null;

    for (const record of this.deltaTTable) {
      const recordYear = record.year + (record.month - 0.5) / 12;
      
      if (recordYear <= decimalYear) {
        if (!before || recordYear > (before.year + (before.month - 0.5) / 12)) {
          before = record;
        }
      }
      
      if (recordYear >= decimalYear) {
        if (!after || recordYear < (after.year + (after.month - 0.5) / 12)) {
          after = record;
        }
      }
    }

    // If exact match
    if (before && before.year === year && before.month === month) {
      return before.deltaT;
    }

    // If only one side available, use that value
    if (before && !after) {
      return before.deltaT;
    }
    if (!before && after) {
      return after.deltaT;
    }

    // Linear interpolation
    if (before && after) {
      const beforeYear = before.year + (before.month - 0.5) / 12;
      const afterYear = after.year + (after.month - 0.5) / 12;
      const fraction = (decimalYear - beforeYear) / (afterYear - beforeYear);
      return before.deltaT + fraction * (after.deltaT - before.deltaT);
    }

    return null;
  }

  /**
   * Estimate ΔT using polynomial for dates outside IERS range
   * Uses Morrison & Stephenson (2004) and Espenak & Meeus polynomials
   */
  private estimateDeltaT(year: number): DeltaTEstimationResult {
    // T = (year - 2000) / 100
    const T = (year - 2000) / 100;

    let deltaT: number;
    let method: string;
    let uncertainty: number;
    let confidence: 'high' | 'medium' | 'low';

    if (year >= 2005 && year <= 2050) {
      // Recent past and near future (high confidence)
      // ΔT = 62.92 + 0.32217 * T + 0.005589 * T²
      deltaT = 62.92 + 0.32217 * T + 0.005589 * T * T;
      method = 'espenak-meeus-2005-2050';
      uncertainty = 1.0;
      confidence = 'high';
    } else if (year >= 1986 && year < 2005) {
      // Recent IERS era
      // ΔT = 63.86 + 0.3345 * T - 0.060374 * T² + 0.0017275 * T³ + 0.000651814 * T⁴ + 0.00002373599 * T⁵
      deltaT = 63.86 + 0.3345 * T - 0.060374 * T * T + 
               0.0017275 * Math.pow(T, 3) + 0.000651814 * Math.pow(T, 4) + 
               0.00002373599 * Math.pow(T, 5);
      method = 'espenak-meeus-1986-2005';
      uncertainty = 0.5;
      confidence = 'high';
    } else if (year >= 1800 && year < 1986) {
      // Historical period with good observations
      // ΔT = -20 + 32 * ((year - 1820)/100)²
      const u = (year - 1820) / 100;
      deltaT = -20 + 32 * u * u;
      method = 'morrison-stephenson-1800-1986';
      uncertainty = 2.0;
      confidence = 'medium';
    } else if (year >= 500 && year < 1800) {
      // Medieval and early modern period
      // ΔT = 1574.2 - 556.01 * T + 71.23472 * T² + 0.319781 * T³ - 0.8503463 * T⁴ - 0.005050998 * T⁵ + 0.0083572073 * T⁶
      const u = (year - 1000) / 100;
      deltaT = 1574.2 - 556.01 * u + 71.23472 * u * u + 
               0.319781 * Math.pow(u, 3) - 0.8503463 * Math.pow(u, 4) - 
               0.005050998 * Math.pow(u, 5) + 0.0083572073 * Math.pow(u, 6);
      method = 'morrison-stephenson-500-1800';
      uncertainty = 20.0;
      confidence = 'medium';
    } else if (year >= -500 && year < 500) {
      // Ancient period
      // ΔT = 10583.6 - 1014.41 * u + 33.78311 * u² - 5.952053 * u³ - 0.1798452 * u⁴ + 0.022174192 * u⁵ + 0.0090316521 * u⁶
      const u = year / 100;
      deltaT = 10583.6 - 1014.41 * u + 33.78311 * u * u - 
               5.952053 * Math.pow(u, 3) - 0.1798452 * Math.pow(u, 4) + 
               0.022174192 * Math.pow(u, 5) + 0.0090316521 * Math.pow(u, 6);
      method = 'morrison-stephenson-ancient';
      uncertainty = 60.0;
      confidence = 'low';
    } else {
      // Very ancient or far future (low confidence)
      // Simple quadratic: ΔT = -20 + 32 * T²
      deltaT = -20 + 32 * T * T;
      method = 'polynomial-estimate';
      uncertainty = 200.0;
      confidence = 'low';
    }

    return {
      deltaT,
      method,
      uncertainty,
      confidence,
      notes: `Estimated for year ${year} using ${method}`
    };
  }

  /**
   * Get leap seconds for given UTC date
   * Simplified leap second table (update periodically)
   */
  private getLeapSeconds(utc: Date): number {
    const year = utc.getUTCFullYear();
    
    // Leap second history (as of 2023)
    if (year >= 2017) return 37;
    if (year >= 2015) return 36;
    if (year >= 2012) return 35;
    if (year >= 2009) return 34;
    if (year >= 2006) return 33;
    if (year >= 1999) return 32;
    if (year >= 1997) return 31;
    if (year >= 1996) return 30;
    if (year >= 1994) return 29;
    if (year >= 1993) return 28;
    if (year >= 1992) return 27;
    if (year >= 1991) return 26;
    if (year >= 1990) return 25;
    if (year >= 1988) return 24;
    if (year >= 1985) return 23;
    if (year >= 1983) return 22;
    if (year >= 1982) return 21;
    if (year >= 1981) return 20;
    if (year >= 1980) return 19;
    if (year >= 1979) return 18;
    if (year >= 1978) return 17;
    if (year >= 1977) return 16;
    if (year >= 1976) return 15;
    if (year >= 1975) return 14;
    if (year >= 1974) return 13;
    if (year >= 1973) return 12;
    if (year >= 1972) return 10;
    
    // Before 1972, TAI-UTC was not integer seconds
    return 0;
  }

  /**
   * Calculate Julian Day Number for given date
   */
  julianDay(date: Date, timeScale: 'TT' | 'UT1' | 'UTC' | 'TAI' = 'UTC'): number {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();
    const hour = date.getUTCHours();
    const minute = date.getUTCMinutes();
    const second = date.getUTCSeconds();
    const millisecond = date.getUTCMilliseconds();

    // Convert to decimal day
    const decimalDay = day + (hour + (minute + (second + millisecond / 1000) / 60) / 60) / 24;

    // Adjust month and year for January/February
    let y = year;
    let m = month;
    if (month <= 2) {
      y = year - 1;
      m = month + 12;
    }

    // Calculate Julian Day (Meeus algorithm)
    const A = Math.floor(y / 100);
    const B = 2 - A + Math.floor(A / 4);

    const JD = Math.floor(365.25 * (y + 4716)) + 
               Math.floor(30.6001 * (m + 1)) + 
               decimalDay + B - 1524.5;

    return JD;
  }

  /**
   * Convert UTC to TT (Terrestrial Time)
   */
  utcToTT(utc: Date): Date {
    const leapSeconds = this.getLeapSeconds(utc);
    const tai = new Date(utc.getTime() + leapSeconds * 1000);
    return new Date(tai.getTime() + TIME_SCALE_CONSTANTS.TT_TAI_OFFSET * 1000);
  }

  /**
   * Convert UTC to UT1 (Universal Time)
   */
  utcToUT1(utc: Date): Date {
    const tt = this.utcToTT(utc);
    const deltaTResult = this.calculateDeltaT(utc);
    return new Date(tt.getTime() - deltaTResult.deltaT * 1000);
  }

  /**
   * Convert Julian Day to calendar date
   */
  julianDayToDate(jd: number): Date {
    // Meeus algorithm for JD to calendar date
    const Z = Math.floor(jd + 0.5);
    const F = (jd + 0.5) - Z;

    let A = Z;
    if (Z >= 2299161) {
      const alpha = Math.floor((Z - 1867216.25) / 36524.25);
      A = Z + 1 + alpha - Math.floor(alpha / 4);
    }

    const B = A + 1524;
    const C = Math.floor((B - 122.1) / 365.25);
    const D = Math.floor(365.25 * C);
    const E = Math.floor((B - D) / 30.6001);

    const day = B - D - Math.floor(30.6001 * E) + F;
    const month = E < 14 ? E - 1 : E - 13;
    const year = month > 2 ? C - 4716 : C - 4715;

    const decimalDay = day;
    const dayInt = Math.floor(decimalDay);
    const dayFraction = decimalDay - dayInt;

    const hours = dayFraction * 24;
    const hoursInt = Math.floor(hours);
    const minutes = (hours - hoursInt) * 60;
    const minutesInt = Math.floor(minutes);
    const seconds = (minutes - minutesInt) * 60;

    return new Date(Date.UTC(year, month - 1, dayInt, hoursInt, minutesInt, seconds));
  }

  /**
   * Clear cache (useful for testing)
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// Export singleton instance with default config
export const timeScaleConverter = new TimeScaleConverter({
  deltaTSource: 'IERS',
  cacheEnabled: true
});
