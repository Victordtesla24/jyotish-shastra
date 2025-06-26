import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Input,
  Select,
  cn
} from '../ui';

const BirthDataForm = ({ onSubmit, isLoading }) => {
  const { register, handleSubmit, formState: { errors }, watch, control } = useForm({
    mode: 'onBlur',
  });
  const [currentStep, setCurrentStep] = useState(1);

  const placeOfBirth = watch('placeOfBirth');
  const latitude = watch('latitude');
  const longitude = watch('longitude');
  const hasErrors = Object.keys(errors).length > 0;

  const steps = [
    { id: 1, title: 'Personal Info', icon: '👤' },
    { id: 2, title: 'Birth Details', icon: '🌟' },
    { id: 3, title: 'Location', icon: '📍' }
  ];

  const isStepComplete = (step) => {
    switch (step) {
      case 1:
        return watch('name') && !errors.name;
      case 2:
        return watch('date') && watch('time') && watch('timezone') &&
               !errors.date && !errors.time && !errors.timezone;
      case 3:
        return (watch('placeOfBirth') || (watch('latitude') && watch('longitude')));
      default:
        return false;
    }
  };

  const genderOptions = [
    { value: '', label: 'Select Gender' },
    { value: 'male', label: 'Male (पुरुष)' },
    { value: 'female', label: 'Female (स्त्री)' },
    { value: 'other', label: 'Other' }
  ];

  const timezoneOptions = [
    { value: '', label: 'Select Time Zone' },
    { label: 'Western Hemisphere', options: [
      { value: '-12', label: 'UTC-12 (International Date Line West)' },
      { value: '-11', label: 'UTC-11 (Samoa)' },
      { value: '-10', label: 'UTC-10 (Hawaii)' },
      { value: '-9', label: 'UTC-9 (Alaska)' },
      { value: '-8', label: 'UTC-8 (PST - Los Angeles)' },
      { value: '-7', label: 'UTC-7 (MST - Denver)' },
      { value: '-6', label: 'UTC-6 (CST - Chicago)' },
      { value: '-5', label: 'UTC-5 (EST - New York)' },
      { value: '-4', label: 'UTC-4 (Atlantic)' },
      { value: '-3', label: 'UTC-3 (Brazil)' },
    ]},
    { label: 'Eastern Hemisphere', options: [
      { value: '0', label: 'UTC (London)' },
      { value: '1', label: 'UTC+1 (Paris)' },
      { value: '2', label: 'UTC+2 (Cairo)' },
      { value: '3', label: 'UTC+3 (Moscow)' },
      { value: '4', label: 'UTC+4 (Dubai)' },
      { value: '5', label: 'UTC+5 (Pakistan)' },
      { value: '5.5', label: 'UTC+5:30 (India) 🇮🇳' },
      { value: '6', label: 'UTC+6 (Bangladesh)' },
      { value: '7', label: 'UTC+7 (Bangkok)' },
      { value: '8', label: 'UTC+8 (Singapore)' },
      { value: '9', label: 'UTC+9 (Tokyo)' },
      { value: '10', label: 'UTC+10 (Sydney)' },
    ]}
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto space-y-8">
      {/* Progress Indicator */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "flex items-center justify-center w-12 h-12 rounded-full text-lg font-medium transition-all duration-300 cursor-pointer",
                currentStep >= step.id
                  ? 'bg-gradient-to-r from-vedic-primary to-vedic-secondary text-white shadow-cosmic'
                  : 'bg-gray-200 text-gray-500',
                isStepComplete(step.id) && 'ring-4 ring-vedic-accent ring-opacity-30'
              )}
              onClick={() => setCurrentStep(step.id)}
            >
              <span className="text-xl">{step.icon}</span>
            </motion.div>
            {index < steps.length - 1 && (
              <div className={cn(
                "flex-1 h-1 mx-4 rounded-full transition-all duration-500",
                currentStep > step.id ? 'bg-vedic-accent' : 'bg-gray-200'
              )} />
            )}
          </div>
        ))}
      </motion.div>

      {/* Error Alert */}
      <AnimatePresence>
        {hasErrors && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-2"
          >
            <span className="text-lg">⚠️</span>
            <p className="text-red-700">Please correct the errors below to proceed.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step 1: Personal Information */}
      <AnimatePresence mode="wait">
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Card variant="vedic" decorative>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <span className="text-3xl">👤</span>
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Input
                  label="Full Name"
                  placeholder="Enter your full name"
                  required
                  error={errors.name?.message}
                  {...register('name', { required: 'Name is required' })}
                />

                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <Select
                      label="Gender (Optional)"
                      options={genderOptions}
                      value={genderOptions.find(opt => opt.value === field.value)}
                      onChange={(selected) => field.onChange(selected?.value)}
                    />
                  )}
                />

                <div className="flex justify-end pt-4">
                  <Button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    disabled={!isStepComplete(1)}
                    variant="accent"
                    rightIcon="→"
                  >
                    Next Step
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Birth Details */}
        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Card variant="cosmic" decorative>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <span className="text-3xl">🌟</span>
                  Birth Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    type="date"
                    label="Date of Birth"
                    required
                    error={errors.date?.message}
                    {...register('date', {
                      required: 'Date of birth is required',
                      validate: value => new Date(value) < new Date() || 'Date of birth must be in the past'
                    })}
                  />

                  <Input
                    type="time"
                    label="Time of Birth"
                    required
                    error={errors.time?.message}
                    {...register('time', { required: 'Time of birth is required' })}
                  />
                </div>

                <Controller
                  name="timezone"
                  control={control}
                  rules={{ required: 'Time zone is required' }}
                  render={({ field }) => (
                    <Select
                      label="Time Zone"
                      required
                      error={errors.timezone?.message}
                      options={timezoneOptions}
                      value={timezoneOptions.flatMap(group =>
                        group.options || [group]
                      ).find(opt => opt.value === field.value)}
                      onChange={(selected) => field.onChange(selected?.value)}
                    />
                  )}
                />

                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    variant="secondary"
                    leftIcon="←"
                  >
                    Previous
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    disabled={!isStepComplete(2)}
                    variant="accent"
                    rightIcon="→"
                  >
                    Next Step
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 3: Location Details */}
        {currentStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Card variant="vedic" decorative>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <span className="text-3xl">📍</span>
                  Birth Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Input
                  label="Place of Birth"
                  placeholder="e.g., Mumbai, Maharashtra, India"
                  required={!latitude && !longitude}
                  error={errors.placeOfBirth?.message}
                  {...register('placeOfBirth', {
                    required: (!latitude || !longitude) ? 'Place of birth is required if coordinates are not provided.' : false,
                  })}
                />

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-vedic-border"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-vedic-surface text-vedic-text-light">OR provide coordinates</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    type="number"
                    label="Latitude"
                    placeholder="e.g., 19.0760"
                    step="0.000001"
                    error={errors.latitude?.message}
                    {...register('latitude', {
                      required: !placeOfBirth,
                      min: { value: -90, message: 'Latitude must be between -90 and 90' },
                      max: { value: 90, message: 'Latitude must be between -90 and 90' },
                    })}
                  />

                  <Input
                    type="number"
                    label="Longitude"
                    placeholder="e.g., 72.8777"
                    step="0.000001"
                    error={errors.longitude?.message}
                    {...register('longitude', {
                      required: !placeOfBirth,
                      min: { value: -180, message: 'Longitude must be between -180 and 180' },
                      max: { value: 180, message: 'Longitude must be between -180 and 180' },
                    })}
                  />
                </div>

                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    variant="secondary"
                    leftIcon="←"
                  >
                    Previous
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading || !isStepComplete(3)}
                    variant="accent"
                    loading={isLoading}
                    leftIcon={isLoading ? null : "🌟"}
                  >
                    {isLoading ? 'Generating Chart...' : 'Generate My Kundli'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Navigation Dots */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex justify-center space-x-2 mt-8"
      >
        {steps.map((step) => (
          <button
            key={step.id}
            type="button"
            onClick={() => setCurrentStep(step.id)}
            className={cn(
              "w-3 h-3 rounded-full transition-all duration-300",
              currentStep === step.id
                ? 'bg-vedic-accent w-8'
                : 'bg-gray-300 hover:bg-gray-400'
            )}
            aria-label={`Go to ${step.title}`}
          />
        ))}
      </motion.div>
    </form>
  );
};

export default BirthDataForm;
