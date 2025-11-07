/**
 * Express Application - Serverless Optimized for Vercel
 * Optimized version that works in both traditional and serverless environments
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

// Import routes
import indexRoutes from './api/routes/index.js';
import clientErrorLogRoutes from './api/routes/clientErrorLog.js';

// Import middleware
import errorHandling from './api/middleware/errorHandling.js';
import { jsonParsingErrorHandler } from './api/middleware/jsonSanitizer.js';

// Platform environment detection
const isRender = Boolean(process.env.RENDER);
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

// Determine __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Express app initialization
const app = express();

// Trust proxy in production (Render uses proxies)
if (isProduction) {
  app.set('trust proxy', 1);
}

// Security middleware - optimized for serverless
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https:"],
      fontSrc: ["'self'", "https:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  // Disable crossOriginEmbedderPolicy in serverless (can cause issues)
  crossOriginEmbedderPolicy: false,
}));

// Determine if we're in development environment (for local testing)
const isLocalTesting = !process.env.RENDER && process.env.NODE_ENV === 'production';

/**
 * Normalize URL to ensure it has a protocol
 * @param {string} url - URL string (may or may not have protocol)
 * @returns {string} URL with protocol
 */
function normalizeUrl(url) {
  if (!url) return null;
  // If URL already has protocol, return as-is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // Otherwise, prepend https://
  return `https://${url}`;
}

// CORS configuration for Render deployment
const corsOptions = {
  origin: isProduction && !isLocalTesting
    ? [
        process.env.FRONTEND_URL,
        'https://jjyotish-shastra-frontend.onrender.com',
        process.env.RENDER_EXTERNAL_URL ? normalizeUrl(process.env.RENDER_EXTERNAL_URL) : null,
      ].filter(Boolean)
    : [
        'http://localhost:3002',
        process.env.CORS_ORIGIN || 'http://localhost:3000',
        'http://localhost:3000',
        'http://localhost:3003',
        'http://127.0.0.1:3002',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3003',
        'http://localhost:8080',
        'http://127.0.0.1:8080',
        'http://0.0.0.0:8080',
      ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200,
};

// Log CORS origins in production for debugging
if (isProduction) {
  console.log('🔒 CORS enabled for origins:', corsOptions.origin);
}

app.use(cors(corsOptions));

// Add explicit preflight handling
app.options('*', cors(corsOptions));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (isDevelopment) {
  // File logging for development/local
  try {
    const logDir = path.join(__dirname, '..', 'logs', 'servers');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    const accessLogStream = fs.createWriteStream(
      path.join(logDir, 'back-end-server-logs.log'),
      { flags: 'a' }
    );
    
    if (process.env.NODE_ENV !== 'test') {
      app.use(morgan('dev'));
      app.use(morgan('combined', { stream: accessLogStream }));
    }
  } catch (error) {
    // Fallback to console logging if file system access fails
    console.warn('File logging unavailable, using console logging:', error.message);
    if (process.env.NODE_ENV !== 'test') {
      app.use(morgan('dev'));
    }
  }
} else {
  // Production: console logging (Render captures console output)
  if (isProduction) {
    app.use(morgan('combined'));
  } else {
    app.use(morgan('dev'));
  }
}

// Root endpoint - API documentation
app.get('/', (req, res) => {
  const protocol = req.protocol;
  const host = req.get('host');
  const baseUrl = `${protocol}://${host}`;
  
  res.status(200).json({
    message: 'Jyotish Shastra Backend API',
    version: '1.0.0',
    status: 'active',
    description: 'Vedic Astrology Chart Generation and Analysis API',
    documentation: {
      endpoints: {
        health: {
          url: '/health',
          method: 'GET',
          description: 'Server health check'
        },
        detailed_health: {
          url: '/api/v1/health',
          method: 'GET',
          description: 'Detailed health information with service status'
        },
        chart_generation: {
          url: '/api/v1/chart/generate',
          method: 'POST',
          description: 'Generate Vedic birth chart',
          example: {
            name: 'John Doe',
            dateOfBirth: '1990-01-01',
            timeOfBirth: '12:00',
            placeOfBirth: 'Mumbai, Maharashtra, India',
            latitude: 19.076,
            longitude: 72.8777,
            timezone: 'Asia/Kolkata'
          }
        },
        comprehensive_analysis: {
          url: '/api/v1/analysis/comprehensive',
          method: 'POST',
          description: 'Comprehensive astrological analysis'
        },
        geocoding: {
          url: '/api/v1/geocoding/location',
          method: 'POST',
          description: 'Convert location to coordinates'
        }
      }
    },
    links: {
      health: `${baseUrl}/health`,
      api_health: `${baseUrl}/api/v1/health`,
      repository: 'https://github.com/Victordtesla24/jyotish-shastra'
    },
    environment: process.env.NODE_ENV || 'development',
    platform: isRender ? 'render' : 'local',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    platform: isRender ? 'render' : 'local',
    render: isRender ? {
      serviceId: process.env.RENDER_SERVICE_ID,
      serviceName: process.env.RENDER_SERVICE_NAME,
      instanceId: process.env.RENDER_INSTANCE_ID,
    } : null,
  });
});

// API routes
app.use('/api', indexRoutes);
app.use('/api', clientErrorLogRoutes);

// API health endpoint for /api/v1/health compatibility
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    platform: isRender ? 'render' : 'local',
    render: isRender ? {
      serviceId: process.env.RENDER_SERVICE_ID,
      serviceName: process.env.RENDER_SERVICE_NAME,
      instanceId: process.env.RENDER_INSTANCE_ID,
    } : null,
    services: {
      geocoding: 'active',
      chartGeneration: 'active',
      analysis: 'active'
    }
  });
});

// Handle static file requests that should go to frontend
app.use('/static', (req, res) => {
  res.status(404).json({
    error: 'Static files should be served by frontend server',
    message: `Static file ${req.originalUrl} should be requested from the frontend`,
    ...(isDevelopment && {
      redirect: `http://localhost:3002${req.originalUrl}`,
    }),
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    available_endpoints: {
      health: 'GET /health',
      api_health: 'GET /api/v1/health',
      chart: 'POST /api/v1/chart/generate',
      analysis: 'POST /api/v1/analysis/comprehensive',
      geocoding: 'POST /api/v1/geocoding/location',
    },
    suggestion: 'Visit the root endpoint (/) for complete API documentation'
  });
});

// Catch-all route handler for undefined non-API routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    available_routes: {
      root: 'GET /',
      health: 'GET /health',
      api_health: 'GET /api/v1/health',
      chart: 'POST /api/v1/chart/generate',
      analysis: 'POST /api/v1/analysis/comprehensive',
      geocoding: 'POST /api/v1/geocoding/location'
    },
    suggestion: 'Visit the root endpoint (/) for complete API documentation',
    timestamp: new Date().toISOString()
  });
});

// JSON parsing error handling middleware (before general error handler)
app.use(jsonParsingErrorHandler);

// Global error handling middleware
app.use(errorHandling);

// Server initialization
const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`🚀 Jyotish Shastra Backend Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Platform: ${isRender ? 'Render' : 'Local'}`);
  if (isRender && process.env.RENDER_EXTERNAL_URL) {
    const externalUrl = normalizeUrl(process.env.RENDER_EXTERNAL_URL);
    console.log(`🔗 URL: ${externalUrl}`);
  } else {
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    console.log(`🎯 API Base URL: http://localhost:${PORT}/api`);
  }
});

// Graceful shutdown handlers
const gracefulShutdown = (signal) => {
  console.log(`${signal} received. Shutting down gracefully...`);
  server.close(() => {
    console.log('🛑 Server closed');
    process.exit(0);
  });
  
  // Force close after 10 seconds
  setTimeout(() => {
    console.error('⚠️  Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Enhanced error handlers with better logging and graceful shutdown
process.on('uncaughtException', (err) => {
  console.error('🚨 Uncaught Exception - Critical Error:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
  
  // Attempt graceful shutdown
  if (typeof server !== 'undefined') {
    server.close(() => {
      console.error('🛑 Server closed due to uncaught exception');
      process.exit(1);
    });
    
    // Force exit after 5 seconds
    setTimeout(() => {
      console.error('⚠️  Forced exit after uncaught exception timeout');
      process.exit(1);
    }, 5000);
  } else {
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Promise Rejection:', {
    reason: reason instanceof Error ? {
      name: reason.name,
      message: reason.message,
      stack: reason.stack
    } : reason,
    promise: promise,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
  
  // In production, attempt to continue running (log and monitor)
  // In development, exit to catch issues early
  if (process.env.NODE_ENV === 'production') {
    console.warn('⚠️  Continuing despite unhandled rejection (production mode)');
    // Optionally send to error tracking service
  } else {
    // Development: exit to catch issues early
    if (typeof server !== 'undefined') {
      server.close(() => {
        console.error('🛑 Server closed due to unhandled rejection');
        process.exit(1);
      });
      
      // Force exit after 5 seconds
      setTimeout(() => {
        console.error('⚠️  Forced exit after unhandled rejection timeout');
        process.exit(1);
      }, 5000);
    } else {
      process.exit(1);
    }
  }
});

export default app;
