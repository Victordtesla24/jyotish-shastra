import jwt from 'jsonwebtoken';

/**
 * Get JWT secret from environment variables
 * Validates lazily when middleware is actually used
 * @returns {string} JWT secret
 * @throws {Error} If JWT_SECRET is not set
 */
function getJwtSecret() {
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    throw new Error(
      'JWT_SECRET environment variable is not set. This is required for authentication. ' +
      'Please set JWT_SECRET in your environment variables or .env file. ' +
      'For production, generate a secure random string (e.g., using: openssl rand -base64 32)'
    );
  }
  return JWT_SECRET;
}

/**
 * Required authentication middleware
 * Validates JWT token and attaches user to request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function required(req, res, next) {
  try {
    const JWT_SECRET = getJwtSecret();
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  } catch (err) {
    // JWT_SECRET not set - return 500 with clear error message
    return res.status(500).json({
      error: 'Authentication configuration error',
      message: err.message,
      hint: 'Please configure JWT_SECRET environment variable'
    });
  }
}

/**
 * Optional authentication middleware
 * Validates JWT token if present, but doesn't require it
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function optional(req, res, next) {
  try {
    const JWT_SECRET = getJwtSecret();
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
      } catch (err) {
        // Ignore invalid token for optional auth
      }
    }
    next();
  } catch (err) {
    // JWT_SECRET not set - log warning but allow request to continue
    console.warn('JWT_SECRET not configured - optional authentication disabled:', err.message);
    next();
  }
}

export default {
  required,
  optional
};
