import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { OmIcon, MandalaIcon, ThemeToggle } from './ui';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest('nav')) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMobileMenuOpen]);

  const navigationItems = [
    { name: 'Home', path: '/', icon: OmIcon },
    { name: 'Generate Chart', path: '/chart', icon: MandalaIcon },
    { name: 'Analysis', path: '/analysis', icon: MandalaIcon },
    { name: 'Reports', path: '/report', icon: MandalaIcon }
  ];

  const getNavLinkClass = ({ isActive }) => {
    const baseClasses = [
      'relative px-4 py-2 text-sm md:text-base font-medium',
      'transition-all duration-300 ease-in-out',
      'hover:text-gold focus:outline-none focus:ring-2 focus:ring-gold/50 rounded-md',
      'flex items-center space-x-2'
    ].join(' ');

    if (isActive) {
      return `${baseClasses} text-gold`;
    }

    return `${baseClasses} text-white hover:text-gold/80`;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-gradient-to-r from-stellar-blue/95 to-cosmic-purple/95 backdrop-blur-lg shadow-vedic-medium'
            : 'bg-gradient-to-r from-stellar-blue to-cosmic-purple'
        }`}
      >
        <nav className="container-vedic">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo Section */}
            <Link
              to="/"
              className="flex items-center space-x-3 group focus:outline-none focus:ring-2 focus:ring-gold/50 rounded-lg p-2"
              aria-label="Jyotish Shastra Home"
            >
              <div className="relative">
                <OmIcon
                  size={32}
                  className="text-gold group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gold/20 rounded-full blur-lg group-hover:bg-gold/30 transition-colors duration-300"></div>
              </div>
              <div className="hidden sm:block">
                <div className="font-accent text-xl md:text-2xl font-bold text-white group-hover:text-gold transition-colors duration-300">
                  Jyotish Shastra
                </div>
                <div className="font-vedic text-xs text-gold/80">
                  ज्योतिष शास्त्र
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={getNavLinkClass}
                  >
                    {({ isActive }) => (
                      <>
                        <IconComponent
                          size={18}
                          className={`transition-transform duration-300 ${
                            isActive ? 'scale-110 text-gold' : 'group-hover:scale-105'
                          }`}
                        />
                        <span>{item.name}</span>
                        {isActive && (
                          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-gold rounded-full"></div>
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>

            {/* Theme Toggle & CTA Button (Desktop) */}
            <div className="hidden md:flex items-center space-x-4">
              <ThemeToggle size="md" />
              <Link
                to="/chart"
                className="bg-gradient-to-r from-gold to-saffron text-white px-6 py-2 rounded-full font-medium shadow-golden hover:shadow-xl transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gold/50"
              >
                Start Reading
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden flex flex-col items-center justify-center w-10 h-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 transition-colors duration-300"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
            >
              <div className="space-y-1.5">
                <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${
                  isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''
                }`}></span>
                <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${
                  isMobileMenuOpen ? 'opacity-0' : ''
                }`}></span>
                <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${
                  isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''
                }`}></span>
              </div>
            </button>
          </div>
        </nav>

        {/* Mobile Navigation Menu */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen
            ? 'max-h-screen opacity-100'
            : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <div className="bg-gradient-to-b from-cosmic-purple to-navy border-t border-white/10">
            <div className="container-vedic py-4">
              <div className="flex flex-col space-y-2">
                {navigationItems.map((item, index) => {
                  const IconComponent = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) => `
                        flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300
                        ${isActive
                          ? 'bg-gold/20 text-gold border-l-4 border-gold'
                          : 'text-white hover:bg-white/10 hover:text-gold'
                        }
                      `}
                      style={{
                        animationDelay: `${index * 100}ms`,
                        animation: isMobileMenuOpen ? 'slideInFromRight 0.3s ease-out forwards' : 'none'
                      }}
                    >
                      <IconComponent size={20} />
                      <span className="font-medium">{item.name}</span>
                    </NavLink>
                  );
                })}

                {/* Mobile Theme Toggle & CTA */}
                <div className="pt-4 border-t border-white/10 mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white/80 text-sm font-medium">Theme</span>
                    <ThemeToggle size="sm" />
                  </div>
                  <Link
                    to="/chart"
                    className="flex items-center justify-center space-x-2 bg-gradient-to-r from-gold to-saffron text-white px-6 py-3 rounded-lg font-medium shadow-golden hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    <MandalaIcon size={18} />
                    <span>Start Your Reading</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Spacer to prevent content from hiding behind fixed header */}
      <div className="h-16 md:h-20"></div>
    </>
  );
};

export default Header;
