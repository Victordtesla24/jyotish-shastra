/**
 * Chart Data Manager
 * Manages chart data storage and retrieval for seamless UI integration
 */

const CHART_DATA_KEY = 'jyotish_chart_data';
const BIRTH_DATA_KEY = 'jyotish_birth_data';

class ChartDataManager {
  /**
   * Store chart data in session storage
   * @param {Object} chartData - Generated chart data
   */
  static storeChartData(chartData) {
    try {
      sessionStorage.setItem(CHART_DATA_KEY, JSON.stringify(chartData));
      console.log('Chart data stored successfully');
    } catch (error) {
      console.error('Error storing chart data:', error);
    }
  }

  /**
   * Retrieve chart data from session storage
   * @returns {Object|null} Chart data or null if not found
   */
  static getChartData() {
    try {
      const stored = sessionStorage.getItem(CHART_DATA_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error retrieving chart data:', error);
      return null;
    }
  }

  /**
   * Store birth data in session storage
   * @param {Object} birthData - Birth data used for chart generation
   */
  static storeBirthData(birthData) {
    try {
      sessionStorage.setItem(BIRTH_DATA_KEY, JSON.stringify(birthData));
      console.log('Birth data stored successfully');
    } catch (error) {
      console.error('Error storing birth data:', error);
    }
  }

  /**
   * Retrieve birth data from session storage
   * @returns {Object|null} Birth data or null if not found
   */
  static getBirthData() {
    try {
      const stored = sessionStorage.getItem(BIRTH_DATA_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error retrieving birth data:', error);
      return null;
    }
  }

  /**
   * Clear all stored data
   */
  static clearData() {
    try {
      sessionStorage.removeItem(CHART_DATA_KEY);
      sessionStorage.removeItem(BIRTH_DATA_KEY);
      console.log('Chart data cleared successfully');
    } catch (error) {
      console.error('Error clearing chart data:', error);
    }
  }

  /**
   * Check if chart data is available
   * @returns {boolean} True if chart data exists
   */
  static hasChartData() {
    return !!this.getChartData();
  }

  /**
   * Check if birth data is available
   * @returns {boolean} True if birth data exists
   */
  static hasBirthData() {
    return !!this.getBirthData();
  }

  /**
   * Get formatted birth data for API calls
   * @returns {Object|null} Formatted birth data or null
   */
  static getFormattedBirthData() {
    const birthData = this.getBirthData();
    if (!birthData) return null;

    return {
      name: birthData.name || 'User',
      dateOfBirth: birthData.dateOfBirth,
      timeOfBirth: birthData.timeOfBirth,
      placeOfBirth: birthData.placeOfBirth,
      latitude: parseFloat(birthData.latitude),
      longitude: parseFloat(birthData.longitude),
      timezone: birthData.timezone
    };
  }
}

export default ChartDataManager;
