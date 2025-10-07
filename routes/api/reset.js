// routes/api/reset.js - HWID RESET REQUEST WITH ALL EDGE CASES
const express = require('express');
const router = express.Router();

const {
  getLicenseCached,
  logActivityBatched
} = require('../../utils/optimization');

const { validateHWID, sanitizeInput } = require('../../utils/validators');
const { sendWebhook } = require('../../utils/webhook');
const { getDb } = require('../../config/firebase');

// ============================================================================
// POST /api/request-hwid-reset - Request HWID Reset
// ============================================================================

router.post('/', async (req, res) => {
  const { license, hwid, reason } = req.body;
  
  try {
    // ==================== VALIDATION ====================
    
    if (!license || !hwid) {
      return res.status(400).json({
        success: false,
        code: 'MISSING_PARAMETERS',
        message: 'License key and HWID required',
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
    
    // Validate reason length
    const cleanReason = sanitizeInput(reason) || 'No reason provided';
    if (cleanReason.length > 500) {
      return res.status(400).json({
        success: false,
        code: 'REASON_TOO_LONG',
        message: 'Reason must be less than 500 characters',
        data: null
      });
    }
    
    // ==================== LICENSE CHECK ====================
    
    const lic = await getLicenseCached(license);
    
    if (!lic) {
      return res.status(404).json({
        success: false,
        code: 'INVALID_LICENSE',
        message: 'License not found',
        data: { license }
      });
    }
    
    // Check if license is banned
    if (lic.banned) {
      return res.status(403).json({
        success: false,
        code: 'LICENSE_BANNED',
        message: 'Cannot request reset for banned license',
        data: { 
          license,
          banReason: lic.banReason
        }
      });
    }
    
    // Check if license is not activated
    if (!lic.hwid) {
      return res.status(400).json({
        success: false,
        code: 'NOT_ACTIVATED',
        message: 'License is not registered to any device',
        data: { 
          license,
          note: 'No reset needed - register your device directly'
        }
      });
    }
    
    // ==================== DUPLICATE REQUEST CHECK ====================
    
    const db = getDb();
    const existingRequest = await db.collection('reset_requests')
      .where('license', '==', license)
      .where('status', '==', 'pending')
      .get();
    
    if (!existingRequest.empty) {
      const existingData = existingRequest.docs[0].data();
      return res.status(409).json({
        success: false,
        code: 'REQUEST_ALREADY_EXISTS',
        message: 'A pending reset request already exists for this license',
        data: {
          requestId: existingRequest.docs[0].id,
          submittedAt: existingData.requestedAt,
          reason: existingData.reason,
          note: 'Please wait for admin approval or contact support'
        }
      });
    }
    
    // Check for recently denied requests (within 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const recentDenied = await db.collection('reset_requests')
      .where('license', '==', license)
      .where('status', '==', 'denied')
      .where('processedAt', '>', oneDayAgo)
      .get();
    
    if (!recentDenied.empty) {
      const deniedData = recentDenied.docs[0].data();
      return res.status(429).json({
        success: false,
        code: 'REQUEST_RECENTLY_DENIED',
        message: 'Your reset request was recently denied. Please wait 24 hours before requesting again.',
        data: {
          deniedAt: deniedData.processedAt,
          adminNote: deniedData.adminNote,
          note: 'Contact support if you have questions'
        }
      });
    }
    
    // ==================== RATE LIMITING ====================
    
    // Check for spam (more than 3 requests in 1 hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const recentRequests = await db.collection('reset_requests')
      .where('license', '==', license)
      .where('requestedAt', '>', oneHourAgo)
      .get();
    
    if (recentRequests.size >= 3) {
      return res.status(429).json({
        success: false,
        code: 'TOO_MANY_REQUESTS',
        message: 'Too many reset requests. Please wait before trying again.',
        data: {
          note: 'Maximum 3 requests per hour allowed'
        }
      });
    }
    
    // ==================== CREATE REQUEST ====================
    
    // Log HWID mismatch if different
    if (lic.hwid !== hwid) {
      await logActivityBatched(
        'RESET_REQUEST_DIFFERENT_HWID', 
        `License ${license}: Registered to ${lic.hwid.substring(0, 20)}..., requesting from ${hwid.substring(0, 20)}...`, 
        req.ip, 
        req.get('User-Agent'), 
        license, 
        'medium'
      );
    }
    
    const requestData = {
      license,
      currentHwid: lic.hwid ? lic.hwid.substring(0, 40) + '...' : 'Not registered',
      requestingHwid: hwid.substring(0, 40) + '...',
      fullCurrentHwid: lic.hwid || null,
      fullRequestingHwid: hwid,
      deviceName: lic.deviceName || 'Unknown',
      reason: cleanReason,
      requestedAt: new Date().toISOString(),
      status: 'pending',
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      isSameHwid: lic.hwid === hwid
    };
    
    const requestRef = await db.collection('reset_requests').add(requestData);
    
    await logActivityBatched('RESET_REQUEST_CREATED', `License: ${license}, RequestID: ${requestRef.id}`, req.ip, req.get('User-Agent'), license, 'medium');
    
    // Send webhook
    await sendWebhook('reset_request', { 
      license, 
      currentDevice: lic.deviceName || 'Unknown',
      currentHwid: lic.hwid ? lic.hwid.substring(0, 20) + '...' : 'Not registered',
      requestingHwid: hwid.substring(0, 20) + '...',
      reason: cleanReason,
      requestId: requestRef.id,
      isSameHwid: lic.hwid === hwid,
      ip: req.ip
    });
    
    return res.json({
      success: true,
      code: 'REQUEST_SUBMITTED',
      message: 'HWID reset request submitted successfully. An admin will review your request.',
      data: {
        requestId: requestRef.id,
        license,
        submittedAt: requestData.requestedAt,
        status: 'pending',
        estimatedReviewTime: '24-48 hours',
        note: 'You will be able to check the status using /api/check-request-status'
      }
    });
    
  } catch (error) {
    console.error('Reset request error:', error);
    
    await sendWebhook('api_error', {
      endpoint: '/api/request-hwid-reset',
      error: error.message,
      license: req.body.license || 'N/A',
      ip: req.ip
    });
    
    return res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'Internal server error',
      data: {
        requestId: Date.now().toString(36)
      }
    });
  }
});

// ============================================================================
// GET /api/check-request-status - Check Reset Request Status
// ============================================================================

router.get('/status', async (req, res) => {
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
    
    const db = getDb();
    const requestSnapshot = await db.collection('reset_requests')
      .where('license', '==', license)
      .orderBy('requestedAt', 'desc')
      .limit(1)
      .get();
    
    if (requestSnapshot.empty) {
      return res.json({
        success: true,
        code: 'NO_REQUEST',
        message: 'No reset requests found for this license',
        data: null
      });
    }
    
    const requestData = requestSnapshot.docs[0].data();
    const requestId = requestSnapshot.docs[0].id;
    
    return res.json({
      success: true,
      code: 'REQUEST_FOUND',
      message: 'Reset request found',
      data: {
        requestId,
        license: requestData.license,
        status: requestData.status,
        reason: requestData.reason,
        requestedAt: requestData.requestedAt,
        processedAt: requestData.processedAt || null,
        processedBy: requestData.processedBy || null,
        adminNote: requestData.adminNote || null,
        statusMessage: {
          pending: 'Your request is waiting for admin review',
          approved: 'Your request has been approved. HWID has been reset.',
          denied: 'Your request has been denied. Check adminNote for reason.'
        }[requestData.status]
      }
    });
    
  } catch (error) {
    console.error('Check request error:', error);
    return res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'Internal error',
      data: null
    });
  }
});

module.exports = router;
