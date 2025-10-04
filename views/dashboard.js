// views/dashboard.js - COMPLETE MODULAR DASHBOARD (FIXED)
const { CONFIG } = require('../config/constants');
const { isLicenseExpired } = require('../utils/helpers');
const { getStyles } = require('./assets/styles');
const { generateHeader } = require('./components/header');
const { generateStats } = require('./components/stats');
const { 
  generateLicenseGenerationForm, 
  generateSettingsForm, 
  generateBanManagementForm 
} = require('./components/forms');
const { generateLicenseTable } = require('./components/table');
const { generateModals } = require('./components/modals');
const { generateScripts } = require('./components/scripts');

function generateDashboard(licenses, settings, banlist, recentLogs, cache, pendingRequestsCount) {
  // Calculate stats
  const totalLicenses = Object.keys(licenses).length;
  const activeLicenses = Object.values(licenses).filter(l => l.hwid && !isLicenseExpired(l) && !l.banned).length;
  const inactiveLicenses = Object.values(licenses).filter(l => !l.hwid).length;
  const expiredLicenses = Object.values(licenses).filter(l => isLicenseExpired(l)).length;
  const bannedLicenses = Object.values(licenses).filter(l => l.banned).length;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - Ultra License System</title>
    ${getStyles()}
</head>
<body>
    <div class="container">
        ${generateHeader(pendingRequestsCount)}
        ${generateStats(totalLicenses, activeLicenses, inactiveLicenses, expiredLicenses, bannedLicenses, cache.licenseCache.size)}
        ${generateLicenseGenerationForm()}
        ${generateSettingsForm(settings)}
        ${generateBanManagementForm(banlist)}
        ${generateLicenseTable(licenses)}
    </div>
    
    ${generateModals()}
    ${generateScripts()}
</body>
</html>
  `;
}

// Request Management Page
function generateRequestManagementPage(pendingRequests, processedRequests) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Requests - Admin Panel</title>
    ${getStyles()}
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📋 HWID Reset Requests</h1>
            <a href="/admin" class="btn btn-primary">← Back to Dashboard</a>
        </div>
        
        <div class="section">
            <h2>⏳ Pending Requests (${pendingRequests.length})</h2>
            ${pendingRequests.length > 0 ? pendingRequests.map(req => `
                <div style="background: rgba(26, 29, 35, 0.8); border-left: 4px solid #ffa502; border-radius: 12px; padding: 20px; margin-bottom: 15px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                        <span style="font-family: monospace; color: #00aaee; font-weight: 600;">${req.license}</span>
                        <span style="padding: 4px 12px; border-radius: 15px; font-size: 11px; background: rgba(255, 165, 2, 0.2); color: #ffa502;">PENDING</span>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-bottom: 15px; font-size: 13px;">
                        <div><div style="color: #8b8d94; font-size: 11px; margin-bottom: 4px;">HWID</div>${req.hwid}</div>
                        <div><div style="color: #8b8d94; font-size: 11px; margin-bottom: 4px;">REQUESTED</div>${new Date(req.requestedAt).toLocaleString()}</div>
                        <div><div style="color: #8b8d94; font-size: 11px; margin-bottom: 4px;">REASON</div>${req.reason}</div>
                        <div><div style="color: #8b8d94; font-size: 11px; margin-bottom: 4px;">IP</div>${req.ip}</div>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <form method="post" action="/admin/approve-reset-request" style="display: inline;">
                            <input type="hidden" name="requestId" value="${req.id}" />
                            <button type="submit" class="btn btn-success" onclick="return confirm('Approve this request?')">✅ Approve</button>
                        </form>
                        <button onclick="showDenyModal('${req.id}')" class="btn btn-danger">❌ Deny</button>
                    </div>
                </div>
            `).join('') : '<p style="color: #8b8d94;">No pending requests</p>'}
        </div>
        
        <div class="section">
            <h2>✅ Processed Requests (${processedRequests.length})</h2>
            ${processedRequests.length > 0 ? processedRequests.slice(0, 10).map(req => `
                <div style="background: rgba(26, 29, 35, 0.8); border-left: 4px solid ${req.status === 'approved' ? '#2ecc71' : '#e74c3c'}; border-radius: 12px; padding: 20px; margin-bottom: 15px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                        <span style="font-family: monospace; color: #00aaee; font-weight: 600;">${req.license}</span>
                        <span style="padding: 4px 12px; border-radius: 15px; font-size: 11px; background: rgba(${req.status === 'approved' ? '46, 204, 113' : '231, 76, 60'}, 0.2); color: ${req.status === 'approved' ? '#2ecc71' : '#e74c3c'}; text-transform: uppercase;">${req.status}</span>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; font-size: 13px;">
                        <div><div style="color: #8b8d94; font-size: 11px; margin-bottom: 4px;">PROCESSED BY</div>${req.processedBy || 'N/A'}</div>
                        <div><div style="color: #8b8d94; font-size: 11px; margin-bottom: 4px;">PROCESSED AT</div>${req.processedAt ? new Date(req.processedAt).toLocaleString() : 'N/A'}</div>
                        <div><div style="color: #8b8d94; font-size: 11px; margin-bottom: 4px;">NOTE</div>${req.adminNote || 'No note'}</div>
                    </div>
                </div>
            `).join('') : '<p style="color: #8b8d94;">No processed requests</p>'}
        </div>
    </div>
    
    <div id="denyModal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="closeDenyModal()">&times;</span>
            <h2 style="color: #e74c3c; margin-bottom: 20px;">❌ Deny Request</h2>
            <form method="post" action="/admin/deny-reset-request">
                <input type="hidden" name="requestId" id="denyRequestId" />
                <label style="color: #a0a3a8; display: block; margin-bottom: 8px;">Reason:</label>
                <textarea name="reason" placeholder="Why are you denying this?" required style="width: 100%; min-height: 100px;"></textarea>
                <button type="submit" class="btn btn-danger" style="width: 100%; margin-top: 15px;">Deny Request</button>
            </form>
        </div>
    </div>
    
    <script>
        function showDenyModal(requestId) {
            document.getElementById('denyRequestId').value = requestId;
            document.getElementById('denyModal').style.display = 'block';
        }
        function closeDenyModal() {
            document.getElementById('denyModal').style.display = 'none';
        }
        window.onclick = function(event) {
            if (event.target.className === 'modal') event.target.style.display = 'none';
        }
    </script>
</body>
</html>
  `;
}

module.exports = { generateDashboard, generateRequestManagementPage };
