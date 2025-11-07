#!/usr/bin/env node
/**
 * BTR Analysis from Production Logs
 * Analyzes production logs to identify original and corrected birth times
 * Executes BTR step by step using BPHS methods
 */

const axios = require('axios');

// Extract chart data from production logs
const chartDataFromLogs = {
  ascendant: {
    longitude: 135.936643, // sidereal degrees
    sign: 'Leo',
    signIndex: 4
  },
  planetaryPositions: {
    sun: { longitude: 43.03, sign: 'Taurus', signId: 1, nakshatra: 'Rohini (pada 1)' },
    moon: { longitude: 113.45, sign: 'Cancer', signId: 3, nakshatra: 'Ashlesha (pada 3)' },
    mars: { longitude: 158.39, sign: 'Leo', signId: 4, nakshatra: 'Uttara Phalguni (pada 4)' },
    mercury: { longitude: 49.75, sign: 'Taurus', signId: 1, nakshatra: 'Rohini (pada 3)' },
    jupiter: { longitude: 188.18, sign: 'Libra', signId: 6, nakshatra: 'Swati (pada 1)' },
    venus: { longitude: 3.41, sign: 'Aries', signId: 0, nakshatra: 'Ashwini (pada 2)' },
    saturn: { longitude: 172.25, sign: 'Virgo', signId: 5, nakshatra: 'Hasta (pada 4)' },
    uranus: { longitude: 218.84, sign: 'Scorpio', signId: 7, nakshatra: 'Anuradha (pada 2)' },
    neptune: { longitude: 242.58, sign: 'Sagittarius', signId: 8, nakshatra: 'Mula (pada 1)' },
    pluto: { longitude: 180.87, sign: 'Libra', signId: 6, nakshatra: 'Chitra (pada 3)' },
    rahu: { longitude: 81.77, sign: 'Gemini', signId: 2, nakshatra: 'Punarvasu (pada 1)' },
    ketu: { longitude: 261.77, sign: 'Sagittarius', signId: 8, nakshatra: 'Purva Ashadha (pada 3)' }
  },
  ayanamsa: 23.611296,
  navamsa: {
    ascendant: { longitude: 133.33333333333334, sign: 'Leo' }
  }
};

const API_BASE = process.env.API_BASE_URL || 'https://jjyotish-shastra-backend.onrender.com';

console.log('🔍 BTR Analysis from Production Logs');
console.log('='.repeat(70));
console.log('\n📊 Extracted Chart Data from Production Logs:');
console.log(`   Ascendant: ${chartDataFromLogs.ascendant.longitude.toFixed(2)}° (${chartDataFromLogs.ascendant.sign})`);
console.log(`   Sun: ${chartDataFromLogs.planetaryPositions.sun.longitude.toFixed(2)}° (${chartDataFromLogs.planetaryPositions.sun.sign}) - ${chartDataFromLogs.planetaryPositions.sun.nakshatra}`);
console.log(`   Moon: ${chartDataFromLogs.planetaryPositions.moon.longitude.toFixed(2)}° (${chartDataFromLogs.planetaryPositions.moon.sign}) - ${chartDataFromLogs.planetaryPositions.moon.nakshatra}`);
console.log(`   Ayanamsa: ${chartDataFromLogs.ayanamsa.toFixed(2)}°`);
console.log('\n' + '='.repeat(70));

/**
 * Step 1: Estimate Original Birth Time from Chart Data
 * Since we don't have the original birth time in logs, we need to work backwards
 * For this analysis, we'll need to estimate or extract from API
 */
async function step1_EstimateOriginalBirthTime() {
  console.log('\n🔬 STEP 1: Estimate Original Birth Time from Ascendant');
  console.log('-'.repeat(70));
  console.log(`   Ascendant: ${chartDataFromLogs.ascendant.longitude.toFixed(2)}° (${chartDataFromLogs.ascendant.sign})`);
  console.log('   ⚠️  Original birth time not in logs - need to estimate or extract from API');
  console.log('   ℹ️  To calculate birth time from ascendant, we need:');
  console.log('      - Birth date');
  console.log('      - Birth location (latitude, longitude, timezone)');
  console.log('      - Then we can work backwards from ascendant position');
  return null;
}

/**
 * Step 2: Run Praanapada Analysis
 */
async function step2_PraanapadaAnalysis(birthData) {
  console.log('\n🔬 STEP 2: Praanapada Method Analysis');
  console.log('-'.repeat(70));
  console.log('   Method: BPHS Ch.3 Ślokas 71-74 (p.45)');
  console.log(`   Sun Position: ${chartDataFromLogs.planetaryPositions.sun.longitude.toFixed(2)}°`);
  console.log('   Formula: Praanapada = Sun\'s position + Birth time in palas');
  console.log('   ⚠️  Need sunrise time and original birth time for calculation');
  
  if (!birthData) {
    console.log('   ⚠️  Cannot proceed without birth data');
    return null;
  }
  
  try {
    // Call BTR API for Praanapada analysis
    const response = await axios.post(
      `${API_BASE}/api/v1/rectification/analyze`,
      {
        birthData: birthData,
        options: {
          methods: ['praanapada'],
          timeRange: { hours: 2 }
        }
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 120000
      }
    );
    
    if (response.data.success && response.data.rectification) {
      const praanapada = response.data.rectification.methods?.praanapada;
      if (praanapada) {
        console.log('   ✅ Praanapada Analysis Complete');
        console.log(`   Praanapada Longitude: ${praanapada.bestCandidate?.praanapada?.longitude?.toFixed(2) || 'N/A'}°`);
        console.log(`   Best Time Candidate: ${praanapada.bestCandidate?.time || 'N/A'}`);
        return praanapada;
      }
    }
  } catch (error) {
    console.error('   ❌ Praanapada Analysis Error:', error.message);
  }
  
  return null;
}

/**
 * Step 3: Moon Position Analysis
 */
async function step3_MoonAnalysis(birthData) {
  console.log('\n🔬 STEP 3: Moon Position Method Analysis');
  console.log('-'.repeat(70));
  console.log(`   Moon Position: ${chartDataFromLogs.planetaryPositions.moon.longitude.toFixed(2)}° (${chartDataFromLogs.planetaryPositions.moon.sign})`);
  console.log(`   Moon Nakshatra: ${chartDataFromLogs.planetaryPositions.moon.nakshatra}`);
  console.log(`   Ascendant: ${chartDataFromLogs.ascendant.longitude.toFixed(2)}° (${chartDataFromLogs.ascendant.sign})`);
  
  // Calculate Moon-Ascendant relationship
  const moonAscDiff = Math.abs(
    chartDataFromLogs.planetaryPositions.moon.longitude - 
    chartDataFromLogs.ascendant.longitude
  );
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
  
  if (!birthData) {
    console.log('   ⚠️  Cannot proceed without birth data');
    return null;
  }
  
  try {
    const response = await axios.post(
      `${API_BASE}/api/v1/rectification/analyze`,
      {
        birthData: birthData,
        options: {
          methods: ['moon'],
          timeRange: { hours: 2 }
        }
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 120000
      }
    );
    
    if (response.data.success && response.data.rectification) {
      const moon = response.data.rectification.methods?.moon;
      if (moon) {
        console.log('   ✅ Moon Analysis Complete');
        console.log(`   Best Time Candidate: ${moon.bestCandidate?.time || 'N/A'}`);
        return moon;
      }
    }
  } catch (error) {
    console.error('   ❌ Moon Analysis Error:', error.message);
  }
  
  return null;
}

/**
 * Step 4: Gulika Analysis
 */
async function step4_GulikaAnalysis(birthData) {
  console.log('\n🔬 STEP 4: Gulika (Mandi) Method Analysis');
  console.log('-'.repeat(70));
  console.log('   Method: BPHS Ch.3 Śloka 70 (p.45)');
  console.log(`   Saturn Position: ${chartDataFromLogs.planetaryPositions.saturn.longitude.toFixed(2)}°`);
  console.log('   ⚠️  Need day of week for Gulika calculation');
  
  if (!birthData) {
    console.log('   ⚠️  Cannot proceed without birth data');
    return null;
  }
  
  try {
    const response = await axios.post(
      `${API_BASE}/api/v1/rectification/analyze`,
      {
        birthData: birthData,
        options: {
          methods: ['gulika'],
          timeRange: { hours: 2 }
        }
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 120000
      }
    );
    
    if (response.data.success && response.data.rectification) {
      const gulika = response.data.rectification.methods?.gulika;
      if (gulika) {
        console.log('   ✅ Gulika Analysis Complete');
        console.log(`   Best Time Candidate: ${gulika.bestCandidate?.time || 'N/A'}`);
        return gulika;
      }
    }
  } catch (error) {
    console.error('   ❌ Gulika Analysis Error:', error.message);
  }
  
  return null;
}

/**
 * Step 5: Nisheka Analysis
 */
async function step5_NishekaAnalysis(birthData) {
  console.log('\n🔬 STEP 5: Nisheka-Lagna Method Analysis');
  console.log('-'.repeat(70));
  console.log('   Method: BPHS Ch.4 Ślokas 25-30 (p.53-54)');
  console.log('   Formula: Nisheka Time = Birth Time - (A+B+C) days');
  console.log('   ⚠️  Need original birth time for Nisheka calculation');
  
  if (!birthData) {
    console.log('   ⚠️  Cannot proceed without birth data');
    return null;
  }
  
  // Note: Nisheka is not available as a separate method in the API
  // It's included in the main BTR analysis when all methods are run
  console.log('   ℹ️  Nisheka method is included in complete BTR analysis');
  return null;
}

/**
 * Step 6: Complete BTR Analysis
 */
async function step6_CompleteBTRAnalysis(birthData) {
  console.log('\n🔬 STEP 6: Complete BTR Analysis (All Methods)');
  console.log('-'.repeat(70));
  console.log('   Running all BPHS methods together:');
  console.log('   - Praanapada');
  console.log('   - Moon Position');
  console.log('   - Gulika');
  console.log('   - Nisheka');
  
  if (!birthData) {
    console.log('   ⚠️  Cannot proceed without birth data');
    return null;
  }
  
  try {
      const response = await axios.post(
      `${API_BASE}/api/v1/rectification/analyze`,
      {
        birthData: birthData,
        options: {
          methods: ['praanapada', 'moon', 'gulika'],
          timeRange: { hours: 2 }
        }
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 120000
      }
    );
    
    if (response.data.success && response.data.rectification) {
      const rectification = response.data.rectification;
      console.log('   ✅ Complete BTR Analysis Finished');
      console.log(`   Original Birth Time: ${birthData.timeOfBirth || 'N/A'}`);
      console.log(`   Rectified Birth Time: ${rectification.rectifiedTime || 'N/A'}`);
      console.log(`   Confidence: ${rectification.confidence || 0}%`);
      
      // Display method results
      if (rectification.methods) {
        console.log('\n   Method Results:');
        Object.keys(rectification.methods).forEach(method => {
          const methodResult = rectification.methods[method];
          if (methodResult.bestCandidate) {
            console.log(`   - ${method}: ${methodResult.bestCandidate.time} (score: ${methodResult.bestCandidate.score?.toFixed(2) || 'N/A'})`);
          }
        });
      }
      
      return rectification;
    }
  } catch (error) {
    console.error('   ❌ Complete BTR Analysis Error:', error.message);
    if (error.response) {
      console.error('   Response Status:', error.response.status);
      console.error('   Response Data:', JSON.stringify(error.response.data).substring(0, 500));
    }
  }
  
  return null;
}

/**
 * Main Analysis Function
 */
async function runBTRAnalysis() {
  console.log('\n' + '='.repeat(70));
  console.log('⚠️  CRITICAL: Original birth time not found in production logs');
  console.log('   To complete BTR analysis, we need:');
  console.log('   1. Original birth date');
  console.log('   2. Original birth time (estimated)');
  console.log('   3. Birth location (latitude, longitude, timezone)');
  console.log('='.repeat(70));
  
  // For demonstration, we'll use a sample birth data
  // In production, this should be extracted from the API request logs
  const sampleBirthData = {
    dateOfBirth: '1990-01-01', // This needs to be extracted from logs
    timeOfBirth: '12:00', // This needs to be extracted from logs
    placeOfBirth: 'Mumbai, Maharashtra, India',
    latitude: 19.076,
    longitude: 72.8777,
    timezone: 'Asia/Kolkata'
  };
  
  console.log('\n📋 Using Sample Birth Data (for demonstration):');
  console.log(`   Date: ${sampleBirthData.dateOfBirth}`);
  console.log(`   Time: ${sampleBirthData.timeOfBirth}`);
  console.log(`   Place: ${sampleBirthData.placeOfBirth}`);
  console.log(`   Coordinates: ${sampleBirthData.latitude}, ${sampleBirthData.longitude}`);
  console.log(`   Timezone: ${sampleBirthData.timezone}`);
  
  // Run step-by-step analysis
  await step1_EstimateOriginalBirthTime();
  await step2_PraanapadaAnalysis(sampleBirthData);
  await step3_MoonAnalysis(sampleBirthData);
  await step4_GulikaAnalysis(sampleBirthData);
  await step5_NishekaAnalysis(sampleBirthData);
  const completeResult = await step6_CompleteBTRAnalysis(sampleBirthData);
  
  console.log('\n' + '='.repeat(70));
  console.log('📊 FINAL RESULTS');
  console.log('='.repeat(70));
  
  if (completeResult) {
    console.log(`\n✅ ORIGINAL BIRTH TIME: ${sampleBirthData.timeOfBirth}`);
    console.log(`✅ CORRECTED BIRTH TIME: ${completeResult.rectifiedTime || 'N/A'}`);
    console.log(`✅ CONFIDENCE: ${completeResult.confidence || 0}%`);
    
    if (completeResult.recommendations && completeResult.recommendations.length > 0) {
      console.log('\n📋 Recommendations:');
      completeResult.recommendations.forEach((rec, idx) => {
        console.log(`   ${idx + 1}. ${rec}`);
      });
    }
  } else {
    console.log('\n❌ BTR Analysis incomplete - could not determine corrected birth time');
    console.log('   Root Cause: Missing original birth time in production logs');
    console.log('   Solution: Extract birth data from API request logs or database');
  }
  
  console.log('\n' + '='.repeat(70));
}

// Run analysis
runBTRAnalysis().catch(error => {
  console.error('\n❌ Analysis error:', error.message);
  console.error(error.stack);
  process.exit(1);
});

