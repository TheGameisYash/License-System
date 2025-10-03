// views/dashboard.js - ULTRA DYNAMIC Enhanced Admin Dashboard
const { CONFIG } = require('../config/constants');
const { formatTimeAgo, calculateDaysUntilExpiry, isLicenseExpired } = require('../utils/helpers');

function generateDashboard(licenses, settings, banlist, recentLogs, cache, pendingRequestsCount) {
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
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
            background-attachment: fixed;
            color: #e4e6eb;
            min-height: 100vh;
            padding: 20px;
        }
        .container { max-width: 1800px; margin: 0 auto; }
        
        /* Header */
        .header {
            background: rgba(35, 39, 46, 0.9);
            backdrop-filter: blur(20px);
            border-radius: 20px;
            padding: 25px 40px;
            margin-bottom: 25px;
            border: 1px solid rgba(0, 170, 238, 0.3);
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 8px 32px rgba(0, 170, 238, 0.2);
            animation: slideDown 0.6s ease-out;
        }
        
        @keyframes slideDown {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .header h1 {
            color: #00aaee;
            font-size: 28px;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .header-badge {
            background: linear-gradient(45deg, #00aaee, #0099cc);
            padding: 6px 16px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        
        .header-actions {
            display: flex;
            gap: 10px;
        }
        
        .btn {
            padding: 12px 24px;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.3s;
            text-decoration: none;
            display: inline-block;
        }
        
        .btn-primary {
            background: linear-gradient(45deg, #00aaee, #0099cc);
            color: white;
        }
        
        .btn-danger {
            background: linear-gradient(45deg, #ff4757, #ee5a6f);
            color: white;
        }
        
        .btn-warning {
            background: linear-gradient(45deg, #ffa502, #ff7f00);
            color: white;
        }
        
        .btn-success {
            background: linear-gradient(45deg, #2ecc71, #27ae60);
            color: white;
        }
        
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(0, 170, 238, 0.4);
        }
        
        /* Notification Badge */
        .notification-badge {
            position: relative;
            display: inline-block;
        }
        
        .notification-badge .badge {
            position: absolute;
            top: -8px;
            right: -8px;
            background: #ff4757;
            color: white;
            border-radius: 50%;
            padding: 4px 8px;
            font-size: 11px;
            font-weight: bold;
            animation: bounce 1s infinite;
        }
        
        @keyframes bounce {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }
        
        /* Stats Grid */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 25px;
        }
        
        .stat-card {
            background: rgba(35, 39, 46, 0.9);
            backdrop-filter: blur(20px);
            border-radius: 18px;
            padding: 22px;
            border: 1px solid rgba(0, 170, 238, 0.2);
            transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            cursor: pointer;
            position: relative;
            overflow: hidden;
        }
        
        .stat-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 3px;
            background: linear-gradient(90deg, #00aaee, #0099cc);
            transform: scaleX(0);
            transition: transform 0.4s;
        }
        
        .stat-card:hover::before {
            transform: scaleX(1);
        }
        
        .stat-card:hover {
            transform: translateY(-8px) scale(1.02);
            box-shadow: 0 15px 50px rgba(0, 170, 238, 0.3);
            border-color: rgba(0, 170, 238, 0.5);
        }
        
        .stat-card h3 {
            color: #8b8d94;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 10px;
            font-weight: 600;
        }
        
        .stat-card .value {
            font-size: 32px;
            font-weight: 700;
            color: #00aaee;
            margin-bottom: 6px;
            transition: transform 0.3s;
        }
        
        .stat-card:hover .value {
            transform: scale(1.1);
        }
        
        .stat-card .label {
            color: #a0a3a8;
            font-size: 11px;
        }
        
        .stat-icon {
            position: absolute;
            right: 18px;
            top: 18px;
            font-size: 28px;
            opacity: 0.15;
        }
        
        /* Section */
        .section {
            background: rgba(35, 39, 46, 0.9);
            backdrop-filter: blur(20px);
            border-radius: 18px;
            padding: 28px;
            margin-bottom: 20px;
            border: 1px solid rgba(0, 170, 238, 0.2);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
            animation: fadeIn 0.6s ease-out;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        .section h2 {
            color: #00aaee;
            margin-bottom: 20px;
            font-size: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        /* Form */
        .form-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 12px;
            margin-bottom: 15px;
        }
        
        input, select, textarea {
            background: rgba(26, 29, 35, 0.9);
            border: 2px solid rgba(0, 170, 238, 0.3);
            color: #e4e6eb;
            padding: 12px 16px;
            border-radius: 10px;
            font-size: 13px;
            transition: all 0.3s;
            width: 100%;
        }
        
        input:focus, select:focus, textarea:focus {
            outline: none;
            border-color: #00aaee;
            box-shadow: 0 0 0 3px rgba(0, 170, 238, 0.15);
            transform: translateY(-1px);
        }
        
        /* Table */
        .table-container {
            overflow-x: auto;
            border-radius: 12px;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
        }
        
        th {
            background: rgba(0, 170, 238, 0.15);
            color: #00aaee;
            padding: 14px;
            text-align: left;
            font-weight: 600;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            position: sticky;
            top: 0;
            z-index: 10;
        }
        
        td {
            padding: 14px;
            border-bottom: 1px solid rgba(0, 170, 238, 0.08);
            font-size: 13px;
        }
        
        tr:hover {
            background: rgba(0, 170, 238, 0.06);
            transition: background 0.2s;
        }
        
        .license-key {
            font-family: 'Courier New', monospace;
            background: rgba(0, 170, 238, 0.12);
            padding: 6px 10px;
            border-radius: 6px;
            font-size: 11px;
            border: 1px solid rgba(0, 170, 238, 0.25);
            cursor: pointer;
            transition: all 0.2s;
            display: inline-block;
        }
        
        .license-key:hover {
            background: rgba(0, 170, 238, 0.2);
            transform: translateX(3px);
        }
        
        /* Status Badges */
        .status {
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            display: inline-block;
        }
        
        .status.active {
            background: rgba(46, 204, 113, 0.15);
            color: #2ecc71;
            border: 1px solid rgba(46, 204, 113, 0.4);
        }
        
        .status.inactive {
            background: rgba(149, 165, 166, 0.15);
            color: #95a5a6;
            border: 1px solid rgba(149, 165, 166, 0.4);
        }
        
        .status.expired {
            background: rgba(231, 76, 60, 0.15);
            color: #e74c3c;
            border: 1px solid rgba(231, 76, 60, 0.4);
        }
        
        .status.banned {
            background: rgba(255, 71, 87, 0.15);
            color: #ff4757;
            border: 1px solid rgba(255, 71, 87, 0.4);
            animation: blink 2s infinite;
        }
        
        @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
        }
        
        /* Toggle Switch */
        .toggle-switch {
            position: relative;
            display: inline-block;
            width: 50px;
            height: 26px;
        }
        
        .toggle-switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }
        
        .toggle-slider {
            position: absolute;
            cursor: pointer;
            top: 0; left: 0; right: 0; bottom: 0;
            background-color: #555;
            transition: .3s;
            border-radius: 26px;
        }
        
        .toggle-slider:before {
            position: absolute;
            content: "";
            height: 18px;
            width: 18px;
            left: 4px;
            bottom: 4px;
            background-color: white;
            transition: .3s;
            border-radius: 50%;
        }
        
        input:checked + .toggle-slider {
            background: linear-gradient(45deg, #00aaee, #0099cc);
        }
        
        input:checked + .toggle-slider:before {
            transform: translateX(24px);
        }
        
        /* Search Box */
        .search-box {
            position: relative;
            margin-bottom: 18px;
        }
        
        .search-box input {
            padding-left: 40px;
        }
        
        .search-icon {
            position: absolute;
            left: 14px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 16px;
            color: #8b8d94;
        }
        
        /* Modal */
        .modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(5px);
        }
        
        .modal-content {
            background: rgba(35, 39, 46, 0.98);
            margin: 10% auto;
            padding: 30px;
            border: 1px solid rgba(0, 170, 238, 0.3);
            border-radius: 18px;
            width: 90%;
            max-width: 500px;
            animation: slideUp 0.3s ease-out;
        }
        
        @keyframes slideUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .close {
            color: #8b8d94;
            float: right;
            font-size: 28px;
            font-weight: bold;
            cursor: pointer;
            transition: color 0.2s;
        }
        
        .close:hover {
            color: #00aaee;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            .header {
                flex-direction: column;
                gap: 12px;
                text-align: center;
            }
            .stats-grid {
                grid-template-columns: 1fr;
            }
            .form-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>
                <span>🔐</span>
                Ultra License System
                <span class="header-badge">v${CONFIG.API_VERSION}</span>
            </h1>
            <div class="header-actions">
                <a href="/admin/reset-requests" class="btn btn-warning notification-badge">
                    📋 Reset Requests
                    ${pendingRequestsCount > 0 ? `<span class="badge">${pendingRequestsCount}</span>` : ''}
                </a>
                <a href="/" class="btn btn-primary">🏠 Home</a>
                <form method="post" action="/auth/logout" style="display: inline;">
                    <button type="submit" class="btn btn-danger">Logout</button>
                </form>
            </div>
        </div>
        
        <!-- Stats -->
        <div class="stats-grid">
            <div class="stat-card">
                <span class="stat-icon">📦</span>
                <h3>Total Licenses</h3>
                <div class="value">${totalLicenses}</div>
                <div class="label">All licenses in system</div>
            </div>
            <div class="stat-card">
                <span class="stat-icon">✅</span>
                <h3>Active</h3>
                <div class="value" style="color: #2ecc71;">${activeLicenses}</div>
                <div class="label">Working & valid</div>
            </div>
            <div class="stat-card">
                <span class="stat-icon">⏸️</span>
                <h3>Inactive</h3>
                <div class="value" style="color: #95a5a6;">${inactiveLicenses}</div>
                <div class="label">Not activated</div>
            </div>
            <div class="stat-card">
                <span class="stat-icon">❌</span>
                <h3>Expired</h3>
                <div class="value" style="color: #e74c3c;">${expiredLicenses}</div>
                <div class="label">Past expiry</div>
            </div>
            <div class="stat-card">
                <span class="stat-icon">🚫</span>
                <h3>Banned</h3>
                <div class="value" style="color: #ff4757;">${bannedLicenses}</div>
                <div class="label">Blocked licenses</div>
            </div>
            <div class="stat-card">
                <span class="stat-icon">⚡</span>
                <h3>Cache</h3>
                <div class="value" style="color: #00aaee;">${cache.licenseCache.size}</div>
                <div class="label">Cached items</div>
            </div>
        </div>
        
        <!-- License Generation -->
        <div class="section">
            <h2>🎫 License Generation</h2>
            <form method="post" action="/admin/generate-license">
                <div class="form-grid">
                    <input name="license" placeholder="Custom Key (optional)" />
                    <input name="expiry" type="date" />
                    <button type="submit" class="btn btn-primary">Generate</button>
                </div>
            </form>
            <form method="post" action="/admin/bulk-generate">
                <div class="form-grid">
                    <input name="count" type="number" placeholder="Qty (max 100)" min="1" max="100" />
                    <input name="prefix" placeholder="Prefix" />
                    <input name="expiry" type="date" />
                    <button type="submit" class="btn btn-primary">Bulk Generate</button>
                </div>
            </form>
        </div>
        
        <!-- Settings -->
        <div class="section">
            <h2>⚙️ System Settings</h2>
            <form method="post" action="/admin/update-settings">
                <div style="display: flex; gap: 25px; align-items: center; margin-bottom: 15px; flex-wrap: wrap;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span>API Enabled</span>
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
                    <button type="submit" class="btn btn-warning">🧹 Clear Cache</button>
                </form>
                <form method="post" action="/admin/clear-logs" style="display: inline;">
                    <input type="hidden" name="days" value="30" />
                    <button type="submit" class="btn btn-warning">🗑️ Clear Logs</button>
                </form>
            </div>
        </div>
        
        <!-- HWID Ban -->
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
                            <span style="font-family: monospace; font-size: 12px; color: #e4e6eb;">${hwid.substring(0, 35)}...</span>
                            <form method="post" action="/admin/unban-hwid" style="display: inline;">
                                <input type="hidden" name="hwid" value="${hwid}" />
                                <button type="submit" class="btn btn-success" style="padding: 6px 14px; font-size: 11px;">Unban</button>
                            </form>
                        </div>
                    `).join('')}
                    ${banlist.length > 5 ? `<p style="color: #8b8d94; font-size: 12px; margin-top: 8px;">...and ${banlist.length - 5} more</p>` : ''}
                </div>
            ` : '<p style="color: #8b8d94; font-size: 13px;">No banned HWIDs</p>'}
        </div>
        
        <!-- License List -->
        <div class="section">
            <h2>📋 License List (${totalLicenses})</h2>
            <div class="search-box">
                <span class="search-icon">🔍</span>
                <input type="text" id="searchInput" placeholder="Search licenses, devices, HWID..." onkeyup="filterTable()" />
            </div>
            <div class="table-container">
                <table id="licenseTable">
                    <thead>
                        <tr>
                            <th>License Key</th>
                            <th>Device</th>
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
                                    <div class="license-key" onclick="copyToClipboard('${key}')" title="Click to copy">${key}</div>
                                    ${val.notes && val.notes.length > 0 ? '<div style="font-size: 10px; color: #ffa502; margin-top: 4px;">📝 Has notes</div>' : ''}
                                </td>
                                <td>
                                    ${val.hwid ? `
                                        <div style="font-weight: 600; color: #00aaee;">${val.deviceName || 'Unknown'}</div>
                                        <div style="font-size: 10px; color: #8b8d94; font-family: monospace;">${val.hwid.substring(0, 18)}...</div>
                                    ` : '<span style="color: #8b8d94;">Not activated</span>'}
                                </td>
                                <td>
                                    ${val.expiry ? `
                                        <div>${new Date(val.expiry).toLocaleDateString()}</div>
                                        <div style="font-size: 10px; color: ${expired ? '#e74c3c' : '#2ecc71'};">
                                            ${expired ? 'Expired' : `${calculateDaysUntilExpiry(val.expiry)} days left`}
                                        </div>
                                    ` : '<span style="color: #2ecc71;">Never</span>'}
                                </td>
                                <td><span class="status ${statusClass}">${statusText}</span></td>
                                <td>
                                    <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                                        ${val.hwid && !banned ? `
                                            <form method="post" action="/admin/reset-hwid" style="display: inline;">
                                                <input type="hidden" name="license" value="${key}" />
                                                <button type="submit" class="btn btn-warning" style="padding: 6px 12px; font-size: 11px;" onclick="return confirm('Reset HWID?')">↻</button>
                                            </form>
                                        ` : ''}
                                        ${!banned ? `
                                            <button onclick="showBanModal('${key}')" class="btn btn-danger" style="padding: 6px 12px; font-size: 11px;">🚫</button>
                                        ` : `
                                            <form method="post" action="/admin/unban-license" style="display: inline;">
                                                <input type="hidden" name="license" value="${key}" />
                                                <button type="submit" class="btn btn-success" style="padding: 6px 12px; font-size: 11px;">Unban</button>
                                            </form>
                                        `}
                                        <button onclick="showNoteModal('${key}')" class="btn btn-primary" style="padding: 6px 12px; font-size: 11px;">📝</button>
                                        <form method="post" action="/admin/delete-license" style="display: inline;">
                                            <input type="hidden" name="license" value="${key}" />
                                            <button type="submit" class="btn btn-danger" style="padding: 6px 12px; font-size: 11px;" onclick="return confirm('Delete?')">🗑️</button>
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
    </div>
    
    <!-- Ban License Modal -->
    <div id="banModal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="closeBanModal()">&times;</span>
            <h2 style="color: #ff4757; margin-bottom: 20px;">🚫 Ban License</h2>
            <form method="post" action="/admin/ban-license" id="banForm">
                <input type="hidden" name="license" id="banLicenseKey" />
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 8px; color: #a0a3a8;">Reason:</label>
                    <input name="reason" placeholder="Ban reason" required style="width: 100%;" />
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 8px; color: #a0a3a8;">Duration (days, leave empty for permanent):</label>
                    <input name="duration" type="number" placeholder="Days (optional)" style="width: 100%;" />
                </div>
                <button type="submit" class="btn btn-danger" style="width: 100%;">Ban License</button>
            </form>
        </div>
    </div>
    
    <!-- Add Note Modal -->
    <div id="noteModal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="closeNoteModal()">&times;</span>
            <h2 style="color: #00aaee; margin-bottom: 20px;">📝 Add Note</h2>
            <form method="post" action="/admin/add-license-note" id="noteForm">
                <input type="hidden" name="license" id="noteLicenseKey" />
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 8px; color: #a0a3a8;">Note:</label>
                    <textarea name="note" placeholder="Add a note about this license..." required style="width: 100%; min-height: 100px;"></textarea>
                </div>
                <button type="submit" class="btn btn-primary" style="width: 100%;">Add Note</button>
            </form>
        </div>
    </div>
    
    <script>
        // Filter table
        function filterTable() {
            const input = document.getElementById('searchInput');
            const filter = input.value.toUpperCase();
            const table = document.getElementById('licenseTable');
            const tr = table.getElementsByTagName('tr');
            
            for (let i = 1; i < tr.length; i++) {
                const td = tr[i].getElementsByTagName('td');
                let found = false;
                
                for (let j = 0; j < td.length; j++) {
                    if (td[j]) {
                        const txtValue = td[j].textContent || td[j].innerText;
                        if (txtValue.toUpperCase().indexOf(filter) > -1) {
                            found = true;
                            break;
                        }
                    }
                }
                
                tr[i].style.display = found ? '' : 'none';
            }
        }
        
        // Copy to clipboard
        function copyToClipboard(text) {
            navigator.clipboard.writeText(text).then(() => {
                showNotification('✅ Copied: ' + text);
            });
        }
        
        // Show notification
        function showNotification(message) {
            const notification = document.createElement('div');
            notification.innerHTML = message;
            notification.style.cssText = \`
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(45deg, #2ecc71, #27ae60);
                color: white;
                padding: 15px 25px;
                border-radius: 10px;
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
                z-index: 10000;
                animation: slideInRight 0.4s, fadeOut 0.4s 2.5s;
                font-size: 14px;
                font-weight: 600;
            \`;
            document.body.appendChild(notification);
            setTimeout(() => notification.remove(), 3000);
        }
        
        // Ban modal
        function showBanModal(license) {
            document.getElementById('banLicenseKey').value = license;
            document.getElementById('banModal').style.display = 'block';
        }
        
        function closeBanModal() {
            document.getElementById('banModal').style.display = 'none';
        }
        
        // Note modal
        function showNoteModal(license) {
            document.getElementById('noteLicenseKey').value = license;
            document.getElementById('noteModal').style.display = 'block';
        }
        
        function closeNoteModal() {
            document.getElementById('noteModal').style.display = 'none';
        }
        
        // Close modals on outside click
        window.onclick = function(event) {
            if (event.target.className === 'modal') {
                event.target.style.display = 'none';
            }
        }
        
        // Animation styles
        const style = document.createElement('style');
        style.textContent = \`
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
        \`;
        document.head.appendChild(style);
    </script>
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
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
            background-attachment: fixed;
            color: #e4e6eb;
            min-height: 100vh;
            padding: 20px;
        }
        .container { max-width: 1400px; margin: 0 auto; }
        .header {
            background: rgba(35, 39, 46, 0.9);
            backdrop-filter: blur(20px);
            border-radius: 20px;
            padding: 25px 40px;
            margin-bottom: 25px;
            border: 1px solid rgba(0, 170, 238, 0.3);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .header h1 { color: #00aaee; font-size: 28px; }
        .btn {
            padding: 12px 24px;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.3s;
            text-decoration: none;
            display: inline-block;
        }
        .btn-primary { background: linear-gradient(45deg, #00aaee, #0099cc); color: white; }
        .btn-success { background: linear-gradient(45deg, #2ecc71, #27ae60); color: white; }
        .btn-danger { background: linear-gradient(45deg, #ff4757, #ee5a6f); color: white; }
        .btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0, 170, 238, 0.4); }
        .section {
            background: rgba(35, 39, 46, 0.9);
            backdrop-filter: blur(20px);
            border-radius: 18px;
            padding: 28px;
            margin-bottom: 20px;
            border: 1px solid rgba(0, 170, 238, 0.2);
        }
        .section h2 { color: #00aaee; margin-bottom: 20px; font-size: 20px; }
        .request-card {
            background: rgba(26, 29, 35, 0.8);
            border-left: 4px solid #ffa502;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 15px;
            transition: all 0.3s;
        }
        .request-card:hover {
            transform: translateX(5px);
            box-shadow: 0 8px 25px rgba(255, 165, 2, 0.2);
        }
        .request-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        .request-license {
            font-family: 'Courier New', monospace;
            font-size: 14px;
            color: #00aaee;
            font-weight: 600;
        }
        .request-time {
            font-size: 12px;
            color: #8b8d94;
        }
        .request-info {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 10px;
            margin-bottom: 15px;
        }
        .info-item {
            font-size: 13px;
        }
        .info-label {
            color: #8b8d94;
            font-size: 11px;
            text-transform: uppercase;
            margin-bottom: 4px;
        }
        .info-value {
            color: #e4e6eb;
        }
        .request-actions {
            display: flex;
            gap: 10px;
        }
        .status-badge {
            padding: 4px 12px;
            border-radius: 15px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
        }
        .status-pending { background: rgba(255, 165, 2, 0.2); color: #ffa502; border: 1px solid #ffa502; }
        .status-approved { background: rgba(46, 204, 113, 0.2); color: #2ecc71; border: 1px solid #2ecc71; }
        .status-denied { background: rgba(231, 76, 60, 0.2); color: #e74c3c; border: 1px solid #e74c3c; }
        .modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(5px);
        }
        .modal-content {
            background: rgba(35, 39, 46, 0.98);
            margin: 15% auto;
            padding: 30px;
            border: 1px solid rgba(0, 170, 238, 0.3);
            border-radius: 18px;
            width: 90%;
            max-width: 500px;
        }
        .close {
            color: #8b8d94;
            float: right;
            font-size: 28px;
            font-weight: bold;
            cursor: pointer;
        }
        .close:hover { color: #00aaee; }
        input, textarea {
            background: rgba(26, 29, 35, 0.9);
            border: 2px solid rgba(0, 170, 238, 0.3);
            color: #e4e6eb;
            padding: 12px 16px;
            border-radius: 10px;
            font-size: 13px;
            width: 100%;
            margin-top: 10px;
        }
        input:focus, textarea:focus {
            outline: none;
            border-color: #00aaee;
        }
    </style>
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
                <div class="request-card">
                    <div class="request-header">
                        <div class="request-license">${req.license}</div>
                        <span class="status-badge status-pending">Pending</span>
                    </div>
                    <div class="request-info">
                        <div class="info-item">
                            <div class="info-label">HWID</div>
                            <div class="info-value">${req.hwid}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Requested</div>
                            <div class="info-value">${new Date(req.requestedAt).toLocaleString()}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Reason</div>
                            <div class="info-value">${req.reason}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">IP Address</div>
                            <div class="info-value">${req.ip}</div>
                        </div>
                    </div>
                    <div class="request-actions">
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
                <div class="request-card" style="border-left-color: ${req.status === 'approved' ? '#2ecc71' : '#e74c3c'};">
                    <div class="request-header">
                        <div class="request-license">${req.license}</div>
                        <span class="status-badge status-${req.status}">${req.status}</span>
                    </div>
                    <div class="request-info">
                        <div class="info-item">
                            <div class="info-label">Processed By</div>
                            <div class="info-value">${req.processedBy || 'N/A'}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Processed At</div>
                            <div class="info-value">${req.processedAt ? new Date(req.processedAt).toLocaleString() : 'N/A'}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Admin Note</div>
                            <div class="info-value">${req.adminNote || 'No note'}</div>
                        </div>
                    </div>
                </div>
            `).join('') : '<p style="color: #8b8d94;">No processed requests</p>'}
        </div>
    </div>
    
    <!-- Deny Modal -->
    <div id="denyModal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="closeDenyModal()">&times;</span>
            <h2 style="color: #e74c3c; margin-bottom: 20px;">❌ Deny Request</h2>
            <form method="post" action="/admin/deny-reset-request" id="denyForm">
                <input type="hidden" name="requestId" id="denyRequestId" />
                <label style="color: #a0a3a8;">Reason for denial:</label>
                <textarea name="reason" placeholder="Explain why this request is denied..." required style="min-height: 100px;"></textarea>
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
            if (event.target.className === 'modal') {
                event.target.style.display = 'none';
            }
        }
    </script>
</body>
</html>
  `;
}

module.exports = { generateDashboard, generateRequestManagementPage };
