import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { Button, cn } from './ui';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/chart', label: 'Birth Chart' },
    { path: '/analysis', label: 'Analysis' },
    { path: '/report', label: 'Reports' }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
      className="bg-vedic-surface/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-vedic-border dark:border-gray-700 sticky top-0 z-50 shadow-lg"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 360 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="w-12 h-12 bg-gradient-to-br from-vedic-primary to-vedic-accent rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl"
            >
              <span className="text-white font-bold text-lg">ॐ</span>
            </motion.div>
            <div className="flex flex-col">
              <span className="text-xl font-cinzel font-bold text-vedic-text dark:text-white">
                Jyotish Shastra
              </span>
              <span className="text-xs text-vedic-accent font-noto">
                ज्योतिष शास्त्र
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "relative px-3 py-2 text-sm font-medium transition-all duration-300 rounded-lg",
                  isActive(item.path)
                    ? "text-vedic-accent"
                    : "text-vedic-text-light dark:text-gray-300 hover:text-vedic-text dark:hover:text-white"
                )}
              >
                {item.label}
                <AnimatePresence>
                  {isActive(item.path) && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute inset-0 bg-vedic-accent/10 rounded-lg -z-10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    />
                  )}
                </AnimatePresence>
                <motion.span
                  className={cn(
                    "absolute bottom-0 left-0 w-full h-0.5 bg-vedic-accent",
                    isActive(item.path) ? "scale-x-100" : "scale-x-0"
                  )}
                  whileHover={{ scaleX: isActive(item.path) ? 1 : 0.8 }}
                  transition={{ type: "spring", stiffness: 300 }}
                />
              </Link>
            ))}

            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-vedic-surface dark:bg-gray-800 border border-vedic-border dark:border-gray-700 text-vedic-text dark:text-white hover:bg-vedic-primary/10 dark:hover:bg-vedic-primary/20 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </motion.button>

            <Link to="/chart">
              <Button variant="accent" size="md">
                <span className="mr-2">Get Kundli</span>
                <span>→</span>
              </Button>
            </Link>
          </nav>

          {/* Mobile menu button */}
          <div className="flex items-center space-x-2 md:hidden">
            {/* Mobile Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="p-2 rounded-lg text-vedic-text dark:text-white"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </motion.button>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-vedic-text dark:text-white hover:bg-vedic-primary/10 dark:hover:bg-vedic-primary/20 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-4 border-t border-vedic-border dark:border-gray-700">
                <div className="flex flex-col space-y-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={cn(
                        "px-4 py-3 rounded-lg font-medium transition-all duration-300",
                        isActive(item.path)
                          ? "text-vedic-accent bg-vedic-accent/10"
                          : "text-vedic-text-light dark:text-gray-300 hover:text-vedic-text dark:hover:text-white hover:bg-vedic-primary/5"
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <Link
                    to="/chart"
                    onClick={() => setIsMenuOpen(false)}
                    className="mx-4 mt-4"
                  >
                    <Button variant="accent" size="lg" className="w-full">
                      Get Kundli
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default Header;
