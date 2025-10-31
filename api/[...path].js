/**
 * Vercel Serverless Function for All API Routes
 * Catches all /api/* routes and forwards to Express app
 * Optimized for Vercel serverless functions
 */

let app;
try {
  app = await import('../src/index.serverless.js');
  app = app.default || app;
} catch (importError) {
  console.error('Failed to import Express app:', importError);
  throw importError;
}

/**
 * Vercel serverless function handler
 * Simply forwards to Express app - Vercel req/res are Express-compatible
 */
export default async function handler(req, res) {
  // Ensure app is loaded
  if (!app) {
    try {
      const module = await import('../src/index.serverless.js');
      app = module.default || module;
    } catch (error) {
      console.error('Failed to load Express app:', error);
      return res.status(500).json({
        error: 'Server initialization failed',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
  try {
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
  } catch (error) {
    console.error('Serverless function error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}
