import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ComprehensiveAnalysisDisplay from '../components/reports/ComprehensiveAnalysisDisplay';
import ResponseDataToUIDisplayAnalyser from '../components/analysis/ResponseDataToUIDisplayAnalyser';
import UIDataSaver from '../components/forms/UIDataSaver';

/**
 * Comprehensive Analysis Page with ErrorBoundary protection
 * Displays 8-section comprehensive Vedic astrology analysis
 * Uses componentDidCatch for error handling
 */
const ComprehensiveAnalysisPage = () => {
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchComprehensiveAnalysis = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 [ComprehensiveAnalysisPage] Starting comprehensive analysis fetch...');

      // First try to get cached data from UIDataSaver
      const cachedData = UIDataSaver.getComprehensiveAnalysis();
      if (cachedData && (cachedData.sections || cachedData.analysis?.sections)) {
        console.log('✅ [ComprehensiveAnalysisPage] Using cached comprehensive analysis from UIDataSaver');
        console.log('📊 [ComprehensiveAnalysisPage] Cached data structure:', Object.keys(cachedData));
        console.log('📊 [ComprehensiveAnalysisPage] Data has sections:', !!cachedData.sections);
        console.log('📊 [ComprehensiveAnalysisPage] Data has analysis.sections:', !!cachedData.analysis?.sections);
        const processedData = ResponseDataToUIDisplayAnalyser.processComprehensiveAnalysis(cachedData);
        console.log('✅ [ComprehensiveAnalysisPage] Processed cached data:', processedData);
        setAnalysisData(processedData);
        setLoading(false);
        return;
      }

      // Get birth data for API call
      const birthData = UIDataSaver.getBirthData();
      if (!birthData) {
        console.error('❌ [ComprehensiveAnalysisPage] No birth data found, redirecting to home');
          navigate('/');
          return;
        }

      console.log('🔄 [ComprehensiveAnalysisPage] Found birth data, fetching from API...', {
        name: birthData.name,
        dateOfBirth: birthData.dateOfBirth
      });

      // Call comprehensive analysis API (FIXED: Added /v1 version prefix)
      const response = await fetch('/api/v1/analysis/comprehensive', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        body: JSON.stringify(birthData)
        });

        if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

      const apiData = await response.json();
      console.log('✅ [ComprehensiveAnalysisPage] Comprehensive analysis API response received');
      console.log('📊 [ComprehensiveAnalysisPage] API data structure:', {
        success: apiData.success,
        hasAnalysis: !!apiData.analysis,
        hasSections: !!apiData.analysis?.sections,
        sectionCount: apiData.analysis?.sections ? Object.keys(apiData.analysis.sections).length : 0
      });

      // Process data with ResponseDataToUIDisplayAnalyser
      const processedData = ResponseDataToUIDisplayAnalyser.processComprehensiveAnalysis(apiData);
      console.log('✅ [ComprehensiveAnalysisPage] Data processed:', {
        processedSuccess: !!processedData,
        hasSections: !!processedData?.sections,
        sectionCount: processedData?.sections ? Object.keys(processedData.sections).length : 0
      });

      if (!processedData) {
        throw new Error('Failed to process API response');
      }

      // Save to UIDataSaver for future use
      UIDataSaver.saveComprehensiveAnalysis(apiData);
      console.log('💾 [ComprehensiveAnalysisPage] Comprehensive analysis saved to UIDataSaver');

      setAnalysisData(processedData);
      console.log('✅ [ComprehensiveAnalysisPage] Analysis data set to state:', !!processedData);

    } catch (err) {
      console.error('❌ [ComprehensiveAnalysisPage] Error fetching comprehensive analysis:', err);
      setError(err.message);
    } finally {
        setLoading(false);
      }
  }, [navigate]);

  useEffect(() => {
    fetchComprehensiveAnalysis();
  }, [fetchComprehensiveAnalysis]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading comprehensive analysis...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Analysis Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => fetchComprehensiveAnalysis()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mr-2"
          >
            Try Again
          </button>
          <button
            onClick={() => navigate('/')}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Back to Home
          </button>
          </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-6">
        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-6 border-b">
            <h1 className="text-3xl font-bold text-gray-900">
              Comprehensive Vedic Analysis
            </h1>
            <p className="text-gray-600 mt-2">
              Complete 8-section astrology analysis with detailed insights
            </p>
        </div>

          <ComprehensiveAnalysisDisplay analysisData={analysisData} />
        </div>
      </div>
    </div>
  );
};

export default ComprehensiveAnalysisPage;
