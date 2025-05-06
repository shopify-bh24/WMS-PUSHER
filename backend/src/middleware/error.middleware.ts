import { Request, Response, NextFunction } from 'express';
import { AppError, handleError } from '../utils/error.util.js';
import config from '../config/config.js';

export const errorHandler = (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    const error = handleError(err);

    // Log error details in development
    if (config.NODE_ENV === 'development') {
        console.error('Error details:', {
            stack: err.stack,
            ...error
        });
    }

    res.status(error.statusCode).json({
        success: false,
        message: error.message,
        ...(config.NODE_ENV === 'development' && { stack: err.stack })
    });
};

export const notFoundHandler = (
    _req: Request,
    _res: Response,
    next: NextFunction
): void => {
    next(new AppError(404, 'Route not found'));
};

export const asyncHandler = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}; 