import dotenv from 'dotenv';
import { AppError } from '../utils/error.util.js';
dotenv.config();
const validateConfig = () => {
    const requiredEnvVars = [
        'NODE_ENV',
        'PORT',
        'MONGODB_URI',
        'JWT_SECRET',
        'JWT_EXPIRES_IN',
        'CORS_ORIGIN',
        'LOG_LEVEL'
    ];
    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    if (missingEnvVars.length > 0) {
        throw new AppError(500, `Missing required environment variables: ${missingEnvVars.join(', ')}`);
    }
    return {
        NODE_ENV: process.env.NODE_ENV,
        PORT: parseInt(process.env.PORT, 10),
        MONGODB_URI: process.env.MONGODB_URI,
        JWT_SECRET: process.env.JWT_SECRET,
        JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
        CORS_ORIGIN: process.env.CORS_ORIGIN,
        LOG_LEVEL: process.env.LOG_LEVEL
    };
};
const config = validateConfig();
export default config;
//# sourceMappingURL=config.js.map