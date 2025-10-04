// views/components/table.js - FIXED VIEW NOTES BUTTON
const { isLicenseExpired, calculateDaysUntilExpiry } = require('../../utils/helpers');

function generateLicenseTable(licenses) {
  const totalLicenses = Object.keys(licenses).length;
  
  return `
    <div class="section">
        <h2 id="license-list-header">📋 License List (${totalLicenses})</h2>
        <div class="search-box">
            <span class="search-icon">🔍</span>
            <input type="text" id="searchInput" placeholder="Search licenses, devices, HWID..." onkeyup="filterTable()" />
        </div>
        <div class="table-container">
            <table id="licenseTable">
                <thead>
                    <tr>
                        <th>License Key</th>
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
                        
                        return `
                        <tr>
                            <td>
                                <div class="license-key" onclick="copyToClipboard('${key.replace(/'/g, "\\'")}', 'License Key')" title="Click to copy">${key}</div>
                                ${val.notes && val.notes.length > 0 ? '<div style="font-size: 10px; color: #ffa502; margin-top: 4px;">📝 ' + val.notes.length + ' note(s)</div>' : ''}
                            </td>
                            <td>
                                ${val.hwid ? `
                                    <div class="hwid-container" onclick="copyToClipboard('${val.hwid.replace(/'/g, "\\'")}', 'HWID')">
                                        <div style="font-weight: 600; color: #00aaee; font-size: 12px;">
                                            📱 ${val.deviceName || 'Unknown Device'}
                                        </div>
                                        <div class="hwid-display">${val.hwid}</div>
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
                                            <button type="submit" class="btn btn-success" style="padding: 6px 12px; font-size: 11px;" onclick="return confirm('Unban ${key}?')" title="Unban License">✅</button>
                                        </form>
                                    `}
                                    <button onclick="showNoteModal('${key.replace(/'/g, "\\'")}', '${(val.deviceName || 'Unknown').replace(/'/g, "\\'")}', ${val.notes ? val.notes.length : 0})" class="btn btn-primary" style="padding: 6px 12px; font-size: 11px;" title="Add Note">📝</button>
                                    ${val.notes && val.notes.length > 0 ? `
                                        <button onclick="viewNotes_${key.replace(/[^a-zA-Z0-9]/g, '_')}()" class="btn btn-primary" style="padding: 6px 12px; font-size: 11px; background: linear-gradient(45deg, #3498db, #2980b9);" title="View ${val.notes.length} Note(s)">👁️</button>
                                        <script>
                                            function viewNotes_${key.replace(/[^a-zA-Z0-9]/g, '_')}() {
                                                const notes = ${JSON.stringify(val.notes || [])};
                                                showViewNotesModal('${key.replace(/'/g, "\\'")}', notes);
                                            }
                                        </script>
                                    ` : ''}
                                    <form method="post" action="/admin/delete-license" style="display: inline;">
                                        <input type="hidden" name="license" value="${key}" />
                                        <button type="submit" class="btn btn-danger" style="padding: 6px 12px; font-size: 11px;" onclick="return confirm('Delete ${key}? This cannot be undone!')" title="Delete License">🗑️</button>
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
