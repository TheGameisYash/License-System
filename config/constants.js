// config/constants.js
const crypto = require('crypto');

const CONFIG = {
  // Admin
  ADMIN_USERNAME: process.env.ADMIN_USERNAME || 'admin',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'admin',
  
  // Session
  SESSION_SECRET: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
  
  // Server
  API_VERSION: '2.0.0',
  PORT: process.env.PORT || 3000,
  
  // License
  MAX_DEVICES_PER_LICENSE: 1,
  
  // Rate Limiting
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  AUTH_RATE_LIMIT_MAX: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 10,
  
  // Cache TTLs
  LICENSE_CACHE_TTL: 10 * 60 * 1000,      // 10 minutes
  VALIDATION_SKIP_TTL: 5 * 60 * 1000,      // 5 minutes
  SETTINGS_CACHE_TTL: 30 * 60 * 1000,      // 30 minutes
  BANLIST_CACHE_TTL: 30 * 60 * 1000,       // 30 minutes
  
  // Activity Logging
  ACTIVITY_BATCH_SIZE: 50,
  ACTIVITY_FLUSH_INTERVAL: 5 * 60 * 1000,  // 5 minutes
  
  // Webhook
  DISCORD_WEBHOOK_URL: process.env.DISCORD_WEBHOOK_URL || ''
};

module.exports = { CONFIG };
