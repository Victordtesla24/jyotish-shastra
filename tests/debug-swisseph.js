/**
 * Debug Swiss Ephemeris initialization and basic functionality
 */
import swisseph from 'swisseph';
import path from 'path';
import fs from 'fs';

async function debugSwisseph() {
  console.log('🔍 Debugging Swiss Ephemeris');
  
  try {
    // Check ephemeris path
    const ephePath = path.resolve(process.cwd(), 'ephemeris');
    console.log('Ephemeris path:', ephePath);
    console.log('Ephemeris exists:', fs.existsSync(ephePath));
    
    if (fs.existsSync(ephePath)) {
      const files = fs.readdirSync(ephePath);
      console.log('Ephemeris files:', files);
    }
    
    // Initialize Swiss Ephemeris
    console.log('Initializing Swiss Ephemeris...');
    swisseph.swe_set_ephe_path(ephePath);
    
    // Test basic calculation - get Sun position
    console.log('Testing Sun position calculation...');
    const date = new Date('1997-12-18T00:00:00Z');
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();
    const hour = 0;
    
    console.log('Testing date:', { year, month, day, hour });
    
    const jd = swisseph.swe_julday(year, month, day, hour, 1);
    console.log('Julian Day:', jd);
    
    // Get Sun position
    const flags = swisseph.SEFLG_SWIEPH;
    const result = swisseph.swe_calc_ut(jd, swisseph.SE_SUN, flags);
    
    console.log('Calculation result:', result);
    
    if (result && result.rflag === 0) {
      console.log('✅ Sun position calculation successful');
      console.log('Sun longitude:', result.longitude, 'degrees');
    } else {
      console.log('❌ Sun position calculation failed, rflag:', result?.rflag);
    }
    
    // Test sunrise
    console.log('Testing sunrise calculation...');
    const geopos = [74.5411575, 32.4935378, 0]; // lon, lat, altitude
    const jdNoon = jd; // Use noon as reference
    
    const riseResult = swisseph.swe_rise_trans(
      jdNoon,
      swisseph.SE_SUN,
      '',
      swisseph.SEFLG_SWIEPH,
      swisseph.SE_CALC_RISE,
      geopos,
      0, // pressure
      0  // temperature
    );
    
    console.log('Sunrise result:', riseResult);
    
    if (riseResult && riseResult.tret) {
      console.log('✅ Sunrise calculation successful');
      console.log('Sunrise JD:', riseResult.tret);
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
