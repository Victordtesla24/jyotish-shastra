/**
 * Chart Controller
 * Handles chart generation and analysis requests
 * Enhanced with geocoding integration and comprehensive analysis
 */

import ChartGenerationService from '../../services/chart/ChartGenerationService.js';
import GeocodingService from '../../services/geocoding/GeocodingService.js';
import LagnaAnalysisService from '../../services/analysis/LagnaAnalysisService.js';
import HouseAnalysisService from '../../core/analysis/houses/HouseAnalysisService.js';
import BirthDataAnalysisService from '../../services/analysis/BirthDataAnalysisService.js';
import { v4 as uuidv4 } from 'uuid';
import { validateChartRequest } from '../validators/birthDataValidator.js';
import crypto from 'crypto';

class ChartController {
  constructor() {
    this.geocodingService = new GeocodingService();
    this.chartService = new ChartGenerationService(this.geocodingService);
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

      // Validate birth data using flexible schema
      const validationResult = validateChartRequest(birthData);
      if (!validationResult.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Invalid birth data provided',
          errors: validationResult.errors
        });
      }

      // Generate comprehensive chart with geocoding
      const chartData = await this.chartService.generateComprehensiveChart(birthData);

      // Generate chartId to match response format expected by UI
      const { v4: uuidv4 } = await import('uuid');
      const chartId = uuidv4();

      // Format response consistently with other endpoints
      res.status(200).json({
        success: true,
        data: {
          chartId,
          ...chartData
        }
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
        const errorDetails = validationResult.errors.map(error => ({
          field: error.field,
          message: error.message,
          providedValue: error.providedValue
        }));

        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          // CRITICAL FIX: Include both "details" and "errors" for API compatibility
          details: errorDetails,
          errors: errorDetails, // E2E tests expect this property
          suggestions: this.generateValidationSuggestions(validationResult.errors),
          helpText: 'Chart generation requires date, time, and location information. Name is optional.'
        });
      }

      // Process timezone format conversion
      const processedBirthData = this.processTimezoneFormat(validationResult.data);

      // Extract coordinates from nested or flat structure
      let latitude = processedBirthData.latitude;
      let longitude = processedBirthData.longitude;

      // Check for nested placeOfBirth structure
      if (!latitude && !longitude && processedBirthData.placeOfBirth) {
        latitude = processedBirthData.placeOfBirth.latitude;
        longitude = processedBirthData.placeOfBirth.longitude;
      }

      // Geocode location only if coordinates are not provided
      if (!latitude || !longitude) {
        const geocodedData = await this.geocodingService.geocodeLocation(processedBirthData);
        Object.assign(processedBirthData, geocodedData);
      } else {
        // Ensure flat structure for downstream processing
        processedBirthData.latitude = latitude;
        processedBirthData.longitude = longitude;
      }

      // Generate comprehensive chart
      const chartData = await this.chartService.generateComprehensiveChart(processedBirthData);

      // Generate birth data analysis for the frontend
      const birthDataAnalysis = this.birthDataAnalysisService.analyzeBirthDataCollection(
        chartData.birthData,
        chartData.rasiChart,
        chartData.navamsaChart
      );

      // Generate chartId for API response
      const chartId = crypto.randomUUID();

      return res.status(200).json({
        success: true,
        data: {
          chartId: chartId,
          birthData: chartData.birthData,
          rasiChart: chartData.rasiChart,
          navamsaChart: chartData.navamsaChart,
          analysis: chartData.analysis,
          dashaInfo: chartData.dashaInfo,
          birthDataAnalysis: birthDataAnalysis,
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
      } else if (lowerCaseErrorMessage.includes('location not found')) {
        statusCode = 404;
        response.error = 'Location Not Found';
        response.message = 'The specified birth place could not be resolved to coordinates.';
        response.details = [{ field: 'placeOfBirth', message: error.message, providedValue: req.body.placeOfBirth }];
        response.suggestions = [
          'Try a more specific format like "City, State, Country".',
          'Ensure spelling is correct.'
        ];
        response.helpText = 'We could not geocode the provided location.';
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
      } else if (lowerCaseErrorMessage.includes('geocoding api error')) {
        statusCode = lowerCaseErrorMessage.includes('location not found') ? 404 : 400;
        response.error = 'Geocoding Failed';
        response.message = error.message;
        response.details = [{ field: 'placeOfBirth', message: error.message, providedValue: req.body.placeOfBirth }];
        response.suggestions = ['Provide a more specific place name (e.g., "City, State, Country")', 'Verify spelling or try nearby city.'];
        response.helpText = 'We were unable to determine coordinates for the provided place of birth.';
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
      const ChartRepository = (await import('../../data/repositories/ChartRepository.js')).default;
      const chartData = await ChartRepository.findById(id);

      if (!chartData) {
        return res.status(404).json({
          success: false,
          message: 'Chart not found'
        });
      }

      // Enhance chart with current transits if requested
      if (req.query.includeTransits === 'true') {
        const TransitCalculator = (await import('../../core/calculations/transits/TransitCalculator.js')).default;
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
      const ChartRepository = (await import('../../data/repositories/ChartRepository.js')).default;
      const baseChart = await ChartRepository.findById(id);

      if (!baseChart) {
        return res.status(404).json({
          success: false,
          message: 'Base chart not found'
        });
      }

      // Generate or retrieve Navamsa chart with complete analysis
      const NavamsaAnalyzer = (await import('../../core/analysis/divisional/NavamsaAnalyzer.js')).default;

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
      // Accept both birth data and pre-generated chart data for consistency with other endpoints
      const birthData = req.body;
      let chartData;

      if (birthData.chart) {
        // If chart data is provided, use it directly
        chartData = birthData.chart;
      } else {
        // If birth data is provided, generate chart first (like other analysis endpoints)
        // Validate birth data using flexible schema
        const validationResult = validateChartRequest(birthData);
        if (!validationResult.isValid) {
          return res.status(400).json({
            success: false,
            error: 'Validation failed',
            errors: validationResult.errors,
            suggestions: this.generateValidationSuggestions(validationResult.errors),
            helpText: 'House analysis requires date, time, and location information. Name is optional.'
          });
        }

        // Generate chart for house analysis
        chartData = await this.chartService.generateComprehensiveChart(validationResult.data);
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
      // Accept both birth data and pre-generated chart data
      const birthData = req.body;
      let chartData;

      if (req.body.chart) {
        // Pre-generated chart data provided
        chartData = req.body.chart;
      } else {
        // Birth data provided - generate chart first
        const validationResult = validateChartRequest(birthData);
        if (!validationResult.isValid) {
          return res.status(400).json({
            success: false,
            error: 'Validation failed',
            message: 'Invalid birth data provided',
            details: validationResult.errors,
            suggestions: this.generateValidationSuggestions(validationResult.errors),
            helpText: 'Lagna analysis requires valid birth date, time, and location information.'
          });
        }

        // Process timezone format conversion
        const processedBirthData = this.processTimezoneFormat(validationResult.data);

        // Extract coordinates from nested or flat structure
        let latitude = processedBirthData.latitude;
        let longitude = processedBirthData.longitude;

        // Check for nested placeOfBirth structure
        if (!latitude && !longitude && processedBirthData.placeOfBirth) {
          if (typeof processedBirthData.placeOfBirth === 'object') {
            latitude = processedBirthData.placeOfBirth.latitude;
            longitude = processedBirthData.placeOfBirth.longitude;
          }
        }

        // Geocode location only if coordinates are not provided
        if (!latitude || !longitude) {
          const geocodedData = await this.geocodingService.geocodeLocation(processedBirthData);
          Object.assign(processedBirthData, geocodedData);
        } else {
          // Ensure flat structure for downstream processing
          processedBirthData.latitude = latitude;
          processedBirthData.longitude = longitude;
        }

        // Generate comprehensive chart
        const generatedChart = await this.chartService.generateComprehensiveChart(processedBirthData);
        
        // Validate chart structure
        if (!generatedChart || !generatedChart.rasiChart) {
          throw new Error('Chart generation returned invalid structure. Expected generatedChart.rasiChart to contain ascendant and planetaryPositions.');
        }
        
        chartData = generatedChart.rasiChart;
      }

      // Validate chart data structure
      if (!chartData) {
        throw new Error('Chart data is required for lagna analysis');
      }
      
      if (!chartData.ascendant) {
        throw new Error('Ascendant data is missing from chart. Chart generation may have failed.');
      }
      
      if (!chartData.planetaryPositions && !chartData.planets) {
        throw new Error('Planetary positions are missing from chart. Chart generation may have failed.');
      }

      // Normalize planetary positions format (handle both array and object formats)
      let planetaryPositions = chartData.planetaryPositions;
      if (!planetaryPositions && chartData.planets) {
        // Convert planets array to planetaryPositions object format
        planetaryPositions = {};
        chartData.planets.forEach(planet => {
          planetaryPositions[planet.name?.toLowerCase() || planet.planet?.toLowerCase()] = {
            sign: planet.sign,
            degree: planet.degree,
            longitude: planet.longitude || planet.degree,
            house: planet.house,
            ...planet
          };
        });
        chartData.planetaryPositions = planetaryPositions;
      }

      // CRITICAL FIX: Ensure all planetary positions have house numbers calculated
      // ChartGenerationService may return positions without house numbers
      if (planetaryPositions && chartData.ascendant && chartData.ascendant.longitude !== undefined) {
        const { calculateHouseNumber } = await import('../../utils/helpers/astrologyHelpers.js');
        for (const [planetName, position] of Object.entries(planetaryPositions)) {
          if (position && typeof position.longitude === 'number' && 
              (position.house === undefined || position.house === null)) {
            try {
              position.house = calculateHouseNumber(position.longitude, chartData.ascendant.longitude);
              // Validate house number
              if (!position.house || position.house < 1 || position.house > 12) {
                // Fallback: calculate from sign difference (approximate)
                const signDiff = Math.floor((position.longitude - chartData.ascendant.longitude + 360) % 360 / 30);
                position.house = ((signDiff % 12) + 1);
              }
            } catch (error) {
              // If house calculation fails, use approximate method
              const signDiff = Math.floor((position.longitude - chartData.ascendant.longitude + 360) % 360 / 30);
              position.house = ((signDiff % 12) + 1);
            }
          }
        }
      }

      // Perform lagna analysis with error handling
      let lagnaAnalysis;
      try {
        lagnaAnalysis = this.lagnaService.analyzeLagna(chartData);
      } catch (lagnaError) {
        // Enhanced error handling for lagna analysis failures
        console.error('Lagna service analysis error:', lagnaError);
        
        // If lagna service fails, provide basic lagna information
        if (chartData.ascendant) {
          const lagnaLord = this.lagnaService.findLagnaLord(chartData.ascendant.sign);
          lagnaAnalysis = {
            lagnaSign: {
              sign: chartData.ascendant.sign,
              degree: chartData.ascendant.degree,
              longitude: chartData.ascendant.longitude,
              characteristics: [`${chartData.ascendant.sign} Ascendant`],
              message: 'Basic lagna information available. Full analysis requires complete planetary data.'
            },
            lagnaLord: {
              lord: lagnaLord,
              message: 'Lagna lord identified. Full analysis requires complete planetary positions.',
              house: null,
              effects: [`${lagnaLord} is the lord of ${chartData.ascendant.sign}`]
            },
            error: lagnaError.message,
            partial: true
          };
        } else {
          throw new Error(`Lagna analysis failed: ${lagnaError.message}. Chart data structure is invalid.`);
        }
      }

      res.status(200).json({
        success: true,
        data: {
          analysis: {
            section: 'lagna',
            lagnaAnalysis: lagnaAnalysis
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Lagna analysis error:', error);
      
      // Enhanced error response with detailed information
      const errorResponse = {
        success: false,
        error: 'Lagna Analysis Failed',
        message: error.message || 'Failed to analyze Lagna',
        details: [],
        suggestions: [],
        helpText: 'Lagna analysis requires valid birth data and successful chart generation. Please verify birth date, time, and location information.'
      };

      // Add specific error details based on error type
      if (error.message.includes('Chart generation')) {
        errorResponse.details.push({
          field: 'chart_generation',
          message: 'Chart generation failed',
          providedValue: null
        });
        errorResponse.suggestions.push('Verify birth data accuracy and completeness');
        errorResponse.suggestions.push('Check coordinates are valid');
      } else if (error.message.includes('Ascendant')) {
        errorResponse.details.push({
          field: 'ascendant',
          message: 'Ascendant calculation failed',
          providedValue: null
        });
        errorResponse.suggestions.push('Verify coordinates are correct');
        errorResponse.suggestions.push('Check timezone is accurate');
      } else if (error.message.includes('planetary')) {
        errorResponse.details.push({
          field: 'planetary_positions',
          message: 'Planetary positions calculation failed',
          providedValue: null
        });
        errorResponse.suggestions.push('Ensure date and time are valid');
        errorResponse.suggestions.push('Verify Swiss Ephemeris is initialized');
      }

      res.status(500).json(errorResponse);
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

      // Validate birth data using flexible schema
      const validationResult = validateChartRequest(birthData);
      if (!validationResult.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Invalid birth data provided',
          errors: validationResult.errors
        });
      }

      // Use MasterAnalysisOrchestrator for comprehensive analysis
      const MasterAnalysisOrchestrator = (await import('../../services/analysis/MasterAnalysisOrchestrator.js')).default;
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

  /**
   * Get systematic birth data analysis (Section 1 questions)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getBirthDataAnalysis(req, res) {
    try {
      const birthData = req.body;

      const validationResult = validateChartRequest(birthData);
      if (!validationResult.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Invalid birth data provided',
          errors: validationResult.errors
        });
      }

      // Generate charts first
      const chartData = await this.chartService.generateComprehensiveChart(birthData);

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

export default ChartController;
