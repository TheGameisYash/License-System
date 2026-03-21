// utils/optimization.js - ULTRA OPTIMIZATION ENGINE (Updated: Software + Announcements Caching)
const { getDb } = require('../config/firebase');
const { CONFIG } = require('../config/constants');
const { getLicense, saveLicense } = require('./database');
const cache = require('./cache');

// ============================================================================
// HWID INDEX (O(1) Lookups)
// ============================================================================

async function updateHwidIndex(hwid, license, action = 'add') {
  const db = getDb();
  const hwidIndexRef = db.collection('hwid_index').doc(hwid);
  if (action === 'add') {
    await hwidIndexRef.set({ license, registeredAt: new Date().toISOString(), lastUpdated: new Date().toISOString() });
    console.log(`✅ HWID Index added: ${hwid} -> ${license}`);
  } else if (action === 'remove') {
    await hwidIndexRef.delete();
    console.log(`🗑️ HWID Index removed: ${hwid}`);
  }
}

async function getLicenseByHwid(hwid) {
  try {
    const db = getDb();
    const hwidDoc = await db.collection('hwid_index').doc(hwid).get();
    return hwidDoc.exists ? hwidDoc.data().license : null;
  } catch (error) {
    console.error('getLicenseByHwid error:', error);
    return null;
  }
}

// ============================================================================
// LICENSE CACHING (10 min TTL)
// ============================================================================

async function getLicenseCached(licenseKey) {
  const cached = cache.licenseCache.get(licenseKey);
  if (cached && Date.now() < cached.expiry) {
    console.log(`✅ Cache HIT: ${licenseKey}`);
    return cached.data;
  }
  console.log(`💾 Cache MISS: ${licenseKey}`);
  const license = await getLicense(licenseKey);
  if (license) {
    cache.licenseCache.set(licenseKey, { data: license, expiry: Date.now() + CONFIG.LICENSE_CACHE_TTL });
  }
  return license;
}

async function saveLicenseAndInvalidateCache(licenseKey, licenseData) {
  await saveLicense(licenseKey, licenseData);
  cache.licenseCache.delete(licenseKey);
  console.log(`🗑️ Cache invalidated: ${licenseKey}`);
}

// ============================================================================
// SOFTWARE CACHING (30 min TTL, invalidated on admin save)
// ============================================================================

// Per-software cache: Map<softwareId, {data, expiry}>
if (!cache.softwareCache) cache.softwareCache = new Map();
if (!cache.allSoftwareCache) cache.allSoftwareCache = null;
if (!cache.allSoftwareCacheExpiry) cache.allSoftwareCacheExpiry = 0;

async function getSoftwareCached(softwareId) {
  const cached = cache.softwareCache.get(softwareId);
  if (cached && Date.now() < cached.expiry) {
    return cached.data;
  }
  const { getSoftware } = require('./database');
  const software = await getSoftware(softwareId);
  if (software) {
    cache.softwareCache.set(softwareId, { data: software, expiry: Date.now() + CONFIG.SETTINGS_CACHE_TTL });
  }
  return software;
}

async function getAllSoftwareCached() {
  if (cache.allSoftwareCache && Date.now() < cache.allSoftwareCacheExpiry) {
    return cache.allSoftwareCache;
  }
  const { getAllSoftware } = require('./database');
  cache.allSoftwareCache = await getAllSoftware();
  cache.allSoftwareCacheExpiry = Date.now() + CONFIG.SETTINGS_CACHE_TTL;
  return cache.allSoftwareCache;
}

function invalidateSoftwareCache(softwareId) {
  if (softwareId) cache.softwareCache.delete(softwareId);
  // Also bust the full list
  cache.allSoftwareCache = null;
  cache.allSoftwareCacheExpiry = 0;
  console.log(`🗑️ Software cache invalidated: ${softwareId || 'ALL'}`);
}

// ============================================================================
// ANNOUNCEMENTS CACHING (10 min TTL per software)
// ============================================================================

if (!cache.announcementsCache) cache.announcementsCache = new Map();

async function getAnnouncementsCached(softwareId) {
  const cached = cache.announcementsCache.get(softwareId);
  if (cached && Date.now() < cached.expiry) {
    return cached.data;
  }
  const { getAnnouncements } = require('./database');
  const announcements = await getAnnouncements(softwareId);
  cache.announcementsCache.set(softwareId, { data: announcements, expiry: Date.now() + CONFIG.LICENSE_CACHE_TTL });
  return announcements;
}

function invalidateAnnouncementsCache(softwareId) {
  cache.announcementsCache.delete(softwareId);
  console.log(`🗑️ Announcements cache invalidated: ${softwareId}`);
}

// ============================================================================
// RECENT VALIDATION TRACKING (5 min skip window)
// ============================================================================

function wasRecentlyValidated(licenseKey, hwid) {
  const key = `${licenseKey}:${hwid}`;
  const lastValidation = cache.recentValidations.get(key);
  if (lastValidation && (Date.now() - lastValidation) < CONFIG.VALIDATION_SKIP_TTL) {
    const secondsAgo = Math.floor((Date.now() - lastValidation) / 1000);
    console.log(`⚡ SUPER FAST: ${key} validated ${secondsAgo}s ago - skipping DB`);
    return true;
  }
  return false;
}

function markAsRecentlyValidated(licenseKey, hwid) {
  const key = `${licenseKey}:${hwid}`;
  cache.recentValidations.set(key, Date.now());
}

// ============================================================================
// SETTINGS & BANLIST CACHING (30 min TTL)
// ============================================================================

async function getSettingsCached() {
  const now = Date.now();
  if (cache.settingsCache && now < cache.settingsCacheExpiry) return cache.settingsCache;
  const { getSettings } = require('./database');
  cache.settingsCache = await getSettings();
  cache.settingsCacheExpiry = now + CONFIG.SETTINGS_CACHE_TTL;
  return cache.settingsCache;
}

async function getBanlistCached() {
  const now = Date.now();
  if (cache.banlistCache && now < cache.banlistCacheExpiry) return cache.banlistCache;
  const { getBanlist } = require('./database');
  cache.banlistCache = await getBanlist();
  cache.banlistCacheExpiry = now + CONFIG.BANLIST_CACHE_TTL;
  return cache.banlistCache;
}

// ============================================================================
// ACTIVITY LOG BATCHING (Reduces writes by 98%)
// ============================================================================

async function logActivityBatched(action, details, ip, userAgent, license = null, severity = 'low') {
  cache.activityLogBatch.push({
    action, details, ip, userAgent, license, severity,
    date: new Date().toISOString()
  });
  if (
    cache.activityLogBatch.length >= CONFIG.ACTIVITY_BATCH_SIZE ||
    (Date.now() - cache.lastFlush) > CONFIG.ACTIVITY_FLUSH_INTERVAL
  ) {
    await flushActivityLog();
  }
}

async function flushActivityLog() {
  if (cache.activityLogBatch.length === 0) return;
  console.log(`📝 Flushing ${cache.activityLogBatch.length} activity logs...`);
  try {
    const db = getDb();
    const batch = db.batch();
    cache.activityLogBatch.forEach(log => {
      batch.set(db.collection('activity_log').doc(), log);
    });
    await batch.commit();
    console.log(`✅ Flushed ${cache.activityLogBatch.length} logs`);
    cache.activityLogBatch.length = 0;
    cache.lastFlush = Date.now();
  } catch (error) {
    console.error('❌ Error flushing logs:', error);
  }
}

// Auto-flush every 5 minutes
setInterval(flushActivityLog, CONFIG.ACTIVITY_FLUSH_INTERVAL);

// ============================================================================
// MEMORY CLEANUP (Every 15 minutes)
// ============================================================================

setInterval(() => {
  const now = Date.now();
  let cleaned = 0;

  for (const [key, value] of cache.licenseCache.entries()) {
    if (now > value.expiry) { cache.licenseCache.delete(key); cleaned++; }
  }
  const cutoff = now - CONFIG.VALIDATION_SKIP_TTL;
  for (const [key, ts] of cache.recentValidations.entries()) {
    if (ts < cutoff) { cache.recentValidations.delete(key); }
  }
  for (const [key, value] of cache.softwareCache.entries()) {
    if (now > value.expiry) { cache.softwareCache.delete(key); }
  }
  for (const [key, value] of cache.announcementsCache.entries()) {
    if (now > value.expiry) { cache.announcementsCache.delete(key); }
  }

  console.log(`🧹 Cleanup: ${cleaned} licenses expired from cache`);
}, 15 * 60 * 1000);

console.log('✅ Ultra optimization engine loaded');

module.exports = {
  updateHwidIndex,
  getLicenseByHwid,
  getLicenseCached,
  saveLicenseAndInvalidateCache,
  getSoftwareCached,
  getAllSoftwareCached,
  invalidateSoftwareCache,
  getAnnouncementsCached,
  invalidateAnnouncementsCache,
  wasRecentlyValidated,
  markAsRecentlyValidated,
  getSettingsCached,
  getBanlistCached,
  logActivityBatched,
  flushActivityLog
};
