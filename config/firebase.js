// config/firebase.js
const admin = require('firebase-admin');

let db = null;

function initializeFirebase() {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
    
    if (!serviceAccount.project_id) {
      throw new Error('Invalid Firebase credentials in .env file');
    }
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
    });
    
    db = admin.firestore();
    console.log('✅ Firebase initialized successfully');
  } catch (error) {
    console.error('❌ Firebase init error:', error.message);
    process.exit(1);
  }
}

function getDb() {
  if (!db) {
    throw new Error('Firebase not initialized. Call initializeApp() first.');
  }
  return db;
}

module.exports = { 
  initializeFirebase, 
  admin, 
  getDb 
};
