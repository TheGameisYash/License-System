// views/components/trialTable.js - Trial Keys Registry Table
const { sanitizeInput } = require('../../utils/validators');

function getSoftwareName(softwareId, allSoftware = []) {
  if (!softwareId || softwareId === 'default') return 'Default Product';
  const sw = allSoftware.find(s => s.id === softwareId);
  return sw ? `${sw.icon || '📦'} ${sw.name}` : softwareId;
}

function calculateHoursRemaining(expiryStr) {
  const expiry = new Date(expiryStr);
  const now = new Date();
  const diffMs = expiry - now;
  if (diffMs <= 0) return 'Expired';
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${diffHours}h ${diffMins}m remaining`;
}

function generateTrialTable(trials = [], allSoftware = []) {
  const totalTrials = trials.length;
  const softwareOptions = allSoftware.map(sw => `<option value="${sw.id}">${sw.icon || '🔧'} ${sw.name}</option>`).join('');

  return `
    <div class="section" style="margin-top: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255, 255, 255, 0.06); padding-bottom: 12px; margin-bottom: 16px; flex-wrap: wrap; gap: 10px;">
            <h2 id="trial-list-header" style="border: none; padding: 0; margin: 0;">📋 Trial Registry (${totalTrials})</h2>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <div class="search-box" style="min-width: 250px;">
                    <span class="search-icon">🔍</span>
                    <input type="text" id="trialSearchInput" placeholder="Search HWIDs, devices, info..." onkeyup="filterTrialTable()" />
                </div>
                ${allSoftware.length > 0 ? `
                <select id="trialSoftwareFilter" onchange="filterTrialTable()" style="min-width: 160px;">
                    <option value="">All Products</option>
                    <option value="default">Default Product</option>
                    ${softwareOptions}
                </select>` : ''}
                <select id="trialStatusFilter" onchange="filterTrialTable()" style="min-width: 140px;">
                    <option value="">All Statuses</option>
                    <option value="active">🟢 Active</option>
                    <option value="expired">🔴 Expired</option>
                </select>
            </div>
        </div>

        <div class="table-container">
            <table id="trialTable">
                <thead>
                    <tr>
                        <th>Hardware ID (HWID)</th>
                        <th>Target Product</th>
                        <th>Device Name &amp; Details</th>
                        <th>Registered At</th>
                        <th>Expiration Status</th>
                        <th style="text-align: right;">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${trials.length === 0 ? `
                        <tr>
                            <td colspan="6" style="text-align: center; color: #475569; padding: 20px; font-style: italic; font-weight: 500;">No trial redemptions found</td>
                        </tr>
                    ` : trials.map(val => {
                        const expired = new Date(val.expiry) <= new Date();
                        const statusClass = expired ? 'expired' : 'active';
                        const statusText = expired ? '🔴 EXPIRED' : '🟢 ACTIVE';
                        const timeRemaining = expired ? 'Expired' : calculateHoursRemaining(val.expiry);
                        const swName = getSoftwareName(val.softwareId, allSoftware);
                        
                        return `
                        <tr data-status="${statusClass}" data-software="${val.softwareId || 'default'}">
                            <td>
                                <div class="license-key" onclick="copyToClipboard('${val.hwid.replace(/'/g, "\\'")}', 'HWID')" title="Click to copy">${val.hwid}</div>
                                ${val.userId ? `
                                    <div style="font-size: 11px; color: #94a3b8; font-weight: 600; margin-top: 4px;">
                                        👤 User ID: ${val.userId}
                                    </div>
                                ` : ''}
                            </td>
                            <td>
                                <span style="font-size: 12px; font-weight: 600; color: #cbd5e1; background: rgba(255, 255, 255, 0.04); padding: 4px 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.03);">${swName}</span>
                            </td>
                            <td>
                                <div style="font-weight: 600; color: #60a5fa; font-size: 12px;">📱 ${val.deviceName || 'Unknown Device'}</div>
                                <div style="font-size: 11px; color: #8b8d94; margin-top: 2px;">${val.deviceInfo || 'No details'}</div>
                            </td>
                            <td>
                                <div style="font-size: 12px; color: #cbd5e1; font-weight: 500;">${new Date(val.createdAt).toLocaleString()}</div>
                            </td>
                            <td>
                                <div style="font-weight: 600; color: #e2e8f0; font-size: 12px; display: flex; align-items: center; gap: 6px;">
                                    <span style="font-size: 8px; padding: 2px 6px; border-radius: 6px; font-weight: 700; background: ${expired ? 'rgba(244,63,94,0.15)' : 'rgba(16,185,129,0.15)'}; color: ${expired ? '#f43f5e' : '#10b981'}">${statusText}</span>
                                    <span>${timeRemaining}</span>
                                </div>
                            </td>
                            <td>
                                <div style="display: flex; gap: 6px; justify-content: flex-end; flex-wrap: wrap;">
                                    <form method="post" action="/admin/delete-trial" style="display: inline;">
                                        <input type="hidden" name="hwid" value="${val.hwid}" />
                                        <button type="submit" class="btn btn-danger" style="padding: 6px 10px; font-size: 11px;" onclick="return confirm('Reset trial registration for HWID ${val.hwid}? This allows the device to redeem a trial again.')" title="Reset Trial Claim">🗑️ Reset Claim</button>
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

    <script>
        // Dedicated filter function for Trial Table
        function filterTrialTable() {
            const input = document.getElementById('trialSearchInput');
            const filter = input ? input.value.toUpperCase() : '';
            const softwareFilter = (document.getElementById('trialSoftwareFilter') || {}).value || '';
            const statusFilter = (document.getElementById('trialStatusFilter') || {}).value || '';
            const table = document.getElementById('trialTable');
            if (!table) return;
            const tr = table.getElementsByTagName('tr');
            let visibleCount = 0;
            // Ignore header row and "No trials found" row if present
            const isNoData = tr.length === 2 && tr[1].getElementsByTagName('td')[0].colSpan > 1;
            const totalCount = isNoData ? 0 : tr.length - 1;
            
            if (isNoData) return;

            for (let i = 1; i < tr.length; i++) {
                const row = tr[i];
                const td = row.getElementsByTagName('td');
                let textMatch = !filter;
                let softwareMatch = !softwareFilter;
                let statusMatch = !statusFilter;
                
                if (filter) {
                    for (let j = 0; j < td.length; j++) {
                        if (td[j] && (td[j].textContent || td[j].innerText).toUpperCase().indexOf(filter) > -1) {
                            textMatch = true; 
                            break;
                        }
                    }
                }
                if (softwareFilter && row.dataset.software) {
                    softwareMatch = row.dataset.software === softwareFilter;
                }
                if (statusFilter && row.dataset.status) {
                    statusMatch = row.dataset.status === statusFilter;
                }
                
                const show = textMatch && softwareMatch && statusMatch;
                row.style.display = show ? '' : 'none';
                if (show) visibleCount++;
            }
            
            const header = document.getElementById('trial-list-header');
            if (header) {
                header.innerHTML = visibleCount < totalCount
                    ? '📋 Trial Registry (' + visibleCount + ' of ' + totalCount + ' shown)'
                    : '📋 Trial Registry (' + totalCount + ')';
            }
        }
    </script>
  `;
}

module.exports = { generateTrialTable };
