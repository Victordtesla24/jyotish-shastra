const puppeteer = require('puppeteer');

async function diagnoseProductionForm() {
  console.log('🔬 PRODUCTION FORM DIAGNOSIS - Analyzing why chart generation fails...');

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: false,
      devtools: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Monitor all console messages
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      console.log(`🌐 Browser ${type.toUpperCase()}: ${text}`);
    });

    // Monitor all network requests
    await page.setRequestInterception(true);
    const networkRequests = [];

    page.on('request', request => {
      networkRequests.push({
        method: request.method(),
        url: request.url(),
        postData: request.postData(),
        timestamp: new Date().toISOString()
      });

      if (request.url().includes('/api/')) {
        console.log(`📡 API REQUEST: ${request.method()} ${request.url()}`);
        if (request.postData()) {
          console.log(`📋 Payload: ${request.postData()}`);
        }
      }
      request.continue();
    });

    page.on('response', response => {
      if (response.url().includes('/api/')) {
        console.log(`📈 API RESPONSE: ${response.status()} ${response.url()}`);
      }
    });

    console.log('📍 Step 1: Navigate to production chart page...');
    await page.goto('http://localhost:3002/chart', { waitUntil: 'networkidle0' });

    console.log('📍 Step 2: Fill out the production form...');

    // Fill out the form with exact same data as working test
    await page.type('#dateOfBirth', '1997-12-18');
    await page.type('#timeOfBirth', '02:30');
    await page.type('#placeOfBirth', 'Lahore, Punjab, Pakistan');

    // Wait for geocoding to complete
    console.log('⏳ Waiting for geocoding to complete...');
    await page.waitForFunction(
      () => {
        const statusElement = document.querySelector('[class*="text-green-600"]');
        return statusElement && statusElement.textContent.includes('Location found');
      },
      { timeout: 10000 }
    ).catch(() => {
      console.log('⚠️ Geocoding may have failed or taken too long');
    });

    // Set timezone
    await page.select('#timeZone', 'Asia/Karachi');

    // Optional: Set gender
    await page.select('select[name="gender"]', 'male');

    console.log('📍 Step 3: Check form state before submission...');

    // Analyze form state
    const formState = await page.evaluate(() => {
      const form = document.getElementById('birth-data-form');
      const formData = new FormData(form);
      const data = {};
      for (let [key, value] of formData.entries()) {
        data[key] = value;
      }

      // Check for validation errors
      const errors = Array.from(document.querySelectorAll('.text-red-600')).map(el => el.textContent);

      // Check geocoding status
      const geocodingSuccess = document.querySelector('.text-green-600') !== null;
      const geocodingError = document.querySelector('.text-red-600') !== null;

      return {
        formData: data,
        hasErrors: errors.length > 0,
        errors: errors,
        geocodingSuccess,
        geocodingError,
        submitButtonDisabled: document.querySelector('button[type="submit"]')?.disabled || false
      };
    });

    console.log('📊 Form State Analysis:');
    console.log('========================');
    console.log('Form Data:', formState.formData);
    console.log('Has Validation Errors:', formState.hasErrors);
    console.log('Validation Errors:', formState.errors);
    console.log('Geocoding Success:', formState.geocodingSuccess);
    console.log('Geocoding Error:', formState.geocodingError);
    console.log('Submit Button Disabled:', formState.submitButtonDisabled);

    if (formState.hasErrors) {
      console.log('❌ ISSUE FOUND: Form has validation errors preventing submission');
      formState.errors.forEach(error => console.log(`   - ${error}`));
    }

    if (formState.submitButtonDisabled) {
      console.log('❌ ISSUE FOUND: Submit button is disabled');
    }

    console.log('📍 Step 4: Attempt form submission...');

    // Count network requests before submission
    const requestsBefore = networkRequests.length;

    // Submit the form
    await page.click('button[type="submit"]');

    // Wait for potential API calls
    await page.waitForTimeout(3000);

    const requestsAfter = networkRequests.length;
    const newRequests = networkRequests.slice(requestsBefore);

    console.log('📊 Submission Results:');
    console.log('======================');
    console.log('Network requests made during submission:', newRequests.length);

    if (newRequests.length === 0) {
      console.log('❌ CRITICAL ISSUE: No network requests made during form submission!');
      console.log('💡 This suggests the form validation is blocking submission');

      // Check for error messages that appeared after submission
      const postSubmissionErrors = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.text-red-600')).map(el => el.textContent);
      });

      console.log('📋 Errors after submission attempt:', postSubmissionErrors);

    } else {
      console.log('✅ Network requests were made:');
      newRequests.forEach(req => {
        console.log(`   ${req.method} ${req.url}`);
        if (req.postData) {
          console.log(`   Data: ${req.postData}`);
        }
      });
    }

    // Check if chart was rendered
    const chartRendered = await page.evaluate(() => {
      return document.querySelector('.kundli-template svg') !== null;
    });

    console.log('Chart SVG rendered:', chartRendered);

    console.log('\n🎯 DIAGNOSIS SUMMARY:');
    console.log('=====================');

    if (!formState.geocodingSuccess && formState.geocodingError) {
      console.log('🔴 ROOT CAUSE: Geocoding failed, preventing form submission');
      console.log('💡 SOLUTION: Form should allow submission with fallback coordinates');
    } else if (formState.hasErrors) {
      console.log('🔴 ROOT CAUSE: Form validation errors preventing submission');
      console.log('💡 SOLUTION: Fix validation logic or requirements');
    } else if (formState.submitButtonDisabled) {
      console.log('🔴 ROOT CAUSE: Submit button disabled by loading state or other logic');
      console.log('💡 SOLUTION: Check button enable/disable logic');
    } else if (newRequests.length === 0) {
      console.log('🔴 ROOT CAUSE: Form submission prevented by unknown validation or logic');
      console.log('💡 SOLUTION: Debug form submission handler');
    } else {
      console.log('🟡 PARTIAL SUCCESS: Form submitted but chart not rendered');
      console.log('💡 SOLUTION: Check API response handling and chart rendering logic');
    }

    // Keep browser open for manual inspection
    console.log('\n🔍 Browser kept open for manual inspection. Press Ctrl+C to close.');
    await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds

  } catch (error) {
    console.error('❌ Diagnosis failed:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

diagnoseProductionForm().catch(console.error);
