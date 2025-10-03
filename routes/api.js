// routes/api.js - COMPLETE ENHANCED API with ALL Webhooks
const express = require('express');
const router = express.Router();

const {
  getLicenseCached,
  saveLicenseAndInvalidateCache,
  updateHwidIndex,
  getLicenseByHwid,
  wasRecentlyValidated,
  markAsRecentlyValidated,
  getSettingsCached,
  getBanlistCached,
  logActivityBatched
} = require('../utils/optimization');

const { validateHWID, sanitizeInput } = require('../utils/validators');
const { calculateDaysUntilExpiry, isLicenseExpired } = require('../utils/helpers');
const { sendWebhook } = require('../utils/webhook');
const { getDb } = require('../config/firebase');
const cache = require('../utils/cache');

// ============================================================================
// POST /api/register - Register Device
// ============================================================================

router.post('/register', async (req, res) => {
  const { license, hwid, device_info, device_name } = req.body;
  
  try {
    if (!license || !hwid) {
      return res.status(400).json({
        success: false,
        code: 'MISSING_PARAMETERS',
        message: 'License key and HWID required',
        data: null
      });
    }
    
    if (!validateHWID(hwid)) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_HWID',
        message: 'Invalid HWID format',
        data: null
      });
    }
    
    await logActivityBatched('API_REGISTER', `License: ${license}`, req.ip, req.get('User-Agent'));
    
    const settings = await getSettingsCached();
    if (!settings.apiEnabled) {
      return res.status(503).json({
        success: false,
        code: 'API_DISABLED',
        message: 'API currently disabled',
        data: null
      });
    }
    
    const banlist = await getBanlistCached();
    if (banlist.includes(hwid)) {
      // Webhook: HWID Ban Attempt
      await sendWebhook('hwid_ban_attempt', {
        license,
        hwid: hwid.substring(0, 20) + '...',
        ip: req.ip
      });
      
      return res.status(403).json({
        success: false,
        code: 'BANNED',
        message: 'Hardware ID is banned',
        data: { hwid }
      });
    }
    
    const existingLicense = await getLicenseByHwid(hwid);
    
    if (existingLicense && existingLicense !== license) {
      await logActivityBatched('HWID_CONFLICT', 
        `HWID tried ${license}, registered to ${existingLicense}`, 
        req.ip, req.get('User-Agent'), null, 'high');
      
      // Webhook: HWID Conflict
      await sendWebhook('hwid_conflict', {
        attemptedLicense: license,
        registeredTo: existingLicense,
        hwid: hwid.substring(0, 20) + '...',
        ip: req.ip
      });
      
      return res.status(409).json({
        success: false,
        code: 'HWID_ALREADY_REGISTERED',
        message: 'Device registered to another license',
        data: { hwid }
      });
    }
    
    const lic = await getLicenseCached(license);
    
    if (!lic) {
      // Webhook: Invalid License Attempt
      await sendWebhook('invalid_license_attempt', {
        license,
        hwid: hwid.substring(0, 20) + '...',
        ip: req.ip
      });
      
      return res.status(404).json({
        success: false,
        code: 'INVALID_LICENSE',
        message: 'License not found',
        data: { license }
      });
    }
    
    // Check if license is banned
    if (lic.banned) {
      const banMessage = lic.banUntil ? 
        `License banned until ${new Date(lic.banUntil).toLocaleDateString()}` : 
        'License permanently banned';
      
      // Webhook: Banned License Attempt
      await sendWebhook('license_ban_attempt', {
        license,
        banReason: lic.banReason || 'No reason',
        banUntil: lic.banUntil || 'Permanent',
        hwid: hwid.substring(0, 20) + '...',
        ip: req.ip
      });
      
      return res.status(403).json({
        success: false,
        code: 'LICENSE_BANNED',
        message: banMessage,
        data: { 
          license,
          banReason: lic.banReason,
          bannedAt: lic.bannedAt,
          banUntil: lic.banUntil
        }
      });
    }
    
    if (isLicenseExpired(lic)) {
      // Webhook: Expired License Attempt
      await sendWebhook('expired_license_attempt', {
        license,
        expiry: lic.expiry,
        hwid: hwid.substring(0, 20) + '...',
        ip: req.ip
      });
      
      return res.status(410).json({
        success: false,
        code: 'EXPIRED',
        message: 'License expired',
        data: { license, expiry: lic.expiry }
      });
    }
    
    if (lic.hwid && lic.hwid !== hwid) {
      // Webhook: Activation Conflict
      await sendWebhook('activation_conflict', {
        license,
        registeredDevice: lic.deviceName || 'Unknown',
        registeredHwid: lic.hwid.substring(0, 20) + '...',
        attemptingHwid: hwid.substring(0, 20) + '...',
        ip: req.ip
      });
      
      return res.status(409).json({
        success: false,
        code: 'LICENSE_ALREADY_ACTIVATED',
        message: 'License registered to another device',
        data: { license }
      });
    }
    
    if (lic.hwid === hwid) {
      markAsRecentlyValidated(license, hwid);
      
      return res.status(200).json({
        success: true,
        code: 'ALREADY_REGISTERED',
        message: 'Device already registered',
        data: {
          license,
          hwid,
          deviceName: lic.deviceName,
          registeredAt: lic.activatedAt,
          expiry: lic.expiry
        }
      });
    }
    
    const updatedLic = {
      ...lic,
      hwid,
      deviceName: sanitizeInput(device_name) || 'Unknown Device',
      deviceInfo: sanitizeInput(device_info) || req.get('User-Agent') || 'Unknown',
      activatedAt: new Date().toISOString(),
      lastValidated: new Date().toISOString(),
      registrationIP: req.ip,
      history: [...(lic.history || []), {
        action: 'DEVICE_REGISTERED',
        date: new Date().toISOString(),
        details: `Device: ${sanitizeInput(device_name) || 'Unknown'}`,
        ip: req.ip
      }]
    };
    
    await Promise.all([
      saveLicenseAndInvalidateCache(license, updatedLic),
      updateHwidIndex(hwid, license, 'add')
    ]);
    
    markAsRecentlyValidated(license, hwid);
    
    // Webhook: Device Successfully Registered
    await sendWebhook('device_registered', { 
      license, 
      deviceName: updatedLic.deviceName,
      deviceInfo: updatedLic.deviceInfo,
      expiry: updatedLic.expiry || 'Never',
      ip: req.ip
    });
    
    return res.status(201).json({
      success: true,
      code: 'DEVICE_REGISTERED',
      message: 'Device registered successfully',
      data: {
        license,
        hwid,
        deviceName: updatedLic.deviceName,
        registeredAt: updatedLic.activatedAt,
        expiry: updatedLic.expiry
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    
    // Webhook: Server Error
    await sendWebhook('api_error', {
      endpoint: '/api/register',
      error: error.message,
      license: req.body.license || 'N/A'
    });
    
    return res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'Internal server error',
      data: null
    });
  }
});

// ============================================================================
// GET /api/validate - Validate License
// ============================================================================

router.get('/validate', async (req, res) => {
  const { license, hwid } = req.query;
  
  try {
    if (!license || !hwid) {
      return res.status(400).json({
        success: false,
        code: 'MISSING_PARAMETERS',
        message: 'License and HWID required',
        data: null
      });
    }
    
    if (!validateHWID(hwid)) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_HWID',
        message: 'Invalid HWID format',
        data: null
      });
    }
    
    if (wasRecentlyValidated(license, hwid)) {
      return res.json({
        success: true,
        code: 'VALID_CACHED',
        message: 'License valid (cached)',
        data: {
          license,
          hwid,
          cached: true,
          validatedAt: new Date().toISOString()
        }
      });
    }
    
    await logActivityBatched('API_VALIDATE', `License: ${license}`, req.ip, req.get('User-Agent'));
    
    const settings = await getSettingsCached();
    if (!settings.apiEnabled) {
      return res.status(503).json({
        success: false,
        code: 'API_DISABLED',
        message: 'API disabled',
        data: null
      });
    }
    
    const banlist = await getBanlistCached();
    if (banlist.includes(hwid)) {
      // Webhook: Banned HWID Validation Attempt
      await sendWebhook('banned_hwid_validation', {
        license,
        hwid: hwid.substring(0, 20) + '...',
        ip: req.ip
      });
      
      return res.status(403).json({
        success: false,
        code: 'BANNED',
        message: 'HWID banned',
        data: { hwid }
      });
    }
    
    const lic = await getLicenseCached(license);
    
    if (!lic) {
      return res.status(404).json({
        success: false,
        code: 'INVALID_LICENSE',
        message: 'License not found',
        data: { license }
      });
    }
    
    // Check if license is banned
    if (lic.banned) {
      // Check if temporary ban expired
      if (lic.banUntil && new Date(lic.banUntil) < new Date()) {
        // Auto-unban
        const updatedLic = {
          ...lic,
          banned: false,
          banReason: null,
          bannedAt: null,
          bannedBy: null,
          banUntil: null,
          history: [...(lic.history || []), {
            action: 'AUTO_UNBANNED',
            date: new Date().toISOString()
          }]
        };
        await saveLicenseAndInvalidateCache(license, updatedLic);
        
        // Webhook: Auto Unban
        await sendWebhook('license_auto_unbanned', {
          license,
          previousBanReason: lic.banReason,
          bannedUntil: lic.banUntil
        });
      } else {
        // Webhook: Banned License Validation Attempt
        await sendWebhook('banned_license_validation', {
          license,
          banReason: lic.banReason || 'No reason',
          banUntil: lic.banUntil || 'Permanent',
          hwid: hwid.substring(0, 20) + '...',
          ip: req.ip
        });
        
        return res.status(403).json({
          success: false,
          code: 'LICENSE_BANNED',
          message: 'License is banned',
          data: { 
            license,
            banReason: lic.banReason,
            banUntil: lic.banUntil
          }
        });
      }
    }
    
    if (isLicenseExpired(lic)) {
      return res.status(410).json({
        success: false,
        code: 'EXPIRED',
        message: 'License expired',
        data: { license, expiry: lic.expiry }
      });
    }
    
    if (lic.hwid === hwid) {
      markAsRecentlyValidated(license, hwid);
      
      // Webhook: Successful Validation (only 0.5% chance to avoid spam)
      if (Math.random() < 0.005) {
        await sendWebhook('license_validated', {
          license,
          deviceName: lic.deviceName,
          daysRemaining: calculateDaysUntilExpiry(lic.expiry) || 'Unlimited',
          note: 'Sample validation (0.5% reported)'
        });
      }
      
      return res.json({
        success: true,
        code: 'VALID',
        message: 'License valid',
        data: {
          license,
          hwid,
          deviceName: lic.deviceName,
          expiry: lic.expiry,
          lastValidated: new Date().toISOString(),
          daysRemaining: calculateDaysUntilExpiry(lic.expiry),
          cached: false
        }
      });
    }
    
    // Webhook: HWID Mismatch
    await sendWebhook('hwid_mismatch', {
      license,
      registeredHwid: lic.hwid.substring(0, 20) + '...',
      attemptingHwid: hwid.substring(0, 20) + '...',
      registeredDevice: lic.deviceName || 'Unknown',
      ip: req.ip
    });
    
    return res.status(409).json({
      success: false,
      code: 'HWID_MISMATCH',
      message: 'Device not registered to this license',
      data: { license, hwid }
    });
    
  } catch (error) {
    console.error('Validation error:', error);
    return res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'Internal error',
      data: null
    });
  }
});

// ============================================================================
// GET /api/license-info - Get License Information
// ============================================================================

router.get('/license-info', async (req, res) => {
  const { license } = req.query;
  
  try {
    if (!license) {
      return res.status(400).json({
        success: false,
        code: 'MISSING_PARAMETERS',
        message: 'License key required',
        data: null
      });
    }
    
    const lic = await getLicenseCached(license);
    
    if (!lic) {
      return res.status(404).json({
        success: false,
        code: 'INVALID_LICENSE',
        message: 'License not found',
        data: { license }
      });
    }
    
    return res.json({
      success: true,
      code: 'LICENSE_INFO',
      message: 'License information retrieved',
      data: {
        license,
        isActivated: !!lic.hwid,
        isBanned: !!lic.banned,
        expiry: lic.expiry,
        isExpired: isLicenseExpired(lic),
        createdAt: lic.createdAt,
        daysRemaining: calculateDaysUntilExpiry(lic.expiry)
      }
    });
    
  } catch (error) {
    console.error('License info error:', error);
    return res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'Internal error',
      data: null
    });
  }
});

// ============================================================================
// POST /api/request-hwid-reset - Request HWID Reset (Admin Approval Required)
// ============================================================================

router.post('/request-hwid-reset', async (req, res) => {
  const { license, hwid, reason } = req.body;
  
  try {
    if (!license || !hwid) {
      return res.status(400).json({
        success: false,
        code: 'MISSING_PARAMETERS',
        message: 'License key and HWID required',
        data: null
      });
    }
    
    if (!validateHWID(hwid)) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_HWID',
        message: 'Invalid HWID format',
        data: null
      });
    }
    
    const lic = await getLicenseCached(license);
    
    if (!lic) {
      return res.status(404).json({
        success: false,
        code: 'INVALID_LICENSE',
        message: 'License not found',
        data: { license }
      });
    }
    
    if (lic.hwid !== hwid) {
      return res.status(403).json({
        success: false,
        code: 'HWID_MISMATCH',
        message: 'HWID does not match license',
        data: null
      });
    }
    
    // Check for existing pending request
    const db = getDb();
    const existingRequest = await db.collection('reset_requests')
      .where('license', '==', license)
      .where('status', '==', 'pending')
      .get();
    
    if (!existingRequest.empty) {
      return res.status(409).json({
        success: false,
        code: 'REQUEST_ALREADY_EXISTS',
        message: 'A pending reset request already exists for this license',
        data: {
          requestId: existingRequest.docs[0].id,
          submittedAt: existingRequest.docs[0].data().requestedAt
        }
      });
    }
    
    // Create reset request
    const requestData = {
      license,
      hwid: hwid.substring(0, 40) + '...',
      fullHwid: hwid,
      reason: sanitizeInput(reason) || 'No reason provided',
      requestedAt: new Date().toISOString(),
      status: 'pending',
      ip: req.ip,
      userAgent: req.get('User-Agent')
    };
    
    const requestRef = await db.collection('reset_requests').add(requestData);
    
    await logActivityBatched('RESET_REQUEST_CREATED', `License: ${license}`, req.ip, req.get('User-Agent'), license, 'medium');
    
    // Webhook: Reset Request Submitted
    await sendWebhook('reset_request', { 
      license, 
      reason: requestData.reason,
      requestId: requestRef.id,
      deviceName: lic.deviceName || 'Unknown',
      ip: req.ip
    });
    
    return res.json({
      success: true,
      code: 'REQUEST_SUBMITTED',
      message: 'HWID reset request submitted successfully. Waiting for admin approval.',
      data: {
        requestId: requestRef.id,
        license,
        submittedAt: requestData.requestedAt,
        status: 'pending'
      }
    });
    
  } catch (error) {
    console.error('Reset request error:', error);
    return res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'Internal error',
      data: null
    });
  }
});

// ============================================================================
// GET /api/check-request-status - Check Reset Request Status
// ============================================================================

router.get('/check-request-status', async (req, res) => {
  const { license } = req.query;
  
  try {
    if (!license) {
      return res.status(400).json({
        success: false,
        code: 'MISSING_PARAMETERS',
        message: 'License key required',
        data: null
      });
    }
    
    const db = getDb();
    const requestSnapshot = await db.collection('reset_requests')
      .where('license', '==', license)
      .orderBy('requestedAt', 'desc')
      .limit(1)
      .get();
    
    if (requestSnapshot.empty) {
      return res.json({
        success: true,
        code: 'NO_REQUEST',
        message: 'No reset requests found for this license',
        data: null
      });
    }
    
    const requestData = requestSnapshot.docs[0].data();
    
    return res.json({
      success: true,
      code: 'REQUEST_FOUND',
      message: 'Reset request found',
      data: {
        requestId: requestSnapshot.docs[0].id,
        license: requestData.license,
        status: requestData.status,
        requestedAt: requestData.requestedAt,
        processedAt: requestData.processedAt || null,
        processedBy: requestData.processedBy || null,
        adminNote: requestData.adminNote || null
      }
    });
    
  } catch (error) {
    console.error('Check request error:', error);
    return res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'Internal error',
      data: null
    });
  }
});

// ============================================================================
// GET /api/check-ban - Check if HWID is Banned
// ============================================================================

router.get('/check-ban', async (req, res) => {
  const { hwid } = req.query;
  
  try {
    if (!hwid) {
      return res.status(400).json({
        success: false,
        code: 'MISSING_PARAMETERS',
        message: 'HWID required',
        data: null
      });
    }
    
    if (!validateHWID(hwid)) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_HWID',
        message: 'Invalid HWID format',
        data: null
      });
    }
    
    const banlist = await getBanlistCached();
    const isBanned = banlist.includes(hwid);
    
    return res.json({
      success: true,
      code: isBanned ? 'BANNED' : 'NOT_BANNED',
      message: isBanned ? 'HWID is banned' : 'HWID is not banned',
      data: {
        hwid: hwid.substring(0, 20) + '...',
        isBanned
      }
    });
    
  } catch (error) {
    console.error('Ban check error:', error);
    return res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'Internal error',
      data: null
    });
  }
});

// ============================================================================
// GET /api/health - Health Check
// ============================================================================

router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    version: require('../config/constants').CONFIG.API_VERSION,
    timestamp: new Date().toISOString(),
    cache: {
      licenses: cache.licenseCache.size,
      validations: cache.recentValidations.size,
      pendingLogs: cache.activityLogBatch.length
    },
    uptime: process.uptime()
  });
});

module.exports = router;
