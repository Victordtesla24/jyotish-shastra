import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useInView, useMotionValue, useSpring } from 'framer-motion';
import SacredGeometry from '../patterns/SacredGeometry';

// Enhanced Page Transition Wrapper
const VedicPageTransition = ({ children, direction = 'horizontal' }) => {
  const variants = {
    horizontal: {
      initial: { x: 300, opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: -300, opacity: 0 }
    },
    vertical: {
      initial: { y: 100, opacity: 0 },
      animate: { y: 0, opacity: 1 },
      exit: { y: -100, opacity: 0 }
    },
    scale: {
      initial: { scale: 0.8, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      exit: { scale: 1.2, opacity: 0 }
    },
    cosmic: {
      initial: {
        scale: 0,
        rotate: -180,
        opacity: 0,
        filter: 'blur(10px)'
      },
      animate: {
        scale: 1,
        rotate: 0,
        opacity: 1,
        filter: 'blur(0px)'
      },
      exit: {
        scale: 0,
        rotate: 180,
        opacity: 0,
        filter: 'blur(10px)'
      }
    }
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants[direction]}
      transition={{
        duration: 0.8,
        ease: [0.4, 0, 0.2, 1],
        filter: { duration: 0.4 }
      }}
      className="relative"
    >
      {/* Sacred Background Pattern */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <SacredGeometry
          pattern="mandala"
          size="full"
          opacity={0.03}
          animated={true}
          color="var(--vedic-accent)"
        />
      </div>
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

// Enhanced Floating Action Button with Sacred Elements
const VedicFloatingButton = ({
  onClick,
  icon = "✨",
  tooltip = "Sacred Action",
  variant = "primary",
  mantras = ["ॐ गं गणपतये नमः", "ॐ श्री गुरवे नमः"]
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [currentMantra, setCurrentMantra] = useState(0);

  useEffect(() => {
    if (isHovered) {
      const interval = setInterval(() => {
        setCurrentMantra(prev => (prev + 1) % mantras.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isHovered, mantras.length]);

  const variants = {
    primary: "bg-gradient-to-r from-vedic-primary to-vedic-secondary",
    cosmic: "bg-gradient-to-r from-cosmic-purple to-stellar-blue",
    sacred: "bg-gradient-to-r from-vedic-gold to-vedic-accent"
  };

  return (
    <motion.div className="fixed bottom-8 right-8 z-50">
      <motion.button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`relative w-16 h-16 rounded-full ${variants[variant]} text-white shadow-cosmic hover:shadow-celestial focus:outline-none focus:ring-4 focus:ring-vedic-accent/30 overflow-hidden group`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <SacredGeometry
            pattern="chakra"
            size="full"
            opacity={1}
            animated={isHovered}
            color="white"
          />
        </div>

        {/* Main Icon */}
        <motion.span
          className="relative z-10 text-2xl"
          animate={isHovered ? { rotate: 360 } : {}}
          transition={{ duration: 1, ease: "easeInOut" }}
        >
          {icon}
        </motion.span>

        {/* Ripple Effect */}
        <motion.div
          className="absolute inset-0 bg-white rounded-full"
          initial={{ scale: 0, opacity: 0.5 }}
          animate={isHovered ? { scale: 1.5, opacity: 0 } : {}}
          transition={{ duration: 0.6 }}
        />

        {/* Sacred Glow */}
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={isHovered ? {
            boxShadow: [
              "0 0 20px rgba(255, 107, 53, 0.3)",
              "0 0 40px rgba(255, 107, 53, 0.5)",
              "0 0 20px rgba(255, 107, 53, 0.3)"
            ]
          } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.button>

      {/* Tooltip with Mantra */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.8 }}
            className="absolute right-20 top-1/2 transform -translate-y-1/2"
          >
            <div className="bg-vedic-surface border border-vedic-border rounded-xl p-4 shadow-celestial min-w-48">
              <div className="text-sm font-medium text-vedic-text mb-2">{tooltip}</div>
              <motion.div
                key={currentMantra}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-xs text-vedic-accent font-noto"
              >
                {mantras[currentMantra]}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Sacred Loading Overlay
const VedicLoadingOverlay = ({ isVisible, message = "Sacred calculations in progress..." }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-vedic-background/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
            className="text-center"
          >
            {/* Animated Sacred Symbol */}
            <motion.div className="relative mb-8">
              <SacredGeometry
                pattern="sri"
                size="large"
                opacity={0.8}
                animated={true}
                color="var(--vedic-primary)"
              />

              {/* Pulsing Center */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="w-4 h-4 bg-vedic-accent rounded-full" />
              </motion.div>
            </motion.div>

            {/* Loading Message */}
            <motion.p
              className="text-xl font-cinzel text-vedic-text mb-4"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {message}
            </motion.p>

            {/* Sacred Mantra */}
            <motion.div
              className="text-vedic-accent font-noto"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            >
              ॐ गं गणपतये नमः
            </motion.div>

            {/* Progress Dots */}
            <div className="flex justify-center space-x-2 mt-6">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-vedic-accent rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Enhanced Card Hover Effects
const VedicHoverCard = ({ children, variant = "default", className = "" }) => {
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(0, { stiffness: 300, damping: 30 });
  const rotateY = useSpring(0, { stiffness: 300, damping: 30 });

  const handleMouseMove = (event) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const rotateXValue = (event.clientY - centerY) / 10;
    const rotateYValue = (centerX - event.clientX) / 10;

    rotateX.set(rotateXValue);
    rotateY.set(rotateYValue);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={`relative transform-gpu ${className}`}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d"
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Sacred Background Pattern */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
          >
            <SacredGeometry
              pattern="mandala"
              size="full"
              opacity={1}
              animated={true}
              color="var(--vedic-accent)"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Glow Effect */}
      <motion.div
        className="absolute inset-0 rounded-2xl"
        animate={isHovered ? {
          boxShadow: [
            "0 0 20px rgba(255, 107, 53, 0)",
            "0 0 40px rgba(255, 107, 53, 0.3)",
            "0 0 60px rgba(255, 107, 53, 0.1)"
          ]
        } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
      />

      <div style={{ transform: "translateZ(20px)" }}>
        {children}
      </div>
    </motion.div>
  );
};

// Sacred Reveal Animation
const VedicRevealOnScroll = ({ children, direction = "up", delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    amount: 0.3,
    fallback: true
  });

  const variants = {
    up: {
      hidden: { y: 100, opacity: 0, filter: "blur(10px)" },
      visible: { y: 0, opacity: 1, filter: "blur(0px)" }
    },
    down: {
      hidden: { y: -100, opacity: 0, filter: "blur(10px)" },
      visible: { y: 0, opacity: 1, filter: "blur(0px)" }
    },
    left: {
      hidden: { x: -100, opacity: 0, filter: "blur(10px)" },
      visible: { x: 0, opacity: 1, filter: "blur(0px)" }
    },
    right: {
      hidden: { x: 100, opacity: 0, filter: "blur(10px)" },
      visible: { x: 0, opacity: 1, filter: "blur(0px)" }
    },
    scale: {
      hidden: { scale: 0.8, opacity: 0, filter: "blur(5px)" },
      visible: { scale: 1, opacity: 1, filter: "blur(0px)" }
    }
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants[direction]}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.4, 0, 0.2, 1]
      }}
    >
      {children}
    </motion.div>
  );
};

// Cosmic Cursor Follower
const CosmicCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isPointer, setIsPointer] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });

      const target = e.target;
      setIsPointer(
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.type === 'submit' ||
        target.role === 'button' ||
        getComputedStyle(target).cursor === 'pointer'
      );
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 w-6 h-6 pointer-events-none z-50 mix-blend-difference"
      animate={{
        x: mousePosition.x - 12,
        y: mousePosition.y - 12,
        scale: isPointer ? 1.5 : 1
      }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
    >
      <motion.div
        className="w-full h-full rounded-full"
        animate={{
          backgroundColor: isPointer
            ? "var(--vedic-accent)"
            : "var(--vedic-primary)"
        }}
      />

      {/* Trailing particles */}
      <motion.div
        className="absolute inset-0 rounded-full border border-white"
        animate={{
          scale: [1, 2, 1],
          opacity: [1, 0, 1]
        }}
        transition={{ duration: 1, repeat: Infinity }}
      />
    </motion.div>
  );
};

// Staggered List Animation
const VedicStaggeredList = ({ children, stagger = 0.1 }) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: stagger
          }
        }
      }}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          variants={{
            hidden: { y: 20, opacity: 0 },
            visible: { y: 0, opacity: 1 }
          }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

// Sacred Number Counter
const SacredCounter = ({ end, duration = 2, prefix = "", suffix = "" }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    fallback: true
  });

  useEffect(() => {
    if (!isInView) return;

    let startTime;
    const startValue = 0;

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);

      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const currentCount = Math.floor(easeOutCubic * end);

      setCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, end, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
};

export default VedicPageTransition;

export {
  VedicPageTransition,
  VedicFloatingButton,
  VedicLoadingOverlay,
  VedicHoverCard,
  VedicRevealOnScroll,
  CosmicCursor,
  VedicStaggeredList,
  SacredCounter
};
