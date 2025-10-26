// ============================================
// AUTHENTICATION UTILITIES
// ============================================

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// ============================================
// PASSWORD HASHING
// ============================================

async function hashPassword(password) {
    try {
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hash(password, salt);
    } catch (err) {
        throw new Error('Error hashing password: ' + err.message);
    }
}

async function comparePassword(password, hash) {
    try {
        return await bcrypt.compare(password, hash);
    } catch (err) {
        throw new Error('Error comparing passwords: ' + err.message);
    }
}

// ============================================
// JWT TOKEN MANAGEMENT
// ============================================

function generateToken(userId, username, expiresIn = '7d') {
    try {
        return jwt.sign(
            {
                userId,
                username,
                iat: Math.floor(Date.now() / 1000)
            },
            JWT_SECRET,
            { expiresIn }
        );
    } catch (err) {
        throw new Error('Error generating token: ' + err.message);
    }
}

function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (err) {
        throw new Error('Invalid or expired token: ' + err.message);
    }
}

function decodeToken(token) {
    try {
        return jwt.decode(token);
    } catch (err) {
        throw new Error('Error decoding token: ' + err.message);
    }
}

// ============================================
// MIDDLEWARE
// ============================================

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        console.warn('⚠️ No token provided in request');
        return res.status(401).json({
            error: 'Access token required',
            message: 'No authorization token provided'
        });
    }

    try {
        const decoded = verifyToken(token);
        console.log('✅ Token verified for user:', decoded.username);
        req.user = decoded;
        next();
    } catch (err) {
        console.error('❌ Token verification failed:', err.message);
        console.error('❌ Token (first 50 chars):', token.substring(0, 50));
        return res.status(403).json({
            error: 'Invalid token',
            message: err.message
        });
    }
}

function optionalAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
        try {
            const decoded = verifyToken(token);
            req.user = decoded;
        } catch (err) {
            console.warn('Optional auth: Invalid token', err.message);
        }
    }
    
    next();
}

// ============================================
// VALIDATION
// ============================================

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePassword(password) {
    // At least 6 characters
    return password && password.length >= 6;
}

function validateUsername(username) {
    // Alphanumeric, underscores, dashes, 3-30 chars
    const re = /^[a-zA-Z0-9_-]{3,30}$/;
    return re.test(username);
}

module.exports = {
    hashPassword,
    comparePassword,
    generateToken,
    verifyToken,
    decodeToken,
    authenticateToken,
    optionalAuth,
    validateEmail,
    validatePassword,
    validateUsername
};
