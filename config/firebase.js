// config/firebase.js
const { Firestore } = require('@google-cloud/firestore');
const path = require('path');
const fs = require('fs');

let db = null;

function initializeFirebase() {
  try {
    const saPath = path.join(__dirname, '..', 'firebase-service-account.json');

    if (!fs.existsSync(saPath)) {
      throw new Error('firebase-service-account.json not found in root folder');
    }

    const serviceAccount = JSON.parse(fs.readFileSync(saPath, 'utf8'));

    console.log('✅ Firebase credentials loaded from file (project:', serviceAccount.project_id + ')');

    // 🔥 REST-ONLY Firestore (NO firebase-admin, NO gRPC)
    db = new Firestore({
      projectId: serviceAccount.project_id,
      credentials: serviceAccount,
      fallback: true   // forces REST mode
    });

    console.log('✅ Firebase Firestore ready (REST mode)');
  } catch (error) {
    console.error('❌ Firebase init error:', error.message);
    process.exit(1);
  }
}

function getDb() {
  if (!db) {
    throw new Error('Firebase not initialized. Call initializeFirebase() first.');
  }
  return db;
}

module.exports = {
  initializeFirebase,
  getDb
};