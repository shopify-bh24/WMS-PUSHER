import { Order } from '../models/order.model';
import crypto from 'crypto';
export class WebhookController {
    static async handleOrderWebhook(req, res) {
        try {
            const hmac = req.headers['x-shopify-hmac-sha256'];
            const topic = req.headers['x-shopify-topic'];
            const shop = req.headers['x-shopify-shop-domain'];
            if (!hmac || !topic || !shop) {
                return res.status(401).json({ error: 'Missing required headers' });
            }
            const rawBody = JSON.stringify(req.body);
            const hash = crypto
                .createHmac('sha256', process.env.SHOPIFY_WEBHOOK_SECRET || '')
                .update(rawBody)
                .digest('base64');
            if (hash !== hmac) {
                return res.status(401).json({ error: 'Invalid webhook signature' });
            }
            switch (topic) {
                case 'orders/create':
                case 'orders/updated':
                    await this.processOrderUpdate(req.body);
                    break;
                case 'orders/cancelled':
                    await this.processOrderCancellation(req.body);
                    break;
                default:
                    return res.status(400).json({ error: 'Unsupported webhook topic' });
            }
            return res.status(200).json({ message: 'Webhook processed successfully' });
        }
        catch (error) {
            console.error('Webhook processing error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    static async processOrderUpdate(orderData) {
        try {
            await Order.findOneAndUpdate({ shopify_order_id: orderData.id.toString() }, {
                ...orderData,
                shopify_order_id: orderData.id.toString(),
                created_at: new Date(orderData.created_at),
                updated_at: new Date(orderData.updated_at),
                processed_at: new Date(orderData.processed_at),
                closed_at: orderData.closed_at ? new Date(orderData.closed_at) : null,
                cancelled_at: orderData.cancelled_at ? new Date(orderData.cancelled_at) : null,
            }, { upsert: true, new: true });
        }
        catch (error) {
            console.error('Error processing order update:', error);
            throw error;
        }
    }
    static async processOrderCancellation(orderData) {
        try {
            await Order.findOneAndUpdate({ shopify_order_id: orderData.id.toString() }, {
                cancelled_at: new Date(orderData.cancelled_at),
                financial_status: 'cancelled',
                updated_at: new Date(orderData.updated_at)
            });
        }
        catch (error) {
            console.error('Error processing order cancellation:', error);
            throw error;
        }
    }
}
//# sourceMappingURL=webhook.controller.js.map