import express, { Application, Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import config from './src/config/config.js';
import authRoutes from './src/routes/auth.routes.js';
import orderRoutes from './src/routes/order.routes.js';
import wmsRoutes from './src/routes/wms.routes.js';
import webhookRoutes from './src/routes/webhook.js';
import bodyParser from "body-parser";

// Create Express app
const app: Application = express();

app.use(helmet());
app.use(compression());
app.use(cors({
    origin: config.CORS_ORIGIN,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(config.NODE_ENV === 'development' ? 'dev' : 'combined'));

app.use(bodyParser.json({
    verify: (req: any, res: any, buf: any) => {
        console.log("Body parser verify function called!");
        console.log("Buffer length:", buf.length);
        req.rawBody = buf.toString();
    }
}));

app.use(bodyParser.urlencoded({ extended: true }));

app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`\x1b[42m ${req.method} ${req.url} request received.\x1b[0m`);
    next();
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: config.NODE_ENV === 'development' ? err.message : undefined
    });
});

mongoose.connect(config.MONGODB_URI)
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((err: Error) => {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    });


app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/wms", wmsRoutes);
app.use('/api/webhook', webhookRoutes);
app.use('/api/notifications', webhookRoutes);

app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
        status: 'ok',
        environment: config.NODE_ENV,
        timestamp: new Date().toISOString()
    });
});

app.listen(config.PORT, () => {
    console.log(`Server running on port ${config.PORT} in ${config.NODE_ENV} mode`);
}); 