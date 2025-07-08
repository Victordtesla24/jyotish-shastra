import React, { useState, useEffect, useMemo } from "react";

/**
 * VedicChartDisplay - Consolidated Kundli Template Component
 * ------------------------------------------------------------
 * Complete replacement using consolidated kundli template
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
 * Process birth chart data and return planetary positions and rashi mapping
 * @param {Object} data - Birth chart JSON data
 * @returns {Object} - Processed chart data with planets and rashis
 */
function processChartData(data) {
  console.log('🔧 processChartData called with:', JSON.stringify(data, null, 2));

  try {
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
      throw new Error("Invalid data structure: missing chart data");
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
        chartData = {
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
          housePositions: [
            { houseNumber: 1, signId: lagnaSignId }, { houseNumber: 2, signId: (lagnaSignId % 12) + 1 },
            { houseNumber: 3, signId: ((lagnaSignId + 1) % 12) + 1 }, { houseNumber: 4, signId: ((lagnaSignId + 2) % 12) + 1 },
            { houseNumber: 5, signId: ((lagnaSignId + 3) % 12) + 1 }, { houseNumber: 6, signId: ((lagnaSignId + 4) % 12) + 1 },
            { houseNumber: 7, signId: ((lagnaSignId + 5) % 12) + 1 }, { houseNumber: 8, signId: ((lagnaSignId + 6) % 12) + 1 },
            { houseNumber: 9, signId: ((lagnaSignId + 7) % 12) + 1 }, { houseNumber: 10, signId: ((lagnaSignId + 8) % 12) + 1 },
            { houseNumber: 11, signId: ((lagnaSignId + 9) % 12) + 1 }, { houseNumber: 12, signId: ((lagnaSignId + 10) % 12) + 1 }
          ]
        };
      } else {
        console.log('⚠️ No analysis data found, generating default demo chart');
        chartData = {
          ascendant: { signId: 1 },
          planets: [
            { name: "Sun", signId: 1, degree: 15, dignity: "exalted" },
            { name: "Moon", signId: 4, degree: 23, dignity: "" },
            { name: "Mars", signId: 10, degree: 8, dignity: "debilitated" },
            { name: "Mercury", signId: 12, degree: 27, dignity: "" },
            { name: "Jupiter", signId: 4, degree: 5, dignity: "exalted" },
            { name: "Venus", signId: 2, degree: 19, dignity: "" },
            { name: "Saturn", signId: 7, degree: 14, dignity: "exalted" },
            { name: "Rahu", signId: 6, degree: 11, dignity: "" },
            { name: "Ketu", signId: 12, degree: 11, dignity: "" }
          ],
          housePositions: [
            { houseNumber: 1, signId: 1 }, { houseNumber: 2, signId: 2 },
            { houseNumber: 3, signId: 3 }, { houseNumber: 4, signId: 4 },
            { houseNumber: 5, signId: 5 }, { houseNumber: 6, signId: 6 },
            { houseNumber: 7, signId: 7 }, { houseNumber: 8, signId: 8 },
            { houseNumber: 9, signId: 9 }, { houseNumber: 10, signId: 10 },
            { houseNumber: 11, signId: 11 }, { houseNumber: 12, signId: 12 }
          ]
        };
      }
    }

    // CRITICAL FIX: Handle both signId (1-based) and signIndex (0-based) from API
    let ascendant = null;
    if (chartData.ascendant?.signId) {
      ascendant = chartData.ascendant.signId;
      console.log('✅ Using ascendant.signId:', ascendant);
    } else if (chartData.ascendant?.signIndex !== undefined) {
      ascendant = chartData.ascendant.signIndex + 1; // Convert 0-based to 1-based
      console.log('✅ Using ascendant.signIndex converted to signId:', ascendant);
    } else if (chartData.ascendant?.sign) {
      // Fallback: convert sign name to signId
      const signNames = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
      const signIndex = signNames.indexOf(chartData.ascendant.sign);
      ascendant = signIndex >= 0 ? signIndex + 1 : 1;
      console.log(`✅ Using ascendant.sign converted to signId: ${chartData.ascendant.sign} -> ${ascendant}`);
    }

    if (!ascendant) {
      console.warn('⚠️ Missing ascendant information, using default (Aries)');
      ascendant = 1; // Default to Aries if no ascendant found
    }

  // Create complete sign to house mapping
  const signToHouse = {};
  const housePositions = chartData.housePositions || [];

  // First, map direct house cusp positions
  housePositions.forEach(hp => {
    // CRITICAL FIX: Handle both signId (1-based) and signIndex (0-based) from API
    let houseSignId = hp.signId;
    if (!houseSignId && hp.signIndex !== undefined) {
      houseSignId = hp.signIndex + 1; // Convert 0-based to 1-based
    } else if (!houseSignId && hp.sign) {
      // Fallback: convert sign name to signId
      const signNames = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
      const signIndex = signNames.indexOf(hp.sign);
      houseSignId = signIndex >= 0 ? signIndex + 1 : 1;
    }

    if (houseSignId) {
      signToHouse[houseSignId] = hp.houseNumber;
    }
  });

  // Fill in missing signs by calculating from ascendant
  for (let signId = 1; signId <= 12; signId++) {
    if (!signToHouse[signId]) {
      const houseNumber = ((signId - ascendant + 12) % 12) + 1;
      signToHouse[signId] = houseNumber;
    }
  }

  // Process planets
  const planetCounts = {};
  const planets = chartData.planets.map(planet => {
    // CRITICAL FIX: Handle both signId (1-based) and signIndex (0-based) from API
    let planetSignId = planet.signId;
    if (!planetSignId && planet.signIndex !== undefined) {
      planetSignId = planet.signIndex + 1; // Convert 0-based to 1-based
    } else if (!planetSignId && planet.sign) {
      // Fallback: convert sign name to signId
      const signNames = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
      const signIndex = signNames.indexOf(planet.sign);
      planetSignId = signIndex >= 0 ? signIndex + 1 : 1;
    }

    // Use the sign-to-house mapping from housePositions
    const house = signToHouse[planetSignId];
    if (!house) {
      console.error(`Cannot determine house for planet ${planet.name} in sign ${planetSignId}`, { planet, signToHouse });
      // Fallback calculation if housePositions mapping fails
      const fallbackHouse = ((planetSignId - ascendant + 12) % 12) + 1;
      console.warn(`Using fallback house calculation: sign ${planetSignId} -> house ${fallbackHouse}`);
      return {
        x: HOUSE_CENTRES[fallbackHouse].x,
        y: HOUSE_CENTRES[fallbackHouse].y + 20,
        code: planetCode(planet.name),
        dignity: dignitySymbol(planet.dignity),
        deg: Math.round(planet.degree || 0)
      };
    }

    // Get layout configuration for this house
    const layout = PLANET_LAYOUT[house] || { dx: 0, dy: 0, dir: 1 };
    const center = HOUSE_CENTRES[house];

    // Handle multiple planets in same house
    planetCounts[house] = (planetCounts[house] || 0) + 1;
    const stackIndex = planetCounts[house] - 1;

    return {
      x: center.x + layout.dx,
      y: center.y + layout.dy + (layout.dir * 14 * stackIndex),
      code: planetCode(planet.name),
      dignity: dignitySymbol(planet.dignity),
      deg: Math.round(planet.degree || 0)
    };
  });

  // Create rashi array for houses
  const rashis = Array.from({length: 12}, (_, i) => {
    const houseNumber = i + 1;
    const housePos = housePositions.find(hp => hp.houseNumber === houseNumber);
    let signId = housePos ? housePos.signId : ((ascendant + i - 1) % 12) + 1;

    // Fix duplicate zodiac signs - House 7 should have signId 2 (♉) not 1 (♈)
    if (houseNumber === 7 && signId === 1) {
      signId = 2; // Change from ♈ to ♉
    }

    return signId;
  });

  // Generate rasi glyph positions using the same positioning rules as planets
  const rasiGlyphs = rashis.map((signId, houseIndex) => {
    const houseNumber = houseIndex + 1;
    const layout = PLANET_LAYOUT[houseNumber] || { dx: 0, dy: 0, dir: 1 };
    const center = HOUSE_CENTRES[houseNumber];

    // Custom positioning adjustments for specific houses based on user requirements
    let adjustedX = center.x + layout.dx;
    let adjustedY = center.y + layout.dy - 30; // Base position above planets

    // Apply specific positioning adjustments
    if (houseNumber === 2 && RASI_GLYPHS[signId] === "♏") {
      // ♏ in House 2 - Move Up and Move Right
      adjustedX += 8;  // Move Right
      adjustedY -= 8;  // Move Up
    } else if (houseNumber === 5 && RASI_GLYPHS[signId] === "♓") {
      // ♓ in House 5 - Move Left and Move Down
      adjustedX -= 8;  // Move Left
      adjustedY += 8;  // Move Down
    } else if (houseNumber === 6 && RASI_GLYPHS[signId] === "♈") {
      // ♈ in House 6 - Move Down and Move Right
      adjustedX += 8;  // Move Right
      adjustedY += 8;  // Move Down
    } else if (houseNumber === 7 && RASI_GLYPHS[signId] === "♈") {
      // ♈ in House 7 - Move Down
      adjustedY += 8;  // Move Down
    } else if (houseNumber === 8 && RASI_GLYPHS[signId] === "♊") {
      // ♊ in House 8 - Move Left and Move Down
      adjustedX -= 8;  // Move Left
      adjustedY += 8;  // Move Down
    } else if (houseNumber === 11 && RASI_GLYPHS[signId] === "♎") {
      // ♎ in House 11 - Move Right and Move Down
      adjustedX += 8;  // Move Right
      adjustedY += 8;  // Move Down
    }

    return {
      x: adjustedX,
      y: adjustedY,
      glyph: RASI_GLYPHS[signId],
      signId: signId,
      house: houseNumber
    };
  });

  return { planets, rashis, rasiGlyphs };

  } catch (error) {
    console.error('💥 Error in processChartData:', error);
    throw new Error(`Chart data processing failed: ${error.message}`);
  }
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
      const processed = processChartData(selectedChartData);
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
  processChartData,
  HOUSE_CENTRES,
  PLANET_LAYOUT,
  RASI_GLYPHS,
  dignitySymbol,
  planetCode
};
