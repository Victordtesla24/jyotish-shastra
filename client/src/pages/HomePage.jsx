import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import HeroSection from '../components/ui/HeroSection.jsx';
import StarLetterAnimation from '../components/navigation/StarLetterAnimation.jsx';
import { initScrollReveals, initParallaxBackground, cleanupScrollTriggers } from '../lib/scroll.js';
import '../styles/homepage-sections.css';
import '../styles/chris-cole-enhancements.css';

/**
 * HomePage - Section-based layout matching Chris Cole's design
 * Sections: Hero, About, Birth Chart, Analysis, Contact
 * Features: Smooth scrolling, vertical navigation, Chris Cole aesthetics
 * Implementation Plan: @implementation-plan-UI.md
 */
const HomePage = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const aboutRef = useRef(null);
  const birthChartRef = useRef(null);
  const analysisRef = useRef(null);
  const contactRef = useRef(null);
  const [hoveredItem, setHoveredItem] = useState(null);

  // Initialize scroll/parallax effects
  useEffect(() => {
    initScrollReveals();
    initParallaxBackground('.parallax-bg', '.hero-section');
    
    return () => {
      cleanupScrollTriggers();
    };
  }, []);

  // Smooth scroll to section with GSAP letter flying animation
  // Implementation Plan: "animate its first letter flying left before scrolling to the section"
  const scrollToSection = (ref, buttonElement) => {
    if (!buttonElement || !ref.current) {
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    const heading = buttonElement.querySelector('.chris-cole-nav-heading');
    if (!heading) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    // Extract first letter and create span for animation
    const text = heading.textContent;
    const firstLetter = text.charAt(0);
    const restOfText = text.substring(1);
    
    // Create wrapper for first letter
    const letterSpan = document.createElement('span');
    letterSpan.textContent = firstLetter;
    letterSpan.style.display = 'inline-block';
    letterSpan.className = 'flying-letter';
    
    // Update heading with wrapped first letter
    heading.textContent = '';
    heading.appendChild(letterSpan);
    heading.appendChild(document.createTextNode(restOfText));
    
    // GSAP Timeline: Letter flies left, then scroll
    const timeline = gsap.timeline();
    
    // Animate first letter flying left (400ms per implementation plan)
    timeline.to(letterSpan, {
      x: -100,
      opacity: 0,
      duration: 0.4,
      ease: 'power2.inOut',
      onComplete: () => {
        // Start scrolling after letter flies away
        ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Reset heading after scroll animation completes
        setTimeout(() => {
          heading.textContent = text;
        }, 1000);
      }
    });
  };

  // Navigation items matching the image: ABOUT, BIRTH CHART, ANALYSIS, CONTACT
  const navItems = [
    { 
      ref: aboutRef,
      id: 'about',
      label: 'ABOUT', 
      letter: 'A', 
      position: 'right',
      key: 'about'
    },
    { 
      ref: birthChartRef,
      id: 'birth-chart',
      label: 'BIRTH CHART', 
      letter: 'B', 
      position: 'left',
      key: 'birth-chart'
    },
    { 
      ref: analysisRef,
      id: 'analysis',
      label: 'ANALYSIS', 
      letter: 'A2', 
      position: 'left',
      key: 'analysis'
    },
    { 
      ref: contactRef,
      id: 'contact',
      label: 'CONTACT', 
      letter: 'C', 
      position: 'right',
      key: 'contact'
    }
  ];

  // Handle navigation click
  const handleNavClick = (item, event) => {
    const buttonElement = event.currentTarget;
    scrollToSection(item.ref, buttonElement);
  };

  return (
    <div className="homepage-sectioned">
      {/* HERO SECTION */}
      <section ref={heroRef} id="hero" className="section-hero">
        <HeroSection title="" subtitle="">
          {/* Vertical Navigation - Chris Cole Style */}
          <div className="vertical-navigation-chris-cole">
            <nav className="vertical-nav-menu">
              {navItems.map((item) => (
                <div 
                  key={item.key}
                  className="vertical-nav-item"
                  onMouseEnter={() => setHoveredItem(item.key)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <StarLetterAnimation
                    letter={item.letter}
                    position={item.position}
                    isHovered={hoveredItem === item.key}
                    path={`#${item.id}`}
                    label={item.label}
                    isActive={false}
                    onClick={(e) => handleNavClick(item, e)}
                  />
                </div>
              ))}
            </nav>
          </div>
        </HeroSection>
      </section>

      {/* ABOUT SECTION */}
      <section ref={aboutRef} id="about" className="section-about">
        <div className="section-content-wrapper">
          <div className="chris-cole-biography" style={{
            border: '1px solid rgba(255, 255, 255, 0.35)',
            padding: '60px 80px',
            maxWidth: '700px',
            margin: '0 auto 120px',
            background: 'transparent',
            textAlign: 'center'
          }}>
            <h5 style={{
              fontFamily: "'Roboto Condensed', sans-serif",
              fontSize: '16px',
              fontWeight: 300,
              color: 'rgb(255, 255, 255)',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              lineHeight: '24px',
              marginBottom: '48px',
              maxWidth: '600px',
              margin: '0 auto 48px'
            }}>
              WE'VE CREATED VEDIC ASTROLOGY SOFTWARE FOR SEEKERS WORLDWIDE, helping people discover their cosmic blueprint.
              <br /><br />
              WE DO A BIT OF EVERYTHING, BUT OUR SPECIALTIES INCLUDE:
            </h5>
          </div>
        </div>
      </section>

      {/* BIRTH CHART SECTION */}
      <section ref={birthChartRef} id="birth-chart" className="section-birth-chart">
        <div className="section-content-wrapper">
          <div className="chris-cole-work-section" style={{
            textAlign: 'center',
            marginTop: '80px',
            marginBottom: '40px'
          }}>
            <h1 style={{
              fontFamily: "'Roboto', sans-serif",
              fontSize: '63.968px',
              fontWeight: 100,
              color: 'rgba(255, 255, 255, 0.6)',
              letterSpacing: '6px',
              textTransform: 'uppercase',
              marginBottom: '24px',
              cursor: 'pointer'
            }}
            onClick={() => navigate('/chart')}
            >
              BIRTH CHART
            </h1>
            <h5 style={{
              fontFamily: "'Roboto Condensed', sans-serif",
              fontSize: '16px',
              fontWeight: 300,
              color: 'rgba(255, 255, 255, 0.5)',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              marginBottom: '60px'
            }}>
              (START YOUR JOURNEY)
            </h5>
          </div>
        </div>
      </section>

      {/* ANALYSIS SECTION */}
      <section ref={analysisRef} id="analysis" className="section-analysis">
        <div className="section-content-wrapper">
          <div className="chris-cole-work-section" style={{
            textAlign: 'center',
            marginTop: '80px',
            marginBottom: '40px'
          }}>
            <h1 style={{
              fontFamily: "'Roboto', sans-serif",
              fontSize: '63.968px',
              fontWeight: 100,
              color: 'rgba(255, 255, 255, 0.6)',
              letterSpacing: '6px',
              textTransform: 'uppercase',
              marginBottom: '24px',
              cursor: 'pointer'
            }}
            onClick={() => navigate('/analysis')}
            >
              ANALYSIS
            </h1>
            <h5 style={{
              fontFamily: "'Roboto Condensed', sans-serif",
              fontSize: '16px',
              fontWeight: 300,
              color: 'rgba(255, 255, 255, 0.5)',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              marginBottom: '60px'
            }}>
              (COMPREHENSIVE INSIGHTS)
            </h5>
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section ref={contactRef} id="contact" className="section-contact">
        <div className="section-content-wrapper">
          <div style={{
            maxWidth: '600px',
            margin: '0 auto',
            padding: '80px 40px'
          }}>
            <h1 style={{
              fontFamily: "'Roboto', sans-serif",
              fontSize: '63.968px',
              fontWeight: 100,
              color: 'rgba(255, 255, 255, 0.6)',
              letterSpacing: '6px',
              textTransform: 'uppercase',
              marginBottom: '24px',
              textAlign: 'center'
            }}>
              CONTACT
            </h1>
            <h5 style={{
              fontFamily: "'Roboto Condensed', sans-serif",
              fontSize: '16px',
              fontWeight: 300,
              color: 'rgba(255, 255, 255, 0.5)',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              marginBottom: '60px',
              textAlign: 'center'
            }}>
              (GET IN TOUCH)
            </h5>

            <form style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '24px'
            }}>
              <div>
                <label style={{
                  fontFamily: "'Roboto', sans-serif",
                  fontSize: '12px',
                  fontWeight: 500,
                  color: 'rgba(255, 255, 255, 0.7)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  display: 'block',
                  marginBottom: '8px'
                }}>
                  Name
                </label>
                <input 
                  type="text"
                  className="form-input-vedic"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: '#1A1A1A',
                    border: '1px solid #505050',
                    borderRadius: '4px',
                    color: '#FFFFFF',
                    fontFamily: "'Roboto', sans-serif",
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{
                  fontFamily: "'Roboto', sans-serif",
                  fontSize: '12px',
                  fontWeight: 500,
                  color: 'rgba(255, 255, 255, 0.7)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  display: 'block',
                  marginBottom: '8px'
                }}>
                  Email
                </label>
                <input 
                  type="email"
                  className="form-input-vedic"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: '#1A1A1A',
                    border: '1px solid #505050',
                    borderRadius: '4px',
                    color: '#FFFFFF',
                    fontFamily: "'Roboto', sans-serif",
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{
                  fontFamily: "'Roboto', sans-serif",
                  fontSize: '12px',
                  fontWeight: 500,
                  color: 'rgba(255, 255, 255, 0.7)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  display: 'block',
                  marginBottom: '8px'
                }}>
                  Message
                </label>
                <textarea 
                  rows="6"
                  className="form-input-vedic"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: '#1A1A1A',
                    border: '1px solid #505050',
                    borderRadius: '4px',
                    color: '#FFFFFF',
                    fontFamily: "'Roboto', sans-serif",
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  fontFamily: "'Roboto', sans-serif",
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#000',
                  background: 'linear-gradient(135deg, #FFD700 0%, #FF9933 100%)',
                  padding: '16px 48px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 16px rgba(255, 215, 0, 0.3)',
                  alignSelf: 'center'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 24px rgba(255, 215, 0, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 16px rgba(255, 215, 0, 0.3)';
                }}
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
