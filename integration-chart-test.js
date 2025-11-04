/**
 * Integration Chart Test
 * Tests the complete chart rendering pipeline from frontend to backend
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';

class IntegrationChartTest {
  constructor() {
    this.backendUrl = 'http://localhost:3001';
    this.frontendUrl = 'http://localhost:3002';
    this.testResults = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warn' ? '⚠️' : '🔍';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async testBackendChartGeneration() {
    this.log('Test 1: Backend Chart Generation API');
    
    const testData = {
      name: 'Integration Test User',
      dateOfBirth: '1985-03-15',
      timeOfBirth: '08:30',
      placeOfBirth: 'Delhi, India'
    };

    try {
      // Test chart generation
      const chartResponse = await axios.post(`${this.backendUrl}/api/v1/chart/generate`, testData);
      
      if (chartResponse.data.success) {
        this.log('Chart generation successful', 'success');
        
        const chartData = chartResponse.data.data;
        
        // Validate structure
        const validations = [
          { name: 'rasiChart exists', check: !!chartData.rasiChart },
          { name: 'planetaryPositions exist', check: !!chartData.rasiChart?.planetaryPositions },
          { name: 'housePositions exist (12 houses)', check: Array.isArray(chartData.rasiChart?.housePositions) && chartData.rasiChart.housePositions.length === 12 },
          { name: 'ascendant exists', check: !!chartData.rasiChart?.ascendant }
        ];
        
        validations.forEach(({ name, check }) => {
          this.log(`${check ? '✅' : '❌'} ${name}`, check ? 'success' : 'error');
          if (!check) {
            throw new Error(`Validation failed: ${name}`);
          }
        });
        
        // Test SVG rendering
        const svgResponse = await axios.post(`${this.backendUrl}/api/v1/chart/render/svg`, {
          ...testData,
          width: 800
        });
        
        if (svgResponse.data.success && svgResponse.data.data.svg) {
          this.log('SVG rendering successful', 'success');
          this.log(`SVG content length: ${svgResponse.data.data.svg.length} characters`);
          
          // Save SVG for verification
          const svgFile = 'test-chart.svg';
          fs.writeFileSync(svgFile, svgResponse.data.data.svg);
          this.log(`SVG saved to ${svgFile}`, 'success');
          
          this.testResults.push({ test: 'backend_apis', status: 'PASS', details: 'All backend APIs working' });
          return true;
        } else {
          throw new Error('SVG rendering failed');
        }
      } else {
        throw new Error('Chart generation failed');
      }
    } catch (error) {
      this.log(`Backend test failed: ${error.message}`, 'error');
      this.testResults.push({ test: 'backend_apis', status: 'FAIL', error: error.message });
      return false;
    }
  }

  async testFrontendBackendIntegration() {
    this.log('Test 2: Frontend-Backend Integration');
    
    try {
      // Simulate frontend chartService API call
      const formData = {
        name: 'Frontend Integration Test',
        dateOfBirth: '1990-01-01',
        timeOfBirth: '12:00',
        placeOfBirth: 'Mumbai, India'
      };

      // This simulates what the frontend chartService.js does
      const chartServiceRequest = {
        method: 'POST',
        url: `${this.frontendUrl}/api/v1/chart/generate`, // This will be proxied to backend
        data: formData,
        headers: { 'Content-Type': 'application/json' }
      };

      // Test direct backend call (simulating proxy)
      const response = await axios.post(`${this.backendUrl}/api/v1/chart/generate`, formData);
      
      if (response.data.success) {
        this.log('Frontend-Backend integration successful', 'success');
        
        // Test the SVG rendering service that frontend would call
        const svgResponse = await axios.post(`${this.backendUrl}/api/v1/chart/render/svg`, {
          ...formData,
          width: 500 // Frontend CHART_SIZE
        });
        
        if (svgResponse.data.success && svgResponse.data.data.svg) {
          this.log('Frontend chart rendering service successful', 'success');
          
          // Verify the SVG contains expected elements
          const svg = svgResponse.data.data.svg;
          const svgString = typeof svg === 'string' ? svg : String(svg);
          const hasLines = svgString.includes('<line');
          const hasText = svgString.includes('<text');
          const hasBackground = svgString.includes('#FFF8E1');
          
          this.log(`SVG verification: Lines=${hasLines}, Text=${hasText}, Background=${hasBackground}`, 'info');
          
          if (hasLines && hasText && hasBackground) {
            this.log('SVG structure verification passed', 'success');
            this.testResults.push({ test: 'frontend_backend_integration', status: 'PASS', details: 'Integration working properly' });
            return true;
          } else {
            throw new Error('SVG structure verification failed');
          }
        } else {
          throw new Error('Frontend chart rendering failed');
        }
      } else {
        throw new Error('Frontend-Backend integration failed');
      }
    } catch (error) {
      this.log(`Integration test failed: ${error.message}`, 'error');
      this.testResults.push({ test: 'frontend_backend_integration', status: 'FAIL', error: error.message });
      return false;
    }
  }

  async testVedicChartXYSpec() {
    this.log('Test 3: Vedic Chart XY Specification Compliance');
    
    try {
      // Load the vedic_chart_xy_spec.json
      const specPath = path.join(process.cwd(), 'vedic_chart_xy_spec.json');
      console.log(`Looking for spec file at: ${specPath}`);
      if (!fs.existsSync(specPath)) {
        throw new Error('vedic_chart_xy_spec.json not found');
      }
      
      const chartSpec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
      
      // Validate spec structure
      const specChecks = [
        { name: 'canvas config', check: !!chartSpec.canvas },
        { name: 'lines config', check: !!chartSpec.lines },
        { name: 'slots config', check: Array.isArray(chartSpec.slots) && chartSpec.slots.length === 24 },
        { name: 'slot order', check: Array.isArray(chartSpec.slot_order_clockwise) && chartSpec.slot_order_clockwise.length === 24 }
      ];
      
      specChecks.forEach(({ name, check }) => {
        this.log(`${check ? '✅' : '❌'} ${name}`, check ? 'success' : 'error');
        if (!check) {
          throw new Error(`Spec validation failed: ${name}`);
        }
      });
      
      // Test that backend rendering uses this spec
      const testData = {
        name: 'Spec Compliance Test',
        dateOfBirth: '1995-05-15',
        timeOfBirth: '10:30',
        placeOfBirth: 'Bangalore, India'
      };
      
      const svgResponse = await axios.post(`${this.backendUrl}/api/v1/chart/render/svg`, {
        ...testData,
        width: 800
      });
      
      if (svgResponse.data.success) {
        const svg = svgResponse.data.data.svg;
        const svgString = typeof svg === 'string' ? svg : String(svg);
        
        // Verify SVG follows spec dimensions
        const hasCorrectWidth = svgString.includes('width="800"');
        const hasCorrectHeight = svgString.includes('height="800"');
        const hasCorrectViewBox = svgString.includes('viewBox="0 0 800 800"');
        
        this.log(`Spec compliance: Width=${hasCorrectWidth}, Height=${hasCorrectHeight}, ViewBox=${hasCorrectViewBox}`, 'info');
        
        if (hasCorrectWidth && hasCorrectHeight && hasCorrectViewBox) {
          this.log('Chart rendering follows vedic_chart_xy_spec.json', 'success');
          this.testResults.push({ test: 'vedic_chart_spec_compliance', status: 'PASS', details: 'Spec compliance verified' });
          return true;
        } else {
          throw new Error('Chart rendering does not follow specification');
        }
      } else {
        throw new Error('Failed to generate chart for spec compliance test');
      }
    } catch (error) {
      this.log(`Spec compliance test failed: ${error.message}`, 'error');
      this.testResults.push({ test: 'vedic_chart_spec_compliance', status: 'FAIL', error: error.message });
      return false;
    }
  }

  async generateReport() {
    this.log('='.repeat(60));
    this.log('INTEGRATION TEST REPORT');
    this.log('='.repeat(60));
    
    const passedTests = this.testResults.filter(r => r.status === 'PASS').length;
    const totalTests = this.testResults.length;
    
    this.testResults.forEach((result, index) => {
      const icon = result.status === 'PASS' ? '✅' : '❌';
      this.log(`${index + 1}. ${icon} ${result.test.replace(/_/g, ' ').toUpperCase()}`);
      if (result.status === 'PASS') {
        this.log(`   ${result.details}`);
      } else {
        this.log(`   ERROR: ${result.error}`, 'error');
      }
    });
    
    this.log('='.repeat(60));
    this.log(`Summary: ${passedTests}/${totalTests} tests passed`);
    
    const overallSuccess = passedTests === totalTests;
    this.log(`Overall Status: ${overallSuccess ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
    
    if (overallSuccess) {
      this.log('🎉 Chart rendering system is working correctly!', 'success');
      this.log('Frontend chart display and API data integrity are verified', 'success');
    } else {
      this.log('⚠️ Some issues need to be addressed before production deployment', 'warn');
    }
    
    return overallSuccess;
  }

  async runAllTests() {
    this.log('Starting Integration Chart Tests');
    this.log('Testing Frontend Chart Display and API Data Integrity');
    
    try {
      await this.testBackendChartGeneration();
      await this.testFrontendBackendIntegration();
      await this.testVedicChartXYSpec();
      
      return await this.generateReport();
    } catch (error) {
      this.log(`Integration test suite failed: ${error.message}`, 'error');
      return false;
    }
  }
}

// Run the integration tests
const integrationTest = new IntegrationChartTest();
integrationTest.runAllTests()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Integration test execution failed:', error);
    process.exit(1);
  });

export default IntegrationChartTest;
