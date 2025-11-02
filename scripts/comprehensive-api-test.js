#!/usr/bin/env node

/**
 * Comprehensive API Endpoint Testing Script
 * Tests all 31 endpoints from curl-commands.md against Render deployment and localhost
 * Generates detailed test report with status codes, response structures, errors, and performance metrics
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const RENDER_BASE_URL = 'https://jjyotish-shastra-backend.onrender.com/api/v1';
const LOCAL_BASE_URL = 'http://localhost:3001/api/v1';
const TIMEOUT = 30000;
const REPORT_DIR = path.join(__dirname, '../docs/api');
const REPORT_DATE = new Date().toISOString().split('T')[0];
const REPORT_FILE = path.join(REPORT_DIR, `comprehensive-api-test-report-${REPORT_DATE}.md`);
const CSV_FILE = path.join(REPORT_DIR, `comprehensive-api-test-report-${REPORT_DATE}.csv`);

// Test data
const TEST_DATA = {
  name: 'Farhan',
  dateOfBirth: '1997-12-18',
  timeOfBirth: '02:30',
  latitude: 32.4935378,
  longitude: 74.5411575,
  timezone: 'Asia/Karachi',
  gender: 'male',
  placeOfBirth: 'Sialkot, Pakistan'
};

// Statistics
const stats = {
  total: 0,
  passed: 0,
  failed: 0,
  warnings: 0,
  renderFailed: 0,
  localFailed: 0,
  errors: []
};

// Ensure report directory exists
if (!fs.existsSync(REPORT_DIR)) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
}

/**
 * Make HTTP request with timeout and error handling
 */
function makeRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'API-Test-Script/1.0'
      },
      timeout: TIMEOUT
    };

    const startTime = Date.now();
    const req = client.request(options, (res) => {
      let responseBody = '';
      
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      
      res.on('end', () => {
        const duration = (Date.now() - startTime) / 1000;
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: responseBody,
          duration: duration
        });
      });
    });

    req.on('error', (error) => {
      reject({ type: 'request_error', error: error.message });
    });

    req.on('timeout', () => {
      req.destroy();
      reject({ type: 'timeout', error: 'Request timeout' });
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

/**
 * Test an endpoint
 */
async function testEndpoint(name, method, endpoint, data, environment) {
  const baseUrl = environment === 'render' ? RENDER_BASE_URL : LOCAL_BASE_URL;
  const fullUrl = `${baseUrl}${endpoint}`;
  
  process.stdout.write(`  Testing: ${name} (${environment})... `);
  
  try {
    const response = await makeRequest(fullUrl, method, data);
    stats.total++;
    
    let status = 'UNKNOWN';
    let errorMsg = '';
    let responseValid = false;
    let structureInfo = {};
    
    // Check HTTP status code
    if (response.statusCode >= 200 && response.statusCode < 300) {
      // Try to parse JSON
      let jsonBody;
      try {
        jsonBody = JSON.parse(response.body);
        
        // Check for success field or status field
        if (jsonBody.success === true || jsonBody.status === 'healthy') {
          status = 'PASSED';
          responseValid = true;
          
          // Analyze response structure
          structureInfo = {
            hasSuccess: 'success' in jsonBody,
            hasData: 'data' in jsonBody,
            hasAnalysis: 'analysis' in jsonBody,
            hasRasiChart: jsonBody.data?.rasiChart !== undefined,
            hasSections: jsonBody.analysis?.sections !== undefined
          };
          
          process.stdout.write(`✅ PASSED (HTTP ${response.statusCode}, ${response.duration.toFixed(3)}s)\n`);
          stats.passed++;
        } else if (jsonBody.error || jsonBody.message) {
          status = 'FAILED';
          errorMsg = jsonBody.error || jsonBody.message || 'Unknown error';
          process.stdout.write(`❌ FAILED - ${errorMsg} (HTTP ${response.statusCode}, ${response.duration.toFixed(3)}s)\n`);
          stats.failed++;
          if (environment === 'render') stats.renderFailed++;
          else stats.localFailed++;
        } else {
          status = 'WARNING';
          responseValid = true;
          process.stdout.write(`⚠️  WARNING - Unexpected response structure (HTTP ${response.statusCode}, ${response.duration.toFixed(3)}s)\n`);
          stats.warnings++;
        }
      } catch (parseError) {
        status = 'WARNING';
        process.stdout.write(`⚠️  WARNING - Non-JSON response (HTTP ${response.statusCode}, ${response.duration.toFixed(3)}s)\n`);
        stats.warnings++;
      }
    } else if (response.statusCode >= 400 && response.statusCode < 500) {
      status = 'FAILED';
      try {
        const jsonBody = JSON.parse(response.body);
        errorMsg = jsonBody.error || jsonBody.message || `Client error (HTTP ${response.statusCode})`;
      } catch {
        errorMsg = `Client error (HTTP ${response.statusCode})`;
      }
      process.stdout.write(`❌ FAILED - ${errorMsg}\n`);
      stats.failed++;
      if (environment === 'render') stats.renderFailed++;
      else stats.localFailed++;
    } else if (response.statusCode >= 500) {
      status = 'FAILED';
      try {
        const jsonBody = JSON.parse(response.body);
        errorMsg = jsonBody.error || jsonBody.message || `Server error (HTTP ${response.statusCode})`;
      } catch {
        errorMsg = `Server error (HTTP ${response.statusCode})`;
      }
      process.stdout.write(`❌ FAILED - ${errorMsg}\n`);
      stats.failed++;
      if (environment === 'render') stats.renderFailed++;
      else stats.localFailed++;
      
      stats.errors.push({
        name,
        endpoint,
        environment,
        statusCode: response.statusCode,
        error: errorMsg,
        response: response.body.substring(0, 500)
      });
    } else {
      status = 'UNKNOWN';
      process.stdout.write(`⚠️  UNKNOWN (HTTP ${response.statusCode}, ${response.duration.toFixed(3)}s)\n`);
      stats.warnings++;
    }
    
    return {
      name,
      endpoint,
      environment,
      status,
      statusCode: response.statusCode,
      duration: response.duration,
      errorMsg,
      responseValid,
      structureInfo
    };
    
  } catch (error) {
    stats.total++;
    stats.failed++;
    if (environment === 'render') stats.renderFailed++;
    else stats.localFailed++;
    
    const errorMsg = error.error || error.message || 'Unknown error';
    process.stdout.write(`❌ ERROR - ${errorMsg}\n`);
    
    stats.errors.push({
      name,
      endpoint,
      environment,
      statusCode: 0,
      error: errorMsg,
      response: null
    });
    
    return {
      name,
      endpoint,
      environment,
      status: 'ERROR',
      statusCode: 0,
      duration: 0,
      errorMsg,
      responseValid: false,
      structureInfo: {}
    };
  }
}

/**
 * Generate markdown report
 */
function generateReport(results) {
  let report = `# Comprehensive API Endpoint Testing Report

**Generated**: ${new Date().toISOString()}
**Target Environments**: Render Production (${RENDER_BASE_URL}) & Localhost (${LOCAL_BASE_URL})
**Total Endpoints Tested**: ${results.length / 2} (tested in both environments)

## Executive Summary

- **Total Tests**: ${stats.total}
- **Passed**: ${stats.passed} (${((stats.passed / stats.total) * 100).toFixed(1)}%)
- **Failed**: ${stats.failed} (${((stats.failed / stats.total) * 100).toFixed(1)}%)
- **Warnings**: ${stats.warnings}
- **Render Failures**: ${stats.renderFailed}
- **Local Failures**: ${stats.localFailed}

## Failed Endpoints

`;
  
  if (stats.errors.length > 0) {
    stats.errors.forEach(err => {
      report += `### ${err.name} (${err.environment})
- **Endpoint**: ${err.endpoint}
- **HTTP Status**: ${err.statusCode || 'N/A'}
- **Error**: ${err.error}
- **Response**: ${err.response ? err.response.substring(0, 200) : 'N/A'}

`;
    });
  } else {
    report += `No failures detected.\n\n`;
  }
  
  report += `## Detailed Results

| Endpoint | Environment | Status | HTTP Code | Duration (s) | Error |
|----------|-------------|--------|-----------|---------------|-------|
`;
  
  results.forEach(result => {
    const statusEmoji = result.status === 'PASSED' ? '✅' : result.status === 'FAILED' ? '❌' : '⚠️';
    report += `| ${result.name} | ${result.environment} | ${statusEmoji} ${result.status} | ${result.statusCode || 'N/A'} | ${result.duration.toFixed(3)} | ${result.errorMsg || '-'} |\n`;
  });
  
  return report;
}

/**
 * Generate CSV report
 */
function generateCSV(results) {
  let csv = 'Endpoint Name,Path,Environment,Status,HTTP Code,Error Message,Response Time (s),Has Success,Has Data,Has Analysis\n';
  
  results.forEach(result => {
    const structure = result.structureInfo || {};
    csv += `"${result.name}","${result.endpoint}","${result.environment}","${result.status}",${result.statusCode || 0},"${result.errorMsg || ''}",${result.duration.toFixed(3)},${structure.hasSuccess || false},${structure.hasData || false},${structure.hasAnalysis || false}\n`;
  });
  
  return csv;
}

/**
 * Main test execution
 */
async function runTests() {
  console.log('==========================================');
  console.log('Comprehensive API Endpoint Testing');
  console.log(`Testing against: Render (${RENDER_BASE_URL}) and Localhost (${LOCAL_BASE_URL})`);
  console.log('==========================================');
  console.log('');
  
  const results = [];
  
  // 1. Health & Information
  console.log('--- Health & Information Endpoints ---');
  results.push(await testEndpoint('Health Check', 'GET', '/health', null, 'render'));
  results.push(await testEndpoint('Health Check', 'GET', '/health', null, 'local'));
  
  // 2. Geocoding
  console.log('\n--- Geocoding Endpoints ---');
  results.push(await testEndpoint('Geocode Location', 'POST', '/geocoding/location', { placeOfBirth: 'Sialkot, Pakistan' }, 'render'));
  results.push(await testEndpoint('Geocode Location', 'POST', '/geocoding/location', { placeOfBirth: 'Sialkot, Pakistan' }, 'local'));
  results.push(await testEndpoint('Validate Coordinates', 'GET', '/geocoding/validate?latitude=32.4935378&longitude=74.5411575', null, 'render'));
  results.push(await testEndpoint('Validate Coordinates', 'GET', '/geocoding/validate?latitude=32.4935378&longitude=74.5411575', null, 'local'));
  
  // 3. Chart Generation
  console.log('\n--- Chart Generation Endpoints ---');
  results.push(await testEndpoint('Generate Basic Chart', 'POST', '/chart/generate', TEST_DATA, 'render'));
  results.push(await testEndpoint('Generate Basic Chart', 'POST', '/chart/generate', TEST_DATA, 'local'));
  results.push(await testEndpoint('Generate Comprehensive Chart', 'POST', '/chart/generate/comprehensive', TEST_DATA, 'render'));
  results.push(await testEndpoint('Generate Comprehensive Chart', 'POST', '/chart/generate/comprehensive', TEST_DATA, 'local'));
  results.push(await testEndpoint('Lagna Analysis', 'POST', '/chart/analysis/lagna', TEST_DATA, 'render'));
  results.push(await testEndpoint('Lagna Analysis', 'POST', '/chart/analysis/lagna', TEST_DATA, 'local'));
  results.push(await testEndpoint('House 1 Analysis', 'POST', '/chart/analysis/house/1', TEST_DATA, 'render'));
  results.push(await testEndpoint('House 1 Analysis', 'POST', '/chart/analysis/house/1', TEST_DATA, 'local'));
  
  // 4. Analysis Endpoints
  console.log('\n--- Analysis Endpoints ---');
  results.push(await testEndpoint('Comprehensive Analysis', 'POST', '/analysis/comprehensive', TEST_DATA, 'render'));
  results.push(await testEndpoint('Comprehensive Analysis', 'POST', '/analysis/comprehensive', TEST_DATA, 'local'));
  results.push(await testEndpoint('Preliminary Analysis', 'POST', '/analysis/preliminary', TEST_DATA, 'render'));
  results.push(await testEndpoint('Preliminary Analysis', 'POST', '/analysis/preliminary', TEST_DATA, 'local'));
  results.push(await testEndpoint('Houses Analysis', 'POST', '/analysis/houses', TEST_DATA, 'render'));
  results.push(await testEndpoint('Houses Analysis', 'POST', '/analysis/houses', TEST_DATA, 'local'));
  results.push(await testEndpoint('Aspects Analysis', 'POST', '/analysis/aspects', TEST_DATA, 'render'));
  results.push(await testEndpoint('Aspects Analysis', 'POST', '/analysis/aspects', TEST_DATA, 'local'));
  results.push(await testEndpoint('Navamsa Analysis', 'POST', '/analysis/navamsa', TEST_DATA, 'render'));
  results.push(await testEndpoint('Navamsa Analysis', 'POST', '/analysis/navamsa', TEST_DATA, 'local'));
  results.push(await testEndpoint('Dasha Analysis', 'POST', '/analysis/dasha', TEST_DATA, 'render'));
  results.push(await testEndpoint('Dasha Analysis', 'POST', '/analysis/dasha', TEST_DATA, 'local'));
  
  // 5. Birth Time Rectification
  console.log('\n--- Birth Time Rectification Endpoints ---');
  results.push(await testEndpoint('BTR Test Endpoint', 'GET', '/rectification/test', null, 'render'));
  results.push(await testEndpoint('BTR Test Endpoint', 'GET', '/rectification/test', null, 'local'));
  results.push(await testEndpoint('BTR Quick Validation', 'POST', '/rectification/quick', {
    birthData: {
      dateOfBirth: '1997-12-18',
      timeOfBirth: '02:30',
      latitude: 32.4935378,
      longitude: 74.5411575,
      timezone: 'Asia/Karachi',
      placeOfBirth: 'Sialkot, Pakistan'
    },
    proposedTime: '02:30'
  }, 'render'));
  results.push(await testEndpoint('BTR Quick Validation', 'POST', '/rectification/quick', {
    birthData: {
      dateOfBirth: '1997-12-18',
      timeOfBirth: '02:30',
      latitude: 32.4935378,
      longitude: 74.5411575,
      timezone: 'Asia/Karachi',
      placeOfBirth: 'Sialkot, Pakistan'
    },
    proposedTime: '02:30'
  }, 'local'));
  results.push(await testEndpoint('BTR With Events', 'POST', '/rectification/with-events', {
    birthData: {
      dateOfBirth: '1997-12-18',
      timeOfBirth: '02:30',
      latitude: 32.4935378,
      longitude: 74.5411575,
      timezone: 'Asia/Karachi',
      placeOfBirth: 'Sialkot, Pakistan'
    },
    lifeEvents: [
      { date: '2015-06-01', description: 'Marriage' },
      { date: '2020-01-15', description: 'Job promotion' }
    ],
    options: {
      methods: ['praanapada', 'moon', 'gulika', 'events']
    }
  }, 'render'));
  results.push(await testEndpoint('BTR With Events', 'POST', '/rectification/with-events', {
    birthData: {
      dateOfBirth: '1997-12-18',
      timeOfBirth: '02:30',
      latitude: 32.4935378,
      longitude: 74.5411575,
      timezone: 'Asia/Karachi',
      placeOfBirth: 'Sialkot, Pakistan'
    },
    lifeEvents: [
      { date: '2015-06-01', description: 'Marriage' },
      { date: '2020-01-15', description: 'Job promotion' }
    ],
    options: {
      methods: ['praanapada', 'moon', 'gulika', 'events']
    }
  }, 'local'));
  
  // Generate reports
  console.log('\n==========================================');
  console.log('Test Summary');
  console.log('==========================================');
  console.log(`Total Tests: ${stats.total}`);
  console.log(`Passed: ${stats.passed}`);
  console.log(`Failed: ${stats.failed}`);
  console.log(`Warnings: ${stats.warnings}`);
  console.log(`Render Failures: ${stats.renderFailed}`);
  console.log(`Local Failures: ${stats.localFailed}`);
  console.log('');
  
  const report = generateReport(results);
  const csv = generateCSV(results);
  
  fs.writeFileSync(REPORT_FILE, report);
  fs.writeFileSync(CSV_FILE, csv);
  
  console.log(`✅ Detailed report saved to: ${REPORT_FILE}`);
  console.log(`✅ CSV report saved to: ${CSV_FILE}`);
  console.log('');
  console.log('✅ Testing complete!');
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

