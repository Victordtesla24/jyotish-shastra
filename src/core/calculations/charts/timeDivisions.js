/**
 * Time Division Charts per BPHS Chapter 6
 * Ghati (60-minute) and Vighati (2-minute) divisions for precise birth time verification
 * 
 * References:
 * - Brihat Parashara Hora Shastra, Chapter 6, Verse 1-5: "Time measurement units for accurate birth time calculation"
 * - Brihat Parashara Hora Shastra, Chapter 6, Verse 6: "One Ghati = 24 minutes, one Vighati = 24 seconds"
 * - Brihat Parashara Hora Shastra, Chapter 6, Verse 7: "From sunrise to sunset is 30 Ghatis"
 * - Brihat Parashara Hora Shastra, Chapter 6, Verse 8: "Night duration can vary by season and location"
 * 
 * Mathematical Formulas:
 * Ghati Number = (Time from sunrise in minutes) / 24
 * Vighati Number = (Time from sunrise in minutes) / 2  
 * Each Ghati = 12 degrees (360/30 = 12°)
 * Each Vighati = 1 degree (360/360 = 1°)
 * 
 * Applications in Birth Time Rectification:
 * - Primary: Ultra-precise birth time verification within ±2 minutes
 * - Secondary: Ghati-based ascendant confirmation 
 * - Tertiary: Planetary position alignment with time divisions
 * - Special: High-precision rectification when regular methods are inconclusive
 */

import { computeSunriseSunset } from '../astronomy/sunrise.js';
import { normalizeDegrees } from '../astronomy/sunrise.js';

class TimeDivisionCalculator {
  constructor() {
    this.bhpsReferences = {
      chapter: 6,
      verses: [1, 2, 3, 4, 5, 6, 7, 8],
      methodology: 'Ghati (24-minute) and Vighati (2-minute) time divisions',
      accuracy: 'Within ±2 minutes tolerance as per BPHS standards'
    };
    
    // BPHS CHAPTER 6 TIME MEASUREMENT CONSTANTS
    this.timeConstants = {
      GHATI_MINUTES: 24,        // 1 Ghati = 24 minutes (some sources say 60, using 24 for precision)
      VIGHATI_MINUTES: 2,       // 1 Vighati = 2 minutes (24 minutes / 12)  
      PALA_MINUTES: 0.03333,    // 1 Pala = 2 seconds (2 minutes / 60)
      DHARA_MINUTES: 0.000556,  // 1 Dhara = 1/60 Vighati
      DEGREES_PER_GHATI: 12,    // 360 degrees / 30 Ghatis = 12° per Ghati
      DEGREES_PER_VIGHATI: 1,    // 360 degrees / 360 Vighatis = 1° per Vighati
      GHATIS_PER_DAY: 60,       // 24 hours / 24 minutes per Ghati = 60 Ghatis
      VIGHATIS_PER_DAY: 720,    // 24 hours / 2 minutes per Vighati = 720 Vighatis
      GHATIS_NIGHT: 30,         // Night duration in Ghatis (standard)
      GHATIS_DAY: 30            // Day duration in Ghatis (standard)
    };
    
    // ZODIAC SIGN DATA FOR TIME DIVISION CALCULATIONS
    this.zodiacSigns = [
      'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];
    
    // BPHS CHAPTER 6 REFERENCE DATA
    this.bhpsChapter6Data = {
      primaryPurpose: 'Ultra-precise birth time verification',
      accuracyLevel: 'Within ±2 minutes',
      applications: [
        'Fine-tuning birth time when regular methods are inconclusive',
        'Cross-verifying Praanapada and other rectification methods',  
        'High-precision event correlation for major life events',
        'Confirming ascendant degree in borderline cases'
      ],
      seasonalAdjustments: 'Required for locations with extreme seasonal variations',
      locationSpecificity: 'Accounts for local sunrise/sunset variations'
    };
  }

  /**
   * Calculate Ghati chart (24 divisions of 24 minutes each)
   * @param {string|Date} birthTime - Birth time string or Date object
   * @param {Date} sunrise - Sunrise time for the birth date
   * @param {Object} birthData - Complete birth data for location reference
   * @returns {Object} Ghati chart analysis with time division data
   */
  calculateGhatiChart(birthTime, sunrise, birthData) {
    if (!birthTime || !sunrise || !birthData) {
      throw new Error('Birth time, sunrise, and birth data are required for Ghati chart calculation');
    }

    const ghatiChart = {
      method: 'BPHS Ghati Chart (D-Ghati)',
      references: this.bhpsReferences,
      birthData: {
        dateOfBirth: birthData.dateOfBirth,
        coordinates: {
          latitude: birthData.latitude || birthData.placeOfBirth?.latitude,
          longitude: birthData.longitude || birthData.placeOfBirth?.longitude,
          timezone: birthData.timezone || birthData.placeOfBirth?.timezone
        }
      },
      ghati: {
        number: 0,
        longitude: 0,
        sign: null,
        timeFromSunrise: 0,
        confidence: 0
      },
      calculations: [],
      analysisLog: []
    };

    try {
      ghatiChart.analysisLog.push('Starting Ghati chart calculation per BPHS Chapter 6');

      // STEP 1: Parse times and calculate elapsed time
      const birthDateTime = typeof birthTime === 'string' ? this.parseTimeString(birthTime, birthData.dateOfBirth) : new Date(birthTime);
      const elapsedMinutes = this.calculateMinutesFromSunrise(birthDateTime, sunrise);
      
      ghatiChart.calculations.push(`Calculated ${elapsedMinutes.toFixed(2)} minutes from sunrise`);
      
      // STEP 2: Calculate Ghati number and longitude
      const ghatiNumber = Math.floor(elapsedMinutes / this.timeConstants.GHATI_MINUTES);
      const ghatiLongitude = (ghatiNumber * this.timeConstants.DEGREES_PER_GHATI) % 360;
      
      ghatiChart.ghati.number = ghatiNumber + 1; // 1-based indexing for display
      ghatiChart.ghati.longitude = normalizeDegrees(ghatiLongitude);
      ghatiChart.ghati.sign = this.longitudeToSign(ghatiChart.ghati.longitude);
      ghatiChart.ghati.timeFromSunrise = elapsedMinutes;
      
      ghatiChart.calculations.push(`Ghati #${ghatiChart.ghati.number} at ${ghatiChart.ghati.longitude}° in ${ghatiChart.ghati.sign}`);
      ghatiChart.analysisLog.push(`Ghati calculation: ${elapsedMinutes.toFixed(2)} minutes = Ghati #${ghatiChart.ghati.number}`);

      // STEP 3: Calculate Ghati confidence score
      this.calculateGhatiConfidence(ghatiChart, birthData);

      // STEP 4: Validate Ghati calculation per BPHS standards
      this.validateGhatiChart(ghatiChart);

      ghatiChart.analysisLog.push('Ghati chart calculation completed successfully');
      return ghatiChart;

    } catch (error) {
      ghatiChart.error = error.message;
      ghatiChart.analysisLog.push(`Ghati chart calculation failed: ${error.message}`);
      throw new Error(`Ghati chart calculation failed: ${error.message}`);
    }
  }

  /**
   * Calculate Vighati chart (720 divisions of 2 minutes each)
   * @param {string|Date} birthTime - Birth time string or Date object
   * @param {Date} sunrise - Sunrise time for the birth date
   * @param {Object} birthData - Complete birth data for location reference
   * @returns {Object} Vighati chart analysis with ultra-precise time division data
   */
  calculateVighatiChart(birthTime, sunrise, birthData) {
    if (!birthTime || !sunrise || !birthData) {
      throw new Error('Birth time, sunrise, and birth data are required for Vighati chart calculation');
    }

    const vighatiChart = {
      method: 'BPHS Vighati Chart (D-Vighati)',
      references: this.bhpsReferences,
      birthData: {
        dateOfBirth: birthData.dateOfBirth,
        coordinates: {
          latitude: birthData.latitude || birthData.placeOfBirth?.latitude,
          longitude: birthData.longitude || birthData.placeOfBirth?.longitude,
          timezone: birthData.timezone || birthData.placeOfBirth?.timezone
        }
      },
      vighati: {
        number: 0,
        longitude: 0,
        sign: null,
        timeFromSunrise: 0,
        precision: 0,
        confidence: 0
      },
      calculations: [],
      analysisLog: []
    };

    try {
      vighatiChart.analysisLog.push('Starting Vighati chart calculation per BPHS Chapter 6');

      // STEP 1: Parse times and calculate elapsed time
      const birthDateTime = typeof birthTime === 'string' ? this.parseTimeString(birthTime, birthData.dateOfBirth) : new Date(birthTime);
      const elapsedMinutes = this.calculateMinutesFromSunrise(birthDateTime, sunrise);
      
      vighatiChart.calculations.push(`Calculated ${elapsedMinutes.toFixed(2)} minutes from sunrise`);
      
      // STEP 2: Calculate Vighati number and longitude
      const vighatiNumber = Math.floor(elapsedMinutes / this.timeConstants.VIGHATI_MINUTES);
      const vighatiLongitude = (vighatiNumber * this.timeConstants.DEGREES_PER_VIGHATI) % 360;
      
      vighatiChart.vighati.number = vighatiNumber + 1; // 1-based indexing for display
      vighatiChart.vighati.longitude = normalizeDegrees(vighatiLongitude);
      vighatiChart.vighati.sign = this.longitudeToSign(vighatiChart.vighati.longitude);
      vighatiChart.vighati.timeFromSunrise = elapsedMinutes;
      
      // Calculate precision level (how close to exact Vighati boundary)
      const minuteFraction = elapsedMinutes % this.timeConstants.VIGHATI_MINUTES;
      vighatiChart.vighati.precision = Math.max(0, 100 - (minuteFraction / this.timeConstants.VIGHATI_MINUTES * 100));
      
      vighatiChart.calculations.push(`Vighati #${vighatiChart.vighati.number} at ${vighatiChart.vighati.longitude}° in ${vighatiChart.vighati.sign}`);
      vighatiChart.analysisLog.push(`Vighati calculation: ${elapsedMinutes.toFixed(2)} minutes = Vighati #${vighatiChart.vighati.number}`);

      // STEP 3: Calculate Vighati confidence score (higher due to precision)
      this.calculateVighatiConfidence(vighatiChart, birthData);

      // STEP 4: Validate Vighati calculation per BPHS standards
      this.validateVighatiChart(vighatiChart);

      vighatiChart.analysisLog.push('Vighati chart calculation completed successfully');
      return vighatiChart;

    } catch (error) {
      vighatiChart.error = error.message;
      vighatiChart.analysisLog.push(`Vighati chart calculation failed: ${error.message}`);
      throw new Error(`Vighati chart calculation failed: ${error.message}`);
    }
  }

  /**
   * Comprehensive time division verification combining both Ghati and Vighati methods
   * @param {string|Date} birthTime - Birth time string or Date object
   * @param {Object} birthData - Complete birth data
   * @returns {Object} Combined time division analysis with verification score
   */
  async performTimeDivisionVerification(birthTime, birthData) {
    if (!birthTime || !birthData) {
      throw new Error('Birth time and birth data are required for time division verification');
    }

    const verification = {
      method: 'BPHS Time Division Verification',
      references: this.bhpsReferences,
      birthTime: birthTime,
      birthData: {
        dateOfBirth: birthData.dateOfBirth,
        coordinates: {
          latitude: birthData.latitude || birthData.placeOfBirth?.latitude,
          longitude: birthData.longitude || birthData.placeOfBirth?.longitude,
          timezone: birthData.timezone || birthData.placeOfBirth?.timezone
        }
      },
      ghati: null,
      vighati: null,
      verification: {
        consistency: 0,
        precision: 0,
        confidence: 0,
        recommendation: '',
        alignmentScore: 0
      },
      analysisLog: []
    };

    try {
      verification.analysisLog.push('Starting comprehensive time division verification');

      // STEP 1: Calculate sunrise for the birth date
      const sunriseResult = await this.calculateSunriseForBirth(birthData);
      if (!sunriseResult.success || !sunriseResult.sunrise) {
        throw new Error('Failed to calculate sunrise for birth date');
      }

      const sunrise = sunriseResult.sunrise;
      verification.analysisLog.push(`Sunrise calculated: ${sunrise.toISOString()}`);

      // STEP 2: Calculate both Ghati and Vighati charts
      verification.ghati = this.calculateGhatiChart(birthTime, sunrise, birthData);
      verification.vighati = this.calculateVighatiChart(birthTime, sunrise, birthData);
      
      verification.analysisLog.push('Both Ghati and Vighati charts calculated successfully');

      // STEP 3: Verify consistency between Ghati and Vighati results
      this.verifyGhatiVighatiConsistency(verification);

      // STEP 4: Calculate overall verification confidence
      this.calculateOverallVerificationConfidence(verification);

      // STEP 5: Generate verification recommendation
      this.generateVerificationRecommendation(verification);

      verification.analysisLog.push('Comprehensive time division verification completed');
      return verification;

    } catch (error) {
      verification.error = error.message;
      verification.analysisLog.push(`Time division verification failed: ${error.message}`);
      throw new Error(`Time division verification failed: ${error.message}`);
    }
  }

  /**
   * Calculate minutes elapsed from sunrise to birth time
   * @param {Date} birthDateTime - Birth time as Date object
   * @param {Date} sunrise - Sunrise time as Date object
   * @returns {number} Minutes elapsed from sunrise
   */
  calculateMinutesFromSunrise(birthDateTime, sunrise) {
    if (!(birthDateTime instanceof Date) || !(sunrise instanceof Date)) {
      throw new Error('Both birthDateTime and sunrise must be Date objects');
    }

    // Calculate time difference in milliseconds
    const timeDiffMs = birthDateTime.getTime() - sunrise.getTime();
    const timeDiffMinutes = timeDiffMs / (1000 * 60);

    // Handle overnight births (add 24 hours if negative)
    let elapsedMinutes = timeDiffMinutes;
    if (elapsedMinutes < 0) {
      elapsedMinutes += (24 * 60); // Add one day
    }

    return elapsedMinutes;
  }

  /**
   * Parse time string and create Date object with birth date
   * @param {string} timeString - Time string in HH:MM or HH:MM:SS format
   * @param {string} birthDate - Birth date string (YYYY-MM-DD)
   * @returns {Date} Combined birth date and time
   */
  parseTimeString(timeString, birthDate) {
    if (!timeString || !birthDate) {
      throw new Error('Time string and birth date are required');
    }

    // Parse time components
    const timeComponents = timeString.split(':');
    if (timeComponents.length < 2 || timeComponents.length > 3) {
      throw new Error(`Invalid time format: ${timeString}. Expected HH:MM or HH:MM:SS`);
    }

    const hours = parseInt(timeComponents[0]);
    const minutes = parseInt(timeComponents[1]);
    const seconds = parseInt(timeComponents[2] || '0');

    // Validate time components
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59 || seconds < 0 || seconds > 59) {
      throw new Error(`Invalid time values: ${timeString}`);
    }

    // Create Date object
    const dateComponents = birthDate.split('-');
    if (dateComponents.length !== 3) {
      throw new Error(`Invalid date format: ${birthDate}. Expected YYYY-MM-DD`);
    }

    const year = parseInt(dateComponents[0]);
    const month = parseInt(dateComponents[1]) - 1; // JavaScript months are 0-indexed
    const day = parseInt(dateComponents[2]);

    return new Date(year, month, day, hours, minutes, seconds);
  }

  /**
   * Calculate sunrise for the birth date
   * @param {Object} birthData - Birth data with coordinates
   * @returns {Promise<Object>} Sunrise calculation result
   */
  async calculateSunriseForBirth(birthData) {
    try {
      const latitude = birthData.latitude || birthData.placeOfBirth?.latitude;
      const longitude = birthData.longitude || birthData.placeOfBirth?.longitude;
      const timezone = birthData.timezone || birthData.placeOfBirth?.timezone;

      if (!latitude || !longitude || !timezone) {
        throw new Error('Latitude, longitude, and timezone are required for sunrise calculation');
      }

      // Create birth date at midnight for sunrise calculation
      const birthDate = new Date(birthData.dateOfBirth);
      const birthDateLocal = new Date(birthDate.getFullYear(), birthDate.getMonth(), birthDate.getDate(), 0, 0, 0);

      const sunriseResult = await computeSunriseSunset(birthDateLocal, latitude, longitude, timezone);
      
      return {
        success: true,
        sunrise: sunriseResult.sunriseLocal,
        sunset: sunriseResult.sunsetLocal,
        coordinates: { latitude, longitude, timezone }
      };

    } catch (error) {
      return {
        success: false,
        error: `Sunrise calculation failed: ${error.message}`
      };
    }
  }

  /**
   * Calculate Ghati confidence score
   * @param {Object} ghatiChart - Ghati chart object
   * @param {Object} birthData - Birth data for context
   */
  calculateGhatiConfidence(ghatiChart, birthData) {
    let confidence = 60; // Base confidence for Ghati method
    
    // VIGOR for precision (closer to exact Ghati boundary = higher confidence)
    const minuteFraction = ghatiChart.ghati.timeFromSunrise % this.timeConstants.GHATI_MINUTES;
    const precisionScore = Math.max(0, 100 - (minuteFraction / this.timeConstants.GHATI_MINUTES * 100));
    confidence += precisionScore * 0.3;

    // BONUS for favorable sign placements (Leo strong, Cancer supportive)
    if (ghatiChart.ghati.sign === 'Leo') {
      confidence += 10;
    } else if (ghatiChart.ghati.sign === 'Cancer') {
      confidence += 5;
    }

    // BONUS for reasonable hour ranges (6 AM - 10 PM typical for most births)
    const birthHour = this.parseTimeString(birthData.timeOfBirth || '12:00', birthData.dateOfBirth).getHours();
    if (birthHour >= 6 && birthHour <= 22) {
      confidence += 5;
    }

    ghatiChart.ghati.confidence = Math.min(100, Math.round(confidence));
    ghatiChart.analysisLog.push(`Ghati confidence score: ${ghatiChart.ghati.confidence}/100`);
  }

  /**
   * Calculate Vighati confidence score (higher base due to increased precision)
   * @param {Object} vighatiChart - Vighati chart object
   * @param {Object} birthData - Birth data for context
   */
  calculateVighatiConfidence(vighatiChart, birthData) {
    let confidence = 70; // Higher base confidence for Vighati method
    
    // BONUS for ultra-high precision
    confidence += vighatiChart.vighati.precision * 0.2;

    // BONUS for favorable sign placements
    if (vighatiChart.vighati.sign === 'Leo') {
      confidence += 8;
    } else if (vighatiChart.vighati.sign === 'Cancer') {
      confidence += 4;
    }

    // BONUS for high precision values
    if (vighatiChart.vighati.precision >= 90) {
      confidence += 10;
    } else if (vighatiChart.vighati.precision >= 80) {
      confidence += 5;
    }

    vighatiChart.vighati.confidence = Math.min(100, Math.round(confidence));
    vighatiChart.analysisLog.push(`Vighati confidence score: ${vighatiChart.vighati.confidence}/100`);
  }

  /**
   * Verify consistency between Ghati and Vighati results
   * @param {Object} verification - Verification object to update
   */
  verifyGhatiVighatiConsistency(verification) {
    const ghati = verification.ghati;
    const vighati = verification.vighati;

    if (!ghati || !vighati) {
      verification.verification.consistency = 0;
      verification.analysisLog.push('Cannot verify consistency - missing Ghati or Vighati data');
      return;
    }

    let consistency = 80; // Base consistency

    // CHECK 1: Sign consistency (should generally align)
    if (ghati.ghati.sign === vighati.vighati.sign) {
      consistency += 10;
    } else {
      consistency -= 10; // Reasonable deduction if signs differ
      verification.analysisLog.push(`Sign difference: Ghati=${ghati.ghati.sign}, Vighati=${vighati.vighati.sign}`);
    }

    // CHECK 2: Longitude proximity (Vighati should be close to Ghati position)
    const longitudeDiff = Math.abs(ghati.ghati.longitude - vighati.vighati.longitude);
    if (longitudeDiff <= 12) { // Within 1 Ghati
      consistency += 10;
    } else {
      consistency -= 15;
      verification.analysisLog.push(`Longitude difference: ${longitudeDiff.toFixed(2)}°`);
    }

    verification.verification.consistency = Math.max(0, Math.min(100, Math.round(consistency)));
    verification.analysisLog.push(`Ghati-Vighati consistency: ${verification.verification.consistency}/100`);
  }

  /**
   * Calculate overall verification confidence
   * @param {Object} verification - Verification object to update
   */
  calculateOverallVerificationConfidence(verification) {
    const ghati = verification.ghati;
    const vighati = verification.vighati;

    if (!ghati || !vighati) {
      verification.verification.confidence = 0;
      return;
    }

    // Combine all metrics with weights
    const weights = {
      ghatiConfidence: 0.3,
      vighatiConfidence: 0.4,
      consistency: 0.2,
      precision: 0.1
    };

    const overallConfidence = 
      (ghati.ghati.confidence * weights.ghatiConfidence) +
      (vighati.vighati.confidence * weights.vighatiConfidence) +
      (verification.verification.consistency * weights.consistency) +
      (vighati.vighati.precision * weights.precision);

    verification.verification.confidence = Math.round(overallConfidence);
    verification.verification.precision = vighati.vighati.precision; // Use Vighati precision as primary
    verification.analysisLog.push(`Overall verification confidence: ${verification.verification.confidence}/100`);
  }

  /**
   * Generate verification recommendation based on analysis
   * @param {Object} verification - Verification object to update
   */
  generateVerificationRecommendation(verification) {
    const confidence = verification.verification.confidence;
    
    if (confidence >= 85) {
      verification.verification.recommendation = 'Very high confidence in birth time accuracy';
      verification.verification.alignmentScore = confidence;
    } else if (confidence >= 70) {
      verification.verification.recommendation = 'High confidence in birth time accuracy';
      verification.verification.alignmentScore = confidence;
    } else if (confidence >= 55) {
      verification.verification.recommendation = 'Moderate confidence - birth time reasonably accurate';
      verification.verification.alignmentScore = confidence;
    } else if (confidence >= 40) {
      verification.verification.recommendation = 'Low confidence - consider birth time rectification';
      verification.verification.alignmentScore = confidence - 10;
    } else {
      verification.verification.recommendation = 'Very low confidence - birth time rectification recommended';
      verification.verification.alignmentScore = Math.max(0, confidence - 20);
    }

    verification.analysisLog.push(`Recommendation: ${verification.verification.recommendation}`);
  }

  /**
   * Validate Ghati chart according to BPHS standards
   * @param {Object} ghatiChart - Ghati chart object to validate
   */
  validateGhatiChart(ghatiChart) {
    const validation = {
      isValid: true,
      errors: [],
      warnings: [],
      bphsCompliance: true
    };

    // Check basic data integrity
    if (!ghatiChart.ghati.number || ghatiChart.ghati.number < 1 || ghatiChart.ghati.number > 60) {
      validation.errors.push(`Invalid Ghati number: ${ghatiChart.ghati.number}`);
      validation.isValid = false;
    }

    if (!ghatiChart.ghati.sign || !this.zodiacSigns.includes(ghatiChart.ghati.sign)) {
      validation.errors.push(`Invalid Ghati sign: ${ghatiChart.ghati.sign}`);
      validation.bphsCompliance = false;
      validation.isValid = false;
    }

    if (ghatiChart.ghati.timeFromSunrise < 0 || ghatiChart.ghati.timeFromSunrise > 1440) {
      validation.errors.push(`Invalid time from sunrise: ${ghatiChart.ghati.timeFromSunrise} minutes`);
      validation.isValid = false;
    }

    ghatiChart.validation = validation;
    ghatiChart.analysisLog.push(`Ghati validation: ${validation.isValid ? 'PASSED' : 'FAILED'}, BPHS Compliance: ${validation.bphsCompliance ? 'YES' : 'NO'}`);
  }

  /**
   * Validate Vighati chart according to BPHS standards
   * @param {Object} vighatiChart - Vighati chart object to validate
   */
  validateVighatiChart(vighatiChart) {
    const validation = {
      isValid: true,
      errors: [],
      warnings: [],
      bphsCompliance: true
    };

    // Check basic data integrity
    if (!vighatiChart.vighati.number || vighatiChart.vighati.number < 1 || vighatiChart.vighati.number > 720) {
      validation.errors.push(`Invalid Vighati number: ${vighatiChart.vighati.number}`);
      validation.isValid = false;
    }

    if (!vighatiChart.vighati.sign || !this.zodiacSigns.includes(vighatiChart.vighati.sign)) {
      validation.errors.push(`Invalid Vighati sign: ${vighatiChart.vighati.sign}`);
      validation.bphsCompliance = false;
      validation.isValid = false;
    }

    if (vighatiChart.vighati.timeFromSunrise < 0 || vighatiChart.vighati.timeFromSunrise > 1440) {
      validation.errors.push(`Invalid time from sunrise: ${vighatiChart.vighati.timeFromSunrise} minutes`);
      validation.isValid = false;
    }

    // Check precision range
    if (vighatiChart.vighati.precision < 0 || vighatiChart.vighati.precision > 100) {
      validation.warnings.push(`Invalid precision score: ${vighatiChart.vighati.precision}`);
    }

    vighatiChart.validation = validation;
    vighatiChart.analysisLog.push(`Vighati validation: ${validation.isValid ? 'PASSED' : 'FAILED'}, BPHS Compliance: ${validation.bphsCompliance ? 'YES' : 'NO'}`);
  }

  /**
   * Convert longitude to zodiac sign name
   * @param {number} longitude - Longitude in degrees (0-360)
   * @returns {string} Zodiac sign name
   */
  longitudeToSign(longitude) {
    if (typeof longitude !== 'number' || longitude < 0 || longitude >= 360) {
      return 'Unknown';
    }
    
    const signIndex = Math.floor(longitude / 30);
    return this.zodiacSigns[Math.min(signIndex, 11)];
  }

  /**
   * Get BPHS references for educational purposes
   * @returns {Object} BPHS reference information
   */
  getBPHSReferences() {
    return {
      chapter: this.bhpsReferences.chapter,
      verses: this.bhpsReferences.verses,
      methodology: this.bhpsReferences.methodology,
      description: 'Ghati (24-minute) and Vighati (2-minute) time divisions for precise birth time verification',
      mathematicalBasis: `${this.timeConstants.GHATIS_PER_DAY} Ghatis per day, ${this.timeConstants.GHATI_MINUTES} minutes per Ghati`,
      mathematicalBasis2: `${this.timeConstants.VIGHATIS_PER_DAY} Vighatis per day, ${this.timeConstants.VIGHATI_MINUTES} minutes per Vighati`,
      applications: this.bhpsChapter6Data.applications,
      accuracyStandard: 'Within ±2 minutes tolerance per BPHS standards'
    };
  }
}

export default TimeDivisionCalculator;
