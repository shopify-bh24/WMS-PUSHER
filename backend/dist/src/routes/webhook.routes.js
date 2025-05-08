import { Router } from 'express';
import { WebhookController } from '../controllers/webhook.controller';
const router = Router();
router.post('/webhook/orders', async (req, res) => {
    await WebhookController.handleOrderWebhook(req, res);
});
export default router;
//# sourceMappingURL=webhook.routes.js.map