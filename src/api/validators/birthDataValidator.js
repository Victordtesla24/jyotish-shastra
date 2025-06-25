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
 * Validate chart generation request
 * @param {Object} data - Chart request data to validate
 * @returns {Object} Validation result
 */
function validateChartRequest(data) {
  const { error, value } = chartRequestSchema.validate(data, {
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

module.exports = {
  validateBirthData,
  validateChartRequest,
  validateChartUpdate,
  validateBulkCharts,
  validateChartComparison,
  validateRectification,
  sanitizeBirthData,

  // Export schemas for reuse
  schemas: {
    birthDataSchema,
    chartRequestSchema,
    chartUpdateSchema,
    bulkChartSchema,
    chartComparisonSchema,
    rectificationSchema
  }
};
