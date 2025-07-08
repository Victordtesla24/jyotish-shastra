import axios from 'axios';
import { axiosResponseInterceptor, axiosErrorInterceptor } from '../utils/apiErrorHandler';

const API_BASE_URL = process.env.REACT_APP_API_URL || (
  process.env.NODE_ENV === 'production'
    ? '/api'
    : 'http://localhost:3001/api'
);

/**
 * Analysis Service - Handles all analysis-related API calls
 */
class AnalysisService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add enhanced response interceptor for error handling
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
   * Generate comprehensive analysis from birth data
   * @param {Object} birthData - Birth data for analysis
   * @returns {Promise<Object>} Comprehensive analysis results
   */
  async generateBirthDataAnalysis(birthData) {
    try {
      console.log('Generating comprehensive analysis with birth data:', birthData);
      const response = await this.api.post('/comprehensive-analysis/comprehensive', birthData);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Analysis generation failed');
      }

      console.log('Analysis generated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Birth data analysis failed:', error);
      throw new Error(`Birth data analysis failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Analyze houses using birth data
   * @param {Object} birthData - Birth data for house analysis
   * @returns {Promise<Object>} House analysis results
   */
  async analyzeHouses(birthData) {
    try {
      console.log('Analyzing houses with birth data:', birthData);
      const response = await this.api.post('/comprehensive-analysis/houses', birthData);
      return response.data;
    } catch (error) {
      console.error('Error analyzing houses:', error);
      throw new Error(`House analysis failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Analyze planetary aspects using birth data
   * @param {Object} birthData - Birth data for aspect analysis
   * @returns {Promise<Object>} Aspect analysis results
   */
  async analyzeAspects(birthData) {
    try {
      console.log('Analyzing aspects with birth data:', birthData);
      const response = await this.api.post('/comprehensive-analysis/aspects', birthData);
      return response.data;
    } catch (error) {
      console.error('Error analyzing aspects:', error);
      throw new Error(`Aspect analysis failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Analyze dasha periods using birth data
   * @param {Object} birthData - Birth data for dasha analysis
   * @returns {Promise<Object>} Dasha analysis results
   */
  async analyzeDasha(birthData) {
    try {
      console.log('Analyzing dasha with birth data:', birthData);
      const response = await this.api.post('/comprehensive-analysis/dasha', birthData);
      return response.data;
    } catch (error) {
      console.error('Error analyzing dasha:', error);
      throw new Error(`Dasha analysis failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Analyze Navamsa chart using birth data
   * @param {Object} birthData - Birth data for navamsa analysis
   * @returns {Promise<Object>} Navamsa analysis results
   */
  async analyzeNavamsa(birthData) {
    try {
      console.log('Analyzing navamsa with birth data:', birthData);
      const response = await this.api.post('/comprehensive-analysis/navamsa', birthData);
      return response.data;
    } catch (error) {
      console.error('Error analyzing navamsa:', error);
      throw new Error(`Navamsa analysis failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Analyze Arudha padas using birth data
   * @param {Object} birthData - Birth data for arudha analysis
   * @returns {Promise<Object>} Arudha analysis results
   */
  async analyzeArudha(birthData) {
    try {
      console.log('Analyzing arudha with birth data:', birthData);
      const response = await this.api.post('/comprehensive-analysis/arudha', birthData);
      return response.data;
    } catch (error) {
      console.error('Error analyzing arudha:', error);
      throw new Error(`Arudha analysis failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Get comprehensive analysis - supports both chartId and birthData
   * @param {string|Object} chartIdOrBirthData - Chart ID or birth data
   * @returns {Promise<Object>} Complete analysis results
   */
  async getComprehensiveAnalysis(chartIdOrBirthData) {
    try {
      let requestData;

      if (typeof chartIdOrBirthData === 'string') {
        // Chart ID provided
        requestData = { chartId: chartIdOrBirthData };
        console.log('Getting comprehensive analysis with chart ID:', chartIdOrBirthData);
      } else {
        // Birth data provided
        requestData = chartIdOrBirthData;
        console.log('Getting comprehensive analysis with birth data:', chartIdOrBirthData);
      }

      const response = await this.api.post('/comprehensive-analysis/comprehensive', requestData);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Comprehensive analysis failed');
      }

      console.log('Comprehensive analysis completed successfully');
      return response.data;
    } catch (error) {
      console.error('Comprehensive analysis failed:', error);
      throw new Error(`Comprehensive analysis failed: ${error.response?.data?.message || error.message}`);
    }
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
      throw new Error(`Failed to retrieve analysis history: ${error.response?.data?.message || error.message}`);
    }
  }
}

// Create and export a singleton instance
const analysisService = new AnalysisService();
export default analysisService;
