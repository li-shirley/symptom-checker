import { guestRatelimit } from "../config/upstash.js";

const guestRateLimiter = async (req, res, next) => {
    try {
        const key = req.ip; // IP-based for login/signup

        const { success } = await guestRatelimit.limit(key);

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

export default guestRateLimiter;
