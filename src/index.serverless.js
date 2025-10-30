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

// Serverless environment detection
const isVercel = Boolean(process.env.VERCEL || process.env.VERCEL_ENV);
const isServerless = isVercel || Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME) || Boolean(process.env.FUNCTION_NAME);
const isDevelopment = process.env.NODE_ENV === 'development' && !isServerless;
const isProduction = process.env.NODE_ENV === 'production' || isVercel;

// Determine __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Express app initialization
const app = express();

// Trust proxy in production/serverless (Vercel uses proxies)
if (isProduction || isServerless) {
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

// CORS configuration - optimized for serverless
const corsOptions = {
  origin: isProduction
    ? [
        process.env.FRONTEND_URL,
        process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
        process.env.VERCEL_PRODUCTION_LINK,
      ].filter(Boolean)
    : [
        'http://localhost:3002',
        process.env.CORS_ORIGIN || 'http://localhost:3000',
        'http://localhost:3000',
        'http://localhost:3003',
        'http://127.0.0.1:3002',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3003',
      ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  // Preflight handling for serverless
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware - serverless optimized
if (!isServerless) {
  // Traditional file logging for development/local
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
  // Serverless: console logging only (Vercel captures console output)
  if (process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
  } else if (isProduction) {
    // Production serverless: minimal logging
    app.use(morgan('combined'));
  }
}

// Health check endpoint - critical for serverless
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    platform: isServerless ? 'serverless' : 'traditional',
    vercel: isVercel ? {
      env: process.env.VERCEL_ENV,
      url: process.env.VERCEL_URL,
      deployment: process.env.VERCEL_DEPLOYMENT_ID,
    } : null,
  });
});

// API routes
app.use('/api', indexRoutes);
app.use('/api', clientErrorLogRoutes);

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
      chart: 'POST /api/v1/chart/generate',
      analysis: 'POST /api/v1/analysis/comprehensive',
      geocoding: 'POST /api/v1/geocoding/location',
    },
  });
});

// JSON parsing error handling middleware (before general error handler)
app.use(jsonParsingErrorHandler);

// Global error handling middleware
app.use(errorHandling);

// Server initialization - only for non-serverless environments
if (!isServerless) {
  const PORT = process.env.PORT || 3001;
  
  const server = app.listen(PORT, () => {
    console.log(`🚀 Jyotish Shastra Backend Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    console.log(`🎯 API Base URL: http://localhost:${PORT}/api`);
  });

  // Graceful shutdown handlers (only for traditional server)
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
} else {
  // Serverless environment: log startup info
  if (!isProduction) {
    console.log('🚀 Jyotish Shastra Backend (Serverless Mode)');
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Platform: Vercel Serverless`);
    if (process.env.VERCEL_URL) {
      console.log(`🔗 URL: https://${process.env.VERCEL_URL}`);
    }
  }
}

// Error handlers for serverless
if (isServerless) {
  // Handle uncaught exceptions in serverless
  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    // In serverless, we should not call process.exit()
    // Let Vercel handle the error
  });

  // Handle unhandled promise rejections in serverless
  process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    // In serverless, we should not call process.exit()
    // Let Vercel handle the error
  });
} else {
  // Traditional error handlers
  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
  });

  process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    if (typeof server !== 'undefined') {
      server.close(() => {
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  });
}

export default app;
