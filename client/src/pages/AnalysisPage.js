import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, Button } from '../components/ui';
import ComprehensiveAnalysisDisplay from '../components/reports/ComprehensiveAnalysisDisplay';
import EnhancedPersonalityProfile from '../components/reports/EnhancedPersonalityProfile';
import analysisService from '../services/analysisService';

const AnalysisPage = () => {
  const [analysisData, setAnalysisData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeAnalysisType, setActiveAnalysisType] = useState('personality');
  const location = useLocation();
  const [chartId, setChartId] = useState(null);

  // Extract chartId from query params if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('chartId');
    if (id) {
      setChartId(id);
      (async () => {
        try {
          setIsLoading(true);
          const data = await analysisService.getComprehensiveAnalysis(id);
          setAnalysisData(data);
        } catch (err) {
          console.error('Failed to load comprehensive analysis', err);
        } finally {
          setIsLoading(false);
        }
      })();
    }
  }, [location.search]);

  const analysisTypes = [
    {
      id: 'personality',
      title: 'Personality Analysis',
      description: 'Deep insights into your character, strengths, and natural tendencies.',
      icon: '🧠',
      color: 'from-cosmic-purple to-vedic-primary'
    },
    {
      id: 'career',
      title: 'Career & Finance',
      description: 'Professional path, wealth indicators, and timing for success.',
      icon: '💼',
      color: 'from-vedic-gold to-saffron-bright'
    },
    {
      id: 'relationships',
      title: 'Relationships',
      description: 'Marriage, partnerships, and compatibility analysis.',
      icon: '💕',
      color: 'from-rose-500 to-pink-500'
    },
    {
      id: 'health',
      title: 'Health & Wellness',
      description: 'Physical constitution, health tendencies, and remedial measures.',
      icon: '🌿',
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'spiritual',
      title: 'Spiritual Path',
      description: 'Dharma, spiritual inclinations, and path to enlightenment.',
      icon: '🕉️',
      color: 'from-indigo-500 to-purple-600'
    },
    {
      id: 'timing',
      title: 'Life Timeline',
      description: 'Dasha analysis and major life event predictions.',
      icon: '⏳',
      color: 'from-orange-500 to-red-500'
    }
  ];

  const handleAnalysisRequest = async (analysisType) => {
    setIsLoading(true);
    setActiveAnalysisType(analysisType);

    try {
      if (!chartId) {
        console.warn('No chartId available for analysis request');
        return;
      }

      const data = await analysisService.getComprehensiveAnalysis(chartId);
      setAnalysisData(data);
    } catch (error) {
      console.error('Error getting analysis:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sacred-white to-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-cosmic-purple to-vedic-gold rounded-full flex items-center justify-center">
              <span className="text-2xl text-white">🔮</span>
            </div>
          </div>
          <h1 className="font-accent text-4xl md:text-5xl font-bold text-earth-brown mb-4">
            Comprehensive Analysis
          </h1>
          <p className="text-lg text-wisdom-gray max-w-3xl mx-auto">
            Explore the depths of your cosmic blueprint through authentic Vedic analysis.
            Each section reveals different aspects of your life's journey and potential.
          </p>
        </div>

        {/* Analysis Type Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {analysisTypes.map((type) => (
            <Card
              key={type.id}
              variant="elevated"
              className={`cursor-pointer transition-all duration-300 hover:shadow-cosmic group ${
                activeAnalysisType === type.id ? 'ring-2 ring-cosmic-purple shadow-cosmic' : ''
              }`}
              onClick={() => handleAnalysisRequest(type.id)}
            >
              <CardContent className="p-6 text-center">
                <div className={`w-16 h-16 bg-gradient-to-br ${type.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  <span className="text-2xl text-white">{type.icon}</span>
                </div>
                <h3 className="font-accent text-lg font-bold text-earth-brown mb-2">
                  {type.title}
                </h3>
                <p className="text-wisdom-gray text-sm leading-relaxed">
                  {type.description}
                </p>
                {activeAnalysisType === type.id && (
                  <div className="mt-4">
                    <div className="w-2 h-2 bg-cosmic-purple rounded-full mx-auto animate-pulse"></div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Analysis Results */}
        <div className="space-y-8">
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
                  Consulting the stars and calculating your {analysisTypes.find(t => t.id === activeAnalysisType)?.title.toLowerCase()}...
                </p>
              </div>
            </Card>
          )}

          {!isLoading && !analysisData && (
            <Card variant="cosmic" className="py-16">
              <div className="text-center">
                <div className="text-6xl text-white/80 mb-6">🌟</div>
                <h3 className="font-accent text-2xl font-bold text-white mb-4">
                  Ready for Deep Analysis
                </h3>
                <p className="text-white/90 max-w-2xl mx-auto leading-relaxed">
                  Select any analysis type above to begin your journey into the profound wisdom
                  of Vedic astrology. Each analysis provides detailed insights based on your
                  unique planetary positions and cosmic influences.
                </p>
              </div>
            </Card>
          )}

          {!isLoading && analysisData && activeAnalysisType === 'personality' && (
            <div className="space-y-6">
              {/* Enhanced Navigation Header */}
              <Card variant="elevated" className="p-4">
                <div className="flex flex-col sm:flex-row items-center justify-between">
                  <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                    <div className="w-8 h-8 bg-gradient-to-br from-cosmic-purple to-vedic-gold rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">🧠</span>
                    </div>
                    <div>
                      <h3 className="font-accent font-bold text-earth-brown">Personality Analysis</h3>
                      <p className="text-sm text-wisdom-gray">Deep insights into your character</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-cosmic-purple text-cosmic-purple hover:bg-cosmic-purple hover:text-white"
                      onClick={() => window.print()}
                    >
                      📄 Print Report
                    </Button>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-cosmic-purple to-vedic-primary"
                      onClick={() => window.location.href = `/report?chartId=${chartId}`}
                    >
                      📋 Full Report
                    </Button>
                  </div>
                </div>
              </Card>
              <EnhancedPersonalityProfile analysisData={analysisData} />
            </div>
          )}

          {!isLoading && analysisData && activeAnalysisType !== 'personality' && (
            <div className="space-y-6">
              {/* Enhanced Navigation Header */}
              <Card variant="elevated" className="p-4">
                <div className="flex flex-col sm:flex-row items-center justify-between">
                  <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                    <div className="w-8 h-8 bg-gradient-to-br from-cosmic-purple to-vedic-gold rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">
                        {analysisTypes.find(t => t.id === activeAnalysisType)?.icon}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-accent font-bold text-earth-brown">
                        {analysisTypes.find(t => t.id === activeAnalysisType)?.title}
                      </h3>
                      <p className="text-sm text-wisdom-gray">
                        {analysisTypes.find(t => t.id === activeAnalysisType)?.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-cosmic-purple text-cosmic-purple hover:bg-cosmic-purple hover:text-white"
                      onClick={() => window.print()}
                    >
                      📄 Print Report
                    </Button>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-cosmic-purple to-vedic-primary"
                      onClick={() => window.location.href = `/report?chartId=${chartId}`}
                    >
                      📋 Full Report
                    </Button>
                  </div>
                </div>
              </Card>
              <ComprehensiveAnalysisDisplay data={analysisData} />
            </div>
          )}
        </div>

        {/* Sample Analysis Preview */}
        {!analysisData && !isLoading && (
          <div className="mt-16">
            <Card variant="vedic">
              <CardHeader>
                <CardTitle className="text-white text-center flex items-center justify-center">
                  <span className="text-2xl mr-3">📖</span>
                  What You'll Discover
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="font-accent font-bold text-white text-lg">🎯 Precise Insights</h4>
                    <ul className="text-white/80 space-y-2 text-sm">
                      <li>• Detailed personality traits and behavioral patterns</li>
                      <li>• Career guidance based on planetary strengths</li>
                      <li>• Relationship compatibility and marriage timing</li>
                      <li>• Health tendencies and preventive measures</li>
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-accent font-bold text-white text-lg">⏰ Perfect Timing</h4>
                    <ul className="text-white/80 space-y-2 text-sm">
                      <li>• Dasha periods and their influences</li>
                      <li>• Auspicious times for major decisions</li>
                      <li>• Transit effects and their duration</li>
                      <li>• Remedial measures and their timing</li>
                    </ul>
                  </div>
                </div>
                              </CardContent>
            </Card>
          </div>
        )}

        {/* Action Buttons */}
        {analysisData && (
          <div className="mt-12 text-center space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="outline"
                className="border-cosmic-purple text-cosmic-purple hover:bg-cosmic-purple hover:text-white"
              >
                Download Analysis
              </Button>
              <Button
                className="bg-gradient-to-r from-cosmic-purple to-vedic-primary"
              >
                Get Full Report
              </Button>
            </div>
            <p className="text-wisdom-gray text-sm">
              Want more insights? Generate a complete astrological report with all analysis types.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisPage;
