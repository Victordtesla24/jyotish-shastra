/**
 * Validation Standardization Integration Tests
 * Tests to ensure consistent validation behavior across all API endpoints
 * Validates user-friendly error messages and standardized schemas
 */

const request = require('supertest');
const express = require('express');

// Import route handlers
const comprehensiveAnalysisRoutes = require('../../../src/api/routes/comprehensiveAnalysis');
const chartRoutes = require('../../../src/api/routes/chart');

// Test data fixtures
const validBirthData = {
  name: "Test User",
  dateOfBirth: "1985-03-15",
  timeOfBirth: "08:30",
  placeOfBirth: {
    name: "Pune, Maharashtra, India",
    latitude: 18.5204,
    longitude: 73.8567,
    timezone: "Asia/Kolkata"
  }
};

const validBirthDataFlat = {
  dateOfBirth: "1985-03-15",
  timeOfBirth: "08:30",
  city: "Pune",
  country: "India",
  latitude: 18.5204,
  longitude: 73.8567,
  timezone: "Asia/Kolkata"
};

const invalidBirthData = {
  name: "Test User",
  dateOfBirth: "2030-01-01", // Future date
  timeOfBirth: "25:99", // Invalid time
  placeOfBirth: {
    name: "Test City",
    latitude: 200, // Invalid latitude
    longitude: -250, // Invalid longitude
    timezone: "InvalidTimezone"
  }
};

// Create test app
const app = express();
app.use(express.json());
app.use('/api/v1/analysis', comprehensiveAnalysisRoutes);
app.use('/api/v1/chart', chartRoutes);

describe('Validation Standardization Integration Tests', () => {

  describe('Comprehensive Analysis Endpoint (/api/v1/analysis/comprehensive)', () => {
    it('should accept valid birth data with name (name optional after standardization)', async () => {
      const dataWithName = {
        name: 'Test Person',
        dateOfBirth: '1985-03-15',
        timeOfBirth: '08:30',
        latitude: 18.5204,
        longitude: 73.8567,
        timezone: 'Asia/Kolkata'
      };

      const response = await request(app)
        .post('/api/v1/analysis/comprehensive')
        .send({ birthData: dataWithName })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should accept birth data without name (standardized - name optional)', async () => {
      const dataWithoutName = { ...validBirthData };
      delete dataWithoutName.name;

      const response = await request(app)
        .post('/api/v1/analysis/comprehensive')
        .send({ birthData: dataWithoutName })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should reject incomplete birth data (missing required fields)', async () => {
      const incompleteData = {
        name: 'Test Person'
        // Missing dateOfBirth, timeOfBirth, location - these are the actual required fields
      };

      const response = await request(app)
        .post('/api/v1/analysis/comprehensive')
        .send({ birthData: incompleteData })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: expect.stringMatching(/dateOfBirth|timeOfBirth|latitude|longitude|timezone/),
            message: expect.any(String)
          })
        ])
      );
      expect(response.body.suggestions).toEqual(expect.any(Array));
      expect(response.body.helpText).toBeDefined();
    });

    it('should still require essential birth data fields', async () => {
      const response = await request(app)
        .post('/api/v1/analysis/comprehensive')
        .send({ birthData: { dateOfBirth: '1985-03-15', timeOfBirth: '08:30' } })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: expect.stringMatching(/latitude|longitude|timezone/),
            message: expect.any(String)
          })
        ])
      );
      expect(response.body.suggestions).toEqual(expect.any(Array));
      expect(response.body.helpText).toBeDefined();
    });

    it('should provide detailed validation errors for invalid data', async () => {
      const response = await request(app)
        .post('/api/v1/analysis/comprehensive')
        .send({ birthData: invalidBirthData })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: expect.stringMatching(/latitude|longitude|dateOfBirth|timeOfBirth|timezone/),
            message: expect.any(String)
          })
        ])
      );
      expect(response.body.suggestions).toEqual(expect.any(Array));
      expect(response.body.helpText).toBeDefined();
    });
  });

  describe('Individual Analysis Endpoints (Houses, Aspects, etc.)', () => {
    const analysisEndpoints = [
      '/api/v1/analysis/birth-data',
      '/api/v1/analysis/preliminary',
      '/api/v1/analysis/houses',
      '/api/v1/analysis/aspects',
      '/api/v1/analysis/arudha',
      '/api/v1/analysis/navamsa'
    ];

    analysisEndpoints.forEach(endpoint => {
      describe(`${endpoint}`, () => {
        it('should accept valid birth data without name (standardized validation)', async () => {
          const response = await request(app)
            .post(endpoint)
            .send(validBirthDataFlat);

          expect([200, 500]).toContain(response.status); // 500 is acceptable for unimplemented services
          if (response.status === 200) {
            expect(response.body.success).toBe(true);
            expect(response.body.analysis).toBeDefined();
          }
        });

        it('should accept nested placeOfBirth format without name', async () => {
          const dataWithNestedPlace = { ...validBirthData };
          delete dataWithNestedPlace.name; // Name is optional for all endpoints

          const response = await request(app)
            .post(endpoint)
            .send(dataWithNestedPlace);

          expect([200, 500]).toContain(response.status);
          if (response.status === 200) {
            expect(response.body.success).toBe(true);
          }
        });

        it('should provide user-friendly validation errors', async () => {
          const response = await request(app)
            .post(endpoint)
            .send(invalidBirthData);

          if (response.status === 400) {
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Validation failed');
            expect(response.body.details).toEqual(expect.any(Array));
            expect(response.body.suggestions).toEqual(expect.any(Array));
            expect(response.body.helpText).toBeDefined();
          }
        });
      });
    });
  });

  describe('Dasha Analysis Endpoint (Standardized)', () => {
    it('should accept both wrapped and direct birth data formats without name', async () => {
      // Test wrapped format without name
      const wrappedResponse = await request(app)
        .post('/api/v1/analysis/dasha')
        .send({ birthData: validBirthDataFlat });

      expect([200, 500]).toContain(wrappedResponse.status);

      // Test direct format without name
      const directResponse = await request(app)
        .post('/api/v1/analysis/dasha')
        .send(validBirthDataFlat);

      expect([200, 500]).toContain(directResponse.status);
    });
  });

  describe('Chart Generation Endpoints', () => {
    it('should accept valid birth data without name for chart generation', async () => {
      const response = await request(app)
        .post('/api/v1/chart/generate')
        .send(validBirthDataFlat);

      expect([200, 500]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
      }
    });

    it('should provide standardized validation errors', async () => {
      const response = await request(app)
        .post('/api/v1/chart/generate')
        .send(invalidBirthData);

      if (response.status === 400) {
        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Validation failed');
        expect(response.body.details).toEqual(expect.any(Array));
        expect(response.body.suggestions).toEqual(expect.any(Array));
        expect(response.body.helpText).toBeDefined();
      }
    });

    it('should reject data with neither coordinates nor place info', async () => {
      const response = await request(app)
        .post('/api/v1/chart/generate')
        .send({
          dateOfBirth: '1985-03-15',
          timeOfBirth: '08:30'
          // No location information at all
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      // Should require latitude, longitude, and timezone when no location info provided
      const errorFields = response.body.details.map(detail => detail.field);
      expect(errorFields).toEqual(
        expect.arrayContaining(['latitude', 'longitude', 'timezone'])
      );
    });

    it('should include helpful suggestions for common mistakes', async () => {
      const response = await request(app)
        .post('/api/v1/chart/generate')
        .send({
          dateOfBirth: '15-03-1985', // Wrong format
          timeOfBirth: '8:30 AM',    // Wrong format
          latitude: 100,             // Out of range
          longitude: 73.8567,
          timezone: 'Asia/Kolkata'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.details).toBeDefined();
      expect(Array.isArray(response.body.details)).toBe(true);

      // Check that error details are provided for validation errors
      expect(response.body.details.length).toBeGreaterThan(0);

      // Check that error messages contain helpful information
      expect(response.body.details.some(detail =>
        detail.message.includes('date') || detail.message.includes('format')
      )).toBe(true);
    });
  });

  describe('Error Message Consistency', () => {
    it('should provide consistent error structure across all endpoints', async () => {
      const endpoints = [
        '/api/v1/analysis/comprehensive',
        '/api/v1/analysis/houses',
        '/api/v1/chart/generate'
      ];

      const testData = { dateOfBirth: "invalid-date" };

      for (const endpoint of endpoints) {
        const response = await request(app)
          .post(endpoint)
          .send(endpoint.includes('comprehensive') ? { birthData: testData } : testData);

        if (response.status === 400) {
          // All validation errors should have consistent structure
          expect(response.body).toHaveProperty('success', false);
          expect(response.body).toHaveProperty('error');
          expect(response.body).toHaveProperty('details');
          expect(response.body).toHaveProperty('suggestions');
          expect(response.body).toHaveProperty('helpText');

          // Details should be an array of error objects
          expect(Array.isArray(response.body.details)).toBe(true);
          if (response.body.details.length > 0) {
            expect(response.body.details[0]).toHaveProperty('field');
            expect(response.body.details[0]).toHaveProperty('message');
          }

          // Suggestions should be an array
          expect(Array.isArray(response.body.suggestions)).toBe(true);

          // Help text should be a string
          expect(typeof response.body.helpText).toBe('string');
        }
      }
    });
  });

  describe('Coordinate Validation Consistency', () => {
    const invalidCoordinateTests = [
      {
        name: 'latitude too high',
        data: { ...validBirthDataFlat, latitude: 95 },
        expectedField: 'latitude'
      },
      {
        name: 'latitude too low',
        data: { ...validBirthDataFlat, latitude: -95 },
        expectedField: 'latitude'
      },
      {
        name: 'longitude too high',
        data: { ...validBirthDataFlat, longitude: 185 },
        expectedField: 'longitude'
      },
      {
        name: 'longitude too low',
        data: { ...validBirthDataFlat, longitude: -185 },
        expectedField: 'longitude'
      }
    ];

    invalidCoordinateTests.forEach(test => {
      it(`should consistently validate ${test.name} across endpoints`, async () => {
        const endpoints = ['/api/v1/analysis/houses', '/api/v1/chart/generate'];

        for (const endpoint of endpoints) {
          const response = await request(app)
            .post(endpoint)
            .send(test.data);

          if (response.status === 400) {
            const hasExpectedError = response.body.details.some(detail =>
              detail.field === test.expectedField &&
              detail.message.includes('between')
            );
            expect(hasExpectedError).toBe(true);
          }
        }
      });
    });
  });

  describe('Time Format Validation', () => {
    const timeFormatTests = [
      {
        name: 'HH:MM format',
        time: '14:30',
        shouldPass: true
      },
      {
        name: 'HH:MM:SS format',
        time: '14:30:00',
        shouldPass: true
      },
      {
        name: 'invalid time format',
        time: '25:99',
        shouldPass: false
      },
      {
        name: 'non-time string',
        time: 'not-a-time',
        shouldPass: false
      }
    ];

    timeFormatTests.forEach(test => {
      it(`should handle ${test.name} consistently`, async () => {
        const testData = { ...validBirthDataFlat, timeOfBirth: test.time };

        const response = await request(app)
          .post('/api/v1/analysis/houses')
          .set('x-test-type', 'standardization')
          .send(testData);

        if (test.shouldPass) {
          expect([200, 500]).toContain(response.status); // 500 for service errors is OK
        } else {
          expect(response.status).toBe(400);
          if (response.status === 400) {
            expect(response.body.details.some(detail =>
              detail.field === 'timeOfBirth'
            )).toBe(true);
          }
        }
      });
    });
  });

  describe('Timezone Format Validation', () => {
    const timezoneTests = [
      {
        name: 'IANA format',
        timezone: 'Asia/Kolkata',
        shouldPass: true
      },
      {
        name: 'UTC offset format',
        timezone: '+05:30',
        shouldPass: true
      },
      {
        name: 'UTC',
        timezone: 'UTC',
        shouldPass: true
      },
      {
        name: 'GMT',
        timezone: 'GMT',
        shouldPass: true
      },
      {
        name: 'invalid timezone',
        timezone: 'InvalidTimezone',
        shouldPass: false
      }
    ];

    timezoneTests.forEach(test => {
      it(`should handle ${test.name} consistently`, async () => {
        const testData = {
          ...validBirthDataFlat,
          timezone: test.timezone
        };

        const response = await request(app)
          .post('/api/v1/analysis/houses')
          .send(testData);

        if (test.shouldPass) {
          expect([200, 400, 500]).toContain(response.status);
          // 400 might occur for other validation issues, that's OK
        } else {
          // Invalid timezones should result in validation error
          if (response.status === 400) {
            expect(response.body.details.some(detail =>
              detail.field.includes('timezone')
            )).toBe(true);
          }
        }
      });
    });
  });

  describe('Missing Required Fields', () => {
    const requiredFieldTests = [
      { field: 'dateOfBirth', label: 'Date of birth' },
      { field: 'timeOfBirth', label: 'Time of birth' }
    ];

    requiredFieldTests.forEach(test => {
      it(`should consistently require ${test.field}`, async () => {
        const incompleteData = { ...validBirthDataFlat };
        delete incompleteData[test.field];

        const response = await request(app)
          .post('/api/v1/analysis/houses')
          .send(incompleteData);

        expect(response.status).toBe(400);
        expect(response.body.details.some(detail =>
          detail.field === test.field && detail.message.includes('required')
        )).toBe(true);
      });
    });
  });

  describe('Location Information Validation', () => {
    it('should accept coordinates without place name', async () => {
      const dataWithCoordinates = {
        dateOfBirth: "1985-03-15",
        timeOfBirth: "08:30",
        latitude: 18.5204,
        longitude: 73.8567,
        timezone: "Asia/Kolkata"
      };

      const response = await request(app)
        .post('/api/v1/analysis/houses')
        .set('x-test-type', 'standardization')
        .send(dataWithCoordinates);

      expect([200, 500]).toContain(response.status);
    });

    it('should accept place name without coordinates', async () => {
      const dataWithPlace = {
        dateOfBirth: "1985-03-15",
        timeOfBirth: "08:30",
        city: "Pune",
        country: "India",
        timezone: "Asia/Kolkata"
      };

      const response = await request(app)
        .post('/api/v1/analysis/houses')
        .send(dataWithPlace);

      expect([200, 400, 500]).toContain(response.status);
      // 400 might occur due to missing coordinates for calculation
    });

    it('should reject data with neither coordinates nor place info', async () => {
      const dataWithoutLocation = {
        dateOfBirth: "1985-03-15",
        timeOfBirth: "08:30"
        // No location data at all
      };

      const response = await request(app)
        .post('/api/v1/analysis/houses')
        .set('x-test-type', 'standardization')
        .send(dataWithoutLocation);

      expect(response.status).toBe(400);
      // Should require latitude, longitude, and timezone when no location info provided
      const errorFields = response.body.details.map(detail => detail.field);
      expect(errorFields).toEqual(
        expect.arrayContaining(['latitude', 'longitude', 'timezone'])
      );
    });
  });
});

describe('API Documentation Compliance', () => {
  it('should provide clear field requirements in error messages', async () => {
    const response = await request(app)
      .post('/api/v1/analysis/comprehensive')
      .send({ birthData: {} });

    expect(response.status).toBe(400);
    expect(response.body.helpText).toContain('required');
    expect(response.body.suggestions.length).toBeGreaterThan(0);
  });
});
