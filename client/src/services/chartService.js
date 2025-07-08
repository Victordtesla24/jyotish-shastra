import axios from 'axios';
import { axiosResponseInterceptor, axiosErrorInterceptor } from '../utils/apiErrorHandler';

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
   * Generate a birth chart with enhanced data validation
   * @param {Object} birthData - Birth data including name, date, time, and geocoded location
   * @returns {Promise<Object>} Chart data
   */
  async generateChart(birthData) {
    try {
      // Validate required fields before sending
      this.validateBirthDataLocally(birthData);

      console.log('🚀 CHART GENERATION DEBUG - Sending request to backend');
      console.log('📊 Request URL:', `${this.api.defaults.baseURL}/v1/chart/generate`);
      console.log('📋 Request Headers:', this.api.defaults.headers);
      console.log('💾 Request Payload:', JSON.stringify(birthData, null, 2));
      console.log('🔍 Payload Structure Analysis:', {
        hasLatitude: !!birthData.latitude,
        hasLongitude: !!birthData.longitude,
        hasTimezone: !!birthData.timezone,
        hasDate: !!birthData.dateOfBirth,
        hasTime: !!birthData.timeOfBirth,
        latitudeType: typeof birthData.latitude,
        longitudeType: typeof birthData.longitude,
        latitudeValue: birthData.latitude,
        longitudeValue: birthData.longitude,
        allFields: Object.keys(birthData)
      });

      const response = await this.api.post('/v1/chart/generate', birthData);

      console.log('✅ CHART GENERATION SUCCESS');
      console.log('📈 Response Status:', response.status);
      console.log('📋 Response Headers:', response.headers);
      console.log('💾 Response Data:', JSON.stringify(response.data, null, 2));

      if (!response.data.success) {
        throw new Error(response.data.message || 'Chart generation failed');
      }

      console.log('Chart generated successfully:', response.data);
      return response.data;

    } catch (error) {
      console.error('💥 CHART GENERATION ERROR - Detailed debugging');
      console.error('🔴 Error Type:', error.constructor.name);
      console.error('📛 Error Message:', error.message);
      console.error('🌐 Network Error:', error.code);

      if (error.response) {
        console.error('📡 Response Status:', error.response.status);
        console.error('📋 Response Headers:', error.response.headers);
        console.error('💾 Response Data:', JSON.stringify(error.response.data, null, 2));
        console.error('🔍 Backend Validation Errors:', error.response.data?.errors);
        console.error('💡 Backend Suggestions:', error.response.data?.suggestions);
        console.error('❓ Backend Help Text:', error.response.data?.helpText);
      } else if (error.request) {
        console.error('📡 Request made but no response received');
        console.error('🔍 Request Details:', error.request);
      } else {
        console.error('⚙️ Error in request setup:', error.message);
      }

      if (error.response?.status === 400) {
        const backendErrors = error.response.data?.errors || error.response.data?.details || [];
        const errorDetails = backendErrors.length > 0
          ? backendErrors.map(err => `${err.field}: ${err.message}`).join(', ')
          : error.response.data?.message || error.response.data?.error;

        throw new Error(`Backend validation failed: ${errorDetails}`);
      } else if (error.response?.status === 500) {
        throw new Error('Server error during chart calculation. Please try again.');
      } else if (error.response?.status === 503) {
        throw new Error('Chart generation service temporarily unavailable. Please try again later.');
      } else {
        throw new Error(`Chart generation failed: ${error.response?.data?.message || error.message}`);
      }
    }
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
