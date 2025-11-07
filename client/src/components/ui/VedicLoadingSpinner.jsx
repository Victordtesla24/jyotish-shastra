import React from 'react';
import '../../styles/vedic-design-system.css';
import '../../styles/chris-cole-enhancements.css';

/**
 * Vedic Loading Spinner Component
 * Uses consistent Vedic design system with sacred symbols and animations
 * Enhanced with divine loading styles from Chris Cole enhancements
 */
const VedicLoadingSpinner = ({
  size = 'md',
  text = 'Loading...',
  type = 'mandala',
  showText = true,
  className = '',
  color = 'saffron'
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-6 h-6';
      case 'lg':
        return 'w-16 h-16';
      case 'xl':
        return 'w-20 h-20';
      default:
        return 'w-10 h-10';
    }
  };

  const getSpinnerColor = () => {
    switch (color) {
      case 'saffron':
        return 'var(--vedic-saffron)';
      case 'gold':
        return 'var(--vedic-gold)';
      default:
        return 'var(--vedic-saffron)';
    }
  };

  const getSpinnerComponent = () => {
    const spinnerColor = getSpinnerColor();
    const spinnerStyle = {
      borderTopColor: spinnerColor,
      borderColor: `rgba(${color === 'saffron' ? '255, 153, 51' : '255, 215, 0'}, 0.2)`
    };

    switch (type) {
      case 'mandala':
        return (
          <div 
            className={`spinner-mandala ${getSizeClasses()}`}
            style={spinnerStyle}
          >
          </div>
        );
      case 'chakra':
        return (
          <div className="relative">
            <div 
              className={`spinner-vedic ${getSizeClasses()}`}
              style={spinnerStyle}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span 
                className="vedic-symbol symbol-chakra animate-pulse"
                style={{ color: spinnerColor }}
              ></span>
            </div>
          </div>
        );
      case 'lotus':
        return (
          <div className="relative">
            <div 
              className={`spinner-vedic ${getSizeClasses()}`}
              style={spinnerStyle}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span 
                className="vedic-symbol symbol-lotus animate-pulse"
                style={{ color: spinnerColor }}
              ></span>
            </div>
          </div>
        );
      case 'om':
        return (
          <div className="relative">
            <div className={`spinner-vedic ${getSizeClasses()}`}></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="vedic-symbol symbol-om text-maroon animate-pulse"></span>
            </div>
          </div>
        );
      case 'cosmic':
        return (
          <div className="relative">
            <div className={`spinner-cosmic ${getSizeClasses()}`} style={spinnerStyle}></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="vedic-symbol symbol-star animate-celestial-glow" style={{ color: spinnerColor }}></span>
            </div>
          </div>
        );
      case 'divine':
        return (
          <div className="relative">
            <div className={`spinner-divine ${getSizeClasses()}`} style={spinnerStyle}></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="vedic-symbol symbol-om animate-sacred-pulse" style={{ color: spinnerColor }}></span>
            </div>
          </div>
        );
      case 'celestial':
        return (
          <div className="relative">
            <div className={`spinner-celestial ${getSizeClasses()}`} style={spinnerStyle}></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="vedic-symbol symbol-planet animate-cosmic-drift" style={{ color: spinnerColor }}></span>
            </div>
          </div>
        );
      default:
        return <div className={`spinner-vedic ${getSizeClasses()}`}></div>;
    }
  };

  return (
    <div className={`loading-vedic ${className}`}>
      {getSpinnerComponent()}
      {showText && (
        <div className="flex flex-col items-center gap-2">
          <p className="loading-text">{text}</p>
          <div className="loading-dots">
            <div className="loading-dot"></div>
            <div className="loading-dot"></div>
            <div className="loading-dot"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VedicLoadingSpinner;
