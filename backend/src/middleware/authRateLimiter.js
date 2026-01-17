import { authRatelimit } from "../config/upstash.js";
import HttpError from "../utils/HttpError.js";

const authRateLimiter = async (req, res, next) => {
    try {
        const userId = req.user?._id?.toString();

        if (!userId) {
            return next(new HttpError(401, "Request is not authorized", "UNAUTHORIZED"));
        }

        const ip = req.ip;
        const key = `${userId}:${ip}`; // user ID and IP for authenticated routes

        const { success } = await authRatelimit.limit(key);

        if (!success) {
            return next(new HttpError(429, "Too many requests, please try again later.", "RATE_LIMITED"));
        }

        return next();
    } catch (e) {
        const err = new HttpError(500, "Rate limiter failed", "INTERNAL_ERROR");
        err.meta = { message: e?.message };
        return next(err);
    }
};

export default authRateLimiter;
