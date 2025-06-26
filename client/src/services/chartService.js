import axios from 'axios';

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
      (response) => {
        console.log('Chart API Response:', response.status, response.data);
        return response;
      },
      (error) => {
        const errorMessage = error.response?.data?.message || error.message;
        const errorDetails = error.response?.data?.error || 'Unknown error';

        console.error('Chart API Error:', {
          status: error.response?.status,
          message: errorMessage,
          details: errorDetails,
          url: error.config?.url
        });

        return Promise.reject(error);
      }
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

      console.log('Generating chart with validated data:', birthData);

      const response = await this.api.post('/v1/chart/generate', birthData);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Chart generation failed');
      }

      console.log('Chart generated successfully:', response.data);
      return response.data;

    } catch (error) {
      console.error('Chart generation error:', error);

      if (error.response?.status === 400) {
        const validationError = error.response.data?.error || error.response.data?.message;
        throw new Error(`Validation failed: ${validationError}`);
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
   * @param {Object} birthData - Birth data to validate
   * @throws {Error} If validation fails
   */
  validateBirthDataLocally(birthData) {
    const requiredFields = ['name', 'dateOfBirth', 'timeOfBirth', 'placeOfBirth', 'latitude', 'longitude', 'timezone'];

    for (const field of requiredFields) {
      if (!birthData[field] && birthData[field] !== 0) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate coordinate ranges
    if (typeof birthData.latitude !== 'number' || birthData.latitude < -90 || birthData.latitude > 90) {
      throw new Error('Invalid latitude value');
    }

    if (typeof birthData.longitude !== 'number' || birthData.longitude < -180 || birthData.longitude > 180) {
      throw new Error('Invalid longitude value');
    }

    // Validate date format
    const birthDate = new Date(birthData.dateOfBirth);
    if (isNaN(birthDate.getTime())) {
      throw new Error('Invalid date format');
    }

    // Validate time format (HH:MM)
    const timePattern = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timePattern.test(birthData.timeOfBirth)) {
      throw new Error('Invalid time format. Use HH:MM format.');
    }

    console.log('Birth data validation passed');
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
      const response = await this.api.get(`/chart/${chartId}/houses`);
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
      const response = await this.api.get(`/chart/${chartId}/lagna`);
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
      const response = await this.api.get('/health');
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
