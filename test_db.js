// Quick diagnostic script
require('dotenv').config();
const { initializeFirebase, getDb } = require('./config/firebase');

async function test() {
  initializeFirebase();
  const db = getDb();
  
  console.log('\n--- Testing queries ---\n');
  
  try {
    const r = await db.collection('licenses').get();
    console.log('✅ licenses.get() ok, count:', r.size);
  } catch(e) { console.error('❌ licenses:', e.code, e.message); }

  try {
    const r = await db.collection('software').get();
    console.log('✅ software.get() ok, count:', r.size);
  } catch(e) { console.error('❌ software:', e.code, e.message); }

  try {
    const r = await db.collection('activity_log').limit(10).get();
    console.log('✅ activity_log.get() ok, count:', r.size);
  } catch(e) { console.error('❌ activity_log:', e.code, e.message); }

  try {
    const r = await db.collection('system').doc('settings').get();
    console.log('✅ system/settings ok');
  } catch(e) { console.error('❌ system/settings:', e.code, e.message); }

  try {
    const r = await db.collection('system').doc('banlist').get();
    console.log('✅ banlist ok');
  } catch(e) { console.error('❌ banlist:', e.code, e.message); }

  try {
    const r = await db.collection('reset_requests').where('status', '==', 'pending').get();
    console.log('✅ reset_requests pending ok, count:', r.size);
  } catch(e) { console.error('❌ reset_requests pending:', e.code, e.message); }

  process.exit(0);
}
test().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
