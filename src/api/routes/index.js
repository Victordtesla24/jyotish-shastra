/**
 * API Routes
 * Main router configuration for all API endpoints
 */

const express = require('express');
const chartRoutes = require('./chart');
const comprehensiveAnalysisRoutes = require('./comprehensiveAnalysis');
const geocodingRoutes = require('./geocoding');
const clientErrorLogRoutes = require('./clientErrorLog');

const router = express.Router();

// API version prefix
const API_VERSION = '/v1';

// Chart routes
router.use(`${API_VERSION}/chart`, chartRoutes);

// Comprehensive Analysis routes
router.use(`${API_VERSION}/analysis`, comprehensiveAnalysisRoutes);

// Geocoding routes
router.use(`${API_VERSION}/geocoding`, geocodingRoutes);

// Client error logging
router.use('', clientErrorLogRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Vedic Astrology API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Default route
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Vedic Astrology API',
    endpoints: {
      health: '/health',
      chart: {
        generate: 'POST /v1/chart/generate',
        generateComprehensive: 'POST /v1/chart/generate/comprehensive',
        get: 'GET /v1/chart/:id',
        navamsa: 'GET /v1/chart/:id/navamsa',
        analysis: {
          lagna: 'POST /v1/chart/analysis/lagna',
          house: 'POST /v1/chart/analysis/house/:houseNumber',
          comprehensive: 'POST /v1/chart/analysis/comprehensive'
        }
      },
      analysis: {
        comprehensive: 'POST /v1/analysis/comprehensive',
        birthData: 'POST /v1/analysis/birth-data',
        preliminary: 'POST /v1/analysis/preliminary',
        houses: 'POST /v1/analysis/houses',
        aspects: 'POST /v1/analysis/aspects',
        arudha: 'POST /v1/analysis/arudha',
        navamsa: 'POST /v1/analysis/navamsa',
        dasha: 'POST /v1/analysis/dasha',
        get: 'GET /v1/analysis/:analysisId',
        userHistory: 'GET /v1/analysis/user/:userId',
        delete: 'DELETE /v1/analysis/:analysisId',
        progress: 'GET /v1/analysis/progress/:analysisId'
      },
      geocoding: {
        location: 'POST /geocoding/location',
        timezone: 'POST /geocoding/timezone',
        validate: 'GET /geocoding/validate'
      }
    }
  });
});

module.exports = router;
