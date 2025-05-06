import express, { Request, Response } from 'express';
import { asyncHandler } from '../middleware/error.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Register new user
router.post('/register', asyncHandler(async (req: Request, res: Response) => {
    res.status(201).json({ message: 'User registered successfully' });
}));

// Login user
router.post('/login', asyncHandler(async (req: Request, res: Response) => {
    res.json({ message: 'Login successful' });
}));

// Get current user
router.get('/me', authenticate, asyncHandler(async (req: Request, res: Response) => {
    res.json({ message: 'Current user retrieved' });
}));

// Logout user
router.post('/logout', authenticate, asyncHandler(async (req: Request, res: Response) => {
    res.json({ message: 'Logged out successfully' });
}));

export default router; 