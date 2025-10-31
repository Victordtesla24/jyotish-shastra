#!/usr/bin/env node
/**
 * Swiss Ephemeris Diagnostic Script
 * Tests ephemeris configuration and basic calculations
 */

import swisseph from 'swisseph';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('=== Swiss Ephemeris Diagnostic Tool ===\n');

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

// Test 3: Initialize Swiss Ephemeris
console.log('\nTest 3: Initializing Swiss Ephemeris...');
try {
  swisseph.swe_set_ephe_path(ephePath);
  console.log('✅ Swiss Ephemeris path set');
  
  // Verify path was set correctly
  const setPath = swisseph.swe_get_ephe_path?.() || 'Method not available';
  console.log(`Verified path: ${setPath}`);
} catch (error) {
  console.error('❌ Error setting ephemeris path:', error.message);
  process.exit(1);
}

// Test 4: Test basic sun position calculation
console.log('\nTest 4: Testing sun position calculation...');
try {
  // Test with J2000.0 (January 1, 2000, 12:00 TT)
  const jd = 2451545.0;
  console.log(`Julian Day: ${jd}`);
  
  const flags = swisseph.SEFLG_SWIEPH; // Use Swiss Ephemeris files
  const result = swisseph.swe_calc_ut(jd, swisseph.SE_SUN, flags);
  
  console.log('Result object:', JSON.stringify(result, null, 2));
  
  if (result.error) {
    console.error('❌ Swiss Ephemeris returned an error:', result.error);
    process.exit(1);
  }
  
  if (result.longitude === undefined) {
    console.error('❌ Swiss Ephemeris returned no data!');
    console.log('This usually means:');
    console.log('  1. Ephemeris files are corrupted or incomplete');
    console.log('  2. Files don\'t cover the requested date range');
    console.log('  3. Wrong flag used (try SEFLG_SWIEPH vs SEFLG_SWIEPH | SEFLG_SPEED)');
    process.exit(1);
  }
  
  console.log('✅ Sun position calculated successfully');
  console.log(`Sun longitude: ${result.longitude}°`);
  console.log(`Sun latitude: ${result.latitude}°`);
  console.log(`Sun distance: ${result.distance} AU`);
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
  
  const jd = swisseph.swe_julday(year, month, day, hour, 1); // 1 = Gregorian calendar
  console.log(`Julian Day: ${jd}`);
  
  const result = swisseph.swe_calc_ut(jd, swisseph.SE_SUN, swisseph.SEFLG_SWIEPH);
  
  if (result.error) {
    console.error('❌ Error:', result.error);
    process.exit(1);
  }
  
  if (result.longitude === undefined) {
    console.error('❌ No data returned for 1990 date');
    process.exit(1);
  }
  
  console.log('✅ 1990 date calculation successful');
  console.log(`Sun longitude: ${result.longitude}°`);
} catch (error) {
  console.error('❌ Error with 1990 date:', error.message);
  process.exit(1);
}

// Test 6: Test FLG_EQUATORIAL flag (used in sunrise.js)
console.log('\nTest 6: Testing with FLG_EQUATORIAL flag (as used in sunrise.js)...');
try {
  const jd = 2447892.5625; // Exact JD from error message
  console.log(`Julian Day: ${jd} (from error message)`);
  
  const result = swisseph.swe_calc_ut(jd, swisseph.SE_SUN, swisseph.FLG_EQUATORIAL);
  
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
