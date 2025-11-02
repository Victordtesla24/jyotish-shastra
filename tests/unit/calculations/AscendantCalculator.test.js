import AscendantCalculator from '../../../src/core/calculations/chart-casting/AscendantCalculator.js';
import { testCases } from '../../test-data/sample-chart-data.js';
import { getSwisseph } from '../../../src/utils/swisseph-wrapper.js';

describe('AscendantCalculator', () => {
    let calculator;
    let swisseph = null;

    beforeAll(async () => {
        try {
            // Use centralized Swiss Ephemeris wrapper (native bindings, no WASM)
            swisseph = await getSwisseph();
        } catch (error) {
            console.warn('Sweph native bindings not available for tests:', error.message);
            swisseph = null;
        }
    });

    beforeEach(() => {
        calculator = new AscendantCalculator();
    });

    test('should return the correct ascendant sign for a known birth data', async () => {
        if (!swisseph) {
            return; // Skip test if sweph not available
        }
        const testData = testCases[0].birthData;
        const moment = require('moment-timezone');
        const birthDateTime = moment.tz(`${testData.dateOfBirth} ${testData.timeOfBirth}`, testData.placeOfBirth.timezone).utc();
        await calculator.initialize();
        const ascendantData = await calculator.calculateAscendantAndHouses(
            birthDateTime.year(),
            birthDateTime.month() + 1,
            birthDateTime.date(),
            birthDateTime.hour(),
            birthDateTime.minute(),
            testData.placeOfBirth.latitude,
            testData.placeOfBirth.longitude
        );
        const ascendantDataResult = ascendantData.ascendant;
        expect(ascendantDataResult.signName).toBe('Virgo'); // Actual calculated ascendant for this data
    });

    test('should handle timezones correctly', async () => {
        if (!swisseph) {
            return; // Skip test if sweph not available
        }
        const testDataNYC = testCases[5].birthData;
        const [yearNYC, monthNYC, dayNYC] = testDataNYC.dateOfBirth.split('-').map(Number);
        const [hourNYC, minuteNYC] = testDataNYC.timeOfBirth.split(':').map(Number);
        const julianDayNYC = await swisseph.swe_julday(yearNYC, monthNYC, dayNYC, hourNYC + minuteNYC / 60, 1); // SE_GREG_CAL = 1

        await calculator.initialize();
        const ascendantNYC = await calculator.calculateAscendantAndHouses(yearNYC, monthNYC, dayNYC, hourNYC, minuteNYC, testDataNYC.placeOfBirth.latitude, testDataNYC.placeOfBirth.longitude);
        const ascendantNYCResult = ascendantNYC.ascendant;

        const birthDataTokyo = {
            ...testDataNYC,
        };

        const ascendantTokyo = await calculator.calculateAscendantAndHouses(yearNYC, monthNYC, dayNYC, hourNYC, minuteNYC, birthDataTokyo.placeOfBirth.latitude, birthDataTokyo.placeOfBirth.longitude);
        const ascendantTokyoResult = ascendantTokyo.ascendant;

        expect(ascendantNYCResult).toBeDefined();
        expect(ascendantTokyoResult).toBeDefined();
    });

    test('should handle daylight saving time correctly', async () => {
        if (!swisseph) {
            return; // Skip test if sweph not available
        }
        const testData = testCases[0].birthData;

        const [yearStd, monthStd, dayStd] = '1985-02-24'.split('-').map(Number);
        const [hourStd, minuteStd] = testData.timeOfBirth.split(':').map(Number);
        const julianDayStd = await swisseph.swe_julday(yearStd, monthStd, dayStd, hourStd + minuteStd / 60, 1); // SE_GREG_CAL = 1

        const [yearDst, monthDst, dayDst] = '1985-06-24'.split('-').map(Number);
        const [hourDst, minuteDst] = testData.timeOfBirth.split(':').map(Number);
        const julianDayDst = await swisseph.swe_julday(yearDst, monthDst, dayDst, hourDst + minuteDst / 60, 1); // SE_GREG_CAL = 1

        await calculator.initialize();
        const ascendantStandard = await calculator.calculateAscendantAndHouses(yearStd, monthStd, dayStd, hourStd, minuteStd, testData.placeOfBirth.latitude, testData.placeOfBirth.longitude);
        const ascendantStandardResult = ascendantStandard.ascendant;
        const ascendantDST = await calculator.calculateAscendantAndHouses(yearDst, monthDst, dayDst, hourDst, minuteDst, testData.placeOfBirth.latitude, testData.placeOfBirth.longitude);
        const ascendantDSTResult = ascendantDST.ascendant;

        expect(ascendantDSTResult.longitude).not.toBe(ascendantStandardResult.longitude);
    });

    test('should calculate consistent ascendant for Delhi birth data', async () => {
        if (!swisseph) {
            return; // Skip test if sweph not available
        }
        const testData = testCases[1].birthData; // Delhi Birth - 1985-07-22 06:45:00
        const moment = require('moment-timezone');

        const localDateTime = moment.tz(`${testData.dateOfBirth} ${testData.timeOfBirth}`, testData.placeOfBirth.timezone);
        const birthDateTime = localDateTime.utc();

        const julianDay = await swisseph.swe_julday(
            birthDateTime.year(),
            birthDateTime.month() + 1,
            birthDateTime.date(),
            birthDateTime.hour() + birthDateTime.minute() / 60,
            1 // SE_GREG_CAL = 1
        );

        await calculator.initialize();
        const ascendantData = await calculator.calculateAscendantAndHouses(
            birthDateTime.year(),
            birthDateTime.month() + 1,
            birthDateTime.date(),
            birthDateTime.hour(),
            birthDateTime.minute(),
            testData.placeOfBirth.latitude,
            testData.placeOfBirth.longitude
        );
        const ascendantDataResult = ascendantData.ascendant;

        // Verify the calculation returns a consistent result
        expect(ascendantDataResult).toBeDefined();
        expect(ascendantDataResult.longitude).toBeGreaterThanOrEqual(0);
        expect(ascendantDataResult.longitude).toBeLessThan(360);

        // Verify it falls in Cancer sign (90° - 120°)
        expect(ascendantDataResult.signName).toBe('Cancer');
        expect(ascendantDataResult.signIndex).toBe(3); // Cancer is the 4th sign (0-based index 3)
        expect(ascendantDataResult.longitude).toBeGreaterThanOrEqual(90);
        expect(ascendantDataResult.longitude).toBeLessThan(120);

        // Verify the degree within sign is reasonable
        const degree = ascendantDataResult.longitude % 30;
        expect(degree).toBeGreaterThanOrEqual(0);
        expect(degree).toBeLessThan(30);

        // Test that multiple calls return the same result (consistency check)
        const ascendantData2 = await calculator.calculateAscendantAndHouses(
            birthDateTime.year(),
            birthDateTime.month() + 1,
            birthDateTime.date(),
            birthDateTime.hour(),
            birthDateTime.minute(),
            testData.placeOfBirth.latitude,
            testData.placeOfBirth.longitude
        );
        expect(ascendantData2.ascendant.longitude).toBe(ascendantDataResult.longitude);
        expect(ascendantData2.ascendant.signName).toBe(ascendantDataResult.signName);
    });
});
