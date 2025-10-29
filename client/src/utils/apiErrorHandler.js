// Enhanced error handling for API calls
export const initializeErrorHandling = () => {
  // Global error handler
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    handleError(event.reason);
  });

  // Axios interceptor for API errors
  if (window.axios) {
    window.axios.interceptors.response.use(
      response => response,
      error => {
        handleError(error);
        return Promise.reject(error);
      }
    );
  }
};

export const handleError = (error) => {
  let errorMessage = 'An unexpected error occurred';
  let errorType = 'ERROR';

  if (error.response) {
    // Server responded with error
    errorMessage = error.response.data?.message || error.response.data?.error || errorMessage;
    errorType = getErrorType(error.response.status);
  } else if (error.request) {
    // Request made but no response
    errorMessage = 'Unable to reach the server. Please check your connection.';
    errorType = 'NETWORK_ERROR';
  } else if (error.message) {
    // Something else happened
    errorMessage = error.message;
  }

  // Log error for debugging
  console.error(`[${errorType}]`, errorMessage, error);

  // Return structured error
  return {
    type: errorType,
    message: errorMessage,
    details: error,
  };
};

const getErrorType = (status) => {
  if (status >= 400 && status < 500) {
    switch (status) {
      case 400: return 'BAD_REQUEST';
      case 401: return 'UNAUTHORIZED';
      case 403: return 'FORBIDDEN';
      case 404: return 'NOT_FOUND';
      case 409: return 'CONFLICT';
      case 422: return 'VALIDATION_ERROR';
      default: return 'CLIENT_ERROR';
    }
  } else if (status >= 500) {
    return 'SERVER_ERROR';
  }
  return 'UNKNOWN_ERROR';
};

export const formatErrorMessage = (error) => {
  if (typeof error === 'string') return error;

  if (error.response?.data?.errors) {
    // Handle validation errors
    const errors = error.response.data.errors;
    if (Array.isArray(errors)) {
      return errors.map(err => err.message || err).join(', ');
    } else if (typeof errors === 'object') {
      return Object.values(errors).flat().join(', ');
    }
  }

  return error.message || 'An unexpected error occurred';
};

const apiErrorHandler = {
  initializeErrorHandling,
  handleError,
  formatErrorMessage
};

export default apiErrorHandler;
