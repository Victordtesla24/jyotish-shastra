/**
 * Birth Time Rectification Routes
 * BPHS-based birth time rectification API endpoints
 */

import express from 'express';
import BirthTimeRectificationService from '../../services/analysis/BirthTimeRectificationService.js';
import validation from '../middleware/validation.js';
import FeatureFlagsService from '../../services/config/FeatureFlags.js';
import {
  rectificationAnalyzeRequestSchema,
  rectificationWithEventsRequestSchema,
  rectificationQuickRequestSchema,
  horaAnalysisRequestSchema,
  shashtiamsaVerificationRequestSchema,
  configurationRequestSchema,
  rectificationEnhancedRequestSchema
} from '../../api/validators/birthDataValidator.js';

const router = express.Router();
const btrService = new BirthTimeRectificationService();
const featureFlags = new FeatureFlagsService();

/**
 * BTR CRITICAL FIX: Coordinate Normalization Middleware
 * Normalizes birth data coordinates BEFORE validation middleware runs
 * This fixes the validation timing mismatch that causes BTR validation failures
 */
const normalizeCoordinates = (req, res, next) => {
  try {
    // Only normalize if birthData exists
    if (req.body.birthData) {
      const birthData = req.body.birthData;
      
      // Extract coordinates from any format (flat, nested, or mixed)
      const latitude = birthData.latitude || birthData.placeOfBirth?.latitude;
      const longitude = birthData.longitude || birthData.placeOfBirth?.longitude;
      const timezone = birthData.timezone || birthData.placeOfBirth?.timezone || 'UTC';
      
      // CRITICAL FIX: Validate coordinates as numbers
      if (latitude && longitude && 
          typeof latitude === 'number' && typeof longitude === 'number' &&
          !isNaN(latitude) && !isNaN(longitude)) {
        
        // Create normalized, consistent structure for validation
        req.body.birthData = {
          ...birthData,
          latitude,
          longitude,
          timezone: timezone
        };
        
        // Preserve placeOfBirth as string only to avoid validation confusion
        if (birthData.placeOfBirth && typeof birthData.placeOfBirth === 'object') {
          // If we have a nested object, preserve only the name as string
          req.body.birthData.placeOfBirth = birthData.placeOfBirth.name || birthData.placeOfBirth;
        }
        
        console.log('✅ Coordinate Normalization: Successfully normalized coords:', {
          latitude,
          longitude,
          timezone,
          endpoint: req.path
        });
      } else {
        console.warn('⚠️ Coordinate Normalization: Invalid or missing coordinates:', {
          latitude,
          longitude,
          timezone,
          endpoint: req.path,
          hasLat: typeof latitude === 'number' && !isNaN(latitude),
          hasLng: typeof longitude === 'number' && !isNaN(longitude)
        });
        // Continue with original data - validation will catch this
      }
    }
    next();
  } catch (error) {
    console.error('🚨 Coordinate Normalization Error:', {
      error: error.message,
      requestBody: req.body,
      endpoint: req.path,
      timestamp: new Date().toISOString()
    });
    // If normalization fails, continue with original data
    next();
  }
};

/**
 * POST /api/v1/rectification/analyze
 * Main birth time rectification endpoint
 */
router.post('/analyze', normalizeCoordinates, validation(rectificationAnalyzeRequestSchema), async (req, res) => {
    try {
        // Use validated body from middleware
        const { birthData, options } = req.validatedBody || req.body || {};

        // CRITICAL FIX: Extract and flatten coordinates BEFORE validation 
        const latitude = birthData.latitude || birthData.placeOfBirth?.latitude;
        const longitude = birthData.longitude || birthData.placeOfBirth?.longitude;
        const timezone = birthData.timezone || birthData.placeOfBirth?.timezone;

        // Ensure timezone for accurate calculations (apply default early)
        const finalTimezone = timezone || 'UTC';
        
        // Create flattened data structure for internal processing
        const flattenedBirthData = {
            ...birthData,
            latitude,
            longitude,
            timezone: finalTimezone
        };

        // Now validate after flattening (this allows validation to work with consistent structure)
        if (!latitude || !longitude) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                message: 'Latitude and longitude are required. Please provide birth location coordinates.',
                details: [{ field: 'location', message: 'Birth location coordinates are required for rectification' }],
                errors: [{ field: 'location', message: 'Birth location coordinates are required for rectification' }],
                timestamp: new Date().toISOString()
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
            flattenedBirthData,
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
router.post('/with-events', normalizeCoordinates, validation(rectificationWithEventsRequestSchema), async (req, res) => {
    try {
        // CRITICAL FIX: Better error handling and validation
        console.log('🔄 BTR with-events endpoint called');
        
        // Use validated body from middleware with fallback
        const requestBody = req.validatedBody || req.body || {};
        const { birthData, lifeEvents, options } = requestBody;

        // Validate required request structure
        if (!birthData || typeof birthData !== 'object') {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                message: 'Birth data is required',
                details: [{ field: 'birthData', message: 'Birth data object is required' }],
                timestamp: new Date().toISOString()
            });
        }

        // CRITICAL FIX: Extract and flatten coordinates BEFORE validation 
        const latitude = birthData.latitude || birthData.placeOfBirth?.latitude;
        const longitude = birthData.longitude || birthData.placeOfBirth?.longitude;
        const timezone = birthData.timezone || birthData.placeOfBirth?.timezone;

        // Ensure timezone for accurate calculations (apply default early)
        const finalTimezone = timezone || 'UTC';
        
        // Create flattened data structure for internal processing
        const flattenedBirthData = {
            ...birthData,
            latitude,
            longitude,
            timezone: finalTimezone
        };

        // Now validate after flattening (this allows validation to work with consistent structure)
        if (!latitude || !longitude) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                message: 'Latitude and longitude are required. Please provide birth location coordinates.',
                details: [{ field: 'location', message: 'Birth location coordinates are required for rectification' }],
                timestamp: new Date().toISOString()
            });
        }

        const normalizedLifeEvents = Array.isArray(lifeEvents) ? lifeEvents : [];
        const lifeEventsProvided = normalizedLifeEvents.length > 0;

        // Set options with events
        const analysisOptions = {
            lifeEvents: lifeEventsProvided ? normalizedLifeEvents : [],
            timeRange: { hours: 2 },
            methods: ['praanapada', 'moon', 'gulika', 'events'],
            ...options
        };

        // Perform BTR analysis with event correlation
        const rectificationResult = await btrService.performBirthTimeRectification(
            flattenedBirthData,
            analysisOptions
        );

        res.json({
            success: true,
            rectification: rectificationResult,
            lifeEvents: lifeEventsProvided ? normalizedLifeEvents : [],
            correlationScore: lifeEventsProvided
                ? rectificationResult.methods.events?.bestCandidate?.eventScore || 0
                : 0,
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
 * Quick birth time validation (single candidate) - production-grade Praanapada check
 */
router.post('/quick', normalizeCoordinates, validation(rectificationQuickRequestSchema), async (req, res) => {
    try {
        // Use validated body from middleware
        const { birthData, proposedTime } = req.validatedBody || req.body || {};

        // CRITICAL FIX: Extract and flatten coordinates BEFORE validation
        const latitude = birthData.latitude || birthData.placeOfBirth?.latitude;
        const longitude = birthData.longitude || birthData.placeOfBirth?.longitude;
        const timezone = birthData.timezone || birthData.placeOfBirth?.timezone;

        // Ensure timezone for accurate calculations (apply default early)
        const finalTimezone = timezone || 'UTC';
        
        // Create flattened data structure for internal processing
        const flattenedBirthData = {
            ...birthData,
            latitude,
            longitude,
            timezone: finalTimezone
        };

        // Now validate after flattening (this allows validation to work with consistent structure)
        if (!latitude || !longitude) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                message: 'Latitude and longitude are required. Please provide birth location coordinates.',
                details: [{ field: 'location', message: 'Birth location coordinates are required for rectification' }],
                errors: [{ field: 'location', message: 'Birth location coordinates are required for rectification' }],
                timestamp: new Date().toISOString()
            });
        }

        // Generate chart for proposed time (real calculation)
        const candidateData = {
            ...flattenedBirthData,
            timeOfBirth: proposedTime
        };
        
        const chartService = await btrService.chartServiceInstance.getInstance();
        const chartData = await chartService.generateComprehensiveChart(candidateData);
        const chart = chartData.rasiChart;
        if (!chart) {
            throw new Error('Chart generation failed for proposed time');
        }

        // Praanapada computation and alignment score with error handling
        let praanapada = null;
        let alignmentScore = 0;
        
        try {
            praanapada = await btrService.calculatePraanapada({ time: proposedTime }, chart, flattenedBirthData);
            
            if (!chart.ascendant || !praanapada) {
                throw new Error('Ascendant or Praanapada calculation failed');
            }
            
            alignmentScore = btrService.calculateAscendantAlignment(chart.ascendant, praanapada);
        } catch (calculationError) {
            console.error('Praanapada calculation error:', calculationError);
            throw new Error(`Praanapada calculation failed: ${calculationError.message}`);
        }

        const confidence = Math.min(Math.max(alignmentScore, 0), 100);

        // Generate recommendations with error handling
        let recommendations = [];
        try {
            recommendations = btrService.generateQuickRecommendations(proposedTime, alignmentScore, chart) || [];
        } catch (recError) {
            recommendations = [{
                message: 'Recommendations unavailable',
                priority: 'low'
            }];
        }

        const validation = {
            proposedTime,
            confidence,
            praanapada,
            ascendant: chart.ascendant,
            alignmentScore,
            recommendations,
            analysisLog: [
                'Quick Praanapada validation completed',
                `Alignment score: ${alignmentScore}/100`,
                `Confidence: ${confidence}%`
            ]
        };

        res.json({
            success: true,
            validation: validation,
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
 * POST /api/v1/rectification/hora-analysis
 * NEW: Hora-based rectification endpoint (BPHS Chapter 5)
 * Feature flag protected
 */
router.post('/hora-analysis', validation(horaAnalysisRequestSchema), async (req, res) => {
    try {
        // NEW ENDPOINT: Feature flag check
        if (!featureFlags.isFeatureEnabled('hora')) {
            return res.status(403).json({
                success: false,
                error: 'Hora analysis feature not available',
                message: 'Feature is currently disabled',
                timestamp: new Date().toISOString()
            });
        }

        const { birthData, options } = req.body;

        if (!birthData) {
            return res.status(400).json({
                success: false,
                error: 'Birth data is required',
                message: 'Please provide complete birth data for Hora analysis'
            });
        }

        // Perform Hora-based rectification
        const horaAnalysis = await btrService.performHoraRectification(birthData, options || {});

        if (!horaAnalysis.enabled && horaAnalysis.error) {
            return res.status(403).json({
                success: false,
                error: 'Hora analysis not available',
                message: horaAnalysis.error,
                timestamp: new Date().toISOString()
            });
        }

        res.json({
            success: true,
            analysis: horaAnalysis,
            method: 'BPHS D2-Hora Chart Analysis (Chapter 5)',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Hora analysis error:', error);

        res.status(500).json({
            success: false,
            error: 'Hora analysis failed',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * POST /api/v1/rectification/shashtiamsa-verify
 * NEW: D60 chart verification endpoint
 * Feature flag protected
 */
router.post('/shashtiamsa-verify', validation(shashtiamsaVerificationRequestSchema), async (req, res) => {
    try {
        // NEW ENDPOINT: Feature flag check
        if (!featureFlags.isFeatureEnabled('divisionalCharts')) {
            return res.status(403).json({
                success: false,
                error: 'Divisional charts feature not available',
                message: 'Feature is currently disabled',
                timestamp: new Date().toISOString()
            });
        }

        const { birthData, timeCandidates } = req.body;

        if (!birthData || !timeCandidates) {
            return res.status(400).json({
                success: false,
                error: 'Birth data and time candidates are required',
                message: 'Please provide complete birth data and time candidates'
            });
        }

        // Perform time division verification (includes Shashtiamsa D60 analysis)
        const verification = await btrService.performTimeDivisionVerification(birthData, timeCandidates);

        if (!verification.enabled && verification.error) {
            return res.status(403).json({
                success: false,
                error: 'Time division verification not available',
                message: verification.error,
                timestamp: new Date().toISOString()
            });
        }

        res.json({
            success: true,
            verification: verification,
            method: 'BPHS Time Division Verification (Chapter 6)',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Shashtiamsa verification error:', error);

        res.status(500).json({
            success: false,
            error: 'Shashtiamsa verification failed',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * POST /api/v1/rectification/configuration
 * NEW: Configuration management endpoint
 * Creates custom BTR configuration with method weighting
 */
router.post('/configure', validation(configurationRequestSchema), async (req, res) => {
    try {
        const { userOptions, context } = req.body;

        // Validate configuration request
        const configuration = btrService.createBTRConfiguration(userOptions || {}, context || 'general');

        res.json({
            success: true,
            configuration: configuration,
            method: 'BPHS Configuration Management',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('BTR configuration error:', error);

        res.status(500).json({
            success: false,
            error: 'BTR configuration failed',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * POST /api/v1/rectification/conditional-dasha-verify
 * NEW: Conditional dasha correlation endpoint
 * Feature flag protected
 */
router.post('/conditional-dasha-verify', validation(rectificationEnhancedRequestSchema), async (req, res) => {
    try {
        // NEW ENDPOINT: Feature flag check
        if (!featureFlags.isFeatureEnabled('conditionalDashas')) {
            return res.status(403).json({
                success: false,
                error: 'Conditional dasha feature not available',
                message: 'Feature is currently disabled',
                timestamp: new Date().toISOString()
            });
        }

        const { birthData, lifeEvents, options } = req.body;

        if (!birthData || !lifeEvents || !Array.isArray(lifeEvents) || lifeEvents.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Birth data and life events are required',
                message: 'Please provide complete birth data and at least one life event'
            });
        }

        // Perform conditional dasha correlation
        const correlation = await btrService.performConditionalDashaCorrelation(birthData, lifeEvents, options || {});

        if (!correlation.enabled && correlation.error) {
            return res.status(403).json({
                success: false,
                error: 'Conditional dasha correlation not available',
                message: correlation.error,
                timestamp: new Date().toISOString()
            });
        }

        res.json({
            success: true,
            correlation: correlation,
            method: 'BPHS Conditional Dasha Correlation (Chapters 36-42)',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Conditional dasha correlation error:', error);

        res.status(500).json({
            success: false,
            error: 'Conditional dasha correlation failed',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * GET /api/v1/rectification/features
 * NEW: Get information about available BPHS features and their status
 */
router.get('/features', (req, res) => {
    try {
        const enabledFeatures = featureFlags.getEnabledFeatures();
        const featureSummary = featureFlags.getFeatureSummary();
        
        res.json({
            success: true,
            features: enabledFeatures,
            summary: featureSummary,
            productionSafety: {
                allFeaturesDisabledByDefault: true,
                featureFlagControl: 'Environment variable based (BTR_FEATURE_*)',
                productionReadiness: 'All new features require explicit activation',
                rollbackCapability: 'Instant via feature flags'
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Feature status error:', error);

        res.status(500).json({
            success: false,
            error: 'Failed to get feature status',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * GET /api/v1/rectification/test
 * Enhanced test endpoint for BTR service with feature information
 */
router.get('/test', (req, res) => {
    const enhancedFeatures = featureFlags.areEnhancedFeaturesEnabled();
    
    res.json({
        success: true,
        message: 'Birth Time Rectification API is working',
        service: 'BPHS-based Birth Time Rectification',
        status: 'Operational',
        features: {
            enhanced: enhancedFeatures,
            basic: true, // Always available
            debug: featureFlags.isFeatureEnabled('debugMode')
        },
        bhpsChapters: 'Implemented: Ch 1-7, 36-42 (enhanced features available)',
        timestamp: new Date().toISOString()
    });
});

export default router;
