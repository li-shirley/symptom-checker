import { protectedRatelimit } from "../config/upstash.js";

const protectedRateLimiter = async (req, res, next) => {
    try {
        if (!req.user?._id) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const userId = req.user?._id?.toString();
        const ip = req.ip;

        // Combine userId and IP for extra security if token leaks
        const key = `${userId}:${ip}`;

        const { success } = await protectedRatelimit.limit(key);

        if (!success) {
            return res.status(429).json({
                error: "Too many requests, please try again later."
            });
        }

        next();
    } catch (error) {
        console.error("Rate limit error:", error);
        next(error);
    }
};

export default protectedRateLimiter;
