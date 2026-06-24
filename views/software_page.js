// views/software_page.js - Software Management + Detail Screens
function generateSoftwarePage(allSoftware, licenseCounts = {}, detail = null) {
  if (detail) return generateSoftwareDetailPage(detail);
  return generateSoftwareListPage(allSoftware, licenseCounts);
}

function authModeBadge(mode) {
  return mode === 'license_credentials'
    ? '<span class="status" style="background: rgba(165, 180, 252, 0.1); color: #a5b4fc; border: 1px solid rgba(165, 180, 252, 0.3);">🔐 CREDENTIALS</span>'
    : '<span class="status" style="background: rgba(99, 102, 241, 0.1); color: #818cf8; border: 1px solid rgba(99, 102, 241, 0.25);">🎫 KEY ONLY</span>';
}

function bindingModeBadge(mode) {
  const map = {
    none: '<span class="status" style="background: rgba(148, 163, 184, 0.1); color: #94a3b8; border: 1px solid rgba(148, 163, 184, 0.25);">🔓 NO BIND</span>',
    hwid: '<span class="status" style="background: rgba(6, 182, 212, 0.1); color: #22d3ee; border: 1px solid rgba(6, 182, 212, 0.25);">🖥️ HWID LOCK</span>',
    user_id: '<span class="status" style="background: rgba(16, 185, 129, 0.1); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.25);">👤 USER ID</span>',
    hwid_and_user_id: '<span class="status" style="background: rgba(245, 158, 11, 0.1); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.25);">🔒 HWID &amp; USER</span>'
  };
  return map[mode] || map.hwid;
}

function generateSoftwareListPage(allSoftware, licenseCounts) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Software Products - Admin Panel</title>
  ${getSharedStyles()}
</head>
<body>
<div class="container">
  <div class="header">
    <h1><span>🚀</span> Software Product Catalog</h1>
    <div class="header-actions">
      <button onclick="openCreateModal()" class="btn btn-primary">➕ Add Software Product</button>
      <a href="/admin" class="btn btn-primary">← Dashboard</a>
    </div>
  </div>

  <div class="stats-grid">
    <div class="stat-card" style="border-left: 3px solid #60a5fa;"><span class="stat-icon">📦</span><h3>Total Software</h3><div class="value" style="color: #60a5fa;">${allSoftware.length}</div><div class="label">Configured software products</div></div>
    <div class="stat-card" style="border-left: 3px solid #10b981;"><span class="stat-icon">✅</span><h3>Active</h3><div class="value" style="color: #10b981;">${allSoftware.filter(s => s.status === 'active' && s.apiEnabled).length}</div><div class="label">API gateways active</div></div>
    <div class="stat-card" style="border-left: 3px solid #f43f5e;"><span class="stat-icon">🔴</span><h3>Suspended</h3><div class="value" style="color: #f43f5e;">${allSoftware.filter(s => !s.apiEnabled).length}</div><div class="label">API gateway disabled</div></div>
    <div class="stat-card" style="border-left: 3px solid #f59e0b;"><span class="stat-icon">🔧</span><h3>Maintenance</h3><div class="value" style="color: #f59e0b;">${allSoftware.filter(s => s.maintenanceMode).length}</div><div class="label">In maintenance mode</div></div>
  </div>

  <div class="section">
    <h2>🚀 Software Products (${allSoftware.length})</h2>
    ${allSoftware.length === 0 ? '<p style="color:#64748b;text-align:center;padding:40px;font-style:italic;">No products added yet. Click "Add Software Product" to initialize your first software licensing database.</p>' : `
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:16px;margin-top:16px">
      ${allSoftware.map(sw => `
      <div style="background:rgba(13,18,30,0.5);border:1px solid ${sw.apiEnabled ? 'rgba(99,102,241,0.2)' : 'rgba(244,63,94,0.2)'};border-radius:16px;padding:20px;position:relative;transition:all 0.3s cubic-bezier(0.4, 0, 0.2, 1);box-shadow: 0 4px 20px rgba(0,0,0,0.25);" onmouseover="this.style.transform='translateY(-4px)';this.style.borderColor='rgba(99,102,241,0.45)';" onmouseout="this.style.transform='none';this.style.borderColor='${sw.apiEnabled ? 'rgba(99,102,241,0.2)' : 'rgba(244,63,94,0.2)'}';">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px">
          <div style="display:flex;align-items:center;gap:12px">
            <span style="font-size:32px;filter: drop-shadow(0 4px 10px rgba(0,0,0,0.3));">${sw.icon || '🔧'}</span>
            <div>
              <div style="font-weight:700;font-size:16px;color:#f8fafc">${sw.name}</div>
              <div style="font-size:11px;color:#64748b;font-family:'JetBrains Mono',monospace;margin-top:2px;">${sw.id}</div>
            </div>
          </div>
          <div style="display:flex;flex-direction:column;gap:4px;align-items:flex-end">
            <span class="status ${sw.apiEnabled ? 'active' : 'expired'}" style="font-size: 9px;">${sw.apiEnabled ? '● ONLINE' : '● OFFLINE'}</span>
            ${sw.maintenanceMode ? '<span class="status banned" style="font-size:9px;animation:none;background:rgba(245,158,11,0.15);color:#f59e0b;border-color:rgba(245,158,11,0.3)">🔧 MAINTENANCE</span>' : ''}
          </div>
        </div>
        ${sw.description ? `<p style="font-size:12px;color:#94a3b8;margin-bottom:14px;line-height:1.5">${sw.description}</p>` : ''}
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px">
          ${authModeBadge(sw.authMode)}
          ${bindingModeBadge(sw.bindingMode)}
          <span class="status inactive" style="font-size:9px;">v${sw.latestVersion || '1.0.0'}</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;padding-top:14px;border-top:1px solid rgba(255,255,255,0.06)">
          <span style="font-size:12px;color:#64748b;font-weight:600;">🎫 ${licenseCounts[sw.id] || 0} licenses</span>
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
    <h2 style="color:#818cf8;margin-bottom:20px;border-bottom:1px solid rgba(255,255,255,0.06);padding-bottom:10px">🚀 Add New Software Product</h2>
    <form method="post" action="/admin/software/create">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div style="grid-column:1/-1"><label class="form-label">Software Name *</label><input name="name" placeholder="e.g. PCRemote Ultimate" required style="width:100%" /></div>
        <div><label class="form-label">Icon (emoji)</label><input name="icon" placeholder="🔧" value="🔧" style="width:100%" /></div>
        <div><label class="form-label">Brand Color</label><input name="color" type="color" value="#6366f1" style="width:100%;height:38px;padding:2px" /></div>
        <div style="grid-column:1/-1"><label class="form-label">Description</label><input name="description" placeholder="A brief description of this software client" style="width:100%" /></div>
        <div>
          <label class="form-label">Authentication Mode</label>
          <select name="authMode" style="width:100%">
            <option value="license_only">🎫 License Key Only</option>
            <option value="license_credentials">🔐 License + Credentials</option>
          </select>
        </div>
        <div>
          <label class="form-label">Device Lock Boundary</label>
          <select name="bindingMode" style="width:100%">
            <option value="hwid">🖥️ HWID (Hardware Lock)</option>
            <option value="user_id">👤 User ID Lock</option>
            <option value="hwid_and_user_id">🔒 HWID + User ID</option>
            <option value="none">🔓 No Binding (Free Float)</option>
          </select>
        </div>
        <div><label class="form-label">Max Devices Per License</label><input name="maxDevices" type="number" value="1" min="1" max="100" style="width:100%" /></div>
        <div><label class="form-label">License Key Prefix</label><input name="licensePrefix" placeholder="e.g. PCR, PREM" style="width:100%" /></div>
        <div><label class="form-label">Latest Version</label><input name="latestVersion" placeholder="1.0.0" value="1.0.0" style="width:100%" /></div>
        <div><label class="form-label">Download URL</label><input name="downloadUrl" placeholder="https://domain.com/download" style="width:100%" /></div>
        <div style="grid-column:1/-1"><label class="form-label">Discord Notification Webhook (Overriding global)</label><input name="webhookUrl" placeholder="https://discord.com/api/webhooks/..." style="width:100%" /></div>
        
        <div style="grid-column: 1/-1; display: flex; gap: 16px; margin: 8px 0; flex-wrap: wrap;">
            <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
              <label class="toggle-switch"><input type="checkbox" name="versionCheck" value="true" /><span class="toggle-slider"></span></label>
              <span style="color:#cbd5e1;font-size:12px;font-weight:600;">Enable Version Validation</span>
            </label>
            <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
              <label class="toggle-switch"><input type="checkbox" name="allowSelfReset" value="true" /><span class="toggle-slider"></span></label>
              <span style="color:#cbd5e1;font-size:12px;font-weight:600;">Allow Self HWID Reset</span>
            </label>
        </div>
        <div><label class="form-label">Self Reset Cooldown (hours)</label><input name="selfResetCooldown" type="number" value="24" min="0" style="width:100%" /></div>
      </div>
      <button type="submit" class="btn btn-primary" style="width:100%;margin-top:20px">🚀 Initialize Software Product</button>
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
    btn.closest('div[style*="border"]').style.borderColor = json.apiEnabled ? 'rgba(99,102,241,0.2)' : 'rgba(244,63,94,0.2)';
    const badge = btn.closest('div[style*="border"]').querySelector('.status');
    if (badge) { 
      badge.textContent = json.apiEnabled ? '● ONLINE' : '● OFFLINE'; 
      badge.className = json.apiEnabled ? 'status active' : 'status expired';
    }
  }
}
</script>
</body></html>`;
}

function generateSoftwareDetailPage({ software: sw, licenses, announcements, users }) {
  const { isLicenseExpired } = require('../utils/helpers');
  const licenseEntries = Object.entries(licenses);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${sw.name} Management - Admin Panel</title>
  ${getSharedStyles()}
</head>
<body>
<div class="container">
  <div class="header">
    <h1><span>${sw.icon || '🔧'}</span> ${sw.name} <span class="header-badge">v${sw.latestVersion || '1.0.0'}</span></h1>
    <div class="header-actions">
      <a href="/admin/software" class="btn btn-primary">← Product List</a>
      <a href="/admin" class="btn btn-primary">🏠 Dashboard</a>
    </div>
  </div>

  <!-- Status Badges -->
  <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:24px">
    ${authModeBadge(sw.authMode)} 
    ${bindingModeBadge(sw.bindingMode)}
    <span class="status ${sw.apiEnabled ? 'active' : 'expired'}" style="font-size: 11px; padding: 4px 12px; font-weight: 700;">${sw.apiEnabled ? '✅ API Gateway Active' : '🔴 API Gateway Disabled'}</span>
    ${sw.maintenanceMode ? '<span class="status banned" style="font-size: 11px; padding: 4px 12px; font-weight: 700; animation: none;">🔧 Maintenance Lock Active</span>' : ''}
  </div>

  <!-- Software Product API Key Protection -->
  <div class="section" style="padding: 16px 20px; display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 24px; border-color: rgba(99, 102, 241, 0.2); background: rgba(99, 102, 241, 0.03);">
    <div style="display: flex; align-items: center; gap: 12px;">
      <span style="font-size: 18px;">🔑</span>
      <div>
        <div style="font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Client SDK API Secret Key (Keep Private)</div>
        <div style="font-family: 'JetBrains Mono', monospace; font-size: 13px; color: #a5b4fc; margin-top: 4px; font-weight: 700;">${sw.apiKey || 'Not configured'}</div>
      </div>
    </div>
    <button onclick="copyToClipboard('${sw.apiKey || ''}')" class="btn btn-primary" style="padding: 8px 16px; font-size: 12px;">📋 Copy SDK Key</button>
  </div>

  <!-- Settings Form -->
  <div class="section">
    <h2>⚙️ Product Configurations</h2>
    <form method="post" action="/admin/software/${sw.id}/update">
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px">
        <div><label class="form-label">Name</label><input name="name" value="${sw.name}" required style="width:100%" /></div>
        <div><label class="form-label">Icon (emoji)</label><input name="icon" value="${sw.icon || '🔧'}" style="width:100%" /></div>
        <div><label class="form-label">Description</label><input name="description" value="${sw.description || ''}" style="width:100%" /></div>
        <div>
          <label class="form-label">Auth Mode</label>
          <select name="authMode" style="width:100%">
            <option value="license_only" ${sw.authMode === 'license_only' ? 'selected' : ''}>🎫 License Key Only</option>
            <option value="license_credentials" ${sw.authMode === 'license_credentials' ? 'selected' : ''}>🔐 License + Credentials</option>
          </select>
        </div>
        <div>
          <label class="form-label">Device Lock Boundary</label>
          <select name="bindingMode" style="width:100%">
            <option value="hwid" ${sw.bindingMode === 'hwid' ? 'selected' : ''}>🖥️ HWID Lock</option>
            <option value="user_id" ${sw.bindingMode === 'user_id' ? 'selected' : ''}>👤 User ID Lock</option>
            <option value="hwid_and_user_id" ${sw.bindingMode === 'hwid_and_user_id' ? 'selected' : ''}>🔒 HWID + User ID</option>
            <option value="none" ${sw.bindingMode === 'none' ? 'selected' : ''}>🔓 No Binding</option>
          </select>
        </div>
        <div><label class="form-label">Max Devices per Key</label><input name="maxDevices" type="number" value="${sw.maxDevices || 1}" min="1" style="width:100%" /></div>
        <div><label class="form-label">Latest Version</label><input name="latestVersion" value="${sw.latestVersion || '1.0.0'}" style="width:100%" /></div>
        <div><label class="form-label">Download URL</label><input name="downloadUrl" value="${sw.downloadUrl || ''}" style="width:100%" /></div>
        <div><label class="form-label">License Key Prefix</label><input name="licensePrefix" value="${sw.licensePrefix || ''}" style="width:100%" /></div>
        <div><label class="form-label">Discord Webhook</label><input name="webhookUrl" value="${sw.webhookUrl || ''}" style="width:100%" /></div>
        <div><label class="form-label">Maintenance Notice</label><input name="maintenanceMessage" value="${sw.maintenanceMessage || ''}" placeholder="e.g. Services updating..." style="width:100%" /></div>
        <div><label class="form-label">Self Reset Cooldown (hours)</label><input name="selfResetCooldown" type="number" value="${sw.selfResetCooldown || 24}" min="0" style="width:100%" /></div>
      </div>
      
      <div style="display:flex;gap:20px;flex-wrap:wrap;margin:24px 0">
        ${[
          ['versionCheck', 'Enforce Version Check', sw.versionCheck],
          ['allowSelfReset', 'Allow Self HWID Reset', sw.allowSelfReset],
          ['maintenanceMode', 'Lock in Maintenance Mode', sw.maintenanceMode]
        ].map(([n,l,v])=>`
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
          <label class="toggle-switch"><input type="checkbox" name="${n}" value="true" ${v?'checked':''}><span class="toggle-slider"></span></label>
          <span style="color:#cbd5e1;font-size:12px;font-weight:600">${l}</span>
        </label>`).join('')}
      </div>
      
      <div style="display:flex;gap:10px;flex-wrap:wrap;border-top:1px solid rgba(255,255,255,0.06);padding-top:20px;">
        <button type="submit" class="btn btn-success">💾 Save Configurations</button>
        <button type="button" onclick="toggleMaintenance('${sw.id}')" class="btn btn-warning">⚡ Toggle Maintenance</button>
        <button type="button" onclick="toggleAPI('${sw.id}')" class="btn ${sw.apiEnabled ? 'btn-danger' : 'btn-success'}">${sw.apiEnabled ? '🔴 Disable API Gateway' : '🟢 Enable API Gateway'}</button>
        <form method="post" action="/admin/software/${sw.id}/delete" style="display:inline">
          <button type="submit" class="btn btn-danger" onclick="return confirm('Delete software product ${sw.name}? This will remove announcements and user databases. Licenses will not be removed.')">🗑️ Delete Product</button>
        </form>
      </div>
    </form>
  </div>

  <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 20px; align-items: start;">
      <!-- Licenses Section -->
      <div class="section" style="margin-bottom: 0;">
        <h2>🎫 License Key Registry (${licenseEntries.length})</h2>
        <form method="post" action="/admin/generate-license" style="margin-bottom:16px">
          <input type="hidden" name="softwareId" value="${sw.id}" />
          <div style="display: grid; grid-template-columns: 1.5fr 1fr auto; gap: 10px; align-items: end;">
            <div>
              <label class="form-label">Custom License Key (optional)</label>
              <input name="license" placeholder="Leave empty for secure key" />
            </div>
            <div>
              <label class="form-label">Expiry Date</label>
              <input name="expiry" type="date" />
            </div>
            <button type="submit" class="btn btn-primary" style="height: 38px;">Generate Key</button>
          </div>
        </form>
        
        ${licenseEntries.length === 0 ? '<p style="color:#64748b;font-style:italic;">No keys assigned to this product.</p>' : `
        <div class="table-container">
          <table id="licenseTable">
            <thead><tr><th>License Key</th><th>Device lock</th><th>User Link</th><th>Expiry</th><th style="text-align:right">Actions</th></tr></thead>
            <tbody>
              ${licenseEntries.map(([key, val]) => {
                const expired = isLicenseExpired(val);
                const banned = val.banned;
                const active = val.hwid && !expired && !banned;
                const st = banned ? '🚫 BANNED' : expired ? '🔴 EXPIRED' : active ? '🟢 ACTIVE' : '🟡 INACTIVE';
                const sc = banned ? 'banned' : expired ? 'expired' : active ? 'active' : 'inactive';
                return `<tr>
                  <td><div class="license-key" onclick="copyToClipboard('${key}')" title="Copy">${key}</div></td>
                  <td>${val.hwid ? `<div style="font-size:11px;color:#60a5fa;font-weight:600;">📱 ${val.deviceName || 'Unknown'}</div><div style="font-family:'JetBrains Mono',monospace;font-size:10px;color:#64748b;">${val.hwid.substring(0,18)}...</div>` : '<span style="color:#475569">Not bound</span>'}</td>
                  <td><span style="font-size:11px;color:#a0a3a8;font-family:'JetBrains Mono',monospace;">${val.userId || '-'}</span></td>
                  <td>${val.expiry ? `<div>${new Date(val.expiry).toLocaleDateString()}</div>` : '<span style="color:#10b981;font-weight:700;font-size:10px;">♾️ LIFE</span>'}</td>
                  <td><div style="display:flex;gap:4px;justify-content:flex-end">
                    ${val.hwid ? `<form method="post" action="/admin/reset-hwid" style="display:inline"><input type="hidden" name="license" value="${key}"><button class="btn btn-warning" style="padding:4px 8px;font-size:10px" onclick="return confirm('Reset bound device HWID lock?')">↻</button></form>` : ''}
                    <form method="post" action="/admin/delete-license" style="display:inline"><input type="hidden" name="license" value="${key}"><button class="btn btn-danger" style="padding:4px 8px;font-size:10px" onclick="return confirm('Delete license?')">🗑️</button></form>
                  </div></td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>`}
      </div>

      <div style="display:flex; flex-direction:column; gap:20px;">
          <!-- Announcements for this software -->
          <div class="section" style="margin-bottom: 0;">
            <h2>📣 Active Announcements (${announcements.length})</h2>
            <form method="post" action="/admin/announcements/create" style="margin-bottom:16px">
              <input type="hidden" name="softwareId" value="${sw.id}" />
              <div style="display: flex; flex-direction: column; gap: 8px;">
                <div style="display:grid; grid-template-columns: 1.5fr 1fr; gap:8px;">
                    <div>
                        <label class="form-label">Alert Title</label>
                        <input name="title" placeholder="Notice header..." required />
                    </div>
                    <div>
                        <label class="form-label">Alert Type</label>
                        <select name="type">
                          <option value="info">ℹ️ Info</option>
                          <option value="warning">⚠️ Warning</option>
                          <option value="offer">🎁 Offer</option>
                          <option value="update">🔄 Update</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label class="form-label">Alert Expiration Date (optional)</label>
                    <input name="expiresAt" type="datetime-local" />
                </div>
                <div>
                    <label class="form-label">Alert Description / Message</label>
                    <textarea name="message" placeholder="Message content..." required style="min-height:60px;resize:vertical"></textarea>
                </div>
                <button type="submit" class="btn btn-primary" style="width:100%">Add Alert Announcement</button>
              </div>
            </form>
            
            ${announcements.length === 0 ? '<p style="color:#64748b;font-style:italic;">No announcement records.</p>' : announcements.map(a => {
              const typeColor = {info:'#60a5fa',warning:'#f59e0b',offer:'#10b981',update:'#a5b4fc'}[a.type]||'#60a5fa';
              const typeBg = {info:'rgba(96,165,250,0.06)',warning:'rgba(245,158,11,0.06)',offer:'rgba(16,185,129,0.06)',update:'rgba(165,180,252,0.06)'}[a.type]||'rgba(96,165,250,0.06)';
              return `<div style="border-left:3px solid ${typeColor};background:${typeBg};border-radius:10px;padding:12px 14px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:flex-start">
                <div style="flex:1;">
                  <div style="font-weight:700;color:#f8fafc;font-size:12px;margin-bottom:2px">${a.title} <span style="font-size:8px;background:rgba(255,255,255,0.06);padding:1px 6px;border-radius:4px;color:${typeColor};margin-left:4px;font-weight:800;">${a.type?.toUpperCase()}</span>${!a.active?'<span style="font-size:8px;color:#94a3b8;margin-left:6px;font-weight:700;">OFFLINE</span>':''}</div>
                  <div style="font-size:11px;color:#94a3b8;line-height:1.4">${a.message}</div>
                </div>
                <div style="display:flex;gap:4px;flex-shrink:0;margin-left:10px">
                  <button onclick="toggleAnnouncement('${sw.id}','${a.id}',this)" class="btn ${a.active?'btn-warning':'btn-success'}" style="padding:4px 8px;font-size:9px">${a.active?'⏸':'▶'}</button>
                  <form method="post" action="/admin/announcements/${sw.id}/${a.id}/delete" style="display:inline"><button class="btn btn-danger" style="padding:4px 8px;font-size:9px" onclick="return confirm('Delete announcement?')">🗑️</button></form>
                </div>
              </div>`;
            }).join('')}
          </div>

          ${sw.authMode === 'license_credentials' ? `
          <!-- Software Users -->
          <div class="section" style="margin-bottom: 0;">
            <h2>👥 Credential Users (${users.length})</h2>
            <form method="post" action="/admin/software/${sw.id}/users/add" style="margin-bottom:16px">
              <div style="display:flex;flex-direction:column;gap:8px;">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
                    <div>
                        <label class="form-label">Username *</label>
                        <input name="username" placeholder="Username" required />
                    </div>
                    <div>
                        <label class="form-label">Password *</label>
                        <input name="password" type="password" placeholder="Password" required />
                    </div>
                </div>
                <div>
                    <label class="form-label">Link License Key (optional)</label>
                    <input name="licenseKey" placeholder="Paste existing license key" />
                </div>
                <button type="submit" class="btn btn-primary" style="width: 100%;">Create &amp; Bind User</button>
              </div>
            </form>
            
            ${users.length === 0 ? '<p style="color:#64748b;font-style:italic;">No user credential sets bound to this product yet.</p>' : `
            <div class="table-container"><table>
              <thead><tr><th>Username</th><th>Key Linked</th><th>Status</th><th style="text-align:right">Actions</th></tr></thead>
              <tbody>
                ${users.map(u=>`<tr>
                  <td style="font-family:'JetBrains Mono',monospace;color:#60a5fa;font-weight:600">${u.username}</td>
                  <td style="font-family:'JetBrains Mono',monospace;font-size:10px;color:#64748b">${u.licenseKey||'-'}</td>
                  <td><span class="status ${u.status==='active'?'active':'banned'}" style="font-size:9px;">${u.status==='active'?'ACTIVE':'BANNED'}</span></td>
                  <td><div style="display:flex;gap:4px;justify-content:flex-end">
                    ${u.status==='active'?`<form method="post" action="/admin/software/${sw.id}/users/ban" style="display:inline"><input type="hidden" name="username" value="${u.username}"><button class="btn btn-danger" style="padding:4px 8px;font-size:10px" onclick="return confirm('Ban user account ${u.username}?')">🚫</button></form>`:`<form method="post" action="/admin/software/${sw.id}/users/unban" style="display:inline"><input type="hidden" name="username" value="${u.username}"><button class="btn btn-success" style="padding:4px 8px;font-size:10px">✅</button></form>`}
                    <form method="post" action="/admin/software/${sw.id}/users/delete" style="display:inline"><input type="hidden" name="username" value="${u.username}"><button class="btn btn-danger" style="padding:4px 8px;font-size:10px" onclick="return confirm('Delete user ${u.username}?')">🗑️</button></form>
                  </div></td>
                </tr>`).join('')}
              </tbody>
            </table></div>`}
          </div>` : ''}
      </div>
  </div>
</div>

<script>
async function toggleAnnouncement(swId, annId, btn) {
  const res = await fetch('/admin/announcements/'+swId+'/'+annId+'/toggle', {method:'POST'});
  const json = await res.json();
  if (json.success) { btn.textContent = json.active ? '⏸' : '▶'; btn.className = json.active ? 'btn btn-warning' : 'btn btn-success'; }
}
async function toggleMaintenance(id) {
  const res = await fetch('/admin/software/'+id+'/toggle-maintenance', {method:'POST'});
  const json = await res.json();
  if (json.success) alert('Maintenance mode: ' + (json.maintenanceMode ? 'ON' : 'OFF') + ' (reload to apply)');
}
async function toggleAPI(id) {
  const res = await fetch('/admin/software/'+id+'/toggle-api', {method:'POST'});
  const json = await res.json();
  if (json.success) alert('API: ' + (json.apiEnabled ? 'ENABLED' : 'DISABLED') + ' (reload to apply)');
}
function copyToClipboard(text) { navigator.clipboard.writeText(text).then(()=>{ const t=document.createElement('div');t.textContent='✅ Copied!';t.style.cssText='position:fixed;bottom:20px;right:20px;background:#10b981;color:#fff;padding:10px 20px;border-radius:10px;z-index:9999;font-weight:600';document.body.appendChild(t);setTimeout(()=>t.remove(),2000); }); }
</script>
</body></html>`;
}

function getSharedStyles() {
  try { return require('./assets/styles').getStyles(); } catch(e) { return '<style>body{background:#06080f;color:#f8fafc;font-family:sans-serif}</style>'; }
}

module.exports = { generateSoftwarePage };
