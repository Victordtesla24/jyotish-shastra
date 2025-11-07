#!/usr/bin/env node
/**
 * BTR Analysis with Life Events
 * Uses BTR implementation to find accurate birth time based on life events
 */

const axios = require('axios');

// Birth data from user
const birthData = {
  name: 'User',
  dateOfBirth: '1985-10-24', // 24/10/1985
  timeOfBirth: '14:30', // 02:30 PM (Correct time - verifying with BTR)
  placeOfBirth: 'Pune, Maharashtra, India',
  latitude: 18.5204,
  longitude: 73.8567,
  timezone: 'Asia/Kolkata'
};

// Life events for BTR correlation
// Format: Only date and description are required
const lifeEvents = [
  {
    date: '2008-01-31', // 31/01/2008
    description: 'Life Relocation'
  },
  {
    date: '2022-04-20', // 20/04/2022
    description: 'Big Promotion'
  },
  {
    date: '2025-02-25', // 25/02/2025
    description: 'Lost Job'
  }
];

const API_BASE = process.env.API_BASE_URL || 'https://jjyotish-shastra-backend.onrender.com';

console.log('🔍 BTR Analysis with Life Events');
console.log('='.repeat(70));
console.log('\n📊 Birth Data:');
console.log(`   Date of Birth: ${birthData.dateOfBirth} (24/10/1985)`);
console.log(`   Time of Birth: ${birthData.timeOfBirth} (12:00 AM - ESTIMATED)`);
console.log(`   Place of Birth: ${birthData.placeOfBirth}`);
console.log(`   Coordinates: ${birthData.latitude}°N, ${birthData.longitude}°E`);
console.log(`   Timezone: ${birthData.timezone}`);
console.log('\n📅 Life Events:');
lifeEvents.forEach((event, idx) => {
  console.log(`   ${idx + 1}. ${event.description} - ${event.date}`);
});
console.log('\n' + '='.repeat(70));

/**
 * Step 1: Generate initial chart with estimated time
 */
async function step1_GenerateInitialChart() {
  console.log('\n🔬 STEP 1: Generate Initial Chart with Correct Time');
  console.log('-'.repeat(70));
  console.log(`   Birth Time: ${birthData.timeOfBirth} (02:30 PM)`);
  
  try {
    const response = await axios.post(
      `${API_BASE}/api/v1/chart/generate`,
      birthData,
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 120000
      }
    );
    
    if (response.data.success && response.data.data.rasiChart) {
      const chart = response.data.data.rasiChart;
      console.log('   ✅ Chart Generated Successfully');
      console.log(`   Ascendant: ${chart.ascendant.longitude.toFixed(2)}° (${chart.ascendant.signName || chart.ascendant.sign})`);
      console.log(`   Sun: ${chart.planetaryPositions.sun.longitude.toFixed(2)}°`);
      console.log(`   Moon: ${chart.planetaryPositions.moon.longitude.toFixed(2)}°`);
      return chart;
    }
  } catch (error) {
    console.error('   ❌ Chart Generation Error:', error.message);
    throw error;
  }
}

/**
 * Step 2: Run BTR with Event Correlation
 */
async function step2_RunBTRWithEvents() {
  console.log('\n🔬 STEP 2: Run BTR Analysis with Event Correlation');
  console.log('-'.repeat(70));
  console.log('   Methods: Praanapada, Moon, Gulika, Event Correlation');
  console.log('   Time Range: ±2 hours from estimated time');
  
  try {
    const response = await axios.post(
      `${API_BASE}/api/v1/rectification/with-events`,
      {
        birthData: birthData,
        lifeEvents: lifeEvents,
        options: {
          methods: ['praanapada', 'moon', 'gulika', 'events'],
          timeRange: { hours: 2 }
        }
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 180000 // 3 minutes for event correlation
      }
    );
    
    if (response.data.success && response.data.rectification) {
      const rectification = response.data.rectification;
      console.log('   ✅ BTR Analysis Completed');
      return rectification;
    } else {
      throw new Error('BTR analysis failed - invalid response structure');
    }
  } catch (error) {
    console.error('   ❌ BTR Analysis Error:', error.message);
    if (error.response) {
      console.error('   Response Status:', error.response.status);
      console.error('   Response Data:', JSON.stringify(error.response.data).substring(0, 500));
    }
    throw error;
  }
}

/**
 * Step 3: Analyze Results
 */
function step3_AnalyzeResults(rectification) {
  console.log('\n🔬 STEP 3: Analyze BTR Results');
  console.log('-'.repeat(70));
  
  console.log(`   Original Birth Time: ${birthData.timeOfBirth} (12:00 AM - ESTIMATED)`);
  console.log(`   Rectified Birth Time: ${rectification.rectifiedTime || 'N/A'}`);
  console.log(`   Confidence: ${rectification.confidence || 0}%`);
  
  if (rectification.methods) {
    console.log('\n   Method Breakdown:');
    Object.entries(rectification.methods).forEach(([method, result]) => {
      if (result.bestCandidate) {
        const time = result.bestCandidate.time || 'N/A';
        const score = result.bestCandidate.alignmentScore || 
                     result.bestCandidate.moonScore || 
                     result.bestCandidate.gulikaScore || 
                     result.bestCandidate.eventScore || 
                     'N/A';
        console.log(`   - ${method.toUpperCase()}: ${time} (score: ${typeof score === 'number' ? score.toFixed(2) : score})`);
      }
    });
  }
  
  if (rectification.recommendations && rectification.recommendations.length > 0) {
    console.log('\n   Recommendations:');
    rectification.recommendations.forEach((rec, idx) => {
      console.log(`   ${idx + 1}. ${rec}`);
    });
  }
  
  return rectification;
}

/**
 * Main Analysis Function
 */
async function runBTRAnalysis() {
  try {
    // Step 1: Generate initial chart
    const initialChart = await step1_GenerateInitialChart();
    
    // Step 2: Run BTR with events
    const rectification = await step2_RunBTRWithEvents();
    
    // Step 3: Analyze results
    const results = step3_AnalyzeResults(rectification);
    
    // Final Summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 FINAL RESULTS');
    console.log('='.repeat(70));
    console.log(`\n🕐 ORIGINAL BIRTH TIME: ${birthData.timeOfBirth} (12:00 AM - ESTIMATED)`);
    console.log(`🕐 CORRECTED BIRTH TIME: ${results.rectifiedTime || 'N/A'}`);
    console.log(`📈 CONFIDENCE: ${results.confidence || 0}%`);
    
    if (results.rectifiedTime && results.rectifiedTime !== birthData.timeOfBirth) {
      const [origHours, origMins] = birthData.timeOfBirth.split(':').map(Number);
      const [rectHours, rectMins] = results.rectifiedTime.split(':').map(Number);
      const origTotal = origHours * 60 + origMins;
      const rectTotal = rectHours * 60 + rectMins;
      const diffMinutes = rectTotal - origTotal;
      const diffHours = Math.floor(Math.abs(diffMinutes) / 60);
      const diffMins = Math.abs(diffMinutes) % 60;
      const direction = diffMinutes > 0 ? 'later' : 'earlier';
      
      console.log(`\n⏰ TIME DIFFERENCE: ${diffHours}h ${diffMins}m ${direction}`);
    }
    
    console.log('\n' + '='.repeat(70));
    
    return {
      originalTime: birthData.timeOfBirth,
      correctedTime: results.rectifiedTime,
      confidence: results.confidence,
      methods: results.methods,
      recommendations: results.recommendations
    };
    
  } catch (error) {
    console.error('\n❌ Analysis failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run analysis
runBTRAnalysis().catch(error => {
  console.error('\n❌ Fatal error:', error.message);
  process.exit(1);
});

