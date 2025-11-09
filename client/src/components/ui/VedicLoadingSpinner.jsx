import React from 'react';

/**
 * VedicLoadingSpinner Component
 * Loading spinner with Vedic astrology theme
 * Displays a spinner with optional text message
 */
const VedicLoadingSpinner = ({ text = 'Loading...', className = '' }) => {
  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      <div className="relative w-16 h-16">
        {/* Outer ring */}
        <div 
          className="absolute inset-0 border-4 border-vedic-gold border-t-transparent rounded-full animate-spin"
          style={{
            animation: 'spin 1s linear infinite',
            borderColor: 'rgba(255, 215, 0, 0.3)',
            borderTopColor: 'rgba(255, 215, 0, 1)'
          }}
        />
        {/* Inner ring */}
        <div 
          className="absolute inset-2 border-4 border-vedic-gold border-b-transparent rounded-full animate-spin"
          style={{
            animation: 'spin 0.8s linear infinite reverse',
            borderColor: 'rgba(255, 215, 0, 0.2)',
            borderBottomColor: 'rgba(255, 215, 0, 0.8)'
          }}
        />
        {/* Center dot */}
        <div 
          className="absolute inset-1/2 w-2 h-2 bg-vedic-gold rounded-full transform -translate-x-1/2 -translate-y-1/2"
          style={{
            backgroundColor: 'rgba(255, 215, 0, 0.8)',
            top: '50%',
            left: '50%'
          }}
        />
      </div>
      {text && (
        <p 
          className="text-sm text-vedic-gold font-roboto"
          style={{
            color: 'rgba(255, 215, 0, 0.9)',
            fontFamily: "'Roboto', sans-serif"
          }}
        >
          {text}
        </p>
      )}
    </div>
  );
};

export default VedicLoadingSpinner;

