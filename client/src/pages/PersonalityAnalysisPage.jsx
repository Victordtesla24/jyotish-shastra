import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/cards/Card';
import { Button } from '../components/ui/buttons/Button';
import analysisService from '../services/analysisService';
import ChartDataManager from '../utils/chartDataManager';

/**
 * PersonalityAnalysisPage Component
 * Dedicated page for personality analysis as requested in user requirements
 */
const PersonalityAnalysisPage = () => {
  const [analysisData, setAnalysisData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [birthData, setBirthData] = useState(null);

  useEffect(() => {
    loadAnalysisData();
  }, []);

  const loadAnalysisData = async () => {
    try {
      setIsLoading(true);

      // Get birth data from stored chart data
      const storedBirthData = ChartDataManager.getBirthData();
      const storedChartData = ChartDataManager.getChartData();

      if (!storedBirthData) {
        setError('No birth data found. Please generate a chart first.');
        return;
      }

      setBirthData(storedBirthData);

      // Generate personality analysis
      const response = await analysisService.getPersonalityAnalysis(storedBirthData);
      if (response.success) {
        setAnalysisData(response.data);
      } else {
        setError(response.message || 'Failed to load personality analysis');
      }
    } catch (err) {
      console.error('Error loading personality analysis:', err);
      setError(err.message || 'An error occurred while loading analysis');
    } finally {
      setIsLoading(false);
    }
  };

  const personalityAspects = [
    {
      title: 'Core Personality Traits',
      icon: '🧠',
      description: 'Deep insights into your character, strengths, and natural tendencies'
    },
    {
      title: 'Emotional Nature',
      icon: '💖',
      description: 'Understanding your emotional patterns and responses'
    },
    {
      title: 'Communication Style',
      icon: '🗣️',
      description: 'How you express yourself and interact with others'
    },
    {
      title: 'Learning & Growth',
      icon: '📚',
      description: 'Your natural learning style and areas for development'
    },
    {
      title: 'Leadership Qualities',
      icon: '👑',
      description: 'Natural leadership abilities and management style'
    },
    {
      title: 'Creative Expression',
      icon: '🎨',
      description: 'Artistic talents and creative potential'
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sacred-white to-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-8 text-center">
            <div className="animate-spin h-12 w-12 border-4 border-vedic-orange border-t-transparent rounded-full mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-earth-brown mb-4">
              Analyzing Your Personality Profile
            </h2>
            <p className="text-earth-brown/70">
              Examining planetary influences on your character and behavioral patterns...
            </p>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sacred-white to-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-8 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-earth-brown mb-4">
              Analysis Unavailable
            </h2>
            <p className="text-earth-brown/70 mb-6">{error}</p>
            <Button
              onClick={() => window.history.back()}
              className="bg-vedic-orange hover:bg-vedic-orange/90"
            >
              Go Back
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sacred-white to-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-cosmic-purple to-vedic-gold rounded-full flex items-center justify-center">
              <span className="text-2xl text-white">🧠</span>
            </div>
          </div>
          <h1 className="font-accent text-4xl md:text-5xl font-bold text-earth-brown mb-4">
            Personality Analysis
          </h1>
          <p className="text-lg text-wisdom-gray max-w-2xl mx-auto">
            Deep insights into your character, strengths, and natural tendencies
            based on traditional Vedic astrology principles.
          </p>
          {birthData && (
            <div className="mt-4 text-sm text-earth-brown/70">
              Analysis for {birthData.name} • Born {birthData.dateOfBirth} • {birthData.placeOfBirth}
            </div>
          )}
        </div>

        {/* Analysis Aspects Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {personalityAspects.map((aspect, index) => (
            <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">{aspect.icon}</div>
              <h3 className="text-lg font-bold text-earth-brown mb-2">
                {aspect.title}
              </h3>
              <p className="text-sm text-earth-brown/70">
                {aspect.description}
              </p>
            </Card>
          ))}
        </div>

        {/* Main Analysis Content */}
        {analysisData && (
          <div className="space-y-8">
            {/* Core Personality */}
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-earth-brown mb-6 flex items-center">
                <span className="text-3xl mr-3">🧠</span>
                Core Personality Traits
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-earth-brown mb-3">
                    Primary Characteristics
                  </h3>
                  <div className="space-y-2">
                    {analysisData.personalityTraits?.primary?.map((trait, index) => (
                      <div key={index} className="bg-golden-yellow/20 p-3 rounded-lg">
                        <div className="font-medium text-earth-brown">{trait.name}</div>
                        <div className="text-sm text-earth-brown/70">{trait.description}</div>
                      </div>
                    )) || (
                      <div className="text-earth-brown/70">
                        Detailed personality analysis will be available once chart processing is complete.
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-earth-brown mb-3">
                    Natural Tendencies
                  </h3>
                  <div className="space-y-2">
                    {analysisData.personalityTraits?.secondary?.map((trait, index) => (
                      <div key={index} className="bg-warm-cream p-3 rounded-lg">
                        <div className="font-medium text-earth-brown">{trait.name}</div>
                        <div className="text-sm text-earth-brown/70">{trait.description}</div>
                      </div>
                    )) || (
                      <div className="text-earth-brown/70">
                        Secondary traits analysis in progress...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Emotional Nature */}
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-earth-brown mb-6 flex items-center">
                <span className="text-3xl mr-3">💖</span>
                Emotional Nature & Responses
              </h2>
              <div className="prose prose-earth max-w-none text-earth-brown/80">
                <p>
                  {analysisData.emotionalProfile?.description ||
                   'Your emotional profile reveals deep insights into how you process feelings, form connections, and respond to life\'s challenges. This analysis considers the positions of the Moon, Venus, and other emotional indicators in your chart.'}
                </p>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-earth-brown mb-2">Emotional Strengths</h4>
                    <ul className="text-sm space-y-1">
                      {analysisData.emotionalProfile?.strengths?.map((strength, index) => (
                        <li key={index}>• {strength}</li>
                      )) || [
                        '• Deep empathy and understanding',
                        '• Strong intuitive abilities',
                        '• Natural emotional intelligence'
                      ].map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-earth-brown mb-2">Areas for Growth</h4>
                    <ul className="text-sm space-y-1">
                      {analysisData.emotionalProfile?.growthAreas?.map((area, index) => (
                        <li key={index}>• {area}</li>
                      )) || [
                        '• Balancing emotional and logical responses',
                        '• Setting healthy emotional boundaries',
                        '• Managing emotional intensity'
                      ].map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            </Card>

            {/* Communication Style */}
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-earth-brown mb-6 flex items-center">
                <span className="text-3xl mr-3">🗣️</span>
                Communication & Expression
              </h2>
              <div className="text-earth-brown/80">
                <p className="mb-4">
                  {analysisData.communicationStyle?.overview ||
                   'Your communication style is influenced by Mercury\'s position and aspects in your chart, revealing how you express thoughts, process information, and connect with others.'}
                </p>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="text-2xl mb-2">🎤</div>
                    <h4 className="font-semibold mb-2">Speaking Style</h4>
                    <p className="text-sm">
                      {analysisData.communicationStyle?.speaking || 'Thoughtful and articulate'}
                    </p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg text-center">
                    <div className="text-2xl mb-2">👂</div>
                    <h4 className="font-semibold mb-2">Listening Style</h4>
                    <p className="text-sm">
                      {analysisData.communicationStyle?.listening || 'Attentive and empathetic'}
                    </p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg text-center">
                    <div className="text-2xl mb-2">✍️</div>
                    <h4 className="font-semibold mb-2">Written Expression</h4>
                    <p className="text-sm">
                      {analysisData.communicationStyle?.writing || 'Clear and purposeful'}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => window.history.back()}
                variant="outline"
                className="border-vedic-orange text-vedic-orange hover:bg-vedic-orange hover:text-white"
              >
                ← Back to Analysis Menu
              </Button>
              <Button
                onClick={() => window.location.href = '/report'}
                className="bg-gradient-to-r from-cosmic-purple to-vedic-primary"
              >
                View Complete Report
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalityAnalysisPage;
