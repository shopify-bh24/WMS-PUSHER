import express, { Express } from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import morgan from 'morgan';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import config from './config/config.js';
import connectDB from './config/database.js';

// Import routes
import authRoutes from './routes/auth.routes.js';
import orderRoutes from './routes/order.routes.js';
import wmsRoutes from './routes/wms.routes.js';

const app: Express = express();

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

app.use(notFoundHandler);
app.use(errorHandler);

export default app; 