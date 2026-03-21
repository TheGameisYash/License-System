// utils/database.js - Optimized with batch writes & subcollections
const { getDb } = require('../config/firebase');

// ============================================================================
// LICENSE OPERATIONS
// ============================================================================

async function getLicense(licenseKey) {
  try {
    const db = getDb();
    const doc = await db.collection('licenses').doc(licenseKey).get();
    return doc.exists ? doc.data() : null;
  } catch (error) {
    console.error('getLicense error:', error);
    return null;
  }
}

async function saveLicense(licenseKey, data) {
  try {
    const db = getDb();
    await db.collection('licenses').doc(licenseKey).set(data, { merge: true });
    return true;
  } catch (error) {
    console.error('saveLicense error:', error);
    return false;
  }
}

async function deleteLicense(licenseKey) {
  try {
    const db = getDb();
    await db.collection('licenses').doc(licenseKey).delete();
    return true;
  } catch (error) {
    console.error('deleteLicense error:', error);
    return false;
  }
}

// ============================================================================
// SYSTEM SETTINGS
// ============================================================================

async function getSettings() {
  try {
    const db = getDb();
    const doc = await db.collection('system').doc('settings').get();
    if (doc.exists) return doc.data();
    const defaults = { apiEnabled: true, maintenanceMode: false, maxDevices: 1 };
    await db.collection('system').doc('settings').set(defaults);
    return defaults;
  } catch (error) {
    console.error('getSettings error:', error);
    return { apiEnabled: true, maintenanceMode: false, maxDevices: 1 };
  }
}

async function saveSettings(settings) {
  try {
    const db = getDb();
    await db.collection('system').doc('settings').set(settings, { merge: true });
    return true;
  } catch (error) {
    console.error('saveSettings error:', error);
    return false;
  }
}

// ============================================================================
// BANLIST
// ============================================================================

async function getBanlist() {
  try {
    const db = getDb();
    const doc = await db.collection('system').doc('banlist').get();
    return doc.exists ? (doc.data().banned || []) : [];
  } catch (error) {
    console.error('getBanlist error:', error);
    return [];
  }
}

async function addToBanlist(hwid, reason = '') {
  try {
    const db = getDb();
    const banlist = await getBanlist();
    if (banlist.includes(hwid)) return true;
    banlist.push(hwid);
    // Batch: update banlist + create ban log in one commit
    const batch = db.batch();
    batch.set(db.collection('system').doc('banlist'), { banned: banlist });
    batch.set(db.collection('ban_log').doc(), { hwid, reason, bannedAt: new Date().toISOString() });
    await batch.commit();
    return true;
  } catch (error) {
    console.error('addToBanlist error:', error);
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
    console.error('removeFromBanlist error:', error);
    return false;
  }
}

// ============================================================================
// SOFTWARE PRODUCTS
// ============================================================================

async function getSoftware(softwareId) {
  try {
    const db = getDb();
    const doc = await db.collection('software').doc(softwareId).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  } catch (error) {
    console.error('getSoftware error:', error);
    return null;
  }
}

async function getAllSoftware() {
  try {
    const db = getDb();
    const snapshot = await db.collection('software').get();
    const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Sort in-memory — no Firestore index needed
    return results.sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));
  } catch (error) {
    console.error('getAllSoftware error:', error);
    return [];
  }
}

async function saveSoftware(softwareId, data) {
  try {
    const db = getDb();
    await db.collection('software').doc(softwareId).set(data, { merge: true });
    return true;
  } catch (error) {
    console.error('saveSoftware error:', error);
    return false;
  }
}

async function deleteSoftware(softwareId) {
  try {
    const db = getDb();
    const db_ = getDb();
    // Delete software doc + all its announcements + users in batch
    const batch = db_.batch();
    batch.delete(db.collection('software').doc(softwareId));

    // Delete announcements subcollection
    const announcements = await db.collection('software').doc(softwareId)
      .collection('announcements').get();
    announcements.docs.forEach(doc => batch.delete(doc.ref));

    // Delete software_users subcollection
    const users = await db.collection('software').doc(softwareId)
      .collection('users').get();
    users.docs.forEach(doc => batch.delete(doc.ref));

    await batch.commit();
    return true;
  } catch (error) {
    console.error('deleteSoftware error:', error);
    return false;
  }
}

// ============================================================================
// ANNOUNCEMENTS (per-software subcollection)
// ============================================================================

async function getAnnouncements(softwareId) {
  try {
    const db = getDb();
    const now = new Date().toISOString();
    // Simple query without compound index requirements
    const snapshot = await db.collection('software').doc(softwareId)
      .collection('announcements')
      .where('active', '==', true)
      .get();
    const results = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(a => !a.expiresAt || a.expiresAt > now);
    // Sort in memory
    return results.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  } catch (error) {
    console.error('getAnnouncements error:', error);
    return [];
  }
}

async function getAllAnnouncementsAdmin(softwareId) {
  try {
    const db = getDb();
    const snapshot = await db.collection('software').doc(softwareId)
      .collection('announcements')
      .get();
    const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return results.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  } catch (error) {
    console.error('getAllAnnouncementsAdmin error:', error);
    return [];
  }
}

async function saveAnnouncement(softwareId, announcementData) {
  try {
    const db = getDb();
    const ref = db.collection('software').doc(softwareId)
      .collection('announcements').doc();
    await ref.set({ ...announcementData, id: ref.id });
    return ref.id;
  } catch (error) {
    console.error('saveAnnouncement error:', error);
    return null;
  }
}

async function updateAnnouncement(softwareId, announcementId, data) {
  try {
    const db = getDb();
    await db.collection('software').doc(softwareId)
      .collection('announcements').doc(announcementId)
      .update(data);
    return true;
  } catch (error) {
    console.error('updateAnnouncement error:', error);
    return false;
  }
}

async function deleteAnnouncement(softwareId, announcementId) {
  try {
    const db = getDb();
    await db.collection('software').doc(softwareId)
      .collection('announcements').doc(announcementId)
      .delete();
    return true;
  } catch (error) {
    console.error('deleteAnnouncement error:', error);
    return false;
  }
}

// ============================================================================
// SOFTWARE USERS (credentials auth mode - per-software subcollection)
// ============================================================================

async function getSoftwareUser(softwareId, username) {
  try {
    const db = getDb();
    const doc = await db.collection('software').doc(softwareId)
      .collection('users').doc(username.toLowerCase()).get();
    return doc.exists ? doc.data() : null;
  } catch (error) {
    console.error('getSoftwareUser error:', error);
    return null;
  }
}

async function getAllSoftwareUsers(softwareId) {
  try {
    const db = getDb();
    const snapshot = await db.collection('software').doc(softwareId)
      .collection('users').get();
    const results = snapshot.docs.map(doc => doc.data());
    return results.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  } catch (error) {
    console.error('getAllSoftwareUsers error:', error);
    return [];
  }
}

async function saveSoftwareUser(softwareId, username, data) {
  try {
    const db = getDb();
    await db.collection('software').doc(softwareId)
      .collection('users').doc(username.toLowerCase()).set(data, { merge: true });
    return true;
  } catch (error) {
    console.error('saveSoftwareUser error:', error);
    return false;
  }
}

async function deleteSoftwareUser(softwareId, username) {
  try {
    const db = getDb();
    await db.collection('software').doc(softwareId)
      .collection('users').doc(username.toLowerCase()).delete();
    return true;
  } catch (error) {
    console.error('deleteSoftwareUser error:', error);
    return false;
  }
}

module.exports = {
  // Licenses
  getLicense, saveLicense, deleteLicense,
  // Settings
  getSettings, saveSettings,
  // Banlist
  getBanlist, addToBanlist, removeFromBanlist,
  // Software
  getSoftware, getAllSoftware, saveSoftware, deleteSoftware,
  // Announcements
  getAnnouncements, getAllAnnouncementsAdmin, saveAnnouncement, updateAnnouncement, deleteAnnouncement,
  // Software Users
  getSoftwareUser, getAllSoftwareUsers, saveSoftwareUser, deleteSoftwareUser
};
