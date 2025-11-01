import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { VedicLoadingSpinner } from '../components/ui';
import VedicChartDisplay from '../components/charts/VedicChartDisplay.jsx';
import { useChart } from '../contexts/ChartContext.js';
import UIDataSaver from '../components/forms/UIDataSaver.js';

// Error Boundary Component for ChartPage
class ChartPageErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🚨 ChartPage Error Boundary caught error:', error);
    console.error('Error Info:', errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-vedic-primary relative overflow-hidden flex items-center justify-center p-4">
          {/* Cosmic Background Elements */}
          <div className="absolute inset-0 pattern-mandala opacity-10"></div>
          <div className="absolute top-20 left-10 symbol-om text-6xl animate-om-rotation opacity-20"></div>
          <div className="absolute bottom-20 right-12 text-3xl opacity-20 animate-float">✦</div>

          <div className="card-cosmic backdrop-vedic border-2 border-white/20 shadow-mandala p-8 rounded-3xl max-w-md w-full text-center relative z-10">
            <div className="text-red-400 text-6xl mb-6 animate-sacred-pulse">📊⚠️</div>
            <h2 className="text-2xl font-cinzel font-bold text-gradient-vedic mb-4">Chart Display Error</h2>
            <p className="text-white/80 mb-6 font-devanagari">
              An unexpected cosmic disturbance occurred while rendering the birth chart.
            </p>
            <details className="text-left text-xs text-white/60 mb-6 bg-white/10 rounded-lg p-3">
              <summary className="cursor-pointer font-medium text-white/80">Technical Details</summary>
              <pre className="mt-2 whitespace-pre-wrap break-words">
                {this.state.error && this.state.error.toString()}
              </pre>
            </details>
            <div className="space-y-3">
              <button
                onClick={() => {
                  // Clear chart data to resolve potential data corruption
                  try {
                    const chartKeys = Object.keys(sessionStorage).filter(key =>
                      key.includes('chart') || key.includes('vedic') || key.includes('birth')
                    );
                    chartKeys.forEach(key => sessionStorage.removeItem(key));
                    localStorage.removeItem('vedicChartData');
                    console.log('✅ Chart data cleared');
                  } catch (e) {
                    console.warn('Failed to clear chart data:', e);
                  }
                  window.location.reload();
                }}
                className="btn-primary w-full"
              >
                <span className="flex items-center justify-center space-x-2">
                  <span>🔄</span>
                  <span>Clear Chart Data & Reload</span>
                </span>
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="btn-secondary w-full"
              >
                <span className="flex items-center justify-center space-x-2">
                  <span>🏠</span>
                  <span>Generate New Chart</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const ChartPage = () => {
  const navigate = useNavigate();
  const { currentChart, isLoading, error } = useChart();
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    if (!currentChart) {
      navigate('/');
      return;
    }

    // Extract the actual chart data from the API response
    const apiResponse = currentChart.chartData;
    console.log('🔍 ChartPage: Full currentChart data:', currentChart);
    console.log('🔍 ChartPage: API Response:', apiResponse);

    if (apiResponse && apiResponse.success && apiResponse.data) {
      console.log('✅ ChartPage: Using apiResponse.data:', apiResponse.data);
      console.log('📋 Birth Data Available:', !!apiResponse.data.birthData);
      console.log('📋 Birth Data Details:', {
        name: apiResponse.data.birthData?.name,
        dateOfBirth: apiResponse.data.birthData?.dateOfBirth,
        timeOfBirth: apiResponse.data.birthData?.timeOfBirth,
        latitude: apiResponse.data.birthData?.latitude,
        longitude: apiResponse.data.birthData?.longitude,
        geocodingInfo: apiResponse.data.birthData?.geocodingInfo
      });
      console.log('⏳ Dasha Info Available:', !!apiResponse.data.dashaInfo);
      console.log('⏳ Dasha Info Details:', {
        birthDasha: apiResponse.data.dashaInfo?.birthDasha,
        currentDasha: apiResponse.data.dashaInfo?.currentDasha
      });

      // Save chart data to UIDataSaver as backup
      UIDataSaver.saveApiResponse({
        chart: apiResponse.data?.rasiChart || apiResponse.rasiChart,
        navamsa: apiResponse.data?.navamsaChart || apiResponse.navamsaChart,
        analysis: apiResponse.data?.analysis || apiResponse.analysis,
        metadata: apiResponse.metadata,
        success: apiResponse.success,
        originalResponse: apiResponse
      });

      console.log('💾 ChartPage: Chart data saved to UIDataSaver as backup');

      setChartData(apiResponse.data);
    } else {
      // Production code: Standard API response format required
      throw new Error('Invalid API response format. Expected response.data structure with rasiChart property.');
    }
  }, [currentChart, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-vedic-primary relative overflow-hidden flex items-center justify-center">
        {/* Cosmic Background Elements */}
        <div className="absolute inset-0 pattern-mandala opacity-10"></div>
        <div className="absolute top-20 left-10 symbol-om text-6xl animate-om-rotation opacity-20"></div>
        <div className="absolute bottom-20 right-12 text-3xl opacity-20 animate-float">✦</div>

        <div className="relative z-10">
          <VedicLoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-vedic-primary relative overflow-hidden flex items-center justify-center">
        {/* Cosmic Background Elements */}
        <div className="absolute inset-0 pattern-mandala opacity-10"></div>
        <div className="absolute top-20 left-10 symbol-om text-6xl animate-om-rotation opacity-20"></div>
        <div className="absolute bottom-20 right-12 text-3xl opacity-20 animate-float">✦</div>

        <div className="card-cosmic backdrop-vedic border-2 border-white/20 shadow-mandala p-8 rounded-3xl max-w-md relative z-10">
          <div className="text-red-400 text-5xl mb-4 text-center">⚠️</div>
          <h2 className="text-2xl font-cinzel font-bold text-gradient-vedic mb-4 text-center">Error</h2>
          <p className="text-white/80 mb-6 text-center font-devanagari">{error.message || error}</p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary w-full"
          >
            <span className="flex items-center justify-center space-x-2">
              <span>🏠</span>
              <span>Go Back</span>
            </span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-vedic-primary relative overflow-hidden">
      {/* Enhanced Cosmic Background Elements */}
      <div className="absolute inset-0 pattern-mandala opacity-10"></div>
      <div className="absolute top-20 left-10 symbol-om text-6xl animate-om-rotation opacity-20"></div>
      <div className="absolute top-40 right-16 symbol-star text-4xl animate-cosmic-drift opacity-30"></div>
      <div className="absolute bottom-32 left-20 symbol-lotus text-5xl animate-lotus-bloom opacity-25"></div>
      <div className="absolute bottom-20 right-12 text-3xl opacity-20 animate-float">✦</div>
      <div className="absolute top-1/3 left-1/4 text-2xl opacity-15 animate-divine-light">🌟</div>

      {/* Floating Cosmic Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-1/4 w-2 h-2 bg-vedic-gold rounded-full animate-float opacity-60"></div>
        <div className="absolute top-1/4 right-1/4 w-1 h-1 bg-lunar-silver rounded-full animate-cosmic-drift opacity-40"></div>
        <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-cosmic-purple rounded-full animate-celestial-glow opacity-50"></div>
        <div className="absolute bottom-10 right-1/3 w-2 h-2 bg-solar-orange rounded-full animate-float opacity-70"></div>
      </div>

      <div className="relative z-10 py-12">
        <div className="vedic-container max-w-7xl mx-auto">

          {/* Premium Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-cosmic rounded-full shadow-celestial mb-6 animate-sacred-pulse">
              <span className="text-3xl text-white">📊</span>
            </div>

            <h1 className="section-title-vedic text-5xl md:text-6xl font-cinzel font-bold mb-6 text-gradient-vedic drop-shadow-2xl">
              Your Sacred Birth Chart
            </h1>

            <div className="max-w-3xl mx-auto mb-8">
              <p className="text-lg md:text-xl text-white font-devanagari font-medium mb-2 drop-shadow-lg">
                जन्म कुंडली - Cosmic Blueprint of Your Soul
              </p>
              <p className="text-white/80 drop-shadow-md">
                Traditional Vedic astrology chart revealing your celestial destiny
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <button
                onClick={() => navigate('/')}
                className="btn-secondary px-8 py-3 text-white border-2 border-white/30 hover:border-white/50 hover:bg-white/10 transition-all duration-300 rounded-xl font-cinzel font-medium"
              >
                <span className="flex items-center justify-center space-x-2">
                  <span>🏠</span>
                  <span>New Chart</span>
                </span>
              </button>
              <button
                onClick={() => navigate('/analysis')}
                className="btn-primary px-8 py-3 bg-gradient-cosmic text-white hover:shadow-celestial hover:-translate-y-1 transition-all duration-300 rounded-xl font-cinzel font-medium"
              >
                <span className="flex items-center justify-center space-x-2">
                  <span>🔮</span>
                  <span>View Analysis</span>
                </span>
              </button>
              <button
                onClick={() => {
                  // Save birth data to sessionStorage for BTR page
                  try {
                    const birthDataForBTR = {
                      name: chartData?.birthData?.name || 'User',
                      dateOfBirth: chartData?.birthData?.dateOfBirth,
                      timeOfBirth: chartData?.birthData?.timeOfBirth,
                      placeOfBirth: chartData?.birthData?.geocodingInfo?.formattedAddress || 'Unknown',
                      latitude: chartData?.birthData?.latitude,
                      longitude: chartData?.birthData?.longitude,
                      timezone: chartData?.birthData?.timezone,
                      chartId: chartData?.chartId
                    };
                    sessionStorage.setItem('birthDataForBTR', JSON.stringify(birthDataForBTR));
                    navigate('/birth-time-rectification');
                  } catch (error) {
                    console.error('Failed to save data for BTR:', error);
                    navigate('/birth-time-rectification');
                  }
                }}
                className="btn-primary px-8 py-3 bg-gradient-to-r from-saffron to-gold text-white hover:shadow-celestial hover:-translate-y-1 transition-all duration-300 rounded-xl font-cinzel font-medium"
              >
                <span className="flex items-center justify-center space-x-2">
                  <span>🕉️</span>
                  <span>BTR Analysis</span>
                </span>
              </button>
            </div>

            {/* Sacred Divider */}
            <div className="flex items-center justify-center space-x-4 mb-12">
              <div className="w-16 h-px bg-gradient-to-r from-transparent to-vedic-gold"></div>
              <span className="text-vedic-gold text-2xl animate-glow">✦</span>
              <div className="w-16 h-px bg-gradient-to-r from-vedic-gold to-transparent"></div>
            </div>
          </div>

          {/* Premium Chart Display Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-12">

            {/* Main Rasi Chart */}
            <div className="card-cosmic backdrop-vedic border-2 border-white/20 shadow-mandala p-8 rounded-3xl hover-celestial">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-cosmic rounded-full shadow-celestial mb-4 animate-sacred-pulse">
                  <span className="text-2xl text-white">🪐</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-cinzel font-bold text-gradient-accent mb-2">
                  Rasi Chart (D1)
                </h2>
                <p className="text-white/70 font-devanagari">
                  Primary birth chart showing planetary positions
                </p>
              </div>

              <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm border border-white/20">
                <VedicChartDisplay
                  chartData={chartData?.rasiChart || chartData}
                  chartType="rasi"
                  showDetails={true}
                />
              </div>
            </div>

            {/* Navamsa Chart */}
            {chartData?.navamsaChart && (
              <div className="card-cosmic backdrop-vedic border-2 border-white/20 shadow-mandala p-8 rounded-3xl hover-celestial">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-cosmic rounded-full shadow-celestial mb-4 animate-sacred-pulse">
                    <span className="text-2xl text-white">🌙</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-cinzel font-bold text-gradient-accent mb-2">
                    Navamsa Chart (D9)
                  </h2>
                  <p className="text-white/70 font-devanagari">
                    Marriage and spiritual destiny chart
                  </p>
                </div>

                <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm border border-white/20">
                  <VedicChartDisplay
                    chartData={chartData.navamsaChart}
                    chartType="navamsa"
                    showDetails={true}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Birth Details Card */}
          <div className="card-cosmic backdrop-vedic border-2 border-white/20 shadow-mandala p-8 rounded-3xl mb-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-cosmic rounded-full shadow-celestial mb-4 animate-sacred-pulse">
                <span className="text-2xl text-white">📋</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-cinzel font-bold text-gradient-accent mb-2">
                Birth Details
              </h3>
              <p className="text-white/70 font-devanagari">
                Sacred information used for calculations
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Name */}
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-vedic-gold text-xl">👤</span>
                  <span className="text-white/70 font-devanagari text-sm">Name:</span>
                </div>
                <span className="text-white font-cinzel font-medium text-lg">
                  {chartData?.birthData?.name || 'N/A'}
                </span>
              </div>

              {/* Date */}
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-vedic-gold text-xl">📅</span>
                  <span className="text-white/70 font-devanagari text-sm">Date:</span>
                </div>
                <span className="text-white font-cinzel font-medium text-lg">
                  {chartData?.birthData?.dateOfBirth ?
                    new Date(chartData.birthData.dateOfBirth).toLocaleDateString() : 'N/A'}
                </span>
              </div>

              {/* Time */}
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-vedic-gold text-xl">⏰</span>
                  <span className="text-white/70 font-devanagari text-sm">Time:</span>
                </div>
                <span className="text-white font-cinzel font-medium text-lg">
                  {chartData?.birthData?.timeOfBirth || 'N/A'}
                </span>
              </div>

              {/* Place */}
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20 lg:col-span-2">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-vedic-gold text-xl">🌍</span>
                  <span className="text-white/70 font-devanagari text-sm">Place:</span>
                </div>
                <span className="text-white font-cinzel font-medium text-lg">
                  {chartData?.birthData?.geocodingInfo?.formattedAddress ||
                   `${chartData?.birthData?.latitude?.toFixed(4) || 'N/A'}, ${chartData?.birthData?.longitude?.toFixed(4) || 'N/A'}`}
                </span>
              </div>

              {/* Coordinates */}
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-vedic-gold text-xl">📍</span>
                  <span className="text-white/70 font-devanagari text-sm">Coordinates:</span>
                </div>
                <div className="text-white font-mono text-sm">
                  <div>{chartData?.birthData?.latitude?.toFixed(4) || 'N/A'}° N</div>
                  <div>{chartData?.birthData?.longitude?.toFixed(4) || 'N/A'}° E</div>
                </div>
              </div>
            </div>
          </div>

          {/* Dasha Information Card */}
          {chartData?.dashaInfo && (
            <div className="card-cosmic backdrop-vedic border-2 border-white/20 shadow-mandala p-8 rounded-3xl">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-cosmic rounded-full shadow-celestial mb-4 animate-sacred-pulse">
                  <span className="text-2xl text-white">⏳</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-cinzel font-bold text-gradient-accent mb-2">
                  Dasha Information
                </h3>
                <p className="text-white/70 font-devanagari">
                  Planetary time periods governing your life
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Birth Dasha */}
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-vedic-gold text-xl">🎂</span>
                    <span className="text-white/70 font-devanagari text-sm">Birth Dasha:</span>
                  </div>
                  <span className="text-white font-cinzel font-medium text-lg">
                    {chartData.dashaInfo.birthDasha}
                  </span>
                </div>

                {/* Current Dasha */}
                {chartData.dashaInfo.currentDasha && (
                  <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-vedic-gold text-xl">🔄</span>
                      <span className="text-white/70 font-devanagari text-sm">Current Dasha:</span>
                    </div>
                    <div className="text-white font-cinzel font-medium text-lg">
                      {chartData.dashaInfo.currentDasha.planet}
                    </div>
                    <div className="text-white/60 text-sm mt-1">
                      {chartData.dashaInfo.currentDasha.remainingYears?.toFixed(1)} years remaining
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sacred Footer */}
          <div className="text-center pt-12">
            <div className="flex items-center justify-center space-x-6 mb-6">
              <span className="symbol-om text-3xl animate-om-rotation">🕉️</span>
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-vedic-gold rounded-full animate-float"></div>
                <div className="w-2 h-2 bg-lunar-silver rounded-full animate-cosmic-drift"></div>
                <div className="w-2 h-2 bg-cosmic-purple rounded-full animate-celestial-glow"></div>
              </div>
              <span className="symbol-lotus text-3xl animate-lotus-bloom">🪷</span>
            </div>
            <p className="text-white/70 font-devanagari text-lg">
              May the stars guide your path to enlightenment
            </p>
            <p className="text-white/60 text-sm mt-2">
              Generated with Swiss Ephemeris precision
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

// Export with Error Boundary Wrapper
const WrappedChartPage = () => (
  <ChartPageErrorBoundary>
    <ChartPage />
  </ChartPageErrorBoundary>
);

export default WrappedChartPage;
