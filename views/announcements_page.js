// views/announcements_page.js - Announcements management panel
function generateAnnouncementsPage(allSoftware, announcementsMap) {
  const typeInfo = {
    info: { icon: 'ℹ️', color: '#00aaee', bg: 'rgba(0,170,238,0.15)' },
    warning: { icon: '⚠️', color: '#ffa502', bg: 'rgba(255,165,2,0.15)' },
    offer: { icon: '🎁', color: '#2ecc71', bg: 'rgba(46,204,113,0.15)' },
    update: { icon: '🔄', color: '#9b59b6', bg: 'rgba(155,89,182,0.15)' }
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
  <title>Announcements - Admin Panel</title>
  ${styles}
</head>
<body>
<div class="container">
  <div class="header">
    <h1><span>📣</span> Announcements</h1>
    <div class="header-actions">
      <button onclick="document.getElementById('createModal').style.display='block'" class="btn btn-primary">➕ Create Announcement</button>
      <a href="/admin" class="btn btn-primary">← Dashboard</a>
      <form method="post" action="/auth/logout" style="display:inline"><button type="submit" class="btn btn-danger">Logout</button></form>
    </div>
  </div>

  <div class="stats-grid">
    <div class="stat-card"><span class="stat-icon">📣</span><h3>Total</h3><div class="value">${totalAll}</div><div class="label">All announcements</div></div>
    <div class="stat-card"><span class="stat-icon">✅</span><h3>Active</h3><div class="value" style="color:#2ecc71">${totalActive}</div><div class="label">Showing in API</div></div>
    <div class="stat-card"><span class="stat-icon">⏸️</span><h3>Inactive</h3><div class="value" style="color:#8b8d94">${totalAll - totalActive}</div><div class="label">Hidden from API</div></div>
    <div class="stat-card"><span class="stat-icon">📦</span><h3>Software</h3><div class="value" style="color:#00aaee">${allSoftware.length}</div><div class="label">Products</div></div>
  </div>

  ${allSoftware.length === 0 ? '<div class="section"><p style="color:#8b8d94;text-align:center;padding:40px">No software products found. <a href="/admin/software" style="color:#00aaee">Create software first</a>.</p></div>' :
    allSoftware.map(sw => {
      const anns = announcementsMap[sw.id] || [];
      return `
      <div class="section">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
          <h2>${sw.icon || '🔧'} ${sw.name} <span style="font-size:13px;color:#8b8d94;font-weight:400">(${anns.length} announcements)</span></h2>
          <a href="/admin/software/${sw.id}" class="btn btn-primary" style="padding:6px 14px;font-size:12px">⚙️ Manage Software</a>
        </div>

        <form method="post" action="/admin/announcements/create" style="margin-bottom:16px">
          <input type="hidden" name="softwareId" value="${sw.id}" />
          <div class="form-grid">
            <input name="title" placeholder="Title *" required />
            <select name="type">
              <option value="info">ℹ️ Info</option>
              <option value="warning">⚠️ Warning</option>
              <option value="offer">🎁 Offer</option>
              <option value="update">🔄 Update</option>
            </select>
            <input name="expiresAt" type="datetime-local" title="Expires at (optional)" />
            <button type="submit" class="btn btn-primary">Add</button>
          </div>
          <textarea name="message" placeholder="Message *" required style="width:100%;min-height:70px;margin-top:8px;resize:vertical"></textarea>
        </form>

        ${anns.length === 0 ? '<p style="color:#8b8d94;font-size:13px;padding:10px 0">No announcements for this software yet.</p>' :
          anns.map(a => {
            const t = typeInfo[a.type] || typeInfo.info;
            const now = new Date().toISOString();
            const expired = a.expiresAt && a.expiresAt < now;
            return `
            <div style="border-left:4px solid ${t.color};background:${t.bg};border-radius:12px;padding:16px;margin-bottom:12px;opacity:${!a.active ? '0.6' : '1'}">
              <div style="display:flex;justify-content:space-between;align-items:flex-start">
                <div style="flex:1">
                  <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
                    <span style="font-size:16px">${t.icon}</span>
                    <strong style="color:#e4e6eb">${a.title}</strong>
                    <span style="font-size:10px;padding:2px 8px;border-radius:8px;background:rgba(255,255,255,0.08);color:${t.color};font-weight:700">${(a.type||'info').toUpperCase()}</span>
                    ${!a.active ? '<span style="font-size:10px;padding:2px 8px;border-radius:8px;background:rgba(149,165,166,0.2);color:#95a5a6">INACTIVE</span>' : ''}
                    ${expired ? '<span style="font-size:10px;padding:2px 8px;border-radius:8px;background:rgba(231,76,60,0.2);color:#e74c3c">EXPIRED</span>' : ''}
                  </div>
                  <p style="color:#a0a3a8;font-size:13px;margin:0 0 8px 0">${a.message}</p>
                  <div style="display:flex;gap:16px;font-size:11px;color:#8b8d94">
                    <span>Created: ${a.createdAt ? new Date(a.createdAt).toLocaleString() : '-'}</span>
                    ${a.expiresAt ? `<span>Expires: ${new Date(a.expiresAt).toLocaleString()}</span>` : '<span>No expiry</span>'}
                    <span>By: ${a.createdBy || 'admin'}</span>
                  </div>
                </div>
                <div style="display:flex;flex-direction:column;gap:6px;margin-left:16px">
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
    <h2 style="color:#00aaee;margin-bottom:20px">📣 Create Announcement</h2>
    <form method="post" action="/admin/announcements/create">
      <div style="margin-bottom:15px">
        <label class="form-label">Target Software *</label>
        <select name="softwareId" required style="width:100%">
          ${allSoftware.map(sw => `<option value="${sw.id}">${sw.icon || ''} ${sw.name}</option>`).join('')}
        </select>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:15px">
        <div><label class="form-label">Title *</label><input name="title" placeholder="e.g. Flash Sale!" required style="width:100%" /></div>
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
      <div style="margin-bottom:15px"><label class="form-label">Message *</label><textarea name="message" placeholder="Enter your message..." required style="width:100%;min-height:100px;resize:vertical"></textarea></div>
      <div style="margin-bottom:20px"><label class="form-label">Expires At (optional)</label><input name="expiresAt" type="datetime-local" style="width:100%" /></div>
      <button type="submit" class="btn btn-primary" style="width:100%">Create Announcement</button>
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
    btn.closest('div[style*="border-left"]').style.opacity = json.active ? '1' : '0.6';
  }
}
</script>
</body></html>`;
}

module.exports = { generateAnnouncementsPage };
