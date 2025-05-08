import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import morgan from 'morgan';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import config from './config/config.js';
import connectDB from './config/database.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import orderRoutes from './routes/order.routes.js';
import wmsRoutes from './routes/wms.routes.js';
dotenv.config();
const app = express();
connectDB();
app.use(helmet());
app.use(compression());
app.use(cors({
    origin: config.CORS_ORIGIN,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(config.NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use((req, _res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wms', wmsRoutes);
app.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: config.NODE_ENV
    });
});
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/wms-pusher')
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));
app.use(notFoundHandler);
app.use(errorHandler);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
export default app;
//# sourceMappingURL=app.js.map