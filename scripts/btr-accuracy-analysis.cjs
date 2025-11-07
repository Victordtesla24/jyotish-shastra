#!/usr/bin/env node
/**
 * BTR Accuracy Analysis
 * Analyzes BTR calculation accuracy using provided birth data and life events
 */

const axios = require('axios');

const API_BASE = process.env.API_BASE_URL || 'http://localhost:3001';

// User provided data
const userBirthData = {
  dateOfBirth: '1985-10-24',
  timeOfBirth: '00:00', // 12:00 AM (midnight)
  placeOfBirth: 'Pune, India',
  latitude: 18.5204,
  longitude: 73.8567,
  timezone: 'Asia/Kolkata'
};

// Life events for BTR correlation (correct format: only date and description)
const lifeEvents = [
  {
    date: '2008-01-31',
    description: 'Life Relocation'
  },
  {
    date: '2022-04-20',
    description: 'Big Promotion'
  },
  {
    date: '2025-02-25',
    description: 'Lost Job'
  }
];

// Expected ToB
const expectedToB = '14:30'; // 02:30 PM

console.log('🔍 BTR Accuracy Analysis');
console.log('='.repeat(70));
console.log('\n📊 User Provided Data:');
console.log(`   Date of Birth: ${userBirthData.dateOfBirth}`);
console.log(`   Time of Birth: ${userBirthData.timeOfBirth} (12:00 AM - Estimated)`);
console.log(`   Place of Birth: ${userBirthData.placeOfBirth}`);
console.log(`   Coordinates: ${userBirthData.latitude}°N, ${userBirthData.longitude}°E`);
console.log(`   Timezone: ${userBirthData.timezone}`);
console.log('\n📅 Life Events for BTR Correlation:');
lifeEvents.forEach((event, idx) => {
  console.log(`   ${idx + 1}. ${event.date} - ${event.description} (${event.type})`);
});
console.log(`\n🎯 Expected ToB: ${expectedToB} (02:30 PM)`);
console.log('='.repeat(70));

/**
 * Step 1: Generate Chart with User Provided ToB
 */
async function step1_GenerateChartWithUserToB() {
  console.log('\n🔬 STEP 1: Generate Chart with User Provided ToB');
  console.log('-'.repeat(70));
  console.log(`   ToB: ${userBirthData.timeOfBirth} (12:00 AM)`);
  
  try {
    const response = await axios.post(
      `${API_BASE}/api/v1/chart/generate`,
      {
        name: 'BTR Analysis User',
        dateOfBirth: userBirthData.dateOfBirth,
        timeOfBirth: userBirthData.timeOfBirth,
        placeOfBirth: userBirthData.placeOfBirth,
        latitude: userBirthData.latitude,
        longitude: userBirthData.longitude,
        timezone: userBirthData.timezone
      },
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
    if (error.response) {
      console.error('   Response:', JSON.stringify(error.response.data).substring(0, 300));
    }
  }
  
  return null;
}

/**
 * Step 2: Run BTR Analysis (Without Events)
 */
async function step2_BTRAnalysisWithoutEvents() {
  console.log('\n🔬 STEP 2: BTR Analysis (Without Events)');
  console.log('-'.repeat(70));
  console.log('   Methods: Praanapada, Moon, Gulika');
  
  try {
    const response = await axios.post(
      `${API_BASE}/api/v1/rectification/analyze`,
      {
        birthData: userBirthData,
        options: {
          methods: ['praanapada', 'moon', 'gulika'],
          timeRange: { hours: 15 } // Increased to cover expected time 14:30 (14.5 hours from 00:00)
        }
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 120000
      }
    );
    
    if (response.data.success && response.data.rectification) {
      const rectification = response.data.rectification;
      console.log('   ✅ BTR Analysis Complete');
      console.log(`   Rectified Time: ${rectification.rectifiedTime || 'N/A'}`);
      console.log(`   Confidence: ${rectification.confidence || 0}%`);
      
      if (rectification.methods) {
        console.log('\n   Method Results:');
        Object.entries(rectification.methods).forEach(([method, result]) => {
          if (result.bestCandidate) {
            const score = result.bestCandidate.alignmentScore || 
                         result.bestCandidate.moonScore || 
                         result.bestCandidate.gulikaScore || 
                         result.bestCandidate.score || 0;
            console.log(`   - ${method}: ${result.bestCandidate.time} (score: ${score.toFixed(2)})`);
          }
        });
      }
      
      return rectification;
    }
  } catch (error) {
    console.error('   ❌ BTR Analysis Error:', error.message);
    if (error.response) {
      console.error('   Response:', JSON.stringify(error.response.data).substring(0, 500));
    }
  }
  
  return null;
}

/**
 * Step 3: Run BTR Analysis (With Events)
 */
async function step3_BTRAnalysisWithEvents() {
  console.log('\n🔬 STEP 3: BTR Analysis (With Events)');
  console.log('-'.repeat(70));
  console.log('   Methods: Praanapada, Moon, Gulika, Events');
  console.log(`   Life Events: ${lifeEvents.length} events`);
  
  try {
    const response = await axios.post(
      `${API_BASE}/api/v1/rectification/with-events`,
      {
        birthData: userBirthData,
        lifeEvents: lifeEvents,
        options: {
          methods: ['praanapada', 'moon', 'gulika', 'events'],
          timeRange: { hours: 15 } // Increased to cover expected time 14:30 (14.5 hours from 00:00)
        }
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 180000
      }
    );
    
    if (response.data.success && response.data.rectification) {
      const rectification = response.data.rectification;
      console.log('   ✅ BTR Analysis with Events Complete');
      console.log(`   Rectified Time: ${rectification.rectifiedTime || 'N/A'}`);
      console.log(`   Confidence: ${rectification.confidence || 0}%`);
      
      if (rectification.methods) {
        console.log('\n   Method Results:');
        Object.entries(rectification.methods).forEach(([method, result]) => {
          if (result.bestCandidate) {
            const score = result.bestCandidate.alignmentScore || 
                         result.bestCandidate.moonScore || 
                         result.bestCandidate.gulikaScore || 
                         result.bestCandidate.eventScore ||
                         result.bestCandidate.score || 0;
            console.log(`   - ${method}: ${result.bestCandidate.time} (score: ${score.toFixed(2)})`);
          }
        });
      }
      
      return rectification;
    }
  } catch (error) {
    console.error('   ❌ BTR Analysis with Events Error:', error.message);
    if (error.response) {
      console.error('   Response:', JSON.stringify(error.response.data).substring(0, 500));
    }
  }
  
  return null;
}

/**
 * Step 4: Analyze Discrepancies
 */
function step4_AnalyzeDiscrepancies(rectificationWithoutEvents, rectificationWithEvents) {
  console.log('\n🔬 STEP 4: Analyze Discrepancies');
  console.log('-'.repeat(70));
  
  const userToB = userBirthData.timeOfBirth;
  const expectedToBTime = expectedToB;
  
  console.log(`   User Provided ToB: ${userToB} (12:00 AM)`);
  console.log(`   Expected ToB: ${expectedToBTime} (02:30 PM)`);
  
  if (rectificationWithoutEvents) {
    const calculatedToB = rectificationWithoutEvents.rectifiedTime || 'N/A';
    console.log(`   System Calculated ToB (without events): ${calculatedToB}`);
    
    if (calculatedToB !== 'N/A') {
      const diff = calculateTimeDifference(userToB, calculatedToB);
      const expectedDiff = calculateTimeDifference(userToB, expectedToBTime);
      const accuracyDiff = calculateTimeDifference(calculatedToB, expectedToBTime);
      
      console.log(`   Difference from User ToB: ${diff}`);
      console.log(`   Difference from Expected ToB: ${accuracyDiff}`);
      console.log(`   Expected Difference: ${expectedDiff}`);
      
      if (accuracyDiff !== '0:00') {
        console.log(`   ⚠️  DISCREPANCY: System calculated ToB differs from expected by ${accuracyDiff}`);
      } else {
        console.log(`   ✅ ACCURATE: System calculated ToB matches expected`);
      }
    }
  }
  
  if (rectificationWithEvents) {
    const calculatedToBWithEvents = rectificationWithEvents.rectifiedTime || 'N/A';
    console.log(`   System Calculated ToB (with events): ${calculatedToBWithEvents}`);
    
    if (calculatedToBWithEvents !== 'N/A') {
      const diff = calculateTimeDifference(userToB, calculatedToBWithEvents);
      const expectedDiff = calculateTimeDifference(userToB, expectedToBTime);
      const accuracyDiff = calculateTimeDifference(calculatedToBWithEvents, expectedToBTime);
      
      console.log(`   Difference from User ToB: ${diff}`);
      console.log(`   Difference from Expected ToB: ${accuracyDiff}`);
      console.log(`   Expected Difference: ${expectedDiff}`);
      
      if (accuracyDiff !== '0:00') {
        console.log(`   ⚠️  DISCREPANCY: System calculated ToB (with events) differs from expected by ${accuracyDiff}`);
      } else {
        console.log(`   ✅ ACCURATE: System calculated ToB (with events) matches expected`);
      }
    }
  }
}

/**
 * Calculate time difference in HH:MM format
 */
function calculateTimeDifference(time1, time2) {
  const [h1, m1] = time1.split(':').map(Number);
  const [h2, m2] = time2.split(':').map(Number);
  
  const minutes1 = h1 * 60 + m1;
  const minutes2 = h2 * 60 + m2;
  
  let diffMinutes = Math.abs(minutes2 - minutes1);
  if (diffMinutes > 12 * 60) {
    diffMinutes = 24 * 60 - diffMinutes; // Handle day wrap-around
  }
  
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;
  
  return `${hours}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Step 5: Root Cause Analysis
 */
function step5_RootCauseAnalysis(rectificationWithoutEvents, rectificationWithEvents) {
  console.log('\n🔬 STEP 5: Root Cause Analysis');
  console.log('-'.repeat(70));
  
  console.log('   Potential Root Causes:');
  console.log('   1. Praanapada Calculation Issues:');
  console.log('      - Sunrise calculation accuracy');
  console.log('      - Time zone handling');
  console.log('      - PALA_PER_HOUR constant (2.5) vs BPHS vighatikas/15 method');
  console.log('   2. Moon Position Method:');
  console.log('      - Moon-Ascendant relationship calculation');
  console.log('      - Nakshatra-based timing');
  console.log('   3. Gulika Method:');
  console.log('      - Day of week calculation');
  console.log('      - Muhurta segment calculation');
  console.log('   4. Event Correlation:');
  console.log('      - Dasha period calculation');
  console.log('      - Transit analysis');
  console.log('      - Event timing precision');
  console.log('   5. Time Zone Issues:');
  console.log('      - UTC vs Local time conversion');
  console.log('      - DST handling');
  console.log('      - Historical timezone data');
  console.log('   6. Method Weighting:');
  console.log('      - Ensemble method weights');
  console.log('      - Confidence calculation');
  console.log('      - Best candidate selection');
}

/**
 * Main Analysis Function
 */
async function runAnalysis() {
  console.log('\n🚀 Starting BTR Accuracy Analysis...\n');
  
  // Step 1: Generate chart
  const chart = await step1_GenerateChartWithUserToB();
  
  // Step 2: BTR without events
  const rectificationWithoutEvents = await step2_BTRAnalysisWithoutEvents();
  
  // Step 3: BTR with events
  const rectificationWithEvents = await step3_BTRAnalysisWithEvents();
  
  // Step 4: Analyze discrepancies
  step4_AnalyzeDiscrepancies(rectificationWithoutEvents, rectificationWithEvents);
  
  // Step 5: Root cause analysis
  step5_RootCauseAnalysis(rectificationWithoutEvents, rectificationWithEvents);
  
  // Final Summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 FINAL SUMMARY');
  console.log('='.repeat(70));
  console.log(`\n🕐 User Provided ToB: ${userBirthData.timeOfBirth} (12:00 AM)`);
  console.log(`🎯 Expected ToB: ${expectedToB} (02:30 PM)`);
  
  if (rectificationWithoutEvents) {
    console.log(`\n📈 System Calculated ToB (without events): ${rectificationWithoutEvents.rectifiedTime || 'N/A'}`);
    console.log(`   Confidence: ${rectificationWithoutEvents.confidence || 0}%`);
  }
  
  if (rectificationWithEvents) {
    console.log(`\n📈 System Calculated ToB (with events): ${rectificationWithEvents.rectifiedTime || 'N/A'}`);
    console.log(`   Confidence: ${rectificationWithEvents.confidence || 0}%`);
  }
  
  console.log('\n' + '='.repeat(70));
}

// Run analysis
runAnalysis().catch(error => {
  console.error('\n❌ Analysis error:', error.message);
  console.error(error.stack);
  process.exit(1);
});

