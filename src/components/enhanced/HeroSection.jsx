import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import {
  Button,
  OmIcon,
  LotusIcon,
  MandalaIcon,
  SunIcon,
  MoonIcon,
  StarIcon,
  VedicLoadingSpinner
} from '../ui';
import { cn } from '../../lib/utils';

const HeroSection = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const heroRef = useRef(null);

  const { scrollY } = useScroll();
  const parallaxY = useTransform(scrollY, [0, 800], [0, 200]);
  const scale = useTransform(scrollY, [0, 300], [1, 1.1]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0.3]);

  // Smooth mouse tracking
  const springConfig = { damping: 25, stiffness: 700 };
  const mouseXSpring = useSpring(mousePosition.x, springConfig);
  const mouseYSpring = useSpring(mousePosition.y, springConfig);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
        const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
        setMousePosition({ x: x * 30, y: y * 30 });
      }
    };

    const heroElement = heroRef.current;
    if (heroElement) {
      heroElement.addEventListener('mousemove', handleMouseMove);
      return () => heroElement.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 60, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  const floatingIconVariants = {
    animate: {
      y: [-10, 10, -10],
      rotate: [0, 5, 0, -5, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen overflow-hidden"
    >
      {/* Animated Background */}
      <motion.div
        className="absolute inset-0"
        style={{ scale, opacity }}
      >
        {/* Primary Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-stellar-blue via-cosmic-purple to-navy" />

        {/* Overlay Gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-saffron/10 via-transparent to-gold/10" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cosmic-purple/20 to-transparent" />

        {/* Animated Geometric Patterns */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Floating Orbs */}
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-radial from-saffron/20 to-transparent rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              x: useTransform(mouseXSpring, [-30, 30], [-20, 20]),
              y: useTransform(mouseYSpring, [-30, 30], [-20, 20])
            }}
          />

          <motion.div
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-radial from-gold/20 to-transparent rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
            style={{
              x: useTransform(mouseXSpring, [-30, 30], [15, -15]),
              y: useTransform(mouseYSpring, [-30, 30], [15, -15])
            }}
          />

          {/* Sacred Geometry */}
          <motion.div
            className="absolute top-20 right-20 opacity-10"
            variants={floatingIconVariants}
            animate="animate"
            style={{
              x: useTransform(mouseXSpring, [-30, 30], [-10, 10])
            }}
          >
            <MandalaIcon size={200} className="text-gold" />
          </motion.div>

          <motion.div
            className="absolute bottom-20 left-20 opacity-8"
            variants={floatingIconVariants}
            animate="animate"
            style={{
              x: useTransform(mouseXSpring, [-30, 30], [8, -8]),
              animationDelay: '2s'
            }}
          >
            <LotusIcon size={150} className="text-lunar-silver" />
          </motion.div>

          {/* Cosmic Stars */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.2, 1, 0.2],
                scale: [0.5, 1.5, 0.5]
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 2
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        className="relative container-vedic py-20 md:py-32 min-h-screen flex items-center"
        style={{ y: parallaxY }}
      >
        <motion.div
          className="w-full text-center text-white"
          variants={containerVariants}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
        >
          {/* Sanskrit Header */}
          <motion.div
            className="font-vedic text-xl md:text-2xl lg:text-3xl mb-8 opacity-90"
            variants={itemVariants}
          >
            <span className="inline-block animate-pulse">ॐ</span>
            {" ज्योतिष शास्त्र "}
            <span className="inline-block animate-pulse">ॐ</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            className="font-accent text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-8 leading-tight"
            variants={itemVariants}
          >
            <motion.span
              className="block bg-gradient-to-r from-gold via-saffron to-orange-300 bg-clip-text text-transparent"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              Discover Your
            </motion.span>
            <motion.span
              className="block text-white mt-2"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
            >
              Cosmic Blueprint
            </motion.span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-lg md:text-xl lg:text-2xl mb-12 opacity-90 max-w-5xl mx-auto leading-relaxed"
            variants={itemVariants}
          >
            Experience authentic Vedic astrology analysis with our{" "}
            <motion.span
              className="text-gold font-semibold"
              whileHover={{ textShadow: "0 0 20px rgba(255, 215, 0, 0.8)" }}
            >
              AI-powered system
            </motion.span>
            . Get detailed birth chart analysis, predictions, and guidance based on{" "}
            <motion.span
              className="text-saffron font-semibold"
              whileHover={{ textShadow: "0 0 20px rgba(255, 153, 51, 0.8)" }}
            >
              thousands of years
            </motion.span>
            {" "}of ancient wisdom.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
            variants={itemVariants}
          >
            <Link to="/chart">
              <Button
                variant="golden"
                size="xl"
                className="w-full sm:w-auto group transform hover:scale-105 transition-all duration-300"
              >
                <motion.div
                  className="flex items-center"
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <SunIcon
                    size={24}
                    className="mr-3 group-hover:rotate-180 transition-transform duration-500"
                  />
                  Generate Your Kundli
                </motion.div>
              </Button>
            </Link>

            <Link to="/analysis">
              <Button
                variant="secondary"
                size="xl"
                className="w-full sm:w-auto group border-white/30 hover:border-gold"
              >
                <motion.div
                  className="flex items-center"
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <MandalaIcon
                    size={24}
                    className="mr-3 group-hover:scale-110 transition-transform duration-300"
                  />
                  Get Analysis
                </motion.div>
              </Button>
            </Link>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            className="flex flex-wrap justify-center items-center gap-8 opacity-80"
            variants={itemVariants}
          >
            <motion.div
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.1, opacity: 1 }}
            >
              <StarIcon size={20} className="text-gold" />
              <span className="text-sm font-medium">10,000+ Happy Clients</span>
            </motion.div>

            <motion.div
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.1, opacity: 1 }}
            >
              <OmIcon size={20} className="text-saffron" />
              <span className="text-sm font-medium">Authentic Vedic Wisdom</span>
            </motion.div>

            <motion.div
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.1, opacity: 1 }}
            >
              <MoonIcon size={20} className="text-lunar-silver" />
              <span className="text-sm font-medium">98% Accuracy Rate</span>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 1 }}
      >
        <motion.div
          className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center"
          whileHover={{ scale: 1.1, borderColor: "rgba(255, 255, 255, 0.6)" }}
        >
          <motion.div
            className="w-1 h-3 bg-white/60 rounded-full mt-2"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
        <motion.p
          className="text-white/60 text-xs mt-2 text-center"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          Scroll to explore
        </motion.p>
      </motion.div>
    </section>
  );
};

export default HeroSection;
