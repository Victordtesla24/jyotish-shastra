import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, Button } from '../components/ui';
import ComprehensiveAnalysisDisplay from '../components/reports/ComprehensiveAnalysisDisplay';
import analysisService from '../services/analysisService';
import ChartDataManager from '../utils/chartDataManager';

const ReportPage = () => {
  const { id } = useParams();
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [reportType, setReportType] = useState('comprehensive');

  const reportTypes = [
    {
      id: 'comprehensive',
      title: 'Comprehensive Report',
      description: 'Complete life analysis with all major aspects covered in detail.',
      price: 'Premium',
      features: [
        'Complete personality analysis',
        'Career and financial prospects',
        'Relationship and marriage timing',
        'Health and wellness guidance',
        'Spiritual path and dharma',
        'Dasha timeline for 10 years',
        'Remedial measures',
        'Transit predictions'
      ],
      icon: '📜',
      color: 'from-cosmic-purple to-vedic-primary'
    },
    {
      id: 'basic',
      title: 'Basic Report',
      description: 'Essential insights covering personality and major life themes.',
      price: 'Standard',
      features: [
        'Core personality traits',
        'Basic career guidance',
        'General life themes',
        'Current dasha period',
        'Simple remedies'
      ],
      icon: '📄',
      color: 'from-vedic-gold to-saffron-bright'
    },
    {
      id: 'specialized',
      title: 'Specialized Report',
      description: 'Focus on specific areas like career, marriage, or health.',
      price: 'Custom',
      features: [
        'Deep focus on chosen area',
        'Detailed timing analysis',
        'Specific remedial measures',
        'Compatibility analysis (if applicable)',
        'Professional consultation'
      ],
      icon: '🎯',
      color: 'from-emerald-500 to-teal-500'
    }
  ];

  useEffect(() => {
    if (id) {
      fetchExistingReport(id);
    }
  }, [id]);

  const fetchExistingReport = async (reportId) => {
    setIsLoading(true);
    try {
      const result = await analysisService.getComprehensiveAnalysis(reportId);
      setReportData(result);
    } catch (error) {
      console.error('Error fetching report:', error);
      alert('Error fetching report: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

    const generateReport = async (type) => {
    setIsLoading(true);
    setReportType(type);

    try {
      // Try to get birth data from stored chart generation
      let birthData = ChartDataManager.getFormattedBirthData();

      if (!birthData) {
        alert('Please generate a birth chart first by visiting the Chart page to provide your birth details.');
        setIsLoading(false);
        return;
      }

      console.log(`Generating ${type} report with birth data:`, birthData);

      // Call the comprehensive analysis endpoint
      const result = await analysisService.generateBirthDataAnalysis(birthData);
      console.log('Report generation result:', result);

      if (result.success) {
        setReportData(result.analysis);
        console.log('Report data set successfully');
      } else {
        console.error('Report generation failed:', result.error);
        alert('Failed to generate report: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error generating report: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadReport = (format) => {
    // This would implement actual download functionality
    console.log(`Downloading report in ${format} format`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sacred-white to-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-cosmic-purple to-vedic-gold rounded-full flex items-center justify-center">
              <span className="text-2xl text-white">📜</span>
            </div>
          </div>
          <h1 className="font-accent text-4xl md:text-5xl font-bold text-earth-brown mb-4">
            Astrological Reports
          </h1>
          <p className="text-lg text-wisdom-gray max-w-3xl mx-auto">
            Comprehensive Vedic astrology reports that provide deep insights, precise timing,
            and practical guidance for your life's journey.
          </p>
        </div>

        {/* Report Type Selection */}
        {!reportData && !isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {reportTypes.map((type) => (
              <Card
                key={type.id}
                variant="elevated"
                className="group hover:shadow-cosmic transition-all duration-300 relative overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${type.color} opacity-10 rounded-bl-full`}></div>

                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 bg-gradient-to-br ${type.color} rounded-full flex items-center justify-center`}>
                      <span className="text-xl text-white">{type.icon}</span>
                    </div>
                    <span className={`text-sm font-medium px-3 py-1 bg-gradient-to-r ${type.color} text-white rounded-full`}>
                      {type.price}
                    </span>
                  </div>
                  <CardTitle className="text-xl font-bold text-earth-brown mt-4">
                    {type.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                  <p className="text-wisdom-gray leading-relaxed">
                    {type.description}
                  </p>

                  <div className="space-y-3">
                    <h4 className="font-accent font-semibold text-earth-brown">What's Included:</h4>
                    <ul className="space-y-2">
                      {type.features.map((feature, index) => (
                        <li key={index} className="flex items-start text-sm text-wisdom-gray">
                          <span className="text-cosmic-purple mr-2 mt-1">•</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    className={`w-full bg-gradient-to-r ${type.color} group-hover:shadow-cosmic`}
                    onClick={() => generateReport(type.id)}
                  >
                    Generate {type.title}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <Card variant="elevated" className="py-16">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-cosmic-purple to-vedic-gold rounded-full flex items-center justify-center mx-auto mb-6 animate-spin">
                <span className="text-2xl text-white">🕉️</span>
              </div>
              <h3 className="font-accent text-2xl font-bold text-earth-brown mb-4">
                Crafting Your Sacred Report
              </h3>
              <p className="text-wisdom-gray max-w-2xl mx-auto">
                Our astrologers are consulting ancient wisdom and modern calculations
                to create your personalized {reportTypes.find(t => t.id === reportType)?.title.toLowerCase()}.
                This process ensures accuracy and authenticity.
              </p>
            </div>
          </Card>
        )}

        {/* Report Display */}
        {reportData && !isLoading && (
          <div className="space-y-8">
            {/* Report Header */}
            <Card variant="cosmic">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                  <div>
                    <h2 className="font-accent text-2xl font-bold text-white mb-2">
                      Your Vedic Astrology Report
                    </h2>
                    <p className="text-white/80">
                      Generated on {new Date().toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => downloadReport('pdf')}
                      className="bg-white text-cosmic-purple hover:bg-vedic-gold hover:text-white"
                    >
                      📄 Download PDF
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => downloadReport('email')}
                      className="bg-white text-cosmic-purple hover:bg-vedic-gold hover:text-white"
                    >
                      📧 Email Report
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Report Content */}
            <ComprehensiveAnalysisDisplay data={reportData} />

            {/* Report Footer */}
            <Card variant="vedic">
              <CardContent className="p-8 text-center">
                <h3 className="font-accent text-xl font-bold text-white mb-4">
                  🙏 Report Disclaimer
                </h3>
                <p className="text-white/80 text-sm leading-relaxed max-w-3xl mx-auto">
                  This report is based on authentic Vedic astrology principles and calculations.
                  While we strive for accuracy, astrology should be used as guidance alongside
                  your own judgment and decision-making. The insights provided are meant to
                  help you understand cosmic influences and make informed choices in life.
                </p>

                <div className="mt-6 pt-6 border-t border-white/20">
                  <p className="text-vedic-gold font-accent">
                    सत्यं शिवं सुन्दरम्
                  </p>
                  <p className="text-white/60 text-xs mt-1">
                    Truth, Auspiciousness, Beauty
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Sample Report Preview */}
        {!reportData && !isLoading && (
          <div className="mt-16">
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="text-center flex items-center justify-center">
                  <span className="text-2xl mr-3">📋</span>
                  Sample Report Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-accent font-bold text-earth-brown text-lg mb-4">
                      📊 What Our Reports Include
                    </h4>
                    <ul className="space-y-3 text-wisdom-gray">
                      <li className="flex items-start">
                        <span className="text-cosmic-purple mr-3 mt-1">🎯</span>
                        <div>
                          <strong>Precise Analysis:</strong> Based on exact birth time and location
                        </div>
                      </li>
                      <li className="flex items-start">
                        <span className="text-cosmic-purple mr-3 mt-1">📈</span>
                        <div>
                          <strong>Life Timeline:</strong> Dasha periods and major life events
                        </div>
                      </li>
                      <li className="flex items-start">
                        <span className="text-cosmic-purple mr-3 mt-1">💡</span>
                        <div>
                          <strong>Practical Guidance:</strong> Actionable insights and remedies
                        </div>
                      </li>
                      <li className="flex items-start">
                        <span className="text-cosmic-purple mr-3 mt-1">🔮</span>
                        <div>
                          <strong>Future Predictions:</strong> Upcoming opportunities and challenges
                        </div>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-accent font-bold text-earth-brown text-lg mb-4">
                      ⭐ Why Choose Our Reports
                    </h4>
                    <ul className="space-y-3 text-wisdom-gray">
                      <li className="flex items-start">
                        <span className="text-vedic-gold mr-3 mt-1">✨</span>
                        <div>Authentic Vedic calculations and interpretations</div>
                      </li>
                      <li className="flex items-start">
                        <span className="text-vedic-gold mr-3 mt-1">🎓</span>
                        <div>Prepared by experienced Vedic astrologers</div>
                      </li>
                      <li className="flex items-start">
                        <span className="text-vedic-gold mr-3 mt-1">📱</span>
                        <div>Modern presentation of ancient wisdom</div>
                      </li>
                      <li className="flex items-start">
                        <span className="text-vedic-gold mr-3 mt-1">🔄</span>
                        <div>Regular updates and consultation support</div>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportPage;
