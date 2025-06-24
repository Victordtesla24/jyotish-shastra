import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-page">
      <div className="container">
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-content">
            <h1>Expert-Level Vedic Kundli Analysis</h1>
            <p>
              Discover your destiny through comprehensive Vedic astrology analysis.
              Get detailed insights into your personality, career, relationships, and life path.
            </p>
            <div className="hero-buttons">
              <Link to="/chart" className="btn btn-primary">
                Generate Birth Chart
              </Link>
              <Link to="/analysis" className="btn btn-secondary">
                Learn More
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features">
          <h2>Comprehensive Analysis Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🌟</div>
              <h3>Birth Chart Generation</h3>
              <p>Precise calculation of planetary positions and house cusps using advanced astronomical algorithms.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔮</div>
              <h3>House Analysis</h3>
              <p>Detailed examination of all 12 houses covering every aspect of life from personality to spirituality.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Yoga Detection</h3>
              <p>Identification and interpretation of classical Vedic yogas that shape your destiny.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📅</div>
              <h3>Dasha Timeline</h3>
              <p>Complete life timeline using Vimshottari dasha system for accurate predictions.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Divisional Charts</h3>
              <p>Analysis of Navamsa and other divisional charts for deeper insights.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📋</div>
              <h3>Detailed Reports</h3>
              <p>Comprehensive reports covering personality, health, career, relationships, and life predictions.</p>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="how-it-works">
          <h2>How It Works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Enter Birth Details</h3>
              <p>Provide your exact birth date, time, and location for precise calculations.</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Generate Chart</h3>
              <p>Our system calculates planetary positions and generates your birth chart.</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Get Analysis</h3>
              <p>Receive comprehensive analysis of your chart with detailed interpretations.</p>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <h3>View Report</h3>
              <p>Access your detailed report with predictions and guidance for life.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
