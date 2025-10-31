import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

// Import Vedic design system
import '../styles/vedic-design-system.css';

// Import UI components
import { Button, Card, Alert, LoadingSpinner } from '../components/ui';
import BirthDataForm from '../components/forms/BirthDataForm';
import UIDataSaver from '../components/forms/UIDataSaver';
import UIToAPIDataInterpreter from '../components/forms/UIToAPIDataInterpreter';
import BPHSInfographicPROD from '../components/btr/BPHSInfographic';
import InteractiveLifeEventsQuestionnairePROD from '../components/btr/InteractiveLifeEventsQuestionnaire';

// Import contexts
import { useChart } from '../contexts/ChartContext';

// Import utilities
import { formatTimeToHHMMSS } from '../utils/dateUtils';

const BirthTimeRectificationPageEnhanced = () => {
  const navigate = useNavigate();
  const { currentChart } = useChart();
  
  // Production grade state management - no fallbacks
  const [pageStep, setPageStep] = useState('intro');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [birthData, setBirthData] = useState(null);
  const [rectificationData, setRectificationData] = useState(null);
  const [lifeEvents, setLifeEvents] = useState([]);
  const [quickValidationComplete, setQuickValidationComplete] = useState(false);

  // Data persistence instances - useMemo for performance
  const dataInterpreter = useMemo(() => new UIToAPIDataInterpreter(), []);
  const dataSaver = UIDataSaver;

  // Production grade API connection check
  useEffect(() => {
    const checkApiConnection = async () => {
      try {
        const response = await axios.get('/api/v1/health', { timeout: 5000 });
        // CRITICAL FIX: Health endpoint returns 'healthy', not 'OK'
        // Also handle both 'healthy' and 'OK' status values for compatibility
        const status = response.data?.status;
        if (!response.data || (status !== 'healthy' && status !== 'OK')) {
          console.warn('⚠️ Health check status mismatch:', status);
          // Don't set error - API might still be functional, just status format different
          return;
        }
        // Health check passed - clear any previous errors
        if (error) {
          setError(null);
        }
      } catch (error) {
        console.error('API connection check failed:', error);
        // CRITICAL FIX: Only set error if it's a network error, not a status mismatch
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout') || !error.response) {
          setError('Failed to connect to BTR service. Please check your internet connection and try again.');
        } else {
          // Response received but status check failed - API might still work
          console.warn('⚠️ Health check response received but status unexpected:', error.response?.data);
        }
      }
    };
    
    checkApiConnection();
  }, [error]);

  // Load and validate saved data from previous steps - production grade data flow
  useEffect(() => {
    const loadBirthData = async () => {
      try {
        let savedBirthData = null;
        let chartDataFromContext = null;
        
        // Priority 1: Extract from current chart context (automatic flow from Chart page)
        if (currentChart?.chartData?.data?.birthData) {
          const apiBirthData = currentChart.chartData.data.birthData;
          savedBirthData = {
            name: apiBirthData.name || 'Unknown',
            dateOfBirth: apiBirthData.dateOfBirth,
            timeOfBirth: apiBirthData.timeOfBirth,
            latitude: apiBirthData.latitude,
            longitude: apiBirthData.longitude,
            timezone: apiBirthData.timezone,
            placeOfBirth: apiBirthData.geocodingInfo?.formattedAddress || 'Unknown Location',
            chartId: apiBirthData.chartId || currentChart.chartData.data.chartId
          };
          chartDataFromContext = currentChart.chartData;
        }
        
        // Priority 2: Try to get data from Chart page navigation (session storage)
        if (!savedBirthData) {
          try {
            const btrData = sessionStorage.getItem('birthDataForBTR');
            if (btrData) {
              savedBirthData = JSON.parse(btrData);
              sessionStorage.removeItem('birthDataForBTR');
            }
          } catch (storageError) {
            console.warn('Session storage data not available:', storageError.message);
          }
        }
        
        // Priority 3: Fallback to regular session data
        if (!savedBirthData) {
          const savedSession = dataSaver.loadSession();
          if (savedSession?.birthData) {
            savedBirthData = savedSession.birthData;
          }
        }

        if (savedBirthData) {
          // Validate required fields
          if (!savedBirthData.dateOfBirth || !savedBirthData.timeOfBirth) {
            throw new Error('Date of birth and time of birth are required. Please generate a chart first.');
          }
          
          if (!savedBirthData.latitude && !savedBirthData.longitude) {
            throw new Error('Birth location coordinates are required. Please ensure location was properly geocoded.');
          }
          
          if (!savedBirthData.timezone) {
            throw new Error('Timezone information is required. Please ensure location data is complete.');
          }
          
          setBirthData(savedBirthData);
          setPageStep('intro');
          
          // Save chart data to UIDataSaver as backup
          if (chartDataFromContext) {
            dataSaver.saveSession({
              birthData: savedBirthData,
              chartData: chartDataFromContext
            });
          }
          
          console.log('✅ Birth data successfully loaded for BTR:', {
            name: savedBirthData.name,
            date: savedBirthData.dateOfBirth,
            time: savedBirthData.timeOfBirth,
            location: savedBirthData.placeOfBirth
          });
          
        } else {
          // No data available - redirect to generate chart first
          throw new Error('No birth data found. Please generate your birth chart first to proceed with Birth Time Rectification.');
        }
        
      } catch (error) {
        console.error('Failed to load saved session:', error);
        setError(error.message);
        // Auto-redirect to home page if no data available
        setTimeout(() => {
          console.log('Redirecting to generate chart first...');
          navigate('/');
        }, 3000);
      }
    };
    
    loadBirthData();
  }, [currentChart, dataSaver, navigate]);

  // Production grade BPHS-BTR Quick validation  
  const performQuickValidation = useCallback(async () => {
    if (!birthData || !birthData.timeOfBirth) {
      throw new Error('Please complete birth data first');
    }

    try {
      setLoading(true);
      setError(null);
      
      // Step 1: Pre-validate data using new BTR validation method
      const btrValidation = dataInterpreter.validateForBTR(birthData);
      
      if (!btrValidation.isValid) {
        console.error('🚨 BTR Pre-validation Failed:', btrValidation.errors);
        setError('Validation failed: ' + btrValidation.errors.join(', '));
        return;
      }
      
      // Step 2: Prepare complete BTR request with proper structure
      const btrRequestResult = dataInterpreter.prepareBTRRequest(birthData, birthData.timeOfBirth);
      
      if (!btrRequestResult.isValid) {
        console.error('🚨 BTR Request Preparation Failed:', btrRequestResult.errors);
        setError('Request preparation failed: ' + btrRequestResult.errors.join(', '));
        return;
      }
      
      const requestData = btrRequestResult.btrRequest;
      
      // Debug logging to help identify validation issues
      console.log('🐞 BTR Quick Validation API Request Data:', {
        birthData: requestData.birthData,
        proposedTime: requestData.proposedTime,
        birthDataFields: Object.keys(requestData.birthData),
        hasCoordinates: requestData.birthData.latitude && requestData.birthData.longitude,
        hasPlaceOfBirth: requestData.birthData.placeOfBirth,
        timezone: requestData.birthData.timezone,
        timeFormat: requestData.proposedTime,
        timePatternMatch: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/.test(requestData.proposedTime)
      });

      // Step 3: Make API call with validated request data
      const response = await axios.post('/api/v1/rectification/quick', requestData, { timeout: 30000 });
      
      if (!response.data?.success) {
        // Log detailed error information from backend validation
        console.error('🚨 BTR Quick Validation Error Details:', {
          error: response.data?.error,
          message: response.data?.message,
          details: response.data?.details,
          errors: response.data?.errors,
          fullResponse: response.data
        });
        
        // Show specific validation errors if available
        const validationDetails = response.data?.details || response.data?.errors;
        if (validationDetails && validationDetails.length > 0) {
          const errorDetails = validationDetails.map(err => 
            `${err.field}: ${err.message}`
          ).join(', ');
          return setError(`Validation failed: ${errorDetails}`);
        }
        
        return setError(response.data?.message || 'Validation failed');
      }
      
      if (!response.data?.validation) {
        return setError('Invalid validation response structure');
      }
      
      setRectificationData(response.data.validation);
      setQuickValidationComplete(true);
      
      // Determine next step based on confidence score
      const confidence = response.data.validation.confidence || 0;
      if (confidence >= 80) {
        setTimeout(() => setPageStep('results'), 1500);
      } else {
        setTimeout(() => setPageStep('events'), 1500);
      }
    } catch (error) {
      console.error('Quick validation failed:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Birth time validation failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [birthData, dataInterpreter]);

  // Production grade Full BTR analysis with life events
  const performFullAnalysisWithEvents = useCallback(async (eventsToUse) => {
    if (!birthData) {
      throw new Error('Birth data is required');
    }
    
    // Use passed events or fallback to state
    const events = eventsToUse || lifeEvents;
    
    if (!Array.isArray(events) || events.length === 0) {
      throw new Error('Please provide at least one life event for analysis');
    }

    try {
      setLoading(true);
      setError(null);
      setPageStep('analysis');
      
      // Step 1: Validate birth data using new BTR validation method
      const btrValidation = dataInterpreter.validateForBTR(birthData);
      
      if (!btrValidation.isValid) {
        console.error('🚨 BTR Pre-validation Failed for Full Analysis:', btrValidation.errors);
        setError('Validation failed: ' + btrValidation.errors.join(', '));
        return;
      }
      
      // Step 2: Format birth data using BTR formatter
      const formattedBirthData = dataInterpreter.formatForBTR(btrValidation.validatedData);
      const birthDataForAPI = formattedBirthData.birthData;
      
      // Step 3: Validate life events  
      const validEvents = events.filter(event => 
        event.date && event.description && event.date.trim() && event.description.trim()
      );
      
      if (validEvents.length === 0) {
        throw new Error('At least one valid life event with date and description is required');
      }
      
      // Step 4: Build request data
      const requestData = {
        birthData: birthDataForAPI,
        lifeEvents: validEvents.map(event => ({
          date: event.date,
          description: event.description
        })),
        options: {
          methods: ['praanapada', 'moon', 'gulika', 'events'],
          timeRange: { hours: 2 }
        }
      };

      // Debug logging for full analysis
      console.log('🐞 BTR Full Analysis API Request Data:', {
        birthData: requestData.birthData,
        birthDataFields: Object.keys(requestData.birthData),
        lifeEventsCount: validEvents.length,
        options: requestData.options
      });

      // Step 5: Make API call with validated request data
      const response = await axios.post('/api/v1/rectification/with-events', requestData, { timeout: 60000 });
      
      if (!response.data?.success) {
        // Log detailed error information from backend validation
        console.error('🚨 BTR Full Analysis Error Details:', {
          error: response.data?.error,
          message: response.data?.message,
          details: response.data?.details,
          errors: response.data?.errors,
          fullResponse: response.data
        });
        
        // Show specific validation errors if available
        const validationDetails = response.data?.details || response.data?.errors;
        if (validationDetails && validationDetails.length > 0) {
          const errorDetails = validationDetails.map(err => 
            `${err.field}: ${err.message}`
          ).join(', ');
          return setError(`Analysis failed: ${errorDetails}`);
        }
        
        return setError(response.data?.message || 'Full analysis failed');
      }
      
      if (!response.data?.rectification) {
        return setError('Invalid rectification response structure');
      }
      
      // Normalize data structure - store rectification object consistently with quick validation
      setRectificationData(response.data.rectification);
      setPageStep('results');
      
      dataSaver.saveSession({
        ...dataSaver.loadSession(),
        rectificationData: response.data
      });
    } catch (error) {
      console.error('Full analysis failed:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Birth time rectification failed';
      setError(errorMessage);
      setPageStep('events');
    } finally {
      setLoading(false);
    }
  }, [birthData, lifeEvents, dataInterpreter, dataSaver]);

  // Event management
  const removeLifeEvent = useCallback((eventId) => {
    setLifeEvents(prev => prev.filter(event => event.id !== eventId));
  }, []);

  const handleEventsComplete = useCallback(async (events) => {
    setLifeEvents(events);
    // Pass events directly instead of relying on state
    await performFullAnalysisWithEvents(events);
  }, [performFullAnalysisWithEvents]);

  // Navigation
  const goToNextStep = useCallback(() => {
    const stepFlow = {
      intro: 'verification',
      verification: 'events',
      events: 'analysis', 
      analysis: 'results',
      results: null
    };
    
    const nextStep = stepFlow[pageStep];
    if (nextStep) {
      setPageStep(nextStep);
    } else {
      throw new Error('No next step available from current page step');
    }
  }, [pageStep]);

  const goToPreviousStep = useCallback(() => {
    const reverseStepFlow = {
      verification: 'intro',
      events: 'verification',
      analysis: 'events',
      results: 'analysis'
    };
    
    const previousStep = reverseStepFlow[pageStep];
    if (previousStep) {
      setPageStep(previousStep);
    } else {
      throw new Error('No previous step available from current page step');
    }
  }, [pageStep]);

  const handleStartRectification = useCallback(() => {
    setPageStep('verification');
  }, []);

  // Step Content Components - Production Grade
  const StepContent = () => {
    try {
      switch (pageStep) {
        case 'intro':
          return (
            <BPHSInfographicPROD 
              onStartRectification={handleStartRectification}
            />
          );
          
        case 'verification':
          return (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="text-center space-y-6">
                <h2 className="text-3xl font-bold text-gray-900">Your Birth Details</h2>
                <p className="text-lg text-gray-600">
                  Confirm your birth information and perform quick BPHS validation
                </p>
              </div>

              {birthData ? (
                <Card className="bg-white border-2 border-gray-200 shadow-lg">
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Birth Information</h3>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <p><strong>Name:</strong> {birthData.name || 'Not provided'}</p>
                        <p><strong>Date of Birth:</strong> {
                          birthData.dateOfBirth 
                            ? (birthData.dateOfBirth instanceof Date 
                                ? birthData.dateOfBirth.toISOString().split('T')[0]
                                : typeof birthData.dateOfBirth === 'string' 
                                  ? birthData.dateOfBirth.split('T')[0]
                                  : birthData.dateOfBirth)
                            : 'Not provided'
                        }</p>
                        <p><strong>Time of Birth:</strong> {birthData.timeOfBirth || 'Not provided'}</p>
                      </div>
                      <div className="space-y-3">
                        <p><strong>Birth Place:</strong> {birthData.placeOfBirth || 'Not provided'}</p>
                        <p><strong>Coordinates:</strong> {birthData.latitude ? `${birthData.latitude}°, ${birthData.longitude}°` : 'Not provided'}</p>
                        <p><strong>Timezone:</strong> {birthData.timezone || 'Not provided'}</p>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-200">
                      <Button
                        variant="cosmic"
                        size="lg"
                        onClick={performQuickValidation}
                        disabled={loading || quickValidationComplete}
                        className="w-full"
                      >
                        {loading ? (
                          <span className="flex items-center gap-3">
                            <LoadingSpinner size="sm" />
                            <span>Performing BPHS-BTR Validation...</span>
                          </span>
                        ) : quickValidationComplete ? (
                          <span className="flex items-center gap-3">
                            <span>✅</span>
                            <span>Validation Complete</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-3">
                            <span>🔮</span>
                            <span>Validate Birth Time</span>
                          </span>
                        )}
                      </Button>
                    </div>

                    {rectificationData && (
                      <div className="mt-6 p-6 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="font-bold text-gray-900 mb-4">Quick Validation Results</h4>
                        <div className="space-y-3">
                          <p><strong>Confidence Score:</strong> {rectificationData.confidence}%</p>
                          <p><strong>Alignment Score:</strong> {rectificationData.alignmentScore}</p>
                          <p><strong>Praanapada Sign:</strong> {rectificationData.praanapada?.sign}</p>
                          <p><strong>Ascendant Sign:</strong> {rectificationData.ascendant?.sign}</p>
                        </div>
                        
                        {rectificationData.confidence >= 80 ? (
                          <Alert type="success" className="mt-4">
                            <p className="font-semibold">✅ High Confidence!</p>
                            <p>Your birth time appears to be accurate with {rectificationData.confidence}% confidence.</p>
                            <Button
                              variant="secondary"
                              onClick={() => setPageStep('results')}
                              className="mt-3"
                            >
                              View Results
                            </Button>
                          </Alert>
                        ) : (
                          <Alert type="warning" className="mt-4">
                            <p className="font-semibold">⚠️ Additional Verification Needed</p>
                            <p>Let's improve accuracy by adding some major life events (confidence: {rectificationData.confidence}%).</p>
                            <Button
                              variant="secondary"
                              onClick={() => setPageStep('events')}
                              className="mt-3"
                            >
                              Add Life Events
                            </Button>
                          </Alert>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              ) : (
                <Card className="bg-white border-2 border-gray-200 shadow-lg">
                  <BirthDataForm 
                    onSubmit={null}
                    onError={setError}
                    initialData={birthData || {}}
                  />
                </Card>
              )}
            </motion.div>
          );

        case 'events':
          return (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="text-center space-y-6">
                <h2 className="text-3xl font-bold text-gray-900">Major Life Events Questionnaire</h2>
                <p className="text-lg text-gray-600">
                  Answer simple questions about your life events to dramatically improve BTR accuracy
                </p>
              </div>

              <InteractiveLifeEventsQuestionnairePROD 
                onComplete={handleEventsComplete}
                onProgressUpdate={(progress) => {
                  // Progress update handler 
                  console.log('Progress updated:', progress);
                }}
              />

              {lifeEvents.length > 0 && (
                <Card className="bg-white border-2 border-gray-200 shadow-lg">
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-gray-900">Your Life Events ({lifeEvents.length})</h3>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {lifeEvents.map((event, index) => (
                        <div key={event.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center text-sm font-semibold text-blue-800 flex-shrink-0">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{event.description}</p>
                            <p className="text-sm text-gray-600">
                              {event.date} • {event.category} • {event.importance} importance
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLifeEvent(event.id)}
                            className="flex-shrink-0 text-red-500 hover:text-red-700"
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              )}
            </motion.div>
          );

        case 'analysis':
          return (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-8 py-12"
            >
              <div className="text-6xl animate-pulse">🔮</div>
              <h2 className="text-3xl font-bold text-gray-900">BPHS-BTR Analysis in Progress</h2>
              <p className="text-lg text-gray-600">
                Calculating your precise birth time using ancient Sanskrit mathematics...
              </p>
              
              <div className="space-y-4">
                <LoadingSpinner size="xl" />
                <div className="space-y-2 text-gray-600">
                  <p>Analyzing Praanapada alignments...</p>
                  <p>Calculating Moon position correlations...</p>
                  <p>Evaluating Gulika mathematical precision...</p>
                  <p>Correlating with your life events...</p>
                </div>
              </div>
            </motion.div>
          );

        case 'results':
          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="text-center space-y-6">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6 }}
                  className="text-center"
                >
                  <div className="text-6xl mb-4 animate-pulse">✨</div>
                  <h2 className="text-3xl font-bold text-gray-900">Your Cosmic Birth Moment Revealed</h2>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                    Your precise birth time has been calculated using ancient BPHS mathematics combined with your life events
                  </p>
                </motion.div>
              </div>

              {rectificationData && (
                <div className="space-y-6">
                  {/* Birth Time Comparison Display */}
                  <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 shadow-lg">
                    <div className="text-center space-y-4">
                      <h3 className="text-2xl font-bold text-gray-900">Birth Time Rectification</h3>
                      
                      <div className="grid md:grid-cols-2 gap-6 mt-6">
                        <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
                          <p className="text-sm text-gray-600 mb-2">Original Birth Time</p>
                          <p className="text-2xl font-bold text-gray-800">
                            {birthData?.timeOfBirth ? formatTimeToHHMMSS(birthData.timeOfBirth) : 'Not provided'}
                          </p>
                        </div>
                        
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-400">
                          <p className="text-sm text-green-700 mb-2 font-semibold">Rectified Birth Time</p>
                          <p className="text-2xl font-bold text-green-700">
                            {(rectificationData?.rectifiedTime || rectificationData?.analysis?.bestCandidate?.time) 
                              ? formatTimeToHHMMSS(rectificationData?.rectifiedTime || rectificationData?.analysis?.bestCandidate?.time)
                              : 'Not calculated'}
                          </p>
                        </div>
                      </div>
                      
                      {rectificationData?.rectifiedTime && birthData?.timeOfBirth && 
                       rectificationData.rectifiedTime !== birthData.timeOfBirth && (
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            <strong>Note:</strong> Your birth time has been adjusted based on BPHS mathematical analysis.
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* Results Display */}
                  <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 shadow-lg">
                    <div className="text-center space-y-6">
                      <h3 className="text-2xl font-bold text-gray-900">Rectification Confidence</h3>
                      
                      <div className="w-full bg-gray-200 rounded-full h-4 mt-4">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-emerald-600 h-4 rounded-full transition-all duration-2000"
                          style={{ width: `${rectificationData?.confidence || 0}%` }}
                        />
                      </div>
                      
                      <div className="text-3xl font-bold text-green-600">
                        {rectificationData?.confidence || 0}% Confidence
                      </div>
                    </div>
                  </Card>

                  {/* Action Cards */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-300 rounded-xl p-6 text-center">
                        <div className="text-4xl mb-4">📊</div>
                        <h4 className="font-semibold text-gray-900 mb-2">Complete Astrology Analysis</h4>
                        <p className="text-sm text-gray-600 mb-4">
                          Use your rectified birth time for the most comprehensive Vedic astrology reading
                        </p>
                        <Button
                          variant="cosmic"
                          onClick={() => navigate('/comprehensive-analysis')}
                          className="w-full"
                        >
                          Generate Full Analysis
                        </Button>
                      </div>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 rounded-xl p-6 text-center">
                        <div className="text-4xl mb-4">🔄</div>
                        <h4 className="font-semibold text-gray-900 mb-2">Refine Further</h4>
                        <p className="text-sm text-gray-600 mb-4">
                          Add more life events or try different calculation methods
                        </p>
                        <Button
                          variant="secondary"
                          onClick={() => {
                            setPageStep('events');
                            setLifeEvents([]);
                            setQuickValidationComplete(false);
                          }}
                          className="w-full"
                        >
                          Add More Events
                        </Button>
                      </div>
                    </motion.div>
                  </div>
                </div>
              )}
            </motion.div>
          );

        default:
          throw new Error(`Unknown page step: ${pageStep}`);
      }
    } catch (error) {
      console.error('Step content error:', error);
      return (
        <Alert type="error" className="m-4">
          <p className="font-semibold">Content Display Error</p>
          <p>Unable to display step content. Please try refreshing the page.</p>
          <Button 
            variant="secondary" 
            onClick={() => window.location.reload()}
            className="mt-2"
          >
            Refresh Page
          </Button>
        </Alert>
      );
    }
  };

  // Production grade error boundary wrapper
  if (error) {
    return (
      <Alert type="error" className="m-6">
        <h3 className="font-semibold text-lg mb-2">Birth Time Rectification Error</h3>
        <p>{error}</p>
        <div className="mt-4 space-y-2">
          <Button 
            variant="secondary" 
            onClick={() => setError(null)}
            className="mr-2"
          >
            Try Again
          </Button>
          <Button 
            variant="cosmic"
            onClick={() => navigate('/')}
          >
            Generate New Chart
          </Button>
        </div>
      </Alert>
    );
  }

  // Main Render - Production Grade
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-100/20 to-purple-100/20"></div>
      
      <div className="relative z-10 py-12">
        <div className="max-w-7xl mx-auto px-6">

          {/* Global Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Alert type="error" className="relative">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">Operation Failed</p>
                    <p>{error}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setError(null)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    ×
                  </Button>
                </div>
              </Alert>
            </motion.div>
          )}

          {/* Step Navigation */}
          {pageStep !== 'intro' && (
            <div className="flex items-center justify-between mb-8">
              <Button
                variant="ghost"
                onClick={goToPreviousStep}
                disabled={pageStep === 'intro' || loading}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Previous Step
              </Button>

              <div className="flex items-center space-x-4">
                {['intro', 'verification', 'events', 'analysis', 'results'].map((step, index) => (
                  <div
                    key={step}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      pageStep === step ? 'bg-indigo-600 scale-125' : 
                      ['intro', 'verification', 'events', 'analysis', 'results'].indexOf(step) < 
                      ['intro', 'verification', 'events', 'analysis', 'results'].indexOf(pageStep) 
                      ? 'bg-gray-400' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>

              <Button
                variant="ghost"
                onClick={goToNextStep}
                disabled={!goToNextStep || loading}
                className="text-gray-600 hover:text-gray-900"
              >
                Next Step →
              </Button>
            </div>
          )}

          {/* Main Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={pageStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <StepContent />
            </motion.div>
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
};

export default BirthTimeRectificationPageEnhanced;
