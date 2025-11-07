import React from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from './ui/ThemeToggle.jsx';

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="nav-vedic bg-black shadow-lg sticky top-0 z-50 border-b border-white/10">
      <div className="container-vedic py-4">
        <div className="flex items-center justify-between">
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <span className="text-2xl">🕉️</span>
            <h1 className="font-accent text-xl md:text-2xl text-white typography-roboto">
              Jyotish Shastra
            </h1>
          </div>

          <nav className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/chart')}
              className="nav-item hidden sm:inline-flex"
            >
              Birth Chart
            </button>
            <button
              onClick={() => navigate('/analysis')}
              className="nav-item hidden sm:inline-flex"
            >
              Analysis
            </button>
            <button
              onClick={() => navigate('/birth-time-rectification')}
              className="nav-item hidden md:inline-flex bg-gradient-to-r from-saffron to-gold text-white px-3 py-1 rounded-full text-sm font-semibold hover:from-saffron-light hover:to-gold-light transition-all duration-300"
            >
              🕉️ BTR
            </button>
            <button
              onClick={() => navigate('/comprehensive-analysis')}
              className="nav-item hidden lg:inline-flex"
            >
              Comprehensive
            </button>
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
