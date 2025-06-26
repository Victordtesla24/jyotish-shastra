import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { OmIcon, MandalaIcon } from './ui';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getNavLinkClass = ({ isActive }) => {
    const baseClasses = [
      'nav-link-vedic',
      'px-3 py-2 text-sm md:text-base font-medium',
      'transition-all duration-300 ease-in-out',
      'hover:text-vedic-gold hover:scale-105',
      'focus:outline-none focus:ring-2 focus:ring-vedic-gold focus:ring-opacity-50 rounded-md'
    ].join(' ');

    return isActive
      ? `${baseClasses} nav-link-active text-vedic-gold border-b-2 border-vedic-gold`
      : `${baseClasses} nav-link-inactive text-white hover:border-b-2 hover:border-vedic-gold/50`;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-gradient-vedic text-white shadow-vedic-strong relative z-50">
      <div className="container-vedic py-4">
        <div className="flex justify-between items-center">
          {/* Logo Section */}
          <Link
            to="/"
            className="flex items-center space-x-3 group hover:scale-105 transition-transform duration-300"
          >
            <div className="flex items-center">
              <OmIcon
                size={32}
                className="text-vedic-gold group-hover:animate-pulse-soft transition-all duration-300"
              />
              <h1 className="ml-3 text-xl md:text-2xl font-bold font-accent text-white group-hover:text-vedic-gold transition-colors duration-300">
                Jyotish Shastra
              </h1>
              <MandalaIcon
                size={24}
                className="ml-2 text-vedic-gold/70 group-hover:animate-spin-slow transition-all duration-300"
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <NavLink to="/" className={getNavLinkClass}>
              Home
            </NavLink>
            <NavLink to="/chart" className={getNavLinkClass}>
              Birth Chart
            </NavLink>
            <NavLink to="/analysis" className={getNavLinkClass}>
              Analysis
            </NavLink>
            <NavLink to="/report" className={getNavLinkClass}>
              Reports
            </NavLink>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-vedic-gold focus:ring-opacity-50"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
            aria-expanded={isMobileMenuOpen}
          >
            <svg
              className={`w-6 h-6 transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-45' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen
              ? 'max-h-64 opacity-100 mt-4'
              : 'max-h-0 opacity-0'
          }`}
        >
          <nav className="flex flex-col space-y-2 py-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `block px-4 py-3 text-center font-medium transition-all duration-300 hover:bg-white/10 rounded-md mx-2 ${
                  isActive
                    ? 'text-vedic-gold bg-white/20'
                    : 'text-white hover:text-vedic-gold'
                }`
              }
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </NavLink>

            <NavLink
              to="/chart"
              className={({ isActive }) =>
                `block px-4 py-3 text-center font-medium transition-all duration-300 hover:bg-white/10 rounded-md mx-2 ${
                  isActive
                    ? 'text-vedic-gold bg-white/20'
                    : 'text-white hover:text-vedic-gold'
                }`
              }
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Birth Chart
            </NavLink>

            <NavLink
              to="/analysis"
              className={({ isActive }) =>
                `block px-4 py-3 text-center font-medium transition-all duration-300 hover:bg-white/10 rounded-md mx-2 ${
                  isActive
                    ? 'text-vedic-gold bg-white/20'
                    : 'text-white hover:text-vedic-gold'
                }`
              }
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Analysis
            </NavLink>

            <NavLink
              to="/report"
              className={({ isActive }) =>
                `block px-4 py-3 text-center font-medium transition-all duration-300 hover:bg-white/10 rounded-md mx-2 ${
                  isActive
                    ? 'text-vedic-gold bg-white/20'
                    : 'text-white hover:text-vedic-gold'
                }`
              }
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Reports
            </NavLink>
          </nav>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-vedic-gold via-saffron to-gold opacity-60"></div>
      </div>
    </header>
  );
};

export default Header;
