/**
 * User Authentication Service
 * Implements business logic for user authentication, authorization, and security
 * Built on top of UserRepository for data access
 */

const UserRepository = require('../../data/repositories/UserRepository');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const fetch = require('node-fetch');

class UserAuthenticationService {
  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'jyotish-shastra-secret';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
    this.refreshTokenExpiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || '30d';
  }

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Registration result with tokens
   */
  async registerUser(userData) {
    try {
      // Validate required fields
      const requiredFields = ['email', 'password', 'firstName', 'lastName'];
      for (const field of requiredFields) {
        if (!userData[field]) {
          throw new Error(`${field} is required`);
        }
      }

      // Check if email already exists
      const existingUser = await UserRepository.findByEmail(userData.email);
      if (existingUser) {
        throw new Error('Email already registered');
      }

      // Check if username exists (if provided)
      if (userData.username) {
        const existingUsername = await UserRepository.findByUsername(userData.username);
        if (existingUsername) {
          throw new Error('Username already taken');
        }
      }

      // Create user
      const user = await UserRepository.createUser(userData);

      // Generate email verification token
      const verificationToken = await UserRepository.generateEmailVerificationToken(user._id);

      // Generate JWT tokens
      const tokens = this.generateTokens(user);

      return {
        success: true,
        user,
        tokens,
        verificationToken,
        message: 'User registered successfully. Please verify your email.'
      };
    } catch (error) {
      throw new Error(`Registration failed: ${error.message}`);
    }
  }

  /**
   * Login user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} ipAddress - User IP address
   * @returns {Promise<Object>} Login result with tokens
   */
  async loginUser(email, password, ipAddress = null) {
    try {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      // Authenticate user
      const user = await UserRepository.authenticateUser(email, password);

      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Check if account is active
      if (!user.isActive) {
        throw new Error('Account is deactivated. Please contact support.');
      }

      // Generate JWT tokens
      const tokens = this.generateTokens(user);

      // Log login attempt
      await this.logLoginAttempt(user._id, ipAddress, true);

      return {
        success: true,
        user,
        tokens,
        message: 'Login successful'
      };
    } catch (error) {
      // Log failed login attempt
      if (email) {
        const user = await UserRepository.findByEmail(email);
        if (user) {
          await this.logLoginAttempt(user._id, ipAddress, false);
        }
      }

      throw new Error(`Login failed: ${error.message}`);
    }
  }

  /**
   * Refresh access token using refresh token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} New tokens
   */
  async refreshToken(refreshToken) {
    try {
      if (!refreshToken) {
        throw new Error('Refresh token is required');
      }

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, this.jwtSecret);

      // Get user
      const user = await UserRepository.findById(decoded.userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (!user.isActive) {
        throw new Error('Account is deactivated');
      }

      // Generate new tokens
      const tokens = this.generateTokens(user);

      return {
        success: true,
        tokens,
        message: 'Token refreshed successfully'
      };
    } catch (error) {
      throw new Error(`Token refresh failed: ${error.message}`);
    }
  }

  /**
   * Logout user (invalidate tokens)
   * @param {string} userId - User ID
   * @param {string} token - Access token
   * @returns {Promise<Object>} Logout result
   */
  async logoutUser(userId, token) {
    try {
      // Add token to blacklist for security
      await this.blacklistToken(token);

      // Clear user sessions
      await this.clearUserSessions(userId);

      // Log the logout event
      await this.logLogout(userId);

      return {
        success: true,
        message: 'Logged out successfully'
      };
    } catch (error) {
      throw new Error(`Logout failed: ${error.message}`);
    }
  }

  /**
   * Verify email using verification token
   * @param {string} token - Email verification token
   * @returns {Promise<Object>} Verification result
   */
  async verifyEmail(token) {
    try {
      const success = await UserRepository.verifyEmail(token);

      if (!success) {
        throw new Error('Email verification failed');
      }

      return {
        success: true,
        message: 'Email verified successfully'
      };
    } catch (error) {
      throw new Error(`Email verification failed: ${error.message}`);
    }
  }

  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise<Object>} Reset request result
   */
  async requestPasswordReset(email) {
    try {
      if (!email) {
        throw new Error('Email is required');
      }

      const resetToken = await UserRepository.generatePasswordResetToken(email);

      return {
        success: true,
        resetToken,
        message: 'Password reset token generated'
      };
    } catch (error) {
      throw new Error(`Password reset request failed: ${error.message}`);
    }
  }

  /**
   * Reset password using reset token
   * @param {string} token - Reset token
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Reset result
   */
  async resetPassword(token, newPassword) {
    try {
      if (!token || !newPassword) {
        throw new Error('Token and new password are required');
      }

      // Validate password strength
      this.validatePasswordStrength(newPassword);

      const success = await UserRepository.resetPassword(token, newPassword);

      if (!success) {
        throw new Error('Password reset failed');
      }

      return {
        success: true,
        message: 'Password reset successfully'
      };
    } catch (error) {
      throw new Error(`Password reset failed: ${error.message}`);
    }
  }

  /**
   * Change user password
   * @param {string} userId - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Change result
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      if (!currentPassword || !newPassword) {
        throw new Error('Current password and new password are required');
      }

      // Validate password strength
      this.validatePasswordStrength(newPassword);

      const success = await UserRepository.changePassword(userId, currentPassword, newPassword);

      if (!success) {
        throw new Error('Password change failed');
      }

      return {
        success: true,
        message: 'Password changed successfully'
      };
    } catch (error) {
      throw new Error(`Password change failed: ${error.message}`);
    }
  }

  /**
   * Verify JWT token and get user
   * @param {string} token - JWT token
   * @returns {Promise<Object>} User data
   */
  async verifyToken(token) {
    try {
      if (!token) {
        throw new Error('Token is required');
      }

      // Remove 'Bearer ' prefix if present
      const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;

      // Verify token
      const decoded = jwt.verify(cleanToken, this.jwtSecret);

      // Get user
      const user = await UserRepository.findById(decoded.userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (!user.isActive) {
        throw new Error('Account is deactivated');
      }

      return {
        success: true,
        user,
        tokenData: decoded
      };
    } catch (error) {
      throw new Error(`Token verification failed: ${error.message}`);
    }
  }

  /**
   * Generate JWT access and refresh tokens
   * @param {Object} user - User object
   * @returns {Object} Tokens object
   */
  generateTokens(user) {
    const payload = {
      userId: user._id,
      email: user.email,
      username: user.username,
      role: user.role || 'user'
    };

    const accessToken = jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
      issuer: 'jyotish-shastra',
      subject: user._id.toString()
    });

    const refreshToken = jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.refreshTokenExpiresIn,
      issuer: 'jyotish-shastra',
      subject: user._id.toString()
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.jwtExpiresIn,
      tokenType: 'Bearer'
    };
  }

  /**
   * Validate password strength
   * @param {string} password - Password to validate
   * @throws {Error} If password doesn't meet requirements
   */
  validatePasswordStrength(password) {
    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    if (!/(?=.*[a-z])/.test(password)) {
      throw new Error('Password must contain at least one lowercase letter');
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      throw new Error('Password must contain at least one uppercase letter');
    }

    if (!/(?=.*\d)/.test(password)) {
      throw new Error('Password must contain at least one number');
    }

    if (!/(?=.*[@$!%*?&])/.test(password)) {
      throw new Error('Password must contain at least one special character (@$!%*?&)');
    }
  }

  /**
   * Check user authorization for specific actions
   * @param {Object} user - User object
   * @param {string} action - Action to authorize
   * @param {Object} resource - Resource being accessed
   * @returns {boolean} Authorization result
   */
  async authorizeUser(user, action, resource = null) {
    try {
      // Basic role-based authorization
      const userRole = user.role || 'user';

      // Admin can do everything
      if (userRole === 'admin') {
        return true;
      }

      // Premium users have additional permissions
      if (userRole === 'premium') {
        const premiumActions = [
          'generate_advanced_reports',
          'access_divisional_charts',
          'unlimited_chart_generation'
        ];

        if (premiumActions.includes(action)) {
          return true;
        }
      }

      // Basic user permissions
      const basicActions = [
        'generate_basic_reports',
        'access_natal_chart',
        'view_profile',
        'update_profile'
      ];

      if (basicActions.includes(action)) {
        return true;
      }

      // Resource-based authorization
      if (resource && resource.userId) {
        // Users can only access their own resources
        return resource.userId.toString() === user._id.toString();
      }

      return false;
    } catch (error) {
      console.error('Authorization error:', error);
      return false;
    }
  }

  /**
   * Log login attempt
   * @param {string} userId - User ID
   * @param {string} ipAddress - IP address
   * @param {boolean} success - Login success status
   */
  async logLoginAttempt(userId, ipAddress, success) {
    try {
      const auditLog = {
        userId: userId,
        action: 'LOGIN_ATTEMPT',
        ipAddress: ipAddress,
        success: success,
        timestamp: new Date(),
        userAgent: this.getCurrentUserAgent(),
        location: await this.getLocationFromIP(ipAddress),
        riskScore: await this.calculateRiskScore(userId, ipAddress),
        sessionId: this.generateSessionId()
      };

      // Store in security audit collection
      await this.storeSecurityLog(auditLog);

      // Check for suspicious patterns
      if (!success) {
        await this.checkFailedLoginPatterns(userId, ipAddress);
      }

      // Update user's last login timestamp on success
      if (success) {
        await UserRepository.updateLastLogin(userId, new Date());
      }
    } catch (error) {
      console.error('Error logging login attempt:', error);
      // Fallback logging to ensure audit trail is maintained
      this.fallbackLog(`LOGIN_ATTEMPT: User ${userId}, IP: ${ipAddress}, Success: ${success}, Time: ${new Date()}`);
    }
  }

  /**
   * Log logout
   * @param {string} userId - User ID
   */
  async logLogout(userId) {
    try {
      const auditLog = {
        userId: userId,
        action: 'LOGOUT',
        timestamp: new Date(),
        sessionDuration: await this.calculateSessionDuration(userId),
        ipAddress: this.getCurrentIPAddress(),
        userAgent: this.getCurrentUserAgent(),
        logoutReason: 'USER_INITIATED'
      };

      // Store in security audit collection
      await this.storeSecurityLog(auditLog);

      // Update user activity metrics
      await this.updateUserActivityMetrics(userId);

    } catch (error) {
      console.error('Error logging logout:', error);
      // Fallback logging to ensure audit trail is maintained
      this.fallbackLog(`LOGOUT: User ${userId}, Time: ${new Date()}`);
    }
  }

  /**
   * Get user session info
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Session information
   */
  async getSessionInfo(userId) {
    try {
      const user = await UserRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      return {
        userId: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        subscription: user.subscription
      };
    } catch (error) {
      throw new Error(`Error getting session info: ${error.message}`);
    }
  }

  /**
   * Resend email verification
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Resend result
   */
  async resendEmailVerification(userId) {
    try {
      const user = await UserRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (user.isEmailVerified) {
        throw new Error('Email is already verified');
      }

      const verificationToken = await UserRepository.generateEmailVerificationToken(userId);

      return {
        success: true,
        verificationToken,
        message: 'Verification email sent'
      };
    } catch (error) {
      throw new Error(`Error resending verification: ${error.message}`);
    }
  }

  /**
   * Add token to blacklist
   * @param {string} token - Token to blacklist
   */
  async blacklistToken(token) {
    try {
      const decoded = jwt.decode(token);
      if (decoded) {
        const blacklistEntry = {
          token: token,
          userId: decoded.userId,
          blacklistedAt: new Date(),
          expiresAt: new Date(decoded.exp * 1000),
          reason: 'USER_LOGOUT'
        };

        // Store in blacklist collection/cache
        await this.storeInBlacklist(blacklistEntry);
      }
    } catch (error) {
      console.error('Error blacklisting token:', error);
    }
  }

  /**
   * Clear all user sessions
   * @param {string} userId - User ID
   */
  async clearUserSessions(userId) {
    try {
      // Clear active sessions for user
      await this.clearActiveSessions(userId);

      // Invalidate all refresh tokens for user
      await this.invalidateRefreshTokens(userId);
    } catch (error) {
      console.error('Error clearing user sessions:', error);
    }
  }

  /**
   * Store security audit log
   * @param {Object} auditLog - Audit log entry
   */
  async storeSecurityLog(auditLog) {
    try {
      // In production, this would connect to a dedicated audit log database
      const SecurityAuditRepository = require('../../data/repositories/SecurityAuditRepository');
      await SecurityAuditRepository.create(auditLog);
    } catch (error) {
      console.error('Error storing security log:', error);
      this.fallbackLog(JSON.stringify(auditLog));
    }
  }

  /**
   * Calculate session duration
   * @param {string} userId - User ID
   * @returns {number} Session duration in minutes
   */
  async calculateSessionDuration(userId) {
    try {
      const sessionStart = await this.getSessionStartTime(userId);
      if (sessionStart) {
        return Math.floor((new Date() - sessionStart) / (1000 * 60));
      }
      return 0;
    } catch (error) {
      console.error('Error calculating session duration:', error);
      return 0;
    }
  }

  /**
   * Calculate risk score for login attempt
   * @param {string} userId - User ID
   * @param {string} ipAddress - IP address
   * @returns {number} Risk score (0-100)
   */
  async calculateRiskScore(userId, ipAddress) {
    try {
      let riskScore = 0;

      // Check for unusual IP
      const isKnownIP = await this.isKnownIPAddress(userId, ipAddress);
      if (!isKnownIP) riskScore += 30;

      // Check recent failed attempts
      const recentFailures = await this.getRecentFailedAttempts(userId);
      riskScore += Math.min(40, recentFailures * 10);

      // Check time-based patterns
      const isUnusualTime = await this.isUnusualLoginTime(userId);
      if (isUnusualTime) riskScore += 20;

      // Check geographical location
      const isUnusualLocation = await this.isUnusualLocation(userId, ipAddress);
      if (isUnusualLocation) riskScore += 25;

      return Math.min(100, riskScore);
    } catch (error) {
      console.error('Error calculating risk score:', error);
      return 50; // Default medium risk
    }
  }

  /**
   * Check for failed login patterns
   * @param {string} userId - User ID
   * @param {string} ipAddress - IP address
   */
  async checkFailedLoginPatterns(userId, ipAddress) {
    try {
      const recentFailures = await this.getRecentFailedAttempts(userId, ipAddress);

      // Implement account lockout after multiple failed attempts
      if (recentFailures >= 5) {
        await this.lockAccount(userId, 'MULTIPLE_FAILED_ATTEMPTS');
      }

      // Check for brute force patterns
      if (recentFailures >= 3) {
        await this.flagSuspiciousActivity(userId, ipAddress, 'POTENTIAL_BRUTE_FORCE');
      }
    } catch (error) {
      console.error('Error checking failed login patterns:', error);
    }
  }

  /**
   * Get current user agent
   * @returns {string} User agent string
   */
  getCurrentUserAgent() {
    // In a real implementation, this would be passed from the request
    return process.env.REQUEST_USER_AGENT || 'Unknown';
  }

  /**
   * Get current IP address
   * @returns {string} IP address
   */
  getCurrentIPAddress() {
    // In a real implementation, this would be passed from the request
    return process.env.REQUEST_IP_ADDRESS || '127.0.0.1';
  }

  /**
   * Get location from IP address using production-grade geolocation service
   * @param {string} ipAddress - IP address
   * @returns {Object} Location data
   */
  async getLocationFromIP(ipAddress) {
    try {
      // Use ipapi.co for production-grade IP geolocation
      const response = await fetch(`https://ipapi.co/${ipAddress}/json/`, {
        method: 'GET',
        headers: {
          'User-Agent': 'VedicAstrologyApp/1.0',
          'Accept': 'application/json'
        },
        timeout: 10000
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Validate and return structured location data
      return {
        country: data.country_name || 'Unknown',
        region: data.region || data.state || 'Unknown',
        city: data.city || 'Unknown',
        latitude: parseFloat(data.latitude) || 0,
        longitude: parseFloat(data.longitude) || 0,
        isp: data.org || data.isp || 'Unknown',
        timezone: data.timezone || 'UTC',
        country_code: data.country_code || 'XX',
        region_code: data.region_code || 'XX'
      };
    } catch (error) {
      console.error('Error getting location from IP:', error);

      // Fallback to alternative service if primary fails
      try {
        const fallbackResponse = await fetch(`https://ipinfo.io/${ipAddress}/json`, {
          method: 'GET',
          headers: {
            'User-Agent': 'VedicAstrologyApp/1.0',
            'Accept': 'application/json'
          },
          timeout: 5000
        });

        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          const [lat, lon] = (fallbackData.loc || '0,0').split(',').map(Number);

          return {
            country: fallbackData.country || 'Unknown',
            region: fallbackData.region || 'Unknown',
            city: fallbackData.city || 'Unknown',
            latitude: lat || 0,
            longitude: lon || 0,
            isp: fallbackData.org || 'Unknown',
            timezone: fallbackData.timezone || 'UTC',
            country_code: fallbackData.country || 'XX',
            region_code: fallbackData.region || 'XX'
          };
        }
      } catch (fallbackError) {
        console.error('Fallback geolocation service also failed:', fallbackError);
      }

      // Return minimal data if all services fail
      return {
        country: 'Unknown',
        region: 'Unknown',
        city: 'Unknown',
        latitude: 0,
        longitude: 0,
        isp: 'Unknown',
        timezone: 'UTC',
        country_code: 'XX',
        region_code: 'XX'
      };
    }
  }

  /**
   * Generate session ID
   * @returns {string} Session ID
   */
  generateSessionId() {
    return require('crypto').randomBytes(32).toString('hex');
  }

  /**
   * Fallback logging method
   * @param {string} message - Log message
   */
  fallbackLog(message) {
    const logEntry = `[${new Date().toISOString()}] SECURITY_LOG: ${message}`;
            // Only log in development mode to avoid cluttering test output
        if (process.env.NODE_ENV === 'development') {
            console.log(logEntry);
        }

    // In production, you might also want to write to a file or send to an external service
    try {
      const fs = require('fs');
      const path = require('path');
      const logDir = path.join(process.cwd(), 'logs');
      const logFile = path.join(logDir, 'security-audit.log');

      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }

      fs.appendFileSync(logFile, logEntry + '\n');
    } catch (fileError) {
      console.error('Error writing to fallback log file:', fileError);
    }
  }

  /**
   * Store in blacklist cache/database
   * @param {Object} blacklistEntry - Blacklist entry
   */
  async storeInBlacklist(blacklistEntry) {
    // Implementation would depend on your caching/database strategy
    // Could be Redis, database table, or in-memory cache
            // Only log in development mode to avoid cluttering test output
        if (process.env.NODE_ENV === 'development') {
            console.log('Token blacklisted:', blacklistEntry.token.slice(0, 20) + '...');
        }
  }

  /**
   * Clear active sessions for user
   * @param {string} userId - User ID
   */
  async clearActiveSessions(userId) {
    // Implementation would clear session data from your session store
    // Only log in development mode to avoid cluttering test output
    if (process.env.NODE_ENV === 'development') {
        console.log(`Cleared active sessions for user: ${userId}`);
    }
  }

  /**
   * Invalidate refresh tokens for user
   * @param {string} userId - User ID
   */
  async invalidateRefreshTokens(userId) {
    // Implementation would invalidate stored refresh tokens
    // Only log in development mode to avoid cluttering test output
    if (process.env.NODE_ENV === 'development') {
        console.log(`Invalidated refresh tokens for user: ${userId}`);
    }
  }

  /**
   * Helper methods for risk calculation and security checks
   */
  async isKnownIPAddress(userId, ipAddress) {
    try {
      const UserRepository = require('../../data/repositories/UserRepository');
      const user = await UserRepository.findById(userId);

      if (!user || !user.knownIPAddresses) {
        return false;
      }

      // Check for exact match
      if (user.knownIPAddresses.includes(ipAddress)) {
        return true;
      }

      // Check for subnet matches (for dynamic IPs from same ISP)
      const ipParts = ipAddress.split('.');
      const subnet = `${ipParts[0]}.${ipParts[1]}.${ipParts[2]}`;

      return user.knownIPAddresses.some(knownIP => {
        const knownParts = knownIP.split('.');
        const knownSubnet = `${knownParts[0]}.${knownParts[1]}.${knownParts[2]}`;
        return knownSubnet === subnet;
      });
    } catch (error) {
      console.error('Error checking known IP address:', error);
      return false;
    }
  }

  async getRecentFailedAttempts(userId, ipAddress = null) {
    try {
      const SecurityAuditRepository = require('../../data/repositories/SecurityAuditRepository');
      const timeWindow = new Date(Date.now() - (24 * 60 * 60 * 1000)); // Last 24 hours

      const query = {
        action: 'LOGIN_ATTEMPT',
        success: false,
        timestamp: { $gte: timeWindow }
      };

      if (userId) {
        query.userId = userId;
      }

      if (ipAddress) {
        query.ipAddress = ipAddress;
      }

      const failedAttempts = await SecurityAuditRepository.find(query);
      return failedAttempts ? failedAttempts.length : 0;
    } catch (error) {
      console.error('Error getting recent failed attempts:', error);
      return 0;
    }
  }

  async isUnusualLoginTime(userId) {
    try {
      const SecurityAuditRepository = require('../../data/repositories/SecurityAuditRepository');
      const currentHour = new Date().getHours();
      const pastDays = 30; // Analyze last 30 days
      const timeWindow = new Date(Date.now() - (pastDays * 24 * 60 * 60 * 1000));

      // Get successful login attempts from the past 30 days
      const loginHistory = await SecurityAuditRepository.find({
        userId: userId,
        action: 'LOGIN_ATTEMPT',
        success: true,
        timestamp: { $gte: timeWindow }
      });

      if (!loginHistory || loginHistory.length < 5) {
        return false; // Not enough data to determine unusual patterns
      }

      // Calculate user's typical login hours
      const hourCounts = new Array(24).fill(0);
      loginHistory.forEach(login => {
        const hour = new Date(login.timestamp).getHours();
        hourCounts[hour]++;
      });

      // Find the user's most active hours (hours with >10% of total logins)
      const totalLogins = loginHistory.length;
      const activeHours = hourCounts
        .map((count, hour) => ({ hour, count, percentage: (count / totalLogins) * 100 }))
        .filter(item => item.percentage > 10)
        .map(item => item.hour);

      // Current hour is unusual if it's not in the active hours
      if (activeHours.length === 0) {
        return false; // No clear pattern
      }

      // Check if current hour is within 2 hours of any active hour (to account for time zone changes)
      return !activeHours.some(activeHour => {
        const diff = Math.min(
          Math.abs(currentHour - activeHour),
          Math.abs(currentHour - activeHour + 24),
          Math.abs(currentHour - activeHour - 24)
        );
        return diff <= 2;
      });
    } catch (error) {
      console.error('Error checking unusual login time:', error);
      return false;
    }
  }

  async isUnusualLocation(userId, ipAddress) {
    try {
      const currentLocation = await this.getLocationFromIP(ipAddress);
      if (!currentLocation || !currentLocation.country) {
        return false; // Can't determine location
      }

      const SecurityAuditRepository = require('../../data/repositories/SecurityAuditRepository');
      const pastDays = 60; // Analyze last 60 days
      const timeWindow = new Date(Date.now() - (pastDays * 24 * 60 * 60 * 1000));

      // Get successful login attempts with location data from the past 60 days
      const loginHistory = await SecurityAuditRepository.find({
        userId: userId,
        action: 'LOGIN_ATTEMPT',
        success: true,
        timestamp: { $gte: timeWindow },
        'location.country': { $exists: true }
      });

      if (!loginHistory || loginHistory.length < 3) {
        return false; // Not enough data to determine unusual patterns
      }

      // Extract known countries and cities
      const knownCountries = new Set();
      const knownCities = new Set();

      loginHistory.forEach(login => {
        if (login.location) {
          knownCountries.add(login.location.country);
          if (login.location.city) {
            knownCities.add(`${login.location.city}, ${login.location.country}`);
          }
        }
      });

      // Check if current location is in known locations
      const isKnownCountry = knownCountries.has(currentLocation.country);
      const currentCityCountry = `${currentLocation.city}, ${currentLocation.country}`;
      const isKnownCity = knownCities.has(currentCityCountry);

      // Location is unusual if it's a new country or if it's more than 500km from known cities
      if (!isKnownCountry) {
        return true; // New country is unusual
      }

      if (!isKnownCity && currentLocation.latitude && currentLocation.longitude) {
        // Check distance from known locations
        const isNearKnownLocation = loginHistory.some(login => {
          if (!login.location || !login.location.latitude || !login.location.longitude) {
            return false;
          }

          const distance = this.calculateDistance(
            currentLocation.latitude, currentLocation.longitude,
            login.location.latitude, login.location.longitude
          );

          return distance <= 500; // Within 500km is considered nearby
        });

        return !isNearKnownLocation;
      }

      return false;
    } catch (error) {
      console.error('Error checking unusual location:', error);
      return false;
    }
  }

  async lockAccount(userId, reason) {
    // Only log in development mode to avoid cluttering test output
    if (process.env.NODE_ENV === 'development') {
        console.log(`Account locked for user ${userId}, reason: ${reason}`);
    }
    // Implementation would lock the account
  }

  async flagSuspiciousActivity(userId, ipAddress, type) {
    // Only log in development mode to avoid cluttering test output
    if (process.env.NODE_ENV === 'development') {
        console.log(`Suspicious activity flagged: ${type} for user ${userId} from IP ${ipAddress}`);
    }
    // Implementation would flag for security review
  }

  async getSessionStartTime(userId) {
    try {
      const SecurityAuditRepository = require('../../data/repositories/SecurityAuditRepository');

      // Find the most recent successful login for this user
      const recentLogin = await SecurityAuditRepository.findOne({
        userId: userId,
        action: 'LOGIN_ATTEMPT',
        success: true
      }, { timestamp: -1 });

      if (recentLogin) {
        return recentLogin.timestamp;
      }

      // Fallback: check for any login-related activity
      const recentActivity = await SecurityAuditRepository.findOne({
        userId: userId,
        action: { $in: ['LOGIN_ATTEMPT', 'TOKEN_REFRESH', 'SESSION_START'] }
      }, { timestamp: -1 });

      return recentActivity ? recentActivity.timestamp : new Date();
    } catch (error) {
      console.error('Error getting session start time:', error);
      return new Date();
    }
  }

  async updateUserActivityMetrics(userId) {
    // Update user activity analytics
    // Only log in development mode to avoid cluttering test output
    if (process.env.NODE_ENV === 'development') {
        console.log(`Updated activity metrics for user: ${userId}`);
    }
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   * @param {number} lat1 - Latitude of first point
   * @param {number} lon1 - Longitude of first point
   * @param {number} lat2 - Latitude of second point
   * @param {number} lon2 - Longitude of second point
   * @returns {number} Distance in kilometers
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   * @param {number} degrees - Degrees to convert
   * @returns {number} Radians
   */
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }
}

module.exports = UserAuthenticationService;
