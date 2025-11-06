/**
 * JSON Sanitizer Middleware
 * Sanitizes incoming JSON requests to handle common formatting issues
 * like smart quotes, zero-width characters, and other Unicode issues
 */

// Simple logging utility
const logger = {
  info: (message, data) => console.log(`[JSONSanitizer] INFO: ${message}`, data || ''),
  warn: (message, data) => console.warn(`[JSONSanitizer] WARN: ${message}`, data || ''),
  error: (message, data) => console.error(`[JSONSanitizer] ERROR: ${message}`, data || '')
};

/**
 * Sanitizes JSON strings by replacing smart quotes and other problematic characters
 * @param {string} jsonString - The JSON string to sanitize
 * @returns {string} - Sanitized JSON string
 */
function sanitizeJsonString(jsonString) {
  if (typeof jsonString !== 'string') {
    return jsonString;
  }

  return jsonString
    // Replace smart quotes with regular quotes
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    // Remove zero-width characters
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    // Replace em/en dashes with regular hyphens
    .replace(/[\u2013\u2014]/g, '-')
    // Replace ellipsis character
    .replace(/\u2026/g, '...')
    // Normalize line endings
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');
}

/**
 * Middleware to sanitize JSON request bodies
 */
export function jsonSanitizerMiddleware(req, res, next) {
  // Only process if Content-Type indicates JSON
  const contentType = req.get('Content-Type');
  if (!contentType || !contentType.includes('application/json')) {
    return next();
  }

  // Store original json parser
  const _originalJson = req.body;

  // Override the raw body if it exists
  if (req.rawBody) {
    try {
      const sanitizedBody = sanitizeJsonString(req.rawBody.toString());
      req.body = JSON.parse(sanitizedBody);
      logger.info('JSON sanitization applied successfully');
    } catch (error) {
      logger.warn('JSON sanitization failed, proceeding with original parsing', {
        error: error.message,
        originalBody: req.rawBody?.toString()?.substring(0, 200) + '...'
      });
    }
  }

  next();
}

/**
 * Enhanced error handler specifically for JSON parsing errors
 */
export function jsonParsingErrorHandler(err, req, res, next) {
  // Check if this is a JSON parsing error
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    const errorBody = err.body || '';

    // Check for smart quotes in the error
    const hasSmartQuotes = errorBody.includes('\u201C') || errorBody.includes('\u201D') ||
                          errorBody.includes('\u2018') || errorBody.includes('\u2019');
    const hasUnicodeIssues = /[\u200B-\u200D\uFEFF]/.test(errorBody) ||
                            errorBody.includes('\u2013') || errorBody.includes('\u2014') || errorBody.includes('\u2026');

    let message = 'Invalid JSON format in request body';
    const suggestions = [];

    if (hasSmartQuotes) {
      suggestions.push('Replace smart quotes with regular quotes (", \')');
    }

    if (hasUnicodeIssues) {
      suggestions.push('Remove special Unicode characters (em-dash, zero-width spaces, etc.)');
    }

    if (suggestions.length === 0) {
      suggestions.push('Ensure JSON is properly formatted with correct syntax');
      suggestions.push('Check for missing commas, brackets, or quotes');
    }

    logger.error('JSON parsing error detected', {
      originalError: err.message,
      bodyPreview: errorBody.substring(0, 200),
      hasSmartQuotes,
      hasUnicodeIssues,
      suggestions
    });

    return res.status(400).json({
      success: false,
      error: 'JSON Parse Error',
      message,
      suggestions,
      details: {
        originalError: err.message,
        bodyPreview: errorBody.length > 100 ? errorBody.substring(0, 100) + '...' : errorBody
      }
    });
  }

  // Pass to next error handler if not a JSON parsing error
  next(err);
}

export default {
  jsonSanitizerMiddleware,
  jsonParsingErrorHandler,
  sanitizeJsonString
};
