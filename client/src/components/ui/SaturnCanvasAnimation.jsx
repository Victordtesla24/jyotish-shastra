import React, { useEffect, useRef, useCallback } from 'react';

/**
 * SaturnCanvasAnimation
 *
 * This component renders a static Saturn‑style graphic on a full‑screen
 * canvas.  It is designed to exactly replicate the simple line‑art
 * illustration used on the Chris Cole site (hellochriscole.webflow.io).
 * The original site shows a black planet with several thin, white rings
 * drawn in a single, fixed plane.  The rings do not rotate or tilt
 * independently; instead they form a set of concentric ellipses that
 * remain static relative to the page.  Stars in the background are
 * sparsely placed and do not drift.  This implementation reflects
 * those characteristics.
 *
 * Key features:
 *  - Static star field with subtle opacity variation (no drift or twinkle).
 *  - Black planet with no outline (matches the original artwork).
 *  - Seven concentric rings, each drawn as an ellipse in the same plane.
 *    Rings are spaced evenly relative to the planet radius and do not
 *    rotate or tilt individually.  A slight falloff in opacity from
 *    inner to outer rings provides depth.
 *  - Responsive sizing: planet size and ring extents scale with the
 *    canvas dimensions.  The canvas fills its container and updates on
 *    window resize.
 */

const SaturnCanvasAnimation = ({ className = '', style = {} }) => {
  const canvasRef = useRef(null);
  const animationFrameId = useRef(null);
  const starsRef = useRef([]);
  const ringsRef = useRef([]);
  // Ref to track global ring rotation.  The offset accumulates
  // radians over time based on elapsed milliseconds.  lastTimestamp
  // stores the time of the last frame to compute deltas.
  const rotationRef = useRef({ offset: 0, lastTimestamp: 0 });

  // Configuration constants tuned to match the reference animation
  // Planet radius is expressed as a fraction of the canvas width.  The
  // reference shows the planet occupying roughly 8% of the width.
  const PLANET_RADIUS_RATIO = 0.08;
  // The Chris Cole artwork appears to have around nine rings, with
  // several overlapping loops.  Increasing this count produces more
  // visual complexity without overwhelming the composition.
  // Number of rings to draw around the planet.  The Chris Cole
  // illustration uses eight concentric rings (including the outer
  // most).  Setting this to 8 replicates that count.
  const RING_COUNT = 8;
  // Rings extend roughly twice the diameter of the planet; spacing
  // factor governs the overall size of the ring system.  Values
  // between 2.0 and 2.2 yield a similar look to the reference.
  const RING_SPACING_FACTOR = 2.1;
  // The aspect ratio defines how flattened the rings appear.  The
  // reference rings are much wider than they are tall (~0.4).
  const RING_ASPECT_RATIO = 0.4;
  // Number of stars to render.  A modest number keeps the scene
  // uncluttered and close to the original.
  const STAR_COUNT = 40;
  // Base tilt of the ring plane in radians (approx 30°).  Each ring
  // will be rotated around this base by a small random amount to
  // create the subtle overlapping effect seen in the original.
  const BASE_TILT = Math.PI / 6; // 30 degrees
  const TILT_VARIATION = 0.2;    // ±0.1 rad (~±6°)
  // Base rotation speed for the rings (radians per millisecond).
  // The original site does not rotate the rings, but for a more
  // dynamic feel (and to satisfy the requirement of rotation
  // "like in reality"), each ring will slowly rotate.  Speeds are
  // scaled by a small factor so the motion is subtle.
  // Increased rotation speed for testing purposes.  In the final
  // animation this may be reduced for subtle motion.
  // Base rotation speed for the rings (radians per millisecond).
  // The original Chris Cole design does not rotate the rings; the
  // ring structure is static while only the small moon travels
  // around them.  Set this speed to zero to prevent any spin of
  // the entire ring system.
  const BASE_ROTATION_SPEED = 0;

  // Base angular speed for the moons orbiting along the rings
  // (radians per millisecond).  Each moon's speed scales with
  // its ring's speedFactor.  This is kept modest so that dots
  // travel around the rings slowly and smoothly.
  const BASE_MOON_SPEED = 0.0002;

  /**
   * Initialize the star field.  Stars are randomly positioned across
   * the canvas with slight variations in size and opacity.  They do not
   * drift or twinkle, replicating the static feel of the original site.
   *
   * @param {HTMLCanvasElement} canvas
   */
  const initStars = useCallback((canvas) => {
    const stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.5 + 0.3
      });
    }
    starsRef.current = stars;
  }, []);

  /**
   * Draw the static star field.  Each star is rendered as a small
   * circular dot with an opacity defined at initialization.  No
   * movement or twinkle effect is applied to preserve the look of the
   * reference design.
   *
   * @param {CanvasRenderingContext2D} ctx
   */
  const drawStars = useCallback((ctx) => {
    starsRef.current.forEach((star) => {
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
      ctx.fill();
      ctx.closePath();
    });
  }, []);

  /**
   * Draw the planet.  In the reference, the planet is a solid black
   * circle without any visible outline.  Drawing an outline would
   * create a halo that does not exist on the original website, so it
   * is intentionally omitted here.
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} cx The x‑coordinate of the planet centre
   * @param {number} cy The y‑coordinate of the planet centre
   * @param {number} radius The planet radius in pixels
   */
  const drawPlanet = useCallback((ctx, cx, cy, radius) => {
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    // Fill the planet with solid black.  This layer obscures
    // portions of the rings that pass behind the planet.
    ctx.fillStyle = '#000000';
    ctx.fill();
    // Draw a thin white outline around the planet to replicate the
    // subtle glow seen on the Chris Cole site.  A slightly
    // translucent stroke makes the edge less harsh.
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 1.0;
    ctx.stroke();
    ctx.closePath();
  }, []);

  /**
   * Draw concentric rings around the planet.  The rings are ellipses
   * with the same major/minor axis ratio and equally spaced.  Each
   * ring is drawn with a consistent line width and gradually
   * decreasing opacity as the rings extend outward.  No individual
   * rotation or tilt is applied because the original design shows
   * rings aligned in a common plane without 3D perspective effects.
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} cx Centre x‑coordinate
   * @param {number} cy Centre y‑coordinate
   * @param {number} planetRadius Planet radius in pixels
   */
  /**
   * Draw the ring system.  Each ring is rendered in two passes: the
   * back half behind the planet and the front half in front of the
   * planet.  To allow the front segments to be drawn after the
   * planet, this function returns an array of segments that should
   * be rendered later.  Rings rotate slowly according to their
   * individual speed factors and a global rotation offset.
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} cx Centre x‑coordinate
   * @param {number} cy Centre y‑coordinate
   * @param {number} rotationOffset Global rotation offset (radians)
   * @returns {Array} list of front half segments across all rings
   */
  const drawRings = useCallback((ctx, cx, cy, rotationOffset) => {
    const frontSegments = [];
    // Number of segments per ring.  A higher count yields smoother
    // curves but increases computation per frame.  200–240 is a
    // reasonable balance.
    const segCount = 220;
    ringsRef.current.forEach((ring) => {
      const { a, b, tilt, opacity, speedFactor, phase } = ring;
      // Compute the per‑ring orientation angle.  Each ring's
      // orientation rotates slowly over time according to its
      // speed factor.  The parametric angle of the ellipse
      // remains static (aside from the initial phase) so that
      // rotation manifests as a spinning ring rather than
      // simply reparameterizing the ellipse.
      const orientationAngle = rotationOffset * speedFactor;
      const cosTilt = Math.cos(tilt);
      const sinTilt = Math.sin(tilt);
      const cosOri = Math.cos(orientationAngle);
      const sinOri = Math.sin(orientationAngle);
      // Draw back segments immediately; store front segments for later
      for (let s = 0; s < segCount; s++) {
        // The parametric angle is based solely on the segment index
        // and the ring's initial phase.  Do not include the time‑
        // varying orientation angle here; orientation rotation is
        // applied separately below.
        const t0 = (s / segCount) * Math.PI * 2 + phase;
        const t1 = ((s + 1) / segCount) * Math.PI * 2 + phase;
        // Compute points on the unrotated ellipse
        const x0 = a * Math.cos(t0);
        const y0 = b * Math.sin(t0);
        const x1 = a * Math.cos(t1);
        const y1 = b * Math.sin(t1);
        // Apply tilt rotation first (into 3D plane)
        const rx0 = x0 * cosTilt - y0 * sinTilt;
        const ry0 = x0 * sinTilt + y0 * cosTilt;
        const rx1 = x1 * cosTilt - y1 * sinTilt;
        const ry1 = x1 * sinTilt + y1 * cosTilt;
        // Apply orientation rotation (spin the ring in its plane)
        const fx0 = rx0 * cosOri - ry0 * sinOri;
        const fy0 = rx0 * sinOri + ry0 * cosOri;
        const fx1 = rx1 * cosOri - ry1 * sinOri;
        const fy1 = rx1 * sinOri + ry1 * cosOri;
        // Brightness factor: brighten the near side (positive fx)
        const normX = ((fx0 / a) + 1) / 2;
        const alpha = opacity * (0.5 + 0.5 * normX);
        // Determine if this segment belongs to the front or back half
        const isFront = ((fy0 + fy1) / 2) > 0;
        if (isFront) {
          frontSegments.push({ x0: fx0 + cx, y0: fy0 + cy, x1: fx1 + cx, y1: fy1 + cy, alpha });
        } else {
          // Draw back segment immediately
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

  /**
   * Primary render loop.  Since the rings and stars are static, there
   * is no need to update their positions between frames.  However,
   * keeping a render loop ensures that the canvas will redraw if
   * resized or if future enhancements require animation.  The loop
   * simply clears the canvas and re‑draws the scene.
   */
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Determine planet position based on canvas size
    const width = canvas.width;
    const height = canvas.height;
    const planetRadius = width * PLANET_RADIUS_RATIO;
    // Place the planet at ~27.3% from left and 40.1% from top to
    // mirror the positioning on the original site
    const cx = width * 0.273;
    const cy = height * 0.401;

    // Update rotation offset based on elapsed time.  Use
    // performance.now() to compute milliseconds between frames.
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (!rotationRef.current.lastTimestamp) {
      rotationRef.current.lastTimestamp = now;
    }
    const dt = now - rotationRef.current.lastTimestamp;
    rotationRef.current.lastTimestamp = now;
    rotationRef.current.offset += dt * BASE_ROTATION_SPEED;

    // Draw star background
    drawStars(ctx);

    // Update moon angles based on elapsed time.  Each ring has a
    // moonAngle property that is advanced proportional to the base
    // moon speed and its speed factor.  This generates motion of
    // small dots around the rings.
    const rings = ringsRef.current;
    rings.forEach((ring) => {
      ring.moonAngle += dt * BASE_MOON_SPEED * ring.speedFactor;
    });

    // Draw ring backs and collect front segments
    const frontSegments = drawRings(ctx, cx, cy, rotationRef.current.offset);

    // Compute moon positions and split into back/front lists
    const backMoons = [];
    const frontMoons = [];
    rings.forEach((ring) => {
      const { a, b, tilt, speedFactor, phase, moonAngle } = ring;
      // Parameter angle for the moon's location on the ellipse
      const t = moonAngle + phase;
      const cosTilt = Math.cos(tilt);
      const sinTilt = Math.sin(tilt);
      // Position on unrotated ellipse
      const x = a * Math.cos(t);
      const y = b * Math.sin(t);
      // Apply tilt
      const rx = x * cosTilt - y * sinTilt;
      const ry = x * sinTilt + y * cosTilt;
      // Apply orientation rotation (same as ring orientation)
      const orientationAngle = rotationRef.current.offset * speedFactor;
      const cosOri = Math.cos(orientationAngle);
      const sinOri = Math.sin(orientationAngle);
      const fx = rx * cosOri - ry * sinOri;
      const fy = rx * sinOri + ry * cosOri;
      const isFront = fy > 0;
      // Compose full coordinates
      const px = cx + fx;
      const py = cy + fy;
      if (isFront) {
        frontMoons.push({ x: px, y: py });
      } else {
        backMoons.push({ x: px, y: py });
      }
    });

    // Draw back moons on top of back rings but behind the planet
    backMoons.forEach((m) => {
      ctx.beginPath();
      // Draw the moon as a small bright dot.  A slightly larger
      // radius makes it visible at typical viewing distances.
      ctx.arc(m.x, m.y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,1)';
      ctx.fill();
    });

    // Draw the planet on top of the back halves of the rings and back moons
    drawPlanet(ctx, cx, cy, planetRadius);

    // Draw the front halves of the rings on top of the planet
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

    // Draw front moons on top of the rings and planet
    frontMoons.forEach((m) => {
      ctx.beginPath();
      ctx.arc(m.x, m.y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,1)';
      ctx.fill();
    });

    // Request next frame
    animationFrameId.current = requestAnimationFrame(render);
  }, [drawStars, drawRings, drawPlanet]);

  // Resize canvas to fill its container and initialize stars
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
      // Reinitialize stars on resize since dimensions changed
      initStars(canvas);
      // Compute ring parameters based on the new dimensions.  Rings are
      // expressed in device pixels because the canvas has been scaled
      // by the devicePixelRatio.  Each ring's semi-major and
      // semi-minor axes scale with the planet radius.  Tilt and
      // opacity are chosen to mirror the subtle variations in the
      // reference animation.
      const planetRadiusPx = rect.width * dpr * PLANET_RADIUS_RATIO;
      const newRings = [];
      // Precompute ring definitions.  We no longer compute static
      // segments here; instead we store geometric parameters and
      // generate segments dynamically on each frame so that rings can
      // slowly rotate around the planet.  Each ring has its own
      // tilt, opacity and rotation speed factor.  An initial phase
      // offset ensures that rings start at different orientations.
      for (let i = 0; i < RING_COUNT; i++) {
        // Relative radius for this ring: inner rings are smaller
        const ratio = (i + 1) / (RING_COUNT + 1);
        const a = planetRadiusPx * RING_SPACING_FACTOR * ratio;
        const b = a * RING_ASPECT_RATIO;
        const tilt = BASE_TILT + (Math.random() - 0.5) * TILT_VARIATION;
        const opacity = 0.8 - 0.4 * (i / (RING_COUNT - 1));
        // Each ring rotates at slightly different speed to create
        // subtle variation.  Randomize around the base speed by ±20%.
        const speedFactor = 1 + (Math.random() - 0.5) * 0.4;
        // Initial rotation phase so rings start at random positions
        const initialPhase = Math.random() * Math.PI * 2;
        // Each ring also has a moon (small dot) that orbits along
        // the ring.  Assign a random starting angle for the moon and
        // reuse the speed factor for its angular velocity to
        // maintain coordination with the ring rotation.
        const moonAngle = Math.random() * Math.PI * 2;
        newRings.push({ a, b, tilt, opacity, speedFactor, phase: initialPhase, moonAngle });
      }
      ringsRef.current = newRings;
    };
    resize();
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
    };
  }, [initStars]);

  // Start the render loop when component mounts
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
      className={`saturn-canvas-container ${className}`.trim()}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', ...style }}
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