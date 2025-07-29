import React from 'react';

/**
 * Vedic Loading Spinner Component
 * Uses consistent Vedic design system with sacred symbols and animations
 */
const VedicLoadingSpinner = ({
  size = 'md',
  text = 'Loading...',
  type = 'mandala',
  showText = true,
  className = ''
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

  const getSpinnerComponent = () => {
    switch (type) {
      case 'mandala':
        return (
          <div className={`spinner-mandala ${getSizeClasses()}`}>
          </div>
        );
      case 'chakra':
        return (
          <div className="relative">
            <div className={`spinner-vedic ${getSizeClasses()}`}></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="vedic-symbol symbol-chakra text-saffron animate-pulse"></span>
            </div>
          </div>
        );
      case 'lotus':
        return (
          <div className="relative">
            <div className={`spinner-vedic ${getSizeClasses()}`}></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="vedic-symbol symbol-lotus text-gold animate-pulse"></span>
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
      default:
        return <div className={`spinner-vedic ${getSizeClasses()}`}></div>;
    }
  };

  return (
    <div className={`loading-vedic ${className}`}>
      {getSpinnerComponent()}
      {showText && (
        <div className="flex flex-col items-center gap-2">
          <p className="text-secondary font-medium">{text}</p>
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-saffron rounded-full animate-pulse" style={{animationDelay: '0ms'}}></div>
            <div className="w-2 h-2 bg-gold rounded-full animate-pulse" style={{animationDelay: '150ms'}}></div>
            <div className="w-2 h-2 bg-maroon rounded-full animate-pulse" style={{animationDelay: '300ms'}}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VedicLoadingSpinner;
