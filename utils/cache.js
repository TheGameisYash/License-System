// utils/cache.js — Single shared cache state object
// All caches live as properties of this exports object so that
// clearAllCaches() properly resets them for every consumer.

const cache = module.exports = {
  // License cache (Map<licenseKey, {data, expiry}>)
  licenseCache: new Map(),

  // Recent validation tracking (Map<"license:hwid", timestamp>)
  recentValidations: new Map(),

  // System settings cache
  settingsCache: null,
  settingsCacheExpiry: 0,

  // HWID banlist cache
  banlistCache: null,
  banlistCacheExpiry: 0,

  // Per-software config cache (Map<softwareId, {data, expiry}>)
  softwareCache: new Map(),

  // All-software list cache
  allSoftwareCache: null,
  allSoftwareCacheExpiry: 0,

  // Per-software announcements cache (Map<softwareId, {data, expiry}>)
  announcementsCache: new Map(),

  // Activity log batching
  activityLogBatch: [],
  lastFlush: Date.now(),

  /**
   * Clear every cache store. Called by admin panel and settings updates.
   * Because all values are properties of `module.exports`, mutations here
   * are visible to every file that imported this module.
   */
  clearAllCaches() {
    cache.licenseCache.clear();
    cache.recentValidations.clear();
    cache.settingsCache = null;
    cache.settingsCacheExpiry = 0;
    cache.banlistCache = null;
    cache.banlistCacheExpiry = 0;
    cache.softwareCache.clear();
    cache.allSoftwareCache = null;
    cache.allSoftwareCacheExpiry = 0;
    cache.announcementsCache.clear();
    console.log('🧹 All caches cleared');
  }
};
