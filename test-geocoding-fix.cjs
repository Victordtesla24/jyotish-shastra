/**
 * Test script to verify geocoding API call fix
 * Monitors API calls and validates reduced frequency
 */

const http = require('http');

let callCount = 0;
let lastCallTime = 0;
let callsInLastSecond = 0;

const testLocation = 'Mumbai, Maharashtra, India';
const testDuration = 10000; // 10 seconds
const maxCallsPerSecond = 2; // Should not exceed 2 calls per second after fix

console.log('🧪 Testing geocoding API call fix...');
console.log(`📝 Testing with location: ${testLocation}`);
console.log(`⏱️  Test duration: ${testDuration}ms`);
console.log(`�� Expected: Max ${maxCallsPerSecond} calls per second\n`);

const testAPI = () => {
  const startTime = Date.now();
  
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/v1/geocoding/location',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      callCount++;
      const now = Date.now();
      const timeSinceLastCall = now - lastCallTime;
      
      if (timeSinceLastCall < 1000) {
        callsInLastSecond++;
      } else {
        callsInLastSecond = 1;
      }
      
      lastCallTime = now;
      
      const elapsed = now - startTime;
      console.log(`Call #${callCount} - Response: ${res.statusCode} - Time: ${elapsed}ms - Calls/sec: ${callsInLastSecond}`);
      
      if (callsInLastSecond > maxCallsPerSecond) {
        console.error(`❌ ERROR: ${callsInLastSecond} calls in last second exceeds limit of ${maxCallsPerSecond}`);
      }
      
      if (elapsed < testDuration) {
        setTimeout(testAPI, 500); // Simulate typing every 500ms
      } else {
        console.log(`\n✅ Test completed`);
        console.log(`📊 Total calls: ${callCount}`);
        console.log(`⏱️  Duration: ${elapsed}ms`);
        console.log(`📈 Average calls/second: ${(callCount / (elapsed / 1000)).toFixed(2)}`);
        process.exit(callsInLastSecond > maxCallsPerSecond ? 1 : 0);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`❌ Request error: ${e.message}`);
    process.exit(1);
  });

  req.write(JSON.stringify({ placeOfBirth: testLocation }));
  req.end();
};

// Start test
testAPI();

// Safety timeout
setTimeout(() => {
  console.log('\n⏰ Test timeout reached');
  process.exit(callsInLastSecond > maxCallsPerSecond ? 1 : 0);
}, testDuration + 5000);
