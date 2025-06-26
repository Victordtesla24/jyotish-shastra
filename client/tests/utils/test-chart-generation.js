/**
 * Test script to verify ChartGenerationService fix
 */

const ChartGenerationService = require('../../src/services/chart/ChartGenerationService');

async function testChartGeneration() {
  try {
    console.log('🧪 Testing ChartGenerationService with PDF test data...');

    const chartService = new ChartGenerationService();

    const testData = {
      dateOfBirth: "1985-10-24",
      timeOfBirth: "14:30:00",
      latitude: 18.52,
      longitude: 73.85,
      timezone: "Asia/Kolkata"
    };

    console.log('📊 Input data:', testData);

    // Test Julian Day calculation first
    console.log('\n⏰ Testing Julian Day calculation...');
    const jd = chartService.calculateJulianDay(testData.dateOfBirth, testData.timeOfBirth, testData.timezone);
    console.log('✅ Julian Day calculated successfully:', jd);

    // Test Rasi chart generation
    console.log('\n🌟 Testing Rasi chart generation...');
    const rasiChart = await chartService.generateRasiChart(testData);

    console.log('✅ Rasi chart generated successfully!');
    console.log('📍 Ascendant:', rasiChart.ascendant?.sign, 'at', rasiChart.ascendant?.degree?.toFixed(2) + '°');

    // Display planetary positions for comparison with PDF
    console.log('\n🪐 Planetary Positions:');
    const planets = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'];

    for (const planet of planets) {
      const pos = rasiChart.planetaryPositions[planet];
      if (pos) {
        console.log(`${planet.toUpperCase()}: ${pos.degree.toFixed(2)}° ${pos.sign} (${pos.longitude.toFixed(2)}°)`);
      }
    }

    console.log('\n✅ Chart generation test completed successfully!');

  } catch (error) {
    console.error('❌ Chart generation test failed:', error.message);
    console.error('📋 Stack trace:', error.stack);
  }
}

// Run the test
testChartGeneration();
