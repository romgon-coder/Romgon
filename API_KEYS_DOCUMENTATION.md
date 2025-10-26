# 🔑 API Key Management System - Complete Documentation

## 📋 Overview

The ROMGON API Key Management System provides secure authentication for accessing the Game Engine API. This system allows users to generate, manage, and revoke API keys with customizable permissions.

---

## 🎯 Features

### ✅ Core Functionality
- **Secure Key Generation** - Cryptographically secure API keys with `rmg_` prefix
- **Secret Management** - SHA-256 hashed secrets (never stored in plain text)
- **Permission System** - Granular access control for different API operations
- **Expiration Control** - Keys can expire after 7/30/90/365 days or never
- **Usage Tracking** - Monitor request counts and last usage timestamps
- **Revocation** - Immediately invalidate compromised keys
- **User Isolation** - Users can only manage their own keys

### 🔐 Security Features
- ✅ Secrets shown only once during generation
- ✅ SHA-256 hashing for secret storage
- ✅ JWT authentication for management endpoints
- ✅ User-based access control
- ✅ Soft delete (revocation) with audit trail
- ✅ Expiration date enforcement
- ✅ Activity logging (last used, usage count)

---

## 📚 API Endpoints

### 1. Generate API Key
**POST** `/api/keys/generate`

**Authentication:** Required (JWT Bearer token)

**Request Body:**
```json
{
  "name": "My Chess Bot",
  "permissions": [
    "read:games",
    "read:moves",
    "write:moves"
  ],
  "expiresIn": "30"
}
```

**Parameters:**
- `name` (string, required) - Name for the API key (min 3 characters)
- `permissions` (array, required) - List of permission scopes
- `expiresIn` (string, optional) - Days until expiration ("7", "30", "90", "365", "never")

**Response:**
```json
{
  "success": true,
  "message": "API key generated successfully",
  "apiKey": {
    "id": 1,
    "name": "My Chess Bot",
    "key": "rmg_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
    "secret": "f9e8d7c6b5a4938271605948372615039485761",
    "permissions": ["read:games", "read:moves", "write:moves"],
    "expiresAt": "2025-11-25T10:30:00.000Z",
    "createdAt": "2025-10-26T10:30:00.000Z"
  },
  "warning": "⚠️ Save your secret now! It will never be shown again."
}
```

---

### 2. List API Keys
**GET** `/api/keys/list`

**Authentication:** Required (JWT Bearer token)

**Response:**
```json
{
  "success": true,
  "keys": [
    {
      "id": 1,
      "name": "My Chess Bot",
      "apiKey": "rmg_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
      "permissions": ["read:games", "read:moves"],
      "created_at": "2025-10-26T10:30:00.000Z",
      "last_used_at": "2025-10-26T14:20:00.000Z",
      "expires_at": "2025-11-25T10:30:00.000Z",
      "is_active": 1,
      "usage_count": 152,
      "status": "active",
      "isExpired": false
    }
  ],
  "total": 1
}
```

---

### 3. Revoke API Key
**DELETE** `/api/keys/:keyId`

**Authentication:** Required (JWT Bearer token)

**Parameters:**
- `keyId` (integer) - ID of the key to revoke

**Response:**
```json
{
  "success": true,
  "message": "API key revoked successfully"
}
```

---

### 4. Validate API Key
**POST** `/api/keys/validate`

**Authentication:** None (public endpoint for validation)

**Request Body:**
```json
{
  "apiKey": "rmg_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
  "secret": "f9e8d7c6b5a4938271605948372615039485761"
}
```

**Response (Valid):**
```json
{
  "valid": true,
  "userId": 42,
  "keyName": "My Chess Bot",
  "permissions": ["read:games", "read:moves", "write:moves"]
}
```

**Response (Invalid):**
```json
{
  "valid": false,
  "error": "Invalid API key or secret"
}
```

---

### 5. Update Permissions
**PATCH** `/api/keys/:keyId/permissions`

**Authentication:** Required (JWT Bearer token)

**Request Body:**
```json
{
  "permissions": [
    "read:games",
    "read:moves",
    "write:games",
    "write:moves"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Permissions updated successfully",
  "permissions": ["read:games", "read:moves", "write:games", "write:moves"]
}
```

---

### 6. Get API Key Stats
**GET** `/api/keys/:keyId/stats`

**Authentication:** Required (JWT Bearer token)

**Response:**
```json
{
  "success": true,
  "stats": {
    "name": "My Chess Bot",
    "totalRequests": 1523,
    "lastUsed": "2025-10-26T14:20:00.000Z",
    "createdAt": "2025-10-01T10:30:00.000Z",
    "daysSinceCreation": 25,
    "avgDailyUsage": 61,
    "isActive": true
  }
}
```

---

## 🔐 Available Permissions

### Read Permissions
- **`read:games`** - View game data (positions, status, players)
- **`read:moves`** - Access move history and sequences
- **`read:users`** - Retrieve user profiles and statistics
- **`read:stats`** - Access global statistics and leaderboards
- **`read:custom_games`** - View custom game configurations
- **`read:analysis`** - Access engine analysis and evaluations

### Write Permissions
- **`write:games`** - Create new games
- **`write:moves`** - Submit moves to active games
- **`write:custom_games`** - Create/modify custom game rules
- **`write:analysis`** - Request position analysis

### Special Permissions
- **`admin:*`** - Full administrative access (restricted)

---

## 💻 Frontend Usage

### Management Dashboard
**URL:** `https://romgon-coder.github.io/Romgon/api-keys.html`

**Features:**
- Generate new API keys with custom permissions
- View all your API keys and their status
- Monitor usage statistics
- Copy keys to clipboard
- Revoke compromised keys
- See expiration dates and last usage

**Access:**
- From main menu: **Advanced Options → API KEYS**
- Direct link from Game Engine API documentation

---

## 🔧 Integration Examples

### JavaScript/Node.js
```javascript
// Authenticate API request
async function makeApiRequest(endpoint) {
    const apiKey = 'rmg_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6';
    const secret = 'f9e8d7c6b5a4938271605948372615039485761';
    
    // First, validate credentials
    const validateResponse = await fetch('https://api.romgon.net/api/keys/validate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ apiKey, secret })
    });
    
    const validation = await validateResponse.json();
    
    if (validation.valid) {
        // Make authenticated request
        const response = await fetch(`https://api.romgon.net${endpoint}`, {
            headers: {
                'X-API-Key': apiKey,
                'X-API-Secret': secret
            }
        });
        
        return await response.json();
    }
}

// Usage
makeApiRequest('/api/games').then(data => console.log(data));
```

### Python
```python
import requests
import hashlib

class RomgonAPI:
    def __init__(self, api_key, secret):
        self.api_key = api_key
        self.secret = secret
        self.base_url = 'https://api.romgon.net'
    
    def validate(self):
        response = requests.post(f'{self.base_url}/api/keys/validate', json={
            'apiKey': self.api_key,
            'secret': self.secret
        })
        return response.json()
    
    def get_games(self):
        headers = {
            'X-API-Key': self.api_key,
            'X-API-Secret': self.secret
        }
        response = requests.get(f'{self.base_url}/api/games', headers=headers)
        return response.json()

# Usage
api = RomgonAPI('rmg_...', 'secret...')
if api.validate()['valid']:
    games = api.get_games()
    print(games)
```

### cURL
```bash
# Validate API key
curl -X POST https://api.romgon.net/api/keys/validate \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "rmg_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
    "secret": "f9e8d7c6b5a4938271605948372615039485761"
  }'

# Make authenticated request
curl https://api.romgon.net/api/games \
  -H "X-API-Key: rmg_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6" \
  -H "X-API-Secret: f9e8d7c6b5a4938271605948372615039485761"
```

---

## 🗄️ Database Schema

### `api_keys` Table
```sql
CREATE TABLE api_keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    api_key TEXT UNIQUE NOT NULL,
    secret_hash TEXT NOT NULL,
    permissions TEXT DEFAULT '["read:games"]',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_used_at DATETIME,
    expires_at DATETIME,
    revoked_at DATETIME,
    is_active INTEGER DEFAULT 1,
    usage_count INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

**Indexes:**
- Primary key on `id`
- Unique index on `api_key`
- Index on `user_id` for fast user lookups
- Index on `is_active` for filtering active keys

---

## 🔒 Security Best Practices

### For Users
1. **Never share your API secret** - Treat it like a password
2. **Use minimal permissions** - Only grant what your application needs
3. **Set expiration dates** - Avoid "never expires" for production keys
4. **Rotate keys regularly** - Generate new keys every 30-90 days
5. **Revoke unused keys** - Remove keys you're no longer using
6. **Monitor usage** - Check stats for unexpected activity
7. **Use HTTPS only** - Never send keys over unencrypted connections

### For Developers
1. **Store in environment variables** - Never hardcode keys in source code
2. **Use .gitignore** - Prevent accidentally committing secrets
3. **Implement rate limiting** - Protect against abuse
4. **Log access attempts** - Monitor for suspicious activity
5. **Validate permissions** - Check scopes before processing requests

---

## 📊 Key Format Specification

### API Key Format
- **Prefix:** `rmg_` (identifies ROMGON keys)
- **Body:** 48 hexadecimal characters (24 bytes random data)
- **Total Length:** 52 characters
- **Example:** `rmg_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0`

### API Secret Format
- **Length:** 64 hexadecimal characters (32 bytes random data)
- **Storage:** SHA-256 hash only (never plain text)
- **Example:** `f9e8d7c6b5a49382716059483726150394857610a2b3c4d5e6f7g8h9`

---

## 🎯 Use Cases

### 1. Chess Engine Bot
```javascript
// Bot that plays games via API
const permissions = [
    'read:games',
    'read:moves',
    'write:moves'
];
```

### 2. Analytics Dashboard
```javascript
// Statistics and visualization tool
const permissions = [
    'read:games',
    'read:moves',
    'read:users',
    'read:stats'
];
```

### 3. Game Streaming Tool
```javascript
// Live game broadcaster
const permissions = [
    'read:games',
    'read:moves',
    'read:users'
];
```

### 4. Custom Game Creator
```javascript
// Platform for custom variants
const permissions = [
    'read:custom_games',
    'write:custom_games',
    'read:games'
];
```

---

## 🐛 Troubleshooting

### Key Validation Fails
**Problem:** `{ "valid": false, "error": "Invalid API key or secret" }`

**Solutions:**
- Verify you copied the entire key/secret (no spaces)
- Check that key hasn't been revoked
- Ensure key hasn't expired
- Confirm you're using the correct secret (not the hash)

### Permission Denied
**Problem:** API returns 403 Forbidden

**Solutions:**
- Check your key has the required permission scope
- Update permissions via management dashboard
- Verify endpoint requires the permission you have

### Rate Limiting
**Problem:** API returns 429 Too Many Requests

**Solutions:**
- Implement exponential backoff
- Reduce request frequency
- Use webhooks instead of polling
- Contact support for higher limits

---

## 📈 Future Enhancements

### Planned Features
- [ ] API key rotation (automatic)
- [ ] Webhook support for key events
- [ ] IP whitelisting
- [ ] Request rate limits per key
- [ ] Detailed audit logs
- [ ] Team/organization keys
- [ ] OAuth2 integration
- [ ] Scoped tokens (temporary access)

---

## 📞 Support

**Documentation:** https://romgon-coder.github.io/Romgon/game-engine-api.html  
**Management Dashboard:** https://romgon-coder.github.io/Romgon/api-keys.html  
**API Base URL:** https://api.romgon.net

---

## 📝 Changelog

### Version 1.0 (October 26, 2025)
- ✅ Initial API key system release
- ✅ Key generation with custom permissions
- ✅ SHA-256 secret hashing
- ✅ Expiration date support
- ✅ Usage tracking and statistics
- ✅ Revocation system
- ✅ Management dashboard
- ✅ Validation endpoint
- ✅ Permission system (8 scopes)

---

**Last Updated:** October 26, 2025  
**Version:** 1.0.0  
**Status:** 🟢 Production Ready
