import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

// Import routes
import chartRoutes from './api/routes/chart.js';
import comprehensiveAnalysisRoutes from './api/routes/comprehensiveAnalysis.js';
import geocodingRoutes from './api/routes/geocoding.js';
import indexRoutes from './api/routes/index.js';
import clientErrorLogRoutes from './api/routes/clientErrorLog.js';

// Import middleware
import errorHandling from './api/middleware/errorHandling.js';

const app = express();
const __dirname = path.dirname(new URL(import.meta.url).pathname);
const PORT = process.env.PORT || 3001;


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
        'http://localhost:3002', // Primary frontend development port
        process.env.CORS_ORIGIN || 'http://localhost:3000',
        'http://localhost:3000', // Common React dev port
        'http://localhost:3003', // Legacy fallback
        'http://127.0.0.1:3002',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3003'
      ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
// Create a write stream (in append mode)
const accessLogStream = fs.createWriteStream(path.join(__dirname, '..', 'logs', 'servers', 'back-end-server-logs.log'), { flags: 'a' });

if (process.env.NODE_ENV !== 'test') {
  // Log to the console
  app.use(morgan('dev'));
  // Log to the file
  app.use(morgan('combined', { stream: accessLogStream }));
}

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
app.use('/api', clientErrorLogRoutes);
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

export default app;
