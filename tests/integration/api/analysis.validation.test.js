const request = require('supertest');
const express = require('express');
const analysisRoutes = require('../../../src/api/routes/comprehensiveAnalysis');
const chartRoutes = require('../../../src/api/routes/chart');
const {
  validateBirthData,
  validateChartRequest,
  validateComprehensiveAnalysis,
  validateHouseAnalysis,
  validateAspectAnalysis,
  validateArudhaAnalysis,
  validateNavamsaAnalysis,
  validateDashaAnalysis,
  validateBirthDataValidation
} = require('../../../src/api/validators/birthDataValidator');

// Create a separate test app instance to avoid port conflicts
const testApp = express();
testApp.use(express.json());
testApp.use('/api/v1/analysis', analysisRoutes);
testApp.use('/api/v1/chart', chartRoutes);

describe('API Validation Integration Tests', () => {
  // Test data for validation scenarios
  const validBirthData = {
    name: 'Test Person',
    dateOfBirth: '1985-03-15',
    timeOfBirth: '08:30',
    placeOfBirth: {
      name: 'Pune, Maharashtra, India',
      latitude: 18.5204,
      longitude: 73.8567,
      timezone: 'Asia/Kolkata'
    }
  };

  const validChartData = {
    dateOfBirth: '1985-03-15',
    timeOfBirth: '08:30',
    latitude: 18.5204,
    longitude: 73.8567,
    timezone: 'Asia/Kolkata'
  };

  const invalidBirthData = {
    dateOfBirth: 'invalid-date',
    timeOfBirth: '25:30',
    latitude: 100,
    longitude: -200,
    timezone: 'invalid-timezone'
  };

  const missingRequiredFields = {
    name: 'Test Person'
    // Missing all other required fields
  };

  const edgeCases = {
    minValidDate: { ...validBirthData, dateOfBirth: '1800-01-01' },
    maxValidDate: { ...validBirthData, dateOfBirth: '2100-12-31' },
    minLatitude: { ...validBirthData, placeOfBirth: { ...validBirthData.placeOfBirth, latitude: -90 } },
    maxLatitude: { ...validBirthData, placeOfBirth: { ...validBirthData.placeOfBirth, latitude: 90 } },
    minLongitude: { ...validBirthData, placeOfBirth: { ...validBirthData.placeOfBirth, longitude: -180 } },
    maxLongitude: { ...validBirthData, placeOfBirth: { ...validBirthData.placeOfBirth, longitude: 180 } }
  };

  describe('Chart Generation Endpoints', () => {
    describe('POST /api/v1/chart/generate', () => {
      it('should accept valid chart data without name field', async () => {
        const response = await request(testApp)
          .post('/api/v1/chart/generate')
          .send(validChartData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
      });

      it('should accept valid chart data with optional name field', async () => {
        const dataWithName = { ...validChartData, name: 'Optional Name' };
        const response = await request(testApp)
          .post('/api/v1/chart/generate')
          .send(dataWithName)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
      });

      it('should handle nested placeOfBirth format', async () => {
        const nestedFormat = {
          dateOfBirth: '1985-03-15',
          timeOfBirth: '08:30',
          placeOfBirth: {
            name: 'Pune, Maharashtra, India',
            latitude: 18.5204,
            longitude: 73.8567,
            timezone: 'Asia/Kolkata'
          }
        };

        const response = await request(testApp)
          .post('/api/v1/chart/generate')
          .send(nestedFormat)
          .expect(200);

        expect(response.body.success).toBe(true);
      });

      it('should reject invalid date format', async () => {
        const invalidData = { ...validChartData, dateOfBirth: 'invalid-date' };
        const response = await request(testApp)
          .post('/api/v1/chart/generate')
          .send(invalidData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Validation failed');
        expect(response.body.details).toHaveLength(1);
        expect(response.body.details[0].field).toBe('dateOfBirth');
      });

      it('should reject invalid time format', async () => {
        const invalidData = { ...validChartData, timeOfBirth: '25:30' };
        const response = await request(testApp)
          .post('/api/v1/chart/generate')
          .send(invalidData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.details[0].field).toBe('timeOfBirth');
      });

      it('should reject invalid coordinates', async () => {
        const invalidData = { ...validChartData, latitude: 100, longitude: -200 };
        const response = await request(testApp)
          .post('/api/v1/chart/generate')
          .send(invalidData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.details.some(d => d.field === 'latitude')).toBe(true);
        expect(response.body.details.some(d => d.field === 'longitude')).toBe(true);
      });

      it('should validate edge case coordinates', async () => {
        const edgeData = { ...validChartData, latitude: -90, longitude: 180 };
        const response = await request(testApp)
          .post('/api/v1/chart/generate')
          .send(edgeData)
          .expect(200);

        expect(response.body.success).toBe(true);
      });
    });
  });

  describe('Analysis Endpoints (Name Required)', () => {
    describe('POST /api/v1/analysis/comprehensive', () => {
      it('should accept valid comprehensive analysis data', async () => {
        const requestData = { birthData: validBirthData };
        const response = await request(testApp)
          .post('/api/v1/analysis/comprehensive')
          .send(requestData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.analysis).toBeDefined();
      });

      it('should reject missing name field', async () => {
        const dataWithoutName = { ...validBirthData };
        delete dataWithoutName.name;
        const requestData = { birthData: dataWithoutName };

        const response = await request(testApp)
          .post('/api/v1/analysis/comprehensive')
          .send(requestData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.details[0].field).toBe('birthData.name');
        expect(response.body.details[0].message).toContain('required');
      });

      it('should handle chartId alternative format', async () => {
        const chartIdData = { chartId: '507f1f77bcf86cd799439011' };
        const response = await request(testApp)
          .post('/api/v1/analysis/comprehensive')
          .send(chartIdData)
          .expect(200);

        expect(response.body.success).toBe(true);
      });

      it('should reject empty birthData and missing chartId', async () => {
        const response = await request(testApp)
          .post('/api/v1/analysis/comprehensive')
          .send({})
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toContain('Either birthData or chartId is required');
      });
    });

    describe('POST /api/v1/analysis/houses', () => {
      it('should accept valid house analysis data', async () => {
        const response = await request(testApp)
          .post('/api/v1/analysis/houses')
          .send(validBirthData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.analysis.section).toBeDefined();
      });

      it('should require name field', async () => {
        const dataWithoutName = { ...validBirthData };
        delete dataWithoutName.name;

        const response = await request(testApp)
          .post('/api/v1/analysis/houses')
          .send(dataWithoutName)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.details[0].field).toBe('name');
      });

      it('should provide user-friendly error messages', async () => {
        const response = await request(testApp)
          .post('/api/v1/analysis/houses')
          .send(invalidBirthData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.suggestions).toBeDefined();
        expect(response.body.helpText).toBeDefined();
        expect(Array.isArray(response.body.suggestions)).toBe(true);
      });
    });

    describe('POST /api/v1/analysis/aspects', () => {
      it('should accept valid aspect analysis data', async () => {
        const response = await request(testApp)
          .post('/api/v1/analysis/aspects')
          .send(validBirthData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.analysis.section).toBeDefined();
      });

      it('should require name field', async () => {
        const dataWithoutName = { ...validBirthData };
        delete dataWithoutName.name;

        const response = await request(testApp)
          .post('/api/v1/analysis/aspects')
          .send(dataWithoutName)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.details[0].field).toBe('name');
      });
    });

    describe('POST /api/v1/analysis/arudha', () => {
      it('should accept valid arudha analysis data', async () => {
        const response = await request(testApp)
          .post('/api/v1/analysis/arudha')
          .send(validBirthData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.analysis.section).toBeDefined();
      });

      it('should require name field', async () => {
        const dataWithoutName = { ...validBirthData };
        delete dataWithoutName.name;

        const response = await request(testApp)
          .post('/api/v1/analysis/arudha')
          .send(dataWithoutName)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.details[0].field).toBe('name');
      });
    });

    describe('POST /api/v1/analysis/navamsa', () => {
      it('should accept valid navamsa analysis data', async () => {
        const response = await request(testApp)
          .post('/api/v1/analysis/navamsa')
          .send(validBirthData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.analysis.section).toBeDefined();
      });

      it('should require name field', async () => {
        const dataWithoutName = { ...validBirthData };
        delete dataWithoutName.name;

        const response = await request(testApp)
          .post('/api/v1/analysis/navamsa')
          .send(dataWithoutName)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.details[0].field).toBe('name');
      });
    });

    describe('POST /api/v1/analysis/dasha', () => {
      it('should accept valid dasha analysis data', async () => {
        const response = await request(testApp)
          .post('/api/v1/analysis/dasha')
          .send(validBirthData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.analysis.section).toBeDefined();
      });

      it('should handle wrapped birthData format', async () => {
        const wrappedData = { birthData: validBirthData };
        const response = await request(testApp)
          .post('/api/v1/analysis/dasha')
          .send(wrappedData)
          .expect(200);

        expect(response.body.success).toBe(true);
      });

      it('should require name field', async () => {
        const dataWithoutName = { ...validBirthData };
        delete dataWithoutName.name;

        const response = await request(testApp)
          .post('/api/v1/analysis/dasha')
          .send(dataWithoutName)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.details[0].field).toBe('name');
      });
    });
  });

  describe('Birth Data Validation Endpoint (Name Optional)', () => {
    describe('POST /api/v1/analysis/birth-data', () => {
      it('should accept valid birth data without name', async () => {
        const dataWithoutName = { ...validBirthData };
        delete dataWithoutName.name;

        const response = await request(testApp)
          .post('/api/v1/analysis/birth-data')
          .send(dataWithoutName)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.analysis.readyForAnalysis).toBeDefined();
      });

      it('should accept valid birth data with name', async () => {
        const response = await request(testApp)
          .post('/api/v1/analysis/birth-data')
          .send(validBirthData)
          .expect(200);

        expect(response.body.success).toBe(true);
      });

      it('should validate required fields (excluding name)', async () => {
        const response = await request(testApp)
          .post('/api/v1/analysis/birth-data')
          .send(missingRequiredFields)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.details.some(d => d.field === 'dateOfBirth')).toBe(true);
        expect(response.body.details.some(d => d.field === 'timeOfBirth')).toBe(true);
      });
    });
  });

  describe('Edge Cases and Data Format Variations', () => {
    it('should handle multiple location formats', async () => {
      // Test flat coordinate format
      const flatFormat = {
        dateOfBirth: '1985-03-15',
        timeOfBirth: '08:30',
        latitude: 18.5204,
        longitude: 73.8567,
        timezone: 'Asia/Kolkata',
        city: 'Pune',
        country: 'India'
      };

      const response1 = await request(testApp)
        .post('/api/v1/chart/generate')
        .send(flatFormat)
        .expect(200);

      expect(response1.body.success).toBe(true);

      // Test simple place name format
      const simpleFormat = {
        dateOfBirth: '1985-03-15',
        timeOfBirth: '08:30',
        placeOfBirth: 'Pune, Maharashtra, India'
      };

      const response2 = await request(testApp)
        .post('/api/v1/chart/generate')
        .send(simpleFormat)
        .expect(200);

      expect(response2.body.success).toBe(true);
    });

    it('should validate timezone formats', async () => {
      const timezoneVariations = [
        { ...validChartData, timezone: 'Asia/Kolkata' },
        { ...validChartData, timezone: '+05:30' },
        { ...validChartData, timezone: 'UTC' },
        { ...validChartData, timezone: 'GMT' }
      ];

      for (const data of timezoneVariations) {
        const response = await request(testApp)
          .post('/api/v1/chart/generate')
          .send(data);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      }
    });

    it('should validate date range boundaries', async () => {
      // Test minimum valid date
      const response1 = await request(testApp)
        .post('/api/v1/chart/generate')
        .send(edgeCases.minValidDate)
        .expect(200);

      expect(response1.body.success).toBe(true);

      // Test maximum valid date
      const response2 = await request(testApp)
        .post('/api/v1/chart/generate')
        .send(edgeCases.maxValidDate)
        .expect(200);

      expect(response2.body.success).toBe(true);

      // Test out-of-range date
      const invalidDate = { ...validChartData, dateOfBirth: '1799-12-31' };
      const response3 = await request(testApp)
        .post('/api/v1/chart/generate')
        .send(invalidDate)
        .expect(400);

      expect(response3.body.success).toBe(false);
    });

    it('should validate coordinate boundaries', async () => {
      // Test edge case coordinates
      const edgeCoords = [
        edgeCases.minLatitude,
        edgeCases.maxLatitude,
        edgeCases.minLongitude,
        edgeCases.maxLongitude
      ];

      for (const data of edgeCoords) {
        const response = await request(testApp)
          .post('/api/v1/chart/generate')
          .send(data);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      }
    });

    it('should handle time format variations', async () => {
      const timeFormats = [
        { ...validChartData, timeOfBirth: '08:30' },
        { ...validChartData, timeOfBirth: '08:30:00' },
        { ...validChartData, timeOfBirth: '20:30' },
        { ...validChartData, timeOfBirth: '00:00' },
        { ...validChartData, timeOfBirth: '23:59' }
      ];

      for (const data of timeFormats) {
        const response = await request(testApp)
          .post('/api/v1/chart/generate')
          .send(data);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      }
    });
  });

  describe('Error Message Quality', () => {
    it('should provide comprehensive error details', async () => {
      const response = await request(testApp)
        .post('/api/v1/analysis/houses')
        .send(invalidBirthData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toBeInstanceOf(Array);
      expect(response.body.suggestions).toBeInstanceOf(Array);
      expect(response.body.helpText).toBeDefined();

      // Check each error detail has required properties
      response.body.details.forEach(detail => {
        expect(detail.field).toBeDefined();
        expect(detail.message).toBeDefined();
        expect(detail.providedValue).toBeDefined();
      });
    });

    it('should provide context-specific help text', async () => {
      const endpoints = [
        '/api/v1/analysis/houses',
        '/api/v1/analysis/aspects',
        '/api/v1/analysis/arudha',
        '/api/v1/analysis/navamsa',
        '/api/v1/analysis/dasha'
      ];

      for (const endpoint of endpoints) {
        const response = await request(testApp)
          .post(endpoint)
          .send({})
          .expect(400);

        expect(response.body.helpText).toBeDefined();
        expect(response.body.helpText).toContain('birth data');
      }
    });

    it('should provide suggestions for common errors', async () => {
      const response = await request(testApp)
        .post('/api/v1/chart/generate')
        .send({ dateOfBirth: 'invalid', timeOfBirth: '25:00' })
        .expect(400);

      expect(response.body.suggestions).toBeInstanceOf(Array);
      expect(response.body.suggestions.length).toBeGreaterThan(0);
      expect(response.body.suggestions.some(s => s.includes('YYYY-MM-DD'))).toBe(true);
    });
  });

  describe('Unit Tests for Validation Functions', () => {
    describe('validateBirthData', () => {
      it('should validate birth data correctly', () => {
        const result = validateBirthData(validBirthData);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should catch validation errors', () => {
        const result = validateBirthData(invalidBirthData);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });

    describe('validateChartRequest', () => {
      it('should validate chart request without name requirement', () => {
        const result = validateChartRequest(validChartData);
        expect(result.isValid).toBe(true);
      });
    });

    describe('Analysis validators', () => {
      const validators = [
        { name: 'validateHouseAnalysis', fn: validateHouseAnalysis },
        { name: 'validateAspectAnalysis', fn: validateAspectAnalysis },
        { name: 'validateArudhaAnalysis', fn: validateArudhaAnalysis },
        { name: 'validateNavamsaAnalysis', fn: validateNavamsaAnalysis },
        { name: 'validateDashaAnalysis', fn: validateDashaAnalysis }
      ];

      validators.forEach(({ name, fn }) => {
        describe(name, () => {
          it('should require name field', () => {
            const dataWithoutName = { ...validBirthData };
            delete dataWithoutName.name;

            const result = fn(dataWithoutName);
            expect(result.isValid).toBe(false);
            expect(result.errors.some(e => e.field === 'name')).toBe(true);
          });

          it('should accept valid data with name', () => {
            const result = fn(validBirthData);
            expect(result.isValid).toBe(true);
          });
        });
      });
    });

    describe('validateBirthDataValidation', () => {
      it('should not require name field', () => {
        const dataWithoutName = { ...validBirthData };
        delete dataWithoutName.name;

        const result = validateBirthDataValidation(dataWithoutName);
        expect(result.isValid).toBe(true);
      });
    });
  });

  describe('Performance and Load Testing', () => {
    it('should handle multiple concurrent requests', async () => {
      const requests = Array(10).fill().map(() =>
        request(testApp)
          .post('/api/v1/chart/generate')
          .send(validChartData)
      );

      const responses = await Promise.all(requests);
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
    });

    it('should respond within reasonable time limits', async () => {
      const startTime = Date.now();

      await request(testApp)
        .post('/api/v1/analysis/comprehensive')
        .send({ birthData: validBirthData })
        .expect(200);

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(10000); // 10 seconds max
    });
  });
});

// Export test data - commenting out exports since this module is used as a test file, not a utility
// module.exports = {
//   validBirthData,
//   validChartData,
//   invalidBirthData,
//   missingRequiredFields,
//   edgeCases
// };
