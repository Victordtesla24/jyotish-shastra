import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

/**
 * PlanetaryAnimations Component
 * EXACTLY matching Chris Cole's planetary animations
 * Planets float like fish in a fish tank - smooth, continuous drift across screen
 * Saturn positioned on LEFT side matching Chris Cole exactly
 */
const PlanetaryAnimations = ({ count = 1 }) => {
  const containerRef = useRef(null);
  const saturnRef = useRef(null);

  // White Saturn SVG - ENHANCED for better visibility with BRIGHTER rings
  const SaturnSVG = ({ size = '127.58px', className = '' }) => (
    <svg
      ref={saturnRef}
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={className}
      style={{ 
        filter: 'drop-shadow(0 0 15px rgba(255, 255, 255, 0.8)) drop-shadow(0 0 25px rgba(255, 255, 255, 0.5))',
        position: 'absolute',
        opacity: 1, /* INCREASED for better visibility */
        width: '127.58px',
        height: '127.58px',
        left: '10%',
        top: '50%',
        transform: 'translate(0, -50%)'
      }}
    >
      {/* Saturn Planet Body - EXACTLY matching Chris Cole's white outline */}
      <circle
        cx="100"
        cy="100"
        r="50"
        fill="none"
        stroke="white"
        strokeWidth="2.5"
        opacity="1"
      />
      {/* Saturn Rings - EXACTLY matching Chris Cole's -50° angle for dramatic tilt */}
      <ellipse
        cx="100"
        cy="100"
        rx="70"
        ry="24"
        fill="none"
        stroke="white"
        strokeWidth="2.5"
        opacity="1"
        transform="rotate(-50 100 100)"
      />
      <ellipse
        cx="100"
        cy="100"
        rx="80"
        ry="20"
        fill="none"
        stroke="white"
        strokeWidth="2"
        opacity="0.95"
        transform="rotate(-50 100 100)"
      />
      <ellipse
        cx="100"
        cy="100"
        rx="60"
        ry="28"
        fill="none"
        stroke="white"
        strokeWidth="2.5"
        opacity="1"
        transform="rotate(-50 100 100)"
      />
      <ellipse
        cx="100"
        cy="100"
        rx="90"
        ry="16"
        fill="none"
        stroke="white"
        strokeWidth="1.5"
        opacity="0.9"
        transform="rotate(-50 100 100)"
      />
      {/* Additional inner glow for enhanced visibility */}
      <ellipse
        cx="100"
        cy="100"
        rx="65"
        ry="26"
        fill="none"
        stroke="white"
        strokeWidth="1"
        opacity="0.7"
        transform="rotate(-50 100 100)"
      />
    </svg>
  );

  useEffect(() => {
    if (!saturnRef.current || !containerRef.current) return;

    const saturn = saturnRef.current;
    // Note: containerRef is used for checking existence only, dimensions not needed for CSS positioning
    // eslint-disable-next-line no-unused-vars
    const _container = containerRef.current; // Used for existence check only

    // Initial position - positioned in visible viewport
    // CSS sets base position: left: 10%, top: 20%
    // GSAP will animate relative to this CSS position (0,0 relative to CSS position)
    // Set initial GSAP position to 0,0 (relative to CSS position)
    // Use transform: translate() instead of x/y to preserve CSS position
    gsap.set(saturn, {
      x: 0,
      y: 0,
      opacity: 0.9,
      transformOrigin: '50% 50%'
    });

    // Create continuous drift animation - like fish in a fish tank
    // Smooth, organic movement across the screen
    const createDriftAnimation = () => {
      const timeline = gsap.timeline({
        repeat: -1,
        defaults: { ease: 'sine.inOut' }
      });

      // Random drift paths - smooth, continuous movement
      // Small movements relative to initial position (CSS sets base position)
      const paths = [
        // Start by drifting upward to reveal full rings
        { x: -18, y: -32, duration: 22 },
        // Sweep gently downward and forward
        { x: 24, y: 20, duration: 26 },
        // Glide back past center with a subtle rise
        { x: -20, y: -18, duration: 24 },
        // Ease into a lower arc before returning
        { x: 16, y: 14, duration: 26 },
        // Reset to the anchored middle-left position
        { x: 0, y: 0, duration: 24 }
      ];

      paths.forEach((path, index) => {
        timeline.to(
          saturn,
          {
            x: path.x,
            y: path.y,
            duration: path.duration,
            onComplete: () => {
              // Subtle rotation during drift
              gsap.to(saturn, {
                rotation: `+=${Math.random() * 8 - 4}`,
                duration: path.duration * 0.5,
                ease: 'sine.inOut'
              });
            }
          },
          index === 0 ? 0 : '>'
        );
      });

      // Continuous slow rotation
      const rotationTween = gsap.to(saturn, {
        rotation: 360,
        duration: 60,
        repeat: -1,
        ease: 'none'
      });

      return { timeline, rotationTween };
    };

    const { timeline, rotationTween } = createDriftAnimation();

    // Cleanup
    return () => {
      timeline.kill();
      rotationTween.kill();
      gsap.killTweensOf(saturn);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="planetary-animations-container-chris-cole" 
      aria-hidden="true"
      style={{
        position: 'absolute', /* Absolute positioning to match Chris Cole's layout */
        top: 0,
        left: 0,
        width: '100%', /* Full width to allow Saturn positioning */
        height: '100%', /* Full height to allow Saturn positioning */
        pointerEvents: 'none', /* Don't block clicks */
        overflow: 'visible', /* Allow Saturn to be visible */
        zIndex: 1, /* Behind content but visible */
        backgroundColor: 'transparent' /* Transparent - doesn't block content */
      }}
    >
      {/* Saturn - positioned on LEFT side matching Chris Cole exactly */}
      <SaturnSVG size="127.58px" className="saturn-chris-cole" />
    </div>
  );
};

export default PlanetaryAnimations;
