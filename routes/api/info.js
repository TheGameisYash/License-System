// routes/api/info.js - LICENSE INFORMATION
const express = require('express');
const router = express.Router();

const { getLicenseCached, logActivityBatched } = require('../../utils/optimization');
const { calculateDaysUntilExpiry, isLicenseExpired } = require('../../utils/helpers');

// ============================================================================
// GET /api/license-info - Get License Information
// ============================================================================

router.get('/', async (req, res) => {
  const { license } = req.query;
  
  try {
    if (!license) {
      return res.status(400).json({
        success: false,
        code: 'MISSING_PARAMETERS',
        message: 'License key required',
        data: null
      });
    }
    
    // Validate license format
    if (license.length < 10 || license.length > 100) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_LICENSE_FORMAT',
        message: 'Invalid license key format',
        data: null
      });
    }
    
    const lic = await getLicenseCached(license);
    
    if (!lic) {
      return res.status(404).json({
        success: false,
        code: 'INVALID_LICENSE',
        message: 'License not found',
        data: { license }
      });
    }
    
    await logActivityBatched('LICENSE_INFO_CHECKED', `License: ${license}`, req.ip, req.get('User-Agent'));
    
    const isExpired = isLicenseExpired(lic);
    const daysRemaining = calculateDaysUntilExpiry(lic.expiry);
    
    return res.json({
      success: true,
      code: 'LICENSE_INFO',
      message: 'License information retrieved',
      data: {
        license,
        isActivated: !!lic.hwid,
        isBanned: !!lic.banned,
        isExpired,
        expiry: lic.expiry,
        expiryDate: lic.expiry ? new Date(lic.expiry).toLocaleDateString() : 'Never',
        createdAt: lic.createdAt,
        createdDate: new Date(lic.createdAt).toLocaleDateString(),
        daysRemaining: daysRemaining !== null ? daysRemaining : 'Unlimited',
        deviceName: lic.hwid ? lic.deviceName : null,
        activatedAt: lic.activatedAt || null,
        lastValidated: lic.lastValidated || null,
        validationCount: lic.validationCount || 0,
        status: lic.banned ? 'Banned' : (isExpired ? 'Expired' : (lic.hwid ? 'Active' : 'Inactive'))
      }
    });
    
  } catch (error) {
    console.error('License info error:', error);
    return res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'Internal error',
      data: null
    });
  }
});

module.exports = router;
