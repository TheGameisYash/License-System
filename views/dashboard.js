// views/dashboard.js - Updated with software + announcements data
const { CONFIG } = require('../config/constants');
const { isLicenseExpired } = require('../utils/helpers');
const { getStyles } = require('./assets/styles');
const { generateHeader } = require('./components/header');
const { generateStats } = require('./components/stats');
const { generateLicenseGenerationForm, generateSettingsForm, generateBanManagementForm } = require('./components/forms');
const { generateLicenseTable } = require('./components/table');
const { generateModals } = require('./components/modals');
const { generateScripts } = require('./components/scripts');

function generateDashboard(licenses, settings, banlist, recentLogs, cache, pendingRequestsCount, allSoftware = []) {
  const totalLicenses = Object.keys(licenses).length;
  const activeLicenses = Object.values(licenses).filter(l => l.hwid && !isLicenseExpired(l) && !l.banned).length;
  const inactiveLicenses = Object.values(licenses).filter(l => !l.hwid).length;
  const expiredLicenses = Object.values(licenses).filter(l => isLicenseExpired(l)).length;
  const bannedLicenses = Object.values(licenses).filter(l => l.banned).length;
  const softwareCount = allSoftware.length;

  // Count active announcements across all software (we won't load subcollections here, just show software count)
  const activeSoftware = allSoftware.filter(s => s.apiEnabled).length;

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
        ${generateHeader(pendingRequestsCount, softwareCount)}
        ${generateStats(totalLicenses, activeLicenses, inactiveLicenses, expiredLicenses, bannedLicenses, cache.licenseCache.size, softwareCount)}

        <!-- Software Quick Access -->
        ${allSoftware.length > 0 ? `
        <div class="section">
            <h2>🚀 Software Products <a href="/admin/software" style="font-size:13px;color:#00aaee;text-decoration:none;font-weight:400;margin-left:10px">View All →</a></h2>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin-top:12px">
                ${allSoftware.slice(0, 6).map(sw => `
                <a href="/admin/software/${sw.id}" style="text-decoration:none">
                    <div style="background:rgba(26,29,35,0.8);border:1px solid ${sw.apiEnabled ? 'rgba(0,170,238,0.25)' : 'rgba(231,76,60,0.25)'};border-radius:12px;padding:14px;transition:transform 0.2s,border-color 0.2s" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
                        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
                            <span style="font-size:22px">${sw.icon || '🔧'}</span>
                            <span style="font-size:9px;padding:2px 7px;border-radius:8px;font-weight:700;background:${sw.apiEnabled ? 'rgba(46,204,113,0.2)' : 'rgba(231,76,60,0.2)'};color:${sw.apiEnabled ? '#2ecc71' : '#e74c3c'}">${sw.apiEnabled ? '● ON' : '● OFF'}</span>
                        </div>
                        <div style="font-weight:600;color:#e4e6eb;font-size:13px">${sw.name}</div>
                        <div style="font-size:10px;color:#8b8d94;margin-top:3px">${sw.authMode === 'license_credentials' ? '🔐 Credentials' : '🎫 Key Only'} · ${sw.bindingMode === 'hwid' ? '🖥️ HWID' : sw.bindingMode === 'user_id' ? '👤 UserID' : sw.bindingMode === 'hwid_and_user_id' ? '🔒 Both' : '🔓 Free'}</div>
                    </div>
                </a>`).join('')}
                ${allSoftware.length < 6 ? `<a href="/admin/software" style="text-decoration:none"><div style="background:rgba(0,170,238,0.06);border:2px dashed rgba(0,170,238,0.3);border-radius:12px;padding:14px;display:flex;align-items:center;justify-content:center;color:#00aaee;font-size:13px;min-height:95px;cursor:pointer">➕ Add Software</div></a>` : ''}
            </div>
        </div>` : `
        <div class="section" style="border:2px dashed rgba(0,170,238,0.3);text-align:center;padding:30px">
            <div style="font-size:32px;margin-bottom:10px">🚀</div>
            <h3 style="color:#e4e6eb;margin-bottom:8px">No Software Products Yet</h3>
            <p style="color:#8b8d94;margin-bottom:16px;font-size:13px">Create software products to organize licenses by product with per-product auth modes, binding, and announcements.</p>
            <a href="/admin/software" class="btn btn-primary">➕ Create First Software</a>
        </div>`}

        ${generateLicenseGenerationForm(allSoftware)}
        ${generateSettingsForm(settings)}
        ${generateBanManagementForm(banlist)}
        ${generateLicenseTable(licenses, allSoftware)}

        <!-- Recent Activity -->
        ${recentLogs.length > 0 ? `
        <div class="section">
            <h2>📋 Recent Activity</h2>
            <div style="space-y:4px">
                ${recentLogs.map(log => `
                <div style="padding:10px 14px;background:rgba(26,29,35,0.6);border-radius:8px;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center;border-left:3px solid ${log.severity==='high'?'#e74c3c':log.severity==='medium'?'#ffa502':'rgba(255,255,255,0.1)'}">
                    <div>
                        <span style="font-size:12px;font-weight:600;color:#e4e6eb">${log.action}</span>
                        <span style="font-size:11px;color:#8b8d94;margin-left:10px">${log.details||''}</span>
                    </div>
                    <span style="font-size:10px;color:#8b8d94;white-space:nowrap;margin-left:12px">${log.date?new Date(log.date).toLocaleString():''}</span>
                </div>`).join('')}
            </div>
        </div>` : ''}
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
        function showDenyModal(requestId) { document.getElementById('denyRequestId').value = requestId; document.getElementById('denyModal').style.display = 'block'; }
        function closeDenyModal() { document.getElementById('denyModal').style.display = 'none'; }
        window.onclick = function(event) { if (event.target.className === 'modal') event.target.style.display = 'none'; }
    </script>
</body>
</html>
  `;
}

module.exports = { generateDashboard, generateRequestManagementPage };
