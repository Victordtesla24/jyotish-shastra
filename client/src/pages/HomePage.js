import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div style={{
      background: '#FFF8F3',
      minHeight: '100vh',
      padding: '2rem',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Hero Section */}
        <section style={{
          background: 'linear-gradient(135deg, #8B4513 0%, #FF6B35 100%)',
          color: 'white',
          padding: '5rem 2rem',
          textAlign: 'center',
          marginBottom: '4rem',
          borderRadius: '12px'
        }}>
          <div style={{
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            <div style={{
              fontFamily: 'serif',
              fontSize: '1.75rem',
              marginBottom: '1.5rem',
              fontWeight: '600',
              color: '#FFD700'
            }}>
              ज्योतिष शास्त्र
            </div>
            <h1 style={{
              fontSize: '3rem',
              marginBottom: '1.5rem',
              fontWeight: '700',
              lineHeight: '1.1'
            }}>
              Expert-Level Vedic Kundli Analysis
            </h1>
            <p style={{
              fontSize: '1.2rem',
              marginBottom: '3rem',
              opacity: '0.95',
              lineHeight: '1.7'
            }}>
              Discover your destiny through comprehensive Vedic astrology analysis.
              Get detailed insights into your personality, career, relationships, and life path.
            </p>
            <div style={{
              display: 'flex',
              gap: '1.5rem',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <Link to="/chart" style={{
                padding: '1rem 2rem',
                borderRadius: '12px',
                textDecoration: 'none',
                fontWeight: '600',
                background: 'white',
                color: '#8B4513',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                display: 'inline-block'
              }}>
                Get Free Kundli
              </Link>
              <Link to="/analysis" style={{
                padding: '1rem 2rem',
                borderRadius: '12px',
                textDecoration: 'none',
                fontWeight: '600',
                background: 'transparent',
                color: 'white',
                border: '2px solid white',
                display: 'inline-block'
              }}>
                Consult Astrologer
              </Link>
            </div>
          </div>
        </section>

        {/* Simple Content Section */}
        <section style={{
          padding: '3rem 0',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: '2.5rem',
            marginBottom: '2rem',
            color: '#8B4513'
          }}>
            Welcome to Jyotish Shastra
          </h2>
          <p style={{
            fontSize: '1.1rem',
            color: '#555',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Experience authentic Vedic astrology analysis with our advanced AI-powered system.
            Get detailed birth chart analysis, predictions, and guidance based on ancient wisdom.
          </p>
        </section>

        {/* Simple Stats */}
        <section style={{
          padding: '3rem 0',
          background: 'white',
          borderRadius: '12px',
          margin: '2rem 0'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem',
            padding: '2rem'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                color: '#FF6B35'
              }}>5000+</div>
              <div style={{ color: '#666' }}>Happy Clients</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                color: '#FF6B35'
              }}>15+</div>
              <div style={{ color: '#666' }}>Years Experience</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                color: '#FF6B35'
              }}>25+</div>
              <div style={{ color: '#666' }}>Expert Astrologers</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                color: '#FF6B35'
              }}>98%</div>
              <div style={{ color: '#666' }}>Accuracy Rate</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
