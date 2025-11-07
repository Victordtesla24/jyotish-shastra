#!/usr/bin/env node
/**
 * BTR Analysis from Production Logs
 * Analyzes production logs to identify original and corrected birth times
 */

const axios = require('axios');

// Extract data from production logs
const logData = {
  ascendant: {
    longitude: 135.936643, // sidereal
    sign: 'Leo',
    signIndex: 4
  },
  planetaryPositions: {
    sun: { longitude: 43.03, sign: 'Taurus', signId: 1 },
    moon: { longitude: 113.45, sign: 'Cancer', signId: 3 },
    mars: { longitude: 158.39, sign: 'Leo', signId: 4 },
    mercury: { longitude: 49.75, sign: 'Taurus', signId: 1 },
    jupiter: { longitude: 188.18, sign: 'Libra', signId: 6 },
    venus: { longitude: 3.41, sign: 'Aries', signId: 0 },
    saturn: { longitude: 172.25, sign: 'Virgo', signId: 5 },
    uranus: { longitude: 218.84, sign: 'Scorpio', signId: 7 },
    neptune: { longitude: 242.58, sign: 'Sagittarius', signId: 8 },
    pluto: { longitude: 180.87, sign: 'Libra', signId: 6 },
    rahu: { longitude: 81.77, sign: 'Gemini', signId: 2 },
    ketu: { longitude: 261.77, sign: 'Sagittarius', signId: 8 }
  },
  ayanamsa: 23.611296,
  nakshatras: {
    sun: 'Rohini (pada 1)',
    moon: 'Ashlesha (pada 3)',
    mars: 'Uttara Phalguni (pada 4)',
    mercury: 'Rohini (pada 3)',
    jupiter: 'Swati (pada 1)',
    venus: 'Ashwini (pada 2)',
    saturn: 'Hasta (pada 4)',
    uranus: 'Anuradha (pada 2)',
    neptune: 'Mula (pada 1)',
    pluto: 'Chitra (pada 3)',
    rahu: 'Punarvasu (pada 1)',
    ketu: 'Purva Ashadha (pada 3)'
  },
  navamsa: {
    ascendant: { longitude: 133.33333333333334, sign: 'Leo' }
  }
};

console.log('🔍 BTR Analysis from Production Logs');
console.log('=' .repeat(60));
console.log('\n📊 Extracted Chart Data:');
console.log(`   Ascendant: ${logData.ascendant.longitude.toFixed(2)}° (${logData.ascendant.sign})`);
console.log(`   Sun: ${logData.planetaryPositions.sun.longitude.toFixed(2)}° (${logData.planetaryPositions.sun.sign})`);
console.log(`   Moon: ${logData.planetaryPositions.moon.longitude.toFixed(2)}° (${logData.planetaryPositions.moon.sign})`);
console.log(`   Ayanamsa: ${logData.ayanamsa.toFixed(2)}°`);
console.log('\n' + '='.repeat(60));

// We need to estimate birth data from the chart
// Since we don't have the original birth time, we'll need to work backwards
// For now, let's create a test case with estimated birth data

async function analyzeBTR() {
  console.log('\n🔬 Step-by-Step BTR Analysis\n');
  
  // Step 1: Estimate original birth time from ascendant
  console.log('Step 1: Estimating Original Birth Time from Ascendant');
  console.log('-' .repeat(60));
  console.log(`   Ascendant: ${logData.ascendant.longitude.toFixed(2)}° (${logData.ascendant.sign})`);
  console.log('   ⚠️  Note: Original birth time not in logs - need to estimate or extract from API');
  
  // Step 2: Calculate Praanapada
  console.log('\nStep 2: Praanapada Method Analysis');
  console.log('-' .repeat(60));
  console.log(`   Sun Position: ${logData.planetaryPositions.sun.longitude.toFixed(2)}°`);
  console.log('   ⚠️  Need sunrise time and original birth time for Praanapada calculation');
  
  // Step 3: Moon Position Analysis
  console.log('\nStep 3: Moon Position Method Analysis');
  console.log('-' .repeat(60));
  console.log(`   Moon Position: ${logData.planetaryPositions.moon.longitude.toFixed(2)}° (${logData.planetaryPositions.moon.sign})`);
  console.log(`   Moon Nakshatra: ${logData.nakshatras.moon}`);
  console.log(`   Ascendant: ${logData.ascendant.longitude.toFixed(2)}° (${logData.ascendant.sign})`);
  
  // Check Moon-Ascendant relationship
  const moonAscDiff = Math.abs(logData.planetaryPositions.moon.longitude - logData.ascendant.longitude);
  const normalizedDiff = moonAscDiff > 180 ? 360 - moonAscDiff : moonAscDiff;
  console.log(`   Moon-Ascendant Distance: ${normalizedDiff.toFixed(2)}°`);
  
  if (normalizedDiff <= 10) {
    console.log('   ✅ Moon in conjunction with Ascendant (strong indicator)');
  } else if (Math.abs(normalizedDiff - 120) <= 10) {
    console.log('   ✅ Moon in trine with Ascendant (favorable)');
  } else if (Math.abs(normalizedDiff - 90) <= 10) {
    console.log('   ⚠️  Moon in square with Ascendant (challenging)');
  } else {
    console.log('   ℹ️  Moon-Ascendant relationship: Other aspect');
  }
  
  // Step 4: Gulika Analysis
  console.log('\nStep 4: Gulika (Mandi) Method Analysis');
  console.log('-' .repeat(60));
  console.log('   ⚠️  Need day of week and Saturn position for Gulika calculation');
  console.log(`   Saturn Position: ${logData.planetaryPositions.saturn.longitude.toFixed(2)}°`);
  
  // Step 5: Nisheka Analysis
  console.log('\nStep 5: Nisheka-Lagna Method Analysis');
  console.log('-' .repeat(60));
  console.log('   ⚠️  Need original birth time and date for Nisheka calculation');
  
  console.log('\n' + '='.repeat(60));
  console.log('⚠️  INCOMPLETE DATA: Original birth time not found in logs');
  console.log('   Need to extract from API request or estimate from ascendant');
  console.log('='.repeat(60));
  
  return {
    chartData: logData,
    analysis: 'Incomplete - need original birth time'
  };
}

// Try to call BTR API to get actual analysis
async function runBTRAnalysis() {
  const API_BASE = process.env.API_BASE_URL || 'https://jjyotish-shastra-backend.onrender.com';
  
  console.log('\n🔍 Attempting to extract birth data from chart...\n');
  
  // We need to work backwards from the ascendant
  // For Leo ascendant at 135.94°, we can estimate the approximate time
  // But we need the date and location to calculate accurately
  
  console.log('📋 Analysis Summary:');
  console.log('   - Ascendant: Leo 135.94° (sidereal)');
  console.log('   - Sun: Taurus 43.03°');
  console.log('   - Moon: Cancer 113.45°');
  console.log('   - Moon Nakshatra: Ashlesha (pada 3)');
  console.log('\n   ⚠️  To complete BTR analysis, we need:');
  console.log('      1. Original birth date');
  console.log('      2. Original birth time (estimated)');
  console.log('      3. Birth location (latitude, longitude, timezone)');
  
  return analyzeBTR();
}

runBTRAnalysis().catch(error => {
  console.error('❌ Analysis error:', error.message);
  process.exit(1);
});
