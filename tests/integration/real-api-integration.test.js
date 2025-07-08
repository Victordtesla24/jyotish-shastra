const axios = require('axios');

describe('Real API Integration Tests', () => {
  const API_BASE_URL = 'http://localhost:3001';

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
    const response = await axios.get(`${API_BASE_URL}/health`);
    expect(response.status).toBe(200);
    expect(response.data.status).toBe('healthy');
  });

  test('Comprehensive analysis API should return real data', async () => {
    const response = await axios.post(`${API_BASE_URL}/api/v1/analysis/comprehensive`, realBirthData);

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.analysis).toBeDefined();
    expect(response.data.analysis.sections).toBeDefined();

    // Check that we have all 8 sections
    const sections = response.data.analysis.sections;
    expect(Object.keys(sections)).toHaveLength(8);

    // Check section 2 (Lagna & Luminaries) has real data
    const section2 = sections.section2;
    expect(section2).toBeDefined();
    expect(section2.name).toBe('Lagna & Luminaries Analysis');
    expect(section2.analyses).toBeDefined();
    expect(section2.analyses.lagna).toBeDefined();

    // Verify it's real calculated data, not mock data
    const lagna = section2.analyses.lagna;
    expect(lagna.lagnaSign).toBeDefined();
    expect(lagna.lagnaSign.sign).toBeDefined();
    expect(lagna.lagnaSign.ruler).toBeDefined();

    // Response should be substantial (>50KB indicates real analysis)
    const responseSize = JSON.stringify(response.data).length;
    expect(responseSize).toBeGreaterThan(50000);
  });

  test('Chart generation API should return real calculations', async () => {
    const response = await axios.post(`${API_BASE_URL}/api/v1/chart/generate`, realBirthData);

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.chart).toBeDefined();
    expect(response.data.chart.planetaryPositions).toBeDefined();

    // Check that planets have real calculated positions
    const planets = response.data.chart.planetaryPositions;
    expect(planets.sun).toBeDefined();
    expect(planets.moon).toBeDefined();
    expect(typeof planets.sun.longitude).toBe('number');
    expect(typeof planets.moon.longitude).toBe('number');
  });

  test('API should handle invalid data correctly', async () => {
    const invalidData = {
      dateOfBirth: "invalid-date",
      timeOfBirth: "25:00",
      latitude: 200,
      longitude: 300
    };

    try {
      await axios.post(`${API_BASE_URL}/api/v1/analysis/comprehensive`, invalidData);
      fail('Should have thrown an error for invalid data');
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.success).toBe(false);
    }
  });
});
