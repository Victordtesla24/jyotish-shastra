/**
 * Error Handling Framework - Centralized error handling with retry logic and user notifications
 */

import { APIError, APIResponseInterpreter } from './APIResponseInterpreter';

/**
 * Error categories for better error handling
 */
export const ErrorCategory = {
  NETWORK: 'NETWORK',
  VALIDATION: 'VALIDATION',
  AUTHENTICATION: 'AUTHENTICATION',
  SERVER: 'SERVER',
  CLIENT: 'CLIENT',
  UNKNOWN: 'UNKNOWN'
};

/**
 * Map error codes to categories
 */
const errorCodeToCategory = {
  'NETWORK_ERROR': ErrorCategory.NETWORK,
  'TIMEOUT': ErrorCategory.NETWORK,
  'VALIDATION_ERROR': ErrorCategory.VALIDATION,
  'INVALID_DATE': ErrorCategory.VALIDATION,
  'INVALID_TIME': ErrorCategory.VALIDATION,
  'INVALID_LOCATION': ErrorCategory.VALIDATION,
  'UNAUTHORIZED': ErrorCategory.AUTHENTICATION,
  'FORBIDDEN': ErrorCategory.AUTHENTICATION,
  'SERVER_ERROR': ErrorCategory.SERVER,
  'DATABASE_ERROR': ErrorCategory.SERVER,
  'EPHEMERIS_ERROR': ErrorCategory.SERVER,
  'CALCULATION_ERROR': ErrorCategory.SERVER,
  'CONFIGURATION_ERROR': ErrorCategory.SERVER,
  'MAINTENANCE': ErrorCategory.SERVER,
  'NOT_FOUND': ErrorCategory.CLIENT,
  'RATE_LIMIT': ErrorCategory.CLIENT,
  'PAYMENT_REQUIRED': ErrorCategory.CLIENT,
  'UNKNOWN_ERROR': ErrorCategory.UNKNOWN
};

/**
 * Error notification configuration
 */
const notificationConfig = {
  [ErrorCategory.NETWORK]: {
    type: 'error',
    duration: 5000,
    showRetry: true,
    icon: '🌐'
  },
  [ErrorCategory.VALIDATION]: {
    type: 'warning',
    duration: 4000,
    showRetry: false,
    icon: '⚠️'
  },
  [ErrorCategory.AUTHENTICATION]: {
    type: 'error',
    duration: 5000,
    showRetry: false,
    icon: '🔒'
  },
  [ErrorCategory.SERVER]: {
    type: 'error',
    duration: 6000,
    showRetry: true,
    icon: '🚨'
  },
  [ErrorCategory.CLIENT]: {
    type: 'warning',
    duration: 4000,
    showRetry: false,
    icon: '📍'
  },
  [ErrorCategory.UNKNOWN]: {
    type: 'error',
    duration: 5000,
    showRetry: true,
    icon: '❓'
  }
};

/**
 * Error handling framework class
 */
export class ErrorHandlingFramework {
  constructor() {
    this.errorHandlers = new Map();
    this.globalErrorHandler = null;
    this.notificationHandler = null;
    this.retryConfigs = new Map();
  }

  /**
   * Set global error handler
   * @param {Function} handler - Global error handler function
   */
  setGlobalErrorHandler(handler) {
    this.globalErrorHandler = handler;
  }

  /**
   * Set notification handler for displaying errors to users
   * @param {Function} handler - Notification handler function
   */
  setNotificationHandler(handler) {
    this.notificationHandler = handler;
  }

  /**
   * Register error handler for specific error code
   * @param {string} errorCode - Error code to handle
   * @param {Function} handler - Handler function
   */
  registerErrorHandler(errorCode, handler) {
    this.errorHandlers.set(errorCode, handler);
  }

  /**
   * Register retry configuration for specific endpoint
   * @param {string} endpoint - API endpoint
   * @param {Object} config - Retry configuration
   */
  registerRetryConfig(endpoint, config = {}) {
    this.retryConfigs.set(endpoint, {
      maxRetries: config.maxRetries || 3,
      retryDelay: config.retryDelay || 1000,
      backoffMultiplier: config.backoffMultiplier || 2,
      shouldRetry: config.shouldRetry || ((error) => APIResponseInterpreter.isRetryableError(error))
    });
  }

  /**
   * Handle error with appropriate strategy
   * @param {Error|APIError} error - Error to handle
   * @param {Object} context - Error context
   * @returns {Promise<any>} Resolution or rejection based on handling
   */
  async handleError(error, context = {}) {
    const { endpoint, operation, retryAttempt = 0 } = context;

    // Log error
    APIResponseInterpreter.logError('Error occurred', {
      error: error.message,
      code: error.code,
      endpoint,
      operation,
      retryAttempt
    });

    // Check for specific error handler
    if (error instanceof APIError && this.errorHandlers.has(error.code)) {
      const handler = this.errorHandlers.get(error.code);
      return handler(error, context);
    }

    // Determine error category
    const category = this.getErrorCategory(error);

    // Show user notification
    if (this.notificationHandler) {
      const config = notificationConfig[category];
      const notification = {
        ...config,
        message: error instanceof APIError ? error.userMessage : error.message,
        error,
        context,
        onRetry: config.showRetry ? () => this.retry(error, context) : null
      };
      this.notificationHandler(notification);
    }

    // Check if we should retry
    if (endpoint && retryAttempt === 0) {
      const retryConfig = this.retryConfigs.get(endpoint);
      if (retryConfig && retryConfig.shouldRetry(error)) {
        return this.retry(error, context);
      }
    }

    // Call global error handler if set
    if (this.globalErrorHandler) {
      return this.globalErrorHandler(error, context);
    }

    // Default: reject with error
    throw error;
  }

  /**
   * Get error category
   * @param {Error|APIError} error - Error object
   * @returns {string} Error category
   */
  getErrorCategory(error) {
    if (error instanceof APIError && error.code) {
      return errorCodeToCategory[error.code] || ErrorCategory.UNKNOWN;
    }
    return ErrorCategory.UNKNOWN;
  }

  /**
   * Retry failed operation
   * @param {Error|APIError} error - Original error
   * @param {Object} context - Error context
   * @returns {Promise<any>} Result of retry
   */
  async retry(error, context) {
    const { endpoint, operation, retryAttempt = 0, originalRequest } = context;

    if (!endpoint || !originalRequest) {
      throw new Error('Cannot retry without endpoint and original request');
    }

    const retryConfig = this.retryConfigs.get(endpoint) || {
      maxRetries: 3,
      retryDelay: 1000,
      backoffMultiplier: 2,
      shouldRetry: () => true
    };

    if (retryAttempt >= retryConfig.maxRetries) {
      throw error;
    }

    const delay = APIResponseInterpreter.getRetryDelay(error, retryAttempt + 1);

    console.log(`Retrying ${operation || endpoint} (attempt ${retryAttempt + 1}/${retryConfig.maxRetries}) after ${delay}ms`);

    // Wait before retrying
    await new Promise(resolve => setTimeout(resolve, delay));

    // Execute retry
    try {
      return await originalRequest();
    } catch (retryError) {
      // Handle retry error
      return this.handleError(retryError, {
        ...context,
        retryAttempt: retryAttempt + 1
      });
    }
  }

  /**
   * Create error boundary for async operations
   * @param {Function} operation - Async operation to execute
   * @param {Object} context - Operation context
   * @returns {Promise<any>} Result or handled error
   */
  async withErrorBoundary(operation, context = {}) {
    try {
      return await operation();
    } catch (error) {
      return this.handleError(error, context);
    }
  }

  /**
   * Batch error handler for multiple operations
   * @param {Array<Function>} operations - Array of async operations
   * @param {Object} options - Batch options
   * @returns {Promise<Array>} Results with errors handled
   */
  async batchWithErrorHandling(operations, options = {}) {
    const { stopOnError = false, context = {} } = options;

    const results = [];
    const errors = [];

    for (let i = 0; i < operations.length; i++) {
      try {
        const result = await this.withErrorBoundary(operations[i], {
          ...context,
          operationIndex: i
        });
        results.push({ success: true, data: result });
      } catch (error) {
        errors.push({ index: i, error });
        results.push({ success: false, error });

        if (stopOnError) {
          break;
        }
      }
    }

    return {
      results,
      errors,
      hasErrors: errors.length > 0,
      successCount: results.filter(r => r.success).length,
      errorCount: errors.length
    };
  }

  /**
   * Create error recovery strategies
   * @param {string} errorCode - Error code
   * @param {Array<Function>} strategies - Recovery strategies to try in order
   */
  registerRecoveryStrategies(errorCode, strategies) {
    this.registerErrorHandler(errorCode, async (error, context) => {
      for (const strategy of strategies) {
        try {
          console.log(`Attempting recovery strategy for ${errorCode}`);
          return await strategy(error, context);
        } catch (strategyError) {
          console.warn(`Recovery strategy failed:`, strategyError);
          continue;
        }
      }
      throw error; // All strategies failed
    });
  }

  /**
   * Clear all error logs older than specified time
   * @param {number} maxAge - Maximum age in milliseconds
   */
  clearOldErrorLogs(maxAge = 24 * 60 * 60 * 1000) {
    try {
      const errors = JSON.parse(localStorage.getItem('api_errors') || '[]');
      const cutoffTime = Date.now() - maxAge;
      const filteredErrors = errors.filter(error =>
        new Date(error.timestamp).getTime() > cutoffTime
      );
      localStorage.setItem('api_errors', JSON.stringify(filteredErrors));
    } catch (e) {
      console.warn('Could not clear old error logs:', e);
    }
  }

  /**
   * Get error statistics
   * @returns {Object} Error statistics
   */
  getErrorStatistics() {
    try {
      const errors = JSON.parse(localStorage.getItem('api_errors') || '[]');
      const stats = {
        total: errors.length,
        byCode: {},
        byEndpoint: {},
        recentErrors: errors.slice(0, 5)
      };

      errors.forEach(error => {
        const code = error.context?.code || 'UNKNOWN';
        const endpoint = error.context?.endpoint || 'unknown';

        stats.byCode[code] = (stats.byCode[code] || 0) + 1;
        stats.byEndpoint[endpoint] = (stats.byEndpoint[endpoint] || 0) + 1;
      });

      return stats;
    } catch (e) {
      return { total: 0, byCode: {}, byEndpoint: {}, recentErrors: [] };
    }
  }
}

// Create singleton instance
const errorFramework = new ErrorHandlingFramework();

// Register default retry configs for common endpoints
errorFramework.registerRetryConfig('/api/chart/generate', {
  maxRetries: 3,
  shouldRetry: (error) => {
    return error instanceof APIError &&
           ['NETWORK_ERROR', 'TIMEOUT', 'SERVER_ERROR'].includes(error.code);
  }
});

errorFramework.registerRetryConfig('/api/analysis/comprehensive', {
  maxRetries: 2,
  shouldRetry: (error) => {
    return error instanceof APIError &&
           ['NETWORK_ERROR', 'TIMEOUT', 'SERVER_ERROR', 'CALCULATION_ERROR'].includes(error.code);
  }
});

errorFramework.registerRetryConfig('/api/geocoding/coordinates', {
  maxRetries: 3,
  shouldRetry: (error) => {
    return error instanceof APIError &&
           ['NETWORK_ERROR', 'TIMEOUT'].includes(error.code);
  }
});

// Register recovery strategies for specific errors
errorFramework.registerRecoveryStrategies('EPHEMERIS_ERROR', [
  // Strategy 1: Retry with fallback calculation method
  async (error, context) => {
    console.log('Attempting fallback calculation method');
    if (context.originalRequest) {
      const modifiedRequest = () => context.originalRequest({
        useFallbackCalculation: true
      });
      return modifiedRequest();
    }
    throw error;
  }
]);

errorFramework.registerRecoveryStrategies('RATE_LIMIT', [
  // Strategy 1: Wait and retry with exponential backoff
  async (error, context) => {
    const waitTime = 30000; // 30 seconds
    console.log(`Rate limited. Waiting ${waitTime}ms before retry`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
    if (context.originalRequest) {
      return context.originalRequest();
    }
    throw error;
  }
]);

export default errorFramework;

export {
  errorFramework
};
