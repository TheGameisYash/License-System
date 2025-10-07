// routes/api/ban.js - BAN CHECK API
const express = require('express');
const router = express.Router();

const { getBanlistCached, logActivityBatched } = require('../../utils/optimization');
const { validateHWID } = require('../../utils/validators');

// ============================================================================
// GET /api/check-ban - Check if HWID is Banned
// ============================================================================

router.get('/', async (req, res) => {
  const { hwid } = req.query;
  
  try {
    // ==================== VALIDATION ====================
    
    if (!hwid) {
      return res.status(400).json({
        success: false,
        code: 'MISSING_PARAMETERS',
        message: 'HWID required',
        data: null
      });
    }
    
    if (!validateHWID(hwid)) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_HWID',
        message: 'Invalid HWID format',
        data: null
      });
    }
    
    // ==================== BAN CHECK ====================
    
    const banlist = await getBanlistCached();
    const isBanned = banlist.includes(hwid);
    
    // Log ban check attempts (useful for tracking)
    if (isBanned) {
      await logActivityBatched(
        'BANNED_HWID_CHECK', 
        `HWID: ${hwid.substring(0, 20)}...`, 
        req.ip, 
        req.get('User-Agent'),
        null,
        'medium'
      );
    }
    
    return res.json({
      success: true,
      code: isBanned ? 'BANNED' : 'NOT_BANNED',
      message: isBanned ? 'HWID is banned from the system' : 'HWID is not banned',
      data: {
        hwid: hwid.substring(0, 20) + '...',
        isBanned,
        checkedAt: new Date().toISOString(),
        note: isBanned ? 'Contact support if you believe this is an error' : null
      }
    });
    
  } catch (error) {
    console.error('Ban check error:', error);
    return res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'Internal error',
      data: null
    });
  }
});

module.exports = router;
