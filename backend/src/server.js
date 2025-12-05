import express from "express";
import dotenv from "dotenv";
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';

import { connectDB } from "./config/db.js";

import triageRoutes from "./routes/triageRoutes.js"
import userRoutes from "./routes/userRoutes.js"

import logger from "./middleware/logger.js"
import requireAuth from './middleware/requireAuth.js';
import errorHandler from './middleware/errorHandler.js';
import protectedRateLimiter from "./middleware/protectedRateLimiter.js";
import publicRateLimiter from "./middleware/publicRateLimiter.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// CORS
const allowedOrigins = [
    process.env.CLIENT_URL,
];
app.use(cors({
    origin: allowedOrigins,
    credentials: true,
}));

// Pre-route middleware: parse JSON, secure headers, cookies, and logging
app.use(express.json());
app.use(helmet());
app.use(cookieParser());
app.use(logger);

// Route handlers: triage (protected) and user (public)
app.use("/api/triage", requireAuth, protectedRateLimiter, triageRoutes);
app.use("/api/user", publicRateLimiter, userRoutes);

// Post-route middleware: global error handling
app.use(errorHandler);

const startServer = async () => {
    try {
        await connectDB(process.env.MONGO_URI); // Connect to MongoDB
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error('Failed to start server:', err.message);
        process.exit(1);
    }
};

startServer();