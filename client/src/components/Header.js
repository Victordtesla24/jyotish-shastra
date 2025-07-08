import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { Button, Input, OmIcon } from './ui';
import ChartDataManager from '../utils/chartDataManager';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [birthData, setBirthData] = useState(null);
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Birth Chart', href: '/chart' },
    { name: 'Analysis', href: '/analysis' },
    { name: 'Personality Profile', href: '/personality-analysis' },
    { name: 'Enhanced Analysis', href: '/enhanced-analysis' },
    { name: 'Reports', href: '/report' },
  ];

  const searchSuggestions = useMemo(() => [
    { title: 'Birth Chart Calculator', path: '/chart' },
    { title: 'Comprehensive Analysis', path: '/analysis' },
    { title: 'Personality Profile', path: '/analysis' },
    { title: 'Career Predictions', path: '/report' },
  ], []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load birth data from ChartDataManager
  useEffect(() => {
    const loadBirthData = () => {
      const storedBirthData = ChartDataManager.getDisplayBirthData();
      if (storedBirthData) {
        setBirthData(storedBirthData);
      }
    };
    loadBirthData();

    // Listen for storage changes to update birth data
    const handleStorageChange = () => {
      loadBirthData();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [location.pathname]);

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
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 dark:bg-dark-bg-primary/80 backdrop-blur-lg shadow-lg' : 'bg-transparent'}`}>
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
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </Button>
              {isSearchOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-dark-surface rounded-md shadow-lg transition-all duration-200">
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
                </div>
              )}
            </div>
            <Button variant="ghost" onClick={toggleTheme}>
              {theme === 'dark' ? '☀️' : '🌙'}
            </Button>
            <div className="md:hidden">
              <Button variant="ghost" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
        {isMenuOpen && (
          <div className="md:hidden transition-all duration-300">
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
          </div>
        )}
      </div>

      {/* Birth Data Display Bar */}
      {birthData && (
        <div className="bg-gradient-to-r from-vedic-saffron/10 to-vedic-gold/10 border-b border-vedic-saffron/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-2 text-sm">
              <div className="flex items-center space-x-4">
                <span className="text-vedic-saffron font-medium">🌟 Current Chart:</span>
                <span className="text-earth-brown dark:text-sacred-white">
                  {birthData.name || 'User'}
                </span>
                <span className="text-wisdom-gray">
                  {birthData.date} • {birthData.time} • {birthData.place}
                </span>
              </div>
              <button
                onClick={() => navigate('/analysis')}
                className="text-vedic-saffron hover:text-vedic-gold transition-colors"
              >
                View Analysis →
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
