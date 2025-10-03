// utils/database.js
const { getDb } = require('../config/firebase');

async function getLicense(licenseKey) {
  try {
    const db = getDb();
    const doc = await db.collection('licenses').doc(licenseKey).get();
    return doc.exists ? doc.data() : null;
  } catch (error) {
    console.error('Error getting license:', error);
    return null;
  }
}

async function saveLicense(licenseKey, data) {
  try {
    const db = getDb();
    await db.collection('licenses').doc(licenseKey).set(data, { merge: true });
    return true;
  } catch (error) {
    console.error('Error saving license:', error);
    return false;
  }
}

async function deleteLicense(licenseKey) {
  try {
    const db = getDb();
    await db.collection('licenses').doc(licenseKey).delete();
    return true;
  } catch (error) {
    console.error('Error deleting license:', error);
    return false;
  }
}

async function getSettings() {
  try {
    const db = getDb();
    const doc = await db.collection('system').doc('settings').get();
    if (doc.exists) {
      return doc.data();
    }
    const defaults = {
      apiEnabled: true,
      maintenanceMode: false,
      maxDevices: 1
    };
    await db.collection('system').doc('settings').set(defaults);
    return defaults;
  } catch (error) {
    console.error('Error getting settings:', error);
    return { apiEnabled: true, maintenanceMode: false, maxDevices: 1 };
  }
}

async function saveSettings(settings) {
  try {
    const db = getDb();
    await db.collection('system').doc('settings').set(settings, { merge: true });
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
}

async function getBanlist() {
  try {
    const db = getDb();
    const doc = await db.collection('system').doc('banlist').get();
    return doc.exists ? (doc.data().banned || []) : [];
  } catch (error) {
    console.error('Error getting banlist:', error);
    return [];
  }
}

async function addToBanlist(hwid, reason = '') {
  try {
    const db = getDb();
    const banlist = await getBanlist();
    if (!banlist.includes(hwid)) {
      banlist.push(hwid);
      await db.collection('system').doc('banlist').set({ banned: banlist });
      await db.collection('ban_log').add({
        hwid,
        reason,
        bannedAt: new Date().toISOString()
      });
    }
    return true;
  } catch (error) {
    console.error('Error banning HWID:', error);
    return false;
  }
}

async function removeFromBanlist(hwid) {
  try {
    const db = getDb();
    const banlist = await getBanlist();
    const updated = banlist.filter(h => h !== hwid);
    await db.collection('system').doc('banlist').set({ banned: updated });
    return true;
  } catch (error) {
    console.error('Error unbanning HWID:', error);
    return false;
  }
}

module.exports = {
  getLicense,
  saveLicense,
  deleteLicense,
  getSettings,
  saveSettings,
  getBanlist,
  addToBanlist,
  removeFromBanlist
};
