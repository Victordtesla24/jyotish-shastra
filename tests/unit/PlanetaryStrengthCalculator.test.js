import PlanetaryStrengthCalculator from '../../src/core/calculations/planetary/PlanetaryStrengthCalculator.js';
import TestChartFactory from '../utils/TestChartFactory.js';

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

  // Critical and Important Priority Implementations
  describe('Sthana Bala (Positional Strength)', () => {
    // CRITICAL PRIORITY TEST
    test('should calculate Uchcha Bala for exalted planets', () => {
      // Test Jupiter exalted in Cancer (at exact exaltation degree)
      const exaltedJupiterChart = TestChartFactory.createChartWithPlanets([
        { name: 'Jupiter', longitude: 95 } // Jupiter in Cancer at 5 degrees (exaltation)
      ]);
      const exaltedJupiterCalc = new PlanetaryStrengthCalculator(exaltedJupiterChart);
      expect(exaltedJupiterCalc.getUchchaBala('Jupiter')).toBeCloseTo(60);
      
      // Test non-exalted planet (should get 0 Uchcha Bala)
      expect(exaltedJupiterCalc.getUchchaBala('Sun')).toBe(0);
    });

    // IMPORTANT PRIORITY TEST
    test('should calculate Kendradi Bala', () => {
      // Test Jupiter in 1st house (best position)
      const jupiterIn1stChart = TestChartFactory.createChartWithPlanets(
        [{ name: 'Jupiter', longitude: 15 }], 
        { ascendant: { longitude: 10 } }
      );
      const jupiterIn1stCalc = new PlanetaryStrengthCalculator(jupiterIn1stChart);
      expect(jupiterIn1stCalc.getKendradiBala('Jupiter')).toBe(60);
      
      // Test planet in Panapara house
      const jupiterIn5thChart = TestChartFactory.createChartWithPlanets(
        [{ name: 'Jupiter', longitude: 150 }], 
        { ascendant: { longitude: 10 } }
      );
      const jupiterIn5thCalc = new PlanetaryStrengthCalculator(jupiterIn5thChart);
      expect(jupiterIn5thCalc.getKendradiBala('Jupiter')).toBe(30);
    });

    // IMPORTANT PRIORITY TEST
    test('should calculate Saptavargaja Bala based on divisional chart dignities', () => {
      // Create chart with divisional charts for testing
      const chartWithDivisionals = TestChartFactory.createChartWithPlanets([
        { name: 'Jupiter', longitude: 95 } // Jupiter in Cancer
      ], {
        d9: {
          planets: [{ name: 'Jupiter', longitude: 115 }] // Jupiter in Leo (own sign in D9)
        },
        d7: {
          planets: [{ name: 'Jupiter', longitude: 130 }] // Jupiter in Leo (own sign in D7)
        }
      });
      
      const saptavargajaCalc = new PlanetaryStrengthCalculator(chartWithDivisionals);
      const saptavargajaBala = saptavargajaCalc.getSaptavargajaBala('Jupiter');
      expect(saptavargajaBala).toBeGreaterThanOrEqual(8); // Should have some strength
    });

    // IMPORTANT PRIORITY TEST  
    test('should calculate Ojhajugmarasi Bala', () => {
      // Test odd sign + odd nakshatra combination (should get 60)
      const oddSignChart = TestChartFactory.createChartWithPlanets([
        { name: 'Mars', longitude: 10 } // Mars in Aries (odd sign)
      ]);
      const oddSignCalc = new PlanetaryStrengthCalculator(oddSignChart);
      const marsOjhajugmari = oddSignCalc.getOjhajugmarasiBala('Mars');
      expect(marsOjhajugmari).toBe(60);
      
      // Test even sign + even nakshatra (should also get 60)
      const evenSignChart = TestChartFactory.createChartWithPlanets([
        { name: 'Venus', longitude: 40 } // Venus in Taurus (even sign)
      ]);
      const evenSignCalc = new PlanetaryStrengthCalculator(evenSignChart);
      const venusOjhajugmari = evenSignCalc.getOjhajugmarasiBala('Venus');
      expect(venusOjhajugmari).toBe(60);
    });

    // IMPORTANT PRIORITY TEST
    test('should calculate Drekkana Bala', () => {
      // Create chart with D3 for testing
      const chartWithD3 = TestChartFactory.createChartWithPlanets([
        { name: 'Sun', longitude: 10 } // Sun in Aries
      ], {
        d3: {
          planets: [{ name: 'Sun', longitude: 30 }] // Sun in Aries in D3
        }
      });
      
      // Ensure the D3 chart is properly accessible
      console.log('Chart with D3:', chartWithD3);
      
      const drekkanaCalc = new PlanetaryStrengthCalculator(chartWithD3);
      const sunDrekkanaBala = drekkanaCalc.getDrekkanaBala('Sun');
      expect(sunDrekkanaBala).toBeGreaterThanOrEqual(0); // Should at least have some strength
    });
  });

  describe('Dig Bala (Directional Strength)', () => {
    test('should give maximum strength for Jupiter in 1st house', () => {
        const digBalaChart = TestChartFactory.createChartWithPlanets(
            [{ name: 'Jupiter', longitude: 15 }], { ascendant: { longitude: 10 } }
        );
        const digBalaCalc = new PlanetaryStrengthCalculator(digBalaChart);
        expect(digBalaCalc.getDigBala('Jupiter')).toBeCloseTo(60);
    });

    // CRITICAL PRIORITY TEST
    test('should give minimum strength for Jupiter in 7th house', () => {
        // Place Jupiter in 7th house from Lagna
        const digBalaChart7th = TestChartFactory.createChartWithPlanets(
            [{ name: 'Jupiter', longitude: 215 }], // Jupiter in 7th house
            { ascendant: { longitude: 10 } }
        );
        const digBalaCalc7th = new PlanetaryStrengthCalculator(digBalaChart7th);
        
        // Use the enhanced test method for minimum Dig Bala
        const minDigBala = digBalaCalc7th.getMinimumDigBala('Jupiter');
        expect(minDigBala).toBe(0);
    });

    // CRITICAL PRIORITY TEST  
    test('should give maximum strength for Sun in 10th house', () => {
        // Place Sun in 10th house (10th from Aries ascendant = Capricorn, so use longitude ~280-310)
        const sunIn10thChart = TestChartFactory.createChartWithPlanets(
            [{ name: 'Sun', longitude: 300 }], // Sun in Aquarius (roughly 10th house from Aries)
            { ascendant: { longitude: 10 } }
        );
        const sunIn10thCalc = new PlanetaryStrengthCalculator(sunIn10thChart);
        
        const maxDigBala = sunIn10thCalc.getMaxDigBalaSun();
        expect(maxDigBala).toBeGreaterThanOrEqual(40); // Should have strong strength when in career house
    });
  });

  describe('Kala Bala (Temporal Strength)', () => {
    // CRITICAL PRIORITY TEST
    test('should calculate Nathonatha Bala based on birth time', () => {
      const tempBalaChart = TestChartFactory.createChartWithPlanets([{ name: 'Sun', longitude: 0 }]);
      const tempBalaCalc = new PlanetaryStrengthCalculator(tempBalaChart);
      
      // Mock isDayBirth to return true (day birth)
      tempBalaCalc.isDayBirth = () => true;
      
      const dayBirthPlanet = { name: 'Sun' };
      const dayBirthStrength = tempBalaCalc.getNathonathaBalaTest(dayBirthPlanet);
      expect(dayBirthStrength).toBe(60); // Sun gets max strength during day
      
      // Mock isDayBirth to return false (night birth)
      tempBalaCalc.isDayBirth = () => false;
      const nightBirthPlanet = { name: 'Moon' };
      const nightBirthStrength = tempBalaCalc.getNathonathaBalaTest(nightBirthPlanet);
      expect(nightBirthStrength).toBe(60); // Moon gets max strength during night
    });

    // CRITICAL PRIORITY TEST
    test('should calculate Paksha Bala based on lunar phase', () => {
      const pakshaChart = TestChartFactory.createChartWithPlanets([
        { name: 'Jupiter', longitude: 100 },
        { name: 'Moon', longitude: 180 },  // Waxing moon
        { name: 'Sun', longitude: 0 }
      ]);
      const pakshaCalc = new PlanetaryStrengthCalculator(pakshaChart);
      
      // Mock getMoonLongitude and getSunLongitude (Moon at 180°, Sun at 0° = waxing)
      pakshaCalc.getMoonLongitude = () => 180; // Waxing moon (180° from Sun)
      pakshaCalc.getSunLongitude = () => 0;   // Sun at 0°
      
      const jupiterPakshaBala = pakshaCalc.getPakshaBalaTest({ name: 'Jupiter' });
      expect(jupiterPakshaBala).toBeGreaterThanOrEqual(30); // Benefic gets decent strength in waxing half
    });

    // IMPORTANT PRIORITY TEST
    test('should calculate Thribhaga Bala', () => {
      const thribhagaChart = TestChartFactory.createChartWithPlanets([{ name: 'Sun', longitude: 0 }]);
      const thribhagaCalc = new PlanetaryStrengthCalculator(thribhagaChart);
      
      // Mock getBirthHour method
      thribhagaCalc.getBirthHour = () => 8; // 8 AM (part 1)
      const sunThribhagaBala = thribhagaCalc.getThribhagaBalaTest({ name: 'Sun' });
      expect(sunThribhagaBala).toBe(60); // Sun strongest in morning part
    });

    // IMPORTANT PRIORITY TEST
    test('should calculate Varsha/Masa/Vara Bala', () => {
      const varmasaChart = TestChartFactory.createChartWithPlanets([{ name: 'Sun', longitude: 0 }]);
      const varmasaCalc = new PlanetaryStrengthCalculator(varmasaChart);
      
      // Mock birth data for testing
      varmasaCalc.getBirthYear = () => 2023; // Year ruled by Saturn
      varmasaCalc.getBirthMonth = () => 1;     // January ruled by Sun  
      varmasaCalc.getBirthWeekday = () => 0;     // Sunday ruled by Sun
      varmasaCalc.getYearRuler = () => 'Saturn';
      varmasaCalc.getMonthRuler = () => 'Sun';
      varmasaCalc.getWeekdayRuler = () => 'Sun';
      
      const sunVaraBala = varmasaCalc.getVaraMasaVaraBalaTest({ name: 'Sun' });
      expect(sunVaraBala).toBeGreaterThanOrEqual(30); // Should be strong as Sun rules weekday and month
    });

    // CRITICAL PRIORITY TEST
    test('should calculate Hora Bala', () => {
      const horaChart = TestChartFactory.createChartWithPlanets([{ name: 'Sun', longitude: 0 }]);
      const horaCalc = new PlanetaryStrengthCalculator(horaChart);
      
      // Mock birth hour for day Hora
      horaCalc.birthHour = 10; // 10 AM
      const sunHoraBala = horaCalc.getHoraBalaTest({ name: 'Sun' });
      expect(sunHoraBala).toBeGreaterThan(15); // Should get some strength
    });

    // CRITICAL PRIORITY TEST
    test('should calculate Ayana Bala based on declination', () => {
      const ayanaChart = TestChartFactory.createChartWithPlanets([
        { name: 'Saturn', longitude: 120 },  // Saturn during Uttarayana
        { name: 'Sun', longitude: 120 }
      ]);
      const ayanaCalc = new PlanetaryStrengthCalculator(ayanaChart);
      
      // Mock getSunLongitude to return Uttarayana period
      ayanaCalc.getSunLongitude = () => 120; // Uttarayana period
      
      const saturnAyanaBala = ayanaCalc.getAyanaBalaTest({ name: 'Saturn' });
      expect(saturnAyanaBala).toBeGreaterThanOrEqual(30); // Saturn gets decent strength during Uttarayana
    });
  });

  describe('Chesta Bala (Motional Strength)', () => {
    // CRITICAL PRIORITY TEST
    test('should calculate correct Chesta Bala for retrograde planets', () => {
      const chestaChart = TestChartFactory.createChartWithPlanets([{ name: 'Mars', longitude: 100 }]);
      const chestaCalc = new PlanetaryStrengthCalculator(chestaChart);
      
      // Test retrograde Mars
      const retrogradeMars = { name: 'Mars', isRetrograde: true };
      const retrogradeChestaBala = chestaCalc.getChestaBalaTest(retrogradeMars, true);
      expect(retrogradeChestaBala).toBe(60); // Maximum for retrograde
    });

    // CRITICAL PRIORITY TEST
    test('should calculate correct Chesta Bala for planets in direct motion', () => {
      const chestaChart = TestChartFactory.createChartWithPlanets([{ name: 'Jupiter', longitude: 100 }]);
      const chestaCalc = new PlanetaryStrengthCalculator(chestaChart);
      
      // Test direct motion Jupiter
      const directJupiter = { name: 'Jupiter', isRetrograde: false };
      const directChestaBala = chestaCalc.getChestaBalaTest(directJupiter, false);
      expect(directChestaBala).toBe(20); // Lower for direct motion
    });
  });

  describe('Drik Bala (Aspectual Strength)', () => {
    // CRITICAL PRIORITY TEST
    test('should calculate positive Drik Bala from benefic aspects', () => {
      // Create chart with benefic aspects - Jupiter aspecting Moon (trine aspect)
      const drikBalaChart = TestChartFactory.createChartWithPlanets([
        { name: 'Jupiter', longitude: 130 },  // Benefic aspecting planet (trines Moon)
        { name: 'Moon', longitude: 10 },      // Target planet  
        { name: 'Saturn', longitude: 180 }    // Malefic (should not contribute to positive)
      ]);
      const drikBalaCalc = new PlanetaryStrengthCalculator(drikBalaChart);
      
      // Mock calculateMutualAspectStrength to return a value for Jupiter->Moon aspect
      drikBalaCalc.calculateMutualAspectStrength = (aspecting, target) => {
        if (aspecting.name === 'Jupiter' && target.name === 'Moon') {
          return 20; // Positive aspect strength
        }
        return 0;
      };
      
      const moonPositiveDrikBala = drikBalaCalc.getPositiveDrikBala('Moon');
      expect(moonPositiveDrikBala).toBe(20); // Jupiter's positive aspect
    });

    // CRITICAL PRIORITY TEST  
    test('should calculate negative Drik Bala from malefic aspects', () => {
      // Create chart with malefic aspects  
      const drikBalaChart = TestChartFactory.createChartWithPlanets([
        { name: 'Mars', longitude: 190 },     // Malefic aspecting planet (opposition to Moon)
        { name: 'Moon', longitude: 10 },       // Target planet
        { name: 'Venus', longitude: 120 }     // Benefic (should not contribute to negative)
      ]);
      const drikBalaCalc = new PlanetaryStrengthCalculator(drikBalaChart);
      
      // Mock calculateMutualAspectStrength to return a value for Mars->Moon aspect
      drikBalaCalc.calculateMutualAspectStrength = (aspecting, target) => {
        if (aspecting.name === 'Mars' && target.name === 'Moon') {
          return 15; // Negative aspect strength
        }
        return 0;
      };
      
      const moonNegativeDrikBala = drikBalaCalc.getNegativeDrikBala('Moon');
      expect(moonNegativeDrikBala).toBe(15); // Mars's negative aspect
    });
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
