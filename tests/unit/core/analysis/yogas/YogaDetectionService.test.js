const YogaDetectionService = require('../../../../../src/services/analysis/YogaDetectionService');
const TestChartFactory = require('../../../../utils/TestChartFactory');

// Mock the individual yoga calculators
jest.mock('../../../../../src/core/analysis/yogas/RajaYogaCalculator');
jest.mock('../../../../../src/core/analysis/yogas/DhanaYogaCalculator');
jest.mock('../../../../../src/core/analysis/yogas/GajaKesariYogaCalculator');
jest.mock('../../../../../src/core/analysis/yogas/ViparitaRajaYogaCalculator');
jest.mock('../../../../../src/core/analysis/yogas/PanchMahapurushaYogaCalculator');
jest.mock('../../../../../src/core/analysis/yogas/NeechaBhangaYogaCalculator');

const RajaYogaCalculator = require('../../../../../src/core/analysis/yogas/RajaYogaCalculator');
const DhanaYogaCalculator = require('../../../../../src/core/analysis/yogas/DhanaYogaCalculator');
const GajaKesariYogaCalculator = require('../../../../../src/core/analysis/yogas/GajaKesariYogaCalculator');
const ViparitaRajaYogaCalculator = require('../../../../../src/core/analysis/yogas/ViparitaRajaYogaCalculator');
const PanchMahapurushaYogaCalculator = require('../../../../../src/core/analysis/yogas/PanchMahapurushaYogaCalculator');
const NeechaBhangaYogaCalculator = require('../../../../../src/core/analysis/yogas/NeechaBhangaYogaCalculator');

describe('YogaDetectionService (Refactored)', () => {
  let yogaDetectionService;
  let chart;

  beforeEach(() => {
    // Reset mocks before each test
    RajaYogaCalculator.prototype.detectRajaYogas.mockClear();
    DhanaYogaCalculator.prototype.detectDhanaYogas.mockClear();
    GajaKesariYogaCalculator.prototype.detectGajaKesariYoga.mockClear();
    ViparitaRajaYogaCalculator.prototype.detectViparitaRajaYogas.mockClear();
    PanchMahapurushaYogaCalculator.prototype.detectPanchMahapurushaYogas.mockClear();
    NeechaBhangaYogaCalculator.prototype.detectNeechaBhangaYogas.mockClear();

    yogaDetectionService = new YogaDetectionService();
    chart = TestChartFactory.createChart('Aries');
  });

  describe('detectAllYogas', () => {
    it('should call all individual yoga calculators', () => {
      yogaDetectionService.detectAllYogas(chart);
      expect(RajaYogaCalculator.prototype.detectRajaYogas).toHaveBeenCalledTimes(1);
      expect(DhanaYogaCalculator.prototype.detectDhanaYogas).toHaveBeenCalledTimes(1);
      expect(GajaKesariYogaCalculator.prototype.detectGajaKesariYoga).toHaveBeenCalledTimes(1);
      expect(ViparitaRajaYogaCalculator.prototype.detectViparitaRajaYogas).toHaveBeenCalledTimes(1);
      expect(PanchMahapurushaYogaCalculator.prototype.detectPanchMahapurushaYogas).toHaveBeenCalledTimes(1);
      expect(NeechaBhangaYogaCalculator.prototype.detectNeechaBhangaYogas).toHaveBeenCalledTimes(1);
    });

    it('should aggregate results from all yoga calculators', () => {
      // Setup mock return values
      const mockRajaYogas = { hasRajaYoga: true, yogas: [{ name: 'Raja Yoga' }], totalCount: 1 };
      const mockDhanaYogas = { hasDhanaYoga: true, yogas: [{ name: 'Dhana Yoga' }], totalCount: 1 };
      const mockGajaKesariYoga = { hasGajaKesariYoga: true };
      const mockViparitaRajaYogas = { hasViparitaRajaYoga: false, yogas: [], totalCount: 0 };
      const mockPanchMahapurushaYogas = { hasPanchMahapurushaYoga: false, yogas: [], totalCount: 0 };
      const mockNeechaBhangaYogas = { hasNeechaBhangaYoga: false, yogas: [], totalCount: 0 };

      RajaYogaCalculator.prototype.detectRajaYogas.mockReturnValue(mockRajaYogas);
      DhanaYogaCalculator.prototype.detectDhanaYogas.mockReturnValue(mockDhanaYogas);
      GajaKesariYogaCalculator.prototype.detectGajaKesariYoga.mockReturnValue(mockGajaKesariYoga);
      ViparitaRajaYogaCalculator.prototype.detectViparitaRajaYogas.mockReturnValue(mockViparitaRajaYogas);
      PanchMahapurushaYogaCalculator.prototype.detectPanchMahapurushaYogas.mockReturnValue(mockPanchMahapurushaYogas);
      NeechaBhangaYogaCalculator.prototype.detectNeechaBhangaYogas.mockReturnValue(mockNeechaBhangaYogas);

      const result = yogaDetectionService.detectAllYogas(chart);

      expect(result.rajaYogas).toEqual(mockRajaYogas);
      expect(result.dhanaYogas).toEqual(mockDhanaYogas);
      expect(result.gajaKesariYoga).toEqual(mockGajaKesariYoga);
      expect(result.summary.totalYogas).toBe(3);
      expect(result.summary.beneficYogas).toBe(3);
      expect(result.summary.overallStrength).toBe('Very Good');
    });

    it('should handle errors from a calculator gracefully', () => {
        // Suppress console.error for this test to avoid noise
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        RajaYogaCalculator.prototype.detectRajaYogas.mockImplementation(() => {
            throw new Error('Test Error');
        });

        const result = yogaDetectionService.detectAllYogas(chart);
        expect(result.rajaYogas.error).toBe('Test Error');
        expect(result.summary.error).toBeDefined();

        // Verify that console.error was called but suppress the output
        expect(consoleSpy).toHaveBeenCalledWith('Error detecting yogas:', expect.any(Error));

        // Restore console.error
        consoleSpy.mockRestore();
    });
  });
});
