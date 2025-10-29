/**
 * Production Geocoding Service
 * Uses backend API exclusively - no fallback mechanisms
 */

const BACKEND_GEOCODING_URL = '/api/v1/geocoding/location';

class GeocodingService {
  /**
   * Geocode a location string to coordinates using backend API
   * @param {string} location - Location string (e.g., "Pune, Maharashtra, India")
   * @returns {Promise<Object>} - Geocoding result with coordinates
   * @throws {Error} If geocoding fails
   */
  async geocodeLocation(location) {
    if (!location || location.trim() === '') {
      throw new Error('Location is required for geocoding');
    }

    try {
      const result = await this.geocodeWithBackend(location);
      if (result.success) {
        return {
          ...result,
          service_used: 'backend'
        };
      } else {
        throw new Error(result.error || 'Geocoding failed');
      }
    } catch (error) {
      throw new Error(`Geocoding failed: ${error.message}`);
    }
  }

  /**
   * Backend geocoding service
   * @param {string} location - Location string
   * @returns {Promise<Object>} - Geocoding result
   */
  async geocodeWithBackend(location) {
    try {
      const response = await fetch(BACKEND_GEOCODING_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placeOfBirth: location })
      });

      let data;
      try {
        const text = await response.text();
        if (!text) {
          throw new Error('Empty response from geocoding service');
        }
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('Failed to parse geocoding response:', parseError);
        throw new Error(`Geocoding service returned invalid response: ${response.status} ${response.statusText}`);
      }

      // Handle standard API response format
      if (response.ok && data.success && data.data) {
        return {
          success: true,
          formatted: data.data.formatted_address || location,
          latitude: data.data.latitude,
          longitude: data.data.longitude,
          timezone: data.data.timezone || 'UTC',
          confidence: data.data.accuracy || 'high'
        };
      } else {
        // Extract error message from various possible response formats
        let errorMessage = 'Backend geocoding failed';
        if (data.message) {
          errorMessage = data.message;
        } else if (data.error) {
          errorMessage = typeof data.error === 'string' ? data.error : data.error.message || String(data.error);
        } else if (data.details) {
          errorMessage = data.details;
        }
        
        // Provide user-friendly error messages based on HTTP status
        if (response.status === 404) {
          errorMessage = 'Location not found. Please try a more specific location like "City, Country"';
        } else if (response.status === 503) {
          errorMessage = 'Geocoding service temporarily unavailable. Please try again later.';
        } else if (response.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
        
        throw new Error(errorMessage);
      }
    } catch (error) {
      // Handle network errors without fallback
      if (error.name === 'TypeError' || error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
        throw new Error('Unable to connect to geocoding service. Please check your internet connection and try again.');
      }
      if (error.message) {
        throw error;
      }
      throw new Error('Geocoding failed: ' + String(error));
    }
  }

}

const geocodingServiceInstance = new GeocodingService();
export default geocodingServiceInstance;
