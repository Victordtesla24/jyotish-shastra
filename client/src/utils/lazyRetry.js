import React from 'react';

/**
 * Lazy loading utility with retry mechanism for ChunkLoadError
 * Based on best practices to handle chunk loading failures during deployments
 */

/**
 * Creates a lazy loaded component with retry capability
 * @param {Function} importFunc - The dynamic import function
 * @param {string} componentName - Name of the component (for debugging)
 * @returns {React.Component} Lazy loaded component with retry logic
 */
const lazyRetry = (importFunc, componentName = 'Component') => {
  return new Promise((resolve, reject) => {
    // Check if the page has already been refreshed to avoid infinite loops
    const hasRefreshed = JSON.parse(
      window.sessionStorage.getItem(`retry-${componentName}-refreshed`) || 'false'
    );

    // Try to import the component
    importFunc()
      .then((component) => {
        // Success: reset the refresh flag
        window.sessionStorage.setItem(`retry-${componentName}-refreshed`, 'false');
        resolve(component);
      })
      .catch((error) => {
        console.error(`ChunkLoadError for ${componentName}:`, error);

        // Check if this is a ChunkLoadError and we haven't refreshed yet
        if (!hasRefreshed && error.name === 'ChunkLoadError') {
          console.log(`Attempting to refresh page to fix ChunkLoadError for ${componentName}`);
          // Set the refresh flag
          window.sessionStorage.setItem(`retry-${componentName}-refreshed`, 'true');
          // Refresh the page to get the latest chunks
          window.location.reload();
          return;
        }

        // If we already refreshed or it's not a ChunkLoadError, reject with the error
        reject(error);
      });
  });
};

/**
 * Enhanced lazy loading with multiple retry attempts
 * @param {Function} importFunc - The dynamic import function
 * @param {string} componentName - Name of the component (for debugging)
 * @param {number} maxRetries - Maximum number of retry attempts
 * @returns {React.Component} Lazy loaded component with enhanced retry logic
 */
const lazyRetryEnhanced = (importFunc, componentName = 'Component', maxRetries = 3) => {
  return new Promise((resolve, reject) => {
    const retryKey = `retry-${componentName}-count`;
    const refreshKey = `retry-${componentName}-refreshed`;

    // Get current retry count
    const currentRetries = parseInt(
      window.sessionStorage.getItem(retryKey) || '0', 10
    );

    const hasRefreshed = JSON.parse(
      window.sessionStorage.getItem(refreshKey) || 'false'
    );

    // Try to import the component
    importFunc()
      .then((component) => {
        // Success: reset all retry flags
        window.sessionStorage.removeItem(retryKey);
        window.sessionStorage.setItem(refreshKey, 'false');
        resolve(component);
      })
      .catch((error) => {
        console.error(`ChunkLoadError for ${componentName} (attempt ${currentRetries + 1}):`, error);

        // Check if this is a ChunkLoadError and we haven't exceeded max retries
        if (currentRetries < maxRetries && (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk'))) {

          // For the first retry, try refreshing the page
          if (currentRetries === 0 && !hasRefreshed) {
            console.log(`Refreshing page to fix ChunkLoadError for ${componentName}`);
            window.sessionStorage.setItem(refreshKey, 'true');
            window.sessionStorage.setItem(retryKey, '1');
            window.location.reload();
            return;
          }

          // For subsequent retries, try again with a delay
          const retryDelay = Math.min(1000 * Math.pow(2, currentRetries), 5000); // Exponential backoff
          console.log(`Retrying ${componentName} in ${retryDelay}ms...`);

          setTimeout(() => {
            window.sessionStorage.setItem(retryKey, String(currentRetries + 1));
            lazyRetryEnhanced(importFunc, componentName, maxRetries)
              .then(resolve)
              .catch(reject);
          }, retryDelay);

          return;
        }

        // If we've exceeded max retries or it's not a ChunkLoadError, reject
        console.error(`Failed to load ${componentName} after ${currentRetries + 1} attempts`);
        window.sessionStorage.removeItem(retryKey);
        window.sessionStorage.removeItem(refreshKey);
        reject(error);
      });
  });
};

/**
 * Create a lazy loaded component with retry capability
 * @param {Function} importFunc - The dynamic import function
 * @param {string} componentName - Name of the component (for debugging)
 * @returns {React.LazyExoticComponent} Lazy loaded React component
 */
const createLazyComponent = (importFunc, componentName = 'Component') => {
  return React.lazy(() => lazyRetry(importFunc, componentName));
};

/**
 * Create an enhanced lazy loaded component with multiple retry attempts
 * @param {Function} importFunc - The dynamic import function
 * @param {string} componentName - Name of the component (for debugging)
 * @param {number} maxRetries - Maximum number of retry attempts
 * @returns {React.LazyExoticComponent} Enhanced lazy loaded React component
 */
const createEnhancedLazyComponent = (importFunc, componentName = 'Component', maxRetries = 3) => {
  return React.lazy(() => lazyRetryEnhanced(importFunc, componentName, maxRetries));
};

// Export the utility object as default
const lazyRetryUtils = {
  lazyRetry,
  lazyRetryEnhanced,
  createLazyComponent,
  createEnhancedLazyComponent
};

export default lazyRetryUtils;
