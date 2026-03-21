// routes/pcremote-auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { getFirestore } = require('firebase-admin/firestore');
const router = express.Router();

const JWT_SECRET = process.env.PCREMOTE_JWT_SECRET || process.env.SESSION_SECRET;
const JWT_EXPIRES = '30d';

// ── Rate limiter ──────────────────────────────────────────
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { success: false, message: 'Too many attempts. Try again in 15 minutes.' }
});

// ── Helper: get users collection ─────────────────────────
const usersCol = () => getFirestore().collection('pcremote_users');

// ── REGISTER ──────────────────────────────────────────────
// POST /pcremote/auth/register
router.post('/register', limiter, async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password)
            return res.status(400).json({ success: false, message: 'Email and password required' });

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
            return res.status(400).json({ success: false, message: 'Invalid email format' });

        if (password.length < 8)
            return res.status(400).json({ success: false, message: 'Password must be 8+ characters' });

        const normalizedEmail = email.toLowerCase().trim();

        // Check if already exists
        const existing = await usersCol()
            .where('email', '==', normalizedEmail)
            .limit(1)
            .get();

        if (!existing.empty)
            return res.status(409).json({ success: false, message: 'Email already registered' });

        // Hash password — never store plain text
        const passwordHash = await bcrypt.hash(password, 12);

        // Save to Firestore
        const userRef = await usersCol().add({
            email: normalizedEmail,
            passwordHash,
            isPremium: false,
            licenseKey: null,
            createdAt: new Date().toISOString(),
            lastLogin: null
        });

        // Generate JWT
        const token = jwt.sign(
            { userId: userRef.id, email: normalizedEmail, isPremium: false },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES }
        );

        return res.status(201).json({
            success: true,
            token,
            isPremium: false,
            email: normalizedEmail
        });

    } catch (err) {
        console.error('[PCRemote Register]', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ── LOGIN ─────────────────────────────────────────────────
// POST /pcremote/auth/login
router.post('/login', limiter, async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password)
            return res.status(400).json({ success: false, message: 'Email and password required' });

        const normalizedEmail = email.toLowerCase().trim();

        // Find user
        const snapshot = await usersCol()
            .where('email', '==', normalizedEmail)
            .limit(1)
            .get();

        if (snapshot.empty)
            return res.status(401).json({ success: false, message: 'Invalid email or password' });

        const userDoc = snapshot.docs[0];
        const userData = userDoc.data();

        // Verify password
        const valid = await bcrypt.compare(password, userData.passwordHash);
        if (!valid)
            return res.status(401).json({ success: false, message: 'Invalid email or password' });

        // Update lastLogin
        await userDoc.ref.update({ lastLogin: new Date().toISOString() });

        // Generate JWT
        const token = jwt.sign(
            { userId: userDoc.id, email: normalizedEmail, isPremium: userData.isPremium },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES }
        );

        return res.json({
            success: true,
            token,
            isPremium: userData.isPremium,
            email: normalizedEmail
        });

    } catch (err) {
        console.error('[PCRemote Login]', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ── VERIFY TOKEN (called on Android app start) ────────────
// GET /pcremote/auth/verify
router.get('/verify', authenticateToken, async (req, res) => {
    try {
        // Fetch latest premium status from Firestore
        const userDoc = await usersCol().doc(req.user.userId).get();
        if (!userDoc.exists)
            return res.status(404).json({ success: false, message: 'User not found' });

        const data = userDoc.data();
        return res.json({
            success: true,
            isPremium: data.isPremium,
            email: data.email
        });

    } catch (err) {
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ── CHANGE PASSWORD ───────────────────────────────────────
// POST /pcremote/auth/change-password
router.post('/change-password', authenticateToken, async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword)
            return res.status(400).json({ success: false, message: 'Both passwords required' });

        if (newPassword.length < 8)
            return res.status(400).json({ success: false, message: 'New password must be 8+ characters' });

        const userDoc = await usersCol().doc(req.user.userId).get();
        const userData = userDoc.data();

        const valid = await bcrypt.compare(oldPassword, userData.passwordHash);
        if (!valid)
            return res.status(401).json({ success: false, message: 'Old password incorrect' });

        const newHash = await bcrypt.hash(newPassword, 12);
        await userDoc.ref.update({ passwordHash: newHash });

        return res.json({ success: true, message: 'Password updated' });

    } catch (err) {
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ── DELETE ACCOUNT ────────────────────────────────────────
// DELETE /pcremote/auth/delete
router.delete('/delete', authenticateToken, async (req, res) => {
    try {
        await usersCol().doc(req.user.userId).delete();
        return res.json({ success: true, message: 'Account deleted' });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ── JWT Middleware ─────────────────────────────────────────
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token)
        return res.status(401).json({ success: false, message: 'No token provided' });

    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
}

module.exports = router;
