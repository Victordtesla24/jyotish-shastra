/**
 * User Repository - Data Access Layer
 * Handles all database operations for User model
 */

const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

class UserRepository {
  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user
   */
  static async createUser(userData) {
    try {
      const user = new User(userData);
      await user.save();

      // Remove password from response
      const userResponse = user.toObject();
      delete userResponse.password;

      return userResponse;
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  }

  /**
   * Find user by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} User data
   */
  static async findById(userId) {
    try {
      const user = await User.findById(userId)
        .select('-password')
        .populate('charts')
        .populate('reports');

      return user;
    } catch (error) {
      throw new Error(`Error finding user by ID: ${error.message}`);
    }
  }

  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Promise<Object|null>} User data
   */
  static async findByEmail(email) {
    try {
      const user = await User.findOne({ email: email.toLowerCase() });
      return user;
    } catch (error) {
      throw new Error(`Error finding user by email: ${error.message}`);
    }
  }

  /**
   * Find user by username
   * @param {string} username - Username
   * @returns {Promise<Object|null>} User data
   */
  static async findByUsername(username) {
    try {
      const user = await User.findOne({ username: username.toLowerCase() })
        .select('-password');

      return user;
    } catch (error) {
      throw new Error(`Error finding user by username: ${error.message}`);
    }
  }

  /**
   * Authenticate user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object|null>} User data if authenticated
   */
  static async authenticateUser(email, password) {
    try {
      const user = await User.findOne({ email: email.toLowerCase() });

      if (!user) {
        return null;
      }

      // Check if account is locked
      if (user.isAccountLocked()) {
        throw new Error('Account is temporarily locked due to too many failed login attempts');
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        // Increment failed login attempts
        await user.incLoginAttempts();
        return null;
      }

      // Reset login attempts on successful login
      if (user.loginAttempts > 0) {
        await user.resetLoginAttempts();
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Remove password from response
      const userResponse = user.toObject();
      delete userResponse.password;

      return userResponse;
    } catch (error) {
      throw new Error(`Error authenticating user: ${error.message}`);
    }
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated user
   */
  static async updateProfile(userId, updateData) {
    try {
      // Remove sensitive fields from update data
      const allowedFields = [
        'firstName', 'lastName', 'dateOfBirth', 'placeOfBirth',
        'phoneNumber', 'preferences', 'profilePicture'
      ];

      const filteredData = {};
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          filteredData[field] = updateData[field];
        }
      });

      const user = await User.findByIdAndUpdate(
        userId,
        { $set: filteredData },
        { new: true, runValidators: true }
      ).select('-password');

      return user;
    } catch (error) {
      throw new Error(`Error updating user profile: ${error.message}`);
    }
  }

  /**
   * Change user password
   * @param {string} userId - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<boolean>} Success status
   */
  static async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);

      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      user.password = hashedPassword;
      user.passwordChangedAt = new Date();
      await user.save();

      return true;
    } catch (error) {
      throw new Error(`Error changing password: ${error.message}`);
    }
  }

  /**
   * Generate password reset token
   * @param {string} email - User email
   * @returns {Promise<string>} Reset token
   */
  static async generatePasswordResetToken(email) {
    try {
      const user = await User.findOne({ email: email.toLowerCase() });

      if (!user) {
        throw new Error('User not found');
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

      // Set reset token and expiry (10 minutes)
      user.passwordResetToken = hashedToken;
      user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();

      return resetToken;
    } catch (error) {
      throw new Error(`Error generating password reset token: ${error.message}`);
    }
  }

  /**
   * Reset password using token
   * @param {string} token - Reset token
   * @param {string} newPassword - New password
   * @returns {Promise<boolean>} Success status
   */
  static async resetPassword(token, newPassword) {
    try {
      // Hash the token to compare with stored token
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: new Date() }
      });

      if (!user) {
        throw new Error('Token is invalid or has expired');
      }

      // Hash new password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password and clear reset fields
      user.password = hashedPassword;
      user.passwordChangedAt = new Date();
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      user.loginAttempts = 0;
      user.lockUntil = undefined;

      await user.save();

      return true;
    } catch (error) {
      throw new Error(`Error resetting password: ${error.message}`);
    }
  }

  /**
   * Generate email verification token
   * @param {string} userId - User ID
   * @returns {Promise<string>} Verification token
   */
  static async generateEmailVerificationToken(userId) {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      if (user.isEmailVerified) {
        throw new Error('Email is already verified');
      }

      // Generate verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');

      // Set verification token and expiry (24 hours)
      user.emailVerificationToken = hashedToken;
      user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await user.save();

      return verificationToken;
    } catch (error) {
      throw new Error(`Error generating email verification token: ${error.message}`);
    }
  }

  /**
   * Verify email using token
   * @param {string} token - Verification token
   * @returns {Promise<boolean>} Success status
   */
  static async verifyEmail(token) {
    try {
      // Hash the token to compare with stored token
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpires: { $gt: new Date() }
      });

      if (!user) {
        throw new Error('Token is invalid or has expired');
      }

      // Mark email as verified
      user.isEmailVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      user.emailVerifiedAt = new Date();

      await user.save();

      return true;
    } catch (error) {
      throw new Error(`Error verifying email: ${error.message}`);
    }
  }

  /**
   * Update user preferences
   * @param {string} userId - User ID
   * @param {Object} preferences - User preferences
   * @returns {Promise<Object>} Updated user
   */
  static async updatePreferences(userId, preferences) {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { $set: { preferences } },
        { new: true, runValidators: true }
      ).select('-password');

      return user;
    } catch (error) {
      throw new Error(`Error updating preferences: ${error.message}`);
    }
  }

  /**
   * Update subscription
   * @param {string} userId - User ID
   * @param {Object} subscriptionData - Subscription data
   * @returns {Promise<Object>} Updated user
   */
  static async updateSubscription(userId, subscriptionData) {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { $set: { subscription: subscriptionData } },
        { new: true, runValidators: true }
      ).select('-password');

      return user;
    } catch (error) {
      throw new Error(`Error updating subscription: ${error.message}`);
    }
  }

  /**
   * Add chart to user
   * @param {string} userId - User ID
   * @param {string} chartId - Chart ID
   * @returns {Promise<Object>} Updated user
   */
  static async addChart(userId, chartId) {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { $addToSet: { charts: chartId } },
        { new: true }
      ).select('-password');

      return user;
    } catch (error) {
      throw new Error(`Error adding chart to user: ${error.message}`);
    }
  }

  /**
   * Remove chart from user
   * @param {string} userId - User ID
   * @param {string} chartId - Chart ID
   * @returns {Promise<Object>} Updated user
   */
  static async removeChart(userId, chartId) {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { $pull: { charts: chartId } },
        { new: true }
      ).select('-password');

      return user;
    } catch (error) {
      throw new Error(`Error removing chart from user: ${error.message}`);
    }
  }

  /**
   * Add report to user
   * @param {string} userId - User ID
   * @param {string} reportId - Report ID
   * @returns {Promise<Object>} Updated user
   */
  static async addReport(userId, reportId) {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { $addToSet: { reports: reportId } },
        { new: true }
      ).select('-password');

      return user;
    } catch (error) {
      throw new Error(`Error adding report to user: ${error.message}`);
    }
  }

  /**
   * Get user statistics
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User statistics
   */
  static async getUserStatistics(userId) {
    try {
      const user = await User.findById(userId)
        .populate('charts')
        .populate('reports')
        .select('-password');

      if (!user) {
        throw new Error('User not found');
      }

      const stats = {
        totalCharts: user.charts.length,
        totalReports: user.reports.length,
        memberSince: user.createdAt,
        lastLogin: user.lastLogin,
        isEmailVerified: user.isEmailVerified,
        subscriptionStatus: user.subscription.status,
        subscriptionPlan: user.subscription.plan
      };

      return stats;
    } catch (error) {
      throw new Error(`Error getting user statistics: ${error.message}`);
    }
  }

  /**
   * Get users with pagination
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated users
   */
  static async getUsers(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        search = '',
        status = 'all'
      } = options;

      const skip = (page - 1) * limit;

      // Build query
      const query = {};

      if (search) {
        query.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { username: { $regex: search, $options: 'i' } }
        ];
      }

      if (status !== 'all') {
        if (status === 'active') {
          query.isActive = true;
        } else if (status === 'inactive') {
          query.isActive = false;
        } else if (status === 'verified') {
          query.isEmailVerified = true;
        } else if (status === 'unverified') {
          query.isEmailVerified = false;
        }
      }

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const users = await User.find(query)
        .select('-password -passwordResetToken -emailVerificationToken')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('charts', 'name createdAt')
        .populate('reports', 'title createdAt');

      const total = await User.countDocuments(query);

      return {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Error getting users: ${error.message}`);
    }
  }

  /**
   * Delete user account
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} Success status
   */
  static async deleteUser(userId) {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      // Soft delete - mark as inactive
      user.isActive = false;
      user.deletedAt = new Date();
      await user.save();

      return true;
    } catch (error) {
      throw new Error(`Error deleting user: ${error.message}`);
    }
  }

  /**
   * Restore deleted user account
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} Success status
   */
  static async restoreUser(userId) {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      // Restore user
      user.isActive = true;
      user.deletedAt = undefined;
      await user.save();

      return true;
    } catch (error) {
      throw new Error(`Error restoring user: ${error.message}`);
    }
  }

  /**
   * Check if email exists
   * @param {string} email - Email to check
   * @returns {Promise<boolean>} Email exists status
   */
  static async emailExists(email) {
    try {
      const user = await User.findOne({ email: email.toLowerCase() });
      return !!user;
    } catch (error) {
      throw new Error(`Error checking email existence: ${error.message}`);
    }
  }

  /**
   * Check if username exists
   * @param {string} username - Username to check
   * @returns {Promise<boolean>} Username exists status
   */
  static async usernameExists(username) {
    try {
      const user = await User.findOne({ username: username.toLowerCase() });
      return !!user;
    } catch (error) {
      throw new Error(`Error checking username existence: ${error.message}`);
    }
  }

  /**
   * Get user charts
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} User charts
   */
  static async getUserCharts(userId, options = {}) {
    try {
      const { page = 1, limit = 10 } = options;
      const skip = (page - 1) * limit;

      const user = await User.findById(userId)
        .populate({
          path: 'charts',
          options: {
            sort: { createdAt: -1 },
            skip,
            limit
          }
        })
        .select('charts');

      if (!user) {
        throw new Error('User not found');
      }

      return user.charts;
    } catch (error) {
      throw new Error(`Error getting user charts: ${error.message}`);
    }
  }

  /**
   * Get user reports
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} User reports
   */
  static async getUserReports(userId, options = {}) {
    try {
      const { page = 1, limit = 10 } = options;
      const skip = (page - 1) * limit;

      const user = await User.findById(userId)
        .populate({
          path: 'reports',
          options: {
            sort: { createdAt: -1 },
            skip,
            limit
          }
        })
        .select('reports');

      if (!user) {
        throw new Error('User not found');
      }

      return user.reports;
    } catch (error) {
      throw new Error(`Error getting user reports: ${error.message}`);
    }
  }
}

module.exports = UserRepository;
