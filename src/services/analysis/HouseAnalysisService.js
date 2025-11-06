/**
 * Service Layer House Analysis Service
 * Wraps core house analysis functionality for API layer access
 * Maintains architectural boundaries by providing service layer interface
 */

import HouseAnalysisCoreService from '../../core/analysis/houses/HouseAnalysisService.js';

class HouseAnalysisService {
  constructor() {
    this.coreService = new HouseAnalysisCoreService();
  }

  /**
   * Delegates to core service for house analysis
   * @param {number} houseNumber - House number to analyze
   * @param {Object} chartData - Chart data for analysis
   * @returns {Object} House analysis results
   */
  analyzeHouse(houseNumber, chartData) {
    return this.coreService.analyzeHouse(houseNumber, chartData);
  }
}

export default HouseAnalysisService;
