import { Request, Response } from 'express';
export declare class WebhookController {
    static handleOrderWebhook(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    private static processOrderUpdate;
    private static processOrderCancellation;
}
