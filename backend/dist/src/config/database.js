import mongoose from 'mongoose';
import { AppError } from '../utils/error.util.js';
import config from './config.js';
const connectDB = async () => {
    try {
        await mongoose.connect(config.MONGODB_URI);
        console.log('MongoDB connected successfully');
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
            throw new AppError(500, 'Database connection error');
        });
        mongoose.connection.on('disconnected', () => {
            console.warn('MongoDB disconnected');
        });
        process.on('SIGINT', async () => {
            try {
                await mongoose.connection.close();
                console.log('MongoDB connection closed through app termination');
                process.exit(0);
            }
            catch (err) {
                console.error('Error during MongoDB disconnection:', err);
                process.exit(1);
            }
        });
    }
    catch (error) {
        console.error('MongoDB connection error:', error);
        throw new AppError(500, 'Failed to connect to database');
    }
};
export default connectDB;
//# sourceMappingURL=database.js.map