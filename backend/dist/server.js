import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from './routes/auth.js';
import orderRoutes from './routes/orders.js';
import wmsRoutes from './routes/wms.js';
dotenv.config();
const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5000;
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    console.log(`\x1b[42m ${req.method} ${req.url} request received.\x1b[0m`);
    next();
});
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
    console.log("Connected to MongoDB");
})
    .catch((err) => {
    console.error("MongoDB connection error:", err);
});
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/wms", wmsRoutes);
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
