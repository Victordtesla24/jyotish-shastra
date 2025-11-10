import React, { useEffect, useRef } from 'react';
import SaturnCanvasAnimation from './SaturnCanvasAnimation.jsx';

/**
 * PreLoader - Chris Cole Template Design
 * 
 * Preloader that matches the Chris Cole website template:
 * - Saturn with animated rings positioned on the left
 * - "loading" text centered on screen  
 * - Progress bar below the text
 * - Includes its own Saturn instance for preloader phase
 * Features clean fade-out animation and reliable completion callback
 */
const PreLoader = ({ onComplete, delay = 4000 }) => {
  const fadeTimerRef = useRef(null);

  useEffect(() => {
    console.log('[PreLoader] Chris Cole template preloader starting');
    console.log('[PreLoader] Duration:', delay, 'ms');

    // Start fade-out animation after delay
    fadeTimerRef.current = setTimeout(() => {
      console.log('[PreLoader] Starting fade out animation');
      
      // Add fade-out class to trigger CSS animation
      const preloaderElement = document.querySelector('.chris-cole-preloader');
      if (preloaderElement) {
        preloaderElement.classList.add('fade-out');
        
        // Wait for fade-out animation to complete
        setTimeout(() => {
          console.log('[PreLoader] Animation complete - calling onComplete');
          if (typeof onComplete === 'function') {
            onComplete();
          }
        }, 800); // Match CSS transition duration
      } else {
        // Fallback if element not found
        if (typeof onComplete === 'function') {
          onComplete();
        }
      }
    }, delay);

    // Cleanup timer on unmount
    return () => {
      if (fadeTimerRef.current) {
        clearTimeout(fadeTimerRef.current);
      }
    };
  }, [onComplete, delay]);

  return (
    <div 
      className="chris-cole-preloader"
      role="status" 
      aria-live="polite"
      aria-label="Loading content"
    >
      {/* Saturn with rings - positioned for preloader phase */}
      <SaturnCanvasAnimation className="preloader-saturn" />
      
      {/* Loading content - centered, overlays on Saturn */}
      <div className="loading-content">
        <div className="loading-text">loading</div>
        <div className="loading-progress-bar">
          <div className="loading-progress-fill"></div>
        </div>
      </div>
    </div>
  );
};

export default PreLoader;

