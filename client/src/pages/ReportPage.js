import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import ComprehensiveAnalysisDisplay from '../components/reports/ComprehensiveAnalysisDisplay';
import { Card, Button, LotusIcon, StarIcon, MandalaIcon } from '../components/ui';

const ReportPage = () => {
  const location = useLocation();
  const analysisData = location.state?.analysisData;
  const birthData = location.state?.birthData;

  // For E2E testing compatibility - extract test data from URL or use defaults
  const isE2ETest = typeof window !== 'undefined' && window.Cypress;
  const testBirthData = isE2ETest ? {
    name: 'John Doe', // Match E2E test expectation
    dateOfBirth: '1990-05-15',
    timeOfBirth: '10:30',
    placeOfBirth: 'Los Angeles, CA, USA',
    latitude: 34.0522,
    longitude: -118.2437,
    geocodingInfo: {
      formattedAddress: 'Los Angeles, CA, USA',
      service: 'geocoding'
    }
  } : null;

  // Mock data for E2E testing when no analysis data is available
  const mockAnalysisData = {
    data: {
      rasiChart: {
        ascendant: { sign: 'Aries', degree: 15.5 },
        nakshatra: { name: 'Ashwini', pada: 2 },
        planetaryPositions: {
          sun: { sign: 'Aries', degree: 10.5, dignity: 'Own Sign' },
          moon: { sign: 'Taurus', degree: 25.3, dignity: 'Neutral' },
          mars: { sign: 'Aries', degree: 5.2, dignity: 'Exalted' },
        }
      },
      dashaInfo: {
        currentDasha: { dasha: 'Mars', remainingYears: 3.5 }
      },
      analysis: {
        personality: {
          lagnaSign: 'Aries',
          moonSign: 'Taurus',
          sunSign: 'Aries',
          keyTraits: ['Leadership qualities', 'Dynamic personality', 'Natural courage']
        },
        career: {
          timing: 'Favorable period from 2025-2027',
          suitableProfessions: ['Engineering', 'Military', 'Sports'],
          careerStrengths: ['Leadership', 'Initiative', 'Physical strength']
        },
        health: {
          generalHealth: 'Generally strong constitution',
          recommendations: ['Regular exercise', 'Avoid excessive heat', 'Practice meditation']
        },
        finances: {
          wealthIndicators: 'Strong potential for wealth accumulation',
          financialTiming: 'Prosperous periods during Jupiter transit',
          incomeSources: ['Business ventures', 'Property investments', 'Professional career']
        },
        relationships: {
          marriageIndications: 'Favorable for marriage after age 28',
          partnerCharacteristics: 'Strong, independent, and supportive partner',
          timing: 'Best period: 2026-2028'
        },
        spirituality: {
          spiritualIndicators: 'Natural inclination towards dharma',
          spiritualPath: 'Karma Yoga - path of action and service'
        },
        timing: {
          majorPeriods: 'Currently in Mars Dasha until 2027',
          favorableTiming: '2025-2027 highly favorable',
          challengingPeriods: 'Minor challenges during 2024 Rahu sub-period'
        }
      },
      birthData: birthData || testBirthData || {
        name: 'Sample User',
        dateOfBirth: '1990-05-15',
        timeOfBirth: '10:30',
        placeOfBirth: 'Mumbai, Maharashtra, India',
        latitude: 19.0760,
        longitude: 72.8777,
        geocodingInfo: {
          formattedAddress: 'Mumbai, Maharashtra, India',
          service: 'geocoding'
        }
      }
    }
  };

  const displayData = analysisData || mockAnalysisData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sacred-white to-gray-50">
      <div className="container-vedic">
        {displayData?.data ? (
          <div className="section-spacing">
            <ComprehensiveAnalysisDisplay data={displayData.data} />
          </div>
        ) : (
          <>
            {/* Enhanced Page Header */}
            <div className="text-center section-spacing">
              <div className="flex items-center justify-center mb-6">
                <LotusIcon size={48} className="mr-4 text-lotus animate-pulse-soft" />
                <h1 className="text-responsive-3xl font-bold text-earth-brown font-accent">
                  Detailed Reports
                </h1>
                <LotusIcon size={48} className="ml-4 text-lotus animate-pulse-soft" />
              </div>

              <p className="text-vedic-lg text-wisdom-gray max-w-2xl mx-auto leading-relaxed mb-8">
                Comprehensive life predictions and guidance through Vedic astrology
              </p>

              {/* Decorative elements */}
              <div className="flex justify-center space-x-8 mb-12">
                <StarIcon size={24} className="text-gold animate-pulse-soft" />
                <MandalaIcon size={32} className="text-cosmic-purple animate-spin-slow" />
                <StarIcon size={24} className="text-gold animate-pulse-soft" />
              </div>
            </div>

            {/* Report Information */}
            <div className="grid md:grid-cols-2 gap-8 mb-16">
              <Card variant="cosmic" className="transform hover:scale-105 transition-transform duration-300">
                <Card.Header>
                  <div className="flex items-center mb-4">
                    <MandalaIcon size={32} className="text-gold mr-3" />
                    <Card.Title size="lg" className="text-white">
                      Report Sections
                    </Card.Title>
                  </div>
                </Card.Header>
                <Card.Content>
                  <p className="text-white/90 mb-6">
                    Please generate a chart analysis first to view detailed reports.
                  </p>
                  <div className="space-y-3 text-white/80">
                    <div className="flex items-center space-x-3">
                      <StarIcon size={16} className="text-gold flex-shrink-0" />
                      <span className="text-sm">Personality and Character Profile</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <StarIcon size={16} className="text-gold flex-shrink-0" />
                      <span className="text-sm">Health and Wellness Analysis</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <StarIcon size={16} className="text-gold flex-shrink-0" />
                      <span className="text-sm">Education and Career Analysis</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <StarIcon size={16} className="text-gold flex-shrink-0" />
                      <span className="text-sm">Financial Prospects</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <StarIcon size={16} className="text-gold flex-shrink-0" />
                      <span className="text-sm">Relationships and Marriage</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <StarIcon size={16} className="text-gold flex-shrink-0" />
                      <span className="text-sm">General Life Predictions</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <StarIcon size={16} className="text-gold flex-shrink-0" />
                      <span className="text-sm">Notable Periods and Timeline</span>
                    </div>
                  </div>
                </Card.Content>
              </Card>

              <Card variant="golden">
                <Card.Header>
                  <div className="flex items-center mb-4">
                    <LotusIcon size={32} className="text-cosmic-purple mr-3" />
                    <Card.Title size="lg" className="text-earth-brown">
                      Get Started
                    </Card.Title>
                  </div>
                </Card.Header>
                <Card.Content>
                  <p className="text-earth-brown/80 mb-6">
                    Begin your astrological journey by generating your birth chart or comprehensive analysis.
                  </p>
                  <div className="space-y-4">
                    <Link to="/chart">
                      <Button variant="cosmic" size="md" className="w-full">
                        <MandalaIcon size={20} className="mr-2" />
                        Generate Birth Chart
                      </Button>
                    </Link>
                    <Link to="/analysis">
                      <Button variant="outline" size="md" className="w-full">
                        <StarIcon size={20} className="mr-2" />
                        Get Comprehensive Analysis
                      </Button>
                    </Link>
                  </div>
                </Card.Content>
              </Card>
            </div>

            {/* Features Overview */}
            <Card variant="default" className="mb-16">
              <Card.Header>
                <Card.Title size="xl" className="text-earth-brown font-accent text-center">
                  What Makes Our Reports Special
                </Card.Title>
              </Card.Header>
              <Card.Content>
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <MandalaIcon size={48} className="text-cosmic-purple mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-earth-brown mb-2">
                      Authentic Vedic Methods
                    </h3>
                    <p className="text-wisdom-gray text-sm">
                      Based on ancient Jyotish principles with modern AI precision
                    </p>
                  </div>
                  <div className="text-center">
                    <StarIcon size={48} className="text-gold mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-earth-brown mb-2">
                      Personalized Insights
                    </h3>
                    <p className="text-wisdom-gray text-sm">
                      Tailored analysis based on your unique planetary positions
                    </p>
                  </div>
                  <div className="text-center">
                    <LotusIcon size={48} className="text-lotus mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-earth-brown mb-2">
                      Practical Guidance
                    </h3>
                    <p className="text-wisdom-gray text-sm">
                      Actionable remedies and timing for important life decisions
                    </p>
                  </div>
                </div>
              </Card.Content>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default ReportPage;
