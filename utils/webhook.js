// utils/webhook.js - Per-software webhook support + new events
const https = require('https');
const { CONFIG } = require('../config/constants');

const COLORS = {
  license_generated: 0x00aaee,
  device_registered: 0x2ecc71,
  hwid_reset: 0xffa502,
  license_deleted: 0xe74c3c,
  hwid_banned: 0xff4757,
  hwid_unbanned: 0x2ecc71,
  reset_request: 0xf39c12,
  reset_approved: 0x2ecc71,
  reset_denied: 0xe74c3c,
  license_banned: 0xff4757,
  license_unbanned: 0x2ecc71,
  bulk_licenses_generated: 0x3498db,
  hwid_conflict: 0xff6b6b,
  license_ban_attempt: 0xff4757,
  activation_conflict: 0xffa502,
  license_validated: 0x95a5a6,
  // New events
  software_created: 0x00aaee,
  software_updated: 0x3498db,
  software_disabled: 0xe74c3c,
  software_enabled: 0x2ecc71,
  announcement_created: 0xf39c12,
  announcement_deleted: 0xe74c3c,
  user_created: 0x2ecc71,
  user_banned: 0xff4757,
  user_unbanned: 0x2ecc71,
  api_error: 0xe74c3c,
  banned_hwid_validation: 0xff4757,
  banned_license_validation: 0xff4757,
  hwid_mismatch: 0xffa502,
  license_auto_unbanned: 0x2ecc71,
  settings_updated: 0x95a5a6,
  cache_cleared: 0x95a5a6,
  logs_cleared: 0x95a5a6,
  invalid_license_attempt: 0xff6b6b,
  expired_license_attempt: 0xffa502
};

const EMOJIS = {
  license_generated: '🎫', device_registered: '💻', hwid_reset: '↻',
  license_deleted: '🗑️', hwid_banned: '🚫', hwid_unbanned: '✅',
  reset_request: '📋', reset_approved: '✅', reset_denied: '❌',
  license_banned: '🚫', license_unbanned: '✅', bulk_licenses_generated: '📦',
  hwid_conflict: '⚠️', license_ban_attempt: '🔒', activation_conflict: '⚠️',
  license_validated: '✔️', software_created: '🚀', software_updated: '⚙️',
  software_disabled: '🔴', software_enabled: '🟢', announcement_created: '📣',
  announcement_deleted: '🗑️', user_created: '👤', user_banned: '🚫',
  user_unbanned: '✅', api_error: '❌', settings_updated: '⚙️',
  cache_cleared: '🧹', logs_cleared: '🗑️'
};

/**
 * Send a webhook notification.
 * @param {string} event - Event type key
 * @param {object} data - Payload fields
 * @param {string|null} softwareWebhookUrl - Per-software webhook URL (overrides global)
 */
async function sendWebhook(event, data, softwareWebhookUrl = null) {
  const webhookUrl = softwareWebhookUrl || CONFIG.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    const eventName = event.replace(/_/g, ' ').toUpperCase();
    const emoji = EMOJIS[event] || '🔔';

    const embed = {
      title: `${emoji} ${eventName}`,
      color: COLORS[event] || 0x00aaee,
      fields: Object.entries(data).map(([key, value]) => ({
        name: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
        value: String(value).substring(0, 1024) || 'N/A',
        inline: true
      })),
      timestamp: new Date().toISOString(),
      footer: { text: 'License System v' + CONFIG.API_VERSION }
    };

    const payload = JSON.stringify({
      embeds: [embed],
      username: 'License System',
      avatar_url: 'https://cdn.discordapp.com/attachments/1424008082253676655/1424017447467614290/mK0YF8t.png'
    });

    const url = new URL(webhookUrl);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
    };

    const req = https.request(options, (res) => {
      if (res.statusCode === 204 || res.statusCode === 200) {
        console.log(`✅ Webhook sent: ${event}`);
      } else {
        console.error(`❌ Webhook failed: ${res.statusCode}`);
      }
      res.on('data', () => {});
    });

    req.on('error', (e) => console.error('❌ Webhook error:', e.message));
    req.write(payload);
    req.end();
  } catch (error) {
    console.error('❌ Webhook error:', error.message);
  }
}

module.exports = { sendWebhook };
