import express from 'express';
import { asyncHandler } from '../middleware/error.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { getOrders, getOrderById, syncOrders, updateOrder } from '../controllers/order.controller.js';
const router = express.Router();
router.get('/', authenticate, getOrders);
router.get('/:id', authenticate, getOrderById);
router.post('/', authenticate, asyncHandler(async (req, res) => {
    const orderData = req.body;
    res.status(201).json({ message: 'Order created', data: orderData });
}));
router.put('/:id', asyncHandler(updateOrder));
router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
    const { id } = req.params;
    res.json({ message: `Delete order ${id}` });
}));
router.post('/sync', syncOrders);
router.get('/:id/status', authenticate, asyncHandler(async (req, res) => {
    const { id } = req.params;
    res.json({ message: `Get status for order ${id}` });
}));
router.put('/:id/status', authenticate, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    res.json({ message: `Update status for order ${id}`, status });
}));
export default router;
//# sourceMappingURL=order.routes.js.map