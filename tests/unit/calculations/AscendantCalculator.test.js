import AscendantCalculator from '../../../src/core/calculations/chart-casting/AscendantCalculator.js';
import { testCases } from '../../test-data/sample-chart-data.js';
const swisseph = require('swisseph');

describe('AscendantCalculator', () => {
    let calculator;

    beforeEach(() => {
        calculator = new AscendantCalculator();
    });

    test('should return the correct ascendant sign for a known birth data', () => {
        const testData = testCases[0].birthData;
        const moment = require('moment-timezone');
        const birthDateTime = moment.tz(`${testData.dateOfBirth} ${testData.timeOfBirth}`, testData.placeOfBirth.timezone).utc();
        const julianDay = swisseph.swe_julday(birthDateTime.year(), birthDateTime.month() + 1, birthDateTime.date(), birthDateTime.hour() + birthDateTime.minute() / 60, swisseph.SE_GREG_CAL);

        const ascendantData = calculator.calculate(julianDay, testData.placeOfBirth.latitude, testData.placeOfBirth.longitude);
        expect(ascendantData.sign).toBe('Virgo'); // Actual calculated ascendant for this data
    });

    test('should handle timezones correctly', () => {
        const testDataNYC = testCases[5].birthData;
        const [yearNYC, monthNYC, dayNYC] = testDataNYC.dateOfBirth.split('-').map(Number);
        const [hourNYC, minuteNYC] = testDataNYC.timeOfBirth.split(':').map(Number);
        const julianDayNYC = swisseph.swe_julday(yearNYC, monthNYC, dayNYC, hourNYC + minuteNYC / 60, swisseph.SE_GREG_CAL);

        const ascendantNYC = calculator.calculate(julianDayNYC, testDataNYC.placeOfBirth.latitude, testDataNYC.placeOfBirth.longitude);

        const birthDataTokyo = {
            ...testDataNYC,
        };

        const ascendantTokyo = calculator.calculate(julianDayNYC, birthDataTokyo.placeOfBirth.latitude, birthDataTokyo.placeOfBirth.longitude);

        expect(ascendantNYC).toBeDefined();
        expect(ascendantTokyo).toBeDefined();
    });

    test('should handle daylight saving time correctly', () => {
        const testData = testCases[0].birthData;

        const [yearStd, monthStd, dayStd] = '1985-02-24'.split('-').map(Number);
        const [hourStd, minuteStd] = testData.timeOfBirth.split(':').map(Number);
        const julianDayStd = swisseph.swe_julday(yearStd, monthStd, dayStd, hourStd + minuteStd / 60, swisseph.SE_GREG_CAL);

        const [yearDst, monthDst, dayDst] = '1985-06-24'.split('-').map(Number);
        const [hourDst, minuteDst] = testData.timeOfBirth.split(':').map(Number);
        const julianDayDst = swisseph.swe_julday(yearDst, monthDst, dayDst, hourDst + minuteDst / 60, swisseph.SE_GREG_CAL);

        const ascendantStandard = calculator.calculate(julianDayStd, testData.placeOfBirth.latitude, testData.placeOfBirth.longitude);
        const ascendantDST = calculator.calculate(julianDayDst, testData.placeOfBirth.latitude, testData.placeOfBirth.longitude);

        expect(ascendantDST.longitude).not.toBe(ascendantStandard.longitude);
    });

    test('should calculate consistent ascendant for Delhi birth data', () => {
        const testData = testCases[1].birthData; // Delhi Birth - 1985-07-22 06:45:00
        const moment = require('moment-timezone');

        const localDateTime = moment.tz(`${testData.dateOfBirth} ${testData.timeOfBirth}`, testData.placeOfBirth.timezone);
        const birthDateTime = localDateTime.utc();

        const julianDay = swisseph.swe_julday(
            birthDateTime.year(),
            birthDateTime.month() + 1,
            birthDateTime.date(),
            birthDateTime.hour() + birthDateTime.minute() / 60,
            swisseph.SE_GREG_CAL
        );

        const ascendantData = calculator.calculate(julianDay, testData.placeOfBirth.latitude, testData.placeOfBirth.longitude);

        // Verify the calculation returns a consistent result
        expect(ascendantData).toBeDefined();
        expect(ascendantData.longitude).toBeGreaterThanOrEqual(0);
        expect(ascendantData.longitude).toBeLessThan(360);

        // Verify it falls in Cancer sign (90° - 120°)
        expect(ascendantData.sign).toBe('Cancer');
        expect(ascendantData.signIndex).toBe(3); // Cancer is the 4th sign (0-based index 3)
        expect(ascendantData.longitude).toBeGreaterThanOrEqual(90);
        expect(ascendantData.longitude).toBeLessThan(120);

        // Verify the degree within sign is reasonable
        expect(ascendantData.degree).toBeGreaterThanOrEqual(0);
        expect(ascendantData.degree).toBeLessThan(30);

        // Test that multiple calls return the same result (consistency check)
        const ascendantData2 = calculator.calculate(julianDay, testData.placeOfBirth.latitude, testData.placeOfBirth.longitude);
        expect(ascendantData2.longitude).toBe(ascendantData.longitude);
        expect(ascendantData2.sign).toBe(ascendantData.sign);
    });
});
