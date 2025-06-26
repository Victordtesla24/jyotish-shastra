import React, { useState, useEffect } from 'react';

const LoadingSpinner = ({
  size = 'medium',
  text = 'Loading...',
  type = 'mandala',
  showProgress = false,
  progress = 0
}) => {
  const [dots, setDots] = useState('');
  const [currentPhase, setCurrentPhase] = useState(0);

  const loadingPhases = [
    'Connecting to cosmic forces...',
    'Calculating planetary positions...',
    'Aligning celestial energies...',
    'Generating sacred charts...',
    'Finalizing Vedic analysis...'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (showProgress) {
      const phaseIndex = Math.floor((progress / 100) * loadingPhases.length);
      setCurrentPhase(Math.min(phaseIndex, loadingPhases.length - 1));
    }
  }, [progress, showProgress]);

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-8 h-8';
      case 'large':
        return 'w-16 h-16';
      default:
        return 'w-12 h-12';
    }
  };

  const renderMandalaSpinner = () => (
    <div className="relative">
      {/* Outer ring */}
      <div className={`${getSizeClasses()} border-4 border-gold-champagne rounded-full animate-spin-slow`}>
        <div className="absolute inset-1 border-2 border-vedic-gold rounded-full animate-spin" style={{ animationDirection: 'reverse' }}>
          <div className="absolute inset-1 border border-vedic-accent rounded-full animate-spin-slow" style={{ animationDuration: '3s' }}>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-vedic-accent rounded-full animate-pulse-vedic"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Sacred symbols rotating around */}
      <div className="absolute inset-0 animate-spin-slow" style={{ animationDuration: '8s' }}>
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-xs">🕉️</div>
        <div className="absolute top-1/2 -right-2 transform -translate-y-1/2 text-xs">☸️</div>
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-xs">🪷</div>
        <div className="absolute top-1/2 -left-2 transform -translate-y-1/2 text-xs">📿</div>
      </div>

      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-radial from-vedic-accent/30 to-transparent animate-pulse-vedic rounded-full scale-150"></div>
    </div>
  );

  const renderChakraSpinner = () => (
    <div className="relative">
      <div className={`${getSizeClasses()} relative`}>
        {/* Seven chakra-colored rings */}
        {['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'].map((color, index) => (
          <div
            key={index}
            className="absolute inset-0 rounded-full animate-spin"
            style={{
              border: `2px solid ${color}30`,
              borderTopColor: color,
              animationDuration: `${1 + index * 0.2}s`,
              animationDelay: `${index * 0.1}s`,
              transform: `scale(${1 - index * 0.1})`,
            }}
          />
        ))}

        {/* Center Om symbol */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-vedic-accent animate-pulse-vedic">ॐ</span>
        </div>
      </div>
    </div>
  );

  const renderPlanetarySpinner = () => (
    <div className="relative">
      <div className={`${getSizeClasses()} relative`}>
        {/* Sun in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 bg-yellow-400 rounded-full animate-pulse-vedic shadow-lg"></div>
        </div>

        {/* Planetary orbits */}
        {[
          { planet: '☿', color: '#98FB98', orbit: 'inset-2', duration: '2s' },
          { planet: '♀', color: '#FFB6C1', orbit: 'inset-1', duration: '3s' },
          { planet: '♂', color: '#FF6B6B', orbit: 'inset-0', duration: '4s' },
        ].map((item, index) => (
          <div
            key={index}
            className={`absolute ${item.orbit} border border-white/20 rounded-full animate-spin`}
            style={{ animationDuration: item.duration }}
          >
            <div
              className="absolute -top-1 left-1/2 transform -translate-x-1/2 text-sm"
              style={{ color: item.color }}
            >
              {item.planet}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSpinner = () => {
    switch (type) {
      case 'chakra':
        return renderChakraSpinner();
      case 'planetary':
        return renderPlanetarySpinner();
      default:
        return renderMandalaSpinner();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[9999]">
      <div className="loading-spinner-container">
        <div className="flex flex-col items-center space-y-6">
          {/* Spinner */}
          <div className="relative">
            {renderSpinner()}
          </div>

          {/* Loading text */}
          <div className="text-center">
            <div className="text-white font-cinzel text-lg font-semibold mb-2">
              {showProgress ? loadingPhases[currentPhase] : text}
              <span className="inline-block w-6 text-left">{dots}</span>
            </div>

            {/* Sanskrit subtitle */}
            <div className="text-white/70 font-devanagari text-sm">
              कृपया प्रतीक्षा करें
            </div>
          </div>

          {/* Progress bar */}
          {showProgress && (
            <div className="w-64 bg-white/20 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-vedic-accent to-gold-pure h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              >
                <div className="h-full bg-white/30 rounded-full animate-pulse-vedic"></div>
              </div>
            </div>
          )}

          {/* Percentage display */}
          {showProgress && (
            <div className="text-white/80 font-mono text-sm">
              {progress}%
            </div>
          )}

          {/* Sacred geometry background */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-10 left-10 w-16 h-16 border border-white/10 rotate-45 animate-spin-slow"></div>
            <div className="absolute top-20 right-20 w-12 h-12 border border-vedic-accent/20 rounded-full animate-pulse-vedic"></div>
            <div className="absolute bottom-20 left-20 w-20 h-20 border border-white/5 rotate-12 animate-float"></div>
            <div className="absolute bottom-10 right-10 w-8 h-8 border border-gold-pure/30 rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced loading variants for different contexts
export const PageLoader = ({ message = "Loading sacred knowledge..." }) => (
  <LoadingSpinner type="mandala" text={message} size="large" />
);

export const ChartLoader = ({ progress = 0 }) => (
  <LoadingSpinner
    type="planetary"
    text="Calculating chart..."
    size="large"
    showProgress={true}
    progress={progress}
  />
);

export const ComponentLoader = ({ size = "medium" }) => (
  <LoadingSpinner type="chakra" text="Loading..." size={size} />
);

export const InlineLoader = () => (
  <div className="inline-flex items-center space-x-2">
    <div className="w-4 h-4 border-2 border-vedic-accent border-t-transparent rounded-full animate-spin"></div>
    <span className="text-vedic-text-light text-sm">Loading...</span>
  </div>
);

export default LoadingSpinner;
