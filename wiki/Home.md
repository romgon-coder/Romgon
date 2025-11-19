# ROMGON Wiki

Welcome to the official ROMGON documentation! ROMGON is a real-time multiplayer hexagonal strategy board game with advanced AI capabilities.

## 🎮 What is ROMGON?

ROMGON is a turn-based strategy game played on a hexagonal board where players move unique pieces with different movement patterns to capture the opponent's rhombus (king) or reach the opponent's base.

**Live Game:** https://romgon.net

## 📚 Wiki Contents

### Getting Started
- **[Game Rules](Game-Rules)** - Learn how to play ROMGON
- **[Flip Mode Mechanics](Flip-Mode-Mechanics)** - Advanced variant with omnidirectional attacks
- **[Piece Movement Patterns](Piece-Movement-Patterns)** - Detailed movement rules for each piece

### Technical Documentation
- **[Architecture Overview](Architecture-Overview)** - System design and technology stack
- **[AI Implementation](AI-Implementation)** - Advanced AI with flip mode awareness
- **[API Documentation](API-Documentation)** - Backend REST API reference
- **[Database Schema](Database-Schema)** - Data models and relationships

### Development
- **[Development Setup](Development-Setup)** - Local environment configuration
- **[Deployment Guide](Deployment-Guide)** - Deploy to Vercel and Railway
- **[Contributing](Contributing)** - How to contribute to ROMGON
- **[Testing](Testing)** - Running and writing tests

## 🚀 Quick Links

- **GitHub Repository:** https://github.com/romgon-coder/Romgon
- **Play Online:** https://romgon.net
- **Report Issues:** https://github.com/romgon-coder/Romgon/issues

## 🌟 Key Features

### Gameplay
- ✅ **7 Unique Pieces** - Each with distinct movement patterns
- ✅ **Hexagonal Board** - 8x8 hexagonal grid (7 rows with varying columns)
- ✅ **Multiple Win Conditions** - Capture rhombus or reach opponent base
- ✅ **Flip Mode Variant** - Omnidirectional attacks when pieces are flipped

### Multiplayer
- ✅ **Real-time Play** - Socket.io powered live games
- ✅ **ELO Rating System** - 7-tier competitive ranking
- ✅ **Matchmaking** - Room-based game lobbies
- ✅ **4-Player Support** - Extended mode with 4 colors

### AI & Intelligence
- ✅ **Advanced AI Engine** - Strategic evaluation with flip mode awareness
- ✅ **Reinforcement Learning** - Q-learning based AI improvement
- ✅ **Multiple Difficulty Levels** - Easy, Medium, Hard
- ✅ **Tactical Evaluation** - Material, mobility, threats, center control

### Technology
- ✅ **Vanilla JavaScript** - Lightweight frontend
- ✅ **Node.js Backend** - Express + Socket.io
- ✅ **PostgreSQL/SQLite** - Dual database support
- ✅ **JWT Authentication** - Secure user accounts
- ✅ **Auto-deployment** - Vercel (frontend) + Railway (backend)

## 📊 Project Statistics

- **Total Code:** ~15,000 lines
- **Backend:** ~9,344 lines (Node.js)
- **Frontend:** ~4,385 lines (JavaScript)
- **Live Since:** 2024
- **Players:** Growing community

## 🎯 Game Objectives

**Primary Win Conditions:**
1. **Capture Rhombus** - Eliminate opponent's king piece
2. **Base Capture** - Move your rhombus to opponent's starting base
3. **Stalemate** - 200 move limit reached (draw)

**Strategic Elements:**
- **Material Advantage** - Capture opponent pieces
- **Positional Control** - Dominate center hexes
- **Rhombus Safety** - Protect your king
- **Advancement** - Push rhombus toward opponent base

## 🔄 Game Variants

### Standard Mode
- Traditional piece movement patterns
- Piece-specific attack patterns
- Strategic positioning required

### Flip Mode
- Pieces can be flipped for omnidirectional attacks
- Flip state matching (flipped attacks flipped only)
- Dead zone fortress (3-3, 3-4, 3-5)
- Advanced tactical depth

### 4-Player Mode
- Black, White, Blue, Red colors
- Turn order rotation
- Push mechanic for piece displacement
- 10x10 extended board

## 🛠️ Technology Stack

**Frontend:**
- Vanilla JavaScript (no frameworks)
- HTML5 Canvas for rendering
- CSS3 with variables
- Socket.io Client

**Backend:**
- Node.js v22.x
- Express.js
- Socket.io
- PostgreSQL (production) / SQLite (dev)
- JWT Authentication
- Bcrypt password hashing

**Infrastructure:**
- **Frontend:** Vercel
- **Backend:** Railway
- **DNS/CDN:** Cloudflare

## 📖 Learning Path

**For Players:**
1. Read [Game Rules](Game-Rules)
2. Learn [Piece Movement Patterns](Piece-Movement-Patterns)
3. Try [Flip Mode Mechanics](Flip-Mode-Mechanics)
4. Practice against AI

**For Developers:**
1. Complete [Development Setup](Development-Setup)
2. Understand [Architecture Overview](Architecture-Overview)
3. Study [AI Implementation](AI-Implementation)
4. Review [API Documentation](API-Documentation)
5. Read [Contributing](Contributing) guidelines

## 🤝 Contributing

We welcome contributions! See the [Contributing](Contributing) guide for:
- Code style guidelines
- Pull request process
- Issue reporting
- Feature requests

## 📝 License

MIT License - See LICENSE file for details

## 🆘 Support

- **Issues:** [GitHub Issues](https://github.com/romgon-coder/Romgon/issues)
- **Discussions:** [GitHub Discussions](https://github.com/romgon-coder/Romgon/discussions)

---

**Last Updated:** 2025-01-18
**Version:** 1.0.0
**Maintained by:** ROMGON Development Team
