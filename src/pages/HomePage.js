import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useCountUp from '../hooks/useCountUp';
import './HomePage.css';

// Zodiac sign data
const zodiacSigns = [
  { name: 'Aries', symbol: '♈', dates: 'Mar 21 - Apr 19', sanskrit: 'मेष' },
  { name: 'Taurus', symbol: '♉', dates: 'Apr 20 - May 20', sanskrit: 'वृष' },
  { name: 'Gemini', symbol: '♊', dates: 'May 21 - Jun 20', sanskrit: 'मिथुन' },
  { name: 'Cancer', symbol: '♋', dates: 'Jun 21 - Jul 22', sanskrit: 'कर्क' },
  { name: 'Leo', symbol: '♌', dates: 'Jul 23 - Aug 22', sanskrit: 'सिंह' },
  { name: 'Virgo', symbol: '♍', dates: 'Aug 23 - Sep 22', sanskrit: 'कन्या' },
  { name: 'Libra', symbol: '♎', dates: 'Sep 23 - Oct 22', sanskrit: 'तुला' },
  { name: 'Scorpio', symbol: '♏', dates: 'Oct 23 - Nov 21', sanskrit: 'वृश्चिक' },
  { name: 'Sagittarius', symbol: '♐', dates: 'Nov 22 - Dec 21', sanskrit: 'धनु' },
  { name: 'Capricorn', symbol: '♑', dates: 'Dec 22 - Jan 19', sanskrit: 'मकर' },
  { name: 'Aquarius', symbol: '♒', dates: 'Jan 20 - Feb 18', sanskrit: 'कुम्भ' },
  { name: 'Pisces', symbol: '♓', dates: 'Feb 19 - Mar 20', sanskrit: 'मीन' }
];

// Stat Counter Component
const StatCounter = ({ value, label }) => {
  const [ref, count] = useCountUp(value);
  return (
    <div ref={ref} className="stat-card">
      <div className="stat-number">{count.toLocaleString()}+</div>
      <div className="stat-label">{label}</div>
    </div>
  );
};

// Services data
const services = [
  { icon: '🌟', title: 'Kundli Analysis', description: 'Comprehensive birth chart analysis with planetary positions and predictions.' },
  { icon: '💎', title: 'Gemstone Recommendation', description: 'Personalized gemstone suggestions based on your planetary positions.' },
  { icon: '🏠', title: 'Vastu Consultation', description: 'Home and office Vastu guidance for prosperity and peace.' },
  { icon: '💑', title: 'Marriage Compatibility', description: 'Complete horoscope matching for marital harmony.' },
  { icon: '💼', title: 'Career Astrology', description: 'Professional guidance based on your astrological profile.' },
  { icon: '⚡', title: 'Manglik Dosha', description: 'Manglik dosha analysis and remedial solutions.' }
];

// Testimonials data
const testimonials = [
  { name: 'Priya Sharma', location: 'Mumbai', rating: 5, review: 'Incredibly accurate predictions! The kundli analysis helped me make important life decisions.', avatar: 'https://i.pravatar.cc/150?img=1' },
  { name: 'Raj Patel', location: 'Delhi', rating: 5, review: 'The marriage compatibility report was spot on. Highly recommend their services.', avatar: 'https://i.pravatar.cc/150?img=2' },
  { name: 'Anita Singh', location: 'Bangalore', rating: 5, review: 'Professional astrology service with deep knowledge of Vedic traditions.', avatar: 'https://i.pravatar.cc/150?img=3' }
];

const HomePage = () => {
  const [quickFormData, setQuickFormData] = useState({
    date: '',
    time: '',
    place: ''
  });

  const handleQuickFormChange = (e) => {
    setQuickFormData({
      ...quickFormData,
      [e.target.name]: e.target.value
    });
  };

  const handleQuickFormSubmit = (e) => {
    e.preventDefault();
    // Redirect to chart generation with pre-filled data
    // This would integrate with your existing chart generation logic
    console.log('Quick form data:', quickFormData);
  };

  return (
    <div className="home-page">
      <div className="container">
        {/* Enhanced Hero Section */}
        <section className="hero">
          <div className="hero-content">
            <div className="sanskrit-subtitle">ज्योतिष शास्त्र</div>
            <h1>Expert-Level Vedic Kundli Analysis</h1>
            <p>
              Discover your destiny through comprehensive Vedic astrology analysis.
              Get detailed insights into your personality, career, relationships, and life path using ancient wisdom and modern AI technology.
            </p>
            <div className="hero-buttons">
              <Link to="/chart" className="btn btn-primary">
                Get Free Kundli
              </Link>
              <Link to="/analysis" className="btn btn-secondary">
                Consult Astrologer
              </Link>
            </div>
          </div>
        </section>

        {/* Trust Building Stats */}
        <section className="trust-stats">
          <div className="stats-grid">
            <StatCounter value={5000} label="Happy Clients" />
            <StatCounter value={15} label="Years Experience" />
            <StatCounter value={25} label="Expert Astrologers" />
            <StatCounter value={98} label="Accuracy Rate" />
          </div>
        </section>

        {/* Zodiac Forecast Grid */}
        <section className="zodiac-forecasts">
          <h2>राशिफल - Today's Horoscope</h2>
          <p className="section-subtitle">Discover what the stars have in store for you today</p>
          <div className="zodiac-grid">
            {zodiacSigns.map((sign, index) => (
              <div key={index} className="zodiac-card">
                <div className="zodiac-symbol">{sign.symbol}</div>
                <div className="zodiac-sanskrit">{sign.sanskrit}</div>
                <h3>{sign.name}</h3>
                <p className="zodiac-dates">{sign.dates}</p>
                <Link to={`/horoscope/${sign.name.toLowerCase()}`} className="zodiac-link">
                  Read Today's Horoscope
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Traditional Services */}
        <section className="services">
          <h2>Our Vedic Astrology Services</h2>
          <p className="section-subtitle">Comprehensive solutions for all aspects of life</p>
          <div className="services-grid">
            {services.map((service, index) => (
              <div key={index} className="service-card">
                <div className="service-icon">{service.icon}</div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <Link to="/services" className="service-link">Learn More</Link>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Horoscope Widget */}
        <section className="quick-horoscope">
          <div className="quick-horoscope-content">
            <h2>Know Your Zodiac Sign</h2>
            <p>Enter your birth details to discover your zodiac sign and get instant insights</p>
            <form onSubmit={handleQuickFormSubmit} className="quick-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    name="date"
                    value={quickFormData.date}
                    onChange={handleQuickFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Time of Birth</label>
                  <input
                    type="time"
                    name="time"
                    value={quickFormData.time}
                    onChange={handleQuickFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Place of Birth</label>
                  <input
                    type="text"
                    name="place"
                    value={quickFormData.place}
                    onChange={handleQuickFormChange}
                    placeholder="Enter city name"
                    required
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary">Find My Sign</button>
            </form>
          </div>
        </section>

        {/* How VedicAI Works */}
        <section className="how-it-works">
          <h2>How Our VedicAI Works</h2>
          <p className="section-subtitle">Ancient wisdom meets modern AI technology</p>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Enter Birth Details</h3>
              <p>Provide your exact birth date, time, and location for precise astronomical calculations.</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>AI Analysis</h3>
              <p>Our AI analyzes your birth chart using classical Vedic texts and modern interpretations.</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Comprehensive Insights</h3>
              <p>Receive detailed analysis covering personality, career, relationships, and life predictions.</p>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <h3>Personalized Report</h3>
              <p>Get your complete Vedic astrology report with remedies and guidance for life.</p>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="testimonials">
          <h2>What Our Clients Say</h2>
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <img src={testimonial.avatar} alt={testimonial.name} className="testimonial-avatar" />
                <div className="stars">
                  {'★'.repeat(testimonial.rating)}
                </div>
                <p>"{testimonial.review}"</p>
                <div className="testimonial-author">
                  <strong>{testimonial.name}</strong>
                  <span>{testimonial.location}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="newsletter">
          <div className="newsletter-content">
            <h2>Get Daily Horoscope</h2>
            <p>Subscribe to receive your personalized daily horoscope and astrological insights</p>
            <form className="newsletter-form">
              <input
                type="email"
                placeholder="Enter your email address"
                required
              />
              <button type="submit" className="btn btn-primary">Subscribe</button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
