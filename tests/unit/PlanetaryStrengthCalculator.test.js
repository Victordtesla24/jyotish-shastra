const PlanetaryStrengthCalculator = require('../../src/core/calculations/planetary/PlanetaryStrengthCalculator');
const TestChartFactory = require('../utils/TestChartFactory');

describe('PlanetaryStrengthCalculator', () => {
  let calculator;
  const chart = TestChartFactory.createChartWithPlanets();

  beforeEach(() => {
    calculator = new PlanetaryStrengthCalculator(chart);
  });

  describe('Naisargika Bala (Intrinsic Strength)', () => {
    test('should return correct Naisargika Bala for each planet', () => {
      expect(calculator.getNaisargikaBala('Sun')).toBe(60.0);
      expect(calculator.getNaisargikaBala('Moon')).toBe(51.42);
      expect(calculator.getNaisargikaBala('Venus')).toBe(42.85);
      expect(calculator.getNaisargikaBala('Jupiter')).toBe(34.28);
      expect(calculator.getNaisargikaBala('Mercury')).toBe(25.71);
      expect(calculator.getNaisargikaBala('Mars')).toBe(17.14);
      expect(calculator.getNaisargikaBala('Saturn')).toBe(8.57);
    });

    test('should return 0 for an unknown planet', () => {
      expect(calculator.getNaisargikaBala('Uranus')).toBe(0);
    });
  });

  describe('Dignity Calculation', () => {
    test('should correctly identify exalted planets', () => {
        const exaltedJupiterChart = TestChartFactory.createChartWithPlanets([
            { name: 'Jupiter', longitude: 95 } // Jupiter in Cancer at 5 degrees
        ]);
        const exaltedJupiterCalc = new PlanetaryStrengthCalculator(exaltedJupiterChart);
        expect(exaltedJupiterCalc.getDignity('Jupiter')).toBe('Exalted');
    });

    test('should correctly identify debilitated planets', () => {
        const debilitatedSaturnChart = TestChartFactory.createChartWithPlanets([
            { name: 'Saturn', longitude: 15 } // Saturn in Aries at 15 degrees
        ]);
        const debilitatedSaturnCalc = new PlanetaryStrengthCalculator(debilitatedSaturnChart);
        expect(debilitatedSaturnCalc.getDignity('Saturn')).toBe('Debilitated');
    });

    test('should correctly identify planets in their own sign', () => {
        const ownSignMarsChart = TestChartFactory.createChartWithPlanets([
            { name: 'Mars', longitude: 220 } // Mars in Scorpio at 10 degrees
        ]);
        const ownSignMarsCalc = new PlanetaryStrengthCalculator(ownSignMarsChart);
        expect(ownSignMarsCalc.getDignity('Mars')).toBe('Own Sign');
    });

    test('should correctly identify planets in their Moolatrikona', () => {
        const moolaSunChart = TestChartFactory.createChartWithPlanets([
            { name: 'Sun', longitude: 130 } // Sun in Leo at 10 degrees
        ]);
        const moolaSunCalc = new PlanetaryStrengthCalculator(moolaSunChart);
        expect(moolaSunCalc.getDignity('Sun')).toBe('Moolatrikona');
    });
  });

  // Placeholder tests for components to be implemented
  describe('Sthana Bala (Positional Strength)', () => {
    test.todo('should calculate Uchcha Bala for exalted planets');
    test.todo('should calculate Saptavargaja Bala based on divisional chart dignities');
    test.todo('should calculate Ojhajugmarasi Bala');
    test.todo('should calculate Kendradi Bala');
    test.todo('should calculate Drekkana Bala');
  });

  describe('Dig Bala (Directional Strength)', () => {
    test('should give maximum strength for Jupiter in 1st house', () => {
        const digBalaChart = TestChartFactory.createChartWithPlanets(
            [{ name: 'Jupiter', longitude: 15 }], { ascendant: { longitude: 10 } }
        );
        const digBalaCalc = new PlanetaryStrengthCalculator(digBalaChart);
        expect(digBalaCalc.getDigBala('Jupiter')).toBeCloseTo(60);
    });
    test.todo('should give minimum strength for Jupiter in 7th house');
    test.todo('should give maximum strength for Sun in 10th house');
  });

  describe('Kala Bala (Temporal Strength)', () => {
    test.todo('should calculate Nathonatha Bala based on birth time');
    test.todo('should calculate Paksha Bala based on lunar phase');
    test.todo('should calculate Thribhaga Bala');
    test.todo('should calculate Varsha/Masa/Vara Bala');
    test.todo('should calculate Hora Bala');
    test.todo('should calculate Ayana Bala based on declination');
  });

  describe('Chesta Bala (Motional Strength)', () => {
    test.todo('should calculate correct Chesta Bala for retrograde planets');
    test.todo('should calculate correct Chesta Bala for planets in direct motion');
  });

  describe('Drik Bala (Aspectual Strength)', () => {
    test.todo('should calculate positive Drik Bala from benefic aspects');
    test.todo('should calculate negative Drik Bala from malefic aspects');
  });

  describe('Shad Bala Total', () => {
    test.todo('should return the correct total Shad Bala and compare with required minimum');
  });

  describe('Vargottama Status', () => {
    test('should return true for a Vargottama planet', () => {
      const vargottamaChart = TestChartFactory.createChartWithPlanets(
        [{ name: 'Sun', longitude: 5 }], // Sun in Aries D1
        {
          d9: {
            planets: [{ name: 'Sun', longitude: 5 }] // Sun in Aries D9
          }
        }
      );
      const vargottamaCalc = new PlanetaryStrengthCalculator(vargottamaChart);
      expect(vargottamaCalc.isVargottama('Sun')).toBe(true);
    });

    test('should return false for a non-Vargottama planet', () => {
        const nonVargottamaChart = TestChartFactory.createChartWithPlanets(
            [{ name: 'Sun', longitude: 5 }], // Sun in Aries D1
            {
              d9: {
                planets: [{ name: 'Sun', longitude: 35 }] // Sun in Taurus D9
              }
            }
          );
          const nonVargottamaCalc = new PlanetaryStrengthCalculator(nonVargottamaChart);
          expect(nonVargottamaCalc.isVargottama('Sun')).toBe(false);
    });
  });
});
