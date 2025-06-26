import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Jyotish Shastra</h3>
            <p>Expert-level Vedic Astrology Analysis System</p>
          </div>
          <div className="footer-section">
            <h4>Features</h4>
            <ul>
              <li>Birth Chart Generation</li>
              <li>Comprehensive Analysis</li>
              <li>Life Predictions</li>
              <li>Detailed Reports</li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Resources</h4>
            <ul>
              <li>Documentation</li>
              <li>API Reference</li>
              <li>User Guide</li>
              <li>Support</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Jyotish Shastra. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
