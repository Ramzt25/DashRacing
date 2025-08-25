import { Router } from 'express';
import { cosmosService } from '../server';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const user = await cosmosService.getUserById(userId);
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Return user without password
    const { password: _, ...userResponse } = user;
    
    res.json({
      user: userResponse
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Failed to get user profile'
    });
  }
});

// Update user profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const updates = req.body;

    // Don't allow updating sensitive fields
    delete updates.id;
    delete updates.email;
    delete updates.password;
    delete updates.createdAt;

    const updatedUser = await cosmosService.updateUser(userId, updates);
    
    // Return user without password
    const { password: _, ...userResponse } = updatedUser;
    
    res.json({
      message: 'Profile updated successfully',
      user: userResponse
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Failed to update profile'
    });
  }
});

// Get user racing statistics
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    
    // Get user races to calculate stats
    const races = await cosmosService.getUserRaces(userId);
    
    const stats = {
      totalRaces: races.length,
      wins: races.filter(race => race.status === 'completed' && race.position === 1).length,
      totalDistance: races.reduce((sum, race) => sum + (race.distance || 0), 0),
      bestSpeed: Math.max(...races.map(race => race.maxSpeed || 0), 0),
      averageSpeed: races.length > 0 
        ? races.reduce((sum, race) => sum + (race.averageSpeed || 0), 0) / races.length 
        : 0,
      winRate: races.length > 0 
        ? (races.filter(race => race.status === 'completed' && race.position === 1).length / races.length) * 100 
        : 0,
      recentRaces: races.slice(0, 10) // Last 10 races
    };

    res.json({
      stats
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      error: 'Failed to get user statistics'
    });
  }
});

// Search users
router.get('/search', authMiddleware, async (req, res) => {
  try {
    const { query, limit = 20 } = req.query;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        error: 'Search query is required'
      });
    }

    // This is a simple implementation - in production, use proper search indexing
    // For now, we'll just search by username (this would need to be optimized)
    // TODO: Implement user search logic with cosmosService
    const users: any[] = []; // Placeholder - implement search logic
    
    res.json({
      users,
      total: users.length
    });

  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      error: 'Failed to search users'
    });
  }
});

export default router;