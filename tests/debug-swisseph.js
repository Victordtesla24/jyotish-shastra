/**
 * Debug Swiss Ephemeris (WebAssembly) initialization and basic functionality
 */
import { setupSwissephWithEphemeris } from '../src/utils/swisseph-wrapper.js';
import path from 'path';
import fs from 'fs';

async function debugSwisseph() {
  console.log('🔍 Debugging Swiss Ephemeris (WASM)');
  
  try {
    // Initialize sweph-wasm using improved wrapper with ephemeris setup
    console.log('Initializing Swiss Ephemeris (WASM) with ephemeris setup...');
    const ephePath = path.resolve(process.cwd(), 'ephemeris');
    console.log('Ephemeris path:', ephePath);
    console.log('Ephemeris exists:', fs.existsSync(ephePath));
    
    if (fs.existsSync(ephePath)) {
      const files = fs.readdirSync(ephePath);
      console.log('Ephemeris files:', files);
    }
    
    const { swisseph } = await setupSwissephWithEphemeris(ephePath);
    console.log('✅ Swiss Ephemeris initialized with ephemeris via wrapper');
    
    // Test basic calculation - get Sun position
    console.log('Testing Sun position calculation...');
    const date = new Date('1997-12-18T00:00:00Z');
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();
    const hour = 0;
    
    console.log('Testing date:', { year, month, day, hour });
    
    const jd = await swisseph.swe_julday(year, month, day, hour, 1);
    console.log('Julian Day:', jd);
    
    // Get Sun position
    const flags = 2; // SEFLG_SWIEPH = 2
    const result = await swisseph.swe_calc_ut(jd, 0, flags); // 0 = SE_SUN
    
    console.log('Calculation result:', result);
    
    if (Array.isArray(result) && result.length >= 6) {
      const [longitude, latitude, distance, speedLon, speedLat, speedDist] = result;
      console.log('✅ Sun position calculation successful');
      console.log('Sun longitude:', longitude, 'degrees');
      console.log('Sun latitude:', latitude, 'degrees');
      console.log('Sun distance:', distance, 'AU');
      console.log('Sun speeds:', { speedLon, speedLat, speedDist });
    } else {
      console.log('❌ Sun position calculation failed, result format:', typeof result, result);
    }
    
    // Test sunrise
    console.log('Testing sunrise calculation...');
    const geopos = [74.5411575, 32.4935378, 0]; // lon, lat, altitude
    const jdNoon = jd; // Use noon as reference
    
    const riseResult = await swisseph.swe_rise_trans(
      jdNoon,
      0, // SE_SUN
      '',
      2, // SEFLG_SWIEPH
      1, // SE_CALC_RISE = 1
      geopos,
      0, // pressure
      0  // temperature
    );
    
    console.log('Sunrise result:', riseResult);
    
    if (typeof riseResult === 'number' && !isNaN(riseResult)) {
      console.log('✅ Sunrise calculation successful');
      console.log('Sunrise JD:', riseResult);
      
      // Convert JD to readable time
      const sunriseDate = new Date();
      // Convert JD to Unix timestamp (approximate)
      const unixTime = (riseResult - 2440587.5) * 86400000;
      sunriseDate.setTime(unixTime);
      console.log('Sunrise time:', sunriseDate.toISOString());
    } else {
      console.log('❌ Sunrise calculation failed');
      console.log('Result:', riseResult);
    }
    
  } catch (error) {
    console.log('❌ Swiss Ephemeris debug failed:', error.message);
    console.log('Full error:', error);
  }
}

debugSwisseph();
