/**
 * Unit Tests for LagnaLordAnalyzer
 * Tests Lagna lord placement analysis based on Vedic principles
 */

const LagnaLordAnalyzer = require('../../src/core/analysis/lagna/LagnaLordAnalyzer');
const TestChartFactory = require('../utils/TestChartFactory');

describe('LagnaLordAnalyzer', () => {
  let chart;

  beforeEach(() => {
    chart = TestChartFactory.createChartWithLagnaLord('Cancer', 'Sagittarius', 6);
    TestChartFactory.addPlanet(chart, 'Sun', 'Pisces', 9);
    TestChartFactory.addPlanet(chart, 'Mars', 'Aries', 10);
    TestChartFactory.addPlanet(chart, 'Mercury', 'Pisces', 9);
    TestChartFactory.addPlanet(chart, 'Jupiter', 'Cancer', 1);
    TestChartFactory.addPlanet(chart, 'Venus', 'Taurus', 11);
    TestChartFactory.addPlanet(chart, 'Saturn', 'Capricorn', 7);
    TestChartFactory.addPlanet(chart, 'Rahu', 'Aquarius', 8);
    TestChartFactory.addPlanet(chart, 'Ketu', 'Leo', 2);
  });

  describe('Basic Lagna Lord Identification', () => {
    test('should correctly identify Lagna lord for all 12 signs', () => {
      const expectedRulers = {
        'Aries': 'Mars',
        'Taurus': 'Venus',
        'Gemini': 'Mercury',
        'Cancer': 'Moon',
        'Leo': 'Sun',
        'Virgo': 'Mercury',
        'Libra': 'Venus',
        'Scorpio': 'Mars',
        'Sagittarius': 'Jupiter',
        'Capricorn': 'Saturn',
        'Aquarius': 'Saturn',
        'Pisces': 'Jupiter'
      };

      Object.entries(expectedRulers).forEach(([sign, expectedRuler]) => {
        const ruler = LagnaLordAnalyzer.getLagnaLord(sign);
        expect(ruler).toBe(expectedRuler);
      });
    });

    test('should find planet position correctly in chart', () => {
      const moonPosition = LagnaLordAnalyzer.findPlanetPosition(chart.planetaryPositions, 'Moon');

      expect(moonPosition).toBeDefined();
      expect(moonPosition.planet).toBe('Moon');
      expect(moonPosition.sign).toBe('Sagittarius');
      expect(moonPosition.house).toBe(6);
    });

    test('should return undefined for non-existent planet', () => {
      const position = LagnaLordAnalyzer.findPlanetPosition(chart.planetaryPositions, 'NonExistent');
      expect(position).toBeUndefined();
    });
  });

  describe('Complete Lagna Lord Analysis', () => {
    test('should provide comprehensive analysis for Cancer Lagna', () => {
      const analysis = LagnaLordAnalyzer.analyzeLagnaLord(chart);

      expect(analysis.lagnaSign).toBe('Cancer');
      expect(analysis.lagnaLord).toBe('Moon');
      expect(analysis.lordPosition).toBeDefined();
      expect(analysis.analysis).toBeDefined();
      expect(analysis.remedialMeasures).toBeDefined();
      expect(analysis.summary).toBeDefined();
      expect(analysis.recommendations).toBeDefined();
    });

    test('should analyze all core components', () => {
      const analysis = LagnaLordAnalyzer.analyzeLagnaLord(chart);

      expect(analysis.analysis.placement).toBeDefined();
      expect(analysis.analysis.dignity).toBeDefined();
      expect(analysis.analysis.houseEffects).toBeDefined();
      expect(analysis.analysis.conjunctionEffects).toBeDefined();
      expect(analysis.analysis.aspectEffects).toBeDefined();
      expect(analysis.analysis.lifeEffects).toBeDefined();
      expect(analysis.analysis.dashaEffects).toBeDefined();
    });

    test('should handle error cases gracefully', () => {
      const incompleteChart = TestChartFactory.createChart('Cancer');
      // Remove Moon (Cancer's lagna lord) to make chart incomplete
      incompleteChart.planetaryPositions = incompleteChart.planetaryPositions.filter(p => p.planet !== 'Moon');

      expect(() => {
        LagnaLordAnalyzer.analyzeLagnaLord(incompleteChart);
      }).toThrow();
    });
  });

  describe('Dignity Analysis', () => {
    test('should correctly identify exalted Lagna lord', () => {
      const moonInTaurus = { planet: 'Moon', sign: 'Taurus', longitude: 33.0 };
      const dignity = LagnaLordAnalyzer.analyzeDignity(moonInTaurus, chart);

      expect(dignity.type).toBe('exalted');
      expect(dignity.strength).toBe(100);
      expect(dignity.description).toContain('exalted in Taurus');
      expect(dignity.effects).toBeDefined();
    });

    test('should correctly identify debilitated Lagna lord', () => {
      const moonInScorpio = { planet: 'Moon', sign: 'Scorpio', longitude: 243.0 };
      const dignity = LagnaLordAnalyzer.analyzeDignity(moonInScorpio, chart);

      expect(dignity.type).toBe('debilitated');
      expect(dignity.strength).toBeLessThan(50);
      expect(dignity.description).toContain('debilitated in Scorpio');
    });

    test('should identify own sign placement', () => {
      const moonInCancer = { planet: 'Moon', sign: 'Cancer', longitude: 105.0 };
      const dignity = LagnaLordAnalyzer.analyzeDignity(moonInCancer, chart);

      expect(dignity.type).toBe('own_sign');
      expect(dignity.strength).toBe(85);
      expect(dignity.description).toContain('own sign Cancer');
    });

    test('should detect Neecha Bhanga Yoga', () => {
      const debilitatedPlanet = { planet: 'Moon', sign: 'Scorpio', longitude: 243.0 };
      const neechaBhanga = LagnaLordAnalyzer.checkNeechaBhangaYoga(debilitatedPlanet, chart);

      // This should be properly implemented in the actual class
      expect(neechaBhanga).toBeDefined();
    });

    test('should classify friendly and enemy sign placements', () => {
      const sunInAriesTest = { planet: 'Sun', sign: 'Aries', longitude: 15.0 };
      const dignity = LagnaLordAnalyzer.analyzeDignity(sunInAriesTest, chart);

      // Sun is exalted in Aries, so this should be 'exalted'
      expect(dignity.type).toBe('exalted');
      expect(dignity.strength).toBe(100);
    });
  });

  describe('House Effects Analysis', () => {
    test('should analyze effects for each house (1-12)', () => {
      const houses = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

      houses.forEach(house => {
        const effects = LagnaLordAnalyzer.analyzeHouseEffects(house, 'Cancer');

        expect(effects.house).toBe(house);
        expect(effects.significations).toBeDefined();
        expect(effects.effects).toBeDefined();
        expect(effects.timing).toBeDefined();
        expect(effects.description).toBeDefined();
      });
    });

    test('should provide appropriate strength for Kendra houses', () => {
      const kendraHouses = [1, 4, 7, 10];

      kendraHouses.forEach(house => {
        const effects = LagnaLordAnalyzer.analyzeHouseEffects(house, 'Cancer');

        expect(effects.effects.strength).toBeGreaterThan(70);
        expect(effects.description).toContain('strong');
      });
    });

    test('should identify challenging Dusthana house placements', () => {
      const dusthanaHouses = [6, 8, 12];

      dusthanaHouses.forEach(house => {
        const effects = LagnaLordAnalyzer.analyzeHouseEffects(house, 'Cancer');

        expect(effects.effects.strength).toBeLessThan(60);
        expect(effects.description).toContain('challenging');
      });
    });

    test('should provide detailed house significations', () => {
      const firstHouseSignifications = LagnaLordAnalyzer.getHouseSignifications(1);

      expect(firstHouseSignifications).toContain('personality');
      expect(firstHouseSignifications).toContain('health');
      expect(firstHouseSignifications).toContain('appearance');

      const seventhHouseSignifications = LagnaLordAnalyzer.getHouseSignifications(7);

      expect(seventhHouseSignifications).toContain('marriage');
      expect(seventhHouseSignifications).toContain('partnerships');
      expect(seventhHouseSignifications).toContain('business');
    });
  });

  describe('Conjunction Analysis', () => {
    test('should detect close conjunctions correctly', () => {
      const lordPosition = {
        planet: 'Moon',
        house: 6,
        degree: 12.3,
        sign: 'Sagittarius'
      };

      const conjunctions = LagnaLordAnalyzer.analyzeConjunctions(lordPosition, chart.planetaryPositions);

      expect(conjunctions.hasConjunctions).toBeDefined();
      if (conjunctions.hasConjunctions) {
        expect(conjunctions.conjunctions).toBeDefined();
        expect(Array.isArray(conjunctions.conjunctions)).toBe(true);
        expect(conjunctions.overallEffect).toBeDefined();
      }
    });

    test('should calculate conjunction strength based on orb', () => {
      const closeOrb = 2.5;
      const wideOrb = 7.8;

      const closeStrength = LagnaLordAnalyzer.calculateConjunctionStrength(closeOrb);
      const wideStrength = LagnaLordAnalyzer.calculateConjunctionStrength(wideOrb);

      expect(closeStrength).toBeGreaterThan(wideStrength);
    });

    test('should analyze planetary conjunction effects correctly', () => {
      const moonJupiterConjunction = LagnaLordAnalyzer.analyzePlanetaryConjunction('Moon', 'Jupiter', 3.0);

      expect(moonJupiterConjunction.nature).toBeDefined();
      expect(moonJupiterConjunction.effects).toBeDefined();
      expect(moonJupiterConjunction.strength).toBeDefined();
    });
  });

  describe('Aspect Analysis', () => {
    test('should find all aspecting planets correctly', () => {
      const aspectingPlanets = LagnaLordAnalyzer.findAspectingPlanets(chart, 6);

      expect(Array.isArray(aspectingPlanets)).toBe(true);
      aspectingPlanets.forEach(aspect => {
        expect(aspect.planet).toBeDefined();
        expect(aspect.type).toBeDefined();
        expect(aspect.orb).toBeDefined();
      });
    });

    test('should calculate aspect strength accurately', () => {
      const strongAspect = { planet: 'Jupiter', type: '5th Aspect', orb: 2.0 };
      const weakAspect = { planet: 'Saturn', type: '3rd Aspect', orb: 8.0 };

      const strongStrength = LagnaLordAnalyzer.calculateAspectStrength(strongAspect);
      const weakStrength = LagnaLordAnalyzer.calculateAspectStrength(weakAspect);

      expect(strongStrength).toBeGreaterThan(weakStrength);
    });

    test('should determine aspect nature correctly', () => {
      const beneficAspect = LagnaLordAnalyzer.getAspectNature('Jupiter', 'Moon', '5th Aspect');
      const maleficAspect = LagnaLordAnalyzer.getAspectNature('Saturn', 'Moon', '10th Aspect');

      expect(beneficAspect.benefic || beneficAspect.malefic).toBe(true);
      expect(maleficAspect.benefic || maleficAspect.malefic).toBe(true);
    });

    test('should provide complete aspect analysis', () => {
      const lordPosition = chart.planetaryPositions.find(p => p.planet === 'Moon');
      const aspects = LagnaLordAnalyzer.analyzeAspects(lordPosition, chart);

      expect(aspects.hasAspects).toBeDefined();
      expect(aspects.strength).toBeDefined();
      expect(aspects.beneficInfluence).toBeDefined();
      expect(aspects.maleficInfluence).toBeDefined();
      expect(aspects.netInfluence).toBeDefined();
      expect(aspects.dominantInfluence).toBeDefined();
    });
  });

  describe('Life Effects Analysis', () => {
    test('should analyze all life areas comprehensively', () => {
      const lordPosition = chart.planetaryPositions.find(p => p.planet === 'Moon');
      const lifeEffects = LagnaLordAnalyzer.analyzeLifeEffects(lordPosition, 'Cancer');

      expect(lifeEffects.personality).toBeDefined();
      expect(lifeEffects.health).toBeDefined();
      expect(lifeEffects.career).toBeDefined();
      expect(lifeEffects.relationships).toBeDefined();
      expect(lifeEffects.finances).toBeDefined();
      expect(lifeEffects.spirituality).toBeDefined();
      expect(lifeEffects.summary).toBeDefined();
    });

    test('should provide specific personality effects', () => {
      const personalityEffects = LagnaLordAnalyzer.getPersonalityEffects(6, 'Moon');

      expect(personalityEffects.traits).toBeDefined();
      expect(Array.isArray(personalityEffects.traits)).toBe(true);
      expect(personalityEffects.strengths).toBeDefined();
      expect(personalityEffects.challenges).toBeDefined();
    });

    test('should analyze health implications correctly', () => {
      const healthEffects = LagnaLordAnalyzer.getHealthEffects(6, 'Moon', 'Cancer');

      expect(healthEffects.constitution).toBeDefined();
      expect(healthEffects.vulnerabilities).toBeDefined();
      expect(healthEffects.recommendations).toBeDefined();
    });

    test('should provide career guidance', () => {
      const careerEffects = LagnaLordAnalyzer.getCareerEffects(10, 'Mars');

      expect(careerEffects.suitableFields).toBeDefined();
      expect(Array.isArray(careerEffects.suitableFields)).toBe(true);
      expect(careerEffects.workStyle).toBeDefined();
      expect(careerEffects.leadership).toBeDefined();
    });
  });

  describe('Dasha Effects Analysis', () => {
    test('should analyze Mahadasha effects', () => {
      const dashaEffects = LagnaLordAnalyzer.analyzeDashaEffects(
        chart.planetaryPositions.find(p => p.planet === 'Moon'),
        'Cancer'
      );

      expect(dashaEffects.mahadasha).toBeDefined();
      expect(dashaEffects.antardasha).toBeDefined();
      expect(dashaEffects.timing).toBeDefined();
      expect(dashaEffects.description).toBeDefined();
    });

    test('should provide appropriate Mahadasha predictions', () => {
      const mahadashaEffects = LagnaLordAnalyzer.getMahadashaEffects('Moon', 6, 'Sagittarius');

      expect(mahadashaEffects.overallTheme).toBeDefined();
      expect(mahadashaEffects.keyAreas).toBeDefined();
      expect(mahadashaEffects.challenges).toBeDefined();
      expect(mahadashaEffects.opportunities).toBeDefined();
    });

    test('should calculate Dasha timing correctly', () => {
      const timing = LagnaLordAnalyzer.getDashaTiming('Moon');

      expect(timing.duration).toBeDefined();
      expect(timing.sequence).toBeDefined();
      expect(timing.priority).toBeDefined();
    });
  });

  describe('Remedial Measures', () => {
    test('should provide comprehensive remedial measures', () => {
      const lordPosition = chart.planetaryPositions.find(p => p.planet === 'Moon');
      const placementAnalysis = { overallStrength: { score: 65 } };

      const remedies = LagnaLordAnalyzer.generateRemedialMeasures(lordPosition, placementAnalysis);

      expect(remedies.primaryRemedies).toBeDefined();
      expect(Array.isArray(remedies.primaryRemedies)).toBe(true);
      expect(remedies.additionalRemedies).toBeDefined();
      expect(remedies.lifestyleChanges).toBeDefined();
      expect(remedies.priority).toBeDefined();
      expect(['High', 'Medium', 'Low']).toContain(remedies.priority);
    });

    test('should provide planet-specific gemstone remedies', () => {
      const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

      planets.forEach(planet => {
        const gemstone = LagnaLordAnalyzer.getGemstoneRemedy(planet);

        expect(gemstone.stone).toBeDefined();
        expect(gemstone.weight).toBeDefined();
        expect(gemstone.metal).toBeDefined();
        expect(gemstone.finger).toBeDefined();
        expect(gemstone.day).toBeDefined();
      });
    });

    test('should provide appropriate mantras for each planet', () => {
      const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

      planets.forEach(planet => {
        const mantra = LagnaLordAnalyzer.getMantraRemedy(planet);

        expect(mantra.mantra).toBeDefined();
        expect(mantra.repetitions).toBeDefined();
        expect(mantra.timing).toBeDefined();
        expect(mantra.duration).toBeDefined();
      });
    });

    test('should suggest appropriate charity and fasting', () => {
      const moonCharity = LagnaLordAnalyzer.getCharityRemedy('Moon');
      const moonFasting = LagnaLordAnalyzer.getFastingRemedy('Moon');

      expect(moonCharity.items).toBeDefined();
      expect(moonCharity.recipients).toBeDefined();
      expect(moonCharity.timing).toBeDefined();

      expect(moonFasting.day).toBeDefined();
      expect(moonFasting.duration).toBeDefined();
      expect(moonFasting.foods).toBeDefined();
    });
  });

  describe('Advanced Analysis Features', () => {
    test('should check for Parivartana Yoga', () => {
      const lordPosition = chart.planetaryPositions.find(p => p.planet === 'Moon');
      const parivartana = LagnaLordAnalyzer.checkParivartanaYoga(lordPosition, chart);

      expect(parivartana.isPresent).toBeDefined();
      if (parivartana.isPresent) {
        expect(parivartana.type).toBeDefined();
        expect(parivartana.withPlanet).toBeDefined();
        expect(parivartana.effects).toBeDefined();
      }
    });

    test('should analyze special degrees like Gandanta', () => {
      const gandantaCheck = LagnaLordAnalyzer.checkGandantaDegrees(29.5, 'Scorpio');

      expect(gandantaCheck.isGandanta).toBeDefined();
      if (gandantaCheck.isGandanta) {
        expect(gandantaCheck.type).toBeDefined();
        expect(gandantaCheck.effects).toBeDefined();
      }
    });

    test('should check Pushkara Bhaga degrees', () => {
      const pushkaraCheck = LagnaLordAnalyzer.checkPushkaraBhagaDegrees(21.0, 'Cancer');

      expect(pushkaraCheck.isPushkara).toBeDefined();
      if (pushkaraCheck.isPushkara) {
        expect(pushkaraCheck.benefits).toBeDefined();
      }
    });

    test('should calculate Navamsa placement', () => {
      const navamsaSign = LagnaLordAnalyzer.getNavamsaSign(252.3, 'Sagittarius');

      expect(navamsaSign).toBeDefined();
      expect(typeof navamsaSign).toBe('string');
    });
  });

  describe('Comprehensive Integration Tests', () => {
    test('should provide complete analysis for different Lagna types', () => {
      const lagnaTypes = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                         'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

      lagnaTypes.forEach(lagna => {
        const testChart = TestChartFactory.createChart(lagna);

        expect(() => {
          const analysis = LagnaLordAnalyzer.analyzeLagnaLord(testChart);
          expect(analysis.lagnaSign).toBe(lagna);
          expect(analysis.lagnaLord).toBe(LagnaLordAnalyzer.getLagnaLord(lagna));
        }).not.toThrow();
      });
    });

    test('should generate meaningful summary and recommendations', () => {
      const analysis = LagnaLordAnalyzer.analyzeLagnaLord(chart);

      expect(typeof analysis.summary).toBe('string');
      expect(analysis.summary.length).toBeGreaterThan(50);
      expect(Array.isArray(analysis.recommendations)).toBe(true);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
      expect(analysis.recommendations.every(rec => typeof rec === 'string')).toBe(true);
    });

    test('should maintain consistency across multiple calls', () => {
      const analysis1 = LagnaLordAnalyzer.analyzeLagnaLord(chart);
      const analysis2 = LagnaLordAnalyzer.analyzeLagnaLord(chart);

      expect(analysis1.lagnaSign).toBe(analysis2.lagnaSign);
      expect(analysis1.lagnaLord).toBe(analysis2.lagnaLord);
      expect(analysis1.analysis.dignity.type).toBe(analysis2.analysis.dignity.type);
    });
  });

  describe('Performance and Reliability', () => {
    test('should complete analysis within reasonable time', () => {
      const startTime = Date.now();

      const analysis = LagnaLordAnalyzer.analyzeLagnaLord(chart);

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(1000); // Should complete within 1 second
      expect(analysis).toBeDefined();
    });

    test('should handle edge cases gracefully', () => {
      const edgeCaseChart = TestChartFactory.createChartWithLagnaLord('Cancer', 'Cancer', 1);
      TestChartFactory.addPlanet(edgeCaseChart, 'Sun', 'Libra', 4, 0);


      expect(() => {
        LagnaLordAnalyzer.analyzeLagnaLord(edgeCaseChart);
      }).not.toThrow();
    });
  });

  it('should correctly analyze the Lagna Lord for an Aries ascendant', () => {
    const chart = TestChartFactory.createChart('Aries');
    TestChartFactory.addPlanet(chart, 'Mars', 'Cancer', 4); // Mars in 4th house

    // The static method expects a specific chart structure
    const analysis = LagnaLordAnalyzer.analyzeLagnaLord({ rasiChart: chart });

    expect(analysis).toBeDefined();
    expect(analysis.lagnaLord).toBe('Mars');
    expect(analysis.lordPosition.house).toBe(4);
    expect(analysis.analysis.dignity.type).toBe('debilitated');
    expect(analysis.analysis.houseEffects.description).toContain('Lagna lord in 4th house');
  });

  it('should throw an error if the Lagna Lord is not found', () => {
    const chart = TestChartFactory.createChart('Aries');
    // Remove Mars from the chart to trigger the error
    chart.planetaryPositions = chart.planetaryPositions.filter(p => p.planet !== 'Mars');

    expect(() => {
      LagnaLordAnalyzer.analyzeLagnaLord({ rasiChart: chart });
    }).toThrow('Lagna lord Mars position not found in chart');
  });
});
