/**
 * Chart Controller
 * Handles chart generation and analysis requests
 * Enhanced with geocoding integration and comprehensive analysis
 */

import GeocodingService from '../../services/geocoding/GeocodingService.js';
import LagnaAnalysisService from '../../services/analysis/LagnaAnalysisService.js';
import HouseAnalysisService from '../../services/analysis/HouseAnalysisService.js';
import BirthDataAnalysisService from '../../services/analysis/BirthDataAnalysisService.js';
import { validateChartRequest } from '../validators/birthDataValidator.js';
import crypto from 'crypto';
import ChartGenerationServiceSingleton from '../../services/chart/ChartGenerationService.js';

class ChartController {
  constructor() {
    this.geocodingService = new GeocodingService();
    // Initialize singleton reference (will be initialized when first used)
    this.chartService = null;
    this.lagnaService = new LagnaAnalysisService();
    this.houseService = new HouseAnalysisService();
    this.birthDataAnalysisService = new BirthDataAnalysisService();
  }

  /**
   * Get ChartGenerationService singleton instance
   * @returns {Promise<ChartGenerationService>}
   */
  async getChartService() {
    if (!this.chartService) {
      this.chartService = await ChartGenerationServiceSingleton.getInstance();
    }
    return this.chartService;
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
      const chartService = await this.getChartService();
      const chartData = await chartService.generateComprehensiveChart(birthData);

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
    let processedBirthData = null; // Declare outside try block for catch block access
    
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
      processedBirthData = this.processTimezoneFormat(validationResult.data);

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
        try {
          const geocodedData = await this.geocodingService.geocodeLocation(processedBirthData);
          Object.assign(processedBirthData, geocodedData);
        } catch (geocodingError) {
          // Handle geocoding errors with structured response
          const lowerCaseGeocodingError = geocodingError.message?.toLowerCase() || '';
          const isNotFound = lowerCaseGeocodingError.includes('location not found') || 
                           lowerCaseGeocodingError.includes('no geocoding results found');
          
          return res.status(isNotFound ? 404 : 400).json({
            success: false,
            error: isNotFound ? 'Location Not Found' : 'Geocoding Failed',
            message: isNotFound 
              ? 'The specified birth place could not be resolved to coordinates.'
              : 'We were unable to determine coordinates for the provided place of birth.',
            details: [{
              field: 'placeOfBirth',
              message: geocodingError.message || 'Geocoding failed',
              providedValue: req.body.placeOfBirth || processedBirthData.placeOfBirth
            }],
            suggestions: [
              'Try a more specific format like "City, State, Country".',
              'Ensure spelling is correct.',
              'Verify the place name exists and is accessible.'
            ],
            helpText: 'We could not geocode the provided location. Please provide a valid place name or coordinates directly.'
          });
        }
      } else {
        // Ensure flat structure for downstream processing
        processedBirthData.latitude = latitude;
        processedBirthData.longitude = longitude;
      }

      // Initialize chart service if not already initialized
      const chartService = await this.getChartService();

      // Generate comprehensive chart
      const chartData = await chartService.generateComprehensiveChart(processedBirthData);

      // PHASE 2: Verify house numbers in chartData.rasiChart.planetaryPositions before analysis
      const planetsWithHouses = Object.entries(chartData.rasiChart?.planetaryPositions || {}).filter(
        ([_name, data]) => data.house && typeof data.house === 'number' && data.house >= 1 && data.house <= 12
      );
      const planetsWithoutHouses = Object.entries(chartData.rasiChart?.planetaryPositions || {}).filter(
        ([_name, data]) => !data.house || typeof data.house !== 'number' || data.house < 1 || data.house > 12
      );
      
      console.log(`📊 ChartController.generateChart: chartData.rasiChart.planetaryPositions - ${planetsWithHouses.length} with houses, ${planetsWithoutHouses.length} without houses`);
      if (planetsWithoutHouses.length > 0) {
        console.error(`❌ ChartController.generateChart: Planets missing house numbers:`, planetsWithoutHouses.map(([name]) => name));
        console.error(`❌ ChartController.generateChart: Sample planet without house:`, planetsWithoutHouses[0]);
      } else {
        console.log(`✅ ChartController.generateChart: All planets have valid house numbers`);
      }

      // Generate birth data analysis for the frontend
      const birthDataAnalysis = this.birthDataAnalysisService.analyzeBirthDataCollection(
        chartData.birthData,
        chartData.rasiChart,
        chartData.navamsaChart
      );

      // PHASE 2: Verify house numbers in chartData.rasiChart.planetaryPositions before JSON serialization
      const planetsWithHousesAfterAnalysis = Object.entries(chartData.rasiChart?.planetaryPositions || {}).filter(
        ([_name, data]) => data.house && typeof data.house === 'number' && data.house >= 1 && data.house <= 12
      );
      console.log(`📊 ChartController.generateChart: After analysis - ${planetsWithHousesAfterAnalysis.length} planets with houses`);

      // Generate chartId for API response
      const chartId = crypto.randomUUID();

      // PHASE 2: Verify house numbers in final response object before JSON serialization
      const responseData = {
        chartId: chartId,
        birthData: chartData.birthData,
        rasiChart: chartData.rasiChart,
        navamsaChart: chartData.navamsaChart,
        analysis: chartData.analysis,
        dashaInfo: chartData.dashaInfo,
        birthDataAnalysis: birthDataAnalysis,
        generatedAt: chartData.generatedAt
      };
      
      const finalPlanetsWithHouses = Object.entries(responseData.rasiChart?.planetaryPositions || {}).filter(
        ([_name, data]) => data.house && typeof data.house === 'number' && data.house >= 1 && data.house <= 12
      );
      console.log(`📊 ChartController.generateChart: Final response - ${finalPlanetsWithHouses.length} planets with houses`);

      return res.status(200).json({
        success: true,
        data: responseData
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

      // Extract error message - handle nested error messages
      const errorMessage = error.message || '';
      const lowerCaseErrorMessage = errorMessage.toLowerCase();
      
      // Check for nested error messages (errors wrapped in "Failed to generate comprehensive chart:")
      // Extract the last part after the last colon for nested error messages
      const nestedErrorMessage = errorMessage.includes(':') 
        ? errorMessage.split(':').slice(-1)[0].trim().toLowerCase()
        : lowerCaseErrorMessage;
      
      // Also check if error message contains key phrases anywhere (for nested errors)
      const hasTimezoneError = lowerCaseErrorMessage.includes('timezone is required') || 
                              nestedErrorMessage.includes('timezone is required');
      const hasGeocodingError = lowerCaseErrorMessage.includes('geocoding') || 
                               lowerCaseErrorMessage.includes('no geocoding results found') ||
                               nestedErrorMessage.includes('geocoding') ||
                               nestedErrorMessage.includes('no geocoding results');

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
      } else if (hasTimezoneError) {
        statusCode = 400;
        response.error = 'Missing Timezone';
        response.message = 'Timezone is required for accurate chart calculations.';
        response.details = [{
          field: 'timezone',
          message: 'Timezone is required for chart generation. Please provide timezone in birth data.',
          providedValue: req.body.timezone || null
        }];
        response.suggestions = [
          'Use IANA format (e.g., "Asia/Kolkata") or UTC offset (e.g., "+05:30").',
          'If providing a place name, timezone will be automatically determined from coordinates.'
        ];
        response.helpText = 'The timezone needs to be in a standard format recognized by the system.';
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
      } else if (hasGeocodingError) {
        const isNotFound = lowerCaseErrorMessage.includes('location not found') || 
                          lowerCaseErrorMessage.includes('no geocoding results found') || 
                          nestedErrorMessage.includes('no geocoding results');
        statusCode = isNotFound ? 404 : 400;
        response.error = isNotFound ? 'Location Not Found' : 'Geocoding Failed';
        response.message = isNotFound 
          ? 'The specified birth place could not be resolved to coordinates.'
          : 'We were unable to determine coordinates for the provided place of birth.';
        const errorDetailMessage = errorMessage.includes(':') 
          ? errorMessage.split(':').slice(-1)[0].trim() 
          : (error.message || 'Geocoding failed');
        response.details = [{ 
          field: 'placeOfBirth', 
          message: errorDetailMessage, 
          providedValue: req.body.placeOfBirth || null
        }];
        response.suggestions = [
          'Try a more specific format like "City, State, Country".',
          'Ensure spelling is correct.',
          'Verify the place name exists and is accessible.'
        ];
        response.helpText = 'We could not geocode the provided location. Please provide a valid place name or coordinates directly.';
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
    const match = errorMessage.match(/for ([+-]\d{2}:\d{2})/);
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

        // Initialize chart service if not already initialized
        const chartService = await this.getChartService();
        
        // Generate chart for house analysis
        chartData = await chartService.generateComprehensiveChart(validationResult.data);
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

        // Initialize chart service if not already initialized
        const chartService = await this.getChartService();
        
        // Generate comprehensive chart
        const generatedChart = await chartService.generateComprehensiveChart(processedBirthData);
        
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
        for (const [_planetName, position] of Object.entries(planetaryPositions)) {
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
  generateComprehensiveSummary(_analysis) {
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
  identifyOverallStrengths(_analysis) {
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
  identifyOverallChallenges(_analysis) {
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
  generateOverallRecommendations(_analysis) {
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
   * Render chart as SVG (new rendering service)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async renderChartSVG(req, res) {
    try {
      // PRODUCTION-GRADE: Detailed request logging for debugging
      console.log('🔍 renderChartSVG: Request received');
      console.log('📦 Request body keys:', Object.keys(req.body || {}));
      console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
      console.log('📦 Request headers:', JSON.stringify(req.headers, null, 2));

      // Extract rendering options from request body
      // CRITICAL FIX: Extract chartType to determine if rendering Rasi or Navamsa chart
      const { width = 800, includeData = false, chartType = 'rasi', ...birthData } = req.body;

      console.log('🔍 Extracted rendering options:', { width, includeData, chartType });
      console.log('🔍 Extracted birth data keys:', Object.keys(birthData));
      console.log('🔍 Extracted birth data:', JSON.stringify(birthData, null, 2));

      // PRODUCTION-GRADE: Preprocess birth data for compatibility
      // Ensure frontend chartService output is compatible with ChartGenerationService expectations
      const preprocessedBirthData = this.preprocessBirthDataForGeneration(birthData);
      console.log('🔍 Preprocessed birth data:', {
        originalKeys: Object.keys(birthData),
        preprocessedKeys: Object.keys(preprocessedBirthData),
        hasCorrectDateFormat: !!preprocessedBirthData.dateOfBirth,
        hasCorrectTimeFormat: !!preprocessedBirthData.timeOfBirth
      });

      // PRODUCTION-GRADE: Handle different request formats
      // Some requests may include pre-generated chart data, others need full generation
      let chartDataToRender = null;
      let birthDataForGeneration = null;

      // Check if request includes pre-generated chart data
      if (preprocessedBirthData.chartData || preprocessedBirthData.rasiChart) {
        chartDataToRender = preprocessedBirthData.chartData || preprocessedBirthData;
        console.log('🔍 renderChartSVG: Using provided chart data');
      } else {
        // Generate chart from preprocessed birth data
        birthDataForGeneration = preprocessedBirthData;
        console.log('🔍 renderChartSVG: Will generate chart from preprocessed birth data');
      }

      // Validate birth data if generation is needed
      if (birthDataForGeneration) {
        const validationResult = validateChartRequest(birthDataForGeneration);
        
        console.log('🔍 Validation result:', {
          isValid: validationResult.isValid,
          errorsCount: validationResult.errors?.length || 0,
          errors: validationResult.errors
        });
        if (!validationResult.isValid) {
          return res.status(400).json({
            success: false,
            message: 'Invalid birth data provided',
            errors: validationResult.errors
          });
        }
      }

      // Get or generate chart data
      const chartService = await this.getChartService();
      let chartData;
      try {
        if (chartDataToRender) {
          // Use provided chart data
          chartData = chartDataToRender;
          console.log('✅ renderChartSVG: Using provided chart data', {
            hasRasiChart: !!chartData.rasiChart,
            hasNavamsaChart: !!chartData.navamsaChart,
            hasBirthData: !!chartData.birthData
          });
        } else if (birthDataForGeneration) {
          // Generate chart from birth data
          chartData = await chartService.generateComprehensiveChart(birthDataForGeneration);
          console.log('✅ renderChartSVG: Chart data generated successfully', {
            hasRasiChart: !!chartData.rasiChart,
            hasNavamsaChart: !!chartData.navamsaChart,
            hasBirthData: !!chartData.birthData
          });
        } else {
          throw new Error('No chart data or birth data provided for rendering');
        }
      } catch (error) {
        console.error('❌ renderChartSVG: Chart data processing failed:', error);
        console.error('Error stack:', error.stack);
        throw new Error(`Chart data processing failed: ${error.message}`);
      }

      // CRITICAL: Generate birthDataAnalysis for house number extraction
      // ChartRenderingService requires birthDataAnalysis to extract house numbers from nested structure
      console.log('🔍 renderChartSVG: Generating birthDataAnalysis...');
      let birthDataAnalysis;
      try {
        // Use available birthData from chart or fall back to original request
        const birthDataForAnalysis = chartData.birthData || birthDataForGeneration || {};
        birthDataAnalysis = this.birthDataAnalysisService.analyzeBirthDataCollection(
          birthDataForAnalysis,
          chartData.rasiChart,
          chartData.navamsaChart
        );
        console.log('✅ renderChartSVG: birthDataAnalysis generated successfully', {
          hasAnalyses: !!birthDataAnalysis?.analyses,
          hasPlanetaryPositions: !!birthDataAnalysis?.analyses?.planetaryPositions
        });
      } catch (error) {
        console.error('❌ renderChartSVG: birthDataAnalysis generation failed:', error);
        console.error('Error stack:', error.stack);
        throw new Error(`birthDataAnalysis generation failed: ${error.message}`);
      }

      // Attach birthDataAnalysis to chartData for ChartRenderingService
      const enhancedChartData = {
        ...chartData,
        birthDataAnalysis: birthDataAnalysis
      };

      // PRODUCTION-GRADE: Ensure complete house positions data
      // Check if housePositions is present and complete
      console.log('🔍 renderChartSVG: Validating house positions data...');
      const housePositions = chartData.rasiChart?.housePositions || chartData.housePositions;
      if (!housePositions || !Array.isArray(housePositions) || housePositions.length !== 12) {
        console.error('❌ renderChartSVG: Incomplete house positions data', {
          hasHousePositions: !!housePositions,
          isArray: Array.isArray(housePositions),
          length: housePositions?.length,
          expected: 12
        });
        throw new Error('Complete house positions data is required for rendering. Expected array of 12 houses with signId.');
      }

      // Validate each house has required data
      const houseValidationErrors = [];
      housePositions.forEach((house, index) => {
        const houseNumber = index + 1;
        if (!house) {
          houseValidationErrors.push(`House ${houseNumber} is missing`);
        } else {
          const signId = typeof house === 'object' ? house.signId : house;
          if (!signId || signId < 1 || signId > 12) {
            houseValidationErrors.push(`House ${houseNumber} has invalid signId: ${signId}`);
          }
        }
      });

      if (houseValidationErrors.length > 0) {
        console.error('❌ renderChartSVG: House validation errors:', houseValidationErrors);
        throw new Error(`House validation failed: ${houseValidationErrors.join(', ')}`);
      }

      console.log('✅ renderChartSVG: House positions validation passed');

      // Import rendering service dynamically to avoid import issues
      console.log('🔍 renderChartSVG: Importing ChartRenderingService...');
      let renderingService;
      try {
        const { default: ChartRenderingService } = await import('../../services/chart/ChartRenderingService.js');
        renderingService = new ChartRenderingService();
        console.log('✅ renderChartSVG: ChartRenderingService imported successfully');
      } catch (error) {
        console.error('❌ renderChartSVG: ChartRenderingService import failed:', error);
        console.error('Error stack:', error.stack);
        throw new Error(`ChartRenderingService import failed: ${error.message}`);
      }

      // Validate chart data
      console.log('🔍 renderChartSVG: Validating chart data...');
      let validation;
      try {
        validation = renderingService.validateChartData(enhancedChartData);
        console.log('✅ renderChartSVG: Chart data validation result:', {
          valid: validation.valid,
          errorsCount: validation.errors?.length || 0,
          warningsCount: validation.warnings?.length || 0
        });
        if (!validation.valid) {
          console.error('❌ renderChartSVG: Validation errors:', validation.errors);
          return res.status(500).json({
            success: false,
            message: 'Chart data validation failed',
            errors: validation.errors,
            warnings: validation.warnings
          });
        }
      } catch (error) {
        console.error('❌ renderChartSVG: Validation process failed:', error);
        console.error('Error stack:', error.stack);
        throw new Error(`Chart data validation process failed: ${error.message}`);
      }

      // Generate SVG
      console.log('🔍 renderChartSVG: Rendering SVG...', { chartType });
      let svgContent;
      try {
        // CRITICAL FIX: Pass chartType to rendering service
        svgContent = renderingService.renderChartSVG(enhancedChartData, { 
          width: parseInt(width),
          chartType: chartType // Determines if rendering Rasi (D1) or Navamsa (D9)
        });
        console.log('✅ renderChartSVG: SVG generated successfully', {
          chartType: chartType,
          svgLength: svgContent?.length || 0,
          hasBackground: svgContent?.includes('#FFF8E1'),
          lineCount: (svgContent?.match(/<line/g) || []).length
        });
      } catch (error) {
        console.error('❌ renderChartSVG: SVG rendering failed:', error);
        console.error('Error stack:', error.stack);
        console.error('Enhanced chart data structure:', {
          hasRasiChart: !!enhancedChartData.rasiChart,
          hasBirthDataAnalysis: !!enhancedChartData.birthDataAnalysis,
          rasiChartKeys: Object.keys(enhancedChartData.rasiChart || {})
        });
        throw new Error(`SVG rendering failed: ${error.message}`);
      }

      const response = { svg: svgContent };
      
      if (includeData) {
        response.chartData = enhancedChartData;
        response.renderData = renderingService.transformToRenderFormat(enhancedChartData);
      }

      res.status(200).json({
        success: true,
        data: response,
        metadata: {
          width: parseInt(width),
          renderedAt: new Date().toISOString(),
          service: 'ChartRenderingService',
          warnings: validation.warnings
        }
      });

    } catch (error) {
      console.error('Chart rendering error:', error);
      console.error('Error stack:', error.stack);
      console.error('Request body:', JSON.stringify(req.body, null, 2));
      res.status(500).json({
        success: false,
        message: 'Failed to render chart',
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Render chart metadata (without SVG)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async renderChart(req, res) {
    try {
      const birthData = req.body;

      // Validate birth data
      const validationResult = validateChartRequest(birthData);
      if (!validationResult.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Invalid birth data provided',
          errors: validationResult.errors
        });
      }

      // Generate chart data
      const chartService = await this.getChartService();
      const chartData = await chartService.generateComprehensiveChart(birthData);

      // Import rendering service dynamically
      const { default: ChartRenderingService } = await import('../../services/chart/ChartRenderingService.js');
      const renderingService = new ChartRenderingService();

      // Validate and transform
      const validation = renderingService.validateChartData(chartData);
      if (!validation.valid) {
        return res.status(500).json({
          success: false,
          message: 'Chart data validation failed',
          errors: validation.errors
        });
      }

      const renderData = renderingService.transformToRenderFormat(chartData);

      res.status(200).json({
        success: true,
        data: {
          chartData,
          renderData,
          chartSpec: renderingService.getChartSpec()
        },
        metadata: {
          renderedAt: new Date().toISOString(),
          service: 'ChartRenderingService',
          warnings: validation.warnings
        }
      });

    } catch (error) {
      console.error('Chart render metadata error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to prepare chart for rendering',
        error: error.message
      });
    }
  }

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
      const chartService = await this.getChartService();
      const chartData = await chartService.generateComprehensiveChart(birthData);

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

  /**
   * Preprocess birth data for compatibility between frontend and backend
   * Simplified preprocessing for better reliability
   * @param {Object} birthData - Raw birth data from frontend
   * @returns {Object} Preprocessed birth data ready for ChartGenerationService
   */
  preprocessBirthDataForGeneration(birthData) {
    try {
      // Create a clean copy to avoid mutation
      const processed = { ...birthData };

      // Fix date format compatibility
      if (processed.dateOfBirth && typeof processed.dateOfBirth === 'string') {
        // If it's an ISO date string, extract just the date part
        if (processed.dateOfBirth.includes('T')) {
          processed.dateOfBirth = processed.dateOfBirth.split('T')[0];
        }
      } else if (processed.dateOfBirth instanceof Date) {
        // Convert Date to YYYY-MM-DD string
        processed.dateOfBirth = processed.dateOfBirth.toISOString().split('T')[0];
      }

      // Ensure time format compatibility
      if (processed.timeOfBirth && typeof processed.timeOfBirth === 'string') {
        // Remove AM/PM if present and clean up format
        processed.timeOfBirth = processed.timeOfBirth.trim().replace(/\s*(AM|PM)$/i, '');
      }

      // Ensure coordinates are numbers
      if (processed.latitude && processed.longitude) {
        processed.latitude = parseFloat(processed.latitude);
        processed.longitude = parseFloat(processed.longitude);
      }

      // Handle placeOfBirth format - multiple format support
      if (processed.placeOfBirth) {
        if (typeof processed.placeOfBirth === 'object' && processed.placeOfBirth.name) {
          processed.placeOfBirth = processed.placeOfBirth.name;
        } else if (typeof processed.placeOfBirth === 'string') {
          // Keep string as-is (backend geocoder will handle)
        }
      }

      // CRITICAL FIX: Set default timezone if missing for chart generation
      if (!processed.timezone && processed.placeOfBirth) {
        // Default to Asia/Kolkata for India, or use UTC for other locations
        processed.timezone = 'Asia/Kolkata';
      } else if (!processed.timezone) {
        processed.timezone = 'UTC';
      }

      console.log('✅ preprocessBirthDataForGeneration: Processed data', {
        hasDate: !!processed.dateOfBirth,
        hasTime: !!processed.timeOfBirth,
        hasPlace: !!processed.placeOfBirth,
        hasCoordinates: !!(processed.latitude && processed.longitude),
        hasTimezone: !!processed.timezone
      });

      return processed;
    } catch (error) {
      console.error('❌ preprocessBirthDataForGeneration: Processing error:', error.message);
      // Return original data if preprocessing fails
      return birthData;
    }
  }
}

export default ChartController;
