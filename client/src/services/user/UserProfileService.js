/**
 * User Profile Service
 * Handles user profile management, preferences, and personal information
 * Built on top of UserRepository for data access
 */

const UserRepository = require('../../data/repositories/UserRepository');
const path = require('path');
const fs = require('fs').promises;

class UserProfileService {
  constructor() {
    this.allowedImageTypes = ['jpg', 'jpeg', 'png', 'webp'];
    this.maxImageSize = 5 * 1024 * 1024; // 5MB
    this.uploadPath = process.env.UPLOAD_PATH || 'uploads/profiles';
  }

  /**
   * Get user profile
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User profile
   */
  async getUserProfile(userId) {
    try {
      const user = await UserRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Get user statistics
      const stats = await UserRepository.getUserStatistics(userId);

      return {
        profile: {
          id: user._id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: `${user.firstName} ${user.lastName}`,
          dateOfBirth: user.dateOfBirth,
          placeOfBirth: user.placeOfBirth,
          phoneNumber: user.phoneNumber,
          profilePicture: user.profilePicture,
          isEmailVerified: user.isEmailVerified,
          isActive: user.isActive,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin,
          preferences: user.preferences,
          subscription: user.subscription
        },
        statistics: stats
      };
    } catch (error) {
      throw new Error(`Error getting user profile: ${error.message}`);
    }
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} updateData - Profile data to update
   * @returns {Promise<Object>} Updated profile
   */
  async updateUserProfile(userId, updateData) {
    try {
      // Validate update data
      this.validateProfileData(updateData);

      // Filter allowed fields
      const allowedFields = [
        'firstName', 'lastName', 'dateOfBirth', 'placeOfBirth',
        'phoneNumber', 'profilePicture'
      ];

      const filteredData = {};
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          filteredData[field] = updateData[field];
        }
      });

      // Update profile
      const updatedUser = await UserRepository.updateProfile(userId, filteredData);

      if (!updatedUser) {
        throw new Error('User not found');
      }

      return {
        success: true,
        profile: {
          id: updatedUser._id,
          email: updatedUser.email,
          username: updatedUser.username,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          fullName: `${updatedUser.firstName} ${updatedUser.lastName}`,
          dateOfBirth: updatedUser.dateOfBirth,
          placeOfBirth: updatedUser.placeOfBirth,
          phoneNumber: updatedUser.phoneNumber,
          profilePicture: updatedUser.profilePicture,
          isEmailVerified: updatedUser.isEmailVerified,
          preferences: updatedUser.preferences,
          subscription: updatedUser.subscription
        },
        message: 'Profile updated successfully'
      };
    } catch (error) {
      throw new Error(`Error updating profile: ${error.message}`);
    }
  }

  /**
   * Update user preferences
   * @param {string} userId - User ID
   * @param {Object} preferences - User preferences
   * @returns {Promise<Object>} Updated preferences
   */
  async updateUserPreferences(userId, preferences) {
    try {
      // Validate preferences
      this.validatePreferences(preferences);

      const updatedUser = await UserRepository.updatePreferences(userId, preferences);

      if (!updatedUser) {
        throw new Error('User not found');
      }

      return {
        success: true,
        preferences: updatedUser.preferences,
        message: 'Preferences updated successfully'
      };
    } catch (error) {
      throw new Error(`Error updating preferences: ${error.message}`);
    }
  }

  /**
   * Upload profile picture
   * @param {string} userId - User ID
   * @param {Object} file - Uploaded file object
   * @returns {Promise<Object>} Upload result
   */
  async uploadProfilePicture(userId, file) {
    try {
      // Validate file
      this.validateImageFile(file);

      // Generate unique filename
      const fileExtension = path.extname(file.originalname).toLowerCase();
      const fileName = `${userId}_${Date.now()}${fileExtension}`;
      const filePath = path.join(this.uploadPath, fileName);

      // Ensure upload directory exists
      await this.ensureUploadDirectory();

      // Save file
      await fs.writeFile(filePath, file.buffer);

      // Update user profile with new picture path
      const relativePath = path.join('profiles', fileName);
      await UserRepository.updateProfile(userId, { profilePicture: relativePath });

      return {
        success: true,
        profilePicture: relativePath,
        message: 'Profile picture uploaded successfully'
      };
    } catch (error) {
      throw new Error(`Error uploading profile picture: ${error.message}`);
    }
  }

  /**
   * Delete profile picture
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Delete result
   */
  async deleteProfilePicture(userId) {
    try {
      const user = await UserRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (user.profilePicture) {
        // Delete file from filesystem
        const filePath = path.join(this.uploadPath, path.basename(user.profilePicture));
        try {
          await fs.unlink(filePath);
        } catch (fileError) {
          console.error('Error deleting profile picture file:', fileError);
          // Continue with database update even if file deletion fails
        }

        // Update user profile to remove picture
        await UserRepository.updateProfile(userId, { profilePicture: null });
      }

      return {
        success: true,
        message: 'Profile picture deleted successfully'
      };
    } catch (error) {
      throw new Error(`Error deleting profile picture: ${error.message}`);
    }
  }

  /**
   * Get user charts
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} User charts
   */
  async getUserCharts(userId, options = {}) {
    try {
      const charts = await UserRepository.getUserCharts(userId, options);

      return {
        success: true,
        charts,
        message: 'Charts retrieved successfully'
      };
    } catch (error) {
      throw new Error(`Error getting user charts: ${error.message}`);
    }
  }

  /**
   * Get user reports
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} User reports
   */
  async getUserReports(userId, options = {}) {
    try {
      const reports = await UserRepository.getUserReports(userId, options);

      return {
        success: true,
        reports,
        message: 'Reports retrieved successfully'
      };
    } catch (error) {
      throw new Error(`Error getting user reports: ${error.message}`);
    }
  }

  /**
   * Update subscription
   * @param {string} userId - User ID
   * @param {Object} subscriptionData - Subscription data
   * @returns {Promise<Object>} Updated subscription
   */
  async updateSubscription(userId, subscriptionData) {
    try {
      // Validate subscription data
      this.validateSubscriptionData(subscriptionData);

      const updatedUser = await UserRepository.updateSubscription(userId, subscriptionData);

      if (!updatedUser) {
        throw new Error('User not found');
      }

      return {
        success: true,
        subscription: updatedUser.subscription,
        message: 'Subscription updated successfully'
      };
    } catch (error) {
      throw new Error(`Error updating subscription: ${error.message}`);
    }
  }

  /**
   * Deactivate user account
   * @param {string} userId - User ID
   * @param {string} reason - Deactivation reason
   * @returns {Promise<Object>} Deactivation result
   */
  async deactivateAccount(userId, reason = 'User requested') {
    try {
      const success = await UserRepository.deleteUser(userId);

      if (!success) {
        throw new Error('Account deactivation failed');
      }

      // Log deactivation
              // Only log in development mode to avoid cluttering test output
        if (process.env.NODE_ENV === 'development') {
            console.log(`Account deactivated: User ${userId}, Reason: ${reason}, Time: ${new Date()}`);
        }

      return {
        success: true,
        message: 'Account deactivated successfully'
      };
    } catch (error) {
      throw new Error(`Error deactivating account: ${error.message}`);
    }
  }

  /**
   * Reactivate user account
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Reactivation result
   */
  async reactivateAccount(userId) {
    try {
      const success = await UserRepository.restoreUser(userId);

      if (!success) {
        throw new Error('Account reactivation failed');
      }

      // Log reactivation
              // Only log in development mode to avoid cluttering test output
        if (process.env.NODE_ENV === 'development') {
            console.log(`Account reactivated: User ${userId}, Time: ${new Date()}`);
        }

      return {
        success: true,
        message: 'Account reactivated successfully'
      };
    } catch (error) {
      throw new Error(`Error reactivating account: ${error.message}`);
    }
  }

  /**
   * Validate profile data
   * @param {Object} data - Profile data to validate
   * @throws {Error} If validation fails
   */
  validateProfileData(data) {
    if (data.firstName && (typeof data.firstName !== 'string' || data.firstName.trim().length < 2)) {
      throw new Error('First name must be at least 2 characters long');
    }

    if (data.lastName && (typeof data.lastName !== 'string' || data.lastName.trim().length < 2)) {
      throw new Error('Last name must be at least 2 characters long');
    }

    if (data.dateOfBirth) {
      const birthDate = new Date(data.dateOfBirth);
      const now = new Date();
      const minAge = 13; // Minimum age requirement
      const maxAge = 120; // Maximum reasonable age

      if (isNaN(birthDate.getTime())) {
        throw new Error('Invalid date of birth');
      }

      const age = Math.floor((now - birthDate) / (365.25 * 24 * 60 * 60 * 1000));

      if (age < minAge) {
        throw new Error(`Minimum age requirement is ${minAge} years`);
      }

      if (age > maxAge) {
        throw new Error('Invalid date of birth');
      }
    }

    if (data.phoneNumber && !/^\+?[\d\s\-\(\)]+$/.test(data.phoneNumber)) {
      throw new Error('Invalid phone number format');
    }

    if (data.placeOfBirth && typeof data.placeOfBirth !== 'object') {
      throw new Error('Place of birth must be an object with location details');
    }
  }

  /**
   * Validate user preferences
   * @param {Object} preferences - Preferences to validate
   * @throws {Error} If validation fails
   */
  validatePreferences(preferences) {
    const validPreferences = {
      language: ['en', 'hi', 'sa'],
      timezone: 'string',
      dateFormat: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'],
      chartStyle: ['north', 'south', 'east', 'western'],
      defaultAyanamsa: ['lahiri', 'krishnamurti', 'raman', 'yukteshwar'],
      notifications: {
        email: 'boolean',
        sms: 'boolean',
        push: 'boolean'
      },
      privacy: {
        profileVisibility: ['public', 'private', 'friends'],
        chartSharing: 'boolean',
        reportSharing: 'boolean'
      }
    };

    for (const [key, value] of Object.entries(preferences)) {
      if (!validPreferences.hasOwnProperty(key)) {
        throw new Error(`Invalid preference: ${key}`);
      }

      if (Array.isArray(validPreferences[key])) {
        if (!validPreferences[key].includes(value)) {
          throw new Error(`Invalid value for ${key}: ${value}`);
        }
      } else if (typeof validPreferences[key] === 'string') {
        if (typeof value !== validPreferences[key]) {
          throw new Error(`Invalid type for ${key}: expected ${validPreferences[key]}`);
        }
      } else if (typeof validPreferences[key] === 'object') {
        // Validate nested object
        for (const [nestedKey, nestedValue] of Object.entries(value)) {
          if (!validPreferences[key].hasOwnProperty(nestedKey)) {
            throw new Error(`Invalid preference: ${key}.${nestedKey}`);
          }

          const expectedType = validPreferences[key][nestedKey];
          if (typeof nestedValue !== expectedType) {
            throw new Error(`Invalid type for ${key}.${nestedKey}: expected ${expectedType}`);
          }
        }
      }
    }
  }

  /**
   * Validate image file
   * @param {Object} file - File object
   * @throws {Error} If validation fails
   */
  validateImageFile(file) {
    if (!file) {
      throw new Error('No file provided');
    }

    if (!file.buffer || !file.originalname) {
      throw new Error('Invalid file object');
    }

    // Check file size
    if (file.buffer.length > this.maxImageSize) {
      throw new Error(`File size too large. Maximum size is ${this.maxImageSize / (1024 * 1024)}MB`);
    }

    // Check file type
    const fileExtension = path.extname(file.originalname).toLowerCase().slice(1);
    if (!this.allowedImageTypes.includes(fileExtension)) {
      throw new Error(`Invalid file type. Allowed types: ${this.allowedImageTypes.join(', ')}`);
    }

    // Check MIME type
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp'
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new Error('Invalid file MIME type');
    }
  }

  /**
   * Validate subscription data
   * @param {Object} subscriptionData - Subscription data
   * @throws {Error} If validation fails
   */
  validateSubscriptionData(subscriptionData) {
    const validPlans = ['free', 'basic', 'premium', 'enterprise'];
    const validStatuses = ['active', 'inactive', 'cancelled', 'expired'];

    if (subscriptionData.plan && !validPlans.includes(subscriptionData.plan)) {
      throw new Error(`Invalid subscription plan: ${subscriptionData.plan}`);
    }

    if (subscriptionData.status && !validStatuses.includes(subscriptionData.status)) {
      throw new Error(`Invalid subscription status: ${subscriptionData.status}`);
    }

    if (subscriptionData.expiresAt) {
      const expiryDate = new Date(subscriptionData.expiresAt);
      if (isNaN(expiryDate.getTime())) {
        throw new Error('Invalid expiry date');
      }
    }
  }

  /**
   * Ensure upload directory exists
   */
  async ensureUploadDirectory() {
    try {
      await fs.mkdir(this.uploadPath, { recursive: true });
    } catch (error) {
      if (error.code !== 'EEXIST') {
        throw new Error(`Error creating upload directory: ${error.message}`);
      }
    }
  }

  /**
   * Get user activity summary
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Activity summary
   */
  async getUserActivitySummary(userId, options = {}) {
    try {
      // Get user statistics
      const { days = 30 } = options;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Retrieve activity logs from the dedicated ActivityLogRepository
      const recentActivities = await ActivityLogRepository.getRecentActivities(userId, { days });

      // Process activities to generate summary
      const chartsGenerated = recentActivities.filter(activity => activity.type === 'chart_generated').length;
      const reportsGenerated = recentActivities.filter(activity => activity.type === 'report_generated').length;
      const reportsViewed = recentActivities.filter(activity => activity.type === 'report_viewed').length;
      const logins = recentActivities.filter(activity => activity.type === 'login').length;
      const profileUpdates = recentActivities.filter(activity => activity.type === 'profile_update').length;

      // Get user statistics from UserRepository for static data
      const stats = await UserRepository.getUserStatistics(userId);

      const activitySummary = {
        period: `${days} days`,
        chartsGenerated: chartsGenerated,
        reportsGenerated: reportsGenerated,
        reportsViewed: reportsViewed,
        logins: logins,
        profileUpdates: profileUpdates,
        lastLogin: stats.lastLogin, // Assuming this is updated by login activity
        accountAge: Math.floor((new Date() - stats.memberSince) / (1000 * 60 * 60 * 24)),
        subscriptionStatus: stats.subscriptionStatus,
        emailVerified: stats.isEmailVerified,
        detailedActivities: recentActivities // Include raw activities for more detail
      };

      return {
        success: true,
        activity: activitySummary,
        message: 'Activity summary retrieved successfully'
      };
    } catch (error) {
      throw new Error(`Error getting activity summary: ${error.message}`);
    }
  }
}

module.exports = UserProfileService;
