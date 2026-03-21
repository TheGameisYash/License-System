// views/components/header.js - Updated with Software + Announcements nav links
const { CONFIG } = require('../../config/constants');

function generateHeader(pendingRequestsCount, softwareCount = 0, announcementsCount = 0) {
  return `
    <div class="header">
        <h1>
            <span>🔐</span>
            Ultra License System
            <span class="header-badge">v${CONFIG.API_VERSION}</span>
        </h1>
        <div class="header-actions">
            <a href="/admin/reset-requests" class="btn btn-warning notification-badge">
                📋 Requests
                ${pendingRequestsCount > 0 ? `<span class="badge">${pendingRequestsCount}</span>` : ''}
            </a>
            <a href="/admin/software" class="btn btn-primary notification-badge">
                🚀 Software
                ${softwareCount > 0 ? `<span class="badge" style="background:#00aaee">${softwareCount}</span>` : ''}
            </a>
            <a href="/admin/announcements" class="btn btn-primary notification-badge">
                📣 Announcements
                ${announcementsCount > 0 ? `<span class="badge" style="background:#2ecc71">${announcementsCount}</span>` : ''}
            </a>
            <a href="/" class="btn btn-primary">🏠 Home</a>
            <form method="post" action="/auth/logout" style="display: inline;">
                <button type="submit" class="btn btn-danger">Logout</button>
            </form>
        </div>
    </div>
  `;
}

module.exports = { generateHeader };
