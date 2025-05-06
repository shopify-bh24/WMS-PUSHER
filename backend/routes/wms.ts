import express, { RequestHandler } from 'express';
import wmsService from '../services/wmsService.js';

const router = express.Router();

interface OrderSyncRequest {
    orderId: string;
    orderData: any;
}

interface CustomerUpdateRequest {
    customerData: any;
}

interface InventoryUpdateRequest {
    sku: string;
    quantity: number;
}

// Connect to WMS
router.post('/connect', (async (_req, res) => {
    try {
        const result = await wmsService.connect();
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
}) as RequestHandler);

// Sync order with WMS
router.post('/orders/sync', (async (req, res) => {
    try {
        const { orderId, orderData } = req.body as OrderSyncRequest;

        if (!orderId || !orderData) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: orderId and orderData'
            });
        }

        const result = await wmsService.syncOrder(orderId, orderData);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
}) as RequestHandler);

// Get order status from WMS
router.get('/orders/:id/status', (async (req, res) => {
    try {
        const { id } = req.params;
        const result = await wmsService.getOrderStatus(id);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
}) as RequestHandler);

// Update customer data
router.put('/orders/:id/customer', (async (req, res) => {
    try {
        const { id } = req.params;
        const { customerData } = req.body as CustomerUpdateRequest;

        if (!customerData) {
            return res.status(400).json({
                success: false,
                message: 'Missing required field: customerData'
            });
        }

        const result = await wmsService.updateCustomer(id, customerData);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
}) as RequestHandler);

// Update inventory
router.post('/inventory/sync', (async (req, res) => {
    try {
        const { sku, quantity } = req.body as InventoryUpdateRequest;

        if (!sku || quantity === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: sku and quantity'
            });
        }

        const result = await wmsService.updateInventory(sku, quantity);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
}) as RequestHandler);

export default router; 