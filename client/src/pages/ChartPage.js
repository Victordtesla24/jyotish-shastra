import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '../components/ui';
import BirthDataForm from '../components/forms/BirthDataForm';
import VedicChartDisplay from '../components/charts/VedicChartDisplay';

import chartService from '../services/chartService';
import ChartDataManager from '../utils/chartDataManager';
import { useNavigate } from 'react-router-dom';

const ChartPage = () => {
  const [chartData, setChartData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChartGeneration = async (birthData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Store birth data before API call
      ChartDataManager.storeBirthData(birthData);

      const data = await chartService.generateChart(birthData);

      console.log('🔍 CHART PAGE DEBUG - API Response:', data);
      console.log('🔍 CHART PAGE DEBUG - Has success?', !!data?.success);
      console.log('🔍 CHART PAGE DEBUG - Has data?', !!data?.data);
      console.log('🔍 CHART PAGE DEBUG - Data structure:', data?.data ? Object.keys(data.data) : 'N/A');

      if (data && data.success) {
        if (!data.data) {
          console.error('❌ CHART PAGE DEBUG - API returned success but missing chart data');
          throw new Error('API returned success but missing chart data');
        }

        console.log('✅ CHART PAGE DEBUG - Setting chart data:', data.data);
        setChartData(data.data);
        ChartDataManager.storeChartData(data.data);
      } else {
        const errorMsg = data?.error || data?.message || 'Chart generation failed';
        console.error('❌ CHART PAGE DEBUG - Chart generation failed:', errorMsg);
        setError(errorMsg);
        setChartData(null);
      }
    } catch (err) {
      let userError = 'An error occurred during chart generation.';
      if (err.message.includes('Network Error')) {
        userError = 'Unable to connect to the server. Please check your connection.';
      } else if (err.response?.status === 400) {
        userError = `Invalid birth data: ${err.response.data?.message || err.message}`;
      } else if (err.response?.status === 500) {
        userError = 'Server error during chart calculation. Please try again.';
      }

      setError(userError);
      setChartData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    {
      number: 1,
      title: 'Enter Birth Details',
      description: 'Provide accurate birth date, time, and location for precise calculations.',
      icon: '📅'
    },
    {
      number: 2,
      title: 'Generate Chart',
      description: 'Our system calculates planetary positions using authentic Vedic methods.',
      icon: '🔮'
    },
    {
      number: 3,
      title: 'View Results',
      description: 'Explore your birth chart with detailed explanations and insights.',
      icon: '🌟'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sacred-white to-vedic-lotus">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-cosmic-purple to-vedic-gold rounded-full flex items-center justify-center">
              <span className="text-xl sm:text-2xl text-white">📊</span>
            </div>
          </div>
          <h1 className="font-accent text-3xl sm:text-4xl md:text-5xl font-bold text-earth-brown mb-3 sm:mb-4">
            Birth Chart Generation
          </h1>
          <p className="text-base sm:text-lg text-earth-brown max-w-2xl mx-auto px-4">
            Create your authentic Vedic birth chart with precise Swiss Ephemeris calculations
          </p>
        </div>

        {/* Steps Guide */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {steps.map((step) => (
            <Card key={step.number} variant="elevated" className="text-center">
              <CardContent className="p-4 sm:p-6">
                <div className="text-2xl sm:text-3xl mb-3 sm:mb-4">{step.icon}</div>
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-cosmic-purple text-white rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 font-bold text-sm sm:text-base">
                  {step.number}
                </div>
                <h3 className="font-accent text-base sm:text-lg font-bold text-earth-brown mb-2">
                  {step.title}
                </h3>
                <p className="text-wisdom-gold text-sm">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
          {/* Birth Data Form */}
          <div className="order-2 xl:order-1">
            <Card variant="vedic">
              <CardHeader>
                <CardTitle className="text-white flex items-center text-lg sm:text-xl">
                  <span className="text-xl sm:text-2xl mr-2 sm:mr-3">🕉️</span>
                  Birth Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BirthDataForm
                  onSubmit={handleChartGeneration}
                  isLoading={isLoading}
                />
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 sm:px-4 sm:py-3 rounded-vedic mt-3 sm:mt-4 text-sm">
                    <span className="font-medium">Error:</span> {error}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Chart Display */}
          <div className="order-1 xl:order-2">
            {!chartData && !isLoading ? (
              <Card variant="elevated" className="h-80 sm:h-96 flex items-center justify-center">
                <div className="text-center px-4">
                  <div className="text-4xl sm:text-6xl mb-3 sm:mb-4 opacity-50">📊</div>
                  <h3 className="font-accent text-lg sm:text-xl font-bold text-earth-brown mb-2">
                    Ready to Generate Your Chart
                  </h3>
                  <p className="text-vedic-saffron text-sm sm:text-base">
                    Fill in your birth details to begin chart generation.
                  </p>
                </div>
              </Card>
            ) : isLoading ? (
              <Card variant="elevated" className="h-80 sm:h-96 flex items-center justify-center">
                <div className="text-center px-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-cosmic-purple to-vedic-gold rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 animate-spin">
                    <span className="text-lg sm:text-xl text-white">🕉️</span>
                  </div>
                  <h3 className="font-accent text-lg sm:text-xl font-bold text-earth-brown mb-2">
                    Generating Your Chart
                  </h3>
                  <p className="text-vedic-saffron text-sm sm:text-base">
                    Calculating planetary positions with Swiss Ephemeris...
                  </p>
                </div>
              </Card>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                <VedicChartDisplay
                  chartData={chartData}
                  isLoading={false}
                />

                {/* Navigation Actions */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <Button
                    className="flex-1 bg-saffron text-white hover:bg-saffron/90"
                    onClick={() => {
                      const storedChartData = ChartDataManager.getChartData();
                      const birthData = ChartDataManager.getBirthData();

                      if (storedChartData?.chartId) {
                        navigate(`/analysis?chartId=${storedChartData.chartId}`);
                      } else if (birthData) {
                        navigate('/analysis', { state: { birthData } });
                      } else {
                        setError('Could not find chart data to start analysis.');
                      }
                    }}
                  >
                    📋 View Analysis
                  </Button>
                  <Button
                    className="flex-1 bg-saffron text-white hover:bg-saffron/90"
                    onClick={() => {
                      const storedChartData = ChartDataManager.getChartData();
                      const birthData = ChartDataManager.getBirthData();

                      if (storedChartData?.chartId) {
                        navigate(`/report?chartId=${storedChartData.chartId}`);
                      } else if (birthData) {
                        navigate('/report', { state: { birthData } });
                      } else {
                        setError('Could not find chart data to generate report.');
                      }
                    }}
                  >
                    📄 Generate Report
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Information Section */}
        <div className="mt-12 sm:mt-16">
          <Card variant="elevated" className="bg-white ring-1 ring-amber-200">
            <CardContent className="p-6 sm:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-center">
                <div>
                  <h3 className="font-accent text-xl sm:text-2xl font-bold text-earth-brown mb-3 sm:mb-4">
                    Why Accurate Birth Time Matters
                  </h3>
                  <p className="text-earth-brown/90 leading-relaxed mb-3 sm:mb-4 text-sm sm:text-base">
                    In Vedic astrology, precise birth time is crucial for accurate chart casting.
                    Even a 4-minute difference can change your Lagna (ascendant), affecting the
                    entire interpretation of your chart.
                  </p>
                  <ul className="text-earth-brown/80 space-y-1 sm:space-y-2 text-xs sm:text-sm">
                    <li>• Determines your exact Lagna and house positions</li>
                    <li>• Affects planetary strength calculations</li>
                    <li>• Essential for accurate Dasha periods</li>
                    <li>• Influences yoga formations and their timing</li>
                  </ul>
                </div>
                <div className="text-center mt-4 lg:mt-0">
                  <div className="text-4xl sm:text-6xl text-amber-700 mb-3 sm:mb-4">⏰</div>
                  <p className="text-earth-brown/70 italic text-sm sm:text-base">
                    "Time is the most precious element in astrological calculations"
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ChartPage;
