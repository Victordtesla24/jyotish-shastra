const HouseLordCalculator = require('../../../src/core/calculations/houses/HouseLordCalculator.js');
const { getSign, getSignName } = require('../../../src/utils/helpers/astrologyHelpers.js');

describe('HouseLordCalculator', () => {
  let calculator;

  beforeEach(() => {
    calculator = new HouseLordCalculator();
  });

  // House lords are fixed based on the sign on the house cusp.
  // The test will iterate through each possible ascendant sign and verify the lord of each of the 12 houses.
  const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  const houseLordsBySign = {
    Aries: 'Mars',
    Taurus: 'Venus',
    Gemini: 'Mercury',
    Cancer: 'Moon',
    Leo: 'Sun',
    Virgo: 'Mercury',
    Libra: 'Venus',
    Scorpio: 'Mars',
    Sagittarius: 'Jupiter',
    Capricorn: 'Saturn',
    Aquarius: 'Saturn',
    Pisces: 'Jupiter'
  };

  describe.each(signs)('For %s Ascendant', (ascendantSign) => {
    const ascendantIndex = signs.indexOf(ascendantSign);

    // Test for all 12 houses
    for (let house = 1; house <= 12; house++) {

      test(`should correctly determine the lord of house ${house}`, () => {
        const houseSignIndex = (ascendantIndex + house - 1) % 12;
        const houseSign = signs[houseSignIndex];
        const expectedLord = houseLordsBySign[houseSign];

        // Create chart object with correct ascendant structure
        const chart = {
          ascendant: {
            sign: ascendantSign,
            longitude: 15.0
          }
        };

        const houseLord = calculator.getLordOfHouse(house, chart);
        expect(houseLord).toBe(expectedLord);
      });
    }
  });

  test('should get all house lords for a chart', () => {
    const ascendantSign = 'Cancer';
    const chart = {
      ascendant: {
        sign: ascendantSign,
        longitude: 95.0
      }
    };

    const allLords = calculator.getAllHouseLords(chart);

    expect(allLords).toBeInstanceOf(Array);
    expect(allLords.length).toBe(12);
    expect(allLords[0].lord).toBe('Moon'); // 1st house (Cancer) -> Moon
    expect(allLords[1].lord).toBe('Sun');  // 2nd house (Leo) -> Sun
    expect(allLords[2].lord).toBe('Mercury'); // 3rd house (Virgo) -> Mercury
    expect(allLords[11].lord).toBe('Mercury'); // 12th house (Gemini) -> Mercury
  });

});
