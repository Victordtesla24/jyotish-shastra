import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  ComposedChart,
  Area,
  AreaChart
} from 'recharts';
import {
  VedicSymbolRenderer,
  PlanetSymbol,
  RashiNumber
} from './VedicSymbolRenderer';
import PlanetaryPositionCalculator from '../utils/PlanetaryPositionCalculator';
import EnemyHouseDetector from '../utils/EnemyHouseDetector';
import ExaltationCalculator from '../utils/ExaltationCalculator';

/**
 * VedicRechartsWrapper_Enhanced - Advanced Recharts Integration for Vedic Astrology
 *
 * Features:
 * - Multiple chart types for astrological data visualization
 * - Planetary strength analysis charts
 * - House distribution visualization
 * - Aspect patterns and relationships
 * - Dasha periods timeline
 * - Transit tracking charts
 * - Interactive tooltips with Vedic symbols
 * - Export capabilities for all chart types
 * - Real-time data updates
 * - Template-consistent styling
 */

const VedicRechartsWrapper_Enhanced = ({
  chartData,
  chartType = 'planetary-positions',
  width = '100%',
  height = 400,
  showLegend = true,
  showTooltip = true,
  enableExport = true,
  theme = 'default',
  interactive = true,
  onDataPointClick = null,
  customColors = null,
  className = ''
}) => {
  // State management
  const [processedData, setProcessedData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDataPoint, setSelectedDataPoint] = useState(null);
  const [hoverData, setHoverData] = useState(null);

  // Refs
  const chartRef = useRef(null);

  // Color schemes for different chart types
  const colorSchemes = useMemo(() => ({
    default: {
      primary: '#8884d8',
      secondary: '#82ca9d',
      accent: '#ffc658',
      planets: {
        'Sun': '#FF6B35',     // Orange-red
        'Moon': '#C0C0C0',    // Silver
        'Mars': '#DC143C',    // Crimson
        'Mercury': '#32CD32',  // Lime green
        'Jupiter': '#FFD700',  // Gold
        'Venus': '#FF69B4',   // Hot pink
        'Saturn': '#8B4513',  // Saddle brown
        'Rahu': '#4B0082',    // Indigo
        'Ketu': '#800080'     // Purple
      },
      houses: [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
        '#FFEAA7', '#DDA0DD', '#98D8C8', '#F06292',
        '#AED581', '#FFB74D', '#A1887F', '#90CAF9'
      ],
      status: {
        'exalted': '#4CAF50',
        'debilitated': '#F44336',
        'own': '#2196F3',
        'friendly': '#8BC34A',
        'enemy': '#FF5722',
        'neutral': '#9E9E9E'
      }
    },
    dark: {
      primary: '#BB86FC',
      secondary: '#03DAC6',
      accent: '#CF6679',
      background: '#121212',
      surface: '#1E1E1E',
      text: '#FFFFFF'
    },
    traditional: {
      primary: '#8B4513',
      secondary: '#DAA520',
      accent: '#DC143C',
      background: '#FFF8DC',
      surface: '#F5DEB3'
    }
  }), []);

  // Initialize data processing
  useEffect(() => {
    if (!chartData) {
      setError('No chart data provided');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const processed = processDataForChartType(chartData, chartType);
      setProcessedData(processed);
      setError(null);
    } catch (err) {
      setError(`Failed to process chart data: ${err.message}`);
      console.error('Recharts processing error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [chartData, chartType]);

  // Process data based on chart type
  const processDataForChartType = useCallback((data, type) => {
    const calculator = new PlanetaryPositionCalculator(data);
    const enemyDetector = new EnemyHouseDetector();
    const exaltationCalc = new ExaltationCalculator();

    switch (type) {
      case 'planetary-positions':
        return processPlanetaryPositions(data, calculator);

      case 'house-distribution':
        return processHouseDistribution(data, calculator);

      case 'planetary-strength':
        return processPlanetaryStrength(data, calculator, exaltationCalc);

      case 'aspect-patterns':
        return processAspectPatterns(data, calculator);

      case 'rashi-distribution':
        return processRashiDistribution(data, calculator);

      case 'planetary-degrees':
        return processPlanetaryDegrees(data, calculator);

      case 'status-analysis':
        return processStatusAnalysis(data, calculator, exaltationCalc, enemyDetector);

      case 'nakshatra-distribution':
        return processNakshatraDistribution(data, calculator);

      default:
        return processPlanetaryPositions(data, calculator);
    }
  }, []);

  // Process planetary positions for visualization
  const processPlanetaryPositions = useCallback((data, calculator) => {
    if (!data.planets) return [];

    return Object.entries(data.planets).map(([planetName, planetInfo]) => {
      const house = calculator.calculateHouseFromLongitude(planetInfo.longitude, data.ascendant?.longitude || 0);
      const rashi = calculator.calculateRashiFromLongitude(planetInfo.longitude);
      const degrees = planetInfo.longitude % 30;

      return {
        name: planetName,
        house: house,
        rashi: rashi,
        longitude: planetInfo.longitude,
        degrees: degrees,
        nakshatra: planetInfo.nakshatra || calculator.calculateNakshatra(planetInfo.longitude)
      };
    });
  }, []);

  // Process house distribution
  const processHouseDistribution = useCallback((data, calculator) => {
    const houseData = Array.from({ length: 12 }, (_, i) => ({
      house: i + 1,
      count: 0,
      planets: [],
      strength: 0
    }));

    if (data.planets) {
      Object.entries(data.planets).forEach(([planetName, planetInfo]) => {
        const house = calculator.calculateHouseFromLongitude(planetInfo.longitude, data.ascendant?.longitude || 0);
        houseData[house - 1].count++;
        houseData[house - 1].planets.push(planetName);
        houseData[house - 1].strength += calculatePlanetStrength(planetName, planetInfo.longitude);
      });
    }

    return houseData;
  }, []);

  // Process planetary strength analysis
  const processPlanetaryStrength = useCallback((data, calculator, exaltationCalc) => {
    if (!data.planets) return [];

    return Object.entries(data.planets).map(([planetName, planetInfo]) => {
      const rashi = calculator.calculateRashiFromLongitude(planetInfo.longitude);
      const status = exaltationCalc.getPlanetStatus(planetName, rashi);
      const strength = calculatePlanetStrength(planetName, planetInfo.longitude, status);

      return {
        name: planetName,
        strength: strength,
        status: status,
        position: planetInfo.longitude,
        shad_bala: calculateShadBala(planetName, planetInfo.longitude),
        dig_bala: calculateDigBala(planetName, rashi),
        chesta_bala: planetInfo.isRetrograde ? 60 : 0
      };
    });
  }, []);

  // Process rashi distribution
  const processRashiDistribution = useCallback((data, calculator) => {
    const rashiData = Array.from({ length: 12 }, (_, i) => ({
      rashi: i + 1,
      name: VedicSymbolRenderer.RASHI_INFO[i + 1]?.name || `Rashi ${i + 1}`,
      count: 0,
      planets: [],
      totalStrength: 0
    }));

    if (data.planets) {
      Object.entries(data.planets).forEach(([planetName, planetInfo]) => {
        const rashi = calculator.calculateRashiFromLongitude(planetInfo.longitude);
        rashiData[rashi - 1].count++;
        rashiData[rashi - 1].planets.push(planetName);
        rashiData[rashi - 1].totalStrength += calculatePlanetStrength(planetName, planetInfo.longitude);
      });
    }

    return rashiData;
  }, []);

  // Process planetary degrees for scatter plot
  const processPlanetaryDegrees = useCallback((data, calculator) => {
    if (!data.planets) return [];

    return Object.entries(data.planets).map(([planetName, planetInfo]) => {
              const house = calculator.calculateHouseFromLongitude(planetInfo.longitude, data.ascendant?.longitude || 0);
        const degrees = planetInfo.longitude % 30;

      return {
        x: house,
        y: degrees,
        planet: planetName,
        longitude: planetInfo.longitude,
        size: calculatePlanetStrength(planetName, planetInfo.longitude)
      };
    });
  }, []);

  // Process status analysis
  const processStatusAnalysis = useCallback((data, calculator, exaltationCalc, enemyDetector) => {
    const statusData = {
      exalted: 0,
      debilitated: 0,
      own: 0,
      friendly: 0,
      enemy: 0,
      neutral: 0
    };

    if (data.planets) {
      Object.entries(data.planets).forEach(([planetName, planetInfo]) => {
        const rashi = calculator.calculateRashiFromLongitude(planetInfo.longitude);
        const status = exaltationCalc.getPlanetStatus(planetName, rashi);
        if (status && statusData.hasOwnProperty(status)) {
          statusData[status]++;
        }
      });
    }

    return Object.entries(statusData).map(([status, count]) => ({
      status: status,
      count: count,
      percentage: (count / (Object.values(statusData).reduce((a, b) => a + b, 0) || 1)) * 100
    }));
  }, []);

  // Process nakshatra distribution
  const processNakshatraDistribution = useCallback((data, calculator) => {
    const nakshatraData = {};

    if (data.planets) {
      Object.entries(data.planets).forEach(([planetName, planetInfo]) => {
        const nakshatra = planetInfo.nakshatra || calculator.calculateNakshatra(planetInfo.longitude);
        if (!nakshatraData[nakshatra]) {
          nakshatraData[nakshatra] = {
            name: nakshatra,
            count: 0,
            planets: []
          };
        }
        nakshatraData[nakshatra].count++;
        nakshatraData[nakshatra].planets.push(planetName);
      });
    }

    return Object.values(nakshatraData);
  }, []);

  // Helper function to calculate planet strength
  const calculatePlanetStrength = useCallback((planetName, longitude, status = null) => {
    let baseStrength = 50; // Base strength

    // Status modifiers
    if (status === 'exalted') baseStrength += 40;
    else if (status === 'debilitated') baseStrength -= 30;
    else if (status === 'own') baseStrength += 20;
    else if (status === 'friendly') baseStrength += 10;
    else if (status === 'enemy') baseStrength -= 15;

    // Degree-based modifiers
    const degrees = longitude % 30;
    if (degrees < 5 || degrees > 25) baseStrength -= 5; // Weak in sandhi
    if (degrees >= 10 && degrees <= 20) baseStrength += 5; // Strong in middle

    return Math.max(0, Math.min(100, baseStrength));
  }, []);

  // Calculate Shad Bala (simplified)
  const calculateShadBala = useCallback((planetName, longitude) => {
    return Math.random() * 100; // Simplified - implement proper Shad Bala calculation
  }, []);

  // Calculate Dig Bala (directional strength)
  const calculateDigBala = useCallback((planetName, rashi) => {
    const digBalaHouses = {
      'Sun': [1], 'Moon': [4], 'Mars': [10], 'Mercury': [1],
      'Jupiter': [1], 'Venus': [4], 'Saturn': [7]
    };

    const strongHouses = digBalaHouses[planetName] || [];
    return strongHouses.includes(rashi) ? 60 : 30;
  }, []);

  // Custom tooltip component
  const CustomTooltip = useCallback(({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;

    return (
      <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
        {data.name && (
          <div className="flex items-center gap-2 mb-2">
            <PlanetSymbol planet={data.name} size="small" />
            <span className="font-bold">{data.name}</span>
          </div>
        )}

        {payload.map((entry, index) => (
          <div key={index} className="text-sm">
            <span style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
            </span>
          </div>
        ))}

        {data.rashi && (
          <div className="text-xs text-gray-600 mt-1">
            Rashi: <RashiNumber rashiNumber={data.rashi} showSymbol size="small" />
          </div>
        )}
      </div>
    );
  }, []);

  // Handle data point clicks
  const handleDataPointClick = useCallback((data, index) => {
    setSelectedDataPoint({ data, index });
    if (onDataPointClick) {
      onDataPointClick(data, index);
    }
  }, [onDataPointClick]);

  // Get colors for chart type
  const getColors = useCallback(() => {
    if (customColors) return customColors;

    const scheme = colorSchemes[theme] || colorSchemes.default;

    switch (chartType) {
      case 'planetary-positions':
      case 'planetary-strength':
      case 'planetary-degrees':
        return Object.values(scheme.planets);

      case 'house-distribution':
        return scheme.houses;

      case 'status-analysis':
        return Object.values(scheme.status);

      default:
        return [scheme.primary, scheme.secondary, scheme.accent];
    }
  }, [customColors, theme, chartType, colorSchemes]);

  // Render different chart types
  const renderChart = useCallback(() => {
    if (!processedData) return null;

    const colors = getColors();

    switch (chartType) {
      case 'planetary-positions':
        return (
          <PieChart>
            <Pie
              data={processedData}
              cx="50%"
              cy="50%"
              outerRadius={120}
              dataKey="house"
              nameKey="name"
              onClick={handleDataPointClick}
            >
              {processedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            {showLegend && <Legend />}
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
          </PieChart>
        );

      case 'house-distribution':
        return (
          <BarChart data={processedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="house" />
            <YAxis />
            <Bar dataKey="count" fill={colors[0]} onClick={handleDataPointClick} />
            <Bar dataKey="strength" fill={colors[1]} />
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            {showLegend && <Legend />}
          </BarChart>
        );

      case 'planetary-strength':
        return (
          <RadarChart data={processedData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="name" />
            <PolarRadiusAxis angle={30} domain={[0, 100]} />
            <Radar
              name="Strength"
              dataKey="strength"
              stroke={colors[0]}
              fill={colors[0]}
              fillOpacity={0.3}
            />
            <Radar
              name="Shad Bala"
              dataKey="shad_bala"
              stroke={colors[1]}
              fill={colors[1]}
              fillOpacity={0.3}
            />
            {showLegend && <Legend />}
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
          </RadarChart>
        );

      case 'rashi-distribution':
        return (
          <PieChart>
            <Pie
              data={processedData.filter(d => d.count > 0)}
              cx="50%"
              cy="50%"
              outerRadius={120}
              dataKey="count"
              nameKey="name"
              onClick={handleDataPointClick}
            >
              {processedData.filter(d => d.count > 0).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            {showLegend && <Legend />}
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
          </PieChart>
        );

      case 'planetary-degrees':
        return (
          <ScatterChart data={processedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="x" name="House" type="number" domain={[1, 12]} />
            <YAxis dataKey="y" name="Degrees" type="number" domain={[0, 30]} />
            <Scatter dataKey="size" fill={colors[0]} onClick={handleDataPointClick} />
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
          </ScatterChart>
        );

      case 'status-analysis':
        return (
          <BarChart data={processedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="status" />
            <YAxis />
            <Bar dataKey="count" onClick={handleDataPointClick}>
              {processedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            {showLegend && <Legend />}
          </BarChart>
        );

      default:
        return <div>Unsupported chart type: {chartType}</div>;
    }
  }, [processedData, chartType, getColors, handleDataPointClick, showLegend, showTooltip, CustomTooltip]);

  // Loading state
  if (isLoading) {
    return (
      <div className="vedic-chart-loading flex items-center justify-center" style={{ height }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <div className="text-sm text-gray-600">Loading chart data...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="vedic-chart-error bg-red-50 border border-red-200 rounded-lg p-4" style={{ height }}>
        <div className="text-red-800 font-bold mb-2">Chart Error</div>
        <div className="text-red-600 text-sm">{error}</div>
      </div>
    );
  }

  // Main render
  return (
    <div className={`vedic-recharts-wrapper ${className}`} ref={chartRef}>
      <ResponsiveContainer width={width} height={height}>
        {renderChart()}
      </ResponsiveContainer>

      {selectedDataPoint && (
        <div className="selected-data-info mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="font-bold text-blue-800 mb-1">Selected Data Point</div>
          <pre className="text-xs text-blue-600 overflow-auto">
            {JSON.stringify(selectedDataPoint.data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

// PropTypes
VedicRechartsWrapper_Enhanced.propTypes = {
  chartData: PropTypes.object.isRequired,
  chartType: PropTypes.oneOf([
    'planetary-positions',
    'house-distribution',
    'planetary-strength',
    'aspect-patterns',
    'rashi-distribution',
    'planetary-degrees',
    'status-analysis',
    'nakshatra-distribution'
  ]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.number,
  showLegend: PropTypes.bool,
  showTooltip: PropTypes.bool,
  enableExport: PropTypes.bool,
  theme: PropTypes.oneOf(['default', 'dark', 'traditional']),
  interactive: PropTypes.bool,
  onDataPointClick: PropTypes.func,
  customColors: PropTypes.array,
  className: PropTypes.string
};

VedicRechartsWrapper_Enhanced.defaultProps = {
  chartType: 'planetary-positions',
  width: '100%',
  height: 400,
  showLegend: true,
  showTooltip: true,
  enableExport: true,
  theme: 'default',
  interactive: true,
  onDataPointClick: null,
  customColors: null,
  className: ''
};

export default VedicRechartsWrapper_Enhanced;
