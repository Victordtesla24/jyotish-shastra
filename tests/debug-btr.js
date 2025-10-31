/**
 * Debug script to identify why BTR quick validation returns simplified response
 */
import axios from 'axios';

const API_BASE = 'http://localhost:3001/api/v1/rectification';

async function debugBTRQuick() {
  console.log('🔍 Debugging BTR Quick Validation');
  
  try {
    console.log('1. Testing raw quick endpoint...');
    const quickResponse = await axios.post(`${API_BASE}/quick`, {
      birthData: {
        dateOfBirth: "1997-12-18",
        timeOfBirth: "02:30",
        placeOfBirth: "Sialkot, Pakistan",
        latitude: 32.4935378,
        longitude: 74.5411575,
        timezone: "Asia/Karachi"
      },
      proposedTime: "02:30"
    });
    
    console.log('✅ Quick response received');
    console.log('Response structure:', JSON.stringify(quickResponse.data, null, 2));
    
    // Check if this is the simplified response
    if (quickResponse.data.validation?.analysisLog?.includes('simplified')) {
      console.log('⚠️  Getting simplified response - investigating...');
      
      // Test if chart generation itself works
      console.log('2. Testing chart generation...');
      try {
        const chartResponse = await axios.post('http://localhost:3001/api/v1/chart/generate', {
          dateOfBirth: "1997-12-18",
          timeOfBirth: "02:30",
          latitude: 32.4935378,
          longitude: 74.5411575,
          timezone: "Asia/Karachi",
          placeOfBirth: "Sialkot, Pakistan",
          gender: "male",
          name: "Test"
        }, { timeout: 10000 });
        
        console.log('✅ Chart generation works');
        console.log('Chart keys:', Object.keys(chartResponse.data));
        
        if (chartResponse.data.ascendant) {
          console.log('✅ Ascendant found:', chartResponse.data.ascendant);
        } else {
          console.log('❌ No ascendant in chart response');
        }
        
      } catch (chartError) {
        console.log('❌ Chart generation failed:', chartError.message);
        if (chartError.response) {
          console.log('Chart error response:', chartError.response.data);
        }
      }
      
      // Test if full analysis endpoint works
      console.log('3. Testing full analysis...');
      try {
        const analysisResponse = await axios.post(`${API_BASE}/analyze`, {
          birthData: {
            dateOfBirth: "1997-12-18",
            timeOfBirth: "02:30",
            placeOfBirth: "Sialkot, Pakistan",
            latitude: 32.4935378,
            longitude: 74.5411575,
            timezone: "Asia/Karachi"
          },
          options: { methods: ['praanapada'] }
        }, { timeout: 15000 });
        
        console.log('✅ Full analysis works');
        console.log('Analysis keys:', Object.keys(analysisResponse.data.rectification));
        
        const praanapadaResults = analysisResponse.data.rectification.methods.praanapada;
        console.log('Praanapada candidates:', praanapadaResults?.candidates?.length || 0);
        
        if (praanapadaResults?.bestCandidate) {
          console.log('✅ Praanapada has best candidate:', praanapadaResults.bestCandidate.time);
        } else {
          console.log('❌ No Praanapada best candidate found');
        }
        
      } catch (analysisError) {
        console.log('❌ Full analysis failed:', analysisError.message);
        if (analysisError.response) {
          console.log('Analysis error response:', analysisError.response.data);
        }
      }
    }
    
  } catch (error) {
    console.log('💥 Unexpected error:', error.message);
    if (error.response) {
      console.log('Error response:', error.response.data);
    }
  }
}

debugBTRQuick();
