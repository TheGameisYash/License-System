// utils/webhook.js - COMPLETE with ALL event types
const https = require('https');
const { CONFIG } = require('../config/constants');

async function sendWebhook(event, data) {
  const webhookUrl = CONFIG.DISCORD_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.log('⚠️  Discord webhook not configured');
    return;
  }
  
  try {
    const colors = {
      'license_generated': 0x00aaee,        // Blue
      'device_registered': 0x2ecc71,        // Green ✅
      'hwid_reset': 0xffa502,               // Orange
      'license_deleted': 0xe74c3c,          // Red
      'hwid_banned': 0xff4757,              // Dark Red
      'hwid_unbanned': 0x2ecc71,            // Green
      'reset_request': 0xf39c12,            // Yellow/Orange ✅
      'reset_approved': 0x2ecc71,           // Green
      'reset_denied': 0xe74c3c,             // Red
      'license_banned': 0xff4757,           // Dark Red
      'license_unbanned': 0x2ecc71,         // Green
      'bulk_licenses_generated': 0x3498db,  // Light Blue
      'hwid_conflict': 0xff6b6b,            // Light Red (NEW)
      'license_ban_attempt': 0xff4757,      // Dark Red (NEW)
      'activation_conflict': 0xffa502,      // Orange (NEW)
      'license_validated': 0x95a5a6          // Gray (NEW - rare notifications)
    };
    
    const emojis = {
      'license_generated': '🎫',
      'device_registered': '💻',
      'hwid_reset': '↻',
      'license_deleted': '🗑️',
      'hwid_banned': '🚫',
      'hwid_unbanned': '✅',
      'reset_request': '📋',
      'reset_approved': '✅',
      'reset_denied': '❌',
      'license_banned': '🚫',
      'license_unbanned': '✅',
      'bulk_licenses_generated': '📦',
      'hwid_conflict': '⚠️',
      'license_ban_attempt': '🔒',
      'activation_conflict': '⚠️',
      'license_validated': '✔️'
    };
    
    const eventName = event.replace(/_/g, ' ').toUpperCase();
    const emoji = emojis[event] || '🔔';
    
    const embed = {
      title: `${emoji} ${eventName}`,
      color: colors[event] || 0x00aaee,
      fields: Object.entries(data).map(([key, value]) => ({
        name: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
        value: String(value).substring(0, 1024) || 'N/A',
        inline: true
      })),
      timestamp: new Date().toISOString(),
      footer: {
        text: 'Ultra License System v' + CONFIG.API_VERSION
      }
    };
    
    const payload = JSON.stringify({ 
      embeds: [embed],
      username: 'STARK MOD MENU',
      avatar_url: 'https://cdn.discordapp.com/attachments/840689217956216852/1423715306366435469/E8z2rIf.jpg'
    });
    
    const url = new URL(webhookUrl);
    
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };
    
    const req = https.request(options, (res) => {
      if (res.statusCode === 204 || res.statusCode === 200) {
        console.log(`✅ Discord webhook sent: ${event}`);
      } else {
        console.error(`❌ Discord webhook failed: ${res.statusCode}`);
      }
      res.on('data', () => {});
    });
    
    req.on('error', (error) => {
      console.error('❌ Discord webhook error:', error.message);
    });
    
    req.write(payload);
    req.end();
    
  } catch (error) {
    console.error('❌ Discord webhook error:', error.message);
  }
}

module.exports = { sendWebhook };
