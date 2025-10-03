// utils/helpers.js
const crypto = require('crypto');

function generateSecureLicenseKey(prefix = 'LIC') {
  const segments = [];
  for (let i = 0; i < 3; i++) {
    segments.push(crypto.randomBytes(4).toString('hex').toUpperCase());
  }
  return `${prefix}-${segments.join('-')}`;
}

function formatTimeAgo(dateString) {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

function calculateDaysUntilExpiry(expiryDate) {
  if (!expiryDate) return null;
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

function isLicenseExpired(license) {
  if (!license.expiry) return false;
  return new Date(license.expiry) < new Date();
}

module.exports = {
  generateSecureLicenseKey,
  formatTimeAgo,
  calculateDaysUntilExpiry,
  isLicenseExpired
};
