# ROMGON - Multiplayer Setup Guide

Welcome to ROMGON Multiplayer! This guide will help you set up and run the multiplayer server.

## 🚀 Quick Start

### Prerequisites
- **Node.js** (version 14 or higher) - [Download here](https://nodejs.org/)
- A modern web browser (Chrome, Firefox, Edge, or Safari)

### Installation Steps

1. **Install Dependencies**
   
   Open a terminal in the game folder and run:
   ```bash
   npm install
   ```

2. **Start the Multiplayer Server**
   
   ```bash
   npm start
   ```
   
   You should see:
   ```
   🎮 ROMGON Multiplayer Server Running!
   
   Server: http://localhost:3000
   Socket.IO: Ready for connections
   ```

3. **Open the Game**
   
   Open your web browser and go to:
   ```
   http://localhost:3000/ROMGON%202%20SHAPES%20WORKING.html
   ```

## 🎮 How to Play Multiplayer

### Host a Game

1. Click the **🌐 MULTIPLAYER** button on the start menu
2. Click **🎮 Create Game Room**
3. Share the **6-character room code** with your friend
4. Wait for your opponent to join
5. The game starts automatically when both players are connected!

### Join a Game

1. Click the **🌐 MULTIPLAYER** button on the start menu
2. Click **🔗 Join Game Room**
3. Enter the **room code** your friend shared with you
4. Click **Join Game**
5. The game starts immediately!

## 🎯 Multiplayer Features

- ✅ **Real-time synchronization** - All moves are instantly synced
- ✅ **Room-based matchmaking** - Private games with unique codes
- ✅ **Connection status** - Visual indicators show connection state
- ✅ **Automatic turn management** - Only move on your turn
- ✅ **Reconnection support** - 5-minute grace period if disconnected
- ✅ **Spectator mode** - Join full rooms to watch games

## 🔧 Advanced Configuration

### Changing the Server Port

Edit `server.js` and change the PORT variable:
```javascript
const PORT = process.env.PORT || 3000; // Change 3000 to your preferred port
```

### Running on a Network

To allow players on your local network to connect:

1. Find your computer's local IP address:
   - Windows: Run `ipconfig` in Command Prompt
   - Mac/Linux: Run `ifconfig` in Terminal
   - Look for something like `192.168.1.XXX`

2. Players connect to: `http://YOUR_IP:3000/ROMGON%202%20SHAPES%20WORKING.html`
   - Example: `http://192.168.1.100:3000/ROMGON%202%20SHAPES%20WORKING.html`

### Deploying to the Internet

For online play with anyone, you can deploy to:

- **Heroku** (Free tier available)
- **Railway** (Free tier available)
- **Render** (Free tier available)
- **Your own VPS** (DigitalOcean, AWS, etc.)

The server is already configured to work with these platforms!

## 🐛 Troubleshooting

### "Failed to connect to server"

- Make sure the server is running (`npm start`)
- Check that you're using the correct URL
- Ensure port 3000 is not blocked by firewall

### "Room not found"

- Check that the room code is correct (6 characters)
- The room may have expired (24 hours of inactivity)
- Ask the host to create a new room

### "Connection lost to server"

- Check your internet connection
- The server may have stopped running
- Restart the server and rejoin the game

### Moves not syncing

- Refresh both browsers
- Check the browser console for errors (F12)
- Ensure both players are using the same game version

## 📝 Development Mode

For development with auto-restart on code changes:

```bash
npm run dev
```

This uses `nodemon` to automatically restart the server when you edit `server.js`.

## 🔒 Security Notes

- Room codes are randomly generated and expire after 24 hours
- The server validates all moves to prevent cheating
- Rooms are automatically cleaned up when inactive

## 📊 Server Management

The server automatically:
- Generates unique 6-character room codes
- Validates player turns and moves
- Cleans up rooms older than 24 hours
- Handles player disconnections with 5-minute grace period
- Maintains game state for reconnection

## 🎨 Customization

### Changing Room Code Length

In `server.js`, modify the `generateRoomCode()` function:
```javascript
for (let i = 0; i < 6; i++) { // Change 6 to desired length
    code += chars.charAt(Math.floor(Math.random() * chars.length));
}
```

### Adjusting Disconnect Timeout

In `server.js`, find the disconnect handler and change the timeout:
```javascript
setTimeout(() => {
    // ...
}, 5 * 60 * 1000); // Change 5 to desired minutes
```

## 📞 Support

Having issues? Check:
1. Node.js is installed: `node --version`
2. Dependencies are installed: `npm install`
3. Server is running: Check terminal output
4. Browser console for errors: Press F12

Enjoy playing ROMGON with friends online! 🎮✨

