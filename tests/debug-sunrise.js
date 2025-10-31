/**
 * Debug sunrise calculation issue
 */
import { computeSunriseSunset } from '../src/core/calculations/astronomy/sunrise.js';

async function debugSunrise() {
  console.log('🔍 Debugging Sunrise Calculation');
  
  try {
    const dateLocal = new Date('1997-12-18T02:30:00');
    const latitude = 32.4935378;
    const longitude = 74.5411575;
    const timezone = 'Asia/Karachi';
    
    console.log('Input data:', { dateLocal, latitude, longitude, timezone });
    
    // Try sunrise calculation
    const result = await computeSunriseSunset(dateLocal, latitude, longitude, timezone, {
      useRefraction: false,
      useUpperLimb: true
    });
    
    console.log('✅ Sunrise calculation successful');
    console.log('Sunrise:', result.sunriseLocal);
    console.log('Sunset:', result.sunsetLocal);
    
  } catch (error) {
    console.log('❌ Sunrise calculation failed:', error.message);
    console.log('Full error:', error);
  }
}

debugSunrise();
