import React from 'react';
import PropTypes from 'prop-types';

/**
 * Error Boundary Component - Catches JavaScript errors in child components
 * Logs errors and displays a user-friendly error message
 */
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
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('🚨 ErrorBoundary caught an error:', error);
    console.error('Error Info:', errorInfo);
    
    // Store error details in state
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Optionally send error to logging service
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  /**
   * Reset error boundary to allow retry
   */
  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      // Render custom fallback UI
      if (this.props.fallback) {
        return typeof this.props.fallback === 'function' 
          ? this.props.fallback(this.state.error, this.state.errorInfo, this.handleRetry)
          : this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gradient-vedic-primary relative overflow-hidden flex items-center justify-center p-4">
          {/* Cosmic Background Elements */}
          <div className="absolute inset-0 pattern-mandala opacity-10"></div>
          <div className="absolute top-20 left-10 symbol-om text-6xl animate-om-rotation opacity-20"></div>
          <div className="absolute bottom-20 right-12 text-3xl opacity-20 animate-float">✦</div>

          <div className="card-cosmic backdrop-vedic border-2 border-white/20 shadow-mandala p-8 rounded-3xl max-w-md w-full text-center relative z-10">
            <div className="text-red-400 text-6xl mb-6 animate-sacred-pulse">⚠️</div>
            <h2 className="text-2xl font-cinzel font-bold text-gradient-vedic mb-4">
              Unexpected Error
            </h2>
            <p className="text-white/80 mb-6 font-devanagari">
              An unexpected cosmic disturbance occurred. Please try again or contact support if the problem persists.
            </p>
            
            {this.props.showErrorDetails && (
              <details className="text-left text-xs text-white/60 mb-6 bg-white/10 rounded-lg p-3">
                <summary className="cursor-pointer font-medium text-white/80">
                  Technical Details
                </summary>
                <pre className="mt-2 whitespace-pre-wrap break-words font-mono text-white/70">
                  {this.state.error?.toString()}
                </pre>
              </details>
            )}

            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="btn-primary w-full"
              >
                <span className="flex items-center justify-center space-x-2">
                  <span>🔄</span>
                  <span>Try Again</span>
                </span>
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="btn-secondary w-full"
              >
                <span className="flex items-center justify-center space-x-2">
                  <span>🏠</span>
                  <span>Go Home</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    // When there's no error, render children normally
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  onError: PropTypes.func,
  showErrorDetails: PropTypes.bool
};

ErrorBoundary.defaultProps = {
  showErrorDetails: process.env.NODE_ENV === 'development'
};

export default ErrorBoundary;
