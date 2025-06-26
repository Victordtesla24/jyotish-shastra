import { useEffect, useRef, useCallback, useState } from 'react';

/**
 * Custom hook for accessibility features and WCAG compliance
 * Provides keyboard navigation, screen reader support, and reduced motion preferences
 */
export const useAccessibility = () => {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [focusVisible, setFocusVisible] = useState(false);
  const [screenReaderMode, setScreenReaderMode] = useState(false);

  // Detect user preferences for reduced motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handler = (e) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Detect high contrast preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setHighContrast(mediaQuery.matches);

    const handler = (e) => setHighContrast(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Keyboard navigation detection
  useEffect(() => {
    const handleKeyboardNavigation = (e) => {
      if (e.key === 'Tab') {
        setFocusVisible(true);
      }
    };

    const handleMouseDown = () => {
      setFocusVisible(false);
    };

    document.addEventListener('keydown', handleKeyboardNavigation);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyboardNavigation);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  // Screen reader detection (approximate)
  useEffect(() => {
    const isScreenReaderActive = () => {
      // Check for common screen reader indicators
      const hasAriaLive = document.querySelectorAll('[aria-live]').length > 0;
      const hasScreenReaderClass = document.body.classList.contains('sr-only');
      const userAgent = navigator.userAgent.toLowerCase();
      const isScreenReaderUA = /jaws|nvda|voiceover|talkback/.test(userAgent);

      return hasAriaLive || hasScreenReaderClass || isScreenReaderUA;
    };

    setScreenReaderMode(isScreenReaderActive());
  }, []);

  // Skip to main content function
  const skipToMain = useCallback(() => {
    const mainContent = document.querySelector('main') || document.querySelector('#main-content');
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  // Announce to screen readers
  const announceToScreenReader = useCallback((message, priority = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);

  // Keyboard trap for modals
  const createKeyboardTrap = useCallback((containerRef) => {
    if (!containerRef.current) return null;

    const focusableElements = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e) => {
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

      if (e.key === 'Escape') {
        // Trigger close action - parent component should handle this
        const closeEvent = new CustomEvent('modal-close');
        containerRef.current.dispatchEvent(closeEvent);
      }
    };

    containerRef.current.addEventListener('keydown', handleKeyDown);

    // Focus first element
    if (firstElement) {
      firstElement.focus();
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, []);

  // Generate accessible labels for complex elements
  const generateAccessibleLabel = useCallback((element, context = '') => {
    const labels = {
      'chart-house': (number) => `House ${number} in Vedic birth chart`,
      'planet-position': (planet, sign, house) =>
        `${planet} positioned in ${sign} sign, house ${house}`,
      'yoga-indicator': (yogaName) =>
        `${yogaName} yoga present in birth chart`,
      'dasha-period': (planet, startDate, endDate) =>
        `${planet} dasha period from ${startDate} to ${endDate}`,
      'loading-state': (process) =>
        `Loading ${process}, please wait`,
      'analysis-result': (category, result) =>
        `${category} analysis: ${result}`
    };

    return labels[element] || context;
  }, []);

  // Color contrast checker (basic implementation)
  const checkColorContrast = useCallback((foreground, background) => {
    // Simplified contrast ratio calculation
    // In a real implementation, you'd use a proper color contrast library
    const getLuminance = (hex) => {
      const rgb = parseInt(hex.slice(1), 16);
      const r = (rgb >> 16) & 0xff;
      const g = (rgb >> 8) & 0xff;
      const b = (rgb >> 0) & 0xff;

      const [rs, gs, bs] = [r, g, b].map(c => {
        c /= 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });

      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };

    const l1 = getLuminance(foreground);
    const l2 = getLuminance(background);
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

    return {
      ratio,
      wcagAA: ratio >= 4.5,
      wcagAAA: ratio >= 7
    };
  }, []);

  return {
    // State
    reducedMotion,
    highContrast,
    focusVisible,
    screenReaderMode,

    // Functions
    skipToMain,
    announceToScreenReader,
    createKeyboardTrap,
    generateAccessibleLabel,
    checkColorContrast,

    // Animation preferences
    animationDuration: reducedMotion ? 0 : 300,
    animationScale: reducedMotion ? 1 : 1.05,

    // Focus styles
    focusRingClass: focusVisible
      ? 'ring-2 ring-saffron ring-offset-2 ring-offset-white dark:ring-offset-dark-bg-primary'
      : 'ring-0',

    // Screen reader utilities
    srOnlyClass: 'sr-only',
    visuallyHiddenClass: 'absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0',
  };
};

export default useAccessibility;

/**
 * Enhanced accessibility hook for Jyotish Shastra platform
 * Provides comprehensive accessibility features including:
 * - Screen reader support
 * - Keyboard navigation
 * - Focus management
 * - Reduced motion preferences
 * - High contrast mode
 * - ARIA announcements
 */
export const useEnhancedAccessibility = (options = {}) => {
  const {
    enableKeyboardNavigation = true,
    enableScreenReaderSupport = true,
    enableFocusTrapping = false
  } = options;

  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [focusedElement, setFocusedElement] = useState(null);
  const announceRef = useRef(null);
  const trapRef = useRef(null);

  // Create announcement element for screen readers
  useEffect(() => {
    if (!enableScreenReaderSupport) return;

    const announceElement = document.createElement('div');
    announceElement.setAttribute('aria-live', 'polite');
    announceElement.setAttribute('aria-atomic', 'true');
    announceElement.className = 'sr-only absolute -top-full left-0 w-1 h-1 overflow-hidden';
    announceElement.id = 'vedic-announcer';
    document.body.appendChild(announceElement);
    announceRef.current = announceElement;

    return () => {
      if (announceRef.current) {
        document.body.removeChild(announceRef.current);
      }
    };
  }, [enableScreenReaderSupport]);

  // Detect user preferences
  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    const handleMotionChange = (e) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleMotionChange);

    // Check for high contrast preference
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    setIsHighContrast(contrastQuery.matches);

    const handleContrastChange = (e) => setIsHighContrast(e.matches);
    contrastQuery.addEventListener('change', handleContrastChange);

    // Get user's font size preference
    const computedFontSize = parseInt(
      window.getComputedStyle(document.documentElement).fontSize
    );
    setFontSize(computedFontSize);

    return () => {
      mediaQuery.removeEventListener('change', handleMotionChange);
      contrastQuery.removeEventListener('change', handleContrastChange);
    };
  }, []);

  // Screen reader announcements
  const announce = useCallback((message, priority = 'polite') => {
    if (!announceRef.current || !enableScreenReaderSupport) return;

    announceRef.current.setAttribute('aria-live', priority);
    announceRef.current.textContent = message;

    // Clear after announcement
    setTimeout(() => {
      if (announceRef.current) {
        announceRef.current.textContent = '';
      }
    }, 1000);
  }, [enableScreenReaderSupport]);

  // Focus management
  const manageFocus = useCallback((element) => {
    if (!element) return;

    setFocusedElement(element);
    element.focus();

    // Announce focus change for complex widgets
    if (element.getAttribute('role') === 'tab') {
      announce(`Selected tab: ${element.textContent}`);
    } else if (element.getAttribute('role') === 'button') {
      announce(`Button: ${element.textContent || element.getAttribute('aria-label')}`);
    }
  }, [announce]);

  // Keyboard navigation handler
  const handleKeyboardNavigation = useCallback((event) => {
    if (!enableKeyboardNavigation) return;

    const { key, target } = event;

    // Handle Tab trapping if enabled
    if (enableFocusTrapping && trapRef.current) {
      if (key === 'Tab') {
        const focusableElements = trapRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey && target === firstElement) {
          event.preventDefault();
          lastElement.focus();
        } else if (!event.shiftKey && target === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }

      if (key === 'Escape') {
        // Allow escape to exit focus trap
        const escapeHandler = trapRef.current.getAttribute('data-escape-handler');
        if (escapeHandler && window[escapeHandler]) {
          window[escapeHandler]();
        }
      }
    }

    // Arrow key navigation for custom components
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
      const role = target.getAttribute('role');

      if (role === 'tab') {
        event.preventDefault();
        const tablist = target.closest('[role="tablist"]');
        const tabs = tablist.querySelectorAll('[role="tab"]');
        const currentIndex = Array.from(tabs).indexOf(target);

        let nextIndex;
        if (key === 'ArrowLeft' || key === 'ArrowUp') {
          nextIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
        } else {
          nextIndex = currentIndex === tabs.length - 1 ? 0 : currentIndex + 1;
        }

        manageFocus(tabs[nextIndex]);
      }
    }

    // Space/Enter activation for custom elements
    if ((key === ' ' || key === 'Enter') && target.getAttribute('role') === 'button') {
      event.preventDefault();
      target.click();
    }
  }, [enableKeyboardNavigation, enableFocusTrapping, manageFocus]);

  // Set up keyboard event listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyboardNavigation);
    return () => document.removeEventListener('keydown', handleKeyboardNavigation);
  }, [handleKeyboardNavigation]);

  // Skip link functionality
  const addSkipLink = useCallback((targetId, linkText = 'Skip to main content') => {
    const existingSkipLink = document.getElementById('skip-link');
    if (existingSkipLink) return;

    const skipLink = document.createElement('a');
    skipLink.id = 'skip-link';
    skipLink.href = `#${targetId}`;
    skipLink.textContent = linkText;
    skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-saffron focus:text-white focus:px-4 focus:py-2 focus:rounded';

    document.body.insertBefore(skipLink, document.body.firstChild);
  }, []);

  // ARIA live region for dynamic content
  const createLiveRegion = useCallback((id, priority = 'polite') => {
    const existing = document.getElementById(id);
    if (existing) return existing;

    const liveRegion = document.createElement('div');
    liveRegion.id = id;
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    document.body.appendChild(liveRegion);

    return liveRegion;
  }, []);

  // Vedic-specific accessibility helpers
  const announceChartReady = useCallback((chartType = 'birth chart') => {
    announce(`${chartType} has been generated and is ready for exploration. Use arrow keys to navigate between houses and planets.`);
  }, [announce]);

  const announceAnalysisUpdate = useCallback((section) => {
    announce(`${section} analysis has been updated`);
  }, [announce]);

  const describePlanetPosition = useCallback((planet, house, sign) => {
    const description = `${planet} is positioned in the ${house} house in ${sign} sign`;
    announce(description);
    return description;
  }, [announce]);

  // Font size adjustment
  const adjustFontSize = useCallback((delta) => {
    const newSize = Math.max(12, Math.min(24, fontSize + delta));
    setFontSize(newSize);
    document.documentElement.style.fontSize = `${newSize}px`;
    announce(`Font size ${delta > 0 ? 'increased' : 'decreased'} to ${newSize} pixels`);
  }, [fontSize, announce]);

  // High contrast toggle
  const toggleHighContrast = useCallback(() => {
    const newHighContrast = !isHighContrast;
    setIsHighContrast(newHighContrast);

    if (newHighContrast) {
      document.documentElement.classList.add('high-contrast');
      announce('High contrast mode enabled');
    } else {
      document.documentElement.classList.remove('high-contrast');
      announce('High contrast mode disabled');
    }
  }, [isHighContrast, announce]);

  // Focus trap helpers
  const setFocusTrap = useCallback((element) => {
    trapRef.current = element;
  }, []);

  const removeFocusTrap = useCallback(() => {
    trapRef.current = null;
  }, []);

  return {
    // State
    isHighContrast,
    isReducedMotion,
    fontSize,
    focusedElement,

    // Core functions
    announce,
    manageFocus,
    addSkipLink,
    createLiveRegion,

    // Settings
    adjustFontSize,
    toggleHighContrast,

    // Focus management
    setFocusTrap,
    removeFocusTrap,

    // Vedic-specific helpers
    announceChartReady,
    announceAnalysisUpdate,
    describePlanetPosition,

    // Accessibility props for components
    getA11yProps: (role, label, description) => ({
      role,
      'aria-label': label,
      'aria-describedby': description,
      tabIndex: 0,
      onFocus: (e) => setFocusedElement(e.target),
      onKeyDown: handleKeyboardNavigation
    }),

    // Screen reader only class
    srOnly: 'sr-only absolute w-1 h-1 p-0 -m-1 overflow-hidden clip-[rect(0,0,0,0)] border-0',

    // Reduced motion class
    reduceMotion: isReducedMotion ? 'motion-reduce' : '',

    // High contrast styles
    highContrastStyles: isHighContrast ? {
      filter: 'contrast(150%) brightness(110%)',
      outline: '2px solid currentColor'
    } : {}
  };
};

/**
 * Hook for managing focus on route changes
 */
export const useRouteAnnouncement = () => {
  const { announce } = useEnhancedAccessibility();

  useEffect(() => {
    const path = window.location.pathname;
    const pageNames = {
      '/': 'Home Page',
      '/chart': 'Birth Chart Generation',
      '/analysis': 'Astrological Analysis',
      '/report': 'Detailed Reports',
    };

    const pageName = pageNames[path] || 'Page';
    announce(`Navigated to ${pageName}`, 'assertive');
  }, [announce]);
};

/**
 * Hook for managing chart accessibility
 */
export const useChartAccessibility = (chartData) => {
  const { announce } = useEnhancedAccessibility();

  const getChartDescription = useCallback(() => {
    if (!chartData) return '';

    const { planets, houses, ascendant } = chartData;
    let description = `Birth chart loaded. Ascendant in ${ascendant}. `;

    if (planets) {
      description += `${Object.keys(planets).length} planets positioned. `;
    }

    if (houses) {
      description += `12 houses analyzed. `;
    }

    description += 'Use arrow keys to navigate chart elements.';
    return description;
  }, [chartData]);

  useEffect(() => {
    if (chartData) {
      const description = getChartDescription();
      announce(description, 'polite');
    }
  }, [chartData, announce, getChartDescription]);

  return { getChartDescription };
};
