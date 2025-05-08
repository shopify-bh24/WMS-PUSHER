import express from 'express';
import { asyncHandler } from '../middleware/error.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
const router = express.Router();
router.post('/connect', authenticate, asyncHandler(async (req, res) => {
    res.json({ message: 'WMS connected successfully' });
}));
router.post('/sync', authenticate, asyncHandler(async (req, res) => {
    res.json({ message: 'Orders synced with WMS' });
}));
router.get('/status', authenticate, asyncHandler(async (req, res) => {
    res.json({ message: 'WMS status retrieved' });
}));
export default router;
//# sourceMappingURL=wms.routes.js.map