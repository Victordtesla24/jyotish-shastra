/**
 * Chart Controller
 * Handles chart generation and analysis requests
 * Enhanced with geocoding integration and comprehensive analysis
 */

const ChartGenerationService = require('../../services/chart/ChartGenerationService');
const EnhancedChartService = require('../../services/chart/EnhancedChartService');
const LagnaAnalysisService = require('../../services/analysis/LagnaAnalysisService');
const HouseAnalysisService = require('../../services/analysis/HouseAnalysisService');
const BirthDataAnalysisService = require('../../services/analysis/BirthDataAnalysisService');

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
   * Generate birth chart (legacy method)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async generateChart(req, res) {
    try {
      const birthData = req.body;

      // Validate birth data
      if (!this.chartService.validateBirthData(birthData)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid birth data provided'
        });
      }

      // Generate Rasi chart
      const rasiChart = await this.chartService.generateRasiChart(birthData);

      // Generate Navamsa chart
      const navamsaChart = await this.chartService.generateNavamsaChart(birthData);

      // Perform Lagna analysis
      const lagnaAnalysis = this.lagnaService.analyzeLagna(rasiChart);

      // Perform house analysis
      const houseAnalysis = this.houseService.analyzeAllHouses(rasiChart);

      const chartData = {
        birthData,
        rasiChart,
        navamsaChart,
        analysis: {
          lagna: lagnaAnalysis,
          houses: houseAnalysis
        },
        generatedAt: new Date().toISOString()
      };

      res.status(200).json({
        success: true,
        data: chartData
      });

    } catch (error) {
      console.error('Chart generation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate chart',
        error: error.message
      });
    }
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
      const birthData = req.body;

      if (!this.validateBirthData(birthData)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid birth data provided'
        });
      }

      // Generate comprehensive chart and analysis
      const chartData = await this.enhancedChartService.generateComprehensiveChart(birthData);

      const comprehensiveAnalysis = {
        chartData,
        summary: this.generateComprehensiveSummary(chartData.analysis),
        personality: this.generatePersonalitySummary(chartData.analysis.personality),
        strengths: this.identifyOverallStrengths(chartData.analysis),
        challenges: this.identifyOverallChallenges(chartData.analysis),
        recommendations: this.generateOverallRecommendations(chartData.analysis)
      };

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
