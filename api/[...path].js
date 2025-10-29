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
  // Ensure request and response are properly formatted
  // Vercel provides req and res in Express-compatible format
  
  // Handle preflight OPTIONS requests explicitly
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Forward to Express app
  return new Promise((resolve) => {
    // Express app handles the request
    app(req, res, (err) => {
      if (err) {
        console.error('Express error in serverless function:', err);
        if (!res.headersSent) {
          res.status(500).json({
            error: 'Internal server error',
            message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred',
          });
        }
      }
      resolve();
    });
  });
}
