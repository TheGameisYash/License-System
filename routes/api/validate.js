// routes/api/validate.js - With software_id, auth modes, binding modes & announcements
const express = require('express');
const router = express.Router();
const crypto = require('crypto');

const {
  getLicenseCached,
  saveLicenseAndInvalidateCache,
  wasRecentlyValidated,
  markAsRecentlyValidated,
  getSettingsCached,
  getBanlistCached,
  getSoftwareCached,
  getAnnouncementsCached,
  logActivityBatched
} = require('../../utils/optimization');

const { validateHWID } = require('../../utils/validators');
const { calculateDaysUntilExpiry, isLicenseExpired } = require('../../utils/helpers');
const { sendWebhook } = require('../../utils/webhook');
const { getSoftwareUser } = require('../../utils/database');

function hashPassword(password) {
  return crypto.createHash('sha256').update(password + 'license_salt_2024').digest('hex');
}

// GET /api/validate
router.get('/', async (req, res) => {
  const { license, hwid, software_id, user_id, username, password } = req.query;
  const startTime = Date.now();

  try {
    if (!license) {
      return res.status(400).json({ success: false, code: 'MISSING_PARAMETERS', message: 'License required', data: null });
    }

    // ── Load software config (default to 'default' software)
    const softwareId = software_id || 'default';
    const software = await getSoftwareCached(softwareId);

    // If no software found (not 'default'), return error
    if (software_id && !software) {
      return res.status(404).json({ success: false, code: 'INVALID_SOFTWARE', message: 'Software not found', data: { software_id } });
    }

    const sw = software || { apiEnabled: true, maintenanceMode: false, bindingMode: 'hwid', authMode: 'license_only', versionCheck: false };

    // ── API enabled check
    if (!sw.apiEnabled) {
      return res.status(503).json({ success: false, code: 'API_DISABLED', message: 'API is currently disabled for this software', data: null });
    }

    // ── Maintenance mode check
    if (sw.maintenanceMode) {
      return res.status(503).json({ success: false, code: 'MAINTENANCE_MODE', message: sw.maintenanceMessage || 'Software is under maintenance', data: null });
    }

    // ── Validate HWID if binding requires it
    const needsHwid = ['hwid', 'hwid_and_user_id'].includes(sw.bindingMode);
    if (needsHwid && !hwid) {
      return res.status(400).json({ success: false, code: 'MISSING_HWID', message: 'HWID required for this software', data: null });
    }
    if (needsHwid && hwid && !validateHWID(hwid)) {
      return res.status(400).json({ success: false, code: 'INVALID_HWID', message: 'Invalid HWID format', data: null });
    }

    // ── Credentials auth mode check
    if (sw.authMode === 'license_credentials') {
      if (!username || !password) {
        return res.status(401).json({ success: false, code: 'CREDENTIALS_REQUIRED', message: 'Username and password required for this software', data: null });
      }
      const user = await getSoftwareUser(softwareId, username);
      if (!user) {
        return res.status(401).json({ success: false, code: 'INVALID_CREDENTIALS', message: 'Invalid username or password', data: null });
      }
      if (user.status === 'banned') {
        return res.status(403).json({ success: false, code: 'USER_BANNED', message: 'Your account has been banned', data: null });
      }
      if (user.passwordHash !== hashPassword(password)) {
        return res.status(401).json({ success: false, code: 'INVALID_CREDENTIALS', message: 'Invalid username or password', data: null });
      }
      // In credentials mode, also verify license matches the user's linked license
      if (user.licenseKey && user.licenseKey !== license) {
        return res.status(403).json({ success: false, code: 'LICENSE_USER_MISMATCH', message: 'License does not belong to this user account', data: null });
      }
    }

    // ── Recent validation cache (bypasses DB reads)
    const cacheKey = needsHwid ? `${license}:${hwid}` : license;
    if (needsHwid && hwid && wasRecentlyValidated(license, hwid)) {
      const announcements = await getAnnouncementsCached(softwareId);
      return res.json({
        success: true, code: 'VALID_CACHED', message: 'License valid (cached)',
        data: { license, hwid: hwid.substring(0, 20) + '...', cached: true, responseTime: `${Date.now() - startTime}ms` },
        announcements,
        software: sw.versionCheck ? { name: sw.name, latestVersion: sw.latestVersion, downloadUrl: sw.downloadUrl } : { name: sw.name }
      });
    }

    await logActivityBatched('API_VALIDATE', `License: ${license}, Software: ${softwareId}`, req.ip, req.get('User-Agent'));

    // ── Global system check (fallback)
    const settings = await getSettingsCached();
    if (!settings.apiEnabled && !sw.apiEnabled) {
      return res.status(503).json({ success: false, code: 'API_DISABLED', message: 'System API is disabled', data: null });
    }

    // ── HWID ban check
    if (needsHwid && hwid) {
      const banlist = await getBanlistCached();
      if (banlist.includes(hwid)) {
        await sendWebhook('banned_hwid_validation', { license, hwid: hwid.substring(0, 20) + '...', ip: req.ip }, sw?.webhookUrl);
        return res.status(403).json({ success: false, code: 'BANNED_HWID', message: 'Hardware ID is banned', data: { hwid: hwid.substring(0, 20) + '...' } });
      }
    }

    // ── License lookup
    const lic = await getLicenseCached(license);
    if (!lic) {
      return res.status(404).json({ success: false, code: 'INVALID_LICENSE', message: 'License not found', data: { license } });
    }

    // ── Software match check (only if software_id supplied)
    if (software_id && lic.softwareId && lic.softwareId !== softwareId) {
      return res.status(403).json({ success: false, code: 'SOFTWARE_MISMATCH', message: 'License does not belong to this software', data: { license } });
    }

    // ── Ban status
    if (lic.banned) {
      if (lic.banUntil && new Date(lic.banUntil) < new Date()) {
        const updatedLic = { ...lic, banned: false, banReason: null, bannedAt: null, bannedBy: null, banUntil: null, history: [...(lic.history || []), { action: 'AUTO_UNBANNED', date: new Date().toISOString() }] };
        await saveLicenseAndInvalidateCache(license, updatedLic);
        await sendWebhook('license_auto_unbanned', { license, previousBanReason: lic.banReason }, sw?.webhookUrl);
      } else {
        await sendWebhook('banned_license_validation', { license, banReason: lic.banReason || 'No reason', ip: req.ip }, sw?.webhookUrl);
        return res.status(403).json({ success: false, code: 'LICENSE_BANNED', message: 'License is banned', data: { license, banReason: lic.banReason || 'Contact support', banUntil: lic.banUntil, isTempBan: !!lic.banUntil } });
      }
    }

    // ── Expiry check
    if (isLicenseExpired(lic)) {
      return res.status(410).json({ success: false, code: 'LICENSE_EXPIRED', message: 'License has expired', data: { license, expiry: lic.expiry } });
    }

    // ── Binding mode enforcement
    const bindingMode = sw.bindingMode || 'hwid';

    if (bindingMode === 'hwid' || bindingMode === 'hwid_and_user_id') {
      if (!lic.hwid) {
        return res.status(409).json({ success: false, code: 'NOT_REGISTERED', message: 'License not registered to any device. Please register first.', data: { license } });
      }
      if (lic.hwid !== hwid) {
        await sendWebhook('hwid_mismatch', { license, registeredDevice: lic.deviceName || 'Unknown', ip: req.ip }, sw?.webhookUrl);
        await logActivityBatched('HWID_MISMATCH', `License: ${license}`, req.ip, req.get('User-Agent'), license, 'high');
        return res.status(409).json({ success: false, code: 'HWID_MISMATCH', message: 'Device does not match registered hardware ID', data: { license, registeredDevice: lic.deviceName || 'Unknown Device' } });
      }
    }

    if (bindingMode === 'user_id' || bindingMode === 'hwid_and_user_id') {
      const expectedUserId = user_id || username;
      if (!expectedUserId) {
        return res.status(400).json({ success: false, code: 'MISSING_USER_ID', message: 'User ID required for this software', data: null });
      }
      if (lic.userId && lic.userId !== expectedUserId) {
        return res.status(403).json({ success: false, code: 'USER_ID_MISMATCH', message: 'License does not belong to this user', data: { license } });
      }
    }

    // ── Success — update counters (batch-friendly: only write every 10 validations)
    const updatedLic = { ...lic, lastValidated: new Date().toISOString(), validationCount: (lic.validationCount || 0) + 1 };
    if (updatedLic.validationCount % 10 === 0) {
      await saveLicenseAndInvalidateCache(license, updatedLic);
    }
    if (needsHwid && hwid) markAsRecentlyValidated(license, hwid);

    // Rare webhook sampling (0.5%)
    if (Math.random() < 0.005) {
      await sendWebhook('license_validated', { license, deviceName: lic.deviceName, validationCount: updatedLic.validationCount, software: sw.name }, sw?.webhookUrl);
    }

    // ── Fetch announcements for this software
    const announcements = await getAnnouncementsCached(softwareId);
    const responseTime = Date.now() - startTime;

    return res.json({
      success: true, code: 'VALID', message: 'License is valid',
      data: {
        license,
        hwid: hwid ? hwid.substring(0, 20) + '...' : undefined,
        deviceName: lic.deviceName,
        expiry: lic.expiry,
        expiryDate: lic.expiry ? new Date(lic.expiry).toLocaleDateString() : 'Never',
        daysRemaining: calculateDaysUntilExpiry(lic.expiry) !== null ? calculateDaysUntilExpiry(lic.expiry) : 'Unlimited',
        lastValidated: new Date().toISOString(),
        validationCount: updatedLic.validationCount,
        cached: false,
        responseTime: `${responseTime}ms`
      },
      announcements,
      software: sw.versionCheck
        ? { name: sw.name, latestVersion: sw.latestVersion, downloadUrl: sw.downloadUrl }
        : { name: sw.name }
    });

  } catch (error) {
    console.error('Validation error:', error);
    await sendWebhook('api_error', { endpoint: '/api/validate', error: error.message, license: license || 'N/A', ip: req.ip });
    return res.status(500).json({ success: false, code: 'SERVER_ERROR', message: 'Internal server error', data: { requestId: Date.now().toString(36) } });
  }
});

module.exports = router;
