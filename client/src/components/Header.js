import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <h1>Jyotish Shastra</h1>
          </Link>
          <nav className="nav">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/chart" className="nav-link">Birth Chart</Link>
            <Link to="/analysis" className="nav-link">Analysis</Link>
            <Link to="/report" className="nav-link">Reports</Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
