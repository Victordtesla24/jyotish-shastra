/**
 * API Configuration Utility
 * Centralizes API base URL configuration for all API calls
 * Supports environment variables for different deployment environments
 */

/**
 * Get the API base URL
 * Uses REACT_APP_API_URL if set, otherwise falls back to relative path
 * @returns {string} API base URL
 */
export function getApiBaseUrl() {
  // Check for explicit API URL from environment variable
  const apiUrl = process.env.REACT_APP_API_URL;
  
  if (apiUrl) {
    // Remove trailing slash if present
    return apiUrl.replace(/\/$/, '');
  }
  
  // Fallback to relative path (works with proxy in development)
  return '';
}

/**
 * Build full API endpoint URL
 * @param {string} endpoint - API endpoint path (e.g., '/api/v1/chart/generate')
 * @returns {string} Full API URL
 */
export function getApiUrl(endpoint) {
  const baseUrl = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // If base URL is empty, return relative path
  if (!baseUrl) {
    return cleanEndpoint;
  }
  
  // Combine base URL and endpoint
  return `${baseUrl}${cleanEndpoint}`;
}

/**
 * Get default fetch options with API base URL
 * @param {Object} options - Additional fetch options
 * @returns {Object} Fetch options with proper headers
 */
export function getApiFetchOptions(options = {}) {
  const baseUrl = getApiBaseUrl();
  
  return {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  };
}

// Export default for backward compatibility
export default {
  getApiBaseUrl,
  getApiUrl,
  getApiFetchOptions,
};

