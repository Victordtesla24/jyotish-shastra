/**
 * BirthTimeRectification Component
 * React component for BPHS-based birth time rectification interface
 */

import React, { useState } from 'react';
import axios from 'axios';

const BirthTimeRectification = ({ 
  initialBirthData = {}, 
  onRectificationComplete, 
  showOptional = false 
}) => {
  const [activeTab, setActiveTab] = useState('quick');
  const [formData, setFormData] = useState({
    dateOfBirth: initialBirthData.dateOfBirth || '',
    placeOfBirth: initialBirthData.placeOfBirth || '',
    timeOfBirth: initialBirthData.timeOfBirth || '',
    uncertainTime: true,
    latitude: initialBirthData.latitude || '',
    longitude: initialBirthData.longitude || '',
    timezone: initialBirthData.timezone || ''
  });
  const [analysisResults, setAnalysisResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasAttempted, setHasAttempted] = useState(false);
  const [lifeEvents, setLifeEvents] = useState([{ date: '', description: '' }]);
  const [methods, setMethods] = useState({
    praanapada: true,
    moon: true,
    gulika: true,
    events: false
  });

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle life event inputs
  const handleLifeEventChange = (index, field, value) => {
    const updatedEvents = [...lifeEvents];
    updatedEvents[index][field] = value;
    setLifeEvents(updatedEvents);
  };

  const addLifeEvent = () => {
    setLifeEvents([...lifeEvents, { date: '', description: '' }]);
  };

  const removeLifeEvent = (index) => {
    setLifeEvents(lifeEvents.filter((_, i) => i !== index));
  };

  // Quick validation of a single time
  const handleQuickValidation = async () => {
    if (!formData.dateOfBirth || !formData.placeOfBirth || !formData.timeOfBirth) {
      setError('Please provide date, place, and time of birth');
      setHasAttempted(true);
      return;
    }

    setLoading(true);
    setError('');
    setHasAttempted(true);

    try {
      const response = await axios.post(`${API_URL}/v1/rectification/quick`, {
        birthData: formData,
        proposedTime: formData.timeOfBirth
      }, {
        timeout: 30000
      });

      if (response.data?.success) {
        setAnalysisResults(response.data.validation || response.data);
        if (onRectificationComplete) {
          onRectificationComplete(response.data.validation || response.data, response.data);
        }
      } else {
        setError(response.data?.message || response.data?.error?.message || 'Validation failed');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || 
                          err.response?.data?.message || 
                          err.message || 
                          'Validation failed. Please check your birth data and try again.';
      setError(errorMessage);
      console.error('BTR Quick Validation Error:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Full rectification analysis
  const handleFullAnalysis = async () => {
    if (!formData.dateOfBirth || !formData.placeOfBirth) {
      setError('Please provide date and place of birth');
      setHasAttempted(true);
      return;
    }

    setLoading(true);
    setError('');
    setHasAttempted(true);

    try {
      const requestOptions = {
        methods: Object.keys(methods).filter(key => methods[key]),
      };

      // Add life events if available and events method is selected
      const validEvents = lifeEvents.filter(event => event.date && event.description);
      if (methods.events && validEvents.length > 0) {
        requestOptions.lifeEvents = validEvents;
      }

      const endpoint = methods.events && validEvents.length > 0 
        ? `${API_URL}/v1/rectification/with-events`
        : `${API_URL}/v1/rectification/analyze`;

      const response = await axios.post(endpoint, {
        birthData: formData,
        ...requestOptions
      }, {
        timeout: 60000
      });

      if (response.data?.success) {
        const rectification = response.data.rectification || response.data;
        setAnalysisResults(rectification);
        if (onRectificationComplete) {
          onRectificationComplete(rectification, response.data);
        }
      } else {
        setError(response.data?.message || response.data?.error?.message || 'Analysis failed');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || 
                          err.response?.data?.message || 
                          err.message || 
                          'Rectification analysis failed. Please check your birth data and try again.';
      setError(errorMessage);
      console.error('BTR Full Analysis Error:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Render confidence indicator
  const renderConfidenceIndicator = (confidence) => {
    if (confidence >= 80) {
      return <span className="confidence high">{confidence}% Confidence</span>;
    } else if (confidence >= 60) {
      return <span className="confidence medium">{confidence}% Confidence</span>;
    } else {
      return <span className="confidence low">{confidence}% Confidence</span>;
    }
  };

  return (
    <div className="birth-time-rectification">
      <div className="btr-header">
        <h3>Birth Time Rectification (BPHS)</h3>
        <p className="btr-description">
          Mathematical birth time correction using Brihat Parashara Hora Shastra methods
        </p>
      </div>

      <div className="btr-tabs">
        <button
          className={`tab-btn ${activeTab === 'quick' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('quick');
            setError('');
            setHasAttempted(false);
          }}
        >
          Quick Validation
        </button>
        {showOptional && (
          <button
            className={`tab-btn ${activeTab === 'full' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('full');
              setError('');
              setHasAttempted(false);
            }}
          >
            Full Analysis
          </button>
        )}
      </div>

      <div className="btr-content">
        {/* Birth Data Form */}
        <div className="btr-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="dateOfBirth">Date of Birth:</label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="timeOfBirth">Time of Birth:</label>
              <input
                type="time"
                id="timeOfBirth"
                name="timeOfBirth"
                value={formData.timeOfBirth}
                onChange={handleInputChange}
                required
              />
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="uncertainTime"
                    checked={formData.uncertainTime}
                    onChange={handleInputChange}
                  />
                  Uncertain birth time
                </label>
              </div>
            </div>

            <div className="form-group full-width">
              <label htmlFor="placeOfBirth">Place of Birth:</label>
              <input
                type="text"
                id="placeOfBirth"
                name="placeOfBirth"
                value={formData.placeOfBirth}
                onChange={handleInputChange}
                placeholder="City, State, Country"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="latitude">Latitude:</label>
              <input
                type="number"
                id="latitude"
                name="latitude"
                value={formData.latitude}
                onChange={handleInputChange}
                step="0.0001"
                placeholder="19.0760"
              />
            </div>

            <div className="form-group">
              <label htmlFor="longitude">Longitude:</label>
              <input
                type="number"
                id="longitude"
                name="longitude"
                value={formData.longitude}
                onChange={handleInputChange}
                step="0.0001"
                placeholder="72.8777"
              />
            </div>
          </div>

          {/* Full Analysis Options */}
          {activeTab === 'full' && (
            <>
              <div className="method-selection">
                <h4>Select Rectification Methods:</h4>
                <div className="checkbox-grid">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={methods.praanapada}
                      onChange={(e) => setMethods(prev => ({ ...prev, praanapada: e.target.checked }))}
                    />
                    Praanapada Method (Highest accuracy)
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={methods.moon}
                      onChange={(e) => setMethods(prev => ({ ...prev, moon: e.target.checked }))}
                    />
                    Moon Position Method
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={methods.gulika}
                      onChange={(e) => setMethods(prev => ({ ...prev, gulika: e.target.checked }))}
                    />
                    Gulika Position Method
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={methods.events}
                      onChange={(e) => setMethods(prev => ({ ...prev, events: e.target.checked }))}
                    />
                    Event Correlation (requires life events)
                  </label>
                </div>
              </div>

              {/* Life Events */}
              {methods.events && (
                <div className="life-events">
                  <h4>Major Life Events (for correlation):</h4>
                  {lifeEvents.map((event, index) => (
                    <div key={index} className="event-row">
                      <div className="form-group">
                        <label>Event Date:</label>
                        <input
                          type="date"
                          value={event.date}
                          onChange={(e) => handleLifeEventChange(index, 'date', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Event Description:</label>
                        <input
                          type="text"
                          value={event.description}
                          onChange={(e) => handleLifeEventChange(index, 'description', e.target.value)}
                          placeholder="e.g., Marriage, Job change, Graduation"
                        />
                      </div>
                      <button
                        type="button"
                        className="btn-remove"
                        onClick={() => removeLifeEvent(index)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button type="button" className="btn-add" onClick={addLifeEvent}>
                    Add Another Event
                  </button>
                </div>
              )}
            </>
          )}

          <div className="form-actions">
            <button
              className="btn-primary"
              onClick={activeTab === 'quick' ? handleQuickValidation : handleFullAnalysis}
              disabled={loading}
            >
              {loading ? 'Analyzing...' : activeTab === 'quick' ? 'Validate Time' : 'Rectify Time'}
            </button>
            <button
              className="btn-secondary"
              onClick={() => onRectificationComplete(null)}
            >
              Use Original Time
            </button>
          </div>
        </div>

        {/* Error Display - Only show after user attempts */}
        {error && hasAttempted && (
          <div className="error-message" role="alert">
            <strong>Rectification analysis failed</strong>
            <p>{error}</p>
          </div>
        )}

        {/* Results Display */}
        {analysisResults && (
          <div className="btr-results">
            <div className="results-header">
              <h4>Analysis Results</h4>
              {analysisResults.confidence && renderConfidenceIndicator(analysisResults.confidence)}
            </div>

            {analysisResults.rectifiedTime && (
              <div className="rectified-time">
                <strong>Recommended Time:</strong> {analysisResults.rectifiedTime}
              </div>
            )}

            {/* Recommendations */}
            {analysisResults.recommendations && analysisResults.recommendations.length > 0 && (
              <div className="recommendations">
                <h5>Recommendations:</h5>
                <ul>
                  {analysisResults.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Method Breakdown */}
            {analysisResults.analysis?.methodBreakdown && (
              <div className="method-breakdown">
                <h5>Methods Used:</h5>
                <ul>
                  {Object.entries(analysisResults.analysis.methodBreakdown).map(([method, status]) => (
                    <li key={method}>{method}: {status}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Analysis Log */}
            {analysisResults.analysisLog && analysisResults.analysisLog.length > 0 && (
              <div className="analysis-log">
                <h5>Analysis Details:</h5>
                {analysisResults.chart && (
                  <div className="chart-info">
                    <p><strong>Ascendant:</strong> {analysisResults.chart.ascendant?.sign || 'Unknown'}</p>
                    <p><strong>Moon Sign:</strong> {analysisResults.chart.moon?.sign || 'Unknown'}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .birth-time-rectification {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }

        .btr-header h3 {
          margin: 0 0 10px 0;
          color: #2c3e50;
        }

        .btr-description {
          margin: 0 0 20px 0;
          color: #7f8c8d;
          font-size: 0.9em;
        }

        .btr-tabs {
          display: flex;
          margin-bottom: 20px;
          border-bottom: 1px solid #ecf0f1;
        }

        .tab-btn {
          padding: 10px 20px;
          border: none;
          background: none;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all 0.3s ease;
        }

        .tab-btn.active {
          border-bottom-color: #3498db;
          color: #3498db;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .form-group label {
          margin-bottom: 5px;
          font-weight: 500;
        }

        .form-group input {
          padding: 8px 12px;
          border: 1px solid #bdc3c7;
          border-radius: 4px;
          font-size: 14px;
        }

        .checkbox-group {
          margin-top: 5px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 5px;
          cursor: pointer;
          font-size: 0.9em;
        }

        .checkbox-label input {
          margin: 0;
        }

        .method-selection {
          margin-bottom: 20px;
        }

        .checkbox-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .life-events {
          margin-bottom: 20px;
        }

        .event-row {
          display: flex;
          gap: 15px;
          align-items: flex-end;
          margin-bottom: 10px;
        }

        .event-row .form-group {
          flex: 1;
        }

        .btn-remove {
          padding: 8px 16px;
          background: #e74c3c;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .btn-add {
          margin-top: 10px;
          padding: 8px 16px;
          background: #95a5a6;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .form-actions {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }

        .btn-primary {
          padding: 12px 24px;
          background: #3498db;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
        }

        .btn-primary:disabled {
          background: #95a5a6;
          cursor: not-allowed;
        }

        .btn-secondary {
          padding: 12px 24px;
          background: #ecf0f1;
          color: #2c3e50;
          border: 1px solid #bdc3c7;
          border-radius: 4px;
          cursor: pointer;
        }

        .error-message {
          background: #fdf2f2;
          color: #e74c3c;
          padding: 12px;
          border-radius: 4px;
          margin-bottom: 20px;
          border: 1px solid #f5c6cb;
        }

        .btr-results {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #e9ecef;
        }

        .results-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .confidence {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.8em;
          font-weight: 600;
        }

        .confidence.high {
          background: #d4edda;
          color: #155724;
        }

        .confidence.medium {
          background: #fff3cd;
          color: #856404;
        }

        .confidence.low {
          background: #f8d7da;
          color: #721c24;
        }

        .rectified-time {
          margin-bottom: 15px;
          font-weight: 500;
        }

        .recommendations ul {
          margin: 10px 0;
          padding-left: 20px;
        }

        .method-breakdown {
          margin-top: 15px;
        }

        .chart-info p {
          margin: 5px 0;
        }

        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr;
          }

          .checkbox-grid {
            grid-template-columns: 1fr;
          }

          .event-row {
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
          }

          .form-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default BirthTimeRectification;
