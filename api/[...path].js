/**
 * Vercel Serverless Function for All API Routes
 * Catches all /api/* routes and forwards to Express app
 * Optimized for Vercel serverless functions
 */

import app from '../src/index.serverless.js';

/**
 * Vercel serverless function handler
 * Wraps Express app for serverless execution
 */
export default async function handler(req, res) {
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
  
  // Forward to Express app using Promise wrapper
  return new Promise((resolve, reject) => {
    // Express app handles the request
    // In Vercel, app(req, res) is sufficient as Vercel provides Express-compatible objects
    app(req, res, (err) => {
      if (err) {
        console.error('Express error in serverless function:', err);
        if (!res.headersSent) {
          res.status(500).json({
            error: 'Internal server error',
            message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred',
            timestamp: new Date().toISOString(),
          });
        }
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
