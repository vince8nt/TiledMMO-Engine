// Shared types between client and server

export interface Player {
  id: string;
  username: string;
  position: Position;
  lastSeen?: Date;
}

export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface GameState {
  players: Player[];
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: string;
}

export interface PlayerMovement {
  id: string;
  position: Position;
}

// Socket.IO event types
export interface SocketEvents {
  // Player events
  'player:join': { username: string; position: Position };
  'player:joined': Player;
  'player:left': { id: string };
  'player:move': Position;
  'player:moved': PlayerMovement;
  
  // Game events
  'game:state': { players: Player[] };
  
  // Chat events
  'chat:send': { message: string };
  'chat:message': ChatMessage;
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PlayerStats {
  totalPlayers: number;
  activeSessions: number;
} 