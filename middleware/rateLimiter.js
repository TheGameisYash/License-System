// middleware/rateLimiter.js - FIXED
const rateLimit = require('express-rate-limit');
const { CONFIG } = require('../config/constants');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: CONFIG.RATE_LIMIT_MAX,
  message: {
    success: false,
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests',
    data: null
  },
  standardHeaders: true,
  legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: CONFIG.AUTH_RATE_LIMIT_MAX,
  message: {
    success: false,
    code: 'AUTH_RATE_LIMIT',
    message: 'Too many login attempts',
    data: null
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Export correctly
module.exports = {
  rateLimiters: {
    api: apiLimiter,
    auth: authLimiter
  }
};
