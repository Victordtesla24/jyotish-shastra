/**
 * Unit Tests for Birth Time Rectification Service
 * Tests BPHS-based birth time rectification functionality
 */

import { jest } from '@jest/globals';
import BirthTimeRectificationService from '../../src/services/analysis/BirthTimeRectificationService.js';

// Mock dependencies
jest.mock('../../src/services/chart/ChartGenerationService');
jest.mock('../../src/services/analysis/DetailedDashaAnalysisService');
jest.mock('../../src/core/calculations/astronomy/sunrise.js');
jest.mock('../../src/core/calculations/rectification/praanapada.js');
jest.mock('../../src/core/calculations/rectification/gulika.js');

// Test constants
const TEST_BIRTH_DATA = {
  dateOfBirth: "1997-12-18",
  timeOfBirth: "02:30",
  placeOfBirth: "Sialkot, Pakistan",
  latitude: 32.4935378,
  longitude: 74.5411575,
  timezone: "Asia/Karachi"
};

const TEST_CHART = {
  ascendant: {
    longitude: 185.0,
    sign: "Libra",
    degree: 5.0
  },
  planetaryPositions: {
    sun: { longitude: 242.16, sign: "Scorpio" },
    moon: { longitude: 300.45, sign: "Capricorn", nakshatra: "Shravana", pada: 3 }
  },
  housePositions: {
    house1: { lord: "Mars", sign: "Libra" },
    house7: { lord: "Venus", sign: "Aries" },
    house10: { lord: "Saturn", sign: "Cancer" }
  }
};

describe('BirthTimeRectificationService', () => {
  let service;

  beforeEach(() => {
    service = new BirthTimeRectificationService();
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('Validation', () => {
    test('should validate birth data correctly', async () => {
      expect(() => service.validateBirthData(TEST_BIRTH_DATA, {})).not.toThrow();
      expect(() => service.validateBirthData({}, {})).toThrow('Date of birth is required');
    });

    test('should generate time candidates correctly', () => {
      const candidates = service.generateTimeCandidates(TEST_BIRTH_DATA, { analysisLog: [] });
      
      expect(candidates).toHaveLength(49); // ±2 hours in 5-minute intervals
      expect(candidates[0].time).toBe('00:30'); // First: 02:30 - 2 hours = 00:30
      expect(candidates[48].time).toBe('04:30'); // Last: 02:30 + 2 hours = 04:30
      expect(candidates[24].time).toBe('02:30'); // Middle: 02:30 (original time)
    });
  });

  describe('Praanapada Method', () => {
    test('should calculate Praanapada correctly', async () => {
      const praanapada = await service.calculatePraanapada(
        { time: '02:30' }, 
        TEST_CHART, 
        TEST_BIRTH_DATA
      );
      
      expect(praanapada).toHaveProperty('longitude');
      expect(praanapada).toHaveProperty('sign');
      expect(praanapada).toHaveProperty('degree');
      expect(praanapada).toHaveProperty('palas');
      expect(praanapada.sign).toBe('Scorpio'); // Based on test data
    });

    test('should calculate ascendant alignment correctly', () => {
      const score = service.calculateAscendantAlignment(
        TEST_CHART.ascendant,
        { longitude: 233.33, sign: 'Scorpio' }
      );
      
      expect(typeof score).toBe('number');
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    test('should perform Praanapada analysis', async () => {
      const mockChartService = {
        generateRasiChart: jest.fn().mockResolvedValue(TEST_CHART)
      };
      service.chartService = mockChartService;

      const analysis = await service.performPraanapadaAnalysis(
        TEST_BIRTH_DATA,
        service.generateTimeCandidates(TEST_BIRTH_DATA, { analysisLog: [] }),
        { analysisLog: [] }
      );

      expect(analysis.method).toBe('Praanapada');
      expect(analysis.candidates).toBeDefined();
      expect(mockChartService.generateRasiChart).toHaveBeenCalledTimes(49); // One for each candidate
    });
  });

  describe('Moon Method', () => {
    test('should calculate Moon-Ascendant relationship', () => {
      const moonAnalysis = {
        sign: 'Cancer',
        degree: 15.5,
        nakshatra: 'Pushya',
        pada: 2
      };

      const score = service.calculateMoonAscendantRelationship(
        TEST_CHART.ascendant,
        moonAnalysis
      );

      expect(typeof score).toBe('number');
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    test('should test trine relationships correctly', () => {
      expect(service.isTrine('Aries', 'Leo')).toBe(true);
      expect(service.isTrine('Aries', 'Sagittarius')).toBe(true);
      expect(service.isTrine('Aries', 'Cancer')).toBe(false);
    });

    test('should test quadrant relationships correctly', () => {
      expect(service.isQuadrant('Aries', 'Cancer')).toBe(true);
      expect(service.isQuadrant('Aries', 'Libra')).toBe(true);
      expect(service.isQuadrant('Aries', 'Capricorn')).toBe(true);
      expect(service.isQuadrant('Aries', 'Leo')).toBe(false);
    });
  });

  describe('Gulika Method', () => {
    test('should calculate Gulika relationship', () => {
      const gulikaPosition = {
        longitude: 90.5,
        sign: 'Cancer',
        degree: 0.5
      };

      const score = service.calculateGulikaRelationship(
        TEST_CHART.ascendant,
        gulikaPosition
      );

      expect(typeof score).toBe('number');
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe('Event Correlation', () => {
    test('should classify event types correctly', () => {
      expect(service.classifyEventType('Started new job at Google')).toBe('CAREER');
      expect(service.classifyEventType('Married her college sweetheart')).toBe('MARRIAGE');
      expect(service.classifyEventType('Graduated with honors')).toBe('EDUCATION');
      expect(service.classifyEventType('Fell ill and was hospitalized')).toBe('HEALTH_ISSUE');
      expect(service.classifyEventType('Won lottery and became rich')).toBe('FINANCIAL_GAIN');
    });

    test('should calculate planetary house lordships', () => {
      const houses = service.getPlanetaryHouseLordships('Mars', TEST_CHART);
      
      expect(houses).toContain(1); // Mars is lord of house 1 in test chart
    });

    test('should score house signification', () => {
      const score = service.scoreHouseSignification([1, 7], [1, 7, 10], 40);
      expect(score).toBe(40); // Perfect match
    });
  });

  describe('Result Synthesis', () => {
    test('should synthesize results correctly', () => {
      const analysis = {
        methods: {
          praanapada: { candidates: [{ time: '02:25', weightedScore: 32 }] },
          moon: { candidates: [{ time: '02:25', weightedScore: 24 }] },
          gulika: { candidates: [{ time: '02:25', weightedScore: 16 }] }
        }
      };

      const synthesis = service.synthesizeResults(analysis);

      expect(synthesis.rectifiedTime).toBe('02:25');
      expect(synthesis.confidence).toBeGreaterThan(0);
      expect(synthesis.confidence).toBeLessThanOrEqual(100);
      expect(synthesis.recommendations).toBeInstanceOf(Array);
    });

    test('should calculate confidence correctly', () => {
      const bestCandidate = {
        time: '02:25',
        totalScore: 72,
        methods: ['praanapada', 'moon', 'gulika']
      };

      const analysis = { methods: {} };
      const confidence = service.calculateOverallConfidence(bestCandidate, analysis);

      expect(typeof confidence).toBe('number');
      expect(confidence).toBeGreaterThanOrEqual(0);
      expect(confidence).toBeLessThanOrEqual(100);
    });

    test('should handle empty candidates correctly', () => {
      const analysis = { originalData: { timeOfBirth: TEST_BIRTH_DATA.timeOfBirth }, methods: {} };
      const synthesis = service.synthesizeResults(analysis);

      expect(synthesis.rectifiedTime).toBe(TEST_BIRTH_DATA.timeOfBirth);
      expect(synthesis.confidence).toBe(0);
    });
  });

  describe('Error Handling', () => {
    test('should handle missing birth data gracefully', async () => {
      await expect(
        service.performBirthTimeRectification({})
      ).rejects.toThrow('Date of birth is required');
    });

    test('should handle missing place of birth', async () => {
      await expect(
        service.performBirthTimeRectification({ dateOfBirth: '1997-12-18' })
      ).rejects.toThrow('Place of birth is required');
    });
  });

  describe('Helper Methods', () => {
    test('should convert longitude to sign correctly', () => {
      expect(service.longitudeToSign(30)).toBe('Aries');
      expect(service.longitudeToSign(90)).toBe('Cancer');
      expect(service.longitudeToSign(180)).toBe('Libra');
      expect(service.longitudeToSign(270)).toBe('Capricorn');
      expect(service.longitudeToSign(359)).toBe('Pisces');
    });

    test('should get sign indices correctly', () => {
      expect(service.getSignIndex('Aries')).toBe(0);
      expect(service.getSignIndex('Taurus')).toBe(1);
      expect(service.getSignIndex('Gemini')).toBe(2);
      expect(service.getSignIndex('Cancer')).toBe(3);
      expect(service.getSignIndex('Leo')).toBe(4);
      expect(service.getSignIndex('Virgo')).toBe(5);
      expect(service.getSignIndex('Libra')).toBe(6);
      expect(service.getSignIndex('Scorpio')).toBe(7);
      expect(service.getSignIndex('Sagittarius')).toBe(8);
      expect(service.getSignIndex('Capricorn')).toBe(9);
      expect(service.getSignIndex('Aquarius')).toBe(10);
      expect(service.getSignIndex('Pisces')).toBe(11);
    });

    test('should calculate time differences correctly', () => {
      expect(service.getTimeDifference('02:30', '02:45')).toBe(15);
      expect(service.getTimeDifference('02:45', '02:30')).toBe(15);
      expect(service.getTimeDifference('01:00', '02:00')).toBe(60);
      expect(service.getTimeDifference('01:00', '00:00')).toBe(60);
    });

    test('should generate recommendations appropriately', () => {
      const highConfidence = service.generateQuickRecommendations('02:30', 85, TEST_CHART);
      expect(highConfidence.some(rec => rec.includes('Excellent alignment'))).toBe(true);
      expect(highConfidence.some(rec => rec.includes('02:30'))).toBe(true);

      const lowConfidence = service.generateQuickRecommendations('02:30', 25, TEST_CHART);
      expect(lowConfidence.some(rec => rec.includes('Poor alignment'))).toBe(true);
      expect(lowConfidence.some(rec => rec.includes('consider rectification'))).toBe(true);
    });
  });

  describe('Integration Tests', () => {
    test('should perform complete rectification analysis', async () => {
      const mockChartService = {
        generateRasiChart: jest.fn().mockResolvedValue(TEST_CHART)
      };
      service.chartService = mockChartService;

      const mockDashaService = {
        analyzeAllDashas: jest.fn().mockReturnValue({
          timeline: []
        })
      };
      service.dashaService = mockDashaService;

      const result = await service.performBirthTimeRectification(
        TEST_BIRTH_DATA,
        { methods: ['praanapada', 'moon', 'gulika'] }
      );

      expect(result).not.toHaveProperty('success'); // Should not have success property
      expect(result).toHaveProperty('originalData');
      expect(result).toHaveProperty('methods');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('analysisLog');
      expect(result.analysisLog).toContain('Starting BPHS Birth Time Rectification analysis');
    });
  });
});
