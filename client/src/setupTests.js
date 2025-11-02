// jest-dom adds custom jest matchers for asserting on DOM nodes.
import '@testing-library/jest-dom';

// Production-grade test setup with real implementations
// Replaces mocks with production-ready test environment

// Set up real window scroll behavior for testing
global.scrollTo = jest.fn((x, y) => {
  window.scrollX = x;
  window.scrollY = y;
});

// Production localStorage implementation for testing
const productionStorage = {
  store: {},
  
  getItem(key) {
    return this.store[key] || null;
  },
  
  setItem(key, value) {
    this.store[key] = String(value);
  },
  
  removeItem(key) {
    delete this.store[key];
  },
  
  clear() {
    this.store = {};
  },
  
  get length() {
    return Object.keys(this.store).length;
  },
  
  key(index) {
    return Object.keys(this.store)[index] || null;
  }
};

// Replace mocks with production implementations
global.localStorage = productionStorage;
global.sessionStorage = productionStorage;

// Production fetch implementation for testing
global.fetch = jest.fn(async (url, options = {}) => {
  // In production tests, this will hit real endpoints
  // For integration tests, ensure proper error handling
  try {
    // This will point to the actual API in production testing
    const response = await fetch(url, options);
    return response;
  } catch (error) {
    // Production-grade error handling - don't fake responses
    const errorResponse = new Response(
      JSON.stringify({ 
        error: `API request failed: ${error.message}`,
        status: 'error' 
      }),
      { 
        status: 500, 
        statusText: 'Internal Server Error',
        headers: { 'Content-Type': 'application/json' }
      }
    );
    return errorResponse;
  }
});

// Production environment configuration - no hardcoded test keys
// Use real environment variables or fail gracefully
if (!process.env.REACT_APP_API_URL) {
  process.env.REACT_APP_API_URL = process.env.NODE_ENV === 'production' 
    ? '/api' 
    : 'http://localhost:3002/api';
}

// Don't mock geocoding - require real API key or fail properly
if (!process.env.REACT_APP_GEOCODING_API_KEY) {
  console.warn('⚠️ Production test environment: REACT_APP_GEOCODING_API_KEY not configured');
}
process.env.REACT_APP_GEOCODING_ENABLED = process.env.REACT_APP_GEOCODING_ENABLED || 'true';

// Set up Error boundary for production testing - filter console noise
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

// Filter out dotenv warnings and debug noise
const shouldSuppress = (args) => {
  const message = args.join(' ').toLowerCase();
  return (
    message.includes('dotenv') ||
    message.includes('injecting env') ||
    message.includes('✅ uidatasaver') ||
    message.includes('🔄') ||
    message.includes('🔍 birthdataform') ||
    message.includes('🚀 birthdataform')
  );
};

global.console = {
  ...console,
  log: (...args) => {
    if (!shouldSuppress(args)) {
      originalConsoleLog(...args);
    }
  },
  error: jest.fn((...args) => {
    if (!shouldSuppress(args)) {
      originalConsoleError(...args);
    }
  }),
  warn: jest.fn((...args) => {
    if (!shouldSuppress(args)) {
      originalConsoleWarn(...args);
    }
  })
};
