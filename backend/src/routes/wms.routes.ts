import express, { Request, Response } from 'express';
import { asyncHandler } from '../middleware/error.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Connect to WMS
router.post('/connect', authenticate, asyncHandler(async (req: Request, res: Response) => {
    res.json({ message: 'WMS connected successfully' });
}));

// Sync orders with WMS
router.post('/sync', authenticate, asyncHandler(async (req: Request, res: Response) => {
    res.json({ message: 'Orders synced with WMS' });
}));

// Get WMS status
router.get('/status', authenticate, asyncHandler(async (req: Request, res: Response) => {
    res.json({ message: 'WMS status retrieved' });
}));

export default router; 