import React, { useState, useEffect, useRef } from 'react';
import RasiChart from './RasiChart';
import NavamsaChart from './NavamsaChart';

const ChartDisplay = ({ chartData, analysisType = 'comprehensive' }) => {
  const [activeChart, setActiveChart] = useState('rasi');
  const [isAnimating, setIsAnimating] = useState(false);
  const [hoveredPlanet, setHoveredPlanet] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const chartRef = useRef(null);

  useEffect(() => {
    // Trigger entrance animation when component mounts
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 1000);
    return () => clearTimeout(timer);
  }, [chartData]);

  if (!chartData) {
    return (
      <div className="chart-display-loading">
        <div className="card-celestial p-12 text-center">
          <div className="spinner-mandala mx-auto mb-6"></div>
          <h3 className="text-2xl font-cinzel font-semibold mb-4 text-vedic-text">
            Generating Sacred Charts
          </h3>
          <p className="text-vedic-text-light">
            Calculating planetary positions with ancient Vedic precision...
          </p>
          <div className="mt-6 flex justify-center space-x-2">
            <div className="w-2 h-2 bg-vedic-accent rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-vedic-accent rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-vedic-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  const chartTypes = [
    {
      id: 'rasi',
      name: 'Rashi Chart',
      sanskrit: 'राशि चक्र',
      description: 'Main birth chart showing planetary positions',
      icon: '🌟',
      component: RasiChart
    },
    {
      id: 'navamsa',
      name: 'Navamsa Chart',
      sanskrit: 'नवांश चक्र',
      description: 'Detailed chart for marriage and spirituality',
      icon: '💍',
      component: NavamsaChart
    }
  ];

  const currentChartType = chartTypes.find(type => type.id === activeChart);
  const ChartComponent = currentChartType?.component;

  // Enhanced planetary data with additional information
  const enhancedPlanets = chartData.planetaryPositions ? Object.entries(chartData.planetaryPositions).map(([planet, data]) => ({
    name: planet,
    ...data,
    displayName: getPlanetDisplayName(planet),
    element: getPlanetElement(planet),
    influence: getPlanetInfluence(planet),
    color: getPlanetColor(planet),
    emoji: getPlanetEmoji(planet)
  })) : [];

  function getPlanetDisplayName(planet) {
    const names = {
      sun: 'Sun (Surya)',
      moon: 'Moon (Chandra)',
      mars: 'Mars (Mangal)',
      mercury: 'Mercury (Budh)',
      jupiter: 'Jupiter (Guru)',
      venus: 'Venus (Shukra)',
      saturn: 'Saturn (Shani)',
      rahu: 'Rahu (North Node)',
      ketu: 'Ketu (South Node)'
    };
    return names[planet] || planet;
  }

  function getPlanetElement(planet) {
    const elements = {
      sun: 'Fire',
      moon: 'Water',
      mars: 'Fire',
      mercury: 'Earth',
      jupiter: 'Space',
      venus: 'Water',
      saturn: 'Air',
      rahu: 'Air',
      ketu: 'Fire'
    };
    return elements[planet] || 'Unknown';
  }

  function getPlanetInfluence(planet) {
    const influences = {
      sun: 'Soul, Authority, Father',
      moon: 'Mind, Emotions, Mother',
      mars: 'Energy, Courage, Action',
      mercury: 'Intelligence, Communication',
      jupiter: 'Wisdom, Spirituality, Guru',
      venus: 'Love, Beauty, Relationships',
      saturn: 'Discipline, Karma, Delays',
      rahu: 'Ambition, Materialism, Innovation',
      ketu: 'Spirituality, Detachment, Moksha'
    };
    return influences[planet] || 'Various influences';
  }

  function getPlanetColor(planet) {
    const colors = {
      sun: '#FFD700',
      moon: '#E6E6FA',
      mars: '#FF6B6B',
      mercury: '#98FB98',
      jupiter: '#FFE55C',
      venus: '#FFB6C1',
      saturn: '#4169E1',
      rahu: '#8B4513',
      ketu: '#FF8C00'
    };
    return colors[planet] || '#888888';
  }

  function getPlanetEmoji(planet) {
    const emojis = {
      sun: '☀️',
      moon: '🌙',
      mars: '🔴',
      mercury: '💚',
      jupiter: '🟡',
      venus: '💗',
      saturn: '🔵',
      rahu: '🟤',
      ketu: '🟠'
    };
    return emojis[planet] || '⭐';
  }

  const handleChartSwitch = (chartType) => {
    if (chartType !== activeChart) {
      setIsAnimating(true);
      setTimeout(() => {
        setActiveChart(chartType);
        setTimeout(() => setIsAnimating(false), 300);
      }, 200);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const downloadChart = async () => {
    if (!chartRef.current) return;

    try {
      // Create a canvas from the chart element
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const chartElement = chartRef.current;

      // Set canvas dimensions
      const rect = chartElement.getBoundingClientRect();
      canvas.width = rect.width * 2; // Higher resolution
      canvas.height = rect.height * 2;
      ctx.scale(2, 2);

      // Create SVG data URL for the chart
      const svgData = new XMLSerializer().serializeToString(chartElement);
      const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgData)}`;

      // Alternative: Simple approach using current chart data
      const chartTitle = `${currentChartType?.name || 'Vedic Chart'} - ${new Date().toLocaleDateString()}`;

      // Create download blob with chart information
      const chartInfo = {
        title: chartTitle,
        type: activeChart,
        timestamp: new Date().toISOString(),
        planetaryPositions: enhancedPlanets.map(p => ({
          name: p.displayName,
          sign: p.sign,
          degree: p.degree?.toFixed(1),
          dignity: p.dignity
        })),
        ascendant: chartData.ascendant
      };

      const dataStr = JSON.stringify(chartInfo, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });

      // Create download link
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${chartTitle.replace(/\s+/g, '_')}.json`;

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Show success feedback
      console.log('Chart data downloaded successfully');
    } catch (error) {
      console.error('Error downloading chart:', error);
    }
  };

  return (
    <div className={`chart-display-container ${isFullscreen ? 'fixed inset-0 z-50 bg-vedic-background' : ''}`}>
      <div className="vedic-container">
        {/* Enhanced Header */}
        <div className="chart-display-header">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4 animate-celestial-glow">🔮</div>
            <div className="font-devanagari text-xl mb-3 text-gradient-accent">
              ज्योतिष चक्र
            </div>
            <h2 className="text-3xl md:text-4xl font-cinzel font-bold text-vedic-text mb-4">
              Sacred Astrological Charts
            </h2>
            <p className="text-vedic-text-light max-w-2xl mx-auto">
              Explore your cosmic blueprint through ancient Vedic chart systems
            </p>
          </div>

          {/* Enhanced Chart Type Selection */}
          <div className="mb-8">
            <div className="flex flex-wrap justify-center gap-4">
              {chartTypes.map((chart) => (
                <button
                  key={chart.id}
                  className={`group relative px-6 py-4 rounded-2xl transition-all duration-300 ${
                    activeChart === chart.id
                      ? 'bg-gradient-vedic-primary text-white shadow-cosmic transform -translate-y-1'
                      : 'card-vedic hover-celestial'
                  }`}
                  onClick={() => handleChartSwitch(chart.id)}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl group-hover:scale-110 transition-transform duration-300">
                      {chart.icon}
                    </span>
                    <div className="text-left">
                      <div className="font-cinzel font-semibold">{chart.name}</div>
                      <div className="text-sm opacity-80 font-devanagari">{chart.sanskrit}</div>
                    </div>
                  </div>
                  {activeChart === chart.id && (
                    <div className="absolute inset-x-0 -bottom-2 h-1 bg-gradient-vedic-accent rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced Chart Display Area */}
        <div className={`chart-display-area ${isAnimating ? 'animating' : ''}`}>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

            {/* Main Chart Column */}
            <div className="xl:col-span-2">
              <div className="card-celestial overflow-hidden">
                <div className="bg-gradient-vedic-primary p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-cinzel font-bold flex items-center gap-3">
                        {currentChartType?.icon} {currentChartType?.name}
                      </h3>
                      <p className="opacity-90 mt-1">
                        {currentChartType?.description}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={toggleFullscreen}
                        className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors duration-200"
                        title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                      >
                        {isFullscreen ? '⤢' : '⛶'}
                      </button>
                      <button
                        onClick={downloadChart}
                        className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors duration-200"
                        title="Download Chart"
                      >
                        📥
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-8" ref={chartRef}>
                  {ChartComponent && (
                    <div className={`transition-all duration-500 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                      <ChartComponent
                        chartData={chartData}
                        onPlanetHover={setHoveredPlanet}
                        hoveredPlanet={hoveredPlanet}
                      />
                    </div>
                  )}
                </div>

                {/* Enhanced Chart Legend */}
                <div className="p-6 bg-vedic-background border-t border-vedic-border">
                  <h4 className="font-cinzel font-bold text-vedic-text mb-4">Chart Legend</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-lg">🏠</span>
                      <span className="text-vedic-text-light">Houses (Bhavas)</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-lg">♈</span>
                      <span className="text-vedic-text-light">Zodiac Signs</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-lg">⭐</span>
                      <span className="text-vedic-text-light">Planets (Grahas)</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-lg">↔️</span>
                      <span className="text-vedic-text-light">Aspects (Drishti)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Planetary Information Panel */}
            <div className="space-y-6">
              {/* Planetary Positions */}
              <div className="card-vedic p-6">
                <h3 className="text-xl font-cinzel font-bold text-vedic-text mb-6 flex items-center gap-2">
                  🪐 Planetary Positions
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-vedic">
                  {enhancedPlanets.map((planet, index) => (
                    <div
                      key={planet.name}
                      className={`group p-4 rounded-xl transition-all duration-300 cursor-pointer ${
                        hoveredPlanet === planet.name
                          ? 'bg-gradient-vedic-accent text-vedic-text shadow-cosmic'
                          : 'bg-vedic-background hover:bg-gradient-to-r hover:from-vedic-background hover:to-saffron-subtle'
                      }`}
                      onMouseEnter={() => setHoveredPlanet(planet.name)}
                      onMouseLeave={() => setHoveredPlanet(null)}
                      style={{
                        borderLeft: `4px solid ${planet.color}`,
                        animationDelay: `${index * 0.1}s`
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl group-hover:scale-110 transition-transform duration-200">
                            {planet.emoji}
                          </span>
                          <div>
                            <div className="font-semibold text-vedic-text">{planet.displayName}</div>
                            <div className="text-sm text-vedic-text-light">{planet.element} Element</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono text-sm font-semibold">
                            {planet.degree?.toFixed(1)}°
                          </div>
                          <div className="text-xs text-vedic-text-muted">
                            {planet.sign}
                          </div>
                        </div>
                      </div>

                      <div className="text-sm text-vedic-text-light">
                        <div className="flex items-center justify-between">
                          <span>Dignity: {planet.dignity}</span>
                          {planet.isRetrograde && (
                            <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-medium">
                              Retrograde
                            </span>
                          )}
                        </div>
                        <div className="mt-2 text-xs opacity-80">
                          {planet.influence}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Enhanced Chart Information */}
              <div className="card-cosmic p-6">
                <h3 className="text-xl font-cinzel font-bold text-vedic-text mb-6 flex items-center gap-2">
                  ℹ️ Chart Information
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-vedic-background rounded-xl">
                    <span className="text-vedic-text-light">Ascendant:</span>
                    <span className="font-semibold text-vedic-text">
                      {chartData.ascendant?.sign} {chartData.ascendant?.degree?.toFixed(1)}°
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-vedic-background rounded-xl">
                    <span className="text-vedic-text-light">Nakshatra:</span>
                    <span className="font-semibold text-vedic-text font-devanagari">
                      {chartData.nakshatra?.name} {chartData.nakshatra?.pada}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-vedic-background rounded-xl">
                    <span className="text-vedic-text-light">Current Dasha:</span>
                    <span className="font-semibold text-vedic-text">
                      {chartData.dashaInfo?.currentDasha?.dasha}
                      <span className="text-sm text-vedic-text-muted ml-1">
                        ({chartData.dashaInfo?.currentDasha?.remainingYears}y)
                      </span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-vedic-background rounded-xl">
                    <span className="text-vedic-text-light">Chart Type:</span>
                    <span className="font-semibold text-vedic-text capitalize">{analysisType}</span>
                  </div>
                </div>
              </div>

              {/* Enhanced Astrological Insights */}
              <div className="card-celestial p-6">
                <h3 className="text-xl font-cinzel font-bold text-vedic-text mb-6 flex items-center gap-2">
                  💡 Key Insights
                </h3>
                <div className="space-y-4">
                  <div className="group p-4 rounded-xl bg-green-50 border-l-4 border-green-500 hover-lift transition-vedic">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">💪</span>
                      <div>
                        <div className="font-semibold text-green-800 mb-1">Strong Planets</div>
                        <div className="text-sm text-green-700">
                          {enhancedPlanets
                            .filter(p => p.dignity === 'Exalted' || p.dignity === 'Own Sign')
                            .map(p => p.displayName.split(' ')[0])
                            .join(', ') || 'None identified'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="group p-4 rounded-xl bg-orange-50 border-l-4 border-orange-500 hover-lift transition-vedic">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">⚠️</span>
                      <div>
                        <div className="font-semibold text-orange-800 mb-1">Challenging Positions</div>
                        <div className="text-sm text-orange-700">
                          {enhancedPlanets
                            .filter(p => p.dignity === 'Debilitated')
                            .map(p => p.displayName.split(' ')[0])
                            .join(', ') || 'None identified'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="group p-4 rounded-xl bg-purple-50 border-l-4 border-purple-500 hover-lift transition-vedic">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">🕉️</span>
                      <div>
                        <div className="font-semibold text-purple-800 mb-1">Spiritual Focus</div>
                        <div className="text-sm text-purple-700">
                          Jupiter and Ketu positions suggest spiritual inclinations
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Interactive Features */}
        <div className="mt-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="group card-vedic p-6 text-center hover-celestial">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">🎯</div>
              <h4 className="font-cinzel font-bold text-vedic-text mb-2">Interactive Exploration</h4>
              <p className="text-sm text-vedic-text-light">
                Hover over planets and houses for detailed information
              </p>
            </div>

            <div className="group card-vedic p-6 text-center hover-celestial">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">📊</div>
              <h4 className="font-cinzel font-bold text-vedic-text mb-2">Multiple Chart Types</h4>
              <p className="text-sm text-vedic-text-light">
                Switch between Rashi and Navamsa charts
              </p>
            </div>

            <div className="group card-vedic p-6 text-center hover-celestial">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">⚡</div>
              <h4 className="font-cinzel font-bold text-vedic-text mb-2">Real-time Updates</h4>
              <p className="text-sm text-vedic-text-light">
                Charts update instantly with new calculations
              </p>
            </div>

            <div className="group card-vedic p-6 text-center hover-celestial">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">🔍</div>
              <h4 className="font-cinzel font-bold text-vedic-text mb-2">Detailed Analysis</h4>
              <p className="text-sm text-vedic-text-light">
                Get comprehensive insights for each planetary position
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartDisplay;
