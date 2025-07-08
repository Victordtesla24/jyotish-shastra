import React from 'react';
import PropTypes from 'prop-types';

/**
 * VedicSymbolRenderer - Renders authentic Vedic symbols for planets, rashis, and nakshatras
 * 
 * Features:
 * - Traditional Sanskrit symbols for planets
 * - Rashi number display with proper formatting
 * - Nakshatra symbols and names
 * - Degree formatting in Vedic style
 * - Enemy/friendly house color coding
 * - Exaltation/debilitation indicators
 */

const VedicSymbolRenderer = {
  // Traditional Sanskrit symbols for planets
  PLANET_SYMBOLS: {
    'Sun': '☉',        // Surya
    'Moon': '☽',       // Chandra
    'Mars': '♂',       // Mangal
    'Mercury': '☿',    // Budh
    'Jupiter': '♃',    // Guru/Brihaspati
    'Venus': '♀',      // Shukra
    'Saturn': '♄',     // Shani
    'Rahu': '☊',       // North Node
    'Ketu': '☋',       // South Node
    'Uranus': '♅',     // Harshal
    'Neptune': '♆',    // Varun
    'Pluto': '♇'       // Yama
  },

  // Sanskrit names for planets
  PLANET_SANSKRIT_NAMES: {
    'Sun': 'सू',        // Surya
    'Moon': 'च',        // Chandra
    'Mars': 'मं',        // Mangal
    'Mercury': 'बु',     // Budh
    'Jupiter': 'गु',     // Guru
    'Venus': 'शु',       // Shukra
    'Saturn': 'श',       // Shani
    'Rahu': 'रा',        // Rahu
    'Ketu': 'के'         // Ketu
  },

  // Rashi symbols and numbers
  RASHI_INFO: {
    1: { name: 'मेष', symbol: '♈', sanskrit: 'Mesha' },      // Aries
    2: { name: 'वृष', symbol: '♉', sanskrit: 'Vrishabha' },  // Taurus
    3: { name: 'मिथुन', symbol: '♊', sanskrit: 'Mithuna' },   // Gemini
    4: { name: 'कर्क', symbol: '♋', sanskrit: 'Karka' },      // Cancer
    5: { name: 'सिंह', symbol: '♌', sanskrit: 'Simha' },      // Leo
    6: { name: 'कन्या', symbol: '♍', sanskrit: 'Kanya' },     // Virgo
    7: { name: 'तुला', symbol: '♎', sanskrit: 'Tula' },       // Libra
    8: { name: 'वृश्चिक', symbol: '♏', sanskrit: 'Vrishchika' }, // Scorpio
    9: { name: 'धनु', symbol: '♐', sanskrit: 'Dhanu' },       // Sagittarius
    10: { name: 'मकर', symbol: '♑', sanskrit: 'Makara' },     // Capricorn
    11: { name: 'कुंभ', symbol: '♒', sanskrit: 'Kumbha' },    // Aquarius
    12: { name: 'मीन', symbol: '♓', sanskrit: 'Meena' }       // Pisces
  },

  // Nakshatra symbols
  NAKSHATRA_SYMBOLS: {
    'Ashwini': '🐎',
    'Bharani': '🔥',
    'Krittika': '⚔️',
    'Rohini': '🌹',
    'Mrigashira': '🦌',
    'Ardra': '💧',
    'Punarvasu': '🏹',
    'Pushya': '🌾',
    'Ashlesha': '🐍',
    'Magha': '👑',
    'Purva Phalguni': '🛏️',
    'Uttara Phalguni': '☀️',
    'Hasta': '✋',
    'Chitra': '💎',
    'Swati': '🌪️',
    'Vishakha': '🌳',
    'Anuradha': '🌟',
    'Jyeshtha': '☂️',
    'Mula': '🌿',
    'Purva Ashadha': '🏺',
    'Uttara Ashadha': '🏔️',
    'Shravana': '👂',
    'Dhanishta': '🥁',
    'Shatabhisha': '⭐',
    'Purva Bhadrapada': '⚡',
    'Uttara Bhadrapada': '🐍',
    'Revati': '🐟'
  }
};

/**
 * Planet Symbol Component
 */
const PlanetSymbol = ({ planet, showSanskrit = false, showSymbol = true, size = 'medium' }) => {
  const sizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-lg',
    xlarge: 'text-xl'
  };

  const planetName = planet?.name || planet;
  const symbol = VedicSymbolRenderer.PLANET_SYMBOLS[planetName] || planetName?.[0] || '?';
  const sanskritName = VedicSymbolRenderer.PLANET_SANSKRIT_NAMES[planetName] || planetName?.slice(0, 2);

  if (showSanskrit) {
    return (
      <span className={`font-devanagari font-bold ${sizeClasses[size]}`} title={planetName}>
        {sanskritName}
      </span>
    );
  }

  return (
    <span 
      className={`planet-symbol ${sizeClasses[size]} font-bold`}
      title={planetName}
      style={{ fontFamily: 'Arial Unicode MS, serif' }}
    >
      {showSymbol ? symbol : planetName?.slice(0, 2)}
    </span>
  );
};

/**
 * Rashi Number Component
 */
const RashiNumber = ({ rashiNumber, showName = false, showSymbol = false, size = 'medium' }) => {
  const sizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-lg',
    xlarge: 'text-xl'
  };

  const rashiInfo = VedicSymbolRenderer.RASHI_INFO[rashiNumber];

  if (!rashiInfo) {
    return <span className={`${sizeClasses[size]}`}>{rashiNumber}</span>;
  }

  if (showName) {
    return (
      <span 
        className={`font-devanagari ${sizeClasses[size]}`}
        title={rashiInfo.sanskrit}
      >
        {rashiInfo.name}
      </span>
    );
  }

  if (showSymbol) {
    return (
      <span 
        className={`${sizeClasses[size]}`}
        title={`${rashiInfo.sanskrit} (${rashiNumber})`}
      >
        {rashiInfo.symbol}
      </span>
    );
  }

  return (
    <span 
      className={`rashi-number ${sizeClasses[size]} font-bold`}
      title={rashiInfo.sanskrit}
    >
      {rashiNumber}
    </span>
  );
};

/**
 * Degree Display Component
 */
const DegreeDisplay = ({ degrees, minutes = 0, seconds = 0, format = 'dms' }) => {
  const formatDegree = (deg, min, sec) => {
    switch (format) {
      case 'decimal':
        return `${(deg + min/60 + sec/3600).toFixed(2)}°`;
      case 'dm':
        return `${Math.floor(deg)}°${Math.floor(min)}'`;
      case 'dms':
      default:
        return `${Math.floor(deg)}°${Math.floor(min)}'${Math.floor(sec)}"`;
    }
  };

  return (
    <span className="degree-display text-xs text-gray-600">
      {formatDegree(degrees, minutes, seconds)}
    </span>
  );
};

/**
 * Planet Status Indicator
 */
const PlanetStatusIndicator = ({ planet, status }) => {
  const getStatusSymbol = (status) => {
    switch (status?.toLowerCase()) {
      case 'exalted':
        return '↑';
      case 'debilitated':
        return '↓';
      case 'own':
        return '⚬';
      case 'friendly':
        return '☺';
      case 'enemy':
        return '☹';
      case 'neutral':
        return '○';
      default:
        return '';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'exalted':
        return 'text-green-600';
      case 'debilitated':
        return 'text-red-600';
      case 'own':
        return 'text-blue-600';
      case 'friendly':
        return 'text-green-500';
      case 'enemy':
        return 'text-red-500';
      case 'neutral':
        return 'text-gray-500';
      default:
        return 'text-gray-400';
    }
  };

  if (!status) return null;

  return (
    <span 
      className={`planet-status ${getStatusColor(status)} text-xs ml-1`}
      title={`${planet?.name || planet} is ${status}`}
    >
      {getStatusSymbol(status)}
    </span>
  );
};

/**
 * Nakshatra Symbol Component
 */
const NakshatraSymbol = ({ nakshatra, showName = false }) => {
  const symbol = VedicSymbolRenderer.NAKSHATRA_SYMBOLS[nakshatra] || '⭐';

  if (showName) {
    return (
      <span className="nakshatra-name text-xs" title={nakshatra}>
        {nakshatra}
      </span>
    );
  }

  return (
    <span className="nakshatra-symbol text-xs" title={nakshatra}>
      {symbol}
    </span>
  );
};

/**
 * Composite Planet Display
 */
const CompositePlanetDisplay = ({ 
  planet, 
  degrees, 
  minutes = 0, 
  seconds = 0,
  status,
  nakshatra,
  showDegrees = true,
  showStatus = true,
  showSanskrit = false,
  format = 'symbol',
  size = 'medium'
}) => {
  return (
    <div className="composite-planet-display flex flex-col items-center space-y-1">
      <div className="planet-info flex items-center space-x-1">
        <PlanetSymbol 
          planet={planet} 
          showSanskrit={showSanskrit} 
          showSymbol={format === 'symbol'}
          size={size}
        />
        {showStatus && (
          <PlanetStatusIndicator planet={planet} status={status} />
        )}
      </div>

      {showDegrees && degrees !== undefined && (
        <DegreeDisplay 
          degrees={degrees} 
          minutes={minutes} 
          seconds={seconds} 
          format="dm"
        />
      )}

      {nakshatra && (
        <NakshatraSymbol nakshatra={nakshatra} />
      )}
    </div>
  );
};

/**
 * House Display Component
 */
const HouseDisplay = ({ 
  houseNumber, 
  rashiNumber, 
  planets = [], 
  showRashiName = false,
  showRashiSymbol = false,
  isEnemyHouse = false,
  isExaltedHouse = false,
  size = 'medium'
}) => {
  const houseClasses = [
    'house-display p-2 border rounded min-h-16 flex flex-col items-center justify-center',
    isEnemyHouse ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200',
    isExaltedHouse ? 'bg-green-50 border-green-200' : '',
    size === 'small' ? 'min-h-12 p-1' : '',
    size === 'large' ? 'min-h-20 p-3' : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={houseClasses}>
      <div className="house-header flex items-center space-x-2 mb-1">
        <span className="house-number text-xs text-gray-500">H{houseNumber}</span>
        <RashiNumber 
          rashiNumber={rashiNumber}
          showName={showRashiName}
          showSymbol={showRashiSymbol}
          size={size}
        />
      </div>

      <div className="planets-container flex flex-wrap gap-1 items-center justify-center">
        {planets.map((planet, index) => (
          <div key={index} className="planet-item">
            <CompositePlanetDisplay
              planet={planet.name}
              degrees={planet.longitude}
              status={planet.status}
              nakshatra={planet.nakshatra}
              size={size === 'large' ? 'medium' : 'small'}
              showDegrees={size !== 'small'}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// PropTypes for components
PlanetSymbol.propTypes = {
  planet: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  showSanskrit: PropTypes.bool,
  showSymbol: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium', 'large', 'xlarge'])
};

RashiNumber.propTypes = {
  rashiNumber: PropTypes.number.isRequired,
  showName: PropTypes.bool,
  showSymbol: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium', 'large', 'xlarge'])
};

DegreeDisplay.propTypes = {
  degrees: PropTypes.number.isRequired,
  minutes: PropTypes.number,
  seconds: PropTypes.number,
  format: PropTypes.oneOf(['decimal', 'dm', 'dms'])
};

CompositePlanetDisplay.propTypes = {
  planet: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  degrees: PropTypes.number,
  minutes: PropTypes.number,
  seconds: PropTypes.number,
  status: PropTypes.string,
  nakshatra: PropTypes.string,
  showDegrees: PropTypes.bool,
  showStatus: PropTypes.bool,
  showSanskrit: PropTypes.bool,
  format: PropTypes.oneOf(['symbol', 'text']),
  size: PropTypes.oneOf(['small', 'medium', 'large', 'xlarge'])
};

HouseDisplay.propTypes = {
  houseNumber: PropTypes.number.isRequired,
  rashiNumber: PropTypes.number.isRequired,
  planets: PropTypes.array,
  showRashiName: PropTypes.bool,
  showRashiSymbol: PropTypes.bool,
  isEnemyHouse: PropTypes.bool,
  isExaltedHouse: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium', 'large'])
};

// Export all components and utilities
export default VedicSymbolRenderer;

export {
  PlanetSymbol,
  RashiNumber,
  DegreeDisplay,
  PlanetStatusIndicator,
  NakshatraSymbol,
  CompositePlanetDisplay,
  HouseDisplay
};

// CSS styles to include in your main CSS file
export const vedicSymbolStyles = `
/* Vedic Symbol Renderer Styles */
.planet-symbol {
  display: inline-block;
  font-weight: bold;
  color: #2563eb;
}

.rashi-number {
  display: inline-block;
  font-weight: bold;
  color: #7c3aed;
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
  min-width: 20px;
  text-align: center;
}

.degree-display {
  font-family: 'Courier New', monospace;
  color: #6b7280;
  font-size: 10px;
}

.planet-status {
  font-weight: bold;
  font-size: 12px;
}

.house-display {
  transition: all 0.2s ease;
  position: relative;
}

.house-display:hover {
  transform: scale(1.02);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.planets-container {
  min-height: 30px;
  max-width: 100%;
  overflow: hidden;
}

.planet-item {
  margin: 1px;
  max-width: calc(50% - 2px);
}

/* Sanskrit font support */
.font-devanagari {
  font-family: 'Noto Sans Devanagari', 'Mangal', 'Kokila', serif;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .house-display {
    min-height: 50px;
    padding: 4px;
  }

  .rashi-number {
    padding: 1px 4px;
    font-size: 12px;
  }

  .planet-symbol {
    font-size: 12px;
  }
}

/* Print styles */
@media print {
  .house-display {
    border: 1px solid #000 !important;
    background: white !important;
  }

  .planet-symbol, .rashi-number {
    color: #000 !important;
  }
}
`;
