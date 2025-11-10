import React, { useEffect, useRef, useState } from 'react';
import './LunarPhaseAnimation.css';

/**
 * LunarPhaseAnimation - Professional High-Quality Lunar Cycle
 * 
 * Sophisticated moon phase animation with:
 * - Realistic terminator shadows with smooth gradients
 * - Lunar surface texture simulation
 * - Professional atmospheric glow effects
 * - Smooth phase transitions matching astronomical accuracy
 * 
 * @returns {JSX.Element} Professional animated lunar phase display
 */
const LunarPhaseAnimation = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [currentPhase, setCurrentPhase] = useState('New Moon');
  const cratersRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const moonRadius = 135;
    
    let phase = 0;
    const cycleSpeed = 0.00038; // 6-7 second cycle
    
    // Generate static moon craters for texture
    if (cratersRef.current.length === 0) {
      cratersRef.current = Array.from({ length: 30 }, () => ({
        x: (Math.random() - 0.5) * moonRadius * 1.6,
        y: (Math.random() - 0.5) * moonRadius * 1.6,
        radius: Math.random() * 8 + 2,
        opacity: Math.random() * 0.15 + 0.05
      }));
    }
    
    // Static background stars
    const stars = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 1.2 + 0.3,
      opacity: Math.random() * 0.4 + 0.3,
      twinklePhase: Math.random() * Math.PI * 2
    }));

    /**
     * Get phase name
     */
    const getPhaseName = (p) => {
      const n = p % 1;
      if (n < 0.03 || n > 0.97) return 'New Moon';
      if (n < 0.22) return 'Waxing Crescent';
      if (n < 0.28) return 'First Quarter';
      if (n < 0.47) return 'Waxing Gibbous';
      if (n < 0.53) return 'Full Moon';
      if (n < 0.72) return 'Waning Gibbous';
      if (n < 0.78) return 'Last Quarter';
      return 'Waning Crescent';
    };

    /**
     * Draw professional moon with realistic lighting
     */
    const drawMoon = (phaseValue) => {
      // Clear canvas
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw twinkling stars
      const time = Date.now() * 0.001;
      stars.forEach(star => {
        const twinkle = Math.sin(time + star.twinklePhase) * 0.15 + 0.85;
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * twinkle})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      const p = phaseValue % 1;

      // Draw dark moon base
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, moonRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#0f0f0f';
      ctx.fill();
      ctx.restore();

      // Draw illuminated portion with realistic terminator
      ctx.save();
      ctx.beginPath();

      if (p <= 0.5) {
        // WAXING: Growing illumination from right
        const illumination = p * 2; // 0 to 1
        
        // Right semi-circle
        ctx.arc(centerX, centerY, moonRadius, -Math.PI/2, Math.PI/2, false);
        
        // Ellipse for phase shape
        const ellipseWidth = moonRadius * (illumination * 2 - 1);
        ctx.ellipse(
          centerX,
          centerY,
          Math.abs(ellipseWidth),
          moonRadius,
          0,
          ellipseWidth > 0 ? Math.PI/2 : -Math.PI/2,
          ellipseWidth > 0 ? -Math.PI/2 : Math.PI/2,
          ellipseWidth < 0
        );
      } else {
        // WANING: Decreasing illumination from left
        const illumination = (1 - p) * 2; // 1 to 0
        
        // Left semi-circle
        ctx.arc(centerX, centerY, moonRadius, Math.PI/2, -Math.PI/2, false);
        
        // Ellipse for phase shape
        const ellipseWidth = moonRadius * (illumination * 2 - 1);
        ctx.ellipse(
          centerX,
          centerY,
          Math.abs(ellipseWidth),
          moonRadius,
          0,
          ellipseWidth > 0 ? -Math.PI/2 : Math.PI/2,
          ellipseWidth > 0 ? Math.PI/2 : -Math.PI/2,
          ellipseWidth < 0
        );
      }

      ctx.closePath();
      
      // Bright white base color
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      
      // Add subtle surface texture overlay
      const textureGradient = ctx.createRadialGradient(
        centerX - moonRadius * 0.3, centerY - moonRadius * 0.3, 0,
        centerX, centerY, moonRadius
      );
      textureGradient.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
      textureGradient.addColorStop(0.7, 'rgba(240, 240, 240, 0)');
      textureGradient.addColorStop(1, 'rgba(200, 200, 200, 0.1)');
      ctx.fillStyle = textureGradient;
      ctx.fill();
      
      ctx.restore();

      // Draw crater texture for realism
      ctx.save();
      ctx.globalCompositeOperation = 'multiply';
      cratersRef.current.forEach(crater => {
        const craterX = centerX + crater.x;
        const craterY = centerY + crater.y;
        const distance = Math.sqrt(crater.x * crater.x + crater.y * crater.y);
        
        if (distance < moonRadius) {
          ctx.fillStyle = `rgba(0, 0, 0, ${crater.opacity})`;
          ctx.beginPath();
          ctx.arc(craterX, craterY, crater.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.restore();

      // Professional atmospheric glow (multiple layers)
      // Inner glow
      const innerGlow = ctx.createRadialGradient(
        centerX, centerY, moonRadius * 0.95,
        centerX, centerY, moonRadius * 1.15
      );
      innerGlow.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
      innerGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, moonRadius * 1.15, 0, Math.PI * 2);
      ctx.fillStyle = innerGlow;
      ctx.fill();
      ctx.restore();

      // Outer atmospheric glow
      const outerGlow = ctx.createRadialGradient(
        centerX, centerY, moonRadius * 1.1,
        centerX, centerY, moonRadius * 1.5
      );
      outerGlow.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
      outerGlow.addColorStop(0.5, 'rgba(200, 220, 255, 0.06)');
      outerGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, moonRadius * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = outerGlow;
      ctx.fill();
      ctx.restore();
    };

    /**
     * Animation loop
     */
    const animate = () => {
      phase += cycleSpeed;
      if (phase >= 1) phase = 0;

      drawMoon(phase);
      
      // Update phase name
      const phaseName = getPhaseName(phase);
      setCurrentPhase(phaseName);

      animationRef.current = requestAnimationFrame(animate);
    };

    // Start animation
    animationRef.current = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="lunar-phase-container">
      <canvas
        ref={canvasRef}
        width={500}
        height={500}
        className="lunar-phase-canvas"
        aria-label="Professional animated lunar phase transitions"
      />
      <div className="lunar-phase-label">{currentPhase}</div>
    </div>
  );
};

export default LunarPhaseAnimation;
