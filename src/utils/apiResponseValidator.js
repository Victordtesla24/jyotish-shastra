/**
 * API Response Validation Utilities
 * Provides runtime validation for API responses to ensure consistency
 */

import Joi from 'joi';

/**
 * Standard API response schema
 */
const standardApiResponseSchema = Joi.object({
  success: Joi.boolean().required(),
  data: Joi.object().optional(),
  error: Joi.alternatives().try(
    Joi.object({
      message: Joi.string().required(),
      details: Joi.string().optional(),
      code: Joi.string().optional(),
      timestamp: Joi.string().isoDate().optional()
    }),
    Joi.string()
  ).optional(),
  message: Joi.string().optional(),
  timestamp: Joi.string().isoDate().optional(),
  metadata: Joi.object().optional()
}).unknown(true);

/**
 * Chart generation response schema
 */
const chartGenerationResponseSchema = Joi.object({
  success: Joi.boolean().required(),
  data: Joi.object({
    chartId: Joi.string().required(),
    birthData: Joi.object().optional(),
    rasiChart: Joi.object({
      ascendant: Joi.object().required(),
      planets: Joi.array().optional(),
      planetaryPositions: Joi.object().optional(),
      housePositions: Joi.array().required()
    }).required()
  }).required(),
  timestamp: Joi.string().isoDate().optional()
}).unknown(true);

/**
 * Comprehensive analysis response schema
 */
const comprehensiveAnalysisResponseSchema = Joi.object({
  success: Joi.boolean().required(),
  analysis: Joi.object({
    sections: Joi.object().required(),
    synthesis: Joi.object().optional(),
    recommendations: Joi.object().optional(),
    verification: Joi.object().optional()
  }).required(),
  metadata: Joi.object().optional()
}).unknown(true);

/**
 * Geocoding response schema
 */
const geocodingResponseSchema = Joi.object({
  success: Joi.boolean().required(),
  data: Joi.object({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
    timezone: Joi.string().required(),
    formatted_address: Joi.string().optional()
  }).required()
}).unknown(true);

/**
 * Validate API response against schema
 * @param {Object} response - API response to validate
 * @param {Joi.Schema} schema - Joi schema to validate against
 * @returns {Object} Validation result with isValid and errors
 */
export function validateApiResponse(response, schema = standardApiResponseSchema) {
  try {
    const { error, value } = schema.validate(response, { 
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: false
    });

    if (error) {
      return {
        isValid: false,
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          type: detail.type
        })),
        value: null
      };
    }

    return {
      isValid: true,
      errors: [],
      value
    };
  } catch (validationError) {
    return {
      isValid: false,
      errors: [{
        field: 'validation',
        message: `Schema validation failed: ${validationError.message}`,
        type: 'validation_error'
      }],
      value: null
    };
  }
}

/**
 * Validate chart generation response
 * @param {Object} response - API response
 * @returns {Object} Validation result
 */
export function validateChartGenerationResponse(response) {
  return validateApiResponse(response, chartGenerationResponseSchema);
}

/**
 * Validate comprehensive analysis response
 * @param {Object} response - API response
 * @returns {Object} Validation result
 */
export function validateComprehensiveAnalysisResponse(response) {
  return validateApiResponse(response, comprehensiveAnalysisResponseSchema);
}

/**
 * Validate geocoding response
 * @param {Object} response - API response
 * @returns {Object} Validation result
 */
export function validateGeocodingResponse(response) {
  return validateApiResponse(response, geocodingResponseSchema);
}

/**
 * Create standardized error response
 * @param {Error|string} error - Error object or message
 * @param {string} code - Error code
 * @param {number} statusCode - HTTP status code
 * @returns {Object} Standardized error response
 */
export function createErrorResponse(error, code = 'API_ERROR', statusCode = 500) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error && process.env.NODE_ENV === 'development' 
    ? error.stack 
    : undefined;

  return {
    success: false,
    error: {
      message: errorMessage,
      code,
      timestamp: new Date().toISOString(),
      ...(errorStack && { stack: errorStack })
    },
    timestamp: new Date().toISOString()
  };
}

/**
 * Create standardized success response
 * @param {Object} data - Response data
 * @param {string} message - Success message
 * @param {Object} metadata - Additional metadata
 * @returns {Object} Standardized success response
 */
export function createSuccessResponse(data = {}, message = 'Operation completed successfully', metadata = {}) {
  return {
    success: true,
    data,
    message,
    metadata: {
      ...metadata,
      timestamp: new Date().toISOString()
    },
    timestamp: new Date().toISOString()
  };
}

/**
 * Middleware to validate response before sending
 * @param {Object} schema - Joi schema for response validation
 * @returns {Function} Express middleware
 */
export function responseValidationMiddleware(schema) {
  return (req, res, next) => {
    const originalJson = res.json;
    
    res.json = function(data) {
      const validation = validateApiResponse(data, schema);
      
      if (!validation.isValid && process.env.NODE_ENV !== 'production') {
        console.warn('⚠️ Response validation warnings:', {
          endpoint: req.path,
          method: req.method,
          errors: validation.errors
        });
      }
      
      return originalJson.call(this, data);
    };
    
    next();
  };
}

export default {
  validateApiResponse,
  validateChartGenerationResponse,
  validateComprehensiveAnalysisResponse,
  validateGeocodingResponse,
  createErrorResponse,
  createSuccessResponse,
  responseValidationMiddleware,
  schemas: {
    standard: standardApiResponseSchema,
    chartGeneration: chartGenerationResponseSchema,
    comprehensiveAnalysis: comprehensiveAnalysisResponseSchema,
    geocoding: geocodingResponseSchema
  }
};

