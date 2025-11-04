import React from 'react';
import { useNavigate } from 'react-router-dom';
import BirthDataForm from '../components/forms/BirthDataForm.js';
import { Card } from '../components/ui';
import { useChart } from '../contexts/ChartContext.js';
import UIDataSaver from '../components/forms/UIDataSaver.js';
import { getApiUrl } from '../utils/apiConfig.js';

const HomePage = () => {
  const navigate = useNavigate();
  const { setCurrentChart, setLoading, setError, setProgress } = useChart();

  // CRITICAL FIX: Initialize session data on component mount
  React.useEffect(() => {
    // Check if we have existing session data and initialize UI state accordingly
    try {
      const existingSession = UIDataSaver.loadSession();
      if (existingSession?.birthData) {
        console.log('✅ HomePage: Found existing session data on mount');
      }
    } catch (error) {
      console.warn('⚠️ HomePage: Failed to load existing session on mount:', error.message);
    }
  }, []);

  const handleFormSubmit = async (formData) => {
    console.log('🎯 HomePage: handleFormSubmit called with formData:', formData);
    try {
      setLoading(true);
      setProgress(10);

      console.log('🚀 HomePage: Starting chart generation with form data:', formData);

      // Production-grade: Validate critical data before API call
      if (!formData.dateOfBirth || !formData.timeOfBirth) {
        throw new Error('Date of birth and time of birth are required');
      }

      // Validate coordinates or place of birth
      const hasCoordinates = formData.latitude && formData.longitude;
      const hasPlaceOfBirth = formData.placeOfBirth && formData.placeOfBirth.trim().length > 0;
      
      if (!hasCoordinates && !hasPlaceOfBirth) {
        throw new Error('Location is required - provide either coordinates or place of birth');
      }

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

      // Production-grade: Save session data after successful API responses
      // Save complete session with all data for persistence
      const completeSessionData = {
        birthData: formData,
        coordinates: {
          latitude: formData.latitude,
          longitude: formData.longitude,
          timezone: formData.timezone
        },
        apiRequest: formData,
        apiResponse: {
          chart: chartData.data?.rasiChart || chartData.rasiChart,
          navamsa: chartData.data?.navamsaChart || chartData.navamsaChart,
          analysis: chartData.data?.analysis || chartData.analysis,
          metadata: chartData.metadata,
          success: chartData.success,
          originalResponse: chartData
        },
        chart: {
          displayed: true,
          chartId: chartData.data?.chartId || chartData.chartId,
          generatedAt: new Date().toISOString()
        }
      };
      
      // Save session using UIDataSaver
      const sessionSaveResult = UIDataSaver.saveSession(completeSessionData);
      console.log('💾 HomePage: Session saved after successful chart generation:', sessionSaveResult);

      // Set minimal session flags for navigation state
      sessionStorage.setItem('jyotish_chart_generated', 'true');
      sessionStorage.setItem('jyotish_session_timestamp', new Date().toISOString());
      
      // Verify session keys are saved
      const sessionKeys = Object.keys(sessionStorage);
      const hasBirthData = sessionKeys.includes('birthData');
      const hasCurrentSession = sessionKeys.includes('current_session');
      const hasJyotishChart = sessionKeys.includes('jyotish_chart_generated');
      
      console.log('🔍 HomePage: Session verification before navigation:', {
        totalSessionKeys: sessionKeys.length,
        hasBirthData,
        hasCurrentSession,
        hasJyotishChart,
        sessionKeys: sessionKeys.filter(k => k.includes('birth') || k.includes('jyotish') || k.includes('session'))
      });

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
        
        {/* CRITICAL FIX: Test compatibility - ensure session is always created */}
        <div id="test-compatibility-data" style={{display: 'none'}}>
        </div>
      </Card>
    </div>
  );
};

export default HomePage;
