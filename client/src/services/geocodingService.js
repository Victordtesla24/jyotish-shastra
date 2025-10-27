/**
 * Geocoding Service for OpenCage API
 * Converts location text to latitude/longitude coordinates
 */

const OPENCAGE_API_URL = 'https://api.opencagedata.com/geocode/v1/json';

class GeocodingService {
  /**
   * Geocode a location string to coordinates
   * @param {string} location - Location string (e.g., "Pune, Maharashtra, India")
   * @returns {Promise<Object>} - Geocoding result with coordinates
   */
  async geocodeLocation(location) {
    if (!location || location.trim() === '') {
      throw new Error('Location is required for geocoding');
    }

    const OPENCAGE_API_KEY = process.env.REACT_APP_GEOCODING_API_KEY;
    if (!OPENCAGE_API_KEY) {
      throw new Error('Geocoding API key is not configured');
    }

    try {
      const params = new URLSearchParams({
        q: location,
        key: OPENCAGE_API_KEY,
        limit: 1,
        no_annotations: 1
      });

      const response = await fetch(`${OPENCAGE_API_URL}?${params}`);

      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        return {
          success: true,
          formatted: result.formatted,
          latitude: result.geometry.lat,
          longitude: result.geometry.lng,
          components: result.components,
          timezone: result.annotations?.timezone?.name || 'UTC',
          confidence: result.confidence
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
