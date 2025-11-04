#!/usr/bin/env node

/**
 * API Endpoint Validator for Vedic Astrology Application
 * Tests all major API endpoints and validates functionality
 */

const http = require('http');
const https = require('https');

class APIEndpointValidator {
  constructor() {
    this.baseURL = 'http://localhost:3001';
    this.testResults = {
      passed: 0,
      failed: 0,
      details: []
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${type.toUpperCase()}]`;
    console.log(`${prefix} ${message}`);
  }

  async makeRequest(method, endpoint, data = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(endpoint, this.baseURL);
      const options = {
        method: method.toUpperCase(),
        headers: {
          'Content-Type': 'application/json',
        }
      };

      if (data) {
        const dataStr = JSON.stringify(data);
        options.headers['Content-Length'] = Buffer.byteLength(dataStr);
      }

      const req = http.request(url, options, (res) => {
        let body = '';
        
        res.on('data', (chunk) => {
          body += chunk;
        });
        
        res.on('end', () => {
          try {
            const parsedBody = body ? JSON.parse(body) : {};
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              body: parsedBody
            });
          } catch (error) {
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              body: body
            });
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      if (data) {
        req.write(JSON.stringify(data));
      }
      
      req.end();
    });
  }

  async testEndpoint(name, method, endpoint, testData = null, validator = null) {
    this.log(`Testing ${name}: ${method} ${endpoint}`);
    
    try {
      const response = await this.makeRequest(method, endpoint, testData);
      
      let testPassed = response.statusCode >= 200 && response.statusCode < 300;
      let message = `${name} - Status: ${response.statusCode}`;
      
      if (validator) {
        const validationResult = validator(response);
        testPassed = testPassed && validationResult.passed;
        message += ` - ${validationResult.message}`;
      }
      
      if (testPassed) {
        this.log(`✅ ${message}`, 'success');
        this.testResults.passed++;
      } else {
        this.log(`❌ ${message}`, 'error');
        this.testResults.failed++;
      }
      
      this.testResults.details.push({
        name,
        endpoint,
        method,
        status: response.statusCode,
        passed: testPassed,
        response: response.body
      });
      
      return testPassed;
      
    } catch (error) {
      this.log(`❌ ${name} - Error: ${error.message}`, 'error');
      this.testResults.failed++;
      this.testResults.details.push({
        name,
        endpoint,
        method,
        passed: false,
        error: error.message
      });
      return false;
    }
  }

  async runAllTests() {
    this.log('🔮 Starting API Endpoint Validation for Vedic Astrology Application');
    this.log('=' .repeat(80));

    // Test data
    const sampleBirthData = {
      name: "Test User",
      dateOfBirth: "1990-01-01",
      timeOfBirth: "12:00:00",
      placeOfBirth: "New York, NY"
    };

    // System health tests
    await this.testEndpoint(
      'Health Check',
      'GET',
      '/health',
      null,
      (response) => ({
        passed: response.body.status === 'healthy',
        message: response.body.status || 'Health status check'
      })
    );

    await this.testEndpoint(
      'API Documentation',
      'GET',
      '/api',
      null,
      (response) => ({
        passed: response.body.success === true && response.body.endpoints,
        message: 'API documentation available'
      })
    );

    // Chart generation tests
    await this.testEndpoint(
      'Chart Generation',
      'POST',
      '/api/v1/chart/generate',
      sampleBirthData,
      (response) => ({
        passed: response.body.success === true && response.body.data?.chartId,
        message: 'Chart generated successfully'
      })
    );

    await this.testEndpoint(
      'Comprehensive Chart Generation',
      'POST',
      '/api/v1/chart/generate/comprehensive',
      sampleBirthData,
      (response) => ({
        passed: response.body.success === true,
        message: 'Comprehensive chart generated'
      })
    );

    // Analysis tests
    await this.testEndpoint(
      'Comprehensive Analysis',
      'POST',
      '/api/v1/analysis/comprehensive',
      sampleBirthData,
      (response) => ({
        passed: response.body.success === true && response.body.analysis?.sections,
        message: 'Comprehensive analysis completed'
      })
    );

    // Birth Time Rectification tests
    await this.testEndpoint(
      'BTR Features',
      'GET',
      '/api/v1/rectification/features',
      null,
      (response) => ({
        passed: response.body.success === true && response.body.features,
        message: 'BTR features retrieved'
      })
    );

    await this.testEndpoint(
      'BTR Quick Analysis',
      'POST',
      '/api/v1/rectification/quick',
      sampleBirthData,
      (response) => ({
        passed: response.body.success === true,
        message: 'BTR quick analysis completed'
      })
    );

    // Geocoding tests
    await this.testEndpoint(
      'Geocoding Location',
      'POST',
      '/geocoding/location',
      { location: "New York, NY" },
      (response) => ({
        passed: response.body.success === true && (response.body.latitude && response.body.longitude),
        message: 'Geocoding successful'
      })
    );

    // Chart rendering tests
    await this.testEndpoint(
      'SVG Chart Rendering',
      'POST',
      '/api/v1/chart/render/svg',
      sampleBirthData,
      (response) => {
        const isSVG = response.headers['content-type']?.includes('image/svg+xml');
        return {
          passed: isSVG && response.statusCode === 200,
          message: isSVG ? 'SVG chart rendered' : 'SVG rendering failed'
        };
      }
    );

    // Analysis endpoints
    await this.testEndpoint(
      'Lagna Analysis',
      'POST',
      '/api/v1/chart/analysis/lagna',
      sampleBirthData,
      (response) => ({
        passed: response.body.success === true,
        message: 'Lagna analysis completed'
      })
    );

    await this.testEndpoint(
      'House Analysis',
      'POST',
      '/api/v1/chart/analysis/house/1',
      sampleBirthData,
      (response) => ({
        passed: response.body.success === true,
        message: 'House analysis completed'
      })
    );

    // Generate final report
    this.generateReport();
    
    return this.testResults.failed === 0;
  }

  generateReport() {
    const totalTests = this.testResults.passed + this.testResults.failed;
    const successRate = totalTests > 0 ? ((this.testResults.passed / totalTests) * 100).toFixed(2) : '0';
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 API ENDPOINT VALIDATION REPORT');
    console.log('='.repeat(80));
    console.log(`Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${this.testResults.passed}`);
    console.log(`❌ Failed: ${this.testResults.failed}`);
    console.log(`📈 Success Rate: ${successRate}%`);
    
    if (this.testResults.failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.testResults.details
        .filter(test => !test.passed)
        .forEach(test => {
          console.log(`   • ${test.name}: ${test.error || `Status ${test.status}`}`);
        });
    }
    
    console.log('\n✅ Passed Tests:');
    this.testResults.details
      .filter(test => test.passed)
      .forEach(test => {
        console.log(`   • ${test.name}`);
      });
    
    console.log('\n' + '='.repeat(80));
  }
}

// Run the validation
if (require.main === module) {
  const validator = new APIEndpointValidator();
  validator.runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Validation failed:', error);
      process.exit(1);
    });
}

module.exports = APIEndpointValidator;
