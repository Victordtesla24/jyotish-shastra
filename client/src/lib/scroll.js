import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Scroll Utilities
 * GSAP ScrollTrigger utilities for scroll/parallax effects
 * Matches Chris Cole's scroll-linked reveals and parallax
 */

/**
 * Initialize scroll reveals for elements with .reveal class
 * Fade/translate reveals for cards/sections
 */
export const initScrollReveals = () => {
  if (typeof window === 'undefined') return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReducedMotion) {
    // Skip animations for reduced motion
    return;
  }

  const revealElements = document.querySelectorAll('.reveal');
  
  revealElements.forEach((el) => {
    gsap.from(el, {
      opacity: 0,
      y: 40,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse'
      }
    });
  });
};

/**
 * Initialize parallax background effect
 * Slow-moving background layers on scroll
 */
export const initParallaxBackground = (selector = '.parallax-bg', triggerSelector = '.hero-section') => {
  if (typeof window === 'undefined') return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReducedMotion) {
    return;
  }

  // Wait for DOM to be ready
  const initParallax = () => {
    const parallaxElement = document.querySelector(selector);
    const triggerElement = document.querySelector(triggerSelector);
    
    if (!parallaxElement || !triggerElement) {
      // Retry after a short delay if elements aren't ready
      setTimeout(initParallax, 100);
      return;
    }

    // Kill any existing ScrollTrigger on this element
    ScrollTrigger.getAll().forEach(trigger => {
      if (trigger.vars && trigger.vars.trigger === triggerElement) {
        trigger.kill();
      }
    });

    gsap.to(parallaxElement, {
      yPercent: -30,
      ease: 'none',
      scrollTrigger: {
        trigger: triggerElement,
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
        invalidateOnRefresh: true
      }
    });
  };

  // Initialize immediately and also on next frame for safety
  if (document.readyState === 'complete') {
    initParallax();
  } else {
    window.addEventListener('load', initParallax);
    setTimeout(initParallax, 100);
  }
};

/**
 * Initialize section pinning
 * Pin sections for emphasis during scroll
 */
export const initSectionPinning = (selector, duration = '100%') => {
  if (typeof window === 'undefined') return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReducedMotion) {
    return;
  }

  const element = document.querySelector(selector);
  
  if (!element) return;

  ScrollTrigger.create({
    trigger: element,
    start: 'top top',
    end: `+=${duration}`,
    pin: true,
    pinSpacing: true
  });
};

/**
 * Initialize staggered reveals for grid items
 * Staggered animation for card grids
 */
export const initStaggeredReveals = (selector = '.stagger-reveal', stagger = 0.1) => {
  if (typeof window === 'undefined') return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReducedMotion) {
    return;
  }

  const elements = document.querySelectorAll(selector);
  
  if (elements.length === 0) return;

  gsap.utils.toArray(elements).forEach((el, index) => {
    gsap.from(el, {
      opacity: 0,
      y: 30,
      duration: 0.6,
      delay: index * stagger,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none reverse'
      }
    });
  });
};

/**
 * Cleanup all ScrollTrigger instances
 * Call this on component unmount
 */
export const cleanupScrollTriggers = () => {
  if (typeof window === 'undefined') return;
  
  ScrollTrigger.getAll().forEach((trigger) => {
    trigger.kill();
  });
};

/**
 * Refresh ScrollTrigger instances
 * Call this after dynamic content loads
 */
export const refreshScrollTriggers = () => {
  if (typeof window === 'undefined') return;
  
  ScrollTrigger.refresh();
};

