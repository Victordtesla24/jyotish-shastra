/**
 * Debug script to check UI data flow issues
 */

import axios from 'axios';

const API_URL = 'http://localhost:3001';

const testData = {
  birthData: {
    name: "Debug User",
    dateOfBirth: "1990-01-01",
    timeOfBirth: "12:00",
    latitude: 28.6139,
    longitude: 77.2090,
    timezone: "Asia/Kolkata",
    placeOfBirth: "Delhi, India"
  }
};

async function testAPIDataFlow() {
  console.log('🔍 Testing API data flow...');
  
  try {
    // Test chart generation
    console.log('\n1. Testing chart generation...');
    const chartResponse = await axios.post(`${API_URL}/api/v1/chart/generate`, testData.birthData);
    console.log('✅ Chart API response:', {
      success: chartResponse.data.success,
      hasChart: !!chartResponse.data.data?.rasiChart,
      hasBirthData: !!chartResponse.data.data?.birthData,
      dataSize: JSON.stringify(chartResponse.data).length
    });
    
    // Test comprehensive analysis
    console.log('\n2. Testing comprehensive analysis...');
    const analysisResponse = await axios.post(`${API_URL}/api/v1/analysis/comprehensive`, testData.birthData);
    console.log('✅ Analysis API response:', {
      success: analysisResponse.data.success,
      hasSections: !!analysisResponse.data.analysis?.sections,
      sectionsCount: analysisResponse.data.analysis?.sections ? Object.keys(analysisResponse.data.analysis.sections).length : 0,
      dataSize: JSON.stringify(analysisResponse.data).length
    });
    
    // Check sections in detail
    if (analysisResponse.data.success && analysisResponse.data.analysis?.sections) {
      const sections = analysisResponse.data.analysis.sections;
      console.log('\n📊 Sections summary:');
      Object.entries(sections).forEach(([key, section]) => {
        const hasData = section && Object.keys(section).length > 0;
        const keys = section ? Object.keys(section) : [];
        console.log(`  ${key}: ${hasData ? '✅' : '❌'} (${keys.join(', ')})`);
      });
    }
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testAPIDataFlow().catch(console.error);
