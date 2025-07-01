import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card } from '../ui/cards/Card';

/**
 * Enhanced VedicChartDisplay Component
 * Displays generated Vedic birth chart in traditional North Indian Kundli square format
 * Following authentic Vedic template design with enhanced interactivity and animations
 * TASK 5: UI Enhancement Implementation - Interactive Elements & Animations
 */
const VedicChartDisplay = ({ chartData, isLoading = false, className = '' }) => {
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [chartDetails, setChartDetails] = useState(null);
  const [hoveredHouse, setHoveredHouse] = useState(null);
  const [isChartVisible, setIsChartVisible] = useState(false);
  const [animationStage, setAnimationStage] = useState(0);

  useEffect(() => {
    if (chartData) {
      console.log('🎯 VedicChartDisplay received chart data:', chartData);

      // Parse the ACTUAL API response structure as defined in validation-guide.md
      const apiResponse = chartData || {};
      const analysisData = apiResponse.analysis || {};
      const sections = analysisData.sections || {};

      console.log('📊 VedicChart - Analysis sections:', Object.keys(sections));

      // Extract from section1 (Birth Data Collection and Chart Casting)
      const section1 = sections.section1 || {};
      const questions = section1.questions || [];

      if (questions.length > 0) {
        // Question 0: Birth data gathering
        const birthDataQuestion = questions[0] || {};
        const birthDataDetails = birthDataQuestion.details || {};

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

        // Transform to internal chart format using ACTUAL API structure
        const transformedData = {
          rasiChart: {
            ascendant: {
              sign: chartDetails.rasiChart?.ascendant?.sign || ascendantDetails.ascendant?.sign || 'Unknown',
              degree: chartDetails.rasiChart?.ascendant?.degree || ascendantDetails.lagnaDegree || 0,
              longitude: chartDetails.rasiChart?.ascendant?.longitude || ascendantDetails.ascendant?.longitude || 0
            },
            nakshatra: {
              name: dashaDetails.nakshatra || 'Unknown',
              pada: 1
            },
            planets: Object.entries(planetaryPositions).map(([name, data]) => ({
              name: name.charAt(0).toUpperCase() + name.slice(1),
              Name: name.charAt(0).toUpperCase() + name.slice(1),
              longitude: data.longitude || 0,
              sign: data.sign || 'Unknown',
              degree: data.degree || 0,
              house: data.house || 1,
              dignity: data.dignity || 'neutral',
              isRetrograde: data.isRetrograde || false,
              isCombust: data.isCombust || false
            })),
            planetaryPositions: planetaryPositions
          },
          birthData: {
            name: 'Test User', // Can be extracted from the response or default
            dateOfBirth: birthDataDetails.dateOfBirth?.value || 'Not provided',
            timeOfBirth: birthDataDetails.timeOfBirth?.value || 'Not provided',
            placeOfBirth: birthDataDetails.place?.placeOfBirth?.name || 'Not provided'
          },
          analysis: {
            personality: {
              lagnaSign: chartDetails.rasiChart?.ascendant?.sign || ascendantDetails.ascendant?.sign || 'Unknown',
              moonSign: planetaryPositions.moon?.sign || 'Unknown',
              sunSign: planetaryPositions.sun?.sign || 'Unknown',
              keyTraits: ['Dynamic personality', 'Strong willpower', 'Leadership qualities']
            }
          }
        };

        console.log('✅ VedicChart - Transformed data from API:', transformedData);
        setChartDetails(transformedData);
      } else {
        // Fallback for direct chart data or empty response
        console.log('⚠️ VedicChart - No questions found in section1, using fallback');
        setChartDetails(chartData);
      }
    }
  }, [chartData]);


  const planetSymbols = {
    'Sun': '☉',
    'Moon': '☽',
    'Mars': '♂',
    'Mercury': '☿',
    'Jupiter': '♃',
    'Venus': '♀',
    'Saturn': '♄',
    'Rahu': '☊',
    'Ketu': '☋',
    'Ascendant': 'As'
  };

  const planetColors = {
    'Sun': 'var(--solar-orange)',
    'Moon': 'var(--lunar-silver)',
    'Mars': '#FF4500',
    'Mercury': '#32CD32',
    'Jupiter': 'var(--vedic-gold)',
    'Venus': 'var(--vedic-lotus)',
    'Saturn': 'var(--cosmic-purple)',
    'Rahu': 'var(--earth-brown)',
    'Ketu': 'var(--wisdom-gray)',
    'Ascendant': 'var(--vedic-saffron)'
  };

  const houseSignificance = {
    1: 'Self, Personality, Physical Appearance',
    2: 'Wealth, Family, Speech',
    3: 'Siblings, Courage, Communication',
    4: 'Home, Mother, Education',
    5: 'Children, Intelligence, Creativity',
    6: 'Health, Enemies, Service',
    7: 'Marriage, Partnership, Business',
    8: 'Longevity, Transformation, Occult',
    9: 'Fortune, Father, Spirituality',
    10: 'Career, Fame, Status',
    11: 'Gains, Friends, Aspirations',
    12: 'Loss, Foreign, Spirituality'
  };

  // Enhanced animation effects
  useEffect(() => {
    if (chartDetails && !isChartVisible) {
      const timer = setTimeout(() => {
        setIsChartVisible(true);
        setAnimationStage(1);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [chartDetails, isChartVisible]);

  useEffect(() => {
    if (animationStage === 1) {
      const timer = setTimeout(() => setAnimationStage(2), 600);
      return () => clearTimeout(timer);
    }
  }, [animationStage]);

  // Get planets in house using proper house calculation
  const getPlanetsInHouse = useCallback((houseNumber) => {
    if (!chartDetails?.rasiChart?.planets || !chartDetails?.rasiChart?.ascendant) return [];

    const planetsInHouse = [];
    const ascendantLongitude = chartDetails.rasiChart.ascendant.longitude;

    // Add ascendant to house 1
    if (houseNumber === 1) {
      planetsInHouse.push({
        name: 'Ascendant',
        sign: chartDetails.rasiChart.ascendant.sign,
        degree: chartDetails.rasiChart.ascendant.degree
      });
    }

    // Check each planet and determine its house
    chartDetails.rasiChart.planets.forEach(planet => {
      const planetLongitude = planet.longitude;

      // Calculate house number based on longitude difference
      // Each house is 30 degrees
      let diff = planetLongitude - ascendantLongitude;

      // Normalize the difference to be between 0 and 360
      while (diff < 0) diff += 360;
      while (diff >= 360) diff -= 360;

      // Calculate which house (1-12) the planet is in
      const calculatedHouse = Math.floor(diff / 30) + 1;

      if (calculatedHouse === houseNumber) {
        planetsInHouse.push(planet);
      }
    });

    return planetsInHouse;
  }, [chartDetails]);

  // Memoized planet calculations for better performance
  const housePlanetsMap = useMemo(() => {
    const map = {};
    for (let i = 1; i <= 12; i++) {
      map[i] = getPlanetsInHouse(i);
    }
    return map;
  }, [getPlanetsInHouse]);

  // === North Indian Kundli absolute positioning helper ===
  const getAuthenticHousePosition = (houseNumber) => {
    const positions = {
      1: { top: '0%', left: '25%', width: '25%', height: '25%' },
      2: { top: '0%', left: '50%', width: '25%', height: '25%' },
      3: { top: '0%', left: '75%', width: '25%', height: '25%' },
      4: { top: '25%', left: '75%', width: '25%', height: '25%' },
      5: { top: '50%', left: '75%', width: '25%', height: '25%' },
      6: { top: '75%', left: '75%', width: '25%', height: '25%' },
      7: { top: '75%', left: '50%', width: '25%', height: '25%' },
      8: { top: '75%', left: '25%', width: '25%', height: '25%' },
      9: { top: '75%', left: '0%', width: '25%', height: '25%' },
      10: { top: '50%', left: '0%', width: '25%', height: '25%' },
      11: { top: '25%', left: '0%', width: '25%', height: '25%' },
      12: { top: '0%', left: '0%', width: '25%', height: '25%' }
    };
    return positions[houseNumber] || {};
  };

  // === Authentic North Indian chart renderer (4x4 grid) ===
  const renderAuthenticChart = () => {
    if (!chartDetails) return null;

    return (
      <div
        className={`relative w-full max-w-lg mx-auto transition-all duration-500 ${
          isChartVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        style={{ aspectRatio: '1', minHeight: '400px' }}
      >
        {/* Title */}
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-center">
          <h3 className="text-lg font-bold text-amber-800 mb-1">जन्म कुंडली</h3>
          <h4 className="text-sm font-semibold text-amber-700">Vedic Birth Chart</h4>
        </div>

        {/* Main Chart Container - 4x4 Grid */}
        <div className="absolute inset-0 border-4 border-amber-800 bg-yellow-50 relative">
          {/* Houses 1-12 positioned according to North Indian tradition */}
          {[1,2,3,4,5,6,7,8,9,10,11,12].map(houseNum => {
            const position = getAuthenticHousePosition(houseNum);
            const housePlanets = housePlanetsMap[houseNum] || [];
            const isSelected = selectedHouse === houseNum;
            const isHovered = hoveredHouse === houseNum;

            return (
              <div
                key={houseNum}
                className={`absolute border-2 border-amber-800 bg-white cursor-pointer
                  transition-all duration-300 flex flex-col items-center justify-center
                  ${isSelected ? 'bg-amber-100 border-amber-600 shadow-lg scale-105 z-20' : 'hover:bg-amber-50 z-10'}
                  ${isHovered ? 'shadow-md' : ''}`}
                style={position}
                onClick={() => handleHouseClick(houseNum)}
                onMouseEnter={() => handleHouseHover(houseNum)}
                onMouseLeave={handleHouseLeave}
              >
                {/* House Number */}
                <div className="absolute top-1 left-1 text-xs font-bold text-amber-800 bg-amber-200
                  rounded px-1 min-w-4 text-center">
                  {houseNum}
                </div>

                {/* Planets in House */}
                <div className="flex flex-wrap justify-center items-center p-1 gap-0.5">
                  {housePlanets.map((planet, idx) => (
                    <span
                      key={idx}
                      className="text-sm font-semibold"
                      style={{
                        color: planetColors[planet.name] || planetColors[planet.Name] || '#92400e',
                        fontSize: housePlanets.length > 3 ? '10px' : '12px'
                      }}
                      title={`${planet.name || planet.Name} in ${planet.sign} (${planet.degree?.toFixed(1)}°)`}
                    >
                      {planetSymbols[planet.name] || planetSymbols[planet.Name] || (planet.name || planet.Name)?.charAt(0)}
                    </span>
                  ))}
                </div>

                {/* House significance tooltip on hover */}
                {isHovered && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-30
                    bg-amber-800 text-white text-xs px-2 py-1 rounded shadow-lg
                    pointer-events-none whitespace-nowrap">
                    <div className="font-medium">House {houseNum}</div>
                    <div className="text-xs opacity-90">{houseSignificance[houseNum]}</div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2
                      border-l-4 border-r-4 border-t-4 border-transparent border-t-amber-800"></div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Center Information Area - spans the middle 2x2 grid */}
          <div className="absolute bg-gradient-to-br from-amber-100 to-yellow-100
            border-2 border-amber-600 rounded-lg flex flex-col items-center justify-center
            text-center shadow-inner z-10"
            style={{
              top: '25%',
              left: '25%',
              width: '50%',
              height: '50%'
            }}>
            <div className="text-amber-800 font-bold text-sm mb-1">
              {chartDetails.birthData?.name || 'Kundli'}
            </div>
            <div className="text-amber-700 text-xs font-medium">
              लग्न: {chartDetails.rasiChart?.ascendant?.sign || 'Unknown'}
            </div>
            <div className="text-xs text-amber-600">
              {chartDetails.rasiChart?.ascendant?.degree?.toFixed(1) || '0.0'}°
            </div>
            {chartDetails.rasiChart?.nakshatra?.name && (
              <div className="text-xs text-amber-600 mt-1">
                {chartDetails.rasiChart.nakshatra.name}
              </div>
            )}
          </div>
        </div>

        {/* Decorative corner elements */}
        <div className="absolute -top-2 -left-2 text-amber-600 text-lg">✦</div>
        <div className="absolute -top-2 -right-2 text-amber-600 text-lg">✦</div>
        <div className="absolute -bottom-2 -left-2 text-amber-600 text-lg">✦</div>
        <div className="absolute -bottom-2 -right-2 text-amber-600 text-lg">✦</div>
      </div>
    );
  };

  // Enhanced house interaction handlers
  const handleHouseHover = useCallback((houseNumber) => {
    setHoveredHouse(houseNumber);
  }, []);

  const handleHouseLeave = useCallback(() => {
    setHoveredHouse(null);
  }, []);

  const handleHouseClick = useCallback((houseNumber) => {
    setSelectedHouse(selectedHouse === houseNumber ? null : houseNumber);
  }, [selectedHouse]);



  const renderHouseDetails = () => {
    if (!selectedHouse || !chartDetails) return null;

    const housePlanets = getPlanetsInHouse(selectedHouse);
    const housePosition = chartDetails.rasiChart?.housePositions?.find(house => house.houseNumber === selectedHouse);

    return (
      <Card className="mt-4 p-4">
        <h3 className="text-lg font-semibold text-amber-800 mb-2">
          House {selectedHouse} Details
        </h3>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-amber-700">Sign:</span>
            <span className="text-sm font-medium text-gray-800">{housePosition?.sign || 'Unknown'}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm text-amber-700">Degree:</span>
            <span className="text-sm font-medium text-gray-800">
              {housePosition?.degree ? `${housePosition.degree.toFixed(2)}°` : 'Unknown'}
            </span>
          </div>

          {housePlanets && housePlanets.length > 0 ? (
            <div>
              <div className="text-sm text-amber-700 mb-2">Planets:</div>
              <div className="space-y-1">
                {housePlanets.map((planet, index) => (
                  <div key={index} className="text-sm bg-yellow-100 p-2 rounded">
                    <div className="font-medium text-gray-800">
                      {planetSymbols[planet.name || planet.Name]} {planet.name || planet.Name}
                    </div>
                    <div className="text-xs text-amber-700">
                      {planet.sign} {planet.degree?.toFixed(2)}° - {planet.dignity || 'neutral'}
                      {planet.isRetrograde && ' (R)'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-sm text-amber-600">
              No planets in this house
            </div>
          )}
        </div>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center">
          {/* Enhanced Vedic Loading Animation */}
          <div className="relative mx-auto mb-6" style={{ width: '120px', height: '120px' }}>
            {/* Outer cosmic ring */}
            <div className="absolute inset-0 rounded-full border-4 border-vedic-gold/30 spinner-vedic"></div>

            {/* Middle celestial ring */}
            <div className="absolute inset-2 rounded-full border-3 border-cosmic-purple/50 animate-spin"
                 style={{animationDuration: '3s', animationDirection: 'reverse'}}></div>

            {/* Inner mandala core */}
            <div className="absolute inset-6 rounded-full bg-vedic-radial
              animate-sacred-pulse flex items-center justify-center shadow-celestial">
              <div className="text-2xl text-white animate-float font-vedic">ॐ</div>
            </div>

            {/* Floating stars */}
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-vedic-gold rounded-full animate-float"
                style={{
                  top: `${20 + Math.sin(i * Math.PI / 4) * 30}%`,
                  left: `${50 + Math.cos(i * Math.PI / 4) * 40}%`,
                  animationDelay: `${i * 0.2}s`
                }}
              />
            ))}
          </div>

          <div className="space-y-2">
            <p className="text-vedic-gradient font-vedic text-lg font-semibold">
              Generating your Vedic birth chart...
            </p>
            <p className="text-sm text-earth-brown/80">
              Calculating planetary positions and house placements
            </p>
            <p className="text-xs text-cosmic-purple italic font-vedic">
              "ग्रह गणना प्रगति में है" - Planetary calculations in progress
            </p>
          </div>

          {/* Enhanced Progress indicator */}
          <div className="mt-4 w-full bg-vedic-background rounded-full h-3 shadow-inner">
            <div className="bg-vedic-radial h-3 rounded-full animate-pulse w-3/4 shadow-golden"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (!chartData) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center text-gray-600">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-lg font-semibold mb-2 text-amber-800">No Chart Data</h3>
          <p className="text-sm text-gray-700">
            Please generate a birth chart by filling out the form and clicking "Generate Chart"
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <Card className="p-4 sm:p-6">
        <div className="text-center mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-amber-800 mb-2">
            Vedic Birth Chart (Kundli)
          </h2>
          <p className="text-xs sm:text-sm text-amber-700">
            Click on any house to view detailed planetary information
          </p>
        </div>

        {renderAuthenticChart()}

        <div className="mt-4 text-center">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 text-xs text-amber-600">
            <span>☉ Sun</span>
            <span>☽ Moon</span>
            <span>♂ Mars</span>
            <span>☿ Mercury</span>
            <span>♃ Jupiter</span>
            <span>♀ Venus</span>
            <span>♄ Saturn</span>
            <span>☊ Rahu</span>
            <span>☋ Ketu</span>
          </div>
        </div>
      </Card>

      {renderHouseDetails()}

      {chartData.analysis && (
        <Card className="p-4">
          <h3 className="text-lg font-semibold text-amber-800 mb-2">
            Chart Summary
          </h3>
          <div className="text-sm text-gray-700 space-y-2">
            <div>
              <strong className="text-amber-700">Ascendant:</strong> {chartData.rasiChart?.ascendant?.sign || chartData.analysis?.personality?.lagnaSign || 'Calculating...'}
            </div>
            <div>
              <strong className="text-amber-700">Moon Sign:</strong> {chartData.analysis?.personality?.moonSign || 'Calculating...'}
            </div>
            <div>
              <strong className="text-amber-700">Sun Sign:</strong> {chartData.analysis?.personality?.sunSign || 'Calculating...'}
            </div>
            <div>
              <strong className="text-amber-700">Nakshatra:</strong> {chartData.rasiChart?.nakshatra?.name || 'Calculating...'}
            </div>
            {chartData.analysis?.personality?.keyTraits && (
              <div>
                <strong className="text-amber-700">Key Traits:</strong> {chartData.analysis.personality.keyTraits.join(', ')}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default VedicChartDisplay;
