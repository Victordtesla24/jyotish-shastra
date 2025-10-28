/**
 * BirthDataForm - Birth data input form with UIToAPIDataInterpreter integration
 * Production-ready component with comprehensive validation and error handling
 */

import React, { useState, useEffect } from 'react';
import geocodingService from '../../services/geocodingService';
import UIDataSaver from './UIDataSaver';
import UIToAPIDataInterpreter from './UIToAPIDataInterpreter';
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

  // Load saved session data on mount
  useEffect(() => {
    try {
      const savedSession = dataSaver.loadSession();
      if (savedSession && savedSession.birthData) {
        setFormData(prev => ({ ...prev, ...savedSession.birthData }));
        if (savedSession.coordinates) {
          setCoordinates(savedSession.coordinates);
        }
      }
    } catch (error) {
      console.error('Failed to load session data:', error);
      // Continue without saved data if loading fails
    }
  }, []);

  // Debounced geocoding
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.placeOfBirth && formData.placeOfBirth.length > 3) {
        geocodeLocation(formData.placeOfBirth);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [formData.placeOfBirth]);

  const geocodeLocation = async (location) => {
    setGeocoding(true);
    setLocationSuggestions([]);

    try {
      const result = await geocodingService.geocodeLocation(location);

      if (result.success) {
        setCoordinates({
          latitude: result.latitude,
          longitude: result.longitude,
          timezone: result.timezone
        });
        setErrors(prev => ({ ...prev, placeOfBirth: null }));

        // Save to session
        dataSaver.saveSession({
          birthData: formData,
          coordinates: {
            latitude: result.latitude,
            longitude: result.longitude,
            timezone: result.timezone
          }
        });
      } else {
        setLocationSuggestions(result.suggestions || []);
        setErrors(prev => ({
          ...prev,
          placeOfBirth: result.error || 'Location not found'
        }));
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      setErrors(prev => ({
        ...prev,
        placeOfBirth: 'Failed to geocode location'
      }));
    } finally {
      setGeocoding(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

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
      await onSubmit(requestBody);
      console.log('✅ BirthDataForm: onSubmit completed successfully');

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
      <form onSubmit={handleSubmit} className="form-vedic space-vedic" role="form">

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
                className={`form-input-vedic transition-all duration-300 pl-12 ${
                  errors.name ? 'border-red-400 bg-red-50/10' : 'focus:shadow-cosmic'
                }`}
              data-testid="name-input"
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
                className={`form-select-vedic transition-all duration-300 pl-12 ${
                  errors.gender ? 'border-red-400 bg-red-50/10' : 'focus:shadow-cosmic'
                }`}
                data-testid="gender-select"
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
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
                min="1900-01-01"
                max={new Date().toISOString().split('T')[0]}
                className={`form-input-vedic transition-all duration-300 pl-12 ${
                  errors.dateOfBirth ? 'border-red-400 bg-red-50/10' : 'focus:shadow-cosmic'
                }`}
                data-testid="dob-input"
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
                className={`form-input-vedic transition-all duration-300 pl-12 ${
                  errors.timeOfBirth ? 'border-red-400 bg-red-50/10' : 'focus:shadow-cosmic'
                }`}
                data-testid="time-input"
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
              className={`form-input-vedic transition-all duration-300 pl-12 ${
                errors.placeOfBirth ? 'border-red-400 bg-red-50/10' : 'focus:shadow-cosmic'
              }`}
              data-testid="place-input"
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
            disabled={loading || geocoding}
                className="btn-vedic btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            data-testid="generate-chart-button"
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
