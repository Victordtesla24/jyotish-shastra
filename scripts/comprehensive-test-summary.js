#!/usr/bin/env node

import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Generating Comprehensive Test Summary...');

// First, analyze all test files to get complete coverage
function analyzeTestFiles() {
  const testDir = path.join(__dirname, '..', 'tests');
  const allTests = [];
  
  function walkDirectory(dir, prefix = '') {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        walkDirectory(fullPath, prefix + item + '/');
      } else if (item.endsWith('.test.js')) {
        analyzeTestFile(fullPath, prefix + item);
      }
    }
  }
  
  function analyzeTestFile(filePath, fileName) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      
      // Extract describe blocks
      const describeMatches = content.match(/describe\(['"`]([^'"`]+)['"`]/g) || [];
      const testMatches = content.match(/(it|test)\(['"`]([^'"`]+)['"`]/g) || [];
      const skipMatches = content.match(/(it|test)\.skip\(['"`]([^'"`]+)['"`]/g) || [];
      const pendingMatches = content.match(/(it|test)\(['"`]([^'"`]+)['"`]\s*\)\/\/\s*TODO|FIXME/g) || [];
      
      // Determine test type and layer
      const testType = determineTestType(filePath);
      const architectureLayer = determineArchitectureLayer(filePath, fileName);
      
      const baseSuiteName = describeMatches[0] ? 
        describeMatches[0].match(/['"`]([^'"`]+)['"`]/)[1] : 
        path.basename(fileName, '.test.js');
      
      // Process all tests
      testMatches.forEach(match => {
        const testName = match.match(/['"`]([^'"`]+)['"`]/)[1];
        allTests.push({
          filePath,
          fileName,
          testType,
          architectureLayer,
          suite: baseSuiteName,
          testName,
          status: 'unknown',
          time: '',
          category: 'active'
        });
      });
      
      // Process skipped tests
      skipMatches.forEach(match => {
        const testName = match.match(/['"`]([^'"`]+)['"`]/)[1];
        allTests.push({
          filePath,
          fileName,
          testType,
          architectureLayer,
          suite: baseSuiteName,
          testName: testName + ' (SKIPPED)',
          status: 'skipped',
          time: '',
          category: 'skipped'
        });
      });
      
      // Process TODO/pending tests
      pendingMatches.forEach(match => {
        const testName = match.match(/['"`]([^'"`]+)['"`]/)[1];
        allTests.push({
          filePath,
          fileName,
          testType,
          architectureLayer,
          suite: baseSuiteName,
          testName: testName + ' (PENDING)',
          status: 'pending',
          time: '',
          category: 'pending'
        });
      });
      
    } catch (err) {
      console.error(`Error analyzing ${filePath}:`, err.message);
    }
  }
  
  function determineTestType(filePath) {
    if (filePath.includes('/unit/')) return 'Unit Tests';
    if (filePath.includes('/integration/')) return 'Integration Tests';
    if (filePath.includes('/system/')) return 'System Tests';
    if (filePath.includes('/ui/')) return 'UI Tests';
    return 'Other Tests';
  }
  
  function determineArchitectureLayer(filePath, fileName) {
    const lowerPath = filePath.toLowerCase();
    const lowerName = fileName.toLowerCase();
    
    if (lowerPath.includes('/api/') || lowerName.includes('controller') || lowerName.includes('endpoint')) return 'API Gateway';
    if (lowerPath.includes('/ui/') || lowerName.includes('form') || lowerName.includes('component')) return 'Client';
    if (lowerName.includes('model') || lowerName.includes('mongoose') || lowerName.includes('data')) return 'Data';
    if (lowerPath.includes('/services/') || lowerName.includes('service')) return 'Service Layer';
    if (lowerPath.includes('/core/') || lowerName.includes('core')) return 'Core Layer';
    if (lowerPath.includes('/calculations/') || lowerName.includes('calculator')) return 'Calculations';
    if (lowerName.includes('analysis') || lowerName.includes('analyzer')) return 'Analysis';
    if (lowerName.includes('report') || lowerName.includes('synthesis')) return 'Reports';
    return 'Other';
  }
  
  walkDirectory(testDir);
  return allTests;
}

// Run the actual tests and update status
function runTestsAndUpdateStatus(allTests) {
  return new Promise((resolve) => {
    exec('npm run test', (error, stdout, stderr) => {
      // Parse test results to update status
      const lines = stdout.split('\n');
      
      lines.forEach(line => {
        // Look for test results with checkmarks or crosses
        const match = line.match(/(✓|✗|✅|❌|✔|×)\s+(should|it)\s+(.+)/);
        if (match) {
          const testName = match[3].split('(')[0].trim();
          const timeMatch = line.match(/\((\d+\s*ms)\)/);
          const time = timeMatch ? timeMatch[1] : '';
          const passed = line.match(/(✓|✅|✔)/);
          
          // Find matching test and update status
          const test = allTests.find(t => 
            t.testName.toLowerCase().replace(/\s+\(.*\)$/, '') === testName.toLowerCase()
          );
          
          if (test) {
            test.status = passed ? 'passed' : 'failed';
            test.time = time;
          } else {
            // Add new test found during execution
            const testType = determineTestTypeFromOutput(line);
            const architectureLayer = determineLayerFromOutput(line);
            
            allTests.push({
              filePath: 'unknown',
              fileName: 'unknown',
              testType,
              architectureLayer,
              suite: 'Execution Results',
              testName,
              status: passed ? 'passed' : 'failed',
              time,
              category: 'active'
            });
          }
        }
      });
      
      resolve(allTests);
    });
  });
}

function determineTestTypeFromOutput(line) {
  const lowerLine = line.toLowerCase();
  if (line.includes('/unit')) return 'Unit Tests';
  if (line.includes('/integration')) return 'Integration Tests';
  if (line.includes('/system')) return 'System Tests';
  if (line.includes('/ui')) return 'UI Tests';
  return 'Other Tests';
}

function determineLayerFromOutput(line) {
  const lowerLine = line.toLowerCase();
  if (lowerLine.includes('api') || lowerLine.includes('endpoint')) return 'API Gateway';
  if (lowerLine.includes('component') || lowerLine.includes('form')) return 'Client';
  if (lowerLine.includes('service')) return 'Service Layer';
  if (lowerLine.includes('calculation') || lowerLine.includes('calculator')) return 'Calculations';
  if (lowerLine.includes('analysis')) return 'Analysis';
  return 'Other';
}

// Generate comprehensive report
function generateComprehensiveReport(allTests) {
  // Group tests by type and layer
  const testTypes = {};
  const architectureLayers = {};
  
  allTests.forEach(test => {
    if (!testTypes[test.testType]) {
      testTypes[test.testType] = [];
    }
    testTypes[test.testType].push(test);
    
    if (!architectureLayers[test.architectureLayer]) {
      architectureLayers[test.architectureLayer] = [];
    }
    architectureLayers[test.architectureLayer].push(test);
  });
  
  let report = `# Comprehensive Test Summary Report\n\n`;
  report += `Generated on: ${new Date().toLocaleString()}\n`;
  report += `Total Tests Found: ${allTests.length}\n\n`;
  
  // Executive Summary Table
  report += `## Executive Summary\n\n`;
  report += `| Category | Total | Passed | Failed | Skipped | Pending | Success Rate |\n`;
  report += `|----------|-------|--------|--------|---------|---------|--------------|\n`;
  
  Object.entries(testTypes).forEach(([type, tests]) => {
    const passed = tests.filter(t => t.status === 'passed').length;
    const failed = tests.filter(t => t.status === 'failed').length;
    const skipped = tests.filter(t => t.status === 'skipped').length;
    const pending = tests.filter(t => t.status === 'pending').length;
    const total = tests.length;
    const successRate = (passed + failed) > 0 ? ((passed / (passed + failed)) * 100).toFixed(1) : '0.0';
    
    report += `| ${type} | ${total} | ${passed} | ${failed} | ${skipped} | ${pending} | ${successRate}% |\n`;
  });
  
  // Architecture Layer Summary
  report += `\n## Architecture Layer Summary\n\n`;
  report += `| Architecture Layer | Total | Passed | Failed | Skipped | Pending | Coverage |\n`;
  report += `|---------------------|-------|--------|--------|---------|---------|----------|\n`;
  
  Object.entries(architectureLayers).forEach(([layer, tests]) => {
    const passed = tests.filter(t => t.status === 'passed').length;
    const failed = tests.filter(t => t.status === 'failed').length;
    const skipped = tests.filter(t => t.status === 'skipped').length;
    const pending = tests.filter(t => t.status === 'pending').length;
    const total = tests.length;
    const executed = passed + failed;
    const coverage = total > 0 ? ((executed / total) * 100).toFixed(1) : '0.0';
    
    report += `| ${layer} | ${total} | ${passed} | ${failed} | ${skipped} | ${pending} | ${coverage}% |\n`;
  });
  
  // Detailed breakdown by test type
  report += `\n## Detailed Test Results by Type\n\n`;
  
  Object.entries(testTypes).forEach(([type, tests]) => {
    if (tests.length === 0) return;
    
    report += `### ${type}\n\n`;
    
    // Group by suite
    const groupedBySuite = {};
    tests.forEach(test => {
      if (!groupedBySuite[test.suite]) {
        groupedBySuite[test.suite] = [];
      }
      groupedBySuite[test.suite].push(test);
    });
    
    Object.entries(groupedBySuite).forEach(([suite, suiteTests]) => {
      report += `#### ${suite}\n\n`;
      report += `| Test Name | Status | Time | Layer | File |\n`;
      report += `|-----------|--------|------|-------|------|\n`;
      
      suiteTests.forEach(test => {
        const statusIcon = test.status === 'passed' ? '✅' : 
                          test.status === 'failed' ? '❌' : 
                          test.status === 'skipped' ? '⏭️' : 
                          test.status === 'pending' ? '⏳' : '❓';
        const timeStr = test.time || '';
        const fileName = path.basename(test.fileName);
        
        report += `| ${test.testName} | ${statusIcon} ${test.status} | ${timeStr} | ${test.architectureLayer} | ${fileName} |\n`;
      });
      
      report += `\n`;
    });
  });
  
  // Detailed breakdown by architecture layer
  report += `\n## Detailed Architecture Layer Analysis\n\n`;
  
  Object.entries(architectureLayers).forEach(([layer, tests]) => {
    if (tests.length === 0) return;
    
    report += `### ${layer}\n\n`;
    report += `| Test Suite | Test Name | Test Type | Status | Time | File |\n`;
    report += `|------------|-----------|-----------|--------|------|------|\n`;
    
    tests.forEach(test => {
      const statusIcon = test.status === 'passed' ? '✅' : 
                        test.status === 'failed' ? '❌' : 
                        test.status === 'skipped' ? '⏭️' : 
                        test.status === 'pending' ? '⏳' : '❓';
      const timeStr = test.time || '';
      const fileName = path.basename(test.fileName);
      const suiteName = test.suite.length > 50 ? test.suite.substring(0, 47) + '...' : test.suite;
      
      report += `| ${suiteName} | ${test.testName} | ${test.testType} | ${statusIcon} | ${timeStr} | ${fileName} |\n`;
    });
    
    report += `\n`;
  });
  
  // Test Categories Summary
  report += `\n## Test Categories Summary\n\n`;
  
  const categories = {
    Active: allTests.filter(t => t.category === 'active'),
    Skipped: allTests.filter(t => t.category === 'skipped'),
    Pending: allTests.filter(t => t.category === 'pending'),
    Unknown: allTests.filter(t => t.status === 'unknown')
  };
  
  Object.entries(categories).forEach(([category, tests]) => {
    if (tests.length === 0) return;
    
    report += `### ${category} Tests (${tests.length})\n\n`;
    
    if (category === 'Unknown') {
      report += `These tests were discovered in the test files but weren't executed or have unknown status.\n\n`;
    }
    
    report += `| File | Test Name | Test Type | Layer |\n`;
    report += `|------|-----------|-----------|-------|\n`;
    
    tests.forEach(test => {
      const fileName = path.basename(test.fileName);
      report += `| ${fileName} | ${test.testName} | ${test.testType} | ${test.architectureLayer} |\n`;
    });
    
    report += `\n`;
  });
  
  // Final Summary
  const totalTests = allTests.length;
  const totalPassed = allTests.filter(t => t.status === 'passed').length;
  const totalFailed = allTests.filter(t => t.status === 'failed').length;
  const totalSkipped = allTests.filter(t => t.status === 'skipped').length;
  const totalPending = allTests.filter(t => t.status === 'pending').length;
  const totalUnknown = allTests.filter(t => t.status === 'unknown').length;
  
  report += `## Final Summary\n\n`;
  report += `- **Total Tests**: ${totalTests}\n`;
  report += `- **Passed**: ${totalPassed}\n`;
  report += `- **Failed**: ${totalFailed}\n`;
  report += `- **Skipped**: ${totalSkipped}\n`;
  report += `- **Pending**: ${totalPending}\n`;
  report += `- **Status Unknown**: ${totalUnknown}\n`;
  
  const executedTests = totalPassed + totalFailed;
  const successRate = executedTests > 0 ? ((totalPassed / executedTests) * 100).toFixed(2) : '0.00';
  const executionRate = totalTests > 0 ? ((executedTests / totalTests) * 100).toFixed(2) : '0.00';
  
  report += `- **Success Rate (of executed)**: ${successRate}%\n`;
  report += `- **Test Execution Rate**: ${executionRate}%\n`;
  
  if (totalFailed > 0) {
    report += `\n### Failed Tests Summary\n\n`;
    const failedTests = allTests.filter(t => t.status === 'failed');
    failedTests.forEach(test => {
      report += `- ❌ ${test.testName} (${test.testType} - ${test.architectureLayer})\n`;
    });
  }
  
  return report;
}

// Main execution
async function main() {
  try {
    console.log('Analyzing test files...');
    const allTests = analyzeTestFiles();
    console.log(`Found ${allTests.length} tests in codebase`);
    
    console.log('Running tests to get execution status...');
    const updatedTests = await runTestsAndUpdateStatus(allTests);
    
    console.log('Generating report...');
    const report = generateComprehensiveReport(updatedTests);
    
    // Ensure user-docs directory exists
    const userDocsDir = path.join(__dirname, '..', 'user-docs');
    if (!fs.existsSync(userDocsDir)) {
      fs.mkdirSync(userDocsDir, { recursive: true });
    }
    
    // Write comprehensive report
    const reportPath = path.join(userDocsDir, 'comprehensive-test-summary.md');
    fs.writeFileSync(reportPath, report);
    
    console.log(`\n✅ Comprehensive test report generated: ${reportPath}`);
    console.log(`📊 Total tests analyzed: ${updatedTests.length}`);
    console.log(`✅ Passed: ${updatedTests.filter(t => t.status === 'passed').length}`);
    console.log(`❌ Failed: ${updatedTests.filter(t => t.status === 'failed').length}`);
    console.log(`⏭️ Skipped: ${updatedTests.filter(t => t.status === 'skipped').length}`);
    console.log(`⏳ Pending: ${updatedTests.filter(t => t.status === 'pending').length}`);
    
  } catch (error) {
    console.error('Error generating test summary:', error);
    process.exit(1);
  }
}

main();
