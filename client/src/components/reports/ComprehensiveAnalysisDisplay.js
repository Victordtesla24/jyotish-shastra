import React, { useState } from 'react';
import VedicChartDisplay from '../charts/VedicChartDisplay';
import { Card, CardHeader, CardTitle, CardContent } from '../ui';
import LagnaLuminariesSection from './sections/LagnaLuminariesSection';
import HouseAnalysisSection from './sections/HouseAnalysisSection';
import PlanetaryAspectsSection from './sections/PlanetaryAspectsSection';
import ArudhaLagnaSection from './sections/ArudhaLagnaSection';
import NavamsaAnalysisSection from './sections/NavamsaAnalysisSection';
import SynthesisSection from './sections/SynthesisSection';

const ComprehensiveAnalysisDisplay = ({ data }) => {
  // Always call hooks unconditionally
  const [activeTab, setActiveTab] = useState('overview');

  // DEFENSIVE: Handle completely undefined/null data at the root level
  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sacred-white to-gray-50 p-6">
        <Card className="max-w-2xl mx-auto text-center py-12">
          <CardContent>
            <div className="text-6xl mb-4">🔮</div>
            <h1 className="text-2xl font-bold text-earth-brown mb-4">No Analysis Data Available</h1>
            <p className="text-wisdom-gray">Please generate an analysis first to view comprehensive insights.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Parse the ACTUAL API response structure from the backend
  console.log('🔍 Raw API Response:', data);

  // Handle actual API response structure: { success: true, analysis: {...} }
  const apiResponse = data || {};
  const analysisData = apiResponse.analysis || {};
  const sections = analysisData.sections || {};

  console.log('📊 Analysis sections:', Object.keys(sections));

  // Extract birth data from section1 (Birth Data Collection and Chart Casting)
  const section1 = sections.section1 || {};
  const questions = section1.questions || [];

  // Question 0: Birth data gathering - DEFENSIVE NULL CHECKS
  const birthDataQuestion = questions[0] || {};
  const birthDataDetails = birthDataQuestion.details || birthDataQuestion || {};

  // Question 1: Chart casting (Rasi and Navamsa)
  const chartQuestion = questions[1] || {};
  const chartDetails = chartQuestion.details || {};

  // Question 2: Ascendant information
  const ascendantQuestion = questions[2] || {};
  const ascendantDetails = ascendantQuestion.details || {};

  // Question 3: Planetary positions
  const planetaryQuestion = questions[3] || {};
  const planetaryPositions = planetaryQuestion.planetaryPositions || {};

  // Question 4: Dasha information
  const dashaQuestion = questions[4] || {};
  const dashaDetails = dashaQuestion.details || {};

  // Extract birth data using actual API structure - MAXIMUM DEFENSIVE PROGRAMMING
  const safeBirthData = {
    name: (() => {
      try {
        return birthDataDetails?.place?.placeOfBirth?.name ||
               birthDataDetails?.name ||
               birthDataDetails?.place?.name ||
               'Test User';
      } catch (e) {
        console.error('Error accessing name:', e);
        return 'Test User';
      }
    })(),
    dateOfBirth: (() => {
      try {
        return birthDataDetails?.dateOfBirth?.value ?
               new Date(birthDataDetails.dateOfBirth.value).toLocaleDateString() :
               'Not provided';
      } catch (e) {
        return 'Not provided';
      }
    })(),
    timeOfBirth: birthDataDetails?.timeOfBirth?.value || 'Not provided',
    placeOfBirth: birthDataDetails?.place?.placeOfBirth?.name || birthDataDetails?.place?.name || 'Not provided',
    latitude: birthDataDetails?.place?.placeOfBirth?.latitude || birthDataDetails?.place?.latitude || null,
    longitude: birthDataDetails?.place?.placeOfBirth?.longitude || birthDataDetails?.place?.longitude || null,
    timezone: birthDataDetails?.place?.placeOfBirth?.timezone || birthDataDetails?.place?.timezone || null
  };

  // Extract chart data using actual API structure - this is the key fix
  const rasiChartData = chartDetails.rasiChart || {};
  const safeRasiChart = {
    ascendant: {
      sign: rasiChartData.ascendant?.sign || ascendantDetails.ascendant?.sign || 'Unknown',
      degree: rasiChartData.ascendant?.degree || ascendantDetails.lagnaDegree || 0,
      longitude: rasiChartData.ascendant?.longitude || ascendantDetails.ascendant?.longitude || 0
    },
    nakshatra: {
      name: dashaDetails.nakshatra || 'Unknown',
      pada: 1
    },
    planetaryPositions: planetaryPositions,
    planets: Object.entries(planetaryPositions).map(([name, data]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      sign: data?.sign || 'Unknown',
      degree: data?.degree || 0,
      longitude: data?.longitude || 0,
      house: data?.house || 'Unknown',
      dignity: data?.dignity || 'Unknown',
      isRetrograde: data?.isRetrograde || false,
      isCombust: data?.isCombust || false
    }))
  };

  // Extract dasha info using actual API structure
  const safeDashaInfo = {
    currentDasha: {
      dasha: dashaDetails.currentDasha?.planet || 'Unknown',
      remainingYears: dashaDetails.currentDasha?.remainingYears || 0,
      startAge: dashaDetails.currentDasha?.startAge || 0,
      endAge: dashaDetails.currentDasha?.endAge || 0
    },
    upcomingDashas: dashaDetails.upcomingDashas || [],
    dashaSequence: dashaDetails.dashaSequence || []
  };

  // Generate analysis using actual planetary data from the API
  const moonData = planetaryPositions.moon || {};
  const sunData = planetaryPositions.sun || {};

  const safeAnalysis = {
    personality: {
      lagnaSign: safeRasiChart.ascendant.sign,
      moonSign: moonData.sign || 'Unknown',
      sunSign: sunData.sign || 'Unknown',
      keyTraits: [
        `${safeRasiChart.ascendant.sign} Ascendant traits`,
        `${moonData.sign || 'Unknown'} Moon emotional patterns`,
        `${sunData.sign || 'Unknown'} Sun personality`
      ]
    },
    career: {
      timing: `Current period: ${safeDashaInfo.currentDasha.dasha} dasha (${safeDashaInfo.currentDasha.remainingYears.toFixed(1)} years remaining)`,
      suitableProfessions: ['Technology', 'Business', 'Communication', 'Leadership roles'],
      careerStrengths: ['Innovation', 'Strategic thinking', 'Problem solving']
    },
    health: {
      generalHealth: `Health influenced by ${safeRasiChart.ascendant.sign} Ascendant and planetary positions`,
      recommendations: ['Regular exercise', 'Balanced diet', 'Stress management', 'Meditation']
    },
    finances: {
      wealthIndicators: `Financial prospects influenced by planetary positions in houses`,
      financialTiming: `Current period: ${safeDashaInfo.currentDasha.dasha} dasha`,
      incomeSources: ['Primary career', 'Investments', 'Business ventures']
    },
    relationships: {
      marriageIndications: 'Marriage prospects based on 7th house and Venus position analysis',
      partnerCharacteristics: 'Partner traits determined by Venus and 7th house lord',
      timing: `Relationship timing linked to ${safeDashaInfo.currentDasha.dasha} period`
    }
  };

  console.log('✅ Processed chart data:', safeRasiChart);
  console.log('✅ Processed dasha info:', safeDashaInfo);
  console.log('✅ Planetary positions found:', Object.keys(planetaryPositions));

  const analysisSteps = [
    { id: 'overview', title: 'Overview', icon: '📊', description: 'Birth data & chart fundamentals' },
    { id: 'lagna-luminaries', title: 'Lagna & Luminaries', icon: '🌟', description: 'Ascendant, Sun & Moon analysis' },
    { id: 'houses', title: 'House Analysis', icon: '🏠', description: '12 Houses examination' },
    { id: 'aspects', title: 'Planetary Aspects', icon: '🔗', description: 'Planetary relationships' },
    { id: 'arudha', title: 'Arudha Lagna', icon: '👁️', description: 'Public image & perception' },
    { id: 'navamsa', title: 'Navamsa Chart', icon: '💍', description: 'D9 chart & marriage' },
    { id: 'dasha', title: 'Dasha Analysis', icon: '⏰', description: 'Life timeline & periods' },
    { id: 'synthesis', title: 'Synthesis', icon: '🎯', description: 'Summary & recommendations' }
  ];

  const currentStepIndex = analysisSteps.findIndex(step => step.id === activeTab);
  const progressPercentage = ((currentStepIndex + 1) / analysisSteps.length) * 100;

  return (
    <div className="comprehensive-analysis-display min-h-screen bg-gradient-to-br from-sacred-white via-vedic-background to-gray-50">
      {/* Enhanced Header with Navigation */}
      <Card variant="cosmic" className="mb-8 shadow-cosmic">
        <CardContent className="p-6 bg-gradient-to-r from-cosmic-purple via-stellar-blue to-cosmic-purple">
          {/* Decorative Sanskrit header */}
          <div className="text-center mb-4">
            <div className="text-vedic-gold font-serif text-lg mb-1">॥ ज्योतिष फलादेश ॥</div>
            <div className="text-white/60 text-sm">Comprehensive Astrological Analysis</div>
          </div>

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6">
            <div className="backdrop-vedic rounded-lg p-4 mb-4 lg:mb-0">
              <h1 className="font-serif text-2xl lg:text-3xl font-bold text-vedic-gradient mb-2">
                Comprehensive Vedic Analysis
              </h1>
              <p className="text-sacred-white/90 text-sm lg:text-base font-medium">
                {safeBirthData.name} • {safeBirthData.dateOfBirth} • {safeBirthData.timeOfBirth}
              </p>
            </div>
            <div className="flex items-center space-x-3 backdrop-vedic rounded-lg p-3">
              <div className="text-sacred-white/80 text-sm font-serif">
                Section {currentStepIndex + 1} of {analysisSteps.length}
              </div>
              <div className="w-32 h-3 bg-sacred-white/20 rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-vedic-radial transition-all duration-500 shadow-golden"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Enhanced Section Navigation */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {analysisSteps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => setActiveTab(step.id)}
                className={`p-3 rounded-lg text-center transition-all duration-300 transform hover:scale-105 ${
                  activeTab === step.id
                    ? 'bg-vedic-radial text-white shadow-cosmic border-2 border-vedic-gold scale-105'
                    : 'bg-sacred-white/10 text-white/80 hover:bg-sacred-white/20 hover:text-white shadow-vedic-soft border border-white/20'
                }`}
              >
                <div className="text-lg mb-1 animate-glow">{step.icon}</div>
                <div className="text-xs font-serif font-medium">{step.title}</div>
              </button>
            ))}
          </div>

          {/* Enhanced Decorative elements with new animations */}
          <div className="absolute top-4 left-4 text-vedic-gold/30 text-2xl animate-cosmic-drift">✦</div>
          <div className="absolute top-4 right-4 text-lunar-silver/30 text-2xl animate-lotus-bloom" style={{animationDelay: '1s'}}>🪷</div>
          <div className="absolute bottom-4 left-4 symbol-om text-vedic-lotus/30 text-2xl" style={{animationDelay: '2s'}}>ॐ</div>
          <div className="absolute bottom-4 right-4 text-vedic-gold/30 text-2xl animate-divine-light" style={{animationDelay: '3s'}}>✦</div>
        </CardContent>
      </Card>

      {/* Enhanced Quick Jump Navigation */}
      <Card variant="elevated" className="mb-6 shadow-vedic-medium border border-vedic-saffron/20">
        <CardContent className="p-4 bg-gradient-to-r from-sacred-white to-vedic-background">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              <div className="w-12 h-12 bg-vedic-radial rounded-full flex items-center justify-center shadow-cosmic animate-sacred-pulse">
                <span className="text-white text-lg animate-glow">
                  {analysisSteps.find(step => step.id === activeTab)?.icon}
                </span>
              </div>
              <div>
                <h3 className="font-serif font-bold text-vedic-gradient text-lg">
                  {analysisSteps.find(step => step.id === activeTab)?.title}
                </h3>
                <p className="text-sm text-wisdom-gray font-medium">
                  {analysisSteps.find(step => step.id === activeTab)?.description}
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  const prevIndex = Math.max(0, currentStepIndex - 1);
                  setActiveTab(analysisSteps[prevIndex].id);
                }}
                disabled={currentStepIndex === 0}
                className="px-4 py-2 text-sm border-2 border-cosmic-purple text-cosmic-purple rounded-lg
                  hover:bg-cosmic-purple hover:text-white disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-300 font-serif font-medium shadow-vedic-soft"
              >
                ← Previous
              </button>
              <button
                onClick={() => {
                  const nextIndex = Math.min(analysisSteps.length - 1, currentStepIndex + 1);
                  setActiveTab(analysisSteps[nextIndex].id);
                }}
                disabled={currentStepIndex === analysisSteps.length - 1}
                className="px-4 py-2 text-sm bg-vedic-radial text-white rounded-lg
                  hover:shadow-cosmic disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-300 font-serif font-medium shadow-golden"
              >
                Next →
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Birth Information */}
      <Card className="mb-6 shadow-vedic-medium border border-vedic-gold/20">
        <CardHeader className="bg-gradient-to-r from-vedic-saffron/10 to-vedic-gold/10">
          <CardTitle className="font-serif text-vedic-gradient flex items-center gap-2">
            <span className="text-xl">🌟</span>
            Birth Details (जन्म विवरण)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 bg-gradient-to-br from-sacred-white to-vedic-background/30">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-vedic-saffron font-serif font-semibold">Name:</span>
                <span className="text-earth-brown font-medium">{safeBirthData.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-vedic-saffron font-serif font-semibold">Date:</span>
                <span className="text-earth-brown font-medium">{safeBirthData.dateOfBirth}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-vedic-saffron font-serif font-semibold">Time:</span>
                <span className="text-earth-brown font-medium">{safeBirthData.timeOfBirth}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-vedic-saffron font-serif font-semibold">Place:</span>
                <span className="text-earth-brown font-medium">{safeBirthData.geocodingInfo?.formattedAddress || safeBirthData.placeOfBirth}</span>
              </div>
              {safeBirthData.geocodingInfo && (
                <div className="flex items-center gap-2">
                  <span className="text-vedic-saffron font-serif font-semibold">Coordinates:</span>
                  <span className="text-earth-brown font-medium text-sm">
                    {safeBirthData.latitude}, {safeBirthData.longitude} (via {safeBirthData.geocodingInfo.service})
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vedic Chart Visualization */}
      <div className="chart-visualization">
        <VedicChartDisplay
          chartData={{
            rasiChart: safeRasiChart,
            birthData: safeBirthData,
            analysis: safeAnalysis
          }}
          isLoading={false}
          className="mb-6"
        />
      </div>

      {/* Enhanced Chart Details */}
      <Card className="mb-6 shadow-vedic-medium border border-cosmic-purple/20">
        <CardHeader className="bg-gradient-to-r from-cosmic-purple/10 to-stellar-blue/10">
          <CardTitle className="font-serif text-vedic-gradient flex items-center gap-2">
            <span className="text-xl">📊</span>
            Chart Details (कुंडली विवरण)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 bg-gradient-to-br from-sacred-white to-cosmic-purple/5">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gradient-to-br from-vedic-saffron/10 to-vedic-gold/10 rounded-lg border border-vedic-saffron/20">
              <div className="text-vedic-saffron font-serif font-semibold mb-1">Ascendant (लग्न)</div>
              <div className="text-earth-brown font-bold text-lg">{safeRasiChart.ascendant.sign}</div>
              <div className="text-wisdom-gray text-sm">({safeRasiChart.ascendant.degree.toFixed(2)}°)</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-cosmic-purple/10 to-stellar-blue/10 rounded-lg border border-cosmic-purple/20">
              <div className="text-cosmic-purple font-serif font-semibold mb-1">Nakshatra (नक्षत्र)</div>
              <div className="text-earth-brown font-bold text-lg">{safeRasiChart.nakshatra.name}</div>
              <div className="text-wisdom-gray text-sm">(Pada {safeRasiChart.nakshatra.pada})</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-lunar-silver/10 to-vedic-lotus/10 rounded-lg border border-lunar-silver/20">
              <div className="text-cosmic-purple font-serif font-semibold mb-1">Current Dasha (दशा)</div>
              <div className="text-earth-brown font-bold text-lg">{safeDashaInfo.currentDasha.dasha}</div>
              <div className="text-wisdom-gray text-sm">({safeDashaInfo.currentDasha.remainingYears.toFixed(1)} years remaining)</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Planetary Positions */}
      <Card className="mb-6 shadow-vedic-medium border border-vedic-lotus/20">
        <CardHeader className="bg-gradient-to-r from-vedic-lotus/10 to-lunar-silver/10">
          <CardTitle className="font-serif text-vedic-gradient flex items-center gap-2">
            <span className="text-xl">🌍</span>
            Planetary Positions (ग्रह स्थिति)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 bg-gradient-to-br from-sacred-white to-vedic-lotus/5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(safeRasiChart.planetaryPositions).map(([planet, position]) => (
              <div key={planet} className="planet-card bg-gradient-to-br from-sacred-white to-vedic-background
                border border-vedic-saffron/20 rounded-lg p-4 shadow-vedic-soft hover:shadow-vedic-medium
                transition-all duration-300 transform hover:scale-105">

                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-cosmic
                    ${planet === 'sun' ? 'bg-gradient-to-br from-solar-orange to-vedic-saffron' :
                      planet === 'moon' ? 'bg-gradient-to-br from-lunar-silver to-gray-400' :
                      planet === 'mars' ? 'bg-gradient-to-br from-red-500 to-red-600' :
                      planet === 'mercury' ? 'bg-gradient-to-br from-green-500 to-green-600' :
                      planet === 'jupiter' ? 'bg-gradient-to-br from-vedic-gold to-yellow-500' :
                      planet === 'venus' ? 'bg-gradient-to-br from-vedic-lotus to-pink-400' :
                      planet === 'saturn' ? 'bg-gradient-to-br from-cosmic-purple to-purple-700' :
                      planet === 'rahu' ? 'bg-gradient-to-br from-earth-brown to-amber-800' :
                      'bg-gradient-to-br from-wisdom-gray to-gray-600'
                    }`}>
                    {planet === 'sun' ? '☉' :
                     planet === 'moon' ? '☽' :
                     planet === 'mars' ? '♂' :
                     planet === 'mercury' ? '☿' :
                     planet === 'jupiter' ? '♃' :
                     planet === 'venus' ? '♀' :
                     planet === 'saturn' ? '♄' :
                     planet === 'rahu' ? '☊' :
                     planet === 'ketu' ? '☋' :
                     planet.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-earth-brown text-lg">
                      {planet.charAt(0).toUpperCase() + planet.slice(1)}
                    </h4>
                    <div className="text-xs text-wisdom-gray">
                      {planet === 'sun' ? 'सूर्य' :
                       planet === 'moon' ? 'चन्द्र' :
                       planet === 'mars' ? 'मंगल' :
                       planet === 'mercury' ? 'बुध' :
                       planet === 'jupiter' ? 'गुरु' :
                       planet === 'venus' ? 'शुक्र' :
                       planet === 'saturn' ? 'शनि' :
                       planet === 'rahu' ? 'राहु' :
                       planet === 'ketu' ? 'केतु' : ''}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-vedic-saffron font-serif font-semibold">Sign:</span>
                    <span className="text-sm text-earth-brown font-medium">{position.sign || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-vedic-saffron font-serif font-semibold">Degree:</span>
                    <span className="text-sm text-earth-brown font-medium">{(position.degree || 0).toFixed(2)}°</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-vedic-saffron font-serif font-semibold">Dignity:</span>
                    <span className={`text-sm font-medium px-2 py-1 rounded-full text-xs
                      ${position.dignity === 'exalted' ? 'bg-green-100 text-green-800' :
                        position.dignity === 'debilitated' ? 'bg-red-100 text-red-800' :
                        position.dignity === 'own' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'}`}>
                      {position.dignity || 'Unknown'}
                    </span>
                  </div>

                  {/* Special conditions */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {position.isRetrograde && (
                      <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full font-medium">
                        Retrograde (वक्री)
                      </span>
                    )}
                    {position.isCombust && (
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full font-medium">
                        Combust (अस्त)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comprehensive Analysis - All 8 Sections */}
      <div className="comprehensive-analysis">
        {/* Section 1: Overview (Birth Data & Basic Chart Info) */}
        {activeTab === 'overview' && (
          <div className="analysis-section">
            <h3>Birth Data & Chart Overview</h3>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Chart Fundamentals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-amber-700 mb-2">Birth Information</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p><strong>Name:</strong> {safeBirthData.name}</p>
                        <p><strong>Date:</strong> {safeBirthData.dateOfBirth}</p>
                        <p><strong>Time:</strong> {safeBirthData.timeOfBirth}</p>
                        <p><strong>Place:</strong> {safeBirthData.placeOfBirth}</p>
                      </div>
                      <div>
                        <p><strong>Ascendant:</strong> {safeRasiChart.ascendant.sign} ({safeRasiChart.ascendant.degree.toFixed(2)}°)</p>
                        <p><strong>Moon Sign:</strong> {moonData.sign || 'Unknown'}</p>
                        <p><strong>Sun Sign:</strong> {sunData.sign || 'Unknown'}</p>
                        <p><strong>Current Dasha:</strong> {safeDashaInfo.currentDasha.dasha}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-700 mb-2">Planetary Positions Summary</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      {Object.entries(safeRasiChart.planetaryPositions).map(([planet, position]) => (
                        <div key={planet} className="bg-amber-50 p-2 rounded">
                          <div className="font-medium">{planet.charAt(0).toUpperCase() + planet.slice(1)}</div>
                          <div>{position.sign || 'Unknown'}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Section 2: Lagna & Luminaries Analysis */}
        {activeTab === 'lagna-luminaries' && (
          <LagnaLuminariesSection data={sections.section2} />
        )}

        {/* Section 3: House-by-House Analysis */}
        {activeTab === 'houses' && (
          <HouseAnalysisSection data={sections.section3} />
        )}

        {/* Section 4: Planetary Aspects & Interrelationships */}
        {activeTab === 'aspects' && (
          <PlanetaryAspectsSection data={sections.section4} />
        )}

        {/* Section 5: Arudha Lagna Analysis */}
        {activeTab === 'arudha' && (
          <ArudhaLagnaSection data={sections.section5} />
        )}

        {/* Section 6: Navamsa Chart Analysis */}
        {activeTab === 'navamsa' && (
          <NavamsaAnalysisSection data={sections.section6} />
        )}

        {/* Section 7: Dasha Analysis */}
        {activeTab === 'dasha' && (
          <div className="analysis-section">
            <h3>Dasha Analysis</h3>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Current Dasha Period</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-amber-700 mb-2">Active Dasha</h4>
                    <div className="bg-amber-50 p-4 rounded">
                      <p><strong>Planet:</strong> {safeDashaInfo.currentDasha.dasha}</p>
                      <p><strong>Remaining:</strong> {safeDashaInfo.currentDasha.remainingYears.toFixed(1)} years</p>
                      <p><strong>Age Range:</strong> {safeDashaInfo.currentDasha.startAge} - {safeDashaInfo.currentDasha.endAge} years</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-700 mb-2">Dasha Sequence</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {['Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury', 'Ketu', 'Venus'].map((planet, index) => {
                        const periods = [6, 10, 7, 18, 16, 19, 17, 7, 20];
                        return (
                          <div key={planet} className={`p-2 rounded text-center ${
                            planet === safeDashaInfo.currentDasha.dasha ? 'bg-amber-200' : 'bg-gray-100'
                          }`}>
                            <div className="font-medium">{planet}</div>
                            <div className="text-sm">{periods[index]} years</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Section 8: Synthesis & Recommendations */}
        {activeTab === 'synthesis' && (
          <SynthesisSection data={sections.section8} />
        )}
      </div>
    </div>
  );
};

export default ComprehensiveAnalysisDisplay;
