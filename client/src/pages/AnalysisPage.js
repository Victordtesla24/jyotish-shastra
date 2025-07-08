import React, { useEffect, useState, Suspense } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, Button } from '../components/ui';

import analysisService from '../services/analysisService';
import ChartDataManager from '../utils/chartDataManager';



// Lazy load ComprehensiveAnalysisDisplay
const ComprehensiveAnalysisDisplay = React.lazy(() =>
  import('../components/reports/ComprehensiveAnalysisDisplay').catch(err => {
    console.error('Error loading ComprehensiveAnalysisDisplay:', err);
    return Promise.resolve({
      default: () => (
        <div className="card-cosmic text-center p-8">
          <h3 className="text-sacred-white text-xl mb-4">📊 Analysis Loading Error</h3>
          <p className="text-sacred-white/80 mb-6">
            Please refresh the page to try again.
          </p>
          <button onClick={() => window.location.reload()} className="btn-vedic">
            Refresh Page
          </button>
        </div>
      )
    });
  })
);

const AnalysisPage = () => {
  const [analysisData, setAnalysisData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [chartId, setChartId] = useState(null);

  // Extract chartId from query params or location state
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlChartId = params.get('chartId');
    const stateData = location.state;

    if (urlChartId) {
      setChartId(urlChartId);
    } else if (stateData?.birthData) {
      ChartDataManager.storeBirthData(stateData.birthData);
    } else {
      const storedChartData = ChartDataManager.getChartData();
      if (storedChartData?.chartId) {
        setChartId(storedChartData.chartId);
      }
    }
  }, [location.search, location.state]);

  // Load analysis data when chartId is available
  useEffect(() => {
    if (!chartId) return;

    const loadAnalysisData = async () => {
      try {
        setIsLoading(true);
        const data = await analysisService.getComprehensiveAnalysis(chartId);
        setAnalysisData(data);
      } catch (err) {
        console.error('Failed to load comprehensive analysis:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalysisData();
  }, [chartId]);

  const handleAnalysisRequest = async () => {
    setIsLoading(true);

    try {
      if (chartId) {
        const data = await analysisService.getComprehensiveAnalysis(chartId);
        setAnalysisData(data);
      } else {
        const birthData = ChartDataManager.getFormattedBirthData();
        if (birthData) {
          const data = await analysisService.generateBirthDataAnalysis(birthData);
          setAnalysisData(data);
        }
      }
    } catch (error) {
      console.error('Error getting analysis:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-vedic-pattern"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="container-vedic py-8">
        {/* Enhanced Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.div
            className="flex justify-center mb-6"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <div className="w-20 h-20 bg-gradient-cosmic rounded-full flex items-center justify-center cosmic-glow">
              <span className="text-3xl text-sacred-white">🔮</span>
            </div>
          </motion.div>
          <h1 className="font-accent text-4xl md:text-6xl font-bold text-earth-brown mb-4">
            ॐ Vedic Analysis ॐ
          </h1>
          <div className="sanskrit-text text-lg mb-4">
            ज्योतिष शास्त्र विश्लेषण
          </div>
          <p className="text-lg text-wisdom-gray max-w-3xl mx-auto leading-relaxed">
            Explore the depths of your cosmic blueprint through authentic Vedic analysis.
            Each section reveals different aspects of your life's journey and divine potential.
          </p>

          {/* Generate Chart Notice */}
          {!chartId && (
            <motion.div
              className="card-cosmic mt-8 max-w-2xl mx-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="text-center py-6">
                <div className="text-4xl mb-3">🌟</div>
                <h3 className="font-accent text-xl text-sacred-white mb-3">
                  Generate Your Birth Chart First
                </h3>
                <p className="text-sacred-white/80 mb-6">
                  To access your personalized analysis, please generate your birth chart first.
                </p>
                <Button
                  className="btn-vedic"
                  onClick={() => navigate('/chart')}
                >
                  Create Birth Chart
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Analysis Request Section */}
        {chartId && !analysisData && !isLoading && (
          <div className="text-center mb-12">
            <Card variant="elevated" className="max-w-2xl mx-auto">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-cosmic-purple to-vedic-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-white">🔮</span>
                </div>
                <h3 className="font-accent text-lg font-bold text-earth-brown mb-2">
                  Complete Analysis
                </h3>
                <p className="text-wisdom-gray text-sm leading-relaxed mb-6">
                  Full 8-section comprehensive Vedic analysis with all life areas covered.
                </p>
                <Button
                  className="bg-gradient-to-r from-cosmic-purple to-vedic-primary text-white"
                  onClick={handleAnalysisRequest}
                >
                  Generate Comprehensive Analysis
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <Card variant="elevated" className="py-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-cosmic-purple to-vedic-gold rounded-full flex items-center justify-center mx-auto mb-6 animate-spin">
                <span className="text-xl text-white">🕉️</span>
              </div>
              <h3 className="font-accent text-xl font-bold text-earth-brown mb-2">
                Analyzing Your Cosmic Blueprint
              </h3>
              <p className="text-wisdom-gray">
                Consulting the stars and calculating your comprehensive analysis...
              </p>
            </div>
          </Card>
        )}

        {/* Analysis Results */}
        {!isLoading && analysisData && (
          <div className="space-y-6">
            {/* Navigation Header */}
            <Card variant="elevated" className="p-4">
              <div className="flex flex-col sm:flex-row items-center justify-between">
                <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                  <div className="w-10 h-10 bg-gradient-cosmic rounded-full flex items-center justify-center">
                    <span className="text-sacred-white text-lg">🔮</span>
                  </div>
                  <div>
                    <h3 className="font-accent font-bold text-earth-brown text-lg">
                      Comprehensive Analysis
                    </h3>
                    <p className="text-sm text-wisdom-gray">
                      Complete 8-section Vedic analysis
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="btn-sacred"
                    onClick={() => window.print()}
                  >
                    📄 Print Report
                  </Button>
                  <Button
                    size="sm"
                    className="btn-cosmic"
                    onClick={() => navigate(`/report?chartId=${chartId}`)}
                  >
                    📋 Full Report
                  </Button>
                </div>
              </div>
            </Card>

            {/* Analysis Display */}
            <Suspense fallback={
              <div className="card-cosmic text-center py-16">
                <h3 className="font-accent text-xl text-sacred-white mb-2">
                  Loading Analysis...
                </h3>
                <p className="text-sacred-white/80">
                  Interpreting planetary influences in your chart
                </p>
              </div>
            }>
              <ComprehensiveAnalysisDisplay data={analysisData} />
            </Suspense>
          </div>
        )}

        {/* Information Section */}
        {!analysisData && !isLoading && chartId && (
          <div className="mt-16">
            <Card variant="vedic">
              <CardHeader>
                <CardTitle className="text-white text-center flex items-center justify-center">
                  <span className="text-2xl mr-3">📖</span>
                  Analysis Features
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="font-accent font-bold text-white text-lg">🎯 Detailed Insights</h4>
                    <ul className="text-white/80 space-y-2 text-sm">
                      <li>• Personality traits and behavioral patterns</li>
                      <li>• Career guidance based on planetary strengths</li>
                      <li>• Relationship compatibility analysis</li>
                      <li>• Health tendencies and remedial measures</li>
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-accent font-bold text-white text-lg">⏰ Timing Analysis</h4>
                    <ul className="text-white/80 space-y-2 text-sm">
                      <li>• Dasha periods and their influences</li>
                      <li>• Auspicious timing for major decisions</li>
                      <li>• Transit effects and duration</li>
                      <li>• Vedic remedies and their application</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AnalysisPage;
