import React, { useEffect, useRef, useState } from 'react';

/**
 * Chris Cole inspired pre-loader with concentric ring animation.
 * The animation mirrors the template reference using lightweight CSS
 * so it renders instantly without layout thrashing.
 */
export const MIN_VISIBLE_DURATION = 1000;
export const POST_HIDE_DELAY = 250;

const PreLoader = ({ onComplete, delay = MIN_VISIBLE_DURATION }) => {
  const [isVisible, setIsVisible] = useState(true);
  const completionRef = useRef(false);
  const hideTimerRef = useRef(null);
  const completeTimerRef = useRef(null);

  useEffect(() => {
    const visibleDuration = Math.max(delay, MIN_VISIBLE_DURATION);

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
      className="preloader-overlay"
      data-preloader="chris-cole"
      data-testid="preloader-chris-cole"
      role="status"
      aria-live="polite"
    >
      <div className="preloader-core" aria-hidden="true">
        <div className="preloader-rings">
          {Array.from({ length: 8 }).map((_, index) => (
            <span
              key={`ring-${index + 1}`}
              className={`preloader-ring preloader-ring-${index + 1}`}
              data-testid="preloader-ring"
            />
          ))}
          <span className="preloader-core-dot" />
        </div>
      </div>
    </div>
  );
};

export default PreLoader;
