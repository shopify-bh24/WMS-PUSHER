import express, { Request, Response } from 'express';
import { asyncHandler } from '../middleware/error.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { AppError } from '../utils/error.util.js';
import { getOrders, getOrderById, syncOrders, updateOrder } from '../controllers/order.controller.js';
import { Order } from '../models/order.model.js';
// import { shopifyOrderWebhook, getNotifications } from '../controllers/webhook.controller.js';

const router = express.Router();

// Get all orders
router.get('/', authenticate, getOrders);

// Get order by ID
router.get('/:id', authenticate, getOrderById);

// Create new order
router.post('/', authenticate, asyncHandler(async (req: Request, res: Response) => {
    const orderData = req.body;
    res.status(201).json({ message: 'Order created', data: orderData });
}));

router.put('/:id', asyncHandler(updateOrder));

router.delete('/:id', authenticate, asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    res.json({ message: `Delete order ${id}` });
}));

// Sync orders from Shopify
router.post('/sync', syncOrders);

// Get order status
router.get('/:id/status', authenticate, asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    res.json({ message: `Get status for order ${id}` });
}));

// Update order status
router.put('/:id/status', authenticate, asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    res.json({ message: `Update status for order ${id}`, status });
}));

export default router; 