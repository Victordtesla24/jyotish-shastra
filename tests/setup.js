// Test setup file
import '@testing-library/jest-dom';

// Global test setup
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn()
};

// Mock window object
global.window = {
  ...global.window,
  scrollTo: jest.fn()
};

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
global.sessionStorage = sessionStorageMock;
