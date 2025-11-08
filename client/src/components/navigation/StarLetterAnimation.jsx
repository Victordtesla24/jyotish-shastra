import React, { useEffect, useRef, useState } from 'react';

/**
 * StarLetterAnimation Component
 * EXACTLY matching Chris Cole's star-to-letter animation on menu hover
 * 
 * When hovering over menu items, background stars connect with white lines
 * to form the first letter of the menu item name
 * 
 * Pattern:
 * - WORK: "W" on LEFT side
 * - ABOUT: "A" on RIGHT side
 * - CONTACT: "C" on LEFT side
 * - SKETCHES: "S" on RIGHT side
 */

// Letter coordinate definitions (normalized 0-1)
const LETTER_COORDS = {
  W: [
    { x: 0.15, y: 0.30 },  // Top left
    { x: 0.18, y: 0.52 },  // Bottom left valley
    { x: 0.21, y: 0.38 },  // Middle peak
    { x: 0.24, y: 0.52 },  // Bottom right valley
    { x: 0.27, y: 0.30 }   // Top right
  ],
  A: [
    { x: 0.73, y: 0.52 },  // Bottom left
    { x: 0.78, y: 0.28 },  // Apex
    { x: 0.83, y: 0.52 },  // Bottom right
    { x: 0.75, y: 0.42 },  // Crossbar left
    { x: 0.81, y: 0.42 }   // Crossbar right
  ],
  C: [
    { x: 0.28, y: 0.32 },  // Top right
    { x: 0.22, y: 0.35 },  // Top curve
    { x: 0.18, y: 0.42 },  // Middle left
    { x: 0.22, y: 0.49 },  // Bottom curve
    { x: 0.28, y: 0.52 }   // Bottom right
  ],
  S: [
    { x: 0.83, y: 0.32 },  // Top right
    { x: 0.75, y: 0.34 },  // Top left
    { x: 0.79, y: 0.40 },  // Upper middle right
    { x: 0.75, y: 0.44 },  // Lower middle left
    { x: 0.83, y: 0.50 },  // Bottom right
    { x: 0.75, y: 0.52 }   // Bottom left
  ]
};

// Define which segments to draw for each letter
const LETTER_SEGMENTS = {
  W: [
    [0, 1],  // Top left to bottom left
    [1, 2],  // Bottom left to middle peak
    [2, 3],  // Middle peak to bottom right
    [3, 4]   // Bottom right to top right
  ],
  A: [
    [0, 1],  // Bottom left to apex
    [1, 2],  // Apex to bottom right
    [3, 4]   // Crossbar
  ],
  C: [
    [0, 1],  // Top right to top curve
    [1, 2],  // Top curve to middle left
    [2, 3],  // Middle left to bottom curve
    [3, 4]   // Bottom curve to bottom right
  ],
  S: [
    [0, 1],  // Top right to top left
    [1, 2],  // Top left to upper middle
    [2, 3],  // Upper middle to lower middle
    [3, 4],  // Lower middle to bottom right
    [4, 5]   // Bottom right to bottom left
  ]
};

const StarLetterAnimation = ({ 
  letter, 
  position = 'left', 
  isHovered = false,
  path,
  label,
  isActive,
  onClick
}) => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const progressRef = useRef(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Set canvas size to viewport
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isHovered) {
      // Start animation
      setIsAnimating(true);
      progressRef.current = 0;
      animateLetter();
    } else {
      // Fade out animation
      fadeOut();
    }
  }, [isHovered, letter]);

  const animateLetter = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const coords = LETTER_COORDS[letter];
    const segments = LETTER_SEGMENTS[letter];
    
    if (!coords || !segments) return;

    const duration = 400; // 400ms animation
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-in-out)
      const easedProgress = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      progressRef.current = easedProgress;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw letter segments
      drawLetterSegments(ctx, coords, segments, easedProgress);

      if (progress < 1 && isAnimating) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  const fadeOut = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const duration = 200; // 200ms fade out
    const startProgress = progressRef.current;
    const startTime = performance.now();

    setIsAnimating(false);

    const fade = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const fadeProgress = startProgress * (1 - progress);

      progressRef.current = fadeProgress;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (fadeProgress > 0.01) {
        const coords = LETTER_COORDS[letter];
        const segments = LETTER_SEGMENTS[letter];
        if (coords && segments) {
          drawLetterSegments(ctx, coords, segments, fadeProgress);
        }
        animationFrameRef.current = requestAnimationFrame(fade);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    animationFrameRef.current = requestAnimationFrame(fade);
  };

  const drawLetterSegments = (ctx, coords, segments, progress) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Convert normalized coordinates to canvas coordinates
    const points = coords.map(coord => ({
      x: coord.x * canvas.width,
      y: coord.y * canvas.height
    }));

    // Draw star dots at each coordinate
    ctx.fillStyle = `rgba(255, 255, 255, ${progress})`;
    points.forEach(point => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw connecting lines
    ctx.strokeStyle = `rgba(255, 255, 255, ${progress})`;
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';

    segments.forEach((segment, index) => {
      const [startIdx, endIdx] = segment;
      const segmentProgress = Math.max(0, Math.min(1, (progress - index * 0.15) / 0.3));
      
      if (segmentProgress > 0) {
        const start = points[startIdx];
        const end = points[endIdx];
        
        // Calculate intermediate point based on progress
        const currentX = start.x + (end.x - start.x) * segmentProgress;
        const currentY = start.y + (end.y - start.y) * segmentProgress;

        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(currentX, currentY);
        ctx.stroke();
      }
    });
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        className="star-letter-canvas"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 150,
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.2s ease'
        }}
        aria-hidden="true"
      />
      <button
        className={`chris-cole-nav-link ${isActive ? 'is-active' : ''}`}
        onClick={onClick}
        aria-current={isActive ? 'page' : undefined}
        aria-label={`Navigate to ${label}`}
      >
        <h1 className="chris-cole-nav-heading">{label}</h1>
      </button>
    </>
  );
};

export default StarLetterAnimation;
