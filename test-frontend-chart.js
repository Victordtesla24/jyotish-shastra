/**
 * Frontend Chart Display Test
 * Tests chart rendering directly using headless browser
 */

import puppeteer from 'puppeteer';
import axios from 'axios';

class FrontendChartTest {
  constructor() {
    this.backendUrl = 'http://localhost:3001';
    this.frontendUrl = 'http://localhost:3002';
  }

  async testBackendSVGRendering() {
    console.log('🔍 Testing Backend SVG rendering...');
    
    try {
      const testBirthData = {
        name: 'Frontend Test',
        dateOfBirth: '1990-01-01',
        timeOfBirth: '12:00',
        placeOfBirth: 'Mumbai, India'
      };

      const response = await axios.post(`${this.backendUrl}/api/v1/chart/render/svg`, {
        ...testBirthData,
        width: 800
      });

      if (response.data.success && response.data.data.svg) {
        console.log('✅ Backend SVG rendering successful');
        console.log(`SVG length: ${response.data.data.svg.length} characters`);
        return { success: true, svg: response.data.data.svg };
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (error) {
      console.error('❌ Backend SVG rendering failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  async testFrontendDirectAccess() {
    console.log('🔍 Testing Frontend direct access...');
    
    let browser;
    try {
      // Try to access frontend directly
      const response = await axios.get(this.frontendUrl, { timeout: 5000 });
      
      if (response.status === 200) {
        console.log('✅ Frontend server accessible');
        
        // Try to access the page with puppeteer if possible
        browser = await puppeteer.launch({ 
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        await page.goto(this.frontendUrl, { waitUntil: 'domcontentloaded', timeout: 10000 });
        
        // Check if React app loaded
        const appRoot = await page.$('#root, [data-testid="app"]');
        if (appRoot) {
          console.log('✅ React app root element found');
          
          // Check for form elements
          const nameInput = await page.$('input[name="name"], input[placeholder*="name"]');
          const dateInput = await page.$('input[type="date"]');
          const submitButton = await page.$('button[type="submit"]');
          
          if (nameInput && dateInput && submitButton) {
            console.log('✅ Chart form elements found');
            return { success: true, hasForm: true };
          } else {
            console.log('⚠️ Form elements not found - possible loading issue');
            return { success: true, hasForm: false };
          }
        } else {
          console.log('❌ React app root not found');
          return { success: false, error: 'React app not loaded' };
        }
      }
    } catch (error) {
      console.log('⚠️ Frontend server not accessible:', error.message);
      return { success: false, error: error.message };
    } finally {
      if (browser) {
        await browser.close();
      }
    }
    
    return { success: false, error: 'Unknown error' };
  }

  async runTests() {
    console.log('🎯 Running Frontend Chart Display Tests');
    console.log('='.repeat(50));
    
    // Test 1: Backend SVG rendering
    const backendResult = await this.testBackendSVGRendering();
    
    // Test 2: Frontend accessibility
    const frontendResult = await this.testFrontendDirectAccess();
    
    // Summary
    console.log('='.repeat(50));
    console.log('TEST RESULTS:');
    console.log(`1. Backend SVG Rendering: ${backendResult.success ? '✅ PASS' : '❌ FAIL'}`);
    if (!backendResult.success) {
      console.log(`   Error: ${backendResult.error}`);
    }
    
    console.log(`2. Frontend Access: ${frontendResult.success ? '✅ PASS' : '❌ FAIL'}`);
    if (!frontendResult.success) {
      console.log(`   Error: ${frontendResult.error}`);
    } else if (frontendResult.hasForm) {
      console.log('   Form elements found - frontend should work');
    }
    
    const overallSuccess = backendResult.success && frontendResult.success;
    console.log(`Overall Status: ${overallSuccess ? '✅ HEALTHY' : '❌ NEEDS ATTENTION'}`);
    
    return {
      backend: backendResult,
      frontend: frontendResult,
      overall: overallSuccess
    };
  }
}

// Run the tests
const test = new FrontendChartTest();
test.runTests()
  .then(results => {
    process.exit(results.overall ? 0 : 1);
  })
  .catch(error => {
    console.error('Frontend test failed:', error);
    process.exit(1);
  });

export default FrontendChartTest;
