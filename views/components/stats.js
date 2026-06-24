// views/components/stats.js - Premium Dashboard Metrics Grid
function generateStats(totalLicenses, activeLicenses, inactiveLicenses, expiredLicenses, bannedLicenses, cacheSize, softwareCount = 0, activeAnnouncementsCount = 0) {
  return `
    <div class="stats-grid">
        <div class="stat-card" style="border-left: 3px solid #60a5fa;">
            <span class="stat-icon">📦</span>
            <h3>Total Licenses</h3>
            <div class="value" style="color: #60a5fa;">${totalLicenses}</div>
            <div class="label">All keys in database</div>
        </div>
        <div class="stat-card" style="border-left: 3px solid #10b981;">
            <span class="stat-icon">✅</span>
            <h3>Active</h3>
            <div class="value" style="color: #10b981;">${activeLicenses}</div>
            <div class="label">Active &amp; valid devices</div>
        </div>
        <div class="stat-card" style="border-left: 3px solid #94a3b8;">
            <span class="stat-icon">⏸️</span>
            <h3>Inactive</h3>
            <div class="value" style="color: #94a3b8;">${inactiveLicenses}</div>
            <div class="label">Unregistered keys</div>
        </div>
        <div class="stat-card" style="border-left: 3px solid #f43f5e;">
            <span class="stat-icon">❌</span>
            <h3>Expired</h3>
            <div class="value" style="color: #f43f5e;">${expiredLicenses}</div>
            <div class="label">Keys past expiry</div>
        </div>
        <div class="stat-card" style="border-left: 3px solid #fb7185;">
            <span class="stat-icon">🚫</span>
            <h3>Banned</h3>
            <div class="value" style="color: #fb7185;">${bannedLicenses}</div>
            <div class="label">Blocked keys</div>
        </div>
        <div class="stat-card" style="border-left: 3px solid #a5b4fc;">
            <span class="stat-icon">🚀</span>
            <h3>Software</h3>
            <div class="value" style="color: #a5b4fc;">${softwareCount}</div>
            <div class="label"><a href="/admin/software" style="color: #a5b4fc; text-decoration: none; font-weight: 600;">Manage Products →</a></div>
        </div>
        <div class="stat-card" style="border-left: 3px solid #f59e0b;">
            <span class="stat-icon">📣</span>
            <h3>Announcements</h3>
            <div class="value" style="color: #f59e0b;">${activeAnnouncementsCount}</div>
            <div class="label"><a href="/admin/announcements" style="color: #f59e0b; text-decoration: none; font-weight: 600;">Active Alerts →</a></div>
        </div>
        <div class="stat-card" style="border-left: 3px solid #06b6d4;">
            <span class="stat-icon">⚡</span>
            <h3>Cache</h3>
            <div class="value" style="color: #06b6d4;">${cacheSize}</div>
            <div class="label">Cached elements</div>
        </div>
    </div>
  `;
}

module.exports = { generateStats };
