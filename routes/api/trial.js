// routes/api/trial.js - Secure 24-Hour Trial Endpoint
const express = require('express');
const router = express.Router();
const crypto = require('crypto');

const {
  getSoftwareCached,
  logActivityBatched
} = require('../../utils/optimization');

const { getTrial, saveTrial } = require('../../utils/database');
const { sanitizeInput, validateHWID } = require('../../utils/validators');
const { simpleRateLimit } = require('../../middleware/apiValidation');

// POST /api/trial
router.post('/',
  simpleRateLimit(5, 60000), // Max 5 requests per minute
  async (req, res) => {
    const { hwid, user_id, device_name, device_info, software_id } = req.body;
    const softwareId = software_id || 'default';

    try {
      // ── Validate basic parameters
      if (!hwid) {
        return res.status(400).json({
          success: false,
          message: 'Missing HWID'
        });
      }

      if (!validateHWID(hwid)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid HWID format. Must be 10-256 characters.'
        });
      }

      // ── Load software config
      const sw = await getSoftwareCached(softwareId);
      if (!sw) {
        return res.status(404).json({
          success: false,
          message: 'Software not found'
        });
      }

      // ── Override res.json to sign response
      const originalJson = res.json;
      res.json = function (body) {
        if (sw && sw.apiKey) {
          const signature = crypto.createHmac('sha256', sw.apiKey).update(JSON.stringify(body)).digest('hex');
          res.setHeader('X-Response-Signature', signature);
        }
        return originalJson.call(this, body);
      };

      // ── API Key Validation (Validate header against the configuration)
      const apiKey = req.headers['x-software-api-key'] || req.body.api_key || req.query.api_key;
      if (!apiKey || apiKey !== sw.apiKey) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or missing X-Software-API-Key authorization header'
        });
      }

      if (!sw.apiEnabled) {
        return res.status(503).json({
          success: false,
          message: 'API is disabled for this software'
        });
      }

      if (sw.maintenanceMode) {
        return res.status(503).json({
          success: false,
          message: sw.maintenanceMessage || 'Software under maintenance'
        });
      }

      // ── Abuse Prevention: Check if trial was already redeemed for this HWID
      const existingTrial = await getTrial(hwid);
      if (existingTrial) {
        return res.status(400).json({
          success: false,
          message: 'Trial already redeemed on this device.'
        });
      }

      // ── Create new trial record
      const expiryDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
      const trialData = {
        hwid,
        softwareId,
        status: 'Trial',
        expiry: expiryDate.toISOString(),
        deviceName: sanitizeInput(device_name) || 'Unknown Device',
        deviceInfo: sanitizeInput(device_info) || req.get('User-Agent') || 'Unknown',
        userId: sanitizeInput(user_id) || '',
        createdAt: new Date().toISOString()
      };

      await saveTrial(hwid, trialData);

      // Log activity
      await logActivityBatched('TRIAL_ACTIVATED', `HWID: ${hwid}, Software: ${softwareId}`, req.ip, req.get('User-Agent'));

      // Success Response
      return res.status(200).json({
        success: true,
        message: 'Trial activated successfully. Enjoy Stark Sec!',
        status: 'Trial',
        daysRemaining: 1,
        expiry: '24 Hours'
      });

    } catch (error) {
      console.error('Trial endpoint error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
);

module.exports = router;
