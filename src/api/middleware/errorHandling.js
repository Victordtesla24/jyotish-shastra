/**
 * Enhanced Error Handling Middleware
 * Provides comprehensive error logging and user-friendly error responses
 */
export default function errorHandling(err, req, res, next) {
  // If headers already sent, delegate to Express default error handler
  if (res.headersSent) {
    return next(err);
  }

  // Determine error status code
  const status = err.status || err.statusCode || 500;
  
  // Enhanced error logging with context
  const errorContext = {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    originalUrl: req.originalUrl,
    statusCode: status,
    errorMessage: err.message,
    errorName: err.name,
    errorStack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection?.remoteAddress,
    body: req.body && Object.keys(req.body).length > 0 
      ? (process.env.NODE_ENV === 'development' ? req.body : '[REDACTED]')
      : undefined
  };

  // Log error with appropriate level
  if (status >= 500) {
    // Server errors - log full details
    console.error('🚨 Server Error:', errorContext);
    console.error('Error Stack:', err.stack);
  } else if (status >= 400) {
    // Client errors - log with reduced detail
    console.warn('⚠️  Client Error:', {
      timestamp: errorContext.timestamp,
      method: errorContext.method,
      path: errorContext.path,
      statusCode: status,
      errorMessage: err.message
    });
  }

  // Prepare user-friendly error response
  const errorResponse = {
    success: false,
    error: err.name || 'Error',
    message: err.message || 'Internal Server Error',
    statusCode: status,
    timestamp: errorContext.timestamp
  };

  // Add additional error details in development mode
  if (process.env.NODE_ENV === 'development') {
    errorResponse.details = {
      stack: err.stack,
      path: req.path,
      method: req.method
    };
    
    // Add validation errors if present
    if (err.details && Array.isArray(err.details)) {
      errorResponse.validationErrors = err.details;
    }
  }

  // Handle specific error types
  if (err.name === 'ValidationError' || err.name === 'JoiValidationError') {
    errorResponse.error = 'Validation Error';
    errorResponse.message = 'Request validation failed';
    if (err.details) {
      errorResponse.validationErrors = Array.isArray(err.details)
        ? err.details
        : [err.details];
    }
  } else if (err.name === 'CastError' || err.name === 'MongoError') {
    errorResponse.error = 'Database Error';
    errorResponse.message = 'A database operation failed. Please try again.';
  } else if (err.name === 'UnauthorizedError' || status === 401) {
    errorResponse.error = 'Authentication Error';
    errorResponse.message = 'Authentication required or invalid credentials';
  } else if (status === 403) {
    errorResponse.error = 'Authorization Error';
    errorResponse.message = 'You do not have permission to access this resource';
  } else if (status === 404) {
    errorResponse.error = 'Not Found';
    errorResponse.message = 'The requested resource was not found';
  } else if (status >= 500) {
    // Server errors - generic message for security
    errorResponse.error = 'Internal Server Error';
    errorResponse.message = process.env.NODE_ENV === 'production'
      ? 'An internal server error occurred. Please try again later.'
      : err.message || 'Internal Server Error';
  }

  // Send error response
  res.status(status).json(errorResponse);
}
