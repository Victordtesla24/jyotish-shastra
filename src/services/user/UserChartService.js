/**
 * User Chart Service
 * Handles user chart management, chart ownership, and chart-related operations
 * Built on top of UserRepository and ChartRepository for data access
 */

const UserRepository = require('../../data/repositories/UserRepository');
const ChartRepository = require('../../data/repositories/ChartRepository');

class UserChartService {
  constructor() {
    this.maxChartsPerUser = {
      free: 5,
      basic: 25,
      premium: 100,
      enterprise: -1 // unlimited
    };
  }

  /**
   * Create a new chart for user
   * @param {string} userId - User ID
   * @param {Object} chartData - Chart data
   * @returns {Promise<Object>} Created chart
   */
  async createUserChart(userId, chartData) {
    try {
      // Get user to check subscription limits
      const user = await UserRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Check chart creation limits
      await this.checkChartLimits(user);

      // Validate chart data
      this.validateChartData(chartData);

      // Add user ID to chart data
      const chartDataWithUser = {
        ...chartData,
        userId: userId,
        createdBy: userId
      };

      // Create chart using ChartRepository
      const chart = await ChartRepository.createChart(chartDataWithUser);

      // Add chart to user's charts array
      await UserRepository.addChart(userId, chart._id);

      return {
        success: true,
        chart,
        message: 'Chart created successfully'
      };
    } catch (error) {
      throw new Error(`Error creating chart: ${error.message}`);
    }
  }

  /**
   * Get user's charts
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} User's charts
   */
  async getUserCharts(userId, options = {}) {
    try {
      // Destructure for validation, but pass full options to repository
      const {
        page: _page = 1,
        limit: _limit = 10,
        sortBy: _sortBy = 'createdAt',
        sortOrder: _sortOrder = 'desc',
        search: _search = '',
        type: _type = 'all'
      } = options;

      // Get user
      const user = await UserRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Get charts using ChartRepository
      const charts = await ChartRepository.findByUserId(userId, options);

      return {
        success: true,
        charts: charts.charts,
        pagination: charts.pagination,
        message: 'Charts retrieved successfully'
      };
    } catch (error) {
      throw new Error(`Error getting user charts: ${error.message}`);
    }
  }

  /**
   * Get specific chart for user
   * @param {string} userId - User ID
   * @param {string} chartId - Chart ID
   * @returns {Promise<Object>} Chart data
   */
  async getUserChart(userId, chartId) {
    try {
      // Verify user exists
      const user = await UserRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Check if chart belongs to user
      const isOwned = await ChartRepository.isChartOwnedByUser(chartId, userId);
      if (!isOwned) {
        throw new Error('Chart not found or access denied');
      }

      // Get chart using ChartRepository
      const chart = await ChartRepository.findById(chartId);

      return {
        success: true,
        chart,
        message: 'Chart retrieved successfully'
      };
    } catch (error) {
      throw new Error(`Error getting chart: ${error.message}`);
    }
  }

  /**
   * Update user's chart
   * @param {string} userId - User ID
   * @param {string} chartId - Chart ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated chart
   */
  async updateUserChart(userId, chartId, updateData) {
    try {
      // Verify user exists and owns chart
      const user = await UserRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const isOwned = await ChartRepository.isChartOwnedByUser(chartId, userId);
      if (!isOwned) {
        throw new Error('Chart not found or access denied');
      }

      // Validate update data
      this.validateChartUpdateData(updateData);

      // Update chart using ChartRepository
      const updatedChart = await ChartRepository.updateChart(chartId, updateData);

      return {
        success: true,
        chart: updatedChart,
        message: 'Chart updated successfully'
      };
    } catch (error) {
      throw new Error(`Error updating chart: ${error.message}`);
    }
  }

  /**
   * Delete user's chart
   * @param {string} userId - User ID
   * @param {string} chartId - Chart ID
   * @returns {Promise<Object>} Delete result
   */
  async deleteUserChart(userId, chartId) {
    try {
      // Verify user exists and owns chart
      const user = await UserRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const isOwned = await ChartRepository.isChartOwnedByUser(chartId, userId);
      if (!isOwned) {
        throw new Error('Chart not found or access denied');
      }

      // Remove chart from user's charts array
      await UserRepository.removeChart(userId, chartId);

      // Delete chart from ChartRepository
      await ChartRepository.deleteChart(chartId);

      return {
        success: true,
        message: 'Chart deleted successfully'
      };
    } catch (error) {
      throw new Error(`Error deleting chart: ${error.message}`);
    }
  }

  /**
   * Share chart with other users
   * @param {string} userId - User ID
   * @param {string} chartId - Chart ID
   * @param {Object} shareOptions - Share options
   * @returns {Promise<Object>} Share result
   */
  async shareChart(userId, chartId, shareOptions) {
    try {
      // Verify user exists and owns chart
      const user = await UserRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const isOwned = await ChartRepository.isChartOwnedByUser(chartId, userId);
      if (!isOwned) {
        throw new Error('Chart not found or access denied');
      }

      // Check user's privacy preferences
      if (!user.preferences?.privacy?.chartSharing) {
        throw new Error('Chart sharing is disabled in your privacy settings');
      }

      // Validate share options
      this.validateShareOptions(shareOptions);

      // Generate share token or link
      const shareToken = this.generateShareToken(chartId, shareOptions);

      return {
        success: true,
        shareToken,
        shareUrl: `${process.env.APP_URL || 'http://localhost:3000'}/shared/chart/${shareToken}`,
        expiresAt: shareOptions.expiresAt,
        message: 'Chart shared successfully'
      };
    } catch (error) {
      throw new Error(`Error sharing chart: ${error.message}`);
    }
  }

  /**
   * Get chart analysis for user
   * @param {string} userId - User ID
   * @param {string} chartId - Chart ID
   * @param {Array} analysisTypes - Types of analysis to perform
   * @returns {Promise<Object>} Analysis results
   */
  async getChartAnalysis(userId, chartId, analysisTypes = ['basic']) {
    try {
      // Verify user exists and owns chart
      const user = await UserRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const isOwned = await ChartRepository.isChartOwnedByUser(chartId, userId);
      if (!isOwned) {
        throw new Error('Chart not found or access denied');
      }

      // Check subscription limits for analysis types
      this.checkAnalysisPermissions(user, analysisTypes);

      // Get chart data for analysis
      const chart = await ChartRepository.findById(chartId);
      if (!chart) {
        throw new Error('Chart not found');
      }

      // Perform analysis using available analysis services
      const analysisResults = await this.performRealAnalysis(chart, analysisTypes);

      return {
        success: true,
        analysis: analysisResults,
        message: 'Analysis completed successfully'
      };
    } catch (error) {
      throw new Error(`Error performing analysis: ${error.message}`);
    }
  }

  /**
   * Get chart statistics for user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Chart statistics
   */
  async getChartStatistics(userId) {
    try {
      const user = await UserRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Get real chart statistics from ChartRepository
      const chartStats = await ChartRepository.getChartStatistics(userId);

      const stats = {
        totalCharts: chartStats.totalCharts,
        chartLimit: this.maxChartsPerUser[user.subscription?.plan || 'free'],
        chartsRemaining: this.calculateRemainingCharts(user),
        mostRecentChart: chartStats.newestChart,
        oldestChart: chartStats.oldestChart,
        createdThisMonth: chartStats.createdThisMonth,
        createdThisYear: chartStats.createdThisYear
      };

      return {
        success: true,
        statistics: stats,
        message: 'Chart statistics retrieved successfully'
      };
    } catch (error) {
      throw new Error(`Error getting chart statistics: ${error.message}`);
    }
  }

  /**
   * Duplicate chart for user
   * @param {string} userId - User ID
   * @param {string} chartId - Chart ID to duplicate
   * @param {Object} options - Duplication options
   * @returns {Promise<Object>} Duplicated chart
   */
  async duplicateChart(userId, chartId, options = {}) {
    try {
      // Get original chart
      const originalChart = await this.getUserChart(userId, chartId);

      // Check chart limits
      const user = await UserRepository.findById(userId);
      await this.checkChartLimits(user);

      // Create duplicate chart data
      const duplicateData = {
        ...originalChart.chart,
        name: options.name || `${originalChart.chart.name} (Copy)`,
        description: options.description || `Copy of ${originalChart.chart.name}`,
        isDuplicate: true,
        originalChartId: chartId
      };

      // Remove ID and timestamps
      delete duplicateData._id;
      delete duplicateData.createdAt;
      delete duplicateData.updatedAt;

      // Create duplicate chart
      const duplicateChart = await this.createUserChart(userId, duplicateData);

      return {
        success: true,
        chart: duplicateChart.chart,
        message: 'Chart duplicated successfully'
      };
    } catch (error) {
      throw new Error(`Error duplicating chart: ${error.message}`);
    }
  }

  /**
   * Check chart creation limits based on subscription
   * @param {Object} user - User object
   * @throws {Error} If limit exceeded
   */
  async checkChartLimits(user) {
    const userPlan = user.subscription?.plan || 'free';
    const maxCharts = this.maxChartsPerUser[userPlan];

    if (maxCharts === -1) {
      return; // Unlimited
    }

    if (user.charts.length >= maxCharts) {
      throw new Error(`Chart limit reached. ${userPlan} plan allows maximum ${maxCharts} charts.`);
    }
  }

  /**
   * Calculate remaining charts for user
   * @param {Object} user - User object
   * @returns {number} Remaining charts
   */
  calculateRemainingCharts(user) {
    const userPlan = user.subscription?.plan || 'free';
    const maxCharts = this.maxChartsPerUser[userPlan];

    if (maxCharts === -1) {
      return -1; // Unlimited
    }

    return Math.max(0, maxCharts - user.charts.length);
  }

  /**
   * Check analysis permissions based on subscription
   * @param {Object} user - User object
   * @param {Array} analysisTypes - Analysis types requested
   * @throws {Error} If permission denied
   */
  checkAnalysisPermissions(user, analysisTypes) {
    const userPlan = user.subscription?.plan || 'free';

    const planPermissions = {
      free: ['basic'],
      basic: ['basic', 'houses', 'aspects'],
      premium: ['basic', 'houses', 'aspects', 'divisional', 'dasha', 'transit'],
      enterprise: ['basic', 'houses', 'aspects', 'divisional', 'dasha', 'transit', 'advanced']
    };

    const allowedAnalysis = planPermissions[userPlan] || [];

    for (const analysisType of analysisTypes) {
      if (!allowedAnalysis.includes(analysisType)) {
        throw new Error(`${analysisType} analysis requires ${this.getRequiredPlan(analysisType)} subscription`);
      }
    }
  }

  /**
   * Get required plan for analysis type
   * @param {string} analysisType - Analysis type
   * @returns {string} Required plan
   */
  getRequiredPlan(analysisType) {
    const planRequirements = {
      basic: 'free',
      houses: 'basic',
      aspects: 'basic',
      divisional: 'premium',
      dasha: 'premium',
      transit: 'premium',
      advanced: 'enterprise'
    };

    return planRequirements[analysisType] || 'premium';
  }

  /**
   * Validate chart data
   * @param {Object} chartData - Chart data to validate
   * @throws {Error} If validation fails
   */
  validateChartData(chartData) {
    const requiredFields = ['name', 'birthData', 'chartType'];

    for (const field of requiredFields) {
      if (!chartData[field]) {
        throw new Error(`${field} is required`);
      }
    }

    // Validate birth data
    if (!chartData.birthData.date || !chartData.birthData.time || !chartData.birthData.location) {
      throw new Error('Complete birth data (date, time, location) is required');
    }

    // Validate chart type
    const validChartTypes = ['natal', 'transit', 'composite', 'horary', 'muhurta'];
    if (!validChartTypes.includes(chartData.chartType)) {
      throw new Error(`Invalid chart type. Valid types: ${validChartTypes.join(', ')}`);
    }

    // Validate name length
    if (chartData.name.length < 2 || chartData.name.length > 100) {
      throw new Error('Chart name must be between 2 and 100 characters');
    }
  }

  /**
   * Validate chart update data
   * @param {Object} updateData - Update data to validate
   * @throws {Error} If validation fails
   */
  validateChartUpdateData(updateData) {
    const allowedFields = [
      'name', 'description', 'tags', 'isPublic', 'notes'
    ];

    for (const field of Object.keys(updateData)) {
      if (!allowedFields.includes(field)) {
        throw new Error(`Field '${field}' cannot be updated`);
      }
    }

    if (updateData.name && (updateData.name.length < 2 || updateData.name.length > 100)) {
      throw new Error('Chart name must be between 2 and 100 characters');
    }

    if (updateData.description && updateData.description.length > 1000) {
      throw new Error('Description cannot exceed 1000 characters');
    }
  }

  /**
   * Validate share options
   * @param {Object} shareOptions - Share options to validate
   * @throws {Error} If validation fails
   */
  validateShareOptions(shareOptions) {
    const validShareTypes = ['public', 'private', 'link'];

    if (!shareOptions.type || !validShareTypes.includes(shareOptions.type)) {
      throw new Error(`Invalid share type. Valid types: ${validShareTypes.join(', ')}`);
    }

    if (shareOptions.expiresAt) {
      const expiryDate = new Date(shareOptions.expiresAt);
      if (isNaN(expiryDate.getTime()) || expiryDate <= new Date()) {
        throw new Error('Invalid expiry date');
      }
    }

    if (shareOptions.password && shareOptions.password.length < 6) {
      throw new Error('Share password must be at least 6 characters');
    }
  }

  /**
   * Generate unique chart ID
   * @returns {string} Chart ID
   */
  generateChartId() {
    return `chart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate share token
   * @param {string} chartId - Chart ID
   * @param {Object} shareOptions - Share options
   * @returns {string} Share token
   */
  generateShareToken(chartId, shareOptions) {
    const crypto = require('crypto');
    const tokenData = {
      chartId,
      type: shareOptions.type,
      expiresAt: shareOptions.expiresAt,
      timestamp: Date.now()
    };

    return crypto
      .createHash('sha256')
      .update(JSON.stringify(tokenData))
      .digest('hex')
      .substr(0, 16);
  }



  /**
   * Perform real analysis using available analysis services
   * @param {Object} chart - Chart data
   * @param {Array} analysisTypes - Analysis types
   * @returns {Promise<Object>} Analysis results
   */
  async performRealAnalysis(chart, analysisTypes) {
    const analysisResults = {
      chartId: chart._id,
      analysisTypes,
      results: {},
      completedAt: new Date()
    };

    // Import analysis services
    const BirthDataAnalysisService = require('../analysis/BirthDataAnalysisService');
    const LagnaAnalysisService = require('../analysis/LagnaAnalysisService');
    const HouseAnalysisService = require('../analysis/HouseAnalysisService');
    const AspectAnalysisService = require('../../core/analysis/aspects/AspectAnalysisService');
    const YogaDetectionService = require('../analysis/YogaDetectionService');
    const DetailedDashaAnalysisService = require('../analysis/DetailedDashaAnalysisService');

    try {
      for (const analysisType of analysisTypes) {
        switch (analysisType) {
          case 'basic':
            analysisResults.results.basic = await BirthDataAnalysisService.performBasicAnalysis(chart);
            break;
          case 'houses':
            analysisResults.results.houses = await HouseAnalysisService.analyzeAllHouses(chart);
            break;
          case 'aspects':
            analysisResults.results.aspects = await AspectAnalysisService.analyzeAllAspects(chart);
            break;
          case 'lagna':
            analysisResults.results.lagna = await LagnaAnalysisService.performComprehensiveLagnaAnalysis(chart);
            break;
          case 'yogas':
            analysisResults.results.yogas = await YogaDetectionService.detectAllYogas(chart);
            break;
          case 'dasha':
            analysisResults.results.dasha = await DetailedDashaAnalysisService.performDetailedDashaAnalysis(chart);
            break;
          default:
            console.warn(`Unknown analysis type: ${analysisType}`);
        }
      }

      return analysisResults;
    } catch (error) {
      throw new Error(`Error performing analysis: ${error.message}`);
    }
  }
}

module.exports = UserChartService;
