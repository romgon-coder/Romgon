# ENGINE ANALYSIS SYSTEM
**Complete Backend-Frontend Integration**

## 📋 Overview

The Engine Analysis system provides comprehensive monitoring, diagnostics, and optimization tools for the ROMGON game engine. It enables real-time health checks, performance metrics, connection validation, and optimization recommendations.

## 🎯 Features

### 1. **System Overview**
- Total games, users, and custom games statistics
- Recent activity tracking (24h, 7d)
- Visual distribution charts for game statuses
- Real-time metrics refresh

### 2. **Health Monitoring**
- Database connectivity checks
- Memory usage tracking
- System uptime monitoring
- Schema validation
- Overall health status (healthy/degraded/error)

### 3. **Performance Metrics**
- Query performance analysis
- Database size tracking
- Index optimization status
- Node.js runtime metrics
- Latency measurements

### 4. **Connection Validation**
- Custom games integration status
- Game engine connectivity
- Authentication system check
- Rating system validation
- WebSocket status monitoring

### 5. **Diagnostic Tests**
- Database integrity checks
- Foreign key constraint validation
- Orphaned record detection
- Invalid game state identification
- Automated test suite

### 6. **Optimization Suggestions**
- Smart recommendations based on current state
- Priority-based suggestions (high/medium/low)
- Database optimization opportunities
- Memory usage improvements
- Maintenance task recommendations

## 🏗️ Architecture

### Backend API Endpoints

All endpoints are prefixed with `/api/engine`:

#### Health Check
```
GET /api/engine/health
```
**Response:**
```json
{
  "timestamp": "2025-10-26T...",
  "status": "healthy",
  "checks": {
    "database": {
      "status": "ok",
      "responsive": true,
      "latency": 0
    },
    "schema": {
      "status": "ok",
      "tables": ["users", "games", ...],
      "count": 8
    },
    "memory": {
      "status": "ok",
      "heapUsed": "50 MB",
      "heapTotal": "100 MB",
      "rss": "120 MB"
    },
    "uptime": {
      "status": "ok",
      "seconds": 86400,
      "formatted": "1d"
    }
  }
}
```

#### Engine Statistics
```
GET /api/engine/stats
```
**Response:**
```json
{
  "totalGames": 1234,
  "gamesByStatus": {
    "active": 45,
    "completed": 1150,
    "abandoned": 39
  },
  "totalUsers": 567,
  "activeUsers": 123,
  "totalCustomGames": 89,
  "publishedCustomGames": 34,
  "avgMovesPerGame": 42,
  "gamesLast24h": 15
}
```

#### Performance Metrics
```
GET /api/engine/performance
```
**Response:**
```json
{
  "timestamp": "2025-10-26T...",
  "database": {
    "size": "12.34 MB",
    "indexes": 15
  },
  "queries": {
    "simple_select": {
      "description": "Basic SELECT query",
      "duration_ms": 2,
      "status": "excellent"
    },
    "join_query": {
      "description": "JOIN with users table",
      "duration_ms": 8,
      "status": "excellent"
    },
    "aggregate_query": {
      "description": "Aggregation query",
      "duration_ms": 5,
      "status": "excellent"
    }
  },
  "nodejs": {
    "version": "v18.17.0",
    "platform": "linux",
    "arch": "x64"
  }
}
```

#### Connection Status
```
GET /api/engine/connections
```
**Response:**
```json
{
  "timestamp": "2025-10-26T...",
  "services": {
    "customGames": {
      "status": "connected",
      "total": 89,
      "recent": 12,
      "integration": "active"
    },
    "gameEngine": {
      "status": "connected",
      "activeGames": 45,
      "integration": "active"
    },
    "authentication": {
      "status": "connected",
      "totalUsers": 567,
      "integration": "active"
    },
    "ratingSystem": {
      "status": "connected",
      "totalRatings": 890,
      "integration": "active"
    },
    "websocket": {
      "status": "connected",
      "activeConnections": 23,
      "integration": "active"
    }
  }
}
```

#### Diagnostics
```
GET /api/engine/diagnostics
```
**Response:**
```json
{
  "timestamp": "2025-10-26T...",
  "overall": "healthy",
  "tests": [
    {
      "name": "Database Integrity",
      "status": "passed",
      "message": "Database integrity check passed"
    },
    {
      "name": "Foreign Key Constraints",
      "status": "passed",
      "message": "All foreign keys are valid"
    },
    {
      "name": "Orphaned Game Records",
      "status": "warning",
      "message": "Found 5 orphaned records",
      "recommendation": "Clean up orphaned records"
    },
    {
      "name": "Game State Validity",
      "status": "passed",
      "message": "All games have valid status"
    }
  ]
}
```

#### Optimization Suggestions
```
GET /api/engine/optimize
```
**Response:**
```json
{
  "timestamp": "2025-10-26T...",
  "recommendations": [
    {
      "category": "indexing",
      "priority": "high",
      "title": "Add Database Indexes",
      "description": "Consider adding indexes on frequently queried columns",
      "recommendation": "CREATE INDEX idx_games_status ON games(status)",
      "impact": "Faster query performance for game listings"
    },
    {
      "category": "maintenance",
      "priority": "medium",
      "title": "Database Fragmentation",
      "description": "Database has 1234 free pages",
      "recommendation": "Run VACUUM command to reclaim space",
      "impact": "Reduce database file size and improve performance"
    }
  ]
}
```

## 🎨 Frontend Interface

### Access
Navigate to: `https://romgon-coder.github.io/Romgon/engine-analysis.html`

### Tabs

1. **Overview** - Key statistics and game distribution charts
2. **Health Check** - System health monitoring
3. **Performance** - Query and runtime metrics
4. **Connections** - Service integration status
5. **Diagnostics** - Automated test results
6. **Optimization** - Smart improvement suggestions

### Features

- **Real-time Refresh**: Each tab has a refresh button for latest data
- **Visual Indicators**: 
  - 🟢 Green = Excellent/Passed
  - 🟡 Yellow = Good/Warning
  - 🔴 Red = Slow/Error
- **Responsive Design**: Works on desktop and mobile
- **Dark Theme**: Modern gradient design with blur effects
- **Animated Charts**: Bar charts for data visualization
- **Status Badges**: Color-coded status indicators

## 🔧 Integration Guide

### Backend Setup

1. **Install the route:**
```bash
# Routes are auto-loaded from backend/routes/
# No additional installation needed
```

2. **Start the backend:**
```bash
cd backend
npm start
```

3. **Verify endpoint:**
```bash
curl https://api.romgon.net/api/engine/health
```

### Frontend Integration

1. **Deploy the page:**
```bash
# Copy to deploy folder (already done)
cp deploy/engine-analysis.html public/engine-analysis.html
```

2. **Update API endpoint if needed:**
```javascript
// In engine-analysis.html, line ~572
const API_BASE = 'https://api.romgon.net/api/engine';
```

3. **Link from main game:**
```html
<!-- Add to index.html navigation -->
<a href="engine-analysis.html">Engine Analysis</a>
```

## 🚀 Usage Examples

### Monitoring Server Health

```javascript
// Check if server is healthy
const response = await fetch('https://api.romgon.net/api/engine/health');
const health = await response.json();

if (health.status !== 'healthy') {
  console.warn('Server health degraded:', health.checks);
}
```

### Performance Testing

```javascript
// Run performance tests
const perf = await fetch('https://api.romgon.net/api/engine/performance');
const metrics = await perf.json();

// Check query performance
metrics.queries.forEach(query => {
  if (query.status === 'slow') {
    console.warn(`Slow query: ${query.name} - ${query.duration_ms}ms`);
  }
});
```

### Connection Validation

```javascript
// Verify all services are connected
const conn = await fetch('https://api.romgon.net/api/engine/connections');
const connections = await conn.json();

Object.entries(connections.services).forEach(([service, status]) => {
  if (status.status !== 'connected') {
    console.error(`Service disconnected: ${service}`);
  }
});
```

## 🔍 Diagnostic Tests

The system runs the following automated tests:

1. **Database Integrity Check**
   - Uses SQLite's PRAGMA integrity_check
   - Verifies database file is not corrupted

2. **Foreign Key Validation**
   - Checks all foreign key constraints
   - Reports orphaned references

3. **Orphaned Records Detection**
   - Finds games referencing deleted users
   - Recommends cleanup actions

4. **Game State Validation**
   - Ensures all games have valid status values
   - Detects invalid state transitions

## 💡 Optimization Recommendations

The system provides intelligent recommendations based on:

- **Database size and fragmentation**
- **Memory usage patterns**
- **Missing indexes on frequently queried columns**
- **Old completed games for archival**
- **Query performance bottlenecks**

Each recommendation includes:
- Priority level (high/medium/low)
- Clear description of the issue
- Specific action to take
- Expected impact

## 🛡️ Security Considerations

- **No authentication required** for read-only endpoints
- **CORS enabled** for frontend access
- **Rate limiting** should be added for production
- **Sensitive data** (like passwords) never exposed
- **Error messages** sanitized to prevent information leakage

## 📊 Performance Benchmarks

### Query Performance Targets

- **Simple SELECT**: < 10ms (excellent), < 50ms (good)
- **JOIN queries**: < 20ms (excellent), < 100ms (good)
- **Aggregations**: < 50ms (excellent), < 200ms (good)

### System Health Targets

- **Memory usage**: < 90% heap used
- **Database size**: Monitor for growth patterns
- **Uptime**: Track for stability metrics
- **Active connections**: Monitor WebSocket load

## 🔄 Maintenance Tasks

### Daily
- Check health status
- Review error logs
- Monitor active games

### Weekly
- Run diagnostics suite
- Review optimization suggestions
- Check connection status

### Monthly
- Analyze performance trends
- Archive old completed games
- Review and optimize indexes
- Run VACUUM if needed

## 🐛 Troubleshooting

### Health Check Fails
```bash
# Check if backend is running
curl https://api.romgon.net/api/engine/health

# Check database connection
sqlite3 backend/config/database.sqlite "PRAGMA integrity_check;"
```

### Slow Queries
```bash
# Enable query logging
# Add to server.js:
db.on('trace', (sql) => console.log('SQL:', sql));
```

### High Memory Usage
```bash
# Monitor with:
curl https://api.romgon.net/api/engine/health | jq '.checks.memory'

# Restart server if needed
pm2 restart romgon-backend
```

## 🎯 Future Enhancements

- [ ] Real-time WebSocket monitoring dashboard
- [ ] Historical metrics and trend analysis
- [ ] Automated alerting for critical issues
- [ ] Database backup and restore tools
- [ ] Query explain plan analysis
- [ ] Custom alert thresholds
- [ ] Email notifications for errors
- [ ] Performance regression detection
- [ ] Automated optimization execution
- [ ] External app integration status

## 📝 API Documentation

Full API documentation is available at:
- Backend: `backend/API_DOCUMENTATION.md`
- Engine endpoints: Documented in this file

## 🤝 Contributing

When adding new diagnostic tests or optimizations:

1. Add test logic to `backend/routes/engine-analysis.js`
2. Update frontend display in `deploy/engine-analysis.html`
3. Document in this file
4. Add examples and expected outputs

## 📞 Support

For issues or questions:
- Check backend logs: `tail -f backend/logs/error.log`
- Review console in browser DevTools
- Check Railway deployment logs
- Verify API endpoint accessibility

---

**Version:** 1.0.0  
**Last Updated:** October 26, 2025  
**Author:** ROMGON Development Team
