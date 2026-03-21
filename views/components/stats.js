// views/components/stats.js - Updated with Software + Announcements cards
function generateStats(totalLicenses, activeLicenses, inactiveLicenses, expiredLicenses, bannedLicenses, cacheSize, softwareCount = 0, activeAnnouncementsCount = 0) {
  return `
    <div class="stats-grid">
        <div class="stat-card">
            <span class="stat-icon">📦</span>
            <h3>Total Licenses</h3>
            <div class="value">${totalLicenses}</div>
            <div class="label">All licenses in system</div>
        </div>
        <div class="stat-card">
            <span class="stat-icon">✅</span>
            <h3>Active</h3>
            <div class="value" style="color: #2ecc71;">${activeLicenses}</div>
            <div class="label">Working &amp; valid</div>
        </div>
        <div class="stat-card">
            <span class="stat-icon">⏸️</span>
            <h3>Inactive</h3>
            <div class="value" style="color: #95a5a6;">${inactiveLicenses}</div>
            <div class="label">Not activated</div>
        </div>
        <div class="stat-card">
            <span class="stat-icon">❌</span>
            <h3>Expired</h3>
            <div class="value" style="color: #e74c3c;">${expiredLicenses}</div>
            <div class="label">Past expiry</div>
        </div>
        <div class="stat-card">
            <span class="stat-icon">🚫</span>
            <h3>Banned</h3>
            <div class="value" style="color: #ff4757;">${bannedLicenses}</div>
            <div class="label">Blocked licenses</div>
        </div>
        <div class="stat-card">
            <span class="stat-icon">🚀</span>
            <h3>Software</h3>
            <div class="value" style="color: #00aaee;">${softwareCount}</div>
            <div class="label"><a href="/admin/software" style="color:#00aaee;text-decoration:none">Manage Products →</a></div>
        </div>
        <div class="stat-card">
            <span class="stat-icon">📣</span>
            <h3>Announcements</h3>
            <div class="value" style="color: #2ecc71;">${activeAnnouncementsCount}</div>
            <div class="label"><a href="/admin/announcements" style="color:#2ecc71;text-decoration:none">Active in API →</a></div>
        </div>
        <div class="stat-card">
            <span class="stat-icon">⚡</span>
            <h3>Cache</h3>
            <div class="value" style="color: #00aaee;">${cacheSize}</div>
            <div class="label">Cached items</div>
        </div>
    </div>
  `;
}

module.exports = { generateStats };
