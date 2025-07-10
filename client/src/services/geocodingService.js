import axios from 'axios';
import { axiosResponseInterceptor, axiosErrorInterceptor } from '../utils/apiErrorHandler';
import { APIResponseInterpreter, APIError } from '../utils/APIResponseInterpreter';
import { processGeocodingData } from '../utils/dataTransformers';
import { validateGeocodingResponse } from '../utils/responseSchemas';
import { ResponseCache } from '../utils/ResponseCache';
import errorFramework from '../utils/errorHandlingFramework';

// Environment-based API configuration (eliminates hardcoded endpoints)
const API_BASE_URL = process.env.REACT_APP_API_URL || (
  process.env.NODE_ENV === 'production'
    ? '/api'
    : 'http://localhost:3001/api'
);

/**
 * Enhanced Frontend Geocoding Service
 * Provides real-time geocoding functionality with automatic coordinate resolution
 * Enhanced with API Response Interpreter integration, caching, and error handling
 */
class GeocodingService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000, // Increased timeout for better reliability
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Initialize response cache with longer TTL for geocoding data (more stable)
    this.cache = new ResponseCache({
      ttl: 60 * 60 * 1000, // 1 hour for geocoding data (locations don't change)
      maxSize: 100, // More cache entries for common locations
      useLocalStorage: true,
      storageKey: 'geocoding_service_cache'
    });

    // Register retry configurations with error framework
    errorFramework.registerRetryConfig('/v1/geocoding/location', {
      maxRetries: 2,
      shouldRetry: (error) => {
        return error instanceof APIError &&
               ['NETWORK_ERROR', 'TIMEOUT', 'SERVER_ERROR'].includes(error.code);
      }
    });

    // Enhanced response interceptor for better error handling
    this.api.interceptors.response.use(
      axiosResponseInterceptor,
      axiosErrorInterceptor
    );

    // Request interceptor for debugging
    this.api.interceptors.request.use(
      (config) => {
        console.log(`Geocoding API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data);
        return config;
      },
      (error) => {
        console.error('Geocoding API Request Error:', error);
        return Promise.reject(error);
      }
    );

    this.retryCount = 0;
    this.maxRetries = 2; // Consistent with error framework config
  }

  /**
   * Test API connectivity with automatic backend detection
   * @returns {Promise<boolean>} True if API is reachable
   */
  async testConnection() {
    return errorFramework.withErrorBoundary(async () => {
      console.log('🔍 Testing geocoding API connectivity...');

      const response = await this.api.get('/health');
      if (response.status === 200) {
        console.log('✅ Geocoding API connection successful');
        return true;
      }

      return false;
    }, {
      endpoint: '/health',
      operation: 'testConnection',
      originalRequest: () => this.api.get('/health'),
      fallbackValue: false, // Return false if connection fails
      suppressErrors: true // Don't throw errors for connection tests
    });
  }

  /**
   * Enhanced real-time geocode with retry logic, caching, and proper response processing
   * @param {string} placeOfBirth - Location string (e.g., "Pune, Maharashtra, India")
   * @returns {Promise<Object>} Processed geocoding result with latitude, longitude, and metadata
   */
  async geocodeLocation(placeOfBirth) {
    return errorFramework.withErrorBoundary(async () => {
      // Validate input
      this.validateLocationInput(placeOfBirth);

      const trimmedPlace = placeOfBirth.trim();
      const endpoint = '/v1/geocoding/location';
      const cacheKey = this.generateCacheKey(trimmedPlace);

      // Check cache first
      const cachedData = this.cache.get(endpoint, { cacheKey });
      if (cachedData) {
        console.log('🎯 Geocoding data found in cache for:', trimmedPlace);
        return cachedData;
      }

      // First, test connectivity if not already confirmed
      const isConnected = await this.testConnection();
      if (!isConnected) {
        throw new APIError({
          code: 'NETWORK_ERROR',
          message: 'Cannot connect to geocoding service',
          userMessage: 'Cannot connect to geocoding service. Please check your internet connection.'
        });
      }

      console.log(`🌍 GEOCODING REQUEST - Location: "${trimmedPlace}"`);
      console.log('📊 Request URL:', `${this.api.defaults.baseURL}${endpoint}`);

      const requestPayload = { placeOfBirth: trimmedPlace };
      const response = await this.api.post(endpoint, requestPayload);

      console.log('✅ GEOCODING SUCCESS');
      console.log('📈 Response Status:', response.status);

      // Process response with validation and transformation
      const processedData = APIResponseInterpreter.processSuccessfulResponse(response.data, {
        schema: { success: 'boolean', latitude: 'number', longitude: 'number' }, // Basic validation
        transformer: processGeocodingData
      });

      // Validate coordinates before caching
      this.validateProcessedCoordinates(processedData);

      // Cache the processed data with longer TTL
      this.cache.set(endpoint, { cacheKey }, processedData);

      console.log(`🌍 Geocoding completed and cached: ${processedData.formatted_address} (${processedData.latitude}, ${processedData.longitude})`);
      return processedData;

    }, {
      endpoint: '/v1/geocoding/location',
      operation: 'geocodeLocation',
      originalRequest: () => this.api.post('/v1/geocoding/location', { placeOfBirth: placeOfBirth?.trim() })
    });
  }

  /**
   * Validate location input
   * @param {string} placeOfBirth - Location string to validate
   * @throws {Error} If validation fails
   */
  validateLocationInput(placeOfBirth) {
    if (!placeOfBirth || typeof placeOfBirth !== 'string') {
      throw new Error('Location is required and must be a string');
    }

    const trimmed = placeOfBirth.trim();
    if (trimmed.length < 3) {
      throw new Error('Location must be at least 3 characters long');
    }

    if (trimmed.length > 200) {
      throw new Error('Location must be less than 200 characters');
    }

    // Check for potentially invalid characters
    const invalidChars = /[<>{}[\]]/;
    if (invalidChars.test(trimmed)) {
      throw new Error('Location contains invalid characters');
    }

    console.log('Location input validation passed');
  }

  /**
   * Validate processed coordinates for accuracy and range
   * @param {Object} processedData - Processed geocoding data
   * @throws {Error} If coordinates are invalid
   */
  validateProcessedCoordinates(processedData) {
    const { latitude, longitude } = processedData;

    if (!this.validateCoordinates(latitude, longitude)) {
      throw new Error('Invalid coordinates received from geocoding service');
    }

    // Additional validation for reasonable coordinate ranges
    if (Math.abs(latitude) < 0.001 && Math.abs(longitude) < 0.001) {
      console.warn('Coordinates very close to (0,0) - may be default/invalid');
    }

    console.log('Processed coordinates validation passed');
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
   * Generate cache key from location string
   * @param {string} location - Location string
   * @returns {string} Cache key
   */
  generateCacheKey(location) {
    // Normalize location for consistent caching
    const normalized = location.toLowerCase().trim()
      .replace(/\s+/g, ' ') // Multiple spaces to single space
      .replace(/[.,;]/g, ',') // Normalize separators
      .replace(/,+/g, ',') // Multiple commas to single comma
      .replace(/^,|,$/g, ''); // Remove leading/trailing commas

    return btoa(normalized).replace(/[^a-zA-Z0-9]/g, '');
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
    return errorFramework.withErrorBoundary(async () => {
      const response = await this.api.get('/v1/geocoding/validate', {
        params: { latitude, longitude }
      });

      return APIResponseInterpreter.processSuccessfulResponse(response.data, {
        schema: { valid: 'boolean' }
      });
    }, {
      endpoint: '/v1/geocoding/validate',
      operation: 'validateCoordinatesWithService',
      originalRequest: () => this.api.get('/v1/geocoding/validate', {
        params: { latitude, longitude }
      }),
      fallbackValue: {
        valid: this.validateCoordinates(latitude, longitude),
        accuracy: 'client-side-validation'
      },
      suppressErrors: true // Don't throw errors for validation service
    });
  }

  /**
   * Get popular locations for autocomplete (if supported by backend)
   * @param {string} query - Search query
   * @returns {Promise<Array>} List of location suggestions
   */
  async getLocationSuggestions(query) {
    return errorFramework.withErrorBoundary(async () => {
      if (!query || query.trim().length < 2) {
        return [];
      }

      const trimmedQuery = query.trim();
      const endpoint = '/v1/geocoding/suggestions';
      const cacheKey = this.generateCacheKey(`suggestions:${trimmedQuery}`);

      // Check cache first
      const cachedData = this.cache.get(endpoint, { cacheKey });
      if (cachedData) {
        console.log('🎯 Location suggestions found in cache for:', trimmedQuery);
        return cachedData;
      }

      const response = await this.api.get(endpoint, {
        params: { query: trimmedQuery, limit: 10 }
      });

      const processedData = APIResponseInterpreter.processSuccessfulResponse(response.data, {
        schema: { success: 'boolean', suggestions: 'array' }
      });

      // Cache suggestions with shorter TTL
      this.cache.set(endpoint, { cacheKey }, processedData.suggestions, 30 * 60 * 1000); // 30 minutes

      return processedData.suggestions;
    }, {
      endpoint: '/v1/geocoding/suggestions',
      operation: 'getLocationSuggestions',
      originalRequest: () => this.api.get('/v1/geocoding/suggestions', {
        params: { query: query?.trim(), limit: 10 }
      }),
      fallbackValue: [],
      suppressErrors: true // Don't throw errors for suggestions
    });
  }

  /**
   * Clear geocoding cache
   */
  clearCache() {
    this.cache.clear();
    console.log('Geocoding service cache cleared');
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getCacheStats() {
    return this.cache.getStats();
  }

  /**
   * Get service configuration
   * @returns {Object} Service configuration
   */
  getServiceConfig() {
    return {
      baseURL: this.api.defaults.baseURL,
      timeout: this.api.defaults.timeout,
      maxRetries: this.maxRetries,
      cacheConfig: {
        ttl: this.cache.ttl,
        maxSize: this.cache.maxSize,
        storage: this.cache.storage
      }
    };
  }
}

// Export singleton instance
const geocodingService = new GeocodingService();
export default geocodingService;
