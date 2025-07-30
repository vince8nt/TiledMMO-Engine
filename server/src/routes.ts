import { Express } from 'express';
import { pool } from './database';

export function setupRoutes(app: Express) {
  // Player routes
  app.get('/api/players', async (req, res) => {
    try {
      const result = await pool.query('SELECT id, username, created_at, last_login FROM players');
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching players:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/players/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(
        'SELECT id, username, created_at, last_login FROM players WHERE id = $1',
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Player not found' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching player:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Player position routes
  app.get('/api/players/:id/position', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(
        'SELECT x, y, z, updated_at FROM player_positions WHERE player_id = $1 ORDER BY updated_at DESC LIMIT 1',
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Player position not found' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching player position:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/players/:id/position', async (req, res) => {
    try {
      const { id } = req.params;
      const { x, y, z } = req.body;
      
      if (typeof x !== 'number' || typeof y !== 'number' || typeof z !== 'number') {
        return res.status(400).json({ error: 'Invalid position data' });
      }
      
      await pool.query(
        'INSERT INTO player_positions (player_id, x, y, z) VALUES ($1, $2, $3, $4) ON CONFLICT (player_id) DO UPDATE SET x = $2, y = $3, z = $4, updated_at = NOW()',
        [id, x, y, z]
      );
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error updating player position:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Game statistics routes
  app.get('/api/stats', async (req, res) => {
    try {
      const playerCount = await pool.query('SELECT COUNT(*) as count FROM players');
      const activeSessions = await pool.query('SELECT COUNT(*) as count FROM game_sessions WHERE disconnected_at IS NULL');
      
      res.json({
        totalPlayers: parseInt(playerCount.rows[0].count),
        activeSessions: parseInt(activeSessions.rows[0].count)
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Health check route (already defined in index.ts, but keeping for consistency)
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });
} 