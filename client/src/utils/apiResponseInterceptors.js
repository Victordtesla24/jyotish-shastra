/**
 * Enhanced API Response Interceptors
 * Integrates with API Response Interpreter system for consistent error handling,
 * response processing, validation, and caching across all services
 */

import { APIResponseInterpreter, APIError } from './APIResponseInterpreter';
import { ResponseCache } from './ResponseCache';
import errorFramework from './errorHandlingFramework';

/**
 * Enhanced Axios response interceptor with API Response Interpreter integration
 * @param {Object} response - Axios response object
 * @returns {Object} Processed response
 */
export const enhancedResponseInterceptor = (response) => {
  const { config, data, status, headers } = response;
  const endpoint = config.url;
  const method = config.method?.toUpperCase();

  // Log successful responses with enhanced details
  console.log(`✅ API Success: ${method} ${endpoint}`, {
    status,
    contentType: headers['content-type'],
    dataSize: JSON.stringify(data).length,
    responseTime: Date.now() - (config.metadata?.startTime || Date.now())
  });

  // Add response metadata for debugging and monitoring
  response.metadata = {
    endpoint,
    method,
    timestamp: new Date().toISOString(),
    responseTime: Date.now() - (config.metadata?.startTime || Date.now()),
    cached: false
  };

  // Validate response structure if it's a JSON response
  if (headers['content-type']?.includes('application/json') && data) {
    try {
      // Basic validation - check if response has expected structure
      if (typeof data === 'object' && data !== null) {
        // Check for success/error indicators
        if (data.hasOwnProperty('success') && data.success === false) {
          console.warn(`Response indicates failure: ${method} ${endpoint}`, data);
        }

        // Check for common API response patterns
        if (data.error && !data.success) {
          console.warn(`Error response detected: ${method} ${endpoint}`, data.error);
        }
      }
    } catch (validationError) {
      console.warn('Response validation warning:', validationError.message);
    }
  }

  return response;
};

/**
 * Enhanced Axios error interceptor with API Response Interpreter integration
 * @param {Object} error - Axios error object
 * @returns {Promise} Rejected promise with APIError
 */
export const enhancedErrorInterceptor = async (error) => {
  const { response, request, config } = error;
  const endpoint = config?.url;
  const method = config?.method?.toUpperCase();

  // Log error with enhanced details
  console.error(`❌ API Error: ${method} ${endpoint}`, {
    status: response?.status,
    message: error.message,
    data: response?.data,
    responseTime: Date.now() - (config?.metadata?.startTime || Date.now())
  });

  // Convert to APIError for consistent handling
  let apiError;

  if (response) {
    // Server responded with error status
    const { status, data, headers } = response;
    const contentType = headers['content-type'] || '';

    // Map HTTP status codes to API error codes
    const statusCodeMapping = {
      400: 'VALIDATION_ERROR',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      429: 'RATE_LIMIT',
      500: 'SERVER_ERROR',
      502: 'SERVER_ERROR',
      503: 'SERVER_ERROR',
      504: 'TIMEOUT'
    };

    // Extract error information from response
    let errorCode = statusCodeMapping[status] || 'UNKNOWN_ERROR';
    let errorMessage = error.message;
    let errorDetails = {};

    // Handle JSON error responses
    if (contentType.includes('application/json') && data) {
      if (typeof data === 'object') {
        errorCode = data.error?.code || data.code || errorCode;
        errorMessage = data.error?.message || data.message || errorMessage;
        errorDetails = data.error?.details || data.details || {};
      }
    }

    // Handle HTML error responses (server errors)
    if (contentType.includes('text/html') && typeof data === 'string' && data.includes('<html>')) {
      console.warn('Server returned HTML error page instead of JSON');
      const titleMatch = data.match(/<title>(.*?)<\/title>/i);
      const title = titleMatch ? titleMatch[1] : 'Server Error';
      errorMessage = `Server Error: ${title}`;
      errorCode = 'SERVER_ERROR';
    }

    apiError = new APIError({
      code: errorCode,
      message: errorMessage,
      details: errorDetails,
      userMessage: APIResponseInterpreter.getUserFriendlyMessage(errorCode),
      statusCode: status
    });

  } else if (request) {
    // Network error - request was made but no response received
    apiError = APIResponseInterpreter.handleNetworkError(error);
  } else {
    // Request setup error
    apiError = new APIError({
      code: 'CLIENT_ERROR',
      message: error.message || 'Request configuration error',
      userMessage: 'Unable to make request. Please try again.'
    });
  }

  // Add metadata for debugging
  apiError.metadata = {
    endpoint,
    method,
    timestamp: new Date().toISOString(),
    originalError: error.message,
    requestConfig: config ? {
      url: config.url,
      method: config.method,
      timeout: config.timeout
    } : null
  };

  return Promise.reject(apiError);
};

/**
 * Request interceptor to add metadata and timing
 * @param {Object} config - Axios request config
 * @returns {Object} Enhanced config
 */
export const enhancedRequestInterceptor = (config) => {
  // Add request metadata for timing and debugging
  config.metadata = {
    startTime: Date.now(),
    requestId: Math.random().toString(36).substr(2, 9)
  };

  // Log request with enhanced details
  console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
    requestId: config.metadata.requestId,
    hasData: !!config.data,
    timeout: config.timeout,
    timestamp: new Date().toISOString()
  });

  return config;
};

/**
 * Cache-aware response interceptor
 * Integrates with ResponseCache for automatic caching and retrieval
 * @param {ResponseCache} cache - Cache instance
 * @param {Function} getCacheTTL - Function to get TTL for endpoint
 * @returns {Function} Response interceptor function
 */
export const createCacheAwareInterceptor = (cache, getCacheTTL) => {
  return (response) => {
    const { config, data } = response;
    const endpoint = config.url;
    const method = config.method?.toUpperCase();

    // Only cache GET requests and successful responses
    if (method === 'GET' && response.status >= 200 && response.status < 300) {
      const params = config.params || {};
      const ttl = getCacheTTL ? getCacheTTL(endpoint) : undefined;

      // Cache the response data
      cache.set(endpoint, params, data, ttl);

      console.log(`💾 Cached response: ${method} ${endpoint}`, {
        ttl: ttl ? ttl / 1000 + 's' : 'default',
        size: JSON.stringify(data).length + ' bytes'
      });

      // Mark response as cached for future reference
      response.metadata = response.metadata || {};
      response.metadata.cached = true;
    }

    return response;
  };
};

/**
 * Response validation interceptor
 * Validates responses against expected schemas
 * @param {Object} schemas - Schema mapping by endpoint
 * @returns {Function} Response interceptor function
 */
export const createValidationInterceptor = (schemas = {}) => {
  return (response) => {
    const { config, data } = response;
    const endpoint = config.url;

    // Check if we have a schema for this endpoint
    const schema = schemas[endpoint];
    if (schema && data) {
      try {
        APIResponseInterpreter.validateResponseStructure(data, schema);
        console.log(`✓ Response validation passed: ${endpoint}`);
      } catch (validationError) {
        console.warn(`⚠️ Response validation warning: ${endpoint}`, validationError.message);
        // Don't fail the request for validation warnings, just log
      }
    }

    return response;
  };
};

/**
 * Performance monitoring interceptor
 * Tracks API performance metrics
 * @returns {Function} Response interceptor function
 */
export const createPerformanceInterceptor = () => {
  const performanceMetrics = new Map();

  return (response) => {
    const { config } = response;
    const endpoint = config.url;
    const method = config.method?.toUpperCase();
    const responseTime = Date.now() - (config.metadata?.startTime || Date.now());

    // Track performance metrics
    const key = `${method} ${endpoint}`;
    if (!performanceMetrics.has(key)) {
      performanceMetrics.set(key, {
        count: 0,
        totalTime: 0,
        minTime: Infinity,
        maxTime: 0,
        errors: 0
      });
    }

    const metrics = performanceMetrics.get(key);
    metrics.count++;
    metrics.totalTime += responseTime;
    metrics.minTime = Math.min(metrics.minTime, responseTime);
    metrics.maxTime = Math.max(metrics.maxTime, responseTime);

    // Log slow requests
    if (responseTime > 5000) { // 5 seconds
      console.warn(`🐌 Slow API response: ${key}`, {
        responseTime: responseTime + 'ms',
        status: response.status
      });
    }

    // Expose metrics globally for monitoring (in development)
    if (process.env.NODE_ENV === 'development') {
      window.apiPerformanceMetrics = performanceMetrics;
    }

    return response;
  };
};

/**
 * Error recovery interceptor
 * Attempts to recover from certain types of errors
 * @param {Object} options - Recovery options
 * @returns {Function} Error interceptor function
 */
export const createErrorRecoveryInterceptor = (options = {}) => {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    retryableErrors = ['NETWORK_ERROR', 'TIMEOUT', 'SERVER_ERROR']
  } = options;

  return async (error) => {
    const { config } = error;

    // Check if this error is retryable
    if (error instanceof APIError && retryableErrors.includes(error.code)) {
      const retryCount = config.__retryCount || 0;

      if (retryCount < maxRetries) {
        config.__retryCount = retryCount + 1;

        console.log(`🔄 Retrying request (${retryCount + 1}/${maxRetries}): ${config.method?.toUpperCase()} ${config.url}`);

        // Wait before retry with exponential backoff
        const delay = retryDelay * Math.pow(2, retryCount);
        await new Promise(resolve => setTimeout(resolve, delay));

        // Retry the request
        return axios(config);
      }
    }

    return Promise.reject(error);
  };
};

/**
 * Combined interceptor setup function
 * Sets up all interceptors for an axios instance
 * @param {Object} axiosInstance - Axios instance to configure
 * @param {Object} options - Configuration options
 */
export const setupEnhancedInterceptors = (axiosInstance, options = {}) => {
  const {
    enableCaching = true,
    enableValidation = true,
    enablePerformance = true,
    enableRetry = true,
    cache,
    getCacheTTL,
    schemas = {},
    retryOptions = {}
  } = options;

  // Request interceptor (always enabled)
  axiosInstance.interceptors.request.use(
    enhancedRequestInterceptor,
    (error) => Promise.reject(error)
  );

  // Response interceptors (applied in order)
  const responseInterceptors = [enhancedResponseInterceptor];

  if (enableCaching && cache) {
    responseInterceptors.push(createCacheAwareInterceptor(cache, getCacheTTL));
  }

  if (enableValidation && Object.keys(schemas).length > 0) {
    responseInterceptors.push(createValidationInterceptor(schemas));
  }

  if (enablePerformance) {
    responseInterceptors.push(createPerformanceInterceptor());
  }

  // Apply response interceptors
  responseInterceptors.forEach(interceptor => {
    axiosInstance.interceptors.response.use(interceptor, null);
  });

  // Error interceptors
  const errorInterceptors = [enhancedErrorInterceptor];

  if (enableRetry) {
    errorInterceptors.push(createErrorRecoveryInterceptor(retryOptions));
  }

  // Apply error interceptors
  errorInterceptors.forEach(interceptor => {
    axiosInstance.interceptors.response.use(null, interceptor);
  });

  console.log('✅ Enhanced API interceptors configured', {
    caching: enableCaching,
    validation: enableValidation,
    performance: enablePerformance,
    retry: enableRetry
  });

  return axiosInstance;
};

// Export individual interceptors for flexibility
export {
  enhancedResponseInterceptor as responseInterceptor,
  enhancedErrorInterceptor as errorInterceptor,
  enhancedRequestInterceptor as requestInterceptor
};

// Default export with all interceptors
const apiResponseInterceptors = {
  setupEnhancedInterceptors,
  enhancedResponseInterceptor,
  enhancedErrorInterceptor,
  enhancedRequestInterceptor,
  createCacheAwareInterceptor,
  createValidationInterceptor,
  createPerformanceInterceptor,
  createErrorRecoveryInterceptor
};

export default apiResponseInterceptors;
