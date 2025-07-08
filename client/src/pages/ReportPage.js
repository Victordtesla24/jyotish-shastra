import React, { useState, useEffect, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, Button } from '../components/ui';
import analysisService from '../services/analysisService';
import ChartDataManager from '../utils/chartDataManager';

// Lazy load ComprehensiveAnalysisDisplay
const ComprehensiveAnalysisDisplay = React.lazy(() =>
  import('../components/reports/ComprehensiveAnalysisDisplay').catch(err => {
    console.error('Error loading ComprehensiveAnalysisDisplay:', err);
    return Promise.resolve({
      default: () => (
        <div className="card-cosmic text-center p-8">
          <h3 className="text-sacred-white text-xl mb-4">📊 Report Loading Error</h3>
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

const ReportPage = () => {
  const { id } = useParams();
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

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

  const generateReport = async () => {
    setIsLoading(true);

    try {
      let birthData = ChartDataManager.getFormattedBirthData();

      if (!birthData) {
        alert('Please generate a birth chart first by visiting the Chart page.');
        setIsLoading(false);
        return;
      }

      const result = await analysisService.generateBirthDataAnalysis(birthData);

      if (result.success) {
        setReportData(result.analysis);
      } else {
        alert('Failed to generate report: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error generating report: ' + error.message);
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
              <span className="text-2xl text-white">📜</span>
            </div>
          </div>
          <h1 className="font-accent text-4xl md:text-5xl font-bold text-earth-brown mb-4">
            Comprehensive Report
          </h1>
          <p className="text-lg text-wisdom-gray max-w-3xl mx-auto">
            Complete Vedic astrology analysis with deep insights and practical guidance for your life's journey.
          </p>
        </div>

        {/* Report Generation */}
        {!reportData && !isLoading && (
          <div className="text-center mb-12">
            <Card variant="elevated" className="max-w-2xl mx-auto">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-cosmic-purple to-vedic-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-white">📜</span>
                </div>
                <h3 className="font-accent text-lg font-bold text-earth-brown mb-2">
                  Comprehensive Report
                </h3>
                <p className="text-wisdom-gray text-sm leading-relaxed mb-6">
                  Complete life analysis with all major aspects covered in detail including personality, career, relationships, health, and spiritual guidance.
                </p>
                <div className="space-y-3 mb-6">
                  <h4 className="font-accent font-semibold text-earth-brown">What's Included:</h4>
                  <ul className="space-y-2 text-left">
                    <li className="flex items-start text-sm text-wisdom-gray">
                      <span className="text-cosmic-purple mr-2 mt-1">•</span>
                      Complete personality analysis and behavioral patterns
                    </li>
                    <li className="flex items-start text-sm text-wisdom-gray">
                      <span className="text-cosmic-purple mr-2 mt-1">•</span>
                      Career and financial prospects with timing analysis
                    </li>
                    <li className="flex items-start text-sm text-wisdom-gray">
                      <span className="text-cosmic-purple mr-2 mt-1">•</span>
                      Relationship compatibility and marriage guidance
                    </li>
                    <li className="flex items-start text-sm text-wisdom-gray">
                      <span className="text-cosmic-purple mr-2 mt-1">•</span>
                      Health tendencies and preventive measures
                    </li>
                    <li className="flex items-start text-sm text-wisdom-gray">
                      <span className="text-cosmic-purple mr-2 mt-1">•</span>
                      Spiritual path and dharma guidance
                    </li>
                    <li className="flex items-start text-sm text-wisdom-gray">
                      <span className="text-cosmic-purple mr-2 mt-1">•</span>
                      Dasha timeline and major life events
                    </li>
                  </ul>
                </div>
                <Button
                  className="bg-gradient-to-r from-cosmic-purple to-vedic-primary text-white"
                  onClick={generateReport}
                >
                  Generate Comprehensive Report
                </Button>
              </CardContent>
            </Card>
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
                Generating Your Report
              </h3>
              <p className="text-wisdom-gray max-w-2xl mx-auto">
                Consulting ancient wisdom and modern calculations to create your personalized comprehensive analysis.
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
                      Your Comprehensive Vedic Report
                    </h2>
                    <p className="text-white/80">
                      Generated on {new Date().toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>

                  <div className="flex gap-3 mt-4 md:mt-0">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => window.print()}
                      className="bg-white text-cosmic-purple hover:bg-vedic-gold hover:text-white"
                    >
                      📄 Print Report
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Report Content */}
            <Suspense fallback={
              <div className="card-cosmic text-center py-16">
                <h3 className="font-accent text-xl text-sacred-white mb-2">
                  Loading Report...
                </h3>
                <p className="text-sacred-white/80">
                  Preparing comprehensive analysis
                </p>
              </div>
            }>
              <ComprehensiveAnalysisDisplay data={reportData} />
            </Suspense>

            {/* Report Footer */}
            <Card variant="vedic">
              <CardContent className="p-8 text-center">
                <h3 className="font-accent text-xl font-bold text-white mb-4">
                  🙏 Report Information
                </h3>
                <p className="text-white/80 text-sm leading-relaxed max-w-3xl mx-auto">
                  This report is based on authentic Vedic astrology principles and Swiss Ephemeris calculations.
                  The insights provided are meant to help you understand cosmic influences and make informed
                  choices in your life journey.
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
      </div>
    </div>
  );
};

export default ReportPage;
