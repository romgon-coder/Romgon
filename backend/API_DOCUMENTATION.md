# ROMGON Backend API Documentation

## Overview

The ROMGON backend provides a complete REST API with WebSocket support for real-time multiplayer functionality. Built with Node.js, Express.js, and SQLite.

**Base URL:** `http://localhost:3000/api`

**WebSocket URL:** `ws://localhost:3000`

---

## Table of Contents

1. [Authentication](#authentication)
2. [Users](#users)
3. [Games](#games)
4. [Ratings](#ratings)
5. [Statistics](#statistics)
6. [WebSocket Events](#websocket-events)

---

## Authentication

### Register a New User

**POST** `/api/auth/register`

Create a new user account.

**Request Body:**
```json
{
    "username": "player123",
    "email": "player@example.com",
    "password": "SecurePass123",
    "confirmPassword": "SecurePass123"
}
```

**Validation Rules:**
- Username: 3-30 characters, alphanumeric with dashes/underscores
- Email: Valid email format
- Password: Minimum 6 characters
- Passwords must match

**Response (201 Created):**
```json
{
    "user": {
        "id": "user-uuid",
        "username": "player123",
        "email": "player@example.com",
        "rating": 1600,
        "wins": 0,
        "losses": 0,
        "totalGames": 0
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "message": "User created successfully"
}
```

**Error Responses:**
- `400 Bad Request` - Validation error
- `409 Conflict` - Username or email already exists

---

### Login

**POST** `/api/auth/login`

Authenticate user and receive JWT token.

**Request Body:**
```json
{
    "username": "player123",
    "password": "SecurePass123"
}
```

**Response (200 OK):**
```json
{
    "user": {
        "id": "user-uuid",
        "username": "player123",
        "email": "player@example.com",
        "rating": 1600,
        "wins": 10,
        "losses": 5,
        "totalGames": 15
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "message": "Login successful"
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid credentials
- `404 Not Found` - User not found

---

### Verify Token

**POST** `/api/auth/verify`

Verify JWT token validity.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
    "valid": true,
    "user": {
        "id": "user-uuid",
        "username": "player123"
    },
    "message": "Token is valid"
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or expired token

---

### Logout

**POST** `/api/auth/logout`

Logout endpoint (client should discard token).

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
    "message": "Logout successful"
}
```

---

## Users

### Get Public Profile

**GET** `/api/users/:userId`

Retrieve public user profile and recent games.

**Response (200 OK):**
```json
{
    "userId": "user-uuid",
    "username": "player123",
    "email": "player@example.com",
    "rating": 1650,
    "stats": {
        "wins": 10,
        "losses": 5,
        "totalGames": 15,
        "winRate": 66.67
    },
    "memberLevel": "Silver",
    "recentGames": [
        {
            "gameId": "game-uuid",
            "opponent": "player456",
            "result": "win",
            "date": "2024-01-15T10:30:00Z"
        }
    ]
}
```

---

### Get Current User Profile

**GET** `/api/users/profile/me`

Retrieve current user's full profile with rating history.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
    "userId": "user-uuid",
    "username": "player123",
    "email": "player@example.com",
    "rating": 1650,
    "stats": {
        "wins": 10,
        "losses": 5,
        "totalGames": 15,
        "winRate": 66.67,
        "totalMoves": 450,
        "totalCaptures": 120
    },
    "ratingHistory": [
        {
            "oldRating": 1600,
            "newRating": 1620,
            "change": 20,
            "result": "win",
            "opponent": "player456",
            "timestamp": "2024-01-15T10:30:00Z"
        }
    ]
}
```

---

### Update User Profile

**PUT** `/api/users/profile/me`

Update user profile information.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:**
```json
{
    "email": "newemail@example.com"
}
```

**Note:** Username cannot be changed after creation.

**Response (200 OK):**
```json
{
    "user": {
        "id": "user-uuid",
        "username": "player123",
        "email": "newemail@example.com"
    },
    "message": "Profile updated successfully"
}
```

---

### Search Users

**GET** `/api/users/search/:query`

Search for users by username.

**Query Parameters:**
- `query` - Username to search (minimum 2 characters)

**Response (200 OK):**
```json
{
    "results": [
        {
            "userId": "user-uuid",
            "username": "player123",
            "rating": 1650,
            "tier": {
                "name": "Intermediate",
                "emoji": "🥈",
                "color": "#4ecdc4"
            },
            "stats": {
                "totalGames": 15,
                "winRate": 66.67
            }
        }
    ],
    "count": 1
}
```

---

## Games

### Create a New Game

**POST** `/api/games/create`

Create a new game.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:**
```json
{
    "opponentId": "opponent-uuid",
    "color": "white"
}
```

**Color Options:**
- `white` - You play as white
- `black` - You play as black
- `random` - Random assignment

**Response (201 Created):**
```json
{
    "gameId": "game-uuid",
    "whitePlayerId": "player-uuid",
    "blackPlayerId": "opponent-uuid",
    "status": "active",
    "message": "Game created successfully"
}
```

---

### Join a Game

**POST** `/api/games/:gameId/join`

Join an existing game waiting for a player.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
    "gameId": "game-uuid",
    "whitePlayerId": "player1-uuid",
    "blackPlayerId": "player2-uuid",
    "status": "active",
    "message": "Joined game successfully"
}
```

---

### Get Game State

**GET** `/api/games/:gameId`

Retrieve current game state.

**Response (200 OK):**
```json
{
    "gameId": "game-uuid",
    "whitePlayerId": "player1-uuid",
    "blackPlayerId": "player2-uuid",
    "status": "active",
    "moves": [
        {
            "from": "e2",
            "to": "e4",
            "timestamp": "2024-01-15T10:30:00Z",
            "playerId": "player1-uuid"
        }
    ],
    "totalMoves": 1,
    "winner": null,
    "winnerColor": null,
    "reason": null,
    "createdAt": "2024-01-15T10:25:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
}
```

---

### Make a Move

**POST** `/api/games/:gameId/move`

Record a move in the game.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:**
```json
{
    "move": {
        "from": "e2",
        "to": "e4"
    }
}
```

**Response (200 OK):**
```json
{
    "gameId": "game-uuid",
    "move": {
        "from": "e2",
        "to": "e4"
    },
    "totalMoves": 1,
    "message": "Move recorded successfully"
}
```

---

### End Game

**POST** `/api/games/:gameId/end`

End a game with result.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:**
```json
{
    "reason": "checkmate",
    "winner": "player1-uuid"
}
```

**Reason Options:**
- `checkmate`
- `resignation`
- `stalemate`
- `insufficient_material`
- `threefold_repetition`
- `fifty_move_rule`

**Response (200 OK):**
```json
{
    "gameId": "game-uuid",
    "status": "finished",
    "winnerId": "player1-uuid",
    "winnerColor": "white",
    "reason": "checkmate",
    "message": "Game ended"
}
```

---

### Get Player's Games

**GET** `/api/games/player/:playerId`

Retrieve all games for a player.

**Query Parameters:**
- `limit` - Maximum games to return (default: 20, max: 100)

**Response (200 OK):**
```json
[
    {
        "gameId": "game-uuid",
        "whitePlayerId": "player1-uuid",
        "blackPlayerId": "player2-uuid",
        "status": "finished",
        "totalMoves": 42,
        "winner": "player1-uuid",
        "winnerColor": "white",
        "reason": "checkmate",
        "createdAt": "2024-01-15T10:25:00Z",
        "updatedAt": "2024-01-15T11:15:00Z"
    }
]
```

---

## Ratings

### Update Rating After Game

**POST** `/api/ratings/update`

Update player ratings after a game.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:**
```json
{
    "gameId": "game-uuid",
    "winnerId": "winner-uuid",
    "loser": "loser-uuid"
}
```

**Response (200 OK):**
```json
{
    "winner": {
        "userId": "winner-uuid",
        "oldRating": 1600,
        "newRating": 1620,
        "change": 20
    },
    "loser": {
        "userId": "loser-uuid",
        "oldRating": 1650,
        "newRating": 1635,
        "change": -15
    },
    "message": "Rating updated successfully"
}
```

---

### Get Player Rating

**GET** `/api/ratings/:userId`

Retrieve player's current rating and history.

**Response (200 OK):**
```json
{
    "userId": "user-uuid",
    "username": "player123",
    "rating": 1650,
    "tier": {
        "name": "Intermediate",
        "emoji": "🥈",
        "color": "#4ecdc4"
    },
    "stats": {
        "wins": 10,
        "losses": 5,
        "totalGames": 15,
        "winRate": 66.67
    },
    "history": [
        {
            "oldRating": 1620,
            "newRating": 1650,
            "change": 30,
            "result": "win",
            "opponentId": "opponent-uuid",
            "opponentRating": 1600,
            "timestamp": "2024-01-15T10:30:00Z"
        }
    ]
}
```

---

### Get Leaderboard

**GET** `/api/ratings`

Retrieve global leaderboard.

**Query Parameters:**
- `limit` - Results per page (default: 100, max: 100)
- `offset` - Pagination offset (default: 0)

**Response (200 OK):**
```json
{
    "leaderboard": [
        {
            "rank": 1,
            "userId": "user-uuid",
            "username": "pro_player",
            "rating": 2400,
            "tier": {
                "name": "Grandmaster",
                "emoji": "👑",
                "color": "#FFD700"
            },
            "stats": {
                "wins": 150,
                "losses": 20,
                "totalGames": 170,
                "winRate": 88.24
            }
        }
    ],
    "pagination": {
        "limit": 100,
        "offset": 0,
        "total": 500
    }
}
```

---

### Get Rating History

**GET** `/api/ratings/:userId/history`

Retrieve detailed rating history for a player.

**Query Parameters:**
- `limit` - Maximum records (default: 50, max: 100)

**Response (200 OK):**
```json
{
    "userId": "user-uuid",
    "username": "player123",
    "currentRating": 1650,
    "history": [
        {
            "gameId": "game-uuid",
            "timestamp": "2024-01-15T10:30:00Z",
            "result": "win",
            "oldRating": 1620,
            "newRating": 1650,
            "change": 30,
            "opponent": {
                "userId": "opponent-uuid",
                "rating": 1600
            }
        }
    ],
    "pagination": {
        "limit": 50,
        "returned": 10
    }
}
```

---

### Get Global Rating Stats

**GET** `/api/ratings/stats/global`

Retrieve global rating statistics.

**Response (200 OK):**
```json
{
    "totalPlayers": 500,
    "ratings": {
        "average": 1600,
        "highest": 2450,
        "lowest": 1000
    },
    "games": {
        "totalGames": 5000,
        "totalWins": 2500,
        "globalWinRate": 50
    }
}
```

---

## Statistics

### Get Global Statistics

**GET** `/api/stats/global`

Retrieve global game statistics.

**Response (200 OK):**
```json
{
    "players": {
        "total": 500,
        "ratings": {
            "average": 1600,
            "highest": 2450,
            "lowest": 1000
        }
    },
    "games": {
        "total": 5000,
        "totalMoves": 250000,
        "avgGameLength": 50,
        "totalCaptures": 75000
    },
    "aggregated": {
        "totalGames": 5000,
        "totalWins": 2500,
        "globalWinRate": 50,
        "globalAverageMoves": 500
    }
}
```

---

### Get Player Statistics

**GET** `/api/stats/player/:userId`

Retrieve detailed statistics for a specific player.

**Response (200 OK):**
```json
{
    "userId": "user-uuid",
    "username": "player123",
    "rating": 1650,
    "tier": {
        "name": "Intermediate",
        "emoji": "🥈",
        "color": "#4ecdc4"
    },
    "memberLevel": "Silver",
    "stats": {
        "games": {
            "total": 15,
            "wins": 10,
            "losses": 5,
            "winRate": 66.67
        },
        "moves": {
            "total": 450,
            "avgPerGame": 30
        },
        "captures": {
            "total": 120,
            "avgPerGame": 8
        },
        "winsByReason": {
            "checkmate": 8,
            "resignation": 2
        }
    },
    "recentGames": [
        {
            "gameId": "game-uuid",
            "opponent": "opponent-uuid",
            "playerColor": "white",
            "result": "win",
            "reason": "checkmate",
            "totalMoves": 42,
            "completedAt": "2024-01-15T11:15:00Z"
        }
    ],
    "timestamps": {
        "createdAt": "2024-01-10T08:00:00Z",
        "updatedAt": "2024-01-15T11:15:00Z"
    }
}
```

---

### Get Leaderboard

**GET** `/api/stats/leaderboard`

Retrieve leaderboard with player statistics.

**Query Parameters:**
- `limit` - Results per page (default: 100, max: 100)
- `offset` - Pagination offset (default: 0)

**Response (200 OK):**
```json
{
    "leaderboard": [
        {
            "rank": 1,
            "userId": "user-uuid",
            "username": "pro_player",
            "rating": 2400,
            "tier": {
                "name": "Grandmaster",
                "emoji": "👑",
                "color": "#FFD700"
            },
            "memberLevel": "Gold",
            "stats": {
                "wins": 150,
                "losses": 20,
                "totalGames": 170,
                "winRate": 88.24
            }
        }
    ],
    "pagination": {
        "limit": 100,
        "offset": 0,
        "total": 500
    }
}
```

---

### Get Players by Rating Range

**GET** `/api/stats/ratings/:minRating/:maxRating`

Retrieve players within a specific rating range.

**Path Parameters:**
- `minRating` - Minimum rating
- `maxRating` - Maximum rating

**Query Parameters:**
- `limit` - Results (default: 50, max: 100)

**Response (200 OK):**
```json
{
    "ratingRange": {
        "min": 1500,
        "max": 1700
    },
    "players": [
        {
            "userId": "user-uuid",
            "username": "player123",
            "rating": 1650,
            "tier": {
                "name": "Intermediate",
                "emoji": "🥈",
                "color": "#4ecdc4"
            },
            "memberLevel": "Silver",
            "stats": {
                "wins": 10,
                "losses": 5,
                "totalGames": 15,
                "winRate": 66.67
            }
        }
    ],
    "pagination": {
        "limit": 50,
        "returned": 25,
        "total": 150
    }
}
```

---

### Get Head-to-Head Statistics

**GET** `/api/stats/h2h/:userId1/:userId2`

Retrieve head-to-head statistics between two players.

**Response (200 OK):**
```json
{
    "player1": {
        "userId": "player1-uuid",
        "username": "player1",
        "rating": 1650,
        "wins": 3
    },
    "player2": {
        "userId": "player2-uuid",
        "username": "player2",
        "rating": 1600,
        "wins": 2
    },
    "totalGames": 5,
    "winsByReason": {
        "checkmate": 3,
        "resignation": 2
    },
    "recentGames": [
        {
            "gameId": "game-uuid",
            "white_player_id": "player1-uuid",
            "black_player_id": "player2-uuid",
            "winner_id": "player1-uuid",
            "winner_color": "white",
            "reason": "checkmate",
            "total_moves": 42,
            "updated_at": "2024-01-15T11:15:00Z"
        }
    ]
}
```

---

## WebSocket Events

### Connection

**Event:** `connect`

Emitted when a client connects to the WebSocket server.

---

### User Connected

**Event:** `userConnected`

Emit this event to register a user as online.

**Payload:**
```javascript
socket.emit('userConnected', userId);
```

**Server Broadcasts:**
```javascript
socket.on('userStatusChanged', (data) => {
    console.log(data.userId, 'is', data.status); // 'online' or 'offline'
});
```

---

### Join Game

**Event:** `joinGame`

Join a game room for real-time updates.

**Payload:**
```javascript
socket.emit('joinGame', {
    gameId: 'game-uuid',
    userId: 'user-uuid'
});
```

**Server Broadcasts:**
```javascript
socket.on('playerJoined', (data) => {
    console.log(data.userId, 'joined game', data.gameId);
    console.log('Players in game:', data.players);
});
```

---

### Game Move

**Event:** `gameMove`

Broadcast a move to all players in the game.

**Payload:**
```javascript
socket.emit('gameMove', {
    gameId: 'game-uuid',
    userId: 'user-uuid',
    move: {
        from: 'e2',
        to: 'e4'
    }
});
```

**Server Broadcasts:**
```javascript
socket.on('moveMade', (data) => {
    console.log(data.userId, 'made move:', data.move);
});
```

---

### Disconnect

**Event:** `disconnect`

Emitted when a client disconnects.

**Server Broadcasts:**
```javascript
socket.on('playerLeft', (data) => {
    console.log('Player left game', data.gameId);
    console.log('Remaining players:', data.remainingPlayers);
});
```

---

## Error Handling

All API endpoints return standard error responses:

**400 Bad Request** - Validation error
```json
{
    "errors": [
        {
            "msg": "Invalid email",
            "param": "email"
        }
    ]
}
```

**401 Unauthorized** - Authentication required
```json
{
    "error": "No token provided"
}
```

**404 Not Found** - Resource not found
```json
{
    "error": "User not found"
}
```

**409 Conflict** - Business logic conflict
```json
{
    "error": "Username already exists"
}
```

**500 Internal Server Error** - Server error
```json
{
    "error": "Internal server error",
    "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## Rating System

### ELO Formula

New Rating = Old Rating + K × (Score - Expected Score)

Where:
- K-Factor = 32
- Score = 1 for win, 0 for loss
- Expected Score = 1 / (1 + 10^((opponent rating - your rating) / 400))

### Rating Tiers

| Tier | Rating | Emoji | Color |
|------|--------|-------|-------|
| Grandmaster | 2400+ | 👑 | #FFD700 |
| Master | 2200-2399 | 🏆 | #FF69B4 |
| Expert | 2000-2199 | ⭐ | #FF6B6B |
| Advanced | 1800-1999 | 🥇 | #F39C12 |
| Intermediate | 1600-1799 | 🥈 | #4ecdc4 |
| Beginner | 1400-1599 | 🥉 | #27ae60 |
| Novice | 0-1399 | 🎯 | #3498db |

### Member Levels

- **Bronze**: 0-49 games
- **Silver**: 50-99 games
- **Gold**: 100+ games

---

## Rate Limiting

Currently not implemented. Will be added in future versions.

---

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

Tokens are valid for 7 days.

---

## Version

API Version: **1.0.0**

Last Updated: January 2024

