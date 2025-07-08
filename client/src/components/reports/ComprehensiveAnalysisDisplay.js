import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import VedicChartDisplay from '../charts/VedicChartDisplay';
import { Card, CardHeader, CardTitle, CardContent } from '../ui';
import LagnaLuminariesSection from './sections/LagnaLuminariesSection';
import HouseAnalysisSection from './sections/HouseAnalysisSection';
import PlanetaryAspectsSection from './sections/PlanetaryAspectsSection';
import ArudhaLagnaSection from './sections/ArudhaLagnaSection';
import NavamsaAnalysisSection from './sections/NavamsaAnalysisSection';
import DashaAnalysisSection from './sections/DashaAnalysisSection';
import SynthesisSection from './sections/SynthesisSection';
import ChartDataManager from '../../utils/chartDataManager';

const ComprehensiveAnalysisDisplay = ({ data }) => {
  // Always call hooks unconditionally
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [isTestingMode] = useState(false); // Controls whether to show all sections at once

  useEffect(() => {
    if (data) {
      setIsLoading(false);
    }
  }, [data]);

  // Enhanced loading state with Vedic design
  if (isLoading && data) {
    return (
      <div className="min-h-screen bg-vedic-pattern flex items-center justify-center">
        <motion.div
          className="card-cosmic text-center py-16 px-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="loading-mandala mx-auto mb-6"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          <motion.h3
            className="font-accent text-2xl text-sacred-white mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            ॐ Consulting the Sacred Texts ॐ
          </motion.h3>
          <motion.p
            className="text-sacred-white/80 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            Unveiling the cosmic wisdom encoded in your birth chart...
          </motion.p>
          <motion.div
            className="mt-6 flex justify-center space-x-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="w-3 h-3 bg-vedic-gold rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // DEFENSIVE: Handle completely undefined/null data at the root level
  if (!data) {
    return (
      <div className="min-h-screen bg-vedic-pattern flex items-center justify-center p-6">
        <motion.div
          className="card-cosmic text-center py-16 px-8 max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="text-6xl mb-6"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🔮
          </motion.div>
          <h1 className="font-accent text-3xl text-sacred-white mb-4">
            No Analysis Data Available
          </h1>
          <p className="text-sacred-white/80 text-lg mb-8">
            Please generate a birth chart analysis first to view comprehensive insights.
          </p>
          <motion.button
            className="btn-vedic"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/chart'}
          >
            Generate Analysis
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // Parse the ACTUAL API response structure from the backend
  console.log('🔍 Raw API Response:', data);

  // Handle actual API response structure: { success: true, analysis: { sections: { section1: {...}, section2: {...}, etc. } } }
  const apiResponse = data || {};
  const analysisData = apiResponse.analysis || {};

  // CRITICAL FIX: Check for nested sections structure from the actual API
  const sectionsData = analysisData.sections || analysisData; // Fallback to direct structure for backward compatibility

  console.log('📊 Analysis data keys:', Object.keys(analysisData));
  console.log('📊 Sections data keys:', Object.keys(sectionsData));

  // Extract data from each section based on actual API structure (sections can be nested or direct)
  const section1 = sectionsData.section1 || {}; // Birth Data Collection and Chart Casting
  const section2 = sectionsData.section2 || {}; // Preliminary Chart Analysis: Lagna, Luminaries, and Overall Patterns
  const section3 = sectionsData.section3 || {}; // House-by-House Examination (1st-12th Bhavas)
  const section4 = sectionsData.section4 || {}; // Planetary Aspects and Interrelationships
  const section5 = sectionsData.section5 || {}; // Arudha Lagna Analysis (Perception & Public Image)
  const section6 = sectionsData.section6 || {}; // Navamsa Chart Analysis (D9) - Soul and Marriage
  const section7 = sectionsData.section7 || {}; // Dasha Analysis: Timeline of Life Events
  const section8 = sectionsData.section8 || {}; // Synthesis

  console.log('📊 Section 1 keys:', Object.keys(section1));
  console.log('📊 Section 2 keys:', Object.keys(section2));

  // Get stored birth data from ChartDataManager as primary source
  const storedDisplayData = ChartDataManager.getDisplayBirthData() || {};
  const storedBirthData = ChartDataManager.getBirthData() || {};

  // SIMPLIFIED: Use stored data as primary source, API as fallback
  const safeBirthData = {
    name: storedDisplayData.name || section1.name || 'User',
    dateOfBirth: storedDisplayData.date || section1.dateOfBirth || 'Not provided',
    timeOfBirth: storedDisplayData.time || section1.timeOfBirth || 'Not provided',
    placeOfBirth: storedDisplayData.place || section1.placeOfBirth || 'Not provided',
    latitude: storedBirthData.latitude || section1.latitude || null,
    longitude: storedBirthData.longitude || section1.longitude || null,
    timezone: storedBirthData.timezone || section1.timezone || null
  };

  // CRITICAL FIX: Handle case where API response doesn't have expected structure
  // If no API data available, use stored chart data from ChartDataManager
  const storedChartData = ChartDataManager.getChartData();
  console.log('🔍 Stored chart data:', storedChartData);

  // FIXED: Extract chart data using actual API structure with fallback to stored data
  const rasiChartData = section1.rasiChart || {};

  // Fallback to stored chart data if API data is not available
  const storedChart = storedChartData?.chart || {};
  const storedPlanets = storedChart?.planets || {};

  const safeRasiChart = {
    ascendant: {
      sign: rasiChartData.ascendant?.sign || section1.ascendant?.sign || storedChart?.ascendant?.sign || 'Unknown',
      degree: rasiChartData.ascendant?.degree || section1.ascendant?.degree || storedChart?.ascendant?.degree || 0,
      longitude: rasiChartData.ascendant?.longitude || section1.ascendant?.longitude || storedChart?.ascendant?.longitude || 0
    },
    nakshatra: {
      name: section1.nakshatra || storedChart?.nakshatra?.name || 'Unknown',
      pada: storedChart?.nakshatra?.pada || 1
    },
    planetaryPositions: section1.planetaryPositions || storedPlanets || {},
    planets: Object.entries(section1.planetaryPositions || storedPlanets || {}).map(([name, data]) => ({
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

  // FIXED: Extract dasha info using actual API structure with fallback to stored data
  const storedDasha = storedChartData?.dasha || {};
  const safeDashaInfo = {
    currentDasha: {
      dasha: section7.dashaAnalysis?.current_dasha?.planet || section1.currentDasha?.planet || storedDasha?.currentDasha?.planet || 'Unknown',
      startAge: section7.dashaAnalysis?.current_dasha?.startAge || section1.currentDasha?.startAge || storedDasha?.currentDasha?.startAge || 0,
      endAge: section7.dashaAnalysis?.current_dasha?.endAge || section1.currentDasha?.endAge || storedDasha?.currentDasha?.endAge || 0,
      remainingYears: section7.dashaAnalysis?.current_dasha?.remainingYears || section1.currentDasha?.remainingYears || storedDasha?.currentDasha?.remainingYears || 0
    },
    dashaSequence: section7.dashaAnalysis?.dasha_sequence || section1.dashaSequence || storedDasha?.dashaSequence || [],
    ageInYears: section1.ageInYears || storedDasha?.ageInYears || 0
  };

  // Data extraction for specific UI elements that need direct access
  const section2Analyses = section2.analyses || {};
  const luminariesAnalysis = section2Analyses.luminaries || section2.luminariesAnalysis || {};

  // Create chart data structure for VedicChartDisplay
  const section3Houses = section3.houses || section3.houseAnalysis || {};
  const chartDataForDisplay = {
    chart: {
      ascendant: safeRasiChart.ascendant,
      planets: safeRasiChart.planets,
      houses: Object.keys(section3Houses).map(houseKey => {
        const house = section3Houses[houseKey];
        return {
          number: house.house,
          sign: house.sign,
          lord: house.lord?.planet,
          occupants: house.occupants?.map(occ => occ.planet) || []
        };
      })
    },
    birthData: safeBirthData
  };

  // Get planet data from section 2 luminaries analysis
  const sunData = luminariesAnalysis.sunAnalysis?.position || {};
  const moonData = luminariesAnalysis.moonAnalysis?.position || {};

  // Tab configuration - ALL 8 SECTIONS MUST BE VISIBLE
  const tabs = [
    { id: 'overview', label: 'Overview', icon: '🌟' },
    { id: 'lagna-luminaries', label: 'Lagna & Luminaries', icon: '☀️' },
    { id: 'houses', label: 'Houses', icon: '🏠' },
    { id: 'aspects', label: 'Aspects', icon: '🔗' },
    { id: 'yogas', label: 'Yoga Analysis', icon: '🧘' },
    { id: 'arudha', label: 'Arudha Lagna', icon: '👁️' },
    { id: 'navamsa', label: 'Navamsa', icon: '💍' },
    { id: 'dasha', label: 'Dasha', icon: '⏰' },
    { id: 'synthesis', label: 'Synthesis', icon: '🎯' }
  ];

  const currentStepIndex = tabs.findIndex(tab => tab.id === activeTab);
  const progressPercentage = ((currentStepIndex + 1) / tabs.length) * 100;

  console.log('📊 Analysis Display - Active tab:', activeTab);
  console.log('🔍 Section data availability:', {
    section1: !!section1 && Object.keys(section1).length,
    section2: !!section2 && Object.keys(section2).length,
    section3: !!section3 && Object.keys(section3).length,
    section4: !!section4 && Object.keys(section4).length,
    section5: !!section5 && Object.keys(section5).length,
    section6: !!section6 && Object.keys(section6).length,
    section7: !!section7 && Object.keys(section7).length,
    section8: !!section8 && Object.keys(section8).length,
  });

  return (
    <motion.div
      className="comprehensive-analysis-display min-h-screen bg-gray-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Enhanced Header with Navigation */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <Card className="mb-8 shadow-lg bg-blue-600">
          <CardContent className="p-6 bg-gradient-to-br from-blue-600 to-purple-700">
            {/* Decorative Sanskrit header */}
            <div className="text-center mb-4">
              <motion.div
                className="text-yellow-300 font-semibold text-2xl mb-2"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                ॐ ज्योतिष फलादेश ॐ
              </motion.div>
              <div className="text-gray-200 text-sm font-medium">
                Comprehensive Vedic Astrological Analysis
              </div>
            </div>

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6">
            <div className="bg-white bg-opacity-20 rounded-lg p-4 mb-4 lg:mb-0">
              <h1 className="font-serif text-2xl lg:text-3xl font-bold text-white mb-2">
                Comprehensive Vedic Analysis
              </h1>
              <p className="text-gray-100 text-sm lg:text-base font-medium">
                {safeBirthData.name} • {safeBirthData.dateOfBirth} • {safeBirthData.timeOfBirth}
              </p>
            </div>
            <div className="flex items-center space-x-3 bg-white bg-opacity-20 rounded-lg p-3">
              <div className="text-gray-200 text-sm font-serif">
                Section {currentStepIndex + 1} of {tabs.length}
              </div>
              <div className="w-32 h-3 bg-white bg-opacity-20 rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-yellow-400 transition-all duration-500 shadow-lg"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Enhanced Section Navigation */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-2">
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`p-3 rounded-lg text-center transition-all duration-300 transform hover:scale-105 ${activeTab === tab.id
                    ? 'bg-yellow-500 text-white shadow-lg border-2 border-yellow-300 scale-105'
                    : 'bg-white bg-opacity-10 text-white hover:bg-white hover:bg-opacity-20 hover:text-white shadow-md border border-white border-opacity-20'
                  }`}
              >
                <div className="text-lg mb-1">{tab.icon}</div>
                <div className="text-xs font-serif font-medium">{tab.label}</div>
              </button>
            ))}
          </div>

          {/* Enhanced Decorative elements */}
          <div className="absolute top-4 left-4 text-yellow-300 opacity-30 text-2xl">✦</div>
          <div className="absolute top-4 right-4 text-gray-300 opacity-30 text-2xl">🪷</div>
          <div className="absolute bottom-4 left-4 text-pink-300 opacity-30 text-2xl">ॐ</div>
          <div className="absolute bottom-4 right-4 text-yellow-300 opacity-30 text-2xl">✦</div>
        </CardContent>
      </Card>

      {/* Enhanced Quick Jump Navigation */}
      <Card variant="elevated" className="mb-6 shadow-vedic-medium border border-vedic-saffron/20">
        <CardContent className="p-4 bg-gradient-to-r from-sacred-white to-vedic-background">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              <div className="w-12 h-12 bg-vedic-radial rounded-full flex items-center justify-center shadow-cosmic animate-sacred-pulse">
                <span className="text-white text-lg animate-glow">
                  {tabs.find(tab => tab.id === activeTab)?.icon}
                </span>
              </div>
              <div>
                <h3 className="font-serif font-bold text-vedic-gradient text-lg">
                  {tabs.find(tab => tab.id === activeTab)?.label}
                </h3>
                <p className="text-sm text-wisdom-gray font-medium">
                  {tabs.find(tab => tab.id === activeTab)?.label}
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  const prevIndex = Math.max(0, currentStepIndex - 1);
                  setActiveTab(tabs[prevIndex].id);
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
                  const nextIndex = Math.min(tabs.length - 1, currentStepIndex + 1);
                  setActiveTab(tabs[nextIndex].id);
                }}
                disabled={currentStepIndex === tabs.length - 1}
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
                <span className="text-earth-brown font-medium">{safeBirthData.placeOfBirth}</span>
              </div>
              {safeBirthData.latitude && safeBirthData.longitude && (
                <div className="flex items-center gap-2">
                  <span className="text-vedic-saffron font-serif font-semibold">Coordinates:</span>
                  <span className="text-earth-brown font-medium text-sm">
                    {safeBirthData.latitude}, {safeBirthData.longitude}
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
          chartData={chartDataForDisplay}
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
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      position.dignity === 'exalted' ? 'bg-green-100 text-green-800' :
                        position.dignity === 'debilitated' ? 'bg-red-100 text-red-800' :
                          position.dignity === 'own' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                    }`}>
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
        {(activeTab === 'overview' || isTestingMode) && (
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
        {(activeTab === 'lagna-luminaries' || isTestingMode) && (
          <LagnaLuminariesSection
            data={section2}
          />
        )}

        {/* Section 3: House-by-House Analysis */}
        {(activeTab === 'houses' || isTestingMode) && (
          <HouseAnalysisSection
            data={section3}
          />
        )}

        {/* Section 4: Planetary Aspects & Interrelationships */}
        {(activeTab === 'aspects' || isTestingMode) && (
          <PlanetaryAspectsSection
            data={section4}
          />
        )}

        {/* YOGA ANALYSIS SECTION - CRITICAL FIX FOR MISSING YOGA DISPLAY */}
        {(activeTab === 'yogas' || isTestingMode) && (
          <div className="analysis-section">
            <Card className="mb-6 shadow-vedic-medium border border-cosmic-purple/20">
              <CardHeader className="bg-gradient-to-r from-cosmic-purple/10 to-stellar-blue/10">
                <CardTitle className="font-serif text-vedic-gradient flex items-center gap-2">
                  <span className="text-xl">🧘</span>
                  Yoga Analysis (योग विश्लेषण)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 bg-gradient-to-br from-sacred-white to-cosmic-purple/5">
                {(() => {
                  // Extract yoga data from multiple possible sections
                  const yogaData =
                    sectionsData.yogaAnalysis ||
                    section2.yogaAnalysis ||
                    section4.yogaAnalysis ||
                    analysisData.yogaAnalysis ||
                    {};

                  console.log('🧘 Yoga Analysis Data:', yogaData);

                  // Extract different types of yogas
                  const rajaYogas = yogaData.rajaYogas || yogaData.raja_yogas || [];
                  const dhanaYogas = yogaData.dhanaYogas || yogaData.dhana_yogas || [];
                  const panchMahapurushaYogas = yogaData.panchMahapurushaYogas || yogaData.panch_mahapurusha_yogas || [];
                  const otherYogas = yogaData.otherYogas || yogaData.other_yogas || [];
                  const negativeYogas = yogaData.negativeYogas || yogaData.negative_yogas || [];

                  const allYogas = [...rajaYogas, ...dhanaYogas, ...panchMahapurushaYogas, ...otherYogas];

                  if (allYogas.length === 0) {
                    return (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-4">🔍</div>
                        <h3 className="font-serif text-lg text-earth-brown mb-2">Yoga Analysis In Progress</h3>
                        <p className="text-wisdom-gray">
                          Detailed yoga calculations are being processed. This section will display
                          Raja Yogas, Dhana Yogas, Panch Mahapurusha Yogas, and other significant
                          planetary combinations in your chart.
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-6">
                      {/* Positive Yogas */}
                      {rajaYogas.length > 0 && (
                        <div className="yoga-category">
                          <h4 className="font-serif font-bold text-vedic-saffron text-lg mb-4 flex items-center gap-2">
                            <span>👑</span> Raja Yogas (Royal Combinations)
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {rajaYogas.map((yoga, index) => (
                              <div key={index} className="bg-gradient-to-br from-vedic-gold/10 to-vedic-saffron/10
                                border border-vedic-gold/30 rounded-lg p-4 shadow-vedic-soft">
                                <h5 className="font-serif font-semibold text-earth-brown mb-2">
                                  {yoga.name || `Raja Yoga ${index + 1}`}
                                </h5>
                                <p className="text-sm text-wisdom-gray mb-3">
                                  {yoga.description || yoga.analysis || 'Powerful royal combination for success and authority.'}
                                </p>
                                {yoga.strength && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-vedic-saffron font-semibold">Strength:</span>
                                    <div className="flex-1 h-2 bg-vedic-border rounded-full">
                                      <div
                                        className="h-full bg-vedic-gold rounded-full"
                                        style={{ width: `${yoga.strength}%` }}
                                      />
                                    </div>
                                    <span className="text-xs text-earth-brown font-medium">{yoga.strength}%</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Dhana Yogas */}
                      {dhanaYogas.length > 0 && (
                        <div className="yoga-category">
                          <h4 className="font-serif font-bold text-cosmic-purple text-lg mb-4 flex items-center gap-2">
                            <span>💰</span> Dhana Yogas (Wealth Combinations)
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {dhanaYogas.map((yoga, index) => (
                              <div key={index} className="bg-gradient-to-br from-cosmic-purple/10 to-stellar-blue/10
                                border border-cosmic-purple/30 rounded-lg p-4 shadow-vedic-soft">
                                <h5 className="font-serif font-semibold text-earth-brown mb-2">
                                  {yoga.name || `Dhana Yoga ${index + 1}`}
                                </h5>
                                <p className="text-sm text-wisdom-gray mb-3">
                                  {yoga.description || yoga.analysis || 'Auspicious combination for wealth and prosperity.'}
                                </p>
                                {yoga.strength && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-cosmic-purple font-semibold">Strength:</span>
                                    <div className="flex-1 h-2 bg-vedic-border rounded-full">
                                      <div
                                        className="h-full bg-cosmic-purple rounded-full"
                                        style={{ width: `${yoga.strength}%` }}
                                      />
                                    </div>
                                    <span className="text-xs text-earth-brown font-medium">{yoga.strength}%</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Panch Mahapurusha Yogas */}
                      {panchMahapurushaYogas.length > 0 && (
                        <div className="yoga-category">
                          <h4 className="font-serif font-bold text-vedic-lotus text-lg mb-4 flex items-center gap-2">
                            <span>⭐</span> Panch Mahapurusha Yogas (Five Great Personalities)
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {panchMahapurushaYogas.map((yoga, index) => (
                              <div key={index} className="bg-gradient-to-br from-vedic-lotus/10 to-lunar-silver/10
                                border border-vedic-lotus/30 rounded-lg p-4 shadow-vedic-soft">
                                <h5 className="font-serif font-semibold text-earth-brown mb-2">
                                  {yoga.name || `Mahapurusha Yoga ${index + 1}`}
                                </h5>
                                <p className="text-sm text-wisdom-gray mb-3">
                                  {yoga.description || yoga.analysis || 'Exceptional personality traits and capabilities.'}
                                </p>
                                {yoga.planet && (
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xs text-vedic-lotus font-semibold">Planet:</span>
                                    <span className="text-xs text-earth-brown font-medium">{yoga.planet}</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Other Significant Yogas */}
                      {otherYogas.length > 0 && (
                        <div className="yoga-category">
                          <h4 className="font-serif font-bold text-earth-brown text-lg mb-4 flex items-center gap-2">
                            <span>🌟</span> Other Significant Yogas
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {otherYogas.map((yoga, index) => (
                              <div key={index} className="bg-gradient-to-br from-earth-brown/10 to-wisdom-gray/10
                                border border-earth-brown/30 rounded-lg p-4 shadow-vedic-soft">
                                <h5 className="font-serif font-semibold text-earth-brown mb-2">
                                  {yoga.name || `Yoga ${index + 1}`}
                                </h5>
                                <p className="text-sm text-wisdom-gray">
                                  {yoga.description || yoga.analysis || 'Significant planetary combination with specific effects.'}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Negative Yogas (if any) */}
                      {negativeYogas.length > 0 && (
                        <div className="yoga-category">
                          <h4 className="font-serif font-bold text-red-600 text-lg mb-4 flex items-center gap-2">
                            <span>⚠️</span> Challenging Combinations & Remedies
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {negativeYogas.map((yoga, index) => (
                              <div key={index} className="bg-gradient-to-br from-red-50 to-orange-50
                                border border-red-200 rounded-lg p-4 shadow-vedic-soft">
                                <h5 className="font-serif font-semibold text-red-700 mb-2">
                                  {yoga.name || `Challenge ${index + 1}`}
                                </h5>
                                <p className="text-sm text-red-600 mb-3">
                                  {yoga.description || yoga.analysis || 'Challenging combination requiring attention.'}
                                </p>
                                {yoga.remedy && (
                                  <div className="bg-green-50 border border-green-200 rounded p-2 mt-2">
                                    <span className="text-xs text-green-700 font-semibold">Remedy: </span>
                                    <span className="text-xs text-green-600">{yoga.remedy}</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Section 5: Arudha Lagna Analysis */}
        {(activeTab === 'arudha' || isTestingMode) && (
          <ArudhaLagnaSection
            data={section5}
          />
        )}

        {/* Section 6: Navamsa Chart Analysis */}
        {(activeTab === 'navamsa' || isTestingMode) && (
          <NavamsaAnalysisSection
            data={section6}
          />
        )}

        {/* Section 7: Dasha Analysis */}
        {(activeTab === 'dasha' || isTestingMode) && (
          <DashaAnalysisSection
            data={section7}
          />
        )}

        {/* Section 8: Synthesis & Recommendations */}
        {(activeTab === 'synthesis' || isTestingMode) && (
          <SynthesisSection data={section8} />
        )}
      </div>
      </motion.div>
    </motion.div>
  );
};

export default ComprehensiveAnalysisDisplay;
