/**
 * Error Boundary Component
 * Catches JavaScript errors in child components and displays fallback UI
 * Enhanced with errorLogger integration for comprehensive error tracking
 */

import React from 'react';
import errorLogger from '../utils/errorLogger.js';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Log error using errorLogger
    errorLogger.logError({
      type: 'react_error',
      error: error,
      message: error?.message || error?.toString() || 'React component error',
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString()
    });

    // Legacy support: Log error to monitoring service in production
    if (process.env.NODE_ENV === 'production' && window.errorReportingService) {
      window.errorReportingService.logError(error, {
        componentStack: errorInfo.componentStack,
        errorBoundary: true
      });
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      const { fallback: Fallback, showDetails } = this.props;
      
      if (Fallback) {
        return <Fallback error={this.state.error} resetError={this.handleReset} />;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--bg-primary)' }}>
          <div className="max-w-md w-full rounded-lg shadow-lg p-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', border: '1px solid' }}>
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 dark:bg-red-900 rounded-full mb-4">
              <svg
                className="w-6 h-6 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            
            <h2 className="text-xl font-semibold text-primary text-center mb-2">
              Something went wrong
            </h2>
            
            <p className="text-secondary text-center mb-4">
              We're sorry, but an unexpected error occurred. Please try refreshing the page.
            </p>

            {showDetails && this.state.error && (
              <details className="mt-4 p-4 rounded text-sm" style={{ backgroundColor: 'var(--bg-card)' }}>
                <summary className="cursor-pointer font-medium text-primary mb-2">
                  Error Details
                </summary>
                <div className="text-red-400 font-mono text-xs overflow-auto">
                  <div className="mb-2">
                    <strong>Error:</strong> {this.state.error.toString()}
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="mt-2 whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="flex-1 px-4 py-2 rounded-lg transition-colors"
                style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card)'}
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

