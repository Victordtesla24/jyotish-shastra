/**
 * Swiss Ephemeris Sidereal Mode Debug Script
 * Comprehensive debugging of Swiss Ephemeris sidereal calculations
 * Tests ayanamsa and planetary position calculations directly
 */

import { setupSwissephWithEphemeris, getSwisseph } from '../src/utils/swisseph-wrapper.js';

// Swiss Ephemeris constants
const SE_SUN = 0;
const SE_SIDM_LAHIRI = 1;
const SEFLG_SIDEREAL = 256;
const SEFLG_SWIEPH = 2;

/**
 * Test Swiss Ephemeris direct calculations for debugging
 * Focus on Vikram's birth data: 24-10-1985, 14:30, Pune
 */
async function debugSwissephSidereal() {
  console.log('🔍 DEBUGGING SWISS EPHEMERIS SIDEREAL CALCULATIONS');
  console.log('=' * 60);
  
  try {
    // Initialize Swiss Ephemeris
    console.log('1. Initializing Swiss Ephemeris...');
    const { swisseph } = await setupSwissephWithEphemeris();
    
    // Test Julian Day calculation
    console.log('\n2. Testing Julian Day calculation...');
    const year = 1985, month = 10, day = 24, hour = 14.5; // 14:30 = 14.5 hours
    const jd = await swisseph.swe_julday(year, month, day, hour, 1);
    console.log(`   Julian Day: ${jd} (Expected: ~2446362.875)`);
    
    // Test ayanamsa calculation BEFORE setting sidereal mode
    console.log('\n3. Testing ayanamsa calculation (before sidereal mode)...');
    const ayanamsa1 = await swisseph.swe_get_ayanamsa(jd);
    console.log(`   Ayanamsa (before): ${ayanamsa1.ayanamsa}° (Expected for 1985: ~23.35°)`);
    console.log(`   Error: +${(ayanamsa1.ayanamsa - 23.35).toFixed(3)}°`);
    
    // CRITICAL: Set sidereal mode explicitly
    console.log('\n4. Setting Lahiri sidereal mode...');
    await swisseph.swe_set_sid_mode(SE_SIDM_LAHIRI);
    console.log('   Sidereal mode set to SE_SIDM_LAHIRI (1)');
    
    // Test ayanamsa calculation AFTER setting sidereal mode
    console.log('\n5. Testing ayanamsa calculation (after sidereal mode)...');
    const ayanamsa2 = await swisseph.swe_get_ayanamsa(jd);
    console.log(`   Ayanamsa (after): ${ayanamsa2.ayanamsa}° (Expected for 1985: ~23.35°)`);
    console.log(`   Error: +${(ayanamsa2.ayanamsa - 23.35).toFixed(3)}°`);
    console.log(`   Change: ${(ayanamsa2.ayanamsa - ayanamsa1.ayanamsa).toFixed(6)}°`);
    
    // Test Sun calculation with different flags
    console.log('\n6. Testing Sun position with different calculation flags...');
    
    // Test 1: Default flags (tropical)
    const sunTropical = await swisseph.swe_calc_ut(jd, SE_SUN, SEFLG_SWIEPH);
    console.log(`   Sun (tropical): ${sunTropical[1].toFixed(2)}° = ${getSignFromDegree(sunTropical[1])} ${(sunTropical[1] % 30).toFixed(2)}°`);
    
    // Test 2: Sidereal flags
    const sunSidereal = await swisseph.swe_calc_ut(jd, SE_SUN, SEFLG_SIDEREAL | SEFLG_SWIEPH);
    console.log(`   Sun (sidereal): ${sunSidereal[1].toFixed(2)}° = ${getSignFromDegree(sunSidereal[1])} ${(sunSidereal[1] % 30).toFixed(2)}°`);
    console.log(`   Expected: Libra ~7° (187°)`);
    console.log(`   Sidereal error: ${(sunSidereal[1] - 187).toFixed(2)}°`);
    
    // Manual sidereal conversion
    console.log('\n7. Manual sidereal conversion...');
    const manualSidereal = sunTropical[1] - ayanamsa2.ayanamsa;
    const normalizedManual = ((manualSidereal % 360) + 360) % 360;
    console.log(`   Manual calculation: ${sunTropical[1].toFixed(2)}° - ${ayanamsa2.ayanamsa.toFixed(3)}° = ${normalizedManual.toFixed(2)}°`);
    console.log(`   Manual result: ${getSignFromDegree(normalizedManual)} ${(normalizedManual % 30).toFixed(2)}°`);
    
    // Test with different ayanamsa values
    console.log('\n8. Testing with correct ayanamsa (23.35°)...');
    const correctSidereal = sunTropical[1] - 23.35;
    const normalizedCorrect = ((correctSidereal % 360) + 360) % 360;
    console.log(`   With correct ayanamsa: ${sunTropical[1].toFixed(2)}° - 23.35° = ${normalizedCorrect.toFixed(2)}°`);
    console.log(`   Corrected result: ${getSignFromDegree(normalizedCorrect)} ${(normalizedCorrect % 30).toFixed(2)}°`);
    
    // Test direct access to native sweph (if available)
    console.log('\n9. Testing direct native sweph access...');
    try {
      const swephModule = await import('sweph');
      const swephNative = swephModule.default || swephModule;
      
      // Test direct calculation
      const directResult = swephNative.calc_ut(jd, SE_SUN, SEFLG_SIDEREAL | SEFLG_SWIEPH);
      console.log(`   Direct native result: ${directResult.data[0].toFixed(2)}° = ${getSignFromDegree(directResult.data[0])} ${(directResult.data[0] % 30).toFixed(2)}°`);
      console.log(`   Direct native error: ${directResult.error || 'none'}`);
      console.log(`   Direct native flag: ${directResult.flag}`);
      
      // Test direct ayanamsa
      const directAyanamsa = swephNative.get_ayanamsa(jd);
      console.log(`   Direct native ayanamsa: ${directAyanamsa.toFixed(6)}°`);
      
    } catch (error) {
      console.log(`   Direct native access failed: ${error.message}`);
    }
    
    console.log('\n' + '=' * 60);
    console.log('🎯 DEBUGGING COMPLETE');
    
    // Summary
    console.log('\n📊 SUMMARY:');
    console.log(`   Ayanamsa calculated: ${ayanamsa2.ayanamsa.toFixed(6)}°`);
    console.log(`   Ayanamsa expected: 23.350000°`);
    console.log(`   Ayanamsa error: +${(ayanamsa2.ayanamsa - 23.35).toFixed(6)}°`);
    console.log(`   Sun sidereal: ${sunSidereal[1].toFixed(2)}° (${getSignFromDegree(sunSidereal[1])} ${(sunSidereal[1] % 30).toFixed(2)}°)`);
    console.log(`   Sun expected: 187.00° (Libra 7.00°)`);
    console.log(`   Sun error: ${(sunSidereal[1] - 187).toFixed(2)}°`);
    
    if (Math.abs(ayanamsa2.ayanamsa - 23.35) > 0.1) {
      console.log('\n❌ AYANAMSA CALCULATION IS INCORRECT');
      console.log('   This indicates Swiss Ephemeris is not using proper Lahiri ayanamsa');
    } else {
      console.log('\n✅ AYANAMSA CALCULATION IS CORRECT');
    }
    
    if (Math.abs(sunSidereal[1] - 187) > 1) {
      console.log('❌ SUN SIDEREAL POSITION IS INCORRECT');
      console.log('   This indicates sidereal mode is not working properly');
    } else {
      console.log('✅ SUN SIDEREAL POSITION IS CORRECT');
    }
    
  } catch (error) {
    console.error('❌ DEBUGGING FAILED:', error);
    console.error('Stack trace:', error.stack);
  }
}

/**
 * Helper function to convert degrees to zodiac sign
 */
function getSignFromDegree(degree) {
  const signs = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];
  const normalizedDegree = ((degree % 360) + 360) % 360;
  const signIndex = Math.floor(normalizedDegree / 30);
  return signs[signIndex];
}

// Run the debugging script
debugSwissephSidereal().catch(error => {
  console.error('Script execution failed:', error);
  process.exit(1);
});
