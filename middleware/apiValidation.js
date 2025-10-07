// middleware/apiValidation.js - Shared API Validation Middleware
const { validateHWID } = require('../utils/validators');
const { getSettingsCached, getBanlistCached } = require('../utils/optimization');

// Check if API is enabled
async function checkAPIEnabled(req, res, next) {
  try {
    const settings = await getSettingsCached();
    if (!settings.apiEnabled) {
      return res.status(503).json({
        success: false,
        code: 'API_DISABLED',
        message: 'API is currently disabled. Please contact support.',
        data: null
      });
    }
    next();
  } catch (error) {
    console.error('API check error:', error);
    return res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'Internal server error',
      data: null
    });
  }
}

// Validate HWID format
function validateHWIDMiddleware(req, res, next) {
  const hwid = req.body.hwid || req.query.hwid;
  
  if (!hwid) {
    return res.status(400).json({
      success: false,
      code: 'MISSING_HWID',
      message: 'HWID is required',
      data: null
    });
  }
  
  if (!validateHWID(hwid)) {
    return res.status(400).json({
      success: false,
      code: 'INVALID_HWID',
      message: 'Invalid HWID format. HWID must be alphanumeric.',
      data: null
    });
  }
  
  next();
}

// Check if HWID is banned
async function checkHWIDBanned(req, res, next) {
  try {
    const hwid = req.body.hwid || req.query.hwid;
    const banlist = await getBanlistCached();
    
    if (banlist.includes(hwid)) {
      return res.status(403).json({
        success: false,
        code: 'HWID_BANNED',
        message: 'This hardware ID is permanently banned',
        data: { hwid: hwid.substring(0, 20) + '...' }
      });
    }
    
    next();
  } catch (error) {
    console.error('Ban check error:', error);
    next(); // Continue even if ban check fails
  }
}

// Validate license key format
function validateLicenseKey(req, res, next) {
  const license = req.body.license || req.query.license;
  
  if (!license) {
    return res.status(400).json({
      success: false,
      code: 'MISSING_LICENSE',
      message: 'License key is required',
      data: null
    });
  }
  
  if (typeof license !== 'string' || license.trim().length === 0) {
    return res.status(400).json({
      success: false,
      code: 'INVALID_LICENSE',
      message: 'License key must be a non-empty string',
      data: null
    });
  }
  
  next();
}

// Rate limiting helper
const requestCounts = new Map();
function simpleRateLimit(maxRequests = 10, windowMs = 60000) {
  return (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();
    
    if (!requestCounts.has(ip)) {
      requestCounts.set(ip, []);
    }
    
    const requests = requestCounts.get(ip).filter(time => now - time < windowMs);
    
    if (requests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        code: 'RATE_LIMIT_EXCEEDED',
        message: `Too many requests. Maximum ${maxRequests} requests per minute.`,
        data: null
      });
    }
    
    requests.push(now);
    requestCounts.set(ip, requests);
    
    next();
  };
}

// Clean up old rate limit data every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, times] of requestCounts.entries()) {
    const filtered = times.filter(time => now - time < 60000);
    if (filtered.length === 0) {
      requestCounts.delete(ip);
    } else {
      requestCounts.set(ip, filtered);
    }
  }
}, 300000);

module.exports = {
  checkAPIEnabled,
  validateHWIDMiddleware,
  checkHWIDBanned,
  validateLicenseKey,
  simpleRateLimit
};
