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

// Security HTTP headers
app.use(helmet());

// CORS Configuration
const allowedOrigins = [
  config.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5000',
  'http://127.0.0.1:5000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS policy: Not allowed by Access-Control-Allow-Origin'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

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
