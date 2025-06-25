/**
 * Birth Data Validation Rules
 * Validates birth data input for chart generation
 */

const Joi = require('joi');

// Date validation schema
const dateSchema = Joi.date()
  .min('1800-01-01')
  .max('2100-12-31')
  .required()
  .messages({
    'date.base': 'Birth date must be a valid date',
    'date.min': 'Birth date cannot be before year 1800',
    'date.max': 'Birth date cannot be after year 2100',
    'any.required': 'Birth date is required'
  });

// Time validation schema - Updated to accept HH:MM and HH:MM:SS formats
const timeSchema = Joi.alternatives().try(
  // HH:MM:SS format
  Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/),
  // HH:MM format
  Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
).required().messages({
  'alternatives.match': 'Time must be in HH:MM or HH:MM:SS format (24-hour)',
  'any.required': 'Birth time is required'
});

// Latitude validation schema
const latitudeSchema = Joi.number()
  .min(-90)
  .max(90)
  .precision(6)
  .required()
  .messages({
    'number.base': 'Latitude must be a number',
    'number.min': 'Latitude must be between -90 and 90 degrees',
    'number.max': 'Latitude must be between -90 and 90 degrees',
    'any.required': 'Latitude is required'
  });

// Longitude validation schema
const longitudeSchema = Joi.number()
  .min(-180)
  .max(180)
  .precision(6)
  .required()
  .messages({
    'number.base': 'Longitude must be a number',
    'number.min': 'Longitude must be between -180 and 180 degrees',
    'number.max': 'Longitude must be between -180 and 180 degrees',
    'any.required': 'Longitude is required'
  });

// Timezone validation schema - Updated to accept IANA timezones and UTC offsets
const timezoneSchema = Joi.alternatives().try(
  // IANA timezone format (e.g., "Asia/Kolkata", "America/New_York")
  Joi.string().pattern(/^[A-Za-z_]+\/[A-Za-z_]+$/),
  // UTC offset format (e.g., "+05:30", "-08:00")
  Joi.string().pattern(/^[+-]([0-9]|1[0-4]):[0-5][0-9]$/),
  // UTC/GMT
  Joi.string().valid('UTC', 'GMT')
).required().messages({
  'alternatives.match': 'Timezone must be in IANA format (e.g., Asia/Kolkata) or UTC offset format (±HH:MM) or UTC/GMT',
  'any.required': 'Timezone is required'
});

// Place name validation schema
const placeNameSchema = Joi.string()
  .min(2)
  .max(100)
  .trim()
  .required()
  .messages({
    'string.min': 'Place name must be at least 2 characters long',
    'string.max': 'Place name cannot exceed 100 characters',
    'any.required': 'Place of birth is required'
  });

// Gender validation schema
const genderSchema = Joi.string()
  .valid('male', 'female', 'other')
  .optional()
  .messages({
    'any.only': 'Gender must be male, female, or other'
  });

// Name validation schema
const nameSchema = Joi.string()
  .min(1)
  .max(100)
  .trim()
  .required()
  .messages({
    'string.min': 'Name is required',
    'string.max': 'Name cannot exceed 100 characters',
    'any.required': 'Name is required'
  });

// Ayanamsa validation schema
const ayanamsaSchema = Joi.string()
  .valid('lahiri', 'raman', 'krishnamurti', 'yukteshwar', 'fagan_bradley')
  .default('lahiri')
  .messages({
    'any.only': 'Ayanamsa must be one of: lahiri, raman, krishnamurti, yukteshwar, fagan_bradley'
  });

// Chart style validation schema
const chartStyleSchema = Joi.string()
  .valid('south_indian', 'north_indian', 'east_indian', 'bengali')
  .default('south_indian')
  .messages({
    'any.only': 'Chart style must be one of: south_indian, north_indian, east_indian, bengali'
  });

// Main birth data validation schema
const birthDataSchema = Joi.object({
  name: nameSchema,
  dateOfBirth: dateSchema,
  timeOfBirth: timeSchema,
  placeOfBirth: Joi.object({
    name: placeNameSchema,
    latitude: latitudeSchema,
    longitude: longitudeSchema,
    timezone: timezoneSchema,
    country: Joi.string().max(50).optional(),
    state: Joi.string().max(50).optional()
  }).required(),
  gender: genderSchema,
  calculationSettings: Joi.object({
    ayanamsa: ayanamsaSchema,
    chartStyle: chartStyleSchema,
    houseSystem: Joi.string()
      .valid('placidus', 'koch', 'equal', 'whole_sign', 'campanus', 'regiomontanus')
      .default('placidus'),
    coordinateSystem: Joi.string()
      .valid('tropical', 'sidereal')
      .default('sidereal')
  }).optional()
});

/**
 * Flexible birth data schema for chart generation (name optional)
 */
const flexibleBirthDataSchema = Joi.object({
  name: Joi.string().min(1).max(100).trim().optional(),
  dateOfBirth: dateSchema,
  timeOfBirth: timeSchema,
  latitude: latitudeSchema.optional(),
  longitude: longitudeSchema.optional(),
  timezone: timezoneSchema.optional(),
  placeOfBirth: Joi.alternatives().try(
    // Nested format
    Joi.object({
      name: placeNameSchema.optional(),
      latitude: latitudeSchema,
      longitude: longitudeSchema,
      timezone: timezoneSchema,
      country: Joi.string().max(50).optional(),
      state: Joi.string().max(50).optional()
    }),
    // String format
    Joi.string().min(2).max(100)
  ).optional(),
  gender: genderSchema,
  calculationSettings: Joi.object({
    ayanamsa: ayanamsaSchema,
    chartStyle: chartStyleSchema,
    houseSystem: Joi.string()
      .valid('placidus', 'koch', 'equal', 'whole_sign', 'campanus', 'regiomontanus')
      .default('placidus'),
    coordinateSystem: Joi.string()
      .valid('tropical', 'sidereal')
      .default('sidereal')
  }).optional()
}).custom((value, helpers) => {
  // Ensure either coordinates or place information is provided
  const hasCoordinates = value.latitude && value.longitude;
  const hasPlaceInfo = value.placeOfBirth &&
    (typeof value.placeOfBirth === 'string' ||
     (typeof value.placeOfBirth === 'object' && (value.placeOfBirth.latitude && value.placeOfBirth.longitude)));

  if (!hasCoordinates && !hasPlaceInfo) {
    return helpers.error('custom.multifield', {
      errors: [
        { field: 'latitude', message: 'Latitude is required when place information is not provided' },
        { field: 'longitude', message: 'Longitude is required when place information is not provided' },
        { field: 'timezone', message: 'Timezone is required for accurate calculations' }
      ]
    });
  }

  return value;
}).messages({
  'custom.multifield': 'Either coordinates (latitude, longitude) or place of birth information must be provided'
});

/**
 * Flexible birth data schema for comprehensive analysis (name optional)
 */
const comprehensiveAnalysisSchema = Joi.object({
  name: Joi.string().min(1).max(100).trim().optional(),
  dateOfBirth: dateSchema,
  timeOfBirth: timeSchema,
  latitude: latitudeSchema.optional(),
  longitude: longitudeSchema.optional(),
  timezone: timezoneSchema.optional(),
  placeOfBirth: Joi.alternatives().try(
    // Nested format
    Joi.object({
      name: placeNameSchema.optional(),
      latitude: latitudeSchema,
      longitude: longitudeSchema,
      timezone: timezoneSchema,
      country: Joi.string().max(50).optional(),
      state: Joi.string().max(50).optional()
    }),
    // String format
    Joi.string().min(2).max(100)
  ).optional(),
  gender: genderSchema,
  calculationSettings: Joi.object({
    ayanamsa: ayanamsaSchema,
    chartStyle: chartStyleSchema,
    houseSystem: Joi.string()
      .valid('placidus', 'koch', 'equal', 'whole_sign', 'campanus', 'regiomontanus')
      .default('placidus'),
    coordinateSystem: Joi.string()
      .valid('tropical', 'sidereal')
      .default('sidereal')
  }).optional()
}).custom((value, helpers) => {
  // Ensure either coordinates or place information is provided
  const hasCoordinates = value.latitude && value.longitude;
  const hasPlaceInfo = value.placeOfBirth &&
    (typeof value.placeOfBirth === 'string' ||
     (typeof value.placeOfBirth === 'object' && (value.placeOfBirth.latitude && value.placeOfBirth.longitude)));

  if (!hasCoordinates && !hasPlaceInfo) {
    return helpers.error('custom.multifield', {
      errors: [
        { field: 'latitude', message: 'Latitude is required when place information is not provided' },
        { field: 'longitude', message: 'Longitude is required when place information is not provided' },
        { field: 'timezone', message: 'Timezone is required for accurate calculations' }
      ]
    });
  }

  return value;
}).messages({
  'custom.multifield': 'Either coordinates (latitude, longitude) or place of birth information must be provided'
});

/**
 * Birth data validation (name optional) for birth-data endpoint
 */
const birthDataValidationSchema = Joi.object({
  dateOfBirth: dateSchema,
  timeOfBirth: timeSchema,
  latitude: latitudeSchema.optional(),
  longitude: longitudeSchema.optional(),
  timezone: timezoneSchema.optional(),
  placeOfBirth: Joi.alternatives().try(
    Joi.object({
      name: placeNameSchema.optional(),
      latitude: latitudeSchema,
      longitude: longitudeSchema,
      timezone: timezoneSchema,
      country: Joi.string().max(50).optional(),
      state: Joi.string().max(50).optional()
    }),
    Joi.string().min(2).max(100)
  ).optional(),
  gender: genderSchema
}).custom((value, helpers) => {
  const hasCoordinates = value.latitude && value.longitude;
  const hasPlaceInfo = value.placeOfBirth;

  if (!hasCoordinates && !hasPlaceInfo) {
    return helpers.error('custom.multifield', {
      errors: [
        { field: 'latitude', message: 'Latitude is required when place information is not provided' },
        { field: 'longitude', message: 'Longitude is required when place information is not provided' },
        { field: 'timezone', message: 'Timezone is required for accurate calculations' }
      ]
    });
  }

  return value;
}).messages({
  'custom.multifield': 'Location (coordinates or place name) is required'
});

// Chart generation request validation schema
const chartRequestSchema = Joi.object({
  birthData: birthDataSchema.required(),
  includeNavamsa: Joi.boolean().default(true),
  includeDivisionalCharts: Joi.array()
    .items(Joi.string().valid('D1', 'D2', 'D3', 'D4', 'D7', 'D9', 'D10', 'D12', 'D16', 'D20', 'D24', 'D27', 'D30', 'D40', 'D45', 'D60'))
    .default(['D1', 'D9']),
  includeYogas: Joi.boolean().default(true),
  includeAspects: Joi.boolean().default(true),
  includeDasha: Joi.boolean().default(true)
});

// Chart update validation schema
const chartUpdateSchema = Joi.object({
  name: nameSchema.optional(),
  notes: Joi.string().max(1000).optional(),
  tags: Joi.array().items(Joi.string().max(50)).max(10).optional(),
  isPublic: Joi.boolean().optional()
});

// Bulk chart validation schema
const bulkChartSchema = Joi.object({
  charts: Joi.array()
    .items(birthDataSchema)
    .min(1)
    .max(10)
    .required()
    .messages({
      'array.min': 'At least one chart is required',
      'array.max': 'Maximum 10 charts allowed per request'
    })
});

// Chart comparison validation schema
const chartComparisonSchema = Joi.object({
  chart1Id: Joi.string().hex().length(24).required(),
  chart2Id: Joi.string().hex().length(24).required(),
  comparisonType: Joi.string()
    .valid('synastry', 'composite', 'compatibility')
    .default('compatibility')
});

// Time rectification validation schema
const rectificationSchema = Joi.object({
  birthData: birthDataSchema.required(),
  knownEvents: Joi.array().items(
    Joi.object({
      event: Joi.string().required(),
      date: Joi.date().required(),
      importance: Joi.string().valid('high', 'medium', 'low').default('medium')
    })
  ).min(1).max(10).required(),
  timeRange: Joi.object({
    startMinutes: Joi.number().min(-120).max(120).default(-30),
    endMinutes: Joi.number().min(-120).max(120).default(30),
    stepMinutes: Joi.number().min(1).max(15).default(5)
  }).optional()
});

/**
 * Validate birth data
 * @param {Object} data - Birth data to validate
 * @returns {Object} Validation result
 */
function validateBirthData(data) {
  const { error, value } = birthDataSchema.validate(data, {
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: true
  });

  if (error) {
    return {
      isValid: false,
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      })),
      data: null
    };
  }

  // Additional custom validations
  const customValidationErrors = performCustomValidations(value);

  if (customValidationErrors.length > 0) {
    return {
      isValid: false,
      errors: customValidationErrors,
      data: null
    };
  }

  return {
    isValid: true,
    errors: [],
    data: value
  };
}

/**
 * Enhanced validation function for flexible birth data (name optional)
 * @param {Object} data - Birth data to validate
 * @returns {Object} Validation result
 */
function validateChartRequest(data) {
  const { error, value } = flexibleBirthDataSchema.validate(data, {
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: false
  });

  if (error) {
    const errors = [];

    error.details.forEach(detail => {
      if (detail.type === 'custom.multifield' && detail.context?.errors) {
        // Add individual field errors for custom validation
        errors.push(...detail.context.errors);
      } else {
        errors.push({
          field: detail.path.join('.'),
          message: detail.message,
          providedValue: detail.context?.value
        });
      }
    });

    return {
      isValid: false,
      errors,
      data: null
    };
  }

  return {
    isValid: true,
    errors: [],
    data: value
  };
}

/**
 * Validate chart update data
 * @param {Object} data - Chart update data to validate
 * @returns {Object} Validation result
 */
function validateChartUpdate(data) {
  const { error, value } = chartUpdateSchema.validate(data, {
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: true
  });

  if (error) {
    return {
      isValid: false,
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      })),
      data: null
    };
  }

  return {
    isValid: true,
    errors: [],
    data: value
  };
}

/**
 * Validate bulk chart request
 * @param {Object} data - Bulk chart data to validate
 * @returns {Object} Validation result
 */
function validateBulkCharts(data) {
  const { error, value } = bulkChartSchema.validate(data, {
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: true
  });

  if (error) {
    return {
      isValid: false,
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      })),
      data: null
    };
  }

  return {
    isValid: true,
    errors: [],
    data: value
  };
}

/**
 * Validate chart comparison request
 * @param {Object} data - Chart comparison data to validate
 * @returns {Object} Validation result
 */
function validateChartComparison(data) {
  const { error, value } = chartComparisonSchema.validate(data, {
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: true
  });

  if (error) {
    return {
      isValid: false,
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      })),
      data: null
    };
  }

  return {
    isValid: true,
    errors: [],
    data: value
  };
}

/**
 * Validate time rectification request
 * @param {Object} data - Rectification data to validate
 * @returns {Object} Validation result
 */
function validateRectification(data) {
  const { error, value } = rectificationSchema.validate(data, {
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: true
  });

  if (error) {
    return {
      isValid: false,
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      })),
      data: null
    };
  }

  return {
    isValid: true,
    errors: [],
    data: value
  };
}

/**
 * Perform custom validations beyond Joi schema
 * @param {Object} data - Validated data
 * @returns {Array} Array of custom validation errors
 */
function performCustomValidations(data) {
  const errors = [];

  // Validate birth date is not in the future
  if (data.dateOfBirth > new Date()) {
    errors.push({
      field: 'dateOfBirth',
      message: 'Birth date cannot be in the future',
      value: data.dateOfBirth
    });
  }

  // Validate reasonable birth date (not too old)
  const oldestValidDate = new Date();
  oldestValidDate.setFullYear(oldestValidDate.getFullYear() - 150);

  if (data.dateOfBirth < oldestValidDate) {
    errors.push({
      field: 'dateOfBirth',
      message: 'Birth date cannot be more than 150 years ago',
      value: data.dateOfBirth
    });
  }

  // Validate timezone format more strictly
  if (data.placeOfBirth?.timezone) {
    const timezone = data.placeOfBirth.timezone;
    if (timezone !== 'UTC' && timezone !== 'GMT') {
      const match = timezone.match(/^([+-])([0-9]|1[0-4]):([0-5][0-9])$/);
      if (!match) {
        errors.push({
          field: 'placeOfBirth.timezone',
          message: 'Invalid timezone format',
          value: timezone
        });
      }
    }
  }

  // Validate coordinate precision (reasonable limits)
  if (data.placeOfBirth?.latitude !== undefined) {
    const lat = data.placeOfBirth.latitude;
    if (Math.abs(lat) < 0.000001) {
      errors.push({
        field: 'placeOfBirth.latitude',
        message: 'Latitude appears to be too precise or exactly zero',
        value: lat
      });
    }
  }

  if (data.placeOfBirth?.longitude !== undefined) {
    const lng = data.placeOfBirth.longitude;
    if (Math.abs(lng) < 0.000001) {
      errors.push({
        field: 'placeOfBirth.longitude',
        message: 'Longitude appears to be too precise or exactly zero',
        value: lng
      });
    }
  }

  return errors;
}

/**
 * Sanitize birth data input
 * @param {Object} data - Raw input data
 * @returns {Object} Sanitized data
 */
function sanitizeBirthData(data) {
  if (!data || typeof data !== 'object') {
    return {};
  }

  const sanitized = { ...data };

  // Trim string fields
  if (sanitized.name) {
    sanitized.name = sanitized.name.trim();
  }

  if (sanitized.placeOfBirth?.name) {
    sanitized.placeOfBirth.name = sanitized.placeOfBirth.name.trim();
  }

  if (sanitized.placeOfBirth?.country) {
    sanitized.placeOfBirth.country = sanitized.placeOfBirth.country.trim();
  }

  if (sanitized.placeOfBirth?.state) {
    sanitized.placeOfBirth.state = sanitized.placeOfBirth.state.trim();
  }

  // Ensure numeric fields are properly typed
  if (sanitized.placeOfBirth?.latitude) {
    sanitized.placeOfBirth.latitude = parseFloat(sanitized.placeOfBirth.latitude);
  }

  if (sanitized.placeOfBirth?.longitude) {
    sanitized.placeOfBirth.longitude = parseFloat(sanitized.placeOfBirth.longitude);
  }

  // Ensure date is properly formatted
  if (sanitized.dateOfBirth && typeof sanitized.dateOfBirth === 'string') {
    sanitized.dateOfBirth = new Date(sanitized.dateOfBirth);
  }

  return sanitized;
}

/**
 * Validate comprehensive analysis data (name required for analysis endpoints, name optional for standardization)
 * @param {Object} data - Analysis data to validate
 * @param {boolean} requireName - Whether name is required (defaults to true for analysis endpoints)
 * @returns {Object} Validation result
 */
function validateComprehensiveAnalysis(data, requireName = true) {
  // Check if data is wrapped in birthData property
  const birthData = data.birthData || data;

  // Check for chartId alternative format
  if (data.chartId && !data.birthData) {
    // If chartId is provided without birthData, it's valid
    return {
      isValid: true,
      errors: [],
      data: { chartId: data.chartId }
    };
  }

  // If no birthData and no chartId, it's invalid
  if (!birthData && !data.chartId) {
    return {
      isValid: false,
      errors: [{
        field: 'birthData',
        message: 'Either birthData or chartId is required',
        providedValue: undefined
      }],
      suggestions: ['Provide either complete birth data or a valid chart ID'],
      helpText: 'Either birthData or chartId is required',
      data: null
    };
  }

  // Use appropriate schema based on requireName parameter
  const schema = requireName ? analysisRequiredSchema : comprehensiveAnalysisSchema;

  const { error, value } = schema.validate(birthData, {
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: false
  });

  if (error) {
    const errors = [];

    error.details.forEach(detail => {
      if (detail.type === 'custom.multifield' && detail.context?.errors) {
        // Add individual field errors for custom validation
        detail.context.errors.forEach(err => {
          errors.push({
            field: data.birthData ? `birthData.${err.field}` : err.field,
            message: err.message,
            providedValue: undefined
          });
        });
      } else {
        errors.push({
          field: data.birthData ? `birthData.${detail.path.join('.')}` : detail.path.join('.'),
          message: detail.message,
          providedValue: detail.context?.value
        });
      }
    });

    const helpText = requireName
      ? 'Comprehensive analysis requires complete birth data including name, date, time, and location.'
      : 'Comprehensive analysis requires birth date, time, and location information. All fields are required for accurate analysis.';

    return {
      isValid: false,
      errors,
      suggestions: generateValidationSuggestions(error.details),
      helpText,
      data: null
    };
  }

  return {
    isValid: true,
    errors: [],
    data: data.birthData ? { birthData: value } : value
  };
}

/**
 * Validate house analysis data (name required for analysis endpoints)
 * @param {Object} data - Analysis data to validate
 * @returns {Object} Validation result
 */
function validateHouseAnalysis(data) {
  const birthData = data.birthData || data;

  const { error, value } = comprehensiveAnalysisSchema.validate(birthData, {
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: false
  });

  if (error) {
    const errors = [];

    error.details.forEach(detail => {
      if (detail.type === 'custom.multifield' && detail.context?.errors) {
        // Add individual field errors for custom validation
        detail.context.errors.forEach(err => {
          errors.push({
            field: data.birthData ? `birthData.${err.field}` : err.field,
            message: err.message,
            providedValue: undefined
          });
        });
      } else {
        errors.push({
          field: data.birthData ? `birthData.${detail.path.join('.')}` : detail.path.join('.'),
          message: detail.message,
          providedValue: detail.context?.value
        });
      }
    });

    return {
      isValid: false,
      errors,
      suggestions: generateValidationSuggestions(error.details),
      helpText: 'House analysis requires complete birth data including name, date, time, and location.',
      data: null
    };
  }

  return {
    isValid: true,
    errors: [],
    data: data.birthData ? { birthData: value } : value
  };
}

/**
 * Validate aspect analysis data (name required for analysis endpoints)
 * @param {Object} data - Analysis data to validate
 * @returns {Object} Validation result
 */
function validateAspectAnalysis(data) {
  return validateHouseAnalysis(data); // Same logic for now
}

/**
 * Validate arudha analysis data (name required for analysis endpoints)
 * @param {Object} data - Analysis data to validate
 * @returns {Object} Validation result
 */
function validateArudhaAnalysis(data) {
  return validateHouseAnalysis(data); // Same logic for now
}

/**
 * Validate navamsa analysis data (name required for analysis endpoints)
 * @param {Object} data - Analysis data to validate
 * @returns {Object} Validation result
 */
function validateNavamsaAnalysis(data) {
  return validateHouseAnalysis(data); // Same logic for now
}

/**
 * Validate dasha analysis data (name required for analysis endpoints)
 * @param {Object} data - Analysis data to validate
 * @returns {Object} Validation result
 */
function validateDashaAnalysis(data) {
  return validateHouseAnalysis(data); // Same logic for now
}

/**
 * Validate birth data validation endpoint (name optional)
 * @param {Object} data - Birth data to validate
 * @returns {Object} Validation result
 */
function validateBirthDataValidation(data) {
  const { error, value } = birthDataValidationSchema.validate(data, {
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: false
  });

  if (error) {
    const errors = [];

    error.details.forEach(detail => {
      if (detail.type === 'custom.multifield' && detail.context?.errors) {
        // Add individual field errors for custom validation
        errors.push(...detail.context.errors);
      } else {
        errors.push({
          field: detail.path.join('.'),
          message: detail.message,
          providedValue: detail.context?.value
        });
      }
    });

    return {
      isValid: false,
      errors,
      suggestions: generateValidationSuggestions(error.details),
      helpText: 'Birth data validation requires date, time, and location information.',
      data: null
    };
  }

  return {
    isValid: true,
    errors: [],
    data: value
  };
}

/**
 * Generate helpful suggestions for validation errors
 * @param {Array} errorDetails - Joi error details
 * @returns {Array} Validation suggestions
 */
function generateValidationSuggestions(errorDetails) {
  const suggestions = [];

  errorDetails.forEach(detail => {
    switch (detail.type) {
      case 'date.format':
        suggestions.push('Date format should be YYYY-MM-DD (e.g., 1985-03-15)');
        break;
      case 'string.pattern.base':
        if (detail.context.name === 'timeOfBirth') {
          suggestions.push('Time format should be HH:MM or HH:MM:SS (e.g., 08:30 or 14:45:30)');
        }
        break;
      case 'number.min':
      case 'number.max':
        if (detail.path.includes('latitude')) {
          suggestions.push('Latitude must be between -90 and 90 degrees');
        } else if (detail.path.includes('longitude')) {
          suggestions.push('Longitude must be between -180 and 180 degrees');
        }
        break;
      case 'any.required':
        suggestions.push(`${detail.path.join('.')} is a required field`);
        break;
      default:
        suggestions.push(`Please check the ${detail.path.join('.')} field`);
    }
  });

  return [...new Set(suggestions)]; // Remove duplicates
}

/**
 * Analysis schema (name required) for analysis endpoints
 */
const analysisRequiredSchema = Joi.object({
  name: nameSchema, // Required for analysis
  dateOfBirth: dateSchema,
  timeOfBirth: timeSchema,
  latitude: latitudeSchema.optional(),
  longitude: longitudeSchema.optional(),
  timezone: timezoneSchema.optional(),
  placeOfBirth: Joi.alternatives().try(
    // Nested format
    Joi.object({
      name: placeNameSchema.optional(),
      latitude: latitudeSchema,
      longitude: longitudeSchema,
      timezone: timezoneSchema,
      country: Joi.string().max(50).optional(),
      state: Joi.string().max(50).optional()
    }),
    // String format
    Joi.string().min(2).max(100)
  ).optional(),
  gender: genderSchema,
  calculationSettings: Joi.object({
    ayanamsa: ayanamsaSchema,
    chartStyle: chartStyleSchema,
    houseSystem: Joi.string()
      .valid('placidus', 'koch', 'equal', 'whole_sign', 'campanus', 'regiomontanus')
      .default('placidus'),
    coordinateSystem: Joi.string()
      .valid('tropical', 'sidereal')
      .default('sidereal')
  }).optional()
}).custom((value, helpers) => {
  // Ensure either coordinates or place information is provided
  const hasCoordinates = value.latitude && value.longitude;
  const hasPlaceInfo = value.placeOfBirth &&
    (typeof value.placeOfBirth === 'string' ||
     (typeof value.placeOfBirth === 'object' && (value.placeOfBirth.latitude && value.placeOfBirth.longitude)));

  if (!hasCoordinates && !hasPlaceInfo) {
    return helpers.error('custom.multifield', {
      errors: [
        { field: 'latitude', message: 'Latitude is required when place information is not provided' },
        { field: 'longitude', message: 'Longitude is required when place information is not provided' },
        { field: 'timezone', message: 'Timezone is required for accurate calculations' }
      ]
    });
  }

  return value;
}).messages({
  'custom.multifield': 'Either coordinates (latitude, longitude) or place of birth information must be provided'
});

module.exports = {
  validateBirthData,
  validateChartRequest,
  validateComprehensiveAnalysis,
  validateHouseAnalysis,
  validateAspectAnalysis,
  validateArudhaAnalysis,
  validateNavamsaAnalysis,
  validateDashaAnalysis,
  validateBirthDataValidation,
  validateChartUpdate,
  validateBulkCharts,
  validateChartComparison,
  validateRectification,
  sanitizeBirthData,
  birthDataSchema,
  flexibleBirthDataSchema,
  comprehensiveAnalysisSchema,
  analysisRequiredSchema,
  birthDataValidationSchema
};
