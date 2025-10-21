# Quick Test Instructions for Active Games

## Current Issue:
- ⚠️ No token (Guest login doesn't connect to backend)
- Active games requires backend authentication

## Quick Fix for Testing:

### Option 1: Set Test User ID Manually (Console)

1. **Open browser Console (F12)**
2. **Run these commands:**

```javascript
// Set test user ID (TestAlice from our test data)
localStorage.setItem('userId', '1');
localStorage.setItem('token', 'test-token-bypass');

// Reload active games
await loadActiveGames();
```

This will bypass auth for testing purposes.

---

### Option 2: Modify Backend to Allow Test Without Auth

Let me update the backend routes to accept test users without strict JWT validation for testing.

---

### Option 3: Create a Guest Token

We can modify the guest login to create a temporary backend user.

---

**Which option would you prefer?**

For quick testing, I recommend **Option 1** - just run those console commands and see if active games load!
