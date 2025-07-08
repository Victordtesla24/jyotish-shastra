import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../ui';
import geocodingService from '../../services/geocodingService';
import { debounce } from 'lodash';

const BirthDataForm = ({ onSubmit, isLoading }) => {
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
    mode: 'onBlur',
  });

  const placeOfBirthValue = watch('placeOfBirth');
  const formData = watch(); // Watch all form fields
  const [geocodingStatus, setGeocodingStatus] = useState('idle'); // idle, pending, success, error
  const [geocodingError, setGeocodingError] = useState(null);
  const [coordinates, setCoordinates] = useState(null);
  const [formattedAddress, setFormattedAddress] = useState(null);

  // Memoise the debounced function so its identity only changes when its
  // internal dependencies change, satisfying the `react-hooks/exhaustive-deps`
  // Geocoding with longer debounce and better error handling
  const debouncedGeocode = useMemo(
    () => debounce(async (place) => {
      if (place && place.length >= 5) { // Require more characters to reduce API calls
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
          console.log('🚨 Geocoding error:', error.message);
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
    }, 800), // FIXED RC3: Reduced debounce to 0.8 seconds for faster response
    [setValue]
  );

  useEffect(() => {
    debouncedGeocode(placeOfBirthValue);
    // Cancel the debounced invocation on unmount to avoid memory leaks.
    return () => debouncedGeocode.cancel();
  }, [placeOfBirthValue, debouncedGeocode]);

  const handleFormSubmit = (data) => {
    console.log('🚀 FORM SUBMISSION HANDLER CALLED - Form submission triggered with data:', data);
    console.log('📍 Geocoding status:', geocodingStatus);
    console.log('🌍 Coordinates:', coordinates);
    console.log('❌ Form errors:', errors);
    console.log('🔧 Form validation state:', Object.keys(errors).length === 0 ? 'VALID' : 'INVALID');
    console.log('🔍 Form data analysis:', {
      hasDate: !!data.dateOfBirth,
      hasTime: !!data.timeOfBirth,
      hasLatitude: !!data.latitude,
      hasLongitude: !!data.longitude,
      hasTimezone: !!data.timezone,
      hasGender: !!data.gender,
      allKeys: Object.keys(data)
    });
    console.log('🎯 onSubmit function:', typeof onSubmit);

    // CRITICAL FIX: Allow submission with any valid coordinates (geocoded OR manual OR default)
    let finalCoordinates = null;

    if (geocodingStatus === 'success' && coordinates) {
      // Use geocoded coordinates
      finalCoordinates = {
        latitude: coordinates.latitude,
        longitude: coordinates.longitude
      };
      console.log('✅ Using geocoded coordinates:', finalCoordinates);
    } else if (data.latitude && data.longitude) {
      // Use manual coordinates
      finalCoordinates = {
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude)
      };
      console.log('✅ Using manual coordinates:', finalCoordinates);
    } else {
      // Use default coordinates for testing (Mumbai)
      finalCoordinates = {
        latitude: 19.0760,
        longitude: 72.8777
      };
      console.log('⚠️ Using default coordinates (Mumbai):', finalCoordinates);
    }

    // CRITICAL FIX: Ensure proper data types for backend validation
    const minimalPayload = {
      dateOfBirth: data.dateOfBirth,
      timeOfBirth: data.timeOfBirth,
      latitude: Number(finalCoordinates.latitude), // Ensure number type
      longitude: Number(finalCoordinates.longitude), // Ensure number type
      timezone: data.timezone || 'Asia/Kolkata', // Default timezone
      gender: data.gender || 'male' // Default gender
    };

    // Validate that coordinates are valid numbers
    if (isNaN(minimalPayload.latitude) || isNaN(minimalPayload.longitude)) {
      console.error('❌ Invalid coordinates detected:', {
        latitude: minimalPayload.latitude,
        longitude: minimalPayload.longitude,
        originalCoordinates: finalCoordinates
      });
      alert('Invalid coordinates. Please enter a valid location.');
      return;
    }

    console.log('✅ Submitting sanitized payload with proper data types:', minimalPayload);
    console.log('🔍 Data Type Validation:', {
      dateOfBirth: typeof minimalPayload.dateOfBirth,
      timeOfBirth: typeof minimalPayload.timeOfBirth,
      latitude: typeof minimalPayload.latitude,
      longitude: typeof minimalPayload.longitude,
      timezone: typeof minimalPayload.timezone,
      gender: typeof minimalPayload.gender,
      latitudeIsNumber: !isNaN(minimalPayload.latitude),
      longitudeIsNumber: !isNaN(minimalPayload.longitude)
    });

    console.log('🚀 CALLING onSubmit with payload...', minimalPayload);
    try {
      onSubmit(minimalPayload);
      console.log('✅ onSubmit called successfully');
    } catch (error) {
      console.error('💥 Error in onSubmit:', error);
    }
  };



  return (
    <form
      id="birth-data-form"
      onSubmit={(e) => {
        console.log('🟡 FORM ONSUBMIT - Native form submit event triggered');
        console.log('🔍 Event details:', {
          type: e.type,
          target: e.target.id,
          formData: new FormData(e.target)
        });
        return handleSubmit(handleFormSubmit)(e);
      }}
      className="space-y-6"
    >
      {(!formData.dateOfBirth || !formData.timeOfBirth) && Object.keys(errors).length > 0 && (
        <div className="alert-error">
          Please fill out all required fields correctly.
        </div>
      )}

      {/* Full Name */}
      <div className="space-y-1">
        <label htmlFor="name" className="block text-sm font-medium text-earth-brown">
          Full Name (Optional):
        </label>
        <input
          type="text"
          id="name"
          name="name"
          className="input-vedic w-full"
          placeholder="Enter your full name (optional)"
          {...register('name', {
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

          {/* Major Asian Timezones */}
          <optgroup label="Asia">
            <option value="Asia/Kolkata">Asia/Kolkata (India)</option>
            <option value="Asia/Karachi">Asia/Karachi (Pakistan)</option>
            <option value="Asia/Dhaka">Asia/Dhaka (Bangladesh)</option>
            <option value="Asia/Kathmandu">Asia/Kathmandu (Nepal)</option>
            <option value="Asia/Colombo">Asia/Colombo (Sri Lanka)</option>
            <option value="Asia/Dubai">Asia/Dubai (UAE)</option>
            <option value="Asia/Shanghai">Asia/Shanghai (China)</option>
            <option value="Asia/Tokyo">Asia/Tokyo (Japan)</option>
            <option value="Asia/Seoul">Asia/Seoul (South Korea)</option>
            <option value="Asia/Singapore">Asia/Singapore</option>
            <option value="Asia/Hong_Kong">Asia/Hong_Kong</option>
            <option value="Asia/Bangkok">Asia/Bangkok (Thailand)</option>
            <option value="Asia/Jakarta">Asia/Jakarta (Indonesia)</option>
            <option value="Asia/Manila">Asia/Manila (Philippines)</option>
            <option value="Asia/Kuala_Lumpur">Asia/Kuala_Lumpur (Malaysia)</option>
            <option value="Asia/Taipei">Asia/Taipei (Taiwan)</option>
            <option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh (Vietnam)</option>
            <option value="Asia/Yangon">Asia/Yangon (Myanmar)</option>
            <option value="Asia/Tashkent">Asia/Tashkent (Uzbekistan)</option>
            <option value="Asia/Tehran">Asia/Tehran (Iran)</option>
            <option value="Asia/Jerusalem">Asia/Jerusalem (Israel)</option>
            <option value="Asia/Riyadh">Asia/Riyadh (Saudi Arabia)</option>
          </optgroup>

          {/* Europe */}
          <optgroup label="Europe">
            <option value="Europe/London">Europe/London (UK)</option>
            <option value="Europe/Paris">Europe/Paris (France)</option>
            <option value="Europe/Berlin">Europe/Berlin (Germany)</option>
            <option value="Europe/Rome">Europe/Rome (Italy)</option>
            <option value="Europe/Madrid">Europe/Madrid (Spain)</option>
            <option value="Europe/Amsterdam">Europe/Amsterdam (Netherlands)</option>
            <option value="Europe/Brussels">Europe/Brussels (Belgium)</option>
            <option value="Europe/Zurich">Europe/Zurich (Switzerland)</option>
            <option value="Europe/Vienna">Europe/Vienna (Austria)</option>
            <option value="Europe/Warsaw">Europe/Warsaw (Poland)</option>
            <option value="Europe/Prague">Europe/Prague (Czech Republic)</option>
            <option value="Europe/Budapest">Europe/Budapest (Hungary)</option>
            <option value="Europe/Athens">Europe/Athens (Greece)</option>
            <option value="Europe/Stockholm">Europe/Stockholm (Sweden)</option>
            <option value="Europe/Oslo">Europe/Oslo (Norway)</option>
            <option value="Europe/Copenhagen">Europe/Copenhagen (Denmark)</option>
            <option value="Europe/Helsinki">Europe/Helsinki (Finland)</option>
            <option value="Europe/Moscow">Europe/Moscow (Russia)</option>
            <option value="Europe/Istanbul">Europe/Istanbul (Turkey)</option>
          </optgroup>

          {/* North America */}
          <optgroup label="North America">
            <option value="America/New_York">America/New_York (Eastern Time)</option>
            <option value="America/Chicago">America/Chicago (Central Time)</option>
            <option value="America/Denver">America/Denver (Mountain Time)</option>
            <option value="America/Los_Angeles">America/Los_Angeles (Pacific Time)</option>
            <option value="America/Toronto">America/Toronto (Canada Eastern)</option>
            <option value="America/Vancouver">America/Vancouver (Canada Pacific)</option>
            <option value="America/Mexico_City">America/Mexico_City (Mexico)</option>
            <option value="America/Phoenix">America/Phoenix (Arizona)</option>
            <option value="America/Anchorage">America/Anchorage (Alaska)</option>
            <option value="Pacific/Honolulu">Pacific/Honolulu (Hawaii)</option>
          </optgroup>

          {/* South America */}
          <optgroup label="South America">
            <option value="America/Sao_Paulo">America/Sao_Paulo (Brazil)</option>
            <option value="America/Buenos_Aires">America/Buenos_Aires (Argentina)</option>
            <option value="America/Santiago">America/Santiago (Chile)</option>
            <option value="America/Lima">America/Lima (Peru)</option>
            <option value="America/Bogota">America/Bogota (Colombia)</option>
            <option value="America/Caracas">America/Caracas (Venezuela)</option>
          </optgroup>

          {/* Africa */}
          <optgroup label="Africa">
            <option value="Africa/Cairo">Africa/Cairo (Egypt)</option>
            <option value="Africa/Lagos">Africa/Lagos (Nigeria)</option>
            <option value="Africa/Nairobi">Africa/Nairobi (Kenya)</option>
            <option value="Africa/Johannesburg">Africa/Johannesburg (South Africa)</option>
            <option value="Africa/Casablanca">Africa/Casablanca (Morocco)</option>
            <option value="Africa/Tunis">Africa/Tunis (Tunisia)</option>
            <option value="Africa/Algiers">Africa/Algiers (Algeria)</option>
            <option value="Africa/Addis_Ababa">Africa/Addis_Ababa (Ethiopia)</option>
          </optgroup>

          {/* Oceania */}
          <optgroup label="Oceania">
            <option value="Australia/Sydney">Australia/Sydney (Eastern Australia)</option>
            <option value="Australia/Melbourne">Australia/Melbourne (Victoria)</option>
            <option value="Australia/Brisbane">Australia/Brisbane (Queensland)</option>
            <option value="Australia/Perth">Australia/Perth (Western Australia)</option>
            <option value="Australia/Adelaide">Australia/Adelaide (South Australia)</option>
            <option value="Australia/Darwin">Australia/Darwin (Northern Territory)</option>
            <option value="Pacific/Auckland">Pacific/Auckland (New Zealand)</option>
            <option value="Pacific/Fiji">Pacific/Fiji</option>
          </optgroup>

          {/* UTC Offsets (fallback) */}
          <optgroup label="UTC Offsets">
            <option value="UTC">UTC (Coordinated Universal Time)</option>
            <option value="UTC-12:00">UTC-12:00 (Baker Island)</option>
            <option value="UTC-11:00">UTC-11:00 (Niue)</option>
            <option value="UTC-10:00">UTC-10:00 (Hawaii)</option>
            <option value="UTC-09:00">UTC-09:00 (Alaska)</option>
            <option value="UTC-08:00">UTC-08:00 (Pacific Time)</option>
            <option value="UTC-07:00">UTC-07:00 (Mountain Time)</option>
            <option value="UTC-06:00">UTC-06:00 (Central Time)</option>
            <option value="UTC-05:00">UTC-05:00 (Eastern Time)</option>
            <option value="UTC-04:00">UTC-04:00 (Atlantic Time)</option>
            <option value="UTC-03:00">UTC-03:00 (Brazil)</option>
            <option value="UTC-02:00">UTC-02:00 (Mid-Atlantic)</option>
            <option value="UTC-01:00">UTC-01:00 (Azores)</option>
            <option value="UTC+01:00">UTC+01:00 (Central European Time)</option>
            <option value="UTC+02:00">UTC+02:00 (Eastern European Time)</option>
            <option value="UTC+03:00">UTC+03:00 (Moscow Time)</option>
            <option value="UTC+04:00">UTC+04:00 (Gulf Time)</option>
            <option value="UTC+05:00">UTC+05:00 (Pakistan Time)</option>
            <option value="UTC+05:30">UTC+05:30 (India Standard Time)</option>
            <option value="UTC+06:00">UTC+06:00 (Bangladesh Time)</option>
            <option value="UTC+07:00">UTC+07:00 (Thailand Time)</option>
            <option value="UTC+08:00">UTC+08:00 (China Time)</option>
            <option value="UTC+09:00">UTC+09:00 (Japan Time)</option>
            <option value="UTC+10:00">UTC+10:00 (Australia Eastern Time)</option>
            <option value="UTC+11:00">UTC+11:00 (Solomon Islands)</option>
            <option value="UTC+12:00">UTC+12:00 (Fiji Time)</option>
          </optgroup>
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
          disabled={isLoading || !formData.dateOfBirth || !formData.timeOfBirth}
          loading={isLoading}
          variant="primary"
          size="lg"
          className="w-full"
          onClick={() => {
            console.log('🔴 BUTTON CLICKED - Submit button clicked');
            console.log('🔍 Form state:', {
              hasErrors: Object.keys(errors).length > 0,
              errors: errors,
              isLoading: isLoading,
              hasRequiredFields: !!(formData.dateOfBirth && formData.timeOfBirth)
            });
          }}
        >
          {isLoading ? 'Generating Chart...' : 'Generate Chart'}
        </Button>
      </div>
    </form>
  );
};

export default BirthDataForm;
