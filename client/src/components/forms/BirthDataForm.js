import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../ui';
import geocodingService from '../../services/geocodingService';
import { debounce } from 'lodash';

const BirthDataForm = ({ onSubmit, isLoading }) => {
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
    mode: 'onBlur',
  });

  const placeOfBirthValue = watch('placeOfBirth');
  const [geocodingStatus, setGeocodingStatus] = useState('idle'); // idle, pending, success, error
  const [geocodingError, setGeocodingError] = useState(null);
  const [coordinates, setCoordinates] = useState(null);
  const [formattedAddress, setFormattedAddress] = useState(null);

  const debouncedGeocode = useCallback(
    debounce(async (place) => {
      if (place && place.length >= 3) {
        setGeocodingStatus('pending');
        setGeocodingError(null);
        try {
          const result = await geocodingService.geocodeLocation(place);
          if (result.success) {
            setCoordinates({
              latitude: result.latitude,
              longitude: result.longitude,
            });
            setFormattedAddress(result.formatted_address);
            setValue('latitude', result.latitude, { shouldValidate: true });
            setValue('longitude', result.longitude, { shouldValidate: true });
            if (result.timezone) {
              setValue('timezone', result.timezone, { shouldValidate: true });
            }
            setGeocodingStatus('success');
          } else {
            throw new Error(result.message || 'Location not found');
          }
        } catch (error) {
          setGeocodingStatus('error');
          setGeocodingError(error.message);
          setCoordinates(null);
          setFormattedAddress(null);
        }
      } else {
        setGeocodingStatus('idle');
        setCoordinates(null);
        setFormattedAddress(null);
        setGeocodingError(null);
      }
    }, 500),
    [setValue]
  );

  useEffect(() => {
    debouncedGeocode(placeOfBirthValue);
  }, [placeOfBirthValue, debouncedGeocode]);

  const handleFormSubmit = (data) => {
    if (geocodingStatus === 'success' && coordinates) {
      onSubmit(data);
    } else {
      setGeocodingError('Please enter a valid location and wait for coordinates to be found.');
    }
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <form id="birth-data-form" onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {hasErrors && (
        <div className="alert-error">
          Please fill out all required fields correctly.
        </div>
      )}

      {/* Full Name */}
      <div className="space-y-1">
        <label htmlFor="name" className="block text-sm font-medium text-earth-brown">
          Full Name:
        </label>
        <input
          type="text"
          id="name"
          name="name"
          className="input-vedic w-full"
          placeholder="Enter your full name"
          {...register('name', {
            required: 'Full name is required',
            minLength: { value: 2, message: 'Name must be at least 2 characters' }
          })}
        />
        {errors.name && (
          <p className="text-red-600 text-xs mt-1 flex items-center">
            <span className="mr-1">❌</span>
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Date of Birth */}
      <div className="space-y-1">
        <label htmlFor="dateOfBirth" className="block text-sm font-medium text-earth-brown">
          Date of Birth:
        </label>
        <input
          type="date"
          id="dateOfBirth"
          className="input-vedic w-full"
          {...register('dateOfBirth', {
            required: 'Date of birth is required',
            validate: value => {
              const birthDate = new Date(value);
              const today = new Date();
              if (birthDate >= today) {
                return 'Date of birth must be in the past';
              }
              if (birthDate.getFullYear() < 1900) {
                return 'Please enter a valid birth year';
              }
              return true;
            }
          })}
        />
        {errors.dateOfBirth && (
          <p className="text-red-600 text-xs mt-1 flex items-center">
            <span className="mr-1">❌</span>
            {errors.dateOfBirth.message}
          </p>
        )}
      </div>

      {/* Time of Birth */}
      <div className="space-y-1">
        <label htmlFor="timeOfBirth" className="block text-sm font-medium text-earth-brown">
          Time of Birth:
        </label>
        <input
          type="time"
          id="timeOfBirth"
          className="input-vedic w-full"
          {...register('timeOfBirth', { required: 'Time of birth is required' })}
        />
        {errors.timeOfBirth && (
          <p className="text-red-600 text-xs mt-1 flex items-center">
            <span className="mr-1">❌</span>
            {errors.timeOfBirth.message}
          </p>
        )}
      </div>

      {/* Place of Birth with Real-time Geocoding */}
      <div className="space-y-1">
        <label htmlFor="placeOfBirth" className="block text-sm font-medium text-earth-brown">
          Place of Birth (City, State, Country):
        </label>
        <div className="relative">
          <input
            type="text"
            id="placeOfBirth"
            placeholder="e.g., Mumbai, Maharashtra, India"
            className={`form-input-vedic pr-10 ${
              geocodingStatus === 'success' ? 'border-green-500' :
              geocodingStatus === 'error' ? 'border-red-500' :
              geocodingStatus === 'pending' ? 'border-blue-500' : ''
            }`}
            {...register('placeOfBirth', { required: 'Place of birth is required.' })}
          />
          {/* Status Icon */}
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {geocodingStatus === 'pending' && (
              <div className="animate-spin h-4 w-4 text-blue-500">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}
            {geocodingStatus === 'success' && (
              <span className="text-green-600">✅</span>
            )}
            {geocodingStatus === 'error' && (
              <span className="text-red-600">❌</span>
            )}
          </div>
        </div>

        {/* Enhanced Status Messages */}
        {geocodingStatus === 'pending' && (
          <div className="flex items-center text-xs mt-1 text-blue-600">
            <span className="mr-1">🔍</span>
            <span>Searching for location coordinates...</span>
          </div>
        )}
        {geocodingStatus === 'success' && coordinates && (
          <div className="space-y-1">
            <div className="flex items-center text-xs mt-1 text-green-600">
              <span className="mr-1">✅</span>
              <span>Location found and coordinates generated!</span>
            </div>
            <div className="text-xs text-gray-600 bg-green-50 p-2 rounded border space-y-1">
              {formattedAddress && (
                <div><strong>Address:</strong> {formattedAddress}</div>
              )}
              <div><strong>Coordinates:</strong> {coordinates.latitude.toFixed(4)}, {coordinates.longitude.toFixed(4)}</div>
            </div>
          </div>
        )}
        {geocodingStatus === 'error' && (
          <div className="space-y-1">
            <div className="flex items-center text-red-600 text-xs mt-1">
              <span className="mr-1">❌</span>
              <span>{geocodingError}</span>
            </div>
            <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded border">
              <strong>Tip:</strong> Try a more specific format like "City, State, Country" (e.g., "Mumbai, Maharashtra, India")
            </div>
          </div>
        )}
        {errors.placeOfBirth && (
          <p className="text-red-600 text-xs mt-1 flex items-center">
            <span className="mr-1">❌</span>
            {errors.placeOfBirth.message}
          </p>
        )}
      </div>

      {/* Hidden fields for latitude and longitude */}
      <input type="hidden" {...register('latitude', { required: 'Could not determine latitude.' })} />
      <input type="hidden" {...register('longitude', { required: 'Could not determine longitude.' })} />

      {/* Time Zone (Auto-suggested) */}
      <div className="space-y-1">
        <label htmlFor="timeZone" className="block text-sm font-medium text-earth-brown">
          Time Zone:
        </label>
        <select
          id="timeZone"
          className="input-vedic w-full"
          {...register('timezone', { required: 'Time zone is required' })}
        >
          <option value="">Select Time Zone</option>
          <option value="Asia/Kolkata">Asia/Kolkata (India)</option>
          <option value="+05:30">UTC+05:30 (India Standard Time)</option>
          <option value="UTC">UTC (Coordinated Universal Time)</option>
          <option value="-12:00">UTC-12:00 (Baker Island)</option>
          <option value="-11:00">UTC-11:00 (Niue)</option>
          <option value="-10:00">UTC-10:00 (Hawaii)</option>
          <option value="-09:00">UTC-09:00 (Alaska)</option>
          <option value="-08:00">UTC-08:00 (Pacific Time)</option>
          <option value="-07:00">UTC-07:00 (Mountain Time)</option>
          <option value="-06:00">UTC-06:00 (Central Time)</option>
          <option value="-05:00">UTC-05:00 (Eastern Time)</option>
          <option value="-04:00">UTC-04:00 (Atlantic Time)</option>
          <option value="-03:00">UTC-03:00 (Brazil)</option>
          <option value="-02:00">UTC-02:00 (Mid-Atlantic)</option>
          <option value="-01:00">UTC-01:00 (Azores)</option>
          <option value="+01:00">UTC+01:00 (Central European Time)</option>
          <option value="+02:00">UTC+02:00 (Eastern European Time)</option>
          <option value="+03:00">UTC+03:00 (Moscow Time)</option>
          <option value="+04:00">UTC+04:00 (Gulf Time)</option>
          <option value="+05:00">UTC+05:00 (Pakistan Time)</option>
          <option value="+06:00">UTC+06:00 (Bangladesh Time)</option>
          <option value="+07:00">UTC+07:00 (Thailand Time)</option>
          <option value="+08:00">UTC+08:00 (China Time)</option>
          <option value="+09:00">UTC+09:00 (Japan Time)</option>
          <option value="+10:00">UTC+10:00 (Australia Eastern Time)</option>
          <option value="+11:00">UTC+11:00 (Solomon Islands)</option>
          <option value="+12:00">UTC+12:00 (Fiji Time)</option>
        </select>
        {errors.timezone && (
          <p className="text-red-600 text-xs mt-1 flex items-center">
            <span className="mr-1">❌</span>
            {errors.timezone.message}
          </p>
        )}
      </div>

      {/* Gender (Optional) */}
      <div className="space-y-1">
        <label htmlFor="gender" className="block text-sm font-medium text-earth-brown">
          Gender (Optional):
        </label>
        <select
          id="gender"
          name="gender"
          className="input-vedic w-full"
          {...register('gender')}
        >
          <option value="">Select Gender (Optional)</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="pt-4">
        <Button
          type="submit"
          disabled={isLoading || geocodingStatus === 'pending'}
          loading={isLoading}
          variant="primary"
          size="lg"
          className="w-full"
        >
          {isLoading ? 'Generating Chart...' : 'Generate Chart'}
        </Button>
      </div>
    </form>
  );
};

export default BirthDataForm;
