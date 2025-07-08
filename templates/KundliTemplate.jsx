import React, { useState, useEffect } from "react";

/**
 * KundliTemplate.jsx - Consolidated Kundli Template Component
 * ------------------------------------------------------------
 * A complete, generic, reusable Kundli template that combines:
 * - North Indian diamond layout frame
 * - Planetary data processing and positioning
 * - Rasi glyph positioning with custom adjustments
 * - Dynamic updates based on JSON data changes
 * 
 * Can be easily plugged into different projects with the same JSON structure
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
  if (!data?.data?.rasiChart) {
    throw new Error("Invalid data structure: missing data.rasiChart");
  }

  const ascendant = data.data.rasiChart.ascendant?.signId || 
                    (data.data.rasiChart.ascendant?.signIndex !== undefined ? 
                     data.data.rasiChart.ascendant.signIndex + 1 : null);
  if (!ascendant) {
    throw new Error("Missing ascendant information");
  }

  // Create complete sign to house mapping
  const signToHouse = {};
  const housePositions = data.data.rasiChart.housePositions || [];
  
  // First, map direct house cusp positions
  housePositions.forEach(hp => {
    signToHouse[hp.signId] = hp.houseNumber;
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
  const planets = data.data.rasiChart.planets.map(planet => {
    // Use the sign-to-house mapping from housePositions
    const house = signToHouse[planet.signId];
    if (!house) {
      throw new Error(`Cannot determine house for planet ${planet.name} in sign ${planet.signId}`);
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
}

/**
 * KundliTemplate - Main React Component
 * @param {Object} props - Component props
 * @param {Object} props.chartData - Birth chart JSON data
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.style - Inline styles
 * @returns {JSX.Element} - Rendered Kundli chart
 */
export default function KundliTemplate({ chartData, className = "", style = {} }) {
  const [processedData, setProcessedData] = useState(null);
  const [error, setError] = useState(null);

  // Process chart data whenever chartData changes
  useEffect(() => {
    if (!chartData) {
      setProcessedData(null);
      setError(null);
      return;
    }

    try {
      const processed = processChartData(chartData);
      setProcessedData(processed);
      setError(null);
    } catch (err) {
      setError(err.message);
      setProcessedData(null);
    }
  }, [chartData]);

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

  // Render empty state
  if (!processedData) {
    return (
      <div className={`kundli-empty ${className}`} style={style}>
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          <defs>
            <style>{`
              .bg { fill: #FEF3C7; }
              .stroke { stroke: #000; stroke-width: ${STROKE}; fill: none; }
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
          
          <text x={SIZE/2} y={SIZE/2} textAnchor="middle" dominantBaseline="middle" 
                fill="#999" fontSize="14" fontFamily="sans-serif">
            No Chart Data
          </text>
        </svg>
      </div>
    );
  }

  const { planets, rashis, rasiGlyphs } = processedData;

  return (
    <div className={`kundli-template ${className}`} style={style}>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
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
  );
}

// Export utility functions for advanced usage
export {
  processChartData,
  HOUSE_CENTRES,
  PLANET_LAYOUT,
  RASI_GLYPHS,
  dignitySymbol,
  planetCode
}; 