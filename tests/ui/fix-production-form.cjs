const puppeteer = require('puppeteer');

async function fixAndTestProductionForm() {
  console.log('🔧 PRODUCTION FORM FIX - Testing with corrected input handling...');

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: false,
      devtools: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Monitor API calls
    await page.setRequestInterception(true);
    page.on('request', request => {
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

    console.log('📍 Step 2: Fill form with corrected input method...');

    // FIXED: Clear and set date input properly
    await page.focus('#dateOfBirth');
    await page.keyboard.down('Control');
    await page.keyboard.press('KeyA');
    await page.keyboard.up('Control');
    await page.keyboard.type('1997-12-18');

    // FIXED: Clear and set time input properly
    await page.focus('#timeOfBirth');
    await page.keyboard.down('Control');
    await page.keyboard.press('KeyA');
    await page.keyboard.up('Control');
    await page.keyboard.type('02:30');

    // Set place (this worked fine before)
    await page.focus('#placeOfBirth');
    await page.keyboard.down('Control');
    await page.keyboard.press('KeyA');
    await page.keyboard.up('Control');
    await page.keyboard.type('Lahore, Punjab, Pakistan');

    // Wait for geocoding
    console.log('⏳ Waiting for geocoding...');
    await page.waitForFunction(
      () => {
        const successElement = document.querySelector('.text-green-600');
        return successElement && successElement.textContent.includes('Location found');
      },
      { timeout: 10000 }
    ).catch(() => console.log('⚠️ Geocoding timeout'));

    // Set timezone
    await page.select('#timeZone', 'Asia/Karachi');

    // Set gender
    await page.select('select[name="gender"]', 'male');

    console.log('📍 Step 3: Verify form state...');

    const formState = await page.evaluate(() => {
      const form = document.getElementById('birth-data-form');
      const formData = new FormData(form);
      const data = {};
      for (let [key, value] of formData.entries()) {
        data[key] = value;
      }

      // Check for validation errors
      const errors = Array.from(document.querySelectorAll('.text-red-600')).map(el => el.textContent);

      return {
        formData: data,
        hasErrors: errors.length > 0,
        errors: errors,
        submitButtonDisabled: document.querySelector('button[type="submit"]')?.disabled || false
      };
    });

    console.log('📊 Corrected Form State:');
    console.log('========================');
    console.log('Form Data:', formState.formData);
    console.log('Has Validation Errors:', formState.hasErrors);
    console.log('Validation Errors:', formState.errors);
    console.log('Submit Button Disabled:', formState.submitButtonDisabled);

    if (!formState.hasErrors) {
      console.log('✅ Form validation passed! Attempting submission...');

      // Submit the form
      await page.click('button[type="submit"]');

      // Wait for chart generation
      console.log('⏳ Waiting for chart generation...');

      try {
        await page.waitForFunction(
          () => {
            return document.querySelector('.kundli-template svg') !== null;
          },
          { timeout: 30000 }
        );

        console.log('🎉 SUCCESS! Chart SVG rendered successfully!');
        console.log('✅ Production form is now working correctly.');

      } catch (error) {
        console.log('⚠️ Chart not rendered yet, checking for other success indicators...');

        // Check for success messages or data
        const pageContent = await page.evaluate(() => document.body.textContent);
        if (pageContent.includes('Chart generated') || pageContent.includes('success')) {
          console.log('✅ Chart generation appears to be successful based on page content');
        } else {
          console.log('❌ Chart generation may have failed');
        }
      }

    } else {
      console.log('❌ Form still has validation errors:');
      formState.errors.forEach(error => console.log(`   - ${error}`));
    }

    // Keep browser open for inspection
    console.log('\n🔍 Browser kept open for inspection. Press Ctrl+C to close.');
    await new Promise(resolve => setTimeout(resolve, 30000));

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

fixAndTestProductionForm().catch(console.error);
