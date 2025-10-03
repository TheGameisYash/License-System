// utils/webhook.js - FIXED VERSION
const https = require('https');
const { CONFIG } = require('../config/constants');

async function sendWebhook(event, data) {
  const webhookUrl = CONFIG.DISCORD_WEBHOOK_URL;
  
  // If no webhook URL is set, skip silently
  if (!webhookUrl) {
    console.log('⚠️  Discord webhook not configured, skipping notification');
    return;
  }
  
  try {
    const colors = {
      'license_generated': 0x00aaee,        // Blue
      'device_registered': 0x2ecc71,        // Green
      'hwid_reset': 0xffa502,               // Orange
      'license_deleted': 0xe74c3c,          // Red
      'hwid_banned': 0xff4757,              // Dark Red
      'hwid_unbanned': 0x2ecc71,            // Green
      'reset_request': 0xf39c12,            // Yellow/Orange
      'reset_approved': 0x2ecc71,           // Green
      'reset_denied': 0xe74c3c,             // Red
      'license_banned': 0xff4757,           // Dark Red
      'bulk_licenses_generated': 0x3498db   // Light Blue
    };
    
    const eventName = event.replace(/_/g, ' ').toUpperCase();
    
    const embed = {
      title: `🔔 ${eventName}`,
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
      username: 'License System',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/0.png'
    });
    
    // Parse webhook URL
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
    
    // Send request using native https module
    const req = https.request(options, (res) => {
      if (res.statusCode === 204 || res.statusCode === 200) {
        console.log(`✅ Discord webhook sent: ${event}`);
      } else {
        console.error(`❌ Discord webhook failed: ${res.statusCode}`);
      }
      
      // Consume response data to free memory
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
