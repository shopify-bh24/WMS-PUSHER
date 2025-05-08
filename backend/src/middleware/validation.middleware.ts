import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../utils/error.util.js';
import { validateRequiredFields, validateEmail, validatePassword } from '../utils/validation.util.js';
import { ILoginRequest, IRegisterRequest } from '../interfaces/user.interface.js';

export const validateLogin = (
    req: Request<{}, {}, ILoginRequest>,
    _res: Response,
    next: NextFunction
): void => {
    try {
        const { password } = req.body;

        validateRequiredFields(req.body, ['username', 'password']);

        if (!validatePassword(password)) {
            throw new ValidationError(
                'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number'
            );
        }

        next();
    } catch (error) {
        next(error);
    }
};

export const validateRegister = (
    req: Request<{}, {}, IRegisterRequest>,
    _res: Response,
    next: NextFunction
): void => {
    try {
        const { username, password } = req.body;

        validateRequiredFields(req.body, ['username', 'password']);

        if (!validatePassword(password)) {
            throw new ValidationError(
                'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number'
            );
        }

        // if (email && !validateEmail(email)) {
        //     throw new ValidationError('Invalid email format');
        // }

        next();
    } catch (error) {
        next(error);
    }
};

export const validateOrderSync = (
    req: Request,
    _res: Response,
    next: NextFunction
): void => {
    try {
        const { orderId, orderData } = req.body;

        validateRequiredFields(req.body, ['orderId', 'orderData']);

        if (typeof orderId !== 'string') {
            throw new ValidationError('orderId must be a string');
        }

        if (typeof orderData !== 'object' || orderData === null) {
            throw new ValidationError('orderData must be an object');
        }

        next();
    } catch (error) {
        next(error);
    }
}; 