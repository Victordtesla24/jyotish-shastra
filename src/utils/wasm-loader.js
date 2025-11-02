/**
 * WASM Loader Utility
 * Provides WASM file path resolution for sweph-wasm initialization
 * Handles both Node.js and browser environments
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Get WASM file path for sweph-wasm initialization
 * @returns {string|null} WASM file path as URL string or null for browser/default
 */
export function getWasmPath() {
  const isNode = typeof window === 'undefined' && typeof process !== 'undefined';
  
  if (!isNode) {
    return null; // Browser will use default behavior
  }
  
  // Check if we're in a production environment (Render, etc.)
  const isProduction = process.env.NODE_ENV === 'production';
  const isRender = Boolean(process.env.RENDER);
  
  if (isProduction || isRender) {
    // In Render, WASM files should be accessible via file system
    // First try to find the file locally
    const publicPath = path.resolve(process.cwd(), 'public/swisseph.wasm');
    if (fs.existsSync(publicPath)) {
      const publicUrl = new URL(`file://${publicPath.replace(/\\/g, '/')}`).href;
      return publicUrl;
    }
    
    // If file system access works, try relative path for HTTP access
    return '/swisseph.wasm';
  }
  
  // For local Node.js development, try to provide explicit WASM path
  // This avoids fetch issues in Node.js environments (especially Node.js < 18)
  // Priority: node_modules first, then public directories
  const cwd = process.cwd();
  const possiblePaths = [
    path.resolve(cwd, 'node_modules/sweph-wasm/dist/wasm/swisseph.wasm'),
    path.resolve(__dirname, '../../node_modules/sweph-wasm/dist/wasm/swisseph.wasm'),
    path.resolve(__dirname, '../../../node_modules/sweph-wasm/dist/wasm/swisseph.wasm'),
    path.resolve(cwd, 'public/swisseph.wasm'),
    path.resolve(cwd, 'client/public/swisseph.wasm')
  ];
  
  for (const wasmPath of possiblePaths) {
    try {
      if (fs.existsSync(wasmPath)) {
        // Convert to file:// URL for Node.js
        // On Windows, path.resolve might create paths with backslashes
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
    return true; // Assume available in browser
  }
  
  const possiblePaths = [
    path.resolve(process.cwd(), 'node_modules/sweph-wasm/dist/wasm/swisseph.wasm'),
    path.resolve(__dirname, '../../node_modules/sweph-wasm/dist/wasm/swisseph.wasm'),
    path.resolve(process.cwd(), 'node_modules/sweph-wasm/dist/wasm/swisseph.wasm')
  ];
  
  return possiblePaths.some(wasmPath => fs.existsSync(wasmPath));
}

/**
 * Get WASM file buffer for Node.js initialization
 * Reads the WASM file directly into buffer to avoid fetch issues
 * @returns {Buffer|null} WASM file buffer or null if not found
 */
export function getWasmBuffer() {
  const isNode = typeof window === 'undefined' && typeof process !== 'undefined';
  
  if (!isNode) {
    return null; // Browser doesn't need this
  }
  
  // Enhanced path resolution with comprehensive search paths
  const cwd = process.cwd();
  const possiblePaths = [
    path.resolve(cwd, 'node_modules/sweph-wasm/dist/wasm/swisseph.wasm'),
    path.resolve(__dirname, '../../node_modules/sweph-wasm/dist/wasm/swisseph.wasm'),
    path.resolve(__dirname, '../../../node_modules/sweph-wasm/dist/wasm/swisseph.wasm'),
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
 * Returns a URL that's compatible with fetch in Node.js for ephemeris files
 * @param {string} ephemerisDir - Base ephemeris directory path
 * @returns {string|null} URL for ephemeris directory or null
 */
export function getEphemerisPathUrl(ephemerisDir) {
  const isNode = typeof window === 'undefined' && typeof process !== 'undefined';
  
  if (!isNode) {
    return ephemerisDir; // Browser uses default
  }
  
  // For Node.js, we need to avoid setting ephemeris path that causes fetch issues
  // with file paths. We'll return null to use bundled ephemeris data instead.
  return null;
}

/**
 * Check if we should skip ephemeris path setup
 * In Node.js environments (including Render), we can now set ephemeris paths
 * This was previously skipped but is now supported with proper file system access
 * @returns {boolean} True if ephemeris path should be skipped (browser only)
 */
export function shouldSkipEphemerisPath() {
  const isNode = typeof window === 'undefined' && typeof process !== 'undefined';
  // In Node.js (including Render), we can now set ephemeris paths
  // Previously skipped to avoid fetch issues, but file system access works now
  return !isNode; // Only skip in browser environments
}
