#!/usr/bin/env node

/**
 * Single Test Runner - Run one test at a time with proper cleanup
 * Usage: node run-single-test.cjs <test-name>
 * Example: node run-single-test.cjs home-page-test.cjs
 */

const { spawn } = require('child_process');
const path = require('path');

// Get test name from command line argument
const testName = process.argv[2];

if (!testName) {
  console.log('❌ Usage: node run-single-test.cjs <test-name>');
  console.log('📋 Available tests:');
  console.log('   - debug-data-flow.cjs');
  console.log('   - home-page-test.cjs');
  console.log('   - chart-page-test.cjs');
  console.log('   - analysis-page-test.cjs');
  console.log('   - api-integration-test.cjs');
  process.exit(1);
}

console.log(`🎯 Running single test: ${testName}`);
console.log('=' .repeat(50));

async function runSingleTest() {
  return new Promise((resolve, reject) => {
    const testProcess = spawn('node', [testName], {
      cwd: __dirname,
      stdio: 'inherit' // Direct output to parent process
    });

    // Set reasonable timeout (30 seconds)
    const timeoutId = setTimeout(() => {
      console.log('\n⏰ Test timeout - killing process...');
      try {
        testProcess.kill('SIGKILL');
      } catch (e) {
        console.log(`Failed to kill process: ${e.message}`);
      }
      reject(new Error('Test timeout'));
    }, 30000);

    testProcess.on('close', (code) => {
      clearTimeout(timeoutId);
      if (code === 0) {
        console.log('\n✅ Test completed successfully');
        resolve(true);
      } else {
        console.log(`\n❌ Test failed with exit code: ${code}`);
        resolve(false);
      }
    });

    testProcess.on('error', (error) => {
      clearTimeout(timeoutId);
      console.log(`\n💥 Test error: ${error.message}`);
      reject(error);
    });
  });
}

// Run the test
runSingleTest()
  .then(success => {
    console.log(`\n🎉 Single test result: ${success ? 'PASSED' : 'FAILED'}`);
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error(`\n💥 Single test failed: ${error.message}`);
    process.exit(1);
  });
