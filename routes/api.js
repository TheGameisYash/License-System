// routes/api.js - MAIN API ROUTER (MODULAR & CLEAN)
const express = require('express');
const router = express.Router();

// Import all API route modules
const registerRoute = require('./api/register');
const validateRoute = require('./api/validate');
const infoRoute = require('./api/info');
const resetRoute = require('./api/reset');
const banRoute = require('./api/ban');
const healthRoute = require('./api/health');

// ============================================================================
// MOUNT ALL API ROUTES
// ============================================================================

// Device registration
router.use('/register', registerRoute);

// License validation
router.use('/validate', validateRoute);

// License information
router.use('/license-info', infoRoute);

// HWID reset request
router.use('/request-hwid-reset', resetRoute);

// Check reset request status
router.use('/check-request-status', resetRoute);

// Ban check
router.use('/check-ban', banRoute);

// Health check
router.use('/health', healthRoute);

// ============================================================================
// API ROOT - Documentation
// ============================================================================

router.get('/', (req, res) => {
  const { CONFIG } = require('../config/constants');
  
  res.json({
    success: true,
    message: 'Ultra License System API',
    version: CONFIG.API_VERSION,
    documentation: {
      endpoints: {
        register: {
          method: 'POST',
          path: '/api/register',
          description: 'Register a device with a license key',
          parameters: {
            license: 'License key (required)',
            hwid: 'Hardware ID (required)',
            device_name: 'Device name (optional)',
            device_info: 'Device info (optional)'
          }
        },
        validate: {
          method: 'GET',
          path: '/api/validate',
          description: 'Validate a license and HWID',
          parameters: {
            license: 'License key (required)',
            hwid: 'Hardware ID (required)'
          }
        },
        licenseInfo: {
          method: 'GET',
          path: '/api/license-info',
          description: 'Get license information',
          parameters: {
            license: 'License key (required)'
          }
        },
        requestReset: {
          method: 'POST',
          path: '/api/request-hwid-reset',
          description: 'Request HWID reset (requires admin approval)',
          parameters: {
            license: 'License key (required)',
            hwid: 'Current hardware ID (required)',
            reason: 'Reason for reset (optional)'
          }
        },
        checkStatus: {
          method: 'GET',
          path: '/api/check-request-status',
          description: 'Check status of reset request',
          parameters: {
            license: 'License key (required)'
          }
        },
        checkBan: {
          method: 'GET',
          path: '/api/check-ban',
          description: 'Check if HWID is banned',
          parameters: {
            hwid: 'Hardware ID (required)'
          }
        },
        health: {
          method: 'GET',
          path: '/api/health',
          description: 'Check API health status'
        }
      },
      responseCodes: {
        200: 'Success',
        201: 'Created',
        400: 'Bad Request',
        403: 'Forbidden',
        404: 'Not Found',
        409: 'Conflict',
        410: 'Gone (Expired)',
        429: 'Too Many Requests',
        500: 'Internal Server Error',
        503: 'Service Unavailable'
      }
    },
    timestamp: new Date().toISOString()
  });
});

// ============================================================================
// 404 HANDLER FOR UNKNOWN API ROUTES
// ============================================================================

router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    code: 'ENDPOINT_NOT_FOUND',
    message: 'API endpoint not found',
    data: {
      requestedPath: req.originalUrl,
      method: req.method,
      availableEndpoints: [
        'POST /api/register',
        'GET /api/validate',
        'GET /api/license-info',
        'POST /api/request-hwid-reset',
        'GET /api/check-request-status',
        'GET /api/check-ban',
        'GET /api/health'
      ]
    }
  });
});

module.exports = router;
