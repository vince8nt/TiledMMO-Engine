# OpenMMO Engine

A web-based multiplayer game engine built with Three.js, Express.js, and PostgreSQL.

## Project Structure

This is a monorepo containing both the client-side game engine and server-side multiplayer infrastructure:

## Features

### Client (Game Engine)
- 3D world rendering with Three.js
- Chunk-based terrain system
- Player movement and interaction
- Real-time multiplayer synchronization
- Asset management system

### Server (Multiplayer Backend)
- Express.js REST API
- Socket.IO real-time communication
- PostgreSQL database integration
- Player session management
- Game state synchronization

## Quick Start

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd OpenMMO-Engine
   npm run install:all
   ```

2. **Set up PostgreSQL database:**
   ```bash
   # Create database
   createdb openmmo
   
   # Or using psql
   psql -U postgres
   CREATE DATABASE openmmo;
   ```

3. **Configure environment:**
   ```bash
   cd server
   cp env.example .env
   # Edit .env with your database credentials
   ```

4. **Start development servers:**
   ```bash
   # Start both client and server
   npm run dev
   
   # Or start individually
   npm run dev:client  # Client on http://localhost:5173
   npm run dev:server  # Server on http://localhost:3000
   ```

## Development

### Client Development
```bash
cd client
npm run dev      # Start Vite dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Server Development
```bash
cd server
npm run dev      # Start with hot reload
npm run build    # Build TypeScript
npm start        # Start production server
```

### Database Management
The server automatically creates the necessary tables on startup:
- `players` - Player accounts and profiles
- `player_positions` - Current player positions
- `game_sessions` - Active multiplayer sessions

## API Endpoints

### REST API (Express.js)
- `GET /api/health` - Server health check
- `GET /api/players` - List all players
- `GET /api/players/:id` - Get player details
- `GET /api/players/:id/position` - Get player position
- `POST /api/players/:id/position` - Update player position
- `GET /api/stats` - Game statistics

### WebSocket Events (Socket.IO)
- `player:join` - Player joins the game
- `player:move` - Player movement updates
- `player:left` - Player disconnects
- `chat:send` - Send chat message
- `chat:message` - Receive chat message

## Architecture Decisions

### Technology Stack
- **Frontend**: Three.js, TypeScript, Vite
- **Backend**: Express.js, Socket.IO, PostgreSQL
- **Real-time**: Socket.IO for low-latency multiplayer
- **Database**: PostgreSQL for persistent game state

## Deployment

### Production Build
```bash
npm run build  # Builds both client and server
```

### Environment Variables
Required environment variables for production:
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `JWT_SECRET` (for authentication)
- `CLIENT_URL` (for CORS)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test both client and server
5. Submit a pull request

## License

MIT License - see LICENSE file for details. 