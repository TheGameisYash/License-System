// routes/api/software.js - Public software info endpoints
const express = require('express');
const router = express.Router();
const { getSoftwareCached, getAnnouncementsCached } = require('../../utils/optimization');

// GET /api/software/:id/version
router.get('/:id/version', async (req, res) => {
  try {
    const sw = await getSoftwareCached(req.params.id);
    if (!sw) return res.status(404).json({ success: false, code: 'NOT_FOUND', message: 'Software not found' });
    if (!sw.versionCheck) return res.status(403).json({ success: false, code: 'VERSION_CHECK_DISABLED', message: 'Version check is not enabled for this software' });
    return res.json({
      success: true,
      data: { name: sw.name, latestVersion: sw.latestVersion || '1.0.0', downloadUrl: sw.downloadUrl || '', updatedAt: sw.updatedAt || sw.createdAt }
    });
  } catch (error) {
    console.error('Version check error:', error);
    return res.status(500).json({ success: false, code: 'SERVER_ERROR', message: 'Internal server error' });
  }
});

// GET /api/software/:id/announcements
router.get('/:id/announcements', async (req, res) => {
  try {
    const sw = await getSoftwareCached(req.params.id);
    if (!sw) return res.status(404).json({ success: false, code: 'NOT_FOUND', message: 'Software not found' });
    const announcements = await getAnnouncementsCached(req.params.id);
    return res.json({ success: true, data: { software: sw.name, announcements } });
  } catch (error) {
    console.error('Announcements error:', error);
    return res.status(500).json({ success: false, code: 'SERVER_ERROR', message: 'Internal server error' });
  }
});

module.exports = router;
