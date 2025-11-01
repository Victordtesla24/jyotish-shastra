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
    console.log('🔧 wasm-loader: Detected production environment');
    
    // In Render, WASM files should be accessible via file system
    // First try to find the file locally
    const publicPath = path.resolve(process.cwd(), 'public/swisseph.wasm');
    if (fs.existsSync(publicPath)) {
      const publicUrl = new URL(`file://${publicPath.replace(/\\/g, '/')}`).href;
      console.log('🔧 wasm-loader: Found public WASM file at:', publicUrl);
      return publicUrl;
    }
    
    // If file system access works, try relative path for HTTP access
    console.log('🔧 wasm-loader: Using relative path for WASM file');
    return '/swisseph.wasm';
  }
  
  console.log('🔧 wasm-loader: Local Node.js environment detected');
  
  // For local Node.js development, try to provide explicit WASM path
  // This avoids fetch issues in Node.js environments (especially Node.js < 18)
  const possiblePaths = [
    path.resolve(process.cwd(), 'node_modules/sweph-wasm/dist/wasm/swisseph.wasm'),
    path.resolve(__dirname, '../../node_modules/sweph-wasm/dist/wasm/swisseph.wasm'),
    path.resolve(process.cwd(), 'node_modules/sweph-wasm/dist/wasm/swisseph.wasm')
  ];
  
  for (const wasmPath of possiblePaths) {
    if (fs.existsSync(wasmPath)) {
      // Convert to file:// URL for Node.js
      // On Windows, path.resolve might create paths with backslashes
      const normalizedPath = wasmPath.replace(/\\/g, '/');
      const fileUrl = new URL(`file://${normalizedPath}`).href;
      console.log('🔧 wasm-loader: Found WASM file at:', fileUrl);
      return fileUrl;
    }
  }
  
  console.warn('⚠️ wasm-loader: WASM file not found in node_modules, trying client directory');
  
  // Check if we should try client directory (copied during build)
  const clientPath = path.resolve(process.cwd(), 'client/public/swisseph.wasm');
  if (fs.existsSync(clientPath)) {
    const clientUrl = new URL(`file://${clientPath.replace(/\\/g, '/')}`).href;
    console.log('🔧 wasm-loader: Found client WASM file at:', clientUrl);
    return clientUrl;
  }
  
  // Check root public directory
  const publicPath = path.resolve(process.cwd(), 'public/swisseph.wasm');
  if (fs.existsSync(publicPath)) {
    const publicUrl = new URL(`file://${publicPath.replace(/\\/g, '/')}`).href;
    console.log('🔧 wasm-loader: Found public WASM file at:', publicUrl);
    return publicUrl;
  }
  
  console.warn('⚠️ wasm-loader: WASM file not found, falling back to default behavior');
  return null; // Fallback to default behavior if file not found
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
  
  // For local Node.js development, try to read WASM file directly into buffer
  const possiblePaths = [
    path.resolve(process.cwd(), 'node_modules/sweph-wasm/dist/wasm/swisseph.wasm'),
    path.resolve(__dirname, '../../node_modules/sweph-wasm/dist/wasm/swisseph.wasm'),
    path.resolve(process.cwd(), 'node_modules/sweph-wasm/dist/wasm/swisseph.wasm')
  ];
  
  for (const wasmPath of possiblePaths) {
    if (fs.existsSync(wasmPath)) {
      try {
        const wasmBuffer = fs.readFileSync(wasmPath);
        console.log('🔧 wasm-loader: Read WASM file into buffer:', wasmPath);
        return wasmBuffer;
      } catch (error) {
        console.warn('⚠️ wasm-loader: Failed to read WASM file:', error.message);
      }
    }
  }
  
  return null; // Fallback if file not found
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
  console.log('🔧 wasm-loader: Skipping ephemeris path setup in Node.js (using bundled data)');
  return null; // This will cause sweph-wasm to use bundled ephemeris
}

/**
 * Check if we should skip ephemeris path setup
 * In Node.js environments with sweph-wasm, it's better to skip custom ephemeris paths
 * @returns {boolean} True if ephemeris path should be skipped
 */
export function shouldSkipEphemerisPath() {
  const isNode = typeof window === 'undefined' && typeof process !== 'undefined';
  return isNode; // In Node.js, skip custom ephemeris paths to avoid fetch issues
}
