import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { usePWA } from '../hooks/usePWA';
import { Button, Input, OmIcon } from './ui';
import { useMemo } from 'react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);

  const navigation = [
    {
      name: 'Home',
      href: '/',
      icon: '🏠',
      description: 'Welcome to Vedic Astrology',
      keywords: ['home', 'main', 'welcome']
    },
    {
      name: 'Birth Chart',
      href: '/chart',
      icon: '📊',
      description: 'Generate your Kundli',
      keywords: ['chart', 'kundli', 'birth', 'horoscope', 'generate']
    },
    {
      name: 'Analysis',
      href: '/analysis',
      icon: '🔮',
      description: 'Deep astrological insights',
      keywords: ['analysis', 'insights', 'reading', 'interpretation']
    },
    {
      name: 'Reports',
      href: '/report',
      icon: '📜',
      description: 'Detailed predictions',
      keywords: ['reports', 'predictions', 'detailed', 'future']
    },
  ];

  const searchSuggestions = useMemo(() => [
    { title: 'Birth Chart Calculator', path: '/chart', type: 'tool', icon: '📊' },
    { title: 'Comprehensive Analysis', path: '/analysis', type: 'service', icon: '🔮' },
    { title: 'Personality Profile', path: '/analysis', type: 'feature', icon: '👤' },
    { title: 'Career Predictions', path: '/report', type: 'report', icon: '💼' },
    { title: 'Relationship Compatibility', path: '/analysis', type: 'feature', icon: '💕' },
    { title: 'Daily Horoscope', path: '/', type: 'content', icon: '🌟' },
    { title: 'Vedic Remedies', path: '/analysis', type: 'feature', icon: '🕉️' },
    { title: 'Dasha Periods', path: '/analysis', type: 'feature', icon: '⏰' },
  ], []);

  // Enhanced scroll effects with performance optimization
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = useCallback((query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    const filtered = searchSuggestions.filter(item =>
      item.title.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(filtered);
  }, [searchSuggestions]);

  useEffect(() => {
    handleSearch(searchQuery);
  }, [searchQuery, handleSearch]);

  // Keyboard navigation for search
  const handleSearchKeyDown = (event) => {
    if (event.key === 'Escape') {
      setIsSearchOpen(false);
    } else if (event.key === 'Enter' && searchResults.length > 0) {
      navigate(searchResults[0].path);
      setIsSearchOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
  }, [location.pathname]);

  // Focus search input when opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current.focus();
      }, 100);
    }
  }, [isSearchOpen]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  return (
    <motion.header
      className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 dark:bg-dark-bg-primary/80 backdrop-blur-lg shadow-lg' : 'bg-transparent'}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center space-x-2">
              <OmIcon className="h-8 w-8 text-vedic-saffron" />
              <span className="font-accent text-2xl font-bold text-earth-brown dark:text-sacred-white">Jyotish Shastra</span>
            </Link>
          </div>
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-base font-medium ${isActivePath(item.href) ? 'text-vedic-saffron' : 'text-wisdom-gray dark:text-gray-300'} hover:text-vedic-saffron dark:hover:text-vedic-gold transition-colors duration-200`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="flex items-center space-x-4">
            <div className="relative" ref={searchRef}>
              <Button variant="ghost" onClick={() => setIsSearchOpen(!isSearchOpen)}>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </Button>
              <AnimatePresence>
                {isSearchOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-64 bg-white dark:bg-dark-surface rounded-md shadow-lg"
                  >
                    <Input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={handleSearchKeyDown}
                      className="w-full p-2"
                    />
                    {searchResults.length > 0 && (
                      <ul className="py-1">
                        {searchResults.map((result) => (
                          <li
                            key={result.title}
                            onClick={() => {
                              navigate(result.path);
                              setIsSearchOpen(false);
                            }}
                            className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-bg-secondary cursor-pointer"
                          >
                            {result.title}
                          </li>
                        ))}
                      </ul>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Button variant="ghost" onClick={toggleTheme}>
              {theme === 'dark' ? '☀️' : '🌙'}
            </Button>
            <div className="md:hidden">
              <Button variant="ghost" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
              </Button>
            </div>
          </div>
        </div>
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="md:hidden"
            >
              <nav className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`block px-3 py-2 rounded-md text-base font-medium ${isActivePath(item.href) ? 'text-white bg-vedic-saffron' : 'text-gray-700 dark:text-gray-300'} hover:text-white hover:bg-vedic-saffron dark:hover:bg-vedic-gold`}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default Header;
