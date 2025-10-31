#!/usr/bin/env node

import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Running test summary generator...');

// Run npm test and capture output
exec('npm run test', (error, stdout, stderr) => {
  // Write raw output to file
  const outputPath = path.join(process.cwd(), 'user-docs', 'test-raw-output.txt');
  const userDocsDir = path.dirname(outputPath);
  
  // Ensure user-docs directory exists
  if (!fs.existsSync(userDocsDir)) {
    fs.mkdirSync(userDocsDir, { recursive: true });
  }
  
  fs.writeFileSync(outputPath, stdout);
  
  // Parse and format the output
  const formattedReport = formatTestOutput(stdout);
  
  // Write formatted report to file
  const reportPath = path.join(process.cwd(), 'user-docs', 'test-summary-report.md');
  fs.writeFileSync(reportPath, formattedReport);
  
  console.log(`\nTest report generated at: ${reportPath}`);
  console.log(`Raw test output saved at: ${outputPath}`);
  
  // Display summary to console
  console.log('\n' + '='.repeat(60));
  console.log('TEST SUMMARY REPORT');
  console.log('='.repeat(60));
  console.log(formattedReport);
});

function formatTestOutput(output) {
  const lines = output.split('\n');
  const testTypes = {
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
  
  // Parse the test output
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Look for test result lines with checkmarks or crosses
    if (line.match(/[✓✗✅❌✔×]\s*(should|it)/)) {
      // Extract test name and status
      const testMatch = line.match(/([✓✗✅❌✔×])\s*(should|it)\s+(.+)/);
      if (testMatch) {
        const statusIcon = testMatch[1];
        const testName = testMatch[3].split('(')[0].trim();
        const timeMatch = line.match(/\((\d+\s*ms)\)/);
        const time = timeMatch ? timeMatch[1] : '';
        const status = (statusIcon === '✓' || statusIcon === '✅' || statusIcon === '✔') ? 'passed' : 'failed';
        
        // Determine test type
        let testType = 'Other Tests';
        let architectureLayer = 'Other';
        
        // Try to determine from line content
        const lowerLine = line.toLowerCase();
        if (lowerLine.includes('unit') || line.includes('/unit/')) {
          testType = 'Unit Tests';
        } else if (lowerLine.includes('integration') || line.includes('/integration/')) {
          testType = 'Integration Tests';
        } else if (lowerLine.includes('system') || line.includes('/system/')) {
          testType = 'System Tests';
        } else if (lowerLine.includes('ui') || lowerLine.includes('cypress')) {
          testType = 'UI Tests';
        }
        
        // Determine architecture layer
        if (lowerLine.includes('api') || lowerLine.includes('endpoint') || lowerLine.includes('controller')) {
          architectureLayer = 'API Gateway';
        } else if (lowerLine.includes('component') || lowerLine.includes('form')) {
          architectureLayer = 'Client';
        } else if (lowerLine.includes('service')) {
          architectureLayer = 'Service Layer';
        } else if (lowerLine.includes('calculation') || lowerLine.includes('calculator')) {
          architectureLayer = 'Calculations';
        } else if (lowerLine.includes('analysis') || lowerLine.includes('analyzer')) {
          architectureLayer = 'Analysis';
        } else if (lowerLine.includes('core') || lowerLine.includes('/core/')) {
          architectureLayer = 'Core Layer';
        } else if (lowerLine.includes('report') || lowerLine.includes('synthesis')) {
          architectureLayer = 'Reports';
        }
        
        // Add to appropriate arrays
        if (testTypes[testType]) {
          testTypes[testType].push({
            name: testName,
            status: status,
            time: time,
            layer: architectureLayer
          });
        }
        
        if (architectureLayers[architectureLayer]) {
          architectureLayers[architectureLayer].push({
            name: testName,
            status: status,
            time: time,
            type: testType
          });
        }
      }
    }
  }
  
  // Generate markdown report
  let report = `# Test Summary Report\n\n`;
  report += `Generated on: ${new Date().toLocaleString()}\n\n`;
  
  // Summary table by test type
  report += `## Test Type Summary\n\n`;
  report += `| Test Type | Total | Passed | Failed | Success Rate |\n`;
  report += `|-----------|-------|--------|--------|--------------|\n`;
  
  let grandTotal = 0;
  let grandPassed = 0;
  let grandFailed = 0;
  
  Object.entries(testTypes).forEach(([type, tests]) => {
    const passed = tests.filter(t => t.status === 'passed').length;
    const failed = tests.filter(t => t.status === 'failed').length;
    const total = tests.length;
    const successRate = total > 0 ? ((passed / total) * 100).toFixed(1) : '0.0';
    
    if (total > 0) {
      report += `| ${type} | ${total} | ${passed} | ${failed} | ${successRate}% |\n`;
      grandTotal += total;
      grandPassed += passed;
      grandFailed += failed;
    }
  });
  
  // Summary table by architecture layer
  report += `\n## Architecture Layer Summary\n\n`;
  report += `| Architecture Layer | Total | Passed | Failed | Success Rate |\n`;
  report += `|---------------------|-------|--------|--------|--------------|\n`;
  
  Object.entries(architectureLayers).forEach(([layer, tests]) => {
    if (tests.length === 0) return;
    
    const passed = tests.filter(t => t.status === 'passed').length;
    const failed = tests.filter(t => t.status === 'failed').length;
    const total = tests.length;
    const successRate = total > 0 ? ((passed / total) * 100).toFixed(1) : '0.0';
    
    report += `| ${layer} | ${total} | ${passed} | ${failed} | ${successRate}% |\n`;
  });
  
  // Detailed test results
  report += `\n## Detailed Test Results\n\n`;
  
  Object.entries(testTypes).forEach(([type, tests]) => {
    if (tests.length === 0) return;
    
    report += `### ${type}\n\n`;
    report += `| Test Name | Status | Time | Layer |\n`;
    report += `|-----------|--------|------|-------|\n`;
    
    tests.forEach(test => {
      const statusIcon = test.status === 'passed' ? '✅' : '❌';
      report += `| ${test.name} | ${statusIcon} ${test.status} | ${test.time} | ${test.layer} |\n`;
    });
    
    report += `\n`;
  });
  
  // Final summary
  const successRate = grandTotal > 0 ? ((grandPassed / grandTotal) * 100).toFixed(2) : '0.00';
  
  report += `## Overall Summary\n\n`;
  report += `- **Total Tests**: ${grandTotal}\n`;
  report += `- **Passed**: ${grandPassed}\n`;
  report += `- **Failed**: ${grandFailed}\n`;
  report += `- **Success Rate**: ${successRate}%\n`;
  
  if (grandFailed > 0) {
    report += `\n### Failed Tests\n\n`;
    Object.values(testTypes).flat().filter(t => t.status === 'failed').forEach(test => {
      report += `- ❌ ${test.name}\n`;
    });
  }
  
  return report;
}
