/**
 * End-to-End API Workflow Tests
 * Tests the complete flow from birth data input to report generation
 */

const request = require('supertest');
const app = require('../../src/index');
const { testCases } = require('../fixtures/sample-birth-data.json');
const sampleBirthData = testCases[0].birthData;
const invalidBirthData = { ...sampleBirthData, dateOfBirth: '' };

describe('E2E: Complete Astrology Analysis Workflow', () => {
  let chartId;

  it('should process birth data through chart generation to comprehensive analysis', async () => {
    // Step 1: Generate Chart
    const chartResponse = await request(app)
      .post('/api/v1/chart/generate')
      .send(sampleBirthData)
      .expect(200);

    expect(chartResponse.body.success).toBe(true);
    expect(chartResponse.body.data).toHaveProperty('chartId');
    chartId = chartResponse.body.data.chartId;

    // Step 2: Request Comprehensive Analysis
    const analysisResponse = await request(app)
      .post('/api/v1/analysis/comprehensive')
      .send({ chartId })
      .expect(200);

    expect(analysisResponse.body.success).toBe(true);
    expect(analysisResponse.body.data).toHaveProperty('analysisId');
    const analysisId = analysisResponse.body.data.analysisId;

    // Retrieve the analysis results
    const resultsResponse = await request(app)
      .get(`/api/v1/analysis/${analysisId}`)
      .expect(200);

    expect(resultsResponse.body.success).toBe(true);
  }, 30000); // Increased timeout for long-running process

  it('should handle invalid birth data gracefully', async () => {
    const chartResponse = await request(app)
      .post('/api/v1/chart/generate')
      .send(invalidBirthData)
      .expect(400);

    expect(chartResponse.body.success).toBe(false);
  });

  describe('Data Validation and Error Handling', () => {
    it('should validate required fields in birth data', async () => {
      const incompleteData = { ...sampleBirthData, dateOfBirth: '' };
      const response = await request(app)
        .post('/api/v1/chart/generate')
        .send(incompleteData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it('should handle geographic coordinate validation', async () => {
      const invalidCoordinates = { ...sampleBirthData, latitude: 'invalid' };
      const response = await request(app)
        .post('/api/v1/chart/generate')
        .send(invalidCoordinates)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should validate date and time formats', async () => {
      const invalidDateTime = { ...sampleBirthData, timeOfBirth: '99:99' };
      const response = await request(app)
        .post('/api/v1/chart/generate')
        .send(invalidDateTime)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Performance and Reliability', () => {
    it('should complete full analysis within reasonable time', async () => {
      const startTime = Date.now();

      const response = await request(app)
        .post('/api/v1/chart/generate')
        .send(sampleBirthData)
        .expect(200);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within 5 seconds
      expect(duration).toBeLessThan(5000);
      expect(response.body.success).toBe(true);
    }, 10000);

    it('should handle concurrent requests without errors', async () => {
      const requests = Array(5).fill(null).map(() =>
        request(app)
          .post('/api/v1/chart/generate')
          .send(sampleBirthData)
      );

      const responses = await Promise.all(requests);

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
    });
  });
});
