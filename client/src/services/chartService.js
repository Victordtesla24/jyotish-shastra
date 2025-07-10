import axios from 'axios';
import { axiosResponseInterceptor, axiosErrorInterceptor } from '../utils/apiErrorHandler';
import { APIResponseInterpreter, APIError } from '../utils/APIResponseInterpreter';
import { processChartData } from '../utils/dataTransformers';
import { validateChartResponse } from '../utils/responseSchemas';
import { ResponseCache } from '../utils/ResponseCache';
import errorFramework from '../utils/errorHandlingFramework';

// Environment-based API configuration (eliminates hardcoded endpoints)
const API_BASE_URL = process.env.REACT_APP_API_URL || (
  process.env.NODE_ENV === 'production'
    ? '/api'
    : 'http://localhost:3001/api'
);

/**
 * Chart Service - Handles all chart-related API calls
 * Enhanced with environment configuration and proper error handling
 */
class ChartService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 60000, // Increased timeout for chart generation
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Initialize response cache
    this.cache = new ResponseCache({
      ttl: 15 * 60 * 1000, // 15 minutes for chart data
      maxSize: 20,
      useLocalStorage: true,
      storageKey: 'chart_service_cache'
    });

    // Register retry configurations with error framework
    errorFramework.registerRetryConfig('/v1/chart/generate', {
      maxRetries: 3,
      shouldRetry: (error) => {
        return error instanceof APIError &&
               ['NETWORK_ERROR', 'TIMEOUT', 'SERVER_ERROR', 'CALCULATION_ERROR'].includes(error.code);
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
        console.log(`Chart API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data);
        return config;
      },
      (error) => {
        console.error('Chart API Request Error:', error);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Generate a birth chart with enhanced data validation, caching, and transformation
   * @param {Object} birthData - Birth data including name, date, time, and geocoded location
   * @returns {Promise<Object>} Processed chart data
   */
  async generateChart(birthData) {
    return errorFramework.withErrorBoundary(async () => {
      // Validate required fields before sending
      this.validateBirthDataLocally(birthData);

      const endpoint = '/v1/chart/generate';
      const cacheKey = this.generateCacheKey(birthData);

      // Check cache first
      const cachedData = this.cache.get(endpoint, { cacheKey });
      if (cachedData) {
        console.log('🎯 Chart data found in cache');
        return cachedData;
      }

      console.log('🚀 CHART GENERATION - Sending request to backend');
      console.log('📊 Request URL:', `${this.api.defaults.baseURL}${endpoint}`);
      console.log('💾 Request Payload:', JSON.stringify(birthData, null, 2));

      const originalRequest = () => this.api.post(endpoint, birthData);

      const response = await originalRequest();

      console.log('✅ CHART GENERATION SUCCESS');
      console.log('📈 Response Status:', response.status);

      // Process response with validation and transformation
      const processedData = APIResponseInterpreter.processSuccessfulResponse(response.data, {
        schema: { success: 'boolean', data: 'object' }, // Basic validation first
        transformer: processChartData
      });

      // Cache the processed data
      this.cache.set(endpoint, { cacheKey }, processedData);

      console.log('📊 Chart data processed and cached successfully');
      return processedData;

    }, {
      endpoint: '/v1/chart/generate',
      operation: 'generateChart',
      originalRequest: () => this.api.post('/v1/chart/generate', birthData)
    });
  }

  /**
   * Validate birth data locally before sending to API
   * Aligned with backend flexible schema - supports geocoding
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

    // CRITICAL FIX: Check for location data (coordinates OR place name) - matches backend schema
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

    // Validate nested coordinates if provided
    if (hasNestedCoordinates) {
      const lat = birthData.placeOfBirth.latitude;
      const lng = birthData.placeOfBirth.longitude;

      if (typeof lat !== 'number' || lat < -90 || lat > 90) {
        throw new Error('Invalid latitude value in placeOfBirth (must be between -90 and 90)');
      }

      if (typeof lng !== 'number' || lng < -180 || lng > 180) {
        throw new Error('Invalid longitude value in placeOfBirth (must be between -180 and 180)');
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

    console.log('Birth data validation passed - flexible schema validated');
  }

  /**
   * Get existing chart by ID
   * @param {string} chartId - Chart identifier
   * @returns {Promise<Object>} Chart data
   */
  async getChart(chartId) {
    try {
      const response = await this.api.get(`/v1/chart/${chartId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to retrieve chart: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Get Navamsa chart
   * @param {string} chartId - Chart identifier
   * @returns {Promise<Object>} Navamsa chart data
   */
  async getNavamsaChart(chartId) {
    try {
      const response = await this.api.get(`/v1/chart/${chartId}/navamsa`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to retrieve Navamsa chart: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Analyze chart houses
   * @param {string} chartId - Chart identifier
   * @returns {Promise<Object>} House analysis data
   */
  async analyzeHouses(chartId) {
    try {
      const response = await this.api.get(`/v1/chart/${chartId}/houses`);
      return response.data;
    } catch (error) {
      throw new Error(`House analysis failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Analyze chart lagna
   * @param {string} chartId - Chart identifier
   * @returns {Promise<Object>} Lagna analysis data
   */
  async analyzeLagna(chartId) {
    try {
      const response = await this.api.get(`/v1/chart/${chartId}/lagna`);
      return response.data;
    } catch (error) {
      throw new Error(`Lagna analysis failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Comprehensive chart analysis
   * @param {string} chartId - Chart identifier
   * @returns {Promise<Object>} Comprehensive analysis data
   */
  async getComprehensiveAnalysis(chartId) {
    try {
      const response = await this.api.get(`/v1/chart/${chartId}/comprehensive`);
      return response.data;
    } catch (error) {
      throw new Error(`Comprehensive analysis failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Validate birth data with backend
   * @param {Object} birthData - Birth data to validate
   * @returns {Promise<Object>} Validation result
   */
  async validateBirthData(birthData) {
    try {
      const response = await this.api.post('/v1/chart/validate', birthData);
      return response.data;
    } catch (error) {
      throw new Error(`Birth data validation failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Test API connectivity
   * @returns {Promise<boolean>} True if API is reachable
   */
  async testConnection() {
    try {
      const response = await this.api.get('/v1/health');
      return response.status === 200;
    } catch (error) {
      console.error('Chart API connection test failed:', error.message);
      return false;
    }
  }

  /**
   * Get API configuration info
   * @returns {Object} Current API configuration
   */
  getConfig() {
    return {
      baseURL: API_BASE_URL,
      timeout: this.api.defaults.timeout,
      environment: process.env.NODE_ENV,
      apiUrl: process.env.REACT_APP_API_URL
    };
  }
}

// Create and export a singleton instance
const chartService = new ChartService();

// Log configuration for debugging
console.log('Chart Service Configuration:', chartService.getConfig());

export default chartService;
