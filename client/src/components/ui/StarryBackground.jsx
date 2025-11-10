import React, { useEffect, useRef } from 'react';

/**
 * StarryBackground - Chris Cole-inspired STATIC starry background
 * 
 * Key Features (matching Chris Cole website):
 * - STATIC stars (NO parallax movement - stays consistent like Saturn animation)
 * - Evenly distributed across viewport
 * - Subtle twinkling for depth
 * - Clean, simple white stars with soft glow
 * - Fixed positioning covering viewport
 * 
 * @param {Object} props
 * @param {number} props.starCount - Number of stars (default: 150)
 * @returns {JSX.Element} Static starry background matching Chris Cole aesthetic
 */
const StarryBackground = ({ starCount = 150 }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const starsRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;

    /**
     * Initialize STATIC stars with even distribution
     */
    const initStars = () => {
      const stars = [];
      
      for (let i = 0; i < starCount; i++) {
        const sizeRand = Math.random();
        let starSize;
        
        // Size distribution matching Chris Cole: mostly small, few medium/large
        if (sizeRand < 0.75) {
          starSize = Math.random() * 1.0 + 0.6; // Small stars (75%)
        } else if (sizeRand < 0.95) {
          starSize = Math.random() * 1.2 + 1.2; // Medium stars (20%)
        } else {
          starSize = Math.random() * 1.5 + 2.0; // Large bright stars (5%)
        }
        
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: starSize,
          opacity: Math.random() * 0.5 + 0.5, // Base opacity 0.5-1.0
          twinkleSpeed: Math.random() * 0.0015 + 0.0008, // Slow, subtle twinkle
          twinklePhase: Math.random() * Math.PI * 2
        });
      }
      
      starsRef.current = stars;
    };

    /**
     * Resize canvas to viewport
     */
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      
      ctx.scale(dpr, dpr);
      initStars();
    };

    /**
     * Draw STATIC stars with subtle twinkling (NO parallax)
     */
    const drawStars = (time) => {
      ctx.clearRect(0, 0, width, height);

      starsRef.current.forEach(star => {
        // Subtle twinkling effect
        const twinkle = Math.sin(time * star.twinkleSpeed + star.twinklePhase);
        const currentOpacity = star.opacity + (twinkle * 0.2);
        
        // Draw star core (crisp white dot)
        ctx.save();
        ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size * 0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        // Draw soft glow (matching Chris Cole aesthetic)
        ctx.save();
        const gradient = ctx.createRadialGradient(
          star.x, star.y, 0,
          star.x, star.y, star.size * 3
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${currentOpacity * 0.8})`);
        gradient.addColorStop(0.4, `rgba(255, 255, 255, ${currentOpacity * 0.3})`);
        gradient.addColorStop(0.7, `rgba(255, 255, 255, ${currentOpacity * 0.1})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size * 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    };

    /**
     * Animation loop
     */
    const animate = (timestamp) => {
      drawStars(timestamp);
      animationRef.current = requestAnimationFrame(animate);
    };

    // Initialize
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Start animation
    animationRef.current = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [starCount]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0
      }}
      aria-hidden="true"
    />
  );
};

export default StarryBackground;
