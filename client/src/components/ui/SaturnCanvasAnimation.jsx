import React, { useEffect, useRef, useCallback } from 'react';

/**
 * SaturnCanvasAnimation
 *
 * This component renders a Saturn-like illustration with concentric rings and orbiting moons.
 * It aims to visually replicate the static Saturn animation on hellochriscole.webflow.io.
 * Key points of this implementation:
 *  - The rings do not rotate as a set; they are fixed in a single plane.
 *  - A single tilt is applied to all rings to simulate a 3D perspective.
 *  - Rings are spaced evenly and sized so none intersect the planet.
 *  - Small moons orbit along the rings to add gentle motion.
 *  - A sparse, static star field decorates the background.
 */
const SaturnCanvasAnimation = ({ className = '', style = {} }) => {
  const canvasRef = useRef(null);
  const animationFrameId = useRef(null);
  const starsRef = useRef([]);
  const ringsRef = useRef([]);
  const rotationRef = useRef({ offset: 0, lastTimestamp: 0 });

  // Configuration constants
  const PLANET_RADIUS_RATIO = 0.08;
  const RING_COUNT = 8;
  const RING_ASPECT_RATIO = 0.4;
  const STAR_COUNT = 40;
  const BASE_TILT = Math.PI / 6;
  const TILT_VARIATION = 0.0;
  const MIN_RING_RADIUS_FACTOR = 2.0;
  const MAX_RING_RADIUS_FACTOR = 3.5;
  const BASE_ROTATION_SPEED = 0.0;    // rings don’t spin
  const BASE_MOON_SPEED = 0.0002;     // moons drift slowly

  /** Initialize stars with random positions, sizes, and opacities. */
  const initStars = useCallback((canvas) => {
    const stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.5 + 0.3,
      });
    }
    starsRef.current = stars;
  }, []);

  /** Draw the star field. */
  const drawStars = useCallback((ctx) => {
    starsRef.current.forEach((star) => {
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
      ctx.fill();
      ctx.closePath();
    });
  }, []);

  /** Draw the planet (black disc with faint white outline). */
  const drawPlanet = useCallback((ctx, cx, cy, radius) => {
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#000000';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 1.0;
    ctx.stroke();
    ctx.closePath();
  }, []);

  /**
   * Draw the rings. Each ring is rendered in two passes: back segments and front segments.
   * We classify a segment as front or back based on its unrotated y-coordinate (ry).
   */
  const drawRings = useCallback((ctx, cx, cy, rotationOffset) => {
    const frontSegments = [];
    const segCount = 220;
    ringsRef.current.forEach((ring) => {
      const { a, b, tilt, opacity, speedFactor, phase } = ring;
      const orientationAngle = rotationOffset * speedFactor;  // always zero when speed is 0
      const cosTilt = Math.cos(tilt);
      const sinTilt = Math.sin(tilt);
      const cosOri = Math.cos(orientationAngle);
      const sinOri = Math.sin(orientationAngle);

      for (let s = 0; s < segCount; s++) {
        const t0 = (s / segCount) * Math.PI * 2 + phase;
        const t1 = ((s + 1) / segCount) * Math.PI * 2 + phase;
        const x0 = a * Math.cos(t0);
        const y0 = b * Math.sin(t0);
        const x1 = a * Math.cos(t1);
        const y1 = b * Math.sin(t1);

        // Apply tilt
        const rx0 = x0 * cosTilt - y0 * sinTilt;
        const ry0 = x0 * sinTilt + y0 * cosTilt;
        const rx1 = x1 * cosTilt - y1 * sinTilt;
        const ry1 = x1 * sinTilt + y1 * cosTilt;

        // Orientation rotation (does nothing when rotation speed is zero)
        const fx0 = rx0 * cosOri - ry0 * sinOri;
        const fy0 = rx0 * sinOri + ry0 * cosOri;
        const fx1 = rx1 * cosOri - ry1 * sinOri;
        const fy1 = rx1 * sinOri + ry1 * cosOri;

        // Brighten near side (positive x) and darken far side
        const normX = ((fx0 / a) + 1) / 2;
        const alpha = opacity * (0.5 + 0.5 * normX);

        // Classify segment as front or back based on pre-orientation ry
        const isFront = ((ry0 + ry1) / 2) > 0;
        if (isFront) {
          frontSegments.push({
            x0: fx0 + cx, y0: fy0 + cy,
            x1: fx1 + cx, y1: fy1 + cy,
            alpha,
          });
        } else {
          ctx.beginPath();
          ctx.moveTo(cx + fx0, cy + fy0);
          ctx.lineTo(cx + fx1, cy + fy1);
          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.lineWidth = 1.0;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.stroke();
        }
      }
    });
    return frontSegments;
  }, []);

  /** Main render loop. */
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const width = canvas.width;
    const height = canvas.height;
    const planetRadius = width * PLANET_RADIUS_RATIO;
    const cx = width * 0.273;
    const cy = height * 0.401;

    // Update rotation offset (remains zero because BASE_ROTATION_SPEED is zero)
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (!rotationRef.current.lastTimestamp) {
      rotationRef.current.lastTimestamp = now;
    }
    const dt = now - rotationRef.current.lastTimestamp;
    rotationRef.current.lastTimestamp = now;
    rotationRef.current.offset += dt * BASE_ROTATION_SPEED;

    // Advance moon angles
    ringsRef.current.forEach((ring) => {
      ring.moonAngle += dt * BASE_MOON_SPEED * ring.speedFactor;
    });

    drawStars(ctx);

    // Draw back half of rings and collect front segments
    const frontSegments = drawRings(ctx, cx, cy, rotationRef.current.offset);

    // Compute moon positions and split into back and front
    const backMoons = [];
    const frontMoons = [];
    ringsRef.current.forEach((ring) => {
      const { a, b, tilt, speedFactor, phase, moonAngle } = ring;
      const t = moonAngle + phase;
      const cosTilt = Math.cos(tilt);
      const sinTilt = Math.sin(tilt);
      const x = a * Math.cos(t);
      const y = b * Math.sin(t);
      const rx = x * cosTilt - y * sinTilt;
      const ry = x * sinTilt + y * cosTilt;
      const orientationAngle = rotationRef.current.offset * speedFactor;
      const cosOri = Math.cos(orientationAngle);
      const sinOri = Math.sin(orientationAngle);
      const fx = rx * cosOri - ry * sinOri;
      const fy = rx * sinOri + ry * cosOri;
      const px = cx + fx;
      const py = cy + fy;
      if (fy > 0) {
        frontMoons.push({ x: px, y: py });
      } else {
        backMoons.push({ x: px, y: py });
      }
    });

    // Draw moons behind the planet
    backMoons.forEach((m) => {
      ctx.beginPath();
      ctx.arc(m.x, m.y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,1)';
      ctx.fill();
    });

    // Draw planet
    drawPlanet(ctx, cx, cy, planetRadius);

    // Draw front ring segments
    frontSegments.forEach((seg) => {
      ctx.beginPath();
      ctx.moveTo(seg.x0, seg.y0);
      ctx.lineTo(seg.x1, seg.y1);
      ctx.strokeStyle = `rgba(255, 255, 255, ${seg.alpha})`;
      ctx.lineWidth = 1.0;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    });

    // Draw moons in front of the planet
    frontMoons.forEach((m) => {
      ctx.beginPath();
      ctx.arc(m.x, m.y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,1)';
      ctx.fill();
    });

    animationFrameId.current = requestAnimationFrame(render);
  }, [drawStars, drawRings, drawPlanet]);

  // Resize canvas and initialize stars/rings on mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      // Initialize stars
      initStars(canvas);
      // Initialize rings with a single global tilt
      const planetRadiusPx = rect.width * dpr * PLANET_RADIUS_RATIO;
      const globalTilt = BASE_TILT + (Math.random() - 0.5) * TILT_VARIATION;
      const newRings = [];
      const deltaFactor = (MAX_RING_RADIUS_FACTOR - MIN_RING_RADIUS_FACTOR) / (RING_COUNT - 1);
      for (let i = 0; i < RING_COUNT; i++) {
        const ringFactor = MIN_RING_RADIUS_FACTOR + deltaFactor * i;
        const a = planetRadiusPx * ringFactor;
        const b = a * RING_ASPECT_RATIO;
        const tilt = globalTilt;
        const opacity = 0.8 - 0.4 * (i / (RING_COUNT - 1));
        const speedFactor = 1 + (Math.random() - 0.5) * 0.4;
        const phase = Math.random() * Math.PI * 2;
        const moonAngle = Math.random() * Math.PI * 2;
        newRings.push({ a, b, tilt, opacity, speedFactor, phase, moonAngle });
      }
      ringsRef.current = newRings;
    };
    resize();
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
    };
  }, [initStars, BASE_TILT]);

  // Start the render loop on mount
  useEffect(() => {
    render();
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [render]);

  return (
    <div
      className={`saturn-canvas-container parallax-bg ${className}`.trim()}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        ...style,
      }}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%' }}
        aria-hidden="true"
      />
    </div>
  );
};

export default SaturnCanvasAnimation;
