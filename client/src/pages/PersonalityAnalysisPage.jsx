import React, { useState, useEffect } from 'react';
import analysisService from '../services/analysisService';
import ChartDataManager from '../utils/chartDataManager';
import EnhancedPersonalityProfile from '../components/reports/EnhancedPersonalityProfile';
import VedicLoadingSpinner from '../components/ui/loading/VedicLoadingSpinner';
import { Card } from '../components/ui/cards/Card';
import { Button } from '../components/ui/buttons/Button';

const PersonalityAnalysisPage = () => {
  const [analysisData, setAnalysisData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAnalysisData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const storedChartData = ChartDataManager.getChartData();

        if (!storedChartData || !storedChartData.chartId) {
          setError('No chart data found. Please generate a chart first.');
          setIsLoading(false);
          return;
        }

        const response = await analysisService.getComprehensiveAnalysis(storedChartData.chartId);

        if (response.success) {
          setAnalysisData(response);
        } else {
          setError(response.message || 'Failed to load comprehensive analysis');
        }
      } catch (err) {
        console.error('Error loading comprehensive analysis:', err);
        setError(err.message || 'An error occurred while loading the analysis.');
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalysisData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sacred-white to-gray-50 flex items-center justify-center p-4">
        <VedicLoadingSpinner
          fullscreen={false}
          text="Unveiling Your Cosmic Blueprint..."
          subtext="Please wait as we consult the stars for your personalized analysis."
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sacred-white to-gray-50 flex items-center justify-center p-4">
        <div className="container mx-auto">
        <Card variant="vedic" className="p-8 text-center max-w-lg mx-auto">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-3xl font-cinzel font-bold text-red-800 mb-4">
              Analysis Failed
            </h2>
            <p className="text-red-700/80 mb-6 bg-red-100 p-3 rounded-lg">{error}</p>
            <Button
              onClick={() => window.history.back()}
              variant="cosmic"
            >
              Go Back
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <EnhancedPersonalityProfile analysisData={analysisData} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default PersonalityAnalysisPage;
