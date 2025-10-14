# 🎮 ROMGON Multiplayer - Quick Start

## ⚠️ IMPORTANT: How to Access the Game

**DO NOT** open the HTML file directly by double-clicking it!

You **MUST** access the game through the server for multiplayer to work.

## ✅ Correct Setup (3 Easy Steps)

### Step 1: Install Dependencies

Open Command Prompt or PowerShell in this folder and run:

```bash
npm install
```

Wait for it to complete (this only needs to be done once).

### Step 2: Start the Server

In the same terminal, run:

```bash
npm start
```

You should see:
```
🎮 ROMGON Multiplayer Server Running!

Server: http://localhost:3000
Socket.IO: Ready for connections
```

**KEEP THIS WINDOW OPEN** - The server must stay running!

### Step 3: Open the Game in Your Browser

Open your web browser and go to:

```
http://localhost:3000/ROMGON%202%20SHAPES%20WORKING.html
```

Or the simpler version:

```
http://localhost:3000/ROMGON 2 SHAPES WORKING.html
```

## 🎯 Now You Can Play Multiplayer!

1. Click the **🌐 MULTIPLAYER** button
2. Click **🎮 Create Game Room** 
3. Share the 6-character room code with your friend
4. They should open the same URL on their computer
5. They click **🔗 Join Game Room** and enter the code
6. Play!

## 🌐 Playing Over the Internet

### Option A: Local Network (Same WiFi)

1. Find your computer's IP address:
   - Windows: Open Command Prompt, type `ipconfig`, look for "IPv4 Address" (something like 192.168.1.XXX)
   
2. Your friend connects to:
   ```
   http://YOUR_IP:3000/ROMGON%202%20SHAPES%20WORKING.html
   ```
   Example: `http://192.168.1.100:3000/ROMGON%202%20SHAPES%20WORKING.html`

### Option B: Over the Internet (Free Hosting)

Deploy to a free hosting service like:
- **Railway.app** (Recommended - easiest)
- **Render.com** 
- **Heroku.com**

See `README_MULTIPLAYER.md` for deployment instructions.

## ❌ Common Errors

### Error: "Cannot connect to server"

**Solution:** Make sure the server is running (`npm start`)

### Error: "ERR_NAME_NOT_RESOLVED"

**Solution:** You're opening the HTML file directly! Use the server URL instead:
`http://localhost:3000/ROMGON%202%20SHAPES%20WORKING.html`

### Error: "Room not found"

**Solution:** 
- Double-check the room code is correct
- Make sure the host created the room successfully
- Room codes expire after 24 hours

### Error: "npm: command not found"

**Solution:** Install Node.js from https://nodejs.org/

## 📝 Summary

| ❌ WRONG | ✅ CORRECT |
|----------|-----------|
| Double-click HTML file | Run `npm start` then open browser to `http://localhost:3000/...` |
| `file:///C:/...` in address bar | `http://localhost:3000/...` in address bar |
| Opening HTML without server | Server running in terminal |

## 🆘 Still Having Issues?

1. Check the terminal where you ran `npm start` - is the server running?
2. Is the browser URL starting with `http://localhost:3000`?
3. Press F12 in browser, check Console tab for error messages
4. Make sure port 3000 isn't being used by another program

Happy gaming! 🎮✨


