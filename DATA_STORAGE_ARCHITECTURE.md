# Data Storage & Architecture Guide 📊

## Current Architecture Overview

### Storage Technology: Browser localStorage
```
┌─────────────────────────────────────────────┐
│         Browser's localStorage              │
├─────────────────────────────────────────────┤
│ romgon-users         → All user accounts    │
│ romgon-user          → Current session      │
│ romgon-guest-settings → Guest preferences   │
│ (other keys...)      → Settings, themes     │
└─────────────────────────────────────────────┘
```

**Location:** Each browser's local storage
**Scope:** Single browser/device
**Data Persistence:** Until user clears cache

---

## Data Structure

### 1. All Users Storage (`romgon-users`)

```javascript
localStorage.getItem('romgon-users')

// Structure:
{
  "Nick": {
    username: "Nick",
    email: "canedciotakias@gmail.com",
    password: "YWJjMTIz...",  // Base64 encoded (NOT secure)
    registeredDate: "2025-10-19T...",
    lastLogin: "2025-10-19T15:45:00Z",
    stats: {
      gamesPlayed: 5,
      gamesWon: 3,
      gamesLost: 2,
      gamesDrawn: 0
    },
    pieceStats: {
      square: { captures: 0, survived: 0, lost: 0 },
      triangle: { captures: 0, survived: 0, lost: 0 },
      // ... etc for all piece types
    },
    longestWinStreak: 2,
    fastestWin: 34,
    totalCaptures: 21,
    totalMoves: 342,
    settings: {
      audioEnabled: true,
      boardZoom: 1,
      theme: 'dark'
    },
    savedGames: [
      {
        name: "vs AI - Victory",
        timestamp: "2025-10-19T...",
        data: { /* game state */ }
      }
    ]
  },
  "john_doe": { /* ... */ },
  // ... more users
}
```

### 2. Current Session (`romgon-user`)

```javascript
// For Registered Users:
{
  username: "Nick",
  email: "canedciotakias@gmail.com",
  isGuest: false,
  loginTime: "2025-10-19T15:45:00Z"
}

// For Guest Users:
{
  type: 'guest',
  name: 'Guest Player',
  id: 'guest_1729365900000',
  isGuest: true
}
```

### 3. Guest Settings (`romgon-guest-settings`)

```javascript
{
  audioEnabled: false,
  boardZoom: 1.2,
  theme: 'dark',
  gamesWon: 2,
  gamesLost: 1
}
```

---

## Account Management System

### Registered Users
✅ **Persistent** - Data saved across sessions/browsers (within same browser)
✅ **Full Profile** - Email, password, registration date
✅ **Real Stats** - All gameplay statistics tracked
✅ **Account Management** - Delete account, change settings
✅ **Last Login** - Tracked automatically on sign-in
✅ **Saved Games** - Can save and load games
❌ **Cross-device** - Different browsers = different accounts

### Guest Users
✅ **No Registration** - Play immediately
✅ **Session Stats** - Wins/losses tracked during session
✅ **Preferences** - Audio, zoom, theme saved locally
❌ **Persistent** - Lost when browser closes or cache cleared
❌ **Last Login** - Not tracked
❌ **Saved Games** - Session-only, not persisted

---

## Account Settings Modal

### For Registered Users:
- **Profile Section**
  - Username
  - Email  
  - Registered Date
- **Statistics Section**
  - Wins, Losses, Total Games
  - Last Login (date & time)
  - Saved Games (count)
- **Actions**
  - Delete Account button (visible)
  - Preferences modal access
  - Statistics Dashboard access

### For Guest Users:
- **Profile Section**
  - "Guest Player"
  - Session ID
  - "Not registered"
- **Statistics Section**
  - Wins, Losses, Total Games (from session)
  - "Session only" (Last Login)
  - "0 (session)" (Saved Games)
- **Actions**
  - No Delete Account button
  - Preferences modal access
  - Statistics Dashboard access

---

## Database Requirements: Future Enhancement

### Current Limitations (localStorage)
❌ Data lost if browser cache cleared
❌ No sync across devices/browsers
❌ No cross-platform multiplayer
❌ No cloud backup
❌ Password stored in base64 (not encrypted)
❌ No server-side validation
❌ Limited to ~10MB per browser

### What We'd Need for Production:

#### Option 1: **Firebase (Recommended)**
- Real-time database
- Built-in authentication
- Auto-backups
- Easy to scale
- Free tier available

#### Option 2: **Node.js + MongoDB**
- Custom backend
- Full control
- More complex to set up
- Better for custom requirements

#### Option 3: **AWS (DynamoDB, Cognito)**
- Scalable
- Enterprise-grade
- Complex pricing

#### Option 4: **Supabase**
- PostgreSQL backend
- Built-in auth
- Real-time API
- Good middle ground

---

## Current Data Flow

### User Registration:
```
1. User fills signup form
   ↓
2. Validation (username, email, password)
   ↓
3. Check if user already exists in romgon-users
   ↓
4. Create new user object
   ↓
5. Save to romgon-users localStorage
   ↓
6. Save to romgon-user (current session)
   ↓
7. recordLastLogin() called
   ↓
8. User logged in! ✅
```

### User Login:
```
1. Registered user clicks login button (comes later)
   ↓
2. Check romgon-users for matching credentials
   ↓
3. Set romgon-user session
   ↓
4. recordLastLogin() called
   ↓
5. User logged in! ✅
```

### Guest Login:
```
1. Guest clicks "Continue as Guest"
   ↓
2. Create guest session object
   ↓
3. Save to romgon-user (type: 'guest')
   ↓
4. No lastLogin tracking
   ↓
5. Guest logged in! ✅
```

### Game Result Recording:
```
1. Game ends (win/loss/draw)
   ↓
2. recordGameResult(username, result)
   ↓
3. Get user from romgon-users
   ↓
4. Update stats (gamesPlayed, gamesWon, etc.)
   ↓
5. Save back to romgon-users
   ↓
6. renderStatsDashboard() refreshes UI ✅
```

---

## Functions Overview

### Statistics Functions
| Function | Purpose | Storage |
|----------|---------|---------|
| `getUserStats(username)` | Get complete player stats | romgon-users |
| `recordGameResult(username, result)` | Record win/loss/draw | romgon-users |
| `recordLastLogin(username)` | Update login timestamp | romgon-users |
| `saveGame(username, name, data)` | Save game state | romgon-users |
| `getSavedGames(username)` | Retrieve saved games | romgon-users |
| `getWinRate(username)` | Calculate win percentage | Computed |
| `getAvgMovesPerGame(username)` | Average moves per game | Computed |
| `getTotalCaptures(username)` | Total pieces captured | romgon-users |

### Account Functions
| Function | Purpose |
|----------|---------|
| `showAccountModal()` | Display profile & stats modal |
| `showSettingsModal()` | Display preferences modal |
| `handleSignUp(event)` | Register new user |
| `handleGuestLogin()` | Start guest session |
| `deleteAccount()` | Remove user account |

---

## Security Notes ⚠️

### Current Implementation (NOT for Production):
```javascript
// BAD: Base64 encoding is NOT encryption
password: btoa(password)  // "password123" → "cGFzc3dvcmQxMjM="
```

### What We Should Do:
1. **Never store passwords in localStorage**
2. Use server-side authentication
3. Hash passwords with bcrypt/argon2
4. Use HTTPS for all communications
5. Implement JWT tokens for sessions
6. Regular security audits

---

## How to Test Locally

### View all users:
```javascript
JSON.parse(localStorage.getItem('romgon-users'))
```

### View current session:
```javascript
JSON.parse(localStorage.getItem('romgon-user'))
```

### Simulate game result:
```javascript
simulateGameResult('Nick')
```

### Manually record result:
```javascript
recordGameResult('Nick', {
  winner: 'Nick',
  loser: 'AI',
  moves: 45,
  captureCount: 6
})
```

### Check stats:
```javascript
getUserStats('Nick')
```

### Clear all data:
```javascript
localStorage.clear()
```

---

## Future Roadmap

### Short Term (Next):
- [ ] Login screen for returning users
- [ ] Password reset functionality
- [ ] Email verification
- [ ] Better password hashing

### Medium Term:
- [ ] Firebase integration for cloud sync
- [ ] Cross-device support
- [ ] Leaderboards
- [ ] Friend system
- [ ] Game replay saving

### Long Term:
- [ ] Full database backend
- [ ] Multiplayer matchmaking
- [ ] Tournament system
- [ ] Mobile app
- [ ] Achievement badges
- [ ] ELO rating system

---

## Testing Accounts

**Local Demo Account:**
- Username: `Nick`
- Email: `canedciotakias@gmail.com`
- Status: Registered user (if you signed up)

**Guest Account:**
- Type: `guest`
- Name: `Guest Player`
- Status: Session-only, lost on browser close

---

**Last Updated:** October 19, 2025
**Version:** 1.0 - localStorage-based System
**Next Major Version:** Cloud Database Integration

