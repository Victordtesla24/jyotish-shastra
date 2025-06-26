const swisseph = require('swisseph');
const { getSign, getSignName } = require('../../../utils/helpers/astrologyHelpers');

class AscendantCalculator {
    constructor(ayanamsa = 'LAHIRI') {
        this.ayanamsaType = ayanamsa;
        this.initialized = false;

        try {
            // Set the path to the ephemeris files. This is crucial.
            swisseph.swe_set_ephe_path(__dirname + '/../../../../ephemeris');
            this.initialized = true;
        } catch (error) {
            // Suppress console warnings in test environment or when ephemeris is missing
            if (process.env.NODE_ENV !== 'test') {
                console.warn('Swiss Ephemeris ephemeris path warning:', error.message);
            }
        }
    }

    calculate(julianDay, latitude, longitude) {
        if (julianDay === undefined || latitude === undefined || longitude === undefined) {
            throw new Error('Julian day, latitude, and longitude are required to calculate the ascendant.');
        }

        try {
            // 1. Calculate tropical ascendant first. We do not use SEFLG_SIDEREAL here.
            const tropicalResult = swisseph.swe_houses(julianDay, latitude, longitude, 'P');

            if (tropicalResult.error) {
                throw new Error(`Swiss Ephemeris error (Tropical): ${tropicalResult.error}`);
            }

            if (tropicalResult && typeof tropicalResult.ascendant === 'number') {
                const tropicalAscendant = tropicalResult.ascendant;

                // 2. Get accurate Ayanamsa for the specific Julian day
                const ayanamsa = this.getAccurateLahiriAyanamsa(julianDay);

                // 3. Subtract Ayanamsa to get the Sidereal longitude
                let siderealAscendant = tropicalAscendant - ayanamsa;

                // 4. Normalize the longitude to be within 0-360 degrees
                if (siderealAscendant < 0) {
                    siderealAscendant += 360;
                }
                siderealAscendant %= 360;

                const signInfo = getSign(siderealAscendant);

                return {
                    longitude: siderealAscendant,
                    sign: getSignName(signInfo.signIndex),
                    signIndex: signInfo.signIndex,
                    degree: signInfo.degreeInSign,
                };
            } else {
                throw new Error('Failed to calculate ascendant: Invalid result from Swiss Ephemeris.');
            }
        } catch (error) {
            // Re-throw the error to be handled by the calling service
            throw new Error(`Ascendant calculation failed: ${error.message}`);
        }
    }

    /**
     * Get accurate Lahiri Ayanamsa using improved calculation
     * @param {number} julianDay - Julian day for calculation
     * @returns {number} Ayanamsa value in degrees
     */
    getAccurateLahiriAyanamsa(julianDay) {
        try {
            // First attempt: Use Swiss Ephemeris with proper Lahiri mode
            if (this.initialized) {
                // Set sidereal mode to Lahiri explicitly
                swisseph.swe_set_sid_mode(swisseph.SE_SIDM_LAHIRI || 1);

                const ayanamsaResult = swisseph.swe_get_ayanamsa_ut(julianDay);

                if (!ayanamsaResult.error &&
                    typeof ayanamsaResult.ayanamsa === 'number' &&
                    !isNaN(ayanamsaResult.ayanamsa) &&
                    ayanamsaResult.ayanamsa >= 10 &&
                    ayanamsaResult.ayanamsa <= 30) { // Reasonable bounds for modern era
                    return ayanamsaResult.ayanamsa;
                }
            }

            // Fallback: Use improved manual Lahiri calculation
            return this.calculateImprovedLahiriAyanamsa(julianDay);

        } catch (error) {
            // Ultimate fallback: Use improved manual calculation
            return this.calculateImprovedLahiriAyanamsa(julianDay);
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

module.exports = AscendantCalculator;
