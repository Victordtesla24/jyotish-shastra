/**
 * Enhanced Error Logging Utility
 * Captures and categorizes browser errors, warnings, and exceptions
 * Supports logging to backend error logging endpoint
 */

class ErrorLogger {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.networkErrors = [];
    this.wasmErrors = [];
    this.reactErrors = [];
    this.apiParsingErrors = [];
    this.isInitialized = false;
  }

  /**
   * Initialize error logging - set up global error handlers
   */
  initialize() {
    if (this.isInitialized) {
      return;
    }

    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        type: 'unhandled_promise_rejection',
        error: event.reason,
        message: event.reason?.message || 'Unhandled Promise Rejection',
        stack: event.reason?.stack,
        timestamp: new Date().toISOString()
      });
    });

    // Capture global JavaScript errors
    window.addEventListener('error', (event) => {
      this.logError({
        type: 'javascript_error',
        error: event.error,
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        timestamp: new Date().toISOString()
      });
    });

    // Capture console errors (override console.error)
    const originalConsoleError = console.error;
    console.error = (...args) => {
      const errorInfo = this.extractErrorInfo(args);
      if (errorInfo) {
        this.logError({
          type: 'console_error',
          message: errorInfo.message,
          stack: errorInfo.stack,
          context: args,
          timestamp: new Date().toISOString()
        });
      }
      originalConsoleError.apply(console, args);
    };

    // Capture console warnings
    const originalConsoleWarn = console.warn;
    console.warn = (...args) => {
      const warningInfo = this.extractWarningInfo(args);
      if (warningInfo) {
        this.logWarning({
          type: 'console_warning',
          message: warningInfo.message,
          context: args,
          timestamp: new Date().toISOString()
        });
      }
      originalConsoleWarn.apply(console, args);
    };

    this.isInitialized = true;
  }

  /**
   * Extract error information from console arguments
   */
  extractErrorInfo(args) {
    if (!args || args.length === 0) {
      return null;
    }

    const firstArg = args[0];
    
    if (firstArg instanceof Error) {
      return {
        message: firstArg.message,
        stack: firstArg.stack,
        name: firstArg.name
      };
    }
    
    if (typeof firstArg === 'string') {
      return {
        message: firstArg,
        stack: args.find(arg => typeof arg === 'string' && arg.includes('at ')) || null
      };
    }

    return {
      message: String(firstArg),
      stack: null
    };
  }

  /**
   * Extract warning information from console arguments
   */
  extractWarningInfo(args) {
    if (!args || args.length === 0) {
      return null;
    }

    return {
      message: String(args[0])
    };
  }

  /**
   * Categorize and log error
   */
  logError(errorInfo) {
    // Categorize error
    const category = this.categorizeError(errorInfo);
    
    const errorEntry = {
      ...errorInfo,
      category,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: errorInfo.timestamp || new Date().toISOString()
    };

    // Store in appropriate category array
    switch (category) {
      case 'network':
        this.networkErrors.push(errorEntry);
        break;
      case 'wasm':
        this.wasmErrors.push(errorEntry);
        break;
      case 'react':
        this.reactErrors.push(errorEntry);
        break;
      case 'api_parsing':
        this.apiParsingErrors.push(errorEntry);
        break;
      default:
        this.errors.push(errorEntry);
    }

    // Log to backend (always, for comprehensive error tracking)
    // Errors are logged immediately to backend for monitoring and debugging
    this.logToBackend(errorEntry).catch(error => {
      // Silently fail if backend logging fails to avoid infinite error loops
      console.debug('Error logging to backend failed:', error);
    });
  }

  /**
   * Log warning
   */
  logWarning(warningInfo) {
    const warningEntry = {
      ...warningInfo,
      url: window.location.href,
      timestamp: warningInfo.timestamp || new Date().toISOString()
    };

    this.warnings.push(warningEntry);
  }

  /**
   * Categorize error based on type and message
   */
  categorizeError(errorInfo) {
    const message = (errorInfo.message || '').toLowerCase();
    const type = errorInfo.type || '';

    // Network errors
    if (
      message.includes('fetch') ||
      message.includes('network') ||
      message.includes('failed to fetch') ||
      message.includes('cors') ||
      message.includes('timeout') ||
      type === 'network_error'
    ) {
      return 'network';
    }

    // WASM errors
    if (
      message.includes('wasm') ||
      message.includes('webassembly') ||
      message.includes('swisseph') ||
      message.includes('ephemeris')
    ) {
      return 'wasm';
    }

    // React errors
    if (
      message.includes('react') ||
      message.includes('component') ||
      message.includes('rendering') ||
      type === 'react_error'
    ) {
      return 'react';
    }

    // API parsing errors
    if (
      message.includes('json') ||
      message.includes('parse') ||
      message.includes('unexpected token') ||
      message.includes('api response')
    ) {
      return 'api_parsing';
    }

    return 'javascript_runtime';
  }

  /**
   * Log error to backend endpoint
   */
  async logToBackend(errorEntry) {
    try {
      const { getApiUrl } = await import('./apiConfig.js');
      const response = await fetch(getApiUrl('/api/log-client-error'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          timestamp: errorEntry.timestamp,
          message: errorEntry.message,
          stack: errorEntry.stack,
          url: errorEntry.url,
          userAgent: errorEntry.userAgent,
          componentStack: errorEntry.componentStack || '',
          category: errorEntry.category,
          type: errorEntry.type,
          context: errorEntry.context || {}
        })
      });

      if (!response.ok) {
        console.warn('Failed to log error to backend:', response.status);
      }
    } catch (error) {
      // Silently fail - don't log error logging errors
      console.debug('Error logging to backend failed:', error);
    }
  }

  /**
   * Get error summary
   */
  getErrorSummary() {
    return {
      total: this.errors.length,
      network: this.networkErrors.length,
      wasm: this.wasmErrors.length,
      react: this.reactErrors.length,
      apiParsing: this.apiParsingErrors.length,
      warningsCount: this.warnings.length,
      errors: this.errors,
      networkErrors: this.networkErrors,
      wasmErrors: this.wasmErrors,
      reactErrors: this.reactErrors,
      apiParsingErrors: this.apiParsingErrors,
      warnings: this.warnings
    };
  }

  /**
   * Clear all errors (for testing)
   */
  clear() {
    this.errors = [];
    this.warnings = [];
    this.networkErrors = [];
    this.wasmErrors = [];
    this.reactErrors = [];
    this.apiParsingErrors = [];
  }
}

// Create singleton instance
const errorLogger = new ErrorLogger();

// Auto-initialize in browser environment
if (typeof window !== 'undefined') {
  errorLogger.initialize();
}

export default errorLogger;

