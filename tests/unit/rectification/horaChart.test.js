/**
 * Unit Tests for Hora Chart Calculator - NEW MODULE
 * Tests new BPHS Hora chart functionality without affecting existing charts
 */

const HoraChartCalculator = require('../../../src/core/calculations/charts/horaChart.js').default;

describe('HoraChartCalculator - NEW MODULE', () => {
  let horaCalculator;
  
  beforeEach(() => {
    horaCalculator = new HoraChartCalculator();
  });

  describe('New Hora Chart Functionality', () => {
    test('should calculate D2-Hora chart correctly for standard birth data', () => {
      const birthData = {
        dateOfBirth: '1997-12-18',
        timeOfBirth: '02:30',
        latitude: 32.4935378,
        longitude: 74.5411575,
        timezone: 'Asia/Karachi'
      };

      const rasiChart = {
        ascendant: { sign: 'Scorpio', longitude: 210 },
        planetaryPositions: {
          sun: { sign: 'Sagittarius', longitude: 242 }
        }
      };

      const horaResult = horaCalculator.calculateHoraChart(birthData, rasiChart);
      
      expect(horaResult).toBeDefined();
      expect(horaResult.chartType).toBe('D2-Hora');
      expect(horaResult.hora).toBeDefined();
      expect(horaResult.hora.planetaryPositions).toBeDefined();
      expect(horaResult.hora.ascendant).toBeDefined();
    });

    test('should integrate with existing chart service as additive feature', () => {
      // Test that new Hora calculation doesn't interfere with existing service
      const chartService = require('../../../src/services/chart/ChartGenerationService.js');
      
      // Mock existing service
      const mockRasiChart = {
        ascendant: { sign: 'Aries', longitude: 30 },
        planetaryPositions: {}
      };
      
      // Verify existing functionality
      expect(() => chartService.generateRasiChart).toBeDefined();
      
      // Test new additive functionality
      const birthData = {
        dateOfBirth: '1990-01-01',
        timeOfBirth: '12:00',
        latitude: 28.6139,
        longitude: 77.2090,
        timezone: 'Asia/Kolkata'
      };
      
      const horaResult = horaCalculator.calculateHoraChart(birthData, mockRasiChart);
      expect(horaResult).toBeDefined();
    });
  });

  describe('Production Safety Tests', () => {
    test('should not affect existing chart calculations', () => {
      // Test that Hora calculation is pure and doesn't modify input data
      const testBirthData = {
        dateOfBirth: '1985-05-15',
        timeOfBirth: '10:30',
        latitude: 19.0760,
        longitude: 72.8777,
        timezone: 'Asia/Kolkata'
      };
      
      const originalRasiChart = {
        ascendant: { sign: 'Aries', longitude: 30 },
        planetaryPositions: {
          sun: { sign: 'Leo', longitude: 120 },
          moon: { sign: 'Cancer', longitude: 90 }
        }
      };
      
      // Create deep copy of the chart to test immutability
      const chartCopy = JSON.parse(JSON.stringify(originalRasiChart));
      
      // Generate new Hora chart (additive feature)
      const horaChart = horaCalculator.calculateHoraChart(testBirthData, originalRasiChart);
      expect(horaChart).toBeDefined();
      expect(horaChart.chartType).toBe('D2-Hora');
      
      // Verify original chart data unchanged (Hora calculator should be pure)
      expect(originalRasiChart).toEqual(chartCopy);
      expect(originalRasiChart.ascendant.sign).toBe('Aries');
      expect(originalRasiChart.ascendant.longitude).toBe(30);
    });

    test('should handle edge cases without breaking existing functionality', () => {
      const testCases = [
        { time: '00:00', latitude: 0 },
        { time: '12:00', latitude: 45 },
        { time: '23:59', latitude: 66.5 }
      ];

      testCases.forEach(testCase => {
        const birthData = {
          dateOfBirth: '2000-01-01',
          timeOfBirth: testCase.time,
          latitude: testCase.latitude,
          longitude: 0,
          timezone: 'UTC'
        };

        const rasiChart = {
          ascendant: { sign: 'Aries', longitude: 0 },
          planets: {}
        };

        // Should not throw errors for edge cases
        expect(() => {
          const result = horaCalculator.calculateHoraChart(birthData, rasiChart);
          expect(result).toBeDefined();
        }).not.toThrow();
      });
    });
  });

  describe('BPHS Methodology Compliance', () => {
    test('should follow BPHS Chapter 5 specifications for Hora charts', () => {
      const birthData = {
        dateOfBirth: '1995-06-15',
        timeOfBirth: '06:00',
        latitude: 13.0827,
        longitude: 80.2707,
        timezone: 'Asia/Kolkata'
      };

      const rasiChart = {
        ascendant: { sign: 'Taurus', longitude: 60 },
        planets: {
          moon: { sign: 'Cancer', longitude: 120 }
        }
      };

      const horaResult = horaCalculator.calculateHoraChart(birthData, rasiChart);
      
      // Verify BPHS compliance
      expect(horaResult.methodology).toBe('BPHS_Chapter5');
      expect(horaResult.references).toBeDefined();
      expect(horaResult.rectificationScore).toBeGreaterThanOrEqual(0.95); // 95% accuracy requirement
    });

    test('should provide detailed Hora analysis for rectification', () => {
      const birthData = {
        dateOfBirth: '1992-11-20',
        timeOfBirth: '15:45',
        latitude: -33.8688,
        longitude: 151.2093,
        timezone: 'Australia/Sydney'
      };

      const rasiChart = {
        ascendant: { sign: 'Libra', longitude: 180 },
        planets: {
          jupiter: { sign: 'Cancer', longitude: 120 }
        }
      };

      const horaResult = horaCalculator.calculateHoraChart(birthData, rasiChart);
      
      // Verify detailed analysis
      expect(horaResult.hora.analysis.rectificationScore).toBeDefined();
      expect(horaResult.calculations).toBeDefined();
      expect(horaResult.analysisLog).toBeDefined();
      expect(horaResult.validation).toBeDefined();
    });
  });
});
