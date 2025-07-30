# OpenMMO Engine Architecture

## Overview

OpenMMO Engine is designed as a **monorepo** containing both client-side game engine and server-side multiplayer infrastructure. This architecture was chosen for better development experience, shared code reuse, and simplified deployment.

## Architecture Decision: Monorepo vs Separate Repositories

### Why Monorepo? ✅

**Advantages:**
- **Shared Code**: Game logic, types, and utilities can be shared between client and server
- **Atomic Changes**: Game mechanics changes can be coordinated across both sides
- **Easier Testing**: Full-stack testing and integration testing
- **Simplified CI/CD**: Single repository for deployment pipelines
- **Better Developer Experience**: Work on both client and server simultaneously
- **Version Synchronization**: Client and server versions stay in sync

**Disadvantages:**
- Larger repository size
- More complex build processes
- Potential for tight coupling

### Alternative: Separate Repositories ❌

**Why we didn't choose this:**
- **Coordination Overhead**: Managing versions between repositories
- **Deployment Complexity**: Need to coordinate releases
- **Code Duplication**: Shared logic would need to be duplicated or extracted to packages
- **Development Friction**: Switching between repositories during development

## Technology Stack

### Frontend (Client)
- **Three.js**: 3D graphics and rendering
- **TypeScript**: Type safety and better development experience
- **Vite**: Fast development server and build tool
- **Socket.IO Client**: Real-time communication with server

### Backend (Server)
- **Express.js**: REST API framework
- **Socket.IO**: Real-time bidirectional communication
- **PostgreSQL**: Persistent data storage
- **TypeScript**: Type safety and better development experience
- **Node.js**: Runtime environment

### Shared
- **TypeScript**: Common type definitions
- **npm workspaces**: Monorepo management

## Project Structure

```
OpenMMO-Engine/
├── client/                 # Frontend game engine
│   ├── src/               # TypeScript source
│   │   ├── main.ts        # Entry point
│   │   ├── game_world.ts  # Game world management
│   │   ├── player.ts      # Player logic
│   │   ├── terrain.ts     # Terrain system
│   │   └── ...
│   ├── textures/          # Game assets
│   ├── objects/           # 3D models
│   ├── map_data/          # World data
│   └── package.json       # Client dependencies
├── server/                # Backend multiplayer server
│   ├── src/               # Server source
│   │   ├── index.ts       # Server entry point
│   │   ├── database.ts    # Database connection
│   │   ├── socket.ts      # Socket.IO handlers
│   │   ├── routes.ts      # REST API routes
│   │   └── ...
│   ├── env.example        # Environment template
│   └── package.json       # Server dependencies
├── shared/                # Shared code
│   └── types.ts           # Common TypeScript interfaces
└── package.json           # Root workspace config
```

## Data Flow

### Real-time Communication (Socket.IO)
```
Client ←→ Socket.IO ←→ Server ←→ PostgreSQL
```

**Events:**
- `player:join` - Player connects to game
- `player:move` - Player movement updates
- `player:left` - Player disconnects
- `chat:send` - Chat messages
- `game:state` - Current game state sync

### REST API (Express.js)
```
Client ←→ HTTP/REST ←→ Server ←→ PostgreSQL
```

**Endpoints:**
- Player management
- Game statistics
- Health checks
- Data persistence

## Database Schema

### Core Tables
```sql
-- Player accounts
CREATE TABLE players (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Player positions (for persistence)
CREATE TABLE player_positions (
  id SERIAL PRIMARY KEY,
  player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
  x FLOAT NOT NULL,
  y FLOAT NOT NULL,
  z FLOAT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Active game sessions
CREATE TABLE game_sessions (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) UNIQUE NOT NULL,
  player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
  socket_id VARCHAR(255),
  connected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  disconnected_at TIMESTAMP
);
```

## Scalability Considerations

### Current Architecture
- Single server instance
- In-memory game state
- PostgreSQL for persistence
- Socket.IO for real-time communication

### Future Scalability Options
1. **Horizontal Scaling**: Multiple server instances with load balancing
2. **Redis**: Session storage and pub/sub for cross-server communication
3. **Database Sharding**: Distribute player data across multiple databases
4. **Microservices**: Split into separate services (auth, game logic, chat, etc.)
5. **CDN**: Static asset delivery optimization

## Security Considerations

### Current Implementation
- CORS configuration
- Helmet.js for security headers
- Input validation
- SQL parameterized queries

### Future Enhancements
- JWT authentication
- Rate limiting
- Input sanitization
- HTTPS enforcement
- Database connection pooling
- Environment variable management

## Development Workflow

### Local Development
1. Start PostgreSQL database
2. Configure environment variables
3. Run `npm run dev` (starts both client and server)
4. Client available at `http://localhost:5173`
5. Server available at `http://localhost:3000`

### Production Deployment
1. Build both client and server: `npm run build`
2. Deploy server to hosting platform
3. Serve client static files
4. Configure environment variables
5. Set up PostgreSQL database

## Performance Optimization

### Client-side
- Chunk-based terrain loading
- Level-of-detail (LOD) system
- Texture compression
- Asset caching

### Server-side
- Connection pooling
- Efficient database queries
- Memory management
- Event batching

## Monitoring and Debugging

### Current Tools
- Console logging
- Database query monitoring
- Socket.IO debugging

### Future Enhancements
- Application performance monitoring (APM)
- Error tracking (Sentry)
- Metrics collection
- Health check endpoints
- Database query optimization

This architecture provides a solid foundation for a multiplayer game engine while maintaining flexibility for future enhancements and scaling. 