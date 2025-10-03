// utils/cache.js
const licenseCache = new Map();
const recentValidations = new Map();
let settingsCache = null;
let settingsCacheExpiry = 0;
let banlistCache = null;
let banlistCacheExpiry = 0;
const activityLogBatch = [];
let lastFlush = Date.now();

function clearAllCaches() {
  licenseCache.clear();
  recentValidations.clear();
  settingsCache = null;
  settingsCacheExpiry = 0;
  banlistCache = null;
  banlistCacheExpiry = 0;
  console.log('🧹 All caches cleared');
}

module.exports = {
  licenseCache,
  recentValidations,
  settingsCache,
  settingsCacheExpiry,
  banlistCache,
  banlistCacheExpiry,
  activityLogBatch,
  lastFlush,
  clearAllCaches
};
