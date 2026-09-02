import dotenv from "dotenv";
dotenv.config();  // loads .env from backend/ (cwd)

import express from "express";
import cors from "cors";
import path from "path";
import connectDB from "./config/db";
import authRoutes from "./routes/auth";
import dashboardRoutes from "./routes/dashboard";
import agreementRoutes from "./routes/agreements";
import vehicleRoutes from "./routes/vehicles";
import pdfRoutes from "./routes/pdf";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static files for uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/agreements", agreementRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/agreements", pdfRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Connect to MongoDB and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

export default app;
