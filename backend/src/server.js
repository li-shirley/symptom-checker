import "./config/env.js"; // must be first import
import express from "express";
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';

import { connectDB } from "./config/db.js";

import triageRoutes from "./routes/triageRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import infermedicaRoutes from "./routes/infermedicaRoutes.js";
import medlinePlusRoutes from "./routes/medlinePlusRoutes.js";

import logger from "./middleware/logger.js";
import errorHandler from './middleware/errorHandler.js';

import HttpError from "./utils/HttpError.js";

const app = express();
const PORT = process.env.PORT || 4000;
app.set("trust proxy", 1); // for deployment, to distinguish user IP from server host IP

// CORS
const allowedOrigins = [
    process.env.CLIENT_URL,
    "http://localhost:5173",    // Vite dev
].filter(Boolean);

app.use(cors({
    origin: (origin, cb) => {
        // allow server-to-server, curl, Postman (no Origin header)
        if (!origin) return cb(null, true);

        if (allowedOrigins.includes(origin)) return cb(null, true);

        return cb(new HttpError(403, `CORS blocked for origin: ${origin}`, "FORBIDDEN"));
    },
    credentials: true,
}));

// Pre-route middleware: parse JSON, secure headers, cookies, and logging
app.use(express.json({ limit: "250kb" }));
app.use(helmet());
app.use(cookieParser());
app.use(logger);

// Health check
app.get("/health", (req, res) => {
    return res.status(200).json({ ok: true });
});

// Route handlers:
// Note rateLimiter & requireAuth middleware applied in routes file due to having a mix of auth & guest routes.
app.use("/api/triage", triageRoutes);
app.use("/api/user", userRoutes);
app.use("/api/infermedica", infermedicaRoutes);
app.use("/api/medlineplus", medlinePlusRoutes);

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