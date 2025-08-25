import { Router } from 'express';
import { cosmosService } from '../server';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Get user's vehicles
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const vehicles = await cosmosService.getUserVehicles(userId);

    res.json({
      vehicles,
      total: vehicles.length
    });

  } catch (error) {
    console.error('Get vehicles error:', error);
    res.status(500).json({
      error: 'Failed to get vehicles'
    });
  }
});

// Create a new vehicle
router.post('/', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const vehicleData = {
      ...req.body,
      userId,
      isActive: true,
      performance: {
        totalRaces: 0,
        wins: 0,
        bestSpeed: 0,
        averageSpeed: 0,
        totalDistance: 0
      },
      modifications: []
    };

    const vehicle = await cosmosService.createVehicle(vehicleData);

    res.status(201).json({
      message: 'Vehicle created successfully',
      vehicle
    });

  } catch (error) {
    console.error('Create vehicle error:', error);
    res.status(500).json({
      error: 'Failed to create vehicle'
    });
  }
});

// Get vehicle by ID
router.get('/:vehicleId', authMiddleware, async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const userId = (req as any).user.userId;

    const vehicle = await cosmosService.getVehicleById(vehicleId, userId);
    
    if (!vehicle) {
      return res.status(404).json({
        error: 'Vehicle not found'
      });
    }

    res.json({
      vehicle
    });

  } catch (error) {
    console.error('Get vehicle error:', error);
    res.status(500).json({
      error: 'Failed to get vehicle'
    });
  }
});

// Update vehicle
router.put('/:vehicleId', authMiddleware, async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const userId = (req as any).user.userId;
    const updates = req.body;

    // Don't allow updating sensitive fields
    delete updates.id;
    delete updates.userId;
    delete updates.createdAt;

    const vehicle = await cosmosService.getVehicleById(vehicleId, userId);
    
    if (!vehicle) {
      return res.status(404).json({
        error: 'Vehicle not found'
      });
    }

    const updatedVehicle = await cosmosService.updateVehicle(vehicleId, userId, {
      ...vehicle,
      ...updates
    });

    res.json({
      message: 'Vehicle updated successfully',
      vehicle: updatedVehicle
    });

  } catch (error) {
    console.error('Update vehicle error:', error);
    res.status(500).json({
      error: 'Failed to update vehicle'
    });
  }
});

// Delete vehicle
router.delete('/:vehicleId', authMiddleware, async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const userId = (req as any).user.userId;

    const vehicle = await cosmosService.getVehicleById(vehicleId, userId);
    
    if (!vehicle) {
      return res.status(404).json({
        error: 'Vehicle not found'
      });
    }

    await cosmosService.deleteVehicle(vehicleId, userId);

    res.json({
      message: 'Vehicle deleted successfully'
    });

  } catch (error) {
    console.error('Delete vehicle error:', error);
    res.status(500).json({
      error: 'Failed to delete vehicle'
    });
  }
});

// Add modification to vehicle
router.post('/:vehicleId/modifications', authMiddleware, async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const userId = (req as any).user.userId;
    const modification = req.body;

    const vehicle = await cosmosService.getVehicleById(vehicleId, userId);
    
    if (!vehicle) {
      return res.status(404).json({
        error: 'Vehicle not found'
      });
    }

    const newModification = {
      id: `mod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...modification,
      dateInstalled: new Date().toISOString()
    };

    const modifications = vehicle.modifications || [];
    modifications.push(newModification);

    const updatedVehicle = await cosmosService.updateVehicle(vehicleId, userId, {
      ...vehicle,
      modifications
    });

    res.status(201).json({
      message: 'Modification added successfully',
      modification: newModification,
      vehicle: updatedVehicle
    });

  } catch (error) {
    console.error('Add modification error:', error);
    res.status(500).json({
      error: 'Failed to add modification'
    });
  }
});

// Update vehicle performance after race
router.post('/:vehicleId/performance', authMiddleware, async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const userId = (req as any).user.userId;
    const { raceStats } = req.body;

    const vehicle = await cosmosService.getVehicleById(vehicleId, userId);
    
    if (!vehicle) {
      return res.status(404).json({
        error: 'Vehicle not found'
      });
    }

    const currentPerf = vehicle.performance || {
      totalRaces: 0,
      wins: 0,
      bestSpeed: 0,
      averageSpeed: 0,
      totalDistance: 0
    };

    const updatedPerformance = {
      totalRaces: currentPerf.totalRaces + 1,
      wins: currentPerf.wins + (raceStats.position === 1 ? 1 : 0),
      bestSpeed: Math.max(currentPerf.bestSpeed, raceStats.maxSpeed || 0),
      totalDistance: currentPerf.totalDistance + (raceStats.distance || 0),
      averageSpeed: ((currentPerf.averageSpeed * currentPerf.totalRaces) + (raceStats.averageSpeed || 0)) / (currentPerf.totalRaces + 1)
    };

    const updatedVehicle = await cosmosService.updateVehicle(vehicleId, userId, {
      ...vehicle,
      performance: updatedPerformance
    });

    res.json({
      message: 'Vehicle performance updated',
      performance: updatedPerformance,
      vehicle: updatedVehicle
    });

  } catch (error) {
    console.error('Update performance error:', error);
    res.status(500).json({
      error: 'Failed to update vehicle performance'
    });
  }
});

export default router;