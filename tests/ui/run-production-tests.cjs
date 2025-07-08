#!/usr/bin/env node

/**
 * Master Production Test Runner
 * Runs all focused production UI tests and generates comprehensive evidence
 * Tests ONLY real production pages and components - NO FAKE TESTS
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Production test suite configuration
const PRODUCTION_TESTS = [
  {
    name: 'API Data Debug',
    script: 'debug-data-flow.cjs',
    description: 'Validates backend API returns real data with correct structure',
    required: true,
    timeout: 30000
  },
  {
    name: 'Home Page Production Test',
    script: 'home-page-test.cjs',
    description: 'Tests home page navigation visibility and content display',
    required: true,
    timeout: 45000
  },
  {
    name: 'Chart Page Production Test',
    script: 'chart-page-test.cjs',
    description: 'Tests chart page form functionality and chart generation',
    required: true,
    timeout: 60000
  },
  {
    name: 'Analysis Page Production Test',
    script: 'analysis-page-test.cjs',
    description: 'Tests analysis page comprehensive functionality and data display',
    required: true,
    timeout: 45000
  },
  {
    name: 'End-to-End API Integration Test',
    script: 'api-integration-test.cjs',
    description: 'Tests complete UI-to-API integration with real data flow',
    required: true,
    timeout: 60000
  }
];

// Create master test results directory
const resultsDir = path.join(__dirname, 'master-production-results');
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true });
}

// Test execution configuration
const CONFIG = {
  maxConcurrentTests: 1, // Run tests sequentially for better reliability
  retries: 1,
  screenshotDir: path.join(__dirname, 'production-screenshots'),
  frontendUrl: 'http://localhost:3002',
  backendUrl: 'http://localhost:3001'
};

// Utility functions
function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}min`;
}

function generateTimestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

// Main test execution function
async function runProductionTests() {
  const masterResults = {
    timestamp: new Date().toISOString(),
    testSuite: 'Production UI Test Suite',
    environment: {
      frontend: CONFIG.frontendUrl,
      backend: CONFIG.backendUrl,
      nodeVersion: process.version,
      platform: process.platform
    },
    tests: [],
    summary: {
      total: PRODUCTION_TESTS.length,
      passed: 0,
      failed: 0,
      duration: 0,
      screenshots: 0
    },
    errors: []
  };

  console.log('🚀 Starting Production UI Test Suite...');
  console.log('=' .repeat(80));
  console.log(`📅 Timestamp: ${masterResults.timestamp}`);
  console.log(`🖥️  Frontend: ${CONFIG.frontendUrl}`);
  console.log(`🔧 Backend: ${CONFIG.backendUrl}`);
  console.log(`📊 Total Tests: ${PRODUCTION_TESTS.length}`);
  console.log('=' .repeat(80));

  const startTime = Date.now();

  // Check if servers are running
  console.log('\n🔍 Pre-flight checks...');

  try {
    const axios = require('axios');

    // Check frontend server
    try {
      await axios.get(CONFIG.frontendUrl, { timeout: 5000 });
      console.log('✅ Frontend server: Running');
    } catch (error) {
      console.log('❌ Frontend server: Not running');
      masterResults.errors.push('Frontend server not running');
    }

    // Check backend server
    try {
      await axios.get(`${CONFIG.backendUrl}/health`, { timeout: 5000 });
      console.log('✅ Backend server: Running');
    } catch (error) {
      console.log('❌ Backend server: Not running');
      masterResults.errors.push('Backend server not running');
    }

  } catch (error) {
    console.log('⚠️  Could not verify server status');
  }

  // Run each test
  for (let i = 0; i < PRODUCTION_TESTS.length; i++) {
    const test = PRODUCTION_TESTS[i];
    const testResult = {
      name: test.name,
      script: test.script,
      description: test.description,
      required: test.required,
      success: false,
      duration: 0,
      output: '',
      error: null,
      screenshots: []
    };

    console.log(`\n📍 Test ${i + 1}/${PRODUCTION_TESTS.length}: ${test.name}`);
    console.log(`📄 Description: ${test.description}`);
    console.log(`🔧 Script: ${test.script}`);
    console.log('─'.repeat(60));

    const testStartTime = Date.now();

    try {
      // Run the test with proper timeout handling
      await new Promise((resolve, reject) => {
        const testProcess = spawn('node', [test.script], {
          cwd: __dirname,
          stdio: ['pipe', 'pipe', 'pipe']
        });

        let stdout = '';
        let stderr = '';
        let isResolved = false;

        // Set up timeout manually with proper cleanup
        const timeoutId = setTimeout(() => {
          if (!isResolved) {
            isResolved = true;
            testResult.error = 'Test timeout';
            console.log(`⏰ ${test.name}: TIMEOUT after ${test.timeout}ms`);

            // Force kill the process
            try {
              testProcess.kill('SIGKILL');
            } catch (e) {
              console.log(`   Failed to kill process: ${e.message}`);
            }

            masterResults.summary.failed++;
            reject(new Error('Test timeout'));
          }
        }, test.timeout);

        testProcess.stdout.on('data', (data) => {
          const output = data.toString();
          stdout += output;
          process.stdout.write(output); // Show real-time output
        });

        testProcess.stderr.on('data', (data) => {
          const output = data.toString();
          stderr += output;
          process.stderr.write(output); // Show real-time errors
        });

        testProcess.on('close', (code) => {
          if (!isResolved) {
            isResolved = true;
            clearTimeout(timeoutId);

            testResult.success = code === 0;
            testResult.output = stdout;
            testResult.error = stderr || null;

            if (code === 0) {
              console.log(`✅ ${test.name}: PASSED`);
              masterResults.summary.passed++;
            } else {
              console.log(`❌ ${test.name}: FAILED (exit code: ${code})`);
              masterResults.summary.failed++;
              if (stderr) {
                console.log(`   Error: ${stderr.split('\n')[0]}`);
              }
            }

            resolve();
          }
        });

        testProcess.on('error', (error) => {
          if (!isResolved) {
            isResolved = true;
            clearTimeout(timeoutId);

            testResult.error = error.message;
            console.log(`💥 ${test.name}: ERROR - ${error.message}`);
            masterResults.summary.failed++;
            reject(error);
          }
        });
      });

    } catch (error) {
      testResult.error = error.message;
      console.log(`💥 ${test.name}: FAILED - ${error.message}`);
      masterResults.summary.failed++;
    }

    testResult.duration = Date.now() - testStartTime;
    console.log(`⏱️  Duration: ${formatDuration(testResult.duration)}`);

    // Check for screenshots
    if (fs.existsSync(CONFIG.screenshotDir)) {
      const screenshots = fs.readdirSync(CONFIG.screenshotDir)
        .filter(file => file.endsWith('.png'))
        .map(file => path.join(CONFIG.screenshotDir, file));

      testResult.screenshots = screenshots;
      masterResults.summary.screenshots += screenshots.length;
    }

    masterResults.tests.push(testResult);

    // Add delay between tests
    if (i < PRODUCTION_TESTS.length - 1) {
      console.log('⏳ Waiting 2 seconds before next test...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  masterResults.summary.duration = Date.now() - startTime;

  // Generate comprehensive report
  console.log('\n' + '='.repeat(80));
  console.log('🎯 PRODUCTION UI TEST SUITE RESULTS');
  console.log('='.repeat(80));

  console.log('\n📊 Summary:');
  console.log(`  Total Tests: ${masterResults.summary.total}`);
  console.log(`  ✅ Passed: ${masterResults.summary.passed}`);
  console.log(`  ❌ Failed: ${masterResults.summary.failed}`);
  console.log(`  📊 Success Rate: ${Math.round((masterResults.summary.passed / masterResults.summary.total) * 100)}%`);
  console.log(`  ⏱️  Total Duration: ${formatDuration(masterResults.summary.duration)}`);
  console.log(`  📸 Screenshots: ${masterResults.summary.screenshots}`);

  console.log('\n📋 Detailed Results:');
  masterResults.tests.forEach((test, index) => {
    console.log(`  ${index + 1}. ${test.success ? '✅' : '❌'} ${test.name}`);
    console.log(`     Duration: ${formatDuration(test.duration)}`);
    console.log(`     Screenshots: ${test.screenshots.length}`);
    if (test.error) {
      console.log(`     Error: ${test.error}`);
    }
  });

  if (masterResults.errors.length > 0) {
    console.log('\n⚠️  Pre-flight Issues:');
    masterResults.errors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error}`);
    });
  }

  // Save detailed results
  const reportPath = path.join(resultsDir, `production-test-report-${generateTimestamp()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(masterResults, null, 2));
  console.log(`\n📁 Detailed report saved: ${reportPath}`);

  // Check screenshot directory
  if (fs.existsSync(CONFIG.screenshotDir)) {
    const allScreenshots = fs.readdirSync(CONFIG.screenshotDir)
      .filter(file => file.endsWith('.png'));

    console.log(`\n📸 Screenshots Directory: ${CONFIG.screenshotDir}`);
    console.log(`   Total Screenshots: ${allScreenshots.length}`);

    if (allScreenshots.length > 0) {
      console.log('   Recent Screenshots:');
      allScreenshots.slice(-10).forEach(file => {
        console.log(`     - ${file}`);
      });
    }
  }

  // Final verdict
  const allTestsPassed = masterResults.summary.failed === 0;
  const criticalTestsPassed = masterResults.tests
    .filter(test => test.required)
    .every(test => test.success);

  console.log('\n' + '='.repeat(80));
  if (allTestsPassed) {
    console.log('🎉 ALL PRODUCTION TESTS PASSED!');
    console.log('✅ Production UI is ready for deployment');
    console.log('✅ All navigation visible, API integration working');
    console.log('✅ Real data flowing correctly through the system');
  } else if (criticalTestsPassed) {
    console.log('⚠️  SOME TESTS FAILED BUT CRITICAL TESTS PASSED');
    console.log('🔧 Production UI has minor issues but core functionality works');
  } else {
    console.log('❌ PRODUCTION TESTS FAILED');
    console.log('🚨 Critical issues found in production UI');
    console.log('🔧 Production deployment should be delayed until issues are resolved');
  }
  console.log('='.repeat(80));

  return allTestsPassed;
}

// Run the test suite
if (require.main === module) {
  runProductionTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Production test suite failed:', error);
      process.exit(1);
    });
}

module.exports = { runProductionTests, PRODUCTION_TESTS, CONFIG };
