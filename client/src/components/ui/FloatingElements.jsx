import React from 'react';
import { motion } from 'framer-motion';

/**
 * FloatingElements Component
 * Decorative floating Vedic symbols (Om, lotus, planets) with subtle animations
 * Features: Strategic positioning for visual hierarchy, maintains performance
 */
const FloatingElements = ({ count = 8 }) => {
  const elements = [
    { symbol: '🪐', type: 'saturn', delay: 0, color: 'white' },
    { symbol: '🌙', type: 'moon', delay: 0.2, color: 'white' },
    { symbol: '⭐', type: 'star', delay: 0.4, color: 'white' },
    { symbol: '☀️', type: 'sun', delay: 0.6, color: 'white' },
    { symbol: '🪐', type: 'planet', delay: 0.8, color: 'white' },
    { symbol: '⭐', type: 'star-2', delay: 1.0, color: 'white' },
    { symbol: '🌙', type: 'moon-2', delay: 1.2, color: 'white' },
    { symbol: '⭐', type: 'star-3', delay: 1.4, color: 'white' },
  ].slice(0, count);

  const floatVariants = {
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
    { top: '10%', left: '10%' },
    { top: '20%', right: '15%' },
    { top: '50%', left: '5%' },
    { bottom: '30%', right: '10%' },
    { bottom: '20%', left: '20%' },
    { top: '70%', right: '25%' },
    { top: '35%', right: '5%' },
    { bottom: '10%', left: '15%' },
  ];

  return (
    <div className="floating-elements-container" aria-hidden="true">
      {elements.map((element, index) => {
        const position = positions[index % positions.length];
        const animationType = index % 3 === 0 ? 'float' : index % 3 === 1 ? 'drift' : 'glow';
        
        return (
          <motion.div
            key={`${element.type}-${index}`}
            className={`floating-element floating-element-${element.type}`}
            style={{
              position: 'absolute',
              ...position,
              zIndex: 1,
            }}
            variants={floatVariants}
            animate={animationType}
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 0.7, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{
              opacity: { duration: 1, delay: element.delay },
              scale: { duration: 0.8, delay: element.delay }
            }}
          >
            <span 
              className="floating-symbol" 
              style={{ 
                filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.5))',
                color: element.color || 'white'
              }}
            >
              {element.symbol}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
};

export default FloatingElements;

