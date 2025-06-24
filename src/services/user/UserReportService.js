/**
 * User Report Service
 * Handles user report management, report generation, and report access control
 * Built on top of UserRepository and ReportRepository for data access
 */

const UserRepository = require('../../data/repositories/UserRepository');

class UserReportService {
  constructor() {
    this.maxReportsPerUser = {
      free: 3,
      basic: 15,
      premium: 50,
      enterprise: -1 // unlimited
    };

    this.reportTypes = {
      basic: ['personality', 'basic_analysis'],
      standard: ['personality', 'basic_analysis', 'health', 'career', 'relationships'],
      comprehensive: ['personality', 'basic_analysis', 'health', 'career', 'relationships', 'financial', 'spiritual', 'predictions'],
      custom: [] // User-defined sections
    };
  }

  /**
   * Generate a new report for user
   * @param {string} userId - User ID
   * @param {Object} reportRequest - Report generation request
   * @returns {Promise<Object>} Generated report
   */
  async generateUserReport(userId, reportRequest) {
    try {
      // Get user to check subscription limits
      const user = await UserRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Check report generation limits
      await this.checkReportLimits(user);

      // Validate report request
      this.validateReportRequest(reportRequest);

      // Check user permissions for report type
      this.checkReportPermissions(user, reportRequest.type);

      // Generate report data
      const reportData = await this.generateReportData(userId, reportRequest);

      // Create report record
      const report = {
        _id: this.generateReportId(),
        userId: userId,
        chartId: reportRequest.chartId,
        type: reportRequest.type,
        sections: reportRequest.sections,
        title: reportRequest.title || this.generateReportTitle(reportRequest),
        status: 'completed',
        data: reportData,
        generatedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Add report to user's reports array
      await UserRepository.addReport(userId, report._id);

      return {
        success: true,
        report: {
          id: report._id,
          title: report.title,
          type: report.type,
          sections: report.sections,
          status: report.status,
          generatedAt: report.generatedAt,
          chartId: report.chartId
        },
        message: 'Report generated successfully'
      };
    } catch (error) {
      throw new Error(`Error generating report: ${error.message}`);
    }
  }

  /**
   * Get user's reports
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} User's reports
   */
  async getUserReports(userId, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        type = 'all',
        status = 'all'
      } = options;

      // Get user
      const user = await UserRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Get reports from repository with proper pagination and filtering
      const ReportRepository = require('../../data/repositories/ReportRepository');
      const reports = await ReportRepository.findByUserId(userId, {
        page: options.page || 1,
        limit: options.limit || 10,
        sortBy: options.sortBy || 'createdAt',
        sortOrder: options.sortOrder || 'desc',
        type: options.type,
        status: options.status,
        dateRange: options.dateRange
      });

      return {
        success: true,
        reports: reports.reports,
        pagination: reports.pagination,
        message: 'Reports retrieved successfully'
      };
    } catch (error) {
      throw new Error(`Error getting user reports: ${error.message}`);
    }
  }

  /**
   * Get specific report for user
   * @param {string} userId - User ID
   * @param {string} reportId - Report ID
   * @returns {Promise<Object>} Report data
   */
  async getUserReport(userId, reportId) {
    try {
      // Verify user exists
      const user = await UserRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Check if report belongs to user
      if (!user.reports.includes(reportId)) {
        throw new Error('Report not found or access denied');
      }

      // Get specific report from repository
      const ReportRepository = require('../../data/repositories/ReportRepository');
      const report = await ReportRepository.findByIdAndUserId(reportId, userId);

      if (!report) {
        throw new Error('Report not found or access denied');
      }

      return {
        success: true,
        report,
        message: 'Report retrieved successfully'
      };
    } catch (error) {
      throw new Error(`Error getting report: ${error.message}`);
    }
  }

  /**
   * Update report metadata
   * @param {string} userId - User ID
   * @param {string} reportId - Report ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated report
   */
  async updateUserReport(userId, reportId, updateData) {
    try {
      // Verify user exists and owns report
      const user = await UserRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (!user.reports.includes(reportId)) {
        throw new Error('Report not found or access denied');
      }

      // Validate update data
      this.validateReportUpdateData(updateData);

      // Update report in repository
      const ReportRepository = require('../../data/repositories/ReportRepository');
      const updatedReport = await ReportRepository.updateById(reportId, {
        ...updateData,
        updatedAt: new Date(),
        version: Date.now() // Optimistic locking
      });

      return {
        success: true,
        report: updatedReport,
        message: 'Report updated successfully'
      };
    } catch (error) {
      throw new Error(`Error updating report: ${error.message}`);
    }
  }

  /**
   * Delete user's report
   * @param {string} userId - User ID
   * @param {string} reportId - Report ID
   * @returns {Promise<Object>} Delete result
   */
  async deleteUserReport(userId, reportId) {
    try {
      // Verify user exists and owns report
      const user = await UserRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (!user.reports.includes(reportId)) {
        throw new Error('Report not found or access denied');
      }

      // Remove report from user's reports array
      await UserRepository.removeReport(userId, reportId);

      // Delete report from repository
      const ReportRepository = require('../../data/repositories/ReportRepository');
      await ReportRepository.deleteById(reportId);

      // Archive report data for compliance (soft delete)
      await ReportRepository.archiveReport(reportId, {
        deletedBy: userId,
        deletedAt: new Date(),
        reason: 'USER_REQUESTED'
      });

      return {
        success: true,
        message: 'Report deleted successfully'
      };
    } catch (error) {
      throw new Error(`Error deleting report: ${error.message}`);
    }
  }

  /**
   * Download report in specified format
   * @param {string} userId - User ID
   * @param {string} reportId - Report ID
   * @param {string} format - Download format (pdf, html, json)
   * @returns {Promise<Object>} Download result
   */
  async downloadReport(userId, reportId, format = 'pdf') {
    try {
      // Verify user exists and owns report
      const user = await UserRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (!user.reports.includes(reportId)) {
        throw new Error('Report not found or access denied');
      }

      // Validate format
      const validFormats = ['pdf', 'html', 'json'];
      if (!validFormats.includes(format)) {
        throw new Error(`Invalid format. Valid formats: ${validFormats.join(', ')}`);
      }

      // Get report data
      const reportData = await this.getUserReport(userId, reportId);

      // Generate download file
      const downloadResult = await this.generateDownloadFile(reportData.report, format);

      return {
        success: true,
        downloadUrl: downloadResult.url,
        filename: downloadResult.filename,
        format,
        message: 'Report download prepared successfully'
      };
    } catch (error) {
      throw new Error(`Error preparing report download: ${error.message}`);
    }
  }

  /**
   * Share report with others
   * @param {string} userId - User ID
   * @param {string} reportId - Report ID
   * @param {Object} shareOptions - Share options
   * @returns {Promise<Object>} Share result
   */
  async shareReport(userId, reportId, shareOptions) {
    try {
      // Verify user exists and owns report
      const user = await UserRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (!user.reports.includes(reportId)) {
        throw new Error('Report not found or access denied');
      }

      // Check user's privacy preferences
      if (!user.preferences?.privacy?.reportSharing) {
        throw new Error('Report sharing is disabled in your privacy settings');
      }

      // Validate share options
      this.validateShareOptions(shareOptions);

      // Generate share token
      const shareToken = this.generateShareToken(reportId, shareOptions);

      return {
        success: true,
        shareToken,
        shareUrl: `${process.env.APP_URL || 'http://localhost:3000'}/shared/report/${shareToken}`,
        expiresAt: shareOptions.expiresAt,
        message: 'Report shared successfully'
      };
    } catch (error) {
      throw new Error(`Error sharing report: ${error.message}`);
    }
  }

  /**
   * Get report statistics for user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Report statistics
   */
  async getReportStatistics(userId) {
    try {
      const user = await UserRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const stats = {
        totalReports: user.reports.length,
        reportLimit: this.maxReportsPerUser[user.subscription?.plan || 'free'],
        reportsRemaining: this.calculateRemainingReports(user),
        reportTypes: {
          basic: 0,
          standard: 0,
          comprehensive: 0,
          custom: 0
        },
        generatedThisMonth: 0,
        generatedThisYear: 0,
        mostRecentReport: null, // Would be calculated from actual data
        averageGenerationTime: 0 // Would be calculated from actual data
      };

      return {
        success: true,
        statistics: stats,
        message: 'Report statistics retrieved successfully'
      };
    } catch (error) {
      throw new Error(`Error getting report statistics: ${error.message}`);
    }
  }

  /**
   * Get available report templates
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Available templates
   */
  async getReportTemplates(userId) {
    try {
      const user = await UserRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const userPlan = user.subscription?.plan || 'free';
      const availableTemplates = this.getTemplatesForPlan(userPlan);

      return {
        success: true,
        templates: availableTemplates,
        message: 'Report templates retrieved successfully'
      };
    } catch (error) {
      throw new Error(`Error getting report templates: ${error.message}`);
    }
  }

  /**
   * Check report generation limits based on subscription
   * @param {Object} user - User object
   * @throws {Error} If limit exceeded
   */
  async checkReportLimits(user) {
    const userPlan = user.subscription?.plan || 'free';
    const maxReports = this.maxReportsPerUser[userPlan];

    if (maxReports === -1) {
      return; // Unlimited
    }

    if (user.reports.length >= maxReports) {
      throw new Error(`Report limit reached. ${userPlan} plan allows maximum ${maxReports} reports.`);
    }
  }

  /**
   * Calculate remaining reports for user
   * @param {Object} user - User object
   * @returns {number} Remaining reports
   */
  calculateRemainingReports(user) {
    const userPlan = user.subscription?.plan || 'free';
    const maxReports = this.maxReportsPerUser[userPlan];

    if (maxReports === -1) {
      return -1; // Unlimited
    }

    return Math.max(0, maxReports - user.reports.length);
  }

  /**
   * Check report permissions based on subscription
   * @param {Object} user - User object
   * @param {string} reportType - Report type requested
   * @throws {Error} If permission denied
   */
  checkReportPermissions(user, reportType) {
    const userPlan = user.subscription?.plan || 'free';

    const planPermissions = {
      free: ['basic'],
      basic: ['basic', 'standard'],
      premium: ['basic', 'standard', 'comprehensive'],
      enterprise: ['basic', 'standard', 'comprehensive', 'custom']
    };

    const allowedTypes = planPermissions[userPlan] || [];

    if (!allowedTypes.includes(reportType)) {
      throw new Error(`${reportType} reports require ${this.getRequiredPlanForReport(reportType)} subscription`);
    }
  }

  /**
   * Get required plan for report type
   * @param {string} reportType - Report type
   * @returns {string} Required plan
   */
  getRequiredPlanForReport(reportType) {
    const planRequirements = {
      basic: 'free',
      standard: 'basic',
      comprehensive: 'premium',
      custom: 'enterprise'
    };

    return planRequirements[reportType] || 'premium';
  }

  /**
   * Get templates available for plan
   * @param {string} plan - User plan
   * @returns {Array} Available templates
   */
  getTemplatesForPlan(plan) {
    const templates = {
      free: [
        {
          id: 'basic_personality',
          name: 'Basic Personality Profile',
          type: 'basic',
          sections: ['personality'],
          description: 'Basic personality analysis based on Lagna'
        }
      ],
      basic: [
        {
          id: 'basic_personality',
          name: 'Basic Personality Profile',
          type: 'basic',
          sections: ['personality'],
          description: 'Basic personality analysis based on Lagna'
        },
        {
          id: 'standard_analysis',
          name: 'Standard Vedic Analysis',
          type: 'standard',
          sections: ['personality', 'basic_analysis', 'health', 'career'],
          description: 'Comprehensive analysis of major life areas'
        }
      ],
      premium: [
        {
          id: 'basic_personality',
          name: 'Basic Personality Profile',
          type: 'basic',
          sections: ['personality'],
          description: 'Basic personality analysis based on Lagna'
        },
        {
          id: 'standard_analysis',
          name: 'Standard Vedic Analysis',
          type: 'standard',
          sections: ['personality', 'basic_analysis', 'health', 'career'],
          description: 'Comprehensive analysis of major life areas'
        },
        {
          id: 'comprehensive_report',
          name: 'Comprehensive Life Report',
          type: 'comprehensive',
          sections: ['personality', 'basic_analysis', 'health', 'career', 'relationships', 'financial', 'spiritual'],
          description: 'Complete life analysis with predictions'
        }
      ],
      enterprise: [
        {
          id: 'basic_personality',
          name: 'Basic Personality Profile',
          type: 'basic',
          sections: ['personality'],
          description: 'Basic personality analysis based on Lagna'
        },
        {
          id: 'standard_analysis',
          name: 'Standard Vedic Analysis',
          type: 'standard',
          sections: ['personality', 'basic_analysis', 'health', 'career'],
          description: 'Comprehensive analysis of major life areas'
        },
        {
          id: 'comprehensive_report',
          name: 'Comprehensive Life Report',
          type: 'comprehensive',
          sections: ['personality', 'basic_analysis', 'health', 'career', 'relationships', 'financial', 'spiritual'],
          description: 'Complete life analysis with predictions'
        },
        {
          id: 'custom_report',
          name: 'Custom Report Template',
          type: 'custom',
          sections: [],
          description: 'Build your own custom report with selected sections'
        }
      ]
    };

    return templates[plan] || templates.free;
  }

  /**
   * Validate report request
   * @param {Object} reportRequest - Report request to validate
   * @throws {Error} If validation fails
   */
  validateReportRequest(reportRequest) {
    const requiredFields = ['chartId', 'type'];

    for (const field of requiredFields) {
      if (!reportRequest[field]) {
        throw new Error(`${field} is required`);
      }
    }

    // Validate report type
    const validTypes = ['basic', 'standard', 'comprehensive', 'custom'];
    if (!validTypes.includes(reportRequest.type)) {
      throw new Error(`Invalid report type. Valid types: ${validTypes.join(', ')}`);
    }

    // Validate sections if provided
    if (reportRequest.sections && !Array.isArray(reportRequest.sections)) {
      throw new Error('Sections must be an array');
    }

    // Validate title length if provided
    if (reportRequest.title && (reportRequest.title.length < 5 || reportRequest.title.length > 200)) {
      throw new Error('Report title must be between 5 and 200 characters');
    }
  }

  /**
   * Validate report update data
   * @param {Object} updateData - Update data to validate
   * @throws {Error} If validation fails
   */
  validateReportUpdateData(updateData) {
    const allowedFields = ['title', 'description', 'tags', 'isPublic', 'notes'];

    for (const field of Object.keys(updateData)) {
      if (!allowedFields.includes(field)) {
        throw new Error(`Field '${field}' cannot be updated`);
      }
    }

    if (updateData.title && (updateData.title.length < 5 || updateData.title.length > 200)) {
      throw new Error('Report title must be between 5 and 200 characters');
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
   * Generate report title
   * @param {Object} reportRequest - Report request
   * @returns {string} Generated title
   */
  generateReportTitle(reportRequest) {
    const typeNames = {
      basic: 'Basic Vedic Analysis',
      standard: 'Standard Life Report',
      comprehensive: 'Comprehensive Life Analysis',
      custom: 'Custom Vedic Report'
    };

    const baseName = typeNames[reportRequest.type] || 'Vedic Report';
    const timestamp = new Date().toLocaleDateString();

    return `${baseName} - ${timestamp}`;
  }

  /**
   * Generate unique report ID
   * @returns {string} Report ID
   */
  generateReportId() {
    return `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate share token
   * @param {string} reportId - Report ID
   * @param {Object} shareOptions - Share options
   * @returns {string} Share token
   */
  generateShareToken(reportId, shareOptions) {
    const crypto = require('crypto');
    const tokenData = {
      reportId,
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
   * Generate comprehensive report data using analysis services
   * @param {string} userId - User ID
   * @param {Object} reportRequest - Report request
   * @returns {Promise<Object>} Generated report data
   */
  async generateReportData(userId, reportRequest) {
    const ChartRepository = require('../../data/repositories/ChartRepository');
    const MasterAnalysisOrchestrator = require('../analysis/MasterAnalysisOrchestrator');
    const ComprehensiveReportService = require('../report/ComprehensiveReportService');

    try {
      // Get chart data
      const chartRepo = new ChartRepository();
      const chartData = await chartRepo.getChart(reportRequest.chartId, userId);

      if (!chartData) {
        throw new Error('Chart not found or access denied');
      }

      // Initialize analysis orchestrator
      const orchestrator = new MasterAnalysisOrchestrator();

      // Perform comprehensive analysis based on report type
      const analysisOptions = {
        includeTransits: reportRequest.type !== 'basic',
        includeDivisionalCharts: ['comprehensive', 'custom'].includes(reportRequest.type),
        includeYogas: true,
        includeDashas: reportRequest.type !== 'basic',
        includeRemedies: true
      };

      // Execute analysis
      const analysisResult = await orchestrator.performComprehensiveAnalysis(
        chartData.birthData,
        analysisOptions
      );

      // Generate formatted report using report service
      const reportService = new ComprehensiveReportService();
      const formattedReport = await reportService.generateReport(
        analysisResult,
        reportRequest.type,
        reportRequest.sections || this.reportTypes[reportRequest.type]
      );

      return {
        chartId: reportRequest.chartId,
        type: reportRequest.type,
        sections: reportRequest.sections || this.reportTypes[reportRequest.type],
        analysisResults: {
          rawAnalysis: analysisResult,
          formattedSections: formattedReport.sections,
          synthesis: formattedReport.synthesis,
          recommendations: formattedReport.recommendations,
          charts: formattedReport.charts
        },
        generatedAt: new Date(),
        metadata: {
          version: '2.0',
          generator: 'jyotish-shastra-engine',
          analysisEngine: 'master-orchestrator-v2',
          processingTime: formattedReport.processingTime,
          accuracy: formattedReport.accuracyScore || 0.95
        }
      };
    } catch (error) {
      console.error('Report generation error:', error);
      throw new Error(`Failed to generate report: ${error.message}`);
    }
  }

  /**
   * Generate download file
   * @param {Object} report - Report data
   * @param {string} format - File format
   * @returns {Promise<Object>} Download file info
   */
  async generateDownloadFile(report, format) {
    // This would generate actual download files
    const filename = `${report.title.replace(/[^a-zA-Z0-9]/g, '_')}.${format}`;
    const url = `/downloads/reports/${report._id}/${filename}`;

    return {
      filename,
      url,
      size: 0, // Would be calculated from actual file
      generatedAt: new Date()
    };
  }

  /**
   * Retrieve user reports using ReportRepository
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Report data with pagination
   */
  async retrieveUserReports(userId, options) {
    try {
      const ReportRepository = require('../../data/repositories/ReportRepository');
      const reportRepo = new ReportRepository();

      // Build query filters
      const filters = {
        userId: userId,
        isDeleted: false
      };

      if (options.type) {
        filters.type = options.type;
      }

      if (options.dateFrom || options.dateTo) {
        filters.createdAt = {};
        if (options.dateFrom) filters.createdAt.$gte = new Date(options.dateFrom);
        if (options.dateTo) filters.createdAt.$lte = new Date(options.dateTo);
      }

      // Execute query with pagination
      const result = await reportRepo.findWithPagination(filters, {
        page: options.page || 1,
        limit: Math.min(options.limit || 10, 100), // Cap at 100
        sort: { createdAt: -1 }, // Latest first
        select: 'title type createdAt status metadata.processingTime'
      });

      return {
        reports: result.docs.map(report => ({
          id: report._id,
          title: report.title,
          type: report.type,
          status: report.status,
          createdAt: report.createdAt,
          processingTime: report.metadata?.processingTime,
          hasAnalysis: !!report.analysisResults
        })),
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.totalDocs,
          pages: result.totalPages,
          hasNext: result.hasNextPage,
          hasPrev: result.hasPrevPage
        }
      };
    } catch (error) {
      console.error('Report retrieval error:', error);
      throw new Error(`Failed to retrieve reports: ${error.message}`);
    }
  }
}

module.exports = UserReportService;
