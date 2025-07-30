import { Server, Socket } from 'socket.io';
import { pool } from './database';

interface Player {
  id: string;
  username: string;
  position: { x: number; y: number; z: number };
}

interface GameState {
  players: Map<string, Player>;
}

const gameState: GameState = {
  players: new Map()
};

export function setupSocketHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log(`Player connected: ${socket.id}`);

    // Handle player join
    socket.on('player:join', async (data: { username: string; position: { x: number; y: number; z: number } }) => {
      const player: Player = {
        id: socket.id,
        username: data.username,
        position: data.position
      };

      gameState.players.set(socket.id, player);

      // Broadcast to all other players
      socket.broadcast.emit('player:joined', player);

      // Send current players to the new player
      const currentPlayers = Array.from(gameState.players.values()).filter(p => p.id !== socket.id);
      socket.emit('game:state', { players: currentPlayers });

      console.log(`Player ${data.username} joined the game`);
    });

    // Handle player movement
    socket.on('player:move', (data: { x: number; y: number; z: number }) => {
      const player = gameState.players.get(socket.id);
      if (player) {
        player.position = data;
        
        // Broadcast movement to other players
        socket.broadcast.emit('player:moved', {
          id: socket.id,
          position: data
        });

        // Update database (async, don't wait)
        updatePlayerPosition(socket.id, data);
      }
    });

    // Handle player disconnect
    socket.on('disconnect', () => {
      const player = gameState.players.get(socket.id);
      if (player) {
        gameState.players.delete(socket.id);
        
        // Broadcast to other players
        socket.broadcast.emit('player:left', { id: socket.id });
        
        console.log(`Player ${player.username} disconnected`);
      }
    });

    // Handle chat messages
    socket.on('chat:message', (data: { message: string }) => {
      const player = gameState.players.get(socket.id);
      if (player) {
        const chatData = {
          id: socket.id,
          username: player.username,
          message: data.message,
          timestamp: new Date().toISOString()
        };
        
        // Broadcast to all players
        io.emit('chat:message', chatData);
      }
    });
  });
}

async function updatePlayerPosition(playerId: string, position: { x: number; y: number; z: number }) {
  try {
    // This would typically update the database with the player's position
    // For now, we'll just log it
    console.log(`Updating position for player ${playerId}:`, position);
    
    // TODO: Implement actual database update
    // await pool.query(
    //   'UPDATE player_positions SET x = $1, y = $2, z = $3, updated_at = NOW() WHERE player_id = $4',
    //   [position.x, position.y, position.z, playerId]
    // );
  } catch (error) {
    console.error('Error updating player position:', error);
  }
} 