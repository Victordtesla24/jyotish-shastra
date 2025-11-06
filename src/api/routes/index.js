/**
 * API Routes
 * Main router configuration for all API endpoints
 */

import express from 'express';
import chartRoutes from './chart.js';
import comprehensiveAnalysisRoutes from './comprehensiveAnalysis.js';
import birthTimeRectificationRoutes from './birthTimeRectification.js';
import metricsRoutes from './metrics.js';
import geocodingRoutes from './geocoding.js';
import clientErrorLogRoutes from './clientErrorLog.js';

const router = express.Router();

// API version prefix
const API_VERSION = '/v1';

// Chart routes
router.use(`${API_VERSION}/chart`, chartRoutes);

// Comprehensive Analysis routes
router.use(`${API_VERSION}/analysis`, comprehensiveAnalysisRoutes);

// Birth Time Rectification routes
router.use(`${API_VERSION}/rectification`, birthTimeRectificationRoutes);

// BTR Metrics routes (read-only endpoints for pre-calculated metrics)
router.use(`${API_VERSION}/rectification/metrics`, metricsRoutes);

// Geocoding routes
router.use(`${API_VERSION}/geocoding`, geocodingRoutes);

// Client error logging
router.use('', clientErrorLogRoutes);

// Comprehensive Chart Generation - SINGLE CALL OPTIMIZATION
router.post(`${API_VERSION}/chart/generate/comprehensive`, async (req, res) => {
  try {
    const birthData = req.body;
    
    console.log('🚀 Comprehensive chart generation request received');
    console.log(`📊 Birth data provided: ${JSON.stringify(birthData).slice(0, 200)}...`);
    
    // Import ChartController dynamically
    const { default: ChartController } = await import('../controllers/ChartController.js');
    const chartController = new ChartController();
    
    // Get singleton chart service
    const chartService = await chartController.getChartService();
    
    // Generate comprehensive chart and analysis in single call
    const comprehensiveResult = await chartService.generateComprehensiveChart(birthData);
    
    // Generate comprehensive analysis in the same service to prevent duplicate calls
    const analysisService = await import('../services/analysis/BirthDataAnalysisService.js');
    const analysisInstance = new analysisService.default();
    const analysisResult = analysisInstance.analyzeBirthDataCollection(comprehensiveResult);
    
    console.log('✅ Comprehensive chart and analysis generated successfully');
    
    // Return combined result
    res.status(200).json({
      success: true,
      data: {
        chart: comprehensiveResult,
        analysis: analysisResult,
        combined: true, // Flag indicating single API call
      },
      metadata: {
        timestamp: new Date().toISOString(),
        optimized: 'single_call',
        endpoint: '/api/v1/chart/generate/comprehensive'
      }
    });
    
  } catch (error) {
    console.error('❌ Comprehensive chart generation failed:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate comprehensive chart',
      details: 'Please check birth data format and try again'
    });
  }
});

// Health check endpoint
router.get('/v1/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    services: {
      geocoding: 'active',
      chartGeneration: 'active',
      analysis: 'active'
    }
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
        render: 'POST /v1/chart/render',
        renderSVG: 'POST /v1/chart/render/svg',
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
      rectification: {
        analyze: 'POST /v1/rectification/analyze',
        withEvents: 'POST /v1/rectification/with-events',
        quick: 'POST /v1/rectification/quick',
        methods: 'POST /v1/rectification/methods',
        test: 'GET /v1/rectification/test',
        metrics: {
          latest: 'GET /v1/rectification/metrics/latest',
          byChartId: 'GET /v1/rectification/metrics/:chartId',
          list: 'GET /v1/rectification/metrics',
          reports: {
            latest: 'GET /v1/rectification/reports/latest'
          }
        }
      },
      geocoding: {
        location: 'POST /geocoding/location',
        timezone: 'POST /geocoding/timezone',
        validate: 'GET /geocoding/validate'
      }
    }
  });
});

export default router;
