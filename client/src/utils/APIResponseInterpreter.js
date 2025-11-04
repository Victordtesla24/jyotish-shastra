/**
 * API Response Interpreter
 * Provides error classes and utilities for handling API responses
 */

/**
 * Custom API Error class for handling API errors
 */
export class APIError extends Error {
  constructor(message, status = null, details = null) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.details = details;
    
    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, APIError);
    }
  }

  /**
   * Get error message for user display
   * @returns {string} User-friendly error message
   */
  get userMessage() {
    if (this.status >= 400 && this.status < 500) {
      return this.message || 'Invalid request. Please check your input.';
    }
    if (this.status >= 500) {
      return 'Server error. Please try again later.';
    }
    return this.message || 'An unexpected error occurred';
  }

  /**
   * Check if error is a client error (4xx)
   * @returns {boolean}
   */
  isClientError() {
    return this.status >= 400 && this.status < 500;
  }

  /**
   * Check if error is a server error (5xx)
   * @returns {boolean}
   */
  isServerError() {
    return this.status >= 500;
  }

  /**
   * Check if error is a network error
   * @returns {boolean}
   */
  isNetworkError() {
    return !this.status && this.message?.toLowerCase().includes('network');
  }
}

/**
 * Parse API response and extract data
 * @param {Object} response - API response object
 * @returns {Object} Parsed response data
 */
export function parseAPIResponse(response) {
  if (!response) {
    throw new APIError('No response received from API');
  }

  if (response.success === false) {
    const errorMessage = response.error?.message || response.message || 'API request failed';
    const status = response.error?.status || response.status || 400;
    throw new APIError(errorMessage, status, response.error);
  }

  return response.data || response;
}

/**
 * Handle API error responses
 * @param {Error} error - Error object from API call
 * @returns {APIError} Standardized API error
 */
export function handleAPIError(error) {
  if (error instanceof APIError) {
    return error;
  }

  if (error.response) {
    // Axios error with response
    const status = error.response.status;
    const errorData = error.response.data;
    const message = errorData?.error?.message || 
                   errorData?.message || 
                   errorData?.error || 
                   `HTTP ${status} error`;
    return new APIError(message, status, errorData);
  }

  if (error.request) {
    // Network error - no response received
    return new APIError('Network error: Unable to connect to server', null);
  }

  // Other error
  return new APIError(error.message || 'An unexpected error occurred');
}

/**
 * Check if response is successful
 * @param {Object} response - API response object
 * @returns {boolean}
 */
export function isSuccessResponse(response) {
  return response && (response.success === true || (response.status >= 200 && response.status < 300));
}

// Named export for better maintainability
const APIResponseInterpreterExports = {
  APIError,
  parseAPIResponse,
  handleAPIError,
  isSuccessResponse
};

export default APIResponseInterpreterExports;

