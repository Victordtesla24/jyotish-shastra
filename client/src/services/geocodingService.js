/**
 * Geocoding Service for Backend API
 * Converts location text to latitude/longitude coordinates using backend service
 */

const BACKEND_GEOCODING_URL = 'http://localhost:3001/api/v1/geocoding/location';

class GeocodingService {
  /**
   * Geocode a location string to coordinates using backend API
   * @param {string} location - Location string (e.g., "Pune, Maharashtra, India")
   * @returns {Promise<Object>} - Geocoding result with coordinates
   */
  async geocodeLocation(location) {
    if (!location || location.trim() === '') {
      throw new Error('Location is required for geocoding');
    }

    try {
      const response = await fetch(BACKEND_GEOCODING_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          placeOfBirth: location
        })
      });

      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.data) {
        return {
          success: true,
          formatted: data.data.formatted_address || location,
          latitude: data.data.latitude,
          longitude: data.data.longitude,
          timezone: data.data.timezone || 'UTC',
          confidence: data.data.accuracy || 'high'
        };
      } else {
        return {
          success: false,
          error: 'Location not found',
          suggestions: this.generateLocationSuggestions(location)
        };
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      return {
        success: false,
        error: error.message || 'Failed to geocode location',
        suggestions: this.generateLocationSuggestions(location)
      };
    }
  }

  /**
   * Generate suggestions for better location input
   * @param {string} location - Original location string
   * @returns {Array<string>} - Suggestions for better input
   */
  generateLocationSuggestions(location) {
    const suggestions = [
      'Try adding more details (e.g., "City, State, Country")',
      'Check spelling of the location',
      'Use English names for locations',
      'Avoid abbreviations (use full names)'
    ];

    if (!location.includes(',')) {
      suggestions.unshift('Add state/country for better accuracy (e.g., "Mumbai, Maharashtra, India")');
    }

    return suggestions;
  }

  /**
   * Validate coordinates
   * @param {number} latitude - Latitude value
   * @param {number} longitude - Longitude value
   * @returns {boolean} - Whether coordinates are valid
   */
  validateCoordinates(latitude, longitude) {
    return (
      typeof latitude === 'number' &&
      typeof longitude === 'number' &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180
    );
  }

  /**
   * Format location for display
   * @param {Object} geocodingResult - Result from geocodeLocation
   * @returns {string} - Formatted location string
   */
  formatLocation(geocodingResult) {
    if (!geocodingResult || !geocodingResult.success) {
      return '';
    }

    const { components } = geocodingResult;
    if (!components) {
      return geocodingResult.formatted || '';
    }

    // Build a clean location string from components
    const parts = [];
    if (components.city) parts.push(components.city);
    else if (components.town) parts.push(components.town);
    else if (components.village) parts.push(components.village);

    if (components.state) parts.push(components.state);
    if (components.country) parts.push(components.country);

    return parts.join(', ') || geocodingResult.formatted || '';
  }
}

// Create singleton instance
const geocodingService = new GeocodingService();

export default geocodingService;
