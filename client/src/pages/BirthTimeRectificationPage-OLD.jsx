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
import BPHSInfographicPROD from '../components/btr/BPHSInfographic-PROD';
import InteractiveLifeEventsQuestionnairePROD from '../components/btr/InteractiveLifeEventsQuestionnaire-PROD';

// Import contexts
import { useChart } from '../contexts/ChartContext';

const BirthTimeRectificationPageCLEAN = () => {
  const navigate = useNavigate();
  const { setChartData } = useChart(); // Removed unused chartData
  
  // Production grade state management - no fallbacks
  const [pageStep, setPageStep] = useState('intro'); // intro, verification, events, analysis, results
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [birthData, setBirthData] = useState(null);
  const [rectificationData, setRectificationData] = useState(null);
  const [lifeEvents, setLifeEvents] = useState([]);
  const [apiConnectionStatus, setApiConnectionStatus] = useState('connected');

  // Data persistence instances - useMemo for performance
  const dataInterpreter = useMemo(() => new UIToAPIDataInterpreter(), []);
  const dataSaver = UIDataSaver;

  // Production grade API connection check
  useEffect(() => {
    const checkApiConnection = async () => {
      try {
        const response = await axios.get('/api/v1/health', { timeout: 5000 });
        if (response.data?.status === 'OK') {
          setApiConnectionStatus('connected');
        } else {
          throw new Error('API health check failed');
        }
      } catch (error) {
        console.error('API connection check failed:', error);
        setApiConnectionStatus('error');
        setError('Failed to connect to BTR service. Please check your internet connection and try again.');
      }
    };
    
    checkApiConnection();
  }, []); // Removed apiConnectionStatus dependency to avoid infinite loop

  // Load saved data from previous steps - production grade data flow
  useEffect(() => {
    try {
      // Try to get data from Chart page navigation
      let savedBirthData = null;
      try {
        const btrData = sessionStorage.getItem('birthDataForBTR');
        if (btrData) {
          savedBirthData = JSON.parse(btrData);
          sessionStorage.removeItem('birthDataForBTR');
        }
      } catch (error) {
        throw new Error(`Failed to load BTR data from sessionStorage: ${error.message}`);
      }

      // Fall back to regular session data if needed
      if (!savedBirthData) {
        const savedSession = dataSaver.loadSession();
        if (savedSession?.birthData) {
          savedBirthData = savedSession.birthData;
        }
        
        if (savedSession?.chartData) {
          setChartData(savedSession.chartData);
        }
      }

      if (savedBirthData) {
        // Validate required fields
        if (!savedBirthData.dateOfBirth || !savedBirthData.timeOfBirth || 
            (!savedBirthData.latitude && !savedBirthData.longitude)) {
          throw new Error('Incomplete birth data. Please ensure date, time, and location coordinates are available.');
        }
        
        setBirthData(savedBirthData);
        setPageStep('verification');
      }
    } catch (error) {
      console.error('Failed to load saved session:', error);
      setError(`Failed to load birth data: ${error.message}`);
    }
  }, [dataSaver, setChartData]);

  // Production grade API Connection Status Component
  const APIConnectionStatus = () => {
    if (apiConnectionStatus === 'error') {
      return (
        <Alert type="error" className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">🚨 Backend API Connection Error</p>
              <p className="text-sm">Unable to connect to the birth time rectification service.</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        </Alert>
      );
    }
    
    if (apiConnectionStatus === 'connected') {
      return null;
    }
    
    return (
      <Alert type="info" className="mb-6">
        <div className="flex items-center space-x-3">
          <LoadingSpinner size="sm" />
          <div>
            <p className="font-medium">Connecting to BTR Service...</p>
            <p className="text-sm">Establishing connection to birth time rectification API</p>
          </div>
        </div>
      </Alert>
    );
  };

  // Production grade BPHS-BTR Quick validation
  const performQuickValidation = useCallback(async () => {
    if (!birthData || !birthData.timeOfBirth) {
      throw new Error('Please complete birth data first');
    }

    try {
      setLoading(true);
      setError(null);
      
      const formattedBirthData = dataInterpreter.formatForAPI(birthData);
      
      // Validate required fields
      if (!formattedBirthData.dateOfBirth || !formattedBirthData.timeOfBirth || 
          !formattedBirthData.latitude || !formattedBirthData.longitude) {
        throw new Error('Required birth data fields are missing');
      }
      
      const requestData = {
        birthData: formattedBirthData,
        proposedTime: birthData.timeOfBirth
      };

      const response = await axios.post('/api/v1/rectification/quick', requestData, { timeout: 30000 });
      
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Validation failed');
      }
      
      if (!response.data?.validation) {
        throw new Error('Invalid validation response structure');
      }
      
      setRectificationData(response.data.validation);
      
      // Determine next step based on confidence score
      const confidence = response.data.validation.confidence || 0;
      if (confidence >= 80) {
        setPageStep('results');
      } else {
        setPageStep('events');
      }
    } catch (error) {
      console.error('Quick validation failed:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Birth time validation failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [birthData, dataInterpreter]);

  // Production grade Full BTR analysis with life events
  const performFullAnalysis = useCallback(async () => {
    if (!birthData) {
      throw new Error('Birth data is required');
    }
    
    if (!Array.isArray(lifeEvents) || lifeEvents.length === 0) {
      throw new Error('Please provide at least one life event for analysis');
    }

    try {
      setLoading(true);
      setError(null);
      setPageStep('analysis');
      
      const formattedBirthData = {
        ...dataInterpreter.formatForAPI(birthData),
        placeOfBirth: birthData.placeOfBirth || 'Unknown Location'
      };
      
      // Validate required fields for full analysis
      if (!formattedBirthData.dateOfBirth || !formattedBirthData.latitude || !formattedBirthData.longitude) {
        throw new Error('Complete birth data with coordinates is required for full analysis');
      }
      
      // Validate life events
      const validEvents = lifeEvents.filter(event => 
        event.date && event.description && event.date.trim() && event.description.trim()
      );
      
      if (validEvents.length === 0) {
        throw new Error('At least one valid life event with date and description is required');
      }
      
      const requestData = {
        birthData: formattedBirthData,
        lifeEvents: validEvents,
        options: {
          methods: ['praanapada', 'moon', 'gulika', 'events'],
          timeRange: { hours: 2 }
        }
      };

      const response = await axios.post('/api/v1/rectification/with-events', requestData, { timeout: 60000 });
      
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Full analysis failed');
      }
      
      if (!response.data?.rectification) {
        throw new Error('Invalid rectification response structure');
      }
      
      setRectificationData(response.data);
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
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [birthData, lifeEvents, dataInterpreter, dataSaver]);

  // Production grade birth form submission
  const handleBirthDataSubmit = useCallback(async (formData) => {
    try {
      setLoading(true);
      setError(null);
      setBirthData(formData);
      
      const apiData = dataInterpreter.formatForAPI(formData);
      
      // Validate required fields before API call
      if (!apiData.dateOfBirth || !apiData.timeOfBirth || 
          !apiData.latitude || !apiData.longitude) {
        throw new Error('All required birth fields must be completed');
      }
      
      // Generate chart for baseline
      const chartResponse = await axios.post('/api/v1/chart/generate', apiData, { timeout: 30000 });
      
      if (!chartResponse.data?.success) {
        throw new Error(chartResponse.data?.message || 'Chart generation failed');
      }
      
      if (!chartResponse.data?.data) {
        throw new Error('Invalid chart data structure');
      }
      
      setChartData(chartResponse.data);
      setPageStep('verification');
      
      dataSaver.saveSession({
        birthData: formData,
        coordinates: {
          latitude: formData.latitude,
          longitude: formData.longitude,
          timezone: formData.timezone
        },
        chartData: chartResponse.data
      });
    } catch (error) {
      console.error('Birth data submission failed:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to process birth data';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [dataInterpreter, dataSaver, setChartData]);

  // Event management
  const removeLifeEvent = useCallback((eventId) => {
    setLifeEvents(prev => prev.filter(event => event.id !== eventId));
  }, []);

  const handleEventsComplete = useCallback((events) => {
    setLifeEvents(events);
    performFullAnalysis();
  }, [performFullAnalysis]);

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
                <h2 className="text-3xl font-bold text-gray-900">Verify Your Birth Data</h2>
                <p className="text-lg text-gray-600">
                  Let's first confirm your birth information and perform a quick BTR validation
                </p>
              </div>

              {birthData ? (
                <Card className="bg-white border-2 border-gray-200 shadow-lg">
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Birth Information</h3>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <p><strong>Name:</strong> {birthData.name || 'Not provided'}</p>
                        <p><strong>Date of Birth:</strong> {birthData.dateOfBirth}</p>
                        <p><strong>Time of Birth:</strong> {birthData.timeOfBirth}</p>
                      </div>
                      <div className="space-y-3">
                        <p><strong>Birth Place:</strong> {birthData.placeOfBirth}</p>
                        <p><strong>Coordinates:</strong> {birthData.latitude}°, {birthData.longitude}°</p>
                        <p><strong>Timezone:</strong> {birthData.timezone}</p>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-200">
                      <Button
                        variant="cosmic"
                        size="lg"
                        onClick={performQuickValidation}
                        disabled={loading}
                        className="w-full"
                      >
                        {loading ? (
                          <span className="flex items-center gap-3">
                            <LoadingSpinner size="sm" />
                            <span>Performing BPHS-BTR Validation...</span>
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
                          </Alert>
                        ) : (
                          <Alert type="warning" className="mt-4">
                            <p className="font-semibold">⚠️ Additional Verification Needed</p>
                            <p>Let's improve accuracy by adding some major life events.</p>
                          </Alert>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              ) : (
                <Card className="bg-white border-2 border-gray-200 shadow-lg">
                  <BirthDataForm 
                    onSubmit={handleBirthDataSubmit}
                    onError={setError}
                    initialData={{}}
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
                  // Progress update handler - eventProgress state not needed
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
                  {/* Results Display */}
                  <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 shadow-lg">
                    <div className="text-center space-y-6">
                      <h3 className="text-2xl font-bold text-gray-900">Rectification Confidence</h3>
                      
                      <div className="w-full bg-gray-200 rounded-full h-4 mt-4">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-emerald-600 h-4 rounded-full transition-all duration-2000"
                          style={{ width: `${rectificationData.confidence || 0}%` }}
                        />
                      </div>
                      
                      <div className="text-3xl font-bold text-green-600">
                        {rectificationData.confidence || 0}% Confidence
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

  // Main Render - Production Grade
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-100/20 to-purple-100/20"></div>
      
      <div className="relative z-10 py-12">
        <div className="max-w-7xl mx-auto px-6">

          {/* API Connection Status Check */}
          <APIConnectionStatus />

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

export default BirthTimeRectificationPageCLEAN;
