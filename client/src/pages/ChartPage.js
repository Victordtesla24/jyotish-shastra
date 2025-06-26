import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '../components/ui';
import BirthDataForm from '../components/forms/BirthDataForm';
import ChartDisplay from '../components/charts/ChartDisplay';

const ChartPage = () => {
  const [chartData, setChartData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisType, setAnalysisType] = useState('birth-data');

  const handleChartGeneration = async (birthData) => {
    setIsLoading(true);
    try {
      // This would typically call your API
      const response = await fetch('/api/chart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(birthData),
      });

      if (response.ok) {
        const data = await response.json();
        setChartData(data);
      } else {
        console.error('Failed to generate chart');
      }
    } catch (error) {
      console.error('Error generating chart:', error);
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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-cosmic-purple to-vedic-gold rounded-full flex items-center justify-center">
              <span className="text-2xl text-white">📊</span>
            </div>
          </div>
          <h1 className="font-accent text-4xl md:text-5xl font-bold text-earth-brown mb-4">
            Birth Chart Generation
          </h1>
          <p className="text-lg text-wisdom-gray max-w-2xl mx-auto">
            Create your authentic Vedic birth chart with precise astronomical calculations
            based on traditional Indian astrology principles.
          </p>
        </div>

        {/* Steps Guide */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {steps.map((step) => (
            <Card key={step.number} variant="elevated" className="text-center">
              <CardContent className="p-6">
                <div className="text-3xl mb-4">{step.icon}</div>
                <div className="w-8 h-8 bg-cosmic-purple text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                  {step.number}
                </div>
                <h3 className="font-accent text-lg font-bold text-earth-brown mb-2">
                  {step.title}
                </h3>
                <p className="text-wisdom-gray text-sm">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Birth Data Form */}
          <div>
            <Card variant="vedic" className="sticky top-8">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <span className="text-2xl mr-3">🕉️</span>
                  Birth Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BirthDataForm
                  onSubmit={handleChartGeneration}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
          </div>

          {/* Chart Display */}
          <div>
            {!chartData && !isLoading ? (
              <Card variant="elevated" className="h-96 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4 opacity-50">📊</div>
                  <h3 className="font-accent text-xl font-bold text-earth-brown mb-2">
                    Ready to Generate Your Chart
                  </h3>
                  <p className="text-wisdom-gray">
                    Fill in your birth details on the left to begin your cosmic journey.
                  </p>
                </div>
              </Card>
            ) : isLoading ? (
              <Card variant="elevated" className="h-96 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-cosmic-purple to-vedic-gold rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
                    <span className="text-xl text-white">🕉️</span>
                  </div>
                  <h3 className="font-accent text-xl font-bold text-earth-brown mb-2">
                    Generating Your Chart
                  </h3>
                  <p className="text-wisdom-gray">
                    Calculating planetary positions and cosmic influences...
                  </p>
                </div>
              </Card>
            ) : (
              <div className="space-y-6">
                <Card variant="elevated">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <span className="text-2xl mr-3">🌟</span>
                      Your Birth Chart
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
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    variant="outline"
                    className="flex-1 border-cosmic-purple text-cosmic-purple hover:bg-cosmic-purple hover:text-white"
                    onClick={() => setAnalysisType('birth-data')}
                  >
                    View Analysis
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-cosmic-purple to-vedic-primary"
                  >
                    Generate Full Report
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Information Section */}
        <div className="mt-16">
          <Card variant="cosmic">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="font-accent text-2xl font-bold text-white mb-4">
                    Why Accurate Birth Time Matters
                  </h3>
                  <p className="text-white/90 leading-relaxed mb-4">
                    In Vedic astrology, precise birth time is crucial for accurate chart casting.
                    Even a 4-minute difference can change your Lagna (ascendant), affecting the
                    entire interpretation of your chart.
                  </p>
                  <ul className="text-white/80 space-y-2 text-sm">
                    <li>• Determines your exact Lagna and house positions</li>
                    <li>• Affects planetary strength calculations</li>
                    <li>• Essential for accurate Dasha periods</li>
                    <li>• Influences yoga formations and their timing</li>
                  </ul>
                </div>
                <div className="text-center">
                  <div className="text-6xl text-white/80 mb-4">⏰</div>
                  <p className="text-white/60 italic">
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
