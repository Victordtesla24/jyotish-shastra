/**
 * Enhanced API Error Handler Utility
 * Handles JSON parsing errors, ChunkLoadErrors, and other API-related issues
 * Based on best practices from https://www.codingdeft.com/posts/react-json-errors/
 */

/**
 * Enhanced fetch wrapper with comprehensive error handling
 * @param {string} url - The URL to fetch
 * @param {Object} options - Fetch options
 * @returns {Promise} Promise that resolves to response data or rejects with enhanced error
 */
export const safeFetch = async (url, options = {}) => {
  let responseClone;

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    // Clone the response for error handling
    responseClone = response.clone();

    // Check if response is ok
    if (!response.ok) {
      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      } else {
        // Response is not JSON, likely HTML error page
        const errorText = await response.text();
        console.warn('Received non-JSON response:', errorText.substring(0, 200));
        throw new Error(`Server returned ${response.status}: Expected JSON but received ${contentType || 'unknown content type'}`);
      }
    }

    // Check content type before parsing as JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.warn('Response does not have JSON content-type:', contentType);
      const textResponse = await response.text();

      // Try to detect if it's HTML
      if (textResponse.trim().startsWith('<')) {
        throw new Error('Server returned HTML instead of JSON. This usually indicates a server-side error or incorrect URL.');
      }

      // Try to parse as JSON anyway
      try {
        return JSON.parse(textResponse);
      } catch (parseError) {
        throw new Error(`Unable to parse response as JSON: ${parseError.message}`);
      }
    }

    // Safe JSON parsing
    try {
      const data = await response.json();
      return data;
    } catch (jsonError) {
      console.error('JSON parsing error:', jsonError);
      throw new Error('Server returned invalid JSON. Please try again or contact support if the problem persists.');
    }

  } catch (error) {
    // Enhanced error logging for debugging
    console.error('API Request Error:', {
      url,
      error: error.message,
      status: error.status,
      responseClone: responseClone ? 'Available' : 'Not available'
    });

    // If we have a response clone, log the content for debugging
    if (responseClone) {
      try {
        const responseText = await responseClone.text();
        console.log('Failed response content:', responseText.substring(0, 500));
      } catch (cloneError) {
        console.warn('Could not read response clone:', cloneError.message);
      }
    }

    // Re-throw with enhanced error message
    throw new Error(`API request failed: ${error.message}`);
  }
};

/**
 * Safe JSON parser with error handling
 * @param {string} jsonString - String to parse as JSON
 * @param {string} context - Context description for error reporting
 * @returns {Object} Parsed JSON object
 */
export const safeJsonParse = (jsonString, context = 'data') => {
  if (!jsonString || typeof jsonString !== 'string') {
    throw new Error(`Invalid ${context}: Expected string but received ${typeof jsonString}`);
  }

  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error(`JSON Parse Error in ${context}:`, {
      error: error.message,
      input: jsonString.substring(0, 100) + (jsonString.length > 100 ? '...' : '')
    });

    // Detect common issues
    if (jsonString.trim().startsWith('<')) {
      throw new Error(`Invalid ${context}: Received HTML instead of JSON. This usually indicates a server error.`);
    }

    if (jsonString.trim() === '') {
      throw new Error(`Invalid ${context}: Received empty response.`);
    }

    if (jsonString.includes('Unexpected token')) {
      throw new Error(`Invalid ${context}: Malformed JSON response.`);
    }

    throw new Error(`Invalid ${context}: ${error.message}`);
  }
};

/**
 * Axios response interceptor with enhanced error handling
 * @param {Object} response - Axios response object
 * @returns {Object} Response data
 */
export const axiosResponseInterceptor = (response) => {
  // Log successful responses for debugging
  console.log(`✅ API Success: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
    status: response.status,
    contentType: response.headers['content-type']
  });

  return response;
};

/**
 * Axios error interceptor with enhanced error handling
 * @param {Object} error - Axios error object
 * @returns {Promise} Rejected promise with enhanced error
 */
export const axiosErrorInterceptor = async (error) => {
  const { response, request, config } = error;

  console.error(`❌ API Error: ${config?.method?.toUpperCase()} ${config?.url}`, {
    status: response?.status,
    message: error.message,
    data: response?.data
  });

  // Handle different types of errors
  if (response) {
    // Server responded with error status
    const { status, data, headers } = response;
    const contentType = headers['content-type'] || '';

    // Check if server returned HTML instead of JSON
    if (contentType.includes('text/html') && typeof data === 'string' && data.includes('<html>')) {
      console.warn('Server returned HTML error page instead of JSON');

      // Extract title from HTML if possible
      const titleMatch = data.match(/<title>(.*?)<\/title>/i);
      const title = titleMatch ? titleMatch[1] : 'Server Error';

      const enhancedError = new Error(`Server Error (${status}): ${title}. Expected JSON response but received HTML.`);
      enhancedError.status = status;
      enhancedError.isHtmlResponse = true;
      return Promise.reject(enhancedError);
    }

    // Handle specific status codes
    let errorMessage = data?.message || data?.error || error.message;

    switch (status) {
      case 400:
        errorMessage = `Bad Request: ${errorMessage}`;
        break;
      case 401:
        errorMessage = `Unauthorized: ${errorMessage}`;
        break;
      case 403:
        errorMessage = `Forbidden: ${errorMessage}`;
        break;
      case 404:
        errorMessage = `Not Found: The requested resource was not found. ${errorMessage}`;
        break;
      case 429:
        errorMessage = `Too Many Requests: Please wait and try again. ${errorMessage}`;
        break;
      case 500:
        errorMessage = `Internal Server Error: ${errorMessage}`;
        break;
      case 502:
        errorMessage = `Bad Gateway: Server is temporarily unavailable. ${errorMessage}`;
        break;
      case 503:
        errorMessage = `Service Unavailable: ${errorMessage}`;
        break;
      default:
        errorMessage = `HTTP ${status}: ${errorMessage}`;
    }

    const enhancedError = new Error(errorMessage);
    enhancedError.status = status;
    enhancedError.response = response;
    return Promise.reject(enhancedError);

  } else if (request) {
    // Request was made but no response received
    const networkError = new Error('Network Error: Unable to connect to server. Please check your internet connection.');
    networkError.isNetworkError = true;
    return Promise.reject(networkError);
  } else {
    // Something else happened
    return Promise.reject(new Error(`Request Error: ${error.message}`));
  }
};

/**
 * ChunkLoadError retry handler
 * @param {Function} retryFunction - Function to retry
 * @param {string} componentName - Name of component for debugging
 * @param {number} maxRetries - Maximum retry attempts
 * @returns {Promise} Promise that resolves after successful retry or rejects after max retries
 */
export const handleChunkLoadError = async (retryFunction, componentName = 'Component', maxRetries = 3) => {
  const retryKey = `chunk-retry-${componentName}`;
  const currentRetries = parseInt(sessionStorage.getItem(retryKey) || '0', 10);

  try {
    const result = await retryFunction();
    // Success: reset retry counter
    sessionStorage.removeItem(retryKey);
    return result;
  } catch (error) {
    console.error(`ChunkLoadError in ${componentName}:`, error);

    if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')) {
      if (currentRetries < maxRetries) {
        console.log(`Retrying ${componentName} (attempt ${currentRetries + 1}/${maxRetries})`);
        sessionStorage.setItem(retryKey, String(currentRetries + 1));

        // For first retry, refresh the page
        if (currentRetries === 0) {
          sessionStorage.setItem('chunk-refresh-pending', 'true');
          window.location.reload();
          return;
        }

        // For subsequent retries, wait and try again
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, currentRetries)));
        return handleChunkLoadError(retryFunction, componentName, maxRetries);
      } else {
        sessionStorage.removeItem(retryKey);
        throw new Error(`Failed to load ${componentName} after ${maxRetries} attempts`);
      }
    }

    throw error;
  }
};

/**
 * Initialize enhanced error handling on page load
 */
export const initializeErrorHandling = () => {
  // Check if we just refreshed due to a chunk error
  if (sessionStorage.getItem('chunk-refresh-pending')) {
    sessionStorage.removeItem('chunk-refresh-pending');
    console.log('Page refreshed due to ChunkLoadError - chunks should now be up to date');
  }

  // Global error handler for unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled Promise Rejection:', event.reason);

    if (event.reason?.name === 'ChunkLoadError') {
      console.log('Preventing ChunkLoadError from crashing the app');
      event.preventDefault();

      // Show user-friendly message
      const message = 'The application is updating. Please refresh the page to continue.';
      console.warn(message);

      // Optionally show a toast notification here
    }
  });

  // Global error handler for uncaught errors
  window.addEventListener('error', (event) => {
    if (event.message.includes('Loading chunk') || event.message.includes('ChunkLoadError')) {
      console.log('Caught ChunkLoadError - preventing app crash');
      event.preventDefault();
    }
  });
};

// Auto-initialize error handling
if (typeof window !== 'undefined') {
  initializeErrorHandling();
}

const apiErrorHandler = {
  safeFetch,
  safeJsonParse,
  axiosResponseInterceptor,
  axiosErrorInterceptor,
  handleChunkLoadError,
  initializeErrorHandling
};

export default apiErrorHandler;
