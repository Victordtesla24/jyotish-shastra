#!/usr/bin/env node

import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

// Run npm test and capture output
console.log('Running npm test...');

exec('npm run test', (error, stdout, stderr) => {
  if (error) {
    console.error('Error running tests:', error);
    process.exit(1);
  }

  // Write raw output to file
  const outputPath = path.join(process.cwd(), 'user-docs', 'test-raw-output.txt');
  ensureDirExists(path.dirname(outputPath));
  fs.writeFileSync(outputPath, stdout);
  
  // Parse and format the output
  const formattedReport = formatTestOutput(stdout);
  
  // Write formatted report to file
  const reportPath = path.join(process.cwd(), 'user-docs', 'test-summary-report.md');
  fs.writeFileSync(reportPath, formattedReport);
  
  console.log(`\nTest report generated at: ${reportPath}`);
  console.log(`Raw test output saved at: ${outputPath}`);
  
  // Also print to console
  console.log('\n' + '='.repeat(80));
  console.log('TEST SUMMARY REPORT');
  console.log('='.repeat(80));
  console.log(formattedReport);
});

function ensureDirExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function formatTestOutput(output) {
  const lines = output.split('\n');
  const testSections = {
    'Unit Tests': [],
    'Integration Tests': [],
    'System Tests': [],
    'UI Tests': [],
    'Other Tests': []
  };
  
  const architectureLayers = {
    'API Gateway': [],
    'Client': [],
    'Data': [],
    'Service Layer': [],
    'Core Layer': [],
    'Calculations': [],
    'Analysis': [],
    'Reports': [],
    'Other': []
  };
  
  let currentSection = null;
  let currentSuite = null;
  let testResults = [];
  
  // Parse the test output
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Detect test suite/describe blocks
    if (line.includes('describe') || line.includes('Test Suite:') || 
        line.includes('PASS') || line.includes('FAIL')) {
      
      // Try to categorize the test
      const categorized = categorizeTestLine(line, lines[i + 1] || '');
      if (categorized) {
        if (categorized.section && categorized.testName) {
          testSections[categorized.section].push({
            suite: categorized.suite,
            name: categorized.testName,
            status: categorized.status,
            time: categorized.time,
            layer: categorized.layer
          });
          
          // Also organize by architecture layer
          if (architectureLayers[categorized.layer]) {
            architectureLayers[categorized.layer].push({
              section: categorized.section,
              suite: categorized.suite,
              name: categorized.testName,
              status: categorized.status,
              time: categorized.time
            });
          }
        }
      }
    }
  }
  
  // Generate markdown report
  let report = `# Test Summary Report\n\n`;
  report += `Generated on: ${new Date().toLocaleString()}\n\n`;
  
  // Test type breakdown table
  report += `## Test Type Breakdown\n\n`;
  report += `| Test Type | Total Tests | Passed | Failed | Skipped | Pending |\n`;
  report += `|------------|-------------|--------|--------|---------|----------|\n`;
  
  Object.entries(testSections).forEach(([section, tests]) => {
    const passed = tests.filter(t => t.status === 'passed').length;
    const failed = tests.filter(t => t.status === 'failed').length;
    const total = tests.length;
    report += `| ${section} | ${total} | ${passed} | ${failed} | 0 | 0 |\n`;
  });
  
  // Architecture layer breakdown
  report += `\n## Architecture Layer Breakdown\n\n`;
  report += `| Architecture Layer | Total Tests | Passed | Failed | Skipped |\n`;
  report += `|---------------------|--------------|--------|---------|----------|\n`;
  
  Object.entries(architectureLayers).forEach(([layer, tests]) => {
    const passed = tests.filter(t => t.status === 'passed').length;
    const failed = tests.filter(t => t.status === 'failed').length;
    const total = tests.length;
    if (total > 0) {
      report += `| ${layer} | ${total} | ${passed} | ${failed} | 0 |\n`;
    }
  });
  
  // Detailed breakdown by test type
  report += `\n## Detailed Test Results\n\n`;
  
  Object.entries(testSections).forEach(([section, tests]) => {
    if (tests.length === 0) return;
    
    report += `### ${section}\n\n`;
    
    // Group by suite within each section
    const groupedBySuite = {};
    tests.forEach(test => {
      if (!groupedBySuite[test.suite]) {
        groupedBySuite[test.suite] = [];
      }
      groupedBySuite[test.suite].push(test);
    });
    
    Object.entries(groupedBySuite).forEach(([suite, suiteTests]) => {
      report += `#### ${suite}\n\n`;
      report += `| Test Name | Status | Time | Layer |\n`;
      report += `|-----------|--------|------|-------|\n`;
      
      suiteTests.forEach(test => {
        const statusIcon = test.status === 'passed' ? '✅' : 
                          test.status === 'failed' ? '❌' : 
                          test.status === 'pending' ? '⏳' : '❓';
        const timeStr = test.time ? `(${test.time})` : '';
        report += `| ${test.name} | ${statusIcon} | ${timeStr} | ${test.layer} |\n`;
      });
      
      report += `\n`;
    });
  });
  
  // Architecture layer detailed view
  report += `\n## Architecture Layer Detailed View\n\n`;
  
  Object.entries(architectureLayers).forEach(([layer, tests]) => {
    if (tests.length === 0) return;
    
    report += `### ${layer}\n\n`;
    report += `| Test Suite | Test Name | Test Type | Status | Time |\n`;
    report += `|------------|-----------|-----------|--------|------|\n`;
    
    tests.forEach(test => {
      const statusIcon = test.status === 'passed' ? '✅' : 
                        test.status === 'failed' ? '❌' : 
                        test.status === 'pending' ? '⏳' : '❓';
      const timeStr = test.time || '';
      report += `| ${test.suite} | ${test.name} | ${test.section} | ${statusIcon} | ${timeStr} |\n`;
    });
    
    report += `\n`;
  });
  
  // Test execution summary
  const totalTests = Object.values(testSections).flat().length;
  const totalPassed = Object.values(testSections).flat().filter(t => t.status === 'passed').length;
  const totalFailed = Object.values(testSections).flat().filter(t => t.status === 'failed').length;
  
  report += `## Execution Summary\n\n`;
  report += `- **Total Tests**: ${totalTests}\n`;
  report += `- **Passed**: ${totalPassed}\n`;
  report += `- **Failed**: ${totalFailed}\n`;
  report += `- **Success Rate**: ${totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(2) : 0}%\n`;
  
  return report;
}

function categorizeTestLine(line, nextLine) {
  const lowerLine = line.toLowerCase();
  const lowerNextLine = nextLine.toLowerCase();
  
  // Determine test section (Unit, Integration, System, UI)
  let section = 'Other Tests';
  if (lowerLine.includes('unit') || line.includes('/unit/')) section = 'Unit Tests';
  else if (lowerLine.includes('integration') || line.includes('/integration/')) section = 'Integration Tests';
  else if (lowerLine.includes('system') || line.includes('/system/')) section = 'System Tests';
  else if (lowerLine.includes('ui') || line.includes('/ui/') || lowerLine.includes('cypress')) section = 'UI Tests';
  
  // Determine architecture layer
  let layer = 'Other';
  if (lowerLine.includes('api') || lowerLine.includes('endpoint') || lowerLine.includes('controller')) layer = 'API Gateway';
  else if (lowerLine.includes('client') || lowerLine.includes('component') || lowerLine.includes('ui')) layer = 'Client';
  else if (lowerLine.includes('data') || lowerLine.includes('model') || lowerLine.includes('mongoose')) layer = 'Data';
  else if (lowerLine.includes('service') || lowerLine.includes('service.js')) layer = 'Service Layer';
  else if (lowerLine.includes('core') || lowerLine.includes('/core/')) layer = 'Core Layer';
  else if (lowerLine.includes('calculation') || lowerLine.includes('calculator')) layer = 'Calculations';
  else if (lowerLine.includes('analysis') || lowerLine.includes('analyzer')) layer = 'Analysis';
  else if (lowerLine.includes('report') || lowerLine.includes('synthesis')) layer = 'Reports';
  
  // Extract test name and status
  const match = line.match(/(✓|✗|✅|❌|✔|×)?\s*(should|it)\s+(.+)/);
  if (match) {
    const testName = match[3].split('(')[0].trim();
    const timeMatch = line.match(/\((\d+\s*ms)\)/);
    const time = timeMatch ? timeMatch[1] : '';
    
    // Extract suite name from context
    let suite = 'Unknown Suite';
    if (line.includes('/api/')) suite = 'API Tests';
    else if (line.includes('/services/')) suite = 'Service Tests';
    else if (line.includes('/calculations/')) suite = 'Calculation Tests';
    else if (line.includes('/core/')) suite = 'Core Tests';
    else if (line.includes('/unit/')) suite = 'Unit Tests';
    else if (line.includes('/integration/')) suite = 'Integration Tests';
    
    return {
      section,
      suite,
      testName,
      status: lowerLine.includes('✓') || lowerLine.includes('✅') || lowerLine.includes('✔') ? 'passed' : 'failed',
      time,
      layer
    };
  }
  
  return null;
}
