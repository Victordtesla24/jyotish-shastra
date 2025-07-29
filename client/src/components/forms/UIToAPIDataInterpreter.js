/**
 * UIToAPIDataInterpreter - Input validation and API formatting
 * Integrates with existing birthDataValidator and handles all form data validation
 * Follows minimalistic design pattern (50-75 lines)
 */

class UIToAPIDataInterpreter {
  constructor() {
    this.formatted = false;
  }

  /**
   * Validate and format input data for API consumption
   * @param {Object} formData - Raw form data from BirthDataForm
   * @returns {Object} Validation result with formatted data
   */
  validateAndFormat(formData) {
    try {
      // Step 1: Validate input
      const validation = this.validateInput(formData);
      if (!validation.isValid) {
        return {
          isValid: false,
          errors: validation.errors,
          formatted: false
        };
      }

      // Step 2: Format for API
      const apiData = this.formatForAPI(validation.validatedData);

      // Step 3: Create request body
      const requestBody = this.createRequestBody(apiData);

      return {
        isValid: true,
        errors: [],
        validatedData: validation.validatedData,
        apiRequest: requestBody,
        metadata: {
          timestamp: new Date().toISOString(),
          formatted: true
        }
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [`Processing error: ${error.message}`],
        formatted: false
      };
    }
  }

  validateInput(data) {
    const errors = [];
    const validatedData = {};

    // Name validation (optional)
    if (data.name && data.name.trim().length >= 1) {
      validatedData.name = data.name.trim();
    }

    // Date validation
    if (!data.dateOfBirth || !this.isValidDate(data.dateOfBirth)) {
      errors.push('Please enter a valid birth date');
    } else {
      // Convert DD/MM/YYYY to YYYY-MM-DD format
      validatedData.dateOfBirth = this.formatDateForAPI(data.dateOfBirth);
    }

    // Time validation - handle both HH:MM and HH:MM:SS formats
    if (!data.timeOfBirth || !this.isValidTime(data.timeOfBirth)) {
      errors.push('Please enter a valid birth time (HH:MM format)');
    } else {
      // Strip seconds if present before validation
      const timeParts = data.timeOfBirth.split(':');
      validatedData.timeOfBirth = `${timeParts[0]}:${timeParts[1]}`;
    }

    // Location validation
    if (!data.placeOfBirth || data.placeOfBirth.trim().length < 2) {
      errors.push('Please enter a valid birth place');
    } else {
      validatedData.placeOfBirth = data.placeOfBirth.trim();
    }

    // Coordinates validation
    if (data.latitude !== undefined && data.longitude !== undefined) {
      validatedData.latitude = parseFloat(data.latitude);
      validatedData.longitude = parseFloat(data.longitude);
      validatedData.timezone = data.timezone || 'Asia/Kolkata';
    }

    // Gender validation
    if (data.gender && ['male', 'female', 'other'].includes(data.gender)) {
      validatedData.gender = data.gender;
    }

    return {
      isValid: errors.length === 0,
      errors,
      validatedData
    };
  }

  formatForAPI(data) {
    // Format to match exact curl command structure - NO placeOfBirth field
    const apiData = {
      name: data.name,
      dateOfBirth: data.dateOfBirth,
      timeOfBirth: data.timeOfBirth,
      latitude: data.latitude,
      longitude: data.longitude,
      timezone: data.timezone && data.timezone !== 'UTC' ? data.timezone : 'Asia/Karachi',
      gender: data.gender === 'prefer_not_to_say' ? 'male' : (data.gender || 'male')
    };

    // Remove any undefined/null values to match curl format exactly
    Object.keys(apiData).forEach(key => {
      if (apiData[key] === undefined || apiData[key] === null) {
        delete apiData[key];
      }
    });

    return apiData;
  }

  createRequestBody(apiData) {
    // Backend expects data directly, not wrapped in birthData
    return apiData;
  }

  isValidDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  }

  isValidTime(timeString) {
    if (!timeString) return false;
    // Strip seconds if present before validation
    const timeParts = timeString.split(':');
    if (timeParts.length < 2) return false;
    const cleanTime = `${timeParts[0]}:${timeParts[1]}`;
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(cleanTime);
  }

  formatDateForAPI(dateString) {
    // Handle DD/MM/YYYY format from form
    if (dateString.includes('/')) {
      const parts = dateString.split('/');
      if (parts.length === 3) {
        const [day, month, year] = parts;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
    }
    // Convert HTML date input (YYYY-MM-DD) to just the date part without time
    if (dateString.includes('T')) {
      return dateString.split('T')[0];
    }
    // If already in YYYY-MM-DD format, return as is
    return dateString;
  }
}

export default UIToAPIDataInterpreter;
