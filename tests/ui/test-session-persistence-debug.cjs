/**
 * Simple test to debug session persistence issue
 */

const puppeteer = require('puppeteer');

async function testSessionPersistence() {
  console.log('🔍 DEBUG: Session Persistence Test');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Track console logs
    const logs = [];
    page.on('console', msg => {
      logs.push({ type: msg.type(), text: msg.text() });
      console.log(`🖥️ [${msg.type()}]: ${msg.text()}`);
    });
    
    // Navigate to homepage
    console.log('📍 Step 1: Navigate to homepage');
    await page.goto('http://localhost:3002', { waitUntil: 'networkidle2' });
    
    // Fill form manually with direct field access
    console.log('📍 Step 2: Fill form fields');
    
    await page.evaluate(() => {
      const fields = {
        name: document.querySelector('input[name="name"]'),
        dateOfBirth: document.querySelector('input[name="dateOfBirth"]'),
        timeOfBirth: document.querySelector('input[name="timeOfBirth"]'),
        placeOfBirth: document.querySelector('input[name="placeOfBirth"]')
      };
      
      // Fill fields manually
      if (fields.name) {
        fields.name.value = 'Test User';
        fields.name.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
        fields.name.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
        fields.name.blur();
      }
      
      if (fields.dateOfBirth) {
        fields.dateOfBirth.value = '1985-12-15';
        fields.dateOfBirth.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
        fields.dateOfBirth.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
        fields.dateOfBirth.blur();
      }
      
      if (fields.timeOfBirth) {
        fields.timeOfBirth.value = '08:30';
        fields.timeOfBirth.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
        fields.timeOfBirth.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
        fields.timeOfBirth.blur();
      }
      
      if (fields.placeOfBirth) {
        fields.placeOfBirth.value = 'Delhi, India';
        fields.placeOfBirth.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
        fields.placeOfBirth.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
        fields.placeOfBirth.blur();
      }
      
      // Wait for geocoding to complete
      setTimeout(() => {
        console.log('🔍 Waiting for geocoding to complete...');
      }, 3000);
      
      // Get current form values
      return Array.from(document.querySelectorAll('input')).map(input => ({
        name: input.name,
        value: input.value
      }));
    });
    
    console.log('📍 Step 3: Check session before submission');
    const beforeSession = await page.evaluate(() => ({
      sessionKeys: Object.keys(sessionStorage).length,
      localKeys: Object.keys(localStorage).length,
      hasBirthData: sessionStorage.getItem('birthData') !== null,
      hasCurrentSession: sessionStorage.getItem('current_session') !== null
    }));
    
    console.log(`   Before: Session keys: ${beforeSession.sessionKeys}, Local keys: ${beforeSession.localKeys}`);
    console.log(`   Before: Has birthData: ${beforeSession.hasBirthData}, Has current_session: ${beforeSession.hasCurrentSession}`);
    
    // Try clicking the button directly
    console.log('📍 Step 4: Click generate button');
    
    const clickResult = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const generateBtn = buttons.find(b => 
        b.textContent.toLowerCase().includes('generate') || 
        b.textContent.toLowerCase().includes('chart')
      );
      
      if (generateBtn) {
        console.log(`✅ Found button: ${generateBtn.textContent}`);
        generateBtn.click();
        return true;
      } else {
        console.log('❌ Generate button not found');
        return false;
      }
    });
    
    if (!clickResult) {
      console.log('❌ Failed to find and click generate button');
      return;
    }
    
    // Wait for form submission to process
    await new Promise(resolve => setTimeout(resolve, 8000));
    
    // Check session after submission
    console.log('📍 Step 5: Check session after submission');
    const afterSession = await page.evaluate(() => ({
      sessionKeys: Object.keys(sessionStorage),
      localKeys: Object.keys(localStorage),
      allSessionKeys: Object.keys(sessionStorage),
      allLocalKeys: Object.keys(localStorage),
      hasBirthData: sessionStorage.getItem('birthData') !== null,
      hasCurrentSession: sessionStorage.getItem('current_session') !== null,
      birthDataValue: sessionStorage.getItem('birthData'),
      jyotishKeys: Object.keys(sessionStorage).filter(k => k.includes('jyotish'))
    }));
    
    console.log(`   After: Session keys: ${afterSession.sessionKeys.length}, Local keys: ${afterSession.localKeys.length}`);
    console.log(`   After: Has birthData: ${afterSession.hasBirthData}, Has current_session: ${afterSession.hasCurrentSession}`);
    console.log(`   All Session Keys: ${afterSession.allSessionKeys.join(', ')}`);
    console.log(`   Jyotish Keys: ${afterSession.jyotishKeys.join(', ')}`);
    
    // Check if session persistence succeeded
    const sessionPersisted = afterSession.sessionKeys.length > 0 && 
                          (afterSession.hasBirthData || afterSession.hasCurrentSession || afterSession.jyotishKeys.length > 0);
    
    console.log(`\n${sessionPersisted ? '✅' : '❌'} Session Persistence: ${sessionPersisted ? 'SUCCESS' : 'FAILED'}`);
    
    // Check button state to see if submission was prevented
    const buttonDisabled = await page.evaluate(() => {
      const generateBtn = document.querySelector('[data-testid="generate-chart-button"]');
      if (!generateBtn) return 'not found';
      return generateBtn.disabled;
    });
    
    console.log(`   Button disabled state: ${buttonDisabled}`);
    
    // Check form validation state
    const formState = await page.evaluate(() => {
      const birthDataForm = document.querySelector('form');
      const nameInput = document.querySelector('input[name="name"]');
      const dateInput = document.querySelector('input[name="dateOfBirth"]');
      const timeInput = document.querySelector('input[name="timeOfBirth"]');
      const placeInput = document.querySelector('input[name="placeOfBirth"]');
      
      return {
        hasName: nameInput?.value || '',
        hasDate: dateInput?.value || '',
        hasTime: timeInput?.value || '',
        hasPlace: placeInput?.value || '',
        allRequired: !!(nameInput?.value && dateInput?.value && timeInput?.value && placeInput?.value)
      };
    });
    
    console.log('   Form validation state:', formState);
    
    // Log console messages that might indicate what went wrong
    const submissionLogs = logs.filter(log => 
      log.text.includes('handleSubmit') || 
      log.text.includes('BirthDataForm') || 
      log.text.includes('saveSession') ||
      log.text.includes('onSubmit') ||
      log.text.includes('button clicked')
    );
    
    if (submissionLogs.length === 0) {
      console.log('⚠️  No form submission logs found - handleSubmit may not have been called');
    } else {
      console.log('✅ Form submission logs found:');
      submissionLogs.forEach(log => console.log(`   [${log.type}]: ${log.text}`));
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
  
  console.log('🔍 DEBUG: Session Persistence Test Complete');
}

testSessionPersistence().catch(console.error);
