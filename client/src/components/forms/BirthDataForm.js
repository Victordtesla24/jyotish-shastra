import React from 'react';
import { useForm } from 'react-hook-form';
import './BirthDataForm.css';

const BirthDataForm = ({ onSubmit, isLoading }) => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    mode: 'onBlur',
  });

  const placeOfBirth = watch('placeOfBirth');

  return (
    <form id="birth-data-form" onSubmit={handleSubmit(onSubmit)} className="birth-data-form">
      <div className="form-group">
        <label htmlFor="name">Full Name:</label>
        <input
          type="text"
          id="name"
          {...register('name', { required: 'Name is required' })}
        />
        {errors.name && <p className="error-message">{errors.name.message}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="dateOfBirth">Date of Birth:</label>
        <input
          type="date"
          id="dateOfBirth"
          {...register('dateOfBirth', {
            required: 'Date of birth is required',
            validate: value => new Date(value) < new Date() || 'Date of birth must be in the past'
          })}
        />
        {errors.dateOfBirth && <p className="error-message">{errors.dateOfBirth.message}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="timeOfBirth">Time of Birth:</label>
        <input
          type="time"
          id="timeOfBirth"
          {...register('timeOfBirth', { required: 'Time of birth is required' })}
        />
        {errors.timeOfBirth && <p className="error-message">{errors.timeOfBirth.message}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="placeOfBirth">Place of Birth (City, State, Country):</label>
        <input
          type="text"
          id="placeOfBirth"
          placeholder="e.g., Mumbai, Maharashtra, India"
          {...register('placeOfBirth', {
            required: 'Place of birth is required if coordinates are not provided.',
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
        <input
          type="text"
          id="timeZone"
          placeholder="e.g., Asia/Kolkata"
          {...register('timeZone', { required: 'Time zone is required' })}
        />
        {errors.timeZone && <p className="error-message">{errors.timeZone.message}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="gender">Gender:</label>
        <select id="gender" {...register('gender', { required: 'Gender is required' })}>
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
        {errors.gender && <p className="error-message">{errors.gender.message}</p>}
      </div>
    </form>
  );
};

export default BirthDataForm;
