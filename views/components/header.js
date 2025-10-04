// views/components/header.js
const { CONFIG } = require('../../config/constants');

function generateHeader(pendingRequestsCount) {
  return `
    <div class="header">
        <h1>
            <span>🔐</span>
            Ultra License System
            <span class="header-badge">v${CONFIG.API_VERSION}</span>
        </h1>
        <div class="header-actions">
            <a href="/admin/reset-requests" class="btn btn-warning notification-badge">
                📋 Reset Requests
                ${pendingRequestsCount > 0 ? `<span class="badge">${pendingRequestsCount}</span>` : ''}
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
