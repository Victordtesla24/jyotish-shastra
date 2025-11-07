import React from 'react';
import { motion } from 'framer-motion';

/**
 * PlanetaryAnimations Component
 * White Saturn and planetary animations matching Chris Cole design
 * Features: Slow rotation, floating/drifting motion, subtle glow effects
 */
const PlanetaryAnimations = ({ count = 8 }) => {
  // White Saturn SVG (matching Chris Cole design)
  const SaturnSVG = ({ size = '80px', className = '' }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      style={{ filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.5))' }}
    >
      {/* Saturn Planet */}
      <circle
        cx="50"
        cy="50"
        r="25"
        fill="none"
        stroke="white"
        strokeWidth="2"
        opacity="0.8"
      />
      {/* Saturn Rings */}
      <ellipse
        cx="50"
        cy="50"
        rx="35"
        ry="12"
        fill="none"
        stroke="white"
        strokeWidth="1.5"
        opacity="0.9"
        transform="rotate(-20 50 50)"
      />
      <ellipse
        cx="50"
        cy="50"
        rx="40"
        ry="10"
        fill="none"
        stroke="white"
        strokeWidth="1"
        opacity="0.7"
        transform="rotate(-20 50 50)"
      />
      <ellipse
        cx="50"
        cy="50"
        rx="30"
        ry="14"
        fill="none"
        stroke="white"
        strokeWidth="1.5"
        opacity="0.8"
        transform="rotate(-20 50 50)"
      />
    </svg>
  );

  const planetaryElements = [
    { component: <SaturnSVG size="80px" />, type: 'saturn', delay: 0, size: '80px', position: { top: '15%', left: '10%' } },
    { symbol: '🌙', type: 'moon', delay: 0.2, size: '2.5rem' },
    { symbol: '⭐', type: 'star', delay: 0.4, size: '2rem' },
    { symbol: '☀️', type: 'sun', delay: 0.6, size: '2.5rem' },
    { symbol: '🪐', type: 'saturn-2', delay: 0.8, size: '2.5rem' },
    { symbol: '⭐', type: 'star-2', delay: 1.0, size: '1.8rem' },
    { symbol: '🌙', type: 'moon-2', delay: 1.2, size: '2rem' },
    { symbol: '⭐', type: 'star-3', delay: 1.4, size: '1.5rem' },
  ].slice(0, count);

  const animationVariants = {
    float: {
      y: [0, -20, 0],
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    drift: {
      x: [0, 10, -10, 0],
      y: [0, -15, 0],
      rotate: [0, 3, -3, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    rotate: {
      rotate: [0, 360],
      y: [0, -10, 0],
      transition: {
        duration: 8,
        repeat: Infinity,
        ease: "linear"
      }
    },
    glow: {
      scale: [1, 1.1, 1],
      opacity: [0.6, 0.9, 0.6],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const positions = [
    { top: '15%', left: '10%' }, // Saturn - prominent left position (matching Chris Cole)
    { top: '20%', right: '15%' },
    { bottom: '30%', right: '20%' },
    { top: '50%', left: '5%' },
    { bottom: '20%', left: '25%' },
    { top: '70%', right: '15%' },
    { bottom: '10%', right: '30%' },
    { top: '35%', right: '5%' },
  ];

  const getAnimationType = (index) => {
    const types = ['float', 'drift', 'rotate', 'glow'];
    return types[index % types.length];
  };

  return (
    <div className="planetary-animations-container" aria-hidden="true">
      {planetaryElements.map((element, index) => {
        const position = element.position || positions[index % positions.length];
        const animationType = getAnimationType(index);
        
        return (
          <motion.div
            key={`${element.type}-${index}`}
            className={`planetary-element planetary-element-${element.type}`}
            style={{
              position: 'absolute',
              ...position,
              fontSize: element.size,
              zIndex: 1,
            }}
            variants={animationVariants}
            animate={animationType}
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 0.8, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{
              opacity: { duration: 1, delay: element.delay },
              scale: { duration: 0.8, delay: element.delay }
            }}
          >
            {element.component ? (
              element.component
            ) : (
              <span className="planetary-symbol" style={{ 
                filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.5))',
                color: 'white'
              }}>
                {element.symbol}
              </span>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

export default PlanetaryAnimations;

