import express from 'express';
import { asyncHandler } from '../middleware/error.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { register, login, getCurrentUser, logout } from '../controllers/auth.controller';

const router = express.Router();

// Register new user
router.post('/register', asyncHandler(register));

// Login user
router.post('/login', asyncHandler(login));

// Get current user
router.get('/me', authenticate, asyncHandler(getCurrentUser));

// Logout user
router.post('/logout', authenticate, asyncHandler(logout));

export default router; 