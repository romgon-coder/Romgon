# ROMGON Backend

Complete Node.js/Express backend for the ROMGON game with REST API, WebSocket support, and SQLite database.

## Features

✅ **User Authentication**
- Registration with email validation
- Login with JWT tokens (7-day expiration)
- Password hashing with bcryptjs
- Token verification and refresh

✅ **Game Management**
- Create and join games
- Real-time move synchronization
- Game state tracking
- Multiple game end conditions

✅ **Rating System**
- ELO rating calculations (K-factor: 32)
- 7 rating tiers (Novice to Grandmaster)
- Rating history tracking
- Leaderboard generation

✅ **Statistics & Analytics**
- Player statistics (wins, losses, win rate)
- Global statistics aggregation
- Head-to-head matchup stats
- Rating range filtering

✅ **Real-time Communication**
- WebSocket support with Socket.io
- Real-time game updates
- User online/offline status
- Live chat messaging

✅ **Security**
- CORS protection
- Helmet security headers
- Input validation and sanitization
- SQL injection prevention with prepared statements

## Quick Start

### Prerequisites

- Node.js 14+ 
- npm or yarn
- SQLite3

### Installation

1. **Install dependencies:**
```bash
cd backend
npm install
```

2. **Create `.env` file:**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```
PORT=3000
NODE_ENV=development
JWT_SECRET=your-secret-key-here
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5000
```

3. **Start the server:**
```bash
npm start
```

Or with auto-restart on file changes:
```bash
npm run dev
```

Server will be running at `http://localhost:3000`

### Health Check

```bash
curl http://localhost:3000/api/health
```

Response:
```json
{
    "status": "OK",
    "timestamp": "2024-01-15T10:30:00Z",
    "uptime": 123.45
}
```

## Project Structure

```
backend/
├── server.js                 # Main Express/Socket.io server
├── package.json              # Dependencies
├── .env                      # Environment configuration
├── config/
│   └── database.js           # SQLite database setup and schema
├── utils/
│   ├── auth.js              # Authentication utilities (JWT, bcrypt)
│   └── rating.js            # ELO rating calculations
├── routes/
│   ├── auth.js              # Authentication endpoints
│   ├── users.js             # User profile endpoints
│   ├── games.js             # Game management endpoints
│   ├── ratings.js           # Rating system endpoints
│   └── stats.js             # Statistics endpoints
├── websocket/
│   └── gameSocket.js        # WebSocket event handlers
└── README.md                # This file
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify` - Verify JWT token
- `POST /api/auth/logout` - Logout user

### Users
- `GET /api/users/:userId` - Get public profile
- `GET /api/users/profile/me` - Get current user profile (auth required)
- `PUT /api/users/profile/me` - Update profile (auth required)
- `GET /api/users/search/:query` - Search users

### Games
- `POST /api/games/create` - Create new game (auth required)
- `POST /api/games/:gameId/join` - Join game (auth required)
- `GET /api/games/:gameId` - Get game state
- `POST /api/games/:gameId/move` - Make move (auth required)
- `POST /api/games/:gameId/end` - End game (auth required)
- `GET /api/games/player/:playerId` - Get player's games

### Ratings
- `POST /api/ratings/update` - Update rating after game (auth required)
- `GET /api/ratings/:userId` - Get player rating and history
- `GET /api/ratings` - Get leaderboard
- `GET /api/ratings/:userId/history` - Get detailed rating history
- `GET /api/ratings/stats/global` - Get global rating stats

### Statistics
- `GET /api/stats/global` - Get global statistics
- `GET /api/stats/player/:userId` - Get player statistics
- `GET /api/stats/leaderboard` - Get leaderboard with stats
- `GET /api/stats/ratings/:minRating/:maxRating` - Get players by rating range
- `GET /api/stats/h2h/:userId1/:userId2` - Head-to-head statistics

For detailed endpoint documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

## WebSocket Events

### Client Events
- `userConnected` - Register user as online
- `joinGame` - Join a game room
- `gameMove` - Broadcast a move

### Server Events
- `userStatusChanged` - User online/offline status
- `playerJoined` - Player joined game
- `moveMade` - Move was made in game
- `playerLeft` - Player left game

Example:
```javascript
const socket = io('http://localhost:3000');

// Register user
socket.emit('userConnected', 'user-uuid');

// Join game
socket.emit('joinGame', {
    gameId: 'game-uuid',
    userId: 'user-uuid'
});

// Make move
socket.emit('gameMove', {
    gameId: 'game-uuid',
    userId: 'user-uuid',
    move: { from: 'e2', to: 'e4' }
});

// Listen for moves
socket.on('moveMade', (data) => {
    console.log('Move made:', data);
});
```

## Database Schema

### Users Table
```sql
id (UUID, PRIMARY KEY)
username (VARCHAR, UNIQUE, 3-30 chars)
email (VARCHAR, UNIQUE)
password_hash (VARCHAR, bcrypt hash)
rating (INTEGER, default 1600)
wins (INTEGER, default 0)
losses (INTEGER, default 0)
total_games (INTEGER, default 0)
total_moves (INTEGER, default 0)
total_captures (INTEGER, default 0)
member_level (VARCHAR, default 'Bronze')
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

### Games Table
```sql
id (VARCHAR, UUID, PRIMARY KEY)
white_player_id (UUID, FOREIGN KEY -> users.id)
black_player_id (UUID, FOREIGN KEY -> users.id)
winner_id (UUID, nullable)
winner_color (VARCHAR, 'white'/'black')
reason (VARCHAR, end reason)
moves (TEXT, JSON array)
status (VARCHAR, 'active'/'finished')
total_moves (INTEGER)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

### Rating Changes Table
```sql
id (INTEGER, PRIMARY KEY)
player_id (UUID, FOREIGN KEY -> users.id)
old_rating (INTEGER)
new_rating (INTEGER)
change (INTEGER)
game_id (VARCHAR)
opponent_id (UUID)
opponent_rating (INTEGER)
result (VARCHAR, 'win'/'loss')
created_at (TIMESTAMP)
```

### Additional Tables
- `friends` - Friend relationships
- `messages` - Direct and game chat messages
- `achievements` - Player achievements

## Rating System

### ELO Formula
```
New Rating = Old Rating + K × (Score - Expected Score)
```

Where:
- **K-Factor**: 32 (standard volatility)
- **Score**: 1 for win, 0 for loss
- **Expected Score**: 1 / (1 + 10^((opponent rating - your rating) / 400))
- **Initial Rating**: 1600

### Rating Tiers

| Tier | Rating | Emoji | Level |
|------|--------|-------|-------|
| Grandmaster | 2400+ | 👑 | Legendary |
| Master | 2200-2399 | 🏆 | Elite |
| Expert | 2000-2199 | ⭐ | Excellent |
| Advanced | 1800-1999 | 🥇 | Very Good |
| Intermediate | 1600-1799 | 🥈 | Good |
| Beginner | 1400-1599 | 🥉 | Learning |
| Novice | 0-1399 | 🎯 | Starting |

### Member Levels

- **Bronze**: 0-49 games
- **Silver**: 50-99 games
- **Gold**: 100+ games

## Authentication

### JWT Tokens

All protected endpoints require a JWT token in the `Authorization` header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Token Details:**
- Expiration: 7 days
- Algorithm: HS256
- Issued on: Registration/Login

### Password Security

- Algorithm: bcryptjs
- Salt rounds: 10
- Minimum length: 6 characters
- Recommended: 8+ characters with mixed case and numbers

### Validation Rules

**Username:**
- Length: 3-30 characters
- Characters: Alphanumeric, dashes, underscores
- Format: No spaces
- Unique per database

**Email:**
- Format: Valid email format (RFC 5322)
- Unique per database
- Case-insensitive

**Password:**
- Length: Minimum 6 characters
- Strength: Recommended 8+ with mixed case
- Expiration: Never (consider implementing password reset)

## Development

### Scripts

```bash
# Start server
npm start

# Start with hot reload
npm run dev

# Run tests (when available)
npm test

# Lint code
npm run lint
```

### Environment Variables

```
PORT                 # Server port (default: 3000)
NODE_ENV             # development/production
JWT_SECRET           # Secret key for JWT signing
ALLOWED_ORIGINS      # Comma-separated CORS origins
DATABASE_URL         # SQLite database path
LOG_LEVEL            # Logging level (debug/info/warn/error)
```

## Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET` (minimum 32 characters)
- [ ] Configure `ALLOWED_ORIGINS` for your domain
- [ ] Use HTTPS in production
- [ ] Set up database backups
- [ ] Enable request logging
- [ ] Configure CORS appropriately
- [ ] Use environment variables for sensitive data
- [ ] Set up monitoring/logging
- [ ] Configure rate limiting (future)
- [ ] Set up SSL/TLS certificates

### Deployment Platforms

#### Heroku
```bash
heroku create romgon-backend
heroku config:set JWT_SECRET=your-secret-key
git push heroku main
```

#### Railway
```bash
railway up
railway env add JWT_SECRET your-secret-key
```

#### Docker
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## Error Handling

### Common Errors

**400 Bad Request** - Validation failed
```json
{
    "errors": [{
        "msg": "Invalid email format",
        "param": "email"
    }]
}
```

**401 Unauthorized** - Authentication required or invalid token
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

## Performance Considerations

- Database queries optimized with proper indexing
- Connection pooling for database
- Response compression with gzip
- Caching strategies for frequently accessed data
- Rate limiting (to be implemented)
- Request validation at entry point

## Security Best Practices

✅ **Implemented:**
- CORS protection
- Helmet security headers
- Password hashing with bcryptjs
- JWT token authentication
- Input validation and sanitization
- SQL injection prevention

⏳ **To Implement:**
- Rate limiting
- Request signing
- API key authentication
- Audit logging
- Two-factor authentication
- Session management

## Troubleshooting

### Server won't start
- Check if port 3000 is available
- Verify `.env` file exists and is configured
- Check Node.js version (14+)

### Database errors
- Ensure SQLite is installed
- Check database file permissions
- Verify `DATA_DIR` exists

### Authentication failures
- Verify JWT_SECRET is set
- Check token expiration (7 days)
- Ensure Authorization header format is correct

### CORS errors
- Check `ALLOWED_ORIGINS` configuration
- Verify frontend URL is in the list
- Ensure credentials flag is set correctly

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

ROMGON Backend © 2024

## Support

For issues or questions, please open an issue on the project repository.

## Roadmap

- [ ] Rate limiting
- [ ] Email verification
- [ ] Password reset functionality
- [ ] Two-factor authentication
- [ ] Social features (friends, messaging)
- [ ] Achievement system
- [ ] Tournament mode
- [ ] Spectator mode
- [ ] Game analysis tools
- [ ] AI opponent

---

**Version**: 1.0.0  
**Last Updated**: January 2024  
**Author**: ROMGON Dev Team

