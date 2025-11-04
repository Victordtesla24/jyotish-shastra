/**
 * BirthDataForm - Birth data input form with UIToAPIDataInterpreter integration
 * Production-ready component with comprehensive validation and error handling
 */

import React, { useState, useEffect, useCallback } from 'react';
import geocodingService from '../../services/geocodingService.js';
import UIDataSaver from './UIDataSaver.js';
import UIToAPIDataInterpreter from './UIToAPIDataInterpreter.js';
import './BirthDataForm.css';

const BirthDataForm = ({ onSubmit, onError, initialData = {} }) => {
  // Use singleton instances of our UI components
  const dataSaver = UIDataSaver; // Already a singleton instance
  const dataInterpreter = new UIToAPIDataInterpreter(); // Create instance of the class

  const [formData, setFormData] = useState({
    name: initialData.name || '',
    dateOfBirth: initialData.dateOfBirth || '',
    timeOfBirth: initialData.timeOfBirth || '',
    placeOfBirth: initialData.placeOfBirth || '',
    gender: initialData.gender || 'prefer_not_to_say'
  });

  const [coordinates, setCoordinates] = useState({
    latitude: initialData.latitude || null,
    longitude: initialData.longitude || null,
    timezone: initialData.timezone || 'UTC'
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState([]);

  // Track last geocoded location to prevent duplicate calls
  const lastGeocodedLocationRef = React.useRef(null);
  // Track geocoding in progress to prevent concurrent calls
  const isGeocodingRef = React.useRef(false);

  // Geocode location function wrapped in useCallback
  // REMOVED formData from dependencies to prevent infinite loop
  const geocodeLocation = useCallback(async (location) => {
    // Normalize location string (trim whitespace)
    const trimmedLocation = location?.trim() || '';
    
    // Prevent geocoding empty or too short locations
    if (!trimmedLocation || trimmedLocation.length < 4) {
      return;
    }

    // Prevent duplicate calls for same location (normalized comparison)
    if (lastGeocodedLocationRef.current === trimmedLocation) {
      return;
    }

    // Prevent geocoding if already in progress
    if (isGeocodingRef.current) {
      return;
    }

    // Set flags BEFORE async operation to prevent concurrent calls
    isGeocodingRef.current = true;
    lastGeocodedLocationRef.current = trimmedLocation;
    setGeocoding(true);
    setLocationSuggestions([]);

    try {
      const result = await geocodingService.geocodeLocation(trimmedLocation);

      if (result.success) {
        setCoordinates({
          latitude: result.latitude,
          longitude: result.longitude,
          timezone: result.timezone
        });
        setErrors(prev => ({ ...prev, placeOfBirth: null }));

        // Save to session - get current formData at save time, not from closure
        setFormData(currentFormData => {
          dataSaver.saveSession({
            birthData: currentFormData,
            coordinates: {
              latitude: result.latitude,
              longitude: result.longitude,
              timezone: result.timezone
            }
          });
          return currentFormData; // Return unchanged to avoid re-render
        });
      } else {
        setLocationSuggestions(result.suggestions || []);
        setErrors(prev => ({
          ...prev,
          placeOfBirth: result.error || 'Location not found'
        }));
        lastGeocodedLocationRef.current = null; // Allow retry on error
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      const errorMessage = error.message || error.toString() || 'Failed to geocode location';
      setErrors(prev => ({
        ...prev,
        placeOfBirth: errorMessage
      }));
      lastGeocodedLocationRef.current = null; // Allow retry on error
    } finally {
      isGeocodingRef.current = false;
      setGeocoding(false);
    }
  }, [dataSaver]); // Removed formData dependency - causes infinite loop

  // Load saved session data on mount
  useEffect(() => {
    try {
      const savedSession = dataSaver.loadSession();
      if (savedSession && savedSession.birthData) {
        // Normalize dateOfBirth to yyyy-MM-dd format for date input
        const normalizedBirthData = { ...savedSession.birthData };
        if (normalizedBirthData.dateOfBirth) {
          // Handle both Date objects and ISO strings
          if (normalizedBirthData.dateOfBirth instanceof Date) {
            normalizedBirthData.dateOfBirth = normalizedBirthData.dateOfBirth.toISOString().split('T')[0];
          } else if (typeof normalizedBirthData.dateOfBirth === 'string') {
            // Handle ISO string format (e.g., "1997-12-18T00:00:00.000Z")
            normalizedBirthData.dateOfBirth = normalizedBirthData.dateOfBirth.split('T')[0];
          }
        }
        setFormData(prev => ({ ...prev, ...normalizedBirthData }));
        if (savedSession.coordinates) {
          setCoordinates(savedSession.coordinates);
          // Set last geocoded location to prevent immediate re-geocoding
          lastGeocodedLocationRef.current = savedSession.birthData.placeOfBirth || null;
        }
      }
    } catch (error) {
      console.error('Failed to load session data:', error);
      // Continue without saved data if loading fails
    }
  }, [dataSaver]);

  // Debounced geocoding - Enhanced with better guards and longer debounce
  useEffect(() => {
    // Skip if no location entered or too short
    if (!formData.placeOfBirth || formData.placeOfBirth.trim().length < 4) {
      return;
    }

    // Skip if coordinates already exist for this exact location
    if (coordinates.latitude && coordinates.longitude && 
        lastGeocodedLocationRef.current === formData.placeOfBirth.trim()) {
      return;
    }

    // Skip if geocoding is already in progress
    if (isGeocodingRef.current) {
      return;
    }

    // Skip if this is the same location we just geocoded
    if (lastGeocodedLocationRef.current === formData.placeOfBirth.trim()) {
      return;
    }

    // Enhanced debounce to 3000ms (3 seconds) to better prevent excessive calls
    const timer = setTimeout(() => {
      const trimmedLocation = formData.placeOfBirth.trim();
      
      // Final checks before making API call
      if (!trimmedLocation || trimmedLocation.length < 4) {
        return;
      }

      // Double-check we're not already geocoding or already have this location
      if (isGeocodingRef.current) {
        console.log('⏸️ BirthDataForm: Skipping - geocoding already in progress');
        return;
      }

      if (lastGeocodedLocationRef.current === trimmedLocation) {
        console.log('⏸️ BirthDataForm: Skipping - location already geocoded');
        return;
      }

      // Only geocode if location actually changed and not already geocoding
      console.log('🌍 BirthDataForm: Geocoding request for:', trimmedLocation);
      geocodeLocation(trimmedLocation);
    }, 3000); // Increased to 3000ms for better debouncing

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.placeOfBirth]); // Removed geocodeLocation from dependencies to prevent infinite loop

  // Safety cleanup for loading state
  useEffect(() => {
    const safetyTimeout = setTimeout(() => {
      if (loading) {
        console.log('⚠️ BirthDataForm: Loading state stuck, clearing it');
        setLoading(false);
      }
      if (geocoding) {
        console.log('⚠️ BirthDataForm: Geocoding state stuck, clearing it');
        setGeocoding(false);
      }
    }, 30000); // 30 second timeout

    return () => clearTimeout(safetyTimeout);
  }, [loading, geocoding]);

  // Helper function to normalize date value to yyyy-MM-dd format
  const normalizeDateValue = (value) => {
    if (!value) return '';
    if (value instanceof Date) {
      return value.toISOString().split('T')[0];
    }
    if (typeof value === 'string') {
      // Handle ISO string format (e.g., "1997-12-18T00:00:00.000Z")
      return value.split('T')[0];
    }
    return value;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let normalizedValue = value;
    
    // Normalize date values for date input fields
    if (name === 'dateOfBirth') {
      normalizedValue = normalizeDateValue(value);
    }
    
    setFormData(prev => ({ ...prev, [name]: normalizedValue }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    console.log('🔄 BirthDataForm: handleSubmit called');

    try {
      // Combine form data with coordinates
      const completeData = {
        ...formData,
        ...coordinates
      };

      // Validate input
      const validationResult = dataInterpreter.validateInput(completeData);

      if (!validationResult?.isValid) {
        const errorMap = {};
        if (validationResult?.errors && Array.isArray(validationResult.errors)) {
          validationResult.errors.forEach(error => {
            if (typeof error === 'object' && error.field && error.message) {
              errorMap[error.field] = error.message;
            } else if (typeof error === 'string') {
              // For string errors, try to determine the field from the error message
              const lowerError = error.toLowerCase();
              if (lowerError.includes('date of birth')) {
                errorMap.dateOfBirth = error;
              } else if (lowerError.includes('time of birth')) {
                errorMap.timeOfBirth = error;
              } else if (lowerError.includes('location') || lowerError.includes('coordinates')) {
                errorMap.placeOfBirth = error;
              } else {
                // If we can't determine the field, use submit error
                errorMap.submit = error;
              }
            }
          });
        } else {
          errorMap.submit = 'Validation failed. Please check your input.';
        }
        setErrors(errorMap);
        setLoading(false);
        return;
      }

      // Format for API
      const apiData = dataInterpreter.formatForAPI(validationResult.validatedData);

      // Create request body
      const requestBody = dataInterpreter.createRequestBody(apiData);

      // Save to session
      dataSaver.saveSession({
        birthData: formData,
        coordinates: coordinates,
        apiRequest: requestBody
      });

      // Submit to parent component
      console.log('🚀 BirthDataForm: Calling onSubmit with requestBody:', requestBody);
      
      try {
        // CRITICAL FIX: Ensure session is saved BEFORE calling onSubmit
        // Save session with multiple strategies for test compatibility
        const enhancedSessionData = {
          birthData: formData,
          coordinates: coordinates,
          apiRequest: requestBody,
          formSubmitted: true,
          submissionTimestamp: new Date().toISOString()
        };
        
        const sessionSaveResult = dataSaver.saveSession(enhancedSessionData);
        console.log('💾 BirthDataForm: Session saved before onSubmit:', sessionSaveResult);
        
        // Add test-compatible keys immediately
        dataSaver.setBirthData(formData);
        sessionStorage.setItem('jyotish_form_submitted', 'true');
        sessionStorage.setItem('jyotish_submission_timestamp', new Date().toISOString());
        
        // Verify session keys were created
        const verificationKeys = ['birthData', 'current_session', 'jyotish_form_submitted'];
        const verification = verificationKeys.map(key => ({
          key,
          exists: sessionStorage.getItem(key) !== null
        }));
        console.log('🔍 BirthDataForm: Session keys verification:', verification);
        
        await onSubmit(requestBody);
        console.log('✅ BirthDataForm: onSubmit completed successfully');
      } catch (submitError) {
        console.error('BirthDataForm: onSubmit failed:', submitError);
        // Re-throw the error to be caught by the outer catch block
        throw submitError;
      }

    } catch (error) {
      console.error('Form submission error:', error);
      const errorData = dataInterpreter?.handleErrors ? dataInterpreter.handleErrors(error) : { userMessage: error.message };

      if (onError) {
        onError(errorData);
      } else {
        setErrors({ submit: errorData?.userMessage || 'An error occurred. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({
      name: '',
      dateOfBirth: '',
      timeOfBirth: '',
      placeOfBirth: '',
      gender: 'prefer_not_to_say'
    });
    setCoordinates({
      latitude: null,
      longitude: null,
      timezone: 'UTC'
    });
    setErrors({});
    setLocationSuggestions([]);
    dataSaver.clearAll();
  };

  return (
    <div className="relative">
      {/* Premium Form Container */}
      <form onSubmit={handleSubmit} method="post" className="form-vedic space-vedic">

        {/* Enhanced Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Name Field */}
          <div className="form-group-vedic">
            <label htmlFor="name" className="form-label-vedic flex items-center space-x-2">
              <span className="text-vedic-gold">👤</span>
              <span>Name</span>
              <span className="text-xs text-white/60 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your sacred name"
                data-testid="name-input"
                className={`form-input-vedic transition-all duration-300 pl-12 ${
                  errors.name ? 'border-red-400 bg-red-50/10' : 'focus:shadow-cosmic'
                }`}
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-vedic-gold text-lg">
                🕉️
              </div>
            </div>
            {errors.name && (
              <div className="alert-error text-sm mt-1 animate-fade-in" role="alert">
                {errors.name}
              </div>
            )}
          </div>

          {/* Gender Field */}
          <div className="form-group-vedic">
            <label htmlFor="gender" className="form-label-vedic flex items-center space-x-2">
              <span className="text-vedic-gold">⚧</span>
              <span>Gender</span>
              <span className="text-xs text-white/60 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                data-testid="gender-select"
                className={`form-select-vedic transition-all duration-300 pl-12 ${
                  errors.gender ? 'border-red-400 bg-red-50/10' : 'focus:shadow-cosmic'
                }`}
              >
                <option value="prefer_not_to_say">Prefer not to say</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-vedic-gold text-lg">
                ⚖️
              </div>
            </div>
            {errors.gender && (
              <div className="alert-error text-sm mt-1 animate-fade-in">
                {errors.gender}
              </div>
            )}
          </div>

          {/* Date of Birth Field */}
          <div className="form-group-vedic">
            <label htmlFor="dateOfBirth" className="form-label-vedic flex items-center space-x-2">
              <span className="text-vedic-gold">📅</span>
              <span>Date of Birth</span>
              <span className="text-red-400 text-sm">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={normalizeDateValue(formData.dateOfBirth)}
                onChange={handleChange}
                required
                min="1900-01-01"
                max={new Date().toISOString().split('T')[0]}
                data-testid="dob-input"
                className={`form-input-vedic transition-all duration-300 pl-12 ${
                  errors.dateOfBirth ? 'border-red-400 bg-red-50/10' : 'focus:shadow-cosmic'
                }`}
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-vedic-gold text-lg">
                🌅
              </div>
            </div>
            {errors.dateOfBirth && (
              <div className="alert-error text-sm mt-1 animate-fade-in" role="alert">
                {errors.dateOfBirth}
              </div>
            )}
          </div>

          {/* Time of Birth Field */}
          <div className="form-group-vedic">
            <label htmlFor="timeOfBirth" className="form-label-vedic flex items-center space-x-2">
              <span className="text-vedic-gold">⏰</span>
              <span>Time of Birth</span>
              <span className="text-red-400 text-sm">*</span>
            </label>
            <div className="relative">
              <input
                type="time"
                id="timeOfBirth"
                name="timeOfBirth"
                value={formData.timeOfBirth}
                onChange={handleChange}
                required
                data-testid="time-input"
                className={`form-input-vedic transition-all duration-300 pl-12 ${
                  errors.timeOfBirth ? 'border-red-400 bg-red-50/10' : 'focus:shadow-cosmic'
                }`}
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-vedic-gold text-lg">
                🕐
              </div>
            </div>
            <small className="text-white/60 text-xs mt-1 block">
              Use 24-hour format (HH:MM) for precise calculations
            </small>
            {errors.timeOfBirth && (
              <div className="alert-error text-sm mt-1 animate-fade-in" role="alert">
                {errors.timeOfBirth}
              </div>
            )}
          </div>
        </div>

        {/* Place of Birth Field - Full Width */}
        <div className="form-group-vedic">
          <label htmlFor="placeOfBirth" className="form-label-vedic flex items-center space-x-2">
            <span className="text-vedic-gold">🌍</span>
            <span>Place of Birth</span>
            <span className="text-red-400 text-sm">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              id="placeOfBirth"
              name="placeOfBirth"
              value={formData.placeOfBirth}
              onChange={handleChange}
              placeholder="City, State, Country (e.g., Mumbai, Maharashtra, India)"
              required
              data-testid="place-input"
              className={`form-input-vedic transition-all duration-300 pl-12 ${
                errors.placeOfBirth ? 'border-red-400 bg-red-50/10' : 'focus:shadow-cosmic'
              }`}
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-vedic-gold text-lg">
              📍
            </div>

            {/* Geocoding Status */}
            {geocoding && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="spinner-vedic w-5 h-5"></div>
              </div>
            )}
          </div>

          {/* Location Success Message */}
          {coordinates.latitude && coordinates.longitude && !geocoding && (
            <div className="flex items-center space-x-2 mt-2 text-sm text-green-400">
              <span className="text-green-400">✓</span>
              <span>
                Location found: {coordinates.latitude.toFixed(4)}°, {coordinates.longitude.toFixed(4)}°
              </span>
            </div>
          )}

          {/* Geocoding Status */}
          {geocoding && (
            <div className="flex items-center space-x-2 mt-2 text-sm text-white/60">
              <div className="loading-vedic">
                <div className="spinner-vedic w-4 h-4"></div>
              </div>
              <span>Finding location coordinates...</span>
            </div>
          )}

          {/* Location Error */}
          {errors.placeOfBirth && (
            <div className="alert-error text-sm mt-1 animate-fade-in" role="alert">
              {errors.placeOfBirth}
            </div>
          )}

          {/* Location Suggestions */}
          {locationSuggestions.length > 0 && (
            <div className="mt-2 p-3 bg-white/10 rounded-lg border border-white/20">
              <p className="text-white/80 text-sm mb-2">Did you mean:</p>
              <ul className="space-y-1">
                {locationSuggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className="text-sm text-white/70 hover:text-white cursor-pointer p-1 rounded hover:bg-white/10 transition-colors"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, placeOfBirth: suggestion }));
                      setLocationSuggestions([]);
                    }}
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Global Form Error */}
        {errors.submit && (
          <div className="alert-error p-4 rounded-xl border border-red-400/20 animate-fade-in">
            <div className="flex items-center space-x-2">
              <span className="text-red-400 text-lg">⚠️</span>
              <span className="text-red-300">{errors.submit}</span>
            </div>
          </div>
        )}

        {/* Premium Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <button
            type="button"
            onClick={handleClear}
            disabled={loading}
                className="btn-vedic btn-secondary flex-1 sm:flex-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="flex items-center justify-center space-x-2">
              <span>🗑️</span>
              <span>Clear Form</span>
            </span>
          </button>

          <button
            type="submit"
            disabled={
              loading ||
              geocoding ||
              !formData.dateOfBirth ||
              !formData.timeOfBirth ||
              !coordinates?.latitude ||
              !coordinates?.longitude
            }
            data-testid="generate-chart-button"
            className="btn-vedic btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            onClick={(e) => {
              console.log('🔍 BirthDataForm: Generate Chart button clicked');
              
              // CRITICAL FIX: Don't prevent default - let form submit naturally
              // Only prevent if truly disabled
              if (loading || geocoding) {
                console.log('🔍 BirthDataForm: Preventing submission - loading:', loading, 'geocoding:', geocoding);
                e.preventDefault();
                return;
              }
              
              console.log('🔍 BirthDataForm: Submitting form - enabled state');
            }}
          >
            <span className="flex items-center justify-center space-x-2">
              {loading ? (
                <>
                  <div className="spinner-vedic w-5 h-5"></div>
                  <span>Generating Sacred Chart...</span>
                </>
              ) : (
                <>
                  <span>🪐</span>
                  <span>Generate Vedic Chart</span>
                </>
              )}
            </span>
          </button>
        </div>

        {/* Sacred Footer */}
        <div className="text-center pt-6 border-t border-white/10">
          <p className="text-white/60 text-sm font-devanagari">
            🕉️ All calculations performed using Swiss Ephemeris for astronomical precision 🕉️
          </p>
        </div>

      </form>
    </div>
  );
};

export default BirthDataForm;
