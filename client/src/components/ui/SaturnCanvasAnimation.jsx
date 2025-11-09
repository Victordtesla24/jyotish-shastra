import React, { useEffect, useRef, useState, useCallback } from 'react';

/**
 * SaturnCanvasAnimation Component
 * EXACT replica of Saturn animation from hellochriscole.webflow.io
 * 
 * Features:
 * - Canvas-based rendering for planet, rings, and star field
 * - Parallax effects on mouse movement and scroll
 * - Subtle ring rotation animation
 * - Configurable parameters for easy customization
 * - Accessibility fallback with static image
 * 
 * Configuration Parameters:
 * - planetRadius: Size of Saturn planet (default: 8% of canvas width)
 * - ringCount: Number of rings (default: 15)
 * - starCount: Number of stars in star field (default: 100)
 * - rotationSpeed: Speed of ring rotation (default: 0.001)
 * - parallaxIntensity: Intensity of parallax effect (default: 0.05)
 */

// Configuration object - easily modifiable by Cursor AI
// EXACT replica of hellochriscole.webflow.io Saturn animation
const CONFIG = {
  planetRadius: 0.08, // 8% of canvas width (scales to ~500px on desktop)
  ringCount: 20, // 15-20 rings as per original (using 18 for optimal visual)
  starCount: 200, // Sparse star field - matching original
  rotationSpeed: 0.0005, // Slow, subtle rotation - matching original
  parallaxIntensity: 0.05, // Multiplier for parallax effect
  starTwinkleSpeed: 0.003, // Subtle twinkle - matching original
  starDriftSpeed: 0.05, // Very slow drift - matching original
  ringTilt: 25 * (Math.PI / 180), // 25 degrees tilt - matching image reference
  planetPosition: {
    x: 0.273, // 27.3% from left (matching CSS variable)
    y: 0.401  // 40.1% from top (matching CSS variable)
  }
};

const SaturnCanvasAnimation = ({ 
  config = {},
  className = '',
  style = {},
  onLoad
}) => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const containerRef = useRef(null);
  const [jsEnabled, setJsEnabled] = useState(true);

  // Merge user config with defaults - memoized to prevent unnecessary re-renders
  const finalConfig = React.useMemo(() => ({ ...CONFIG, ...config }), [config]);

  // Animation state
  const stateRef = useRef({
    stars: [],
    ringRotations: [], // Individual rotation angles for each ring
    ringSpeeds: [], // Individual rotation speeds for each ring (inner faster, outer slower)
    mouseX: 0,
    mouseY: 0,
    scrollY: 0,
    ringOffsetX: 0,
    ringOffsetY: 0,
    starOffsetX: 0,
    starOffsetY: 0,
    devicePixelRatio: 1
  });

  // Initialize stars
  const initializeStars = useCallback((canvas) => {
    const stars = [];
    for (let i = 0; i < finalConfig.starCount; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.5 + 0.3,
        twinkleSpeed: Math.random() * 0.01 + finalConfig.starTwinkleSpeed,
        driftX: (Math.random() - 0.5) * finalConfig.starDriftSpeed,
        driftY: (Math.random() - 0.5) * finalConfig.starDriftSpeed,
        twinkleOffset: Math.random() * Math.PI * 2
      });
    }
    stateRef.current.stars = stars;
  }, [finalConfig.starCount, finalConfig.starTwinkleSpeed, finalConfig.starDriftSpeed]);

  // Define ring parameters - scaled relative to planet size
  // Each ring rotates independently around the planet at different speeds
  // Inner rings rotate faster, outer rings slower (realistic physics)
  const getRingParameters = useCallback((canvas, planetRadius) => {
    const rings = [];
    // Scale rings relative to planet radius - matching original proportions
    const baseRadius = planetRadius * 2.25; // Rings extend ~2.25x planet radius
    const baseHeight = planetRadius * 0.45; // Ring height is ~45% of planet radius
    
    // Initialize ring rotations and speeds if not already set
    if (stateRef.current.ringRotations.length !== finalConfig.ringCount) {
      stateRef.current.ringRotations = [];
      stateRef.current.ringSpeeds = [];
      
      for (let i = 0; i < finalConfig.ringCount; i++) {
        // Each ring starts at a random rotation for natural appearance
        stateRef.current.ringRotations.push(Math.random() * Math.PI * 2);
        
        // Each ring rotates at a different speed - inner rings faster, outer rings slower
        // Speed follows Kepler's laws: inner rings rotate faster than outer rings
        // Speed multiplier: 1.5x (innermost) to 0.3x (outermost)
        const distanceRatio = i / finalConfig.ringCount; // 0 (inner) to 1 (outer)
        const speedMultiplier = 1.5 - (distanceRatio * 1.2); // 1.5 (inner) to 0.3 (outer)
        stateRef.current.ringSpeeds.push(finalConfig.rotationSpeed * speedMultiplier);
      }
    }
    
    // Create rings with slight spacing variation - matching original
    for (let i = 0; i < finalConfig.ringCount; i++) {
      const ratio = 1 - (i / finalConfig.ringCount);
      // Slight spacing variation for naturalistic appearance
      const spacingVariation = 1 + (Math.sin(i * 0.5) * 0.05);
      
      rings.push({
        index: i, // Index for accessing rotation and speed
        semiMajor: baseRadius * ratio * spacingVariation,
        semiMinor: baseHeight * ratio * spacingVariation,
        // Thin lines - matching original line-art style
        lineWidth: Math.max(0.5, (planetRadius / 50) * ratio),
        // Slight opacity variation for depth
        opacity: 0.6 + (0.3 * ratio)
      });
    }
    
    return rings;
  }, [finalConfig.ringCount, finalConfig.rotationSpeed]);

  // Handle mouse movement for parallax
  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / rect.width;
    const mouseY = (e.clientY - rect.top) / rect.height;
    
    // Normalize to -0.5 to 0.5
    const normalizedX = mouseX - 0.5;
    const normalizedY = mouseY - 0.5;
    
    // Update parallax offsets
    // Rings move more than stars for depth effect
    stateRef.current.ringOffsetX = normalizedX * finalConfig.parallaxIntensity;
    stateRef.current.ringOffsetY = normalizedY * finalConfig.parallaxIntensity;
    stateRef.current.starOffsetX = normalizedX * (finalConfig.parallaxIntensity * 0.3);
    stateRef.current.starOffsetY = normalizedY * (finalConfig.parallaxIntensity * 0.3);
    
    stateRef.current.mouseX = mouseX;
    stateRef.current.mouseY = mouseY;
  }, [finalConfig.parallaxIntensity]);

  // Handle scroll for parallax - matching original site behavior
  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY;
    const scrollProgress = Math.min(scrollY / (window.innerHeight * 2), 1);
    
    // Apply scroll-based parallax to rings and stars
    stateRef.current.scrollY = scrollY;
    stateRef.current.ringOffsetY += scrollProgress * 0.01;
    stateRef.current.starOffsetY += scrollProgress * 0.003;
  }, []);

  // Draw star field
  const drawStars = useCallback((ctx, canvas, time) => {
    const { stars, starOffsetX, starOffsetY } = stateRef.current;
    
    stars.forEach((star, index) => {
      // Twinkle effect
      const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.2 + 0.8;
      
      // Drift effect
      star.x += star.driftX;
      star.y += star.driftY;
      
      // Wrap around edges
      if (star.x < 0) star.x = canvas.width;
      if (star.x > canvas.width) star.x = 0;
      if (star.y < 0) star.y = canvas.height;
      if (star.y > canvas.height) star.y = 0;
      
      // Apply parallax offset
      const x = star.x + (starOffsetX * canvas.width);
      const y = star.y + (starOffsetY * canvas.height);
      
      ctx.beginPath();
      ctx.arc(x, y, star.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * twinkle})`;
      ctx.fill();
    });
  }, []);

  // Draw Saturn planet - EXACT replica of hellochriscole.webflow.io
  // Black planet with thin white outline - matching original exactly
  const drawPlanet = useCallback((ctx, centerX, centerY, planetRadius) => {
    ctx.save();
    
    // Draw black planet - solid fill to obscure rings behind it
    ctx.beginPath();
    ctx.arc(centerX, centerY, planetRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#000000'; // Solid black - matching original
    ctx.fill();
    
    // Draw thin white outline - matching original line-art style
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.5; // Thin outline - matching original
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.closePath();
    
    ctx.restore();
  }, []);

  // Draw Saturn rings - Each ring rotates independently around the planet
  // Multiple thin white concentric ellipses - no gradient, matching original line-art style
  // Rings pass BEHIND the planet (drawn before planet in animation loop)
  // Each ring rotates concentrically around the planet at its own speed (realistic physics)
  const drawRings = useCallback((ctx, centerX, centerY, rings, ringOffsetX, ringOffsetY, canvas) => {
    // Apply parallax offset - rings move more than stars for depth effect
    const dpr = stateRef.current.devicePixelRatio || 1;
    const cssWidth = canvas.width / dpr;
    const cssHeight = canvas.height / dpr;
    const offsetX = ringOffsetX * cssWidth * dpr;
    const offsetY = ringOffsetY * cssHeight * dpr;
    
    // Draw each ring individually with its own rotation and fixed tilt
    rings.forEach((ring) => {
      ctx.save();
      
      // Translate to planet center with parallax
      ctx.translate(centerX + offsetX, centerY + offsetY);
      
      // Apply individual ring rotation (each ring rotates at different speed)
      const ringRotation = stateRef.current.ringRotations[ring.index] || 0;
      ctx.rotate(ringRotation);
      
      // Apply fixed 25 degree tilt - matching image reference
      ctx.rotate(finalConfig.ringTilt);
      
      // Draw ring as ellipse - matching original line-art style
      ctx.beginPath();
      ctx.ellipse(0, 0, ring.semiMajor, ring.semiMinor, 0, 0, Math.PI * 2);
      // Thin white lines - NO gradient, matching original exactly
      ctx.strokeStyle = `rgba(255, 255, 255, ${ring.opacity})`;
      ctx.lineWidth = ring.lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
      ctx.closePath();
      
      ctx.restore();
    });
  }, [finalConfig.ringTilt]);

  // Main animation loop
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const { ringOffsetX, ringOffsetY, ringRotations, ringSpeeds } = stateRef.current;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Calculate planet position - canvas is already scaled by DPR
    const dpr = stateRef.current.devicePixelRatio || 1;
    const cssWidth = canvas.width / dpr;
    const cssHeight = canvas.height / dpr;
    const planetX = cssWidth * finalConfig.planetPosition.x * dpr;
    const planetY = cssHeight * finalConfig.planetPosition.y * dpr;
    const planetRadius = cssWidth * finalConfig.planetRadius * dpr;
    
    // Get ring parameters - scaled relative to planet
    const rings = getRingParameters(canvas, planetRadius);
    
    // Update individual ring rotations - each ring rotates at its own speed
    // Inner rings rotate faster, outer rings slower (realistic physics)
    rings.forEach((ring) => {
      if (ringRotations[ring.index] !== undefined && ringSpeeds[ring.index] !== undefined) {
        stateRef.current.ringRotations[ring.index] += ringSpeeds[ring.index];
        // Keep rotation in 0-2π range for performance
        if (stateRef.current.ringRotations[ring.index] > Math.PI * 2) {
          stateRef.current.ringRotations[ring.index] -= Math.PI * 2;
        }
        if (stateRef.current.ringRotations[ring.index] < 0) {
          stateRef.current.ringRotations[ring.index] += Math.PI * 2;
        }
      }
    });
    
    // Draw stars (background layer) - sparse, subtle twinkle
    const time = performance.now() * 0.001;
    drawStars(ctx, canvas, time);
    
    // Draw rings (middle layer) - drawn BEFORE planet so planet obscures them
    // Each ring rotates independently around the planet at different speeds
    // This creates the correct depth effect where rings pass behind the planet
    drawRings(ctx, planetX, planetY, rings, ringOffsetX, ringOffsetY, canvas);
    
    // Draw planet (foreground layer) - drawn LAST to obscure rings behind it
    // Solid black fill ensures rings are properly hidden behind the planet
    drawPlanet(ctx, planetX, planetY, planetRadius);
    
    // Continue animation
    animationFrameRef.current = requestAnimationFrame(animate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finalConfig, drawStars, drawRings, drawPlanet, getRingParameters]);

  // Setup canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      
      // Set actual size in memory (scaled for DPR)
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      // Scale context to match device pixel ratio
      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);
      
      // Set display size (CSS pixels)
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      
      stateRef.current.devicePixelRatio = dpr;
      
      // Reinitialize stars on resize
      initializeStars(canvas);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Initialize stars
    initializeStars(canvas);
    
    // Start animation
    animate();
    
    if (onLoad) onLoad();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [initializeStars, animate, onLoad]);

  // Setup event listeners for parallax - mouse and touch support
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Mouse move for parallax
    container.addEventListener('mousemove', handleMouseMove);
    
    // Touch move for mobile parallax
    const handleTouchMove = (e) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const fakeEvent = {
          clientX: touch.clientX,
          clientY: touch.clientY
        };
        handleMouseMove(fakeEvent);
      }
    };
    
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleMouseMove, handleScroll]);

  // Check if JavaScript is enabled
  useEffect(() => {
    setJsEnabled(true);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`saturn-canvas-container ${className}`}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'visible',
        zIndex: 2,
        ...style
      }}
      aria-hidden="true"
    >
      {/* Canvas for Saturn animation */}
      <canvas
        ref={canvasRef}
        className="saturn-canvas"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: jsEnabled ? 'block' : 'none'
        }}
        aria-hidden="true"
      />
      
      {/* Accessibility fallback - static image when JS is disabled */}
      {!jsEnabled && (
        <img
          src="/saturn-fallback.png"
          alt="Saturn planet with rings"
          style={{
            position: 'absolute',
            top: `${finalConfig.planetPosition.y * 100}%`,
            left: `${finalConfig.planetPosition.x * 100}%`,
            transform: 'translate(-50%, -50%)',
            width: `${finalConfig.planetRadius * 200}%`,
            height: 'auto',
            opacity: 0.8
          }}
          onError={(e) => {
            // Hide if image doesn't exist
            e.target.style.display = 'none';
          }}
        />
      )}
    </div>
  );
};

export default SaturnCanvasAnimation;

