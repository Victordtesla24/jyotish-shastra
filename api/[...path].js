/**
 * Vercel Serverless Function for All API Routes
 * Catches all /api/* routes and forwards to Express app
 * Optimized for Vercel serverless functions
 */

import app from '../src/index.serverless.js';

/**
 * Vercel serverless function handler
 * Simply forwards to Express app - Vercel req/res are Express-compatible
 */
export default function handler(req, res) {
  // Handle preflight OPTIONS requests explicitly for CORS
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Max-Age', '86400');
    return res.status(200).end();
  }
  
  // Add CORS headers before Express handles the request
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  // Forward directly to Express app
  // Vercel provides Express-compatible req/res objects
  // Errors are handled by Express error middleware
  return app(req, res);
}
