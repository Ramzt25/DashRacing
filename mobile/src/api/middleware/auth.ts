import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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

    req.user = {
      userId: decoded.userId,
      email: decoded.email
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      error: 'Invalid or expired token'
    });
  }
};