// utils/webhook.js
const { CONFIG } = require('../config/constants');

async function sendWebhook(event, data) {
  const webhookUrl = CONFIG.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;
  
  try {
    const fetch = (await import('node-fetch')).default;
    const colors = {
      'license_generated': 0x00aaee,
      'device_registered': 0x00ff00,
      'hwid_reset': 0xff9900,
      'license_deleted': 0xff0000,
      'hwid_banned': 0xff0000
    };
    
    const embed = {
      title: event.replace(/_/g, ' ').toUpperCase(),
      color: colors[event] || 0x00aaee,
      fields: Object.entries(data).map(([key, value]) => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        value: value?.toString() || 'N/A',
        inline: true
      })),
      timestamp: new Date().toISOString()
    };
    
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] })
    });
  } catch (error) {
    console.error('Webhook error:', error.message);
  }
}

module.exports = { sendWebhook };
