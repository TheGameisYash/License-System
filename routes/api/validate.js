// routes/api/validate.js - LICENSE VALIDATION WITH ALL EDGE CASES
const express = require('express');
const router = express.Router();

const {
  getLicenseCached,
  saveLicenseAndInvalidateCache,
  wasRecentlyValidated,
  markAsRecentlyValidated,
  getSettingsCached,
  getBanlistCached,
  logActivityBatched
} = require('../../utils/optimization');

const { validateHWID } = require('../../utils/validators');
const { calculateDaysUntilExpiry, isLicenseExpired } = require('../../utils/helpers');
const { sendWebhook } = require('../../utils/webhook');

// ============================================================================
// GET /api/validate - Validate License
// ============================================================================

router.get('/', async (req, res) => {
  const { license, hwid } = req.query;
  const startTime = Date.now();
  
  try {
    // ==================== VALIDATION CHECKS ====================
    
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
    
    // ==================== CACHE CHECK ====================
    
    // Check if recently validated (reduce database load)
    if (wasRecentlyValidated(license, hwid)) {
      const responseTime = Date.now() - startTime;
      return res.json({
        success: true,
        code: 'VALID_CACHED',
        message: 'License valid (cached)',
        data: {
          license,
          hwid: hwid.substring(0, 20) + '...',
          cached: true,
          validatedAt: new Date().toISOString(),
          responseTime: `${responseTime}ms`,
          note: 'This validation was served from cache'
        }
      });
    }
    
    await logActivityBatched('API_VALIDATE', `License: ${license}`, req.ip, req.get('User-Agent'));
    
    // ==================== SYSTEM CHECKS ====================
    
    const settings = await getSettingsCached();
    if (!settings.apiEnabled) {
      return res.status(503).json({
        success: false,
        code: 'API_DISABLED',
        message: 'API is currently disabled',
        data: null
      });
    }
    
    // ==================== BAN CHECKS ====================
    
    const banlist = await getBanlistCached();
    if (banlist.includes(hwid)) {
      await sendWebhook('banned_hwid_validation', {
        license,
        hwid: hwid.substring(0, 20) + '...',
        ip: req.ip
      });
      
      return res.status(403).json({
        success: false,
        code: 'BANNED_HWID',
        message: 'Hardware ID is banned',
        data: { hwid: hwid.substring(0, 20) + '...' }
      });
    }
    
    // ==================== LICENSE CHECKS ====================
    
    const lic = await getLicenseCached(license);
    
    if (!lic) {
      return res.status(404).json({
        success: false,
        code: 'INVALID_LICENSE',
        message: 'License not found',
        data: { license }
      });
    }
    
    // ==================== BAN STATUS CHECK ====================
    
    if (lic.banned) {
      // Check if temporary ban has expired
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
            date: new Date().toISOString(),
            details: 'Temporary ban period expired'
          }]
        };
        
        await saveLicenseAndInvalidateCache(license, updatedLic);
        
        await sendWebhook('license_auto_unbanned', {
          license,
          previousBanReason: lic.banReason,
          bannedUntil: lic.banUntil
        });
        
        await logActivityBatched('LICENSE_AUTO_UNBANNED', `License: ${license}`, req.ip, req.get('User-Agent'), license, 'medium');
        
        // Continue with validation (license is now unbanned)
      } else {
        // Still banned
        await sendWebhook('banned_license_validation', {
          license,
          banReason: lic.banReason || 'No reason',
          banType: lic.banUntil ? 'Temporary' : 'Permanent',
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
            banReason: lic.banReason || 'Contact support',
            banUntil: lic.banUntil,
            isTempBan: !!lic.banUntil
          }
        });
      }
    }
    
    // ==================== EXPIRY CHECK ====================
    
    if (isLicenseExpired(lic)) {
      return res.status(410).json({
        success: false,
        code: 'LICENSE_EXPIRED',
        message: 'License has expired',
        data: { 
          license, 
          expiry: lic.expiry,
          expiredOn: new Date(lic.expiry).toLocaleDateString()
        }
      });
    }
    
    // ==================== HWID CHECK ====================
    
    // Check if license is not activated yet
    if (!lic.hwid) {
      return res.status(409).json({
        success: false,
        code: 'NOT_REGISTERED',
        message: 'License is not registered to any device. Please register first.',
        data: { 
          license,
          note: 'Use /api/register endpoint to register your device'
        }
      });
    }
    
    // Check if HWID matches
    if (lic.hwid === hwid) {
      // Update last validated timestamp
      const updatedLic = {
        ...lic,
        lastValidated: new Date().toISOString(),
        validationCount: (lic.validationCount || 0) + 1
      };
      
      // Only update if validation count is a multiple of 10 (reduce writes)
      if (updatedLic.validationCount % 10 === 0) {
        await saveLicenseAndInvalidateCache(license, updatedLic);
      }
      
      markAsRecentlyValidated(license, hwid);
      
      // Random webhook sampling (0.5% to avoid spam)
      if (Math.random() < 0.005) {
        await sendWebhook('license_validated', {
          license,
          deviceName: lic.deviceName,
          validationCount: updatedLic.validationCount,
          daysRemaining: calculateDaysUntilExpiry(lic.expiry) || 'Unlimited',
          note: 'Sample validation (0.5% reported)'
        });
      }
      
      const responseTime = Date.now() - startTime;
      const daysRemaining = calculateDaysUntilExpiry(lic.expiry);
      
      return res.json({
        success: true,
        code: 'VALID',
        message: 'License is valid',
        data: {
          license,
          hwid: hwid.substring(0, 20) + '...',
          deviceName: lic.deviceName,
          expiry: lic.expiry,
          expiryDate: lic.expiry ? new Date(lic.expiry).toLocaleDateString() : 'Never',
          lastValidated: new Date().toISOString(),
          daysRemaining: daysRemaining !== null ? daysRemaining : 'Unlimited',
          validationCount: updatedLic.validationCount,
          cached: false,
          responseTime: `${responseTime}ms`
        }
      });
    }
    
    // HWID mismatch
    await sendWebhook('hwid_mismatch', {
      license,
      registeredHwid: lic.hwid.substring(0, 20) + '...',
      attemptingHwid: hwid.substring(0, 20) + '...',
      registeredDevice: lic.deviceName || 'Unknown',
      ip: req.ip
    });
    
    await logActivityBatched('HWID_MISMATCH', 
      `License: ${license}, Expected: ${lic.hwid.substring(0, 20)}..., Got: ${hwid.substring(0, 20)}...`, 
      req.ip, req.get('User-Agent'), license, 'high');
    
    return res.status(409).json({
      success: false,
      code: 'HWID_MISMATCH',
      message: 'Device does not match registered hardware ID',
      data: { 
        license, 
        registeredDevice: lic.deviceName || 'Unknown Device',
        note: 'Request HWID reset if you changed your device'
      }
    });
    
  } catch (error) {
    console.error('Validation error:', error);
    
    await sendWebhook('api_error', {
      endpoint: '/api/validate',
      error: error.message,
      license: req.query.license || 'N/A',
      ip: req.ip
    });
    
    return res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'Internal server error',
      data: {
        requestId: Date.now().toString(36)
      }
    });
  }
});

module.exports = router;
