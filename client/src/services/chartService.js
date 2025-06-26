import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

/**
 * Chart Service - Handles all chart-related API calls
 */
class ChartService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error.response?.data?.message || error.message);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Generate a birth chart
   * @param {Object} birthData - Birth data including name, date, time, and location
   * @returns {Promise<Object>} Chart data
   */
  async generateChart(birthData) {
    try {
      const response = await this.api.post('/chart', birthData);
      return response.data;
    } catch (error) {
      throw new Error(`Chart generation failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Get existing chart by ID
   * @param {string} chartId - Chart identifier
   * @returns {Promise<Object>} Chart data
   */
  async getChart(chartId) {
    try {
      const response = await this.api.get(`/chart/${chartId}`);
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
      const response = await this.api.get(`/chart/${chartId}/navamsa`);
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
      const response = await this.api.get(`/chart/${chartId}/comprehensive`);
      return response.data;
    } catch (error) {
      throw new Error(`Comprehensive analysis failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Validate birth data
   * @param {Object} birthData - Birth data to validate
   * @returns {Promise<Object>} Validation result
   */
  async validateBirthData(birthData) {
    try {
      const response = await this.api.post('/chart/validate', birthData);
      return response.data;
    } catch (error) {
      throw new Error(`Birth data validation failed: ${error.response?.data?.message || error.message}`);
    }
  }
}

// Create and export a singleton instance
const chartService = new ChartService();
export default chartService;
