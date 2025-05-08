import { Request, Response } from 'express';
export declare const saveOrders: (orders: any[]) => Promise<((import("mongoose").Document<unknown, {}, import("../models/order.model.js").IOrder, {}> & import("../models/order.model.js").IOrder & Required<{
    _id: unknown;
}> & {
    __v: number;
}) | null)[]>;
export declare const getOrders: (req: Request, res: Response) => Promise<void>;
export declare const getOrderById: (req: Request, res: Response) => Promise<void>;
export declare const syncOrders: (req: Request, res: Response) => Promise<void>;
export declare const updateOrder: (req: Request, res: Response) => Promise<void>;
