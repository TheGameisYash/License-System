// views/announcements_page.js - Announcements management panel
function generateAnnouncementsPage(allSoftware, announcementsMap) {
  const typeInfo = {
    info: { icon: 'ℹ️', color: '#60a5fa', bg: 'rgba(96,165,250,0.06)', border: 'rgba(96,165,250,0.2)' },
    warning: { icon: '⚠️', color: '#f59e0b', bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.2)' },
    offer: { icon: '🎁', color: '#10b981', bg: 'rgba(16,185,129,0.06)', border: 'rgba(16,185,129,0.2)' },
    update: { icon: '🔄', color: '#a5b4fc', bg: 'rgba(165,180,252,0.06)', border: 'rgba(165,180,252,0.2)' }
  };

  let totalActive = 0;
  let totalAll = 0;
  allSoftware.forEach(sw => {
    const anns = announcementsMap[sw.id] || [];
    totalAll += anns.length;
    totalActive += anns.filter(a => a.active).length;
  });

  const styles = (() => { try { return require('./assets/styles').getStyles(); } catch(e) { return ''; } })();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Announcements Management - Admin Panel</title>
  ${styles}
</head>
<body>
<div class="container">
  <div class="header">
    <h1><span>📣</span> Alert Announcements</h1>
    <div class="header-actions">
      <button onclick="document.getElementById('createModal').style.display='block'" class="btn btn-primary">➕ Create Announcement</button>
      <a href="/admin" class="btn btn-primary">← Dashboard</a>
    </div>
  </div>

  <div class="stats-grid">
    <div class="stat-card" style="border-left: 3px solid #60a5fa;"><span class="stat-icon">📣</span><h3>Total Alerts</h3><div class="value" style="color:#60a5fa">${totalAll}</div><div class="label">All announcements</div></div>
    <div class="stat-card" style="border-left: 3px solid #10b981;"><span class="stat-icon">✅</span><h3>Active</h3><div class="value" style="color:#10b981">${totalActive}</div><div class="label">Published in API</div></div>
    <div class="stat-card" style="border-left: 3px solid #94a3b8;"><span class="stat-icon">⏸️</span><h3>Inactive</h3><div class="value" style="color:#94a3b8">${totalAll - totalActive}</div><div class="label">Hidden from API</div></div>
    <div class="stat-card" style="border-left: 3px solid #a5b4fc;"><span class="stat-icon">📦</span><h3>Products</h3><div class="value" style="color:#a5b4fc">${allSoftware.length}</div><div class="label">Software products</div></div>
  </div>

  ${allSoftware.length === 0 ? '<div class="section"><p style="color:#64748b;text-align:center;padding:40px;font-style:italic">No software products found. <a href="/admin/software" style="color:#818cf8">Create software first</a>.</p></div>' :
    allSoftware.map(sw => {
      const anns = announcementsMap[sw.id] || [];
      return `
      <div class="section">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;border-bottom:1px solid rgba(255,255,255,0.06);padding-bottom:10px;">
          <h2 style="border:none;margin:0;padding:0;">${sw.icon || '🔧'} ${sw.name} <span style="font-size:12px;color:#64748b;font-weight:500;margin-left:6px;">(${anns.length} alert logs)</span></h2>
          <a href="/admin/software/${sw.id}" class="btn btn-primary" style="padding:6px 14px;font-size:11px">⚙️ Manage Product</a>
        </div>

        <form method="post" action="/admin/announcements/create" style="margin-bottom:20px">
          <input type="hidden" name="softwareId" value="${sw.id}" />
          <div class="form-grid">
            <div>
                <label class="form-label">Alert Title *</label>
                <input name="title" placeholder="Notice title..." required style="width:100%" />
            </div>
            <div>
                <label class="form-label">Alert Type</label>
                <select name="type" style="width:100%">
                  <option value="info">ℹ️ Info</option>
                  <option value="warning">⚠️ Warning</option>
                  <option value="offer">🎁 Offer</option>
                  <option value="update">🔄 Update</option>
                </select>
            </div>
            <div>
                <label class="form-label">Expires At (optional)</label>
                <input name="expiresAt" type="datetime-local" style="width:100%" />
            </div>
            <div style="display: flex; align-items: flex-end; padding-bottom: 2px;">
                <button type="submit" class="btn btn-primary" style="width:100%;height:38px;">➕ Create Alert</button>
            </div>
          </div>
          <div style="margin-top:8px;">
              <label class="form-label">Alert Message *</label>
              <textarea name="message" placeholder="Type notice description here..." required style="width:100%;min-height:70px;resize:vertical"></textarea>
          </div>
        </form>

        ${anns.length === 0 ? '<p style="color:#64748b;font-size:12px;font-style:italic;padding:10px 0">No announcements posted for this software yet.</p>' :
          anns.map(a => {
            const t = typeInfo[a.type] || typeInfo.info;
            const now = new Date().toISOString();
            const expired = a.expiresAt && a.expiresAt < now;
            return `
            <div style="border-left:3px solid ${t.color};background:${t.bg};border:1px solid ${t.border};border-left:3px solid ${t.color};border-radius:12px;padding:16px;margin-bottom:12px;opacity:${!a.active ? '0.5' : '1'};transition:all 0.2s;">
              <div style="display:flex;justify-content:space-between;align-items:flex-start">
                <div style="flex:1">
                  <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
                    <span style="font-size:16px">${t.icon}</span>
                    <strong style="color:#f8fafc">${a.title}</strong>
                    <span class="status" style="font-size:8px;padding:2px 8px;background:rgba(255,255,255,0.06);color:${t.color};font-weight:800;border:1px solid ${t.border}">${(a.type||'info').toUpperCase()}</span>
                    ${!a.active ? '<span class="status inactive" style="font-size:8px;padding:2px 8px;">INACTIVE</span>' : ''}
                    ${expired ? '<span class="status expired" style="font-size:8px;padding:2px 8px;">EXPIRED</span>' : ''}
                  </div>
                  <p style="color:#cbd5e1;font-size:13px;margin:0 0 10px 0;line-height:1.5">${a.message}</p>
                  <div style="display:flex;gap:16px;font-size:11px;color:#64748b;font-weight:500;">
                    <span>Created: ${a.createdAt ? new Date(a.createdAt).toLocaleString() : '-'}</span>
                    ${a.expiresAt ? `<span>Expires: ${new Date(a.expiresAt).toLocaleString()}</span>` : '<span>No Expiry</span>'}
                    <span>Author: ${a.createdBy || 'admin'}</span>
                  </div>
                </div>
                <div style="display:flex;flex-direction:column;gap:6px;margin-left:16px;flex-shrink:0;">
                  <button onclick="toggleAnn('${sw.id}','${a.id}',this)" class="btn ${a.active ? 'btn-warning' : 'btn-success'}" style="padding:6px 12px;font-size:11px;white-space:nowrap">${a.active ? '⏸ Deactivate' : '▶ Activate'}</button>
                  <form method="post" action="/admin/announcements/${sw.id}/${a.id}/delete" style="display:inline">
                    <button class="btn btn-danger" style="padding:6px 12px;font-size:11px;width:100%" onclick="return confirm('Delete this announcement?')">🗑️ Delete</button>
                  </form>
                </div>
              </div>
            </div>`;
          }).join('')
        }
      </div>`;
    }).join('')
  }
</div>

<!-- Create Modal -->
<div id="createModal" class="modal">
  <div class="modal-content">
    <span class="close" onclick="document.getElementById('createModal').style.display='none'">&times;</span>
    <h2 style="color:#818cf8;margin-bottom:20px;border-bottom:1px solid rgba(255,255,255,0.06);padding-bottom:10px">📣 Create Announcement</h2>
    <form method="post" action="/admin/announcements/create">
      <div style="margin-bottom:15px">
        <label class="form-label">Target Software *</label>
        <select name="softwareId" required style="width:100%">
          ${allSoftware.map(sw => `<option value="${sw.id}">${sw.icon || '🔧'} ${sw.name}</option>`).join('')}
        </select>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:15px">
        <div><label class="form-label">Title *</label><input name="title" placeholder="Notice title..." required style="width:100%" /></div>
        <div>
          <label class="form-label">Type</label>
          <select name="type" style="width:100%">
            <option value="info">ℹ️ Info</option>
            <option value="warning">⚠️ Warning</option>
            <option value="offer">🎁 Offer</option>
            <option value="update">🔄 Update</option>
          </select>
        </div>
      </div>
      <div style="margin-bottom:15px"><label class="form-label">Message *</label><textarea name="message" placeholder="Enter notice description..." required style="width:100%;min-height:90px;resize:vertical"></textarea></div>
      <div style="margin-bottom:20px"><label class="form-label">Expires At (optional)</label><input name="expiresAt" type="datetime-local" style="width:100%" /></div>
      <button type="submit" class="btn btn-primary" style="width:100%">🚀 Publish Announcement</button>
    </form>
  </div>
</div>

<script>
window.onclick = e => { if (e.target.className === 'modal') e.target.style.display = 'none'; };
async function toggleAnn(swId, annId, btn) {
  const res = await fetch('/admin/announcements/'+swId+'/'+annId+'/toggle', {method:'POST'});
  const json = await res.json();
  if (json.success) {
    btn.textContent = json.active ? '⏸ Deactivate' : '▶ Activate';
    btn.className = json.active ? 'btn btn-warning' : 'btn btn-success';
    btn.closest('div[style*="border-left"]').style.opacity = json.active ? '1' : '0.5';
  }
}
</script>
</body></html>`;
}

module.exports = { generateAnnouncementsPage };
