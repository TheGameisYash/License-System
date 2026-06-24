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
const softwareRoute = require('./api/software');

// ✅ NEW: Users route
const usersRoutes = require('./api/users');

// ============================================================================
// MOUNT ALL API ROUTES
// ============================================================================

// Device registration
router.use('/register', registerRoute);

// License validation
router.use('/validate', validateRoute);

// License information
router.use('/license-info', infoRoute);

// HWID reset request & check status
router.use('/', resetRoute);

// Ban check
router.use('/check-ban', banRoute);

// Health check
router.use('/health', healthRoute);

// Software version + announcements (public)
router.use('/software', softwareRoute);

// ✅ NEW: Users routes
router.use('/users', usersRoutes);

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
      authentication: {
        header: 'X-Software-API-Key',
        description: 'Per-software API key (found in admin panel). Required for most endpoints. Can also be sent as query param api_key or body field api_key.',
        responseSignature: 'Responses include X-Response-Signature header (HMAC-SHA256) when API key is configured'
      },
      endpoints: {
        register: {
          method: 'POST',
          path: '/api/register',
          description: 'Register a device with a license key',
          auth: 'X-Software-API-Key',
          body: {
            license: 'string (required) - License key',
            hwid: 'string (required if binding=hwid) - Hardware ID (10-256 chars)',
            device_name: 'string (optional) - Friendly device name',
            device_info: 'string (optional) - Device details',
            software_id: 'string (optional, default: "default") - Target software ID',
            username: 'string (conditional) - Required if authMode=license_credentials',
            password: 'string (conditional) - Required if authMode=license_credentials',
            user_id: 'string (optional) - User identifier for user_id binding',
            cpu_info: 'string (optional) - CPU fingerprint',
            gpu_info: 'string (optional) - GPU fingerprint',
            motherboard_uuid: 'string (optional) - Motherboard UUID'
          }
        },
        validate: {
          method: 'GET',
          path: '/api/validate',
          description: 'Validate a license + HWID combination',
          auth: 'X-Software-API-Key',
          query: {
            license: 'string (required) - License key',
            hwid: 'string (required if binding=hwid) - Hardware ID',
            software_id: 'string (optional) - Target software ID',
            username: 'string (conditional) - Required if authMode=license_credentials',
            password: 'string (conditional) - Required if authMode=license_credentials'
          }
        },
        licenseInfo: {
          method: 'GET',
          path: '/api/license-info',
          description: 'Get license status and metadata',
          auth: 'X-Software-API-Key',
          query: { license: 'string (required) - License key' }
        },
        requestReset: {
          method: 'POST',
          path: '/api/request-hwid-reset',
          description: 'Request HWID reset (requires admin approval)',
          auth: 'X-Software-API-Key',
          body: {
            license: 'string (required) - License key',
            hwid: 'string (required) - Current hardware ID',
            reason: 'string (optional, max 500 chars) - Reset reason'
          }
        },
        checkStatus: {
          method: 'GET',
          path: '/api/check-request-status',
          description: 'Check latest HWID reset request status',
          auth: 'X-Software-API-Key',
          query: { license: 'string (required) - License key' }
        },
        checkBan: {
          method: 'GET',
          path: '/api/check-ban',
          description: 'Check if a HWID is banned',
          auth: 'X-Software-API-Key',
          query: { hwid: 'string (required) - Hardware ID' }
        },
        health: {
          method: 'GET',
          path: '/api/health',
          description: 'Basic API health check',
          auth: 'None'
        },
        healthDetailed: {
          method: 'GET',
          path: '/api/health/detailed',
          description: 'Detailed system status with DB and cache stats',
          auth: 'None'
        },
        softwareVersion: {
          method: 'GET',
          path: '/api/software/:id/version',
          description: 'Get latest version info for a software product',
          auth: 'None'
        },
        softwareAnnouncements: {
          method: 'GET',
          path: '/api/software/:id/announcements',
          description: 'Get active announcements for a software product',
          auth: 'None'
        },
        userRegister: {
          method: 'POST',
          path: '/api/users/register',
          description: 'Create user account linked to a license key',
          auth: 'None',
          body: {
            username: 'string (required, 3-20 chars, alphanumeric + underscore)',
            password: 'string (required, 4-64 chars)',
            email: 'string (optional)',
            license_key: 'string (required) - Valid license key to link',
            software_id: 'string (optional, default: "default")'
          }
        },
        userLogin: {
          method: 'POST',
          path: '/api/users/login',
          description: 'Authenticate user and get live license status',
          auth: 'None',
          body: {
            username: 'string (required)',
            password: 'string (required)',
            software_id: 'string (optional, default: "default")'
          }
        }
      },
      responseCodes: {
        200: 'Success',
        201: 'Created',
        400: 'Bad Request — missing or invalid parameters',
        401: 'Unauthorized — invalid credentials or API key',
        403: 'Forbidden — banned, mismatch, or access denied',
        404: 'Not Found — license/software/endpoint not found',
        409: 'Conflict — already registered or duplicate',
        410: 'Gone — license expired',
        429: 'Too Many Requests — rate limit exceeded',
        500: 'Internal Server Error',
        503: 'Service Unavailable — API disabled or maintenance'
      },
      responseFormat: {
        success: 'boolean - Whether the request succeeded',
        code: 'string - Machine-readable status code',
        message: 'string - Human-readable message',
        data: 'object|null - Response payload'
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
        'GET  /api/validate',
        'GET  /api/license-info',
        'POST /api/request-hwid-reset',
        'GET  /api/check-request-status',
        'GET  /api/check-ban',
        'GET  /api/health',
        'GET  /api/health/detailed',
        'GET  /api/software/:id/version',
        'GET  /api/software/:id/announcements',
        'POST /api/users/register',
        'POST /api/users/login'
      ]
    }
  });
});

module.exports = router;