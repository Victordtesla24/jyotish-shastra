import React from 'react';
import { useNavigate } from 'react-router-dom';
import BirthDataForm from '../components/forms/BirthDataForm';
import { Card } from '../components/ui';
import { useChart } from '../contexts/ChartContext';
import UIDataSaver from '../components/forms/UIDataSaver';

const HomePage = () => {
  const navigate = useNavigate();
  const { setCurrentChart, setLoading, setError, setProgress } = useChart();

  const handleFormSubmit = async (formData) => {
    console.log('🎯 HomePage: handleFormSubmit called with formData:', formData);
    try {
      setLoading(true);
      setProgress(10);

      console.log('🚀 HomePage: Starting chart generation with form data:', formData);

      // Save birth data to sessionStorage for compatibility
      sessionStorage.setItem('birthData', JSON.stringify(formData));

      // Save birth data and request to UIDataSaver immediately
      UIDataSaver.saveSession({
        birthData: formData,
        coordinates: {
          latitude: formData.latitude,
          longitude: formData.longitude,
          timezone: formData.timezone
        },
        apiRequest: formData
      });

      // Call the chart generation API with correct v1 endpoint
      const response = await fetch(getApiUrl('/api/v1/chart/generate'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      setProgress(30);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const chartData = await response.json();
      setProgress(50);

      console.log('✅ HomePage: Chart API response received:', chartData);

      // CRITICAL FIX: Also fetch comprehensive analysis data
      console.log('🔄 HomePage: Fetching comprehensive analysis...');
      const analysisResponse = await fetch(getApiUrl('/api/v1/analysis/comprehensive'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      setProgress(70);

      if (!analysisResponse.ok) {
        console.warn('⚠️ HomePage: Comprehensive analysis failed, proceeding with chart only');
      } else {
        const analysisData = await analysisResponse.json();
        console.log('✅ HomePage: Comprehensive analysis API response received (',
          JSON.stringify(analysisData).length, 'bytes)');

        // Save comprehensive analysis data
        UIDataSaver.saveComprehensiveAnalysis(analysisData);
        console.log('💾 HomePage: Comprehensive analysis saved to UIDataSaver');
      }

      setProgress(90);

      // Save API response to UIDataSaver for session persistence
      const apiResponseSaveResult = UIDataSaver.saveApiResponse({
        chart: chartData.data?.rasiChart || chartData.rasiChart,
        navamsa: chartData.data?.navamsaChart || chartData.navamsaChart,
        analysis: chartData.data?.analysis || chartData.analysis,
        metadata: chartData.metadata,
        success: chartData.success,
        originalResponse: chartData // Keep full response for reference
      });

      console.log('💾 HomePage: Chart API response saved to UIDataSaver:', apiResponseSaveResult);

      // Create chart object with metadata and store in context
      const chart = {
        id: `chart_${Date.now()}`,
        birthData: formData,
        chartData: chartData,
        generatedAt: new Date().toISOString(),
        chartType: 'birth_chart'
      };

      setCurrentChart(chart);
      setProgress(100);

      console.log('📊 HomePage: Chart context updated, navigating to chart page');

      // Navigate to chart page
      navigate('/chart');
    } catch (error) {
      console.error('❌ HomePage: Error generating chart:', error);
      setError({
        message: error.message,
        code: 'CHART_GENERATION_ERROR',
        timestamp: new Date().toISOString()
      });
      // The BirthDataForm component will handle error display
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🕉️ Jyotish Shastra
          </h1>
          <p className="text-gray-600">
            Discover your Vedic astrology chart and comprehensive analysis
          </p>
        </div>

        <BirthDataForm
          onSubmit={handleFormSubmit}
          onError={(error) => {
            console.error('❌ HomePage: Form error received:', error);
            setError(error);
          }}
        />
      </Card>
    </div>
  );
};

export default HomePage;
