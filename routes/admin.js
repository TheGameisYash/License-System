// routes/admin.js - ENHANCED Admin Panel with Request System
const express = require('express');
const router = express.Router();
const { generateDashboard, generateRequestManagementPage } = require('../views/dashboard');
const { getDb } = require('../config/firebase');

const {
  getLicense,
  saveLicense,
  deleteLicense,
  getSettings,
  saveSettings,
  getBanlist,
  addToBanlist,
  removeFromBanlist
} = require('../utils/database');

const {
  saveLicenseAndInvalidateCache,
  updateHwidIndex,
  logActivityBatched
} = require('../utils/optimization');

const { generateSecureLicenseKey } = require('../utils/helpers');
const { sanitizeInput } = require('../utils/validators');
const { sendWebhook } = require('../utils/webhook');
const cache = require('../utils/cache');

// Authentication middleware
router.use((req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  res.redirect('/auth/login');
});

// ============================================================================
// DASHBOARD
// ============================================================================

router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const licensesSnapshot = await db.collection('licenses').get();
    const licenses = {};
    licensesSnapshot.forEach(doc => {
      licenses[doc.id] = doc.data();
    });
    
    const settings = await getSettings();
    const banlist = await getBanlist();
    
    const recentLogsSnapshot = await db.collection('activity_log')
      .orderBy('date', 'desc')
      .limit(15)
      .get();
    const recentLogs = recentLogsSnapshot.docs.map(doc => doc.data());
    
    // Get pending reset requests count
    const pendingRequestsSnapshot = await db.collection('reset_requests')
      .where('status', '==', 'pending')
      .get();
    const pendingRequestsCount = pendingRequestsSnapshot.size;
    
    res.send(generateDashboard(licenses, settings, banlist, recentLogs, cache, pendingRequestsCount));
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).send('Error loading dashboard');
  }
});

// ============================================================================
// RESET REQUESTS MANAGEMENT
// ============================================================================

router.get('/reset-requests', async (req, res) => {
  try {
    const db = getDb();
    
    const pendingSnapshot = await db.collection('reset_requests')
      .where('status', '==', 'pending')
      .orderBy('requestedAt', 'desc')
      .get();
    
    const processedSnapshot = await db.collection('reset_requests')
      .where('status', 'in', ['approved', 'denied'])
      .orderBy('requestedAt', 'desc')
      .limit(20)
      .get();
    
    const pendingRequests = pendingSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    const processedRequests = processedSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
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
    
    if (!requestDoc.exists) {
      return res.send('<script>alert("Request not found!");window.location="/admin/reset-requests";</script>');
    }
    
    const requestData = requestDoc.data();
    const license = requestData.license;
    const hwid = requestData.fullHwid;
    
    const lic = await getLicense(license);
    
    if (lic && lic.hwid) {
      const updatedLic = {
        ...lic,
        hwid: '',
        deviceName: '',
        deviceInfo: '',
        activatedAt: '',
        history: [...(lic.history || []), {
          action: 'HWID_RESET_BY_ADMIN_APPROVAL',
          date: new Date().toISOString(),
          admin: req.session.user,
          requestId
        }]
      };
      
      await Promise.all([
        saveLicenseAndInvalidateCache(license, updatedLic),
        updateHwidIndex(hwid, license, 'remove'),
        db.collection('reset_requests').doc(requestId).update({
          status: 'approved',
          processedAt: new Date().toISOString(),
          processedBy: req.session.user,
          adminNote: 'Approved - HWID reset completed'
        })
      ]);
      
      await logActivityBatched('RESET_REQUEST_APPROVED', `Request: ${requestId}, License: ${license}`, req.ip, req.get('User-Agent'));
      await sendWebhook('reset_approved', { license, requestId });
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
    await db.collection('reset_requests').doc(requestId).update({
      status: 'denied',
      processedAt: new Date().toISOString(),
      processedBy: req.session.user,
      adminNote: sanitizeInput(reason) || 'Denied by admin'
    });
    
    await logActivityBatched('RESET_REQUEST_DENIED', `Request: ${requestId}`, req.ip, req.get('User-Agent'));
    
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
    if (existing) {
      return res.send('<script>alert("License already exists!");window.location="/admin";</script>');
    }
    
    const expiry = req.body.expiry ? new Date(req.body.expiry).toISOString() : null;
    
    const licenseData = {
      hwid: '',
      deviceName: '',
      deviceInfo: '',
      activatedAt: '',
      expiry,
      history: [],
      notes: [],
      banned: false,
      createdAt: new Date().toISOString(),
      createdBy: req.session.user,
      type: 'standard'
    };
    
    await saveLicense(license, licenseData);
    await logActivityBatched('LICENSE_GENERATED', `License: ${license}`, req.ip, req.get('User-Agent'));
    await sendWebhook('license_generated', { license, expiry: expiry || 'Never' });
    
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
    
    if (count > 100) {
      return res.send('<script>alert("Max 100!");window.location="/admin";</script>');
    }
    
    const licenses = [];
    const batchId = Date.now();
    
    for (let i = 0; i < count; i++) {
      const license = generateSecureLicenseKey(prefix);
      const licenseData = {
        hwid: '',
        deviceName: '',
        deviceInfo: '',
        activatedAt: '',
        expiry,
        history: [],
        notes: [],
        banned: false,
        createdAt: new Date().toISOString(),
        createdBy: req.session.user,
        batchId,
        type: 'bulk'
      };
      
      await saveLicense(license, licenseData);
      licenses.push(license);
    }
    
    await logActivityBatched('BULK_GENERATE', `Generated ${count} licenses`, req.ip, req.get('User-Agent'));
    
    const licensesText = licenses.join('\n');
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="licenses_${batchId}.txt"`);
    res.send(licensesText);
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
    
    if (lic && lic.hwid) {
      await updateHwidIndex(lic.hwid, license, 'remove');
    }
    
    await deleteLicense(license);
    cache.licenseCache.delete(license);
    
    await logActivityBatched('LICENSE_DELETED', `License: ${license}`, req.ip, req.get('User-Agent'));
    
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
        ...lic,
        hwid: '',
        deviceName: '',
        deviceInfo: '',
        activatedAt: '',
        history: [...(lic.history || []), {
          action: 'HWID_RESET_BY_ADMIN',
          date: new Date().toISOString(),
          admin: req.session.user
        }]
      };
      
      await Promise.all([
        saveLicenseAndInvalidateCache(license, updatedLic),
        updateHwidIndex(oldHwid, license, 'remove')
      ]);
      
      await logActivityBatched('HWID_RESET', `License: ${license}`, req.ip, req.get('User-Agent'));
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
      const updatedLic = {
        ...lic,
        notes: [...(lic.notes || []), {
          note: sanitizeInput(note),
          addedBy: req.session.user,
          addedAt: new Date().toISOString()
        }]
      };
      
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
      const banUntil = duration ? 
        new Date(Date.now() + parseInt(duration) * 24 * 60 * 60 * 1000).toISOString() : 
        null;
      
      const updatedLic = {
        ...lic,
        banned: true,
        banReason: sanitizeInput(reason) || 'No reason',
        bannedAt: new Date().toISOString(),
        bannedBy: req.session.user,
        banUntil: banUntil,
        history: [...(lic.history || []), {
          action: 'LICENSE_BANNED',
          date: new Date().toISOString(),
          admin: req.session.user,
          reason: sanitizeInput(reason),
          duration: duration ? `${duration} days` : 'Permanent'
        }]
      };
      
      await saveLicenseAndInvalidateCache(license, updatedLic);
      await logActivityBatched('LICENSE_BANNED', `License: ${license}, Duration: ${duration || 'permanent'} days`, req.ip, req.get('User-Agent'));
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
        ...lic,
        banned: false,
        banReason: null,
        bannedAt: null,
        bannedBy: null,
        banUntil: null,
        history: [...(lic.history || []), {
          action: 'LICENSE_UNBANNED',
          date: new Date().toISOString(),
          admin: req.session.user
        }]
      };
      
      await saveLicenseAndInvalidateCache(license, updatedLic);
      await logActivityBatched('LICENSE_UNBANNED', `License: ${license}`, req.ip, req.get('User-Agent'));
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
    
    const settings = {
      apiEnabled: apiEnabled === 'true',
      maxDevices: 1,
      lastUpdated: new Date().toISOString(),
      updatedBy: req.session.user
    };
    
    await saveSettings(settings);
    cache.clearAllCaches();
    
    await logActivityBatched('SETTINGS_UPDATED', JSON.stringify(settings), req.ip, req.get('User-Agent'));
    
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
      await sendWebhook('hwid_banned', { hwid: hwid.substring(0, 16) + '...', reason });
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
  res.redirect('/admin');
});

router.post('/clear-logs', async (req, res) => {
  try {
    const db = getDb();
    const days = parseInt(req.body.days) || 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const logsSnapshot = await db.collection('activity_log')
      .where('date', '<', cutoffDate.toISOString())
      .get();
    
    const batch = db.batch();
    logsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    
    await logActivityBatched('LOGS_CLEARED', `Cleared ${logsSnapshot.size} logs`, req.ip, req.get('User-Agent'));
    
    res.redirect('/admin');
  } catch (error) {
    console.error('Clear logs error:', error);
    res.send('<script>alert("Error!");window.location="/admin";</script>');
  }
});

module.exports = router;
