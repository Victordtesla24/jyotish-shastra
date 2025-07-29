#!/usr/bin/env node

/**
 * Benchmark script for testing data processing pipeline performance
 * This script measures the current pipeline performance before optimization
 */

const axios = require('axios');

// Test birth data
const testBirthData = {
  name: 'Benchmark Test',
  dateOfBirth: '1990-01-01',
  timeOfBirth: '12:00',
  placeOfBirth: 'New York, NY, USA',
  latitude: 40.7128,
  longitude: -74.0060,
  timezone: 'America/New_York'
};

// Wait for servers to be ready
const waitForServer = async (url, maxAttempts = 30) => {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await axios.get(url);
      return true;
    } catch (error) {
      console.log(`Waiting for ${url}... (${i + 1}/${maxAttempts})`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  throw new Error(`Server at ${url} did not start in time`);
};

const runBenchmark = async () => {
  try {
    console.log('🏁 Starting Pipeline Benchmark...\n');

    // Wait for servers
    console.log('⏳ Waiting for servers to start...');
    await waitForServer('http://localhost:3002');
    await waitForServer('http://localhost:3001/health');
    console.log('✅ Servers are ready\n');

    // Import ChartService dynamically
    console.log('📊 Running benchmark through browser console...');
    console.log('⚠️  Please open http://localhost:3002 in your browser');
    console.log('📝 Then run this in the browser console:\n');

    console.log(`
// Copy and paste this into browser console:
(async () => {
  const ChartService = (await import('./services/chartService.js')).default;
  const chartService = new ChartService();

  const testData = ${JSON.stringify(testBirthData, null, 2)};

  console.log('🏁 Running benchmark...');
  const results = await chartService.benchmarkPipeline(testData);

  console.log('\\n📊 BENCHMARK RESULTS:');
  console.log('====================');
  console.log('Streamlined Pipeline:', results.streamlined);
  console.log('\\nComparison:', results.comparison);

  // Save results to localStorage for retrieval
  localStorage.setItem('benchmarkResults', JSON.stringify(results));
  console.log('\\n✅ Results saved to localStorage');
})();
    `);

    console.log('\n📌 After running the benchmark, retrieve results with:');
    console.log('   localStorage.getItem("benchmarkResults")');

  } catch (error) {
    console.error('❌ Benchmark failed:', error.message);
    process.exit(1);
  }
};

// Run the benchmark
runBenchmark();
