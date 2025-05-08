export class AppError extends Error {
    statusCode;
    message;
    isOperational;
    constructor(statusCode, message, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.isOperational = isOperational;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
export class ValidationError extends AppError {
    constructor(message) {
        super(400, message);
    }
}
export class AuthenticationError extends AppError {
    constructor(message = 'Authentication failed') {
        super(401, message);
    }
}
export class AuthorizationError extends AppError {
    constructor(message = 'Not authorized') {
        super(403, message);
    }
}
export class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(404, message);
    }
}
export class ConflictError extends AppError {
    constructor(message = 'Resource already exists') {
        super(409, message);
    }
}
export const handleError = (error) => {
    if (error instanceof AppError) {
        return {
            statusCode: error.statusCode,
            message: error.message,
            isOperational: error.isOperational
        };
    }
    console.error('Unhandled error:', error);
    return {
        statusCode: 500,
        message: 'Internal server error',
        isOperational: false
    };
};
//# sourceMappingURL=error.util.js.map