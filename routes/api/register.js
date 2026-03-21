// routes/api/register.js - With software_id, auth modes, binding modes
const express = require('express');
const router = express.Router();
const crypto = require('crypto');

const {
  getLicenseCached,
  saveLicenseAndInvalidateCache,
  updateHwidIndex,
  getLicenseByHwid,
  markAsRecentlyValidated,
  getSoftwareCached,
  getAnnouncementsCached,
  logActivityBatched
} = require('../../utils/optimization');

const { sanitizeInput } = require('../../utils/validators');
const { isLicenseExpired } = require('../../utils/helpers');
const { sendWebhook } = require('../../utils/webhook');
const { getSoftwareUser } = require('../../utils/database');
const { checkAPIEnabled, validateHWIDMiddleware, validateLicenseKey, checkHWIDBanned, simpleRateLimit } = require('../../middleware/apiValidation');

function hashPassword(p) {
  return crypto.createHash('sha256').update(p + 'license_salt_2024').digest('hex');
}

// POST /api/register
router.post('/',
  simpleRateLimit(5, 60000),
  validateLicenseKey,
  checkAPIEnabled,
  async (req, res) => {
    const { license, hwid, device_info, device_name, software_id, user_id, username, password } = req.body;
    const softwareId = software_id || 'default';

    try {
      // ── Load software config
      const sw = await getSoftwareCached(softwareId) || {
        apiEnabled: true, bindingMode: 'hwid', authMode: 'license_only',
        maxDevices: 1, versionCheck: false, name: 'Default'
      };

      if (!sw.apiEnabled) {
        return res.status(503).json({ success: false, code: 'API_DISABLED', message: 'API is disabled for this software', data: null });
      }
      if (sw.maintenanceMode) {
        return res.status(503).json({ success: false, code: 'MAINTENANCE_MODE', message: sw.maintenanceMessage || 'Software under maintenance', data: null });
      }

      // ── Credentials auth mode
      if (sw.authMode === 'license_credentials') {
        if (!username || !password) {
          return res.status(401).json({ success: false, code: 'CREDENTIALS_REQUIRED', message: 'Username and password required', data: null });
        }
        const user = await getSoftwareUser(softwareId, username);
        if (!user || user.passwordHash !== hashPassword(password)) {
          return res.status(401).json({ success: false, code: 'INVALID_CREDENTIALS', message: 'Invalid credentials', data: null });
        }
        if (user.status === 'banned') {
          return res.status(403).json({ success: false, code: 'USER_BANNED', message: 'Account is banned', data: null });
        }
        if (user.licenseKey && user.licenseKey !== license) {
          return res.status(403).json({ success: false, code: 'LICENSE_USER_MISMATCH', message: 'License does not belong to this user', data: null });
        }
      }

      await logActivityBatched('API_REGISTER', `License: ${license}, Software: ${softwareId}`, req.ip, req.get('User-Agent'));

      // ── HWID conflict check (only if binding includes HWID)
      const needsHwid = ['hwid', 'hwid_and_user_id'].includes(sw.bindingMode);
      if (needsHwid && hwid) {
        const existingLicense = await getLicenseByHwid(hwid);
        if (existingLicense && existingLicense !== license) {
          await sendWebhook('hwid_conflict', { attemptedLicense: license, registeredTo: existingLicense, hwid: hwid.substring(0, 20) + '...', ip: req.ip }, sw?.webhookUrl);
          return res.status(409).json({ success: false, code: 'HWID_ALREADY_REGISTERED', message: 'This device is already registered to another license', data: { hwid: hwid.substring(0, 20) + '...' } });
        }
        // HWID ban check
        const { getBanlistCached } = require('../../utils/optimization');
        const banlist = await getBanlistCached();
        if (banlist.includes(hwid)) {
          return res.status(403).json({ success: false, code: 'BANNED_HWID', message: 'Hardware ID is banned', data: null });
        }
      }

      // ── License lookup
      const lic = await getLicenseCached(license);
      if (!lic) {
        await sendWebhook('invalid_license_attempt', { license, hwid: hwid ? hwid.substring(0, 20) + '...' : 'N/A', ip: req.ip }, sw?.webhookUrl);
        return res.status(404).json({ success: false, code: 'INVALID_LICENSE', message: 'License key not found', data: { license } });
      }

      // ── Software mismatch
      if (lic.softwareId && lic.softwareId !== softwareId && softwareId !== 'default') {
        return res.status(403).json({ success: false, code: 'SOFTWARE_MISMATCH', message: 'License belongs to a different software', data: null });
      }

      // ── Banned check
      if (lic.banned) {
        if (lic.banUntil && new Date(lic.banUntil) < new Date()) {
          await saveLicenseAndInvalidateCache(license, { ...lic, banned: false, banReason: null, bannedAt: null, bannedBy: null, banUntil: null });
        } else {
          return res.status(403).json({ success: false, code: 'LICENSE_BANNED', message: lic.banUntil ? `Banned until ${new Date(lic.banUntil).toLocaleString()}` : 'License permanently banned', data: { license } });
        }
      }

      // ── Expiry check
      if (isLicenseExpired(lic)) {
        return res.status(410).json({ success: false, code: 'EXPIRED', message: 'License expired on ' + new Date(lic.expiry).toLocaleDateString(), data: { license } });
      }

      // ── Already registered to same device (re-registration)
      const effectiveHwid = needsHwid ? hwid : null;
      if (effectiveHwid && lic.hwid === effectiveHwid) {
        markAsRecentlyValidated(license, effectiveHwid);
        const announcements = await getAnnouncementsCached(softwareId);
        return res.status(200).json({
          success: true, code: 'ALREADY_REGISTERED', message: 'Device already registered. Re-validation successful.',
          data: { license, hwid: effectiveHwid.substring(0, 20) + '...', deviceName: lic.deviceName, registeredAt: lic.activatedAt, expiry: lic.expiry },
          announcements, software: { name: sw.name }
        });
      }

      // ── Already registered to a DIFFERENT device
      if (needsHwid && effectiveHwid && lic.hwid && lic.hwid !== effectiveHwid) {
        await sendWebhook('activation_conflict', { license, registeredDevice: lic.deviceName || 'Unknown', ip: req.ip }, sw?.webhookUrl);
        return res.status(409).json({ success: false, code: 'LICENSE_ALREADY_ACTIVATED', message: 'License is already registered to another device', data: { license, registeredDevice: lic.deviceName || 'Unknown', registeredAt: lic.activatedAt } });
      }

      // ── Register / bind
      const sanitizedName = sanitizeInput(device_name) || 'Unknown Device';
      const sanitizedInfo = sanitizeInput(device_info) || req.get('User-Agent') || 'Unknown';
      const effectiveUserId = user_id || username || '';

      const updatedLic = {
        ...lic,
        hwid: effectiveHwid || lic.hwid || '',
        deviceName: sanitizedName, deviceInfo: sanitizedInfo,
        activatedAt: lic.activatedAt || new Date().toISOString(),
        lastValidated: new Date().toISOString(),
        userId: effectiveUserId || lic.userId || '',
        softwareId: lic.softwareId || softwareId,
        registrationIP: req.ip,
        history: [...(lic.history || []), { action: 'DEVICE_REGISTERED', date: new Date().toISOString(), details: `Device: ${sanitizedName}`, ip: req.ip }]
      };

      const ops = [saveLicenseAndInvalidateCache(license, updatedLic)];
      if (effectiveHwid && !lic.hwid) ops.push(updateHwidIndex(effectiveHwid, license, 'add'));
      await Promise.all(ops);

      if (effectiveHwid) markAsRecentlyValidated(license, effectiveHwid);

      await sendWebhook('device_registered', { license, deviceName: sanitizedName, expiry: updatedLic.expiry || 'Never', ip: req.ip, software: sw.name }, sw?.webhookUrl);

      const announcements = await getAnnouncementsCached(softwareId);

      return res.status(201).json({
        success: true, code: 'DEVICE_REGISTERED', message: 'Device registered successfully',
        data: { license, hwid: effectiveHwid ? effectiveHwid.substring(0, 20) + '...' : undefined, deviceName: sanitizedName, registeredAt: updatedLic.activatedAt, expiry: updatedLic.expiry },
        announcements,
        software: sw.versionCheck ? { name: sw.name, latestVersion: sw.latestVersion, downloadUrl: sw.downloadUrl } : { name: sw.name }
      });

    } catch (error) {
      console.error('Registration error:', error);
      await sendWebhook('api_error', { endpoint: '/api/register', error: error.message, license: license || 'N/A', ip: req.ip });
      return res.status(500).json({ success: false, code: 'SERVER_ERROR', message: 'Internal server error', data: null });
    }
  }
);

module.exports = router;
