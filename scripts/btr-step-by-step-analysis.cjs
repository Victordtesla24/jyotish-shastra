#!/usr/bin/env node
/**
 * BTR Step-by-Step Analysis
 * Executes BTR analysis step by step and identifies original and corrected birth times
 */

const axios = require('axios');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

// User provided data for BTR analysis
const testBirthData = {
  name: 'BTR Analysis User',
  dateOfBirth: '1982-05-28', // 28/05/1982
  timeOfBirth: '00:00', // 12:00 AM (midnight) - User provided estimated time
  placeOfBirth: 'Pune, India',
  latitude: 18.5204,
  longitude: 73.8567,
  timezone: 'Asia/Kolkata'
};

// BTR Life Events for correlation
const lifeEvents = [
  {
    date: '2007-02-14', // 14/02/2007
    description: 'Life Relocation'
  },
  {
    date: '2004-01-22', // 22/01/2004
    description: 'Marriage'
  }
];

async function step1_GenerateChart(birthData) {
  console.log('📊 STEP 1: Generate Chart with Original Birth Time');
  console.log('='.repeat(60));
  console.log(`Original Birth Time: ${birthData.timeOfBirth}`);
  console.log(`Date: ${birthData.dateOfBirth}`);
  console.log(`Place: ${birthData.placeOfBirth}`);
  console.log('---\n');

  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/chart/generate`,
      birthData,
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 60000
      }
    );

    if (response.data.success && response.data.data.rasiChart) {
      const chart = response.data.data.rasiChart;
      console.log('✅ Chart Generated Successfully');
      console.log(`   Ascendant: ${chart.ascendant?.signName || chart.ascendant?.sign} at ${chart.ascendant?.degree?.toFixed(2)}°`);
      console.log(`   Moon: ${chart.planetaryPositions?.moon?.sign} at ${chart.planetaryPositions?.moon?.degree?.toFixed(2)}°`);
      console.log(`   Moon Nakshatra: ${chart.planetaryPositions?.moon?.nakshatra?.name} (pada ${chart.planetaryPositions?.moon?.nakshatra?.pada})`);
      console.log(`   Sun: ${chart.planetaryPositions?.sun?.sign} at ${chart.planetaryPositions?.sun?.degree?.toFixed(2)}°`);
      console.log(`   Sun Nakshatra: ${chart.planetaryPositions?.sun?.nakshatra?.name} (pada ${chart.planetaryPositions?.sun?.nakshatra?.pada})`);
      console.log('---\n');
      return chart;
    }
  } catch (error) {
    console.error('❌ Chart Generation Error:', error.message);
    throw error;
  }
}

async function step2_RunBTRAnalysis(birthData) {
  console.log('🔧 STEP 2: Run Birth Time Rectification Analysis (Without Events)');
  console.log('='.repeat(60));
  console.log('Analyzing using BPHS methods:');
  console.log('   - Praanapada Method');
  console.log('   - Moon Position Method');
  console.log('   - Gulika Position Method');
  console.log('---\n');

  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/rectification/analyze`,
      {
        birthData: birthData,
        options: {
          methods: ['praanapada', 'moon', 'gulika'],
          timeRange: { hours: 12 } // ±12 hours from user provided time
        }
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 120000
      }
    );

    if (response.data.success && response.data.rectification) {
      const rectification = response.data.rectification;
      console.log('✅ BTR Analysis Completed');
      console.log('---\n');
      return rectification;
    } else {
      throw new Error('BTR analysis failed - invalid response structure');
    }
  } catch (error) {
    console.error('❌ BTR Analysis Error:', error.message);
    if (error.response) {
      console.error('   Response Status:', error.response.status);
      console.error('   Response Data:', JSON.stringify(error.response.data).substring(0, 300));
    }
    throw error;
  }
}

async function step2b_RunBTRAnalysisWithEvents(birthData, events) {
  console.log('🔧 STEP 2B: Run Birth Time Rectification Analysis (With Events)');
  console.log('='.repeat(60));
  console.log('Analyzing using BPHS methods with life events:');
  console.log('   - Praanapada Method');
  console.log('   - Moon Position Method');
  console.log('   - Gulika Position Method');
  console.log('   - Event Correlation Method');
  console.log(`   Life Events: ${events.length} events`);
  console.log('---\n');

  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/rectification/with-events`,
      {
        birthData: birthData,
        lifeEvents: events,
        options: {
          methods: ['praanapada', 'moon', 'gulika', 'events'],
          timeRange: { hours: 12 } // ±12 hours from user provided time
        }
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 180000
      }
    );

    if (response.data.success && response.data.rectification) {
      const rectification = response.data.rectification;
      console.log('✅ BTR Analysis with Events Completed');
      console.log('---\n');
      return rectification;
    } else {
      throw new Error('BTR analysis with events failed - invalid response structure');
    }
  } catch (error) {
    console.error('❌ BTR Analysis with Events Error:', error.message);
    if (error.response) {
      console.error('   Response Status:', error.response.status);
      console.error('   Response Data:', JSON.stringify(error.response.data).substring(0, 300));
    }
    // Don't throw - return null so we can continue with analysis without events
    return null;
  }
}

function step3_AnalyzeMethods(rectification) {
  console.log('📋 STEP 3: Analyze Individual Method Results');
  console.log('='.repeat(60));

  if (!rectification.methods) {
    console.log('⚠️  No method results available');
    return;
  }

  Object.entries(rectification.methods).forEach(([method, result]) => {
    console.log(`\n${method.toUpperCase()} METHOD:`);
    if (result.bestCandidate) {
      console.log(`   Best Time: ${result.bestCandidate.time}`);
      if (result.bestCandidate.alignmentScore !== undefined) {
        console.log(`   Alignment Score: ${result.bestCandidate.alignmentScore.toFixed(2)}`);
      }
      if (result.bestCandidate.moonScore !== undefined) {
        console.log(`   Moon Score: ${result.bestCandidate.moonScore.toFixed(2)}`);
      }
      if (result.bestCandidate.gulikaScore !== undefined) {
        console.log(`   Gulika Score: ${result.bestCandidate.gulikaScore.toFixed(2)}`);
      }
      if (result.bestCandidate.nishekaScore !== undefined) {
        console.log(`   Nisheka Score: ${result.bestCandidate.nishekaScore.toFixed(2)}`);
      }
      if (result.bestCandidate.totalScore !== undefined) {
        console.log(`   Total Score: ${result.bestCandidate.totalScore.toFixed(2)}`);
      }
    } else {
      console.log('   No best candidate found');
    }
  });
  console.log('---\n');
}

function step4_IdentifyRootCause(rectification, originalTime) {
  console.log('🔍 STEP 4: Identify Root Cause');
  console.log('='.repeat(60));

  const correctedTime = rectification.rectifiedTime;
  const confidence = rectification.confidence;

  console.log(`Original Birth Time: ${originalTime}`);
  console.log(`Corrected Birth Time: ${correctedTime}`);
  console.log(`Confidence: ${confidence}%`);
  console.log('---\n');

  // Analyze why the correction was needed
  if (rectification.methods) {
    const methodResults = Object.entries(rectification.methods)
      .map(([method, result]) => ({
        method,
        time: result.bestCandidate?.time,
        score: result.bestCandidate?.alignmentScore || result.bestCandidate?.moonScore || result.bestCandidate?.gulikaScore || 0
      }))
      .filter(r => r.time);

    console.log('Root Cause Analysis:');
    console.log('   The original birth time may have been inaccurate due to:');
    console.log('   1. Clock errors or approximate time recording');
    console.log('   2. Time zone conversion issues');
    console.log('   3. Daylight saving time adjustments');
    console.log('   4. Human error in time recording');
    console.log('---\n');

    console.log('Method Consensus:');
    methodResults.forEach(mr => {
      console.log(`   ${mr.method}: ${mr.time} (score: ${mr.score.toFixed(2)})`);
    });
    console.log('---\n');

    if (correctedTime && correctedTime !== originalTime) {
      const timeDiff = calculateTimeDifference(originalTime, correctedTime);
      console.log(`Time Correction: ${timeDiff}`);
      console.log(`This correction aligns the birth time with BPHS rectification methods.`);
    }
  }
  console.log('---\n');
}

function calculateTimeDifference(time1, time2) {
  const [h1, m1] = time1.split(':').map(Number);
  const [h2, m2] = time2.split(':').map(Number);
  const minutes1 = h1 * 60 + m1;
  const minutes2 = h2 * 60 + m2;
  const diff = minutes2 - minutes1;
  const hours = Math.floor(Math.abs(diff) / 60);
  const mins = Math.abs(diff) % 60;
  const direction = diff >= 0 ? 'later' : 'earlier';
  return `${hours}h ${mins}m ${direction}`;
}

function step5_FinalResults(rectification, originalTime) {
  console.log('📊 STEP 5: Final Results');
  console.log('='.repeat(60));
  console.log('🕐 USER PROVIDED ToB:', originalTime);
  console.log('🕐 SYSTEM CALCULATED ToB:', rectification.rectifiedTime || 'N/A');
  console.log('📈 CONFIDENCE:', `${rectification.confidence || 0}%`);
  console.log('='.repeat(60));
  
  if (rectification.rectifiedTime && rectification.rectifiedTime !== originalTime) {
    const timeDiff = calculateTimeDifference(originalTime, rectification.rectifiedTime);
    console.log(`\n⏱️  TIME CORRECTION: ${timeDiff}`);
    console.log(`   The system calculated birth time differs from user provided time by ${timeDiff}`);
  }

  if (rectification.recommendations && rectification.recommendations.length > 0) {
    console.log('\n💡 RECOMMENDATIONS:');
    rectification.recommendations.forEach(rec => {
      console.log(`   - ${rec}`);
    });
  }

  if (rectification.analysisLog && rectification.analysisLog.length > 0) {
    console.log('\n📝 ANALYSIS LOG (key entries):');
    const keyLogs = rectification.analysisLog.filter(log => 
      log.includes('best candidate') || 
      log.includes('completed') ||
      log.includes('confidence')
    );
    keyLogs.forEach(log => {
      console.log(`   ${log}`);
    });
  }
}

async function main() {
  console.log('🚀 BTR Step-by-Step Analysis');
  console.log('='.repeat(60));
  console.log(`📡 Backend URL: ${BACKEND_URL}`);
  console.log('='.repeat(60));
  console.log('');

  try {
    // Step 1: Generate chart with original time
    const chart = await step1_GenerateChart(testBirthData);

    // Step 2: Run BTR analysis (without events)
    const rectificationWithoutEvents = await step2_RunBTRAnalysis(testBirthData);

    // Step 2B: Run BTR analysis (with events)
    const rectificationWithEvents = await step2b_RunBTRAnalysisWithEvents(testBirthData, lifeEvents);

    // Use the rectification with events if available, otherwise use without events
    const rectification = rectificationWithEvents || rectificationWithoutEvents;

    // Step 3: Analyze individual methods
    step3_AnalyzeMethods(rectification);

    // Step 4: Identify root cause
    step4_IdentifyRootCause(rectification, testBirthData.timeOfBirth);

    // Step 5: Final results
    step5_FinalResults(rectification, testBirthData.timeOfBirth);

    console.log('\n✅ Analysis Complete');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ Analysis Failed:', error.message);
    process.exit(1);
  }
}

main();

