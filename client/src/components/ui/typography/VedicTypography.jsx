import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../lib/utils.js';

// Sacred Text Component with Animation
const SacredText = ({
  sanskrit,
  translation,
  transliteration,
  showTranslation = true,
  showTransliteration = true,
  animate = true,
  size = 'medium',
  className = ""
}) => {
  const [currentView, setCurrentView] = useState('sanskrit');

  const sizeClasses = {
    small: 'text-sm',
    medium: 'text-lg',
    large: 'text-2xl',
    xl: 'text-4xl'
  };

  const views = [
    { key: 'sanskrit', content: sanskrit, font: 'font-noto', color: 'text-vedic-accent' },
    ...(showTransliteration ? [{ key: 'transliteration', content: transliteration, font: 'font-inter', color: 'text-vedic-text' }] : []),
    ...(showTranslation ? [{ key: 'translation', content: translation, font: 'font-inter', color: 'text-vedic-text-light' }] : [])
  ].filter(v => v.content);

  useEffect(() => {
    if (!animate || views.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentView(prev => {
        const currentIndex = views.findIndex(v => v.key === prev);
        const nextIndex = (currentIndex + 1) % views.length;
        return views[nextIndex].key;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [animate, views]);

  const currentViewData = views.find(v => v.key === currentView) || views[0];

  return (
    <div className={cn("text-center", className)}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentView}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className={cn(
            sizeClasses[size],
            currentViewData?.font,
            currentViewData?.color,
            "leading-relaxed"
          )}
        >
          {currentViewData?.content}
        </motion.div>
      </AnimatePresence>

      {views.length > 1 && (
        <div className="flex justify-center space-x-2 mt-4">
          {views.map((view) => (
            <button
              key={view.key}
              onClick={() => setCurrentView(view.key)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                currentView === view.key
                  ? "bg-vedic-accent w-6"
                  : "bg-vedic-border hover:bg-vedic-accent/50"
              )}
              aria-label={`Show ${view.key}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Mantra Wheel Component
const MantraWheel = ({
  mantras = [
    { sanskrit: "ॐ गं गणपतये नमः", transliteration: "Om Gam Ganapataye Namah", meaning: "Salutations to Lord Ganesha" },
    { sanskrit: "ॐ नमः शिवाय", transliteration: "Om Namah Shivaya", meaning: "I bow to Shiva" },
    { sanskrit: "ॐ श्री गुरवे नमः", transliteration: "Om Shri Gurave Namah", meaning: "Salutations to the Guru" }
  ],
  autoRotate = true,
  rotationSpeed = 5000
}) => {
  const [currentMantra, setCurrentMantra] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!autoRotate || isHovered) return;

    const interval = setInterval(() => {
      setCurrentMantra(prev => (prev + 1) % mantras.length);
    }, rotationSpeed);

    return () => clearInterval(interval);
  }, [autoRotate, isHovered, mantras.length, rotationSpeed]);

  return (
    <motion.div
      className="relative w-64 h-64 mx-auto"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Outer Ring */}
      <motion.div
        className="absolute inset-0 border-2 border-vedic-accent/30 rounded-full"
        animate={{ rotate: autoRotate && !isHovered ? 360 : 0 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      />

      {/* Inner Ring */}
      <motion.div
        className="absolute inset-4 border border-vedic-accent/20 rounded-full"
        animate={{ rotate: autoRotate && !isHovered ? -360 : 0 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />

      {/* Center Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMantra}
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.8, rotate: 10 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="text-center p-6"
          >
            {/* Sanskrit Text */}
            <motion.div
              className="text-2xl font-noto text-vedic-accent mb-3"
              animate={isHovered ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {mantras[currentMantra]?.sanskrit}
            </motion.div>

            {/* Transliteration */}
            <div className="text-sm text-vedic-text mb-2 font-medium">
              {mantras[currentMantra]?.transliteration}
            </div>

            {/* Meaning */}
            <div className="text-xs text-vedic-text-light">
              {mantras[currentMantra]?.meaning}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Dots */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {mantras.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentMantra(index)}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              currentMantra === index
                ? "bg-vedic-accent w-4"
                : "bg-vedic-border hover:bg-vedic-accent/50"
            )}
          />
        ))}
      </div>
    </motion.div>
  );
};

// Animated Quote Component
const VedicQuote = ({
  quote,
  author,
  sanskrit,
  className = "",
  showBorder = true
}) => {
  return (
    <motion.blockquote
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={cn(
        "relative p-8 text-center",
        showBorder && "border-l-4 border-vedic-accent bg-gradient-to-r from-vedic-background to-saffron-subtle rounded-r-xl",
        className
      )}
    >
      {/* Decorative Quote Marks */}
      <motion.div
        className="absolute top-4 left-4 text-6xl text-vedic-accent/20 font-serif"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        "
      </motion.div>

      {/* Sanskrit Version */}
      {sanskrit && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xl font-noto text-vedic-accent mb-4 leading-relaxed"
        >
          {sanskrit}
        </motion.div>
      )}

      {/* English Quote */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-lg text-vedic-text leading-relaxed mb-4 font-cinzel italic"
      >
        {quote}
      </motion.p>

      {/* Author */}
      {author && (
        <motion.cite
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-vedic-text-light font-medium not-italic"
        >
          — {author}
        </motion.cite>
      )}

      {/* Decorative Elements */}
      <motion.div
        className="absolute bottom-4 right-4 w-8 h-8 opacity-20"
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="text-vedic-accent">
          <path d="M12 2L13.09 8.26L19 7.27L14.74 12L19 16.73L13.09 15.74L12 22L10.91 15.74L5 16.73L9.26 12L5 7.27L10.91 8.26L12 2Z" />
        </svg>
      </motion.div>
    </motion.blockquote>
  );
};

// Sanskrit Number Display
const SanskritNumber = ({
  number,
  showDevanagari = true,
  showTransliteration = true,
  animate = true
}) => {
  const devanagariNumbers = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  const sanskritNames = {
    0: 'शून्य', 1: 'एक', 2: 'द्वि', 3: 'त्रि', 4: 'चतुर्', 5: 'पञ्च',
    6: 'षष्', 7: 'सप्त', 8: 'अष्ट', 9: 'नव', 10: 'दश'
  };

  const transliterations = {
    0: 'shunya', 1: 'eka', 2: 'dvi', 3: 'tri', 4: 'chatur', 5: 'pancha',
    6: 'shash', 7: 'sapta', 8: 'ashta', 9: 'nava', 10: 'dasha'
  };

  const getDevanagariNumber = (num) => {
    return num.toString().split('').map(digit => devanagariNumbers[parseInt(digit)]).join('');
  };

  return (
    <motion.div
      className="text-center space-y-2"
      initial={animate ? { opacity: 0, scale: 0.8 } : {}}
      animate={animate ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.6 }}
    >
      {/* Regular Number */}
      <div className="text-3xl font-bold text-vedic-primary">{number}</div>

      {/* Devanagari */}
      {showDevanagari && (
        <motion.div
          className="text-2xl font-noto text-vedic-accent"
          animate={animate ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {getDevanagariNumber(number)}
        </motion.div>
      )}

      {/* Sanskrit Name */}
      {sanskritNames[number] && (
        <div className="text-lg font-noto text-vedic-text">
          {sanskritNames[number]}
        </div>
      )}

      {/* Transliteration */}
      {showTransliteration && transliterations[number] && (
        <div className="text-sm text-vedic-text-light italic">
          ({transliterations[number]})
        </div>
      )}
    </motion.div>
  );
};

// Breath Animation Text (like meditation)
const BreathingText = ({
  text,
  breatheIn = "Breathe In",
  breatheOut = "Breathe Out",
  duration = 4000,
  className = ""
}) => {
  const [phase, setPhase] = useState('in');

  useEffect(() => {
    const interval = setInterval(() => {
      setPhase(prev => prev === 'in' ? 'out' : 'in');
    }, duration);

    return () => clearInterval(interval);
  }, [duration]);

  return (
    <motion.div className={cn("text-center", className)}>
      <motion.div
        className="text-2xl font-cinzel text-vedic-accent mb-4"
        animate={{ scale: phase === 'in' ? [1, 1.1, 1] : [1, 0.9, 1] }}
        transition={{ duration: duration / 1000, ease: "easeInOut" }}
      >
        {text}
      </motion.div>

      <motion.div
        className="text-lg text-vedic-text-light"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: duration / 1000, repeat: Infinity }}
      >
        {phase === 'in' ? breatheIn : breatheOut}
      </motion.div>

      {/* Breathing Circle */}
      <motion.div
        className="w-16 h-16 mx-auto mt-6 rounded-full bg-gradient-to-r from-vedic-accent to-vedic-primary opacity-30"
        animate={{
          scale: phase === 'in' ? [1, 1.5, 1] : [1, 0.7, 1],
          opacity: [0.3, 0.7, 0.3]
        }}
        transition={{ duration: duration / 1000, ease: "easeInOut" }}
      />
    </motion.div>
  );
};

// Typing Animation for Sacred Texts
const TypewriterText = ({
  text,
  speed = 100,
  className = "",
  showCursor = true,
  loop = false
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    if (currentIndex < text.length && isTyping) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    } else if (currentIndex >= text.length && loop) {
      const timeout = setTimeout(() => {
        setDisplayedText('');
        setCurrentIndex(0);
        setIsTyping(true);
      }, 2000);
      return () => clearTimeout(timeout);
    } else if (currentIndex >= text.length) {
      setIsTyping(false);
    }
  }, [currentIndex, text, speed, loop, isTyping]);

  return (
    <div className={cn("font-mono", className)}>
      <span>{displayedText}</span>
      {showCursor && (
        <motion.span
          className="inline-block w-0.5 h-5 bg-vedic-accent ml-1"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}
    </div>
  );
};

// Cultural Heading with Decorative Elements
const VedicHeading = ({
  title,
  sanskrit,
  level = 1,
  decoration = true,
  alignment = 'center',
  className = ""
}) => {
  const HeadingTag = `h${level}`;
  const sizeClasses = {
    1: 'text-4xl md:text-5xl',
    2: 'text-3xl md:text-4xl',
    3: 'text-2xl md:text-3xl',
    4: 'text-xl md:text-2xl',
    5: 'text-lg md:text-xl',
    6: 'text-base md:text-lg'
  };

  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  return (
    <div className={cn(alignmentClasses[alignment], className)}>
      {/* Sanskrit Header */}
      {sanskrit && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-vedic-accent font-noto text-lg mb-2"
        >
          {sanskrit}
        </motion.div>
      )}

      {/* Main Heading */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative"
      >
        <HeadingTag className={cn(
          sizeClasses[level],
          "font-cinzel font-bold text-gradient-vedic mb-4"
        )}>
          {title}
        </HeadingTag>

        {/* Decorative Elements */}
        {decoration && (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="flex items-center justify-center space-x-4 mb-6"
          >
            <div className="w-16 h-0.5 bg-gradient-to-r from-transparent to-vedic-accent"></div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="text-vedic-accent text-lg"
            >
              ❋
            </motion.div>
            <div className="w-16 h-0.5 bg-gradient-to-l from-transparent to-vedic-accent"></div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default SacredText;

export {
  SacredText,
  MantraWheel,
  VedicQuote,
  SanskritNumber,
  BreathingText,
  TypewriterText,
  VedicHeading
};
