import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import HeroSection from '../components/ui/HeroSection.jsx';
import StarLetterAnimation from '../components/navigation/StarLetterAnimation.jsx';
import LunarPhaseAnimation from '../components/ui/LunarPhaseAnimation.jsx';
import CosmicHourglassAnimation from '../components/ui/CosmicHourglassAnimation.jsx';
import StarryBackground from '../components/ui/StarryBackground.jsx';
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
  const btrRef = useRef(null);
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

  // Navigation items matching the image: ABOUT, BIRTH CHART, ANALYSIS, BTR, CONTACT
  // Items with routes navigate to separate pages, others scroll to sections
  const navItems = [
    { 
      ref: aboutRef,
      id: 'about',
      label: 'ABOUT', 
      letter: 'A', 
      position: 'right',
      key: 'about',
      scrollOnly: true
    },
    { 
      ref: birthChartRef,
      id: 'birth-chart',
      label: 'BIRTH CHART', 
      letter: 'B', 
      position: 'left',
      key: 'birth-chart',
      route: '/chart'
    },
    { 
      ref: analysisRef,
      id: 'analysis',
      label: 'ANALYSIS', 
      letter: 'A2', 
      position: 'left',
      key: 'analysis',
      route: '/analysis'
    },
    { 
      ref: btrRef,
      id: 'birth-time-rectification',
      label: 'BTR', 
      letter: 'B2', 
      position: 'right',
      key: 'btr',
      route: '/birth-time-rectification'
    },
    { 
      ref: contactRef,
      id: 'contact',
      label: 'CONTACT', 
      letter: 'C', 
      position: 'right',
      key: 'contact',
      scrollOnly: true
    }
  ];

  // Handle navigation click - route navigation or scroll to section
  const handleNavClick = (item, event) => {
    if (item.route) {
      // Navigate to route for pages
      navigate(item.route);
    } else if (item.scrollOnly) {
      // Scroll to section for same-page content
      const buttonElement = event.currentTarget;
      scrollToSection(item.ref, buttonElement);
    }
  };

  return (
    <div className="homepage-sectioned">
      {/* STARRY BACKGROUND - Chris Cole Style (STATIC - no parallax) */}
      <StarryBackground starCount={150} />
      
      {/* HERO SECTION */}
      <section ref={heroRef} id="hero" className="section-hero fade-in-section">
        <HeroSection title="" subtitle="">
          {/* Vertical Navigation - Chris Cole Style */}
          <div className="vertical-navigation-chris-cole">
            <nav className="vertical-nav-menu">
              {navItems.map((item, index) => (
                <div 
                  key={item.key}
                  className="vertical-nav-item fade-in-nav"
                  style={{ animationDelay: `${index * 0.1}s` }}
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
      <section ref={aboutRef} id="about" className="section-about fade-in-section">
        <div className="section-content-wrapper">
          <div className="chris-cole-biography reveal" style={{
            border: '1px solid rgba(255, 255, 255, 0.35)',
            padding: 'clamp(30px, 5vw, 60px) clamp(20px, 6vw, 80px)',
            maxWidth: '700px',
            margin: '0 auto clamp(60px, 10vw, 120px)',
            background: 'transparent',
            textAlign: 'center'
          }}>
            <h5 style={{
              fontFamily: "'Roboto Condensed', sans-serif",
              fontSize: 'clamp(13px, 2vw, 16px)',
              fontWeight: 300,
              color: 'rgb(255, 255, 255)',
              textTransform: 'uppercase',
              letterSpacing: 'clamp(1px, 0.2vw, 2px)',
              lineHeight: 'clamp(20px, 3vw, 24px)',
              marginBottom: 'clamp(24px, 4vw, 48px)',
              maxWidth: '600px',
              margin: '0 auto clamp(24px, 4vw, 48px)'
            }}>
              WE'VE CREATED VEDIC ASTROLOGY SOFTWARE FOR SEEKERS WORLDWIDE, helping people discover their cosmic blueprint.
              <br /><br />
              WE DO A BIT OF EVERYTHING, BUT OUR SPECIALTIES INCLUDE:
            </h5>
          </div>
        </div>
      </section>

      {/* BIRTH CHART SECTION */}
      <section ref={birthChartRef} id="birth-chart" className="section-birth-chart fade-in-section">
        <div className="section-content-wrapper">
          <div className="chris-cole-work-section reveal" style={{
            marginTop: 'clamp(40px, 8vw, 80px)',
            marginBottom: 'clamp(20px, 4vw, 40px)'
          }}>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 'clamp(24px, 5vw, 60px)',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{
                flex: '0 1 360px',
                textAlign: 'center'
              }}>
                <h1 style={{
                  fontFamily: "'Roboto', sans-serif",
                  fontSize: 'clamp(28px, 7vw, 64px)',
                  fontWeight: 100,
                  color: 'rgba(255, 255, 255, 0.75)',
                  letterSpacing: 'clamp(2px, 0.6vw, 6px)',
                  textTransform: 'uppercase',
                  marginBottom: 'clamp(12px, 2vw, 24px)',
                  cursor: 'pointer'
                }}
                onClick={() => navigate('/chart')}
                >
                  BIRTH CHART
                </h1>
                <h5 style={{
                  fontFamily: "'Roboto Condensed', sans-serif",
                  fontSize: 'clamp(12px, 1.8vw, 16px)',
                  fontWeight: 300,
                  color: 'rgba(255, 255, 255, 0.55)',
                  letterSpacing: 'clamp(1px, 0.2vw, 2px)',
                  textTransform: 'uppercase',
                  marginBottom: 'clamp(12px, 3vw, 24px)'
                }}>
                  (START YOUR JOURNEY)
                </h5>
              </div>
              <div style={{
                flex: '0 1 500px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <LunarPhaseAnimation />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ANALYSIS SECTION */}
      <section ref={analysisRef} id="analysis" className="section-analysis fade-in-section">
        <div className="section-content-wrapper">
          <div className="chris-cole-work-section reveal" style={{
            textAlign: 'center',
            marginTop: 'clamp(40px, 8vw, 80px)',
            marginBottom: 'clamp(20px, 4vw, 40px)'
          }}>
            <h1 style={{
              fontFamily: "'Roboto', sans-serif",
              fontSize: 'clamp(28px, 7vw, 64px)',
              fontWeight: 100,
              color: 'rgba(255, 255, 255, 0.6)',
              letterSpacing: 'clamp(2px, 0.6vw, 6px)',
              textTransform: 'uppercase',
              marginBottom: 'clamp(12px, 2vw, 24px)',
              cursor: 'pointer'
            }}
            onClick={() => navigate('/analysis')}
            >
              ANALYSIS
            </h1>
            <h5 style={{
              fontFamily: "'Roboto Condensed', sans-serif",
              fontSize: 'clamp(12px, 1.8vw, 16px)',
              fontWeight: 300,
              color: 'rgba(255, 255, 255, 0.5)',
              letterSpacing: 'clamp(1px, 0.2vw, 2px)',
              textTransform: 'uppercase',
              marginBottom: 'clamp(30px, 5vw, 60px)'
            }}>
              (COMPREHENSIVE INSIGHTS)
            </h5>
          </div>
        </div>
      </section>

      {/* BIRTH TIME RECTIFICATION SECTION */}
      <section ref={btrRef} id="birth-time-rectification" className="section-btr fade-in-section">
        <div className="section-content-wrapper">
          <div className="chris-cole-work-section reveal" style={{
            marginTop: 'clamp(40px, 8vw, 80px)',
            marginBottom: 'clamp(20px, 4vw, 40px)'
          }}>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 'clamp(24px, 5vw, 60px)',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{
                flex: '0 1 360px',
                textAlign: 'center'
              }}>
                <h1 style={{
                  fontFamily: "'Roboto', sans-serif",
                  fontSize: 'clamp(28px, 7vw, 64px)',
                  fontWeight: 100,
                  color: 'rgba(255, 255, 255, 0.75)',
                  letterSpacing: 'clamp(2px, 0.6vw, 6px)',
                  textTransform: 'uppercase',
                  marginBottom: 'clamp(12px, 2vw, 24px)',
                  cursor: 'pointer'
                }}
                onClick={() => navigate('/birth-time-rectification')}
                >
                  BTR
                </h1>
                <h5 style={{
                  fontFamily: "'Roboto Condensed', sans-serif",
                  fontSize: 'clamp(12px, 1.8vw, 16px)',
                  fontWeight: 300,
                  color: 'rgba(255, 255, 255, 0.55)',
                  letterSpacing: 'clamp(1px, 0.2vw, 2px)',
                  textTransform: 'uppercase',
                  marginBottom: 'clamp(12px, 3vw, 24px)'
                }}>
                  (BIRTH TIME RECTIFICATION)
                </h5>
              </div>

              {/* Cosmic Hourglass Animation */}
              <div style={{
                flex: '0 1 500px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CosmicHourglassAnimation />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section ref={contactRef} id="contact" className="section-contact fade-in-section">
        <div className="section-content-wrapper">
          <div className="reveal" style={{
            maxWidth: '600px',
            margin: '0 auto',
            padding: 'clamp(40px, 8vw, 80px) clamp(20px, 4vw, 40px)'
          }}>
            <h1 style={{
              fontFamily: "'Roboto', sans-serif",
              fontSize: 'clamp(28px, 7vw, 64px)',
              fontWeight: 100,
              color: 'rgba(255, 255, 255, 0.6)',
              letterSpacing: 'clamp(2px, 0.6vw, 6px)',
              textTransform: 'uppercase',
              marginBottom: 'clamp(12px, 2vw, 24px)',
              textAlign: 'center'
            }}>
              CONTACT
            </h1>
            <h5 style={{
              fontFamily: "'Roboto Condensed', sans-serif",
              fontSize: 'clamp(12px, 1.8vw, 16px)',
              fontWeight: 300,
              color: 'rgba(255, 255, 255, 0.5)',
              letterSpacing: 'clamp(1px, 0.2vw, 2px)',
              textTransform: 'uppercase',
              marginBottom: 'clamp(30px, 5vw, 60px)',
              textAlign: 'center'
            }}>
              (GET IN TOUCH)
            </h5>

            <form style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'clamp(16px, 2vw, 24px)'
            }}>
              <div>
                <label style={{
                  fontFamily: "'Roboto', sans-serif",
                  fontSize: 'clamp(11px, 1.2vw, 12px)',
                  fontWeight: 500,
                  color: 'rgba(255, 255, 255, 0.7)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  display: 'block',
                  marginBottom: 'clamp(6px, 0.8vw, 8px)'
                }}>
                  Name
                </label>
                <input 
                  type="text"
                  className="form-input-vedic"
                  style={{
                    width: '100%',
                    padding: 'clamp(10px, 1.2vw, 12px) clamp(12px, 1.5vw, 16px)',
                    background: '#1A1A1A',
                    border: '1px solid #505050',
                    borderRadius: '4px',
                    color: '#FFFFFF',
                    fontFamily: "'Roboto', sans-serif",
                    fontSize: 'clamp(13px, 1.5vw, 14px)'
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
