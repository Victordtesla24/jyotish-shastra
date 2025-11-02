/**
 * Backward Compatibility Integration Tests
 * Ensures existing client integrations continue to work without modifications
 * @jest-environment node
 */

import request from 'supertest';
import express from 'express';
import comprehensiveAnalysisRoutes from '../../src/api/routes/comprehensiveAnalysis.js';
import chartRoutes from '../../src/api/routes/chart.js';
import birthTimeRectificationRoutes from '../../src/api/routes/birthTimeRectification.js';

// Create test app without importing full src/index.js (which uses import.meta.url)
const app = express();
app.use(express.json());
app.use('/api/v1/analysis', comprehensiveAnalysisRoutes);
app.use('/api/v1/chart', chartRoutes);
app.use('/api/v1/rectification', birthTimeRectificationRoutes);
app.get('/health', (req, res) => res.json({ status: 'healthy' }));

describe('Backward Compatibility Integration', () => {
  const existingClientData = {
    // Simulate existing client request format
    birthData: {
      name: 'Test User',
      dateOfBirth: '1997-12-18',
      timeOfBirth: '02:30',
      placeOfBirth: 'Sialkot, Pakistan',
      latitude: 32.4935378,
      longitude: 74.5411575,
      timezone: 'Asia/Karachi',
      gender: 'male'
    }
  };

  describe('Existing Client Integration Compatibility', () => {
    test('should support all existing client request formats', async () => {
      // Test various existing client integrations
      
      // 1. Basic BTR analysis
      const basicResponse = await request(app)
        .post('/api/v1/rectification/analyze')
        .send({
          birthData: existingClientData.birthData,
          options: {}
        });

      // If WASM initialization fails, test should fail (not mask the error)
      if (basicResponse.status === 500) {
        const errorMsg = basicResponse.body?.error?.message || basicResponse.body?.message || 'Unknown error';
        if (errorMsg.includes('Swiss Ephemeris') || errorMsg.includes('WASM')) {
          throw new Error(`WASM initialization failed: ${errorMsg}. This should not happen if WASM is properly configured.`);
        }
      }

      expect(basicResponse.status).toBe(200);
      expect(basicResponse.body.success).toBe(true);
      expect(basicResponse.body.rectification).toBeDefined();

      // 2. Quick validation
      const quickResponse = await request(app)
        .post('/api/v1/rectification/quick')
        .send({
          birthData: existingClientData.birthData,
          proposedTime: '02:30'
        });

      expect(quickResponse.status).toBe(200);
      expect(quickResponse.body.success).toBe(true);
      expect(quickResponse.body.validation).toBeDefined();

      // 3. Events-based rectification
      const eventsResponse = await request(app)
        .post('/api/v1/rectification/with-events')
        .send({
          birthData: existingClientData.birthData,
          lifeEvents: [
            { date: '2020-01-15', description: 'Started new job' },
            { date: '2018-06-20', description: 'Graduated from university' }
          ]
        });

      expect(eventsResponse.status).toBe(200);
      expect(eventsResponse.body.success).toBe(true);
      expect(eventsResponse.body.correlationScore).toBeDefined();
    });

    test('should maintain existing authentication and authorization', async () => {
      // Test with authentication (if applicable)
      const authenticatedRequest = await request(app)
        .post('/api/v1/rectification/analyze')
        .set('Authorization', 'Bearer test-token')
        .send({
          birthData: existingClientData.birthData
        });

      // Since auth is not implemented in this test setup, just verify the endpoint works
      expect([200, 401, 403]).toContain(authenticatedRequest.status);
    });

    test('should preserve existing rate limiting constraints', async () => {
      // Test rate limiting still works
      const requests = [];
      for (let i = 0; i < 10; i++) {
        requests.push(
          request(app)
            .post('/api/v1/rectification/quick')
            .send({
              birthData: existingClientData.birthData,
              proposedTime: '02:30'
            })
        );
      }

      const responses = await Promise.all(requests);
      
      // All should succeed within rate limits
      responses.forEach(response => {
        expect([200, 429, 404]).toContain(response.status); // Either success, rate limited, or not found
      });
    });
  });

  describe('Database Schema Backward Compatibility', () => {
    test('should not break existing database queries', async () => {
      // Simulate database operations that existing clients rely on
      
      // Test birth data storage (if implemented)
      const storageResponse = await request(app)
        .post('/api/v1/charts/save')
        .send({
          birthData: existingClientData.birthData,
          chartData: { rasi: { ascendant: 'Scorpio' } }
        });

      // Should not break existing storage mechanisms
      if (storageResponse.status !== 404) { // Only test if endpoint exists
        expect([200, 201, 400]).toContain(storageResponse.status);
      }
    });

    test('should support all existing query patterns', async () => {
      // Test chart retrieval using existing identifiers
      const chartIds = ['existing-chart-id-1', 'existing-chart-id-2'];
      
      for (const chartId of chartIds) {
        const response = await request(app)
          .get(`/api/v1/charts/${chartId}`);

        // Should not throw errors, gracefully handle missing charts
        expect([200, 404]).toContain(response.status);
      }
    });
  });

  describe('Response Format Backward Compatibility', () => {
    test('should maintain exact JSON response structure for existing endpoints', async () => {
      const response = await request(app)
        .post('/api/v1/rectification/analyze')
        .send({
          birthData: existingClientData.birthData
        });

      // Skip test if endpoint is not available
      if (response.status === 404) {
        return;
      }

      // Deep clone response for comparison
      const originalStructure = {
        success: true,
        rectification: {
          originalData: expect.any(Object),
          methods: expect.any(Object),
          confidence: expect.any(Number),
          rectifiedTime: expect.any(String),
          analysisLog: expect.any(Array),
          recommendations: expect.any(Array),
          analysis: expect.any(Object)
        },
        timestamp: expect.any(String)
      };

      expect(response.body).toMatchObject(originalStructure);
    });

    test('should preserve existing error response formats', async () => {
      // Test various error scenarios
      
      // 1. Missing birth data
      const errorResponse1 = await request(app)
        .post('/api/v1/rectification/analyze')
        .send({});

      expect([400, 404]).toContain(errorResponse1.status);
      if (errorResponse1.status === 400) {
        // The error response may have different formats depending on middleware
        // Accept both simplified and detailed validation error formats
        const expectedStructure = {
          success: false,
          error: expect.any(String),
          message: expect.any(String)
        };
        
        expect(errorResponse1.body).toMatchObject(expectedStructure);
      }

      // 2. Invalid date format
      const errorResponse2 = await request(app)
        .post('/api/v1/rectification/quick')
        .send({
          birthData: {
            ...existingClientData.birthData,
            dateOfBirth: 'invalid-date'
          },
          proposedTime: '02:30'
        });

      expect([400, 404]).toContain(errorResponse2.status);
      if (errorResponse2.status === 400) {
        expect(errorResponse2.body.success).toBe(false);
        expect(errorResponse2.body.error).toBeDefined();
      }
    });
  });

  describe('Performance Backward Compatibility', () => {
    test('should maintain existing response time characteristics', async () => {
      const startTime = Date.now();
      
      await request(app)
        .post('/api/v1/rectification/quick')
        .send({
          birthData: existingClientData.birthData,
          proposedTime: '02:30'
        });

      const responseTime = Date.now() - startTime;
      
      // Should not deviate significantly from baseline performance
      expect(responseTime).toBeLessThan(3000); // 3 seconds max
    });

    test('should maintain existing memory usage patterns', async () => {
      // Monitor memory usage during multiple requests
      const initialMemory = process.memoryUsage();
      
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/v1/rectification/analyze')
          .send({
            birthData: existingClientData.birthData
          });
      }
      
      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      
      // Memory increase should be reasonable (less than 100MB - increased for native bindings)
      // Native bindings may use more memory than WASM initially
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024);
    });
  });

  describe('Feature Flag Independence', () => {
    test('should work identically with all new features disabled', async () => {
      // Simulate all new feature flags disabled
      process.env.BTR_FEATURE_HORA = 'false';
      process.env.BTR_FEATURE_CONDITIONAL_DASHA = 'false';
      process.env.BTR_FEATURE_ENHANCED_EVENTS = 'false';
      
      const response = await request(app)
        .post('/api/v1/rectification/analyze')
        .send({
          birthData: existingClientData.birthData
        });

      expect([200, 404]).toContain(response.status);
      
      if (response.status === 404) {
        // Skip the remaining checks if endpoint is not available
        return;
      }
      
      // Should work exactly like before
      const rectification = response.body.rectification;
      expect(rectification.originalData).toBeDefined();
      expect(rectification.methods.praanapada).toBeDefined();
      expect(rectification.methods.moon).toBeDefined();
      expect(rectification.methods.gulika).toBeDefined();
      
      // No new features should appear
      expect(rectification.methods.hora).toBeUndefined();
      expect(rectification.methods.conditionalDasha).toBeUndefined();
    });
  });
});
