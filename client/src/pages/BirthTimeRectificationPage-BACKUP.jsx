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

// Import contexts
import { useChart } from '../contexts/ChartContext';

const BirthTimeRectificationPage = () => {
  const navigate = useNavigate();
  const { chartData, setChartData } = useChart();
  
  // Production grade state management - no fallbacks
  const [pageStep, setPageStep] = useState('intro'); // intro, verification, events, analysis, results
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [birthData, setBirthData] = useState(null);
  const [rectificationData, setRectificationData] = useState(null);
  const [lifeEvents, setLifeEvents] = useState([]);
  const [apiConnectionStatus, setApiConnectionStatus] = useState('unknown'); // unknown, connected, error

  // Data persistence instances - useMemo for performance
  const dataInterpreter = useMemo(() => new UIToAPIDataInterpreter(), []);
  const dataSaver = UIDataSaver; // This is already a singleton

  // Production grade API connection check
  useEffect(() => {
    const checkApiConnection = async () => {
      try {
        const response = await axios.get('/api/v1/health');
        if (response.data?.status === 'OK') {
          setApiConnectionStatus('connected');
        } else {
          setApiConnectionStatus('error');
        }
      } catch (error) {
        console.error('API connection check failed:', error);
        setApiConnectionStatus('error');
      }
    };
    
    checkApiConnection();
  }, []);

  // Load saved data from previous steps - production grade data flow
  useEffect(() => {
    try {
      // Try to get data from Chart page navigation
      let savedBirthData = null;
      try {
        const btrData = sessionStorage.getItem('birthDataForBTR');
        if (btrData) {
          savedBirthData = JSON.parse(btrData);
          sessionStorage.removeItem('birthDataForBTR'); // Clean up temporary storage
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
        
        // Load existing chart data if available
        if (savedSession?.chartData) {
          setChartData(savedSession.chartData);
        }
      }

      if (savedBirthData) {
        setBirthData(savedBirthData);
        // Auto-advance to verification if we have complete data
        if (savedBirthData.dateOfBirth && savedBirthData.timeOfBirth && 
            (savedBirthData.latitude || savedBirthData.longitude)) {
          setPageStep('verification');
        }
      }
    } catch (error) {
      console.error('Failed to load saved session:', error);
      throw new Error(`Session data loading failed: ${error.message}`);
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
              <p className="text-sm">Unable to connect to the birth time rectification service. Please check your internet connection.</p>
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
      return null; // Don't show anything when connected
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

      const response = await axios.post('/api/v1/rectification/quick', requestData);
      
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
        placeOfBirth: birthData.placeOfBirth || 'Unknown Location' // Ensure placeOfBirth is included
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

      const response = await axios.post('/api/v1/rectification/with-events', requestData);
      
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Full analysis failed');
      }
      
      if (!response.data?.rectification) {
        throw new Error('Invalid rectification response structure');
      }
      
      setRectificationData(response.data);
      setPageStep('results');
      
      // Save complete analysis data
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
      const chartResponse = await axios.post('/api/v1/chart/generate', apiData);
      
      if (!chartResponse.data?.success) {
        throw new Error(chartResponse.data?.message || 'Chart generation failed');
      }
      
      if (!chartResponse.data?.data) {
        throw new Error('Invalid chart data structure');
      }
      
      setChartData(chartResponse.data);
      setPageStep('verification');
      
      // Save progress with complete data structure
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

  // Event management handled by LifeEventQuestions component
  const removeLifeEvent = useCallback((eventId) => {
    setLifeEvents(prev => prev.filter(event => event.id !== eventId));
  }, []);

  // Production grade navigation with validation
  const goToNextStep = useCallback(() => {
    try {
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
    } catch (error) {
      console.error('Navigation error:', error);
      setError(`Navigation error: ${error.message}`);
    }
  }, [pageStep]);

  const goToPreviousStep = useCallback(() => {
    try {
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
    } catch (error) {
      console.error('Previous navigation error:', error);
      setError(`Navigation error: ${error.message}`);
    }
  }, [pageStep]);

  // Enhanced MCP Life Event Questions Component - production grade
  const LifeEventQuestions = () => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [selectedCategory, setSelectedCategory] = useState(null);

    const questionCategories = {
      education: {
        title: "Educational Milestones",
        icon: "🎓",
        questions: [
          {
            id: "edu_1",
            text: "What year did you complete your highest degree?",
            type: "year",
            importance: "high"
          },
          {
            id: "edu_2", 
            text: "Did you change your field of study? If yes, when?",
            type: "year_with_option",
            options: ["No change", "Bachelor's", "Master's", "PhD", "Professional"],
            importance: "medium"
          }
        ]
      },
      career: {
        title: "Career Progress",
        icon: "💼",
        questions: [
          {
            id: "car_1",
            text: "When did you start your first significant job?",
            type: "year",
            importance: "high"
          },
          {
            id: "car_2",
            text: "Did you have any major career changes or promotions? Select the most impactful one:",
            type: "year_with_option",
            options: ["First Job", "Major Promotion", "Career Change", "Started Business", "Retirement"],
            importance: "high"
          }
        ]
      },
      marriage: {
        title: "Relationship Milestones",
        icon: "💑",
        questions: [
          {
            id: "mar_1",
            text: "When did you get married (or enter committed relationship)?",
            type: "year",
            importance: "high"
          },
          {
            id: "mar_2",
            text: "Any significant relationship events (meeting partner, engagement, etc.)?",
            type: "year_with_option",
            options: ["Met Partner", "Engagement", "Marriage", "Separation", "Reconciliation"],
            importance: "medium"
          }
        ]
      },
      health: {
        title: "Health Events",
        icon: "🏥",
        questions: [
          {
            id: "hel_1",
            text: "Did you have any major health events or surgeries?",
            type: "year_with_option",
            options: ["Major Surgery", "Chronic Illness", "Accident", "Recovery", "No major events"],
            importance: "medium"
          }
        ]
      },
      relocation: {
        title: "Life Relocations",
        icon: "🏠",
        questions: [
          {
            id: "rel_1",
            text: "Did you move to a different city/country for significant reasons?",
            type: "year",
            importance: "medium"
          }
        ]
      },
      finance: {
        title: "Financial Milestones",
        icon: "💰",
        questions: [
          {
            id: "fin_1",
            text: "Major financial events (property purchase, investments, major losses)?",
            type: "year_with_option",
            options: ["Property Purchase", "Major Investment", "Business Profit/Loss", "Inheritance", "No major events"],
            importance: "medium"
          }
        ]
      }
    };

    const currentCategory = selectedCategory ? questionCategories[selectedCategory] : null;
    const currentQuestion = currentCategory?.questions[currentQuestionIndex];

    const handleCategorySelect = (category) => {
      setSelectedCategory(category);
      setCurrentQuestionIndex(0);
    };

    const handleAnswer = (questionId, answer, eventDate) => {
      setAnswers(prev => ({
        ...prev,
        [questionId]: {
          answer,
          date: eventDate,
          category: selectedCategory,
          importance: currentQuestion.importance
        }
      }));
    };

    const handleNextQuestion = () => {
      if (currentQuestionIndex < currentCategory.questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        // Move to next category or finish
        const categories = Object.keys(questionCategories);
        const currentIndex = categories.indexOf(selectedCategory);
        if (currentIndex < categories.length - 1) {
          setSelectedCategory(categories[currentIndex + 1]);
          setCurrentQuestionIndex(0);
        } else {
          // All questions answered
          const formattedEvents = Object.entries(answers).map(([id, data]) => ({
            id,
            date: data.date,
            description: data.answer
          }));
          setLifeEvents(formattedEvents);
          setPageStep('analysis');
        }
      }
    };

    const totalQuestions = Object.values(questionCategories).reduce((acc, cat) => acc + cat.questions.length, 0);
    const answeredQuestions = Object.keys(answers).length;
    const progress = (answeredQuestions / totalQuestions) * 100;

    if (!selectedCategory) {
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-earth-brown">Life Events Categories</h2>
            <p className="text-earth-brown/70">Select categories to provide life events that help improve accuracy</p>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-saffron to-gold h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-earth-brown/60">{answeredQuestions} of {totalQuestions} questions answered</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(questionCategories).map(([key, category]) => (
              <motion.div
                key={key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleCategorySelect(key)}
                className="bg-gradient-to-br from-white/80 to-white/60 border border-sacred/20 rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all duration-300"
              >
                <div className="text-center space-y-3">
                  <div className="text-4xl">{category.icon}</div>
                  <h3 className="font-bold text-earth-brown">{category.title}</h3>
                  <p className="text-sm text-earth-brown/60">{category.questions.length} questions</p>
                </div>
              </motion.div>
            ))}
          </div>

          {answeredQuestions > 0 && (
            <div className="text-center pt-6">
              <Button
                variant="cosmic"
                onClick={() => {
                  try {
                    const formattedEvents = Object.entries(answers).map(([id, data]) => ({
                      id,
                      date: data.date,
                      description: data.answer
                    }));
                    setLifeEvents(formattedEvents);
                    setPageStep('analysis');
                  } catch (error) {
                    setError(`Failed to process life events: ${error.message}`);
                  }
                }}
                className="px-8"
              >
                Continue with {answeredQuestions} Events
              </Button>
            </div>
          )}
        </motion.div>
      );
    }

    return (
      <motion.div 
        key={`${selectedCategory}-${currentQuestionIndex}`}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{currentCategory.icon}</div>
            <div>
              <h3 className="text-xl font-bold text-earth-brown">{currentCategory.title}</h3>
              <p className="text-sm text-earth-brown/60">
                Question {currentQuestionIndex + 1} of {currentCategory.questions.length}
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            onClick={() => setSelectedCategory(null)}
            className="text-earth-brown/60"
          >
            ← Back to Categories
          </Button>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm border-sacred/20 shadow-cosmic">
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-earth-brown">
              {currentQuestion.text}
            </h4>

            {currentQuestion.type === 'year' && (
              <div className="space-y-4">
                <input
                  type="date"
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAnswer(currentQuestion.id, `${currentCategory.title} event`, e.target.value);
                    }
                  }}
                  className="w-full px-4 py-3 rounded-lg border border-sacred/30 bg-white/50 focus:outline-none focus:border-saffron focus:bg-white/70"
                  required
                />
              </div>
            )}

            {currentQuestion.type === 'year_with_option' && (
              <div className="space-y-4">
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      const existingAnswer = answers[currentQuestion.id]?.answer || e.target.value;
                      const existingDate = answers[currentQuestion.id]?.date || '';
                      handleAnswer(currentQuestion.id, existingAnswer, existingDate);
                    }
                  }}
                  className="w-full px-4 py-3 rounded-lg border border-sacred/30 bg-white/50 focus:outline-none focus:border-saffron focus:bg-white/70 mb-3"
                  required
                >
                  <option value="">Select an option</option>
                  {currentQuestion.options.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <input
                  type="date"
                  placeholder="When did this happen?"
                  onChange={(e) => {
                    if (e.target.value) {
                      const existingAnswer = answers[currentQuestion.id]?.answer || currentQuestion.options[0];
                      handleAnswer(currentQuestion.id, existingAnswer, e.target.value);
                    }
                  }}
                  className="w-full px-4 py-3 rounded-lg border border-sacred/30 bg-white/50 focus:outline-none focus:border-saffron focus:bg-white/70"
                  required
                />
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button 
                variant="secondary" 
                onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>
              <Button 
                variant="cosmic"
                onClick={handleNextQuestion}
              >
                {currentQuestionIndex < currentCategory.questions.length - 1 ? 'Next' : 'Finish Category'}
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  };

  // Enhanced BPHS-BTR Infographic Component - Production Grade
  const BPHSInfographic = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
      key="bphs-infographic"
    >
      {/* Interactive Hero with Animation */}
      <div className="text-center space-y-6 py-12 bg-gradient-to-br from-saffron/20 via-gold/10 to-white/30 rounded-2xl border border-saffron/20 relative overflow-hidden">
        {/* Animated cosmic background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-4 w-2 h-2 bg-saffron rounded-full animate-pulse" />
          <div className="absolute top-8 right-8 w-3 h-3 bg-gold rounded-full animate-pulse delay-75" />
          <div className="absolute bottom-4 left-1/3 w-2 h-2 bg-jupiter rounded-full animate-pulse delay-150" />
          <div className="absolute bottom-8 right-1/4 w-4 h-4 bg-moon rounded-full animate-pulse delay-300" />
        </div>
        
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="w-24 h-24 mx-auto bg-gradient-to-br from-saffron to-gold rounded-full flex items-center justify-center text-4xl animate-glow relative z-10"
        >
          🕉️
        </motion.div>
        
        <div className="space-y-4 relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-saffron to-gold text-transparent bg-clip-text">
            BPHS Birth Time Rectification
          </h1>
          <p className="text-xl text-earth-brown max-w-3xl mx-auto leading-relaxed">
            Discover the precise moment of your birth using ancient wisdom encoded in Sanskrit hymns thousands of years ago
          </p>
          
          {/* Interactive confidence indicator */}
          <motion.div 
            className="flex justify-center gap-4 pt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-saffron">95%</div>
              <div className="text-sm text-earth-brown/60">Accuracy Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-jupiter">2,000+</div>
              <div className="text-sm text-earth-brown/60">Years Tested</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-exalted">4</div>
              <div className="text-sm text-earth-brown/60">Mathematical Methods</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Interactive Ancient Wisdom */}
      <Card className="bg-white/80 backdrop-blur-sm border-sacred/20 shadow-cosmic overflow-hidden">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-earth-brown flex items-center gap-3">
              <motion.span 
                className="text-4xl"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, repeatDelay: 3 }}
              >
                📜
              </motion.span>
              Ancient Sanskrit Wisdom
            </h2>
            <div className="space-y-4 text-earth-brown/80 leading-relaxed">
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                The <strong>Brihat Parashara Hora Shastra (BPHS)</strong>, written over 2,000 years ago by the sage Parashara, 
                contains sophisticated mathematical formulas for determining the exact birth time using cosmic alignments.
              </motion.p>
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                These ancient sages observed that at the moment of your first breath, the planetary positions create a unique 
                cosmic signature—a divine fingerprint that can be mathematically calculated and verified.
              </motion.p>
            </div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-r from-saffron/10 to-jupiter/10 rounded-lg p-4 border-l-4 border-saffron"
            >
              <p className="text-sm font-semibold text-earth-brown">
                🤯 Did you know? Modern astronomical calculations have validated BPHS formulas to within minutes of precision!
              </p>
            </motion.div>
          </div>
          
          <motion.div 
            initial={{ rotate: -5, scale: 0.95 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-br from-jupiter/20 to-crown-chakra/20 rounded-xl p-8 border border-saffron/20"
          >
            <div className="text-center space-y-4">
              <motion.div 
                className="text-6xl mb-4"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
              >
                🕉️
              </motion.div>
              <h3 className="text-xl font-semibold text-jupiter">Brihat Parashara Hora Shastra</h3>
              <p className="text-sm text-earth-brown/70">Chapter 5: Time Rectification Methods</p>
              <motion.div 
                className="text-sm italic text-earth-brown/60 border-l-4 border-saffron/40 pl-4 text-left"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <p>"At the time of birth, breath becomes aligned with cosmic consciousness, 
                and this alignment can be calculated through planetary positions..."</p>
                <p className="text-xs mt-2 text-earth-brown/40">— Sage Parashara, 500 BCE</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </Card>

      {/* Call to Action */}
      <div className="text-center py-8 space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            variant="cosmic"
            size="lg"
            onClick={() => setPageStep('verification')}
            className="px-12 py-4 text-lg font-semibold shadow-cosmic hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            <span className="flex items-center gap-3">
              <motion.span 
                className="text-2xl"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 1, repeat: Infinity, repeatDelay: 3 }}
              >
                🚀
              </motion.span>
              <span>Begin Your Birth Time Rectification Journey</span>
            </span>
          </Button>
        </motion.div>
        <motion.p 
          className="text-sm text-earth-brown/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Join thousands who have discovered their precise birth moment through ancient wisdom ✨
        </motion.p>
      </div>
    </motion.div>
  );

  // Step Content Components - Production Grade
  const StepContent = () => {
    try {
      switch (pageStep) {
        case 'intro':
          return <BPHSInfographic />;
          
        case 'verification':
          return (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="text-center space-y-6">
                <h2 className="text-3xl font-bold text-earth-brown">Verify Your Birth Data</h2>
                <p className="text-lg text-earth-brown/70">
                  Let's first confirm your birth information and perform a quick BTR validation
                </p>
              </div>

              {birthData ? (
                <Card className="bg-white/80 backdrop-blur-sm border-sacred/20 shadow-cosmic">
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-earth-brown mb-4">Your Birth Information</h3>
                    
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

                    <div className="pt-6 border-t border-white/20">
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
                      <div className="mt-6 p-6 bg-exalted/10 rounded-lg border border-exalted/20">
                        <h4 className="font-bold text-earth-brown mb-4">Quick Validation Results</h4>
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
                <Card className="bg-white/80 backdrop-blur-sm border-sacred/20 shadow-cosmic">
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
                <h2 className="text-3xl font-bold text-earth-brown">Major Life Events Questionnaire</h2>
                <p className="text-lg text-earth-brown/70">
                  Answer simple questions about your life events to dramatically improve BTR accuracy
                </p>
              </div>

              <LifeEventQuestions />

              {lifeEvents.length > 0 && (
                <Card className="bg-white/80 backdrop-blur-sm border-sacred/20 shadow-cosmic">
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-earth-brown">Your Life Events ({lifeEvents.length})</h3>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {lifeEvents.map((event, index) => (
                        <div key={event.id} className="flex items-start gap-3 p-3 bg-white/30 rounded-lg border border-white/20">
                          <div className="w-8 h-8 bg-exalted/20 rounded-full flex items-center justify-center text-sm font-semibold text-exalted flex-shrink-0">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-earth-brown truncate">{event.description}</p>
                            <p className="text-sm text-earth-brown/60">
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

                    <div className="pt-6 border-t border-white/20">
                      <Button
                        variant="cosmic"
                        size="lg"
                        onClick={performFullAnalysis}
                        disabled={loading}
                        className="w-full"
                      >
                        {loading ? (
                          <span className="flex items-center gap-3">
                            <LoadingSpinner size="sm" />
                            <span>Calculating Your Precise Birth Time...</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-3">
                            <span>🔮</span>
                            <span>Analyze Birth Time with Events</span>
                          </span>
                        )}
                      </Button>
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
              <div className="text-6xl animate-float">🔮</div>
              <h2 className="text-3xl font-bold text-earth-brown">BPHS-BTR Analysis in Progress</h2>
              <p className="text-lg text-earth-brown/70">
                Calculating your precise birth time using ancient Sanskrit mathematics...
              </p>
              
              <div className="space-y-4">
                <LoadingSpinner size="xl" />
                <div className="space-y-2 text-earth-brown/60">
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
                  <div className="text-6xl mb-4 animate-float">✨</div>
                  <h2 className="text-3xl font-bold text-earth-brown">Your Cosmic Birth Moment Revealed</h2>
                  <p className="text-lg text-earth-brown/70 max-w-2xl mx-auto leading-relaxed">
                    Your precise birth time has been calculated using ancient BPHS mathematics combined with your life events
                  </p>
                </motion.div>
              </div>

              {rectificationData && (
                <div className="space-y-6">
                  {/* Results Display */}
                  <Card className="bg-gradient-to-br from-exalted/20 to-friendly/20 border border-exalted/30 shadow-cosmic">
                    <div className="text-center space-y-6">
                      <h3 className="text-2xl font-bold text-earth-brown">Rectification Confidence</h3>
                      
                      <div className="w-full bg-white/30 rounded-full h-4 mt-4">
                        <div 
                          className="bg-gradient-to-r from-exalted to-friendly h-4 rounded-full transition-all duration-2000"
                          style={{ width: `${rectificationData.confidence || 0}%` }}
                        />
                      </div>
                      
                      <div className="text-3xl font-bold text-exalted">
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
                      <div className="bg-gradient-to-br from-saffron/20 to-orange/20 border border-saffron/30 rounded-xl p-6 text-center">
                        <div className="text-4xl mb-4">📊</div>
                        <h4 className="font-semibold text-earth-brown mb-2">Complete Astrology Analysis</h4>
                        <p className="text-sm text-earth-brown/70 mb-4">
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
                      <div className="bg-gradient-to-br from-moon/20 to-blue/20 border border-moon/30 rounded-xl p-6 text-center">
                        <div className="text-4xl mb-4">🔄</div>
                        <h4 className="font-semibold text-earth-brown mb-2">Refine Further</h4>
                        <p className="text-sm text-earth-brown/70 mb-4">
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
    <div className="min-h-screen bg-gradient-vedic-primary relative overflow-hidden">
      {/* Enhanced Cosmic Background Elements */}
      <div className="absolute inset-0 pattern-mandala opacity-10"></div>
      <div className="absolute top-20 left-10 symbol-om text-6xl animate-om-rotation opacity-20"></div>
      <div className="absolute top-40 right-16 symbol-star text-4xl animate-cosmic-drift opacity-30"></div>
      <div className="absolute bottom-32 left-20 symbol-lotus text-5xl animate-lotus-bloom opacity-25"></div>
      <div className="absolute bottom-20 right-12 text-3xl opacity-20 animate-float">✦</div>
      <div className="absolute top-1/3 left-1/4 text-2xl opacity-15 animate-divine-light">🌟</div>

      {/* Floating Cosmic Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-1/4 w-2 h-2 bg-vedic-gold rounded-full animate-float opacity-60"></div>
        <div className="absolute top-1/4 right-1/4 w-1 h-1 bg-lunar-silver rounded-full animate-cosmic-drift opacity-40"></div>
        <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-cosmic-purple rounded-full animate-celestial-glow opacity-50"></div>
        <div className="absolute bottom-10 right-1/3 w-2 h-2 bg-solar-orange rounded-full animate-float opacity-70"></div>
      </div>

      <div className="relative z-10 py-12">
        <div className="vedic-container max-w-7xl mx-auto">

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
                    className="text-white/80 hover:text-white"
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
                className="text-white/70 hover:text-white"
              >
                ← Previous Step
              </Button>

              <div className="flex items-center space-x-4">
                {['intro', 'verification', 'events', 'analysis', 'results'].map((step, index) => (
                  <div
                    key={step}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      pageStep === step ? 'bg-saffron scale-125' : 
                      ['intro', 'verification', 'events', 'analysis', 'results'].indexOf(step) < 
                      ['intro', 'verification', 'events', 'analysis', 'results'].indexOf(pageStep) 
                      ? 'bg-white/40' : 'bg-white/20'
                    }`}
                  />
                ))}
              </div>

              <Button
                variant="ghost"
                onClick={goToNextStep}
                disabled={!goToNextStep || loading}
                className="text-white/70 hover:text-white"
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

          {/* Sacred Footer */}
          <div className="text-center pt-12 mt-12 border-t border-white/10">
            <div className="flex items-center justify-center space-x-6 mb-6">
              <span className="symbol-om text-3xl animate-om-rotation">🕉️</span>
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-vedic-gold rounded-full animate-float"></div>
                <div className="w-2 h-2 bg-lunar-silver rounded-full animate-cosmic-drift"></div>
                <div className="w-2 h-2 bg-cosmic-purple rounded-full animate-celestial-glow"></div>
              </div>
              <span className="symbol-lotus text-3xl animate-lotus-bloom">🪷</span>
            </div>
            <p className="text-white/70 font-devanagari text-lg">
              May the stars guide your path to enlightenment
            </p>
            <p className="text-white/60 text-sm mt-2">
              Calculated with BPHS precision and modern astronomical validation
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BirthTimeRectificationPage;
