// Test setup file
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Polyfill TextEncoder/TextDecoder for Node.js environment (required for supertest)
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Polyfill fetch for Node.js/Jest environment (required for WASM loading)
if (typeof global.fetch === 'undefined') {
  // Polyfill Response class
  if (typeof global.Response === 'undefined') {
    global.Response = class Response {
      constructor(body, init = {}) {
        this.body = body;
        this.status = init.status || 200;
        this.statusText = init.statusText || 'OK';
        this.headers = new Map(Object.entries(init.headers || {}));
        this.ok = this.status >= 200 && this.status < 300;
      }
      
      async arrayBuffer() {
        if (this.body instanceof Buffer) {
          return this.body.buffer;
        }
        if (this.body instanceof ArrayBuffer) {
          return this.body;
        }
        return new ArrayBuffer(0);
      }
      
      async blob() {
        return new Blob([this.body]);
      }
      
      async text() {
        if (this.body instanceof Buffer) {
          return this.body.toString();
        }
        return String(this.body || '');
      }
      
      async json() {
        return JSON.parse(await this.text());
      }
    };
  }
  
  global.fetch = async (url, options) => {
    // For file:// URLs, use Node.js fs to read files
    if (url && url.startsWith('file://')) {
      const fs = (await import('fs')).default;
      const { fileURLToPath } = await import('url');
      
      try {
        const filePath = fileURLToPath(url);
        const buffer = fs.readFileSync(filePath);
        return new Response(buffer, {
          status: 200,
          statusText: 'OK',
          headers: { 'Content-Type': 'application/wasm' }
        });
      } catch (error) {
        return new Response(null, {
          status: 404,
          statusText: 'Not Found'
        });
      }
    }
    
    // For HTTP URLs, use node-fetch if available, otherwise throw
    throw new Error('fetch not available for HTTP URLs in test environment');
  };
}

// Global test setup - filter console noise in tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

// Filter out dotenv warnings and other noise
const shouldSuppress = (args) => {
  const message = args.join(' ').toLowerCase();
  return (
    message.includes('dotenv') ||
    message.includes('injecting env') ||
    message.includes('✅ uidatasaver') ||
    message.includes('✅ all') ||
    message.includes('🔄') ||
    message.includes('🔍 birthdataform') ||
    message.includes('🚀 birthdataform') ||
    message.includes('validation result') ||
    message.includes('formatted data')
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
