import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Comprehensive Accessibility Provider for Jyotish Shastra
 * Ensures WCAG 2.1 AA compliance with advanced accessibility features
 */

// Accessibility Context
const AccessibilityContext = createContext();

// Custom hook to use accessibility context
export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};

// Accessibility preferences
const DEFAULT_PREFERENCES = {
  reducedMotion: false,
  highContrast: false,
  fontSize: 'medium', // 'small', 'medium', 'large', 'extra-large'
  colorBlindMode: 'none', // 'none', 'protanopia', 'deuteranopia', 'tritanopia'
  screenReaderMode: false,
  keyboardNavigation: true,
  focusIndicators: true,
  skipLinks: true,
  audioDescriptions: false,
  autoPlay: false
};

// Color blind friendly palettes
const COLOR_BLIND_PALETTES = {
  protanopia: {
    primary: '#0066CC',
    secondary: '#FF9900',
    success: '#0099CC',
    warning: '#FF6600',
    error: '#CC0000'
  },
  deuteranopia: {
    primary: '#0066CC',
    secondary: '#FF9900',
    success: '#0099CC',
    warning: '#FF6600',
    error: '#CC0000'
  },
  tritanopia: {
    primary: '#CC0066',
    secondary: '#009900',
    success: '#006600',
    warning: '#CC6600',
    error: '#990000'
  }
};

// Font size multipliers
const FONT_SIZE_MULTIPLIERS = {
  small: 0.875,
  medium: 1,
  large: 1.125,
  'extra-large': 1.25
};

const AccessibilityProvider = ({ children }) => {
  // Core accessibility state
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [announcements, setAnnouncements] = useState([]);
  const [focusedElement, setFocusedElement] = useState(null);
  const [skipLinksVisible, setSkipLinksVisible] = useState(false);
  const [toolbarVisible, setToolbarVisible] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Refs for accessibility features
  const liveRegionRef = useRef(null);
  const focusTrapRef = useRef(null);
  const lastFocusedElement = useRef(null);
  const announcementTimeoutRef = useRef(null);

  // Detect user preferences from system
  const detectUserPreferences = useCallback(() => {
    const systemPreferences = {
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      highContrast: window.matchMedia('(prefers-contrast: high)').matches,
      colorScheme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    };

    // Update preferences based on system settings
    setPreferences(prev => ({
      ...prev,
      reducedMotion: systemPreferences.reducedMotion,
      highContrast: systemPreferences.highContrast
    }));

    console.log('[A11Y] System preferences detected:', systemPreferences);
  }, []);

  // Handle escape key
  const handleEscapeKey = useCallback(() => {
    // Close accessibility toolbar
    if (toolbarVisible) {
      setToolbarVisible(false);
      return;
    }

    // Hide skip links
    if (skipLinksVisible) {
      setSkipLinksVisible(false);
      return;
    }

    // Return focus to last focused element
    if (lastFocusedElement.current) {
      lastFocusedElement.current.focus();
    }
  }, [toolbarVisible, skipLinksVisible]);

  // UI toggle functions
  const toggleToolbar = useCallback(() => {
    setToolbarVisible(prev => !prev);
    announce(`Accessibility toolbar ${!toolbarVisible ? 'opened' : 'closed'}`);
  }, [toolbarVisible]);

  const toggleSkipLinks = useCallback(() => {
    setSkipLinksVisible(prev => !prev);
  }, []);

  const toggleHighContrast = useCallback(() => {
    setPreferences(prev => ({
      ...prev,
      highContrast: !prev.highContrast
    }));
  }, []);

  const toggleReducedMotion = useCallback(() => {
    setPreferences(prev => ({
      ...prev,
      reducedMotion: !prev.reducedMotion
    }));
  }, []);

  const increaseFontSize = useCallback(() => {
    const sizes = ['small', 'medium', 'large', 'extra-large'];
    const currentIndex = sizes.indexOf(preferences.fontSize);
    const nextIndex = Math.min(currentIndex + 1, sizes.length - 1);

    if (nextIndex !== currentIndex) {
      setPreferences(prev => ({
        ...prev,
        fontSize: sizes[nextIndex]
      }));
    }
  }, [preferences.fontSize]);

  const decreaseFontSize = useCallback(() => {
    const sizes = ['small', 'medium', 'large', 'extra-large'];
    const currentIndex = sizes.indexOf(preferences.fontSize);
    const nextIndex = Math.max(currentIndex - 1, 0);

    if (nextIndex !== currentIndex) {
      setPreferences(prev => ({
        ...prev,
        fontSize: sizes[nextIndex]
      }));
    }
  }, [preferences.fontSize]);

  const handleGlobalKeyDown = useCallback((event) => {
    const { key, altKey, shiftKey } = event;

    // Accessibility shortcuts
    if (altKey && shiftKey) {
      switch (key) {
        case 'A':
          event.preventDefault();
          toggleToolbar();
          break;
        case 'S':
          event.preventDefault();
          toggleSkipLinks();
          break;
        case 'H':
          event.preventDefault();
          toggleHighContrast();
          break;
        case 'M':
          event.preventDefault();
          toggleReducedMotion();
          break;
        case 'F':
          event.preventDefault();
          increaseFontSize();
          break;
        case 'D':
          event.preventDefault();
          decreaseFontSize();
          break;
        default:
          break;
      }
    }

    // Tab navigation enhancement
    if (key === 'Tab') {
      if (!preferences.keyboardNavigation) {
        event.preventDefault();
        return;
      }

      // Show focus indicators
      document.body.classList.add('keyboard-navigation');
    }

    // Escape key handling
    if (key === 'Escape') {
      handleEscapeKey();
    }
  }, [preferences.keyboardNavigation, toggleToolbar, toggleSkipLinks, toggleHighContrast, toggleReducedMotion, increaseFontSize, decreaseFontSize, handleEscapeKey]);

  // Cleanup event listeners
  const cleanupEventListeners = useCallback(() => {
    if (window._a11yEventHandlers) {
      const {
        handleKeyDown,
        handleFocusIn,
        handleMediaQueryChange,
        reducedMotionQuery,
        highContrastQuery
      } = window._a11yEventHandlers;

      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('focusin', handleFocusIn);

      reducedMotionQuery.removeEventListener('change', handleMediaQueryChange);
      highContrastQuery.removeEventListener('change', handleMediaQueryChange);

      delete window._a11yEventHandlers;
    }
  }, []);

  // Setup event listeners
  const setupEventListeners = useCallback(() => {
    // Keyboard navigation
    const handleKeyDown = (event) => {
      handleGlobalKeyDown(event);
    };

    // Focus management
    const handleFocusIn = (event) => {
      setFocusedElement(event.target);
      lastFocusedElement.current = event.target;
    };

    // Media query changes
    const handleMediaQueryChange = () => {
      detectUserPreferences();
    };

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('focusin', handleFocusIn);

    // Listen for system preference changes
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');

    reducedMotionQuery.addEventListener('change', handleMediaQueryChange);
    highContrastQuery.addEventListener('change', handleMediaQueryChange);

    // Store for cleanup
    window._a11yEventHandlers = {
      handleKeyDown,
      handleFocusIn,
      handleMediaQueryChange,
      reducedMotionQuery,
      highContrastQuery
    };
  }, [detectUserPreferences, handleGlobalKeyDown]);

  // Create live region for screen reader announcements
  const createLiveRegion = useCallback(() => {
    if (!liveRegionRef.current) {
      const liveRegion = document.createElement('div');
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.setAttribute('class', 'sr-only');
      liveRegion.id = 'a11y-live-region';
      document.body.appendChild(liveRegion);
      liveRegionRef.current = liveRegion;
    }
  }, []);

  // Setup focus management
  const setupFocusManagement = useCallback(() => {
    // Skip to main content link
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'skip-to-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.addEventListener('click', (e) => {
      e.preventDefault();
      const mainContent = document.getElementById('main-content');
      if (mainContent) {
        mainContent.focus();
        mainContent.scrollIntoView();
      }
    });

    document.body.insertBefore(skipLink, document.body.firstChild);
  }, []);

  // Add accessibility styles
  const addAccessibilityStyles = useCallback(() => {
    const style = document.createElement('style');
    style.id = 'a11y-styles';
    style.textContent = `
      .keyboard-navigation *:focus {
        outline: 2px solid var(--vedic-saffron) !important;
        outline-offset: 2px !important;
      }

      .high-contrast {
        filter: contrast(150%) !important;
      }

      .high-contrast * {
        border-color: currentColor !important;
      }

      .reduced-motion * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }

      .font-size-small { font-size: ${FONT_SIZE_MULTIPLIERS.small}rem !important; }
      .font-size-medium { font-size: ${FONT_SIZE_MULTIPLIERS.medium}rem !important; }
      .font-size-large { font-size: ${FONT_SIZE_MULTIPLIERS.large}rem !important; }
      .font-size-extra-large { font-size: ${FONT_SIZE_MULTIPLIERS['extra-large']}rem !important; }

      .color-blind-protanopia { --vedic-saffron: ${COLOR_BLIND_PALETTES.protanopia.primary} !important; }
      .color-blind-deuteranopia { --vedic-saffron: ${COLOR_BLIND_PALETTES.deuteranopia.primary} !important; }
      .color-blind-tritanopia { --vedic-saffron: ${COLOR_BLIND_PALETTES.tritanopia.primary} !important; }
    `;

    document.head.appendChild(style);
  }, []);

  // Load preferences from localStorage
  const loadPreferences = useCallback(() => {
    try {
      const saved = localStorage.getItem('a11y-preferences');
      if (saved) {
        const parsedPreferences = JSON.parse(saved);
        setPreferences(prev => ({ ...prev, ...parsedPreferences }));
      }
    } catch (error) {
      console.warn('[A11Y] Failed to load preferences:', error);
    }
  }, []);

  const initializeAccessibility = useCallback(() => {
    // Load saved preferences
    loadPreferences();

    // Create live region for announcements
    createLiveRegion();

    // Setup focus management
    setupFocusManagement();

    // Add accessibility styles
    addAccessibilityStyles();

    setIsInitialized(true);
    console.log('[A11Y] Accessibility provider initialized');
  }, [addAccessibilityStyles, createLiveRegion, loadPreferences, setupFocusManagement]);

  // Detect user preferences from system
  const detectUserPreferences = useCallback(() => {
    const systemPreferences = {
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      highContrast: window.matchMedia('(prefers-contrast: high)').matches,
      colorScheme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    };

    // Update preferences based on system settings
    setPreferences(prev => ({
      ...prev,
      reducedMotion: systemPreferences.reducedMotion,
      highContrast: systemPreferences.highContrast
    }));

    console.log('[A11Y] System preferences detected:', systemPreferences);
  }, []);

  // Setup event listeners
  const setupEventListeners = useCallback(() => {
    // Keyboard navigation
    const handleKeyDown = (event) => {
      handleGlobalKeyDown(event);
    };

    // Focus management
    const handleFocusIn = (event) => {
      setFocusedElement(event.target);
      lastFocusedElement.current = event.target;
    };

    // Media query changes
    const handleMediaQueryChange = () => {
      detectUserPreferences();
    };

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('focusin', handleFocusIn);

    // Listen for system preference changes
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');

    reducedMotionQuery.addEventListener('change', handleMediaQueryChange);
    highContrastQuery.addEventListener('change', handleMediaQueryChange);

    // Store for cleanup
    window._a11yEventHandlers = {
      handleKeyDown,
      handleFocusIn,
      handleMediaQueryChange,
      reducedMotionQuery,
      highContrastQuery
    };
  }, [detectUserPreferences, handleGlobalKeyDown]);

  // Cleanup event listeners
  const cleanupEventListeners = useCallback(() => {
    if (window._a11yEventHandlers) {
      const {
        handleKeyDown,
        handleFocusIn,
        handleMediaQueryChange,
        reducedMotionQuery,
        highContrastQuery
      } = window._a11yEventHandlers;

      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('focusin', handleFocusIn);

      reducedMotionQuery.removeEventListener('change', handleMediaQueryChange);
      highContrastQuery.removeEventListener('change', handleMediaQueryChange);

      delete window._a11yEventHandlers;
    }
  }, []);

  const handleGlobalKeyDown = useCallback((event) => {
    const { key, altKey, shiftKey } = event;

    // Accessibility shortcuts
    if (altKey && shiftKey) {
      switch (key) {
        case 'A':
          event.preventDefault();
          toggleToolbar();
          break;
        case 'S':
          event.preventDefault();
          toggleSkipLinks();
          break;
        case 'H':
          event.preventDefault();
          toggleHighContrast();
          break;
        case 'M':
          event.preventDefault();
          toggleReducedMotion();
          break;
        case 'F':
          event.preventDefault();
          increaseFontSize();
          break;
        case 'D':
          event.preventDefault();
          decreaseFontSize();
          break;
        default:
          break;
      }
    }

    // Tab navigation enhancement
    if (key === 'Tab') {
      if (!preferences.keyboardNavigation) {
        event.preventDefault();
        return;
      }

      // Show focus indicators
      document.body.classList.add('keyboard-navigation');
    }

    // Escape key handling
    if (key === 'Escape') {
      handleEscapeKey();
    }
  }, [preferences.keyboardNavigation, toggleToolbar, toggleSkipLinks, toggleHighContrast, toggleReducedMotion, increaseFontSize, decreaseFontSize, handleEscapeKey]);

  // Handle escape key
  const handleEscapeKey = useCallback(() => {
    // Close accessibility toolbar
    if (toolbarVisible) {
      setToolbarVisible(false);
      return;
    }

    // Hide skip links
    if (skipLinksVisible) {
      setSkipLinksVisible(false);
      return;
    }

    // Return focus to last focused element
    if (lastFocusedElement.current) {
      lastFocusedElement.current.focus();
    }
  }, [toolbarVisible, skipLinksVisible]);

  // Create live region for screen reader announcements
  const createLiveRegion = useCallback(() => {
    if (!liveRegionRef.current) {
      const liveRegion = document.createElement('div');
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.setAttribute('class', 'sr-only');
      liveRegion.id = 'a11y-live-region';
      document.body.appendChild(liveRegion);
      liveRegionRef.current = liveRegion;
    }
  }, []);

  // Setup focus management
  const setupFocusManagement = useCallback(() => {
    // Skip to main content link
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'skip-to-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.addEventListener('click', (e) => {
      e.preventDefault();
      const mainContent = document.getElementById('main-content');
      if (mainContent) {
        mainContent.focus();
        mainContent.scrollIntoView();
      }
    });

    document.body.insertBefore(skipLink, document.body.firstChild);
  }, []);

  // Add accessibility styles
  const addAccessibilityStyles = useCallback(() => {
    const style = document.createElement('style');
    style.id = 'a11y-styles';
    style.textContent = `
      .keyboard-navigation *:focus {
        outline: 2px solid var(--vedic-saffron) !important;
        outline-offset: 2px !important;
      }

      .high-contrast {
        filter: contrast(150%) !important;
      }

      .high-contrast * {
        border-color: currentColor !important;
      }

      .reduced-motion * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }

      .font-size-small { font-size: ${FONT_SIZE_MULTIPLIERS.small}rem !important; }
      .font-size-medium { font-size: ${FONT_SIZE_MULTIPLIERS.medium}rem !important; }
      .font-size-large { font-size: ${FONT_SIZE_MULTIPLIERS.large}rem !important; }
      .font-size-extra-large { font-size: ${FONT_SIZE_MULTIPLIERS['extra-large']}rem !important; }

      .color-blind-protanopia { --vedic-saffron: ${COLOR_BLIND_PALETTES.protanopia.primary} !important; }
      .color-blind-deuteranopia { --vedic-saffron: ${COLOR_BLIND_PALETTES.deuteranopia.primary} !important; }
      .color-blind-tritanopia { --vedic-saffron: ${COLOR_BLIND_PALETTES.tritanopia.primary} !important; }
    `;

    document.head.appendChild(style);
  }, []);

  // Apply preferences to DOM
  const applyPreferences = useCallback(() => {
    const { body } = document;

    // Remove existing accessibility classes
    body.classList.remove(
      'high-contrast',
      'reduced-motion',
      'font-size-small',
      'font-size-medium',
      'font-size-large',
      'font-size-extra-large',
      'color-blind-protanopia',
      'color-blind-deuteranopia',
      'color-blind-tritanopia'
    );

    // Apply current preferences
    if (preferences.highContrast) {
      body.classList.add('high-contrast');
    }

    if (preferences.reducedMotion) {
      body.classList.add('reduced-motion');
    }

    body.classList.add(`font-size-${preferences.fontSize}`);

    if (preferences.colorBlindMode !== 'none') {
      body.classList.add(`color-blind-${preferences.colorBlindMode}`);
    }

    // Apply font size to root
    document.documentElement.style.fontSize = `${FONT_SIZE_MULTIPLIERS[preferences.fontSize]}rem`;
  }, [preferences]);

  // Save preferences to localStorage
  const savePreferences = useCallback(() => {
    try {
      localStorage.setItem('a11y-preferences', JSON.stringify(preferences));
    } catch (error) {
      console.warn('[A11Y] Failed to save preferences:', error);
    }
  }, [preferences]);

  // Load preferences from localStorage
  const loadPreferences = useCallback(() => {
    try {
      const saved = localStorage.getItem('a11y-preferences');
      if (saved) {
        const parsedPreferences = JSON.parse(saved);
        setPreferences(prev => ({ ...prev, ...parsedPreferences }));
      }
    } catch (error) {
      console.warn('[A11Y] Failed to load preferences:', error);
    }
  }, []);

  // Announcement functions
  const announce = useCallback((message, priority = 'polite') => {
    if (!liveRegionRef.current) return;

    const announcement = {
      id: Date.now(),
      message,
      priority,
      timestamp: new Date()
    };

    setAnnouncements(prev => [...prev, announcement]);

    // Update live region
    liveRegionRef.current.setAttribute('aria-live', priority);
    liveRegionRef.current.textContent = message;

    // Clear announcement after delay
    if (announcementTimeoutRef.current) {
      clearTimeout(announcementTimeoutRef.current);
    }

    announcementTimeoutRef.current = setTimeout(() => {
      setAnnouncements(prev => prev.filter(a => a.id !== announcement.id));
      if (liveRegionRef.current) {
        liveRegionRef.current.textContent = '';
      }
    }, 5000);

    console.log('[A11Y] Announced:', message);
  }, []);

  // Focus management functions
  const focusElement = useCallback((selector) => {
    const element = typeof selector === 'string'
      ? document.querySelector(selector)
      : selector;

    if (element) {
      element.focus();
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      announce(`Focused on ${element.getAttribute('aria-label') || element.textContent || 'element'}`);
    }
  }, [announce]);

  const trapFocus = useCallback((container) => {
    if (!container) return;

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    focusTrapRef.current = () => {
      container.removeEventListener('keydown', handleTabKey);
    };

    // Focus first element
    if (firstElement) {
      firstElement.focus();
    }
  }, []);

  const releaseFocusTrap = useCallback(() => {
    if (focusTrapRef.current) {
      focusTrapRef.current();
      focusTrapRef.current = null;
    }
  }, []);

  // Preference toggle functions
  const toggleHighContrast = useCallback(() => {
    setPreferences(prev => ({
      ...prev,
      highContrast: !prev.highContrast
    }));
    announce(`High contrast ${!preferences.highContrast ? 'enabled' : 'disabled'}`);
  }, [preferences.highContrast, announce]);

  const toggleReducedMotion = useCallback(() => {
    setPreferences(prev => ({
      ...prev,
      reducedMotion: !prev.reducedMotion
    }));
    announce(`Reduced motion ${!preferences.reducedMotion ? 'enabled' : 'disabled'}`);
  }, [preferences.reducedMotion, announce]);

  const increaseFontSize = useCallback(() => {
    const sizes = ['small', 'medium', 'large', 'extra-large'];
    const currentIndex = sizes.indexOf(preferences.fontSize);
    const nextIndex = Math.min(currentIndex + 1, sizes.length - 1);

    if (nextIndex !== currentIndex) {
      setPreferences(prev => ({
        ...prev,
        fontSize: sizes[nextIndex]
      }));
      announce(`Font size increased to ${sizes[nextIndex]}`);
    }
  }, [preferences.fontSize, announce]);

  const decreaseFontSize = useCallback(() => {
    const sizes = ['small', 'medium', 'large', 'extra-large'];
    const currentIndex = sizes.indexOf(preferences.fontSize);
    const nextIndex = Math.max(currentIndex - 1, 0);

    if (nextIndex !== currentIndex) {
      setPreferences(prev => ({
        ...prev,
        fontSize: sizes[nextIndex]
      }));
      announce(`Font size decreased to ${sizes[nextIndex]}`);
    }
  }, [preferences.fontSize, announce]);

  const setColorBlindMode = useCallback((mode) => {
    setPreferences(prev => ({
      ...prev,
      colorBlindMode: mode
    }));
    announce(`Color blind mode set to ${mode === 'none' ? 'normal' : mode}`);
  }, [announce]);

  // UI toggle functions
  const toggleToolbar = useCallback(() => {
    setToolbarVisible(prev => !prev);
    announce(`Accessibility toolbar ${!toolbarVisible ? 'opened' : 'closed'}`);
  }, [toolbarVisible, announce]);

  const toggleSkipLinks = useCallback(() => {
    setSkipLinksVisible(prev => !prev);
    announce(`Skip links ${!skipLinksVisible ? 'shown' : 'hidden'}`);
  }, [skipLinksVisible, announce]);

  // Accessibility toolbar component
  const AccessibilityToolbar = () => (
    <AnimatePresence>
      {toolbarVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border shadow-lg"
          role="toolbar"
          aria-label="Accessibility Toolbar"
        >
          <div className="container-vedic py-4">
            <div className="flex flex-wrap items-center gap-4">
              <h3 className="font-medium text-earth-brown dark:text-dark-text-primary">
                Accessibility Options
              </h3>

              <button
                onClick={toggleHighContrast}
                className={`btn-vedic-secondary text-sm ${preferences.highContrast ? 'bg-vedic-saffron text-white' : ''}`}
              >
                High Contrast
              </button>

              {/* ... other buttons would go here ... */}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <AccessibilityContext.Provider
      value={{
        preferences,
        announcements,
        focusedElement,
        isInitialized,
        toolbarVisible,
        announce,
        focusElement,
        trapFocus,
        releaseFocusTrap,
        toggleHighContrast,
        toggleReducedMotion,
        increaseFontSize,
        decreaseFontSize,
        setColorBlindMode,
        toggleToolbar,
      }}
    >
      {children}
      <AccessibilityToolbar />
    </AccessibilityContext.Provider>
  );
};

export default AccessibilityProvider;
