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

      if (!formData.timeOfBirth || !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(formData.timeOfBirth)) {
        errors.push('Please enter a valid birth time (HH:MM format)');
      } else {
        validatedData.timeOfBirth = formData.timeOfBirth;
      }

      // Location validation - coordinates OR place name required
      const hasCoordinates = formData.latitude && formData.longitude;
      const hasPlaceName = formData.placeOfBirth && formData.placeOfBirth.trim().length >= 2;

      if (!hasCoordinates && !hasPlaceName) {
        errors.push('Location is required - provide either coordinates or place name');
      } else {
        validatedData.name = formData.name?.trim() || '';
        validatedData.placeOfBirth = formData.placeOfBirth?.trim() || '';
        if (hasCoordinates) {
          validatedData.latitude = parseFloat(formData.latitude);
          validatedData.longitude = parseFloat(formData.longitude);
          validatedData.timezone = formData.timezone || 'Asia/Kolkata';
        }
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
        ...(validatedData.latitude && validatedData.longitude && {
          latitude: validatedData.latitude,
          longitude: validatedData.longitude,
          timezone: validatedData.timezone
        }),
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
        'Check time format (HH:MM)',
        'Verify location information'
      ]
    };
  }
}

export default UIToAPIDataInterpreter;
