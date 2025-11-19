# API Documentation

Backend REST API and WebSocket reference for ROMGON.

## 📋 Table of Contents

- [Base URL](#base-url)
- [Authentication](#authentication)
- [AI Endpoints](#ai-endpoints)
- [Game Endpoints](#game-endpoints)
- [User Endpoints](#user-endpoints)
- [WebSocket Events](#websocket-events)
- [Error Handling](#error-handling)

## 🌐 Base URL

**Production:**
```
https://romgon-backend.railway.app
```

**Development:**
```
http://localhost:3000
```

## 🔐 Authentication

### JWT Tokens

Most endpoints require JWT authentication:

```http
Authorization: Bearer <jwt_token>
```

### Getting a Token

**Login:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "player1",
    "email": "user@example.com",
    "rating": 1200
  }
}
```

## 🤖 AI Endpoints

### Get AI Move

Get best move from AI engine.

**Endpoint:**
```http
POST /api/ai/move
Content-Type: application/json
```

**Request Body:**
```json
{
  "board": {
    "0-0": { "color": "white", "type": "square", "flipped": false },
    "3-4": { "color": "white", "type": "rhombus", "flipped": false },
    "4-5": { "color": "black", "type": "circle", "flipped": true }
  },
  "playerColor": "white",
  "flipModeEnabled": true,
  "difficulty": "hard"
}
```

**Response:**
```json
{
  "move": {
    "from": "3-4",
    "to": "3-5",
    "isCapture": false
  },
  "evaluation": 1250.5,
  "candidateMoves": [
    {
      "from": "3-4",
      "to": "3-5",
      "evaluation": 1250.5,
      "notation": "3-4→3-5"
    },
    {
      "from": "0-0",
      "to": "1-1",
      "evaluation": 1200.0,
      "notation": "0-0→1-1"
    }
  ],
  "difficulty": "hard",
  "flipModeEnabled": true
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| board | Object | Yes | Board state (position → piece) |
| playerColor | String | Yes | "white" or "black" |
| flipModeEnabled | Boolean | No | Enable flip mode evaluation (default: false) |
| difficulty | String | No | "easy", "medium", "hard" (default: "hard") |

**Board Object Format:**
```javascript
{
  "row-col": {
    "color": "white" | "black",
    "type": "square" | "triangle" | "rhombus" | "circle" | "hexgon",
    "flipped": true | false  // For flip mode
  }
}
```

**Error Responses:**

```json
// 400 - Missing fields
{
  "error": "Missing required fields: board, playerColor"
}

// 400 - Invalid board state
{
  "error": "Invalid board format"
}

// 500 - Engine error
{
  "error": "AI engine error: <message>"
}
```

## 🎮 Game Endpoints

### Create Game

**Endpoint:**
```http
POST /api/games/create
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "whitePlayerId": 1,
  "blackPlayerId": 2,
  "gameType": "ranked"
}
```

**Response:**
```json
{
  "gameId": 42,
  "whitePlayerId": 1,
  "blackPlayerId": 2,
  "status": "active",
  "createdAt": "2025-01-18T10:30:00Z"
}
```

### Get Game

**Endpoint:**
```http
GET /api/games/:gameId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": 42,
  "whitePlayerId": 1,
  "blackPlayerId": 2,
  "currentTurn": "white",
  "status": "active",
  "moveHistory": [
    {
      "from": "0-0",
      "to": "1-1",
      "piece": "square",
      "capture": false
    }
  ],
  "createdAt": "2025-01-18T10:30:00Z"
}
```

### Submit Move

**Endpoint:**
```http
POST /api/games/:gameId/move
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "from": "3-4",
  "to": "3-5",
  "piece": "rhombus",
  "capture": false,
  "flipped": false
}
```

**Response:**
```json
{
  "success": true,
  "gameState": {
    "currentTurn": "black",
    "moveCount": 15,
    "status": "active"
  }
}
```

### Submit Game Result

**Endpoint:**
```http
POST /api/games/submit-result
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "winner": "white",
  "reason": "rhombus_captured",
  "moveCount": 42,
  "opponent_type": "ai",
  "gameState": "final_board_state"
}
```

**Response:**
```json
{
  "success": true,
  "ratingChange": {
    "oldRating": 1200,
    "newRating": 1224,
    "change": +24
  }
}
```

### List Active Games

**Endpoint:**
```http
GET /api/games/active
Authorization: Bearer <token>
```

**Response:**
```json
{
  "games": [
    {
      "id": 42,
      "opponent": "player2",
      "currentTurn": "white",
      "moveCount": 15,
      "createdAt": "2025-01-18T10:30:00Z"
    }
  ],
  "total": 1
}
```

## 👤 User Endpoints

### Register

**Endpoint:**
```http
POST /api/auth/register
Content-Type: application/json
```

**Request:**
```json
{
  "username": "player1",
  "email": "user@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "player1",
    "email": "user@example.com",
    "rating": 1200
  }
}
```

### Login

**Endpoint:**
```http
POST /api/auth/login
Content-Type: application/json
```

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "player1",
    "email": "user@example.com",
    "rating": 1200,
    "tier": "intermediate"
  }
}
```

### Get Profile

**Endpoint:**
```http
GET /api/users/profile
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": 1,
  "username": "player1",
  "email": "user@example.com",
  "rating": 1200,
  "tier": "intermediate",
  "gamesPlayed": 42,
  "wins": 25,
  "losses": 15,
  "draws": 2,
  "winRate": 59.5,
  "createdAt": "2024-12-01T00:00:00Z"
}
```

### Update Profile

**Endpoint:**
```http
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "username": "newusername",
  "email": "newemail@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "newusername",
    "email": "newemail@example.com"
  }
}
```

### Get Leaderboard

**Endpoint:**
```http
GET /api/ratings/leaderboard?limit=10&offset=0
```

**Response:**
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "username": "grandmaster1",
      "rating": 2100,
      "tier": "grandmaster",
      "gamesPlayed": 150,
      "winRate": 68.5
    },
    {
      "rank": 2,
      "username": "master2",
      "rating": 1950,
      "tier": "master",
      "gamesPlayed": 200,
      "winRate": 65.0
    }
  ],
  "total": 1000
}
```

## 🔌 WebSocket Events

### Connection

**Client:**
```javascript
const socket = io('https://romgon-backend.railway.app', {
  auth: {
    token: jwtToken
  }
});
```

### Game Events

#### Join Game

**Emit:**
```javascript
socket.emit('join_game', {
  gameId: 42,
  playerId: 1
});
```

**Response:**
```javascript
socket.on('game_joined', (data) => {
  console.log('Joined game:', data.gameId);
  console.log('Opponent:', data.opponent);
});
```

#### Make Move

**Emit:**
```javascript
socket.emit('make_move', {
  gameId: 42,
  from: '3-4',
  to: '3-5',
  piece: 'rhombus',
  capture: false
});
```

**Broadcast:**
```javascript
socket.on('move_made', (data) => {
  console.log('Move:', data.from, '→', data.to);
  console.log('Player:', data.playerColor);
  // Update board UI
});
```

#### Game Over

**Broadcast:**
```javascript
socket.on('game_over', (data) => {
  console.log('Winner:', data.winner);
  console.log('Reason:', data.reason);
  console.log('Rating change:', data.ratingChange);
});
```

### Lobby Events

#### Join Lobby

**Emit:**
```javascript
socket.emit('join_lobby');
```

**Response:**
```javascript
socket.on('lobby_update', (data) => {
  console.log('Players online:', data.players);
  console.log('Active games:', data.activeGames);
});
```

#### Challenge Player

**Emit:**
```javascript
socket.emit('challenge', {
  opponentId: 2,
  gameType: 'ranked'
});
```

**Response:**
```javascript
socket.on('challenge_received', (data) => {
  console.log('Challenge from:', data.challenger);
  console.log('Game type:', data.gameType);
});
```

### Chat Events

#### Send Message

**Emit:**
```javascript
socket.emit('chat_message', {
  roomId: 'global',
  message: 'Hello everyone!'
});
```

**Broadcast:**
```javascript
socket.on('chat_message', (data) => {
  console.log(data.username + ':', data.message);
  console.log('Timestamp:', data.timestamp);
});
```

## ⚠️ Error Handling

### Error Response Format

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "validation error"
  }
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 409 | Conflict (duplicate resource) |
| 500 | Internal Server Error |

### Common Errors

**Authentication Error:**
```json
{
  "error": "Invalid or expired token",
  "code": "AUTH_ERROR"
}
```

**Validation Error:**
```json
{
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "email": "Invalid email format",
    "password": "Password must be at least 8 characters"
  }
}
```

**Game Error:**
```json
{
  "error": "Illegal move",
  "code": "ILLEGAL_MOVE",
  "details": {
    "from": "3-4",
    "to": "5-5",
    "reason": "Target out of range"
  }
}
```

## 📊 Rate Limiting

- **AI Endpoint:** 60 requests/minute per IP
- **Auth Endpoints:** 10 requests/minute per IP
- **Game Endpoints:** 100 requests/minute per user
- **WebSocket:** 200 messages/minute per connection

**Rate Limit Headers:**
```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1642512000
```

**Rate Limit Exceeded:**
```json
{
  "error": "Rate limit exceeded",
  "code": "RATE_LIMIT",
  "retryAfter": 60
}
```

## 🔧 Health Check

**Endpoint:**
```http
GET /api/engine/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-18T10:30:00Z",
  "checks": {
    "database": {
      "status": "ok",
      "responsive": true,
      "latency": 5
    },
    "memory": {
      "status": "ok",
      "heapUsed": "45 MB",
      "heapTotal": "128 MB"
    },
    "uptime": {
      "status": "ok",
      "seconds": 86400,
      "formatted": "1d 0h 0m"
    }
  }
}
```

## 📝 Examples

### Complete Game Flow

```javascript
// 1. Login
const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});
const { token } = await loginResponse.json();

// 2. Create game
const gameResponse = await fetch(`${API_URL}/api/games/create`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    whitePlayerId: 1,
    blackPlayerId: 2
  })
});
const { gameId } = await gameResponse.json();

// 3. Connect WebSocket
const socket = io(API_URL, { auth: { token } });
socket.emit('join_game', { gameId, playerId: 1 });

// 4. Get AI move
const aiResponse = await fetch(`${API_URL}/api/ai/move`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    board: currentBoardState,
    playerColor: 'white',
    flipModeEnabled: true,
    difficulty: 'hard'
  })
});
const { move } = await aiResponse.json();

// 5. Make move
socket.emit('make_move', {
  gameId,
  from: move.from,
  to: move.to,
  piece: 'rhombus',
  capture: false
});

// 6. Listen for opponent move
socket.on('move_made', (data) => {
  console.log('Opponent moved:', data);
  updateBoard(data.from, data.to);
});
```

### Flip Mode AI Integration

```javascript
// Build board state from DOM
function buildBoardState() {
  const board = {};
  document.querySelectorAll('.piece').forEach(piece => {
    const hex = piece.closest('.hexagon');
    const pos = parsePosition(hex.id);
    board[pos] = {
      color: getPieceColor(piece),
      type: getPieceType(piece),
      flipped: piece.dataset.flipped === 'true'  // Critical!
    };
  });
  return board;
}

// Get AI move with flip mode
async function getAIMove() {
  const board = buildBoardState();
  const response = await fetch(`${API_URL}/api/ai/move`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      board,
      playerColor: 'white',
      flipModeEnabled: window.flipModeEnabled,
      difficulty: 'hard'
    })
  });

  const { move, evaluation } = await response.json();
  console.log('AI suggests:', move.from, '→', move.to);
  console.log('Evaluation:', evaluation);

  return move;
}
```

## 🔗 Related Pages

- [AI Implementation](AI-Implementation) - AI engine details
- [Flip Mode Mechanics](Flip-Mode-Mechanics) - Flip mode rules
- [Architecture Overview](Architecture-Overview) - System design
- [Development Setup](Development-Setup) - Local development

---

**Last Updated:** 2025-01-18
**API Version:** 1.0.0
