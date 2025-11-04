/**
 * Flow 1 Test - Birth Chart Generation
 * 
 * Standalone test to verify Flow 1 fixes
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { spawn } = require('child_process');
const util = require('util');

const execAsync = util.promisify(require('child_process').exec);

// Spawn wrapper for safe command execution without shell
function spawnAsync(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { ...options, shell: false });
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr, code });
      } else {
        reject(new Error(`Command failed with code ${code}: ${stderr}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

// Test data
const testData = {
  name: "Farhan Ahmed",
  dateOfBirth: "1997-12-18",
  timeOfBirth: "02:30",
  placeOfBirth: "Sialkot, Pakistan",
  latitude: 32.4935378,
  longitude: 74.5411575,
  timezone: "Asia/Karachi",
  gender: "male"
};

async function testApiEndpoint(endpoint, birthData) {
  const url = `http://localhost:3001${endpoint}`;
  const dataPayload = JSON.stringify(birthData);
  
  const tempFile = path.join(os.tmpdir(), `curl-payload-${Date.now()}-${Math.random().toString(36).substring(7)}.json`);
  fs.writeFileSync(tempFile, dataPayload, 'utf8');
  
  try {
    const curlPath = 'curl';
    const curlArgs = [
      '-s',
      '-X', 'POST',
      url,
      '-H', 'Content-Type: application/json',
      '-d', `@${tempFile}`
    ];
    
    let stdout, stderr;
    try {
      const result = await spawnAsync(curlPath, curlArgs, { shell: false });
      stdout = result.stdout;
      stderr = result.stderr;
    } catch (spawnError) {
      if (fs.existsSync(curlPath)) {
        try {
          const realPath = fs.realpathSync(curlPath);
          if (realPath !== curlPath && fs.existsSync(realPath)) {
            const result = await spawnAsync(realPath, curlArgs, { shell: false });
            stdout = result.stdout;
            stderr = result.stderr;
          } else {
            throw spawnError;
          }
        } catch (realpathError) {
          throw spawnError;
        }
      } else {
        throw spawnError;
      }
    }
    
    if (stderr && stderr.trim()) {
      const stderrTrimmed = stderr.trim();
      if (!stderrTrimmed.includes('Warning') && !stderrTrimmed.includes('Note')) {
        if (stderrTrimmed.includes('/bin/sh') || stderrTrimmed.includes('syntax error')) {
          throw new Error(`Shell error detected: ${stderrTrimmed}`);
        }
      }
    }
    
    if (!stdout || stdout.trim().length === 0) {
      throw new Error(`curl returned empty response. stderr: ${stderr || 'none'}`);
    }
    
    let responseData;
    try {
      responseData = JSON.parse(stdout);
    } catch (parseError) {
      responseData = { error: 'Invalid JSON response', raw: stdout.substring(0, 500) };
    }
    
    return {
      success: !responseData.error && (responseData.success !== false),
      response: responseData,
      timestamp: new Date().toISOString(),
      responseSize: stdout.length
    };
    
  } finally {
    if (fs.existsSync(tempFile)) {
      try {
        fs.unlinkSync(tempFile);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  }
}

async function runFlow1Test() {
  console.log('🚀 FLOW 1 TEST - BIRTH CHART GENERATION');
  console.log('========================================\n');

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: null
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  // Monitor console for errors (especially React boolean attribute warnings)
  const errors = [];
  const warnings = [];
  
  page.on('console', msg => {
    const text = msg.text();
    const type = msg.type();
    
    if (type === 'error' || text.includes('ERROR') || text.includes('❌')) {
      errors.push({ type, message: text, timestamp: new Date().toISOString() });
      console.log(`🖥️  FRONTEND ${type.toUpperCase()}: ${text.substring(0, 200)}`);
    } else if (type === 'warning' || text.includes('WARNING') || text.includes('⚠️')) {
      warnings.push({ type, message: text, timestamp: new Date().toISOString() });
      if (text.includes('boolean attribute') || text.includes('jsx')) {
        console.log(`⚠️  FRONTEND WARNING: ${text.substring(0, 200)}`);
      }
    }
  });

  page.on('pageerror', error => {
    errors.push({ type: 'pageerror', message: error.message, stack: error.stack });
    console.error(`🚨 PAGE ERROR: ${error.message}`);
  });

  try {
    const flowStartTime = Date.now();
    let success = false;
    const details = {};

    // Step 1: Navigate to homepage
    console.log('📍 Step 1: Navigate to homepage');
    await page.goto('http://localhost:3002', { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 2: Fill form - Ensure React state updates properly
    console.log('📍 Step 2: Filling birth data form');
    await page.evaluate((data) => {
      // Find inputs using React-friendly selectors
      const nameInput = document.querySelector('input[name="name"]');
      const dateInput = document.querySelector('input[name="dateOfBirth"]');
      const timeInput = document.querySelector('input[name="timeOfBirth"]');
      const placeInput = document.querySelector('input[name="placeOfBirth"]');

      // Set values and trigger React-compatible events
      if (nameInput) {
        nameInput.focus();
        nameInput.value = data.name;
        nameInput.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
        nameInput.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
        nameInput.blur();
      }
      
      if (dateInput) {
        dateInput.focus();
        dateInput.value = data.dateOfBirth;
        dateInput.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
        dateInput.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
        dateInput.blur();
      }
      
      if (timeInput) {
        timeInput.focus();
        timeInput.value = data.timeOfBirth;
        timeInput.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
        timeInput.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
        timeInput.blur();
      }
      
      if (placeInput) {
        placeInput.focus();
        placeInput.value = data.placeOfBirth;
        // Trigger input event first to trigger geocoding
        placeInput.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
        // Then trigger change event for form state
        placeInput.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
        placeInput.blur();
      }
    }, testData);

    // Wait for geocoding to complete and form state to update
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Verify form values are set correctly
    const formValues = await page.evaluate(() => {
      const nameInput = document.querySelector('input[name="name"]');
      const dateInput = document.querySelector('input[name="dateOfBirth"]');
      const timeInput = document.querySelector('input[name="timeOfBirth"]');
      const placeInput = document.querySelector('input[name="placeOfBirth"]');
      
      return {
        name: nameInput?.value || '',
        dateOfBirth: dateInput?.value || '',
        timeOfBirth: timeInput?.value || '',
        placeOfBirth: placeInput?.value || ''
      };
    });
    console.log(`   🔍 Form values: name=${formValues.name}, date=${formValues.dateOfBirth}, time=${formValues.timeOfBirth}, place=${formValues.placeOfBirth}`);

    // Step 3: Submit form
    console.log('📍 Step 3: Submitting form');
    
    // Monitor console for form submission logs
    const formSubmissionLogs = [];
    const consoleListener = msg => {
      const text = msg.text();
      if (text.includes('BirthDataForm') || text.includes('HomePage') || text.includes('handleFormSubmit') || text.includes('handleSubmit')) {
        formSubmissionLogs.push({ type: msg.type(), text: text.substring(0, 200) });
        console.log(`📝 Form Log: ${text.substring(0, 200)}`);
      }
    };
    page.on('console', consoleListener);
    
    // Wait for form to be ready
    await page.waitForSelector('form, button[type="submit"]', { timeout: 5000 }).catch(() => {});
    
    // Check sessionStorage BEFORE form submission
    const beforeSession = await page.evaluate(() => ({
      sessionKeys: Object.keys(sessionStorage),
      localKeys: Object.keys(localStorage)
    }));
    console.log(`   🔍 Before submission - Session keys: ${beforeSession.sessionKeys.length}, Local keys: ${beforeSession.localKeys.length}`);
    
    const buttonClicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const submitBtn = buttons.find(b => 
        b.type === 'submit' || 
        b.textContent.toLowerCase().includes('generate') || 
        b.textContent.toLowerCase().includes('chart') ||
        b.textContent.toLowerCase().includes('submit')
      );
      
      if (submitBtn) {
        // Trigger form submission properly
        const form = submitBtn.closest('form');
        if (form && submitBtn.type === 'submit') {
          // Create and dispatch submit event
          const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
          form.dispatchEvent(submitEvent);
        } else {
          // Fallback to button click
        submitBtn.click();
        }
        return true;
      }
      return false;
    });

    if (buttonClicked) {
      // Wait for API response to ensure form submission completed
      await page.waitForResponse(response => 
          response.url().includes('/api/v1/chart/generate') && response.status() === 200,
          { timeout: 30000 }
      ).catch(() => {});
      
      // Wait for navigation
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {});
      
      // Wait extra time for all saves to complete
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Check sessionStorage AFTER form submission
      const afterSession = await page.evaluate(() => ({
        sessionKeys: Object.keys(sessionStorage),
        localKeys: Object.keys(localStorage),
        hasBirthData: sessionStorage.getItem('birthData') !== null,
        hasCurrentSession: sessionStorage.getItem('current_session') !== null
      }));
      console.log(`   🔍 After submission - Session keys: ${afterSession.sessionKeys.length}, Local keys: ${afterSession.localKeys.length}`);
      console.log(`   🔍 Has birthData: ${afterSession.hasBirthData}, Has current_session: ${afterSession.hasCurrentSession}`);
      console.log(`   📝 Form submission logs captured: ${formSubmissionLogs.length} entries`);
      
      // Remove console listener
      page.off('console', consoleListener);
    } else {
      console.log('   ⚠️  Submit button not found - form submission may not have occurred');
    }

    // Step 4: Verify chart generation API
    console.log('📍 Step 4: Verifying chart generation API');
    const chartApiCall = await testApiEndpoint('/api/v1/chart/generate', testData);
    details.chartApiSuccess = chartApiCall && chartApiCall.success === true;
    console.log(`   ${details.chartApiSuccess ? '✅' : '❌'} API Success: ${details.chartApiSuccess}`);
    console.log(`   📊 Response Size: ${chartApiCall.responseSize} bytes`);

    // Step 5: Verify chart display
    console.log('📍 Step 5: Verifying chart display');
    const currentUrl = page.url();
    if (!currentUrl.includes('/chart')) {
      await page.goto('http://localhost:3002/chart', { waitUntil: 'networkidle2' });
    }
    await new Promise(resolve => setTimeout(resolve, 8000));

    const chartDisplayed = await page.evaluate(() => {
      const selectors = [
        '[class*="chart"]',
        '[class*="vedic"]',
        'svg',
        '[id*="chart"]',
        '[id*="kundli"]'
      ];
      
      for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element) {
          return true;
        }
      }
      return false;
    });
    details.chartDisplayed = chartDisplayed;
    console.log(`   ${chartDisplayed ? '✅' : '❌'} Chart Displayed: ${chartDisplayed}`);

    // Step 6: Verify session persistence
    console.log('📍 Step 6: Verifying session persistence');
    // Wait for session save to complete - increase wait time
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const sessionData = await page.evaluate(() => {
      const sessionKeys = Object.keys(sessionStorage);
      const localKeys = Object.keys(localStorage);
      
      // Check for various session key patterns
      const birthChartKeys = sessionKeys.filter(k => {
        const keyLower = k.toLowerCase();
        return keyLower.includes('birth') || 
               keyLower.includes('chart') ||
               keyLower.includes('jyotish') ||
               keyLower.includes('session') ||
               keyLower === 'current_session';
      });
      
      const localBirthChartKeys = localKeys.filter(k => {
        const keyLower = k.toLowerCase();
        return keyLower.includes('birth') ||
               keyLower.includes('chart') ||
               keyLower.includes('jyotish');
      });
      
      // Also check actual values
      const hasBirthData = sessionStorage.getItem('birthData') !== null;
      const hasCurrentSession = sessionStorage.getItem('current_session') !== null;
      const hasLocalBirthData = localStorage.getItem('jyotish_shastra_data_birthData') !== null;
      
      // Debug: Check for UIDataSaver timestamped keys
      const jyotishKeys = sessionKeys.filter(k => k.startsWith('jyotish_'));
      const hasChartGenerateKey = sessionKeys.some(k => k.startsWith('jyotish_api_chart_generate_'));
      
      return {
        sessionStorageKeys: birthChartKeys.length > 0 || hasBirthData || hasCurrentSession || hasChartGenerateKey,
        localStorageKeys: localBirthChartKeys.length > 0 || hasLocalBirthData,
        sessionKeyCount: birthChartKeys.length,
        localKeyCount: localBirthChartKeys.length,
        allSessionKeys: sessionKeys,
        allLocalKeys: localKeys,
        hasBirthData,
        hasCurrentSession,
        hasLocalBirthData,
        jyotishKeys: jyotishKeys,
        hasChartGenerateKey,
        totalSessionKeys: sessionKeys.length,
        totalLocalKeys: localKeys.length
      };
    });
    
    details.sessionPersisted = sessionData.sessionStorageKeys || sessionData.localStorageKeys;
    console.log(`   ${details.sessionPersisted ? '✅' : '❌'} Session Persisted: ${details.sessionPersisted}`);
    console.log(`   📊 Session Keys: ${sessionData.sessionKeyCount}, Local Keys: ${sessionData.localKeyCount}`);
    console.log(`   🔍 Has birthData key: ${sessionData.hasBirthData}`);
    console.log(`   🔍 Has current_session key: ${sessionData.hasCurrentSession}`);
    console.log(`   🔍 Has local birthData: ${sessionData.hasLocalBirthData}`);
    console.log(`   🔍 Has chart generate key: ${sessionData.hasChartGenerateKey}`);
    console.log(`   📋 All Session Keys (${sessionData.totalSessionKeys}): ${sessionData.allSessionKeys.join(', ') || 'none'}`);
    console.log(`   📋 All Local Keys (${sessionData.totalLocalKeys}): ${sessionData.allLocalKeys.join(', ') || 'none'}`);
    console.log(`   📋 Jyotish Keys: ${sessionData.jyotishKeys.join(', ') || 'none'}`);

    // Check for React boolean attribute warnings
    const hasBooleanAttributeWarning = warnings.some(w => 
      w.message.includes('boolean attribute') || w.message.includes('jsx=true')
    );
    
    if (hasBooleanAttributeWarning) {
      console.log(`   ⚠️  React boolean attribute warning still present: ${warnings.find(w => w.message.includes('boolean attribute'))?.message.substring(0, 100)}`);
    } else {
      console.log(`   ✅ No React boolean attribute warnings detected`);
    }

    success = details.chartApiSuccess && chartDisplayed && details.sessionPersisted;
    const flowTime = Date.now() - flowStartTime;
    details.executionTime = flowTime;
    details.errors = errors;
    details.warnings = warnings;

    console.log(`\n✅ Flow 1 ${success ? 'PASSED' : 'FAILED'} (${flowTime}ms)`);
    console.log(`\n📊 Error Summary:`);
    console.log(`   Frontend Errors: ${errors.length}`);
    console.log(`   Frontend Warnings: ${warnings.length}`);
    if (hasBooleanAttributeWarning) {
      console.log(`   ⚠️  React boolean attribute warning: ${warnings.filter(w => w.message.includes('boolean attribute')).length} occurrence(s)`);
    }

    if (!success) {
      console.log(`\n🔍 Debug Info:`);
      console.log(`   Chart API Success: ${details.chartApiSuccess}`);
      console.log(`   Chart Displayed: ${chartDisplayed}`);
      console.log(`   Session Persisted: ${details.sessionPersisted}`);
    }

    return { success, details };

  } catch (error) {
    console.error(`❌ Flow 1 test failed:`, error.message);
    console.error(error.stack);
    return { success: false, error: error.message };
  } finally {
    console.log('\n🔒 Closing browser in 3 seconds...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    await browser.close();
  }
}

// Run the test
runFlow1Test().catch(console.error);

