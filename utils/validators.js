// utils/validators.js
function validateHWID(hwid) {
  return hwid && typeof hwid === 'string' && hwid.length >= 10 && hwid.length <= 256;
}

function sanitizeInput(input) {
  if (!input) return '';
  return input.toString().replace(/[<>'"]/g, '').substring(0, 200);
}

module.exports = {
  validateHWID,
  sanitizeInput
};
