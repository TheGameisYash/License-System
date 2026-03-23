const express = require('express');
const router = express.Router();
const crypto = require('crypto');

const { simpleRateLimit } = require('../../middleware/apiValidation');
const { logActivityBatched } = require('../../utils/optimization');
const { getSoftwareUser, saveSoftwareUser } = require('../../utils/database');

function hashPassword(p) {
    return crypto.createHash('sha256').update(p + 'license_salt_2024').digest('hex');
}

// ── Shared license validator ──────────────────────────────────────────────────
async function validateLicense(db, normalizedKey, softwareId) {
    const snap = await db.collection('licenses').doc(normalizedKey).get();

    if (!snap.exists)
        return {
            ok: false, code: 'LICENSE_NOT_FOUND', status: 404,
            message: 'License key does not exist'
        };

    const l = snap.data();

    if (l.softwareId !== softwareId)
        return {
            ok: false, code: 'LICENSE_NOT_FOUND', status: 404,
            message: 'License key does not exist'
        };

    if (l.banned === true)
        return {
            ok: false, code: 'LICENSE_BANNED', status: 403,
            message: 'This license key has been banned'
        };

    if (l.expiry) {
        const expires = l.expiry.toDate ? l.expiry.toDate() : new Date(l.expiry);
        if (expires < new Date())
            return {
                ok: false, code: 'LICENSE_EXPIRED', status: 403,
                message: `License expired on ${expires.toLocaleDateString()}`
            };
    }

    return { ok: true, data: snap, license: l };
}

// ============================================================================
// POST /api/users/register
// ============================================================================
router.post('/register', simpleRateLimit(3, 60000), async (req, res) => {
    const { username, password, email, software_id, license_key } = req.body;
    const softwareId = software_id || 'default';

    // ── Field validation ──────────────────────────────────────────────────────
    const missingFields = [];
    if (!username) missingFields.push('username');
    if (!password) missingFields.push('password');
    if (!license_key) missingFields.push('license_key');

    if (missingFields.length > 0)
        return res.status(400).json({
            success: false, code: 'MISSING_FIELDS',
            message: `Missing required fields: ${missingFields.join(', ')}`,
            data: { missingFields }
        });

    if (username.length < 3)
        return res.status(400).json({
            success: false, code: 'USERNAME_TOO_SHORT',
            message: 'Username must be at least 3 characters', data: null
        });

    if (username.length > 20)
        return res.status(400).json({
            success: false, code: 'USERNAME_TOO_LONG',
            message: 'Username must be 20 characters or less', data: null
        });

    if (!/^[a-zA-Z0-9_]+$/.test(username))
        return res.status(400).json({
            success: false, code: 'INVALID_USERNAME',
            message: 'Username may only contain letters, numbers and underscores', data: null
        });

    if (password.length < 4)
        return res.status(400).json({
            success: false, code: 'PASSWORD_TOO_SHORT',
            message: 'Password must be at least 4 characters', data: null
        });

    if (password.length > 64)
        return res.status(400).json({
            success: false, code: 'PASSWORD_TOO_LONG',
            message: 'Password must be 64 characters or less', data: null
        });

    if (license_key.trim().length < 2)
        return res.status(400).json({
            success: false, code: 'INVALID_LICENSE_FORMAT',
            message: 'Invalid license key format', data: null
        });

    try {
        const { getFirestore } = require('firebase-admin/firestore');
        const db = getFirestore();
        const normalizedKey = license_key.trim().toUpperCase();
        const normalizedUser = username.trim().toLowerCase();

        // ── Step 1: Validate license ──────────────────────────────────────────
        const licCheck = await validateLicense(db, normalizedKey, softwareId);
        if (!licCheck.ok)
            return res.status(licCheck.status).json({
                success: false, code: licCheck.code,
                message: licCheck.message, data: null
            });

        const { data: licenseSnap, license } = licCheck;

        // ── Step 2: License already claimed? ─────────────────────────────────
        if (license.userId && license.userId.trim() !== '')
            return res.status(409).json({
                success: false, code: 'LICENSE_ALREADY_USED',
                message: 'This license is already linked to an existing account',
                data: null
            });

        // ── Step 3: Username taken? ───────────────────────────────────────────
        const existing = await getSoftwareUser(softwareId, normalizedUser);
        if (existing)
            return res.status(409).json({
                success: false, code: 'USER_EXISTS',
                message: 'Username is already taken', data: null
            });

        // ── Step 4: Create user ───────────────────────────────────────────────
        const now = new Date().toISOString();
        const isPremium = license.isPremium === true;   // ✅ strict boolean

        await saveSoftwareUser(softwareId, normalizedUser, {
            username: normalizedUser,
            passwordHash: hashPassword(password),
            email: email?.trim().toLowerCase() || '',
            softwareId,
            licenseKey: normalizedKey,
            isPremium,
            createdAt: now,
            lastLogin: now,
            status: 'active'
        });

        // ── Step 5: Activate license — bind userId + activatedAt ──────────────
        await db.collection('licenses').doc(normalizedKey).update({
            userId: normalizedUser,
            activatedAt: now
        });

        // ── Step 6: Build expiry info for response ────────────────────────────
        let expiresAt = null;
        if (license.expiry) {
            const d = license.expiry.toDate ? license.expiry.toDate() : new Date(license.expiry);
            expiresAt = d.toISOString();
        }

        await logActivityBatched('USER_REGISTERED',
            `User: ${normalizedUser}, License: ${normalizedKey}, Software: ${softwareId}, Premium: ${isPremium}`,
            req.ip, req.get('User-Agent'));

        return res.status(201).json({
            success: true,
            code: 'USER_REGISTERED',
            message: 'Account created and license activated successfully',
            data: {
                username: normalizedUser,
                softwareId,
                licenseKey: normalizedKey,
                isPremium,
                licenseStatus: 'active',
                expiresAt,
                activatedAt: now
            }
        });

    } catch (error) {
        console.error('[Register]', error);
        return res.status(500).json({
            success: false, code: 'SERVER_ERROR',
            message: 'Internal server error. Please try again.', data: null
        });
    }
});

// ============================================================================
// POST /api/users/login
// ============================================================================
router.post('/login', simpleRateLimit(10, 60000), async (req, res) => {
    const { username, password, software_id } = req.body;
    const softwareId = software_id || 'default';

    if (!username || !password)
        return res.status(400).json({
            success: false, code: 'MISSING_FIELDS',
            message: 'Username and password are required', data: null
        });

    try {
        const { getFirestore } = require('firebase-admin/firestore');
        const db = getFirestore();
        const normalizedUser = username.trim().toLowerCase();

        // ── Step 1: Find user ─────────────────────────────────────────────────
        const user = await getSoftwareUser(softwareId, normalizedUser);

        if (!user)
            return res.status(401).json({
                success: false, code: 'INVALID_CREDENTIALS',
                message: 'Invalid username or password', data: null
            });

        // ── Step 2: Account banned? ───────────────────────────────────────────
        if (user.status === 'banned')
            return res.status(403).json({
                success: false, code: 'ACCOUNT_BANNED',
                message: 'Your account has been suspended. Contact support.', data: null
            });

        // ── Step 3: Password check ────────────────────────────────────────────
        if (user.passwordHash !== hashPassword(password))
            return res.status(401).json({
                success: false, code: 'INVALID_CREDENTIALS',
                message: 'Invalid username or password', data: null
            });

        // ── Step 4: Live license validation ───────────────────────────────────
        let licenseStatus = 'unknown';
        let isPremium = false;          // always re-derive from live license
        let expiresAt = null;
        let licenseCode = null;

        if (user.licenseKey) {
            const licCheck = await validateLicense(db, user.licenseKey, softwareId);

            if (!licCheck.ok) {
                // License revoked / banned / expired after registration
                licenseStatus = licCheck.code;
                isPremium = false;
                licenseCode = licCheck.code;

            } else {
                const license = licCheck.license;
                licenseStatus = 'active';
                isPremium = license.isPremium === true;  // ✅ strict boolean

                if (license.expiry) {
                    const d = license.expiry.toDate
                        ? license.expiry.toDate()
                        : new Date(license.expiry);
                    expiresAt = d.toISOString();
                }
            }

            // ── ✅ Sync isPremium back to user doc if it changed ──────────────
            if (user.isPremium !== isPremium) {
                await saveSoftwareUser(softwareId, normalizedUser, {
                    ...user,
                    isPremium,
                    lastLogin: new Date().toISOString()
                });
            } else {
                // ── Step 5: Update lastLogin only ─────────────────────────────
                await saveSoftwareUser(softwareId, normalizedUser, {
                    ...user,
                    lastLogin: new Date().toISOString()
                });
            }

        } else {
            licenseStatus = 'NO_LICENSE';

            // Still update lastLogin
            await saveSoftwareUser(softwareId, normalizedUser, {
                ...user,
                lastLogin: new Date().toISOString()
            });
        }

        await logActivityBatched('USER_LOGIN',
            `User: ${normalizedUser}, License: ${user.licenseKey || 'none'}, Premium: ${isPremium}, Status: ${licenseStatus}`,
            req.ip, req.get('User-Agent'));

        return res.status(200).json({
            success: true,
            code: 'LOGIN_OK',
            message: 'Login successful',
            data: {
                username: user.username,
                email: user.email || '',
                softwareId: user.softwareId,
                licenseKey: user.licenseKey || '',
                isPremium,                              // ✅ always from live license
                licenseStatus,                          // 'active' | 'LICENSE_BANNED' | 'LICENSE_EXPIRED' | 'NO_LICENSE'
                licenseWarning: licenseCode,            // null = all good
                expiresAt,                              // null = never expires
                lastLogin: user.lastLogin || null
            }
        });

    } catch (error) {
        console.error('[Login]', error);
        return res.status(500).json({
            success: false, code: 'SERVER_ERROR',
            message: 'Internal server error. Please try again.', data: null
        });
    }
});

module.exports = router;
