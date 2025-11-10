import React, { useEffect, useRef, useState } from 'react';
import './CosmicHourglassAnimation.css';

/**
 * CosmicHourglassAnimation - Professional Stardust Hourglass
 * 
 * Sophisticated particle animation with:
 * - Realistic particle physics with gravity and collision
 * - Smooth stardust flow through hourglass chambers
 * - Dynamic speed variations for visual interest
 * - Professional glow and lighting effects
 * - Star field background with subtle motion
 * 
 * @returns {JSX.Element} Professional cosmic hourglass animation
 */
const CosmicHourglassAnimation = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);
  const [timeLabel, setTimeLabel] = useState('Analyzing Birth Events');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    
    // Hourglass geometry - professional proportions
    const hourglassTop = 70;
    const hourglassBottom = height - 70;
    const hourglassWidth = 150;
    const neckY = height / 2;
    const neckWidth = 35;
    
    // Animation parameters
    const cycleDuration = 4000; // 4 second cycle
    let startTime = Date.now();
    let particles = [];
    let accumulatedParticles = []; // Particles settled at bottom
    
    // Enhanced star field with depth
    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.8 + 0.4,
      opacity: Math.random() * 0.5 + 0.2,
      twinkleSpeed: Math.random() * 0.5 + 0.5,
      twinklePhase: Math.random() * Math.PI * 2
    }));

    /**
     * Enhanced Particle class with realistic physics
     */
    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        // Spawn in upper chamber with realistic distribution
        const topRadius = hourglassWidth / 2 - 10;
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.sqrt(Math.random()) * topRadius;
        
        this.x = centerX + Math.cos(angle) * distance;
        this.y = hourglassTop + 15 + Math.random() * 25;
        
        // Initial velocity with slight randomness
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = 0;
        
        // Physics properties
        this.gravity = 0.18;
        this.friction = 0.985;
        this.size = Math.random() * 0.5 + 0.2; // Much smaller particles (0.2-0.7px) like fine stardust
        this.opacity = Math.random() * 0.7 + 0.5;
        this.life = 1.0;
        this.settled = false;
        this.color = {
          r: 255,
          g: 255 - Math.random() * 20, // Brighter white/gold tones
          b: 255 - Math.random() * 30
        };
        
        // Trail for motion blur effect
        this.trail = [];
        this.maxTrailLength = 8; // Longer trails for stardust effect
      }

      update(phase, allParticles) {
        if (this.settled) return;

        // Trail management
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.maxTrailLength) {
          this.trail.shift();
        }

        // Dynamic speed based on phase
        let speedMultiplier = 1.0;
        if (phase < 0.25) {
          speedMultiplier = 0.6 + (phase / 0.25) * 1.9; // Accelerate
        } else if (phase > 0.75) {
          speedMultiplier = 2.5 - ((phase - 0.75) / 0.25) * 2.0; // Decelerate
        } else {
          speedMultiplier = 2.5; // Peak flow
        }

        // Apply physics
        this.vy += this.gravity * speedMultiplier;
        this.vy *= this.friction;
        this.vx *= 0.99; // Air resistance
        
        // Update position
        this.x += this.vx;
        this.y += this.vy;

        // Boundary detection and collision
        const distanceFromCenter = Math.abs(this.x - centerX);
        
        // Upper chamber (cone narrows toward neck)
        if (this.y < neckY) {
          const progress = (this.y - hourglassTop) / (neckY - hourglassTop);
          const currentRadius = hourglassWidth / 2 - ((hourglassWidth / 2 - neckWidth / 2) * progress);
          
          if (distanceFromCenter > currentRadius - 5) {
            this.x = centerX + (this.x > centerX ? 1 : -1) * (currentRadius - 5);
            this.vx *= -0.4; // Bounce with energy loss
          }
        }
        
        // Neck passage - create funnel effect
        else if (this.y >= neckY - 15 && this.y <= neckY + 15) {
          if (distanceFromCenter > neckWidth / 2 - 3) {
            this.x = centerX + (this.x > centerX ? 1 : -1) * (neckWidth / 2 - 3);
            this.vx *= -0.3;
          }
          // Accelerate through neck
          this.vy *= 1.1;
        }
        
        // Lower chamber (cone expands from neck)
        else if (this.y > neckY + 15 && this.y < hourglassBottom - 35) {
          const progress = (this.y - neckY) / (hourglassBottom - neckY);
          const currentRadius = neckWidth / 2 + ((hourglassWidth / 2 - neckWidth / 2) * progress);
          
          if (distanceFromCenter > currentRadius - 5) {
            this.x = centerX + (this.x > centerX ? 1 : -1) * (currentRadius - 5);
            this.vx *= -0.4;
          }
        }

        // Settle at bottom with realistic pile formation
        if (this.y >= hourglassBottom - 35) {
          this.settled = true;
          
          // Check for collision with other settled particles
          let finalY = hourglassBottom - 35;
          allParticles.forEach(other => {
            if (other.settled && other !== this) {
              const dx = this.x - other.x;
              const dy = this.y - other.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < this.size + other.size) {
                finalY = Math.min(finalY, other.y - (this.size + other.size));
              }
            }
          });
          
          this.y = finalY;
          this.vy = 0;
          this.vx = 0;
        }
      }

      draw(ctx) {
        if (this.life <= 0) return;

        // Draw motion trail with stardust effect
        ctx.save();
        this.trail.forEach((pos, index) => {
          const trailOpacity = (index / this.trail.length) * this.opacity * 0.3;
          const trailSize = this.size * (index / this.trail.length) * 0.7;
          
          // Trail with subtle glow
          const trailGradient = ctx.createRadialGradient(
            pos.x, pos.y, 0,
            pos.x, pos.y, trailSize * 2
          );
          trailGradient.addColorStop(0, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${trailOpacity})`);
          trailGradient.addColorStop(0.5, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${trailOpacity * 0.4})`);
          trailGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
          
          ctx.fillStyle = trailGradient;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, trailSize * 2, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();

        // Draw particle core (bright, sharp center for stardust)
        ctx.save();
        ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 0.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        // Draw particle glow (prominent outer halo for magical stardust effect)
        ctx.save();
        const gradient = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.size * 6
        );
        gradient.addColorStop(0, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.opacity * 0.9})`);
        gradient.addColorStop(0.2, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.opacity * 0.6})`);
        gradient.addColorStop(0.5, `rgba(255, 255, 255, ${this.opacity * 0.25})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    /**
     * Draw professional hourglass with realistic rounded corners and smooth curves
     */
    const drawHourglass = () => {
      const cornerRadius = 18; // Larger, more pronounced rounded corners
      const neckRadius = 8; // Smooth neck transition

      /**
       * Helper to draw hourglass shape with smooth, realistic rounded corners
       */
      const drawHourglassPath = () => {
        ctx.beginPath();
        
        // Top-left corner (smooth rounded)
        ctx.moveTo(centerX - hourglassWidth / 2 + cornerRadius, hourglassTop);
        
        // Top edge with rounded corners
        ctx.lineTo(centerX + hourglassWidth / 2 - cornerRadius, hourglassTop);
        ctx.quadraticCurveTo(
          centerX + hourglassWidth / 2, hourglassTop,
          centerX + hourglassWidth / 2, hourglassTop + cornerRadius
        );
        
        // Right side to neck (smooth curve)
        ctx.lineTo(centerX + neckWidth / 2 + neckRadius, neckY - neckRadius * 2);
        ctx.quadraticCurveTo(
          centerX + neckWidth / 2, neckY - neckRadius,
          centerX + neckWidth / 2, neckY
        );
        
        // Neck center (smooth transition)
        ctx.quadraticCurveTo(
          centerX + neckWidth / 2, neckY + neckRadius,
          centerX + neckWidth / 2 + neckRadius, neckY + neckRadius * 2
        );
        
        // Right side from neck to bottom (smooth curve)
        ctx.lineTo(centerX + hourglassWidth / 2, hourglassBottom - cornerRadius);
        ctx.quadraticCurveTo(
          centerX + hourglassWidth / 2, hourglassBottom,
          centerX + hourglassWidth / 2 - cornerRadius, hourglassBottom
        );
        
        // Bottom edge (rounded corners)
        ctx.lineTo(centerX - hourglassWidth / 2 + cornerRadius, hourglassBottom);
        ctx.quadraticCurveTo(
          centerX - hourglassWidth / 2, hourglassBottom,
          centerX - hourglassWidth / 2, hourglassBottom - cornerRadius
        );
        
        // Left side from bottom to neck (smooth curve)
        ctx.lineTo(centerX - neckWidth / 2 - neckRadius, neckY + neckRadius * 2);
        ctx.quadraticCurveTo(
          centerX - neckWidth / 2, neckY + neckRadius,
          centerX - neckWidth / 2, neckY
        );
        
        // Neck center (smooth transition)
        ctx.quadraticCurveTo(
          centerX - neckWidth / 2, neckY - neckRadius,
          centerX - neckWidth / 2 - neckRadius, neckY - neckRadius * 2
        );
        
        // Left side from neck to top (smooth curve)
        ctx.lineTo(centerX - hourglassWidth / 2, hourglassTop + cornerRadius);
        ctx.quadraticCurveTo(
          centerX - hourglassWidth / 2, hourglassTop,
          centerX - hourglassWidth / 2 + cornerRadius, hourglassTop
        );
        
        ctx.closePath();
      };

      // Outer glow
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 12;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowBlur = 20;
      ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
      drawHourglassPath();
      ctx.stroke();
      ctx.restore();

      // Main outline
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      drawHourglassPath();
      ctx.stroke();
      ctx.restore();

      // Highlight edges for depth
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 1;
      
      // Top edge highlight with rounded corners
      ctx.beginPath();
      ctx.moveTo(centerX - hourglassWidth / 2 + cornerRadius, hourglassTop);
      ctx.lineTo(centerX + hourglassWidth / 2 - cornerRadius, hourglassTop);
      ctx.stroke();
      
      // Bottom edge highlight with rounded corners
      ctx.beginPath();
      ctx.moveTo(centerX - hourglassWidth / 2 + cornerRadius, hourglassBottom);
      ctx.lineTo(centerX + hourglassWidth / 2 - cornerRadius, hourglassBottom);
      ctx.stroke();
      ctx.restore();
    };

    /**
     * Draw enhanced star field with twinkling
     */
    const drawStars = (time) => {
      stars.forEach(star => {
        const twinkle = Math.sin(time * star.twinkleSpeed + star.twinklePhase) * 0.15 + 0.85;
        const finalOpacity = star.opacity * twinkle;
        
        // Star with subtle glow
        const starGlow = ctx.createRadialGradient(
          star.x, star.y, 0,
          star.x, star.y, star.size * 2
        );
        starGlow.addColorStop(0, `rgba(255, 255, 255, ${finalOpacity})`);
        starGlow.addColorStop(0.6, `rgba(200, 220, 255, ${finalOpacity * 0.4})`);
        starGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = starGlow;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size * 2, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    /**
     * Professional animation loop
     */
    const animate = (timestamp) => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const phase = (elapsed % cycleDuration) / cycleDuration;
      const time = elapsed * 0.001; // For twinkling

      // Clear with fade effect for smooth motion
      ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
      ctx.fillRect(0, 0, width, height);

      // Draw twinkling stars
      drawStars(time);

      // Draw hourglass structure
      drawHourglass();

      // Spawn particles dynamically
      if (phase < 0.85) {
        const spawnRate = phase < 0.7 ? 3 : 2;
        for (let i = 0; i < spawnRate; i++) {
          if (Math.random() < 0.8) {
            particles.push(new Particle());
          }
        }
      }

      // Update and draw all particles
      particles.forEach(particle => {
        particle.update(phase, particles);
        particle.draw(ctx);
      });

      // Particle management
      particles = particles.filter(p => p.life > 0 && p.y < height + 50);
      
      // Limit particle count for performance
      if (particles.length > 300) {
        particles = particles.slice(-250);
      }

      // Cycle reset for continuous animation
      if (phase > 0.95 && particles.length > 200) {
        accumulatedParticles = particles.filter(p => p.settled);
        particles = accumulatedParticles.slice(0, 50); // Keep some at bottom
        startTime = currentTime;
      }

      // Dynamic label updates
      if (phase < 0.3) {
        setTimeLabel('Analyzing Birth Events');
      } else if (phase < 0.7) {
        setTimeLabel('Calculating Precision');
      } else {
        setTimeLabel('Time Rectified');
      }

      particlesRef.current = particles;
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
    <div className="cosmic-hourglass-container">
      <canvas
        ref={canvasRef}
        width={500}
        height={600}
        className="cosmic-hourglass-canvas"
        aria-label="Professional cosmic hourglass with stardust animation"
      />
      <div className="cosmic-hourglass-label">{timeLabel}</div>
    </div>
  );
};

export default CosmicHourglassAnimation;
