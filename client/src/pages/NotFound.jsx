import React from 'react';
import { Link } from 'react-router-dom';
import HeroSection from '../components/ui/HeroSection.jsx';

/**
 * NotFound - 404 Page
 * Displays when a route doesn't exist
 * Includes navigation back to home page
 */
const NotFound = () => {
  return (
    <div className="not-found-page">
      <HeroSection title="Page Not Found" subtitle="The page you're looking for doesn't exist">
        <div style={{
          textAlign: 'center',
          padding: '60px 40px',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <h1 style={{
            fontFamily: "'Roboto', sans-serif",
            fontSize: '120px',
            fontWeight: 100,
            color: 'rgba(255, 255, 255, 0.2)',
            letterSpacing: '8px',
            textTransform: 'uppercase',
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            404
          </h1>
          
          <h5 style={{
            fontFamily: "'Roboto Condensed', sans-serif",
            fontSize: '24px',
            fontWeight: 300,
            color: 'rgba(255, 255, 255, 0.7)',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            marginBottom: '48px',
            textAlign: 'center'
          }}>
            Page Not Found
          </h5>
          
          <p style={{
            fontFamily: "'Roboto', sans-serif",
            fontSize: '16px',
            fontWeight: 300,
            color: 'rgba(255, 255, 255, 0.5)',
            lineHeight: '24px',
            marginBottom: '48px',
            textAlign: 'center'
          }}>
            The page you're looking for doesn't exist or has been moved. 
            Please check the URL and try again, or return to the home page.
          </p>
          
          <Link 
            to="/"
            style={{
              display: 'inline-block',
              fontFamily: "'Roboto Condensed', sans-serif",
              fontSize: '14px',
              fontWeight: 400,
              color: '#000',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              padding: '16px 48px',
              borderRadius: '4px',
              textDecoration: 'none',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 16px rgba(255, 255, 255, 0.1)'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#fff';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 24px rgba(255, 255, 255, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 16px rgba(255, 255, 255, 0.1)';
            }}
          >
            Return Home
          </Link>
        </div>
      </HeroSection>
    </div>
  );
};

export default NotFound;
