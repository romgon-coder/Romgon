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

        // Generate token
        const token = generateToken(userId, username);

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

        // Generate token
        const token = generateToken(user.id, user.username);

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
