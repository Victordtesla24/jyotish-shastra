// Client-side error logger - captures runtime errors and sends to server
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const logClientError = async (error, errorInfo) => {
  const errorData = {
    timestamp: new Date().toISOString(),
    message: error.message || 'Unknown error',
    stack: error.stack || 'No stack trace',
    url: window.location.href,
    userAgent: navigator.userAgent,
    componentStack: errorInfo?.componentStack || 'N/A'
  };

  try {
    await fetch(`${API_BASE_URL}/log-client-error`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorData)
    });
  } catch (e) {
    console.error('Failed to log client error:', e);
  }
};

// Global error handler - captures all JavaScript errors
window.addEventListener('error', (event) => {
  console.log('🚨 Global error captured:', event);
  logClientError({
    message: event.message || 'Unknown error',
    stack: event.error?.stack || 'No stack trace',
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  }, null);
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.log('🚨 Promise rejection captured:', event);
  logClientError({
    message: event.reason?.message || 'Promise rejection',
    stack: event.reason?.stack || 'No stack trace'
  }, null);
});

// Resource loading errors (images, scripts, etc.)
window.addEventListener('error', (event) => {
  if (event.target !== window) {
    console.log('🚨 Resource error captured:', event);
    logClientError({
      message: `Resource failed to load: ${event.target.tagName}`,
      stack: `URL: ${event.target.src || event.target.href || 'Unknown'}`,
      filename: event.target.src || event.target.href
    }, null);
  }
}, true);

// Override console.error to capture webpack/module errors
const originalConsoleError = console.error;
console.error = function(...args) {
  // Call original console.error
  originalConsoleError.apply(console, args);

  // Log to server if it looks like a runtime error
  const errorMessage = args.join(' ');
  if (errorMessage.includes('TypeError') || errorMessage.includes('Error') || errorMessage.includes('Cannot read properties')) {
    console.log('🚨 Console error captured:', errorMessage);
    logClientError({
      message: errorMessage,
      stack: 'Console error - see browser console for full stack',
      source: 'console.error override'
    }, null);
  }
};

export default logClientError;
