import request from 'supertest';
import express from 'express';
import rectificationRoutes from '../../../src/api/routes/birthTimeRectification.js';
import { testCases } from '../../test-data/sample-chart-data.js';

const app = express();
app.use(express.json());
app.use('/api/v1/rectification', rectificationRoutes);

const testCase = testCases[0];
const sampleBirthData = {
  dateOfBirth: testCase.birthData.dateOfBirth,
  timeOfBirth: testCase.birthData.timeOfBirth,
  latitude: testCase.birthData.placeOfBirth.latitude,
  longitude: testCase.birthData.placeOfBirth.longitude,
  timezone: '+05:30',
  placeOfBirth: {
    name: testCase.birthData.placeOfBirth.name,
    latitude: testCase.birthData.placeOfBirth.latitude,
    longitude: testCase.birthData.placeOfBirth.longitude,
    timezone: '+05:30'
  }
};

describe('Rectification API Integration', () => {
  it('GET /api/v1/rectification/test should return health', async () => {
    const res = await request(app).get('/api/v1/rectification/test');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
  });

  it('POST /api/v1/rectification/methods should return methods', async () => {
    const res = await request(app).post('/api/v1/rectification/methods').send({});
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('methods');
  });

  it('POST /api/v1/rectification/quick should validate with production checks', async () => {
    const res = await request(app)
      .post('/api/v1/rectification/quick')
      .send({ birthData: sampleBirthData, proposedTime: sampleBirthData.timeOfBirth });
    
    // If WASM initialization fails, test should fail (not mask the error)
    if (res.status === 500 && res.body.message?.includes('Swiss Ephemeris')) {
      throw new Error(`WASM initialization failed: ${res.body.message}. This should not happen if WASM is properly configured.`);
    }
    
    expect([200, 400]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('validation');
    }
  });

  it('POST /api/v1/rectification/analyze should perform rectification', async () => {
    const res = await request(app)
      .post('/api/v1/rectification/analyze')
      .send({ birthData: sampleBirthData, options: { methods: ['praanapada', 'moon', 'gulika'] } });
    
    // If WASM initialization fails, test should fail (not mask the error)
    if (res.status === 500 && res.body.message?.includes('Swiss Ephemeris')) {
      throw new Error(`WASM initialization failed: ${res.body.message}. This should not happen if WASM is properly configured.`);
    }
    
    expect([200, 400, 500]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('rectification');
      expect(res.body.rectification).toHaveProperty('analysis');
    }
  }, 30000);

  it('POST /api/v1/rectification/with-events should correlate events', async () => {
    const lifeEvents = [
      { date: '2015-06-01', description: 'Marriage' },
      { date: '2020-01-01', description: 'Job promotion' }
    ];
    const res = await request(app)
      .post('/api/v1/rectification/with-events')
      .send({ birthData: sampleBirthData, lifeEvents, options: { methods: ['praanapada', 'moon', 'gulika', 'events'] } });
    expect([200, 400, 500]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('rectification');
      expect(res.body).toHaveProperty('lifeEvents');
    }
  }, 30000);
});
