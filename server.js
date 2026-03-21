// server.js - Ultra Optimized License System

process.env.FIRESTORE_PREFER_REST = 'true';
require('dotenv').config();

const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const cors = require('cors');

const { CONFIG } = require('./config/constants');
const { initializeFirebase } = require('./config/firebase');

// Initialize Firebase
initializeFirebase();

// Start optimization engine
require('./utils/optimization');

const app = express();

// Security
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));

// CORS
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '*').split(',');
app.use(cors({
  origin: allowedOrigins[0] === '*' ? '*' : allowedOrigins,
  credentials: true
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session
app.use(session({
  secret: CONFIG.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Import routes
const landingRoutes = require('./routes/landing');
const apiRoutes = require('./routes/api');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
const pcremoteAuthRoutes = require('./routes/pcremote-auth');


// Mount routes
app.use('/auth', authRoutes);
app.use('/api', apiRoutes);
app.use('/admin', adminRoutes);
app.use('/', landingRoutes);
app.use('/pcremote/auth', pcremoteAuthRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    code: 'NOT_FOUND',
    message: 'Endpoint not found',
    data: null
  });
});

// Graceful shutdown (only for local/server environments)
const { flushActivityLog } = require('./utils/optimization');

if (process.env.NODE_ENV !== 'production') {
  process.on('SIGTERM', async () => {
    console.log('Flushing logs...');
    await flushActivityLog();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('Flushing logs...');
    await flushActivityLog();
    process.exit(0);
  });
}

// ✅ START SERVER ONLY LOCALLY (NOT on Vercel)
if (process.env.NODE_ENV !== 'production') {
  app.listen(CONFIG.PORT, () => {
    console.log('\n' + '='.repeat(80));
    console.log('🚀 ULTRA OPTIMIZED LICENSE SYSTEM v' + CONFIG.API_VERSION);
    console.log('='.repeat(80));
    console.log(`📡 Server: http://localhost:${CONFIG.PORT}`);
    console.log(`🌐 Landing Page: http://localhost:${CONFIG.PORT}`);
    console.log(`🔐 Admin Panel: http://localhost:${CONFIG.PORT}/admin`);
    console.log(`🔑 Login Page: http://localhost:${CONFIG.PORT}/auth/login`);
    console.log(`👤 Username: ${CONFIG.ADMIN_USERNAME}`);
    console.log('='.repeat(80));
    console.log('⚡ Ultra Optimizations Active:');
    console.log('  ├─ HWID Index (O(1) lookups)');
    console.log('  ├─ License Cache (10min TTL)');
    console.log('  ├─ Validation Skip (5min TTL)');
    console.log('  ├─ Activity Batching (50 logs)');
    console.log('  └─ Memory Cleanup (15min intervals)');
    console.log('\n🎯 Expected: ~50 reads/day (99.9% reduction!)');
    console.log('='.repeat(80) + '\n');
  });
}

// ✅ Export for Vercel serverless
module.exports = app;