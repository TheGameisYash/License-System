// views/components/forms.js - Premium Forms & System Management Controls
function generateLicenseGenerationForm(allSoftware = []) {
  const softwareOptions = allSoftware.length > 0
    ? allSoftware.map(sw => `<option value="${sw.id}">${sw.icon || '🔧'} ${sw.name}</option>`).join('')
    : '<option value="default">Default</option>';

  return `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px;">
        <!-- Single Generator -->
        <div class="section" style="margin-bottom: 0;">
            <h2>🎫 Generate Single License</h2>
            <form method="post" action="/admin/generate-license">
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    <div>
                        <label class="form-label">Custom License Key (Optional)</label>
                        <input name="license" placeholder="Leave empty for auto-generated secure key" />
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div>
                            <label class="form-label">Customer Name (Optional)</label>
                            <input name="customerName" placeholder="John Doe" />
                        </div>
                        <div>
                            <label class="form-label">Customer Email (Optional)</label>
                            <input name="customerEmail" type="email" placeholder="john@example.com" />
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div>
                            <label class="form-label">Expiry Date</label>
                            <input name="expiry" type="date" />
                        </div>
                        <div>
                            <label class="form-label">Target Software</label>
                            <select name="softwareId">
                                ${softwareOptions}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label class="form-label">Custom Metadata (Optional JSON)</label>
                        <textarea name="metadata" placeholder='{"aimbot": true, "esp": true}' style="min-height: 50px; font-family: 'JetBrains Mono', monospace; font-size: 11px; resize: vertical;"></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary" style="margin-top: 6px; width: 100%;">🎫 Generate License Key</button>
                </div>
            </form>
        </div>

        <!-- Bulk Generator -->
        <div class="section" style="margin-bottom: 0;">
            <h2>📦 Bulk License Generation</h2>
            <form method="post" action="/admin/bulk-generate">
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    <div style="display: grid; grid-template-columns: 1fr 1.5fr; gap: 12px;">
                        <div>
                            <label class="form-label">Quantity</label>
                            <input name="count" type="number" placeholder="Max 100" min="1" max="100" required />
                        </div>
                        <div>
                            <label class="form-label">Custom Prefix</label>
                            <input name="prefix" placeholder="e.g. TRIAL, PREMIUM" />
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div>
                            <label class="form-label">Expiry Date</label>
                            <input name="expiry" type="date" />
                        </div>
                        <div>
                            <label class="form-label">Target Software</label>
                            <select name="softwareId">
                                ${softwareOptions}
                            </select>
                        </div>
                    </div>
                    <button type="submit" class="btn btn-primary" style="margin-top: 6px; width: 100%;">📦 Generate Bulk Keys (.txt)</button>
                </div>
            </form>
        </div>
    </div>
  `;
}

function generateSettingsForm(settings) {
  return `
    <div class="section">
        <h2>⚙️ System Settings &amp; Actions</h2>
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px;">
            <form method="post" action="/admin/update-settings" style="flex: 1; min-width: 250px;">
                <div style="display: flex; align-items: center; gap: 16px;">
                    <span style="font-size: 14px; font-weight: 600; color: #cbd5e1;">Global API Validation Gateway:</span>
                    <label class="toggle-switch">
                        <input type="checkbox" name="apiEnabled" value="true" ${settings.apiEnabled ? 'checked' : ''} onchange="this.form.submit()" />
                        <span class="toggle-slider"></span>
                    </label>
                    <span style="font-size: 12px; font-weight: 700; color: ${settings.apiEnabled ? '#10b981' : '#f43f5e'}; text-transform: uppercase;">
                        ${settings.apiEnabled ? '🟢 Enabled' : '🔴 Suspended'}
                    </span>
                </div>
            </form>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                <form method="post" action="/admin/clear-cache" style="display: inline;">
                    <button type="submit" class="btn btn-warning" onclick="return confirm('Clear all database cache registries?')">🧹 Flush System Cache</button>
                </form>
                <form method="post" action="/admin/clear-logs" style="display: inline;">
                    <input type="hidden" name="days" value="30" />
                    <button type="submit" class="btn btn-warning" onclick="return confirm('Delete old activity logs? This operation is irreversible.')">🗑️ Prune Logs (>30d)</button>
                </form>
            </div>
        </div>
    </div>
  `;
}

function generateBanManagementForm(banlist) {
  return `
    <div class="section">
        <h2>🚫 Hardware (HWID) Ban Management</h2>
        <form method="post" action="/admin/ban-hwid" style="margin-bottom: 20px;">
            <div style="display: grid; grid-template-columns: 1.5fr 2fr 1fr; gap: 12px; align-items: end;">
                <div>
                    <label class="form-label">Hardware Identification (HWID) *</label>
                    <input name="hwid" placeholder="Paste full device HWID code" required />
                </div>
                <div>
                    <label class="form-label">Administrative Ban Reason</label>
                    <input name="reason" placeholder="Violating terms of service, cracking attempt, etc." />
                </div>
                <button type="submit" class="btn btn-danger" style="width: 100%;">🚫 Ban Hardware</button>
            </div>
        </form>
        
        ${banlist.length > 0 ? `
            <div>
                <h3 style="color: #f43f5e; margin-bottom: 12px; font-size: 13px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;">Banned Hardware List (${banlist.length})</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 10px;">
                    ${banlist.slice(0, 6).map(hwid => `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: rgba(244, 63, 94, 0.04); border: 1px solid rgba(244, 63, 94, 0.15); border-radius: 10px; transition: all 0.2s;">
                            <span style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #fb7185; cursor: pointer; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; max-width: 200px;" onclick="copyToClipboard('${hwid}', 'HWID')" title="Click to copy">${hwid}</span>
                            <form method="post" action="/admin/unban-hwid" style="display: inline;">
                                <input type="hidden" name="hwid" value="${hwid}" />
                                <button type="submit" class="btn btn-success" style="padding: 6px 12px; font-size: 10px;" onclick="return confirm('Restore client device access for this HWID?')">🔓 Unban</button>
                            </form>
                        </div>
                    `).join('')}
                </div>
                ${banlist.length > 6 ? `<p style="color: #64748b; font-size: 11px; margin-top: 10px; font-weight: 500;">...and ${banlist.length - 6} more banned HWID records</p>` : ''}
            </div>
        ` : '<p style="color: #64748b; font-size: 13px; font-weight: 500; font-style: italic;">All hardware gateways clear. No banned HWID logs found.</p>'}
    </div>
  `;
}

module.exports = { generateLicenseGenerationForm, generateSettingsForm, generateBanManagementForm };
