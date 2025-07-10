import axios from 'axios';
import { axiosResponseInterceptor, axiosErrorInterceptor } from '../utils/apiErrorHandler';
import { APIResponseInterpreter, APIError } from '../utils/APIResponseInterpreter';
import { processAnalysisData } from '../utils/dataTransformers';
import { validateAnalysisResponse } from '../utils/responseSchemas';
import { ResponseCache } from '../utils/ResponseCache';
import errorFramework from '../utils/errorHandlingFramework';

// Environment-based API configuration (eliminates hardcoded endpoints)
const API_BASE_URL = process.env.REACT_APP_API_URL || (
  process.env.NODE_ENV === 'production'
    ? '/api'
    : 'http://localhost:3001/api'
);

/**
 * Analysis Service - Handles all analysis-related API calls
 * Enhanced with API Response Interpreter integration, caching, and error handling
 */
class AnalysisService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 45000, // Increased timeout for comprehensive analysis
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Initialize response cache with longer TTL for analysis data
    this.cache = new ResponseCache({
      ttl: 15 * 60 * 1000, // 15 minutes for comprehensive analysis
      maxSize: 25,
      useLocalStorage: true,
      storageKey: 'analysis_service_cache'
    });

    // Register retry configurations with error framework for analysis endpoints
    errorFramework.registerRetryConfig('/comprehensive-analysis/comprehensive', {
      maxRetries: 3,
      shouldRetry: (error) => {
        return error instanceof APIError &&
               ['NETWORK_ERROR', 'TIMEOUT', 'SERVER_ERROR', 'CALCULATION_ERROR'].includes(error.code);
      }
    });

    // Register retry configs for other analysis endpoints
    const analysisEndpoints = [
      '/comprehensive-analysis/houses',
      '/comprehensive-analysis/aspects',
      '/comprehensive-analysis/dasha',
      '/comprehensive-analysis/navamsa',
      '/comprehensive-analysis/arudha'
    ];

    analysisEndpoints.forEach(endpoint => {
      errorFramework.registerRetryConfig(endpoint, {
        maxRetries: 2,
        shouldRetry: (error) => {
          return error instanceof APIError &&
                 ['NETWORK_ERROR', 'TIMEOUT', 'SERVER_ERROR'].includes(error.code);
        }
      });
    });

    // Enhanced response interceptor for better error handling
    this.api.interceptors.response.use(
      axiosResponseInterceptor,
      axiosErrorInterceptor
    );

    // Request interceptor for debugging
    this.api.interceptors.request.use(
      (config) => {
        console.log(`Analysis API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data);
        return config;
      },
      (error) => {
        console.error('Analysis API Request Error:', error);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Generate comprehensive analysis from birth data with enhanced processing
   * @param {Object} birthData - Birth data for analysis
   * @returns {Promise<Object>} Processed comprehensive analysis results
   */
  async generateBirthDataAnalysis(birthData) {
    return errorFramework.withErrorBoundary(async () => {
      // Validate required fields before sending
      this.validateBirthDataLocally(birthData);

      const endpoint = '/comprehensive-analysis/comprehensive';
      const cacheKey = this.generateCacheKey(birthData);

      // Check cache first
      const cachedData = this.cache.get(endpoint, { cacheKey });
      if (cachedData) {
        console.log('🎯 Comprehensive analysis data found in cache');
        return cachedData;
      }

      console.log('🚀 COMPREHENSIVE ANALYSIS - Sending request to backend');
      console.log('📊 Request URL:', `${this.api.defaults.baseURL}${endpoint}`);
      console.log('💾 Request Payload:', JSON.stringify(birthData, null, 2));

      const originalRequest = () => this.api.post(endpoint, birthData);
      const response = await originalRequest();

      console.log('✅ COMPREHENSIVE ANALYSIS SUCCESS');
      console.log('📈 Response Status:', response.status);

      // Process response with validation and transformation
      const processedData = APIResponseInterpreter.processSuccessfulResponse(response.data, {
        schema: { success: 'boolean', data: 'object' }, // Basic validation
        transformer: processAnalysisData
      });

      // Cache the processed data
      this.cache.set(endpoint, { cacheKey }, processedData);

      console.log('📊 Comprehensive analysis data processed and cached successfully');
      return processedData;

    }, {
      endpoint: '/comprehensive-analysis/comprehensive',
      operation: 'generateBirthDataAnalysis',
      originalRequest: () => this.api.post('/comprehensive-analysis/comprehensive', birthData)
    });
  }

  /**
   * Analyze houses using birth data with caching and error handling
   * @param {Object} birthData - Birth data for house analysis
   * @returns {Promise<Object>} Processed house analysis results
   */
  async analyzeHouses(birthData) {
    return errorFramework.withErrorBoundary(async () => {
      this.validateBirthDataLocally(birthData);

      const endpoint = '/comprehensive-analysis/houses';
      const cacheKey = this.generateCacheKey(birthData);

      // Check cache first
      const cachedData = this.cache.get(endpoint, { cacheKey });
      if (cachedData) {
        console.log('🎯 House analysis data found in cache');
        return cachedData;
      }

      console.log('🏠 HOUSE ANALYSIS - Sending request to backend');
      const response = await this.api.post(endpoint, birthData);

      // Process response
      const processedData = APIResponseInterpreter.processSuccessfulResponse(response.data, {
        schema: { success: 'boolean', data: 'object' }
      });

      // Cache with shorter TTL for house analysis
      this.cache.set(endpoint, { cacheKey }, processedData, 10 * 60 * 1000); // 10 minutes

      console.log('✅ House analysis completed and cached');
      return processedData;

    }, {
      endpoint: '/comprehensive-analysis/houses',
      operation: 'analyzeHouses',
      originalRequest: () => this.api.post('/comprehensive-analysis/houses', birthData)
    });
  }

  /**
   * Analyze planetary aspects using birth data with enhanced processing
   * @param {Object} birthData - Birth data for aspect analysis
   * @returns {Promise<Object>} Processed aspect analysis results
   */
  async analyzeAspects(birthData) {
    return errorFramework.withErrorBoundary(async () => {
      this.validateBirthDataLocally(birthData);

      const endpoint = '/comprehensive-analysis/aspects';
      const cacheKey = this.generateCacheKey(birthData);

      // Check cache first
      const cachedData = this.cache.get(endpoint, { cacheKey });
      if (cachedData) {
        console.log('🎯 Aspect analysis data found in cache');
        return cachedData;
      }

      console.log('🔄 ASPECT ANALYSIS - Sending request to backend');
      const response = await this.api.post(endpoint, birthData);

      // Process response
      const processedData = APIResponseInterpreter.processSuccessfulResponse(response.data, {
        schema: { success: 'boolean', data: 'object' }
      });

      // Cache the processed data
      this.cache.set(endpoint, { cacheKey }, processedData, 10 * 60 * 1000);

      console.log('✅ Aspect analysis completed and cached');
      return processedData;

    }, {
      endpoint: '/comprehensive-analysis/aspects',
      operation: 'analyzeAspects',
      originalRequest: () => this.api.post('/comprehensive-analysis/aspects', birthData)
    });
  }

  /**
   * Analyze dasha periods using birth data with enhanced processing
   * @param {Object} birthData - Birth data for dasha analysis
   * @returns {Promise<Object>} Processed dasha analysis results
   */
  async analyzeDasha(birthData) {
    return errorFramework.withErrorBoundary(async () => {
      this.validateBirthDataLocally(birthData);

      const endpoint = '/comprehensive-analysis/dasha';
      const cacheKey = this.generateCacheKey(birthData);

      // Check cache first
      const cachedData = this.cache.get(endpoint, { cacheKey });
      if (cachedData) {
        console.log('🎯 Dasha analysis data found in cache');
        return cachedData;
      }

      console.log('📅 DASHA ANALYSIS - Sending request to backend');
      const response = await this.api.post(endpoint, birthData);

      // Process response
      const processedData = APIResponseInterpreter.processSuccessfulResponse(response.data, {
        schema: { success: 'boolean', data: 'object' }
      });

      // Cache the processed data
      this.cache.set(endpoint, { cacheKey }, processedData, 12 * 60 * 1000); // 12 minutes

      console.log('✅ Dasha analysis completed and cached');
      return processedData;

    }, {
      endpoint: '/comprehensive-analysis/dasha',
      operation: 'analyzeDasha',
      originalRequest: () => this.api.post('/comprehensive-analysis/dasha', birthData)
    });
  }

  /**
   * Analyze Navamsa chart using birth data with enhanced processing
   * @param {Object} birthData - Birth data for navamsa analysis
   * @returns {Promise<Object>} Processed navamsa analysis results
   */
  async analyzeNavamsa(birthData) {
    return errorFramework.withErrorBoundary(async () => {
      this.validateBirthDataLocally(birthData);

      const endpoint = '/comprehensive-analysis/navamsa';
      const cacheKey = this.generateCacheKey(birthData);

      // Check cache first
      const cachedData = this.cache.get(endpoint, { cacheKey });
      if (cachedData) {
        console.log('🎯 Navamsa analysis data found in cache');
        return cachedData;
      }

      console.log('🔀 NAVAMSA ANALYSIS - Sending request to backend');
      const response = await this.api.post(endpoint, birthData);

      // Process response
      const processedData = APIResponseInterpreter.processSuccessfulResponse(response.data, {
        schema: { success: 'boolean', data: 'object' }
      });

      // Cache the processed data
      this.cache.set(endpoint, { cacheKey }, processedData, 10 * 60 * 1000);

      console.log('✅ Navamsa analysis completed and cached');
      return processedData;

    }, {
      endpoint: '/comprehensive-analysis/navamsa',
      operation: 'analyzeNavamsa',
      originalRequest: () => this.api.post('/comprehensive-analysis/navamsa', birthData)
    });
  }

  /**
   * Analyze Arudha padas using birth data with enhanced processing
   * @param {Object} birthData - Birth data for arudha analysis
   * @returns {Promise<Object>} Processed arudha analysis results
   */
  async analyzeArudha(birthData) {
    return errorFramework.withErrorBoundary(async () => {
      this.validateBirthDataLocally(birthData);

      const endpoint = '/comprehensive-analysis/arudha';
      const cacheKey = this.generateCacheKey(birthData);

      // Check cache first
      const cachedData = this.cache.get(endpoint, { cacheKey });
      if (cachedData) {
        console.log('🎯 Arudha analysis data found in cache');
        return cachedData;
      }

      console.log('🎭 ARUDHA ANALYSIS - Sending request to backend');
      const response = await this.api.post(endpoint, birthData);

      // Process response
      const processedData = APIResponseInterpreter.processSuccessfulResponse(response.data, {
        schema: { success: 'boolean', data: 'object' }
      });

      // Cache the processed data
      this.cache.set(endpoint, { cacheKey }, processedData, 10 * 60 * 1000);

      console.log('✅ Arudha analysis completed and cached');
      return processedData;

    }, {
      endpoint: '/comprehensive-analysis/arudha',
      operation: 'analyzeArudha',
      originalRequest: () => this.api.post('/comprehensive-analysis/arudha', birthData)
    });
  }

  /**
   * Get comprehensive analysis - supports both chartId and birthData with enhanced processing
   * @param {string|Object} chartIdOrBirthData - Chart ID or birth data
   * @returns {Promise<Object>} Processed complete analysis results
   */
  async getComprehensiveAnalysis(chartIdOrBirthData) {
    return errorFramework.withErrorBoundary(async () => {
      let requestData;
      let cacheKey;

      if (typeof chartIdOrBirthData === 'string') {
        // Chart ID provided
        requestData = { chartId: chartIdOrBirthData };
        cacheKey = `chartId:${chartIdOrBirthData}`;
        console.log('Getting comprehensive analysis with chart ID:', chartIdOrBirthData);
      } else {
        // Birth data provided
        this.validateBirthDataLocally(chartIdOrBirthData);
        requestData = chartIdOrBirthData;
        cacheKey = this.generateCacheKey(chartIdOrBirthData);
        console.log('Getting comprehensive analysis with birth data:', chartIdOrBirthData);
      }

      const endpoint = '/comprehensive-analysis/comprehensive';

      // Check cache first
      const cachedData = this.cache.get(endpoint, { cacheKey });
      if (cachedData) {
        console.log('🎯 Comprehensive analysis data found in cache');
        return cachedData;
      }

      const response = await this.api.post(endpoint, requestData);

      // Process response with validation and transformation
      const processedData = APIResponseInterpreter.processSuccessfulResponse(response.data, {
        schema: { success: 'boolean', data: 'object' },
        transformer: processAnalysisData
      });

      // Cache the processed data
      this.cache.set(endpoint, { cacheKey }, processedData);

      console.log('✅ Comprehensive analysis completed successfully and cached');
      return processedData;

    }, {
      endpoint: '/comprehensive-analysis/comprehensive',
      operation: 'getComprehensiveAnalysis',
      originalRequest: () => this.api.post('/comprehensive-analysis/comprehensive',
        typeof chartIdOrBirthData === 'string'
          ? { chartId: chartIdOrBirthData }
          : chartIdOrBirthData
      )
    });
  }

  /**
   * Validate birth data locally before sending to API
   * @param {Object} birthData - Birth data to validate
   * @throws {Error} If validation fails
   */
  validateBirthDataLocally(birthData) {
    const requiredFields = ['dateOfBirth', 'timeOfBirth'];

    // Check required fields
    for (const field of requiredFields) {
      if (!birthData[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Check for location data (coordinates OR place name)
    const hasTopLevelCoordinates = birthData.latitude && birthData.longitude;
    const hasNestedCoordinates = birthData.placeOfBirth &&
      typeof birthData.placeOfBirth === 'object' &&
      birthData.placeOfBirth.latitude &&
      birthData.placeOfBirth.longitude;
    const hasPlaceName = birthData.placeOfBirth && typeof birthData.placeOfBirth === 'string';

    if (!hasTopLevelCoordinates && !hasNestedCoordinates && !hasPlaceName) {
      throw new Error('Location information required: provide either coordinates (latitude, longitude) or place of birth name for geocoding');
    }

    // Validate coordinate ranges if provided
    if (hasTopLevelCoordinates) {
      const lat = birthData.latitude;
      const lng = birthData.longitude;

      if (typeof lat !== 'number' || lat < -90 || lat > 90) {
        throw new Error('Invalid latitude value (must be between -90 and 90)');
      }

      if (typeof lng !== 'number' || lng < -180 || lng > 180) {
        throw new Error('Invalid longitude value (must be between -180 and 180)');
      }
    }

    // Validate date format
    const birthDate = new Date(birthData.dateOfBirth);
    if (isNaN(birthDate.getTime())) {
      throw new Error('Invalid date format');
    }

    // Validate time format (HH:MM or HH:MM:SS)
    const timePattern = /^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
    if (!timePattern.test(birthData.timeOfBirth)) {
      throw new Error('Invalid time format. Use HH:MM or HH:MM:SS format.');
    }

    console.log('Birth data validation passed for analysis service');
  }

  /**
   * Generate cache key from birth data
   * @param {Object} birthData - Birth data object
   * @returns {string} Cache key
   */
  generateCacheKey(birthData) {
    // Create a consistent cache key based on birth data
    const keyData = {
      date: birthData.dateOfBirth,
      time: birthData.timeOfBirth,
      lat: birthData.latitude || birthData.placeOfBirth?.latitude,
      lng: birthData.longitude || birthData.placeOfBirth?.longitude,
      place: typeof birthData.placeOfBirth === 'string' ? birthData.placeOfBirth : null
    };

    return btoa(JSON.stringify(keyData)).replace(/[^a-zA-Z0-9]/g, '');
  }

  /**
   * Legacy method names for backward compatibility
   */
  analyzeLagna(birthData) {
    return this.generateBirthDataAnalysis(birthData);
  }

  analyzeLuminaries(birthData) {
    return this.generateBirthDataAnalysis(birthData);
  }

  detectYogas(birthData) {
    return this.generateBirthDataAnalysis(birthData);
  }

  /**
   * Get analysis history for a user (placeholder - not implemented in backend yet)
   * @param {string} userId - User identifier
   * @returns {Promise<Array>} Analysis history
   */
  async getAnalysisHistory(userId) {
    try {
      console.warn('Analysis history not implemented in backend yet');
      return { success: false, message: 'Analysis history feature not available yet' };
    } catch (error) {
      console.error('Error getting analysis history:', error);
      throw new Error(`Analysis history failed: ${error.message}`);
    }
  }

  /**
   * Clear analysis cache
   */
  clearCache() {
    this.cache.clear();
    console.log('Analysis service cache cleared');
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getCacheStats() {
    return this.cache.getStats();
  }
}

// Export singleton instance
const analysisService = new AnalysisService();
export default analysisService;
