/**
 * Geocoding Service
 * Handles conversion of place names to geographic coordinates
 * Integrates with a reliable third-party geocoding API
 */

const axios = require('axios');

class GeocodingService {
  constructor() {
    this.apiKey = process.env.GEOCODING_API_KEY;
    this.apiUrl = 'https://api.opencagedata.com/geocode/v1/json';
  }

  /**
   * Geocode a location to get latitude and longitude
   * @param {Object} locationData - Location details
   * @returns {Object} Geocoded location data
   */
  async geocodeLocation(locationData) {
    if (!this.apiKey) {
      throw new Error('Geocoding API key not configured');
    }

    const { city, state, country, placeOfBirth } = locationData;
    const query = placeOfBirth || `${city}, ${state}, ${country}`;

    try {
      const response = await axios.get(this.apiUrl, {
        params: {
          q: query,
          key: this.apiKey,
          limit: 1,
          no_annotations: 1
        }
      });

      if (response.data.results.length > 0) {
        const { lat, lng } = response.data.results[0].geometry;
        return {
          latitude: lat,
          longitude: lng,
          service_used: 'opencage',
          accuracy: 'high',
          formatted_address: response.data.results[0].formatted
        };
      } else {
        throw new Error('Location not found');
      }
    } catch (error) {
      throw new Error(`Geocoding API error: ${error.message}`);
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
