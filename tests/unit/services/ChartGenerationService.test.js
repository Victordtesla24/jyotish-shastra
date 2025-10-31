import ChartGenerationService from '../../../src/services/chart/ChartGenerationService.js';
import { sampleBirthData } from '../../test-data/sample-chart-data.js';

describe('ChartGenerationService', () => {
  let chartGenerationService;

  beforeAll(() => {
    chartGenerationService = new ChartGenerationService();
  });

  describe('generateRasiChart', () => {
    it('should generate a Rasi chart with all required components', async () => {
      const chart = await chartGenerationService.generateRasiChart(sampleBirthData);

      // Validate Ascendant
      expect(chart).toHaveProperty('ascendant');
      expect(chart.ascendant).toHaveProperty('sign');
      expect(chart.ascendant).toHaveProperty('degree');

      // Validate Planetary Positions
      expect(chart).toHaveProperty('planetaryPositions');
      expect(Object.keys(chart.planetaryPositions).length).toBe(9);

      Object.values(chart.planetaryPositions).forEach(planet => {
        expect(planet).toHaveProperty('sign');
        expect(planet).toHaveProperty('degree');
        expect(planet).toHaveProperty('isRetrograde');
      });

      // Validate House Positions
      expect(chart).toHaveProperty('housePositions');
      expect(chart.housePositions.length).toBe(12);
    });

    it('should throw an error for invalid birth data', async () => {
      const invalidBirthData = { ...sampleBirthData, dateOfBirth: null };
      await expect(chartGenerationService.generateRasiChart(invalidBirthData)).rejects.toThrow();
    });
  });

  describe('generateNavamsaChart', () => {
    it('should generate a Navamsa (D9) chart', async () => {
      const navamsaChart = await chartGenerationService.generateNavamsaChart(sampleBirthData);

      expect(navamsaChart).toHaveProperty('ascendant');
      expect(navamsaChart).toHaveProperty('planetaryPositions');
      expect(Object.keys(navamsaChart.planetaryPositions).length).toBe(9);
      expect(navamsaChart).toHaveProperty('housePositions');
      expect(navamsaChart.housePositions.length).toBe(12);
    });
  });

  describe('calculateAscendant', () => {
    it('should calculate the ascendant correctly', async () => {
      // This is a placeholder test.
      // The actual implementation will require a more sophisticated test
      // with known inputs and expected outputs validated against astrological software.
      const jd = chartGenerationService.calculateJulianDay(sampleBirthData.dateOfBirth, sampleBirthData.timeOfBirth, sampleBirthData.timezone);
      const ascendant = await chartGenerationService.calculateAscendant(jd, sampleBirthData);
      expect(ascendant).toBeDefined();
      expect(ascendant).toHaveProperty('sign');
      expect(ascendant).toHaveProperty('degree');
    });
  });

  describe('getPlanetaryPositions', () => {
    it('should retrieve planetary positions accurately', async () => {
      // This is a placeholder test.
      // Actual testing would involve comparing results against a trusted ephemeris source.
      const jd = chartGenerationService.calculateJulianDay(sampleBirthData.dateOfBirth, sampleBirthData.timeOfBirth, sampleBirthData.timezone);
      const planets = await chartGenerationService.getPlanetaryPositions(jd);
      expect(planets).toBeDefined();
      // Check for planets object instead of length
      expect(Object.keys(planets).length).toBe(9);
    });
  });
});
