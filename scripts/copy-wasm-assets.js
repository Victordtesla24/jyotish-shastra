/**
 * Copy WASM Assets Script
 * Copies sweph-wasm WASM files to public directory for static serving
 * This enables WASM files to be accessible via URL in Vercel serverless environment
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const wasmSource = path.resolve(process.cwd(), 'node_modules/sweph-wasm/dist/wasm/swisseph.wasm');
const wasmDestRoot = path.resolve(process.cwd(), 'public/swisseph.wasm');
const wasmDestClient = path.resolve(process.cwd(), 'client/public/swisseph.wasm');

// Copy to root public directory (for serverless functions)
const publicDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
  console.log('✅ Created public directory');
}

// Copy to client public directory (for static build)
const clientPublicDir = path.resolve(process.cwd(), 'client/public');
if (!fs.existsSync(clientPublicDir)) {
  fs.mkdirSync(clientPublicDir, { recursive: true });
  console.log('✅ Created client/public directory');
}

// Copy WASM file to both locations
if (fs.existsSync(wasmSource)) {
  try {
    // Copy to root public directory
    fs.copyFileSync(wasmSource, wasmDestRoot);
    console.log('✅ WASM file copied to public directory:', wasmDestRoot);
    
    // Copy to client public directory (for Vercel static build)
    fs.copyFileSync(wasmSource, wasmDestClient);
    console.log('✅ WASM file copied to client/public directory:', wasmDestClient);
    
    // Verify files were copied
    if (fs.existsSync(wasmDestRoot)) {
      const statsRoot = fs.statSync(wasmDestRoot);
      console.log(`✅ Verified root: WASM file size: ${statsRoot.size} bytes`);
    }
    if (fs.existsSync(wasmDestClient)) {
      const statsClient = fs.statSync(wasmDestClient);
      console.log(`✅ Verified client: WASM file size: ${statsClient.size} bytes`);
    }
  } catch (error) {
    console.error('❌ Error copying WASM file:', error.message);
    process.exit(1);
  }
} else {
  console.warn('⚠️ WASM source file not found:', wasmSource);
  console.warn('⚠️ This may cause issues in production. Ensure sweph-wasm is installed.');
}

