const rateLimit = require('express-rate-limit');

// Authentication rate limiter: 100 requests per 15 minutes per IP (relaxed for testing/demos)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts from this IP, please try again after 15 minutes',
  },
});

// General API rate limiter: 2000 requests per 15 minutes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please slow down',
  },
});

module.exports = {
  authLimiter,
  generalLimiter,
};
