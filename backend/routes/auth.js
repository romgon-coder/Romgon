// ============================================
// AUTHENTICATION ROUTES
// ============================================

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { dbPromise } = require('../config/database');
const {
    hashPassword,
    comparePassword,
    generateToken,
    validateEmail,
    validatePassword,
    validateUsername
} = require('../utils/auth');

const router = express.Router();

// ============================================
// REGISTER ENDPOINT
// ============================================

router.post('/register', async (req, res) => {
    try {
        const { username, email, password, confirmPassword } = req.body;

        // Validation
        if (!username || !email || !password || !confirmPassword) {
            return res.status(400).json({
                error: 'All fields are required',
                fields: ['username', 'email', 'password', 'confirmPassword']
            });
        }

        // Validate username format
        if (!validateUsername(username)) {
            return res.status(400).json({
                error: 'Invalid username',
                message: 'Username must be 3-30 characters, alphanumeric, underscores, and dashes only'
            });
        }

        // Validate email format
        if (!validateEmail(email)) {
            return res.status(400).json({
                error: 'Invalid email',
                message: 'Please provide a valid email address'
            });
        }

        // Validate password strength
        if (!validatePassword(password)) {
            return res.status(400).json({
                error: 'Weak password',
                message: 'Password must be at least 6 characters long'
            });
        }

        // Passwords match
        if (password !== confirmPassword) {
            return res.status(400).json({
                error: 'Passwords do not match',
                message: 'Password and confirm password must be the same'
            });
        }

        // Check if username exists
        const existingUsername = await dbPromise.get(
            'SELECT id FROM users WHERE username = ?',
            [username]
        );

        if (existingUsername) {
            return res.status(409).json({
                error: 'Username already taken',
                message: `Username '${username}' is not available`
            });
        }

        // Check if email exists
        const existingEmail = await dbPromise.get(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingEmail) {
            return res.status(409).json({
                error: 'Email already registered',
                message: 'An account with this email already exists'
            });
        }

        // Hash password
        const passwordHash = await hashPassword(password);

        // Create user
        const result = await dbPromise.run(
            `INSERT INTO users (username, email, password_hash, rating) 
             VALUES (?, ?, ?, 1600)`,
            [username, email, passwordHash]
        );

        const userId = result.id;

        // Generate token with email
        const token = generateToken(userId, username, email);

        console.log(`✅ New user registered: ${username} (ID: ${userId})`);

        res.status(201).json({
            message: 'Account created successfully',
            user: {
                id: userId,
                username,
                email,
                rating: 1600
            },
            token,
            expiresIn: '7 days'
        });

    } catch (err) {
        console.error('❌ Registration error:', err);
        res.status(500).json({
            error: 'Registration failed',
            message: err.message
        });
    }
});

// ============================================
// LOGIN ENDPOINT
// ============================================

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validation
        if (!username || !password) {
            return res.status(400).json({
                error: 'Username and password are required',
                fields: ['username', 'password']
            });
        }

        // Find user
        const user = await dbPromise.get(
            `SELECT id, username, email, password_hash, rating, wins, losses, 
                    total_games, member_level FROM users WHERE username = ?`,
            [username]
        );

        if (!user) {
            return res.status(401).json({
                error: 'Invalid credentials',
                message: 'Username or password is incorrect'
            });
        }

        // Verify password
        const isValidPassword = await comparePassword(password, user.password_hash);

        if (!isValidPassword) {
            return res.status(401).json({
                error: 'Invalid credentials',
                message: 'Username or password is incorrect'
            });
        }

        // Generate token with email
        const token = generateToken(user.id, user.username, user.email);

        console.log(`✅ User logged in: ${username} (ID: ${user.id})`);

        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                rating: user.rating,
                stats: {
                    wins: user.wins,
                    losses: user.losses,
                    totalGames: user.total_games,
                    memberLevel: user.member_level
                }
            },
            token,
            expiresIn: '7 days'
        });

    } catch (err) {
        console.error('❌ Login error:', err);
        res.status(500).json({
            error: 'Login failed',
            message: err.message
        });
    }
});

// ============================================
// VERIFY TOKEN ENDPOINT
// ============================================

router.post('/verify', async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                error: 'Token required',
                valid: false
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

        res.json({
            valid: true,
            user: {
                id: decoded.userId,
                username: decoded.username
            }
        });

    } catch (err) {
        res.json({
            valid: false,
            error: err.message
        });
    }
});

// ============================================
// GUEST LOGIN ENDPOINT
// ============================================

router.post('/guest', async (req, res) => {
    try {
        const { username } = req.body;

        if (!username || !username.startsWith('Guest_')) {
            return res.status(400).json({
                error: 'Invalid guest username'
            });
        }

        // Create temporary guest user
        const guestId = uuidv4();
        const result = await dbPromise.run(
            `INSERT INTO users (username, email, password_hash, rating, is_guest) 
             VALUES (?, ?, ?, 1600, 1)`,
            [username, `${username}@guest.romgon.net`, 'guest']
        );

        const userId = result.id;  // Fixed: use result.id instead of result.lastID

        // Generate token (no real email for guest accounts)
        const token = generateToken(userId, username);

        res.status(201).json({
            message: 'Guest account created',
            token,
            user: {
                id: userId,
                username,
                rating: 1600,
                isGuest: true
            }
        });

    } catch (err) {
        console.error('❌ Guest login error:', err);
        res.status(500).json({
            error: 'Failed to create guest account',
            message: err.message
        });
    }
});

// ============================================
// GOOGLE OAUTH ENDPOINTS
// ============================================

// Redirect to Google for authentication
router.get('/google', (req, res) => {
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback';
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    // Check if Google OAuth is configured
    if (!clientId || !clientSecret) {
        console.error('❌ Google OAuth not configured. Missing environment variables.');
        return res.status(503).json({
            error: 'Google OAuth not configured',
            message: 'Google sign-in is not available. Please configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in the server environment variables.',
            documentation: 'See GOOGLE_OAUTH_SETUP.md for setup instructions'
        });
    }

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=openid%20profile%20email&` +
        `access_type=offline&` +
        `prompt=consent`;

    console.log(`🔄 Redirecting to Google OAuth: ${googleAuthUrl.substring(0, 100)}...`);
    res.redirect(googleAuthUrl);
});

// Handle Google OAuth callback
router.get('/google/callback', async (req, res) => {
    try {
        const { code, error: oauthError } = req.query;

        // Check if Google returned an error
        if (oauthError) {
            console.error('❌ Google OAuth error from Google:', oauthError);
            return res.redirect(`${process.env.FRONTEND_URL || 'https://romgon.net'}?error=oauth_${oauthError}`);
        }

        if (!code) {
            console.error('❌ No authorization code received');
            return res.redirect(`${process.env.FRONTEND_URL || 'https://romgon.net'}?error=no_code`);
        }

        console.log('✅ Received authorization code, exchanging for tokens...');

        // Exchange code for tokens
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                code,
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                redirect_uri: process.env.GOOGLE_REDIRECT_URI || 'https://api.romgon.net/api/auth/google/callback',
                grant_type: 'authorization_code'
            })
        });

        const tokens = await tokenResponse.json();
        
        if (!tokens.access_token) {
            console.error('❌ Token exchange failed:', tokens);
            throw new Error(`No access token received: ${tokens.error || 'Unknown error'}`);
        }

        console.log('✅ Access token received, fetching user info...');

        // Get user info from Google
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${tokens.access_token}` }
        });

        const googleUser = await userInfoResponse.json();
        console.log('✅ Google user info received:', googleUser.email);
        console.log('🔑 Google ID from Google:', googleUser.id);

        // Check if user exists by google_id (most reliable)
        let user = await dbPromise.get(
            'SELECT * FROM users WHERE google_id = ?',
            [googleUser.id]
        );

        console.log('🔍 Lookup by google_id result:', user ? `FOUND user: ${user.username}` : 'NOT FOUND');

        if (!user) {
            // Check if user exists by email (for migration of old accounts)
            user = await dbPromise.get(
                'SELECT * FROM users WHERE email = ?',
                [googleUser.email]
            );

            console.log('🔍 Lookup by email result:', user ? `FOUND user: ${user.username}, google_id in DB: ${user.google_id || 'NULL'}` : 'NOT FOUND');

            if (user) {
                // Update existing user with google_id
                console.log('� Updating existing user with Google ID:', user.username);
                await dbPromise.run(
                    'UPDATE users SET google_id = ? WHERE id = ?',
                    [googleUser.id, user.id]
                );
                user.google_id = googleUser.id;
                console.log('✅ Updated existing user with Google ID');
            } else {
                // Create new user (only if truly doesn't exist)
                console.log('📝 Creating NEW user for email:', googleUser.email);
                const baseUsername = googleUser.email.split('@')[0];
                const username = baseUsername + '_' + Math.random().toString(36).substring(2, 6);
                console.log('🎲 Generated random username:', username);
                const result = await dbPromise.run(
                    `INSERT INTO users (username, email, password_hash, rating, google_id) 
                     VALUES (?, ?, ?, 1600, ?)`,
                    [username, googleUser.email, 'google_oauth', googleUser.id]
                );

                user = {
                    id: result.lastID,
                    username,
                    email: googleUser.email,
                    rating: 1600,
                    google_id: googleUser.id
                };
                console.log('✅ New user created with ID:', user.id);
            }
        } else {
            console.log('✅ Existing user found:', user.username);
        }

        // Generate JWT token with email
        const token = generateToken(user.id, user.username, user.email);
        console.log('✅ JWT generated, redirecting to frontend...');

        // Redirect to frontend with token
        res.redirect(`${process.env.FRONTEND_URL || 'https://romgon.net'}?token=${token}`);

    } catch (err) {
        console.error('❌ Google OAuth error:', err.message);
        console.error('❌ Stack trace:', err.stack);
        res.redirect(`${process.env.FRONTEND_URL || 'https://romgon.net'}?error=auth_failed&detail=${encodeURIComponent(err.message)}`);
    }
});

// ============================================
// LOGOUT ENDPOINT
// ============================================

router.post('/logout', (req, res) => {
    // Token-based auth doesn't require server-side logout
    // Client simply discards the token
    res.json({
        message: 'Logout successful',
        message_note: 'Token-based auth - client should discard token'
    });
});

module.exports = router;
