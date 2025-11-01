import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ComprehensiveAnalysisDisplay from '../components/reports/ComprehensiveAnalysisDisplay';
import ResponseDataToUIDisplayAnalyser from '../components/analysis/ResponseDataToUIDisplayAnalyser';
import UIDataSaver from '../components/forms/UIDataSaver';
import UIToAPIDataInterpreter from '../components/forms/UIToAPIDataInterpreter';

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
  
  // Data interpreter instance for formatting birth data
  const dataInterpreter = useMemo(() => new UIToAPIDataInterpreter(), []);

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
      const rawBirthData = UIDataSaver.getBirthData();
      if (!rawBirthData) {
        console.error('❌ [ComprehensiveAnalysisPage] No birth data found, redirecting to home');
          navigate('/');
          return;
        }

      console.log('🔄 [ComprehensiveAnalysisPage] Found birth data, formatting for API...', {
        name: rawBirthData.name,
        dateOfBirth: rawBirthData.dateOfBirth,
        timeOfBirth: rawBirthData.timeOfBirth
      });

      // CRITICAL FIX: Format birth data to meet API validation requirements
      // Validate and format birth data before sending to API
      const validationResult = dataInterpreter.validateInput(rawBirthData);
      if (!validationResult?.isValid) {
        console.error('❌ [ComprehensiveAnalysisPage] Birth data validation failed:', validationResult?.errors);
        throw new Error(`Invalid birth data: ${validationResult?.errors?.join(', ') || 'Validation failed'}`);
      }

      // Format birth data for API using formatForAPI
      const formattedData = dataInterpreter.formatForAPI(validationResult.validatedData);
      const apiRequestData = formattedData.apiRequest || formattedData;

      console.log('✅ [ComprehensiveAnalysisPage] Birth data formatted for API:', {
        hasDate: !!apiRequestData.dateOfBirth,
        hasTime: !!apiRequestData.timeOfBirth,
        hasCoordinates: !!(apiRequestData.latitude && apiRequestData.longitude),
        hasPlaceOfBirth: !!apiRequestData.placeOfBirth
      });

      // Call comprehensive analysis API with properly formatted data
      const { getApiUrl } = await import('../utils/apiConfig');
      const response = await fetch(getApiUrl('/api/v1/analysis/comprehensive'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        body: JSON.stringify(apiRequestData)
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
        sectionCount: apiData.analysis?.sections ? Object.keys(apiData.analysis.sections).length : 0,
        status: apiData.metadata?.status,
        error: apiData.error
      });

      // CRITICAL FIX: Check if API returned an error
      if (!apiData.success || apiData.metadata?.status === 'failed') {
        const errorMessage = apiData.error?.message || apiData.error?.details || apiData.message || 
                            'Comprehensive analysis failed. Please verify your birth data and try again.';
        throw new Error(errorMessage);
      }

      // CRITICAL FIX: Validate sections exist in API response
      if (!apiData.analysis || !apiData.analysis.sections || Object.keys(apiData.analysis.sections).length === 0) {
        throw new Error('Sections data is missing from API response. Expected analysis.sections with 8 sections (section1-section8).');
      }

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
      // CRITICAL FIX: Ensure error message is always user-friendly
      const errorMessage = err.message || err.toString() || 
                          'Failed to load comprehensive analysis. Please verify your birth data and try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [navigate, dataInterpreter]);

  useEffect(() => {
    fetchComprehensiveAnalysis();
  }, [fetchComprehensiveAnalysis]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sacred-white via-white to-sacred-cream bg-cosmic-pattern flex items-center justify-center p-4">
        <div className="text-center">
          <div className="spinner-mandala mb-6"></div>
          <h2 className="text-2xl font-bold text-primary mb-3 animate-pulse">
            Unveiling Cosmic Insights
          </h2>
          <p className="text-secondary text-lg">Loading comprehensive analysis...</p>
          <div className="mt-6 flex items-center justify-center gap-2">
            <span className="vedic-symbol text-saffron animate-float">🕉️</span>
            <span className="text-muted">Calculating celestial positions</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sacred-white via-white to-sacred-cream bg-cosmic-pattern flex items-center justify-center p-4">
        <div className="card-cosmic-enhanced max-w-md w-full text-center p-8">
          <div className="text-6xl mb-6 animate-bounce">⚠️</div>
          <h2 className="text-2xl font-bold text-primary mb-4">Cosmic Disturbance</h2>
          <p className="text-secondary mb-6 leading-relaxed">{error}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => fetchComprehensiveAnalysis()}
              className="btn-vedic btn-primary"
            >
              <span className="flex items-center justify-center gap-2">
                <span>🔄</span>
                <span>Try Again</span>
              </span>
            </button>
            <button
              onClick={() => navigate('/')}
              className="btn-vedic btn-secondary"
            >
              <span className="flex items-center justify-center gap-2">
                <span>🏠</span>
                <span>Back to Home</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sacred-white via-white to-sacred-cream bg-cosmic-pattern">
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FF9933' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="relative z-10">
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-7xl mx-auto">
            {/* Enhanced Header Section */}
            <div className="text-center mb-12 float-cosmic">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-vedic-saffron to-vedic-gold rounded-full mb-6 shadow-lg animate-pulse">
                <span className="text-3xl vedic-symbol symbol-mandala text-cosmic-glow"></span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-vedic-saffron via-vedic-gold to-vedic-maroon bg-clip-text text-transparent mb-4 text-cosmic-glow">
                Comprehensive Vedic Analysis
              </h1>
              <p className="text-lg text-secondary max-w-2xl mx-auto leading-relaxed">
                Complete 8-section astrology analysis with detailed insights
              </p>
            </div>

            {/* Enhanced Content Container */}
            <div className="card-cosmic-enhanced">
              <ComprehensiveAnalysisDisplay analysisData={analysisData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComprehensiveAnalysisPage;
