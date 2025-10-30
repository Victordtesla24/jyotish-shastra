/**
 * Vercel Serverless Function Entry Point for /api route
 * Wraps Express app for Vercel serverless deployment
 * Note: api/[...path].js should handle all /api/* routes, this is fallback
 */

import app from '../src/index.serverless.js';

export default async function handler(req, res) {
  // Handle preflight OPTIONS requests explicitly for CORS
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Max-Age', '86400');
    return res.status(200).end();
  }
  
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  // Forward to Express app
  return new Promise((resolve, reject) => {
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
