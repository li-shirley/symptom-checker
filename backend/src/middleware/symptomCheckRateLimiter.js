import { symptomCheckRatelimit } from "../config/upstash.js";
import HttpError from "../utils/HttpError.js";

const symptomCheckRateLimiter = async (req, res, next) => {
    try {
        const userId = req.user?._id?.toString();

        // Use user ID if logged in, otherwise fallback to IP
        const key = userId ? `user:${userId}` : `ip:${req.ip}`;

        const { success } = await symptomCheckRatelimit.limit(key);

        if (!success) {
            return next(
                new HttpError(429, "Too many symptom check requests. Please wait a minute and try again.", "RATE_LIMITED"));
        }

        return next();
    } catch (e) {
        const err = new HttpError(500, "Rate limiter failed", "INTERNAL_ERROR");
        err.meta = { message: e?.message };
        return next(err);
    }
};

export default symptomCheckRateLimiter;
