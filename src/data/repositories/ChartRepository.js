/**
 * Chart Repository - Data Access Layer
 * Handles all database operations for Chart model
 */

import Chart from '../models/Chart.js';
import mongoose from 'mongoose';

class ChartRepository {
  /**
   * Create a new chart
   * @param {Object} chartData - Chart data
   * @returns {Promise<Object>} Created chart
   */
  static async createChart(chartData) {
    try {
      const chart = new Chart(chartData);
      await chart.save();
      return chart;
    } catch (error) {
      throw new Error(`Error creating chart: ${error.message}`);
    }
  }

  /**
   * Find chart by ID
   * @param {string} chartId - Chart ID
   * @returns {Promise<Object|null>} Chart data
   */
  static async findById(chartId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(chartId)) {
        return null;
      }

      const chart = await Chart.findById(chartId).populate('userId', 'firstName lastName email');
      return chart;
    } catch (error) {
      throw new Error(`Error finding chart by ID: ${error.message}`);
    }
  }

  /**
   * Find charts by user ID
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Charts with pagination
   */
  static async findByUserId(userId, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        search = '',
        type = 'all'
      } = options;

      const skip = (page - 1) * limit;

      // Build query
      const query = { userId };

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { 'birthData.placeOfBirth.name': { $regex: search, $options: 'i' } },
          { 'metadata.tags': { $in: [new RegExp(search, 'i')] } }
        ];
      }

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Execute query
      const charts = await Chart.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select('name birthData.dateOfBirth birthData.placeOfBirth.name rasiChart.ascendant.sign metadata.tags createdAt updatedAt');

      const totalCharts = await Chart.countDocuments(query);

      return {
        charts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCharts / limit),
          totalCharts,
          hasNext: page < Math.ceil(totalCharts / limit),
          hasPrev: page > 1
        }
      };
    } catch (error) {
      throw new Error(`Error finding charts by user ID: ${error.message}`);
    }
  }

  /**
   * Update chart
   * @param {string} chartId - Chart ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated chart
   */
  static async updateChart(chartId, updateData) {
    try {
      if (!mongoose.Types.ObjectId.isValid(chartId)) {
        throw new Error('Invalid chart ID');
      }

      const chart = await Chart.findByIdAndUpdate(
        chartId,
        { $set: updateData },
        { new: true, runValidators: true }
      );

      if (!chart) {
        throw new Error('Chart not found');
      }

      return chart;
    } catch (error) {
      throw new Error(`Error updating chart: ${error.message}`);
    }
  }

  /**
   * Delete chart
   * @param {string} chartId - Chart ID
   * @returns {Promise<boolean>} Success status
   */
  static async deleteChart(chartId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(chartId)) {
        throw new Error('Invalid chart ID');
      }

      const result = await Chart.findByIdAndDelete(chartId);
      return result !== null;
    } catch (error) {
      throw new Error(`Error deleting chart: ${error.message}`);
    }
  }

  /**
   * Find charts by date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Charts in date range
   */
  static async findByDateRange(startDate, endDate, options = {}) {
    try {
      const { limit = 100 } = options;

      const charts = await Chart.findByDateRange(startDate, endDate)
        .limit(limit)
        .select('name birthData.dateOfBirth birthData.placeOfBirth rasiChart.ascendant');

      return charts;
    } catch (error) {
      throw new Error(`Error finding charts by date range: ${error.message}`);
    }
  }

  /**
   * Find charts by location
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @param {number} radius - Radius in km
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Charts near location
   */
  static async findByLocation(latitude, longitude, radius = 50, options = {}) {
    try {
      const { limit = 100 } = options;

      const charts = await Chart.findByLocation(latitude, longitude, radius)
        .limit(limit)
        .select('name birthData.dateOfBirth birthData.placeOfBirth rasiChart.ascendant');

      return charts;
    } catch (error) {
      throw new Error(`Error finding charts by location: ${error.message}`);
    }
  }

  /**
   * Get chart statistics for user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Chart statistics
   */
  static async getChartStatistics(userId) {
    try {
      const pipeline = [
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        {
          $group: {
            _id: null,
            totalCharts: { $sum: 1 },
            oldestChart: { $min: '$createdAt' },
            newestChart: { $max: '$createdAt' },
            chartsByMonth: {
              $push: {
                month: { $month: '$createdAt' },
                year: { $year: '$createdAt' }
              }
            }
          }
        }
      ];

      const stats = await Chart.aggregate(pipeline);

      if (stats.length === 0) {
        return {
          totalCharts: 0,
          oldestChart: null,
          newestChart: null,
          createdThisMonth: 0,
          createdThisYear: 0
        };
      }

      const result = stats[0];
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();

      const createdThisMonth = result.chartsByMonth.filter(
        item => item.month === currentMonth && item.year === currentYear
      ).length;

      const createdThisYear = result.chartsByMonth.filter(
        item => item.year === currentYear
      ).length;

      return {
        totalCharts: result.totalCharts,
        oldestChart: result.oldestChart,
        newestChart: result.newestChart,
        createdThisMonth,
        createdThisYear
      };
    } catch (error) {
      throw new Error(`Error getting chart statistics: ${error.message}`);
    }
  }

  /**
   * Search charts with advanced filters
   * @param {Object} searchCriteria - Search criteria
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Search results with pagination
   */
  static async searchCharts(searchCriteria, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = options;

      const skip = (page - 1) * limit;

      // Build query from search criteria
      const query = {};

      if (searchCriteria.userId) {
        query.userId = searchCriteria.userId;
      }

      if (searchCriteria.name) {
        query.name = { $regex: searchCriteria.name, $options: 'i' };
      }

      if (searchCriteria.ascendantSign) {
        query['rasiChart.ascendant.sign'] = searchCriteria.ascendantSign;
      }

      if (searchCriteria.sunSign) {
        query['rasiChart.planets'] = {
          $elemMatch: {
            planet: 'Sun',
            sign: searchCriteria.sunSign
          }
        };
      }

      if (searchCriteria.moonSign) {
        query['rasiChart.planets'] = {
          $elemMatch: {
            planet: 'Moon',
            sign: searchCriteria.moonSign
          }
        };
      }

      if (searchCriteria.tags && searchCriteria.tags.length > 0) {
        query['metadata.tags'] = { $in: searchCriteria.tags };
      }

      if (searchCriteria.dateRange) {
        query['birthData.dateOfBirth'] = {
          $gte: new Date(searchCriteria.dateRange.start),
          $lte: new Date(searchCriteria.dateRange.end)
        };
      }

      if (searchCriteria.isPublic !== undefined) {
        query['metadata.isPublic'] = searchCriteria.isPublic;
      }

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Execute query
      const charts = await Chart.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('userId', 'firstName lastName');

      const totalCharts = await Chart.countDocuments(query);

      return {
        charts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCharts / limit),
          totalCharts,
          hasNext: page < Math.ceil(totalCharts / limit),
          hasPrev: page > 1
        },
        searchCriteria
      };
    } catch (error) {
      throw new Error(`Error searching charts: ${error.message}`);
    }
  }

  /**
   * Get public charts for sharing
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Public charts with pagination
   */
  static async getPublicCharts(options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = options;

      const skip = (page - 1) * limit;

      const query = { 'metadata.isPublic': true };

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const charts = await Chart.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('userId', 'firstName lastName')
        .select('name birthData.dateOfBirth birthData.placeOfBirth.name rasiChart.ascendant.sign metadata.tags createdAt');

      const totalCharts = await Chart.countDocuments(query);

      return {
        charts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCharts / limit),
          totalCharts,
          hasNext: page < Math.ceil(totalCharts / limit),
          hasPrev: page > 1
        }
      };
    } catch (error) {
      throw new Error(`Error getting public charts: ${error.message}`);
    }
  }

  /**
   * Check if chart exists and belongs to user
   * @param {string} chartId - Chart ID
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} Ownership status
   */
  static async isChartOwnedByUser(chartId, userId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(chartId)) {
        return false;
      }

      const chart = await Chart.findOne({
        _id: chartId,
        userId: userId
      }).select('_id');

      return chart !== null;
    } catch (error) {
      throw new Error(`Error checking chart ownership: ${error.message}`);
    }
  }

  /**
   * Get charts with specific yoga
   * @param {string} yogaName - Yoga name
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Charts with the yoga
   */
  static async findChartsWithYoga(yogaName, options = {}) {
    try {
      const { limit = 50 } = options;

      const charts = await Chart.find({
        'yogas.name': yogaName,
        'yogas.isActive': true
      })
        .limit(limit)
        .select('name birthData.dateOfBirth yogas rasiChart.ascendant.sign')
        .populate('userId', 'firstName lastName');

      return charts;
    } catch (error) {
      throw new Error(`Error finding charts with yoga: ${error.message}`);
    }
  }

  /**
   * Bulk update charts
   * @param {Array} updates - Array of update operations
   * @returns {Promise<Object>} Bulk update result
   */
  static async bulkUpdateCharts(updates) {
    try {
      const bulkOps = updates.map(update => ({
        updateOne: {
          filter: { _id: update.chartId },
          update: { $set: update.data }
        }
      }));

      const result = await Chart.bulkWrite(bulkOps);
      return result;
    } catch (error) {
      throw new Error(`Error performing bulk update: ${error.message}`);
    }
  }
}

export default ChartRepository;
