/**
 * WebSocket Environment Setup for Puppeteer Tests
 * Configures proper WebSocket handling in Node.js environment
 */

// Mock WebSocket at global level
global.WebSocket = require('./tests/__mocks__/ws.js');

// Set environment variables for Puppeteer
process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = 'true';
process.env.PUPPETEER_EXECUTABLE_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

// Suppress WebSocket warnings
process.env.NODE_NO_WARNINGS = '1';

console.log('🔧 WebSocket environment configured for Puppeteer tests');
