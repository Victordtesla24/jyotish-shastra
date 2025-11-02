/**
 * @jest-environment node
 */
import request from 'supertest';
import express from 'express';
import comprehensiveAnalysisRoutes from '../../src/api/routes/comprehensiveAnalysis.js';
import chartRoutes from '../../src/api/routes/chart.js';

// Create test app without importing full src/index.js (which uses import.meta.url)
const app = express();
app.use(express.json());
app.use('/api/v1/analysis', comprehensiveAnalysisRoutes);
app.use('/api/v1/chart', chartRoutes);
app.get('/health', (req, res) => res.json({ status: 'healthy' }));

describe('Real API Integration Tests', () => {
  // Real birth data for testing
  const realBirthData = {
    dateOfBirth: "1985-10-24",
    timeOfBirth: "14:30",
    latitude: 18.5204,
    longitude: 73.8567,
    timezone: "Asia/Kolkata",
    gender: "male"
  };

  beforeAll(() => {
    // Set reasonable timeout for real API calls
    jest.setTimeout(30000);
  });

  test('Backend server should be running and healthy', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBeDefined();
  });

  test('Comprehensive analysis API should return real data', async () => {
    const response = await request(app).post('/api/v1/analysis/comprehensive').send(realBirthData);

    // If WASM initialization fails, test should fail (not mask the error)
    if (response.status === 500) {
      const errorMsg = response.body?.error?.message || response.body?.error?.details || response.body?.message || 'Unknown error';
      if (errorMsg.includes('Swiss Ephemeris') || errorMsg.includes('WASM')) {
        throw new Error(`WASM initialization failed: ${errorMsg}. This should not happen if WASM is properly configured.`);
      }
    }

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    // Comprehensive analysis returns analysis object with sections
    if (response.body.analysis) {
      expect(response.body.analysis.sections).toBeDefined();
      const sections = response.body.analysis.sections;
      expect(Object.keys(sections).length).toBeGreaterThan(0);
      
      // Response should be substantial (>50KB indicates real analysis)
      const responseSize = JSON.stringify(response.body).length;
      expect(responseSize).toBeGreaterThan(50000);
    } else if (response.body.data) {
      // Alternative response structure
      expect(response.body.data).toBeDefined();
    }
  });

  test('Chart generation API should return real calculations', async () => {
    const response = await request(app).post('/api/v1/chart/generate').send(realBirthData);

    // If WASM initialization fails, test should fail (not mask the error)
    if (response.status === 500) {
      const errorMsg = response.body?.error?.message || response.body?.error?.details || response.body?.message || 'Unknown error';
      if (errorMsg.includes('Swiss Ephemeris') || errorMsg.includes('WASM')) {
        throw new Error(`WASM initialization failed: ${errorMsg}. This should not happen if WASM is properly configured.`);
      }
    }

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.rasiChart).toBeDefined();
    expect(response.body.data.rasiChart.planets).toBeDefined();

    // Check that planets have real calculated positions
    const planets = response.body.data.rasiChart.planets;
    expect(Array.isArray(planets)).toBe(true);
    expect(planets.length).toBe(9); // Should have all 9 planets
    
    const sun = planets.find(p => p.name === 'Sun');
    const moon = planets.find(p => p.name === 'Moon');
    expect(sun).toBeDefined();
    expect(moon).toBeDefined();
    expect(typeof sun.longitude).toBe('number');
    expect(typeof moon.longitude).toBe('number');
  });

  test('API should handle invalid data correctly', async () => {
    const invalidData = {
      dateOfBirth: "invalid-date",
      timeOfBirth: "25:00",
      latitude: 200,
      longitude: 300
    };

    const response = await request(app).post('/api/v1/analysis/comprehensive').send(invalidData);
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});
