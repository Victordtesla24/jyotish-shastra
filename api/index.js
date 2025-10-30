/**
 * Vercel Serverless Function Entry Point for /api route
 * Wraps Express app for Vercel serverless deployment
 * Note: api/[...path].js should handle all /api/* routes, this is fallback
 */

import app from '../src/index.serverless.js';

export default function handler(req, res) {
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
  
  // Forward directly to Express app
  return app(req, res);
}
