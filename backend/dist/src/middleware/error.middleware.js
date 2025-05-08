import { AppError, handleError } from '../utils/error.util.js';
import config from '../config/config.js';
export const errorHandler = (err, _req, res, _next) => {
    const error = handleError(err);
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
export const notFoundHandler = (_req, _res, next) => {
    next(new AppError(404, 'Route not found'));
};
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
//# sourceMappingURL=error.middleware.js.map