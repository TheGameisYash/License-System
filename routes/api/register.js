// routes/api/register.js - Device Registration with Edge Case Handling
const express = require('express');
const router = express.Router();

const {
  getLicenseCached,
  saveLicenseAndInvalidateCache,
  updateHwidIndex,
  getLicenseByHwid,
  markAsRecentlyValidated,
  logActivityBatched
} = require('../../utils/optimization');

const { sanitizeInput } = require('../../utils/validators');
const { isLicenseExpired } = require('../../utils/helpers');
const { sendWebhook } = require('../../utils/webhook');
const {
  checkAPIEnabled,
  validateHWIDMiddleware,
  validateLicenseKey,
  checkHWIDBanned,
  simpleRateLimit
} = require('../../middleware/apiValidation');

// POST /api/register - Register Device
router.post('/', 
  simpleRateLimit(5, 60000), // Max 5 registrations per minute per IP
  validateLicenseKey,
  validateHWIDMiddleware,
  checkAPIEnabled,
  checkHWIDBanned,
  async (req, res) => {
    const { license, hwid, device_info, device_name } = req.body;
    
    try {
      await logActivityBatched('API_REGISTER', `License: ${license}`, req.ip, req.get('User-Agent'));
      
      // EDGE CASE 1: Check if HWID is already registered to a DIFFERENT license
      const existingLicense = await getLicenseByHwid(hwid);
      
      if (existingLicense && existingLicense !== license) {
        await logActivityBatched('HWID_CONFLICT', 
          `HWID tried ${license}, registered to ${existingLicense}`, 
          req.ip, req.get('User-Agent'), null, 'high');
        
        await sendWebhook('hwid_conflict', {
          attemptedLicense: license,
          registeredTo: existingLicense,
          hwid: hwid.substring(0, 20) + '...',
          ip: req.ip
        });
        
        return res.status(409).json({
          success: false,
          code: 'HWID_ALREADY_REGISTERED',
          message: 'This device is already registered to another license',
          data: { 
            hwid: hwid.substring(0, 20) + '...',
            registeredTo: existingLicense
          }
        });
      }
      
      // Get license data
      const lic = await getLicenseCached(license);
      
      // EDGE CASE 2: License doesn't exist
      if (!lic) {
        await sendWebhook('invalid_license_attempt', {
          license,
          hwid: hwid.substring(0, 20) + '...',
          ip: req.ip
        });
        
        return res.status(404).json({
          success: false,
          code: 'INVALID_LICENSE',
          message: 'License key not found in system',
          data: { license }
        });
      }
      
      // EDGE CASE 3: License is banned
      if (lic.banned) {
        // Check if temporary ban expired
        if (lic.banUntil && new Date(lic.banUntil) < new Date()) {
          // Auto-unban expired bans
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
              reason: 'Temporary ban expired'
            }]
          };
          await saveLicenseAndInvalidateCache(license, updatedLic);
          
          // Continue with registration after auto-unban
        } else {
          const banMessage = lic.banUntil ? 
            `License banned until ${new Date(lic.banUntil).toLocaleString()}` : 
            'License permanently banned';
          
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
      }
      
      // EDGE CASE 4: License is expired
      if (isLicenseExpired(lic)) {
        await sendWebhook('expired_license_attempt', {
          license,
          expiry: lic.expiry,
          hwid: hwid.substring(0, 20) + '...',
          ip: req.ip
        });
        
        return res.status(410).json({
          success: false,
          code: 'EXPIRED',
          message: 'License expired on ' + new Date(lic.expiry).toLocaleDateString(),
          data: { license, expiry: lic.expiry }
        });
      }
      
      // EDGE CASE 5: License already registered to a DIFFERENT HWID
      if (lic.hwid && lic.hwid !== hwid) {
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
          message: 'License is already registered to another device',
          data: { 
            license,
            registeredDevice: lic.deviceName || 'Unknown Device',
            registeredAt: lic.activatedAt
          }
        });
      }
      
      // EDGE CASE 6: Already registered to this HWID (re-registration attempt)
      if (lic.hwid === hwid) {
        markAsRecentlyValidated(license, hwid);
        
        // Update last validated time
        const updatedLic = {
          ...lic,
          lastValidated: new Date().toISOString()
        };
        await saveLicenseAndInvalidateCache(license, updatedLic);
        
        return res.status(200).json({
          success: true,
          code: 'ALREADY_REGISTERED',
          message: 'Device already registered. Re-validation successful.',
          data: {
            license,
            hwid: hwid.substring(0, 20) + '...',
            deviceName: lic.deviceName,
            registeredAt: lic.activatedAt,
            expiry: lic.expiry,
            lastValidated: updatedLic.lastValidated
          }
        });
      }
      
      // SUCCESS: Register new device
      const sanitizedDeviceName = sanitizeInput(device_name) || 'Unknown Device';
      const sanitizedDeviceInfo = sanitizeInput(device_info) || req.get('User-Agent') || 'Unknown';
      
      const updatedLic = {
        ...lic,
        hwid,
        deviceName: sanitizedDeviceName,
        deviceInfo: sanitizedDeviceInfo,
        activatedAt: new Date().toISOString(),
        lastValidated: new Date().toISOString(),
        registrationIP: req.ip,
        history: [...(lic.history || []), {
          action: 'DEVICE_REGISTERED',
          date: new Date().toISOString(),
          details: `Device: ${sanitizedDeviceName}`,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        }]
      };
      
      await Promise.all([
        saveLicenseAndInvalidateCache(license, updatedLic),
        updateHwidIndex(hwid, license, 'add')
      ]);
      
      markAsRecentlyValidated(license, hwid);
      
      await sendWebhook('device_registered', { 
        license, 
        deviceName: sanitizedDeviceName,
        deviceInfo: sanitizedDeviceInfo,
        expiry: updatedLic.expiry || 'Never',
        ip: req.ip
      });
      
      return res.status(201).json({
        success: true,
        code: 'DEVICE_REGISTERED',
        message: 'Device registered successfully',
        data: {
          license,
          hwid: hwid.substring(0, 20) + '...',
          deviceName: sanitizedDeviceName,
          registeredAt: updatedLic.activatedAt,
          expiry: updatedLic.expiry
        }
      });
      
    } catch (error) {
      console.error('Registration error:', error);
      
      await sendWebhook('api_error', {
        endpoint: '/api/register',
        error: error.message,
        license: license || 'N/A',
        ip: req.ip
      });
      
      return res.status(500).json({
        success: false,
        code: 'SERVER_ERROR',
        message: 'Internal server error. Please try again later.',
        data: null
      });
    }
  }
);

module.exports = router;
