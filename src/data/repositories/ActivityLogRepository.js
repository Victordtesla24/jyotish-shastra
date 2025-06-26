/**
 * Production Activity Log Repository
 * Handles comprehensive user activity tracking with database persistence,
 * audit trails, performance monitoring, and analytics capabilities.
 */

const mongoose = require('mongoose');
const ActivityLog = require('../models/ActivityLog');

class ActivityLogRepository {
  constructor() {
    this.cacheTimeout = 300000; // 5 minutes cache
    this.activityCache = new Map();
  }

  /**
   * Retrieves recent activity logs for a given user with advanced filtering and analytics.
   * @param {string} userId - The ID of the user.
   * @param {Object} options - Comprehensive options for filtering and pagination.
   * @param {number} options.days - Number of days to look back for activities.
   * @param {number} options.limit - Maximum number of activities to return.
   * @param {number} options.offset - Number of activities to skip (for pagination).
   * @param {string[]} options.types - Filter by specific activity types.
   * @param {string} options.category - Filter by activity category.
   * @param {boolean} options.includeMetrics - Include performance metrics.
   * @returns {Promise<Object>} A promise that resolves to activity data with metadata.
   */
  async getRecentActivities(userId, {
    days = 30,
    limit = 50,
    offset = 0,
    types = null,
    category = null,
    includeMetrics = false
  } = {}) {
    try {
      const cacheKey = `activities_${userId}_${days}_${limit}_${offset}_${JSON.stringify(types)}_${category}`;

      // Check cache first for performance
      if (this.activityCache.has(cacheKey)) {
        const cached = this.activityCache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data;
        }
      }

      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      // Build comprehensive query with advanced filtering
      const query = {
        userId: userId,
        timestamp: { $gte: cutoffDate },
        deletedAt: { $exists: false } // Soft delete support
      };

      if (types && types.length > 0) {
        query.type = { $in: types };
      }

      if (category) {
        query.category = category;
      }

      // Execute query with aggregation for analytics
      const pipeline = [
        { $match: query },
        { $sort: { timestamp: -1 } },
        { $skip: offset },
        { $limit: limit },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'userInfo',
            pipeline: [{ $project: { firstName: 1, lastName: 1, email: 1 } }]
          }
        },
        {
          $addFields: {
            user: { $arrayElemAt: ['$userInfo', 0] },
            sessionDuration: {
              $cond: {
                if: { $eq: ['$type', 'session_end'] },
                then: { $subtract: ['$timestamp', '$sessionStartTime'] },
                else: null
              }
            }
          }
        },
        { $unset: 'userInfo' }
      ];

      const activities = await ActivityLog.aggregate(pipeline);

      // Get total count for pagination
      const totalCount = await ActivityLog.countDocuments(query);

      // Calculate analytics if requested
      let analytics = null;
      if (includeMetrics) {
        analytics = await this.calculateActivityAnalytics(userId, cutoffDate);
      }

      const result = {
        activities,
        totalCount,
        hasMore: offset + limit < totalCount,
        pagination: {
          limit,
          offset,
          totalPages: Math.ceil(totalCount / limit),
          currentPage: Math.floor(offset / limit) + 1
        },
        analytics,
        generatedAt: new Date()
      };

      // Cache the result
      this.activityCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });

      return result;

    } catch (error) {
      console.error('Error retrieving activity logs:', error);
             throw new Error(`Failed to retrieve activity logs: ${error.message}`);
     }
   }

  /**
   * Calculate comprehensive activity analytics
   * @param {string} userId - User ID
   * @param {Date} cutoffDate - Start date for analytics
   * @returns {Promise<Object>} Analytics data
   */
  async calculateActivityAnalytics(userId, cutoffDate) {
    try {
      const analyticsData = await ActivityLog.aggregate([
        {
          $match: {
            userId: userId,
            timestamp: { $gte: cutoffDate },
            deletedAt: { $exists: false }
          }
        },
        {
          $group: {
            _id: null,
            totalActivities: { $sum: 1 },
            uniqueTypes: { $addToSet: '$type' },
            avgSessionDuration: { $avg: '$sessionDuration' },
            mostActiveDay: {
              $push: {
                day: { $dayOfWeek: '$timestamp' },
                count: 1
              }
            },
            activityByType: {
              $push: {
                type: '$type',
                count: 1
              }
            }
          }
        },
        {
          $project: {
            totalActivities: 1,
            uniqueTypesCount: { $size: '$uniqueTypes' },
            avgSessionDuration: { $round: ['$avgSessionDuration', 2] },
            activityDistribution: '$activityByType'
          }
        }
      ]);

      return analyticsData[0] || null;
    } catch (error) {
      console.error('Error calculating analytics:', error);
      return null;
    }
  }

  /**
   * Log a new activity with comprehensive metadata
   * @param {Object} activityData - Activity data
   * @returns {Promise<Object>} Created activity log
   */
  async logActivity(activityData) {
    try {
      const activity = new ActivityLog({
        ...activityData,
        timestamp: new Date(),
        sessionId: activityData.sessionId || this.generateSessionId(),
        userAgent: activityData.userAgent,
        ipAddress: activityData.ipAddress,
        metadata: {
          ...activityData.metadata,
          version: process.env.APP_VERSION || '1.0.0',
          environment: process.env.NODE_ENV || 'development'
        }
      });

      const savedActivity = await activity.save();

      // Clear relevant cache entries
      this.clearCacheForUser(activityData.userId);

      return savedActivity;
    } catch (error) {
      console.error('Error logging activity:', error);
      throw new Error(`Failed to log activity: ${error.message}`);
    }
  }

  /**
   * Get activity statistics for dashboard
   * @param {string} userId - User ID
   * @param {number} days - Days to analyze
   * @returns {Promise<Object>} Statistics
   */
  async getActivityStatistics(userId, days = 30) {
    try {
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const stats = await ActivityLog.aggregate([
        {
          $match: {
            userId: userId,
            timestamp: { $gte: cutoffDate }
          }
        },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
              type: '$type'
            },
            count: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: '$_id.date',
            activities: {
              $push: {
                type: '$_id.type',
                count: '$count'
              }
            },
            totalCount: { $sum: '$count' }
          }
        },
        { $sort: { '_id': 1 } }
      ]);

      return {
        dailyStats: stats,
        summary: this.calculateStatsSummary(stats)
      };
    } catch (error) {
      console.error('Error getting activity statistics:', error);
      throw new Error(`Failed to get activity statistics: ${error.message}`);
    }
  }

  /**
   * Archive old activities for data retention compliance
   * @param {number} retentionDays - Days to retain
   * @returns {Promise<Object>} Archive result
   */
  async archiveOldActivities(retentionDays = 365) {
    try {
      const archiveDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

      const result = await ActivityLog.updateMany(
        {
          timestamp: { $lt: archiveDate },
          archived: { $ne: true }
        },
        {
          $set: {
            archived: true,
            archivedAt: new Date()
          }
        }
      );

      return {
        archivedCount: result.modifiedCount,
        archiveDate: archiveDate
      };
    } catch (error) {
      console.error('Error archiving activities:', error);
      throw new Error(`Failed to archive activities: ${error.message}`);
    }
  }

  /**
   * Clear cache for specific user
   * @param {string} userId - User ID
   */
  clearCacheForUser(userId) {
    for (const [key] of this.activityCache) {
      if (key.includes(`activities_${userId}`)) {
        this.activityCache.delete(key);
      }
    }
  }

  /**
   * Generate unique session ID
   * @returns {string} Session ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Calculate summary statistics
   * @param {Array} stats - Daily statistics
   * @returns {Object} Summary
   */
  calculateStatsSummary(stats) {
    const totalActivities = stats.reduce((sum, day) => sum + day.totalCount, 0);
    const avgPerDay = stats.length > 0 ? totalActivities / stats.length : 0;
    const mostActiveDay = stats.reduce((max, day) =>
      day.totalCount > (max?.totalCount || 0) ? day : max, null);

    return {
      totalActivities,
      averagePerDay: Math.round(avgPerDay * 100) / 100,
      mostActiveDay: mostActiveDay?._id,
      activeDays: stats.length
    };
  }
}

module.exports = ActivityLogRepository;
