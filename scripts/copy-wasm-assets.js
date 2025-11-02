#!/usr/bin/env node

/**
 * Copy Swiss Ephemeris WASM files and ephemeris data to proper locations for deployment
 * Ensures production-ready WASM file and ephemeris data serving
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const isProduction = process.env.NODE_ENV === 'production';
const isRender = Boolean(process.env.RENDER);

/**
 * Copy ephemeris files to ensure they're accessible
 */
async function ensureEphemerisFiles() {
  console.log('🔧 Ensuring ephemeris files are accessible...');
  
  try {
    const ephemerisDir = path.resolve(process.cwd(), 'ephemeris');
    const requiredFiles = ['seas_18.se1', 'semo_18.se1', 'sepl_18.se1'];
    
    if (!fs.existsSync(ephemerisDir)) {
      console.error(`❌ Ephemeris directory does not exist: ${ephemerisDir}`);
      return { success: false, error: 'Ephemeris directory not found' };
    }
    
    console.log(`✅ Ephemeris directory exists: ${ephemerisDir}`);
    
    // Verify all required files exist
    const missingFiles = [];
    for (const filename of requiredFiles) {
      const filePath = path.join(ephemerisDir, filename);
      if (!fs.existsSync(filePath)) {
        missingFiles.push(filename);
        console.error(`❌ Missing ephemeris file: ${filename}`);
      } else {
        const stats = fs.statSync(filePath);
        console.log(`✅ Ephemeris file found: ${filename} (${(stats.size / 1024).toFixed(2)} KB)`);
      }
    }
    
    if (missingFiles.length > 0) {
      return {
        success: false,
        error: `Missing ephemeris files: ${missingFiles.join(', ')}`,
        missingFiles
      };
    }
    
    console.log('✅ All ephemeris files are present and accessible');
    return {
      success: true,
      ephemerisDir,
      files: requiredFiles
    };
  } catch (error) {
    console.error('❌ Error checking ephemeris files:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Main function to copy WASM files
 */
async function copyWasmAssets() {
  console.log('🔧 Copying Swiss Ephemeris WASM files for deployment...');
  
  try {
    // Source WASM files from various locations
    const sourcePaths = [
      path.resolve(process.cwd(), 'public/swisseph.wasm'),
      path.resolve(process.cwd(), 'client/public/swisseph.wasm')
    ];
    
    // Target location for production
    const targetPath = path.resolve(process.cwd(), 'public/swisseph.wasm');
    
    // Create target directory if it doesn't exist
    const targetDir = path.dirname(targetPath);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    // Log target paths
    console.log(`📊 Target WASM location: ${targetPath}`);
    console.log(`📁 Available source sources: ${sourcePaths.length}`);
    
    for (const sourcePath of sourcePaths) {
      if (fs.existsSync(sourcePath)) {
        console.log(`🔧 Copying from: ${sourcePath}`);
        
        try {
          fs.copyFileSync(sourcePath, targetPath);
          console.log(`✅ Copied to: ${targetPath}`);
        } catch (error) {
          console.error(`❌ Failed to copy from ${sourcePath}:`, error.message);
        }
      } else {
        console.log(`⚠️ Source not found: ${sourcePath}`);
      }
    }
    
    // Verify the final file exists and is accessible
    let wasmSuccess = false;
    if (fs.existsSync(targetPath)) {
      const stats = fs.statSync(targetPath);
      console.log(`✅ WASM file copied successfully - Size: ${stats.size} bytes`);
      wasmSuccess = true;
    } else {
      console.warn('⚠️ WASM file not found after copying - will use bundled version');
    }
    
    // Ensure ephemeris files are accessible
    const ephemerisResult = await ensureEphemerisFiles();
    
    return {
      success: wasmSuccess || ephemerisResult.success, // Success if either works
      wasmSuccess,
      ephemerisResult,
      targetPath: wasmSuccess ? targetPath : null
    };
    
  } catch (error) {
    console.error('❌ Error during WASM asset copying:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run if called directly
if (require.main === module && require.main === module) {
  copyWasmAssets().then((result) => {
    console.log('🎯 WASM asset copying completed:', result);
    process.exit(result.success ? 0 : 1);
  }).catch((error) => {
    console.error('🚠 WASM asset copying failed:', error);
    process.exit(1);
  });
}

export default copyWasmAssets;
