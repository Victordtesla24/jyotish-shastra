import React from 'react';
import { Link, NavLink } from 'react-router-dom';

const Header = () => {
  const getNavLinkClass = ({ isActive }) => {
    const baseClasses = 'font-medium py-2 border-b-2 transition-all duration-200 hover:opacity-80 hover:border-white';
    return isActive
      ? `${baseClasses} border-vedic-gold text-vedic-gold`
      : `${baseClasses} border-transparent`;
  };

  return (
    <header className="bg-gradient-to-r from-vedic-saffron to-vedic-maroon text-white py-4 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <Link to="/" className="text-white">
            <h1 className="m-0 text-2xl font-bold font-accent">Jyotish Shastra</h1>
          </Link>
          <nav className="flex gap-4 md:gap-8">
            <NavLink to="/" className={getNavLinkClass}>Home</NavLink>
            <NavLink to="/chart" className={getNavLinkClass}>Birth Chart</NavLink>
            <NavLink to="/analysis" className={getNavLinkClass}>Analysis</NavLink>
            <NavLink to="/report" className={getNavLinkClass}>Reports</NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
