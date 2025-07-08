import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const TempBirthChartPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState(null);

  // API configuration matching production
  const api = axios.create({
    baseURL: 'http://localhost:3001/api',
    timeout: 60000,
    headers: { 'Content-Type': 'application/json' }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // EXACT payload format as specified in requirements
    const testPayload = {
      "dateOfBirth": "1997-12-18",
      "timeOfBirth": "02:30",
      "latitude": 32.4909,
      "longitude": 74.5361,
      "timezone": "Asia/Karachi",
      "gender": "male"
    };

    console.log('🧪 TEMP TEST - Submitting to /api/v1/chart/generate');
    console.log('📋 Payload:', JSON.stringify(testPayload, null, 2));

    try {
      const response = await api.post('/v1/chart/generate', testPayload);

      console.log('✅ API Response:', response.data);
      setChartData(response.data);

      // Store for next page
      sessionStorage.setItem('tempTestChartData', JSON.stringify(response.data));

    } catch (err) {
      console.error('❌ API Error:', err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const goToAnalysis = () => {
    if (chartData?.data?.chartId) {
      navigate(`/temp-analysis?chartId=${chartData.data.chartId}`);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🧪 TEMP TEST - Birth Chart Generation</h1>

      <div style={{ marginBottom: '20px' }}>
        <strong>Test Payload:</strong>
        <pre style={{ background: '#f5f5f5', padding: '10px', fontSize: '12px' }}>
{`{
  "dateOfBirth": "1997-12-18",
  "timeOfBirth": "02:30",
  "latitude": 32.4909,
  "longitude": 74.5361,
  "timezone": "Asia/Karachi",
  "gender": "male"
}`}
        </pre>
      </div>

      <button
        onClick={handleSubmit}
        disabled={isLoading}
        style={{
          padding: '12px 24px',
          backgroundColor: isLoading ? '#ccc' : '#FF6B35',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          fontSize: '16px',
          marginRight: '10px'
        }}
      >
        {isLoading ? 'Generating...' : 'Generate Chart'}
      </button>

      {chartData && (
        <button
          onClick={goToAnalysis}
          style={{
            padding: '12px 24px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          View Analysis →
        </button>
      )}

      {error && (
        <div style={{
          marginTop: '20px',
          padding: '10px',
          backgroundColor: '#ffe6e6',
          border: '1px solid #ff9999',
          borderRadius: '4px',
          color: '#cc0000'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {chartData && (
        <div style={{ marginTop: '20px' }}>
          <h3>✅ Chart Generated Successfully</h3>
          <div style={{ background: '#f0f8ff', padding: '15px', borderRadius: '4px' }}>
            <p><strong>Chart ID:</strong> {chartData.data?.chartId}</p>
            <p><strong>Ascendant:</strong> {chartData.data?.rasiChart?.ascendant?.sign} ({chartData.data?.rasiChart?.ascendant?.degree?.toFixed(2)}°)</p>
            <p><strong>Planets Count:</strong> {chartData.data?.rasiChart?.planets?.length}</p>
            <p><strong>Response Size:</strong> {JSON.stringify(chartData).length} characters</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TempBirthChartPage;
