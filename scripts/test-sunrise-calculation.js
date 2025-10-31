#!/usr/bin/env node
/**
 * Test Swiss Ephemeris sunrise calculation
 * This tests the exact function failing in BTR service
 */

import swisseph from 'swisseph';
import path from 'path';

console.log('=== Testing Sunrise Calculation ===\n');

// Initialize Swiss Ephemeris
const ephePath = path.resolve(process.cwd(), 'ephemeris');
swisseph.swe_set_ephe_path(ephePath);
console.log(`Ephemeris path: ${ephePath}\n`);

// Test parameters (from BTR error)
const testDate = new Date('1990-01-01T12:30:00Z');
const latitude = 19.076;
const longitude = 72.8777;
const timezone = 'Asia/Kolkata';

console.log('Test Parameters:');
console.log(`  Date: ${testDate.toISOString()}`);
console.log(`  Latitude: ${latitude}`);
console.log(`  Longitude: ${longitude}`);
console.log(`  Timezone: ${timezone}\n`);

// Calculate Julian Day
const year = testDate.getUTCFullYear();
const month = testDate.getUTCMonth() + 1;
const day = testDate.getUTCDate();
const hour = testDate.getUTCHours() + testDate.getUTCMinutes() / 60;
const jd = swisseph.swe_julday(year, month, day, hour, 1);

console.log(`Julian Day: ${jd}\n`);

// Test 1: swe_calc_ut (basic sun position)
console.log('Test 1: Basic sun position with swe_calc_ut...');
try {
  const result = swisseph.swe_calc_ut(jd, swisseph.SE_SUN, swisseph.SEFLG_SWIEPH);
  
  if (result.error) {
    console.error('❌ Error:', result.error);
  } else if (result.longitude === undefined) {
    console.error('❌ No data returned');
  } else {
    console.log('✅ Success!');
    console.log(`  Sun longitude: ${result.longitude}°\n`);
  }
} catch (error) {
  console.error('❌ Exception:', error.message, '\n');
}

// Test 2: swe_rise_trans (sunrise calculation - THE FAILING FUNCTION)
console.log('Test 2: Sunrise calculation with swe_rise_trans...');
try {
  const geopos = [longitude, latitude, 0]; // [lon, lat, altitude]
  const atpress = 1013.25; // atmospheric pressure in mbar
  const attemp = 15; // atmospheric temperature in Celsius
  
  console.log('  Parameters:');
  console.log(`    geopos: [${geopos.join(', ')}]`);
  console.log(`    atpress: ${atpress} mbar`);
  console.log(`    attemp: ${attemp}°C`);
  console.log(`    rsmi: 1 (rise)\n`);
  
  const sunriseResult = swisseph.swe_rise_trans(
    jd - 1, // Start search from previous day
    swisseph.SE_SUN,
    '',
    swisseph.SEFLG_SWIEPH,
    1, // rsmi = 1 for rise
    geopos,
    atpress,
    attemp
  );
  
  console.log('  Result object:', JSON.stringify(sunriseResult, null, 2));
  
  if (sunriseResult.error) {
    console.error('  ❌ Error:', sunriseResult.error);
    process.exit(1);
  }
  
  if (!sunriseResult.transitTime) {
    console.error('  ❌ No transit time returned');
    console.log('  This is the exact error in BTR service!');
    process.exit(1);
  }
  
  console.log('  ✅ Sunrise calculation successful!');
  console.log(`  Transit time (JD): ${sunriseResult.transitTime}`);
  
  // Convert to readable time
  const { year: y, month: m, day: d, hour: h } = swisseph.swe_revjul(sunriseResult.transitTime, 1);
  const hr = Math.floor(h);
  const min = Math.floor((h - hr) * 60);
  console.log(`  Sunrise UTC: ${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')} ${String(hr).padStart(2, '0')}:${String(min).padStart(2, '0')}\n`);
  
} catch (error) {
  console.error('  ❌ Exception:', error.message);
  console.error('  Stack:', error.stack);
  process.exit(1);
}

// Test 3: Sunset calculation
console.log('Test 3: Sunset calculation with swe_rise_trans...');
try {
  const geopos = [longitude, latitude, 0];
  const atpress = 1013.25;
  const attemp = 15;
  
  const sunsetResult = swisseph.swe_rise_trans(
    jd,
    swisseph.SE_SUN,
    '',
    swisseph.SEFLG_SWIEPH,
    2, // rsmi = 2 for set
    geopos,
    atpress,
    attemp
  );
  
  if (sunsetResult.error) {
    console.error('  ❌ Error:', sunsetResult.error);
  } else if (!sunsetResult.transitTime) {
    console.error('  ❌ No transit time returned');
  } else {
    console.log('  ✅ Sunset calculation successful!');
    console.log(`  Transit time (JD): ${sunsetResult.transitTime}\n`);
  }
  
} catch (error) {
  console.error('  ❌ Exception:', error.message);
}

console.log('=== All sunrise/sunset tests completed! ===');
