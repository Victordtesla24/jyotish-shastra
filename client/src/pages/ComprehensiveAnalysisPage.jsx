import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ComprehensiveAnalysisDisplay from '../components/reports/ComprehensiveAnalysisDisplay.js';
import ResponseDataToUIDisplayAnalyser from '../components/analysis/ResponseDataToUIDisplayAnalyser.js';
import UIDataSaver from '../components/forms/UIDataSaver.js';
import HeroSection from '../components/ui/HeroSection.jsx';
import { initScrollReveals, cleanupScrollTriggers } from '../lib/scroll.js';
import { getApiUrl } from '../utils/apiConfig.js';

/**
 * ComprehensiveAnalysisPage
 * Displays comprehensive Vedic astrology analysis with 8 sections
 * Implementation Plan: @implementation-plan-UI.md
 */
const ComprehensiveAnalysisPage = () => {
  const [analysisData, setAnalysisData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchComprehensiveAnalysis = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const cachedData = UIDataSaver.getComprehensiveAnalysis();
      if (cachedData && (cachedData.sections || cachedData.analysis?.sections)) {
        const processedData = ResponseDataToUIDisplayAnalyser.processComprehensiveAnalysis(cachedData);
        setAnalysisData(processedData);
        setIsLoading(false);
        return;
      }

      const birthData = UIDataSaver.getBirthData();
      if (!birthData) {
        const errorMessage = 'No birth data found. Please generate your birth chart first.';
        setError(errorMessage);
        setIsLoading(false);
        sessionStorage.setItem('analysisRedirectMessage', errorMessage);
        setTimeout(() => {
          navigate('/chart');
        }, 2000);
        return;
      }

      const response = await fetch(getApiUrl('/api/v1/analysis/comprehensive'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(birthData),
      });

      if (!response.ok) {
        throw new Error(
          response.status === 400
            ? 'Invalid birth data. Please verify your birth information and try again.'
            : response.status === 500
            ? 'Comprehensive analysis failed. Please verify your birth data and try again.'
            : `HTTP error! status: ${response.status}`
        );
      }

      const apiData = await response.json();

      if (!apiData.analysis || !apiData.analysis.sections || Object.keys(apiData.analysis.sections).length === 0) {
        throw new Error('Sections data is missing from API response. Expected analysis.sections with 8 sections (section1-section8).');
      }

      const processedData = ResponseDataToUIDisplayAnalyser.processComprehensiveAnalysis(apiData);

      if (!processedData || !processedData.sectionsData || Object.keys(processedData.sectionsData).length === 0) {
        throw new Error(
          'Failed to load comprehensive analysis. Please verify your birth data and try again.'
        );
      }

      UIDataSaver.saveComprehensiveAnalysis(apiData);
      setAnalysisData(processedData);
    } catch (err) {
      const errorMessage = err.message || 'Failed to load comprehensive analysis. Please verify your birth data and try again.';
      setError(errorMessage);
      console.error('Comprehensive analysis error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    initScrollReveals();
    
    return () => {
      cleanupScrollTriggers();
    };
  }, []);

  useEffect(() => {
    fetchComprehensiveAnalysis();
  }, [fetchComprehensiveAnalysis]);

  if (isLoading) {
    return (
      <HeroSection title="Loading Analysis" subtitle="Please wait...">
        <div className="chris-cole-page-content">
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '30px' }}>
              Processing your comprehensive Vedic astrology analysis...
            </p>
            <button
              onClick={() => fetchComprehensiveAnalysis()}
              style={{
                padding: '12px 24px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: '#FFFFFF',
                cursor: 'pointer',
                borderRadius: '4px'
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </HeroSection>
    );
  }

  if (error) {
    return (
      <HeroSection title="Analysis Error" subtitle="Unable to load analysis">
        <div className="chris-cole-page-content">
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '30px' }}>
              {error}
            </p>
            <button
              onClick={() => navigate('/chart')}
              style={{
                padding: '12px 24px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: '#FFFFFF',
                cursor: 'pointer',
                borderRadius: '4px'
              }}
            >
              Go to Chart
            </button>
          </div>
        </div>
      </HeroSection>
    );
  }

  return (
    <HeroSection title="Comprehensive Vedic Analysis" subtitle="Complete 8-section astrology analysis with detailed insights">
      <div className="chris-cole-page-content">
        {analysisData && <ComprehensiveAnalysisDisplay analysisData={analysisData} />}
      </div>
    </HeroSection>
  );
};

export default ComprehensiveAnalysisPage;

