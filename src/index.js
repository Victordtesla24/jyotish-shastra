const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('dotenv').config();

// Import routes
const chartRoutes = require('./api/routes/chart');
const comprehensiveAnalysisRoutes = require('./api/routes/comprehensiveAnalysis');
const geocodingRoutes = require('./api/routes/geocoding');
const indexRoutes = require('./api/routes/index');

// Import middleware
const errorHandling = require('./api/middleware/errorHandling');
const logging = require('./api/middleware/logging');

const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiting with proper proxy configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting in development to avoid X-Forwarded-For warnings
  skip: (req) => process.env.NODE_ENV === 'development'
});

// Security middleware
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
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL || 'https://your-domain.com'
    : [
        process.env.CORS_ORIGIN || 'http://localhost:3000',
        'http://localhost:3002',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3002'
      ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Compression middleware
app.use(compression());

// Apply rate limiting to all requests
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}
app.use(logging);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api', indexRoutes);
app.use('/api/chart', chartRoutes);
app.use('/api/comprehensive-analysis', comprehensiveAnalysisRoutes);
app.use('/api/geocoding', geocodingRoutes);

// Handle static file requests that should go to frontend
app.use('/static', (req, res) => {
  res.status(404).json({
    error: 'Static files should be served by frontend server',
    message: `Static file ${req.originalUrl} should be requested from http://localhost:3002`,
    redirect: `http://localhost:3002${req.originalUrl}`
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    available_endpoints: {
      'health': 'GET /health',
      'chart': 'GET|POST /api/chart',
      'analysis': 'GET|POST /api/comprehensive-analysis',
      'geocoding': 'POST /api/geocoding/location, POST /api/geocoding/timezone'
    }
  });
});

// Global error handling middleware
app.use(errorHandling);

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Jyotish Shastra Backend Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🎯 API Base URL: http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('🛑 Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('🛑 Server closed');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => {
    process.exit(1);
  });
});

module.exports = app;
