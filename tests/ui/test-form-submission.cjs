// Simple test to verify form submission and API calls
const axios = require('axios');

const testData = {
  dateOfBirth: '1997-12-18',
  timeOfBirth: '02:30',
  latitude: 19.0760,
  longitude: 72.8777,
  timezone: 'Asia/Kolkata',
  gender: 'male'
};

console.log('🧪 Testing API call directly...');

async function testDirectAPICall() {
  try {
    console.log('📡 Making direct API call to chart generation endpoint');
    console.log('🔗 URL: http://localhost:3001/api/v1/chart/generate');
    console.log('📋 Payload:', JSON.stringify(testData, null, 2));

    const response = await axios.post('http://localhost:3001/api/v1/chart/generate', testData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    console.log('✅ SUCCESS!');
    console.log('📈 Status:', response.status);
    console.log('📋 Response:', JSON.stringify(response.data, null, 2));

    return true;
  } catch (error) {
    console.error('❌ FAILED!');
    console.error('📛 Error:', error.message);
    if (error.response) {
      console.error('📈 Status:', error.response.status);
      console.error('📋 Response:', JSON.stringify(error.response.data, null, 2));
    }
    return false;
  }
}

// Run the test
testDirectAPICall().then(success => {
  if (success) {
    console.log('\n✅ Direct API call works - the issue is in the frontend form submission');
  } else {
    console.log('\n❌ API call failed - need to fix backend first');
  }
  process.exit(success ? 0 : 1);
});
