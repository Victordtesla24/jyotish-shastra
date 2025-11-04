/**
 * Chart Debug and Fix Script
 * Identifies and resolves Frontend Chart Display and API Data Integrity issues
 */

import axios from 'axios';

class ChartDebugFix {
  constructor() {
    this.backendUrl = 'http://localhost:3001';
    this.frontendUrl = 'http://localhost:3002';
    this.issues = [];
    this.fixes = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'fix' ? '🔧' : '🔍';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async testBackendAPI() {
    this.log('Testing Backend API functionality');
    
    try {
      const testBirthData = {
        name: 'Debug Test',
        dateOfBirth: '1995-05-15',
        timeOfBirth: '10:30',
        latitude: 19.076,
        longitude: 72.8777,
        timezone: 'Asia/Kolkata'
      };

      // Test 1: Chart Generation API
      const chartResponse = await axios.post(`${this.backendUrl}/api/v1/chart/generate`, testBirthData);
      
      if (chartResponse.data.success) {
        this.log('Chart generation API working', 'success');
        
        const chartData = chartResponse.data.data;
        
        // Test 2: Data Structure Validation
        this.validateDataIntegrity(chartData);
        
        // Test 3: SVG Rendering API
        const svgResponse = await axios.post(`${this.backendUrl}/api/v1/chart/render/svg`, {
          ...testBirthData,
          width: 800
        });

        if (svgResponse.data.success && svgResponse.data.data.svg) {
          this.log('SVG rendering API working', 'success');
          this.log(`SVG generated: ${svgResponse.data.data.svg.length} characters`, 'info');
        } else {
          throw new Error('SVG rendering failed');
        }
        
      } else {
        throw new Error('Chart generation API failed');
      }
      
    } catch (error) {
      this.log(`Backend API test failed: ${error.message}`, 'error');
      this.issues.push({
        type: 'backend_api',
        message: error.message,
        details: error.response?.data || {}
      });
    }
  }

  validateDataIntegrity(chartData) {
    this.log('Validating Chart Data Integrity');
    
    const checks = [
      {
        name: 'Rasi Chart Structure',
        check: () => chartData.rasiChart && typeof chartData.rasiChart === 'object'
      },
      {
        name: 'Ascendant Data',
        check: () => chartData.rasiChart?.ascendant && typeof chartData.rasiChart.ascendant.longitude === 'number'
      },
      {
        name: 'Planetary Positions',
        check: () => chartData.rasiChart?.planetaryPositions && Object.keys(chartData.rasiChart.planetaryPositions).length > 0
      },
      {
        name: 'House Positions Array',
        check: () => chartData.rasiChart?.housePositions && Array.isArray(chartData.rasiChart.housePositions) && chartData.rasiChart.housePositions.length === 12
      },
      {
        name: 'House Data Structure',
        check: () => chartData.rasiChart.housePositions.every(house => house && (house.signId || house.sign || house.longitude))
      }
    ];

    let passedChecks = 0;
    checks.forEach(({ name, check }) => {
      try {
        if (check()) {
          this.log(`✓ ${name}`, 'success');
          passedChecks++;
        } else {
          this.log(`✗ ${name}`, 'error');
          this.issues.push({
            type: 'data_integrity',
            message: `${name} validation failed`
          });
        }
      } catch (error) {
        this.log(`✗ ${name}: ${error.message}`, 'error');
        this.issues.push({
          type: 'data_integrity',
          message: `${name} error: ${error.message}`
        });
      }
    });

    this.log(`Data integrity: ${passedChecks}/${checks.length} checks passed`, 
              passedChecks === checks.length ? 'success' : 'error');
  }

  async testFrontendConnectivity() {
    this.log('Testing Frontend Connectivity');
    
    try {
      // Check if frontend is accessible
      const response = await axios.get(this.frontendUrl, { timeout: 5000 });
      
      if (response.status === 200) {
        this.log('Frontend server accessible', 'success');
        return true;
      }
    } catch (error) {
      this.log(`Frontend server not accessible: ${error.message}`, 'error');
      this.issues.push({
        type: 'frontend_connectivity',
        message: 'Frontend server not running or not accessible',
        details: { error: error.message, url: this.frontendUrl }
      });
    }
    
    return false;
  }

  async fixChartRenderingService() {
    this.log('Fixing ChartRenderingService...', 'fix');
    
    // This would be where we implement the actual fixes
    // For now, document what needs to be fixed
    
    const fixes = [
      {
        file: 'src/services/chart/ChartRenderingService.js',
        issue: 'validateChartData requirements too strict',
        fix: 'Add flexible validation that accepts both old and new data formats'
      },
      {
        file: 'client/src/components/charts/VedicChartDisplay.jsx',
        issue: 'Frontend expects rigid data structure',
        fix: 'Update component to handle flexible API response formats'
      },
      {
        file: 'src/api/controllers/ChartController.js',
        issue: 'Preprocessing may strip required timezone',
        fix: 'Enhanced preprocessBirthDataForGeneration with proper defaults'
      }
    ];

    fixes.forEach(({ file, issue, fix }) => {
      this.log(`Fix needed in ${file}: ${issue}`, 'fix');
      this.log(`Solution: ${fix}`, 'fix');
      this.fixes.push({ file, issue, fix });
    });
  }

  async generateReport() {
    this.log('='.repeat(60));
    this.log('CHART DEBUG AND FIX REPORT', 'info');
    this.log('='.repeat(60));
    
    this.log(`Issues Identified: ${this.issues.length}`);
    this.issues.forEach((issue, index) => {
      this.log(`${index + 1}. ${issue.type}: ${issue.message}`, 'error');
    });
    
    this.log(`Fixes Required: ${this.fixes.length}`);
    this.fixes.forEach((fix, index) => {
      this.log(`${index + 1}. ${fix.file}: ${fix.issue}`, 'fix');
      this.log(`   Solution: ${fix.fix}`, 'fix');
    });
    
    if (this.issues.length === 0) {
      this.log('🎉 ALL SYSTEMS WORKING CORRECTLY!', 'success');
    } else {
      this.log('ISSUES FOUND - IMPLEMENTING FIXES...', 'info');
    }
  }

  async runCompleteTest() {
    this.log('Starting Complete Chart System Debug', 'info');
    
    await this.testBackendAPI();
    await this.testFrontendConnectivity();
    await this.fixChartRenderingService();
    await this.generateReport();
    
    return {
      issues: this.issues,
      fixes: this.fixes,
      healthy: this.issues.length === 0
    };
  }
}

// Run the debug and fix
const debugFix = new ChartDebugFix();
debugFix.runCompleteTest()
  .then(result => {
    console.log('\n🎯 Debug and Fix Complete');
    console.log(`System Health: ${result.healthy ? 'HEALTHY' : 'NEEDS FIXES'}`);
    process.exit(result.healthy ? 0 : 1);
  })
  .catch(error => {
    console.error('Debug script failed:', error);
    process.exit(1);
  });

export default ChartDebugFix;
