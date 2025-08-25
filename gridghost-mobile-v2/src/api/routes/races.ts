import { Router } from 'express';
import { cosmosService, io } from '../server';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Create a new race
router.post('/', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const raceData = {
      ...req.body,
      userId,
      status: 'pending',
      participants: [userId],
      startTime: null,
      endTime: null,
      results: []
    };

    const race = await cosmosService.createRace(raceData);
    
    // Broadcast to nearby users about new race
    io.emit('new-race-available', {
      raceId: race.id,
      location: race.startLocation,
      type: race.type
    });

    res.status(201).json({
      message: 'Race created successfully',
      race
    });

  } catch (error) {
    console.error('Create race error:', error);
    res.status(500).json({
      error: 'Failed to create race'
    });
  }
});

// Get user's races
router.get('/my-races', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const { limit = 50 } = req.query;

    const races = await cosmosService.getUserRaces(userId, Number(limit));

    res.json({
      races,
      total: races.length
    });

  } catch (error) {
    console.error('Get races error:', error);
    res.status(500).json({
      error: 'Failed to get races'
    });
  }
});

// Get live/nearby races
router.get('/nearby', authMiddleware, async (req, res) => {
  try {
    const { latitude, longitude, radius = 10 } = req.query;

    const races = await cosmosService.getLiveRaces(
      Number(radius),
      latitude ? Number(latitude) : undefined,
      longitude ? Number(longitude) : undefined
    );

    res.json({
      races,
      total: races.length
    });

  } catch (error) {
    console.error('Get nearby races error:', error);
    res.status(500).json({
      error: 'Failed to get nearby races'
    });
  }
});

// Get race by ID
router.get('/:raceId', authMiddleware, async (req, res) => {
  try {
    const { raceId } = req.params;
    const userId = (req as any).user.userId;

    const race = await cosmosService.getRaceById(raceId, userId);
    
    if (!race) {
      return res.status(404).json({
        error: 'Race not found'
      });
    }

    res.json({
      race
    });

  } catch (error) {
    console.error('Get race error:', error);
    res.status(500).json({
      error: 'Failed to get race'
    });
  }
});

// Join a race
router.post('/:raceId/join', authMiddleware, async (req, res) => {
  try {
    const { raceId } = req.params;
    const userId = (req as any).user.userId;

    const race = await cosmosService.getRaceById(raceId, userId);
    
    if (!race) {
      return res.status(404).json({
        error: 'Race not found'
      });
    }

    if (race.status !== 'pending') {
      return res.status(400).json({
        error: 'Cannot join race that has already started'
      });
    }

    if (race.participants.includes(userId)) {
      return res.status(400).json({
        error: 'Already joined this race'
      });
    }

    // Add user to participants
    const updatedRace = await cosmosService.updateRace(raceId, race.userId, {
      ...race,
      participants: [...race.participants, userId]
    });

    // Notify other participants
    io.to(`race-${raceId}`).emit('user-joined', {
      userId,
      participantCount: updatedRace.participants.length
    });

    res.json({
      message: 'Successfully joined race',
      race: updatedRace
    });

  } catch (error) {
    console.error('Join race error:', error);
    res.status(500).json({
      error: 'Failed to join race'
    });
  }
});

// Start a race
router.post('/:raceId/start', authMiddleware, async (req, res) => {
  try {
    const { raceId } = req.params;
    const userId = (req as any).user.userId;

    const race = await cosmosService.getRaceById(raceId, userId);
    
    if (!race) {
      return res.status(404).json({
        error: 'Race not found'
      });
    }

    if (race.userId !== userId) {
      return res.status(403).json({
        error: 'Only race creator can start the race'
      });
    }

    if (race.status !== 'pending') {
      return res.status(400).json({
        error: 'Race has already started or finished'
      });
    }

    const updatedRace = await cosmosService.updateRace(raceId, userId, {
      ...race,
      status: 'active',
      startTime: new Date().toISOString()
    });

    // Notify all participants that race has started
    io.to(`race-${raceId}`).emit('race-started', {
      raceId,
      startTime: updatedRace.startTime
    });

    res.json({
      message: 'Race started successfully',
      race: updatedRace
    });

  } catch (error) {
    console.error('Start race error:', error);
    res.status(500).json({
      error: 'Failed to start race'
    });
  }
});

// Update race position (during race)
router.post('/:raceId/position', authMiddleware, async (req, res) => {
  try {
    const { raceId } = req.params;
    const userId = (req as any).user.userId;
    const { latitude, longitude, speed, timestamp } = req.body;

    // Broadcast real-time position to other participants
    io.to(`race-${raceId}`).emit('position-update', {
      userId,
      latitude,
      longitude,
      speed,
      timestamp: timestamp || new Date().toISOString()
    });

    res.json({
      message: 'Position updated'
    });

  } catch (error) {
    console.error('Update position error:', error);
    res.status(500).json({
      error: 'Failed to update position'
    });
  }
});

// Finish a race
router.post('/:raceId/finish', authMiddleware, async (req, res) => {
  try {
    const { raceId } = req.params;
    const userId = (req as any).user.userId;
    const { route, stats } = req.body;

    const race = await cosmosService.getRaceById(raceId, userId);
    
    if (!race) {
      return res.status(404).json({
        error: 'Race not found'
      });
    }

    // Update race results
    const results = race.results || [];
    const existingResultIndex = results.findIndex((r: any) => r.userId === userId);
    
    const result = {
      userId,
      finishTime: new Date().toISOString(),
      route,
      stats,
      position: results.length + 1
    };

    if (existingResultIndex >= 0) {
      results[existingResultIndex] = result;
    } else {
      results.push(result);
    }

    const updatedRace = await cosmosService.updateRace(raceId, race.userId, {
      ...race,
      results
    });

    // Notify other participants
    io.to(`race-${raceId}`).emit('user-finished', {
      userId,
      position: result.position,
      stats
    });

    res.json({
      message: 'Race completed successfully',
      result,
      race: updatedRace
    });

  } catch (error) {
    console.error('Finish race error:', error);
    res.status(500).json({
      error: 'Failed to finish race'
    });
  }
});

export default router;