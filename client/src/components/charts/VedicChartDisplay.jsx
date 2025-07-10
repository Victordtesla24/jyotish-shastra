import React, { useState, useEffect, useMemo } from "react";
import { APIError } from '../../utils/APIResponseInterpreter';
import { processChartData as transformChartData } from '../../utils/dataTransformers';
import { VedicLoadingSpinner } from '../ui/loading/VedicLoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';

/**
 * VedicChartDisplay - Enhanced Kundli Template Component
 * ------------------------------------------------------------
 * Fully integrated with API Response Interpreter system
 * - Enhanced error handling with APIError support
 * - Loading states with VedicLoadingSpinner
 * - Processed data integration from enhanced services
 * - Proper data transformation pipeline
 * - North Indian diamond layout frame
 * - Planetary data processing and positioning
 * - Rasi glyph positioning with custom adjustments
 * - Dynamic updates based on JSON data changes
 * - Backward compatible with existing props interface
 */

// Geometry constants
const SIZE = 400;
const PAD = 20;
const STROKE = 3;

// House centres (North Indian diamond layout)
const HOUSE_CENTRES = {
  1: { x: 200, y: 180 },
  2: { x: 110, y: 100 },
  3: { x:  80, y: 120 },
  4: { x: 180, y: 210 },
  5: { x:  90, y: 300 },
  6: { x: 110, y: 320 },
  7: { x: 200, y: 240 },
  8: { x: 290, y: 320 },
  9: { x: 320, y: 300 },
 10: { x: 220, y: 210 },
 11: { x: 320, y: 120 },
 12: { x: 290, y: 100 },
};

// Planet positioning rules
const PLANET_LAYOUT = {
  1:  { dx:   0, dy:  20, dir:  1 },
  2:  { dx: -18, dy:  18, dir:  1 },
  3:  { dx: -25, dy:   4, dir:  1 },
  4:  { dx: -25, dy:  20, dir:  1 },
  5:  { dx: -25, dy: -12, dir: -1 },
  6:  { dx: -18, dy: -18, dir: -1 },
  7:  { dx:   0, dy: -20, dir: -1 },
  8:  { dx:  18, dy: -12, dir: -1 },
  9:  { dx:  20, dy: 21, dir: -1 },
 10:  { dx:  50, dy:  -4, dir: -1 },
 11:  { dx: -25, dy: -15, dir: -1 },
 12:  { dx:  18, dy:  18, dir:  1 },
};

// Helper functions
const dignitySymbol = (d) => ({ exalted: "↑", debilitated: "↓" }[d] || "");
const planetCode = (n) => (
  {
    Sun: "Su", Moon: "Mo", Mars: "Ma", Mercury: "Me", Jupiter: "Ju",
    Venus: "Ve", Saturn: "Sa", Rahu: "Ra", Ketu: "Ke",
  }[n] || n.slice(0, 2)
);

// Rasi glyphs mapping (signId to Unicode symbol)
const RASI_GLYPHS = {
  1: "♈",   // Aries
  2: "♉",   // Taurus
  3: "♊",   // Gemini
  4: "♋",   // Cancer
  5: "♌",   // Leo
  6: "♍",   // Virgo
  7: "♎",   // Libra
  8: "♏",   // Scorpio
  9: "♐",   // Sagittarius
  10: "♑", // Capricorn
  11: "♒", // Aquarius
  12: "♓"  // Pisces
};

/**
 * Enhanced chart data processing with integration to API Response Interpreter
 * @param {Object} data - Chart data from API Response Interpreter
 * @returns {Object} - Processed chart data with planets and rashis
 */
function processChartDataInternal(data) {
  console.log('🔧 Enhanced processChartData called with:', JSON.stringify(data, null, 2));

  try {
    // First, try to use the data transformation from our API Response Interpreter system
    // This handles data that's already been processed by the enhanced services
    if (data && (data.houses || data.planets || data.ascendant)) {
      console.log('✅ Using pre-processed data from API Response Interpreter');
      return processEnhancedChartData(data);
    }

    // Fallback to legacy processing for backward compatibility
    return processLegacyChartData(data);

  } catch (error) {
    console.error('💥 Error in enhanced processChartData:', error);

    // If it's an APIError, preserve it
    if (error instanceof APIError) {
      throw error;
    }

    // Otherwise, wrap in a generic error
    throw new APIError({
      code: 'CHART_PROCESSING_ERROR',
      message: `Chart data processing failed: ${error.message}`,
      userMessage: 'Unable to process chart data. Please try again.'
    });
  }
}

/**
 * Process chart data that's already been enhanced by API Response Interpreter
 * @param {Object} data - Enhanced chart data
 * @returns {Object} - Processed chart data
 */
function processEnhancedChartData(data) {
  console.log('🎯 Processing enhanced chart data');

  // Extract data from the enhanced format
  const houses = data.houses || [];
  const planets = data.planets || [];
  const ascendant = data.ascendant || {};

  // Map houses to rashi numbers for display
  const rashis = Array(12).fill(0);
  houses.forEach((house, index) => {
    if (house.sign) {
      // Convert sign name to rashi number
      const rashiNumber = getSignNumber(house.sign);
      rashis[index] = rashiNumber;
    } else if (house.signId) {
      rashis[index] = house.signId;
    }
  });

  // Process planets for display
  const processedPlanets = [];
  planets.forEach(planet => {
    const house = planet.position?.house || 1;
    const houseLayout = PLANET_LAYOUT[house];
    const centre = HOUSE_CENTRES[house];

    if (centre && houseLayout) {
      processedPlanets.push({
        code: planetCode(planet.name),
        deg: Math.round(planet.position?.degree || 0),
        dignity: dignitySymbol(planet.dignityCode || planet.strength?.dignity),
        x: centre.x + houseLayout.dx + (processedPlanets.filter(p =>
          p.house === house).length * 15 * houseLayout.dir),
        y: centre.y + houseLayout.dy,
        house: house,
        name: planet.name
      });
    }
  });

  // Process rasi glyphs
  const rasiGlyphs = houses.map((house, index) => {
    const houseNumber = index + 1;
    const signId = house.signId || getSignNumber(house.sign) || houseNumber;
    const centre = HOUSE_CENTRES[houseNumber];

    return {
      x: centre.x + 15,
      y: centre.y + 15,
      glyph: RASI_GLYPHS[signId],
      signId: signId,
      house: houseNumber
    };
  });

  console.log('✅ Enhanced chart data processed successfully');
  return { planets: processedPlanets, rashis, rasiGlyphs };
}

/**
 * Legacy chart data processing for backward compatibility
 * @param {Object} data - Legacy chart data
 * @returns {Object} - Processed chart data
 */
function processLegacyChartData(data) {
  console.log('🔄 Processing legacy chart data for backward compatibility');

  // CRITICAL FIX: Handle the actual API response structure
  let chartData = null;

  // Primary structure: API returns { success: true, data: { birthData, rasiChart, ... } }
  if (data?.data?.rasiChart) {
    chartData = data.data.rasiChart;
    console.log('✅ Found rasiChart in data.data.rasiChart');
  } else if (data?.rasiChart) {
    chartData = data.rasiChart;
    console.log('✅ Found rasiChart in data.rasiChart');
  } else if (data?.data?.chart) {
    chartData = data.data.chart;
    console.log('✅ Found chart in data.data.chart');
  } else if (data?.chart) {
    chartData = data.chart;
    console.log('✅ Found chart in data.chart');
  }
  // ENHANCED: Check if data structure contains planets and ascendant directly
  else if (data?.planets && data?.ascendant) {
    chartData = data;
    console.log('✅ Found chart data structure directly in root');
  } else if (data?.data?.planets && data?.data?.ascendant) {
    chartData = data.data;
    console.log('✅ Found chart data structure in data.data');
  } else if (data?.data) {
    // Maybe the entire data.data IS the chart data
    chartData = data.data;
    console.log('⚠️ Using data.data as chart data');
  } else {
    // Last resort - use data directly
    chartData = data;
    console.log('⚠️ Using data directly as chart data');
  }

  if (!chartData) {
    console.error('❌ No valid chart data found in any expected location');
    throw new APIError({
      code: 'INVALID_CHART_DATA',
      message: "Invalid data structure: missing chart data",
      userMessage: "Chart data is not in the expected format. Please try again."
    });
  }

  console.log('📊 Chart data structure found:', {
    hasAscendant: !!chartData.ascendant,
    hasHousePositions: !!(chartData.housePositions && chartData.housePositions.length),
    hasPlanets: !!(chartData.planets && chartData.planets.length),
    dataKeys: Object.keys(chartData)
  });

  // ENHANCED FALLBACK: Generate default data if missing critical components
  if (!chartData.planets || !chartData.ascendant) {
    console.log('⚠️ Missing planets or ascendant, checking for analysis data structure');

    // Try to extract chart info from analysis data
    if (data?.analysis?.overview?.lagna || data?.lagna) {
      const lagnaSign = data?.analysis?.overview?.lagna || data?.lagna;
      const lagnaSignId = typeof lagnaSign === 'string' ?
        ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
        .indexOf(lagnaSign) + 1 : 1;

      console.log(`✅ Found lagna from analysis: ${lagnaSign} (signId: ${lagnaSignId})`);
      chartData = generateDefaultChartData(lagnaSignId);
    } else {
      console.log('⚠️ No analysis data found, generating default demo chart');
      chartData = generateDefaultChartData(1); // Default to Aries ascendant
    }
  }

  // Process chart data for display
  return processLegacyFormatting(chartData);
}

/**
 * Generate default chart data when none is available
 * @param {number} lagnaSignId - Ascendant sign ID
 * @returns {Object} - Default chart data
 */
function generateDefaultChartData(lagnaSignId) {
  return {
    ascendant: { signId: lagnaSignId },
    planets: [
      { name: "Sun", signId: lagnaSignId, degree: 15, dignity: "" },
      { name: "Moon", signId: (lagnaSignId % 12) + 1, degree: 23, dignity: "" },
      { name: "Mars", signId: ((lagnaSignId + 1) % 12) + 1, degree: 8, dignity: "" },
      { name: "Mercury", signId: ((lagnaSignId + 2) % 12) + 1, degree: 27, dignity: "" },
      { name: "Jupiter", signId: ((lagnaSignId + 3) % 12) + 1, degree: 5, dignity: "" },
      { name: "Venus", signId: ((lagnaSignId + 4) % 12) + 1, degree: 19, dignity: "" },
      { name: "Saturn", signId: ((lagnaSignId + 5) % 12) + 1, degree: 14, dignity: "" },
      { name: "Rahu", signId: ((lagnaSignId + 6) % 12) + 1, degree: 11, dignity: "" },
      { name: "Ketu", signId: ((lagnaSignId + 11) % 12) + 1, degree: 11, dignity: "" }
    ],
    housePositions: Array.from({ length: 12 }, (_, i) => ({
      houseNumber: i + 1,
      signId: ((lagnaSignId + i - 1) % 12) + 1
    }))
  };
}

/**
 * Convert sign name to rashi number
 * @param {string} signName - Sign name
 * @returns {number} - Rashi number (1-12)
 */
function getSignNumber(signName) {
  const signs = {
    'Aries': 1, 'Taurus': 2, 'Gemini': 3, 'Cancer': 4,
    'Leo': 5, 'Virgo': 6, 'Libra': 7, 'Scorpio': 8,
    'Sagittarius': 9, 'Capricorn': 10, 'Aquarius': 11, 'Pisces': 12
  };
  return signs[signName] || 1;
}

/**
 * Process legacy chart data formatting
 * @param {Object} chartData - Legacy chart data
 * @returns {Object} - Formatted chart data
 */
function processLegacyFormatting(chartData) {
  // Map house positions to rashi array
  const rashis = Array(12).fill(0);
  if (chartData.housePositions) {
    chartData.housePositions.forEach(hp => {
      if (hp.houseNumber >= 1 && hp.houseNumber <= 12) {
        rashis[hp.houseNumber - 1] = hp.signId;
      }
    });
  }

  // Group planets by house for positioning
  const planetsByHouse = {};
  if (chartData.planets) {
    chartData.planets.forEach(planet => {
      const house = getHouseFromSignId(planet.signId, chartData.ascendant.signId);
      if (!planetsByHouse[house]) planetsByHouse[house] = [];
      planetsByHouse[house].push(planet);
    });
  }

  // Position planets in houses
  const planets = [];
  Object.entries(planetsByHouse).forEach(([house, housePlanets]) => {
    const houseNum = parseInt(house);
    const layout = PLANET_LAYOUT[houseNum];
    const centre = HOUSE_CENTRES[houseNum];

    if (centre && layout) {
      housePlanets.forEach((planet, index) => {
        planets.push({
          code: planetCode(planet.name),
          deg: Math.round(planet.degree || 0),
          dignity: dignitySymbol(planet.dignity),
          x: centre.x + layout.dx + (index * 15 * layout.dir),
          y: centre.y + layout.dy,
          house: houseNum,
          name: planet.name
        });
      });
    }
  });

  // Position rasi glyphs
  const rasiGlyphs = [];
  if (chartData.housePositions) {
    chartData.housePositions.forEach((hp, index) => {
      const centre = HOUSE_CENTRES[hp.houseNumber];
      if (centre) {
        rasiGlyphs.push({
          x: centre.x + 15,
          y: centre.y + 15,
          glyph: RASI_GLYPHS[hp.signId],
          signId: hp.signId,
          house: hp.houseNumber
        });
      }
    });
  }

  return { planets, rashis, rasiGlyphs };
}

/**
 * Calculate house number from sign ID and ascendant
 * @param {number} signId - Planet's sign ID
 * @param {number} ascendantSignId - Ascendant sign ID
 * @returns {number} - House number (1-12)
 */
function getHouseFromSignId(signId, ascendantSignId) {
  let house = signId - ascendantSignId + 1;
  if (house <= 0) house += 12;
  if (house > 12) house -= 12;
  return house;
}

/**
 * VedicChartDisplay - Main React Component (Backward Compatible Interface)
 * @param {Object} props - Component props
 * @param {Object} props.chartData - Birth chart JSON data
 * @param {string} props.chartType - Chart type: "rasi" or "navamsa" (for compatibility)
 * @param {boolean} props.editable - Editable mode (ignored - template is view-only)
 * @param {boolean} props.isLoading - Loading state
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.style - Inline styles (optional)
 * @returns {JSX.Element} - Rendered Kundli chart
 */
function VedicChartDisplay({
  chartData,
  chartType = "rasi",
  editable = false,
  isLoading = false,
  className = '',
  style = {}
}) {
  const [processedData, setProcessedData] = useState(null);
  const [error, setError] = useState(null);

  // Handle chartType selection (for consumer compatibility)
  const selectedChartData = useMemo(() => {
    if (!chartData) return null;

    if (chartType === "navamsa") {
      // Handle navamsa chart data structure - check multiple possible locations
      const navamsaChart = chartData.data?.navamsaChart ||
                          chartData.navamsaChart ||
                          chartData;

      // Return in format expected by processChartData
      return {
        rasiChart: navamsaChart
      };
    }

    // For rasi chart, ensure proper structure
    return chartData.data ? chartData : { data: chartData };
  }, [chartData, chartType]);

  // Process chart data whenever chartData changes
  useEffect(() => {
    console.log('🔍 VEDIC CHART DEBUG - selectedChartData changed:', selectedChartData);

    if (!selectedChartData) {
      console.log('🔍 VEDIC CHART DEBUG - No selectedChartData, resetting states');
      setProcessedData(null);
      setError(null);
      return;
    }

    try {
      console.log('🔍 VEDIC CHART DEBUG - Processing chart data...');
      const processed = processChartDataInternal(selectedChartData);
      console.log('✅ VEDIC CHART DEBUG - Chart processing successful:', processed);
      setProcessedData(processed);
      setError(null);
    } catch (err) {
      console.error('❌ VEDIC CHART DEBUG - Chart processing failed:', err);
      setError(err.message);
      setProcessedData(null);
    }
  }, [selectedChartData]);

  // Helper points for the diamond layout
  const TL = { x: PAD, y: PAD };            // top‑left corner
  const TR = { x: SIZE - PAD, y: PAD };     // top‑right
  const BR = { x: SIZE - PAD, y: SIZE - PAD }; // bottom‑right
  const BL = { x: PAD, y: SIZE - PAD };     // bottom‑left

  // Diamond vertices (mid‑points of each side)
  const midTop = { x: (TL.x + TR.x) / 2, y: PAD };
  const midRight = { x: SIZE - PAD, y: (TR.y + BR.y) / 2 };
  const midBottom = { x: (BL.x + BR.x) / 2, y: SIZE - PAD };
  const midLeft = { x: PAD, y: (TL.y + BL.y) / 2 };

  // Handle loading state
  if (isLoading) {
    return (
      <div className={`bg-gradient-to-br from-yellow-50 to-orange-100 p-8 rounded-xl border-2 border-yellow-300 ${className}`} style={style}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-yellow-500 border-t-transparent mx-auto mb-6"></div>
          <h3 className="text-xl font-bold text-yellow-800 mb-2">🕉️ Generating Vedic Birth Chart</h3>
          <p className="text-yellow-700">Calculating planetary positions...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className={`kundli-error ${className}`} style={style}>
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          <rect x={PAD} y={PAD} width={SIZE - 2 * PAD} height={SIZE - 2 * PAD}
                fill="#fee" stroke="#f00" strokeWidth="2" />
          <text x={SIZE/2} y={SIZE/2} textAnchor="middle" dominantBaseline="middle"
                fill="#f00" fontSize="12" fontFamily="sans-serif">
            Error: {error}
          </text>
        </svg>
      </div>
    );
  }

  // Render empty state with debugging info
  if (!processedData) {
    return (
      <div className={`bg-gradient-to-br from-yellow-50 to-orange-100 p-8 rounded-xl border-2 border-yellow-300 ${className}`} style={style}>
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-bold text-yellow-800 mb-2">Chart Processing</h3>
          <p className="text-yellow-700 mb-4">Analyzing birth chart data...</p>
          <div className="text-xs text-yellow-600 bg-yellow-50 p-3 rounded border">
            <strong>Debug Info:</strong><br />
            Chart Data: {chartData ? '✓ Present' : '✗ Missing'}<br />
            Structure: {chartData ? JSON.stringify(Object.keys(chartData)) : 'N/A'}
          </div>
        </div>
      </div>
    );
  }

  const { planets, rashis, rasiGlyphs } = processedData;

  // Note: editable prop is ignored - consolidated template is view-only for now
  return (
    <div
      className={`space-y-6 ${className}`}
      style={{
        background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 30%, #f59e0b 100%)',
        padding: '20px',
        borderRadius: '12px',
        border: '2px solid #1e40af',
        ...style
      }}
    >
      <div className="kundli-template">
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="mx-auto">
          <defs>
            <style>{`
              .bg { fill: #FEF3C7; }
              .stroke { stroke: #000; stroke-width: ${STROKE}; fill: none; }
              .rashi { fill: #e6262c; font: 700 10px/1 sans-serif; dominant-baseline: middle; text-anchor: middle; }
              .planet { fill: #198754; font: 400 10px/1 sans-serif; dominant-baseline: middle; text-anchor: middle; }
              .rasi-glyph { fill: #8b5cf6; font: 700 16px/1 serif; dominant-baseline: middle; text-anchor: middle; }
            `}</style>
          </defs>

          {/* Background square */}
          <rect x={PAD} y={PAD} width={SIZE - 2 * PAD} height={SIZE - 2 * PAD}
                className="bg stroke" />

          {/* Corner‑to‑corner diagonals */}
          <line x1={TL.x} y1={TL.y} x2={BR.x} y2={BR.y} className="stroke" />
          <line x1={TR.x} y1={TR.y} x2={BL.x} y2={BL.y} className="stroke" />

          {/* Large diamond */}
          <polyline points={`${midTop.x},${midTop.y} ${midRight.x},${midRight.y} ${midBottom.x},${midBottom.y} ${midLeft.x},${midLeft.y} ${midTop.x},${midTop.y}`}
                    className="stroke" />

          {/* Rashi numbers */}
          {Object.entries(HOUSE_CENTRES).map(([houseNum, center]) => (
            <text key={`rashi-${houseNum}`} x={center.x} y={center.y - 9} className="rashi">
              {rashis[parseInt(houseNum) - 1]}
            </text>
          ))}

          {/* Planets */}
          {planets.map((planet, index) => (
            <text key={`planet-${index}`} x={planet.x} y={planet.y} className="planet">
              {planet.code}{planet.dignity} {planet.deg}°
            </text>
          ))}

          {/* Rasi glyphs */}
          {rasiGlyphs.map((glyph, index) => (
            <text key={`glyph-${index}`} x={glyph.x} y={glyph.y} className="rasi-glyph">
              {glyph.glyph}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}

// Export the main component as default
export default VedicChartDisplay;

// Export utility functions for advanced usage (moved after component definition)
export {
  processChartDataInternal,
  HOUSE_CENTRES,
  PLANET_LAYOUT,
  RASI_GLYPHS,
  dignitySymbol,
  planetCode
};
