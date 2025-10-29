import swisseph from 'swisseph';
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

        try {
            // CRITICAL FIX: Enhanced Swiss Ephemeris initialization based on research
            // Use absolute path resolution for better reliability
            this.ephePath = path.resolve(__dirname, '../../../../ephemeris');

            // Validate ephemeris files exist before initialization
            this.validateEphemerisFiles(this.ephePath);

            // CRITICAL FIX: Proper Swiss Ephemeris initialization sequence
            // 1. Set ephemeris path first (required before any calculations)
            swisseph.swe_set_ephe_path(this.ephePath);

            // 2. Set sidereal mode to Lahiri explicitly during initialization
            swisseph.swe_set_sid_mode(swisseph.SE_SIDM_LAHIRI || 1);

            // 3. Test Swiss Ephemeris functionality with a known date
            const testDate = 2451545.0; // J2000.0
            const testResult = swisseph.swe_houses(testDate, 28.7041, 77.1025, 'P');

            // 4. Validate that Swiss Ephemeris is working properly
            if (!testResult || typeof testResult.ascendant !== 'number' || isNaN(testResult.ascendant)) {
                throw new Error('Swiss Ephemeris test calculation failed - ephemeris not functional');
            }

            this.initialized = true;

        } catch (error) {
            throw new Error(`Swiss Ephemeris initialization failed: ${error.message}. Please ensure ephemeris files are properly configured.`);
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

        if (!this.initialized) {
            throw new Error('Swiss Ephemeris not initialized. Cannot calculate ascendant.');
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
            const tropicalResult = swisseph.swe_houses(julianDay, latitude, longitude, 'P');

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
            swisseph.swe_set_sid_mode(swisseph.SE_SIDM_LAHIRI || 1);

            // CRITICAL FIX: Swiss Ephemeris swe_get_ayanamsa_ut returns a number directly, not an object
            const ayanamsaValue = swisseph.swe_get_ayanamsa_ut(julianDay);

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
     * Calculate improved Lahiri Ayanamsa manually with more accurate formula
     * Based on research from Swiss Ephemeris documentation and Vedic astronomy
     * @param {number} julianDay - Julian day for calculation
     * @returns {number} Calculated ayanamsa value
     */
    calculateImprovedLahiriAyanamsa(julianDay) {
        // Improved Lahiri Ayanamsa calculation
        // Reference: Lahiri Committee (1956) and Swiss Ephemeris documentation

        // Base epoch: J1900.0 (JD 2415020.0) = 22°27'38.83"
        const j1900 = 2415020.0;
        const epochAyanamsa1900 = 22.4607861; // degrees at J1900.0

        // More accurate rate per year (50.2564" per year)
        const ratePerYear = 50.2564 / 3600; // arcseconds per year converted to degrees

        // Calculate years since J1900.0
        const yearsSinceEpoch = (julianDay - j1900) / 365.25;

        // Apply linear precession rate
        const baseAyanamsa = epochAyanamsa1900 + (yearsSinceEpoch * ratePerYear);

        // For 1985, this should yield approximately 23.6° which is more accurate
        // than the previous calculation that was giving incorrect values

        // Ensure the result is within reasonable bounds for the era
        const boundedAyanamsa = Math.max(15, Math.min(35, baseAyanamsa));

        return boundedAyanamsa;
    }
}

export default AscendantCalculator;

// CommonJS compatibility for Jest
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AscendantCalculator;
  module.exports.default = AscendantCalculator;
}
