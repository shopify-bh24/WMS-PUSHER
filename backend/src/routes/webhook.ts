// src/routes/webhooks.ts
import express from 'express';
import type { Request, Response } from 'express';
import crypto from 'crypto';
import Notification from '../models/Notification';

const router = express.Router();
const SHOPIFY_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET || '';

// SSE connections store
const clients = new Map();

// Verify Shopify webhook
function verifyShopifyWebhook(req: Request): boolean {
    const hmacHeader = req.header('X-Shopify-Hmac-Sha256');
    console.log("Received Shopify HMAC Header:", hmacHeader);

    if (!hmacHeader) {
        console.log("No HMAC header received from Shopify.");
        return false;
    }

    const body = req.rawBody || '';
    console.log("--- START Raw body received by backend ---");
    console.log(body);
    console.log("--- END Raw body received by backend ---");

    const hash = crypto
        .createHmac('sha256', SHOPIFY_SECRET)
        .update(body)
        .digest('base64');
    console.log("Calculated HMAC by backend:", hash);

    const signatureMatch = hash === hmacHeader;
    console.log("Signature match status:", signatureMatch);

    return signatureMatch;
}

// Process webhook based on topic
async function processWebhook(topic: string, data: any): Promise<any | null> {
    // Only process specific webhook topics
    if (!topic.startsWith('orders/') && !topic.startsWith('customers/')) {
        console.log(`Ignoring webhook topic: ${topic}`);
        return null; // Skip processing for other topics
    }

    let content = data;

    // Transform data based on topic
    switch (topic) {
        case 'orders/create':
        case 'orders/updated':
        case 'orders/fulfilled':
        case 'orders/paid':
            content = {
                orderId: data.id,
                orderNumber: data.order_number,
                total: data.total_price,
                status: data.financial_status,
                fulfillmentStatus: data.fulfillment_status,
                updatedAt: data.updated_at,
                lineItems: data.line_items
            };
            break;

        case 'customers/create':
        case 'customers/update':
            content = {
                customerId: data.id,
                email: data.email,
                name: `${data.first_name} ${data.last_name}`,
                updatedAt: data.updated_at
            };
            break;

        default:
            return null;
    }

    // Create notification in DB with the filtered data
    const notification = new Notification({
        source: 'shopify',
        topic,
        content,
        createdAt: new Date(),
        isRead: false
    });

    await notification.save();
    return notification;
}

// Main webhook endpoint
router.post('/shopify', async (req: any, res: any) => {
    try {
        // Verify webhook authenticity
        if (!verifyShopifyWebhook(req)) {
            console.error('Invalid webhook signature');
            return res.status(401).send('Invalid webhook signature');
        }

        const topic = req.header('X-Shopify-Topic') || '';

        const notification = await processWebhook(topic, req.body);

        if (notification) {
            console.log(`Processing relevant webhook: ${topic}`);
            broadcastNotification(notification);
        }

        return res.status(200).send('OK');
    } catch (error) {
        console.error('Webhook processing error:', error);
        return res.status(200).send('Processed with errors');
    }
});

router.get('/', async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const notifications = await Notification.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Notification.countDocuments();

        res.json({
            notifications,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// Mark as read
router.patch('/:id', async (req: Request, res: Response) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
        res.status(200).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to update notification' });
    }
});

// SSE endpoint for real-time notifications
router.get('/stream', (req: Request, res: Response) => {
    const clientId = req.user?.id || Date.now().toString();

    // Set headers for SSE
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });

    // Send initial connection message
    res.write(`data: ${JSON.stringify({ connected: true })}\n\n`);

    // Store connection
    clients.set(clientId, res);

    // Handle client disconnect
    req.on('close', () => {
        clients.delete(clientId);
    });
});

// Broadcast to all connected clients
function broadcastNotification(notification: any) {
    clients.forEach((client) => {
        client.write(`data: ${JSON.stringify(notification)}\n\n`);
    });
}

export default router;