import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from './ui';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/', icon: '🏠' },
    { name: 'Chart', href: '/chart', icon: '📊' },
    { name: 'Analysis', href: '/analysis', icon: '🔮' },
    { name: 'Report', href: '/report', icon: '📜' },
  ];

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-white/90 backdrop-blur-md shadow-medium border-b border-sacred-border sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cosmic-purple to-vedic-gold rounded-full flex items-center justify-center">
              <span className="text-xl text-white">🕉️</span>
            </div>
            <div className="font-accent font-bold text-earth-brown text-xl hidden sm:block">
              Jyotish Shastra
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActivePath(item.href)
                    ? 'bg-vedic-primary text-white shadow-cosmic'
                    : 'text-earth-brown hover:bg-sacred-background hover:text-cosmic-purple'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Theme Toggle & Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="p-2"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </Button>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? '✕' : '☰'}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-sacred-border bg-white/95 backdrop-blur-sm">
            <nav className="py-4 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    isActivePath(item.href)
                      ? 'bg-vedic-primary text-white border-l-4 border-vedic-gold'
                      : 'text-earth-brown hover:bg-sacred-background hover:text-cosmic-purple'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
