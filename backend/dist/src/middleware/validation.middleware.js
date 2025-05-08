import { ValidationError } from '../utils/error.util.js';
import { validateRequiredFields, validatePassword } from '../utils/validation.util.js';
export const validateLogin = (req, _res, next) => {
    try {
        const { password } = req.body;
        validateRequiredFields(req.body, ['username', 'password']);
        if (!validatePassword(password)) {
            throw new ValidationError('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number');
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
export const validateRegister = (req, _res, next) => {
    try {
        const { username, password } = req.body;
        validateRequiredFields(req.body, ['username', 'password']);
        if (!validatePassword(password)) {
            throw new ValidationError('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number');
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
export const validateOrderSync = (req, _res, next) => {
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
    }
    catch (error) {
        next(error);
    }
};
//# sourceMappingURL=validation.middleware.js.map