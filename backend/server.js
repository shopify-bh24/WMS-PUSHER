import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
console.log(process.env.MONGODB_URI);

app.use((req, res, next) => {
  console.log(`\x1b[42m ${req.method} ${req.url} request received.\x1b[0m`);
  next();
});

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("Connected to MongoDB");
}).catch((err) => {
  console.error("MongoDB connection error:", err);
});

// Import routes
import authRoutes from "./routes/auth.js";
import orderRoutes from "./routes/orders.js";

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});