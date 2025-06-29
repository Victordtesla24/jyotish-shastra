import React, { useState, useEffect } from 'react';
import { Card } from '../ui/cards/Card';

/**
 * VedicChartDisplay Component
 * Displays generated Vedic birth chart in traditional North Indian Kundli diamond format
 */
const VedicChartDisplay = ({ chartData, isLoading = false, className = '' }) => {
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [chartDetails, setChartDetails] = useState(null);

  useEffect(() => {
    if (chartData) {
      console.log('🎯 VedicChartDisplay received chart data:', chartData);
      console.log('🔍 Rasi Chart planets:', chartData.rasiChart?.planets);
      console.log('🔍 Ascendant info:', chartData.rasiChart?.ascendant);
      setChartDetails(chartData);
    }
  }, [chartData]);

  // Traditional North Indian Kundli diamond layout - CORRECTED to match template
  const getHousePosition = (houseNumber) => {
    const positions = {
      // House 1 - Top center (Ascendant)
      1: { top: '8%', left: '50%', transform: 'translate(-50%, -50%)', width: '20%', height: '16%', clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' },

      // House 2 - Top left
      2: { top: '8%', left: '25%', transform: 'translate(-50%, -50%)', width: '20%', height: '16%', clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%)' },

      // House 3 - Left top
      3: { top: '25%', left: '8%', transform: 'translate(-50%, -50%)', width: '16%', height: '20%', clipPath: 'polygon(0% 0%, 100% 50%, 0% 100%)' },

      // House 4 - Left center
      4: { top: '50%', left: '8%', transform: 'translate(-50%, -50%)', width: '16%', height: '20%', clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%)' },

      // House 5 - Left bottom
      5: { top: '75%', left: '8%', transform: 'translate(-50%, -50%)', width: '16%', height: '20%', clipPath: 'polygon(100% 0%, 100% 100%, 0% 50%)' },

      // House 6 - Bottom left
      6: { top: '92%', left: '25%', transform: 'translate(-50%, -50%)', width: '20%', height: '16%', clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' },

      // House 7 - Bottom center
      7: { top: '92%', left: '50%', transform: 'translate(-50%, -50%)', width: '20%', height: '16%', clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%)' },

      // House 8 - Bottom right
      8: { top: '92%', left: '75%', transform: 'translate(-50%, -50%)', width: '20%', height: '16%', clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%)' },

      // House 9 - Right bottom
      9: { top: '75%', left: '92%', transform: 'translate(-50%, -50%)', width: '16%', height: '20%', clipPath: 'polygon(0% 0%, 0% 100%, 100% 50%)' },

      // House 10 - Right center
      10: { top: '50%', left: '92%', transform: 'translate(-50%, -50%)', width: '16%', height: '20%', clipPath: 'polygon(0% 0%, 0% 100%, 100% 100%)' },

      // House 11 - Right top
      11: { top: '25%', left: '92%', transform: 'translate(-50%, -50%)', width: '16%', height: '20%', clipPath: 'polygon(0% 50%, 100% 0%, 100% 100%)' },

      // House 12 - Top right
      12: { top: '8%', left: '75%', transform: 'translate(-50%, -50%)', width: '20%', height: '16%', clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%)' }
    };
    return positions[houseNumber] || {};
  };

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

  // Get planets in house using proper house calculation
  const getPlanetsInHouse = (houseNumber) => {
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
  };

  const renderChart = () => {
    if (!chartDetails) return null;

    return (
      <div className="relative w-full max-w-lg mx-auto" style={{ aspectRatio: '1', minHeight: '400px' }}>
        {/* Main Diamond Container */}
        <div className="absolute inset-0">
          {/* Outer Diamond Border */}
          <div className="absolute inset-0 border-2 border-amber-800 bg-gradient-to-br from-amber-50 to-yellow-100 transform rotate-45 origin-center"></div>

          {/* Inner Diamond Structure */}
          <div className="absolute inset-8 border border-amber-700 transform rotate-45 bg-amber-50/50"></div>

          {/* Diamond Cross Lines */}
          <div className="absolute top-0 left-1/2 w-0.5 h-full bg-amber-700 transform -translate-x-0.5"></div>
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-amber-700 transform -translate-y-0.5"></div>

          {/* Diagonal Lines */}
          <div className="absolute inset-0 border border-amber-600/30 transform rotate-45"></div>
          <div className="absolute inset-4 border border-amber-600/20 transform rotate-45"></div>

          {/* House Numbers and Planets */}
          {Array.from({ length: 12 }, (_, i) => i + 1).map((houseNum) => {
            const position = getHousePosition(houseNum);
            const housePlanets = getPlanetsInHouse(houseNum);
            return (
              <div
                key={houseNum}
                className={`absolute cursor-pointer transition-all hover:bg-yellow-200/80 border border-amber-600/50 ${
                  selectedHouse === houseNum ? 'ring-2 ring-orange-500 shadow-lg bg-yellow-300/60' : 'bg-amber-50/90'
                }`}
                style={{
                  ...position,
                  minWidth: '60px',
                  minHeight: '60px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: '4px'
                }}
                onClick={() => setSelectedHouse(houseNum)}
              >
                {/* House Number */}
                <div className="text-xs font-bold text-amber-800 mb-1">
                  {houseNum}
                </div>

                {/* Planets in House */}
                <div className="flex flex-wrap justify-center items-center text-center">
                  {housePlanets.map((planet, index) => (
                    <span
                      key={index}
                      className="text-sm text-orange-600 font-bold mx-0.5"
                      title={`${planet.name || planet.Name} - ${planet.sign} ${planet.degree?.toFixed(1)}°`}
                    >
                      {planetSymbols[planet.name || planet.Name] || (planet.name || planet.Name).slice(0, 2)}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Center Information */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center bg-white/95 p-3 rounded-lg border border-amber-700 shadow-md z-10">
            <div className="text-sm font-semibold text-amber-800">
              {chartDetails.birthData?.name || chartDetails.name || 'Birth Chart'}
            </div>
            <div className="text-xs text-amber-700">
              {chartDetails.birthData?.dateOfBirth ? new Date(chartDetails.birthData.dateOfBirth).toLocaleDateString() : chartDetails.dateOfBirth}
            </div>
            <div className="text-xs text-amber-700">
              {chartDetails.birthData?.placeOfBirth || chartDetails.placeOfBirth}
            </div>
          </div>
        </div>
      </div>
    );
  };

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
          <div className="animate-spin h-8 w-8 border-4 border-vedic-orange border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-earth-brown">Generating your Vedic birth chart...</p>
          <p className="text-sm text-earth-brown/70 mt-2">
            Calculating planetary positions and house placements
          </p>
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

        {renderChart()}

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
