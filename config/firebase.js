const admin = require('firebase-admin');

let db = null;

function initializeFirebase() {
  try {
    let serviceAccount;

    // ✅ ONLY USE ENV (Vercel safe)
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

      // Fix private key formatting
      if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
      }

      console.log('✅ Firebase credentials loaded from ENV (project:', serviceAccount.project_id + ')');
    } else {
      throw new Error('FIREBASE_SERVICE_ACCOUNT not set in environment');
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });

    db = admin.firestore();
    db.settings({ ignoreUndefinedProperties: true });

    console.log('✅ Firebase Firestore ready');

  } catch (error) {
    console.error('❌ Firebase init error:', error.message);
    process.exit(1);
  }
}

function getDb() {
  if (!db) throw new Error('Firebase not initialized.');
  return db;
}

module.exports = { initializeFirebase, admin, getDb };