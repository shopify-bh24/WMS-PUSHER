import { Router, Request, Response } from 'express';
import { WebhookController } from '../controllers/webhook.controller';

const router = Router();

router.post('/webhook/orders', async (req: Request, res: Response) => {
    await WebhookController.handleOrderWebhook(req, res);
});

export default router;