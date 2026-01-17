import jwt from "jsonwebtoken";
import User from "../models/User.js";
import HttpError from "../utils/HttpError.js";

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;

const requireAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return next(new HttpError(401, "Authorization token required", "UNAUTHORIZED"));
        }

        // Expect: "Bearer <token>"
        const [scheme, token] = authHeader.split(" ");

        if (!scheme || scheme.toLowerCase() !== "bearer" || !token) {
            return next(new HttpError(401, "Authorization header must be: Bearer <token>", "UNAUTHORIZED"));
        }

        if (!JWT_ACCESS_SECRET) {
            return next(new HttpError(500, "Server misconfiguration: JWT_ACCESS_SECRET is missing", "INTERNAL_ERROR"));
        }

        const payload = jwt.verify(token, JWT_ACCESS_SECRET);
        const userId = payload._id;

        if (!userId) {
            return next(new HttpError(401, "Invalid token payload", "UNAUTHORIZED"));
        }

        const user = await User.findById(userId).select("_id");
        if (!user) {
            return next(new HttpError(401, "User not found", "UNAUTHORIZED"));
        }

        req.user = user;
        return next();
    } catch (e) {
        const err = new HttpError(401, "Request is not authorized", "UNAUTHORIZED");
        // hint for server-side logs/debugging:
        err.meta = { jwtError: e?.name };
        return next(err);
    }
};

export default requireAuth;
