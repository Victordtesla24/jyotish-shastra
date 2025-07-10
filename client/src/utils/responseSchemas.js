/**
 * Response Validation Schemas - Defines expected structure for all API responses
 */

// Custom Validation Error class
export class ValidationError extends Error {
  constructor(message, path, expected, received) {
    super(message);
    this.name = 'ValidationError';
    this.path = path;
    this.expected = expected;
    this.received = received;
  }
}

// Chart Response Schema
export const ChartResponseSchema = {
  success: 'boolean',
  data: {
    chartData: {
      houses: {
        type: 'array',
        items: {
          house: 'number',
          sign: 'string',
          signLord: 'string',
          planets: {
            type: 'array',
            items: 'string'
          },
          degree: 'number'
        },
        length: 12
      },
      planets: {
        type: 'object',
        properties: {
          Sun: 'planetData',
          Moon: 'planetData',
          Mars: 'planetData',
          Mercury: 'planetData',
          Jupiter: 'planetData',
          Venus: 'planetData',
          Saturn: 'planetData',
          Rahu: 'planetData',
          Ketu: 'planetData'
        }
      },
      ascendant: {
        sign: 'string',
        degree: 'number',
        nakshatra: 'string',
        pada: 'number'
      }
    },
    metadata: {
      calculationTime: 'string',
      ephemerisVersion: 'string'
    }
  }
};

// Planet Data Schema (nested)
const PlanetDataSchema = {
  position: {
    sign: 'string',
    house: 'number',
    degree: 'number',
    nakshatra: 'string',
    pada: 'number'
  },
  strength: {
    dignity: 'string',
    retrograde: 'boolean',
    combustion: 'boolean'
  }
};

// Comprehensive Analysis Response Schema
export const AnalysisResponseSchema = {
  success: 'boolean',
  data: {
    personality: {
      ascendantAnalysis: {
        sign: 'string',
        lord: 'string',
        characteristics: {
          type: 'array',
          items: 'string'
        },
        strengths: {
          type: 'array',
          items: 'string'
        },
        challenges: {
          type: 'array',
          items: 'string'
        }
      },
      moonSignAnalysis: {
        sign: 'string',
        nakshatra: 'string',
        mentalNature: 'string'
      }
    },
    dashaAnalysis: {
      currentMahaDasha: {
        planet: 'string',
        startDate: 'string',
        endDate: 'string',
        effects: 'string'
      },
      currentAntarDasha: {
        planet: 'string',
        startDate: 'string',
        endDate: 'string',
        effects: 'string'
      }
    },
    yogas: {
      type: 'array',
      items: {
        name: 'string',
        type: 'string',
        planets: {
          type: 'array',
          items: 'string'
        },
        effects: 'string',
        strength: 'string'
      }
    },
    houseAnalysis: {
      houses: {
        type: 'array',
        items: {
          house: 'number',
          sign: 'string',
          lord: 'string',
          lordPlacement: {
            house: 'number',
            sign: 'string',
            strength: 'string'
          },
          occupants: {
            type: 'array',
            items: 'string'
          },
          aspects: {
            type: 'array',
            items: 'string'
          },
          interpretation: 'string'
        },
        length: 12
      }
    },
    predictions: {
      career: {
        current: 'string',
        recommendations: {
          type: 'array',
          items: 'string'
        },
        timing: {
          favorable: {
            type: 'array',
            items: 'string'
          },
          challenging: {
            type: 'array',
            items: 'string'
          }
        }
      },
      relationships: {
        current: 'string',
        recommendations: {
          type: 'array',
          items: 'string'
        }
      },
      health: {
        areas: {
          type: 'array',
          items: 'string'
        },
        recommendations: {
          type: 'array',
          items: 'string'
        }
      }
    }
  }
};

// Geocoding Response Schema
export const GeocodingResponseSchema = {
  success: 'boolean',
  data: {
    latitude: 'number',
    longitude: 'number',
    timezone: 'string',
    location: {
      city: 'string',
      state: 'string',
      country: 'string',
      formatted: 'string'
    }
  }
};

// Error Response Schema
export const ErrorResponseSchema = {
  success: {
    type: 'boolean',
    value: false
  },
  error: {
    code: 'string',
    message: 'string',
    details: {
      type: 'object',
      optional: true
    }
  }
};

/**
 * Validate response against schema
 * @param {Object} response - Response object to validate
 * @param {Object} schema - Schema to validate against
 * @param {string} path - Current path in object (for error reporting)
 * @throws {ValidationError} When validation fails
 */
export function validateResponse(response, schema, path = '') {
  // Handle null/undefined
  if (response === null || response === undefined) {
    throw new ValidationError(
      `Expected object at ${path || 'root'}, got ${response}`,
      path,
      'object',
      response
    );
  }

  // Validate each property in schema
  for (const [key, expectedType] of Object.entries(schema)) {
    const currentPath = path ? `${path}.${key}` : key;
    const value = response[key];

    // Handle nested schema objects
    if (typeof expectedType === 'object' && !Array.isArray(expectedType)) {
      // Check for special schema properties
      if (expectedType.type) {
        validateType(value, expectedType, currentPath);
      } else if (expectedType.properties) {
        // Nested object with properties
        validateResponse(value, expectedType.properties, currentPath);
      } else {
        // Regular nested object
        validateResponse(value, expectedType, currentPath);
      }
    } else if (expectedType === 'planetData') {
      // Special case for planet data
      validateResponse(value, PlanetDataSchema, currentPath);
    } else {
      // Simple type validation
      validateType(value, expectedType, currentPath);
    }
  }
}

/**
 * Validate value type
 * @param {*} value - Value to validate
 * @param {string|Object} expectedType - Expected type or type definition
 * @param {string} path - Current path
 * @throws {ValidationError} When validation fails
 */
function validateType(value, expectedType, path) {
  // Handle type definition objects
  if (typeof expectedType === 'object') {
    const { type, items, length, optional, value: expectedValue } = expectedType;

    // Check if field is optional
    if (optional && (value === null || value === undefined)) {
      return;
    }

    // Check specific value
    if (expectedValue !== undefined && value !== expectedValue) {
      throw new ValidationError(
        `Expected ${expectedValue} at ${path}, got ${value}`,
        path,
        expectedValue,
        value
      );
    }

    // Check array types
    if (type === 'array') {
      if (!Array.isArray(value)) {
        throw new ValidationError(
          `Expected array at ${path}, got ${typeof value}`,
          path,
          'array',
          typeof value
        );
      }

      // Check array length
      if (length !== undefined && value.length !== length) {
        throw new ValidationError(
          `Expected array of length ${length} at ${path}, got ${value.length}`,
          path,
          `array[${length}]`,
          `array[${value.length}]`
        );
      }

      // Validate array items
      if (items) {
        value.forEach((item, index) => {
          validateType(item, items, `${path}[${index}]`);
        });
      }
    } else if (type === 'object') {
      if (typeof value !== 'object' || value === null) {
        throw new ValidationError(
          `Expected object at ${path}, got ${typeof value}`,
          path,
          'object',
          typeof value
        );
      }
    } else {
      // Simple type check
      validateType(value, type, path);
    }
  } else {
    // Simple type validation
    const actualType = getType(value);
    if (actualType !== expectedType) {
      throw new ValidationError(
        `Expected ${expectedType} at ${path}, got ${actualType}`,
        path,
        expectedType,
        actualType
      );
    }
  }
}

/**
 * Get type of value
 * @param {*} value - Value to check
 * @returns {string} Type name
 */
function getType(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

/**
 * Validate chart response
 * @param {Object} response - Chart API response
 * @throws {ValidationError} When validation fails
 */
export function validateChartResponse(response) {
  validateResponse(response, ChartResponseSchema);
}

/**
 * Validate analysis response
 * @param {Object} response - Analysis API response
 * @throws {ValidationError} When validation fails
 */
export function validateAnalysisResponse(response) {
  validateResponse(response, AnalysisResponseSchema);
}

/**
 * Validate geocoding response
 * @param {Object} response - Geocoding API response
 * @throws {ValidationError} When validation fails
 */
export function validateGeocodingResponse(response) {
  validateResponse(response, GeocodingResponseSchema);
}

/**
 * Create custom schema validator
 * @param {Object} schema - Schema definition
 * @returns {Function} Validator function
 */
export function createValidator(schema) {
  return (response) => validateResponse(response, schema);
}

export default {
  ChartResponseSchema,
  AnalysisResponseSchema,
  GeocodingResponseSchema,
  ErrorResponseSchema,
  validateResponse,
  validateChartResponse,
  validateAnalysisResponse,
  validateGeocodingResponse,
  createValidator,
  ValidationError
};
