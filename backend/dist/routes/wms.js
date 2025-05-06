import express from 'express';
import wmsService from '../services/wmsService.js';
const router = express.Router();
// Connect to WMS
router.post('/connect', (async (_req, res) => {
    try {
        const result = await wmsService.connect();
        res.json(result);
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
}));
// Sync order with WMS
router.post('/orders/sync', (async (req, res) => {
    try {
        const { orderId, orderData } = req.body;
        if (!orderId || !orderData) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: orderId and orderData'
            });
        }
        const result = await wmsService.syncOrder(orderId, orderData);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
}));
// Get order status from WMS
router.get('/orders/:id/status', (async (req, res) => {
    try {
        const { id } = req.params;
        const result = await wmsService.getOrderStatus(id);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
}));
// Update customer data
router.put('/orders/:id/customer', (async (req, res) => {
    try {
        const { id } = req.params;
        const { customerData } = req.body;
        if (!customerData) {
            return res.status(400).json({
                success: false,
                message: 'Missing required field: customerData'
            });
        }
        const result = await wmsService.updateCustomer(id, customerData);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
}));
// Update inventory
router.post('/inventory/sync', (async (req, res) => {
    try {
        const { sku, quantity } = req.body;
        if (!sku || quantity === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: sku and quantity'
            });
        }
        const result = await wmsService.updateInventory(sku, quantity);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
}));
export default router;
