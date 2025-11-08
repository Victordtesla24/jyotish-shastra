import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import PlanetaryAnimations from './PlanetaryAnimations.jsx';

/**
 * HeroSection Component
 * Cosmic hero section with starfield background and parallax effects
 * Features: Animated entrance, divine CTA styling, responsive layout
 */
const HeroSection = ({ 
  children, 
  title = 'Jyotish Shastra', 
  subtitle = 'Ancient Wisdom, Modern Precision' 
}) => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const sectionRef = useRef(null);
  
  // Scroll-based parallax effect
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  });
  
  // Transform scroll progress to parallax values
  const y = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0]);

  // Initialize starfield animation - EXACTLY matching Chris Cole's subtle starfield
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const stars = [];
    // Subtle, minimal stars - matching Chris Cole exactly
    const starCount = 100; // Reduced for subtlety

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Create stars - EXACTLY matching Chris Cole's scattered visible star pattern
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5 + 0.8, // Larger for better visibility like Chris Cole
        opacity: Math.random() * 0.4 + 0.5, // Higher base opacity (0.5-0.9)
        twinkleSpeed: Math.random() * 0.008 + 0.004 // Slower, subtle twinkle
      });
    }

    // Animate starfield - EXACTLY matching Chris Cole's subtle visible stars
    let twinkleOffset = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      twinkleOffset += 0.004; // Slower animation for subtlety

      stars.forEach((star, index) => {
        const twinkle = Math.sin(twinkleOffset + index * star.twinkleSpeed) * 0.15 + 0.85; // Very subtle twinkle
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        // Ensure stars are clearly visible - matching Chris Cole's white dots
        const finalOpacity = Math.max(star.opacity * twinkle, 0.5);
        ctx.fillStyle = `rgba(255, 255, 255, ${finalOpacity})`; // Bright white stars
        ctx.fill();
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Container animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2
      }
    }
  };

  // Item animation variants
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  return (
    <motion.section
      ref={sectionRef}
      className="hero-section"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ y, opacity }}
      data-testid="cosmic-hero"
    >
      {/* Cosmic Background */}
      <div className="hero-background">
        <canvas ref={canvasRef} className="starfield-canvas parallax-bg" aria-hidden="true" />
        <div className="cosmic-gradient" aria-hidden="true" />
        {/* White Saturn - EXACTLY matching Chris Cole's left-side planet */}
        <PlanetaryAnimations count={1} />
      </div>

      {/* Hero Content */}
      <div className="hero-content">
        {/* Title Section - Hidden to match Chris Cole's minimal design */}
        {false && (title || subtitle) && (
          <motion.div className="hero-header" variants={itemVariants}>
            {title && (
              <h1 className="hero-title typography-roboto typography-h1">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="hero-subtitle typography-roboto typography-body-large">
                {subtitle}
              </p>
            )}
          </motion.div>
        )}

        {/* Main Content (Form or other) */}
        <motion.div className="hero-main" variants={itemVariants}>
          {children}
        </motion.div>

        {/* Decorative Om Symbol - HIDDEN to match Chris Cole's minimal design */}
        {false && (
          <motion.div
            className="om-watermark"
            variants={itemVariants}
            aria-hidden="true"
          >
            ॐ
          </motion.div>
        )}
      </div>

      {/* Feature Cards - HIDDEN to match Chris Cole's minimal design */}
      {false && (
        <motion.div className="hero-features" variants={itemVariants}>
          <div className="feature-card feature-card-shadow">
            <span className="feature-icon" aria-hidden="true">🌟</span>
            <h3 className="feature-title typography-roboto typography-h5">Authentic Vedic Calculations</h3>
            <p className="feature-description typography-roboto typography-body-small">
              Swiss Ephemeris powered precision
            </p>
          </div>
          <div className="feature-card feature-card-shadow">
            <span className="feature-icon" aria-hidden="true">📊</span>
            <h3 className="feature-title typography-roboto typography-h5">Comprehensive Analysis</h3>
            <p className="feature-description typography-roboto typography-body-small">
              In-depth astrological insights
            </p>
          </div>
          <div className="feature-card feature-card-shadow">
            <span className="feature-icon" aria-hidden="true">🕐</span>
            <h3 className="feature-title typography-roboto typography-h5">Birth Time Rectification</h3>
            <p className="feature-description typography-roboto typography-body-small">
              BPHS-aligned methodology
            </p>
          </div>
        </motion.div>
      )}
    </motion.section>
  );
};

export default HeroSection;
