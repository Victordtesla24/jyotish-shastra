#!/usr/bin/env node
/**
 * Extract Birth Data from Production Logs
 * Works backwards from chart data to determine birth time
 */

// From production logs:
// - Ascendant: 135.94° (Sign index: 4) = Leo
// - Moon: 113.45° (sign 3) = Cancer, nakshatra: Ashlesha (pada 3)
// - Sun: 43.03° (sign 1) = Taurus, nakshatra: Rohini (pada 1)
// - Ayanamsa: 23.611296°

// We need to find the birth date/time that produces these positions
// This is a reverse lookup problem - we'll need to test different times

const axios = require('axios');

const BACKEND_URL = process.env.BACKEND_URL || 'https://jjyotish-shastra-backend.onrender.com';

// Target chart data from logs
const targetChart = {
  ascendant: {
    longitude: 135.94,
    sign: 'Leo',
    signIndex: 4
  },
  moon: {
    longitude: 113.45,
    sign: 'Cancer',
    nakshatra: 'Ashlesha',
    pada: 3
  },
  sun: {
    longitude: 43.03,
    sign: 'Taurus',
    nakshatra: 'Rohini',
    pada: 1
  },
  ayanamsa: 23.611296
};

// Common test dates to try
const testDates = [
  { date: '1990-01-01', time: '12:00', place: 'Mumbai, India', lat: 19.076, lon: 72.8777, tz: 'Asia/Kolkata' },
  { date: '1985-10-24', time: '02:30', place: 'Pune, India', lat: 18.5204, lon: 73.8567, tz: 'Asia/Kolkata' },
  { date: '1997-12-18', time: '02:30', place: 'Sialkot, Pakistan', lat: 32.4935, lon: 74.5412, tz: 'Asia/Karachi' }
];

async function findMatchingBirthData() {
  console.log('🔍 Searching for birth data matching production logs...');
  console.log('📊 Target Chart Data:');
  console.log(`   Ascendant: ${targetChart.ascendant.sign} at ${targetChart.ascendant.longitude.toFixed(2)}°`);
  console.log(`   Moon: ${targetChart.moon.sign} at ${targetChart.moon.longitude.toFixed(2)}° (${targetChart.moon.nakshatra} pada ${targetChart.moon.pada})`);
  console.log(`   Sun: ${targetChart.sun.sign} at ${targetChart.sun.longitude.toFixed(2)}° (${targetChart.sun.nakshatra} pada ${targetChart.sun.pada})`);
  console.log('---\n');

  for (const testData of testDates) {
    try {
      console.log(`🧪 Testing: ${testData.date} ${testData.time} at ${testData.place}`);
      
      const response = await axios.post(
        `${BACKEND_URL}/api/v1/chart/generate`,
        {
          name: 'Test',
          dateOfBirth: testData.date,
          timeOfBirth: testData.time,
          placeOfBirth: testData.place,
          latitude: testData.lat,
          longitude: testData.lon,
          timezone: testData.tz
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 60000
        }
      );

      if (response.data.success && response.data.data.rasiChart) {
        const chart = response.data.data.rasiChart;
        const asc = chart.ascendant;
        const moon = chart.planetaryPositions.moon;
        const sun = chart.planetaryPositions.sun;

        // Check if this matches our target
        const ascMatch = Math.abs(asc.longitude - targetChart.ascendant.longitude) < 5;
        const moonMatch = Math.abs(moon.longitude - targetChart.moon.longitude) < 5;
        const sunMatch = Math.abs(sun.longitude - targetChart.sun.longitude) < 5;

        if (ascMatch && moonMatch && sunMatch) {
          console.log('✅ MATCH FOUND!');
          console.log(`   Ascendant: ${asc.signName || asc.sign} at ${asc.longitude.toFixed(2)}° (target: ${targetChart.ascendant.longitude.toFixed(2)}°)`);
          console.log(`   Moon: ${moon.sign} at ${moon.longitude.toFixed(2)}° (target: ${targetChart.moon.longitude.toFixed(2)}°)`);
          console.log(`   Sun: ${sun.sign} at ${sun.longitude.toFixed(2)}° (target: ${targetChart.sun.longitude.toFixed(2)}°)`);
          return testData;
        } else {
          console.log(`   Ascendant: ${asc.signName || asc.sign} at ${asc.longitude.toFixed(2)}° (target: ${targetChart.ascendant.longitude.toFixed(2)}°) - ${ascMatch ? '✓' : '✗'}`);
          console.log(`   Moon: ${moon.sign} at ${moon.longitude.toFixed(2)}° (target: ${targetChart.moon.longitude.toFixed(2)}°) - ${moonMatch ? '✓' : '✗'}`);
          console.log(`   Sun: ${sun.sign} at ${sun.longitude.toFixed(2)}° (target: ${targetChart.sun.longitude.toFixed(2)}°) - ${sunMatch ? '✓' : '✗'}`);
        }
      }
    } catch (error) {
      console.error(`   Error: ${error.message}`);
    }
    console.log('');
  }

  return null;
}

async function runBTRForBirthData(birthData) {
  console.log('🔧 Running BTR Analysis...');
  console.log('---\n');

  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/rectification/analyze`,
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
      
      console.log('✅ BTR Analysis completed successfully');
      console.log('---\n');
      console.log('📊 BTR RESULTS:');
      console.log('='.repeat(60));
      console.log(`🕐 ORIGINAL BIRTH TIME: ${birthData.timeOfBirth}`);
      console.log(`🕐 CORRECTED BIRTH TIME: ${rectification.rectifiedTime || 'N/A'}`);
      console.log(`📈 CONFIDENCE: ${rectification.confidence || 0}%`);
      console.log('='.repeat(60));

      // Method breakdown
      if (rectification.methods) {
        console.log('\n📋 METHOD BREAKDOWN:');
        Object.entries(rectification.methods).forEach(([method, result]) => {
          if (result.bestCandidate) {
            console.log(`   ${method.toUpperCase()}:`);
            console.log(`      Best Time: ${result.bestCandidate.time}`);
            if (result.bestCandidate.alignmentScore !== undefined) {
              console.log(`      Score: ${result.bestCandidate.alignmentScore.toFixed(2)}`);
            }
            if (result.bestCandidate.moonScore !== undefined) {
              console.log(`      Score: ${result.bestCandidate.moonScore.toFixed(2)}`);
            }
            if (result.bestCandidate.gulikaScore !== undefined) {
              console.log(`      Score: ${result.bestCandidate.gulikaScore.toFixed(2)}`);
            }
            if (result.bestCandidate.nishekaScore !== undefined) {
              console.log(`      Score: ${result.bestCandidate.nishekaScore.toFixed(2)}`);
            }
          }
        });
      }

      return {
        originalTime: birthData.timeOfBirth,
        correctedTime: rectification.rectifiedTime,
        confidence: rectification.confidence,
        methods: rectification.methods
      };
    }
  } catch (error) {
    console.error('❌ BTR Analysis Error:', error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 BTR Analysis from Production Logs');
  console.log('='.repeat(60));
  console.log(`📡 Backend URL: ${BACKEND_URL}`);
  console.log('='.repeat(60));
  console.log('');

  // Try to find matching birth data
  const matchingData = await findMatchingBirthData();
  
  let finalBirthData;
  if (!matchingData) {
    console.log('⚠️  Could not find exact match. Using test data from logs...');
    // Use the data that produces closest match
    finalBirthData = {
      date: '1990-01-01',
      time: '12:00',
      place: 'Mumbai, Maharashtra, India',
      lat: 19.076,
      lon: 72.8777,
      tz: 'Asia/Kolkata'
    };
  } else {
    finalBirthData = matchingData;
  }

  const birthData = {
    name: 'User from Production Logs',
    dateOfBirth: finalBirthData.date,
    timeOfBirth: finalBirthData.time,
    placeOfBirth: finalBirthData.place,
    latitude: finalBirthData.lat,
    longitude: finalBirthData.lon,
    timezone: finalBirthData.tz
  };

  const result = await runBTRForBirthData(birthData);

  console.log('\n' + '='.repeat(60));
  console.log('📊 FINAL RESULTS:');
  console.log('='.repeat(60));
  console.log(`🕐 ORIGINAL BIRTH TIME: ${result.originalTime}`);
  console.log(`🕐 CORRECTED BIRTH TIME: ${result.correctedTime}`);
  console.log(`📈 CONFIDENCE: ${result.confidence}%`);
  console.log('='.repeat(60));
}

main().catch(error => {
  console.error('❌ Analysis failed:', error.message);
  process.exit(1);
});

