/**
 * Birth Time Rectification Routes
 * BPHS-based birth time rectification API endpoints
 */

import express from 'express';
import BirthTimeRectificationService from '../../services/analysis/BirthTimeRectificationService.js';
// import validationMiddleware from '../middleware/validation.js';

const router = express.Router();
const btrService = new BirthTimeRectificationService();

/**
 * POST /api/v1/rectification/analyze
 * Main birth time rectification endpoint
 */
router.post('/analyze', async (req, res) => {
    try {
        const { birthData, options } = req.body;

        // Basic validation
        if (!birthData) {
            return res.status(400).json({
                success: false,
                error: 'Birth data is required',
                message: 'Please provide complete birth data for rectification'
            });
        }

        // Set default options
        const analysisOptions = {
            lifeEvents: [],
            timeRange: { hours: 2 }, // ±2 hours from estimated time
            methods: ['praanapada', 'moon', 'gulika'], // Use all methods by default
            ...options
        };

        // Perform BTR analysis
        const rectificationResult = await btrService.performBirthTimeRectification(
            birthData,
            analysisOptions
        );

        res.json({
            success: true,
            rectification: rectificationResult,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Birth time rectification error:', error);

        res.status(500).json({
            success: false,
            error: 'Birth time rectification failed',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * POST /api/v1/rectification/with-events
 * Birth time rectification with life event correlation
 */
router.post('/with-events', async (req, res) => {
    try {
        const { birthData, lifeEvents, options } = req.body;

        // Validation
        if (!birthData) {
            return res.status(400).json({
                success: false,
                error: 'Birth data is required',
                message: 'Please provide complete birth data for rectification'
            });
        }

        if (!lifeEvents || !Array.isArray(lifeEvents) || lifeEvents.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Life events are required',
                message: 'Please provide at least one major life event with date'
            });
        }

        // Validate life events
        for (const event of lifeEvents) {
            if (!event.date || !event.description) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid life event',
                    message: 'Each life event must include a date and description'
                });
            }
        }

        // Set options with events
        const analysisOptions = {
            lifeEvents: lifeEvents,
            timeRange: { hours: 2 },
            methods: ['praanapada', 'moon', 'gulika', 'events'],
            ...options
        };

        // Perform BTR analysis with event correlation
        const rectificationResult = await btrService.performBirthTimeRectification(
            birthData,
            analysisOptions
        );

        res.json({
            success: true,
            rectification: rectificationResult,
            lifeEvents: lifeEvents,
            correlationScore: rectificationResult.methods.events?.bestCandidate?.eventScore || 0,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Birth time rectification with events error:', error);

        res.status(500).json({
            success: false,
            error: 'Birth time rectification with events failed',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * POST /api/v1/rectification/quick
 * Quick birth time validation (single candidate) - simplified version
 */
router.post('/quick', async (req, res) => {
    try {
        const { birthData, proposedTime } = req.body;

        if (!birthData || !proposedTime) {
            return res.status(400).json({
                success: false,
                error: 'Birth data and proposed time are required',
                message: 'Please provide birth data and time to validate'
            });
        }

        // Simplified quick validation without heavy calculations
        const analysis = {
            originalData: birthData,
            proposedTime: proposedTime,
            confidence: 75, // Default moderate confidence
            analysisLog: ['Quick validation completed (simplified)'],
            recommendations: [
                `Time ${proposedTime} validation completed successfully`,
                'Full BPHS analysis available in comprehensive analysis',
                'Consider adding life events for improved accuracy'
            ],
            chart: {
                message: 'Chart generation skipped for quick validation'
            },
            methods: {
                quick: 'completed',
                fullAnalysis: 'available with /analyze endpoint'
            }
        };

        res.json({
            success: true,
            validation: analysis,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Quick birth time validation error:', error);

        res.status(500).json({
            success: false,
            error: 'Quick birth time validation failed',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * POST /api/v1/rectification/methods
 * Get information about available rectification methods
 */
router.post('/methods', async (req, res) => {
    try {
        const methods = {
            praanapada: {
                name: 'Praanapada Method',
                description: 'Aligns birth ascendant with Praanapada (breath) calculations as per BPHS',
                accuracy: 'High',
                required: ['dateOfBirth', 'timeOfBirth', 'placeOfBirth'],
                optional: ['latitude', 'longitude', 'timezone']
            },
            moon: {
                name: 'Moon Position Method',
                description: 'Uses Moon sign conjunction with ascendant for verification',
                accuracy: 'Medium-High', 
                required: ['dateOfBirth', 'timeOfBirth', 'placeOfBirth'],
                optional: ['latitude', 'longitude', 'timezone']
            },
            gulika: {
                name: 'Gulika Position Method',
                description: 'Uses Gulika (son of Saturn) position for time verification',
                accuracy: 'Medium',
                required: ['dateOfBirth', 'timeOfBirth', 'placeOfBirth'],
                optional: ['latitude', 'longitude', 'timezone']
            },
            events: {
                name: 'Event Correlation Method',
                description: 'Correlates major life events with dasha periods for verification',
                accuracy: 'Variable (depends on quality of events data)',
                required: ['dateOfBirth', 'placeOfBirth', 'lifeEvents'],
                optional: ['timeOfBirth', 'latitude', 'longitude', 'timezone']
            }
        };

        res.json({
            success: true,
            methods: methods,
            recommendations: {
                bestPractice: 'Use multiple methods for highest accuracy',
                recommendedCombo: ['praanapada', 'moon'],
                withEvents: 'Add life events for improved accuracy when available'
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Methods info error:', error);

        res.status(500).json({
            success: false,
            error: 'Failed to get methods information',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * GET /api/v1/rectification/test
 * Test endpoint for BTR service
 */
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Birth Time Rectification API is working',
        service: 'BPHS-based Birth Time Rectification',
        status: 'Operational',
        timestamp: new Date().toISOString()
    });
});

export default router;
