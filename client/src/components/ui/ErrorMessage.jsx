import React from 'react';

/**
 * Enhanced Error Message Component
 * Uses consistent Vedic design system for error display and user feedback
 */
const ErrorMessage = ({
  error,
  title = 'Something went wrong',
  type = 'error',
  showRetry = false,
  onRetry = null,
  className = '',
  size = 'md'
}) => {
  if (!error) return null;

  const getAlertClass = () => {
    switch (type) {
      case 'warning':
        return 'alert-warning';
      case 'info':
        return 'alert-info';
      case 'success':
        return 'alert-success';
      default:
        return 'alert-error';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      case 'success':
        return '✅';
      default:
        return '❌';
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'text-sm p-3';
      case 'lg':
        return 'text-lg p-6';
      default:
        return 'text-base p-4';
    }
  };

  const errorMessage = typeof error === 'string' ? error : error.message || 'An unexpected error occurred';

  return (
    <div className={`alert-vedic ${getAlertClass()} ${getSizeClass()} ${className}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <span className="text-2xl">{getIcon()}</span>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
            <span className="vedic-symbol symbol-om text-current"></span>
            {title}
          </h3>

          <p className="text-current leading-relaxed mb-3">
            {errorMessage}
          </p>

          {/* Technical details if available */}
          {error?.details && (
            <details className="mt-3">
              <summary className="cursor-pointer text-sm font-medium text-current/80 hover:text-current">
                Technical Details
              </summary>
              <div className="mt-2 p-3 bg-current/5 rounded-md border-l-2 border-current/20">
                <div className="text-xs text-current/80 whitespace-pre-wrap font-mono">
                  {typeof error.details === 'string' ? error.details :
                   typeof error.details === 'object' ?
                     Object.entries(error.details).map(([key, value]) => (
                       <div key={key} className="error-detail-item mb-1">
                         <strong>{key}:</strong> {String(value)}
                       </div>
                     )) :
                   String(error.details)
                  }
                </div>
              </div>
            </details>
          )}

          {/* Error code if available */}
          {error?.code && (
            <div className="mt-2">
              <span className="inline-flex items-center px-2 py-1 rounded-md bg-current/10 text-current/80">
                <span className="text-xs font-mono font-medium">
                  Error Code: {error.code}
                </span>
              </span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-3 mt-4">
            {showRetry && onRetry && (
              <button
                onClick={onRetry}
                className="btn-vedic btn-primary btn-sm"
              >
                <span className="vedic-symbol">🔄</span>
                Try Again
              </button>
            )}

            {error?.recoverySuggestions && (
              <div className="flex-1">
                <p className="text-sm text-current/80">
                  💡 Suggestion: {error.recoverySuggestions}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Specialized Error Boundary Component for Vedic Applications
 */
export class VedicErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  async componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error for debugging
    console.error('Vedic Error Boundary caught an error:', error, errorInfo);

    // Log error to backend via errorLogger
    try {
      const errorLogger = (await import('../../utils/errorLogger.js')).default;
      errorLogger.logError({
        type: 'react_error',
        error: error,
        message: error?.message || error?.toString() || 'React component error',
        stack: error?.stack,
        componentStack: errorInfo?.componentStack,
        timestamp: new Date().toISOString()
      });
    } catch (logError) {
      // Silently fail if error logging fails
      console.debug('Error logging failed:', logError);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-sacred p-6">
          <div className="max-w-2xl w-full">
            <ErrorMessage
              error={{
                message: 'A spiritual disruption has occurred in the cosmic flow',
                details: this.state.error?.stack,
                code: 'COSMIC_MISALIGNMENT'
              }}
              title="Cosmic Error Detected"
              type="error"
              size="lg"
              showRetry={true}
              onRetry={() => window.location.reload()}
              className="card-cosmic"
            />

            <div className="mt-6 text-center">
              <p className="text-secondary mb-4">
                The stars suggest refreshing your cosmic connection
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => window.location.reload()}
                  className="btn-vedic btn-primary"
                >
                  <span className="vedic-symbol symbol-om"></span>
                  Restore Balance
                </button>
                <button
                  onClick={() => window.history.back()}
                  className="btn-vedic btn-secondary"
                >
                  <span className="vedic-symbol">↶</span>
                  Return to Previous Path
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorMessage;
