/**
 * LocationAutoComplete Component
 * Auto-complete location input with geocoding API integration
 * Provides location suggestions and automatic timezone detection
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaMapMarkerAlt, FaSpinner } from 'react-icons/fa';
import geocodingService from '../../services/geocodingService.js';
import '../../styles/vedic-design-system.css';

const LocationAutoComplete = ({
  value = '',
  onChange,
  onLocationSelect,
  placeholder = 'City, State, Country',
  className = '',
  required = false,
  disabled = false,
  error = null,
  showSuggestions = true,
  debounceMs = 300
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [errorMessage, setErrorMessage] = useState(null);

  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const debounceTimerRef = useRef(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    setErrorMessage(error);
  }, [error]);

  const fetchSuggestions = useCallback(async (query) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await geocodingService.geocodeLocation(query);
      
      if (result && result.latitude && result.longitude) {
        const suggestion = {
          display: query,
          latitude: result.latitude,
          longitude: result.longitude,
          timezone: result.timezone || 'UTC',
          formatted: result.formatted || query
        };
        
        setSuggestions([suggestion]);
        setIsOpen(true);
      } else {
        setSuggestions([]);
        setIsOpen(false);
      }
    } catch (error) {
      console.error('LocationAutoComplete: Geocoding error:', error);
      setErrorMessage('Unable to fetch location suggestions. Please try again or enter manually.');
      setSuggestions([]);
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setSelectedIndex(-1);
    setErrorMessage(null);

    if (onChange) {
      onChange(newValue);
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (showSuggestions && newValue.length >= 3) {
        fetchSuggestions(newValue);
      } else {
        setSuggestions([]);
        setIsOpen(false);
      }
    }, debounceMs);
  };

  const handleSuggestionSelect = (suggestion) => {
    setInputValue(suggestion.formatted || suggestion.display);
    setSuggestions([]);
    setIsOpen(false);
    setSelectedIndex(-1);

    if (onLocationSelect) {
      onLocationSelect({
        placeOfBirth: suggestion.formatted || suggestion.display,
        latitude: suggestion.latitude,
        longitude: suggestion.longitude,
        timezone: suggestion.timezone
      });
    }

    if (onChange) {
      onChange(suggestion.formatted || suggestion.display);
    }
  };

  const handleKeyDown = (e) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
      default:
        break;
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      setIsOpen(false);
      setSelectedIndex(-1);
    }, 200);
  };

  const handleFocus = () => {
    if (suggestions.length > 0) {
      setIsOpen(true);
    }
  };

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FaMapMarkerAlt 
            className="text-vedic-saffron" 
            style={{ color: 'var(--vedic-saffron)' }}
            aria-hidden="true"
          />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          role="combobox"
          className={`form-input-vedic pl-10 pr-10 ${errorMessage || error ? 'border-red-500' : ''}`}
          style={{
            paddingLeft: '2.5rem',
            paddingRight: isLoading ? '2.5rem' : '1rem'
          }}
          aria-invalid={errorMessage || error ? 'true' : 'false'}
          aria-describedby={errorMessage || error ? 'location-error' : undefined}
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls="location-suggestions"
        />
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <FaSpinner 
              className="animate-spin text-vedic-saffron" 
              style={{ color: 'var(--vedic-saffron)' }}
              aria-hidden="true"
            />
          </div>
        )}
      </div>

      {(errorMessage || error) && (
        <p 
          id="location-error"
          className="mt-1 text-sm text-red-600"
          role="alert"
          aria-live="polite"
        >
          {errorMessage || error}
        </p>
      )}

      {isOpen && suggestions.length > 0 && (
        <ul
          id="location-suggestions"
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-black/95 border border-white/20 rounded-lg shadow-lg max-h-60 overflow-auto backdrop-blur-sm"
          role="listbox"
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              role="option"
              aria-selected={selectedIndex === index}
              className={`px-4 py-2 cursor-pointer text-white hover:bg-white/10 ${
                selectedIndex === index ? 'bg-white/10' : ''
              }`}
              style={{
                backgroundColor: selectedIndex === index 
                  ? 'rgba(255, 255, 255, 0.1)' 
                  : 'transparent'
              }}
              onMouseDown={() => handleSuggestionSelect(suggestion)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="flex items-center">
                <FaMapMarkerAlt 
                  className="mr-2" 
                  style={{ color: 'rgb(255, 255, 255)' }}
                  aria-hidden="true"
                />
                <span className="text-white">{suggestion.formatted || suggestion.display}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LocationAutoComplete;

