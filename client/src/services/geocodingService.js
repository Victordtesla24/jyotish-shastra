import axios from 'axios';
import { axiosResponseInterceptor, axiosErrorInterceptor } from '../utils/apiErrorHandler';

// Environment-based API configuration (no hardcoded endpoints)
const API_BASE_URL = process.env.REACT_APP_API_URL || (
  process.env.NODE_ENV === 'production'
    ? '/api'
    : 'http://localhost:3001/api'
);

/**
 * Enhanced Frontend Geocoding Service
 * Provides real-time geocoding functionality with automatic coordinate resolution
 */
class GeocodingService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 5000, // Reduced timeout to fail faster and not block UI
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.api.interceptors.response.use(
      axiosResponseInterceptor,
      axiosErrorInterceptor
    );

    this.retryCount = 0;
    this.maxRetries = 1; // Reduced retries to prevent API overload
  }

  /**
   * Test API connectivity with automatic backend detection
   * @returns {Promise<boolean>} True if API is reachable
   */
  async testConnection() {
    try {
      console.log('🔍 Testing geocoding API connectivity...');
      const response = await this.api.get('/health');
      if (response.status === 200) {
        console.log('✅ Geocoding API connection successful');
        return true;
      }
    } catch (error) {
      console.warn('⚠️ Primary API connection failed, attempting fallback...');

      // Try alternative endpoints
      try {
        const fallbackResponse = await axios.get(`${API_BASE_URL}/health`);
        if (fallbackResponse.status === 200) {
          console.log('✅ Fallback API connection successful');
          return true;
        }
      } catch (fallbackError) {
        console.error('❌ All API connections failed:', fallbackError.message);
        return false;
      }
    }
    return false;
  }

  /**
   * Enhanced real-time geocode with retry logic and fallbacks
   * @param {string} placeOfBirth - Location string (e.g., "Pune, Maharashtra, India")
   * @returns {Promise<Object>} Geocoding result with latitude, longitude, and metadata
   */
  async geocodeLocation(placeOfBirth) {
    if (!placeOfBirth || typeof placeOfBirth !== 'string') {
      throw new Error('Location is required');
    }

    const trimmedPlace = placeOfBirth.trim();
    if (trimmedPlace.length < 3) {
      throw new Error('Location must be at least 3 characters long');
    }

    // First, test connectivity
    const isConnected = await this.testConnection();
    if (!isConnected) {
      throw new Error('Cannot connect to geocoding service. Please check your internet connection.');
    }

    return this._geocodeWithRetry(trimmedPlace);
  }

  /**
   * Internal method with retry logic
   * @private
   */
  async _geocodeWithRetry(trimmedPlace, attempt = 1) {
    try {
      console.log(`🌍 Geocoding attempt ${attempt}: "${trimmedPlace}"`);

      const response = await this.api.post('/v1/geocoding/location', {
        placeOfBirth: trimmedPlace
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Geocoding failed');
      }

      const { latitude, longitude, formatted_address, accuracy, service_used, timezone } = response.data;

      if (!this.validateCoordinates(latitude, longitude)) {
        throw new Error('Invalid coordinates received from geocoding service');
      }

      console.log(`✅ Geocoding successful: ${formatted_address} (${latitude}, ${longitude})`);

      return {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        formatted_address: formatted_address || trimmedPlace,
        accuracy: accuracy || 'unknown',
        service_used: service_used || 'api',
        timezone: timezone || 'UTC',
        success: true
      };
    } catch (error) {
      console.error(`❌ Geocoding attempt ${attempt} failed:`, error.message);

      // Retry logic - but not for rate limiting or server errors
      if (attempt < this.maxRetries &&
          !error.response?.status &&
          !error.message.includes('rate limit') &&
          !error.message.includes('500')) {
        console.log(`🔄 Retrying geocoding (${attempt + 1}/${this.maxRetries})...`);
        await this._delay(2000 * attempt); // Longer backoff
        return this._geocodeWithRetry(trimmedPlace, attempt + 1);
      }

      // Enhanced error handling
      if (error.response?.status === 404) {
        throw new Error('Location not found. Please try a more specific address (e.g., "City, State, Country").');
      } else if (error.response?.status === 429) {
        throw new Error('Too many requests. Please try again in a moment.');
      } else if (error.response?.status === 500) {
        throw new Error('Server temporarily overloaded. Please wait and try again.');
      } else if (error.response?.status === 503) {
        throw new Error('Geocoding service temporarily unavailable. Please try again later.');
      } else if (error.code === 'ECONNREFUSED') {
        throw new Error('Cannot connect to server. Please ensure the backend is running.');
      } else {
        throw new Error(`Unable to find location: ${error.message}`);
      }
    }
  }

  /**
   * Delay helper for retry logic
   * @private
   */
  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Validate coordinates for accuracy
   * @param {number} latitude - Latitude value
   * @param {number} longitude - Longitude value
   * @returns {boolean} True if coordinates are valid
   */
  validateCoordinates(latitude, longitude) {
    return (
      typeof latitude === 'number' &&
      typeof longitude === 'number' &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180 &&
      !isNaN(latitude) &&
      !isNaN(longitude) &&
      isFinite(latitude) &&
      isFinite(longitude)
    );
  }

  /**
   * Parse and extract city, state, country from place string
   * @param {string} placeOfBirth - Complete place string
   * @returns {Object} Parsed location components
   */
  parseLocationComponents(placeOfBirth) {
    if (!placeOfBirth || typeof placeOfBirth !== 'string') {
      return { city: '', state: '', country: '' };
    }

    const parts = placeOfBirth.split(',').map(part => part.trim());

    if (parts.length >= 3) {
      return {
        city: parts[0] || '',
        state: parts[1] || '',
        country: parts[2] || ''
      };
    } else if (parts.length === 2) {
      return {
        city: parts[0] || '',
        state: '',
        country: parts[1] || ''
      };
    } else {
      return {
        city: parts[0] || '',
        state: '',
        country: ''
      };
    }
  }

  /**
   * Validate coordinates with enhanced precision checking
   * @param {number} latitude - Latitude to validate
   * @param {number} longitude - Longitude to validate
   * @returns {Promise<Object>} Validation result
   */
  async validateCoordinatesWithService(latitude, longitude) {
    try {
      const response = await this.api.get('/v1/geocoding/validate', {
        params: { latitude, longitude }
      });
      return response.data;
    } catch (error) {
      console.warn('Coordinate validation service unavailable:', error.message);
      return {
        valid: this.validateCoordinates(latitude, longitude),
        accuracy: 'client-side-validation'
      };
    }
  }
}

// Create and export singleton instance
const geocodingService = new GeocodingService();
export default geocodingService;
