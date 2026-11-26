const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const routes = require('./routes');
const { notFoundHandler, errorHandler } = require('./middlewares/errorMiddleware');
const { generalLimiter } = require('./middlewares/rateLimiter');
const setupSwagger = require('./docs/swagger');
const config = require('./config/environment');

// Initialize Event Listeners
const registerActivityLogger = require('./events/listeners/activityLogger');
const registerNotifier = require('./events/listeners/notifier');

registerActivityLogger();
registerNotifier();

const app = express();

// Set proxy trust for Render / Cloud reverse proxies (Crucial for secure cookies & IP detection)
app.set('trust proxy', 1);

// Security HTTP headers with cross-origin credentials allowance
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Robust CORS Middleware for Cross-Domain production communication
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Allow all *.vercel.app, localhost, and explicit origins with credentials
  if (
    !origin ||
    origin.includes('vercel.app') ||
    origin.includes('localhost') ||
    origin.includes('127.0.0.1')
  ) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );

  // Directly answer HTTP OPTIONS preflight with 200 OK
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
});

// HTTP Logging (only enabled when DEBUG_HTTP=true or in specific troubleshooting)
if (process.env.DEBUG_HTTP === 'true') {
  app.use(morgan('dev'));
}

// Cookie parser & JSON body parser with safety payload limits
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Apply general rate limiting
app.use('/api', generalLimiter);

// API Documentation
setupSwagger(app);

// Mount API routes
app.use('/api', routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Catch-all 404 handler
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

module.exports = app;
