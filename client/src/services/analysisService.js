import axios from 'axios';

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

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('Analysis API Error:', error.response?.data?.message || error.message);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Analyze lagna (ascendant)
   * @param {string} chartId - Chart identifier
   * @returns {Promise<Object>} Lagna analysis results
   */
  async analyzeLagna(chartId) {
    try {
      const response = await this.api.get(`/comprehensive-analysis/${chartId}/lagna`);
      return response.data;
    } catch (error) {
      console.error('Error analyzing lagna:', error);
      throw new Error(`Lagna analysis failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Analyze houses
   * @param {string} chartId - Chart identifier
   * @returns {Promise<Object>} House analysis results
   */
  async analyzeHouses(chartId) {
    try {
      const response = await this.api.get(`/comprehensive-analysis/${chartId}/houses`);
      return response.data;
    } catch (error) {
      console.error('Error analyzing houses:', error);
      throw new Error(`House analysis failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Analyze planetary aspects
   * @param {string} chartId - Chart identifier
   * @returns {Promise<Object>} Aspect analysis results
   */
  async analyzeAspects(chartId) {
    try {
      const response = await this.api.get(`/comprehensive-analysis/${chartId}/aspects`);
      return response.data;
    } catch (error) {
      console.error('Error analyzing aspects:', error);
      throw new Error(`Aspect analysis failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Analyze dasha periods
   * @param {string} chartId - Chart identifier
   * @returns {Promise<Object>} Dasha analysis results
   */
  async analyzeDasha(chartId) {
    try {
      const response = await this.api.get(`/comprehensive-analysis/${chartId}/dasha`);
      return response.data;
    } catch (error) {
      console.error('Error analyzing dasha:', error);
      throw new Error(`Dasha analysis failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Analyze Navamsa chart
   * @param {string} chartId - Chart identifier
   * @returns {Promise<Object>} Navamsa analysis results
   */
  async analyzeNavamsa(chartId) {
    try {
      const response = await this.api.get(`/comprehensive-analysis/${chartId}/navamsa`);
      return response.data;
    } catch (error) {
      throw new Error(`Navamsa analysis failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Analyze Arudha padas
   * @param {string} chartId - Chart identifier
   * @returns {Promise<Object>} Arudha analysis results
   */
  async analyzeArudha(chartId) {
    try {
      const response = await this.api.get(`/comprehensive-analysis/${chartId}/arudha`);
      return response.data;
    } catch (error) {
      throw new Error(`Arudha analysis failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Detect yoga formations
   * @param {string} chartId - Chart identifier
   * @returns {Promise<Object>} Yoga detection results
   */
  async detectYogas(chartId) {
    try {
      const response = await this.api.get(`/comprehensive-analysis/${chartId}/yogas`);
      return response.data;
    } catch (error) {
      throw new Error(`Yoga detection failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Analyze luminaries (Sun and Moon)
   * @param {string} chartId - Chart identifier
   * @returns {Promise<Object>} Luminaries analysis results
   */
  async analyzeLuminaries(chartId) {
    try {
      const response = await this.api.get(`/comprehensive-analysis/${chartId}/luminaries`);
      return response.data;
    } catch (error) {
      throw new Error(`Luminaries analysis failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Get comprehensive analysis for a chart
   * @param {string} chartId - Chart identifier
   * @returns {Promise<Object>} Complete analysis results
   */
  async getComprehensiveAnalysis(chartId) {
    try {
      const response = await this.api.get(`/comprehensive-analysis/${chartId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Comprehensive analysis failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Generate birth data analysis
   * @param {Object} birthData - Birth data for analysis
   * @returns {Promise<Object>} Birth data analysis results
   */
  async generateBirthDataAnalysis(birthData) {
    try {
      const response = await this.api.post('/v1/analysis/comprehensive', birthData);
      return response.data;
    } catch (error) {
      throw new Error(`Birth data analysis failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Get analysis history for a user
   * @param {string} userId - User identifier
   * @returns {Promise<Array>} Analysis history
   */
  async getAnalysisHistory(userId) {
    try {
      const response = await this.api.get(`/comprehensive-analysis/history/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to retrieve analysis history: ${error.response?.data?.message || error.message}`);
    }
  }
}

// Create and export a singleton instance
const analysisService = new AnalysisService();
export default analysisService;
