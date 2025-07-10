/**
 * API Response Interpreter - Handles all API responses with proper validation and error handling
 */

// Custom API Error class for structured error handling
export class APIError extends Error {
  constructor({ code, message, details, userMessage, statusCode }) {
    super(message);
    this.name = 'APIError';
    this.code = code;
    this.details = details;
    this.userMessage = userMessage;
    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString();
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      details: this.details,
      userMessage: this.userMessage,
      statusCode: this.statusCode,
      timestamp: this.timestamp
    };
  }
}

export class APIResponseInterpreter {
  // Error message mappings for user-friendly display - COMPLETE SET from requirements
  static errorMessages = {
    // Validation Errors
    'VALIDATION_ERROR': 'Please check your input and try again.',
    'INVALID_DATE': 'Invalid date format. Please use YYYY-MM-DD format.',
    'INVALID_TIME': 'Invalid time format. Please use HH:MM:SS format.',
    'INVALID_LOCATION': 'Invalid location. Please enter a valid city or coordinates.',

    // Server Errors
    'SERVER_ERROR': 'Something went wrong. Please try again later.',
    'DATABASE_ERROR': 'Database connection issue. Please try again later.',
    'EPHEMERIS_ERROR': 'Astronomical calculation error. Please try again.',
    'CALCULATION_ERROR': 'Unable to calculate chart. Please verify birth details.',
    'CONFIGURATION_ERROR': 'System configuration error. Please contact support.',
    'MAINTENANCE': 'System is under maintenance. Please try again later.',

    // Authentication Errors
    'UNAUTHORIZED': 'Please log in to access this feature.',
    'FORBIDDEN': 'You don\'t have permission to access this resource.',

    // Network Errors
    'NETWORK_ERROR': 'Network connection issue. Please check your internet connection.',
    'TIMEOUT': 'Request timed out. Please try again.',

    // Client Errors
    'NOT_FOUND': 'The requested data could not be found.',
    'RATE_LIMIT': 'Too many requests. Please wait a moment and try again.',
    'PAYMENT_REQUIRED': 'This feature requires a premium subscription.',

    // Default
    'UNKNOWN_ERROR': 'An unexpected error occurred. Please try again.'
  };

  /**
   * Handle API response with validation and error handling
   * @param {Object} response - API response object
   * @returns {Object} Validated response data
   * @throws {APIError} When response indicates failure
   */
  static handleResponse(response) {
    // Log response for debugging (in development only)
    if (process.env.NODE_ENV === 'development') {
      console.log('[APIResponseInterpreter] Response:', response);
    }

    // Check if response exists
    if (!response) {
      this.logError('Empty response received', { response });
      throw new APIError({
        code: 'UNKNOWN_ERROR',
        message: 'No response received from server',
        userMessage: this.getUserFriendlyMessage('UNKNOWN_ERROR')
      });
    }

    // Check success flag
    if (response.success === false) {
      const error = response.error || {};

      // Log error details for monitoring
      this.logError('API request failed', {
        code: error.code,
        message: error.message,
        details: error.details,
        response
      });

      throw new APIError({
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message || 'Request failed',
        details: error.details || {},
        userMessage: this.getUserFriendlyMessage(error.code),
        statusCode: response.statusCode
      });
    }

    // Validate data exists
    if (!response.data) {
      this.logError('No data in successful response', { response });
      throw new APIError({
        code: 'INVALID_RESPONSE',
        message: 'Response missing data field',
        userMessage: 'Invalid response format. Please try again.'
      });
    }

    // Log successful response (in development only)
    if (process.env.NODE_ENV === 'development') {
      console.log('[APIResponseInterpreter] Success:', response.data);
    }

    return response.data;
  }

  /**
   * Get user-friendly error message based on error code
   * @param {string} errorCode - Error code from API
   * @returns {string} User-friendly error message
   */
  static getUserFriendlyMessage(errorCode) {
    return this.errorMessages[errorCode] || this.errorMessages['UNKNOWN_ERROR'];
  }

  /**
   * Log error for monitoring and debugging
   * @param {string} message - Error message
   * @param {Object} context - Additional context data
   */
  static logError(message, context = {}) {
    const errorLog = {
      timestamp: new Date().toISOString(),
      message,
      context,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Console log in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[APIResponseInterpreter Error]', errorLog);
    }

    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Integrate with error tracking service (e.g., Sentry, LogRocket)
      // For now, just console error
      console.error('[APIResponseInterpreter Error]', message, context);
    }

    // Store in local storage for debugging (last 10 errors)
    try {
      const errors = JSON.parse(localStorage.getItem('api_errors') || '[]');
      errors.unshift(errorLog);
      if (errors.length > 10) errors.pop();
      localStorage.setItem('api_errors', JSON.stringify(errors));
    } catch (e) {
      // Ignore local storage errors
    }
  }

  /**
   * Extract field-specific errors from validation error
   * @param {Object} error - API error object
   * @returns {Object} Field-specific error messages
   */
  static extractFieldErrors(error) {
    if (error.code !== 'VALIDATION_ERROR' || !error.details) {
      return {};
    }

    const fieldErrors = {};

    if (error.details.field && error.details.issue) {
      fieldErrors[error.details.field] = error.details.issue;
    } else if (error.details.errors && Array.isArray(error.details.errors)) {
      error.details.errors.forEach(err => {
        if (err.field) {
          fieldErrors[err.field] = err.message || err.issue;
        }
      });
    }

    return fieldErrors;
  }

  /**
   * Handle network errors
   * @param {Error} error - Network error
   * @returns {APIError} Formatted API error
   */
  static handleNetworkError(error) {
    this.logError('Network error occurred', {
      message: error.message,
      stack: error.stack
    });

    if (error.message === 'Network Error' || !navigator.onLine) {
      return new APIError({
        code: 'NETWORK_ERROR',
        message: 'Network connection failed',
        userMessage: this.getUserFriendlyMessage('NETWORK_ERROR')
      });
    }

    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return new APIError({
        code: 'TIMEOUT',
        message: 'Request timed out',
        userMessage: this.getUserFriendlyMessage('TIMEOUT')
      });
    }

    return new APIError({
      code: 'UNKNOWN_ERROR',
      message: error.message || 'Unknown network error',
      userMessage: this.getUserFriendlyMessage('UNKNOWN_ERROR')
    });
  }

  /**
   * Format error for display in UI
   * @param {Error|APIError} error - Error object
   * @returns {Object} Formatted error for UI display
   */
  static formatErrorForUI(error) {
    if (error instanceof APIError) {
      return {
        title: 'Error',
        message: error.userMessage,
        details: error.details,
        code: error.code,
        showRetry: ['NETWORK_ERROR', 'TIMEOUT', 'SERVER_ERROR'].includes(error.code)
      };
    }

    return {
      title: 'Unexpected Error',
      message: this.getUserFriendlyMessage('UNKNOWN_ERROR'),
      showRetry: true
    };
  }

  /**
   * Check if error is retryable
   * @param {Error|APIError} error - Error object
   * @returns {boolean} Whether the error is retryable
   */
  static isRetryableError(error) {
    if (!(error instanceof APIError)) return true;

    const retryableCodes = [
      'NETWORK_ERROR',
      'TIMEOUT',
      'SERVER_ERROR',
      'DATABASE_ERROR',
      'RATE_LIMIT'
    ];

    return retryableCodes.includes(error.code);
  }

  /**
   * Get retry delay based on error type
   * @param {Error|APIError} error - Error object
   * @param {number} attemptNumber - Current attempt number
   * @returns {number} Delay in milliseconds
   */
  static getRetryDelay(error, attemptNumber) {
    if (error instanceof APIError && error.code === 'RATE_LIMIT') {
      // For rate limit, use longer delays
      return Math.min(30000, 5000 * attemptNumber);
    }

    // Exponential backoff for other errors
    return Math.min(10000, 1000 * Math.pow(2, attemptNumber - 1));
  }

  /**
   * Validate response structure against expected schema
   * @param {Object} response - API response
   * @param {Object} schema - Expected schema structure
   * @returns {boolean} Whether response matches schema
   */
  static validateResponseStructure(response, schema) {
    try {
      // Import validation function dynamically to avoid circular deps
      const { validateResponse } = require('./responseSchemas');
      validateResponse(response, schema);
      return true;
    } catch (validationError) {
      this.logError('Response validation failed', {
        error: validationError.message,
        schema: schema,
        response: response
      });

      throw new APIError({
        code: 'INVALID_RESPONSE',
        message: 'Response format validation failed',
        details: { validationError: validationError.message },
        userMessage: 'Invalid response format. Please try again.'
      });
    }
  }

  /**
   * Sanitize response data to prevent XSS attacks
   * @param {Object} data - Response data to sanitize
   * @returns {Object} Sanitized data
   */
  static sanitizeResponseData(data) {
    if (!data) return data;

    // For now, return as-is since we're dealing with structured JSON data
    // In production, implement proper sanitization for string fields
    // that will be rendered in the UI
    return data;
  }

  /**
   * Process successful response with validation and transformation
   * @param {Object} response - Raw API response
   * @param {Object} options - Processing options
   * @returns {Object} Processed response data
   */
  static processSuccessfulResponse(response, options = {}) {
    const { schema, transformer } = options;

    // Validate response structure if schema provided
    if (schema) {
      this.validateResponseStructure(response, schema);
    }

    // Extract data
    const data = this.handleResponse(response);

    // Sanitize data
    const sanitizedData = this.sanitizeResponseData(data);

    // Apply transformation if provided
    if (transformer && typeof transformer === 'function') {
      return transformer({ success: true, data: sanitizedData });
    }

    return sanitizedData;
  }
}

export default APIResponseInterpreter;
