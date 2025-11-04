#!/usr/bin/env node

/**
 * Comprehensive Test Runner for Vedic Astrology Application
 * 
 * This script orchestrates the complete testing suite including:
 * - Backend unit and integration tests
 * - Frontend component tests
 * - End-to-end Cypress tests
 * - Performance testing
 * - Visual regression testing
 */

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class ComprehensiveTestRunner {
  constructor() {
    this.results = {
      unit: { passed: 0, failed: 0, time: 0, details: [] },
      integration: { passed: 0, failed: 0, time: 0, details: [] },
      component: { passed: 0, failed: 0, time: 0, details: [] },
      e2e: { passed: 0, failed: 0, time: 0, details: [] },
      performance: { passed: 0, failed: 0, time: 0, details: [] },
      visual: { passed: 0, failed: 0, time: 0, details: [] }
    };
    
    this.startTime = Date.now();
    this.reportDir = path.join(__dirname, '../test-results');
    this.ensureReportDir();
  }

  ensureReportDir() {
    if (!fs.existsSync(this.reportDir)) {
      fs.mkdirSync(this.reportDir, { recursive: true });
    }
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${type.toUpperCase()}]`;
    console.log(`${prefix} ${message}`);
    
    // Also log to file
    const logFile = path.join(this.reportDir, 'test-run.log');
    fs.appendFileSync(logFile, `${prefix} ${message}\n`);
  }

  async runCommand(command, args = [], options = {}) {
    return new Promise((resolve, reject) => {
      this.log(`Running: ${command} ${args.join(' ')}`);
      
      const process = spawn(command, args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        ...options
      });

      let stdout = '';
      let stderr = '';

      process.stdout.on('data', (data) => {
        stdout += data.toString();
        this.log(data.toString().trim(), 'stdout');
      });

      process.stderr.on('data', (data) => {
        stderr += data.toString();
        this.log(data.toString().trim(), 'stderr');
      });

      process.on('close', (code) => {
        this.log(`Process exited with code: ${code}`);
        resolve({ code, stdout, stderr });
      });

      process.on('error', (error) => {
        this.log(`Process error: ${error.message}`, 'error');
        reject(error);
      });
    });
  }

  async runUnitTests() {
    this.log('\n=== RUNNING UNIT TESTS ===', 'info');
    const startTime = Date.now();
    
    try {
      // Backend unit tests
      const result = await this.runCommand('npm', ['test', '--', '--testPathPattern=unit'], {
        cwd: process.cwd()
      });

      // Parse Jest output
      const output = result.stdout;
      const passedMatch = output.match(/(\d+) passing/);
      const failedMatch = output.match(/(\d+) failing/);
      
      this.results.unit.passed = passedMatch ? parseInt(passedMatch[1]) : 0;
      this.results.unit.failed = failedMatch ? parseInt(failedMatch[1]) : 0;
      this.results.unit.time = Date.now() - startTime;
      
      this.log(`Unit Tests: ${this.results.unit.passed} passed, ${this.results.unit.failed} failed`);
      
      return this.results.unit.failed === 0;
    } catch (error) {
      this.log(`Unit tests failed: ${error.message}`, 'error');
      this.results.unit.failed++;
      return false;
    }
  }

  async runIntegrationTests() {
    this.log('\n=== RUNNING INTEGRATION TESTS ===', 'info');
    const startTime = Date.now();
    
    try {
      // Integration tests
      const result = await this.runCommand('npm', ['test', '--', '--testPathPattern=integration'], {
        cwd: process.cwd()
      });

      const output = result.stdout;
      const passedMatch = output.match(/(\d+) passing/);
      const failedMatch = output.match(/(\d+) failing/);
      
      this.results.integration.passed = passedMatch ? parseInt(passedMatch[1]) : 0;
      this.results.integration.failed = failedMatch ? parseInt(failedMatch[1]) : 0;
      this.results.integration.time = Date.now() - startTime;
      
      this.log(`Integration Tests: ${this.results.integration.passed} passed, ${this.results.integration.failed} failed`);
      
      return this.results.integration.failed === 0;
    } catch (error) {
      this.log(`Integration tests failed: ${error.message}`, 'error');
      this.results.integration.failed++;
      return false;
    }
  }

  async runComponentTests() {
    this.log('\n=== RUNNING COMPONENT TESTS ===', 'info');
    const startTime = Date.now();
    
    try {
      // UI component tests
      const result = await this.runCommand('npm', ['run', 'test:ui'], {
        cwd: process.cwd()
      });

      this.results.component.time = Date.now() - startTime;
      
      // Simple parsing for now - could be improved with better test output format
      if (result.stdout.includes('PASS')) {
        this.results.component.passed = 1;
        this.log('Component Tests: PASSED');
      } else {
        this.results.component.failed = 1;
        this.log('Component Tests: FAILED');
      }
      
      return this.results.component.failed === 0;
    } catch (error) {
      this.log(`Component tests failed: ${error.message}`, 'error');
      this.results.component.failed++;
      return false;
    }
  }

  async runE2ETests() {
    this.log('\n=== RUNNING END-TO-END TESTS ===', 'info');
    const startTime = Date.now();
    
    try {
      // First check if servers are running
      await this.checkServers();
      
      // Run Cypress tests
      const result = await this.runCommand('npm', ['run', 'test:e2e'], {
        cwd: process.cwd(),
        env: {
          ...process.env,
          CYPRESS_baseUrl: 'http://localhost:3000',
          CYPRESS_apiUrl: 'http://localhost:3001'
        }
      });

      this.results.e2e.time = Date.now() - startTime;
      
      // Parse Cypress output
      if (result.stdout.includes('All specs passed')) {
        this.results.e2e.passed = 1;
        this.log('E2E Tests: PASSED');
      } else {
        this.results.e2e.failed = 1;
        this.log('E2E Tests: FAILED');
      }
      
      return this.results.e2e.failed === 0;
    } catch (error) {
      this.log(`E2E tests failed: ${error.message}`, 'error');
      this.results.e2e.failed++;
      return false;
    }
  }

  async checkServers() {
    this.log('Checking server availability...');
    
    // Check both frontend and backend servers
    const frontendCheck = await this.runCommand('curl', ['-s', 'http://localhost:3000']);
    const backendCheck = await this.runCommand('curl', ['-s', 'http://localhost:3001/health']);
    
    if (frontendCheck.code !== 0 || backendCheck.code !== 0) {
      throw new Error('Servers are not running. Please start both frontend (port 3000) and backend (port 3001) servers.');
    }
    
    this.log('Servers are running ✓');
  }

  async runPerformanceTests() {
    this.log('\n=== RUNNING PERFORMANCE TESTS ===', 'info');
    const startTime = Date.now();
    
    try {
      // Run existing performance test
      const result = await this.runCommand('node', ['scripts/benchmark-pipeline.js'], {
        cwd: process.cwd()
      });

      this.results.performance.time = Date.now() - startTime;
      
      // Simple check - could be enhanced with proper performance metrics
      if (result.stdout.includes('Performance benchmarks completed')) {
        this.results.performance.passed = 1;
        this.log('Performance Tests: PASSED');
      } else {
        this.results.performance.failed = 1;
        this.log('Performance Tests: FAILED');
      }
      
      return this.results.performance.failed === 0;
    } catch (error) {
      this.log(`Performance tests failed: ${error.message}`, 'error');
      this.results.performance.failed++;
      return false;
    }
  }

  async runVisualRegressionTests() {
    this.log('\n=== RUNNING VISUAL REGRESSION TESTS ===', 'info');
    const startTime = Date.now();
    
    try {
      // Run chart validation tests
      const result = await this.runCommand('npm', ['run', 'validate:chart'], {
        cwd: process.cwd()
      });

      this.results.visual.time = Date.now() - startTime;
      
      if (result.stdout.includes('Chart validation passed')) {
        this.results.visual.passed = 1;
        this.log('Visual Regression Tests: PASSED');
      } else {
        this.results.visual.failed = 1;
        this.log('Visual Regression Tests: FAILED');
      }
      
      return this.results.visual.failed === 0;
    } catch (error) {
      this.log(`Visual regression tests failed: ${error.message}`, 'error');
      this.results.visual.failed++;
      return false;
    }
  }

  async generateReport() {
    const totalTime = Date.now() - this.startTime;
    const totalPassed = Object.values(this.results).reduce((sum, cat) => sum + cat.passed, 0);
    const totalFailed = Object.values(this.results).reduce((sum, cat) => sum + cat.failed, 0);
    
    const report = {
      summary: {
        totalPassed,
        totalFailed,
        totalTime,
        successRate: totalPassed > 0 ? ((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(2) + '%' : '0%'
      },
      categories: this.results,
      generatedAt: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    };

    // Save detailed report
    const reportFile = path.join(this.reportDir, 'comprehensive-test-report.json');
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

    // Generate HTML report summary
    const htmlReport = this.generateHTMLReport(report);
    const htmlFile = path.join(this.reportDir, 'test-report.html');
    fs.writeFileSync(htmlFile, htmlReport);

    // Generate console summary
    this.generateConsoleSummary(report);

    return report;
  }

  generateHTMLReport(report) {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Vedic Astrology App - Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; color: #333; }
        .summary { display: flex; justify-content: space-around; margin: 20px 0; }
        .metric { text-align: center; padding: 10px; background: #f8f9fa; border-radius: 4px; }
        .metric h3 { margin: 0; color: #666; }
        .metric .value { font-size: 2em; font-weight: bold; margin: 5px 0; }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .categories { margin-top: 30px; }
        .category { margin: 10px 0; padding: 15px; background: #f8f9fa; border-radius: 4px; }
        .category-name { font-weight: bold; margin-bottom: 10px; }
        .results { display: flex; gap: 20px; }
        .time { color: #666; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔮 Vedic Astrology Application</h1>
            <h2>Comprehensive Test Report</h2>
            <p>Generated at: ${report.generatedAt}</p>
        </div>
        
        <div class="summary">
            <div class="metric">
                <h3>Total Tests</h3>
                <div class="value">${report.summary.totalPassed + report.summary.totalFailed}</div>
            </div>
            <div class="metric">
                <h3>Passed</h3>
                <div class="value passed">${report.summary.totalPassed}</div>
            </div>
            <div class="metric">
                <h3>Failed</h3>
                <div class="value failed">${report.summary.totalFailed}</div>
            </div>
            <div class="metric">
                <h3>Success Rate</h3>
                <div class="value">${report.summary.successRate}</div>
            </div>
            <div class="metric">
                <h3>Total Time</h3>
                <div class="value">${(report.summary.totalTime / 1000).toFixed(1)}s</div>
            </div>
        </div>
        
        <div class="categories">
            <h3>Test Categories</h3>
            ${Object.entries(report.categories).map(([name, results]) => `
                <div class="category">
                    <div class="category-name">${name.charAt(0).toUpperCase() + name.slice(1)} Tests</div>
                    <div class="results">
                        <span class="passed">✓ ${results.passed} passed</span>
                        <span class="failed">✗ ${results.failed} failed</span>
                        <span class="time">Time: ${(results.time / 1000).toFixed(1)}s</span>
                    </div>
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>`;
  }

  generateConsoleSummary(report) {
    console.log('\n' + '='.repeat(80));
    console.log('🔮 COMPREHENSIVE TEST REPORT - VEDIC ASTROLOGY APPLICATION');
    console.log('='.repeat(80));
    console.log(`\n📊 SUMMARY:`);
    console.log(`   Total Tests: ${report.summary.totalPassed + report.summary.totalFailed}`);
    console.log(`   ✅ Passed: ${report.summary.totalPassed}`);
    console.log(`   ❌ Failed: ${report.summary.totalFailed}`);
    console.log(`   📈 Success Rate: ${report.summary.successRate}`);
    console.log(`   ⏱️  Total Time: ${(report.summary.totalTime / 1000).toFixed(1)}s`);
    
    console.log(`\n📋 CATEGORY BREAKDOWN:`);
    Object.entries(report.categories).forEach(([name, results]) => {
      const status = results.failed === 0 ? '✅' : '❌';
      console.log(`   ${status} ${name.charAt(0).toUpperCase() + name.slice(1)}: ${results.passed} passed, ${results.failed} failed (${(results.time / 1000).toFixed(1)}s)`);
    });
    
    console.log('\n📄 Detailed reports saved to:');
    console.log(`   📄 JSON: ${path.join(this.reportDir, 'comprehensive-test-report.json')}`);
    console.log(`   🌐 HTML: ${path.join(this.reportDir, 'test-report.html')}`);
    console.log(`   📋 Logs: ${path.join(this.reportDir, 'test-run.log')}`);
    
    console.log('\n' + '='.repeat(80));
  }

  async runAllTests() {
    try {
      this.log('🚀 Starting comprehensive test suite for Vedic Astrology Application');
      
      // Run tests in sequence to avoid conflicts
      const testSuite = [
        { name: 'unit', fn: () => this.runUnitTests() },
        { name: 'integration', fn: () => this.runIntegrationTests() },
        { name: 'component', fn: () => this.runComponentTests() },
        { name: 'performance', fn: () => this.runPerformanceTests() },
        { name: 'visual', fn: () => this.runVisualRegressionTests() }
      ];
      
      // Run core tests first
      for (const test of testSuite) {
        await test.fn();
      }
      
      // E2E tests last (servers must be running)
      await this.runE2ETests();
      
      // Generate final report
      const report = await this.generateReport();
      
      // Exit with appropriate code
      process.exit(report.summary.totalFailed > 0 ? 1 : 0);
      
    } catch (error) {
      this.log(`Test suite failed: ${error.message}`, 'error');
      process.exit(1);
    }
  }
}

// Run the test suite
if (require.main === module) {
  const runner = new ComprehensiveTestRunner();
  runner.runAllTests();
}

module.exports = ComprehensiveTestRunner;
