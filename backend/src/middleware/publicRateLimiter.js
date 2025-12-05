import { publicRatelimit } from "../config/upstash.js";

const publicRateLimiter = async (req, res, next) => {
    try {
        const key = req.ip; // IP-based for login/signup

        const { success } = await publicRatelimit.limit(key);

        if (!success) {
            return res.status(429).json({
                error: "Too many requests, please try again later."
            });
        }

        next();
    } catch (error) {
        console.error("Public rate limit error:", error);
        next(error);
    }
};

export default publicRateLimiter;
