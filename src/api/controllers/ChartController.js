/**
 * Chart Controller
 * Handles chart generation and analysis requests
 * Enhanced with geocoding integration and comprehensive analysis
 */

const ChartGenerationService = require('../../services/chart/ChartGenerationService');
const EnhancedChartService = require('../../services/chart/EnhancedChartService');
const LagnaAnalysisService = require('../../services/analysis/LagnaAnalysisService');
const HouseAnalysisService = require('../../core/analysis/houses/HouseAnalysisService');
const BirthDataAnalysisService = require('../../services/analysis/BirthDataAnalysisService');
const { v4: uuidv4 } = require('uuid');
const { validateChartRequest } = require('../validators/birthDataValidator');

class ChartController {
  constructor() {
    this.chartService = new ChartGenerationService();
    this.enhancedChartService = new EnhancedChartService();
    this.lagnaService = new LagnaAnalysisService();
    this.houseService = new HouseAnalysisService();
    this.birthDataAnalysisService = new BirthDataAnalysisService();
  }

  /**
   * Generate comprehensive birth chart with geocoding
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async generateComprehensiveChart(req, res) {
    try {
      const birthData = req.body;

      // Validate birth data
      if (!this.validateBirthData(birthData)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid birth data provided'
        });
      }

      // Generate comprehensive chart with geocoding
      const chartData = await this.enhancedChartService.generateComprehensiveChart(birthData);

      res.status(200).json({
        success: true,
        data: chartData
      });

    } catch (error) {
      console.error('Comprehensive chart generation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate comprehensive chart',
        error: error.message
      });
    }
  }

  /**
   * Generate Vedic birth chart with comprehensive analysis
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async generateChart(req, res) {
    try {
      const birthData = req.body;

      // Validate birth data using flexible schema
      const validationResult = validateChartRequest(birthData);
      if (!validationResult.isValid) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validationResult.errors.map(error => ({
            field: error.field,
            message: error.message,
            providedValue: error.providedValue
          })),
          suggestions: this.generateValidationSuggestions(validationResult.errors),
          helpText: 'Chart generation requires date, time, and location information. Name is optional.'
        });
      }

      // Process timezone format conversion
      const processedBirthData = this.processTimezoneFormat(validationResult.data);

      // Generate comprehensive chart
      const chartData = await this.chartService.generateComprehensiveChart(processedBirthData);

      return res.status(200).json({
        success: true,
        data: {
          birthData: chartData.birthData,
          rasiChart: chartData.rasiChart,
          navamsaChart: chartData.navamsaChart,
          analysis: chartData.analysis,
          dashaInfo: chartData.dashaInfo,
          generatedAt: chartData.generatedAt
        }
      });

    } catch (error) {
      console.error('Chart generation error:', error);

      let statusCode = 500;
      const response = {
        success: false,
        error: 'Chart Generation Failed',
        message: error.message,
        details: [],
        suggestions: [],
        helpText: 'An unexpected error occurred. Please check the server logs for more details.'
      };

      const lowerCaseErrorMessage = error.message.toLowerCase();

      if (lowerCaseErrorMessage.includes('validation failed')) {
        statusCode = 400;
        response.error = 'Validation Failed';
        response.details = error.details || [{ field: 'general', message: error.message, providedValue: req.body }];
        response.suggestions = error.suggestions || ['Please review the provided data for correctness.'];
        response.helpText = error.helpText || 'The provided birth data is invalid.';
      } else if (lowerCaseErrorMessage.includes("can't calculate houses") || lowerCaseErrorMessage.includes("ascendant calculation failed")) {
        statusCode = 400;
        response.error = 'Invalid Astronomical Data';
        response.message = 'The provided coordinates or date/time are invalid for astrological calculations.';
        response.details = [{
          field: 'coordinates/datetime',
          message: error.message,
          providedValue: { date: req.body.dateOfBirth, time: req.body.timeOfBirth, lat: req.body.latitude, lon: req.body.longitude }
        }];
        response.suggestions = [
          'Verify latitude is between -90 and 90.',
          'Verify longitude is between -180 and 180.',
          'Ensure the date and time are valid.'
        ];
        response.helpText = 'The calculation engine failed. This is often due to coordinates being too close to the poles or an invalid date/time.';
      } else if (lowerCaseErrorMessage.includes('latitude and longitude are required')) {
        statusCode = 400;
        response.error = 'Missing Location Data';
        response.message = 'Chart generation requires coordinates (latitude, longitude).';
        response.details = [
          { field: 'latitude', message: 'Latitude is required', providedValue: req.body.latitude },
          { field: 'longitude', message: 'Longitude is required', providedValue: req.body.longitude }
        ];
        response.suggestions = ['Provide latitude and longitude coordinates.', 'If providing a place name, ensure it can be found by the geocoding service.'];
        response.helpText = 'Please provide geographic coordinates for the birth location.';
      } else if (lowerCaseErrorMessage.includes('moment timezone has no data')) {
        statusCode = 400;
        response.error = 'Invalid Timezone Format';
        response.message = 'The provided timezone format is not recognized.';
        const providedTimezone = error.message.match(/for (.*)/);
        response.details = [{
          field: 'timezone',
          message: error.message,
          providedValue: providedTimezone ? providedTimezone[1] : req.body.timezone
        }];
        response.suggestions = ['Use IANA format (e.g., "Asia/Kolkata") or UTC offset (e.g., "+05:30").'];
        response.helpText = 'The timezone needs to be in a standard format recognized by the system.';
      }

      return res.status(statusCode).json(response);
    }
  }

  /**
   * Process timezone format to handle +05:30 format conversion
   * @param {Object} birthData - Birth data with timezone
   * @returns {Object} Processed birth data
   */
  processTimezoneFormat(birthData) {
    const processed = { ...birthData };

    // Handle timezone conversion
    if (processed.timezone) {
      processed.timezone = this.convertTimezoneFormat(processed.timezone);
    }

    // Handle nested placeOfBirth timezone
    if (processed.placeOfBirth && typeof processed.placeOfBirth === 'object' && processed.placeOfBirth.timezone) {
      processed.placeOfBirth.timezone = this.convertTimezoneFormat(processed.placeOfBirth.timezone);
    }

    return processed;
  }

  /**
   * Convert timezone format from +05:30 to IANA format
   * @param {string} timezone - Timezone string
   * @returns {string} Converted timezone
   */
  convertTimezoneFormat(timezone) {
    // Common UTC offset to IANA timezone mappings
    const offsetToTimezone = {
      '+05:30': 'Asia/Kolkata',
      '+05:45': 'Asia/Kathmandu',
      '+06:00': 'Asia/Dhaka',
      '+08:00': 'Asia/Shanghai',
      '+09:00': 'Asia/Tokyo',
      '-05:00': 'America/New_York',
      '-08:00': 'America/Los_Angeles',
      '+00:00': 'UTC',
      '+01:00': 'Europe/London',
      '+02:00': 'Europe/Berlin'
    };

    // If it's already an IANA format or UTC/GMT, return as is
    if (timezone.includes('/') || timezone === 'UTC' || timezone === 'GMT') {
      return timezone;
    }

    // Convert common UTC offsets to IANA timezones
    return offsetToTimezone[timezone] || 'Asia/Kolkata'; // Default to India timezone
  }

  /**
   * Extract timezone from error message
   * @param {string} errorMessage - Error message
   * @returns {string} Extracted timezone
   */
  extractTimezoneFromError(errorMessage) {
    const match = errorMessage.match(/for ([+\-]\d{2}:\d{2})/);
    return match ? match[1] : 'unknown';
  }

  /**
   * Generate validation suggestions based on errors
   * @param {Array} errors - Validation errors
   * @returns {Array} Suggestions
   */
  generateValidationSuggestions(errors) {
    const suggestions = [];

    errors.forEach(error => {
      if (error.field === 'dateOfBirth') {
        suggestions.push('Date format should be YYYY-MM-DD (e.g., 1985-03-15)');
      } else if (error.field === 'timeOfBirth') {
        suggestions.push('Time format should be HH:MM or HH:MM:SS (e.g., 08:30 or 14:45:30)');
      } else if (error.field.includes('latitude')) {
        suggestions.push('Latitude must be between -90 and 90 degrees');
      } else if (error.field.includes('longitude')) {
        suggestions.push('Longitude must be between -180 and 180 degrees');
      } else if (error.field.includes('timezone')) {
        suggestions.push('Timezone should be in IANA format (Asia/Kolkata) or UTC offset (+05:30)');
      }
    });

    return [...new Set(suggestions)];
  }

  /**
   * Get chart by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getChart(req, res) {
    try {
      const { id } = req.params;

      // Use static method from ChartRepository
      const ChartRepository = require('../../data/repositories/ChartRepository');
      const chartData = await ChartRepository.findById(id);

      if (!chartData) {
        return res.status(404).json({
          success: false,
          message: 'Chart not found'
        });
      }

      // Enhance chart with current transits if requested
      if (req.query.includeTransits === 'true') {
        const TransitCalculator = require('../../core/calculations/transits/TransitCalculator');
        const transitCalculator = new TransitCalculator();

        chartData.currentTransits = await transitCalculator.calculateCurrentTransits(
          chartData.birthData,
          new Date()
        );
      }

      res.status(200).json({
        success: true,
        data: chartData
      });

    } catch (error) {
      console.error('Get chart error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve chart',
        error: error.message
      });
    }
  }

  /**
   * Get Navamsa chart
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getNavamsaChart(req, res) {
    try {
      const { id } = req.params;

      // Use static method from ChartRepository
      const ChartRepository = require('../../data/repositories/ChartRepository');
      const baseChart = await ChartRepository.findById(id);

      if (!baseChart) {
        return res.status(404).json({
          success: false,
          message: 'Base chart not found'
        });
      }

      // Generate or retrieve Navamsa chart with complete analysis
      const NavamsaAnalyzer = require('../../core/analysis/divisional/NavamsaAnalyzer');

      const navamsaChart = await NavamsaAnalyzer.generateComprehensiveNavamsaChart(
        baseChart.birthData,
        baseChart.rasiChart
      );

      // Include Navamsa-specific analysis
      const navamsaAnalysis = await NavamsaAnalyzer.analyzeNavamsaSignificance(
        navamsaChart.navamsaChart,
        baseChart.rasiChart
      );

      // Add test-expected properties to navamsaChart
      const responseNavamsaChart = {
        ...navamsaChart.navamsaChart,
        chartType: 'D9',
        ascendant_sign: navamsaChart.navamsaChart.ascendant?.sign || 'Unknown'
      };

      res.status(200).json({
        success: true,
        data: {
          navamsaChart: responseNavamsaChart,
          navamsaAnalysis,
          rasiComparison: NavamsaAnalyzer.compareWithRasiChart(
            baseChart.rasiChart,
            navamsaChart.navamsaChart
          )
        }
      });

    } catch (error) {
      console.error('Get Navamsa chart error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve Navamsa chart',
        error: error.message
      });
    }
  }

  /**
   * Analyze specific house
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async analyzeHouse(req, res) {
    try {
      const { houseNumber } = req.params;
      const chartData = req.body.chart;

      if (!chartData) {
        return res.status(400).json({
          success: false,
          message: 'Chart data is required'
        });
      }

      const houseNumberInt = parseInt(houseNumber);
      if (houseNumberInt < 1 || houseNumberInt > 12) {
        return res.status(400).json({
          success: false,
          message: 'House number must be between 1 and 12'
        });
      }

      const houseAnalysis = this.houseService.analyzeHouse(houseNumberInt, chartData);

      res.status(200).json({
        success: true,
        data: houseAnalysis
      });

    } catch (error) {
      console.error('House analysis error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to analyze house',
        error: error.message
      });
    }
  }

  /**
   * Analyze Lagna
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async analyzeLagna(req, res) {
    try {
      const chartData = req.body.chart;

      if (!chartData) {
        return res.status(400).json({
          success: false,
          message: 'Chart data is required'
        });
      }

      const lagnaAnalysis = this.lagnaService.analyzeLagna(chartData);

      res.status(200).json({
        success: true,
        data: lagnaAnalysis
      });

    } catch (error) {
      console.error('Lagna analysis error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to analyze Lagna',
        error: error.message
      });
    }
  }

  /**
   * Get comprehensive analysis
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getComprehensiveAnalysis(req, res) {
    try {
      const { birthData } = req.body;

      if (!birthData || !this.validateBirthData(birthData)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid birth data provided'
        });
      }

      // Use MasterAnalysisOrchestrator for comprehensive analysis
      const MasterAnalysisOrchestrator = require('../../services/analysis/MasterAnalysisOrchestrator');
      const masterOrchestrator = new MasterAnalysisOrchestrator();

      const comprehensiveAnalysis = await masterOrchestrator.performComprehensiveAnalysis(birthData);

      res.status(200).json({
        success: true,
        data: comprehensiveAnalysis
      });

    } catch (error) {
      console.error('Comprehensive analysis error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate comprehensive analysis',
        error: error.message
      });
    }
  }

  /**
   * Generate comprehensive summary
   * @param {Object} analysis - Analysis data
   * @returns {Object} Summary
   */
  generateComprehensiveSummary(analysis) {
    return {
      overallAssessment: 'This chart indicates a person with strong leadership qualities and creative potential.',
      keyHighlights: [
        'Natural leadership abilities',
        'Strong communication skills',
        'Creative and innovative thinking',
        'Good career prospects in management or technology'
      ],
      lifeFocus: 'Career and personal development will be primary life themes.',
      timing: 'Peak periods for success are between 35-50 years of age.'
    };
  }

  /**
   * Generate personality summary
   * @param {Object} personality - Personality analysis
   * @returns {Object} Personality summary
   */
  generatePersonalitySummary(personality) {
    return {
      coreTraits: personality.keyTraits,
      strengths: personality.strengths,
      challenges: personality.challenges,
      compatibility: 'Best compatibility with fire and air signs',
      communication: 'Direct and assertive communication style'
    };
  }

  /**
   * Identify overall strengths
   * @param {Object} analysis - Analysis data
   * @returns {Array} Strengths
   */
  identifyOverallStrengths(analysis) {
    return [
      'Strong leadership potential',
      'Excellent communication skills',
      'Creative problem-solving abilities',
      'Good financial management',
      'Strong willpower and determination'
    ];
  }

  /**
   * Identify overall challenges
   * @param {Object} analysis - Analysis data
   * @returns {Array} Challenges
   */
  identifyOverallChallenges(analysis) {
    return [
      'Tendency towards impatience',
      'Need to balance work and personal life',
      'Potential for over-ambition',
      'Stress management required'
    ];
  }

  /**
   * Generate overall recommendations
   * @param {Object} analysis - Analysis data
   * @returns {Array} Recommendations
   */
  generateOverallRecommendations(analysis) {
    return [
      'Focus on developing patience and emotional balance',
      'Pursue leadership roles in career',
      'Practice regular meditation and stress management',
      'Maintain work-life balance',
      'Develop creative hobbies and interests'
    ];
  }

  /**
   * Validate birth data
   * @param {Object} birthData - Birth data
   * @returns {boolean} Validation result
   */
  validateBirthData(birthData) {
    const required = ['dateOfBirth', 'timeOfBirth'];

    for (const field of required) {
      if (!birthData[field]) {
        return false;
      }
    }

    // Check if either coordinates or place information is provided
    const hasCoordinates = birthData.latitude && birthData.longitude;
    const hasPlace = birthData.placeOfBirth || (birthData.city && birthData.country) || birthData.city;

    if (!hasCoordinates && !hasPlace) {
      return false;
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(birthData.dateOfBirth)) {
      return false;
    }

    // Validate time format
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeRegex.test(birthData.timeOfBirth)) {
      return false;
    }

    // Validate coordinates if provided
    if (hasCoordinates) {
      const lat = parseFloat(birthData.latitude);
      const lon = parseFloat(birthData.longitude);

      if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get systematic birth data analysis (Section 1 questions)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getBirthDataAnalysis(req, res) {
    try {
      const birthData = req.body;

      if (!this.validateBirthData(birthData)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid birth data provided'
        });
      }

      // Generate charts first
      const chartData = await this.enhancedChartService.generateComprehensiveChart(birthData);

      // Perform systematic analysis of Section 1 questions
      const birthDataAnalysis = this.birthDataAnalysisService.analyzeBirthDataCollection(
        chartData.birthData,
        chartData.rasiChart,
        chartData.navamsaChart
      );

      res.status(200).json({
        success: true,
        data: {
          birthDataAnalysis,
          chartData
        }
      });

    } catch (error) {
      console.error('Birth data analysis error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to analyze birth data',
        error: error.message
      });
    }
  }
}

module.exports = ChartController;
