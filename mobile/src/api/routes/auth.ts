import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cosmosService } from '../server';

const router = Router();

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { email, password, username, firstName, lastName } = req.body;

    // Validate required fields
    if (!email || !password || !username) {
      return res.status(400).json({
        error: 'Email, password, and username are required'
      });
    }

    // Check if user already exists
    const existingUser = await cosmosService.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        error: 'User with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const newUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email,
      password: hashedPassword,
      username,
      firstName: firstName || '',
      lastName: lastName || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
      profile: {
        totalRaces: 0,
        wins: 0,
        bestSpeed: 0,
        winRate: 0,
        totalDistance: 0,
        averageSpeed: 0
      },
      settings: {
        notifications: true,
        privacy: 'public',
        units: 'metric'
      }
    };

    const user = await cosmosService.createUser(newUser);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    // Return user without password
    const { password: _, ...userResponse } = user;

    res.status(201).json({
      message: 'User created successfully',
      user: userResponse,
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Failed to create user'
    });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    // Find user by email
    const user = await cosmosService.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    // Return user without password
    const { password: _, ...userResponse } = user;

    res.json({
      message: 'Login successful',
      user: userResponse,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed'
    });
  }
});

// Verify token endpoint
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        error: 'Access token required'
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'fallback-secret'
    ) as any;

    const user = await cosmosService.getUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        error: 'User not found'
      });
    }

    // Return user without password
    const { password: _, ...userResponse } = user;

    res.json({
      valid: true,
      user: userResponse
    });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({
      error: 'Invalid token'
    });
  }
});

export default router;