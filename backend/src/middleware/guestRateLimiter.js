import { guestRatelimit } from "../config/upstash.js";
import HttpError from "../utils/HttpError.js";

const guestRateLimiter = async (req, res, next) => {
    try {
        const key = req.ip; // IP-based for guest routes

        const { success } = await guestRatelimit.limit(key);

        if (!success) return next(new HttpError(429, "Too many requests, please try again later.", "RATE_LIMITED"));

        return next();
    } catch (e) {
        const err = new HttpError(500, "Rate limit error", "INTERNAL_ERROR");
        err.meta = { original: e?.message };
        return next(err);
    }
};

export default guestRateLimiter;
