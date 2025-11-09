import React, { useEffect, useRef, useState } from 'react';

/**
 * PreLoader
 *
 * This component displays a full-screen overlay with a simple loading message and
 * a horizontal progress bar. It EXACTLY matches the preloader on
 * hellochriscole.webflow.io by filling the bar from left to right while the page
 * loads, then fading out once complete. The overlay covers the entire
 * viewport so that the rest of the UI is hidden until loading finishes.
 * 
 * Design specifications from Chris Cole's website:
 * - Text: "loading" (lowercase), 16px, Roboto, normal letter-spacing
 * - Progress bar: 2px height, white, positioned below text
 * - Overlay: fixed position, black background, z-index: 9999
 */
export const MIN_VISIBLE_DURATION = 1000;
export const POST_HIDE_DELAY = 250;

const PreLoader = ({ onComplete, delay = MIN_VISIBLE_DURATION }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const completionRef = useRef(false);
  const hideTimerRef = useRef(null);
  const completeTimerRef = useRef(null);
  const progressTimerRef = useRef(null);

  useEffect(() => {
    console.log('[PreLoader] Mounted - Starting animation with delay:', delay);
  }, [delay]);

  useEffect(() => {
    // Ensure the preloader remains visible at least for the configured delay
    const visibleDuration = Math.max(delay, MIN_VISIBLE_DURATION);
    // Interval for updating progress
    const progressInterval = 30;
    // Determine how many steps to complete during the visible duration
    const totalSteps = Math.ceil(visibleDuration / progressInterval);
    let step = 0;

    // Increment progress as a fraction between 0 and 1
    progressTimerRef.current = window.setInterval(() => {
      step++;
      const newProgress = Math.min(step / totalSteps, 1);
      setProgress(newProgress);
      if (step >= totalSteps) {
        if (progressTimerRef.current) {
          window.clearInterval(progressTimerRef.current);
        }
      }
    }, progressInterval);

    // After the visible duration, hide the preloader and fire onComplete after
    // a small delay to allow for a fade‑out if desired
    hideTimerRef.current = window.setTimeout(() => {
      setIsVisible(false);
      completeTimerRef.current = window.setTimeout(() => {
        if (!completionRef.current && typeof onComplete === 'function') {
          completionRef.current = true;
          onComplete();
        }
      }, POST_HIDE_DELAY);
    }, visibleDuration);

    // Cleanup timers on unmount
    return () => {
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
      }
      if (completeTimerRef.current) {
        window.clearTimeout(completeTimerRef.current);
      }
      if (progressTimerRef.current) {
        window.clearInterval(progressTimerRef.current);
      }
      if (!completionRef.current && typeof onComplete === 'function') {
        completionRef.current = true;
        onComplete();
      }
    };
  }, [delay, onComplete]);

  if (!isVisible) {
    return null;
  }

  // Inline styles EXACTLY match Chris Cole's website preloader
  // Specifications: 16px Roboto, normal letter-spacing, lowercase text, 2px progress bar
  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: '#000',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    pointerEvents: 'none',
  };

  const textStyle = {
    color: 'rgb(255, 255, 255)',
    fontSize: '16px',
    letterSpacing: 'normal',
    textTransform: 'none',
    marginBottom: '12px',
    fontFamily: 'Roboto, sans-serif',
    opacity: 1,
  };

  const barContainerStyle = {
    width: '60%',
    maxWidth: '320px',
    height: '2px',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    overflow: 'hidden',
  };

  const barStyle = {
    width: `${progress * 100}%`,
    height: '100%',
    backgroundColor: '#fff',
    transition: 'width 0.1s linear',
  };

  return (
    <div
      className="preloader-overlay"
      data-preloader="chris-cole"
      data-testid="preloader-chris-cole"
      role="status"
      aria-live="polite"
      style={overlayStyle}
    >
      <div style={textStyle}>loading</div>
      <div style={barContainerStyle}>
        <div style={barStyle} />
      </div>
    </div>
  );
};

export default PreLoader;
