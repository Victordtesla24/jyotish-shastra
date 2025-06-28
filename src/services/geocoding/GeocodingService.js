/**
 * Geocoding Service
 * Handles conversion of place names to geographic coordinates
 * Integrates with OpenCage geocoding API
 */
const axios = require('axios');

class GeocodingService {
  constructor() {
    this.apiKey = process.env.GEOCODING_API_KEY;
    this.apiUrl = 'https://api.opencagedata.com/geocode/v1/json';
    if (!this.apiKey || this.apiKey === 'YOUR_OPENCAGE_API_KEY') {
      // This error will be thrown on server start if the key is not configured.
      throw new Error('GEOCODING_API_KEY is not configured. Please set it in your .env file.');
    }
  }

  /**
   * Geocode a location to get latitude and longitude
   * @param {Object} locationData - Location details
   * @returns {Object} Geocoded location data
   */
  async geocodeLocation(locationData) {
    const { city, state, country, placeOfBirth } = locationData;
    const query = placeOfBirth || `${city}, ${state}, ${country}`;

    try {
      const response = await axios.get(this.apiUrl, {
        params: {
          q: query,
          key: this.apiKey,
          limit: 1,
          no_annotations: 0
        },
        timeout: 10000
      });

      if (response.data.results && response.data.results.length > 0) {
        const result = response.data.results[0];
        const { lat, lng } = result.geometry;
        const timezone = result.annotations?.timezone?.name;

        return {
          latitude: lat,
          longitude: lng,
          timezone: timezone,
          service_used: 'opencage',
          accuracy: 'high',
          formatted_address: result.formatted
        };
      } else {
        throw new Error('Location not found');
      }
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw new Error('Geocoding API key is invalid or has exceeded its quota.');
      } else if (error.response?.status === 429) {
        throw new Error('Geocoding API rate limit exceeded. Please try again later.');
      } else {
        // Log the full error for better debugging
        console.error('Geocoding API Error:', error.message);
        throw new Error(`Geocoding API error: ${error.message}`);
      }
    }
  }

  /**
   * Validate coordinates
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @returns {boolean} True if valid
   */
  validateCoordinates(latitude, longitude) {
    return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
  }
}

module.exports = GeocodingService;
