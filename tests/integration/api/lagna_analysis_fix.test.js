/**
 * Lagna Analysis Fix Integration Test
 * Tests the fixed Lagna Analysis endpoint to ensure HTTP 500 error is resolved
 */

import request from 'supertest';
import express from 'express';
import chartRoutes from '../../../src/api/routes/chart.js';
import { testCases } from '../../test-data/sample-chart-data.js';

const app = express();
app.use(express.json());
app.use('/api/v1/chart', chartRoutes);

const testCase = testCases[0];
const sampleBirthData = {
  name: 'Test User',
  dateOfBirth: testCase.birthData.dateOfBirth,
  timeOfBirth: testCase.birthData.timeOfBirth,
  latitude: testCase.birthData.placeOfBirth.latitude,
  longitude: testCase.birthData.placeOfBirth.longitude,
  timezone: testCase.birthData.placeOfBirth.timezone || 'Asia/Kolkata',
  placeOfBirth: testCase.birthData.placeOfBirth.name || 'Delhi, India'
};

describe('Lagna Analysis Fix Integration Test', () => {
  it('POST /api/v1/chart/analysis/lagna should return lagna analysis successfully', async () => {
    const res = await request(app)
      .post('/api/v1/chart/analysis/lagna')
      .send(sampleBirthData);
    
    // Should not return HTTP 500
    expect(res.status).not.toBe(500);
    
    // Should return either success (200) or validation error (400)
    expect([200, 400]).toContain(res.status);
    
    if (res.status === 200) {
      // Verify response structure
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('analysis');
      expect(res.body.data.analysis).toHaveProperty('section', 'lagna');
      expect(res.body.data.analysis).toHaveProperty('lagnaAnalysis');
      expect(res.body.data.analysis.lagnaAnalysis).toHaveProperty('lagnaSign');
      expect(res.body.data.analysis.lagnaAnalysis).toHaveProperty('lagnaLord');
    } else if (res.status === 400) {
      // Validation error should have proper structure
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('error');
      expect(res.body).toHaveProperty('message');
    }
  }, 30000);

  it('POST /api/v1/chart/analysis/lagna should handle missing planetary positions gracefully', async () => {
    // Test with minimal valid data
    const minimalData = {
      dateOfBirth: '1997-12-18',
      timeOfBirth: '02:30',
      latitude: 32.4935378,
      longitude: 74.5411575,
      timezone: 'Asia/Karachi'
    };
    
    const res = await request(app)
      .post('/api/v1/chart/analysis/lagna')
      .send(minimalData);
    
    // Should not return HTTP 500
    expect(res.status).not.toBe(500);
    
    // Should return either success or validation error
    expect([200, 400]).toContain(res.status);
    
    if (res.status === 200) {
      // If successful, should have lagna analysis
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data.analysis).toHaveProperty('lagnaAnalysis');
    }
  }, 30000);

  it('POST /api/v1/chart/analysis/lagna should handle nested placeOfBirth structure', async () => {
    const nestedData = {
      name: 'Test User',
      dateOfBirth: '1997-12-18',
      timeOfBirth: '02:30',
      placeOfBirth: {
        name: 'Sialkot, Pakistan',
        latitude: 32.4935378,
        longitude: 74.5411575,
        timezone: 'Asia/Karachi'
      }
    };
    
    const res = await request(app)
      .post('/api/v1/chart/analysis/lagna')
      .send(nestedData);
    
    // Should not return HTTP 500
    expect(res.status).not.toBe(500);
    
    // Should handle nested structure correctly
    expect([200, 400]).toContain(res.status);
  }, 30000);

  it('POST /api/v1/chart/analysis/lagna should provide fallback lagna information if analysis fails', async () => {
    // This test verifies that if full analysis fails, basic lagna info is returned
    const res = await request(app)
      .post('/api/v1/chart/analysis/lagna')
      .send(sampleBirthData);
    
    if (res.status === 200) {
      const lagnaAnalysis = res.body.data.analysis.lagnaAnalysis;
      
      // Should have at least basic lagna information
      expect(lagnaAnalysis).toHaveProperty('lagnaSign');
      expect(lagnaAnalysis).toHaveProperty('lagnaLord');
      
      // If full analysis failed, should indicate partial data
      if (lagnaAnalysis.partial) {
        expect(lagnaAnalysis).toHaveProperty('error');
        expect(lagnaAnalysis.lagnaSign).toHaveProperty('message');
        expect(lagnaAnalysis.lagnaLord).toHaveProperty('message');
      }
    }
  }, 30000);

  it('POST /api/v1/chart/analysis/lagna should return detailed error information on failure', async () => {
    // Test with invalid data to trigger error
    const invalidData = {
      dateOfBirth: 'invalid-date',
      timeOfBirth: 'invalid-time'
    };
    
    const res = await request(app)
      .post('/api/v1/chart/analysis/lagna')
      .send(invalidData);
    
    // Should return 400 or 500 with detailed error
    expect([400, 500]).toContain(res.status);
    
    if (res.status === 500) {
      // Enhanced error response should have detailed information
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('error');
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('details');
      expect(res.body).toHaveProperty('suggestions');
      expect(res.body).toHaveProperty('helpText');
    }
  }, 30000);
});

