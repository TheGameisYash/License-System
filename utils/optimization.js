// utils/optimization.js - ULTRA OPTIMIZATION ENGINE
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
    await hwidIndexRef.set({
      license: license,
      registeredAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    });
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
    if (hwidDoc.exists) {
      return hwidDoc.data().license;
    }
    return null;
  } catch (error) {
    console.error('Error getting license by HWID:', error);
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
    cache.licenseCache.set(licenseKey, {
      data: license,
      expiry: Date.now() + CONFIG.LICENSE_CACHE_TTL
    });
  }
  
  return license;
}

async function saveLicenseAndInvalidateCache(licenseKey, licenseData) {
  await saveLicense(licenseKey, licenseData);
  cache.licenseCache.delete(licenseKey);
  console.log(`🗑️ Cache invalidated: ${licenseKey}`);
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
  
  if (cache.settingsCache && now < cache.settingsCacheExpiry) {
    console.log('✅ Settings cache HIT');
    return cache.settingsCache;
  }
  
  console.log('💾 Settings cache MISS');
  const { getSettings } = require('./database');
  cache.settingsCache = await getSettings();
  cache.settingsCacheExpiry = now + CONFIG.SETTINGS_CACHE_TTL;
  return cache.settingsCache;
}

async function getBanlistCached() {
  const now = Date.now();
  
  if (cache.banlistCache && now < cache.banlistCacheExpiry) {
    return cache.banlistCache;
  }
  
  console.log('💾 Banlist cache MISS');
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
    action,
    details,
    ip,
    userAgent,
    license,
    severity,
    date: new Date().toISOString()
  });
  
  if (cache.activityLogBatch.length >= CONFIG.ACTIVITY_BATCH_SIZE || 
      (Date.now() - cache.lastFlush) > CONFIG.ACTIVITY_FLUSH_INTERVAL) {
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
      const docRef = db.collection('activity_log').doc();
      batch.set(docRef, log);
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

// Flush on server shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 Flushing logs before shutdown...');
  await flushActivityLog();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 Flushing logs before shutdown...');
  await flushActivityLog();
  process.exit(0);
});

// ============================================================================
// MEMORY CLEANUP (Every 15 minutes)
// ============================================================================

setInterval(() => {
  const now = Date.now();
  
  // Clean expired license cache
  let expiredLicenses = 0;
  for (const [key, value] of cache.licenseCache.entries()) {
    if (now > value.expiry) {
      cache.licenseCache.delete(key);
      expiredLicenses++;
    }
  }
  
  // Clean old validations
  let expiredValidations = 0;
  const cutoff = now - CONFIG.VALIDATION_SKIP_TTL;
  for (const [key, timestamp] of cache.recentValidations.entries()) {
    if (timestamp < cutoff) {
      cache.recentValidations.delete(key);
      expiredValidations++;
    }
  }
  
  console.log(`🧹 Cleanup: ${expiredLicenses} licenses, ${expiredValidations} validations`);
  console.log(`📊 Cache: ${cache.licenseCache.size} licenses, ${cache.recentValidations.size} validations`);
}, 15 * 60 * 1000);

console.log('✅ Ultra optimization engine loaded');

module.exports = {
  updateHwidIndex,
  getLicenseByHwid,
  getLicenseCached,
  saveLicenseAndInvalidateCache,
  wasRecentlyValidated,
  markAsRecentlyValidated,
  getSettingsCached,
  getBanlistCached,
  logActivityBatched,
  flushActivityLog
};
