import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const TempComprehensiveAnalysisPage = () => {
  const navigate = useNavigate();
  const [analysisData, setAnalysisData] = useState(null);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    // Get analysis data from session storage
    const storedAnalysisData = sessionStorage.getItem('tempTestAnalysisData');
    const storedChartData = sessionStorage.getItem('tempTestChartData');

    if (storedAnalysisData) {
      setAnalysisData(JSON.parse(storedAnalysisData));
    }

    if (storedChartData) {
      setChartData(JSON.parse(storedChartData));
    }
  }, []);

  const renderSection = (title, data, depth = 0) => {
    if (!data || typeof data !== 'object') {
      return (
        <div style={{ marginLeft: `${depth * 20}px`, marginBottom: '5px' }}>
          <span style={{ color: '#666' }}>{typeof data === 'string' ? data : JSON.stringify(data)}</span>
        </div>
      );
    }

    return (
      <div style={{ marginLeft: `${depth * 20}px`, marginBottom: '10px' }}>
        <details open={depth < 2}>
          <summary style={{
            fontWeight: 'bold',
            cursor: 'pointer',
            color: depth === 0 ? '#FF6B35' : depth === 1 ? '#17a2b8' : '#6c757d',
            fontSize: depth === 0 ? '18px' : depth === 1 ? '16px' : '14px'
          }}>
            {title} {Array.isArray(data) ? `(${data.length} items)` : `(${Object.keys(data).length} keys)`}
          </summary>
          <div style={{ marginTop: '10px' }}>
            {Array.isArray(data) ? (
              data.map((item, index) => (
                <div key={index} style={{ marginBottom: '5px' }}>
                  {renderSection(`Item ${index + 1}`, item, depth + 1)}
                </div>
              ))
            ) : (
              Object.entries(data).map(([key, value]) => (
                <div key={key} style={{ marginBottom: '8px' }}>
                  {renderSection(key, value, depth + 1)}
                </div>
              ))
            )}
          </div>
        </details>
      </div>
    );
  };

  const generatePDF = () => {
    console.log('🧪 TEMP TEST - PDF generation would be implemented here');
    alert('PDF generation functionality would be implemented in production');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>🧪 TEMP TEST - Comprehensive Analysis Report</h1>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button
          onClick={() => navigate('/temp-birth-chart')}
          style={{
            padding: '8px 16px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          ← New Chart
        </button>

        <button
          onClick={generatePDF}
          style={{
            padding: '8px 16px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          📄 Generate PDF
        </button>
      </div>

      {!analysisData && !chartData && (
        <div style={{
          padding: '20px',
          backgroundColor: '#ffe6e6',
          border: '1px solid #ff9999',
          borderRadius: '4px',
          textAlign: 'center'
        }}>
          <h3>No Analysis Data Available</h3>
          <p>Please complete the chart generation and analysis flow first.</p>
          <button
            onClick={() => navigate('/temp-home')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#FF6B35',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Start from Home
          </button>
        </div>
      )}

      {(analysisData || chartData) && (
        <div>
          {/* Chart Summary */}
          {chartData && (
            <div style={{
              background: '#f8f9fa',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '30px',
              border: '2px solid #e9ecef'
            }}>
              <h2>📊 Birth Chart Summary</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                <div>
                  <strong>Chart ID:</strong><br />
                  {chartData.data?.chartId}
                </div>
                <div>
                  <strong>Birth Date:</strong><br />
                  {chartData.data?.birthData?.dateOfBirth}
                </div>
                <div>
                  <strong>Birth Time:</strong><br />
                  {chartData.data?.birthData?.timeOfBirth}
                </div>
                <div>
                  <strong>Location:</strong><br />
                  {chartData.data?.birthData?.latitude}, {chartData.data?.birthData?.longitude}
                </div>
                <div>
                  <strong>Ascendant:</strong><br />
                  {chartData.data?.rasiChart?.ascendant?.sign} ({chartData.data?.rasiChart?.ascendant?.degree?.toFixed(2)}°)
                </div>
                <div>
                  <strong>Planets:</strong><br />
                  {chartData.data?.rasiChart?.planets?.length} calculated
                </div>
              </div>
            </div>
          )}

          {/* Analysis Data */}
          {analysisData && (
            <div style={{
              background: '#ffffff',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #dee2e6'
            }}>
              <h2>📈 Complete Analysis Report</h2>

              {analysisData.metadata && (
                <div style={{
                  background: '#d1ecf1',
                  padding: '15px',
                  borderRadius: '4px',
                  marginBottom: '20px'
                }}>
                  <h4>Report Metadata</h4>
                  <p><strong>Analysis ID:</strong> {analysisData.metadata.analysisId}</p>
                  <p><strong>Generated:</strong> {analysisData.metadata.timestamp}</p>
                  <p><strong>Completion:</strong> {analysisData.metadata.completionPercentage}%</p>
                  <p><strong>Status:</strong> {analysisData.metadata.status}</p>
                </div>
              )}

              {analysisData.analysis && (
                <div>
                  <h3>🔍 Detailed Analysis</h3>
                  {renderSection('Analysis Sections', analysisData.analysis)}
                </div>
              )}

              {/* Raw data for debugging */}
              <details style={{ marginTop: '30px' }}>
                <summary style={{
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  color: '#6c757d',
                  padding: '10px',
                  background: '#f8f9fa',
                  borderRadius: '4px'
                }}>
                  🛠️ Raw API Response Data (Debug)
                </summary>
                <pre style={{
                  background: '#f5f5f5',
                  padding: '15px',
                  fontSize: '11px',
                  maxHeight: '500px',
                  overflow: 'auto',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  marginTop: '10px'
                }}>
                  {JSON.stringify(analysisData, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: '40px', textAlign: 'center', color: '#6c757d' }}>
        <p>🧪 This is a temporary test page for validating the complete data flow</p>
        <p>📋 Flow: Home → BirthChart → Analysis → ComprehensiveReport ✅</p>
      </div>
    </div>
  );
};

export default TempComprehensiveAnalysisPage;
