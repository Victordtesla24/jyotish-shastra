import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui';

const ZodiacWheel = ({ onSignSelect, selectedSign, showDetails = true }) => {
  const [hoveredSign, setHoveredSign] = useState(null);
  const [rotation, setRotation] = useState(0);
  const wheelRef = useRef(null);

  const zodiacSigns = [
    {
      name: 'Aries',
      sanskrit: 'मेष',
      symbol: '♈',
      element: 'Fire',
      ruler: 'Mars',
      dates: 'Mar 21 - Apr 19',
      color: '#FF4444',
      angle: 0,
      traits: ['Dynamic', 'Leadership', 'Courage', 'Initiative'],
      description: 'The pioneer of the zodiac, full of energy and enthusiasm.'
    },
    {
      name: 'Taurus',
      sanskrit: 'वृष',
      symbol: '♉',
      element: 'Earth',
      ruler: 'Venus',
      dates: 'Apr 20 - May 20',
      color: '#4CAF50',
      angle: 30,
      traits: ['Stability', 'Patience', 'Determination', 'Sensuality'],
      description: 'The reliable and steadfast sign, appreciating beauty and comfort.'
    },
    {
      name: 'Gemini',
      sanskrit: 'मिथुन',
      symbol: '♊',
      element: 'Air',
      ruler: 'Mercury',
      dates: 'May 21 - Jun 20',
      color: '#FFD700',
      angle: 60,
      traits: ['Communication', 'Versatility', 'Curiosity', 'Adaptability'],
      description: 'The communicator, quick-witted and intellectually curious.'
    },
    {
      name: 'Cancer',
      sanskrit: 'कर्क',
      symbol: '♋',
      element: 'Water',
      ruler: 'Moon',
      dates: 'Jun 21 - Jul 22',
      color: '#C0C0C0',
      angle: 90,
      traits: ['Emotional', 'Nurturing', 'Intuitive', 'Protective'],
      description: 'The nurturer, deeply emotional and caring.'
    },
    {
      name: 'Leo',
      sanskrit: 'सिंह',
      symbol: '♌',
      element: 'Fire',
      ruler: 'Sun',
      dates: 'Jul 23 - Aug 22',
      color: '#FFAC33',
      angle: 120,
      traits: ['Confidence', 'Generosity', 'Creativity', 'Leadership'],
      description: 'The royal sign, naturally confident and generous.'
    },
    {
      name: 'Virgo',
      sanskrit: 'कन्या',
      symbol: '♍',
      element: 'Earth',
      ruler: 'Mercury',
      dates: 'Aug 23 - Sep 22',
      color: '#6B8E23',
      angle: 150,
      traits: ['Analysis', 'Precision', 'Service', 'Perfectionism'],
      description: 'The analyst, detail-oriented and service-minded.'
    },
    {
      name: 'Libra',
      sanskrit: 'तुला',
      symbol: '♎',
      element: 'Air',
      ruler: 'Venus',
      dates: 'Sep 23 - Oct 22',
      color: '#FFC0CB',
      angle: 180,
      traits: ['Balance', 'Harmony', 'Justice', 'Diplomacy'],
      description: 'The diplomat, seeking balance and harmony in all things.'
    },
    {
      name: 'Scorpio',
      sanskrit: 'वृश्चिक',
      symbol: '♏',
      element: 'Water',
      ruler: 'Mars',
      dates: 'Oct 23 - Nov 21',
      color: '#800000',
      angle: 210,
      traits: ['Intensity', 'Transformation', 'Mystery', 'Passion'],
      description: 'The transformer, intense and deeply passionate.'
    },
    {
      name: 'Sagittarius',
      sanskrit: 'धनु',
      symbol: '♐',
      element: 'Fire',
      ruler: 'Jupiter',
      dates: 'Nov 22 - Dec 21',
      color: '#6A0DAD',
      angle: 240,
      traits: ['Adventure', 'Philosophy', 'Optimism', 'Freedom'],
      description: 'The explorer, philosophical and freedom-loving.'
    },
    {
      name: 'Capricorn',
      sanskrit: 'मकर',
      symbol: '♑',
      element: 'Earth',
      ruler: 'Saturn',
      dates: 'Dec 22 - Jan 19',
      color: '#4682B4',
      angle: 270,
      traits: ['Ambition', 'Discipline', 'Responsibility', 'Persistence'],
      description: 'The achiever, disciplined and goal-oriented.'
    },
    {
      name: 'Aquarius',
      sanskrit: 'कुम्भ',
      symbol: '♒',
      element: 'Air',
      ruler: 'Saturn',
      dates: 'Jan 20 - Feb 18',
      color: '#00BFFF',
      angle: 300,
      traits: ['Innovation', 'Independence', 'Humanitarianism', 'Originality'],
      description: 'The innovator, independent and humanitarian.'
    },
    {
      name: 'Pisces',
      sanskrit: 'मीन',
      symbol: '♓',
      element: 'Water',
      ruler: 'Jupiter',
      dates: 'Feb 19 - Mar 20',
      color: '#DA70D6',
      angle: 330,
      traits: ['Intuition', 'Compassion', 'Spirituality', 'Imagination'],
      description: 'The mystic, intuitive and deeply spiritual.'
    }
  ];

  const handleSignClick = (sign) => {
    if (onSignSelect) {
      onSignSelect(sign);
    }
  };

  const handleSignHover = (sign) => {
    setHoveredSign(sign);
  };

  const handleSignLeave = () => {
    setHoveredSign(null);
  };

  const renderWheelSegment = (sign, index) => {
    const isSelected = selectedSign?.name === sign.name;
    const isHovered = hoveredSign?.name === sign.name;
    const segmentAngle = 30; // 360 / 12 signs
    const startAngle = sign.angle;
    const endAngle = startAngle + segmentAngle;

    // Convert to radians
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    // Calculate path for the segment
    const outerRadius = 150;
    const innerRadius = 80;
    const centerX = 160;
    const centerY = 160;

    const x1 = centerX + innerRadius * Math.cos(startRad);
    const y1 = centerY + innerRadius * Math.sin(startRad);
    const x2 = centerX + outerRadius * Math.cos(startRad);
    const y2 = centerY + outerRadius * Math.sin(startRad);
    const x3 = centerX + outerRadius * Math.cos(endRad);
    const y3 = centerY + outerRadius * Math.sin(endRad);
    const x4 = centerX + innerRadius * Math.cos(endRad);
    const y4 = centerY + innerRadius * Math.sin(endRad);

    const pathData = `M ${x1} ${y1} L ${x2} ${y2} A ${outerRadius} ${outerRadius} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${innerRadius} ${innerRadius} 0 0 0 ${x1} ${y1}`;

    // Calculate text position
    const midAngle = (startAngle + endAngle) / 2;
    const textRadius = (innerRadius + outerRadius) / 2;
    const textX = centerX + textRadius * Math.cos((midAngle * Math.PI) / 180);
    const textY = centerY + textRadius * Math.sin((midAngle * Math.PI) / 180);

    return (
      <g key={sign.name}>
        <motion.path
          d={pathData}
          fill={sign.color}
          stroke="#fff"
          strokeWidth={2}
          className="cursor-pointer"
          initial={{ opacity: 0.7 }}
          whileHover={{
            opacity: 1,
            scale: 1.05,
            transformOrigin: `${centerX}px ${centerY}px`
          }}
          animate={{
            opacity: isSelected || isHovered ? 1 : 0.7,
            scale: isSelected ? 1.1 : 1,
            transformOrigin: `${centerX}px ${centerY}px`
          }}
          transition={{ duration: 0.2 }}
          onClick={() => handleSignClick(sign)}
          onMouseEnter={() => handleSignHover(sign)}
          onMouseLeave={handleSignLeave}
        />

        {/* Symbol */}
        <text
          x={textX}
          y={textY}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-white font-bold text-lg pointer-events-none select-none"
          style={{ fontSize: '20px' }}
        >
          {sign.symbol}
        </text>

        {/* Sign name (on hover/select) */}
        <AnimatePresence>
          {(isHovered || isSelected) && (
            <motion.text
              x={textX}
              y={textY + 25}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-white font-medium text-xs pointer-events-none select-none"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              {sign.name}
            </motion.text>
          )}
        </AnimatePresence>
      </g>
    );
  };

  const renderCenterContent = () => {
    const displaySign = hoveredSign || selectedSign;

    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-32 h-32 bg-white dark:bg-dark-surface rounded-full shadow-cosmic flex items-center justify-center border-4 border-vedic-gold">
          <AnimatePresence mode="wait">
            {displaySign ? (
              <motion.div
                key={displaySign.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center"
              >
                <div className="text-3xl mb-1" style={{ color: displaySign.color }}>
                  {displaySign.symbol}
                </div>
                <div className="font-accent text-sm text-earth-brown dark:text-dark-text-primary">
                  {displaySign.name}
                </div>
                <div className="text-xs text-wisdom-gray dark:text-dark-text-secondary">
                  {displaySign.sanskrit}
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <div className="text-2xl mb-1">🔮</div>
                <div className="font-accent text-sm text-earth-brown dark:text-dark-text-primary">
                  Zodiac
                </div>
                <div className="text-xs text-wisdom-gray dark:text-dark-text-secondary">
                  राशि
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      {/* Zodiac Wheel */}
      <div className="relative">
        <motion.div
          ref={wheelRef}
          className="relative w-80 h-80"
          animate={{ rotate: rotation }}
          transition={{ duration: 0.5 }}
        >
          <svg width="320" height="320" viewBox="0 0 320 320" className="drop-shadow-lg">
            {/* Outer ring */}
            <circle
              cx="160"
              cy="160"
              r="155"
              fill="none"
              stroke="#d4af37"
              strokeWidth="4"
              className="opacity-50"
            />

            {/* Inner ring */}
            <circle
              cx="160"
              cy="160"
              r="75"
              fill="none"
              stroke="#d4af37"
              strokeWidth="2"
              className="opacity-30"
            />

            {/* Zodiac segments */}
            {zodiacSigns.map((sign, index) => renderWheelSegment(sign, index))}

            {/* Decorative elements */}
            <g className="opacity-20">
              {[0, 90, 180, 270].map((angle, index) => {
                const x1 = 160 + 60 * Math.cos((angle * Math.PI) / 180);
                const y1 = 160 + 60 * Math.sin((angle * Math.PI) / 180);
                const x2 = 160 + 165 * Math.cos((angle * Math.PI) / 180);
                const y2 = 160 + 165 * Math.sin((angle * Math.PI) / 180);

                return (
                  <line
                    key={index}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#d4af37"
                    strokeWidth="1"
                  />
                );
              })}
            </g>
          </svg>

          {renderCenterContent()}
        </motion.div>

        {/* Rotation controls */}
        <div className="flex justify-center mt-4 space-x-2">
          <button
            onClick={() => setRotation(rotation - 30)}
            className="p-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-border transition-colors"
            title="Rotate counterclockwise"
          >
            <svg className="w-4 h-4 text-wisdom-gray dark:text-dark-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 1v6m0 0L9 4m3 3l3-3" transform="rotate(-90 12 12)" />
            </svg>
          </button>
          <button
            onClick={() => setRotation(0)}
            className="px-3 py-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-border transition-colors text-xs font-medium text-wisdom-gray dark:text-dark-text-secondary"
          >
            Reset
          </button>
          <button
            onClick={() => setRotation(rotation + 30)}
            className="p-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-border transition-colors"
            title="Rotate clockwise"
          >
            <svg className="w-4 h-4 text-wisdom-gray dark:text-dark-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 1v6m0 0L9 4m3 3l3-3" transform="rotate(90 12 12)" />
            </svg>
          </button>
        </div>
      </div>

      {/* Sign Details */}
      {showDetails && (
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {(hoveredSign || selectedSign) ? (
              <motion.div
                key={(hoveredSign || selectedSign).name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-6">
                  {(() => {
                    const sign = hoveredSign || selectedSign;
                    return (
                      <>
                        <div className="flex items-center space-x-4 mb-6">
                          <div
                            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl text-white font-bold"
                            style={{ backgroundColor: sign.color }}
                          >
                            {sign.symbol}
                          </div>
                          <div>
                            <h3 className="font-accent text-2xl text-earth-brown dark:text-dark-text-primary">
                              {sign.name}
                            </h3>
                            <p className="text-wisdom-gray dark:text-dark-text-secondary">
                              {sign.sanskrit} • {sign.dates}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <p className="text-earth-brown dark:text-dark-text-primary leading-relaxed">
                            {sign.description}
                          </p>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium text-earth-brown dark:text-dark-text-primary mb-2">
                                Element
                              </h4>
                              <div className="flex items-center space-x-2">
                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: sign.color }}></span>
                                <span className="text-wisdom-gray dark:text-dark-text-secondary">{sign.element}</span>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium text-earth-brown dark:text-dark-text-primary mb-2">
                                Ruler
                              </h4>
                              <span className="text-wisdom-gray dark:text-dark-text-secondary">{sign.ruler}</span>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium text-earth-brown dark:text-dark-text-primary mb-3">
                              Key Traits
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {sign.traits.map((trait, index) => (
                                <span
                                  key={index}
                                  className="px-3 py-1 bg-gray-100 dark:bg-dark-border text-wisdom-gray dark:text-dark-text-secondary rounded-full text-sm"
                                >
                                  {trait}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </Card>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="text-6xl mb-4">🌟</div>
                <h3 className="font-accent text-xl text-earth-brown dark:text-dark-text-primary mb-2">
                  Explore the Zodiac
                </h3>
                <p className="text-wisdom-gray dark:text-dark-text-secondary">
                  Hover over or click on any sign to learn about its characteristics and traits.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default ZodiacWheel;
