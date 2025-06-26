import React, { lazy, Suspense } from 'react';

/**
 * Performance optimization utilities for Jyotish Shastra
 * Implements code splitting, lazy loading, and performance monitoring
 */

// Lazy loading wrapper with fallback
export const createLazyComponent = (importFunc, fallback = null) => {
  const LazyComponent = lazy(importFunc);

  return (props) => (
    <Suspense fallback={fallback || <ComponentSkeleton />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

// Default loading skeleton
const ComponentSkeleton = () => (
  <div className="animate-pulse space-y-4 p-6">
    <div className="h-4 bg-gray-200 dark:bg-dark-surface rounded w-3/4"></div>
    <div className="h-4 bg-gray-200 dark:bg-dark-surface rounded w-1/2"></div>
    <div className="h-32 bg-gray-200 dark:bg-dark-surface rounded"></div>
  </div>
);

// Image optimization utilities
export const optimizeImage = (src, options = {}) => {
  const {
    width = 'auto',
    height = 'auto',
    quality = 80,
    format = 'webp'
  } = options;

  // For production, you might want to use a service like Cloudinary
  // For now, return the original src with basic optimization hints
  return src;
};

// Intersection Observer for lazy loading
export const useLazyLoading = (threshold = 0.1) => {
  const [visibleElements, setVisibleElements] = React.useState(new Set());

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const elementId = entry.target.getAttribute('data-lazy-id');
            if (elementId) {
              setVisibleElements(prev => new Set([...prev, elementId]));
            }
          }
        });
      },
      { threshold }
    );

    const elements = document.querySelectorAll('[data-lazy-id]');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [threshold]);

  return visibleElements;
};

// Performance monitoring
export const measurePerformance = (name, fn) => {
  return async (...args) => {
    const start = performance.now();
    const result = await fn(...args);
    const end = performance.now();

    console.log(`Performance: ${name} took ${end - start} milliseconds`);

    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      // Analytics implementation here
    }

    return result;
  };
};

// Bundle size monitoring
export const getBundleSize = () => {
  if (typeof navigator !== 'undefined' && 'connection' in navigator) {
    const connection = navigator.connection;
    return {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
    };
  }
  return null;
};

// Memory usage monitoring
export const getMemoryUsage = () => {
  if (typeof performance !== 'undefined' && 'memory' in performance) {
    return {
      usedJSHeapSize: performance.memory.usedJSHeapSize,
      totalJSHeapSize: performance.memory.totalJSHeapSize,
      jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
    };
  }
  return null;
};

// Preload critical resources
export const preloadResource = (href, as = 'script', crossorigin = false) => {
  if (typeof document !== 'undefined') {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    if (crossorigin) link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  }
};

// Critical CSS loading
export const loadCriticalCSS = (css) => {
  if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }
};

// Font loading optimization
export const loadFonts = (fontFamilies) => {
  if (typeof document !== 'undefined' && 'fonts' in document) {
    fontFamilies.forEach(family => {
      const font = new FontFace(family.name, `url(${family.url})`);
      font.load().then(loadedFont => {
        document.fonts.add(loadedFont);
      });
    });
  }
};

// Service Worker registration
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('Service Worker registered successfully:', registration);

      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New content available, show update notification
            showUpdateNotification();
          }
        });
      });

      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
};

// Update notification
const showUpdateNotification = () => {
  // Implementation for showing update notification
  const event = new CustomEvent('sw-update-available');
  window.dispatchEvent(event);
};

// Performance observer for Core Web Vitals
export const observeWebVitals = (onPerfEntry) => {
  if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach(onPerfEntry);
    });

    observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] });

    // CLS observation
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });

    return () => {
      observer.disconnect();
      clsObserver.disconnect();
    };
  }
};

// Lazy loading for route components
export const LazyRoutes = {
  HomePage: createLazyComponent(() => import('../pages/HomePage')),
  ChartPage: createLazyComponent(() => import('../pages/ChartPage')),
  AnalysisPage: createLazyComponent(() => import('../pages/AnalysisPage')),
  ReportPage: createLazyComponent(() => import('../pages/ReportPage')),
};

/**
 * Performance Monitoring and Optimization Utilities
 * Enhanced for Jyotish Shastra Vedic Astrology Platform
 */

// Web Vitals tracking
let cls = 0;
let fid = 0;
let lcp = 0;
let fcp = 0;
let ttfb = 0;

/**
 * Initialize performance monitoring
 */
export const initPerformanceMonitoring = () => {
  if (typeof window === 'undefined') return;

  // Core Web Vitals
  trackCLS();
  trackFID();
  trackLCP();
  trackFCP();
  trackTTFB();

  // Custom metrics
  trackChartRenderTime();
  trackAnimationPerformance();
  trackMemoryUsage();
};

/**
 * Track Cumulative Layout Shift
 */
const trackCLS = () => {
  if (!window.PerformanceObserver) return;

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!entry.hadRecentInput) {
        cls += entry.value;
      }
    }
  });

  observer.observe({ type: 'layout-shift', buffered: true });
};

/**
 * Track First Input Delay
 */
const trackFID = () => {
  if (!window.PerformanceObserver) return;

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      fid = entry.processingStart - entry.startTime;
      console.log('FID:', fid);
      break;
    }
  });

  observer.observe({ type: 'first-input', buffered: true });
};

/**
 * Track Largest Contentful Paint
 */
const trackLCP = () => {
  if (!window.PerformanceObserver) return;

  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    lcp = lastEntry.startTime;
    console.log('LCP:', lcp);
  });

  observer.observe({ type: 'largest-contentful-paint', buffered: true });
};

/**
 * Track First Contentful Paint
 */
const trackFCP = () => {
  if (!window.PerformanceObserver) return;

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.name === 'first-contentful-paint') {
        fcp = entry.startTime;
        console.log('FCP:', fcp);
      }
    }
  });

  observer.observe({ type: 'paint', buffered: true });
};

/**
 * Track Time to First Byte
 */
const trackTTFB = () => {
  if (!window.performance || !window.performance.timing) return;

  const { responseStart, requestStart } = window.performance.timing;
  ttfb = responseStart - requestStart;
  console.log('TTFB:', ttfb);
};

/**
 * Track chart rendering performance
 */
const trackChartRenderTime = () => {
  if (!window.performance) return;

  window.addEventListener('chart-render-start', () => {
    window.performance.mark('chart-render-start');
  });

  window.addEventListener('chart-render-end', () => {
    window.performance.mark('chart-render-end');
    window.performance.measure('chart-render', 'chart-render-start', 'chart-render-end');

    const measure = window.performance.getEntriesByName('chart-render')[0];
    if (measure) {
      console.log('Chart render time:', measure.duration);
    }
  });
};

/**
 * Track animation performance
 */
const trackAnimationPerformance = () => {
  let animationFrames = 0;
  let lastTime = 0;
  let fps = 0;

  const measureFPS = (currentTime) => {
    animationFrames++;

    if (currentTime >= lastTime + 1000) {
      fps = Math.round((animationFrames * 1000) / (currentTime - lastTime));
      animationFrames = 0;
      lastTime = currentTime;

      // Log if FPS drops below 50
      if (fps < 50) {
        console.warn('Low FPS detected:', fps);
      }
    }

    requestAnimationFrame(measureFPS);
  };

  requestAnimationFrame(measureFPS);
};

/**
 * Track memory usage
 */
const trackMemoryUsage = () => {
  if (!window.performance || !window.performance.memory) return;

  setInterval(() => {
    const memory = window.performance.memory;
    const used = memory.usedJSHeapSize / 1048576; // Convert to MB
    const total = memory.totalJSHeapSize / 1048576;

    // Log if memory usage is high
    if (used > 50) {
      console.warn('High memory usage:', `${used.toFixed(2)} MB / ${total.toFixed(2)} MB`);
    }
  }, 30000); // Check every 30 seconds
};

/**
 * Lazy load images with intersection observer
 * @param {Element} img - Image element
 * @param {string} src - Image source
 */
export const lazyLoadImage = (img, src) => {
  if (!window.IntersectionObserver) {
    img.src = src;
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const imgElement = entry.target;
        imgElement.src = src;
        imgElement.classList.remove('lazy');
        observer.unobserve(imgElement);
      }
    });
  });

  observer.observe(img);
};

/**
 * Debounce function for performance optimization
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @param {boolean} immediate - Execute immediately
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait, immediate = false) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
};

/**
 * Throttle function for performance optimization
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Preload critical resources
 * @param {Array} resources - Array of resource URLs
 */
export const preloadResources = (resources) => {
  resources.forEach((resource) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource.url;
    link.as = resource.type || 'fetch';
    if (resource.crossorigin) {
      link.crossOrigin = resource.crossorigin;
    }
    document.head.appendChild(link);
  });
};

/**
 * Get performance metrics
 * @returns {Object} Performance metrics
 */
export const getPerformanceMetrics = () => {
  return {
    cls,
    fid,
    lcp,
    fcp,
    ttfb,
    navigation: window.performance?.timing ? {
      domContentLoaded: window.performance.timing.domContentLoadedEventEnd - window.performance.timing.navigationStart,
      loadComplete: window.performance.timing.loadEventEnd - window.performance.timing.navigationStart
    } : null,
    memory: window.performance?.memory ? {
      used: Math.round(window.performance.memory.usedJSHeapSize / 1048576),
      total: Math.round(window.performance.memory.totalJSHeapSize / 1048576),
      limit: Math.round(window.performance.memory.jsHeapSizeLimit / 1048576)
    } : null
  };
};

/**
 * Performance monitoring for Vedic chart operations
 */
export const VedicChartPerformance = {
  startChartGeneration: () => {
    window.performance?.mark('vedic-chart-start');
    window.dispatchEvent(new Event('chart-render-start'));
  },

  endChartGeneration: () => {
    window.performance?.mark('vedic-chart-end');
    window.dispatchEvent(new Event('chart-render-end'));

    if (window.performance?.measure) {
      window.performance.measure('vedic-chart-generation', 'vedic-chart-start', 'vedic-chart-end');
      const measure = window.performance.getEntriesByName('vedic-chart-generation')[0];
      if (measure) {
        console.log(`Vedic chart generated in ${measure.duration.toFixed(2)}ms`);
      }
    }
  },

  startAnalysis: () => {
    window.performance?.mark('vedic-analysis-start');
  },

  endAnalysis: () => {
    window.performance?.mark('vedic-analysis-end');

    if (window.performance?.measure) {
      window.performance.measure('vedic-analysis', 'vedic-analysis-start', 'vedic-analysis-end');
      const measure = window.performance.getEntriesByName('vedic-analysis')[0];
      if (measure) {
        console.log(`Vedic analysis completed in ${measure.duration.toFixed(2)}ms`);
      }
    }
  }
};

/**
 * Bundle size optimization helper
 * @param {Function} importFunction - Dynamic import function
 * @returns {Promise} Lazy loaded component
 */
export const lazyLoad = (importFunction) => {
  return React.lazy(() =>
    importFunction().catch(err => {
      console.error('Failed to load component:', err);
      return { default: () => React.createElement('div', null, 'Failed to load component') };
    })
  );
};

// Auto-initialize performance monitoring
if (typeof window !== 'undefined') {
  initPerformanceMonitoring();
}
