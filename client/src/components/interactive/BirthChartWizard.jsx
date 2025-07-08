import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button, Input, Select } from '../ui';
import { VedicLoadingSpinner } from '../ui/loading/VedicLoadingSpinner';
import { SacredGeometry } from '../patterns/SacredGeometry';

const BirthChartWizard = ({ onComplete, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    timeOfBirth: '',
    placeOfBirth: '',
    latitude: '',
    longitude: '',
    timezone: ''
  });
  const [errors, setErrors] = useState({});
  const [suggestions, setSuggestions] = useState([]);

  const steps = [
    {
      id: 1,
      title: 'Personal Information',
      description: 'Tell us about yourself',
      icon: '👤'
    },
    {
      id: 2,
      title: 'Birth Date & Time',
      description: 'When were you born?',
      icon: '📅'
    },
    {
      id: 3,
      title: 'Birth Location',
      description: 'Where were you born?',
      icon: '🌍'
    },
    {
      id: 4,
      title: 'Confirmation',
      description: 'Review your details',
      icon: '✅'
    }
  ];

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!formData.name.trim()) {
          newErrors.name = 'Name is required';
        }
        break;
      case 2:
        if (!formData.dateOfBirth) {
          newErrors.dateOfBirth = 'Date of birth is required';
        }
        if (!formData.timeOfBirth) {
          newErrors.timeOfBirth = 'Time of birth is required';
        }
        break;
      case 3:
        if (!formData.placeOfBirth.trim()) {
          newErrors.placeOfBirth = 'Place of birth is required';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const searchLocation = async (query) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      // Real geocoding API integration - no mock data
      const response = await fetch(`/api/v1/geocoding/location?query=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      } else {
        console.error('Geocoding API error:', response.status);
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Error searching locations:', error);
      setSuggestions([]);
    }
  };

  const selectLocation = (location) => {
    setFormData(prev => ({
      ...prev,
      placeOfBirth: location.name,
      latitude: location.lat.toString(),
      longitude: location.lng.toString(),
      timezone: location.timezone
    }));
    setSuggestions([]);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await onComplete(formData);
    } catch (error) {
      console.error('Error generating chart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">👤</div>
              <h3 className="font-accent text-2xl text-earth-brown dark:text-dark-text-primary mb-2">
                Personal Information
              </h3>
              <p className="text-wisdom-gray dark:text-dark-text-secondary">
                Let's start with your basic details
              </p>
            </div>

            <Input
              label="Full Name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              error={errors.name}
              placeholder="Enter your full name"
              className="text-lg"
              required
            />

            <div className="bg-gradient-to-r from-cosmic-purple/10 to-stellar-blue/10 dark:from-cosmic-purple/20 dark:to-stellar-blue/20 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">💡</span>
                <div>
                  <h4 className="font-medium text-earth-brown dark:text-dark-text-primary mb-1">
                    Why do we need your name?
                  </h4>
                  <p className="text-sm text-wisdom-gray dark:text-dark-text-secondary">
                    Your name helps us personalize your astrological analysis and creates a more meaningful connection to your cosmic profile.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="font-accent text-2xl text-earth-brown dark:text-dark-text-primary mb-2">
                Birth Date & Time
              </h3>
              <p className="text-wisdom-gray dark:text-dark-text-secondary">
                Precise timing is crucial for accurate predictions
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Date of Birth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                error={errors.dateOfBirth}
                required
              />

              <Input
                label="Time of Birth"
                type="time"
                value={formData.timeOfBirth}
                onChange={(e) => handleInputChange('timeOfBirth', e.target.value)}
                error={errors.timeOfBirth}
                step="60"
                required
              />
            </div>

            <div className="bg-gradient-to-r from-solar-orange/10 to-vedic-gold/10 dark:from-solar-orange/20 dark:to-vedic-gold/20 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">⏰</span>
                <div>
                  <h4 className="font-medium text-earth-brown dark:text-dark-text-primary mb-1">
                    Importance of Accurate Time
                  </h4>
                  <p className="text-sm text-wisdom-gray dark:text-dark-text-secondary">
                    Even a 4-minute difference can change your rising sign (Lagna), which significantly affects your entire chart interpretation.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🌍</div>
              <h3 className="font-accent text-2xl text-earth-brown dark:text-dark-text-primary mb-2">
                Birth Location
              </h3>
              <p className="text-wisdom-gray dark:text-dark-text-secondary">
                Your geographical coordinates at birth
              </p>
            </div>

            <div className="relative">
              <Input
                label="Place of Birth"
                value={formData.placeOfBirth}
                onChange={(e) => {
                  handleInputChange('placeOfBirth', e.target.value);
                  searchLocation(e.target.value);
                }}
                error={errors.placeOfBirth}
                placeholder="Start typing your birth city..."
                required
              />

              {suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute z-10 w-full mt-1 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg shadow-cosmic max-h-48 overflow-y-auto"
                >
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => selectLocation(suggestion)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-dark-border transition-colors border-b border-gray-100 dark:border-dark-border last:border-b-0"
                    >
                      <div className="font-medium text-earth-brown dark:text-dark-text-primary">
                        {suggestion.name}
                      </div>
                      <div className="text-sm text-wisdom-gray dark:text-dark-text-secondary">
                        {suggestion.lat.toFixed(4)}, {suggestion.lng.toFixed(4)}
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </div>

            {formData.latitude && formData.longitude && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Latitude"
                  value={formData.latitude}
                  onChange={(e) => handleInputChange('latitude', e.target.value)}
                  placeholder="e.g., 28.6139"
                  readonly
                />
                <Input
                  label="Longitude"
                  value={formData.longitude}
                  onChange={(e) => handleInputChange('longitude', e.target.value)}
                  placeholder="e.g., 77.2090"
                  readonly
                />
                <Input
                  label="Timezone"
                  value={formData.timezone}
                  onChange={(e) => handleInputChange('timezone', e.target.value)}
                  placeholder="e.g., +05:30"
                  readonly
                />
              </div>
            )}

            <div className="bg-gradient-to-r from-vedic-maroon/10 to-cosmic-purple/10 dark:from-vedic-maroon/20 dark:to-cosmic-purple/20 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">🗺️</span>
                <div>
                  <h4 className="font-medium text-earth-brown dark:text-dark-text-primary mb-1">
                    Location Precision
                  </h4>
                  <p className="text-sm text-wisdom-gray dark:text-dark-text-secondary">
                    We use your birth coordinates to calculate the exact planetary positions and house cusps for your location.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="font-accent text-2xl text-earth-brown dark:text-dark-text-primary mb-2">
                Confirmation
              </h3>
              <p className="text-wisdom-gray dark:text-dark-text-secondary">
                Please review your birth details before generating your chart
              </p>
            </div>

            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-dark-border">
                  <span className="font-medium text-wisdom-gray dark:text-dark-text-secondary">Name:</span>
                  <span className="text-earth-brown dark:text-dark-text-primary">{formData.name}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-dark-border">
                  <span className="font-medium text-wisdom-gray dark:text-dark-text-secondary">Date:</span>
                  <span className="text-earth-brown dark:text-dark-text-primary">
                    {new Date(formData.dateOfBirth).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-dark-border">
                  <span className="font-medium text-wisdom-gray dark:text-dark-text-secondary">Time:</span>
                  <span className="text-earth-brown dark:text-dark-text-primary">{formData.timeOfBirth}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="font-medium text-wisdom-gray dark:text-dark-text-secondary">Place:</span>
                  <span className="text-earth-brown dark:text-dark-text-primary">{formData.placeOfBirth}</span>
                </div>
              </div>
            </Card>

            <div className="bg-gradient-to-r from-vedic-gold/10 to-solar-orange/10 dark:from-vedic-gold/20 dark:to-solar-orange/20 rounded-lg p-6 text-center">
              <div className="text-4xl mb-3">🔮</div>
              <h4 className="font-accent text-lg text-earth-brown dark:text-dark-text-primary mb-2">
                Ready to Unlock Your Cosmic Blueprint?
              </h4>
              <p className="text-wisdom-gray dark:text-dark-text-secondary">
                Your personalized Vedic birth chart will reveal the secrets of your destiny, personality, and life path.
              </p>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-dark-surface rounded-2xl shadow-cosmic max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5 dark:opacity-10">
          <SacredGeometry pattern="mandala" size={400} />
        </div>

        {/* Header */}
        <div className="relative p-6 border-b border-gray-100 dark:border-dark-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-accent text-2xl text-earth-brown dark:text-dark-text-primary">
                Birth Chart Calculator
              </h2>
              <p className="text-wisdom-gray dark:text-dark-text-secondary mt-1">
                Step {currentStep} of {steps.length}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-dark-border rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-wisdom-gray dark:text-dark-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      currentStep >= step.id
                        ? 'bg-cosmic-purple text-white'
                        : 'bg-gray-200 dark:bg-dark-border text-wisdom-gray dark:text-dark-text-secondary'
                    }`}
                  >
                    {currentStep > step.id ? '✓' : step.id}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-2 rounded transition-colors ${
                        currentStep > step.id
                          ? 'bg-cosmic-purple'
                          : 'bg-gray-200 dark:bg-dark-border'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative p-6">
          <AnimatePresence mode="wait">
            {renderStepContent()}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="relative p-6 border-t border-gray-100 dark:border-dark-border">
          <div className="flex justify-between">
            <Button
              variant="secondary"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="min-w-[100px]"
            >
              Previous
            </Button>

            <Button
              variant="cosmic"
              onClick={handleNext}
              disabled={isLoading}
              className="min-w-[100px] flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <VedicLoadingSpinner size="small" />
                  <span>Generating...</span>
                </>
              ) : (
                <span>{currentStep === steps.length ? 'Generate Chart' : 'Next'}</span>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BirthChartWizard;
