import { Router } from 'express';
import { cosmosService } from '../server';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Create a new group
router.post('/', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const groupData = {
      ...req.body,
      createdBy: userId,
      members: [{ userId, role: 'admin', joinedAt: new Date().toISOString() }],
      isActive: true,
      stats: {
        totalMembers: 1,
        totalRaces: 0,
        totalEvents: 0
      }
    };

    const group = await cosmosService.createGroup(groupData);

    res.status(201).json({
      message: 'Group created successfully',
      group
    });

  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({
      error: 'Failed to create group'
    });
  }
});

// Get user's groups
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const groups = await cosmosService.getUserGroups(userId);

    res.json({
      groups,
      total: groups.length
    });

  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({
      error: 'Failed to get groups'
    });
  }
});

// Search public groups
router.get('/search', async (req, res) => {
  try {
    const { query, category, limit = 10 } = req.query;
    
    const groups = await cosmosService.searchGroups({
      query: query as string,
      category: category as string,
      limit: parseInt(limit as string)
    });

    res.json({
      groups,
      total: groups.length
    });

  } catch (error) {
    console.error('Search groups error:', error);
    res.status(500).json({
      error: 'Failed to search groups'
    });
  }
});

// Get group by ID
router.get('/:groupId', authMiddleware, async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = (req as any).user.userId;

    const group = await cosmosService.getGroupById(groupId);
    
    if (!group) {
      return res.status(404).json({
        error: 'Group not found'
      });
    }

    // Check if user is a member or if group is public
    const isMember = group.members?.some((member: any) => member.userId === userId);
    const isPublic = group.privacy === 'public';

    if (!isMember && !isPublic) {
      return res.status(403).json({
        error: 'Access denied'
      });
    }

    res.json({
      group,
      isMember
    });

  } catch (error) {
    console.error('Get group error:', error);
    res.status(500).json({
      error: 'Failed to get group'
    });
  }
});

// Join a group
router.post('/:groupId/join', authMiddleware, async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = (req as any).user.userId;

    const group = await cosmosService.getGroupById(groupId);
    
    if (!group) {
      return res.status(404).json({
        error: 'Group not found'
      });
    }

    // Check if already a member
    const isMember = group.members?.some((member: any) => member.userId === userId);
    if (isMember) {
      return res.status(400).json({
        error: 'Already a member of this group'
      });
    }

    // Add member
    const newMember = {
      userId,
      role: 'member' as const,
      joinedAt: new Date().toISOString()
    };

    const members = [...(group.members || []), newMember];
    const updatedGroup = await cosmosService.updateGroup(groupId, {
      ...group,
      members,
      stats: {
        ...group.stats,
        totalMembers: members.length
      }
    });

    res.json({
      message: 'Successfully joined group',
      group: updatedGroup
    });

  } catch (error) {
    console.error('Join group error:', error);
    res.status(500).json({
      error: 'Failed to join group'
    });
  }
});

// Leave a group
router.post('/:groupId/leave', authMiddleware, async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = (req as any).user.userId;

    const group = await cosmosService.getGroupById(groupId);
    
    if (!group) {
      return res.status(404).json({
        error: 'Group not found'
      });
    }

    const member = group.members?.find((m: any) => m.userId === userId);
    if (!member) {
      return res.status(400).json({
        error: 'Not a member of this group'
      });
    }

    // Can't leave if you're the only admin
    const admins = group.members?.filter((m: any) => m.role === 'admin') || [];
    if (member.role === 'admin' && admins.length === 1) {
      return res.status(400).json({
        error: 'Cannot leave group as the only admin'
      });
    }

    // Remove member
    const members = group.members?.filter((m: any) => m.userId !== userId) || [];
    const updatedGroup = await cosmosService.updateGroup(groupId, {
      ...group,
      members,
      stats: {
        ...group.stats,
        totalMembers: members.length
      }
    });

    res.json({
      message: 'Successfully left group',
      group: updatedGroup
    });

  } catch (error) {
    console.error('Leave group error:', error);
    res.status(500).json({
      error: 'Failed to leave group'
    });
  }
});

// Update group settings (admin only)
router.put('/:groupId', authMiddleware, async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = (req as any).user.userId;
    const updates = req.body;

    const group = await cosmosService.getGroupById(groupId);
    
    if (!group) {
      return res.status(404).json({
        error: 'Group not found'
      });
    }

    // Check if user is admin
    const member = group.members?.find((m: any) => m.userId === userId);
    if (!member || member.role !== 'admin') {
      return res.status(403).json({
        error: 'Admin access required'
      });
    }

    // Don't allow updating sensitive fields
    delete updates.id;
    delete updates.createdBy;
    delete updates.members;
    delete updates.createdAt;

    const updatedGroup = await cosmosService.updateGroup(groupId, {
      ...group,
      ...updates
    });

    res.json({
      message: 'Group updated successfully',
      group: updatedGroup
    });

  } catch (error) {
    console.error('Update group error:', error);
    res.status(500).json({
      error: 'Failed to update group'
    });
  }
});

// Get group events
router.get('/:groupId/events', authMiddleware, async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = (req as any).user.userId;

    const group = await cosmosService.getGroupById(groupId);
    
    if (!group) {
      return res.status(404).json({
        error: 'Group not found'
      });
    }

    // Check if user is a member
    const isMember = group.members?.some((member: any) => member.userId === userId);
    if (!isMember) {
      return res.status(403).json({
        error: 'Member access required'
      });
    }

    const events = await cosmosService.getGroupEvents(groupId);

    res.json({
      events,
      total: events.length
    });

  } catch (error) {
    console.error('Get group events error:', error);
    res.status(500).json({
      error: 'Failed to get group events'
    });
  }
});

// Create group event (admin only)
router.post('/:groupId/events', authMiddleware, async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = (req as any).user.userId;
    const eventData = req.body;

    const group = await cosmosService.getGroupById(groupId);
    
    if (!group) {
      return res.status(404).json({
        error: 'Group not found'
      });
    }

    // Check if user is admin
    const member = group.members?.find((m: any) => m.userId === userId);
    if (!member || member.role !== 'admin') {
      return res.status(403).json({
        error: 'Admin access required'
      });
    }

    const event = await cosmosService.createGroupEvent({
      ...eventData,
      groupId,
      createdBy: userId,
      participants: [],
      status: 'upcoming'
    });

    res.status(201).json({
      message: 'Event created successfully',
      event
    });

  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({
      error: 'Failed to create event'
    });
  }
});

export default router;