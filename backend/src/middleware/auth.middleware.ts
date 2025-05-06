import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticationError, AuthorizationError } from '../utils/error.util.js';
import env from '../config/environment.js';
import { UserRole } from '../interfaces/user.interface.js';

interface JwtPayload {
  id: string;
  username: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new AuthenticationError('No token provided');
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
      req.user = decoded;
      next();
    } catch (error) {
      throw new AuthenticationError('Invalid token');
    }
  } catch (error) {
    next(error);
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AuthenticationError('User not authenticated');
    }

    if (!roles.includes(req.user.role)) {
      throw new AuthorizationError('Insufficient permissions');
    }

    next();
  };
}; 