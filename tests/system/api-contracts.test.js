/**
 * API Contract Preservation Tests
 * Ensures 100% backward compatibility for all existing BTR endpoints
 */

import request from 'supertest';
import express from 'express';
import rectificationRoutes from '../../src/api/routes/birthTimeRectification.js';

const app = express();
app.use(express.json());
app.use('/api/v1/rectification', rectificationRoutes);

describe('API Contract Preservation', () => {
  const API_BASE = 'http://localhost:3001/api/v1/rectification';
  const testData = {
    validBirthData: {
      dateOfBirth: '1997-12-18',
      timeOfBirth: '02:30',
      placeOfBirth: 'Sialkot, Pakistan',
      latitude: 32.4935378,
      longitude: 74.5411575,
      timezone: 'Asia/Karachi'
    }
  };

  describe('POST /api/v1/rectification/analyze - EXISTING ENDPOINT', () => {
    test('should maintain exact same response structure', async () => {
      const response = await request(app)
        .post('/api/v1/rectification/analyze')
        .send({
          birthData: testData.validBirthData,
          options: {}
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      // Verify original response structure unchanged
      const rectification = response.body.rectification;
      expect(rectification.originalData).toBeDefined();
      expect(rectification.methods).toBeDefined();
      expect(rectification.confidence).toBeDefined();
      expect(rectification.rectifiedTime).toBeDefined();
      expect(rectification.analysisLog).toBeDefined();
      expect(rectification.recommendations).toBeDefined();
      
      // Verify original methods present with same structure
      expect(rectification.methods.praanapada).toBeDefined();
      expect(rectification.methods.moon).toBeDefined();
      expect(rectification.methods.gulika).toBeDefined();
      
      // Verify new methods not appearing unless explicitly requested
      expect(rectification.methods.hora).toBeUndefined();
      expect(rectification.methods.conditionalDashas).toBeUndefined();
    });

    test('should preserve original error handling', async () => {
      const response = await request(app)
        .post('/api/v1/rectification/analyze')
        .send({
          birthData: {}, // Invalid data
          options: {}
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
      expect(response.body.details).toBeDefined();
      
      // Verify validation error structure
      expect(response.body.error).toBe('Validation failed');
      expect(Array.isArray(response.body.details)).toBe(true);
      expect(response.body.details.length).toBeGreaterThan(0);
      expect(response.body.details[0]).toHaveProperty('message');
      expect(response.body.details[0]).toHaveProperty('path');
    });
  });

  describe('POST /api/v1/rectification/quick - EXISTING ENDPOINT', () => {
    test('should preserve original behavior exactly', async () => {
      const response = await request(app)
        .post('/api/v1/rectification/quick')
        .send({
          birthData: testData.validBirthData,
          proposedTime: '02:30'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      // Verify original response structure
      const validation = response.body.validation;
      expect(validation.proposedTime).toBe('02:30');
      expect(validation.confidence).toBeDefined();
      expect(validation.praanapada).toBeDefined();
      expect(validation.ascendant).toBeDefined();
      expect(validation.alignmentScore).toBeDefined();
      expect(validation.recommendations).toBeDefined();
      expect(validation.analysisLog).toBeDefined();
      
      // Verify no new fields appear
      expect(validation.horaAnalysis).toBeUndefined();
      expect(validation.conditionalDashaAnalysis).toBeUndefined();
    });
  });

  describe('POST /api/v1/rectification/with-events - EXISTING ENDPOINT', () => {
    test('should maintain original event correlation structure', async () => {
      const response = await request(app)
        .post('/api/v1/rectification/with-events')
        .send({
          birthData: testData.validBirthData,
          lifeEvents: [
            { date: '2020-01-15', description: 'Started new job' }
          ]
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      // Verify original structure
      expect(response.body.lifeEvents).toBeDefined();
      expect(response.body.correlationScore).toBeDefined();
      expect(response.body.rectification).toBeDefined();
      
      // Verify original events method structure
      const rectification = response.body.rectification;
      expect(rectification.methods.events).toBeDefined();
      expect(rectification.methods.events.candidates).toBeDefined();
      expect(rectification.methods.events.bestCandidate).toBeDefined();
      
      // Verify no new event classification features appear by default
      const eventsMethod = rectification.methods.events;
      expect(eventsMethod.detailedClassification).toBeUndefined();
      expect(eventsMethod.conditionalDashaCorrelation).toBeUndefined();
    });
  });

  describe('POST /api/v1/rectification/methods - EXISTING ENDPOINT', () => {
    test('should preserve original method descriptions', async () => {
      const response = await request(app)
        .post('/api/v1/rectification/methods')
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      // Verify original methods present
      const methods = response.body.methods;
      expect(methods.praanapada).toBeDefined();
      expect(methods.moon).toBeDefined();
      expect(methods.gulika).toBeDefined();
      expect(methods.events).toBeDefined();
      
      // Verify original method structure unchanged
      expect(methods.praanapada.name).toBe('Praanapada Method');
      expect(methods.praanapada.accuracy).toBe('High');
      expect(methods.praanapada.required).toContain('dateOfBirth');
      expect(methods.praanapada.required).toContain('timeOfBirth');
      expect(methods.praanapada.required).toContain('placeOfBirth');
      
      // Verify no new methods appear
      expect(methods.hora).toBeUndefined();
      expect(methods.conditionalDasha).toBeUndefined();
      expect(methods.detailedEventClassification).toBeUndefined();
    });
  });

  describe('GET /api/v1/rectification/test - EXISTING ENDPOINT', () => {
    test('should preserve original health check response', async () => {
      const response = await request(app)
        .get('/api/v1/rectification/test');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Birth Time Rectification API is working');
      expect(response.body.service).toBe('BPHS-based Birth Time Rectification');
      expect(response.body.status).toBe('Operational');
    });
  });
});
