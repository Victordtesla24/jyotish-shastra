import React, { useEffect, useRef, useState } from 'react';

/**
 * Chris Cole inspired pre-loader matching hellochriscole.webflow.io design.
 * Simple "loading" text with progress bar animation.
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
    const visibleDuration = Math.max(delay, MIN_VISIBLE_DURATION);
    const progressInterval = 50;
    const progressSteps = visibleDuration / progressInterval;
    const maxProgress = 92;
    let currentStep = 0;

    // Animate progress bar (matching Chris Cole's 92px width)
    progressTimerRef.current = window.setInterval(() => {
      currentStep++;
      const newProgress = Math.min((currentStep / progressSteps) * maxProgress, maxProgress);
      setProgress(newProgress);

      if (currentStep >= progressSteps) {
        if (progressTimerRef.current) {
          window.clearInterval(progressTimerRef.current);
        }
      }
    }, progressInterval);

    hideTimerRef.current = window.setTimeout(() => {
      setIsVisible(false);

      completeTimerRef.current = window.setTimeout(() => {
        if (!completionRef.current && typeof onComplete === 'function') {
          completionRef.current = true;
          onComplete();
        }
      }, POST_HIDE_DELAY);
    }, visibleDuration);

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

  return (
    <div
      className="loading-indicator"
      data-preloader="chris-cole"
      data-testid="preloader-chris-cole"
      role="status"
      aria-live="polite"
    >
      <div className="loading-text">loading</div>
      <div className="loading-bar">
        <div 
          className="loading-progress"
          style={{ width: `${progress}px`, height: '2px' }}
        />
      </div>
    </div>
  );
};

export default PreLoader;
