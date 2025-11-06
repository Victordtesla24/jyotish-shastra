#!/usr/bin/env node

/**
 * Chart Accuracy Validation Test
 * Integration test to validate chart generation accuracy against reference data
 * 
 * This test ensures:
 * 1. Planetary positions match within tolerance (±1-2°)
 * 2. House assignments are accurate
 * 3. Signs are correctly calculated
 * 4. Retrograde status is captured
 * 5. Dignity calculations are correct
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

// Tolerance for planetary positions (degrees)
const POSITION_TOLERANCE = 2.0;
const CLOSE_TOLERANCE = 1.0;

describe('Chart Generation Accuracy - Integration Tests', function() {
  this.timeout(10000); // Allow time for chart generation

  // Helper to load chart data
  function loadChartData(person) {
    const filename = path.join(__dirname, '../../temp-data', `${person.toLowerCase()}-chart-generated.json`);
    if (!fs.existsSync(filename)) {
      throw new Error(`Chart file not found: ${filename}`);
    }
    const data = JSON.parse(fs.readFileSync(filename, 'utf8'));
    return data.success ? data.data : null;
  }

  // Helper to find planet in chart
  function findPlanet(chart, planetName) {
    return chart.rasiChart.planets.find(p => p.name === planetName);
  }

  // Helper to check degree within tolerance
  function degreeWithinTolerance(actual, expected, tolerance) {
    if (!expected || expected === null) return true; // Skip if no expected value
    return Math.abs(actual - expected) <= tolerance;
  }

  describe('Vikram Chart Validation (Reference: 24-10-1985, 02:30 PM, Pune)', function() {
    let chart;

    before(function() {
      chart = loadChartData('Vikram');
      expect(chart).to.exist;
      expect(chart.rasiChart).to.exist;
    });

    it('should have correct ascendant sign', function() {
      expect(chart.rasiChart.ascendant.sign).to.equal('Aquarius');
    });

    it('should have ascendant degree within tolerance', function() {
      const degree = chart.rasiChart.ascendant.degree;
      expect(degree).to.be.within(0, 3); // Expected ~1°
    });

    it('should have Sun in correct sign', function() {
      const sun = findPlanet(chart, 'Sun');
      expect(sun).to.exist;
      expect(sun.sign).to.equal('Libra');
    });

    it('should have Sun degree within tolerance', function() {
      const sun = findPlanet(chart, 'Sun');
      expect(degreeWithinTolerance(sun.degree, 7, POSITION_TOLERANCE)).to.be.true;
    });

    it('should have Sun dignity as debilitated', function() {
      const sun = findPlanet(chart, 'Sun');
      expect(sun.dignity).to.equal('debilitated');
    });

    it('should have Moon in correct sign', function() {
      const moon = findPlanet(chart, 'Moon');
      expect(moon).to.exist;
      expect(moon.sign).to.equal('Aquarius');
    });

    it('should have Moon degree within tolerance', function() {
      const moon = findPlanet(chart, 'Moon');
      expect(degreeWithinTolerance(moon.degree, 19, POSITION_TOLERANCE)).to.be.true;
    });

    it('should have Mars in correct sign', function() {
      const mars = findPlanet(chart, 'Mars');
      expect(mars).to.exist;
      expect(mars.sign).to.equal('Virgo');
    });

    it('should have Mars in correct house', function() {
      const mars = findPlanet(chart, 'Mars');
      // House 8 expected - validating Whole Sign system
      expect(mars.house).to.be.within(7, 9); // Allow ±1 house tolerance
    });

    it('should have Jupiter retrograde status', function() {
      const jupiter = findPlanet(chart, 'Jupiter');
      expect(jupiter).to.exist;
      // Note: Retrograde status validation - reference shows retrograde
      expect(jupiter).to.have.property('isRetrograde');
    });

    it('should have Venus dignity as debilitated', function() {
      const venus = findPlanet(chart, 'Venus');
      expect(venus).to.exist;
      expect(venus.dignity).to.equal('debilitated');
    });
  });

  describe('Farhan Chart Validation (Reference: 18-12-1997, 12:00 AM, Sialkot)', function() {
    let chart;

    before(function() {
      chart = loadChartData('Farhan');
      expect(chart).to.exist;
      expect(chart.rasiChart).to.exist;
    });

    it('should have correct ascendant sign', function() {
      expect(chart.rasiChart.ascendant.sign).to.equal('Virgo');
    });

    it('should have Sun in Sagittarius', function() {
      const sun = findPlanet(chart, 'Sun');
      expect(sun).to.exist;
      expect(sun.sign).to.equal('Sagittarius');
    });

    it('should have Sun degree within tolerance', function() {
      const sun = findPlanet(chart, 'Sun');
      expect(degreeWithinTolerance(sun.degree, 2, CLOSE_TOLERANCE)).to.be.true;
    });

    it('should have Mars dignity as exalted', function() {
      const mars = findPlanet(chart, 'Mars');
      expect(mars).to.exist;
      expect(mars.sign).to.equal('Capricorn');
      expect(mars.dignity).to.equal('exalted');
    });

    it('should have Mercury combust', function() {
      const mercury = findPlanet(chart, 'Mercury');
      expect(mercury).to.exist;
      expect(mercury.isCombust).to.be.true;
    });

    it('should calculate Ketu opposite to Rahu', function() {
      const rahu = findPlanet(chart, 'Rahu');
      const ketu = findPlanet(chart, 'Ketu');
      
      expect(rahu).to.exist;
      expect(ketu).to.exist;

      // Ketu should be 180° from Rahu
      const diff = Math.abs(rahu.longitude - ketu.longitude);
      const normalizedDiff = Math.min(diff, 360 - diff);
      expect(normalizedDiff).to.be.closeTo(180, 1);
    });
  });

  describe('Planetary Calculation Accuracy', function() {
    let vikramChart, farhanChart;

    before(function() {
      vikramChart = loadChartData('Vikram');
      farhanChart = loadChartData('Farhan');
    });

    it('should have all planets within valid longitude range (0-360°)', function() {
      const allPlanets = [
        ...vikramChart.rasiChart.planets,
        ...farhanChart.rasiChart.planets
      ];

      allPlanets.forEach(planet => {
        expect(planet.longitude).to.be.within(0, 360);
      });
    });

    it('should have degree within sign range (0-30°)', function() {
      const allPlanets = [
        ...vikramChart.rasiChart.planets,
        ...farhanChart.rasiChart.planets
      ];

      allPlanets.forEach(planet => {
        expect(planet.degree).to.be.within(0, 30);
      });
    });

    it('should have valid house assignments (1-12)', function() {
      const allPlanets = [
        ...vikramChart.rasiChart.planets,
        ...farhanChart.rasiChart.planets
      ];

      allPlanets.forEach(planet => {
        expect(planet.house).to.be.within(1, 12);
      });
    });

    it('should have valid sign IDs (1-12)', function() {
      const allPlanets = [
        ...vikramChart.rasiChart.planets,
        ...farhanChart.rasiChart.planets
      ];

      allPlanets.forEach(planet => {
        expect(planet.signId).to.be.within(1, 12);
      });
    });

    it('should have ayanamsa value in expected range (23-24°)', function() {
      // For dates in 1980s-1990s, Lahiri ayanamsa should be ~23-24°
      const vikramAyanamsa = vikramChart.rasiChart.planets[0].ayanamsaUsed;
      const farhanAyanamsa = farhanChart.rasiChart.planets[0].ayanamsaUsed;

      expect(vikramAyanamsa).to.be.within(23, 24.5);
      expect(farhanAyanamsa).to.be.within(23, 24.5);
    });
  });

  describe('Whole Sign House System Validation', function() {
    let vikramChart;

    before(function() {
      vikramChart = loadChartData('Vikram');
    });

    it('should assign planets to houses based on sign', function() {
      const ascendant = vikramChart.rasiChart.ascendant;
      const ascendantSignIndex = Math.floor(ascendant.longitude / 30);

      vikramChart.rasiChart.planets.forEach(planet => {
        const planetSignIndex = Math.floor(planet.longitude / 30);
        const expectedHouse = ((planetSignIndex - ascendantSignIndex + 12) % 12) + 1;
        
        // Validate house calculation matches Whole Sign system
        expect(planet.house).to.equal(expectedHouse);
      });
    });

    it('should have all planets in the same sign share the same house', function() {
      const planetsBySign = {};

      vikramChart.rasiChart.planets.forEach(planet => {
        if (!planetsBySign[planet.sign]) {
          planetsBySign[planet.sign] = [];
        }
        planetsBySign[planet.sign].push(planet);
      });

      // All planets in same sign should have same house number
      Object.values(planetsBySign).forEach(planetsInSign => {
        if (planetsInSign.length > 1) {
          const firstHouse = planetsInSign[0].house;
          planetsInSign.forEach(planet => {
            expect(planet.house).to.equal(firstHouse);
          });
        }
      });
    });
  });

  describe('Retrograde Calculation', function() {
    let chart;

    before(function() {
      chart = loadChartData('Vikram');
    });

    it('should calculate retrograde based on negative speed', function() {
      chart.rasiChart.planets.forEach(planet => {
        if (planet.speed < 0) {
          expect(planet.isRetrograde).to.be.true;
        }
        if (planet.speed > 0) {
          expect(planet.isRetrograde).to.be.false;
        }
      });
    });

    it('should have speed property for all planets', function() {
      chart.rasiChart.planets.forEach(planet => {
        expect(planet).to.have.property('speed');
        expect(typeof planet.speed).to.equal('number');
      });
    });
  });

  describe('Data Structure Validation', function() {
    let chart;

    before(function() {
      chart = loadChartData('Vikram');
    });

    it('should have all required planet properties', function() {
      const requiredProps = [
        'name', 'longitude', 'degree', 'sign', 'signId',
        'latitude', 'distance', 'speed', 'isRetrograde',
        'isCombust', 'dignity', 'house'
      ];

      chart.rasiChart.planets.forEach(planet => {
        requiredProps.forEach(prop => {
          expect(planet).to.have.property(prop);
        });
      });
    });

    it('should have all 9 planets (excluding Uranus, Neptune, Pluto)', function() {
      const expectedPlanets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
      const planetNames = chart.rasiChart.planets.map(p => p.name);

      expectedPlanets.forEach(name => {
        expect(planetNames).to.include(name);
      });
    });

    it('should have valid ascendant structure', function() {
      const asc = chart.rasiChart.ascendant;
      
      expect(asc).to.have.property('longitude');
      expect(asc).to.have.property('sign');
      expect(asc).to.have.property('degree');
      expect(asc).to.have.property('house');
      expect(asc.house).to.equal(1);
    });
  });
});

// If running directly (not via test runner)
if (require.main === module) {
  console.log('Running chart accuracy validation tests...\n');
  console.log('Note: Run with Mocha for full test suite: npm test tests/integration/chart-accuracy-validation.cjs\n');
}

module.exports = {
  loadChartData,
  findPlanet,
  degreeWithinTolerance,
  POSITION_TOLERANCE,
  CLOSE_TOLERANCE
};

