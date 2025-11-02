/**
 * Production Implementation for wasm-loader.js testing
 * Provides actual WASM loader functionality for Jest testing
 * Replaces mock implementation with production-grade code
 */

import path from 'path';
import fs from 'fs';

/**
 * Get WASM file path for sweph-wasm initialization
 * @returns {string|null} WASM file path as URL string or null for browser/default
 */
export function getWasmPath() {
  const isNode = typeof window === 'undefined' && typeof process !== 'undefined';
  
  if (!isNode) {
    return null;
  }
  
  // Enhanced path resolution for test environment using process.cwd() consistently
  // This ensures paths work correctly in Jest/jsdom environment
  const cwd = process.cwd();
  const possiblePaths = [
    path.resolve(cwd, 'node_modules/sweph-wasm/dist/wasm/swisseph.wasm'),
    path.resolve(cwd, 'public/swisseph.wasm'),
    path.resolve(cwd, 'client/public/swisseph.wasm'),
  ];
  
  for (const wasmPath of possiblePaths) {
    try {
      if (fs.existsSync(wasmPath)) {
        const normalizedPath = wasmPath.replace(/\\/g, '/');
        const fileUrl = new URL(`file://${normalizedPath}`).href;
        return fileUrl;
      }
    } catch (error) {
      // Continue to next path if this one fails
      continue;
    }
  }
  
  return null;
}

/**
 * Check if WASM file exists
 * @returns {boolean} True if WASM file exists, false otherwise
 */
export function wasmFileExists() {
  const isNode = typeof window === 'undefined' && typeof process !== 'undefined';
  
  if (!isNode) {
    return true;
  }
  
  const cwd = process.cwd();
  const possiblePaths = [
    path.resolve(cwd, 'node_modules/sweph-wasm/dist/wasm/swisseph.wasm'),
    path.resolve(cwd, 'public/swisseph.wasm'),
    path.resolve(cwd, 'client/public/swisseph.wasm')
  ];
  
  return possiblePaths.some(wasmPath => {
    try {
      return fs.existsSync(wasmPath);
    } catch {
      return false;
    }
  });
}

/**
 * Get WASM file buffer for Node.js initialization
 * Reads WASM file directly into buffer for reliable initialization
 * @returns {Buffer|null} WASM file buffer or null if not found
 */
export function getWasmBuffer() {
  const isNode = typeof window === 'undefined' && typeof process !== 'undefined';
  
  if (!isNode) {
    return null;
  }
  
  // Enhanced path resolution for test environment
  const cwd = process.cwd();
  const possiblePaths = [
    path.resolve(cwd, 'node_modules/sweph-wasm/dist/wasm/swisseph.wasm'),
    path.resolve(cwd, 'public/swisseph.wasm'),
    path.resolve(cwd, 'client/public/swisseph.wasm')
  ];
  
  for (const wasmPath of possiblePaths) {
    try {
      if (fs.existsSync(wasmPath)) {
        const wasmBuffer = fs.readFileSync(wasmPath);
        return wasmBuffer;
      }
    } catch (error) {
      // Continue to next path if this one fails
      continue;
    }
  }
  
  return null;
}

/**
 * Get ephemeris path safe for Node.js environment
 * @param {string} ephemerisDir - Base ephemeris directory path
 * @returns {string|null} URL for ephemeris directory or null
 */
export function getEphemerisPathUrl(ephemerisDir) {
  const isNode = typeof window === 'undefined' && typeof process !== 'undefined';
  
  if (!isNode) {
    return ephemerisDir;
  }
  
  // For test environment, return null to use bundled ephemeris
  return null;
}

/**
 * Check if we should skip ephemeris path setup
 * @returns {boolean} True if ephemeris path should be skipped
 */
export function shouldSkipEphemerisPath() {
  const isNode = typeof window === 'undefined' && typeof process !== 'undefined';
  return isNode;
}

