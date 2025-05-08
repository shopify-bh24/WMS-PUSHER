import { Request, Response, NextFunction } from 'express';
export declare const errorHandler: (err: Error, _req: Request, res: Response, _next: NextFunction) => void;
export declare const notFoundHandler: (_req: Request, _res: Response, next: NextFunction) => void;
export declare const asyncHandler: (fn: Function) => (req: Request, res: Response, next: NextFunction) => void;
