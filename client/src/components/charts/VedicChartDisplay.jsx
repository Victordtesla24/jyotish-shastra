import React, { useState, useEffect } from 'react';
import VedicLoadingSpinner from '../ui/loading/VedicLoadingSpinner.jsx';

/**
 * Enhanced Vedic Chart Display - Cultural Design System Integration
 * ============================================================
 * Displays birth charts in authentic North Indian kundli format
 * - Diamond-shaped layout with traditional Sanskrit terminology
 * - Cultural design system with Vedic accessibility compliance
 * - Anti-clockwise house flow with authentic planetary glyphs
 * - Proper dignity symbols and cultural representation standards
 * ============================================================
 */

// Chart dimensions with cultural design system integration
const CHART_SIZE = 500;
const PADDING = 60;
const CENTER_X = CHART_SIZE / 2;
const CENTER_Y = CHART_SIZE / 2;

// Cultural planetary codes and Sanskrit terminology
const PLANET_CODES = {
  Sun: "Su", Moon: "Mo", Mars: "Ma", Mercury: "Me", Jupiter: "Ju",
  Venus: "Ve", Saturn: "Sa", Rahu: "Ra", Ketu: "Ke", Ascendant: "As"
};

// Sanskrit planetary names for cultural authenticity
const SANSKRIT_PLANET_NAMES = {
  Sun: "सूर्य", Moon: "चन्द्र", Mars: "मंगल", Mercury: "बुध", 
  Jupiter: "गुरु", Venus: "शुक्र", Saturn: "शनि", 
  Rahu: "राहु", Ketu: "केतु", Ascendant: "लग्न"
};

// Vedic zodiac signs with Sanskrit and cultural symbols
const ZODIAC_SIGNS = {
  1: { name: 'Aries', sanskrit: 'मेष', symbol: '♈', element: 'fire' },
  2: { name: 'Taurus', sanskrit: 'वृषभ', symbol: '♉', element: 'earth' },
  3: { name: 'Gemini', sanskrit: 'मिथुन', symbol: '♊', element: 'air' },
  4: { name: 'Cancer', sanskrit: 'कर्क', symbol: '♋', element: 'water' },
  5: { name: 'Leo', sanskrit: 'सिंह', symbol: '♌', element: 'fire' },
  6: { name: 'Virgo', sanskrit: 'कन्या', symbol: '♍', element: 'earth' },
  7: { name: 'Libra', sanskrit: 'तुला', symbol: '♎', element: 'air' },
  8: { name: 'Scorpio', sanskrit: 'वृश्चिक', symbol: '♏', element: 'water' },
  9: { name: 'Sagittarius', sanskrit: 'धनु', symbol: '♐', element: 'fire' },
  10: { name: 'Capricorn', sanskrit: 'मकर', symbol: '♑', element: 'earth' },
  11: { name: 'Aquarius', sanskrit: 'कुंभ', symbol: '♒', element: 'air' },
  12: { name: 'Pisces', sanskrit: 'मीन', symbol: '♓', element: 'water' }
};

// Vedic dignity symbols with cultural meaning
const DIGNITY_SYMBOLS = {
  exalted: { symbol: '↑', sanskrit: 'उच्च', meaning: 'Exalted' },
  debilitated: { symbol: '↓', sanskrit: 'नीच', meaning: 'Debilitated' },
  own: { symbol: '○', sanskrit: 'स्व', meaning: 'Own sign' },
  neutral: { symbol: '○', sanskrit: 'निर', meaning: 'Neutral' }
};

// Rasi (Zodiac Sign) to Number mapping - Using real API sign names
const RASI_NUMBERS = {
  'Aries': 1, 'Taurus': 2, 'Gemini': 3, 'Cancer': 4,
  'Leo': 5, 'Virgo': 6, 'Libra': 7, 'Scorpio': 8,
  'Sagittarius': 9, 'Capricorn': 10, 'Aquarius': 11, 'Pisces': 12
};

/**
 * Get Rasi number from API sign name
 */
function getRasiNumberFromSign(signName) {
  if (!signName || typeof signName !== 'string') {
    throw new Error(`Invalid sign name: ${signName}. Expected a valid zodiac sign name.`);
  }
  
  const rasiNumber = RASI_NUMBERS[signName];
  if (!rasiNumber || rasiNumber < 1 || rasiNumber > 12) {
    throw new Error(`Invalid sign name "${signName}". Expected one of: Aries, Taurus, Gemini, Cancer, Leo, Virgo, Libra, Scorpio, Sagittarius, Capricorn, Aquarius, Pisces`);
  }
  
  return rasiNumber;
}

/**
 * Calculate which Rasi occupies each house position based on ascendant
 * Uses authentic Vedic calculation: each house spans one Rasi (30°)
 * CORRECTED for proper North Indian chart sequence
 */
function calculateRasiForHouse(houseNumber, ascendantRasi) {
  if (!ascendantRasi || houseNumber < 1 || houseNumber > 12) {
    return houseNumber; // Return house number when data is invalid
  }

  // CORRECT Vedic calculation:
  // House 1 = ascendant Rasi (e.g., if ascendant is Libra=7, house 1 = 7)
  // House 2 = next Rasi (house 2 = 8)
  // House 3 = next Rasi (house 3 = 9), etc.

  // Simple formula: (ascendantRasi + houseNumber - 1 - 1) % 12 + 1
  let rasiNumber = (ascendantRasi + houseNumber - 2) % 12 + 1;

  // Handle wrap-around: if result is 0 or negative, add 12
  if (rasiNumber <= 0) {
    rasiNumber += 12;
  }

  // Ensure final result is in 1-12 range
  if (rasiNumber > 12) {
    rasiNumber = rasiNumber - 12;
  }

  return rasiNumber;
}


// North Indian chart house positions (diamond layout) - Optimized for better text visibility
const HOUSE_POSITIONS = {
  1:  { x: CENTER_X, y: PADDING + 30 },           // Top center
  2:  { x: CENTER_X + 80, y: PADDING + 60 },      // Top right
  3:  { x: CHART_SIZE - PADDING - 30, y: CENTER_Y - 80 }, // Right top
  4:  { x: CHART_SIZE - PADDING - 30, y: CENTER_Y },      // Right center
  5:  { x: CHART_SIZE - PADDING - 30, y: CENTER_Y + 80 }, // Right bottom
  6:  { x: CENTER_X + 80, y: CHART_SIZE - PADDING - 60 }, // Bottom right
  7:  { x: CENTER_X, y: CHART_SIZE - PADDING - 30 },      // Bottom center
  8:  { x: CENTER_X - 80, y: CHART_SIZE - PADDING - 60 }, // Bottom left
  9:  { x: PADDING + 30, y: CENTER_Y + 80 },       // Left bottom
  10: { x: PADDING + 30, y: CENTER_Y },            // Left center
  11: { x: PADDING + 30, y: CENTER_Y - 80 },       // Left top
  12: { x: CENTER_X - 80, y: PADDING + 60 }        // Top left
};

// Rasi number positions matching the red circles in North Indian chart
// Houses are numbered anti-clockwise starting from top (1st house)
// Based on the red circles in the reference image
const RASI_NUMBER_POSITIONS = {
  1:  { x: PADDING + 100, y: PADDING + 100 },           // Top-left corner (between houses 12 and 1)
  2:  { x: CENTER_X - 80, y: PADDING + 60 },            // Top edge left (between houses 1 and 2)
  3:  { x: CENTER_X + 80, y: PADDING + 60 },            // Top edge right (between houses 2 and 3)
  4:  { x: CHART_SIZE - PADDING - 100, y: PADDING + 100 }, // Top-right corner (between houses 3 and 4)
  5:  { x: CHART_SIZE - PADDING - 60, y: CENTER_Y - 80 },  // Right edge top (between houses 4 and 5)
  6:  { x: CHART_SIZE - PADDING - 60, y: CENTER_Y + 80 },  // Right edge bottom (between houses 5 and 6)
  7:  { x: CHART_SIZE - PADDING - 100, y: CHART_SIZE - PADDING - 100 }, // Bottom-right corner
  8:  { x: CENTER_X + 80, y: CHART_SIZE - PADDING - 60 },  // Bottom edge right
  9:  { x: CENTER_X - 80, y: CHART_SIZE - PADDING - 60 },  // Bottom edge left
  10: { x: PADDING + 100, y: CHART_SIZE - PADDING - 100 }, // Bottom-left corner
  11: { x: PADDING + 60, y: CENTER_Y + 80 },            // Left edge bottom
  12: { x: PADDING + 60, y: CENTER_Y - 80 }             // Left edge top
};

// Removed unused DIAMOND_FRAME constant

/**
 * Process chart data to extract planetary positions
 * Handles direct chart data structure (rasiChart or navamsaChart)
 */
function processChartData(chartData) {
  if (!chartData) {
    throw new Error('Chart data is required for processing. Expected rasiChart or navamsaChart data from API.');
  }

  // CRITICAL DEBUG: Log incoming chart data for validation
  console.log('🔍 VedicChartDisplay: Processing chart data', {
    hasChartData: !!chartData,
    hasAscendant: !!chartData.ascendant,
    ascendantSign: chartData.ascendant?.sign,
    ascendantDegree: chartData.ascendant?.degree,
    ascendantLongitude: chartData.ascendant?.longitude,
    hasPlanets: !!chartData.planets || !!chartData.planetaryPositions,
    planetCount: chartData.planets?.length || Object.keys(chartData.planetaryPositions || {}).length
  });

  // Handle direct chart data structure (chartData is rasiChart or navamsaChart directly)
  const chart = chartData;

  // Use planetaryPositions if available (from API), otherwise use planets array
  let planetsData = [];
  if (chart.planetaryPositions && typeof chart.planetaryPositions === 'object') {
    // Convert planetaryPositions object to array with planet names
    planetsData = Object.entries(chart.planetaryPositions).map(([planetKey, planetData]) => ({
      ...planetData,
      name: planetKey.charAt(0).toUpperCase() + planetKey.slice(1) // Convert 'sun' to 'Sun'
    }));
  } else if (chart.planets && Array.isArray(chart.planets)) {
    planetsData = chart.planets;
  } else {
    throw new Error('Planetary positions data is required. Expected chart.planetaryPositions object or chart.planets array from API.');
  }
  
  if (!planetsData || planetsData.length === 0) {
    throw new Error('No planetary data found in chart. Expected at least one planet in planetaryPositions or planets array.');
  }

  // Validate ascendant is present and has longitude
  if (!chart.ascendant || typeof chart.ascendant.longitude !== 'number') {
    throw new Error('Ascendant data is required with longitude. Expected chart.ascendant.longitude from API.');
  }
  
  // Process planets with cultural enhancement and accessibility
  const planets = planetsData.map(planet => {
    if (typeof planet.longitude !== 'number' || isNaN(planet.longitude)) {
      throw new Error(`Invalid longitude for planet ${planet.name || 'unknown'}: ${planet.longitude}. Expected a valid number from API.`);
    }
    
    const house = calculateHouseFromLongitude(planet.longitude, chart.ascendant.longitude);
    const degrees = planet.degree !== undefined ? Math.floor(planet.degree) : Math.floor(planet.longitude % 30);
    const minutes = planet.degree !== undefined ?
      Math.floor((planet.degree - Math.floor(planet.degree)) * 60) :
      Math.floor(((planet.longitude % 30) - degrees) * 60);

    // Get zodiac sign information
    const signNumber = Math.floor((planet.longitude || 0) / 30) + 12; // Ensure between 1-12
    const normalizedSign = ((signNumber - 1) % 12) + 1;
    const zodiacSign = ZODIAC_SIGNS[normalizedSign];
    
    // Get cultural dignity information
    const dignity = planet.dignity || 'neutral';
    const dignityInfo = DIGNITY_SYMBOLS[dignity] || DIGNITY_SYMBOLS.neutral;

    return {
      name: planet.name,
      sanskritName: SANSKRIT_PLANET_NAMES[planet.name] || planet.name,
      code: PLANET_CODES[planet.name] || planet.name.substring(0, 2),
      house: house,
      degrees: degrees,
      minutes: minutes,
      position: HOUSE_POSITIONS[house],
      dignity: dignity,
      dignitySymbol: dignityInfo.symbol,
      sanskritDignity: dignityInfo.sanskrit,
      retrograde: planet.retrograde || planet.isRetrograde || false,
      zodiacSign: zodiacSign?.name || 'Unknown',
      zodiacSymbol: zodiacSign?.symbol || '?',
      zodiacSanskrit: zodiacSign?.sanskrit || 'अज्ञात',
      zodiacElement: zodiacSign?.element || 'unknown',
      culturalContext: generateCulturalContext(planet, zodiacSign, dignity)
    };
  });

  // Process ascendant
  let ascendant = null;
  if (chart.ascendant) {
    const ascHouse = 1; // Ascendant is always in 1st house in North Indian format
    // Use the degree field directly from API response, or calculate if not available
    const ascDegrees = chart.ascendant.degree !== undefined ?
      Math.floor(chart.ascendant.degree) :
      Math.floor(chart.ascendant.longitude % 30);
    const ascMinutes = chart.ascendant.degree !== undefined ?
      Math.floor((chart.ascendant.degree - Math.floor(chart.ascendant.degree)) * 60) :
      Math.floor(((chart.ascendant.longitude % 30) - ascDegrees) * 60);

    // Calculate signId for ascendant
    const ascendantSignId = chart.ascendant.signId || (
      Math.floor(((chart.ascendant.longitude % 360) + 360) % 360 / 30) + 1
    );

    ascendant = {
      name: 'Ascendant',
      code: 'As',
      house: ascHouse,
      degrees: ascDegrees,
      minutes: ascMinutes,
      position: HOUSE_POSITIONS[ascHouse],
      sign: chart.ascendant.signName || chart.ascendant.sign || 'Unknown',
      signId: ascendantSignId,
      longitude: chart.ascendant.longitude
    };
  }

  return { planets, ascendant };
}

/**
 * Calculate house number from planetary longitude with correct ascendant offset handling
 * Houses are calculated as 30-degree segments starting from the ascendant longitude
 * Fixed to match API response house positions accurately
 */
function calculateHouseFromLongitude(planetLongitude, ascendantLongitude) {
  // PRODUCTION: Require valid longitudes - throw error instead of fallback
  if (typeof planetLongitude !== 'number' || isNaN(planetLongitude)) {
    throw new Error(`Invalid planet longitude: ${planetLongitude}. Expected a valid number.`);
  }
  
  if (typeof ascendantLongitude !== 'number' || isNaN(ascendantLongitude)) {
    throw new Error(`Invalid ascendant longitude: ${ascendantLongitude}. Expected a valid number from chart.ascendant.longitude.`);
  }

  // Normalize longitudes to 0-360 range
  const normalizedPlanet = ((planetLongitude % 360) + 360) % 360;
  const normalizedAscendant = ((ascendantLongitude % 360) + 360) % 360;

  // Calculate the difference from ascendant
  let diff = normalizedPlanet - normalizedAscendant;

  // Handle the wrap-around case (ensure positive difference)
  if (diff < 0) {
    diff += 360;
  }

  // Calculate house (each house spans 30 degrees)
  // Add 1 because houses are 1-indexed, not 0-indexed
  let houseNumber = Math.floor(diff / 30) + 1;

  // Handle wrap-around for house 13 → house 1
  if (houseNumber > 12) {
    houseNumber = houseNumber - 12;
  }

  // Ensure house number is within valid range (1-12)
  const validHouse = Math.max(1, Math.min(12, houseNumber));

  return validHouse;
}

/**
 * Group planets by house for clean display
 */
function groupPlanetsByHouse(planets, ascendant) {
  const houseGroups = {};

  // Initialize all houses
  for (let i = 1; i <= 12; i++) {
    houseGroups[i] = [];
  }

  // Add ascendant to first house
  if (ascendant) {
    houseGroups[1].push(ascendant);
  }

  // Group planets by house
  planets.forEach(planet => {
    if (planet.house >= 1 && planet.house <= 12) {
      houseGroups[planet.house].push(planet);
    }
  });

  return houseGroups;
}

/**
 * Get zodiac sign meaning in Vedic context
 * @param {string} signName - Zodiac sign name
 * @returns {string} Meaning description
 */
function getZodiacMeaning(signName) {
  const meanings = {
    'Aries': 'Leadership, courage, new beginnings',
    'Taurus': 'Stability, wealth, material success', 
    'Gemini': 'Communication, intelligence, versatility',
    'Cancer': 'Nurturing, emotions, family',
    'Leo': 'Creativity, authority, self-expression',
    'Virgo': 'Service, analysis, perfection',
    'Libra': 'Relationships, balance, justice',
    'Scorpio': 'Transformation, intensity, power',
    'Sagittarius': 'Wisdom, expansion, philosophy',
    'Capricorn': 'Discipline, achievement, status',
    'Aquarius': 'Innovation, humanitarianism, change',
    'Pisces': 'Spirituality, compassion, universal consciousness'
  };
  return meanings[signName] || 'Unknown qualities';
}

/**
 * Get astrological notes for planetary placements
 * @param {string} planetName - Planet name
 * @param {string} signName - Zodiac sign name
 * @param {string} dignity - Planet dignity
 * @returns {string} Astrological notes
 */
function getAstrologicalNotes(planetName, signName, dignity) {
  if (dignity === 'exalted') {
    return `${planetName} exalted in ${signName} - highest manifestation of qualities`;
  } else if (dignity === 'debilitated') {
    return `${planetName} debilitated in ${signName} - challenges requiring remedies`;
  }
  return `${planetName} in ${signName} - standard planetary influences`;
}

/**
 * Generate cultural context for planet placement
 * @param {Object} planet - Planet data
 * @param {Object} zodiacSign - Zodiac sign information
 * @param {string} dignity - Planet dignity
 * @returns {Object} Cultural context information
 */
function generateCulturalContext(planet, zodiacSign, dignity) {
  if (!zodiacSign) return { description: 'Unknown zodiac sign' };

  const context = {
    description: `${zodiacSign.name} house placement`,
    element: zodiacSign.element || 'unknown',
    sign: zodiacSign.sanskrit || zodiacSign.name,
    meaning: getZodiacMeaning(zodiacSign.name)
  };

  // Add dignity-specific cultural context
  if (dignity === 'exalted') {
    context.description = `${zodiacSign.name} exalted position - maximum strength`;
    context.vedicSignificance = 'Planet gains maximum influence and auspicious results';
  } else if (dignity === 'debilitated') {
    context.description = `${zodiacSign.name} debilitated position - challenges indicated`;
    context.vedicSignificance = 'Planet faces obstacles requiring remedial measures';
  } else if (dignity === 'own') {
    context.description = `${zodiacSign.name} own house - natural domain`;
    context.vedicSignificance = 'Planet operates with natural strength';
  }

  // Add astrological considerations
  context.astrologicalNotes = getAstrologicalNotes(planet.name, zodiacSign.name, dignity);

  return context;
}

/**
 * Format planet display text to match template specification EXACTLY
 * Template format: "Ra 15" (concise, no degree symbols, no minutes)
 */
function formatPlanetText(planet) {
  // EXACT template format: Planet code + space + degree number only
  // Dignity symbols: ↑ for exalted, ↓ for debilitated (as shown in template)
  const dignitySymbol = planet.dignity === 'exalted' ? '↑' :
                       planet.dignity === 'debilitated' ? '↓' : '';

  // Template shows format like "Ra 15", "Ju 14", "Mo 19" - NO degree symbol, NO minutes
  return `${planet.code} ${planet.degrees}${dignitySymbol}`;
}

/**
 * Main VedicChartDisplay Component
 */
export default function VedicChartDisplay({
  chartData,
  chartType = "rasi",
  className = "",
  style = {},
  showDetails = true,
  onError
}) {
  const [processedData, setProcessedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Process chart data
  useEffect(() => {
    if (!chartData) {
      setProcessedData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const { planets, ascendant } = processChartData(chartData);
      const houseGroups = groupPlanetsByHouse(planets, ascendant);

      setProcessedData({ planets, ascendant, houseGroups });
      setError(null);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to process chart data');
      setProcessedData(null);
      setLoading(false);
      onError?.(err);
    }
  }, [chartData, onError]); // Add chartData as dependency to ensure re-render on data change

  // Loading state
  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`} style={style}>
        <VedicLoadingSpinner text="Loading Traditional Kundli..." />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center ${className}`} style={style}>
        <div className="text-red-600 mb-4">⚠️</div>
        <h3 className="text-lg font-semibold text-red-800 mb-2">Chart Display Error</h3>
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  // No data state
  if (!processedData) {
    return (
      <div className={`bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6 text-center ${className}`} style={style}>
        <div className="text-yellow-600 mb-4">📊</div>
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">No Chart Data</h3>
        <p className="text-yellow-700">Please generate a birth chart first.</p>
      </div>
    );
  }

  const { houseGroups, ascendant } = processedData;

  return (
    <div
      className={`rounded-lg p-6 ${className}`}
      style={{
        ...style,
        backgroundColor: '#FFF8E1', // Cream/beige background to match template
        border: '2px solid #8B4513', // Brown border to match traditional kundli
        minWidth: `${CHART_SIZE + 100}px`, // Add padding for container
        width: 'max-content', // Ensure container doesn't shrink
        display: 'inline-block' // Prevent flex shrinking
      }}
      role="article"
      aria-label="Traditional Vedic Birth Chart (North Indian Style)"
    >
      {/* Chart Title with Sanskrit */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold" style={{ color: '#2F1B14' }}>
              {chartType === "navamsa" ?
                "नवांश चक्र (Navamsa Chart) - D9" :
                "राशि चक्र लग्न चक्र (Lagna Chart) - D1"
              }
            </h2>
        {ascendant && (
          <p className="text-sm mt-1" style={{ color: '#5D4037' }}>
            लग्न (Lagna): {ascendant.sign} {ascendant.degrees}°{ascendant.minutes}'
          </p>
        )}
      </div>

      {/* Traditional Diamond Chart */}
      <div className="flex justify-center" style={{
        minWidth: `${CHART_SIZE}px`,
        minHeight: `${CHART_SIZE}px`,
        width: `${CHART_SIZE}px`,
        height: `${CHART_SIZE}px`
      }}>
        <svg
          width={CHART_SIZE}
          height={CHART_SIZE}
          viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`}
          style={{
            width: `${CHART_SIZE}px`,
            height: `${CHART_SIZE}px`,
            minWidth: `${CHART_SIZE}px`,
            minHeight: `${CHART_SIZE}px`,
            display: 'block',
            flexShrink: 0,
            backgroundColor: '#FFF8E1' // Cream background for SVG
          }}
          className="border-none" // Remove default border since we're styling the container
          role="img"
          aria-label="Traditional North Indian Kundli Chart"
        >
          {/* Background fill for the entire chart */}
          <rect width={CHART_SIZE} height={CHART_SIZE} fill="#FFF8E1" />

          {/* Chart Frame - Authentic North Indian Diamond Structure */}
          <g stroke="#000000" strokeWidth="2" fill="none">
            {/* Outer square border */}
            <rect
              x={PADDING}
              y={PADDING}
              width={CHART_SIZE - 2*PADDING}
              height={CHART_SIZE - 2*PADDING}
              fill="none"
              stroke="#000000"
              strokeWidth="2"
            />

            {/* Corner-to-corner diagonal lines creating X pattern */}
            <line x1={PADDING} y1={PADDING} x2={CHART_SIZE - PADDING} y2={CHART_SIZE - PADDING} />
            <line x1={CHART_SIZE - PADDING} y1={PADDING} x2={PADDING} y2={CHART_SIZE - PADDING} />

            {/* Inner diamond connecting midpoints of square sides */}
            <line x1={CENTER_X} y1={PADDING} x2={CHART_SIZE - PADDING} y2={CENTER_Y} />
            <line x1={CHART_SIZE - PADDING} y1={CENTER_Y} x2={CENTER_X} y2={CHART_SIZE - PADDING} />
            <line x1={CENTER_X} y1={CHART_SIZE - PADDING} x2={PADDING} y2={CENTER_Y} />
            <line x1={PADDING} y1={CENTER_Y} x2={CENTER_X} y2={PADDING} />
          </g>

          {/* Rasi Numbers - positioned at diamond intersections (blue circle locations) */}
          {Object.entries(RASI_NUMBER_POSITIONS).map(([houseNum, rasiPosition]) => {
            // Get ascendant Rasi from API data
            const ascendantRasi = ascendant ? getRasiNumberFromSign(ascendant.sign) : 1;
            // Calculate which Rasi occupies this house position
            const rasiNumber = calculateRasiForHouse(parseInt(houseNum), ascendantRasi);

            return (
              <text
                key={`rasi-${houseNum}`}
                x={rasiPosition.x}
                y={rasiPosition.y}
                textAnchor="middle"
                fontSize="14"
                fill="#000000"
                fontWeight="bold"
                fontFamily="Arial, sans-serif"
              >
                {rasiNumber}
              </text>
            );
          })}


          {/* Planetary Positions - improved spacing to prevent overlapping */}
          {Object.entries(houseGroups).map(([houseNum, planetsInHouse]) => {
            if (planetsInHouse.length === 0) return null;

            const housePosition = HOUSE_POSITIONS[parseInt(houseNum)];
            const housePlanetCount = planetsInHouse.length;

            return (
              <g key={`house-planets-${houseNum}`}>
                {planetsInHouse.map((planet, index) => {
                  // Improved positioning logic to prevent overlapping
                  let textX = housePosition.x;
                  let textY = housePosition.y;

                  // For multiple planets in same house, arrange them in a grid pattern
                  if (housePlanetCount === 1) {
                    // Single planet - center it below house number
                    textY += 25;
                  } else if (housePlanetCount === 2) {
                    // Two planets - stack vertically with proper spacing
                    textY += 20 + (index * 25);
                  } else if (housePlanetCount === 3) {
                    // Three planets - increased spacing to prevent overlap
                    textY += 15 + (index * 24);
                  } else {
                    // Four or more planets - use 2x2 grid layout with better spacing
                    const col = index % 2;
                    const row = Math.floor(index / 2);
                    textX += (col === 0 ? -35 : 35); // Increased horizontal offset
                    textY += 20 + (row * 22); // Increased vertical spacing
                  }

                  return (
                    <text
                      key={`${houseNum}-${planet.name}-${index}`}
                      x={textX}
                      y={textY}
                      textAnchor="middle"
                      fontSize="12"
                      fill="#000000"
                      fontFamily="Arial, sans-serif"
                      fontWeight="bold"
                      style={{
                        textShadow: '1px 1px 1px rgba(255,255,255,0.8)' // Add subtle shadow for clarity
                      }}
                    >
                      {formatPlanetText(planet)}
                    </text>
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend with Sanskrit Terms */}
      <div className="mt-6 text-xs text-center space-y-2" style={{ color: '#5D4037' }}>
        <div>
          <p className="font-medium mb-1">ग्रह (Graha) - Planetary Codes:</p>
          <p>Su=सूर्य(Sun), Mo=चन्द्र(Moon), Ma=मंगल(Mars), Me=बुध(Mercury), Ju=गुरु(Jupiter)</p>
          <p>Ve=शुक्र(Venus), Sa=शनि(Saturn), Ra=राहु(Rahu), Ke=केतु(Ketu), As=लग्न(Ascendant)</p>
        </div>
        <div>
          <p className="font-medium mb-1">वैदिक चिह्न (Vedic Symbols):</p>
          <p>↑=उच्च(Exalted), ↓=नीच(Debilitated), ℞=वक्री(Retrograde), ☉=अस्त(Combust)</p>
          <p>Format: Planet Position°Minutes' with dignity symbols</p>
        </div>
      </div>
    </div>
  );
}

// Export helper functions for testing
export {
  HOUSE_POSITIONS,
  PLANET_CODES,
  processChartData,
  calculateHouseFromLongitude,
  groupPlanetsByHouse,
  formatPlanetText,
  generateCulturalContext,
  getZodiacMeaning,
  getAstrologicalNotes
};
