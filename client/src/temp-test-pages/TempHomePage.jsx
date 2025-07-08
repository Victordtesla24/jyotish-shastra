import React from 'react';
import { useNavigate } from 'react-router-dom';

const TempHomePage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>🧪 TEMP TEST - Home Page</h1>
      <p>Minimal test page for validating navigation flow</p>

      <button
        onClick={() => navigate('/temp-birth-chart')}
        style={{
          padding: '12px 24px',
          backgroundColor: '#FF6B35',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        Generate Birth Chart
      </button>

      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        TEST FLOW: Home → BirthChart → Analysis → ComprehensiveReport
      </div>
    </div>
  );
};

export default TempHomePage;
