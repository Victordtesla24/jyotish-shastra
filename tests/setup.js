/**
 * Jest Test Setup File
 * Handles cleanup of database connections, timers, and other resources
 * to prevent hanging tests
 */

// Set environment for testing
process.env.NODE_ENV = 'test';

// Mock console methods to reduce noise in tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

// Only show errors and important warnings during tests
console.log = () => {};
console.warn = () => {};
console.error = originalConsoleError;

// Global test timeout
jest.setTimeout(30000);

// Setup before each test
beforeEach(() => {
  // Clear all timers
  jest.clearAllTimers();

  // Clear all mocks
  jest.clearAllMocks();
});

// Cleanup after each test
afterEach(async () => {
  // Clear any pending timers
  jest.runOnlyPendingTimers();
  jest.useRealTimers();

  // Force garbage collection if available
  if (global.gc) {
    global.gc();
  }
});

// Global cleanup after all tests
afterAll(async () => {
  // Close any database connections
  try {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  } catch (error) {
    // Mongoose might not be initialized in all tests
  }

  // Clear all timers
  jest.clearAllTimers();

  // Restore console methods
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;

  // Force exit after a brief delay
  setTimeout(() => {
    process.exit(0);
  }, 100);
});

// Handle uncaught exceptions during tests
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception during test:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Promise Rejection during test:', error);
  process.exit(1);
});

// Prevent tests from hanging on open handles
process.on('exit', () => {
  // Force close any remaining handles
});
