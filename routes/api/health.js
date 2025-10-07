// routes/api/health.js - HEALTH CHECK & SYSTEM STATUS
const express = require('express');
const router = express.Router();

const { getSettingsCached } = require('../../utils/optimization');
const cache = require('../../utils/cache');
const { CONFIG } = require('../../config/constants');

// ============================================================================
// GET /api/health - Health Check
// ============================================================================

router.get('/', async (req, res) => {
  try {
    const settings = await getSettingsCached();
    const uptime = process.uptime();
    
    // Calculate uptime in human-readable format
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    
    const uptimeFormatted = days > 0 
      ? `${days}d ${hours}h ${minutes}m ${seconds}s`
      : hours > 0
      ? `${hours}h ${minutes}m ${seconds}s`
      : minutes > 0
      ? `${minutes}m ${seconds}s`
      : `${seconds}s`;
    
    res.json({
      success: true,
      status: 'healthy',
      message: 'API is running normally',
      data: {
        version: CONFIG.API_VERSION,
        timestamp: new Date().toISOString(),
        uptime: {
          seconds: Math.floor(uptime),
          formatted: uptimeFormatted
        },
        cache: {
          licenses: cache.licenseCache.size,
          validations: cache.recentValidations.size,
          pendingLogs: cache.activityLogBatch.length,
          settings: cache.settingsCache ? 1 : 0,
          banlist: cache.banlistCache ? cache.banlistCache.length : 0
        },
        system: {
          apiEnabled: settings.apiEnabled,
          nodeVersion: process.version,
          platform: process.platform,
          arch: process.arch,
          memoryUsage: {
            heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
            heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
            rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + ' MB'
          }
        },
        endpoints: {
          register: '/api/register',
          validate: '/api/validate',
          licenseInfo: '/api/license-info',
          requestReset: '/api/request-hwid-reset',
          checkStatus: '/api/check-request-status',
          checkBan: '/api/check-ban',
          health: '/api/health'
        }
      }
    });
    
  } catch (error) {
    console.error('Health check error:', error);
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      message: 'System health check failed',
      data: {
        error: error.message,
        timestamp: new Date().toISOString()
      }
    });
  }
});

// ============================================================================
// GET /api/health/detailed - Detailed System Status (For Monitoring)
// ============================================================================

router.get('/detailed', async (req, res) => {
  try {
    const settings = await getSettingsCached();
    const { getDb } = require('../../config/firebase');
    const db = getDb();
    
    // Get database stats
    const licensesSnapshot = await db.collection('licenses').limit(1).get();
    const requestsSnapshot = await db.collection('reset_requests')
      .where('status', '==', 'pending')
      .get();
    
    const uptime = process.uptime();
    const memUsage = process.memoryUsage();
    
    res.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      system: {
        version: CONFIG.API_VERSION,
        uptime: Math.floor(uptime),
        apiEnabled: settings.apiEnabled,
        environment: process.env.NODE_ENV || 'production',
        nodeVersion: process.version,
        platform: process.platform,
        pid: process.pid
      },
      database: {
        connected: true,
        pendingResetRequests: requestsSnapshot.size
      },
      cache: {
        licenses: {
          count: cache.licenseCache.size,
          maxSize: 1000
        },
        validations: {
          count: cache.recentValidations.size,
          maxSize: 5000
        },
        activityLogs: {
          pending: cache.activityLogBatch.length,
          maxBatch: 50
        },
        settings: cache.settingsCache ? 'cached' : 'not cached',
        banlist: cache.banlistCache ? cache.banlistCache.length : 0
      },
      memory: {
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
        rss: Math.round(memUsage.rss / 1024 / 1024),
        external: Math.round(memUsage.external / 1024 / 1024),
        unit: 'MB'
      },
      performance: {
        uptimeFormatted: formatUptime(uptime),
        cacheHitRate: calculateCacheHitRate(),
        avgResponseTime: 'N/A' // Could be implemented with monitoring
      }
    });
    
  } catch (error) {
    console.error('Detailed health check error:', error);
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Helper function to format uptime
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  return `${days}d ${hours}h ${minutes}m ${secs}s`;
}

// Helper function to calculate cache hit rate (basic implementation)
function calculateCacheHitRate() {
  const validations = cache.recentValidations.size;
  const licenses = cache.licenseCache.size;
  
  if (licenses === 0) return '0%';
  
  const hitRate = Math.round((validations / (validations + licenses)) * 100);
  return `${hitRate}%`;
}

module.exports = router;
