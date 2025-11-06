/**
 * BTR Metrics API Routes
 * 
 * Read-only endpoints for accessing BTR accuracy metrics (M1-M5).
 * Serves pre-calculated metrics stored as JSON files.
 * 
 * Routes:
 * - GET /api/v1/rectification/metrics/latest - Get latest metrics result
 * - GET /api/v1/rectification/metrics/:chartId - Get metrics for specific chart
 * - GET /api/v1/rectification/reports/latest - Get latest HTML report
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Metrics storage directory (flat JSON files)
const METRICS_DIR = process.env.BTR_METRICS_DIR || path.join(__dirname, '../../../metrics/btr');
const REPORTS_DIR = process.env.BTR_REPORTS_DIR || path.join(__dirname, '../../../reports/btr');

/**
 * GET /api/v1/rectification/metrics/latest
 * Returns the most recently calculated BTR metrics
 */
router.get('/latest', async (req, res) => {
  try {
    // Ensure metrics directory exists
    if (!fs.existsSync(METRICS_DIR)) {
      return res.status(404).json({
        success: false,
        error: 'No metrics available. Metrics directory not found.',
        path: METRICS_DIR
      });
    }

    // Get all metric files
    const files = fs.readdirSync(METRICS_DIR)
      .filter(file => file.endsWith('.json'))
      .map(file => ({
        filename: file,
        filepath: path.join(METRICS_DIR, file),
        mtime: fs.statSync(path.join(METRICS_DIR, file)).mtime
      }))
      .sort((a, b) => b.mtime - a.mtime); // Sort by modification time, newest first

    if (files.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No metrics files found.',
        hint: 'Run BTR analysis with metrics calculation to generate metrics files.'
      });
    }

    // Read the latest file
    const latestFile = files[0];
    const metricsData = JSON.parse(fs.readFileSync(latestFile.filepath, 'utf-8'));

    res.json({
      success: true,
      data: metricsData,
      metadata: {
        filename: latestFile.filename,
        calculatedAt: latestFile.mtime.toISOString(),
        totalMetricsAvailable: files.length
      }
    });

  } catch (error) {
    console.error('Error retrieving latest metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve latest metrics',
      details: error.message
    });
  }
});

/**
 * GET /api/v1/rectification/metrics/:chartId
 * Returns metrics for a specific chart ID
 */
router.get('/:chartId', async (req, res) => {
  try {
    const { chartId } = req.params;

    // Validate chart ID format (basic sanitization)
    if (!/^[a-zA-Z0-9_-]+$/.test(chartId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid chart ID format. Use alphanumeric characters, underscores, and hyphens only.'
      });
    }

    // Ensure metrics directory exists
    if (!fs.existsSync(METRICS_DIR)) {
      return res.status(404).json({
        success: false,
        error: 'Metrics directory not found.',
        path: METRICS_DIR
      });
    }

    // Find metrics file matching chart ID
    const files = fs.readdirSync(METRICS_DIR)
      .filter(file => file.includes(chartId) && file.endsWith('.json'));

    if (files.length === 0) {
      return res.status(404).json({
        success: false,
        error: `No metrics found for chart ID: ${chartId}`,
        hint: 'Chart ID may not exist or metrics have not been calculated yet.'
      });
    }

    // If multiple files match, return the newest
    const matchingFile = files
      .map(file => ({
        filename: file,
        filepath: path.join(METRICS_DIR, file),
        mtime: fs.statSync(path.join(METRICS_DIR, file)).mtime
      }))
      .sort((a, b) => b.mtime - a.mtime)[0];

    const metricsData = JSON.parse(fs.readFileSync(matchingFile.filepath, 'utf-8'));

    res.json({
      success: true,
      data: metricsData,
      metadata: {
        filename: matchingFile.filename,
        calculatedAt: matchingFile.mtime.toISOString()
      }
    });

  } catch (error) {
    console.error(`Error retrieving metrics for chart ${req.params.chartId}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve metrics',
      details: error.message
    });
  }
});

/**
 * GET /api/v1/rectification/reports/latest
 * Returns the latest HTML report (if available)
 */
router.get('/reports/latest', async (req, res) => {
  try {
    // Ensure reports directory exists
    if (!fs.existsSync(REPORTS_DIR)) {
      return res.status(404).json({
        success: false,
        error: 'No reports available. Reports directory not found.',
        path: REPORTS_DIR
      });
    }

    // Get all HTML report files
    const files = fs.readdirSync(REPORTS_DIR)
      .filter(file => file.endsWith('.html'))
      .map(file => ({
        filename: file,
        filepath: path.join(REPORTS_DIR, file),
        mtime: fs.statSync(path.join(REPORTS_DIR, file)).mtime
      }))
      .sort((a, b) => b.mtime - a.mtime);

    if (files.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No HTML reports found.',
        hint: 'Generate reports using the evidence generation script.'
      });
    }

    // Read and serve the latest HTML report
    const latestReport = files[0];
    const reportHTML = fs.readFileSync(latestReport.filepath, 'utf-8');

    res.setHeader('Content-Type', 'text/html');
    res.send(reportHTML);

  } catch (error) {
    console.error('Error retrieving latest report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve latest report',
      details: error.message
    });
  }
});

/**
 * GET /api/v1/rectification/metrics
 * List all available metrics (summary view)
 */
router.get('/', async (req, res) => {
  try {
    // Ensure metrics directory exists
    if (!fs.existsSync(METRICS_DIR)) {
      return res.status(404).json({
        success: false,
        error: 'Metrics directory not found.',
        availableMetrics: []
      });
    }

    // Get all metric files with summary info
    const files = fs.readdirSync(METRICS_DIR)
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const filepath = path.join(METRICS_DIR, file);
        const stats = fs.statSync(filepath);
        
        try {
          const data = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
          return {
            filename: file,
            chartId: data.chartId || 'unknown',
            timestamp: data.timestamp || stats.mtime.toISOString(),
            overallPassed: data.overallPassed || false,
            failedCriteria: data.failedCriteria || [],
            size: stats.size
          };
        } catch (error) {
          return {
            filename: file,
            chartId: 'error',
            timestamp: stats.mtime.toISOString(),
            error: 'Failed to parse metrics file'
          };
        }
      })
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      success: true,
      total: files.length,
      metrics: files
    });

  } catch (error) {
    console.error('Error listing metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list metrics',
      details: error.message
    });
  }
});

export default router;
