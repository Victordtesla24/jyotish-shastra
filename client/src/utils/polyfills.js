/**
 * Polyfill Utilities for Node.js Compatibility
 *
 * Addresses DEP0060: util._extend() deprecation warning
 * Ensures modern Object.assign() usage throughout the application
 *
 * @see https://nodejs.org/api/deprecations.html#DEP0060
 */

// Ensure Object.assign is available (it should be in Node.js 6+)
if (!Object.assign) {
  Object.assign = require('object-assign');
}

/**
 * Modern replacement for deprecated util._extend()
 * Uses Object.assign() as recommended by Node.js documentation
 *
 * @param {Object} target - The target object to extend
 * @param {Object} source - The source object to copy properties from
 * @returns {Object} The extended target object
 */
function modernExtend(target, source) {
  return Object.assign(target || {}, source);
}

/**
 * Safe utility function to merge objects
 * Production-grade replacement for util._extend
 *
 * @param {...Object} objects - Objects to merge
 * @returns {Object} Merged object
 */
function safeExtend(...objects) {
  return Object.assign({}, ...objects);
}

module.exports = {
  modernExtend,
  safeExtend,
  // Export Object.assign for consistency
  assign: Object.assign
};
