import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

// Import Vedic design system
import '../styles/vedic-design-system.css';

// Import UI components
import { Button, Card, Alert, LoadingSpinner } from '../components/ui';
import { FaCheckCircle, FaMagic, FaExclamationTriangle, FaChartBar } from 'react-icons/fa';
import BirthDataForm from '../components/forms/BirthDataForm.js';
import UIDataSaver from '../components/forms/UIDataSaver.js';
import UIToAPIDataInterpreter from '../components/forms/UIToAPIDataInterpreter.js';
import BPHSInfographicPROD from '../components/btr/BPHSInfographic.jsx';
import InteractiveLifeEventsQuestionnairePROD from '../components/btr/InteractiveLifeEventsQuestionnaire.jsx';

// Import contexts
import { useChart } from '../contexts/ChartContext.js';

// Import utilities
import { formatTimeToHHMMSS } from '../utils/dateUtils.js';
import { getApiUrl } from '../utils/apiConfig.js';
import PlanetaryAnimations from '../components/ui/PlanetaryAnimations.jsx';

// Type-safe rendering helpers to prevent React Error #130
const safeNumber = (value) => {
  if (typeof value === 'number' && !isNaN(value)) return value;
  if (typeof value === 'string') {
    const num = parseFloat(value);
    return !isNaN(num) ? num : 0;
  }
  return 0;
};

const safeString = (value) => {
  if (value == null) return 'N/A';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (typeof value === 'object') {
    // If it's an object, try to get a meaningful string representation
    return value.sign || value.name || JSON.stringify(value);
  }
  return String(value);
};

// Comprehensive normalization function to prevent React Error #130
// Converts all objects to safe primitive types for React rendering
const normalizeRectificationData = (data) => {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const normalized = {
    // Preserve primitive properties
    proposedTime: typeof data.proposedTime === 'string' ? data.proposedTime : null,
    confidence: safeNumber(data.confidence),
    alignmentScore: safeNumber(data.alignmentScore),
    rectifiedTime: typeof data.rectifiedTime === 'string' ? data.rectifiedTime : null,
    
    // Normalize ascendant object - extract only primitive values
    ascendant: data.ascendant ? {
      sign: safeString(data.ascendant.sign || data.ascendant.signName),
      signId: typeof data.ascendant.signId === 'string' || typeof data.ascendant.signId === 'number' 
        ? safeString(data.ascendant.signId) 
        : null,
      degree: safeNumber(data.ascendant.degree || data.ascendant.longitude),
      longitude: safeNumber(data.ascendant.longitude || data.ascendant.siderealLongitude)
    } : null,
    
    // Normalize praanapada object - extract only primitive values
    praanapada: data.praanapada ? {
      sign: safeString(data.praanapada.sign || data.praanapada.signName),
      degree: safeNumber(data.praanapada.degree || data.praanapada.longitude),
      longitude: safeNumber(data.praanapada.longitude)
    } : null,
    
    // Normalize recommendations array - convert objects to safe strings
    recommendations: Array.isArray(data.recommendations) 
      ? data.recommendations.map(rec => {
          if (typeof rec === 'string') return rec;
          if (rec && typeof rec === 'object') {
            return safeString(rec.message || rec.text || rec.description || rec);
          }
          return safeString(rec);
        })
      : [],
    
    // Normalize analysisLog array - ensure all are strings
    analysisLog: Array.isArray(data.analysisLog)
      ? data.analysisLog.map(log => safeString(log))
      : [],
    
    // Normalize analysis object if present (for full analysis responses)
    analysis: data.analysis ? {
      bestCandidate: data.analysis.bestCandidate ? (() => {
        const candidate = data.analysis.bestCandidate;
        // Extract only primitive values from bestCandidate to prevent React Error #130
        // Comprehensive extraction of all primitive properties, ignore nested objects
        const normalized = {};
        Object.keys(candidate).forEach(key => {
          const value = candidate[key];
          // Only include primitive values - explicitly exclude objects and arrays
          if (value === null || value === undefined) {
            normalized[key] = null;
          } else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
            normalized[key] = value;
          }
          // Explicitly skip objects and arrays to prevent nested structures
        });
        
        // Ensure required properties have default values if missing
        if (!normalized.time && candidate.time) {
          normalized.time = typeof candidate.time === 'string' ? candidate.time : String(candidate.time);
        }
        if (normalized.confidence === undefined) {
          normalized.confidence = safeNumber(candidate.confidence);
        }
        if (normalized.score === undefined) {
          normalized.score = safeNumber(candidate.score);
        }
        
        return normalized;
      })() : null,
      method: safeString(data.analysis.method),
      candidates: Array.isArray(data.analysis.candidates)
        ? data.analysis.candidates.map(candidate => {
            const normalized = {
              time: typeof candidate.time === 'string' ? candidate.time : null,
              confidence: safeNumber(candidate.confidence),
              score: safeNumber(candidate.score)
            };
            // Add any other primitive properties
            Object.keys(candidate).forEach(key => {
              if (!normalized.hasOwnProperty(key)) {
                const value = candidate[key];
                if (value == null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
                  normalized[key] = value;
                }
              }
            });
            return normalized;
          })
        : []
    } : null
  };

  // Preserve any other primitive properties that might exist
  Object.keys(data).forEach(key => {
    if (!normalized.hasOwnProperty(key)) {
      const value = data[key];
      if (value == null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        normalized[key] = value;
      } else if (Array.isArray(value)) {
        normalized[key] = value.map(item => {
          if (typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean') {
            return item;
          }
          return safeString(item);
        });
      } else {
        // Skip objects - they're not safe to render
      }
    }
  });

  return normalized;
};

const BirthTimeRectificationPageEnhanced = () => {
  const navigate = useNavigate();
  const { currentChart } = useChart();
  
  // Production grade state management - no fallbacks
  const [pageStep, setPageStep] = useState('intro');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const resultsRef = useRef(null);
  // eslint-disable-next-line no-unused-vars
  const nextStepButtonRef = useRef(null); // Reserved for future focus management enhancements
  const [birthData, setBirthData] = useState(null);
  const [rectificationData, setRectificationData] = useState(null);
  const [lifeEvents, setLifeEvents] = useState([]);
  const [quickValidationComplete, setQuickValidationComplete] = useState(false);

  // Data persistence instances - useMemo for performance
  const dataInterpreter = useMemo(() => new UIToAPIDataInterpreter(), []);
  const dataSaver = UIDataSaver;

  // Memoize initial answers and completed categories for events persistence
  // Must be at top level to comply with Rules of Hooks
  const initialAnswers = useMemo(() => {
    // Restore answers state from lifeEvents - convert events back to question format
    return lifeEvents.reduce((acc, event) => {
      // Map event data to component's answer format
      if (event.id && event.date && event.description) {
        acc[event.id] = {
          date: event.date,
          answer: event.description,
          category: event.category || 'general',
          importance: event.importance || 'high',
          questionText: event.questionText || event.description
        };
      }
      return acc;
    }, {});
  }, [lifeEvents]);

  const initialCompletedCategories = useMemo(() => {
    // Restore completed categories from lifeEvents
    const categoryMap = {
      'relationship': 'marriage',
      'career': 'career',
      'education': 'education',
      'health': 'health',
      'relocation': 'relocation',
      'financial': 'financial'
    };
    return new Set(
      Array.from(new Set(lifeEvents.map(e => {
        const category = e.category?.toLowerCase();
        return categoryMap[category] || category;
      }))).filter(Boolean)
    );
  }, [lifeEvents]);

  // Production grade API connection check
  useEffect(() => {
    const checkApiConnection = async () => {
      try {
        const response = await axios.get(getApiUrl('/api/v1/health'), { timeout: 5000 });
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

  // Auto-trigger full analysis when navigating to analysis step with events
  useEffect(() => {
    if (pageStep === 'analysis' && lifeEvents.length > 0 && !loading && !rectificationData) {
      console.log('🔄 Auto-triggering full analysis with events:', lifeEvents.length);
      performFullAnalysisWithEvents(lifeEvents).catch((error) => {
        console.error('❌ Auto-triggered analysis failed:', error);
        setError(error.message || 'Analysis failed');
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageStep, lifeEvents.length]);

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
              // CRITICAL FIX: Don't remove the data immediately - keep it for error recovery
              console.log('✅ BTR Page: Loaded birth data from sessionStorage:', savedBirthData);
            } else {
              console.warn('⚠️ BTR Page: No birthDataForBTR found in sessionStorage');
            }
          } catch (storageError) {
            console.warn('Session storage data not available:', storageError.message);
          }
        }

        // Priority 3: Check UIDataSaver simple keys for test compatibility
        if (!savedBirthData) {
          const simpleBirthData = sessionStorage.getItem('birth_data_session');
          if (simpleBirthData) {
            savedBirthData = JSON.parse(simpleBirthData);
            console.log('✅ BTR Page: Loaded birth data from simple session key:', savedBirthData);
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
        // Properly serialize error to avoid Puppeteer JSHandle@error serialization
        const errorMessage = error instanceof Error 
          ? error.message 
          : typeof error === 'string' 
            ? error 
            : String(error);
        
        // Only log actual errors, not expected "no session exists" states
        if (errorMessage && !errorMessage.includes('sessionStorage') && !errorMessage.includes('localStorage')) {
          console.error('Failed to load saved session:', errorMessage);
        }
        setError(errorMessage || 'Unable to load saved session data');
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
      const response = await axios.post(getApiUrl('/api/v1/rectification/quick'), requestData, { timeout: 30000 });
      
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
      
      // CRITICAL FIX: API returns validation at top level, not nested in data
      // API response: { success: true, validation: {...}, timestamp: ... }
      const validation = response.data?.validation || response.data?.data?.validation || response.validation;
      if (!validation) {
        console.error('Invalid validation response structure:', response.data);
        return setError('Invalid validation response structure');
      }
      
      // CRITICAL FIX: Comprehensive normalization to prevent React Error #130
      // Normalize ALL properties, especially objects, to safe primitive types
      const normalized = normalizeRectificationData(validation);
      
      if (!normalized) {
        console.error('Normalization failed for validation data:', validation);
        return setError('Data normalization failed');
      }
      
      // Validate normalized structure contains only primitives (only in development)
      if (process.env.NODE_ENV === 'development') {
        const validateNormalized = (obj, path = '') => {
          if (!obj || typeof obj !== 'object') return;
          
          for (const key in obj) {
            const value = obj[key];
            const currentPath = path ? `${path}.${key}` : key;
            
            if (value === null || value === undefined) {
              continue; // null/undefined are safe
            }
            
            if (Array.isArray(value)) {
              value.forEach((item, index) => {
                if (item !== null && typeof item === 'object' && !Array.isArray(item)) {
                  // Check if the item is already normalized (contains only primitives)
                  const hasOnlyPrimitives = Object.values(item).every(v => 
                    v === null || v === undefined || 
                    typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean'
                  );
                  if (!hasOnlyPrimitives) {
                    console.warn(`Non-primitive object found in array at ${currentPath}[${index}]`);
                  }
                }
              });
            } else if (typeof value === 'object' && !Array.isArray(value)) {
              // Nested objects are only allowed for ascendant/praanapada/analysis which are normalized
              if (['ascendant', 'praanapada', 'analysis'].includes(key)) {
                // For analysis.bestCandidate, check if it contains only primitives
                if (key === 'analysis' && value.bestCandidate) {
                  const bestCandidatePrimitives = Object.values(value.bestCandidate).every(v => 
                    v === null || v === undefined || 
                    typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean'
                  );
                  if (!bestCandidatePrimitives) {
                    // bestCandidate has nested objects - this should not happen after normalization
                    const hasNestedObjects = Object.values(value.bestCandidate).some(v => 
                      v !== null && typeof v === 'object' && !Array.isArray(v)
                    );
                    if (hasNestedObjects) {
                      console.warn(`Unnormalized object found at ${currentPath}.bestCandidate - this should be normalized`);
                    }
                  }
                }
                
                // Validate that nested normalized objects contain only primitives
                const hasOnlyPrimitives = Object.values(value).every(v => 
                  v === null || v === undefined || 
                  typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean' ||
                  (Array.isArray(v) && v.every(item => 
                    typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean'
                  ))
                );
                if (!hasOnlyPrimitives) {
                  // Only validate if there are actual nested objects, not just normalized primitives
                  const hasNestedObjects = Object.values(value).some(v => 
                    v !== null && typeof v === 'object' && !Array.isArray(v) && 
                    // Exclude bestCandidate which is already normalized
                    (v !== value.bestCandidate)
                  );
                  if (hasNestedObjects) {
                    validateNormalized(value, currentPath);
                  }
                }
              } else {
                console.warn(`Unnormalized object found at ${currentPath} (may be safely normalized)`);
              }
            }
          }
        };
        
        validateNormalized(normalized);
      }
      
      setRectificationData(normalized);
      setQuickValidationComplete(true);
      
      // Determine next step based on confidence score
      const confidence = normalized.confidence || 0;
      if (confidence >= 80) {
        setTimeout(() => setPageStep('results'), 1500);
      } else {
        setTimeout(() => {
          setPageStep('events');
          // Move focus to events section after step change
          setTimeout(() => {
            const eventsSection = document.querySelector('[data-step="events"]');
            if (eventsSection) {
              eventsSection.focus();
            }
          }, 100);
        }, 1500);
      }
    } catch (error) {
      console.error('Quick validation failed:', error);
      let errorMessage = 'Unable to compute rectification. Please check your inputs and try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message && !error.message.includes('Network')) {
        errorMessage = error.message;
      } else if (error.message?.includes('Network') || error.code === 'NETWORK_ERROR') {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
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
      const response = await axios.post(getApiUrl('/api/v1/rectification/with-events'), requestData, { timeout: 60000 });
      
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
      
      // CRITICAL FIX: API returns rectification at top level, not nested in data
      // API response: { success: true, rectification: {...}, timestamp: ... }
      const rectification = response.data?.rectification || response.data?.data?.rectification || response.rectification;
      if (!rectification) {
        console.error('Invalid rectification response structure:', response.data);
        return setError('Invalid rectification response structure');
      }
      
      // CRITICAL FIX: Comprehensive normalization to prevent React Error #130
      // Normalize ALL properties, especially objects, to safe primitive types
      const normalized = normalizeRectificationData(rectification);
      
      if (!normalized) {
        console.error('Normalization failed for rectification data:', rectification);
        return setError('Data normalization failed');
      }
      
      // Validate normalized structure contains only primitives (only in development)
      if (process.env.NODE_ENV === 'development') {
        const validateNormalized = (obj, path = '') => {
          if (!obj || typeof obj !== 'object') return;
          
          for (const key in obj) {
            const value = obj[key];
            const currentPath = path ? `${path}.${key}` : key;
            
            if (value === null || value === undefined) {
              continue; // null/undefined are safe
            }
            
            if (Array.isArray(value)) {
              value.forEach((item, index) => {
                if (item !== null && typeof item === 'object' && !Array.isArray(item)) {
                  // Check if the item is already normalized (contains only primitives)
                  const hasOnlyPrimitives = Object.values(item).every(v => 
                    v === null || v === undefined || 
                    typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean'
                  );
                  if (!hasOnlyPrimitives) {
                    console.warn(`Non-primitive object found in array at ${currentPath}[${index}]`);
                  }
                }
              });
            } else if (typeof value === 'object' && !Array.isArray(value)) {
              // Nested objects are only allowed for ascendant/praanapada/analysis which are normalized
              if (['ascendant', 'praanapada', 'analysis'].includes(key)) {
                // For analysis.bestCandidate, check if it contains only primitives
                if (key === 'analysis' && value.bestCandidate) {
                  const bestCandidatePrimitives = Object.values(value.bestCandidate).every(v => 
                    v === null || v === undefined || 
                    typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean'
                  );
                  if (!bestCandidatePrimitives) {
                    // bestCandidate has nested objects - this should not happen after normalization
                    const hasNestedObjects = Object.values(value.bestCandidate).some(v => 
                      v !== null && typeof v === 'object' && !Array.isArray(v)
                    );
                    if (hasNestedObjects) {
                      console.warn(`Unnormalized object found at ${currentPath}.bestCandidate - this should be normalized`);
                    }
                  }
                }
                
                // Validate that nested normalized objects contain only primitives
                const hasOnlyPrimitives = Object.values(value).every(v => 
                  v === null || v === undefined || 
                  typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean' ||
                  (Array.isArray(v) && v.every(item => 
                    typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean'
                  ))
                );
                if (!hasOnlyPrimitives) {
                  // Only validate if there are actual nested objects, not just normalized primitives
                  const hasNestedObjects = Object.values(value).some(v => 
                    v !== null && typeof v === 'object' && !Array.isArray(v) && 
                    // Exclude bestCandidate which is already normalized
                    (v !== value.bestCandidate)
                  );
                  if (hasNestedObjects) {
                    validateNormalized(value, currentPath);
                  }
                }
              } else {
                console.warn(`Unnormalized object found at ${currentPath} (may be safely normalized)`);
              }
            }
          }
        };
        
        validateNormalized(normalized);
      }
      
      // Normalize data structure - store rectification object consistently with quick validation
      setRectificationData(normalized);
      setPageStep('results');
      // Move focus to results section after step change
      setTimeout(() => {
        if (resultsRef.current) {
          resultsRef.current.focus();
        }
      }, 100);
      
      dataSaver.saveSession({
        ...dataSaver.loadSession(),
        rectificationData: normalized || response.data
      });
    } catch (error) {
      console.error('Full analysis failed:', error);
      let errorMessage = 'Unable to compute rectification. Please check your inputs and try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message && !error.message.includes('Network')) {
        errorMessage = error.message;
      } else if (error.message?.includes('Network') || error.code === 'NETWORK_ERROR') {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
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
                <h2 className="text-3xl font-bold" style={{ color: 'rgb(255, 255, 255)' }}>Your Birth Details</h2>
                <p className="text-lg" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Confirm your birth information and perform quick BPHS validation
                </p>
              </div>

              {birthData ? (
                <Card className="border-2 border-white/20 shadow-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'rgb(255, 255, 255)' }}>
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold mb-4" style={{ color: 'rgb(255, 255, 255)' }}>Your Birth Information</h3>
                    
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
                        aria-label={loading ? "Performing BPHS-BTR Validation" : quickValidationComplete ? "Validation Complete" : "Validate Birth Time"}
                      >
                        {loading ? (
                          <span className="flex items-center gap-3">
                            <LoadingSpinner size="sm" />
                            <span>Performing BPHS-BTR Validation...</span>
                          </span>
                        ) : quickValidationComplete ? (
                          <span className="flex items-center gap-3">
                            <FaCheckCircle className="text-green-600" style={{ color: 'var(--exalted-color)' }} />
                            <span>Validation Complete</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-3">
                            <FaMagic className="text-vedic-saffron" style={{ color: 'var(--vedic-saffron)' }} />
                            <span>Validate Birth Time</span>
                          </span>
                        )}
                      </Button>
                    </div>

                    {rectificationData && (
                      <div className="mt-6 p-6 rounded-lg border border-white/20" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'rgb(255, 255, 255)' }}>
                        <h4 className="font-bold mb-4" style={{ color: 'rgb(255, 255, 255)' }}>Quick Validation Results</h4>
                        <div className="space-y-3">
                          <p><strong>Confidence Score:</strong> {safeNumber(rectificationData.confidence)}%</p>
                          <p><strong>Alignment Score:</strong> {safeNumber(rectificationData.alignmentScore)}</p>
                          <p><strong>Praanapada Sign:</strong> {safeString(rectificationData.praanapada?.sign)}</p>
                          <p><strong>Ascendant Sign:</strong> {safeString(rectificationData.ascendant?.sign)}</p>
                        </div>
                        
                        {safeNumber(rectificationData.confidence) >= 80 ? (
                          <Alert type="success" className="mt-4">
                            <p className="font-semibold flex items-center gap-2">
                              <FaCheckCircle className="text-green-600" style={{ color: 'var(--exalted-color)' }} />
                              High Confidence!
                            </p>
                            <p>Your birth time appears to be accurate with {safeNumber(rectificationData.confidence)}% confidence.</p>
                            <Button
                              variant="secondary"
                              onClick={() => setPageStep('results')}
                              className="mt-3"
                              aria-label="View rectification results"
                            >
                              View Results
                            </Button>
                          </Alert>
                        ) : (
                          <Alert type="warning" className="mt-4">
                            <p className="font-semibold flex items-center gap-2">
                              <FaExclamationTriangle className="text-yellow-600" style={{ color: 'var(--vedic-gold)' }} />
                              Additional Verification Needed
                            </p>
                            <p>Let's improve accuracy by adding some major life events (confidence: {safeNumber(rectificationData.confidence)}%).</p>
                            <Button
                              variant="secondary"
                              onClick={() => setPageStep('events')}
                              className="mt-3"
                              aria-label="Add life events to improve accuracy"
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
                <Card className="border-2 border-white/20 shadow-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'rgb(255, 255, 255)' }}>
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
                <h2 className="text-3xl font-bold" style={{ color: 'rgb(255, 255, 255)' }}>Major Life Events Questionnaire</h2>
                <p className="text-lg" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Answer simple questions about your life events to dramatically improve BTR accuracy
                </p>
              </div>

              <InteractiveLifeEventsQuestionnairePROD 
                onComplete={handleEventsComplete}
                onProgressUpdate={(progress) => {
                  // Progress update handler 
                  console.log('Progress updated:', progress);
                }}
                initialAnswers={initialAnswers}
                initialCompletedCategories={initialCompletedCategories}
              />

              {lifeEvents.length > 0 && (
                <Card className="border-2 border-white/20 shadow-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'rgb(255, 255, 255)' }}>
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold" style={{ color: 'rgb(255, 255, 255)' }}>Your Life Events ({lifeEvents.length})</h3>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {lifeEvents.map((event, index) => (
                        <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg border border-white/20" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'rgb(255, 255, 255)' }}>
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate" style={{ color: 'rgb(255, 255, 255)' }}>{event.description}</p>
                            <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                              {event.date} • {event.category} • {event.importance} importance
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLifeEvent(event.id)}
                            className="flex-shrink-0 text-red-500 hover:text-red-700"
                            aria-label={`Remove life event: ${event.category} on ${event.date}`}
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
              <h2 className="text-3xl font-bold" style={{ color: 'rgb(255, 255, 255)' }}>BPHS-BTR Analysis in Progress</h2>
              <p className="text-lg" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Calculating your precise birth time using ancient Sanskrit mathematics...
              </p>
              
              <div className="space-y-4">
                <LoadingSpinner size="xl" />
                <div className="space-y-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
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
                  <h2 className="text-3xl font-bold" style={{ color: 'rgb(255, 255, 255)' }}>Your Cosmic Birth Moment Revealed</h2>
                  <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Your precise birth time has been calculated using ancient BPHS mathematics combined with your life events
                  </p>
                </motion.div>
              </div>

              {rectificationData && (
                <div className="space-y-6">
                  {/* Birth Time Comparison Display */}
                  <Card className="border-2 border-white/20 shadow-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'rgb(255, 255, 255)' }}>
                    <div className="text-center space-y-4">
                      <h3 className="text-2xl font-bold" style={{ color: 'rgb(255, 255, 255)' }}>Birth Time Rectification</h3>
                      
                      <div className="grid md:grid-cols-2 gap-6 mt-6">
                        <div className="rounded-lg p-4 border-2 border-white/20" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'rgb(255, 255, 255)' }}>
                          <p className="text-sm mb-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Original Birth Time</p>
                          <p className="text-2xl font-bold" style={{ color: 'rgb(255, 255, 255)' }}>
                            {birthData?.timeOfBirth ? formatTimeToHHMMSS(birthData.timeOfBirth) : 'Not provided'}
                          </p>
                        </div>
                        
                        <div className="rounded-lg p-4 border-2" style={{ borderColor: 'var(--divine-gold)', backgroundColor: 'rgba(255, 215, 0, 0.1)', color: 'rgb(255, 255, 255)' }}>
                          <p className="text-sm mb-2 font-semibold" style={{ color: 'var(--vedic-gold-dark, #DAB800)' }}>Rectified Birth Time</p>
                          <p className="text-2xl font-bold" style={{ color: 'var(--vedic-gold-dark, #DAB800)' }}>
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
                  <Card className="border-2 shadow-lg" style={{ borderColor: 'var(--divine-gold)', backgroundColor: 'rgba(255, 215, 0, 0.1)', color: 'rgb(255, 255, 255)' }}>
                    <div className="text-center space-y-6">
                      <h3 className="text-2xl font-bold" style={{ color: 'rgb(255, 255, 255)' }}>Rectification Confidence</h3>
                      
                      <div className="w-full rounded-full h-4 mt-4" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                        <div 
                          className="h-4 rounded-full transition-all duration-2000"
                          style={{ width: `${safeNumber(rectificationData?.confidence)}%`, backgroundColor: 'var(--vedic-gold)' }}
                        />
                      </div>
                      
                      <div className="text-3xl font-bold" style={{ color: 'var(--vedic-gold-dark, #DAB800)' }}>
                        {safeNumber(rectificationData?.confidence)}% Confidence
                      </div>
                    </div>
                  </Card>

                  {/* Action Cards */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="border-2 border-white/20 rounded-xl p-6 text-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'rgb(255, 255, 255)' }}>
                        <div className="flex justify-center mb-4">
                          <FaChartBar className="text-4xl" style={{ color: 'var(--vedic-saffron)' }} aria-hidden="true" />
                        </div>
                        <h4 className="font-semibold mb-2" style={{ color: 'rgb(255, 255, 255)' }}>Complete Astrology Analysis</h4>
                        <p className="text-sm mb-4" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          Use your rectified birth time for the most comprehensive Vedic astrology reading
                        </p>
                        <Button
                          variant="cosmic"
                          aria-label="Generate comprehensive astrology analysis with rectified birth time"
                          onClick={() => {
                            try {
                              // Get rectified time from rectification data
                              const rectifiedTime = rectificationData?.rectifiedTime || 
                                                    rectificationData?.analysis?.bestCandidate?.time;
                              
                              if (!rectifiedTime || !birthData) {
                                console.warn('⚠️ Missing rectified time or birth data, proceeding with original data');
                                navigate('/comprehensive-analysis');
                                return;
                              }
                              
                              // Format rectified time to HH:MM:SS format
                              const formattedRectifiedTime = formatTimeToHHMMSS(rectifiedTime);
                              
                              // Get current session to preserve coordinates
                              const currentSession = dataSaver.loadSession();
                              const coordinates = currentSession?.coordinates || currentSession?.currentSession?.coordinates || {};
                              
                              // Create updated birth data with rectified time
                              // Combine birth data with coordinates to ensure all required fields are present
                              const updatedBirthData = {
                                ...birthData,
                                timeOfBirth: formattedRectifiedTime,
                                // Ensure coordinates are included from session
                                latitude: birthData.latitude || coordinates.latitude || null,
                                longitude: birthData.longitude || coordinates.longitude || null,
                                timezone: birthData.timezone || coordinates.timezone || 'UTC'
                              };
                              
                              // Validate the updated birth data
                              const validationResult = dataInterpreter.validateInput(updatedBirthData);
                              
                              if (!validationResult?.isValid) {
                                console.error('❌ Birth data validation failed:', validationResult?.errors);
                                throw new Error(`Validation failed: ${validationResult?.errors?.join(', ') || 'Invalid birth data'}`);
                              }
                              
                              // Format birth data for API using formatForAPI
                              const formattedData = dataInterpreter.formatForAPI(validationResult.validatedData);
                              const apiFormattedData = formattedData.apiRequest || formattedData;
                              
                              // Create properly formatted birth data for storage
                              // This ensures the data structure matches what ComprehensiveAnalysisPage expects
                              const properlyFormattedBirthData = {
                                ...updatedBirthData,
                                // Override with API-formatted fields
                                ...apiFormattedData,
                                // Ensure timeOfBirth uses formatted rectified time
                                timeOfBirth: formattedRectifiedTime
                              };
                              
                              // Save updated birth data with proper formatting
                              dataSaver.saveSession({
                                ...currentSession,
                                birthData: properlyFormattedBirthData,
                                coordinates: {
                                  latitude: properlyFormattedBirthData.latitude,
                                  longitude: properlyFormattedBirthData.longitude,
                                  timezone: properlyFormattedBirthData.timezone || 'UTC'
                                },
                                rectificationData: rectificationData
                              });
                              
                              console.log('✅ Updated birth data with rectified time saved to UIDataSaver:', {
                                originalTime: birthData.timeOfBirth,
                                rectifiedTime: formattedRectifiedTime,
                                hasCoordinates: !!(properlyFormattedBirthData.latitude && properlyFormattedBirthData.longitude),
                                hasPlaceOfBirth: !!properlyFormattedBirthData.placeOfBirth,
                                hasTimezone: !!properlyFormattedBirthData.timezone,
                                dataStructure: Object.keys(properlyFormattedBirthData)
                              });
                              
                            } catch (error) {
                              console.error('❌ Error updating birth data for comprehensive analysis:', error);
                              // Still navigate even if save fails - let the API handle validation
                            }
                            
                            // Navigate to comprehensive analysis page
                            navigate('/comprehensive-analysis');
                          }}
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
                      <div className="border-2 border-white/20 rounded-xl p-6 text-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'rgb(255, 255, 255)' }}>
                        <div className="text-4xl mb-4">🔄</div>
                        <h4 className="font-semibold mb-2" style={{ color: 'rgb(255, 255, 255)' }}>Refine Further</h4>
                        <p className="text-sm mb-4" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
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
                          aria-label="Add more life events to improve rectification accuracy"
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
            aria-label="Refresh page to reload application"
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
            aria-label="Try again after error"
          >
            Try Again
          </Button>
          <Button 
            variant="cosmic"
            onClick={() => navigate('/')}
            aria-label="Navigate to home page to generate new chart"
          >
            Generate New Chart
          </Button>
        </div>
      </Alert>
    );
  }

  // Main Render - Production Grade
  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: 'rgb(0, 0, 0)', color: 'rgb(255, 255, 255)' }}>
      {/* White Saturn & Planetary Animations (Matching Chris Cole) */}
      <PlanetaryAnimations count={8} />
      
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
                    style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                    aria-label="Close error message"
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
                aria-label="Go to previous step in rectification process"
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
                      ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.2)'
                    }`}
                  />
                ))}
              </div>

              <Button
                variant="ghost"
                onClick={goToNextStep}
                disabled={!goToNextStep || loading}
                className="text-gray-600 hover:text-gray-900"
                aria-label="Go to next step in rectification process"
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
