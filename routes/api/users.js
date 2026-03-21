const express = require('express');
const router = express.Router();
const crypto = require('crypto');

const { simpleRateLimit } = require('../../middleware/apiValidation');
const { logActivityBatched } = require('../../utils/optimization');
const { getSoftwareUser, saveSoftwareUser } = require('../../utils/database');

function hashPassword(p) {
    return crypto.createHash('sha256').update(p + 'license_salt_2024').digest('hex');
}

// POST /api/users/register
router.post('/register',
    simpleRateLimit(3, 60000),
    async (req, res) => {
        const { username, password, email, software_id } = req.body;
        const softwareId = software_id || 'default';

        if (!username || !password)
            return res.status(400).json({
                success: false, code: 'MISSING_FIELDS',
                message: 'Username and password are required', data: null
            });

        if (username.length < 3)
            return res.status(400).json({
                success: false, code: 'USERNAME_TOO_SHORT',
                message: 'Username must be at least 3 characters', data: null
            });

        if (password.length < 4)
            return res.status(400).json({
                success: false, code: 'PASSWORD_TOO_SHORT',
                message: 'Password must be at least 4 characters', data: null
            });

        if (!/^[a-zA-Z0-9]+$/.test(username))
            return res.status(400).json({
                success: false, code: 'INVALID_USERNAME',
                message: 'Username must be letters and numbers only', data: null
            });

        try {
            const existing = await getSoftwareUser(softwareId, username.toLowerCase());
            if (existing)
                return res.status(409).json({
                    success: false, code: 'USER_EXISTS',
                    message: 'Username already taken', data: null
                });

            await saveSoftwareUser(softwareId, username.toLowerCase(), {
                username: username.toLowerCase(),
                passwordHash: hashPassword(password),
                email: email?.trim() || '',
                softwareId,
                isPremium: false,
                createdAt: new Date().toISOString(),
                status: 'active'
            });

            await logActivityBatched('USER_REGISTERED',
                `User: ${username}, Software: ${softwareId}`,
                req.ip, req.get('User-Agent'));

            return res.status(201).json({
                success: true,
                code: 'USER_REGISTERED',
                message: 'Account created successfully',
                data: { username: username.toLowerCase(), softwareId }
            });

        } catch (error) {
            console.error('Register error:', error);
            return res.status(500).json({
                success: false, code: 'SERVER_ERROR',
                message: 'Internal server error', data: null
            });
        }
    }
);

// POST /api/users/login
router.post('/login',
    simpleRateLimit(10, 60000),
    async (req, res) => {
        const { username, password, software_id } = req.body;
        const softwareId = software_id || 'default';

        if (!username || !password)
            return res.status(400).json({
                success: false, code: 'MISSING_FIELDS',
                message: 'Username and password are required', data: null
            });

        try {
            const user = await getSoftwareUser(softwareId, username.toLowerCase());

            if (!user)
                return res.status(401).json({
                    success: false, code: 'INVALID_CREDENTIALS',
                    message: 'Invalid username or password', data: null
                });

            if (user.status === 'banned')
                return res.status(403).json({
                    success: false, code: 'USER_BANNED',
                    message: 'Your account has been banned', data: null
                });

            if (user.passwordHash !== hashPassword(password))
                return res.status(401).json({
                    success: false, code: 'INVALID_CREDENTIALS',
                    message: 'Invalid username or password', data: null
                });

            await logActivityBatched('USER_LOGIN',
                `User: ${username}, Software: ${softwareId}`,
                req.ip, req.get('User-Agent'));

            return res.status(200).json({
                success: true,
                code: 'LOGIN_OK',
                message: 'Login successful',
                data: {
                    username: user.username,
                    email: user.email || '',
                    isPremium: user.isPremium || false,
                    softwareId: user.softwareId
                }
            });

        } catch (error) {
            console.error('Login error:', error);
            return res.status(500).json({
                success: false, code: 'SERVER_ERROR',
                message: 'Internal server error', data: null
            });
        }
    }
);

module.exports = router;
