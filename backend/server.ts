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

// Create Express app
const app: Application = express();

app.use(helmet());
app.use(compression()); // Compress responses
app.use(cors({
    origin: config.CORS_ORIGIN,
    credentials: true
})); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));
app.use(morgan(config.NODE_ENV === 'development' ? 'dev' : 'combined'));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`\x1b[42m ${req.method} ${req.url} request received.\x1b[0m`);
    next();
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: config.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Database connection
mongoose.connect(config.MONGODB_URI)
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((err: Error) => {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    });

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/wms", wmsRoutes);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ 
        status: 'ok',
        environment: config.NODE_ENV,
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(config.PORT, () => {
    console.log(`Server running on port ${config.PORT} in ${config.NODE_ENV} mode`);
}); 