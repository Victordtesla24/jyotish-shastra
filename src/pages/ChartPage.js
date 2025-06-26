import React, { useState } from 'react';
import { useChartGeneration } from '../hooks/useChartGeneration';
import BirthDataForm from '../components/forms/BirthDataForm';
import AnalysisSelector from '../components/forms/AnalysisSelector';
import ChartDisplay from '../components/charts/ChartDisplay';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { Card, MandalaIcon, StarIcon, YantraIcon } from '../components/ui';

const ChartPage = () => {
  const [useComprehensive, setUseComprehensive] = useState(true);
  const [analysisType, setAnalysisType] = useState('comprehensive'); // 'comprehensive', 'birth-data'
  const { generateChart, data: chartData, isLoading, error } = useChartGeneration();

  const handleSubmit = (birthData) => {
    generateChart({ birthData, analysisType, useComprehensive });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sacred-white to-gray-50">
      <div className="container-vedic">
        {/* Enhanced Page Header */}
        <div className="text-center section-spacing">
          <div className="flex items-center justify-center mb-6">
            <YantraIcon size={48} className="mr-4 text-saffron animate-pulse-soft" />
            <h1 className="text-responsive-3xl font-bold text-earth-brown font-accent">
              Generate Your Birth Chart
            </h1>
            <YantraIcon size={48} className="ml-4 text-saffron animate-pulse-soft" />
          </div>

          <p className="text-vedic-lg text-wisdom-gray max-w-2xl mx-auto leading-relaxed mb-8">
            Create your detailed Vedic birth chart with planetary positions and analysis options
          </p>

          {/* Decorative elements */}
          <div className="flex justify-center space-x-8 mb-12">
            <MandalaIcon size={24} className="text-cosmic-purple animate-spin-slow" />
            <StarIcon size={32} className="text-gold animate-pulse-soft" />
            <MandalaIcon size={24} className="text-cosmic-purple animate-spin-slow" />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {/* Birth Data Form - Left */}
          <div className="space-y-6">
            <Card variant="default" className="shadow-vedic-medium">
              <Card.Header>
                <Card.Title size="lg" className="text-earth-brown font-accent">
                  Birth Information
                </Card.Title>
              </Card.Header>
              <Card.Content>
                <BirthDataForm onSubmit={handleSubmit} isLoading={isLoading} />
              </Card.Content>
            </Card>

            <Card variant="cosmic">
              <Card.Header>
                <Card.Title size="md" className="text-white">
                  Analysis Options
                </Card.Title>
              </Card.Header>
              <Card.Content>
                <AnalysisSelector
                  analysisType={analysisType}
                  setAnalysisType={setAnalysisType}
                  useComprehensive={useComprehensive}
                  setUseComprehensive={setUseComprehensive}
                />
              </Card.Content>
            </Card>
          </div>

          {/* Information Panel - Right */}
          <div className="space-y-6">
            <Card variant="vedic">
              <Card.Header>
                <Card.Title size="md" className="text-white">
                  About Vedic Charts
                </Card.Title>
              </Card.Header>
              <Card.Content>
                <div className="space-y-4 text-white/90">
                  <div className="flex items-start space-x-3">
                    <YantraIcon size={20} className="text-gold mt-1 flex-shrink-0" />
                    <p className="text-sm">
                      Rasi Chart shows planetary positions at birth using the sidereal zodiac
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <YantraIcon size={20} className="text-gold mt-1 flex-shrink-0" />
                    <p className="text-sm">
                      Navamsa Chart reveals deeper insights into soul's journey and relationships
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <YantraIcon size={20} className="text-gold mt-1 flex-shrink-0" />
                    <p className="text-sm">
                      Divisional charts provide specialized analysis for specific life areas
                    </p>
                  </div>
                </div>
              </Card.Content>
            </Card>

            <Card variant="golden">
              <Card.Header>
                <Card.Title size="md" className="text-earth-brown">
                  Chart Features
                </Card.Title>
              </Card.Header>
              <Card.Content>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <MandalaIcon size={16} className="text-cosmic-purple" />
                    <span className="text-sm text-earth-brown">Precise planetary positions</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MandalaIcon size={16} className="text-cosmic-purple" />
                    <span className="text-sm text-earth-brown">Nakshatra placements</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MandalaIcon size={16} className="text-cosmic-purple" />
                    <span className="text-sm text-earth-brown">House lordships</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MandalaIcon size={16} className="text-cosmic-purple" />
                    <span className="text-sm text-earth-brown">Planetary strengths</span>
                  </div>
                </div>
              </Card.Content>
            </Card>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <LoadingSpinner />
            <p className="mt-4 text-wisdom-gray">Calculating planetary positions...</p>
          </div>
        )}

        {/* Error Message */}
        <ErrorMessage message={error?.message} />

        {/* Geocoding Status */}
        {chartData?.data.birthData?.geocodingInfo && (
          <Card variant="default" className="mb-8">
            <Card.Content padding="sm">
              <div className="flex items-center space-x-2 text-green-600">
                <StarIcon size={20} />
                <p className="text-sm font-medium">
                  Location verified using {chartData.data.birthData.geocodingInfo.service}
                </p>
              </div>
            </Card.Content>
          </Card>
        )}

        {/* Chart Display */}
        <div className="mb-16">
          <ChartDisplay
            chartData={chartData}
            analysisType={analysisType}
            useComprehensive={useComprehensive}
          />
        </div>
      </div>
    </div>
  );
};

export default ChartPage;
