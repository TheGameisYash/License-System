// routes/admin.js - Full Admin Panel with Software, Announcements & Users
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { getDb } = require('../config/firebase');
const { generateDashboard, generateRequestManagementPage } = require('../views/dashboard');
const { generateSoftwarePage } = require('../views/software_page');
const { generateAnnouncementsPage } = require('../views/announcements_page');

const {
  getLicense, saveLicense, deleteLicense,
  getSettings, saveSettings,
  getBanlist, addToBanlist, removeFromBanlist,
  getSoftware, getAllSoftware, saveSoftware, deleteSoftware,
  saveAnnouncement, getAllAnnouncementsAdmin, updateAnnouncement, deleteAnnouncement,
  getSoftwareUser, getAllSoftwareUsers, saveSoftwareUser, deleteSoftwareUser
} = require('../utils/database');

const {
  saveLicenseAndInvalidateCache,
  updateHwidIndex,
  logActivityBatched,
  invalidateSoftwareCache,
  invalidateAnnouncementsCache,
  getAllSoftwareCached
} = require('../utils/optimization');

const { generateSecureLicenseKey } = require('../utils/helpers');
const { sanitizeInput } = require('../utils/validators');
const { sendWebhook } = require('../utils/webhook');
const cache = require('../utils/cache');

// ============================================================================
// AUTH MIDDLEWARE
// ============================================================================

router.use((req, res, next) => {
  if (req.session && req.session.user) return next();
  res.redirect('/auth/login');
});

// ============================================================================
// HELPERS
// ============================================================================

function hashPassword(password) {
  return crypto.createHash('sha256').update(password + 'license_salt_2024').digest('hex');
}

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

// ============================================================================
// DASHBOARD
// ============================================================================

router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const [licensesSnapshot, settings, banlist, allSoftware] = await Promise.all([
      db.collection('licenses').get(),
      getSettings(),
      getBanlist(),
      getAllSoftware()
    ]);

    const licenses = {};
    licensesSnapshot.forEach(doc => { licenses[doc.id] = doc.data(); });

    const recentLogsSnapshot = await db.collection('activity_log')
      .limit(50).get();
    const recentLogs = recentLogsSnapshot.docs
      .map(doc => doc.data())
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
      .slice(0, 15);

    const pendingRequestsSnapshot = await db.collection('reset_requests')
      .where('status', '==', 'pending').get();
    const pendingRequestsCount = pendingRequestsSnapshot.size;

    res.send(generateDashboard(licenses, settings, banlist, recentLogs, cache, pendingRequestsCount, allSoftware));
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).send('Error loading dashboard');
  }
});

// ============================================================================
// RESET REQUESTS
// ============================================================================

router.get('/reset-requests', async (req, res) => {
  try {
    const db = getDb();
    const [pendingSnapshot, processedSnapshot] = await Promise.all([
      db.collection('reset_requests').where('status', '==', 'pending').get(),
      db.collection('reset_requests').where('status', 'in', ['approved', 'denied']).get()
    ]);
    const pendingRequests = pendingSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => (b.requestedAt || '').localeCompare(a.requestedAt || ''));
    const processedRequests = processedSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => (b.requestedAt || '').localeCompare(a.requestedAt || ''))
      .slice(0, 20);
    res.send(generateRequestManagementPage(pendingRequests, processedRequests));
  } catch (error) {
    console.error('Reset requests error:', error);
    res.status(500).send('Error loading requests');
  }
});

router.post('/approve-reset-request', async (req, res) => {
  try {
    const { requestId } = req.body;
    const db = getDb();
    const requestDoc = await db.collection('reset_requests').doc(requestId).get();
    if (!requestDoc.exists) return res.send('<script>alert("Request not found!");window.location="/admin/reset-requests";</script>');
    const requestData = requestDoc.data();
    const { license, fullHwid: hwid } = requestData;
    const lic = await getLicense(license);
    if (lic && lic.hwid) {
      const updatedLic = {
        ...lic, hwid: '', deviceName: '', deviceInfo: '', activatedAt: '',
        history: [...(lic.history || []), { action: 'HWID_RESET_BY_ADMIN_APPROVAL', date: new Date().toISOString(), admin: req.session.user, requestId }]
      };
      await Promise.all([
        saveLicenseAndInvalidateCache(license, updatedLic),
        updateHwidIndex(hwid, license, 'remove'),
        db.collection('reset_requests').doc(requestId).update({ status: 'approved', processedAt: new Date().toISOString(), processedBy: req.session.user, adminNote: 'Approved - HWID reset completed' })
      ]);
      await logActivityBatched('RESET_REQUEST_APPROVED', `Request: ${requestId}, License: ${license}`, req.ip, req.get('User-Agent'));
      await sendWebhook('reset_approved', { license, requestId, approvedBy: req.session.user, deviceName: lic.deviceName || 'Unknown' });
    }
    res.redirect('/admin/reset-requests');
  } catch (error) {
    console.error('Approve error:', error);
    res.send('<script>alert("Error!");window.location="/admin/reset-requests";</script>');
  }
});

router.post('/deny-reset-request', async (req, res) => {
  try {
    const { requestId, reason } = req.body;
    const db = getDb();
    const requestDoc = await db.collection('reset_requests').doc(requestId).get();
    const requestData = requestDoc.data();
    await db.collection('reset_requests').doc(requestId).update({
      status: 'denied', processedAt: new Date().toISOString(),
      processedBy: req.session.user, adminNote: sanitizeInput(reason) || 'Denied by admin'
    });
    await logActivityBatched('RESET_REQUEST_DENIED', `Request: ${requestId}`, req.ip, req.get('User-Agent'));
    await sendWebhook('reset_denied', { license: requestData.license, requestId, deniedBy: req.session.user, reason: sanitizeInput(reason) || 'No reason provided' });
    res.redirect('/admin/reset-requests');
  } catch (error) {
    console.error('Deny error:', error);
    res.send('<script>alert("Error!");window.location="/admin/reset-requests";</script>');
  }
});

// ============================================================================
// LICENSE GENERATION
// ============================================================================

router.post('/generate-license', async (req, res) => {
  try {
    const license = req.body.license || generateSecureLicenseKey();
    const existing = await getLicense(license);
    if (existing) return res.send('<script>alert("License already exists!");window.location="/admin";</script>');
    const expiry = req.body.expiry ? new Date(req.body.expiry).toISOString() : null;
    const softwareId = sanitizeInput(req.body.softwareId) || 'default';
    const licenseData = {
      hwid: '', deviceName: '', deviceInfo: '', activatedAt: '', userId: '',
      expiry, history: [], notes: [], banned: false,
      createdAt: new Date().toISOString(), createdBy: req.session.user,
      type: 'standard', softwareId
    };
    await saveLicense(license, licenseData);
    await logActivityBatched('LICENSE_GENERATED', `License: ${license}, Software: ${softwareId}`, req.ip, req.get('User-Agent'));
    const sw = await getSoftware(softwareId);
    await sendWebhook('license_generated', { license, expiry: expiry ? new Date(expiry).toLocaleDateString() : 'Never', createdBy: req.session.user, software: sw?.name || softwareId }, sw?.webhookUrl);
    res.redirect('/admin');
  } catch (error) {
    console.error('Generate error:', error);
    res.send('<script>alert("Error!");window.location="/admin";</script>');
  }
});

router.post('/bulk-generate', async (req, res) => {
  try {
    const count = parseInt(req.body.count) || 1;
    const prefix = req.body.prefix || 'LIC';
    const expiry = req.body.expiry ? new Date(req.body.expiry).toISOString() : null;
    const softwareId = sanitizeInput(req.body.softwareId) || 'default';
    if (count > 100) return res.send('<script>alert("Max 100!");window.location="/admin";</script>');
    const batchId = Date.now();
    const licenses = [];
    // Use Firestore batch write for all licenses at once
    const db = getDb();
    const batch = db.batch();
    for (let i = 0; i < count; i++) {
      const license = generateSecureLicenseKey(prefix);
      const docRef = db.collection('licenses').doc(license);
      batch.set(docRef, {
        hwid: '', deviceName: '', deviceInfo: '', activatedAt: '', userId: '',
        expiry, history: [], notes: [], banned: false,
        createdAt: new Date().toISOString(), createdBy: req.session.user,
        batchId, type: 'bulk', softwareId
      });
      licenses.push(license);
    }
    await batch.commit();
    await logActivityBatched('BULK_GENERATE', `Generated ${count} licenses for ${softwareId}`, req.ip, req.get('User-Agent'));
    const sw = await getSoftware(softwareId);
    await sendWebhook('bulk_licenses_generated', { count, prefix, expiry: expiry ? new Date(expiry).toLocaleDateString() : 'Never', batchId, createdBy: req.session.user, software: sw?.name || softwareId }, sw?.webhookUrl);
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="licenses_${batchId}.txt"`);
    res.send(licenses.join('\n'));
  } catch (error) {
    console.error('Bulk error:', error);
    res.send('<script>alert("Error!");window.location="/admin";</script>');
  }
});

// ============================================================================
// LICENSE MANAGEMENT
// ============================================================================

router.post('/delete-license', async (req, res) => {
  try {
    const { license } = req.body;
    const lic = await getLicense(license);
    if (lic && lic.hwid) await updateHwidIndex(lic.hwid, license, 'remove');
    await deleteLicense(license);
    cache.licenseCache.delete(license);
    await logActivityBatched('LICENSE_DELETED', `License: ${license}`, req.ip, req.get('User-Agent'));
    const sw = await getSoftware(lic?.softwareId || 'default');
    await sendWebhook('license_deleted', { license, deletedBy: req.session.user, wasActivated: !!lic?.hwid, deviceName: lic?.deviceName || 'Not activated' }, sw?.webhookUrl);
    res.redirect('/admin');
  } catch (error) {
    console.error('Delete error:', error);
    res.send('<script>alert("Error!");window.location="/admin";</script>');
  }
});

router.post('/reset-hwid', async (req, res) => {
  try {
    const { license } = req.body;
    const lic = await getLicense(license);
    if (lic && lic.hwid) {
      const oldHwid = lic.hwid;
      const updatedLic = {
        ...lic, hwid: '', deviceName: '', deviceInfo: '', activatedAt: '', userId: '',
        history: [...(lic.history || []), { action: 'HWID_RESET_BY_ADMIN', date: new Date().toISOString(), admin: req.session.user }]
      };
      await Promise.all([saveLicenseAndInvalidateCache(license, updatedLic), updateHwidIndex(oldHwid, license, 'remove')]);
      await logActivityBatched('HWID_RESET', `License: ${license}`, req.ip, req.get('User-Agent'));
      const sw = await getSoftware(lic?.softwareId || 'default');
      await sendWebhook('hwid_reset', { license, previousDevice: lic.deviceName || 'Unknown', resetBy: req.session.user, software: sw?.name || 'default' }, sw?.webhookUrl);
    }
    res.redirect('/admin');
  } catch (error) {
    console.error('Reset error:', error);
    res.send('<script>alert("Error!");window.location="/admin";</script>');
  }
});

router.post('/add-license-note', async (req, res) => {
  try {
    const { license, note } = req.body;
    const lic = await getLicense(license);
    if (lic) {
      const updatedLic = { ...lic, notes: [...(lic.notes || []), { note: sanitizeInput(note), addedBy: req.session.user, addedAt: new Date().toISOString() }] };
      await saveLicenseAndInvalidateCache(license, updatedLic);
      await logActivityBatched('LICENSE_NOTE_ADDED', `License: ${license}`, req.ip, req.get('User-Agent'));
    }
    res.redirect('/admin');
  } catch (error) {
    console.error('Note error:', error);
    res.redirect('/admin');
  }
});

router.post('/ban-license', async (req, res) => {
  try {
    const { license, reason, duration } = req.body;
    const lic = await getLicense(license);
    if (lic) {
      const banUntil = duration ? new Date(Date.now() + parseInt(duration) * 86400000).toISOString() : null;
      const updatedLic = {
        ...lic, banned: true, banReason: sanitizeInput(reason) || 'No reason',
        bannedAt: new Date().toISOString(), bannedBy: req.session.user, banUntil,
        history: [...(lic.history || []), { action: 'LICENSE_BANNED', date: new Date().toISOString(), admin: req.session.user, reason: sanitizeInput(reason), duration: duration ? `${duration} days` : 'Permanent' }]
      };
      await saveLicenseAndInvalidateCache(license, updatedLic);
      await logActivityBatched('LICENSE_BANNED', `License: ${license}`, req.ip, req.get('User-Agent'));
      const sw = await getSoftware(lic?.softwareId || 'default');
      await sendWebhook('license_banned', { license, reason: sanitizeInput(reason) || 'No reason', duration: duration ? `${duration} days` : 'Permanent', bannedBy: req.session.user, software: sw?.name || 'default' }, sw?.webhookUrl);
    }
    res.redirect('/admin');
  } catch (error) {
    console.error('Ban license error:', error);
    res.redirect('/admin');
  }
});

router.post('/unban-license', async (req, res) => {
  try {
    const { license } = req.body;
    const lic = await getLicense(license);
    if (lic) {
      const updatedLic = {
        ...lic, banned: false, banReason: null, bannedAt: null, bannedBy: null, banUntil: null,
        history: [...(lic.history || []), { action: 'LICENSE_UNBANNED', date: new Date().toISOString(), admin: req.session.user }]
      };
      await saveLicenseAndInvalidateCache(license, updatedLic);
      await logActivityBatched('LICENSE_UNBANNED', `License: ${license}`, req.ip, req.get('User-Agent'));
      const sw = await getSoftware(lic?.softwareId || 'default');
      await sendWebhook('license_unbanned', { license, unbannedBy: req.session.user, software: sw?.name || 'default' }, sw?.webhookUrl);
    }
    res.redirect('/admin');
  } catch (error) {
    console.error('Unban license error:', error);
    res.redirect('/admin');
  }
});

// ============================================================================
// SETTINGS
// ============================================================================

router.post('/update-settings', async (req, res) => {
  try {
    const { apiEnabled } = req.body;
    const settings = { apiEnabled: apiEnabled === 'true', maxDevices: 1, lastUpdated: new Date().toISOString(), updatedBy: req.session.user };
    await saveSettings(settings);
    cache.clearAllCaches();
    await logActivityBatched('SETTINGS_UPDATED', JSON.stringify(settings), req.ip, req.get('User-Agent'));
    await sendWebhook('settings_updated', { apiEnabled: settings.apiEnabled ? 'Enabled' : 'Disabled', updatedBy: req.session.user });
    res.redirect('/admin');
  } catch (error) {
    console.error('Settings error:', error);
    res.send('<script>alert("Error!");window.location="/admin";</script>');
  }
});

// ============================================================================
// BAN MANAGEMENT
// ============================================================================

router.post('/ban-hwid', async (req, res) => {
  try {
    const { hwid, reason } = req.body;
    if (hwid && hwid.trim()) {
      await addToBanlist(hwid.trim(), sanitizeInput(reason) || 'No reason');
      cache.clearAllCaches();
      await logActivityBatched('HWID_BANNED', `HWID: ${hwid}`, req.ip, req.get('User-Agent'));
      await sendWebhook('hwid_banned', { hwid: hwid.substring(0, 20) + '...', reason: sanitizeInput(reason) || 'No reason', bannedBy: req.session.user });
    }
    res.redirect('/admin');
  } catch (error) {
    console.error('Ban error:', error);
    res.send('<script>alert("Error!");window.location="/admin";</script>');
  }
});

router.post('/unban-hwid', async (req, res) => {
  try {
    const { hwid } = req.body;
    await removeFromBanlist(hwid);
    cache.clearAllCaches();
    await logActivityBatched('HWID_UNBANNED', `HWID: ${hwid}`, req.ip, req.get('User-Agent'));
    await sendWebhook('hwid_unbanned', { hwid: hwid.substring(0, 20) + '...', unbannedBy: req.session.user });
    res.redirect('/admin');
  } catch (error) {
    console.error('Unban error:', error);
    res.send('<script>alert("Error!");window.location="/admin";</script>');
  }
});

// ============================================================================
// MAINTENANCE
// ============================================================================

router.post('/clear-cache', (req, res) => {
  cache.clearAllCaches();
  sendWebhook('cache_cleared', { clearedBy: req.session.user, timestamp: new Date().toISOString() });
  res.redirect('/admin');
});

router.post('/clear-logs', async (req, res) => {
  try {
    const db = getDb();
    const days = parseInt(req.body.days) || 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const logsSnapshot = await db.collection('activity_log').where('date', '<', cutoffDate.toISOString()).get();
    const batch = db.batch();
    logsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    await logActivityBatched('LOGS_CLEARED', `Cleared ${logsSnapshot.size} logs`, req.ip, req.get('User-Agent'));
    await sendWebhook('logs_cleared', { logsCleared: logsSnapshot.size, olderThan: `${days} days`, clearedBy: req.session.user });
    res.redirect('/admin');
  } catch (error) {
    console.error('Clear logs error:', error);
    res.send('<script>alert("Error!");window.location="/admin";</script>');
  }
});

// ============================================================================
// SOFTWARE MANAGEMENT
// ============================================================================

router.get('/software', async (req, res) => {
  try {
    const allSoftware = await getAllSoftware();
    // Get license counts per software in one query
    const db = getDb();
    const licensesSnapshot = await db.collection('licenses').get();
    const licenseCounts = {};
    licensesSnapshot.forEach(doc => {
      const sid = doc.data().softwareId || 'default';
      licenseCounts[sid] = (licenseCounts[sid] || 0) + 1;
    });
    res.send(generateSoftwarePage(allSoftware, licenseCounts));
  } catch (error) {
    console.error('Software page error:', error);
    res.status(500).send('Error loading software page');
  }
});

router.post('/software/create', async (req, res) => {
  try {
    const name = sanitizeInput(req.body.name);
    if (!name) return res.send('<script>alert("Name required!");window.location="/admin/software";</script>');
    const id = slugify(name) + '-' + Date.now().toString(36);
    const softwareData = {
      name,
      slug: slugify(name),
      description: sanitizeInput(req.body.description) || '',
      icon: sanitizeInput(req.body.icon) || '🔧',
      color: req.body.color || '#00aaee',
      authMode: req.body.authMode || 'license_only',       // 'license_only' | 'license_credentials'
      bindingMode: req.body.bindingMode || 'hwid',          // 'none' | 'hwid' | 'user_id' | 'hwid_and_user_id'
      maxDevices: parseInt(req.body.maxDevices) || 1,
      allowSelfReset: req.body.allowSelfReset === 'true',
      selfResetCooldown: parseInt(req.body.selfResetCooldown) || 24,
      versionCheck: req.body.versionCheck === 'true',
      latestVersion: sanitizeInput(req.body.latestVersion) || '1.0.0',
      downloadUrl: sanitizeInput(req.body.downloadUrl) || '',
      apiEnabled: true,
      maintenanceMode: false,
      maintenanceMessage: '',
      webhookUrl: sanitizeInput(req.body.webhookUrl) || '',
      licensePrefix: sanitizeInput(req.body.licensePrefix) || name.substring(0, 3).toUpperCase(),
      createdAt: new Date().toISOString(),
      createdBy: req.session.user,
      status: 'active'
    };
    await saveSoftware(id, softwareData);
    invalidateSoftwareCache(id);
    await logActivityBatched('SOFTWARE_CREATED', `Software: ${name} (${id})`, req.ip, req.get('User-Agent'));
    await sendWebhook('software_created', { name, id, authMode: softwareData.authMode, bindingMode: softwareData.bindingMode, createdBy: req.session.user }, softwareData.webhookUrl);
    res.redirect('/admin/software');
  } catch (error) {
    console.error('Create software error:', error);
    res.send('<script>alert("Error creating software!");window.location="/admin/software";</script>');
  }
});

router.get('/software/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [software, db] = [await getSoftware(id), getDb()];
    if (!software) return res.send('<script>alert("Software not found!");window.location="/admin/software";</script>');
    const licensesSnapshot = await db.collection('licenses').where('softwareId', '==', id).get();
    const licenses = {};
    licensesSnapshot.forEach(doc => { licenses[doc.id] = doc.data(); });
    const announcements = await getAllAnnouncementsAdmin(id);
    const users = software.authMode === 'license_credentials' ? await getAllSoftwareUsers(id) : [];
    res.send(generateSoftwarePage(null, {}, { software, licenses, announcements, users }));
  } catch (error) {
    console.error('Software detail error:', error);
    res.status(500).send('Error loading software');
  }
});

router.post('/software/:id/update', async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await getSoftware(id);
    if (!existing) return res.send('<script>alert("Not found!");history.back();</script>');
    const updatedData = {
      ...existing,
      name: sanitizeInput(req.body.name) || existing.name,
      description: sanitizeInput(req.body.description) || '',
      icon: sanitizeInput(req.body.icon) || existing.icon,
      color: req.body.color || existing.color,
      authMode: req.body.authMode || existing.authMode,
      bindingMode: req.body.bindingMode || existing.bindingMode,
      maxDevices: parseInt(req.body.maxDevices) || existing.maxDevices,
      allowSelfReset: req.body.allowSelfReset === 'true',
      selfResetCooldown: parseInt(req.body.selfResetCooldown) || existing.selfResetCooldown,
      versionCheck: req.body.versionCheck === 'true',
      latestVersion: sanitizeInput(req.body.latestVersion) || existing.latestVersion,
      downloadUrl: sanitizeInput(req.body.downloadUrl) || '',
      maintenanceMode: req.body.maintenanceMode === 'true',
      maintenanceMessage: sanitizeInput(req.body.maintenanceMessage) || '',
      webhookUrl: sanitizeInput(req.body.webhookUrl) || '',
      licensePrefix: sanitizeInput(req.body.licensePrefix) || existing.licensePrefix,
      updatedAt: new Date().toISOString(),
      updatedBy: req.session.user
    };
    await saveSoftware(id, updatedData);
    invalidateSoftwareCache(id);  // Real-time: API reads fresh config on next call
    await logActivityBatched('SOFTWARE_UPDATED', `Software: ${existing.name} (${id})`, req.ip, req.get('User-Agent'));
    await sendWebhook('software_updated', { name: updatedData.name, id, authMode: updatedData.authMode, bindingMode: updatedData.bindingMode, updatedBy: req.session.user }, updatedData.webhookUrl);
    res.redirect(`/admin/software/${id}`);
  } catch (error) {
    console.error('Update software error:', error);
    res.send('<script>alert("Error!");history.back();</script>');
  }
});

router.post('/software/:id/toggle-api', async (req, res) => {
  try {
    const { id } = req.params;
    const software = await getSoftware(id);
    if (!software) return res.json({ success: false });
    const newState = !software.apiEnabled;
    await saveSoftware(id, { ...software, apiEnabled: newState, updatedAt: new Date().toISOString() });
    invalidateSoftwareCache(id);
    await logActivityBatched(newState ? 'SOFTWARE_ENABLED' : 'SOFTWARE_DISABLED', `Software: ${software.name}`, req.ip, req.get('User-Agent'));
    await sendWebhook(newState ? 'software_enabled' : 'software_disabled', { name: software.name, id, changedBy: req.session.user }, software.webhookUrl);
    res.json({ success: true, apiEnabled: newState });
  } catch (error) {
    console.error('Toggle API error:', error);
    res.json({ success: false });
  }
});

router.post('/software/:id/toggle-maintenance', async (req, res) => {
  try {
    const { id } = req.params;
    const software = await getSoftware(id);
    if (!software) return res.json({ success: false });
    const newState = !software.maintenanceMode;
    await saveSoftware(id, { ...software, maintenanceMode: newState, updatedAt: new Date().toISOString() });
    invalidateSoftwareCache(id);
    res.json({ success: true, maintenanceMode: newState });
  } catch (error) {
    console.error('Toggle maintenance error:', error);
    res.json({ success: false });
  }
});

router.post('/software/:id/delete', async (req, res) => {
  try {
    const { id } = req.params;
    const software = await getSoftware(id);
    if (!software) return res.send('<script>alert("Not found!");window.location="/admin/software";</script>');
    await deleteSoftware(id);
    invalidateSoftwareCache(id);
    await logActivityBatched('SOFTWARE_DELETED', `Software: ${software.name} (${id})`, req.ip, req.get('User-Agent'));
    res.redirect('/admin/software');
  } catch (error) {
    console.error('Delete software error:', error);
    res.send('<script>alert("Error!");window.location="/admin/software";</script>');
  }
});

// ============================================================================
// SOFTWARE USERS (credentials mode)
// ============================================================================

router.post('/software/:id/users/add', async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, licenseKey } = req.body;
    if (!username || !password) return res.send('<script>alert("Username and password required!");history.back();</script>');
    const existing = await getSoftwareUser(id, username);
    if (existing) return res.send('<script>alert("Username already exists!");history.back();</script>');
    const userData = {
      username: username.toLowerCase(),
      passwordHash: hashPassword(password),
      licenseKey: sanitizeInput(licenseKey) || '',
      createdAt: new Date().toISOString(),
      createdBy: req.session.user,
      status: 'active'
    };
    await saveSoftwareUser(id, username, userData);
    await logActivityBatched('USER_CREATED', `User: ${username} for software: ${id}`, req.ip, req.get('User-Agent'));
    const sw = await getSoftware(id);
    await sendWebhook('user_created', { username, software: sw?.name || id, createdBy: req.session.user }, sw?.webhookUrl);
    res.redirect(`/admin/software/${id}`);
  } catch (error) {
    console.error('Add user error:', error);
    res.send('<script>alert("Error!");history.back();</script>');
  }
});

router.post('/software/:id/users/reset-password', async (req, res) => {
  try {
    const { id } = req.params;
    const { username, newPassword } = req.body;
    const user = await getSoftwareUser(id, username);
    if (!user) return res.send('<script>alert("User not found!");history.back();</script>');
    await saveSoftwareUser(id, username, { ...user, passwordHash: hashPassword(newPassword), updatedAt: new Date().toISOString() });
    res.redirect(`/admin/software/${id}`);
  } catch (error) {
    console.error('Reset password error:', error);
    res.send('<script>alert("Error!");history.back();</script>');
  }
});

router.post('/software/:id/users/ban', async (req, res) => {
  try {
    const { id } = req.params;
    const { username } = req.body;
    const user = await getSoftwareUser(id, username);
    if (!user) return res.send('<script>alert("User not found!");history.back();</script>');
    await saveSoftwareUser(id, username, { ...user, status: 'banned', bannedAt: new Date().toISOString(), bannedBy: req.session.user });
    const sw = await getSoftware(id);
    await sendWebhook('user_banned', { username, software: sw?.name || id, bannedBy: req.session.user }, sw?.webhookUrl);
    res.redirect(`/admin/software/${id}`);
  } catch (error) {
    console.error('Ban user error:', error);
    res.send('<script>alert("Error!");history.back();</script>');
  }
});

router.post('/software/:id/users/unban', async (req, res) => {
  try {
    const { id } = req.params;
    const { username } = req.body;
    const user = await getSoftwareUser(id, username);
    if (!user) return res.send('<script>alert("User not found!");history.back();</script>');
    await saveSoftwareUser(id, username, { ...user, status: 'active', bannedAt: null, bannedBy: null });
    res.redirect(`/admin/software/${id}`);
  } catch (error) {
    console.error('Unban user error:', error);
    res.send('<script>alert("Error!");history.back();</script>');
  }
});

router.post('/software/:id/users/delete', async (req, res) => {
  try {
    const { id } = req.params;
    const { username } = req.body;
    await deleteSoftwareUser(id, username);
    res.redirect(`/admin/software/${id}`);
  } catch (error) {
    console.error('Delete user error:', error);
    res.send('<script>alert("Error!");history.back();</script>');
  }
});

// ============================================================================
// ANNOUNCEMENTS (per-software)
// ============================================================================

router.get('/announcements', async (req, res) => {
  try {
    const allSoftware = await getAllSoftware();
    // Fetch announcements for each software in parallel
    const announcementsMap = {};
    await Promise.all(allSoftware.map(async (sw) => {
      announcementsMap[sw.id] = await getAllAnnouncementsAdmin(sw.id);
    }));
    res.send(generateAnnouncementsPage(allSoftware, announcementsMap));
  } catch (error) {
    console.error('Announcements page error:', error);
    res.status(500).send('Error loading announcements');
  }
});

router.post('/announcements/create', async (req, res) => {
  try {
    const { softwareId, title, message, type, expiresAt } = req.body;
    if (!softwareId || !title || !message) {
      return res.send('<script>alert("Software, title and message required!");history.back();</script>');
    }
    const sw = await getSoftware(softwareId);
    if (!sw) return res.send('<script>alert("Software not found!");history.back();</script>');
    const announcementData = {
      softwareId,
      title: sanitizeInput(title),
      message: sanitizeInput(message),
      type: type || 'info',
      active: true,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      createdAt: new Date().toISOString(),
      createdBy: req.session.user
    };
    const id = await saveAnnouncement(softwareId, announcementData);
    invalidateAnnouncementsCache(softwareId);
    await logActivityBatched('ANNOUNCEMENT_CREATED', `Title: ${title}, Software: ${sw.name}`, req.ip, req.get('User-Agent'));
    await sendWebhook('announcement_created', { title, type: type || 'info', software: sw.name, createdBy: req.session.user }, sw.webhookUrl);
    res.redirect('/admin/announcements');
  } catch (error) {
    console.error('Create announcement error:', error);
    res.send('<script>alert("Error!");history.back();</script>');
  }
});

router.post('/announcements/:softwareId/:id/toggle', async (req, res) => {
  try {
    const { softwareId, id } = req.params;
    const announcements = await getAllAnnouncementsAdmin(softwareId);
    const ann = announcements.find(a => a.id === id);
    if (!ann) return res.json({ success: false });
    await updateAnnouncement(softwareId, id, { active: !ann.active });
    invalidateAnnouncementsCache(softwareId);
    res.json({ success: true, active: !ann.active });
  } catch (error) {
    console.error('Toggle announcement error:', error);
    res.json({ success: false });
  }
});

router.post('/announcements/:softwareId/:id/delete', async (req, res) => {
  try {
    const { softwareId, id } = req.params;
    await deleteAnnouncement(softwareId, id);
    invalidateAnnouncementsCache(softwareId);
    res.redirect('/admin/announcements');
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.send('<script>alert("Error!");history.back();</script>');
  }
});

module.exports = router;
