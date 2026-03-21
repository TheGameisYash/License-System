// views/software_page.js - Software Management + Per-Software Detail Page
function generateSoftwarePage(allSoftware, licenseCounts = {}, detail = null) {
  if (detail) return generateSoftwareDetailPage(detail);
  return generateSoftwareListPage(allSoftware, licenseCounts);
}

function authModeBadge(mode) {
  return mode === 'license_credentials'
    ? '<span style="background:rgba(155,89,182,0.2);color:#9b59b6;padding:3px 8px;border-radius:10px;font-size:10px;font-weight:700;">🔐 CREDENTIALS</span>'
    : '<span style="background:rgba(0,170,238,0.2);color:#00aaee;padding:3px 8px;border-radius:10px;font-size:10px;font-weight:700;">🎫 KEY ONLY</span>';
}

function bindingModeBadge(mode) {
  const map = {
    none: '<span style="background:rgba(149,165,166,0.2);color:#95a5a6;padding:3px 8px;border-radius:10px;font-size:10px;font-weight:700;">🔓 NO BINDING</span>',
    hwid: '<span style="background:rgba(52,152,219,0.2);color:#3498db;padding:3px 8px;border-radius:10px;font-size:10px;font-weight:700;">🖥️ HWID</span>',
    user_id: '<span style="background:rgba(46,204,113,0.2);color:#2ecc71;padding:3px 8px;border-radius:10px;font-size:10px;font-weight:700;">👤 USER ID</span>',
    hwid_and_user_id: '<span style="background:rgba(230,126,34,0.2);color:#e67e22;padding:3px 8px;border-radius:10px;font-size:10px;font-weight:700;">🔒 HWID + USER ID</span>'
  };
  return map[mode] || map.hwid;
}

function generateSoftwareListPage(allSoftware, licenseCounts) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Software Management - Admin Panel</title>
  ${getSharedStyles()}
</head>
<body>
<div class="container">
  <div class="header">
    <h1><span>🚀</span> Software Management</h1>
    <div class="header-actions">
      <button onclick="openCreateModal()" class="btn btn-primary">➕ Add Software</button>
      <a href="/admin" class="btn btn-primary">← Dashboard</a>
      <form method="post" action="/auth/logout" style="display:inline"><button type="submit" class="btn btn-danger">Logout</button></form>
    </div>
  </div>

  <div class="stats-grid">
    <div class="stat-card"><span class="stat-icon">📦</span><h3>Total Software</h3><div class="value">${allSoftware.length}</div><div class="label">Products in system</div></div>
    <div class="stat-card"><span class="stat-icon">✅</span><h3>Active</h3><div class="value" style="color:#2ecc71">${allSoftware.filter(s => s.status === 'active' && s.apiEnabled).length}</div><div class="label">API enabled</div></div>
    <div class="stat-card"><span class="stat-icon">🔴</span><h3>Disabled</h3><div class="value" style="color:#e74c3c">${allSoftware.filter(s => !s.apiEnabled).length}</div><div class="label">API off</div></div>
    <div class="stat-card"><span class="stat-icon">🔧</span><h3>Maintenance</h3><div class="value" style="color:#ffa502">${allSoftware.filter(s => s.maintenanceMode).length}</div><div class="label">Under maintenance</div></div>
  </div>

  <div class="section">
    <h2>🚀 All Software Products (${allSoftware.length})</h2>
    ${allSoftware.length === 0 ? '<p style="color:#8b8d94;text-align:center;padding:40px">No software added yet. Click "Add Software" to get started.</p>' : `
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:16px;margin-top:16px">
      ${allSoftware.map(sw => `
      <div style="background:rgba(26,29,35,0.9);border:1px solid ${sw.apiEnabled ? 'rgba(0,170,238,0.3)' : 'rgba(231,76,60,0.3)'};border-radius:16px;padding:20px;position:relative;transition:transform 0.2s" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px">
          <div style="display:flex;align-items:center;gap:10px">
            <span style="font-size:28px">${sw.icon || '🔧'}</span>
            <div>
              <div style="font-weight:700;font-size:16px;color:#e4e6eb">${sw.name}</div>
              <div style="font-size:11px;color:#8b8d94;font-family:monospace">${sw.id}</div>
            </div>
          </div>
          <div style="display:flex;flex-direction:column;gap:4px;align-items:flex-end">
            <span style="padding:4px 10px;border-radius:12px;font-size:10px;font-weight:700;background:${sw.apiEnabled ? 'rgba(46,204,113,0.2)' : 'rgba(231,76,60,0.2)'};color:${sw.apiEnabled ? '#2ecc71' : '#e74c3c'}">${sw.apiEnabled ? '● ONLINE' : '● OFFLINE'}</span>
            ${sw.maintenanceMode ? '<span style="padding:3px 8px;border-radius:10px;font-size:9px;font-weight:700;background:rgba(255,165,2,0.2);color:#ffa502">🔧 MAINTENANCE</span>' : ''}
          </div>
        </div>
        ${sw.description ? `<p style="font-size:12px;color:#8b8d94;margin-bottom:12px">${sw.description}</p>` : ''}
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px">
          ${authModeBadge(sw.authMode)}
          ${bindingModeBadge(sw.bindingMode)}
          <span style="background:rgba(255,255,255,0.05);color:#a0a3a8;padding:3px 8px;border-radius:10px;font-size:10px">v${sw.latestVersion || '1.0.0'}</span>
          <span style="background:rgba(255,255,255,0.05);color:#a0a3a8;padding:3px 8px;border-radius:10px;font-size:10px">Max ${sw.maxDevices} device(s)</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;padding-top:12px;border-top:1px solid rgba(255,255,255,0.06)">
          <span style="font-size:12px;color:#8b8d94">🎫 ${licenseCounts[sw.id] || 0} licenses</span>
          <div style="display:flex;gap:8px">
            <button onclick="toggleAPI('${sw.id}', this)" class="btn ${sw.apiEnabled ? 'btn-warning' : 'btn-success'}" style="padding:6px 12px;font-size:11px" data-enabled="${sw.apiEnabled}">${sw.apiEnabled ? 'Disable API' : 'Enable API'}</button>
            <a href="/admin/software/${sw.id}" class="btn btn-primary" style="padding:6px 12px;font-size:11px">⚙️ Manage</a>
          </div>
        </div>
      </div>
      `).join('')}
    </div>`}
  </div>
</div>

<!-- Create Software Modal -->
<div id="createModal" class="modal">
  <div class="modal-content" style="max-width:650px">
    <span class="close" onclick="closeCreateModal()">&times;</span>
    <h2 style="color:#00aaee;margin-bottom:20px">🚀 Add New Software</h2>
    <form method="post" action="/admin/software/create">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div style="grid-column:1/-1"><label class="form-label">Software Name *</label><input name="name" placeholder="e.g. My Game Hack" required style="width:100%" /></div>
        <div><label class="form-label">Icon (emoji)</label><input name="icon" placeholder="🔧" value="🔧" style="width:100%" /></div>
        <div><label class="form-label">Brand Color</label><input name="color" type="color" value="#00aaee" style="width:100%;height:42px;padding:4px" /></div>
        <div style="grid-column:1/-1"><label class="form-label">Description</label><input name="description" placeholder="Short description" style="width:100%" /></div>
        <div>
          <label class="form-label">Auth Mode</label>
          <select name="authMode" style="width:100%" onchange="toggleCredentialsInfo(this)">
            <option value="license_only">🎫 License Key Only</option>
            <option value="license_credentials">🔐 License + Username/Password</option>
          </select>
        </div>
        <div>
          <label class="form-label">Binding Mode</label>
          <select name="bindingMode" style="width:100%">
            <option value="hwid">🖥️ HWID (Hardware Lock)</option>
            <option value="user_id">👤 User ID Lock</option>
            <option value="hwid_and_user_id">🔒 HWID + User ID</option>
            <option value="none">🔓 No Binding</option>
          </select>
        </div>
        <div><label class="form-label">Max Devices Per License</label><input name="maxDevices" type="number" value="1" min="1" max="100" style="width:100%" /></div>
        <div><label class="form-label">License Prefix</label><input name="licensePrefix" placeholder="e.g. PRO, GAME" style="width:100%" /></div>
        <div><label class="form-label">Latest Version</label><input name="latestVersion" placeholder="1.0.0" value="1.0.0" style="width:100%" /></div>
        <div><label class="form-label">Download URL</label><input name="downloadUrl" placeholder="https://..." style="width:100%" /></div>
        <div style="grid-column:1/-1"><label class="form-label">Discord Webhook URL (per-software)</label><input name="webhookUrl" placeholder="https://discord.com/api/webhooks/..." style="width:100%" /></div>
        <div style="display:flex;align-items:center;gap:10px">
          <label class="toggle-switch"><input type="checkbox" name="versionCheck" value="true" /><span class="toggle-slider"></span></label>
          <span style="color:#a0a3a8;font-size:13px">Enable Version Check in API</span>
        </div>
        <div style="display:flex;align-items:center;gap:10px">
          <label class="toggle-switch"><input type="checkbox" name="allowSelfReset" value="true" /><span class="toggle-slider"></span></label>
          <span style="color:#a0a3a8;font-size:13px">Allow Self HWID Reset</span>
        </div>
        <div><label class="form-label">Self Reset Cooldown (hours)</label><input name="selfResetCooldown" type="number" value="24" min="0" style="width:100%" /></div>
      </div>
      <button type="submit" class="btn btn-primary" style="width:100%;margin-top:20px">Create Software</button>
    </form>
  </div>
</div>

<script>
function openCreateModal() { document.getElementById('createModal').style.display = 'block'; }
function closeCreateModal() { document.getElementById('createModal').style.display = 'none'; }
window.onclick = e => { if (e.target.className === 'modal') e.target.style.display = 'none'; };

async function toggleAPI(id, btn) {
  const res = await fetch('/admin/software/' + id + '/toggle-api', { method: 'POST' });
  const json = await res.json();
  if (json.success) {
    btn.textContent = json.apiEnabled ? 'Disable API' : 'Enable API';
    btn.className = json.apiEnabled ? 'btn btn-warning' : 'btn btn-success';
    btn.closest('div[style*="border"]').style.borderColor = json.apiEnabled ? 'rgba(0,170,238,0.3)' : 'rgba(231,76,60,0.3)';
    const badge = btn.closest('div[style*="border"]').querySelector('span[style*="ONLINE"], span[style*="OFFLINE"]');
    if (badge) { badge.textContent = json.apiEnabled ? '● ONLINE' : '● OFFLINE'; badge.style.color = json.apiEnabled ? '#2ecc71' : '#e74c3c'; }
  }
}
</script>
</body></html>`;
}

function generateSoftwareDetailPage({ software: sw, licenses, announcements, users }) {
  const { getStyles } = require('./assets/styles');
  const { isLicenseExpired } = require('../utils/helpers');
  const licenseEntries = Object.entries(licenses);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${sw.name} - Admin Panel</title>
  ${getSharedStyles()}
</head>
<body>
<div class="container">
  <div class="header">
    <h1><span>${sw.icon || '🔧'}</span> ${sw.name} <span class="header-badge">v${sw.latestVersion || '1.0.0'}</span></h1>
    <div class="header-actions">
      <a href="/admin/software" class="btn btn-primary">← Software List</a>
      <a href="/admin" class="btn btn-primary">🏠 Dashboard</a>
    </div>
  </div>

  <!-- Status Badges -->
  <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:20px">
    ${authModeBadge(sw.authMode)} ${bindingModeBadge(sw.bindingMode)}
    <span style="background:${sw.apiEnabled ? 'rgba(46,204,113,0.2)' : 'rgba(231,76,60,0.2)'};color:${sw.apiEnabled ? '#2ecc71' : '#e74c3c'};padding:4px 12px;border-radius:12px;font-size:11px;font-weight:700">${sw.apiEnabled ? '✅ API Enabled' : '🔴 API Disabled'}</span>
    ${sw.maintenanceMode ? '<span style="background:rgba(255,165,2,0.2);color:#ffa502;padding:4px 12px;border-radius:12px;font-size:11px;font-weight:700">🔧 Maintenance Mode ON</span>' : ''}
  </div>

  <!-- Settings Form -->
  <div class="section">
    <h2>⚙️ Software Settings</h2>
    <form method="post" action="/admin/software/${sw.id}/update">
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px">
        <div><label class="form-label">Name</label><input name="name" value="${sw.name}" required style="width:100%" /></div>
        <div><label class="form-label">Icon</label><input name="icon" value="${sw.icon || '🔧'}" style="width:100%" /></div>
        <div><label class="form-label">Description</label><input name="description" value="${sw.description || ''}" style="width:100%" /></div>
        <div>
          <label class="form-label">Auth Mode</label>
          <select name="authMode" style="width:100%">
            <option value="license_only" ${sw.authMode === 'license_only' ? 'selected' : ''}>🎫 License Key Only</option>
            <option value="license_credentials" ${sw.authMode === 'license_credentials' ? 'selected' : ''}>🔐 License + Credentials</option>
          </select>
        </div>
        <div>
          <label class="form-label">Binding Mode</label>
          <select name="bindingMode" style="width:100%">
            <option value="hwid" ${sw.bindingMode === 'hwid' ? 'selected' : ''}>🖥️ HWID</option>
            <option value="user_id" ${sw.bindingMode === 'user_id' ? 'selected' : ''}>👤 User ID</option>
            <option value="hwid_and_user_id" ${sw.bindingMode === 'hwid_and_user_id' ? 'selected' : ''}>🔒 HWID + User ID</option>
            <option value="none" ${sw.bindingMode === 'none' ? 'selected' : ''}>🔓 No Binding</option>
          </select>
        </div>
        <div><label class="form-label">Max Devices</label><input name="maxDevices" type="number" value="${sw.maxDevices || 1}" min="1" style="width:100%" /></div>
        <div><label class="form-label">Latest Version</label><input name="latestVersion" value="${sw.latestVersion || '1.0.0'}" style="width:100%" /></div>
        <div><label class="form-label">Download URL</label><input name="downloadUrl" value="${sw.downloadUrl || ''}" style="width:100%" /></div>
        <div><label class="form-label">License Prefix</label><input name="licensePrefix" value="${sw.licensePrefix || ''}" style="width:100%" /></div>
        <div><label class="form-label">Discord Webhook</label><input name="webhookUrl" value="${sw.webhookUrl || ''}" style="width:100%" /></div>
        <div><label class="form-label">Maintenance Message</label><input name="maintenanceMessage" value="${sw.maintenanceMessage || ''}" placeholder="e.g. Server update in progress..." style="width:100%" /></div>
        <div><label class="form-label">Self Reset Cooldown (hrs)</label><input name="selfResetCooldown" type="number" value="${sw.selfResetCooldown || 24}" min="0" style="width:100%" /></div>
      </div>
      <div style="display:flex;gap:20px;flex-wrap:wrap;margin:20px 0">
        ${[['versionCheck','Version Check in API',sw.versionCheck],['allowSelfReset','Allow Self HWID Reset',sw.allowSelfReset],['maintenanceMode','Maintenance Mode',sw.maintenanceMode]].map(([n,l,v])=>`
        <label style="display:flex;align-items:center;gap:10px;cursor:pointer">
          <label class="toggle-switch"><input type="checkbox" name="${n}" value="true" ${v?'checked':''}><span class="toggle-slider"></span></label>
          <span style="color:#a0a3a8;font-size:13px">${l}</span>
        </label>`).join('')}
      </div>
      <div style="display:flex;gap:10px">
        <button type="submit" class="btn btn-success">💾 Save Settings</button>
        <button type="button" onclick="toggleMaintenance('${sw.id}')" class="btn btn-warning">⚡ Quick Maintenance Toggle</button>
        <button type="button" onclick="toggleAPI('${sw.id}')" class="btn ${sw.apiEnabled ? 'btn-danger' : 'btn-success'}">⚡ Quick API Toggle</button>
        <form method="post" action="/admin/software/${sw.id}/delete" style="display:inline">
          <button type="submit" class="btn btn-danger" onclick="return confirm('Delete ${sw.name}? All announcements and users will be removed. Licenses will NOT be deleted.')">🗑️ Delete Software</button>
        </form>
      </div>
    </form>
  </div>

  <!-- Licenses for this software -->
  <div class="section">
    <h2>🎫 Licenses (${licenseEntries.length})</h2>
    <form method="post" action="/admin/generate-license" style="margin-bottom:16px">
      <input type="hidden" name="softwareId" value="${sw.id}" />
      <div class="form-grid">
        <input name="license" placeholder="Custom Key (optional)" />
        <input name="expiry" type="date" />
        <button type="submit" class="btn btn-primary">Generate for ${sw.name}</button>
      </div>
    </form>
    ${licenseEntries.length === 0 ? '<p style="color:#8b8d94">No licenses yet for this software.</p>' : `
    <div class="table-container">
      <table id="licenseTable">
        <thead><tr><th>License Key</th><th>Device / HWID</th><th>User ID</th><th>Expiry</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          ${licenseEntries.map(([key, val]) => {
            const expired = isLicenseExpired(val);
            const banned = val.banned;
            const active = val.hwid && !expired && !banned;
            const st = banned ? '🚫 BANNED' : expired ? '🔴 EXPIRED' : active ? '🟢 ACTIVE' : '🟡 INACTIVE';
            const sc = banned ? 'banned' : expired ? 'expired' : active ? 'active' : 'inactive';
            return `<tr>
              <td><div class="license-key" onclick="copyToClipboard('${key}')" title="Copy">${key}</div></td>
              <td>${val.hwid ? `<div style="font-size:12px;color:#00aaee">${val.deviceName || 'Unknown'}</div><div class="hwid-display">${val.hwid.substring(0,20)}...</div>` : '<span style="color:#8b8d94">Not activated</span>'}</td>
              <td><span style="font-size:12px;color:#a0a3a8">${val.userId || '-'}</span></td>
              <td>${val.expiry ? `<div>${new Date(val.expiry).toLocaleDateString()}</div><div style="font-size:10px;color:${expired?'#e74c3c':'#2ecc71'}">${expired?'Expired':Math.ceil((new Date(val.expiry)-Date.now())/86400000)+' days'}</div>` : '<span style="color:#2ecc71">Never</span>'}</td>
              <td><span class="status ${sc}">${st}</span></td>
              <td><div style="display:flex;gap:6px">
                ${val.hwid ? `<form method="post" action="/admin/reset-hwid" style="display:inline"><input type="hidden" name="license" value="${key}"><button class="btn btn-warning" style="padding:5px 10px;font-size:11px" onclick="return confirm('Reset HWID?')">↻</button></form>` : ''}
                <form method="post" action="/admin/delete-license" style="display:inline"><input type="hidden" name="license" value="${key}"><button class="btn btn-danger" style="padding:5px 10px;font-size:11px" onclick="return confirm('Delete?')">🗑️</button></form>
              </div></td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`}
  </div>

  <!-- Announcements for this software -->
  <div class="section">
    <h2>📣 Announcements (${announcements.length})</h2>
    <form method="post" action="/admin/announcements/create" style="margin-bottom:16px">
      <input type="hidden" name="softwareId" value="${sw.id}" />
      <div class="form-grid">
        <input name="title" placeholder="Title" required />
        <select name="type">
          <option value="info">ℹ️ Info</option>
          <option value="warning">⚠️ Warning</option>
          <option value="offer">🎁 Offer</option>
          <option value="update">🔄 Update</option>
        </select>
        <input name="expiresAt" type="datetime-local" title="Expires at (optional)" />
        <button type="submit" class="btn btn-primary">Add</button>
      </div>
      <textarea name="message" placeholder="Message..." required style="width:100%;min-height:80px;margin-top:8px;resize:vertical"></textarea>
    </form>
    ${announcements.length === 0 ? '<p style="color:#8b8d94">No announcements yet.</p>' : announcements.map(a => {
      const typeColor = {info:'#00aaee',warning:'#ffa502',offer:'#2ecc71',update:'#9b59b6'}[a.type]||'#00aaee';
      return `<div style="border-left:4px solid ${typeColor};background:rgba(26,29,35,0.9);border-radius:12px;padding:16px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:flex-start">
        <div>
          <div style="font-weight:700;color:#e4e6eb;margin-bottom:4px">${a.title} <span style="font-size:10px;background:rgba(255,255,255,0.06);padding:2px 8px;border-radius:8px;color:${typeColor}">${a.type?.toUpperCase()}</span>${!a.active?'<span style="font-size:10px;color:#8b8d94;margin-left:6px">INACTIVE</span>':''}</div>
          <div style="font-size:13px;color:#a0a3a8">${a.message}</div>
          ${a.expiresAt?`<div style="font-size:11px;color:#8b8d94;margin-top:4px">Expires: ${new Date(a.expiresAt).toLocaleString()}</div>`:''}
        </div>
        <div style="display:flex;gap:6px;flex-shrink:0;margin-left:12px">
          <button onclick="toggleAnnouncement('${sw.id}','${a.id}',this)" class="btn ${a.active?'btn-warning':'btn-success'}" style="padding:5px 10px;font-size:11px">${a.active?'Deactivate':'Activate'}</button>
          <form method="post" action="/admin/announcements/${sw.id}/${a.id}/delete" style="display:inline"><button class="btn btn-danger" style="padding:5px 10px;font-size:11px" onclick="return confirm('Delete?')">🗑️</button></form>
        </div>
      </div>`;
    }).join('')}
  </div>

  ${sw.authMode === 'license_credentials' ? `
  <!-- Software Users -->
  <div class="section">
    <h2>👥 Users (${users.length})</h2>
    <form method="post" action="/admin/software/${sw.id}/users/add" style="margin-bottom:16px">
      <div class="form-grid">
        <input name="username" placeholder="Username" required />
        <input name="password" type="password" placeholder="Password" required />
        <input name="licenseKey" placeholder="Link License Key (optional)" />
        <button type="submit" class="btn btn-primary">Add User</button>
      </div>
    </form>
    ${users.length === 0 ? '<p style="color:#8b8d94">No users yet.</p>' : `
    <div class="table-container"><table>
      <thead><tr><th>Username</th><th>License</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead>
      <tbody>
        ${users.map(u=>`<tr>
          <td style="font-family:monospace;color:#00aaee">${u.username}</td>
          <td style="font-family:monospace;font-size:11px">${u.licenseKey||'-'}</td>
          <td><span class="status ${u.status==='active'?'active':'banned'}">${u.status==='active'?'🟢 ACTIVE':'🚫 BANNED'}</span></td>
          <td style="font-size:11px;color:#8b8d94">${u.createdAt?new Date(u.createdAt).toLocaleDateString():'-'}</td>
          <td><div style="display:flex;gap:6px">
            ${u.status==='active'?`<form method="post" action="/admin/software/${sw.id}/users/ban" style="display:inline"><input type="hidden" name="username" value="${u.username}"><button class="btn btn-danger" style="padding:5px 10px;font-size:11px" onclick="return confirm('Ban ${u.username}?')">🚫</button></form>`:`<form method="post" action="/admin/software/${sw.id}/users/unban" style="display:inline"><input type="hidden" name="username" value="${u.username}"><button class="btn btn-success" style="padding:5px 10px;font-size:11px">✅</button></form>`}
            <form method="post" action="/admin/software/${sw.id}/users/delete" style="display:inline"><input type="hidden" name="username" value="${u.username}"><button class="btn btn-danger" style="padding:5px 10px;font-size:11px" onclick="return confirm('Delete?')">🗑️</button></form>
          </div></td>
        </tr>`).join('')}
      </tbody>
    </table></div>`}
  </div>` : ''}
</div>

<script>
async function toggleAnnouncement(swId, annId, btn) {
  const res = await fetch('/admin/announcements/'+swId+'/'+annId+'/toggle', {method:'POST'});
  const json = await res.json();
  if (json.success) { btn.textContent = json.active ? 'Deactivate' : 'Activate'; btn.className = json.active ? 'btn btn-warning' : 'btn btn-success'; }
}
async function toggleMaintenance(id) {
  const res = await fetch('/admin/software/'+id+'/toggle-maintenance', {method:'POST'});
  const json = await res.json();
  if (json.success) alert('Maintenance mode: ' + (json.maintenanceMode ? 'ON' : 'OFF') + ' (refresh to see changes)');
}
async function toggleAPI(id) {
  const res = await fetch('/admin/software/'+id+'/toggle-api', {method:'POST'});
  const json = await res.json();
  if (json.success) alert('API: ' + (json.apiEnabled ? 'ENABLED' : 'DISABLED') + ' (refresh to see changes)');
}
function copyToClipboard(text) { navigator.clipboard.writeText(text).then(()=>{ const t=document.createElement('div');t.textContent='✅ Copied!';t.style.cssText='position:fixed;bottom:20px;right:20px;background:#2ecc71;color:#fff;padding:10px 20px;border-radius:10px;z-index:9999';document.body.appendChild(t);setTimeout(()=>t.remove(),2000); }); }
</script>
</body></html>`;
}

function getSharedStyles() {
  try { return require('./assets/styles').getStyles(); } catch(e) { return '<style>body{background:#0d0f14;color:#e4e6eb;font-family:sans-serif}</style>'; }
}

module.exports = { generateSoftwarePage };
