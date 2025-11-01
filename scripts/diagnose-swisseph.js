#!/usr/bin/env node
/**
 * Swiss Ephemeris (WebAssembly) Diagnostic Script
 * Tests ephemeris configuration and basic calculations
 */

import { initSwisseph } from '../src/utils/swisseph-wrapper.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('=== Swiss Ephemeris (WASM) Diagnostic Tool ===\n');

// Initialize sweph-wasm using improved wrapper
let swisseph = null;
try {
  const result = await initSwisseph();
  swisseph = result.swisseph;
  console.log('✅ Swiss Ephemeris (WASM) initialized via wrapper\n');
} catch (error) {
  console.error('❌ Failed to initialize Swiss Ephemeris (WASM):', error.message);
  process.exit(1);
}

// Test 1: Check ephemeris directory
console.log('Test 1: Checking ephemeris directory...');
const ephePath = path.resolve(process.cwd(), 'ephemeris');
console.log(`Ephemeris path: ${ephePath}`);

if (!fs.existsSync(ephePath)) {
  console.error('❌ Ephemeris directory not found!');
  process.exit(1);
}
console.log('✅ Ephemeris directory exists');

// Test 2: List ephemeris files
console.log('\nTest 2: Listing ephemeris files...');
try {
  const files = fs.readdirSync(ephePath);
  console.log(`Found ${files.length} files:`);
  files.forEach(file => {
    const stats = fs.statSync(path.join(ephePath, file));
    console.log(`  - ${file} (${stats.size} bytes)`);
  });
  
  // Check for required files
  const requiredFiles = ['sepl_18.se1', 'semo_18.se1', 'seas_18.se1'];
  const missingFiles = requiredFiles.filter(f => !files.includes(f));
  
  if (missingFiles.length > 0) {
    console.log('\n⚠️  Some recommended files are missing:');
    missingFiles.forEach(f => console.log(`  - ${f}`));
  } else {
    console.log('✅ All required files present');
  }
} catch (error) {
  console.error('❌ Error reading ephemeris directory:', error.message);
  process.exit(1);
}

// Test 3: Set ephemeris path (skipping for WASM compatibility)
console.log('\nTest 3: Setting ephemeris path (WASM compatibility mode)...');
try {
  // Note: With sweph-wasm, ephemeris files are typically bundled
  // so setting path isn't always necessary/available
  console.log('🔧 WASM version uses bundled ephemeris, skipping external path setup');
  console.log('⚠️ Note: External ephemeris files may not be accessible due to fetch limitations');
  
  // Try setting path anyway, but ignore if it fails
  try {
    await swisseph.swe_set_ephe_path(ephePath);
    console.log('✅ External ephemeris path set successfully');
  } catch (pathError) {
    console.log('⚠️ External ephemeris path setup failed (expected with WASM):');
    console.log(`   ${pathError.message}`);
    console.log('⚠️ WASM will use bundled ephemeris data instead');
  }
} catch (error) {
  console.error('❌ Unexpected error in ephemeris path test:', error.message);
}

// Test 4: Test basic sun position calculation
console.log('\nTest 4: Testing sun position calculation...');
try {
  // Test with J2000.0 (January 1, 2000, 12:00 TT)
  const jd = 2451545.0;
  console.log(`Julian Day: ${jd}`);
  
  const flags = swisseph.SEFLG_SWIEPH; // Use Swiss Ephemeris files
  const result = await swisseph.swe_calc_ut(jd, swisseph.SE_SUN, flags);
  
  console.log('Result type:', Array.isArray(result) ? 'array' : typeof result);
  console.log('Result data:', result);
  
  // sweph-wasm may return array or object, handle both
  let longitude, latitude, distance;
  
  if (Array.isArray(result)) {
    // Array format: [longitude, latitude, distance, ...]
    [longitude, latitude, distance] = result;
  } else if (typeof result === 'object' && result !== null) {
    // Object format with properties
    longitude = result.longitude;
    latitude = result.latitude;
    distance = result.distance;
  }
  
  if (longitude !== undefined && !isNaN(longitude)) {
    console.log('✅ Sun position calculated successfully');
    console.log(`Sun longitude: ${longitude}°`);
    console.log(`Sun latitude: ${latitude || 0}°`);
    console.log(`Sun distance: ${distance || 0} AU`);
  } else {
    console.error('❌ Swiss Ephemeris returned invalid data!');
    console.log('This usually means:');
    console.log('  1. Ephemeris data format issue');
    console.log('  2. API compatibility issue');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Error calculating sun position:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}

// Test 5: Test with birth date from error (1990-01-01)
console.log('\nTest 5: Testing with actual birth date (1990-01-01 12:30 UTC)...');
try {
  const date = new Date('1990-01-01T12:30:00Z');
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const hour = date.getUTCHours() + date.getUTCMinutes() / 60;
  
  const jd = await swisseph.swe_julday(year, month, day, hour, 1); // 1 = Gregorian calendar
  console.log(`Julian Day: ${jd}`);
  
  const result = await swisseph.swe_calc_ut(jd, swisseph.SE_SUN, swisseph.SEFLG_SWIEPH);
  
  // Handle array format again
 let longitude;
  if (Array.isArray(result)) {
    longitude = result[0];
  } else if (typeof result === 'object' && result !== null) {
    longitude = result.longitude;
  }
  
  if (longitude === undefined || isNaN(longitude)) {
    console.error('❌ No valid data returned for 1990 date');
    console.log('Result:', result);
    process.exit(1);
  }
  
  console.log('✅ 1990 date calculation successful');
  console.log(`Sun longitude: ${longitude}°`);
} catch (error) {
  console.error('❌ Error with 1990 date:', error.message);
  process.exit(1);
}

// Test 6: Test FLG_EQUATORIAL flag (used in sunrise.js)
console.log('\nTest 6: Testing with FLG_EQUATORIAL flag (as used in sunrise.js)...');
try {
  const jd = 2447892.5625; // Exact JD from error message
  console.log(`Julian Day: ${jd} (from error message)`);
  
  const result = await swisseph.swe_calc_ut(jd, swisseph.SE_SUN, swisseph.FLG_EQUATORIAL);
  
  if (result.error) {
    console.error('❌ Error with FLG_EQUATORIAL:', result.error);
    console.log('\n⚠️  This is the exact error from sunrise.js!');
    console.log('Solution: The flag should be SEFLG_SWIEPH, not FLG_EQUATORIAL');
    process.exit(1);
  }
  
  if (!result.data || result.data.length === 0) {
    console.error('❌ No data with FLG_EQUATORIAL flag');
    console.log('\n⚠️  This is the exact error from sunrise.js!');
    console.log('Solution: The flag should be SEFLG_SWIEPH, not FLG_EQUATORIAL');
    process.exit(1);
  }
  
  console.log('✅ FLG_EQUATORIAL calculation successful');
  console.log(`Sun right ascension: ${result.data[0]}°`);
} catch (error) {
  console.error('❌ Error with FLG_EQUATORIAL:', error.message);
  console.log('\n⚠️  This might be the issue in sunrise.js');
  process.exit(1);
}

console.log('\n=== All tests passed! ===');
console.log('Swiss Ephemeris is properly configured and working.');
