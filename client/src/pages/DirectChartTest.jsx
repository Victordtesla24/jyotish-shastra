import React, { useState } from 'react';
import VedicChartDisplay from '../components/charts/VedicChartDisplay';
import chartService from '../services/chartService';

const DirectChartTest = () => {
  const [chartData, setChartData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiResponse, setApiResponse] = useState(null);

  const testData = {
    name: "Farhan",
    dateOfBirth: '1997-12-18',
    timeOfBirth: '02:30',
    latitude: 32.4935378,
    longitude: 74.5411575,
    timezone: 'Asia/Karachi',
    gender: 'male'
  };

  const handleDirectAPICall = async () => {
    console.log('🧪 DIRECT API TEST - Starting chart generation test');
    setIsLoading(true);
    setError(null);
    setApiResponse(null);
    setChartData(null);

    try {
      console.log('📡 Calling chartService.generateChart with test data:', testData);
      const response = await chartService.generateChart(testData);
      console.log('✅ API Response received:', response);

      setApiResponse(JSON.stringify(response, null, 2));

      if (response && response.success && response.data) {
        console.log('✅ Setting chart data:', response.data);
        setChartData(response.data);
      } else {
        throw new Error('Invalid API response structure');
      }
    } catch (err) {
      console.error('❌ Direct API test failed:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sacred-white to-vedic-lotus p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-earth-brown mb-8">
          🧪 Direct Chart API Test
        </h1>

        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-xl font-bold mb-4">Test Configuration</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
{JSON.stringify(testData, null, 2)}
          </pre>

          <button
            onClick={handleDirectAPICall}
            disabled={isLoading}
            className="mt-4 bg-saffron text-white px-6 py-3 rounded hover:bg-saffron/90 disabled:opacity-50"
          >
            {isLoading ? '🔄 Testing...' : '🚀 Test Chart Generation API'}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
            <strong>Error:</strong> {error}
          </div>
        )}

        {apiResponse && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-8">
            <h3 className="font-bold mb-2">✅ API Response:</h3>
            <pre className="text-sm overflow-x-auto bg-white p-4 rounded">
              {apiResponse}
            </pre>
          </div>
        )}

        {chartData && (
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-bold mb-4">📊 Chart Display Test</h2>
              <VedicChartDisplay
                chartData={chartData}
                isLoading={false}
              />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-bold mb-4">📋 Data Structure Analysis</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">✅ Data Validation</h3>
                  <ul className="space-y-1 text-sm">
                    <li>Has rasiChart: {chartData.rasiChart ? '✅' : '❌'}</li>
                    <li>Has planets: {chartData.rasiChart?.planets?.length > 0 ? '✅' : '❌'}</li>
                    <li>Has ascendant: {chartData.rasiChart?.ascendant ? '✅' : '❌'}</li>
                    <li>Has house positions: {chartData.rasiChart?.housePositions?.length > 0 ? '✅' : '❌'}</li>
                    <li>Has birth data: {chartData.birthData ? '✅' : '❌'}</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">📊 Chart Stats</h3>
                  <ul className="space-y-1 text-sm">
                    <li>Planet count: {chartData.rasiChart?.planets?.length || 0}</li>
                    <li>Ascendant: {chartData.rasiChart?.ascendant?.sign || 'N/A'}</li>
                    <li>Chart ID: {chartData.chartId || 'N/A'}</li>
                    <li>Generated: {chartData.generatedAt || 'N/A'}</li>
                  </ul>
                </div>
              </div>
            </div>

            {chartData.rasiChart?.planets && (
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-bold mb-4">🪐 Planetary Positions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {chartData.rasiChart.planets.map((planet, index) => (
                    <div key={index} className="border rounded p-3">
                      <div className="font-semibold">{planet.name}</div>
                      <div className="text-sm text-gray-600">
                        {planet.sign} {planet.degree?.toFixed(2)}°
                      </div>
                      {planet.dignity && (
                        <div className="text-xs text-blue-600">{planet.dignity}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {isLoading && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-8">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-700 mr-3"></div>
              <span>Testing chart generation API...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DirectChartTest;
