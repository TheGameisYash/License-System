// views/components/table.js - Updated with Software column + filter
const { isLicenseExpired, calculateDaysUntilExpiry } = require('../../utils/helpers');

function getSoftwareName(softwareId, allSoftware = []) {
  if (!softwareId || softwareId === 'default') return 'Default';
  const sw = allSoftware.find(s => s.id === softwareId);
  return sw ? `${sw.icon || ''} ${sw.name}` : softwareId;
}

function generateLicenseTable(licenses, allSoftware = []) {
  const totalLicenses = Object.keys(licenses).length;
  const softwareOptions = allSoftware.map(sw => `<option value="${sw.id}">${sw.icon || ''} ${sw.name}</option>`).join('');

  return `
    <div class="section">
        <h2 id="license-list-header">📋 License List (${totalLicenses})</h2>
        <div style="display:flex;gap:10px;margin-bottom:12px;flex-wrap:wrap">
          <div class="search-box" style="flex:1;min-width:200px">
              <span class="search-icon">🔍</span>
              <input type="text" id="searchInput" placeholder="Search licenses, devices, HWID..." onkeyup="filterTable()" />
          </div>
          ${allSoftware.length > 0 ? `
          <select id="softwareFilter" onchange="filterTable()" style="background:rgba(26,29,35,0.9);border:1px solid rgba(255,255,255,0.1);color:#e4e6eb;border-radius:10px;padding:0 14px;font-size:13px;min-width:160px">
            <option value="">All Software</option>
            <option value="default">Default</option>
            ${softwareOptions}
          </select>` : ''}
          <select id="statusFilter" onchange="filterTable()" style="background:rgba(26,29,35,0.9);border:1px solid rgba(255,255,255,0.1);color:#e4e6eb;border-radius:10px;padding:0 14px;font-size:13px;min-width:140px">
            <option value="">All Status</option>
            <option value="active">🟢 Active</option>
            <option value="inactive">🟡 Inactive</option>
            <option value="expired">🔴 Expired</option>
            <option value="banned">🚫 Banned</option>
          </select>
        </div>
        <div class="table-container">
            <table id="licenseTable">
                <thead>
                    <tr>
                        <th>License Key</th>
                        <th>Software</th>
                        <th>HWID / Device</th>
                        <th>Expiry</th>
                        <th>Status</th>
                        <th>Actions</th>
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
                                ${val.notes && val.notes.length > 0 ? `<div style="font-size: 10px; color: #ffa502; margin-top: 4px;">📝 ${val.notes.length} note(s)</div>` : ''}
                            </td>
                            <td>
                                <span style="font-size:12px;color:#a0a3a8;background:rgba(255,255,255,0.05);padding:3px 8px;border-radius:8px">${swName}</span>
                            </td>
                            <td>
                                ${val.hwid ? `
                                    <div class="hwid-container" onclick="copyToClipboard('${val.hwid.replace(/'/g, "\\'")}', 'HWID')">
                                        <div style="font-weight: 600; color: #00aaee; font-size: 12px;">📱 ${val.deviceName || 'Unknown Device'}</div>
                                        <div class="hwid-display">${val.hwid}</div>
                                        ${val.userId ? `<div style="font-size:10px;color:#9b59b6;margin-top:2px">👤 ${val.userId}</div>` : ''}
                                    </div>
                                ` : '<span style="color: #8b8d94;">Not activated</span>'}
                            </td>
                            <td>
                                ${val.expiry ? `
                                    <div>${new Date(val.expiry).toLocaleDateString()}</div>
                                    <div style="font-size: 10px; color: ${expired ? '#e74c3c' : '#2ecc71'};">
                                        ${expired ? 'Expired' : calculateDaysUntilExpiry(val.expiry) + ' days left'}
                                    </div>
                                ` : '<span style="color: #2ecc71;">Never</span>'}
                            </td>
                            <td><span class="status ${statusClass}">${statusText}</span></td>
                            <td>
                                <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                                    ${val.hwid && !banned ? `
                                        <form method="post" action="/admin/reset-hwid" style="display: inline;">
                                            <input type="hidden" name="license" value="${key}" />
                                            <button type="submit" class="btn btn-warning" style="padding: 6px 12px; font-size: 11px;" onclick="return confirm('Reset HWID for ${key}?')" title="Reset HWID">↻</button>
                                        </form>
                                    ` : ''}
                                    ${!banned ? `
                                        <button onclick="showBanModal('${key.replace(/'/g, "\\'")}', '${(val.deviceName || 'Unknown').replace(/'/g, "\\'")}', '${val.hwid ? val.hwid.replace(/'/g, "\\'") : ''}')" class="btn btn-danger" style="padding: 6px 12px; font-size: 11px;" title="Ban License">🚫</button>
                                    ` : `
                                        <form method="post" action="/admin/unban-license" style="display: inline;">
                                            <input type="hidden" name="license" value="${key}" />
                                            <button type="submit" class="btn btn-success" style="padding: 6px 12px; font-size: 11px;" onclick="return confirm('Unban ${key}?')" title="Unban">✅</button>
                                        </form>
                                    `}
                                    <button onclick="showNoteModal('${key.replace(/'/g, "\\'")}', '${(val.deviceName || 'Unknown').replace(/'/g, "\\'")}', ${val.notes ? val.notes.length : 0})" class="btn btn-primary" style="padding: 6px 12px; font-size: 11px;" title="Add Note">📝</button>
                                    ${val.notes && val.notes.length > 0 ? `
                                        <button onclick="showViewNotesModal('${key.replace(/'/g, "\\'")}', ${JSON.stringify(val.notes || [])})" class="btn btn-primary" style="padding: 6px 12px; font-size: 11px; background: linear-gradient(45deg, #3498db, #2980b9);" title="View Notes">👁️</button>
                                    ` : ''}
                                    <form method="post" action="/admin/delete-license" style="display: inline;">
                                        <input type="hidden" name="license" value="${key}" />
                                        <button type="submit" class="btn btn-danger" style="padding: 6px 12px; font-size: 11px;" onclick="return confirm('Delete ${key}? This cannot be undone!')" title="Delete">🗑️</button>
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
