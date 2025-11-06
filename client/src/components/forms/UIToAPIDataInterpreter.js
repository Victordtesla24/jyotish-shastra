/**
 * UIToAPIDataInterpreter - Input Validation & API Formatting
 * Production-grade validation and formatting for birth data
 */

class UIToAPIDataInterpreter {
  /**
   * Validate input data from form
   * @param {Object} formData - Raw form data from BirthDataForm
   * @returns {Object} Validation result with { isValid, errors, validatedData }
   */
  validateInput(formData) {
    try {
      const errors = [];
      const validatedData = {};

      // Essential validation only - core required fields
      if (!formData.dateOfBirth || !new Date(formData.dateOfBirth).getTime()) {
        errors.push('Please enter a valid birth date');
      } else {
        validatedData.dateOfBirth = formData.dateOfBirth.split('T')[0];
      }

      // CRITICAL FIX: Accept both HH:MM and HH:MM:SS formats to match API validator
      // API timeSchema accepts: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/
      const timePattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
      if (!formData.timeOfBirth || !timePattern.test(formData.timeOfBirth)) {
        errors.push('Please enter a valid birth time (HH:MM or HH:MM:SS format)');
      } else {
        validatedData.timeOfBirth = formData.timeOfBirth;
      }

      // Location validation - coordinates OR place name required
      // CRITICAL FIX: Handle both nested placeOfBirth object and string format (matches API)
      const hasCoordinates = formData.latitude && formData.longitude;
      const hasNestedPlace = formData.placeOfBirth && typeof formData.placeOfBirth === 'object' && 
                            formData.placeOfBirth.latitude && formData.placeOfBirth.longitude;
      const hasPlaceString = formData.placeOfBirth && typeof formData.placeOfBirth === 'string' && 
                            formData.placeOfBirth.trim().length >= 2;
      const hasPlaceName = hasNestedPlace || hasPlaceString;

      if (!hasCoordinates && !hasPlaceName) {
        errors.push('Location is required - provide either coordinates or place name');
      } else {
        validatedData.name = formData.name?.trim() || '';
        
        // Handle place of birth - support both nested object and string format
        if (hasNestedPlace) {
          // Extract from nested placeOfBirth object
          validatedData.placeOfBirth = formData.placeOfBirth.name || '';
          validatedData.latitude = parseFloat(formData.placeOfBirth.latitude);
          validatedData.longitude = parseFloat(formData.placeOfBirth.longitude);
          validatedData.timezone = formData.placeOfBirth.timezone || formData.timezone || 'UTC';
        } else if (hasPlaceString) {
          // Handle string format
          validatedData.placeOfBirth = formData.placeOfBirth.trim();
        }
        
        // Handle top-level coordinates (takes precedence over nested if both exist)
        if (hasCoordinates) {
          validatedData.latitude = parseFloat(formData.latitude);
          validatedData.longitude = parseFloat(formData.longitude);
        }
        
        // CRITICAL FIX: Standardize default timezone logic
        // Priority: provided timezone > inferred from coordinates > place name geocoding
        if (formData.timezone) {
          validatedData.timezone = formData.timezone;
        } else if ((hasCoordinates || hasNestedPlace) && !validatedData.timezone) {
          // If coordinates are available but no timezone, use Asia/Kolkata (most common for Vedic astrology)
          validatedData.timezone = 'Asia/Kolkata';
        } else if (!hasCoordinates && !hasNestedPlace && hasPlaceString && !validatedData.timezone) {
          // Place name only - use UTC temporarily (geocoding will provide correct timezone)
          validatedData.timezone = 'UTC';
        }
        // Note: If timezone is still missing after above checks, geocoding service will determine it
      }

      if (formData.gender && ['male', 'female', 'other'].includes(formData.gender)) {
        validatedData.gender = formData.gender;
      }

      return {
        isValid: errors.length === 0,
        errors,
        validatedData
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [`Validation error: ${error.message}`],
        validatedData: {}
      };
    }
  }

  /**
   * Format validated data for API consumption
   * @param {Object} validatedData - Validated data from validateInput
   * @param {string} endpointType - Optional endpoint type (e.g., 'analysis', 'chart')
   * @returns {Object} Formatted API data with formatted flag
   */
  formatForAPI(validatedData, endpointType = null) {
    try {
      const apiData = {
        dateOfBirth: validatedData.dateOfBirth,
        timeOfBirth: validatedData.timeOfBirth,
        ...(validatedData.name && { name: validatedData.name }),
        // Include individual coordinates when available (not conditional as a group)
        ...(validatedData.latitude && { latitude: validatedData.latitude }),
        ...(validatedData.longitude && { longitude: validatedData.longitude }),
        ...(validatedData.timezone && { timezone: validatedData.timezone }),
        ...(validatedData.placeOfBirth && { placeOfBirth: validatedData.placeOfBirth }),
        ...(validatedData.gender && { gender: validatedData.gender }),
        formatted: true
      };

      return {
        apiRequest: apiData,
        formatted: true,
        ...(endpointType && { endpointType })
      };
    } catch (error) {
      throw new Error(`Formatting error: ${error.message}`);
    }
  }

  /**
   * Create final request body for API call
   * @param {Object} apiData - Formatted API data from formatForAPI
   * @returns {Object} Final request body ready for API
   */
  createRequestBody(apiData) {
    try {
      let requestBody;
      if (apiData && apiData.apiRequest) {
        requestBody = { ...apiData.apiRequest };
      } else {
        requestBody = { ...apiData };
      }
      // Remove internal formatting flags before sending to API
      if (requestBody.formatted !== undefined) {
        delete requestBody.formatted;
      }
      return requestBody;
    } catch (error) {
      throw new Error(`Request body creation error: ${error.message}`);
    }
  }

  /**
   * Validate and format input data for API consumption
   * @param {Object} formData - Raw form data from BirthDataForm
   * @returns {Object} Validation result with formatted data
   * @deprecated Use validateInput, formatForAPI, and createRequestBody separately
   */
  validateAndFormat(formData) {
    const validationResult = this.validateInput(formData);
    if (!validationResult.isValid) {
      return validationResult;
    }

    const formattedData = this.formatForAPI(validationResult.validatedData);
    const requestBody = this.createRequestBody(formattedData);

    return {
      isValid: true,
      errors: [],
      validatedData: validationResult.validatedData,
      apiRequest: requestBody,
      metadata: { timestamp: new Date().toISOString() }
    };
  }

  /**
   * Validate input data for BTR endpoints with backend schema compliance
   * @param {Object} formData - Raw form data from BirthDataForm
   * @returns {Object} Validation result with { isValid, errors, validatedData }
   */
  validateForBTR(formData) {
    try {
      const errors = [];
      const validatedData = {};

      // Enhanced date validation - check format and validity
      if (!formData.dateOfBirth) {
        errors.push('Date of birth is required');
      } else {
        // Normalize date first (handle both YYYY-MM-DD and ISO 8601 formats)
        const normalizedDate = formData.dateOfBirth.split('T')[0];
        
        // Validate normalized date format and validity
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        const isValidDate = dateRegex.test(normalizedDate) && !isNaN(Date.parse(normalizedDate));
        
        if (!isValidDate) {
          errors.push('Please enter a valid birth date (YYYY-MM-DD format)');
        } else {
          validatedData.dateOfBirth = normalizedDate;
        }
      }

      // Enhanced time validation - strictly match backend timeSchema patterns
      if (!formData.timeOfBirth) {
        errors.push('Birth time is required');
      } else {
        // Backend timeSchema pattern: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/
        const timePattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
        if (!timePattern.test(formData.timeOfBirth)) {
          errors.push('Time must be in HH:MM or HH:MM:SS format (24-hour)');
        } else {
          validatedData.timeOfBirth = formData.timeOfBirth;
        }
      }

      // Name validation (optional for analysisRequiredSchema but included if provided)
      if (formData.name && formData.name.trim()) {
        if (formData.name.trim().length < 1 || formData.name.trim().length > 100) {
          errors.push('Name must be between 1 and 100 characters');
        } else {
          validatedData.name = formData.name.trim();
        }
      }

      // Enhanced location validation following analysisRequiredSchema requirements
      const hasCoordinates = formData.latitude && formData.longitude;
      const hasPlaceName = formData.placeOfBirth && formData.placeOfBirth.trim().length >= 2;
      
      if (!hasCoordinates && !hasPlaceName) {
        errors.push('Location is required - provide either coordinates or place name');
      } else {
        // Handle place information
        if (hasPlaceName) {
          validatedData.placeOfBirth = formData.placeOfBirth.trim();
        }
        
        // Handle coordinates
        if (hasCoordinates) {
          const lat = parseFloat(formData.latitude);
          const lng = parseFloat(formData.longitude);
          
          if (isNaN(lat) || lat < -90 || lat > 90) {
            errors.push('Latitude must be between -90 and 90 degrees');
          } else {
            validatedData.latitude = lat;
          }
          
          if (isNaN(lng) || lng < -180 || lng > 180) {
            errors.push('Longitude must be between -180 and 180 degrees');
          } else {
            validatedData.longitude = lng;
          }
        }
        
        // Timezone validation and defaults with backend compatibility
        if (formData.timezone) {
          // Validate timezone format before accepting
          const utcOffsetPattern = /^[+-](0?[0-9]|1[0-4]):[0-5][0-9]$/;
          const ianaPattern = /^[A-Za-z_]+\/[A-Za-z_]+$/;
          
          if (formData.timezone === 'UTC' || formData.timezone === 'GMT' || 
              utcOffsetPattern.test(formData.timezone) || 
              ianaPattern.test(formData.timezone)) {
            validatedData.timezone = formData.timezone;
          } else {
            // Invalid timezone format - use appropriate default
            validatedData.timezone = hasCoordinates ? 'Asia/Kolkata' : 'UTC';
          }
        } else if (hasCoordinates) {
          validatedData.timezone = 'Asia/Kolkata'; // Default for coordinate-based entries
        } else {
          validatedData.timezone = 'UTC'; // Default for place-name only entries
        }
      }

      // Gender validation (optional)
      if (formData.gender && ['male', 'female', 'other'].includes(formData.gender)) {
        validatedData.gender = formData.gender;
      }

      return {
        isValid: errors.length === 0,
        errors,
        validatedData
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [`BTR validation error: ${error.message}`],
        validatedData: {}
      };
    }
  }

  /**
   * Format validated data specifically for BTR endpoints
   * Ensures compliance with analysisRequiredSchema and backend coordinate handling
   * @param {Object} validatedData - Validated data
   * @returns {Object} Formatted API request data
   */
  formatForBTR(validatedData) {
    try {
      // CRITICAL FIX: Create nested placeOfBirth structure when coordinates are available
      // Backend supports both flat and nested, but nested is more reliable
      let birthData = {
        dateOfBirth: validatedData.dateOfBirth,
        timeOfBirth: validatedData.timeOfBirth,
        // Include only available fields (no undefined values)
        ...(validatedData.name && { name: validatedData.name })
      };

      // Handle location information - create nested structure when coordinates available
      if (validatedData.latitude && validatedData.longitude) {
        // Prefer nested placeOfBirth structure for better compatibility
        birthData.placeOfBirth = {
          name: validatedData.placeOfBirth || 'Birth Location',
          latitude: validatedData.latitude,
          longitude: validatedData.longitude,
          timezone: validatedData.timezone || 'UTC'
        };
        
        // Also include flat coordinates for backend compatibility (dual structure)
        birthData.latitude = validatedData.latitude;
        birthData.longitude = validatedData.longitude;
        birthData.timezone = validatedData.timezone || 'UTC';
      } else if (validatedData.placeOfBirth) {
        // Only place name provided - no coordinates
        birthData.placeOfBirth = validatedData.placeOfBirth;
        birthData.timezone = validatedData.timezone || 'UTC';
      }

      // Include gender if provided
      if (validatedData.gender) {
        birthData.gender = validatedData.gender;
      }

      return {
        birthData: birthData,
        formattedForBTR: true
      };
    } catch (error) {
      throw new Error(`BTR formatting error: ${error.message}`);
    }
  }

  /**
   * Validate and prepare complete BTR request data
   * @param {Object} formData - Raw form data
   * @param {string} proposedTime - Proposed time for rectification (optional)
   * @returns {Object} Complete BTR request with validation
   */
  prepareBTRRequest(formData, proposedTime = null) {
    try {
      // Step 1: Validate input data
      const validationResult = this.validateForBTR(formData);
      if (!validationResult.isValid) {
        return {
          isValid: false,
          errors: validationResult.errors,
          btrRequest: null
        };
      }

      // Step 2: Format birth data for BTR
      const formattedBirthData = this.formatForBTR(validationResult.validatedData);
      
      // Step 3: Build complete request structure
      const btrRequest = {
        birthData: formattedBirthData.birthData
      };

      // Add proposedTime if provided (for quick validation endpoint)
      if (proposedTime) {
        // Validate proposedTime format matches backend timeSchema
        const timePattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
        if (!timePattern.test(proposedTime)) {
          return {
            isValid: false,
            errors: ['Proposed time must be in HH:MM or HH:MM:SS format'],
            btrRequest: null
          };
        }
        btrRequest.proposedTime = proposedTime;
      }

      return {
        isValid: true,
        errors: [],
        btrRequest: btrRequest
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [`BTR request preparation error: ${error.message}`],
        btrRequest: null
      };
    }
  }

  /**
   * Handle errors with user-friendly messages
   * @param {Error} error - Processing error
   * @returns {Object} User-friendly error information
   */
  handleErrors(error) {
    return {
      userMessage: error.message || 'Invalid birth data provided',
      technicalDetails: {
        error: error.name,
        stack: error.stack
      },
      recoverySuggestions: [
        'Check date format (YYYY-MM-DD)',
        'Check time format (HH:MM or HH:MM:SS)',
        'Verify location information (coordinates or place name)'
      ]
    };
  }
}

// Expose to window for testing validation
if (typeof window !== 'undefined') {
  window.UIToAPIDataInterpreter = UIToAPIDataInterpreter;
}

export default UIToAPIDataInterpreter;
