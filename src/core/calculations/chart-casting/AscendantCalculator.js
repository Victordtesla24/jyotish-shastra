// Production-grade Swiss Ephemeris import - no fallbacks
let swisseph = null;
let swissephAvailable = false;

(async () => {
  try {
    const swissephModule = await import('swisseph');
    swisseph = swissephModule.default || swissephModule;
    swissephAvailable = true;
  } catch (error) {
    swissephAvailable = false;
    throw new Error(`Swiss Ephemeris is required for AscendantCalculator but not available: ${error.message}. Please ensure swisseph module is properly installed and ephemeris files are configured.`);
  }
})();

import { getSign, getSignName, getSignId } from '../../../utils/helpers/astrologyHelpers.js';
import path from 'path';
import fs from 'fs';

// Cross-environment directory resolution
// In Jest (CommonJS): Uses current working directory + relative path
// In Node.js (ES modules): Falls back to CWD resolution
const __dirname = path.resolve(process.cwd(), 'src/core/calculations/chart-casting');

/**
 * Swiss Ephemeris House Calculator with proper initialization
 * Based on astro.com documentation and Node.js best practices
 */
class AscendantCalculator {
    constructor(ayanamsa = 'LAHIRI') {
        this.ayanamsaType = ayanamsa;
        this.initialized = false;
        this.ephePath = null;
        this.swisseph = swisseph;
        this.swissephAvailable = swissephAvailable;

        try {
            if (!this.swissephAvailable) {
                throw new Error('Swiss Ephemeris is required but not available. Please ensure Swiss Ephemeris is properly installed and configured.');
            }

            // CRITICAL FIX: Enhanced Swiss Ephemeris initialization based on research
            // Use absolute path resolution for better reliability in both local and serverless environments
            this.ephePath = path.resolve(process.cwd(), 'ephemeris');

            // Validate ephemeris files exist before initialization
            this.validateEphemerisFiles(this.ephePath);

            // CRITICAL FIX: Proper Swiss Ephemeris initialization sequence
            // 1. Set ephemeris path first (required before any calculations)
            this.swisseph.swe_set_ephe_path(this.ephePath);

            // 2. Set sidereal mode to Lahiri explicitly during initialization
            this.swisseph.swe_set_sid_mode(this.swisseph.SE_SIDM_LAHIRI || 1);

            // 3. Test Swiss Ephemeris functionality with a known date
            const testDate = 2451545.0; // J2000.0
            const testResult = this.swisseph.swe_houses(testDate, 28.7041, 77.1025, 'P');

            // 4. Validate that Swiss Ephemeris is working properly
            if (!testResult || typeof testResult.ascendant !== 'number' || isNaN(testResult.ascendant)) {
                throw new Error('Swiss Ephemeris test calculation failed - ephemeris not functional');
            }

            this.initialized = true;

        } catch (error) {
            this.initialized = false;
            throw new Error(`Swiss Ephemeris initialization failed: ${error.message}. Please ensure Swiss Ephemeris is properly installed and ephemeris files are configured.`);
        }
    }

    /**
     * PRODUCTION-GRADE: Validate ephemeris files exist
     * Based on research: Swiss Ephemeris requires proper data files for house calculations
     */
    validateEphemerisFiles(ephePath) {
        try {
            // Check if ephemeris directory exists
            if (!fs.existsSync(ephePath)) {
                throw new Error(`Ephemeris directory not found: ${ephePath}`);
            }

            // Check for essential ephemeris files for current date range
            const essentialFiles = ['sepl_18.se1', 'semo_18.se1', 'seas_18.se1']; // 1800-2399 CE range
            const missingFiles = [];

            for (const file of essentialFiles) {
                const filePath = path.join(ephePath, file);
                if (!fs.existsSync(filePath)) {
                    missingFiles.push(file);
                }
            }

            if (missingFiles.length > 0) {
                throw new Error(`Missing ephemeris files: ${missingFiles.join(', ')}`);
            }

            // Verify file sizes are reasonable (not corrupted)
            for (const file of essentialFiles) {
                const filePath = path.join(ephePath, file);
                const stats = fs.statSync(filePath);
                if (stats.size < 1000) { // Files should be much larger than 1KB
                    throw new Error(`Ephemeris file ${file} appears to be corrupted (size: ${stats.size} bytes)`);
                }
            }

        } catch (error) {
            throw new Error(`Ephemeris validation failed: ${error.message}`);
        }
    }

    calculate(julianDay, latitude, longitude) {
        if (julianDay === undefined || latitude === undefined || longitude === undefined) {
            throw new Error('Julian day, latitude, and longitude are required to calculate the ascendant.');
        }

        // PRODUCTION-GRADE: Enhanced coordinate validation
        if (!this.validateCoordinates(latitude, longitude)) {
            throw new Error(`Invalid coordinates: latitude=${latitude}, longitude=${longitude}`);
        }

        if (!this.initialized || !this.swissephAvailable || !this.swisseph || typeof this.swisseph.swe_houses !== 'function') {
            throw new Error('Swiss Ephemeris is required for ascendant calculations but is not available or not initialized. Please ensure Swiss Ephemeris is properly installed and configured.');
        }

        try {
            return this.calculateUsingSwissEphemeris(julianDay, latitude, longitude);
        } catch (error) {
            throw new Error(`Ascendant calculation failed: ${error.message}`);
        }
    }

    /**
     * PRODUCTION-GRADE: Enhanced coordinate validation
     */
    validateCoordinates(latitude, longitude) {
        return (
            typeof latitude === 'number' &&
            typeof longitude === 'number' &&
            latitude >= -90 && latitude <= 90 &&
            longitude >= -180 && longitude <= 180 &&
            !isNaN(latitude) && !isNaN(longitude)
        );
    }


    /**
     * CRITICAL FIX: Calculate using Swiss Ephemeris with proper error handling
     * Based on astro.com documentation for house calculations
     */
    calculateUsingSwissEphemeris(julianDay, latitude, longitude) {
        try {
            // CRITICAL FIX: Enhanced Swiss Ephemeris house calculation
            // Use Placidus house system ('P') - most reliable according to documentation
            if (!this.swissephAvailable) {
                throw new Error('Swiss Ephemeris calculations are not available');
            }
            const tropicalResult = this.swisseph.swe_houses(julianDay, latitude, longitude, 'P');

            // CRITICAL FIX: Enhanced error detection and handling
            if (tropicalResult && tropicalResult.error) {
                throw new Error(`Swiss Ephemeris house calculation error: ${tropicalResult.error}`);
            }

            if (!tropicalResult ||
                typeof tropicalResult.ascendant !== 'number' ||
                isNaN(tropicalResult.ascendant) ||
                tropicalResult.ascendant < 0 ||
                tropicalResult.ascendant >= 360) {
                throw new Error('Invalid or out-of-range result from Swiss Ephemeris house calculation');
            }

            const tropicalAscendant = tropicalResult.ascendant;

            // CRITICAL FIX: Use proper ayanamsa calculation
            const ayanamsa = this.getAccurateLahiriAyanamsa(julianDay);

            if (typeof ayanamsa !== 'number' || isNaN(ayanamsa)) {
                throw new Error('Invalid ayanamsa calculation');
            }

            let siderealAscendant = tropicalAscendant - ayanamsa;

            // CRITICAL FIX: Proper normalization to 0-360 range
            while (siderealAscendant < 0) {
                siderealAscendant += 360;
            }
            siderealAscendant = siderealAscendant % 360;

            const signInfo = getSign(siderealAscendant);

            if (!signInfo || typeof signInfo.signIndex !== 'number') {
                throw new Error('Invalid sign calculation result');
            }

            return {
                longitude: siderealAscendant,
                sign: getSignName(signInfo.signIndex),
                signId: getSignId(signInfo.signIndex),
                signIndex: signInfo.signIndex,
                degree: signInfo.degreeInSign,
            };

        } catch (error) {
            throw new Error(`Swiss Ephemeris calculation failed: ${error.message}`);
        }
    }


    /**
     * Get accurate Lahiri Ayanamsa using improved calculation
     * @param {number} julianDay - Julian day for calculation
     * @returns {number} Ayanamsa value in degrees
     */
    getAccurateLahiriAyanamsa(julianDay) {
        if (!this.initialized) {
            throw new Error('Swiss Ephemeris not initialized. Cannot calculate ayanamsa.');
        }

        try {
            // Set sidereal mode to Lahiri explicitly
            if (!this.swissephAvailable) {
                throw new Error('Swiss Ephemeris calculations are not available');
            }
            this.swisseph.swe_set_sid_mode(this.swisseph.SE_SIDM_LAHIRI || 1);

            // CRITICAL FIX: Swiss Ephemeris swe_get_ayanamsa_ut returns a number directly, not an object
            const ayanamsaValue = this.swisseph.swe_get_ayanamsa_ut(julianDay);

            // Validate the returned value
            if (typeof ayanamsaValue !== 'number' ||
                isNaN(ayanamsaValue) ||
                ayanamsaValue < 10 ||
                ayanamsaValue > 30) {
                throw new Error(`Invalid ayanamsa value from Swiss Ephemeris: ${ayanamsaValue}`);
            }

            return ayanamsaValue;
        } catch (error) {
            throw new Error(`Ayanamsa calculation failed: ${error.message}`);
        }
    }


    /**
     * Calculate local sidereal time for given Julian Day and longitude
     * Helper function for internal calculations (used with Swiss Ephemeris)
     * @param {number} julianDay - Julian Day Number
     * @param {number} longitude - Longitude in degrees (positive East)
     * @returns {number} Local Sidereal Time in degrees
     */
    calculateLocalSiderealTime(julianDay, longitude) {
        // This is a helper function used WITH Swiss Ephemeris calculations, not as a fallback
        // Swiss Ephemeris is required for all ascendant calculations - this is just a mathematical helper
        
        // Calculate Julian centuries from J2000.0
        const t = (julianDay - 2451545.0) / 36525.0;

        // Calculate Greenwich Mean Sidereal Time (GMST) in degrees
        // Formula: GMST = 280.46061837 + 360.98564736629 * (JD - 2451545.0) + 0.000387933 * T^2 - T^3 / 38710000
        const gmstDegrees = 280.46061837 + 
                            360.98564736629 * (julianDay - 2451545.0) + 
                            0.000387933 * t * t - 
                            (t * t * t) / 38710000;

        // Convert to local sidereal time by adding longitude
        let lstDegrees = gmstDegrees + longitude;

        // Normalize to 0-360 range
        while (lstDegrees < 0) {
            lstDegrees += 360;
        }
        lstDegrees = lstDegrees % 360;

        return lstDegrees;
    }

}

export default AscendantCalculator;

// CommonJS compatibility for Jest
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AscendantCalculator;
  module.exports.default = AscendantCalculator;
}
