import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../ui';

const BirthDataForm = ({ onSubmit, isLoading }) => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    mode: 'onBlur',
  });

  const placeOfBirth = watch('placeOfBirth');
  const latitude = watch('latitude');
  const longitude = watch('longitude');
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <form id="birth-data-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {hasErrors && (
        <div className="alert-error">
          Please fill out all required fields.
        </div>
      )}

      <div className="space-y-1">
        <label htmlFor="name" className="block text-sm font-medium text-earth-brown">
          Full Name:
        </label>
        <input
          type="text"
          id="name"
          name="name"
          className="input-vedic"
          {...register('name', { required: 'Name is required' })}
        />
        {errors.name && (
          <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="dateOfBirth" className="block text-sm font-medium text-earth-brown">
          Date of Birth:
        </label>
        <input
          type="date"
          id="dateOfBirth"
          className="input-vedic"
          {...register('date', {
            required: 'Date of birth is required',
            validate: value => new Date(value) < new Date() || 'Date of birth must be in the past'
          })}
        />
        {errors.date && (
          <p className="text-red-600 text-xs mt-1">{errors.date.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="timeOfBirth" className="block text-sm font-medium text-earth-brown">
          Time of Birth:
        </label>
        <input
          type="time"
          id="timeOfBirth"
          className="input-vedic"
          {...register('time', { required: 'Time of birth is required' })}
        />
        {errors.time && (
          <p className="text-red-600 text-xs mt-1">{errors.time.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="placeOfBirth" className="block text-sm font-medium text-earth-brown">
          Place of Birth (City, State, Country):
        </label>
        <input
          type="text"
          id="placeOfBirth"
          placeholder="e.g., Mumbai, Maharashtra, India"
          className="input-vedic"
          {...register('placeOfBirth', {
            required: (!latitude || !longitude) ? 'Place of birth is required if coordinates are not provided.' : false,
          })}
        />
        {errors.placeOfBirth && (
          <p className="text-red-600 text-xs mt-1">{errors.placeOfBirth.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="latitude" className="block text-sm font-medium text-earth-brown">
            Latitude:
          </label>
          <input
            type="number"
            id="latitude"
            name="latitude"
            step="0.000001"
            placeholder="e.g., 19.0760"
            className="input-vedic"
            {...register('latitude', {
              required: !placeOfBirth,
              min: { value: -90, message: 'Latitude must be between -90 and 90' },
              max: { value: 90, message: 'Latitude must be between -90 and 90' },
            })}
          />
          {errors.latitude && (
            <p className="text-red-600 text-xs mt-1">{errors.latitude.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="longitude" className="block text-sm font-medium text-earth-brown">
            Longitude:
          </label>
          <input
            type="number"
            id="longitude"
            name="longitude"
            step="0.000001"
            placeholder="e.g., 72.8777"
            className="input-vedic"
            {...register('longitude', {
              required: !placeOfBirth,
              min: { value: -180, message: 'Longitude must be between -180 and 180' },
              max: { value: 180, message: 'Longitude must be between -180 and 180' },
            })}
          />
          {errors.longitude && (
            <p className="text-red-600 text-xs mt-1">{errors.longitude.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="timeZone" className="block text-sm font-medium text-earth-brown">
          Time Zone:
        </label>
        <select
          id="timeZone"
          className="input-vedic"
          {...register('timezone', { required: 'Time zone is required' })}
        >
          <option value="">Select Time Zone</option>
          <option value="-12">UTC-12</option>
          <option value="-11">UTC-11</option>
          <option value="-10">UTC-10</option>
          <option value="-9">UTC-9</option>
          <option value="-8">UTC-8</option>
          <option value="-7">UTC-7</option>
          <option value="-6">UTC-6</option>
          <option value="-5">UTC-5</option>
          <option value="-4">UTC-4</option>
          <option value="-3">UTC-3</option>
          <option value="-2">UTC-2</option>
          <option value="-1">UTC-1</option>
          <option value="0">UTC</option>
          <option value="1">UTC+1</option>
          <option value="2">UTC+2</option>
          <option value="3">UTC+3</option>
          <option value="4">UTC+4</option>
          <option value="5">UTC+5</option>
          <option value="5.5">UTC+5:30 (India)</option>
          <option value="6">UTC+6</option>
          <option value="7">UTC+7</option>
          <option value="8">UTC+8</option>
          <option value="9">UTC+9</option>
          <option value="10">UTC+10</option>
          <option value="11">UTC+11</option>
          <option value="12">UTC+12</option>
        </select>
        {errors.timezone && (
          <p className="text-red-600 text-xs mt-1">{errors.timezone.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="gender" className="block text-sm font-medium text-earth-brown">
          Gender:
        </label>
        <select
          id="gender"
          name="gender"
          className="input-vedic"
          {...register('gender')}
        >
          <option value="">Select Gender (Optional)</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
        {errors.gender && (
          <p className="text-red-600 text-xs mt-1">{errors.gender.message}</p>
        )}
      </div>

      <div className="pt-4">
        <Button
          type="submit"
          disabled={isLoading}
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
