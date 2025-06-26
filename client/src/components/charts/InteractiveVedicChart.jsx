import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';
import { cn } from '../../lib/utils';

const InteractiveVedicChart = ({
  chartData,
  type = 'rasi',
  onPlanetClick,
  onHouseClick,
  showAspects = true,
  interactive = true
}) => {
  const [hoveredElement, setHoveredElement] = useState(null);
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const chartRef = useRef(null);

  // Mouse tracking for parallax effect
  const mouseX = useSpring(0, { stiffness: 500, damping: 100 });
  const mouseY = useSpring(0, { stiffness: 500, damping: 100 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["17.5deg", "-17.5deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-17.5deg", "17.5deg"]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!chartRef.current || !interactive) return;

      const rect = chartRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      mouseX.set((e.clientX - centerX) / rect.width);
      mouseY.set((e.clientY - centerY) / rect.height);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY, interactive]);

  // Zodiac houses with enhanced styling
  const houses = [
    { id: 1, name: 'Aries', sanskrit: 'मेष', symbol: '♈', angle: 0, color: '#FF6B35' },
    { id: 2, name: 'Taurus', sanskrit: 'वृष', symbol: '♉', angle: 30, color: '#8FBC8F' },
    { id: 3, name: 'Gemini', sanskrit: 'मिथुन', symbol: '♊', angle: 60, color: '#FFD700' },
    { id: 4, name: 'Cancer', sanskrit: 'कर्क', symbol: '♋', angle: 90, color: '#C0C0C0' },
    { id: 5, name: 'Leo', sanskrit: 'सिंह', symbol: '♌', angle: 120, color: '#FFAC33' },
    { id: 6, name: 'Virgo', sanskrit: 'कन्या', symbol: '♍', angle: 150, color: '#6B8E23' },
    { id: 7, name: 'Libra', sanskrit: 'तुला', symbol: '♎', angle: 180, color: '#FFC0CB' },
    { id: 8, name: 'Scorpio', sanskrit: 'वृश्चिक', symbol: '♏', angle: 210, color: '#800000' },
    { id: 9, name: 'Sagittarius', sanskrit: 'धनु', symbol: '♐', angle: 240, color: '#6A0DAD' },
    { id: 10, name: 'Capricorn', sanskrit: 'मकर', symbol: '♑', angle: 270, color: '#4682B4' },
    { id: 11, name: 'Aquarius', sanskrit: 'कुम्भ', symbol: '♒', angle: 300, color: '#00BFFF' },
    { id: 12, name: 'Pisces', sanskrit: 'मीन', symbol: '♓', angle: 330, color: '#7FFFD4' }
  ];

  // Planets with enhanced data
  const planets = [
    { id: 'sun', name: 'Sun', sanskrit: 'सूर्य', symbol: '☉', color: '#FFD700', size: 16 },
    { id: 'moon', name: 'Moon', sanskrit: 'चन्द्र', symbol: '☽', color: '#C0C0C0', size: 14 },
    { id: 'mars', name: 'Mars', sanskrit: 'मंगल', symbol: '♂', color: '#FF6B6B', size: 12 },
    { id: 'mercury', name: 'Mercury', sanskrit: 'बुध', symbol: '☿', color: '#98FB98', size: 10 },
    { id: 'jupiter', name: 'Jupiter', sanskrit: 'गुरु', symbol: '♃', color: '#FFE55C', size: 18 },
    { id: 'venus', name: 'Venus', sanskrit: 'शुक्र', symbol: '♀', color: '#FFB6C1', size: 12 },
    { id: 'saturn', name: 'Saturn', sanskrit: 'शनि', symbol: '♄', color: '#4169E1', size: 14 },
    { id: 'rahu', name: 'Rahu', sanskrit: 'राहु', symbol: '☊', color: '#8B4513', size: 12 },
    { id: 'ketu', name: 'Ketu', sanskrit: 'केतु', symbol: '☋', color: '#FF8C00', size: 12 }
  ];

  const handleElementHover = (element, event) => {
    if (!interactive) return;

    setHoveredElement(element);
    setShowTooltip(true);
    setTooltipPosition({
      x: event.clientX,
      y: event.clientY - 60
    });
  };

  const handleElementLeave = () => {
    if (!interactive) return;

    setHoveredElement(null);
    setShowTooltip(false);
  };

  const handlePlanetClick = (planet) => {
    if (!interactive) return;

    setSelectedPlanet(planet);
    onPlanetClick?.(planet);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Main Chart Container */}
      <motion.div
        ref={chartRef}
        className="relative aspect-square rounded-3xl bg-gradient-to-br from-vedic-surface via-white to-vedic-background border-4 border-vedic-accent/30 shadow-cosmic overflow-hidden"
        style={{
          rotateX: interactive ? rotateX : 0,
          rotateY: interactive ? rotateY : 0,
          transformStyle: "preserve-3d"
        }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Sacred Geometry Background */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 400 400">
            {/* Mandala pattern */}
            <circle cx="200" cy="200" r="180" fill="none" stroke="url(#mandalaGradient)" strokeWidth="2" />
            <circle cx="200" cy="200" r="120" fill="none" stroke="url(#mandalaGradient)" strokeWidth="1" />
            <circle cx="200" cy="200" r="60" fill="none" stroke="url(#mandalaGradient)" strokeWidth="1" />

            {/* Radial lines */}
            {Array.from({ length: 12 }, (_, i) => {
              const angle = (i * 30) * Math.PI / 180;
              const x1 = 200 + Math.cos(angle) * 60;
              const y1 = 200 + Math.sin(angle) * 60;
              const x2 = 200 + Math.cos(angle) * 180;
              const y2 = 200 + Math.sin(angle) * 180;

              return (
                <line
                  key={i}
                  x1={x1} y1={y1}
                  x2={x2} y2={y2}
                  stroke="url(#mandalaGradient)"
                  strokeWidth="1"
                />
              );
            })}

            <defs>
              <linearGradient id="mandalaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFD700" />
                <stop offset="100%" stopColor="#FF6B35" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Zodiac Houses */}
        <div className="absolute inset-0">
          {houses.map((house, index) => {
            const isHovered = hoveredElement?.type === 'house' && hoveredElement?.id === house.id;

            return (
              <motion.div
                key={house.id}
                className="absolute cursor-pointer"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `translate(-50%, -50%) rotate(${house.angle}deg) translateY(-140px) rotate(-${house.angle}deg)`,
                }}
                whileHover={{ scale: 1.1 }}
                animate={{
                  rotate: isHovered ? [0, 5, -5, 0] : 0,
                }}
                transition={{ duration: 0.5 }}
                onMouseEnter={(e) => handleElementHover({ type: 'house', ...house }, e)}
                onMouseLeave={handleElementLeave}
                onClick={() => onHouseClick?.(house)}
              >
                <div className={cn(
                  "relative w-20 h-20 rounded-xl flex flex-col items-center justify-center text-center transition-all duration-300",
                  isHovered
                    ? "bg-white/90 shadow-celestial scale-110"
                    : "bg-white/60 backdrop-blur-sm hover:bg-white/80"
                )}
                style={{
                  borderLeft: `4px solid ${house.color}`,
                }}
                >
                  <div className="text-2xl mb-1" style={{ color: house.color }}>
                    {house.symbol}
                  </div>
                  <div className="text-xs font-devanagari text-vedic-text-muted">
                    {house.sanskrit}
                  </div>
                  <div className="text-xs font-medium text-vedic-text">
                    {house.name}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Planets */}
        <div className="absolute inset-0">
          {chartData?.planetaryPositions && Object.entries(chartData.planetaryPositions).map(([planetId, position]) => {
            const planet = planets.find(p => p.id === planetId);
            if (!planet) return null;

            const isHovered = hoveredElement?.type === 'planet' && hoveredElement?.id === planetId;
            const isSelected = selectedPlanet?.id === planetId;

            // Calculate position based on degree
            const angle = (position.degree || 0) * Math.PI / 180;
            const radius = 100;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            return (
              <motion.div
                key={planetId}
                className="absolute cursor-pointer"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
                }}
                initial={{ scale: 0, rotate: 0 }}
                animate={{
                  scale: isSelected ? 1.3 : 1,
                  rotate: isHovered ? 360 : 0,
                }}
                whileHover={{ scale: 1.2 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                  rotate: { duration: 0.5 }
                }}
                onMouseEnter={(e) => handleElementHover({ type: 'planet', ...planet, ...position }, e)}
                onMouseLeave={handleElementLeave}
                onClick={() => handlePlanetClick({ ...planet, ...position })}
              >
                <div className={cn(
                  "relative flex items-center justify-center rounded-full transition-all duration-300",
                  isSelected
                    ? "shadow-cosmic ring-4 ring-vedic-accent ring-opacity-50"
                    : isHovered
                      ? "shadow-celestial"
                      : "shadow-medium"
                )}
                style={{
                  width: planet.size + 8,
                  height: planet.size + 8,
                  backgroundColor: planet.color,
                  filter: isHovered ? 'brightness(1.2)' : 'brightness(1)',
                }}
                >
                  <span className="text-white font-bold text-xs">
                    {planet.symbol}
                  </span>

                  {/* Retrograde indicator */}
                  {position.isRetrograde && (
                    <motion.div
                      className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full flex items-center justify-center"
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <span className="text-white text-xs font-bold">R</span>
                    </motion.div>
                  )}

                  {/* Glow effect for hovered planet */}
                  {isHovered && (
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{ backgroundColor: planet.color }}
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 0.2, 0.5]
                      }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Aspects Lines */}
        {showAspects && chartData?.aspects && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {chartData.aspects.map((aspect, index) => (
              <motion.line
                key={index}
                x1="50%"
                y1="50%"
                x2="50%"
                y2="50%"
                stroke={aspect.type === 'trine' ? '#4ADE80' : aspect.type === 'square' ? '#F87171' : '#60A5FA'}
                strokeWidth="2"
                strokeDasharray="5,5"
                opacity="0.6"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: index * 0.1 }}
              />
            ))}
          </svg>
        )}

        {/* Center Logo */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-16 h-16 bg-gradient-to-br from-vedic-accent to-gold-pure rounded-full flex items-center justify-center shadow-cosmic">
            <span className="text-2xl text-white font-bold">ॐ</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Interactive Tooltip */}
      <AnimatePresence>
        {showTooltip && hoveredElement && (
          <motion.div
            className="fixed z-50 px-4 py-3 bg-black/90 text-white rounded-xl shadow-celestial pointer-events-none"
            style={{
              left: tooltipPosition.x,
              top: tooltipPosition.y,
            }}
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            {hoveredElement.type === 'planet' ? (
              <div className="text-center">
                <div className="font-cinzel font-bold text-lg mb-1">
                  {hoveredElement.name}
                </div>
                <div className="font-devanagari text-vedic-accent text-sm mb-2">
                  {hoveredElement.sanskrit}
                </div>
                {hoveredElement.sign && (
                  <div className="text-sm opacity-90">
                    <div>Sign: {hoveredElement.sign}</div>
                    <div>Degree: {hoveredElement.degree?.toFixed(1)}°</div>
                    <div>House: {hoveredElement.house}</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center">
                <div className="font-cinzel font-bold text-lg mb-1">
                  {hoveredElement.name}
                </div>
                <div className="font-devanagari text-vedic-accent text-sm">
                  {hoveredElement.sanskrit}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chart Controls */}
      {interactive && (
        <motion.div
          className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 flex space-x-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <button
            className="px-4 py-2 bg-vedic-primary text-white rounded-xl hover:bg-vedic-secondary transition-colors"
            onClick={() => setSelectedPlanet(null)}
          >
            Reset View
          </button>
          <button
            className="px-4 py-2 bg-vedic-surface border border-vedic-border text-vedic-text rounded-xl hover:bg-vedic-background transition-colors"
            onClick={() => setShowTooltip(!showTooltip)}
          >
            {showTooltip ? 'Hide' : 'Show'} Info
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default InteractiveVedicChart;
