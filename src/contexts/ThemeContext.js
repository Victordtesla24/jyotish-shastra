import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({
  theme: 'light',
  setTheme: () => null,
  systemTheme: 'light',
  toggleTheme: () => null,
});

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children, defaultTheme = 'system', storageKey = 'jyotish-shastra-theme' }) => {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(storageKey) || defaultTheme;
    }
    return defaultTheme;
  });

  const [systemTheme, setSystemTheme] = useState('light');

  // Detect system theme preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

    const handler = (e) => setSystemTheme(e.matches ? 'dark' : 'light');
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Apply theme to document
  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = theme === 'dark' || (theme === 'system' && systemTheme === 'dark');

    root.classList.remove('light', 'dark');
    root.classList.add(isDark ? 'dark' : 'light');

    // Add smooth transition for theme changes
    const transitionStyles = `
      * {
        transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease !important;
      }
    `;

    const existingTransition = document.getElementById('theme-transition');
    if (!existingTransition) {
      const style = document.createElement('style');
      style.id = 'theme-transition';
      style.textContent = transitionStyles;
      document.head.appendChild(style);
    }

    // Remove transitions after theme change
    setTimeout(() => {
      const transitionElement = document.getElementById('theme-transition');
      if (transitionElement) {
        transitionElement.remove();
      }
    }, 300);

    // Store theme preference
    localStorage.setItem(storageKey, theme);
  }, [theme, systemTheme, storageKey]);

  const toggleTheme = () => {
    setTheme(prev => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'system';
      return 'light';
    });
  };

  const value = {
    theme,
    setTheme: (theme) => setTheme(theme),
    systemTheme,
    toggleTheme,
    isDark: theme === 'dark' || (theme === 'system' && systemTheme === 'dark'),
    isLight: theme === 'light' || (theme === 'system' && systemTheme === 'light'),
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
