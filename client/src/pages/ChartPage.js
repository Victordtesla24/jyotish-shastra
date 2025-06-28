import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '../components/ui';
import BirthDataForm from '../components/forms/BirthDataForm';
import ChartDisplay from '../components/charts/ChartDisplay';
import VedicChartDisplay from '../components/charts/VedicChartDisplay';
import chartService from '../services/chartService';
import ChartDataManager from '../utils/chartDataManager';

const ChartPage = () => {
  const [chartData, setChartData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisType, setAnalysisType] = useState('birth-data');

  const handleChartGeneration = async (birthData) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('🔮 Generating chart with data:', birthData);

      // Store birth data for later use in reports
      ChartDataManager.storeBirthData(birthData);

      const data = await chartService.generateChart(birthData);
      console.log('📊 Chart generation result:', data);

      if (data.success) {
        console.log('✅ Chart generation successful, setting chart data:', data.data);
        setChartData(data.data);

        // Store chart data for later use in reports
        ChartDataManager.storeChartData(data.data);

        console.log('💾 Chart data set and stored successfully');
      } else {
        console.error('❌ Chart generation failed:', data.error);
        setError(data.error || 'An unexpected error occurred.');
        setChartData(null);
      }
    } catch (err) {
      console.error('💥 Error generating chart:', err);
      setError(err.message || 'An unexpected error occurred.');
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
    <div className="min-h-screen bg-gradient-to-br from-sacred-white to-gray-50">
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
          <p className="text-base sm:text-lg text-wisdom-gray max-w-2xl mx-auto px-4">
            Create your authentic Vedic birth chart with precise astronomical calculations
            based on traditional Indian astrology principles.
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
                <p className="text-wisdom-gray text-sm">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
          {/* Birth Data Form */}
          <div className="order-2 xl:order-1">
            <Card variant="vedic" className="sticky top-4 sm:top-8">
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
                  <p className="text-wisdom-gray text-sm sm:text-base">
                    Fill in your birth details to begin your cosmic journey.
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
                  <p className="text-wisdom-gray text-sm sm:text-base">
                    Calculating planetary positions and cosmic influences...
                  </p>
                </div>
              </Card>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {/* Enhanced Vedic Chart Display */}
                <VedicChartDisplay
                  chartData={chartData}
                  isLoading={false}
                />

                {/* Traditional Chart Display (Fallback) */}
                <Card variant="elevated" className="mt-4">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg sm:text-xl">
                      <span className="text-xl sm:text-2xl mr-2 sm:mr-3">📊</span>
                      Alternative Chart View
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartDisplay
                      chartData={chartData}
                      analysisType={analysisType}
                      useComprehensive={false}
                    />
                  </CardContent>
                </Card>

                {/* Chart Actions */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <Button
                    variant="outline"
                    className="flex-1 border-cosmic-purple text-cosmic-purple hover:bg-cosmic-purple hover:text-white btn-responsive"
                    onClick={() => setAnalysisType('birth-data')}
                  >
                    📋 View Analysis
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-cosmic-purple to-vedic-primary btn-responsive"
                  >
                    📄 Generate Full Report
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Information Section */}
        <div className="mt-12 sm:mt-16">
          <Card variant="cosmic">
            <CardContent className="p-6 sm:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-center">
                <div>
                  <h3 className="font-accent text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
                    Why Accurate Birth Time Matters
                  </h3>
                  <p className="text-white/90 leading-relaxed mb-3 sm:mb-4 text-sm sm:text-base">
                    In Vedic astrology, precise birth time is crucial for accurate chart casting.
                    Even a 4-minute difference can change your Lagna (ascendant), affecting the
                    entire interpretation of your chart.
                  </p>
                  <ul className="text-white/80 space-y-1 sm:space-y-2 text-xs sm:text-sm">
                    <li>• Determines your exact Lagna and house positions</li>
                    <li>• Affects planetary strength calculations</li>
                    <li>• Essential for accurate Dasha periods</li>
                    <li>• Influences yoga formations and their timing</li>
                  </ul>
                </div>
                <div className="text-center mt-4 lg:mt-0">
                  <div className="text-4xl sm:text-6xl text-white/80 mb-3 sm:mb-4">⏰</div>
                  <p className="text-white/60 italic text-sm sm:text-base">
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
