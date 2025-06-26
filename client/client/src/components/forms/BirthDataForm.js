import React from 'react';
import { useForm } from 'react-hook-form';
import './BirthDataForm.css';

const BirthDataForm = ({ onSubmit, isLoading }) => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    mode: 'onBlur',
  });

  const placeOfBirth = watch('placeOfBirth');
  const latitude = watch('latitude');
  const longitude = watch('longitude');
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <form id="birth-data-form" onSubmit={handleSubmit(onSubmit)} className="birth-data-form">
      {hasErrors && (
        <div className="error-message">
          Please fill out all required fields.
        </div>
      )}
      <div className="form-group">
        <label htmlFor="name">Full Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          {...register('name', { required: 'Name is required' })}
        />
        {errors.name && <p className="error-message">{errors.name.message}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="dateOfBirth">Date of Birth:</label>
        <input
          type="date"
          id="dateOfBirth"
          {...register('date', {
            required: 'Date of birth is required',
            validate: value => new Date(value) < new Date() || 'Date of birth must be in the past'
          })}
        />
        {errors.date && <p className="error-message">{errors.date.message}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="timeOfBirth">Time of Birth:</label>
        <input
          type="time"
          id="timeOfBirth"
          {...register('time', { required: 'Time of birth is required' })}
        />
        {errors.time && <p className="error-message">{errors.time.message}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="placeOfBirth">Place of Birth (City, State, Country):</label>
        <input
          type="text"
          id="placeOfBirth"
          placeholder="e.g., Mumbai, Maharashtra, India"
          {...register('placeOfBirth', {
            required: (!latitude || !longitude) ? 'Place of birth is required if coordinates are not provided.' : false,
          })}
        />
        {errors.placeOfBirth && <p className="error-message">{errors.placeOfBirth.message}</p>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="latitude">Latitude:</label>
                  <input
          type="number"
          id="latitude"
          name="latitude"
          step="0.000001"
          placeholder="e.g., 19.0760"
          {...register('latitude', {
            required: !placeOfBirth,
            min: { value: -90, message: 'Latitude must be between -90 and 90' },
            max: { value: 90, message: 'Latitude must be between -90 and 90' },
          })}
        />
          {errors.latitude && <p className="error-message">{errors.latitude.message}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="longitude">Longitude:</label>
                  <input
          type="number"
          id="longitude"
          name="longitude"
          step="0.000001"
          placeholder="e.g., 72.8777"
          {...register('longitude', {
            required: !placeOfBirth,
            min: { value: -180, message: 'Longitude must be between -180 and 180' },
            max: { value: 180, message: 'Longitude must be between -180 and 180' },
          })}
        />
          {errors.longitude && <p className="error-message">{errors.longitude.message}</p>}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="timeZone">Time Zone:</label>
        <select id="timeZone" {...register('timezone', { required: 'Time zone is required' })}>
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
        {errors.timezone && <p className="error-message">{errors.timezone.message}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="gender">Gender:</label>
        <select id="gender" name="gender" {...register('gender')}>
          <option value="">Select Gender (Optional)</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
        {errors.gender && <p className="error-message">{errors.gender.message}</p>}
      </div>

      <div className="form-group">
        <button type="submit" disabled={isLoading} className="submit-button">
          {isLoading ? 'Generating Chart...' : 'Generate Chart'}
        </button>
      </div>
    </form>
  );
};

export default BirthDataForm;
