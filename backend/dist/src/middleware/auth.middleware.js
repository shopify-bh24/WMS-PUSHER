import jwt from 'jsonwebtoken';
import { AuthenticationError, AuthorizationError } from '../utils/error.util.js';
import env from '../config/environment.js';
export const authenticate = async (req, _res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            throw new AuthenticationError('No token provided');
        }
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, env.JWT_SECRET);
            req.user = decoded;
            next();
        }
        catch (error) {
            throw new AuthenticationError('Invalid token');
        }
    }
    catch (error) {
        next(error);
    }
};
export const authorize = (...roles) => {
    return (req, _res, next) => {
        if (!req.user) {
            throw new AuthenticationError('User not authenticated');
        }
        if (!roles.includes(req.user.role)) {
            throw new AuthorizationError('Insufficient permissions');
        }
        next();
    };
};
//# sourceMappingURL=auth.middleware.js.map