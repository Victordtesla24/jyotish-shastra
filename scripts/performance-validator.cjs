#!/usr/bin/env node

/**
 * Performance Validator for Vedic Astrology Application
 * Tests system performance under various loads and conditions
 */

const http = require('http');
const { performance } = require('perf_hooks');

class PerformanceValidator {
  constructor() {
    this.baseURL = 'http://localhost:3001';
    this.results = {
      singleRequests: [],
      concurrentRequests: [],
      loadTests: []
    };
    this.thresholds = {
      maxResponseTime: 5000, // 5 seconds
      maxConcurrentTime: 8000, // 8 seconds
      maxLoadTime: 10000 // 10 seconds
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

      const startTime = performance.now();

      const req = http.request(url, options, (res) => {
        let body = '';
        
        res.on('data', (chunk) => {
          body += chunk;
        });
        
        res.on('end', () => {
          const endTime = performance.now();
          const responseTime = Math.round(endTime - startTime);
          
          try {
            const parsedBody = body ? JSON.parse(body) : {};
            resolve({
              statusCode: res.statusCode,
              responseTime,
              body: parsedBody,
              size: Buffer.byteLength(body)
            });
          } catch (error) {
            resolve({
              statusCode: res.statusCode,
              responseTime,
              body: body,
              size: Buffer.byteLength(body)
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

  async testSingleRequests() {
    this.log('🚀 Testing Single Request Performance');
    
    const testCases = [
      {
        name: 'Health Check',
        method: 'GET',
        endpoint: '/health'
      },
      {
        name: 'Chart Generation',
        method: 'POST',
        endpoint: '/api/v1/chart/generate',
        data: {
          name: "Performance Test User",
          dateOfBirth: "1990-01-01",
          timeOfBirth: "12:00:00",
          placeOfBirth: "New York, NY"
        }
      },
      {
        name: 'Comprehensive Analysis',
        method: 'POST',
        endpoint: '/api/v1/analysis/comprehensive',
        data: {
          name: "Performance Test User",
          dateOfBirth: "1990-01-01",
          timeOfBirth: "12:00:00",
          placeOfBirth: "New York, NY"
        }
      },
      {
        name: 'SVG Chart Rendering',
        method: 'POST',
        endpoint: '/api/v1/chart/render/svg',
        data: {
          name: "Performance Test User",
          dateOfBirth: "1990-01-01",
          timeOfBirth: "12:00:00",
          placeOfBirth: "New York, NY"
        }
      }
    ];

    for (const testCase of testCases) {
      this.log(`Testing ${testCase.name}...`);
      
      const results = [];
      const iterations = 3; // Test each endpoint multiple times
      
      for (let i = 0; i < iterations; i++) {
        try {
          const response = await this.makeRequest(
            testCase.method, 
            testCase.endpoint, 
            testCase.data
          );
          
          results.push({
            iteration: i + 1,
            responseTime: response.responseTime,
            statusCode: response.statusCode,
            size: response.size
          });
          
          this.log(`  Iteration ${i + 1}: ${response.responseTime}ms, Status: ${response.statusCode}`);
          
          // Wait between requests
          await new Promise(resolve => setTimeout(resolve, 500));
          
        } catch (error) {
          this.log(`  Iteration ${i + 1}: FAILED - ${error.message}`, 'error');
          results.push({
            iteration: i + 1,
            error: error.message
          });
        }
      }
      
      // Calculate statistics
      const validResults = results.filter(r => !r.error);
      if (validResults.length > 0) {
        const avgResponseTime = Math.round(
          validResults.reduce((sum, r) => sum + r.responseTime, 0) / validResults.length
        );
        const minResponseTime = Math.min(...validResults.map(r => r.responseTime));
        const maxResponseTime = Math.max(...validResults.map(r => r.responseTime));
        
        this.results.singleRequests.push({
          name: testCase.name,
          avgResponseTime,
          minResponseTime,
          maxResponseTime,
          successRate: (validResults.length / iterations) * 100,
          passed: avgResponseTime <= this.thresholds.maxResponseTime
        });
        
        this.log(`  Average: ${avgResponseTime}ms (Min: ${minResponseTime}ms, Max: ${maxResponseTime}ms)`);
        this.log(`  Success Rate: ${((validResults.length / iterations) * 100).toFixed(1)}%`);
        
        if (avgResponseTime > this.thresholds.maxResponseTime) {
          this.log(`  ⚠️  PERFORMANCE WARNING: Exceeds threshold of ${this.thresholds.maxResponseTime}ms`, 'warn');
        }
      }
    }
  }

  async testConcurrentRequests() {
    this.log('\n🚀 Testing Concurrent Request Performance');
    
    const concurrencyLevels = [5, 10, 20];
    
    for (const concurrency of concurrencyLevels) {
      this.log(`Testing ${concurrency} concurrent requests...`);
      
      const requests = [];
      const startTime = performance.now();
      
      // Launch concurrent requests
      for (let i = 0; i < concurrency; i++) {
       requests.push(
          this.makeRequest(
            'POST',
            '/api/v1/chart/generate',
            {
              name: `Concurrent Test User ${i}`,
              dateOfBirth: "1990-01-01",
              timeOfBirth: "12:00:00",
              placeOfBirth: "New York, NY"
            }
          )
        );
      }
      
      // Wait for all requests to complete
      const results = await Promise.allSettled(requests);
      const endTime = performance.now();
      const totalTime = Math.round(endTime - startTime);
      
      // Analyze results
      const successful = results.filter(r => r.status === 'fulfilled');
      const failed = results.filter(r => r.status === 'rejected');
      
      const responseTimes = successful
        .filter(r => r.value.statusCode >= 200 && r.value.statusCode < 300)
        .map(r => r.value.responseTime);
      
      const stats = responseTimes.length > 0 ? {
        avgResponseTime: Math.round(responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length),
        minResponseTime: Math.min(...responseTimes),
        maxResponseTime: Math.max(...responseTimes)
      } : { avgResponseTime: 0, minResponseTime: 0, maxResponseTime: 0 };
      
      this.results.concurrentRequests.push({
        concurrency,
        totalTime,
        successCount: successful.length,
        failureCount: failed.length,
        successRate: (successful.length / concurrency) * 100,
        ...stats,
        passed: totalTime <= this.thresholds.maxConcurrentTime && stats.avgResponseTime <= this.thresholds.maxResponseTime
      });
      
      this.log(`  Total Time: ${totalTime}ms`);
      this.log(`  Success Rate: ${((successful.length / concurrency) * 100).toFixed(1)}%`);
      this.log(`  Average Response Time: ${stats.avgResponseTime}ms`);
      
      if (totalTime > this.thresholds.maxConcurrentTime) {
        this.log(`  ⚠️  PERFORMANCE WARNING: Exceeds threshold of ${this.thresholds.maxConcurrentTime}ms`, 'warn');
      }
      
      // Wait between concurrency tests
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  async testLoadPerformance() {
    this.log('\n🚀 Testing Load Performance (Sustained Load)');
    
    const loadTestDuration = 30000; // 30 seconds
    const requestInterval = 1000; // 1 request per second
    const testEndpoints = [
      {
        name: 'Chart Generation',
        endpoint: '/api/v1/chart/generate',
        data: {
          name: "Load Test User",
          dateOfBirth: "1990-01-01",
          timeOfBirth: "12:00:00",
          placeOfBirth: "New York, NY"
        }
      }
    ];
    
    for (const testEndpoint of testEndpoints) {
      this.log(`Running load test for ${testEndpoint.name}...`);
      
      const startTime = performance.now();
      let completedRequests = 0;
      let failedRequests = 0;
      const responseTimes = [];
      
      const testPromise = new Promise((resolve) => {
        const interval = setInterval(async () => {
          const currentTime = performance.now();
          if (currentTime - startTime >= loadTestDuration) {
            clearInterval(interval);
            resolve();
            return;
          }
          
          try {
            const response = await this.makeRequest(
              'POST',
              testEndpoint.endpoint,
              testEndpoint.data
            );
            
            completedRequests++;
            if (response.statusCode >= 200 && response.statusCode < 300) {
              responseTimes.push(response.responseTime);
            } else {
              failedRequests++;
            }
          } catch (error) {
            failedRequests++;
          }
        }, requestInterval);
      });
      
      await testPromise;
      const endTime = performance.now();
      const totalTime = Math.round(endTime - startTime);
      
      const stats = responseTimes.length > 0 ? {
        avgResponseTime: Math.round(responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length),
        minResponseTime: Math.min(...responseTimes),
        maxResponseTime: Math.max(...responseTimes),
        requestsPerSecond: (completedRequests / (totalTime / 1000)).toFixed(2)
      } : { avgResponseTime: 0, minResponseTime: 0, maxResponseTime: 0, requestsPerSecond: 0 };
      
      this.results.loadTests.push({
        name: testEndpoint.name,
        duration: loadTestDuration,
        completedRequests,
        failedRequests,
        successRate: (completedRequests / (completedRequests + failedRequests)) * 100,
        ...stats,
        passed: stats.avgResponseTime <= this.thresholds.maxLoadTime
      });
      
      this.log(`  Duration: ${loadTestDuration}ms (${(loadTestDuration / 1000).toFixed(1)}s)`);
      this.log(`  Completed Requests: ${completedRequests}`);
      this.log(`  Failed Requests: ${failedRequests}`);
      this.log(`  Success Rate: ${((completedRequests / (completedRequests + failedRequests)) * 100).toFixed(1)}%`);
      this.log(`  Average Response Time: ${stats.avgResponseTime}ms`);
      this.log(`  Requests/Second: ${stats.requestsPerSecond}`);
      
      if (stats.avgResponseTime > this.thresholds.maxLoadTime) {
        this.log(`  ⚠️  PERFORMANCE WARNING: Exceeds threshold of ${this.thresholds.maxLoadTime}ms`, 'warn');
      }
    }
  }

  generateReport() {
    this.log('\n' + '='.repeat(80));
    this.log('📊 PERFORMANCE VALIDATION REPORT');
    this.log('='.repeat(80));
    
    // Single Request Performance
    this.log('\n🎯 SINGLE REQUEST PERFORMANCE:');
    this.results.singleRequests.forEach(test => {
      const status = test.passed ? '✅' : '❌';
      this.log(`  ${status} ${test.name}: ${test.avgResponseTime}ms avg (${test.successRate.toFixed(1)}% success)`);
    });
    
    // Concurrent Request Performance
    this.log('\n⚡ CONCURRENT REQUEST PERFORMANCE:');
    this.results.concurrentRequests.forEach(test => {
      const status = test.passed ? '✅' : '❌';
      this.log(`  ${status} ${test.concurrency} concurrent: ${test.avgResponseTime}ms avg, ${test.totalTime}ms total (${test.successRate.toFixed(1)}% success)`);
    });
    
    // Load Performance
    this.log('\n🔥 LOAD PERFORMANCE:');
    this.results.loadTests.forEach(test => {
      const status = test.passed ? '✅' : '❌';
      this.log(`  ${status} ${test.name}: ${test.avgResponseTime}ms avg, ${test.requestsPerSecond} req/s (${test.successRate.toFixed(1)}% success)`);
    });
    
    // Overall Summary
    const allTests = [
      ...this.results.singleRequests,
      ...this.results.concurrentRequests,
      ...this.results.loadTests
    ];
    const passedTests = allTests.filter(test => test.passed).length;
    const totalTests = allTests.length;
    const overallSuccessRate = ((passedTests / totalTests) * 100).toFixed(1);
    
    this.log('\n📈 OVERALL PERFORMANCE SUMMARY:');
    this.log(`  Total Tests: ${totalTests}`);
    this.log(`  Passed: ${passedTests}`);
    this.log(`  Failed: ${totalTests - passedTests}`);
    this.log(`  Success Rate: ${overallSuccessRate}%`);
    
    if (passedTests === totalTests) {
      this.log('\n🎉 All performance tests PASSED! System meets performance requirements.', 'success');
    } else {
      this.log('\n⚠️  Some performance tests FAILED. Review performance optimizations.', 'warn');
    }
    
    this.log('\n' + '='.repeat(80));
    
    return passedTests === totalTests;
  }

  async runAllTests() {
    try {
      await this.testSingleRequests();
      await this.testConcurrentRequests();
      await this.testLoadPerformance();
      
      const allPassed = this.generateReport();
      return allPassed;
      
    } catch (error) {
      this.log(`Performance validation failed: ${error.message}`, 'error');
      return false;
    }
  }
}

// Run the performance validation
if (require.main === module) {
  const validator = new PerformanceValidator();
  validator.runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Performance validation failed:', error);
      process.exit(1);
    });
}

module.exports = PerformanceValidator;
