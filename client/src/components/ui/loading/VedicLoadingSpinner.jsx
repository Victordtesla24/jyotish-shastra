"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../lib/utils';

const VedicLoadingSpinner = ({
  size = 'medium',
  variant = 'mandala',
  text = 'Loading...',
  subtext = 'कृपया प्रतीक्षा करें',
  showProgress = false,
  progress = 0,
  fullscreen = false,
  mantraText = 'ॐ गं गणपतये नमः',
  className
}) => {
  const [currentMantra, setCurrentMantra] = useState(0);
  const [dots, setDots] = useState('');

  const mantras = [
    'ॐ गं गणपतये नमः',
    'ॐ नमः शिवाय',
    'ॐ मणि पद्मे हूं',
    'गायत्री मंत्र',
    'हरे कृष्ण हरे राम'
  ];

  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    const mantraInterval = setInterval(() => {
      setCurrentMantra(prev => (prev + 1) % mantras.length);
    }, 3000);

    return () => {
      clearInterval(dotsInterval);
      clearInterval(mantraInterval);
    };
  }, [mantras.length]);

  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-16 h-16',
    large: 'w-24 h-24',
    xlarge: 'w-32 h-32'
  };

  const MandalaSpinner = () => (
    <div className="relative">
      {/* Outer rotating ring */}
      <motion.div
        className={cn(
          sizeClasses[size],
          "border-4 border-gold-champagne rounded-full relative"
        )}
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      >
        {/* Inner rotating ring - opposite direction */}
        <motion.div
          className="absolute inset-2 border-2 border-vedic-accent rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          {/* Innermost ring */}
          <motion.div
            className="absolute inset-2 border border-cosmic-purple rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          >
            {/* Center Om symbol */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.span
                className="text-vedic-accent font-bold"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ fontSize: size === 'small' ? '8px' : size === 'medium' ? '12px' : '16px' }}
              >
                ॐ
              </motion.span>
            </div>
          </motion.div>
        </motion.div>

        {/* Orbital dots */}
        {[0, 90, 180, 270].map((angle, index) => (
          <motion.div
            key={index}
            className="absolute w-2 h-2 bg-vedic-primary rounded-full"
            style={{
              top: '50%',
              left: '50%',
              transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-${size === 'small' ? '16px' : size === 'medium' ? '32px' : '48px'}) rotate(-${angle}deg)`
            }}
            animate={{
              scale: [0.5, 1, 0.5],
              opacity: [0.4, 1, 0.4]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: index * 0.2
            }}
          />
        ))}
      </motion.div>

      {/* Glowing aura */}
      <motion.div
        className={cn(
          sizeClasses[size],
          "absolute inset-0 rounded-full bg-gradient-radial from-vedic-accent/20 to-transparent"
        )}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{ duration: 3, repeat: Infinity }}
      />
    </div>
  );

  const ChakraSpinner = () => (
    <div className="relative">
      {/* Seven chakra rings */}
      {[
        { color: '#FF0000', size: 1, duration: 1 }, // Root
        { color: '#FF7F00', size: 0.9, duration: 1.2 }, // Sacral
        { color: '#FFFF00', size: 0.8, duration: 1.4 }, // Solar Plexus
        { color: '#00FF00', size: 0.7, duration: 1.6 }, // Heart
        { color: '#0000FF', size: 0.6, duration: 1.8 }, // Throat
        { color: '#4B0082', size: 0.5, duration: 2 }, // Third Eye
        { color: '#9400D3', size: 0.4, duration: 2.2 }  // Crown
      ].map((chakra, index) => (
        <motion.div
          key={index}
          className="absolute rounded-full border-2"
          style={{
            width: `${parseInt(sizeClasses[size].split('w-')[1]) * chakra.size * 4}px`,
            height: `${parseInt(sizeClasses[size].split('h-')[1]) * chakra.size * 4}px`,
            borderColor: `${chakra.color}40`,
            borderTopColor: chakra.color,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: chakra.duration,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}

      {/* Center meditation symbol */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="text-cosmic-purple font-bold"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{
            rotate: { duration: 8, repeat: Infinity, ease: "linear" },
            scale: { duration: 2, repeat: Infinity }
          }}
          style={{ fontSize: size === 'small' ? '10px' : size === 'medium' ? '14px' : '18px' }}
        >
          🕉
        </motion.div>
      </div>
    </div>
  );

  const CosmicSpinner = () => (
    <div className="relative">
      {/* Galaxy spiral */}
      <motion.div
        className={cn(sizeClasses[size], "relative")}
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      >
        {/* Spiral arms */}
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <defs>
            <radialGradient id="cosmicGradient">
              <stop offset="0%" stopColor="#FFD700" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#FF6B35" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#6B46C1" stopOpacity="0.2" />
            </radialGradient>
          </defs>

          {/* Spiral path */}
          <path
            d="M50,50 Q70,30 80,50 Q70,70 50,60 Q30,50 40,30 Q60,20 70,40"
            fill="none"
            stroke="url(#cosmicGradient)"
            strokeWidth="2"
            strokeDasharray="5,5"
          >
            <animateTransform
              attributeName="transform"
              attributeType="XML"
              type="rotate"
              from="0 50 50"
              to="360 50 50"
              dur="5s"
              repeatCount="indefinite"
            />
          </path>
        </svg>

        {/* Orbiting planets */}
        {[
          { distance: 20, speed: 2, color: '#FFD700' },
          { distance: 30, speed: 3, color: '#FF6B35' },
          { distance: 40, speed: 4, color: '#6B46C1' }
        ].map((planet, index) => (
          <motion.div
            key={index}
            className="absolute w-2 h-2 rounded-full"
            style={{
              backgroundColor: planet.color,
              top: '50%',
              left: '50%',
              transform: `translate(-50%, -50%) translateY(-${planet.distance}px)`
            }}
            animate={{ rotate: 360 }}
            transition={{
              duration: planet.speed,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </motion.div>

      {/* Central star */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.8, 1, 0.8]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-3 h-3 bg-vedic-accent rounded-full shadow-cosmic" />
      </motion.div>
    </div>
  );

  const renderSpinner = () => {
    switch (variant) {
      case 'chakra':
        return <ChakraSpinner />;
      case 'cosmic':
        return <CosmicSpinner />;
      default:
        return <MandalaSpinner />;
    }
  };

  const LoadingContent = () => (
    <motion.div
      className="flex flex-col items-center space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Spinner */}
      <div className="relative">
        {renderSpinner()}
      </div>

      {/* Loading text */}
      <div className="text-center space-y-2">
        <motion.h3
          className="text-white font-cinzel text-lg font-semibold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {text}
          <span className="inline-block w-6 text-left">{dots}</span>
        </motion.h3>

        {subtext && (
          <motion.p
            className="text-white/70 font-devanagari text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {subtext}
          </motion.p>
        )}

        {/* Rotating mantra */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMantra}
            className="text-vedic-accent font-devanagari text-xs"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
          >
            {mantras[currentMantra]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress bar */}
      {showProgress && (
        <motion.div
          className="w-64 bg-white/20 rounded-full h-2 overflow-hidden"
          initial={{ width: 0 }}
          animate={{ width: 256 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-vedic-accent via-gold-pure to-vedic-primary relative"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
        </motion.div>
      )}

      {/* Progress percentage */}
      {showProgress && (
        <motion.div
          className="text-white/80 font-mono text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {progress}%
        </motion.div>
      )}

      {/* Sacred geometry background */}
      {fullscreen && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
          {/* Floating geometric elements */}
          {Array.from({ length: 8 }, (_, i) => (
            <motion.div
              key={i}
              className="absolute border border-white/20"
              style={{
                width: `${20 + i * 10}px`,
                height: `${20 + i * 10}px`,
                top: `${10 + i * 10}%`,
                left: `${5 + i * 12}%`,
                borderRadius: i % 2 === 0 ? '50%' : '0'
              }}
              animate={{
                rotate: [0, 360],
                scale: [1, 1.1, 1],
                opacity: [0.1, 0.3, 0.1]
              }}
              transition={{
                duration: 8 + i * 2,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          ))}

          {/* Mandala patterns */}
          <svg className="absolute top-10 right-10 w-32 h-32" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="white" strokeWidth="0.5" opacity="0.3" />
            <circle cx="50" cy="50" r="30" fill="none" stroke="white" strokeWidth="0.5" opacity="0.3" />
            <circle cx="50" cy="50" r="15" fill="none" stroke="white" strokeWidth="0.5" opacity="0.3" />
            {Array.from({ length: 8 }, (_, i) => {
              const angle = (i * 45) * Math.PI / 180;
              const x1 = 50 + Math.cos(angle) * 15;
              const y1 = 50 + Math.sin(angle) * 15;
              const x2 = 50 + Math.cos(angle) * 45;
              const y2 = 50 + Math.sin(angle) * 45;

              return (
                <line
                  key={i}
                  x1={x1} y1={y1}
                  x2={x2} y2={y2}
                  stroke="white"
                  strokeWidth="0.5"
                  opacity="0.3"
                />
              );
            })}
          </svg>
        </div>
      )}
    </motion.div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-cosmic-purple via-vedic-primary to-vedic-secondary z-50 flex items-center justify-center">
        <LoadingContent />
      </div>
    );
  }

  return (
    <div className={cn(
      "relative flex items-center justify-center",
      "bg-gradient-to-br from-cosmic-purple/90 via-vedic-primary/90 to-vedic-secondary/90",
      "rounded-2xl backdrop-blur-md",
      fullscreen ? "fixed inset-0 z-50" : "p-8",
      className
    )}>
      <LoadingContent />
    </div>
  );
};

// Preset loading components for different contexts
export const ChartLoadingSpinner = ({ progress = 0 }) => (
  <VedicLoadingSpinner
    variant="cosmic"
    size="large"
    text="Generating Sacred Charts"
    subtext="खगोलीय गणना चल रही है"
    showProgress={true}
    progress={progress}
    fullscreen={true}
  />
);

export const AnalysisLoadingSpinner = () => (
  <VedicLoadingSpinner
    variant="mandala"
    size="medium"
    text="Analyzing Birth Chart"
    subtext="ज्योतिष विश्लेषण"
    fullscreen={true}
  />
);

export const PageLoadingSpinner = ({ message = "Loading Vedic Wisdom..." }) => (
  <VedicLoadingSpinner
    variant="chakra"
    size="large"
    text={message}
    subtext="धैर्य रखें"
    fullscreen={true}
  />
);

export const InlineVedicSpinner = ({ size = "small", variant = "mandala" }) => (
  <VedicLoadingSpinner
    variant={variant}
    size={size}
    text=""
    subtext=""
    fullscreen={false}
    className="inline-flex"
  />
);

export default VedicLoadingSpinner;
