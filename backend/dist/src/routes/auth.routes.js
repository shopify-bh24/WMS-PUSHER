import express from 'express';
import { asyncHandler } from '../middleware/error.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { register, login, getCurrentUser, logout } from '../controllers/auth.controller';
const router = express.Router();
router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.get('/me', authenticate, asyncHandler(getCurrentUser));
router.post('/logout', authenticate, asyncHandler(logout));
export default router;
//# sourceMappingURL=auth.routes.js.map