/**
 * Geocoding Service
 * Handles conversion of place names to geographic coordinates
 * Integrates with OpenCage geocoding API with demo mode support
 */

const axios = require('axios');

class GeocodingService {
  constructor() {
    this.apiKey = process.env.GEOCODING_API_KEY;
    this.apiUrl = 'https://api.opencagedata.com/geocode/v1/json';
    this.isDemoMode = !this.apiKey || this.apiKey === 'demo_key_temporary_until_you_get_real_key';
  }

  /**
   * Geocode a location to get latitude and longitude
   * @param {Object} locationData - Location details
   * @returns {Object} Geocoded location data
   */
  async geocodeLocation(locationData) {
    const { city, state, country, placeOfBirth } = locationData;
    const query = placeOfBirth || `${city}, ${state}, ${country}`;

    // Check if API key is configured (dynamic check)
    const isCurrentlyInDemoMode = !this.apiKey || this.apiKey === 'demo_key_temporary_until_you_get_real_key';

    // Demo mode with predefined responses for common locations
    if (isCurrentlyInDemoMode) {
      return this.getDemoGeocodingResponse(query);
    }

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
      if (error.response?.status === 403) {
        throw new Error('Geocoding API key is invalid or has exceeded quota');
      } else if (error.response?.status === 429) {
        throw new Error('Geocoding API rate limit exceeded. Please try again later.');
      } else {
        throw new Error(`Geocoding API error: ${error.message}`);
      }
    }
  }

  /**
   * Demo mode geocoding responses for common locations
   * @param {string} query - Location query
   * @returns {Object} Demo geocoding response
   */
  getDemoGeocodingResponse(query) {
    const queryLower = query.toLowerCase();

    const demoLocations = {
      // Popular Indian Cities for Vedic Astrology
      'mumbai': { lat: 19.0760, lng: 72.8777, timezone: 'Asia/Kolkata', formatted: 'Mumbai, Maharashtra, India' },
      'delhi': { lat: 28.6139, lng: 77.2090, timezone: 'Asia/Kolkata', formatted: 'New Delhi, Delhi, India' },
      'bangalore': { lat: 12.9716, lng: 77.5946, timezone: 'Asia/Kolkata', formatted: 'Bangalore, Karnataka, India' },
      'pune': { lat: 18.5204, lng: 73.8567, timezone: 'Asia/Kolkata', formatted: 'Pune, Maharashtra, India' },
      'kolkata': { lat: 22.5726, lng: 88.3639, timezone: 'Asia/Kolkata', formatted: 'Kolkata, West Bengal, India' },
      'chennai': { lat: 13.0827, lng: 80.2707, timezone: 'Asia/Kolkata', formatted: 'Chennai, Tamil Nadu, India' },
      'hyderabad': { lat: 17.3850, lng: 78.4867, timezone: 'Asia/Kolkata', formatted: 'Hyderabad, Telangana, India' },
      'ahmedabad': { lat: 23.0225, lng: 72.5714, timezone: 'Asia/Kolkata', formatted: 'Ahmedabad, Gujarat, India' },
      'jaipur': { lat: 26.9124, lng: 75.7873, timezone: 'Asia/Kolkata', formatted: 'Jaipur, Rajasthan, India' },
      'surat': { lat: 21.1702, lng: 72.8311, timezone: 'Asia/Kolkata', formatted: 'Surat, Gujarat, India' },

      // International Cities for Testing
      'london': { lat: 51.5074, lng: -0.1278, timezone: 'Europe/London', formatted: 'London, United Kingdom' },
      'new york': { lat: 40.7128, lng: -74.0060, timezone: 'America/New_York', formatted: 'New York, NY, USA' },
      'tokyo': { lat: 35.6762, lng: 139.6503, timezone: 'Asia/Tokyo', formatted: 'Tokyo, Japan' },
      'paris': { lat: 48.8566, lng: 2.3522, timezone: 'Europe/Paris', formatted: 'Paris, France' },
      'sydney': { lat: -33.8688, lng: 151.2093, timezone: 'Australia/Sydney', formatted: 'Sydney, NSW, Australia' },
      'berlin': { lat: 52.5200, lng: 13.4050, timezone: 'Europe/Berlin', formatted: 'Berlin, Germany' },
      'los angeles': { lat: 34.0522, lng: -118.2437, timezone: 'America/Los_Angeles', formatted: 'Los Angeles, CA, USA' },
      'singapore': { lat: 1.3521, lng: 103.8198, timezone: 'Asia/Singapore', formatted: 'Singapore' },
      'dubai': { lat: 25.2048, lng: 55.2708, timezone: 'Asia/Dubai', formatted: 'Dubai, UAE' },
      'toronto': { lat: 43.6532, lng: -79.3832, timezone: 'America/Toronto', formatted: 'Toronto, ON, Canada' }
    };

    // Find matching demo location
    for (const [key, location] of Object.entries(demoLocations)) {
      if (queryLower.includes(key) || queryLower.includes(location.formatted.toLowerCase())) {
        return {
          latitude: location.lat,
          longitude: location.lng,
          timezone: location.timezone,
          service_used: 'demo_mode',
          accuracy: 'demo',
          formatted_address: location.formatted
        };
      }
    }

    throw new Error('Location not found');
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
