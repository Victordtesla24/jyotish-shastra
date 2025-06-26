/**
 * Chart Routes
 * Handles chart generation and analysis endpoints
 * Enhanced with geocoding integration and comprehensive analysis
 */

const express = require('express');
const ChartController = require('../controllers/ChartController');

const router = express.Router();
const chartController = new ChartController();

// Chart generation and retrieval
router.post('/generate', chartController.generateChart.bind(chartController));
router.post('/generate/comprehensive', chartController.generateComprehensiveChart.bind(chartController));
router.post('/analysis/birth-data', chartController.getBirthDataAnalysis.bind(chartController));
router.get('/:id', chartController.getChart.bind(chartController));
router.get('/:id/navamsa', chartController.getNavamsaChart.bind(chartController));

// Analysis endpoints
router.post('/analysis/lagna', chartController.analyzeLagna.bind(chartController));
router.post('/analysis/house/:houseNumber', chartController.analyzeHouse.bind(chartController));
router.post('/analysis/comprehensive', chartController.getComprehensiveAnalysis.bind(chartController));

module.exports = router;
