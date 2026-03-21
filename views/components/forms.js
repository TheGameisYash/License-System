// views/components/forms.js - Updated with software selector
function generateLicenseGenerationForm(allSoftware = []) {
  const softwareOptions = allSoftware.length > 0
    ? allSoftware.map(sw => `<option value="${sw.id}">${sw.icon || ''} ${sw.name}</option>`).join('')
    : '<option value="default">Default</option>';

  return `
    <div class="section">
        <h2>🎫 License Generation</h2>
        <form method="post" action="/admin/generate-license">
            <div class="form-grid">
                <input name="license" placeholder="Custom Key (optional)" />
                <input name="expiry" type="date" />
                <select name="softwareId">
                    ${softwareOptions}
                </select>
                <button type="submit" class="btn btn-primary">Generate</button>
            </div>
        </form>
        <form method="post" action="/admin/bulk-generate" style="margin-top: 12px;">
            <div class="form-grid">
                <input name="count" type="number" placeholder="Qty (max 100)" min="1" max="100" />
                <input name="prefix" placeholder="Prefix (leave empty = software prefix)" />
                <input name="expiry" type="date" />
                <select name="softwareId">
                    ${softwareOptions}
                </select>
                <button type="submit" class="btn btn-primary">Bulk Generate</button>
            </div>
        </form>
    </div>
  `;
}

function generateSettingsForm(settings) {
  return `
    <div class="section">
        <h2>⚙️ System Settings</h2>
        <form method="post" action="/admin/update-settings">
            <div style="display: flex; gap: 25px; align-items: center; margin-bottom: 15px; flex-wrap: wrap;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span>Global API Enabled</span>
                    <label class="toggle-switch">
                        <input type="checkbox" name="apiEnabled" value="true" ${settings.apiEnabled ? 'checked' : ''} />
                        <span class="toggle-slider"></span>
                    </label>
                </div>
                <button type="submit" class="btn btn-success">Save Settings</button>
            </div>
        </form>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <form method="post" action="/admin/clear-cache" style="display: inline;">
                <button type="submit" class="btn btn-warning" onclick="return confirm('Clear all cache?')">🧹 Clear Cache</button>
            </form>
            <form method="post" action="/admin/clear-logs" style="display: inline;">
                <input type="hidden" name="days" value="30" />
                <button type="submit" class="btn btn-warning" onclick="return confirm('Clear logs older than 30 days?')">🗑️ Clear Logs</button>
            </form>
        </div>
    </div>
  `;
}

function generateBanManagementForm(banlist) {
  return `
    <div class="section">
        <h2>🚫 HWID Ban Management</h2>
        <form method="post" action="/admin/ban-hwid">
            <div class="form-grid">
                <input name="hwid" placeholder="HWID to ban" required />
                <input name="reason" placeholder="Reason" />
                <button type="submit" class="btn btn-danger">Ban HWID</button>
            </div>
        </form>
        ${banlist.length > 0 ? `
            <div style="margin-top: 18px;">
                <h3 style="color: #e74c3c; margin-bottom: 12px; font-size: 14px;">Banned HWIDs (${banlist.length})</h3>
                ${banlist.slice(0, 5).map(hwid => `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: rgba(231, 76, 60, 0.08); border-radius: 8px; margin-bottom: 8px; border-left: 3px solid #e74c3c;">
                        <span style="font-family: monospace; font-size: 12px; color: #e4e6eb; cursor: pointer;" onclick="copyToClipboard('${hwid}')" title="Click to copy">${hwid.substring(0, 35)}...</span>
                        <form method="post" action="/admin/unban-hwid" style="display: inline;">
                            <input type="hidden" name="hwid" value="${hwid}" />
                            <button type="submit" class="btn btn-success" style="padding: 6px 14px; font-size: 11px;" onclick="return confirm('Unban this HWID?')">Unban</button>
                        </form>
                    </div>
                `).join('')}
                ${banlist.length > 5 ? `<p style="color: #8b8d94; font-size: 12px; margin-top: 8px;">...and ${banlist.length - 5} more</p>` : ''}
            </div>
        ` : '<p style="color: #8b8d94; font-size: 13px;">No banned HWIDs</p>'}
    </div>
  `;
}

module.exports = { generateLicenseGenerationForm, generateSettingsForm, generateBanManagementForm };
