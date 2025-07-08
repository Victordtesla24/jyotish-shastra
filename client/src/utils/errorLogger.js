// Client-side error logger - captures runtime errors and sends to server
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

let isLoggingError = false; // Prevent infinite loops

const logClientError = async (error, errorInfo) => {
  // Prevent infinite loops - don't log errors that occur during logging
  if (isLoggingError) return;

  // Don't log errors related to error logging itself
  if (error.message && error.message.includes('log-client-error')) return;
  if (error.stack && error.stack.includes('log-client-error')) return;

  const errorData = {
    timestamp: new Date().toISOString(),
    message: error.message || 'Unknown error',
    stack: error.stack || 'No stack trace',
    url: window.location.href,
    userAgent: navigator.userAgent,
    componentStack: errorInfo?.componentStack || 'N/A'
  };

  try {
    isLoggingError = true;
    await fetch(`${API_BASE_URL}/log-client-error`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorData)
    });
  } catch (e) {
    // Silently fail - don't create another error loop
    console.warn('Failed to log client error (this is expected during development):', e.message);
  } finally {
    isLoggingError = false;
  }
};

// Global error handler - captures all JavaScript errors
window.addEventListener('error', (event) => {
  // Check if this is a resource loading error vs JavaScript error
  if (event.target !== window) {
    // Resource loading error (images, scripts, etc.)
    console.log('🚨 Resource error captured:', event);
    logClientError({
      message: `Resource failed to load: ${event.target.tagName}`,
      stack: `URL: ${event.target.src || event.target.href || 'Unknown'}`,
      filename: event.target.src || event.target.href
    }, null);
  } else {
    // JavaScript runtime error
    console.log('🚨 Global error captured:', event);
    logClientError({
      message: event.message || 'Unknown error',
      stack: event.error?.stack || 'No stack trace',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    }, null);
  }
}, true);

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.log('🚨 Promise rejection captured:', event);
  logClientError({
    message: event.reason?.message || 'Promise rejection',
    stack: event.reason?.stack || 'No stack trace'
  }, null);
});

// Override console.error to capture webpack/module errors - DISABLED to reduce noise during debugging
// const originalConsoleError = console.error;
// console.error = function(...args) {
//   // Call original console.error
//   originalConsoleError.apply(console, args);

//   // Log to server if it looks like a runtime error
//   const errorMessage = args.join(' ');
//   if (errorMessage.includes('TypeError') || errorMessage.includes('Error') || errorMessage.includes('Cannot read properties')) {
//     console.log('🚨 Console error captured:', errorMessage);
//     logClientError({
//       message: errorMessage,
//       stack: 'Console error - see browser console for full stack',
//       source: 'console.error override'
//     }, null);
//   }
// };

export default logClientError;
