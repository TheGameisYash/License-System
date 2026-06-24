// views/components/table.js - Premium License Search Registry Table
const { isLicenseExpired, calculateDaysUntilExpiry } = require('../../utils/helpers');

function getSoftwareName(softwareId, allSoftware = []) {
  if (!softwareId || softwareId === 'default') return 'Default Product';
  const sw = allSoftware.find(s => s.id === softwareId);
  return sw ? `${sw.icon || '📦'} ${sw.name}` : softwareId;
}

function generateLicenseTable(licenses, allSoftware = []) {
  const totalLicenses = Object.keys(licenses).length;
  const softwareOptions = allSoftware.map(sw => `<option value="${sw.id}">${sw.icon || '🔧'} ${sw.name}</option>`).join('');

  return `
    <div class="section">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255, 255, 255, 0.06); padding-bottom: 12px; margin-bottom: 16px; flex-wrap: wrap; gap: 10px;">
            <h2 id="license-list-header" style="border: none; padding: 0; margin: 0;">📋 License Key Registry (${totalLicenses})</h2>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <div class="search-box" style="min-width: 250px;">
                    <span class="search-icon">🔍</span>
                    <input type="text" id="searchInput" placeholder="Search keys, devices, HWIDs..." onkeyup="filterTable()" />
                </div>
                ${allSoftware.length > 0 ? `
                <select id="softwareFilter" onchange="filterTable()" style="min-width: 160px;">
                    <option value="">All Products</option>
                    <option value="default">Default Product</option>
                    ${softwareOptions}
                </select>` : ''}
                <select id="statusFilter" onchange="filterTable()" style="min-width: 140px;">
                    <option value="">All Statuses</option>
                    <option value="active">🟢 Active</option>
                    <option value="inactive">🟡 Inactive</option>
                    <option value="expired">🔴 Expired</option>
                    <option value="banned">🚫 Banned</option>
                </select>
            </div>
        </div>

        <div class="table-container">
            <table id="licenseTable">
                <thead>
                    <tr>
                        <th>License Key</th>
                        <th>Target Product</th>
                        <th>Registered Device Info</th>
                        <th>Expiration Status</th>
                        <th>Status</th>
                        <th style="text-align: right;">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.entries(licenses).map(([key, val]) => {
                        const expired = isLicenseExpired(val);
                        const banned = val.banned;
                        const active = val.hwid && !expired && !banned;
                        const statusClass = banned ? 'banned' : (expired ? 'expired' : (active ? 'active' : 'inactive'));
                        const statusText = banned ? '🚫 BANNED' : (expired ? '🔴 EXPIRED' : (active ? '🟢 ACTIVE' : '🟡 INACTIVE'));
                        const swName = getSoftwareName(val.softwareId, allSoftware);
                        
                        return `
                        <tr data-status="${statusClass}" data-software="${val.softwareId || 'default'}">
                            <td>
                                <div class="license-key" onclick="copyToClipboard('${key.replace(/'/g, "\\'")}', 'License Key')" title="Click to copy">${key}</div>
                                ${val.customerName || val.customerEmail ? `
                                    <div style="font-size: 11px; color: #94a3b8; font-weight: 600; margin-top: 4px;">
                                        👤 ${val.customerName || ''} ${val.customerEmail ? `&lt;${val.customerEmail}&gt;` : ''}
                                    </div>
                                ` : ''}
                                ${val.notes && val.notes.length > 0 ? `<div style="font-size: 10px; color: #f59e0b; font-weight: 600; margin-top: 4px; display: inline-flex; align-items: center; gap: 4px;">📝 ${val.notes.length} note(s)</div>` : ''}
                                ${val.metadata ? `<div style="font-size: 9px; color: #a5b4fc; font-family: 'JetBrains Mono', monospace; margin-top: 3px; font-weight: 600;">⚙️ ${typeof val.metadata === 'object' ? JSON.stringify(val.metadata) : val.metadata}</div>` : ''}
                            </td>
                            <td>
                                <span style="font-size: 12px; font-weight: 600; color: #cbd5e1; background: rgba(255, 255, 255, 0.04); padding: 4px 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.03);">${swName}</span>
                            </td>
                            <td>
                                ${val.hwid ? `
                                    <div class="hwid-container" onclick="copyToClipboard('${val.hwid.replace(/'/g, "\\'")}', 'HWID')">
                                        <div style="font-weight: 600; color: #60a5fa; font-size: 12px;">📱 ${val.deviceName || 'Unknown Device'}</div>
                                        <div class="hwid-display" title="Hardware identity lock">${val.hwid.substring(0, 30)}...</div>
                                        ${val.userId ? `<div style="font-size: 10px; color: #a5b4fc; margin-top: 3px; font-weight: 600;">👤 User ID: ${val.userId}</div>` : ''}
                                        ${val.hardwareFingerprint ? `
                                            <div style="font-size: 9px; color: #64748b; margin-top: 4px; border-top: 1px dashed rgba(255,255,255,0.05); padding-top: 4px; text-align: left; font-family: 'JetBrains Mono', monospace; line-height: 1.3;">
                                                ${val.hardwareFingerprint.cpu ? `💻 CPU: ${val.hardwareFingerprint.cpu}<br>` : ''}
                                                ${val.hardwareFingerprint.gpu ? `🎮 GPU: ${val.hardwareFingerprint.gpu}<br>` : ''}
                                                ${val.hardwareFingerprint.motherboard ? `🔑 MB: ${val.hardwareFingerprint.motherboard}` : ''}
                                            </div>
                                        ` : ''}
                                    </div>
                                ` : '<span style="color: #475569; font-style: italic; font-weight: 500;">No device bound</span>'}
                            </td>
                            <td>
                                ${val.expiry ? `
                                    <div style="font-weight: 600; color: #e2e8f0;">${new Date(val.expiry).toLocaleDateString()}</div>
                                    <div style="font-size: 10px; color: ${expired ? '#f43f5e' : '#10b981'}; font-weight: 700; text-transform: uppercase; margin-top: 2px;">
                                        ${expired ? 'Expired' : calculateDaysUntilExpiry(val.expiry) + ' days remaining'}
                                    </div>
                                ` : '<span style="color: #10b981; font-weight: 700; font-size: 10px; text-transform: uppercase;">♾️ Unlimited Access</span>'}
                            </td>
                            <td><span class="status ${statusClass}">${statusText}</span></td>
                            <td>
                                <div style="display: flex; gap: 6px; justify-content: flex-end; flex-wrap: wrap;">
                                    ${val.hwid && !banned ? `
                                        <form method="post" action="/admin/reset-hwid" style="display: inline;">
                                            <input type="hidden" name="license" value="${key}" />
                                            <button type="submit" class="btn btn-warning" style="padding: 6px 10px; font-size: 11px;" onclick="return confirm('Detatch bound hardware key device for ${key}?')" title="Reset HWID Link">↻ Reset</button>
                                        </form>
                                    ` : ''}
                                    ${!banned ? `
                                        <button onclick="showBanModal('${key.replace(/'/g, "\\'")}', '${(val.deviceName || 'Unknown').replace(/'/g, "\\'")}', '${val.hwid ? val.hwid.replace(/'/g, "\\'") : ''}')" class="btn btn-danger" style="padding: 6px 10px; font-size: 11px;" title="Restrict Key access">🚫 Ban</button>
                                    ` : `
                                        <form method="post" action="/admin/unban-license" style="display: inline;">
                                            <input type="hidden" name="license" value="${key}" />
                                            <button type="submit" class="btn btn-success" style="padding: 6px 10px; font-size: 11px;" onclick="return confirm('Restore client access rights for ${key}?')" title="Unban Key">✅ Lift Ban</button>
                                        </form>
                                    `}
                                    <button onclick="showNoteModal('${key.replace(/'/g, "\\'")}', '${(val.deviceName || 'Unknown').replace(/'/g, "\\'")}', ${val.notes ? val.notes.length : 0})" class="btn btn-primary" style="padding: 6px 10px; font-size: 11px;" title="Append admin note">📝 Note</button>
                                    ${val.notes && val.notes.length > 0 ? `
                                        <button onclick="showViewNotesModal('${key.replace(/'/g, "\\'")}', ${JSON.stringify(val.notes || [])})" class="btn btn-primary" style="padding: 6px 10px; font-size: 11px; background: linear-gradient(135deg, #1e3a8a, #1d4ed8); border-color: rgba(96,165,250,0.2);" title="Read note logs">👁️ Read</button>
                                    ` : ''}
                                    <form method="post" action="/admin/delete-license" style="display: inline;">
                                        <input type="hidden" name="license" value="${key}" />
                                        <button type="submit" class="btn btn-danger" style="padding: 6px 10px; font-size: 11px;" onclick="return confirm('Permanently remove license record ${key}? This action cannot be undone.')" title="Destroy License Record">🗑️</button>
                                    </form>
                                </div>
                            </td>
                        </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    </div>
  `;
}

module.exports = { generateLicenseTable };
